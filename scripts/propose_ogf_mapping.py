#!/usr/bin/env python3
"""
propose_ogf_mapping.py — Fase A: propone mappature codice planner → OGF node.

Parser strutturale:
- non esegue JavaScript;
- non usa regex generiche sui nomi;
- riconosce oggetti stazione e array `stations`;
- decodifica stringhe JS (\\uXXXX, \\xXX, escape standard);
- conserva `ogfId`, `nodeId`, `osmId` se presenti;
- separa stazioni, servizi e metadati;
- distingue le mappature presenti e quelle in attesa di un export OGF aggiornato.

Uso:
  python scripts/propose_ogf_mapping.py --root . --out output/mapping-review.csv
"""

import argparse
import csv
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

STATION_ID_KEYS = ("ogfId", "nodeId", "osmId")
STATION_NAME_KEYS = ("name", "n", "title", "label")
STATION_CODE_KEYS = ("code", "id", "key", "station", "stationCode")

SERVICE_HINTS = (
    "service", "svc", "trip", "timetable", "headway", "express",
    "rapid", "local", "all-stop", "allstop", "line", "route", "direction"
)

STATION_HINTS = ("km", "lat", "lon", "latlon", "coord", "transfer", "interchange")


def normalize_name(value):
    text = unicodedata.normalize("NFKC", str(value or ""))
    text = text.casefold().strip()
    return re.sub(r"\s+", " ", text)


def decode_js_string(raw):
    """Decodifica una stringa JavaScript senza valutare codice."""
    if raw is None:
        return ""
    raw = raw.group(1) if hasattr(raw, "group") else raw
    if raw.startswith(("'", '"', "`")):
        raw = raw[1:-1]

    def replace_unicode(match):
        return chr(int(match.group(1), 16))

    def replace_hex(match):
        return chr(int(match.group(1), 16))

    raw = re.sub(r"\\u\{([0-9a-fA-F]{1,6})\}", replace_unicode, raw)
    raw = re.sub(r"\\u([0-9a-fA-F]{4})", replace_unicode, raw)
    raw = re.sub(r"\\x([0-9a-fA-F]{2})", replace_hex, raw)
    raw = raw.replace(r"\\", "\\")
    raw = raw.replace("\\n", "\n")
    raw = raw.replace("\\r", "\r")
    raw = raw.replace("\\t", "\t")
    raw = raw.replace("\\'", "'")
    raw = raw.replace('\\"', '"')
    raw = raw.replace("\\`", "`")
    return raw.strip()


def find_matching_delimiter(text, open_index):
    """Trova la chiusura corrispondente per {…} oppure […], ignorando stringhe e commenti."""
    opening = text[open_index]
    closing = {'{': '}', '[': ']'}[opening]
    depth = 0
    i = open_index
    quote = None
    escaped = False
    in_line_comment = False
    in_block_comment = False

    while i < len(text):
        char = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ""

        if in_line_comment:
            if char == "\n":
                in_line_comment = False
            i += 1
            continue

        if in_block_comment:
            if char == "*" and nxt == "/":
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue

        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            i += 1
            continue

        if char in ("'", '"', "`"):
            quote = char
            i += 1
            continue

        if char == "/" and nxt == "/":
            in_line_comment = True
            i += 2
            continue

        if char == "/" and nxt == "*":
            in_block_comment = True
            i += 2
            continue

        if char == opening:
            depth += 1
        elif char == closing:
            depth -= 1
            if depth == 0:
                return i

        i += 1

    raise ValueError(f"Delimitatore {opening}…{closing} non bilanciato")


def parse_js_value(text, start):
    """Legge un valore JS semplice: stringa, numero, booleano, null o undefined."""
    text = text[start:].lstrip()
    offset = len(text) - len(text.lstrip())
    start += offset

    if text.startswith(("'", '"', "`")):
        quote = text[0]
        i = 1
        escaped = False
        while i < len(text):
            char = text[i]
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                return decode_js_string(text[: i + 1]), start + i + 1
            i += 1
        raise ValueError("Stringa JavaScript non chiusa")

    match = re.match(r"-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?", text)
    if match:
        raw = match.group(0)
        try:
            value = int(raw)
        except ValueError:
            value = float(raw)
        return value, start + len(raw)

    for word in ("true", "false", "null", "undefined"):
        if text.startswith(word):
            return {"true": True, "false": False, "null": None, "undefined": None}[word], start + len(word)

    raise ValueError("Valore JavaScript non supportato dal parser strutturale")


def parse_object_entries(body):
    """Estrae coppie chiave/valore da un oggetto JS, senza valutarlo."""
    entries = {}
    i = 0
    length = len(body)

    while i < length:
        while i < length and body[i] in " \t\r\n,;":
            i += 1
        if i >= length:
            break

        key_match = re.match(r"(?:'([^']*)'|\"([^\"]*)\"|([A-Za-z_$][\w$]*))\s*:", body[i:])
        if not key_match:
            i += 1
            continue

        key = key_match.group(1) or key_match.group(2) or key_match.group(3)
        value_start = i + key_match.end()
        value, next_index = parse_js_value(body, value_start)
        entries[key] = value
        i = next_index

        while i < length and body[i] in " \t\r\n":
            i += 1
        if i < length and body[i] == ",":
            i += 1

    return entries


def looks_like_station(entries):
    has_name = any(key in entries for key in STATION_NAME_KEYS)
    has_code = any(key in entries for key in STATION_CODE_KEYS)
    has_context = any(key in entries for key in STATION_HINTS)
    return has_name and (has_code or has_context)


def looks_like_service(entries):
    joined = " ".join(str(entries.get(key, "")) for key in entries).casefold()
    return any(hint in joined for hint in SERVICE_HINTS)


def extract_station_records(path, root):
    """Estrae record stazione da un file *-data.js, con provenienza e diagnostica."""
    source = path.read_text(encoding="utf-8", errors="replace")
    records = []
    diagnostics = []
    relative_path = str(path.relative_to(root))

    station_array_pattern = re.compile(
        r"(?:const|let|var)?\s*([A-Za-z_$][\w$]*)\s*=\s*\[", re.MULTILINE
    )

    for match in station_array_pattern.finditer(source):
        array_name = match.group(1)
        open_index = match.end() - 1
        try:
            close_index = find_matching_delimiter(source, open_index)
        except ValueError as exc:
            diagnostics.append({
                "file": relative_path, "location": array_name,
                "severity": "error", "message": str(exc)
            })
            continue

        body = source[open_index + 1: close_index]
        cursor = 0

        while cursor < len(body):
            while cursor < len(body) and body[cursor] in " \t\r\n,":
                cursor += 1
            if cursor >= len(body) or body[cursor] != "{":
                cursor += 1
                continue

            try:
                close = find_matching_delimiter(body, cursor)
                entries = parse_object_entries(body[cursor + 1: close])
            except (ValueError, IndexError) as exc:
                diagnostics.append({
                    "file": relative_path, "location": f"{array_name}[{cursor}]",
                    "severity": "warning", "message": str(exc)
                })
                cursor += 1
                continue

            if looks_like_station(entries) and not looks_like_service(entries):
                records.append({
                    "file": relative_path,
                    "container": array_name,
                    "entries": entries,
                })

            cursor = close + 1

    return records, diagnostics


def extract_station_id(entries):
    for key in STATION_ID_KEYS:
        value = entries.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def extract_station_code(entries):
    for key in STATION_CODE_KEYS:
        value = entries.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def extract_station_name(entries):
    for key in STATION_NAME_KEYS:
        value = entries.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def build_review_rows(records, nodes):
    by_id = {str(node["id"]): node for node in nodes}
    by_name = defaultdict(dict)

    for node in nodes:
        tags = node.get("tags", {}) or {}
        aliases = [node.get("name", "")]
        for key, value in tags.items():
            if key.startswith("name:") or key in ("alt_name", "official_name", "short_name"):
                aliases.extend(str(value).split(";"))
        for alias in aliases:
            key = normalize_name(alias)
            if key:
                by_name[key][str(node["id"])] = node

    rows = []
    for record in records:
        entries = record["entries"]
        code = extract_station_code(entries)
        name = extract_station_name(entries)
        existing_id = extract_station_id(entries)

        if existing_id:
            if existing_id in by_id:
                candidates = [by_id[existing_id]]
                status = "explicit_id"
                sync_state = "in_export"
            else:
                candidates = []
                status = "explicit_id_pending_export_sync"
                sync_state = "pending_export_sync"
        else:
            candidates = list(by_name.get(normalize_name(name), {}).values())
            if len(candidates) == 1:
                status = "unique_name_review"
            elif candidates:
                status = "ambiguous"
            else:
                status = "unmatched"
            sync_state = "needs_mapping"

        for candidate in candidates or [None]:
            rows.append({
                "file": record["file"],
                "container": record["container"],
                "code": code,
                "planner_name": name,
                "status": status,
                "candidate_count": len(candidates),
                "existing_id": existing_id,
                "candidate_ogf_id": candidate["id"] if candidate else "",
                "ogf_name": candidate.get("name", "") if candidate else "",
                "lat": candidate.get("lat", "") if candidate else "",
                "lon": candidate.get("lon", "") if candidate else "",
                "relation_ids": ";".join(sorted({
                    str(item["relId"]) for item in candidate.get("lines", [])
                })) if candidate else "",
                "approved_ogf_id": "",
                "sync_state": sync_state,
            })

    return rows


def write_csv(rows, output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "file", "container", "code", "planner_name", "status", "candidate_count",
        "existing_id", "candidate_ogf_id", "ogf_name", "lat", "lon",
        "relation_ids", "approved_ogf_id", "sync_state",
    ]

    with output_path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path("."))
    parser.add_argument("--out", type=Path, default=Path("output/mapping-review.csv"))
    parser.add_argument(
        "--diagnostics",
        type=Path,
        default=Path("output/mapping-review.diagnostics.json"),
    )
    args = parser.parse_args()

    root = args.root.resolve()
    payload = json.loads((root / "data/stations.json").read_text(encoding="utf-8"))
    nodes = payload.get("stations", [])

    all_records = []
    all_diagnostics = []

    for path in sorted(root.rglob("*-data.js")):
        relative = path.relative_to(root)
        if any(part in (".git", "node_modules", "output") for part in relative.parts):
            continue
        records, diagnostics = extract_station_records(path, root)
        all_records.extend(records)
        all_diagnostics.extend(diagnostics)

    rows = build_review_rows(all_records, nodes)
    write_csv(rows, args.out)

    counts = Counter(row["status"] for row in rows)
    diagnostics_payload = {
        "files_scanned": len({record["file"] for record in all_records}),
        "records_extracted": len(all_records),
        "records_by_status": dict(counts),
        "diagnostics": all_diagnostics,
    }

    args.diagnostics.parent.mkdir(parents=True, exist_ok=True)
    args.diagnostics.write_text(
        json.dumps(diagnostics_payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(json.dumps(diagnostics_payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
propose_ogf_mapping.py — Fase A: propone mappature codice planner → OGF node.
Legge i file *-data.js con regex (nessuna esecuzione JS), confronta con
data/stations.json e produce un CSV di revisione. Non modifica i sorgenti.

Usage:
  python scripts/propose_ogf_mapping.py --root . --out output/mapping-review.csv
"""

import argparse
import csv
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path


def norm(value):
    text = unicodedata.normalize('NFKC', str(value or '')).casefold().strip()
    return re.sub(r'\s+', ' ', text)


def extract_stations_from_js(path):
    """Estrae coppie (code, name, ogfId) da un file *-data.js via regex."""
    text = path.read_text(encoding='utf-8', errors='replace')
    found = {}

    # Formato A: oggetto di oggetti — CODE: { n: 'Name', ... }
    pattern_a = re.compile(
        r"([A-Za-z0-9_]+)\s*:\s*\{[^{}]*?"
        r"(?:n|name)\s*:\s*['\"]([^'\"]+)['\"]"
        r"[^{}]*?ogfId\s*:\s*(\d+)",
        re.DOTALL
    )
    for m in pattern_a.finditer(text):
        code, name, ogf = m.group(1), m.group(2), m.group(3)
        found[(code, norm(name))] = {'code': code, 'name': name, 'ogfId': ogf}

    # Formato A senza ogfId (per report di copertura)
    pattern_a_no_id = re.compile(
        r"([A-Za-z0-9_]+)\s*:\s*\{[^{}]*?"
        r"(?:n|name)\s*:\s*['\"]([^'\"]+)['\"]",
        re.DOTALL
    )
    for m in pattern_a_no_id.finditer(text):
        code, name = m.group(1), m.group(2)
        key = (code, norm(name))
        if key not in found:
            found[key] = {'code': code, 'name': name, 'ogfId': None}

    # Formato B: array di oggetti — { code: 'CODE', name: 'Name', ... }
    pattern_b = re.compile(
        r"\{\s*code\s*:\s*['\"]([A-Za-z0-9_]+)['\"]\s*,\s*"
        r"(?:name|n)\s*:\s*['\"]([^'\"]+)['\"]"
        r"(?:[^{}]*?ogfId\s*:\s*(\d+))?",
        re.DOTALL
    )
    for m in pattern_b.finditer(text):
        code, name, ogf = m.group(1), m.group(2), m.group(3)
        key = (code, norm(name))
        if key not in found:
            found[key] = {'code': code, 'name': name, 'ogfId': ogf}

    return list(found.values())


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--root', type=Path, default=Path('.'))
    ap.add_argument('--out', type=Path, default=Path('output/mapping-review.csv'))
    args = ap.parse_args()

    root = args.root.resolve()
    payload = json.loads((root / 'data/stations.json').read_text(encoding='utf-8'))
    nodes = payload['stations']

    by_id = {str(n['id']): n for n in nodes}
    by_name = defaultdict(dict)
    for n in nodes:
        tags = n.get('tags', {})
        aliases = [n.get('name', '')]
        for key, value in tags.items():
            if key.startswith('name:') or key in ('alt_name', 'official_name', 'short_name'):
                aliases.extend(str(value).split(';'))
        for alias in aliases:
            if norm(alias):
                by_name[norm(alias)][str(n['id'])] = n

    rows = []
    files = sorted(p for p in root.rglob('*-data.js')
                   if not any(x in p.relative_to(root).parts
                              for x in ('.git', 'node_modules', 'output')))
    for path in files:
        rel = str(path.relative_to(root))
        stations = extract_stations_from_js(path)
        for st in stations:
            explicit = st.get('ogfId')
            if explicit:
                candidates = [by_id[str(explicit)]] if str(explicit) in by_id else []
                status = 'explicit_id' if candidates else 'explicit_id_not_in_export'
            else:
                candidates = list(by_name.get(norm(st['name']), {}).values())
                if len(candidates) == 1:
                    status = 'unique_name_review'
                elif candidates:
                    status = 'ambiguous'
                else:
                    status = 'unmatched'
            for n in candidates or [None]:
                rows.append({
                    'file': rel, 'code': st['code'], 'planner_name': st['name'],
                    'status': status, 'candidate_count': len(candidates),
                    'existing_id': explicit or '',
                    'candidate_ogf_id': n['id'] if n else '',
                    'ogf_name': n.get('name', '') if n else '',
                    'lat': n.get('lat', '') if n else '',
                    'lon': n.get('lon', '') if n else '',
                    'relation_ids': ';'.join(sorted({str(x['relId']) for x in n.get('lines', [])})) if n else '',
                    'approved_ogf_id': '',
                })

    fields = ['file', 'code', 'planner_name', 'status', 'candidate_count',
              'existing_id', 'candidate_ogf_id', 'ogf_name', 'lat', 'lon',
              'relation_ids', 'approved_ogf_id']
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open('w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    from collections import Counter
    counts = Counter(r['status'] for r in rows)
    print(json.dumps({'files_scanned': len(files),
                      'records_by_status': dict(counts),
                      'report': str(args.out)}, indent=2))


if __name__ == '__main__':
    main()

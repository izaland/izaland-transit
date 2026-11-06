#!/usr/bin/env python3
"""
build_interchanges.py — Fase B: genera i cluster di interscambio dal mapping review.

Input:
  output/mapping-review.csv

Output:
  data/interchange-clusters.json

Regole:
- Usa solo righe con status=explicit_id e sync_state=in_export.
- Raggruppa i codici planner per ogfId.
- Genera un cluster solo se contiene almeno due codici.
- Applica override manuali da data/interchange-overrides.json, se presente.
- Non modifica i file *-data.js.

Uso:
  python scripts/build_interchanges.py \
    --review output/mapping-review.csv \
    --overrides data/interchange-overrides.json \
    --out data/interchange-clusters.json
"""

import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

DEFAULT_TRANSFER_MIN = 5


def load_review(path):
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def load_overrides(path):
    if not path or not path.exists():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload.get("overrides", payload)


def infer_network(code):
    """Classificazione conservativa del codice planner."""
    if code.startswith("M"):
        return "metro"
    if code.startswith(("K", "R", "E", "N", "SA", "DP", "DN", "DI")):
        return "izx"
    if code.startswith(("AX", "CK", "CL")):
        return "airport_or_cityliner"
    return "suburban"


def build_clusters(rows):
    grouped = defaultdict(set)

    for row in rows:
        if row.get("status") != "explicit_id":
            continue
        if row.get("sync_state") != "in_export":
            continue

        ogf_id = str(row.get("existing_id", "")).strip()
        code = str(row.get("code", "")).strip()

        if not ogf_id or not code:
            continue

        grouped[ogf_id].add(code)

    clusters = {}

    for ogf_id, codes in grouped.items():
        unique_codes = sorted(codes)

        # Un cluster richiede almeno due codici planner:
        # una stazione presente su una sola rete non è un interscambio.
        if len(unique_codes) < 2:
            continue

        networks = sorted({infer_network(code) for code in unique_codes})

        clusters[ogf_id] = {
            "ogfId": int(ogf_id) if ogf_id.isdigit() else ogf_id,
            "codes": unique_codes,
            "networks": networks,
            "transferMin": DEFAULT_TRANSFER_MIN,
            "thruService": False,
            "source": "automatic",
        }

    return clusters


def apply_overrides(clusters, overrides):
    """Applica override per cluster oppure per singola coppia di codici."""
    cluster_overrides = overrides.get("clusters", {})
    pair_overrides = overrides.get("pairs", {})
    thru_pairs = overrides.get("thruPairs", [])

    for ogf_id, changes in cluster_overrides.items():
        if ogf_id in clusters:
            clusters[ogf_id].update(changes)

    for pair in pair_overrides:
        code_a = pair.get("a")
        code_b = pair.get("b")
        transfer_min = pair.get("transferMin")

        if not code_a or not code_b or transfer_min is None:
            continue

        for cluster in clusters.values():
            codes = set(cluster["codes"])
            if code_a in codes and code_b in codes:
                cluster.setdefault("pairOverrides", [])
                cluster["pairOverrides"].append({
                    "a": code_a,
                    "b": code_b,
                    "transferMin": transfer_min,
                })

    for pair in thru_pairs:
        code_a = pair.get("a")
        code_b = pair.get("b")

        if not code_a or not code_b:
            continue

        for cluster in clusters.values():
            codes = set(cluster["codes"])
            if code_a in codes and code_b in codes:
                cluster["thruService"] = True
                cluster.setdefault("thruPairs", [])
                cluster["thruPairs"].append({
                    "a": code_a,
                    "b": code_b,
                })

    return clusters


def write_clusters(clusters, output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": 1,
        "defaultTransferMin": DEFAULT_TRANSFER_MIN,
        "clusters": clusters,
    }
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--review",
        type=Path,
        default=Path("output/mapping-review.csv"),
    )
    parser.add_argument(
        "--overrides",
        type=Path,
        default=Path("data/interchange-overrides.json"),
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("data/interchange-clusters.json"),
    )
    args = parser.parse_args()

    rows = load_review(args.review)
    overrides = load_overrides(args.overrides)

    clusters = build_clusters(rows)
    clusters = apply_overrides(clusters, overrides)
    write_clusters(clusters, args.out)

    summary = {
        "review_rows": len(rows),
        "clusters_generated": len(clusters),
        "multi_network_clusters": sum(
            1 for cluster in clusters.values() if len(cluster["networks"]) > 1
        ),
        "output": str(args.out),
    }

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

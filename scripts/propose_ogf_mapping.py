#!/usr/bin/env python3
"""Propose planner-code -> OGF node mappings. Never edits source data.
Usage: python scripts/propose_ogf_mapping.py --root . --out mapping-review.csv
Requires Node.js to evaluate trusted local *-data.js files in isolated contexts.
"""
import argparse
import csv
import json
import re
import subprocess
import unicodedata
from collections import defaultdict
from pathlib import Path

JS = r"""
const fs = require('fs'), vm = require('vm');
const file = process.argv[1];
const source = fs.readFileSync(file, 'utf8');
const names = [...source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)].map(m => m[1]);
const sandbox = {console: {log(){}, warn(){}, error(){}}, module: {exports: {}}};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
let error = '';
try { vm.runInContext(source, sandbox, {timeout: 1500}); }
catch(e) { error = String(e.message); }
const out = [];
for (const name of [...new Set(names)]) {
  let value;
  try {value = vm.runInContext(name, sandbox, {timeout: 100});} catch(e) {continue;}
  if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
  for (const [code, st] of Object.entries(value)) {
    if (!st || typeof st !== 'object' || Array.isArray(st)) continue;
    const label = st.n || st.name;
    if (typeof label !== 'string' || !('km' in st || 'k' in st || 'kanji' in st)) continue;
    out.push({code, name: label, variable: name,
      ogfId: st.ogfId ?? st.nodeId ?? st.osmId ?? null});
  }
}
process.stdout.write(JSON.stringify({stations: out, error}));
"""

def norm(value):
    text = unicodedata.normalize('NFKC', str(value or '')).casefold().strip()
    return re.sub(r'\s+', ' ', text)

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--root', type=Path, default=Path('.'))
    ap.add_argument('--out', type=Path, default=Path('mapping-review.csv'))
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
    rows, diagnostics = [], []
    files = sorted(p for p in root.rglob('*-data.js')
                   if not any(x in p.relative_to(root).parts for x in ('.git', 'node_modules', 'output')))
    for path in files:
        rel = str(path.relative_to(root))
        try:
            proc = subprocess.run(['node', '-e', JS, str(path)], capture_output=True,
                                  text=True, timeout=10, check=True)
            extracted = json.loads(proc.stdout)
        except FileNotFoundError:
            raise SystemExit('Node.js is required: install it and retry.')
        except (subprocess.SubprocessError, json.JSONDecodeError) as exc:
            diagnostics.append({'file': rel, 'error': str(exc), 'stations_extracted': 0})
            continue
        if extracted['error']:
            diagnostics.append({'file': rel, 'error': extracted['error'],
                                'stations_extracted': len(extracted['stations'])})
        if not extracted['stations'] and not extracted['error']:
            diagnostics.append({'file': rel, 'error': 'No station records recognized; inspect manually.',
                                'stations_extracted': 0})
        seen = set()
        for st in extracted['stations']:
            key = (st['variable'], st['code'])
            if key in seen:
                continue
            seen.add(key)
            explicit = st.get('ogfId')
            if explicit is not None:
                candidates = [by_id[str(explicit)]] if str(explicit) in by_id else []
                status = 'explicit_id' if candidates else 'explicit_id_not_in_export'
            else:
                candidates = list(by_name.get(norm(st['name']), {}).values())
                status = 'unique_name_review' if len(candidates) == 1 else ('ambiguous' if candidates else 'unmatched')
            for n in candidates or [None]:
                rows.append({'file': rel, 'variable': st['variable'], 'code': st['code'],
                    'planner_name': st['name'], 'status': status,
                    'candidate_count': len(candidates), 'existing_id': explicit or '',
                    'candidate_ogf_id': n['id'] if n else '',
                    'ogf_name': n.get('name', '') if n else '',
                    'lat': n.get('lat', '') if n else '', 'lon': n.get('lon', '') if n else '',
                    'relation_ids': ';'.join(sorted({str(x['relId']) for x in n.get('lines', [])})) if n else '',
                    'approved_ogf_id': ''})
    fields = ['file','variable','code','planner_name','status','candidate_count','existing_id',
              'candidate_ogf_id','ogf_name','lat','lon','relation_ids','approved_ogf_id']
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open('w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    diag_path = args.out.with_suffix('.diagnostics.json')
    diag_path.write_text(json.dumps(diagnostics, ensure_ascii=False, indent=2), encoding='utf-8')
    counts = defaultdict(int)
    for row in {(r['file'], r['variable'], r['code'], r['status']) for r in rows}:
        counts[row[3]] += 1
    print(json.dumps({'files_scanned': len(files), 'station_records_by_status': dict(counts),
                      'files_with_diagnostics': len(diagnostics), 'report': str(args.out)}, indent=2))

if __name__ == '__main__':
    main()

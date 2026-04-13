#!/usr/bin/env python3
"""
build_json.py
Legge tutti i file XML in data/xml/ e produce:
  - data/stations.json
  - data/lines.json

Usage: python scripts/build_json.py

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERCHÉ LE LINEE SPARISCONO SE USI FILE XML SEPARATI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La geometria di una linea si ricava dai <way> che compongono la
relazione. Ogni <way> è formato da <nd ref="..."> che puntano a
<node> con lat/lon.

Se esporti stazioni e linee con query separate:
  - File A (solo nodi stazione) → contiene nodi con lat/lon,
    ma NESSUN way → la geometria delle linee è vuota.
  - File B (solo relazioni)     → contiene le relazioni con i
    <member ref="way/..."> ma quei way NON sono in questo file.

Lo script può fare il merge di più file XML, MA i way e i nodi
di supporto devono essere presenti in almeno uno dei file.

SOLUZIONE: usa sempre la sintassi (._;>>;) nella query Overpass,
che forza l'inclusione di tutti i membri (way + nodi) delle
relazioni nello stesso file di output:

  [out:xml][timeout:120];
  (
    relation(187662);
    relation(272134);
    /* aggiungi altri IDs qui */
  );
  (._;>>;);   ← questa riga è fondamentale
  out body;

Vedi README.md per la procedura completa.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import xml.etree.ElementTree as ET
import json
import os
import sys
import glob

DATA_DIR      = os.path.join(os.path.dirname(__file__), '..', 'data')
XML_DIR       = os.path.join(DATA_DIR, 'xml')
STATIONS_JSON = os.path.join(DATA_DIR, 'stations.json')
LINES_JSON    = os.path.join(DATA_DIR, 'lines.json')

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_tags(element):
    return {t.get('k'): t.get('v') for t in element.findall('tag')}

def railway_type(tags):
    rt = tags.get('railway', '')
    if rt in ('station', 'stop', 'halt'):
        return rt
    return rt or 'station'

# ---------------------------------------------------------------------------
# Merge tutti gli XML in strutture comuni
# ---------------------------------------------------------------------------

def load_all_xml():
    xml_files = sorted(glob.glob(os.path.join(XML_DIR, '*.xml')))
    if not xml_files:
        print(f"ERROR: nessun file .xml trovato in {XML_DIR}", file=sys.stderr)
        print("Crea la cartella data/xml/ e mettici i file .xml di Overpass.", file=sys.stderr)
        sys.exit(1)

    print(f"File XML trovati ({len(xml_files)}):")
    for f in xml_files:
        print(f"  - {os.path.basename(f)}")

    all_nodes     = {}  # id -> element
    all_ways      = {}  # id -> element
    all_relations = {}  # id -> element

    for xml_path in xml_files:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        n_before = len(all_nodes)
        w_before = len(all_ways)
        r_before = len(all_relations)

        for nd in root.findall('node'):
            nid = nd.get('id')
            # preferisci il nodo con lat/lon se arriva da un secondo file
            if nid not in all_nodes or (nd.get('lat') and not all_nodes[nid].get('lat')):
                all_nodes[nid] = nd

        for way in root.findall('way'):
            wid = way.get('id')
            if wid not in all_ways:
                all_ways[wid] = way

        for rel in root.findall('relation'):
            rid = rel.get('id')
            if rid not in all_relations:
                all_relations[rid] = rel

        print(f"    +{len(all_nodes)-n_before} nodi, "
              f"+{len(all_ways)-w_before} way, "
              f"+{len(all_relations)-r_before} relazioni "
              f"← {os.path.basename(xml_path)}")

    print(f"Totale merge: {len(all_nodes)} nodi, "
          f"{len(all_ways)} way, "
          f"{len(all_relations)} relazioni")

    # ── Diagnostica: avvisa se ci sono relazioni senza way nel dataset ──
    all_way_ids = set(all_ways.keys())
    rels_no_geom = []
    for rid, rel in all_relations.items():
        tags = parse_tags(rel)
        if tags.get('type') not in ('route', 'public_transport') and not tags.get('route'):
            continue
        has_way = any(
            m.get('type') == 'way' and m.get('ref') in all_way_ids
            for m in rel.findall('member')
        )
        if not has_way:
            member_ways = [m.get('ref') for m in rel.findall('member') if m.get('type') == 'way']
            if member_ways:  # la relazione dichiara way ma non li abbiamo
                rels_no_geom.append((rid, tags.get('name', rid)))

    if rels_no_geom:
        print()
        print("⚠️  ATTENZIONE: le seguenti relazioni dichiarano <way> member")
        print("   ma i way NON sono presenti nei file XML caricati.")
        print("   La geometria di queste linee sarà vuota in lines.json.")
        print("   → Riesporta i dati usando (._;>>;) nella query Overpass.")
        for rid, name in rels_no_geom[:20]:  # mostra max 20
            print(f"   - relation/{rid}  ({name})")
        if len(rels_no_geom) > 20:
            print(f"   ... e altre {len(rels_no_geom)-20}")
        print()

    return all_nodes, all_ways, all_relations

# ---------------------------------------------------------------------------
# Build stations.json
# ---------------------------------------------------------------------------

def build_stations_json(all_nodes, all_relations):
    nodes = {}
    for nid, nd in all_nodes.items():
        lat = nd.get('lat')
        lon = nd.get('lon')
        if lat is None or lon is None:
            continue
        nodes[nid] = {
            'id':   nid,
            'lat':  float(lat),
            'lon':  float(lon),
            'tags': parse_tags(nd),
        }

    lines = {}
    for rid, rel in all_relations.items():
        tags     = parse_tags(rel)
        rel_type = tags.get('type', '')
        route    = tags.get('route', '')
        if rel_type not in ('route', 'public_transport') and not route and 'railway' not in tags:
            continue

        colour   = tags.get('colour') or tags.get('color') or '#888888'
        operator = tags.get('operator', '')
        network  = tags.get('network', '')
        name     = tags.get('name', f'Line {rid}')
        short    = tags.get('ref') or tags.get('short_name') or rid
        rtype    = route or tags.get('railway') or 'train'
        if 'disabled' in name.lower():
            rtype = 'disabled'

        lines[rid] = {
            'id':       rid,
            'name':     name,
            'short':    short,
            'colour':   colour,
            'operator': operator,
            'network':  network,
            'type':     rtype,
        }

        for i, member in enumerate(rel.findall('member')):
            if member.get('type') == 'node':
                role = member.get('role', '')
                if role in ('station', 'stop', 'halt', ''):
                    nid = member.get('ref')
                    if nid in nodes:
                        if '_lines' not in nodes[nid]:
                            nodes[nid]['_lines'] = []
                        existing = {(e['relId'], e['seq']) for e in nodes[nid]['_lines']}
                        if (rid, i) not in existing:
                            nodes[nid]['_lines'].append({'relId': rid, 'seq': i})

    station_list = []
    for nd in nodes.values():
        if '_lines' not in nd:
            continue
        tags  = nd['tags']
        entry = {
            'id':    nd['id'],
            'name':  tags.get('name', ''),
            'lat':   nd['lat'],
            'lon':   nd['lon'],
            'type':  railway_type(tags),
            'tags':  {k: v for k, v in tags.items() if k != 'name'},
            'lines': sorted(nd['_lines'], key=lambda x: x['relId']),
        }
        station_list.append(entry)

    output = {'lines': lines, 'stations': station_list}
    with open(STATIONS_JSON, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"✅ Scritto {STATIONS_JSON}  ({len(station_list)} stazioni, {len(lines)} linee)")

# ---------------------------------------------------------------------------
# Build lines.json  (geometrie way)
# ---------------------------------------------------------------------------

def build_lines_json(all_nodes, all_ways, all_relations):
    node_coords = {}
    for nid, nd in all_nodes.items():
        lat = nd.get('lat')
        lon = nd.get('lon')
        if lat and lon:
            node_coords[nid] = (round(float(lat), 5), round(float(lon), 5))

    way_coords = {}
    for wid, way in all_ways.items():
        pts = []
        for nd_ref in way.findall('nd'):
            ref = nd_ref.get('ref')
            if ref in node_coords:
                pts.append(list(node_coords[ref]))
        if len(pts) >= 2:
            way_coords[wid] = pts

    line_geom = {}
    skipped   = 0
    for rid, rel in all_relations.items():
        tags = parse_tags(rel)
        if tags.get('type') not in ('route', 'public_transport') and not tags.get('route'):
            continue
        segments = []
        for member in rel.findall('member'):
            if member.get('type') == 'way':
                wid = member.get('ref')
                if wid in way_coords:
                    segments.append(way_coords[wid])
        if segments:
            line_geom[rid] = segments
        else:
            skipped += 1

    output = {'lines': line_geom}
    with open(LINES_JSON, 'w', encoding='utf-8') as f:
        json.dump(output, f, separators=(',', ':'))
    print(f"✅ Scritto {LINES_JSON}  ({len(line_geom)} relazioni con geometria)",
          end='')
    if skipped:
        print(f"  ⚠️  {skipped} relazioni saltate (nessun way trovato)")
    else:
        print()

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    if not os.path.isdir(XML_DIR):
        print(f"ERROR: cartella {XML_DIR} non trovata.", file=sys.stderr)
        print("Crea la cartella data/xml/ e mettici i file .xml di Overpass.", file=sys.stderr)
        sys.exit(1)

    all_nodes, all_ways, all_relations = load_all_xml()
    build_stations_json(all_nodes, all_relations)
    build_lines_json(all_nodes, all_ways, all_relations)
    print("Done.")

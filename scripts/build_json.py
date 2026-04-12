#!/usr/bin/env python3
"""
build_json.py
Legge tutti i file XML in data/xml/, li fonde, e produce:
  - data/stations.json
  - data/lines.json

Usage: python scripts/build_json.py
"""

import xml.etree.ElementTree as ET
import json
import os
import sys
import glob

DATA_DIR  = os.path.join(os.path.dirname(__file__), '..', 'data')
XML_DIR   = os.path.join(DATA_DIR, 'xml')
STATIONS_JSON = os.path.join(DATA_DIR, 'stations.json')
LINES_JSON    = os.path.join(DATA_DIR, 'lines.json')

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_tags(element):
    return {t.get('k'): t.get('v') for t in element.findall('tag')}

def railway_type(tags):
    rt = tags.get('railway', '')
    if rt in ('station', 'stop', 'halt'): return rt
    return rt or 'station'

# ---------------------------------------------------------------------------
# Merge tutti gli XML in strutture comuni
# ---------------------------------------------------------------------------

def load_all_xml():
    xml_files = sorted(glob.glob(os.path.join(XML_DIR, '*.xml')))
    if not xml_files:
        print(f"ERROR: nessun file .xml trovato in {XML_DIR}", file=sys.stderr)
        sys.exit(1)

    print(f"File XML trovati ({len(xml_files)}):")
    for f in xml_files:
        print(f"  - {os.path.basename(f)}")

    all_nodes     = {}   # id -> element data
    all_ways      = {}   # id -> list of node refs con lat/lon
    all_relations = {}   # id -> element

    for xml_path in xml_files:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        for nd in root.findall('node'):
            nid = nd.get('id')
            if nid not in all_nodes:
                all_nodes[nid] = nd

        for way in root.findall('way'):
            wid = way.get('id')
            if wid not in all_ways:
                all_ways[wid] = way

        for rel in root.findall('relation'):
            rid = rel.get('id')
            if rid not in all_relations:
                all_relations[rid] = rel
            # se esiste già, non sovrascrivere (primo file vince)

    print(f"Totale: {len(all_nodes)} nodi, {len(all_ways)} way, {len(all_relations)} relazioni")
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
                        # evita duplicati (stesso nodo in più XML)
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
    print(f"Scritto {STATIONS_JSON}  ({len(station_list)} stazioni, {len(lines)} linee)")

# ---------------------------------------------------------------------------
# Build lines.json  (geometrie way)
# ---------------------------------------------------------------------------

def build_lines_json(all_nodes, all_ways, all_relations):
    # indice lat/lon per nodi
    node_coords = {}
    for nid, nd in all_nodes.items():
        lat = nd.get('lat')
        lon = nd.get('lon')
        if lat and lon:
            node_coords[nid] = (round(float(lat), 5), round(float(lon), 5))

    # risolvi way -> lista di [lat, lon]
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

    output = {'lines': line_geom}
    with open(LINES_JSON, 'w', encoding='utf-8') as f:
        json.dump(output, f, separators=(',', ':'))
    print(f"Scritto {LINES_JSON}  ({len(line_geom)} relazioni con geometria)")

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

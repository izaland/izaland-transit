#!/usr/bin/env python3
"""
build_json.py
Legge data/stations.xml e data/lines.xml, produce data/stations.json e data/lines.json.
Usage: python scripts/build_json.py
"""

import xml.etree.ElementTree as ET
import json
import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

STATIONS_XML = os.path.join(DATA_DIR, 'stations.xml')
LINES_XML    = os.path.join(DATA_DIR, 'lines.xml')
STATIONS_JSON = os.path.join(DATA_DIR, 'stations.json')
LINES_JSON    = os.path.join(DATA_DIR, 'lines.json')

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_tags(element):
    return {t.get('k'): t.get('v') for t in element.findall('tag')}


def railway_type(tags):
    rt = tags.get('railway', '')
    if rt == 'station':  return 'station'
    if rt == 'stop':     return 'stop'
    if rt == 'halt':     return 'halt'
    return rt or 'station'


# ---------------------------------------------------------------------------
# Parse stations.xml  ->  stations.json
# ---------------------------------------------------------------------------

def build_stations_json():
    print(f"Reading {STATIONS_XML}")
    tree = ET.parse(STATIONS_XML)
    root = tree.getroot()

    # ---- index all nodes
    nodes = {}
    for nd in root.findall('node'):
        nid = nd.get('id')
        nodes[nid] = {
            'id':  nid,
            'lat': float(nd.get('lat')),
            'lon': float(nd.get('lon')),
            'tags': parse_tags(nd),
        }

    # ---- index lines (relations)
    lines = {}
    for rel in root.findall('relation'):
        rid  = rel.get('id')
        tags = parse_tags(rel)
        if tags.get('type') not in ('route', 'public_transport'):
            # Try to include if it has railway/route tag
            if 'route' not in tags and 'railway' not in tags:
                continue
        colour   = tags.get('colour') or tags.get('color') or '#888888'
        operator = tags.get('operator', '')
        network  = tags.get('network', '')
        name     = tags.get('name', f'Line {rid}')
        short    = tags.get('ref') or tags.get('short_name') or rid
        rtype    = tags.get('route') or tags.get('railway') or 'train'
        if rtype == 'light_rail': pass  # keep as-is
        if name.lower().endswith('[disabled]') or 'disabled' in name.lower():
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

        # assign lines to nodes (with seq)
        for i, member in enumerate(rel.findall('member')):
            if member.get('type') == 'node':
                role = member.get('role', '')
                if role in ('station', 'stop', 'halt', ''):
                    nid = member.get('ref')
                    if nid in nodes:
                        if '_lines' not in nodes[nid]:
                            nodes[nid]['_lines'] = []
                        nodes[nid]['_lines'].append({'relId': rid, 'seq': i})

    # ---- build station list (only nodes that appear in at least one relation)
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
            'lines': nd['_lines'],
        }
        station_list.append(entry)

    output = {'lines': lines, 'stations': station_list}
    with open(STATIONS_JSON, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"Written {STATIONS_JSON}  ({len(station_list)} stations, {len(lines)} lines)")


# ---------------------------------------------------------------------------
# Parse lines.xml  ->  lines.json
# ---------------------------------------------------------------------------

def build_lines_json():
    print(f"Reading {LINES_XML}")
    tree = ET.parse(LINES_XML)
    root = tree.getroot()

    line_geom = {}
    for rel in root.findall('relation'):
        rid      = rel.get('id')
        segments = []
        for member in rel.findall('member'):
            if member.get('type') == 'way':
                pts = []
                for nd in member.findall('nd'):
                    lat = nd.get('lat')
                    lon = nd.get('lon')
                    if lat and lon:
                        pts.append([round(float(lat), 5), round(float(lon), 5)])
                if len(pts) >= 2:
                    segments.append(pts)
        if segments:
            line_geom[rid] = segments

    output = {'lines': line_geom}
    with open(LINES_JSON, 'w', encoding='utf-8') as f:
        json.dump(output, f, separators=(',', ':'))
    print(f"Written {LINES_JSON}  ({len(line_geom)} relations)")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    missing = [p for p in (STATIONS_XML, LINES_XML) if not os.path.exists(p)]
    if missing:
        print("ERROR: missing files:", missing, file=sys.stderr)
        sys.exit(1)
    build_stations_json()
    build_lines_json()
    print("Done.")

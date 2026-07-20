import xml.etree.ElementTree as ET
import json, sys, os

# ================================================================
# OVERPASS QUERY (OGF server)
# Tutte le relazioni route con operator=Izarail + network=Izaland High Speed Railway
# ================================================================
# [out:xml][timeout:90];
# (
#   relation["operator"="Izarail"]["network"="Izaland High Speed Railway"]["type"="route"];
# );
# out body;
# >;
# out skel qt;
#
# Endpoint: https://overpass.opengeofiction.net/api/interpreter
#
# curl:
#   curl -X POST https://overpass.opengeofiction.net/api/interpreter \
#     --data-urlencode 'data=[out:xml][timeout:90];
#       (relation["operator"="Izarail"]["network"="Izaland High Speed Railway"]["type"="route"];);
#       out body;>;out skel qt;' \
#     -o izx_export.xml
# ================================================================

# ================================================================
# OVERPASS QUERY — Airport Express (AX)
# Linea AX + stazioni, operator=Izarail
# ================================================================
# [out:json][timeout:60];
# (
#   // Relazione della linea Airport Express
#   relation["operator"="Izarail"]["ref"="AX"];
#   relation["operator"="Izarail"]["name"~"Airport Express", i];
#   relation["operator"="Izarail"]["network"~"Airport Express", i];
#
#   // Stazioni/nodi con codice AX__
#   node["operator"="Izarail"]["ref"~"^AX[0-9]"];
#   node["operator"="Izarail"]["network"~"Airport Express", i];
#
#   // Way e aree stazione
#   way["operator"="Izarail"]["ref"~"^AX[0-9]"];
#   nwr["operator"="Izarail"]["railway"="station"]["network"~"Airport Express", i];
#   nwr["operator"="Izarail"]["railway"="halt"]["network"~"Airport Express", i];
# );
# out geom;
#
# curl:
#   curl -X POST https://overpass.opengeofiction.net/api/interpreter \
#     --data-urlencode 'data=[out:json][timeout:60];
#       (relation["operator"="Izarail"]["ref"="AX"];
#        node["operator"="Izarail"]["ref"~"^AX[0-9]"];);
#       out geom;' \
#     -o ax_export.json
# ================================================================

def clean(s):
    return (s or "").strip()

def parse(xml_path, out_path="data/stations.json", map_path="data/station-map.json"):
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # --- Carica station-map.json se esiste ---
    stn_map = {}
    if os.path.exists(map_path):
        with open(map_path, encoding="utf-8") as f:
            stn_map = json.load(f)
        print(f"  station-map: {len(stn_map)} entries caricati da {map_path}")
    else:
        print(f"  station-map: {map_path} non trovato — output senza stationId/stops")

    # --- Raccogli tag e coordinate di tutti i nodi ---
    node_tags   = {}
    node_coords = {}
    for node in root.findall("node"):
        nid = node.get("id")
        node_coords[nid] = {"lat": float(node.get("lat")), "lon": float(node.get("lon"))}
        node_tags[nid]   = {t.get("k"): t.get("v") for t in node.findall("tag")}

    # --- Raccogli le relazioni route ---
    lines    = {}
    stations = {}

    for rel in root.findall("relation"):
        tags = {t.get("k"): t.get("v") for t in rel.findall("tag")}
        if tags.get("type") != "route":
            continue

        rel_id = rel.get("id")
        colour = "#" + tags.get("colour", "888888").lstrip("#")
        for txt, hex_ in [
            ("blue",   "#3b82f6"),
            ("black",  "#555555"),
            ("green",  "#22c55e"),
            ("orange", "#f97316"),
            ("red",    "#ef4444"),
            ("purple", "#a855f7"),
        ]:
            if colour == f"#{txt}":
                colour = hex_

        lines[rel_id] = {
            "id":       rel_id,
            "name":     clean(tags.get("name", "")),
            "ref":      clean(tags.get("ref", "")),
            "colour":   colour,
            "operator": clean(tags.get("operator", "")),
            "network":  clean(tags.get("network", "")),
            "route":    tags.get("route", "train"),
            "from":     clean(tags.get("from", "")),
            "to":       clean(tags.get("to", "")),
        }

        for i, member in enumerate(rel.findall("member")):
            if member.get("type") != "node":
                continue
            role = member.get("role", "")
            if role not in ("station", "stop", "stop_entry_only", "stop_exit_only", ""):
                continue

            nid = member.get("ref")
            t   = node_tags.get(nid, {})
            rw  = t.get("railway", "")
            is_station = (
                rw in ("station", "halt", "stop", "tram_stop")
                or role in ("station", "stop", "stop_entry_only", "stop_exit_only")
            )
            if not is_station or nid not in node_coords:
                continue

            name = clean(
                t.get("name") or t.get("name:en") or t.get("name:ja") or ""
            )

            if nid not in stations:
                stations[nid] = {
                    "osmId":    nid,
                    "name":     name,
                    "lat":      node_coords[nid]["lat"],
                    "lon":      node_coords[nid]["lon"],
                    "type":     role or rw,
                    "tags":     {k: v for k, v in t.items() if k != "name"},
                    "osmLines": []
                }

            stations[nid]["osmLines"].append({"relId": rel_id, "seq": i})

    # --- Arricchisci con station-map.json ---
    unmapped = []
    for nid, entry in stations.items():
        if nid in stn_map:
            m = stn_map[nid]
            entry["stationId"]  = m["STN"]
            entry["stops"]      = m.get("stops", [])
            if "name" in m:
                entry["name"] = m["name"]
            if "name_kanji" in m:
                entry["name_kanji"] = m["name_kanji"]
        else:
            unmapped.append(nid)

    if unmapped:
        print(f"  \u26a0  {len(unmapped)} stazioni senza mapping in station-map.json:")
        for nid in unmapped:
            s = stations[nid]
            print(f"     node/{nid}  \"{s['name']}\"  ({s['lat']:.5f}, {s['lon']:.5f})")

    # --- Ordina per stationId (STN-NNN prima, poi gli OSM-only) ---
    station_list = sorted(
        stations.values(),
        key=lambda s: s.get("stationId", "ZZZ-" + s["osmId"])
    )

    output = {
        "_network": "Izaland High Speed Railway",
        "lines":    lines,
        "stations": station_list,
    }

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    mapped_count = len(station_list) - len(unmapped)
    print(f"\u2713 {len(station_list)} stazioni ({mapped_count} mappate, {len(unmapped)} OSM-only), "
          f"{len(lines)} linee \u2192 {out_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python parse_overpass.py <export.xml> [data/stations.json] [data/station-map.json]")
        sys.exit(1)
    parse(
        xml_path = sys.argv[1],
        out_path = sys.argv[2] if len(sys.argv) > 2 else "data/stations.json",
        map_path = sys.argv[3] if len(sys.argv) > 3 else "data/station-map.json",
    )

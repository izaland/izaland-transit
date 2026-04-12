import xml.etree.ElementTree as ET
import json, sys, re

def clean(s):
    return (s or "").strip()

def parse(xml_path, out_path="data/stations.json"):
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # Raccogli tag di tutti i nodi
    node_tags = {}
    node_coords = {}
    for node in root.findall("node"):
        nid = node.get("id")
        node_coords[nid] = {"lat": float(node.get("lat")), "lon": float(node.get("lon"))}
        node_tags[nid] = {t.get("k"): t.get("v") for t in node.findall("tag")}

    # Raccogli le relazioni route
    lines = {}
    stations = {}

    for rel in root.findall("relation"):
        tags = {t.get("k"): t.get("v") for t in rel.findall("tag")}
        if tags.get("type") != "route":
            continue
        
        rel_id = rel.get("id")
        colour = "#" + tags.get("colour", "888888").lstrip("#")
        # fix colori testuali
        for txt, hex_ in [("blue","#3b82f6"),("black","#555555"),("green","#22c55e"),("orange","#f97316")]:
            if colour == f"#{txt}":
                colour = hex_

        lines[rel_id] = {
            "id": rel_id,
            "name": clean(tags.get("name", "")),
            "short": clean(tags.get("ref", rel_id)),
            "colour": colour,
            "operator": clean(tags.get("operator", "")),
            "network": clean(tags.get("network", "")),
            "type": tags.get("route", "train"),
        }

        # Aggiungi stazioni da questa relazione
        for i, member in enumerate(rel.findall("member")):
            if member.get("type") != "node":
                continue
            role = member.get("role", "")
            if role not in ("station", "stop", "stop_entry_only", "stop_exit_only", ""):
                continue
            
            nid = member.get("ref")
            t = node_tags.get(nid, {})
            rw = t.get("railway", "")
            is_station = rw in ("station","halt","stop","tram_stop") or role in ("station","stop","stop_entry_only","stop_exit_only")
            if not is_station:
                continue
            if nid not in node_coords:
                continue

            name = clean(t.get("name") or t.get("name:en") or t.get("name:ja") or "")
            if nid not in stations:
                stations[nid] = {
                    "id": nid,
                    "name": name,
                    "lat": node_coords[nid]["lat"],
                    "lon": node_coords[nid]["lon"],
                    "type": role or rw,
                    "tags": {k: v for k, v in t.items() if k != "name"},
                    "lines": []
                }
            stations[nid]["lines"].append({
                "relId": rel_id,
                "seq": i
            })

    output = {
        "lines": lines,
        "stations": list(stations.values())
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, separators=(",", ":"))

    print(f"✓ {len(stations)} stazioni, {len(lines)} linee → {out_path}")

if __name__ == "__main__":
    parse(sys.argv[1])

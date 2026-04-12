# 🚄 Izaland Transit Portal

An interactive transport portal for **Izaland**, a fictional nation on [OpenGeoFiction](https://opengeofiction.net).

This project visualizes and explores the Izaland transport network using OGF map data (same infrastructure as OpenStreetMap + Overpass API).

## ✨ Features (planned)

- 🗺️ **Interactive map** — MapLibre GL JS powered, using OGF tile server
- 🚄 **IZX high-speed rail diagram** — schematic map of all IZX lines
- 🚇 **Metro diagrams** — Sainðaul Capital Subway Network (18 lines, 606 km)
- 🔍 **Route explorer** — journey planner between cities
- 🕐 **Timetables** — simulated IZX and intercity schedules
- 🃏 **IZWay smart card** — fictional transit card UI

## 🗂️ Structure

```
izaland-transit/
├── frontend/          # Web app (HTML + MapLibre + JS)
│   ├── index.html     # Main portal landing page
│   ├── izx.html       # IZX high-speed rail schematic
│   └── assets/
├── data/
│   ├── xml/           # ← Overpass XML exports (input)
│   ├── stations.json  # ← generato automaticamente
│   └── lines.json     # ← generato automaticamente
├── scripts/
│   └── build_json.py  # Merge XML → JSON
├── diagrams/          # SVG line diagram generators
└── docs/              # Lore-consistent documentation
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Map tiles | OGF tile server (`tile.opengeofiction.net`) |
| Map renderer | MapLibre GL JS |
| OGF data queries | Overpass API (`overpass.opengeofiction.net`) |
| Diagrams | SVG + D3.js |
| Frontend | Vanilla HTML/CSS/JS (no build step needed) |

## 🌐 OGF Overpass endpoint

```
https://overpass.opengeofiction.net/api/interpreter
```

Same query syntax as OSM Overpass QL — just point to the OGF instance.

---

## 📥 Come aggiungere dati al progetto

I dati delle stazioni e delle linee vengono estratti dall'API Overpass di OGF ed esportati come XML. Ogni export va messo nella cartella `data/xml/` con un nome descrittivo (es. `batch_01_metro.xml`). GitHub Actions ricostruisce automaticamente `stations.json` e `lines.json` ad ogni push.

### Query per stazioni e geometria linee

Usa questa query per estrarre **stazioni + nodi + way** di un insieme di relazioni. Sostituisci gli ID con quelli delle linee che vuoi aggiungere.

```overpassql
[out:xml][timeout:60];
(
  relation(187662);
  relation(242546);
  relation(242547);
  /* aggiungi altri relation(ID); qui */
);
(._;>>;);
out body;
```

> `(._;>>;);` espande la relazione includendo tutti i way e i nodi figli — necessario per avere sia le stazioni che la geometria delle linee.

### Query per trovare l'ID di una relazione

Se conosci il nome della linea ma non l'ID:

```overpassql
[out:xml];
relation["name"~"Chikaoi"];
out tags;
```

Oppure per cercare tutte le relazioni di tipo `route` in un'area:

```overpassql
[out:xml];
relation["type"="route"]["route"="train"]({{bbox}});
out tags;
```

### Come caricare

1. Esegui la query su [overpass.opengeofiction.net](https://overpass.opengeofiction.net)
2. Clicca **Export → Download as OSM XML**
3. Rinomina il file con prefisso numerico: `batch_02_nuove_linee.xml`
4. Caricalo su GitHub in `data/xml/` → **Add file → Upload files**
5. GitHub Actions si avvia automaticamente e aggiorna i JSON ✅

> ⚠️ **Non cancellare** i file XML vecchi — i dati storici dipendono da tutti i file presenti nella cartella.

---

## 📖 About Izaland

Izaland is a fictional nation in Eastern Uletha on OpenGeoFiction, with a population of ~118 million. Its transport network includes:
- **16,418 km** of standard-speed rail (Izarail)
- **2,263 km** of high-speed rail (IZX)
- **20 cities** with metro/subway systems
- **606 km** of metro in Sainðaul alone (18 lines)
- Major carriers: Izaland Airlines (IZ) and Uletha Eastern Airways (UE)

---

*Data source: [OpenGeoFiction](https://opengeofiction.net) — a collaborative fictional mapping project.*

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
├── data/              # Overpass QL queries for OGF data
│   └── queries/
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

## 📖 About Izaland

Izaland is a fictional nation in Eastern Uletha on OpenGeoFiction, with a population of ~118 million. Its transport network includes:
- **16,418 km** of standard-speed rail (Izarail)
- **2,263 km** of high-speed rail (IZX)
- **20 cities** with metro/subway systems
- **606 km** of metro in Sainðaul alone (18 lines)
- Major carriers: Izaland Airlines (IZ) and Uletha Eastern Airways (UE)

---

*Data source: [OpenGeoFiction](https://opengeofiction.net) — a collaborative fictional mapping project.*

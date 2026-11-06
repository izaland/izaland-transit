# 🚄 Izaland Transit Portal

An interactive transport portal for **Izaland**, a fictional nation on [OpenGeoFiction](https://opengeofiction.net).

Il progetto include una mappa interattiva, diagrammi di rete, orari simulati e un **journey planner multi-rete** che calcola collegamenti tra IZX (alta velocità), rete suburbana di Sainðaul, metro e CityLiner.

## ✨ Funzionalità

- 🧭 **Journey Planner** — ricerca collegamenti tra tutte le reti, con cambi, tempi di attesa e filtro per linea
- 🚄 **IZX (alta velocità)** — linee Keishin, Ryānkai, Eira e Seibu Naeryuku, con orari simulati
- 🚆 **Rete suburbana di Sainðaul** — Loop Line, Kidai, Riimiilla, Chikaoi, Juwon-Kodōn, Seishaku, Kwōkei, Tandan-Senpyan, Kawasabu, Chukkūn, Handai
- 🚇 **Metro di Sainðaul** — 18 linee, 606 km
- 🚌 **CityLiner** — linea CL32 con orari reali
- 🕐 **Orari** — pagine timetable per IZX e altre reti
- 🃏 **IZWay** — UI della smart card e biglietteria
- 🗺️ **Mappe interattive** — MapLibre GL JS su tile OGF

## 🧭 Journey Planner

Il planner è in `journey-planner.html` e usa `IZXUnifiedRouter` per cercare collegamenti attraverso reti diverse:

| Router | File | Reti |
|---|---|---|
| `IZXRouter` | `routing.js` | KE (Keishin), RY (Ryānkai), EI (Eira), SN (Seibu Naeryuku) |
| `SuburbanRouter` | `suburban-router.js` | LO, KD, RI, CO, JD, SK, KW, TS, KS, CK, HD, RI |
| `MetroRouter` | `metro/` | Metro di Sainðaul |
| CityLiner | `journey-planner.html` | CL32 |

Il router unificato (`unified-router.js`) coordina le ricerche, gestisce gli interscambi cross-network e la navigazione “Earlier/Later trains”.

### Motore orari (`tt-engine.js`)

- **RY (Ryānkai)**: i tempi non sono tabellati ma calcolati cinematicamente da `ry-network.js` (segmenti, km, limiti di velocità) + `run-time-engine.js` (profilo treno, dwell). Ogni servizio ha un pattern di fermate proprio; i dwell valgono solo per le fermate effettivamente servite.
- **KE / EI / SN**: orari da offset tabellati (`TT`) in `izx-data.js`; la direzione NB specchia gli offset rispetto alla SB.
- La cache delle query TTEngine e il raggruppamento per linea/direzione in `routing.js` mantengono le ricerche veloci anche sulle tratte da hub.

### Interscambi cross-network

Gli interscambi sono dichiarati in `SUBURBAN_INTERCHANGE` (`suburban-data.js`) come coppie di codici (es. `CO55 ↔ K04` a Hashimakori-Juwon, `KD20 ↔ R02`, `KS18 ↔ RY02`). Il planner li usa per costruire collegamenti con cambio tra suburbano, IZX, metro e CityLiner.

## 🗂️ Struttura

```
izaland-transit/
├── journey-planner.html   # Journey planner multi-rete
├── izx.html               # Portale IZX
├── izx-timetable.html     # Orari IZX
├── izx-ticket.html        # Biglietteria / IZWay
├── commuter.html          # Rete suburbana
├── metro.html             # Metro di Sainðaul
├── stations.html          # Stazioni
├── map.html               # Mappa interattiva
├── routing.js             # IZXRouter (CSA semplificato)
├── unified-router.js      # Router unificato multi-rete
├── suburban-router.js     # Router rete suburbana
├── tt-engine.js           # Motore orari unificato
├── run-time-engine.js     # Calcolo cinematico dei tempi
├── ry-network.js          # Modello fisico Ryānkai
├── izx-data.js            # Dati IZX (KE/RY/EI/SN)
├── suburban-data.js       # Dati rete suburbana + interscambi
├── metro/                 # Dati e router metro
├── other-rail-data/       # Altre reti (HD, IBC, SHX, WI, SSK, SBO, RKY)
├── data/                  # Export Overpass XML + JSON generati
├── scripts/               # Strumenti di build
└── docs/                  # Documentazione
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Map tiles | OGF tile server (`tile.opengeofiction.net`) |
| Map renderer | MapLibre GL JS |
| OGF data queries | Overpass API (`overpass.opengeofiction.net`) |
| Frontend | Vanilla HTML/CSS/JS (no build step) |
| Routing | CSA semplificato + motori per rete |

## 📥 Aggiungere dati dal progetto OGF

I dati delle stazioni e delle linee vengono estratti dall’API Overpass di OGF ed esportati come XML. Ogni export va messo in `data/xml/` con un nome descrittivo (es. `batch_01_metro.xml`). GitHub Actions ricostruisce automaticamente `stations.json` e `lines.json` ad ogni push.

### Query per stazioni e geometria linee

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

### Query per trovare l’ID di una relazione

```overpassql
[out:xml];
relation["name"~"Chikaoi"];
out tags;
```

Oppure:

```overpassql
[out:xml];
relation["type"="route"]["route"="train"]({{bbox}});
out tags;
```

### Come caricare

1. Esegui la query su [overpass.opengeofiction.net](https://overpass.opengeofiction.net)
2. **Export → Download as OSM XML**
3. Rinomina il file (es. `batch_02_nuove_linee.xml`)
4. Caricalo in `data/xml/` → **Add file → Upload files**
5. GitHub Actions aggiorna i JSON ✅

> ⚠️ **Non cancellare** i file XML vecchi — i dati storici dipendono da tutti i file presenti nella cartella.

## 🔧 Note tecniche recenti

- **RY run-time**: i tempi della Ryānkai sono calcolati per servizio (pattern fermate + dwell + run-time cinematico), non più tabellati.
- **Direzione NB**: per le linee con TT a offset (KE/EI/SN) gli offset vengono specchiati in NB, così le corse verso Sainðaul/Riyatoma hanno orari coerenti.
- **Performance routing**: la fase diretta di `IZXRouter.search` raggruppa le query TTEngine per linea/direzione e usa una cache LRU; le ricerche ripetute e da hub sono molto più veloci.

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

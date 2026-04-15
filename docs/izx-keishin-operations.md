# IZX Keishin Line — Operations Reference

## Network Overview

The IZX Keishin Line connects **Sainðaul** (K01) in the north to **Warohan** (K17) and **Daishin** (N4)
in the south, with a branch from **Sakamuso** (K101) merging at **Shin-Kichatsura** (K10).
Total length: ~658 km (Main Line K01–N4) + ~173 km (Sakamuso Branch K101–K10).

---

## Service Patterns

| ID | Name | Route | Headway | Terminus S | Terminus N |
|----|------|-------|---------|-----------|-----------|
| A  | Nonstop Express | K01 – K03 – K08 – K10 – K12 – K17 (– N1 – N2 – N3 – N4) | 20 min | K17 / N4 | K01 |
| B  | Semi-rapid | K01 – K03 – K04 – K05 – K06 – K07 – K08 – K09 – K10 – K11 – K12 – K13 – K14 – K144 – K15 – K16 – K116 – K17 | 30 min | K17 | K01 |
| C  | Rapid (Wodoriha) | K01 – K03 – K06 – K08 – K09 – K10 – K11 – K12 | 60 min | K12 | K01 |
| C' | Rapid (Nagayamatsu) | K01 – K03 – K31 – K32 – K33 – K08 – K09 – K10 – K11 – K12 | 60 min | K12 | K01 |
| E  | Express (Sakamuso) | K101 – K102 – K120 – K103 – K104 – K105 – K106 – K160 – K10 – K12 – K17 (– N1 – N2 – N3 – N4) | 20 min | K17 / N4 | K101 |
| F lim | Local limited | K101 – K102 – K120 – K103 – K104 – K105 – K106 – K160 – K10 | 30 min | K10 | K101 |
| F ext | Local extended | K101 – K102 – K120 – K103 – K104 – K105 – K106 – K160 – K10 – K11 – K12 – K13 – K14 – K144 – K15 – K16 – K116 – K17 | 30 min | K17 | K101 |
| G  | Nankai Shuttle | K17 – N1 – N2 – N3 – N4 | 60 min | N4 | K17 |

### Service A — Variant split
- **2 out of every 3 departures** terminate at K17 (Warohan) — cycle ≈ 310 min
- **1 out of every 3 departures** continues to N4 (Daishin) — cycle ≈ 433 min
- Same applies to Service E on the Sakamuso branch

### Service G — Nankai Shuttle notes
- Operates as a feeder/reinforcement between Warohan (K17) and Daishin (N4)
- Stops at all intermediate Nankai stations: N1 (Naraki-Attawi), N2 (Satsokoibo), N3 (Shin-Nuskajui)
- **N1 (Naraki-Attawi)** is equipped with passing loops; G waits there to yield
  priority to A and E express services
- Express frequency at N1: ~2 tph (only A/N4 and E/N4 variants pass through N1)
  G has ample margin with a 2-minute dwell at N1
- First southbound departure: **K17 at 07:05**
- First northbound departure: **N4 at 08:00**

---

## Performance Parameters

| Parameter | Value |
|-----------|-------|
| Acceleration | 0.72 m/s² |
| Braking | 0.80 m/s² |
| Max speed K01–K02 | 150 km/h |
| Max speed K02–K03 | 200 km/h |
| Max speed K03–K09 | 260 km/h |
| Max speed K09–K16 | 300 km/h |
| Max speed K16–K17 | 250 km/h |
| Max speed K17–N1 | 150–180 km/h |
| Max speed N1–N4 | 250–300 km/h |
| Max speed Sakamuso K103–K10e | 320 km/h |
| Terminus layover (cleaning) | 15 min |

---

## Running Times (one direction)

| Service | Route | Time |
|---------|-------|------|
| A | K01 → K17 | ~140 min |
| A | K01 → N4 | ~202 min |
| E | K101 → K17 | ~129 min |
| E | K101 → N4 | ~191 min |
| B | K01 → K17 | ~185 min |
| C | K01 → K12 | ~105 min |
| C' | K01 → K12 (via bypass) | ~104 min |
| F lim | K101 → K10 | ~60 min |
| F ext | K101 → K17 | ~154 min |
| G | K17 → N4 | ~36 min |

All services are time-symmetric (NB ≈ SB running time).

---

## Fleet Requirements

| Category | Pool | Dominant cycle | Headway | Depots |
|----------|------|---------------|---------|--------|
| A | 22 units | 433 min (N4 variant) | 20 min | K01, K17, N4 |
| E | 21 units | 412 min (N4 variant) | 20 min | K101, K17, N4 |
| B | 14 units | 401 min | 30 min | K01, K17 |
| C + C' (shared pool) | 8 units | 239 min | 30 min combined | K01, K12 |
| F (shared pool) | 12 units | 338 min (F ext) | 30 min | K101, K10, K17 |
| G | 2 units | 102 min | 60 min | K17, N4 |
| **Total (minimum)** | **79 units** | — | — | — |
| **With 10% reserve** | **87 units** | — | — | — |

### Depot notes
- **K17 (Warohan)** and **N4 (Daishin)** both have servicing depots.
  Out-of-service units held there can be inserted into revenue service on short notice,
  covering demand peaks without waiting for a full turnaround cycle.
- **K101 (Sakamuso)** and **K01 (Sainðaul)** are the primary northern termini depots.

---

## Daily Train Movements

| Service | SB/day | NB/day | Total |
|---------|--------|--------|-------|
| A | ~85 | ~84 | ~169 |
| E | ~84 | ~83 | ~167 |
| B | ~41 | ~41 | ~82 |
| C | ~23 | ~23 | ~46 |
| C' | ~23 | ~23 | ~46 |
| F lim | ~44 | ~44 | ~88 |
| F ext | ~40 | ~40 | ~80 |
| G | ~17 | ~16 | ~33 |
| **Grand total** | | | **~711** |

---

## Overtake & Conflict Points

| Station | Role | Services involved |
|---------|------|------------------|
| K04, K07 | B waits for A (passing loop) | A overtakes B |
| K09 | B waits for A | A overtakes B |
| K11 | B waits for A | A overtakes B |
| N1 (Naraki-Attawi) | G waits on loop | A/N4 and E/N4 pass through |

---

*Generated automatically. All times computed from kinematic model (a=0.72 m/s², d=0.80 m/s²).*

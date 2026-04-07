# Izaland Transport Network — Overview

Reference document for the Izaland Transit Portal project.

## Railway System

### Izarail
- Main operator, privatized 1998
- ~16,418 km of standard-speed rail (as of May 2023)
- Gauge: **1,453 mm** (Izaland standard, close to 1,435 mm global standard)
- Electrification: **3,000 V DC** (local), **25 kV AC** (high speed)
- Driving/passing side: **left**

### IZX (IZaland eXpress)
- High-speed subsidiary of Izarail
- **2,263.36 km** of dedicated HSR
- Brand launched: **1989**
- Max speed: **360 km/h** on select segments; typical 250–320 km/h
- First line opened: **1 September 1972** (Chikawari–Panaireki)

#### IZX Lines (as of 2022)

| Line | Route | Length | Notes |
|---|---|---|---|
| Saikai Line | Sainðaul → Warohan (via Panaireki) | 570.46 km | Main trunk |
| Naeryuku Short Line | Sainðaul → Warohan (via Pyanuza, faster) | — | Types A/C |
| Otsumi Short Line | Sakamuso → Warohan (via Kohtosōre) | — | Types D/E |
| Nagareki Line | Sainðaul → Nagareki | ~420 km | Northern route |
| Ryānkai Line | Sainðaul → Sannupuri | ~600 km | Western coast |
| Nankai Line | Warohan → Daishin | 115.6 km | Southern Kubori |

### Train Service Categories

| Category | Izaki | Surcharge | Notes |
|---|---|---|---|
| Local urban | 都市圏普通列車 | No | All stops |
| Rapid urban | 都市圏快速列車 | No | Selected stops |
| Local regional | 地方普通列車 | No | All stops |
| Rapid regional | 地方快速列車 | No | Selected stops |
| Limited Express | 特急列車 | Yes | 150–200 km/h |
| IZX | 高速列車 | Yes | 250–360 km/h |
| Touristic | 観光列車 | Yes | Scenic routes |
| Night Trains | 夜行列車 | Yes | Intercity overnight |

## Suburban Networks

| Network | City | Lines | Notes |
|---|---|---|---|
| Capital suburban (首都圏近郊) | Sainðaul | 19 | CO, IS, SO, MA, GS, LL, SI, AX, BS, SU, KS, KH, RI, JA, HO, OI, OJ, AM, SM |
| Warohan metro area | Warohan | TBD | Includes private railways |
| Panairail | Panaireki | TBD | N-S corridor, Nugamochi–Shin-Shikarana |
| Kichatsura network | Kichatsura | TBD | Opened 1999 |

## Metro Systems

| City | Lines | Length |
|---|---|---|
| Sainðaul (greater area) | 18 | 606.3 km |
| Warohan | TBD | 151.46 km |
| Panaireki | TBD | 137.95 km |
| Kichatsura | TBD | 87.06 km |
| Sannupuri | TBD | 93.46 km |
| Daishin | TBD | 84.38 km |

## OGF Technical Info

- **Overpass endpoint**: `https://overpass.opengeofiction.net/api/interpreter`
- **Tile server**: `https://tile.opengeofiction.net/{z}/{x}/{y}.png`
- **iD editor**: `https://opengeofiction.net/edit`
- Same tag schema as OSM: `railway=rail`, `route=train`, `public_transport=*`, etc.

## Key Relation IDs (OGF)

| Route/Feature | OGF Relation ID |
|---|---|
| Keishin Expressway | [300574](https://opengeofiction.net/relation/300574) |
| Karuhama Expressway | [300590](https://opengeofiction.net/relation/300590) |
| Ryānkai Expressway | [300606](https://opengeofiction.net/relation/300606) |
| Dōnkaidō Expressway | [300575](https://opengeofiction.net/relation/300575) |

*Add IZX and rail relation IDs as they are confirmed on OGF.*

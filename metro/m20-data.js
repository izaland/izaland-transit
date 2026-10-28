/* ================================================================
   M20-DATA.JS — Metro Line 20
   ================================================================
   7 stazioni · M2001 Sainðaul Central → M2007 Sakamuso
   Colore: #0F1F5C (blu notte)

   Distanze progressive da M2001 (km 0.00), ricavate dalla colonna
   distance_from_M1701.

   Servizi:
     LO  Locale, tutte le fermate (M2001–M2007)
     EX  Express, solo M2001 · M2004 · M2007

   Frequenze (min):          LO    EX
     Punta     07:00–09:30 / 17:30–20:00   4     6
     Diurno    09:30–17:30 / 20:00–22:30  10    10
     Morbida   05:30–07:00 / 22:30–24:00   8    15

   Sfasamento express: offsetMin 5 (partenze alle :05 + n·headway).

   Modello cinematico (M20_KIN): entrambi i servizi accelerano,
   viaggiano in crociera a vmax, frenano. Tempi risultanti con i valori
   sotto (senza attesa):
     Locale  M2001→M2007  ~12.7 min (7 fermate)
     Express M2001→M2007  ~8.2 min  (3 fermate)
   Tratte brevi (1.3–3 km) non raggiungono 150 km/h; solo la
   M2005–M2006 (5.69 km) si avvicina alla crociera piena.

   Capacità integrata:
     - 6/h Local thru M20↔SBM↔SBO
     - 4/h SBM Rapid
     - 2/h SBM Express fuori punta; 3/h in punta
     - Local M20↔SBM verso Hidano Maeburi con la capacità residua
     - Express M20 residui solo se avanzano slot

   Interscambi:
     M2001  HUB_SAINDAUL_CENTRAL 
     M2007  HUB_SAKAMUSO
================================================================ */
'use strict';

const M20_ST = {
  M2001: { n: 'Sainðaul Central', k: '作安崎中央', nodeId: 229656494, km:  0.00 },
  M2002: { n: 'Kanbata',          k: '巻岩',       nodeId: 177044015, km:  1.31 },
  M2003: { n: 'Abawauri',         k: '燕宦',       nodeId: 129227893, km:  3.72 },
  M2004: { n: 'Shimamera',        k: '渠瀬田',     nodeId: 368583227, km:  5.18 },
  M2005: { n: 'Hadantoyo',        k: '琦砂',       nodeId: 368583213, km:  6.83 },
  M2006: { n: 'Taradawaki',       k: '',           nodeId: 296583583, km: 12.52 },
  M2007: { n: 'Sakamuso',         k: '沛坤',       nodeId: 176874425, km: 15.55 },
};

/* Ordine canonico: M2001 → M2007 */
const M20_CANONICAL_ORDER = [
  'M2001', 'M2002', 'M2003', 'M2004', 'M2005', 'M2006', 'M2007',
];

const M20_EXPRESS_STOPS = ['M2001', 'M2004', 'M2007'];

const M20_META = {
  id:          'M20',
  code:        'M20',
  name:        'Line 20',
  nameJa:      '20号線',
  color:       '#0F1F5C',
  totalKm:     15.55,
  avgSpeedKmh: 60,    // solo fallback: i servizi usano M20_KIN
  dwellSec:    30,
};

/* Modello cinematico — TODO: valori provvisori da confermare
   vmaxKmh  velocità di crociera massima
   accel    accelerazione (m/s²)
   decel    decelerazione di servizio (m/s²)
   dwellSec sosta alle fermate intermedie (s) */
const M20_KIN = {
  LO: { vmaxKmh: 150, accel: 1.0, decel: 1.1, dwellSec: 30 },
  EX: { vmaxKmh: 150, accel: 1.0, decel: 1.1, dwellSec: 40 },
};

/* Sfasamento partenze express (minuti) */
const M20_EX_OFFSET_MIN = 5;

/* Frequenze per servizio */
const M20_HEADWAY_LO = [
  { from: '05:30', to: '07:00', headwayMin:  8 },  // soft
  { from: '07:00', to: '09:30', headwayMin:  4 },  // peak
  { from: '09:30', to: '17:30', headwayMin: 10 },  // daytime
  { from: '17:30', to: '20:00', headwayMin:  4 },  // peak
  { from: '20:00', to: '22:30', headwayMin: 10 },  // daytime
  { from: '22:30', to: '24:00', headwayMin:  8 },  // soft
];

const M20_HEADWAY_EX = [
  { from: '05:30', to: '07:00', headwayMin: 15 },  // soft
  { from: '07:00', to: '09:30', headwayMin:  6 },  // peak
  { from: '09:30', to: '17:30', headwayMin: 10 },  // daytime
  { from: '17:30', to: '20:00', headwayMin:  6 },  // peak
  { from: '20:00', to: '22:30', headwayMin: 10 },  // daytime
  { from: '22:30', to: '24:00', headwayMin: 15 },  // soft
];

const M20_SVC = {
  LO: {
    name:   'Local',
    nameJa: '各駅停車',
    color:  '#0F1F5C',
    cls:    'svc-LO',
    stops:  M20_CANONICAL_ORDER,
  },
  EX: {
    name:   'Express',
    nameJa: '急行',
    color:  '#0F1F5C',
    cls:    'svc-EX',
    stops:  M20_EXPRESS_STOPS,
  },
};

var _hub = (typeof _hub !== 'undefined')
  ? _hub
  : (hubId, min = null, note = '') => ({ hubId, transferMin: min, note });

const M20_INTERCHANGE = {
    M2001: [_hub('HUB_SAINDAUL_CENTRAL')],
  M2002: [
    { code: 'M911',  network: 'metro', transferMin: 3, note: 'Metro Line 9 — Kanbata' },
    { code: 'M1014', network: 'metro', transferMin: 3, note: 'Metro Line 10 — Kanbata' },
  ],
  M2003: [
    { code: 'M416', network: 'metro', transferMin: 3, note: 'Metro Line 4 — Abawauri' },
    { code: 'M609', network: 'metro', transferMin: 3, note: 'Metro Line 6 — Abawauri' },
  ],
  M2004: [
    { code: 'M111', network: 'metro',    transferMin: 3, note: 'Metro Line 1 — Shimamera' },
    { code: 'M417', network: 'metro',    transferMin: 3, note: 'Metro Line 4 — Shimamera' },
    { code: 'M610', network: 'metro',    transferMin: 3, note: 'Metro Line 6 — Shimamera' },
    { code: 'SK33', network: 'suburban', transferMin: 4, note: 'SK33 Shimamera' },
    { code: 'TS14', network: 'suburban', transferMin: 4, note: 'TS14 Shimamera' },
    { code: 'AX05', network: 'ax',       transferMin: 5, note: 'Airport Express — Shimamera' },
  ],
  M2005: [
    { code: 'M906',  network: 'metro', transferMin: 3, note: 'Metro Line 9 — Hadantoyo' },
    { code: 'M1203', network: 'metro', transferMin: 3, note: 'Metro Line 12 — Hadantoyo' },
  ],
  M2006: [],
  M2007: [_hub('HUB_SAKAMUSO')],
};

if (typeof module !== 'undefined') {
  module.exports = {
    M20_META, M20_ST, M20_CANONICAL_ORDER, M20_EXPRESS_STOPS, M20_KIN, M20_EX_OFFSET_MIN,
    M20_HEADWAY_LO, M20_HEADWAY_EX, M20_SVC, M20_INTERCHANGE,
  };
}

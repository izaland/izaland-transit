/* ================================================================
   M5-DATA.JS — Metro Line 5
   ================================================================
   14 stazioni · M501 Tsuragoi → M514 Jisahara
   Colore: #9e6a51 (marrone terracotta)

   Distanze progressive da M501 Tsuragoi (km 0.000).
   Spaziatura media: ~1 050 m tra stazioni (900–1 200 m).
   Servizio: unico schema tutto-fermate (no rapidi).

   Interscambi:
     M501  SK37  (Seishaku Line — Tsuragoi, stesso nome)
     M503  M719  (Metro Line 7 — Konegisa Eigandan)
           HOY07 (Hoze-Oyehatton Line — Konegisa Eigandan)
     M505  M1112 (Metro Line 11 — Kirifunu Kukubān)
     M506  RI09  (Sakanemoto)
     M509  M714  (Metro Line 7 — Riihisano)
     M510  M1519 (Metro Line 15 — Eonogi Kōwen)
     M511  HOY13 (Hoze-Oyehatton Line — Kadokamahiwa)
     M513  M728  (Metro Line 7 — Pwakkobe)
     M514  M1120 (Metro Line 11 — Jisahara)
           KD39  (Kidai Line — Jisahara, stesso nome)
     M502, M504, M507, M508, M512: nessun interscambio
================================================================ */
'use strict';

const M5_ST = {
  M501: { n: 'Tsuragoi',                       k: '汐蒲',       nodeId: 123393742, km:  0.00 },
  M502: { n: 'Mundōzan',                        k: '門道山',     nodeId: 304405932, km:  0.95 },
  M503: { n: 'Konegisa Eigandan',               k: '干鮃永玵段', nodeId: 123393753, km:  2.05 },
  M504: { n: 'Jaihonmu 3sa',                    k: '際笨武3沙',  nodeId: 136114107, km:  3.10 },
  M505: { n: 'Kirifunu Kukubān',                k: '礢判國防',   nodeId: 136114106, km:  4.30 },
  M506: { n: 'Sakanemoto',                      k: '沛岬斗',     nodeId: 123393750, km:  5.20 },
  M507: { n: 'Akagae Nosori',                   k: '蛞外見祖里', nodeId: 147984628, km:  6.35 },
  M508: { n: 'Pentorawi Kirifunu',              k: '篡土碪礢判', nodeId: 198159780, km:  7.35 },
  M509: { n: 'Riihisano',                       k: '尾本',       nodeId: 123393747, km:  8.60 },
  M510: { n: 'Eonogi Kōwen',                    k: '',           nodeId: 146814988, km:  9.48 },
  M511: { n: 'Kadokamahiwa',                    k: '',           nodeId: 196658319, km: 10.58 },
  M512: { n: 'Tswikei Daigaku',                 k: '追渓大學',   nodeId: 196658320, km: 11.63 },
  M513: { n: 'Pwakkobe',                        k: '',           nodeId: 196658312, km: 12.55 },
  M514: { n: 'Jisahara',                        k: '治叉槎',     nodeId: 176782928, km: 13.73 },
};

/* Ordine canonico: M501 (nord/origine) → M514 (sud/fine) */
const M5_CANONICAL_ORDER = [
  'M501', 'M502', 'M503', 'M504', 'M505', 'M506', 'M507',
  'M508', 'M509', 'M510', 'M511', 'M512', 'M513', 'M514',
];

/* ----------------------------------------------------------------
   Metadati linea
---------------------------------------------------------------- */
const M5_META = {
  id:          'M5',
  code:        'M5',
  name:        'Line 5',
  nameJa:      '5号線',
  color:       '#9e6a51',
  totalKm:     13.73,   // M501 Tsuragoi → M514 Jisahara
  avgSpeedKmh: 30,      // all-stop, ~1 km spacing
  dwellSec:    30,
};

/* ----------------------------------------------------------------
   Profilo frequenze
   Fascia di punta: 07:00–09:30 e 17:30–20:00 → 2 min
   Fuori punta diurno:                          → 5 min
   Prima mattina / serata:                      → 10 min
---------------------------------------------------------------- */
const M5_HEADWAY = [
  { from: '05:30', to: '07:00', headwayMin: 10 },
  { from: '07:00', to: '09:30', headwayMin:  2 },
  { from: '09:30', to: '17:30', headwayMin:  5 },
  { from: '17:30', to: '20:00', headwayMin:  2 },
  { from: '20:00', to: '22:30', headwayMin:  5 },
  { from: '22:30', to: '24:00', headwayMin: 10 },
];

/* ----------------------------------------------------------------
   Servizi
   A  All-stop (unico servizio — nessun rapido su questa linea)
---------------------------------------------------------------- */
const M5_SVC = {
  A: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#9e6a51',
    cls:    'svc-A',
    stops:  M5_CANONICAL_ORDER,
  },
};

/* ----------------------------------------------------------------
   Interscambi Metro Line 5 ↔ altre reti
---------------------------------------------------------------- */
const M5_INTERCHANGE = {
  M501: [
    { code: 'SK37', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Tsuragoi, stesso nome' },
  ],
  M503: [
    { code: 'M719', network: 'metro', transferMin: 3,
      note: 'Metro Line 7 — Konegisa Eigandan' },
    { code: 'HOY07', network: 'metro', transferMin: 3,
      note: 'Hoze-Oyehatton Line — Konegisa Eigandan' },
  ],
  M505: [
    { code: 'M1112', network: 'metro', transferMin: 3,
      note: 'Metro Line 11 — Kirifunu Kukubān' },
  ],
  M506: [
    { code: 'RI09', network: 'suburban', transferMin: 3,
      note: 'RI09 Sakanemoto' },
  ],
  M509: [
    { code: 'M714', network: 'metro', transferMin: 3,
      note: 'Metro Line 7 — Riihisano' },
  ],
  M510: [
    { code: 'M1519', network: 'metro', transferMin: 3,
      note: 'Metro Line 15 — Eonogi Kōwen' },
  ],
  M511: [
    { code: 'HOY13', network: 'metro', transferMin: 3,
      note: 'Hoze-Oyehatton Line — Kadokamahiwa' },
  ],
  M513: [
    { code: 'M728', network: 'metro', transferMin: 3,
      note: 'Metro Line 7 — Pwakkobe' },
  ],
  M514: [
    { code: 'M1120', network: 'metro', transferMin: 3,
      note: 'Metro Line 11 — Jisahara, stesso nome' },
    { code: 'KD39', network: 'suburban', transferMin: 3,
      note: 'Kidai Line — Jisahara, stesso nome' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M5_META, M5_ST, M5_CANONICAL_ORDER, M5_HEADWAY, M5_SVC, M5_INTERCHANGE };
}

/* ================================================================
   M5-DATA.JS — Metro Line 5
   ================================================================
   14 stazioni · M501 Tsuragoi → M514 Jisahara
   Colore: #9e6a51 (marrone terracotta)

   Distanze progressive da M801 (Kishagoi-Exhibitown).

   Interscambi confermati:
     M501  SK37  (Seishaku Line — Tsuragoi, stesso nome)
     M503  HO07  (Honanshū Line — Konegisa Eigandan)
           M719  (Metro Line 7 — Konegisa Eigandan)
           SB??  (da confermare)
           M17?? (da confermare)
     M505  M11-10 (Metro Line 11 — Kirifunu Kukubān)
     M506  IR??  (da confermare)
     M507  RK??  (da confermare)
     M509  M714  (Metro Line 7 — Riihisano)
     M510  M15-18 (Metro Line 15 — Eonogi Kōwen)
     M511  HO13  (Honanshū Line — Kadokamahiwa)
     M514  KD39  (Kidai Line — Jisahara, stesso nome)

   Interscambi M502 (1, 31) e M513 (M17??, M7??) da confermare.
================================================================ */
'use strict';

const M5_ST = {
  M501: { n: 'Tsuragoi',                       k: '汐蒲',       nodeId: 123393742, km:  0.00 },
  M502: { n: 'Mundōzan',                        k: '門道山',     nodeId: 304405932, km:  2.36 },
  M503: { n: 'Konegisa Eigandan',               k: '干鮃永玵段', nodeId: 123393753, km:  4.72 },
  M504: { n: 'Jaihonmu 3sa',                    k: '際笨武3沙',  nodeId: 136114107, km:  8.02 },
  M505: { n: 'Kirifunu Kukubān',                k: '礒判國防',   nodeId: 136114106, km: 12.36 },
  M506: { n: 'Sakanemoto',                      k: '沛岬斗',     nodeId: 123393750, km: 17.67 },
  M507: { n: 'Akagae Nosori',                   k: '蛞外見祖里', nodeId: 147984628, km: 24.35 },
  M508: { n: 'Pentorawi Kirifunu',              k: '篇土碪礒判', nodeId: 198159780, km: 32.53 },
  M509: { n: 'Riihisano',                       k: '尾本',       nodeId: 123393747, km: 41.67 },
  M510: { n: 'Eonogi Kōwen',                    k: '',           nodeId: 146814988, km: 52.54 },
  M511: { n: 'Kadokamahiwa',                    k: '',           nodeId: 196658319, km: 64.34 },
  M512: { n: 'Tswikei Daigaku',                 k: '追渓大學',   nodeId: 196658320, km: 77.26 },
  M513: { n: 'Pwakkobe',                        k: '',           nodeId: 196658312, km: 91.07 },
  M514: { n: 'Jisahara',                        k: '治叉榎',     nodeId: 176782928, km: 106.39 },
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
  totalKm:     106.39,   // distanza M501→M514 (da M801)
  avgSpeedKmh: 35,       // stima — linea con spaziatura irregolare
  dwellSec:    30,
};

/* ----------------------------------------------------------------
   Profilo frequenze (da definire — valori provvisori)
---------------------------------------------------------------- */
const M5_HEADWAY = [
  { from: '05:30', to: '07:00', headwayMin: 10 },
  { from: '07:00', to: '09:30', headwayMin:  5 },
  { from: '09:30', to: '17:00', headwayMin:  8 },
  { from: '17:00', to: '20:00', headwayMin:  5 },
  { from: '20:00', to: '22:30', headwayMin:  8 },
  { from: '22:30', to: '24:00', headwayMin: 12 },
];

/* ----------------------------------------------------------------
   Servizi
   A  All-stop (unico servizio per ora)
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

   M501  Tsuragoi
     ↔ SK37 (Seishaku Line) — stesso nome, stesso impianto

   M502  Mundōzan
     ↔ 1??, 31??  — da confermare (codici rete sconosciuta)

   M503  Konegisa Eigandan
     ↔ HO07  (Honanshū Line)
     ↔ M719  (Metro Line 7)
     ↔ SB??  — da confermare
     ↔ M17?? — da confermare

   M505  Kirifunu Kukubān
     ↔ M11-10 (Metro Line 11)

   M506  Sakanemoto
     ↔ IR??  — da confermare

   M507  Akagae Nosori  (Yōdai adae)
     ↔ RK??  — da confermare

   M509  Riihisano
     ↔ M714  (Metro Line 7)

   M510  Eonogi Kōwen
     ↔ M15-18 (Metro Line 15)

   M511  Kadokamahiwa
     ↔ HO13  (Honanshū Line)

   M513  Pwakkobe
     ↔ M17?? — da confermare
     ↔ M7??  — da confermare

   M514  Jisahara
     ↔ KD39  (Kidai Line) — stesso nome, stesso impianto
---------------------------------------------------------------- */
const M5_INTERCHANGE = {
  M501: [
    { code: 'SK37', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Tsuragoi, stesso nome' },
  ],
  M502: [
    // ↔ 1?? e 31?? da confermare
  ],
  M503: [
    { code: 'HO07', network: 'ho',    transferMin: 3,
      note: 'Honanshū Line — Konegisa Eigandan' },
    { code: 'M719', network: 'metro', transferMin: 3,
      note: 'Metro Line 7 — Konegisa Eigandan' },
    // ↔ SB?? e M17?? da confermare
  ],
  M505: [
    { code: 'M11-10', network: 'metro', transferMin: 3,
      note: 'Metro Line 11 — Kirifunu Kukubān' },
  ],
  M506: [
    // ↔ IR?? da confermare
  ],
  M507: [
    // ↔ RK?? da confermare
  ],
  M509: [
    { code: 'M714', network: 'metro', transferMin: 3,
      note: 'Metro Line 7 — Riihisano' },
  ],
  M510: [
    { code: 'M15-18', network: 'metro', transferMin: 3,
      note: 'Metro Line 15 — Eonogi Kōwen' },
  ],
  M511: [
    { code: 'HO13', network: 'ho',    transferMin: 3,
      note: 'Honanshū Line — Kadokamahiwa' },
  ],
  M513: [
    // ↔ M17?? e M7?? da confermare
  ],
  M514: [
    { code: 'KD39', network: 'suburban', transferMin: 3,
      note: 'Kidai Line — Jisahara, stesso nome' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M5_META, M5_ST, M5_CANONICAL_ORDER, M5_HEADWAY, M5_SVC, M5_INTERCHANGE };
}

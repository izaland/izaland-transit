/* ================================================================
   M1-DATA.JS — Metro Line 1 · [Line name TBD]
   ================================================================
   35 stazioni · 47.47 km (provvisorio — spaziatura uniforme)
   Distanza media per intervallo: 47.47 / 34 ≈ 1.396 km

   Ordine canonico geografico: M110 (Alkuitsa, ovest) → M144 (Enikezya Forum, est)

   Interscambi principali:
     M117 Sainðaul Central — R01, E01, K01, AX06, M814, LL01, KD32, SK26, TS13
     M111 Shimamera        — AX05, TS14, M417, M4
     M128 Asaji Torimoshi  — R02, KD20
     M110 Alkuitsa         — CK18, M202
     M143 Shin-Enikezya    — R03
     M142 Enikezya         — SK07
     M130 Hintomaui        — M226
     M119 Kushidaru Amiya  — M406 (Line 4)
     M115 Nimunoðai        — M808 (Line 8)
     M113 Takkurahama      — SK32

   Nota km:
     Progressive da M110 (km 0.0) a M144 (km 47.47).
     Spaziatura uniforme provvisoria ≈ 1.396 km; aggiornare con
     distanze reali appena disponibili.
================================================================ */
'use strict';

const M1_ST = {
  M110: { n: 'Alkuitsa',               k: '潮屺',           km:  0.000 },
  M111: { n: 'Shimamera',              k: '渠瀬田',          km:  1.396 },
  M112: { n: 'Ripeigu',                k: '李平具',          km:  2.793 },
  M113: { n: 'Takkurahama',            k: '琢玖羅島',        km:  4.189 },
  M114: { n: 'Horahama',               k: '稲島',            km:  5.585 },
  M115: { n: 'Nimunoðai',              k: '秩済',            km:  6.982 },
  M116: { n: 'Okoromachi',             k: '',                km:  8.378 },
  M117: { n: 'Sainðaul Central',       k: '作安崎中央',      km:  9.774 },
  M118: { n: 'Masuda Agarai',          k: '馬砅任尭',        km: 11.171 },
  M119: { n: 'Kushidaru Amiya',        k: '柚艏',            km: 12.567 },
  M120: { n: 'Tsumiji',                k: '都巳治',          km: 13.963 },
  M121: { n: 'Upajiya',                k: '袁棲',            km: 15.360 },
  M122: { n: 'Tensari Omuhate',        k: '典河〇蔦',        km: 16.756 },
  M123: { n: 'Tamanoke-Tsunui',        k: '谷坂淡枡',        km: 18.152 },
  M124: { n: 'Oebatsun Resort',        k: '',                km: 19.549 },
  M125: { n: 'Nandamoigon Sumatai',    k: '凬浪社',          km: 20.945 },
  M126: { n: 'Otsunuke 2sa',           k: '',                km: 22.341 },
  M127: { n: 'Shin-Pakkishoi',         k: '',                km: 23.738 },
  M128: { n: 'Asaji Torimoshi',        k: '安佐寺狛篠',      km: 25.134 },
  M129: { n: 'Minotase Kōwen',         k: '蓑村公園',        km: 26.530 },
  M130: { n: 'Hintomaui',              k: '価園斐',          km: 27.927 },
  M131: { n: 'Furukobe',               k: '福絽杷',          km: 29.323 },
  M132: { n: 'Otsumi-Furukobe',        k: '南福絽杷',        km: 30.719 },
  M133: { n: 'Watarui Azenami',        k: '芳聖刈咲',        km: 32.116 },
  M134: { n: 'Watarui',                k: '芳聖',            km: 33.512 },
  M135: { n: 'Shin-Watarui',           k: '新芳聖',          km: 34.908 },
  M136: { n: 'Shinojawi',              k: '櫂枳',            km: 36.305 },
  M137: { n: 'Tomori Dantsi',          k: '土母里團地',      km: 37.701 },
  M138: { n: 'Takawidama',             k: '浚位谷',          km: 39.097 },
  M139: { n: 'Enikezya Sports Park',   k: '盛狩運動公園',    km: 40.494 },
  M140: { n: 'Jiroidan',               k: '治蕾丹',          km: 41.890 },
  M141: { n: 'Akashima Seisan',        k: '蛞渠精参',        km: 43.286 },
  M142: { n: 'Enikezya',               k: '盛狩',            km: 44.683 },
  M143: { n: 'Shin-Enikezya',          k: '新盛狩',          km: 46.079 },
  M144: { n: 'Enikezya Forum',         k: '盛狩ળ૾દપ્',      km: 47.470 },
};

/* Ordine canonico geografico: ovest (Alkuitsa) → est (Enikezya Forum) */
const M1_CANONICAL_ORDER = [
  'M110', 'M111', 'M112', 'M113', 'M114', 'M115', 'M116', 'M117',
  'M118', 'M119', 'M120', 'M121', 'M122', 'M123', 'M124', 'M125',
  'M126', 'M127', 'M128', 'M129', 'M130', 'M131', 'M132', 'M133',
  'M134', 'M135', 'M136', 'M137', 'M138', 'M139', 'M140', 'M141',
  'M142', 'M143', 'M144',
];

/* ----------------------------------------------------------------
   Metadati linea
---------------------------------------------------------------- */
const M1_META = {
  id:          'M1',
  code:        'M1',
  name:        'Line 1',       // nome completo da definire
  nameJa:      '',             // da definire
  color:       '#F77F00',      // arancione
  totalKm:     47.470,
  stations:    35,
  avgSpeedKmh: 42,
  dwellSec:    20,
};

/* ----------------------------------------------------------------
   Profilo frequenze operative (headway in minuti)

   Slot        Da      A       Headway
   ─────────── ─────── ─────── ───────
   early       05:00   06:30   10 min
   pre-peak    06:30   07:00    5 min
   peak AM     07:00   09:30    2 min
   off-peak    09:30   17:00    4 min
   peak PM     17:00   20:00    2 min
   evening     20:00   22:30    5 min
   late        22:30   24:30   10 min
---------------------------------------------------------------- */
const M1_HEADWAY = [
  { from: '05:00', to: '06:30', headwayMin: 10 },
  { from: '06:30', to: '07:00', headwayMin:  5 },
  { from: '07:00', to: '09:30', headwayMin:  2 },
  { from: '09:30', to: '17:00', headwayMin:  4 },
  { from: '17:00', to: '20:00', headwayMin:  2 },
  { from: '20:00', to: '22:30', headwayMin:  5 },
  { from: '22:30', to: '24:30', headwayMin: 10 },
];

/* ----------------------------------------------------------------
   Servizi
   A  All-stop (unico servizio per ora)
   Eventuali servizi rapidi da aggiungere in futuro.
---------------------------------------------------------------- */
const M1_SVC = {
  A: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#F77F00',
    cls:    'svc-A',
    stops:  M1_CANONICAL_ORDER,
  },
};

/* ----------------------------------------------------------------
   Interscambi Metro Line 1 ↔ altre reti

   M110 Alkuitsa
     ↔ CK18 (Kawayatsu Line)   — interscambio in superficie         5 min
     ↔ M202 (Line 2)           — stesso edificio, banchine separate  3 min

   M111 Shimamera
     ↔ AX05 (Airport Express)  — Shimamera, piano -1/0              5 min
     ↔ TS14 (Tandan-Senpyan)   — stesso nome, uscita condivisa      4 min
     ↔ M417 (Line 4)           — Shimamera, corridoio sotterraneo   5 min

   M113 Takkurahama
     ↔ SK32 (Seishaku Line)    — stesso nome, banchine adiacenti    3 min

   M115 Nimunoðai
     ↔ M808 (Line 8)           — stesso nome, banchine separate     3 min

   M117 Sainðaul Central  ← HUB PRINCIPALE
     ↔ R01  (IZX Ryānkai)      — Niji-Sainðaul / Sainðaul           5 min
     ↔ E01  (IZX Eira)         — Sainðaul Eira                      5 min
     ↔ K01  (IZX Keishin)      — Sainðaul Keishin                   5 min
     ↔ AX06 (Airport Express)  — Sainðaul Central AX                3 min
     ↔ M814 (Line 8)           — Sainðaul Central M8                2 min
     ↔ LL01 (Loop Line)        — Sainðaul Central LL                3 min
     ↔ KD32 (Kidai Line)       — Sainðaul Central Kidai             4 min
     ↔ SK26 (Seishaku Line)    — Sainðaul Central SK                4 min
     ↔ TS13 (Tandan-Senpyan)   — Sainðaul Central TS                4 min

   M119 Kushidaru Amiya
     ↔ M406 (Line 4)           — stesso nome, corridoio sotterraneo  3 min

   M128 Asaji Torimoshi
     ↔ R02  (IZX Ryānkai)      — Asaji Torimoshi IZX               10 min
     ↔ KD20 (Kidai Line)       — Asaji Torimoshi Kidai               5 min

   M130 Hintomaui
     ↔ M226 (Line 2)           — stesso nome, banchine separate      3 min

   M142 Enikezya
     ↔ SK07 (Seishaku Line)    — stesso nome, banchine adiacenti    3 min

   M143 Shin-Enikezya
     ↔ R03  (IZX Ryānkai)      — Shin-Enikezya IZX                  8 min
---------------------------------------------------------------- */
const M1_INTERCHANGE = {
  M110: [
    { code: 'CK18', network: 'suburban', transferMin: 5,
      note: 'Kawayatsu Line — Alkuitsa, interscambio in superficie' },
    { code: 'M202', network: 'metro',    transferMin: 3,
      note: 'M2 Alkuitsa — stesso edificio, banchine separate' },
  ],
  M111: [
    { code: 'AX05', network: 'ax',       transferMin: 5,
      note: 'Airport Express — Shimamera, piano -1/0' },
    { code: 'TS14', network: 'suburban', transferMin: 4,
      note: 'Tandan-Senpyan — Shimamera, uscita condivisa' },
    { code: 'M417', network: 'metro',    transferMin: 5,
      note: 'M4 Shimamera — corridoio sotterraneo 300 m' },
  ],
  M113: [
    { code: 'SK32', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Takkurahama, banchine adiacenti' },
  ],
  M115: [
    { code: 'M808', network: 'metro',    transferMin: 3,
      note: 'M8 Nimunoðai — banchine separate' },
  ],
  M117: [
    { code: 'R01',  network: 'izx',      transferMin: 5,
      note: 'IZX Ryānkai — Sainðaul Central' },
    { code: 'E01',  network: 'izx',      transferMin: 5,
      note: 'IZX Eira — Sainðaul Central' },
    { code: 'K01',  network: 'izx',      transferMin: 5,
      note: 'IZX Keishin — Sainðaul Central' },
    { code: 'AX06', network: 'ax',       transferMin: 3,
      note: 'Airport Express — Sainðaul Central AX' },
    { code: 'M814', network: 'metro',    transferMin: 2,
      note: 'M8 Sainðaul Central — banchine separate' },
    { code: 'LL01', network: 'suburban', transferMin: 3,
      note: 'Loop Line — Sainðaul Central' },
    { code: 'KD32', network: 'suburban', transferMin: 4,
      note: 'Kidai Line — Sainðaul Central' },
    { code: 'SK26', network: 'suburban', transferMin: 4,
      note: 'Seishaku Line — Sainðaul Central' },
    { code: 'TS13', network: 'suburban', transferMin: 4,
      note: 'Tandan-Senpyan — Sainðaul Central TS' },
  ],
  M119: [
    { code: 'M406', network: 'metro',    transferMin: 3,
      note: 'M4 Kushidaru Amiya — corridoio sotterraneo' },
  ],
  M128: [
    { code: 'R02',  network: 'izx',      transferMin: 10,
      note: 'IZX Ryānkai — Asaji Torimoshi, walkable uscita nord' },
    { code: 'KD20', network: 'suburban', transferMin: 5,
      note: 'Kidai Line — Asaji Torimoshi' },
  ],
  M130: [
    { code: 'M226', network: 'metro',    transferMin: 3,
      note: 'M2 Hintomaui — banchine separate' },
  ],
  M142: [
    { code: 'SK07', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Enikezya, banchine adiacenti' },
  ],
  M143: [
    { code: 'R03',  network: 'izx',      transferMin: 8,
      note: 'IZX Ryānkai — Shin-Enikezya, walkable uscita ovest' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M1_META, M1_ST, M1_CANONICAL_ORDER, M1_HEADWAY, M1_SVC, M1_INTERCHANGE };
}

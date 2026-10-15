/* ================================================================
   M12-DATA.JS — Metro Line 12 (#86ebeb) · metro automatica leggera
   ================================================================
   19 stazioni · 22.33 km
   Capolinea: Nihkyonta Mirai (M1201) ↔ Mewakate Kippai (M1219)

   Il tracciato proprio della linea va da Yeisonzuta (M1204) a
   Mewakate Kippai (M1219). Da M1201 a M1204 condivide il tracciato con M9
   (M904–M907). Metà delle corse fanno M1201→M1219 (servizio A),
   l'altra metà solo M1204→M1219 (servizio B).

   Interscambi:
     M1201 Nihkyonta Mirai   ↔ M904
     M1202 Kushihama         ↔ M905
     M1203 Hadantoyo         ↔ M906
     M1204 Yeisonzuta        ↔ M907
     M1207 Yuparaul          ↔ SK31
     M1208 Yauraki           ↔ M809
     M1209 Tahnakusa         ↔ M813
     M1210 Aketsue           ↔ LL19, SK27
     M1211 Ōbakura           ↔ M1415, LL18
     M1212 Herubori          ↔ M327, LL17, SHX01
     M1214 Intsushitsa Kuyakujo ↔ M330
     M1216 Tanjānli          ↔ M1420
================================================================ */
'use strict';

const M12_ST = {
  M1201: { n: 'Nihkyonta Mirai',   k: '濱角未來',   nodeId: 369511437, km:  0.00 },
  M1202: { n: 'Kushihama',         k: '柚島',       nodeId: 450978442, km:  1.07 },
  M1203: { n: 'Hadantoyo',         k: '琦砂',       nodeId: 368583213, km:  2.01 },
  M1204: { n: 'Yeisonzuta',        k: '八砅',       nodeId: 369511438, km:  2.90 },
  M1205: { n: 'Sahnaden',          k: '舶取',       nodeId: 369511451, km:  3.90 },
  M1206: { n: 'NOVA Rinkai',       k: 'NOVA臨海',  nodeId: 369511452, km:  4.77 },
  M1207: { n: 'Yuparaul',          k: '枕崎',       nodeId: 368583225, km:  5.97 },
  M1208: { n: 'Yauraki',           k: '葯洛',       nodeId: 229641680, km:  7.72 },
  M1209: { n: 'Tahnakusa',         k: '',           nodeId: 148428068, km:  9.13 },
  M1210: { n: 'Aketsue',           k: '薫都衛',   nodeId: 124066086, km:  9.76 },
  M1211: { n: 'Ōbakura',           k: '大砌',       nodeId: 124066085, km: 10.72 },
  M1212: { n: 'Herubori',          k: '杏登',       nodeId: 124066084, km: 11.57 },
  M1213: { n: 'Ominotori Hasenoki', k: '',          nodeId: 262195160, km: 13.06 },
  M1214: { n: 'Intsushitsa Kuyakujo', k: '',        nodeId: 183370161, km: 14.30 },
  M1215: { n: 'Nworisahta',        k: '',           nodeId: 183370173, km: 16.33 },
  M1216: { n: 'Tanjānli',          k: '丹庄里',     nodeId: 183370166, km: 17.49 },
  M1217: { n: 'Shiki-Kubodanki',   k: '',           nodeId: 262194821, km: 19.07 },
  M1218: { n: 'Kubodanki',         k: '',           nodeId: 262194820, km: 20.75 },
  M1219: { n: 'Mewakate Kippai',   k: '',           nodeId: 183370188, km: 22.33 },
};

/* Ordine canonico geografico: M1201 → M1219 */
const M12_CANONICAL_ORDER = [
  'M1201', 'M1202', 'M1203', 'M1204', 'M1205',
  'M1206', 'M1207', 'M1208', 'M1209', 'M1210',
  'M1211', 'M1212', 'M1213', 'M1214', 'M1215',
  'M1216', 'M1217', 'M1218', 'M1219',
];

/* Tratta propria (servizio B): M1204 → M1219 */
const M12_OWN_TRACK_ORDER = M12_CANONICAL_ORDER.slice(3);

const M12_META = {
  id:          'M12',
  code:        'M12',
  name:        'Line 12',
  nameJa:      '',
  color:       '#86ebeb',
  totalKm:     22.33,
  stations:    19,
  avgSpeedKmh: 30,   // provvisorio: metro automatica leggera (come M11)
  dwellSec:    30,   // provvisorio
};

/* ----------------------------------------------------------------
   Frequenza COMPLESSIVA sulla tratta comune M1204–M1219 (A + B)

   Fascia            Da     A      tph  headway
   morbida AM        04:50  06:00    8  7.5 min
   normale           06:00  07:15   12  5 min
   punta AM          07:15  09:30   30  2 min
   normale           09:30  17:50   12  5 min
   punta PM          17:50  20:30   20  3 min
   normale           20:30  23:20   12  5 min
   morbida PM        23:20  24:10    8  7.5 min

   Ogni servizio (A e B) fa metà delle corse: il suo headway
   è il doppio di quello complessivo (vedi M12_HEADWAY).
---------------------------------------------------------------- */
const M12_HEADWAY = [
  { from: '04:50', to: '06:00', headwayMin: 15 },
  { from: '06:00', to: '07:15', headwayMin: 10 },
  { from: '07:15', to: '09:30', headwayMin:  4 },
  { from: '09:30', to: '17:50', headwayMin: 10 },
  { from: '17:50', to: '20:30', headwayMin:  6 },
  { from: '20:30', to: '23:20', headwayMin: 10 },
  { from: '23:20', to: '24:10', headwayMin: 15 },
];

const M12_SVC = {
  A: {
    name:   'Full run',
    nameJa: '',
    color:  '#86ebeb',
    cls:    'svc-A',
    stops:  M12_CANONICAL_ORDER,
  },
  B: {
    name:   'Own track only',
    nameJa: '',
    color:  '#86ebeb',
    cls:    'svc-B',
    stops:  M12_OWN_TRACK_ORDER,
  },
};

const M12_INTERCHANGE = {
  M1201: [
    { code: 'M904', network: 'metro', transferMin: 3,
      note: 'M904 Nihkyonta Mirai' }
  ],
  M1202: [
    { code: 'M905', network: 'metro', transferMin: 3,
      note: 'M905 Kushihama' }
  ],
  M1203: [
    { code: 'M906', network: 'metro', transferMin: 3,
      note: 'M906 Hadantoyo' }
  ],
  M1204: [
    { code: 'M907', network: 'metro', transferMin: 3,
      note: 'M907 Yeisonzuta' }
  ],
  M1207: [
    { code: 'SK31', network: 'suburban', transferMin: 3,
      note: 'SK31 Yuparaul' }
  ],
  M1208: [
    { code: 'M809', network: 'metro', transferMin: 3,
      note: 'M809 Yauraki' }
  ],
  M1209: [
    { code: 'M813', network: 'metro', transferMin: 3,
      note: 'M813 Tahnakusa' }
  ],
  M1210: [
    { code: 'LL19', network: 'suburban', transferMin: 3,
      note: 'LL19 Aketsue' },
    { code: 'SK27', network: 'suburban', transferMin: 3,
      note: 'SK27 Aketsue' }
  ],
  M1211: [
    { code: 'M1415', network: 'metro', transferMin: 3,
      note: 'M1415 Ōbakura' },
    { code: 'LL18', network: 'suburban', transferMin: 3,
      note: 'LL18 Ōbakura' }
  ],
  M1212: [
    { code: 'M327', network: 'metro', transferMin: 3,
      note: 'M327 Herubori' },
    { code: 'LL17', network: 'suburban', transferMin: 3,
      note: 'LL17 Herubori' },
    { code: 'SHX01', network: 'suburban', transferMin: 3,
      note: 'SHX01 Herubori' }
  ],
  M1214: [
    { code: 'M330', network: 'metro', transferMin: 3,
      note: 'M330 Intsushitsa Kuyakujo' }
  ],
  M1216: [
    { code: 'M1420', network: 'metro', transferMin: 3,
      note: 'M1420 Tanjānli' }
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M12_META, M12_ST, M12_CANONICAL_ORDER, M12_OWN_TRACK_ORDER, M12_HEADWAY, M12_SVC, M12_INTERCHANGE };
}

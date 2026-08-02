/* ================================================================
   M11-DATA.JS — Metro Line 11 (Verde / 緑)
   ================================================================
   20 stazioni · 23.32 km
   Capolinea: Itsayuki Tonjo (M1101) ↔ Jisahara (M1120)

   Interscambi notevoli:
     M1106 Takatsura       ↔ HO01
     M1107 Rismyonjen      ↔ CK13, TS17
     M1110 Ipporai-Owonideki ↔ M424 (M4)
     M1112 Kirifunu Kukubān ↔ M505 (M5)
     M1113 Ushiuruma       ↔ M7?? (TODO — codice da confermare)
     M1114 Ðwaishon Tekkapi ↔ HO09
     M1115 Bajikoe Canal Kŏwen ↔ M1503 (M15)
     M1116 Shutazai        ↔ TS20, M704 (M7), M16?? (TODO)
     M1120 Jisahara        ↔ KD39, M514 (M5)
================================================================ */
'use strict';

const M11_ST = {
  M1101: { n: 'Itsayuki Tonjo',              k: '',             nodeId: 147457618, km:  0.00 },
  M1102: { n: 'Onpakki Village',             k: '',             nodeId: 214843616, km:  1.32 },
  M1103: { n: 'Amajakashi',                  k: '',             nodeId: 136187242, km:  2.29 },
  M1104: { n: 'Chetonuku',                   k: '',             nodeId: 136187243, km:  4.00 },
  M1105: { n: 'Sagaisana 2-sa',              k: '',             nodeId: 136187244, km:  5.16 },
  M1106: { n: 'Takatsura',                   k: '浚鶴',           nodeId: 136187245, km:  6.57 },
  M1107: { n: 'Rismyonjen',                  k: '',             nodeId: 136187246, km:  7.71 },
  M1108: { n: 'Owonideki Zawahan',           k: '吹取--',         nodeId: 136187247, km:  8.61 },
  M1109: { n: 'Bubaijaka',                   k: '',             nodeId: 136187248, km:  9.24 },
  M1110: { n: 'Ipporai-Owonideki',           k: '一蒲崍吹取',       nodeId: 274155028, km: 10.01 },
  M1111: { n: 'Ipporai-Enhadan (Kunagushi)', k: '一蒲崍縁閘（九那柚）', nodeId: 146813998, km: 10.90 },
  M1112: { n: 'Kirifunu Kukubān',            k: '磯判國防',         nodeId: 136114106, km: 11.84 },
  M1113: { n: 'Ushiuruma',                   k: '',             nodeId: 123393751, km: 13.01 },
  M1114: { n: 'Ðwaishon Tekkapi',             k: '',             nodeId: 136187241, km: 14.20 },
  M1115: { n: 'Bajikoe Canal Kŏwen',         k: '桐塚公園',         nodeId: 146814220, km: 15.78 },
  M1116: { n: 'Shutazai',                    k: '守多彩',           nodeId: 136187238, km: 17.48 },
  M1117: { n: 'Shobeikana Rihasai',          k: '',             nodeId: 196658311, km: 18.45 },
  M1118: { n: 'Futteskaiba',                 k: '',             nodeId: 176789173, km: 19.29 },
  M1119: { n: 'Shiki-Jisahara',              k: '北治叉榳',           nodeId: 176782927, km: 22.00 },
  M1120: { n: 'Jisahara',                    k: '治叉榳',             nodeId: 176782928, km: 23.32 },
};

/* Ordine canonico geografico: M1101 → M1120 */
const M11_CANONICAL_ORDER = [
  'M1101', 'M1102', 'M1103', 'M1104', 'M1105',
  'M1106', 'M1107', 'M1108', 'M1109', 'M1110',
  'M1111', 'M1112', 'M1113', 'M1114', 'M1115',
  'M1116', 'M1117', 'M1118', 'M1119', 'M1120',
];

/* ----------------------------------------------------------------
   Metadati linea
---------------------------------------------------------------- */
const M11_META = {
  id:          'M11',
  code:        'M11',
  name:        'Line 11',
  nameJa:      '',
  color:       '#c5e1a5',   // verde chiaro
  totalKm:     23.32,
  stations:    20,
  avgSpeedKmh: 30,
  dwellSec:    30,
};

/* ----------------------------------------------------------------
   Profilo frequenze operative (headway in minuti)
---------------------------------------------------------------- */
const M11_HEADWAY = [
  { from: '05:00', to: '06:30', headwayMin: 10 },
  { from: '06:30', to: '07:00', headwayMin:  5 },
  { from: '07:00', to: '09:30', headwayMin:  3 },
  { from: '09:30', to: '17:00', headwayMin:  5 },
  { from: '17:00', to: '20:00', headwayMin:  3 },
  { from: '20:00', to: '22:30', headwayMin:  5 },
  { from: '22:30', to: '24:30', headwayMin: 10 },
];

/* ----------------------------------------------------------------
   Servizi
   B  All-stop (unico servizio)
---------------------------------------------------------------- */
const M11_SVC = {
  B: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#c5e1a5',
    cls:    'svc-B',
    stops:  M11_CANONICAL_ORDER,
  },
};

/* ----------------------------------------------------------------
   Interscambi Metro Line 11 ↔ altre reti
---------------------------------------------------------------- */
const M11_INTERCHANGE = {
  M1106: [
    { code: 'HO01', network: 'ho', transferMin: 3,
      note: 'HO01 Takatsura' },
  ],
  M1107: [
    { code: 'CK13', network: 'ck', transferMin: 3,
      note: 'CK13 Rismyonjen' },
    { code: 'TS17', network: 'ts', transferMin: 3,
      note: 'TS17 Rismyonjen' },
  ],
  M1110: [
    { code: 'M424', network: 'metro', transferMin: 3,
      note: 'M4 Ipporai-Owonideki — banchine adiacenti' },
  ],
  M1112: [
    { code: 'M505', network: 'metro', transferMin: 3,
      note: 'M5 Kirifunu Kukubān — stesso nome' },
  ],
  M1113: [
    // TODO: codice M7 da confermare
    { code: 'M7??', network: 'metro', transferMin: 3,
      note: 'M7 Ushiuruma — codice da confermare' },
  ],
  M1114: [
    { code: 'HO09', network: 'ho', transferMin: 3,
      note: 'HO09 Ðwaishon Tekkapi' },
  ],
  M1115: [
    { code: 'M1503', network: 'metro', transferMin: 3,
      note: 'M15 Bajikoe Canal Kŏwen' },
  ],
  M1116: [
    { code: 'TS20', network: 'ts', transferMin: 3,
      note: 'TS20 Shutazai' },
    { code: 'M704', network: 'metro', transferMin: 3,
      note: 'M7 Shutazai — stesso nome' },
    // TODO: codice M16 da confermare
    { code: 'M16??', network: 'metro', transferMin: 3,
      note: 'M16 Shutazai — codice da confermare' },
  ],
  M1120: [
    { code: 'KD39', network: 'suburban', transferMin: 3,
      note: 'Kidai Line KD39 Jisahara' },
    { code: 'M514', network: 'metro', transferMin: 3,
      note: 'M5 Jisahara — stesso nome' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M11_META, M11_ST, M11_CANONICAL_ORDER, M11_HEADWAY, M11_SVC, M11_INTERCHANGE };
}

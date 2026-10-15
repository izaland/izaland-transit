/* ================================================================
   M14-DATA.JS — Metro Line 14 (#72E400)
   ================================================================
   20 stazioni · 22.58 km · metro pesante (40 km/h commerciali, sosta 20 s)
   Capolinea: Migawarae (M1401) ↔ Tanjānli (M1420)

   Interscambi notevoli:
     M1401 Migawarae       ↔ KS16
     M1402 Otsunuke 2sa    ↔ M126 (M1)
     M1406 Isenebo         ↔ LL08
     M1409 Upajiya         ↔ M121 (M1)
     M1410 Jufurai         ↔ M818 (M8)
     M1411 Aguri 2-sa      ↔ M404 (M4)
     M1412 Rosemane        ↔ M324 (M3), JD02
     M1413 Masuda Agarai   ↔ M118 (M1), M325 (M3), M913 (M9)
     M1414 Kansāri         ↔ M326 (M3), M1016 (M10)
     M1415 Ōbakura         ↔ LL18
     M1417 Yunpotsai Soisuma ↔ M329 (M3)
================================================================ */
'use strict';

const M14_ST = {
  M1401: { n: 'Migawarae', k: '', nodeId: 124066185, km:  0.00 },
  M1402: { n: 'Otsunuke 2sa', k: '', nodeId: 124295246, km:  1.41 },
  M1403: { n: 'Tsarawari', k: '', nodeId: 124295245, km:  2.50 },
  M1404: { n: 'Shichirupas', k: '四池流発', nodeId: 124295244, km:  3.45 },
  M1405: { n: 'Kadewara', k: '', nodeId: 124295243, km:  4.53 },
  M1406: { n: 'Isenebo', k: '床踔', nodeId: 124295242, km:  5.60 },
  M1407: { n: 'Ominotori Shikusa', k: '天狛四彫', nodeId: 124295241, km:  6.73 },
  M1408: { n: 'Shotsumaichi', k: '', nodeId: 124295240, km:  7.91 },
  M1409: { n: 'Upajiya', k: '袁棲', nodeId: 124295239, km:  9.45 },
  M1410: { n: 'Jufurai', k: '朱布来', nodeId: 135876986, km: 10.93 },
  M1411: { n: 'Aguri 2-sa', k: '阿久里二沙', nodeId: 183340984, km: 12.49 },
  M1412: { n: 'Rosemane', k: '酢丘', nodeId: 146642920, km: 13.26 },
  M1413: { n: 'Masuda Agarai', k: '馬砅任尭', nodeId: 128669528, km: 14.23 },
  M1414: { n: 'Kansāri', k: '官川', nodeId: 128525371, km: 14.92 },
  M1415: { n: 'Ōbakura', k: '大砌', nodeId: 124066085, km: 16.39 },
  M1416: { n: 'Sainðaul National University', k: '安作崎國立大學', nodeId: 183370195, km: 17.26 },
  M1417: { n: 'Yunpotsai Soisuma', k: '', nodeId: 183370162, km: 18.85 },
  M1418: { n: 'Patoshintsa', k: '岩爪', nodeId: 183370159, km: 20.58 },
  M1419: { n: 'Powanuki', k: '', nodeId: 183370165, km: 21.65 },
  M1420: { n: 'Tanjānli', k: '丹庄里', nodeId: 183370166, km: 22.58 },
};

/* Ordine canonico geografico: M1401 → M1420 */
const M14_CANONICAL_ORDER = [
  'M1401', 'M1402', 'M1403', 'M1404', 'M1405',
  'M1406', 'M1407', 'M1408', 'M1409', 'M1410',
  'M1411', 'M1412', 'M1413', 'M1414', 'M1415',
  'M1416', 'M1417', 'M1418', 'M1419', 'M1420',
];

const M14_META = {
  id:          'M14',
  code:        'M14',
  name:        'Line 14',
  nameJa:      '',
  color:       '#72E400',
  totalKm:     22.58,
  stations:    20,
  avgSpeedKmh: 40,   // metro pesante
  dwellSec:    20,
};

/* TODO: headway provvisorio (copiato da M11) — da confermare */
const M14_HEADWAY = [
  { from: '05:00', to: '06:30', headwayMin: 10 },
  { from: '06:30', to: '07:00', headwayMin:  5 },
  { from: '07:00', to: '09:30', headwayMin:  3 },
  { from: '09:30', to: '17:00', headwayMin:  5 },
  { from: '17:00', to: '20:00', headwayMin:  3 },
  { from: '20:00', to: '22:30', headwayMin:  5 },
  { from: '22:30', to: '24:30', headwayMin: 10 },
];

const M14_SVC = {
  B: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#72E400',
    cls:    'svc-B',
    stops:  M14_CANONICAL_ORDER,
  },
};

const M14_INTERCHANGE = {
  M1401: [
    { code: 'KS16', network: 'suburban', transferMin: 3,
      note: 'KS16 Migawarae' }
  ],
  M1402: [
    { code: 'M126', network: 'metro', transferMin: 3,
      note: 'M126 Otsunuke 2sa' }
  ],
  M1406: [
    { code: 'LL08', network: 'suburban', transferMin: 3,
      note: 'LL08 Isenebo' }
  ],
  M1409: [
    { code: 'M121', network: 'metro', transferMin: 3,
      note: 'M121 Upajiya' }
  ],
  M1410: [
    { code: 'M818', network: 'metro', transferMin: 3,
      note: 'M818 Jufurai' }
  ],
  M1411: [
    { code: 'M404', network: 'metro', transferMin: 3,
      note: 'M404 Aguri 2-sa' }
  ],
  M1412: [
    { code: 'M324', network: 'metro', transferMin: 3,
      note: 'M324 Rosemane' },
    { code: 'JD02', network: 'suburban', transferMin: 3,
      note: 'JD02 Rosemane' }
  ],
  M1413: [
    { code: 'M118', network: 'metro', transferMin: 3,
      note: 'M118 Masuda Agarai' },
    { code: 'M325', network: 'metro', transferMin: 3,
      note: 'M325 Masuda Agarai' },
    { code: 'M913', network: 'metro', transferMin: 3,
      note: 'M913 Masuda Agarai' }
  ],
  M1414: [
    { code: 'M326', network: 'metro', transferMin: 3,
      note: 'M326 Kansāri' },
    { code: 'M1016', network: 'metro', transferMin: 3,
      note: 'M1016 Kansāri' }
  ],
  M1415: [
    { code: 'LL18', network: 'suburban', transferMin: 3,
      note: 'LL18 Ōbakura' }
  ],
  M1417: [
    { code: 'M329', network: 'metro', transferMin: 3,
      note: 'M329 Yunpotsai Soisuma' }
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M14_META, M14_ST, M14_CANONICAL_ORDER, M14_HEADWAY, M14_SVC, M14_INTERCHANGE };
}

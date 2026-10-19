/* ================================================================
   M9-DATA.JS — Metro Line 9
   ================================================================
   21 stazioni · M901 Kishagoi - Exhibitown → M921 Shōryan Daishi
   Colore: #C40062
   Distanze progressive da M901 (km 0.00), totale 21.63 km.

   Interscambi:
     M901  M801, M1719, KW00    (Kishagoi - Exhibitown)
     M904  M418, M611, SK34, TS15, CK17   (Nihkyonta, node 368583226, 7 min a piedi)
     M905  M1202                (Kushihama)
     M906  M1203                (Hadantoyo)
     M907  M1204                (Yeisonzuta)
     M908  M113                 (Takkurahama)
     M910  M807                 (Awasada)
     M911  M1014                (Kanbata)
     M912  M208, M815           (Egunsen Botanical Garden)
     M913  M118, M325, M1413, M209 (Masuda Agarai; M209 = node 145681683, 5 min a piedi)
     M914  M1018, SHX02         (Eigan-ji)
     M915  LL16                 (Oiseharu, 2 min a piedi)
     M916  LL14, CO12           (Tomiganei)
     M918  M331                 (Shin-Tsaikikori)
================================================================ */
'use strict';

const M9_ST = {
  M901: { n: 'Kishagoi - Exhibitown',     k: '喜舎拘',              nodeId: 169508181, km:  0.00 },
  M902: { n: 'Shin-Tsumasui',             k: '新都馬水',            nodeId: 368583211, km:  0.98 },
  M903: { n: 'Hakanba Shinkō',           k: '材場新港',            nodeId: 368583212, km:  2.14 },
  M904: { n: 'Nihkyonta Mirai',           k: '濱角未來',            nodeId: 369511437, km:  3.18 },
  M905: { n: 'Kushihama',                 k: '柚島',                nodeId: 450978442, km:  4.13 },
  M906: { n: 'Hadantoyo',                 k: '琦砂',                nodeId: 368583213, km:  5.07 },
  M907: { n: 'Yeisonzuta',                k: '八禅',                nodeId: 369511438, km:  6.00 },
  M908: { n: 'Takkurahama',               k: '琢玖羅島',            nodeId: 368744269, km:  7.02 },
  M909: { n: 'Teyomuka',                  k: '',                    nodeId: 135874133, km:  7.85 },
  M910: { n: 'Awasada',                   k: '邊褒',                nodeId: 129227940, km:  9.06 },
  M911: { n: 'Kanbata',                   k: '巻岩',                nodeId: 177044015, km: 10.38 },
  M912: { n: 'Egunsen Botanical Garden',  k: '慧群仙植物園',        nodeId: 128525299, km: 11.69 },
  M913: { n: 'Masuda Agarai',             k: '馬砂任尭',            nodeId: 128669528, km: 12.66 },
  M914: { n: 'Eigan-ji',                  k: '栄鳳寺',              nodeId: 128669527, km: 13.92 },
  M915: { n: 'Oiseharu (Metro)',          k: '粕墾[地下鐵]',        nodeId: 176668162, km: 15.16 },
  M916: { n: 'Tomiganei',                 k: '庭ヶ汢',              nodeId: 124066081, km: 16.76 },
  M917: { n: 'Tsurunara',                 k: '守治',                nodeId: 229641679, km: 17.45 },
  M918: { n: 'Shin-Tsaikikori',           k: '新益飯',              nodeId: 183370160, km: 18.39 },
  M919: { n: 'Wasehai-Nuhajori',          k: '伯拝鋤恵',            nodeId: 201033001, km: 19.74 },
  M920: { n: 'Matori Nanmun',             k: '馬狀南門',            nodeId: 201033000, km: 20.65 },
  M921: { n: 'Shōryan Daishi',           k: '宵良大師',            nodeId: 201033004, km: 21.63 },
};

/* Ordine canonico: M901 → M921 */
const M9_CANONICAL_ORDER = Object.keys(M9_ST);

const M9_META = {
  id:          'M9',
  code:        'M9',
  name:        'Line 9',
  nameJa:      '9号線',
  color:       '#C40062',
  totalKm:     21.63,
  avgSpeedKmh: 35,
  dwellSec:    30,
};

/* Frequenze operative (per direzione)
   10 TPH = 6 min · 12 TPH = 5 min · 20 TPH = 3 min */
const M9_HEADWAY = [
  { from: '05:00', to: '06:00', headwayMin: 6 },
  { from: '06:00', to: '07:30', headwayMin: 5 },
  { from: '07:30', to: '09:00', headwayMin: 3 },
  { from: '09:00', to: '10:00', headwayMin: 5 },
  { from: '10:00', to: '17:30', headwayMin: 6 },
  { from: '17:30', to: '18:30', headwayMin: 5 },
  { from: '18:30', to: '20:00', headwayMin: 3 },
  { from: '20:00', to: '21:00', headwayMin: 5 },
  { from: '21:00', to: '23:54', headwayMin: 6 },
];

const M9_SVC = {
  A: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#C40062',
    cls:    'svc-A',
    stops:  M9_CANONICAL_ORDER,
  },
};

const M9_INTERCHANGE = {
  M901: [
    { code: 'M801', network: 'metro',    transferMin: 3,
      note: 'M8 Kishagoi-Exhibitown — stessa stazione' },
    { code: 'KW00', network: 'suburban', transferMin: 3,
      note: 'KW Kishagoi - Exhibitown — stessa stazione' },
    { code: 'M1719', network: 'metro',   transferMin: 3,
      note: 'M17 Kishagoi - Exhibitown — stessa stazione' },
  ],
  M904: [
    { code: 'M418', network: 'metro',    transferMin: 7,
      note: 'M4 Nihkyonta — 7 min a piedi (node 368583226)' },
    { code: 'M611', network: 'metro',    transferMin: 7,
      note: 'M6 Nihkyonta — 7 min a piedi (node 368583226)' },
    { code: 'SK34', network: 'suburban', transferMin: 7,
      note: 'Seishaku Line Nihkyonta — 7 min a piedi (node 368583226)' },
    { code: 'TS15', network: 'suburban', transferMin: 7,
      note: 'Tandan-Senpyan Nihkyonta — 7 min a piedi (node 368583226)' },
    { code: 'CK17', network: 'suburban', transferMin: 7,
      note: 'Nihkyonta — 7 min a piedi (node 368583226)' },
  ],
  M905: [
    { code: 'M1202', network: 'metro',   transferMin: 3,
      note: 'M12 Kushihama — stessa stazione' },
  ],
  M906: [
    { code: 'M1203', network: 'metro',   transferMin: 3,
      note: 'M12 Hadantoyo — stessa stazione' },
  ],
  M907: [
    { code: 'M1204', network: 'metro',   transferMin: 3,
      note: 'M12 Yeisonzuta — stessa stazione' },
  ],
  M908: [
    { code: 'M113', network: 'metro',    transferMin: 3,
      note: 'M1 Takkurahama — stesso nome' },
  ],
  M910: [
    { code: 'M807', network: 'metro',    transferMin: 3,
      note: 'M8 Awasada — stesso nome' },
  ],
  M911: [
    { code: 'M1014', network: 'metro',   transferMin: 3,
      note: 'M10 Kanbata — stesso nome' },
  ],
  M912: [
    { code: 'M208', network: 'metro',    transferMin: 3,
      note: 'M2 Egunsen Botanical Garden — stesso nome' },
    { code: 'M815', network: 'metro',    transferMin: 3,
      note: 'M8 Egunsen Botanical Garden — stesso nome' },
  ],
  M913: [
    { code: 'M118',  network: 'metro',   transferMin: 6,
      note: 'M1 Masuda Agarai — corridoio sotterraneo' },
    { code: 'M325',  network: 'metro',   transferMin: 4,
      note: 'M3 Masuda Agarai' },
    { code: 'M1413', network: 'metro',   transferMin: 3,
      note: 'M14 Masuda Agarai' },
    { code: 'M209',  network: 'metro',   transferMin: 5,
      note: 'M2 Masuda Hibaru — 5 min a piedi (node 145681683)' },
  ],
  M914: [
    { code: 'M1018', network: 'metro',   transferMin: 3,
      note: 'M10 Eigan-ji — stesso nome' },
    { code: 'SHX02', network: 'other',    transferMin: 3,
      note: 'Shubaru Express Eigan-ji — stesso nome' },
  ],
  M915: [
    { code: 'LL16', network: 'suburban', transferMin: 2,
      note: 'Loop Line Oiseharu — 2 min a piedi' },
  ],
  M916: [
    { code: 'LL14', network: 'suburban', transferMin: 3,
      note: 'Loop Line Tomiganei — stesso nome' },
    { code: 'CO12', network: 'suburban', transferMin: 3,
      note: 'Tomiganei — stesso nome' },
  ],
  M918: [
    { code: 'M331', network: 'metro',    transferMin: 3,
      note: 'M3 Shin-Tsaikikori — stesso nome' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M9_META, M9_ST, M9_CANONICAL_ORDER, M9_HEADWAY, M9_SVC, M9_INTERCHANGE };
}

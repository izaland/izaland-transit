/* ================================================================
   CO-DATA.JS — Chikaoi Line
   ================================================================
   Capolinea: CO01 Oitsura ↔ CO41 Chikawari
   58.32 km · 41 stazioni (CO01–CO41)

   Servizi (formato ri-data.js / ks-data.js):
     CO1  Local  CO01 ↔ CO41  tutte le fermate

   TODO: servizi, prima/ultima corsa, fasce di punta e headway sono
         PROVVISORI (copiati dallo schema RI), da sostituire con i dati reali.
   TODO: nameJa, kanji mancanti (CO02, CO04, CO25, CO38).
   TODO: interscambi reciproci in suburban-data.js.
   TODO: CO28–CO32 coincidono con RI05–RI01 (Eikunna, Tsurunarikki,
         Tsaibako, Shin-Tsuruna, Riimibaiken): aggiungere RI↔CO.
================================================================ */
'use strict';

const CO_SERVICES = [
  {
    id: 'CO1', desc: 'Local', fromCode: 'CO01', toCode: 'CO41',
    headway: 15, stops: [],
    firstDep: '05:00', lastDep: '23:30',
    peakWindows: [
      { from: '07:00', to: '09:30', headway: 10 },
      { from: '17:00', to: '20:00', headway: 10 },
    ],
  },
  {
    id: 'CO1', desc: 'Local', fromCode: 'CO41', toCode: 'CO01',
    headway: 15, stops: [],
    firstDep: '05:00', lastDep: '23:30',
    peakWindows: [
      { from: '07:00', to: '09:30', headway: 10 },
      { from: '17:00', to: '20:00', headway: 10 },
    ],
  },
];

const CO_META = {
  id: 'CO',
  name: 'Chikaoi Line',
  nameJa: '',                 // TODO
  color: '#FF3333',
  circular: false,
  headwayPeak: 10,
  headwayOffPeak: 15,
  totalKm: 58.32,
};

const CO_STATIONS = [
  { code: 'CO01', name: 'Oitsura',          kanji: '粕鵲',         nodeId: 201351276, km:   0.00 },
  { code: 'CO02', name: 'Ippanigoen',       kanji: '—',            nodeId: 124072530, km:   1.30 },
  { code: 'CO03', name: 'Makintoshi',       kanji: '馬貴',         nodeId: 124072531, km:   2.22 },
  { code: 'CO04', name: 'Wayushima',        kanji: '—',            nodeId: 124072532, km:   3.29 },
  { code: 'CO05', name: 'Domatsui',         kanji: '土頭居',       nodeId: 124072533, km:   4.29 },
  { code: 'CO06', name: 'Nari-Hajafuki',    kanji: '東波社枇',     nodeId: 124072534, km:   5.32 },
  { code: 'CO07', name: 'Hajafuki',         kanji: '波社枇',       nodeId: 124072535, km:   6.32 },
  { code: 'CO08', name: 'Hayatogaru',       kanji: '久松',         nodeId: 124066077, km:   7.20 },
  { code: 'CO09', name: 'Rakkashoni',       kanji: '鳶腳',         nodeId: 124066078, km:   8.32 },
  { code: 'CO10', name: 'Sumi-Kokendake',   kanji: '隠古剣館',     nodeId: 124066079, km:   9.38 },
  { code: 'CO11', name: 'Oritoku',          kanji: '壌外',         nodeId: 124066080, km:  10.41 },
  { code: 'CO12', name: 'Tomiganei',        kanji: '庭ヶ汢',       nodeId: 124066081, km:  11.37 },
  { code: 'CO13', name: 'Tagashiga',        kanji: '浚藻',         nodeId: 124066082, km:  12.09 },
  { code: 'CO14', name: 'Oiseharu',         kanji: '粕墾',         nodeId: 124066083, km:  13.01 },
  { code: 'CO15', name: 'Herubori',         kanji: '杏登',         nodeId: 124066084, km:  14.06 },
  { code: 'CO16', name: 'Ōbakura',          kanji: '大砌',         nodeId: 124066085, km:  15.16 },
  { code: 'CO17', name: 'Aketsue',          kanji: '薫都衛',       nodeId: 124066086, km:  16.17 },
  { code: 'CO18', name: 'Sainðaul Central', kanji: '作安崎中央',   nodeId: 229656494, km:  17.28 },
  { code: 'CO19', name: 'Binno',            kanji: '苠喃',         nodeId: 229656493, km:  19.17 },
  { code: 'CO20', name: 'Tobeskauri',       kanji: '鴨沼',         nodeId: 129227937, km:  21.24 },
  { code: 'CO21', name: 'Tajamōri',         kanji: '宰毛利',       nodeId: 129227941, km:  22.53 },
  { code: 'CO22', name: 'Alkuitsa',         kanji: '潮屺',         nodeId: 368744262, km:  24.51 },
  { code: 'CO23', name: 'Nihkyonta',        kanji: '濱角',         nodeId: 368583226, km:  26.03 },
  { code: 'CO24', name: 'Kasakuri',         kanji: '鯛巻',         nodeId: 127914807, km:  29.97 },
  { code: 'CO25', name: 'Toemonjaru',       kanji: '—',            nodeId: 170602613, km:  32.66 },
  { code: 'CO26', name: 'Dodonuka',         kanji: '登戸陥',       nodeId: 169508180, km:  34.44 },
  { code: 'CO27', name: 'Rismyonjen',       kanji: '立面串',       nodeId: 136187246, km:  36.98 },
  { code: 'CO28', name: 'Eikunna',          kanji: '栄勳那',       nodeId: 126754741, km:  38.63 },
  { code: 'CO29', name: 'Tsurunarikki',     kanji: '鵺陸起',       nodeId: 126754742, km:  39.91 },
  { code: 'CO30', name: 'Tsaibako',         kanji: '済鴫',         nodeId: 126754743, km:  40.91 },
  { code: 'CO31', name: 'Shin-Tsuruna',     kanji: '新鵺',         nodeId: 126754744, km:  42.02 },
  { code: 'CO32', name: 'Riimibaiken',      kanji: '𠝏卞',         nodeId: 126754745, km:  43.25 },
  { code: 'CO33', name: 'Toibotsuta',       kanji: '蚧垣',         nodeId: 126754746, km:  44.72 },
  { code: 'CO34', name: 'Togara',           kanji: '焦羅',         nodeId: 126754748, km:  46.44 },
  { code: 'CO35', name: 'Ikisawa',          kanji: '琳窊',         nodeId: 126754749, km:  47.42 },
  { code: 'CO36', name: 'Rinkūn City',      kanji: '臨空યાઠા',  nodeId: 126754750, km:  48.66 },
  { code: 'CO37', name: 'Bibaisone',        kanji: '尾梅幕',       nodeId: 126754751, km:  50.24 },
  { code: 'CO38', name: 'Okagawa',          kanji: '—',            nodeId: 126754753, km:  51.36 },
  { code: 'CO39', name: 'Taikinda',         kanji: '台金太',       nodeId: 126754754, km:  53.00 },
  { code: 'CO40', name: 'Chikawari Mikawa', kanji: '宮祭ーー',     nodeId: 126754755, km:  55.91 },
  { code: 'CO41', name: 'Chikawari',        kanji: '宮祭',         nodeId: 354211990, km:  58.32 },
];

const CO_INTERCHANGE = {
  CO01: ['M222', 'KS21', 'JD06'],
  CO08: ['LL10', 'JD05', 'SHX06'],
  CO09: ['M214', 'LL11'],
  CO10: ['M409', 'LL12'],
  CO11: ['M1020', 'LL13'],
  CO12: ['M916', 'LL14'],
  CO13: ['LL15'],
  CO14: ['LL16'],
  CO15: ['M327', 'M1212', 'LL17', 'SHX01', 'AX07'],
  CO16: ['M1211', 'M1415', 'LL18'],
  CO17: ['M1210', 'LL19', 'SK27'],
  CO18: ['M117', 'M814', 'M1712', 'LL01', 'SK26', 'TS13', 'JD01', 'AX06', 'K01', 'R01', 'E01'],
  CO19: ['M452', 'M1713', 'LL02', 'SK25', 'TS12'],
  CO20: ['M1013', 'CK20'],
  CO21: ['M805', 'CK19'],
  CO22: ['M110', 'M202', 'CK18'],
  CO23: ['M418', 'M611', 'SK34', 'TS15', 'CK17'],
  CO24: ['M419', 'M612', 'SK35', 'TS16', 'CK16', 'AX04', { code: 'K02', transferMin: 10 }],
  CO25: ['CK15'],
  CO26: ['CK14', { code: 'HOY03', transferMin: 6 }, { code: 'M1725', transferMin: 6 }],
  CO27: ['M1107', 'TS17', 'CK13'],
  CO28: ['CK12'],
  CO29: ['CK11'],
  CO30: ['CK10'],
  CO31: ['CK09'],
  CO32: ['M705', 'CK08', 'AX03'],
  CO33: ['CK07'],
  CO34: ['CK06'],
  CO35: ['CK05'],
  CO36: ['CK04', 'AX02'],
  CO37: ['M1305', 'M1505'],
};

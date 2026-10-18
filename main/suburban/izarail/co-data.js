/* ================================================================
   CO-DATA.JS — Chikaoi Line
   ================================================================
   Capolinea fisici: CO73 Tsutaru ↔ CO41 Chikawari (servizi S2/S3/S4 ancora CO01–CO41)
   90.68 km · 56 stazioni (CO59–CO73 a nord di CO01 + CO01–CO41)
   Numerazione: CO42–CO58 non assegnati. Km progressivi da CO73 (km 0.00).

   Per i passeggeri è un unico servizio; internamente la linea
   è percorsa da tre servizi (S1 non opera su CO):
     S2  CO01 ↔ CO41  tutte le fermate  3 tph tutto il giorno (20 min)
     S3  CO01 ↔ CO08  tutte le fermate  2 tph solo in punta (30 min)
     S4  CO24 ↔ CO41  tutte le fermate  2 tph solo in punta (30 min)
   Frequenza effettiva in punta: CO01–CO08 e CO24–CO41 5 tph (~12 min);
   CO08–CO24 3 tph (20 min).

   Interscambi RI ↔ CO (stesse stazioni, stessi nodeId):
     CO28 Eikunna ↔ RI05 · CO29 Tsurunarikki ↔ RI04 · CO30 Tsaibako ↔ RI03
     CO31 Shin-Tsuruna ↔ RI02 · CO32 Riimibaiken ↔ RI01

   NOTA: tratto nord CO59–CO73 aggiunto (parallelo alla JD); la linea sarà estesa ancora dopo CO41; i capolinea
         dei servizi S2/S3/S4 andranno rivisti.
   TODO: prima/ultima corsa e fasce di punta sono PROVVISORI
         (fasce copiate dallo schema RI), da confermare.
   TODO: nameJa, kanji mancanti (CO02, CO04, CO25, CO38).
   TODO: interscambi reciproci in suburban-data.js.
================================================================ */
'use strict';

const CO_SERVICES = [
  /* ---- S2 — tutto il giorno, 3 tph ---- */
  {
    id: 'S2', desc: 'Local', fromCode: 'CO01', toCode: 'CO41',
    headway: 20, stops: [],
    firstDep: '05:00', lastDep: '23:30',
  },
  {
    id: 'S2', desc: 'Local', fromCode: 'CO41', toCode: 'CO01',
    headway: 20, stops: [],
    firstDep: '05:00', lastDep: '23:30',
  },

  /* ---- S3 — CO01 ↔ CO08, 2 tph solo in punta ---- */
  {
    id: 'S3', desc: 'Local (punta)', fromCode: 'CO01', toCode: 'CO08',
    headway: 30, stops: [],
    firstDep: '07:00', lastDep: '09:30',
  },
  {
    id: 'S3', desc: 'Local (punta)', fromCode: 'CO01', toCode: 'CO08',
    headway: 30, stops: [],
    firstDep: '17:00', lastDep: '20:00',
  },
  {
    id: 'S3', desc: 'Local (punta)', fromCode: 'CO08', toCode: 'CO01',
    headway: 30, stops: [],
    firstDep: '07:00', lastDep: '09:30',
  },
  {
    id: 'S3', desc: 'Local (punta)', fromCode: 'CO08', toCode: 'CO01',
    headway: 30, stops: [],
    firstDep: '17:00', lastDep: '20:00',
  },

  /* ---- S4 — CO24 ↔ CO41, 2 tph solo in punta ---- */
  {
    id: 'S4', desc: 'Local (punta)', fromCode: 'CO24', toCode: 'CO41',
    headway: 30, stops: [],
    firstDep: '07:00', lastDep: '09:30',
  },
  {
    id: 'S4', desc: 'Local (punta)', fromCode: 'CO24', toCode: 'CO41',
    headway: 30, stops: [],
    firstDep: '17:00', lastDep: '20:00',
  },
  {
    id: 'S4', desc: 'Local (punta)', fromCode: 'CO41', toCode: 'CO24',
    headway: 30, stops: [],
    firstDep: '07:00', lastDep: '09:30',
  },
  {
    id: 'S4', desc: 'Local (punta)', fromCode: 'CO41', toCode: 'CO24',
    headway: 30, stops: [],
    firstDep: '17:00', lastDep: '20:00',
  },
];

const CO_META = {
  id: 'CO',
  name: 'Chikaoi Line',
  nameJa: '',                 // TODO
  color: '#FF3333',
  circular: false,
  headwayPeak: 12,            // CO01–CO08 e CO24–CO41 (5 tph); CO08–CO24: 20 min
  headwayOffPeak: 20,         // 3 tph (S2) su tutta la linea
  totalKm: 90.68,
};

const CO_STATIONS = [
  { code: 'CO73', name: 'Tsutaru',                 kanji: '—',           nodeId: 186950842, km:   0.00 },
  { code: 'CO72', name: 'Yotsekoshi Nyūngu',       kanji: '—',           nodeId: 284017639, km:   3.31 },
  { code: 'CO71', name: 'Shiki-Igattarun',         kanji: '—',           nodeId: 284017758, km:   6.83 },
  { code: 'CO70', name: 'Haritta',                 kanji: '楠多',          nodeId: 284017759, km:   8.87 },
  { code: 'CO69', name: 'Igattarun Daigaku',       kanji: '—',           nodeId: 135204256, km:  11.15 },
  { code: 'CO68', name: 'Igattarun Juwon',         kanji: '蝉陵中央',        nodeId: 135204257, km:  13.47 },
  { code: 'CO67', name: 'Shihano',                 kanji: '士波見',         nodeId: 325306887, km:  15.27 },
  { code: 'CO66', name: 'Nenjas-chi',              kanji: '秊擦寺',         nodeId: 135204253, km:  16.42 },
  { code: 'CO65', name: 'Otsumi-Senoira',          kanji: '東蒸伊田',        nodeId: 325176942, km:  19.59 },
  { code: 'CO64', name: 'Senoira',                 kanji: '蒸伊田',         nodeId: 324982700, km:  20.67 },
  { code: 'CO63', name: 'Tamukaya',                kanji: '軒兜',          nodeId: 183877643, km:  23.49 },
  { code: 'CO62', name: 'Otsumi-Tamukaya',         kanji: '南軒兜',         nodeId: 183877642, km:  25.39 },
  { code: 'CO61', name: 'Suma Taisha',             kanji: '須万大社',        nodeId: 294364786, km:  26.90 },
  { code: 'CO60', name: 'Suma',                    kanji: '須万',          nodeId: 284156335, km:  28.40 },
  { code: 'CO59', name: 'Miwase',                  kanji: '水刈',          nodeId: 325484915, km:  30.24 },
  { code: 'CO01', name: 'Oitsura',          kanji: '粕鵲',         nodeId: 201351276, km:    32.36 },
  { code: 'CO02', name: 'Ippanigoen',       kanji: '—',            nodeId: 124072530, km:    33.66 },
  { code: 'CO03', name: 'Makintoshi',       kanji: '馬貴',         nodeId: 124072531, km:    34.58 },
  { code: 'CO04', name: 'Wayushima',        kanji: '—',            nodeId: 124072532, km:    35.65 },
  { code: 'CO05', name: 'Domatsui',         kanji: '土頭居',       nodeId: 124072533, km:    36.65 },
  { code: 'CO06', name: 'Nari-Hajafuki',    kanji: '東波社枇',     nodeId: 124072534, km:    37.68 },
  { code: 'CO07', name: 'Hajafuki',         kanji: '波社枇',       nodeId: 124072535, km:    38.68 },
  { code: 'CO08', name: 'Hayatogaru',       kanji: '久松',         nodeId: 124066077, km:    39.56 },
  { code: 'CO09', name: 'Rakkashoni',       kanji: '鳶腳',         nodeId: 124066078, km:    40.68 },
  { code: 'CO10', name: 'Sumi-Kokendake',   kanji: '隠古剣館',     nodeId: 124066079, km:    41.74 },
  { code: 'CO11', name: 'Oritoku',          kanji: '壌外',         nodeId: 124066080, km:   42.77 },
  { code: 'CO12', name: 'Tomiganei',        kanji: '庭ヶ汢',       nodeId: 124066081, km:   43.73 },
  { code: 'CO13', name: 'Tagashiga',        kanji: '浚藻',         nodeId: 124066082, km:   44.45 },
  { code: 'CO14', name: 'Oiseharu',         kanji: '粕墾',         nodeId: 124066083, km:   45.37 },
  { code: 'CO15', name: 'Herubori',         kanji: '杏登',         nodeId: 124066084, km:   46.42 },
  { code: 'CO16', name: 'Ōbakura',          kanji: '大砌',         nodeId: 124066085, km:   47.52 },
  { code: 'CO17', name: 'Aketsue',          kanji: '薫都衛',       nodeId: 124066086, km:   48.53 },
  { code: 'CO18', name: 'Sainðaul Central', kanji: '作安崎中央',   nodeId: 229656494, km:   49.64 },
  { code: 'CO19', name: 'Binno',            kanji: '苠喃',         nodeId: 229656493, km:   51.53 },
  { code: 'CO20', name: 'Tobeskauri',       kanji: '鴨沼',         nodeId: 129227937, km:   53.60 },
  { code: 'CO21', name: 'Tajamōri',         kanji: '宰毛利',       nodeId: 129227941, km:   54.89 },
  { code: 'CO22', name: 'Alkuitsa',         kanji: '潮屺',         nodeId: 368744262, km:   56.87 },
  { code: 'CO23', name: 'Nihkyonta',        kanji: '濱角',         nodeId: 368583226, km:   58.39 },
  { code: 'CO24', name: 'Kasakuri',         kanji: '鯛巻',         nodeId: 127914807, km:   62.33 },
  { code: 'CO25', name: 'Toemonjaru',       kanji: '—',            nodeId: 170602613, km:   65.02 },
  { code: 'CO26', name: 'Dodonuka',         kanji: '登戸陥',       nodeId: 169508180, km:   66.80 },
  { code: 'CO27', name: 'Rismyonjen',       kanji: '立面串',       nodeId: 136187246, km:   69.34 },
  { code: 'CO28', name: 'Eikunna',          kanji: '栄勳那',       nodeId: 126754741, km:   70.99 },
  { code: 'CO29', name: 'Tsurunarikki',     kanji: '鵺陸起',       nodeId: 126754742, km:   72.27 },
  { code: 'CO30', name: 'Tsaibako',         kanji: '済鴫',         nodeId: 126754743, km:   73.27 },
  { code: 'CO31', name: 'Shin-Tsuruna',     kanji: '新鵺',         nodeId: 126754744, km:   74.38 },
  { code: 'CO32', name: 'Riimibaiken',      kanji: '𠝏卞',         nodeId: 126754745, km:   75.61 },
  { code: 'CO33', name: 'Toibotsuta',       kanji: '蚧垣',         nodeId: 126754746, km:   77.08 },
  { code: 'CO34', name: 'Togara',           kanji: '焦羅',         nodeId: 126754748, km:   78.80 },
  { code: 'CO35', name: 'Ikisawa',          kanji: '琳窊',         nodeId: 126754749, km:   79.78 },
  { code: 'CO36', name: 'Rinkūn City',      kanji: '臨空યાઠા',  nodeId: 126754750, km:   81.02 },
  { code: 'CO37', name: 'Bibaisone',        kanji: '尾梅幕',       nodeId: 126754751, km:   82.60 },
  { code: 'CO38', name: 'Okagawa',          kanji: '—',            nodeId: 126754753, km:   83.72 },
  { code: 'CO39', name: 'Taikinda',         kanji: '台金太',       nodeId: 126754754, km:   85.36 },
  { code: 'CO40', name: 'Chikawari Mikawa', kanji: '宮祭ーー',     nodeId: 126754755, km:   88.27 },
  { code: 'CO41', name: 'Chikawari',        kanji: '宮祭',         nodeId: 354211990, km:   90.68 },
];

const CO_INTERCHANGE = {
  CO73: ['JD16'],
  CO72: ['JD12'],
  CO71: ['JD13'],
  CO70: ['JD14'],
  CO69: ['JD11'],
  CO68: ['SK01', 'WI13', 'JD10'],
  CO65: ['JD09'],
  CO63: ['JD08'],
  CO61: ['JD07'],
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
  CO28: ['CK12', 'RI05'],
  CO29: ['CK11', 'RI04'],
  CO30: ['CK10', 'RI03'],
  CO31: ['CK09', 'RI02'],
  CO32: ['M705', 'CK08', 'AX03', 'RI01'],
  CO33: ['CK07'],
  CO34: ['CK06'],
  CO35: ['CK05'],
  CO36: ['CK04', 'AX02'],
  CO37: ['M1305', 'M1505'],
};

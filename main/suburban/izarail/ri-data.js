/* ================================================================
   RI-DATA.JS — Riimiilla Line
   ================================================================
   Capolinea: RI01 Riimibaiken ↔ RI40 Illashiya
   100.56 km · 41 stazioni (RI01–RI40 + RI171)

   Servizi (formato ks-data.js):
     RI1  Local      RI01 ↔ RI40  tutte le fermate
                       RI23–RI40: 2 tph morbida (30 min) / 3 tph punta (20 min)
     RI2  Local corto RI01 ↔ RI23 tutte le fermate
                       stessa frequenza di RI1: 2 tph morbida / 3 tph punta
     Tratta comune RI01–RI23: 4 tph morbida (15 min) / 6 tph punta (10 min)

   TODO: prima/ultima corsa, fasce di punta (provvisorie, da M15) e
         sfasamento RI2 rispetto a RI1 (+15 min morbida / +10 min punta).
   TODO: verificare che il loader accetti headway dentro peakWindows.
   TODO: nameJa, interscambi reciproci in suburban-data.js, KW02 'IR'.
================================================================ */
'use strict';

const RI_SERVICES = [
  {
    id: 'RI1', desc: 'Local', fromCode: 'RI01', toCode: 'RI40',
    headway: 30, stops: [],
    firstDep: '05:00', lastDep: '23:30',
    peakWindows: [
      { from: '07:00', to: '09:30', headway: 20 },
      { from: '17:00', to: '20:00', headway: 20 },
    ],
  },
  {
    id: 'RI1', desc: 'Local', fromCode: 'RI40', toCode: 'RI01',
    headway: 30, stops: [],
    firstDep: '05:00', lastDep: '23:30',
    peakWindows: [
      { from: '07:00', to: '09:30', headway: 20 },
      { from: '17:00', to: '20:00', headway: 20 },
    ],
  },
  {
    id: 'RI2', desc: 'Local corto', fromCode: 'RI01', toCode: 'RI23',
    headway: 30, stops: [],
    firstDep: '05:15', lastDep: '23:45',
    peakWindows: [
      { from: '07:10', to: '09:40', headway: 20 },
      { from: '17:10', to: '20:10', headway: 20 },
    ],
  },
  {
    id: 'RI2', desc: 'Local corto', fromCode: 'RI23', toCode: 'RI01',
    headway: 30, stops: [],
    firstDep: '05:15', lastDep: '23:45',
    peakWindows: [
      { from: '07:10', to: '09:40', headway: 20 },
      { from: '17:10', to: '20:10', headway: 20 },
    ],
  },
];

const RI_META = {
  id: 'RI',
  name: 'Riimiilla Line',
  nameJa: '',                 // TODO
  color: '#ffd320',
  circular: false,
  headwayPeak: 10,            // RI01–RI23 (6 tph); RI23–RI40: 20 min
  headwayOffPeak: 15,         // RI01–RI23 (4 tph); RI23–RI40: 30 min
  totalKm: 100.56,
};

const RI_STATIONS = [
  { code: 'RI01',  name: 'Riimibaiken',        kanji: '𠝏卞',         nodeId: 126754745, km:   0.00 },
  { code: 'RI02',  name: 'Shin-Tsuruna',       kanji: '新鵺',         nodeId: 126754744, km:   1.48 },
  { code: 'RI03',  name: 'Tsaibako',           kanji: '済鵫',         nodeId: 126754743, km:   2.58 },
  { code: 'RI04',  name: 'Tsurunarikki',       kanji: '鵺陸起',       nodeId: 126754742, km:   3.60 },
  { code: 'RI05',  name: 'Eikunna',            kanji: '栄勳那',       nodeId: 126754741, km:   4.76 },
  { code: 'RI06',  name: 'Zawahan Nojima',     kanji: '竊氾濃湧',     nodeId: 126754740, km:   5.76 },
  { code: 'RI07',  name: 'Choyarui',           kanji: '—',            nodeId: 123393748, km:   6.59 },
  { code: 'RI08',  name: 'Ipporai-Senpyan',    kanji: '一蒲崍船駢',   nodeId: 123393772, km:   8.08 },
  { code: 'RI09',  name: 'Sakanemoto',         kanji: '沛岬斗',       nodeId: 123393750, km:   9.60 },
  { code: 'RI10',  name: 'Eigandan Senpyan',   kanji: '永玵段船駢',   nodeId: 123393771, km:  10.71 },
  { code: 'RI11',  name: 'Shiittaru Senpyan',  kanji: '—',            nodeId: 136187240, km:  11.68 },
  { code: 'RI12',  name: 'Senpyan - Murakami', kanji: '船駢門良釜',   nodeId: 136187239, km:  12.58 },
  { code: 'RI13',  name: 'Urenosomi Senpyan',  kanji: '—',            nodeId: 123393770, km:  13.29 },
  { code: 'RI14',  name: 'Shutazai',           kanji: '守多彩',       nodeId: 136187238, km:  14.89 },
  { code: 'RI15',  name: 'Showanul',           kanji: '書瓦崎',       nodeId: 167670124, km:  17.17 },
  { code: 'RI16',  name: 'Chaihamosu',         kanji: '—',            nodeId: 167670216, km:  18.35 },
  { code: 'RI17',  name: 'Kojushire',          kanji: '—',            nodeId: 167670215, km:  19.76 },
  { code: 'RI171', name: 'Kainos Ufuwani',     kanji: '—',            nodeId: 176767498, km:  20.91 },
  { code: 'RI18',  name: 'Waneki',             kanji: '窯名',         nodeId: 188445930, km:  23.55 },
  { code: 'RI19',  name: 'Shin-Waneki',        kanji: '新窯名',       nodeId: 218522901, km:  26.43 },
  { code: 'RI20',  name: 'Hamuchika',          kanji: '鷲宮',         nodeId: 261115558, km:  28.99 },
  { code: 'RI21',  name: 'Piskadoshi',         kanji: '滋氾',         nodeId: 304294052, km:  30.15 },
  { code: 'RI22',  name: 'Nadekaku',           kanji: '豆小',         nodeId: 304293404, km:  32.32 },
  { code: 'RI23',  name: 'Shin-Erigowa',       kanji: '新繰緊',       nodeId: 167664673, km:  35.88 },
  { code: 'RI24',  name: 'Irikata',            kanji: '弓太',         nodeId: 403078354, km:  40.13 },
  { code: 'RI25',  name: 'Sejisebu',           kanji: '井終',         nodeId: 260849805, km:  43.24 },
  { code: 'RI26',  name: 'Gōryāndai',        kanji: '豪掚臺',       nodeId: 260849800, km:  44.75 },
  { code: 'RI27',  name: 'Moritakutsa',        kanji: '竹蹔崯',       nodeId: 146816254, km:  46.76 },
  { code: 'RI28',  name: 'Natsebe-Sāriwi',   kanji: '芝末川上',     nodeId: 329463994, km:  50.04 },
  { code: 'RI29',  name: 'Gaimuka',            kanji: '崖椴',         nodeId: 363700544, km:  53.15 },
  { code: 'RI30',  name: 'Nento Akumuhai',     kanji: '—',            nodeId: 439489633, km:  56.18 },
  { code: 'RI31',  name: 'Yutsukabul',         kanji: '柚鷸武崎',     nodeId: 347551005, km:  58.20 },
  { code: 'RI32',  name: 'Shumuzo',            kanji: '—',            nodeId: 439489634, km:  66.24 },
  { code: 'RI33',  name: 'Wakodase',           kanji: '—',            nodeId: 439489635, km:  70.51 },
  { code: 'RI34',  name: 'Akkosoi',            kanji: '穂網',         nodeId: 154265060, km:  86.29 },
  { code: 'RI35',  name: 'Tsumada',            kanji: '—',            nodeId: 154265055, km:  88.99 },
  { code: 'RI36',  name: 'Niji-Tsumada',       kanji: '—',            nodeId: 154265049, km:  91.09 },
  { code: 'RI37',  name: 'Kakinusa',           kanji: '—',            nodeId: 154265043, km:  93.10 },
  { code: 'RI38',  name: 'Takkaechuna',        kanji: '—',            nodeId: 154265037, km:  94.69 },
  { code: 'RI39',  name: 'Kinshigen Nanmun',   kanji: '錦志玄南門',   nodeId: 154265033, km:  96.63 },
  { code: 'RI40',  name: 'Illashiya',          kanji: '狐棲',         nodeId: 154265027, km: 100.56 },
];

const RI_INTERCHANGE = {
  RI01:  ['M705', 'CK08', 'AX03'],
  RI02:  ['CK09'],
  RI03:  ['CK10'],
  RI04:  ['CK11'],
  RI05:  ['CK12'],
  RI08:  ['M425', 'M618', 'TS18'],
  RI09:  ['M506'],
  RI10:  ['M717', 'TS19', 'AX20'],
  RI13:  ['M1522'],
  RI14:  ['M725', 'M1116', 'TS20'],
  RI15:  ['M1324', 'SK43', 'KD37', 'AX21'],
  RI16:  ['SK44'],
  RI17:  ['SK45'],
  RI171: ['SK46'],
  RI18:  ['SK47'],
  RI19:  ['SK48'],
  RI20:  ['SK49'],
  RI21:  ['SK50'],
  RI23:  ['AX30'],
  RI25:  ['AX31'],
  RI31:  ['AX32'],
  RI34:  ['AX33'],
  RI40:  ['AX34', 'IL112'],
};

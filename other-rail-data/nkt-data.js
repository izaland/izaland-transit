/* ================================================================
   NKT-DATA.JS — Nijikutō Line · 西海線
   Linea regionale Izarail · categoria "local line"
   Capolinea: NKT01 Tsukuwa ↔ NKT50 Kamahoraya
   Lunghezza: 127,81 km · 50 stazioni
================================================================ */
'use strict';

const NKT_INTERCHANGE = {
  // NKT05 Wodoriha IR — interscambio da confermare
};

const NKT_LINES = {
  NKT: {
    id: 'NKT',
    name: 'Nijikutō Line',
    nameJa: '西海線',
    color: '#374151', // TODO: colore ufficiale
    operator: 'Izarail',
    type: 'regional',
    category: 'local',
    circular: false,
    totalKm: 127.81,
    totalStations: 50,
    headwayPeak: 60,    // TODO
    headwayOffPeak: 60, // TODO
    stations: [
      { code:'NKT01', name:'Tsukuwa', kanji:'黄凪', km:0 },              /* node 126754769 */
      { code:'NKT02', name:'Hachima', kanji:'', km:1.89 },               /* node 215714720 */
      { code:'NKT03', name:'Nari-Patorogamo Daigaku', kanji:'東岩手大學', km:3.73 }, /* node 215714721 */
      { code:'NKT04', name:'Nari-Wodoriha', kanji:'東渉高', km:4.81 },   /* node 215714722 */
      { code:'NKT05', name:'Wodoriha IR', kanji:'渉高IR', km:6.34 },     /* node 126753613 */
      { code:'NKT06', name:'Konutanma', kanji:'米谷', km:9.42 },         /* node 414651990 */
      { code:'NKT07', name:'Ātomiwa', kanji:'清水', km:11.48 },          /* node 414651971 */
      { code:'NKT08', name:'Sakari', kanji:'腕梨', km:13.83 },           /* node 364105797 */
      { code:'NKT09', name:'Kamagoe', kanji:'寺丘', km:17.26 },
      { code:'NKT10', name:'Asukamui', kanji:'天混', km:19.17 },         /* node 127911614 */
      { code:'NKT11', name:'Eriraul Saketomo', kanji:'', km:23.08 },     /* node 127828794 */
      { code:'NKT12', name:'Eriraul', kanji:'繰羅崎', km:24.39 },        /* node 125469525 */
      { code:'NKT13', name:'Anedun Shotais', kanji:'', km:28.53 },       /* node 125469526 */
      { code:'NKT14', name:'Tsorimaul', kanji:'投摩崎', km:29.58 },      /* node 125469527 */
      { code:'NKT15', name:'Takayazau', kanji:'', km:32.02 },            /* node 125469528 */
      { code:'NKT16', name:'Uranoshima', kanji:'鵜之渠', km:33.13 },     /* node 125464381 */
      { code:'NKT17', name:'Yubujawi', kanji:'', km:36.21 },             /* node 142676401 */
      { code:'NKT18', name:'Kamagoya', kanji:'寺古屋', km:38.96 },       /* node 141868039 */
      { code:'NKT19', name:'Ogostari', kanji:'', km:42.12 },             /* node 240901333 */
      { code:'NKT20', name:'Shiki-Makushima', kanji:'北炭渠', km:49.44 },/* node 240901334 */
      { code:'NKT21', name:'Makushima', kanji:'炭渠', km:52.31 },        /* node 125470624 */
      { code:'NKT22', name:'Yanpere', kanji:'', km:45.71 },              /* node 268835938 */
      { code:'NKT23', name:'Īmasāri', kanji:'江川', km:56.39 },          /* node 240898586 */
      { code:'NKT24', name:'Pokajakku', kanji:'吉瀬', km:59.12 },        /* node 240898584 */
      { code:'NKT25', name:'Shiki-Nappawa', kanji:'北那覇輪', km:61.7 }, /* node 132296595 */
      { code:'NKT26', name:'Nappawa', kanji:'那覇輪', km:64.45 },        /* node 127915428 */
      { code:'NKT27', name:'Kiranaki', kanji:'', km:68.7 },              /* node 268835890 */
      { code:'NKT28', name:'Kattedoshi', kanji:'', km:72.9 },            /* node 132299264 */
      { code:'NKT29', name:'Sepperui Motu', kanji:'', km:74.33 },        /* node 268835889 */
      { code:'NKT30', name:'Taishidān', kanji:'', km:78.04 },            /* node 268835888 */
      { code:'NKT31', name:'Ukkobari', kanji:'', km:79.45 },             /* node 132299265 */
      { code:'NKT32', name:'Ukkobarishi', kanji:'', km:82.07 },          /* node 184495114 */
      { code:'NKT33', name:'Haneuko', kanji:'', km:87.08 },              /* node 268835887 */
      { code:'NKT34', name:'Takayara', kanji:'', km:91.14 },             /* node 184495143 */
      { code:'NKT35', name:'Jimuri', kanji:'', km:94.86 },               /* node 268835886 */
      { code:'NKT36', name:'Hadatonki', kanji:'', km:99.92 },            /* node 268835885 */
      { code:'NKT37', name:'Hanbura', kanji:'', km:102.43 },             /* node 140230170 */
      { code:'NKT38', name:'Tsakyamoto', kanji:'', km:104.43 },          /* node 268835856 */
      { code:'NKT39', name:'Otsumi-Komishinan', kanji:'', km:106.41 },   /* node 125464750 */
      { code:'NKT40', name:'Idahara', kanji:'', km:107.99 },             /* node 140230273 */
      { code:'NKT41', name:'Kaikotsumi', kanji:'', km:109 },             /* node 140230266 */
      { code:'NKT42', name:'Komishinan', kanji:'古邊南', km:109.2 },     /* node 125464778 */
      { code:'NKT43', name:'Egevuuri (Komishinan Daigaku)', kanji:'', km:111.47 }, /* node 140230260 */
      { code:'NKT44', name:'Gavishuri', kanji:'', km:114.6 },            /* node 125464749 */
      { code:'NKT45', name:'Akunji Ho', kanji:'', km:117.64 },           /* node 140231182 */
      { code:'NKT46', name:'Shiki-Tsobuse', kanji:'', km:120.28 },       /* node 268835995 */
      { code:'NKT47', name:'Tsobuse', kanji:'', km:121.51 },             /* node 140231215 */
      { code:'NKT48', name:'Chōsai', kanji:'調才', km:123.87 },          /* node 269137117 */
      { code:'NKT49', name:'Shiki-Kamahoraya', kanji:'北寺稲野', km:126.12 }, /* node 159573078 */
      { code:'NKT50', name:'Kamahoraya', kanji:'寺稲野', km:127.81 },    /* node 159555078 */
    ],
  },
};

const NKT_SERVICES = [
  {
    id: 'NKT1',
    desc: 'Local',
    fromCode: 'NKT01',
    toCode: 'NKT50',
    headway: 60, // TODO: frequenza reale
    stops: [],   // vuoto = tutte le fermate
    firstDep: '06:00', // TODO
    lastDep: '22:00',  // TODO
  },
  {
    id: 'NKT1',
    desc: 'Local',
    fromCode: 'NKT50',
    toCode: 'NKT01',
    headway: 60, // TODO
    stops: [],
    firstDep: '06:00', // TODO
    lastDep: '22:00',  // TODO
  },
];

/* Merge in SUBURBAN_LINES / SUBURBAN_INTERCHANGE
   (stesso pattern di hd-data.js) */
if (typeof SUBURBAN_LINES !== 'undefined') {
  Object.assign(SUBURBAN_LINES, NKT_LINES);
}
if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
  for (const [code, partners] of Object.entries(NKT_INTERCHANGE)) {
    if (!SUBURBAN_INTERCHANGE[code]) SUBURBAN_INTERCHANGE[code] = [];
    for (const p of partners) {
      if (!SUBURBAN_INTERCHANGE[code].includes(p)) SUBURBAN_INTERCHANGE[code].push(p);
    }
  }
}

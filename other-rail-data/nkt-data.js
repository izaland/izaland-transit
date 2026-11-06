/* ================================================================
   NKT-DATA.JS — Nijikutō Line · 西海線
   Linea regionale Izarail · categoria "local line"
   Capolinea: NKT01 Tsukuwa ↔ NKT50 Kamahoraya
   Lunghezza: 127,81 km · 50 stazioni

   Servizio: Local (omnibus) tutte le fermate.
   Frequenza: 30 min tutto il giorno; rinforzo a 20 min
   nelle punte mattutina e serale.

   Interscambi: gestiti automaticamente dal cluster generator
   (data/interchange-clusters.json + applyGeneratedInterchangeClusters).
================================================================ */
'use strict';

const NKT_INTERCHANGE = {};

const NKT_LINES = {
  NKT: {
    id: 'NKT',
    name: 'Nijikutō Line',
    nameJa: '西海線',
    color: '#000000',
    operator: 'Izarail',
    type: 'regional',
    category: 'local',
    circular: false,
    totalKm: 127.81,
    totalStations: 50,
    headwayPeak: 20,
    headwayOffPeak: 30,
    stations: [
      { code:'NKT01', name:'Tsukuwa', kanji:'黄凪', km:0 },
      { code:'NKT02', name:'Hachima', kanji:'', km:1.89 },
      { code:'NKT03', name:'Nari-Patorogamo Daigaku', kanji:'東岩手大學', km:3.73 },
      { code:'NKT04', name:'Nari-Wodoriha', kanji:'東渉高', km:4.81 },
      { code:'NKT05', name:'Wodoriha IR', kanji:'渉高IR', km:6.34 },
      { code:'NKT06', name:'Konutanma', kanji:'米谷', km:9.42 },
      { code:'NKT07', name:'Ātomiwa', kanji:'清水', km:11.48 },
      { code:'NKT08', name:'Sakari', kanji:'腕梨', km:13.83 },
      { code:'NKT09', name:'Kamagoe', kanji:'寺丘', km:17.26 },
      { code:'NKT10', name:'Asukamui', kanji:'天混', km:19.17 },
      { code:'NKT11', name:'Eriraul Saketomo', kanji:'', km:23.08 },
      { code:'NKT12', name:'Eriraul', kanji:'繰羅崎', km:24.39 },
      { code:'NKT13', name:'Anedun Shotais', kanji:'', km:28.53 },
      { code:'NKT14', name:'Tsorimaul', kanji:'投摩崎', km:29.58 },
      { code:'NKT15', name:'Takayazau', kanji:'', km:32.02 },
      { code:'NKT16', name:'Uranoshima', kanji:'鵜之渠', km:33.13 },
      { code:'NKT17', name:'Yubujawi', kanji:'', km:36.21 },
      { code:'NKT18', name:'Kamagoya', kanji:'寺古屋', km:38.96 },
      { code:'NKT19', name:'Ogostari', kanji:'', km:42.12 },
      { code:'NKT20', name:'Shiki-Makushima', kanji:'北炭渠', km:49.44 },
      { code:'NKT21', name:'Makushima', kanji:'炭渠', km:52.31 },
      { code:'NKT22', name:'Yanpere', kanji:'', km:45.71 },
      { code:'NKT23', name:'Īmasāri', kanji:'江川', km:56.39 },
      { code:'NKT24', name:'Pokajakku', kanji:'吉瀬', km:59.12 },
      { code:'NKT25', name:'Shiki-Nappawa', kanji:'北那覇輪', km:61.7 },
      { code:'NKT26', name:'Nappawa', kanji:'那覇輪', km:64.45 },
      { code:'NKT27', name:'Kiranaki', kanji:'', km:68.7 },
      { code:'NKT28', name:'Kattedoshi', kanji:'', km:72.9 },
      { code:'NKT29', name:'Sepperui Motu', kanji:'', km:74.33 },
      { code:'NKT30', name:'Taishidān', kanji:'', km:78.04 },
      { code:'NKT31', name:'Ukkobari', kanji:'', km:79.45 },
      { code:'NKT32', name:'Ukkobarishi', kanji:'', km:82.07 },
      { code:'NKT33', name:'Haneuko', kanji:'', km:87.08 },
      { code:'NKT34', name:'Takayara', kanji:'', km:91.14 },
      { code:'NKT35', name:'Jimuri', kanji:'', km:94.86 },
      { code:'NKT36', name:'Hadatonki', kanji:'', km:99.92 },
      { code:'NKT37', name:'Hanbura', kanji:'', km:102.43 },
      { code:'NKT38', name:'Tsakyamoto', kanji:'', km:104.43 },
      { code:'NKT39', name:'Otsumi-Komishinan', kanji:'', km:106.41 },
      { code:'NKT40', name:'Idahara', kanji:'', km:107.99 },
      { code:'NKT41', name:'Kaikotsumi', kanji:'', km:109 },
      { code:'NKT42', name:'Komishinan', kanji:'古邊南', km:109.2 },
      { code:'NKT43', name:'Egevuuri (Komishinan Daigaku)', kanji:'', km:111.47 },
      { code:'NKT44', name:'Gavishuri', kanji:'', km:114.6 },
      { code:'NKT45', name:'Akunji Ho', kanji:'', km:117.64 },
      { code:'NKT46', name:'Shiki-Tsobuse', kanji:'', km:120.28 },
      { code:'NKT47', name:'Tsobuse', kanji:'', km:121.51 },
      { code:'NKT48', name:'Chōsai', kanji:'調才', km:123.87 },
      { code:'NKT49', name:'Shiki-Kamahoraya', kanji:'北寺稲野', km:126.12 },
      { code:'NKT50', name:'Kamahoraya', kanji:'寺稲野', km:127.81 },
    ],
  },
};

const NKT_SERVICES = [
  {
    id: 'NKT1',
    desc: 'Local (omnibus)',
    fromCode: 'NKT01',
    toCode: 'NKT50',
    headway: 30,
    peakHeadway: 20,
    peakWindows: [
      { from: '07:30', to: '09:00' },
      { from: '17:00', to: '19:30' },
    ],
    stops: [],
    firstDep: '06:00',
    lastDep: '22:00',
  },
  {
    id: 'NKT1',
    desc: 'Local (omnibus)',
    fromCode: 'NKT50',
    toCode: 'NKT01',
    headway: 30,
    peakHeadway: 20,
    peakWindows: [
      { from: '07:30', to: '09:00' },
      { from: '17:00', to: '19:30' },
    ],
    stops: [],
    firstDep: '06:00',
    lastDep: '22:00',
  },
];

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

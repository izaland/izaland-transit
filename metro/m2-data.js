/* ================================================================
   M2-DATA.JS — Metro Line 2
   ================================================================
   Common section  (M201–M218): Gawinosechi → Ārikkohanu Yunobu · 18 stations
   Branch A        (M219–M226): Ārikkohanu Yunobu → Hintomaui    ·  8 stations
   Branch B        (M227–M236): Ārikkohanu Yunobu → Mokoba        · 10 stations
   Total unique stations: 36

   In-service destination boards:
     Common section trains display "for Hintomaui" or "for Mokoba"
     depending on branch.

   Codifica km:
     Distanze progressive da M201 Gawinosechi (km 0.000).
     Ramo B: distanze misurate lungo il ramo, da M218 in poi.
     M233–M236: ricalcolate a partire da M232 Shin-Tsukaso (km 24.720).
     I valori originali erano in metri; convertiti in km.

   Regola interscambi: i nuovi collegamenti si aggiungono, quelli
   esistenti non si rimuovono (salvo codici obsoleti/errati).
================================================================ */
'use strict';

const M2_ST = {
  /* ── Sezione comune ── */
  M201: { n: 'Gawinosechi',                    k: 'ણૃપ之溝',           km:  0.000 },
  M202: { n: 'Alkuitsa',                        k: '潮屺',               km:  1.004 },
  M203: { n: 'Shimamera Shikiniswae',           k: '渠瀬田北口',          km:  2.001 },
  M204: { n: 'Shinnibuhama',                    k: '新中島',              km:  3.150 },
  M205: { n: 'Niji-Kumasui',                    k: '西枝水',             km:  3.880 },
  M206: { n: 'Heinomoji',                       k: '駕桃',               km:  4.920 },
  M207: { n: 'Ogiwata',                         k: '槃芳',               km:  6.570 },
  M208: { n: 'Egunsen Botanical Garden',        k: '慧群仙植物園',         km:  8.220 },
  M209: { n: 'Masuda Hibaru',                   k: '馬砅任尭',            km:  9.120 },
  M210: { n: 'Kushidaru Amiya',                 k: '柚賸',               km: 10.770 },
  M211: { n: 'Nagida Totsu',                    k: '鑑橋',               km: 11.820 },
  M212: { n: 'National Opera House',            k: '國立歌劇院',          km: 12.840 },
  M213: { n: 'Omenika Jinatsu',                 k: '弁丹佳治芝',          km: 13.980 },
  M214: { n: 'Rakkashoni',                      k: '鳳脚',               km: 14.910 },
  M215: { n: 'Sumatake-Kyōmasa',               k: '縦館経晶',            km: 16.370 },
  M216: { n: 'Otsumi-Hajafuki',                k: '南波社果',            km: 17.550 },
  M217: { n: 'Sumatake-Nehkehama',             k: '縦館余島',            km: 18.630 },
  M218: { n: 'Ārikkohanu Yunobu',              k: '鶴神由見夫',          km: 19.450 },
  /* ── Ramo A: for Hintomaui ── */
  M219: { n: 'Otsumi-Makintoshi Meidai-adae',  k: '南馬પ્貴氾・明大前',   km: 20.760 },
  M220: { n: 'Kanasamaki',                      k: '崔赴',               km: 22.030 },
  M221: { n: 'Sunbui',                          k: '榔苚依',             km: 23.310 },
  M222: { n: 'Oitsura',                         k: '篡鵲',               km: 24.220 },
  M223: { n: 'Oitsura Daikōwen',               k: '篡鵲大公園',          km: 25.570 },
  M224: { n: 'Tsutsuro Uguttaya',              k: '笙呂葊貞',            km: 26.860 },
  M225: { n: 'Obikasunde',                      k: '吾比加崶',            km: 28.420 },
  M226: { n: 'Hintomaui',                       k: '価園斐',             km: 29.410 },
  /* ── Ramo B: for Mokoba ── */
  M227: { n: 'Ōdahui Kōwen',                  k: '大世公園',            km: 20.260 },
  M228: { n: 'Akaimori',                        k: '螞生竹',             km: 20.980 },
  M229: { n: 'Shiki-Kawaei',                   k: '北珂夬栄',            km: 21.850 },
  M230: { n: 'Kawaei',                          k: '珂夬栄',               km: 23.000 },
  M231: { n: 'Tayakure',                        k: '貞師',               km: 23.910 },
  M232: { n: 'Shin-Tsukaso',                   k: '新鬬蓒',              km: 24.720 },
  M233: { n: 'Takejori Shimin Kōwen',          k: '館恵市民公園',         km: 25.235 },
  M234: { n: 'Yamaiki Town',                   k: '倉琮ਠપેપ્',           km: 25.724 },
  M235: { n: 'Shiki-Mokoba',                   k: '北母槻',              km: 26.310 },
  M236: { n: 'Mokoba',                          k: '母槻',               km: 27.380 },
};

/* Ordine canonico geografico per ogni ramo */
const M2_CANONICAL_COMMON = [
  'M201','M202','M203','M204','M205','M206','M207','M208',
  'M209','M210','M211','M212','M213','M214','M215','M216','M217','M218',
];
const M2_CANONICAL_A = [
  'M218',
  'M219','M220','M221','M222','M223','M224','M225','M226',
];
const M2_CANONICAL_B = [
  'M218',
  'M227','M228','M229','M230','M231','M232','M233','M234','M235','M236',
];

/* ----------------------------------------------------------------
   Metadati linea
---------------------------------------------------------------- */
const M2_META = {
  id:          'M2',
  code:        'M2',
  name:        'Line 2',
  color:       '#E60026',  // rosso
  branches: {
    A: { terminus: 'M226', display: 'for Hintomaui' },
    B: { terminus: 'M236', display: 'for Mokoba' },
  },
  totalKmA:    29.410,
  totalKmB:    27.380,
  avgSpeedKmh: 30,
  dwellSec:    30,
};

/* ----------------------------------------------------------------
   Profilo frequenze operative (headway in minuti)
   Valido per entrambi i rami.
---------------------------------------------------------------- */
const M2_HEADWAY = [
  { from: '05:00', to: '06:30', headwayMin: 10 },
  { from: '06:30', to: '07:00', headwayMin:  5 },
  { from: '07:00', to: '09:30', headwayMin:  3 },
  { from: '09:30', to: '17:00', headwayMin:  5 },
  { from: '17:00', to: '20:00', headwayMin:  3 },
  { from: '20:00', to: '22:30', headwayMin:  5 },
  { from: '22:30', to: '24:30', headwayMin: 10 },
];

const M2_SVC = {
  A: {
    name:    'for Hintomaui', nameJa: '価園斐行', color: '#E60026', cls: 'svc-A',
    stops:   [...M2_CANONICAL_COMMON, ...M2_CANONICAL_A.slice(1)],
  },
  B: {
    name:    'for Mokoba', nameJa: '母槻行', color: '#C4001F', cls: 'svc-B',
    stops:   [...M2_CANONICAL_COMMON, ...M2_CANONICAL_B.slice(1)],
  },
};

/* ----------------------------------------------------------------
   Interscambi Metro Line 2 ↔ altre reti
   Regola: aggiungere i nuovi collegamenti senza rimuovere i vecchi
   (salvo codici obsoleti/errati).
---------------------------------------------------------------- */
const M2_INTERCHANGE = {
  M201: [
    { code: 'M803', network: 'metro', transferMin: 3,
      note: 'M8 Gawinosechi' },
  ],
  M202: [
    { code: 'M110', network: 'metro', transferMin: 3,
      note: 'M1 Alkuitsa — stesso edificio, banchine separate' },
    { code: 'CK18', network: 'suburban', transferMin: 5,
      note: 'Kawayatsu Line — Alkuitsa, interscambio in superficie' },
  ],
  M203: [
    { code: 'M417', network: 'metro', transferMin: 9,
      note: 'M4 Shimamera — 300 m corridor' },
    { code: 'M111', network: 'metro', transferMin: 7,
      note: 'M1 Shimamera — 300 m corridor' },
    { code: 'M610', network: 'metro', transferMin: 7,
      note: 'M6 Shimamera — 300 m corridor' },
    { code: 'TS14', network: 'suburban', transferMin: 7,
      note: 'TS Shimamera — 300 m corridor' },
  ],
  M206: [
    { code: 'M401', network: 'metro', transferMin: 3,
      note: 'M4 Heinomoji — stesso nome, banchine separate' },
    { code: 'M806', network: 'metro', transferMin: 3,
      note: 'M8 Heinomoji' },
  ],
  M207: [
    { code: 'M402', network: 'metro', transferMin: 3,
      note: 'M4 Ogiwata — stesso nome, banchine separate' },
  ],
  M208: [
    { code: 'K01', network: 'izx', transferMin: 10,
      note: 'IZX Keishin — Saindðaul Central, 500 m underground corridor' },
    { code: 'M8', network: 'metro', transferMin: 2,
      note: 'M815 Egunsen Botanical Garden — stesso nome, banchine separate' },
    { code: 'M912', network: 'metro', transferMin: 3,
      note: 'M9 Egunsen Botanical Garden' },
  ],
  M209: [
    { code: 'M118', network: 'metro', transferMin: 9,
      note: 'M1 Masuda Agarai — stazione diversa, 400 m transfer' },
    { code: 'M325', network: 'metro', transferMin: 9,
      note: 'M3 Masuda Agarai — stazione diversa, 400 m transfer' },
    { code: 'M1413', network: 'metro', transferMin: 9,
      note: 'M14 Masuda Agarai — stazione diversa, 400 m transfer' },
    { code: 'M913', network: 'metro', transferMin: 5,
      note: 'M9 Masuda Agarai — stazione diversa, 5 min a piedi' },
  ],
  M210: [
    { code: 'M406', network: 'metro', transferMin: 3,
      note: 'M4 Kushidaru Amiya — stesso nome, banchine separate' },
    { code: 'M119', network: 'metro', transferMin: 3,
      note: 'M1 Kushidaru Amiya — stesso nome, banchine separate' },
  ],
  M211: [],
  M213: [
    { code: 'SHX05', network: 'suburban', transferMin: 3,
      note: 'SHX05 Omenika Jinatsu' },
    { code: 'M1640', network: 'metro', transferMin: 3,
      note: 'M16 Omenika Jinatsu' },
  ],
  M214: [
    { code: 'LL11', network: 'suburban', transferMin: 4,
      note: 'Loop Line Rakkashoni — stesso nome, banchine separate' },
  ],
  M222: [
    { code: 'JD06', network: 'suburban', transferMin: 3,
      note: 'Jōdai Line — Oitsura, stesso nome e node (201351276)' },
    { code: 'KS21', network: 'suburban', transferMin: 3,
      note: 'Kawasabu Line — Oitsura' },
  ],
  M223: [
    { code: 'M224', network: 'metro', transferMin: 0,
      note: 'M224 Tsutsuro Uguttaya — same node (321305795)' },
  ],
  M224: [
    { code: 'M223', network: 'metro', transferMin: 0,
      note: 'M223 Oitsura Daikōwen — same node (321305795)' },
  ],
  M226: [
    { code: 'M130', network: 'metro', transferMin: 3,
      note: 'M1 Hintomaui — stesso nome, banchine separate' },
  ],
  M230: [
    { code: 'M415', network: 'metro', transferMin: 3,
      note: 'M4 Kawaei — stesso nome, banchine separate' },
  ],
};

const M2_NODE_IDS = {
  M201: 129227943,  M202: 368744262,  M203: 368744266,  M204: 368744264,
  M205: 129254587,  M206: 129227939,  M207: 229654732,  M208: 128525299,
  M209: 145681683,  M210: 176669802,  M211: 186940383,  M212: 186940230,
  M213: 176667824,  M214: 124066078,  M215: 202909278,  M216: 202909276,
  M217: 202909275,  M218: 321305089,
  M219: 321304870,  M220: 321304869,  M221: 321304867,  M222: 201351276,
  M223: 321305795,  M224: 321305795,  M225: 321305792,  M226: 188737257,
  M227: 202909265,  M228: 202909263,  M229: 202909262,  M230: 126666499,
  M231: 202909005,  M232: 126666498,  M233: 186955500,  M234: 186955501,
  M235: 186955502,  M236: 135394631,
};

if (typeof module !== 'undefined') {
  module.exports = {
    M2_META, M2_ST,
    M2_CANONICAL_COMMON, M2_CANONICAL_A, M2_CANONICAL_B,
    M2_HEADWAY, M2_SVC, M2_INTERCHANGE, M2_NODE_IDS,
  };
}

/* ================================================================
   SHX-DATA.JS — Shubaru Express
   Ferrovia metropolitana rapida (ispirata al Tsukuba Express)

   Tipo      : Ferrovia metropolitana rapida
   Capolinea : SHX19 Torino Jutakutsi ↔ SHX01 Herubori
   Lunghezza : 53.09 km · 19 stazioni
   Vel. max  : 175 km/h (nei tratti lunghi)

   NOTE SUI DATI
   - km = distanza progressiva da SHX19 (SHX19 = 0.00).
   - Il numero di codice scende da SHX19 (km 0) a SHX01 (km 53.09).
   - SHX_INTERCHANGE contiene solo interscambi con codice stazione noto.
   - SHX_NEARBY contiene stazioni VICINE ma distinte (nodo OSM, distanza
     o tempo a piedi). Non entrano nel routing finché non hanno un codice.
   - SHX_PENDING elenca interscambi ancora da definire (TBD / solo linea).
   - Nessun servizio/orario ancora definito: SHX_SERVICES è vuoto.
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   SHX_INTERCHANGE — usato da unified-router.js (cross-network)
---------------------------------------------------------------- */
const SHX_INTERCHANGE = {
  SHX17: ['SU02'],
  SHX10: ['SKS09'],
  SHX09: ['SKS07'],
  SHX08: ['SKS05'],
  SHX06: ['LL10', 'KD26', 'JD05'],
  SHX05: ['M213'],
  SHX01: ['M327', 'LL17', 'AX07'],
};

/* ----------------------------------------------------------------
   SHX_NEARBY — stazioni vicine ma non coincidenti (nodo OSM)
---------------------------------------------------------------- */
const SHX_NEARBY = {
  SHX07: [{ node: 126666499, walkMin: 10 }],
  SHX04: [
    { node: 186940383, name: 'Nagida Totsu',  kanji: '䲺橋',  distM: 250 },
    { node: 176667833, name: 'Tamainoki',     kanji: '谷伊坂', distM: 200 },
  ],
  SHX03: [
    { node: 176669802, name: 'Kushidaru Amiya', kanji: '柚艏冸屋', distM: 200 },
  ],
};

/* ----------------------------------------------------------------
   SHX_PENDING — interscambi da completare
---------------------------------------------------------------- */
const SHX_PENDING = {
  SHX12: ['TBD'],
  SHX02: ['M9', 'M10'],   // solo linee; codici stazione da assegnare
};

/* ----------------------------------------------------------------
   SHX_LINES
---------------------------------------------------------------- */
const SHX_LINES = {
  SHX: {
    id:            'SHX',
    name:          'Shubaru Express',
    nameLocal:     '',
    color:         '#1e4fa0',
    operator:      '',
    operatorJa:    '',
    type:          'rapid-metropolitan',
    region:        '',
    circular:      false,
    maxSpeedKmh:   175,
    totalKm:       53.09,
    totalStations: 19,
    stations: [
      { code: 'SHX19', name: 'Torino Jutakutsi',                  kanji: '狛見住宅地',            km:  0.00 },  /* node 345089878 */
      { code: 'SHX18', name: 'Shin-Shiratsuki',                   kanji: '新和原',                km:  4.83 },  /* node 345089879 */
      { code: 'SHX17', name: 'Kutsurima',                         kanji: '季屺',                  km:  7.26 },  /* node 135394636 */
      { code: 'SHX16', name: 'Nari-Toshisau Fukushi Daigaku',     kanji: '東都市宗・福祉大學',    km: 10.16 },  /* node 345089880 */
      { code: 'SHX15', name: 'Ikanuri',                           kanji: '伊加窟',                km: 14.29 },  /* node 345089881 */
      { code: 'SHX14', name: 'Chikwō University Ettoko Campus',   kanji: '慈光大學前塡ડોપ્‌રેટ્', km: 18.64 },  /* node 345089882 */
      { code: 'SHX13', name: 'Nomutsu',                           kanji: '努武羞',                km: 22.75 },  /* node 345089883 */
      { code: 'SHX12', name: 'Takurige-Okegara',                  kanji: '踔銀付次',              km: 27.23 },  /* node 269606050 */
      { code: 'SHX11', name: 'Okegara',                           kanji: '付次',                  km: 29.98 },  /* node 345089884 */
      { code: 'SHX10', name: 'Dagasune',                          kanji: '切渉',                  km: 32.09 },  /* node 254514941 */
      { code: 'SHX09', name: 'Taimasaki',                         kanji: '太馬羽',                km: 34.46 },  /* node 254514939 */
      { code: 'SHX08', name: 'Yakkomai',                          kanji: '藥孤梅',                km: 37.03 },  /* node 201351280 */
      { code: 'SHX07', name: 'Kawaei Stadium',                    kanji: '珂夬栄',                km: 40.05 },  /* node 345089885 */
      { code: 'SHX06', name: 'Hayatogaru',                        kanji: '久松',                  km: 45.58 },  /* node 124066077 */
      { code: 'SHX05', name: 'Omenika Jinatsu',                   kanji: '弁丹佳治芝',            km: 47.54 },  /* node 176667824 */
      { code: 'SHX04', name: 'Nagida Kunbai',                     kanji: '䲺訓梅',                km: 49.76 },  /* node 345173019 */
      { code: 'SHX03', name: 'Agarai Tomasue',                    kanji: '阿賀来庥須衛',          km: 50.78 },  /* node 345173018 */
      { code: 'SHX02', name: 'Eigan-ji',                          kanji: '栄鳫寺',                km: 52.02 },  /* node 128669527 */
      { code: 'SHX01', name: 'Herubori',                          kanji: '杏登',                  km: 53.09 },  /* node 124066084 */
    ],
  },
};

/* ----------------------------------------------------------------
   SHX_SERVICES — da definire (tipologie di servizio, orari, frequenze)
---------------------------------------------------------------- */
const SHX_SERVICES = [];

/* ----------------------------------------------------------------
   MERGE in SUBURBAN_LINES e SUBURBAN_INTERCHANGE
   (stesso schema di wi-data.js / hd-data.js)
---------------------------------------------------------------- */
if (typeof SUBURBAN_LINES !== 'undefined') {
  Object.assign(SUBURBAN_LINES, SHX_LINES);
}
if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
  for (const [shxCode, partners] of Object.entries(SHX_INTERCHANGE)) {
    if (!SUBURBAN_INTERCHANGE[shxCode]) SUBURBAN_INTERCHANGE[shxCode] = [];
    for (const code of partners) {
      if (!SUBURBAN_INTERCHANGE[shxCode].includes(code)) {
        SUBURBAN_INTERCHANGE[shxCode].push(code);
      }
    }
  }
}

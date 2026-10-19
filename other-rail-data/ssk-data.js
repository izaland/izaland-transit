/* ================================================================
   SSK-DATA.JS — Shikisabu Line
   Linea Shikisabu · colore #D2B48C

   Capolinea : SSK01 Kanui Airport T1 ↔ SSK13 Magic Land
   Lunghezza : 14.02 km · 13 stazioni

   NOTE SUI DATI
   - km = distanza progressiva indicata nel foglio dati ("total distance
     from SSK1"): SSK01 = 2.01, SSK13 = 14.02 (valori riportati così
     come forniti, senza ribasare a 0).
   - SSK_INTERCHANGE: interscambi nella stessa stazione.
     M1026 (metro M10) non ha ancora un file dati: il codice è
     dichiarato ma il router lo ignora finché non esiste.
   - Sostituisce i codici provvisori SKS05/SKS07/SKS09 usati in
     shx-data.js (ora SSK06/SSK08/SSK10).
   - Nessun servizio/orario ancora definito: SSK_SERVICES è vuoto.
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   SSK_INTERCHANGE — interscambi nella stessa stazione (tempo standard)
---------------------------------------------------------------- */
const SSK_INTERCHANGE = {
  SSK01: ['M1026'],
  SSK03: ['M232'],
  SSK06: ['SHX08'],
  SSK08: ['SHX09'],
  SSK10: ['SHX10'],
};

/* ----------------------------------------------------------------
   SSK_LINES
---------------------------------------------------------------- */
const SSK_LINES = {
  SSK: {
    id:            'SSK',
    label:         'SSK',
    name:          'Shikisabu Line',
    nameLocal:     '',
    color:         '#D2B48C',
    operator:      '',
    operatorJa:    '',
    type:          'rapid-metropolitan',
    region:        '',
    circular:      false,
    totalKm:       14.02,
    totalStations: 13,
    stations: [
      { code: 'SSK01', name: 'Kanui Airport T1',  kanji: '嘉枡空港T1',              km:  2.01 },  /* node 126497710 */
      { code: 'SSK02', name: 'Nari-Osenude',      kanji: '東防斉',                 km:  2.33 },  /* node 207757222 */
      { code: 'SSK03', name: 'Shin-Tsukaso',      kanji: '新鷸蘇',                 km:  2.95 },  /* node 126666498 */
      { code: 'SSK04', name: 'Kantsude',          kanji: '',                    km:  4.65 },  /* node 254515988 */
      { code: 'SSK05', name: 'Ihamure',           kanji: '',                    km:  5.65 },  /* node 254515986 */
      { code: 'SSK06', name: 'Yakkomai',          kanji: '藥孤梅',                 km:  6.23 },  /* node 201351280 */
      { code: 'SSK07', name: 'Chijuruma',         kanji: '',                    km:  6.96 },  /* node 254515985 */
      { code: 'SSK08', name: 'Taimasaki',         kanji: '太馬羽',                 km:  8.73 },  /* node 254514939 */
      { code: 'SSK09', name: 'Hōnliwen',          kanji: '香里園',                 km:  9.70 },  /* node 269585399 */
      { code: 'SSK10', name: 'Dagasune',          kanji: '切渉',                  km: 11.20 },  /* node 254514941 */
      { code: 'SSK11', name: 'Tokitsaikis',       kanji: '葵狼',                  km: 12.21 },  /* node 451870353 */
      { code: 'SSK12', name: 'Bajifuku',          kanji: '桐福',                  km: 12.97 },  /* node 451870351 */
      { code: 'SSK13', name: 'Magic Land',        kanji: 'ઇમૃાડ્ડાધૅપ્‌ઠૃે',    km: 14.02 },  /* node 451870352 */
    ],
  },
};

/* ----------------------------------------------------------------
   SSK_SERVICES — da definire (tipologie di servizio, orari, frequenze)
---------------------------------------------------------------- */
const SSK_SERVICES = [];

/* ----------------------------------------------------------------
   MERGE in SUBURBAN_LINES e SUBURBAN_INTERCHANGE
---------------------------------------------------------------- */
if (typeof SUBURBAN_LINES !== 'undefined') {
  Object.assign(SUBURBAN_LINES, SSK_LINES);
}
if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
  const _has = (arr, code) => arr.some(e => (e && e.code ? e.code : e) === code);
  for (const [sskCode, partners] of Object.entries(SSK_INTERCHANGE)) {
    if (!SUBURBAN_INTERCHANGE[sskCode]) SUBURBAN_INTERCHANGE[sskCode] = [];
    for (const code of partners) {
      if (!_has(SUBURBAN_INTERCHANGE[sskCode], code)) SUBURBAN_INTERCHANGE[sskCode].push(code);
    }
  }
}

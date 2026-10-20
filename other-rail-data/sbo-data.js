/* ================================================================
   SBO-DATA.JS — Shinsabu Oitsura Line
   Linea Shinsabu Oitsura · colore #00CCCC · linea privata

   Capolinea : SBO01 Oitsura ↔ SBO07 Kawaei
   Lunghezza : 8.06 km · 7 stazioni

   NOTE SUI DATI
   - km = distanza progressiva da SBO01 (SBO01 = 0.00).
   - SBO_INTERCHANGE: interscambi nella stessa stazione.
     SBO01 ↔ M222, CO01, KS21, JD06
     SBO05 ↔ SHX08, SSK06 (Yakkomai)
     SBO07 ↔ M230, M415
   - Orari: da definire (sbo-tt.js).
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   SBO_INTERCHANGE — interscambi nella stessa stazione (tempo standard)
---------------------------------------------------------------- */
const SBO_INTERCHANGE = {
  SBO01: ['M222', 'CO01', 'KS21', 'JD06'],
  SBO05: ['SHX08', 'SSK06'],
  SBO07: ['M230', 'M415'],
};

/* ----------------------------------------------------------------
   SBO_LINES
---------------------------------------------------------------- */
const SBO_LINES = {
  SBO: {
    id:            'SBO',
    label:         'SBO',
    name:          'Shinsabu Oitsura Line',
    nameLocal:     'યાપ્‌ટરૃે粕鵲線',
    color:         '#00CCCC',
    operator:      '',
    operatorJa:    '',
    type:          'private',
    region:        '',
    circular:      false,
    totalKm:       8.06,
    totalStations: 7,
    stations: [
      { code: 'SBO01', name: 'Oitsura',         kanji: '粕鵲',   km: 0.00 },  /* node 201351276 */
      { code: 'SBO02', name: 'Otsumi-Oitsura',  kanji: '南粕鵲', km: 1.27 },  /* node 201351277 */
      { code: 'SBO03', name: 'Arasatolo',       kanji: '',     km: 2.38 },  /* node 201351278 */
      { code: 'SBO04', name: 'Oboesāri',       kanji: '岡川',   km: 4.16 },  /* node 201351279 */
      { code: 'SBO05', name: 'Yakkomai',        kanji: '藥孤梅', km: 5.35 },  /* node 201351280 */
      { code: 'SBO06', name: 'Takurake Nagida', kanji: '',     km: 6.51 },  /* node 201351281 */
      { code: 'SBO07', name: 'Kawaei',          kanji: '珂夬栄', km: 8.06 },  /* node 126666499 */
    ],
  },
};

/* ----------------------------------------------------------------
   MERGE in SUBURBAN_LINES e SUBURBAN_INTERCHANGE
---------------------------------------------------------------- */
if (typeof SUBURBAN_LINES !== 'undefined') {
  Object.assign(SUBURBAN_LINES, SBO_LINES);
}
if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
  const _has = (arr, code) => arr.some(e => (e && e.code ? e.code : e) === code);
  for (const [sboCode, partners] of Object.entries(SBO_INTERCHANGE)) {
    if (!SUBURBAN_INTERCHANGE[sboCode]) SUBURBAN_INTERCHANGE[sboCode] = [];
    for (const code of partners) {
      if (!_has(SUBURBAN_INTERCHANGE[sboCode], code)) SUBURBAN_INTERCHANGE[sboCode].push(code);
    }
  }
}

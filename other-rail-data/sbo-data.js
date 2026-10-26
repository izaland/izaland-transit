/* ================================================================
   SBO-DATA.JS — Shinsabu Oitsura Line
   Linea Shinsabu Oitsura · colore #00CCCC · linea privata

   Infrastruttura: SBO01 Oitsura ↔ SBO10 Kanui Airport T1
   Lunghezza: 16.53 km · 10 stazioni.
   Servizi attuali: SBO01 ↔ SBO07 Kawaei, inclusi i passanti M4.
   SBO08–SBO10: dati infrastrutturali, servizi futuri da definire;
   nessun prolungamento dei servizi esistenti in sbo-tt.js.

   km = progressiva da SBO01.
   SBO08: 11.03 km; SBO09: 11.03 + 2.12 = 13.15 km;
   SBO10: 13.15 + 3.38 = 16.53 km.
   Schema fermate per i futuri servizi del prolungamento:
   Local: SBO08, SBO09, SBO10; Rapid: SBO09, SBO10 (salta SBO08).
   Questo schema NON modifica i servizi attuali.
================================================================ */
'use strict';

const SBO_INTERCHANGE = {
  SBO01: ['M222', 'CO01', 'KS21', 'JD06'],
  SBO05: ['SHX08', 'SSK06'],
  SBO07: ['M230', 'M415'],
  SBO10: [
    'M1027',
    { code: 'SSK01', transferMin: 5 },
    'M1028',
    'AX08',
    { code: 'AK02', transferMin: 10 },
  ],
};

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
    totalKm:       16.53,
    totalStations: 10,
    stations: [
      { code: 'SBO01', name: 'Oitsura', kanji: '粕鵲', km: 0.00 }, /* node 201351276 */
      { code: 'SBO02', name: 'Otsumi-Oitsura', kanji: '南粕鵲', km: 1.27 }, /* node 201351277 */
      { code: 'SBO03', name: 'Arasatolo', kanji: '', km: 2.38 }, /* node 201351278 */
      { code: 'SBO04', name: 'Oboesāri', kanji: '岡川', km: 4.16 }, /* node 201351279 */
      { code: 'SBO05', name: 'Yakkomai', kanji: '藥孤梅', km: 5.35 }, /* node 201351280 */
      { code: 'SBO06', name: 'Takurake Nagida', kanji: '', km: 6.51 }, /* node 201351281 */
      { code: 'SBO07', name: 'Kawaei', kanji: '珂夬栄', km: 8.06 }, /* node 126666499 */
      /* Extension: awaiting additional services; existing trains end at SBO07. */
      { code: 'SBO08', name: 'Osenude Keiðaī Daigaku', kanji: '防斉經濟大學', km: 11.03 }, /* node 20114044 */
      { code: 'SBO09', name: 'Kanui Airport T2', kanji: '嘉枡空港T2', km: 13.15 }, /* node 378079140 */
      { code: 'SBO10', name: 'Kanui Airport T1', kanji: '嘉枡空港T1', km: 16.53 }, /* node 126497710 */
    ],
  },
};

if (typeof SUBURBAN_LINES !== 'undefined') {
  Object.assign(SUBURBAN_LINES, SBO_LINES);
}
if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
  const _has = (arr, code) => arr.some(e => (e && e.code ? e.code : e) === code);
  for (const [sboCode, partners] of Object.entries(SBO_INTERCHANGE)) {
    if (!SUBURBAN_INTERCHANGE[sboCode]) SUBURBAN_INTERCHANGE[sboCode] = [];
    for (const partner of partners) {
      const code = typeof partner === 'object' ? partner.code : partner;
      if (!_has(SUBURBAN_INTERCHANGE[sboCode], code)) {
        SUBURBAN_INTERCHANGE[sboCode].push(partner);
      }
    }
  }
}

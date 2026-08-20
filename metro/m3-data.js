/* ================================================================
   M3-DATA.JS — Metro Line 3
   ================================================================
   35 stazioni (34 + M3150 branch node) · ~43 km
   Distanze progressive da M301 (Ansan Shakuiadae) a M334 (Iyogateri).
   M3150 Shakihori è il capolinea del bramo M3100, a km 18.90
   (1.52 km prima di M315 Niji-Shakihori).

   Interscambi principali:
     M301 Ansan Shakuiadae                   — KA12
     M303 Sainðaul Univ. of Foreign Studies  — KA10
     M306 Moriyose                           — MX10, CK33
     M313 Bibawara                           — KS10
     M3150 Shakihori (branch terminus)       — M1001 (M3100), SK19, CK27, KS11
     M315 Niji-Shakihori                     — M1002
     M316 Rillantsoye                        — M1003
     M317 Shakihori Sports Park              — M1004
     M318 Komayunden-Dōnmus Kōwen           — M1005, M824
     M319 Garotsu Lake                       — M1006
     M320 Shin-Makurigawa                    — M1806
     M321 Tsenduma                           — M17XX (TBD)
     M322 Shiitehongi                        — LL03, SK24, CK22
     M323 Ekinðuka                           — M403
     M324 Rosemane                           — M1421, KD31, JD02
     M325 Masuda Agarai                      — M118, M209, M1422, M911
     M326 Kansāri                            — M1423, M1017
     M327 Herubori                           — LL17, AX07, SX01, SB04, HC01, M1209
     M328 Amachi Kanlikoika                  — TD01
     M329 Yunpotsai Soisuma                  — M1426, M1815
     M330 Intsushitsa Kuyakujo               — M1211
     M331 Shin-Tsaikikori                    — M916, M17XX (TBD), SB07
     M332 Ðaihate                            — M17XX (TBD)
     M334 Iyogateri                          — PF05
================================================================ */
'use strict';

const M3_ST = {
  M301:  { n: 'Ansan Shakuiadae',                      k: '鞍山・湖前',           km:  0.00 },
  M302:  { n: 'Hattanjima',                             k: '淵湧',                km:  1.31 },
  M303:  { n: 'Sainðaul University of Foreign Studies', k: '作外大前',             km:  3.25 },
  M304:  { n: 'Sanzhō',                                 k: '参淨',                km:  6.01 },
  M305:  { n: 'Chastano',                               k: '椋見',                km:  8.44 },
  M306:  { n: 'Moriyose',                               k: '竹峰',                km:  9.54 },
  M307:  { n: 'Moriyose Nanmun',                        k: '',                    km: 10.34 },
  M308:  { n: 'Kanegodaul',                             k: '',                    km: 11.35 },
  M309:  { n: 'Ōgatanata',                              k: '大泉町',               km: 12.60 },
  M310:  { n: 'Gamonate',                               k: '',                    km: 14.03 },
  M311:  { n: 'Innotawa',                               k: '',                    km: 15.32 },
  M312:  { n: 'Nari-Surikato',                          k: '東須里日',             km: 16.58 },
  M313:  { n: 'Bibawara',                               k: '琵芭緩',               km: 17.88 },
  M314:  { n: 'Gawaraze',                               k: '',                    km: 19.14 },
  M3150: { n: 'Shakihori',                              k: '石登',                km: 18.90 },
  M315:  { n: 'Niji-Shakihori',                         k: '',                    km: 20.42 },
  M316:  { n: 'Rillantsoye',                            k: '',                    km: 21.31 },
  M317:  { n: 'Shakihori Sports Park',                  k: '石登ટેર૾દ્ઢારઃદ્ડા',  km: 22.48 },
  M318:  { n: 'Komayunden - Dōnmus Kōwen',              k: '冬允殿-動物公園',       km: 23.82 },
  M319:  { n: 'Garotsu Lake',                           k: '賀呂都湖',             km: 24.69 },
  M320:  { n: 'Shin-Makurigawa',                        k: '新炭畦',               km: 26.27 },
  M321:  { n: 'Tsenduma',                               k: '',                    km: 27.31 },
  M322:  { n: 'Shiitehongi',                            k: '茛本名',               km: 28.94 },
  M323:  { n: 'Ekinðuka',                               k: '虓પ્鵜',               km: 30.40 },
  M324:  { n: 'Rosemane',                               k: '酢丘',                km: 31.08 },
  M325:  { n: 'Masuda Agarai',                          k: '馬砅任尭',             km: 32.25 },
  M326:  { n: 'Kansāri',                                k: '官川',                km: 33.08 },
  M327:  { n: 'Herubori',                               k: '杏登',                km: 33.99 },
  M328:  { n: 'Amachi Kanlikoika',                      k: '貽知官梨柳',           km: 35.24 },
  M329:  { n: 'Yunpotsai Soisuma',                      k: '',                    km: 36.57 },
  M330:  { n: 'Intsushitsa Kuyakujo',                   k: '鰤基區役所',           km: 38.09 },
  M331:  { n: 'Shin-Tsaikikori',                        k: '',                    km: 39.33 },
  M332:  { n: 'Ðaihate',                                k: '',                    km: 40.59 },
  M333:  { n: 'Kanlikoika Yukashire',                   k: '',                    km: 41.69 },
  M334:  { n: 'Iyogateri',                              k: '',                    km: 43.03 },
};

/* Ordine canonico geografico: M301 (nord) → M334 (sud)
   M3150 è il capolinea del bramo M3100 (Shakihori), a km 18.90.
   I servizi main-line (AS, EXP) non fermano a M3150 —
   solo LIM_N/LIM_S lo usano come capolinea. */
const M3_CANONICAL_ORDER = [
  'M301', 'M302', 'M303', 'M304', 'M305', 'M306', 'M307', 'M308',
  'M309', 'M310', 'M311', 'M312', 'M313', 'M314', 'M315', 'M316',
  'M317', 'M318', 'M319', 'M320', 'M321', 'M322', 'M323', 'M324',
  'M325', 'M326', 'M327', 'M328', 'M329', 'M330', 'M331', 'M332',
  'M333', 'M334',
];

/* Ordine per il bramo M3150 → M334 */
const M3_FROM_M3150 = [
  'M3150', 'M315', 'M316', 'M317', 'M318', 'M319', 'M320', 'M321',
  'M322',  'M323', 'M324', 'M325', 'M326', 'M327', 'M328', 'M329',
  'M330',  'M331', 'M332', 'M333', 'M334',
];

const M3_META = {
  id:          'M3',
  code:        'M3',
  name:        'Line 3',
  nameJa:      '',
  color:       '#009E4F',
  totalKm:     43.03,
  stations:    34,
  avgSpeedKmh: 35,
  dwellSec:    20,
};

/* ----------------------------------------------------------------
   Interscambi Metro Line 3 ↔ altre reti
---------------------------------------------------------------- */
const M3_INTERCHANGE = {
  M301: [
    { code: 'KA12', network: 'suburban', transferMin: 4,
      note: 'Ansan Shakuiadae — KA line' },
  ],
  M303: [
    { code: 'KA10', network: 'suburban', transferMin: 4,
      note: 'Sainðaul University of Foreign Studies — KA line' },
  ],
  M306: [
    { code: 'MX10', network: 'suburban', transferMin: 4,
      note: 'Moriyose — MX line' },
    { code: 'CK33', network: 'suburban', transferMin: 4,
      note: 'Moriyose — CK line' },
  ],
  M313: [
    { code: 'KS10', network: 'suburban', transferMin: 3,
      note: 'Bibawara — Kawasabu Line' },
  ],
  M3150: [
    { code: 'M1001', network: 'metro',    transferMin: 3,
      note: 'Shakihori — M3100 branch terminus' },
    { code: 'SK19',  network: 'suburban', transferMin: 3,
      note: 'Shakihori — Seishaku Line' },
    { code: 'CK27',  network: 'suburban', transferMin: 3,
      note: 'Shakihori — CK line' },
    { code: 'KS11',  network: 'suburban', transferMin: 3,
      note: 'Shakihori — Kawasabu Line' },
  ],
  M315: [
    { code: 'M1002', network: 'metro', transferMin: 3,
      note: 'Niji-Shakihori — M3 internal node' },
  ],
  M316: [
    { code: 'M1003', network: 'metro', transferMin: 3,
      note: 'Rillantsoye — M3 internal node' },
  ],
  M317: [
    { code: 'M1004', network: 'metro', transferMin: 3,
      note: 'Shakihori Sports Park — M3 internal node' },
  ],
  M318: [
    { code: 'M1005', network: 'metro', transferMin: 3,
      note: 'Komayunden-Dōnmus Kōwen — M3 internal node' },
    { code: 'M824',  network: 'metro', transferMin: 4,
      note: 'Komayunden-Dōnmus Kōwen — M8 line' },
  ],
  M319: [
    { code: 'M1006', network: 'metro', transferMin: 3,
      note: 'Garotsu Lake — M3 internal node' },
  ],
  M320: [
    { code: 'M1806', network: 'metro', transferMin: 3,
      note: 'Shin-Makurigawa — M18 line' },
  ],
  M321: [
    // M17XX — interscambio con M17, codice stazione TBD
    // { code: 'M17XX', network: 'metro', transferMin: 3, note: 'Tsenduma — M17 line (TBD)' },
  ],
  M322: [
    { code: 'LL03', network: 'suburban', transferMin: 4,
      note: 'Shiitehongi — Loop Line' },
    { code: 'SK24', network: 'suburban', transferMin: 4,
      note: 'Shiitehongi — Seishaku Line' },
    { code: 'CK22', network: 'suburban', transferMin: 4,
      note: 'Shiitehongi — CK line' },
  ],
  M323: [
    { code: 'M403', network: 'metro', transferMin: 3,
      note: 'Ekinðuka — M4 line' },
  ],
  M324: [
    { code: 'M1421', network: 'metro',    transferMin: 3,
      note: 'Rosemane — M14 line' },
    { code: 'KD31',  network: 'suburban', transferMin: 4,
      note: 'Rosemane — Kidai Line' },
    { code: 'JD02',  network: 'suburban', transferMin: 4,
      note: 'Jōdai Line — Rosemane, stesso nome (node 146642920)' },
  ],
  M325: [
    { code: 'M118',  network: 'metro',    transferMin: 3,
      note: 'Masuda Agarai — M1 line' },
    { code: 'M209',  network: 'metro',    transferMin: 9,
      note: 'M2 Masuda Hibaru — stazione diversa, 400 m transfer corridor' },
    { code: 'M1422', network: 'metro',    transferMin: 3,
      note: 'Masuda Agarai — M14 line' },
    { code: 'M911',  network: 'metro',    transferMin: 4,
      note: 'Masuda Agarai — M9 line' },
  ],
  M326: [
    { code: 'M1423', network: 'metro', transferMin: 3,
      note: 'Kansāri — M14 line' },
    { code: 'M1017', network: 'metro', transferMin: 3,
      note: 'Kansāri — M3 internal node' },
  ],
  M327: [
    { code: 'LL17',  network: 'suburban', transferMin: 4,
      note: 'Herubori — Loop Line' },
    { code: 'AX07',  network: 'ax',       transferMin: 5,
      note: 'Herubori — Airport Express' },
    { code: 'SX01',  network: 'suburban', transferMin: 4,
      note: 'Herubori — SX line' },
    { code: 'SB04',  network: 'suburban', transferMin: 4,
      note: 'Herubori — SB line' },
    { code: 'HC01',  network: 'suburban', transferMin: 4,
      note: 'Herubori — HC line' },
    { code: 'M1209', network: 'metro',    transferMin: 3,
      note: 'Herubori — M12 line' },
  ],
  M328: [
    { code: 'TD01', network: 'suburban', transferMin: 4,
      note: 'Amachi Kanlikoika — TD line' },
  ],
  M329: [
    { code: 'M1426', network: 'metro', transferMin: 3,
      note: 'Yunpotsai Soisuma — M14 line' },
    { code: 'M1815', network: 'metro', transferMin: 3,
      note: 'Yunpotsai Soisuma — M18 line' },
  ],
  M330: [
    { code: 'M1211', network: 'metro', transferMin: 3,
      note: 'Intsushitsa Kuyakujo — M12 line' },
  ],
  M331: [
    { code: 'M916', network: 'metro',    transferMin: 3,
      note: 'Shin-Tsaikikori — M9 line' },
    // M17XX TBD
    // { code: 'M17XX', network: 'metro', transferMin: 3, note: 'Shin-Tsaikikori — M17 line (TBD)' },
    { code: 'SB07', network: 'suburban', transferMin: 4,
      note: 'Shin-Tsaikikori — SB line' },
  ],
  M332: [
    // M17XX TBD
    // { code: 'M17XX', network: 'metro', transferMin: 3, note: 'Ðaihate — M17 line (TBD)' },
  ],
  M334: [
    { code: 'PF05', network: 'suburban', transferMin: 4,
      note: 'Iyogateri — PF line' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M3_META, M3_ST, M3_CANONICAL_ORDER, M3_FROM_M3150, M3_INTERCHANGE };
}

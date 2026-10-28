/* ================================================================
   RKY-DATA.JS — Rinkyun Railway Main Line
   臨急鉄道本線 — Linea privata · zona Rinkyun

   Operatore : Rinkyun Railway
   Tipo      : Privata suburbana
   Capolinea : RKY01 Sakamuso ↔ RKY14 Riimibaiken
   Lunghezza : 16.70 km · 14 stazioni

   Interscambi:
     RKY01 (Sakamuso)        ↔ HUB_SAKAMUSO
     RKY03 (Shiittaru Kone)  ↔ M1618
     RKY04 (Ikasurun-Owonideki) ↔ M1113, M718 (6 min a piedi)
     RKY05 (Bawangitan)      ↔ M716
     RKY06 (Akagae Nosori)   ↔ M507
     RKY07 (Ipporai-Shindari) ↔ M619
     RKY09 (Ashihara Jaiken) ↔ M1729 (Ashihara Zumajihan, 5 min)
     RKY13 (Tsuruna Yuikinjan) ↔ RI02, CK09, CO31 (Shin-Tsuruna, 6 min)
     RKY14 (Riimibaiken)     ↔ M705, RI01, CO32, CK08, AX03

   Thru Service:
     RKY01 ↔ M2007 (Metro Line 20) a Sakamuso.
================================================================ */
'use strict';

var _hub = (typeof _hub !== 'undefined')
  ? _hub
  : (hubId, min = null, note = '') => ({ hubId, transferMin: min, note });

const RKY_INTERCHANGE = {
  RKY01: [_hub('HUB_SAKAMUSO')],
  RKY03: ['M1618'],
  RKY04: [{ code: 'M1113', transferMin: 6 }, { code: 'M718', transferMin: 6 }],
  RKY05: ['M716'],
  RKY06: ['M507'],
  RKY07: ['M619'],
  RKY09: [{ code: 'M1729', transferMin: 5 }],
  RKY13: [{ code: 'RI02', transferMin: 6 }, { code: 'CK09', transferMin: 6 }, { code: 'CO31', transferMin: 6 }],
  RKY14: ['M705', 'RI01', 'CO32', 'CK08', 'AX03'],
};

const RKY_LINES = {
  RKY: {
    id:            'RKY',
    name:          'Rinkyun Railway Main Line',
    nameJa:        '臨急鉄道本線',
    color:         '#A3DE8C',
    operator:      'Rinkyun Railway',
    operatorJa:    '',
    type:          'private',
    region:        'Rinkyun',
    circular:      false,
    totalKm:       16.70,
    totalStations: 14,
    headwayPeak:    10,
    headwayOffPeak: 10,
    stations: [
      { code: 'RKY01', name: 'Sakamuso',              kanji: '沛坤',       km:  0.00 },  /* node 176874425 */
      { code: 'RKY02', name: 'Himatoshi Tohtomai',    kanji: '妃満夫昧',   km:  1.20 },  /* node 452748385 */
      { code: 'RKY03', name: 'Shiittaru Kone',        kanji: '',           km:  2.08 },  /* node 147984629 */
      { code: 'RKY04', name: 'Ikasurun - Owonideki',  kanji: '',           km:  3.67 },  /* node 147984631 */
      { code: 'RKY05', name: 'Bawangitan',            kanji: '',           km:  5.70 },  /* node 123393743 */
      { code: 'RKY06', name: 'Akagae Nosori',         kanji: '蛞外見祖里', km:  7.11 },  /* node 147984628 */
      { code: 'RKY07', name: 'Ipporai - Shindari',    kanji: '一蒲崍新艏', km:  8.34 },  /* node 136114715 */
      { code: 'RKY08', name: 'Nari-Nawadae',          kanji: '東兆先',     km:  9.27 },  /* node 147984626 */
      { code: 'RKY09', name: 'Ashihara Jaiken',       kanji: '',           km: 10.86 },  /* node 147984625 */
      { code: 'RKY10', name: 'Yutesoha Koiroi',       kanji: '',           km: 12.06 },  /* node 193804078 */
      { code: 'RKY11', name: 'Niji-Tsuruna',          kanji: '西鵺',       km: 13.43 },  /* node 148019491 */
      { code: 'RKY12', name: 'Noganawi Hisane',       kanji: '',           km: 14.79 },  /* node 148019533 */
      { code: 'RKY13', name: 'Tsuruna Yuikinjan',     kanji: '鵺唯金浅',   km: 15.65 },  /* node 194168878 */
      { code: 'RKY14', name: 'Riimibaiken',           kanji: '𠝏卞',       km: 16.70 },  /* node 126754745 */
    ],
  },
};

const RKY_SERVICES = [
  {
    id:       'RKY1',
    desc:     'Local',
    fromCode: 'RKY01',
    toCode:   'RKY14',
    headway:  10,
    stops:    [],
    firstDep: '06:00',
    lastDep:  '22:00',
  },
  {
    id:       'RKY1',
    desc:     'Local',
    fromCode: 'RKY14',
    toCode:   'RKY01',
    headway:  10,
    stops:    [],
    firstDep: '06:00',
    lastDep:  '22:00',
  },
];

if (typeof SUBURBAN_LINES !== 'undefined') {
  Object.assign(SUBURBAN_LINES, RKY_LINES);
}
if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
  for (const [code, partners] of Object.entries(RKY_INTERCHANGE)) {
    const list = SUBURBAN_INTERCHANGE[code] || (SUBURBAN_INTERCHANGE[code] = []);
    for (const entry of partners) {
      const c = typeof entry === 'string' ? entry : entry.code;
      if (!list.some(e => (typeof e === 'string' ? e : e.code) === c)) list.push(entry);
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = { RKY_LINES, RKY_INTERCHANGE, RKY_SERVICES };
}

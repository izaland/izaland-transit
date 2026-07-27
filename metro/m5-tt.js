/* ================================================================
   M5-TT.JS — Metro Line 5 · Timetable
   ================================================================
   Il timetable è generato runtime da MetroRouter usando M5_HEADWAY
   e avgSpeedKmh definiti in m5-data.js.

   Servizi:
     A_N  M501 Tsuragoi → M514 Jisahara  (northbound/terminus A → B)
     A_S  M514 Jisahara → M501 Tsuragoi  (southbound/terminus B → A)
================================================================ */
'use strict';

const M5_SERVICES_NORM = [
  {
    id:         'M5',
    svcLogical: 'A_N',
    name:       'All-stop (M501→M514)',
    color:      '#9e6a51',
    cls:        'metro',
    rapid:      false,
    headway:    M5_HEADWAY,
    stops:      M5_CANONICAL_ORDER,
  },
  {
    id:         'M5',
    svcLogical: 'A_S',
    name:       'All-stop (M514→M501)',
    color:      '#9e6a51',
    cls:        'metro',
    rapid:      false,
    headway:    M5_HEADWAY,
    stops:      [...M5_CANONICAL_ORDER].reverse(),
  },
];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M5',
    meta:        M5_META,
    st:          M5_ST,
    services:    M5_SERVICES_NORM,
    interchange: M5_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M5_SERVICES_NORM };
}

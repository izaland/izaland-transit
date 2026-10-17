/* ================================================================
   M20-TT.JS — Metro Line 20 · Timetable
   ================================================================
   Il timetable è generato runtime da MetroRouter usando M20_HEADWAY
   e avgSpeedKmh definiti in m20-data.js.

   Servizi:
     A_N  M2001 Sainðaul Central → M2007 Sakamuso
     A_S  M2007 Sakamuso → M2001 Sainðaul Central
================================================================ */
'use strict';

const M20_SERVICES_NORM = [
  {
    id:         'M20',
    svcLogical: 'A_N',
    name:       'All-stop (M2001→M2007)',
    color:      '#0F1F5C',
    cls:        'metro',
    rapid:      false,
    headway:    M20_HEADWAY,
    stops:      M20_CANONICAL_ORDER,
  },
  {
    id:         'M20',
    svcLogical: 'A_S',
    name:       'All-stop (M2007→M2001)',
    color:      '#0F1F5C',
    cls:        'metro',
    rapid:      false,
    headway:    M20_HEADWAY,
    stops:      [...M20_CANONICAL_ORDER].reverse(),
  },
];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M20',
    meta:        M20_META,
    st:          M20_ST,
    services:    M20_SERVICES_NORM,
    interchange: M20_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M20_SERVICES_NORM };
}

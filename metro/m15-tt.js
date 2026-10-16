/* ================================================================
   M15-TT.JS — Metro Line 15 (#db287a) · Timetable
   Dipende da: metro/m15-data.js, metro/metro-router.js
   Servizi: B_S SAIA Cargo Center → Sakamuso, B_N Sakamuso → SAIA Cargo Center (all-stop)
   TODO: headway provvisorio (profilo M14/M11), da confermare.
================================================================ */
'use strict';

const M15_SERVICES_NORM = [
  {
    id:         'M15',
    svcLogical: 'B_S',
    name:       'All-stop (southbound)',
    color:      '#db287a',
    cls:        'metro',
    rapid:      false,
    headway:    M15_HEADWAY,
    stops:      M15_CANONICAL_ORDER,
  },
  {
    id:         'M15',
    svcLogical: 'B_N',
    name:       'All-stop (northbound)',
    color:      '#db287a',
    cls:        'metro',
    rapid:      false,
    headway:    M15_HEADWAY,
    stops:      [...M15_CANONICAL_ORDER].reverse(),
  },
];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M15',
    meta:        M15_META,
    st:          M15_ST,
    services:    M15_SERVICES_NORM,
    interchange: M15_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M15_SERVICES_NORM };
}

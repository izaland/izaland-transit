/* ================================================================
   M14-TT.JS — Metro Line 14 (#72E400) · Timetable
   Dipende da: metro/m14-data.js, metro/metro-router.js
   Servizi: B_S Migawarae → Tanjānli, B_N Tanjānli → Migawarae (all-stop)
   TODO: headway provvisorio (profilo M11), da confermare.
================================================================ */
'use strict';

const M14_SERVICES_NORM = [
  {
    id:         'M14',
    svcLogical: 'B_S',
    name:       'All-stop (southbound)',
    color:      '#72E400',
    cls:        'metro',
    rapid:      false,
    headway:    M14_HEADWAY,
    stops:      M14_CANONICAL_ORDER,
  },
  {
    id:         'M14',
    svcLogical: 'B_N',
    name:       'All-stop (northbound)',
    color:      '#72E400',
    cls:        'metro',
    rapid:      false,
    headway:    M14_HEADWAY,
    stops:      [...M14_CANONICAL_ORDER].reverse(),
  },
];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M14',
    meta:        M14_META,
    st:          M14_ST,
    services:    M14_SERVICES_NORM,
    interchange: M14_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M14_SERVICES_NORM };
}

/* ================================================================
   M9-TT.JS — Metro Line 9 · Timetable
   ================================================================
   Servizio A: all-stop M901↔M921.
   10 TPH (6 min) base; 12 TPH (5 min) nei semi-picchi;
   20 TPH (3 min) nei picchi. Valido in entrambe le direzioni.
================================================================ */
'use strict';

const M9_SERVICES_NORM = [
  {
    id: 'M9', svcLogical: 'A', name: 'All-stop (M901↔M921)',
    color: '#C40062', cls: 'metro', rapid: false,
    stops: M9_CANONICAL_ORDER,
    headwayOutbound: M9_HEADWAY,
    headwayInbound:  M9_HEADWAY,
    offsetOutboundMin: 0,
    offsetInboundMin:  0,
  },
];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M9',
    meta:        M9_META,
    st:          M9_ST,
    services:    M9_SERVICES_NORM,
    interchange: M9_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M9_SERVICES_NORM };
}

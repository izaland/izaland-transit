/* ================================================================
   M9-TT.JS — Metro Line 9 · Timetable
   ================================================================
   PROVVISORIO: orari e frequenze da definire.
   Servizio A: all-stop M901↔M921, ogni 6 min, 05:00–23:54.
================================================================ */
'use strict';

const M9_SERVICES_NORM = [
  {
    id: 'M9', svcLogical: 'A', name: 'All-stop (M901↔M921)',
    color: '#C40062', cls: 'metro', rapid: false,
    stops: M9_CANONICAL_ORDER,
    headwayOutbound: [{ from: '05:00', to: '23:54', headwayMin: 6 }],
    headwayInbound:  [{ from: '05:00', to: '23:54', headwayMin: 6 }],
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

/* ================================================================
   M7-TT.JS — Metro Line 7 · Timetable
   ================================================================
   Servizi:
     A  All-stop M701↔M728, 6 TPH
        da M701 dalle 04:55 (ultima 23:45)
        da M728 dalle 05:13 (ultima 23:53)
     R  Rinforzo M705↔M725, +6 TPH incrociati col servizio A
     P  Rinforzo punta M701↔M728, 3 TPH (07:00–09:00, 18:00–20:00)

   NB: usa offsetOutboundMin / offsetInboundMin, da supportare
   in metro-router.js (ripiego su offsetMin).
================================================================ */
'use strict';

const _M7_REINF = M7_CANONICAL_ORDER.slice(
  M7_CANONICAL_ORDER.indexOf('M705'),
  M7_CANONICAL_ORDER.indexOf('M725') + 1
);

const _M7_PEAK = (hw) => [
  { from: '07:00', to: '09:00', headwayMin: hw },
  { from: '18:00', to: '20:00', headwayMin: hw },
];

const M7_SERVICES_NORM = [
  {
    id: 'M7', svcLogical: 'A', name: 'All-stop (M701↔M728)',
    color: '#00a0bc', cls: 'metro', rapid: false,
    stops: M7_CANONICAL_ORDER,
    headwayOutbound: [{ from: '04:55', to: '23:46', headwayMin: 10 }],
    headwayInbound:  [{ from: '05:13', to: '23:54', headwayMin: 10 }],
    offsetOutboundMin: 5,
    offsetInboundMin:  3,
  },
  {
    id: 'M7', svcLogical: 'R', name: 'Rinforzo (M705↔M725)',
    color: '#00a0bc', cls: 'metro', rapid: false,
    stops: _M7_REINF,
    headwayOutbound: [{ from: '04:55', to: '23:46', headwayMin: 10 }],
    headwayInbound:  [{ from: '05:13', to: '23:54', headwayMin: 10 }],
    offsetOutboundMin: 0,
    offsetInboundMin:  8,
  },
  {
    id: 'M7', svcLogical: 'P', name: 'Rinforzo punta (M701↔M728)',
    color: '#00a0bc', cls: 'metro', rapid: false,
    stops: M7_CANONICAL_ORDER,
    headwayOutbound: _M7_PEAK(20),
    headwayInbound:  _M7_PEAK(20),
    offsetOutboundMin: 2,
    offsetInboundMin:  0,
  },
];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M7',
    meta:        M7_META,
    st:          M7_ST,
    services:    M7_SERVICES_NORM,
    interchange: M7_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M7_SERVICES_NORM };
}

/* ================================================================
   M20-TT.JS — Metro Line 20 · Timetable
   ================================================================
   Il timetable è generato runtime da MetroRouter usando le frequenze
   e le velocità definite in m20-data.js.

   Servizi (ognuno in due direzioni):
     LO_N / LO_S  Locale, tutte le fermate (M2001↔M2007)
     EX_N / EX_S  Express, solo M2001 · M2004 · M2007
================================================================ */
'use strict';

const M20_REV = (a) => [...a].reverse();

const M20_SERVICES_NORM = [
  {
    id: 'M20', svcLogical: 'LO_N', name: 'Local (M2001→M2007)',
    color: '#0F1F5C', cls: 'svc-LO', rapid: false, speedKmh: M20_SPD.LO,
    headway: M20_HEADWAY_LO, stops: M20_SVC.LO.stops,
  },
  {
    id: 'M20', svcLogical: 'LO_S', name: 'Local (M2007→M2001)',
    color: '#0F1F5C', cls: 'svc-LO', rapid: false, speedKmh: M20_SPD.LO,
    headway: M20_HEADWAY_LO, stops: M20_REV(M20_SVC.LO.stops),
  },
  {
    id: 'M20', svcLogical: 'EX_N', name: 'Express (M2001→M2007)',
    color: '#0F1F5C', cls: 'svc-EX', rapid: true, speedKmh: M20_SPD.EX,
    headway: M20_HEADWAY_EX, stops: M20_SVC.EX.stops,
  },
  {
    id: 'M20', svcLogical: 'EX_S', name: 'Express (M2007→M2001)',
    color: '#0F1F5C', cls: 'svc-EX', rapid: true, speedKmh: M20_SPD.EX,
    headway: M20_HEADWAY_EX, stops: M20_REV(M20_SVC.EX.stops),
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

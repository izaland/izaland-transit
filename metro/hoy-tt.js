/* ================================================================
   HOY-TT.js — Hoze-Oyehatton Line · orari sintetici
   ================================================================
   Servizio semplice all-stop, treni metro automatica driverless
   con sosta rapida (20 s).
     Punta (peak):          ogni 2 min
     Medio (average):       ogni 5 min
     Morbida (off-peak):    ogni 7 min

   Il timetable è generato runtime da MetroRouter (stesso schema di
   m5-tt.js). La linea DEVE chiamare MetroRouter.register() in fondo,
   altrimenti le stazioni non compaiono nel Journey Planner.

   Servizi:
     A_N  HOY01 Takatsura → HOY13 Kadokamahiwa
     A_S  HOY13 Kadokamahiwa → HOY01 Takatsura
================================================================ */
'use strict';

const HOY_HEADWAY = [
  { from: '05:00', to: '06:30', headwayMin: 7 },  // off-peak
  { from: '06:30', to: '07:00', headwayMin: 5 },  // average
  { from: '07:00', to: '09:30', headwayMin: 2 },  // peak
  { from: '09:30', to: '17:00', headwayMin: 5 },  // average
  { from: '17:00', to: '20:00', headwayMin: 2 },  // peak
  { from: '20:00', to: '22:30', headwayMin: 5 },  // average
  { from: '22:30', to: '24:30', headwayMin: 7 },  // off-peak
];

const HOY_TT = {
  line:      'HOY',
  service:   'A',            // all-stop
  dwellSec:  20,
  driverless: true,
  headway:   HOY_HEADWAY,
};

const HOY_SERVICES_NORM = [
  {
    id:         'HOY',
    svcLogical: 'A_N',
    name:       'All-stop (HOY01→HOY13)',
    color:      '#3588cc',
    cls:        'metro',
    rapid:      false,
    headway:    HOY_HEADWAY,
    stops:      HOY_CANONICAL_ORDER,
  },
  {
    id:         'HOY',
    svcLogical: 'A_S',
    name:       'All-stop (HOY13→HOY01)',
    color:      '#3588cc',
    cls:        'metro',
    rapid:      false,
    headway:    HOY_HEADWAY,
    stops:      [...HOY_CANONICAL_ORDER].reverse(),
  },
];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'HOY',
    meta:        HOY_META,
    st:          HOY_ST,
    services:    HOY_SERVICES_NORM,
    interchange: HOY_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { HOY_HEADWAY, HOY_TT, HOY_SERVICES_NORM };
}

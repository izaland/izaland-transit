/* ================================================================
   HOY-TT.js — Hoze-Oyehatton Line · orari sintetici
   ================================================================
   Servizio semplice all-stop, treni metro automatica driverless
   con sosta rapida (20 s).
     Punta (peak):          ogni 2 min
     Medio (average):       ogni 5 min
     Morbida (off-peak):    ogni 7 min
   NOTA: formato basato sulle convenzioni dei file *-data.js;
   da allineare a m15-tt.js se il loader richiede altro.
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

if (typeof module !== 'undefined') {
  module.exports = { HOY_HEADWAY, HOY_TT };
}

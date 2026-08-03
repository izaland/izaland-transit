/* ================================================================
   M1-TT.JS — Metro Line 1 · Timetable & Router Registration
   ================================================================
   Servizi:
     A_W  Alkuitsa (M110) → Enikezya Forum (M144)  [All-stop]
     A_E  Enikezya Forum (M144) → Alkuitsa (M110)  [All-stop]

   Frequenza: 6 tph (headway 10 min) sull’intera giornata operativa
   (05:00 – 24:30). Servizio rapido da aggiungere in futuro.

   Dipende da: m1-data.js  (M1_ST, M1_META, M1_CANONICAL_ORDER,
               M1_INTERCHANGE)
   Questo file va caricato DOPO m1-data.js nell’HTML.
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   Profilo frequenze M1: 6 tph = headway 10 min costante
   (override del M1_HEADWAY di m1-data.js, più semplice)
---------------------------------------------------------------- */
const M1_HEADWAY_10 = [
  { from: '05:00', to: '24:30', headwayMin: 10 },
];

/* ----------------------------------------------------------------
   Servizi normalizzati per MetroRouter
---------------------------------------------------------------- */
const M1_SERVICES_NORM = [
  {
    id:         'M1',
    svcLogical: 'A_W',
    name:       'All-stop (westbound)',
    color:      '#E60026',
    cls:        'metro',
    rapid:      false,
    headway:    M1_HEADWAY_10,
    stops:      M1_CANONICAL_ORDER,          // M110 → M144
  },
  {
    id:         'M1',
    svcLogical: 'A_E',
    name:       'All-stop (eastbound)',
    color:      '#E60026',
    cls:        'metro',
    rapid:      false,
    headway:    M1_HEADWAY_10,
    stops:      [...M1_CANONICAL_ORDER].reverse(),  // M144 → M110
  },
];

/* ----------------------------------------------------------------
   Registrazione nel MetroRouter
---------------------------------------------------------------- */
if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M1',
    meta:        M1_META,
    st:          M1_ST,
    services:    M1_SERVICES_NORM,
    interchange: M1_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M1_SERVICES_NORM };
}

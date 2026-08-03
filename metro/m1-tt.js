/* ================================================================
   M1-TT.JS — Metro Line 1 · Timetable & Router Registration
   ================================================================

   SCHEMA SERVIZI
   ┌────────┬──────────────────┬─────────────────┬─────────┬─────────┐
   │ ID     │ Rotta                │ Orario          │ Headway │ Fermate │
   ├────────┼──────────────────┼─────────────────┼─────────┼─────────┤
   │ A_W    │ M110 → M144         │ 05:30 – 23:30   │  10 min │ full    │
   │ A_E    │ M144 → M110         │ 05:30 – 23:30   │  10 min │ full    │
   │ B_W    │ M110 → M128         │ 05:30 – 23:30   │  30 min │ M110–M128│
   │ B_E    │ M128 → M110         │ 05:30 – 23:30   │  30 min │ M128–M110│
   │ LN1_W  │ M110 → M128 (notte) │ 23:30 – 24:00   │  30 min │ M110–M128│
   │ LN1_E  │ M128 → M110 (notte) │ 23:30 – 24:00   │  30 min │ M128–M110│
   │ LN2_W  │ M110 → M122 (notte) │ 24:00 – 24:30   │  30 min │ M110–M122│
   └────────┴──────────────────┴─────────────────┴─────────┴─────────┘

   Logica frequenze diurne (M110–M128):
     - 6 tph totali = 1 treno ogni 10 min
     - 2 dei 6 sono limitati M110–M128 (ogni 30 min)
     - 4 dei 6 sono full M110–M144 (ogni 15 min)
     → Modellato come A_W headway 15 min + B_W headway 30 min
       (il router sovrappone i due pattern)

   Dipende da: m1-data.js  (M1_ST, M1_META, M1_CANONICAL_ORDER,
               M1_INTERCHANGE)
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   Stops troncati
---------------------------------------------------------------- */
const M1_STOPS_TO_M128 = M1_CANONICAL_ORDER.slice(
  0, M1_CANONICAL_ORDER.indexOf('M128') + 1
);  // M110 → M128 (19 stazioni)

const M1_STOPS_TO_M122 = M1_CANONICAL_ORDER.slice(
  0, M1_CANONICAL_ORDER.indexOf('M122') + 1
);  // M110 → M122 (13 stazioni)

/* ----------------------------------------------------------------
   Profili headway
---------------------------------------------------------------- */

// A_W / A_E — full (4 dei 6 tph diurni = 1 ogni 15 min)
const M1_HW_FULL = [
  { from: '05:30', to: '23:30', headwayMin: 15 },
];

// B_W / B_E — limitati diurni (2 dei 6 tph = 1 ogni 30 min)
const M1_HW_SHORT_DAY = [
  { from: '05:30', to: '23:30', headwayMin: 30 },
];

// LN1_W / LN1_E — notturno M110–M128 (23:30–24:00)
const M1_HW_LN1 = [
  { from: '23:30', to: '24:00', headwayMin: 30 },
];

// LN2_W — notturno M110–M122 (24:00–24:30)
const M1_HW_LN2 = [
  { from: '24:00', to: '24:30', headwayMin: 30 },
];

/* ----------------------------------------------------------------
   Servizi normalizzati per MetroRouter
---------------------------------------------------------------- */
const M1_SERVICES_NORM = [

  /* ── Full westbound (M110 → M144) — 4 tph diurni ── */
  {
    id:         'M1',
    svcLogical: 'A_W',
    name:       'All-stop (westbound)',
    color:      '#F77F00',
    cls:        'metro',
    rapid:      false,
    headway:    M1_HW_FULL,
    stops:      M1_CANONICAL_ORDER,
  },

  /* ── Full eastbound (M144 → M110) — 4 tph diurni ── */
  {
    id:         'M1',
    svcLogical: 'A_E',
    name:       'All-stop (eastbound)',
    color:      '#F77F00',
    cls:        'metro',
    rapid:      false,
    headway:    M1_HW_FULL,
    stops:      [...M1_CANONICAL_ORDER].reverse(),
  },

  /* ── Limitato diurno westbound (M110 → M128) — 2 tph ── */
  {
    id:         'M1',
    svcLogical: 'B_W',
    name:       'Limited (westbound, to Asaji Torimoshi)',
    color:      '#F77F00',
    cls:        'metro',
    rapid:      false,
    headway:    M1_HW_SHORT_DAY,
    stops:      M1_STOPS_TO_M128,
  },

  /* ── Limitato diurno eastbound (M128 → M110) — 2 tph ── */
  {
    id:         'M1',
    svcLogical: 'B_E',
    name:       'Limited (eastbound, to Alkuitsa)',
    color:      '#F77F00',
    cls:        'metro',
    rapid:      false,
    headway:    M1_HW_SHORT_DAY,
    stops:      [...M1_STOPS_TO_M128].reverse(),
  },

  /* ── Notturno LN1 westbound (M110 → M128, 23:30–24:00) ── */
  {
    id:         'M1',
    svcLogical: 'LN1_W',
    name:       'Late night limited (westbound, to Asaji Torimoshi)',
    color:      '#F77F00',
    cls:        'metro',
    rapid:      false,
    headway:    M1_HW_LN1,
    stops:      M1_STOPS_TO_M128,
  },

  /* ── Notturno LN1 eastbound (M128 → M110, 23:30–24:00) ── */
  {
    id:         'M1',
    svcLogical: 'LN1_E',
    name:       'Late night limited (eastbound, to Alkuitsa)',
    color:      '#F77F00',
    cls:        'metro',
    rapid:      false,
    headway:    M1_HW_LN1,
    stops:      [...M1_STOPS_TO_M128].reverse(),
  },

  /* ── Notturno LN2 westbound (M110 → M122, 24:00–24:30) ── */
  {
    id:         'M1',
    svcLogical: 'LN2_W',
    name:       'Late night limited (westbound, to Tensari Omuhate)',
    color:      '#F77F00',
    cls:        'metro',
    rapid:      false,
    headway:    M1_HW_LN2,
    stops:      M1_STOPS_TO_M122,
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

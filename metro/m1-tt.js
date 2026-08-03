/* ================================================================
   M1-TT.JS — Metro Line 1 · Timetable & Router Registration
   ================================================================

   SCHEMA SERVIZI
   ┌────────┬──────────────────────┬─────────────────┬─────────┐
   │ ID     │ Rotta                      │ Orario          │ Headway │
   ├────────┼──────────────────────┼─────────────────┼─────────┤
   │ A_W    │ M110 → M144 (all-stop)     │ 05:30 – 23:30   │  15 min │
   │ A_E    │ M144 → M110 (all-stop)     │ 05:30 – 23:30   │  15 min │
   │ B_W    │ M110 → M128 (limitato)     │ 05:30 – 23:30   │  30 min │
   │ B_E    │ M128 → M110 (limitato)     │ 05:30 – 23:30   │  30 min │
   │ E_W    │ M111 → M144 (express)      │ 07:00 – 22:00   │  15 min │
   │ E_E    │ M144 → M111 (express)      │ 07:00 – 22:00   │  15 min │
   │ LN1_W  │ M110 → M128 (notte)        │ 23:30 – 24:00   │  30 min │
   │ LN1_E  │ M128 → M110 (notte)        │ 23:30 – 24:00   │  30 min │
   │ LN2_W  │ M110 → M122 (notte)        │ 24:00 – 24:30   │  30 min │
   └────────┴──────────────────────┴─────────────────┴─────────┘

   Fermate Express (E_W / E_E) — 16 stazioni su 35:
     M111 Shimamera             (capolinea westbound)
     M115 Nimunoðai
     M117 Sainðaul Central
     M118 Masuda Agarai
     M119 Kushidaru Amiya
     M120 Tsumiji
     M121 Upajiya
     M122 Tensari Omuhate
     M126 Otsunuke 2sa
     M128 Asaji Torimoshi
     M130 Hintomaui
     M134 Watarui
     M139 Enikezya Sports Park
     M142 Enikezya
     M143 Shin-Enikezya
     M144 Enikezya Forum        (capolinea eastbound)

   Nota: M110 Alkuitsa non è servita dall’Express.
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

/* Fermate Express: M111 → M144, solo le stazioni con x */
const M1_STOPS_EXPRESS = [
  'M111',  // Shimamera
  'M115',  // Nimunoðai
  'M117',  // Sainðaul Central
  'M118',  // Masuda Agarai
  'M119',  // Kushidaru Amiya
  'M120',  // Tsumiji
  'M121',  // Upajiya
  'M122',  // Tensari Omuhate
  'M126',  // Otsunuke 2sa
  'M128',  // Asaji Torimoshi
  'M130',  // Hintomaui
  'M134',  // Watarui
  'M139',  // Enikezya Sports Park
  'M142',  // Enikezya
  'M143',  // Shin-Enikezya
  'M144',  // Enikezya Forum
];

/* ----------------------------------------------------------------
   Profili headway
---------------------------------------------------------------- */

// A_W / A_E — all-stop (4 dei 6 tph diurni = 1 ogni 15 min)
const M1_HW_FULL = [
  { from: '05:30', to: '23:30', headwayMin: 15 },
];

// B_W / B_E — limitati diurni M110–M128 (2 tph = 1 ogni 30 min)
const M1_HW_SHORT_DAY = [
  { from: '05:30', to: '23:30', headwayMin: 30 },
];

// E_W / E_E — Express (4 tph = 1 ogni 15 min, 07:00–22:00)
const M1_HW_EXPRESS = [
  { from: '07:00', to: '22:00', headwayMin: 15 },
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

  /* ── All-stop westbound (M110 → M144) — 4 tph diurni ── */
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

  /* ── All-stop eastbound (M144 → M110) — 4 tph diurni ── */
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

  /* ── Express westbound (M111 → M144) — 4 tph, 07:00–22:00 ── */
  {
    id:         'M1',
    svcLogical: 'E_W',
    name:       'Express (westbound)',
    color:      '#F77F00',
    cls:        'metro',
    rapid:      true,
    headway:    M1_HW_EXPRESS,
    stops:      M1_STOPS_EXPRESS,
  },

  /* ── Express eastbound (M144 → M111) — 4 tph, 07:00–22:00 ── */
  {
    id:         'M1',
    svcLogical: 'E_E',
    name:       'Express (eastbound)',
    color:      '#F77F00',
    cls:        'metro',
    rapid:      true,
    headway:    M1_HW_EXPRESS,
    stops:      [...M1_STOPS_EXPRESS].reverse(),
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

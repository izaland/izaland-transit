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
   │ EC_E   │ M144 → M110 (commuter rp.) │ 07:00 – 09:00   │  15 min │
   │ E_E    │ M144 → M111 (express)      │ 09:00 – 22:00   │  15 min │
   │ LN1_W  │ M110 → M128 (notte)        │ 23:30 – 24:00   │  30 min │
   │ LN1_E  │ M128 → M110 (notte)        │ 23:30 – 24:00   │  30 min │
   │ LN2_W  │ M110 → M122 (notte)        │ 24:00 – 24:30   │  30 min │
   └────────┴──────────────────────┴─────────────────┴─────────┘

   FERMATE EXPRESS E_W / E_E (16 stazioni):
     M111 M115 M117 M118 M119 M120 M121 M122
     M126 M128 M130 M134 M139 M142 M143 M144

   FERMATE COMMUTER RAPID EC_E (27 stazioni — salta M124 M125 M127 M132 M133 M135 M137 M138):
     M144 M143 M142 M141 M140* M139 M138* M137* M136 M135*
     M134 M133* M132* M131 M130 M129* M128 M127* M126 M125*
     M124* M123 M122 M121 M120 M119 M118 M117 M116 M115
     M114 M113 M112 M111 M110
     (* = non ferma)
     Ferma a: M144 M143 M142 M141 M139 M136 M134 M131 M130
              M128 M126 M123 M122 M121 M120 M119 M118 M117
              M116 M115 M114 M113 M112 M111 M110
              (vedi M1_STOPS_COMMUTER_RAPID sotto per lista esatta)

   Dipende da: m1-data.js
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   Stops troncati / selezionati
---------------------------------------------------------------- */
const M1_STOPS_TO_M128 = M1_CANONICAL_ORDER.slice(
  0, M1_CANONICAL_ORDER.indexOf('M128') + 1
);

const M1_STOPS_TO_M122 = M1_CANONICAL_ORDER.slice(
  0, M1_CANONICAL_ORDER.indexOf('M122') + 1
);

/* Express: M111→M144, 16 fermate */
const M1_STOPS_EXPRESS = [
  'M111', 'M115', 'M117', 'M118', 'M119', 'M120',
  'M121', 'M122', 'M126', 'M128', 'M130', 'M134',
  'M139', 'M142', 'M143', 'M144',
];

/*
   Commuter Rapid EC_E: M144→M110
   Tutte le fermate TRANNE M124, M125, M127, M132, M133, M135, M137, M138
   Partenza da M144 (inbound), capolinea M110.
*/
const M1_STOPS_COMMUTER_RAPID = M1_CANONICAL_ORDER.filter(
  c => !['M124','M125','M127','M132','M133','M135','M137','M138'].includes(c)
);  // 27 stazioni in ordine westbound (M110→M144)
// Per il servizio inbound invertiamo:
const M1_STOPS_COMMUTER_RAPID_E = [...M1_STOPS_COMMUTER_RAPID].reverse(); // M144→M110

/* ----------------------------------------------------------------
   Profili headway
---------------------------------------------------------------- */

// A_W / A_E — all-stop diurno (15 min)
const M1_HW_FULL = [
  { from: '05:30', to: '23:30', headwayMin: 15 },
];

// B_W / B_E — limitato M110–M128 (30 min)
const M1_HW_SHORT_DAY = [
  { from: '05:30', to: '23:30', headwayMin: 30 },
];

// E_W — Express outbound (07:00–22:00, 15 min)
const M1_HW_EXPRESS_W = [
  { from: '07:00', to: '22:00', headwayMin: 15 },
];

// EC_E — Commuter Rapid inbound (07:00–09:00, 15 min)
const M1_HW_COMMUTER = [
  { from: '07:00', to: '09:00', headwayMin: 15 },
];

// E_E — Express inbound (09:00–22:00, 15 min)
const M1_HW_EXPRESS_E = [
  { from: '09:00', to: '22:00', headwayMin: 15 },
];

// LN1 — notturno M110–M128 (23:30–24:00)
const M1_HW_LN1 = [
  { from: '23:30', to: '24:00', headwayMin: 30 },
];

// LN2 — notturno M110–M122 (24:00–24:30)
const M1_HW_LN2 = [
  { from: '24:00', to: '24:30', headwayMin: 30 },
];

/* ----------------------------------------------------------------
   Servizi normalizzati per MetroRouter
---------------------------------------------------------------- */
const M1_SERVICES_NORM = [

  /* ── All-stop westbound (M110 → M144) ── */
  {
    id: 'M1', svcLogical: 'A_W',
    name: 'All-stop (westbound)',
    color: '#F77F00', cls: 'metro', rapid: false,
    headway: M1_HW_FULL,
    stops: M1_CANONICAL_ORDER,
  },

  /* ── All-stop eastbound (M144 → M110) ── */
  {
    id: 'M1', svcLogical: 'A_E',
    name: 'All-stop (eastbound)',
    color: '#F77F00', cls: 'metro', rapid: false,
    headway: M1_HW_FULL,
    stops: [...M1_CANONICAL_ORDER].reverse(),
  },

  /* ── Limitato diurno westbound (M110 → M128) ── */
  {
    id: 'M1', svcLogical: 'B_W',
    name: 'Limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    headway: M1_HW_SHORT_DAY,
    stops: M1_STOPS_TO_M128,
  },

  /* ── Limitato diurno eastbound (M128 → M110) ── */
  {
    id: 'M1', svcLogical: 'B_E',
    name: 'Limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    headway: M1_HW_SHORT_DAY,
    stops: [...M1_STOPS_TO_M128].reverse(),
  },

  /* ── Express outbound (M111 → M144, 07:00–22:00) ── */
  {
    id: 'M1', svcLogical: 'E_W',
    name: 'Express (westbound)',
    color: '#F77F00', cls: 'metro', rapid: true,
    headway: M1_HW_EXPRESS_W,
    stops: M1_STOPS_EXPRESS,
  },

  /* ── Commuter Rapid inbound (M144 → M110, 07:00–09:00) ── */
  {
    id: 'M1', svcLogical: 'EC_E',
    name: 'Commuter Rapid (eastbound)',
    color: '#F77F00', cls: 'metro', rapid: true,
    headway: M1_HW_COMMUTER,
    stops: M1_STOPS_COMMUTER_RAPID_E,
  },

  /* ── Express inbound (M144 → M111, 09:00–22:00) ── */
  {
    id: 'M1', svcLogical: 'E_E',
    name: 'Express (eastbound)',
    color: '#F77F00', cls: 'metro', rapid: true,
    headway: M1_HW_EXPRESS_E,
    stops: [...M1_STOPS_EXPRESS].reverse(),
  },

  /* ── Notturno LN1 westbound (M110 → M128, 23:30–24:00) ── */
  {
    id: 'M1', svcLogical: 'LN1_W',
    name: 'Late night limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    headway: M1_HW_LN1,
    stops: M1_STOPS_TO_M128,
  },

  /* ── Notturno LN1 eastbound (M128 → M110, 23:30–24:00) ── */
  {
    id: 'M1', svcLogical: 'LN1_E',
    name: 'Late night limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    headway: M1_HW_LN1,
    stops: [...M1_STOPS_TO_M128].reverse(),
  },

  /* ── Notturno LN2 westbound (M110 → M122, 24:00–24:30) ── */
  {
    id: 'M1', svcLogical: 'LN2_W',
    name: 'Late night limited (westbound, to Tensari Omuhate)',
    color: '#F77F00', cls: 'metro', rapid: false,
    headway: M1_HW_LN2,
    stops: M1_STOPS_TO_M122,
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

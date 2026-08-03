/* ================================================================
   M1-TT.JS — Metro Line 1 · Timetable & Router Registration
   ================================================================

   SCHEMA SERVIZI
   ┌────────┬─────────────────────────────┬─────────────────┬─────────┬─────────┐
   │ ID     │ Rotta                       │ Orario          │ Headway │ Offset  │
   ├────────┼─────────────────────────────┼─────────────────┼─────────┼─────────┤
   │ A_W    │ M110 → M144 (all-stop)      │ 05:30 – 23:30   │  varia  │  +3 min │
   │ A_E    │ M144 → M110 (all-stop)      │ 05:30 – 23:30   │  varia  │  +3 min │
   │ B_W    │ M110 → M128 (limited)       │ 05:30 – 06:30   │  10 min │  +3 min │
   │ B_E    │ M128 → M110 (limited)       │ 05:30 – 06:30   │  10 min │  +3 min │
   │ B2_W   │ M110 → M128 (limited)       │ 09:30 – 17:00   │  10 min │  +6 min │
   │ B2_E   │ M128 → M110 (limited)       │ 09:30 – 17:00   │  10 min │  +6 min │
   │ B3_W   │ M110 → M128 (limited)       │ 20:00 – 23:30   │  15 min │  +6 min │
   │ B3_E   │ M128 → M110 (limited)       │ 20:00 – 23:30   │  15 min │  +6 min │
   │ E_W    │ M111 → M144 (express)       │ 07:00 – 22:00   │  varia  │    :00  │
   │ EC_E   │ M144 → M110 (commuter rp.)  │ 07:00 – 09:00   │   5 min │    :00  │
   │ E_E    │ M144 → M111 (express)       │ 09:00 – 22:00   │  varia  │    :00  │
   │ LN1_W  │ M110 → M128 (notte)         │ 23:30 – 24:00   │  30 min │  +3 min │
   │ LN1_E  │ M128 → M110 (notte)         │ 23:30 – 24:00   │  30 min │  +3 min │
   │ LN2_W  │ M110 → M122 (notte)         │ 24:00 – 24:30   │  30 min │  +3 min │
   └────────┴─────────────────────────────┴─────────────────┴─────────┴─────────┘

   FREQUENZA SUL TRONCO CENTRALE M110–M128
   ┌─────────────────┬────────────────────────────────────┬────────────────────┐
   │ Fascia          │ Servizi attivi                     │ Treni/ora (~)      │
   ├─────────────────┼────────────────────────────────────┼────────────────────┤
   │ 05:30–06:30    │ A (10 min) + B (10 min)            │ 12                 │
   │ 06:30–07:00    │ A (3 min)                          │ 20                 │
   │ 07:00–09:00    │ A (3 min) + E (5 min)              │ 20+12 = 32         │
   │ 09:00–09:30    │ A (3 min) + E (5 min)              │ 32                 │
   │ 09:30–17:00    │ A (5 min) + E (10 min) + B2(10min) │ 12+6+6 = 24        │
   │ 17:00–20:00    │ A (3 min) + E (5 min)              │ 20+12 = 32         │
   │ 20:00–22:00    │ A (7 min) + E (15 min) + B3(15min) │ 8+4+4 = 16         │
   │ 22:00–23:30    │ A (7 min) + B3 (15 min)            │ 8+4 = 12           │
   │ 23:30–24:00    │ LN1 (30 min)                       │ 2                  │
   └─────────────────┴────────────────────────────────────┴────────────────────┘

   FERMATE EXPRESS E_W / E_E (16 stazioni):
     M111 M115 M117 M118 M119 M120 M121 M122
     M126 M128 M130 M134 M139 M142 M143 M144

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

/* Commuter Rapid: M144→M110, salta M124 M125 M127 M132 M133 M135 M137 M138 */
const M1_STOPS_COMMUTER_RAPID = M1_CANONICAL_ORDER.filter(
  c => !['M124','M125','M127','M132','M133','M135','M137','M138'].includes(c)
);
const M1_STOPS_COMMUTER_RAPID_E = [...M1_STOPS_COMMUTER_RAPID].reverse();

/* ----------------------------------------------------------------
   Profili headway
---------------------------------------------------------------- */

// All-stop: frequenza variabile per fascia oraria
const M1_HW_ALLSTOP = [
  { from: '05:30', to: '06:30', headwayMin: 10 },
  { from: '06:30', to: '09:30', headwayMin:  3 },
  { from: '09:30', to: '17:00', headwayMin:  5 },
  { from: '17:00', to: '20:00', headwayMin:  3 },
  { from: '20:00', to: '23:30', headwayMin:  7 },
];

// B — limited mattino presto M110–M128 (05:30–06:30, 10 min)
const M1_HW_B_EARLY = [
  { from: '05:30', to: '06:30', headwayMin: 10 },
];

// B2 — limited giornaliero M110–M128 (09:30–17:00, 10 min)
const M1_HW_B2 = [
  { from: '09:30', to: '17:00', headwayMin: 10 },
];

// B3 — limited serale M110–M128 (20:00–23:30, 15 min)
const M1_HW_B3 = [
  { from: '20:00', to: '23:30', headwayMin: 15 },
];

// Express outbound: 5 min in punta, 10 min in giornaliero/serale
const M1_HW_EXPRESS_W = [
  { from: '07:00', to: '09:30', headwayMin:  5 },
  { from: '09:30', to: '17:00', headwayMin: 10 },
  { from: '17:00', to: '20:00', headwayMin:  5 },
  { from: '20:00', to: '22:00', headwayMin: 15 },
];

// Commuter Rapid inbound: 5 min (07:00–09:00)
const M1_HW_COMMUTER = [
  { from: '07:00', to: '09:00', headwayMin: 5 },
];

// Express inbound: simmetrico all'outbound
const M1_HW_EXPRESS_E = [
  { from: '09:00', to: '09:30', headwayMin:  5 },
  { from: '09:30', to: '17:00', headwayMin: 10 },
  { from: '17:00', to: '20:00', headwayMin:  5 },
  { from: '20:00', to: '22:00', headwayMin: 15 },
];

// Notturno
const M1_HW_LN1 = [{ from: '23:30', to: '24:00', headwayMin: 30 }];
const M1_HW_LN2 = [{ from: '24:00', to: '24:30', headwayMin: 30 }];

/* ----------------------------------------------------------------
   Servizi normalizzati per MetroRouter
   offsetMin: 0  → :00 :05 :10 … (Express/Rapid)
   offsetMin: 3  → :03 :08 :13 … (All-stop)
   offsetMin: 6  → :06 :16 :26 … (Limited B2/B3, riempi i buchi)
---------------------------------------------------------------- */
const M1_SERVICES_NORM = [

  /* ── All-stop westbound (M110 → M144) ── */
  {
    id: 'M1', svcLogical: 'A_W',
    name: 'All-stop (westbound)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
    headway: M1_HW_ALLSTOP,
    stops: M1_CANONICAL_ORDER,
  },

  /* ── All-stop eastbound (M144 → M110) ── */
  {
    id: 'M1', svcLogical: 'A_E',
    name: 'All-stop (eastbound)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
    headway: M1_HW_ALLSTOP,
    stops: [...M1_CANONICAL_ORDER].reverse(),
  },

  /* ── Limited mattino presto westbound (M110 → M128, 05:30–06:30) ── */
  {
    id: 'M1', svcLogical: 'B_W',
    name: 'Limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
    headway: M1_HW_B_EARLY,
    stops: M1_STOPS_TO_M128,
  },

  /* ── Limited mattino presto eastbound (M128 → M110, 05:30–06:30) ── */
  {
    id: 'M1', svcLogical: 'B_E',
    name: 'Limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
    headway: M1_HW_B_EARLY,
    stops: [...M1_STOPS_TO_M128].reverse(),
  },

  /* ── Limited giornaliero westbound (M110 → M128, 09:30–17:00) ── */
  {
    id: 'M1', svcLogical: 'B2_W',
    name: 'Limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 6,
    headway: M1_HW_B2,
    stops: M1_STOPS_TO_M128,
  },

  /* ── Limited giornaliero eastbound (M128 → M110, 09:30–17:00) ── */
  {
    id: 'M1', svcLogical: 'B2_E',
    name: 'Limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 6,
    headway: M1_HW_B2,
    stops: [...M1_STOPS_TO_M128].reverse(),
  },

  /* ── Limited serale westbound (M110 → M128, 20:00–23:30) ── */
  {
    id: 'M1', svcLogical: 'B3_W',
    name: 'Limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 6,
    headway: M1_HW_B3,
    stops: M1_STOPS_TO_M128,
  },

  /* ── Limited serale eastbound (M128 → M110, 20:00–23:30) ── */
  {
    id: 'M1', svcLogical: 'B3_E',
    name: 'Limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 6,
    headway: M1_HW_B3,
    stops: [...M1_STOPS_TO_M128].reverse(),
  },

  /* ── Express outbound (M111 → M144) ── */
  {
    id: 'M1', svcLogical: 'E_W',
    name: 'Express (westbound)',
    color: '#F77F00', cls: 'metro', rapid: true,
    offsetMin: 0,
    headway: M1_HW_EXPRESS_W,
    stops: M1_STOPS_EXPRESS,
  },

  /* ── Commuter Rapid inbound (M144 → M110, 07:00–09:00) ── */
  {
    id: 'M1', svcLogical: 'EC_E',
    name: 'Commuter Rapid (eastbound)',
    color: '#F77F00', cls: 'metro', rapid: true,
    offsetMin: 0,
    headway: M1_HW_COMMUTER,
    stops: M1_STOPS_COMMUTER_RAPID_E,
  },

  /* ── Express inbound (M144 → M111, 09:00–22:00) ── */
  {
    id: 'M1', svcLogical: 'E_E',
    name: 'Express (eastbound)',
    color: '#F77F00', cls: 'metro', rapid: true,
    offsetMin: 0,
    headway: M1_HW_EXPRESS_E,
    stops: [...M1_STOPS_EXPRESS].reverse(),
  },

  /* ── Notturno LN1 westbound (M110 → M128, 23:30–24:00) ── */
  {
    id: 'M1', svcLogical: 'LN1_W',
    name: 'Late night limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
    headway: M1_HW_LN1,
    stops: M1_STOPS_TO_M128,
  },

  /* ── Notturno LN1 eastbound (M128 → M110, 23:30–24:00) ── */
  {
    id: 'M1', svcLogical: 'LN1_E',
    name: 'Late night limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
    headway: M1_HW_LN1,
    stops: [...M1_STOPS_TO_M128].reverse(),
  },

  /* ── Notturno LN2 westbound (M110 → M122, 24:00–24:30) ── */
  {
    id: 'M1', svcLogical: 'LN2_W',
    name: 'Late night limited (westbound, to Tensari Omuhate)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
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

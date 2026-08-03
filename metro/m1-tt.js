/* ================================================================
   M1-TT.JS — Metro Line 1 · Timetable & Router Registration
   ================================================================

   SCHEMA SERVIZI
   ┌────────┬──────────────────────┬─────────────────┬─────────┬─────────┐
   │ ID     │ Rotta                      │ Orario          │ Headway │ Offset  │
   ├────────┼──────────────────────┼─────────────────┼─────────┼─────────┤
   │ A_W    │ M110 → M144 (all-stop)     │ 05:30 – 23:30   │  15 min │  +3 min │
   │ A_E    │ M144 → M110 (all-stop)     │ 05:30 – 23:30   │  15 min │  +3 min │
   │ B_W    │ M110 → M128 (limitato)     │ 05:30 – 23:30   │  30 min │  +3 min │
   │ B_E    │ M128 → M110 (limitato)     │ 05:30 – 23:30   │  30 min │  +3 min │
   │ E_W    │ M111 → M144 (express)      │ 07:00 – 22:00   │  15 min │    :00  │
   │ EC_E   │ M144 → M110 (commuter rp.) │ 07:00 – 09:00   │  15 min │    :00  │
   │ E_E    │ M144 → M111 (express)      │ 09:00 – 22:00   │  15 min │    :00  │
   │ LN1_W  │ M110 → M128 (notte)        │ 23:30 – 24:00   │  30 min │  +3 min │
   │ LN1_E  │ M128 → M110 (notte)        │ 23:30 – 24:00   │  30 min │  +3 min │
   │ LN2_W  │ M110 → M122 (notte)        │ 24:00 – 24:30   │  30 min │  +3 min │
   └────────┴──────────────────────┴─────────────────┴─────────┴─────────┘

   Partenze al capolinea (esempio headway 15 min):
     Express / Rapid  — :00 :15 :30 :45
     All-stop         — :03 :18 :33 :48

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
const M1_HW_FULL       = [{ from: '05:30', to: '23:30', headwayMin: 15 }];
const M1_HW_SHORT_DAY  = [{ from: '05:30', to: '23:30', headwayMin: 30 }];
const M1_HW_EXPRESS_W  = [{ from: '07:00', to: '22:00', headwayMin: 15 }];
const M1_HW_COMMUTER   = [{ from: '07:00', to: '09:00', headwayMin: 15 }];
const M1_HW_EXPRESS_E  = [{ from: '09:00', to: '22:00', headwayMin: 15 }];
const M1_HW_LN1        = [{ from: '23:30', to: '24:00', headwayMin: 30 }];
const M1_HW_LN2        = [{ from: '24:00', to: '24:30', headwayMin: 30 }];

/* ----------------------------------------------------------------
   Servizi normalizzati per MetroRouter
   offsetMin: 0  → partenze ai multipli esatti del headway (:00 :15 :30 :45)
   offsetMin: 3  → partenze sfasate di 3 min              (:03 :18 :33 :48)
---------------------------------------------------------------- */
const M1_SERVICES_NORM = [

  /* ── All-stop westbound (M110 → M144) ── */
  {
    id: 'M1', svcLogical: 'A_W',
    name: 'All-stop (westbound)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
    headway: M1_HW_FULL,
    stops: M1_CANONICAL_ORDER,
  },

  /* ── All-stop eastbound (M144 → M110) ── */
  {
    id: 'M1', svcLogical: 'A_E',
    name: 'All-stop (eastbound)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
    headway: M1_HW_FULL,
    stops: [...M1_CANONICAL_ORDER].reverse(),
  },

  /* ── Limitato diurno westbound (M110 → M128) ── */
  {
    id: 'M1', svcLogical: 'B_W',
    name: 'Limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
    headway: M1_HW_SHORT_DAY,
    stops: M1_STOPS_TO_M128,
  },

  /* ── Limitato diurno eastbound (M128 → M110) ── */
  {
    id: 'M1', svcLogical: 'B_E',
    name: 'Limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3,
    headway: M1_HW_SHORT_DAY,
    stops: [...M1_STOPS_TO_M128].reverse(),
  },

  /* ── Express outbound (M111 → M144, 07:00–22:00) ── */
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

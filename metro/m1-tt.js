/* ================================================================
   M1-TT.JS — Metro Line 1 · Timetable & Router Registration
   ================================================================

   SCHEMA SERVIZI
   ┌────────┬─────────────────────────────┬─────────────────┬─────────┬─────────┬─────────┐
   │ ID     │ Rotta                       │ Orario          │ Headway │ Offset  │ Speed   │
   ├────────┼─────────────────────────────┼─────────────────┼─────────┼─────────┼─────────┤
   │ A_W    │ M110 → M144 (all-stop)      │ 05:30 – 23:30   │  varia  │  +3 min │  28 k/h │
   │ A_E    │ M144 → M110 (all-stop)      │ 05:30 – 23:30   │  varia  │  +3 min │  28 k/h │
   │ B_W    │ M110 → M128 (limited)       │ 05:30 – 06:30   │  20 min │  +3 min │  28 k/h │
   │ B_E    │ M128 → M110 (limited)       │ 05:30 – 06:30   │  20 min │  +3 min │  28 k/h │
   │ B2_W   │ M110 → M128 (limited)       │ 09:30 – 17:00   │  20 min │  +6 min │  28 k/h │
   │ B2_E   │ M128 → M110 (limited)       │ 09:30 – 17:00   │  20 min │  +6 min │  28 k/h │
   │ B3_W   │ M110 → M128 (limited)       │ 20:00 – 23:30   │  60 min │  +6 min │  28 k/h │
   │ B3_E   │ M128 → M110 (limited)       │ 20:00 – 23:30   │  60 min │  +6 min │  28 k/h │
   │ E_W    │ M111 → M144 (express)       │ 07:00 – 22:00   │  varia  │    :00  │  40 k/h │
   │ EC_E   │ M144 → M110 (commuter rp.)  │ 07:00 – 09:00   │   5 min │    :00  │  38 k/h │
   │ E_E    │ M144 → M111 (express)       │ 09:00 – 22:00   │  varia  │    :00  │  40 k/h │
   │ LN1_W  │ M110 → M128 (notte)         │ 23:30 – 24:00   │  30 min │  +3 min │  28 k/h │
   │ LN1_E  │ M128 → M110 (notte)         │ 23:30 – 24:00   │  30 min │  +3 min │  28 k/h │
   │ LN2_W  │ M110 → M122 (notte)         │ 24:00 – 24:30   │  30 min │  +3 min │  28 k/h │
   │ T_W    │ M110 → M128 (thru KS/CO)    │ 05:30 – 23:30   │  20 min │  +0 min │  28 k/h │
   │ T_E    │ M128 → M110 (thru KS/CO)    │ 05:30 – 23:30   │  20 min │  +8 min │  28 k/h │
   └────────┴─────────────────────────────┴─────────────────┴─────────┴─────────┴─────────┘

   VELOCITÀ COMMERCIALI
     All-stop / Limited — 28 km/h (molte fermate, acc/frenate frequenti)
     Commuter Rapid     — 38 km/h (fermate ridotte ma percorso lungo)
     Express            — 40 km/h (poche fermate, alta velocità di crociera)

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
const M1_HW_ALLSTOP = [
  { from: '05:30', to: '06:30', headwayMin: 10 },
  { from: '06:30', to: '09:30', headwayMin:  3 },
  { from: '09:30', to: '17:00', headwayMin:  5 },
  { from: '17:00', to: '20:00', headwayMin:  3 },
  { from: '20:00', to: '23:30', headwayMin:  7 },
];

const M1_HW_B_EARLY = [{ from: '05:30', to: '06:30', headwayMin: 20 }];  // 3 tph ceduti al thru
const M1_HW_B2      = [{ from: '09:30', to: '17:00', headwayMin: 20 }];  // 3 tph ceduti al thru
const M1_HW_B3      = [{ from: '20:00', to: '23:30', headwayMin: 60 }];  // 3 tph ceduti al thru

const M1_HW_EXPRESS_W = [
  { from: '07:00', to: '09:30', headwayMin:  5 },
  { from: '09:30', to: '17:00', headwayMin: 10 },
  { from: '17:00', to: '20:00', headwayMin:  5 },
  { from: '20:00', to: '22:00', headwayMin: 15 },
];

const M1_HW_COMMUTER = [{ from: '07:00', to: '09:00', headwayMin: 5 }];

const M1_HW_EXPRESS_E = [
  { from: '09:00', to: '09:30', headwayMin:  5 },
  { from: '09:30', to: '17:00', headwayMin: 10 },
  { from: '17:00', to: '20:00', headwayMin:  5 },
  { from: '20:00', to: '22:00', headwayMin: 15 },
];

/* Thru M1 <-> KS <-> CO: 3 tph (20 min). Sostituisce 3 tph di B dove B esiste. */
const M1_HW_THRU = [{ from: '05:30', to: '23:30', headwayMin: 20 }];

const M1_HW_LN1 = [{ from: '23:30', to: '24:00', headwayMin: 30 }];
const M1_HW_LN2 = [{ from: '24:00', to: '24:30', headwayMin: 30 }];

/* Offset thru allineati ai KT in ks-data.js (sosta 90 s a M128/KS18) */
const M1_THRU_OFFSET_W = 0;
const M1_THRU_OFFSET_E = 8;

/* ----------------------------------------------------------------
   Servizi
---------------------------------------------------------------- */
const M1_SERVICES_NORM = [

  { id: 'M1', svcLogical: 'A_W', name: 'All-stop (westbound)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3, speedKmh: 28, headway: M1_HW_ALLSTOP,
    stops: M1_CANONICAL_ORDER },

  { id: 'M1', svcLogical: 'A_E', name: 'All-stop (eastbound)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3, speedKmh: 28, headway: M1_HW_ALLSTOP,
    stops: [...M1_CANONICAL_ORDER].reverse() },

  { id: 'M1', svcLogical: 'B_W', name: 'Limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3, speedKmh: 28, headway: M1_HW_B_EARLY,
    stops: M1_STOPS_TO_M128 },

  { id: 'M1', svcLogical: 'B_E', name: 'Limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3, speedKmh: 28, headway: M1_HW_B_EARLY,
    stops: [...M1_STOPS_TO_M128].reverse() },

  { id: 'M1', svcLogical: 'B2_W', name: 'Limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 6, speedKmh: 28, headway: M1_HW_B2,
    stops: M1_STOPS_TO_M128 },

  { id: 'M1', svcLogical: 'B2_E', name: 'Limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 6, speedKmh: 28, headway: M1_HW_B2,
    stops: [...M1_STOPS_TO_M128].reverse() },

  { id: 'M1', svcLogical: 'B3_W', name: 'Limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 6, speedKmh: 28, headway: M1_HW_B3,
    stops: M1_STOPS_TO_M128 },

  { id: 'M1', svcLogical: 'B3_E', name: 'Limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 6, speedKmh: 28, headway: M1_HW_B3,
    stops: [...M1_STOPS_TO_M128].reverse() },

  { id: 'M1', svcLogical: 'E_W', name: 'Express (westbound)',
    color: '#F77F00', cls: 'metro', rapid: true,
    offsetMin: 0, speedKmh: 40, headway: M1_HW_EXPRESS_W,
    stops: M1_STOPS_EXPRESS },

  { id: 'M1', svcLogical: 'EC_E', name: 'Commuter Rapid (eastbound)',
    color: '#F77F00', cls: 'metro', rapid: true,
    offsetMin: 0, speedKmh: 38, headway: M1_HW_COMMUTER,
    stops: M1_STOPS_COMMUTER_RAPID_E },

  { id: 'M1', svcLogical: 'E_E', name: 'Express (eastbound)',
    color: '#F77F00', cls: 'metro', rapid: true,
    offsetMin: 0, speedKmh: 40, headway: M1_HW_EXPRESS_E,
    stops: [...M1_STOPS_EXPRESS].reverse() },

  { id: 'M1', svcLogical: 'LN1_W', name: 'Late night limited (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3, speedKmh: 28, headway: M1_HW_LN1,
    stops: M1_STOPS_TO_M128 },

  { id: 'M1', svcLogical: 'LN1_E', name: 'Late night limited (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3, speedKmh: 28, headway: M1_HW_LN1,
    stops: [...M1_STOPS_TO_M128].reverse() },

  { id: 'M1', svcLogical: 'LN2_W', name: 'Late night limited (westbound, to Tensari Omuhate)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: 3, speedKmh: 28, headway: M1_HW_LN2,
    stops: M1_STOPS_TO_M122 },

  /* Thru (相互直通運転): M110 <-> M128, poi prosegue su KS18 -> KS21 e CO01 -> CO68.
     Aspetto M1 identico agli altri treni; oltre M128 non proseguono su M1. */
  { id: 'M1', svcLogical: 'T_W', name: 'Through service (westbound, to Asaji Torimoshi)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: M1_THRU_OFFSET_W, speedKmh: 28, headway: M1_HW_THRU,
    stops: M1_STOPS_TO_M128 },

  { id: 'M1', svcLogical: 'T_E', name: 'Through service (eastbound, to Alkuitsa)',
    color: '#F77F00', cls: 'metro', rapid: false,
    offsetMin: M1_THRU_OFFSET_E, speedKmh: 28, headway: M1_HW_THRU,
    stops: [...M1_STOPS_TO_M128].reverse() },

];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M1',
    meta:        M1_META,
    st:          M1_ST,
    services:    M1_SERVICES_NORM,
    interchange: M1_INTERCHANGE,
  });
}

/* Thru M1 <-> KS a Asaji Torimoshi (M128 = KS18), sosta 90 s.
   unified-router.js e' caricato dopo i *-tt.js: registrazione a DOM pronto. */
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function () {
    if (typeof IZXUnifiedRouter !== 'undefined' && IZXUnifiedRouter.registerThruService)
      IZXUnifiedRouter.registerThruService({ codes: ['M128', 'KS18'], stopSec: 90 });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M1_SERVICES_NORM };
}

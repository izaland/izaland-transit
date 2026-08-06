/* ================================================================
   M3-TT.JS — Metro Line 3 · Timetable & Router Registration
   ================================================================

   SCHEMA SERVIZI
   ┌────────┬──────────────────────────────────┬─────────────────┬─────────┬─────────┬─────────┐
   │ ID     │ Rotta                            │ Orario          │ tph     │ Headway │ Speed   │
   ├────────┼──────────────────────────────────┼─────────────────┼─────────┼─────────┼─────────┤
   │ AS_N   │ M301 → M334 (all-stop)           │ 05:30 – 23:30   │  6 tph  │  10 min │  35 k/h │
   │ AS_S   │ M334 → M301 (all-stop)           │ 05:30 – 23:30   │  6 tph  │  10 min │  35 k/h │
   │ LIM_N  │ M3150 → M334 (limited long)      │ 05:30 – 23:30   │  2 tph  │  30 min │  35 k/h │
   │ LIM_S  │ M334 → M3150 (limited long)      │ 05:30 – 23:30   │  2 tph  │  30 min │  35 k/h │
   │ EXP_N  │ M301 → M334 (express)            │ 07:00 – 21:30   │  3 tph  │  20 min │  35 k/h │
   │ EXP_S  │ M334 → M301 (express)            │ 07:00 – 21:30   │  3 tph  │  20 min │  35 k/h │
   │ SHO_N  │ M315 → M332 (limited short)      │ 05:30 – 23:30   │  1 tph  │  60 min │  35 k/h │
   │ SHO_S  │ M332 → M315 (limited short)      │ 05:30 – 23:30   │  1 tph  │  60 min │  35 k/h │
   │ LN_N   │ M301 → M334 (late night)         │ 23:30 – 24:30   │    —    │  30 min │  35 k/h │
   │ LN_S   │ M334 → M301 (late night)         │ 23:30 – 24:30   │    —    │  30 min │  35 k/h │
   └────────┴──────────────────────────────────┴─────────────────┴─────────┴─────────┴─────────┘

   FERMATE EXPRESS (20 stazioni su 34):
     M301 M303 M306 M313 M315 M318 M321 M322 M323 M324
     M325 M326 M327 M328 M329 M330 M331 M332 M333 M334

   FERMATE LIMITED SHORT (M315–M332, 18 stazioni):
     M315 M316 M317 M318 M319 M320 M321 M322 M323 M324
     M325 M326 M327 M328 M329 M330 M331 M332

   VELOCITÀ UNICA: 35 km/h per tutti i servizi.

   Dipende da: m3-data.js
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   Stop arrays
---------------------------------------------------------------- */

/* Express: 20 fermate su tutta la tratta */
const M3_STOPS_EXPRESS = [
  'M301', 'M303', 'M306', 'M313', 'M315',
  'M318', 'M321', 'M322', 'M323', 'M324',
  'M325', 'M326', 'M327', 'M328', 'M329',
  'M330', 'M331', 'M332', 'M333', 'M334',
];

/* Limited short: M315 → M332 (18 stazioni) */
const M3_STOPS_LIMITED_SHORT = [
  'M315', 'M316', 'M317', 'M318', 'M319', 'M320',
  'M321', 'M322', 'M323', 'M324', 'M325', 'M326',
  'M327', 'M328', 'M329', 'M330', 'M331', 'M332',
];

/* ----------------------------------------------------------------
   Profili headway
---------------------------------------------------------------- */
const M3_HW_6TPH = [{ from: '05:30', to: '23:30', headwayMin: 10 }];
const M3_HW_2TPH = [{ from: '05:30', to: '23:30', headwayMin: 30 }];
const M3_HW_3TPH = [{ from: '07:00', to: '21:30', headwayMin: 20 }];
const M3_HW_1TPH = [{ from: '05:30', to: '23:30', headwayMin: 60 }];
const M3_HW_LN   = [{ from: '23:30', to: '24:30', headwayMin: 30 }];

/* ----------------------------------------------------------------
   Servizi
---------------------------------------------------------------- */
const M3_SERVICES = [

  /* 1. All-stop M301 ↔ M334 · 6 tph */
  { id: 'M3', svcLogical: 'AS_N', name: 'All-stop (northbound)',
    color: '#7B2D8B', cls: 'metro', rapid: false,
    offsetMin: 2, speedKmh: 35, headway: M3_HW_6TPH,
    stops: M3_CANONICAL_ORDER },

  { id: 'M3', svcLogical: 'AS_S', name: 'All-stop (southbound)',
    color: '#7B2D8B', cls: 'metro', rapid: false,
    offsetMin: 2, speedKmh: 35, headway: M3_HW_6TPH,
    stops: [...M3_CANONICAL_ORDER].reverse() },

  /* 2. Limited M3150 ↔ M334 · 2 tph */
  { id: 'M3', svcLogical: 'LIM_N', name: 'Limited (Shakihori → Iyogateri)',
    color: '#7B2D8B', cls: 'metro', rapid: false,
    offsetMin: 5, speedKmh: 35, headway: M3_HW_2TPH,
    stops: M3_FROM_M3150 },

  { id: 'M3', svcLogical: 'LIM_S', name: 'Limited (Iyogateri → Shakihori)',
    color: '#7B2D8B', cls: 'metro', rapid: false,
    offsetMin: 5, speedKmh: 35, headway: M3_HW_2TPH,
    stops: [...M3_FROM_M3150].reverse() },

  /* 3. Express M301 ↔ M334 · 3 tph · 07:00–21:30 */
  { id: 'M3', svcLogical: 'EXP_N', name: 'Express (northbound)',
    color: '#7B2D8B', cls: 'metro', rapid: true,
    offsetMin: 0, speedKmh: 35, headway: M3_HW_3TPH,
    stops: M3_STOPS_EXPRESS },

  { id: 'M3', svcLogical: 'EXP_S', name: 'Express (southbound)',
    color: '#7B2D8B', cls: 'metro', rapid: true,
    offsetMin: 0, speedKmh: 35, headway: M3_HW_3TPH,
    stops: [...M3_STOPS_EXPRESS].reverse() },

  /* 4. Limited short M315 ↔ M332 · 1 tph */
  { id: 'M3', svcLogical: 'SHO_N', name: 'Limited (Niji-Shakihori → Ðaihate)',
    color: '#7B2D8B', cls: 'metro', rapid: false,
    offsetMin: 8, speedKmh: 35, headway: M3_HW_1TPH,
    stops: M3_STOPS_LIMITED_SHORT },

  { id: 'M3', svcLogical: 'SHO_S', name: 'Limited (Ðaihate → Niji-Shakihori)',
    color: '#7B2D8B', cls: 'metro', rapid: false,
    offsetMin: 8, speedKmh: 35, headway: M3_HW_1TPH,
    stops: [...M3_STOPS_LIMITED_SHORT].reverse() },

  /* Late night all-stop · 30 min */
  { id: 'M3', svcLogical: 'LN_N', name: 'Late night (northbound)',
    color: '#7B2D8B', cls: 'metro', rapid: false,
    offsetMin: 2, speedKmh: 35, headway: M3_HW_LN,
    stops: M3_CANONICAL_ORDER },

  { id: 'M3', svcLogical: 'LN_S', name: 'Late night (southbound)',
    color: '#7B2D8B', cls: 'metro', rapid: false,
    offsetMin: 2, speedKmh: 35, headway: M3_HW_LN,
    stops: [...M3_CANONICAL_ORDER].reverse() },

];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M3',
    meta:        M3_META,
    st:          M3_ST,
    services:    M3_SERVICES,
    interchange: M3_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M3_SERVICES };
}

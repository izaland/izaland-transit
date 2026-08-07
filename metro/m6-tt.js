/* ================================================================
   M6-TT.JS — Metro Line 6 · Timetable & Router Registration
   ================================================================

   SCHEMA SERVIZI
   ┌──────────┬────────────────────────────┬─────────────┬─────────┬─────────┬─────────┐
   │ ID       │ Rotta                       │ Orario       │ Headway │ Offset  │ Speed   │
   ├──────────┼────────────────────────────┼─────────────┼─────────┼─────────┼─────────┤
   │ A_N      │ M601 → M636 (all-stop)      │ 05:30–23:30  │  varia  │  :06    │  32 k/h │
   │ A_S      │ M636 → M601 (all-stop)      │ 05:30–23:30  │  varia  │  :06    │  32 k/h │
   │ LIM_N    │ M601 → M628 (limited)       │ 05:30–23:30  │  varia  │  :06    │  36 k/h │
   │ LIM_S    │ M628 → M601 (limited)       │ 05:30–23:30  │  varia  │  :06    │  36 k/h │
   │ RAP_N    │ M601 → M636 (rapido)        │ 08:03–23:11  │  20 min │  :03    │  48 k/h │
   │ RAP_S    │ M636 → M601 (rapido)        │ 08:03–23:11  │  20 min │  :03    │  48 k/h │
   │ ML_N     │ M636 → M601 (Morning Liner) │ 06:48, 07:12 │  fisse  │   —     │  55 k/h │
   │ EL_S     │ M601 → M636 (Evening Liner) │ 19:31,20:01, │  fisse  │   —     │  55 k/h │
   │          │                             │ 20:31         │         │         │         │
   └──────────┴────────────────────────────┴─────────────┴─────────┴─────────┴─────────┘

   SCARTAMENTO & VELOCITÀ
     Scartamento lato: 1524 mm
     Velocità max tratte sud (interstation larga): 160 km/h
     Velocità max tratte urbane ad alta densità:   70 km/h
     Acc/dec: ottima (alta performance)

   VELOCITÀ COMMERCIALI
     All-stop   — 32 km/h (fermate frequenti, tratte miste)
     Limitato   — 36 km/h (fermate ridotte, stessa fascia M601-M628)
     Rapido     — 48 km/h (poche fermate, sfrutta tratte ad alta velocità)
     Liner      — 55 km/h (fermate minime, corse singole)

   Dipende da: m6-data.js
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   Stop sets
---------------------------------------------------------------- */

/* All-stop: ordine canonico completo */
const M6_STOPS_ALL_N = M6_CANONICAL_ORDER;
const M6_STOPS_ALL_S = [...M6_CANONICAL_ORDER].reverse();

/* Limitato: M601 → M628 (fermate a tutte le stazioni del tratto) */
const M6_STOPS_LIM_N = M6_CANONICAL_ORDER.slice(
  0, M6_CANONICAL_ORDER.indexOf('M628') + 1
);
const M6_STOPS_LIM_S = [...M6_STOPS_LIM_N].reverse();

/* Rapido: fermate selezionate */
const M6_STOPS_RAPID = [
  'M601', 'M602', 'M603', 'M604', 'M605', 'M606', 'M607', 'M608',
  'M609', 'M610', 'M611', 'M612', 'M613', 'M614', 'M615', 'M616',
  'M617', 'M618', 'M619', 'M620', 'M623', 'M625', 'M628', 'M631',
  'M633', 'M635', 'M636',
];
const M6_STOPS_RAPID_S = [...M6_STOPS_RAPID].reverse();

/* Morning Liner (M636 → M601) & Evening Liner (M601 → M636) */
const M6_STOPS_LINER = [
  'M601', 'M602', 'M603', 'M604', 'M605', 'M606', 'M607', 'M608',
  'M609', 'M610', 'M612', 'M618', 'M628', 'M631', 'M633', 'M635',
  'M636',
];
const M6_STOPS_LINER_N = [...M6_STOPS_LINER].reverse(); // M636 → M601
const M6_STOPS_LINER_S = M6_STOPS_LINER;                // M601 → M636

/* ----------------------------------------------------------------
   Profili headway
---------------------------------------------------------------- */

/* All-stop: 6 TPH (10 min) punta, 4 TPH (15 min) morbida */
const M6_HW_ALLSTOP = [
  { from: '05:30', to: '07:00', headwayMin: 15 },
  { from: '07:00', to: '09:30', headwayMin: 10 },
  { from: '09:30', to: '17:00', headwayMin: 15 },
  { from: '17:00', to: '20:00', headwayMin: 10 },
  { from: '20:00', to: '23:30', headwayMin: 15 },
];

/* Limitato: 3 TPH (20 min) punta, 2 TPH (30 min) morbida
   Riempie i buchi del servizio all-stop — offset sfalsato */
const M6_HW_LIM = [
  { from: '05:30', to: '07:00', headwayMin: 30 },
  { from: '07:00', to: '09:30', headwayMin: 20 },
  { from: '09:30', to: '17:00', headwayMin: 30 },
  { from: '17:00', to: '20:00', headwayMin: 20 },
  { from: '20:00', to: '23:30', headwayMin: 30 },
];

/* Rapido: 3 TPH fissi (20 min), 08:03–23:11 */
const M6_HW_RAPID = [
  { from: '08:03', to: '23:11', headwayMin: 20 },
];

/* ----------------------------------------------------------------
   Corse singole Liner
   Rappresentate come departures fisse (non headway);
   il router le tratta come svcType: 'fixed'.
---------------------------------------------------------------- */

/* Morning Liner: 2 corse da M636 → M601 */
const M6_MORNING_LINER_DEPARTURES = ['06:48', '07:12'];

/* Evening Liner: 3 corse da M601 → M636 */
const M6_EVENING_LINER_DEPARTURES = ['19:31', '20:01', '20:31'];

/* ----------------------------------------------------------------
   Servizi
---------------------------------------------------------------- */
const M6_SERVICES = [

  /* ── All-stop ─────────────────────────────────────────────── */
  { id: 'M6', svcLogical: 'A_N', name: 'All-stop (northbound, to Nari-Gotsurindai)',
    color: '#3465a4', cls: 'metro', rapid: false,
    offsetMin: 6, speedKmh: 32, headway: M6_HW_ALLSTOP,
    stops: M6_STOPS_ALL_N },

  { id: 'M6', svcLogical: 'A_S', name: 'All-stop (southbound, to Saibu Panatsawa)',
    color: '#3465a4', cls: 'metro', rapid: false,
    offsetMin: 6, speedKmh: 32, headway: M6_HW_ALLSTOP,
    stops: M6_STOPS_ALL_S },

  /* ── Limitato M601–M628 ────────────────────────────────────── */
  { id: 'M6', svcLogical: 'LIM_N', name: 'Limited (northbound, to Nari-Gotsurindai)',
    color: '#3465a4', cls: 'metro', rapid: false,
    offsetMin: 6, speedKmh: 36, headway: M6_HW_LIM,
    stops: M6_STOPS_LIM_N },

  { id: 'M6', svcLogical: 'LIM_S', name: 'Limited (southbound, to Kōtō Satahappi)',
    color: '#3465a4', cls: 'metro', rapid: false,
    offsetMin: 6, speedKmh: 36, headway: M6_HW_LIM,
    stops: M6_STOPS_LIM_S },

  /* ── Rapido ───────────────────────────────────────────────── */
  { id: 'M6', svcLogical: 'RAP_N', name: 'Rapid (northbound, to Nari-Gotsurindai)',
    color: '#3465a4', cls: 'metro', rapid: true,
    offsetMin: 3, speedKmh: 48, headway: M6_HW_RAPID,
    stops: M6_STOPS_RAPID_S },

  { id: 'M6', svcLogical: 'RAP_S', name: 'Rapid (southbound, to Saibu Panatsawa)',
    color: '#3465a4', cls: 'metro', rapid: true,
    offsetMin: 3, speedKmh: 48, headway: M6_HW_RAPID,
    stops: M6_STOPS_RAPID },

  /* ── Morning Liner (M636 → M601) ─────────────────────────── */
  { id: 'M6', svcLogical: 'ML_N', name: 'Morning Liner (northbound, to Nari-Gotsurindai)',
    color: '#3465a4', cls: 'metro', rapid: true,
    svcType: 'fixed', departures: M6_MORNING_LINER_DEPARTURES,
    speedKmh: 55,
    stops: M6_STOPS_LINER_N },

  /* ── Evening Liner (M601 → M636) ─────────────────────────── */
  { id: 'M6', svcLogical: 'EL_S', name: 'Evening Liner (southbound, to Saibu Panatsawa)',
    color: '#3465a4', cls: 'metro', rapid: true,
    svcType: 'fixed', departures: M6_EVENING_LINER_DEPARTURES,
    speedKmh: 55,
    stops: M6_STOPS_LINER_S },

];

/* ----------------------------------------------------------------
   Registrazione nel MetroRouter
---------------------------------------------------------------- */
if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M6',
    meta:        M6_META,
    st:          M6_ST,
    services:    M6_SERVICES,
    interchange: M6_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M6_SERVICES };
}

/* ================================================================
   M8-TT.JS — Metro Line 8 · Sainðaul Urban Line · Timetable
   ================================================================
   Il timetable è generato runtime da MetroRouter usando headway slot
   array compatibili con MetroRouter._headwaySecAt().

   Servizi:
     A_N  Komayunden-Dōnmus Kōwen (M824) → Kishagoi-Exhibitown (M801)  [All-stop, northbound]
     A_S  Kishagoi-Exhibitown (M801)       → Komayunden-Dōnmus Kōwen (M824)  [All-stop, southbound]

     B_N  Ibaches / Anagusa Mukai (M817)  → Kishagoi-Exhibitown (M801)  [Ibaches Through, northbound]
     B_S  Kishagoi-Exhibitown (M801)       → Anagusa Mukai (M817) → Ibaches  [southbound]

     C_N  Ibaches / M818 (Jufurai)        → Kishagoi-Exhibitown (M801)  [Rapido, northbound]
     C_S  Kishagoi-Exhibitown (M801)       → M818 (Jufurai) → Ibaches     [Rapido, southbound]

   Dipende da: m8-data.js
   Caricato dopo m8-data.js nell'HTML.
================================================================ */
'use strict';

/* ================================================================
   HEADWAY SLOT ARRAYS — formato MetroRouter
   Ogni slot: { from: 'HH:MM', to: 'HH:MM', headwayMin: N }
   Coprono l'intera finestra operativa del servizio.

   Svc A: 05:32–24:05 · ogni 7 min
   Svc B: 05:38–23:58 · ogni 10 min
   Svc C: 07:35–21:45 · ogni 14 min
================================================================ */
const _M8_A_HW = [
  { from: '05:32', to: '24:05', headwayMin: 7 },
];
const _M8_B_HW = [
  { from: '05:38', to: '23:58', headwayMin: 10 },
];
const _M8_C_HW = [
  { from: '07:35', to: '21:45', headwayMin: 14 },
];

/* ================================================================
   STOPS RAPIDO (Svc C) — 11 fermate sulla sezione M8
   Salta: M802, M804, M807, M810, M811, M813, M816
================================================================ */
const _M8_C_STOPS_S = [
  'M801','M803','M805','M806','M808','M809',
  'M812','M814','M815','M817','M818',
];
const _M8_C_STOPS_N = [..._M8_C_STOPS_S].reverse();

/* ================================================================
   STOPS Svc B — M801 → M817 (poi Ibaches da M818)
================================================================ */
const _M8_B_STOPS_S = [
  'M801','M802','M803','M804','M805','M806','M807','M808',
  'M809','M810','M811','M812','M813','M814','M815','M816',
  'M817',
];
const _M8_B_STOPS_N = [..._M8_B_STOPS_S].reverse();

/* ================================================================
   M8_SERVICES_NORM — formato standard MetroRouter
================================================================ */
const M8_SERVICES_NORM = [

  /* ── A · All-stop ─────────────────────────────────────────── */
  {
    id:         'M8',
    svcLogical: 'A_S',
    name:       'All-stop (southbound)',
    color:      '#00A2D3',
    cls:        'metro',
    rapid:      false,
    headway:    _M8_A_HW,
    stops:      M8_CANONICAL_ORDER,           // M801 → M824
  },
  {
    id:         'M8',
    svcLogical: 'A_N',
    name:       'All-stop (northbound)',
    color:      '#00A2D3',
    cls:        'metro',
    rapid:      false,
    headway:    _M8_A_HW,
    stops:      [...M8_CANONICAL_ORDER].reverse(),  // M824 → M801
  },

  /* ── B · Ibaches Through ─────────────────────────────────── */
  {
    id:         'M8',
    svcLogical: 'B_S',
    name:       'Ibaches Through (southbound)',
    color:      '#00A2D3',
    cls:        'metro',
    rapid:      false,
    headway:    _M8_B_HW,
    stops:      _M8_B_STOPS_S,               // M801 → M817
  },
  {
    id:         'M8',
    svcLogical: 'B_N',
    name:       'Ibaches Through (northbound)',
    color:      '#00A2D3',
    cls:        'metro',
    rapid:      false,
    headway:    _M8_B_HW,
    stops:      _M8_B_STOPS_N,               // M817 → M801
  },

  /* ── C · Rapido ──────────────────────────────────────────── */
  {
    id:         'M8',
    svcLogical: 'C_S',
    name:       'Rapido (southbound)',
    color:      '#33C4E8',
    cls:        'metro',
    rapid:      true,
    headway:    _M8_C_HW,
    stops:      _M8_C_STOPS_S,               // 11 fermate M801 → M818
  },
  {
    id:         'M8',
    svcLogical: 'C_N',
    name:       'Rapido (northbound)',
    color:      '#33C4E8',
    cls:        'metro',
    rapid:      true,
    headway:    _M8_C_HW,
    stops:      _M8_C_STOPS_N,               // M818 → M801
  },
];

/* ----------------------------------------------------------------
   Registrazione linea M8 nel MetroRouter.
   Dipende da: m8-data.js (M8_ST, M8_META, M8_HEADWAY,
               M8_CANONICAL_ORDER, M8_INTERCHANGE)
   Questo file è caricato dopo m8-data.js nell'HTML.
---------------------------------------------------------------- */
if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M8',
    meta:        M8_META,
    st:          M8_ST,
    services:    M8_SERVICES_NORM,
    interchange: M8_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M8_SERVICES_NORM };
}

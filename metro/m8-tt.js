/* ================================================================
   M8-TT.JS — Metro Line 8 · Sainðaul Urban Line · Timetable
   ================================================================
   Il timetable è generato runtime da MetroRouter usando headway slot
   array compatibili con MetroRouter._headwaySecAt().

   Servizi:
     A_N  Komayunden-Dōnmus Kōwen (M824) → Kishagoi-Exhibitown (M801)  [All-stop, northbound]
     A_S  Kishagoi-Exhibitown (M801)       → Komayunden-Dōnmus Kōwen (M824)  [All-stop, southbound]

     A_T  Local thru Ibaches: M801 ↔ M818, poi prosegue sull'Ibaches Main Line
          da IBC04 (vedi ibc-tt.js, servizi IBC5 / IBC5_NB) fino a IBC23 e
          sulla Enikezya Line (IBC105–IBC107). 1 Local su 3, ogni 21 min.

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

   Svc A: 05:32–24:05 · ogni 7 min complessivi (ciclo di 21 min):
          - 1 treno su 3 e' un Local thru Ibaches (A_T, M801 ↔ M818)
          - 2 treni su 3 proseguono fino a M824 (A, ogni 21 min ciascuna
            delle due serie sfasate di 7 min: gap 7 / 14 min)
   Svc B: 05:38–23:58 · ogni 10 min
   Svc C: 07:35–21:45 · ogni 14 min

   Ipotesi da calibrare: M801→M818 ≈ 26 min, M818→M824 ≈ 12 min.
   Il thru SB lascia M801 ai minuti :32 (+21k) → M818 :58 → IBC04 :00.
   Il thru NB lascia M818 ai minuti :39 (+21k) (da IBC107 35 min prima).
================================================================ */
const _M8_A_S1_HW = [{ from: '05:39', to: '24:05', headwayMin: 21 }];
const _M8_A_S2_HW = [{ from: '05:46', to: '24:05', headwayMin: 21 }];
const _M8_A_N1_HW = [{ from: '05:34', to: '24:05', headwayMin: 21 }];
const _M8_A_N2_HW = [{ from: '05:41', to: '24:05', headwayMin: 21 }];
const _M8_AT_S_HW = [{ from: '05:32', to: '23:23', headwayMin: 21 }];
const _M8_AT_N_HW = [{ from: '05:39', to: '23:51', headwayMin: 21 }];
const _M8_B_HW = [
  { from: '05:38', to: '23:58', headwayMin: 10 },
];
const _M8_C_HW = [
  { from: '07:35', to: '21:45', headwayMin: 14 },
];

/* ================================================================
   STOPS thru Local (A_T) — M801 → M818 (poi IBC04 sull'Ibaches)
================================================================ */
const _M8_AT_STOPS_S = M8_CANONICAL_ORDER.slice(0, M8_CANONICAL_ORDER.indexOf('M818') + 1);
const _M8_AT_STOPS_N = [..._M8_AT_STOPS_S].reverse();

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

  /* ── A · All-stop fino a M824 (2 serie sfasate, 21 min ciascuna) ── */
  {
    id:         'M8',
    svcLogical: 'A_S',
    name:       'All-stop (southbound)',
    color:      '#00A2D3',
    cls:        'metro',
    rapid:      false,
    headway:    _M8_A_S1_HW,
    stops:      M8_CANONICAL_ORDER,           // M801 → M824
  },
  {
    id:         'M8',
    svcLogical: 'A_S',
    name:       'All-stop (southbound)',
    color:      '#00A2D3',
    cls:        'metro',
    rapid:      false,
    headway:    _M8_A_S2_HW,
    stops:      M8_CANONICAL_ORDER,           // M801 → M824
  },
  {
    id:         'M8',
    svcLogical: 'A_N',
    name:       'All-stop (northbound)',
    color:      '#00A2D3',
    cls:        'metro',
    rapid:      false,
    headway:    _M8_A_N1_HW,
    stops:      [...M8_CANONICAL_ORDER].reverse(),  // M824 → M801
  },
  {
    id:         'M8',
    svcLogical: 'A_N',
    name:       'All-stop (northbound)',
    color:      '#00A2D3',
    cls:        'metro',
    rapid:      false,
    headway:    _M8_A_N2_HW,
    stops:      [...M8_CANONICAL_ORDER].reverse(),  // M824 → M801
  },

  /* ── A_T · Local thru Ibaches (1 su 3, ogni 21 min) ─────────── */
  {
    id:         'M8',
    svcLogical: 'A_T_S',
    name:       'Local thru Ibaches Enikezya (southbound)',
    color:      '#00A2D3',
    cls:        'metro',
    rapid:      false,
    headway:    _M8_AT_S_HW,
    stops:      _M8_AT_STOPS_S,              // M801 → M818 → IBC04
  },
  {
    id:         'M8',
    svcLogical: 'A_T_N',
    name:       'Local thru Ibaches Enikezya (northbound)',
    color:      '#00A2D3',
    cls:        'metro',
    rapid:      false,
    headway:    _M8_AT_N_HW,
    stops:      _M8_AT_STOPS_N,              // IBC04 → M818 → M801
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

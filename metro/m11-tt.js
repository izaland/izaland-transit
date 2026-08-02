/* ================================================================
   M11-TT.JS — Metro Line 11 (Verde / 緑) · Timetable
   ================================================================
   Dipende da: metro/m11-data.js, metro/metro-router.js

   Servizi:
     B_S  Itsayuki Tonjo (M1101) → Jisahara (M1120)  [All-stop, SB]
     B_N  Jisahara (M1120) → Itsayuki Tonjo (M1101)  [All-stop, NB]

   Frequenze (da M11_HEADWAY):
     05:00–06:30   10 min
     06:30–07:00    5 min
     07:00–09:30    3 min (fascia di punta mattutina)
     09:30–17:00    5 min
     17:00–20:00    3 min (fascia di punta serale)
     20:00–22:30    5 min
     22:30–24:30   10 min

   Topologia: linea retta M1101 → M1120, servizio unico all-stop.
================================================================ */
'use strict';

/* ================================================================
   HEADWAY SLOT ARRAYS — formato MetroRouter
   Coprono l'intera finestra operativa del servizio.
   Stessa struttura di M11_HEADWAY in m11-data.js, ri-esportata
   qui come costante privata per chiarezza.
================================================================ */
const _M11_HW = [
  { from: '05:00', to: '06:30', headwayMin: 10 },
  { from: '06:30', to: '07:00', headwayMin:  5 },
  { from: '07:00', to: '09:30', headwayMin:  3 },
  { from: '09:30', to: '17:00', headwayMin:  5 },
  { from: '17:00', to: '20:00', headwayMin:  3 },
  { from: '20:00', to: '22:30', headwayMin:  5 },
  { from: '22:30', to: '24:30', headwayMin: 10 },
];

/* ================================================================
   M11_SERVICES_NORM — formato standard MetroRouter
================================================================ */
const M11_SERVICES_NORM = [

  /* ── B · All-stop southbound  (Itsayuki Tonjo → Jisahara) ── */
  {
    id:         'M11',
    svcLogical: 'B_S',
    name:       'All-stop (southbound)',
    color:      '#c5e1a5',
    cls:        'metro',
    rapid:      false,
    headway:    _M11_HW,
    stops:      M11_CANONICAL_ORDER,                    // M1101 → M1120
  },

  /* ── B · All-stop northbound  (Jisahara → Itsayuki Tonjo) ── */
  {
    id:         'M11',
    svcLogical: 'B_N',
    name:       'All-stop (northbound)',
    color:      '#c5e1a5',
    cls:        'metro',
    rapid:      false,
    headway:    _M11_HW,
    stops:      [...M11_CANONICAL_ORDER].reverse(),     // M1120 → M1101
  },
];

/* ----------------------------------------------------------------
   Registrazione linea M11 nel MetroRouter.
   Dipende da: metro/m11-data.js (M11_META, M11_ST,
               M11_CANONICAL_ORDER, M11_HEADWAY, M11_INTERCHANGE)
   Questo file è caricato dopo m11-data.js nell'HTML.
---------------------------------------------------------------- */
if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M11',
    meta:        M11_META,
    st:          M11_ST,
    services:    M11_SERVICES_NORM,
    interchange: M11_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M11_SERVICES_NORM };
}

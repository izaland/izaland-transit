/* ================================================================
   M4-TT.JS — Metro Line 4 · Kokendake Line · Timetable
   Generato automaticamente da M4_HEADWAY + 30 km/h commerciale.
   Dwell: 30 s per fermata intermedia.

   B_W  All-stop  Ipporai-Senpyan (M425) → Kawaei (M415)
   B_A  All-stop  Abawauri (M416)        → Kawaei (M415)  [ex-capolinea storico]
   B_E  All-stop  Kawaei (M415)          → Ipporai-Senpyan (M425)

   Servizio: 05:30 → 24:30
   Percorrenza totale:
     M425→M415: ~77.8 min
     M416→M415: ~45.0 min
   Frequenze: vedi M4_HEADWAY in m4-data.js
================================================================ */
'use strict';

/* placeholder — timetable completa generata inline sotto */
const M4_TT_META = {
  B_W: { from: 'M425', to: 'M415', dir: 'EB', firstDep: '05:30', lastDep: '24:30' },
  B_A: { from: 'M416', to: 'M415', dir: 'EB', firstDep: '05:30', lastDep: '24:30' },
  B_E: { from: 'M415', to: 'M425', dir: 'WB', firstDep: '05:30', lastDep: '24:30' },
};


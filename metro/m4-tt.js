/* ================================================================
   M4-TT.JS — Metro Line 4 · Kokendake Line · Timetable
   ================================================================
   Il timetable della linea 4 NON è statico: viene generato a
   runtime dal metro router a partire da M4_HEADWAY (m4-data.js)
   e dalla velocità commerciale di 30 km/h, con dwell di 30 s.

   Questo file è intenzionalmente vuoto (nessun array statico).
   Il metro router usa MetroRouter._syntheticTrips(line, ...) per
   costruire le corse al volo, esattamente come SuburbanRouter.

   Servizi attivi:
     B_W  Ipporai-Senpyan (M425) → Kawaei (M415)  prima corsa 05:30
     B_A  Abawauri (M416)        → Kawaei (M415)  prima corsa 05:30
     B_E  Kawaei (M415)          → Ipporai-Senpyan (M425)  prima corsa 05:30

   Percorrenza (30 km/h + 30 s dwell):
     M425→M415 : ~77.8 min
     M416→M415 : ~45.0 min
     M415→M425 : ~77.8 min
================================================================ */
'use strict';

/* Metadati servizi — usati dal metro router per sapere
   da quale stazione e in quale direzione generare le corse. */
const M4_SERVICES = [
  { id: 'B_W', from: 'M425', to: 'M415', dir: 'EB', firstDep: '05:30' },
  { id: 'B_A', from: 'M416', to: 'M415', dir: 'EB', firstDep: '05:30' },
  { id: 'B_E', from: 'M415', to: 'M425', dir: 'WB', firstDep: '05:30' },
];

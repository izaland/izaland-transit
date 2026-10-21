/* ================================================================
   M18-TT.JS — Metro Line 18 (#999999) · Timetable
   Dipende da: metro/m18-data.js, metro/metro-router.js
   Servizi: S1 All-stop, M1801 Nari-Gotsurindai ↔ M1821 Mewakate Kippai
            (solo local, ferma in tutte le stazioni; nessun thru service)

   Frequenze: morbida 6 min · semipunta 4 min · punta 3 min.
   TODO: fasce orarie, primo/ultimo treno, sosta e velocita' commerciale
         sono PROVVISORI (fasce come profilo M11/M14), da confermare.
================================================================ */
'use strict';

/* headway in minuti: morbida 6 · semipunta 4 · punta 3 */
const M18_HEADWAY = [
  { from: '05:00', to: '06:30', headwayMin: 6 },  /* morbida   */
  { from: '06:30', to: '07:00', headwayMin: 4 },  /* semipunta */
  { from: '07:00', to: '09:30', headwayMin: 3 },  /* punta     */
  { from: '09:30', to: '10:30', headwayMin: 4 },  /* semipunta */
  { from: '10:30', to: '16:00', headwayMin: 6 },  /* morbida   */
  { from: '16:00', to: '17:00', headwayMin: 4 },  /* semipunta */
  { from: '17:00', to: '20:00', headwayMin: 3 },  /* punta     */
  { from: '20:00', to: '21:00', headwayMin: 4 },  /* semipunta */
  { from: '21:00', to: '24:30', headwayMin: 6 },  /* morbida   */
];

/* Valori provvisori (metro pesante, come M14) se non gia' definiti nei dati */
if (M18_META.avgSpeedKmh == null) M18_META.avgSpeedKmh = 40;
if (M18_META.dwellSec == null)    M18_META.dwellSec    = 20;

const M18_SERVICES_NORM = [
  {
    id:         'M18',
    svcLogical: 'S1_S',
    name:       'All-stop (M1801 → M1821)',
    color:      '#999999',
    cls:        'metro',
    rapid:      false,
    headway:    M18_HEADWAY,
    stops:      M18_CANONICAL_ORDER,
  },
  {
    id:         'M18',
    svcLogical: 'S1_N',
    name:       'All-stop (M1821 → M1801)',
    color:      '#999999',
    cls:        'metro',
    rapid:      false,
    headway:    M18_HEADWAY,
    stops:      [...M18_CANONICAL_ORDER].reverse(),
  },
];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M18',
    meta:        M18_META,
    st:          M18_ST,
    services:    M18_SERVICES_NORM,
    interchange: M18_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M18_HEADWAY, M18_SERVICES_NORM };
}

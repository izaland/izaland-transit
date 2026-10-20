/* ================================================================
   M4-TT.JS — Metro Line 4 · Kokendake Line · Timetable
   ================================================================
   Il timetable è generato runtime da MetroRouter usando M4_HEADWAY
   e avgSpeedKmh definiti in m4-data.js.

   Servizi:
     B_W  Ipporai-Senpyan (M425) → Kawaei (M415)
     B_E  Kawaei (M415)          → Ipporai-Senpyan (M425)
     A_W  Ipporai-Senpyan (M425) → Kawaei (M415)  [Rapid, fermate selezionate]
     A_E  Kawaei (M415)          → Ipporai-Senpyan (M425)  [Rapid]
     B_W  Ogiwata (M402)         → Kawaei (M415)  [All-stop, short-turn
          mattutino 05:00–05:30 ogni 10 min; proseguono su SBO]

   Treni da Ogiwata (M402): partono prima che i primi All-stop da M425
   raggiungano M402 (M425 05:00 → M402 ~05:38). Percorrenza M402→M415
   = 40 min 17 s (13 soste intermedie da 30 s); thru su SBO07 dopo 2 min.
================================================================ */
'use strict';

/* Stazioni M4 da Ogiwata (M402) a Kawaei (M415), All-stop */
const M4_OGIWATA_ORDER = M4_CANONICAL_ORDER.slice(M4_CANONICAL_ORDER.indexOf('M402'));

/* Servizi normalizzati per MetroRouter (formato con stops + headway) */
const M4_SERVICES_NORM = [
  {
    id:         'M4',
    svcLogical: 'B_W',
    name:       'All-stop (westbound)',
    color:      '#CCB800',
    cls:        'metro',
    rapid:      false,
    headway:    M4_HEADWAY,
    stops:      M4_CANONICAL_ORDER,
  },
  {
    id:         'M4',
    svcLogical: 'B_W',
    name:       'All-stop (westbound) · da Ogiwata',
    color:      '#CCB800',
    cls:        'metro',
    rapid:      false,
    headway:    [{ from: '05:00', to: '05:35', headwayMin: 10 }],
    stops:      M4_OGIWATA_ORDER,
  },
  {
    id:         'M4',
    svcLogical: 'B_E',
    name:       'All-stop (eastbound)',
    color:      '#CCB800',
    cls:        'metro',
    rapid:      false,
    headway:    M4_HEADWAY,
    stops:      [...M4_CANONICAL_ORDER].reverse(),
  },
  {
    id:         'M4',
    svcLogical: 'A_W',
    name:       'Rapid (westbound)',
    color:      '#FFEF00',
    cls:        'metro',
    rapid:      true,
    headway:    M4_HEADWAY,
    stops: [
      'M425','M421','M419','M418','M416',
      'M401','M403','M405','M407','M409','M411','M413','M415',
    ],
  },
  {
    id:         'M4',
    svcLogical: 'A_E',
    name:       'Rapid (eastbound)',
    color:      '#FFEF00',
    cls:        'metro',
    rapid:      true,
    headway:    M4_HEADWAY,
    stops: [
      'M415','M413','M411','M409','M407','M405','M403','M401',
      'M416','M418','M419','M421','M425',
    ],
  },
];

/* ----------------------------------------------------------------
   Registrazione linea M4 nel MetroRouter.
   Dipende da: m4-data.js (M4_ST, M4_META, M4_HEADWAY,
               M4_CANONICAL_ORDER, M4_INTERCHANGE)
   Questo file è caricato dopo m4-data.js nell'HTML.
---------------------------------------------------------------- */
if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M4',
    meta:        M4_META,
    st:          M4_ST,
    services:    M4_SERVICES_NORM,
    interchange: M4_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M4_SERVICES_NORM };
}

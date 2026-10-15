/* ================================================================
   M12-TT.JS — Metro Line 12 (#86ebeb) · Timetable
   Dipende da: metro/m12-data.js, metro/metro-router.js

   Servizi:
     A_S  Nihkyonta Mirai (M1201) → Mewakate Kippai (M1219)
     A_N  Mewakate Kippai (M1219) → Nihkyonta Mirai (M1201)
     B_S  Yeisonzuta (M1204) → Mewakate Kippai (M1219)
     B_N  Mewakate Kippai (M1219) → Yeisonzuta (M1204)

   A e B si alternano: ciascuno fa metà delle corse sulla tratta
   comune M1204–M1219. Headway per servizio (vedi M12_HEADWAY):
     04:50–06:00  15 min  (8 tph complessivi)
     06:00–07:15  10 min  (12 tph)
     07:15–09:30   4 min  (30 tph, punta AM)
     09:30–17:50  10 min  (12 tph)
     17:50–20:30   6 min  (20 tph, punta PM)
     20:30–23:20  10 min  (12 tph)
     23:20–24:10  15 min  (8 tph)

   NOTA: B ha offsetMin 2 per sfasarsi da A. Un solo offset non
   centra la metà esatta di ogni fascia; da affinare se serve.
================================================================ */
'use strict';

const M12_SERVICES_NORM = [
  {
    id: 'M12', svcLogical: 'A_S', name: 'Full run (southbound)',
    color: '#86ebeb', cls: 'metro', rapid: false,
    headway: M12_HEADWAY, offsetMin: 0,
    stops: M12_CANONICAL_ORDER,
  },
  {
    id: 'M12', svcLogical: 'A_N', name: 'Full run (northbound)',
    color: '#86ebeb', cls: 'metro', rapid: false,
    headway: M12_HEADWAY, offsetMin: 0,
    stops: [...M12_CANONICAL_ORDER].reverse(),
  },
  {
    id: 'M12', svcLogical: 'B_S', name: 'Own track only (southbound)',
    color: '#86ebeb', cls: 'metro', rapid: false,
    headway: M12_HEADWAY, offsetMin: 2,
    stops: M12_OWN_TRACK_ORDER,
  },
  {
    id: 'M12', svcLogical: 'B_N', name: 'Own track only (northbound)',
    color: '#86ebeb', cls: 'metro', rapid: false,
    headway: M12_HEADWAY, offsetMin: 2,
    stops: [...M12_OWN_TRACK_ORDER].reverse(),
  },
];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M12',
    meta:        M12_META,
    st:          M12_ST,
    services:    M12_SERVICES_NORM,
    interchange: M12_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M12_SERVICES_NORM };
}

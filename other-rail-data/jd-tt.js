/* ================================================================
   JD-TT.JS — Juwon-Kodōn Line · Timetable
   中央湖東線
   ================================================================
   Dipende da: suburban-data.js (SUBURBAN_LINES.JD)

   Servizi:
     JD1  JD01 ↔ JD25  tutte le fermate  headway 8 min
          - da JD01 (Sainðaul Central): 05:42 – 23:42
          - da JD25 (Ninokawa):         05:42 – 23:42

   NOTE:
     — Servizio uniforme tutto il giorno (nessuna fascia peak differenziata).
     — Servizio Rapid (JD2) previsto in futuro; placeholder commentato.
================================================================ */
'use strict';

/* ================================================================
   Stops JD1 — Local, tutte le fermate
================================================================ */
const _JD_JD1_STOPS_SB = [
  'JD01','JD02','JD03','JD04','JD05','JD06','JD07','JD08','JD09','JD10',
  'JD11','JD12','JD13','JD14','JD15','JD16','JD17','JD18','JD19','JD20',
  'JD21','JD22','JD23','JD24','JD25',
];
const _JD_JD1_STOPS_NB = [..._JD_JD1_STOPS_SB].reverse();

/* ================================================================
   JD_TT_SERVICES — formato compatibile con SuburbanRouter _svcTrips()
================================================================ */
const JD_TT_SERVICES = [
  {
    id:       'JD1',
    desc:     'Local — Sainðaul Central → Ninokawa',
    fromCode: 'JD01',
    toCode:   'JD25',
    firstDep: '05:42',
    lastDep:  '23:42',
    headway:  8,
    stops:    _JD_JD1_STOPS_SB,
  },
  {
    id:       'JD1_NB',
    desc:     'Local NB — Ninokawa → Sainðaul Central',
    fromCode: 'JD25',
    toCode:   'JD01',
    firstDep: '05:42',
    lastDep:  '23:42',
    headway:  8,
    stops:    _JD_JD1_STOPS_NB,
  },

  /*
  // JD2 — Rapid (placeholder)
  // Decommentare quando il servizio viene istituito.
  {
    id:       'JD2',
    desc:     'Rapid SB — Sainðaul Central → Ninokawa',
    fromCode: 'JD01',
    toCode:   'JD25',
    firstDep: 'HH:MM',
    lastDep:  'HH:MM',
    headway:  16,
    stops:    ['JD01', /* fermate selezionate */ 'JD25'],
  },
  {
    id:       'JD2_NB',
    desc:     'Rapid NB — Ninokawa → Sainðaul Central',
    fromCode: 'JD25',
    toCode:   'JD01',
    firstDep: 'HH:MM',
    lastDep:  'HH:MM',
    headway:  16,
    stops:    ['JD25', /* fermate selezionate */ 'JD01'],
  },
  */
];

/* ================================================================
   REGISTRAZIONE nel SuburbanRouter
   Dipende da: suburban-data.js (SUBURBAN_LINES.JD, SUBURBAN_INTERCHANGE)
   Caricare questo file dopo suburban-data.js nell'HTML.
================================================================ */
if (typeof SuburbanRouter !== 'undefined') {
  SuburbanRouter.register({
    lineId:      'JD',
    meta:        {
      name:  'Juwon-Kodōn Line',
      kanji: '中央湖東線',
      color: '#FF66CC',
      cls:   'suburban',
    },
    stations:    SUBURBAN_LINES.JD.stations,
    services:    JD_TT_SERVICES,
    interchange: Object.fromEntries(
      Object.entries(SUBURBAN_INTERCHANGE).filter(([k]) => k.startsWith('JD'))
    ),
  });
}

if (typeof module !== 'undefined') {
  module.exports = { JD_TT_SERVICES };
}

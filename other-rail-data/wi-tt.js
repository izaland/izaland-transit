/* ================================================================
   WI-TT.JS — Wataiga Monorail · Timetable
   ================================================================
   Dipende da: wi-data.js

   Servizi:
     WI1  WI01 ↔ WI13  tutte le fermate (femra)
          - Orario: 05:30 – 23:30
          - Off-peak: 6 tph (headway 10 min)
          - Peak:    12 tph (headway  5 min)
            Fasce peak: 07:00–09:30 e 17:00–20:00

   Interscambi:
     WI01 (Watarui Otsuminiswae) ↔ M13  (IZX)
     WI01 (Watarui Otsuminiswae) ↔ WKB01 (WKB)
     WI02 (Tankānji)             ↔ WKB03 (WKB)
================================================================ */
'use strict';

/* ================================================================
   Stops WI1 — Local, tutte le fermate
================================================================ */
const _WI_WI1_STOPS_SB = [
  'WI01','WI02','WI03','WI04','WI05','WI06','WI07',
  'WI08','WI09','WI10','WI11','WI12','WI13',
];
const _WI_WI1_STOPS_NB = [..._WI_WI1_STOPS_SB].reverse();

/* ================================================================
   WI_TT_SERVICES — formato compatibile con SuburbanRouter _svcTrips()
================================================================ */
const WI_TT_SERVICES = [
  {
    id:       'WI1',
    desc:     'Local — Watarui Otsuminiswae → Igattarun Juwon',
    fromCode: 'WI01',
    toCode:   'WI13',
    firstDep: '05:30',
    lastDep:  '23:30',
    headway:  10,           // off-peak (6 tph)
    peakWindows: [
      { from: '07:00', to: '09:30', headway: 5 },   // picco mattina (12 tph)
      { from: '17:00', to: '20:00', headway: 5 },   // picco sera   (12 tph)
    ],
    stops:    _WI_WI1_STOPS_SB,
  },
  {
    id:       'WI1_NB',
    desc:     'Local NB — Igattarun Juwon → Watarui Otsuminiswae',
    fromCode: 'WI13',
    toCode:   'WI01',
    firstDep: '05:30',
    lastDep:  '23:30',
    headway:  10,
    peakWindows: [
      { from: '07:00', to: '09:30', headway: 5 },
      { from: '17:00', to: '20:00', headway: 5 },
    ],
    stops:    _WI_WI1_STOPS_NB,
  },
];

/* ================================================================
   REGISTRAZIONE nel SuburbanRouter
   Dipende da: wi-data.js (WI_LINES, WI_INTERCHANGE)
   Caricare questo file dopo wi-data.js nell'HTML.
================================================================ */
if (typeof SuburbanRouter !== 'undefined') {
  SuburbanRouter.register({
    lineId:      'WI',
    meta:        {
      name:  'Wataiga Monorail',
      kanji: '',
      color: '#838c67',
      cls:   'private-monorail',
    },
    stations:    WI_LINES.WI.stations,
    services:    WI_TT_SERVICES,
    interchange: WI_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { WI_TT_SERVICES };
}

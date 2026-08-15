/* ================================================================
   HD-TT.JS — Handai Electric Railway Main Line · Timetable
   彎大電鐵本線
   ================================================================
   Dipende da: hd-data.js

   Servizi:
     HD1  HD01 ↔ HD30  tutte le fermate  headway 7.5 min (8 tph)
          - da HD01 (Warohan Daiches): 05:12 – 23:48
          - da HD30 (Kuryen-ji):       04:49 – 23:25

   NOTE:
     — Servizio uniforme tutto il giorno (nessuna fascia peak differenziata).
     — Servizio Rapid (HD2) previsto in futuro; placeholder commentato.
================================================================ */
'use strict';

/* ================================================================
   Stops HD1 — Local, tutte le fermate
================================================================ */
const _HD_HD1_STOPS_SB = [
  'HD01','HD02','HD03','HD04','HD05','HD06','HD07','HD08','HD09','HD10',
  'HD11','HD12','HD13','HD14','HD15','HD16','HD17','HD18','HD19','HD20',
  'HD21','HD22','HD23','HD24','HD25','HD26','HD27','HD28','HD29','HD30',
];
const _HD_HD1_STOPS_NB = [..._HD_HD1_STOPS_SB].reverse();

/* ================================================================
   HD_SERVICES — formato compatibile con SuburbanRouter _svcTrips()
================================================================ */
const HD_TT_SERVICES = [
  {
    id:       'HD1',
    desc:     'Local — Warohan Daiches → Kuryen-ji',
    fromCode: 'HD01',
    toCode:   'HD30',
    firstDep: '05:12',
    lastDep:  '23:48',
    headway:  7.5,
    stops:    _HD_HD1_STOPS_SB,
  },
  {
    id:       'HD1_NB',
    desc:     'Local NB — Kuryen-ji → Warohan Daiches',
    fromCode: 'HD30',
    toCode:   'HD01',
    firstDep: '04:49',
    lastDep:  '23:25',
    headway:  7.5,
    stops:    _HD_HD1_STOPS_NB,
  },

  /*
  // HD2 — Rapid (placeholder)
  // Decommentare quando il servizio viene istituito.
  {
    id:       'HD2',
    desc:     'Rapid SB — Warohan Daiches → Kuryen-ji',
    fromCode: 'HD01',
    toCode:   'HD30',
    firstDep: 'HH:MM',
    lastDep:  'HH:MM',
    headway:  15,
    stops:    ['HD01', /* fermate selezionate */ 'HD30'],
  },
  {
    id:       'HD2_NB',
    desc:     'Rapid NB — Kuryen-ji → Warohan Daiches',
    fromCode: 'HD30',
    toCode:   'HD01',
    firstDep: 'HH:MM',
    lastDep:  'HH:MM',
    headway:  15,
    stops:    ['HD30', /* fermate selezionate */ 'HD01'],
  },
  */
];

/* ================================================================
   REGISTRAZIONE nel SuburbanRouter
   Dipende da: hd-data.js (HD_LINES, HD_INTERCHANGE)
   Caricare questo file dopo hd-data.js nell'HTML.
================================================================ */
if (typeof SuburbanRouter !== 'undefined') {
  SuburbanRouter.register({
    lineId:      'HD',
    meta:        {
      name:  'Handai Electric Railway Main Line',
      kanji: '彎大電鐵本線',
      color: '#312C85',
      cls:   'private',
    },
    stations:    HD_LINES.HD.stations,
    services:    HD_TT_SERVICES,
    interchange: HD_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { HD_TT_SERVICES };
}

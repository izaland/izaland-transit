/* ================================================================
   RKY-TT.JS — Rinkyun Railway Main Line · Timetable
   臨急鉄道本線
   ================================================================
   Dipende da: rky-data.js

   Servizi:
     RKY1  Local  RKY01 ↔ RKY14  tutte le fermate
           10 min nelle fasce diurne (06:00–09:00, 09:30–16:30, 17:00–20:00)
           20 min early/late (provvisorio)
================================================================ */
'use strict';

const _RKY_STOPS_SB = [
  'RKY01','RKY02','RKY03','RKY04','RKY05','RKY06','RKY07','RKY08','RKY09','RKY10','RKY11','RKY12','RKY13','RKY14',
];
const _RKY_STOPS_NB = [..._RKY_STOPS_SB].reverse();

const RKY_TT_SERVICES = [
  {
    id:       'RKY1',
    desc:     'Local — Sakamuso → Riimibaiken',
    fromCode: 'RKY01',
    toCode:   'RKY14',
    firstDep: '05:30',
    lastDep:  '23:30',
    headway:  20,
    stops:    _RKY_STOPS_SB,
    peakWindows: [
      { from: '06:00', to: '09:00', headway: 10 },
      { from: '09:30', to: '16:30', headway: 10 },
      { from: '17:00', to: '20:00', headway: 10 },
    ],
  },
  {
    id:       'RKY1_NB',
    desc:     'Local NB — Riimibaiken → Sakamuso',
    fromCode: 'RKY14',
    toCode:   'RKY01',
    firstDep: '05:30',
    lastDep:  '23:30',
    headway:  20,
    stops:    _RKY_STOPS_NB,
    peakWindows: [
      { from: '06:00', to: '09:00', headway: 10 },
      { from: '09:30', to: '16:30', headway: 10 },
      { from: '17:00', to: '20:00', headway: 10 },
    ],
  },
];

if (typeof SuburbanRouter !== 'undefined') {
  SuburbanRouter.register({
    lineId:      'RKY',
    meta:        {
      name:  'Rinkyun Railway Main Line',
      kanji: '臨急鉄道本線',
      color: '#A3DE8C',
      cls:   'private',
    },
    stations:    RKY_LINES.RKY.stations,
    services:    RKY_TT_SERVICES,
    interchange: RKY_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { RKY_TT_SERVICES };
}

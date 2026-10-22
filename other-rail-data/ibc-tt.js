/* ================================================================
   IBC-TT.JS — Ibaches Main Line · Timetable
   齒琉能電鐵
   ================================================================
   Dipende da: ibc-data.js

   Servizi:
     IBC1  IBC01 ↔ IBC23  tutte le fermate  headway 10 min (6 tph)
          - da IBC01 (Anagusa Mukai Ibaches): 05:00 – 23:30
          - da IBC23 (Ibaruno):               05:00 – 23:30

   NOTE:
     — Servizio provvisorio e uniforme tutto il giorno (TODO).
================================================================ */
'use strict';

const _IBC_STOPS_SB = [
  'IBC01','IBC02','IBC03','IBC04','IBC05','IBC06','IBC07','IBC08','IBC09','IBC10',
  'IBC11','IBC12','IBC13','IBC14','IBC15','IBC16','IBC17','IBC18','IBC19','IBC20',
  'IBC21','IBC22','IBC23',
];
const _IBC_STOPS_NB = [..._IBC_STOPS_SB].reverse();

const IBC_TT_SERVICES = [
  {
    id:       'IBC1',
    desc:     'Local — Anagusa Mukai (Ibaches) → Ibaruno',
    fromCode: 'IBC01',
    toCode:   'IBC23',
    firstDep: '05:00',
    lastDep:  '23:30',
    headway:  10,
    stops:    _IBC_STOPS_SB,
  },
  {
    id:       'IBC1_NB',
    desc:     'Local NB — Ibaruno → Anagusa Mukai (Ibaches)',
    fromCode: 'IBC23',
    toCode:   'IBC01',
    firstDep: '05:00',
    lastDep:  '23:30',
    headway:  10,
    stops:    _IBC_STOPS_NB,
  },
];

if (typeof SuburbanRouter !== 'undefined') {
  SuburbanRouter.register({
    lineId:      'IBC',
    meta:        {
      name:  'Ibaches Main Line',
      kanji: '齒琉能電鐵',
      color: '#FF9999',
      cls:   'private',
    },
    stations:    IBC_LINES.IBC.stations,
    services:    IBC_TT_SERVICES,
    interchange: IBC_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { IBC_TT_SERVICES };
}

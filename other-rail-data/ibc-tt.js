/* ================================================================
   IBC-TT.JS — Ibaches Main Line · Timetable
   齒琉能電鐵
   ================================================================
   Dipende da: ibc-data.js

   Servizi:
     IBC1  Local  IBC01 ↔ IBC34  tutte le fermate  headway 10 min (6 tph)
          - da IBC01 (Anagusa Mukai Ibaches): 05:00 – 23:30
          - da IBC34 (Hetsannui-Nari):        05:00 – 23:30
     IBC2  Rapid  IBC01 ↔ IBC34  14 fermate  headway 20 min (3 tph)
          - fascia centrale (esclusi i picchi)
          - da IBC01: 09:45 – 17:25 (minuti :05, :25, :45)
          - da IBC34: 09:02 – 16:42 (calcolato a ritroso, vedi note)
          - fermate: IBC01, 03, 05, 07, 11, 15, 18, 19, 21, 23,
                     28, 30, 33, 34

   NOTE:
     — Servizio provvisorio e uniforme tutto il giorno (TODO).
     — Ordine fisico: IBC30 precede IBC29 (vedi ibc-data.js).
     — Orari Rapid da IBC34: ogni treno arriva a IBC01 7 min prima
       della ripartenza (折り返し). Tempo di percorrenza
       IBC34→IBC01 ≈ 36.5 min, calcolato da km tra le stazioni con:
       accel 3.3 km/h/s, decel 4.0 km/h/s (tipo Odakyu), vmax 140 km/h,
       sosta 30 s a ogni fermata intermedia, profilo trapezoidale
       (triangolare nei tratti corti). Passaggi nelle stazioni saltate
       a velocità di linea. Valori arrotondati al minuto.
     — Le prime corse NB partono prima delle 09:30 e le ultime prima
       delle 17:25 per poter fare il 折り返し a IBC01.
================================================================ */
'use strict';

const _IBC_STOPS_SB = [
  'IBC01','IBC02','IBC03','IBC04','IBC05','IBC06','IBC07','IBC08','IBC09','IBC10',
  'IBC11','IBC12','IBC13','IBC14','IBC15','IBC16','IBC17','IBC18','IBC19','IBC20',
  'IBC21','IBC22','IBC23','IBC24','IBC25','IBC26','IBC27','IBC28','IBC30','IBC29',
  'IBC31','IBC32','IBC33','IBC34',
];
const _IBC_STOPS_NB = [..._IBC_STOPS_SB].reverse();

const _IBC_RAPID_SB = [
  'IBC01','IBC03','IBC05','IBC07','IBC11','IBC15','IBC18','IBC19','IBC21','IBC23',
  'IBC28','IBC30','IBC33','IBC34',
];
const _IBC_RAPID_NB = [..._IBC_RAPID_SB].reverse();

const IBC_TT_SERVICES = [
  {
    id:       'IBC1',
    desc:     'Local — Anagusa Mukai (Ibaches) → Hetsannui-Nari',
    fromCode: 'IBC01',
    toCode:   'IBC34',
    firstDep: '05:00',
    lastDep:  '23:30',
    headway:  10,
    stops:    _IBC_STOPS_SB,
  },
  {
    id:       'IBC1_NB',
    desc:     'Local NB — Hetsannui-Nari → Anagusa Mukai (Ibaches)',
    fromCode: 'IBC34',
    toCode:   'IBC01',
    firstDep: '05:00',
    lastDep:  '23:30',
    headway:  10,
    stops:    _IBC_STOPS_NB,
  },
  {
    id:       'IBC2',
    desc:     'Rapid — Anagusa Mukai (Ibaches) → Hetsannui-Nari',
    fromCode: 'IBC01',
    toCode:   'IBC34',
    firstDep: '09:45',
    lastDep:  '17:25',
    headway:  20,
    stops:    _IBC_RAPID_SB,
  },
  {
    id:       'IBC2_NB',
    desc:     'Rapid NB — Hetsannui-Nari → Anagusa Mukai (Ibaches)',
    fromCode: 'IBC34',
    toCode:   'IBC01',
    firstDep: '09:02',
    lastDep:  '16:42',
    headway:  20,
    stops:    _IBC_RAPID_NB,
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

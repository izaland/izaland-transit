/* ================================================================
   IBC-TT.JS — Ibaches Main Line · Timetable
   齒琉能電鐵
   ================================================================
   Dipende da: ibc-data.js, ibc-odanuri-data.js, suburban-router.js

   Servizi (tutti con explicitDir: true, definiti in entrambe le direzioni):
     Local  IBC01 ↔ IBC34  tutte le fermate  6 tph (ogni 10 min), 05:00–23:30
          Tre serie con passo 30 min, sfasate di 10 min:
          - IBC1X  :00/:30  prosegue sulla Odanuri Shinai-Line (IBC01 ↔ IBC104)
          - IBC1   :10/:40  termina a IBC34
          - IBC1B  :20/:50  termina a IBC34
          (1 treno su 3 va sulla diramazione; NB speculare, vedi sotto)
     IBC2  Rapid  IBC01 ↔ IBC34  14 fermate  headway 20 min (3 tph)
          - fascia centrale (esclusi i picchi)
          - da IBC01: 09:45 – 17:25 (minuti :05, :25, :45)
          - da IBC34: 09:02 – 16:42 (calcolato a ritroso, vedi note)
          - fermate: IBC01, 03, 05, 07, 11, 15, 18, 19, 21, 23,
                     28, 30, 33, 34
     IBC3  Limited Express  IBC01 ↔ IBC33  5 fermate  headway 60 min (1 tph)
          - da IBC01: 07:09 – 21:09 (minuto :09)
          - da IBC33: 06:38 – 20:38 (minuto :38)
          - fermate: IBC01, 03, 11, 23, 33

   Odanuri Shinai-Line (齒鉄裏窟市内線) IBC34 ↔ IBC104, 4 fermate:
     - passanti da/per IBC01 (IBC1X, IBC1X_NB): 2 tph tutto il giorno
     - IBC4_n: treni che nascono/finiscono a IBC34 per completare la
       frequenza: 10 min in punta (07:00–10:00 e 17:00–20:00),
       15 min nel resto della giornata. Totale diramazione: 6 tph in
       punta, 4 tph fuori punta.
     - ASSUNZIONI (da calibrare): fasce di punta; tempo IBC34→IBC104
       ≈ 6 min; i passanti arrivano a IBC34 ai minuti :00/:30.

   Profilo cinematico (FIX 14 del router), uguale per tutti i servizi:
     vMaxKmh 140 · accel 3.3 km/h/s · decel 4.0 km/h/s (tipo Odakyu)
     sosta 30 s a ogni fermata intermedia.

   Interscambio Local ↔ Rapid (stessa banchina, 0 min a piedi):
     gestito dal router nelle fasi 1b (Rapid→Local) e 1c (Local→Rapid)
     nelle stazioni in cui fermano entrambi i servizi:
     IBC01, 03, 05, 07, 11, 15, 18, 19, 21, 23, 28, 30, 33, 34.
     Il Rapid ha stops[] non vuoto; il Local ha stops [] (= tutte).

   NOTE:
     — Servizio provvisorio e uniforme tutto il giorno (TODO).
     — Ordine fisico: IBC30 precede IBC29 (vedi ibc-data.js).
     — Orari Rapid da IBC34: ogni treno arriva a IBC01 7 min prima
       della ripartenza (折り返し). Tempo di percorrenza
       IBC34→IBC01 ≈ 36.5 min con il profilo qui sopra. Valori
       arrotondati al minuto.
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

const _IBC_LEX_SB = ['IBC01','IBC03','IBC11','IBC23','IBC33'];
const _IBC_LEX_NB = [..._IBC_LEX_SB].reverse();

/* profilo cinematico comune (metropolitano, tipo Odakyu) */
const _IBC_PROFILE = {
  vMaxKmh:        140,
  accelKmhPerSec: 3.3,
  decelKmhPerSec: 4.0,
  dwellSec:       30,
  explicitDir:    true,
};

const _ibcMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const _ibcHM  = (t) => {
  const v = ((t % 1440) + 1440) % 1440;
  return String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0');
};
const _ibcShift = (hhmm, delta) => _ibcHM(_ibcMin(hhmm) + delta);

const _ibcSvc = (id, desc, fromCode, toCode, firstDep, lastDep, headway, stops) => ({
  id, desc, fromCode, toCode, firstDep, lastDep, headway, stops, ..._IBC_PROFILE,
});

const _IBC_HAS_BRANCH = IBC_LINES.IBC.stations.some((s) => s.code === 'IBC104');

/* Treni Local IBC01 ↔ IBC34: 3 serie da 30 min. Se la diramazione e' caricata,
   la serie :00/:30 prosegue fino a IBC104; altrimenti torna a termina a IBC34. */
const _IBC_THRU_TO   = _IBC_HAS_BRANCH ? 'IBC104' : 'IBC34';
const _IBC_THRU_NAME = _IBC_HAS_BRANCH ? 'Odanuri' : 'Hetsannui-Nari';

const IBC_TT_SERVICES = [
  _ibcSvc('IBC1X',    'Local — Anagusa Mukai (Ibaches) → ' + _IBC_THRU_NAME, 'IBC01', _IBC_THRU_TO, '05:00', '23:30', 30, []),
  _ibcSvc('IBC1X_NB', 'Local NB — ' + _IBC_THRU_NAME + ' → Anagusa Mukai (Ibaches)', _IBC_THRU_TO, 'IBC01',
          _IBC_HAS_BRANCH ? '04:54' : '05:00', _IBC_HAS_BRANCH ? '23:24' : '23:30', 30, []),
  _ibcSvc('IBC1',     'Local — Anagusa Mukai (Ibaches) → Hetsannui-Nari',    'IBC01', 'IBC34', '05:10', '23:10', 30, []),
  _ibcSvc('IBC1_NB',  'Local NB — Hetsannui-Nari → Anagusa Mukai (Ibaches)', 'IBC34', 'IBC01', '05:10', '23:10', 30, []),
  _ibcSvc('IBC1B',    'Local — Anagusa Mukai (Ibaches) → Hetsannui-Nari',    'IBC01', 'IBC34', '05:20', '23:20', 30, []),
  _ibcSvc('IBC1B_NB', 'Local NB — Hetsannui-Nari → Anagusa Mukai (Ibaches)', 'IBC34', 'IBC01', '05:20', '23:20', 30, []),
  {
    id:       'IBC2',
    desc:     'Rapid — Anagusa Mukai (Ibaches) → Hetsannui-Nari',
    fromCode: 'IBC01',
    toCode:   'IBC34',
    firstDep: '09:45',
    lastDep:  '17:25',
    headway:  20,
    stops:    _IBC_RAPID_SB,
    ..._IBC_PROFILE,
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
    ..._IBC_PROFILE,
  },
  {
    id:       'IBC3',
    desc:     'Limited Express — Anagusa Mukai (Ibaches) → IBC33',
    fromCode: 'IBC01',
    toCode:   'IBC33',
    firstDep: '07:09',
    lastDep:  '21:09',
    headway:  60,
    stops:    _IBC_LEX_SB,
    ..._IBC_PROFILE,
  },
  {
    id:       'IBC3_NB',
    desc:     'Limited Express NB — IBC33 → Anagusa Mukai (Ibaches)',
    fromCode: 'IBC33',
    toCode:   'IBC01',
    firstDep: '06:38',
    lastDep:  '20:38',
    headway:  60,
    stops:    _IBC_LEX_NB,
    ..._IBC_PROFILE,
  },
];

/* Odanuri Shinai-Line: treni che nascono a IBC34 (SB) e che finiscono a IBC34 (NB).
   Fuori punta :15/:45 (ogni 15 min con i passanti :00/:30);
   in punta :10/:40 e :20/:50 (ogni 10 min con i passanti).
   NB: partenza da IBC104 12 min prima dello slot SB (arrivo + giro a IBC34). */
const _IBC_BR_WINDOWS = [
  ['05:15', '06:45'], ['10:15', '16:45'], ['20:15', '23:15'],
  ['07:10', '09:40'], ['17:10', '19:40'],
  ['07:20', '09:50'], ['17:20', '19:50'],
];
if (_IBC_HAS_BRANCH) {
  _IBC_BR_WINDOWS.forEach(([first, last], i) => {
    const n = i + 1;
    IBC_TT_SERVICES.push(
      _ibcSvc('IBC4_' + n, 'Local — Hetsannui-Nari → Odanuri', 'IBC34', 'IBC104', first, last, 30, []),
      _ibcSvc('IBC4_' + n + '_NB', 'Local NB — Odanuri → Hetsannui-Nari', 'IBC104', 'IBC34',
              _ibcShift(first, -12), _ibcShift(last, -12), 30, [])
    );
  });
}

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

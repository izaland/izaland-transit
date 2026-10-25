/* ================================================================
   IBC-TT.JS — Ibaches Main Line · Timetable
   齒琉能電鐵
   ================================================================
   Dipende da: ibc-data.js, suburban-router.js

   Local da IBC01: tre serie ogni 30 min, sfasate di 10 min.
     IBC1X :00/:30 per IBC104 Odanuri; IBC1 :10/:40 per IBC41;
     IBC1B :20/:50 per IBC34. IBC1_NB: IBC41 → IBC01,
     05:10–23:10 provvisori. A IBC41 il Local termina: per proseguire
     verso IBC55 si cambia su una navetta IBC6, NON e' un thru.

   IBC2 Rapid IBC01 ↔ IBC41: 16 fermate, ogni 20 min.
     SB 09:45–17:25; NB da IBC41 09:02–16:42 provvisori.
     IBC01,03,05,07,11,15,18,19,21,23,28,30,33,34,37,41.

   IBC3 Limited Express IBC01 ↔ IBC55: diretto senza cambio,
     8 fermate, ogni 60 min. SB 07:09–21:09; NB da IBC55
     06:38–20:38 provvisori. IBC01,03,11,23,33,41,50,55.

   IBC6 Local IBC41 ↔ IBC55: tutte le 15 stazioni, 2 tph di base.
     Punte 07:00–10:00 e 17:00–20:00: un rinforzo/ora (3 tph),
     non necessariamente equidistante. I tempi delle navette vengono
     calcolati sotto dal profilo corrente: attesa MINIMA 5 min,
     partenza arrotondata al minuto successivo. Nessun thru flag.
     Base SB dopo gli arrivi IBC1 da IBC01; rinforzo SB dopo IBC3.
     Base NB prima delle partenze IBC1_NB; rinforzi NB provvisori.
     Ore iniziali/finali parziali non riempite con corse aggiuntive.
     Gli orari di servizio possono superare 24:00 per l'ultima coincidenza.

   IBC7 Local IBC41 ↔ IBC121 Maeðaki: 2 tph, tutte le fermate,
     05:00–24:00. IBC7S: corse corte IBC41 ↔ IBC114 Ninokawa,
     2 tph 06–22, sfasate di 15 min. IBC7P1/P2: altri 2 tph solo
     sul tronco interno, punte 07–10/17–20.
     Totale interno: 2 tph 05–06 e 22–24; 4 tph nel resto; 6 tph in punta.
     Oltre IBC114: sempre 2 tph. Nessun diretto da IBC01, cambio a IBC41.
     Finestre riferite alla partenza dal capolinea di ciascun servizio;
     alle altre stazioni si spostano con il tempo di percorrenza.
     Coincidenze dove il feeder opera; primi/ultimi treni e rinforzi
     indipendenti non hanno una coincidenza garantita.

   Odanuri Shinai-Line IBC34 ↔ IBC104: passanti IBC1X 2 tph;
     IBC4 completa 6 tph in punta e 4 tph fuori punta. Invariati.
   Enikezya Line: IBC5/IBC5_NB thru M8 ogni 21 min, invariati.
   Profilo comune: 140 km/h, accel 3.3, decel 4.0 km/h/s; soste 30 s.
   Ordine fisico: IBC30 precede IBC29.
   Finestre degli express conservate: inversioni e rotazioni da calibrare.
   La costruzione del cambio nel Journey Planner richiede verifica completa.
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
  'IBC28','IBC30','IBC33','IBC34','IBC37','IBC41',
];
const _IBC_RAPID_NB = [..._IBC_RAPID_SB].reverse();

const _IBC_LEX_SB = ['IBC01','IBC03','IBC11','IBC23','IBC33','IBC41','IBC50','IBC55'];
const _IBC_LEX_NB = [..._IBC_LEX_SB].reverse();

/* thru M8: IBC04 → IBC23 (tutte) → Enikezya Line. IBC03 saltata (= M818). */
const _IBC_ENI_SB = [
  'IBC04','IBC05','IBC06','IBC07','IBC08','IBC09','IBC10','IBC11','IBC12','IBC13',
  'IBC14','IBC15','IBC16','IBC17','IBC18','IBC19','IBC20','IBC21','IBC22','IBC23',
  'IBC105','IBC106','IBC107',
];
const _IBC_ENI_NB = [..._IBC_ENI_SB].reverse();

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
const _IBC_HAS_ENI    = IBC_LINES.IBC.stations.some((s) => s.code === 'IBC107');

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
    desc:     'Rapid — Anagusa Mukai (Ibaches) → Daihanjishi',
    fromCode: 'IBC01',
    toCode:   'IBC41',
    firstDep: '09:45',
    lastDep:  '17:25',
    headway:  20,
    stops:    _IBC_RAPID_SB,
    ..._IBC_PROFILE,
  },
  {
    id:       'IBC2_NB',
    desc:     'Rapid NB — Daihanjishi → Anagusa Mukai (Ibaches)',
    fromCode: 'IBC41',
    toCode:   'IBC01',
    firstDep: '09:02',
    lastDep:  '16:42',
    headway:  20,
    stops:    _IBC_RAPID_NB,
    ..._IBC_PROFILE,
  },
  {
    id:       'IBC3',
    desc:     'Limited Express — Anagusa Mukai (Ibaches) → Īmate (direct)',
    fromCode: 'IBC01',
    toCode:   'IBC55',
    firstDep: '07:09',
    lastDep:  '21:09',
    headway:  60,
    stops:    _IBC_LEX_SB,
    ..._IBC_PROFILE,
  },
  {
    id:       'IBC3_NB',
    desc:     'Limited Express NB — Īmate → Anagusa Mukai (Ibaches) (direct)',
    fromCode: 'IBC55',
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

/* Enikezya Line: thru service dei Local M8 (1 su 3, ogni 21 min).
   SB: IBC04 ai minuti :00 (+21k), 06:00 → 23:51 (M818 arriva ~2 min prima).
   NB: da IBC107 05:04 → 23:16 (IBC04 ~35 min dopo, poi M818 → M801). */
if (_IBC_HAS_ENI) {
  IBC_TT_SERVICES.push(
    _ibcSvc('IBC5',    'Local thru M8 — Jufurai (M818) → Ibaches Enikezya', 'IBC04', 'IBC107', '06:00', '23:51', 21, _IBC_ENI_SB),
    _ibcSvc('IBC5_NB', 'Local thru M8 NB — Ibaches Enikezya → Jufurai (M818)', 'IBC107', 'IBC04', '05:04', '23:16', 21, _IBC_ENI_NB)
  );
}

/* Explicit paths keep the new Main Line extension out of Odanuri trains. */
const _IBC_DAIHANJISHI_SB = [..._IBC_STOPS_SB, 'IBC35','IBC36','IBC37','IBC38','IBC39','IBC40','IBC41'];
const _IBC_ODANURI_SB = _IBC_HAS_BRANCH ? [..._IBC_STOPS_SB,'IBC101','IBC102','IBC103','IBC104'] : _IBC_STOPS_SB;
const _IBC_ODANURI_BRANCH_SB = ['IBC34','IBC101','IBC102','IBC103','IBC104'];
for (const svc of IBC_TT_SERVICES) {
  if (svc.id === 'IBC1' || svc.id === 'IBC1_NB') {
    const nb = svc.id === 'IBC1_NB';
    svc.fromCode = nb ? 'IBC41' : 'IBC01';
    svc.toCode = nb ? 'IBC01' : 'IBC41';
    svc.desc = nb ? 'Local NB — Daihanjishi → Anagusa Mukai (Ibaches)' : 'Local — Anagusa Mukai (Ibaches) → Daihanjishi';
    svc.stops = nb ? [..._IBC_DAIHANJISHI_SB].reverse() : _IBC_DAIHANJISHI_SB;
  } else if (svc.id === 'IBC1X' || svc.id === 'IBC1X_NB') {
    svc.stops = svc.id.endsWith('_NB') ? [..._IBC_ODANURI_SB].reverse() : _IBC_ODANURI_SB;
  } else if (svc.id.startsWith('IBC4_')) {
    svc.stops = svc.id.endsWith('_NB') ? [..._IBC_ODANURI_BRANCH_SB].reverse() : _IBC_ODANURI_BRANCH_SB;
  }
}

/* IBC6: separate all-stop shuttle. No thru flag: passengers change at IBC41.
   Five minutes MINIMUM; round departures up to a whole minute.
   The duration calculation mirrors the current SuburbanRouter profile.
   Base SB connects with IBC1. Peak SB reinforcement connects with IBC3.
   NB base connects into IBC1_NB; NB peak reinforcement is provisional.
   Complete hours: 2 Local tph off-peak, 3 tph 07:00–10:00 / 17:00–20:00.
   First/last partial operating hours are not padded with unconnected runs. */
const _IBC_SHUTTLE_SB = Array.from({length:15}, (_,i) => 'IBC' + (41+i));
function _ibcPathDurationSec(stops, svc) {
  const stations = IBC_LINES.IBC.stations;
  const byCode = new Map(stations.map((s,i) => [s.code,{s,i}]));
  let run = 0, dwell = 0;
  for (let n=1;n<stops.length;n++) {
    const from = byCode.get(stops[n-1]), to = byCode.get(stops[n]);
    if (!from || !to) throw new Error('IBC connection: missing station');
    const len = Math.abs(to.s.km-from.s.km)*1000;
    let cap = svc.vMaxKmh;
    for (let k=Math.min(from.i,to.i);k<Math.max(from.i,to.i);k++)
      cap = Math.min(cap,stations[k].vLimitKmh ?? cap);
    const a = (svc.accelKmhPerSec ?? 2.5)/3.6;
    const b = (svc.decelKmhPerSec ?? 3.0)/3.6;
    const v = Math.min(cap/3.6,Math.sqrt(2*len*a*b/(a+b)));
    if (len>0) run += v/a+v/b+Math.max(0,len-v*v/(2*a)-v*v/(2*b))/v;
    if (n<stops.length-1) dwell += to.s.dwellSec ?? svc.dwellSec ?? 20;
  }
  return Math.round(run)+dwell;
}
const _ibcServiceHM = minutes => String(Math.floor(minutes/60)).padStart(2,'0') + ':' + String(minutes%60).padStart(2,'0');
const _ibcLocalFeed = IBC_TT_SERVICES.find(s => s.id === 'IBC1');
const _ibcLocalReturn = IBC_TT_SERVICES.find(s => s.id === 'IBC1_NB');
const _ibcLexFeed = IBC_TT_SERVICES.find(s => s.id === 'IBC3');
const _ibcLocalOffset = Math.ceil(_ibcPathDurationSec(_IBC_DAIHANJISHI_SB,_ibcLocalFeed)/60)+5;
const _ibcShuttleOffset = Math.ceil(_ibcPathDurationSec(_IBC_SHUTTLE_SB,_IBC_PROFILE)/60)+5;
const _ibcLexTo41 = _IBC_LEX_SB.slice(0,_IBC_LEX_SB.indexOf('IBC41')+1);
const _ibcPeakPhase = (_ibcMin(_ibcLexFeed.firstDep)+Math.ceil(_ibcPathDurationSec(_ibcLexTo41,_ibcLexFeed)/60)+5)%60;
const _ibcNbPhase = ((_ibcMin(_ibcLocalReturn.firstDep)-_ibcShuttleOffset+15)%60+60)%60;
function _ibcPeakWindows(phase, first, last) {
  const windows = [];
  for (const [start,end] of [[7*60,10*60],[17*60,20*60]]) {
    const lower = Math.max(start,first), upper = Math.min(end-1,last);
    const f = lower+((phase-lower%60+60)%60);
    if (f<=upper) windows.push({from:_ibcServiceHM(f),to:_ibcServiceHM(f+Math.floor((upper-f)/60)*60)});
  }
  return windows;
}
const _ibcShuttleFirst = _ibcMin(_ibcLocalFeed.firstDep)+_ibcLocalOffset;
const _ibcShuttleLast = _ibcMin(_ibcLocalFeed.lastDep)+_ibcLocalOffset;
const _ibcShuttleNbFirst = _ibcMin(_ibcLocalReturn.firstDep)-_ibcShuttleOffset;
const _ibcShuttleNbLast = _ibcMin(_ibcLocalReturn.lastDep)-_ibcShuttleOffset;
IBC_TT_SERVICES.push(
  _ibcSvc('IBC6','Local — Daihanjishi → Īmate (change at IBC41)','IBC41','IBC55',
    _ibcServiceHM(_ibcShuttleFirst),_ibcServiceHM(_ibcShuttleLast),30,[]),
  _ibcSvc('IBC6_NB','Local NB — Īmate → Daihanjishi (change at IBC41)','IBC55','IBC41',
    _ibcServiceHM(_ibcShuttleNbFirst),_ibcServiceHM(_ibcShuttleNbLast),30,[])
);
const _ibcLexFirstAt41 = _ibcMin(_ibcLexFeed.firstDep)+Math.ceil(_ibcPathDurationSec(_ibcLexTo41,_ibcLexFeed)/60)+5;
const _ibcLexLastAt41 = _ibcMin(_ibcLexFeed.lastDep)+Math.ceil(_ibcPathDurationSec(_ibcLexTo41,_ibcLexFeed)/60)+5;
const _ibcPeakSb = _ibcPeakWindows(_ibcPeakPhase,Math.max(_ibcShuttleFirst,_ibcLexFirstAt41),Math.min(_ibcShuttleLast,_ibcLexLastAt41));
const _ibcPeakNb = _ibcPeakWindows(_ibcNbPhase,_ibcShuttleNbFirst,_ibcShuttleNbLast);
if (_ibcPeakSb.length) IBC_TT_SERVICES.push({
  ..._ibcSvc('IBC6P','Local peak reinforcement — Daihanjishi → Īmate','IBC41','IBC55',_ibcPeakSb[0].from,_ibcPeakSb.at(-1).to,60,[]),
  peakWindows:_ibcPeakSb,
});
if (_ibcPeakNb.length) IBC_TT_SERVICES.push({
  ..._ibcSvc('IBC6P_NB','Local NB peak reinforcement — Īmate → Daihanjishi','IBC55','IBC41',_ibcPeakNb[0].from,_ibcPeakNb.at(-1).to,60,[]),
  peakWindows:_ibcPeakNb,
});

/* IBC7 / IBCM: explicit branch-only paths; no direct service from IBC01.
   Long Local: every 30 min 05:00–24:00. Short Local: every 30 min
   06:00–22:00, offset by 15 min from the long service.
   Together: 4 tph on IBC41–IBC114, 2 tph beyond IBC114.
   Two extra short trains/hour in peaks 07:00–10:00 / 17:00–20:00.
   Departure windows refer to each service's origin. At downstream stops
   the service period is shifted by running time. Early/late connections
   only exist when the main-line feeder is operating; no guaranteed hold.
   SB base follows the IBC1 arrival phase (+5 min minimum). One peak
   train follows IBC3; the other is an independent local reinforcement.
   NB phases aim for IBC1_NB connections at IBC41; late trains may arrive
   after the last main-line departure. Rolling-stock turns not assigned. */
const _ibcMaedaki = IBC_LINES.IBC.branches?.find(b => b.id === 'IBCM');
if (_ibcMaedaki) {
  const fullSB = ['IBC41',..._ibcMaedaki.stations];
  const cut = fullSB.indexOf('IBC114');
  if (cut < 1 || fullSB.at(-1) !== 'IBC121') throw new Error('IBCM: invalid branch path');
  const shortSB = fullSB.slice(0,cut+1);
  const fullNB = [...fullSB].reverse(), shortNB = [...shortSB].reverse();
  const mod60 = value => ((value%60)+60)%60;
  const sbPhase = mod60(_ibcMin(_ibcLocalFeed.firstDep)+_ibcLocalOffset);
  const shortPhase = mod60(sbPhase+15);
  const longNbPhase = mod60(_ibcMin(_ibcLocalReturn.firstDep)-5-Math.ceil(_ibcPathDurationSec(fullNB,_IBC_PROFILE)/60));
  const shortNbPhase = mod60(_ibcMin(_ibcLocalReturn.firstDep)+30-5-Math.ceil(_ibcPathDurationSec(shortNB,_IBC_PROFILE)/60));
  const at = (hour,phase) => _ibcServiceHM(hour*60+phase);
  IBC_TT_SERVICES.push(
    _ibcSvc('IBC7','Local — Daihanjishi → Maeðaki','IBC41','IBC121',at(5,sbPhase),at(23,sbPhase),30,fullSB),
    _ibcSvc('IBC7_NB','Local NB — Maeðaki → Daihanjishi','IBC121','IBC41',at(5,longNbPhase),at(23,longNbPhase),30,fullNB),
    _ibcSvc('IBC7S','Local short — Daihanjishi → Ninokawa','IBC41','IBC114',at(6,shortPhase),at(21,shortPhase),30,shortSB),
    _ibcSvc('IBC7S_NB','Local short NB — Ninokawa → Daihanjishi','IBC114','IBC41',at(6,shortNbPhase),at(21,shortNbPhase),30,shortNB)
  );
  function peak(id,desc,phase,stops) {
    const windows = _ibcPeakWindows(phase,5*60,24*60-1)
      .map(w => ({from:w.from,to:_ibcServiceHM(Math.min(_ibcMin(w.to),(_ibcMin(w.from)<10*60?10:20)*60-1))}))
      .filter(w => _ibcMin(w.from)<=_ibcMin(w.to));
    if (!windows.length) return;
    IBC_TT_SERVICES.push({
      ..._ibcSvc(id,desc,stops[0],stops.at(-1),windows[0].from,windows.at(-1).to,60,stops),
      peakWindows:windows,
    });
  }
  peak('IBC7P1','Local peak short — Daihanjishi → Ninokawa',mod60(sbPhase-15),shortSB);
  peak('IBC7P2','Local peak short — Daihanjishi → Ninokawa',_ibcPeakPhase,shortSB);
  const shortRunMin = Math.ceil(_ibcPathDurationSec(shortNB,_IBC_PROFILE)/60);
  peak('IBC7P1_NB','Local peak short NB — Ninokawa → Daihanjishi',mod60(_ibcMin(_ibcLocalReturn.firstDep)+10-shortRunMin),shortNB);
  peak('IBC7P2_NB','Local peak short NB — Ninokawa → Daihanjishi',mod60(_ibcMin(_ibcLocalReturn.firstDep)+40-shortRunMin),shortNB);
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

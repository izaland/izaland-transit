/* ================================================================
   M17-TT.JS — Metro Line 17 · Timetable Profile
   ================================================================
   Dipende da: m17-data.js (M17_META, M17_ST, M17_SVC, M17_INTERCHANGE,
                            M17_CANONICAL_A)

   Griglia: 20 treni/h per direzione sulla tratta comune (1 treno ogni
   3 min), ancorata a M1723 (unica stazione dove fermano S1–S4).

   S1  M1701 → M1736   all-stop                     9 treni/h
   S2  M1701 → M1736   semi-rapido                   3 treni/h
                        (4 treni/h nelle punte: sostituisce S4)
   S3  M1720-1 → M1737 tratta comune dal mini-ramo   7 treni/h
   S4  M1701 ↔ M1737   Airport Rapid, 1 treno/h, NON in punta
                        da M1701 al :30, da M1737 al :00
   S5  M1701 ↔ M1717   rinforzo ramo A, all-stop      7 treni/h
                        (capolinea M1717 con inversione/ricovero)

   Punte: 07:00–09:00 e 18:00–20:00.

   Modello tempi (kinematico): vmax 120 km/h, acc/dec 1.0 m/s²,
   sosta 25 s (60 s a M1736). Il router usa km/speedKmh + fermate
   intermedie × dwell, quindi speedKmh di ogni servizio e' calibrata
   per riprodurre i tempi kinematici:
     S1 58:14 · S2 42:45 · S3 30:18 · S4 42:15 · S5 26:01

   LIMITI NOTI DEL ROUTER (non modificato):
     - headway/offset sono uguali a ogni stazione di salita: gli
       offsetMin sono i minuti di partenza dal CAPOLINEA di origine.
     - un solo offset per servizio: per avere N treni/h non regolari
       ogni minuto di partenza e' un sotto-servizio (headway 60 min).
     - S1/S2/S3/S5 usano gli stessi minuti in entrambe le direzioni.

   TODO: orari primo/ultimo treno reali (qui 05:00–24:00), thru service
   S1/S2 da M1736 verso linea IR, orari della direzione inversa.
================================================================ */
'use strict';

const M17_COLOR = M17_META.color;

const _m17Hw = (slots) => slots.map(([f, t]) => ({ from: f, to: t, headwayMin: 60 }));
const M17_HW_ALL     = _m17Hw([['05:00', '24:00']]);
const M17_HW_OFFPEAK = _m17Hw([['05:00', '07:00'], ['09:00', '18:00'], ['20:00', '24:00']]);
const M17_HW_PEAK    = _m17Hw([['07:00', '09:00'], ['18:00', '20:00']]);

/* Minuti di partenza (dal capolinea di origine) */
const M17_DEP = {
  S1:      [4, 10, 19, 25, 34, 40, 46, 52, 58],
  S2:      [22, 40, 58],
  S2_PEAK: [31],
  S3:      [7, 13, 25, 31, 37, 46, 58],
  S4_OUT:  30,
  S4_IN:   0,
  S5:      [1, 7, 14, 37, 43, 49, 55],
};

/* Un sotto-servizio per ogni minuto di partenza */
const _fan = (proto, minutes) => minutes.map(m => ({ ...proto, offsetMin: m }));

const M17_SERVICES = [
  ..._fan({
    id: 'M17', svcLogical: 'S1', name: 'All-stop (M1701↔M1736)', branch: 'A+common',
    color: M17_COLOR, cls: 'svc-S1', rapid: false, speedKmh: 66.1,
    headway: M17_HW_ALL, stops: M17_SVC.S1.stops,
  }, M17_DEP.S1),

  ..._fan({
    id: 'M17', svcLogical: 'S2', name: 'Semi-rapid (M1701↔M1736)', branch: 'A+common',
    color: M17_COLOR, cls: 'svc-S2', rapid: true, speedKmh: 82.7,
    headway: M17_HW_ALL, stops: M17_SVC.S2.stops,
  }, M17_DEP.S2),

  ..._fan({
    id: 'M17', svcLogical: 'S2', name: 'Semi-rapid (M1701↔M1736) — punta', branch: 'A+common',
    color: M17_COLOR, cls: 'svc-S2', rapid: true, speedKmh: 82.7,
    headway: M17_HW_PEAK, stops: M17_SVC.S2.stops,
  }, M17_DEP.S2_PEAK),

  ..._fan({
    id: 'M17', svcLogical: 'S3', name: 'Kingaus Sangu Shikimun ↔ Airport', branch: 'B+common',
    color: M17_COLOR, cls: 'svc-S3', rapid: false, speedKmh: 63.2,
    headway: M17_HW_ALL, stops: M17_SVC.S3.stops,
  }, M17_DEP.S3),

  /* S4 Airport Rapid: direzioni separate per avere offset diversi */
  {
    id: 'M17', svcLogical: 'S4', name: 'Airport Rapid (→ Airport)', branch: 'A+common',
    color: M17_COLOR, cls: 'svc-S4', rapid: true, speedKmh: 84.5,
    headwayOutbound: M17_HW_OFFPEAK, offsetMin: M17_DEP.S4_OUT,
    stops: M17_SVC.S4.stops,
  },
  {
    id: 'M17', svcLogical: 'S4', name: 'Airport Rapid (→ M1701)', branch: 'A+common',
    color: M17_COLOR, cls: 'svc-S4', rapid: true, speedKmh: 84.5,
    headwayInbound: M17_HW_OFFPEAK, offsetMin: M17_DEP.S4_IN,
    stops: M17_SVC.S4.stops,
  },

  ..._fan({
    id: 'M17', svcLogical: 'S5', name: 'Reinforcement (M1701↔M1717)', branch: 'A',
    color: M17_COLOR, cls: 'svc-S5', rapid: false, speedKmh: 63.9,
    headway: M17_HW_ALL, stops: M17_CANONICAL_A.slice(0, M17_CANONICAL_A.indexOf('M1717') + 1),
  }, M17_DEP.S5),
];

/* ----------------------------------------------------------------
   Registrazione nel MetroRouter.
   - dwellSec 25 s e avgSpeedKmh di fallback sovrascritti qui.
   - M1720-1: il router calcola le distanze come |km_a - km_b|, quindi
     per il router il km e' quello lungo la linea (M1720 − 0.83 = 25.08),
     non la distanza dal bivio usata in m17-data.js.
---------------------------------------------------------------- */
const M17_META_ROUTER = { ...M17_META, dwellSec: 25, avgSpeedKmh: 66.1 };
const M17_ST_ROUTER = {
  ...M17_ST,
  'M1720-1': { ...M17_ST['M1720-1'], km: +(M17_ST.M1720.km - M17_ST['M1720-1'].kmFromM1720).toFixed(2) },
};

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M17',
    meta:        M17_META_ROUTER,
    st:          M17_ST_ROUTER,
    services:    M17_SERVICES,
    interchange: M17_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M17_SERVICES, M17_DEP, M17_HW_ALL, M17_HW_OFFPEAK, M17_HW_PEAK,
                     M17_META_ROUTER, M17_ST_ROUTER };
}

/* ================================================================
   M17-TT.JS — Metro Line 17 · Timetable Profile
   ================================================================
   Dipende da: m17-data.js (M17_META, M17_ST, M17_SVC, M17_INTERCHANGE,
                            M17_CANONICAL_A, M17_CANONICAL_COMMON)

   Griglia: 20 treni/h per direzione sulla tratta comune (1 treno ogni
   3 min), ancorata a M1723 (unica stazione dove fermano S1–S4).

   S1  M1701 ↔ M1736   all-stop                     9 treni/h
   S2  M1701 ↔ M1736   semi-rapido                   3 treni/h
                        (4 treni/h nelle punte: sostituisce S4)
   S3  M1720-1 ↔ M1737 tratta comune dal mini-ramo   7 treni/h
   S4  M1701 ↔ M1737   Airport Rapid, 1 treno/h, NON in punta
                        da M1701 al :30, da M1737 al :00
   S5  M1701 ↔ M1717   rinforzo ramo A, all-stop      7 treni/h
                        (capolinea M1717 con inversione/ricovero)

   Orario di servizio: prime partenze dai capolinea ~04:50; tutti gli
   arrivi ai capolinea entro le 01:00.
     - corse a lunga percorrenza (S1–S5): partenze fino alle ~23:50
     - ultime corse 00:00–00:25 LIMITATE, senza il ponte M1719–M1720:
         S6  M1701 ↔ M1719  all-stop, ogni 10 min
         S7  M1720 ↔ M1737  all-stop, ogni 10 min
   Punte: 07:00–09:00 e 18:00–20:00.

   Thru service M1736 → linea IR: SOSPESO (non modellato).
   M1701 ha tre binari: i conflitti S1/S2 in partenza sono accettati.

   Modello tempi: base kinematica (vmax 120 km/h, acc/dec 1.0 m/s²,
   sosta 25 s, 60 s a M1736) moltiplicata per M17_TIME_FACTOR (1.2:
   i tempi del modello puro risultavano troppo veloci).
   Il router usa km/speedKmh + fermate intermedie × dwell: la
   speedKmh di ogni servizio e' derivata in modo che il tempo totale
   sia base × fattore. Per cambiare tutti i tempi basta modificare
   M17_TIME_FACTOR.
   Tempi totali con fattore 1.2:
     S1 69:23 · S2 50:48 · S3 35:52 · S4 50:12 · S5 30:43
     S6 34:32 · S7 34:12

   LIMITI NOTI DEL ROUTER (non modificato):
     - headway/offset sono uguali a ogni stazione di salita: gli
       offsetMin sono i minuti di partenza dal CAPOLINEA di origine.
     - un solo offset per servizio: per avere N treni/h non regolari
       ogni minuto di partenza e' un sotto-servizio (headway 60 min);
       le due direzioni sono sotto-servizi separati.
     - la finestra oraria e' valutata sull'ora della richiesta, non
       su quella di partenza effettiva: dopo le 24:00 valgono solo
       S6/S7.
   NB: i minuti di partenza (M17_DEP) sono ancorati ai tempi base
   (fattore 1.0) a M1723; con fattore diverso la griglia da 3 min a
   M1723 non e' piu' perfetta (le partenze dai capolinea restano).
================================================================ */
'use strict';

const M17_COLOR = M17_META.color;

const M17_DWELL       = 25;
const M17_TIME_FACTOR = 1.2;

/* Tempi base (s, kinematici) e geometria per servizio */
const M17_BASE = {
  S1: { km: 48.56, between: 34, sec: 3469 },
  S2: { km: 48.56, between: 18, sec: 2540 },
  S3: { km: 24.47, between: 17, sec: 1793 },
  S4: { km: 49.55, between: 17, sec: 2510 },
  S5: { km: 21.06, between: 15, sec: 1536 },
  S6: { km: 23.55, between: 17, sec: 1727 },
  S7: { km: 23.64, between: 16, sec: 1710 },
};
const M17_SPD = Object.fromEntries(Object.entries(M17_BASE).map(([k, b]) =>
  [k, +(b.km * 3600 / (b.sec * M17_TIME_FACTOR - b.between * M17_DWELL)).toFixed(1)]));

const _m17Hw = (slots, min = 60) => slots.map(([f, t]) => ({ from: f, to: t, headwayMin: min }));
const M17_HW_ALL     = _m17Hw([['04:50', '23:50']]);
const M17_HW_OFFPEAK = _m17Hw([['04:50', '07:00'], ['09:00', '18:00'], ['20:00', '23:50']]);
const M17_HW_PEAK    = _m17Hw([['07:00', '09:00'], ['18:00', '20:00']]);
const M17_HW_LATE    = _m17Hw([['00:00', '00:26']], 10);

/* Minuti di partenza dal capolinea di origine.
   out = verso M1736/M1737/M1717 (stop[0] → stop[n]); in = verso M1701/M1720-1. */
const M17_DEP = {
  S1:      { out: [3, 9, 18, 24, 33, 39, 45, 51, 57], in: [5, 11, 17, 23, 29, 35, 41, 50, 56] },
  S2:      { out: [22, 40, 58],                       in: [8, 26, 50] },
  S2_PEAK: { out: [31],                               in: [59] },
  S3:      { out: [6, 12, 24, 30, 36, 45, 57],        in: [6, 12, 24, 30, 36, 45, 57] },
  S4:      { out: [30],                               in: [0] },
  S5:      { out: [6, 13, 15, 27, 36, 48, 54],        in: [4, 10, 16, 25, 34, 40, 46] },
};

/* Un sotto-servizio per ogni minuto e per ogni direzione */
const _fan = (proto, dep, hw) => [
  ...dep.out.map(m => ({ ...proto, headwayOutbound: hw, offsetMin: m })),
  ...dep.in.map(m  => ({ ...proto, headwayInbound:  hw, offsetMin: m })),
];

const M17_STOPS_S5 = M17_CANONICAL_A.slice(0, M17_CANONICAL_A.indexOf('M1717') + 1);

const M17_SERVICES = [
  ..._fan({
    id: 'M17', svcLogical: 'S1', name: 'All-stop (M1701↔M1736)', branch: 'A+common',
    color: M17_COLOR, cls: 'svc-S1', rapid: false, speedKmh: M17_SPD.S1,
    stops: M17_SVC.S1.stops,
  }, M17_DEP.S1, M17_HW_ALL),

  ..._fan({
    id: 'M17', svcLogical: 'S2', name: 'Semi-rapid (M1701↔M1736)', branch: 'A+common',
    color: M17_COLOR, cls: 'svc-S2', rapid: true, speedKmh: M17_SPD.S2,
    stops: M17_SVC.S2.stops,
  }, M17_DEP.S2, M17_HW_ALL),

  ..._fan({
    id: 'M17', svcLogical: 'S2', name: 'Semi-rapid (M1701↔M1736) — punta', branch: 'A+common',
    color: M17_COLOR, cls: 'svc-S2', rapid: true, speedKmh: M17_SPD.S2,
    stops: M17_SVC.S2.stops,
  }, M17_DEP.S2_PEAK, M17_HW_PEAK),

  ..._fan({
    id: 'M17', svcLogical: 'S3', name: 'Kingaus Sangu Shikimun ↔ Airport', branch: 'B+common',
    color: M17_COLOR, cls: 'svc-S3', rapid: false, speedKmh: M17_SPD.S3,
    stops: M17_SVC.S3.stops,
  }, M17_DEP.S3, M17_HW_ALL),

  ..._fan({
    id: 'M17', svcLogical: 'S4', name: 'Airport Rapid', branch: 'A+common',
    color: M17_COLOR, cls: 'svc-S4', rapid: true, speedKmh: M17_SPD.S4,
    stops: M17_SVC.S4.stops,
  }, M17_DEP.S4, M17_HW_OFFPEAK),

  ..._fan({
    id: 'M17', svcLogical: 'S5', name: 'Reinforcement (M1701↔M1717)', branch: 'A',
    color: M17_COLOR, cls: 'svc-S5', rapid: false, speedKmh: M17_SPD.S5,
    stops: M17_STOPS_S5,
  }, M17_DEP.S5, M17_HW_ALL),

  /* Ultime corse: niente ponte M1719–M1720 */
  {
    id: 'M17', svcLogical: 'S6', name: 'Late (M1701↔M1719)', branch: 'A',
    color: M17_COLOR, cls: 'svc-S6', rapid: false, speedKmh: M17_SPD.S6,
    headway: M17_HW_LATE, offsetMin: 0, stops: M17_CANONICAL_A,
  },
  {
    id: 'M17', svcLogical: 'S7', name: 'Late (M1720↔M1737)', branch: 'common',
    color: M17_COLOR, cls: 'svc-S7', rapid: false, speedKmh: M17_SPD.S7,
    headway: M17_HW_LATE, offsetMin: 0, stops: M17_CANONICAL_COMMON,
  },
];

/* ----------------------------------------------------------------
   Registrazione nel MetroRouter.
   - dwellSec e avgSpeedKmh di fallback sovrascritti qui.
   - M1720-1: il router calcola le distanze come |km_a - km_b|, quindi
     per il router il km e' quello lungo la linea (M1720 − 0.83 = 25.08),
     non la distanza dal bivio usata in m17-data.js.
---------------------------------------------------------------- */
const M17_META_ROUTER = { ...M17_META, dwellSec: M17_DWELL, avgSpeedKmh: M17_SPD.S1 };
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
  module.exports = { M17_SERVICES, M17_DEP, M17_SPD, M17_TIME_FACTOR, M17_HW_ALL, M17_HW_OFFPEAK,
                     M17_HW_PEAK, M17_HW_LATE, M17_META_ROUTER, M17_ST_ROUTER };
}

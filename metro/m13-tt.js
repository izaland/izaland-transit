/* ================================================================
   M13-TT.JS — Metro Line 13 + Kashimochi Railway · Timetable Profile
   ================================================================
   Dipende da: m13-data.js (M13_META, M13_ST, M13_KSM_ST, M13_SVC,
                            M13_INTERCHANGE, M13_HEADWAY, M13_CANONICAL_THRU)

   S1  Local / 一般   M1301 ↔ KSM05  all-stop, thru       6 TPH sempre
   S2  Local / 一般   M1305 ↔ M1324  NO thru              4 TPH morbida / 6 punta
   S3  Rapid / 快速   M1301 ↔ KSM05  rapido, thru         2 TPH morbida / 3 punta
   S4  Local / 一般   M1314 ↔ KSM05  thru, SOLO PUNTA      5 TPH

   Orario: primo treno 04:45, ultimo 23:55 dai capolinea (S1).
   Punte : 07:45–09:30 e 17:45–21:00.

   Griglia minuti (partenze dai capolinea; out = verso KSM05/M1324,
   in = verso M1301/M1305/M1314):
     S1  out/in  :05 :15 :25 :35 :45 :55         (primo 04:45, ultimo 23:55)
     S2  morbida out :00 :15 :30 :45   in :07 :22 :37 :52
         punta   out :00 :10 ... :50   in :03 :13 ... :53
     S3  morbida out/in :20 :50
         punta   out/in :00 :20 :40
     S4  punta   out :08 :20 :32 :44 :56  (M1314)
                 in  :02 :14 :26 :38 :50  (KSM05)
   I minuti sono scelti per evitare partenze simultanee nello stesso
   capolinea (M1301: S1/S3; KSM05: S1/S3/S4).

   Il Showanul thru: sosta 60 s a M1324 (cambio operatore) per i servizi
   thru, come M1736 in M17.

   Modello tempi (come M17): base kinematica (vmax 120 km/h, acc/dec
   1.0 m/s², sosta 25 s, 60 s a M1324 per i thru) × M13_TIME_FACTOR
   (1.2, stesso fattore di M17). Il router usa km/speedKmh + fermate
   intermedie × dwell: la speedKmh di ogni servizio e' derivata in modo
   che il tempo totale sia base × fattore.
   Tempi totali con fattore 1.2:
     S1 54:13 · S2 35:05 · S3 41:25 · S4 27:52
   L'ultimo S1 (23:55) arriva a destinazione intorno alle 00:50.

   LIMITI NOTI DEL ROUTER (non modificato):
     - headway/offset sono uguali a ogni stazione di salita: gli
       offsetMin sono i minuti di partenza dal CAPOLINEA di origine.
     - un solo offset per servizio: ogni minuto di partenza e' un
       sotto-servizio (headway 60 min); le due direzioni sono
       sotto-servizi separati.
     - la finestra oraria e' valutata sull'ora della richiesta, non
       su quella di partenza effettiva.
     - M1324 e KSM01 sono la stessa stazione: KSM01 non e' nel
       percorso (nel router le KSM partono da KSM02).
================================================================ */
'use strict';

const M13_COLOR     = M13_META.color;
const M13_COLOR_KSM = M13_META.colorKSM;

const M13_DWELL       = 25;
const M13_TIME_FACTOR = 1.2;

/* Tempi base (s, kinematici, sosta inclusa) e geometria per servizio */
const M13_BASE = {
  S1: { km: 37.58, between: 26, sec: 2711 },
  S2: { km: 22.40, between: 18, sec: 1754 },
  S3: { km: 37.58, between: 15, sec: 2071 },
  S4: { km: 18.91, between: 13, sec: 1394 },
};
const M13_SPD = Object.fromEntries(Object.entries(M13_BASE).map(([k, b]) =>
  [k, +(b.km * 3600 / (b.sec * M13_TIME_FACTOR - b.between * M13_DWELL)).toFixed(1)]));

const _m13Hw = (slots, min = 60) => slots.map(([f, t]) => ({ from: f, to: t, headwayMin: min }));
const M13_HW_ALL     = _m13Hw([['04:45', '23:56']]);
const M13_HW_OFFPEAK = _m13Hw([['04:45', '07:45'], ['09:30', '17:45'], ['21:00', '23:56']]);
const M13_HW_PEAK    = _m13Hw(M13_HEADWAY.peakWindows.map(([f, t]) => [f, t]));

/* Minuti di partenza dal capolinea di origine. */
const M13_DEP = {
  S1:       { out: [5, 15, 25, 35, 45, 55], in: [5, 15, 25, 35, 45, 55] },
  S2:       { out: [0, 15, 30, 45],         in: [7, 22, 37, 52] },
  S2_PEAK:  { out: [0, 10, 20, 30, 40, 50], in: [3, 13, 23, 33, 43, 53] },
  S3:       { out: [20, 50],                in: [20, 50] },
  S3_PEAK:  { out: [0, 20, 40],             in: [0, 20, 40] },
  S4:       { out: [8, 20, 32, 44, 56],     in: [2, 14, 26, 38, 50] },
};

/* Un sotto-servizio per ogni minuto e per ogni direzione */
const _fan13 = (proto, dep, hw) => [
  ...dep.out.map(m => ({ ...proto, headwayOutbound: hw, offsetMin: m })),
  ...dep.in.map(m  => ({ ...proto, headwayInbound:  hw, offsetMin: m })),
];

const _mk13 = (logical, name, rapid) => ({
  id: 'M13', svcLogical: logical, name, branch: 'M13+KSM',
  color: M13_COLOR, colorKSM: M13_COLOR_KSM, cls: 'svc-' + logical,
  rapid, speedKmh: M13_SPD[logical], stops: M13_SVC[logical].stops,
  thruAt: M13_SVC[logical].thruAt,
});

const M13_SERVICES = [
  ..._fan13(_mk13('S1', 'Local 一般 (M1301↔KSM05)', false), M13_DEP.S1, M13_HW_ALL),

  ..._fan13({ ..._mk13('S2', 'Local 一般 (M1305↔M1324)', false), branch: 'M13' },
            M13_DEP.S2, M13_HW_OFFPEAK),
  ..._fan13({ ..._mk13('S2', 'Local 一般 (M1305↔M1324) — punta', false), branch: 'M13' },
            M13_DEP.S2_PEAK, M13_HW_PEAK),

  ..._fan13(_mk13('S3', 'Rapid 快速 (M1301↔KSM05)', true), M13_DEP.S3, M13_HW_OFFPEAK),
  ..._fan13(_mk13('S3', 'Rapid 快速 (M1301↔KSM05) — punta', true), M13_DEP.S3_PEAK, M13_HW_PEAK),

  ..._fan13(_mk13('S4', 'Local 一般 (M1314↔KSM05) — punta', false), M13_DEP.S4, M13_HW_PEAK),
];

/* ----------------------------------------------------------------
   Registrazione nel MetroRouter.
   KSM01 coincide con M1324 (stesso nodeId): nel router le stazioni
   KSM partono da KSM02, i km sono progressivi da M1301.
---------------------------------------------------------------- */
const M13_META_ROUTER = { ...M13_META, dwellSec: M13_DWELL, avgSpeedKmh: M13_SPD.S1 };
const M13_ST_ROUTER = (() => {
  const st = { ...M13_ST };
  Object.entries(M13_KSM_ST).forEach(([c, s]) => { if (c !== 'KSM01') st[c] = s; });
  return st;
})();

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M13',
    meta:        M13_META_ROUTER,
    st:          M13_ST_ROUTER,
    services:    M13_SERVICES,
    interchange: M13_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M13_SERVICES, M13_DEP, M13_SPD, M13_TIME_FACTOR, M13_HW_ALL,
                     M13_HW_OFFPEAK, M13_HW_PEAK, M13_META_ROUTER, M13_ST_ROUTER };
}

/* ================================================================
   M16-TT.JS — Metro Line 16 (#816cb1) · Timetable Profile
   ================================================================
   Dipende da: metro/m16-data.js (M16_META, M16_ST, M16_CANONICAL_ORDER,
     M16_SVC, M16_S2_STOPS, M16_ORIGINS, M16_HEADWAY, M16_S2_HEADWAY,
     M16_S3_HEADWAY, M16_S4_HEADWAY, M16_INTERCHANGE),
     metro/metro-router.js

   Servizi (direzione F = verso M1652, R = verso M1601):
     S1  All-stop   M1601 ↔ M1652   M16_HEADWAY (8/5/2/1.5 min)
     S2  Rapido     M1601 ↔ M1652   15 min, 06:30–22:30
     S3  Limitato 1 M1630 ↔ M1652   4 x S1
     S4  Limitato 2 M1601 ↔ M1627   4 x S1

   Orario: primo treno 04:45; l'ultimo treno S1 arriva a
   destinazione (anche intermedia) alle 01:00.

   Origini intermedie (SOLO S1), M16_ORIGINS:
     M1609 → M1652, M1617 → M1652, M1641 → M1601.
   Servono a coprire la linea mentre il treno del capolinea non e'
   ancora arrivato (apertura) e dopo la fine delle corse dal capolinea
   (chiusura):
     apertura  : da 04:45 fino al passaggio del primo S1 dal
                 capolinea (04:45 + tempo di percorrenza, arrotondato
                 per eccesso):
                 M1609 04:45–05:01 · M1617 04:45–05:17 · M1641 04:45–05:05
     chiusura  : dall'ultima partenza del capolinea fino all'ultima
                 partenza dell'origine (M16_HOURS.lastDep):
                 M1609 23:19–23:34 · M1617 23:34–23:51 · M1641 23:19–23:39
   Frequenza nelle finestre: 8 min (alba/sera).

   Modello tempi (kinematico, come M13/M17): acc 0.9 m/s2,
   dec 1.0 m/s2, sosta 30 s, vmax 80 km/h. Con queste ipotesi S1
   M1601→M1652 dura 101:58 (76.09 km a ~44.8 km/h commerciali,
   sosta inclusa). Parametri scelti per avvicinarsi alle metro
   urbane pesanti di Seul (linee 5/7): a 1 km di interstazione il
   modello da' ~36 km/h commerciali, ma M16 ha interstazioni medie
   di 1.49 km. Il router usa km/speedKmh + fermate intermedie x
   dwell: la speedKmh di ogni servizio e' la velocita' di marcia
   (sosta esclusa) derivata in modo che il tempo totale coincida
   con quello del modello.
   Tempi totali:
     S1 101:58 · S2 80:37 · S3 44:28 · S4 50:43
     S1 da M1609 86:00 · da M1617 69:37 · da M1641 81:40

   LIMITI NOTI DEL ROUTER (non modificato, come in M13):
     - la finestra oraria e' valutata sull'ora della richiesta, non
       su quella di partenza effettiva.
     - headway uguale a ogni stazione di salita (nessun offset
       specifico per le origini intermedie).

   TODO:
     - verificare che il router accetti headwayMin non intero (1.5)
     - orari di servizio di S3/S4 assunti = S1
     - sosta 30 s e transferMin da confermare
     - finestre di apertura delle origini: stimate (non ricalcolate
       con lo script del modello) e arrotondate per eccesso
================================================================ */
'use strict';

const M16_COLOR = M16_META.color;

/* Tempi (s, sosta inclusa), km e fermate intermedie dal modello.
   speedKmh = km / (sec - between * dwellSec) * 3600 */
const M16_BASE = {
  S1:    { km: 76.09, between: 50, sec: 6118, speedKmh: 59.3 },
  S2:    { km: 76.09, between: 26, sec: 4837, speedKmh: 67.5 },
  S3:    { km: 33.88, between: 21, sec: 2668, speedKmh: 59.9 },
  S4:    { km: 37.41, between: 25, sec: 3043, speedKmh: 58.7 },
  O1609: { km: 64.31, between: 42, sec: 5160, speedKmh: 59.4 },
  O1617: { km: 51.97, between: 34, sec: 4177, speedKmh: 59.3 },
  O1641: { km: 62.06, between: 39, sec: 4900, speedKmh: 59.9 },
};

const _rev16 = (a) => a.slice().reverse();

/* Ritaglia le fasce di un headway su [from, to) (stringhe HH:MM, anche >24) */
const _tmin16 = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const _tstr16 = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
const _clip16 = (bands, from, to) => bands
  .map(b => ({ ...b, from: _tstr16(Math.max(_tmin16(b.from), _tmin16(from))),
                     to:   _tstr16(Math.min(_tmin16(b.to),   _tmin16(to))) }))
  .filter(b => _tmin16(b.from) < _tmin16(b.to));

/* Ultima partenza S1 dal capolinea (+1 min come estremo escluso) */
const M16_LAST_END = '23:19';

const M16_HW_S1 = _clip16(M16_HEADWAY, '04:45', M16_LAST_END);

const _mk16 = (logical, name, base, stops, headway, extra = {}) => ({
  id: 'M16', svcLogical: logical, name, color: M16_COLOR, cls: 'svc-' + logical.split('_')[0],
  rapid: logical.startsWith('S2'), speedKmh: M16_BASE[base].speedKmh,
  thruAt: null, stops, headway, ...extra,
});

/* Finestre di apertura/chiusura delle origini intermedie (8 min) */
const _win16 = (from, to) => ({ from, to, headwayMin: 8 });
const M16_ORIGIN_WIN = {
  M1609: [_win16('04:45', '05:01'), _win16('23:19', '23:34')],
  M1617: [_win16('04:45', '05:17'), _win16('23:34', '23:51')],
  M1641: [_win16('04:45', '05:05'), _win16('23:19', '23:39')],
};

const _origin16 = (from) => M16_ORIGINS.find(o => o.from === from);

const M16_SERVICES = [
  /* S1 full-line */
  _mk16('S1_F', 'All-stop (M1601→M1652)', 'S1', M16_CANONICAL_ORDER.slice(), M16_HW_S1),
  _mk16('S1_R', 'All-stop (M1652→M1601)', 'S1', _rev16(M16_CANONICAL_ORDER), M16_HW_S1),

  /* S1 origini intermedie (apertura / chiusura) */
  _mk16('S1_F_M1609', 'All-stop (M1609→M1652)', 'O1609', _origin16('M1609').stops, M16_ORIGIN_WIN.M1609),
  _mk16('S1_F_M1617', 'All-stop (M1617→M1652)', 'O1617', _origin16('M1617').stops, M16_ORIGIN_WIN.M1617),
  _mk16('S1_R_M1641', 'All-stop (M1641→M1601)', 'O1641', _origin16('M1641').stops, M16_ORIGIN_WIN.M1641),

  /* S2 rapido */
  _mk16('S2_F', 'Rapid (M1601→M1652)', 'S2', M16_S2_STOPS.slice(), M16_S2_HEADWAY),
  _mk16('S2_R', 'Rapid (M1652→M1601)', 'S2', _rev16(M16_S2_STOPS), M16_S2_HEADWAY),

  /* S3 limitato 1 (M1630↔M1652) */
  _mk16('S3_F', 'Limited 1 (M1630→M1652)', 'S3', M16_SVC.S3.stops.slice(), M16_S3_HEADWAY),
  _mk16('S3_R', 'Limited 1 (M1652→M1630)', 'S3', _rev16(M16_SVC.S3.stops), M16_S3_HEADWAY),

  /* S4 limitato 2 (M1601↔M1627) */
  _mk16('S4_F', 'Limited 2 (M1601→M1627)', 'S4', M16_SVC.S4.stops.slice(), M16_S4_HEADWAY),
  _mk16('S4_R', 'Limited 2 (M1627→M1601)', 'S4', _rev16(M16_SVC.S4.stops), M16_S4_HEADWAY),
];

/* ----------------------------------------------------------------
   Registrazione nel MetroRouter
---------------------------------------------------------------- */
const M16_META_ROUTER = { ...M16_META, avgSpeedKmh: M16_BASE.S1.speedKmh };

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M16',
    meta:        M16_META_ROUTER,
    st:          M16_ST,
    services:    M16_SERVICES,
    interchange: M16_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M16_SERVICES, M16_BASE, M16_HW_S1, M16_ORIGIN_WIN, M16_META_ROUTER };
}

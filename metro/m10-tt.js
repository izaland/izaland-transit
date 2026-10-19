/* ================================================================
   M10-TT.JS — Metro Line 10 · Timetable
   ================================================================
   Servizi (bidirezionali):
     S1  All-stop            M1001 ↔ M1030                        6 tph tutto il giorno
     S2  Thru SSK            M1001 ↔ M1027 ↔ SSK01…SSK13   (S2_S / S2_N)
     S3  Thru SSK (short)    M1006 ↔ M1027 ↔ SSK01…SSK13   (S3_S / S3_N)

   Frequenza S2 / S3 (tph)            punta   fuori punta
                                S2      6        4
                                S3      4        2
   S2+S3 = 10 tph in punta e 6 tph fuori punta = esattamente i treni
   SSK01↔SSK13 di ssk-tt.js (ogni 6 / 10 min). Ogni treno S2/S3 È un
   treno SSK (thru service, cambio macchinista a M1027).

   Verso SSK (S*_S): il treno arriva a M1027 UN MINUTO PRIMA della
   partenza del treno SSK corrispondente da SSK01. Le partenze da
   M1001/M1006 sono calcolate a ritroso col modello cinematico (svc.kin).

   Verso M10 (S*_N): il treno SSK13→SSK01 arriva a SSK01 dopo
   _SSK_RUN_SEC (19:19, da ssk-tt.js) e riparte da M1027 UN MINUTO
   DOPO l'arrivo. Gli slot (k) sono gli stessi dell'andata, riferiti
   alla partenza da SSK13 (fasce SSK identiche nei due versi).

   Assegnazione degli slot SSK (k = indice partenza nell'ora):
     punta        (10 slot, ogni 6 min)  S2: 0,2,3,5,7,8   S3: 1,4,6,9
     fuori punta  ( 6 slot, ogni 10 min) S2: 0,2,3,5       S3: 1,4

   Le fasce SSK (_SSK_BANDS) replicano ssk-tt.js: aggiornarle insieme.
   Ogni slot è un servizio con headway 60 min e offsetMin frazionario
   (stessa tecnica di W2 in kw-tt.js). La finestra oraria è riferita
   all'orario di partenza dal capolinea M10 (M1001/M1006 o M1027).

   PARAMETRI PROVVISORI: vmax 100 km/h, accel/decel 1.0 m/s², sosta 20 s.
   Orari S1 (05:00–24:00, offset :05) provvisori.
   _SSK_RUN_SEC = 1159 s (≈19:19, stima di ssk-tt.js): aggiornare se cambia.
   Le partenze da M1027 oltre le 24:00 usano un secondo slot 00:00–xx:xx
   (il router confronta HH:MM come stringhe, vedi M8).
   Dipende da: m10-data.js. Caricato dopo m10-data.js nell'HTML.
================================================================ */
'use strict';

const _M10_KIN = { vmaxKmh: 100, accel: 1.0, decel: 1.0, dwellSec: 20 };
const _M10_THRU_ARR_BEFORE_SSK_SEC = 60;   /* verso SSK: arrivo a M1027 = partenza SSK01 − 60 s */
const _M10_THRU_DEP_AFTER_SSK_SEC  = 60;   /* verso M10: partenza M1027 = arrivo SSK01 + 60 s */
const _SSK_RUN_SEC = 1159;                 /* SSK13 → SSK01 ≈ 19:19 */

/* Fasce SSK: [prima partenza da capolinea SSK, ultima partenza, headway min] */
const _SSK_BANDS = [
  ['05:00', '06:50', 10],
  ['07:00', '09:24',  6],
  ['09:30', '16:50', 10],
  ['17:00', '19:54',  6],
  ['20:00', '24:20', 10],
];

const _M10_SLOTS = {
  peak: { S2: [0, 2, 3, 5, 7, 8], S3: [1, 4, 6, 9] },
  off:  { S2: [0, 2, 3, 5],       S3: [1, 4] },
};

function _m10HmToSec(hm) { const [h, m] = hm.split(':').map(Number); return h * 3600 + m * 60; }
function _m10SecToHM(sec) {
  const s = ((sec % 86400) + 86400) % 86400;
  return String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor((s % 3600) / 60)).padStart(2, '0');
}

/* Stessa formula di MetroRouter._segSec / _kinTimes */
function _m10SegSec(d, v, a, b) {
  const dAcc = (v * v) / (2 * a), dDec = (v * v) / (2 * b);
  if (d >= dAcc + dDec) return v / a + v / b + (d - dAcc - dDec) / v;
  const vp = Math.sqrt((2 * d) / (1 / a + 1 / b));
  return vp / a + vp / b;
}
function _m10RunSec(stops) {
  const v = _M10_KIN.vmaxKmh / 3.6;
  let t = 0;
  for (let i = 1; i < stops.length; i++) {
    t += _m10SegSec(Math.abs(M10_ST[stops[i]].km - M10_ST[stops[i - 1]].km) * 1000, v, _M10_KIN.accel, _M10_KIN.decel);
    if (i < stops.length - 1) t += _M10_KIN.dwellSec;
  }
  return Math.round(t);
}

function _m10ThruServices(logical, name, origin, northbound) {
  const iO = M10_CANONICAL_ORDER.indexOf(origin);
  const i27 = M10_CANONICAL_ORDER.indexOf('M1027');
  const southStops = M10_CANONICAL_ORDER.slice(iO, i27 + 1);
  const stops = northbound ? [...southStops].reverse() : southStops;
  const T = _m10RunSec(stops);
  /* secondi tra la partenza SSK di riferimento e la partenza dal capolinea M10 */
  const shift = northbound
    ? _SSK_RUN_SEC + _M10_THRU_DEP_AFTER_SSK_SEC     /* M1027 dep = SSK13 dep + shift */
    : -(_M10_THRU_ARR_BEFORE_SSK_SEC + T);           /* M1001/6 dep = SSK01 dep + shift */
  const out = [];
  for (const [from, to, hw] of _SSK_BANDS) {
    const slots = _M10_SLOTS[hw === 6 ? 'peak' : 'off'][logical];
    const first = _m10HmToSec(from) + shift;
    const last  = _m10HmToSec(to)   + shift;
    const fromMin = Math.floor(first / 60) * 60;
    const toMin   = (Math.floor(last / 60) + 1) * 60;
    const win = [];
    if (toMin > 86400) {
      win.push({ from: _m10SecToHM(fromMin), to: '24:00', headwayMin: 60 });
      win.push({ from: '00:00', to: _m10SecToHM(toMin - 86400), headwayMin: 60 });
    } else {
      win.push({ from: _m10SecToHM(fromMin), to: _m10SecToHM(toMin), headwayMin: 60 });
    }
    for (const k of slots) {
      const sskMin = k * hw;
      const offSec = ((sskMin * 60 + shift) % 3600 + 3600) % 3600;
      out.push({
        id: 'M10', svcLogical: logical + (northbound ? '_N' : '_S'),
        name: name + (northbound ? ' (verso M10)' : ' (verso SSK)'),
        color: M10_META.color, cls: 'metro', rapid: false,
        headway: win, offsetMin: offSec / 60, kin: _M10_KIN,
        stops, thruTo: 'SSK', sskSlotMin: sskMin,
      });
    }
  }
  return out;
}

const _M10_S1_HW = [{ from: '05:00', to: '24:00', headwayMin: 10 }];

const M10_SERVICES_NORM = [
  { id: 'M10', svcLogical: 'S1_S', name: 'All-stop (M1001 → M1030)', color: M10_META.color, cls: 'metro', rapid: false,
    headway: _M10_S1_HW, offsetMin: 5, kin: _M10_KIN, stops: M10_CANONICAL_ORDER },
  { id: 'M10', svcLogical: 'S1_N', name: 'All-stop (M1030 → M1001)', color: M10_META.color, cls: 'metro', rapid: false,
    headway: _M10_S1_HW, offsetMin: 5, kin: _M10_KIN, stops: [...M10_CANONICAL_ORDER].reverse() },
  ..._m10ThruServices('S2', 'Thru SSK S2 (M1001)', 'M1001', false),
  ..._m10ThruServices('S2', 'Thru SSK S2 (M1001)', 'M1001', true),
  ..._m10ThruServices('S3', 'Thru SSK S3 (M1006)', 'M1006', false),
  ..._m10ThruServices('S3', 'Thru SSK S3 (M1006)', 'M1006', true),
];

if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId: 'M10', meta: M10_META, st: M10_ST,
    services: M10_SERVICES_NORM, interchange: M10_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M10_SERVICES_NORM };
}

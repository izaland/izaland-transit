/* ================================================================
   CO-DATA.JS — Chikaoi Line · servizi (CO_SERVICES)
   ================================================================
   Stazioni, meta e interscambi di CO stanno in suburban-data.js
   (SUBURBAN_LINES.CO / SUBURBAN_INTERCHANGE); qui solo i servizi.
   Va caricato DOPO suburban-router.js.

   Servizi (invariati salvo orari di S2):
     S1  CO73 <-> CO58  tutte le fermate  3 tph solo in punta (20 min)
     S2  CO01 <-> CO41  tutte le fermate  3 tph tutto il giorno (20 min)
     S3  CO73 <-> CO08  tutte le fermate  2 tph solo in punta (30 min)
     S4  CO24 <-> CO58  tutte le fermate  2 tph solo in punta (30 min)

   THRU con KS (相互直通運転): S2 prosegue come KT (KS21 <-> KS18) e poi
   come M1 T_W/T_E (M128 <-> M110). Coppia thru KS21|CO01, sosta 90 s.
     SB: KT arriva a KS21 :02:33/:22:33/:42:33 -> S2 parte da CO01 :05/:25/:45
     NB: S2 arriva a CO01 :57:29/:17:29/:37:29 -> KT parte da KS21 :00/:20/:40
   Per questo S2 e' explicitDir con firstDep propri (SB 05:05, NB 05:24).

   TODO: prima/ultima corsa e fasce di punta sono PROVVISORI.
================================================================ */
'use strict';

const _CO_PEAKS = [['07:00', '09:30'], ['17:00', '20:00']];

function _coPeak(id, desc, a, b, headway) {
  return _CO_PEAKS.flatMap(([firstDep, lastDep]) => [
    { id, desc, fromCode: a, toCode: b, headway, stops: [], firstDep, lastDep },
    { id, desc, fromCode: b, toCode: a, headway, stops: [], firstDep, lastDep },
  ]);
}

const CO_SERVICES = [
  ..._coPeak('S1', 'Local (punta)', 'CO73', 'CO58', 20),

  { id: 'S2', desc: 'Local', fromCode: 'CO01', toCode: 'CO41', headway: 20, stops: [],
    explicitDir: true, firstDep: '05:05', lastDep: '23:45' },
  { id: 'S2', desc: 'Local', fromCode: 'CO41', toCode: 'CO01', headway: 20, stops: [],
    explicitDir: true, firstDep: '05:24', lastDep: '23:30' },

  ..._coPeak('S3', 'Local (punta)', 'CO73', 'CO08', 30),
  ..._coPeak('S4', 'Local (punta)', 'CO24', 'CO58', 30),
];

function _coRegister() {
  if (typeof SuburbanRouter !== 'undefined')
    SuburbanRouter.register({ lineId: 'CO', services: CO_SERVICES });
  if (typeof IZXUnifiedRouter !== 'undefined' && IZXUnifiedRouter.registerThruService)
    IZXUnifiedRouter.registerThruService({ codes: ['KS21', 'CO01'], stopSec: 90 });
}
if (typeof SuburbanRouter !== 'undefined') SuburbanRouter.register({ lineId: 'CO', services: CO_SERVICES });
if (typeof window !== 'undefined')
  window.addEventListener('DOMContentLoaded', _coRegister);

if (typeof module !== 'undefined') module.exports = { CO_SERVICES };

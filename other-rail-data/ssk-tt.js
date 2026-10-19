/* ================================================================
   SSK-TT.JS — Shikisabu Line · Timetable
   ================================================================
   Dipende da: suburban-data.js, other-rail-data/ssk-data.js
   Caricare DOPO ssk-data.js e dopo suburban-router.js nell'HTML.

   Direzioni:
     SB = SSK01 → SSK13   (id servizio: SSK1)
     NB = SSK13 → SSK01   (id servizio: SSK1_NB)

   Servizio unico, tutte le fermate (SSK1)
     Primo treno da ciascun capolinea : 05:00
     Ultimo arrivo al capolinea       : 00:40
     Off-peak : un treno ogni 10 min
     Peak     : un treno ogni  6 min

   NOTE / ASSUNZIONI (da verificare)
   - Fasce peak NON specificate: assunte 07:00–09:30 e 17:00–20:00
     (le stesse della Wataiga Monorail).
   - Ultima partenza 24:20 da entrambi i capolinea: con vMax 100 km/h
     il router calcola ~19 min 19 s di percorrenza (11 soste da 20 s
     incluse) → ultimo arrivo ~00:39, entro le 00:40.
   - vMax 100 km/h provvisoria, da tarare sui tempi reali.
   - Il servizio è diviso in fasce a headway fisso (stesso schema di
     shx-tt.js): quando si passa da una fascia all'altra l'intervallo
     tra due treni può differire da 6/10 min.
================================================================ */
'use strict';

const _SSK_ORDER_SB = [
  'SSK01','SSK02','SSK03','SSK04','SSK05','SSK06','SSK07',
  'SSK08','SSK09','SSK10','SSK11','SSK12','SSK13',
];
const _SSK_VMAX = 100;

/* Fasce orarie: [da, a, headway]  (ultima partenza di ogni fascia) */
const _SSK_BANDS = [
  ['05:00', '06:50', 10],   /* off-peak mattina */
  ['07:00', '09:24',  6],   /* peak mattina     */
  ['09:30', '16:50', 10],   /* off-peak giorno  */
  ['17:00', '19:54',  6],   /* peak sera        */
  ['20:00', '24:20', 10],   /* off-peak sera    */
];

function _sskSvc(dir, from, to, headway) {
  const sb = dir === 'SB';
  return {
    id:       sb ? 'SSK1' : 'SSK1_NB',
    desc:     'Local' + (sb ? ' · SSK01 → SSK13' : ' · SSK13 → SSK01'),
    fromCode: sb ? 'SSK01' : 'SSK13',
    toCode:   sb ? 'SSK13' : 'SSK01',
    firstDep: from,
    lastDep:  to,
    headway,
    vMaxKmh:  _SSK_VMAX,
    explicitDir: true,
    stops:    sb ? _SSK_ORDER_SB : [..._SSK_ORDER_SB].reverse(),
  };
}

/* ================================================================
   SSK_TT_SERVICES — formato compatibile con SuburbanRouter _svcTrips()
================================================================ */
const SSK_TT_SERVICES = [];
for (const [from, to, hw] of _SSK_BANDS) {
  SSK_TT_SERVICES.push(_sskSvc('SB', from, to, hw));
  SSK_TT_SERVICES.push(_sskSvc('NB', from, to, hw));
}

/* ================================================================
   REGISTRAZIONE nel SuburbanRouter
================================================================ */
if (typeof SuburbanRouter !== 'undefined' && typeof SUBURBAN_LINES !== 'undefined' && SUBURBAN_LINES.SSK) {
  SuburbanRouter.register({
    lineId:      'SSK',
    meta:        {
      name:  'Shikisabu Line',
      label: 'SSK',
      kanji: '',
      color: '#D2B48C',
      cls:   'suburban',
    },
    stations:    SUBURBAN_LINES.SSK.stations,
    services:    SSK_TT_SERVICES,
    interchange: Object.fromEntries(
      Object.entries(SUBURBAN_INTERCHANGE).filter(([k]) => k.startsWith('SSK'))
    ),
  });
}

if (typeof module !== 'undefined') {
  module.exports = { SSK_TT_SERVICES };
}

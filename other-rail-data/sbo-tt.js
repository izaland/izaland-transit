/* ================================================================
   SBO-TT.JS — Shinsabu Oitsura Line · Timetable  (BOZZA)
   ================================================================
   Dipende da: suburban-data.js, other-rail-data/sbo-data.js
   Caricare DOPO sbo-data.js e dopo suburban-router.js nell'HTML.

   Direzioni:
     SB = SBO01 → SBO07   (Oitsura → Kawaei)   → poi M4 verso Ipporai-Senpyan
     NB = SBO07 → SBO01   (Kawaei → Oitsura)   ← arrivo da M4 (thru)

   Servizi:
     SBO1 / SBO1_NB  Local  — tutte le fermate (SBO01–SBO07)
     SBO2 / SBO2_NB  Rapid  — SBO01, SBO05, SBO07

   THRU SERVICE CON M4 (Kokendake Line)
     - Metà dei treni M4 prosegue su SBO, metà termina a Kawaei (M415).
       → headway SBO = 2 × headway M4 (stesse fasce di M4_HEADWAY).
     - I Local M4 (B) proseguono come Local SBO1, i Rapid M4 (A) come
       Rapid SBO2.
     - NB: la prima partenza di ogni fascia da SBO07 = partenza da M425
       + tempo di percorrenza M4 + sosta thru (THRU_MIN = 2 min).
         M4 Rapid  M425→M415 = 72 min 11 s  (11 soste intermedie da 30 s)
         M4 Local  M425→M415 = 78 min 41 s  (24 soste intermedie da 30 s)
       Verificato sul planner: Anagusa Mukai → Kawaei Rapid = 27 min
       (12.65 km a 30 km/h + 4 soste da 30 s).
     - SB: partenza da SBO01 con le stesse fasce di M4 (headway doppio);
       i treni proseguono su M4 verso M425 dopo la sosta a SBO07.

   NOTE / ASSUNZIONI (da verificare)
   - vMax 90 km/h provvisoria. Con accel 2.5 / decel 3.0 km/h/s e sosta
     20 s: Local ~10 min 20 s, Rapid ~6 min 50 s (SBO01 ↔ SBO07).
   - Il router applica le fasce all'orario nella stazione di salita
     (non c'è un orario unico per linea): la sincronia perfetta con M4
     vale solo sulle partenze da SBO07 (NB) e SBO01 (SB).
   - Ultimo treno SB: 24:20 da SBO01. Ultimo NB: ultimo M4 arrivato a
     Kawaei (~01:34 Rapid, ~01:41 Local).
   - Metà dei treni = ogni secondo treno; non è modellata l'alternanza
     esatta (quali treni M4 proseguono).
   - Il flag thruService nel SuburbanRouter va esteso con la coppia
     'M415|SBO07'.
================================================================ */
'use strict';

const _SBO_ORDER_SB = ['SBO01','SBO02','SBO03','SBO04','SBO05','SBO06','SBO07'];
const _SBO_ORDER_RAPID_SB = ['SBO01','SBO05','SBO07'];
const _SBO_VMAX = 90;

/* SB: [da, a, headway]  — fasce M4 con headway doppio */
const _SBO_BANDS_SB = [
  ['05:00', '06:20', 20],
  ['06:30', '06:55', 10],
  ['07:00', '09:28',  4],
  ['09:30', '16:56',  8],
  ['17:00', '19:58',  4],
  ['20:00', '22:25', 10],
  ['22:30', '24:20', 20],
];

/* NB Rapid: aligned to M4 Rapid arrivals at M415 (+72m11s +2 min) */
const _SBO_BANDS_NB_RAPID = [
  ['06:14', '07:34', 20],
  ['07:44', '08:09', 10],
  ['08:14', '10:42',  4],
  ['10:44', '18:10',  8],
  ['18:14', '21:12',  4],
  ['21:14', '23:39', 10],
  ['23:44', '25:34', 20],
];

/* NB Local: aligned to M4 All-stop arrivals at M415 (+78m41s +2 min) */
const _SBO_BANDS_NB_LOCAL = [
  ['06:21', '07:41', 20],
  ['07:51', '08:16', 10],
  ['08:21', '10:49',  4],
  ['10:51', '18:17',  8],
  ['18:21', '21:19',  4],
  ['21:21', '23:46', 10],
  ['23:51', '25:41', 20],
];

function _sboSvc(id, rapid, sb, from, to, headway) {
  return {
    id,
    desc:     (rapid ? 'Rapid' : 'Local') + (sb ? ' · SBO01 → SBO07' : ' · SBO07 → SBO01'),
    fromCode: sb ? 'SBO01' : 'SBO07',
    toCode:   sb ? 'SBO07' : 'SBO01',
    firstDep: from,
    lastDep:  to,
    headway,
    vMaxKmh:  _SBO_VMAX,
    explicitDir: true,
    stops:    (() => {
      const o = rapid ? _SBO_ORDER_RAPID_SB : _SBO_ORDER_SB;
      return sb ? o : [...o].reverse();
    })(),
  };
}

/* ================================================================
   SBO_TT_SERVICES — formato compatibile con SuburbanRouter _svcTrips()
================================================================ */
const SBO_TT_SERVICES = [];
for (const [from, to, hw] of _SBO_BANDS_SB) {
  SBO_TT_SERVICES.push(_sboSvc('SBO1',    false, true,  from, to, hw));
  SBO_TT_SERVICES.push(_sboSvc('SBO2',    true,  true,  from, to, hw));
}
for (const [from, to, hw] of _SBO_BANDS_NB_LOCAL) {
  SBO_TT_SERVICES.push(_sboSvc('SBO1_NB', false, false, from, to, hw));
}
for (const [from, to, hw] of _SBO_BANDS_NB_RAPID) {
  SBO_TT_SERVICES.push(_sboSvc('SBO2_NB', true,  false, from, to, hw));
}

/* ================================================================
   REGISTRAZIONE nel SuburbanRouter
================================================================ */
if (typeof SuburbanRouter !== 'undefined' && typeof SUBURBAN_LINES !== 'undefined' && SUBURBAN_LINES.SBO) {
  SuburbanRouter.register({
    lineId:      'SBO',
    meta:        {
      name:  'Shinsabu Oitsura Line',
      label: 'SBO',
      kanji: '粕鵲線',
      color: '#00CCCC',
      cls:   'suburban',
    },
    stations:    SUBURBAN_LINES.SBO.stations,
    services:    SBO_TT_SERVICES,
    interchange: Object.fromEntries(
      Object.entries(SUBURBAN_INTERCHANGE).filter(([k]) => k.startsWith('SBO'))
    ),
  });
}

if (typeof module !== 'undefined') {
  module.exports = { SBO_TT_SERVICES };
}

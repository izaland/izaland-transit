/* ================================================================
   SBO-TT.JS — Shinsabu Oitsura Line · Timetable  (BOZZA)
   ================================================================
   Dipende da: suburban-data.js, other-rail-data/sbo-data.js
   Caricare DOPO sbo-data.js e dopo suburban-router.js nell'HTML.

   Direzioni:
     SB = SBO01 → SBO07   (Oitsura → Kawaei)   → poi M4 verso Ipporai-Senpyan
     NB = SBO07 → SBO01   (Kawaei → Oitsura)   ← arrivo da M4 (thru)

   Servizi:
     SBO1 / SBO1_NB  Local — tutte le fermate (SBO01–SBO07)
     SBO2 / SBO2_NB  Rapid — SBO01, SBO05, SBO07  (SOLO fasce di punta)

   FASCE
     Fuori punta : solo Local, un treno ogni 10 min.
     Punta       : Local + Rapid, ciascuno ogni 4 min (= 2 × headway M4,
                   perché metà dei treni M4 prosegue su SBO).
     Punta SB (da SBO01)  : 07:00–09:28 e 17:00–19:58 (stesse di M4).
     Punta NB (da SBO07)  : spostata dal tempo di percorrenza M4:
                   Rapid 08:14–10:42 e 18:14–21:10
                   Local 08:21–10:49 e 18:21–21:17

   THRU SERVICE CON M4 (Kokendake Line)
     - NB in punta: partenza da SBO07 = partenza da M425 + percorrenza
       M4 + sosta thru (2 min).
         M4 Rapid  M425→M415 = 72 min 11 s
         M4 Local  M425→M415 = 78 min 41 s
       Verificato sul planner: Anagusa Mukai → Kawaei Rapid = 27 min
       (12.65 km a 30 km/h + 4 soste da 30 s).
     - Fuori punta la griglia a 10 min è indipendente da M4 (non tutti
       i Local SBO corrispondono a un thru M4).
     - SB: partenza da SBO01, poi i treni thru proseguono su M4.

   NOTE / ASSUNZIONI (da verificare)
   - Ultimo NB da SBO07: 24:05 (Local). Ultimo SB da SBO01: 24:20.
   - Primo NB da SBO07: 06:21 (primo Local M4 in arrivo + 2 min).
   - vMax 90 km/h provvisoria: Local ~10 min 20 s, Rapid ~6 min 50 s.
   - Il router applica le fasce all'orario nella stazione di salita.
   - Il flag thruService nel SuburbanRouter va esteso con la coppia
     'M415|SBO07'.
================================================================ */
'use strict';

const _SBO_ORDER_SB = ['SBO01','SBO02','SBO03','SBO04','SBO05','SBO06','SBO07'];
const _SBO_ORDER_RAPID_SB = ['SBO01','SBO05','SBO07'];
const _SBO_VMAX = 90;

/* Fasce: [da, a, headway]  (a = ultima partenza della fascia) */
const _SBO_BANDS = {
  /* SB = da SBO01 */
  LOCAL_SB: [
    ['05:00', '06:50', 10],
    ['07:00', '09:28',  4],
    ['09:30', '16:50', 10],
    ['17:00', '19:58',  4],
    ['20:00', '24:20', 10],
  ],
  RAPID_SB: [
    ['07:00', '09:28',  4],
    ['17:00', '19:58',  4],
  ],
  /* NB = da SBO07 (Kawaei) */
  LOCAL_NB: [
    ['06:21', '08:11', 10],
    ['08:21', '10:49',  4],
    ['10:59', '18:09', 10],
    ['18:21', '21:17',  4],
    ['21:25', '24:05', 10],
  ],
  RAPID_NB: [
    ['08:14', '10:42',  4],
    ['18:14', '21:10',  4],
  ],
};

function _sboSvc(id, rapid, sb, from, to, headway) {
  const order = rapid ? _SBO_ORDER_RAPID_SB : _SBO_ORDER_SB;
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
    stops:    sb ? order : [...order].reverse(),
  };
}

/* ================================================================
   SBO_TT_SERVICES — formato compatibile con SuburbanRouter _svcTrips()
================================================================ */
const SBO_TT_SERVICES = [];
for (const [f, t, h] of _SBO_BANDS.LOCAL_SB)  SBO_TT_SERVICES.push(_sboSvc('SBO1',    false, true,  f, t, h));
for (const [f, t, h] of _SBO_BANDS.RAPID_SB)  SBO_TT_SERVICES.push(_sboSvc('SBO2',    true,  true,  f, t, h));
for (const [f, t, h] of _SBO_BANDS.LOCAL_NB)  SBO_TT_SERVICES.push(_sboSvc('SBO1_NB', false, false, f, t, h));
for (const [f, t, h] of _SBO_BANDS.RAPID_NB)  SBO_TT_SERVICES.push(_sboSvc('SBO2_NB', true,  false, f, t, h));

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

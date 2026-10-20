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

   ALLINEAMENTO NB CON M4 (thru M415 <-> SBO07, Kawaei)
     Ogni partenza NB da SBO07 coincide con un arrivo M4 a Kawaei (M415)
     + sosta thru. Riferimento dal planner (MetroRouter, fasce M4_HEADWAY
     applicate all'orario nella stazione di salita):
       M4 parte da M413 (Ristai-Nyūngu) alle 08:00, 08:02, ...
       e arriva a M415 alle 08:05, 08:07, ...   (5 min)
       sosta thru 90 s  ->  partenza SBO07 = arrivo M415 + 2 min
                           (08:07, 08:09, ...)
     Quindi le partenze SBO07 sono le partenze M4 da M413 + 7 min.
     Con questo la coincidenza M4 -> SBO resta entro THRU_TOLERANCE_MIN
     (unified-router.js) e viene trattata come thru, senza cambio.

     Quali treni M4 proseguono su SBO:
       Punta (M4 ogni 2 min): tutti. Si alternano Local e Rapid, ciascuno
         ogni 4 min (Local 07:07, 07:11, ...; Rapid 07:09, 07:13, ...).
       Fuori punta: Local, un treno M4 su N per mantenere il passo SBO
         storico (10 min dove M4 e' a 5 o 10 min; 8 min dove M4 e' a 4).

   FASCE M4 (da M4_HEADWAY) e relative partenze NB da SBO07
     05:00–06:30  M4 10 min   -> SBO 10 min (tutti i treni)   05:37–06:27
     06:30–07:00  M4  5 min   -> SBO 10 min (1 su 2)           06:37–06:57
     07:00–09:30  M4  2 min   -> SBO Local+Rapid ogni 4 min     07:07/07:09 – 09:35/09:33
     09:30–17:00  M4  4 min   -> SBO 8 min (1 su 2)            09:37–16:57
     17:00–20:00  M4  2 min   -> SBO Local+Rapid ogni 4 min     17:07/17:09 – 20:03/20:05
     20:00–22:30  M4  5 min   -> SBO 10 min (1 su 2)           20:07–22:27
     22:30–24:30  M4 10 min   -> SBO 10 min (tutti i treni)    22:37–24:27

   PRIME PARTENZE NB (mattina presto)
     05:00–05:30  Local da DEPOSITO a SBO07, ogni 10 min (4 treni).
     05:37 in poi: Local thru da M4, secondo la tabella sopra.

   NOTE / ASSUNZIONI (da verificare)
   - Ultimo NB da SBO07: 24:27 (Local).  Ultimo SB da SBO01: 24:20.
   - La corsa M413->M415 e' 5 min nel planner; se cambia la velocita'
     o la sosta di M4, vanno ritoccati gli offset (+7 min) qui sotto.
   - Il SB (da SBO01) non e' stato riallineato: M4 da M415 verso ovest
     non ha ancora una coppia thru SBO->M4 nel router.
   - Deposito SBO assunto vicino a SBO07 (treni a vuoto non modellati).
   - vMax 90 km/h provvisoria: Local ~10 min 20 s, Rapid ~6 min 50 s.
   - Il router applica le fasce all'orario nella stazione di salita.
   - La coppia thru 'M415|SBO07' e' in THRU_SERVICES di unified-router.js.
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
  /* NB = da SBO07 (Kawaei): allineate agli arrivi M4 a M415 + 2 min */
  LOCAL_NB: [
    ['05:00', '05:30', 10],   /* deposito */
    ['05:37', '06:57', 10],   /* M4 10 min (tutti) + M4 5 min (1 su 2) */
    ['07:07', '09:35',  4],   /* punta: M4 ogni 2 min, Local = treni pari */
    ['09:37', '16:57',  8],   /* M4 ogni 4 min, 1 su 2 */
    ['17:07', '20:03',  4],   /* punta */
    ['20:07', '24:27', 10],   /* M4 5 min (1 su 2) + M4 10 min (tutti) */
  ],
  RAPID_NB: [
    ['07:09', '09:33',  4],   /* punta: treni dispari */
    ['17:09', '20:05',  4],
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

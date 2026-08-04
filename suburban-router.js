/* ================================================================
   SUBURBAN-ROUTER.JS — Izarail Suburban Journey Planner
   Dipende da: suburban-data.js (SUBURBAN_LINES, SUBURBAN_INTERCHANGE,
                                  SK_SERVICES, KW_SERVICES, TS_SERVICES)
                ks-data.js       (KS_SERVICES)

   API pubblica (stesso contratto di IZXRouter):
     SuburbanRouter.search(from, to, depTime, opts) → Journey[]
     SuburbanRouter.stationName(code)               → string
     SuburbanRouter.allStations()                   → Station[]
     SuburbanRouter.TRANSFER_MIN                    → number

   Supporta:
     - Linee lineari (A → B)
     - Linee circolari con fermate intermedie CW e CCW
     - Filtro per lineId (opts.lines)
     - directOnly (opts.directOnly)
     - Risoluzione alias cross-network (es. AX07 → LL17, AX06 → LL01)
     - Cambio a Sainðaul Central (LL01 ↔ K01/R01/E01/AX06)
       e Herubori (LL17 ↔ AX07) verso la rete IZX/AX,
       via IZXRouter.buildLeg()
     - Cambio tra due linee suburbane (es. Loop Line ↔ Kidai Line)
       tramite nodi condivisi in SUBURBAN_INTERCHANGE (fase 4)
     - Thru-service KW ↔ Metro (M8xx) via MetroRouter.buildLeg()
       (fasi 2b e 3b)

   Velocità per segmento (segSpeedKmh):
     Le stazioni KW hanno il campo opzionale segSpeedKmh che indica
     la velocità commerciale media (km/h) sul segmento DA quella
     stazione ALLA successiva. Il router usa _segSpeed() per
     recuperarla; se assente cade su AVG_SPEED_KMH (40 km/h).
     Questo permette di modellare la progressione urbano→extraurbano
     della Kwōkei Line senza toccare le altre linee.

   Sottoservizi SK / KW / TS / KS:
     Le linee SK, KW, TS e KS usano rispettivamente SK_SERVICES,
     KW_SERVICES, TS_SERVICES e KS_SERVICES invece del singolo headway
     di linea. _svcTrips() gestisce tutti e quattro; per linee prive
     di *_SERVICES si usa _syntheticTrips().

     FIX: _svcTrips() restituisce array di {sec, svcId, stops} invece
     di semplici numeri. _buildLeg() usa svcId/stops per filtrare
     le fermate intermedie dei treni Rapid e Commuter Rapid.

   FIX 2 (Rapid in fase 1):
     La fase 1 ora chiama _buildLegsAllSvcs() che costruisce un leg
     per ogni svcId distinto disponibile, invece di uno solo.
     Così W1 (Local), W3 (Rapid) e W4 (Commuter Rapid) appaiono
     come journey separati quando coprono il tratto richiesto.

   FIX 3 (Thru-service KW↔M8):
     I journey costruiti in fase 2b/3b dove il nodo di interscambio
     è M8xx ricevono il flag thruService: true. Il rendering in
     izx-ticket.html usa questo flag per mostrare il simbolo ↔
     e la nota «Thru service — stay on board» invece del normale
     pannello cambio.

   FIX 4 (_svcTrips NB direction):
     In _svcTrips() il blocco else (direzione NB, goingFwd=false)
     usava fullTravelSec calcolato in direzione SB. Con segSpeedKmh
     variabili per segmento _segSpeed() è asimmetrico, quindi i tempi
     in NB erano errati e identici per tutti i servizi, causando
     deduplicazione dei Rapid. Fix: fullTravelSecNB usa
     _travelSec(line, svcToIdx, svcFromIdx, fullKm).

   FIX 5 (dwell time in _buildLeg):
     alightSec ora include le soste nelle fermate intermedie effettive
     del servizio (stopCount * DWELL_SEC). Prima tutti i servizi
     (W1/W3/W4) restituivano lo stesso tempo di percorrenza perché
     _travelSec modella solo la velocità in marcia, ignorando le
     soste. Con la fix:
       Local  (~31 intermedie) → ~15 min extra su rotta completa
       Commuter Rapid          → proporzionale alle sue fermate
       Rapid  (~9 intermedie)  → ~5 min extra
     Le fermate intermedie usate per l'interpolazione degli orari
     nei leg circolari usano totalTravelSec (già comprensivo delle
     soste) per evitare doppio conteggio.

   FIX 6 (_buildIntraLineTransfers direzione NB):
     Due bug nella fase 1b (Rapid→Local intra-linea):
     a) xferCandidates era sempre slice(lo+1, hi) in ordine crescente;
        per viaggi NB (iFrom > iTo) l'array non veniva invertito,
        quindi si tentava prima la fermata più lontana da iTo.
        Fix: candidates.reverse() quando goingFwd=false.
     b) _getTrips(line, iXfer, iTo, ...) per il leg 2 passava iXfer e
        iTo nell'ordine corretto MA _svcTrips usa iFrom<=iTo per
        determinare goingFwd internamente — con iXfer > iTo in NB
        il viaggio veniva trattato come SB e nessun trip veniva
        trovato. Fix: _getTrips riceve ora gli indici as-is (iXfer,
        iTo) che preservano la direzione reale.

   FIX 7 (_buildIntraLineTransfers — filtro destinazione errato):
     Causa radice del mancato riconoscimento delle coincidenze
     Rapid→Local: _buildIntraLineTransfers chiamava
     _getTrips(line, iFrom, iTo) che internamente è _svcTrips con
     controllo stops[]: se iTo NON è una fermata Rapid (es. KW14
     Yassamo non è in W3.stops), il servizio viene scartato PRIMA
     che la fase 1b possa valutarlo — allTrips era sempre vuoto.
     Fix: nuova funzione _getExpressTrips(line, iFrom, depSec) che
     estrae tutti i trip con stops[] non vuoto (express) che coprono
     la zona di iFrom, senza vincolo sulla destinazione. La fase 1b
     usa questi trip per trovare la fermata di trasferimento, poi
     usa _getTrips(line, iXfer, iTo) correttamente per il Local.

   FIX 8 (same-platform intra-line walk time):
     I journey prodotti da _buildIntraLineTransfers (Rapid→Local
     sulla stessa linea KW) ricevono ora transferWalkMin: 0 invece
     di TRANSFER_MIN. Il cambio avviene sulla stessa banchina: non
     c'è spostamento fisico, solo attesa del treno successivo.
     Il renderer deve usare transferWalkMin (0) per il pannello Walk
     e transferWaitMin (calcolato dall'orario reale) per il pannello
     Wait. La costante interna INTRA_TRANSFER_SEC = 0 è usata
     esclusivamente in _buildIntraLineTransfers.

   FIX 9 (_getTrips — dead code TS branch):
     Il branch `if (line.id === 'TS')` in _getTrips() era irraggiungibile
     perché il `return _syntheticTrips(...)` fallback lo precedeva.
     Fix: i branch SK, KW e TS vengono tutti valutati prima del return
     del fallback. Stesso fix applicato a _getExpressTrips() per TS.

   FIX 10 (KS_SERVICES):
     Aggiunto branch KS in _getTrips() e _getExpressTrips() per
     supportare i servizi KS1 (Local), KS2 (Semi-Rapid) e KS3 (Rapid)
     definiti in ks-data.js. La logica è identica ai branch SK/KW/TS.

   FIX 11 (_buildLocalToExpressTransfers — fase 1c):
     Aggiunta fase 1c: Local→Rapid intra-linea.
     La funzione _buildLocalToExpressTransfers() e il relativo blocco
     di invocazione erano stati inseriti fuori dalla funzione search(),
     causando un ReferenceError (journeys/depSec/resolvedFrom/resolvedTo
     non definiti a livello di modulo) che impediva il caricamento
     dell'intero file e quindi la definizione di SuburbanRouter.
     Fix: il blocco fase 1c è ora correttamente posizionato dentro
     search(), dopo la fase 1b.

   FIX 12 (deduplica per svcLogical):
     La chiave di deduplica usava l.svcId (es. 'SK1', 'SK2', 'SK3'),
     producendo N copie identiche del medesimo viaggio — una per ogni
     sottoservizio con lo stesso orario. Fix: la chiave usa ora
     `l.svcLogical ?? l.svcId` (es. 'SK') così i sottoservizi con
     stesso orario e stessa linea logica vengono deduplicati.
     Servizi con orari diversi (Local vs Rapid) rimangono distinti
     perché la chiave include anche departureTime|arrivalTime.

   FIX 13 (_hasLoop — guard anti-loop):
     Aggiunta funzione _hasLoop(legs) che restituisce true se un
     qualsiasi boardCode o alightCode compare più di una volta
     nell'insieme dei codici dei leg. Applicata come guard prima
     di ogni journeys.push() nelle fasi 2, 2b, 3, 3b e 4.
     Elimina journey fantasma come LO→Binno→LO→M1 dove un leg
     ritorna alla stazione di partenza del journey.

   Tempi di trasferimento:
     TRANSFER_MIN            3 min  — interscambio suburban ↔ suburban (stazione normale)
     HUB_TRANSFER_MIN        8 min  — interscambio suburban ↔ suburban (grande nodo)
     CROSS_TRANSFER_MIN     10 min  — interscambio suburbana ↔ IZX/AX/Metro
     METRO_TRANSFER_MIN      5 min  — interscambio Metro ↔ Metro (riserva; oggi gestito in MetroRouter)
     THRU_TRANSFER_MIN       2 min  — thru-service KW↔Metro (solo cambio operatore)
     INTRA_TRANSFER_SEC      0 sec  — same-platform intra-line (Rapid→Local KW)

   Per-node transferMin in SUBURBAN_INTERCHANGE (fase 4):
     Le entry di SUBURBAN_INTERCHANGE possono essere semplici stringhe
     (usa TRANSFER_SEC) oppure oggetti { code, transferMin } per
     sovrascrivere il tempo di camminata su quel nodo specifico.
     Esempio:
       'TS16': [{ code: 'KE04', transferMin: HUB_TRANSFER_MIN }]
     → 8 minuti di cammino tra TS Kasakuri e IZX Keishin Niji-Sainðaul.
================================================================ */
'use strict';

const SuburbanRouter = (() => {

  const TRANSFER_MIN        = 3;
  const HUB_TRANSFER_MIN    = 8;   // grande nodo di scambio suburban↔suburban
  const CROSS_TRANSFER_MIN  = 10;
  const METRO_TRANSFER_MIN  = 5;   // metro↔metro (riserva; oggi gestito in MetroRouter)
  const THRU_TRANSFER_MIN   = 2;   // thru-service: cambio operatore senza scendere
  const TRANSFER_SEC        = TRANSFER_MIN       * 60;
  const HUB_TRANSFER_SEC    = HUB_TRANSFER_MIN   * 60;
  const CROSS_TRANSFER_SEC  = CROSS_TRANSFER_MIN * 60;
  const METRO_TRANSFER_SEC  = METRO_TRANSFER_MIN * 60;  // eslint-disable-line no-unused-vars
  const THRU_TRANSFER_SEC   = THRU_TRANSFER_MIN  * 60;
  const INTRA_TRANSFER_SEC  = 0;   // same-platform intra-line (Rapid→Local)
  const MAX_JOURNEYS  = 12;
  const SEARCH_WINDOW = 3 * 3600;
  const AVG_SPEED_KMH = 40;   // fallback globale per linee senza segSpeedKmh
  const DWELL_SEC     = 30;

  /* ----------------------------------------------------------------
   * _isMetroCode(code)
   * ---------------------------------------------------------------- */
  function _isMetroCode(code) {
    return /^M\d/.test(code);
  }

  /* ----------------------------------------------------------------
   * _isThruNode(subCode, metroCode)
   * ---------------------------------------------------------------- */
  const THRU_PAIRS = new Set(['KW00|M801', 'M801|KW00']);
  function _isThruNode(subCode, metroCode) {
    return THRU_PAIRS.has(`${subCode}|${metroCode}`);
  }

  /* ----------------------------------------------------------------
   * _segSpeed(line, iFrom, iTo)
   * ---------------------------------------------------------------- */
  function _segSpeed(line, iFrom, iTo) {
    const sts = line.stations;
    if (iFrom === iTo) return AVG_SPEED_KMH;
    const step = iFrom < iTo ? 1 : -1;
    let totalKm = 0, weightedSum = 0;
    for (let i = iFrom; i !== iTo; i += step) {
      const segIdx = Math.min(i, i + step);
      if (segIdx < 0 || segIdx >= sts.length - 1) continue;
      const km  = Math.abs(sts[segIdx + 1].km - sts[segIdx].km);
      const spd = sts[segIdx].segSpeedKmh ?? AVG_SPEED_KMH;
      totalKm      += km;
      weightedSum  += km * spd;
    }
    return totalKm > 0 ? weightedSum / totalKm : AVG_SPEED_KMH;
  }

  /* ----------------------------------------------------------------
   * _travelSec(line, iFrom, iTo, km)
   * ---------------------------------------------------------------- */
  function _travelSec(line, iFrom, iTo, km) {
    if (line.circular) return Math.round((km / AVG_SPEED_KMH) * 3600);
    const spd = _segSpeed(line, iFrom, iTo);
    return Math.round((km / spd) * 3600);
  }

  /* ----------------------------------------------------------------
   * _countIntermediateStops(line, iFrom, iTo, svcStops)
   * ---------------------------------------------------------------- */
  function _countIntermediateStops(line, iFrom, iTo, svcStops) {
    const a = Math.min(iFrom, iTo);
    const b = Math.max(iFrom, iTo);
    const sliced = line.stations.slice(a + 1, b);
    if (svcStops.length === 0) return sliced.length;
    return sliced.filter(st => svcStops.includes(st.code)).length;
  }

  /* ----------------------------------------------------------------
   * Code-set helpers
   * ---------------------------------------------------------------- */
  let _suburbanCodeSet = null;
  function _getSuburbanCodeSet() {
    if (_suburbanCodeSet) return _suburbanCodeSet;
    _suburbanCodeSet = new Set();
    for (const line of Object.values(SUBURBAN_LINES)) {
      for (const st of line.stations) _suburbanCodeSet.add(st.code);
    }
    return _suburbanCodeSet;
  }

  /* ----------------------------------------------------------------
   * _getSuburbanPartnerMap()
   * ---------------------------------------------------------------- */
  let _suburbanPartnerMap = null;
  function _getSuburbanPartnerMap() {
    if (_suburbanPartnerMap) return _suburbanPartnerMap;
    const subCodes = _getSuburbanCodeSet();
    const map = {};
    function _add(a, b) {
      if (!subCodes.has(a) || !subCodes.has(b)) return;
      if (a === b) return;
      if (!map[a]) map[a] = new Set();
      if (!map[b]) map[b] = new Set();
      map[a].add(b);
      map[b].add(a);
    }
    for (const [key, partners] of Object.entries(SUBURBAN_INTERCHANGE)) {
      for (const p of partners) {
        const code = (typeof p === 'object' && p !== null) ? p.code : p;
        _add(key, code);
      }
    }
    _suburbanPartnerMap = {};
    for (const [k, v] of Object.entries(map)) _suburbanPartnerMap[k] = [...v];
    return _suburbanPartnerMap;
  }

  /* ----------------------------------------------------------------
   * _subTransferSec(nodeCode, partnerCode)
   * ---------------------------------------------------------------- */
  function _subTransferSec(nodeCode, partnerCode) {
    const partnersA = SUBURBAN_INTERCHANGE[nodeCode];
    if (partnersA) {
      for (const p of partnersA) {
        if (typeof p === 'object' && p !== null && p.code === partnerCode && p.transferMin != null)
          return p.transferMin * 60;
      }
    }
    const partnersB = SUBURBAN_INTERCHANGE[partnerCode];
    if (partnersB) {
      for (const p of partnersB) {
        if (typeof p === 'object' && p !== null && p.code === nodeCode && p.transferMin != null)
          return p.transferMin * 60;
      }
    }
    return TRANSFER_SEC;
  }

  let _inverseMap = null;
  function _getInverseMap() {
    if (_inverseMap) return _inverseMap;
    _inverseMap = {};
    for (const [subCode, partners] of Object.entries(SUBURBAN_INTERCHANGE)) {
      for (const p of partners) {
        const izxCode = (typeof p === 'object' && p !== null) ? p.code : p;
        if (!_inverseMap[izxCode]) _inverseMap[izxCode] = subCode;
      }
    }
    return _inverseMap;
  }

  function _resolveCode(code) {
    return _getInverseMap()[code] ?? code;
  }

   /* ----------------------------------------------------------------
 * _getEquivalentCodes(code)
 * Restituisce tutti i codici suburbani equivalenti a `code`
 * (incluso code stesso) tramite SUBURBAN_INTERCHANGE.
 * Usato dalla fase 1 per tentare il percorso diretto anche quando
 * from/to è espresso con il codice di un'altra linea sullo stesso nodo.
 * ---------------------------------------------------------------- */
function _getEquivalentCodes(code) {
  const result = new Set([code]);
  // Cerca i partner di code in SUBURBAN_INTERCHANGE
  const partners = SUBURBAN_INTERCHANGE[code];
  if (partners) {
    for (const p of partners) {
      const c = (typeof p === 'object' && p !== null) ? p.code : p;
      if (_getSuburbanCodeSet().has(c)) result.add(c);
    }
  }
  // Cerca anche simmetrico: nodi che puntano a code
  for (const [key, vals] of Object.entries(SUBURBAN_INTERCHANGE)) {
    for (const p of vals) {
      const c = (typeof p === 'object' && p !== null) ? p.code : p;
      if (c === code && _getSuburbanCodeSet().has(key)) result.add(key);
    }
  }
  return [...result];
}

  /* ---- utils tempo ---- */
  function _hmToSec(hm) {
    if (!hm) return 0;
    const [h, m] = hm.split(':').map(Number);
    return h * 3600 + m * 60;
  }
  function _secToHM(sec) {
    const s = ((sec % 86400) + 86400) % 86400;
    return String(Math.floor(s / 3600)).padStart(2, '0') + ':' +
           String(Math.floor((s % 3600) / 60)).padStart(2, '00');
  }

  function _idx(line, code) {
    return line.stations.findIndex(s => s.code === code);
  }

  function _kmBetween(line, iFrom, iTo) {
    const sts = line.stations;
    if (!line.circular) return Math.abs(sts[iTo].km - sts[iFrom].km);
    const total = line.totalKm;
    const cwKm  = ((sts[iTo].km - sts[iFrom].km) + total) % total;
    return Math.min(cwKm, total - cwKm);
  }

  function _circularDir(line, iFrom, iTo) {
    const sts   = line.stations;
    const total = line.totalKm;
    const cwKm  = ((sts[iTo].km - sts[iFrom].km) + total) % total;
    return cwKm <= total / 2 ? 'CW' : 'CCW';
  }

  function _circularIntermediateStops(line, iFrom, iTo, dir, boardSec, legKm, totalTravelSec) {
    const sts = line.stations;
    const n   = sts.length;
    const total = line.totalKm;
    const seq = [];
    if (dir === 'CW') {
      let i = (iFrom + 1) % n;
      while (i !== iTo) { seq.push(i); i = (i + 1) % n; }
    } else {
      let i = (iFrom - 1 + n) % n;
      while (i !== iTo) { seq.push(i); i = (i - 1 + n) % n; }
    }
    function _kmFromStart(idx) {
      if (dir === 'CW') return ((sts[idx].km - sts[iFrom].km) + total) % total;
      else              return ((sts[iFrom].km - sts[idx].km) + total) % total;
    }
    return seq.map(idx => {
      const kmElapsed = _kmFromStart(idx);
      const arrSec    = boardSec + Math.round((kmElapsed / legKm) * totalTravelSec);
      return { code: sts[idx].code, name: sts[idx].name,
               arr: _secToHM(arrSec), dep: _secToHM(arrSec + DWELL_SEC) };
    });
  }

  /* ----------------------------------------------------------------
   * _syntheticTrips(line, iFrom, depSec)
   * ---------------------------------------------------------------- */
  function _syntheticTrips(line, iFrom, depSec) {
    const PEAK_START  = 7 * 3600,  PEAK_END1  = 9  * 3600;
    const PEAK_START2 = 17 * 3600, PEAK_END2  = 20 * 3600;
    const isPeak = (depSec >= PEAK_START && depSec < PEAK_END1) ||
                   (depSec >= PEAK_START2 && depSec < PEAK_END2);
    const headwaySec = (isPeak ? line.headwayPeak : line.headwayOffPeak) * 60;
    const firstDep   = Math.ceil(depSec / headwaySec) * headwaySec;
    const trips = [];
    let t = firstDep;
    while (t <= depSec + SEARCH_WINDOW) {
      trips.push({ sec: t, svcId: line.id, svcDesc: line.name, stops: [] });
      t += headwaySec;
    }
    return trips;
  }

  /* ----------------------------------------------------------------
   * _svcTrips(services, line, iFrom, iTo, depSec)
   * ---------------------------------------------------------------- */
  function _svcTrips(services, line, iFrom, iTo, depSec) {
    const stCodes  = line.stations.map(s => s.code);
    const skipDestCheck = iTo === null;
    const goingFwd = skipDestCheck ? true : (iFrom <= iTo);
    const loIdx    = skipDestCheck ? iFrom : Math.min(iFrom, iTo);
    const hiIdx    = skipDestCheck ? iFrom : Math.max(iFrom, iTo);
    const allTrips = [];

    for (const svc of services) {
      const svcFromIdx = stCodes.indexOf(svc.fromCode);
      const svcToIdx   = stCodes.indexOf(svc.toCode);
      if (svcFromIdx === -1 || svcToIdx === -1) continue;

      if (skipDestCheck) {
        if (iFrom < svcFromIdx || iFrom > svcToIdx) continue;
      } else {
        if (svcFromIdx > loIdx || svcToIdx < hiIdx) continue;
      }

      const svcStops = svc.stops ?? [];
      if (!skipDestCheck && svcStops.length > 0) {
        const fromCode = line.stations[iFrom].code;
        const toCode   = line.stations[iTo].code;
        if (!svcStops.includes(fromCode) || !svcStops.includes(toCode)) continue;
      }

      const headwaySec = svc.headway * 60;
      const windows = svc.peakWindows
        ? svc.peakWindows.map(w => ({ from: _hmToSec(w.from), to: _hmToSec(w.to) }))
        : [{ from: _hmToSec(svc.firstDep), to: _hmToSec(svc.lastDep) }];

      const fullKm = Math.abs(line.stations[svcToIdx].km - line.stations[svcFromIdx].km);
      const fullTravelSec   = _travelSec(line, svcFromIdx, svcToIdx, fullKm);
      const fullTravelSecNB = _travelSec(line, svcToIdx, svcFromIdx, fullKm);

      for (const win of windows) {
        if (goingFwd || skipDestCheck) {
          const kmToFrom  = Math.abs(line.stations[iFrom].km - line.stations[svcFromIdx].km);
          const offsetSec = _travelSec(line, svcFromIdx, iFrom, kmToFrom);
          let t = win.from + offsetSec;
          const lastAtFrom = win.to + offsetSec;
          if (t < depSec) t += Math.ceil((depSec - t) / headwaySec) * headwaySec;
          while (t <= Math.min(lastAtFrom, depSec + SEARCH_WINDOW)) {
            allTrips.push({ sec: t, svcId: svc.id, svcDesc: svc.desc, stops: svc.stops ?? [] });
            t += headwaySec;
          }
        } else {
          const firstDepB  = win.from + fullTravelSecNB;
          const lastDepB   = win.to   + fullTravelSecNB;
          const kmToFrom   = Math.abs(line.stations[iFrom].km - line.stations[svcToIdx].km);
          const offsetSec  = _travelSec(line, svcToIdx, iFrom, kmToFrom);
          let t = firstDepB + offsetSec;
          const lastAtFrom = lastDepB + offsetSec;
          if (t < depSec) t += Math.ceil((depSec - t) / headwaySec) * headwaySec;
          while (t <= Math.min(lastAtFrom, depSec + SEARCH_WINDOW)) {
            allTrips.push({ sec: t, svcId: svc.id, svcDesc: svc.desc, stops: svc.stops ?? [] });
            t += headwaySec;
          }
        }
      }
    }

    const seen = new Set();
    return allTrips
      .filter(t => { const k = `${t.sec}|${t.svcId}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.sec - b.sec);
  }

  /* ----------------------------------------------------------------
   * _getTrips(line, iFrom, iTo, depSec)
   * FIX 9: branch TS valutato prima del fallback sintetico.
   * FIX 10: aggiunto branch KS.
   * ---------------------------------------------------------------- */
  function _getTrips(line, iFrom, iTo, depSec) {
    if (line.id === 'SK' && typeof SK_SERVICES !== 'undefined')
      return _svcTrips(SK_SERVICES, line, iFrom, iTo, depSec);
    if (line.id === 'KW' && typeof KW_SERVICES !== 'undefined')
      return _svcTrips(KW_SERVICES, line, iFrom, iTo, depSec);
    if (line.id === 'TS' && typeof TS_SERVICES !== 'undefined')
      return _svcTrips(TS_SERVICES, line, iFrom, iTo, depSec);
    if (line.id === 'KS' && typeof KS_SERVICES !== 'undefined')
      return _svcTrips(KS_SERVICES, line, iFrom, iTo, depSec);
    return _syntheticTrips(line, iFrom, depSec);
  }

  /* ----------------------------------------------------------------
   * _getExpressTrips(line, iFrom, depSec)   FIX 7+9+10
   * ---------------------------------------------------------------- */
  function _getExpressTrips(line, iFrom, depSec) {
    let raw = [];
    if (line.id === 'SK' && typeof SK_SERVICES !== 'undefined')
      raw = _svcTrips(SK_SERVICES, line, iFrom, null, depSec);
    else if (line.id === 'KW' && typeof KW_SERVICES !== 'undefined')
      raw = _svcTrips(KW_SERVICES, line, iFrom, null, depSec);
    else if (line.id === 'TS' && typeof TS_SERVICES !== 'undefined')
      raw = _svcTrips(TS_SERVICES, line, iFrom, null, depSec);
    else if (line.id === 'KS' && typeof KS_SERVICES !== 'undefined')
      raw = _svcTrips(KS_SERVICES, line, iFrom, null, depSec);
    return raw.filter(t => t.stops && t.stops.length > 0);
  }

  /* ----------------------------------------------------------------
   * _buildLeg(line, iFrom, iTo, depSec, trip?)
   * ---------------------------------------------------------------- */
  function _buildLeg(line, iFrom, iTo, depSec, trip) {
    if (!trip) {
      const trips = _getTrips(line, iFrom, iTo, depSec);
      if (!trips.length) return null;
      trip = trips[0];
    }

    const boardSec  = trip.sec;
    const svcId     = trip.svcId;
    const svcDesc   = trip.svcDesc ?? line.name;
    const svcStops  = trip.stops ?? [];

    const km        = _kmBetween(line, iFrom, iTo);
    const runSec    = _travelSec(line, iFrom, iTo, km);

    const stopCount    = line.circular
      ? 0
      : _countIntermediateStops(line, iFrom, iTo, svcStops);
    const totalTravelSec = runSec + stopCount * DWELL_SEC;
    const alightSec      = boardSec + totalTravelSec;

    const dir = line.circular
      ? _circularDir(line, iFrom, iTo)
      : (iFrom < iTo ? 'SB' : 'NB');

    let intermediateStops;
    if (line.circular) {
      intermediateStops = _circularIntermediateStops(
        line, iFrom, iTo, dir, boardSec, km, totalTravelSec
      );
    } else {
      const a = Math.min(iFrom, iTo), b = Math.max(iFrom, iTo);
      const sliced  = line.stations.slice(a + 1, b);
      const ordered = iFrom < iTo ? sliced : [...sliced].reverse();

      intermediateStops = ordered
        .filter(st => svcStops.length === 0 || svcStops.includes(st.code))
        .map(st => {
          const stIdx      = line.stations.indexOf(st);
          const kmElapsed  = Math.abs(st.km - line.stations[iFrom].km);
          const partialRun = Math.round((kmElapsed / _segSpeed(line, iFrom, stIdx)) * 3600);
          const stopsBefore = line.stations
            .slice(Math.min(iFrom, stIdx) + 1, Math.max(iFrom, stIdx))
            .filter(s => svcStops.length === 0 || svcStops.includes(s.code))
            .length;
          const arrSec = boardSec + partialRun + stopsBefore * DWELL_SEC;
          return { code: st.code, name: st.name,
                   arr: _secToHM(arrSec), dep: _secToHM(arrSec + DWELL_SEC) };
        });
    }

    return {
      lineId: line.id,
      svcId,
      svcLogical: line.id,
      svcName:    line.name,
      svcDesc,
      color:     line.color,
      cls:       'suburban',
      direction: dir,
      trainNumber: null,
      boardCode:    line.stations[iFrom].code,
      boardName:    line.stations[iFrom].name,
      boardDep:     _secToHM(boardSec),
      boardDepSec:  boardSec,
      alightCode:   line.stations[iTo].code,
      alightName:   line.stations[iTo].name,
      alightArr:    _secToHM(alightSec),
      alightArrSec: alightSec,
      km, intermediateStops,
    };
  }

  /* ----------------------------------------------------------------
   * _buildLegsAllSvcs(line, iFrom, iTo, depSec)
   * ---------------------------------------------------------------- */
  function _buildLegsAllSvcs(line, iFrom, iTo, depSec) {
    const trips = _getTrips(line, iFrom, iTo, depSec);
    if (!trips.length) return [];
    const byId = new Map();
    for (const trip of trips) {
      if (!byId.has(trip.svcId)) byId.set(trip.svcId, trip);
    }
    const legs = [];
    for (const trip of byId.values()) {
      const leg = _buildLeg(line, iFrom, iTo, depSec, trip);
      if (leg) legs.push(leg);
    }
    return legs;
  }

  /* ----------------------------------------------------------------
   * _buildIntraLineTransfers(line, iFrom, iTo, depSec)   FIX 6+7+8
   * Fase 1b: Rapid→Local intra-linea.
   * ---------------------------------------------------------------- */
  function _buildIntraLineTransfers(line, iFrom, iTo, depSec) {
    const goingFwd = iFrom < iTo;
    const lo = Math.min(iFrom, iTo);
    const hi = Math.max(iFrom, iTo);
    const toCode   = line.stations[iTo].code;
    const fromCode = line.stations[iFrom].code;

    const allExpressTrips = _getExpressTrips(line, iFrom, depSec);
    const results = [];

    for (const trip of allExpressTrips) {
      if (!trip.stops.includes(fromCode)) continue;
      if (trip.stops.includes(toCode)) continue;
      const svcLastIdx = line.stations.findIndex(s => {
        const lastStop = trip.stops[trip.stops.length - 1];
        return s.code === lastStop;
      });
      if (svcLastIdx !== -1 && svcLastIdx < lo) continue;

      const candidates = line.stations
        .slice(lo + 1, hi)
        .filter(st => trip.stops.includes(st.code));

      if (!candidates.length) continue;
      if (!goingFwd) candidates.reverse();

      for (const xferSt of candidates) {
        const iXfer = line.stations.indexOf(xferSt);

        const leg1 = _buildLeg(line, iFrom, iXfer, depSec, trip);
        if (!leg1) continue;

        const transferReadySec = leg1.alightArrSec + INTRA_TRANSFER_SEC;

        const localTrips = _getTrips(line, iXfer, iTo, transferReadySec)
          .filter(t => t.stops.length === 0 || t.stops.includes(toCode));
        if (!localTrips.length) continue;

        const leg2 = _buildLeg(line, iXfer, iTo, transferReadySec, localTrips[0]);
        if (!leg2) continue;

        const waitSec = leg2.boardDepSec - leg1.alightArrSec;
        results.push({
          legs: [leg1, leg2],
          departureTime:    leg1.boardDep,
          arrivalTime:      leg2.alightArr,
          totalMinutes:     Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
          totalKm:          leg1.km + leg2.km,
          transfers:        1,
          transferNodes:    [xferSt.code],
          transferWalkMin:  0,
          transferWaitMin:  Math.round(waitSec / 60),
        });
      }
    }
    return results;
  }

  /* ----------------------------------------------------------------
   * _buildLocalToExpressTransfers(line, iFrom, iTo, depSec)   FIX 11
   * Fase 1c: Local→Rapid intra-linea.
   * ---------------------------------------------------------------- */
  function _buildLocalToExpressTransfers(line, iFrom, iTo, depSec) {
    const goingFwd  = iFrom < iTo;
    const lo        = Math.min(iFrom, iTo);
    const hi        = Math.max(iFrom, iTo);
    const fromCode  = line.stations[iFrom].code;
    const toCode    = line.stations[iTo].code;

    const results = [];

    const svcs = typeof KW_SERVICES !== 'undefined' && line.id === 'KW' ? KW_SERVICES
               : typeof SK_SERVICES !== 'undefined' && line.id === 'SK' ? SK_SERVICES
               : typeof TS_SERVICES !== 'undefined' && line.id === 'TS' ? TS_SERVICES
               : typeof KS_SERVICES !== 'undefined' && line.id === 'KS' ? KS_SERVICES
               : null;
    if (!svcs) return [];

    const expressSvcs = svcs.filter(svc => {
      if (!svc.stops || svc.stops.length === 0) return false;
      if (!svc.stops.includes(toCode)) return false;
      if (svc.stops.includes(fromCode)) return false;
      const stCodes    = line.stations.map(s => s.code);
      const svcFromIdx = stCodes.indexOf(svc.fromCode);
      const svcToIdx   = stCodes.indexOf(svc.toCode);
      if (svcFromIdx === -1 || svcToIdx === -1) return false;
      if (svcFromIdx > lo || svcToIdx < hi) return false;
      return true;
    });

    if (!expressSvcs.length) return [];

    for (const svc of expressSvcs) {
      const candidates = line.stations
        .slice(lo + 1, hi)
        .filter(st => svc.stops.includes(st.code));

      if (!candidates.length) continue;
      if (!goingFwd) candidates.reverse();

      for (const xferSt of candidates) {
        const iXfer = line.stations.indexOf(xferSt);

        const localTrips = _getTrips(line, iFrom, iXfer, depSec)
          .filter(t => t.stops.length === 0 || t.stops.includes(xferSt.code));
        if (!localTrips.length) continue;
        const leg1 = _buildLeg(line, iFrom, iXfer, depSec, localTrips[0]);
        if (!leg1) continue;

        const transferReadySec = leg1.alightArrSec + INTRA_TRANSFER_SEC;
        const rapidTrips = _svcTrips([svc], line, iXfer, iTo, transferReadySec);
        if (!rapidTrips.length) continue;
        const leg2 = _buildLeg(line, iXfer, iTo, transferReadySec, rapidTrips[0]);
        if (!leg2) continue;

        const waitSec = leg2.boardDepSec - leg1.alightArrSec;
        results.push({
          legs: [leg1, leg2],
          departureTime:   leg1.boardDep,
          arrivalTime:     leg2.alightArr,
          totalMinutes:    Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
          totalKm:         leg1.km + leg2.km,
          transfers:       1,
          transferNodes:   [xferSt.code],
          transferWalkMin: 0,
          transferWaitMin: Math.round(waitSec / 60),
        });
        break;
      }
    }
    return results;
  }

  /* ----------------------------------------------------------------
   * _hasLoop(legs)   FIX 13
   * Restituisce true se un qualsiasi boardCode o alightCode compare
   * più di una volta nell'insieme dei codici del journey.
   * Usato come guard prima di journeys.push() nelle fasi 2–4.
   * ---------------------------------------------------------------- */
  function _hasLoop(legs) {
    const seen = new Set();
    for (const leg of legs) {
      if (seen.has(leg.boardCode) || seen.has(leg.alightCode)) return true;
      seen.add(leg.boardCode);
      seen.add(leg.alightCode);
    }
    return false;
  }

  /* ================================================================
   * search(from, to, depTime, opts)
   * ================================================================ */
  function search(from, to, depTime, opts = {}) {
    const depSec     = _hmToSec(depTime);
    const directOnly = opts.directOnly ?? false;
    const maxResults = opts.maxResults ?? MAX_JOURNEYS;
    const lineAllowed = opts.lines ? new Set(opts.lines) : null;

    const resolvedFrom = _resolveCode(from);
    const resolvedTo   = _resolveCode(to);

    const journeys = [];

    /* ---- 1a. Percorsi diretti (tutti i servizi) ---- */
// Espande from/to a tutti i codici suburbani equivalenti (stesso nodo, linea diversa)
// così KW10 "Kawayatsu" trova anche KS02 "Kawayatsu" come partenza diretta su KS.
const fromCodes = _getEquivalentCodes(resolvedFrom);
const toCodes   = _getEquivalentCodes(resolvedTo);

for (const line of Object.values(SUBURBAN_LINES)) {
  if (!line.stations.length) continue;
  if (lineAllowed && !lineAllowed.has(line.id)) continue;
  for (const fCode of fromCodes) {
    for (const tCode of toCodes) {
      if (fCode === tCode) continue;
      const iF = _idx(line, fCode);
      const iT = _idx(line, tCode);
      if (iF === -1 || iT === -1 || iF === iT) continue;
      for (const leg of _buildLegsAllSvcs(line, iF, iT, depSec)) {
        journeys.push({
          legs: [leg],
          departureTime: leg.boardDep,
          arrivalTime:   leg.alightArr,
          totalMinutes:  Math.round((leg.alightArrSec - leg.boardDepSec) / 60),
          totalKm:       leg.km,
          transfers:     0,
          transferNodes: [],
        });
      }
    }
  }
}

    /* ---- 1b. Rapid→Local intra-linea ---- */
for (const line of Object.values(SUBURBAN_LINES)) {
  if (!line.stations.length) continue;
  if (lineAllowed && !lineAllowed.has(line.id)) continue;
  for (const fCode of fromCodes) {
    for (const tCode of toCodes) {
      if (fCode === tCode) continue;
      const iF = _idx(line, fCode);
      const iT = _idx(line, tCode);
      if (iF === -1 || iT === -1 || iF === iT) continue;
      for (const j of _buildIntraLineTransfers(line, iF, iT, depSec)) {
        journeys.push(j);
      }
    }
  }
}

/* ---- 1c. Local→Rapid intra-linea ---- */
if (!directOnly) {
  for (const line of Object.values(SUBURBAN_LINES)) {
    if (!line.stations.length) continue;
    if (lineAllowed && !lineAllowed.has(line.id)) continue;
    for (const fCode of fromCodes) {
      for (const tCode of toCodes) {
        if (fCode === tCode) continue;
        const iF = _idx(line, fCode);
        const iT = _idx(line, tCode);
        if (iF === -1 || iT === -1 || iF === iT) continue;
        for (const j of _buildLocalToExpressTransfers(line, iF, iT, depSec)) {
          journeys.push(j);
        }
      }
    }
  }
}

    /* ---- 2. Percorsi Suburbano → IZX/AX ---- */
    if (!directOnly && typeof IZXRouter !== 'undefined') {
      for (const line of Object.values(SUBURBAN_LINES)) {
        if (!line.stations.length) continue;
        if (lineAllowed && !lineAllowed.has(line.id)) continue;
        const iF = _idx(line, resolvedFrom);
        if (iF === -1) continue;
        for (const subNode of line.stations) {
          const izxPartners = SUBURBAN_INTERCHANGE[subNode.code];
          if (!izxPartners) continue;
          const iMid = _idx(line, subNode.code);
          if (iMid === -1 || iMid === iF) continue;
          const leg1 = _buildLeg(line, iF, iMid, depSec);
          if (!leg1) continue;
          const transferReadySec = leg1.alightArrSec + CROSS_TRANSFER_SEC;
          for (const p of izxPartners) {
            const izxNode = (typeof p === 'object' && p !== null) ? p.code : p;
            if (_isMetroCode(izxNode)) continue;
            for (const [lineId2, line2] of Object.entries(IZX_LINES)) {
              if (!line2.ST[izxNode] || !line2.ST[to]) continue;
              for (const svcId2 of Object.keys(line2.SVC)) {
                if (!line2.TT[svcId2]) continue;
                const leg2 = IZXRouter.buildLeg?.(lineId2, svcId2, izxNode, to, transferReadySec);
                if (!leg2) continue;
                if (_hasLoop([leg1, leg2])) continue;
                const waitSec = leg2.boardDepSec - leg1.alightArrSec;
                const totalKm = (leg1.km != null && leg2.km != null) ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
                journeys.push({
                  legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
                  totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
                  totalKm, transfers: 1, transferNodes: [subNode.code],
                  transferWaitMin: Math.round(waitSec / 60),
                });
              }
            }
          }
        }
      }
    }

    /* ---- 2b. Percorsi Suburbano → Metro ---- */
    if (!directOnly && typeof MetroRouter !== 'undefined') {
      for (const line of Object.values(SUBURBAN_LINES)) {
        if (!line.stations.length) continue;
        if (lineAllowed && !lineAllowed.has(line.id)) continue;
        const iF = _idx(line, resolvedFrom);
        if (iF === -1) continue;
        for (const subNode of line.stations) {
          const partners = SUBURBAN_INTERCHANGE[subNode.code];
          if (!partners) continue;
          const metroPartners = partners
            .map(p => (typeof p === 'object' && p !== null) ? p.code : p)
            .filter(_isMetroCode);
          if (!metroPartners.length) continue;
          const iMid = _idx(line, subNode.code);
          if (iMid === -1 || iMid === iF) continue;
          const leg1 = _buildLeg(line, iF, iMid, depSec);
          if (!leg1) continue;
          for (const metroNode of metroPartners) {
            const isThru = _isThruNode(subNode.code, metroNode);
            const xferSec = isThru ? THRU_TRANSFER_SEC : CROSS_TRANSFER_SEC;
            const transferReadySec = leg1.alightArrSec + xferSec;
            const _mResult2 = MetroRouter.buildMultiLeg?.(metroNode, to, transferReadySec);
            if (!_mResult2) continue;
            const leg2 = _mResult2.legs.at(-1);
            if (!leg2) continue;
            if (_hasLoop([leg1, leg2])) continue;
            const waitSec = leg2.boardDepSec - leg1.alightArrSec;
            const totalKm = (leg1.km != null && leg2.km != null) ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
            journeys.push({
              legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
              totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
              totalKm, transfers: 1, transferNodes: [metroNode],
              transferWaitMin: Math.round(waitSec / 60),
              thruService: isThru,
              thruNode: isThru ? subNode.code : undefined,
            });
          }
        }
      }
    }

    /* ---- 3. Percorsi IZX/AX → Suburbano ---- */
    if (!directOnly && typeof IZXRouter !== 'undefined') {
      for (const line of Object.values(SUBURBAN_LINES)) {
        if (!line.stations.length) continue;
        if (lineAllowed && !lineAllowed.has(line.id)) continue;
        const iT = _idx(line, resolvedTo);
        if (iT === -1) continue;
        for (const subNode of line.stations) {
          const izxPartners = SUBURBAN_INTERCHANGE[subNode.code];
          if (!izxPartners) continue;
          const iMid = _idx(line, subNode.code);
          if (iMid === -1 || iMid === iT) continue;
          for (const p of izxPartners) {
            const izxNode = (typeof p === 'object' && p !== null) ? p.code : p;
            if (_isMetroCode(izxNode)) continue;
            for (const [lineId1, line1] of Object.entries(IZX_LINES)) {
              if (!line1.ST[from] || !line1.ST[izxNode]) continue;
              for (const svcId1 of Object.keys(line1.SVC)) {
                if (!line1.TT[svcId1]) continue;
                const leg1 = IZXRouter.buildLeg?.(lineId1, svcId1, from, izxNode, depSec);
                if (!leg1) continue;
                const transferReadySec = leg1.alightArrSec + CROSS_TRANSFER_SEC;
                const leg2 = _buildLeg(line, iMid, iT, transferReadySec);
                if (!leg2) continue;
                if (_hasLoop([leg1, leg2])) continue;
                const waitSec = leg2.boardDepSec - leg1.alightArrSec;
                const totalKm = (leg1.km != null && leg2.km != null) ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
                journeys.push({
                  legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
                  totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
                  totalKm, transfers: 1, transferNodes: [izxNode],
                  transferWaitMin: Math.round(waitSec / 60),
                });
              }
            }
          }
        }
      }
    }

    /* ---- 3b. Percorsi Metro → Suburbano ---- */
    if (!directOnly && typeof MetroRouter !== 'undefined') {
      for (const line of Object.values(SUBURBAN_LINES)) {
        if (!line.stations.length) continue;
        if (lineAllowed && !lineAllowed.has(line.id)) continue;
        const iT = _idx(line, resolvedTo);
        if (iT === -1) continue;
        for (const subNode of line.stations) {
          const partners = SUBURBAN_INTERCHANGE[subNode.code];
          if (!partners) continue;
          const metroPartners = partners
            .map(p => (typeof p === 'object' && p !== null) ? p.code : p)
            .filter(_isMetroCode);
          if (!metroPartners.length) continue;
          const iMid = _idx(line, subNode.code);
          if (iMid === -1 || iMid === iT) continue;
          for (const metroNode of metroPartners) {
            const _mResult1 = MetroRouter.buildMultiLeg?.(from, metroNode, depSec);
            if (!_mResult1) continue;
            const leg1 = _mResult1.legs.at(-1);
            if (!leg1) continue;
            const isThru = _isThruNode(subNode.code, metroNode);
            const xferSec = isThru ? THRU_TRANSFER_SEC : CROSS_TRANSFER_SEC;
            const transferReadySec = leg1.alightArrSec + xferSec;
            const leg2 = _buildLeg(line, iMid, iT, transferReadySec);
            if (!leg2) continue;
            if (_hasLoop([leg1, leg2])) continue;
            const waitSec = leg2.boardDepSec - leg1.alightArrSec;
            const totalKm = (leg1.km != null && leg2.km != null) ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
            journeys.push({
              legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
              totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
              totalKm, transfers: 1, transferNodes: [metroNode],
              transferWaitMin: Math.round(waitSec / 60),
              thruService: isThru,
              thruNode: isThru ? subNode.code : undefined,
            });
          }
        }
      }
    }

   /* ---- 4. Percorsi Suburbano → Suburbano (cross-line) ---- */
if (!directOnly) {
  const subPartnerMap = _getSuburbanPartnerMap();
  for (const line of Object.values(SUBURBAN_LINES)) {
    if (!line.stations.length) continue;
    if (lineAllowed && !lineAllowed.has(line.id)) continue;

    // Espandi resolvedFrom a tutti i codici equivalenti (come nelle fasi 1a/b/c)
    const iF_candidates = fromCodes
      .map(c => _idx(line, c))
      .filter(i => i !== -1);
    if (!iF_candidates.length) continue;
    const iF = iF_candidates[0];

    for (const subNode of line.stations) {
      const partners = subPartnerMap[subNode.code];
      if (!partners || !partners.length) continue;
      const iMid = _idx(line, subNode.code);
      if (iMid === -1 || iMid === iF) continue;

      const legs1 = _buildLegsAllSvcs(line, iF, iMid, depSec);
      if (!legs1.length) continue;

      for (const leg1 of legs1) {
        const xferSec = _subTransferSec(subNode.code, partners[0]);
        const transferReadySec = leg1.alightArrSec + xferSec;

        for (const partnerCode of partners) {
          for (const line2 of Object.values(SUBURBAN_LINES)) {
            if (line2.id === line.id) continue;
            if (!line2.stations.length) continue;
            const iMid2 = _idx(line2, partnerCode);
            if (iMid2 === -1) continue;

            // Espandi resolvedTo a tutti i codici equivalenti sulla line2
            const iT2_candidates = toCodes
              .map(c => _idx(line2, c))
              .filter(i => i !== -1 && i !== iMid2);
            if (!iT2_candidates.length) continue;
            const iT2 = iT2_candidates[0];

            for (const leg2 of _buildLegsAllSvcs(line2, iMid2, iT2, transferReadySec)) {
              if (_hasLoop([leg1, leg2])) continue;
              const waitSec = leg2.boardDepSec - leg1.alightArrSec;
              const totalKm = (leg1.km != null && leg2.km != null)
                ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
              journeys.push({
                legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
                totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
                totalKm, transfers: 1, transferNodes: [subNode.code],
                transferWaitMin: Math.round(waitSec / 60),
              });
            }
          }
        }
      }
    }
  }
}
    /* ---- Deduplica e sort (FIX 12) ---- */
    const seen = new Set();
    const unique = journeys.filter(j => {
      const k = `${j.departureTime}|${j.arrivalTime}|${j.legs.map(l => l.svcLogical ?? l.svcId).join('+')}|${j.transfers}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return unique
      .sort((a, b) => {
        const da = _hmToSec(a.departureTime), db = _hmToSec(b.departureTime);
        if (da !== db) return da - db;
        return a.totalMinutes - b.totalMinutes;
      })
      .slice(0, maxResults);
  }

  /* ----------------------------------------------------------------
   * stationName(code)
   * ---------------------------------------------------------------- */
  function stationName(code) {
    for (const line of Object.values(SUBURBAN_LINES)) {
      const st = line.stations.find(s => s.code === code);
      if (st) return st.name;
    }
    return code;
  }

  /* ----------------------------------------------------------------
   * allStations()
   * ---------------------------------------------------------------- */
  function allStations() {
    const seen = new Set();
    const out  = [];
    for (const line of Object.values(SUBURBAN_LINES)) {
      for (const st of line.stations) {
        if (!seen.has(st.code)) {
          seen.add(st.code);
          out.push({ code: st.code, name: st.name, kanji: st.kanji ?? '' });
        }
      }
    }
    return out;
  }

  /* ----------------------------------------------------------------
   * buildLeg(lineId, svcId, from, to, depSec)
   * ---------------------------------------------------------------- */
  function buildLeg(lineId, svcId, from, to, depSec) {
    const line = SUBURBAN_LINES[lineId];
    if (!line) return null;
    const iFrom = _idx(line, from);
    const iTo   = _idx(line, to);
    if (iFrom === -1 || iTo === -1 || iFrom === iTo) return null;
    const trips = _getTrips(line, iFrom, iTo, depSec)
      .filter(t => !svcId || t.svcId === svcId);
    if (!trips.length) return null;
    return _buildLeg(line, iFrom, iTo, depSec, trips[0]);
  }

  return {
    search,
    stationName,
    allStations,
    buildLeg,
    TRANSFER_MIN,
  };

})();

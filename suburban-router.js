/* ================================================================
   SUBURBAN-ROUTER.JS — Izarail Suburban Journey Planner
   Dipende da: suburban-data.js (SUBURBAN_LINES, SUBURBAN_INTERCHANGE,
                                  SK_SERVICES, KW_SERVICES)

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

   Sottoservizi SK / KW:
     Le linee SK e KW usano rispettivamente SK_SERVICES e KW_SERVICES
     invece del singolo headway di linea. _svcTrips() gestisce
     entrambi; per SK usa la logica A↔B con firstDep/lastDep;
     per linee prive di *_SERVICES si usa _syntheticTrips().

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

   Tempi di trasferimento:
     TRANSFER_MIN            3 min  — interscambio suburban ↔ suburban
     CROSS_TRANSFER_MIN     10 min  — interscambio suburbana ↔ IZX/AX/Metro
     THRU_TRANSFER_MIN       2 min  — thru-service KW↔Metro (solo cambio operatore)
================================================================ */
'use strict';

const SuburbanRouter = (() => {

  const TRANSFER_MIN        = 3;
  const CROSS_TRANSFER_MIN  = 10;
  const THRU_TRANSFER_MIN   = 2;   // thru-service: cambio operatore senza scendere
  const TRANSFER_SEC        = TRANSFER_MIN       * 60;
  const CROSS_TRANSFER_SEC  = CROSS_TRANSFER_MIN * 60;
  const THRU_TRANSFER_SEC   = THRU_TRANSFER_MIN  * 60;
  const MAX_JOURNEYS  = 5;
  const SEARCH_WINDOW = 3 * 3600;
  const AVG_SPEED_KMH = 40;   // fallback globale per linee senza segSpeedKmh
  const DWELL_SEC     = 30;

  /* ----------------------------------------------------------------
   * _isMetroCode(code)
   * Restituisce true se il codice appartiene alla rete Metro (M + cifre).
   * ---------------------------------------------------------------- */
  function _isMetroCode(code) {
    return /^M\d/.test(code);
  }

  /* ----------------------------------------------------------------
   * _isThruNode(subCode, metroCode)
   * Restituisce true se la coppia subCode↔metroCode è un thru-service
   * (il treno prosegue senza che i passeggeri debbano scendere).
   * Attualmente: KW00 ↔ M801 (Kwōkei Line ↔ Metro Line 8).
   * ---------------------------------------------------------------- */
  const THRU_PAIRS = new Set(['KW00|M801', 'M801|KW00']);
  function _isThruNode(subCode, metroCode) {
    return THRU_PAIRS.has(`${subCode}|${metroCode}`);
  }

  /* ----------------------------------------------------------------
   * _segSpeed(line, iFrom, iTo)
   * Restituisce la velocità media km/h per il tragitto iFrom→iTo
   * pesando i segSpeedKmh di ogni segmento attraversato.
   * Se nessun segmento ha segSpeedKmh usa AVG_SPEED_KMH.
   * Funziona sia in direzione crescente che decrescente.
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
      for (const p of partners) _add(key, p);
    }
    _suburbanPartnerMap = {};
    for (const [k, v] of Object.entries(map)) _suburbanPartnerMap[k] = [...v];
    return _suburbanPartnerMap;
  }

  let _inverseMap = null;
  function _getInverseMap() {
    if (_inverseMap) return _inverseMap;
    _inverseMap = {};
    for (const [subCode, partners] of Object.entries(SUBURBAN_INTERCHANGE)) {
      for (const izxCode of partners) {
        if (!_inverseMap[izxCode]) _inverseMap[izxCode] = subCode;
      }
    }
    return _inverseMap;
  }

  function _resolveCode(code) {
    return _getInverseMap()[code] ?? code;
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
           String(Math.floor((s % 3600) / 60)).padStart(2, '0');
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

  function _circularIntermediateStops(line, iFrom, iTo, dir, boardSec, legKm) {
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
    const travelSec = _travelSec(line, iFrom, iTo, legKm);
    return seq.map(idx => {
      const kmElapsed = _kmFromStart(idx);
      const arrSec    = boardSec + Math.round((kmElapsed / legKm) * travelSec);
      return { code: sts[idx].code, name: sts[idx].name,
               arr: _secToHM(arrSec), dep: _secToHM(arrSec + DWELL_SEC) };
    });
  }

  /* ----------------------------------------------------------------
   * _syntheticTrips(line, iFrom, depSec)
   * Per linee senza *_SERVICES. Restituisce array di {sec, svcId, stops}.
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
   * Genera partenze usando un array *_SERVICES (SK o KW).
   * FIX: restituisce array di {sec, svcId, svcDesc, stops} in modo
   * che _buildLeg() conosca il tipo di servizio e le fermate.
   * ---------------------------------------------------------------- */
  function _svcTrips(services, line, iFrom, iTo, depSec) {
    const stCodes  = line.stations.map(s => s.code);
    const goingFwd = iFrom <= iTo;
    const loIdx    = Math.min(iFrom, iTo);
    const hiIdx    = Math.max(iFrom, iTo);
    const allTrips = [];

    for (const svc of services) {
      const svcFromIdx = stCodes.indexOf(svc.fromCode);
      const svcToIdx   = stCodes.indexOf(svc.toCode);
      if (svcFromIdx === -1 || svcToIdx === -1) continue;
      if (svcFromIdx > loIdx || svcToIdx < hiIdx) continue;

      // Per servizi con stops[] non vuoto verifica che le stazioni
      // di origine e destinazione siano incluse nella lista fermate.
      const svcStops = svc.stops ?? [];
      if (svcStops.length > 0) {
        const fromCode = line.stations[iFrom].code;
        const toCode   = line.stations[iTo].code;
        if (!svcStops.includes(fromCode) || !svcStops.includes(toCode)) continue;
      }

      const headwaySec = svc.headway * 60;
      const windows = svc.peakWindows
        ? svc.peakWindows.map(w => ({ from: _hmToSec(w.from), to: _hmToSec(w.to) }))
        : [{ from: _hmToSec(svc.firstDep), to: _hmToSec(svc.lastDep) }];

      const fullKm        = Math.abs(line.stations[svcToIdx].km - line.stations[svcFromIdx].km);
      const fullTravelSec = _travelSec(line, svcFromIdx, svcToIdx, fullKm);

      for (const win of windows) {
        if (goingFwd) {
          const kmToFrom  = Math.abs(line.stations[iFrom].km - line.stations[svcFromIdx].km);
          const offsetSec = _travelSec(line, svcFromIdx, iFrom, kmToFrom);
          let t = win.from + offsetSec;
          const lastAtFrom = win.to + offsetSec;
          if (t < depSec) t += Math.ceil((depSec - t) / headwaySec) * headwaySec;
          while (t <= Math.min(lastAtFrom, depSec + SEARCH_WINDOW)) {
            allTrips.push({ sec: t, svcId: svc.id, svcDesc: svc.desc, stops: svcStops });
            t += headwaySec;
          }
        } else {
          const firstDepB  = win.from + fullTravelSec;
          const lastDepB   = win.to   + fullTravelSec;
          const kmToFrom   = Math.abs(line.stations[iFrom].km - line.stations[svcToIdx].km);
          const offsetSec  = _travelSec(line, svcToIdx, iFrom, kmToFrom);
          let t = firstDepB + offsetSec;
          const lastAtFrom = lastDepB + offsetSec;
          if (t < depSec) t += Math.ceil((depSec - t) / headwaySec) * headwaySec;
          while (t <= Math.min(lastAtFrom, depSec + SEARCH_WINDOW)) {
            allTrips.push({ sec: t, svcId: svc.id, svcDesc: svc.desc, stops: svcStops });
            t += headwaySec;
          }
        }
      }
    }

    // Deduplicazione per (sec, svcId) e ordinamento per orario
    const seen = new Set();
    return allTrips
      .filter(t => { const k = `${t.sec}|${t.svcId}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.sec - b.sec);
  }

  /* ----------------------------------------------------------------
   * _getTrips(line, iFrom, iTo, depSec)
   * Dispatcher. Restituisce array di {sec, svcId, svcDesc, stops}.
   * ---------------------------------------------------------------- */
  function _getTrips(line, iFrom, iTo, depSec) {
    if (line.id === 'SK' && typeof SK_SERVICES !== 'undefined')
      return _svcTrips(SK_SERVICES, line, iFrom, iTo, depSec);
    if (line.id === 'KW' && typeof KW_SERVICES !== 'undefined')
      return _svcTrips(KW_SERVICES, line, iFrom, iTo, depSec);
    return _syntheticTrips(line, iFrom, depSec);
  }

  /* ----------------------------------------------------------------
   * _buildLeg(line, iFrom, iTo, depSec, trip?)
   * FIX: accetta un trip opzionale {sec, svcId, svcDesc, stops}.
   * Se non fornito usa il primo disponibile (comportamento legacy).
   * Filtra le intermediateStops in base alle fermate del servizio.
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
    const svcStops  = trip.stops ?? [];  // [] = locale (ferma ovunque)

    const km        = _kmBetween(line, iFrom, iTo);
    const travelSec = _travelSec(line, iFrom, iTo, km);
    const alightSec = boardSec + travelSec;

    const dir = line.circular
      ? _circularDir(line, iFrom, iTo)
      : (iFrom < iTo ? 'SB' : 'NB');

    let intermediateStops;
    if (line.circular) {
      intermediateStops = _circularIntermediateStops(line, iFrom, iTo, dir, boardSec, km);
    } else {
      const a = Math.min(iFrom, iTo), b = Math.max(iFrom, iTo);
      const sliced  = line.stations.slice(a + 1, b);
      const ordered = iFrom < iTo ? sliced : [...sliced].reverse();

      intermediateStops = ordered
        // Se il servizio ha una lista stops esplicita, includi solo
        // le stazioni in quella lista (treni Rapid / Commuter Rapid).
        // Lista vuota = locale, ferma in tutte le stazioni.
        .filter(st => svcStops.length === 0 || svcStops.includes(st.code))
        .map(st => {
          const kmElapsed  = Math.abs(st.km - line.stations[iFrom].km);
          const stIdx      = line.stations.indexOf(st);
          const partialSpd = _segSpeed(line, iFrom, stIdx);
          const arrSec     = boardSec + Math.round((kmElapsed / partialSpd) * 3600);
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
   * FIX Rapid: costruisce un leg per ogni svcId distinto disponibile
   * nell'arco depSec..depSec+SEARCH_WINDOW, invece di prendere solo
   * il primo trip in assoluto. Ritorna array di leg (uno per svcId).
   * ---------------------------------------------------------------- */
  function _buildLegsAllSvcs(line, iFrom, iTo, depSec) {
    const trips = _getTrips(line, iFrom, iTo, depSec);
    if (!trips.length) return [];

    // Raggruppa per svcId e prendi il primo trip di ogni gruppo
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

  function _lineFilter(opts) {
    const raw = opts.lines;
    if (!raw || raw === 'ALL') return null;
    return new Set(Array.isArray(raw) ? raw : [raw]);
  }

  /* ================================================================
   * search(from, to, depTime, opts)
   * ================================================================ */
  function search(from, to, depTime, opts = {}) {
    const resolvedFrom = _resolveCode(from);
    const resolvedTo   = _resolveCode(to);
    const maxResults   = opts.maxResults ?? MAX_JOURNEYS;
    const directOnly   = !!opts.directOnly;
    const depSec       = _hmToSec(depTime);
    const lineAllowed  = _lineFilter(opts);
    const journeys     = [];

    /* ---- 1. Percorsi DIRETTI ---- */
    /* FIX Rapid: _buildLegsAllSvcs() genera un journey per svcId distinto
       (W1 Local, W3 Rapid, W4 Commuter Rapid appaiono separatamente). */
    for (const line of Object.values(SUBURBAN_LINES)) {
      if (!line.stations.length) continue;
      if (lineAllowed && !lineAllowed.has(line.id)) continue;
      const iF = _idx(line, resolvedFrom);
      const iT = _idx(line, resolvedTo);
      if (iF === -1 || iT === -1 || iF === iT) continue;
      const legs = _buildLegsAllSvcs(line, iF, iT, depSec);
      for (const leg of legs) {
        journeys.push({
          legs: [leg], departureTime: leg.boardDep, arrivalTime: leg.alightArr,
          totalMinutes: Math.round((leg.alightArrSec - leg.boardDepSec) / 60),
          totalKm: leg.km, transfers: 0, transferNodes: [],
        });
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
          for (const izxNode of izxPartners) {
            if (_isMetroCode(izxNode)) continue;  // gestito in fase 2b
            for (const [lineId2, line2] of Object.entries(IZX_LINES)) {
              if (!line2.ST[izxNode] || !line2.ST[to]) continue;
              for (const svcId2 of Object.keys(line2.SVC)) {
                if (!line2.TT[svcId2]) continue;
                const leg2 = IZXRouter.buildLeg?.(lineId2, svcId2, izxNode, to, transferReadySec);
                if (!leg2) continue;
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
          const metroPartners = partners.filter(_isMetroCode);
          if (!metroPartners.length) continue;
          const iMid = _idx(line, subNode.code);
          if (iMid === -1 || iMid === iF) continue;
          const leg1 = _buildLeg(line, iF, iMid, depSec);
          if (!leg1) continue;
          for (const metroNode of metroPartners) {
            const isThru = _isThruNode(subNode.code, metroNode);
            const xferSec = isThru ? THRU_TRANSFER_SEC : CROSS_TRANSFER_SEC;
            const transferReadySec = leg1.alightArrSec + xferSec;
            const leg2 = MetroRouter.buildLeg?.(metroNode, to, transferReadySec);
            if (!leg2) continue;
            const waitSec = leg2.boardDepSec - leg1.alightArrSec;
            const totalKm = (leg1.km != null && leg2.km != null) ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
            journeys.push({
              legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
              totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
              totalKm, transfers: 1, transferNodes: [subNode.code],
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
          for (const izxNode of izxPartners) {
            if (_isMetroCode(izxNode)) continue;  // gestito in fase 3b
            for (const [lineId1, line1] of Object.entries(IZX_LINES)) {
              if (!line1.ST[from] || !line1.ST[izxNode]) continue;
              for (const svcId1 of Object.keys(line1.SVC)) {
                if (!line1.TT[svcId1]) continue;
                const leg1 = IZXRouter.buildLeg?.(lineId1, svcId1, from, izxNode, depSec);
                if (!leg1) continue;
                const transferReadySec = leg1.alightArrSec + CROSS_TRANSFER_SEC;
                const leg2 = _buildLeg(line, iMid, iT, transferReadySec);
                if (!leg2) continue;
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
          const metroPartners = partners.filter(_isMetroCode);
          if (!metroPartners.length) continue;
          const iMid = _idx(line, subNode.code);
          if (iMid === -1 || iMid === iT) continue;
          for (const metroNode of metroPartners) {
            const leg1 = MetroRouter.buildLeg?.(from, metroNode, depSec);
            if (!leg1) continue;
            const isThru = _isThruNode(subNode.code, metroNode);
            const xferSec = isThru ? THRU_TRANSFER_SEC : CROSS_TRANSFER_SEC;
            const transferReadySec = leg1.alightArrSec + xferSec;
            const leg2 = _buildLeg(line, iMid, iT, transferReadySec);
            if (!leg2) continue;
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
      const subMap = _getSuburbanPartnerMap();
      for (const line1 of Object.values(SUBURBAN_LINES)) {
        if (!line1.stations.length) continue;
        if (lineAllowed && !lineAllowed.has(line1.id)) continue;
        const iF = _idx(line1, resolvedFrom);
        if (iF === -1) continue;

        for (const subNode of line1.stations) {
          const partners = subMap[subNode.code];
          if (!partners?.length) continue;
          const iMid = _idx(line1, subNode.code);
          if (iMid === -1 || iMid === iF) continue;

          const leg1 = _buildLeg(line1, iF, iMid, depSec);
          if (!leg1) continue;
          const transferReadySec = leg1.alightArrSec + TRANSFER_SEC;

          for (const partnerCode of partners) {
            for (const line2 of Object.values(SUBURBAN_LINES)) {
              if (!line2.stations.length) continue;
              if (line2.id === line1.id) continue;
              if (lineAllowed && !lineAllowed.has(line2.id)) continue;
              const iMid2 = _idx(line2, partnerCode);
              const iT    = _idx(line2, resolvedTo);
              if (iMid2 === -1 || iT === -1 || iMid2 === iT) continue;
              const leg2 = _buildLeg(line2, iMid2, iT, transferReadySec);
              if (!leg2) continue;
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

    /* ---- deduplicazione e ordinamento ---- */
    const seen = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l => `${l.lineId}:${l.svcId}:${l.boardDep}:${l.alightArr}`).join('|');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    unique.sort((a, b) => {
      const da = _hmToSec(a.arrivalTime), db = _hmToSec(b.arrivalTime);
      if (da !== db) return da - db;
      return a.transfers - b.transfers;
    });
    return unique.slice(0, maxResults);
  }

  /* ================================================================
   * stationName / allStations / lineColor
   * ================================================================ */
  function stationName(code) {
    const resolved = _resolveCode(code);
    for (const line of Object.values(SUBURBAN_LINES)) {
      const st = line.stations.find(s => s.code === resolved);
      if (st) return st.name;
    }
    return code;
  }

  function allStations() {
    const seen = new Set(), out = [];
    for (const line of Object.values(SUBURBAN_LINES)) {
      for (const st of line.stations) {
        if (seen.has(st.code)) continue;
        seen.add(st.code);
        out.push({ ...st, lineId: line.id });
      }
    }
    return out;
  }

  function lineColor(lineId) {
    return SUBURBAN_LINES[lineId]?.color ?? '#888';
  }

  return { search, stationName, allStations, lineColor, TRANSFER_MIN, CROSS_TRANSFER_MIN, THRU_TRANSFER_MIN };

})();

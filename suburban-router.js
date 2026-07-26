/* ================================================================
   SUBURBAN-ROUTER.JS — Izarail Suburban Journey Planner
   Dipende da: suburban-data.js (SUBURBAN_LINES, SUBURBAN_INTERCHANGE,
                                  SK_SERVICES)

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

   Sottoservizi SK (Seishaku Line):
     La linea SK usa SK_SERVICES invece del singolo headway di linea.
     _skTrips(iFrom, iTo, depSec) trova tutti i sottoservizi che
     coprono sia iFrom che iTo, ne genera le partenze nell'arco
     di SEARCH_WINDOW e restituisce un array ordinato di secondi.
     Per le linee prive di SK_SERVICES si usa _syntheticTrips() come prima.

   Risoluzione alias:
     Prima di qualsiasi ricerca, _resolveCode() controlla se il codice
     passato è un nodo IZX/AX che ha un alias suburbano in
     SUBURBAN_INTERCHANGE (mappa inversa). Se sì, lo sostituisce con
     il codice suburbano equivalente.

   Mappa interscambio suburbana (fase 4):
     SUBURBAN_INTERCHANGE è unidirezionale per design: le coppie LL↔KD
     hanno sempre la chiave sul lato KD (es. KD26: ['LL10']).\
     _getSuburbanPartnerMap() costruisce una mappa bidirezionale
     subCode → [subPartner, ...] considerando entrambi i versi,
     filtrata ai soli codici che appartengono effettivamente a una
     linea suburbana (esclude codici IZX/AX come K01, R01, AX06...).

   Tempi di trasferimento:
     TRANSFER_MIN            3 min  — interscambio suburban ↔ suburban
     CROSS_TRANSFER_MIN     10 min  — interscambio suburbana ↔ IZX/AX

   Fermate intermedie (circolari):
     CW  = indici crescenti (con wrap-around da LL19 a LL01)
     CCW = indici decrescenti (con wrap-around da LL01 a LL19)

   Nota timetable:
     Orari sintetici basati su headway fisso e km proporzionali.
================================================================ */
'use strict';

const SuburbanRouter = (() => {

  const TRANSFER_MIN       = 3;   // suburban ↔ suburban (stesso edificio/banchine vicine)
  const CROSS_TRANSFER_MIN = 10;  // suburban ↔ IZX/AX
  const TRANSFER_SEC       = TRANSFER_MIN       * 60;
  const CROSS_TRANSFER_SEC = CROSS_TRANSFER_MIN * 60;
  const MAX_JOURNEYS  = 5;
  const SEARCH_WINDOW = 3 * 3600;
  const AVG_SPEED_KMH = 40;
  const DWELL_SEC     = 30;

  /* ----------------------------------------------------------------
   * _suburbansCodeSet()
   * Insieme di tutti i codici stazione delle linee suburbane.
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
   * Mappa bidirezionale subCode → [subPartnerCode, ...]
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
      for (const p of partners) _add(key, p);
    }
    _suburbanPartnerMap = {};
    for (const [k, v] of Object.entries(map)) _suburbanPartnerMap[k] = [...v];
    return _suburbanPartnerMap;
  }

  /* ----------------------------------------------------------------
   * _getInverseMap()
   * Mappa inversa IZX/AX → codice suburbano equivalente.
   * ---------------------------------------------------------------- */
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
    const travelSec = Math.round((legKm / AVG_SPEED_KMH) * 3600);
    return seq.map(idx => {
      const kmElapsed = _kmFromStart(idx);
      const arrSec    = boardSec + Math.round((kmElapsed / legKm) * travelSec);
      return { code: sts[idx].code, name: sts[idx].name,
               arr: _secToHM(arrSec), dep: _secToHM(arrSec + DWELL_SEC) };
    });
  }

  /* ----------------------------------------------------------------
   * _syntheticTrips(line, iFrom, depSec)
   * Genera partenze da iFrom per le linee che usano headwayPeak/OffPeak.
   * NON usata per SK (usa _skTrips invece).
   * ---------------------------------------------------------------- */
  function _syntheticTrips(line, iFrom, depSec) {
    const PEAK_START  = 7 * 3600,  PEAK_END1   = 9  * 3600;
    const PEAK_START2 = 17 * 3600, PEAK_END2   = 20 * 3600;
    const isPeak = (depSec >= PEAK_START && depSec < PEAK_END1) ||
                   (depSec >= PEAK_START2 && depSec < PEAK_END2);
    const headwaySec = (isPeak ? line.headwayPeak : line.headwayOffPeak) * 60;
    const firstDep   = Math.ceil(depSec / headwaySec) * headwaySec;
    const trips = [];
    let t = firstDep;
    while (t <= depSec + SEARCH_WINDOW) { trips.push(t); t += headwaySec; }
    return trips;
  }

  /* ----------------------------------------------------------------
   * _skTrips(line, iFrom, iTo, depSec)
   * Genera partenze per la Seishaku Line usando SK_SERVICES.
   * Trova tutti i sottoservizi che coprono sia iFrom che iTo,
   * poi combina tutte le partenze valide nell'arco SEARCH_WINDOW.
   *
   * Gestione bidirezionale:
   *   - Direzione A→B (iFrom < iTo, o comunque fromIdx ≤ iFrom e toIdx ≥ iTo):
   *     usa firstDep/lastDep dal capolinea A.
   *   - Direzione B→A (iFrom > iTo, o comunque toIdx ≤ iFrom e fromIdx ≥ iTo):
   *     il capolinea B non ha un firstDep esplicito; si stima aggiungendo
   *     il tempo di percorrenza A→B a firstDep del capolinea A.
   *     In pratica si usa lo stesso schema di corse sfasato di travelTimeFull.
   * ---------------------------------------------------------------- */
  function _skTrips(line, iFrom, iTo, depSec) {
    if (typeof SK_SERVICES === 'undefined') return _syntheticTrips(line, iFrom, depSec);

    const stCodes = line.stations.map(s => s.code);
    const goingFwd = iFrom <= iTo; // true = direzione SK01→SK58
    const loIdx = Math.min(iFrom, iTo);
    const hiIdx = Math.max(iFrom, iTo);

    const allDeps = [];

    for (const svc of SK_SERVICES) {
      const svcFromIdx = stCodes.indexOf(svc.fromCode);
      const svcToIdx   = stCodes.indexOf(svc.toCode);
      if (svcFromIdx === -1 || svcToIdx === -1) continue;

      // Il servizio copre la tratta richiesta?
      if (svcFromIdx > loIdx || svcToIdx < hiIdx) continue;

      const headwaySec   = svc.headway * 60;
      const firstDepSec  = _hmToSec(svc.firstDep);
      const lastDepSec   = _hmToSec(svc.lastDep);

      // Calcola offset capolinea B (per corse B→A)
      const fullKm       = Math.abs(line.stations[svcToIdx].km - line.stations[svcFromIdx].km);
      const fullTravelSec = Math.round((fullKm / AVG_SPEED_KMH) * 3600);

      if (goingFwd) {
        // Corse A→B: partono da svcFromCode
        // L'orario rilevante al punto iFrom è firstDep + tempo da svcFromIdx a iFrom
        const kmToFrom = Math.abs(line.stations[iFrom].km - line.stations[svcFromIdx].km);
        const offsetSec = Math.round((kmToFrom / AVG_SPEED_KMH) * 3600);
        let t = firstDepSec + offsetSec;
        // Allinea al prossimo multiplo di headwaySec ≥ depSec
        if (t < depSec) {
          t += Math.ceil((depSec - t) / headwaySec) * headwaySec;
        }
        const lastAtFrom = lastDepSec + offsetSec;
        while (t <= Math.min(lastAtFrom, depSec + SEARCH_WINDOW)) {
          allDeps.push(t);
          t += headwaySec;
        }
      } else {
        // Corse B→A: partono da svcToCode
        // firstDep del capolinea B = firstDep A + fullTravelSec (approssimato)
        const firstDepB = firstDepSec + fullTravelSec;
        const lastDepB  = lastDepSec  + fullTravelSec;
        const kmToFrom  = Math.abs(line.stations[iFrom].km - line.stations[svcToIdx].km);
        const offsetSec = Math.round((kmToFrom / AVG_SPEED_KMH) * 3600);
        let t = firstDepB + offsetSec;
        if (t < depSec) {
          t += Math.ceil((depSec - t) / headwaySec) * headwaySec;
        }
        const lastAtFrom = lastDepB + offsetSec;
        while (t <= Math.min(lastAtFrom, depSec + SEARCH_WINDOW)) {
          allDeps.push(t);
          t += headwaySec;
        }
      }
    }

    // Ordina e deduplica (due servizi possono avere la stessa partenza)
    return [...new Set(allDeps)].sort((a, b) => a - b);
  }

  /* ----------------------------------------------------------------
   * _getTrips(line, iFrom, iTo, depSec)
   * Dispatcher: usa _skTrips per SK, _syntheticTrips per tutte le altre.
   * ---------------------------------------------------------------- */
  function _getTrips(line, iFrom, iTo, depSec) {
    if (line.id === 'SK') return _skTrips(line, iFrom, iTo, depSec);
    return _syntheticTrips(line, iFrom, depSec);
  }

  function _buildLeg(line, iFrom, iTo, depSec) {
    const trips = _getTrips(line, iFrom, iTo, depSec);
    if (!trips.length) return null;
    const boardSec  = trips[0];
    const km        = _kmBetween(line, iFrom, iTo);
    const travelSec = Math.round((km / AVG_SPEED_KMH) * 3600);
    const alightSec = boardSec + travelSec;
    const dir       = line.circular
      ? _circularDir(line, iFrom, iTo)
      : (iFrom < iTo ? 'SB' : 'NB');
    let intermediateStops;
    if (line.circular) {
      intermediateStops = _circularIntermediateStops(line, iFrom, iTo, dir, boardSec, km);
    } else {
      const a = Math.min(iFrom, iTo), b = Math.max(iFrom, iTo);
      const sliced = line.stations.slice(a + 1, b);
      const ordered = iFrom < iTo ? sliced : [...sliced].reverse();
      intermediateStops = ordered.map(st => {
        const kmElapsed = Math.abs(st.km - line.stations[iFrom].km);
        const arrSec    = boardSec + Math.round((kmElapsed / km) * travelSec);
        return { code: st.code, name: st.name,
                 arr: _secToHM(arrSec), dep: _secToHM(arrSec + DWELL_SEC) };
      });
    }
    return {
      lineId: line.id, svcId: line.id, svcLogical: line.id,
      svcName: line.name, color: line.color, cls: 'suburban',
      direction: dir, trainNumber: null,
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
    for (const line of Object.values(SUBURBAN_LINES)) {
      if (!line.stations.length) continue;
      if (lineAllowed && !lineAllowed.has(line.id)) continue;
      const iF = _idx(line, resolvedFrom);
      const iT = _idx(line, resolvedTo);
      if (iF === -1 || iT === -1 || iF === iT) continue;
      const leg = _buildLeg(line, iF, iT, depSec);
      if (!leg) continue;
      journeys.push({
        legs: [leg], departureTime: leg.boardDep, arrivalTime: leg.alightArr,
        totalMinutes: Math.round((leg.alightArrSec - leg.boardDepSec) / 60),
        totalKm: leg.km, transfers: 0, transferNodes: [],
      });
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
      const key = j.legs.map(l => `${l.lineId}:${l.boardDep}:${l.alightArr}`).join('|');
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

  return { search, stationName, allStations, lineColor, TRANSFER_MIN, CROSS_TRANSFER_MIN };

})();

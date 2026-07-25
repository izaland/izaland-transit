/* ================================================================
   METRO-ROUTER.JS — Sainðaul Metro Journey Planner
   Dipende da: metro/m4-data.js
               metro/m2-data.js
               metro/m2-tt.js

   API pubblica:
     MetroRouter.search(from, to, depTime, opts) → Journey[]
     MetroRouter.buildLeg(boardCode, alightCode, depSec) → Leg | null
     MetroRouter.stationName(code)               → string
     MetroRouter.allStations()                   → Station[]
     MetroRouter.lineColor(lineId)               → string
     MetroRouter.allLines()                      → Line[]

   Linee supportate:
     M4 — Kokendake Line (25 stazioni, linea singola)
     M2 — Line 2         (36 stazioni, biforcazione dopo M218)
            Ramo A: → M226 Hintomaui  (SVC_1)
            Ramo B: → M236 Mokoba     (SVC_2, SVC_3, SVC_4)

   Per aggiungere una nuova linea metro:
     1. Creare m<N>-data.js e m<N>-tt.js
     2. Registrare la linea in _LINES qui sotto
     3. Aggiungere <script src="metro/m<N>-data.js"> in HTML

   Algoritmo:
     Timetable generato runtime da headway + avgSpeedKmh.
     Per M2 il routing considera tutti i servizi compatibili
     con la coppia (from, to): un servizio è compatibile se
     entrambe le stazioni compaiono nel suo array stops[],
     nell'ordine corretto.
================================================================ */
'use strict';

const MetroRouter = (() => {

  const MAX_JOURNEYS   = 5;
  const SEARCH_WINDOW  = 3 * 3600;
  const DWELL_SEC      = 30;

  /* ----------------------------------------------------------------
   * Registro linee
   * Ogni entry descrive una linea e i suoi sottoservizi.
   * ---------------------------------------------------------------- */
  function _lines() {
    const out = [];

    /* ── M4 ── */
    if (typeof M4_ST !== 'undefined') {
      out.push({
        lineId:      'M4',
        meta:        M4_META,
        st:          M4_ST,
        avgSpeedKmh: M4_META.avgSpeedKmh ?? 30,
        dwellSec:    M4_META.dwellSec    ?? DWELL_SEC,
        services: [{
          id:       'B',
          name:     M4_SVC.B.name,
          color:    M4_META.color,
          cls:      'metro',
          rapid:    false,
          stops:    M4_CANONICAL_ORDER,
          headway:  M4_HEADWAY,       // usato sia inbound che outbound
        }],
      });
    }

    /* ── M2 ── */
    if (typeof M2_ST !== 'undefined' && typeof M2_SERVICES !== 'undefined') {
      out.push({
        lineId:      'M2',
        meta:        M2_META,
        st:          M2_ST,
        avgSpeedKmh: M2_META.avgSpeedKmh ?? 30,
        dwellSec:    M2_META.dwellSec    ?? DWELL_SEC,
        services:    M2_SERVICES,     // già strutturati in m2-tt.js
      });
    }

    return out;
  }

  /* ---- utils tempo ---- */
  function _hmToSec(hm) {
    if (!hm) return 0;
    const [h, m] = hm.split(':').map(Number);
    return h * 3600 + m * 60;
  }
  function _secToHM(sec) {
    const s = ((sec % 86400) + 86400) % 86400;
    return String(Math.floor(s / 3600)).padStart(2,'0') + ':' +
           String(Math.floor((s % 3600) / 60)).padStart(2,'0');
  }

  /* ----------------------------------------------------------------
   * _headwaySecAt(headwaySlots, timeSec, direction)
   * Restituisce l'headway in secondi per il momento dato.
   * direction: 'inbound' | 'outbound' | undefined
   * Per SVC_4 (headway asimmetrico) usa headwayInbound/Outbound.
   * ---------------------------------------------------------------- */
  function _headwaySecAt(svc, timeSec, direction) {
    const hm = _secToHM(timeSec);
    let slots;
    if (svc.headwayInbound && direction === 'inbound') {
      slots = svc.headwayInbound;
    } else if (svc.headwayOutbound && direction === 'outbound') {
      slots = svc.headwayOutbound;
    } else {
      slots = svc.headway || [];
    }
    for (const slot of slots) {
      if (hm >= slot.from && hm < slot.to) return slot.headwayMin * 60;
    }
    /* Fuori finestra operativa: nessuna corsa disponibile */
    return null;
  }

  /* ----------------------------------------------------------------
   * _stationKm(st, code)
   * ---------------------------------------------------------------- */
  function _stationKm(st, code) {
    return st[code]?.km ?? null;
  }

  /* ----------------------------------------------------------------
   * _buildLegForService(line, svc, boardCode, alightCode, depSec)
   * Costruisce un Leg per un servizio specifico, se compatibile.
   * Compatibilità: entrambe le stazioni in stops[] nell'ordine giusto.
   * ---------------------------------------------------------------- */
  function _buildLegForService(line, svc, boardCode, alightCode, depSec) {
    const stops = svc.stops;
    const iF = stops.indexOf(boardCode);
    const iT = stops.indexOf(alightCode);
    if (iF === -1 || iT === -1 || iF === iT) return null;

    const direction = iF < iT ? 'outbound' : 'inbound';
    const hwSec = _headwaySecAt(svc, depSec, direction);
    if (hwSec === null) return null;

    const alignSec = Math.ceil(depSec / hwSec) * hwSec;

    const kmF = _stationKm(line.st, boardCode);
    const kmT = _stationKm(line.st, alightCode);
    if (kmF === null || kmT === null) return null;
    const km = Math.abs(kmT - kmF);

    const travelSec  = Math.round((km / line.avgSpeedKmh) * 3600);
    const alightSec  = alignSec + travelSec;

    const ordered = iF < iT ? stops.slice(iF, iT + 1) : stops.slice(iT, iF + 1).reverse();
    const between = ordered.slice(1, -1);

    const intermediateStops = between.map(code => {
      const st   = line.st[code];
      const kmEl = Math.abs((st?.km ?? kmF) - kmF);
      const arrSec = alignSec + Math.round((kmEl / km) * travelSec);
      return { code, name: st?.n ?? code, arr: _secToHM(arrSec), dep: _secToHM(arrSec + line.dwellSec) };
    });

    return {
      lineId:       line.lineId,
      svcId:        svc.id,
      svcLogical:   svc.id,
      svcName:      svc.name,
      color:        svc.color || line.meta.color,
      cls:          svc.cls || 'metro',
      direction,
      trainNumber:  null,
      boardCode,
      boardName:    line.st[boardCode]?.n ?? boardCode,
      boardDep:     _secToHM(alignSec),
      boardDepSec:  alignSec,
      alightCode,
      alightName:   line.st[alightCode]?.n ?? alightCode,
      alightArr:    _secToHM(alightSec),
      alightArrSec: alightSec,
      km,
      intermediateStops,
    };
  }

  /* ----------------------------------------------------------------
   * buildLeg(boardCode, alightCode, depSec)
   * Prova tutti i servizi di tutte le linee e restituisce il
   * primo leg valido (partenza più vicina a depSec).
   * ---------------------------------------------------------------- */
  function buildLeg(boardCode, alightCode, depSec) {
    let best = null;
    for (const line of _lines()) {
      for (const svc of line.services) {
        const leg = _buildLegForService(line, svc, boardCode, alightCode, depSec);
        if (!leg) continue;
        if (!best || leg.boardDepSec < best.boardDepSec) best = leg;
      }
    }
    return best;
  }

  /* ================================================================
   * search(from, to, depTime, opts)
   * ================================================================ */
  function search(from, to, depTime, opts = {}) {
    const maxResults  = opts.maxResults ?? MAX_JOURNEYS;
    const depSec      = _hmToSec(depTime);
    const lineAllowed = (() => {
      const raw = opts.lines;
      if (!raw || raw === 'ALL') return null;
      return new Set(Array.isArray(raw) ? raw : [raw]);
    })();

    const journeys = [];

    for (const line of _lines()) {
      if (lineAllowed && !lineAllowed.has(line.lineId)) continue;

      for (const svc of line.services) {
        if (svc.stops.indexOf(from) === -1 || svc.stops.indexOf(to) === -1) continue;

        const direction = svc.stops.indexOf(from) < svc.stops.indexOf(to) ? 'outbound' : 'inbound';
        const hwSec = _headwaySecAt(svc, depSec, direction);
        if (hwSec === null) continue;

        let t       = Math.ceil(depSec / hwSec) * hwSec;
        const endSec = depSec + SEARCH_WINDOW;
        let count   = 0;

        while (t <= endSec && count < 2) {  // max 2 corse per servizio
          const leg = _buildLegForService(line, svc, from, to, t);
          if (leg) {
            journeys.push({
              legs:          [leg],
              departureTime: leg.boardDep,
              arrivalTime:   leg.alightArr,
              totalMinutes:  Math.round((leg.alightArrSec - leg.boardDepSec) / 60),
              totalKm:       leg.km,
              transfers:     0,
              transferNodes: [],
            });
            count++;
          }
          const nextHw = _headwaySecAt(svc, t, direction);
          if (nextHw === null) break;
          t += nextHw;
        }
      }
    }

    /* Deduplicazione + ordinamento per arrivo */
    const seen   = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l => `${l.lineId}:${l.svcId}:${l.boardDep}:${l.alightCode}`).join('|');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    unique.sort((a, b) => _hmToSec(a.arrivalTime) - _hmToSec(b.arrivalTime));
    return unique.slice(0, maxResults);
  }

  /* ================================================================
   * allStations()
   * ================================================================ */
  function allStations() {
    const seen = new Set();
    const out  = [];
    for (const line of _lines()) {
      for (const [code, st] of Object.entries(line.st)) {
        if (seen.has(code)) continue;
        seen.add(code);
        out.push({ ...st, code, lineId: line.lineId, name: st.n });
      }
    }
    return out;
  }

  /* ================================================================
   * stationName(code)
   * ================================================================ */
  function stationName(code) {
    for (const line of _lines()) {
      if (line.st[code]) return line.st[code].n;
    }
    return code;
  }

  /* ================================================================
   * allLines()
   * ================================================================ */
  function allLines() {
    return _lines().map(line => ({
      id:      line.lineId,
      name:    line.meta.name,
      color:   line.meta.color,
      totalKm: line.meta.totalKmA ?? line.meta.totalKm ?? null,
    }));
  }

  /* ================================================================
   * lineColor(lineId)
   * ================================================================ */
  function lineColor(lineId) {
    const line = _lines().find(l => l.lineId === lineId);
    return line?.meta.color ?? '#888';
  }

  if (typeof module !== 'undefined') {
    module.exports = { search, buildLeg, stationName, allStations, allLines, lineColor };
  }

  return { search, buildLeg, stationName, allStations, allLines, lineColor };

})();

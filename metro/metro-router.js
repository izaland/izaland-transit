/* ================================================================
   METRO-ROUTER.JS — Sainðaul Metro Journey Planner
   ================================================================
   Dipende da: metro/m4-data.js  + metro/m4-tt.js
               metro/m2-data.js  + metro/m2-tt.js
               (+ qualsiasi futura mN-data.js / mN-tt.js)

   API pubblica:
     MetroRouter.search(from, to, depTime, opts) → Journey[]
     MetroRouter.buildLeg(boardCode, alightCode, depSec) → Leg | null
     MetroRouter.stationName(code)               → string
     MetroRouter.allStations()                   → Station[]
     MetroRouter.lineColor(lineId)               → string
     MetroRouter.allLines()                      → Line[]
     MetroRouter.networkOf(code)                 → string  ('M2'|'M4'|…)
     MetroRouter.allInterchanges()               → { codeA, codeB, transferMin }[]

   Per aggiungere una nuova linea metro (es. M3):
     1. Creare metro/m3-data.js  (M3_ST, M3_META, M3_INTERCHANGE, …)
     2. Creare metro/m3-tt.js    (M3_SERVICES)
     3. Aggiungere <script> in HTML — nessuna modifica qui.

   Il registro _LINES() scopre automaticamente le linee a runtime
   controllando se M2_ST, M3_ST, M4_ST, … sono definiti (fino a M30).
================================================================ */
'use strict';

const MetroRouter = (() => {

  const MAX_JOURNEYS  = 5;
  const SEARCH_WINDOW = 3 * 3600;
  const DWELL_SEC     = 30;

  /* ----------------------------------------------------------------
   * _LINES()  — scoperta automatica delle linee caricate
   * Controlla M2_ST … M30_ST e M2_SERVICES … M30_SERVICES.
   * Ogni linea è identificata dal suo lineId (es. 'M2', 'M4').
   * ---------------------------------------------------------------- */
  let _linesCache = null;
  function _LINES() {
    if (_linesCache) return _linesCache;
    _linesCache = [];
    for (let n = 2; n <= 30; n++) {
      const stVar  = window[`M${n}_ST`];
      const meta   = window[`M${n}_META`];
      const svcs   = window[`M${n}_SERVICES`];
      if (!stVar || !meta) continue;

      /* Compatibilità M4: se non ha M4_SERVICES, costruiscilo da M4_SVC */
      let services = svcs;
      if (!services && n === 4 && typeof M4_SVC !== 'undefined') {
        services = [{
          id:         'M4',
          svcLogical: 'B',
          name:       M4_SVC.B.name,
          color:      M4_META.color,
          cls:        'metro',
          rapid:      false,
          headway:    typeof M4_HEADWAY !== 'undefined' ? M4_HEADWAY : [],
          stops:      typeof M4_CANONICAL_ORDER !== 'undefined' ? M4_CANONICAL_ORDER : [],
        }];
      }
      if (!services || !services.length) continue;

      _linesCache.push({
        lineId:      `M${n}`,
        meta,
        st:          stVar,
        avgSpeedKmh: meta.avgSpeedKmh ?? 30,
        dwellSec:    meta.dwellSec    ?? DWELL_SEC,
        services,
        interchange: window[`M${n}_INTERCHANGE`] ?? {},
      });
    }
    return _linesCache;
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

  /* ----------------------------------------------------------------
   * _headwaySecAt(svc, timeSec, direction)
   * direction: 'inbound' | 'outbound' | undefined
   * Restituisce null se fuori finestra operativa.
   * ---------------------------------------------------------------- */
  function _headwaySecAt(svc, timeSec, direction) {
    const hm = _secToHM(timeSec);
    let slots;
    if (svc.headwayInbound  && direction === 'inbound')  slots = svc.headwayInbound;
    else if (svc.headwayOutbound && direction === 'outbound') slots = svc.headwayOutbound;
    else slots = svc.headway || [];
    for (const slot of slots) {
      if (hm >= slot.from && hm < slot.to) return slot.headwayMin * 60;
    }
    return null;
  }

  /* ----------------------------------------------------------------
   * _buildLegForService(line, svc, boardCode, alightCode, depSec)
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
    const kmF = line.st[boardCode]?.km ?? null;
    const kmT = line.st[alightCode]?.km ?? null;
    if (kmF === null || kmT === null) return null;
    const km = Math.abs(kmT - kmF);

    const travelSec = Math.round((km / line.avgSpeedKmh) * 3600);
    const alightSec = alignSec + travelSec;

    const ordered = iF < iT
      ? stops.slice(iF, iT + 1)
      : stops.slice(iT, iF + 1).reverse();
    const between = ordered.slice(1, -1);

    const intermediateStops = between.map(code => {
      const st   = line.st[code];
      const kmEl = Math.abs((st?.km ?? kmF) - kmF);
      const arrSec = alignSec + Math.round((kmEl / km) * travelSec);
      return {
        code,
        name:  st?.n ?? code,
        arr:   _secToHM(arrSec),
        dep:   _secToHM(arrSec + line.dwellSec),
      };
    });

    return {
      lineId:       line.lineId,
      svcId:        svc.id,
      svcLogical:   svc.svcLogical ?? svc.id,
      svcName:      svc.name,
      color:        svc.color || line.meta.color,
      cls:          svc.cls || 'metro',
      network:      'metro',
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
   * Prova tutti i servizi e restituisce il leg con partenza più vicina.
   * ---------------------------------------------------------------- */
  function buildLeg(boardCode, alightCode, depSec) {
    let best = null;
    for (const line of _LINES()) {
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

    for (const line of _LINES()) {
      if (lineAllowed && !lineAllowed.has(line.lineId)) continue;

      for (const svc of line.services) {
        if (svc.stops.indexOf(from) === -1 || svc.stops.indexOf(to) === -1) continue;

        const direction = svc.stops.indexOf(from) < svc.stops.indexOf(to)
          ? 'outbound' : 'inbound';
        const hwSec = _headwaySecAt(svc, depSec, direction);
        if (hwSec === null) continue;

        let t        = Math.ceil(depSec / hwSec) * hwSec;
        const endSec = depSec + SEARCH_WINDOW;
        let count    = 0;

        while (t <= endSec && count < 2) {
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

    /* Deduplicazione + ordinamento */
    const seen   = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l =>
        `${l.lineId}:${l.svcLogical}:${l.boardDep}:${l.alightCode}`
      ).join('|');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    unique.sort((a, b) => _hmToSec(a.arrivalTime) - _hmToSec(b.arrivalTime));
    return unique.slice(0, maxResults);
  }

  /* ================================================================
   * networkOf(code)
   * Restituisce il lineId della linea che contiene `code`.
   * Es: 'M2', 'M4'. Usato da UnifiedRouter per distinguere
   * le linee metro come reti separate ai fini del name-match.
   * ================================================================ */
  function networkOf(code) {
    for (const line of _LINES()) {
      if (line.st[code]) return line.lineId;
    }
    return null;
  }

  /* ================================================================
   * allInterchanges()
   * Aggrega tutti i *_INTERCHANGE dichiarati nelle linee caricate
   * e restituisce un array piatto di coppie { codeA, codeB, transferMin }.
   * UnifiedRouter lo chiama una volta sola — nessuna modifica necessaria
   * quando si aggiunge una nuova linea metro.
   * ================================================================ */
  function allInterchanges() {
    const out = [];
    const seen = new Set();
    for (const line of _LINES()) {
      for (const [codeA, partners] of Object.entries(line.interchange)) {
        for (const p of (partners || [])) {
          if (!p.code) continue;
          const key = [codeA, p.code].sort().join('<>');
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({ codeA, codeB: p.code, transferMin: p.transferMin ?? 10 });
        }
      }
    }
    return out;
  }

  /* ================================================================
   * allStations()
   * ================================================================ */
  function allStations() {
    const seen = new Set();
    const out  = [];
    for (const line of _LINES()) {
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
    for (const line of _LINES()) {
      if (line.st[code]) return line.st[code].n;
    }
    return code;
  }

  /* ================================================================
   * allLines()
   * ================================================================ */
  function allLines() {
    return _LINES().map(line => ({
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
    const line = _LINES().find(l => l.lineId === lineId);
    return line?.meta.color ?? '#888';
  }

  if (typeof module !== 'undefined') {
    module.exports = {
      search, buildLeg, stationName, allStations, allLines, lineColor,
      networkOf, allInterchanges,
    };
  }

  return {
    search, buildLeg, stationName, allStations, allLines, lineColor,
    networkOf, allInterchanges,
  };

})();

/* ================================================================
   METRO-ROUTER.JS — Sainðaul Metro Journey Planner
   ================================================================
   API pubblica:
     MetroRouter.register(config)                → void
     MetroRouter.search(from, to, depTime, opts) → Journey[]
     MetroRouter.buildLeg(boardCode, alightCode, depSec) → Leg | null
     MetroRouter.stationName(code)               → string
     MetroRouter.allStations()                   → Station[]
     MetroRouter.lineColor(lineId)               → string
     MetroRouter.allLines()                      → Line[]
     MetroRouter.networkOf(code)                 → string  ('M2'|'M4'|…)
     MetroRouter.allInterchanges()               → { codeA, codeB, transferMin }[]

   Per aggiungere una nuova linea metro (es. M3):
     1. Creare metro/m3-data.js  (chiama MetroRouter.register alla fine)
     2. Creare metro/m3-tt.js    (opzionale, chiamata register può stare in m3-data.js)
     3. Aggiungere &lt;script&gt; in HTML — nessuna modifica qui.
================================================================ */
'use strict';

const MetroRouter = (() => {

  const MAX_JOURNEYS  = 5;
  const SEARCH_WINDOW = 3 * 3600;
  const DWELL_SEC     = 30;

  /* ----------------------------------------------------------------
   * Registro interno delle linee.
   * Ogni linea viene aggiunta via MetroRouter.register(config).
   * ---------------------------------------------------------------- */
  const _registry = [];

  /**
   * register(config)
   * Chiamato dai file m*-data.js / m*-tt.js per registrare una linea.
   *
   * config: {
   *   lineId,          // es. 'M2'
   *   meta,            // M2_META
   *   st,              // M2_ST
   *   services,        // array di service objects (formato normalizzato)
   *   interchange,     // M2_INTERCHANGE
   * }
   */
  function register(config) {
    if (!config || !config.lineId || !config.st || !config.meta) {
      console.warn('MetroRouter.register: config invalida', config);
      return;
    }
    /* Evita duplicati se lo script viene caricato due volte */
    if (_registry.find(l => l.lineId === config.lineId)) return;
    _registry.push({
      lineId:      config.lineId,
      meta:        config.meta,
      st:          config.st,
      avgSpeedKmh: config.meta.avgSpeedKmh ?? 30,
      dwellSec:    config.meta.dwellSec    ?? DWELL_SEC,
      services:    config.services || [],
      interchange: config.interchange || {},
    });
  }

  function _LINES() { return _registry; }

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

    /* ----------------------------------------------------------------
     * Deduplicazione: chiave = lineId + boardCode + boardDep + alightCode.
     * NON include svcLogical: servizi _S e _N sullo stesso tratto fisico
     * producono lo stesso viaggio (stesso orario, stessa origine/dest.)
     * e vanno collassati in un unico risultato.
     * ---------------------------------------------------------------- */
    const seen   = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l =>
        `${l.lineId}:${l.boardCode}:${l.boardDep}:${l.alightCode}`
      ).join('|');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    unique.sort((a, b) => _hmToSec(a.arrivalTime) - _hmToSec(b.arrivalTime));
    return unique.slice(0, maxResults);
  }

  /* ================================================================
   * networkOf, allInterchanges, allStations, stationName,
   * allLines, lineColor
   * ================================================================ */
  function networkOf(code) {
    for (const line of _LINES()) {
      if (line.st[code]) return line.lineId;
    }
    return null;
  }

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

  function stationName(code) {
    for (const line of _LINES()) {
      if (line.st[code]) return line.st[code].n;
    }
    return code;
  }

  function allLines() {
    return _LINES().map(line => ({
      id:      line.lineId,
      name:    line.meta.name,
      color:   line.meta.color,
      totalKm: line.meta.totalKmA ?? line.meta.totalKm ?? null,
    }));
  }

  function lineColor(lineId) {
    const line = _LINES().find(l => l.lineId === lineId);
    return line?.meta.color ?? '#888';
  }

  if (typeof module !== 'undefined') {
    module.exports = {
      register, search, buildLeg, stationName, allStations,
      allLines, lineColor, networkOf, allInterchanges,
    };
  }

  return {
    register, search, buildLeg, stationName, allStations,
    allLines, lineColor, networkOf, allInterchanges,
  };

})();

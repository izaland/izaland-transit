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

   Campi opzionali nei service objects:
     svc.offsetMin   — sfasa le partenze di N minuti rispetto al multiplo
                        del headway. Es. offsetMin:3 con headway 15 min →
                        treni alle :03 :18 :33 :48 invece di :00 :15 :30 :45.
     svc.speedKmh    — velocità commerciale del servizio in km/h. Sovrascrive
                        meta.avgSpeedKmh. Utile per differenziare express (più
                        veloce) da all-stop (più lento).

   Calcolo tempi di percorrenza:
     travelSec = (km / speedKmh) * 3600  +  fermate_intermedie * dwellSec
     Questo produce tempi diversi tra express e locale anche a pari distanza,
     perché: (1) l’express ha speedKmh più alta (meno acc/frenate),
             (2) il locale accumula dwell su ogni fermata intermedia.
     Aggiornare i valori km in *-data.js aggiorna automaticamente tutti i tempi.

   Tempi di trasferimento di default:
     METRO_TRANSFER_MIN  4 min  — metro ↔ metro

   Per aggiungere una nuova linea metro (es. M3):
     1. Creare metro/m3-data.js
     2. Creare metro/m3-tt.js
     3. Aggiungere <script> in HTML — nessuna modifica qui.
================================================================ */
'use strict';

const MetroRouter = (() => {

  const MAX_JOURNEYS        = 5;
  const SEARCH_WINDOW       = 3 * 3600;
  const DWELL_SEC           = 30;
  const METRO_TRANSFER_MIN  = 4;

  const _registry = [];

  function register(config) {
    if (!config || !config.lineId || !config.st || !config.meta) {
      console.warn('MetroRouter.register: config invalida', config);
      return;
    }
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
   * _nextDeparture(depSec, hwSec, offsetSec)
   * ---------------------------------------------------------------- */
  function _nextDeparture(depSec, hwSec, offsetSec) {
    const phase = ((depSec - offsetSec) % hwSec + hwSec) % hwSec;
    const wait  = phase === 0 ? 0 : hwSec - phase;
    return depSec + wait;
  }

  /* ----------------------------------------------------------------
   * _buildLegForService(line, svc, boardCode, alightCode, depSec)
   *
   * Tempo di percorrenza:
   *   runSec   = distanza_km / speedKmh * 3600
   *   dwellSec = fermate_intermedie * line.dwellSec
   *   total    = runSec + dwellSec
   *
   * speedKmh = svc.speedKmh ?? line.avgSpeedKmh
   * ---------------------------------------------------------------- */
  function _buildLegForService(line, svc, boardCode, alightCode, depSec) {
    const stops = svc.stops;
    const iF = stops.indexOf(boardCode);
    const iT = stops.indexOf(alightCode);
    if (iF === -1 || iT === -1 || iF === iT) return null;

    const direction  = iF < iT ? 'outbound' : 'inbound';
    const hwSec      = _headwaySecAt(svc, depSec, direction);
    if (hwSec === null) return null;

    const offsetSec  = (svc.offsetMin ?? 0) * 60;
    const alignSec   = _nextDeparture(depSec, hwSec, offsetSec);

    const kmF = line.st[boardCode]?.km ?? null;
    const kmT = line.st[alightCode]?.km ?? null;
    if (kmF === null || kmT === null) return null;
    const km = Math.abs(kmT - kmF);

    // Fermate intermedie (necessarie sia per dwell che per intermediateStops)
    const ordered = iF < iT
      ? stops.slice(iF, iT + 1)
      : stops.slice(iT, iF + 1).reverse();
    const between = ordered.slice(1, -1);

    // Velocità commerciale: svc.speedKmh sovrascrive line.avgSpeedKmh
    const speedKmh  = svc.speedKmh ?? line.avgSpeedKmh;
    const runSec    = Math.round((km / speedKmh) * 3600);
    const travelSec = runSec + between.length * line.dwellSec;
    const alightSec = alignSec + travelSec;

    const intermediateStops = between.map(code => {
      const st     = line.st[code];
      const kmEl   = Math.abs((st?.km ?? kmF) - kmF);
      const arrSec = alignSec + Math.round((kmEl / km) * runSec)
                     + between.slice(0, between.indexOf(code)).length * line.dwellSec;
      return {
        code,
        name: st?.n ?? code,
        arr:  _secToHM(arrSec),
        dep:  _secToHM(arrSec + line.dwellSec),
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

        const offsetSec = (svc.offsetMin ?? 0) * 60;
        let t           = _nextDeparture(depSec, hwSec, offsetSec);
        const endSec    = depSec + SEARCH_WINDOW;
        let count       = 0;

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
          t += hwSec;
        }
      }
    }

     /* ---- Intra-line Local→Express upgrade ---- */
for (const line of _LINES()) {
  if (lineAllowed && !lineAllowed.has(line.lineId)) continue;

  // Servizi express che fermano a `to` ma NON a `from`
  const expressSvcs = line.services.filter(svc =>
    svc.stops.includes(to) &&
    !svc.stops.includes(from)
  );
  if (!expressSvcs.length) continue;

  // Servizi locali che fermano a `from`
  const localSvcs = line.services.filter(svc =>
    svc.stops.includes(from)
  );
  if (!localSvcs.length) continue;

  for (const expSvc of expressSvcs) {
    const iTo = expSvc.stops.indexOf(to);

    // Cerca la prima fermata del Rapid raggiungibile da `from` (nella direzione giusta)
    for (const localSvc of localSvcs) {
      const iFromLocal = localSvc.stops.indexOf(from);

      // Candidate: fermate dove local ferma E express ferma, nella direzione giusta
      const candidates = expSvc.stops.filter(code => {
        if (code === from || code === to) return false;
        if (!localSvc.stops.includes(code)) return false;
        const iInExp   = expSvc.stops.indexOf(code);
        const iInLocal = localSvc.stops.indexOf(from);
        // Stesso verso: iInExp deve essere tra from e to
        return (iTo > expSvc.stops.indexOf(code))
          ? expSvc.stops.indexOf(code) > (expSvc.stops.indexOf(from) ?? -Infinity)
          : true;
      });
      // Ordina per vicinanza a `from` nella lista local
      candidates.sort((a, b) => {
        const ia = localSvc.stops.indexOf(a);
        const ib = localSvc.stops.indexOf(b);
        const distA = Math.abs(ia - iFromLocal);
        const distB = Math.abs(ib - iFromLocal);
        return distA - distB;
      });

      for (const xferCode of candidates) {
        const leg1 = _buildLegForService(line, localSvc, from, xferCode, depSec);
        if (!leg1) continue;

        const leg2 = _buildLegForService(line, expSvc, xferCode, to, leg1.alightArrSec);
        if (!leg2) continue;

        const waitSec = leg2.boardDepSec - leg1.alightArrSec;
        if (waitSec < 0) continue;

        journeys.push({
          legs:          [leg1, leg2],
          departureTime: leg1.boardDep,
          arrivalTime:   leg2.alightArr,
          totalMinutes:  Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
          totalKm:       leg1.km + leg2.km,
          transfers:     1,
          transferNodes: [xferCode],
          transferWalkMin: 0,
          transferWaitMin: Math.round(waitSec / 60),
        });
        break; // prima fermata valida trovata, passa al prossimo expSvc
      }
    }
  }
}

    const seen   = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l =>
        `${l.lineId}:${l.svcLogical}:${l.boardCode}:${l.boardDep}:${l.alightCode}`
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
          out.push({ codeA, codeB: p.code, transferMin: p.transferMin ?? METRO_TRANSFER_MIN });
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

  /* ----------------------------------------------------------------
   * buildMultiLeg(boardCode, alightCode, depSec)
   * ---------------------------------------------------------------- */
  function buildMultiLeg(boardCode, alightCode, depSec) {
    const direct = buildLeg(boardCode, alightCode, depSec);
    if (direct) return { legs: [direct], totalMin: Math.round((direct.alightArrSec - direct.boardDepSec) / 60) };

    const METRO_XFER_MIN = 4;
    const visited = new Set([boardCode]);
    const queue = [{ code: boardCode, depSec, legsAccum: [] }];

    while (queue.length) {
      const { code: curCode, depSec: curDep, legsAccum } = queue.shift();
      if (legsAccum.length >= 3) continue;

      for (const line of _LINES()) {
        for (const svc of line.services) {
          if (!svc.stops.includes(curCode)) continue;
          if (svc.stops.includes(alightCode)) {
            const legFinal = _buildLegForService(line, svc, curCode, alightCode, curDep);
            if (legFinal) {
              const allLegs = [...legsAccum, legFinal];
              const totalMin = Math.round((legFinal.alightArrSec - allLegs[0].boardDepSec) / 60);
              return { legs: allLegs, totalMin };
            }
          }
          for (const [xferCode, partners] of Object.entries(line.interchange)) {
            if (!svc.stops.includes(xferCode)) continue;
            if (visited.has(xferCode)) continue;
            for (const p of (partners || [])) {
              if (p.network !== 'metro') continue;
              if (visited.has(p.code)) continue;
              const legToXfer = _buildLegForService(line, svc, curCode, xferCode, curDep);
              if (!legToXfer) continue;
              visited.add(xferCode);
              visited.add(p.code);
              const nextDep = legToXfer.alightArrSec + (p.transferMin ?? METRO_XFER_MIN) * 60;
              queue.push({ code: p.code, depSec: nextDep, legsAccum: [...legsAccum, legToXfer] });
            }
          }
        }
      }
    }
    return null;
  }

  if (typeof module !== 'undefined') {
    module.exports = {
      register, search, buildLeg, buildMultiLeg,
      stationName, allStations, allLines, lineColor, networkOf, allInterchanges,
    };
  }

  return {
    register, search, buildLeg, buildMultiLeg,
    stationName, allStations, allLines, lineColor, networkOf, allInterchanges,
  };

})();

/* ================================================================
   ROUTING.JS — IZX Journey Planner
   Dipende da: izx-data.js (IZX_LINES), tt-engine.js (TTEngine)

   API pubblica:
     IZXRouter.search(from, to, depTime, opts) → Journey[]
     IZXRouter.interchangeNodes()              → Set<string>

   Algoritmo: Connection Scan Algorithm (CSA) semplificato.
   Supporta:
     - Percorso diretto (stesso servizio, stessa linea)
     - Percorso con un cambio (transfer in una stazione di interscambio)
   Tempo di interscambio: TRANSFER_MIN (default 5 minuti).

   Nota sui servizi SN:
     G_rapid e G_local sono varianti dello stesso servizio logico G;
     il router le tratta come servizi distinti ma il display può
     unificarle (campo leg.svcLogical = "G" per entrambe).
================================================================ */

const IZXRouter = (() => {

  /* ---- costanti ---- */
  const TRANSFER_MIN   = 5;           // minuti fissi di transfer in stazione
  const TRANSFER_SEC   = TRANSFER_MIN * 60;
  const MAX_JOURNEYS   = 5;           // max risultati restituiti
  const SEARCH_WINDOW  = 3 * 3600;    // finestra di ricerca: 3 ore da depTime

  /* ----------------------------------------------------------------
   * interchangeNodes()
   * Restituisce tutti i codici stazione che fungono da nodo di
   * interscambio tra linee diverse.
   * ---------------------------------------------------------------- */
  function interchangeNodes() {
    const nodes = new Set();
    for (const line of Object.values(IZX_LINES)) {
      if (!line.INTERCHANGE) continue;
      for (const [a, b] of Object.entries(line.INTERCHANGE)) {
        nodes.add(a); nodes.add(b);
      }
    }
    const nameMap = {};
    for (const [lineId, line] of Object.entries(IZX_LINES)) {
      for (const code of line.CANONICAL) {
        const st = line.ST[code];
        if (!st) continue;
        const key = st.n.trim().toLowerCase();
        if (!nameMap[key]) nameMap[key] = [];
        nameMap[key].push({ lineId, code });
      }
    }
    for (const entries of Object.values(nameMap)) {
      if (entries.length > 1) entries.forEach(e => nodes.add(e.code));
    }
    return nodes;
  }

  /* ----------------------------------------------------------------
   * buildPartnerMap()
   * ---------------------------------------------------------------- */
  function buildPartnerMap() {
    const map = {};
    function add(a, b) {
      if (a === b) return;
      if (!map[a]) map[a] = new Set();
      if (!map[b]) map[b] = new Set();
      map[a].add(b); map[b].add(a);
    }
    for (const line of Object.values(IZX_LINES)) {
      if (!line.INTERCHANGE) continue;
      for (const [a, b] of Object.entries(line.INTERCHANGE)) add(a, b);
    }
    const nameMap = {};
    for (const [lineId, line] of Object.entries(IZX_LINES)) {
      for (const code of line.CANONICAL) {
        const st = line.ST[code];
        if (!st) continue;
        const key = st.n.trim().toLowerCase();
        if (!nameMap[key]) nameMap[key] = [];
        nameMap[key].push(code);
      }
    }
    for (const group of Object.values(nameMap)) {
      if (group.length < 2) continue;
      for (let i = 0; i < group.length; i++)
        for (let j = i + 1; j < group.length; j++)
          add(group[i], group[j]);
    }
    const result = {};
    for (const [k, v] of Object.entries(map)) result[k] = [...v];
    return result;
  }

  /* ----------------------------------------------------------------
   * stationName(code)
   * ---------------------------------------------------------------- */
  function stationName(code) {
    for (const line of Object.values(IZX_LINES)) {
      if (line.ST[code]) return line.ST[code].n;
    }
    return code;
  }

  /* ----------------------------------------------------------------
   * stationKm(lineId, code)
   * Restituisce il km progressivo della stazione sulla sua linea,
   * o null se non disponibile.
   * ---------------------------------------------------------------- */
  function stationKm(lineId, code) {
    const line = IZX_LINES[lineId];
    if (!line) return null;
    const st = line.ST[code];
    return (st && st.km != null) ? st.km : null;
  }

  /* ----------------------------------------------------------------
   * nextTrip(lineId, svcId, boardCode, minDepSec, alightCode)
   * ---------------------------------------------------------------- */
  function nextTrip(lineId, svcId, boardCode, minDepSec, alightCode) {
    const { hmToSec, secToHM } = TTEngine;
    const fromHM = secToHM(minDepSec);
    const toHM   = secToHM(minDepSec + SEARCH_WINDOW);
    let best = null;
    for (const dir of ["SB", "NB"]) {
      const trips = TTEngine.query({
        lines:     lineId,
        station:   boardCode,
        direction: dir,
        fromTime:  fromHM,
        toTime:    toHM,
        services:  [svcId],
      });
      for (const trip of trips) {
        if (alightCode && !trip.stops[alightCode]) continue;
        const boardStop  = trip.stops[boardCode];
        const alightStop = alightCode ? trip.stops[alightCode] : null;
        if (!boardStop) continue;
        const boardSec  = hmToSec(boardStop.dep);
        const alightSec = alightStop ? hmToSec(alightStop.arr ?? alightStop.dep) : null;
        if (alightSec !== null && alightSec <= boardSec) continue;
        if (boardSec >= minDepSec) {
          if (!best || boardSec < hmToSec(best.boardStop.dep)) {
            best = { trip, boardStop, alightStop, boardSec, alightSec };
          }
        }
      }
    }
    return best;
  }

  /* ----------------------------------------------------------------
   * buildLeg(lineId, svcId, boardCode, alightCode, minDepSec)
   * ---------------------------------------------------------------- */
  function buildLeg(lineId, svcId, boardCode, alightCode, minDepSec) {
    const found = nextTrip(lineId, svcId, boardCode, minDepSec, alightCode);
    if (!found) return null;
    const { trip, boardStop, alightStop, boardSec, alightSec } = found;
    const svcLogical = svcId.replace(/_rapid$|_local$/, "");

    /* Calcolo km del tratto */
    const kmBoard  = stationKm(lineId, boardCode);
    const kmAlight = stationKm(lineId, alightCode);
    const legKm = (kmBoard != null && kmAlight != null)
      ? Math.abs(kmAlight - kmBoard)
      : null;

    return {
      lineId,
      svcId,
      svcLogical,
      svcName:     trip.name,
      color:       trip.color,
      cls:         trip.cls,
      direction:   trip.direction,
      trainNumber: trip.trainNumber,
      boardCode,
      boardName:   stationName(boardCode),
      boardDep:    boardStop.dep,
      boardDepSec: boardSec,
      alightCode,
      alightName:  stationName(alightCode),
      alightArr:   alightStop?.arr ?? alightStop?.dep ?? "--:--",
      alightArrSec: alightSec,
      km:          legKm,          // km del singolo tratto (null se N/D)
       intermediateStops: (() => {
  const canon = IZX_LINES[lineId]?.SVC[svcId]?.stops ?? [];
  const ordered = trip.direction === 'NB' ? [...canon].reverse() : canon;
  const bi = ordered.indexOf(boardCode);
  const ai = ordered.indexOf(alightCode);
  if (bi === -1 || ai === -1) return [];
  return ordered.slice(bi + 1, ai)
    .filter(code => found.trip.stops[code])
    .map(code => ({
      code,
      name: stationName(code),
      arr:  found.trip.stops[code].arr,
      dep:  found.trip.stops[code].dep,
    }));
})(),
    };
  }

  /* ----------------------------------------------------------------
   * search(from, to, depTime, opts)
   * ---------------------------------------------------------------- */
  function search(from, to, depTime, opts = {}) {
    const { hmToSec, secToHM } = TTEngine;
    const maxResults  = opts.maxResults ?? MAX_JOURNEYS;
    const depSec      = hmToSec(depTime);
    const partnerMap  = buildPartnerMap();
    const journeys    = [];

    /* ---- 1. Percorsi DIRETTI ---- */
    for (const [lineId, line] of Object.entries(IZX_LINES)) {
      const hasFrom = line.ST[from] !== undefined;
      const hasTo   = line.ST[to]   !== undefined;
      if (!hasFrom || !hasTo) continue;
      for (const svcId of Object.keys(line.SVC)) {
        if (!line.TT[svcId]) continue;
        const leg = buildLeg(lineId, svcId, from, to, depSec);
        if (!leg) continue;
        journeys.push({
          legs:          [leg],
          departureTime: leg.boardDep,
          arrivalTime:   leg.alightArr,
          totalMinutes:  Math.round((leg.alightArrSec - leg.boardDepSec) / 60),
          totalKm:       leg.km,          // km totali del viaggio
          transfers:     0,
          transferNodes: [],
        });
      }
    }

    /* ---- 2. Percorsi con UN CAMBIO ---- */
    const reachableInterchanges = new Set();
    for (const [lineId, line] of Object.entries(IZX_LINES)) {
      if (!line.ST[from]) continue;
      for (const code of line.CANONICAL) {
        if (partnerMap[code]) reachableInterchanges.add(code);
      }
    }

    for (const midNode of reachableInterchanges) {
      const partners = partnerMap[midNode] ?? [];
      for (const partnerNode of partners) {
        for (const [lineId2, line2] of Object.entries(IZX_LINES)) {
          if (!line2.ST[partnerNode] || !line2.ST[to]) continue;
          for (const [lineId1, line1] of Object.entries(IZX_LINES)) {
            if (!line1.ST[from] || !line1.ST[midNode]) continue;
            for (const svcId1 of Object.keys(line1.SVC)) {
              if (!line1.TT[svcId1]) continue;
              const leg1 = buildLeg(lineId1, svcId1, from, midNode, depSec);
              if (!leg1) continue;
              const transferReadySec = leg1.alightArrSec + TRANSFER_SEC;
              for (const svcId2 of Object.keys(line2.SVC)) {
                if (!line2.TT[svcId2]) continue;
                if (lineId1 === lineId2 && svcId1 === svcId2 && midNode === partnerNode) continue;
                const leg2 = buildLeg(lineId2, svcId2, partnerNode, to, transferReadySec);
                if (!leg2) continue;
                const waitSec = leg2.boardDepSec - leg1.alightArrSec;

                /* km totali: somma dei due tratti (null se almeno uno manca) */
                const totalKm = (leg1.km != null && leg2.km != null)
                  ? leg1.km + leg2.km
                  : (leg1.km ?? leg2.km ?? null);

                journeys.push({
                  legs:          [leg1, leg2],
                  departureTime: leg1.boardDep,
                  arrivalTime:   leg2.alightArr,
                  totalMinutes:  Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
                  totalKm,
                  transfers:     1,
                  transferNodes: [midNode],
                  transferWaitMin: Math.round(waitSec / 60),
                });
              }
            }
          }
        }
      }
    }

    /* ---- deduplicazione e ordinamento ---- */
    const seen = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l => `${l.lineId}:${l.svcId}:${l.boardDep}:${l.alightArr}`).join("|");
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    unique.sort((a, b) => {
      const da = hmToSec(a.arrivalTime), db = hmToSec(b.arrivalTime);
      if (da !== db) return da - db;
      return a.transfers - b.transfers;
    });
    return unique.slice(0, maxResults);
  }

  /* ----------------------------------------------------------------
   * formatJourney(journey)
   * ---------------------------------------------------------------- */
  function formatJourney(j) {
    const lines = [];
    lines.push(
      `Partenza ${j.departureTime} → Arrivo ${j.arrivalTime}` +
      ` (${j.totalMinutes} min, ${j.transfers} cambio/i` +
      (j.totalKm != null ? `, ${j.totalKm.toFixed(1)} km` : '') + ')'
    );
    for (const [i, leg] of j.legs.entries()) {
      lines.push(
        `  Tratto ${i + 1}: [${leg.svcLogical}/${leg.svcId}] ${leg.svcName}` +
        ` · ${leg.boardName} ${leg.boardDep} → ${leg.alightName} ${leg.alightArr}` +
        (leg.km != null ? ` · ${leg.km.toFixed(1)} km` : '') +
        ` · Treno ${leg.trainNumber ?? "--"}`
      );
      if (i < j.legs.length - 1) {
        lines.push(
          `    ↕ Cambio a ${stationName(j.transferNodes[i])}` +
          ` — attesa ${j.transferWaitMin ?? TRANSFER_MIN} min`
        );
      }
    }
    return lines.join("\n");
  }

  /* ---- API pubblica ---- */
  return {
    search,
    interchangeNodes,
    buildPartnerMap,
    stationName,
    formatJourney,
    TRANSFER_MIN,
  };

})();

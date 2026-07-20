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
   *
   * Fonti:
   *   1. IZX_LINES[lineId].INTERCHANGE  — mappa esplicita { stCode: partnerCode }
   *   2. stazioni con lo stesso nome su linee diverse (fallback automatico)
   * ---------------------------------------------------------------- */
  function interchangeNodes() {
    const nodes = new Set();

    // 1. interscambi espliciti dichiarati in INTERCHANGE
    for (const line of Object.values(IZX_LINES)) {
      if (!line.INTERCHANGE) continue;
      for (const [a, b] of Object.entries(line.INTERCHANGE)) {
        nodes.add(a);
        nodes.add(b);
      }
    }

    // 2. stazioni con lo stesso nome su linee diverse
    //    (es. Sainðaul Central appare su KE, RY, EI)
    const nameMap = {}; // nome → [{ lineId, code }]
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
   * Costruisce una mappa bidirezionale:
   *   stCode → [partnerCode, ...]
   * per tutti i nodi di interscambio, combinando INTERCHANGE espliciti
   * e stazioni omonime.
   * ---------------------------------------------------------------- */
  function buildPartnerMap() {
    const map = {}; // stCode → Set<partnerCode>

    function add(a, b) {
      if (a === b) return;
      if (!map[a]) map[a] = new Set();
      if (!map[b]) map[b] = new Set();
      map[a].add(b);
      map[b].add(a);
    }

    // interscambi espliciti
    for (const line of Object.values(IZX_LINES)) {
      if (!line.INTERCHANGE) continue;
      for (const [a, b] of Object.entries(line.INTERCHANGE)) add(a, b);
    }

    // stazioni omonime
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

    // converti Set → Array
    const result = {};
    for (const [k, v] of Object.entries(map)) result[k] = [...v];
    return result;
  }

  /* ----------------------------------------------------------------
   * stationName(code)
   * Restituisce il nome leggibile di una stazione cercandola in tutte
   * le linee. Usato nel display del Journey.
   * ---------------------------------------------------------------- */
  function stationName(code) {
    for (const line of Object.values(IZX_LINES)) {
      if (line.ST[code]) return line.ST[code].n;
    }
    return code;
  }

  /* ----------------------------------------------------------------
   * nextTrip(lineId, svcId, boardCode, minDepSec)
   * Restituisce il primo trip del servizio svcId sulla linea lineId
   * che ferma a boardCode con dep ≥ minDepSec, nella direzione SB.
   * Prova anche NB; restituisce il più precoce tra i due.
   * ---------------------------------------------------------------- */
  function nextTrip(lineId, svcId, boardCode, minDepSec, alightCode) {
    const { hmToSec, secToHM } = TTEngine;
    const fromHM = secToHM(minDepSec);
    // cerca in una finestra di 3 ore
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
        // il trip deve fermare ANCHE alla stazione di discesa
        if (alightCode && !trip.stops[alightCode]) continue;

        const boardStop  = trip.stops[boardCode];
        const alightStop = alightCode ? trip.stops[alightCode] : null;
        if (!boardStop) continue;

        const boardSec  = hmToSec(boardStop.dep);
        const alightSec = alightStop ? hmToSec(alightStop.arr ?? alightStop.dep) : null;

        // verifica che alightCode venga DOPO boardCode nella direzione di marcia
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
   * Costruisce un Leg (tratto singolo) se esiste un trip valido.
   * ---------------------------------------------------------------- */
  function buildLeg(lineId, svcId, boardCode, alightCode, minDepSec) {
    const found = nextTrip(lineId, svcId, boardCode, minDepSec, alightCode);
    if (!found) return null;

    const { hmToSec, secToHM } = TTEngine;
    const { trip, boardStop, alightStop, boardSec, alightSec } = found;

    // nome logico del servizio (G_rapid / G_local → "G" per display)
    const svcLogical = svcId.replace(/_rapid$|_local$/, "");

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
    };
  }

  /* ----------------------------------------------------------------
   * search(from, to, depTime, opts)
   *
   * from     {string}  codice stazione di partenza (es. "R01")
   * to       {string}  codice stazione di destinazione (es. "SN08")
   * depTime  {string}  orario di partenza "HH:MM"
   * opts     {object}
   *   maxResults  {number}  default MAX_JOURNEYS
   *
   * Restituisce Journey[] ordinati per arrivalTime ASC.
   * Ogni Journey:
   *   {
   *     legs:         Leg[]
   *     departureTime: "HH:MM"
   *     arrivalTime:   "HH:MM"
   *     totalMinutes:  number
   *     transfers:     number   (= legs.length - 1)
   *     transferNodes: string[] codici stazione dove avviene il cambio
   *   }
   * ---------------------------------------------------------------- */
  function search(from, to, depTime, opts = {}) {
    const { hmToSec, secToHM } = TTEngine;
    const maxResults  = opts.maxResults ?? MAX_JOURNEYS;
    const depSec      = hmToSec(depTime);
    const partnerMap  = buildPartnerMap();
    const journeys    = [];

    /* ---- 1. Percorsi DIRETTI (nessun cambio) ---- */
    for (const [lineId, line] of Object.entries(IZX_LINES)) {
      // entrambe le stazioni devono essere sulla stessa linea
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
          transfers:     0,
          transferNodes: [],
        });
      }
    }

    /* ---- 2. Percorsi con UN CAMBIO ---- */
    // Per ogni nodo di interscambio raggiungibile da `from`:
    //   leg1: from → node  (arrivo al nodo)
    //   transfer: TRANSFER_SEC
    //   leg2: partner(node) → to

    // Raccoglie tutti i nodi intermedi raggiungibili da `from`
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
        // partnerNode deve essere su una linea che serve `to`
        for (const [lineId2, line2] of Object.entries(IZX_LINES)) {
          if (!line2.ST[partnerNode] || !line2.ST[to]) continue;

          // leg1: from → midNode
          for (const [lineId1, line1] of Object.entries(IZX_LINES)) {
            if (!line1.ST[from] || !line1.ST[midNode]) continue;

            for (const svcId1 of Object.keys(line1.SVC)) {
              if (!line1.TT[svcId1]) continue;
              const leg1 = buildLeg(lineId1, svcId1, from, midNode, depSec);
              if (!leg1) continue;

              // trasferimento: arrivo leg1 + TRANSFER_SEC
              const transferReadySec = leg1.alightArrSec + TRANSFER_SEC;

              // leg2: partnerNode → to
              for (const svcId2 of Object.keys(line2.SVC)) {
                if (!line2.TT[svcId2]) continue;
                // evita di riprendere lo stesso servizio sulla stessa linea
                // se la stazione di cambio è la stessa (sarebbe un diretto)
                if (lineId1 === lineId2 && svcId1 === svcId2 && midNode === partnerNode) continue;

                const leg2 = buildLeg(lineId2, svcId2, partnerNode, to, transferReadySec);
                if (!leg2) continue;

                const waitSec = leg2.boardDepSec - leg1.alightArrSec;

                journeys.push({
                  legs:          [leg1, leg2],
                  departureTime: leg1.boardDep,
                  arrivalTime:   leg2.alightArr,
                  totalMinutes:  Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
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
    // Rimuove duplicati (stessa dep + stesso arr + stesso percorso)
    const seen = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l => `${l.lineId}:${l.svcId}:${l.boardDep}:${l.alightArr}`).join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.sort((a, b) => {
      // prima per arrivalTime, poi per transfers (meno cambi = meglio)
      const { hmToSec } = TTEngine;
      const da = hmToSec(a.arrivalTime);
      const db = hmToSec(b.arrivalTime);
      if (da !== db) return da - db;
      return a.transfers - b.transfers;
    });

    return unique.slice(0, maxResults);
  }

  /* ----------------------------------------------------------------
   * formatJourney(journey)
   * Formatta un Journey come stringa leggibile (utile per debug/console).
   * ---------------------------------------------------------------- */
  function formatJourney(j) {
    const lines = [];
    lines.push(
      `Partenza ${j.departureTime} → Arrivo ${j.arrivalTime}` +
      ` (${j.totalMinutes} min, ${j.transfers} cambio/i)`
    );
    for (const [i, leg] of j.legs.entries()) {
      lines.push(
        `  Tratto ${i + 1}: [${leg.svcLogical}/${leg.svcId}] ${leg.svcName}` +
        ` · ${leg.boardName} ${leg.boardDep} → ${leg.alightName} ${leg.alightArr}` +
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

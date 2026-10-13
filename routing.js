/* ================================================================
   ROUTING.JS — IZX Journey Planner
   Dipende da: izx-data.js  (IZX_LINES)
               ax-data.js   (AX_LINES → incluso in IZX_LINES via tt-engine)
               fare-engine.js (IZXFare)
               tt-engine.js (TTEngine)

   API pubblica:
     IZXRouter.search(from, to, depTime, opts) → Journey[]
     IZXRouter.interchangeNodes()              → Set<string>
     IZXRouter.buildLeg(lineId, svcId, boardCode, alightCode, minDepSec)
               → Leg | null   (usato da SuburbanRouter per cross-network)
     IZXRouter.allStations()                   → Station[]
     IZXRouter.allLines()                      → Line[]

   Algoritmo: Connection Scan Algorithm (CSA) semplificato.
   Supporta:
     - Percorso diretto (stesso servizio, stessa linea)
     - Percorso con un cambio (transfer in una stazione di interscambio)
   Tempo di interscambio: TRANSFER_MIN (default 5 minuti).

   FIX (SHORT_WORKING + nextTrip):
     nextTrip ora usa trip.terminus (esposto da tt-engine FIX) per
     distinguere tre casi quando alightCode è assente da trip.stops:
       a) terminus prima di alightCode nella sequenza → skip silenzioso
          (comportamento corretto: il treno termina prima)
       b) terminus dopo/uguale ad alightCode ma stop mancante →
          console.warn (anomalia dati) + skip
       c) terminus non disponibile (dato vecchio) → skip silenzioso
          come prima

   FIX 11 (short-working no-results transparency):
     Quando tutti i trip di un svcId terminano prima di alightCode
     per regole SHORT_WORKING, buildLeg restituisce null e il
     journey sparisce silenziosamente. Aggiunto _diagnoseBuildLeg()
     che rileva questo caso e fa sì che search() emetta un journey
     sintetico con { noService: true, noServiceReason: 'short_working',
     noServiceTerminus, noServiceLine, noServiceSvc } invece di
     restituire zero risultati. Il frontend usa questo flag per
     mostrare un avviso "Ultimo servizio fino a <terminus>".
     Inoltre nextTrip cappа toHM a '24:29' per evitare overflow
     quando minDepSec + SEARCH_WINDOW supera SERVICE_END.
================================================================ */

const IZXRouter = (() => {

  const TRANSFER_MIN   = 5;
  const TRANSFER_SEC   = TRANSFER_MIN * 60;
  const MAX_JOURNEYS   = 5;
  const SEARCH_WINDOW  = 3 * 3600;

  const AX_SVC_VARIANTS = new Set(['EST', 'BAJ', 'SAK']);

  function _lineFilter(opts) {
    const raw = opts.lines;
    if (!raw || raw === 'ALL') return null;
    const list = Array.isArray(raw) ? raw : [raw];
    return new Set(list);
  }

  function interchangeNodes() {
    const nodes = new Set();
    for (const line of Object.values(IZX_LINES)) {
      if (!line.INTERCHANGE) continue;
      for (const [a, b] of Object.entries(line.INTERCHANGE)) {
        nodes.add(a); nodes.add(b);
      }
      if (line.INTERCHANGE_EXTRA) {
        for (const [a, partners] of Object.entries(line.INTERCHANGE_EXTRA)) {
          nodes.add(a);
          for (const b of partners) nodes.add(b);
        }
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
      if (line.INTERCHANGE_EXTRA) {
        for (const [a, partners] of Object.entries(line.INTERCHANGE_EXTRA)) {
          for (const b of partners) add(a, b);
        }
      }
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

  function stationName(code) {
    for (const line of Object.values(IZX_LINES)) {
      if (line.ST[code]) return line.ST[code].n;
    }
    return code;
  }

  function allStations() {
    const seen = new Set();
    const out  = [];
    for (const line of Object.values(IZX_LINES)) {
      for (const code of line.CANONICAL) {
        if (seen.has(code)) continue;
        seen.add(code);
        const st = line.ST[code];
        if (!st) continue;
        out.push({ code, name: st.n, kanji: st.k || '' });
      }
    }
    return out;
  }

  function allLines() {
    return Object.entries(IZX_LINES).map(([id, line]) => ({
      id,
      name:  line.NAME  || id,
      color: line.COLOR || '#888',
    }));
  }

  function stationKm(lineId, code) {
    const line = IZX_LINES[lineId];
    if (!line) return null;
    const st = line.ST[code];
    return (st && st.km != null) ? st.km : null;
  }

  /* ----------------------------------------------------------------
   * _terminusPrecedesAlight(trip, lineId, alightCode)
   * Restituisce true se il terminus del trip si trova PRIMA di
   * alightCode nella sequenza SVC.stops della linea (direzione SB)
   * oppure DOPO in direzione NB — cioè se il treno termina prima
   * di raggiungere alightCode.
   * Usato da nextTrip per distinguere "treno corto" (skip silenzioso)
   * da "anomalia dati" (console.warn).
   * ---------------------------------------------------------------- */
  function _terminusPrecedesAlight(trip, lineId, alightCode) {
    const line = IZX_LINES[lineId];
    if (!line || !trip.terminus) return null; // sconosciuto
    const svc = line.SVC[trip.svcId];
    if (!svc) return null;
    const seq = trip.direction === 'NB'
      ? [...svc.stops].reverse()
      : svc.stops;
    const iTerm   = seq.indexOf(trip.terminus);
    const iAlight = seq.indexOf(alightCode);
    if (iTerm === -1 || iAlight === -1) return null;
    return iTerm < iAlight; // terminus viene prima di alightCode nella direzione di marcia
  }

  function nextTrip(lineId, svcId, boardCode, minDepSec, alightCode) {
    const { hmToSec, secToHM } = TTEngine;
    const fromHM = secToHM(minDepSec);
    // FIX 11: cappа toHM a 24:29 per non superare SERVICE_END del tt-engine
    const toHM   = secToHM(Math.min(minDepSec + SEARCH_WINDOW, 88140)); // 88140 = 24:29:00
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
        if (alightCode && !trip.stops[alightCode]) {
          // FIX: alightCode assente — capire se è un treno corto o un'anomalia dati
          const precedes = _terminusPrecedesAlight(trip, lineId, alightCode);
          if (precedes === true) {
            // Treno corto: termina prima di alightCode — skip silenzioso (corretto)
            continue;
          } else if (precedes === false) {
            // Anomalia dati: terminus è oltre alightCode ma la fermata manca
            console.warn(
              `[IZXRouter] Trip ${trip._uid}: terminus ${trip.terminus} is beyond` +
              ` alightCode ${alightCode} but stop is missing from trip.stops.` +
              ` Possible data error in TT/${svcId}.`
            );
          }
          // In entrambi i casi non possiamo usare questo trip
          continue;
        }
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
   * _diagnoseBuildLeg(lineId, svcId, boardCode, alightCode, minDepSec)
   *                                                           FIX 11
   * Chiamato quando buildLeg restituisce null. Cerca il prossimo
   * trip del servizio ignorando alightCode per capire se il miss
   * è dovuto a SHORT_WORKING (tutti i trip terminano prima di
   * alightCode) o a un'assenza vera di servizio.
   *
   * Restituisce:
   *   { reason: 'short_working', terminus: <code> }  — treno corto
   *   { reason: 'no_service' }                        — nessun viaggio
   *   null                                            — non diagnosticabile
   * ---------------------------------------------------------------- */
  function _diagnoseBuildLeg(lineId, svcId, boardCode, alightCode, minDepSec) {
    const { hmToSec, secToHM } = TTEngine;
    const fromHM = secToHM(minDepSec);
    const toHM   = secToHM(Math.min(minDepSec + SEARCH_WINDOW, 88140));

    let foundAny = false;
    let shortWorkingTerminus = null;

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
        const boardStop = trip.stops[boardCode];
        if (!boardStop) continue;
        const boardSec = hmToSec(boardStop.dep);
        if (boardSec < minDepSec) continue;
        foundAny = true;

        if (!trip.stops[alightCode]) {
          const precedes = _terminusPrecedesAlight(trip, lineId, alightCode);
          if (precedes === true && trip.terminus) {
            // Tutti i trip in questa finestra terminano prima di alightCode
            shortWorkingTerminus = trip.terminus;
          }
        } else {
          // Almeno un trip raggiunge alightCode: non è short-working
          return null;
        }
      }
    }

    if (!foundAny) return { reason: 'no_service' };
    if (shortWorkingTerminus) return { reason: 'short_working', terminus: shortWorkingTerminus };
    return null;
  }

  function buildLeg(lineId, svcId, boardCode, alightCode, minDepSec) {
    const found = nextTrip(lineId, svcId, boardCode, minDepSec, alightCode);
    if (!found) return null;
    const { trip, boardStop, alightStop, boardSec, alightSec } = found;
    const svcLogical = AX_SVC_VARIANTS.has(svcId)
      ? 'AX'
      : svcId.replace(/_rapid$|_local$/, "");

    const kmBoard  = stationKm(lineId, boardCode);
    const kmAlight = stationKm(lineId, alightCode);
    const legKm = (kmBoard != null && kmAlight != null)
      ? Math.abs(kmAlight - kmBoard)
      : null;

    const canon   = IZX_LINES[lineId]?.SVC[svcId]?.stops ?? [];
    const ordered = trip.direction === 'NB' ? [...canon].reverse() : canon;
    const bi = ordered.indexOf(boardCode);
    const ai = ordered.indexOf(alightCode);
    const intermediateStops = (bi !== -1 && ai !== -1)
      ? ordered.slice(bi + 1, ai)
          .filter(code => trip.stops[code])
          .map(code => ({
            code,
            name: stationName(code),
            arr:  trip.stops[code].arr,
            dep:  trip.stops[code].dep,
          }))
      : [];

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
      km:           legKm,
      intermediateStops,
    };
  }

  function _paretoDedup(journeys) {
    const { hmToSec } = TTEngine;

    const seen   = new Set();
    const unique = journeys.filter(j => {
      // I journey noService non partecipano alla deduplicazione normale
      if (j.noService) return true;
      const key = j.legs.map(l =>
        `${l.lineId}:${l.svcId}:${l.boardDep}:${l.alightArr}`
      ).join("|");
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });

    unique.sort((a, b) => {
      // I journey noService vanno in fondo
      if (a.noService && !b.noService) return 1;
      if (!a.noService && b.noService) return -1;
      const da = hmToSec(a.arrivalTime),   db = hmToSec(b.arrivalTime);
      if (da !== db) return da - db;
      const ta = a.transfers ?? 0,         tb = b.transfers ?? 0;
      if (ta !== tb) return ta - tb;
      return hmToSec(b.departureTime) - hmToSec(a.departureTime);
    });

    const kept = [];
    for (const j of unique) {
      if (j.noService) { kept.push(j); continue; }
      const arrJ = hmToSec(j.arrivalTime);
      const depJ = hmToSec(j.departureTime);
      const trJ  = j.transfers ?? 0;

      const dominated = kept.filter(k => !k.noService).some(k => {
        const arrK = hmToSec(k.arrivalTime);
        const depK = hmToSec(k.departureTime);
        const trK  = k.transfers ?? 0;
        if (!(arrK <= arrJ && depK >= depJ && trK <= trJ)) return false;
        return (arrK < arrJ) || (depK > depJ) || (trK < trJ);
      });

      if (!dominated) kept.push(j);
    }
    return kept;
  }

  function search(from, to, depTime, opts = {}) {
    const { hmToSec } = TTEngine;
    const maxResults  = opts.maxResults ?? MAX_JOURNEYS;
    const directOnly  = !!opts.directOnly;
    const depSec      = hmToSec(depTime);
    const partnerMap  = buildPartnerMap();
    const journeys    = [];
    const lineAllowed = _lineFilter(opts);

    // FIX 11: traccia eventuali miss per short-working nella fase diretta
    const shortWorkingMisses = [];

    for (const [lineId, line] of Object.entries(IZX_LINES)) {
      if (lineAllowed && !lineAllowed.has(lineId)) continue;
      const hasFrom = line.ST[from] !== undefined;
      const hasTo   = line.ST[to]   !== undefined;
      if (!hasFrom || !hasTo) continue;
      for (const svcId of Object.keys(line.SVC)) {
        if (!line.TT[svcId]) continue;
        const leg = buildLeg(lineId, svcId, from, to, depSec);
        if (!leg) {
          // FIX 11: diagnostica il miss
          const diag = _diagnoseBuildLeg(lineId, svcId, from, to, depSec);
          if (diag && diag.reason === 'short_working') {
            shortWorkingMisses.push({
              lineId, svcId, terminus: diag.terminus,
            });
          }
          continue;
        }
        journeys.push({
          legs:          [leg],
          departureTime: leg.boardDep,
          arrivalTime:   leg.alightArr,
          totalMinutes:  Math.round((leg.alightArrSec - leg.boardDepSec) / 60),
          totalKm:       leg.km,
          transfers:     0,
          transferNodes: [],
        });
      }
    }

    if (!directOnly) {
      const reachableInterchanges = new Set();
      for (const [lineId, line] of Object.entries(IZX_LINES)) {
        if (lineAllowed && !lineAllowed.has(lineId)) continue;
        if (!line.ST[from]) continue;
        for (const code of line.CANONICAL) {
          if (partnerMap[code]) reachableInterchanges.add(code);
        }
      }

      for (const midNode of reachableInterchanges) {
        const partners = partnerMap[midNode] ?? [];
        for (const partnerNode of partners) {
          for (const [lineId2, line2] of Object.entries(IZX_LINES)) {
            if (lineAllowed && !lineAllowed.has(lineId2)) continue;
            if (!line2.ST[partnerNode] || !line2.ST[to]) continue;
            for (const [lineId1, line1] of Object.entries(IZX_LINES)) {
              if (lineAllowed && !lineAllowed.has(lineId1)) continue;
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
                  const totalKm = (leg1.km != null && leg2.km != null)
                    ? leg1.km + leg2.km
                    : (leg1.km ?? leg2.km ?? null);
                  journeys.push({
                    legs:            [leg1, leg2],
                    departureTime:   leg1.boardDep,
                    arrivalTime:     leg2.alightArr,
                    totalMinutes:    Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
                    totalKm,
                    transfers:       1,
                    transferNodes:   [midNode],
                    transferWaitMin: Math.round(waitSec / 60),
                  });
                }
              }
            }
          }
        }
      }
    }

    // FIX 11: se non ci sono journey normali e ci sono miss short-working,
    // emetti journey sintetici noService per ogni miss distinto.
    // Se ci sono già journey validi, i noService vengono soppressi
    // (la rotta esiste comunque, ad es. via cambio).
    const normalJourneys = journeys.filter(j => !j.noService);
    if (normalJourneys.length === 0 && shortWorkingMisses.length > 0) {
      const seen = new Set();
      for (const miss of shortWorkingMisses) {
        const key = `${miss.lineId}:${miss.svcId}:${miss.terminus}`;
        if (seen.has(key)) continue;
        seen.add(key);
        journeys.push({
          legs:              [],
          departureTime:     null,
          arrivalTime:       null,
          totalMinutes:      null,
          totalKm:           null,
          transfers:         0,
          transferNodes:     [],
          noService:         true,
          noServiceReason:   'short_working',
          noServiceTerminus: miss.terminus,
          noServiceLine:     miss.lineId,
          noServiceSvc:      miss.svcId,
        });
      }
    }

    return _paretoDedup(journeys).slice(0, maxResults);
  }

  function formatJourney(j) {
    if (j.noService) {
      return `[Nessun servizio diretto] Il treno ${j.noServiceSvc} termina a` +
             ` ${stationName(j.noServiceTerminus)} in quest'orario (short-working).`;
    }
    const lines = [];
    lines.push(
      `Partenza ${j.departureTime} \u2192 Arrivo ${j.arrivalTime}` +
      ` (${j.totalMinutes} min, ${j.transfers} cambio/i` +
      (j.totalKm != null ? `, ${j.totalKm.toFixed(1)} km` : '') + ')'
    );
    for (const [i, leg] of j.legs.entries()) {
      lines.push(
        `  Tratto ${i + 1}: [${leg.svcLogical}/${leg.svcId}] ${leg.svcName}` +
        ` \u00b7 ${leg.boardName} ${leg.boardDep} \u2192 ${leg.alightName} ${leg.alightArr}` +
        (leg.km != null ? ` \u00b7 ${leg.km.toFixed(1)} km` : '') +
        ` \u00b7 Treno ${leg.trainNumber ?? "--"}`
      );
      if (i < j.legs.length - 1) {
        lines.push(
          `    \u2195 Cambio a ${stationName(j.transferNodes[i])}` +
          ` \u2014 attesa ${j.transferWaitMin ?? TRANSFER_MIN} min`
        );
      }
    }
    return lines.join("\n");
  }

  return {
    search,
    buildLeg,
    interchangeNodes,
    buildPartnerMap,
    stationName,
    allStations,
    allLines,
    formatJourney,
    TRANSFER_MIN,
  };

})();

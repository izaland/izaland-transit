/* ================================================================
   TT-ENGINE — Motore universale orari IZX
   Dipende da: izx-data.js (IZX_LINES, TRAIN_NUM_CONFIG)
   API pubblica: TTEngine.query(opts) → Array<Trip>
================================================================ */

const TTEngine = (() => {

  /* ---- utilità tempo ---- */
  function hmToSec(hm) {
    const [h, m] = hm.split(":").map(Number);
    return h * 3600 + m * 60;
  }
  function secToHM(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }
  function isPeak(sec, peakWindows) {
    return peakWindows.some(w => sec >= hmToSec(w.start) && sec < hmToSec(w.end));
  }

  /* ----------------------------------------------------------------
   * trainNumber(lineId, svcId, direction, tripIndex)
   *
   * Calcola il numero di corsa secondo lo schema TRAIN_NUM_CONFIG:
   *
   *   numero = lineDigit × 10000
   *          + svcBase × 100
   *          + seq
   *
   * dove seq è un contatore progressivo per direzione:
   *   SB (Outbound) → numeri PARI  (seq = tripIndex × 2 + 2)
   *   NB (Inbound)  → numeri DISPARI (seq = tripIndex × 2 + 1)
   *
   * Il numero è sempre a 5 cifre, zero-padded.
   * Esempio: KE-A-SB terzo treno → 1×10000 + 0×100 + 6 = 10006
   *          RY-I-NB primo treno → 2×10000 + 30×100 + 1 = 23001
   * ---------------------------------------------------------------- */
  function trainNumber(lineId, svcId, direction, tripIndex) {
    const cfg = typeof TRAIN_NUM_CONFIG !== "undefined" ? TRAIN_NUM_CONFIG : null;
    if (!cfg || !cfg[lineId]) return null;
    const { lineDigit, svcBase } = cfg[lineId];
    const base = svcBase[svcId] ?? 0;
    const seq  = direction === "NB"
      ? tripIndex * 2 + 1   // dispari → inbound
      : tripIndex * 2 + 2;  // pari    → outbound
    const num = lineDigit * 10000 + base * 100 + seq;
    return String(num).padStart(5, "0");
  }

  /**
   * Restituisce true se la fermata è attiva per questo trip.
   *
   * Regole supportate:
   *   "peak"     — solo nelle ore di punta
   *   "alternate"— in alternanza (ogni 2 corse), con phase opzionale
   *   "always"   — sempre attiva (usato per terminali fissi)
   *   "direct"   — attiva sui treni diretti (routeType !== "punohai")
   *   "punohai"  — attiva solo sui treni via Punohai (routeType === "punohai")
   *
   * I treni Daidōn alternano percorso diretto e via Punohai:
   *   tripIndex pari  → diretto  (DI13 transito, DI131 saltata)
   *   tripIndex dispari → punohai (DI131 fermata, DI13 saltata/transitata)
   */
  function stopIsActive(code, conditionalStops, tripIndex, peakNow, routeType) {
    if (!conditionalStops?.[code]) return true;
    const rule = conditionalStops[code].rule;
    if (rule === "peak")     return peakNow;
    if (rule === "alternate") return (tripIndex + (conditionalStops[code].phase ?? 0)) % 2 === 0;
    if (rule === "always")   return true;
    if (rule === "direct")   return routeType !== "punohai";
    if (rule === "punohai")  return routeType === "punohai";
    return true;
  }

  /**
   * Dwell in secondi per una fermata.
   * DI13 Sasshi è un transito: il treno non si ferma (0 s dwell).
   * Tutte le altre fermate: 60 s.
   */
  const TRANSIT_STATIONS = new Set(["DI13"]);
  function dwellSec(code) {
    return TRANSIT_STATIONS.has(code) ? 0 : 60;
  }

  /* ---- genera tutte le corse di un servizio in una direzione ---- */
  function generateTripsForService(lineId, svcId, dir, fromSec, toSec) {
    const line   = IZX_LINES[lineId];
    const svc    = line.SVC[svcId];
    const tt     = line.TT[svcId];
    const freq   = line.FREQ[svcId];
    const peaks  = line.PEAK;
    const offset = (line.OFFSETS?.[svcId] ?? 0) * 60;

    // fermate in ordine canonico per la direzione
    const stopsRaw = svc.stops.filter(s => tt[s] !== undefined);
    const stops    = dir === "NB" ? [...stopsRaw].reverse() : stopsRaw;

    if (stops.length < 2) return [];

    const totalDuration = tt[stopsRaw[stopsRaw.length - 1]];

    // In SB il terminus viene scelto con TERMINUS_SPLIT (round-robin sui pesi).
    // In NB il treno torna verso l'origine SB, quindi il terminus è sempre
    // la prima stazione del percorso SB (stopsRaw[0]).
    const splits = dir === "SB" ? (line.TERMINUS_SPLIT?.[svcId] ?? null) : null;
    const nbTerminus = dir === "NB" ? stopsRaw[0] : null;

    const SERVICE_START = hmToSec("06:00");
    const SERVICE_END   = hmToSec("24:30"); // ultimo treno parte entro 24:30 (manutenzione notturna)

    const trips = [];
    let   cursor = SERVICE_START + offset;

    while (cursor <= SERVICE_END) {
      const tripIndex = trips.length;
      const peakNow   = isPeak(cursor, peaks);
      const freq_ph   = peakNow ? freq.peak : freq.offpeak;
      // freq_ph può essere 0.5 (ogni 2 ore) → interval = 7200 s
      const interval  = Math.round(3600 / freq_ph);

      // Determina il tipo di percorso per i treni Daidōn
      // I treni di indice pari sono "diretti", dispari sono "punohai"
      // (valido per servizi I, IS, IL che usano le regole direct/punohai)
      const hasPunohaiRule = Object.values(svc.conditionalStops || {}).some(
        r => r.rule === "punohai" || r.rule === "direct"
      );
      const routeType = hasPunohaiRule
        ? (tripIndex % 2 === 0 ? "direct" : "punohai")
        : null;

      // Scegli terminus:
      //   NB → sempre stopsRaw[0] (origine del percorso SB = Sainðaul)
      //   SB → round-robin su TERMINUS_SPLIT (o ultima fermata se non definito)
      let terminus = stops[stops.length - 1];
      if (nbTerminus) {
        terminus = nbTerminus;
      } else if (splits && splits.length > 0) {
        const totalWeight = splits.reduce((a, b) => a + b.weight, 0);
        let acc = 0;
        const slot = tripIndex % totalWeight;
        for (const sp of splits) {
          acc += sp.weight;
          if (slot < acc) { terminus = sp.terminus; break; }
        }
      }

      // ---- SHORT WORKING: sovrascrive terminus per corse notturne ----
      // Legge SHORT_WORKING dalla definizione della linea in izx-data.js.
      // Ogni regola: { svcId, dir ("SB"|"NB"|"BOTH"), cutoff ("HH:MM"), terminus }
      // La prima regola che soddisfa tutte le condizioni vince.
      // Il terminus ridotto deve esistere nel TT del servizio, altrimenti
      // la regola viene ignorata silenziosamente.
      const swRules = line.SHORT_WORKING ?? [];
      for (const sw of swRules) {
        const dirMatch = sw.dir === "BOTH" || sw.dir === dir;
        if (dirMatch && sw.svcId === svcId && cursor >= hmToSec(sw.cutoff)) {
          if (tt[sw.terminus] !== undefined) {
            terminus = sw.terminus;
          }
          break;
        }
      }
      // ---- fine SHORT WORKING ----

      // Per i treni via Punohai il TT usa DI131 + DI14 (via Punohai);
      // il timing di DI14 via Punohai = DI131 + 1286 s (calcolato qui
      // se non esplicitamente presente nel TT).
      // Il TT base (I/IS/IL) contiene DI14 come valore diretto; per la
      // variante Punohai costruiamo il timing DI14 dinamicamente.
      function getOffset(stCode) {
        if (routeType === "punohai" && stCode === "DI14" && tt["DI131"] !== undefined) {
          // DI14 via Punohai = DI131 + 1286 s
          return tt["DI131"] + 1286;
        }
        return tt[stCode];
      }

      // costruisci le fermate del trip
      const tripStops = {};
      const conditionalStops = svc.conditionalStops || null;

      for (const st of stops) {
        if (!stopIsActive(st, conditionalStops, tripIndex, peakNow, routeType)) continue;

        const rawOffset = dir === "NB"
          ? (totalDuration - getOffset(st))
          : getOffset(st);

        if (rawOffset === undefined) continue;

        const depSec = cursor + rawOffset;
        const dwell  = dwellSec(st);
        const arrSec = depSec - dwell;

        tripStops[st] = {
          arr:     secToHM(arrSec < cursor ? depSec : arrSec),
          dep:     secToHM(depSec),
          transit: dwell === 0,   // true per le stazioni di transito (DI13)
        };
        if (st === terminus) break;
      }

      // filtra: includi solo se il trip ferma nel range richiesto
      const depTimes = Object.values(tripStops).map(t => hmToSec(t.dep));
      if (depTimes.length > 0) {
        const minDep = Math.min(...depTimes);
        const maxDep = Math.max(...depTimes);

        if (maxDep >= fromSec && minDep <= toSec) {
          trips.push({
            _uid:        `${lineId}:${svcId}:${dir}:${cursor}`,
            lineId,
            svcId,
            name:        svc.name,
            color:       svc.color,
            cls:         svc.cls,
            direction:   dir,
            origin:      stops[0],
            terminus,
            routeType,   // "direct" | "punohai" | null
            trainNumber: trainNumber(lineId, svcId, dir, tripIndex),
            stops:       tripStops,
          });
        }
      }

      cursor += interval;
    }

    return trips;
  }

  /* ---- raggruppa coppie dichiarate con svc.pair (es. K+J) ---- */
  function groupPairs(trips) {
    const out  = [];
    const used = new Set();

    for (const trip of trips) {
      if (used.has(trip._uid)) continue;

      const svc       = IZX_LINES[trip.lineId]?.SVC?.[trip.svcId];
      const pairSvcId = svc?.pair;

      if (pairSvcId) {
        const depKey = t => Object.values(t.stops)[0].dep;
        const twin   = trips.find(t =>
          !used.has(t._uid)             &&
          t.lineId    === trip.lineId   &&
          t.svcId     === pairSvcId     &&
          t.direction === trip.direction &&
          depKey(t)   === depKey(trip)
        );

        if (twin) {
          out.push({
            ...trip,
            _paired:         true,
            _twin:           twin,
            terminusDisplay: `${trip.terminus} / ${twin.terminus}`,
            nameDisplay:     `${trip.svcId}+${twin.svcId}`,
          });
          used.add(trip._uid);
          used.add(twin._uid);
          continue;
        }
      }

      out.push(trip);
      used.add(trip._uid);
    }
    return out;
  }

  /* ---- API pubblica ---- */

  /**
   * TTEngine.query(opts) → Trip[]
   *
   * opts:
   *   lines      {string|string[]}  "KE" | "RY" | ["KE","RY"] | "ALL"
   *   station    {string}           codice fermata (es. "K08", "DI3", "DI131")
   *   direction  {string}           "SB" | "NB" | "" (entrambe)
   *   fromTime   {string}           "HH:MM"
   *   toTime     {string}           "HH:MM"  (default "23:30")
   *   services   {string[]}         filtro servizi opzionale (es. ["I","IS","IL"])
   *
   * Ogni Trip include il campo `trainNumber` (stringa a 5 cifre, es. "10006").
   * Schema:
   *   [lineDigit 1c][svcBase 2c][seq 2c]
   *   SB → seq pari (2,4,6,…) · NB → seq dispari (1,3,5,…)
   *
   * Nota sui servizi Daidōn (I / IS / IL):
   *   Ogni Trip include il campo `routeType`:
   *     "direct"  → percorso diretto (DI13 transito, DI131 saltata)
   *     "punohai" → percorso via Punohai (DI131 fermata, DI13 saltata)
   *   Le fermate di transito hanno il flag `transit: true` nell'oggetto fermata.
   *
   * SHORT_WORKING:
   *   Alcune corse notturne terminano a un capolinea ridotto definito in
   *   line.SHORT_WORKING. Il campo `terminus` del Trip riflette già la
   *   stazione ridotta; nessun campo aggiuntivo è necessario lato UI.
   *
   * Orario di servizio:
   *   Prima corsa: 06:00 (+ offset per linea)
   *   Ultima partenza dal capolinea: max 24:30
   *   La rete è chiusa dalle 24:30 per la manutenzione notturna.
   */
  function query(opts = {}) {
    const {
      lines     = "ALL",
      station   = null,
      direction = "",
      fromTime  = "06:00",
      toTime    = "23:30",
      services  = null,
    } = opts;

    const fromSec = hmToSec(fromTime);
    const toSec   = hmToSec(toTime);

    let lineIds;
    if (lines === "ALL")           lineIds = Object.keys(IZX_LINES);
    else if (Array.isArray(lines)) lineIds = lines;
    else                           lineIds = [lines];

    const dirs = direction ? [direction] : ["SB", "NB"];
    const results = [];

    for (const lineId of lineIds) {
      const line = IZX_LINES[lineId];
      if (!line) continue;

      const svcIds = services
        ? Object.keys(line.SVC).filter(s => services.includes(s))
        : Object.keys(line.SVC);

      for (const svcId of svcIds) {
        if (!line.TT[svcId]) continue;

        for (const dir of dirs) {
          const trips = generateTripsForService(lineId, svcId, dir, fromSec, toSec);

          // filtra per stazione se richiesta
          // DI131 Punohai: inclusa anche nei trip punohai anche se non
          // appare nei svc.stops canonici (viene aggiunta dinamicamente)
          const filtered = station
            ? trips.filter(t => t.stops[station] !== undefined)
            : trips;

          results.push(...filtered);
        }
      }
    }

    // ordina per orario di partenza alla stazione cercata (o prima fermata)
    results.sort((a, b) => {
      const getKey = t => station && t.stops[station]
        ? hmToSec(t.stops[station].dep)
        : hmToSec(Object.values(t.stops)[0].dep);
      return getKey(a) - getKey(b);
    });

    return groupPairs(results);
  }

  /**
   * TTEngine.allStations() → [{lineId, code, name, kanji, branch}]
   * Utile per popolare il dropdown unificato.
   */
  function allStations() {
    const seen = new Set();
    const out  = [];
    for (const [lineId, line] of Object.entries(IZX_LINES)) {
      for (const code of line.CANONICAL) {
        const key = `${lineId}:${code}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const st = line.ST[code];
        if (!st) continue;
        out.push({ lineId, code, name: st.n, kanji: st.k, branch: st.b });
      }
    }
    return out;
  }

  return { query, allStations, hmToSec, secToHM };

})();

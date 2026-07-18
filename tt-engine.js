/* ================================================================
   TT-ENGINE — Motore universale orari IZX
   Dipende da: izx-data.js (IZX_LINES)
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

    const splits = line.TERMINUS_SPLIT?.[svcId];

    const SERVICE_START = hmToSec("06:00");
    const SERVICE_END   = hmToSec("23:30");

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

      // scegli terminus con round-robin sui pesi
      let terminus = stops[stops.length - 1];
      if (splits && splits.length > 0) {
        const totalWeight = splits.reduce((a, b) => a + b.weight, 0);
        let acc = 0;
        const slot = tripIndex % totalWeight;
        for (const sp of splits) {
          acc += sp.weight;
          if (slot < acc) { terminus = sp.terminus; break; }
        }
      }

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
            _uid:      `${lineId}:${svcId}:${dir}:${cursor}`,
            lineId,
            svcId,
            name:      svc.name,
            color:     svc.color,
            cls:       svc.cls,
            direction: dir,
            origin:    stops[0],
            terminus,
            routeType, // "direct" | "punohai" | null
            stops:     tripStops,
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
   * Nota sui servizi Daidōn (I / IS / IL):
   *   Ogni Trip include il campo `routeType`:
   *     "direct"  → percorso diretto (DI13 transito, DI131 saltata)
   *     "punohai" → percorso via Punohai (DI131 fermata, DI13 saltata)
   *   Le fermate di transito hanno il flag `transit: true` nell'oggetto fermata.
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

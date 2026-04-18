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

  /* ---- genera tutte le corse di un servizio in una direzione ---- */
  function generateTripsForService(lineId, svcId, dir, fromSec, toSec) {
    const line   = IZX_LINES[lineId];
    const svc    = line.SVC[svcId];
    const tt     = line.TT[svcId];
    const freq   = line.FREQ[svcId];
    const peaks  = line.PEAK;
    const offset = (line.OFFSETS?.[svcId] ?? 0) * 60;

    // stops in ordine corretto per la direzione
    const stopsRaw = svc.stops.filter(s => tt[s] !== undefined);
    const stops    = dir === "NB" ? [...stopsRaw].reverse() : stopsRaw;

    if (stops.length < 2) return [];

    // offset dell'origine nel TT (per NB è l'ultima fermata)
    const originKey     = stops[0];
    const originOffset  = dir === "NB" ? tt[stopsRaw[stopsRaw.length - 1]] : 0;
    const totalDuration = tt[stopsRaw[stopsRaw.length - 1]];

    // terminus_split: peso per questa direzione
    const splits = line.TERMINUS_SPLIT?.[svcId];

    // Genera corse ogni intervallo, da SERVICE_START a SERVICE_END
    const SERVICE_START = hmToSec("06:00");
    const SERVICE_END   = hmToSec("23:30");

    const trips = [];
    let   cursor = SERVICE_START + offset;

    while (cursor <= SERVICE_END) {
      const freq_ph  = isPeak(cursor, peaks) ? freq.peak : freq.offpeak;
      const interval = Math.round(3600 / freq_ph);

      // scegli terminus con round-robin sui pesi
      let terminus = stops[stops.length - 1];
      if (splits && splits.length > 0) {
        const totalWeight = splits.reduce((a, b) => a + b.weight, 0);
        const tripIndex   = trips.length;
        let   acc = 0;
        const slot = tripIndex % totalWeight;
        for (const sp of splits) {
          acc += sp.weight;
          if (slot < acc) { terminus = sp.terminus; break; }
        }
      }

      // costruisci le fermate del trip fino al terminus scelto
      const tripStops = {};
      for (const st of stops) {
        const rawOffset = dir === "NB"
          ? (totalDuration - tt[st])
          : tt[st];
        const depSec = cursor + rawOffset;
        const arrSec = depSec - 60; // dwell 60s
        tripStops[st] = {
          arr: secToHM(arrSec < cursor ? depSec : arrSec),
          dep: secToHM(depSec),
        };
        if (st === terminus) break;
      }

      // filtra: includi solo se il trip ferma nel range richiesto
      const depTimes = Object.values(tripStops).map(t => hmToSec(t.dep));
      const minDep   = Math.min(...depTimes);
      const maxDep   = Math.max(...depTimes);

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
          stops:     tripStops,
        });
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
          !used.has(t._uid)          &&
          t.lineId    === trip.lineId    &&
          t.svcId     === pairSvcId      &&
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
   *   station    {string}           codice fermata (es. "K08", "R06")
   *   direction  {string}           "SB" | "NB" | "" (entrambe)
   *   fromTime   {string}           "HH:MM"
   *   toTime     {string}           "HH:MM"  (default "23:30")
   *   services   {string[]}         filtro servizi opzionale (es. ["A","B"])
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

    // risolvi quali linee cercare
    let lineIds;
    if (lines === "ALL")            lineIds = Object.keys(IZX_LINES);
    else if (Array.isArray(lines))  lineIds = lines;
    else                            lineIds = [lines];

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
          const filtered = station
            ? trips.filter(t => t.stops[station] !== undefined)
            : trips;

          results.push(...filtered);
        }
      }
    }

    // ordina per orario di partenza alla stazione cercata (o origine)
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

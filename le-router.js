/* ================================================================
   LE-ROUTER.JS — Limited Express Network Router
   ================================================================
   Router autonomo per la rete LE (tokkyū / airport express).
   Stessa interfaccia pubblica di IZXRouter:
     .search(from, to, depTime, opts)  → Journey[]
     .allStations()                    → {code, name, kanji}[]
     .hasStation(code)                 → boolean

   Dipende da:
     tt-engine.js   — TTEngine (generazione orari)
     le-data.js     — LE_LINES (registro linee LE)
================================================================ */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.LERouter = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ── Costanti ─────────────────────────────────────────────────── */
  const DEFAULT_WINDOW_MIN = 120;
  const MAX_RESULTS        = 5;

  /* ── Utility tempo ────────────────────────────────────────────── */
  function hmToSec(hm) {
    if (!hm) return 0;
    const [h, m] = hm.split(':').map(Number);
    return h * 3600 + m * 60;
  }
  function secToHM(sec) {
    const s = ((sec % 86400) + 86400) % 86400;
    return String(Math.floor(s / 3600)).padStart(2, '0') + ':'
         + String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  }

  /* ── Station index ────────────────────────────────────────────── */
  let _stationIndex = null;

  function _buildStationIndex() {
    if (_stationIndex) return _stationIndex;
    const map = {};
    for (const line of Object.values(LE_LINES)) {
      for (const [code, st] of Object.entries(line.ST)) {
        if (!map[code]) map[code] = { code, name: st.n, kanji: st.k, lineId: line.id };
      }
    }
    _stationIndex = map;
    return map;
  }

  function allStations() {
    return Object.values(_buildStationIndex());
  }

  function hasStation(code) {
    return !!_buildStationIndex()[code];
  }

  /* ── Ricerca linee che contengono entrambe le stazioni ─────────── */
  function _candidateLines(from, to) {
    const out = [];
    for (const [lineId, line] of Object.entries(LE_LINES)) {
      if (line.ST[from] && line.ST[to]) out.push({ lineId, line });
    }
    return out;
  }

  /* ── nextTrip via TTEngine ─────────────────────────────────────── */
  function _nextTrip(lineId, svcId, boardCode, alightCode, fromSec) {
    const toSec = fromSec + DEFAULT_WINDOW_MIN * 60;
    const fromHM = secToHM(fromSec);
    const toHM   = secToHM(toSec);

    const trips = TTEngine.query({
      lines:     lineId,
      station:   boardCode,
      direction: 'SB',       // direzione canonica outbound
      fromTime:  fromHM,
      toTime:    toHM,
      services:  [svcId],
    });

    // Prova anche NB
    const tripsNB = TTEngine.query({
      lines:     lineId,
      station:   boardCode,
      direction: 'NB',
      fromTime:  fromHM,
      toTime:    toHM,
      services:  [svcId],
    });

    const allTrips = [...trips, ...tripsNB];

    for (const trip of allTrips) {
      if (!trip.stops[alightCode]) continue;
      const boardStop  = trip.stops[boardCode];
      const alightStop = trip.stops[alightCode];
      const boardSec   = hmToSec(boardStop.dep ?? boardStop.arr);
      const alightSec  = hmToSec(alightStop.arr ?? alightStop.dep);
      if (alightSec <= boardSec) continue;
      return { trip, boardStop, alightStop, boardSec, alightSec };
    }
    return null;
  }

  /* ── buildLeg ──────────────────────────────────────────────────── */
  function _buildLeg(lineId, svcId, from, to, depSec) {
    const result = _nextTrip(lineId, svcId, from, to, depSec);
    if (!result) return null;
    const { trip, boardStop, alightStop, boardSec, alightSec } = result;

    const line = LE_LINES[lineId];
    const svc  = line.SVC[svcId];
    const totalSec = alightSec - boardSec;

    // Calcolo km tramite TT offset
    const tt = line.TT[svcId];
    let km = null;
    if (tt && tt[from] != null && tt[to] != null) {
      // Stima distanza proporzionale agli offset TT
      // (approssimazione; le linee LE hanno km reali in ST)
      const stFrom = line.ST[from];
      const stTo   = line.ST[to];
      if (stFrom && stTo && stFrom.km != null && stTo.km != null) {
        km = Math.abs(stTo.km - stFrom.km);
      }
    }

    return {
      network:       'LE',
      lineId,
      svcId,
      serviceName:   svc.name,
      serviceColor:  svc.color,
      from,
      to,
      boardCode:     from,
      alightCode:    to,
      boardDep:      secToHM(boardSec),
      alightArr:     secToHM(alightSec),
      departureTime: secToHM(boardSec),
      arrivalTime:   secToHM(alightSec),
      durationSec:   totalSec,
      totalKm:       km,
      tripId:        trip.tripId ?? null,
      stops:         trip.stops,
    };
  }

  /* ── search ────────────────────────────────────────────────────── */
  function search(from, to, depTime, opts = {}) {
    const depSec   = hmToSec(depTime);
    const maxRes   = opts.maxResults ?? MAX_RESULTS;
    const journeys = [];

    for (const { lineId, line } of _candidateLines(from, to)) {
      for (const svcId of Object.keys(line.SVC)) {
        if (!line.TT[svcId]) continue;

        // Filtra per svcId se richiesto
        if (opts.services && !opts.services.includes(svcId)) continue;

        const leg = _buildLeg(lineId, svcId, from, to, depSec);
        if (!leg) continue;

        journeys.push({
          legs:            [leg],
          departureTime:   leg.departureTime,
          arrivalTime:     leg.arrivalTime,
          totalMinutes:    Math.round(leg.durationSec / 60),
          totalKm:         leg.totalKm,
          transfers:       0,
          transferNodes:   [],
          transferWalkMin: [],
          transferWaitMin: [],
        });
      }
    }

    // Dedup + sort per arrivo
    const seen = new Set();
    const deduped = journeys.filter(j => {
      const key = `${j.departureTime}|${j.arrivalTime}|${j.legs[0]?.svcId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    deduped.sort((a, b) => hmToSec(a.arrivalTime) - hmToSec(b.arrivalTime));
    return deduped.slice(0, maxRes);
  }

  /* ── Public API ────────────────────────────────────────────────── */
  return { search, allStations, hasStation };
});

/* ================================================================
   SUBURBAN-ROUTER.JS — Izarail Suburban Journey Planner
   Dipende da: suburban-data.js (SUBURBAN_LINES)

   API pubblica (stesso contratto di IZXRouter):
     SuburbanRouter.search(from, to, depTime, opts) → Journey[]
     SuburbanRouter.stationName(code)               → string
     SuburbanRouter.allStations()                   → Station[]
     SuburbanRouter.TRANSFER_MIN                    → number

   Supporta:
     - Linee lineari (A → B)
     - Linee circolari (percorso minimo orario/antiorario)
     - Filtro per lineId (opts.lines)
     - directOnly (opts.directOnly)

   Nota timetable:
     In questa fase il router genera orari sintetici basati su
     headway fisso (headwayPeak / headwayOffPeak) e tempo di
     percorrenza proporzionale ai km. Quando saranno disponibili
     orari reali (TT), sostituire _syntheticTrips() con TTEngine.
================================================================ */
'use strict';

const SuburbanRouter = (() => {

  const TRANSFER_MIN  = 5;
  const TRANSFER_SEC  = TRANSFER_MIN * 60;
  const MAX_JOURNEYS  = 5;
  const SEARCH_WINDOW = 3 * 3600; // secondi
  const AVG_SPEED_KMH = 40;       // velocità commerciale media suburbana

  /* ── utils tempo ── */
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

  /* ── indice stazione dentro una linea ── */
  function _idx(line, code) {
    return line.stations.findIndex(s => s.code === code);
  }

  /* ── km tra due indici (gestisce circolare) ── */
  function _kmBetween(line, iFrom, iTo) {
    const sts = line.stations;
    if (!line.circular) {
      return Math.abs(sts[iTo].km - sts[iFrom].km);
    }
    // circolare: distanza di chiusura = totalKm − km[last]
    const closeKm = line.totalKm - sts[sts.length - 1].km;
    const total   = line.totalKm;
    const cwKm    = ((sts[iTo].km - sts[iFrom].km) + total) % total;
    const ccwKm   = total - cwKm;
    return Math.min(cwKm, ccwKm);
  }

  /* ── direzione ottimale (circolare) ── */
  function _circularDir(line, iFrom, iTo) {
    const sts    = line.stations;
    const total  = line.totalKm;
    const cwKm   = ((sts[iTo].km - sts[iFrom].km) + total) % total;
    return cwKm <= total / 2 ? 'CW' : 'CCW';
  }

  /* ── genera treni sintetici a headway fisso ── */
  function _syntheticTrips(line, iFrom, depSec) {
    const PEAK_START  = 7 * 3600;
    const PEAK_END1   = 9 * 3600;
    const PEAK_START2 = 17 * 3600;
    const PEAK_END2   = 20 * 3600;
    const isPeak = (depSec >= PEAK_START && depSec < PEAK_END1) ||
                   (depSec >= PEAK_START2 && depSec < PEAK_END2);
    const headwaySec = (isPeak ? line.headwayPeak : line.headwayOffPeak) * 60;

    // primo treno dopo depSec
    const firstDep = Math.ceil(depSec / headwaySec) * headwaySec;
    const trips = [];
    let t = firstDep;
    while (t <= depSec + SEARCH_WINDOW) {
      trips.push(t);
      t += headwaySec;
    }
    return trips;
  }

  /* ── costruisce un leg ── */
  function _buildLeg(line, iFrom, iTo, depSec) {
    const trips = _syntheticTrips(line, iFrom, depSec);
    if (!trips.length) return null;

    const boardSec  = trips[0];
    const km        = _kmBetween(line, iFrom, iTo);
    const travelSec = Math.round((km / AVG_SPEED_KMH) * 3600);
    const alightSec = boardSec + travelSec;

    // stazioni intermedie (solo lineari per ora)
    let intermediateStops = [];
    if (!line.circular) {
      const a = Math.min(iFrom, iTo);
      const b = Math.max(iFrom, iTo);
      intermediateStops = line.stations.slice(a + 1, b).map((st, i) => ({
        code: st.code,
        name: st.name,
        arr:  _secToHM(boardSec + Math.round(((st.km - line.stations[iFrom].km) / AVG_SPEED_KMH) * 3600)),
        dep:  _secToHM(boardSec + Math.round(((st.km - line.stations[iFrom].km) / AVG_SPEED_KMH) * 3600) + 30),
      }));
    }

    return {
      lineId:      line.id,
      svcId:       line.id,
      svcLogical:  line.id,
      svcName:     line.name,
      color:       line.color,
      cls:         'suburban',
      direction:   line.circular ? _circularDir(line, iFrom, iTo) : (iFrom < iTo ? 'SB' : 'NB'),
      trainNumber: null,
      boardCode:   line.stations[iFrom].code,
      boardName:   line.stations[iFrom].name,
      boardDep:    _secToHM(boardSec),
      boardDepSec: boardSec,
      alightCode:  line.stations[iTo].code,
      alightName:  line.stations[iTo].name,
      alightArr:   _secToHM(alightSec),
      alightArrSec: alightSec,
      km,
      intermediateStops,
    };
  }

  /* ── filtra linee da opts.lines ── */
  function _lineFilter(opts) {
    const raw = opts.lines;
    if (!raw || raw === 'ALL') return null;
    const list = Array.isArray(raw) ? raw : [raw];
    return new Set(list);
  }

  /* ================================================================
   * search(from, to, depTime, opts)
   * ================================================================ */
  function search(from, to, depTime, opts = {}) {
    const maxResults  = opts.maxResults ?? MAX_JOURNEYS;
    const directOnly  = !!opts.directOnly;
    const depSec      = _hmToSec(depTime);
    const lineAllowed = _lineFilter(opts);
    const journeys    = [];

    /* ---- 1. Percorsi DIRETTI ---- */
    for (const line of Object.values(SUBURBAN_LINES)) {
      if (!line.stations.length) continue;
      if (lineAllowed && !lineAllowed.has(line.id)) continue;
      const iF = _idx(line, from);
      const iT = _idx(line, to);
      if (iF === -1 || iT === -1) continue;
      if (iF === iT) continue;

      const leg = _buildLeg(line, iF, iT, depSec);
      if (!leg) continue;

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

    /* ---- 2. Percorsi con UN CAMBIO (futuro) ---- */
    // TODO: quando le stazioni di interscambio saranno definite
    // tra linee suburbane, implementare CSA a un cambio qui,
    // seguendo lo stesso pattern di routing.js.

    /* ---- deduplicazione e ordinamento ---- */
    const seen = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l =>
        `${l.lineId}:${l.boardDep}:${l.alightArr}`
      ).join('|');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    unique.sort((a, b) => {
      const da = _hmToSec(a.arrivalTime);
      const db = _hmToSec(b.arrivalTime);
      if (da !== db) return da - db;
      return a.transfers - b.transfers;
    });
    return unique.slice(0, maxResults);
  }

  /* ================================================================
   * stationName(code)
   * ================================================================ */
  function stationName(code) {
    for (const line of Object.values(SUBURBAN_LINES)) {
      const st = line.stations.find(s => s.code === code);
      if (st) return st.name;
    }
    return code;
  }

  /* ================================================================
   * allStations()
   * Usato da buildPlannerSelects() in izx-ticket.html per popolare
   * i <select> del Journey Planner con le stazioni suburbane.
   * Restituisce ogni stazione una sola volta (deduplicata per code).
   * ================================================================ */
  function allStations() {
    const seen = new Set();
    const out  = [];
    for (const line of Object.values(SUBURBAN_LINES)) {
      for (const st of line.stations) {
        if (seen.has(st.code)) continue;
        seen.add(st.code);
        out.push({ ...st, lineId: line.id });
      }
    }
    return out;
  }

  /* ================================================================
   * lineColor(lineId)
   * ================================================================ */
  function lineColor(lineId) {
    return SUBURBAN_LINES[lineId]?.color ?? '#888';
  }

  /* ---- API pubblica ---- */
  return {
    search,
    stationName,
    allStations,
    lineColor,
    TRANSFER_MIN,
  };

})();

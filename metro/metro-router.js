/* ================================================================
   METRO-ROUTER.JS — Sainðaul Metro Journey Planner
   Dipende da: metro/m4-data.js

   API pubblica:
     MetroRouter.search(from, to, depTime, opts) → Journey[]
     MetroRouter.stationName(code)               → string
     MetroRouter.allStations()                   → Station[]
     MetroRouter.lineColor(lineId)               → string
     MetroRouter.allLines()                      → Line[]

   Supporta:
     - Percorsi diretti sulla Line 4
     - Name matching automatico per interscambi cross-network
       (es. same station name fra metro / suburbane / IZX, se presenti)
     - Filtro per lineId (opts.lines)
     - directOnly (opts.directOnly)
     - Servizi generati a runtime da M4_HEADWAY

   Nota:
     Il servizio Rapid (M4_SVC.A) è definito nei dati ma non viene
     ancora incluso nel routing finché non avrà un profilo operativo
     dedicato. Per ora si usa il servizio all-stop (M4_SVC.B).
================================================================ */
'use strict';

const MetroRouter = (() => {
  const AVG_SPEED_KMH = 30;
  const DWELL_SEC = 30;
  const MAX_JOURNEYS = 5;
  const SEARCH_WINDOW = 3 * 3600;
  const LINE_ID = 'M4';
  const DEFAULT_SVC = 'B';

  let _nameMap = null;
  function _buildNameMap() {
    if (_nameMap) return _nameMap;
    _nameMap = {};
    for (const st of Object.values(M4_ST)) {
      const key = String(st.n || '').trim().toLowerCase();
      if (!key) continue;
      if (!_nameMap[key]) _nameMap[key] = [];
      _nameMap[key].push(st);
    }
    return _nameMap;
  }

  function _resolveCode(code) {
    const key = String(code || '').trim().toLowerCase();
    const matches = _buildNameMap()[key] || [];
    return matches.length ? matches[0].code || null : code;
  }

  function _hmToSec(hm) {
    if (!hm) return 0;
    const [h, m] = hm.split(':').map(Number);
    return h * 3600 + m * 60;
  }

  function _secToHM(sec) {
    const s = ((sec % 86400) + 86400) % 86400;
    return String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  }

  function _idx(code) {
    return M4_CANONICAL_ORDER.indexOf(code);
  }

  function _station(code) {
    return M4_ST[code] || null;
  }

  function _segmentKm(codeA, codeB) {
    const a = _station(codeA), b = _station(codeB);
    if (!a || !b) return null;
    return Math.abs(b.km - a.km);
  }

  function _buildLeg(boardCode, alightCode, depSec) {
    const iF = _idx(boardCode);
    const iT = _idx(alightCode);
    if (iF === -1 || iT === -1 || iF === iT) return null;

    const boardDep = _secToHM(depSec);
    const km = _segmentKm(boardCode, alightCode);
    if (km == null) return null;

    const travelSec = Math.round((km / AVG_SPEED_KMH) * 3600);
    const alightSec = depSec + travelSec;
    const between = iF < iT ? M4_CANONICAL_ORDER.slice(iF + 1, iT) : M4_CANONICAL_ORDER.slice(iT + 1, iF).reverse();

    const intermediateStops = between.map(code => {
      const st = _station(code);
      const kmElapsed = Math.abs(st.km - _station(boardCode).km);
      const arrSec = depSec + Math.round((kmElapsed / km) * travelSec);
      return { code, name: st.n, arr: _secToHM(arrSec), dep: _secToHM(arrSec + DWELL_SEC) };
    });

    return {
      lineId: LINE_ID,
      svcId: DEFAULT_SVC,
      svcLogical: DEFAULT_SVC,
      svcName: M4_SVC[DEFAULT_SVC]?.name || 'All-stop',
      color: M4_META.color,
      cls: 'metro',
      direction: iF < iT ? 'EB' : 'WB',
      trainNumber: null,
      boardCode,
      boardName: _station(boardCode).n,
      boardDep: boardDep,
      boardDepSec: depSec,
      alightCode,
      alightName: _station(alightCode).n,
      alightArr: _secToHM(alightSec),
      alightArrSec: alightSec,
      km,
      intermediateStops,
    };
  }

  function _headwaySecAt(sec) {
    const hm = _secToHM(sec);
    for (const slot of M4_HEADWAY) {
      if (hm >= slot.from && hm < slot.to) return slot.headwayMin * 60;
    }
    return M4_HEADWAY[M4_HEADWAY.length - 1].headwayMin * 60;
  }

  function _generateDepartures(firstDep) {
    const depSec0 = _hmToSec(firstDep);
    const endSec = _hmToSec('24:30');
    const deps = [];
    let t = depSec0;
    while (t <= endSec) {
      deps.push(t);
      t += _headwaySecAt(t);
    }
    return deps;
  }

  function _lineFilter(opts) {
    const raw = opts.lines;
    if (!raw || raw === 'ALL') return null;
    return new Set(Array.isArray(raw) ? raw : [raw]);
  }

  function search(from, to, depTime, opts = {}) {
    const maxResults = opts.maxResults ?? MAX_JOURNEYS;
    const directOnly = !!opts.directOnly;
    const depSec = _hmToSec(depTime);
    const lineAllowed = _lineFilter(opts);
    const fromCode = _resolveCode(from);
    const toCode = _resolveCode(to);
    const journeys = [];

    if (lineAllowed && !lineAllowed.has(LINE_ID)) return [];

    const startNodes = [
      { svc: 'B_W', code: 'M425' },
      { svc: 'B_A', code: 'M416' },
      { svc: 'B_E', code: 'M415' },
    ];

    for (const start of startNodes) {
      if (!M4_SVC[start.svc]) continue;
      const depList = _generateDepartures(start.dep).filter(t => t >= depSec);
      for (const d of depList) {
        const board = _buildLeg(start.code, toCode, d);
        if (!board) continue;
        journeys.push({
          legs: [board],
          departureTime: board.boardDep,
          arrivalTime: board.alightArr,
          totalMinutes: Math.round((board.alightArrSec - board.boardDepSec) / 60),
          totalKm: board.km,
          transfers: 0,
          transferNodes: [],
        });
      }
    }

    if (!directOnly) {
      const nameFrom = _station(fromCode)?.n?.trim().toLowerCase();
      const nameTo = _station(toCode)?.n?.trim().toLowerCase();
      if (nameFrom && nameTo && nameFrom === nameTo) {
        journeys.push({
          legs: [],
          departureTime: _secToHM(depSec),
          arrivalTime: _secToHM(depSec),
          totalMinutes: 0,
          totalKm: 0,
          transfers: 0,
          transferNodes: []
        });
      }
    }

    const unique = [];
    const seen = new Set();
    for (const j of journeys) {
      const key = j.legs.map(l => `${l.boardCode}:${l.alightCode}:${l.boardDep}`).join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(j);
    }

    unique.sort((a, b) => _hmToSec(a.arrivalTime) - _hmToSec(b.arrivalTime));
    return unique.slice(0, maxResults);
  }

  function stationName(code) {
    const resolved = _resolveCode(code);
    return _station(resolved)?.n || code;
  }

  function allStations() {
    return M4_CANONICAL_ORDER.map(code => ({ ...M4_ST[code], code, lineId: LINE_ID }));
  }

  function lineColor(lineId) {
    return lineId === LINE_ID ? M4_META.color : '#888';
  }

  function allLines() {
    return [{ id: LINE_ID, name: M4_META.name, color: M4_META.color, totalKm: M4_META.totalKm }];
  }

  return {
    search,
    stationName,
    allStations,
    allLines,
    lineColor,
  };
})();

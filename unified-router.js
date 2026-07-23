/* ================================================================
   UNIFIED-ROUTER.JS — Izaland Cross-Network Journey Planner
   ================================================================
   Aggrega IZXRouter, SuburbanRouter e MetroRouter in un'unica
   interfaccia di ricerca. Gestisce automaticamente i trasferimenti
   cross-network tramite name-matching sui nomi stazione.

   API pubblica:
     UnifiedRouter.search(from, to, depTime, opts) → Journey[]
     UnifiedRouter.stationName(code)               → string
     UnifiedRouter.allStations()                   → Station[]
     UnifiedRouter.allLines()                      → Line[]

   Reti supportate:
     IZX / AX   — IZXRouter       (routing.js / izx-data.js)
     Suburbane   — SuburbanRouter  (suburban-router.js / suburban-data.js)
     Metro M4    — MetroRouter     (metro/metro-router.js / metro/m4-data.js)

   Interscambi cross-network:
     Rilevati automaticamente per name-matching case-insensitive
     sul nome della stazione. Non serve una mappa esplicita.
     Tempo di trasferimento: CROSS_TRANSFER_MIN (default 10 min).

   opts supportate:
     opts.maxResults   {number}          default 5
     opts.directOnly   {boolean}         default false
     opts.networks     {string|string[]} es. ['IZX','METRO'] — filtra reti
     opts.lines        {string|string[]} passa al sotto-router

   Struttura Journey:
     { legs[], departureTime, arrivalTime, totalMinutes, totalKm,
       transfers, transferNodes, transferWaitMin? }

   Struttura Leg (comune a tutti i router):
     { lineId, svcId, svcName, color, cls, direction, trainNumber,
       boardCode, boardName, boardDep, boardDepSec,
       alightCode, alightName, alightArr, alightArrSec,
       km, intermediateStops[] }
================================================================ */
'use strict';

const UnifiedRouter = (() => {

  const CROSS_TRANSFER_MIN = 10;
  const CROSS_TRANSFER_SEC = CROSS_TRANSFER_MIN * 60;
  const MAX_JOURNEYS = 5;

  /* ----------------------------------------------------------------
   * Registro reti disponibili a runtime
   * ---------------------------------------------------------------- */
  function _routers() {
    const r = [];
    if (typeof SuburbanRouter !== 'undefined') r.push({ id: 'SUBURBAN', router: SuburbanRouter });
    if (typeof MetroRouter    !== 'undefined') r.push({ id: 'METRO',    router: MetroRouter    });
    if (typeof IZXRouter      !== 'undefined') r.push({ id: 'IZX',      router: IZXRouter      });
    return r;
  }

  /* ----------------------------------------------------------------
   * _buildNameIndex()
   * Indice globale: nomeLowercase → [{ networkId, code, name }]
   * Costruito una sola volta e cachato.
   * ---------------------------------------------------------------- */
  let _nameIndex = null;
  function _buildNameIndex() {
    if (_nameIndex) return _nameIndex;
    _nameIndex = {};
    for (const { id, router } of _routers()) {
      if (typeof router.allStations !== 'function') continue;
      for (const st of router.allStations()) {
        const key = String(st.name || st.n || '').trim().toLowerCase();
        if (!key) continue;
        if (!_nameIndex[key]) _nameIndex[key] = [];
        _nameIndex[key].push({ networkId: id, code: st.code, name: st.name || st.n });
      }
    }
    return _nameIndex;
  }

  /* ----------------------------------------------------------------
   * _resolveToAll(codeOrName)
   * Dato un codice o nome stazione, restituisce tutti i nodi
   * cross-network con lo stesso nome.
   * ---------------------------------------------------------------- */
  function _resolveToAll(codeOrName) {
    const idx = _buildNameIndex();
    // 1. match diretto per codice
    for (const entries of Object.values(idx)) {
      const found = entries.find(e => e.code === codeOrName);
      if (found) {
        const key = found.name.trim().toLowerCase();
        return idx[key] || [found];
      }
    }
    // 2. match per nome
    const key = String(codeOrName).trim().toLowerCase();
    return idx[key] || [];
  }

  /* ----------------------------------------------------------------
   * _networkOf(code)
   * Restituisce l'ID rete di un codice stazione.
   * ---------------------------------------------------------------- */
  function _networkOf(code) {
    for (const { id, router } of _routers()) {
      if (typeof router.allStations !== 'function') continue;
      if (router.allStations().some(s => s.code === code)) return id;
    }
    return null;
  }

  /* ----------------------------------------------------------------
   * _routerFor(networkId)
   * ---------------------------------------------------------------- */
  function _routerFor(networkId) {
    return _routers().find(r => r.id === networkId)?.router ?? null;
  }

  /* ----------------------------------------------------------------
   * _hmToSec / _secToHM
   * ---------------------------------------------------------------- */
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
   * _networkFilter(opts)
   * ---------------------------------------------------------------- */
  function _networkFilter(opts) {
    const raw = opts.networks;
    if (!raw) return null;
    return new Set(Array.isArray(raw) ? raw.map(s => s.toUpperCase()) : [raw.toUpperCase()]);
  }

  /* ================================================================
   * search(from, to, depTime, opts)
   * ================================================================ */
  function search(from, to, depTime, opts = {}) {
    const maxResults  = opts.maxResults ?? MAX_JOURNEYS;
    const directOnly  = !!opts.directOnly;
    const depSec      = _hmToSec(depTime);
    const netFilter   = _networkFilter(opts);
    const journeys    = [];

    const fromNodes = _resolveToAll(from);
    const toNodes   = _resolveToAll(to);

    if (!fromNodes.length || !toNodes.length) return [];

    /* ---- 1. Ricerche DIRETTE su ogni router ---- */
    for (const { id, router } of _routers()) {
      if (netFilter && !netFilter.has(id)) continue;
      if (typeof router.search !== 'function') continue;
      const fNode = fromNodes.find(n => n.networkId === id);
      const tNode = toNodes.find(n => n.networkId === id);
      if (!fNode || !tNode) continue;
      const results = router.search(fNode.code, tNode.code, depTime, opts);
      for (const j of results) journeys.push({ ...j, _src: id });
    }

    /* ---- 2. Percorsi con TRASFERIMENTO cross-network ---- */
    if (!directOnly) {
      for (const fNode of fromNodes) {
        if (netFilter && !netFilter.has(fNode.networkId)) continue;
        const router1 = _routerFor(fNode.networkId);
        if (!router1 || typeof router1.search !== 'function') continue;

        // Stazioni della stessa rete di partenza
        const allSt1 = typeof router1.allStations === 'function' ? router1.allStations() : [];

        for (const midSt of allSt1) {
          // Cerca nodi cross-network con lo stesso nome
          const midKey = String(midSt.name || midSt.n || '').trim().toLowerCase();
          const midPartners = (_buildNameIndex()[midKey] || []).filter(
            n => n.networkId !== fNode.networkId
          );
          if (!midPartners.length) continue;

          // Leg 1: fNode → midSt (stessa rete)
          const leg1Results = router1.search(fNode.code, midSt.code, depTime, { ...opts, maxResults: 2, directOnly: true });
          if (!leg1Results.length) continue;
          const j1 = leg1Results[0];
          const transferReadySec = _hmToSec(j1.arrivalTime) + CROSS_TRANSFER_SEC;
          const transferReadyHM  = _secToHM(transferReadySec);

          for (const midPartner of midPartners) {
            if (netFilter && !netFilter.has(midPartner.networkId)) continue;
            const router2 = _routerFor(midPartner.networkId);
            if (!router2 || typeof router2.search !== 'function') continue;

            const tNode = toNodes.find(n => n.networkId === midPartner.networkId);
            if (!tNode) continue;

            const leg2Results = router2.search(midPartner.code, tNode.code, transferReadyHM, { ...opts, maxResults: 2, directOnly: true });
            if (!leg2Results.length) continue;
            const j2 = leg2Results[0];

            const totalKm = (j1.totalKm != null && j2.totalKm != null)
              ? j1.totalKm + j2.totalKm : null;
            const waitMin = Math.round(((_hmToSec(j2.departureTime) - _hmToSec(j1.arrivalTime))) / 60);

            journeys.push({
              legs: [...j1.legs, ...j2.legs],
              departureTime:  j1.departureTime,
              arrivalTime:    j2.arrivalTime,
              totalMinutes:   Math.round((_hmToSec(j2.arrivalTime) - _hmToSec(j1.departureTime)) / 60),
              totalKm,
              transfers:      (j1.transfers + j2.transfers) + 1,
              transferNodes:  [...(j1.transferNodes || []), midSt.code, ...(j2.transferNodes || [])],
              transferWaitMin: waitMin,
              _src: `${fNode.networkId}→${midPartner.networkId}`,
            });
          }
        }
      }
    }

    /* ---- deduplicazione e ordinamento ---- */
    const seen = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l => `${l.lineId}:${l.boardDep}:${l.alightCode}`).join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.sort((a, b) => {
      const da = _hmToSec(a.arrivalTime), db = _hmToSec(b.arrivalTime);
      if (da !== db) return da - db;
      return a.transfers - b.transfers;
    });

    return unique.slice(0, maxResults);
  }

  /* ================================================================
   * stationName(code)
   * ================================================================ */
  function stationName(code) {
    for (const { router } of _routers()) {
      if (typeof router.stationName !== 'function') continue;
      const name = router.stationName(code);
      if (name && name !== code) return name;
    }
    return code;
  }

  /* ================================================================
   * allStations()
   * ================================================================ */
  function allStations() {
    const seen = new Set();
    const out  = [];
    for (const { id, router } of _routers()) {
      if (typeof router.allStations !== 'function') continue;
      for (const st of router.allStations()) {
        if (seen.has(st.code)) continue;
        seen.add(st.code);
        out.push({ ...st, networkId: id });
      }
    }
    return out;
  }

  /* ================================================================
   * allLines()
   * ================================================================ */
  function allLines() {
    const out = [];
    for (const { id, router } of _routers()) {
      if (typeof router.allLines !== 'function') continue;
      for (const line of router.allLines()) out.push({ ...line, networkId: id });
    }
    return out;
  }

  /* ================================================================
   * lineColor(lineId)
   * ================================================================ */
  function lineColor(lineId) {
    for (const { router } of _routers()) {
      if (typeof router.lineColor !== 'function') continue;
      const c = router.lineColor(lineId);
      if (c && c !== '#888') return c;
    }
    return '#888';
  }

  /* ================================================================
   * availableNetworks()
   * Restituisce i network attivi a runtime.
   * ================================================================ */
  function availableNetworks() {
    return _routers().map(r => r.id);
  }

  if (typeof module !== 'undefined') {
    module.exports = { search, stationName, allStations, allLines, lineColor, availableNetworks };
  }

  return { search, stationName, allStations, allLines, lineColor, availableNetworks, CROSS_TRANSFER_MIN };

})();

/* ================================================================
   UNIFIED-ROUTER.JS — Izaland Cross-Network Journey Planner
   ================================================================
   Aggrega IZXRouter, SuburbanRouter e MetroRouter in un'unica
   interfaccia di ricerca. Gestisce i trasferimenti cross-network
   tramite due meccanismi complementari:

   1. Name-matching — stazioni con lo stesso nome su reti diverse
      (es. "Sainðaul Central" su KE, RY, EI, LL, KD, AX)

   2. Interchange index — mappe dichiarative lette da:
        M4_INTERCHANGE           (metro/m4-data.js)
        IZX_LINES[x].INTERCHANGE + INTERCHANGE_EXTRA  (izx-data.js)
        SUBURBAN_INTERCHANGE     (suburban-data.js)
      Usato quando i nomi non coincidono (es. M4 ↔ LL/KD/AX).
      Il campo transferMin dichiarato sovrascrive CROSS_TRANSFER_MIN.

   API pubblica:
     UnifiedRouter.search(from, to, depTime, opts) → Journey[]
     UnifiedRouter.stationName(code)               → string
     UnifiedRouter.allStations()                   → Station[]
     UnifiedRouter.allLines()                      → Line[]
     UnifiedRouter.availableNetworks()             → string[]

   Reti supportate:
     IZX / AX   — IZXRouter       (routing.js / izx-data.js)
     Suburbane   — SuburbanRouter  (suburban-router.js / suburban-data.js)
     Metro M4    — MetroRouter     (metro/metro-router.js / metro/m4-data.js)

   opts supportate:
     opts.maxResults   {number}          default 5
     opts.directOnly   {boolean}         default false
     opts.networks     {string|string[]} es. ['IZX','METRO']
     opts.lines        {string|string[]} passa al sotto-router

   Struttura Journey:
     { legs[], departureTime, arrivalTime, totalMinutes, totalKm,
       transfers, transferNodes, transferWaitMin? }
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
   * _networkOf(code) — rete di appartenenza di un codice stazione
   * ---------------------------------------------------------------- */
  function _networkOf(code) {
    for (const { id, router } of _routers()) {
      if (typeof router.allStations !== 'function') continue;
      if (router.allStations().some(s => s.code === code)) return id;
    }
    return null;
  }

  /* ----------------------------------------------------------------
   * _buildInterchangeIndex()
   * Legge tutte le mappe dichiarative di interscambio e costruisce
   * un indice bidirezionale:
   *   codeA → [{ code: codeB, transferMin }]
   *   codeB → [{ code: codeA, transferMin }]
   *
   * Fonti:
   *   - M4_INTERCHANGE  (ogni entry ha { code, transferMin })
   *   - IZX_LINES[x].INTERCHANGE  (code → partnerCode, transferMin=10)
   *   - IZX_LINES[x].INTERCHANGE_EXTRA  (code → [partnerCode, ...])
   *   - SUBURBAN_INTERCHANGE  (code → [partnerCode, ...])
   * ---------------------------------------------------------------- */
  let _ixIndex = null;
  function _buildInterchangeIndex() {
    if (_ixIndex) return _ixIndex;
    _ixIndex = {};

    function _add(codeA, codeB, transferMin) {
      if (!codeA || !codeB || codeA === codeB) return;
      const t = transferMin ?? CROSS_TRANSFER_MIN;
      if (!_ixIndex[codeA]) _ixIndex[codeA] = [];
      if (!_ixIndex[codeB]) _ixIndex[codeB] = [];
      if (!_ixIndex[codeA].find(e => e.code === codeB))
        _ixIndex[codeA].push({ code: codeB, transferMin: t });
      if (!_ixIndex[codeB].find(e => e.code === codeA))
        _ixIndex[codeB].push({ code: codeA, transferMin: t });
    }

    /* 1. M4_INTERCHANGE */
    if (typeof M4_INTERCHANGE !== 'undefined') {
      for (const [m4code, partners] of Object.entries(M4_INTERCHANGE)) {
        for (const p of partners) _add(m4code, p.code, p.transferMin);
      }
    }

    /* 2. IZX_LINES[x].INTERCHANGE + INTERCHANGE_EXTRA */
    if (typeof IZX_LINES !== 'undefined') {
      for (const line of Object.values(IZX_LINES)) {
        if (line.INTERCHANGE) {
          for (const [a, b] of Object.entries(line.INTERCHANGE)) _add(a, b, CROSS_TRANSFER_MIN);
        }
        if (line.INTERCHANGE_EXTRA) {
          for (const [a, bArr] of Object.entries(line.INTERCHANGE_EXTRA)) {
            for (const b of bArr) _add(a, b, CROSS_TRANSFER_MIN);
          }
        }
      }
    }

    /* 3. SUBURBAN_INTERCHANGE */
    if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
      for (const [a, bArr] of Object.entries(SUBURBAN_INTERCHANGE)) {
        for (const b of bArr) _add(a, b, CROSS_TRANSFER_MIN);
      }
    }

    return _ixIndex;
  }

  /* ----------------------------------------------------------------
   * _partnersOf(code)
   * Tutti i nodi partner di `code` su altre reti, con transferMin.
   * Combina name-index e interchange-index (deduplicati).
   * ---------------------------------------------------------------- */
  function _partnersOf(code) {
    const myNet = _networkOf(code);
    const seen  = new Set();
    const out   = [];

    function _push(partnerCode, transferMin) {
      if (seen.has(partnerCode)) return;
      const net = _networkOf(partnerCode);
      if (!net || net === myNet) return;
      seen.add(partnerCode);
      out.push({ code: partnerCode, networkId: net, transferMin: transferMin ?? CROSS_TRANSFER_MIN });
    }

    /* 1. name-match */
    const name = _stationNameRaw(code);
    if (name) {
      const key = name.trim().toLowerCase();
      for (const entry of (_buildNameIndex()[key] || [])) {
        if (entry.code !== code) _push(entry.code, CROSS_TRANSFER_MIN);
      }
    }

    /* 2. interchange-index */
    for (const entry of (_buildInterchangeIndex()[code] || [])) {
      _push(entry.code, entry.transferMin);
    }

    return out;
  }

  /* helper: nome grezzo di un codice senza fallback */
  function _stationNameRaw(code) {
    for (const { router } of _routers()) {
      if (typeof router.allStations !== 'function') continue;
      const st = router.allStations().find(s => s.code === code);
      if (st) return st.name || st.n || null;
    }
    return null;
  }

  /* ----------------------------------------------------------------
   * _resolveToAll(codeOrName)
   * Dato un codice o nome, restituisce tutti i nodi cross-network
   * con lo stesso nome (name-index).
   * ---------------------------------------------------------------- */
  function _resolveToAll(codeOrName) {
    const idx = _buildNameIndex();
    /* match diretto per codice */
    for (const entries of Object.values(idx)) {
      const found = entries.find(e => e.code === codeOrName);
      if (found) {
        const key = found.name.trim().toLowerCase();
        return idx[key] || [found];
      }
    }
    /* match per nome */
    const key = String(codeOrName).trim().toLowerCase();
    return idx[key] || [];
  }

  /* ----------------------------------------------------------------
   * _routerFor(networkId)
   * ---------------------------------------------------------------- */
  function _routerFor(networkId) {
    return _routers().find(r => r.id === networkId)?.router ?? null;
  }

  /* ---- utils tempo ---- */
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

  /* ---- filtro reti ---- */
  function _networkFilter(opts) {
    const raw = opts.networks;
    if (!raw) return null;
    return new Set(Array.isArray(raw) ? raw.map(s => s.toUpperCase()) : [raw.toUpperCase()]);
  }

  /* ================================================================
   * search(from, to, depTime, opts)
   * ================================================================ */
  function search(from, to, depTime, opts = {}) {
    const maxResults = opts.maxResults ?? MAX_JOURNEYS;
    const directOnly = !!opts.directOnly;
    const depSec     = _hmToSec(depTime);
    const netFilter  = _networkFilter(opts);
    const journeys   = [];

    const fromNodes = _resolveToAll(from);
    const toNodes   = _resolveToAll(to);

    /* Se from/to sono codici di reti senza omonimi, _resolveToAll
       restituisce [] — recupera direttamente dal network. */
    function _ensureNode(codeOrName, arr) {
      if (arr.length) return arr;
      const net = _networkOf(codeOrName);
      if (!net) return [];
      const name = _stationNameRaw(codeOrName) || codeOrName;
      return [{ networkId: net, code: codeOrName, name }];
    }
    const fNodes = _ensureNode(from, fromNodes);
    const tNodes = _ensureNode(to,   toNodes);

    if (!fNodes.length || !tNodes.length) return [];

    /* ---- 1. Ricerche DIRETTE su ogni router ---- */
    for (const { id, router } of _routers()) {
      if (netFilter && !netFilter.has(id)) continue;
      if (typeof router.search !== 'function') continue;
      const fNode = fNodes.find(n => n.networkId === id);
      const tNode = tNodes.find(n => n.networkId === id);
      if (!fNode || !tNode) continue;
      const results = router.search(fNode.code, tNode.code, depTime, opts);
      for (const j of results) journeys.push({ ...j, _src: id });
    }

    /* ---- 2. Percorsi con TRASFERIMENTO cross-network ---- */
    if (!directOnly) {
      for (const fNode of fNodes) {
        if (netFilter && !netFilter.has(fNode.networkId)) continue;
        const router1 = _routerFor(fNode.networkId);
        if (!router1 || typeof router1.search !== 'function') continue;

        const allSt1 = typeof router1.allStations === 'function'
          ? router1.allStations() : [];

        for (const midSt of allSt1) {
          /* Raccoglie partner via name-match + interchange-index */
          const partners = _partnersOf(midSt.code).filter(p => {
            if (netFilter && !netFilter.has(p.networkId)) return false;
            return tNodes.some(t => t.networkId === p.networkId);
          });
          if (!partners.length) continue;

          /* Leg 1: fNode → midSt (stessa rete) */
          const leg1Results = router1.search(
            fNode.code, midSt.code, depTime,
            { ...opts, maxResults: 2, directOnly: true }
          );
          if (!leg1Results.length) continue;
          const j1 = leg1Results[0];
          
          for (const partner of partners) {
            const transferSec = (partner.transferMin ?? CROSS_TRANSFER_MIN) * 60;
            const transferReadySec = _hmToSec(j1.arrivalTime) + transferSec;
            const transferReadyHM  = _secToHM(transferReadySec);

            const router2 = _routerFor(partner.networkId);
            if (!router2 || typeof router2.search !== 'function') continue;

            const tNode = tNodes.find(n => n.networkId === partner.networkId);
            if (!tNode) continue;

            const leg2Results = router2.search(
              partner.code, tNode.code, transferReadyHM,
              { ...opts, maxResults: 2, directOnly: true }
            );
            if (!leg2Results.length) continue;
            const j2 = leg2Results[0];

            const totalKm = (j1.totalKm != null && j2.totalKm != null)
              ? j1.totalKm + j2.totalKm : null;
            const waitMin = Math.round(
              (_hmToSec(j2.departureTime) - _hmToSec(j1.arrivalTime)) / 60
            );

            journeys.push({
              legs:           [...j1.legs, ...j2.legs],
              departureTime:  j1.departureTime,
              arrivalTime:    j2.arrivalTime,
              totalMinutes:   Math.round(
                (_hmToSec(j2.arrivalTime) - _hmToSec(j1.departureTime)) / 60
              ),
              totalKm,
              transfers:      (j1.transfers + j2.transfers) + 1,
              transferNodes:  [...(j1.transferNodes || []), midSt.code, ...(j2.transferNodes || [])],
              transferWaitMin: waitMin,
              _src: `${fNode.networkId}→${partner.networkId}`,
            });
          }
        }
      }
    }

    /* ---- deduplicazione e ordinamento ---- */
    const seen = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l =>
        `${l.lineId}:${l.boardDep}:${l.boardCode}:${l.alightCode}`
      ).join('|');
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
   * ================================================================ */
  function availableNetworks() {
    return _routers().map(r => r.id);
  }

  if (typeof module !== 'undefined') {
    module.exports = {
      search, stationName, allStations, allLines,
      lineColor, availableNetworks,
    };
  }

  return {
    search, stationName, allStations, allLines,
    lineColor, availableNetworks,
    CROSS_TRANSFER_MIN,
  };

})();

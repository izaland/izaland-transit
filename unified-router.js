/* ================================================================
   UNIFIED-ROUTER.JS — Izaland Cross-Network Journey Planner
   ================================================================
   Aggrega IZXRouter, SuburbanRouter e MetroRouter in un'unica
   interfaccia di ricerca. Gestisce i trasferimenti cross-network
   tra IZX, Suburban e Metro.
   ================================================================ */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.IZXUnifiedRouter = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ================================================================
   * CONSTANTS
   * ================================================================ */
  const MAX_JOURNEYS       = 5;
  const CROSS_TRANSFER_MIN = 10;
  const CROSS_TRANSFER_SEC = CROSS_TRANSFER_MIN * 60;

  /* ================================================================
   * NETWORK REGISTRY
   * ================================================================ */
  const _routers = {};

  function registerRouter(networkId, routerObj) {
    _routers[networkId.toUpperCase()] = routerObj;
  }

  function _routerFor(networkId) {
    return _routers[networkId ? networkId.toUpperCase() : ''] || null;
  }

  /* ================================================================
   * INTERCHANGE INDEX
   * ================================================================ */
  const _ixIndex = {};

  function _ixAdd(code, entry) {
    if (!_ixIndex[code]) _ixIndex[code] = [];
    _ixIndex[code].push(entry);
  }

  function _add(codeA, codeB, transferMin) {
    const t = transferMin ?? CROSS_TRANSFER_MIN;
    // avoid duplicate entries
    if (!(_ixIndex[codeA] && _ixIndex[codeA].some(e => e.code === codeB)))
      _ixIndex[codeA] = (_ixIndex[codeA] || []);
    if (!(_ixIndex[codeB] && _ixIndex[codeB].some(e => e.code === codeA)))
      _ixIndex[codeB] = (_ixIndex[codeB] || []);
    _ixIndex[codeA].push({ code: codeB, transferMin: t });
    _ixIndex[codeB].push({ code: codeA, transferMin: t });
  }

  function buildInterchangeIndex(interchangeData) {
    // interchangeData: array of { codeA, codeB, transferMin? }
    // OR the merged cross-network interchange maps from data files
    if (Array.isArray(interchangeData)) {
      interchangeData.forEach(ix => {
        _add(ix.codeA, ix.codeB, ix.transferMin);
      });
      return;
    }
    // Object form: { stationCode: [ { code, network, transferMin } ] }
    Object.entries(interchangeData).forEach(([stCode, partners]) => {
      const pArr = Array.isArray(partners) ? partners : [partners];
      if (pArr.length === 1) {
        for (const b of pArr) _add(stCode, b.code ?? b, CROSS_TRANSFER_MIN);
      } else {
        for (const b of pArr) _add(stCode, b.code ?? b, CROSS_TRANSFER_MIN);
      }
    });
  }

  /* ================================================================
   * PARTNER LOOKUP
   * ================================================================ */
  function _partnersOf(code) {
    // Returns [{code, networkId, transferMin}]
    const raw = _ixIndex[code] || [];
    const out = [];

    function _push(partnerCode, transferMin) {
      // Determine network from registered routers
      let net = null;
      for (const [id, r] of Object.entries(_routers)) {
        if (typeof r.hasStation === 'function' && r.hasStation(partnerCode)) { net = id; break; }
        if (typeof r.allStations === 'function') {
          const all = r.allStations();
          if (all.some(s => s.code === partnerCode)) { net = id; break; }
        }
      }
      if (!net) return;
      out.push({ code: partnerCode, networkId: net, transferMin: transferMin ?? CROSS_TRANSFER_MIN });
    }

    raw.forEach(entry => {
  _push(entry.code, entry.transferMin ?? CROSS_TRANSFER_MIN);
});

    // deduplicate
    const seen = new Set();
    return out.filter(e => { if (seen.has(e.code)) return false; seen.add(e.code); return true; });
  }

  /* ================================================================
   * TIME UTILITIES
   * ================================================================ */
  function _hmToSec(hm) {
    if (!hm) return 0;
    const [h, m] = hm.split(':').map(Number);
    return h * 3600 + m * 60;
  }
  function _secToHM(sec) {
    const s = ((sec % 86400) + 86400) % 86400;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  /* ================================================================
   * JOURNEY BUILDERS
   * ================================================================ */
  function _buildJourney2(j1, j2, midCode, walkMin) {
  const totalKm = (j1.totalKm != null && j2.totalKm != null)
    ? j1.totalKm + j2.totalKm : null;
  const wkMin   = walkMin ?? CROSS_TRANSFER_MIN;
  const totalGapMin = Math.round(
    (_hmToSec(j2.departureTime) - _hmToSec(j1.arrivalTime)) / 60
  );
  const wtMin = Math.max(0, totalGapMin - wkMin);

  // Propaga thruService/thruNode se presenti nel primo journey (es. KW→M8)
  const thruFields = {};
  if (j1.thruService) {
    thruFields.thruService = true;
    thruFields.thruNode    = j1.thruNode;
  }

  return {
    legs:              [...j1.legs, ...j2.legs],
    departureTime:     j1.departureTime,
    arrivalTime:       j2.arrivalTime,
    totalMinutes:      Math.round((_hmToSec(j2.arrivalTime) - _hmToSec(j1.departureTime)) / 60),
    totalKm,
    transfers:         (j1.transfers + j2.transfers) + 1,
    transferNodes:     [...(j1.transferNodes || []), midCode, ...(j2.transferNodes || [])],
    transferWalkMin:   [wkMin],
    transferWaitMin:   [wtMin],
    ...thruFields,
  };
}

  function _buildJourney3(j1, j2, j3, midCode1, midCode2, walkMin1, walkMin2) {
    const totalKm = (j1.totalKm != null && j2.totalKm != null && j3.totalKm != null)
      ? j1.totalKm + j2.totalKm + j3.totalKm : null;
    const wk1 = walkMin1 ?? CROSS_TRANSFER_MIN;
    const wk2 = walkMin2 ?? CROSS_TRANSFER_MIN;
    const gap1 = Math.round((_hmToSec(j2.departureTime) - _hmToSec(j1.arrivalTime)) / 60);
    const gap2 = Math.round((_hmToSec(j3.departureTime) - _hmToSec(j2.arrivalTime)) / 60);
    return {
      legs:              [...j1.legs, ...j2.legs, ...j3.legs],
      departureTime:     j1.departureTime,
      arrivalTime:       j3.arrivalTime,
      totalMinutes:      Math.round((_hmToSec(j3.arrivalTime) - _hmToSec(j1.departureTime)) / 60),
      totalKm,
      transfers:         (j1.transfers + j2.transfers + j3.transfers) + 2,
      transferNodes:     [
        ...(j1.transferNodes || []), midCode1,
        ...(j2.transferNodes || []), midCode2,
        ...(j3.transferNodes || []),
      ],
      transferWalkMin:   [wk1, wk2],
      transferWaitMin:   [Math.max(0, gap1 - wk1), Math.max(0, gap2 - wk2)],
    };
  }

  /* ================================================================
   * SAFE SEARCH WRAPPER
   * ================================================================ */
  function _safeSearch(router, networkId, from, to, depTime, opts) {
    try {
      if (from === to) return [];
      const fn = router.search || router.findJourneys;
      if (typeof fn !== 'function') return [];
      const results = fn.call(router, from, to, depTime, opts);
      return Array.isArray(results) ? results : [];
    } catch (e) {
      return [];
    }
  }

  /* ================================================================
   * NETWORK FILTER
   * ================================================================ */
  function _networkFilter(opts) {
    const raw = opts.networks;
    if (!raw) return null;
    return new Set(Array.isArray(raw) ? raw.map(s => s.toUpperCase()) : [raw.toUpperCase()]);
  }

  /* ================================================================
   * STATION NODE RESOLUTION
   * ================================================================ */
  function _resolveNodes(code, netFilter) {
    // Returns [{code, networkId}] for all networks that know this station
    const out = [];
    for (const [id, r] of Object.entries(_routers)) {
      if (netFilter && !netFilter.has(id)) continue;
      let found = false;
      if (typeof r.hasStation === 'function') {
        found = r.hasStation(code);
      } else if (typeof r.allStations === 'function') {
        found = r.allStations().some(s => s.code === code);
      }
      if (found) out.push({ code, networkId: id });
    }
    return out;
  }

  /* ================================================================
   * search(from, to, depTime, opts)
   * ================================================================ */
  function search(from, to, depTime, opts = {}) {
    const maxResults = opts.maxResults ?? MAX_JOURNEYS;
    const directOnly = !!opts.directOnly;
    const netFilter  = _networkFilter(opts);

    const fNodes = _resolveNodes(from, netFilter);
    const tNodes = _resolveNodes(to,   netFilter);
    if (!fNodes.length || !tNodes.length) return [];

    const journeys = [];

    /* ---- 1. DIRECT ---- */
    for (const fNode of fNodes) {
      for (const tNode of tNodes) {
        if (fNode.networkId !== tNode.networkId) continue;
        const router = _routerFor(fNode.networkId);
        if (!router) continue;
        const results = _safeSearch(router, fNode.networkId, from, to, depTime, opts);
        results.forEach(j => {
          // Normalise direct journey shape
          journeys.push({
            ...j,
            transfers:       j.transfers ?? 0,
            transferNodes:   j.transferNodes ?? [],
            transferWalkMin: j.transferWalkMin ?? [],
            transferWaitMin: j.transferWaitMin ?? [],
          });
        });
      }
    }

    if (directOnly) {
      return _dedup(journeys).slice(0, maxResults);
    }

    /* ---- 2. 2-LEG ---- */
    for (const fNode of fNodes) {
      if (netFilter && !netFilter.has(fNode.networkId)) continue;
      const router1 = _routerFor(fNode.networkId);
      if (!router1 || typeof router1.allStations !== 'function') continue;

      for (const midSt of router1.allStations()) {
        const partners = _partnersOf(midSt.code).filter(p => {
  if (netFilter && !netFilter.has(p.networkId)) return false;
  // Permetti anche same-network se le stazioni non sono raggiungibili direttamente
  return tNodes.some(t => t.networkId === p.networkId);
  // (già ok — il filtro non esclude same-network; il problema era solo _buildIx)
});
        if (!partners.length) continue;

        const j1list = _safeSearch(
          router1, fNode.networkId,
          fNode.code, midSt.code, depTime,
          { ...opts, maxResults: 2, directOnly: true }
        );
        if (!j1list.length) continue;

        for (const partner of partners) {
          const router2 = _routerFor(partner.networkId);
          if (!router2) continue;
          const tNode = tNodes.find(n => n.networkId === partner.networkId);
          if (!tNode) continue;

          for (const j1 of j1list) {
            const transferSec = (partner.transferMin ?? CROSS_TRANSFER_MIN) * 60;
            const readyHM     = _secToHM(_hmToSec(j1.arrivalTime) + transferSec);
            const j2list = _safeSearch(
              router2, partner.networkId,
              partner.code, tNode.code, readyHM,
              { ...opts, maxResults: 2, directOnly: true }
            );
            for (const j2 of j2list)
              journeys.push(_buildJourney2(j1, j2, midSt.code, partner.transferMin ?? CROSS_TRANSFER_MIN));
          }
        }
      }
    }

    /* ---- 3. 3-LEG ---- */
    for (const fNode of fNodes) {
      if (netFilter && !netFilter.has(fNode.networkId)) continue;
      const router1 = _routerFor(fNode.networkId);
      if (!router1 || typeof router1.allStations !== 'function') continue;

      for (const midSt1 of router1.allStations()) {
        const partners1 = _partnersOf(midSt1.code);
        if (!partners1.length) continue;

        const j1list = _safeSearch(
          router1, fNode.networkId,
          fNode.code, midSt1.code, depTime,
          { ...opts, maxResults: 2, directOnly: true }
        );
        if (!j1list.length) continue;

        for (const p1 of partners1) {
          if (netFilter && !netFilter.has(p1.networkId)) continue;
          if (tNodes.some(t => t.networkId === p1.networkId)) continue;

          const router2 = _routerFor(p1.networkId);
          if (!router2 || typeof router2.allStations !== 'function') continue;

          for (const midSt2 of router2.allStations()) {
            const partners2 = _partnersOf(midSt2.code).filter(p => {
              if (netFilter && !netFilter.has(p.networkId)) return false;
              return tNodes.some(t => t.networkId === p.networkId);
            });
            if (!partners2.length) continue;

            for (const j1 of j1list) {
              const tSec1  = (p1.transferMin ?? CROSS_TRANSFER_MIN) * 60;
              const ready1 = _secToHM(_hmToSec(j1.arrivalTime) + tSec1);

              const j2list = _safeSearch(
                router2, p1.networkId,
                p1.code, midSt2.code, ready1,
                { ...opts, maxResults: 2, directOnly: true }
              );
              if (!j2list.length) continue;

              for (const p2 of partners2) {
                const router3 = _routerFor(p2.networkId);
                if (!router3) continue;
                const tNode = tNodes.find(n => n.networkId === p2.networkId);
                if (!tNode) continue;

                for (const j2 of j2list) {
                  const tSec2  = (p2.transferMin ?? CROSS_TRANSFER_MIN) * 60;
                  const ready2 = _secToHM(_hmToSec(j2.arrivalTime) + tSec2);
                  const j3list = _safeSearch(
                    router3, p2.networkId,
                    p2.code, tNode.code, ready2,
                    { ...opts, maxResults: 2, directOnly: true }
                  );
                  for (const j3 of j3list)
                    journeys.push(_buildJourney3(j1, j2, j3, midSt1.code, midSt2.code, p1.transferMin ?? CROSS_TRANSFER_MIN, p2.transferMin ?? CROSS_TRANSFER_MIN));
                }
              }
            }
          }
        }
      }
    }

    return _dedup(journeys).slice(0, maxResults);
  }

  /* ================================================================
   * DEDUP
   * ================================================================ */
  function _dedup(journeys) {
    const seen = new Set();
    return journeys
      .sort((a, b) => _hmToSec(a.departureTime) - _hmToSec(b.departureTime) ||
                      a.totalMinutes - b.totalMinutes)
      .filter(j => {
        const key = j.departureTime + '|' + j.arrivalTime + '|' +  (j.legs || []).map(l =>  (l.lineId ?? l.network ?? '') + ':' + (l.svcId ?? l.service ?? '')  ).join(',');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  /* ================================================================
   * PUBLIC API
   * ================================================================ */
  return {
    registerRouter,
    buildInterchangeIndex,
    search,
    CROSS_TRANSFER_MIN,
  };
});

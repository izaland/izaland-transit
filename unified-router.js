/* ================================================================
   UNIFIED-ROUTER.JS — Izaland Cross-Network Journey Planner
   ================================================================
   Aggrega IZXRouter, SuburbanRouter e MetroRouter in un'unica
   interfaccia di ricerca. Gestisce i trasferimenti cross-network
   tramite due meccanismi complementari:

   1. Name-matching — stazioni con lo stesso nome su reti diverse.
      Le linee metro sono trattate come reti separate (M2, M4, …)
      così il name-match funziona anche intra-metro.

   2. Interchange index — mappe dichiarative lette da:
        MetroRouter.allInterchanges()    ← aggrega tutti i M*_INTERCHANGE
        IZX_LINES[x].INTERCHANGE + INTERCHANGE_EXTRA
        SUBURBAN_INTERCHANGE
      Aggiungere una nuova linea metro NON richiede modifiche qui.

   API pubblica:
     UnifiedRouter.search(from, to, depTime, opts) → Journey[]
     UnifiedRouter.stationName(code)               → string
     UnifiedRouter.allStations()                   → Station[]
     UnifiedRouter.allLines()                      → Line[]
     UnifiedRouter.availableNetworks()             → string[]

   opts supportate:
     opts.maxResults   {number}          default 5
     opts.directOnly   {boolean}         default false
     opts.networks     {string|string[]} es. ['IZX','METRO','M2']
     opts.lines        {string|string[]} passa al sotto-router
================================================================ */
'use strict';

const UnifiedRouter = (() => {

  const CROSS_TRANSFER_MIN = 10;
  const CROSS_TRANSFER_SEC = CROSS_TRANSFER_MIN * 60;
  const MAX_JOURNEYS = 5;

  /* ----------------------------------------------------------------
   * _routers()
   * Registro reti non-metro. Le linee metro vengono registrate
   * singolarmente da _metroRouters().
   * ---------------------------------------------------------------- */
  function _routers() {
    const r = [];
    if (typeof SuburbanRouter !== 'undefined') r.push({ id: 'SUBURBAN', router: SuburbanRouter });
    if (typeof IZXRouter      !== 'undefined') r.push({ id: 'IZX',      router: IZXRouter      });
    return r;
  }

  /* ----------------------------------------------------------------
   * _metroRouters()
   * Una entry per ogni linea metro caricata, con id = lineId (es. 'M2').
   * Ogni entry espone un router virtuale che delega a MetroRouter
   * ma filtrato per lineId.
   * ---------------------------------------------------------------- */
  function _metroRouters() {
    if (typeof MetroRouter === 'undefined') return [];
    return MetroRouter.allLines().map(line => ({
      id: line.id,
      router: {
        search: (from, to, depTime, opts) =>
          MetroRouter.search(from, to, depTime, {
            ...opts,
            lines: line.id,
          }),
        stationName:  MetroRouter.stationName.bind(MetroRouter),
        allStations:  () => MetroRouter.allStations().filter(s => s.lineId === line.id),
        allLines:     () => MetroRouter.allLines().filter(l => l.id === line.id),
        lineColor:    MetroRouter.lineColor.bind(MetroRouter),
      },
    }));
  }

  /* Tutti i router (non-metro + metro) */
  function _allRouters() {
    return [..._routers(), ..._metroRouters()];
  }

  /* ----------------------------------------------------------------
   * _buildNameIndex()
   * ---------------------------------------------------------------- */
  let _nameIndex = null;
  function _buildNameIndex() {
    if (_nameIndex) return _nameIndex;
    _nameIndex = {};
    for (const { id, router } of _allRouters()) {
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
   * _networkOf(code)
   * ---------------------------------------------------------------- */
  function _networkOf(code) {
    /* Metro: usa MetroRouter.networkOf() per il lineId preciso */
    if (typeof MetroRouter !== 'undefined' && typeof MetroRouter.networkOf === 'function') {
      const mNet = MetroRouter.networkOf(code);
      if (mNet) return mNet;
    }
    for (const { id, router } of _routers()) {
      if (typeof router.allStations !== 'function') continue;
      if (router.allStations().some(s => s.code === code)) return id;
    }
    return null;
  }

  /* ----------------------------------------------------------------
   * _buildInterchangeIndex()
   * Legge tutte le mappe dichiarative. Le linee metro vengono
   * gestite da MetroRouter.allInterchanges() — nessuna modifica
   * necessaria quando si aggiunge M3, M5, ecc.
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

    /* 1. Metro — tutte le linee in una chiamata */
    if (typeof MetroRouter !== 'undefined' &&
        typeof MetroRouter.allInterchanges === 'function') {
      for (const ix of MetroRouter.allInterchanges()) {
        _add(ix.codeA, ix.codeB, ix.transferMin);
      }
    }

    /* 2. IZX_LINES[x].INTERCHANGE + INTERCHANGE_EXTRA */
    if (typeof IZX_LINES !== 'undefined') {
      for (const line of Object.values(IZX_LINES)) {
        if (line.INTERCHANGE) {
          for (const [a, b] of Object.entries(line.INTERCHANGE))
            _add(a, b, CROSS_TRANSFER_MIN);
        }
        if (line.INTERCHANGE_EXTRA) {
          for (const [a, bArr] of Object.entries(line.INTERCHANGE_EXTRA))
            for (const b of bArr) _add(a, b, CROSS_TRANSFER_MIN);
        }
      }
    }

    /* 3. SUBURBAN_INTERCHANGE */
    if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
      for (const [a, bArr] of Object.entries(SUBURBAN_INTERCHANGE))
        for (const b of bArr) _add(a, b, CROSS_TRANSFER_MIN);
    }

    return _ixIndex;
  }

  /* ----------------------------------------------------------------
   * _partnersOf(code)
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
      for (const entry of (_buildNameIndex()[key] || []))
        if (entry.code !== code) _push(entry.code, CROSS_TRANSFER_MIN);
    }

    /* 2. interchange-index */
    for (const entry of (_buildInterchangeIndex()[code] || []))
      _push(entry.code, entry.transferMin);

    return out;
  }

  /* ----------------------------------------------------------------
   * _sameLine, _safeSearch, utils
   * ---------------------------------------------------------------- */
  function _sameLine(codeA, codeB, networkId) {
    if (networkId === 'SUBURBAN' && typeof SUBURBAN_LINES !== 'undefined') {
      return Object.values(SUBURBAN_LINES).some(line => {
        const ia = line.stations.findIndex(s => s.code === codeA);
        const ib = line.stations.findIndex(s => s.code === codeB);
        return ia !== -1 && ib !== -1;
      });
    }
    return true;
  }

  function _safeSearch(router, networkId, from, to, depTime, opts) {
    if (!_sameLine(from, to, networkId)) return [];
    const results = router.search(from, to, depTime, opts);
    return results.filter(j => {
      const lastLeg = j.legs[j.legs.length - 1];
      return lastLeg && lastLeg.alightCode === to;
    });
  }

  function _stationNameRaw(code) {
    for (const { router } of _allRouters()) {
      if (typeof router.allStations !== 'function') continue;
      const st = router.allStations().find(s => s.code === code);
      if (st) return st.name || st.n || null;
    }
    return null;
  }

  function _resolveToAll(codeOrName) {
    const idx = _buildNameIndex();
    for (const entries of Object.values(idx)) {
      const found = entries.find(e => e.code === codeOrName);
      if (found) {
        const key = found.name.trim().toLowerCase();
        return idx[key] || [found];
      }
    }
    const key = String(codeOrName).trim().toLowerCase();
    return idx[key] || [];
  }

  function _routerFor(networkId) {
    return _allRouters().find(r => r.id === networkId)?.router ?? null;
  }

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

  function _networkFilter(opts) {
    const raw = opts.networks;
    if (!raw) return null;
    return new Set(Array.isArray(raw) ? raw.map(s => s.toUpperCase()) : [raw.toUpperCase()]);
  }

  /* ----------------------------------------------------------------
   * _buildJourney2 / _buildJourney3
   * ---------------------------------------------------------------- */
  function _buildJourney2(j1, j2, midCode) {
    const totalKm = (j1.totalKm != null && j2.totalKm != null)
      ? j1.totalKm + j2.totalKm : null;
    const waitMin = Math.round(
      (_hmToSec(j2.departureTime) - _hmToSec(j1.arrivalTime)) / 60
    );
    return {
      legs:            [...j1.legs, ...j2.legs],
      departureTime:   j1.departureTime,
      arrivalTime:     j2.arrivalTime,
      totalMinutes:    Math.round((_hmToSec(j2.arrivalTime) - _hmToSec(j1.departureTime)) / 60),
      totalKm,
      transfers:       (j1.transfers + j2.transfers) + 1,
      transferNodes:   [...(j1.transferNodes || []), midCode, ...(j2.transferNodes || [])],
      transferWaitMin: waitMin,
    };
  }

  function _buildJourney3(j1, j2, j3, midCode1, midCode2) {
    const totalKm = (j1.totalKm != null && j2.totalKm != null && j3.totalKm != null)
      ? j1.totalKm + j2.totalKm + j3.totalKm : null;
    return {
      legs:            [...j1.legs, ...j2.legs, ...j3.legs],
      departureTime:   j1.departureTime,
      arrivalTime:     j3.arrivalTime,
      totalMinutes:    Math.round((_hmToSec(j3.arrivalTime) - _hmToSec(j1.departureTime)) / 60),
      totalKm,
      transfers:       (j1.transfers + j2.transfers + j3.transfers) + 2,
      transferNodes:   [
        ...(j1.transferNodes || []), midCode1,
        ...(j2.transferNodes || []), midCode2,
        ...(j3.transferNodes || []),
      ],
      transferWaitMin: Math.round((_hmToSec(j2.departureTime) - _hmToSec(j1.arrivalTime)) / 60),
    };
  }

  /* ================================================================
   * search(from, to, depTime, opts)
   * ================================================================ */
  function search(from, to, depTime, opts = {}) {
    const maxResults = opts.maxResults ?? MAX_JOURNEYS;
    const directOnly = !!opts.directOnly;
    const netFilter  = _networkFilter(opts);
    const journeys   = [];

    const fromNodes = _resolveToAll(from);
    const toNodes   = _resolveToAll(to);

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

    /* ---- 1. Diretti ---- */
    for (const { id, router } of _allRouters()) {
      if (netFilter && !netFilter.has(id)) continue;
      if (typeof router.search !== 'function') continue;
      const fNode = fNodes.find(n => n.networkId === id);
      const tNode = tNodes.find(n => n.networkId === id);
      if (!fNode || !tNode) continue;
      const results = _safeSearch(router, id, fNode.code, tNode.code, depTime, opts);
      for (const j of results) journeys.push({ ...j, _src: id });
    }

    if (directOnly) return _finalise(journeys, maxResults);

    /* ---- 2. 2-LEG ---- */
    for (const fNode of fNodes) {
      if (netFilter && !netFilter.has(fNode.networkId)) continue;
      const router1 = _routerFor(fNode.networkId);
      if (!router1 || typeof router1.allStations !== 'function') continue;

      for (const midSt of router1.allStations()) {
        const partners = _partnersOf(midSt.code).filter(p => {
          if (netFilter && !netFilter.has(p.networkId)) return false;
          return tNodes.some(t => t.networkId === p.networkId);
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
              journeys.push(_buildJourney2(j1, j2, midSt.code));
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
                    journeys.push(_buildJourney3(j1, j2, j3, midSt1.code, midSt2.code));
                }
              }
            }
          }
        }
      }
    }

    return _finalise(journeys, maxResults);
  }

  /* ----------------------------------------------------------------
   * _finalise
   *
   * Regola di dominanza aggiornata:
   *   B domina A solo se:
   *     - parte non prima di A (depB >= depA)
   *     - arriva non dopo di A (arrB <= arrA)
   *     - almeno uno dei due è strettamente migliore
   *     - E ha un numero di cambi <= a quello di A
   *
   * Questo garantisce che un treno diretto non venga mai eliminato
   * da un viaggio con cambio più veloce: il comfort (0 cambi) è
   * sempre presentato come opzione alternativa.
   * ---------------------------------------------------------------- */
  function _finalise(journeys, maxResults) {
    const seen = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l =>
        `${l.lineId}:${l.boardDep}:${l.boardCode}:${l.alightCode}`
      ).join('|');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });

    const nonDominated = unique.filter((a, ia) => {
      const depA = _hmToSec(a.departureTime);
      const arrA = _hmToSec(a.arrivalTime);
      const trA  = a.transfers;
      return !unique.some((b, ib) => {
        if (ib === ia) return false;
        const depB = _hmToSec(b.departureTime);
        const arrB = _hmToSec(b.arrivalTime);
        const trB  = b.transfers;
        // B domina A solo se è almeno altrettanto comodo (cambi) E
        // parte non prima E arriva non dopo (con almeno un miglioramento)
        return depB >= depA &&
               arrB <= arrA &&
               trB  <= trA  &&
               (depB > depA || arrB < arrA || trB < trA);
      });
    });

    nonDominated.sort((a, b) => {
      const da = _hmToSec(a.departureTime), db = _hmToSec(b.departureTime);
      if (da !== db) return da - db;
      return a.transfers - b.transfers;
    });
    return nonDominated.slice(0, maxResults);
  }

  /* ================================================================
   * API pubblica
   * ================================================================ */
  function stationName(code) {
    for (const { router } of _allRouters()) {
      if (typeof router.stationName !== 'function') continue;
      const name = router.stationName(code);
      if (name && name !== code) return name;
    }
    return code;
  }

  function allStations() {
    const seen = new Set();
    const out  = [];
    for (const { id, router } of _allRouters()) {
      if (typeof router.allStations !== 'function') continue;
      for (const st of router.allStations()) {
        if (seen.has(st.code)) continue;
        seen.add(st.code);
        out.push({ ...st, networkId: id });
      }
    }
    return out;
  }

  function allLines() {
    const out = [];
    for (const { id, router } of _allRouters()) {
      if (typeof router.allLines !== 'function') continue;
      for (const line of router.allLines()) out.push({ ...line, networkId: id });
    }
    return out;
  }

  function lineColor(lineId) {
    for (const { router } of _allRouters()) {
      if (typeof router.lineColor !== 'function') continue;
      const c = router.lineColor(lineId);
      if (c && c !== '#888') return c;
    }
    return '#888';
  }

  function availableNetworks() {
    return _allRouters().map(r => r.id);
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

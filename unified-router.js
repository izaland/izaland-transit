/* ================================================================
   UNIFIED-ROUTER.JS — Izaland Cross-Network Journey Planner
   ================================================================
   Aggrega IZXRouter, LERouter, SuburbanRouter e MetroRouter in
   un'unica interfaccia di ricerca. Gestisce i trasferimenti
   cross-network tra IZX, LE (Lake Eira), Suburban e Metro.

   FIX 14 (stazioni identiche con codici su reti diverse):
     Alcune stazioni hanno un codice per ogni rete pur essendo la
     STESSA stazione (es. Binno = LL02 / SK25 / TS12 / M452;
     Anagusa Mukai = KD30 / JD03 / M405).
       - SAME_STATION_GROUPS elenca i codici equivalenti;
         registerSameStation(codes) permette di aggiungerne altri.
       - _partnersOf() restituisce transferMin = 0 tra codici dello
         stesso gruppo appartenenti a reti diverse.
       - La fase 1 espande from/to agli alias a 0 min e prova il
         diretto su ogni coppia di codici della stessa rete.

   FIX 15 (treni duplicati):
       - search() accetta from/to come array o stringa separata da
         virgole ('LL10,KD26,JD05,SHX06'): prova tutte le coppie e
         applica UN SOLO dedup finale.

   FIX 16 (treni ripetuti 4 volte, es. SHX19 -> LL10,KD26,JD05,SHX06):
     Causa: lo stesso router (es. SuburbanRouter) puo' essere
     registrato con piu' networkId; _resolveNodes() restituiva quindi
     lo stesso codice 4 volte e la fase diretta eseguiva la stessa
     ricerca 4 volte. In piu' la chiave di dedup usava campi (lineId,
     svcId...) che possono variare tra le copie.
       - _resolveNodes()/_aliasNodes() deduplicano per (router, codice):
         un solo nodo per router reale.
       - _journeyKey() usa solo orari (partenza/arrivo del journey e
         di ogni leg) + n. cambi, senza id di linea/servizio/stazione.
================================================================ */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.IZXUnifiedRouter = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_JOURNEYS       = 5;
  const CROSS_TRANSFER_MIN = 10;
  const CROSS_TRANSFER_SEC = CROSS_TRANSFER_MIN * 60;

  const _routers = {};

  /* Gruppi di codici che indicano la stessa stazione fisica su reti diverse. */
  const SAME_STATION_GROUPS = [
    ['LL02', 'SK25', 'TS12', 'M452'],   // Binno
    ['KD30', 'JD03', 'M405'],           // Anagusa Mukai
  ];

  function registerSameStation(codes) {
    if (Array.isArray(codes) && codes.length > 1) SAME_STATION_GROUPS.push(codes.slice());
  }

  function _sameStation(a, b) {
    return SAME_STATION_GROUPS.some(g => g.includes(a) && g.includes(b));
  }

  function registerRouter(networkId, routerObj) {
    _routers[networkId.toUpperCase()] = routerObj;
  }

  function _routerFor(networkId) {
    return _routers[networkId ? networkId.toUpperCase() : ''] || null;
  }

  function _netOfCode(code) {
    for (const [id, r] of Object.entries(_routers)) {
      if (typeof r.hasStation === 'function' && r.hasStation(code)) return id;
      if (typeof r.allStations === 'function') {
        if (r.allStations().some(s => s.code === code)) return id;
      }
    }
    return null;
  }

  const _ixIndex = {};

  function _add(codeA, codeB, transferMin) {
    const t = transferMin ?? CROSS_TRANSFER_MIN;
    if (!_ixIndex[codeA]) _ixIndex[codeA] = [];
    if (!_ixIndex[codeB]) _ixIndex[codeB] = [];
    if (!_ixIndex[codeA].some(e => e.code === codeB))
      _ixIndex[codeA].push({ code: codeB, transferMin: t });
    if (!_ixIndex[codeB].some(e => e.code === codeA))
      _ixIndex[codeB].push({ code: codeA, transferMin: t });
  }

  function buildInterchangeIndex(interchangeData) {
    if (Array.isArray(interchangeData)) {
      interchangeData.forEach(ix => _add(ix.codeA, ix.codeB, ix.transferMin));
      return;
    }
    Object.entries(interchangeData).forEach(([stCode, partners]) => {
      const pArr = Array.isArray(partners) ? partners : [partners];
      for (const b of pArr) _add(stCode, b.code ?? b, b.transferMin ?? CROSS_TRANSFER_MIN);
    });
  }

  function _partnersOf(code) {
    const raw = _ixIndex[code] || [];
    const out = [];
    const ownNet = raw.some(e => _sameStation(code, e.code)) ? _netOfCode(code) : null;

    function _push(partnerCode, transferMin) {
      const net = _netOfCode(partnerCode);
      if (!net) return;
      const zero = ownNet !== null && net !== ownNet && _sameStation(code, partnerCode);
      out.push({
        code: partnerCode,
        networkId: net,
        transferMin: zero ? 0 : (transferMin ?? CROSS_TRANSFER_MIN),
      });
    }

    raw.forEach(entry => _push(entry.code, entry.transferMin ?? CROSS_TRANSFER_MIN));

    const seen = new Set();
    return out.filter(e => { if (seen.has(e.code)) return false; seen.add(e.code); return true; });
  }

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

  function _buildJourney2(j1, j2, midCode, walkMin) {
    const totalKm = (j1.totalKm != null && j2.totalKm != null)
      ? j1.totalKm + j2.totalKm : null;
    const wkMin = walkMin ?? CROSS_TRANSFER_MIN;
    const totalGapMin = Math.round(
      (_hmToSec(j2.departureTime) - _hmToSec(j1.arrivalTime)) / 60
    );
    const wtMin = Math.max(0, totalGapMin - wkMin);
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

  function _networkFilter(opts) {
    const raw = opts.networks;
    if (!raw) return null;
    return new Set(Array.isArray(raw) ? raw.map(s => s.toUpperCase()) : [raw.toUpperCase()]);
  }

  /* FIX 16: identita' del router reale (lo stesso oggetto puo' essere
     registrato con piu' networkId). */
  const _routerIds = new Map();
  function _routerIdOf(networkId) {
    const r = _routerFor(networkId);
    if (!r) return 'net:' + networkId;
    if (!_routerIds.has(r)) _routerIds.set(r, _routerIds.size + 1);
    return 'r' + _routerIds.get(r);
  }

  function _uniqueNodes(nodes) {
    const seen = new Set();
    return nodes.filter(n => {
      const k = _routerIdOf(n.networkId) + '|' + n.code;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function _resolveNodes(code, netFilter) {
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
    return _uniqueNodes(out);
  }

  /* Nodi di `code` + alias a 0 min (stessa stazione, altra rete). */
  function _aliasNodes(code, netFilter) {
    const out = _resolveNodes(code, netFilter);
    for (const p of _partnersOf(code)) {
      if (p.transferMin !== 0) continue;
      if (netFilter && !netFilter.has(p.networkId)) continue;
      out.push({ code: p.code, networkId: p.networkId });
    }
    return _uniqueNodes(out);
  }

  /* FIX 16: chiave basata SOLO su orari (journey + ogni leg) e n. cambi.
     Nessun id di linea/servizio/stazione: cambiano con l'alias usato. */
  function _journeyKey(j) {
    const legKey = (j.legs || []).map(l => [
      l.boardDep  || l.departureTime || l.dep || l.depTime || '',
      l.alightArr || l.arrivalTime   || l.arr || l.arrTime || '',
    ].join('>')).join('|');
    return `${j.departureTime}~${j.arrivalTime}~${j.transfers ?? 0}~${j.totalMinutes ?? 0}~${legKey}`;
  }

  function _dedup(journeys) {
    const seen = new Set();
    const deduped = journeys.filter(j => {
      const key = _journeyKey(j);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    deduped.sort((a, b) => {
      const da = _hmToSec(a.arrivalTime),   db = _hmToSec(b.arrivalTime);
      if (da !== db) return da - db;
      const ta = a.transfers ?? 0,          tb = b.transfers ?? 0;
      if (ta !== tb) return ta - tb;
      return _hmToSec(b.departureTime) - _hmToSec(a.departureTime);
    });

    const kept = [];
    for (const j of deduped) {
      const arrJ = _hmToSec(j.arrivalTime);
      const depJ = _hmToSec(j.departureTime);
      const trJ  = j.transfers ?? 0;

      const dominated = kept.some(k => {
        const arrK = _hmToSec(k.arrivalTime);
        const depK = _hmToSec(k.departureTime);
        const trK  = k.transfers ?? 0;

        const arrLeq = arrK <= arrJ;
        const depGeq = depK >= depJ;
        const trLeq  = trK  <= trJ;

        if (!(arrLeq && depGeq && trLeq)) return false;
        return (arrK < arrJ) || (depK > depJ) || (trK < trJ);
      });

      if (!dominated) kept.push(j);
    }
    return kept;
  }

  /* Ricerca per una singola coppia di codici; restituisce i journey
     grezzi (senza dedup finale). */
  function _searchRaw(from, to, depTime, opts) {
    const directOnly = !!opts.directOnly;
    const netFilter  = _networkFilter(opts);

    const fNodes = _resolveNodes(from, netFilter);
    const tNodes = _resolveNodes(to,   netFilter);
    if (!fNodes.length || !tNodes.length) return [];

    const journeys = [];

    /* ---- 1. DIRECT (con alias stessa-stazione a 0 min) ---- */
    const fAlias = _aliasNodes(from, netFilter);
    const tAlias = _aliasNodes(to,   netFilter);
    const doneDirect = new Set();
    for (const fNode of fAlias) {
      for (const tNode of tAlias) {
        if (fNode.networkId !== tNode.networkId) continue;
        const router = _routerFor(fNode.networkId);
        if (!router) continue;
        const dk = _routerIdOf(fNode.networkId) + '|' + fNode.code + '|' + tNode.code;
        if (doneDirect.has(dk)) continue;
        doneDirect.add(dk);
        const results = _safeSearch(router, fNode.networkId, fNode.code, tNode.code, depTime, opts);
        results.forEach(j => {
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

    if (directOnly) return journeys;

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
                    journeys.push(_buildJourney3(
                      j1, j2, j3,
                      midSt1.code, midSt2.code,
                      p1.transferMin ?? CROSS_TRANSFER_MIN,
                      p2.transferMin ?? CROSS_TRANSFER_MIN
                    ));
                }
              }
            }
          }
        }
      }
    }

    return journeys;
  }

  function _toCodeList(x) {
    if (Array.isArray(x)) return x.map(s => String(s).trim()).filter(Boolean);
    return String(x || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  /* from/to possono essere array o stringhe 'A,B,C'.
     Tutte le coppie vengono provate e il dedup e' applicato UNA volta. */
  function search(from, to, depTime, opts = {}) {
    const maxResults = opts.maxResults ?? MAX_JOURNEYS;
    const froms = _toCodeList(from);
    const tos   = _toCodeList(to);

    const all = [];
    for (const f of froms) {
      for (const t of tos) {
        _searchRaw(f, t, depTime, opts).forEach(j => all.push(j));
      }
    }
    return _dedup(all).slice(0, maxResults);
  }

  return {
    registerRouter,
    registerSameStation,
    buildInterchangeIndex,
    search,
    dedup: _dedup,
    CROSS_TRANSFER_MIN,
  };
});

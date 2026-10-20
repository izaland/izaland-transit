/* ================================================================
   UNIFIED-ROUTER.JS — Izaland Cross-Network Journey Planner
   ================================================================
   Aggrega IZXRouter, LERouter, SuburbanRouter e MetroRouter in
   un'unica interfaccia di ricerca. Gestisce i trasferimenti
   cross-network tra IZX, LE (Lake Eira), Suburban e Metro.

   FIX 14 (stazioni identiche con codici su reti diverse):
     Alcune stazioni hanno un codice per ogni rete pur essendo la
     STESSA stazione (es. Binno = LL02 / SK25 / TS12 / M452;
     Anagusa Mukai = KD30 / JD03 / M405). Prima la fase 1 (diretto)
     cercava solo nella rete di from/to, quindi Binno → Anagusa Mukai
     sulla Metro M4 (M452 → M405) non veniva mai trovato e il cambio
     veniva trattato come interscambio da 10 min.
     Ora:
       - SAME_STATION_GROUPS elenca i codici equivalenti;
         registerSameStation(codes) permette di aggiungerne altri.
       - _partnersOf() restituisce transferMin = 0 tra codici dello
         stesso gruppo appartenenti a reti diverse.
       - La fase 1 espande from/to agli alias a 0 min e prova il
         diretto su ogni coppia di codici della stessa rete.

   FIX 15 (treni duplicati):
       - _journeyKey() non include piu' i codici stazione dei leg:
         lo stesso treno raggiunto tramite alias diversi (es.
         LL10 / KD26 / JD05 / SHX06 = Hayatogaru) ora ha la stessa
         chiave ed e' deduplicato.
       - search() accetta from/to come array o stringa separata da
         virgole ('LL10,KD26,JD05,SHX06'): prova tutte le coppie e
         applica UN SOLO dedup finale.

   FIX 16 (treni passanti / 相互直通運転):
     Su alcune stazioni di confine i treni di due reti proseguono
     l'uno sull'altro (es. M8 <-> KW a Kishagoi-Exhibitown,
     M801 = KW00): i passeggeri restano a bordo e c'e' solo una
     sosta breve (cambio macchinista, ~90 s). Non e' un interscambio.
       - THRU_SERVICES elenca le coppie di codici + durata sosta (s);
         registerThruService({ codes:[..], stopSec }) ne aggiunge altre.
       - _partnersOf() marca i partner con thru:true e thruSec.
       - Fasi 2/3: solo LA PRIMA partenza disponibile dopo arrivo +
         stopSec puo' essere un thru. Se parte entro THRU_TOLERANCE_MIN
         dall'arrivo e' un vero thru; ogni corsa successiva resta un
         cambio normale, anche se temporalmente vicina.
       - Il journey ha transferThru[] (uno per cambio, allineato a
         transferNodes[]), transfers NON conta i thru, e
         thruService/thruNode sono impostati per la UI.

   FIX 18 (array per-cambio allineati a transferNodes[]):
     _buildJourney2/3 sovrascrivevano transferThru / transferWalkMin /
     transferWaitMin con un solo elemento, scartando i cambi interni
     dei leg gia' composti (es. KS -> KW dentro SuburbanRouter + thru
     KW -> M8): l'indice 0 (Kawayatsu) riceveva il valore del cambio
     successivo. Ora gli array dei sotto-journey vengono concatenati
     (_xferArrays) e restano lunghi quanto transferNodes[]. La UI deve
     usare transferThru[li] e non il flag globale thruService.
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

  /* PERFORMANCE: cache (dati statici). Svuotate quando cambiano router,
     interscambi, alias o thru. */
  const SEARCH_BUDGET_MS = 2500;       // tempo massimo per una richiesta (anche se la UI chiama search() piu' volte di fila)
  let _lastEnd = 0, _batchDeadline = 0;
  let _netCache      = new Map();      // codice -> networkId
  let _stationsCache = new Map();      // networkId -> allStations()
  let _partnersCache = new Map();      // codice -> partner[]
  let _bridgeCache   = new Map();      // networkId -> stazioni con partner
  let _memo          = new Map();      // risultati dei sotto-ricerca
  let _deadline      = Infinity;
  let _truncated     = false;

  function _clearCaches() {
    _netCache.clear(); _stationsCache.clear(); _partnersCache.clear();
    _bridgeCache.clear(); _memo.clear();
  }
  function _timeUp() {
    if (Date.now() > _deadline) { _truncated = true; return true; }
    return false;
  }
  function _stationsOf(networkId) {
    let v = _stationsCache.get(networkId);
    if (!v) {
      const r = _routers[networkId];
      v = (r && typeof r.allStations === 'function') ? (r.allStations() || []) : [];
      _stationsCache.set(networkId, v);
    }
    return v;
  }
  /* Solo le stazioni che hanno almeno un interscambio possono essere
     nodi intermedi: evita di scandire centinaia di stazioni inutili. */
  function _bridgesOf(networkId) {
    let v = _bridgeCache.get(networkId);
    if (!v) {
      v = _stationsOf(networkId).filter(st => _partnersOf(st.code).length > 0);
      _bridgeCache.set(networkId, v);
    }
    return v;
  }

  /* Gruppi di codici che indicano la stessa stazione fisica su reti diverse. */
  const SAME_STATION_GROUPS = [
    ['LL02', 'SK25', 'TS12', 'M452'],   // Binno
    ['KD30', 'JD03', 'M405'],           // Anagusa Mukai
  ];

  /* Thru services: i treni proseguono da una rete all'altra (stay on board). */
  const THRU_TOLERANCE_MIN = 3;   // gap max (min) tra arrivo e partenza per considerarlo thru
  const THRU_SERVICES = [
    { codes: ['M801', 'KW00'], stopSec: 90 },   // M8 <-> KW, Kishagoi-Exhibitown
    { codes: ['M1027', 'SSK01'], stopSec: 90 },   // M10 <-> SSK, Kanui Airport T1
    { codes: ['M415', 'SBO07'], stopSec: 90 },   // M4 <-> SBO, Kawaei
  ];

  function registerThruService(def) {
    if (def && Array.isArray(def.codes) && def.codes.length > 1)
      THRU_SERVICES.push({ codes: def.codes.slice(), stopSec: def.stopSec ?? 90 });
    _clearCaches();
  }

  function _thruStop(a, b) {
    for (const t of THRU_SERVICES)
      if (t.codes.includes(a) && t.codes.includes(b) && a !== b) return t.stopSec;
    return null;
  }

  function registerSameStation(codes) {
    if (Array.isArray(codes) && codes.length > 1) SAME_STATION_GROUPS.push(codes.slice());
    _clearCaches();
  }

  function _sameStation(a, b) {
    return SAME_STATION_GROUPS.some(g => g.includes(a) && g.includes(b));
  }

  function registerRouter(networkId, routerObj) {
    _routers[networkId.toUpperCase()] = routerObj;
    _clearCaches();
  }

  function _routerFor(networkId) {
    return _routers[networkId ? networkId.toUpperCase() : ''] || null;
  }

  function _netOfCode(code) {
    if (_netCache.has(code)) return _netCache.get(code);
    let found = null;
    for (const [id, r] of Object.entries(_routers)) {
      if (typeof r.hasStation === 'function' && r.hasStation(code)) { found = id; break; }
      if (_stationsOf(id).some(s => s.code === code)) { found = id; break; }
    }
    _netCache.set(code, found);
    return found;
  }

  const _ixIndex = {};

  /* Default dei cambi senza override: suburbana↔suburbana → regola per numero
     di linee (SuburbanRouter.transferMin); suburbana↔altra rete → 5 min;
     altre combinazioni → CROSS_TRANSFER_MIN. */
  const SUB_CROSS_TRANSFER_MIN = 5;
  function _defaultTransferMin(codeA, codeB) {
    const na = _netOfCode(codeA), nb = _netOfCode(codeB);
    if (na === 'SUB' && nb === 'SUB' && typeof _routers.SUB?.transferMin === 'function')
      return _routers.SUB.transferMin(codeA, codeB);
    if (na === 'SUB' || nb === 'SUB') return SUB_CROSS_TRANSFER_MIN;
    return CROSS_TRANSFER_MIN;
  }

  function _add(codeA, codeB, transferMin) {
    const t = transferMin ?? _defaultTransferMin(codeA, codeB);
    if (!_ixIndex[codeA]) _ixIndex[codeA] = [];
    if (!_ixIndex[codeB]) _ixIndex[codeB] = [];
    if (!_ixIndex[codeA].some(e => e.code === codeB))
      _ixIndex[codeA].push({ code: codeB, transferMin: t });
    if (!_ixIndex[codeB].some(e => e.code === codeA))
      _ixIndex[codeB].push({ code: codeA, transferMin: t });
  }

  function buildInterchangeIndex(interchangeData) {
    _clearCaches();
    if (Array.isArray(interchangeData)) {
      interchangeData.forEach(ix => _add(ix.codeA, ix.codeB, ix.transferMin));
      return;
    }
    Object.entries(interchangeData).forEach(([stCode, partners]) => {
      const pArr = Array.isArray(partners) ? partners : [partners];
      for (const b of pArr) _add(stCode, b.code ?? b, b.transferMin);
    });
  }

  function _partnersOf(code) {
    let c = _partnersCache.get(code);
    if (!c) { c = _partnersOfRaw(code); _partnersCache.set(code, c); }
    return c;
  }

  function _partnersOfRaw(code) {
    const raw = _ixIndex[code] || [];
    const out = [];
    const ownNet = raw.some(e => _sameStation(code, e.code)) ? _netOfCode(code) : null;

    function _push(partnerCode, transferMin) {
      const net = _netOfCode(partnerCode);
      if (!net) return;
      const zero = ownNet !== null && net !== ownNet && _sameStation(code, partnerCode);
      const thruSec = _thruStop(code, partnerCode);
      out.push({
        code: partnerCode,
        networkId: net,
        transferMin: zero ? 0 : (transferMin ?? CROSS_TRANSFER_MIN),
        thru: thruSec !== null,
        thruSec: thruSec,
      });
    }

    /* Le coppie thru valgono anche se mancano da INTERCHANGE. */
    THRU_SERVICES.forEach(t => {
      if (!t.codes.includes(code)) return;
      t.codes.filter(c => c !== code).forEach(c => {
        if (!raw.some(e => e.code === c)) _push(c, CROSS_TRANSFER_MIN);
      });
    });

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

  /* FIX 18: array per-cambio di un sotto-journey, lunghi quanto
     transferNodes[]. Se il sotto-journey non li espone (es. leg
     interno di SuburbanRouter), thru ricade sul flag globale e
     walk/wait restano null (la UI usa i propri default con ??). */
  function _xferArrays(j) {
    const n = (j.transferNodes || []).length;
    const fill = v => Array.from({ length: n }, () => v);
    const thru = (Array.isArray(j.transferThru) && j.transferThru.length === n)
      ? j.transferThru.slice() : fill(!!j.thruService);
    let walk;
    if (Array.isArray(j.transferWalkMin) && j.transferWalkMin.length === n) walk = j.transferWalkMin.slice();
    else if (typeof j.transferWalkMin === 'number') walk = fill(j.transferWalkMin);
    else walk = fill(null);
    let wait;
    if (Array.isArray(j.transferWaitMin) && j.transferWaitMin.length === n) wait = j.transferWaitMin.slice();
    else if (typeof j.transferWaitMin === 'number') wait = fill(null).map((_, i) => i === 0 ? j.transferWaitMin : null);
    else wait = fill(null);
    return { thru, walk, wait };
  }

  function _buildJourney2(j1, j2, midCode, walkMin, thru) {
    const totalKm = (j1.totalKm != null && j2.totalKm != null)
      ? j1.totalKm + j2.totalKm : null;
    const wkMin = walkMin ?? CROSS_TRANSFER_MIN;
    const totalGapMin = Math.round(
      (_hmToSec(j2.departureTime) - _hmToSec(j1.arrivalTime)) / 60
    );
    const wtMin = Math.max(0, totalGapMin - wkMin);
    const a = _xferArrays(j1), b = _xferArrays(j2);
    const transferThru = [...a.thru, !!thru, ...b.thru];
    const thruFields = {};
    const thruIdx = transferThru.indexOf(true);
    if (thruIdx !== -1 || j1.thruService || j2.thruService) {
      const nodes = [...(j1.transferNodes || []), midCode, ...(j2.transferNodes || [])];
      thruFields.thruService = true;
      thruFields.thruNode    = thruIdx !== -1 ? nodes[thruIdx] : (j1.thruNode ?? j2.thruNode);
    }
    return {
      legs:              [...j1.legs, ...j2.legs],
      departureTime:     j1.departureTime,
      arrivalTime:       j2.arrivalTime,
      totalMinutes:      Math.round((_hmToSec(j2.arrivalTime) - _hmToSec(j1.departureTime)) / 60),
      totalKm,
      transfers:         (j1.transfers + j2.transfers) + (thru ? 0 : 1),
      transferNodes:     [...(j1.transferNodes || []), midCode, ...(j2.transferNodes || [])],
      transferThru,
      transferWalkMin:   [...a.walk, thru ? 0 : wkMin, ...b.walk],
      transferWaitMin:   [...a.wait, thru ? 0 : wtMin, ...b.wait],
      ...thruFields,
    };
  }

  function _buildJourney3(j1, j2, j3, midCode1, midCode2, walkMin1, walkMin2, thru1, thru2) {
    const totalKm = (j1.totalKm != null && j2.totalKm != null && j3.totalKm != null)
      ? j1.totalKm + j2.totalKm + j3.totalKm : null;
    const wk1 = walkMin1 ?? CROSS_TRANSFER_MIN;
    const wk2 = walkMin2 ?? CROSS_TRANSFER_MIN;
    const gap1 = Math.round((_hmToSec(j2.departureTime) - _hmToSec(j1.arrivalTime)) / 60);
    const gap2 = Math.round((_hmToSec(j3.departureTime) - _hmToSec(j2.arrivalTime)) / 60);
    const a = _xferArrays(j1), b = _xferArrays(j2), c = _xferArrays(j3);
    const transferThru = [...a.thru, !!thru1, ...b.thru, !!thru2, ...c.thru];
    const transferNodes = [
      ...(j1.transferNodes || []), midCode1,
      ...(j2.transferNodes || []), midCode2,
      ...(j3.transferNodes || []),
    ];
    const thruIdx = transferThru.indexOf(true);
    const thruAny = thruIdx !== -1 || !!(j1.thruService || j2.thruService || j3.thruService);
    return {
      legs:              [...j1.legs, ...j2.legs, ...j3.legs],
      departureTime:     j1.departureTime,
      arrivalTime:       j3.arrivalTime,
      totalMinutes:      Math.round((_hmToSec(j3.arrivalTime) - _hmToSec(j1.departureTime)) / 60),
      totalKm,
      transfers:         (j1.transfers + j2.transfers + j3.transfers) + 2 - (thru1 ? 1 : 0) - (thru2 ? 1 : 0),
      thruService:       thruAny || undefined,
      thruNode:          thruAny ? (thruIdx !== -1 ? transferNodes[thruIdx] : (j1.thruNode ?? j2.thruNode ?? j3.thruNode)) : undefined,
      transferThru,
      transferNodes,
      transferWalkMin:   [...a.walk, thru1 ? 0 : wk1, ...b.walk, thru2 ? 0 : wk2, ...c.walk],
      transferWaitMin:   [...a.wait, thru1 ? 0 : Math.max(0, gap1 - wk1), ...b.wait, thru2 ? 0 : Math.max(0, gap2 - wk2), ...c.wait],
    };
  }

  function _safeSearch(router, networkId, from, to, depTime, opts) {
    if (from === to) return [];
    const key = networkId + '|' + from + '|' + to + '|' + depTime + '|' +
      (opts.directOnly ? 1 : 0) + '|' + (opts.maxResults ?? '') + '|' +
      (opts.networks ? [].concat(opts.networks).join(',') : '');
    const hit = _memo.get(key);
    if (hit) return hit;
    let out = [];
    try {
      const fn = router.search || router.findJourneys;
      if (typeof fn === 'function') {
        const results = fn.call(router, from, to, depTime, opts);
        out = Array.isArray(results) ? results : [];
      }
    } catch (e) {
      out = [];
    }
    if (_memo.size > 150000) _memo.clear();
    _memo.set(key, out);
    return out;
  }

  /* Cerca i leg successivi dopo j1 su un partner. Se il partner e' un
     thru, prova solo la prima partenza disponibile dopo arrivo + stopSec.
     Se quella corsa parte entro THRU_TOLERANCE_MIN e' un vero thru;
     ogni corsa successiva, anche entro la tolleranza, e' un cambio normale. */
  function _nextLegs(router, partner, toCode, j1, opts) {
    const arr = _hmToSec(j1.arrivalTime);
    if (partner.thru) {
      const readyHM = _secToHM(arr + partner.thruSec);
      const list = _safeSearch(router, partner.networkId, partner.code, toCode, readyHM,
        { ...opts, maxResults: 2, directOnly: true });
      const first = list[0];
      if (first) {
        const gap = ((_hmToSec(first.departureTime) - arr + 86400) % 86400) / 60;
        if (gap <= THRU_TOLERANCE_MIN) return [{ j2: first, thru: true }];
      }
    }
    const tSec = (partner.transferMin ?? CROSS_TRANSFER_MIN) * 60;
    const readyHM = _secToHM(arr + tSec);
    return _safeSearch(router, partner.networkId, partner.code, toCode, readyHM,
      { ...opts, maxResults: 2, directOnly: true }).map(j2 => ({ j2, thru: false }));
  }

  function _networkFilter(opts) {
    const raw = opts.networks;
    if (!raw) return null;
    return new Set(Array.isArray(raw) ? raw.map(s => s.toUpperCase()) : [raw.toUpperCase()]);
  }

  function _resolveNodes(code, netFilter) {
    const out = [];
    for (const [id, r] of Object.entries(_routers)) {
      if (netFilter && !netFilter.has(id)) continue;
      let found = false;
      if (typeof r.hasStation === 'function') {
        found = r.hasStation(code);
      } else {
        found = _stationsOf(id).some(s => s.code === code);
      }
      if (found) out.push({ code, networkId: id });
    }
    return out;
  }

  /* Nodi di `code` + alias a 0 min (stessa stazione, altra rete). */
  function _aliasNodes(code, netFilter) {
    const out = _resolveNodes(code, netFilter);
    for (const p of _partnersOf(code)) {
      if (p.transferMin !== 0) continue;
      if (netFilter && !netFilter.has(p.networkId)) continue;
      out.push({ code: p.code, networkId: p.networkId });
    }
    const seen = new Set();
    return out.filter(n => {
      const k = n.networkId + '|' + n.code;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  /* FIX 15: la chiave NON contiene i codici stazione, che cambiano
     in base all'alias con cui e' stata fatta la ricerca. Identifica
     il treno da linea/servizio + orari di salita e discesa. */
  function _journeyKey(j) {
    const legKey = j.legs.map(l => [
      l.lineId  || l.line  || '',
      l.svcId   || l.serviceId || l.tripId || '',
      l.boardDep  || l.departureTime || '',
      l.alightArr || l.arrivalTime   || '',
    ].join(':')).join('|');

    const blank = legKey.replace(/[:|]/g, '').trim() === '';
    if (blank) {
      return `${j.departureTime}~${j.arrivalTime}~${j.transfers ?? 0}~${j.totalMinutes ?? 0}`;
    }
    return legKey;
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
    for (const fNode of fAlias) {
      for (const tNode of tAlias) {
        if (fNode.networkId !== tNode.networkId) continue;
        const router = _routerFor(fNode.networkId);
        if (!router) continue;
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

      for (const midSt of _bridgesOf(fNode.networkId)) {
        if (_timeUp()) break;
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
            for (const { j2, thru } of _nextLegs(router2, partner, tNode.code, j1, opts))
              journeys.push(_buildJourney2(j1, j2, midSt.code, partner.transferMin ?? CROSS_TRANSFER_MIN, thru));
          }
        }
      }
    }

    /* ---- 3. 3-LEG ----
       PERFORMANCE: e' la fase piu' costosa (migliaia di sotto-ricerche).
       Se diretto + 1 cambio hanno gia' dato abbastanza alternative,
       non serve cercare le soluzioni a 2 cambi. */
    const enough = opts.minBeforeThreeLeg ?? 3;
    if (_dedup(journeys.slice()).length >= enough) return journeys;
    for (const fNode of fNodes) {
      if (netFilter && !netFilter.has(fNode.networkId)) continue;
      const router1 = _routerFor(fNode.networkId);
      if (!router1 || typeof router1.allStations !== 'function') continue;

      for (const midSt1 of _bridgesOf(fNode.networkId)) {
        if (_timeUp()) break;
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

          for (const midSt2 of _bridgesOf(p1.networkId)) {
            if (_timeUp()) break;
            const partners2 = _partnersOf(midSt2.code).filter(p => {
              if (netFilter && !netFilter.has(p.networkId)) return false;
              return tNodes.some(t => t.networkId === p.networkId);
            });
            if (!partners2.length) continue;

            for (const j1 of j1list) {
              const j2opts = _nextLegs(router2, p1, midSt2.code, j1, opts);
              if (!j2opts.length) continue;

              for (const p2 of partners2) {
                const router3 = _routerFor(p2.networkId);
                if (!router3) continue;
                const tNode = tNodes.find(n => n.networkId === p2.networkId);
                if (!tNode) continue;

                for (const { j2, thru: th1 } of j2opts) {
                  for (const { j2: j3, thru: th2 } of _nextLegs(router3, p2, tNode.code, j2, opts))
                    journeys.push(_buildJourney3(
                      j1, j2, j3,
                      midSt1.code, midSt2.code,
                      p1.transferMin ?? CROSS_TRANSFER_MIN,
                      p2.transferMin ?? CROSS_TRANSFER_MIN,
                      th1, th2
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

  /* FIX 15: from/to possono essere array o stringhe 'A,B,C'.
     Tutte le coppie vengono provate e il dedup e' applicato UNA volta.
     FIX 17 (performance): budget di tempo per richiesta; se scade, si
     restituiscono i risultati parziali (api.lastSearchTruncated = true). */
  function search(from, to, depTime, opts = {}) {
    const maxResults = opts.maxResults ?? MAX_JOURNEYS;
    const froms = _toCodeList(from);
    const tos   = _toCodeList(to);

    _truncated = false;
    const _now = Date.now();
    if (_now - _lastEnd < 50 && _batchDeadline > _now) _deadline = _batchDeadline;   // stessa richiesta UI
    else _deadline = _batchDeadline = _now + (opts.timeBudgetMs ?? SEARCH_BUDGET_MS);
    const all = [];
    try {
      for (const f of froms) {
        for (const t of tos) {
          if (_timeUp()) break;
          _searchRaw(f, t, depTime, opts).forEach(j => all.push(j));
        }
      }
    } finally {
      _deadline = Infinity;
      _lastEnd = Date.now();
    }
    const res = _dedup(all).slice(0, maxResults);
    api.lastSearchTruncated = _truncated;
    return res;
  }

  const api = {
    lastSearchTruncated: false,
    registerRouter,
    registerSameStation,
    registerThruService,
    buildInterchangeIndex,
    search,
    dedup: _dedup,
    CROSS_TRANSFER_MIN,
  };
  return api;
});

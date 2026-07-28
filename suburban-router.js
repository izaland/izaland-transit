/* ================================================================
   SUBURBAN-ROUTER.JS — Izarail Suburban Journey Planner
   Dipende da: suburban-data.js (SUBURBAN_LINES, SUBURBAN_INTERCHANGE,
                                  SK_SERVICES, KW_SERVICES)

   API pubblica (stesso contratto di IZXRouter):
     SuburbanRouter.search(from, to, depTime, opts) → Journey[]
     SuburbanRouter.stationName(code)               → string
     SuburbanRouter.allStations()                   → Station[]
     SuburbanRouter.TRANSFER_MIN                    → number

   Supporta:
     - Linee lineari (A → B)
     - Linee circolari con fermate intermedie CW e CCW
     - Filtro per lineId (opts.lines)
     - directOnly (opts.directOnly)
     - Risoluzione alias cross-network (es. AX07 → LL17, AX06 → LL01)
     - Cambio a Sainðaul Central (LL01 ↔ K01/R01/E01/AX06)
       e Herubori (LL17 ↔ AX07) verso la rete IZX/AX,
       via IZXRouter.buildLeg()
     - Cambio tra due linee suburbane (es. Loop Line ↔ Kidai Line)
       tramite nodi condivisi in SUBURBAN_INTERCHANGE (fase 4)
     - Thru-service KW ↔ Metro (M8xx) via MetroRouter.buildLeg()
       (fasi 2b e 3b)

   Velocità per segmento (segSpeedKmh):
     Le stazioni KW hanno il campo opzionale segSpeedKmh che indica
     la velocità commerciale media (km/h) sul segmento DA quella
     stazione ALLA successiva. Il router usa _segSpeed() per
     recuperarla; se assente cade su AVG_SPEED_KMH (40 km/h).
     Questo permette di modellare la progressione urbano→extraurbano
     della Kwōkei Line senza toccare le altre linee.

   Sottoservizi SK / KW:
     Le linee SK e KW usano rispettivamente SK_SERVICES e KW_SERVICES
     invece del singolo headway di linea. _svcTrips() gestisce
     entrambi; per SK usa la logica A↔B con firstDep/lastDep;
     per linee prive di *_SERVICES si usa _syntheticTrips().

     FIX: _svcTrips() restituisce array di {sec, svcId, stops} invece
     di semplici numeri. _buildLeg() usa svcId/stops per filtrare
     le fermate intermedie dei treni Rapid e Commuter Rapid.

   FIX 2 (Rapid in fase 1):
     La fase 1 ora chiama _buildLegsAllSvcs() che costruisce un leg
     per ogni svcId distinto disponibile, invece di uno solo.
     Così W1 (Local), W3 (Rapid) e W4 (Commuter Rapid) appaiono
     come journey separati quando coprono il tratto richiesto.

   FIX 3 (Thru-service KW↔M8):
     I journey costruiti in fase 2b/3b dove il nodo di interscambio
     è M8xx ricevono il flag thruService: true. Il rendering in
     izx-ticket.html usa questo flag per mostrare il simbolo ↔
     e la nota «Thru service — stay on board» invece del normale
     pannello cambio.

   FIX 4 (_svcTrips NB direction):
     In _svcTrips() il blocco else (direzione NB, goingFwd=false)
     usava fullTravelSec calcolato in direzione SB. Con segSpeedKmh
     variabili per segmento _segSpeed() è asimmetrico, quindi i tempi
     in NB erano errati e identici per tutti i servizi, causando
     deduplicazione dei Rapid. Fix: fullTravelSecNB usa
     _travelSec(line, svcToIdx, svcFromIdx, fullKm).

   FIX 5 (dwell time in _buildLeg):
     alightSec ora include le soste nelle fermate intermedie effettive
     del servizio (stopCount * DWELL_SEC). Prima tutti i servizi
     (W1/W3/W4) restituivano lo stesso tempo di percorrenza perché
     _travelSec modella solo la velocità in marcia, ignorando le
     soste. Con la fix:
       Local  (~31 intermedie) → ~15 min extra su rotta completa
       Commuter Rapid          → proporzionale alle sue fermate
       Rapid  (~9 intermedie)  → ~5 min extra
     Le fermate intermedie usate per l'interpolazione degli orari
     nei leg circolari usano totalTravelSec (già comprensivo delle
     soste) per evitare doppio conteggio.

   FIX 6 (_buildIntraLineTransfers direzione NB):
     Due bug nella fase 1b (Rapid→Local intra-linea):
     a) xferCandidates era sempre slice(lo+1, hi) in ordine crescente;
        per viaggi NB (iFrom > iTo) l'array non veniva invertito,
        quindi si tentava prima la fermata più lontana da iTo.
        Fix: candidates.reverse() quando goingFwd=false.
     b) _getTrips(line, iXfer, iTo, ...) per il leg 2 passava iXfer e
        iTo nell'ordine corretto MA _svcTrips usa iFrom<=iTo per
        determinare goingFwd internamente — con iXfer > iTo in NB
        il viaggio veniva trattato come SB e nessun trip veniva
        trovato. Fix: _getTrips riceve ora gli indici as-is (iXfer,
        iTo) che preservano la direzione reale.

   FIX 7 (_buildIntraLineTransfers — filtro destinazione errato):
     Causa radice del mancato riconoscimento delle coincidenze
     Rapid→Local: _buildIntraLineTransfers chiamava
     _getTrips(line, iFrom, iTo) che internamente è _svcTrips con
     controllo stops[]: se iTo NON è una fermata Rapid (es. KW14
     Yassamo non è in W3.stops), il servizio viene scartato PRIMA
     che la fase 1b possa valutarlo — allTrips era sempre vuoto.
     Fix: nuova funzione _getExpressTrips(line, iFrom, depSec) che
     estrae tutti i trip con stops[] non vuoto (express) che coprono
     la zona di iFrom, senza vincolo sulla destinazione. La fase 1b
     usa questi trip per trovare la fermata di trasferimento, poi
     usa _getTrips(line, iXfer, iTo) correttamente per il Local.

   FIX 8 (same-platform intra-line walk time):
     I journey prodotti da _buildIntraLineTransfers (Rapid→Local
     sulla stessa linea KW) ricevono ora transferWalkMin: 0 invece
     di TRANSFER_MIN. Il cambio avviene sulla stessa banchina: non
     c'è spostamento fisico, solo attesa del treno successivo.
     Il renderer deve usare transferWalkMin (0) per il pannello Walk
     e transferWaitMin (calcolato dall'orario reale) per il pannello
     Wait. La costante interna INTRA_TRANSFER_SEC = 0 è usata
     esclusivamente in _buildIntraLineTransfers.

   Tempi di trasferimento:
     TRANSFER_MIN            3 min  — interscambio suburban ↔ suburban
     CROSS_TRANSFER_MIN     10 min  — interscambio suburbana ↔ IZX/AX/Metro
     THRU_TRANSFER_MIN       2 min  — thru-service KW↔Metro (solo cambio operatore)
     INTRA_TRANSFER_SEC      0 sec  — same-platform intra-line (Rapid→Local KW)
================================================================ */
'use strict';

const SuburbanRouter = (() => {

  const TRANSFER_MIN        = 3;
  const CROSS_TRANSFER_MIN  = 10;
  const THRU_TRANSFER_MIN   = 2;   // thru-service: cambio operatore senza scendere
  const TRANSFER_SEC        = TRANSFER_MIN       * 60;
  const CROSS_TRANSFER_SEC  = CROSS_TRANSFER_MIN * 60;
  const THRU_TRANSFER_SEC   = THRU_TRANSFER_MIN  * 60;
  const INTRA_TRANSFER_SEC  = 0;   // same-platform intra-line (Rapid→Local)
  const MAX_JOURNEYS  = 12;
  const SEARCH_WINDOW = 3 * 3600;
  const AVG_SPEED_KMH = 40;   // fallback globale per linee senza segSpeedKmh
  const DWELL_SEC     = 30;

  /* ----------------------------------------------------------------
   * _isMetroCode(code)
   * ---------------------------------------------------------------- */
  function _isMetroCode(code) {
    return /^M\d/.test(code);
  }

  /* ----------------------------------------------------------------
   * _isThruNode(subCode, metroCode)
   * ---------------------------------------------------------------- */
  const THRU_PAIRS = new Set(['KW00|M801', 'M801|KW00']);
  function _isThruNode(subCode, metroCode) {
    return THRU_PAIRS.has(`${subCode}|${metroCode}`);
  }

  /* ----------------------------------------------------------------
   * _segSpeed(line, iFrom, iTo)
   * ---------------------------------------------------------------- */
  function _segSpeed(line, iFrom, iTo) {
    const sts = line.stations;
    if (iFrom === iTo) return AVG_SPEED_KMH;
    const step = iFrom < iTo ? 1 : -1;
    let totalKm = 0, weightedSum = 0;
    for (let i = iFrom; i !== iTo; i += step) {
      const segIdx = Math.min(i, i + step);
      if (segIdx < 0 || segIdx >= sts.length - 1) continue;
      const km  = Math.abs(sts[segIdx + 1].km - sts[segIdx].km);
      const spd = sts[segIdx].segSpeedKmh ?? AVG_SPEED_KMH;
      totalKm      += km;
      weightedSum  += km * spd;
    }
    return totalKm > 0 ? weightedSum / totalKm : AVG_SPEED_KMH;
  }

  /* ----------------------------------------------------------------
   * _travelSec(line, iFrom, iTo, km)
   * ---------------------------------------------------------------- */
  function _travelSec(line, iFrom, iTo, km) {
    if (line.circular) return Math.round((km / AVG_SPEED_KMH) * 3600);
    const spd = _segSpeed(line, iFrom, iTo);
    return Math.round((km / spd) * 3600);
  }

  /* ----------------------------------------------------------------
   * _countIntermediateStops(line, iFrom, iTo, svcStops)
   * ---------------------------------------------------------------- */
  function _countIntermediateStops(line, iFrom, iTo, svcStops) {
    const a = Math.min(iFrom, iTo);
    const b = Math.max(iFrom, iTo);
    const sliced = line.stations.slice(a + 1, b);
    if (svcStops.length === 0) return sliced.length;
    return sliced.filter(st => svcStops.includes(st.code)).length;
  }

  /* ----------------------------------------------------------------
   * Code-set helpers
   * ---------------------------------------------------------------- */
  let _suburbanCodeSet = null;
  function _getSuburbanCodeSet() {
    if (_suburbanCodeSet) return _suburbanCodeSet;
    _suburbanCodeSet = new Set();
    for (const line of Object.values(SUBURBAN_LINES)) {
      for (const st of line.stations) _suburbanCodeSet.add(st.code);
    }
    return _suburbanCodeSet;
  }

  let _suburbanPartnerMap = null;
  function _getSuburbanPartnerMap() {
    if (_suburbanPartnerMap) return _suburbanPartnerMap;
    const subCodes = _getSuburbanCodeSet();
    const map = {};
    function _add(a, b) {
      if (!subCodes.has(a) || !subCodes.has(b)) return;
      if (a === b) return;
      if (!map[a]) map[a] = new Set();
      if (!map[b]) map[b] = new Set();
      map[a].add(b);
      map[b].add(a);
    }
    for (const [key, partners] of Object.entries(SUBURBAN_INTERCHANGE)) {
      for (const p of partners) _add(key, p);
    }
    _suburbanPartnerMap = {};
    for (const [k, v] of Object.entries(map)) _suburbanPartnerMap[k] = [...v];
    return _suburbanPartnerMap;
  }

  let _inverseMap = null;
  function _getInverseMap() {
    if (_inverseMap) return _inverseMap;
    _inverseMap = {};
    for (const [subCode, partners] of Object.entries(SUBURBAN_INTERCHANGE)) {
      for (const izxCode of partners) {
        if (!_inverseMap[izxCode]) _inverseMap[izxCode] = subCode;
      }
    }
    return _inverseMap;
  }

  function _resolveCode(code) {
    return _getInverseMap()[code] ?? code;
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

  function _idx(line, code) {
    return line.stations.findIndex(s => s.code === code);
  }

  function _kmBetween(line, iFrom, iTo) {
    const sts = line.stations;
    if (!line.circular) return Math.abs(sts[iTo].km - sts[iFrom].km);
    const total = line.totalKm;
    const cwKm  = ((sts[iTo].km - sts[iFrom].km) + total) % total;
    return Math.min(cwKm, total - cwKm);
  }

  function _circularDir(line, iFrom, iTo) {
    const sts   = line.stations;
    const total = line.totalKm;
    const cwKm  = ((sts[iTo].km - sts[iFrom].km) + total) % total;
    return cwKm <= total / 2 ? 'CW' : 'CCW';
  }

  function _circularIntermediateStops(line, iFrom, iTo, dir, boardSec, legKm, totalTravelSec) {
    const sts = line.stations;
    const n   = sts.length;
    const total = line.totalKm;
    const seq = [];
    if (dir === 'CW') {
      let i = (iFrom + 1) % n;
      while (i !== iTo) { seq.push(i); i = (i + 1) % n; }
    } else {
      let i = (iFrom - 1 + n) % n;
      while (i !== iTo) { seq.push(i); i = (i - 1 + n) % n; }
    }
    function _kmFromStart(idx) {
      if (dir === 'CW') return ((sts[idx].km - sts[iFrom].km) + total) % total;
      else              return ((sts[iFrom].km - sts[idx].km) + total) % total;
    }
    return seq.map(idx => {
      const kmElapsed = _kmFromStart(idx);
      const arrSec    = boardSec + Math.round((kmElapsed / legKm) * totalTravelSec);
      return { code: sts[idx].code, name: sts[idx].name,
               arr: _secToHM(arrSec), dep: _secToHM(arrSec + DWELL_SEC) };
    });
  }

  /* ----------------------------------------------------------------
   * _syntheticTrips(line, iFrom, depSec)
   * ---------------------------------------------------------------- */
  function _syntheticTrips(line, iFrom, depSec) {
    const PEAK_START  = 7 * 3600,  PEAK_END1  = 9  * 3600;
    const PEAK_START2 = 17 * 3600, PEAK_END2  = 20 * 3600;
    const isPeak = (depSec >= PEAK_START && depSec < PEAK_END1) ||
                   (depSec >= PEAK_START2 && depSec < PEAK_END2);
    const headwaySec = (isPeak ? line.headwayPeak : line.headwayOffPeak) * 60;
    const firstDep   = Math.ceil(depSec / headwaySec) * headwaySec;
    const trips = [];
    let t = firstDep;
    while (t <= depSec + SEARCH_WINDOW) {
      trips.push({ sec: t, svcId: line.id, svcDesc: line.name, stops: [] });
      t += headwaySec;
    }
    return trips;
  }

  /* ----------------------------------------------------------------
   * _svcTrips(services, line, iFrom, iTo, depSec)
   * Genera partenze usando un array *_SERVICES (SK o KW).
   * Se iTo === null salta il controllo sulla destinazione (usato da
   * _getExpressTrips per la fase 1b).
   * ---------------------------------------------------------------- */
  function _svcTrips(services, line, iFrom, iTo, depSec) {
    const stCodes  = line.stations.map(s => s.code);
    const skipDestCheck = iTo === null;
    const goingFwd = skipDestCheck ? true : (iFrom <= iTo);
    const loIdx    = skipDestCheck ? iFrom : Math.min(iFrom, iTo);
    const hiIdx    = skipDestCheck ? iFrom : Math.max(iFrom, iTo);
    const allTrips = [];

    for (const svc of services) {
      const svcFromIdx = stCodes.indexOf(svc.fromCode);
      const svcToIdx   = stCodes.indexOf(svc.toCode);
      if (svcFromIdx === -1 || svcToIdx === -1) continue;

      // Range check: il servizio deve coprire almeno iFrom.
      // Se skipDestCheck, basta che iFrom sia nel range del servizio.
      if (skipDestCheck) {
        if (iFrom < svcFromIdx || iFrom > svcToIdx) continue;
      } else {
        if (svcFromIdx > loIdx || svcToIdx < hiIdx) continue;
      }

      const svcStops = svc.stops ?? [];
      if (!skipDestCheck && svcStops.length > 0) {
        const fromCode = line.stations[iFrom].code;
        const toCode   = line.stations[iTo].code;
        if (!svcStops.includes(fromCode) || !svcStops.includes(toCode)) continue;
      }
      // Per skipDestCheck: non filtriamo per stops[] qui;
      // la fase 1b fa i propri controlli su fromCode.

      const headwaySec = svc.headway * 60;
      const windows = svc.peakWindows
        ? svc.peakWindows.map(w => ({ from: _hmToSec(w.from), to: _hmToSec(w.to) }))
        : [{ from: _hmToSec(svc.firstDep), to: _hmToSec(svc.lastDep) }];

      const fullKm = Math.abs(line.stations[svcToIdx].km - line.stations[svcFromIdx].km);
      const fullTravelSec   = _travelSec(line, svcFromIdx, svcToIdx, fullKm);
      const fullTravelSecNB = _travelSec(line, svcToIdx, svcFromIdx, fullKm);

      for (const win of windows) {
        if (goingFwd || skipDestCheck) {
          const kmToFrom  = Math.abs(line.stations[iFrom].km - line.stations[svcFromIdx].km);
          const offsetSec = _travelSec(line, svcFromIdx, iFrom, kmToFrom);
          let t = win.from + offsetSec;
          const lastAtFrom = win.to + offsetSec;
          if (t < depSec) t += Math.ceil((depSec - t) / headwaySec) * headwaySec;
          while (t <= Math.min(lastAtFrom, depSec + SEARCH_WINDOW)) {
            allTrips.push({ sec: t, svcId: svc.id, svcDesc: svc.desc, stops: svc.stops ?? [] });
            t += headwaySec;
          }
        } else {
          const firstDepB  = win.from + fullTravelSecNB;
          const lastDepB   = win.to   + fullTravelSecNB;
          const kmToFrom   = Math.abs(line.stations[iFrom].km - line.stations[svcToIdx].km);
          const offsetSec  = _travelSec(line, svcToIdx, iFrom, kmToFrom);
          let t = firstDepB + offsetSec;
          const lastAtFrom = lastDepB + offsetSec;
          if (t < depSec) t += Math.ceil((depSec - t) / headwaySec) * headwaySec;
          while (t <= Math.min(lastAtFrom, depSec + SEARCH_WINDOW)) {
            allTrips.push({ sec: t, svcId: svc.id, svcDesc: svc.desc, stops: svc.stops ?? [] });
            t += headwaySec;
          }
        }
      }
    }

    const seen = new Set();
    return allTrips
      .filter(t => { const k = `${t.sec}|${t.svcId}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.sec - b.sec);
  }

  /* ----------------------------------------------------------------
   * _getTrips(line, iFrom, iTo, depSec)
   * Dispatcher normale — iTo deve essere un indice valido.
   * ---------------------------------------------------------------- */
  function _getTrips(line, iFrom, iTo, depSec) {
    if (line.id === 'SK' && typeof SK_SERVICES !== 'undefined')
      return _svcTrips(SK_SERVICES, line, iFrom, iTo, depSec);
    if (line.id === 'KW' && typeof KW_SERVICES !== 'undefined')
      return _svcTrips(KW_SERVICES, line, iFrom, iTo, depSec);
    return _syntheticTrips(line, iFrom, depSec);
  }

  /* ----------------------------------------------------------------
   * _getExpressTrips(line, iFrom, depSec)                  FIX 7
   * Restituisce tutti i trip EXPRESS (stops[] non vuoto) che partono
   * da iFrom, senza vincolo sulla destinazione.
   * Usato da _buildIntraLineTransfers per trovare Rapid/CR che
   * servono iFrom indipendentemente dalla destinazione finale.
   * ---------------------------------------------------------------- */
  function _getExpressTrips(line, iFrom, depSec) {
    let raw = [];
    if (line.id === 'SK' && typeof SK_SERVICES !== 'undefined')
      raw = _svcTrips(SK_SERVICES, line, iFrom, null, depSec);
    else if (line.id === 'KW' && typeof KW_SERVICES !== 'undefined')
      raw = _svcTrips(KW_SERVICES, line, iFrom, null, depSec);
    // Per linee sintetiche non ci sono express distinti: restituisce []
    return raw.filter(t => t.stops && t.stops.length > 0);
  }

  /* ----------------------------------------------------------------
   * _buildLeg(line, iFrom, iTo, depSec, trip?)
   * ---------------------------------------------------------------- */
  function _buildLeg(line, iFrom, iTo, depSec, trip) {
    if (!trip) {
      const trips = _getTrips(line, iFrom, iTo, depSec);
      if (!trips.length) return null;
      trip = trips[0];
    }

    const boardSec  = trip.sec;
    const svcId     = trip.svcId;
    const svcDesc   = trip.svcDesc ?? line.name;
    const svcStops  = trip.stops ?? [];

    const km        = _kmBetween(line, iFrom, iTo);
    const runSec    = _travelSec(line, iFrom, iTo, km);

    const stopCount    = line.circular
      ? 0
      : _countIntermediateStops(line, iFrom, iTo, svcStops);
    const totalTravelSec = runSec + stopCount * DWELL_SEC;
    const alightSec      = boardSec + totalTravelSec;

    const dir = line.circular
      ? _circularDir(line, iFrom, iTo)
      : (iFrom < iTo ? 'SB' : 'NB');

    let intermediateStops;
    if (line.circular) {
      intermediateStops = _circularIntermediateStops(
        line, iFrom, iTo, dir, boardSec, km, totalTravelSec
      );
    } else {
      const a = Math.min(iFrom, iTo), b = Math.max(iFrom, iTo);
      const sliced  = line.stations.slice(a + 1, b);
      const ordered = iFrom < iTo ? sliced : [...sliced].reverse();

      intermediateStops = ordered
        .filter(st => svcStops.length === 0 || svcStops.includes(st.code))
        .map(st => {
          const stIdx      = line.stations.indexOf(st);
          const kmElapsed  = Math.abs(st.km - line.stations[iFrom].km);
          const partialRun = Math.round((kmElapsed / _segSpeed(line, iFrom, stIdx)) * 3600);
          const stopsBefore = line.stations
            .slice(Math.min(iFrom, stIdx) + 1, Math.max(iFrom, stIdx))
            .filter(s => svcStops.length === 0 || svcStops.includes(s.code))
            .length;
          const arrSec = boardSec + partialRun + stopsBefore * DWELL_SEC;
          return { code: st.code, name: st.name,
                   arr: _secToHM(arrSec), dep: _secToHM(arrSec + DWELL_SEC) };
        });
    }

    return {
      lineId: line.id,
      svcId,
      svcLogical: line.id,
      svcName:    line.name,
      svcDesc,
      color:     line.color,
      cls:       'suburban',
      direction: dir,
      trainNumber: null,
      boardCode:    line.stations[iFrom].code,
      boardName:    line.stations[iFrom].name,
      boardDep:     _secToHM(boardSec),
      boardDepSec:  boardSec,
      alightCode:   line.stations[iTo].code,
      alightName:   line.stations[iTo].name,
      alightArr:    _secToHM(alightSec),
      alightArrSec: alightSec,
      km, intermediateStops,
    };
  }

  /* ----------------------------------------------------------------
   * _buildLegsAllSvcs(line, iFrom, iTo, depSec)
   * ---------------------------------------------------------------- */
  function _buildLegsAllSvcs(line, iFrom, iTo, depSec) {
    const trips = _getTrips(line, iFrom, iTo, depSec);
    if (!trips.length) return [];
    const byId = new Map();
    for (const trip of trips) {
      if (!byId.has(trip.svcId)) byId.set(trip.svcId, trip);
    }
    const legs = [];
    for (const trip of byId.values()) {
      const leg = _buildLeg(line, iFrom, iTo, depSec, trip);
      if (leg) legs.push(leg);
    }
    return legs;
  }

  /* ----------------------------------------------------------------
   * _buildIntraLineTransfers(line, iFrom, iTo, depSec)   FIX 6+7+8
   * Fase 1b: Rapid→Local intra-linea.
   *
   * FIX 7: usa _getExpressTrips(line, iFrom) invece di
   * _getTrips(line, iFrom, iTo) così W3/W4 vengono trovati anche
   * quando iTo non è una loro fermata.
   * FIX 6: direzione NB corretta (candidates.reverse + iXfer/iTo as-is).
   * FIX 8: cambio same-platform → transferWalkMin: 0, nessuna attesa
   * fittizia aggiunta; transferWaitMin riflette l'orario reale.
   * ---------------------------------------------------------------- */
  function _buildIntraLineTransfers(line, iFrom, iTo, depSec) {
    const goingFwd = iFrom < iTo;
    const lo = Math.min(iFrom, iTo);
    const hi = Math.max(iFrom, iTo);
    const toCode   = line.stations[iTo].code;
    const fromCode = line.stations[iFrom].code;

    // FIX 7: trip express senza vincolo sulla destinazione
    const allExpressTrips = _getExpressTrips(line, iFrom, depSec);
    const results = [];

    for (const trip of allExpressTrips) {
      // Il servizio deve fermarsi a iFrom
      if (!trip.stops.includes(fromCode)) continue;
      // …e NON fermarsi a iTo (altrimenti sarebbe già in fase 1)
      if (trip.stops.includes(toCode)) continue;
      // Il servizio deve coprire almeno parte del range [lo, hi]
      const svcLastIdx = line.stations.findIndex(s => {
        const lastStop = trip.stops[trip.stops.length - 1];
        return s.code === lastStop;
      });
      if (svcLastIdx !== -1 && svcLastIdx < lo) continue; // treno già passato

      // Fermate del Rapid nel range tra iFrom e iTo
      const candidates = line.stations
        .slice(lo + 1, hi)
        .filter(st => trip.stops.includes(st.code));

      if (!candidates.length) continue;

      // FIX 6a: in NB tenta prima la fermata più vicina a iTo
      if (!goingFwd) candidates.reverse();

      for (const xferSt of candidates) {
        const iXfer = line.stations.indexOf(xferSt);

        // Leg 1: express da iFrom a iXfer
        const leg1 = _buildLeg(line, iFrom, iXfer, depSec, trip);
        if (!leg1) continue;

        // FIX 8: same-platform — nessun tempo a piedi aggiunto
        const transferReadySec = leg1.alightArrSec + INTRA_TRANSFER_SEC;

        // FIX 6b: iXfer/iTo as-is — _svcTrips calcola goingFwd internamente
        const localTrips = _getTrips(line, iXfer, iTo, transferReadySec)
          .filter(t => t.stops.length === 0 || t.stops.includes(toCode));
        if (!localTrips.length) continue;

        const leg2 = _buildLeg(line, iXfer, iTo, transferReadySec, localTrips[0]);
        if (!leg2) continue;

        const waitSec = leg2.boardDepSec - leg1.alightArrSec;
        results.push({
          legs: [leg1, leg2],
          departureTime:    leg1.boardDep,
          arrivalTime:      leg2.alightArr,
          totalMinutes:     Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
          totalKm:          leg1.km + leg2.km,
          transfers:        1,
          transferNodes:    [xferSt.code],
          transferWalkMin:  0,          // FIX 8: same-platform, zero a piedi
          transferWaitMin:  Math.round(waitSec / 60),
        });
      }
    }
    return results;
  }

  function _lineFilter(opts) {
    const raw = opts.lines;
    if (!raw || raw === 'ALL') return null;
    return new Set(Array.isArray(raw) ? raw : [raw]);
  }

  /* ================================================================
   * search(from, to, depTime, opts)
   * ================================================================ */
  function search(from, to, depTime, opts = {}) {
    const resolvedFrom = _resolveCode(from);
    const resolvedTo   = _resolveCode(to);
    const maxResults   = opts.maxResults ?? MAX_JOURNEYS;
    const directOnly   = !!opts.directOnly;
    const depSec       = _hmToSec(depTime);
    const lineAllowed  = _lineFilter(opts);
    const journeys     = [];

    /* ---- 1. Percorsi DIRETTI ---- */
    for (const line of Object.values(SUBURBAN_LINES)) {
      if (!line.stations.length) continue;
      if (lineAllowed && !lineAllowed.has(line.id)) continue;
      const iF = _idx(line, resolvedFrom);
      const iT = _idx(line, resolvedTo);
      if (iF === -1 || iT === -1 || iF === iT) continue;
      const trips = _getTrips(line, iF, iT, depSec);
      for (const trip of trips) {
        const leg = _buildLeg(line, iF, iT, depSec, trip);
        if (!leg) continue;
        journeys.push({
          legs: [leg], departureTime: leg.boardDep, arrivalTime: leg.alightArr,
          totalMinutes: Math.round((leg.alightArrSec - leg.boardDepSec) / 60),
          totalKm: leg.km, transfers: 0, transferNodes: [],
        });
      }
    }

    /* ---- 1b. Intra-line Rapid→Local (FIX 7) ---- */
    for (const line of Object.values(SUBURBAN_LINES)) {
      if (!line.stations.length) continue;
      if (lineAllowed && !lineAllowed.has(line.id)) continue;
      const iF = _idx(line, resolvedFrom);
      const iT = _idx(line, resolvedTo);
      if (iF === -1 || iT === -1 || iF === iT) continue;
      for (const j of _buildIntraLineTransfers(line, iF, iT, depSec)) {
        journeys.push(j);
      }
    }

    /* ---- 2. Percorsi Suburbano → IZX/AX ---- */
    if (!directOnly && typeof IZXRouter !== 'undefined') {
      for (const line of Object.values(SUBURBAN_LINES)) {
        if (!line.stations.length) continue;
        if (lineAllowed && !lineAllowed.has(line.id)) continue;
        const iF = _idx(line, resolvedFrom);
        if (iF === -1) continue;
        for (const subNode of line.stations) {
          const izxPartners = SUBURBAN_INTERCHANGE[subNode.code];
          if (!izxPartners) continue;
          const iMid = _idx(line, subNode.code);
          if (iMid === -1 || iMid === iF) continue;
          const leg1 = _buildLeg(line, iF, iMid, depSec);
          if (!leg1) continue;
          const transferReadySec = leg1.alightArrSec + CROSS_TRANSFER_SEC;
          for (const izxNode of izxPartners) {
            if (_isMetroCode(izxNode)) continue;
            for (const [lineId2, line2] of Object.entries(IZX_LINES)) {
              if (!line2.ST[izxNode] || !line2.ST[to]) continue;
              for (const svcId2 of Object.keys(line2.SVC)) {
                if (!line2.TT[svcId2]) continue;
                const leg2 = IZXRouter.buildLeg?.(lineId2, svcId2, izxNode, to, transferReadySec);
                if (!leg2) continue;
                const waitSec = leg2.boardDepSec - leg1.alightArrSec;
                const totalKm = (leg1.km != null && leg2.km != null) ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
                journeys.push({
                  legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
                  totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
                  totalKm, transfers: 1, transferNodes: [subNode.code],
                  transferWaitMin: Math.round(waitSec / 60),
                });
              }
            }
          }
        }
      }
    }

    /* ---- 2b. Percorsi Suburbano → Metro ---- */
    if (!directOnly && typeof MetroRouter !== 'undefined') {
      for (const line of Object.values(SUBURBAN_LINES)) {
        if (!line.stations.length) continue;
        if (lineAllowed && !lineAllowed.has(line.id)) continue;
        const iF = _idx(line, resolvedFrom);
        if (iF === -1) continue;
        for (const subNode of line.stations) {
          const partners = SUBURBAN_INTERCHANGE[subNode.code];
          if (!partners) continue;
          const metroPartners = partners.filter(_isMetroCode);
          if (!metroPartners.length) continue;
          const iMid = _idx(line, subNode.code);
          if (iMid === -1 || iMid === iF) continue;
          const leg1 = _buildLeg(line, iF, iMid, depSec);
          if (!leg1) continue;
          for (const metroNode of metroPartners) {
            const isThru = _isThruNode(subNode.code, metroNode);
            const xferSec = isThru ? THRU_TRANSFER_SEC : CROSS_TRANSFER_SEC;
            const transferReadySec = leg1.alightArrSec + xferSec;
            const _mResult2 = MetroRouter.buildMultiLeg?.(metroNode, to, transferReadySec);
if (!_mResult2) continue;
const leg2 = _mResult2.legs.at(-1); // ultimo leg metro verso la destinazione
// NB: se _mResult2.legs.length > 1 il rendering mostrerà solo il leg KW,
// i leg metro interni vanno aggiunti al journey se vuoi mostrarli separatamente.
            if (!leg2) continue;
            const waitSec = leg2.boardDepSec - leg1.alightArrSec;
            const totalKm = (leg1.km != null && leg2.km != null) ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
            journeys.push({
              legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
              totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
              totalKm, transfers: 1, transferNodes: [metroNode],
              transferWaitMin: Math.round(waitSec / 60),
              thruService: isThru,
              thruNode: isThru ? subNode.code : undefined,
            });
          }
        }
      }
    }

    /* ---- 3. Percorsi IZX/AX → Suburbano ---- */
    if (!directOnly && typeof IZXRouter !== 'undefined') {
      for (const line of Object.values(SUBURBAN_LINES)) {
        if (!line.stations.length) continue;
        if (lineAllowed && !lineAllowed.has(line.id)) continue;
        const iT = _idx(line, resolvedTo);
        if (iT === -1) continue;
        for (const subNode of line.stations) {
          const izxPartners = SUBURBAN_INTERCHANGE[subNode.code];
          if (!izxPartners) continue;
          const iMid = _idx(line, subNode.code);
          if (iMid === -1 || iMid === iT) continue;
          for (const izxNode of izxPartners) {
            if (_isMetroCode(izxNode)) continue;
            for (const [lineId1, line1] of Object.entries(IZX_LINES)) {
              if (!line1.ST[from] || !line1.ST[izxNode]) continue;
              for (const svcId1 of Object.keys(line1.SVC)) {
                if (!line1.TT[svcId1]) continue;
                const leg1 = IZXRouter.buildLeg?.(lineId1, svcId1, from, izxNode, depSec);
                if (!leg1) continue;
                const transferReadySec = leg1.alightArrSec + CROSS_TRANSFER_SEC;
                const leg2 = _buildLeg(line, iMid, iT, transferReadySec);
                if (!leg2) continue;
                const waitSec = leg2.boardDepSec - leg1.alightArrSec;
                const totalKm = (leg1.km != null && leg2.km != null) ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
                journeys.push({
                  legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
                  totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
                  totalKm, transfers: 1, transferNodes: [izxNode],
                  transferWaitMin: Math.round(waitSec / 60),
                });
              }
            }
          }
        }
      }
    }

    /* ---- 3b. Percorsi Metro → Suburbano ---- */
    if (!directOnly && typeof MetroRouter !== 'undefined') {
      for (const line of Object.values(SUBURBAN_LINES)) {
        if (!line.stations.length) continue;
        if (lineAllowed && !lineAllowed.has(line.id)) continue;
        const iT = _idx(line, resolvedTo);
        if (iT === -1) continue;
        for (const subNode of line.stations) {
          const partners = SUBURBAN_INTERCHANGE[subNode.code];
          if (!partners) continue;
          const metroPartners = partners.filter(_isMetroCode);
          if (!metroPartners.length) continue;
          const iMid = _idx(line, subNode.code);
          if (iMid === -1 || iMid === iT) continue;
          for (const metroNode of metroPartners) {
           const _mResult1 = MetroRouter.buildMultiLeg?.(from, metroNode, depSec);
if (!_mResult1) continue;
const leg1 = _mResult1.legs.at(-1);
            if (!leg1) continue;
            const isThru = _isThruNode(subNode.code, metroNode);
            const xferSec = isThru ? THRU_TRANSFER_SEC : CROSS_TRANSFER_SEC;
            const transferReadySec = leg1.alightArrSec + xferSec;
            const leg2 = _buildLeg(line, iMid, iT, transferReadySec);
            if (!leg2) continue;
            const waitSec = leg2.boardDepSec - leg1.alightArrSec;
            const totalKm = (leg1.km != null && leg2.km != null) ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
            journeys.push({
              legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
              totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
              totalKm, transfers: 1, transferNodes: [metroNode],
              transferWaitMin: Math.round(waitSec / 60),
              thruService: isThru,
              thruNode: isThru ? subNode.code : undefined,
            });
          }
        }
      }
    }

    /* ---- 4. Percorsi Suburbano → Suburbano (cross-line) ---- */
    if (!directOnly) {
      const subMap = _getSuburbanPartnerMap();
      for (const line1 of Object.values(SUBURBAN_LINES)) {
        if (!line1.stations.length) continue;
        if (lineAllowed && !lineAllowed.has(line1.id)) continue;
        const iF = _idx(line1, resolvedFrom);
        if (iF === -1) continue;

        for (const subNode of line1.stations) {
          const partners = subMap[subNode.code];
          if (!partners?.length) continue;
          const iMid = _idx(line1, subNode.code);
          if (iMid === -1 || iMid === iF) continue;

          const leg1 = _buildLeg(line1, iF, iMid, depSec);
          if (!leg1) continue;
          const transferReadySec = leg1.alightArrSec + TRANSFER_SEC;

          for (const partnerCode of partners) {
            for (const line2 of Object.values(SUBURBAN_LINES)) {
              if (!line2.stations.length) continue;
              if (line2.id === line1.id) continue;
              if (lineAllowed && !lineAllowed.has(line2.id)) continue;
              const iMid2 = _idx(line2, partnerCode);
              const iT    = _idx(line2, resolvedTo);
              if (iMid2 === -1 || iT === -1 || iMid2 === iT) continue;
              const leg2 = _buildLeg(line2, iMid2, iT, transferReadySec);
              if (!leg2) continue;
              const waitSec = leg2.boardDepSec - leg1.alightArrSec;
              const totalKm = (leg1.km != null && leg2.km != null)
                ? leg1.km + leg2.km : (leg1.km ?? leg2.km ?? null);
              journeys.push({
                legs: [leg1, leg2], departureTime: leg1.boardDep, arrivalTime: leg2.alightArr,
                totalMinutes: Math.round((leg2.alightArrSec - leg1.boardDepSec) / 60),
                totalKm, transfers: 1, transferNodes: [subNode.code],
                transferWaitMin: Math.round(waitSec / 60),
              });
            }
          }
        }
      }
    }

    /* ---- deduplicazione e ordinamento ---- */
    const seen = new Set();
    const unique = journeys.filter(j => {
      const key = j.legs.map(l => `${l.lineId}:${l.svcId}:${l.boardDep}:${l.alightArr}`).join('|');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    unique.sort((a, b) => {
      const da = _hmToSec(a.arrivalTime), db = _hmToSec(b.arrivalTime);
      if (da !== db) return da - db;
      return a.transfers - b.transfers;
    });
    return unique.slice(0, maxResults);
  }

  /* ================================================================
   * stationName / allStations / lineColor
   * ================================================================ */
  function stationName(code) {
    const resolved = _resolveCode(code);
    for (const line of Object.values(SUBURBAN_LINES)) {
      const st = line.stations.find(s => s.code === resolved);
      if (st) return st.name;
    }
    return code;
  }

  function allStations() {
    const seen = new Set(), out = [];
    for (const line of Object.values(SUBURBAN_LINES)) {
      for (const st of line.stations) {
        if (seen.has(st.code)) continue;
        seen.add(st.code);
        out.push({ ...st, lineId: line.id });
      }
    }
    return out;
  }

  function lineColor(lineId) {
    return SUBURBAN_LINES[lineId]?.color ?? '#888';
  }

  return { search, stationName, allStations, lineColor, TRANSFER_MIN, CROSS_TRANSFER_MIN, THRU_TRANSFER_MIN };

})();

/* TT-ENGINE — universal IZX timetable engine.
   RY: run-times computed from RY_SEGMENTS + RY_DWELL via RunTimeEngine.
   Other lines: legacy TT offsets (to be migrated later). */
'use strict';

const TTEngine = (() => {
  function hmToSec(hm) {
    const [h, m] = hm.split(':').map(Number);
    return h * 3600 + m * 60;
  }
  function secToHM(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '00');
  }
  function isPeak(sec, peakWindows) {
    return peakWindows.some(w => sec >= hmToSec(w.start) && sec < hmToSec(w.end));
  }

  function trainNumber(lineId, svcId, direction, tripIndex) {
    const cfg = typeof TRAIN_NUM_CONFIG !== 'undefined' ? TRAIN_NUM_CONFIG : null;
    if (!cfg || !cfg[lineId]) return null;
    const { lineDigit, svcBase } = cfg[lineId];
    const base = svcBase[svcId] ?? 0;
    const seq = direction === 'NB' ? tripIndex * 2 + 1 : tripIndex * 2 + 2;
    return String(lineDigit * 10000 + base * 100 + seq).padStart(5, '0');
  }

  function stopIsActive(code, conditionalStops, tripIndex, peakNow, routeType) {
    if (!conditionalStops?.[code]) return true;
    const rule = conditionalStops[code].rule;
    if (rule === 'peak') return peakNow;
    if (rule === 'alternate') return (tripIndex + (conditionalStops[code].phase ?? 0)) % 2 === 0;
    if (rule === 'always') return true;
    if (rule === 'direct') return routeType !== 'punohai';
    if (rule === 'punohai') return routeType === 'punohai';
    return true;
  }

  const TRANSIT_STATIONS = new Set(['DI13']);
  function legacyDwellSec(code) {
    return TRANSIT_STATIONS.has(code) ? 0 : 60;
  }

  function buildRyOffsets(svc, dir) {
  const segMap = {};
  const segKm = {};
  for (const s of RY_SEGMENTS) {
    segMap[`${s.from}>${s.to}`] = s.vLimit;
    segKm[`${s.from}>${s.to}`] = s.km;
  }

  const stopsRaw = svc.stops.filter(code =>
    code.startsWith('R') || code.startsWith('SA') || code.startsWith('SK')
  );
    const stops = dir === 'NB' ? [...stopsRaw].reverse() : stopsRaw;

    const offsets = {};
    offsets[stops[0]] = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1];
      const key = `${a}>${b}`;
      const revKey = `${b}>${a}`;
      const vLimit = segMap[key] ?? segMap[revKey];
      if (vLimit == null) continue;
      const km = segKm[key] ?? segKm[revKey];
      const runSec = RunTimeEngine.segmentRunSec(km, vLimit);
      const dwell = RunTimeEngine.dwellSec(b, RY_DWELL);
      offsets[b] = offsets[a] + runSec + dwell;
    }
    return { stops, offsets };
  }

  function generateTripsForService(lineId, svcId, dir, fromSec, toSec) {
    const line = IZX_LINES[lineId];
    const svc = line.SVC[svcId];
    const freq = line.FREQ[svcId];
    const peaks = line.PEAK;
    const offset = (line.OFFSETS?.[svcId] ?? 0) * 60;

    let stops, tt;
    if (lineId === 'RY') {
      const built = buildRyOffsets(svc, dir);
      stops = built.stops;
      tt = built.offsets;
    } else {
      const raw = line.TT[svcId];
      const stopsRaw = svc.stops.filter(s => raw[s] !== undefined);
      stops = dir === 'NB' ? [...stopsRaw].reverse() : stopsRaw;
      tt = raw;
    }

    if (stops.length < 2) return [];

    const totalDuration = tt[stops[stops.length - 1]];
    const splits = dir === 'SB' ? (line.TERMINUS_SPLIT?.[svcId] ?? null) : null;
    const nbTerminus = dir === 'NB' ? stops[0] : null;

    const SERVICE_START = hmToSec('06:00');
    const SERVICE_END = hmToSec('24:30');

    const trips = [];
    let cursor = SERVICE_START + offset;

    while (cursor <= SERVICE_END) {
      const tripIndex = trips.length;
      const peakNow = isPeak(cursor, peaks);
      const freq_ph = peakNow ? freq.peak : freq.offpeak;
      const interval = Math.round(3600 / freq_ph);

      const hasPunohaiRule = Object.values(svc.conditionalStops || {}).some(
        r => r.rule === 'punohai' || r.rule === 'direct'
      );
      const routeType = hasPunohaiRule
        ? (tripIndex % 2 === 0 ? 'direct' : 'punohai')
        : null;

      let terminus = stops[stops.length - 1];
      if (nbTerminus) terminus = nbTerminus;
      else if (splits && splits.length > 0) {
        const totalWeight = splits.reduce((a, b) => a + b.weight, 0);
        let acc = 0;
        const slot = tripIndex % totalWeight;
        for (const sp of splits) {
          acc += sp.weight;
          if (slot < acc) { terminus = sp.terminus; break; }
        }
      }

      const swRules = line.SHORT_WORKING ?? [];
      for (const sw of swRules) {
        const dirMatch = sw.dir === 'BOTH' || sw.dir === dir;
        if (dirMatch && sw.svcId === svcId && cursor >= hmToSec(sw.cutoff)) {
          if (tt[sw.terminus] !== undefined) terminus = sw.terminus;
          break;
        }
      }

      const tripStops = {};
      const conditionalStops = svc.conditionalStops || null;

      for (const st of stops) {
        if (!stopIsActive(st, conditionalStops, tripIndex, peakNow, routeType)) continue;
        const rawOffset = dir === 'NB' ? (totalDuration - tt[st]) : tt[st];
        if (rawOffset === undefined) continue;
        const depSec = cursor + rawOffset;
        const dwell = lineId === 'RY'
          ? RunTimeEngine.dwellSec(st, RY_DWELL)
          : legacyDwellSec(st);
        const arrSec = depSec - dwell;
        tripStops[st] = {
          arr: secToHM(arrSec < cursor ? depSec : arrSec),
          dep: secToHM(depSec),
          transit: dwell === 0,
        };
        if (st === terminus) break;
      }

      const depTimes = Object.values(tripStops).map(t => hmToSec(t.dep));
      if (depTimes.length > 0) {
        const minDep = Math.min(...depTimes);
        const maxDep = Math.max(...depTimes);
        if (maxDep >= fromSec && minDep <= toSec) {
          trips.push({
            _uid: `${lineId}:${svcId}:${dir}:${cursor}`,
            lineId, svcId,
            name: svc.name, color: svc.color, cls: svc.cls,
            direction: dir,
            origin: stops[0],
            terminus,
            routeType,
            trainNumber: trainNumber(lineId, svcId, dir, tripIndex),
            stops: tripStops,
          });
        }
      }
      cursor += interval;
    }
    return trips;
  }

  function groupPairs(trips) {
    const out = [];
    const used = new Set();
    for (const trip of trips) {
      if (used.has(trip._uid)) continue;
      const svc = IZX_LINES[trip.lineId]?.SVC?.[trip.svcId];
      const pairSvcId = svc?.pair;
      if (pairSvcId) {
        const depKey = t => Object.values(t.stops)[0].dep;
        const twin = trips.find(t =>
          !used.has(t._uid) &&
          t.lineId === trip.lineId &&
          t.svcId === pairSvcId &&
          t.direction === trip.direction &&
          depKey(t) === depKey(trip)
        );
        if (twin) {
          out.push({ ...trip, _paired: true, _twin: twin,
            terminusDisplay: `${trip.terminus} / ${twin.terminus}`,
            nameDisplay: `${trip.svcId}+${twin.svcId}` });
          used.add(trip._uid); used.add(twin._uid);
          continue;
        }
      }
      out.push(trip); used.add(trip._uid);
    }
    return out;
  }

  function query(opts = {}) {
    const { lines = 'ALL', station = null, direction = '',
            fromTime = '06:00', toTime = '23:30', services = null } = opts;
    const fromSec = hmToSec(fromTime);
    const toSec = hmToSec(toTime);

    let lineIds;
    if (lines === 'ALL') lineIds = Object.keys(IZX_LINES);
    else if (Array.isArray(lines)) lineIds = lines;
    else lineIds = [lines];

    const dirs = direction ? [direction] : ['SB', 'NB'];
    const results = [];

    for (const lineId of lineIds) {
      const line = IZX_LINES[lineId];
      if (!line) continue;
      const svcIds = services
        ? Object.keys(line.SVC).filter(s => services.includes(s))
        : Object.keys(line.SVC);
      for (const svcId of svcIds) {
        if (lineId !== 'RY' && !line.TT[svcId]) continue;
        for (const dir of dirs) {
          const trips = generateTripsForService(lineId, svcId, dir, fromSec, toSec);
          const filtered = station ? trips.filter(t => t.stops[station] !== undefined) : trips;
          results.push(...filtered);
        }
      }
    }

    results.sort((a, b) => {
      const getKey = t => station && t.stops[station]
        ? hmToSec(t.stops[station].dep)
        : hmToSec(Object.values(t.stops)[0].dep);
      return getKey(a) - getKey(b);
    });
    return groupPairs(results);
  }

  function allStations() {
    const seen = new Set();
    const out = [];
    for (const [lineId, line] of Object.entries(IZX_LINES)) {
      const canonList = Array.isArray(line.CANONICAL)
        ? line.CANONICAL
        : [...new Set(Object.values(line.CANONICAL).flat())];
      for (const code of canonList) {
        const key = `${lineId}:${code}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const st = line.ST[code];
        if (!st) continue;
        out.push({ lineId, code, name: st.n, kanji: st.k, branch: st.b });
      }
    }
    return out;
  }

  return { query, allStations, hmToSec, secToHM };
})();

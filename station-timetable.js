/* station-timetable.js — Station / Line inspector · daily timetable panel
   Adds a "Timetable" button to the inspector search bar.
   The panel is built only when opened; it reads services registered in
   SuburbanRouter and computes station departure times from each line's
   kinematic profile. No existing timetable data is modified. */
(function () {
  'use strict';
  if (window.__IZX_STATION_TIMETABLE__) return;
  window.__IZX_STATION_TIMETABLE__ = true;

  const pad2 = (n) => String(n).padStart(2, '0');
  const hm = (min) => {
    const v = ((min % 1440) + 1440) % 1440;
    return pad2(Math.floor(v / 60)) + ':' + pad2(v % 60);
  };
  const toMin = (s) => {
    const [h, m] = String(s).split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  /* Find registered SuburbanRouter line entries without assuming a
     particular internal property name. */
  function registryEntries() {
    const R = window.SuburbanRouter;
    if (!R || typeof R !== 'object') return [];
    const out = new Map();
    const seen = new Set();
    const add = (e) => {
      if (e && e.lineId && Array.isArray(e.services) && Array.isArray(e.stations)) {
        out.set(e.lineId, e);
      }
    };
    const scan = (v, depth) => {
      if (!v || typeof v !== 'object' || depth > 3 || seen.has(v)) return;
      seen.add(v);
      if (Array.isArray(v)) {
        v.forEach((x) => scan(x, depth + 1));
        return;
      }
      if (Array.isArray(v.services) && Array.isArray(v.stations)) {
        add(v);
        return;
      }
      for (const x of Object.values(v)) scan(x, depth + 1);
    };
    for (const key of ['lines', 'registry', 'registered', '_lines', '_registry']) {
      scan(R[key], 0);
    }
    scan(R, 0);
    return [...out.values()];
  }

  function stationIndex(entry) {
    const idx = new Map();
    entry.stations.forEach((s, i) => idx.set(s.code, i));
    return idx;
  }

  function servedSeq(entry, svc) {
    const sts = entry.stations;
    const iF = sts.findIndex((s) => s.code === svc.fromCode);
    const iT = sts.findIndex((s) => s.code === svc.toCode);
    if (iF < 0 || iT < 0) return [];
    const step = iF <= iT ? 1 : -1;
    const seq = [];
    for (let i = iF; i !== iT + step; i += step) seq.push(sts[i].code);
    return (Array.isArray(svc.stops) && svc.stops.length)
      ? seq.filter((c) => svc.stops.includes(c))
      : seq;
  }

  function segMinutes(entry, seq, a, b) {
    const idx = stationIndex(entry);
    const iA = idx.get(a), iB = idx.get(b);
    if (iA == null || iB == null || iA === iB) return 0;
    const lo = Math.min(iA, iB), hi = Math.max(iA, iB);
    const slice = iA <= iB
      ? entry.stations.slice(lo, hi + 1)
      : entry.stations.slice(lo, hi + 1).reverse();

    const acc = ((entry.accelKmhPerSec ?? 2.5)) / 3.6;
    const dec = ((entry.decelKmhPerSec ?? 3.0)) / 3.6;
    let run = 0, dwell = 0;

    for (let n = 1; n < slice.length; n++) {
      const from = slice[n - 1], to = slice[n];
      const len = Math.abs((to.km ?? 0) - (from.km ?? 0)) * 1000;
      let cap = entry.vMaxKmh ?? 140;
      const lo2 = Math.min(idx.get(from.code), idx.get(to.code));
      const hi2 = Math.max(idx.get(from.code), idx.get(to.code));
      for (let k = lo2; k < hi2; k++) {
        cap = Math.min(cap, entry.stations[k].vLimitKmh ?? cap);
      }
      const v = Math.min(cap / 3.6, Math.sqrt(2 * len * acc * dec / (acc + dec)));
      if (len > 0) {
        run += v / acc + v / dec
          + Math.max(0, len - v * v / (2 * acc) - v * v / (2 * dec)) / v;
      }
      if (n < slice.length - 1) {
        dwell += to.dwellSec ?? entry.dwellSec ?? 20;
      }
    }
    return Math.ceil((Math.round(run) + dwell) / 60);
  }

  function serviceDepartures(entry, svc, stationCode) {
    const seq = servedSeq(entry, svc);
    const pos = seq.indexOf(stationCode);
    if (pos < 0 || !svc.firstDep || !svc.lastDep) return [];

    const offset = segMinutes(entry, seq, seq[0], stationCode);
    const firstAtStation = toMin(svc.firstDep) + offset;
    const lastAtStation = toMin(svc.lastDep) + offset;
    const headway = svc.headway || 30;
    const out = [];

    const originInWindow = (originDep) => {
      if (!Array.isArray(svc.peakWindows) || !svc.peakWindows.length) return true;
      return svc.peakWindows.some((w) =>
        originDep >= toMin(w.from) && originDep <= toMin(w.to));
    };

    for (let t = firstAtStation; t <= lastAtStation; t += headway) {
      const originDep = t - offset;
      if (!originInWindow(originDep)) continue;
      out.push({
        dep: t,
        svcId: svc.id || '(service)',
        svcDesc: svc.desc || svc.name || '',
        destCode: seq[seq.length - 1],
        dir: pos === 0 ? 'SB' : (pos === seq.length - 1 ? 'NB' : ''),
      });
    }
    return out;
  }

  function currentStationCode() {
    const results = document.getElementById('results');
    if (results) {
      const el = results.querySelector('.station-code');
      if (el) {
        const m = /\b([A-Z]{1,5}\d{1,4})\b/.exec(el.textContent || '');
        if (m) return m[1];
      }
    }
    const q = document.getElementById('query');
    const raw = q ? q.value.trim().toUpperCase() : '';
    const m = /\b([A-Z]{1,5}\d{1,4})\b/.exec(raw);
    return m ? m[1] : null;
  }

  function stationName(entries, code) {
    for (const e of entries) {
      const st = e.stations.find((s) => s.code === code);
      if (st) return st.name || code;
    }
    return code;
  }

  function ensurePanel() {
    let panel = document.getElementById('timetable-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'timetable-panel';
      panel.style.cssText = 'margin:24px 0;padding:16px;background:#161616;' +
        'border:1px solid #2a2a2a;border-radius:6px;display:none;';
      const results = document.getElementById('results');
      if (results && results.parentNode) {
        results.parentNode.insertBefore(panel, results.nextSibling);
      } else {
        document.body.appendChild(panel);
      }
    }
    return panel;
  }

  function renderTimetable() {
    const panel = ensurePanel();
    const entries = registryEntries();
    const code = currentStationCode();

    if (!code) {
      panel.innerHTML = '<div style="color:#f44336">Inspect a station first.</div>';
      panel.style.display = 'block';
      return;
    }

    const serving = entries.filter((e) =>
      e.stations.some((s) => s.code === code));

    if (!serving.length) {
      panel.innerHTML = '<div style="color:#ff9800">No SuburbanRouter timetable data for ' +
        code + '.</div>';
      panel.style.display = 'block';
      return;
    }

    const selected = panel.dataset.lineId &&
      serving.some((e) => e.lineId === panel.dataset.lineId)
      ? panel.dataset.lineId
      : serving[0].lineId;

    const entry = serving.find((e) => e.lineId === selected);
    const rows = [];
    for (const svc of entry.services || []) {
      rows.push(...serviceDepartures(entry, svc, code));
    }
    rows.sort((a, b) => a.dep - b.dep);

    const byHour = new Map();
    for (const r of rows) {
      const hour = Math.floor(r.dep / 60);
      if (!byHour.has(hour)) byHour.set(hour, []);
      byHour.get(hour).push(r);
    }

    const station = stationName(serving, code);
    const destName = (c) => stationName(serving, c);

    let html = '
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:14px">
        <strong style="color:#fff">' + station + ' · ' + code + '</strong>
        <select id="timetable-line" style="background:#222;border:1px solid #444;color:#eee;
          padding:6px 10px;border-radius:4px;font-family:monospace">
          ' + serving.map((e) => '
            <option value="' + e.lineId + '"' + (e.lineId === selected ? ' selected' : '') + '>
              ' + e.lineId + ' — ' + (e.meta?.name || e.lineId) + '
            </option>').join('') + '
        </select>
        <span style="color:#666;font-size:0.8rem">' + rows.length + ' departures</span>
      </div>';

    if (!rows.length) {
      html += '<div style="color:#ff9800">No departures found for this station and line.</div>';
    } else {
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px">';
      for (const [hour, list] of [...byHour.entries()].sort((a, b) => a[0] - b[0])) {
        html += '
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:10px">
            <div style="color:#888;font-size:0.75rem;letter-spacing:0.08em;margin-bottom:8px">' +
              pad2(hour % 24) + ':00–' + pad2((hour + 1) % 24) + ':00</div>';
        for (const r of list) {
          html += '
            <div style="display:flex;gap:8px;align-items:baseline;padding:3px 0;font-size:0.85rem">
              <span style="color:#fff;min-width:44px">' + hm(r.dep) + '</span>
              <span style="color:#4fc3f7;min-width:64px">' + r.svcId + '</span>
              <span style="color:#aaa">→ ' + destName(r.destCode) + '</span>
            </div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    panel.innerHTML = html;
    panel.style.display = 'block';

    const sel = panel.querySelector('#timetable-line');
    if (sel) {
      sel.addEventListener('change', () => {
        panel.dataset.lineId = sel.value;
        renderTimetable();
      });
    }
  }

  function init() {
    const bar = document.getElementById('search-bar');
    if (!bar || bar.querySelector('#timetable-button')) return;

    const btn = document.createElement('button');
    btn.id = 'timetable-button';
    btn.textContent = 'Timetable';
    btn.addEventListener('click', renderTimetable);
    bar.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* station-timetable.js — Station / Line inspector · daily timetable panel
   Adds a "Timetable" button to the inspector search bar.
   Shows all departures from all interchange-connected lines in
   chronological order, with multi-select relation filters.
   Station codes are expanded through SUBURBAN_INTERCHANGE and
   METRO_INTERCHANGE_MAP, so one physical station can aggregate
   codes such as CO01 · KD32 · LL01. */
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

  const lineFilter = new Map();

  function syntheticService(line) {
    const sts = line.stations || [];
    if (sts.length < 2) return null;
    return {
      id: line.id,
      desc: line.name || line.id,
      fromCode: sts[0].code,
      toCode: sts[sts.length - 1].code,
      firstDep: '05:00',
      lastDep: '23:00',
      headway: line.headwayOffPeak || 30,
      stops: [],
    };
  }

  function serviceArrayFor(lineId) {
    const map = {
      SK: 'SK_SERVICES',
      KW: 'KW_SERVICES',
      TS: 'TS_SERVICES',
      KS: 'KS_SERVICES',
    };
    const name = map[lineId];
    if (!name) return null;
    try {
      const v = eval(name);
      return Array.isArray(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  function buildEntries() {
    const out = new Map();
    const add = (lineId, meta, stations, services) => {
      if (!lineId || !Array.isArray(stations) || !Array.isArray(services) || !services.length) return;
      out.set(lineId, { lineId, meta, stations, services });
    };

    if (typeof SUBURBAN_LINES !== 'undefined') {
      for (const line of Object.values(SUBURBAN_LINES)) {
        const services = serviceArrayFor(line.id)
          || (Array.isArray(line.services) && line.services.length ? line.services : null)
          || [syntheticService(line)].filter(Boolean);
        add(line.id, { name: line.name, color: line.color }, line.stations, services);
      }
    }

    if (typeof IBC_LINES !== 'undefined' && IBC_LINES.IBC
      && typeof IBC_TT_SERVICES !== 'undefined') {
      add('IBC', { name: 'Ibaches Main Line', color: '#FF9999' },
        IBC_LINES.IBC.stations, IBC_TT_SERVICES);
    }

    const otherSources = [
      ['HD_LINES', 'HD'], ['WI_LINES', 'WI'],
      ['SHX_LINES', 'SHX'], ['SSK_LINES', 'SSK'],
    ];
    for (const [name, fallbackId] of otherSources) {
      const lines = (typeof window !== 'undefined' && window[name])
        || (typeof eval !== 'undefined' && (() => { try { return eval(name); } catch (e) { return null; } })());
      if (!lines) continue;
      for (const line of Object.values(lines)) {
        if (!Array.isArray(line.services) || !line.services.length) continue;
        add(line.id || fallbackId, { name: line.name, color: line.color },
          line.stations, line.services);
      }
    }

    return [...out.values()];
  }

  /* Expand a station code to every interchange-connected code,
   * in both directions, using the same link data as the router. */
  function equivalentCodes(code) {
    const out = new Set([code]);
    const add = (c) => { if (c && typeof c === 'string') out.add(c); };

    if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
      const partners = SUBURBAN_INTERCHANGE[code];
      if (Array.isArray(partners)) {
        for (const p of partners) add((p && typeof p === 'object') ? p.code : p);
      }
      for (const [key, list] of Object.entries(SUBURBAN_INTERCHANGE)) {
        if (!Array.isArray(list)) continue;
        for (const p of list) {
          const c = (p && typeof p === 'object') ? p.code : p;
          if (c === code) add(key);
        }
      }
    }

    if (typeof METRO_INTERCHANGE_MAP !== 'undefined') {
      for (const map of Object.values(METRO_INTERCHANGE_MAP)) {
        for (const [from, entries] of Object.entries(map)) {
          const list = Array.isArray(entries) ? entries : [entries];
          for (const e of list) {
            const to = (e && typeof e === 'object') ? e.code : e;
            if (from === code) add(to);
            if (to === code) add(from);
          }
        }
      }
    }

    return out;
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

    const acc = (entry.accelKmhPerSec ?? 2.5) / 3.6;
    const dec = (entry.decelKmhPerSec ?? 3.0) / 3.6;
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

  function serviceWindows(svc) {
    if (Array.isArray(svc.peakWindows) && svc.peakWindows.length) {
      return svc.peakWindows;
    }
    if (svc.firstDep && svc.lastDep) {
      return [{ from: svc.firstDep, to: svc.lastDep }];
    }
    return [];
  }

  function serviceDepartures(entry, svc, stationCode) {
    const seq = servedSeq(entry, svc);
    const pos = seq.indexOf(stationCode);
    if (pos < 0) return [];

    const offset = segMinutes(entry, seq, seq[0], stationCode);
    const headway = svc.headway || 30;
    const out = [];

    for (const win of serviceWindows(svc)) {
      const start = toMin(win.from);
      const end = toMin(win.to);
      for (let originDep = start; originDep <= end; originDep += headway) {
        const dep = originDep + offset;
        out.push({
          dep,
          lineId: entry.lineId,
          lineColor: entry.meta?.color || '#888',
          svcId: svc.id || '(service)',
          svcDesc: svc.desc || svc.name || '',
          destCode: seq[seq.length - 1],
          dir: pos === 0 ? 'SB' : (pos === seq.length - 1 ? 'NB' : ''),
        });
      }
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
    const entries = buildEntries();
    const baseCode = currentStationCode();

    if (!baseCode) {
      panel.innerHTML = '<div style="color:#f44336">Inspect a station first.</div>';
      panel.style.display = 'block';
      return;
    }

    const codes = equivalentCodes(baseCode);
    const serving = entries.filter((e) =>
      e.stations.some((s) => codes.has(s.code)));

    if (!serving.length) {
      panel.innerHTML = `<div style="color:#ff9800">No timetable data available for ${baseCode}.</div>`;
      panel.style.display = 'block';
      return;
    }

    for (const e of serving) {
      if (!lineFilter.has(e.lineId)) lineFilter.set(e.lineId, true);
    }

    const rows = [];
    for (const entry of serving) {
      if (!lineFilter.get(entry.lineId)) continue;
      const matched = entry.stations.find((s) => codes.has(s.code));
      if (!matched) continue;
      for (const svc of entry.services || []) {
        rows.push(...serviceDepartures(entry, svc, matched.code));
      }
    }
    rows.sort((a, b) => a.dep - b.dep || a.lineId.localeCompare(b.lineId));

    const byHour = new Map();
    for (const r of rows) {
      const hour = Math.floor(r.dep / 60);
      if (!byHour.has(hour)) byHour.set(hour, []);
      byHour.get(hour).push(r);
    }

    const station = stationName(serving, baseCode);
    const destName = (c) => stationName(serving, c);
    const codeList = [...codes].sort().join(' · ');

    const chips = serving.map((e) => {
      const on = lineFilter.get(e.lineId);
      const col = e.meta?.color || '#888';
      return `<label style="display:inline-flex;align-items:center;gap:6px;
        background:#1f1f1f;border:1px solid ${on ? col : '#333'};
        border-radius:14px;padding:4px 10px;margin:3px;cursor:pointer;font-size:0.8rem">
        <input type="checkbox" data-line="${e.lineId}" ${on ? 'checked' : ''}
          style="accent-color:${col}">
        <span style="color:${on ? '#fff' : '#777'}">${e.lineId}</span>
      </label>`;
    }).join('');

    let html = `
      <div style="margin-bottom:10px">
        <strong style="color:#fff">${station}</strong>
        <span style="color:#888;font-size:0.85rem;margin-left:8px">${codeList}</span>
        <span style="color:#666;font-size:0.8rem;margin-left:10px">${rows.length} departures</span>
      </div>
      <div style="margin-bottom:12px">
        <span style="color:#888;font-size:0.75rem;letter-spacing:0.08em;margin-right:8px">RELATIONS</span>
        <button id="tt-all" style="background:#333;color:#eee;border:1px solid #555;
          padding:3px 10px;margin-right:6px;border-radius:4px;cursor:pointer;font-family:monospace">All</button>
        <button id="tt-none" style="background:#333;color:#eee;border:1px solid #555;
          padding:3px 10px;border-radius:4px;cursor:pointer;font-family:monospace">None</button>
        <div style="margin-top:6px">${chips}</div>
      </div>`;

    if (!rows.length) {
      html += '<div style="color:#ff9800">No departures match the selected relations.</div>';
    } else {
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px">';
      for (const [hour, list] of [...byHour.entries()].sort((a, b) => a[0] - b[0])) {
        html += `
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:10px">
            <div style="color:#888;font-size:0.75rem;letter-spacing:0.08em;margin-bottom:8px">${pad2(hour % 24)}:00–${pad2((hour + 1) % 24)}:00</div>`;
        for (const r of list) {
          const txt = (luminance(r.lineColor) > 0.35) ? '#000' : '#fff';
          html += `
            <div style="display:flex;gap:8px;align-items:baseline;padding:3px 0;font-size:0.85rem">
              <span style="color:#fff;min-width:44px">${hm(r.dep)}</span>
              <span style="background:${r.lineColor};color:${txt};padding:1px 6px;
                border-radius:3px;font-size:0.72rem;font-weight:bold">${r.lineId}</span>
              <span style="color:#4fc3f7;min-width:64px">${r.svcId}</span>
              <span style="color:#aaa">→ ${destName(r.destCode)}</span>
            </div>`;
        }
        html += '</div>';
      }
      html += '</div>';
    }

    panel.innerHTML = html;
    panel.style.display = 'block';

    panel.querySelectorAll('input[data-line]').forEach((box) => {
      box.addEventListener('change', () => {
        lineFilter.set(box.dataset.line, box.checked);
        renderTimetable();
      });
    });
    const allBtn = panel.querySelector('#tt-all');
    const noneBtn = panel.querySelector('#tt-none');
    if (allBtn) allBtn.addEventListener('click', () => {
      serving.forEach((e) => lineFilter.set(e.lineId, true));
      renderTimetable();
    });
    if (noneBtn) noneBtn.addEventListener('click', () => {
      serving.forEach((e) => lineFilter.set(e.lineId, false));
      renderTimetable();
    });
  }

  function luminance(hex) {
    hex = String(hex || '#888').replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map((x) => x + x).join('');
    const lin = (c) => {
      const v = parseInt(c, 16) / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(hex.slice(0, 2))
      + 0.7152 * lin(hex.slice(2, 4))
      + 0.0722 * lin(hex.slice(4, 6));
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

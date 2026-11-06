/* ================================================================
   JP-UI.JS — Journey Planner UI + orchestrazione ricerche
   Estratto da journey-planner.html.
   Dipende da: unified-router.js, routing.js, suburban-router.js,
               metro/*, cl-data.js, cl-tt.js, cityliner-router.js
   Caricare DOPO unified-router.js e cityliner-router.js.
================================================================ */
(function(){

  /* ================================================================
   JOURNEY PLANNER — init
================================================================ */

// 1. Registra i router
IZXUnifiedRouter.registerRouter('IZX', IZXRouter);
if (typeof SuburbanRouter !== 'undefined')
  IZXUnifiedRouter.registerRouter('SUB', SuburbanRouter);
if (typeof MetroRouter !== 'undefined')
  IZXUnifiedRouter.registerRouter('METRO', MetroRouter);

// 2. Costruisci l'interchange index cross-network
(function _buildIx() {
  const pairs = [];

  // IZX_LINES interchange
  for (const line of Object.values(IZX_LINES)) {
    if (line.INTERCHANGE) {
      for (const [a, b] of Object.entries(line.INTERCHANGE))
        pairs.push({ codeA: a, codeB: b });
    }
    if (line.INTERCHANGE_EXTRA) {
      for (const [a, partners] of Object.entries(line.INTERCHANGE_EXTRA)) {
        for (const b of partners) pairs.push({ codeA: a, codeB: b });
      }
    }
  }

  // Suburban interchange
  if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
    for (const [a, arr] of Object.entries(SUBURBAN_INTERCHANGE))
      for (const e of arr) pairs.push({ codeA: a, codeB: e.code ?? e, transferMin: e.transferMin });
  }

  // Metro interchanges (M4_INTERCHANGE + MetroRouter.allInterchanges())
  if (typeof MetroRouter !== 'undefined') {
    MetroRouter.allInterchanges().forEach(ix =>
      pairs.push({ codeA: ix.codeA, codeB: ix.codeB, transferMin: ix.transferMin })
    );
  }

  // M4_INTERCHANGE (cross-network: metro ↔ IZX/suburban)
  if (typeof M4_INTERCHANGE !== 'undefined') {
    for (const [a, arr] of Object.entries(M4_INTERCHANGE))
      for (const e of arr)
        pairs.push({ codeA: a, codeB: e.code ?? e, transferMin: e.transferMin });
  }

  // CityLiner (CL) — interscambi da cl-data.js
  if (typeof CL_INTERCHANGE !== 'undefined') {
    for (const [a, arr] of Object.entries(CL_INTERCHANGE))
      for (const b of arr)
        pairs.push({ codeA: a, codeB: b, transferMin: 5 });
  }

  IZXUnifiedRouter.buildInterchangeIndex(pairs);
})();

    const _jpState = {
  from: null, to: null, lineF: null, directOnly: false, excludeIzx: false,
  windowStart: null, windowEnd: null,
  all: [],
};

  function _parseMins(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }
  function _fmtMins(total) {
    const h = Math.floor(((total % 1440) + 1440) % 1440 / 60);
    const m = ((total % 1440) + 1440) % 1440 % 60;
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
  }
  function _nextAfter(journeys) {
    if (!journeys.length) return null;
    let maxMins = -Infinity;
    journeys.forEach(j => { const m = _parseMins(j.departureTime); if (m > maxMins) maxMins = m; });
    return _fmtMins(maxMins + 1);
  }
  function _prevBefore(journeys) {
    if (!journeys.length) return null;
    let minMins = Infinity;
    journeys.forEach(j => { const m = _parseMins(j.departureTime); if (m < minMins) minMins = m; });
    return _fmtMins(minMins - 180);
  }

  function _stName(code) {
  if (typeof CL_ST !== 'undefined' && CL_ST[code]) {
    return CL_ST[code].n;
  }
  const izxName = IZXRouter.stationName(code);
  if (izxName && izxName !== code) return izxName;
  const subName = SuburbanRouter.stationName(code);
  if (subName && subName !== code) return subName;
  if (typeof MetroRouter !== 'undefined') {
    const metName = MetroRouter.stationName(code);
    if (metName && metName !== code) return metName;
  }
  return code;
}

  function _badgeTextColor(hex) {
  const c = hex.replace('#','');
  const r = parseInt(c.slice(0,2),16)/255;
  const g = parseInt(c.slice(2,4),16)/255;
  const b = parseInt(c.slice(4,6),16)/255;
  const lin = v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
  const L = 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
  return L > 0.179 ? '#000' : '#fff';
}

  function buildPlannerSelects(){
    const jpFrom = document.getElementById('jp-from');
    const jpTo   = document.getElementById('jp-to');
    const byName = {};
    const addSt = (code, name, kanji) => {
      const key = name.trim().toLowerCase();
      if (!byName[key]) byName[key] = { name: name.trim(), kanji: kanji || '', codes: [] };
      if (!byName[key].codes.includes(code)) byName[key].codes.push(code);
    };
    TTEngine.allStations().forEach(st => addSt(st.code, st.name, st.kanji));
    SuburbanRouter.allStations().forEach(st => addSt(st.code, st.name, st.kanji));
    if (typeof MetroRouter !== 'undefined') {
      MetroRouter.allStations().forEach(st => addSt(st.code, st.name, st.kanji));
    }
    if (typeof CL_ST !== 'undefined') {
      Object.entries(CL_ST).forEach(([code, s]) => addSt(code, s.n, s.k));
    }
    const sorted = Object.values(byName).sort((a, b) => a.name.localeCompare(b.name));
    sorted.forEach(entry => {
      const primaryCode = entry.codes[0];
      const debugCodes = entry.codes.length > 1 ? '  [' + entry.codes.join(', ') + ']' : '';
      const label = entry.name + (entry.kanji ? ' · ' + entry.kanji : '') + debugCodes;
      [jpFrom, jpTo].forEach(sel => {
        const opt = document.createElement('option');
        opt.value = primaryCode;
        opt.dataset.codes = entry.codes.join(',');
        opt.textContent = label;
        sel.appendChild(opt);
      });
    });
    jpFrom.value = 'R13';
    jpTo.value   = 'SN08';
  }

function svcPillHTML(svcDesc) {
  if (!svcDesc) return '';
  const d = svcDesc.toLowerCase();
  const pill = (cls, abbr, full) =>
    `<span class="svc-pill ${cls}" title="${full}" aria-label="${full}">${abbr}</span>`;
  if (d.includes('commuter rapid')) return pill('commuter-rapid', 'CRP', 'Commuter Rapid');
  if (d.includes('semi-rapido') || d.includes('semi rapid')) return pill('semi-rapid', 'SRP', 'Semi-Rapid');
  if (d.includes('limited express') || d.includes('lim. exp')) return pill('limited-express', 'LEX', 'Limited Express');
  if (d.includes('express')) return pill('express', 'EXP', 'Express');
  if (d.includes('rapid')) return pill('rapid', 'RPD', 'Rapid');
  return '';
}
    function svcBadgeHTML(lineId, svcLogical, color, network) {
  if (lineId === 'CL') {
    return `<span class="svc-badge-cl" title="CityLiner">
      <img class="logo-light" src="assets/img/logos/CL_logo.svg" alt="CityLiner">
      <img class="logo-dark" src="assets/img/logos/CL_logo-dark.svg" alt="CityLiner">
    </span>`;
  }

  const isMetro = network === 'metro';
  if (isMetro) {
    const textColor = _badgeTextColor(color);
    return `<span class="svc-badge-metro" style="background:${color};color:${textColor}">${lineId}</span>`;
  }
  const svcKey = lineId === 'Cp' ? 'Cp' : (svcLogical || lineId);
  const label  = lineId === 'Cp' ? 'C\u2032' : svcKey;
  const IZX_CSS_KEYS = new Set(['A','B','C','Cp','D','E','F','L','K','J','G','G-local','I','IS','IL','H','N','M','MF','MI','MS','SN','AX-est','AX-baj','AX-sak','AX']);
  if (IZX_CSS_KEYS.has(svcKey)) return `<span class="svc-badge svc-${svcKey}">${label}</span>`;
  if (color && color.startsWith('#')) {
    const textColor = _badgeTextColor(color);
    return `<span class="svc-badge-izarail" style="background:${color};color:${textColor}">${label}</span>`;
  }
  return `<span class="svc-badge">${label}</span>`;
}

  function renderJourneys(journeys, fromName, toName, mode) {
    const resEl   = document.getElementById('jp-results');
    const titleEl = document.getElementById('jp-route-title');
    const listEl  = document.getElementById('journey-list');
    const noteEl  = document.getElementById('jp-note');
    const navBar  = document.getElementById('jp-nav-bar');
    const timeChip= document.getElementById('jp-time-chip');
    resEl.style.display = 'block';
    titleEl.textContent = fromName + ' \u2192 ' + toName;
    if (!journeys.length && mode === 'replace') {
      listEl.innerHTML = '<p class="jp-no-result">No journeys found in the next 3 hours.</p>';
      noteEl.style.display = 'none';
      navBar.style.display = 'none';
      return;
    }
    if (mode === 'prepend') {
      const existingKeys = new Set(_jpState.all.map(_jpKey));
      const fresh = journeys.filter(j => !existingKeys.has(j.departureTime + '|' + (j.legs[0]?.trainNumber ?? '')));
      _jpState.all = [...fresh, ..._jpState.all];
    } else if (mode === 'append') {
      const existingKeys = new Set(_jpState.all.map(_jpKey));
      const fresh = journeys.filter(j => !existingKeys.has(j.departureTime + '|' + (j.legs[0]?.trainNumber ?? '')));
      _jpState.all = [..._jpState.all, ...fresh];
    } else {
      _jpState.all = [...journeys];
    }
    _jpState.all.sort((a,b) => _parseMins(a.departureTime) - _parseMins(b.departureTime));
    const hasTransfer = _jpState.all.some(j => j.transfers > 0);
    if (hasTransfer) {
      noteEl.style.display = 'block';
      noteEl.innerHTML = `\u24d8 Transfer time: minimum <strong>${IZXRouter.TRANSFER_MIN} min</strong> between trains at the same station.`;
    } else {
      noteEl.style.display = 'none';
    }
    if (_jpState.all.length) {
      _jpState.windowStart = _jpState.all[0].departureTime;
      _jpState.windowEnd   = _jpState.all[_jpState.all.length - 1].departureTime;
    }
    listEl.innerHTML = '';
    _jpState.all.forEach((j, idx) => {
      const card = document.createElement('div');
      card.className = 'journey-card' + (idx === 0 ? ' best' : '');
      const transferBadge = j.transfers > 0 ? `<span class="transfer-badge">${j.transfers} change</span>` : '<span class="transfer-badge">Direct</span>';
      let legsHTML = '<div class="journey-legs">';
      j.legs.forEach((leg, li) => {
        const badge = svcBadgeHTML(leg.lineId, leg.svcLogical, leg.color, leg.network);
        const svcPill = /^(KW|KS|SK|TS|IBC|SHX)$/.test(leg.lineId) ? svcPillHTML(leg.svcDesc) : '';
        const intStops = leg.intermediateStops ?? [];
        const intId = `int-${idx}-${li}`;
        const expandBtn = intStops.length ? `<button class="leg-expand-btn" data-target="${intId}">\u25b8 ${intStops.length} stop${intStops.length > 1 ? 's' : ''}</button>` : '';
        const intHTML = [
          `<div class="leg-int-row leg-int-od"><span class="leg-int-time">${leg.boardDep}</span><span>${leg.boardName}</span></div>`,
          ...intStops.map(s => `<div class="leg-int-row"><span class="leg-int-time">${s.arr} \u2192 ${s.dep}</span><span>${s.name}</span></div>`),
          `<div class="leg-int-row leg-int-od"><span class="leg-int-time">${leg.alightArr}</span><span>${leg.alightName}</span></div>`,
        ].join('');
        legsHTML += `
          <div class="leg-row">
            <div class="leg-svc">${badge}${svcPill} <span class="svc-name">${leg.svcName}</span></div>
            <div class="leg-times">${leg.boardDep} \u2192 ${leg.alightArr}</div>
            <div class="leg-stations">${leg.boardName} \u2192 ${leg.alightName} ${expandBtn}</div>
            <div class="leg-meta">
              <span class="leg-train">#${leg.trainNumber ?? '--'}</span>
              ${leg.km != null ? `<span class="leg-km">${Math.round(leg.km)} km</span>` : ''}
            </div>
          </div>
          ${intStops.length ? `<div class="leg-intermediates" id="${intId}">${intHTML}</div>` : ''}`;
        if (li < j.legs.length - 1) {
          const node = _stName(j.transferNodes?.[li] ?? j.legs[li + 1]?.boardCode ?? '');
          const nTransfers = j.legs.length - 1;
          const prevLeg = j.legs[li];
          const nextLeg = j.legs[li + 1];
          const sameTrip = prevLeg?.tripId && nextLeg?.tripId && prevLeg.tripId === nextLeg.tripId;
          const isThru = sameTrip && ((Array.isArray(j.transferThru) && j.transferThru.length === nTransfers) ? !!j.transferThru[li] : (!!j.thruService && (j.thruNode == null || j.transferNodes[li] === j.thruNode)));
          if (isThru) {
            legsHTML += `<div class="thru-row"><span class="thru-arrows">⇄</span><span class="thru-label">Thru service</span><span>&mdash; operator changes at ${node}, stay on board</span></div>`;
          } else {
            const walkMin = Array.isArray(j.transferWalkMin) ? (j.transferWalkMin[li] ?? IZXUnifiedRouter.CROSS_TRANSFER_MIN) : (j.transferWalkMin ?? IZXUnifiedRouter.CROSS_TRANSFER_MIN);
            const waitMin = Array.isArray(j.transferWaitMin) ? (j.transferWaitMin[li] ?? 0) : (li === 0 ? (j.transferWaitMin ?? 0) : 0);
            legsHTML += `<div class="transfer-row"><span class="transfer-row-title">Change at <strong>${node}</strong></span><div class="transfer-times"><span class="transfer-time-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="5" r="2"/><path d="M12 7l-2 5h4l-1 5"/><path d="M10 12l-3 5"/></svg><span class="transfer-time-label">Walk</span><span class="transfer-time-val">${walkMin} min</span></span><span class="transfer-time-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg><span class="transfer-time-label">Wait</span><span class="transfer-time-val${waitMin === 0 ? ' is-zero' : ''}">${waitMin > 0 ? waitMin + ' min' : '—'}</span></span></div></div>`;
          }
        }
      });
      legsHTML += '</div>';
      card.innerHTML = `<div class="journey-header"><div class="journey-times">${j.departureTime} \u2192 ${j.arrivalTime}</div><div class="journey-dur">${j.totalMinutes} min ${transferBadge}${j.totalKm != null ? ` <span class="journey-km">\u00b7 ${Math.round(j.totalKm)} km</span>` : ''}</div></div>` + legsHTML;
      card.querySelectorAll('.leg-expand-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = card.querySelector('#' + btn.dataset.target);
          if (!target) return;
          const open = target.classList.toggle('open');
          btn.textContent = open ? btn.textContent.replace('\u25b8', '\u25be') : btn.textContent.replace('\u25be', '\u25b8');
        });
      });
      listEl.appendChild(card);
    });
    navBar.style.display = 'flex';
    timeChip.textContent = _jpState.windowStart + ' \u2013 ' + _jpState.windowEnd;
    if (mode === 'prepend' && journeys.length) {
      listEl.firstElementChild?.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
  }

  function _jpKey(j) {
  return [j.departureTime, j.arrivalTime, j.transfers ?? 0, (j.legs || []).map(l => (l.lineId || '') + ':' + (l.boardDep || '') + '>' + (l.alightArr || '')).join('/')].join('|');
}

    function _runSearch(from, to, depTime, lineF, directOnly, excludeIzx) {
    const fromCodes = Array.isArray(from) ? from : [from];
    const toCodes   = Array.isArray(to)   ? to   : [to];
    const IZX_NETWORKS = new Set(['KE','RY','EI']);
    const seen = new Set();
    const all  = [];
    for (const f of fromCodes) {
      for (const t of toCodes) {
        if (f === t) continue;
        const res = IZXUnifiedRouter.search(f, t, depTime, {
          networks:   (lineF && lineF !== 'ALL') ? lineF : undefined,
          directOnly: !!directOnly,
          maxResults: 8,
        });
        const filtered = excludeIzx ? res.filter(j => !j.legs.some(l => IZX_NETWORKS.has(l.network))) : res;
        for (const j of filtered) {
          const key = _jpKey(j);
          if (!seen.has(key)) { seen.add(key); all.push(j); }
        }
      }
    }
    const merged = directOnly ? all : IZXUnifiedRouter.dedup(all);
    merged.sort((a, b) => (a.transfers ?? 0) - (b.transfers ?? 0) || _parseMins(a.departureTime) - _parseMins(b.departureTime));
    const hasDirect = merged.some(j => (j.transfers ?? 0) === 0);
    const filtered = hasDirect ? merged.filter(j => (j.transfers ?? 0) === 0) : merged;
    return filtered.slice(0, 8);
  }

  buildPlannerSelects();

  document.getElementById('jp-swap').addEventListener('click', () => {
    const f = document.getElementById('jp-from'), t = document.getElementById('jp-to');
    const tmp = f.value; f.value = t.value; f.value = t.value; t.value = tmp;
  });

  document.getElementById('jp-search').addEventListener('click', () => {
    const fromSel    = document.getElementById('jp-from');
    const toSel      = document.getElementById('jp-to');
    const from       = (fromSel.selectedOptions[0]?.dataset.codes || fromSel.value).split(',');
    const to         = (toSel.selectedOptions[0]?.dataset.codes   || toSel.value).split(',');
    const depTime    = document.getElementById('jp-time').value || '08:00';
    const lineF      = document.getElementById('jp-line').value;
    const directOnly = document.getElementById('jp-direct-only').checked;
    const excludeIzx = document.getElementById('jp-exclude-izx').checked;
    if (from[0] === to[0] && from.length === 1 && to.length === 1) { alert('Please select two different stations.'); return; }
    const btn = document.getElementById('jp-search');
    const listEl = document.getElementById('journey-list');
    btn.disabled = true;
    btn.textContent = 'Searching…';
    listEl.innerHTML = '<p class="jp-no-result">⏳ Searching journeys…</br>経由檢索中...</p>';
    setTimeout(() => {
      try {
        _jpState.from = from; _jpState.to = to;
        _jpState.lineF = lineF; _jpState.directOnly = directOnly;
        _jpState.excludeIzx = excludeIzx; _jpState.all = [];
        const fromName = fromSel.selectedOptions[0]?.textContent.split('  [')[0].trim() || _stName(from[0]);
        const toName   = toSel.selectedOptions[0]?.textContent.split('  [')[0].trim()   || _stName(to[0]);
        _jpState.fromName = fromName; _jpState.toName = toName;
        const journeys = _runSearch(from, to, depTime, lineF, directOnly, excludeIzx);
        renderJourneys(journeys, fromName, toName, 'replace');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Find journeys';
      }
    }, 30);
  });

  document.getElementById('jp-earlier').addEventListener('click', () => {
    if (!_jpState.from) return;
    const anchor = _prevBefore(_jpState.all);
    if (!anchor) return;
    const journeys = _runSearch(_jpState.from, _jpState.to, anchor, _jpState.lineF, _jpState.directOnly, _jpState.excludeIzx);
    const cutoff = _parseMins(_jpState.windowStart);
    const earlier = journeys.filter(j => _parseMins(j.departureTime) < cutoff);
    if (!earlier.length) {
      const btn = document.getElementById('jp-earlier');
      const orig = btn.innerHTML;
      btn.textContent = 'No earlier trains'; btn.disabled = true;
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 2000);
      return;
    }
    renderJourneys(earlier, _jpState.fromName, _jpState.toName, 'prepend');
  });

  document.getElementById('jp-later').addEventListener('click', () => {
    if (!_jpState.from) return;
    const anchor = _nextAfter(_jpState.all);
    if (!anchor) return;
    const journeys = _runSearch(_jpState.from, _jpState.to, anchor, _jpState.lineF, _jpState.directOnly, _jpState.excludeIzx);
    if (!journeys.length) {
      const btn = document.getElementById('jp-later');
      const orig = btn.innerHTML;
      btn.textContent = 'No later trains'; btn.disabled = true;
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 2000);
      return;
    }
    renderJourneys(journeys, _jpState.fromName, _jpState.toName, 'append');
  });

})();

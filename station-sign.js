/* Station sign extension. Load after the inspector's inline script. */
(function () {
  'use strict';
  const read = name => {
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) return undefined;
    try { return Function('return typeof ' + name + ' === "undefined" ? undefined : ' + name)(); }
    catch (_) { return undefined; }
  };
  const topology = new Map();
  let contextLine = '';
  const style = document.createElement('style');
  style.textContent = `
    @font-face { font-family:'Station Latin'; src:url('./assets/ANEKGUJARATI_CONDENSED-MEDIUM.TTF') format('truetype'); font-weight:500; font-style:normal; font-display:swap; }
    @font-face { font-family:'Station Kanji'; src:url('./assets/HGMARUGOTHICMPRO_X0213(04).TTF') format('truetype'); font-weight:400; font-style:normal; font-display:swap; }
    .station-sign { background:#f4f3ed; color:#202020; border-radius:6px; overflow:hidden; width:min(100%,480px); aspect-ratio:4 / 3; height:auto; margin:0 auto 24px; display:flex; flex-direction:column; font-family:'Station Latin','Station Kanji',sans-serif; font-weight:500; font-synthesis:none; }
    .station-sign-heading { padding:12px 16px; text-align:center; font:inherit; }
    .station-sign-heading select { max-width:100%; padding:8px; font:inherit; }
    .station-sign-centre { text-align:center; padding:20px 16px; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .station-sign-kanji, .station-sign-neighbour-kanji { font-family:'Station Kanji',sans-serif; font-weight:400; }
    .station-sign-kanji { font-size:clamp(24px,4vw,40px); overflow-wrap:anywhere; }
    .station-sign-name { font-size:clamp(20px,3vw,30px); margin:8px 0; overflow-wrap:anywhere; }
    .station-sign-code { display:inline-block; padding:6px 12px; border:2px solid currentColor; border-radius:6px; font-size:16px; }
    .station-sign-neighbours { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:16px; padding:16px; border-top:8px solid var(--sign-color); }
    .station-sign-side { display:flex; flex-direction:column; gap:8px; min-width:0; }
    .station-sign-side:last-child { text-align:right; }
    .station-sign-link { display:block; width:100%; min-height:44px; text-align:inherit; color:inherit; background:transparent; border:1px solid #ccc; padding:10px; font:inherit; }
    .station-sign-link:hover { background:#e4e3dc; }
    .station-sign-link:focus-visible { outline:3px solid var(--sign-color); outline-offset:2px; }
    .station-sign-link span { display:block; overflow-wrap:anywhere; }
    .station-sign-link small { display:block; font-size:12px; margin-top:4px; }
    .station-sign-note { padding:0 16px 12px; font-size:12px; color:#555; }
  `;
  document.head.appendChild(style);
  function addText(parent, tag, text, cls) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    el.textContent = text || '';
    parent.appendChild(el);
    return el;
  }
  function graphFor(id) {
    if (topology.has(id)) return topology.get(id);
    const line = LINE_INDEX.find(l => l.id === id);
    if (!line) return null;
    let native;
    for (const key of ['SUBURBAN_LINES','HD_LINES','WI_LINES','SHX_LINES','SSK_LINES','IBC_LINES']) {
      const entries = Object.values(read(key) || {});
      native = entries.find(l => l.id === id) || native;
    }
    const meta = read(id + '_META') || native || {};
    const st = read(id + '_ST');
    const lookup = new Map(line.stations.map(s => [s.code,s]));
    for (const s of native?.stations || []) lookup.set(s.code,{code:s.code,name:s.name,kanji:s.kanji || s.k || ''});
    for (const [code,s] of Object.entries(st || {})) lookup.set(code,{code,name:s.n || s.name || code,kanji:s.k || s.kanji || ''});
    const prev = new Map(), next = new Map();
    const edge = (a,b) => {
      if (!lookup.has(a) || !lookup.has(b) || a === b) return;
      if (!next.has(a)) next.set(a,new Set());
      if (!prev.has(b)) prev.set(b,new Set());
      next.get(a).add(b); prev.get(b).add(a);
    };
    const sequence = arr => { for(let i=1;i<arr.length;i++) edge(arr[i-1],arr[i]); };
    const codeOf = s => typeof s === 'string' ? s : s.code;
    const common = read(id + '_CANONICAL_COMMON');
    const canonical = read(id + '_CANONICAL_ORDER');
    const branches = Array.isArray(native?.branches) ? native.branches : [];
    let incomplete = false;
    if (Array.isArray(common)) {
      sequence(common);
      let found = false;
      for (const suffix of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        const branch = read(id + '_CANONICAL_' + suffix);
        if (Array.isArray(branch)) {
          sequence(branch[0] === common[common.length-1] ? branch : [common[common.length-1],...branch]);
          found = true;
        }
      }
      incomplete = !found;
    } else if (branches.length) {
      const branchCodes = new Set(branches.flatMap(b => (b.stations || []).map(codeOf)));
      const main = (native.stations || []).map(codeOf).filter(c => !branchCodes.has(c));
      sequence(main);
      for (const b of branches) {
        if (b.junction && Array.isArray(b.stations)) sequence([b.junction,...b.stations.map(codeOf)]);
        else incomplete = true;
      }
    } else {
      const order = Array.isArray(canonical) ? canonical : [...lookup.keys()];
      if (meta.branches) incomplete = true;
      else sequence(order);
      if (meta.circular === true && order.length > 1) edge(order[order.length-1],order[0]);
    }
    const graph = {line,lookup,prev,next,incomplete};
    topology.set(id,graph);
    return graph;
  }
  function choicesFor(station) {
    const codes = new Set([station.code]);
    const name = String(station.name || '').trim().toLowerCase();
    const consider = (a,b) => {
      if (a !== station.code) return;
      if (ALL_STATIONS.some(s => s.code === b && String(s.name || '').trim().toLowerCase() === name)) codes.add(b);
    };
    for (const map of Object.values(METRO_INTERCHANGE_MAP)) {
      for (const [from,entries] of Object.entries(map)) {
        for (const e of (Array.isArray(entries) ? entries : [entries])) {
          const to = typeof e === 'string' ? e : e.code;
          consider(from,to); consider(to,from);
        }
      }
    }
    for (const ix of FLAT_IX) { consider(ix.from,ix.to); consider(ix.to,ix.from); }
    const choices = [];
    for (const l of LINE_INDEX) {
      const g = graphFor(l.id);
      const code = [...codes].find(c => g.lookup.has(c));
      if (code) choices.push({id:l.id,code});
    }
    return choices;
  }
  function draw(station) {
    const header = document.querySelector('#results .station-header');
    if (!header) return;
    const choices = choicesFor(station);
    if (!choices.length) return;
    const selected = choices.find(c => c.id === contextLine) || choices.find(c => c.id === station.lineId) || choices[0];
    contextLine = selected.id;
    const graph = graphFor(selected.id);
    const current = graph.lookup.get(selected.code);
    const sign = document.createElement('section');
    sign.className = 'station-sign';
    sign.setAttribute('aria-label','Station sign');
    sign.style.setProperty('--sign-color',graph.line.color || '#888');
    const heading = addText(sign,'div','','station-sign-heading');
    if (choices.length > 1) {
      const label = addText(heading,'label','Line ');
      const select = document.createElement('select');
      select.setAttribute('aria-label','Line for adjacent stations');
      for (const choice of choices) {
        const line = LINE_INDEX.find(l => l.id === choice.id);
        const option = addText(select,'option',line.id + ' — ' + line.name);
        option.value = choice.id; option.selected = choice.id === selected.id;
      }
      select.addEventListener('change',() => { contextLine = select.value; draw(station); });
      label.appendChild(select);
    } else heading.textContent = graph.line.id + ' — ' + graph.line.name;
    const centre = addText(sign,'div','','station-sign-centre');
    if (current.kanji && current.kanji !== '—') addText(centre,'div',current.kanji,'station-sign-kanji');
    addText(centre,'div',current.name,'station-sign-name');
    addText(centre,'div',current.code,'station-sign-code');
    const neighbours = addText(sign,'nav','','station-sign-neighbours');
    neighbours.setAttribute('aria-label','Adjacent stations');
    for (const [map,arrow] of [[graph.prev,'←'],[graph.next,'→']]) {
      const side = addText(neighbours,'div','','station-sign-side');
      for (const code of map.get(current.code) || []) {
        const s = graph.lookup.get(code);
        const button = addText(side,'button','','station-sign-link');
        button.type = 'button';
        addText(button,'span',arrow === '←' ? arrow + ' ' + s.name : s.name + ' ' + arrow);
        if (s.kanji && s.kanji !== '—') addText(button,'small',s.kanji,'station-sign-neighbour-kanji');
        addText(button,'small',s.code);
        button.addEventListener('click',() => { contextLine = graph.line.id; qEl.value = code; inspect(); });
      }
    }
    if (graph.incomplete) addText(sign,'div','Branch topology is incomplete; only verified connections are shown.','station-sign-note');
    header.replaceWith(sign);
    sign.classList.add('station-header');
  }
  const originalInspect = window.inspect;
  window.inspect = function () {
    originalInspect.apply(this,arguments);
    const q = qEl.value.trim().toLowerCase();
    if (!q) return;
    const station = ALL_STATIONS.find(s => s.code.toLowerCase() === q || s.name.toLowerCase() === q || s.kanji === qEl.value.trim()) || ALL_STATIONS.find(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || (s.kanji && s.kanji.includes(qEl.value.trim())));
    if (station) draw(station);
  };
  document.getElementById('line-diagram').addEventListener('click',e => {
    if (e.target.closest('.ld-stop')) contextLine = lineSelect.value;
  },true);
  qEl.addEventListener('input',() => { contextLine = ''; });

  /* Interchange badges in the vertical line diagram. */
  const badgeStations = new Map();
  const badgeEdges = new Map();
  function badgeMember(code, line) {
    if (!code || !line.id) return;
    if (!badgeStations.has(code)) badgeStations.set(code,new Map());
    badgeStations.get(code).set(line.network + '|' + line.id,line);
  }
  for (const s of ALL_STATIONS) badgeMember(s.code,{id:s.lineId,name:s.lineName,color:s.lineColor,network:s.network});
  for (const l of LINE_INDEX) for (const s of l.stations) badgeMember(s.code,l);
  function badgeEdge(a,b) {
    if (!a || !b || a === b) return;
    if (!badgeEdges.has(a)) badgeEdges.set(a,new Set());
    if (!badgeEdges.has(b)) badgeEdges.set(b,new Set());
    badgeEdges.get(a).add(b); badgeEdges.get(b).add(a);
  }
  for (const map of Object.values(METRO_INTERCHANGE_MAP)) {
    for (const [from,entries] of Object.entries(map)) {
      for (const e of (Array.isArray(entries) ? entries : [entries])) badgeEdge(from,typeof e === 'string' ? e : e?.code);
    }
  }
  for (const ix of FLAT_IX) badgeEdge(ix.from,ix.to);
  function badgesFor(code, current) {
    const found = new Map();
    for (const c of [code,...(badgeEdges.get(code) || [])]) {
      for (const [key,line] of badgeStations.get(c) || []) {
        if (line.id !== current.id || line.network !== current.network) found.set(key,line);
      }
    }
    const category = n => n === 'metro' ? 'metro' : n === 'suburban' ? 'suburban' : 'other';
    const order = current.network === 'metro' ? ['metro','suburban','other'] : ['suburban','other','metro'];
    return [...found.values()].sort((a,b) => order.indexOf(category(a.network)) - order.indexOf(category(b.network)) || String(a.id).localeCompare(String(b.id),'en',{numeric:true}));
  }
  const badgeStyle = document.createElement('style');
  badgeStyle.textContent = `
    #line-diagram .ld-info { flex:1; }
    .ld-interchanges { display:inline-flex; flex-wrap:wrap; align-items:center; justify-content:flex-end; gap:6px; margin-left:auto; max-width:100%; }
    .ld-interchange-badge { display:inline-flex; align-items:center; justify-content:center; min-width:32px; min-height:28px; padding:4px 8px; border-radius:4px; font:600 12px/1.2 sans-serif; }
    .ld-interchange-badge-metro { width:32px; height:32px; padding:0; border-radius:50%; }
  `;
  document.head.appendChild(badgeStyle);
  function decorateLineInterchanges(lineId) {
    const current = LINE_INDEX.find(l => l.id === lineId);
    if (!current) return;
    document.querySelectorAll('#line-diagram .ld-stop').forEach(row => {
      row.querySelector('.ld-interchanges')?.remove();
      const lines = badgesFor(row.dataset.code,current);
      const info = row.querySelector('.ld-info');
      if (!info || !lines.length) return;
      const group = document.createElement('span');
      group.className = 'ld-interchanges';
      group.setAttribute('role','group');
      group.setAttribute('aria-label','Interchange lines');
      for (const line of lines) {
        const badge = document.createElement('span');
        badge.className = 'ld-interchange-badge' + (line.network === 'metro' ? ' ld-interchange-badge-metro' : '');
        badge.textContent = line.id;
        badge.title = line.id + ' — ' + (line.name || line.id);
        badge.setAttribute('role','img');
        badge.setAttribute('aria-label',badge.title);
        const color = line.color || '#888';
        badge.style.backgroundColor = color;
        badge.style.color = contrastColor(color);
        group.appendChild(badge);
      }
      info.appendChild(group);
    });
  }
  const originalRenderLineDiagram = window.renderLineDiagram;
  window.renderLineDiagram = function (lineId) {
    originalRenderLineDiagram.apply(this,arguments);
    decorateLineInterchanges(lineId);
  };
  if (lineSelect.value) decorateLineInterchanges(lineSelect.value);
})();

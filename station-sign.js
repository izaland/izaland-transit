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
    .station-sign-panel { width:min(100%,960px); margin:0 auto 24px; font-family:'Station Latin','Station Kanji',sans-serif; font-weight:500; font-synthesis:none; }
    .station-sign-heading { text-align:center; padding:0 0 12px; font:inherit; }
    .station-sign-heading select { max-width:100%; padding:8px; font:inherit; background:#222; color:#eee; border:1px solid #555; }
    .station-sign { position:relative; container-type:inline-size; width:100%; aspect-ratio:2 / 1; background:#fff; color:#000; border:1px solid #555; border-radius:0; isolation:isolate; }
    .station-sign-band { position:absolute; inset:70% 0 14%; background:var(--sign-color); z-index:0; }
    .station-sign-centre { position:absolute; top:25%; left:23%; width:54%; height:37%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
    .station-sign-kanji, .station-sign-neighbour-kanji { font-family:'Station Kanji',sans-serif; font-weight:400; }
    .station-sign-kanji { font-size:clamp(20px,7.5cqw,72px); line-height:1.15; max-width:100%; overflow-wrap:anywhere; }
    .station-sign-name { font-size:clamp(18px,5cqw,48px); line-height:1.05; max-width:100%; overflow-wrap:anywhere; margin-top:4px; }
    .station-sign-code { position:absolute; left:50%; top:78%; transform:translate(-50%,-50%); display:flex; align-items:center; justify-content:center; min-width:12%; max-width:28%; height:26%; padding:0 4px; border:clamp(3px,0.8cqw,8px) solid var(--sign-color); border-radius:clamp(12px,2.8cqw,28px); background:#fff; color:#000; font-size:clamp(20px,5.8cqw,56px); line-height:1; z-index:3; }
    .station-sign-side { position:absolute; top:0; bottom:0; width:22%; display:grid; grid-template-columns:repeat(var(--branch-count,1),minmax(0,1fr)); gap:4px; z-index:2; }
    .station-sign-side-prev { left:2%; color:#999; }
    .station-sign-side-next { right:2%; color:#000; }
    .station-sign-link { position:relative; display:block; width:100%; height:100%; min-width:0; padding:0; border:0; border-radius:0; background:transparent; color:inherit; font:inherit; cursor:pointer; text-align:center; }
    .station-sign-link:hover { background:transparent; }
    .station-sign-link:hover .station-sign-neighbour-name { text-decoration:underline; }
    .station-sign-link:focus-visible { outline:3px solid var(--sign-color); outline-offset:-3px; }
    .station-sign-label { position:absolute; bottom:32%; left:0; right:0; max-height:43%; display:flex; flex-direction:column; justify-content:flex-end; text-align:center; }
    .station-sign-label > span {  flex-shrink: 0;}
    .station-sign-neighbour-kanji { font-size: clamp(18px, 3.5cqw, 34px);  line-height: 1.15; overflow-wrap: anywhere;}
    .station-sign-neighbour-name { font-size: clamp(20px, 4cqw, 38px); line-height: 1.05; overflow-wrap: anywhere;}
    .station-sign-node { position:absolute; left:50%; top:78%; transform:translate(-50%,-50%); width:clamp(12px,5.5cqw,54px); aspect-ratio:1; background:#fff; border-radius:50%; }
    .station-sign-neighbour-code { position:absolute; top:88%; left:0; right:0; color:#000; font-size:clamp(12px,4cqw,38px); line-height:1; }
    .station-sign-side-multiple .station-sign-neighbour-kanji { font-size:clamp(12px,1.8cqw,18px); }
    .station-sign-side-multiple .station-sign-neighbour-name { font-size:clamp(12px,2cqw,20px); }
    .station-sign-side-multiple .station-sign-neighbour-code { font-size:clamp(12px,2.5cqw,24px); }
    .station-sign-side-multiple .station-sign-node { width:clamp(12px,3cqw,30px); }
    .station-sign-chevron { position:absolute; left:71%; top:78%; width:8%; height:25%; transform:translate(-50%,-50%); z-index:1; pointer-events:none; }
    .station-sign-chevron::before, .station-sign-chevron::after { content:''; position:absolute; top:15%; width:65%; height:70%; border-top:clamp(3px,0.9cqw,9px) solid #fff; border-right:clamp(3px,0.9cqw,9px) solid #fff; transform:rotate(45deg); }
    .station-sign-chevron::before { left:0; }
    .station-sign-chevron::after { left:30%; }
    .station-sign-note { padding-top:8px; font-size:12px; color:#aaa; }
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
    const panel = document.createElement('section');
    panel.className = 'station-sign-panel station-header';
    panel.style.setProperty('--sign-color',graph.line.color || '#888');
    const heading = addText(panel,'div','','station-sign-heading');
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
    const sign = addText(panel,'div','','station-sign');
    sign.setAttribute('role','group');
    sign.setAttribute('aria-label',current.name + ' — ' + current.code);
    const band = addText(sign,'div','','station-sign-band');
    band.setAttribute('aria-hidden','true');
    const centre = addText(sign,'div','','station-sign-centre');
    if (current.kanji && current.kanji !== '—') addText(centre,'div',current.kanji,'station-sign-kanji');
    addText(centre,'div',current.name,'station-sign-name');
    addText(sign,'div',current.code,'station-sign-code');
    for (const [map,direction] of [[graph.prev,'prev'],[graph.next,'next']]) {
      const codes = [...(map.get(current.code) || [])];
      const side = addText(sign,'nav','','station-sign-side station-sign-side-' + direction + (codes.length > 1 ? ' station-sign-side-multiple' : ''));
      side.setAttribute('aria-label',direction === 'prev' ? 'Previous stations' : 'Next stations');
      side.style.setProperty('--branch-count',Math.max(1,codes.length));
      for (const code of codes) {
        const s = graph.lookup.get(code);
        const button = addText(side,'button','','station-sign-link');
        button.type = 'button';
        button.setAttribute('aria-label',s.name + ' — ' + s.code);
        const label = addText(button,'span','','station-sign-label');
        if (s.kanji && s.kanji !== '—') addText(label,'span',s.kanji,'station-sign-neighbour-kanji');
        addText(label,'span',s.name,'station-sign-neighbour-name');
        const node = addText(button,'span','','station-sign-node');
        node.setAttribute('aria-hidden','true');
        addText(button,'span',s.code,'station-sign-neighbour-code');
        button.addEventListener('click',() => { contextLine = graph.line.id; qEl.value = code; inspect(); });
      }
    }
    if ((graph.next.get(current.code)?.size || 0) > 0) {
      const chevron = addText(sign,'div','','station-sign-chevron');
      chevron.setAttribute('aria-hidden','true');
    }
    if (graph.incomplete) addText(panel,'div','Branch topology is incomplete; only verified connections are shown.','station-sign-note');
    header.replaceWith(panel);
    const fit = () => {
      if (!panel.isConnected) return;
      for (const box of panel.querySelectorAll('.station-sign-centre')) {
        for (const child of box.children) child.style.fontSize = '';
        for (let i=0;i<50 && (box.scrollHeight > box.clientHeight + 1 || box.scrollWidth > box.clientWidth + 1);i++) {
          let changed = false;
          for (const child of box.children) {
            const size = parseFloat(getComputedStyle(child).fontSize);
            if (size > 12) { child.style.fontSize = Math.max(12,size - 1) + 'px'; changed = true; }
          }
          if (!changed) break;
        }
      }
    };
    requestAnimationFrame(fit);
    if (document.fonts) document.fonts.ready.then(() => { if (panel.isConnected) fit(); });
    if (typeof ResizeObserver !== 'undefined') {
      if (draw.resizeObserver) draw.resizeObserver.disconnect();
      draw.resizeObserver = new ResizeObserver(fit);
      draw.resizeObserver.observe(sign);
    }
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

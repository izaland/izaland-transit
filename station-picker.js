/* station-picker.js — searchable station inputs for izx-ticket.html */
(function(){
  var st=document.createElement('style');
  st.textContent="\n    /* \u2500\u2500 SEARCHABLE STATION COMBOBOX \u2500\u2500 */\n    .cb{position:relative;}\n    .cb-input{padding-right:36px;text-overflow:ellipsis;}\n    .cb-toggle{position:absolute;right:1px;top:1px;height:40px;width:34px;background:none;border:none;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:0 var(--radius-md) var(--radius-md) 0;}\n    .cb-toggle:hover{color:var(--text);}\n    .cb-toggle svg{transition:transform var(--transition);}\n    .cb.open .cb-toggle svg{transform:rotate(180deg);}\n    .cb-panel{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:60;max-height:320px;overflow-y:auto;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);box-shadow:0 8px 24px oklch(0 0 0 / 0.25);display:none;padding:var(--space-1);}\n    .cb.open .cb-panel{display:block;}\n    .cb-group{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-faint);padding:var(--space-2) var(--space-3) var(--space-1);position:sticky;top:-4px;background:var(--surface);}\n    .cb-opt{padding:var(--space-2) var(--space-3);font-size:var(--text-sm);color:var(--text);border-radius:var(--radius-sm);cursor:pointer;}\n    .cb-opt.hl{background:var(--surface-2);}\n    .cb-opt.sel{color:var(--accent);font-weight:700;}\n    .cb-opt mark{background:var(--accent-glow);color:var(--accent);border-radius:2px;padding:0 1px;}\n    .cb-empty{padding:var(--space-3);font-size:var(--text-xs);color:var(--text-faint);font-style:italic;text-align:center;}\n";
  document.head.appendChild(st);
})();
/* ================================================================
   SEARCHABLE STATION PICKERS
   Wraps each station <select>: type to filter (name, code, kanji;
   accent-insensitive) or open the full grouped list with the arrow.
   The hidden <select> stays the source of truth.
================================================================ */
(function(){
  const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[\u00f0\u00d0]/g,'d').replace(/[\u00fe\u00de]/g,'th').toLowerCase();
  const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function enhance(id){
    const sel = document.getElementById(id);
    if(!sel || sel.dataset.cb) return;
    sel.dataset.cb = '1';
    const wrap = document.createElement('div'); wrap.className = 'cb';
    const input = document.createElement('input');
    input.type='text'; input.className='field-input cb-input'; input.id=id+'-input';
    input.autocomplete='off'; input.spellcheck=false;
    input.placeholder='Type a station name or code\u2026';
    input.setAttribute('role','combobox'); input.setAttribute('aria-expanded','false');
    input.setAttribute('aria-autocomplete','list');
    const btn = document.createElement('button');
    btn.type='button'; btn.className='cb-toggle'; btn.tabIndex=-1; btn.setAttribute('aria-label','Show all stations');
    btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>';
    const panel = document.createElement('div'); panel.className='cb-panel'; panel.setAttribute('role','listbox');
    sel.parentNode.insertBefore(wrap, sel);
    wrap.append(input, btn, panel, sel);
    sel.style.display='none'; sel.tabIndex=-1; sel.setAttribute('aria-hidden','true');
    const lbl = document.querySelector('label[for="'+id+'"]'); if(lbl) lbl.setAttribute('for', input.id);

    let items=[], hl=-1;
    const curLabel = () => sel.selectedOptions[0] ? sel.selectedOptions[0].textContent.split('  [')[0].trim() : '';
    const syncText = () => { input.value = curLabel(); };

    function collect(){
      const out=[]; let group='';
      Array.from(sel.children).forEach(ch=>{
        if(ch.tagName==='OPTGROUP'){ Array.from(ch.children).forEach(o=>out.push({o,g:ch.label})); }
        else if(ch.tagName==='OPTION'){ out.push({o:ch,g:group}); }
      });
      return out.map(x=>({value:x.o.value,label:x.o.textContent.split('  [')[0].trim(),group:x.g,key:norm(x.o.textContent+' '+(x.o.dataset.codes||''))}));
    }

    function render(filter){
      const all = collect();
      const terms = norm(filter).split(/\s+/).filter(Boolean);
      items = all.filter(it => terms.every(t => it.key.includes(t)));
      if(terms.length){
        const first=norm(filter).trim();
        items.sort((a,b)=>{
          const sa = norm(a.label).startsWith(first)||norm(a.label).split(' ').some(w=>w.startsWith(first))?0:1;
          const sb = norm(b.label).startsWith(first)||norm(b.label).split(' ').some(w=>w.startsWith(first))?0:1;
          return sa-sb;
        });
      }
      let html='', last=null;
      if(!items.length) html='<div class="cb-empty">No stations found</div>';
      items.forEach((it,i)=>{
        if(!terms.length && it.group && it.group!==last){ html+='<div class="cb-group">'+esc(it.group)+'</div>'; last=it.group; }
        let lab = esc(it.label);
        if(terms.length===1){
          const idx = norm(it.label).indexOf(terms[0]);
          if(idx>-1 && norm(it.label).length===it.label.length){
            lab = esc(it.label.slice(0,idx))+'<mark>'+esc(it.label.slice(idx,idx+terms[0].length))+'</mark>'+esc(it.label.slice(idx+terms[0].length));
          }
        }
        html+='<div class="cb-opt'+(it.value===sel.value?' sel':'')+'" role="option" data-i="'+i+'">'+lab+'</div>';
      });
      panel.innerHTML=html;
      hl = terms.length ? 0 : items.findIndex(it=>it.value===sel.value);
      paintHl(!terms.length);
    }
    function paintHl(scroll){
      panel.querySelectorAll('.cb-opt').forEach(e=>e.classList.remove('hl'));
      const e = panel.querySelector('.cb-opt[data-i="'+hl+'"]');
      if(e){ e.classList.add('hl'); if(scroll!==false) e.scrollIntoView({block:'nearest'}); }
    }
    function open(filter){ render(filter||''); wrap.classList.add('open'); input.setAttribute('aria-expanded','true'); }
    function close(){ wrap.classList.remove('open'); input.setAttribute('aria-expanded','false'); syncText(); }
    function choose(i){
      const it = items[i]; if(!it) return;
      sel.value = it.value;
      sel.dispatchEvent(new Event('change',{bubbles:true}));
      close(); input.blur();
    }

    input.addEventListener('focus', ()=>{ input.select(); open(''); });
    input.addEventListener('click', ()=>{ if(!wrap.classList.contains('open')){ input.select(); open(''); } });
    input.addEventListener('input', ()=>open(input.value));
    input.addEventListener('keydown', e=>{
      if(e.key==='ArrowDown'){ e.preventDefault(); if(!wrap.classList.contains('open')) open(''); else { hl=Math.min(items.length-1,hl+1); paintHl(); } }
      else if(e.key==='ArrowUp'){ e.preventDefault(); hl=Math.max(0,hl-1); paintHl(); }
      else if(e.key==='Enter'){ e.preventDefault(); if(wrap.classList.contains('open')) choose(hl>=0?hl:0); }
      else if(e.key==='Escape'){ close(); input.blur(); }
      else if(e.key==='Tab'){ close(); }
    });
    btn.addEventListener('mousedown', e=>{
      e.preventDefault();
      if(wrap.classList.contains('open')){ close(); input.blur(); }
      else { input.focus(); }
    });
    panel.addEventListener('mousedown', e=>{
      e.preventDefault();
      const o = e.target.closest('.cb-opt'); if(o) choose(+o.dataset.i);
    });
    input.addEventListener('blur', close);
    sel.addEventListener('change', syncText);
    sel._cbSync = syncText;
    syncText();
  }

  ['sel-from','sel-to','jp-from','jp-to'].forEach(enhance);

  ['btn-swap','jp-swap'].forEach(id=>{
    const b = document.getElementById(id); if(!b) return;
    b.addEventListener('click', ()=>{
      const p = b.closest('.sim-row');
      p.querySelectorAll('select').forEach(s=>s._cbSync && s._cbSync());
    });
  });
})();

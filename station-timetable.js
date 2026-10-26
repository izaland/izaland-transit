/* Station timetable: combined departures and lazy trip details. */
(function () {
  'use strict';
  if (window.__IZX_STATION_TIMETABLE__) return;
  window.__IZX_STATION_TIMETABLE__ = true;
  const filters = new Map();
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const minutes = x => { const [h,m] = String(x).split(':').map(Number); return h*60+m; };
  const clock = t => { const v = ((Math.floor(t)%1440)+1440)%1440; return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')+(t>=1440?' +'+Math.floor(t/1440)+'d':''); };
  function entries() {
    const out = new Map();
    const arrays = {
      SK: typeof SK_SERVICES !== 'undefined' ? SK_SERVICES : null,
      KW: typeof KW_SERVICES !== 'undefined' ? KW_SERVICES : null,
      TS: typeof TS_SERVICES !== 'undefined' ? TS_SERVICES : null,
      KS: typeof KS_SERVICES !== 'undefined' ? KS_SERVICES : null
    };
    function add(line, services, id) {
      id = line.id || id;
      if (!id || !Array.isArray(line.stations)) return;
      let estimated = false;
      if (!services?.length) {
        if (line.stations.length<2) return;
        estimated = true;
        services = [{id,fromCode:line.stations[0].code,toCode:line.stations.at(-1).code,firstDep:'05:00',lastDep:'23:00',headway:line.headwayOffPeak||30,stops:[]}];
      }
      out.set(id,{...line,id,services,estimated});
    }
    if (typeof SUBURBAN_LINES !== 'undefined') for (const [id,l] of Object.entries(SUBURBAN_LINES)) add(l,arrays[l.id||id]||l.services,id);
    if (typeof IBC_LINES !== 'undefined' && IBC_LINES.IBC && typeof IBC_TT_SERVICES !== 'undefined') add(IBC_LINES.IBC,IBC_TT_SERVICES,'IBC');
    const others = [typeof HD_LINES !== 'undefined'?HD_LINES:null,typeof WI_LINES !== 'undefined'?WI_LINES:null,typeof SHX_LINES !== 'undefined'?SHX_LINES:null,typeof SSK_LINES !== 'undefined'?SSK_LINES:null];
    for (const source of others) if (source) for (const [id,l] of Object.entries(source)) if (l.services?.length) add(l,l.services,id);
    return [...out.values()];
  }
  function resolve() {
    const raw = document.getElementById('query')?.value.trim() || '';
    if (typeof ALL_STATIONS !== 'undefined') {
      const q = raw.toLowerCase();
      const s = ALL_STATIONS.find(s=>s.code.toLowerCase()===q||s.name.toLowerCase()===q||s.kanji===raw);
      if (s) return s.code;
    }
    return document.querySelector('#results .station-code')?.textContent.match(/\b[A-Z]{1,5}\d{1,4}\b/)?.[0] || raw.toUpperCase();
  }
  function aliases(code) {
    const graph = new Map();
    function edge(a,b) { if (typeof a!=='string'||typeof b!=='string') return; if(!graph.has(a))graph.set(a,new Set()); if(!graph.has(b))graph.set(b,new Set()); graph.get(a).add(b); graph.get(b).add(a); }
    function ingest(map) { for(const [a,items] of Object.entries(map||{})) for(const b of Array.isArray(items)?items:[items]) edge(a,typeof b==='string'?b:b?.code); }
    if(typeof SUBURBAN_INTERCHANGE!=='undefined') ingest(SUBURBAN_INTERCHANGE);
    if(typeof METRO_INTERCHANGE_MAP!=='undefined') for(const m of Object.values(METRO_INTERCHANGE_MAP)) ingest(m);
    const seen = new Set([code]), queue=[code];
    for(let i=0;i<queue.length;i++) for(const c of graph.get(queue[i])||[]) if(!seen.has(c)){seen.add(c);queue.push(c);}
    return seen;
  }
  function sequence(line,svc) {
    const a=line.stations.findIndex(s=>s.code===svc.fromCode), b=line.stations.findIndex(s=>s.code===svc.toCode);
    if(a<0||b<0) return [];
    if(svc.stops?.length) {
      const list=svc.stops.map(c=>line.stations.find(s=>s.code===c)).filter(Boolean);
      if(list[0]?.code===svc.fromCode&&list.at(-1)?.code===svc.toCode) return list;
    }
    const result=[], step=a<=b?1:-1;
    for(let i=a;i!==b+step;i+=step) if(!svc.stops?.length||svc.stops.includes(line.stations[i].code)) result.push(line.stations[i]);
    return result;
  }
  function offsets(line,svc,seq) {
    const times=[0]; let elapsed=0;
    for(let n=1;n<seq.length;n++) {
      const from=seq[n-1],to=seq[n], len=Math.abs(to.km-from.km)*1000;
      if(!Number.isFinite(len)) return null;
      const a=line.stations.indexOf(from), b=line.stations.indexOf(to);
      let run=0;
      if(svc.vMaxKmh!=null) {
        let cap=svc.vMaxKmh;
        for(let k=Math.min(a,b);k<Math.max(a,b);k++) cap=Math.min(cap,line.stations[k].vLimitKmh??cap);
        const acc=(svc.accelKmhPerSec??2.5)/3.6, dec=(svc.decelKmhPerSec??3)/3.6;
        if(!(cap>0&&acc>0&&dec>0)) return null;
        const v=Math.min(cap/3.6,Math.sqrt(2*len*acc*dec/(acc+dec)));
        if(len>0) run=v/acc+v/dec+Math.max(0,len-v*v/(2*acc)-v*v/(2*dec))/v;
      } else {
        let km=0,weighted=0;
        for(let k=Math.min(a,b);k<Math.max(a,b);k++) {const d=Math.abs(line.stations[k+1].km-line.stations[k].km);km+=d;weighted+=d*(line.stations[k].segSpeedKmh??40);}
        run=len>0?len/(km>0?weighted/km:40)*3.6:0;
      }
      elapsed+=run;
      if(n<seq.length-1) elapsed+=to.dwellSec??svc.dwellSec??20;
      times.push(Math.ceil(elapsed/60));
    }
    return times;
  }
  function panel() {
    let p=document.getElementById('timetable-panel');
    if(!p){p=document.createElement('section');p.id='timetable-panel';p.style.cssText='margin:24px 0;padding:16px;background:#161616;border:1px solid #333;border-radius:6px';document.getElementById('results')?.after(p);if(!p.isConnected)document.body.append(p);}
    return p;
  }
  function render() {
    const p=panel(), code=resolve(), codes=aliases(code), lines=entries().filter(l=>l.stations.some(s=>codes.has(s.code)));
    p.style.display='block';
    if(!lines.length){p.textContent='No timetable data available for '+code;return;}
    const rows=[];
    for(const l of lines) {
      if(!filters.has(l.id))filters.set(l.id,true);
      if(!filters.get(l.id))continue;
      for(const svc of l.services) {
        const seq=sequence(l,svc), pos=seq.findIndex(s=>codes.has(s.code));
        if(pos<0)continue;
        const times=offsets(l,svc,seq), head=Number(svc.headway);
        if(!times||!(head>0))continue;
        const windows=svc.peakWindows?.length?svc.peakWindows:[{from:svc.firstDep,to:svc.lastDep}];
        const seen=new Set();
        for(const w of windows){let start=minutes(w.from),end=minutes(w.to);if(!Number.isFinite(start)||!Number.isFinite(end))continue;if(end<start)end+=1440;
          for(let t=start;t<=end;t+=head){if(seen.has(t))continue;seen.add(t);rows.push({line:l,svc,seq,times,pos,origin:t,dep:t+times[pos]});}
        }
      }
    }
    rows.sort((a,b)=>a.dep-b.dep||a.line.id.localeCompare(b.line.id));
    const name=lines.flatMap(l=>l.stations).find(s=>s.code===code)?.name||document.querySelector('#results .station-name')?.textContent||code;
    p.innerHTML=`<h2 style="font-size:1rem">${esc(name)}</h2><p style="color:#999">${esc([...codes].join(' · '))} — ${rows.length} departures</p><div id="tt-filters"><button type="button" data-all="true">All</button> <button type="button" data-all="false">None</button>${lines.map(l=>`<label style="display:inline-flex;gap:6px;padding:6px"><input type="checkbox" data-line="${esc(l.id)}" ${filters.get(l.id)?'checked':''}>${esc(l.id)}</label>`).join('')}</div><div id="tt-trips"></div>`;
    const target=p.querySelector('#tt-trips');let lastHour=null;
    rows.forEach(r=>{
      const hour=Math.floor(r.dep/60);
      if(hour!==lastHour){const h=document.createElement('h3');h.style.cssText='font-size:.85rem;color:#999;margin:16px 0 8px';h.textContent=clock(hour*60)+'–'+clock((hour+1)*60);target.append(h);lastHour=hour;}
      const d=document.createElement('details');d.style.cssText='padding:5px 0;border-bottom:1px solid #252525';
      const id=r.svc.id||r.line.id;
      d.innerHTML=`<summary style="cursor:pointer"><span style="display:inline-block;min-width:55px">${esc(clock(r.dep))}</span> <span style="background:${/^#[0-9a-f]{3,8}$/i.test(r.line.color||'')?r.line.color:'#444'};color:#fff;padding:2px 6px;border-radius:3px">${esc(r.line.id)}</span> ${id!==r.line.id?`<span style="color:#4fc3f7">${esc(id)}</span>`:''} → ${esc(r.seq.at(-1).name||r.seq.at(-1).code)}${r.line.estimated?' <small>(estimated)</small>':''}</summary>`;
      d.addEventListener('toggle',()=>{
        if(!d.open||d.dataset.built)return;
        d.dataset.built='true';
        const body=document.createElement('div');body.style.cssText='padding:10px 12px;margin:6px 0 6px 16px;border-left:2px solid #666';
        const note=document.createElement('p');note.style.color='#999';note.textContent=(r.svc.desc||id)+' — modelled stop times';body.append(note);
        r.seq.forEach((s,i)=>{
          const item=document.createElement('div');item.style.cssText='padding:4px 0;'+(i===r.pos?'color:#fff;font-weight:bold;background:#303030':i<r.pos?'color:#888':'color:#ccc');
          item.textContent=clock(r.origin+r.times[i])+'  '+(s.name||s.code)+' · '+s.code+(i===r.pos?' ← current station':i<r.pos?' · previous':' · next');body.append(item);
        });
        d.append(body);
      });target.append(d);
    });
    if(!rows.length)target.textContent='No departures match the selected relations.';
    p.querySelectorAll('input[data-line]').forEach(b=>b.addEventListener('change',()=>{filters.set(b.dataset.line,b.checked);render();}));
    p.querySelectorAll('button[data-all]').forEach(b=>b.addEventListener('click',()=>{lines.forEach(l=>filters.set(l.id,b.dataset.all==='true'));render();}));
  }
  function init(){const bar=document.getElementById('search-bar');if(!bar||document.getElementById('timetable-button'))return;const b=document.createElement('button');b.type='button';b.id='timetable-button';b.textContent='Timetable';b.addEventListener('click',render);bar.append(b);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

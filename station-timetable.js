/* Combined station departures with native AX timetable support. */
(function () {
  'use strict';
  if(window.__IZX_STATION_TIMETABLE__)return;
  window.__IZX_STATION_TIMETABLE__=true;
  const filters=new Map();
  const base=new URL('.',document.currentScript?.src||document.baseURI);
  let enginePromise,revision=0;
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const min=x=>{const [h,m]=String(x).split(':').map(Number);return h*60+m;};
  const clock=t=>{const v=((Math.floor(t)%1440)+1440)%1440;return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')+(t>=1440?' +'+Math.floor(t/1440)+'d':'');};
  function engine(){
    if(typeof TTEngine!=='undefined')return Promise.resolve(TTEngine);
    if(!enginePromise)enginePromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=new URL('tt-engine.js',base).href;
      script.onload=()=>{if(typeof TTEngine!=='undefined')resolve(TTEngine);else reject(new Error('TTEngine unavailable'));};
      script.onerror=()=>{script.remove();reject(new Error('Unable to load tt-engine.js'));};
      document.head.append(script);
    }).catch(e=>{enginePromise=null;throw e;});
    return enginePromise;
  }
  function entries(){
    const out=new Map();
    const arrays={SK:typeof SK_SERVICES!=='undefined'?SK_SERVICES:null,KW:typeof KW_SERVICES!=='undefined'?KW_SERVICES:null,TS:typeof TS_SERVICES!=='undefined'?TS_SERVICES:null,KS:typeof KS_SERVICES!=='undefined'?KS_SERVICES:null};
    function add(l,services,id){
      id=l.id||id;if(!id||!Array.isArray(l.stations))return;
      let estimated=false;
      if(!services?.length){if(l.stations.length<2)return;estimated=true;services=[{id,fromCode:l.stations[0].code,toCode:l.stations.at(-1).code,firstDep:'05:00',lastDep:'23:00',headway:l.headwayOffPeak||30,stops:[]}];}
      out.set(id,{...l,id,services,estimated});
    }
    if(typeof SUBURBAN_LINES!=='undefined')for(const [id,l]of Object.entries(SUBURBAN_LINES))add(l,arrays[l.id||id]||l.services,id);
    if(typeof IBC_LINES!=='undefined'&&IBC_LINES.IBC&&typeof IBC_TT_SERVICES!=='undefined')add(IBC_LINES.IBC,IBC_TT_SERVICES,'IBC');
    const others=[typeof HD_LINES!=='undefined'?HD_LINES:null,typeof WI_LINES!=='undefined'?WI_LINES:null,typeof SHX_LINES!=='undefined'?SHX_LINES:null,typeof SSK_LINES!=='undefined'?SSK_LINES:null];
    for(const source of others)if(source)for(const [id,l]of Object.entries(source))if(l.services?.length)add(l,l.services,id);
    if(typeof AX_LINES!=='undefined'&&AX_LINES.AX){const l=AX_LINES.AX;out.set('AX',{id:'AX',native:true,color:l.color,stations:Object.entries(l.ST).map(([code,s])=>({code,name:s.n,km:s.km}))});}
    return [...out.values()];
  }
  function resolve(){
    const raw=document.getElementById('query')?.value.trim()||'';
    if(typeof ALL_STATIONS!=='undefined'){const q=raw.toLowerCase();const s=ALL_STATIONS.find(s=>s.code.toLowerCase()===q||s.name.toLowerCase()===q||s.kanji===raw);if(s)return s.code;}
    return document.querySelector('#results .station-code')?.textContent.match(/\b[A-Z]{1,5}\d{1,4}\b/)?.[0]||raw.toUpperCase();
  }
  function aliases(code){
    const graph=new Map();
    function edge(a,b){if(typeof a!=='string'||typeof b!=='string')return;if(!graph.has(a))graph.set(a,new Set());if(!graph.has(b))graph.set(b,new Set());graph.get(a).add(b);graph.get(b).add(a);}
    function ingest(map){for(const [a,items]of Object.entries(map||{}))for(const b of Array.isArray(items)?items:[items])edge(a,typeof b==='string'?b:b?.code);}
    if(typeof SUBURBAN_INTERCHANGE!=='undefined')ingest(SUBURBAN_INTERCHANGE);
    if(typeof METRO_INTERCHANGE_MAP!=='undefined')for(const m of Object.values(METRO_INTERCHANGE_MAP))ingest(m);
    if(typeof AX_INTERCHANGE!=='undefined')ingest(AX_INTERCHANGE);
    if(typeof AX_LINES!=='undefined')for(const l of Object.values(AX_LINES)){ingest(l.INTERCHANGE);ingest(l.INTERCHANGE_EXTRA);ingest(l.INTERCHANGE_NETWORK);}
    const seen=new Set([code]),queue=[code];for(let i=0;i<queue.length;i++)for(const c of graph.get(queue[i])||[])if(!seen.has(c)){seen.add(c);queue.push(c);}return seen;
  }
  function sequence(l,s){
    const a=l.stations.findIndex(x=>x.code===s.fromCode),b=l.stations.findIndex(x=>x.code===s.toCode);if(a<0||b<0)return [];
    if(s.stops?.length){const list=s.stops.map(c=>l.stations.find(x=>x.code===c)).filter(Boolean);if(list[0]?.code===s.fromCode&&list.at(-1)?.code===s.toCode)return list;}
    const result=[],step=a<=b?1:-1;for(let i=a;i!==b+step;i+=step)if(!s.stops?.length||s.stops.includes(l.stations[i].code))result.push(l.stations[i]);return result;
  }
  function offsets(l,s,seq){
    const times=[0];let elapsed=0;
    for(let n=1;n<seq.length;n++){
      const from=seq[n-1],to=seq[n],len=Math.abs(to.km-from.km)*1000;if(!Number.isFinite(len))return null;
      const a=l.stations.indexOf(from),b=l.stations.indexOf(to);let run=0;
      if(s.vMaxKmh!=null){let cap=s.vMaxKmh;for(let k=Math.min(a,b);k<Math.max(a,b);k++)cap=Math.min(cap,l.stations[k].vLimitKmh??cap);
        const acc=(s.accelKmhPerSec??2.5)/3.6,dec=(s.decelKmhPerSec??3)/3.6;if(!(cap>0&&acc>0&&dec>0))return null;
        const v=Math.min(cap/3.6,Math.sqrt(2*len*acc*dec/(acc+dec)));if(len>0)run=v/acc+v/dec+Math.max(0,len-v*v/(2*acc)-v*v/(2*dec))/v;
      }else{let km=0,weighted=0;for(let k=Math.min(a,b);k<Math.max(a,b);k++){const d=Math.abs(l.stations[k+1].km-l.stations[k].km);km+=d;weighted+=d*(l.stations[k].segSpeedKmh??40);}run=len>0?len/(km>0?weighted/km:40)*3.6:0;}
      elapsed+=run;if(n<seq.length-1)elapsed+=to.dwellSec??s.dwellSec??20;times.push(Math.ceil(elapsed/60));
    }return times;
  }
  function suburbanRows(l,codes){
    const rows=[];for(const svc of l.services){const seq=sequence(l,svc),pos=seq.findIndex(s=>codes.has(s.code));if(pos<0)continue;
      const times=offsets(l,svc,seq),head=Number(svc.headway);if(!times||!(head>0))continue;
      const windows=svc.peakWindows?.length?svc.peakWindows:[{from:svc.firstDep,to:svc.lastDep}],seen=new Set();
      for(const w of windows){let start=min(w.from),end=min(w.to);if(!Number.isFinite(start)||!Number.isFinite(end))continue;if(end<start)end+=1440;
        for(let t=start;t<=end;t+=head){if(seen.has(t))continue;seen.add(t);rows.push({line:l,id:svc.id||l.id,description:svc.desc,seq,pos,dep:t+times[pos],times:times.map(x=>t+x)});}
      }
    }return rows;
  }
  function nativeRows(l,codes,E){
    const rows=[],seen=new Set();
    for(const station of l.stations.filter(s=>codes.has(s.code))){
      const trips=E.query({lines:['AX'],station:station.code,fromTime:'00:00',toTime:'48:00'});
      for(const t of trips){if(seen.has(t._uid))continue;seen.add(t._uid);
        const stops=Object.entries(t.stops),pos=stops.findIndex(([c])=>c===station.code);if(pos<0)continue;
        const seq=stops.map(([code])=>({code,name:AX_LINES.AX.ST[code]?.n||code}));
        rows.push({line:l,id:t.svcId,description:t.name,direction:t.direction,train:t.trainNumber,seq,pos,dep:min(t.stops[station.code].dep),times:stops.map(([,s])=>min(s.dep)),arrivals:stops.map(([,s])=>min(s.arr)),native:true});
      }
    }return rows;
  }
  function panel(){let p=document.getElementById('timetable-panel');if(!p){p=document.createElement('section');p.id='timetable-panel';p.style.cssText='margin:24px 0;padding:16px;background:#161616;border:1px solid #333;border-radius:6px';document.getElementById('results')?.after(p);if(!p.isConnected)document.body.append(p);}return p;}
  async function render(){
    const token=++revision,p=panel(),code=resolve(),codes=aliases(code),lines=entries().filter(l=>l.stations.some(s=>codes.has(s.code)));p.style.display='block';
    if(!lines.length){p.textContent='No timetable data available for '+code;return;}
    for(const l of lines)if(!filters.has(l.id))filters.set(l.id,true);
    let E,error='';
    if(lines.some(l=>l.native&&filters.get(l.id))){p.textContent='Loading AX timetable…';try{E=await engine();}catch(e){error=e.message;}if(token!==revision)return;}
    const rows=[];for(const l of lines)if(filters.get(l.id)){if(l.native){if(E)try{rows.push(...nativeRows(l,codes,E));}catch(e){error='AX: '+e.message;}}else rows.push(...suburbanRows(l,codes));}
    rows.sort((a,b)=>a.dep-b.dep||a.line.id.localeCompare(b.line.id));
    const name=lines.flatMap(l=>l.stations).find(s=>s.code===code)?.name||document.querySelector('#results .station-name')?.textContent||code;
    p.innerHTML=`<h2 style="font-size:1rem">${esc(name)}</h2><p style="color:#999">${esc([...codes].join(' · '))} — ${rows.length} departures</p>${error?`<p role="alert" style="color:#ff9800">${esc(error)} — AX unavailable; other lines remain visible.</p>`:''}<div><button type="button" data-all="true">All</button> <button type="button" data-all="false">None</button>${lines.map(l=>`<label style="display:inline-flex;gap:6px;padding:6px"><input type="checkbox" data-line="${esc(l.id)}" ${filters.get(l.id)?'checked':''}>${esc(l.id)}</label>`).join('')}</div><div id="tt-trips"></div>`;
    const target=p.querySelector('#tt-trips');let lastHour=null;
    for(const r of rows){const hour=Math.floor(r.dep/60);if(hour!==lastHour){const h=document.createElement('h3');h.style.cssText='font-size:.85rem;color:#999;margin:16px 0 8px';h.textContent=clock(hour*60)+'–'+clock((hour+1)*60);target.append(h);lastHour=hour;}
      const d=document.createElement('details');d.style.cssText='padding:5px 0;border-bottom:1px solid #252525';
      d.innerHTML=`<summary style="cursor:pointer"><span style="display:inline-block;min-width:55px">${esc(clock(r.dep))}</span> <span style="background:${/^#[0-9a-f]{3,8}$/i.test(r.line.color||'')?r.line.color:'#444'};color:#111;padding:2px 6px;border-radius:3px">${esc(r.line.id)}</span> ${r.id!==r.line.id?`<span style="color:#4fc3f7">${esc(r.id)}</span>`:''} ${esc(r.direction||'')} → ${esc(r.seq.at(-1).name||r.seq.at(-1).code)}${r.line.estimated?' <small>(estimated)</small>':''}</summary>`;
      d.addEventListener('toggle',()=>{if(!d.open||d.dataset.built)return;d.dataset.built='true';const body=document.createElement('div');body.style.cssText='padding:10px 12px;margin:6px 0 6px 16px;border-left:2px solid #666';const note=document.createElement('p');note.style.color='#999';note.textContent=(r.description||r.id)+(r.train?' · #'+r.train:'')+(r.native?' — native timetable':' — modelled stop times');body.append(note);
        r.seq.forEach((s,i)=>{const item=document.createElement('div');item.style.cssText='padding:4px 0;'+(i===r.pos?'color:#fff;font-weight:bold;background:#303030':i<r.pos?'color:#888':'color:#ccc');const time=r.native?'arr '+clock(r.arrivals[i])+' / dep '+clock(r.times[i]):clock(r.times[i]);item.textContent=time+'  '+(s.name||s.code)+' · '+s.code+(i===r.pos?' ← current station':i<r.pos?' · previous':' · next');body.append(item);});d.append(body);
      });target.append(d);
    }
    if(!rows.length)target.textContent='No departures match the selected relations.';
    p.querySelectorAll('input[data-line]').forEach(b=>b.addEventListener('change',()=>{filters.set(b.dataset.line,b.checked);render();}));p.querySelectorAll('button[data-all]').forEach(b=>b.addEventListener('click',()=>{lines.forEach(l=>filters.set(l.id,b.dataset.all==='true'));render();}));
  }
  function init(){const bar=document.getElementById('search-bar');if(!bar||document.getElementById('timetable-button'))return;const b=document.createElement('button');b.type='button';b.id='timetable-button';b.textContent='Timetable';b.addEventListener('click',render);bar.append(b);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

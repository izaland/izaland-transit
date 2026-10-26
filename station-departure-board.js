/* LCD view: consumes the same filtered rows as Debug; no timetable generation. */
(function(){
  'use strict';
  const platforms=new Map();
  let selected=new Date().getHours()*60+new Date().getMinutes();
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clock=t=>String(Math.floor(t/60)%24).padStart(2,'0')+':'+String(Math.floor(t)%60).padStart(2,'0');
  function direction(r){
    if(r.direction)return r.direction;
    const a=r.line.stations.findIndex(s=>s.code===r.seq[0].code),b=r.line.stations.findIndex(s=>s.code===r.seq.at(-1).code);
    return a<=b?'SB':'NB';
  }
  function resolvePlatform(stationKey,r){
    const dir=direction(r);
    const real=window.IZXDepartureBoard.platformResolver?.({stationKey,stationCode:r.seq[r.pos].code,lineId:r.line.id,direction:dir,trip:r});
    if(real!==undefined&&real!==null&&String(real)!=='')return {value:String(real),simulated:false};
    const key=stationKey+'|'+r.line.id;
    if(!platforms.has(key))platforms.set(key,new Map());
    const map=platforms.get(key);
    if(!map.has(dir)){
      const used=new Set(map.values()),available=Array.from({length:20},(_,i)=>i+1).filter(n=>!used.has(n));
      const value=available.length?available[Math.floor(Math.random()*available.length)]:21+map.size;
      map.set(dir,value);
    }
    return {value:String(map.get(dir)),simulated:true};
  }
  function mount(host,{rows,name,stationKey}){
    host.innerHTML='<div class="lcd-controls"><label>Simulation time <input type="time" data-time></label><label>Service day <select data-day><option value="0">Day 0</option><option value="1">Day +1 (after midnight)</option></select></label><button type="button" data-step="-5">−5 min</button><button type="button" data-step="5">+5 min</button><span>Fixed clock · simulated platforms · no live running data</span></div><section class="lcd-board" aria-label="Simulated station departures"><header><div><small>DEPARTURES / PARTENZE</small><h2></h2></div><time></time></header><div class="lcd-head"><span>Time</span><span>Line / service</span><span>Destination / calling at</span><span>In</span><span>Platform</span></div><div data-list></div><footer>SIMULATION — platform numbers are provisional. Estimated services are marked ≈.</footer></section>';
    host.querySelector('h2').textContent=name;
    const time=host.querySelector('[data-time]'),day=host.querySelector('[data-day]'),list=host.querySelector('[data-list]');
    function draw(){
      time.value=clock(selected);day.value=String(Math.floor(selected/1440));
      host.querySelector('time').textContent=clock(selected)+(selected>=1440?' +1d':'');
      const next=rows.filter(r=>r.pos<r.seq.length-1&&r.dep>=selected).slice(0,10);
      list.innerHTML=next.length?next.map(r=>{
        const platform=resolvePlatform(stationKey,r),stops=r.seq.slice(r.pos+1).map(s=>s.name||s.code).join(' · '),wait=Math.ceil(r.dep-selected);
        const color=/^#[0-9a-f]{3,8}$/i.test(r.line.color||'')?r.line.color:'#99bbff';
        return `<article class="lcd-row"><div class="lcd-dep">${clock(r.dep)}${r.dep>=1440?' <small>+1d</small>':''}</div><div><span class="lcd-badge" style="background:${color}">${esc(r.line.id)}</span><small>${esc(r.id!==r.line.id?r.id:'')} ${esc(direction(r))}${r.line.estimated?' ≈':''}</small></div><div class="lcd-destination"><strong>${esc(r.seq.at(-1).name||r.seq.at(-1).code)}</strong><div class="lcd-marquee" tabindex="0" aria-label="Calling at: ${esc(stops)}"><span>Calling at: ${esc(stops)}</span></div></div><div class="lcd-wait">${wait===0?'Now':wait+' min'}</div><div class="lcd-platform" title="${platform.simulated?'Simulated platform':'Registered platform'}">${esc(platform.value)}${platform.simulated?'<small>*</small>':''}</div></article>`;
      }).join(''):'<p class="lcd-empty">No further departures in the loaded service day. Choose an earlier time or adjust the line filters.</p>';
      host.querySelectorAll('.lcd-marquee').forEach(el=>{
        const span=el.firstElementChild;
        const overflow=span.scrollWidth-el.clientWidth;
        if(overflow>0){el.style.setProperty('--travel',(-overflow)+'px');el.style.setProperty('--duration',Math.max(12,overflow/35)+'s');el.classList.add('lcd-scroll');}
      });
    }
    function read(){if(!time.value)return;const [h,m]=time.value.split(':').map(Number);selected=Number(day.value)*1440+h*60+m;draw();}
    time.addEventListener('change',read);day.addEventListener('change',read);
    host.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{selected=Math.max(0,Math.min(2879,selected+Number(b.dataset.step)));draw();}));
    draw();
  }
  window.IZXDepartureBoard={mount,resolvePlatform,platformResolver:null};
})();

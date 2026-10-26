/* LCD view: shared timetable rows, bilingual names, stable simulated platforms. */
(function(){
  'use strict';
  const platforms=new Map();
  let selected=new Date().getHours()*60+new Date().getMinutes();
  let languageMode='auto',active='en',interval=10,dispose=null;
  const english={departures:'DEPARTURES',time:'Time',service:'Line / service',destination:'Destination / calling at',in:'In',platform:'Platform',calling:'Calling at',now:'Now',minutes:'min',footer:'SIMULATION — platform numbers are provisional. Estimated services are marked ≈.'};
  const clock=t=>String(Math.floor(t/60)%24).padStart(2,'0')+':'+String(Math.floor(t)%60).padStart(2,'0');
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function direction(r){if(r.direction)return r.direction;const a=r.line.stations.findIndex(s=>s.code===r.seq[0].code),b=r.line.stations.findIndex(s=>s.code===r.seq.at(-1).code);return a<=b?'SB':'NB';}
  function resolvePlatform(stationKey,r){
    const dir=direction(r),real=window.IZXDepartureBoard.platformResolver?.({stationKey,stationCode:r.seq[r.pos].code,lineId:r.line.id,direction:dir,trip:r});
    if(real!==undefined&&real!==null&&String(real)!=='')return {value:String(real),simulated:false};
    const key=stationKey+'|'+r.line.id;if(!platforms.has(key))platforms.set(key,new Map());const map=platforms.get(key);
    if(!map.has(dir)){const used=new Set(map.values()),available=Array.from({length:20},(_,i)=>i+1).filter(n=>!used.has(n));map.set(dir,available.length?available[Math.floor(Math.random()*available.length)]:21+map.size);}
    return {value:String(map.get(dir)),simulated:true};
  }
  function mount(host,{rows,name,stationKey}){
    if(dispose)dispose();
    let timer=null,dead=false,visibleRows=[];
    const names=new Map();
    function add(code,s){if(!s)return;const old=names.get(code)||{};const native=s.kanji||s.k||old.iz||'';names.set(code,{en:s.name||s.n||old.en||code,iz:native==='—'?old.iz||'':native});}
    if(typeof ALL_STATIONS!=='undefined')for(const s of ALL_STATIONS)add(s.code,s);
    for(const r of rows){for(const s of r.line.stations||[])add(s.code,s);for(const s of r.seq)add(s.code,s);}
    if(typeof AX_LINES!=='undefined')for(const l of Object.values(AX_LINES))for(const [code,s]of Object.entries(l.ST||{}))add(code,s);
    const stationCodes=stationKey.split('|');
    const stationIz=stationCodes.map(c=>names.get(c)?.iz).find(Boolean)||name;
    function stationName(s,lang){const n=names.get(s.code);return lang==='iz'?(n?.iz||s.kanji||s.k||s.name||n?.en||s.code):(s.name||n?.en||s.code);}
    function label(key,lang=active){return (lang==='iz'?window.IZXDepartureBoard.labels?.iz?.[key]:null)||english[key]||key;}
    host.innerHTML='<div class="lcd-controls"><label>Simulation time <input type="time" data-time></label><label>Service day <select data-day><option value="0">Day 0</option><option value="1">Day +1 (after midnight)</option></select></label><button type="button" data-step="-5">−5 min</button><button type="button" data-step="5">+5 min</button><label>Language <select data-language><option value="auto">Auto</option><option value="en">English</option><option value="iz">Izaki</option></select></label><label>Switch every <input type="number" data-interval min="5" max="60" step="1" style="width:65px"> s</label><span data-status></span><span>Fixed clock · simulated platforms · no live running data</span></div><section class="lcd-board" aria-label="Simulated station departures"><header><div><small data-label="departures"></small><h2></h2></div><time></time></header><div class="lcd-head"><span data-label="time"></span><span data-label="service"></span><span data-label="destination"></span><span data-label="in"></span><span data-label="platform"></span></div><div data-list></div><footer data-label="footer"></footer></section>';
    const time=host.querySelector('[data-time]'),day=host.querySelector('[data-day]'),list=host.querySelector('[data-list]'),language=host.querySelector('[data-language]'),seconds=host.querySelector('[data-interval]');
    language.value=languageMode;seconds.value=interval;
    function marquee(el,r,lang){
      const stops=r.seq.slice(r.pos+1).map(s=>stationName(s,lang)).join(' · '),span=el.firstElementChild;
      el.classList.remove('lcd-scroll');span.style.animation='none';
      span.textContent=label('calling',lang)+': '+stops;el.setAttribute('aria-label',label('calling',lang)+': '+stops);el.dataset.language=lang;
      const overflow=span.scrollWidth-el.clientWidth;
      void span.offsetWidth;span.style.animation='';
      if(overflow>0){el.style.setProperty('--travel',(-overflow)+'px');el.style.setProperty('--duration',Math.max(12,overflow/35)+'s');el.classList.add('lcd-scroll');}
    }
    function applyLanguage(force=false){
      host.querySelector('h2').textContent=active==='iz'?stationIz:name;
      host.querySelectorAll('[data-label]').forEach(el=>{el.textContent=label(el.dataset.label);});
      host.querySelector('[data-status]').textContent=(languageMode==='auto'?'Auto · ':'')+(active==='iz'?'Izaki':'English')+' · missing translations use English';
      list.querySelectorAll('.lcd-row').forEach((el,i)=>{
        const r=visibleRows[i];el.querySelector('.lcd-destination strong').textContent=stationName(r.seq.at(-1),active);
        const wait=Math.ceil(r.dep-selected);el.querySelector('.lcd-wait').textContent=wait===0?label('now'):wait+' '+label('minutes');
        const m=el.querySelector('.lcd-marquee');if(force||!m.classList.contains('lcd-scroll'))marquee(m,r,active);
      });
    }
    function draw(){
      time.value=clock(selected);day.value=String(Math.floor(selected/1440));host.querySelector('time').textContent=clock(selected)+(selected>=1440?' +1d':'');
      visibleRows=rows.filter(r=>r.pos<r.seq.length-1&&r.dep>=selected).slice(0,10);
      list.innerHTML=visibleRows.length?visibleRows.map(r=>{
        const platform=resolvePlatform(stationKey,r),color=/^#[0-9a-f]{3,8}$/i.test(r.line.color||'')?r.line.color:'#99bbff';
        return `<article class="lcd-row"><div class="lcd-dep">${clock(r.dep)}${r.dep>=1440?' <small>+1d</small>':''}</div><div><span class="lcd-badge" style="background:${color}">${esc(r.line.id)}</span><small>${esc(r.id!==r.line.id?r.id:'')} ${esc(direction(r))}${r.line.estimated?' ≈':''}</small></div><div class="lcd-destination"><strong></strong><div class="lcd-marquee" tabindex="0"><span></span></div></div><div class="lcd-wait"></div><div class="lcd-platform" title="${platform.simulated?'Simulated platform':'Registered platform'}">${esc(platform.value)}${platform.simulated?'<small>*</small>':''}</div></article>`;
      }).join(''):'<p class="lcd-empty">No further departures in the loaded service day. Choose an earlier time or adjust the line filters.</p>';
      applyLanguage(true);
      list.querySelectorAll('.lcd-marquee').forEach((el,i)=>el.firstElementChild.addEventListener('animationiteration',event=>{
        if(event.animationName!=='lcd-stops')return;
        /* Alternate animation returns to its initial position every second iteration. */
        const turns=Number(el.dataset.turns||0)+1;el.dataset.turns=String(turns);
        if(turns%2===0&&el.dataset.language!==active){el.dataset.turns='0';marquee(el,visibleRows[i],active);}
      }));
    }
    function isVisible(){return host.isConnected&&!document.hidden&&!host.closest('[hidden]')&&host.getClientRects().length>0;}
    function schedule(){
      if(timer!==null){clearTimeout(timer);timer=null;}
      if(dead||languageMode!=='auto'||!isVisible())return;
      timer=setTimeout(()=>{timer=null;if(!isVisible()){schedule();return;}active=active==='en'?'iz':'en';applyLanguage();schedule();},interval*1000);
    }
    function read(){if(!time.value)return;const [h,m]=time.value.split(':').map(Number);selected=Number(day.value)*1440+h*60+m;draw();}
    time.addEventListener('change',read);day.addEventListener('change',read);
    host.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{selected=Math.max(0,Math.min(2879,selected+Number(b.dataset.step)));draw();}));
    language.addEventListener('change',()=>{languageMode=language.value;if(languageMode!=='auto')active=languageMode;applyLanguage(true);schedule();});
    seconds.addEventListener('change',()=>{const v=Number(seconds.value);interval=Number.isFinite(v)?Math.max(5,Math.min(60,Math.round(v))):10;seconds.value=interval;schedule();});
    const observer=new MutationObserver(()=>{if(!host.isConnected){cleanup();return;}if(!isVisible()){if(timer!==null){clearTimeout(timer);timer=null;}}else if(timer===null)schedule();});
    function visibility(){schedule();}
    function resize(){list.querySelectorAll('.lcd-marquee').forEach((el,i)=>marquee(el,visibleRows[i],active));}
    function cleanup(){if(dead)return;dead=true;if(timer!==null)clearTimeout(timer);observer.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);if(dispose===cleanup)dispose=null;}
    dispose=cleanup;
    draw();observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',resize);schedule();
  }
  window.IZXDepartureBoard={mount,resolvePlatform,platformResolver:null,labels:{iz:{}}};
})();

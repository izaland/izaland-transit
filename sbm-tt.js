/* ================================================================
   SBM-TT.JS — Shinsabu Main Line · Integrated timetable
   ================================================================
   Every M20 service continues onto SBM as one physical train.
   Its service category may change at Sainðaul Central:
     M20 Local/Express -> SBM Local/Rapid/Express.
   All such continuations are through journeys: passengers stay on board.

   SBM profile: 90 km/h, 45 s intermediate dwell, 7% running margin.
   M20 retains its own high-performance profile.
   Border dwell at Sainðaul Central: 90 seconds.

   Rapid stops: SBM01 04 07 10 12 13 15 19 21 23 27.
   Express stops: SBM01 04 12 13 19 23 27.
================================================================ */
(function(root){
'use strict';
if(root.SBMLocalTimetable)return;
const api={trips:[],services:[],ready:false,error:null};root.SBMLocalTimetable=api;
const sec=x=>{const [h,m]=x.split(':').map(Number);return h*3600+m*60;};
const hm=x=>{const m=Math.floor(x/60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
function init(){
if(api.ready)return;
if(typeof SBO_LINES==='undefined'||!SBO_LINES.SBM||typeof M20_ST==='undefined'||typeof M20_HEADWAY_LO==='undefined'||typeof M20_HEADWAY_EX==='undefined'||typeof M20_KIN==='undefined'){api.error='SBM needs sbo-data.js and metro/m20-data.js';console.warn(api.error);return;}
const line=SBO_LINES.SBM,kin=M20_KIN.LO,exKin=M20_KIN.EX,stopSec=90;
const SBM_KIN={vmaxKmh:90,accel:kin.accel,decel:kin.decel,dwellSec:45,runningTimeMargin:0.07};
const RAPID_STOPS=new Set(['SBM01','SBM04','SBM07','SBM10','SBM12','SBM13','SBM15','SBM19','SBM21','SBM23','SBM27']);
const EXPRESS_STOPS=new Set(['SBM01','SBM04','SBM12','SBM13','SBM19','SBM23','SBM27']);
const sb=line.stations.map(s=>({...s,lineId:'SBM',network:'suburban',color:line.color}));
const metro=M20_CANONICAL_ORDER.map(code=>({code,name:M20_ST[code].n,kanji:M20_ST[code].k,km:M20_ST[code].km,lineId:'M20',network:'metro',color:'#0F1F5C'}));
function hop(a,b,p){const d=Math.abs(b.km-a.km)*1000,v=p.vmaxKmh/3.6,acc=p.accel,dec=p.decel;if(!d)return 0;const peak=Math.min(v,Math.sqrt(2*d*acc*dec/(acc+dec)));return (peak/acc+peak/dec+Math.max(0,d-peak*peak/(2*acc)-peak*peak/(2*dec))/peak)*(1+(p.runningTimeMargin||0));}
function timeline(seq,start,m20Kind,sbmKind){let t=start;const out=[];for(let i=0;i<seq.length;i++){const s=seq[i];if(i){const prev=seq[i-1];const profile=s.lineId==='SBM'?SBM_KIN:(m20Kind==='EX'?exKin:kin);t+=s.lineId!==prev.lineId?stopSec:hop(prev,s,profile);}const arr=t;if(i&&i<seq.length-1&&seq[i-1].lineId===s.lineId&&seq[i+1].lineId===s.lineId){const profile=s.lineId==='SBM'?SBM_KIN:(m20Kind==='EX'?exKin:kin);t+=profile.dwellSec??30;}out.push({...s,arr:Math.round(arr),dep:Math.round(t)});}
return out;}
function add(id,seq,start,m20Kind,sbmKind){if(start<sec('04:30'))return;api.trips.push({id,m20Kind,sbmKind,stops:timeline(seq,start,m20Kind,sbmKind)});}
function grid(headways,offset=0){const out=[];for(const w of headways){const h=w.headwayMin*60,s=sec(w.from),e=sec(w.to);for(let t=s+((offset-s)%h+h)%h;t<e;t+=h)out.push(t);}return [...new Set(out)].sort((a,b)=>a-b);}
const localGrid=grid(M20_HEADWAY_LO),expressGrid=grid(M20_HEADWAY_EX,sec('00:05'));
const south=[...metro].reverse().concat(sb),north=[...sb].reverse().concat(metro);
const northOffset=timeline(north,0,'LO','LO').find(s=>s.code==='M2001').dep;
const southRapid=[...metro].reverse().concat(sb.filter(s=>RAPID_STOPS.has(s.code)));
const northRapid=[...southRapid].reverse();
const southExpress=[...metro].reverse().filter(s=>M20_EXPRESS_STOPS.includes(s.code)).concat(sb.filter(s=>EXPRESS_STOPS.has(s.code)));
const northExpress=[...southExpress].reverse();
const lastThree=localGrid.slice(-3);
for(const t of localGrid){
const isSbo=(Math.round((t-sec('05:30'))/60)%10===0);
const sbmKind=isSbo?'LO':(t%1800===300?'RAPID':'LO');
const southSeq=sbmKind==='RAPID'?southRapid:south;
const northSeq=sbmKind==='RAPID'?northRapid:north;
if(!lastThree.includes(t)){
add('M20_SBM_S_'+t,southSeq,t,'LO',sbmKind);add('M20_SBM_N_'+t,northSeq,t-northOffset,'LO',sbmKind);}
else{add('M20_TERMINATING_S_'+t,[...metro].reverse(),t,'LO','LO');add('M20_TERMINATING_N_'+t,metro,t-northOffset,'LO','LO');}
}
for(const t of expressGrid){
const sbmKind=(t%1800===300)?'EX':'RAPID';
const southSeq=sbmKind==='EX'?southExpress:southRapid;
const northSeq=sbmKind==='EX'?northExpress:northRapid;
add('M20_SBM_S_'+t,southSeq,t,'EX',sbmKind);add('M20_SBM_N_'+t,northSeq,t,'EX',sbmKind);
}
const rapidOnly=[];for(const w of M20_HEADWAY_LO){const h=900,s=sec(w.from),e=sec(w.to);for(let t=s;t<e;t+=h)rapidOnly.push(t);}
for(const t of rapidOnly){if(!localGrid.includes(t)){add('M20_SBM_RAPID_S_'+t,southRapid,t,'LO','RAPID');add('M20_SBM_RAPID_N_'+t,northRapid,t-northOffset,'LO','RAPID');}}
api.trips.sort((a,b)=>a.stops[0].dep-b.stops[0].dep);
function serviceMeta(t){const stops=t.stops,first=stops[0],last=stops.at(-1);const m20Name=t.m20Kind==='EX'?'Express — Metro Line 20':'Local — Metro Line 20';const sbmName=t.sbmKind==='EX'?'SB Express':(t.sbmKind==='RAPID'?'SB Rapid':'SB Local');return {id:t.id,desc:m20Name+' → '+sbmName,fromCode:first.code,toCode:last.code,firstDep:hm(first.dep),lastDep:hm(first.dep),headway:1,explicitDir:true,vMaxKmh:t.sbmKind==='EX'?exKin.vmaxKmh:SBM_KIN.vmaxKmh,dwellSec:t.sbmKind==='EX'?exKin.dwellSec:SBM_KIN.dwellSec,stops:stops.map(s=>s.code),m20Kind:t.m20Kind,sbmKind:t.sbmKind,thruService:true,tripId:t.id};}
api.services=api.trips.map(serviceMeta);line.services=api.services;root.SBM_TT_SERVICES=api.services;
if(typeof SuburbanRouter!=='undefined')SuburbanRouter.register({lineId:'SBM',meta:{name:line.name,color:line.color,cls:'suburban'},stations:line.stations,services:api.services,interchange:Object.fromEntries(Object.entries(SUBURBAN_INTERCHANGE).filter(([c])=>c.startsWith('SBM')))});
const list=x=>(Array.isArray(x)?x:String(x||'').split(',')).map(c=>String(c).trim());
function make(t,a,b){const stops=t.stops.slice(a,b+1),legs=[];let start=0;
function leg(f,l){const part=stops.slice(f,l+1),first=part[0],last=part.at(-1);const isM20=first.lineId==='M20';const kind=isM20?t.m20Kind:t.sbmKind;const kindName=kind==='EX'?'Express':(kind==='RAPID'?'Rapid':'Local');return {lineId:first.lineId,network:first.network,color:first.color,svcId:isM20?'M20':t.id,svcLogical:isM20?(kind==='EX'?'EX_'+(first.code>last.code?'S':'N'):(first.code>last.code?'LO_S':'LO_N')):'SB',svcName:isM20?(kind==='EX'?'Express — Metro Line 20':'Local — Metro Line 20'):(kind==='EX'?'SB Express':(kind==='RAPID'?'SB Rapid':'SB Local')),svcDesc:kindName,trainNumber:null,tripId:t.id,boardCode:first.code,boardName:first.name,boardDep:hm(first.dep),boardDepSec:first.dep,alightCode:last.code,alightName:last.name,alightArr:hm(last.arr),alightArrSec:last.arr,km:Math.abs(last.km-first.km),intermediateStops:part.slice(1,-1).map(s=>({code:s.code,name:s.name,arr:hm(s.arr),dep:hm(s.dep)}))};}
for(let i=1;i<stops.length;i++)if(stops[i].lineId!==stops[i-1].lineId){if(i-1>start)legs.push(leg(start,i-1));start=i;}
if(stops.length-1>start)legs.push(leg(start,stops.length-1));
if(!legs.length)return null;
return {legs,departureTime:legs[0].boardDep,arrivalTime:legs.at(-1).alightArr,totalMinutes:Math.round((stops.at(-1).arr-stops[0].dep)/60),totalKm:legs.reduce((sum,l)=>sum+l.km,0),transfers:0,transferNodes:[],transferThru:[],transferWalkMin:[],transferWaitMin:[],thruService:true};}
function search(from,to,time,opts={}){let earliest=sec(time);if(earliest<sec('04:30'))earliest+=86400;const result=[],froms=list(from),tos=list(to);
for(const t of api.trips){for(const f of froms)for(const dest of tos){const a=t.stops.findIndex(s=>s.code===f),b=t.stops.findIndex(s=>s.code===dest);if(a<0||b<=a)continue;if(t.stops[a].dep<earliest||t.stops[a].dep>earliest+10800)continue;const j=make(t,a,b);if(j)result.push(j);}}
const seen=new Set();return result.filter(j=>{const k=j.legs.map(l=>l.tripId+':'+l.boardCode+':'+l.alightCode).join('|');if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>a.legs.at(-1).alightArrSec-b.legs.at(-1).alightArrSec).slice(0,opts.maxResults??8);}
api.search=search;
if(typeof SuburbanRouter!=='undefined'&&!SuburbanRouter.__sbmLocalPatched){const original=SuburbanRouter.search.bind(SuburbanRouter);SuburbanRouter.search=function(from,to,time,opts){const usesSBM=list(from).some(c=>/^SBM\d+$/.test(c))||list(to).some(c=>/^SBM\d+$/.test(c));return usesSBM?search(from,to,time,opts):original(from,to,time,opts);};SuburbanRouter.__sbmLocalPatched=true;}
const R=root.IZXUnifiedRouter;
if(R&&!R.__sbmLocalPatched){const original=R.search.bind(R);R.search=function(from,to,time,opts={}){const mixed=(list(from).some(c=>/^M20\d+$/.test(c))&&list(to).some(c=>/^SBM\d+$/.test(c)))||(list(from).some(c=>/^SBM\d+$/.test(c))&&list(to).some(c=>/^M20\d+$/.test(c)));const extra=search(from,to,time,opts);if(mixed)return extra.slice(0,opts.maxResults??5);const existing=original(from,to,time,opts)||[];const merged=typeof R.dedup==='function'?R.dedup([...existing,...extra]):[...existing,...extra];return merged.slice(0,opts.maxResults??5);};R.__sbmLocalPatched=true;}
api.ready=true;api.error=null;
}
api.init=init;
if(typeof document!=='undefined'&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(typeof globalThis!=='undefined'?globalThis:window);

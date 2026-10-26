/* SBM Local timetable and explicit Local-only M20 through journeys.
   Requires sbo-data.js and M20 data. Loaded by sbo-tt.js.
   SBM uses its own historic-railway operating profile, separate from M20.
   Provisional SBM profile: 90 km/h, 45 s intermediate stops, 7% running-time
   margin. M20 retains its own high-performance profile.
   Border dwell at Sainðaul Central: 90 s.
   All times remain absolute service-day seconds, including 25:xx.
   M20 Express is never part of a through trip generated here.
   Independent trains: 10 min before/after the through coverage.
   Southbound 25:15/25/35/45 end at SBM15; northbound independent
   trains remain full length until 25:45 (no new short-turn NB assumed).
   This module provides exact direct/through results. Existing generic
   multi-change searches remain the responsibility of the original routers. */
(function(root){
'use strict';
if(root.SBMLocalTimetable)return;
const api={trips:[],services:[],ready:false,error:null};root.SBMLocalTimetable=api;
const sec=x=>{const [h,m]=x.split(':').map(Number);return h*3600+m*60;};
const hm=x=>{const m=Math.floor(x/60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
function init(){
if(api.ready)return;
if(typeof SBO_LINES==='undefined'||!SBO_LINES.SBM||typeof M20_ST==='undefined'||typeof M20_HEADWAY_LO==='undefined'||typeof M20_KIN==='undefined'){api.error='SBM needs sbo-data.js and metro/m20-data.js';console.warn(api.error);return;}
const line=SBO_LINES.SBM,kin=M20_KIN.LO,stopSec=90;
const SBM_KIN={vmaxKmh:90,accel:kin.accel,decel:kin.decel,dwellSec:45,runningTimeMargin:0.07};
const sb=line.stations.map(s=>({...s,lineId:'SBM',network:'suburban',color:line.color}));
const metro=M20_CANONICAL_ORDER.map(code=>({code,name:M20_ST[code].n,kanji:M20_ST[code].k,km:M20_ST[code].km,lineId:'M20',network:'metro',color:'#0F1F5C'}));
function hop(a,b,profile){const d=Math.abs(b.km-a.km)*1000,v=profile.vmaxKmh/3.6,acc=profile.accel,dec=profile.decel;if(!d)return 0;const p=Math.min(v,Math.sqrt(2*d*acc*dec/(acc+dec)));return (p/acc+p/dec+Math.max(0,d-p*p/(2*acc)-p*p/(2*dec))/p)*(profile.runningTimeMargin||0);}
function timeline(seq,start){let t=start;return seq.map((s,i)=>{if(i)t+=s.lineId!==seq[i-1].lineId?stopSec:hop(seq[i-1],s,s.lineId==='SBM'?SBM_KIN:kin);const arr=t;if(i>0&&i<seq.length-1&&seq[i-1].lineId===s.lineId&&seq[i+1].lineId===s.lineId)t+=(s.lineId==='SBM'?SBM_KIN:kin).dwellSec??30;return {...s,arr:Math.round(arr),dep:Math.round(t)};});}
function add(id,seq,start,through){if(start<sec('04:30'))return;const stops=timeline(seq,start);api.trips.push({id,through,stops});}
function departures(){const set=new Set();for(const w of M20_HEADWAY_LO){const h=w.headwayMin*60;for(let t=Math.ceil(sec(w.from)/h)*h;t<sec(w.to);t+=h)set.add(t);}return [...set].sort((a,b)=>a-b);}
const grid=departures(),south=[...metro].reverse().concat(sb),north=[...sb].reverse().concat(metro);
const northOffset=timeline(north,0).find(s=>s.code==='M2001').dep;
for(const t of grid){add('SBM_LO_FROM_M20_'+t,south,t,true);add('SBM_LO_TO_M20_'+t,north,t-northOffset,true);}
function originCoverage(code){return api.trips.filter(t=>t.through).map(t=>t.stops.find(s=>s.code===code)?.dep).filter(Number.isFinite).sort((a,b)=>a-b);}
function fill(seq,code,lateShort){const coverage=originCoverage(code),first=coverage[0]??Infinity,last=coverage.at(-1)??-Infinity;
for(let t=sec('04:30');t<first&&t<=sec('25:05');t+=600)add('SBM_LO_AUTO_'+code+'_'+t,seq,t,false);
if(Number.isFinite(last))for(let t=Math.ceil((last+1)/600)*600;t<=sec(lateShort?'25:05':'25:45');t+=600)add('SBM_LO_AUTO_'+code+'_'+t,seq,t,false);
if(lateShort)for(let t=sec('25:15');t<=sec('25:45');t+=600)add('SBM_LO_SHORT_'+t,sb.slice(0,15),t,false);
}
fill(sb,'SBM01',true);fill([...sb].reverse(),'SBM27',false);
api.trips.sort((a,b)=>a.stops[0].dep-b.stops[0].dep);
api.services=api.trips.map(t=>{const stops=t.stops.filter(s=>s.lineId==='SBM'),first=stops[0];return {id:t.id,desc:'Local'+(t.through?' thru M20 (Local only)':''),fromCode:first.code,toCode:stops.at(-1).code,firstDep:hm(Math.ceil(first.dep/60)*60),lastDep:hm(Math.ceil(first.dep/60)*60),headway:1,explicitDir:true,vMaxKmh:SBM_KIN.vmaxKmh,accelKmhPerSec:SBM_KIN.accel*3.6,decelKmhPerSec:SBM_KIN.decel*3.6,dwellSec:SBM_KIN.dwellSec,runningTimeMargin:SBM_KIN.runningTimeMargin,stops:stops.map(s=>s.code),thruService:t.through,tripId:t.id};});
line.services=api.services;root.SBM_TT_SERVICES=api.services;
if(typeof SuburbanRouter!=='undefined')SuburbanRouter.register({lineId:'SBM',meta:{name:line.name,color:line.color,cls:'suburban'},stations:line.stations,services:api.services,interchange:Object.fromEntries(Object.entries(SUBURBAN_INTERCHANGE).filter(([c])=>c.startsWith('SBM')))});
const list=x=>(Array.isArray(x)?x:String(x||'').split(',')).map(c=>String(c).trim());
function make(t,a,b){const stops=t.stops.slice(a,b+1),legs=[];let start=0;
function leg(f,l){const part=stops.slice(f,l+1),first=part[0],last=part.at(-1);return {lineId:first.lineId,network:first.network,color:first.color,svcId:first.lineId==='M20'?'M20':t.id,svcLogical:first.lineId==='M20'?(first.code>last.code?'LO_S':'LO_N'):'SBM',svcName:first.lineId==='M20'?'Local — Metro Line 20':'Local — Shinsabu Main Line',svcDesc:'Local',trainNumber:null,tripId:t.id,boardCode:first.code,boardName:first.name,boardDep:hm(first.dep),boardDepSec:first.dep,alightCode:last.code,alightName:last.name,alightArr:hm(last.arr),alightArrSec:last.arr,km:Math.abs(last.km-first.km),intermediateStops:part.slice(1,-1).map(s=>({code:s.code,name:s.name,arr:hm(s.arr),dep:hm(s.dep)}))};}
for(let i=1;i<stops.length;i++)if(stops[i].lineId!==stops[i-1].lineId){if(i-1>start)legs.push(leg(start,i-1));start=i;}
if(stops.length-1>start)legs.push(leg(start,stops.length-1));
if(!legs.length)return null;const thru=legs.length===2;
return {legs,departureTime:legs[0].boardDep,arrivalTime:legs.at(-1).alightArr,totalMinutes:Math.round((stops.at(-1).arr-stops[0].dep)/60),totalKm:legs.reduce((sum,l)=>sum+l.km,0),transfers:0,transferNodes:thru?['SBM01']:[],transferThru:thru?[true]:[],transferWalkMin:thru?[0]:[],transferWaitMin:thru?[0]:[],thruService:thru,thruNode:thru?'SBM01':undefined};
}
function search(from,to,time,opts={}){let earliest=sec(time);if(earliest<sec('04:30'))earliest+=86400;const result=[],froms=list(from),tos=list(to);
const allowed=opts.networks?[].concat(opts.networks).map(x=>String(x).toUpperCase()):null;
for(const t of api.trips){for(const f of froms)for(const dest of tos){const a=t.stops.findIndex(s=>s.code===f),b=t.stops.findIndex(s=>s.code===dest);if(a<0||b<=a)continue;const part=t.stops.slice(a,b+1);if(!part.some(s=>s.lineId==='SBM'))continue;if(t.stops[a].dep<earliest||t.stops[a].dep>earliest+10800)continue;
if(allowed&&part.some(s=>!allowed.includes(s.lineId)&&!allowed.includes(s.network==='metro'?'METRO':'SUB')))continue;
if(opts.lines&&opts.lines!=='ALL'&&part.some(s=>![].concat(opts.lines).includes(s.lineId)))continue;
const j=make(t,a,b);if(j)result.push(j);
}}
const seen=new Set();return result.filter(j=>{const k=j.legs.map(l=>l.tripId+':'+l.boardCode+':'+l.alightCode).join('|');if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>a.legs.at(-1).alightArrSec-b.legs.at(-1).alightArrSec).slice(0,opts.maxResults??8);
}
api.search=search;
if(typeof SuburbanRouter!=='undefined'&&!SuburbanRouter.__sbmLocalPatched){const original=SuburbanRouter.search.bind(SuburbanRouter);SuburbanRouter.search=function(from,to,time,opts){const both=list(from).every(c=>/^SBM\d+$/.test(c))&&list(to).every(c=>/^SBM\d+$/.test(c));return both?search(from,to,time,opts):original(from,to,time,opts);};SuburbanRouter.__sbmLocalPatched=true;}
const R=root.IZXUnifiedRouter;
if(R&&!R.__sbmLocalPatched){const original=R.search.bind(R);R.search=function(from,to,time,opts={}){const existing=original(from,to,time,opts)||[],extra=search(from,to,time,opts);const merged=typeof R.dedup==='function'?R.dedup([...existing,...extra]):[...existing,...extra];return merged.slice(0,opts.maxResults??5);};R.__sbmLocalPatched=true;}
api.ready=true;api.error=null;
}
api.init=init;
if(typeof document!=='undefined'&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(typeof globalThis!=='undefined'?globalThis:window);

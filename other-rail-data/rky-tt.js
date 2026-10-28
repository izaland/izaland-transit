/* ================================================================
   RKY-TT.JS — Rinkyun Railway Main Line · Integrated timetable
   臨急鉄道本線
   ================================================================
   Ogni servizio M20 (Local ed Express) prosegue sulla RKY come
   unico treno fisico:
     M2001 → … → M2007 (Sakamuso) → RKY01 → … → RKY14
   Sosta di confine a Sakamuso: 90 secondi.

   Dipende da: rky-data.js, metro/m20-data.js
   Nota: il Local RKY standalone è stato rimosso: il servizio RKY
   è la prosecuzione della M20. Futuri Rapid RKY: da aggiungere qui.
================================================================ */
(function(root){
'use strict';
if(root.RKYLocalTimetable)return;
const api={trips:[],services:[],ready:false,error:null};root.RKYLocalTimetable=api;
const sec=x=>{const[h,m]=x.split(':').map(Number);return h*3600+m*60;};
const hm=x=>{const m=Math.floor(x/60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60);};
function init(){
if(api.ready)return;
if(typeof RKY_LINES==='undefined'||typeof M20_ST==='undefined'||typeof M20_CANONICAL_ORDER==='undefined'||typeof M20_HEADWAY_LO==='undefined'||typeof M20_HEADWAY_EX==='undefined'||typeof M20_KIN==='undefined'||typeof M20_EXPRESS_STOPS==='undefined'){api.error='RKY needs rky-data.js and metro/m20-data.js';console.warn(api.error);return;}
const line=RKY_LINES.RKY,kin=M20_KIN.LO,exKin=M20_KIN.EX,stopSec=90;
const RKY_KIN={vmaxKmh:100,accel:kin.accel,decel:kin.decel,dwellSec:45,runningTimeMargin:0.07};
const rk=line.stations.map(s=>({...s,lineId:'RKY',network:'suburban',color:line.color}));
const metro=M20_CANONICAL_ORDER.map(code=>({code,name:M20_ST[code].n,kanji:M20_ST[code].k,km:M20_ST[code].km,lineId:'M20',network:'metro',color:'#0F1F5C'}));
function hop(a,b,p){const d=Math.abs(b.km-a.km)*1000,v=p.vmaxKmh/3.6,acc=p.accel,dec=p.decel;if(!d)return 0;const peak=Math.min(v,Math.sqrt(2*d*acc*dec/(acc+dec)));return (peak/acc+peak/dec+Math.max(0,d-peak*peak/(2*acc)-peak*peak/(2*dec))/peak)*(1+(p.runningTimeMargin||0));}
function timeline(seq,start,m20Kind,rkyKind){let t=start;const out=[];for(let i=0;i<seq.length;i++){const s=seq[i];if(i){const prev=seq[i-1];const profile=s.lineId==='M20'?(m20Kind==='EX'?exKin:kin):RKY_KIN;t+=s.lineId!==prev.lineId?stopSec:hop(prev,s,profile);}const arr=t;if(i&&i<seq.length-1&&seq[i-1].lineId===s.lineId&&seq[i+1].lineId===s.lineId){const profile=s.lineId==='M20'?(m20Kind==='EX'?exKin:kin):RKY_KIN;t+=profile.dwellSec??30;}out.push({...s,arr:Math.round(arr),dep:Math.round(t)});}
return out;}
function add(id,seq,start,m20Kind,rkyKind){if(start<sec('04:30'))return;api.trips.push({id,m20Kind,rkyKind,stops:timeline(seq,start,m20Kind,rkyKind)});}
function grid(headways,offset=0){const out=[];for(const w of headways){const h=w.headwayMin*60,s=sec(w.from),e=sec(w.to);for(let t=s+((offset-s)%h+h)%h;t<e;t+=h)out.push(t);}return [...new Set(out)].sort((a,b)=>a-b);}
const localGrid=grid(M20_HEADWAY_LO),expressGrid=grid(M20_HEADWAY_EX,sec('00:05'));
const east=[...metro,...rk];
const west=[...rk].reverse().concat([...metro].reverse());
const westOffset=timeline(west,0,'LO','LO').find(s=>s.code==='M2001').dep;
const EX_RKY_STOPS=['RKY01','RKY14'];
const eastExpress=metro.filter(s=>M20_EXPRESS_STOPS.includes(s.code)).concat(rk.filter(s=>EX_RKY_STOPS.includes(s.code)));
const westExpress=[...eastExpress].reverse();
for(const t of localGrid){
add('M20_RKY_E_'+t,east,t,'LO','LO');
add('M20_RKY_W_'+t,west,t-westOffset,'LO','LO');
}
for(const t of expressGrid){
add('M20_RKY_EX_E_'+t,eastExpress,t,'EX','EX');
add('M20_RKY_EX_W_'+t,westExpress,t-westOffset,'EX','EX');
}
api.trips.sort((a,b)=>a.stops[0].dep-b.stops[0].dep);
function serviceMeta(t){const stops=t.stops,first=stops[0],last=stops.at(-1);const m20Name=t.m20Kind==='EX'?'Express — Metro Line 20':'Local — Metro Line 20';const rkyName=t.rkyKind==='EX'?'Rinkyun Express':'Rinkyun Local';return {id:t.id,desc:m20Name+' → '+rkyName,fromCode:first.code,toCode:last.code,firstDep:hm(first.dep),lastDep:hm(first.dep),headway:1,explicitDir:true,vMaxKmh:t.rkyKind==='EX'?exKin.vmaxKmh:RKY_KIN.vmaxKmh,dwellSec:t.rkyKind==='EX'?exKin.dwellSec:RKY_KIN.dwellSec,stops:stops.map(s=>s.code),m20Kind:t.m20Kind,rkyKind:t.rkyKind,thruService:true,tripId:t.id};}
api.services=api.trips.map(serviceMeta);line.services=api.services;root.RKY_TT_SERVICES=api.services;
if(typeof SuburbanRouter!=='undefined')SuburbanRouter.register({lineId:'RKY',meta:{name:line.name,color:line.color,cls:'suburban'},stations:line.stations,services:api.services,interchange:RKY_INTERCHANGE});
const list=x=>(Array.isArray(x)?x:String(x||'').split(',')).map(c=>String(c).trim());
function make(t,a,b){const stops=t.stops.slice(a,b+1),legs=[];let start=0;
function leg(f,l){const part=stops.slice(f,l+1),first=part[0],last=part.at(-1);const isM20=first.lineId==='M20';const kind=isM20?t.m20Kind:t.rkyKind;const kindName=kind==='EX'?'Express':(kind==='LO'?'Local':'Local');return {lineId:first.lineId,network:first.network,color:first.color,svcId:isM20?'M20':t.id,svcLogical:isM20?(kind==='EX'?'EX':'LO'):'RKY',svcName:isM20?(kind==='EX'?'Express — Metro Line 20':'Local — Metro Line 20'):(kind==='EX'?'Rinkyun Express':'Rinkyun Local'),svcDesc:kindName,trainNumber:null,tripId:t.id,boardCode:first.code,boardName:first.name,boardDep:hm(first.dep),boardDepSec:first.dep,alightCode:last.code,alightName:last.name,alightArr:hm(last.arr),alightArrSec:last.arr,km:Math.abs(last.km-first.km),intermediateStops:part.slice(1,-1).map(s=>({code:s.code,name:s.name,arr:hm(s.arr),dep:hm(s.dep)}))};}
for(let i=1;i<stops.length;i++)if(stops[i].lineId!==stops[i-1].lineId){if(i-1>start)legs.push(leg(start,i-1));start=i;}
if(stops.length-1>start)legs.push(leg(start,stops.length-1));
if(!legs.length)return null;
return {legs,departureTime:legs[0].boardDep,arrivalTime:legs.at(-1).alightArr,totalMinutes:Math.round((stops.at(-1).arr-stops[0].dep)/60),totalKm:legs.reduce((sum,l)=>sum+l.km,0),transfers:0,transferNodes:[],transferThru:[],transferWalkMin:[],transferWaitMin:[],thruService:true};}
function search(from,to,time,opts={}){let earliest=sec(time);if(earliest<sec('04:30'))earliest+=86400;const result=[],froms=list(from),tos=list(to);
for(const t of api.trips){for(const f of froms)for(const dest of tos){const a=t.stops.findIndex(s=>s.code===f),b=t.stops.findIndex(s=>s.code===dest);if(a<0||b<=a)continue;if(t.stops[a].dep<earliest||t.stops[a].dep>earliest+10800)continue;const j=make(t,a,b);if(j)result.push(j);}}
let bestDirect=Infinity;for(const j of result){const arr=j.legs.at(-1).alightArrSec;if(arr<bestDirect)bestDirect=arr;}
const byStop={};
for(const t of api.trips)t.stops.forEach((s,i)=>{(byStop[s.code]??=[]).push({t,i});});
for(const t of api.trips){
for(const f of froms){
const a=t.stops.findIndex(s=>s.code===f);if(a<0)continue;
if(t.stops[a].dep<earliest||t.stops[a].dep>earliest+10800)continue;
for(const dest of tos){
const bEnd=t.stops.findIndex(s=>s.code===dest);
const lastX=(bEnd<0?t.stops.length:bEnd);
for(let x=a+1;x<lastX;x++){
const X=t.stops[x];if(X.code===dest)continue;
const arrX=t.stops[x].arr;
let best=null;
for(const c of byStop[X.code]||[]){
if(c.t===t)continue;
const dep=c.t.stops[c.i].dep;
if(dep<arrX+60)continue;
const b2=c.t.stops.findIndex(s=>s.code===dest);
if(b2<0||b2<=c.i)continue;
if(!best||dep<best.dep)best={c,b2,dep};
}
if(!best)continue;
const j1=make(t,a,x),j2=make(best.c.t,best.c.i,best.b2);
if(!j1||!j2)continue;
if(best.c.t.stops[best.b2].arr>=bestDirect)continue;
const wait=Math.max(0,Math.round((best.dep-arrX)/60));
const thruIdx=t.stops.findIndex((s,i)=>i>0&&s.lineId==='RKY'&&t.stops[i-1].lineId==='M20');
const hasThru=thruIdx>0&&thruIdx<x;
const thruNode=hasThru?t.stops[thruIdx].code:X.code;
result.push({legs:[...j1.legs,...j2.legs],departureTime:j1.departureTime,arrivalTime:j2.arrivalTime,totalMinutes:Math.round((best.c.t.stops[best.b2].arr-t.stops[a].dep)/60),totalKm:(j1.totalKm??0)+(j2.totalKm??0),transfers:1,transferNodes:hasThru?[thruNode,X.code]:[X.code],transferThru:hasThru?[true,false]:[false],transferWalkMin:hasThru?[0,0]:[0],transferWaitMin:hasThru?[0,wait]:[wait],thruService:hasThru?true:false});
}
}
}
}
const seen=new Set();return result.filter(j=>{const k=j.legs.map(l=>l.tripId+':'+l.boardCode+':'+l.alightCode).join('|');if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>a.legs.at(-1).alightArrSec-b.legs.at(-1).alightArrSec).slice(0,opts.maxResults??8);}
api.search=search;
if(typeof SuburbanRouter!=='undefined'&&!SuburbanRouter.__rkyLocalPatched){const original=SuburbanRouter.search.bind(SuburbanRouter);SuburbanRouter.search=function(from,to,time,opts){const usesRKY=list(from).some(c=>/^RKY\d+$/.test(c))||list(to).some(c=>/^RKY\d+$/.test(c));return usesRKY?search(from,to,time,opts):original(from,to,time,opts);};SuburbanRouter.__rkyLocalPatched=true;}
const R=root.IZXUnifiedRouter;
if(R&&!R.__rkyLocalPatched){const original=R.search.bind(R);R.search=function(from,to,time,opts={}){const mixed=(list(from).some(c=>/^M20\d+$/.test(c))&&list(to).some(c=>/^RKY\d+$/.test(c)))||(list(from).some(c=>/^RKY\d+$/.test(c))&&list(to).some(c=>/^M20\d+$/.test(c)));const extra=search(from,to,time,opts);if(mixed)return extra.slice(0,opts.maxResults??5);const existing=original(from,to,time,opts)||[];const merged=typeof R.dedup==='function'?R.dedup([...existing,...extra]):[...existing,...extra];return merged.slice(0,opts.maxResults??5);};R.__rkyLocalPatched=true;}
api.ready=true;api.error=null;
}
api.init=init;
if(typeof document!=='undefined'&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(typeof globalThis!=='undefined'?globalThis:window);

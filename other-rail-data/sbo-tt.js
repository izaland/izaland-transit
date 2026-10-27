/* SBO timetable. Existing SBO01–SBO07 and M4 services preserved.
   Adds direct SBM01↔SBO01 services every 10 minutes.
   SBM timetable is loaded separately and initialized after page setup. */
'use strict';
const _SBO_ORDER_SB=['SBO01','SBO02','SBO03','SBO04','SBO05','SBO06','SBO07'];
const _SBO_ORDER_RAPID_SB=['SBO01','SBO05','SBO07'];
const _SBO_VMAX=90;
const _SBO_BANDS={
LOCAL_SB:[['05:00','06:50',10],['07:00','09:28',4],['09:30','16:50',10],['17:00','19:58',4],['20:00','24:20',10]],
RAPID_SB:[['07:00','09:28',4],['17:00','19:58',4]],
LOCAL_NB:[['05:00','05:30',10],['05:37','06:57',10],['07:07','09:35',4],['09:37','16:57',8],['17:07','20:03',4],['20:07','24:27',10]],
RAPID_NB:[['07:09','09:33',4],['17:09','20:05',4]],
DIRECT_SB:[['05:00','24:20',10]],
DIRECT_NB:[['05:07','24:27',10]]
};
function _sboSvc(id,rapid,sb,from,to,headway){const order=rapid?_SBO_ORDER_RAPID_SB:_SBO_ORDER_SB;return {id,desc:(rapid?'Rapid':'Local')+(sb?' · SBO01 → SBO07':' · SBO07 → SBO01'),fromCode:sb?'SBO01':'SBO07',toCode:sb?'SBO07':'SBO01',firstDep:from,lastDep:to,headway,vMaxKmh:_SBO_VMAX,explicitDir:true,stops:sb?order:[...order].reverse()};}
const SBO_TT_SERVICES=[];
for(const [f,t,h]of _SBO_BANDS.LOCAL_SB)SBO_TT_SERVICES.push(_sboSvc('SBO1',false,true,f,t,h));
for(const [f,t,h]of _SBO_BANDS.RAPID_SB)SBO_TT_SERVICES.push(_sboSvc('SBO2',true,true,f,t,h));
for(const [f,t,h]of _SBO_BANDS.LOCAL_NB)SBO_TT_SERVICES.push(_sboSvc('SBO1_NB',false,false,f,t,h));
for(const [f,t,h]of _SBO_BANDS.RAPID_NB)SBO_TT_SERVICES.push(_sboSvc('SBO2_NB',true,false,f,t,h));

/* Direct SBM01 ↔ SBO01 services.
   Southbound: SBM01→SBM11, then SBO10→SBO01.
   Northbound: SBO01→SBO10, then SBM11→SBM01. */
const _SBM_TO_SBO=['SBM01','SBM02','SBM03','SBM04','SBM05','SBM06','SBM07','SBM08','SBM09','SBM10','SBM11','SBO10','SBO09','SBO08','SBO07','SBO06','SBO05','SBO04','SBO03','SBO02','SBO01'];
const _SBO_TO_SBM=[..._SBM_TO_SBO].reverse();
function _directSvc(id,sb,from,to,headway){
return {
 id,
 desc:'Local · '+(sb?'SBM01 → SBO01':'SBO01 → SBM01'),
 fromCode:sb?'SBM01':'SBO01',
 toCode:sb?'SBO01':'SBM01',
 firstDep:from,lastDep:to,headway,
 vMaxKmh:_SBO_VMAX,explicitDir:true,
 stops:sb?_SBM_TO_SBO:_SBO_TO_SBM
};
}
for(const [f,t,h]of _SBO_BANDS.DIRECT_SB)SBO_TT_SERVICES.push(_directSvc('SBM_SBO_DIRECT',true,f,t,h));
for(const [f,t,h]of _SBO_BANDS.DIRECT_NB)SBO_TT_SERVICES.push(_directSvc('SBM_SBO_DIRECT_NB',false,f,t,h));

if(typeof SUBURBAN_LINES!=='undefined'&&SUBURBAN_LINES.SBO){
SUBURBAN_LINES.SBO.services=SBO_TT_SERVICES;
if(typeof SuburbanRouter!=='undefined')SuburbanRouter.register({lineId:'SBO',meta:{name:'Shinsabu Oitsura Line',label:'SBO',kanji:'粕鵲線',color:'#00CCCC',cls:'suburban'},stations:SUBURBAN_LINES.SBO.stations,services:SBO_TT_SERVICES,interchange:Object.fromEntries(Object.entries(SUBURBAN_INTERCHANGE).filter(([k])=>k.startsWith('SBO')))});
}
if(typeof document!=='undefined'&&!document.querySelector('script[data-sbm-timetable]')){const script=document.createElement('script');script.dataset.sbmTimetable='true';script.src=new URL('sbm-tt.js',document.currentScript.src).href;script.onerror=()=>console.error('SBM timetable failed to load');document.head.append(script);}
if(typeof module!=='undefined')module.exports={SBO_TT_SERVICES};

/* SBO timetable. Existing SBO01–SBO07 and M4 services preserved.
   Direct SBM01↔SBO01 services are defined in sbm-sbo-direct-tt.js. */
'use strict';
const _SBO_ORDER_SB=['SBO01','SBO02','SBO03','SBO04','SBO05','SBO06','SBO07'];
const _SBO_ORDER_RAPID_SB=['SBO01','SBO05','SBO07'];
const _SBO_VMAX=90;
const _SBO_BANDS={
LOCAL_SB:[['05:00','06:50',10],['07:00','09:28',4],['09:30','16:50',10],['17:00','19:58',4],['20:00','24:20',10]],
RAPID_SB:[['07:00','09:28',4],['17:00','19:58',4]],
LOCAL_NB:[['05:00','05:30',10],['05:37','06:57',10],['07:07','09:35',4],['09:37','16:57',8],['17:07','20:03',4],['20:07','24:27',10]],
RAPID_NB:[['07:09','09:33',4],['17:09','20:05',4]]
};
function _sboSvc(id,rapid,sb,from,to,headway){const order=rapid?_SBO_ORDER_RAPID_SB:_SBO_ORDER_SB;return {id,desc:(rapid?'Rapid':'Local')+(sb?' · SBO01 → SBO07':' · SBO07 → SBO01'),fromCode:sb?'SBO01':'SBO07',toCode:sb?'SBO07':'SBO01',firstDep:from,lastDep:to,headway,vMaxKmh:_SBO_VMAX,explicitDir:true,stops:sb?order:[...order].reverse()};}
const SBO_TT_SERVICES=[];
for(const [f,t,h]of _SBO_BANDS.LOCAL_SB)SBO_TT_SERVICES.push(_sboSvc('SBO1',false,true,f,t,h));
for(const [f,t,h]of _SBO_BANDS.RAPID_SB)SBO_TT_SERVICES.push(_sboSvc('SBO2',true,true,f,t,h));
for(const [f,t,h]of _SBO_BANDS.LOCAL_NB)SBO_TT_SERVICES.push(_sboSvc('SBO1_NB',false,false,f,t,h));
for(const [f,t,h]of _SBO_BANDS.RAPID_NB)SBO_TT_SERVICES.push(_sboSvc('SBO2_NB',true,false,f,t,h));
if(typeof SUBURBAN_LINES!=='undefined'&&SUBURBAN_LINES.SBO){
SUBURBAN_LINES.SBO.services=SBO_TT_SERVICES;
if(typeof SuburbanRouter!=='undefined')SuburbanRouter.register({lineId:'SBO',meta:{name:'Shinsabu Oitsura Line',label:'SBO',kanji:'粕鵲線',color:'#00CCCC',cls:'suburban'},stations:SUBURBAN_LINES.SBO.stations,services:SBO_TT_SERVICES,interchange:Object.fromEntries(Object.entries(SUBURBAN_INTERCHANGE).filter(([k])=>k.startsWith('SBO')))});
}
if(typeof document!=='undefined'&&!document.querySelector('script[data-sbm-timetable]')){const script=document.createElement('script');script.dataset.sbmTimetable='true';script.src=new URL('../sbm-tt.js',document.currentScript.src).href;script.onerror=()=>console.error('SBM timetable failed to load');document.head.append(script);}
if(typeof module!=='undefined')module.exports={SBO_TT_SERVICES};

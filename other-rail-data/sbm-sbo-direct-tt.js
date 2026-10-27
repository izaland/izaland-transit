/* ================================================================
   SBM-SBO-DIRECT-TT.JS
   Direct services: SBM01 Sainðaul Central ↔ SBO01 Oitsura.
   Every 10 minutes. Loaded after sbm-tt.js.

   Southbound: SBM01→SBM11, then SBO10→SBO01.
   Northbound: SBO01→SBO10, then SBM11→SBM01.
================================================================ */
'use strict';
(function(){
if(typeof SUBURBAN_LINES==='undefined'||!SUBURBAN_LINES.SBM){
console.warn('SBM-SBO direct timetable requires sbo-data.js');
return;
}
const line=SUBURBAN_LINES.SBM;
const stopsSBMtoSBO=[
'SBM01','SBM02','SBM03','SBM04','SBM05','SBM06','SBM07','SBM08','SBM09','SBM10','SBM11',
'SBO10','SBO09','SBO08','SBO07','SBO06','SBO05','SBO04','SBO03','SBO02','SBO01'
];
const stopsSBOtoSBM=[...stopsSBMtoSBO].reverse();
function makeService(id,southbound,firstDep,lastDep){
return {
 id,
 desc:'Local · '+(southbound?'SB → SB':'SB → SB'),
 fromCode:southbound?'SBM01':'SBO01',
 toCode:southbound?'SBO01':'SBM01',
 firstDep,lastDep,headway:10,
 vMaxKmh:90,explicitDir:true,
 stops:southbound?stopsSBMtoSBO:stopsSBOtoSBM
};
}
const directServices=[
makeService('SBM_SBO_DIRECT',true,'05:00','24:20'),
makeService('SBM_SBO_DIRECT_NB',false,'05:07','24:27')
];
line.services=(line.services||[]).concat(directServices);
if(typeof SuburbanRouter!=='undefined'){
SuburbanRouter.register({
lineId:'SBM',
meta:{name:line.name,color:line.color,cls:'suburban'},
stations:line.stations,
services:line.services,
interchange:Object.fromEntries(Object.entries(SUBURBAN_INTERCHANGE).filter(([k])=>k.startsWith('SBM')))
});
}
})();

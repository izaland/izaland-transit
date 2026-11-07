/* ================================================================
   SO-DATA.JS — Sabuon Line (SO) · ટરૃે૮૾પ્線 · servizi e orari
   Stazioni e metadati di SO stanno in suburban-data.js
   (SUBURBAN_LINES.SO); qui solo i servizi.
   Va caricato DOPO suburban-router.js.

   Servizi:
     SO1  Local  SO01 → SO18 · ogni 10 min · 05:03–23:33
     SO2  Local  SO18 → SO01 · ogni 10 min · 05:11–23:31
================================================================ */
'use strict';

const SO_SERVICES = [
  { id:'SO1', desc:'Local', fromCode:'SO01', toCode:'SO18', headway:10, stops:[], firstDep:'05:03', lastDep:'23:33', explicitDir:true },
  { id:'SO2', desc:'Local', fromCode:'SO18', toCode:'SO01', headway:10, stops:[], firstDep:'05:11', lastDep:'23:31', explicitDir:true },
];

if (typeof SuburbanRouter !== 'undefined')
  SuburbanRouter.register({ lineId: 'SO', services: SO_SERVICES });

if (typeof module !== 'undefined') module.exports = { SO_SERVICES };

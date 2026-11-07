/* ================================================================
   SO-DATA.JS — Sabuon Line (SO) · ટરૃે૮૾પ્線 · servizi
   Stazioni e metadati di SO stanno in suburban-data.js
   (SUBURBAN_LINES.SO); qui solo i servizi.
   Va caricato DOPO suburban-router.js.

   Servizi:
     SO1  Local (punta)  20 min · 07:30–09:00 e 17:00–19:30
     SO2  Local          30 min · 05:30–23:00
================================================================ */
'use strict';

const SO_SERVICES = [
  { id:'SO1', desc:'Local (punta)', fromCode:'SO01', toCode:'SO18', headway:20, stops:[], firstDep:'07:30', lastDep:'09:00' },
  { id:'SO1', desc:'Local (punta)', fromCode:'SO18', toCode:'SO01', headway:20, stops:[], firstDep:'07:30', lastDep:'09:00' },
  { id:'SO1', desc:'Local (punta)', fromCode:'SO01', toCode:'SO18', headway:20, stops:[], firstDep:'17:00', lastDep:'19:30' },
  { id:'SO1', desc:'Local (punta)', fromCode:'SO18', toCode:'SO01', headway:20, stops:[], firstDep:'17:00', lastDep:'19:30' },
  { id:'SO2', desc:'Local', fromCode:'SO01', toCode:'SO18', headway:30, stops:[], firstDep:'05:30', lastDep:'23:00' },
  { id:'SO2', desc:'Local', fromCode:'SO18', toCode:'SO01', headway:30, stops:[], firstDep:'05:30', lastDep:'23:00' },
];

if (typeof SuburbanRouter !== 'undefined')
  SuburbanRouter.register({ lineId: 'SO', services: SO_SERVICES });

if (typeof module !== 'undefined') module.exports = { SO_SERVICES };

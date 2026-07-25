/* ================================================================
   M2-TT.JS — Metro Line 2 · Timetable Profile
   ================================================================
   SVC_1  — Continuativo Gawinosechi → Hintomaui    (Ramo A, ogni 12 min)
   SVC_2  — Continuativo Gawinosechi → Mokoba       (Ramo B, ogni 12 min)
   SVC_3  — Limitato     Gawinosechi ↔ Ārikkohanu   (tratta comune, ogni 12 min)
   SVC_4  — Rapido       Gawinosechi ↔ Mokoba       (ore di punta, ogni 24 min)
================================================================ */
'use strict';

const M2_HEADWAY_SVC1 = [
  { from: '05:00', to: '24:00', headwayMin: 12 },
];
const M2_HEADWAY_SVC2 = [
  { from: '05:00', to: '24:00', headwayMin: 12 },
];
const M2_HEADWAY_SVC3 = [
  { from: '05:00', to: '24:00', headwayMin: 12 },
];
const M2_HEADWAY_SVC4_INBOUND  = [
  { from: '07:00', to: '09:30', headwayMin: 24 },
];
const M2_HEADWAY_SVC4_OUTBOUND = [
  { from: '17:30', to: '20:00', headwayMin: 24 },
];

const M2_SERVICES = [
  {
    id:          'M2',
    svcLogical:  'SVC_1',
    name:        'for Hintomaui',
    nameJa:      '価園斐行',
    branch:      'A',
    color:       '#E60026',
    cls:         'svc-1',
    rapid:       false,
    headway:     M2_HEADWAY_SVC1,
    stops: [
      'M201','M202','M203','M204','M205','M206','M207','M208',
      'M209','M210','M211','M212','M213','M214','M215','M216','M217','M218',
      'M219','M220','M221','M222','M223','M224','M225','M226',
    ],
  },
  {
    id:          'M2',
    svcLogical:  'SVC_2',
    name:        'for Mokoba',
    nameJa:      '母槻行',
    branch:      'B',
    color:       '#C4001F',
    cls:         'svc-2',
    rapid:       false,
    headway:     M2_HEADWAY_SVC2,
    stops: [
      'M201','M202','M203','M204','M205','M206','M207','M208',
      'M209','M210','M211','M212','M213','M214','M215','M216','M217','M218',
      'M227','M228','M229','M230','M231','M232','M233','M234','M235','M236',
    ],
  },
  {
    id:          'M2',
    svcLogical:  'SVC_3',
    name:        'Limited Ārikkohanu',
    nameJa:      '鶴神由見夫止まり',
    branch:      'common',
    color:       '#FF6680',
    cls:         'svc-3',
    rapid:       false,
    headway:     M2_HEADWAY_SVC3,
    stops: [
      'M201','M202','M203','M204','M205','M206','M207','M208',
      'M209','M210','M211','M212','M213','M214','M215','M216','M217','M218',
    ],
  },
  {
    id:          'M2',
    svcLogical:  'SVC_4',
    name:        'Rapid for Mokoba',
    nameJa:      '母槻急行',
    branch:      'B',
    color:       '#8B0000',
    cls:         'svc-4',
    rapid:       true,
    headwayInbound:  M2_HEADWAY_SVC4_INBOUND,
    headwayOutbound: M2_HEADWAY_SVC4_OUTBOUND,
    stops: [
      'M201','M202','M203','M204','M205','M206','M207','M208',
      'M209','M210','M211','M212','M213','M214','M215','M216','M217','M218',
      'M230','M232','M236',
    ],
  },
];

/* ----------------------------------------------------------------
   Registrazione linea M2 nel MetroRouter.
   Dipende da: m2-data.js (M2_ST, M2_META, M2_INTERCHANGE)
               questo file (M2_SERVICES)
   Viene eseguito quando il browser ha caricato entrambi gli script.
---------------------------------------------------------------- */
if (typeof MetroRouter !== 'undefined') {
  MetroRouter.register({
    lineId:      'M2',
    meta:        M2_META,
    st:          M2_ST,
    services:    M2_SERVICES,
    interchange: M2_INTERCHANGE,
  });
}

if (typeof module !== 'undefined') {
  module.exports = { M2_SERVICES, M2_HEADWAY_SVC1, M2_HEADWAY_SVC2, M2_HEADWAY_SVC3,
                     M2_HEADWAY_SVC4_INBOUND, M2_HEADWAY_SVC4_OUTBOUND };
}

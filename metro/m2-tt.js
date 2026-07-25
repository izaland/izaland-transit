/* ================================================================
   M2-TT.JS — Metro Line 2 · Timetable Profile
   ================================================================
   Linea più vecchia di Sainðaul (anni 1920).
   Alimentazione a terza rotaia, semi-automatizzata.
   Composizione: 6 carrozze.
   Velocità commerciale media: 30 km/h (dwellSec: 30 s/fermata).

   Quattro sottoservizi:

   SVC_1  — Continuativo Gawinosechi → Hintomaui    (Ramo A, ogni 12 min)
   SVC_2  — Continuativo Gawinosechi → Mokoba       (Ramo B, ogni 12 min)
   SVC_3  — Limitato     Gawinosechi ↔ Ārikkohanu   (tratta comune, ogni 12 min)
   SVC_4  — Rapido       Gawinosechi ↔ Mokoba       (ore di punta, ogni 24 min)
             Fermate rapido: tutte M201–M218 + M230, M232, M236

   Frequenza risultante sulla tratta comune M201–M218:
     Ore normali:   SVC_1 + SVC_2 + SVC_3 → ogni ~4 min
     Ore di punta:  + SVC_4             → ogni ~3.4 min

   Il timetable effettivo viene generato runtime da MetroRouter
   usando avgSpeedKmh e dwellSec definiti in M2_META (m2-data.js).
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   Profilo headway per sottoservizio
   Ogni slot definisce la finestra oraria e il headway in minuti.
   05:00–24:00 operativi.
---------------------------------------------------------------- */

/* SVC_1 — Continuativo Ramo A (Gawinosechi → Hintomaui) */
const M2_HEADWAY_SVC1 = [
  { from: '05:00', to: '24:00', headwayMin: 12 },
];

/* SVC_2 — Continuativo Ramo B (Gawinosechi → Mokoba) */
const M2_HEADWAY_SVC2 = [
  { from: '05:00', to: '24:00', headwayMin: 12 },
];

/* SVC_3 — Limitato tratta comune (Gawinosechi ↔ Ārikkohanu Yunobu) */
const M2_HEADWAY_SVC3 = [
  { from: '05:00', to: '24:00', headwayMin: 12 },
];

/* SVC_4 — Rapido Ramo B (ore di punta)
   Inbound  (Mokoba → Gawinosechi): 07:00–09:30
   Outbound (Gawinosechi → Mokoba): 17:30–20:00
   headwayMin: 24 (infilato fra gli altri servizi) */
const M2_HEADWAY_SVC4_INBOUND  = [
  { from: '07:00', to: '09:30', headwayMin: 24 },
];
const M2_HEADWAY_SVC4_OUTBOUND = [
  { from: '17:30', to: '20:00', headwayMin: 24 },
];

/* ----------------------------------------------------------------
   Definizione sottoservizi
   id: 'M2' per tutti — il badge nel journey planner mostra 'M2'
       con il cerchio colorato metro. svcLogical discrimina
       il sottoservizio internamente.
   stops: array di codici stazione nell'ordine di percorrenza
          (outbound, ovvero dalla città verso i terminus).
---------------------------------------------------------------- */
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

if (typeof module !== 'undefined') {
  module.exports = { M2_SERVICES, M2_HEADWAY_SVC1, M2_HEADWAY_SVC2, M2_HEADWAY_SVC3,
                     M2_HEADWAY_SVC4_INBOUND, M2_HEADWAY_SVC4_OUTBOUND };
}

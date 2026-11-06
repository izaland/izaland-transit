/* ================================================================
   CL-DATA.JS — CityLiner (CL)
   Espresso Riyatoma ↔ Tohpatogu · 262.671 km · 11 stazioni
   Servizio: CL32 "Nijisnore" · pattern R01 (tutte le fermate)
   e R02 (espresso). Altri servizi CL si aggiungeranno in futuro.
================================================================ */
'use strict';

const CL_ST = {
  CL321:  { n: 'Riyatoma',     k: '追庥',     nodeId: 257402170, km:   0.000 },
  CL322:  { n: 'Nokkaki',      k: '坂商',     nodeId: 257768635, km:  11.938 },
  CL323:  { n: 'Haðohano',     k: '鮪種',     nodeId: 259120829, km:  41.067 },
  CL324:  { n: 'Chunðouni',    k: '椒潟',     nodeId: 259120830, km:  66.851 },
  CL325:  { n: 'Hon-Mirayama', k: '本水良倉', nodeId: 283528875, km: 108.521 },
  CL326:  { n: 'Poridake',     k: '登館',     nodeId: 259420163, km: 142.731 },
  CL327:  { n: 'Toramukada',   k: '',         nodeId: 283528856, km: 171.241 },
  CL328:  { n: 'Umehte',       k: '',         nodeId: 283528858, km: 189.829 },
  CL329:  { n: 'Sumāra',       k: '洲麻良',   nodeId: 283528860, km: 211.911 },
  CL3210: { n: 'Hausai',       k: '侯西',     nodeId: 283528862, km: 243.661 },
  CL3211: { n: 'Tohpatogu',    k: '落外',     nodeId: 283528863, km: 262.671 },
};

const CL_CANONICAL_ORDER = [
  'CL321', 'CL322', 'CL323', 'CL324', 'CL325', 'CL326',
  'CL327', 'CL328', 'CL329', 'CL3210', 'CL3211',
];

const CL_LINE = {
  id: 'CL',
  code: 'CL',
  name: 'CityLiner',
  nameIZ: 'ટાઠાધ૩પદ્',
  color: '#9e9e9e',
  totalKm: 262.671,
};

const CL32 = {
  id: 'CL32',
  name: 'Nijisnore',
  nameIZ: 'ટાઠાધ૩પદ્',
  layoverMin: 15,
  patterns: {
    R01: {
      stops: CL_CANONICAL_ORDER,
      headwayMin: 120,
      firstDep: '06:30',
      lastDep: '18:30',
    },
    R02: {
      stops: ['CL321', 'CL323', 'CL324', 'CL325', 'CL326', 'CL329', 'CL3211'],
      headwayMin: 120,
      firstDep: '07:30',
      lastDep: '19:30',
    },
  },
};

/* ================================================================
   CL_INTERCHANGE — collegamenti della CityLiner con altre reti
   Formato: codice CL → [codici stazioni di altre reti]
   Per un transferMin personalizzato usare:
     { code: 'XXXX', transferMin: N }
================================================================ */
const CL_INTERCHANGE = {
  CL321: ['R13', 'SN01'],   // Riyatoma
  CL326: ['SN05', 'SA04'],  // Poridake
  // CL3211: ['...'],       // Tohpatogu — futuro
};

if (typeof module !== 'undefined') {
  module.exports = { CL_ST, CL_CANONICAL_ORDER, CL_LINE, CL32, CL_INTERCHANGE };
}

/* ================================================================
   PDS-DATA.JS — Poridake–Sumāra Line (PDS)
   Linea regionale Izarail · 69,42 km · 15 stazioni
   Servizio locale omnibus · 1 treno/ora per direzione
   Rinforzi mattutini (Sumāra→Poridake) e pomeridiani/serali
   (Poridake→Sumāra).
   Colore linea: nero · Badge: LOC
================================================================ */

'use strict';

const PDS_ST = {
  PDS01: { n: 'Poridake',          k: '登館',     nodeId: 259420163, km:  0.00 },
  PDS02: { n: 'Munasamui',         k: '鬼開',     nodeId: 283479516, km:  1.70 },
  PDS03: { n: 'Kera',              k: '佳良',     nodeId: 283479515, km:  3.17 },
  PDS04: { n: 'Poridake Hakuwin',  k: '登館學院', nodeId: 283490331, km:  5.30 },
  PDS05: { n: 'Chibe',             k: '',         nodeId: 283490332, km:  6.92 },
  PDS06: { n: 'Warogata',          k: '深泉',     nodeId: 283528855, km: 10.81 },
  PDS07: { n: 'Ukosuba',           k: '霞京',     nodeId: 453656527, km: 15.86 },
  PDS08: { n: 'Tsudenda',          k: '',         nodeId: 453656530, km: 21.12 },
  PDS09: { n: 'Toramukada',        k: '',         nodeId: 283528856, km: 28.33 },
  PDS10: { n: 'Bonatsue',          k: '',         nodeId: 283528857, km: 37.19 },
  PDS11: { n: 'Shirukauri',        k: '荒沼',     nodeId: 453656529, km: 43.97 },
  PDS12: { n: 'Umehte',            k: '',         nodeId: 283528858, km: 46.92 },
  PDS13: { n: 'Takapori',          k: '浚登',     nodeId: 283528859, km: 56.96 },
  PDS14: { n: 'Nari-Sumāra',       k: '東洲麻良', nodeId: 453656534, km: 63.95 },
  PDS15: { n: 'Sumāra',            k: '洲麻良',   nodeId: 283528860, km: 69.42 },
};

const PDS_CANONICAL_ORDER = [
  'PDS01','PDS02','PDS03','PDS04','PDS05','PDS06','PDS07',
  'PDS08','PDS09','PDS10','PDS11','PDS12','PDS13','PDS14','PDS15',
];

const PDS_LINE = {
  id: 'PDS',
  code: 'PDS',
  name: 'Poridake–Sumāra Line',
  nameIZ: '登館-洲麻良線',
  color: '#000000',
  textColor: '#ffffff',
  totalKm: 69.42,
  category: 'local',
  badge: 'LOC',
};

/* ================================================================
   INTERSCAMBI
   Poridake: CL32, SA04, SN05
   Toramukada e Umehte: CL32
================================================================ */
const PDS_INTERCHANGE = {
  PDS01: ['CL326', 'SA04', 'SN05'],
  PDS09: ['CL327'],
  PDS12: ['CL328'],
};

/* ================================================================
   SERVIZIO
   Tutti i treni fermano in tutte le stazioni.
   Percorrenza commerciale: 63 min 33 s.
   Precedenze previste a Toramukada e Umehte.
================================================================ */
const PDS_SERVICE = {
  id: 'PDS',
  name: 'Poridake–Sumāra local',
  pattern: 'ALL',
  headwayMin: 60,
  firstDepSumara: '05:35',
  lastDepSumara: '22:35',
  specialDepSumara: '22:55',
  firstDepPoridake: '05:50',
  lastDepPoridake: '22:50',
  reinforcementsSumara: ['07:16','07:46','08:16','08:46'],
  reinforcementsPoridake: ['14:20','17:25','18:25','19:25'],
};

if (typeof module !== 'undefined') {
  module.exports = { PDS_ST, PDS_CANONICAL_ORDER, PDS_LINE, PDS_INTERCHANGE, PDS_SERVICE };
}

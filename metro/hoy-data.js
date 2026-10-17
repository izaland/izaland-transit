/* ================================================================
   HOY-DATA.JS — Hoze-Oyehatton Line (#3588cc)
   ================================================================
   Light rail driverless della rete metro, costruita di recente per
   collegare meglio il network. 13 stazioni · 13.64 km
   Capolinea: HOY01 Takatsura ↔ HOY13 Kadokamahiwa

   Interscambi:
     HOY01 Takatsura             ↔ M1106
     HOY03 Shin-Dodonuka         ↔ M1725
     HOY04 Shiki-Hoze            ↔ M422, M615
     HOY07 Konegisa Eigandan     ↔ M503, M719
     HOY09 Ðwaishon Tekkapi      ↔ M1114
     HOY11 Urenosomi-Tsuruna     ↔ M1320, M1521
     HOY13 Kadokamahiwa          ↔ M511
================================================================ */
'use strict';

const HOY_ST = {
  HOY01: { n: 'Takatsura',               k: '浚鶴',         nodeId: 136187245, km:  0.00 },
  HOY02: { n: 'Shinkas Jittantori',      k: '新褐垽丹狛',   nodeId: 269425237, km:  0.748 },
  HOY03: { n: 'Shin-Dodonuka',           k: '新登戸陥',     nodeId: 194000794, km:  1.84 },
  HOY04: { n: 'Shiki-Hoze',              k: '北舗摧',       nodeId: 136114711, km:  3.29 },
  HOY05: { n: 'Enhadan Hoze',            k: '縁閻舗摧',     nodeId: 269425238, km:  4.07 },
  HOY06: { n: 'Jaihokiri Center',        k: '',             nodeId: 269425239, km:  4.80 },
  HOY07: { n: 'Konegisa Eigandan',       k: '干鮃永玵段',   nodeId: 123393753, km:  5.86 },
  HOY08: { n: 'Shiittaru Pamiroi',       k: '',             nodeId: 269425240, km:  6.91 },
  HOY09: { n: 'Ðwaishon Tekkapi',        k: '',             nodeId: 146814219, km:  8.23 },
  HOY10: { n: 'Oyehatton Tsuiruki',      k: '',             nodeId: 269425241, km:  9.97 },
  HOY11: { n: 'Urenosomi-Tsuruna',       k: '',             nodeId: 146814990, km: 11.17 },
  HOY12: { n: 'Kadokamahiwa Jutaku',     k: '',             nodeId: 269425242, km: 12.36 },
  HOY13: { n: 'Kadokamahiwa',            k: '',             nodeId: 196658319, km: 13.64 },
};

/* Ordine canonico: HOY01 → HOY13 */
const HOY_CANONICAL_ORDER = Object.keys(HOY_ST);

const HOY_META = {
  id:          'HOY',
  code:        'HOY',
  name:        'Hoze-Oyehatton Line',
  nameJa:      '',
  color:       '#3588cc',
  totalKm:     13.64,
  stations:    13,
  type:        'light-rail',
  driverless:  true,
  avgSpeedKmh: 35,   // TODO: provvisorio — da confermare
  dwellSec:    20,   // stop rapido (metro automatica driverless)
};

const HOY_SVC = {
  A: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#3588cc',
    cls:    'svc-A',
    stops:  HOY_CANONICAL_ORDER,
  },
};

/* TODO: transferMin provvisorio 3 min per tutti i nodi — da rivedere. */
const HOY_INTERCHANGE = {
  HOY01: [
    { code: 'M1106', network: 'metro', transferMin: 3, note: 'M1106 Takatsura' }
  ],
  HOY03: [
    { code: 'M1725', network: 'metro', transferMin: 3, note: 'M1725 Shin-Dodonuka' }
  ],
  HOY04: [
    { code: 'M422', network: 'metro', transferMin: 3, note: 'M422 Shiki-Hoze' },
    { code: 'M615', network: 'metro', transferMin: 3, note: 'M615 Shiki-Hoze' }
  ],
  HOY07: [
    { code: 'M503', network: 'metro', transferMin: 3, note: 'M503 Konegisa Eigandan' },
    { code: 'M719', network: 'metro', transferMin: 3, note: 'M719 Konegisa Eigandan' }
  ],
  HOY09: [
    { code: 'M1114', network: 'metro', transferMin: 3, note: 'M1114 Ðwaishon Tekkapi' }
  ],
  HOY11: [
    { code: 'M1320', network: 'metro', transferMin: 3, note: 'M1320 Urenosomi-Tsuruna' },
    { code: 'M1521', network: 'metro', transferMin: 3, note: 'M1521 Urenosomi-Tsuruna' }
  ],
  HOY13: [
    { code: 'M511', network: 'metro', transferMin: 3, note: 'M511 Kadokamahiwa' }
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { HOY_META, HOY_ST, HOY_CANONICAL_ORDER, HOY_SVC, HOY_INTERCHANGE };
}

/* ================================================================
   M10-DATA.JS — Metro Line 10  (SOLO DATI — timetable m10-tt.js da definire)
   ================================================================
   30 stazioni · M1001 Shakihori → M1030 Uhāra-Motu
   Colore: #db8b3a
   Distanze progressive da M1001 (km 0.00), totale 32.55 km.

   Interscambi:
     M1001  M3150, SK19, CK27, KS11     (Shakihori)
     M1002  M315   M1003 M316   M1004 M317   M1006 M319
     M1005  M318, M824                  (Komayunden - Dōnmus Kōwen)
     M1010  TS10                        (10 min a piedi)
     M1011  M1717                       (Chiyakuda)
     M1013  CK20, CO20                  (Tobeskauri)
     M1014  M911                        (Kanbata)
     M1017  M326, M1414                 (Kansāri)
     M1018  M914, SHX02                 (Eigan-ji)
     M1021  LL13, CO11                  (Oritoku)
     M1027  SSK01                       (Kanui Airport T1)
     M1028  AX08                        (Osenude)

   TODO: nomi/tipologia servizi, headway, ore di servizio,
         transferMin reali (qui provvisori = 3), kanji mancanti.
================================================================ */
'use strict';

const M10_ST = {
  M1001: { n: 'Shakihori',                       k: '石登',                  nodeId: 122813475, km:  0.00 },
  M1002: { n: 'Niji-Shakihori',                  k: '西石登',                 nodeId: 145985096, km:  1.63 },
  M1003: { n: 'Rillantsoye',                     k: '',                    nodeId: 145985095, km:  2.80 },
  M1004: { n: 'Shakihori Sports Park',           k: '石登運動公園',              nodeId: 183370154, km:  3.75 },
  M1005: { n: 'Komayunden - Dōnmus Kōwen',       k: '冬允殿-動物公園',            nodeId: 183370155, km:  5.15 },
  M1006: { n: 'Garotsu Lake',                    k: '賀呂都湖',                nodeId: 145985094, km:  6.19 },
  M1007: { n: 'Garotsuko Nanmun',                k: '賀呂都湖南門',              nodeId: 148333494, km:  7.84 },
  M1008: { n: 'Yakata',                          k: '双泉',                  nodeId: 183244989, km:  8.71 },
  M1009: { n: 'Shiki-Nekunno',                   k: '北牒見',                 nodeId: 183244990, km: 10.00 },
  M1010: { n: 'Nekunno Juwon',                   k: '牒見中央',                nodeId: 148333495, km: 11.46 },
  M1011: { n: 'Chiyakuda',                       k: '宮由駄',                 nodeId: 146645343, km: 12.49 },
  M1012: { n: 'Minkanawa',                       k: '',                    nodeId: 145943685, km: 14.28 },
  M1013: { n: 'Tobeskauri',                      k: '鴨沼',                  nodeId: 129227937, km: 15.63 },
  M1014: { n: 'Kanbata',                         k: '巻岩',                  nodeId: 177044015, km: 17.44 },
  M1015: { n: 'Sainðaul Central',                k: '作安崎中央',               nodeId: 229656494, km: 18.45 },
  M1016: { n: 'Tikkamoto',                       k: '',                    nodeId: 128525370, km: 19.46 },
  M1017: { n: 'Kansāri',                         k: '官川',                  nodeId: 128525371, km: 20.29 },
  M1018: { n: 'Eigan-ji',                        k: '栄鳫寺',                 nodeId: 128669527, km: 21.25 },
  M1019: { n: 'Sōshitoya Otsumi-Kokendake',      k: '聡司塒南古剣館',             nodeId: 183739922, km: 22.24 },
  M1020: { n: 'Mawaketsuki',                     k: '',                    nodeId: 183739921, km: 23.37 },
  M1021: { n: 'Oritoku',                         k: '壌外',                  nodeId: 124066080, km: 24.38 },
  M1022: { n: 'Sasakuma',                        k: '',                    nodeId: 124295466, km: 25.88 },
  M1023: { n: 'Tendoshiri',                      k: '',                    nodeId: 126666460, km: 27.22 },
  M1024: { n: 'Shiki-Kōmeitsān',                 k: '北公明倉',                nodeId: 126666462, km: 28.26 },
  M1025: { n: 'Torihashi',                       k: '',                    nodeId: 126666463, km: 29.12 },
  M1026: { n: 'Kanui 2-sa',                      k: '',                    nodeId: 126666464, km: 29.76 },
  M1027: { n: 'Kanui Airport T1',                k: '',                    nodeId: 126497710, km: 30.72 },
  M1028: { n: 'Osenude',                         k: '防斉',                  nodeId: 126497709, km: 31.28 },
  M1029: { n: 'Osenude-Kyatoba',                 k: '',                    nodeId: 229655862, km: 31.77 },
  M1030: { n: 'Uhāra-Motu',                      k: '',                    nodeId: 229655863, km: 32.55 },
};

const M10_CANONICAL_ORDER = Object.keys(M10_ST);

const M10_META = {
  id:          'M10',
  code:        'M10',
  name:        'Line 10',
  nameJa:      '',
  color:       '#db8b3a',
  stations:    30,
  totalKm:     32.55,
  avgSpeedKmh: null,   // da definire
  dwellSec:    null,   // da definire
};

/* Placeholder: headway da definire con le prossime istruzioni */
const M10_HEADWAY = [];

const M10_SVC = {
  A: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#db8b3a',
    cls:    'svc-A',
    stops:  M10_CANONICAL_ORDER,
  },
};

const _ic10 = (code, network, transferMin = 3, note = '') => ({ code, network, transferMin, note });
const _m10  = (c, min, note) => _ic10(c, 'metro', min, note);
const _s10  = (c, min, note) => _ic10(c, 'suburban', min, note);

const M10_INTERCHANGE = {
  M1001: [_m10('M3150', 3, 'Shakihori — M3100 branch terminus'), _s10('SK19'), _s10('CK27'), _s10('KS11')],
  M1002: [_m10('M315')],
  M1003: [_m10('M316')],
  M1004: [_m10('M317')],
  M1005: [_m10('M318'), _m10('M824', 4)],
  M1006: [_m10('M319')],
  M1010: [_s10('TS10', 10, 'TS10 — 10 min a piedi')],
  M1011: [_m10('M1717')],
  M1013: [_s10('CK20'), _s10('CO20')],
  M1014: [_m10('M911')],
  M1017: [_m10('M326'), _m10('M1414')],
  M1018: [_m10('M914'), _ic10('SHX02', 'other')],
  M1021: [_s10('LL13'), _s10('CO11')],
  M1027: [_ic10('SSK01', 'other')],
  M1028: [_ic10('AX08', 'ax', 5, 'Airport Express — Osenude')],
};

const M10_NODE_IDS = Object.fromEntries(
  Object.entries(M10_ST).map(([c, s]) => [c, s.nodeId])
);

if (typeof module !== 'undefined') {
  module.exports = { M10_META, M10_ST, M10_CANONICAL_ORDER, M10_HEADWAY, M10_SVC, M10_INTERCHANGE, M10_NODE_IDS };
}

/* ================================================================
   M18-DATA.JS — Metro Line 18 (#999999)  (SOLO DATI — m18-tt.js da definire)
   ================================================================
   21 stazioni · 27.36 km
   Capolinea: Nari-Gotsurindai (M1801) ↔ Mewakate Kippai (M1821)

   Servizi: solo S1 All-stop (M1801 ↔ M1821, tutte le stazioni).
   Thru service: NESSUNO.

   Interscambi in superficie (a piedi):
     M1811 ↔ M211 (6 min), M1811 ↔ SHX04 (10 min).
   M1812 ↔ M1019: collegamento sotterraneo (stazioni con nome e nodo
   diversi ma connesse sottoterra), 3 min.

   TODO:
     - orario di servizio (M18_HOURS) e frequenze (M18_HEADWAY): da definire
     - sosta (dwellSec), velocita' commerciale e nameJa: da definire
     - transferMin provvisorio 3 min (tranne M211 = 6, SHX04 = 10 in
       superficie) — da rivedere
     - kanji mancanti (stringa vuota)
     - registrazione in station-inspector.html e interscambi inversi
       nelle altre linee: NON ancora fatta (vedi M18_INTERCHANGE)
================================================================ */
'use strict';

const M18_ST = {
  M1801: { n: 'Nari-Gotsurindai',        k: '東御通琳台',      nodeId: 229672837, km:  0.00 },
  M1802: { n: 'Norihoi',                 k: '翼浮',            nodeId: 229672838, km:  1.02 },
  M1803: { n: 'Ottanjoe',                k: '',                nodeId: 184979830, km:  2.43 },
  M1804: { n: 'Takeseji',                k: '秋井',            nodeId: 452088553, km:  4.25 },
  M1805: { n: 'Yakata',                  k: '双泉',            nodeId: 183244989, km:  5.36 },
  M1806: { n: 'Shin-Makurigawa',         k: '新炭畦',          nodeId: 145985093, km:  6.76 },
  M1807: { n: 'Kasaraki',                k: '次羽',            nodeId: 124064335, km:  8.26 },
  M1808: { n: 'Jigasūngai Kōwen',        k: '治ヶ僧涯公園',    nodeId: 145991529, km:  9.48 },
  M1809: { n: 'Jufurai',                 k: '朱布来',          nodeId: 135876986, km: 10.56 },
  M1810: { n: 'Tsumiji',                 k: '都巳治',          nodeId: 183419739, km: 12.25 },
  M1811: { n: 'Tsūnguhai',               k: '樋吾箆',          nodeId: 262196840, km: 13.11 },
  M1812: { n: 'Gwannowin-Adae',          k: '元老院前',        nodeId: 291759399, km: 14.22 },
  M1813: { n: 'Oiseharu (Metro)',        k: '粕墾',            nodeId: 176668162, km: 15.04 },
  M1814: { n: 'Ominotori Hasenoki',      k: '',                nodeId: 262195160, km: 16.37 },
  M1815: { n: 'Yunpotsai Soisuma',       k: '',                nodeId: 183370162, km: 17.30 },
  M1816: { n: 'IDK Arena',               k: 'IDK',             nodeId: 187047014, km: 19.11 },
  M1817: { n: 'Niji-Intsushitsa',        k: '',                nodeId: 183370193, km: 20.15 },
  M1818: { n: 'Araonazako',              k: '',                nodeId: 183370192, km: 21.68 },
  M1819: { n: 'Koyabisan',               k: '古谷比山',        nodeId: 183370191, km: 22.62 },
  M1820: { n: 'Mewakate - Yōneo Motu',   k: '',                nodeId: 183370190, km: 25.17 },
  M1821: { n: 'Mewakate Kippai',         k: '',                nodeId: 183370188, km: 27.36 },
};

/* Ordine canonico geografico: M1801 → M1821 */
const M18_CANONICAL_ORDER = Array.from({ length: 21 }, (_, i) => 'M18' + String(i + 1).padStart(2, '0'));

const M18_META = {
  id:          'M18',
  code:        'M18',
  name:        'Line 18',
  nameJa:      '',
  color:       '#999999',
  totalKm:     27.36,
  stations:    21,
  avgSpeedKmh: null,   // TODO
  dwellSec:    null,   // TODO
};

/* ----------------------------------------------------------------
   Servizi
---------------------------------------------------------------- */
const M18_SVC = {
  S1: { name: 'S1', type: 'local', label: 'All-stop', labelJa: '各駅停車', color: '#999999', cls: 'svc-S1',
        peakOnly: false, thruAt: null, stops: M18_CANONICAL_ORDER.slice() },
};

/* ----------------------------------------------------------------
   Interscambi (NESSUN thru service)
   transferMin PROVVISORIO = 3, tranne gli interscambi in superficie:
   M1811 ↔ M211 = 6, M1811 ↔ SHX04 = 10 (a piedi).
   M1812 ↔ M1019 = 3: sotterraneo (nodo e nome diversi, ma connesse).
---------------------------------------------------------------- */
const _ic18 = (code, network, transferMin = 3, note = '') => ({ code, network, transferMin, note });
const _m18 = (c) => _ic18(c, 'metro');
const _s18 = (c) => _ic18(c, 'suburban');

const M18_INTERCHANGE = {
  M1801: [_m18('M601')],
  M1802: [_m18('M602')],
  M1803: [_s18('KW04')],
  M1805: [_m18('M1008')],
  M1806: [_m18('M320')],
  M1807: [_m18('M1634'), _s18('SK23'), _s18('CK23')],
  M1808: [_s18('LL04')],
  M1809: [_m18('M818'), _m18('M1410')],
  M1810: [_m18('M120'), _s18('JD04')],
  M1811: [_ic18('M211', 'metro', 6, 'a piedi, in superficie'),
          _ic18('SHX04', 'suburban', 10, 'a piedi, in superficie')],
  M1812: [_ic18('M1019', 'metro', 3, 'collegamento sotterraneo (nodo e nome diversi)')],
  M1813: [_m18('M915')],
  M1814: [_m18('M1213')],
  M1815: [_m18('M329'), _m18('M1417')],
  M1816: [_m18('M1706')],
  M1817: [_m18('M1648'), _m18('M1705')],
  M1818: [_m18('M1704')],
  M1819: [_m18('M1703')],
  M1820: [_m18('M1702')],
  M1821: [_m18('M1219'), _m18('M1701')],
};

const M18_NODE_IDS = Object.fromEntries(Object.entries(M18_ST).map(([c, s]) => [c, s.nodeId]));

if (typeof module !== 'undefined') {
  module.exports = {
    M18_META, M18_ST, M18_CANONICAL_ORDER,
    M18_SVC, M18_INTERCHANGE, M18_NODE_IDS,
  };
}

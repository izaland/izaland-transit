/* ================================================================
   M17-DATA.JS — Metro Line 17  (SOLO DATI — timetable m17-tt.js da definire)
   ================================================================
   Colore: #f985bb
   Tipologia: metro pesante sulle due sponde della città, con servizi
   rapidi, thru service su altre linee e due sbinamenti.

   Stazioni: M1701–M1737 (37) + M1720-1 = 38
   Distanze progressive da M1701 Mewakate Kippai (km 0.00).

   Struttura (biforcazione a M1720):
     Ramo A        (M1701–M1719) : Mewakate Kippai → Kishagoi - Exhibitown
     Ramo B        (M1720-1)     : mini-ramo di UNA sola stazione,
                                   capolinea M1720-1 Kingaus Sangu Shikimun,
                                   0.83 km da M1720
     Tratta comune (M1720–M1737) : Kingaus Sangu → Tswankanami Airport

   Relazioni:
     1) M1701 → M1736 : uscita dalla linea e prosecuzione (thru service)
                        su linea suburbana IR (DA DEFINIRE).
     2) Alcuni treni da M1701 terminano a M1737 invece di immettersi
        sul thru service a M1736.

   Servizi (S1–S4), pattern di fermata in M17_PATTERN:
     S1  M1701 → M1736   ferma in tutte le stazioni del percorso
     S2  M1701 → M1736   salta alcune stazioni
     S3  M1720-1 → M1737 solo tratta M1720-1 / M1720–M1737
     S4  M1701 → M1737   rapido, salta molte stazioni

   TODO (istruzioni successive):
     - nomi/tipologia ufficiali dei servizi, headway, ore di servizio
     - thru service M1736 → linea IR (S1, S2?)
     - transferMin reali (qui provvisori = 3)
     - kanji mancanti (stringa vuota)
================================================================ */
'use strict';

const M17_ST = {
  /* ── Ramo A ── */
  M1701:   { n: 'Mewakate Kippai',                    k: '',                    nodeId: 183370188, km:  0.00 },
  M1702:   { n: 'Mewakate - Yōneo Motu',              k: '',                    nodeId: 183370190, km:  2.09 },
  M1703:   { n: 'Koyabisan',                          k: '古谷比山',              nodeId: 183370191, km:  4.65 },
  M1704:   { n: 'Araonazako',                         k: '',                    nodeId: 183370192, km:  5.58 },
  M1705:   { n: 'Niji-Intsushitsa',                   k: '',                    nodeId: 183370193, km:  7.11 },
  M1706:   { n: 'IDK Arena',                          k: 'IDK',                 nodeId: 187047014, km:  8.15 },
  M1707:   { n: 'Kadenmu Nyungu',                     k: '',                    nodeId: 183370194, km:  9.59 },
  M1708:   { n: 'Sainðaul National University',      k: '安作崎國立大學',        nodeId: 183370195, km: 10.65 },
  M1709:   { n: 'Nashikoma',                          k: '刖冬',                nodeId: 145311893, km: 12.23 },
  M1710:   { n: 'Asumiya Nawakai',                    k: '',                    nodeId: 184652211, km: 13.27 },
  M1711:   { n: 'Tahnakusa',                          k: '',                    nodeId: 148428068, km: 14.00 },
  M1712:   { n: 'Sainðaul Central',                  k: '作安崎中央',            nodeId: 229656494, km: 15.01 },
  M1713:   { n: 'Binno',                              k: '苠喃',                nodeId: 229656493, km: 16.69 },
  M1714:   { n: 'Makkeriya',                          k: '平追',                nodeId: 129227936, km: 18.00 },
  M1715:   { n: 'Zaajokinsha',                        k: '蔵汝金舎',            nodeId: 146645344, km: 19.25 },
  M1716:   { n: 'Korishima - Kōwen Shikirihi',       k: '飯渠-公園北域',      nodeId: 146644144, km: 19.83 },
  M1717:   { n: 'Chikayuda',                          k: '宮由駄',              nodeId: 146645343, km: 21.06 },
  M1718:   { n: 'Assemikori',                         k: '刈水飯',              nodeId: 146645342, km: 22.27 },
  M1719:   { n: 'Kishagoi - Exhibitown',              k: '喜舎拘',              nodeId: 169508181, km: 23.55 },
  /* ── Ramo B: mini-ramo di una stazione (km dal bivio M1720) ── */
  'M1720-1': { n: 'Kingaus Sangu Shikimun',           k: '錦額山口北門',        nodeId: 193581001, km: 0.83, kmFromM1720: 0.83 },
  /* ── Tratta comune M1720–M1737 ── */
  M1720:   { n: 'Kingaus Sangu',                      k: '錦額山口',            nodeId: 169508191, km: 25.91 },
  M1721:   { n: 'Miyanore',                           k: '',                    nodeId: 194000877, km: 27.09 },
  M1722:   { n: 'Tagukin Kōwen',                     k: '多牛芩公園',          nodeId: 194000878, km: 28.52 },
  M1723:   { n: 'Urunasāki',                         k: '',                    nodeId: 194000010, km: 29.96 },
  M1724:   { n: 'Iskehashu Honjō',                   k: '一家跖本町',          nodeId: 194000829, km: 31.29 },
  M1725:   { n: 'Shin-Dodonuka',                      k: '新登戸陥',            nodeId: 194000794, km: 32.71 },
  M1726:   { n: 'Dankore Museum of Modern Art (DMMA)', k: '',                   nodeId: 194000793, km: 33.84 },
  M1727:   { n: 'Owonideki Zawahan',                  k: '吹取窊氾',            nodeId: 136187247, km: 34.96 },
  M1728:   { n: 'Shiki Choyarui',                     k: '',                    nodeId: 194000762, km: 35.96 },
  M1729:   { n: 'Ashihara Zumajihan',                 k: '',                    nodeId: 194000746, km: 36.85 },
  M1730:   { n: 'Gundari Kōwen',                     k: '裙橋公園',            nodeId: 123393486, km: 38.66 },
  M1731:   { n: 'Arekuma',                            k: '枝渫',                nodeId: 193996385, km: 39.92 },
  M1732:   { n: 'Wikkaman',                           k: '昱賀満',              nodeId: 180237682, km: 42.63 },
  M1733:   { n: 'Saikade Onuki',                      k: '賽湊午陥',            nodeId: 146815006, km: 45.09 },
  M1734:   { n: 'Nari-Tsemuyori Shundai-adae',        k: '東㽗向峻大前',        nodeId: 194212579, km: 46.17 },
  M1735:   { n: 'Tsemuyori',                          k: '㽗向',                nodeId: 194212578, km: 47.33 },
  M1736:   { n: 'Bibantori',                          k: '美潘市',              nodeId: 194028355, km: 48.56 },
  M1737:   { n: 'Tswankanami Airport',                k: '芽咲空港',            nodeId: 251115566, km: 49.55 },
};

/* Ordine canonico geografico */
const M17_CANONICAL_A = [
  'M1701','M1702','M1703','M1704','M1705','M1706','M1707','M1708','M1709','M1710',
  'M1711','M1712','M1713','M1714','M1715','M1716','M1717','M1718','M1719',
];
const M17_CANONICAL_B = ['M1720-1'];   // mini-ramo, si innesta in M1720
const M17_CANONICAL_COMMON = [
  'M1720','M1721','M1722','M1723','M1724','M1725','M1726','M1727','M1728','M1729',
  'M1730','M1731','M1732','M1733','M1734','M1735','M1736','M1737',
];
/* Percorsi completi */
const M17_CANONICAL_MAIN = [...M17_CANONICAL_A, ...M17_CANONICAL_COMMON];
const M17_CANONICAL_SPUR = [...M17_CANONICAL_B, ...M17_CANONICAL_COMMON];

const M17_META = {
  id:          'M17',
  code:        'M17',
  name:        'Line 17',
  color:       '#f985bb',
  totalKmA:    49.55,                // M1701 → M1737
  totalKmB:    24.47,                // M1720-1 → M1737 (0.83 + 49.55 - 25.91)
  avgSpeedKmh: null,   // da definire
  dwellSec:    null,   // da definire
  junction:    'M1720',
  branches: {
    A: { start: 'M1701',   joinsAt: 'M1720' },
    B: { start: 'M1720-1', joinsAt: 'M1720', stations: 1, kmFromJunction: 0.83 },
  },
  /* Thru service / terminal (da dettagliare) */
  thruService: { at: 'M1736', to: 'IR suburban line (da definire)', from: 'M1701' },
  terminalAlt: { at: 'M1736', terminus: 'M1737' },
};

/* Placeholder: headway da definire con le prossime istruzioni */
const M17_HEADWAY = [];

/* ----------------------------------------------------------------
   Pattern di fermata — colonne: S1 S2 S3 S4
     x = ferma   | = passa senza fermare   - = non servita (n/a)
   NB: M1720-1 riporta '|' per S2 e S4 come da tabella; i due servizi
   non fanno capolinea/transito sul mini-ramo (da confermare).
---------------------------------------------------------------- */
const M17_PATTERN = {
  M1701: 'xx-x',  M1702: 'xx-x',  M1703: 'x|-x',  M1704: 'xx-x',  M1705: 'xx-x',
  M1706: 'x|-x',  M1707: 'x|-x',  M1708: 'xx-x',  M1709: 'xx-x',  M1710: 'x|-x',
  M1711: 'xx-x',  M1712: 'xx-x',  M1713: 'xx-|',  M1714: 'x|-|',  M1715: 'x|-|',
  M1716: 'x|-|',  M1717: 'xx-x',  M1718: 'xx-|',  M1719: 'xx-|',
  'M1720-1': '-|x|',
  M1720: 'x|x|',  M1721: 'x|x|',  M1722: 'x|x|',  M1723: 'xxxx',  M1724: 'x|x|',
  M1725: 'xxx|',  M1726: 'x|x|',  M1727: 'xxx|',  M1728: 'xxxx',  M1729: 'xxxx',
  M1730: 'xxxx',  M1731: 'x|x|',  M1732: 'xxx|',  M1733: 'x|xx',  M1734: 'x|x|',
  M1735: 'x|x|',  M1736: 'xxx|',  M1737: '--xx',
};

const _svcStops = (idx, path) =>
  path.filter(c => M17_PATTERN[c] && M17_PATTERN[c][idx] === 'x');

const M17_SVC = {
  S1: { name: 'S1', color: '#f985bb', cls: 'svc-S1', thruAt: 'M1736',
        stops: _svcStops(0, M17_CANONICAL_MAIN.slice(0, M17_CANONICAL_MAIN.indexOf('M1736') + 1)) },
  S2: { name: 'S2', color: '#f985bb', cls: 'svc-S2', thruAt: 'M1736',
        stops: _svcStops(1, M17_CANONICAL_MAIN.slice(0, M17_CANONICAL_MAIN.indexOf('M1736') + 1)) },
  S3: { name: 'S3', color: '#f985bb', cls: 'svc-S3',
        stops: _svcStops(2, M17_CANONICAL_SPUR) },
  S4: { name: 'S4', color: '#f985bb', cls: 'svc-S4',
        stops: _svcStops(3, M17_CANONICAL_MAIN) },
};

/* ----------------------------------------------------------------
   Interscambi Metro Line 17 ↔ altre reti
   transferMin PROVVISORIO = 3 (non fornito)
---------------------------------------------------------------- */
const _ic = (code, network) => ({ code, network, transferMin: 3, note: '' });
const _m = (c) => _ic(c, 'metro');
const _s = (c) => _ic(c, 'suburban');

const M17_INTERCHANGE = {
  M1701: [_m('M1219')],
  M1708: [_m('M1416')],
  M1709: [_m('M812'), _s('SK28')],
  M1711: [_m('M813'), _m('M1209')],
  M1712: [_m('M117'), _m('M814'), _s('LL01'), _s('SK26'), _s('TS13'), _s('JD01')],
  M1713: [_m('M452'), _s('LL02'), _s('SK25'), _s('TS12')],
  M1714: [_s('CK21')],
  M1717: [_m('M1011')],
  M1718: [_m('M606')],
  M1719: [_m('M801'), _m('M901'), _s('KW00')],
  M1727: [_m('M1108')],
  M1732: [_m('M711')],
};

const M17_NODE_IDS = Object.fromEntries(
  Object.entries(M17_ST).map(([c, s]) => [c, s.nodeId])
);

if (typeof module !== 'undefined') {
  module.exports = {
    M17_META, M17_ST,
    M17_CANONICAL_A, M17_CANONICAL_B, M17_CANONICAL_COMMON,
    M17_CANONICAL_MAIN, M17_CANONICAL_SPUR,
    M17_HEADWAY, M17_PATTERN, M17_SVC, M17_INTERCHANGE, M17_NODE_IDS,
  };
}

/* ================================================================
   M16-DATA.JS — Metro Line 16 (#816cb1)  (SOLO DATI — m16-tt.js da definire)
   ================================================================
   52 stazioni · 76.09 km · la linea piu' lunga del sistema
   Velocita' commerciale ~44.8 km/h (S1, sosta inclusa)
   Capolinea: Tsukitonai (M1601) ↔ Kamaishi Kaiyan Kōwen (M1652)

   Servizi:
     S1  All-stop   M1601 → M1652   tutte le stazioni
     S2  Rapido     M1601 → M1652   28 fermate (M16_S2_STOPS)
     S3  Limitato 1 M1630 → M1652   tutte le stazioni del tratto
     S4  Limitato 2 M1601 → M1627   tutte le stazioni del tratto
   (M1628 e M1629 non sono coperte da S3/S4: solo S1/S2)

   Origini intermedie (M16_ORIGINS) — SOLO S1, per far entrare i
   treni in linea all'apertura e per le ultime corse (stesse origini):
     M1601 → M1652 | M1609 → M1652 | M1617 → M1652
     M1641 → M1601 | M1652 → M1601
   Ogni corsa va verso il capolinea PIU' LONTANO/opposto. Le stazioni
   hanno infrastruttura di inversione / invio in deposito.

   Orario di servizio (M16_HOURS): dalle 04:45 all'01:00 (ultimo treno
   in arrivo al capolinea, anche intermedio).
   Frequenze S1 (M16_HEADWAY):
     alba 04:45–06:50 e sera 22:00–01:00 : 8 min
     giorno 5 min; punta 2 min (07:00–09:30, 17:00–20:00, come
     M11/M14/M15); super punta 90 s (07:45–08:30).
   Frequenze S2 rapido (M16_S2_HEADWAY): ogni 15 min, 06:30–22:30,
   entrambe le direzioni.
   Frequenze S3 / S4: 1 S3 e 1 S4 ogni 4 S1 (headway = 4 x S1 in
   ogni fascia): 20 min giorno, 8 punta, 6 super punta, 32 min
   alba/sera.

   Thru service: NESSUNO.
   M1628 Kishagoi-Exhibitown ha M801/KW00 come interscambio normale
   (non e' un thru per M16).

   Interscambi a piedi: M1644 ↔ M918 (9 min a piedi, Shin-Tsaikikori);
   M1637 ↔ LL06 (5 min a piedi, Punoidan — Loop Line; stesso
   collegamento da M122 in m1-data.js).

   Ricalibrazione tempi: il modello precedente (sosta 20 s, 85.5 km/h
   di punta, 50 km/h commerciali) era troppo veloce per una linea
   all-stop (es. M1601→M1610, 13 km / 9 tratte, ~15.5 min). Nuovi
   parametri, in linea con le metro urbane pesanti di Seul (linee 5/7):
   sosta 30 s, 80 km/h di punta, acc 0.9 / dec 1.0 m/s2.

   TODO:
     - sosta (dwellSec) 30 s — da confermare
     - orari di servizio di S3/S4: assunti = S1 (04:45–01:00)
     - ultime partenze (M16_HOURS.lastDep) derivate da un modello
       cinematico (0.9/1.0 m/s2, 30 s sosta, 80 km/h di punta):
       da ricalcolare con m16-tt.js
     - transferMin provvisorio 3 min (tranne M918 = 9, LL06 = 5) — da rivedere
     - kanji mancanti (stringa vuota)
     - registrazione in station-inspector.html e interscambi inversi
       nelle altre linee: NON ancora fatta
================================================================ */
'use strict';

const M16_ST = {
  M1601: { n: 'Tsukitonai',                k: '',                nodeId: 188445611, km:  0.00 },
  M1602: { n: 'Waneki Byowin',             k: '',                nodeId: 188445612, km:  1.61 },
  M1603: { n: 'Waneki',                    k: '窑名',            nodeId: 188445930, km:  2.74 },
  M1604: { n: 'Waneki Irinbe',             k: '',                nodeId: 218588320, km:  4.12 },
  M1605: { n: 'Nūhaðu',                   k: '',                nodeId: 218588321, km:  5.52 },
  M1606: { n: 'Shiki-Nūhaðu',             k: '',                nodeId: 218588322, km:  6.72 },
  M1607: { n: 'Okatsaka',                  k: '',                nodeId: 218585129, km:  8.34 },
  M1608: { n: 'Shiki-Yanimoto',            k: '',                nodeId: 218522496, km: 10.70 },
  M1609: { n: 'Minokashira',               k: '',                nodeId: 146815991, km: 11.78 },
  M1610: { n: 'Wayugachi-Nagahoji',        k: '',                nodeId: 216127444, km: 13.01 },
  M1611: { n: 'Ekaruni',                   k: '',                nodeId: 204334671, km: 14.39 },
  M1612: { n: 'Pwakkobe',                  k: '',                nodeId: 196658312, km: 15.69 },
  M1613: { n: 'Tsuruna-Mistukane',         k: '',                nodeId: 196658314, km: 18.63 },
  M1614: { n: 'Shutazai',                  k: '守多彩',          nodeId: 136187238, km: 20.13 },
  M1615: { n: 'Konegisa Shavunsan',        k: '',                nodeId: 262364033, km: 21.90 },
  M1616: { n: 'Ageni Tsaron',              k: '',                nodeId: 136005577, km: 23.05 },
  M1617: { n: 'Konegisa Shujaminka',       k: '',                nodeId: 194168723, km: 24.12 },
  M1618: { n: 'Shiittaru Konegisa',        k: '',                nodeId: 147984629, km: 24.99 },
  M1619: { n: 'Konegisa Eigandan',         k: '干鮃永玵段',      nodeId: 123393753, km: 25.89 },
  M1620: { n: 'Kirifunu Sejiha',           k: '',                nodeId: 144964622, km: 27.08 },
  M1621: { n: 'Ipporai - Konegisa',        k: '一蒲崍干鮃',      nodeId: 136114713, km: 28.45 },
  M1622: { n: 'Dodonuka',                  k: '登戸陥',          nodeId: 169508180, km: 30.43 },
  M1623: { n: 'Nokkwada',                  k: '',                nodeId: 169508242, km: 31.96 },
  M1624: { n: 'Ruhseikon',                 k: '硫昆',            nodeId: 169508252, km: 33.27 },
  M1625: { n: 'Wannae',                    k: '',                nodeId: 169508255, km: 34.50 },
  M1626: { n: 'Samopuke',                  k: '',                nodeId: 169508221, km: 35.80 },
  M1627: { n: 'Kingaus Sangu',             k: '錦額山口',        nodeId: 169508191, km: 37.41 },
  M1628: { n: 'Kishagoi - Exhibitown',     k: '喜舎拘',          nodeId: 169508181, km: 39.63 },
  M1629: { n: 'Assemikori',                k: '刈水飯',          nodeId: 146645342, km: 40.99 },
  M1630: { n: 'Chikayuda',                 k: '宮由駄',          nodeId: 146645343, km: 42.21 },
  M1631: { n: 'Kiikudai-adae',             k: '熈育大前',        nodeId: 169590630, km: 44.24 },
  M1632: { n: 'Kanpayu Kahten',            k: '',                nodeId: 169590621, km: 45.72 },
  M1633: { n: 'Tsenduma',                  k: '',                nodeId: 145985092, km: 46.54 },
  M1634: { n: 'Kasaraki',                  k: '',                nodeId: 124064335, km: 47.37 },
  M1635: { n: 'Higikura',                  k: '矢九田',          nodeId: 124064327, km: 48.30 },
  M1636: { n: 'Jufurai Kōwen Niji',        k: '朱布来公園西',    nodeId: 124064344, km: 49.35 },
  M1637: { n: 'Tensari Omuhate',           k: '典河〇蔦',        nodeId: 183370183, km: 50.97 },
  M1638: { n: 'Shotsumaichi',              k: '',                nodeId: 124295240, km: 52.62 },
  M1639: { n: 'Kairumuka',                 k: '',                nodeId: 124072538, km: 54.38 },
  M1640: { n: 'Omenika Jinatsu',           k: '弁丹佳治芝',      nodeId: 176667824, km: 60.34 },
  M1641: { n: 'Kushigae',                  k: '旧市街',          nodeId: 176666299, km: 62.06 },
  M1642: { n: 'Kushigae Otsumi',           k: '',                nodeId: 176667797, km: 63.19 },
  M1643: { n: 'Sasakuma',                  k: '',                nodeId: 124295466, km: 64.52 },
  M1644: { n: 'Zohakoshi Panahidano',      k: '',                nodeId: 183370182, km: 65.77 },
  M1645: { n: 'Ðaihate',                  k: '',                nodeId: 183370181, km: 67.01 },
  M1646: { n: 'Nworisahta',                k: '',                nodeId: 183370173, km: 68.97 },
  M1647: { n: 'Powanuki',                  k: '',                nodeId: 183370165, km: 69.22 },
  M1648: { n: 'Niji-Intsushitsa',          k: '',                nodeId: 183370193, km: 70.78 },
  M1649: { n: 'Pogubiinsan Motu',          k: '',                nodeId: 183370164, km: 72.72 },
  M1650: { n: 'Yahara',                    k: '',                nodeId: 183370163, km: 73.68 },
  M1651: { n: 'Kaimashi-kō',               k: '',                nodeId: 126493369, km: 75.09 },
  M1652: { n: 'Kamaishi Kaiyan Kōwen',     k: '',                nodeId: 126493368, km: 76.09 },
};

/* Ordine canonico geografico: M1601 → M1652 */
const M16_CANONICAL_ORDER = Array.from({ length: 52 }, (_, i) => 'M16' + String(i + 1).padStart(2, '0'));

const M16_META = {
  id:          'M16',
  code:        'M16',
  name:        'Line 16',
  nameJa:      '',
  color:       '#816cb1',
  totalKm:     76.09,
  stations:    52,
  avgSpeedKmh: 44.8,
  dwellSec:    30,   // TODO: da confermare (era 20 s, troppo veloce)
};

/* ----------------------------------------------------------------
   Servizi
---------------------------------------------------------------- */
const M16_S2_STOPS = [
  'M1601', 'M1602', 'M1603', 'M1607', 'M1609', 'M1612', 'M1614', 'M1616',
  'M1619', 'M1621', 'M1622', 'M1625', 'M1627', 'M1628', 'M1629', 'M1630',
  'M1631', 'M1634', 'M1636', 'M1637', 'M1638', 'M1640', 'M1641', 'M1643',
  'M1646', 'M1648', 'M1651', 'M1652',
];

const _range16 = (from, to) =>
  M16_CANONICAL_ORDER.slice(M16_CANONICAL_ORDER.indexOf(from), M16_CANONICAL_ORDER.indexOf(to) + 1);

const M16_SVC = {
  S1: { name: 'S1', type: 'local',   label: 'All-stop',  labelJa: '各駅停車', color: '#816cb1', cls: 'svc-S1',
        peakOnly: false, thruAt: null, stops: M16_CANONICAL_ORDER.slice() },
  S2: { name: 'S2', type: 'rapid',   label: 'Rapid',     labelJa: '快速',   color: '#816cb1', cls: 'svc-S2',
        peakOnly: false, thruAt: null, stops: M16_S2_STOPS.slice() },
  S3: { name: 'S3', type: 'limited', label: 'Limited 1', labelJa: '',       color: '#816cb1', cls: 'svc-S3',
        peakOnly: false, thruAt: null, stops: _range16('M1630', 'M1652') },
  S4: { name: 'S4', type: 'limited', label: 'Limited 2', labelJa: '',       color: '#816cb1', cls: 'svc-S4',
        peakOnly: false, thruAt: null, stops: _range16('M1601', 'M1627') },
};

/* ----------------------------------------------------------------
   Origini intermedie — SOLO S1
   Servono a far entrare i treni in linea all'apertura e per le
   ultime corse (stesse origini). Ogni corsa va verso il capolinea
   piu' lontano/opposto. 'fwd' = M1601 → M1652, 'rev' = M1652 → M1601.
   Le stazioni supportano inversione / invio in deposito.
---------------------------------------------------------------- */
const M16_ORIGINS = [
  { from: 'M1601', to: 'M1652', dir: 'fwd', service: 'S1' },
  { from: 'M1609', to: 'M1652', dir: 'fwd', service: 'S1' },
  { from: 'M1617', to: 'M1652', dir: 'fwd', service: 'S1' },
  { from: 'M1641', to: 'M1601', dir: 'rev', service: 'S1' },
  { from: 'M1652', to: 'M1601', dir: 'rev', service: 'S1' },
].map(o => ({
  ...o,
  stops: o.dir === 'fwd'
    ? _range16(o.from, o.to)
    : _range16(o.to, o.from).slice().reverse(),
}));

/* ----------------------------------------------------------------
   Orario di servizio
   Primo treno 04:45; l'ultimo treno ARRIVA al capolinea (anche
   intermedio) alle 01:00 (= '25:00'). lastDep derivato (arrotondato
   per difetto al minuto) dai tempi S1 del modello cinematico
   (S1 101:58 · da M1609 86:00 · da M1617 69:37 · da M1641 81:40).
---------------------------------------------------------------- */
const M16_HOURS = {
  first:       '04:45',
  lastArrival: '25:00',
  lastDep: {
    'M1601>M1652': '23:18',
    'M1609>M1652': '23:33',
    'M1617>M1652': '23:50',
    'M1641>M1601': '23:38',
    'M1652>M1601': '23:18',
  },
};

/* ----------------------------------------------------------------
   Frequenze S1 (headwayMin in minuti; 1.5 = 90 s)
   Alba (04:45–06:50) e sera (22:00–01:00): 8 min. Giorno 5 min.
   Punta come M11/M14/M15: 07:00–09:30 e 17:00–20:00 a 2 min.
   Super punta 07:45–08:30 a 90 s.
---------------------------------------------------------------- */
const M16_HEADWAY = [
  { from: '04:45', to: '06:50', headwayMin: 8 },
  { from: '06:50', to: '07:00', headwayMin: 5 },
  { from: '07:00', to: '07:45', headwayMin: 2 },
  { from: '07:45', to: '08:30', headwayMin: 1.5 },
  { from: '08:30', to: '09:30', headwayMin: 2 },
  { from: '09:30', to: '17:00', headwayMin: 5 },
  { from: '17:00', to: '20:00', headwayMin: 2 },
  { from: '20:00', to: '22:00', headwayMin: 5 },
  { from: '22:00', to: '25:00', headwayMin: 8 },
];

/* Frequenze S2 rapido: ogni 15 min, entrambe le direzioni */
const M16_S2_HEADWAY = [
  { from: '06:30', to: '22:30', headwayMin: 15 },
];

/* S3 e S4: 1 S3 e 1 S4 ogni 4 S1 → headway = 4 x headway S1 */
const M16_S3_HEADWAY = M16_HEADWAY.map(b => ({ ...b, headwayMin: b.headwayMin * 4 }));
const M16_S4_HEADWAY = M16_HEADWAY.map(b => ({ ...b, headwayMin: b.headwayMin * 4 }));

/* ----------------------------------------------------------------
   Interscambi (NESSUN thru service)
   transferMin PROVVISORIO = 3, tranne M1644 ↔ M918 = 9 (a piedi)
   e M1637 ↔ LL06 = 5 (a piedi)
---------------------------------------------------------------- */
const _ic16 = (code, network, transferMin = 3, note = '') => ({ code, network, transferMin, note });
const _m16 = (c) => _ic16(c, 'metro');
const _s16 = (c) => _ic16(c, 'suburban');

const M16_INTERCHANGE = {
  M1603: [_s16('SK47')],
  M1612: [_m16('M513'), _m16('M728')],
  M1613: [_m16('M1322')],
  M1614: [_m16('M725'), _m16('M1116'), _s16('TS20')],
  M1616: [_m16('M1524')],
  M1619: [_m16('M503'), _m16('M719')],
  M1621: [_m16('M423'), _m16('M616')],
  M1622: [_s16('CK14'), _s16('CO26')],
  M1627: [_m16('M1720')],
  M1628: [_m16('M801'), _m16('M901'), _m16('M1719'), _s16('KW00')],
  M1629: [_m16('M606'), _m16('M1718')],
  M1630: [_m16('M1011'), _m16('M1717')],
  M1631: [_s16('TS11')],
  M1633: [_m16('M321')],
  M1634: [_s16('SK23'), _s16('CK23')],
  M1636: [_m16('M820'), _s16('LL05')],
  M1637: [_m16('M122'), _ic16('LL06', 'suburban', 5, 'a piedi, Punoidan (Loop Line)')],
  M1638: [_m16('M1408')],
  M1640: [_m16('M213'), _s16('SHX05')],
  M1643: [_m16('M1022')],
  M1644: [_m16('M331'), _ic16('M918', 'metro', 9, 'a piedi, Shin-Tsaikikori')],
  M1645: [_m16('M332')],
  M1646: [_m16('M1215')],
  M1647: [_m16('M1419')],
  M1648: [_m16('M1705')],
};

const M16_NODE_IDS = Object.fromEntries(Object.entries(M16_ST).map(([c, s]) => [c, s.nodeId]));

if (typeof module !== 'undefined') {
  module.exports = {
    M16_META, M16_ST, M16_CANONICAL_ORDER, M16_S2_STOPS,
    M16_SVC, M16_ORIGINS, M16_HOURS, M16_HEADWAY, M16_S2_HEADWAY,
    M16_S3_HEADWAY, M16_S4_HEADWAY, M16_INTERCHANGE, M16_NODE_IDS,
  };
}

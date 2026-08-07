/* ================================================================
   M6-DATA.JS — Metro Line 6
   ================================================================
   36 stazioni · ~47 km
   Distanze progressive da M601 (Nari-Gotsurindai) a M636 (Saibu Panatsawa).

   Interscambi principali:
     M601 Nari-Gotsurindai         — M1801
     M602 Norihoi                  — M1802
     M606 Assemikori               — M16??, M17?? (TBD)
     M608 Ishitsuma                — M804
     M609 Abawauri                 — M416
     M610 Shimamera                — M417, AX05, M203, TS14, M1111
     M611 Nihkyonta                — M418, SK34, TS15, CK17
     M612 Kasakuri                 — M419, AX04, KD35, K02
     M613 Buslyu Toshi             — M420
     M614 Kotoshiruna              — M421, SK36
     M615 Shiki-Hoze               — M422, HO04
     M616 Ipporai - Konegisa       — M423
     M617 Ipporai - Owonideki      — M424, M1110
     M618 Ipporai-Senpyan          — M425, TS18
     M620 Otsumi-Nawadae           — M1315
     M623 Ezaesomu                 — M717
     M625 Niji-Urenosomi           — M17?? (TBD)
     M628 Kōtō Satahappi           — KD41
     M631 Pankyō-Nari              — (no interchange listed)
     M635 Panatsawa                — K120
================================================================ */
'use strict';

const M6_ST = {
  M601: { n: 'Nari-Gotsurindai',        k: '東御通琳台',     km:  0.00, nodeId: 229672837 },
  M602: { n: 'Norihoi',                 k: '翼浮',           km:  1.02, nodeId: 229672838 },
  M603: { n: 'Semukudai Kōwen',         k: '世牧臺公園',     km:  2.29, nodeId: 229672839 },
  M604: { n: 'Kiranne',                 k: '',               km:  4.03, nodeId: 129227659 },
  M605: { n: 'Kumasui Niho',            k: '庫馬水二湖',     km:  5.16, nodeId: 229672840 },
  M606: { n: 'Assemikori',              k: '刈水飯',         km:  6.22, nodeId: 146645342 },
  M607: { n: 'Tassenon',               k: '村溝崘',         km:  7.05, nodeId: 229672841 },
  M608: { n: 'Ishitsuma',               k: '実維',           km:  8.25, nodeId: 129227942 },
  M609: { n: 'Abawauri',               k: '燕宦',           km:  9.64, nodeId: 129227893 },
  M610: { n: 'Shimamera',              k: '渠瀬田',         km: 11.20, nodeId: 368583227 },
  M611: { n: 'Nihkyonta',              k: '濱角',           km: 12.58, nodeId: 368583226 },
  M612: { n: 'Kasakuri',               k: '鯛巻',           km: 16.33, nodeId: 127914807 },
  M613: { n: 'Buslyu Toshi',           k: '物流都市',       km: 17.51, nodeId: 136114709 },
  M614: { n: 'Kotoshiruna',            k: '細荒奈',         km: 18.82, nodeId: 136114710 },
  M615: { n: 'Shiki-Hoze',             k: '北舗摧',         km: 20.40, nodeId: 136114711 },
  M616: { n: 'Ipporai - Konegisa',     k: '一蒲崍干鮃',     km: 21.18, nodeId: 136114713 },
  M617: { n: 'Ipporai - Owonideki',    k: '一蒲崍吹取',     km: 22.57, nodeId: 274155028 },
  M618: { n: 'Ipporai-Senpyan',        k: '一蒲崍船駢',     km: 23.72, nodeId: 123393772 },
  M619: { n: 'Ipporai - Shindari',     k: '一蒲崍新艏',     km: 24.89, nodeId: 136114715 },
  M620: { n: 'Otsumi-Nawadae',         k: '南兆先',         km: 25.86, nodeId: 123393139 },
  M621: { n: 'Yemendawi',              k: '維綿富',         km: 27.24, nodeId: 146814982 },
  M622: { n: 'Ðunarishi',              k: '享虚',           km: 28.17, nodeId: 146814983 },
  M623: { n: 'Ezaesomu',               k: '皃築',           km: 29.36, nodeId: 123393744 },
  M624: { n: 'Sofuhaja',               k: '泴波社',         km: 30.36, nodeId: 146814984 },
  M625: { n: 'Niji-Urenosomi',         k: '',               km: 31.27, nodeId: 146815008 },
  M626: { n: 'Upōya',                  k: '雨芳野',         km: 32.48, nodeId: 441639507 },
  M627: { n: 'Semeiji',                k: '勢明寺',         km: 33.85, nodeId: 441639506 },
  M628: { n: 'Kōtō Satahappi',         k: '',               km: 35.05, nodeId: 194212210 },
  M629: { n: 'Keiyān Kutīn',           k: '桂陽區廳',       km: 36.19, nodeId: 441639503 },
  M630: { n: 'Kisshōnli',              k: '吉祥里',         km: 37.54, nodeId: 441639504 },
  M631: { n: 'Pankyō-Nari',            k: '岅嶠東',         km: 40.42, nodeId: 327318463 },
  M632: { n: 'Nari-Mitsukuno',         k: '東未抖綱',       km: 42.36, nodeId: 411797110 },
  M633: { n: 'Ruisekoi',               k: '聖粋伊',         km: 43.63, nodeId: 292597869 },
  M634: { n: 'Angonnawa',              k: '杏原',           km: 45.20, nodeId: 411797108 },
  M635: { n: 'Panatsawa',              k: '若林',           km: 46.42, nodeId: 259962168 },
  M636: { n: 'Saibu Panatsawa',        k: '西部若林',       km: 47.44, nodeId: 259962136 },
};

const M6_CANONICAL_ORDER = [
  'M601', 'M602', 'M603', 'M604', 'M605', 'M606', 'M607', 'M608',
  'M609', 'M610', 'M611', 'M612', 'M613', 'M614', 'M615', 'M616',
  'M617', 'M618', 'M619', 'M620', 'M621', 'M622', 'M623', 'M624',
  'M625', 'M626', 'M627', 'M628', 'M629', 'M630', 'M631', 'M632',
  'M633', 'M634', 'M635', 'M636',
];

const M6_META = {
  id:          'M6',
  code:        'M6',
  name:        'Line 6',
  nameJa:      '',
  color:       '#3465a4',
  totalKm:     47.44,
  stations:    36,
  avgSpeedKmh: 35,
  dwellSec:    20,
};

/* ----------------------------------------------------------------
   Interscambi Metro Line 6 ↔ altre reti
---------------------------------------------------------------- */
const M6_INTERCHANGE = {
  M601: [
    { code: 'M1801', network: 'metro',    transferMin: 3,
      note: 'Nari-Gotsurindai — M18 line' },
  ],
  M602: [
    { code: 'M1802', network: 'metro',    transferMin: 3,
      note: 'Norihoi — M18 line' },
  ],
  M604: [
    { code: 'KW01',  network: 'suburban', transferMin: 4,
      note: 'Kiranne — KW line' },
  ],
  M606: [
    // M16 e M17: codici stazione TBD
    // { code: 'M16XX', network: 'metro', transferMin: 3, note: 'Assemikori — M16 line (TBD)' },
    // { code: 'M17XX', network: 'metro', transferMin: 3, note: 'Assemikori — M17 line (TBD)' },
  ],
  M608: [
    { code: 'M804',  network: 'metro',    transferMin: 3,
      note: 'Ishitsuma — M8 line' },
  ],
  M609: [
    { code: 'M416',  network: 'metro',    transferMin: 3,
      note: 'Abawauri — M4 line' },
  ],
  M610: [
    { code: 'M417',   network: 'metro',    transferMin: 3,
      note: 'Shimamera — M4 line' },
    { code: 'AX05',   network: 'ax',       transferMin: 5,
      note: 'Shimamera — Airport Express' },
    { code: 'M203',   network: 'metro',    transferMin: 3,
      note: 'Shimamera — M2 line' },
    { code: 'TS14',   network: 'suburban', transferMin: 4,
      note: 'Shimamera — TS line' },
    { code: 'M1111',  network: 'metro',    transferMin: 3,
      note: 'Shimamera — M11 line' },
  ],
  M611: [
    { code: 'M418',  network: 'metro',    transferMin: 3,
      note: 'Nihkyonta — M4 line' },
    { code: 'SK34',  network: 'suburban', transferMin: 4,
      note: 'Nihkyonta — Seishaku Line' },
    { code: 'TS15',  network: 'suburban', transferMin: 4,
      note: 'Nihkyonta — TS line' },
    { code: 'CK17',  network: 'suburban', transferMin: 4,
      note: 'Nihkyonta — CK line' },
  ],
  M612: [
    { code: 'M419',  network: 'metro',    transferMin: 3,
      note: 'Kasakuri — M4 line' },
    { code: 'AX04',  network: 'ax',       transferMin: 5,
      note: 'Kasakuri — Airport Express' },
    { code: 'KD35',  network: 'suburban', transferMin: 4,
      note: 'Kasakuri — Kidai Line' },
    { code: 'K02',   network: 'suburban', transferMin: 4,
      note: 'Kasakuri — K line' },
  ],
  M613: [
    { code: 'M420',  network: 'metro',    transferMin: 3,
      note: 'Buslyu Toshi — M4 line' },
  ],
  M614: [
    { code: 'M421',  network: 'metro',    transferMin: 3,
      note: 'Kotoshiruna — M4 line' },
    { code: 'SK36',  network: 'suburban', transferMin: 4,
      note: 'Kotoshiruna — Seishaku Line' },
  ],
  M615: [
    { code: 'M422',  network: 'metro',    transferMin: 3,
      note: 'Shiki-Hoze — M4 line' },
    { code: 'HO04',  network: 'suburban', transferMin: 4,
      note: 'Shiki-Hoze — HO line' },
  ],
  M616: [
    { code: 'M423',  network: 'metro',    transferMin: 3,
      note: 'Ipporai - Konegisa — M4 line' },
  ],
  M617: [
    { code: 'M424',  network: 'metro',    transferMin: 3,
      note: 'Ipporai - Owonideki — M4 line' },
    { code: 'M1110', network: 'metro',    transferMin: 3,
      note: 'Ipporai - Owonideki — M11 line' },
  ],
  M618: [
    { code: 'M425',  network: 'metro',    transferMin: 3,
      note: 'Ipporai-Senpyan — M4 line' },
    { code: 'TS18',  network: 'suburban', transferMin: 4,
      note: 'Ipporai-Senpyan — TS line' },
  ],
  M620: [
    { code: 'M1315', network: 'metro',    transferMin: 3,
      note: 'Otsumi-Nawadae — M13 line' },
  ],
  M623: [
    { code: 'M717',  network: 'metro',    transferMin: 3,
      note: 'Ezaesomu — M7 line' },
  ],
  M625: [
    // M17: codice stazione TBD
    // { code: 'M17XX', network: 'metro', transferMin: 3, note: 'Niji-Urenosomi — M17 line (TBD)' },
  ],
  M628: [
    { code: 'KD41',  network: 'suburban', transferMin: 4,
      note: 'Kōtō Satahappi — Kidai Line' },
  ],
  M635: [
    { code: 'K120',  network: 'suburban', transferMin: 4,
      note: 'Panatsawa — K line' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M6_META, M6_ST, M6_CANONICAL_ORDER, M6_INTERCHANGE };
}

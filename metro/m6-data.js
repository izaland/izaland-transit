/* ================================================================
   M6-DATA.JS — Metro Line 6
   ================================================================
   36 stazioni · ~47 km
   Distanze progressive da M601 (Nari-Gotsurindai) a M636 (Saibu Panatsawa).

   Interscambi principali:
     M601 Nari-Gotsurindai         — M1801
     M602 Norihoi                  — M1802
     M606 Assemikori               — M1718, M16?? (TBD)
     M608 Ishitsuma                — M804
     M609 Abawauri                 — M416
     M610 Shimamera                — M417, AX05, M203, TS14
     M611 Nihkyonta                — M418, SK34, TS15, CK17
     M612 Kasakuri                 — M419, AX04, KD35, K02
     M613 Buslyu Toshi             — M420
     M614 Kotoshiruna              — M421, SK36
     M615 Shiki-Hoze               — M422, HO04
     M616 Ipporai - Konegisa       — M423
     M617 Ipporai - Owonideki      — M424, M1110
     M618 Ipporai-Senpyan          — M425, TS18
     M620 Otsumi-Nawadae           — M1316
     M623 Ezaesomu                 — M712
     M625 Niji-Urenosomi           — M1516
     M628 Kōtō Satahappi           — KD41
     M631 Pwidely-Nari            — (no interchange listed)
     M635 Panatsawa                — K120
================================================================ */
'use strict';

const M6_ST = {
  M601: { n: 'Nari-Gotsurindai',        k: '東御通琳台',     km:  0.00, nodeId: 229672837 },
  M602: { n: 'Norihoi',                 k: '翼浮',           km:  1.02, nodeId: 229672838 },
  M603: { n: 'Semukudai Kōwen',         k: '世牧臺公園',     km:  2.29, nodeId: 229672839 },
  M604: { n: 'Kiranne',                 k: '',               km:  4.03, nodeId: 129227659 },
  M605: { n: 'Kumasui Niho',            k: '師馬水二湖',     km:  5.16, nodeId: 229672840 },
  M606: { n: 'Assemikori',              k: '刈水飯',         km:  6.22, nodeId: 146645342 },
  M607: { n: 'Tassenon',               k: '村溝崘',         km:  7.05, nodeId: 229672841 },
  M608: { n: 'Ishitsuma',               k: '実維',           km:  8.25, nodeId: 129227942 },
  M609: { n: 'Abawauri',               k: '燕宦',           km:  9.64, nodeId: 129227893 },
  M610: { n: 'Shimamera',              k: '渠瀬田',         km: 11.20, nodeId: 368583227 },
  M611: { n: 'Nihkyonta',              k: '澱角',           km: 12.58, nodeId: 368583226 },
  M612: { n: 'Kasakuri',               k: '鯛巻',           km: 16.33, nodeId: 127914807 },
  M613: { n: 'Buslyu Toshi',           k: '物流都市',       km: 17.51, nodeId: 136114709 },
  M614: { n: 'Kotoshiruna',            k: '細荒奈',         km: 18.82, nodeId: 136114710 },
  M615: { n: 'Shiki-Hoze',             k: '北舗摧',         km: 20.40, nodeId: 136114711 },
  M616: { n: 'Ipporai - Konegisa',     k: '一蒲崍干酃',     km: 21.18, nodeId: 136114713 },
  M617: { n: 'Ipporai - Owonideki',    k: '一蒲崍吹取',     km: 22.57, nodeId: 274155028 },
  M618: { n: 'Ipporai-Senpyan',        k: '一蒲崍船駢',     km: 23.72, nodeId: 123393772 },
  M619: { n: 'Ipporai - Shindari',     k: '一蒲崍新艦',     km: 24.89, nodeId: 136114715 },
  M620: { n: 'Otsumi-Nawadae',         k: '南兆先',         km: 25.86, nodeId: 123393139 },
  M621: { n: 'Yemendawi',              k: '維綿富',         km: 27.24, nodeId: 146814982 },
  M622: { n: 'Ðunarishi',              k: '享虚',           km: 28.17, nodeId: 146814983 },
  M623: { n: 'Ezaesomu',               k: '皃築',           km: 29.36, nodeId: 123393744 },
  M624: { n: 'Sofuhaja',               k: '沴波社',         km: 30.36, nodeId: 146814984 },
  M625: { n: 'Niji-Urenosomi',         k: '',               km: 31.27, nodeId: 146815008 },
  M626: { n: 'Upōya',                  k: '雨芳野',         km: 32.48, nodeId: 441639507 },
  M627: { n: 'Semeiji',                k: '勢明寺',         km: 33.85, nodeId: 441639506 },
  M628: { n: 'Kōtō Satahappi',         k: '',               km: 35.05, nodeId: 194212210 },
  M629: { n: 'Keiyān Kutīn',           k: '桂陽區廳',       km: 36.19, nodeId: 441639503 },
  M630: { n: 'Kisshōnli',              k: '吉祥里',         km: 37.54, nodeId: 441639504 },
  M631: { n: 'Pwidely-Nari',            k: '塅岦東',         km: 40.42, nodeId: 327318463 },
  M632: { n: 'Nari-Mitsukuno',         k: '東未抖綱',       km: 42.36, nodeId: 411797110 },
  M633: { n: 'Ruisekoi',               k: '聖粋伊',         km: 43.63, nodeId: 292597869 },
  M634: { n: 'Angonnawa',              k: '杏原',           km: 45.20, nodeId: 411797108 },
  M635: { n: 'Panatsawa',              k: '若林',           km: 46.42, nodeId: 259962168 },
  M636: { n: 'Saibu Panatsawa',        k: '西部若林',       km: 47.44, nodeId: 259962136 },
};

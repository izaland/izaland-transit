/* ================================================================
   SUBURBAN-DATA.JS — Izarail Capital Suburban Network
   Contiene dati stazioni e metadati di tutte le linee suburbane
   pendolari Izarail di Sainðaul.

   Struttura:
     SUBURBAN_LINES[lineId] = {
       id, name, nameJa, color,
       circular  {boolean}  — true per la Loop Line,
       headwayPeak       {number}  minuti,
       headwayOffPeak    {number}  minuti,
       stations  [ { code, name, kanji, km } ]  — km dal capolinea A
     }

   SUBURBAN_INTERCHANGE:
     Mappa codice-stazione suburbana → array di codici equivalenti
     su reti IZX/AX. Usata da SuburbanRouter per costruire percorsi
     con cambio cross-network.

     LL01 (Sainðaul Central) ↔ K01, R01, E01, AX06
       Sezione storica sopraelevata ↔ sezione sotterranea IZX/AX
       Tempo di trasferimento raccomandato: 10 min

     LL17 (Herubori) ↔ AX07
       Loop Line sopraelevata ↔ Airport Express sotterranea
       Tempo di trasferimento raccomandato: 10 min

     KD25 ↔ LL09  (Igashikura/Taishindai)
     KD26 ↔ LL10  (Hayatogaru)
     KD35 ↔ AX04  (Kasakuri)
     KD36 ↔ K101  (Sakamuso)
     KD37 ↔ K102, AX21  (Showanul — triangolo KD↔IZX↔AX completo)

   Nota km Loop Line:
     Distanze progressive reali da rilievo cartografico.
     Circuito totale: 24.41 km (LL01 → ... → LL19 → LL01).
     Tratto di chiusura LL19→LL01: 24.41 − 23.6 = 0.81 km.
================================================================ */
'use strict';

/* ================================================================
   SUBURBAN_INTERCHANGE
   Mappa: codice suburbano → [codici IZX/AX corrispondenti]
================================================================ */
const SUBURBAN_INTERCHANGE = {
  LL01: ['K01', 'R01', 'E01', 'AX06'],        // Sainðaul Central (Loop Line)
  LL17: ['AX07'],                               // Herubori (Loop Line ↔ Airport Express)
  KD25: ['LL09'],                               // Igashikura/Taishindai (KD ↔ LL)
  KD26: ['LL10'],                               // Hayatogaru (KD ↔ LL)
  KD32: ['LL01', 'K01', 'R01', 'E01', 'AX06'], // Sainðaul Central (KD)
  KD33: ['LL19'],                               // Aketsue (KD ↔ LL)
  KD20: ['R02'],                                // Asaji Torimoshi (KD ↔ IZX Ryānkai)
  KD35: ['AX04'],                               // Kasakuri (KD ↔ AX Ramo Est)
  KD36: ['K101'],                               // Sakamuso (KD ↔ IZX K101)
  KD37: ['K102', 'AX21'],                       // Showanul (KD ↔ IZX K102 + AX Ramo Bajikoe)
};

const SUBURBAN_LINES = {

  /* ────────────────────────────────────────────────
     LO — Loop Line · 環状線 (Kwanjān-sen)
     Circolare · 24.41 km · 19 stazioni · dal 1937
  ──────────────────────────────────────────────── */
  LO: {
    id: 'LO',
    name: 'Loop Line',
    nameJa: '環状線',
    color: '#34589F',
    circular: true,
    headwayPeak: 1.5,
    headwayOffPeak: 5,
    totalKm: 24.41,
    stations: [
      { code: 'LL01', name: 'Sainðaul Central',    kanji: '作安崎中央',   km:  0.0  },
      { code: 'LL02', name: 'Binno',               kanji: '苠喃',         km:  1.69 },
      { code: 'LL03', name: 'Shiitehongi',         kanji: '茛本名',       km:  4.29 },
      { code: 'LL04', name: 'Jigasūngai Kōwen',   kanji: '治ヶ僧涯公園', km:  5.23 },
      { code: 'LL05', name: 'Jufurai Kōwen Niji', kanji: '朱布来公園西', km:  6.93 },
      { code: 'LL06', name: 'Punoidan',            kanji: '富硾壇',       km:  8.45 },
      { code: 'LL07', name: 'Rupekoppe',           kanji: '孱槻',         km:  9.23 },
      { code: 'LL08', name: 'Isenebo',             kanji: '床踔',         km: 11.76 },
      { code: 'LL09', name: 'Igashikura',          kanji: '品霜',         km: 13.19 },
      { code: 'LL10', name: 'Hayatogaru',          kanji: '久松',         km: 14.12 },
      { code: 'LL11', name: 'Rakkashoni',          kanji: '鳶腳',         km: 15.5  },
      { code: 'LL12', name: 'Sumi-Kokendake',      kanji: '隠古剣館',     km: 16.4  },
      { code: 'LL13', name: 'Oritoku',             kanji: '壌外',         km: 17.2  },
      { code: 'LL14', name: 'Tomiganei',           kanji: '庭ヶ汢',       km: 18.3  },
      { code: 'LL15', name: 'Tagashiga',           kanji: '浚藻',         km: 19.2  },
      { code: 'LL16', name: 'Oiseharu',            kanji: '粕墾',         km: 20.1  },
      { code: 'LL17', name: 'Herubori',            kanji: '杏登',         km: 21.2  },
      { code: 'LL18', name: 'Ōbakura',             kanji: '大砌',         km: 22.4  },
      { code: 'LL19', name: 'Aketsue',             kanji: '薫都衛',       km: 23.6  },
      // Tratto di chiusura LL19 → LL01: 0.81 km (totale circuito 24.41 km)
    ],
  },

  KD: {
    id: 'KD',
    name: 'Kidai Line',
    nameJa: '磯大線',
    color: '#8dc159',
    circular: false,
    headwayPeak: 7,
    headwayOffPeak: 12,
    totalKm: 156.87,
    stations: [
      { code: 'KD01', name: 'Daihanji',                 kanji: '大繁寺',         km:   0.0  },
      { code: 'KD02', name: 'Niji-Hakenaki',            kanji: '西横畑',         km:   3.2  },
      { code: 'KD03', name: 'Hetsannuiko',              kanji: '—',              km:   6.1  },
      { code: 'KD04', name: 'Ronnukata Nyūngu',         kanji: '—',              km:   9.4  },
      { code: 'KD05', name: 'Hyankama',                 kanji: '向加万',         km:  12.3  },
      { code: 'KD06', name: 'Hakkuda',                  kanji: '箔九田',         km:  15.5  },
      { code: 'KD07', name: 'Karinniswae',              kanji: '柯林口',         km:  18.7  },
      { code: 'KD08', name: 'Koromuki',                 kanji: '軺鵡奇',         km:  22.0  },
      { code: 'KD09', name: 'Hailehira',                kanji: '半桶',           km:  25.2  },
      { code: 'KD10', name: 'Ibaruno',                  kanji: '齒琉能',         km:  28.8  },
      { code: 'KD11', name: 'Ibaruno Dodose',           kanji: '齒琉能土々施',   km:  30.1  },
      { code: 'KD12', name: 'Ibaruno Daigaku',          kanji: '齒琉能大學',     km:  31.4  },
      { code: 'KD13', name: 'Nukisakidai',              kanji: '—',              km:  33.0  },
      { code: 'KD14', name: 'Dankau',                   kanji: '檀洪',           km:  36.5  },
      { code: 'KD15', name: 'Parisote',                 kanji: '—',              km:  39.2  },
      { code: 'KD16', name: 'Shakihori Kinahu Daigaku', kanji: '—',              km:  42.0  },
      { code: 'KD17', name: 'Hokadaka',                 kanji: '—',              km:  45.1  },
      { code: 'KD18', name: 'Raikihoshi',               kanji: '挾浮',           km:  48.3  },
      { code: 'KD19', name: 'Inpas',                    kanji: '院発',           km:  51.0  },
      { code: 'KD20', name: 'Asaji Torimoshi',          kanji: '安佐寺狛篠',     km:  54.6  },
      { code: 'KD21', name: 'Aisendawa',                kanji: '愛仙堺',         km:  57.8  },
      { code: 'KD22', name: 'Kikachuri',                kanji: '筌中李',         km:  61.0  },
      { code: 'KD23', name: 'Namitoki',                 kanji: '咲葵',           km:  64.2  },
      { code: 'KD24', name: 'Chikurai',                 kanji: '宮鵜伊',         km:  67.5  },
      { code: 'KD25', name: 'Igashikura (Taishindai)',  kanji: '品霜（泰進大）', km:  70.0  },
      { code: 'KD26', name: 'Hayatogaru',               kanji: '久松',           km:  71.8  },
      { code: 'KD27', name: 'Kairumuka',                kanji: '—',              km:  73.2  },
      { code: 'KD28', name: 'Fushinose',                kanji: '翔峴',           km:  74.9  },
      { code: 'KD29', name: 'Tsumiji',                  kanji: '都巳治',         km:  76.8  },
      { code: 'KD30', name: 'Anagusa Mukai',            kanji: '矢模武凱',       km:  78.5  },
      { code: 'KD31', name: 'Rosemane',                 kanji: '酢丘',           km:  80.1  },
      { code: 'KD32', name: 'Sainðaul Central',         kanji: '作安崎中央',     km:  82.0  },
      { code: 'KD33', name: 'Aketsue',                  kanji: '薫都衛',         km:  83.6  },
      { code: 'KD34', name: 'Nashikoma',                kanji: '刖冬',           km:  85.4  },
      { code: 'KD35', name: 'Kasakuri',                 kanji: '鯛巻',           km:  87.5  },
      { code: 'KD36', name: 'Sakamuso',                 kanji: '沛坤',           km:  90.0  },
      { code: 'KD37', name: 'Showanul',                 kanji: '—',              km:  93.5  },
      { code: 'KD38', name: 'Niji-Showanul',            kanji: '—',              km:  96.2  },
      { code: 'KD39', name: 'Jisahara',                 kanji: '治叉榎',         km:  99.0  },
      { code: 'KD40', name: 'Minokashira',              kanji: '—',              km: 102.1  },
      { code: 'KD41', name: 'Kōtō Satahappi',           kanji: '—',              km: 105.4  },
      { code: 'KD42', name: 'Bibantori',                kanji: '美潘市',         km: 109.0  },
      { code: 'KD43', name: 'Tswankanami',              kanji: '芽咲市',         km: 113.2  },
      { code: 'KD44', name: 'Hikkojauri',               kanji: '—',              km: 117.5  },
      { code: 'KD45', name: 'Seikashi',                 kanji: '西鹿市',         km: 121.8  },
      { code: 'KD46', name: 'Pyanuza',                  kanji: '—',              km: 126.0  },
      { code: 'KD47', name: 'Kustinomi',                kanji: '杉桉',           km: 130.5  },
      { code: 'KD48', name: 'Kirijima',                 kanji: '磯湧',           km: 135.0  },
      { code: 'KD49', name: 'Tserinuma',                kanji: '—',              km: 139.0  },
      { code: 'KD50', name: 'Nagakata',                 kanji: '—',              km: 143.2  },
      { code: 'KD51', name: 'Shiki-Kirijima',           kanji: '北磯湧',         km: 147.1  },
      { code: 'KD52', name: 'Nasjangai',                kanji: '—',              km: 150.4  },
      { code: 'KD53', name: 'Hatsumoroge',              kanji: '—',              km: 153.5  },
      { code: 'KD54', name: 'Nagayamatsu',              kanji: '—',              km: 156.87 },
    ],
  },

  SK: {
    id: 'SK',
    name: 'Seishaku Line',
    nameJa: '盛石線',
    color: '#7AE3E3',
    circular: false,
    headwayPeak: 10,
    headwayOffPeak: 20,
    totalKm: 103.95,
    stations: [],
  },

  KS: {
    id: 'KS',
    name: 'Kawasabu Line',
    nameJa: '--線',
    color: '#339966',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 47.10,
    stations: [],
  },

  KW: {
    id: 'KW',
    name: 'Kwōkei Line',
    nameJa: '荒京線',
    color: '#99FFFF',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 84.35,
    stations: [],
  },

  RI: {
    id: 'RI',
    name: 'Riimiilla Line',
    nameJa: '---線',
    color: '#ffd320',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 100.56,
    stations: [],
  },

  SS: {
    id: 'SS',
    name: 'Shosen Line',
    nameJa: '--線',
    color: '#D2B48C',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 50.19,
    stations: [],
  },

  GD: {
    id: 'GD',
    name: 'Gaekwan-Dōnbu Line',
    nameJa: '外環東部線',
    color: '#B16B48',
    circular: false,
    headwayPeak: 7,
    headwayOffPeak: 10,
    totalKm: 78.48,
    stations: [],
  },

  JD: {
    id: 'JD',
    name: 'Juwon-Kodōn Line',
    nameJa: '中央湖東線',
    color: '#FF66CC',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 78.35,
    stations: [],
  },

  CK: {
    id: 'CK',
    name: 'Chukkūn Line',
    nameJa: '竹空線',
    color: '#B8B895',
    circular: false,
    headwayPeak: 10,
    headwayOffPeak: 15,
    totalKm: 55.93,
    stations: [],
  },

};

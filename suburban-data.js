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
     su reti IZX/AX/Metro. Usata da SuburbanRouter per costruire
     percorsi con cambio cross-network.

     LL01 (Sainðaul Central) ↔ K01, R01, E01, AX06
     LL12 (Sumi-Kokendake) ↔ M409
     LL17 (Herubori) ↔ AX07
     KD25 ↔ LL09  (Igashikura/Taishindai)
     KD26 ↔ LL10  (Hayatogaru)
     KD30 ↔ M405  (Anagusa Mukai)
     KD35 ↔ AX04, M419  (Kasakuri)
     KD36 ↔ K101  (Sakamuso)
     KD37 ↔ K102, AX21  (Showanul)
     KD46 ↔ K31   (Pyanuza)
     KD54 ↔ K32   (Nagayamatsu)

     SK interchanges (Seishaku Line):
     SK12 ↔ KD14  (Dankau)
     SK24 ↔ LL03  (Shiitehongi)
     SK25 ↔ LL02  (Binno)
     SK26 ↔ LL01, KD32  (Sainðaul Central)
     SK27 ↔ KD33, LL19  (Aketsue)
     SK28 ↔ KD34  (Nashikoma)
     SK35 ↔ KD35  (Kasakuri)
     SK38 ↔ KD36  (Sakamuso)
     SK43 ↔ KD37  (Showanul)

     KW interchanges (Kwōkei Line):
     KW00 (Kishagoi-Exhibitown) ↔ M801, M17??, M18??
     KW02 (Shiki-Kiranne) ↔ IR
     KW03 (Ottanjoe) ↔ M03?? (da confermare)
     KW09 (Kawayatsu) ↔ E02, KY02
     KW16 (Ibarosu) ↔ CS01
     KW17 (Otsumi-Ibarosu) ↔ CS02
     KW25 (Kotamari) ↔ IB?? (da confermare)
     KW29 (Abiro) ↔ MS01, IN03
     KW32 (Yamakoga) ↔ CS?? (da confermare)

   SK_SERVICES / KW_SERVICES:
     Sottoservizi per la generazione degli orari sintetici nel router.
     NON vengono visualizzati nel journey planner come tag o numeri.

   Nota km Loop Line:
     Distanze progressive reali da rilievo cartografico.
     Circuito totale: 24.41 km (LL01 → ... → LL19 → LL01).
     Tratto di chiusura LL19→LL01: 24.41 − 23.6 = 0.81 km.
================================================================ */
'use strict';

/* ================================================================
   SUBURBAN_INTERCHANGE
   Mappa: codice suburbano → [codici IZX/AX/Metro corrispondenti]
================================================================ */
const SUBURBAN_INTERCHANGE = {
  LL01: ['K01', 'R01', 'E01', 'AX06'],        // Sainðaul Central (Loop Line)
  LL12: ['M409'],                               // Sumi-Kokendake (Loop Line ↔ Metro Line 4)
  LL17: ['AX07'],                               // Herubori (Loop Line ↔ Airport Express)
  KD20: ['R02'],                                // Asaji Torimoshi (KD ↔ IZX Ryānkai)
  KD25: ['LL09'],                               // Igashikura/Taishindai (KD ↔ LL)
  KD26: ['LL10'],                               // Hayatogaru (KD ↔ LL)
  KD30: ['M405'],                               // Anagusa Mukai (KD ↔ Metro Line 4)
  KD32: ['LL01', 'K01', 'R01', 'E01', 'AX06'], // Sainðaul Central (KD)
  KD33: ['LL19'],                               // Aketsue (KD ↔ LL)
  KD35: ['AX04', 'M419'],                       // Kasakuri (KD ↔ AX Ramo Est + Metro Line 4)
  KD36: ['K101'],                               // Sakamuso (KD ↔ IZX KE K101)
  KD37: ['K102', 'AX21'],                       // Showanul (KD ↔ IZX KE K102 + AX Ramo Bajikoe)
  KD46: ['K31'],                                // Pyanuza (KD ↔ IZX KE ramo C′)
  KD54: ['K32'],                                // Nagayamatsu (KD ↔ IZX KE ramo C′)
  // Seishaku Line (SK)
  SK12: ['KD14'],                               // Dankau (SK ↔ KD)
  SK24: ['LL03'],                               // Shiitehongi (SK ↔ LL)
  SK25: ['LL02'],                               // Binno (SK ↔ LL)
  SK26: ['LL01', 'KD32'],                       // Sainðaul Central (SK)
  SK27: ['KD33', 'LL19'],                       // Aketsue (SK ↔ KD + LL)
  SK28: ['KD34'],                               // Nashikoma (SK ↔ KD)
  SK35: ['KD35'],                               // Kasakuri (SK ↔ KD)
  SK38: ['KD36'],                               // Sakamuso (SK ↔ KD)
  SK43: ['KD37'],                               // Showanul (SK ↔ KD)
  // Kwōkei Line (KW)
  KW00: ['M801'],                               // Kishagoi-Exhibitown (KW ↔ M8; M17?? M18?? da confermare)
  KW02: ['IR'],                                 // Shiki-Kiranne (KW ↔ IR)
  KW03: [],                                     // Ottanjoe (↔ M03?? da confermare)
  KW09: ['E02', 'KY02'],                        // Kawayatsu (KW ↔ IZX E02 + KY02)
  KW16: ['CS01'],                               // Ibarosu (KW ↔ CS01)
  KW17: ['CS02'],                               // Otsumi-Ibarosu (KW ↔ CS02)
  KW25: [],                                     // Kotamari (↔ IB?? da confermare)
  KW29: ['MS01', 'IN03'],                       // Abiro (KW ↔ MS01 + IN03)
  KW32: [],                                     // Yamakoga (↔ CS?? da confermare)
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

  /* ────────────────────────────────────────────────
     SK — Seishaku Line · 盛石線
     58 stazioni · 105.15 km
  ──────────────────────────────────────────────── */
  SK: {
    id: 'SK',
    name: 'Seishaku Line',
    nameJa: '盛石線',
    color: '#7AE3E3',
    circular: false,
    headwayPeak: 10,
    headwayOffPeak: 20,
    totalKm: 105.15,
    stations: [
      { code: 'SK01', name: 'Igattarun Juwon',       kanji: '蝉陵中央',   km:   0.00 },
      { code: 'SK02', name: 'Akatani',               kanji: '蛞滝',       km:   3.81 },
      { code: 'SK03', name: 'Seobewa',               kanji: '—',          km:   6.81 },
      { code: 'SK04', name: 'Tatsunuka',             kanji: '—',          km:   9.89 },
      { code: 'SK05', name: 'Arikashi Satago',       kanji: '—',          km:  11.67 },
      { code: 'SK06', name: 'Enikezya Shinnorin',    kanji: '—',          km:  13.50 },
      { code: 'SK07', name: 'Enikezya',              kanji: '盛狩',       km:  14.91 },
      { code: 'SK08', name: 'Kushinami',             kanji: '—',          km:  15.94 },
      { code: 'SK09', name: 'Shin-Jiroidan',         kanji: '新治蕾丹',   km:  17.17 },
      { code: 'SK10', name: 'Suðutaka',              kanji: '—',          km:  20.49 },
      { code: 'SK11', name: 'Rippama',               kanji: '—',          km:  24.47 },
      { code: 'SK12', name: 'Dankau',                kanji: '檀洪',       km:  25.83 },
      { code: 'SK13', name: 'Shin-Dankau',           kanji: '新檀洪',     km:  26.72 },
      { code: 'SK14', name: 'Moisashi',              kanji: '—',          km:  28.57 },
      { code: 'SK15', name: 'Suhakos',               kanji: '—',          km:  30.30 },
      { code: 'SK16', name: 'Kayahori Bunki',        kanji: '香弥登分岐', km:  31.96 },
      { code: 'SK17', name: 'Punomowen',             kanji: '㷀園',       km:  33.03 },
      { code: 'SK18', name: 'Awada',                 kanji: '—',          km:  33.94 },
      { code: 'SK19', name: 'Shakihori',             kanji: '石登',       km:  35.24 },
      { code: 'SK20', name: 'Oizato',                kanji: '粕穫',       km:  39.44 },
      { code: 'SK21', name: 'Riyakugo',              kanji: '追句胡',     km:  40.50 },
      { code: 'SK22', name: 'Makurigawa',            kanji: '炭畦',       km:  41.60 },
      { code: 'SK23', name: 'Kasaraki',              kanji: '次羽',       km:  43.68 },
      { code: 'SK24', name: 'Shiitehongi',           kanji: '茛本名',     km:  44.47 },
      { code: 'SK25', name: 'Binno',                 kanji: '苠喃',       km:  46.87 },
      { code: 'SK26', name: 'Sainðaul Central',      kanji: '作安崎中央', km:  48.78 },
      { code: 'SK27', name: 'Aketsue',               kanji: '薫都衛',     km:  49.76 },
      { code: 'SK28', name: 'Nashikoma',             kanji: '刖冬',       km:  51.47 },
      { code: 'SK29', name: 'Chestō Toshi',          kanji: '鐡道都市',   km:  52.53 },
      { code: 'SK30', name: 'Shiki-Tsutomaku',       kanji: '—',          km:  53.29 },
      { code: 'SK31', name: 'Yuparaul',              kanji: '枕崎',       km:  54.92 },
      { code: 'SK32', name: 'Takkurahama',           kanji: '琢玖羅島',   km:  57.15 },
      { code: 'SK33', name: 'Shimamera',             kanji: '渠瀬田',     km:  58.37 },
      { code: 'SK34', name: 'Nihkyonta',             kanji: '濱角',       km:  60.18 },
      { code: 'SK35', name: 'Kasakuri',              kanji: '鯛巻',       km:  64.11 },
      { code: 'SK36', name: 'Kotoshiruna',           kanji: '細荒奈',     km:  66.46 },
      { code: 'SK37', name: 'Tsuragoi',              kanji: '汐蒲',       km:  68.71 },
      { code: 'SK38', name: 'Sakamuso',              kanji: '沛坤',       km:  70.34 },
      { code: 'SK39', name: 'Kashiwaka',             kanji: '—',          km:  71.87 },
      { code: 'SK40', name: 'Togamiro',              kanji: '—',          km:  72.59 },
      { code: 'SK41', name: 'Erifuka',               kanji: '操菴',       km:  73.67 },
      { code: 'SK42', name: 'Kamabata',              kanji: '寺石',       km:  75.00 },
      { code: 'SK43', name: 'Showanul',              kanji: '書瓦崎',     km:  76.78 },
      { code: 'SK44', name: 'Chaihamosu',            kanji: '—',          km:  77.97 },
      { code: 'SK45', name: 'Kojushire',             kanji: '—',          km:  79.12 },
      { code: 'SK46', name: 'Kainos Ufuwani',        kanji: '—',          km:  80.39 },
      { code: 'SK47', name: 'Waneki',                kanji: '窑名',       km:  83.06 },
      { code: 'SK48', name: 'Shin-Waneki',           kanji: '新窑名',     km:  85.89 },
      { code: 'SK49', name: 'Hamuchika',             kanji: '鷲宮',       km:  88.44 },
      { code: 'SK50', name: 'Piskadoshi',            kanji: '滋氾',       km:  89.61 },
      { code: 'SK51', name: 'Erigowa Kaiyan',        kanji: '繰緊海岸',   km:  93.83 },
      { code: 'SK52', name: 'Erigowa Honchō',        kanji: '繰緊本町',   km:  97.00 },
      { code: 'SK53', name: 'Kabuhane Shiyen Kōwen', kanji: '—',          km:  98.39 },
      { code: 'SK54', name: 'Erigowa Daigaku',       kanji: '—',          km:  99.67 },
      { code: 'SK55', name: 'Katakinu',              kanji: '—',          km: 100.93 },
      { code: 'SK56', name: 'Otsumi-Shakusa',        kanji: '—',          km: 102.15 },
      { code: 'SK57', name: 'Shakusa Nandoe',        kanji: '—',          km: 104.02 },
      { code: 'SK58', name: 'Shakusa',               kanji: '—',          km: 105.15 },
    ],
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

  /* ────────────────────────────────────────────────
     KW — Kwōkei Line · 荒京線
     33 stazioni · 84.35 km (km misurati da KW00 = 0)
     Direzione: KW00 Kishagoi-Exhibitown (sud) → KW32 Yamakoga (nord)
     Collegamento M8 (M801) a KW00.
     Diramazione Ugutsumasa: da KW06 verso KW051 (dati da aggiungere).
  ──────────────────────────────────────────────── */
  KW: {
    id: 'KW',
    name: 'Kwōkei Line',
    nameJa: '荒京線',
    color: '#99FFFF',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 84.35,
    stations: [
      { code: 'KW00', name: 'Kishagoi - Exhibitown', kanji: '喜舎拘',        km:  0.00 }, // ↔ M801, M17??, M18??
      { code: 'KW01', name: 'Kiranne',               kanji: '—',             km:  1.89 },
      { code: 'KW02', name: 'Shiki-Kiranne',         kanji: '—',             km:  3.19 }, // ↔ IR
      { code: 'KW03', name: 'Ottanjoe',              kanji: '—',             km:  5.04 }, // ↔ M03?? (da confermare)
      { code: 'KW04', name: 'Semukudai',             kanji: '世牧臺',        km:  6.28 },
      { code: 'KW05', name: 'Niji-Rekuni',           kanji: '西長澤',        km:  9.35 },
      { code: 'KW06', name: 'Agasuri-ko Ugutsumasa', kanji: '蛞珠利湖・茨察', km: 11.63 }, // diramazione verso KW051 (dati da aggiungere)
      { code: 'KW07', name: 'Chayogate',             kanji: '蟹湊',         km: 13.42 },
      { code: 'KW08', name: 'Shin-Kawayatsu',        kanji: '新嘉夬苫',    km: 15.20 },
      { code: 'KW09', name: 'Ukimako',               kanji: '—',             km: 16.95 },
      { code: 'KW10', name: 'Kawayatsu',             kanji: '嘉夬苫',       km: 18.53 }, // ↔ E02, KY02
      { code: 'KW11', name: 'Niji-Kawayatsu',        kanji: '西嘉夬苫',    km: 20.61 },
      { code: 'KW12', name: 'Neyabakuri',            kanji: '—',             km: 22.61 },
      { code: 'KW13', name: 'Tsimoniji',             kanji: '地多寺',        km: 23.96 },
      { code: 'KW14', name: 'Yassamo',               kanji: '—',             km: 27.82 },
      { code: 'KW15', name: 'Ibarosu Hinnandoshi',   kanji: '歯舢花都市',   km: 28.94 },
      { code: 'KW16', name: 'Otsumi-Ibarosu',        kanji: '南歯舢',        km: 30.25 }, // ↔ CS02
      { code: 'KW17', name: 'Ibarosu',               kanji: '歯舢',          km: 33.36 }, // ↔ CS01
      { code: 'KW18', name: 'Nwatanui',              kanji: '—',             km: 35.18 },
      { code: 'KW19', name: 'Abamiwa',               kanji: '弱水',          km: 38.51 },
      { code: 'KW20', name: 'Shiwesuno',             kanji: '—',             km: 40.69 },
      { code: 'KW21', name: 'Sogeisu',               kanji: '—',             km: 44.13 },
      { code: 'KW22', name: 'Funoshoni',             kanji: '—',             km: 45.38 },
      { code: 'KW23', name: 'Sārishiki',             kanji: '川北',          km: 48.43 },
      { code: 'KW24', name: 'Karue',                 kanji: '松澤',          km: 51.83 },
      { code: 'KW25', name: 'Kotamari',              kanji: '細幅射',        km: 56.84 }, // ↔ IB?? (da confermare)
      { code: 'KW26', name: 'Enemui',                kanji: '—',             km: 63.93 },
      { code: 'KW27', name: 'Kamasa Taru',           kanji: '寺嵯舟',        km: 67.03 },
      { code: 'KW28', name: 'Zayashuni',             kanji: '—',             km: 70.28 },
      { code: 'KW29', name: 'Abiro',                 kanji: '獏路',          km: 76.15 }, // ↔ MS01, IN03
      { code: 'KW30', name: 'Yakkais',               kanji: '—',             km: 79.94 },
      { code: 'KW31', name: 'Rinongauri',            kanji: '桉沼',          km: 84.28 },
      { code: 'KW32', name: 'Yamakoga',              kanji: '倉湖加',        km: 84.35 }, // ↔ CS?? (da confermare)
    ],
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

/* ================================================================
   SK_SERVICES — sottoservizi Seishaku Line
   Usati solo per la generazione degli orari sintetici nel router.
   NON vengono visualizzati nel journey planner come tag o numeri.

   Struttura per voce:
     id        {string}  identificativo interno (S1…S4)
     desc      {string}  descrizione leggibile
     fromCode  {string}  codice capolinea A (direzione crescente)
     toCode    {string}  codice capolinea B
     firstDep  {string}  HH:MM — prima partenza dal capolinea A
     lastDep   {string}  HH:MM — ultima partenza dal capolinea A
     headway   {number}  minuti tra una corsa e la successiva

   Logica bidirezionale:
     Il router genera corse in entrambe le direzioni (A→B e B→A).
     Per la direzione B→A, firstDep/lastDep si riferiscono alla
     prima/ultima partenza dal capolinea B, calcolate aggiungendo
     il tempo di percorrenza al firstDep/lastDep del capolinea A.

   Copertura effettiva per stazione:
     Una stazione è servita da un sottoservizio se il suo indice
     in SK.stations ricade nell'intervallo [fromIdx, toIdx].
     Il router combina le partenze di tutti i sottoservizi che
     coprono sia la stazione di origine che quella di destinazione.
================================================================ */
const SK_SERVICES = [
  {
    id:       'S1',
    desc:     'Igattarun Juwon ↔ Shakusa (servizio completo)',
    fromCode: 'SK01',
    toCode:   'SK58',
    firstDep: '05:35',
    lastDep:  '23:35',
    headway:  20,
  },
  {
    id:       'S2',
    desc:     'Enikezya ↔ Waneki (rinforzo fascia centrale)',
    fromCode: 'SK07',
    toCode:   'SK47',
    firstDep: '06:55',
    lastDep:  '21:55',
    headway:  20,
  },
  {
    id:       'S3',
    desc:     'Showanul ↔ Shakusa (locale zona Shakusa)',
    fromCode: 'SK43',
    toCode:   'SK58',
    firstDep: '06:15',
    lastDep:  '22:45',
    headway:  20,
  },
  {
    id:       'S4',
    desc:     'Igattarun Juwon ↔ Kasakuri (locale zona nord)',
    fromCode: 'SK01',
    toCode:   'SK35',
    firstDep: '06:15',
    lastDep:  '22:45',
    headway:  20,
  },
];

/* ================================================================
   KW_SERVICES — sottoservizi Kwōkei Line
   Usati solo per la generazione degli orari sintetici nel router.
   NON vengono visualizzati nel journey planner come tag o numeri.

   Pattern di servizio:
     W1  Local completo    KW00–KW32  ogni 20 min, 05:30–23:30
     W2  Local limitato    KW00–KW17  ogni 20 min, 05:30–23:30
         (W1+W2 insieme: freq. 10 min su KW00–KW17, 20 min su KW17–KW32)
     W3  Rapid             KW00–KW32  ogni 20 min, 09:30–17:00
         Fermate: KW00 KW01 KW03 KW06 KW10 KW11 KW17 KW22 KW29 KW32
     W4  Commuter Rapid    KW00–KW32  ogni 20 min, 07:30–09:30 e 17:00–22:30
         Fermate: KW00 KW01 KW06 KW10 KW11 KW17 KW22 KW23 KW24 KW25
                  KW26 KW27 KW28 KW29 KW30 KW31 KW32

   Nota sulle fermate selettive (W3/W4):
     Il campo stops[] elenca i codici delle fermate effettive.
     Il router deve ignorare le stazioni intermedie non incluse.
     Se stops è assente o vuoto, il servizio ferma ovunque.
================================================================ */
const KW_SERVICES = [
  {
    id:       'W1',
    desc:     'Local — Kishagoi-Exhibitown ↔ Yamakoga (servizio completo)',
    fromCode: 'KW00',
    toCode:   'KW32',
    firstDep: '05:30',
    lastDep:  '23:30',
    headway:  20,
    stops:    [], // ferma a tutte le stazioni
  },
  {
    id:       'W2',
    desc:     'Local Ltd — Kishagoi-Exhibitown ↔ Ibarosu (rinforzo tratto sud)',
    fromCode: 'KW00',
    toCode:   'KW17',
    firstDep: '05:30',
    lastDep:  '23:30',
    headway:  20,
    stops:    [], // ferma a tutte le stazioni del tratto KW00–KW17
  },
  {
    id:       'W3',
    desc:     'Rapid — Kishagoi-Exhibitown ↔ Yamakoga (fuori punta)',
    fromCode: 'KW00',
    toCode:   'KW32',
    firstDep: '09:30',
    lastDep:  '17:00',
    headway:  20,
    stops:    ['KW00','KW01','KW03','KW06','KW10','KW11','KW17','KW22','KW29','KW32'],
  },
  {
    id:       'W4',
    desc:     'Commuter Rapid — Kishagoi-Exhibitown ↔ Yamakoga (punta mattina/sera)',
    fromCode: 'KW00',
    toCode:   'KW32',
    // Fascia mattutina: 07:30–09:30 | Fascia serale: 17:00–22:30
    // Il router deve gestire le due finestre orarie separatamente.
    firstDep: '07:30',
    lastDep:  '22:30',
    peakWindows: [
      { from: '07:30', to: '09:30' },
      { from: '17:00', to: '22:30' },
    ],
    headway:  20,
    stops:    ['KW00','KW01','KW06','KW10','KW11','KW17','KW22','KW23','KW24','KW25',
               'KW26','KW27','KW28','KW29','KW30','KW31','KW32'],
  },
];

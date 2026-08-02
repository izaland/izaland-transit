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
       stations  [ { code, name, kanji, km, segSpeedKmh? } ]
         km            — distanza progressiva dal capolinea A (AI01)
         segSpeedKmh   — (opzionale) velocità commerciale media km/h
                         sul segmento DA questa stazione ALLA successiva.
                         Se assente il router usa AVG_SPEED_KMH globale.
                         L'ultima stazione di ogni linea non ha segSpeedKmh.
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
     KW00 (Kishagoi-Exhibitown) ↔ M801
     KW02 (Shiki-Kiranne) ↔ IR
     KW03 (Ottanjoe) ↔ M03?? (da confermare)
     KW10 (Kawayatsu) ↔ E02, KY02
     KW16 (Otsumi-Ibarosu) ↔ CS02
     KW17 (Ibarosu) ↔ CS01
     KW25 (Kotamari) ↔ IB?? (da confermare)
     KW29 (Abiro) ↔ MS01, IN03
     KW32 (Yamakoga) ↔ CS?? (da confermare)

     TS interchanges (Tandan-Senpyan Line):
     TS07 ↔ KW10, E02  (Kawayatsu — thru KW)
     TS12 ↔ LL02, SK25  (Binno)
     TS13 ↔ LL01, SK26, M814, K01, R01, E01, AX06  (Sainðaul Central)
     TS14 ↔ SK33, M417, M203  (Shimamera)
     TS15 ↔ SK34, M418  (Nihkyonta)
     TS16 ↔ SK35, M419, AX04, K02  (Kasakuri ↔ Niji-Sainðaul IZX Keishin)
     TS18 ↔ M425  (Ipporai-Senpyan)

     CK interchanges (Chukkūn Line):
     CK01 ↔ AX00  (Asunahama Airport Terminal 4)
     CK02 ↔ AX01, KE03  (Sainðaul International Airport)
     CK04 ↔ AX02  (Rinkūn City)
     CK08 ↔ AX03  (Riimibaiken)
     CK13 ↔ TS17  (Rismyonjen)
     CK16 ↔ TS16, AX04, M419, SK35, KD35  (Kasakuri)
     CK17 ↔ TS15, SK34  (Nihkyonta)
     CK18 ↔ TS14, M202  (Alkuitsa/Shimamera)
     CK19 ↔ M805  (Tajamōri)
     CK22 ↔ LL03, SK24  (Shiitehongi)
     CK23 ↔ SK23  (Kasaraki)
     CK24 ↔ SK22  (Makurigawa)
     CK25 ↔ SK21  (Riyakugo)
     CK26 ↔ SK20  (Oizato)
     CK27 ↔ SK19  (Shakihori)
     CK28 ↔ SK18  (Awada)
     CK29 ↔ SK17  (Punomowen)
     CK30 ↔ SK16  (Kayahori Bunki)

       // Kawasabu Line (KS)
  KS01: ['KW12'],
  KS02: ['E02', 'KW11'],
  KS11: ['CK27', 'SK19'],
  KS17: [],          // M1?? — da confermare
  KS18: ['KD20', 'RY02'],  // + M1?? — da confermare
  KS28: ['AX09'],
  
   SK_SERVICES / KW_SERVICES:
     Sottoservizi per la generazione degli orari sintetici nel router.

   FIX 10b (TS km progressivi e ordine stazioni):
     Le stazioni TS sono ora in sequenza fisica corretta:
       AI01 → AI04 (ramo Aikami)
       → TS23 → TS21 (prosecuzione nord)
       → TS01 Yamakoga
       → TS02 → TS09 (tratto condiviso KW, percorso verso sud)
       → TS10 → TS20 Shutazai (tronco principale verso Senpyan)
     Km calcolati come progressiva cumulativa dalle distanze
     interstazione reali. AI04→TS23 = 1.63 km. totalKm = 133.88 km.

   FIX 11 (disambiguazione nomi duplicati sulla linea TS):
     TS10 e TS19 avevano entrambe il nome 'Eigandan Senpyan'.
     TS11 e TS17 avevano entrambe il nome 'Rismyonjen'.
     I duplicati causavano la risoluzione ambigua del codice stazione:
     il router trovava TS10 (a metà linea, vicina ai nodi AX/IZX
     via TS13) invece di TS19 (quella corretta, vicina a Shutazai),
     generando percorsi 3-leg spuri AX+A+TS invece del diretto TS.
     Fix: TS10 → 'Eigandan Senpyan (Semukudai)'; TS11 → 'Rismyonjen (Eigandan)'.

   Nota km Loop Line:
     Distanze progressive reali da rilievo cartografico.
     Circuito totale: 24.41 km (LL01 → ... → LL19 → LL01).
     Tratto di chiusura LL19→LL01: 24.41 − 23.6 = 0.81 km.
================================================================ */
'use strict';

/* ================================================================
   SUBURBAN_INTERCHANGE
================================================================ */
const SUBURBAN_INTERCHANGE = {
  LL01: ['K01', 'R01', 'E01', 'AX06'],
  LL12: ['M409'],
  LL17: ['AX07'],
  KD20: ['R02'],
  KD25: ['LL09'],
  KD26: ['LL10'],
  KD30: ['M405'],
  KD32: ['LL01', 'K01', 'R01', 'E01', 'AX06'],
  KD33: ['LL19'],
  KD34: [],
  KD35: ['AX04', 'M419'],
  KD36: ['K101'],
  KD37: ['K102', 'AX21'],
  KD46: ['K31'],
  KD54: ['K32'],
  // Seishaku Line (SK)
  SK12: ['KD14'],
  SK24: ['LL03'],
  SK25: ['LL02'],
  SK26: ['LL01', 'KD32'],
  SK27: ['KD33', 'LL19'],
  SK28: ['KD34'],
  SK35: ['KD35'],
  SK38: ['KD36'],
  SK43: ['KD37'],
  // Kwōkei Line (KW)
  KW00: ['M801'],
  KW02: ['IR'],
  KW03: [],
  KW10: ['E02', 'KY02'],
  KW16: ['CS02'],
  KW17: ['CS01'],
  KW25: [],
  KW29: ['MS01', 'IN03'],
  KW32: [],
  // Tandan-Senpyan Line (TS)
  TS07: ['KW10', 'E02'],
  TS12: ['LL02', 'SK25'],
  TS13: ['LL01', 'SK26', 'M814', 'K01', 'R01', 'E01', 'AX06'],
  TS14: ['SK33', 'M417', 'M203'],
  TS15: ['SK34', 'M418'],
  // TS16 Kasakuri: stesso nodo di interscambio di K02 Niji-Sainðaul (IZX Keishin)
  TS16: ['SK35', 'M419', 'AX04', 'K02'],
  TS18: ['M425'],
  // Chukkūn Line (CK)
  CK01: ['AX00'],
  CK02: ['AX01', 'KE03'],
  CK04: ['AX02'],
  CK08: ['AX03'],
  CK13: ['TS17'],
  CK16: ['TS16', 'AX04', 'M419', 'SK35', 'KD35'],
  CK17: ['TS15', 'SK34'],
  CK18: ['TS14', 'M202'],
  CK19: ['M805'],
  CK22: ['LL03', 'SK24'],
  CK23: ['SK23'],
  CK24: ['SK22'],
  CK25: ['SK21'],
  CK26: ['SK20'],
  CK27: ['SK19'],
  CK28: ['SK18'],
  CK29: ['SK17'],
  CK30: ['SK16'],
  // Kawasabu Line (KS)
  KS01: ['KW12'],
  KS02: ['E02', 'KW11'],
  KS11: ['CK27', 'SK19'],
  KS17: [],          // M1?? — da confermare
  KS18: ['KD20', 'RY02'],  // + M1?? — da confermare
  KS28: ['AX09'],
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

   /* ────────────────────────────────────────────────
     KS — Kawasabu Line · 嘉夬苫線
     28 stazioni · 47.08 km
     Capolinea: KS01 Niji-Kawayatsu ↔ KS28 Sabullan
     Interscambi principali:
       KS01 ↔ KW12 (Neyabakuri)
       KS02 ↔ E02, KW11 (Kawayatsu)
       KS11 ↔ CK27, SK19 (Shakihori)
       KS17 ↔ M1?? (Pakkishoi — da confermare)
       KS18 ↔ KD20, RY02 (Asaji Torimoshi)
       KS28 ↔ AX09 (Sabullan)
  ──────────────────────────────────────────────── */
  KS: {
    id: 'KS',
    name: 'Kawasabu Line',
    nameJa: '嘉夬苫線',
    color: '#339966',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 47.08,
    stations: [
      { code: 'KS01', name: 'Niji-Kawayatsu',       kanji: '西嘉夬苫',     km:  0.00 },
      { code: 'KS02', name: 'Kawayatsu',             kanji: '嘉夬苫',       km:  1.81 },
      { code: 'KS03', name: 'Noketama',              kanji: '坂谷',         km:  3.94 },
      { code: 'KS04', name: 'Kutana',                kanji: '久多那',       km:  4.87 },
      { code: 'KS05', name: 'Soyotsu',               kanji: '—',            km:  6.96 },
      { code: 'KS06', name: 'Takepiro',              kanji: '館敷',         km:  8.36 },
      { code: 'KS07', name: 'Urabato',               kanji: '鵜石',         km: 10.13 },
      { code: 'KS08', name: 'Shiki-Shakihori',       kanji: '北石登',       km: 14.54 },
      { code: 'KS09', name: 'Surikato',              kanji: '須里日',       km: 16.41 },
      { code: 'KS10', name: 'Bibawara',              kanji: '—',            km: 17.38 },
      { code: 'KS11', name: 'Shakihori',             kanji: '石登',         km: 19.26 },
      { code: 'KS12', name: 'Inamori',               kanji: '遖竹',         km: 20.30 },
      { code: 'KS13', name: 'Gohamuki Kuuraki-mun',  kanji: '塩椋九雨粟門', km: 21.38 },
      { code: 'KS14', name: 'Uriwako',               kanji: '—',            km: 22.43 },
      { code: 'KS15', name: 'Jurimotoya',            kanji: '—',            km: 23.46 },
      { code: 'KS16', name: 'Migawarae',             kanji: '—',            km: 24.72 },
      { code: 'KS17', name: 'Pakkishoi',             kanji: '—',            km: 26.90 },
      { code: 'KS18', name: 'Asaji Torimoshi',       kanji: '安佐寺狛篠',   km: 28.18 },
      { code: 'KS19', name: 'Nari-Aisendawa',        kanji: '—',            km: 29.82 },
      { code: 'KS20', name: 'Yushinaware',           kanji: '—',            km: 31.47 },
      { code: 'KS21', name: 'Oitsura',               kanji: '粕鵲',         km: 33.56 },
      { code: 'KS22', name: 'Kaidaru',               kanji: '艏開',         km: 35.72 },
      { code: 'KS23', name: 'Taimasaki',             kanji: '太馬羽',       km: 39.47 },
      { code: 'KS24', name: 'Nari-Kworente',         kanji: '—',            km: 40.81 },
      { code: 'KS25', name: 'Ekahemi',               kanji: '月姜',         km: 41.87 },
      { code: 'KS26', name: 'Shiki-Sabullan',        kanji: '北ટરૃેધ્ધપ્', km: 43.29 },
      { code: 'KS27', name: 'Kamuragi',              kanji: '—',            km: 44.92 },
      { code: 'KS28', name: 'Sabullan',              kanji: 'ટરૃેધ્ધપ્',   km: 47.08 },
    ],
  },

   
  /* ────────────────────────────────────────────────
     KW — Kwōkei Line · 荒京線
     33 stazioni · 84.35 km
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
      { code: 'KW00', name: 'Kishagoi - Exhibitown', kanji: '喜舎拘',         km:  0.00, segSpeedKmh:  35 },
      { code: 'KW01', name: 'Kiranne',               kanji: '—',              km:  1.89, segSpeedKmh:  38 },
      { code: 'KW02', name: 'Shiki-Kiranne',         kanji: '—',              km:  3.19, segSpeedKmh:  40 },
      { code: 'KW03', name: 'Ottanjoe',              kanji: '—',              km:  5.04, segSpeedKmh:  42 },
      { code: 'KW04', name: 'Semukudai',             kanji: '世牧臺',         km:  6.28, segSpeedKmh:  45 },
      { code: 'KW05', name: 'Niji-Rekuni',           kanji: '西長澤',         km:  9.35, segSpeedKmh:  50 },
      { code: 'KW06', name: 'Agasuri-ko Ugutsumasa', kanji: '蛞珠利湖・茨察', km: 11.63, segSpeedKmh:  55 },
      { code: 'KW07', name: 'Chayogate',             kanji: '蟹湊',           km: 13.42, segSpeedKmh:  58 },
      { code: 'KW08', name: 'Shin-Kawayatsu',        kanji: '新嘉夬苫',       km: 15.20, segSpeedKmh:  60 },
      { code: 'KW09', name: 'Ukimako',               kanji: '—',              km: 16.95, segSpeedKmh:  60 },
      { code: 'KW10', name: 'Kawayatsu',             kanji: '嘉夬苫',         km: 18.53, segSpeedKmh:  62 },
      { code: 'KW11', name: 'Niji-Kawayatsu',        kanji: '西嘉夬苫',       km: 20.61, segSpeedKmh:  65 },
      { code: 'KW12', name: 'Neyabakuri',            kanji: '—',              km: 22.61, segSpeedKmh:  65 },
      { code: 'KW13', name: 'Tsimoniji',             kanji: '地多寺',         km: 23.96, segSpeedKmh:  68 },
      { code: 'KW14', name: 'Yassamo',               kanji: '—',              km: 27.82, segSpeedKmh:  70 },
      { code: 'KW15', name: 'Ibarosu Hinnandoshi',   kanji: '歯舢花都市',     km: 28.94, segSpeedKmh:  72 },
      { code: 'KW16', name: 'Otsumi-Ibarosu',        kanji: '南歯舢',         km: 30.25, segSpeedKmh:  75 },
      { code: 'KW17', name: 'Ibarosu',               kanji: '歯舢',           km: 33.36, segSpeedKmh:  80 },
      { code: 'KW18', name: 'Nwatanui',              kanji: '—',              km: 35.18, segSpeedKmh:  85 },
      { code: 'KW19', name: 'Abamiwa',               kanji: '弱水',           km: 38.51, segSpeedKmh:  88 },
      { code: 'KW20', name: 'Shiwesuno',             kanji: '—',              km: 40.69, segSpeedKmh:  90 },
      { code: 'KW21', name: 'Sogeisu',               kanji: '—',              km: 44.13, segSpeedKmh:  95 },
      { code: 'KW22', name: 'Funoshoni',             kanji: '—',              km: 45.38, segSpeedKmh: 120 },
      { code: 'KW23', name: 'Sārishiki',             kanji: '川北',           km: 48.43, segSpeedKmh:  95 },
      { code: 'KW24', name: 'Karue',                 kanji: '松澤',           km: 51.83, segSpeedKmh:  92 },
      { code: 'KW25', name: 'Kotamari',              kanji: '細幅射',         km: 56.84, segSpeedKmh:  90 },
      { code: 'KW26', name: 'Enemui',                kanji: '—',              km: 63.93, segSpeedKmh:  88 },
      { code: 'KW27', name: 'Kamasa Taru',           kanji: '寺嵯舟',         km: 67.03, segSpeedKmh:  85 },
      { code: 'KW28', name: 'Zayashuni',             kanji: '—',              km: 70.28, segSpeedKmh:  85 },
      { code: 'KW29', name: 'Abiro',                 kanji: '獏路',           km: 76.15, segSpeedKmh:  88 },
      { code: 'KW30', name: 'Yakkais',               kanji: '—',              km: 79.94, segSpeedKmh:  85 },
      { code: 'KW31', name: 'Rinongauri',            kanji: '桉沼',           km: 84.28, segSpeedKmh:  80 },
      { code: 'KW32', name: 'Yamakoga',              kanji: '倉湖加',         km: 84.35 },
    ],
  },

  /* ────────────────────────────────────────────────
     TS — Tandan-Senpyan Line · 丹淡船駢線
     27 stazioni · 133.88 km
     Capilinea: AI01 Aikami Eigau ↔ TS20 Shutazai
     Percorso fisico (da nord a sud):
       AI01 → AI04 (ramo Aikami)
       → TS23 → TS21 (prosecuzione nord oltre Yamakoga)
       → TS01 Yamakoga
       → TS02 → TS09 (tratto condiviso KW, percorso verso Sainðaul)
       → TS10 → TS20 Shutazai (tronco principale Senpyan)
     km: progressiva cumulativa da AI01=0.00, calcolata dalle
         distanze interstazione reali. AI04→TS23 = 1.63 km.

     NOTA nomi duplicati (FIX 11):
       TS10 'Eigandan Senpyan (Semukudai)' — giunzione TS↔KW, tratto nord
       TS19 'Eigandan Senpyan'             — fermata tronco sud, capolinea prossimo
       TS11 'Rismyonjen (Eigandan)'        — tratto nord
       TS17 'Rismyonjen'                   — tratto sud
  ──────────────────────────────────────────────── */
  TS: {
    id: 'TS',
    name: 'Tandan-Senpyan Line',
    nameJa: '丹淡船駢線',
    color: '#F5EE27',
    circular: false,
    headwayPeak: 20,
    headwayOffPeak: 20,
    totalKm: 133.88,
    stations: [
      // ── Ramo Aikami ──
      { code: 'AI01', name: 'Aikami Eigau',                    kanji: '—',          km:   0.00 },
      { code: 'AI02', name: 'Tomahashi',                       kanji: '—',          km:   1.73 },
      { code: 'AI03', name: 'Kukaðuka',                        kanji: '—',          km:   2.81 },
      { code: 'AI04', name: 'Moto-Aikami',                     kanji: '—',          km:   4.01 },
      // ── Prosecuzione nord (giunzione Aikami → Yuriyama → Ikotsuha) ──
      { code: 'TS23', name: 'Yuriyama',                        kanji: '油里倉',     km:   5.64 },
      { code: 'TS22', name: 'Sāryarasa',                       kanji: '河霧',       km:   9.36 },
      { code: 'TS21', name: 'Ikotsuha',                        kanji: '梧戦',       km:  13.47 },
      // ── Yamakoga e tratto condiviso KW (verso Sainðaul) ──
      { code: 'TS01', name: 'Yamakoga',                        kanji: '倉湖加',     km:  15.10 },
      { code: 'TS02', name: 'Abiro',                           kanji: '獏路',       km:  23.30 },
      { code: 'TS03', name: 'Funoshoni',                       kanji: '—',          km:  54.07 },
      { code: 'TS04', name: 'Nwatanui',                        kanji: '—',          km:  64.27 },
      { code: 'TS05', name: 'Ibarosu',                         kanji: '歯舢',       km:  66.09 },
      { code: 'TS06', name: 'Niji-Kawayatsu',                  kanji: '西嘉夬苫',   km:  78.84 },
      { code: 'TS07', name: 'Kawayatsu',                       kanji: '嘉夬苫',     km:  80.92 },
      { code: 'TS08', name: 'Shin-Kawayatsu',                  kanji: '新嘉夬苫',   km:  84.49 },
      { code: 'TS09', name: 'Semukudai',                       kanji: '世牧臺',     km:  86.06 },
      // ── Tronco principale Senpyan (verso Shutazai) ──
      // FIX 11: rinominato da 'Eigandan Senpyan' per disambiguare da TS19
      { code: 'TS10', name: 'Eigandan Senpyan (Semukudai)',     kanji: '永玵段船駢（世牧臺）', km:  89.08 },
      // FIX 11: rinominato da 'Rismyonjen' per disambiguare da TS17
      { code: 'TS11', name: 'Rismyonjen (Eigandan)',           kanji: '—',          km:  94.18 },
      { code: 'TS12', name: 'Binno',                           kanji: '苠喃',       km:  97.43 },
      { code: 'TS13', name: 'Sainðaul Central',                kanji: '作安崎中央', km: 100.43 },
      { code: 'TS14', name: 'Shimamera',                       kanji: '渠瀬田',     km: 103.43 },
      { code: 'TS15', name: 'Nihkyonta',                       kanji: '濱角',       km: 106.43 },
      // TS16 Kasakuri: stesso nodo di interscambio di K02 Niji-Sainðaul (IZX Keishin)
      { code: 'TS16', name: 'Kasakuri',                        kanji: '鯛巻',       km: 109.43 },
      { code: 'TS17', name: 'Rismyonjen',                      kanji: '—',          km: 113.43 },
      { code: 'TS18', name: 'Ipporai-Senpyan',                 kanji: '—',          km: 119.43 },
      { code: 'TS19', name: 'Eigandan Senpyan',                kanji: '永玵段船駢', km: 125.43 },
      { code: 'TS20', name: 'Shutazai',                        kanji: '守多彩',     km: 133.88 },
    ],
  },

  /* ────────────────────────────────────────────────
     CK — Chukkūn Line · 竹空線
     33 stazioni · 57.92 km
     Capolinea: CK01 Asunahama Airport Terminal 4
              ↔ CK33 Moriyose
     Passa per: Sainðaul Int'l Airport, Rinkūn City,
     Riimibaiken, corridoio Seishaku (SK16–SK24)
     Cinematica: EMU vmax 100 km/h, a=0.9 m/s², dwell 30s
     Frequenza: 15 min peak · 30 min off-peak
  ──────────────────────────────────────────────── */
  CK: {
    id: 'CK',
    name: 'Chukkūn Line',
    nameJa: '竹空線',
    color: '#6B9E3E',
    circular: false,
    headwayPeak: 15,
    headwayOffPeak: 30,
    totalKm: 57.92,
    stations: [
      { code: 'CK01', name: 'Asunahama Airport Terminal 4',   kanji: '',             km:  0.00 },
      { code: 'CK02', name: 'Sainðaul International Airport', kanji: '作安崎國際空港', km:  3.11 },
      { code: 'CK03', name: 'Shinseibijān',                   kanji: '新整備場',      km:  5.56 },
      { code: 'CK04', name: 'Rinkūn City',                    kanji: 'རིན་ཟེང་པ་ཊཱ',  km:  8.21 },
      { code: 'CK05', name: 'Ikisawa',                        kanji: '琴空',          km:  9.46 },
      { code: 'CK06', name: 'Togara',                         kanji: '焦羅',          km: 10.44 },
      { code: 'CK07', name: 'Toibotsuta',                     kanji: '蚧垣',          km: 12.15 },
      { code: 'CK08', name: 'Riimibaiken',                    kanji: '𠝏別',          km: 13.64 },
      { code: 'CK09', name: 'Shin-Tsuruna',                   kanji: '新鳰',          km: 14.85 },
      { code: 'CK10', name: 'Tsaibako',                       kanji: '済鴒',          km: 15.75 },
      { code: 'CK11', name: 'Tsurunarikki',                   kanji: '鳰陸起',        km: 16.96 },
      { code: 'CK12', name: 'Eikunna',                        kanji: '栄勳那',        km: 18.13 },
      { code: 'CK13', name: 'Rismyonjen',                     kanji: '',             km: 19.90 },
      { code: 'CK14', name: 'Dodonuka',                       kanji: '登戸降',        km: 22.05 },
      { code: 'CK15', name: 'Toemonjaru',                     kanji: '',             km: 23.74 },
      { code: 'CK16', name: 'Kasakuri',                       kanji: '鯛巻',          km: 26.47 },
      { code: 'CK17', name: 'Nihkyonta',                      kanji: '濱角',          km: 30.28 },
      { code: 'CK18', name: 'Alkuitsa',                       kanji: '潮尾',          km: 31.88 },
      { code: 'CK19', name: 'Tajamōri',                       kanji: '宰毛利',        km: 33.87 },
      { code: 'CK20', name: 'Tobeskauri',                     kanji: '鴨沼',          km: 35.13 },
      { code: 'CK21', name: 'Makkeriya',                      kanji: '平追',          km: 36.10 },
      { code: 'CK22', name: 'Shiitehongi',                    kanji: '茛本名',        km: 37.80 },
      { code: 'CK23', name: 'Kasaraki',                       kanji: '次羽',          km: 39.54 },
      { code: 'CK24', name: 'Makurigawa',                     kanji: '炭界',          km: 40.55 },
      { code: 'CK25', name: 'Riyakugo',                       kanji: '追句胡',        km: 41.77 },
      { code: 'CK26', name: 'Oizato',                         kanji: '粕穫',          km: 42.83 },
      { code: 'CK27', name: 'Shakihori',                      kanji: '石登',          km: 47.03 },
      { code: 'CK28', name: 'Awada',                          kanji: '邊太',          km: 48.33 },
      { code: 'CK29', name: 'Punomowen',                      kanji: '㷀園',          km: 49.24 },
      { code: 'CK30', name: 'Kayahori Bunki',                 kanji: '香弥登分岐',    km: 50.36 },
      { code: 'CK31', name: 'Irumanpi',                       kanji: '',             km: 52.80 },
      { code: 'CK32', name: 'Moriyose Isamata',               kanji: '竹峰安伸',      km: 55.86 },
      { code: 'CK33', name: 'Moriyose',                       kanji: '竹峰',          km: 57.92 },
    ],
  },
};

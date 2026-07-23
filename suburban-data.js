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
  LL01: ['K01', 'R01', 'E01', 'AX06'],  // Sainðaul Central
  LL17: ['AX07'],                         // Herubori
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
    stations: [],
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

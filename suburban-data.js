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

   Nota km:
     I valori km della Loop Line sono stime proporzionali su 24.5 km
     totali di circuito. Da rivedere con dati cartografici reali.
     Per le altre linee i km sono segnaposto (0.0) in attesa dei dati.
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
     Circolare · 24.5 km · 19 stazioni · dal 1937
  ──────────────────────────────────────────────── */
  LO: {
    id: 'LO',
    name: 'Loop Line',
    nameJa: '環状線',
    color: '#34589F',
    circular: true,
    headwayPeak: 1.5,
    headwayOffPeak: 5,
    totalKm: 24.5,
    stations: [
      { code: 'LL01', name: 'Sainðaul Central',     kanji: '作安崎中央',   km:  0.0 },
      { code: 'LL02', name: 'Binno',                kanji: '苠喃',         km:  1.2 },
      { code: 'LL03', name: 'Shiitehongi',          kanji: '茛本名',       km:  2.6 },
      { code: 'LL04', name: 'Jigasūngai Kōwen',    kanji: '治ヶ僧涯公園', km:  3.9 },
      { code: 'LL05', name: 'Jufurai Kōwen Niji',  kanji: '朱布来公園西', km:  5.1 },
      { code: 'LL06', name: 'Punoidan',             kanji: '富硾壇',       km:  6.4 },
      { code: 'LL07', name: 'Rupekoppe',            kanji: '孱槻',         km:  7.8 },
      { code: 'LL08', name: 'Isenebo',              kanji: '床踔',         km:  9.3 },
      { code: 'LL09', name: 'Igashikura',           kanji: '品霜',         km: 10.8 },
      { code: 'LL10', name: 'Hayatogaru',           kanji: '久松',         km: 12.2 },
      { code: 'LL11', name: 'Rakkashoni',           kanji: '鳶腳',         km: 13.5 },
      { code: 'LL12', name: 'Sumi-Kokendake',       kanji: '隠古剣館',     km: 14.9 },
      { code: 'LL13', name: 'Oritoku',              kanji: '壌外',         km: 16.1 },
      { code: 'LL14', name: 'Tomiganei',            kanji: '庭ヶ汢',       km: 17.3 },
      { code: 'LL15', name: 'Tagashiga',            kanji: '浚藻',         km: 18.6 },
      { code: 'LL16', name: 'Oiseharu',             kanji: '粕墾',         km: 19.8 },
      { code: 'LL17', name: 'Herubori',             kanji: '杏登',         km: 21.1 },
      { code: 'LL18', name: 'Ōbakura',              kanji: '大砌',         km: 22.4 },
      { code: 'LL19', name: 'Aketsue',              kanji: '薫都衛',       km: 23.6 },
      // km[19→0] = 0.9 km per chiudere il circuito su LL01 (totale 24.5)
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

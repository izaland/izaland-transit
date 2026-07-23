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

   INTERCHANGE:
     Mappa codice-stazione → array di codici equivalenti su altre reti.
     LL01 (Sainðaul Central, Loop Line) è in interscambio con:
       K01  — IZX Keishin
       R01  — IZX Ryānkai
       E01  — IZX Eira
       AX06 — Airport Express (Sainðaul Central)

   Nota km:
     I valori km della Loop Line sono stime proporzionali su 24.5 km
     totali di circuito. Da rivedere con dati cartografici reali.
     Per le altre linee i km sono segnaposto (0.0) in attesa dei dati.
================================================================ */
'use strict';

/* ================================================================
   SUBURBAN_INTERCHANGE
   Mappa: codice suburbano → [codici IZX/AX corrispondenti]
   Usata da SuburbanRouter per costruire percorsi con cambio
   tra la rete suburbana Izarail e la rete IZX/Airport Express.
================================================================ */
const SUBURBAN_INTERCHANGE = {
  LL01: ['K01', 'R01', 'E01', 'AX06'],
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

  /* ────────────────────────────────────────────────
     KD — Kidai Line · 磯大線
     Lineare · 156.87 km · 47+ stazioni · dal 1990
     TODO: popolare stazioni e km da commuter.html
  ──────────────────────────────────────────────── */
  KD: {
    id: 'KD',
    name: 'Kidai Line',
    nameJa: '磯大線',
    color: '#8dc159',
    circular: false,
    headwayPeak: 7,
    headwayOffPeak: 12,
    totalKm: 156.87,
    stations: [], // TODO
  },

  /* ────────────────────────────────────────────────
     SK — Seishaku Line · 盛石線
     Lineare · 103.95 km · 49 stazioni · dal 1985
  ──────────────────────────────────────────────── */
  SK: {
    id: 'SK',
    name: 'Seishaku Line',
    nameJa: '盛石線',
    color: '#7AE3E3',
    circular: false,
    headwayPeak: 10,
    headwayOffPeak: 20,
    totalKm: 103.95,
    stations: [], // TODO
  },

  /* ────────────────────────────────────────────────
     KS — Kawasabu Line
     Lineare · 47.10 km · 27 stazioni · dal 1990
  ──────────────────────────────────────────────── */
  KS: {
    id: 'KS',
    name: 'Kawasabu Line',
    nameJa: '--線',
    color: '#339966',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 47.10,
    stations: [], // TODO
  },

  /* ────────────────────────────────────────────────
     KW — Kwōkei Line · 荒京線
     Lineare · 84.35 km · 30 stazioni · dal 1992
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
    stations: [], // TODO
  },

  /* ────────────────────────────────────────────────
     RI — Riimiilla Line
     Lineare · 100.56 km · 35 stazioni · dal 1985
  ──────────────────────────────────────────────── */
  RI: {
    id: 'RI',
    name: 'Riimiilla Line',
    nameJa: '---線',
    color: '#ffd320',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 100.56,
    stations: [], // TODO
  },

  /* ────────────────────────────────────────────────
     SS — Shosen Line
     Lineare · 50.19 km · 16 stazioni · dal 2008
  ──────────────────────────────────────────────── */
  SS: {
    id: 'SS',
    name: 'Shosen Line',
    nameJa: '--線',
    color: '#D2B48C',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 50.19,
    stations: [], // TODO
  },

  /* ────────────────────────────────────────────────
     GD — Gaekwan-Dōnbu Line · 外環東部線
     Lineare · 78.48 km · dal 2005
  ──────────────────────────────────────────────── */
  GD: {
    id: 'GD',
    name: 'Gaekwan-Dōnbu Line',
    nameJa: '外環東部線',
    color: '#B16B48',
    circular: false,
    headwayPeak: 7,
    headwayOffPeak: 10,
    totalKm: 78.48,
    stations: [], // TODO
  },

  /* ────────────────────────────────────────────────
     JD — Juwon-Kodōn Line · 中央湖東線
     Lineare · 78.35 km · dal 1985
  ──────────────────────────────────────────────── */
  JD: {
    id: 'JD',
    name: 'Juwon-Kodōn Line',
    nameJa: '中央湖東線',
    color: '#FF66CC',
    circular: false,
    headwayPeak: 5,
    headwayOffPeak: 10,
    totalKm: 78.35,
    stations: [], // TODO
  },

  /* ────────────────────────────────────────────────
     CK — Chukkūn Line · 竹空線
     Lineare · 55.93 km · 31 stazioni · dal 2015
  ──────────────────────────────────────────────── */
  CK: {
    id: 'CK',
    name: 'Chukkūn Line',
    nameJa: '竹空線',
    color: '#B8B895',
    circular: false,
    headwayPeak: 10,
    headwayOffPeak: 15,
    totalKm: 55.93,
    stations: [], // TODO
  },

};

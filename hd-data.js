/* ================================================================
   HD-DATA.JS — Handai Electric Railway Main Line
   彎大電鐵本線 — Linea privata · zona Warohan

   Capolinea: HD01 Warohan Daiches ↔ HD30 Kuryen-ji
   Lunghezza totale: 39.48 km · 30 stazioni
   Interscambi:
     HD01 (Warohan Daiches) ↔ K17  (IZX Keishin)
================================================================ */
'use strict';

const HD_INTERCHANGE = {
  HD01: ['K17'],
};

const HD_LINES = {
  HD: {
    id: 'HD',
    name: 'Handai Electric Railway Main Line',
    nameJa: '彎大電鐵本線',
    color: '#312C85',
    circular: false,
    headwayPeak: 10,
    headwayOffPeak: 20,
    totalKm: 39.48,
    stations: [
      { code: 'HD01', name: 'Warohan Daiches',              kanji: '深灣大鐵',       km:  0.0  },  /* node 276444174 */
      { code: 'HD02', name: 'Warohan Yushamunke',            kanji: '',               km:  1.4  },  /* node 1776793431 */
      { code: 'HD03', name: 'Ponkatakui Kōwen',              kanji: '',               km:  2.66 },  /* node 2016114212 */
      { code: 'HD04', name: 'Warohan Kaishin Hakubuskwan',   kanji: '深彎改新博物館',  km:  3.71 },  /* node 2016107013 */
      { code: 'HD05', name: 'Nahobasa',                      kanji: '奈歩岲',         km:  4.81 },  /* node 2457751364 */
      { code: 'HD06', name: 'Tokuul 1-sa',                   kanji: '徳崎1沙',        km:  5.32 },  /* node 3298275225 */
      { code: 'HD07', name: 'Tokuul Otsumi-kō Adae',         kanji: '徳崎南高前',     km:  6.33 },  /* node 3804132986 */
      { code: 'HD08', name: 'Takarun Yesumuri',              kanji: '',               km:  7.92 },  /* node 2458213727 */
      { code: 'HD09', name: 'Kōnanchin',                     kanji: '江南津',         km:  9.09 },  /* node 3298521539 */
      { code: 'HD10', name: 'Takarun Kōwen Nariniswae',      kanji: '太加柳公園東口',  km: 10.15 },  /* node 3948187311 */
      { code: 'HD11', name: 'Cheiryūnsha',                   kanji: '清龍社',         km: 12.02 },  /* node 3948187302 */
      { code: 'HD12', name: 'Inagatsumi',                    kanji: '',               km: 13.55 },  /* node 2458206331 */
      { code: 'HD13', name: 'Botiku',                        kanji: '菩提丘',         km: 14.79 },  /* node 3948187291 */
      { code: 'HD14', name: 'Sayunaju',                      kanji: '',               km: 15.9  },  /* node 2458201171 */
      { code: 'HD15', name: 'Rihanoippa',                    kanji: '高雲',           km: 18.06 },  /* node 3947352431 */
      { code: 'HD16', name: 'Saginnuni',                     kanji: '羽之沢',         km: 19.3  },  /* node 3948183971 */
      { code: 'HD17', name: 'Mirakigamae',                   kanji: '翠ヶ丘',         km: 20.12 },  /* node 3948183962 */
      { code: 'HD18', name: 'Tosakutō',                      kanji: '堍海',           km: 21.01 },  /* node 2264789561 */
      { code: 'HD19', name: 'Cheivinsha-adae',               kanji: '青濱社前',       km: 22.54 },  /* node 3947352411 */
      { code: 'HD20', name: 'Pattotsunokke',                 kanji: '石橋坂',         km: 23.98 },  /* node 3948179841 */
      { code: 'HD21', name: 'Maisandān',                     kanji: '梅山堂',         km: 25.44 },  /* node 4424271371 */
      { code: 'HD22', name: 'Yabine',                        kanji: '椰美柢',         km: 27.94 },  /* node 3948187871 */
      { code: 'HD23', name: 'Noimidai',                      kanji: '雲見台',         km: 30.5  },  /* node 3947352421 */
      { code: 'HD24', name: 'Paku',                          kanji: '波久',           km: 31.69 },  /* node 3947371171 */
      { code: 'HD25', name: 'Kyāmpa-sha Adae',               kanji: '香波社前',       km: 33.23 },  /* node 3947371161 */
      { code: 'HD26', name: 'Ulhatsoi',                      kanji: '崎鰹恵',         km: 34.51 },  /* node 4424271341 */
      { code: 'HD27', name: 'Niji-Naraki',                   kanji: '西那等名',       km: 35.95 },  /* node 2056260981 */
      { code: 'HD28', name: 'Shoukato Shijān',               kanji: '三日市場',       km: 37.07 },  /* node 4424271351 */
      { code: 'HD29', name: 'Naraki Nikosāri',               kanji: '那等名越川',     km: 38.33 },  /* node 4424271361 */
      { code: 'HD30', name: 'Kuryen-ji',                     kanji: '久蓮寺',         km: 39.48 },  /* node 3947371151 */
    ],
  },
};

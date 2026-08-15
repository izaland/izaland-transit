/* ================================================================
   HD-DATA.JS — Handai Electric Railway Main Line
   彎大電鐵本線 — Linea privata · zona Warohan

   Operatore : Handai Electric Railway Co. (彎大電鐵株式會社)
   Tipo      : Privata suburbana
   Regione   : Warohan
   Capolinea : HD01 Warohan Daiches ↔ HD30 Kuryen-ji
   Lunghezza : 39.48 km · 30 stazioni

   Interscambi:
     HD01 (Warohan Daiches) ↔ K17  (IZX Keishin)

   Servizi (HD_SERVICES):
     HD1  Local   HD01 ↔ HD30  tutte le fermate
                    headway: 10 min (peak) / 20 min (off-peak)
                    Prima/ultima corsa: da definire

   NOTA: aggiungere HD_SERVICES completo (firstDep, lastDep,
         peakWindows, stops Rapid se previsto) non appena
         confermati gli orari operativi.
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   HD_INTERCHANGE
   Usato da unified-router.js per il cross-network lookup.
---------------------------------------------------------------- */
const HD_INTERCHANGE = {
  HD01: ['K17'],
};

/* ----------------------------------------------------------------
   HD_LINES
   Struttura compatibile con SUBURBAN_LINES in suburban-data.js.
---------------------------------------------------------------- */
const HD_LINES = {
  HD: {
    id:            'HD',
    name:          'Handai Electric Railway Main Line',
    nameJa:        '彎大電鐵本線',
    color:         '#312C85',
    operator:      'Handai Electric Railway Co.',
    operatorJa:    '彎大電鐵株式會社',
    type:          'private',
    region:        'Warohan',
    circular:      false,
    totalKm:       39.48,
    totalStations: 30,
    headwayPeak:    10,   // minuti
    headwayOffPeak: 20,   // minuti
    stations: [
      { code: 'HD01', name: 'Warohan Daiches',            kanji: '深灣大鐵',      km:  0.0  },  /* node 276444174  */
      { code: 'HD02', name: 'Warohan Yushamunke',         kanji: '',              km:  1.4  },  /* node 1776793431 */
      { code: 'HD03', name: 'Ponkatakui Kōwen',           kanji: '',              km:  2.66 },  /* node 2016114212 */
      { code: 'HD04', name: 'Warohan Kaishin Hakubuskwan',kanji: '深彎改新博物館', km:  3.71 },  /* node 2016107013 */
      { code: 'HD05', name: 'Nahobasa',                   kanji: '奈歩岲',        km:  4.81 },  /* node 2457751364 */
      { code: 'HD06', name: 'Tokuul 1-sa',                kanji: '徳崎1沙',       km:  5.32 },  /* node 3298275225 */
      { code: 'HD07', name: 'Tokuul Otsumi-kō Adae',      kanji: '徳崎南高前',    km:  6.33 },  /* node 3804132986 */
      { code: 'HD08', name: 'Takarun Yesumuri',           kanji: '',              km:  7.92 },  /* node 2458213727 */
      { code: 'HD09', name: 'Kōnanchin',                  kanji: '江南津',        km:  9.09 },  /* node 3298521539 */
      { code: 'HD10', name: 'Takarun Kōwen Nariniswae',   kanji: '太加柳公園東口', km: 10.15 },  /* node 3948187311 */
      { code: 'HD11', name: 'Cheiryūnsha',                kanji: '清龍社',        km: 12.02 },  /* node 3948187302 */
      { code: 'HD12', name: 'Inagatsumi',                 kanji: '',              km: 13.55 },  /* node 2458206331 */
      { code: 'HD13', name: 'Botiku',                     kanji: '菩提丘',        km: 14.79 },  /* node 3948187291 */
      { code: 'HD14', name: 'Sayunaju',                   kanji: '',              km: 15.9  },  /* node 2458201171 */
      { code: 'HD15', name: 'Rihanoippa',                 kanji: '高雲',          km: 18.06 },  /* node 3947352431 */
      { code: 'HD16', name: 'Saginnuni',                  kanji: '羽之沢',        km: 19.3  },  /* node 3948183971 */
      { code: 'HD17', name: 'Mirakigamae',                kanji: '翠ヶ丘',        km: 20.12 },  /* node 3948183962 */
      { code: 'HD18', name: 'Tosakutō',                   kanji: '堍海',          km: 21.01 },  /* node 2264789561 */
      { code: 'HD19', name: 'Cheivinsha-adae',            kanji: '青濱社前',      km: 22.54 },  /* node 3947352411 */
      { code: 'HD20', name: 'Pattotsunokke',              kanji: '石橋坂',        km: 23.98 },  /* node 3948179841 */
      { code: 'HD21', name: 'Maisandān',                  kanji: '梅山堂',        km: 25.44 },  /* node 4424271371 */
      { code: 'HD22', name: 'Yabine',                     kanji: '椰美柢',        km: 27.94 },  /* node 3948187871 */
      { code: 'HD23', name: 'Noimidai',                   kanji: '雲見台',        km: 30.5  },  /* node 3947352421 */
      { code: 'HD24', name: 'Paku',                       kanji: '波久',          km: 31.69 },  /* node 3947371171 */
      { code: 'HD25', name: 'Kyāmpa-sha Adae',            kanji: '香波社前',      km: 33.23 },  /* node 3947371161 */
      { code: 'HD26', name: 'Ulhatsoi',                   kanji: '崎鰹恵',        km: 34.51 },  /* node 4424271341 */
      { code: 'HD27', name: 'Niji-Naraki',                kanji: '西那等名',      km: 35.95 },  /* node 2056260981 */
      { code: 'HD28', name: 'Shoukato Shijān',            kanji: '三日市場',      km: 37.07 },  /* node 4424271351 */
      { code: 'HD29', name: 'Naraki Nikosāri',            kanji: '那等名越川',    km: 38.33 },  /* node 4424271361 */
      { code: 'HD30', name: 'Kuryen-ji',                  kanji: '久蓮寺',        km: 39.48 },  /* node 3947371151 */
    ],
  },
};

/* ----------------------------------------------------------------
   HD_SERVICES
   Struttura compatibile con KS_SERVICES / tt-engine.js.

   TODO: completare con firstDep, lastDep e peakWindows
         una volta definiti gli orari operativi.
         Se previsto un servizio Rapid/Express, aggiungere
         le voci per SB e NB con il campo stops[].
---------------------------------------------------------------- */
const HD_SERVICES = [

  /* ──────────────────────────────────────────────────
     HD1 — Local (tutte le fermate) · SB  HD01→HD30
  ────────────────────────────────────────────────── */
  {
    id:       'HD1',
    desc:     'Local',
    fromCode: 'HD01',
    toCode:   'HD30',
    headway:  10,           // 6 tph (peak) — da affinare con peakWindows
    stops:    [],           // vuoto = ferma ovunque
    firstDep: null,         // TODO: '05:XX'
    lastDep:  null,         // TODO: '23:XX'
  },

  /* ──────────────────────────────────────────────────
     HD1 — Local (tutte le fermate) · NB  HD30→HD01
  ────────────────────────────────────────────────── */
  {
    id:       'HD1',
    desc:     'Local',
    fromCode: 'HD30',
    toCode:   'HD01',
    headway:  10,
    stops:    [],
    firstDep: null,         // TODO: '05:XX'
    lastDep:  null,         // TODO: '23:XX'
  },

  /* ──────────────────────────────────────────────────
     HD2 — Rapid (placeholder) · SB  HD01→HD30
     Decommentare e completare stops[] se il servizio
     Rapid viene istituito.
  ────────────────────────────────────────────────── */
  // {
  //   id:       'HD2',
  //   desc:     'Rapid',
  //   fromCode: 'HD01',
  //   toCode:   'HD30',
  //   headway:  30,
  //   stops:    ['HD01', /* ... */ 'HD30'],
  //   peakWindows: [
  //     { from: 'HH:MM', to: 'HH:MM' },
  //   ],
  // },
];

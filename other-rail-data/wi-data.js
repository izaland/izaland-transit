/* ================================================================
   WI-DATA.JS — Wataiga Monorail
   ૮ઠ૩ડૃ ઇ૾પ૾દૅઃધ્ — Monorotaia privata · zona Watarui / Igattarun

   Operatore : Wataiga Monorail Co.
   Tipo      : Monorotaia privata (straddle-beam)
   Regione   : Watarui – Igattarun
   Capolinea : WI01 Watarui Otsuminiswae ↔ WI13 Igattarun Juwon
   Lunghezza : 14.27 km · 13 stazioni
   Vel. media: 40 km/h

   Interscambi:
     WI01 (Watarui Otsuminiswae) ↔ M13   (IZX)
     WI01 (Watarui Otsuminiswae) ↔ WKB01 (WKB)
     WI02 (Tankyānji)            ↔ WKB03 (WKB)

   Servizi (WI_SERVICES):
     WI1  Local   WI01 ↔ WI13  tutte le fermate (femra)
                    Orario: 05:30 – 23:30
                    6 tph off-peak (headway 10 min)
                   12 tph peak    (headway  5 min)

================================================================ */
'use strict';

/* ----------------------------------------------------------------
   WI_INTERCHANGE
   Usato da unified-router.js per il cross-network lookup.
---------------------------------------------------------------- */
const WI_INTERCHANGE = {
  WI01: ['M13', 'WKB01'],
  WI02: ['WKB03'],
};

/* ----------------------------------------------------------------
   WI_LINES
   Struttura compatibile con HD_LINES / suburban-data.js.
---------------------------------------------------------------- */
const WI_LINES = {
  WI: {
    id:            'WI',
    name:          'Wataiga Monorail',
    nameLocal:     '૮ઠ૩ડૃ ઇ૾પ૾દૅઃધ્',
    color:         '#838c67',
    operator:      'Wataiga Monorail Co.',
    operatorJa:    '',
    type:          'private-monorail',
    region:        'Watarui / Igattarun',
    circular:      false,
    avgSpeedKmh:   40,
    totalKm:       14.27,
    totalStations: 13,
    hoursFirst:    '05:30',
    hoursLast:     '23:30',
    headwayPeak:    5,   // 12 tph
    headwayOffPeak: 10,  //  6 tph
    stations: [
      { code: 'WI01', name: 'Watarui Otsuminiswae',      kanji: '芳聖南口',      km:  0.00 },  /* node 2599106333 */
      { code: 'WI02', name: 'Tankyānji',                 kanji: '誕響寺',        km:  1.31 },  /* node 2599106053 */
      { code: 'WI03', name: 'Aserimowa Jutakugai',       kanji: '刈箕住宅街',    km:  2.33 },  /* node 2599106043 */
      { code: 'WI04', name: 'Bonkado Byōwin',            kanji: '千日病院',      km:  3.37 },  /* node 2599106033 */
      { code: 'WI05', name: 'Watarui Fukushi Daigaku',   kanji: '芳聖福祉大學',  km:  4.46 },  /* node 2599106023 */
      { code: 'WI06', name: 'Sasamo',                    kanji: '佐山',          km:  5.94 },  /* node 2599106013 */
      { code: 'WI07', name: 'Tappuni',                   kanji: '狭沢',          km:  7.12 },  /* node 2599106003 */
      { code: 'WI08', name: 'Igattarun Korebaiken',      kanji: '',              km:  8.30 },  /* node 2599105993 */
      { code: 'WI09', name: 'Tsuntawari',                kanji: '',              km:  9.77 },  /* node 2599105983 */
      { code: 'WI10', name: 'Yasecharan',                kanji: '',              km: 10.86 },  /* node 2599105973 */
      { code: 'WI11', name: 'Usetamoki',                 kanji: '',              km: 12.01 },  /* node 2599105963 */
      { code: 'WI12', name: 'Igattarun Shiyakujo-adae', kanji: '蝉陵市役所前',  km: 13.61 },  /* node 2599105953 */
      { code: 'WI13', name: 'Igattarun Juwon',           kanji: '蝉陵中央',      km: 14.27 },  /* node 1352042573 */
    ],
  },
};

/* ----------------------------------------------------------------
   WI_SERVICES
   Struttura compatibile con HD_SERVICES / tt-engine.js.
   Femra (fermate) in tutte le stazioni per ogni corsa.
---------------------------------------------------------------- */
const WI_SERVICES = [

  /* ──────────────────────────────────────────────────
     WI1 — Local (femra ovunque) · SB  WI01 → WI13
     Off-peak: 6 tph (headway 10 min)
     Peak:    12 tph (headway  5 min)
  ────────────────────────────────────────────────── */
  {
    id:       'WI1',
    desc:     'Local',
    fromCode: 'WI01',
    toCode:   'WI13',
    stops:    [],           // vuoto = ferma in tutte le stazioni
    firstDep: '05:30',
    lastDep:  '23:30',
    headwayOffPeak: 10,     //  6 tph
    peakWindows: [
      { from: '07:00', to: '09:30', headway: 5 },   // picco mattina
      { from: '17:00', to: '20:00', headway: 5 },   // picco sera
    ],
  },

  /* ──────────────────────────────────────────────────
     WI1 — Local (femra ovunque) · NB  WI13 → WI01
  ────────────────────────────────────────────────── */
  {
    id:       'WI1',
    desc:     'Local',
    fromCode: 'WI13',
    toCode:   'WI01',
    stops:    [],
    firstDep: '05:30',
    lastDep:  '23:30',
    headwayOffPeak: 10,
    peakWindows: [
      { from: '07:00', to: '09:30', headway: 5 },
      { from: '17:00', to: '20:00', headway: 5 },
    ],
  },

];

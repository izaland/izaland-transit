/* ================================================================
   M8-DATA.JS — Metro Line 8 · Sainðaul Urban Line (作安崎都市線)
   ================================================================
   Est. TBD
   Metro proper section: M801 (Kishagoi-Exhibitown) → M824 (Komayunden-Dōnmus Kōwen)
   Total metro section: 24 stations · 23.69 km

   Through (相互直通) services:
     North → IR Izarail (beyond M801, operator boundary at M801)
     South → Ibaches Railway (branching at M818 Jufurai = IB002;
              IB001 Anagusa Mukai = M817 is served by both M8 and Ibaches)

   Branch structure (Toei Asakusa / Keikyu model):
     Service A (metro pure):  IR ... → M801 → M802 → ... → M824
     Service B (Ibaches through): IR ... → M801 → M802 → ... → M817(IB001) → M818(IB002) → [Ibaches Railway]

   Operator boundaries:
     M801  — IR Izarail boundary (north); IR trains enter metro tracks here
     M817  — IB001 (Anagusa Mukai): first Ibaches station, shared with M8
     M818  — IB002 (Jufurai): branching point; through trains diverge to Ibaches here

   Codifica:
     M801–M824  metro proper, geographical order north → south

   Note km:
     Progressive distances from M801 (km 0.0).
================================================================ */
'use strict';

const M8_ST = {
  M801: { n: 'Kishagoi-Exhibitown',       k: '喜舎拘-૮ૅડાયારૃાઠ૮ેપ્', km:  0.00 },
  M802: { n: 'Tsumasui',                  k: '都馬水',                   km:  1.15 },
  M803: { n: 'Gawinosechi',               k: 'ડૃ૮ા之溝',                 km:  2.53 },
  M804: { n: 'Ishitsuma',                 k: '実維',                     km:  3.43 },
  M805: { n: 'Tajamōri',                  k: '宰毛利',                   km:  4.36 },
  M806: { n: 'Heinomoji',                 k: '駕桃',                     km:  4.94 },
  M807: { n: 'Awasada',                   k: '邊褒',                     km:  5.86 },
  M808: { n: 'Nimunoðai',                 k: '秩済',                     km:  6.42 },
  M809: { n: 'Yauraki',                   k: '葯洛',                     km:  7.56 },
  M810: { n: 'Shiki-Tsutomaku',           k: '',                         km:  8.67 },
  M811: { n: 'Chestō Toshi',              k: '鐡道都市',                 km:  9.41 },
  M812: { n: 'Nashikoma',                 k: '刖冬',                     km: 10.37 },
  M813: { n: 'Tahnakusa',                 k: '',                         km: 11.53 },
  M814: { n: 'Sainðaul Central',          k: '作安崎中央',               km: 12.70 },
  M815: { n: 'Egunsen Botanical Garden',  k: '慧群仙植物園',             km: 13.38 },
  M816: { n: 'Takagimori',                k: '浚名竹',                   km: 14.46 },
  M817: { n: 'Anagusa Mukai',             k: '矢模武凱',                 km: 15.48,
           operatorNote: 'IB001 — first Ibaches Railway station (shared with M8)' },
  M818: { n: 'Jufurai',                   k: '朱布来',                   km: 17.05,
           operatorNote: 'IB002 — branching point: through trains diverge to Ibaches here' },
  M819: { n: 'Ibu-Jufurai',               k: '中朱布来',                 km: 18.41 },
  M820: { n: 'Jufurai Kōwen Niji',        k: '朱布来公園西',             km: 19.12 },
  M821: { n: 'Ekashugi',                  k: '月手伎',                   km: 20.18 },
  M822: { n: 'Yahamori',                  k: '弥葩竹',                   km: 21.03 },
  M823: { n: 'Oizato',                    k: '粕穫',                     km: 22.19 },
  M824: { n: 'Komayunden-Dōnmus Kōwen',   k: '冬允殿-動物公園',          km: 23.69 },
};

/* Ordine canonico geografico: nord (Kishagoi-Exhibitown) → sud (Komayunden-Dōnmus Kōwen) */
const M8_CANONICAL_ORDER = [
  'M801', 'M802', 'M803', 'M804', 'M805', 'M806', 'M807', 'M808',
  'M809', 'M810', 'M811', 'M812', 'M813', 'M814', 'M815', 'M816',
  'M817', 'M818', 'M819', 'M820', 'M821', 'M822', 'M823', 'M824',
];

/* ----------------------------------------------------------------
   Metadati linea
---------------------------------------------------------------- */
const M8_META = {
  id:    'M8',
  code:  'M8',
  name:  'Sainðaul Urban Line',
  nameJa: '作安崎都市線',
  color: null, // TODO: assegnare colore linea

  /* ── Through (相互直通) services ───────────────────────────── */
  thruServices: [
    {
      direction:     'north',
      operator:      'IR Izarail',
      operatorCode:  'IR',
      boundaryStation: 'M801',   // M801 = primo stop metro; IR entra qui
      note:          'IR trains run through onto M8 tracks north of M801',
    },
    {
      direction:     'south-east',
      operator:      'Ibaches Railway',
      operatorCode:  'IB',
      sharedStation: 'M817',     // IB001 Anagusa Mukai — shared stop
      branchStation: 'M818',     // IB002 Jufurai — trains diverge here onto Ibaches tracks
      note:          'Ibaches Railway shares M817; branch diverges at M818 (IB002)',
    },
  ],

  /* ── Branch structure ──────────────────────────────────────── */
  /*
   *  IR Izarail
   *       ↓
   *  M801 ──────────────────────────── M817 (IB001)
   *                                      │
   *                    ┌─────────────────┴────────────────────┐
   *                    │ Ramo A (metro puro)                   │ Ramo B (through Ibaches)
   *                   M818 → ... → M824                      M818 (IB002) → [Ibaches Rwy]
   *
   *  M817 Anagusa Mukai: servita da ENTRAMBI i rami
   *  M818 Jufurai: punto di biforcazione; nel ramo A è stazione metro normale,
   *                nel ramo B è IB002 e i treni entrano nella rete Ibaches
   */
  branches: {
    A: {
      name:        'Metro Pure (end-to-end)',
      terminus:    'M824',
      branchFrom:  null,         // nessuna biforcazione: M817→M818→M824
    },
    B: {
      name:        'Ibaches Railway Through',
      sharedUntil: 'M817',      // M817 (IB001) servita da questo ramo
      branchAt:    'M818',      // da M818 (IB002) in poi: rete Ibaches
      ibachesEntry: 'IB002',
    },
  },
};

/* ----------------------------------------------------------------
   Servizi
   A  Metro pure: IR ... → M801 → ... → M824 (all-stop)
   B  Ibaches through: IR ... → M801 → ... → M817 → [Ibaches Railway from M818]
   Nota: nel journey planner, i servizi B mostrano cambio operatore
         a M817/M818 anche se non c'è cambio fisico di treno.
---------------------------------------------------------------- */
const M8_SVC = {
  A: {
    name:        'Metro Pure',
    nameJa:      '都市線直通',
    note:        'All-stop · IR Izarail → M801 → M824',
    stops:       M8_CANONICAL_ORDER,  // ferma a tutte le stazioni
    operatorThru: [
      { operator: 'IR Izarail', code: 'IR', from: null,   to: 'M801' },
      { operator: 'Metro M8',   code: 'M8', from: 'M801', to: 'M824' },
    ],
  },
  B: {
    name:        'Ibaches Through',
    nameJa:      '磯白鉄道直通',
    note:        'IR Izarail → M801 → M817 → Ibaches Railway (diverge at M818/IB002)',
    stops:       [
      'M801','M802','M803','M804','M805','M806','M807','M808',
      'M809','M810','M811','M812','M813','M814','M815','M816',
      'M817',
      /* M818 onward: Ibaches Railway tracks — IB002, IB003, ... (data TBD) */
    ],
    operatorThru: [
      { operator: 'IR Izarail',       code: 'IR', from: null,   to: 'M801' },
      { operator: 'Metro M8',         code: 'M8', from: 'M801', to: 'M817' },
      { operator: 'Ibaches Railway',  code: 'IB', from: 'M818', to: null   },
    ],
  },
};

/* ----------------------------------------------------------------
   Interscambi Metro Line 8 ↔ altre reti

   Stazioni con interscambio confermato dal repo:
     M806  Heinomoji       ↔ M401 (M4)                — stessa stazione
     M810  Shiki-Tsutomaku ↔ SK30 (Seishaku Line)     — stessa stazione
     M811  Chestō Toshi    ↔ SK29 (Seishaku Line)     — stessa stazione
     M812  Nashikoma       ↔ SK28 (Seishaku Line) + KD34 (Kidai Line) — stessa stazione
     M814  Sainðaul Central ↔ LL01 (Loop Line) + KD32 (Kidai) + SK26 (Seishaku)
                             + K01 (IZX KE) + R01 (IZX RY) + E01 (IZX EI) + AX06
     M817  Anagusa Mukai   ↔ M405 (M4) + KD30 (Kidai) + IB001 (Ibaches Railway)
     M818  Jufurai         ↔ IB002 (Ibaches Railway — branching point)
     M820  Jufurai Kōwen Niji ↔ LL05 (Loop Line) — stesso nome e kanji ✓
     M823  Oizato          ↔ SK20 (Seishaku Line)     — stesso nome e kanji ✓

   Stazioni con interscambio da confermare (linee future):
     M803  Gawinosechi     ↔ M201 (M2) + M1?? (futura)
     M804  Ishitsuma       ↔ M6?? (futura)
     M805  Tajamōri        ↔ IR (stazione IR sulla tratta through — da specificare)
     M807  Awasada         ↔ M9?? (futura)
     M808  Nimunoðai       ↔ M1?? (futura)
     M809  Yauraki         ↔ M12?? (futura) + Monorail (TBD)
     M810  Shiki-Tsutomaku ↔ Monorail (TBD)
     M811  Chestō Toshi    ↔ IR (stazione IR — da specificare)
     M812  Nashikoma       ↔ M17?? (futura) + IR (da specificare)
     M813  Tahnakusa       ↔ M12?? (futura) + M17?? (futura)
     M815  Egunsen Botanical Garden ↔ M2?? (futura) + M9?? (futura)
     M816  Takagimori      ↔ M3?? (futura) + M14?? (futura, overground 10 min)
     M818  Jufurai         ↔ M14?? (futura)
     M820  Jufurai Kōwen Niji ↔ M17?? (futura) + LO (Izarail Loop — LL05 ✓)
     M823  Oizato          ↔ MX1?? (Metropolitan Fast Commuter, tipo Seoul GXT — TBD)
     M824  Komayunden-Dōnmus Kōwen ↔ M3?? (futura) + M10?? (futura)
---------------------------------------------------------------- */
const M8_INTERCHANGE = {

  /* ── Interscambi confermati ───────────────────────────────── */

  M803: [
    { code: 'M201', network: 'metro',    transferMin: 3,
      note: 'M2 Gawinosechi — stesso nome' },
    // M1?? (futura)
  ],

  M806: [
    { code: 'M401', network: 'metro',    transferMin: 3,
      note: 'M4 Heinomoji — stesso nome, banchine separate' },
  ],

  M810: [
    { code: 'SK30', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Shiki-Tsutomaku, stesso nome' },
    // Monorail (TBD)
  ],

  M811: [
    { code: 'SK29', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Chestō Toshi, stesso nome' },
    // IR Izarail intermediate stop (codice da specificare)
  ],

  M812: [
    { code: 'SK28', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Nashikoma, stesso nome' },
    { code: 'KD34', network: 'suburban', transferMin: 3,
      note: 'Kidai Line — Nashikoma, stesso nome' },
    // M17?? (futura)
    // IR Izarail intermediate stop (codice da specificare)
  ],

  M814: [
    { code: 'LL01', network: 'suburban', transferMin: 3,
      note: 'Loop Line — Sainðaul Central, stesso nome' },
    { code: 'KD32', network: 'suburban', transferMin: 3,
      note: 'Kidai Line — Sainðaul Central, stesso nome' },
    { code: 'SK26', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Sainðaul Central, stesso nome' },
    { code: 'K01',  network: 'izx',      transferMin: 5,
      note: 'IZX Keishin — Sainðaul Central' },
    { code: 'R01',  network: 'izx',      transferMin: 5,
      note: 'IZX Ryānkai — Sainðaul Central' },
    { code: 'E01',  network: 'izx',      transferMin: 5,
      note: 'IZX Eira — Sainðaul Central' },
    { code: 'AX06', network: 'ax',       transferMin: 5,
      note: 'Airport Express — Sainðaul Central' },
    // + altre linee metro future (M3??, M5??, M7?? ecc.)
  ],

  M817: [
    { code: 'M405', network: 'metro',    transferMin: 3,
      note: 'M4 Anagusa Mukai — stesso nome, banchine separate' },
    { code: 'KD30', network: 'suburban', transferMin: 3,
      note: 'Kidai Line — Anagusa Mukai, uscita condivisa' },
    { code: 'IB001', network: 'ibaches', transferMin: 0,
      note: 'Ibaches Railway IB001 — stesso edificio, through service (no cambio treno sul Svc B)' },
    // M6?? (futura)
  ],

  M818: [
    { code: 'IB002', network: 'ibaches', transferMin: 0,
      note: 'Ibaches Railway IB002 — branching point, through service Svc B' },
    // M14?? (futura)
  ],

  M820: [
    { code: 'LL05', network: 'suburban', transferMin: 3,
      note: 'Loop Line — Jufurai Kōwen Niji 朱布来公園西, stesso nome e kanji' },
    // M17?? (futura)
  ],

  M823: [
    { code: 'SK20', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Oizato 粕穫, stesso nome e kanji' },
    // MX1?? Metropolitan Fast Commuter (tipo Seoul GXT — TBD)
  ],

  M824: [
    // M3?? (futura)
    // M10?? (futura)
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M8_META, M8_ST, M8_CANONICAL_ORDER, M8_SVC, M8_INTERCHANGE };
}

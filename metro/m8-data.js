/* ================================================================
   M8-DATA.JS — Metro Line 8 · Sainðaul Urban Line (作安崎都市線)
   ================================================================
   Est. TBD
   Metro proper section: M801 (Kishagoi-Exhibitown) → M824 (Komayunden-Dōnmus Kōwen)
   Total metro section: 24 stations · 23.69 km
   Line color: #00A2D3

   Through (相互直通) services:
     North → IR Izarail (beyond M801, operator boundary at M801)
     South → Ibaches Railway (branching at M818 Jufurai = IB002;
              IB001 Anagusa Mukai = M817 is served by both M8 and Ibaches)

   Services:
     A  All-stop  — covers all 24 metro stations M801→M824
     B  Ibaches Through — M801→M817 then diverges onto Ibaches Railway via M818 (IB002)
     C  Rapido — IR through → M8 selected stops → Ibaches Railway via M818

   Operator boundaries:
     M801  — IR Izarail boundary (north); IR trains enter metro tracks here
     M817  — IB001 (Anagusa Mukai): first Ibaches station, shared with M8
     M818  — IB002 (Jufurai): branching point; through trains diverge to Ibaches here

   Headway / Timetable:
     A  05:32–24:05  every  7 min  (~160 trips/direction)
     B  05:38–23:58  every 10 min  (~111 trips/direction)
     C  07:35–21:45  every 14 min  ( ~61 trips/direction)

   Codifica: M801–M824 metro proper, geographical order north → south
   km: progressive distance from M801 (km 0.0).
================================================================ */
'use strict';

const M8_ST = {
  M801: { n: 'Kishagoi-Exhibitown',       k: '喜舎拘-Exhibitown',          km:  0.00 },
  M802: { n: 'Tsumasui',                  k: '都馬水',                      km:  1.15 },
  M803: { n: 'Gawinosechi',               k: '之溝',                        km:  2.53 },
  M804: { n: 'Ishitsuma',                 k: '実維',                        km:  3.43 },
  M805: { n: 'Tajamōri',                  k: '宰毛利',                      km:  4.36 },
  M806: { n: 'Heinomoji',                 k: '駕桃',                        km:  4.94 },
  M807: { n: 'Awasada',                   k: '邊褒',                        km:  5.86 },
  M808: { n: 'Nimunoðai',                 k: '秩済',                        km:  6.42 },
  M809: { n: 'Yauraki',                   k: '葯洛',                        km:  7.56 },
  M810: { n: 'Shiki-Tsutomaku',           k: '',                            km:  8.67 },
  M811: { n: 'Chestō Toshi',              k: '鐡道都市',                    km:  9.41 },
  M812: { n: 'Nashikoma',                 k: '刖冬',                        km: 10.37 },
  M813: { n: 'Tahnakusa',                 k: '',                            km: 11.53 },
  M814: { n: 'Sainðaul Central',          k: '作安崎中央',                  km: 12.70 },
  M815: { n: 'Egunsen Botanical Garden',  k: '慧群仙植物園',                km: 13.38 },
  M816: { n: 'Takagimori',                k: '浚名竹',                      km: 14.46 },
  M817: { n: 'Anagusa Mukai',             k: '矢模武凱',                    km: 15.48,
           operatorNote: 'IB001 — first Ibaches Railway station (shared with M8)' },
  M818: { n: 'Jufurai',                   k: '朱布来',                      km: 17.05,
           operatorNote: 'IB002 — branching point: through trains diverge to Ibaches here' },
  M819: { n: 'Ibu-Jufurai',               k: '中朱布来',                    km: 18.41 },
  M820: { n: 'Jufurai Kōwen Niji',        k: '朱布来公園西',                km: 19.12 },
  M821: { n: 'Ekashugi',                  k: '月手伎',                      km: 20.18 },
  M822: { n: 'Yahamori',                  k: '弥葩竹',                      km: 21.03 },
  M823: { n: 'Oizato',                    k: '粕穫',                        km: 22.19 },
  M824: { n: 'Komayunden-Dōnmus Kōwen',   k: '冬允殿-動物公園',             km: 23.69 },
};

/* Ordine canonico geografico: nord (M801) → sud (M824) */
const M8_CANONICAL_ORDER = [
  'M801','M802','M803','M804','M805','M806','M807','M808',
  'M809','M810','M811','M812','M813','M814','M815','M816',
  'M817','M818','M819','M820','M821','M822','M823','M824',
];

/* ================================================================
   HEADWAY & TIMETABLE
   firstDep / lastDep = orario di partenza DAL CAPOLINEA (entrambe le dir.)
   headwayMin = frequenza in minuti
================================================================ */
const M8_HEADWAY = {
  A: { firstDep: '05:32', lastDep: '24:05', headwayMin:  7 },
  B: { firstDep: '05:38', lastDep: '23:58', headwayMin: 10 },
  C: { firstDep: '07:35', lastDep: '21:45', headwayMin: 14 },
};

/* ================================================================
   SERVICES
   A  All-stop     : tutte e 24 le stazioni metro M801→M824
   B  Ibaches Thru : M801→M817 su binari M8, poi Ibaches da M818 (IB002)
   C  Rapido       : IR through → 11 fermate M8 → Ibaches da M818 (IB002)
================================================================ */
const M8_SVC = {

  /* ── A · All-stop ───────────────────────────────────────────── */
  A: {
    svcId:   'A',
    name:    'All-Stop',
    nameJa:  '各駅停車',
    stops:   M8_CANONICAL_ORDER,
    operatorThru: [
      { operator: 'IR Izarail', code: 'IR', from: null,   to: 'M801' },
      { operator: 'Metro M8',   code: 'M8', from: 'M801', to: 'M824' },
    ],
    headway: M8_HEADWAY.A,
    note: 'Ferma a tutte le 24 stazioni M801–M824. Through IR Izarail a nord.',
  },

  /* ── B · Ibaches Through ───────────────────────────────────── */
  B: {
    svcId:   'B',
    name:    'Ibaches Through',
    nameJa:  '磯白鉄道直通',
    stops: [
      'M801','M802','M803','M804','M805','M806','M807','M808',
      'M809','M810','M811','M812','M813','M814','M815','M816',
      'M817',
      // M818 (IB002) → Ibaches Railway (stazioni successive TBD)
    ],
    operatorThru: [
      { operator: 'IR Izarail',      code: 'IR', from: null,   to: 'M801' },
      { operator: 'Metro M8',        code: 'M8', from: 'M801', to: 'M817' },
      { operator: 'Ibaches Railway', code: 'IB', from: 'M818', to: null   },
    ],
    branchAt: 'M818',
    headway: M8_HEADWAY.B,
    note: 'Ferma a M801–M817 su binari M8, poi entra su rete Ibaches da M818 (IB002). '
        + 'Nessun cambio fisico di treno. Non serve M819–M824.',
  },

  /* ── C · Rapido ───────────────────────────────────────────── */
  C: {
    svcId:   'C',
    name:    'Rapido',
    nameJa:  '急行',
    stops: [
      'M801','M803','M805','M806','M808','M809',
      'M812','M814','M815','M817','M818',
      // M818 (IB002) → Ibaches Railway (stazioni successive TBD)
    ],
    operatorThru: [
      { operator: 'IR Izarail',      code: 'IR', from: null,   to: 'M801' },
      { operator: 'Metro M8',        code: 'M8', from: 'M801', to: 'M817' },
      { operator: 'Ibaches Railway', code: 'IB', from: 'M818', to: null   },
    ],
    branchAt: 'M818',
    headway: M8_HEADWAY.C,
    note: 'Rapido IR/Ibaches · 11 fermate sulla sezione M8. '
        + 'Salta: M802, M804, M807, M810, M811, M813, M816. '
        + 'Non serve M819–M824.',
    skippedStops: ['M802','M804','M807','M810','M811','M813','M816'],
  },
};

/* ================================================================
   PASSING LOOPS & OVERTAKE TRACKS (binari di precedenza)
   ================================================================
   Il Servizio C (Rapido) sorpassa i Servizi A/B nelle stazioni
   dove questi si fermano mentre il Rapido scavalca una o più
   stazioni locali.

   Criteri di classificazione:
     'terminus'     — stazione capolinea / attestamento; 4 binari obbligatori
     'overtake'     — sorpasso Rapido su Locale; binario di sosta laterale
     'branch'       — biforcazione fisica binari (due linee divergono)
     'operational'  — necessità operativa (hub interscambio, regolazione)

   Formato:
     { station, reason, priority, svcContext, note }
     priority: 'required' | 'recommended' | 'optional'

   Analisi sorpasso (Svc C vs Svc A/B):
     Il Rapido salta queste sequenze di stazioni locali:
       [M802]           → rimonta ~35s su A/B a M803
       [M804]           → cumulativo ~70s a M805
       [M807]           → cumulativo ~105s a M808
       [M810, M811]     → cumulativo ~194s (~3.2 min) a M812  ★ salto più lungo
       [M813]           → cumulativo ~229s a M814
       [M816]           → cumulativo ~264s a M817

   Il Rapido parte ogni 14 min, il Locale ogni 7 min (A) / 10 min (B).
   Con hdw_A=7 min e il Rapido che guadagna ~4.4 min totali, il conflitto
   è reale: senza binari di precedenza il Rapido tamponerebbe il Locale
   nelle stazioni di fermata intermedia.
================================================================ */
const M8_PASSING_LOOPS = [

  /* ── CAPOLINEA ────────────────────────────────────────────── */
  {
    station:    'M801',
    reason:     'terminus',
    priority:   'required',
    svcContext: ['A', 'B', 'C'],
    note:       'Capolinea nord + boundary IR Izarail. '
              + '4 binari: 2 per attestamento IR, 2 per regolazione partenze M8. '
              + 'Tutti e 3 i servizi si originano / terminano qui.',
  },

  /* ── SORPASSI RAPIDO (C) su Locale (A/B) ───────────────────── */
  {
    station:    'M806',
    reason:     'overtake',
    priority:   'required',
    svcContext: ['A', 'B', 'C'],
    note:       'Il Rapido C ha saltato M802 e M804 (skip cumulativo ~70s). '
              + 'Il Locale A/B si ferma qui: M806 è il primo punto utile di sorpasso '
              + 'dopo il doppio skip iniziale. '
              + 'Interscambio M4 (M401): traffico elevato, giustifica i costi.',
  },
  {
    station:    'M812',
    reason:     'overtake',
    priority:   'required',
    svcContext: ['A', 'B', 'C'],
    note:       'Il Rapido C ha saltato M810 + M811 (skip doppio, ~89s — il più lungo '
              + 'della tratta). Cumulativo ~194s di vantaggio C su A/B. '
              + 'Interscambio Seishaku (SK28) + Kidai (KD34): stazione ad alta domanda. '
              + 'Sorpasso o appuntamento obbligatorio per mantenere la cadenza.',
  },
  {
    station:    'M817',
    reason:     'overtake',
    priority:   'required',
    svcContext: ['A', 'B', 'C'],
    note:       'Il Rapido C ha saltato M816 (cumulativo ~264s ≈ 4.4 min). '
              + 'Stazione di confine Ibaches (IB001): il Svc B e C divergono da qui '
              + 'verso Ibaches, il Svc A prosegue su M8. '
              + 'Binari di attestamento/regolazione obbligatori per la biforcazione operativa.',
  },

  /* ── BRANCH POINT ────────────────────────────────────────────── */
  {
    station:    'M818',
    reason:     'branch',
    priority:   'required',
    svcContext: ['A', 'B', 'C'],
    note:       'Punto di biforcazione fisica: binari M8 (Svc A → M819–M824) '
              + 'divergono dai binari Ibaches (Svc B/C → IB002+). '
              + '4 binari obbligatori: 2 per M8 sud, 2 per Ibaches. '
              + 'Senza questo nodo, la biforcazione è fisicamente impossibile.',
  },

  /* ── CAPOLINEA SUD (solo Svc A) ──────────────────────────── */
  {
    station:    'M824',
    reason:     'terminus',
    priority:   'required',
    svcContext: ['A'],
    note:       'Capolinea sud esclusivo del Svc A. '
              + '2 binari di attestamento. '
              + 'I Svc B/C non raggiungono questa stazione.',
  },

  /* ── HUB OPERATIVO CONSIGLIATO ────────────────────────────── */
  {
    station:    'M814',
    reason:     'operational',
    priority:   'recommended',
    svcContext: ['A', 'B', 'C'],
    note:       'Hub principale (Sainðaul Central): IZX KE/RY/EI + AX + Loop + Kidai + Seishaku. '
              + 'Binari di regolazione raccomandati per gestione ritardi e turn-around. '
              + 'Il Rapido C accumula ~229s di vantaggio qui: '
              + 'opportunità di appuntamento con il Locale in attesa.',
  },

  /* ── OPZIONALE / DA VALUTARE ─────────────────────────────── */
  {
    station:    'M809',
    reason:     'overtake',
    priority:   'optional',
    svcContext: ['A', 'B', 'C'],
    note:       'Skip singolo M807: guadagno C su A/B ~35s cumulativo ~105s. '
              + 'Con hdw_A=7 min il conflitto è marginale; '
              + 'binario di sorpasso opzionale se il traffic model lo richiede.',
  },
];

/* ================================================================
   METADATI LINEA
================================================================ */
const M8_META = {
  id:     'M8',
  code:   'M8',
  name:   'Sainðaul Urban Line',
  nameJa: '作安崎都市線',
  color:  '#00A2D3',

  services: ['A', 'B', 'C'],

  thruServices: [
    {
      direction:       'north',
      operator:        'IR Izarail',
      operatorCode:    'IR',
      boundaryStation: 'M801',
      usedBy:          ['A', 'B', 'C'],
      note:            'IR trains run through onto M8 tracks north of M801',
    },
    {
      direction:     'south-east',
      operator:      'Ibaches Railway',
      operatorCode:  'IB',
      sharedStation: 'M817',
      branchStation: 'M818',
      usedBy:        ['B', 'C'],
      note:          'Ibaches Railway shares M817 (IB001); branch diverges at M818 (IB002)',
    },
  ],

  /*
   *  IR Izarail
   *       ↓
   *  M801 ─────────────────────────────── M817 (IB001 Anagusa Mukai)
   *                                              │
   *                          ┌───────────────────┴───────────────────────┐
   *                Svc A     │ (metro puro)          Svc B + C (Ibaches) │
   *               M818 ──► M824                 M818 (IB002) → Ibaches Rwy
   *
   *  M817: servita da Svc A, B, C
   *  M818: Svc A = stazione metro normale; Svc B/C = IB002, accesso Ibaches
   */
};

/* ================================================================
   INTERSCAMBI
================================================================ */
const M8_INTERCHANGE = {

  M803: [
    { code: 'M201', network: 'metro',    transferMin: 3,
      note: 'M2 Gawinosechi — stesso nome' },
  ],

  M806: [
    { code: 'M401', network: 'metro',    transferMin: 3,
      note: 'M4 Heinomoji — stesso nome, banchine separate' },
     { code: 'M206', network: 'metro', transferMin: 5,
    note: 'M2 Heinomoji — stesso nome, banchine separate' },
  ],

  M810: [
    { code: 'SK30', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Shiki-Tsutomaku' },
  ],

  M811: [
    { code: 'SK29', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Chestō Toshi' },
  ],

  M812: [
    { code: 'SK28', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Nashikoma' },
    { code: 'KD34', network: 'suburban', transferMin: 3,
      note: 'Kidai Line — Nashikoma' },
  ],

  M814: [
    { code: 'LL01', network: 'suburban', transferMin: 3,  note: 'Loop Line — Sainðaul Central' },
    { code: 'KD32', network: 'suburban', transferMin: 3,  note: 'Kidai Line — Sainðaul Central' },
    { code: 'SK26', network: 'suburban', transferMin: 3,  note: 'Seishaku Line — Sainðaul Central' },
    { code: 'K01',  network: 'izx',      transferMin: 5,  note: 'IZX Keishin — Sainðaul Central' },
    { code: 'R01',  network: 'izx',      transferMin: 5,  note: 'IZX Ryānkai — Sainðaul Central' },
    { code: 'E01',  network: 'izx',      transferMin: 5,  note: 'IZX Eira — Sainðaul Central' },
    { code: 'AX06', network: 'ax',       transferMin: 5,  note: 'Airport Express — Sainðaul Central' },
  ],

  M817: [
    { code: 'M405',  network: 'metro',    transferMin: 3,
      note: 'M4 Anagusa Mukai — banchine separate' },
    { code: 'KD30',  network: 'suburban', transferMin: 3,
      note: 'Kidai Line — uscita condivisa' },
    { code: 'IB001', network: 'ibaches',  transferMin: 0,
      note: 'Ibaches Railway IB001 — through Svc B/C: nessun cambio treno' },
  ],

  M818: [
    { code: 'IB002', network: 'ibaches',  transferMin: 0,
      note: 'Ibaches Railway IB002 — branching point Svc B/C' },
  ],

  M820: [
    { code: 'LL05', network: 'suburban', transferMin: 3,
      note: 'Loop Line — Jufurai Kōwen Niji 朱布来公園西' },
  ],

  M823: [
    { code: 'SK20', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Oizato 粕穫' },
  ],

  M824: [
    // M3?? (futura), M10?? (futura)
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M8_META, M8_ST, M8_CANONICAL_ORDER, M8_SVC, M8_HEADWAY, M8_PASSING_LOOPS, M8_INTERCHANGE };
}

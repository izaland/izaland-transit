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
   Formato headway:
     { firstDep: "HH:MM", lastDep: "HH:MM", headwayMin: N }
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
   A  All-stop     : copre tutte e 24 le stazioni metro M801→M824
   B  Ibaches Thru : M801→M817 (su binari M8), poi entra su Ibaches Railway
                     branching a M818 (IB002) — non ferma a M819–M824
   C  Rapido       : proviene da IR Izarail prima di M801,
                     ferma alle stazioni selezionate, poi entra su Ibaches
                     branching a M818 (IB002)

   Struttura campos:
     svcId       : identificatore
     name        : nome del servizio
     nameJa      : nome in giapponese/kanji
     stops       : array di codici stazione IN ORDINE geografico (solo le fermate)
                   Per Svc B/C: le stazioni M8 fino al branch; le stazioni Ibaches
                   successive sono definite nell'ibaches-data (TBD)
     operatorThru: array di segmenti operatore nella direzione nord→sud
                   { operator, code, from, to }
                   null = boundary esterno alla rete M8
     headway     : riferimento all'entry in M8_HEADWAY
     note        : note operative
================================================================ */
const M8_SVC = {

  /* ── A · All-stop ─────────────────────────────────────────────
   *  Copre tutte e 24 le stazioni.
   *  Proviene da IR Izarail (north of M801).
   *  Non entra sulla rete Ibaches: termina a M824.
   *  05:32 → 24:05  ogni 7 min
   * ──────────────────────────────────────────────────────────── */
  A: {
    svcId:   'A',
    name:    'All-Stop',
    nameJa:  '各駅停車',
    stops:   M8_CANONICAL_ORDER,  // M801 → M824, tutte le stazioni
    operatorThru: [
      { operator: 'IR Izarail', code: 'IR', from: null,   to: 'M801' },
      { operator: 'Metro M8',   code: 'M8', from: 'M801', to: 'M824' },
    ],
    headway: M8_HEADWAY.A,
    note: 'Ferma a tutte le 24 stazioni M801–M824. Through IR Izarail a nord.',
  },

  /* ── B · Ibaches Through ──────────────────────────────────────
   *  Copre M801→M817 su binari M8, poi diverge sulla rete Ibaches.
   *  M817 (IB001 Anagusa Mukai): ultima fermata su binari M8 condivisi.
   *  M818 (IB002 Jufurai): punto di biforcazione — i treni del Svc B
   *    entrano sulla rete Ibaches Railway senza cambio fisico.
   *  Non ferma a M819–M824.
   *  Proviene da IR Izarail (north of M801).
   *  05:38 → 23:58  ogni 10 min
   * ──────────────────────────────────────────────────────────── */
  B: {
    svcId:   'B',
    name:    'Ibaches Through',
    nameJa:  '磯白鉄道直通',
    stops: [
      'M801','M802','M803','M804','M805','M806','M807','M808',
      'M809','M810','M811','M812','M813','M814','M815','M816',
      'M817',
      // M818 (IB002) è il primo stop sulla rete Ibaches; stazioni successive TBD
    ],
    operatorThru: [
      { operator: 'IR Izarail',      code: 'IR', from: null,   to: 'M801' },
      { operator: 'Metro M8',        code: 'M8', from: 'M801', to: 'M817' },
      { operator: 'Ibaches Railway', code: 'IB', from: 'M818', to: null   },
    ],
    branchAt: 'M818',   // codice stazione M8 dove avviene la biforcazione
    headway: M8_HEADWAY.B,
    note: 'Ferma a M801–M817 su binari M8, poi entra su rete Ibaches da M818 (IB002). '
        + 'Nessun cambio fisico di treno. Non serve M819–M824.',
  },

  /* ── C · Rapido ───────────────────────────────────────────────
   *  Servizio rapido che proviene dalla linea IR prima di M801.
   *  Salta le stazioni locali sulla tratta M8.
   *  Poi entra su Ibaches Railway da M818 (IB002), come il Svc B.
   *  11 fermate sulla sezione M8: M801, M803, M805, M806, M808,
   *    M809, M812, M814, M815, M817, M818.
   *  07:35 → 21:45  ogni 14 min
   * ──────────────────────────────────────────────────────────── */
  C: {
    svcId:   'C',
    name:    'Rapido',
    nameJa:  '急行',
    stops: [
      'M801',
             'M803',
                    'M805','M806',
                                  'M808','M809',
                                                'M812',
                                                       'M814','M815',
                                                                     'M817','M818',
      // M818 (IB002) → Ibaches Railway (stazioni successive TBD)
    ],
    operatorThru: [
      { operator: 'IR Izarail',      code: 'IR', from: null,   to: 'M801' },
      { operator: 'Metro M8',        code: 'M8', from: 'M801', to: 'M817' },
      { operator: 'Ibaches Railway', code: 'IB', from: 'M818', to: null   },
    ],
    branchAt: 'M818',
    headway: M8_HEADWAY.C,
    note: 'Rapido IR/Ibaches. Salta: M802, M804, M807, M810, M811, M813, M816. '
        + 'Non serve M819–M824. Through da IR a nord, Ibaches a sud da M818.',
    skippedStops: ['M802','M804','M807','M810','M811','M813','M816'],
  },
};

/* ================================================================
   METADATI LINEA
================================================================ */
const M8_META = {
  id:     'M8',
  code:   'M8',
  name:   'Sainðaul Urban Line',
  nameJa: '作安崎都市線',
  color:  null, // TODO: assegnare colore linea

  /* ── Servizi attivi ──────────────────────────────────────────── */
  services: ['A', 'B', 'C'],

  /* ── Through (相互直通) operators ──────────────────────────── */
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
      sharedStation: 'M817',   // IB001 Anagusa Mukai — shared stop
      branchStation: 'M818',   // IB002 Jufurai — diverge point
      usedBy:        ['B', 'C'],
      note:          'Ibaches Railway shares M817 (IB001); branch diverges at M818 (IB002)',
    },
  ],

  /*
   *  Diagramma biforcazione:
   *
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
  ],

  M810: [
    { code: 'SK30', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Shiki-Tsutomaku, stesso nome' },
  ],

  M811: [
    { code: 'SK29', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Chestō Toshi, stesso nome' },
  ],

  M812: [
    { code: 'SK28', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Nashikoma, stesso nome' },
    { code: 'KD34', network: 'suburban', transferMin: 3,
      note: 'Kidai Line — Nashikoma, stesso nome' },
  ],

  M814: [
    { code: 'LL01', network: 'suburban', transferMin: 3,
      note: 'Loop Line — Sainðaul Central' },
    { code: 'KD32', network: 'suburban', transferMin: 3,
      note: 'Kidai Line — Sainðaul Central' },
    { code: 'SK26', network: 'suburban', transferMin: 3,
      note: 'Seishaku Line — Sainðaul Central' },
    { code: 'K01',  network: 'izx',      transferMin: 5,
      note: 'IZX Keishin — Sainðaul Central' },
    { code: 'R01',  network: 'izx',      transferMin: 5,
      note: 'IZX Ryānkai — Sainðaul Central' },
    { code: 'E01',  network: 'izx',      transferMin: 5,
      note: 'IZX Eira — Sainðaul Central' },
    { code: 'AX06', network: 'ax',       transferMin: 5,
      note: 'Airport Express — Sainðaul Central' },
  ],

  M817: [
    { code: 'M405',  network: 'metro',    transferMin: 3,
      note: 'M4 Anagusa Mukai — stesso nome, banchine separate' },
    { code: 'KD30',  network: 'suburban', transferMin: 3,
      note: 'Kidai Line — Anagusa Mukai, uscita condivisa' },
    { code: 'IB001', network: 'ibaches',  transferMin: 0,
      note: 'Ibaches Railway IB001 — stesso edificio; through Svc B/C: nessun cambio treno' },
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
  module.exports = { M8_META, M8_ST, M8_CANONICAL_ORDER, M8_SVC, M8_HEADWAY, M8_INTERCHANGE };
}

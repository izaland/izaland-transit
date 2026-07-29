/* ================================================================
   TS-DATA.JS — Tandan-Senpyan Line · 丹淡船駢線
   ================================================================
   Linea: Tandan-Senpyan · 丹淡船駢線 · #F5EE27 · id: TS

   Struttura:
     Ramo principale: AI01 Aikami Eigau → TS24/AI04 Moto-Aikami
                      → TS10 Nekunno → ... → TS20 Shutazai
     Tratto condiviso KW (binari KW Rapid):
                      TS01/KW32 Yamakoga → TS09/KW04 Semukudai
     Il tratto TS01–TS09 usa i codici KW nel router (thru-service).
     I treni TS entrano sulla sezione KW a TS09/KW04 (da Sainðaul)
     ed escono a TS01/KW32 (Yamakoga), o viceversa.

   Capilinea:
     A:  AI01 Aikami Eigau
     B:  TS20 Shutazai
   Capolinea secondario (rinforzi):
     TS07/KW10 Kawayatsu

   Servizi:
     T1  Completo     AI01 → TS20   ogni 20 min  07:00–22:30 (da TS20)
                                                  05:30–21:45 (da AI01)
     T2  Rinforzo     TS20 → TS07   ogni 40 min  07:20–21:00 (da TS20)
         (= ogni 40 min alternati con T1 → headway effettivo 20 min TS20↔TS07)

   Thru-service / binari condivisi KW:
     TS01 = KW32 Yamakoga       ↔ KW32
     TS02 = KW29 Abiro          ↔ KW29
     TS03 = KW22 Funoshoni      ↔ KW22
     TS04 = KW18 Nwatanui       ↔ KW18
     TS05 = KW17 Ibarosu        ↔ KW17
     TS06 = KW11 Niji-Kawayatsu ↔ KW11
     TS07 = KW10 Kawayatsu      ↔ KW10, E02
     TS08 = KW06 Agasuri-ko Ugutsumasa ↔ KW06
     TS09 = KW04 Semukudai      ↔ KW04
     Nota: su questo tratto TS+KW Rapid = 10 min cadenzati.
           I treni TS sono sfasati di +10 min rispetto a KW W3.

   Node ID (per compatibilità future con DB esterno):
     vedere colonna nodeId nei dati stazioni.

   km: distanza progressiva da AI01 (km 0.00).
      Le stazioni TS01–TS09 hanno km calcolati dalla progressiva
      reale KW scalata all'ingresso TS09 (km 0.00 da Semukudai).
      Per linearità del router, la progressiva è continua AI01→TS20.
================================================================ */
'use strict';

/* ================================================================
   TS_INTERCHANGE
   Mappa codice TS → array codici su altre reti
   (solo stazioni TS10–TS24 e ramo AI; TS01–TS09 si usa SUBURBAN_INTERCHANGE
   con i codici KW equivalenti, già registrati in suburban-data.js)
================================================================ */
const TS_INTERCHANGE = {
  TS07: ['KW10', 'E02'],              // Kawayatsu  ↔ KW10, IZX Eira
  TS12: ['LL02', 'SK25'],             // Binno       ↔ Loop Line, Seishaku
  TS13: ['LL01', 'SK26', 'M814',
         'K01',  'R01',  'E01', 'AX06'], // Sainðaul Central ↔ tutto
  TS14: ['SK33', 'M417', 'M203'],     // Shimamera   ↔ SK33, M4 Shimamera, M2 (7 min walk)
  TS15: ['SK34', 'M418'],             // Nihkyonta   ↔ SK34, M4
  TS16: ['SK35', 'M419', 'AX04'],    // Kasakuri    ↔ SK35, M4, AX
  TS18: ['M425'],                     // Ipporai-Senpyan ↔ M4 capolinea ovest
};

/* ================================================================
   SUBURBAN_LINES entry — verrà aggiunta a SUBURBAN_LINES['TS']
   Nota: le stazioni TS01–TS09 compaiono con i loro codici TS
   ma il router SuburbanRouter le risolve come alias KW tramite
   il campo kwAlias (vedere ts-tt.js).
   Per ora le inseriamo con codice TS per completezza topografica;
   il tratto condiviso viene gestito come thru-service nel TT.
================================================================ */

/* Stazioni del ramo AI (Aikami Eigau → Moto-Aikami/TS24) */
const TS_AI_STATIONS = [
  { code: 'AI01', name: 'Aikami Eigau',          kanji: '—',          nodeId: 1246276630, km:  0.00 },
  { code: 'AI02', name: 'Tomahashi',             kanji: '—',          nodeId: 1246276641, km:  1.73 },
  { code: 'AI03', name: 'Kukaðuka',              kanji: '—',          nodeId: 1246276651, km:  2.81 },
  { code: 'AI04', name: 'Moto-Aikami',           kanji: '—',          nodeId: 1246276661, km:  4.01 },
  // AI04 = TS24: punto di confluenza sul tronco principale
];

/* Stazioni tronco principale TS10–TS20 (escludendo sezione KW) */
/* km: progressiva da AI01, misurando AI01→AI04→TS10→…→TS20 */
const TS_MAIN_STATIONS = [
  /* ── Ramo AI confluisce qui ── */
  { code: 'TS24', name: 'Moto-Aikami',           kanji: '—',          nodeId: 1246276661, km:  4.01 },
  { code: 'TS10', name: 'Nekunno',               kanji: '牒ᐢ見',      nodeId: 324188925,  km:  5.52 },
  { code: 'TS11', name: 'Kiikudai-adae',         kanji: '熈育大前',   nodeId: 169590630,  km:  8.37 },
  { code: 'TS12', name: 'Binno',                 kanji: '苠喃',       nodeId: 229656493,  km: 10.97 },
  { code: 'TS13', name: 'Sainðaul Central',      kanji: '作安崎中央', nodeId: 229656494,  km: 12.79 },
  { code: 'TS14', name: 'Shimamera',             kanji: '渠瀬田',     nodeId: 368583227,  km: 21.59 },
  { code: 'TS15', name: 'Nihkyonta',             kanji: '濱角',       nodeId: 368583226,  km: 23.38 },
  { code: 'TS16', name: 'Kasakuri',              kanji: '鯛巻',       nodeId: 127914807,  km: 27.28 },
  { code: 'TS17', name: 'Rismyonjen',            kanji: '—',          nodeId: 136187246,  km: 33.17 },
  { code: 'TS18', name: 'Ipporai-Senpyan',       kanji: '一蒲崍船駢', nodeId: 123393772,  km: 36.82,
    note: '〈Stock Exchange - 證券去來所前〉' },
  { code: 'TS19', name: 'Eigandan Senpyan',      kanji: '永玵段船駢', nodeId: 123393771,  km: 39.52 },
  { code: 'TS20', name: 'Shutazai',              kanji: '守多彩',     nodeId: 136187238,  km: 43.57 },
];

/* Stazioni tratto condiviso KW (TS09→TS01, direzione Yamakoga) */
/* km: progressiva da AI01, continua da TS09 */
const TS_KW_STATIONS = [
  /* TS09 = KW04 */ { code: 'TS09', kwAlias: 'KW04', name: 'Semukudai',             kanji: '世牧臺',      nodeId: 184979831, km: 17.40 },
  /* TS08 = KW06 */ { code: 'TS08', kwAlias: 'KW06', name: 'Agasuri-ko Ugutsumasa', kanji: '蛞珠利湖・茨察', nodeId: 124627634, km: 22.60 },
  /* TS07 = KW10 */ { code: 'TS07', kwAlias: 'KW10', name: 'Kawayatsu',             kanji: '嘉夬苫',      nodeId: 124627624, km: 24.88 },
  /* TS06 = KW11 */ { code: 'TS06', kwAlias: 'KW11', name: 'Niji-Kawayatsu',        kanji: '西嘉夬苫',    nodeId: 128583434, km: 27.16 },
  /* TS05 = KW17 */ { code: 'TS05', kwAlias: 'KW17', name: 'Ibarosu',               kanji: '歯舢',        nodeId: 124627625, km: 38.41 },
  /* TS04 = KW18 */ { code: 'TS04', kwAlias: 'KW18', name: 'Nwatanui',              kanji: '—',           nodeId: 128977484, km: 40.23 },
  /* TS03 = KW22 */ { code: 'TS03', kwAlias: 'KW22', name: 'Funoshoni',             kanji: '—',           nodeId: 124627626, km: 49.87 },
  /* TS02 = KW29 */ { code: 'TS02', kwAlias: 'KW29', name: 'Abiro',                 kanji: '獏路',        nodeId: 124627632, km: 75.56 },
  /* TS01 = KW32 */ { code: 'TS01', kwAlias: 'KW32', name: 'Yamakoga',              kanji: '倉湖加',      nodeId: 124627622, km: 90.91 },
  /* TS23 */        { code: 'TS23', name: 'Yuriyama',              kanji: '油里倉',      nodeId: 325888089, km: 92.54 },
  /* TS22 */        { code: 'TS22', name: 'Sāryarasa',             kanji: '河霧',        nodeId: 440800252, km: 96.65 },
  /* TS21 */        { code: 'TS21', name: 'Ikotsuha',              kanji: '梧戦',        nodeId: 440800250, km: 100.37 },
];

/*
  NOTA IMPLEMENTATIVA:
  Le stazioni TS21–TS23 si trovano oltre Yamakoga (nord della KW).
  La progressiva km continua oltre TS01/KW32.
  Il router deve sapere che TS21–TS23 NON sono su binari KW
  (la linea TS prosegue autonomamente oltre Yamakoga verso nord).
*/

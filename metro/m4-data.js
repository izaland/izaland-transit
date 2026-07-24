/* ================================================================
   M4-DATA.JS — Metro Line 4 · Kokendake Line (古剣館線)
   ================================================================
   Est. 1937 · Through service since 1976
   Original section (M401–M415): Heinomoji → Kawaei · 15 stations
   Extended section (M416–M425): Abawauri → Ipporai-Senpyan · +10 stations
   Total: 25 stations · 32.9 km

   Thru-service:
     East  → Shinsabu Oitsura Line (beyond Kawaei, future)
     West  → shares tracks with Line 6 until Ipporai-Senpyan (since 2013)

   Codifica:
     M401–M415  sezione storica (Heinomoji → Kawaei), aperta 1937
     M416–M425  estensione ovest (Abawauri → Ipporai-Senpyan)
     I codici non seguono l'ordine geografico: M401 è al centro fisico
     della linea. L'ordine canonico è geografico ovest → est.

   Nota km:
     Distanze progressive da Ipporai-Senpyan (km 0.0).
     Intervallo fisso Kasakuri(M419) ↔ Nihkyonta(M418) = 3.8 km.
     Intervallo medio restante ≈ 1.265 km.
================================================================ */
'use strict';

const M4_ST = {
  /* ── Estensione ovest (aggiunta) ── */
  M425: { n: 'Ipporai-Senpyan',     k: '一蒲崍船駢',   km:  0.000 },
  M424: { n: 'Ipporai-Owonideki',   k: '一蒲崍吹取',   km:  1.265 },
  M423: { n: 'Ipporai-Konegisa',    k: '一蒲崍干鮃',   km:  2.530 },
  M422: { n: 'Shiki-Hoze',          k: '北舗摧',       km:  3.795 },
  M421: { n: 'Kotoshiruna',         k: '細荒奈',       km:  5.060 },
  M420: { n: 'Buslyu Toshi',        k: '物流都市',     km:  6.325 },
  M419: { n: 'Kasakuri',            k: '鯛巻',         km:  7.590 },
  M418: { n: 'Nihkyonta',           k: '濱角',         km: 11.390 }, // +3.8 km da M419
  M417: { n: 'Shimamera',           k: '渠瀬田',       km: 12.655 },
  M416: { n: 'Abawauri',            k: '燕宦',         km: 13.920 },
  /* ── Sezione storica (1937) ── */
  M401: { n: 'Heinomoji',           k: '駕桃',         km: 15.185 },
  M402: { n: 'Ogiwata',             k: '槃芳',         km: 16.450 },
  M403: { n: 'Ekinðuka',            k: '虓鵜',         km: 17.715 },
  M404: { n: 'Aguri 2-sa',          k: '阿久里二沙',   km: 18.980 },
  M405: { n: 'Anagusa Mukai',       k: '矢模武凱',     km: 20.245 },
  M406: { n: 'Kushidaru Amiya',     k: '柚艏',         km: 21.510 },
  M407: { n: 'Tamainoki',           k: '谷伊坂',       km: 22.775 },
  M408: { n: 'Tamainoki Kokendake', k: '谷伊坂古剣館', km: 24.040 },
  M409: { n: 'Sumi-Kokendake',      k: '隠古剣館',     km: 25.305 },
  M410: { n: 'Sojo-Kokendake',      k: '',             km: 26.570 },
  M411: { n: 'Nuskaitsa',           k: '',             km: 27.835 },
  M412: { n: 'Juhtasamo',           k: '',             km: 29.100 },
  M413: { n: 'Ristai-Nyūngu',       k: '立大入口',     km: 30.365 },
  M414: { n: 'Niji-Kawaei',         k: '西珂夬栄',     km: 31.630 },
  M415: { n: 'Kawaei',              k: '珂夬栄',       km: 32.895 },
};

/* Ordine canonico geografico: ovest (Ipporai-Senpyan) → est (Kawaei) */
const M4_CANONICAL_ORDER = [
  'M425', 'M424', 'M423', 'M422', 'M421', 'M420',
  'M419', 'M418', 'M417', 'M416',
  'M401', 'M402', 'M403', 'M404', 'M405', 'M406', 'M407', 'M408',
  'M409', 'M410', 'M411', 'M412', 'M413', 'M414', 'M415',
];

/* ----------------------------------------------------------------
   Metadati linea
---------------------------------------------------------------- */
const M4_META = {
  id:           'M4',
  code:         'M4',
  name:         'Kokendake Line',
  nameJa:       '古剣館線',
  color:        '#FFEF00',   // giallo canarino
  established:  1937,
  thruSince:    1976,
  totalKm:      32.895,
  avgSpeedKmh:  30,          // usato da MetroRouter per generare TT runtime
  dwellSec:     30,          // sosta per fermata (secondi)
  /* Sezione storica */
  originalSection: { from: 'M401', to: 'M415', stations: 15 },
  /* Thru-service */
  thruEast: { operator: 'Shinsabu Oitsura Line', boardingNode: 'M415' }, // futuro
  thruWest: { sharedWith: 'Line 6', from: 'M425', since: 2013 },
};

/* ----------------------------------------------------------------
   Profilo frequenze operative (headway in minuti)
   Valido per entrambe le direzioni su tutta la linea.

   Slot        Da      A       Headway
   ─────────── ─────── ─────── ───────
   early       05:00   06:30   10 min
   pre-peak    06:30   07:00    5 min
   peak AM     07:00   09:30    2 min
   off-peak    09:30   17:00    4 min
   peak PM     17:00   20:00    2 min
   evening     20:00   22:30    5 min
   late        22:30   24:30   10 min
---------------------------------------------------------------- */
const M4_HEADWAY = [
  { from: '05:00', to: '06:30', headwayMin: 10 },
  { from: '06:30', to: '07:00', headwayMin:  5 },
  { from: '07:00', to: '09:30', headwayMin:  2 },
  { from: '09:30', to: '17:00', headwayMin:  4 },
  { from: '17:00', to: '20:00', headwayMin:  2 },
  { from: '20:00', to: '22:30', headwayMin:  5 },
  { from: '22:30', to: '24:30', headwayMin: 10 },
];

/* ----------------------------------------------------------------
   Servizi
   A  Rapid (fermate selezionate) — introdotto 1998
   B  All-stop
   Timetable reali (M4_TT) da aggiungere in fase successiva.
---------------------------------------------------------------- */
const M4_SVC = {
  A: {
    name:   'Rapid',
    nameJa: '急行',
    color:  '#FFEF00',
    cls:    'svc-A',
    stops: [
      'M425','M421','M419','M418','M416',
      'M401','M403','M405','M407','M409','M411','M413','M415',
    ],
  },
  B: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#CCB800',
    cls:    'svc-B',
    stops:  M4_CANONICAL_ORDER,
  },
};

/* ----------------------------------------------------------------
   Interscambi Metro Line 4 ↔ altre reti

   Ogni entry mappa il codice M4 ai nodi partner di altre reti
   (IZX, AX, Suburban). Il campo transferMin indica il tempo di
   trasferimento fisico a piedi raccomandato.

   M409 Sumi-Kokendake
     ↔ LL12 (Loop Line)       — stesso nome, banchine adiacenti  2 min

   M405 Anagusa Mukai
     ↔ KD30 (Kidai Line)      — stesso nome, uscita condivisa    3 min

   M417 Shimamera
     ↔ AX05 (Airport Express) — stesso nome, piano -1 / piano 0  5 min

   M419 Kasakuri
     ↔ AX04 (Airport Express) — stesso nome, piano -1 / piano 0  5 min
     ↔ KD35 (Kidai Line)      — stesso nome, uscita est           5 min
     ↔ K02  (IZX Keishin)     — walkable 10 min (uscita nord)
---------------------------------------------------------------- */
const M4_INTERCHANGE = {
  M409: [
    { code: 'LL12', network: 'suburban', transferMin: 2,
      note: 'Loop Line — Sumi-Kokendake, banchine adiacenti' },
  ],
  M405: [
    { code: 'KD30', network: 'suburban', transferMin: 3,
      note: 'Kidai Line — Anagusa Mukai, uscita condivisa' },
  ],
  M417: [
    { code: 'AX05', network: 'ax', transferMin: 5,
      note: 'Airport Express Ramo Est — Shimamera, piano -1/0' },
  ],
  M419: [
    { code: 'AX04', network: 'ax',      transferMin: 5,
      note: 'Airport Express Ramo Est — Kasakuri, piano -1/0' },
    { code: 'KD35', network: 'suburban', transferMin: 5,
      note: 'Kidai Line — Kasakuri, uscita est' },
    { code: 'K02',  network: 'izx',      transferMin: 10,
      note: 'IZX Keishin — Niji-Sainðaul, walkable uscita nord' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M4_META, M4_ST, M4_CANONICAL_ORDER, M4_HEADWAY, M4_SVC, M4_INTERCHANGE };
}

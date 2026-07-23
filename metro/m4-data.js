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
  M407: { n: 'Tamainoki',           k: '',             km: 22.775 },
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
  id:          'M4',
  code:        'M4',
  name:        'Kokendake Line',
  nameJa:      '古剣館線',
  color:       '#B5651D',   // placeholder — da aggiornare con colore ufficiale
  established: 1937,
  thruSince:   1976,
  totalKm:     32.895,
  /* Sezione storica */
  originalSection: { from: 'M401', to: 'M415', stations: 15 },
  /* Thru-service */
  thruEast:  { operator: 'Shinsabu Oitsura Line', boardingNode: 'M415' }, // futuro
  thruWest:  { sharedWith: 'Line 6', from: 'M425', since: 2013 },
};

/* ----------------------------------------------------------------
   Servizi (placeholder — da popolare con TT reali)
   A  Rapid (fermate selezionate)   — introdotto 1998
   B  All-stop
---------------------------------------------------------------- */
const M4_SVC = {
  A: {
    name:  'Rapid',
    nameJa:'急行',
    color: '#B5651D',
    cls:   'svc-A',
    stops: [
      'M425','M421','M419','M418','M416',
      'M401','M403','M405','M407','M409','M411','M413','M415',
    ],
  },
  B: {
    name:  'All-stop',
    nameJa:'各駅停車',
    color: '#8B4513',
    cls:   'svc-B',
    stops: M4_CANONICAL_ORDER,
  },
};

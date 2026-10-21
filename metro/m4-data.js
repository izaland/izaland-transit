/* ================================================================
   M4-DATA.JS — Metro Line 4 · Kokendake Line (古剣館線)
   ================================================================
   Est. 1937 · Through service since 1976
   Original section (M401–M415): Heinomoji → Kawaei · 15 stations
   Extended section (M416–M425): Abawauri → Ipporai-Senpyan · +10 stations
   Binno (M452): inserita tra Ogiwata (M402) e Ekinðuka (M403) · +1 station
   Total: 26 stations · 33.3 km

   Thru-service:
     East  → Shinsabu Oitsura Line (beyond Kawaei, future)
     West  → shares tracks with Line 6 until Ipporai-Senpyan (since 2013)

   Regola interscambi: i nuovi collegamenti si aggiungono, quelli
   esistenti non si rimuovono.
================================================================ */
'use strict';

const M4_ST = {
  M425: { n: 'Ipporai-Senpyan',     k: '一蒲崍船駢',   km:  0.000 },
  M424: { n: 'Ipporai-Owonideki',   k: '一蒲崍吹取',   km:  1.265 },
  M423: { n: 'Ipporai-Konegisa',    k: '一蒲崍干鯃',   km:  2.530 },
  M422: { n: 'Shiki-Hoze',          k: '北舗摺',       km:  3.795 },
  M421: { n: 'Kotoshiruna',         k: '細荒奈',       km:  5.060 },
  M420: { n: 'Buslyu Toshi',        k: '物流都市',     km:  6.325 },
  M419: { n: 'Kasakuri',            k: '鯛巻',         km:  7.590 },
  M418: { n: 'Nihkyonta',           k: '澱角',         km: 11.390 },
  M417: { n: 'Shimamera',           k: '渠瀧田',       km: 12.655 },
  M416: { n: 'Abawauri',            k: '燕宦',         km: 13.920 },
  M401: { n: 'Heinomoji',           k: '駕桃',         km: 15.185 },
  M402: { n: 'Ogiwata',             k: '槃芳',         km: 16.450 },
  M452: { n: 'Binno',               k: '芠喃',         km: 17.368 },
  M403: { n: 'Ekinðuka',            k: '虓鵜',         km: 18.163 },
  M404: { n: 'Aguri 2-sa',          k: '阿久里二沙',   km: 19.428 },
  M405: { n: 'Anagusa Mukai',       k: '矢模武凯',     km: 20.693 },
  M406: { n: 'Kushidaru Amiya',     k: '柚賸',         km: 21.958 },
  M407: { n: 'Tamainoki',           k: '谷伊坂',       km: 23.223 },
  M408: { n: 'Tamainoki Kokendake', k: '谷伊坂古剣館', km: 24.488 },
  M409: { n: 'Sumi-Kokendake',      k: '隠古剣館',     km: 25.753 },
  M410: { n: 'Sojo-Kokendake',      k: '',             km: 27.018 },
  M411: { n: 'Nuskaitsa',           k: '',             km: 28.283 },
  M412: { n: 'Juhtasamo',           k: '',             km: 29.548 },
  M413: { n: 'Ristai-Nyūngu',       k: '立大入口',     km: 30.813 },
  M414: { n: 'Niji-Kawaei',         k: '西珂夬栄',     km: 32.078 },
  M415: { n: 'Kawaei',              k: '珂夬栄',       km: 33.343 },
};

const M4_CANONICAL_ORDER = [
  'M425', 'M424', 'M423', 'M422', 'M421', 'M420',
  'M419', 'M418', 'M417', 'M416',
  'M401', 'M402', 'M452', 'M403', 'M404', 'M405', 'M406', 'M407', 'M408',
  'M409', 'M410', 'M411', 'M412', 'M413', 'M414', 'M415',
];

const M4_META = {
  id: 'M4', code: 'M4', name: 'Kokendake Line', nameJa: '古剣館線',
  color: '#FFEF00', established: 1937, thruSince: 1976,
  totalKm: 33.343, avgSpeedKmh: 30, dwellSec: 30,
  originalSection: { from: 'M401', to: 'M415', stations: 16 },
  thruEast: { operator: 'Shinsabu Oitsura Line', boardingNode: 'M415' },
  thruWest: { sharedWith: 'Line 6', from: 'M425', since: 2013 },
};

const M4_HEADWAY = [
  { from: '05:00', to: '06:30', headwayMin: 10 },
  { from: '06:30', to: '07:00', headwayMin:  5 },
  { from: '07:00', to: '09:30', headwayMin:  2 },
  { from: '09:30', to: '17:00', headwayMin:  4 },
  { from: '17:00', to: '20:00', headwayMin:  2 },
  { from: '20:00', to: '22:30', headwayMin:  5 },
  { from: '22:30', to: '24:30', headwayMin: 10 },
];

const M4_SVC = {
  A: {
    name: 'Rapid', nameJa: '急行', color: '#FFEF00', cls: 'svc-A',
    stops: ['M425','M421','M419','M418','M416','M401','M403','M405','M407','M409','M411','M413','M415'],
  },
  B: { name: 'All-stop', nameJa: '各駅停車', color: '#CCB800', cls: 'svc-B', stops: M4_CANONICAL_ORDER },
};

const M4_INTERCHANGE = {
  M425: [
    { code: 'M618', network: 'metro', transferMin: 3,
      note: 'M6 Ipporai-Senpyan' },
    { code: 'TS18', network: 'suburban', transferMin: 4,
      note: 'TS Ipporai-Senpyan' },
  ],
  M424: [
    { code: 'M617', network: 'metro', transferMin: 3,
      note: 'M6 Ipporai-Owonideki' },
    { code: 'M1110', network: 'metro', transferMin: 3,
      note: 'M11 Ipporai-Owonideki' },
  ],
  M423: [
    { code: 'M616', network: 'metro', transferMin: 3,
      note: 'M6 Ipporai-Konegisa' },
    { code: 'M1621', network: 'metro', transferMin: 3,
      note: 'M16 Ipporai - Konegisa' },
  ],
  M422: [
    { code: 'M615', network: 'metro', transferMin: 3,
      note: 'M6 Shiki-Hoze' },
  ],
  M421: [
    { code: 'M614', network: 'metro', transferMin: 3,
      note: 'M6 Kotoshiruna' },
    { code: 'SK36', network: 'suburban', transferMin: 4,
      note: 'SK Kotoshiruna' },
  ],
  M420: [
    { code: 'M613', network: 'metro', transferMin: 3,
      note: 'M6 Buslyu Toshi' },
  ],
  M419: [
    { code: 'AX04', network: 'ax', transferMin: 5,
      note: 'Airport Express Ramo Est — Kasakuri, piano -1/0' },
    { code: 'KD35', network: 'suburban', transferMin: 5,
      note: 'Kidai Line — Kasakuri, uscita est' },
    { code: 'K02', network: 'izx', transferMin: 10,
      note: 'IZX Keishin — Kasakuri, walkable 10 min (uscita nord)' },
    { code: 'M612', network: 'metro', transferMin: 3,
      note: 'M6 Kasakuri' },
    { code: 'SK35', network: 'suburban', transferMin: 4,
      note: 'SK Kasakuri' },
    { code: 'TS16', network: 'suburban', transferMin: 4,
      note: 'TS Kasakuri' },
    { code: 'CK16', network: 'suburban', transferMin: 4,
      note: 'CK Kasakuri' },
  ],
  M418: [
    { code: 'M611', network: 'metro', transferMin: 3,
      note: 'M6 Nihkyonta' },
    { code: 'SK34', network: 'suburban', transferMin: 4,
      note: 'SK Nihkyonta' },
    { code: 'TS15', network: 'suburban', transferMin: 4,
      note: 'TS Nihkyonta' },
    { code: 'CK17', network: 'suburban', transferMin: 4,
      note: 'CK Nihkyonta' },
  ],
  M417: [
    { code: 'AX05', network: 'ax', transferMin: 5,
      note: 'Airport Express Ramo Est — Shimamera, piano -1/0' },
    { code: 'M203', network: 'metro', transferMin: 5,
      note: 'M2 Shimamera Shikiniswae — 300 m corridoio sotterraneo' },
    { code: 'M111', network: 'metro', transferMin: 3,
      note: 'M1 Shimamera' },
    { code: 'M610', network: 'metro', transferMin: 3,
      note: 'M6 Shimamera' },
    { code: 'SK33', network: 'suburban', transferMin: 4,
      note: 'SK Shimamera' },
    { code: 'TS14', network: 'suburban', transferMin: 4,
      note: 'TS Shimamera' },
  ],
  M401: [
    { code: 'M206', network: 'metro', transferMin: 4,
      note: 'M2 Heinomoji — stesso nome, banchine separate' },
    { code: 'M806', network: 'metro', transferMin: 2,
      note: 'M8 Heinomoji — stesso nome, banchine separate' },
  ],
  M402: [
    { code: 'M207', network: 'metro', transferMin: 3,
      note: 'M2 Ogiwata — stesso nome, banchine separate' },
  ],
  M452: [
    { code: 'LL02', network: 'suburban', transferMin: 3,
      note: 'Loop Line — Binno (tempo di cambio da confermare)' },
    { code: 'SK25', network: 'suburban', transferMin: 4,
      note: 'SK Binno' },
    { code: 'TS12', network: 'suburban', transferMin: 4,
      note: 'TS Binno' },
  ],
  M403: [
    { code: 'M323', network: 'metro', transferMin: 3,
      note: 'M3 Ekinðuka — stesso nome, banchine separate' },
  ],
  M405: [
    { code: 'KD30', network: 'suburban', transferMin: 5,
      note: 'Kidai Line — Anagusa Mukai, uscita condivisa' },
    { code: 'M817', network: 'metro', transferMin: 3,
      note: 'M8 Anagusa Mukai — banchine separate' },
    { code: 'JD03', network: 'suburban', transferMin: 4,
      note: 'Jōdai Line — Anagusa Mukai, stesso nome (node 176670159)' },
  ],
  M406: [
    { code: 'M210', network: 'metro', transferMin: 3,
      note: 'M2 Kushidaru Amiya — stesso nome, banchine separate' },
    { code: 'M119', network: 'metro', transferMin: 3,
      note: 'M1 Kushidaru Amiya — stesso nome, banchine separate' },
  ],
  M409: [
    { code: 'LL12', network: 'suburban', transferMin: 2,
      note: 'Loop Line — Sumi-Kokendake, banchine adiacenti' },
  ],
  M415: [
    { code: 'M230', network: 'metro', transferMin: 3,
      note: 'M2 Kawaei (Ramo B) — stesso nome, banchine separate' },
    { code: 'SHX07', network: 'suburban', transferMin: 7,
      note: 'SHX07 Kawaei — 7 min transfer' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M4_META, M4_ST, M4_CANONICAL_ORDER, M4_HEADWAY, M4_SVC, M4_INTERCHANGE };
}

/* ================================================================
   M13-DATA.JS — Metro Line 13  (SOLO DATI — timetable m13-tt.js da definire)
   ================================================================
   Colore: #36873c

   Stazioni: M1301–M1324 (24) + 5 stazioni KSM (da definire, v. sotto)
   Distanze progressive da M1301 SAIA Cargo Center (km 0.00).

   Percorso: M1301 SAIA Cargo Center → M1324 Showanul  (30.07 km)

   Sezione KSM (PROVVISORIA — da chiarire):
     KSM01–KSM04 sono elencate con distanze brevi (0 → 7.51 km): le
     distanze sembrano misurate da KSM01 e NON da M1301, quindi sono
     salvate in `kmFromKSM01` e hanno km = null. Il collegamento con
     M1324 Showanul non e' ancora definito.
     NB: nella tabella sorgente c'erano DUE righe con codice KSM02
     (Showanul Bunkwa Plaza e Kajaringa Park & Ride). Kajaringa e'
     stata salvata con codice provvisorio 'KSM02-1' (km 2.86, tra
     Bunkwa Plaza 1.48 e Shiki-Kashimochi 5.88): da confermare.
     KSM01 non ha nome ne' node ID nella tabella sorgente.

   TODO (istruzioni successive):
     - nomi/tipologia dei servizi, headway, ore di servizio
     - sezione KSM: struttura, codici definitivi, innesto su M1324
     - kanji mancanti (stringa vuota); M1301 e M1304 avevano caratteri
       corrotti nella tabella sorgente
     - transferMin reali (qui provvisori = 3)
     - aggiungere in m17-data.js l'interscambio inverso
       M1730 ↔ M1314 (M17_INTERCHANGE non lo contiene ancora)
================================================================ */
'use strict';

const M13_ST = {
  M1301: { n: 'SAIA Cargo Center',                     k: '',                  nodeId: 229660683, km:  0.00 },
  M1302: { n: 'Sainðaul Asunahama International Airport', k: '作安崎天島國際空港', nodeId: 126754752, km:  1.65 },
  M1303: { n: 'Asunahama Airport Terminal 2',          k: '天島空港第２旅客棟', nodeId: 328799085, km:  3.02 },
  M1304: { n: 'Asunahama Seagate',                     k: '',                  nodeId: 183244867, km:  4.85 },
  M1305: { n: 'Bibaisone',                             k: '尾梅幕',            nodeId: 126754751, km:  7.67 },
  M1306: { n: 'Soukagi SA',                            k: '',                  nodeId: 146814991, km:  8.50 },
  M1307: { n: 'Bunsonji',                              k: '',                  nodeId: 146814998, km:  9.45 },
  M1308: { n: 'Keiteshon Eikki',                       k: '',                  nodeId: 146814996, km: 10.79 },
  M1309: { n: 'Awatenki',                              k: '',                  nodeId: 146814995, km: 12.33 },
  M1310: { n: 'Niirado Tagawae',                       k: '',                  nodeId: 146814994, km: 13.37 },
  M1311: { n: 'Tokuhaul',                              k: '葵夏崎',            nodeId: 146814993, km: 14.59 },
  M1312: { n: 'Kiriyamoto',                            k: '那追対',            nodeId: 146814992, km: 16.01 },
  M1313: { n: 'Ashiharaguchi',                         k: '',                  nodeId: 123393786, km: 17.41 },
  M1314: { n: 'Gundari Kōwen',                         k: '裙橋公園',          nodeId: 123393486, km: 18.67 },
  M1315: { n: 'Tsuruna-Nawadae',                       k: '守那兆先',          nodeId: 180237681, km: 19.92 },
  M1316: { n: 'Otsumi-Nawadae',                        k: '南兆先',            nodeId: 123393139, km: 20.87 },
  M1317: { n: 'Karisaji',                              k: '右受',              nodeId: 123393785, km: 22.04 },
  M1318: { n: 'Tsuruna Eigandan',                      k: '守那永玵段',        nodeId: 123393784, km: 23.14 },
  M1319: { n: 'Shiittaru-Tsuruna',                     k: '',                  nodeId: 196658315, km: 24.28 },
  M1320: { n: 'Urenosomi-Tsuruna',                     k: '',                  nodeId: 146814990, km: 25.31 },
  M1321: { n: 'Sanbonzayo',                            k: '三本木',            nodeId: 196658316, km: 26.78 },
  M1322: { n: 'Tsuruna-Mistukane',                     k: '',                  nodeId: 196658314, km: 27.88 },
  M1323: { n: 'Futteskaiba',                           k: '',                  nodeId: 176789173, km: 28.82 },
  M1324: { n: 'Showanul',                              k: '書瓦崎',            nodeId: 167670124, km: 30.07 },
};

/* ----------------------------------------------------------------
   Sezione KSM (PROVVISORIA) — distanze progressive da KSM01
---------------------------------------------------------------- */
const M13_KSM_ST = {
  KSM01:      { n: 'KSM01',                    k: '',              nodeId: null,      km: null, kmFromKSM01: 0.00 },
  KSM02:      { n: 'Showanul Bunkwa Plaza',    k: '書瓦崎文化PLAZA', nodeId: 381535620, km: null, kmFromKSM01: 1.48 },
  'KSM02-1':  { n: 'Kajaringa Park & Ride',    k: '',              nodeId: 188446969, km: null, kmFromKSM01: 2.86 },
  KSM03:      { n: 'Shiki-Kashimochi',         k: '北笂桃',        nodeId: 126143725, km: null, kmFromKSM01: 5.88 },
  KSM04:      { n: 'Kashimochi',               k: '笂桃',          nodeId: 126143726, km: null, kmFromKSM01: 7.51 },
};

/* Ordine canonico geografico */
const M13_CANONICAL_MAIN = [
  'M1301','M1302','M1303','M1304','M1305','M1306','M1307','M1308','M1309','M1310',
  'M1311','M1312','M1313','M1314','M1315','M1316','M1317','M1318','M1319','M1320',
  'M1321','M1322','M1323','M1324',
];
const M13_CANONICAL_KSM = ['KSM01','KSM02','KSM02-1','KSM03','KSM04'];

const M13_META = {
  id:          'M13',
  code:        'M13',
  name:        'Line 13',
  color:       '#36873c',
  totalKm:     30.07,               // M1301 → M1324
  totalKmA:    30.07,
  avgSpeedKmh: null,   // da definire
  dwellSec:    null,   // da definire
  ksm: { startsAt: 'KSM01', totalKmFromKSM01: 7.51, status: 'da definire' },
};

/* Placeholder: servizi e headway da definire con le prossime istruzioni */
const M13_HEADWAY = [];
const M13_SVC = {};

/* ----------------------------------------------------------------
   Interscambi Metro Line 13 ↔ altre reti
   transferMin PROVVISORIO = 3 (non fornito)
---------------------------------------------------------------- */
const _ic13 = (code, network) => ({ code, network, transferMin: 3, note: '' });
const _m13 = (c) => _ic13(c, 'metro');
const _s13 = (c) => _ic13(c, 'suburban');

const M13_INTERCHANGE = {
  M1301: [_m13('M1501')],
  M1302: [_m13('M1502'), _s13('CK02')],
  M1303: [_m13('M1503')],
  M1304: [_m13('M1504')],
  M1305: [_m13('M1505')],
  M1307: [_m13('M1506')],
  M1310: [_m13('M709')],
  M1314: [_m13('M1730')],
  M1316: [_m13('M620')],
  M1318: [_m13('M715')],
  M1320: [_m13('M1521')],
  M1321: [_m13('M726')],
  M1323: [_m13('M1118')],
  M1324: [_s13('SK43')],
};

const M13_NODE_IDS = Object.fromEntries(
  [...Object.entries(M13_ST), ...Object.entries(M13_KSM_ST)].map(([c, s]) => [c, s.nodeId])
);

if (typeof module !== 'undefined') {
  module.exports = {
    M13_META, M13_ST, M13_KSM_ST,
    M13_CANONICAL_MAIN, M13_CANONICAL_KSM,
    M13_HEADWAY, M13_SVC, M13_INTERCHANGE, M13_NODE_IDS,
  };
}

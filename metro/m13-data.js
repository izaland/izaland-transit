/* ================================================================
   M13-DATA.JS — Metro Line 13  (SOLO DATI — timetable m13-tt.js da definire)
   ================================================================
   Colore: #36873c

   Stazioni: M1301–M1324 (24) + KSM02–KSM05 (4) + KSM01 (= Showanul)
   Distanze progressive da M1301 SAIA Cargo Center (km 0.00).

   Struttura:
     M13 proper             (M1301–M1324) : SAIA Cargo Center → Showanul
     Kashimochi Railway     (KSM01–KSM05) : Showanul → Kashimochi
                                            (笂桃電鐵, third sector)

   Showanul (nodeId 167670124) e' la STAZIONE DI CONFINE:
     - lato M13           : codice M1324
     - lato Kashimochi Rw : codice KSM01
     E' la stessa stazione fisica (stesso nodeId): nessun interscambio,
     transferMin = 0 fra M1324 e KSM01.

   Kashimochi Railway e' una linea third sector che funziona
   ufficialmente come ESTENSIONE di M13, con THRU SERVICE (come la
   Midosuji di Osaka con la Kita-Osaka Kyuko). Nel journey planner va
   mostrata come prosecuzione della stessa corsa, con cambio di
   operatore a Showanul.

   Distanze: km = progressivo da M1301 (KSM01 = 30.07);
   kmFromKSM01 = progressivo dalla stazione di confine.

   TODO (istruzioni successive):
     - nomi/tipologia dei servizi, headway, ore di servizio
     - quali servizi fanno thru service e quali terminano a M1324
     - pattern di fermata, velocita', soste
     - kanji mancanti (stringa vuota); M1301 e M1304 avevano caratteri
       corrotti nella tabella sorgente
     - transferMin reali (qui provvisori = 3)
     - aggiungere in m17-data.js l'interscambio inverso
       M1730 <-> M1314 (M17_INTERCHANGE non lo contiene ancora)
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
  M1324: { n: 'Showanul',                              k: '書瓦崎',            nodeId: 167670124, km: 30.07, boundary: true, altCode: 'KSM01' },
};

/* ----------------------------------------------------------------
   Kashimochi Railway (笂桃電鐵) — third sector, estensione di M13
   KSM01 = Showanul (stessa stazione di M1324, stesso nodeId)
---------------------------------------------------------------- */
const M13_KSM_ST = {
  KSM01: { n: 'Showanul',                k: '書瓦崎',              nodeId: 167670124, km: 30.07, kmFromKSM01: 0.00, boundary: true, altCode: 'M1324' },
  KSM02: { n: 'Showanul Bunkwa Plaza',   k: '書瓦崎文化PLAZA',     nodeId: 381535620, km: 31.55, kmFromKSM01: 1.48 },
  KSM03: { n: 'Kajaringa Park & Ride',   k: '',                    nodeId: 188446969, km: 32.93, kmFromKSM01: 2.86 },
  KSM04: { n: 'Shiki-Kashimochi',        k: '北笂桃',              nodeId: 126143725, km: 35.95, kmFromKSM01: 5.88 },
  KSM05: { n: 'Kashimochi',              k: '笂桃',                nodeId: 126143726, km: 37.58, kmFromKSM01: 7.51 },
};

/* Ordine canonico geografico */
const M13_CANONICAL_MAIN = [
  'M1301','M1302','M1303','M1304','M1305','M1306','M1307','M1308','M1309','M1310',
  'M1311','M1312','M1313','M1314','M1315','M1316','M1317','M1318','M1319','M1320',
  'M1321','M1322','M1323','M1324',
];
/* KSM01 e' la stessa stazione di M1324: la rotta thru la attraversa una volta sola */
const M13_CANONICAL_KSM = ['KSM01','KSM02','KSM03','KSM04','KSM05'];
const M13_CANONICAL_THRU = [
  ...M13_CANONICAL_MAIN,
  ...M13_CANONICAL_KSM.slice(1),
];

/* Operatori */
const M13_OPERATORS = {
  M13: { name: 'Metro Line 13', kind: 'metro', stations: 'M1301–M1324' },
  KSM: { name: 'Kashimochi Railway', kanji: '笂桃電鐵', kind: 'third-sector',
         stations: 'KSM01–KSM05', color: '#36873c', note: 'estensione ufficiale di M13' },
};

const M13_META = {
  id:          'M13',
  code:        'M13',
  name:        'Line 13',
  color:       '#36873c',
  totalKmM13:  30.07,                // M1301 → M1324 / KSM01
  totalKmKSM:  7.51,                 // KSM01 → KSM05
  totalKmThru: 37.58,                // M1301 → KSM05
  avgSpeedKmh: null,   // da definire
  dwellSec:    null,   // da definire
  boundary: { station: 'Showanul', nodeId: 167670124, codes: { M13: 'M1324', KSM: 'KSM01' } },
  /* Thru service: M13 ⇄ Kashimochi Railway (cfr. Midosuji ⇄ Kita-Osaka Kyuko) */
  thruService: {
    at: 'M1324',
    atAlt: 'KSM01',
    to: 'Kashimochi Railway (笂桃電鐵)',
    operatorChange: true,
    from: 'M1301',
    terminus: 'KSM05',
    note: 'da definire quali servizi fanno thru e quali terminano a M1324',
  },
};

/* Placeholder: servizi e headway da definire con le prossime istruzioni */
const M13_HEADWAY = [];
const M13_SVC = {};

/* ----------------------------------------------------------------
   Interscambi Metro Line 13 ↔ altre reti
   transferMin PROVVISORIO = 3 (non fornito)
   M1324 ↔ KSM01: STESSA stazione, transferMin = 0 (thru, no cambio)
---------------------------------------------------------------- */
const _ic13 = (code, network) => ({ code, network, transferMin: 3, note: '' });
const _m13 = (c) => _ic13(c, 'metro');
const _s13 = (c) => _ic13(c, 'suburban');
const _thru13 = (c) => ({ code: c, network: 'thru', transferMin: 0, note: 'stessa stazione: thru service' });

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
  M1324: [_thru13('KSM01'), _s13('SK43')],
  KSM01: [_thru13('M1324'), _s13('SK43')],
};

const M13_NODE_IDS = Object.fromEntries(
  [...Object.entries(M13_ST), ...Object.entries(M13_KSM_ST)].map(([c, s]) => [c, s.nodeId])
);

if (typeof module !== 'undefined') {
  module.exports = {
    M13_META, M13_OPERATORS, M13_ST, M13_KSM_ST,
    M13_CANONICAL_MAIN, M13_CANONICAL_KSM, M13_CANONICAL_THRU,
    M13_HEADWAY, M13_SVC, M13_INTERCHANGE, M13_NODE_IDS,
  };
}

/* ================================================================
   CK DATA MODULE — Chukkūn Line (竹空線)
   Linea suburbana che collega Asunahama Airport Terminal 4 a
   Moriyose, passando per l'aeroporto internazionale, Rinkūn City,
   Riimibaiken e il corridoio Seishaku verso il capolinea sud.
   33 stazioni · 57.92 km
   Cinematica: EMU vmax 100 km/h, a=0.9 m/s², dwell 30s
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   STAZIONI
   km: distanza progressiva da CK01 (Asunahama Airport Terminal 4)
   ix: codici equivalenti su altre reti (interscambi cross-network)
---------------------------------------------------------------- */
const CK_ST = {
  CK01: { n: 'Asunahama Airport Terminal 4',   k: '',                                                                          km:  0.00, ix: ['AX00'] },
  CK02: { n: 'Sainðaul International Airport', k: '\u4f5c\u5b89\u5d0e\u570b\u969b\u7a7a\u6e2f',                               km:  3.11, ix: ['AX01', 'KE03'] },
  CK03: { n: 'Shinseibijān',                   k: '\u65b0\u6574\u5099\u5834',                                                  km:  5.56, ix: [] },
  CK04: { n: 'Rink\u016bn City',               k: '\u0aa6\u0abe\u0aaa\u0acd\u200c\u0aa1\u0ac7\u0a83\u0aaa\u0acd \u0a9f\u0abe\u0aa0\u0abe', km:  8.21, ix: ['AX02'] },
  CK05: { n: 'Ikisawa',                        k: '\u7434\u7a8a',                                                               km:  9.46, ix: [] },
  CK06: { n: 'Togara',                         k: '\u7126\u7f85',                                                               km: 10.44, ix: [] },
  CK07: { n: 'Toibotsuta',                     k: '\u87a7\u57a3',                                                               km: 12.15, ix: [] },
  CK08: { n: 'Riimibaiken',                    k: '\ud841\udf4f\u535e',                                                         km: 13.64, ix: ['AX03'] },
  CK09: { n: 'Shin-Tsuruna',                   k: '\u65b0\u9b3a',                                                               km: 14.85, ix: [] },
  CK10: { n: 'Tsaibako',                       k: '\u6e08\u9d02',                                                               km: 15.75, ix: [] },
  CK11: { n: 'Tsurunarikki',                   k: '\u9b3a\u9678\u8d77',                                                         km: 16.96, ix: [] },
  CK12: { n: 'Eikunna',                        k: '\u6804\u52f3\u90a3',                                                         km: 18.13, ix: [] },
  CK13: { n: 'Rismyonjen',                     k: '',                                                                           km: 19.90, ix: ['TS17'] },
  CK14: { n: 'Dodonuka',                       k: '\u767b\u6238\u964d',                                                         km: 22.05, ix: [] },
  CK15: { n: 'Toemonjaru',                     k: '',                                                                           km: 23.74, ix: [] },
  CK16: { n: 'Kasakuri',                       k: '\u9bdb\u5dfb',                                                               km: 26.47, ix: ['TS16', 'AX04', 'M419', 'SK35', 'KD35'] },
  CK17: { n: 'Nihkyonta',                      k: '\u6ff1\u89d2',                                                               km: 30.28, ix: ['TS15', 'SK34'] },
  CK18: { n: 'Alkuitsa',                       k: '\u6f6e\u5c7a',                                                               km: 31.88, ix: ['TS14', 'M202'] },
  CK19: { n: 'Tajam\u014dri',                  k: '\u5bb0\u6bdb\u5229',                                                         km: 33.87, ix: ['M805'] },
  CK20: { n: 'Tobeskauri',                     k: '\u9d28\u6cbc',                                                               km: 35.13, ix: [] },
  CK21: { n: 'Makkeriya',                      k: '\u5e73\u8ffd',                                                               km: 36.10, ix: [] },
  CK22: { n: 'Shiitehongi',                    k: '\u830b\u672c\u540d',                                                         km: 37.80, ix: ['LL03', 'SK24'] },
  CK23: { n: 'Kasaraki',                       k: '\u6b21\u7fbd',                                                               km: 39.54, ix: ['SK23'] },
  CK24: { n: 'Makurigawa',                     k: '\u70ad\u754c',                                                               km: 40.55, ix: ['SK22'] },
  CK25: { n: 'Riyakugo',                       k: '\u8ffd\u53e5\u80e1',                                                         km: 41.77, ix: ['SK21'] },
  CK26: { n: 'Oizato',                         k: '\u7c55\u7a6b',                                                               km: 42.83, ix: ['SK20'] },
  CK27: { n: 'Shakihori',                      k: '\u77f3\u767b',                                                               km: 47.03, ix: ['SK19'] },
  CK28: { n: 'Awada',                          k: '\u908a\u592a',                                                               km: 48.33, ix: ['SK18'] },
  CK29: { n: 'Punomowen',                      k: '\u3dc0\u5712',                                                               km: 49.24, ix: ['SK17'] },
  CK30: { n: 'Kayahori Bunki',                 k: '\u9999\u5f25\u767b\u5206\u5c90',                                             km: 50.36, ix: ['SK16'] },
  CK31: { n: 'Irumanpi',                       k: '',                                                                           km: 52.80, ix: [] },
  CK32: { n: 'Moriyose Isamata',               k: '\u7af9\u5cf0\u5b89\u4f38',                                                   km: 55.86, ix: [] },
  CK33: { n: 'Moriyose',                       k: '\u7af9\u5cf0',                                                               km: 57.92, ix: [] },
};

/* ----------------------------------------------------------------
   CANONICAL ORDER
---------------------------------------------------------------- */
const CK_CANONICAL = [
  'CK01','CK02','CK03','CK04','CK05','CK06','CK07','CK08','CK09','CK10',
  'CK11','CK12','CK13','CK14','CK15','CK16','CK17','CK18','CK19','CK20',
  'CK21','CK22','CK23','CK24','CK25','CK26','CK27','CK28','CK29','CK30',
  'CK31','CK32','CK33',
];

/* ----------------------------------------------------------------
   TIMETABLE — offset in secondi da CK01 (= secondi di partenza
   dalla stazione, contando da quando il treno lascia CK01)
   Cinematica: vmax 100 km/h, a=0.9 m/s², dwell 30s
   Tempo totale CK01→CK33: 4003 s ≈ 66.7 min
---------------------------------------------------------------- */
const CK_OFFSETS = {
  CK01:    0,
  CK02:  173,
  CK03:  322,
  CK04:  478,
  CK05:  584,
  CK06:  680,
  CK07:  803,
  CK08:  917,
  CK09: 1022,
  CK10: 1115,
  CK11: 1219,
  CK12: 1322,
  CK13: 1447,
  CK14: 1585,
  CK15: 1707,
  CK16: 1866,
  CK17: 2064,
  CK18: 2182,
  CK19: 2315,
  CK20: 2421,
  CK21: 2517,
  CK22: 2639,
  CK23: 2762,
  CK24: 2860,
  CK25: 2964,
  CK26: 3063,
  CK27: 3276,
  CK28: 3383,
  CK29: 3477,
  CK30: 3578,
  CK31: 3727,
  CK32: 3898,
  CK33: 4003,
};

/* ----------------------------------------------------------------
   SERVICE DEFINITION
---------------------------------------------------------------- */
const CK_SERVICES = [
  {
    id:             'CK',
    name:           'Chukkūn Line',
    nameJa:         '竹空線',
    color:          '#6B9E3E',
    headwayPeak:    15,
    headwayOffPeak: 30,
    firstDep:       '05:30',
    lastDep:        '23:30',
    canonical:      CK_CANONICAL,
    offsets:        CK_OFFSETS,
    totalKm:        57.92,
  },
];

/* ----------------------------------------------------------------
   INTERCHANGE ADDENDA
   Mappa CK → altri codici cross-network.
   Va integrata in SUBURBAN_INTERCHANGE (o equivalente) nel router.
   I codici AX, TS, SK, KD, LL, M sono già presenti nei rispettivi
   moduli; questa mappa aggiunge il lato CK della relazione.
---------------------------------------------------------------- */
const CK_INTERCHANGE_ADDENDA = {
  CK01: ['AX00'],
  CK02: ['AX01', 'KE03'],
  CK04: ['AX02'],
  CK08: ['AX03'],
  CK13: ['TS17'],
  CK16: ['TS16', 'AX04', 'M419', 'SK35', 'KD35'],
  CK17: ['TS15', 'SK34'],
  CK18: ['TS14', 'M202'],
  CK19: ['M805'],
  CK22: ['LL03', 'SK24'],
  CK23: ['SK23'],
  CK24: ['SK22'],
  CK25: ['SK21'],
  CK26: ['SK20'],
  CK27: ['SK19'],
  CK28: ['SK18'],
  CK29: ['SK17'],
  CK30: ['SK16'],
};

if (typeof module !== 'undefined') {
  module.exports = { CK_ST, CK_CANONICAL, CK_OFFSETS, CK_SERVICES, CK_INTERCHANGE_ADDENDA };
}

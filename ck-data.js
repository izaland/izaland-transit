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
  CK01: { n: 'Asunahama Airport Terminal 4',   k: '',                km:  0.00, ix: ['AX00'] },
  CK02: { n: 'Sainðaul International Airport', k: '作安崎國際空港',  km:  3.11, ix: ['AX01', 'KE03'] },
  CK03: { n: 'Shinseibijān',                   k: '新整備場',        km:  5.56, ix: [] },
  CK04: { n: 'Rinkūn City',                    k: 'રિન્ઝેંપ ટાઠા',  km:  8.21, ix: ['AX02'] },
  CK05: { n: 'Ikisawa',                        k: '琴空',            km:  9.46, ix: [] },
  CK06: { n: 'Togara',                         k: '焦羅',            km: 10.44, ix: [] },
  CK07: { n: 'Toibotsuta',                     k: '蚧垣',            km: 12.15, ix: [] },
  CK08: { n: 'Riimibaiken',                    k: '𠝏別',            km: 13.64, ix: ['AX03'] },
  CK09: { n: 'Shin-Tsuruna',                   k: '新鳰',            km: 14.85, ix: [] },
  CK10: { n: 'Tsaibako',                       k: '済鴒',            km: 15.75, ix: [] },
  CK11: { n: 'Tsurunarikki',                   k: '鳰陸起',          km: 16.96, ix: [] },
  CK12: { n: 'Eikunna',                        k: '栄勳那',          km: 18.13, ix: [] },
  CK13: { n: 'Rismyonjen',                     k: '',                km: 19.90, ix: ['TS17'] },
  CK14: { n: 'Dodonuka',                       k: '登戸降',          km: 22.05, ix: [] },
  CK15: { n: 'Toemonjaru',                     k: '',                km: 23.74, ix: [] },
  CK16: { n: 'Kasakuri',                       k: '鯛巻',            km: 26.47, ix: ['TS16', 'AX04', 'M419', 'SK35', 'KD35'] },
  CK17: { n: 'Nihkyonta',                      k: '濱角',            km: 30.28, ix: ['TS15', 'SK34'] },
  CK18: { n: 'Alkuitsa',                       k: '潮尾',            km: 31.88, ix: ['TS14', 'M202'] },
  CK19: { n: 'Tajamōri',                       k: '宰毛利',          km: 33.87, ix: ['M805'] },
  CK20: { n: 'Tobeskauri',                     k: '鴨沼',            km: 35.13, ix: [] },
  CK21: { n: 'Makkeriya',                      k: '平追',            km: 36.10, ix: [] },
  CK22: { n: 'Shiitehongi',                    k: '茛本名',          km: 37.80, ix: ['LL03', 'SK24'] },
  CK23: { n: 'Kasaraki',                       k: '次羽',            km: 39.54, ix: ['SK23'] },
  CK24: { n: 'Makurigawa',                     k: '炭界',            km: 40.55, ix: ['SK22'] },
  CK25: { n: 'Riyakugo',                       k: '追句胡',          km: 41.77, ix: ['SK21'] },
  CK26: { n: 'Oizato',                         k: '粕穫',            km: 42.83, ix: ['SK20'] },
  CK27: { n: 'Shakihori',                      k: '石登',            km: 47.03, ix: ['SK19'] },
  CK28: { n: 'Awada',                          k: '邊太',            km: 48.33, ix: ['SK18'] },
  CK29: { n: 'Punomowen',                      k: '㷀園',            km: 49.24, ix: ['SK17'] },
  CK30: { n: 'Kayahori Bunki',                 k: '香弥登分岐',      km: 50.36, ix: ['SK16'] },
  CK31: { n: 'Irumanpi',                       k: '',                km: 52.80, ix: [] },
  CK32: { n: 'Moriyose Isamata',               k: '竹峰安伸',        km: 55.86, ix: [] },
  CK33: { n: 'Moriyose',                       k: '竹峰',            km: 57.92, ix: [] },
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

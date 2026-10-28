/* ================================================================
   M7-DATA.JS — Metro Line 7
   ================================================================
   28 stazioni · M701 Akettun Shendao → M728 Pwakkobe
   Colore: #00a0bc
   Distanze progressive da M701 (km 0.000), totale 36.30 km.

   Interscambi confermati:
     M705  CK08, AX03  (CK line; Airport Express — Riimibaiken)
     M709  M1310 (Metro Line 13 — Niirado Tagawae)
     M711  M1732 (Metro Line 17 — Wikkaman)
     M712  M623  (Metro Line 6 — Ezaesomu)
     M714  M509  (Metro Line 5 — Riihisano)
     M715  M1318 (Metro Line 13 — Tsuruna Eigandan)
     M717  AX20, TS19 (Airport Express; TS line — Eigandan Senpyan)
     M718  M1113 (Metro Line 11 — Ushiuruma)
     M719  M503, M1619 (Metro Line 5; Metro Line 16 — Konegisa Eigandan)
     M721  HUB_SAKAMUSO
     M722  SK39  (Seishaku Line — Kashiwaka)
     M723  SK40  (Seishaku Line — Togamiro)
     M725  M1116, M1614, TS20 (Metro Line 11; Metro Line 16; TS line — Shutazai)
     M726  M1321 (Metro Line 13 — Sanbonzayo)
     M728  M513, M1612 (Metro Line 5; Metro Line 16 — Pwakkobe)
================================================================ */
'use strict';

const M7_ST = {
  M701: { n: 'Akettun Shendao',      k: '',            nodeId: 147466401, km:  0.00 },
  M702: { n: 'Otsohejan',            k: '',            nodeId: 147466402, km:  0.81 },
  M703: { n: 'Tentsorussan',         k: '',            nodeId: 147466403, km:  1.79 },
  M704: { n: 'Okushiba',             k: '',            nodeId: 147466404, km:  2.83 },
  M705: { n: 'Riimibaiken',          k: '𠽏卾',         nodeId: 126754745, km:  3.48 },
  M706: { n: 'Tsuruna Niji IC',      k: '鵺西IC',       nodeId: 147654873, km:  4.89 },
  M707: { n: 'Nokatsuta',            k: '',            nodeId: 147654872, km:  6.14 },
  M708: { n: 'Wedeimos',             k: '',            nodeId: 147654871, km:  7.02 },
  M709: { n: 'Niirado Tagawae',      k: '',            nodeId: 146814994, km:  7.84 },
  M710: { n: 'Sangyau Tsiiku',       k: '産業地域',     nodeId: 194463494, km:  9.45 },
  M711: { n: 'Wikkaman',             k: '昺賀満',       nodeId: 180237682, km: 13.17 },
  M712: { n: 'Ezaesomu',             k: '皃築',         nodeId: 123393744, km: 15.91 },
  M713: { n: 'Riihisano 2sa',        k: '尾本2沙',      nodeId: 123393745, km: 17.14 },
  M714: { n: 'Riihisano',            k: '尾本',         nodeId: 123393747, km: 18.01 },
  M715: { n: 'Tsuruna Eigandan',     k: '守那永玵段',   nodeId: 123393784, km: 19.37 },
  M716: { n: 'Bawangitan',           k: '',            nodeId: 123393743, km: 20.40 },
  M717: { n: 'Eigandan Senpyan',     k: '永玵段船駢',   nodeId: 123393771, km: 21.30 },
  M718: { n: 'Ushiuruma',            k: '',            nodeId: 123393751, km: 22.32 },
  M719: { n: 'Konegisa Eigandan',    k: '干醃永玵段',   nodeId: 123393753, km: 23.74 },
  M720: { n: 'Himatoshi',            k: '妃満氾',       nodeId: 123393752, km: 24.90 },
  M721: { n: 'Sakamuso',             k: '沛坤',         nodeId: 176874425, km: 26.04 },
  M722: { n: 'Kashiwaka',            k: '笂旄',         nodeId: 147382474, km: 27.52 },
  M723: { n: 'Togamiro',             k: '焦美路',       nodeId: 167670212, km: 28.31 },
  M724: { n: 'Konegisa Shavunsan',   k: '',            nodeId: 262364033, km: 29.54 },
  M725: { n: 'Shutazai',             k: '守多彩',       nodeId: 136187238, km: 31.46 },
  M726: { n: 'Sanbonzayo',           k: '三本木',       nodeId: 196658316, km: 33.14 },
  M727: { n: 'Kadokamahiwa Otsumi',  k: '',            nodeId: 262364032, km: 34.26 },
  M728: { n: 'Pwakkobe',             k: '',            nodeId: 196658312, km: 36.30 },
};

/* Ordine canonico: M701 → M728 */
const M7_CANONICAL_ORDER = Object.keys(M7_ST);

const M7_META = {
  id:          'M7',
  code:        'M7',
  name:        'Line 7',
  nameJa:      '7号線',
  color:       '#00a0bc',
  totalKm:     36.30,
  avgSpeedKmh: 35,
  dwellSec:    30,
};

/* Frequenza base: 6 TPH (10 min) */
const M7_HEADWAY = [
  { from: '04:55', to: '23:54', headwayMin: 10 },
];

const M7_SVC = {
  A: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#00a0bc',
    cls:    'svc-A',
    stops:  M7_CANONICAL_ORDER,
  },
};

var _hub = (typeof _hub !== 'undefined')
  ? _hub
  : (hubId, min = null, note = '') => ({ hubId, transferMin: min, note });

const M7_INTERCHANGE = {
  M705: [
    { code: 'CK08', network: 'suburban', transferMin: 4,
      note: 'Riimibaiken — CK line' },
    { code: 'AX03', network: 'ax', transferMin: 5,
      note: 'Riimibaiken — Airport Express' },
  ],
  M709: [
    { code: 'M1310', network: 'metro', transferMin: 3,
      note: 'Metro Line 13 — Niirado Tagawae' },
  ],
  M711: [
    { code: 'M1732', network: 'metro', transferMin: 3,
      note: 'Metro Line 17 — Wikkaman' },
  ],
  M712: [
    { code: 'M623', network: 'metro', transferMin: 3,
      note: 'Metro Line 6 — Ezaesomu' },
  ],
  M714: [
    { code: 'M509', network: 'metro', transferMin: 3,
      note: 'Metro Line 5 — Riihisano' },
  ],
  M715: [
    { code: 'M1318', network: 'metro', transferMin: 3,
      note: 'Metro Line 13 — Tsuruna Eigandan' },
  ],
  M717: [
    { code: 'AX20', network: 'ax', transferMin: 5,
      note: 'Eigandan Senpyan — Airport Express' },
    { code: 'TS19', network: 'suburban', transferMin: 5,
      note: 'Eigandan Senpyan — TS line' },
  ],
  M718: [
    { code: 'M1113', network: 'metro', transferMin: 3,
      note: 'Metro Line 11 — Ushiuruma' },
  ],
  M719: [
    { code: 'M503', network: 'metro', transferMin: 3,
      note: 'Metro Line 5 — Konegisa Eigandan' },
    { code: 'M1619', network: 'metro', transferMin: 3,
      note: 'Metro Line 16 — Konegisa Eigandan' },
  ],
  M721: [_hub('HUB_SAKAMUSO')],
  M722: [
    { code: 'SK39', network: 'suburban', transferMin: 4,
      note: 'Kashiwaka — Seishaku Line' },
  ],
  M723: [
    { code: 'SK40', network: 'suburban', transferMin: 4,
      note: 'Togamiro — Seishaku Line' },
  ],
  M725: [
    { code: 'M1116', network: 'metro', transferMin: 3,
      note: 'Metro Line 11 — Shutazai' },
    { code: 'M1614', network: 'metro', transferMin: 3,
      note: 'Metro Line 16 — Shutazai' },
    { code: 'TS20', network: 'suburban', transferMin: 4,
      note: 'Shutazai — TS line' },
  ],
  M726: [
    { code: 'M1321', network: 'metro', transferMin: 3,
      note: 'Metro Line 13 — Sanbonzayo' },
  ],
  M728: [
    { code: 'M513', network: 'metro', transferMin: 3,
      note: 'Metro Line 5 — Pwakkobe' },
    { code: 'M1612', network: 'metro', transferMin: 3,
      note: 'Metro Line 16 — Pwakkobe' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M7_META, M7_ST, M7_CANONICAL_ORDER, M7_HEADWAY, M7_SVC, M7_INTERCHANGE };
}

/* ================================================================
   M15-DATA.JS — Metro Line 15 (#db287a)
   ================================================================
   25 stazioni · 33.92 km · metro pesante (40 km/h commerciali, sosta 20 s)
   Capolinea: SAIA Cargo Center (M1501) ↔ Sakamuso (M1525)

   Interscambi notevoli:
     M1501 SAIA Cargo Center                 ↔ M1301
     M1502 Sainðaul Asunahama Intl Airport   ↔ M1302, CK02, AX01
     M1503 Asunahama Airport Terminal 2      ↔ M1303
     M1504 Asunahama Seagate                 ↔ M1304
     M1505 Bibaisone                         ↔ M1305
     M1506 Bunsonji                          ↔ M1307
     M1512 Huppakoi                          ↔ STW04
     M1514 Saikade Onuki                     ↔ M1733
     M1516 Niji-Urenosomi                    ↔ M625
     M1519 Eonogi Kōwen                      ↔ M510
     M1521 Urenosomi-Tsuruna                 ↔ M1320
     M1523 Bajikoe Canal Kōwen               ↔ M1115
     M1525 Sakamuso                          ↔ M721, SK38
================================================================ */
'use strict';

const M15_ST = {
  M1501: { n: 'SAIA Cargo Center', k: 'SAIA貨物ટૅપ્‌ઠદ્', nodeId: 229660683, km:  0.00 },
  M1502: { n: 'Sainðaul Asunahama International Airport', k: '作安崎天島國際空港', nodeId: 126754752, km:  1.65 },
  M1503: { n: 'Asunahama Airport Terminal 2', k: '天島空港第２旅客棟', nodeId: 328799085, km:  3.02 },
  M1504: { n: 'Asunahama Seagate', k: '天島યાઃડૃૅઃઠે', nodeId: 183244867, km:  4.85 },
  M1505: { n: 'Bibaisone', k: '尾梅幕', nodeId: 126754751, km:  7.67 },
  M1506: { n: 'Bunsonji', k: '', nodeId: 146814998, km:  9.58 },
  M1507: { n: 'Tahamuro Shinjō', k: '', nodeId: 146814999, km: 11.21 },
  M1508: { n: 'Tahamuro', k: '', nodeId: 146815000, km: 12.19 },
  M1509: { n: 'Shin-Wamagiyasu', k: '', nodeId: 146815001, km: 13.35 },
  M1510: { n: 'Wamagiyasu', k: '', nodeId: 146815002, km: 14.70 },
  M1511: { n: 'Shiki-Huppakoi', k: '', nodeId: 146815003, km: 15.97 },
  M1512: { n: 'Huppakoi', k: '', nodeId: 146815004, km: 16.93 },
  M1513: { n: 'Tansodai', k: '綻宋臺', nodeId: 146815005, km: 18.31 },
  M1514: { n: 'Saikade Onuki', k: '賽湊午陥', nodeId: 146815006, km: 19.61 },
  M1515: { n: 'Kaikakuda', k: '', nodeId: 146815007, km: 20.65 },
  M1516: { n: 'Niji-Urenosomi', k: '', nodeId: 146815008, km: 22.03 },
  M1517: { n: 'Takarimoto', k: '浚箕土', nodeId: 146814986, km: 23.18 },
  M1518: { n: 'Eonogi Kōwen Niji', k: '', nodeId: 146814987, km: 24.46 },
  M1519: { n: 'Eonogi Kōwen', k: '', nodeId: 146814988, km: 25.62 },
  M1520: { n: 'Makkaustai', k: '', nodeId: 146814989, km: 26.63 },
  M1521: { n: 'Urenosomi-Tsuruna', k: '', nodeId: 146814990, km: 27.53 },
  M1522: { n: 'Urenosomi Senpyan', k: '', nodeId: 123393770, km: 29.17 },
  M1523: { n: 'Bajikoe Canal Kōwen', k: '桐塚', nodeId: 146814220, km: 30.22 },
  M1524: { n: 'Ageni Tsaron', k: '', nodeId: 136005577, km: 31.62 },
  M1525: { n: 'Sakamuso', k: '沛坤', nodeId: 176874425, km: 33.92 },
};

/* Ordine canonico geografico: M1501 → M1525 */
const M15_CANONICAL_ORDER = [
  'M1501', 'M1502', 'M1503', 'M1504', 'M1505',
  'M1506', 'M1507', 'M1508', 'M1509', 'M1510',
  'M1511', 'M1512', 'M1513', 'M1514', 'M1515',
  'M1516', 'M1517', 'M1518', 'M1519', 'M1520',
  'M1521', 'M1522', 'M1523', 'M1524', 'M1525',
];

const M15_META = {
  id:          'M15',
  code:        'M15',
  name:        'Line 15',
  nameJa:      '',
  color:       '#db287a',
  totalKm:     33.92,
  stations:    25,
  avgSpeedKmh: 40,   // metro pesante
  dwellSec:    20,
};

/* TODO: headway provvisorio (copiato da M14/M11) — da confermare */
const M15_HEADWAY = [
  { from: '05:00', to: '06:30', headwayMin: 10 },
  { from: '06:30', to: '07:00', headwayMin:  5 },
  { from: '07:00', to: '09:30', headwayMin:  3 },
  { from: '09:30', to: '17:00', headwayMin:  5 },
  { from: '17:00', to: '20:00', headwayMin:  3 },
  { from: '20:00', to: '22:30', headwayMin:  5 },
  { from: '22:30', to: '24:30', headwayMin: 10 },
];

const M15_SVC = {
  B: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#db287a',
    cls:    'svc-B',
    stops:  M15_CANONICAL_ORDER,
  },
};

/* TODO: transferMin provvisorio 3 min per tutti i nodi — da rivedere.
   TODO: network di STW04 da verificare. */
const M15_INTERCHANGE = {
  M1501: [
    { code: 'M1301', network: 'metro', transferMin: 3, note: 'M1301 SAIA Cargo Center' }
  ],
  M1502: [
    { code: 'M1302', network: 'metro', transferMin: 3, note: 'M1302 Asunahama International Airport' },
    { code: 'CK02', network: 'suburban', transferMin: 3, note: 'CK02 Asunahama International Airport' },
    { code: 'AX01', network: 'ax', transferMin: 3, note: 'AX01 Asunahama Airport (Airport Express)' }
  ],
  M1503: [
    { code: 'M1303', network: 'metro', transferMin: 3, note: 'M1303 Asunahama Airport Terminal 2' }
  ],
  M1504: [
    { code: 'M1304', network: 'metro', transferMin: 3, note: 'M1304 Asunahama Seagate' }
  ],
  M1505: [
    { code: 'M1305', network: 'metro', transferMin: 3, note: 'M1305 Bibaisone' }
  ],
  M1506: [
    { code: 'M1307', network: 'metro', transferMin: 3, note: 'M1307 Bunsonji' }
  ],
  M1512: [
    { code: 'STW04', network: 'suburban', transferMin: 3, note: 'STW04 Huppakoi' }
  ],
  M1514: [
    { code: 'M1733', network: 'metro', transferMin: 3, note: 'M1733 Saikade Onuki' }
  ],
  M1516: [
    { code: 'M625', network: 'metro', transferMin: 3, note: 'M625 Niji-Urenosomi' }
  ],
  M1519: [
    { code: 'M510', network: 'metro', transferMin: 3, note: 'M510 Eonogi Kōwen' }
  ],
  M1521: [
    { code: 'M1320', network: 'metro', transferMin: 3, note: 'M1320 Urenosomi-Tsuruna' }
  ],
  M1523: [
    { code: 'M1115', network: 'metro', transferMin: 3, note: 'M1115 Bajikoe Canal Kōwen' }
  ],
  M1525: [
    { code: 'M721', network: 'metro', transferMin: 3, note: 'M721 Sakamuso' },
    { code: 'SK38', network: 'suburban', transferMin: 3, note: 'SK38 Sakamuso' }
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M15_META, M15_ST, M15_CANONICAL_ORDER, M15_HEADWAY, M15_SVC, M15_INTERCHANGE };
}

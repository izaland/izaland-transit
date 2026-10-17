/* ================================================================
   M20-DATA.JS — Metro Line 20
   ================================================================
   7 stazioni · M2001 Sainðaul Central → M2007 Sakamuso
   Colore: #0F1F5C (blu notte)

   Distanze progressive da M2001 (km 0.00), ricavate dalla colonna
   distance_from_M1701. Servizio: unico schema tutto-fermate.

   Interscambi:
     M2001  M117, M814, M1712 (metro)
            LL01, SK26, TS13, JD01 (suburban)
            AX06 (Airport Express)
            K01, E01, R01 (IZX)
     M2002  M911, M1014
     M2003  M416, M609
     M2004  M111, M417, M610 (metro) · SK33, TS14 (suburban) · AX05 (AX)
     M2005  M906, M1203
     M2006  nessun interscambio
     M2007  M721, M1525 (metro) · SK38 (suburban) · K101 (IZX)
================================================================ */
'use strict';

const M20_ST = {
  M2001: { n: 'Sainðaul Central', k: '作安崎中央', nodeId: 229656494, km:  0.00 },
  M2002: { n: 'Kanbata',          k: '巻岩',       nodeId: 177044015, km:  1.31 },
  M2003: { n: 'Abawauri',         k: '燕宦',       nodeId: 129227893, km:  3.72 },
  M2004: { n: 'Shimamera',        k: '渠瀬田',     nodeId: 368583227, km:  5.18 },
  M2005: { n: 'Hadantoyo',        k: '琦砂',       nodeId: 368583213, km:  6.83 },
  M2006: { n: 'Taradawaki',       k: '',           nodeId: 291318583, km: 12.52 },
  M2007: { n: 'Sakamuso',         k: '沛坤',       nodeId: 176874425, km: 15.55 },
};

/* Ordine canonico: M2001 → M2007 */
const M20_CANONICAL_ORDER = [
  'M2001', 'M2002', 'M2003', 'M2004', 'M2005', 'M2006', 'M2007',
];

const M20_META = {
  id:          'M20',
  code:        'M20',
  name:        'Line 20',
  nameJa:      '20号線',
  color:       '#0F1F5C',
  totalKm:     15.55,
  avgSpeedKmh: 35,    // TODO: provvisorio — da confermare
  dwellSec:    30,
};

/* TODO: frequenze provvisorie, da confermare */
const M20_HEADWAY = [
  { from: '05:30', to: '07:00', headwayMin: 10 },
  { from: '07:00', to: '09:30', headwayMin:  3 },
  { from: '09:30', to: '17:30', headwayMin:  6 },
  { from: '17:30', to: '20:00', headwayMin:  3 },
  { from: '20:00', to: '22:30', headwayMin:  6 },
  { from: '22:30', to: '24:00', headwayMin: 10 },
];

const M20_SVC = {
  A: {
    name:   'All-stop',
    nameJa: '各駅停車',
    color:  '#0F1F5C',
    cls:    'svc-A',
    stops:  M20_CANONICAL_ORDER,
  },
};

const M20_INTERCHANGE = {
  M2001: [
    { code: 'M117',  network: 'metro',    transferMin: 3, note: 'Metro Line 1 — Sainðaul Central' },
    { code: 'M814',  network: 'metro',    transferMin: 3, note: 'Metro Line 8 — Sainðaul Central' },
    { code: 'M1712', network: 'metro',    transferMin: 3, note: 'Metro Line 17 — Sainðaul Central' },
    { code: 'LL01',  network: 'suburban', transferMin: 4, note: 'LL01 Sainðaul Central' },
    { code: 'SK26',  network: 'suburban', transferMin: 4, note: 'SK26 Sainðaul Central' },
    { code: 'TS13',  network: 'suburban', transferMin: 4, note: 'TS13 Sainðaul Central' },
    { code: 'JD01',  network: 'suburban', transferMin: 4, note: 'JD01 Sainðaul Central' },
    { code: 'AX06',  network: 'ax',       transferMin: 5, note: 'Airport Express — Sainðaul Central' },
    { code: 'K01',   network: 'izx',      transferMin: 5, note: 'IZX K01 Sainðaul Central' },
    { code: 'E01',   network: 'izx',      transferMin: 5, note: 'IZX E01 Sainðaul Central' },
    { code: 'R01',   network: 'izx',      transferMin: 5, note: 'IZX R01 Sainðaul Central' },
  ],
  M2002: [
    { code: 'M911',  network: 'metro', transferMin: 3, note: 'Metro Line 9 — Kanbata' },
    { code: 'M1014', network: 'metro', transferMin: 3, note: 'Metro Line 10 — Kanbata' },
  ],
  M2003: [
    { code: 'M416', network: 'metro', transferMin: 3, note: 'Metro Line 4 — Abawauri' },
    { code: 'M609', network: 'metro', transferMin: 3, note: 'Metro Line 6 — Abawauri' },
  ],
  M2004: [
    { code: 'M111', network: 'metro',    transferMin: 3, note: 'Metro Line 1 — Shimamera' },
    { code: 'M417', network: 'metro',    transferMin: 3, note: 'Metro Line 4 — Shimamera' },
    { code: 'M610', network: 'metro',    transferMin: 3, note: 'Metro Line 6 — Shimamera' },
    { code: 'SK33', network: 'suburban', transferMin: 4, note: 'SK33 Shimamera' },
    { code: 'TS14', network: 'suburban', transferMin: 4, note: 'TS14 Shimamera' },
    { code: 'AX05', network: 'ax',       transferMin: 5, note: 'Airport Express — Shimamera' },
  ],
  M2005: [
    { code: 'M906',  network: 'metro', transferMin: 3, note: 'Metro Line 9 — Hadantoyo' },
    { code: 'M1203', network: 'metro', transferMin: 3, note: 'Metro Line 12 — Hadantoyo' },
  ],
  M2007: [
    { code: 'M721',  network: 'metro',    transferMin: 3, note: 'Metro Line 7 — Sakamuso' },
    { code: 'M1525', network: 'metro',    transferMin: 3, note: 'Metro Line 15 — Sakamuso' },
    { code: 'SK38',  network: 'suburban', transferMin: 4, note: 'SK38 Sakamuso' },
    { code: 'K101',  network: 'izx',      transferMin: 5, note: 'IZX K101 Sakamuso' },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { M20_META, M20_ST, M20_CANONICAL_ORDER, M20_HEADWAY, M20_SVC, M20_INTERCHANGE };
}

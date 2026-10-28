/* ================================================================
   HUBS.JS — Network hub master data
   ================================================================
   A hub is a group of station codes that belong to the same physical
   interchange. The router can expand hub membership into reciprocal
   interchange links, using the transfer-time matrix below.

   Transfer times are in minutes and may be asymmetric:
   transferTimes[from][to].

   Hubs: Sainðaul Central, Sakamuso.
================================================================ */
'use strict';

const HUB_SAINDAUL_CENTRAL_STATIONS = [
  'M117',
  'M814',
  'M1712',
  'M2001',
  'SBM01',
  'LL01',
  'SK26',
  'TS13',
  'CO18',
  'JD01',
  'KD32',
  'AX06',
  'K01',
  'R01',
  'E01',
  'MTX101',
];

const HUB_SAINDAUL_CENTRAL_TRANSFER_TIMES = {
  M117:   { M814: 7, M1712: 6, M2001: 3, SBM01: 3, LL01: 5, SK26: 6, TS13: 5, CO18: 5, JD01: 5, KD32: 5, AX06: 4, K01: 6, R01: 6, E01: 6, MTX101: 5 },
  M814:   { M117: 7, M1712: 5, M2001: 9, SBM01: 9, LL01: 10, SK26: 12, TS13: 10, CO18: 10, JD01: 10, KD32: 10, AX06: 7, K01: 8, R01: 8, E01: 8, MTX101: 9 },
  M1712:  { M117: 6, M814: 5, M2001: 5, SBM01: 5, LL01: 4, SK26: 5, TS13: 5, CO18: 5, JD01: 5, KD32: 4, AX06: 6, K01: 6, R01: 6, E01: 6, MTX101: 7 },
  M2001:  { M117: 3, M814: 9, M1712: 5, SBM01: 0, LL01: 4, SK26: 4, TS13: 4, CO18: 4, JD01: 4, KD32: 4, AX06: 4, K01: 7, R01: 9, E01: 9, MTX101: 5 },
  SBM01:  { M117: 3, M814: 9, M1712: 5, M2001: 0, LL01: 4, SK26: 4, TS13: 4, CO18: 4, JD01: 4, KD32: 4, AX06: 4, K01: 7, R01: 9, E01: 9, MTX101: 5 },
  LL01:   { M117: 5, M814: 10, M1712: 5, M2001: 4, SBM01: 4, SK26: 3, TS13: 3, CO18: 3, JD01: 3, KD32: 3, AX06: 3, K01: 5, R01: 7, E01: 7, MTX101: 7 },
  SK26:   { M117: 6, M814: 12, M1712: 4, M2001: 4, SBM01: 4, LL01: 3, TS13: 3, CO18: 3, JD01: 3, KD32: 3, AX06: 3, K01: 5, R01: 5, E01: 5, MTX101: 8 },
  TS13:   { M117: 5, M814: 10, M1712: 5, M2001: 4, SBM01: 4, LL01: 3, SK26: 3, CO18: 3, JD01: 3, KD32: 3, AX06: 6, K01: 8, R01: 8, E01: 8, MTX101: 6 },
  CO18:   { M117: 5, M814: 10, M1712: 5, M2001: 4, SBM01: 4, LL01: 3, SK26: 3, TS13: 3, JD01: 3, KD32: 3, AX06: 5, K01: 7, R01: 7, E01: 7, MTX101: 7 },
  JD01:   { M117: 5, M814: 10, M1712: 5, M2001: 4, SBM01: 4, LL01: 3, SK26: 3, TS13: 3, CO18: 3, KD32: 3, AX06: 5, K01: 7, R01: 7, E01: 7, MTX101: 7 },
  KD32:   { M117: 5, M814: 10, M1712: 5, M2001: 4, SBM01: 4, LL01: 3, SK26: 3, TS13: 3, CO18: 3, JD01: 3, AX06: 5, K01: 7, R01: 7, E01: 7, MTX101: 7 },
  AX06:   { M117: 4, M814: 7, M1712: 4, M2001: 7, SBM01: 4, LL01: 3, SK26: 5, TS13: 6, CO18: 5, JD01: 5, KD32: 5, K01: 3, R01: 3, E01: 3, MTX101: 10 },
  K01:    { M117: 6, M814: 8, M1712: 6, M2001: 7, SBM01: 7, LL01: 5, SK26: 8, TS13: 7, CO18: 7, JD01: 7, KD32: 7, AX06: 3, R01: 2, E01: 2, MTX101: 12 },
  R01:    { M117: 6, M814: 8, M1712: 6, M2001: 9, SBM01: 9, LL01: 7, SK26: 8, TS13: 7, CO18: 7, JD01: 7, KD32: 7, AX06: 3, K01: 2, E01: 2, MTX101: 12 },
  E01:    { M117: 6, M814: 8, M1712: 6, M2001: 9, SBM01: 9, LL01: 7, SK26: 8, TS13: 7, CO18: 7, JD01: 7, KD32: 7, AX06: 3, K01: 2, R01: 2, MTX101: 12 },
  MTX101: { M117: 5, M814: 9, M1712: 7, M2001: 5, SBM01: 5, LL01: 7, SK26: 8, TS13: 6, CO18: 6, JD01: 6, KD32: 6, AX06: 7, K01: 10, R01: 12, E01: 12 },
};

const HUB_SAKAMUSO_STATIONS = [
  'M721',
  'M1525',
  'M2007',
  'KD36',
  'SK38',
  'K101',
  'RKY01',
];

/* Matrice provvisoria: 3 min tra tutti i membri;
   M2007 ↔ RKY01 = 0 (thru service M20 ↔ RKY). */
const HUB_SAKAMUSO_TRANSFER_TIMES = {
  M721:  { M1525: 3, M2007: 3, KD36: 3, SK38: 3, K101: 3, RKY01: 3 },
  M1525: { M721: 3, M2007: 3, KD36: 3, SK38: 3, K101: 3, RKY01: 3 },
  M2007: { M721: 3, M1525: 3, KD36: 3, SK38: 3, K101: 3, RKY01: 0 },
  KD36:  { M721: 3, M1525: 3, M2007: 3, SK38: 3, K101: 3, RKY01: 3 },
  SK38:  { M721: 3, M1525: 3, M2007: 3, KD36: 3, K101: 3, RKY01: 3 },
  K101:  { M721: 3, M1525: 3, M2007: 3, KD36: 3, SK38: 3, RKY01: 3 },
  RKY01: { M721: 3, M1525: 3, M2007: 0, KD36: 3, SK38: 3, K101: 3 },
};

const NETWORK_HUBS = {
  HUB_SAINDAUL_CENTRAL: {
    name: 'Sainðaul Central',
    stations: HUB_SAINDAUL_CENTRAL_STATIONS,
    transferTimes: HUB_SAINDAUL_CENTRAL_TRANSFER_TIMES,
  },
  HUB_SAKAMUSO: {
    name: 'Sakamuso',
    stations: HUB_SAKAMUSO_STATIONS,
    transferTimes: HUB_SAKAMUSO_TRANSFER_TIMES,
  },
};

const NETWORK_HUB_BY_STATION = Object.fromEntries(
  Object.entries(NETWORK_HUBS).flatMap(([hubId, hub]) =>
    hub.stations.map(code => [code, hubId])
  )
);

function getHubForStation(code) {
  const hubId = NETWORK_HUB_BY_STATION[code];
  return hubId ? NETWORK_HUBS[hubId] : null;
}

function getHubTransferMinutes(fromCode, toCode) {
  if (fromCode === toCode) return 0;
  const hub = getHubForStation(fromCode);
  if (!hub || !hub.transferTimes[fromCode]) return null;
  const minutes = hub.transferTimes[fromCode][toCode];
  return Number.isFinite(minutes) ? minutes : null;
}

if (typeof module !== 'undefined') {
  module.exports = {
    NETWORK_HUBS,
    NETWORK_HUB_BY_STATION,
    getHubForStation,
    getHubTransferMinutes,
  };
}

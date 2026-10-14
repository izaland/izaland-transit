'use strict';

const KW_SERVICES = [
  {
    id: 'W1',
    name: 'Local',
    from: 'KW00',
    to: 'KW32',
    stops: 'all',
    dwellSec: 30,
    departuresFromOrigin: [1, 13, 25, 37, 49],
    active: [{ start: '05:00', end: '23:59' }],
  },
  {
    id: 'W2',
    name: 'Peak Local Short',
    from: 'KW00',
    to: 'KW17',
    stops: 'all',
    dwellSec: 30,
    departuresFromOrigin: [8, 28, 55],
    active: [
      { start: '06:00', end: '09:00' },
      { start: '17:00', end: '20:00' },
    ],
  },
  {
    id: 'W3',
    name: 'Rapid',
    from: 'KW00',
    to: 'KW32',
    stops: ['KW00','KW01','KW03','KW06','KW10','KW11','KW17','KW18','KW22','KW29','KW32'],
    dwellSec: 30,
    departuresFromOrigin: [15, 45],
    active: [{ start: '07:00', end: '22:00' }],
    blocked: [
      { start: '06:00', end: '08:30' },
      { start: '18:00', end: '21:00' },
    ],
    segmentOverrides: [
      { from: 'KW00', to: 'KW29', speedKmh: 175 },
      { from: 'KW29', to: 'KW32', speedKmh: 135 },
    ],
  },
  {
    id: 'W4',
    name: 'Commuter Rapid',
    from: 'KW00',
    to: 'KW32',
    stops: ['KW00','KW01','KW06','KW10','KW11','KW17','KW22','KW23','KW24','KW25','KW26','KW27','KW28','KW29','KW30','KW31','KW32'],
    dwellSec: 30,
    departuresFromOrigin: [15, 45],
    active: [
      { start: '06:00', end: '08:30' },
      { start: '18:00', end: '21:00' },
    ],
    segmentOverrides: [
      { from: 'KW00', to: 'KW29', speedKmh: 175 },
      { from: 'KW29', to: 'KW32', speedKmh: 135 },
    ],
  },
];

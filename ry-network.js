/* RY-NETWORK.JS — Ryānkai physical model: segment limits and dwell policy. */
'use strict';
const RY_SEGMENTS = [
  { from: 'R01', to: 'R02', vLimit: 180 },
  { from: 'R02', to: 'R03', vLimit: 250 },
  { from: 'R03', to: 'R13', vLimit: 320 },
  { from: 'R13', to: 'R21', vLimit: 350 },
  { from: 'R13', to: 'SA02', vLimit: 350 },
  { from: 'SA02', to: 'SA06', vLimit: 300 },
  { from: 'SA02', to: 'SK01', vLimit: 150 },
  { from: 'SK01', to: 'SK05', vLimit: 180 },
  { from: 'SK05', to: 'BL04', vLimit: 70 },
  { from: 'BL04', to: 'BL05', vLimit: 140 }
];
const RY_DWELL = { default: 60, overrides: { R01: 90, R13: 90, SA02: 90 } };
const RY_TRAIN_PROFILE = { name: 'CR400BF-like', vMaxKmh: 350, accelMps2: 0.6, decelMps2: 0.7 };
if (typeof module !== 'undefined') module.exports = { RY_SEGMENTS, RY_DWELL, RY_TRAIN_PROFILE };

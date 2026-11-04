/* RY-NETWORK.JS — Ryānkai physical model: main line + SA + SK (BL excluded). */
'use strict';
const RY_SEGMENTS = [
  { from: 'R01', to: 'R02', vLimit: 180 },
  { from: 'R02', to: 'R03', vLimit: 250 },
  { from: 'R03', to: 'R13', vLimit: 320 },
  { from: 'R13', to: 'R21', vLimit: 350 },
  { from: 'R13', to: 'SA01', vLimit: 350 },
  { from: 'SA01', to: 'SA02', vLimit: 350 },
  { from: 'SA02', to: 'SA03', vLimit: 350 },
  { from: 'SA03', to: 'SA04', vLimit: 350 },
  { from: 'SA04', to: 'SA05', vLimit: 350 },
  { from: 'SA05', to: 'SA06', vLimit: 350 },
  { from: 'SA06', to: 'SA07', vLimit: 350 },
  { from: 'SA07', to: 'SA08', vLimit: 350 },
  { from: 'SA08', to: 'SA09', vLimit: 350 },
  { from: 'SA04', to: 'SK01', vLimit: 200 },
  { from: 'SK01', to: 'SK02', vLimit: 200 },
  { from: 'SK02', to: 'SK03', vLimit: 200 },
  { from: 'SK03', to: 'SK04', vLimit: 200 },
  { from: 'SK04', to: 'SK05', vLimit: 200 },
  { from: 'SK05', to: 'SK06', vLimit: 200 },
  { from: 'SK02', to: 'SK02-1', vLimit: 120 }
];
const RY_DWELL = { default: 60, overrides: { R01: 90, R13: 90, SA02: 90 } };
const RY_TRAIN_PROFILE = { name: 'CR400BF-like', vMaxKmh: 350, accelMps2: 0.6, decelMps2: 0.7 };
if (typeof module !== 'undefined') module.exports = { RY_SEGMENTS, RY_DWELL, RY_TRAIN_PROFILE };

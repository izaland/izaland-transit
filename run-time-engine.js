/* RUN-TIME-ENGINE.JS — shared kinematic run-time calculator for IZX. */
'use strict';
const RunTimeEngine = (() => {
  const PROFILE = { vMaxKmh: 350, accelMps2: 0.6, decelMps2: 0.7 };
  function _mps(kmh) { return kmh / 3.6; }
  function segmentRunSec(km, vLimitKmh) {
    const lenM = km * 1000;
    const vCruise = Math.min(_mps(PROFILE.vMaxKmh), _mps(vLimitKmh));
    const a = PROFILE.accelMps2, b = PROFILE.decelMps2;
    const vPeak = Math.min(vCruise, Math.sqrt((2 * lenM * a * b) / (a + b)));
    const accelM = (vPeak * vPeak) / (2 * a);
    const decelM = (vPeak * vPeak) / (2 * b);
    const cruiseM = Math.max(0, lenM - accelM - decelM);
    return vPeak / a + vPeak / b + cruiseM / vPeak;
  }
  function dwellSec(code, dwellConfig) {
    return (dwellConfig && dwellConfig.overrides && dwellConfig.overrides[code]) ?? (dwellConfig ? dwellConfig.default : 60);
  }
  return { PROFILE, segmentRunSec, dwellSec };
})();
if (typeof module !== 'undefined') module.exports = { RunTimeEngine };

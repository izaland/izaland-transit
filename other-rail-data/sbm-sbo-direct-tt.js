/* ================================================================
   SBM-SBO-DIRECT-TT.JS
   Direct SB service: SBM01 ↔ SBO01, every 10 minutes.
   Southbound: SBM01 → SBM11 → SBO10 → SBO01.
   Northbound: SBO01 → SBO10 → SBM11 → SBM01.
   Trips reuse the full station metadata from SBO_LINES so the
   Journey Planner can render and search them correctly.
================================================================ */
'use strict';
(function(){
const SOUTH = [
  'SBM01','SBM02','SBM03','SBM04','SBM05','SBM06','SBM07','SBM08','SBM09','SBM10','SBM11',
  'SBO10','SBO09','SBO08','SBO07','SBO06','SBO05','SBO04','SBO03','SBO02','SBO01'
];
const NORTH = [...SOUTH].reverse();
const sec = x => { const [h,m] = x.split(':').map(Number); return h*3600 + m*60; };

function install(){
  const api  = window.SBMLocalTimetable;
  const line = (typeof SBO_LINES !== 'undefined') ? SBO_LINES.SBM : null;
  if (!api || !api.ready || !line) { setTimeout(install, 50); return; }
  if (api.__sbmSboDirectInstalled) return;
  api.__sbmSboDirectInstalled = true;

  const byCode = {};
  line.stations.forEach(s => {
    byCode[s.code] = { ...s, lineId:'SBM', network:'suburban', color:line.color };
  });

  function timeline(seq, start){
    let t = start;
    const out = [];
    seq.forEach((code, i) => {
      const st = byCode[code];
      if (!st) return;
      if (i) {
        const prev = byCode[seq[i-1]];
        const d = Math.abs(st.km - prev.km);
        t += (d / 90) * 3600 * 1.07 + 45;
      }
      const arr = t;
      if (i && i < seq.length - 1) t += 45;
      out.push({ ...st, arr: Math.round(arr), dep: Math.round(t) });
    });
    return out;
  }

  function addDirection(prefix, seq, first, last){
    for (let t = sec(first); t <= sec(last); t += 600) {
      const stops = timeline(seq, t);
      if (stops.length !== seq.length) continue;
      api.trips.push({
        id: prefix + t,
        m20Kind: 'LO',
        sbmKind: 'LO',
        stops
      });
    }
  }

  addDirection('SBM_SBO_S_', SOUTH, '05:00', '24:20');
  addDirection('SBM_SBO_N_', NORTH, '05:07', '24:27');

  api.trips.sort((a,b) => a.stops[0].dep - b.stops[0].dep);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', install, { once:true });
} else {
  install();
}
})();

/* ================================================================
   CITYLINER-ROUTER.JS — Router CityLiner (CL32)
   Estratto da journey-planner.html.
   Dipende da: cl-data.js, cl-tt.js, unified-router.js (caricati prima).
   Caricare DOPO unified-router.js.
================================================================ */
(function(){

function _clMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function _clSearch(from, to, depTime) {
  const depMin = _clMin(depTime);
  const out = [];

  for (const tt of Object.values(CL32_TIMETABLE)) {
    for (const trips of [tt.down, tt.up]) {
      for (const trip of trips) {
        const stops = trip.arrivals;
        const i = stops.findIndex(s => s.code === from);
        const j = stops.findIndex(s => s.code === to);
        if (i === -1 || j === -1 || j <= i) continue;
        if (stops[i].arrival == null || stops[j].arrival == null) continue; 

        const boardMin = _clMin(stops[i].arrival);
        if (boardMin < depMin) continue;

        const leg = {
          network: 'CL',
          lineId: 'CL',
          color: CL_LINE.color,
          svcName: CL32.name,
          svcLogical: 'CL32',
          trainNumber: 'CL32',
          tripId: 'CL32-' + trip.pattern + '-' + trip.departure,
          boardCode: from,
          boardName: CL_ST[from].n,
          boardDep: stops[i].arrival,
          alightCode: to,
          alightName: CL_ST[to].n,
          alightArr: stops[j].arrival,
          km: Math.abs(CL_ST[to].km - CL_ST[from].km),
          intermediateStops: stops.slice(i + 1, j)
            .filter(s => s.arrival != null)
            .map(s => ({
              code: s.code,
              name: CL_ST[s.code].n,
              arr: s.arrival,
              dep: s.arrival,
            })),
        };

        out.push({
          legs: [leg],
          departureTime: stops[i].arrival,
          arrivalTime: stops[j].arrival,
          totalMinutes: _clMin(stops[j].arrival) - boardMin,
          totalKm: leg.km,
          transfers: 0,
          transferNodes: [],
          transferWalkMin: [],
          transferWaitMin: [],
        });
      }
    }
  }
  return out;
}

IZXUnifiedRouter.registerRouter('CL', {
  allStations: () => Object.entries(CL_ST).map(([code, s]) => ({ code, name: s.n })),
  hasStation: (code) => !!CL_ST[code],
  search: (from, to, depTime, opts) => {
    try {
      return _clSearch(from, to, depTime);
    } catch (e) {
      console.error('CL search error:', e);
      return [];
    }
  },
});

})();

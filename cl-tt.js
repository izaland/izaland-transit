/* ================================================================
   CL-TT.JS — CityLiner (CL) · Servizio CL32 "Nijisnore"
   Orari SIMMETRICI: R01 e R02 partono da entrambi i capolinea.
   R01 (tutte le fermate): 06:30–18:30 ogni 2h
   R02 (espresso):         07:30–19:30 ogni 2h
   Sovrapposizione: un treno ogni ora nelle stazioni principali.

   Gli arrivi usano l'indice della stazione nella lista completa
   CL_CANONICAL_ORDER, così anche R02 legge i cumulativi giusti.
================================================================ */
'use strict';

/* Tempi cumulativi di percorrenza da Riyatoma, in minuti decimali */
const CL32_R01_CUM_MIN = [
  0, 9.15, 34.0833, 49, 71.85, 89.75,
  104.15, 118.3, 129.4167, 147.3, 159.6,
];

const CL32_R02_CUM_MIN = [
  0, null, 27.9333, 42.85, 64.7, 82.6,
  null, null, 106.8667, null, 134.1667,
];

const CL32_PATTERNS = {
  R01: {
    stops: CL_CANONICAL_ORDER,
    cum: CL32_R01_CUM_MIN,
    downDepartures: ['06:30', '08:30', '10:30', '12:30', '14:30', '16:30', '18:30'],
    upDepartures:   ['06:30', '08:30', '10:30', '12:30', '14:30', '16:30', '18:30'],
  },
  R02: {
    stops: ['CL321', 'CL323', 'CL324', 'CL325', 'CL326', 'CL329', 'CL3211'],
    cum: CL32_R02_CUM_MIN,
    downDepartures: ['07:30', '09:30', '11:30', '13:30', '15:30', '17:30', '19:30'],
    upDepartures:   ['07:30', '09:30', '11:30', '13:30', '15:30', '17:30', '19:30'],
  },
};

const CL32_LAYOVER_MIN = 15; // riferimento operativo, non usato per derivare le partenze

function clMinutesToHHMM(min) {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

function clBuildTimetable(patternId) {
  const p = CL32_PATTERNS[patternId];
  const down = [];
  const up = [];

  for (const dep of p.downDepartures) {
    const [h, m] = dep.split(':').map(Number);
    const depMin = h * 60 + m;

    down.push({
      service: 'CL32',
      pattern: patternId,
      from: 'CL321',
      to: 'CL3211',
      departure: dep,
      arrivals: p.stops.map(code => {
        const idx = CL_CANONICAL_ORDER.indexOf(code);
        return {
          code,
          arrival: p.cum[idx] == null ? null : clMinutesToHHMM(depMin + p.cum[idx]),
        };
      }),
    });
  }

  for (const dep of p.upDepartures) {
    const [h, m] = dep.split(':').map(Number);
    const depMin = h * 60 + m;
    const lastCum = p.cum[CL_CANONICAL_ORDER.indexOf(p.stops[p.stops.length - 1])];

    up.push({
      service: 'CL32',
      pattern: patternId,
      from: 'CL3211',
      to: 'CL321',
      departure: dep,
      arrivals: p.stops.slice().reverse().map(code => {
        const idx = CL_CANONICAL_ORDER.indexOf(code);
        return {
          code,
          arrival: p.cum[idx] == null ? null
            : clMinutesToHHMM(depMin + (lastCum - p.cum[idx])),
        };
      }),
    });
  }

  return { down, up };
}

const CL32_TIMETABLE = {
  R01: clBuildTimetable('R01'),
  R02: clBuildTimetable('R02'),
};

if (typeof module !== 'undefined') {
  module.exports = { CL32_TIMETABLE, clBuildTimetable };
}

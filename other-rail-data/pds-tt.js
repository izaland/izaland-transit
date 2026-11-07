/* ================================================================
   PDS-TT.JS — Poridake–Sumāra Line (PDS)
   Orari simmetrici: 63 min 33 s percorrenza commerciale.
   Base: 1 treno/ora per direzione.
   Rinforzi mattutini e pomeridiani/serali.
================================================================ */

'use strict';

/* Offset cumulativi dalla stazione di partenza, in secondi.
   La percorrenza include 60 s di sosta in ogni stazione intermedia
   e margini per precedenze a Toramukada e Umehte. */
const PDS_CUM_SEC = [
  0,      /* PDS01 Poridake */
  143,    /* PDS02 Munasamui */
  343,    /* PDS03 Kera */
  553,    /* PDS04 Poridake Hakuwin */
  755,    /* PDS05 Chibe */
  999,    /* PDS06 Warogata */
  1329,   /* PDS07 Ukosuba */
  1541,   /* PDS08 Tsudenda */
  1835,   /* PDS09 Toramukada */
  2275,   /* PDS10 Bonatsue */
  2564,   /* PDS11 Shirukauri */
  2789,   /* PDS12 Umehte */
  3245,   /* PDS13 Takapori */
  3540,   /* PDS14 Nari-Sumāra */
  3813,   /* PDS15 Sumāra */
];

const PDS_TOTAL_SEC = PDS_CUM_SEC[PDS_CUM_SEC.length - 1]; /* 3813 s = 63:33 */

function pdsSecToHHMM(sec) {
  const m = ((Math.round(sec) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

function pdsHhmmToSec(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 3600 + m * 60;
}

function pdsBuildTrip(depHHMM, direction) {
  const depSec = pdsHhmmToSec(depHHMM);
  const stops = direction === 'down'
    ? PDS_CANONICAL_ORDER
    : PDS_CANONICAL_ORDER.slice().reverse();

  const arrivals = stops.map((code, i) => {
    const idx = PDS_CANONICAL_ORDER.indexOf(code);
    const offset = direction === 'down'
      ? PDS_CUM_SEC[idx]
      : PDS_TOTAL_SEC - PDS_CUM_SEC[idx];
    return {
      code,
      arrival: pdsSecToHHMM(depSec + offset),
    };
  });

  return {
    service: 'PDS',
    direction,
    from: stops[0],
    to: stops[stops.length - 1],
    departure: depHHMM,
    arrivals,
  };
}

const PDS_BASE_SUMARA = [];
for (let h = 5; h <= 22; h++) {
  PDS_BASE_SUMARA.push(`${String(h).padStart(2,'0')}:35`);
}
PDS_BASE_SUMARA.push('22:55'); /* corsa speciale */

const PDS_BASE_PORIDAKE = [];
for (let h = 5; h <= 22; h++) {
  PDS_BASE_PORIDAKE.push(`${String(h).padStart(2,'0')}:50`);
}

const PDS_REINFORCEMENTS_SUMARA = ['07:16','07:46','08:16','08:46'];
const PDS_REINFORCEMENTS_PORIDAKE = ['14:20','17:25','18:25','19:25'];

const PDS_TIMETABLE = {
  down: [
    ...PDS_BASE_SUMARA.map(t => pdsBuildTrip(t, 'down')),
    ...PDS_REINFORCEMENTS_SUMARA.map(t => pdsBuildTrip(t, 'down')),
  ],
  up: [
    ...PDS_BASE_PORIDAKE.map(t => pdsBuildTrip(t, 'up')),
    ...PDS_REINFORCEMENTS_PORIDAKE.map(t => pdsBuildTrip(t, 'up')),
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { PDS_TIMETABLE, pdsBuildTrip, PDS_TOTAL_SEC };
}

/* ================================================================
   PDS-DATA.JS — Poridake–Sumāra Line (PDS) · 登館-洲麻良線
   Linea regionale Izarail · categoria "local line"
   Capolinea: PDS01 Poridake ↔ PDS15 Sumāra
   Lunghezza: 69,42 km · 15 stazioni

   Servizio: Local (omnibus) tutte le fermate.
   Frequenza base: 1 treno/ora per direzione.
   Rinforzi mattutini (Sumāra→Poridake) e pomeridiani/serali
   (Poridake→Sumāra).

   Interscambi:
     PDS01 Poridake ↔ CL326 / SA04 / SN05
     PDS09 Toramukada ↔ CL327
     PDS12 Umehte ↔ CL328
     PDS15 Sumāra ↔ CL329
================================================================ */

'use strict';

const PDS_INTERCHANGE = {
  PDS01: ['CL326', 'SA04', 'SN05'],
  PDS09: ['CL327'],
  PDS12: ['CL328'],
  PDS15: ['CL329'],
};

const PDS_LINES = {
  PDS: {
    id: 'PDS',
    name: 'Poridake–Sumāra Line',
    nameJa: '登館-洲麻良線',
    color: '#000000',
    operator: 'Izarail',
    type: 'regional',
    category: 'local',
    circular: false,
    totalKm: 69.42,
    totalStations: 15,
    headwayPeak: 60,
    headwayOffPeak: 60,
    stations: [
      { code:'PDS01', name:'Poridake',         kanji:'登館',     km: 0.00 },
      { code:'PDS02', name:'Munasamui',        kanji:'鬼開',     km: 1.70 },
      { code:'PDS03', name:'Kera',             kanji:'佳良',     km: 3.17 },
      { code:'PDS04', name:'Poridake Hakuwin', kanji:'登館學院', km: 5.30 },
      { code:'PDS05', name:'Chibe',            kanji:'',         km: 6.92 },
      { code:'PDS06', name:'Warogata',         kanji:'深泉',     km:10.81 },
      { code:'PDS07', name:'Ukosuba',          kanji:'霞京',     km:15.86 },
      { code:'PDS08', name:'Tsudenda',         kanji:'',         km:21.12 },
      { code:'PDS09', name:'Toramukada',       kanji:'',         km:28.33 },
      { code:'PDS10', name:'Bonatsue',         kanji:'',         km:37.19 },
      { code:'PDS11', name:'Shirukauri',       kanji:'荒沼',     km:43.97 },
      { code:'PDS12', name:'Umehte',           kanji:'',         km:46.92 },
      { code:'PDS13', name:'Takapori',         kanji:'浚登',     km:56.96 },
      { code:'PDS14', name:'Nari-Sumāra',      kanji:'東洲麻良', km:63.95 },
      { code:'PDS15', name:'Sumāra',           kanji:'洲麻良',   km:69.42 },
    ],
  },
};

const PDS_SERVICES = [
  {
    id: 'PDS1',
    desc: 'Local (omnibus)',
    fromCode: 'PDS01',
    toCode: 'PDS15',
    headway: 60,
    firstDep: '05:50',
    lastDep: '22:50',
    stops: [],
    vMaxKmh: 150,
    dwellSec: 60,
    extraDepartures: ['14:20','17:25','18:25','19:25'],
  },
  {
    id: 'PDS1',
    desc: 'Local (omnibus)',
    fromCode: 'PDS15',
    toCode: 'PDS01',
    headway: 60,
    firstDep: '05:35',
    lastDep: '22:35',
    stops: [],
    vMaxKmh: 150,
    dwellSec: 60,
    extraDepartures: ['07:16','07:46','08:16','08:46'],
  },
];

if (typeof SUBURBAN_LINES !== 'undefined') {
  Object.assign(SUBURBAN_LINES, PDS_LINES);
}

if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
  for (const [code, partners] of Object.entries(PDS_INTERCHANGE)) {
    if (!SUBURBAN_INTERCHANGE[code]) SUBURBAN_INTERCHANGE[code] = [];
    for (const p of partners) {
      if (!SUBURBAN_INTERCHANGE[code].includes(p)) SUBURBAN_INTERCHANGE[code].push(p);
    }
  }
}

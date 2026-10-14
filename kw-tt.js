/* ================================================================
   KW-TT.JS — Kwōkei Line · Timetable & Services (W1–W4)
   Dipende da: suburban-data.js (SUBURBAN_LINES.KW), caricato PRIMA di
   suburban-router.js. Formato compatibile con _svcTrips() (come TS_SERVICES).

   Servizi (partenze da KW00, minuti fissi):
     W1 Local            KW00–KW32  :01 :13 :25 :37 :49  (headway 12)  05:00–23:59
     W2 Peak Local Short KW00–KW17  :08 :28 :55          06–09, 17–20
     W3 Rapid            KW00–KW32  :15 :45              07:00–22:00,
                                    sospeso 06:00–08:30 e 18:00–21:00
     W4 Commuter Rapid   KW00–KW32  :15 :45              06:00–08:30, 18:00–21:00

   Velocità W3/W4: vMaxKmh 175; segmenti KW29→KW32 limitati a 135 km/h
   (vLimitKmh applicato sotto alle stazioni KW29, KW30, KW31).
   W1/W2 non hanno vMaxKmh: restano sul modello segSpeedKmh.

   Nota: il router genera le partenze con headway costante dentro
   ogni finestra (peakWindows). I minuti fissi si ottengono allineando
   l'inizio finestra al minuto voluto. W2 (:08 :28 :55) è irregolare:
   è espresso come tre sotto-orari (stesso id 'W2', headway 60).
================================================================ */
'use strict';

const _KW_W3_STOPS = ['KW00','KW01','KW03','KW06','KW10','KW11','KW17','KW18','KW22','KW29','KW32'];
const _KW_W4_STOPS = ['KW00','KW01','KW06','KW10','KW11','KW17','KW22','KW23','KW24','KW25','KW26','KW27','KW28','KW29','KW30','KW31','KW32'];

const _KW_W2_WINDOWS = (mm) => [
  { from: `06:${mm}`, to: `08:${mm}` },
  { from: `17:${mm}`, to: `19:${mm}` },
];

const KW_SERVICES = [
  {
    id: 'W1', desc: 'Local — Kishagoi-Exhibitown ↔ Yamakoga',
    fromCode: 'KW00', toCode: 'KW32',
    firstDep: '05:01', lastDep: '23:49',
    headway: 12, stops: [], dwellSec: 30,
  },
  {
    id: 'W2', desc: 'Peak Local Short — KW00 ↔ KW17 (:08)',
    fromCode: 'KW00', toCode: 'KW17',
    peakWindows: _KW_W2_WINDOWS('08'),
    headway: 60, stops: [], dwellSec: 30,
  },
  {
    id: 'W2', desc: 'Peak Local Short — KW00 ↔ KW17 (:28)',
    fromCode: 'KW00', toCode: 'KW17',
    peakWindows: _KW_W2_WINDOWS('28'),
    headway: 60, stops: [], dwellSec: 30,
  },
  {
    id: 'W2', desc: 'Peak Local Short — KW00 ↔ KW17 (:55)',
    fromCode: 'KW00', toCode: 'KW17',
    peakWindows: _KW_W2_WINDOWS('55'),
    headway: 60, stops: [], dwellSec: 30,
  },
  {
    id: 'W3', desc: 'Rapid — KW00 ↔ KW32',
    fromCode: 'KW00', toCode: 'KW32',
    peakWindows: [
      { from: '08:45', to: '17:45' },
      { from: '21:15', to: '21:45' },
    ],
    headway: 30, stops: _KW_W3_STOPS, dwellSec: 30, vMaxKmh: 175,
  },
  {
    id: 'W4', desc: 'Commuter Rapid — KW00 ↔ KW32',
    fromCode: 'KW00', toCode: 'KW32',
    peakWindows: [
      { from: '06:15', to: '08:15' },
      { from: '18:15', to: '20:45' },
    ],
    headway: 30, stops: _KW_W4_STOPS, dwellSec: 30, vMaxKmh: 175,
  },
];

/* Limite 135 km/h sui segmenti KW29→KW30→KW31→KW32 (solo servizi con vMaxKmh) */
if (typeof SUBURBAN_LINES !== 'undefined' && SUBURBAN_LINES.KW) {
  for (const st of SUBURBAN_LINES.KW.stations) {
    if (['KW29', 'KW30', 'KW31'].includes(st.code)) st.vLimitKmh = 135;
  }
}

if (typeof module !== 'undefined') {
  module.exports = { KW_SERVICES };
}

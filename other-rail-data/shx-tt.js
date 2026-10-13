/* ================================================================
   SHX-TT.JS — Shubaru Express · Timetable (SX Rail)
   ================================================================
   Dipende da: suburban-data.js, other-rail-data/shx-data.js
   Caricare DOPO shx-data.js e dopo suburban-router.js nell'HTML.

   Direzioni:
     SB = SHX19 → SHX01   (id servizio: SXn)
     NB = SHX01 → SHX19   (id servizio: SXn_NB)

   Servizi (pattern fermate: vedi matrice sotto):
     SX1  Local            ogni 8 min tutto il giorno
                           SB 05:30 – 22:51 · NB 05:49 – 23:48
     SX2  Rapid            ogni 12 min tutto il giorno, tranne quando
                           circolano SX3 e SX4
     SX3  Limited Express  corse fisse
                           SB (da SHX19): 07:16, 07:46, 08:16, 08:46
                           NB (da SHX01): 18:05, 18:35, 18:55, 19:15,
                                          19:35, 19:55, 20:25
     SX4  Commuter Express ogni 12 min
                           SB 07:00 – 09:00 da SHX19
                           NB 17:30 – 20:30 da SHX01

   Matrice fermate (x = ferma, | = passa)
     stazione  SX1 SX2 SX3 SX4
     SHX19      x   x   x   x
     SHX18      x   x   x   x
     SHX17      x   x   |   x
     SHX16      x   |   |   x
     SHX15      x   |   |   x
     SHX14      x   x   |   x
     SHX13      x   |   |   |
     SHX12      x   x   |   x
     SHX11      x   |   |   |
     SHX10      x   |   |   |
     SHX09      x   x   x   x
     SHX08      x   |   |   |
     SHX07      x   x   |   |
     SHX06      x   x   x   x
     SHX05      x   x   |   |
     SHX04      x   x   |   |
     SHX03      x   x   x   x
     SHX02      x   x   |   x
     SHX01      x   x   x   x

   NOTE / ASSUNZIONI (da verificare)
   - SX2: l'orario base 12 min è ancorato al primo treno di SX1
     (SB 05:30, NB 05:49) e si ferma a ridosso delle fasce di SX3/SX4:
       SB  05:30–06:54 e 09:06–22:42
       NB  05:49–17:25 e 20:37–23:37
     L'orario di fine servizio di SX2 non era specificato: ho usato
     quello di SX1 come limite.
   - SX3 è modellato come corse singole (firstDep = lastDep) per restare
     compatibile con il formato servizi esistente (headway fittizio).
   - Tempi di percorrenza: calcolati dal router (km / velocità). Qui non
     è definita alcuna velocità per pattern (rapid/express più veloci).
================================================================ */
'use strict';

/* ================================================================
   Pattern fermate (SB = SHX19 → SHX01)
================================================================ */
const _SHX_ORDER_SB = [
  'SHX19','SHX18','SHX17','SHX16','SHX15','SHX14','SHX13','SHX12','SHX11',
  'SHX10','SHX09','SHX08','SHX07','SHX06','SHX05','SHX04','SHX03','SHX02','SHX01',
];

const _SHX_STOPPING = {
  SX1: new Set(_SHX_ORDER_SB),
  SX2: new Set(['SHX19','SHX18','SHX17','SHX14','SHX12','SHX09','SHX07','SHX06',
                'SHX05','SHX04','SHX03','SHX02','SHX01']),
  SX3: new Set(['SHX19','SHX18','SHX09','SHX06','SHX03','SHX01']),
  SX4: new Set(['SHX19','SHX18','SHX17','SHX16','SHX15','SHX14','SHX12','SHX09',
                'SHX06','SHX03','SHX02','SHX01']),
};

const _shxStopsSB = id => _SHX_ORDER_SB.filter(c => _SHX_STOPPING[id].has(c));
const _shxStopsNB = id => [..._shxStopsSB(id)].reverse();

/* Servizio con frequenza fissa in una finestra */
function _shxSvc(id, dir, desc, firstDep, lastDep, headway) {
  const sb = dir === 'SB';
  const base = id.split('_')[0];
  return {
    id:       sb ? base : base + '_NB',
    desc:     desc + (sb ? ' · SHX19 → SHX01' : ' · SHX01 → SHX19'),
    fromCode: sb ? 'SHX19' : 'SHX01',
    toCode:   sb ? 'SHX01' : 'SHX19',
    firstDep, lastDep, headway,
    stops:    sb ? _shxStopsSB(base) : _shxStopsNB(base),
  };
}

/* Corse singole a orario fisso (firstDep = lastDep) */
function _shxFixed(id, dir, desc, times) {
  return times.map(t => _shxSvc(id, dir, desc, t, t, 60));
}

/* ================================================================
   SHX_TT_SERVICES — formato compatibile con SuburbanRouter _svcTrips()
================================================================ */
const SHX_TT_SERVICES = [

  /* ---- SX1 Local — ogni 8 min tutto il giorno ---- */
  _shxSvc('SX1', 'SB', 'Local', '05:30', '22:51', 8),
  _shxSvc('SX1', 'NB', 'Local', '05:49', '23:48', 8),

  /* ---- SX2 Rapid — ogni 12 min, escluse fasce SX3/SX4 ---- */
  _shxSvc('SX2', 'SB', 'Rapid', '05:30', '06:54', 12),
  _shxSvc('SX2', 'SB', 'Rapid', '09:06', '22:42', 12),
  _shxSvc('SX2', 'NB', 'Rapid', '05:49', '17:25', 12),
  _shxSvc('SX2', 'NB', 'Rapid', '20:37', '23:37', 12),

  /* ---- SX3 Limited Express — corse fisse ---- */
  ..._shxFixed('SX3', 'SB', 'Limited Express', ['07:16', '07:46', '08:16', '08:46']),
  ..._shxFixed('SX3', 'NB', 'Limited Express',
    ['18:05', '18:35', '18:55', '19:15', '19:35', '19:55', '20:25']),

  /* ---- SX4 Commuter Express — ogni 12 min in fascia ---- */
  _shxSvc('SX4', 'SB', 'Commuter Express', '07:00', '09:00', 12),
  _shxSvc('SX4', 'NB', 'Commuter Express', '17:30', '20:30', 12),
];

/* ================================================================
   REGISTRAZIONE nel SuburbanRouter
================================================================ */
if (typeof SuburbanRouter !== 'undefined' && typeof SUBURBAN_LINES !== 'undefined' && SUBURBAN_LINES.SHX) {
  SuburbanRouter.register({
    lineId:      'SHX',
    meta:        {
      name:  'Shubaru Express',
      label: 'SX',
      kanji: '',
      color: '#B22222',
      cls:   'suburban',
    },
    stations:    SUBURBAN_LINES.SHX.stations,
    services:    SHX_TT_SERVICES,
    interchange: Object.fromEntries(
      Object.entries(SUBURBAN_INTERCHANGE).filter(([k]) => k.startsWith('SHX'))
    ),
  });
}

if (typeof module !== 'undefined') {
  module.exports = { SHX_TT_SERVICES };
}

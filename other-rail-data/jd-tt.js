/* ================================================================
   JD-TT.JS — Juwon-Kodōn Line · Timetable
   中央湖東線
   ================================================================
   Dipende da: suburban-data.js (SUBURBAN_LINES.JD)

   Servizi:
     JD1          JD01 ↔ JD25  tutte le fermate  headway 8 min
                  - da JD01 (Sainðaul Central): 05:42 – 23:42
                  - da JD25 (Ninokawa):         05:42 – 23:42

     JD1_PEAK_SB  rinforzo mattutino JD25 → JD01 (Ninokawa → Sainðaul)
                  headway 15 min · 06:35 – 09:35 da JD25
                  Headway effettivo su JD25→JD01 in fascia peak:
                    8 min base + 15 min rinforzo → treno ogni ~5 min

     JD1_PEAK_NB  rinforzo serale JD01 → JD25 (Sainðaul → Ninokawa)
                  headway 15 min · 17:10 – 20:10 da JD01
                  Headway effettivo su JD01→JD25 in fascia peak:
                    8 min base + 15 min rinforzo → treno ogni ~5 min

   NOTE:
     — I servizi JD1_PEAK_* si sovrappongono al base JD1/JD1_NB;
       il router somma i trip e ne beneficia l’headway effettivo.
     — Servizio Rapid (JD2) previsto in futuro; placeholder commentato.
================================================================ */
'use strict';

/* ================================================================
   Stops JD1 — Local, tutte le fermate
================================================================ */
const _JD_JD1_STOPS_SB = [
  'JD01','JD02','JD03','JD04','JD05','JD06','JD07','JD08','JD09','JD10',
  'JD11','JD12','JD13','JD14','JD15','JD16','JD17','JD18','JD19','JD20',
  'JD21','JD22','JD23','JD24','JD25',
];
const _JD_JD1_STOPS_NB = [..._JD_JD1_STOPS_SB].reverse();

/* ================================================================
   JD_TT_SERVICES — formato compatibile con SuburbanRouter _svcTrips()
================================================================ */
const JD_TT_SERVICES = [
  /* ----------------------------------------------------------------
     JD1 — Servizio base tutto il giorno
  ---------------------------------------------------------------- */
  {
    id:       'JD1',
    desc:     'Local — Sainðaul Central → Ninokawa',
    fromCode: 'JD01',
    toCode:   'JD25',
    firstDep: '05:42',
    lastDep:  '23:42',
    headway:  8,
    stops:    _JD_JD1_STOPS_SB,
  },
  {
    id:       'JD1_NB',
    desc:     'Local NB — Ninokawa → Sainðaul Central',
    fromCode: 'JD25',
    toCode:   'JD01',
    firstDep: '05:42',
    lastDep:  '23:42',
    headway:  8,
    stops:    _JD_JD1_STOPS_NB,
  },

  /* ----------------------------------------------------------------
     JD1_PEAK_SB — Rinforzo mattutino (direzione Sainðaul)
     Fascia: 06:35 – 09:35 da Ninokawa (JD25)
     Headway effettivo in fascia peak JD25→JD01: ~5 min
  ---------------------------------------------------------------- */
  {
    id:       'JD1_PEAK_SB',
    desc:     'Local peak AM — Ninokawa → Sainðaul Central (rinforzo)',
    fromCode: 'JD25',
    toCode:   'JD01',
    firstDep: '06:35',
    lastDep:  '09:35',
    headway:  15,
    stops:    _JD_JD1_STOPS_NB,
  },

  /* ----------------------------------------------------------------
     JD1_PEAK_NB — Rinforzo serale (direzione Ninokawa)
     Fascia: 17:10 – 20:10 da Sainðaul Central (JD01)
     Headway effettivo in fascia peak JD01→JD25: ~5 min
  ---------------------------------------------------------------- */
  {
    id:       'JD1_PEAK_NB',
    desc:     'Local peak PM — Sainðaul Central → Ninokawa (rinforzo)',
    fromCode: 'JD01',
    toCode:   'JD25',
    firstDep: '17:10',
    lastDep:  '20:10',
    headway:  15,
    stops:    _JD_JD1_STOPS_SB,
  },

  /*
  // JD2 — Rapid (placeholder)
  // Decommentare quando il servizio viene istituito.
  {
    id:       'JD2',
    desc:     'Rapid SB — Sainðaul Central → Ninokawa',
    fromCode: 'JD01',
    toCode:   'JD25',
    firstDep: 'HH:MM',
    lastDep:  'HH:MM',
    headway:  16,
    stops:    ['JD01', /* fermate selezionate */ 'JD25'],
  },
  {
    id:       'JD2_NB',
    desc:     'Rapid NB — Ninokawa → Sainðaul Central',
    fromCode: 'JD25',
    toCode:   'JD01',
    firstDep: 'HH:MM',
    lastDep:  'HH:MM',
    headway:  16,
    stops:    ['JD25', /* fermate selezionate */ 'JD01'],
  },
  */
];

/* ================================================================
   REGISTRAZIONE nel SuburbanRouter
   Dipende da: suburban-data.js (SUBURBAN_LINES.JD, SUBURBAN_INTERCHANGE)
   Caricare questo file dopo suburban-data.js nell'HTML.
================================================================ */
if (typeof SuburbanRouter !== 'undefined') {
  SuburbanRouter.register({
    lineId:      'JD',
    meta:        {
      name:  'Juwon-Kodōn Line',
      kanji: '中央湖東線',
      color: '#FF66CC',
      cls:   'suburban',
    },
    stations:    SUBURBAN_LINES.JD.stations,
    services:    JD_TT_SERVICES,
    interchange: Object.fromEntries(
      Object.entries(SUBURBAN_INTERCHANGE).filter(([k]) => k.startsWith('JD'))
    ),
  });
}

if (typeof module !== 'undefined') {
  module.exports = { JD_TT_SERVICES };
}

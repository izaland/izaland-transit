/* ================================================================
   KS-DATA.JS — Kawasabu Line · 嘉夬苫線
   ================================================================
   Capolinea: KS01 Niji-Kawayatsu ↔ KS28 Sabullan
   47.08 km · 28 stazioni

   Servizi:
     KS1  Local       KS01 ↔ KS28  tutte le fermate  6 tph (headway 10 min)
                        Prima corsa SB: 05:12 da KS01
                        Prima corsa NB: 05:03 da KS28
                        Ultima corsa SB: 23:52 da KS01
                        Ultima corsa NB: 23:43 da KS28

     KS3  Rapid       KS01 ↔ KS28  2 tph (headway 30 min)
                        Fermate: KS01 KS02 KS06 KS11 KS16 KS18 KS21 KS23 KS26 KS28
                        Prima corsa SB: 06:21 da KS01
                        Prima corsa NB: 06:18 da KS28
                        Sospeso nelle fasce Semi-Rapid (09:21–10:01 e 17:09–18:09)

     KS2  Semi-Rapid  KS01 ↔ KS28  2 tph (headway 30 min)
                        Fermate: KS01 KS02 KS06 KS08 KS09 KS10 KS11 KS12 KS13
                                 KS14 KS15 KS16 KS17 KS18 KS21 KS23 KS26 KS28
                        Fascia mattina: dep KS01 09:31 · dep KS28 09:28
                        Fascia sera:    dep KS01 17:39 · dep KS28 17:40
                        (una corsa per fascia per direzione)

   Logica fasce Semi-Rapid:
     Il Semi-Rapid sostituisce il Rapid nelle due finestre:
       SB: 09:31 e 17:39 da KS01
       NB: 09:28 e 17:40 da KS28
     Le finestre Rapid escludono queste corse tramite lastDep
     opportunamente scelto (vedi commenti sotto).

   Headway Rapid SB — analisi corse:
     06:21 · 06:51 · 07:21 · 07:51 · 08:21 · 08:51 · 09:21
     [pausa: 09:51 sarebbe Semi-Rapid]
     10:01 · 10:31 · … · 17:01 · 17:31
     [pausa: 17:31 next = 18:01 ma quella delle 17:39 è Semi-Rapid]
     18:09 · 18:39 · … · 22:39

     → Rapid SB window 1: firstDep=06:21 lastDep=09:21
     → Rapid SB window 2: firstDep=10:01 lastDep=17:31
     → Rapid SB window 3: firstDep=18:09 lastDep=22:39

   Headway Rapid NB — analisi corse:
     06:18 · 06:48 · 07:18 · 07:48 · 08:18 · 08:48 · 09:18
     [09:28 = Semi-Rapid]
     09:48 · 10:18 · … · 17:18
     [17:40 = Semi-Rapid]
     18:08 · 18:38 · … · 22:38

     → Rapid NB window 1: firstDep=06:18 lastDep=09:18
     → Rapid NB window 2: firstDep=09:48 lastDep=17:18  (nota: 17:18 non 17:38,
       perché 17:48 sarebbe 8 min dopo il Semi-Rapid 17:40 — mantenuto)
     → Rapid NB window 3: firstDep=18:08 lastDep=22:38

   Nota: _svcTrips usa firstDep per SB e calcola firstDep+fullTravelSec per NB.
   Per il NB usiamo due entry separate (fromCode=KS28) per sfruttare
   peakWindows con from/to assoluti.
================================================================ */
'use strict';

const KS_SERVICES = [

  /* ──────────────────────────────────────────────────
     KS1 — Local (tutte le fermate) · SB  KS01→KS28
  ────────────────────────────────────────────────── */
  {
    id:       'KS1',
    desc:     'Local',
    fromCode: 'KS01',
    toCode:   'KS28',
    headway:  10,           // 6 tph
    stops:    [],           // vuoto = ferma ovunque
    firstDep: '05:12',
    lastDep:  '23:52',
  },

  /* ──────────────────────────────────────────────────
     KS1 — Local (tutte le fermate) · NB  KS28→KS01
  ────────────────────────────────────────────────── */
  {
    id:       'KS1',
    desc:     'Local',
    fromCode: 'KS28',
    toCode:   'KS01',
    headway:  10,
    stops:    [],
    firstDep: '05:03',
    lastDep:  '23:43',
  },

  /* ──────────────────────────────────────────────────
     KS3 — Rapid · SB  KS01→KS28
     Tre finestre per escludere i due slot Semi-Rapid
  ────────────────────────────────────────────────── */
  {
    id:       'KS3',
    desc:     'Rapid',
    fromCode: 'KS01',
    toCode:   'KS28',
    headway:  30,           // 2 tph
    stops:    ['KS01','KS02','KS06','KS11','KS16','KS18','KS21','KS23','KS26','KS28'],
    peakWindows: [
      { from: '06:21', to: '09:21' },
      { from: '10:01', to: '17:31' },
      { from: '18:09', to: '22:39' },
    ],
  },

  /* ──────────────────────────────────────────────────
     KS3 — Rapid · NB  KS28→KS01
  ────────────────────────────────────────────────── */
  {
    id:       'KS3',
    desc:     'Rapid',
    fromCode: 'KS28',
    toCode:   'KS01',
    headway:  30,
    stops:    ['KS01','KS02','KS06','KS11','KS16','KS18','KS21','KS23','KS26','KS28'],
    peakWindows: [
      { from: '06:18', to: '09:18' },
      { from: '09:48', to: '17:18' },
      { from: '18:08', to: '22:38' },
    ],
  },

  /* ──────────────────────────────────────────────────
     KS2 — Semi-Rapid · SB  KS01→KS28
     Due finestre puntuali (una corsa ciascuna)
  ────────────────────────────────────────────────── */
  {
    id:       'KS2',
    desc:     'Semi-Rapid',
    fromCode: 'KS01',
    toCode:   'KS28',
    headway:  30,
    stops:    [
      'KS01','KS02','KS06',
      'KS08','KS09','KS10',
      'KS11','KS12','KS13','KS14','KS15',
      'KS16','KS17','KS18',
      'KS21','KS23','KS26','KS28',
    ],
    peakWindows: [
      { from: '09:31', to: '09:31' },   // fascia mattina: unica corsa
      { from: '17:39', to: '17:39' },   // fascia sera:    unica corsa
    ],
  },

  /* ──────────────────────────────────────────────────
     KS2 — Semi-Rapid · NB  KS28→KS01
  ────────────────────────────────────────────────── */
  {
    id:       'KS2',
    desc:     'Semi-Rapid',
    fromCode: 'KS28',
    toCode:   'KS01',
    headway:  30,
    stops:    [
      'KS01','KS02','KS06',
      'KS08','KS09','KS10',
      'KS11','KS12','KS13','KS14','KS15',
      'KS16','KS17','KS18',
      'KS21','KS23','KS26','KS28',
    ],
    peakWindows: [
      { from: '09:28', to: '09:28' },
      { from: '17:40', to: '17:40' },
    ],
  },
];

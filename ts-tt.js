/* ================================================================
   TS-TT.JS — Tandan-Senpyan Line · Timetable & Services
   ================================================================
   Dipende da: ts-data.js, suburban-data.js, suburban-router.js

   Servizi:
     T1  AI01 ↔ TS20  ogni 20 min
         - da TS20 (Shutazai):   07:00–22:30
         - da AI01 (Aikami):     05:30–21:45
     T2  TS20 ↔ TS07  ogni 40 min  07:20–21:00 (da TS20)
         (rinforzo: insieme a T1 → headway effettivo 20 min su TS20↔TS07)

   Tratto condiviso KW (TS09/KW04 – TS01/KW32):
     I treni TS usano i binari KW Rapid.
     KW W3 Rapid firstDep da KW32: 09:25, headway 20 min.
     Treni TS sfasati di +10 min → firstDep da TS01/KW32: 09:35.
     Fuori finestra W3 (prima delle 09:25 / dopo le 16:55),
     i treni TS circolano soli sul tratto condiviso.

   Ordine stops T1 (direzione SB = da AI01 verso TS20):
     AI01 → AI02 → AI03 → TS24/AI04 → TS10 → TS11 → TS12 → TS13
          → TS09 → TS08 → TS07 → TS06 → TS05 → TS04 → TS03
          → TS02 → TS01 → TS23 → TS22 → TS21
     (TS21 è capolinea nord, ma la direzione "SB" dal punto di vista
      del router è: dal ramo AI verso nord/Yamakoga/TS21)

   Attenzione: la linea ha topologia ad "H" —
     AI01 ──────────────────────── TS24
                                     │
     TS20 ── TS19 ── ... ── TS13 ── TS10
                                     │
             (sezione KW condivisa)
                                     │
                     TS09 ── TS08 ── TS07 ── ... ── TS21

   Il router SuburbanRouter gestisce linee lineari: registriamo
   T1 e T2 come due servizi lineari separati con stops[] espliciti.
================================================================ */
'use strict';

/* ================================================================
   Stops T1 — servizio completo AI01 → TS21 (via Sainðaul + KW)
   Direzione "SB" (from=AI01 → to=TS21 nel router)
================================================================ */
const _TS_T1_STOPS_SB = [
  'AI01','AI02','AI03','TS24',
  'TS10','TS11','TS12','TS13',
  'TS09','TS08','TS07','TS06','TS05','TS04','TS03','TS02','TS01',
  'TS23','TS22','TS21',
];
const _TS_T1_STOPS_NB = [..._TS_T1_STOPS_SB].reverse();

/* ================================================================
   Stops T2 — rinforzo TS20 ↔ TS07/KW10 (Kawayatsu)
================================================================ */
const _TS_T2_STOPS_SB = [
  'TS20','TS19','TS18','TS17','TS16','TS15','TS14','TS13',
  'TS09','TS08','TS07',
];
const _TS_T2_STOPS_NB = [..._TS_T2_STOPS_SB].reverse();

/* ================================================================
   TS_SERVICES — formato compatibile con SuburbanRouter _svcTrips()
   (stesso schema di KW_SERVICES)
================================================================ */
const TS_SERVICES = [
  {
    id:       'T1',
    desc:     'Completo — Aikami Eigau ↔ Ikotsuha (via Sainðaul Central)',
    fromCode: 'AI01',
    toCode:   'TS21',
    // Direzione SB (AI01→TS21): prima partenza 05:30 da AI01
    // Direzione NB (TS21→AI01): prima partenza 07:00 da TS20
    // Il router usa firstDep come offset da capolinea "from":
    // registriamo due entry direzionali esplicite sotto.
    firstDep: '05:30',
    lastDep:  '21:45',
    headway:  20,
    stops:    _TS_T1_STOPS_SB,
  },
  {
    id:       'T1_NB',
    desc:     'Completo NB — Ikotsuha ↔ Aikami Eigau',
    fromCode: 'TS21',
    toCode:   'AI01',
    firstDep: '07:00',
    lastDep:  '22:30',
    headway:  20,
    stops:    _TS_T1_STOPS_NB,
  },
  {
    id:       'T2',
    desc:     'Rinforzo — Shutazai ↔ Kawayatsu (TS20↔TS07)',
    fromCode: 'TS20',
    toCode:   'TS07',
    firstDep: '07:20',
    lastDep:  '21:00',
    headway:  40,
    stops:    _TS_T2_STOPS_SB,
  },
  {
    id:       'T2_NB',
    desc:     'Rinforzo NB — Kawayatsu ↔ Shutazai',
    fromCode: 'TS07',
    toCode:   'TS20',
    firstDep: '07:40',   // +20 min offset (T2 parte da TS07 ~20 min dopo da TS20)
    lastDep:  '21:20',
    headway:  40,
    stops:    _TS_T2_STOPS_NB,
  },
];

/*
  NOTA CADENZA TRATTO CONDIVISO KW (TS09–TS01):
  KW W3 Rapid firstDep da KW32/TS01: 09:25 ogni 20 min.
  T1 da TS01 (in direzione Sainðaul): sfasato +10 min → 09:35 ogni 20 min.
  Risultato: su TS01–TS09 passa un treno ogni ~10 min in fascia 09:25–16:55.
  Fuori questa fascia il T1 circola solo (headway 20 min).
*/

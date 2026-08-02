/* ================================================================
   AX DATA MODULE — Airport Express (AX)
   Tre rami con tratta comune AX00–AX03 (Riimibaiken):
     · Ramo Est    (AX03–AX09): Riimibaiken → Sabullan via Sainðaul Central
     · Ramo Bajikoe (AX03–AX23): Riimibaiken → Onnojaris
     · Ramo Sakamuso (AX21–AX34): Showanul → Illashiya
   Servizio omnibus unico per ramo.
   Frequenze: 15 min ramo Est, 20 min Bajikoe e Sakamuso.
   Cinematica: EMU vmax 130 km/h, a=1.0 m/s², dwell 30s
================================================================ */

/* ----------------------------------------------------------------
   STAZIONI — tratta comune + rami
   km: distanza progressiva da AX00 (Terminal 4)
   Tratta comune + ramo Est aggiornati con distanze reali.
   Ramo Bajikoe aggiornato con distanze reali (2026-07-21).
---------------------------------------------------------------- */
const AX_ST = {
  /* Tratta comune */
  AX00: {n:"Asunahama Airport Terminal 4", k:"",                              b:"common", km:0},
  AX01: {n:"Asunahama Airport",            k:"作安浜国際空港", b:"common", km:3.094},
  AX02: {n:"Rinkūn City",             k:"દાપ્‌ડેઃપ્ ટાઠા", b:"common", km:8.203},
  AX03: {n:"Riimibaiken",                  k:"𠝏卞",             b:"common", km:13.493},

  /* Ramo Est: Riimibaiken → Sabullan */
  AX04: {n:"Kasakuri",                     k:"鯛巻",                  b:"est",    km:26.493},
  AX05: {n:"Shimamera",                    k:"渠瀬田",            b:"est",    km:31.643},
  AX07: {n:"Herubori",                     k:"杏登",                  b:"est",    km:38.403},
  AX06: {n:"Sainðaul Central",        k:"作安崎中央", b:"est",   km:41.793},
  AX08: {n:"Osenude",                      k:"防斉",                  b:"est",    km:51.653},
  AX09: {n:"Sabullan",                     k:"ટરૃેધ્ધપ્", b:"est", km:59.553},

  /* Ramo Bajikoe: Riimibaiken → Onnojaris
     Distanze reali da AX03 (km 13.493):
       AX03→AX20  10.310 km  → 23.803 km
       AX20→AX21   6.300 km  → 30.103 km
       AX21→AX22  32.650 km  → 62.753 km
       AX22→AX23  25.210 km  → 87.963 km
  */
  AX20: {n:"Eigandan Senpyan",             k:"永玵段船駢", b:"baj",   km:23.803},
  AX21: {n:"Showanul",                     k:"書瓦崎",            b:"baj",   km:30.103},
  AX22: {n:"Sasatotsu",                    k:"佐々橋",            b:"baj",   km:62.753},
  AX23: {n:"Onnojaris",                    k:"",                              b:"baj",   km:87.963},

  /* Ramo Sakamuso: Showanul → Illashiya */
  AX30: {n:"Shin-Erigowa",                 k:"新繰緊",            b:"sak",   km:119.37},
  AX31: {n:"Sejisebu",                     k:"井終",                  b:"sak",   km:126.41},
  AX32: {n:"Yutsukabul",                   k:"柚鶴武崎",      b:"sak",   km:139.41},
  AX33: {n:"Akkosoi",                      k:"種綱",                  b:"sak",   km:160.67},
  AX34: {n:"Illashiya",                    k:"狐棲",                  b:"sak",   km:162.17},
};

/* ----------------------------------------------------------------
   CANONICAL ORDER per ogni ramo (oggetto per riferimento interno)
---------------------------------------------------------------- */
const AX_CANONICAL_COMMON = ["AX00","AX01","AX02","AX03"];
const AX_CANONICAL_EST    = ["AX03","AX04","AX05","AX07","AX06","AX08","AX09"];
const AX_CANONICAL_BAJ    = ["AX03","AX20","AX21","AX22","AX23"];
const AX_CANONICAL_SAK    = ["AX21","AX30","AX31","AX32","AX33","AX34"];

/* Ordine completo per ogni servizio (tratta comune + ramo) */
const AX_CANONICAL_ORDER = {
  EST: ["AX00","AX01","AX02","AX03","AX04","AX05","AX07","AX06","AX08","AX09"],
  BAJ: ["AX00","AX01","AX02","AX03","AX20","AX21","AX22","AX23"],
  SAK: ["AX21","AX30","AX31","AX32","AX33","AX34"],
};

/* Array flat deduplicato: usato da TTEngine e LERouter che si
   aspettano line.CANONICAL come array iterabile. */
const AX_CANONICAL_FLAT = [
  ...new Set([
    ...AX_CANONICAL_ORDER.EST,
    ...AX_CANONICAL_ORDER.BAJ,
    ...AX_CANONICAL_ORDER.SAK,
  ])
];

/* ----------------------------------------------------------------
   TIMETABLE — offset in secondi da AX00

   Cinematica: vmax 130 km/h, a=1.0 m/s², dwell 30s

   Ramo EST (tratta comune AX00–AX03 + ramo Est):
     Valori ricalcolati con distanze reali.

   Ramo BAJ (tratta comune AX00–AX03 + ramo Bajikoe):
     AX00–AX03 = 572s (condiviso con EST)
     AX03→AX20  10.310 km  352s  → AX20:  924s
     AX20→AX21   6.300 km  241s  → AX21: 1165s
     AX21→AX22  32.650 km  970s  → AX22: 2135s
     AX22→AX23  25.210 km  764s  → AX23: 2899s

   Ramo SAK: offset da AX21 (valori provvisori da aggiornare)
---------------------------------------------------------------- */
const AX_TT = {
  EST: {
    AX00:    0,
    AX01:  152,
    AX02:  359,
    AX03:  572,
    AX04:  998,
    AX05: 1207,
    AX07: 1460,
    AX06: 1620,
    AX08: 1959,
    AX09: 2244,
  },
  BAJ: {
    AX00:    0,
    AX01:  152,
    AX02:  359,
    AX03:  572,
    AX20:  924,
    AX21: 1165,
    AX22: 2135,
    AX23: 2899,
  },
  SAK: {
    AX21:    0,
    AX30:  117,
    AX31:  400,
    AX32:  862,
    AX33: 1571,
    AX34: 1688,
  },
};

/* ----------------------------------------------------------------
   SERVIZI
---------------------------------------------------------------- */
const AX_SVC = {
  EST: {
    coeff: 1.00,
    name:  "Airport Express (Est)",
    cls:   "svc-AX-est",
    color: "#CC99FF",
    stops: ["AX00","AX01","AX02","AX03","AX04","AX05","AX07","AX06","AX08","AX09"],
  },
  BAJ: {
    coeff: 1.00,
    name:  "Airport Express (Bajikoe)",
    cls:   "svc-AX-baj",
    color: "#CC99FF",
    stops: ["AX00","AX01","AX02","AX03","AX20","AX21","AX22","AX23"],
  },
  SAK: {
    coeff: 1.00,
    name:  "Airport Express (Sakamuso)",
    cls:   "svc-AX-sak",
    color: "#CC99FF",
    stops: ["AX21","AX30","AX31","AX32","AX33","AX34"],
  },
};

/* ----------------------------------------------------------------
   FREQUENZE (treni/ora)
---------------------------------------------------------------- */
const AX_FREQ = {
  EST: {offpeak: 4, peak: 4},  /* ogni 15 min */
  BAJ: {offpeak: 3, peak: 3},  /* ogni 20 min */
  SAK: {offpeak: 3, peak: 3},  /* ogni 20 min */
};

const AX_PEAK_WINDOWS = [
  {start:"07:00", end:"09:30"},
  {start:"17:00", end:"20:00"},
];

/* ----------------------------------------------------------------
   REGISTRO CENTRALE AX
---------------------------------------------------------------- */
const AX_LINES = {
  AX: {
    id:           "AX",
    label:        "Airport Express",
    shortLabel:   "AX",
    color:        "#CC99FF",
    textColor:    "#1a0033",
    inboundDir:   "NB",
    inboundLabel:  "↑ Inbound — Asunahama Airport",
    outboundLabel: "↓ Outbound",
    ST:        AX_ST,
    CANONICAL: AX_CANONICAL_FLAT,
    SVC:       AX_SVC,
    TT:        AX_TT,
    FREQ:      AX_FREQ,
    PEAK:      AX_PEAK_WINDOWS,
    /* ----------------------------------------------------------------
       Interscambi AX ↔ IZX
       Ogni entry mappa il codice AX al primo partner IZX; partner
       aggiuntivi nella stessa stazione fisica sono elencati in
       INTERCHANGE_EXTRA e vengono letti da buildPartnerMap() in
       routing.js per costruire il grafo completo di trasferimento.

       AX06 = Sainðaul Central: interscambio con KE (K01), RY (R01), EI (E01)
       AX01 = Asunahama Airport: interscambio con KE (K03)
       AX07 = Herubori:          interscambio con Loop Line (LL17)
                                  (routing suburbano via SUBURBAN_INTERCHANGE)
       AX21 = Showanul:          interscambio con KE Sakamuso (K102)
       AX34 = Illashiya:         interscambio con KE Sakamuso (K104)
    ---------------------------------------------------------------- */
    INTERCHANGE: {
      AX06: "K01",  /* Sainðaul Central ↔ KE K01 (primario) */
      AX01: "K03",  /* Asunahama Airport ↔ KE K03           */
      AX21: "K102", /* Showanul ↔ KE Sakamuso K102           */
      AX34: "K104", /* Illashiya ↔ KE Sakamuso K104          */
    },
    /* Partner aggiuntivi per stazioni con più di un nodo IZX.
       routing.js legge questo campo in buildPartnerMap().
       Formato: { codiceAX: ["codeA", "codeB", ...] }          */
    INTERCHANGE_EXTRA: {
      AX06: ["R01", "E01"],  /* Sainðaul Central ↔ RY R01 e EI E01 */
    },
    /* Nota: AX07 ↔ LL17 (Herubori) è registrato in SUBURBAN_INTERCHANGE
       in suburban-data.js e gestito da SuburbanRouter. Non figura qui
       perché LL17 non è un nodo IZX ma un nodo della rete suburbana.   */
    TERMINUS_SPLIT: {
      EST: [{terminus:"AX09", weight:1}],
      BAJ: [{terminus:"AX23", weight:1}],
      SAK: [{terminus:"AX34", weight:1}],
    },
    OFFSETS: {EST:0, BAJ:7, SAK:12},
    SHORT_WORKING: [],
    /* ── TARIFF ─────────────────────────────────────────────────────────────── */
    tariff: {
      operator:   "IZX",
      zone:       "airport",
      category:   "limited_exp",
      baseFixed:  4.50,
      basePer100: 0.195,
      classes:    ["standard"],
    },
  },
};

/* ----------------------------------------------------------------
   Integra AX in LE_LINES così che LERouter possa vedere le stazioni
   Airport Express. AX appartiene alla rete LE (tokkyū tier), NON
   a IZX_LINES.

   Ordine di caricamento script richiesto:
     1. izx-data.js   — definisce IZX_LINES
     2. le-data.js    — definisce LE_LINES (registro vuoto)
     3. ax-data.js    — popola LE_LINES con AX
     4. le-router.js  — LERouter legge LE_LINES
     5. unified-router.js + registrazione router
---------------------------------------------------------------- */
Object.assign(LE_LINES, AX_LINES);

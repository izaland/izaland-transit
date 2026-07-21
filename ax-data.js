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
  AX01: {n:"Asunahama Airport",            k:"\u4f5c\u5b89\u6d5c\u56fd\u969b\u7a7a\u6e2f", b:"common", km:3.094},
  AX02: {n:"Rink\u016bn City",             k:"\u0aa6\u0abe\u0aaa\u0acd\u200c\u0aa1\u0ac7\u0a83\u0aaa\u0acd \u0a9f\u0abe\u0aa0\u0abe", b:"common", km:8.203},
  AX03: {n:"Riimibaiken",                  k:"\ud841\udf4f\u535e",             b:"common", km:13.493},

  /* Ramo Est: Riimibaiken → Sabullan */
  AX04: {n:"Kasakuri",                     k:"\u9bdb\u5dfb",                  b:"est",    km:26.493},
  AX05: {n:"Shimamera",                    k:"\u6e20\u702c\u7530",            b:"est",    km:31.643},
  AX07: {n:"Herubori",                     k:"\u674f\u767b",                  b:"est",    km:38.403},
  AX06: {n:"Sain\u00f0aul Central",        k:"\u4f5c\u5b89\u5d0e\u4e2d\u592e", b:"est",   km:41.793},
  AX08: {n:"Osenude",                      k:"\u9632\u6589",                  b:"est",    km:51.653},
  AX09: {n:"Sabullan",                     k:"\u0a9f\u0ab0\u0ac3\u0ac7\u0aa7\u0acd\u0aa7\u0aaa\u0acd", b:"est", km:59.553},

  /* Ramo Bajikoe: Riimibaiken → Onnojaris
     Distanze reali da AX03 (km 13.493):
       AX03→AX20  10.310 km  → 23.803 km
       AX20→AX21   6.300 km  → 30.103 km
       AX21→AX22  32.650 km  → 62.753 km
       AX22→AX23  25.210 km  → 87.963 km
  */
  AX20: {n:"Eigandan Senpyan",             k:"\u6c38\u73b5\u6bb5\u8239\u99e2", b:"baj",   km:23.803},
  AX21: {n:"Showanul",                     k:"\u66f8\u74e6\u5d0e",            b:"baj",   km:30.103},
  AX22: {n:"Sasatotsu",                    k:"\u4f50\u3005\u6a4b",            b:"baj",   km:62.753},
  AX23: {n:"Onnojaris",                    k:"",                              b:"baj",   km:87.963},

  /* Ramo Sakamuso: Showanul → Illashiya (km da aggiornare) */
  AX30: {n:"Shin-Erigowa",                 k:"\u65b0\u7e70\u7dca",            b:"sak",   km:119.37},
  AX31: {n:"Sejisebu",                     k:"\u4e95\u7d42",                  b:"sak",   km:126.41},
  AX32: {n:"Yutsukabul",                   k:"\u67da\u9db4\u6b66\u5d0e",      b:"sak",   km:139.41},
  AX33: {n:"Akkosoi",                      k:"\u7a2e\u7db1",                  b:"sak",   km:160.67},
  AX34: {n:"Illashiya",                    k:"\u72d0\u68f2",                  b:"sak",   km:162.17},
};

/* ----------------------------------------------------------------
   CANONICAL ORDER per ogni ramo
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

/* ----------------------------------------------------------------
   TIMETABLE — offset in secondi da AX00
   Tratta comune + ramo Est: ricalcolati con vmax 130 km/h, a=1.0 m/s², dwell 30s
   Ramo BAJ: aggiornato con distanze reali (da ricalcolare con cinematica)
   Ramo SAK: valori provvisori (da aggiornare)
   Ramo SAK: offset da AX21
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
    AX20: 3106,
    AX21: 3894,
    AX22: 4361,
    AX23: 4939,
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
    inboundLabel:  "\u2191 Inbound \u2014 Asunahama Airport",
    outboundLabel: "\u2193 Outbound",
    ST:       AX_ST,
    CANONICAL: AX_CANONICAL_ORDER,
    SVC:      AX_SVC,
    TT:       AX_TT,
    FREQ:     AX_FREQ,
    PEAK:     AX_PEAK_WINDOWS,
    /* Interscambi AX ↔ IZX */
    INTERCHANGE: {
      AX06: "K01",  /* Sainðaul Central ↔ KE/RY/EI */
      AX04: "K02",  /* Kasakuri ↔ KE Niji-Sainðaul */
      AX01: "K03",  /* Asunahama Airport ↔ KE */
      AX21: "K102", /* Showanul ↔ KE Sakamuso branch */
      AX34: "K104", /* Illashiya ↔ KE Sakamuso branch */
    },
    TERMINUS_SPLIT: {
      EST: [{terminus:"AX09", weight:1}],
      BAJ: [{terminus:"AX23", weight:1}],
      SAK: [{terminus:"AX34", weight:1}],
    },
    OFFSETS: {EST:0, BAJ:7, SAK:12},
  },
};

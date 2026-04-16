/* ================================================================
   IZX RYĀNKAI — Station & Service Data
   Loaded by izx-ticket.html before the main script.
   Naming convention mirrors the Keishin data already in izx-ticket.html.
================================================================ */

/* ---- Stations ---- */
const RY_ST = {
  R01:  {n:"Sain\u00f0aul Central",   k:"\u4f5c\u5b89\u5d0e\u4e2d\u592e", b:"main", km:0},
  R02:  {n:"Asaji Torimoshi",         k:"\u5b89\u4f50\u5bfa\u72db\u7bf9", b:"main", km:15.30},
  R03:  {n:"Shin-Enikezya",           k:"\u65b0\u76db\u72e9",             b:"main", km:35.19},
  R04:  {n:"Nari-Odanuri",            k:"\u6771\u88cf\u5c48",             b:"main", km:55.53},
  R05:  {n:"Todakuri-Tojirushi",      k:"\u675f\u5dfb\u7956\u9023",       b:"main", km:90.37},
  R06:  {n:"Isadashi",                k:"\u5b89\u6751",                   b:"main", km:129.89},
  R61:  {n:"Shin-Gomatsuki",          k:"\u65b0\u609f\u4e07\u539f",       b:"main", km:157.24},
  R07:  {n:"Beikejo",                 k:"\u5869\u6c17\u6761",             b:"main", km:171.68},
  R08:  {n:"Rinnajin",                k:"\u6797\u5948\u795e",             b:"main", km:192.72},
  R81:  {n:"Aihasa",                  k:"\u9593\u590f\u796d",             b:"main", km:204.54},
  R09:  {n:"Humabe Resort",           k:"",                               b:"main", km:242.02},
  R10:  {n:"Fures\u0101ri",           k:"\u7d43\u6cb3",                   b:"main", km:275.52},
  R11:  {n:"Kahenji-Nukkistama",      k:"\u9e7f\u8fd4\u5bfa",             b:"main", km:297.86},
  R12:  {n:"\u014cdakaida-Ranku",     k:"\u5927\u5200\u5d50\u4e45",       b:"main", km:318.47},
  R13:  {n:"Riyatoma",                k:"\u8ffd\u5e87",                   b:"main", km:369.19},
  R14:  {n:"K\u014dsa-Hannan",        k:"\u8003\u7802\u962a\u5357",       b:"main", km:415.70},
  R15:  {n:"Shin-Makkenoke",          k:"\u65b0\u5e73\u5742",             b:"main", km:440.63},
  R16:  {n:"Soritsun K\u014dwen",     k:"",                               b:"main", km:471.13},
  R17:  {n:"Hentsari-Donan",          k:"",                               b:"main", km:502.10},
  R18:  {n:"Rekefura-K\u014dwen",     k:"\u9577\u798f\u7530\u516c\u5712", b:"main", km:533.96},
  R19:  {n:"Chunnitai",               k:"\u79cb\u68ee",                   b:"main", km:568.60},
  R20:  {n:"Shin-Pekonai",            k:"\u65b0\u725b\u6ca2",             b:"main", km:586.14},
  R21:  {n:"Sannupuri",               k:"\u4e fe\u5c71",                  b:"main", km:628.75},
};

/* ---- Canonical order for the stop-pattern diagram ---- */
const RY_CANONICAL_ORDER = [
  "R01","R02","R03","R04","R05","R06","R61","R07","R08","R81",
  "R09","R10","R11","R12","R13","R14","R15","R16","R17","R18",
  "R19","R20","R21"
];

/* ---- Services ---- */
const RY_SVC = {
  L: {coeff:0.92, name:"Omnibus",      cls:"svc-L", color:"#6b7280",
      stops:["R01","R02","R03","R04","R05","R06","R61","R07","R08","R81","R09","R10","R11","R12","R13","R14","R15","R16","R17","R18","R19","R20","R21"]},
  K: {coeff:1.08, name:"Rapido AV",    cls:"svc-K", color:"#EA7501",
      stops:["R01","R02","R03","R06","R07","R08","R10","R13","R14","R15","R21"]},
  J: {coeff:1.08, name:"Rapido AV",    cls:"svc-J", color:"#C9211E",
      stops:["R01","R02","R03","R06","R07","R08","R10","R13","R14","R15","R21"]},
  G: {coeff:1.15, name:"Flagship AV",  cls:"svc-G", color:"#148466",
      stops:["R01","R02","R06","R08","R81","R10","R13","R14","R21"]},
  I: {coeff:1.15, name:"Flagship AV",  cls:"svc-I", color:"#1F6A39",
      stops:["R01","R02","R06","R10","R13","R15","R21"]},
  H: {coeff:1.15, name:"Flagship AV",  cls:"svc-H", color:"#50938A",
      stops:["R01","R02","R06","R10","R14","R15","R16","R17","R18","R19","R20","R21"]},
};

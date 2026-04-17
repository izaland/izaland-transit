/* ================================================================
   IZX DATA MODULE — Keishin (KE_) + Ryānkai (RY_)
   Loaded by izx-ticket.html before the main script.
================================================================ */

/* ----------------------------------------------------------------
   KEISHIN LINE
---------------------------------------------------------------- */
const KE_ST = {
  K01:  {n:"Sain\u00f0aul Central",        k:"\u4f5c\u5b89\u5d0e\u4e2d\u592e",  b:"main",   km:0},
  K02:  {n:"Niji-Sain\u00f0aul",            k:"\u897f\u4f5c\u5b89\u5d0e",      b:"main",   km:11.4},
  K03:  {n:"Asunahama Int'l Airport",     k:"\u5929\u5cf6\u570b\u969b\u7a7a\u6e2f", b:"main", km:35.4},
  K31:  {n:"Pyanuza",                     k:"",                              b:"cprime"},
  K32:  {n:"Nagayamatsu",                 k:"",                              b:"cprime"},
  K33:  {n:"Keishunneul",                 k:"",                              b:"cprime"},
  K04:  {n:"Hashimakori-Juwon",           k:"\u793a\u4e07\u98ef\u4e2d\u592e",  b:"main",   km:84.85},
  K05:  {n:"Wodoriha IR",                 k:"\u6f91\u9ad8 IR",               b:"main",   km:101.75},
  K06:  {n:"Shin-Eriraul",                k:"\u65b0\u7e70\u7f85\u5d0e",      b:"main",   km:122.97},
  K07:  {n:"Nappawa",                     k:"\u90a3\u854e\u8f2a",            b:"main",   km:144.68},
  K08:  {n:"Otsumi-Komishinan",           k:"\u5357\u53e4\u8fba\u5357",      b:"main",   km:185.39},
  K09:  {n:"Kamahoraya",                  k:"\u5bfa\u7a32\u91ce",            b:"main",   km:198.04},
  K101: {n:"Sakamuso",                    k:"\u671b\u5764",                  b:"saka"},
  K102: {n:"Showanul",                    k:"\u66f8\u74e6\u5d0e",            b:"saka"},
  K120: {n:"Panatsawa",                   k:"",                              b:"saka"},
  K103: {n:"Katayoshi Juwon",             k:"\u6cc9\u5cf0\u4e2d\u592e",      b:"saka"},
  K104: {n:"Illashiya",                   k:"\u72d0\u68b2",                  b:"saka"},
  K105: {n:"Ch\u014dpatsu",               k:"",                              b:"saka"},
  K106: {n:"Kohtos\u014dre",              k:"",                              b:"saka"},
  K160: {n:"Ikahoro K\u014dwen",          k:"",                              b:"saka"},
  K10:  {n:"Shin-Kichatsura Teba",        k:"\u65b0\u4e80\u8336\u5915\u99ac", b:"main",  km:252.52},
  K11:  {n:"Shin-Kashioka",               k:"\u65b0\u7b20\u4ed8",            b:"main",   km:296.64},
  K12:  {n:"Panaireki",                   k:"\u82e5\u6d66",                  b:"main",   km:345.01},
  K13:  {n:"Hy\u014dmonan Resort",         k:"\u88cf\u8302\u5357\u904a\u5712", b:"main",  km:386.29},
  K14:  {n:"Shin-Imihatsorul",            k:"\u65b0\u7acb\u9bad\u57fc",      b:"main",   km:427.14},
  K144: {n:"Tsirina Wents\u0101n",         k:"\u969c\u5185\u9280\u5c1a",      b:"main",   km:451.74},
  K15:  {n:"Naeba",                       k:"\u5185\u6ce2",                  b:"main",   km:465.21},
  K16:  {n:"Eyenniyul Juwon",             k:"\u7cf8\u4e94\u5d0e\u4e2d\u592e", b:"main",  km:499.04},
  K116: {n:"Yaseura",                     k:"\u8db3\u751f\u7530",            b:"main",   km:526.31},
  K17:  {n:"Warohan",                     k:"\u6df1\u5f4c",                  b:"main",   km:545.0},
  N1:   {n:"Naraki-Attawi",               k:"",                              b:"nankai", km:573.54},
  N2:   {n:"Satsokoibo",                  k:"\u9752\u888b",                  b:"nankai", km:598.539},
  N3:   {n:"Shin-Nuskajui",               k:"\u65b0\u5e83\u58c1",            b:"nankai", km:638.102},
  N4:   {n:"Daishin",                     k:"\u5927\u9032",                  b:"nankai", km:658.561},
};

const KE_CANONICAL_ORDER = [
  "K01","K02","K03",
  "K31","K32","K33",
  "K04","K05","K06","K07",
  "K08","K09",
  "K101","K102","K120","K103","K104","K105","K106","K160",
  "K10","K11","K12","K13","K14","K144","K15","K16","K116","K17",
  "N1","N2","N3","N4"
];

const KE_CP = {
  K01:0, K02:11.4, K03:35.4,
  K31:61.2, K32:86.12, K33:123.86,
  K08:159.39, K09:172.04, K10:226.52, K11:270.64, K12:319.01
};

const KE_SK = (function(){
  const sk = {
    K101:0, K102:6.969, K120:22.449, K103:47.87,
    K104:70.243, K105:97.858, K106:114.079, K160:140.75,
  };
  sk.K10 = 70.243 + 82.22;
  ["K11","K12","K13","K14","K144","K15","K16","K116","K17","N1","N2","N3","N4"].forEach(c => {
    sk[c] = sk.K10 + (KE_ST[c].km - 252.52);
  });
  return sk;
})();

const KE_SVC = {
  A:  {coeff:1.15, name:"Nonstop Express",       cls:"svc-A",  color:"#002A91",
       stops:["K01","K02","K03","K08","K10","K12","K17","N1","N2","N3","N4"]},
  B:  {coeff:1.00, name:"Semi-rapido",            cls:"svc-B",  color:"#1B71CB",
       stops:["K01","K02","K03","K04","K05","K06","K07","K08","K09","K10","K11","K12","K13","K14","K144","K15","K16","K116","K17","N1","N2","N3","N4"]},
  C:  {coeff:1.08, name:"Rapido",                 cls:"svc-C",  color:"#4a8fcc",
       stops:["K01","K02","K03","K06","K08","K09","K10","K11","K12","K13","K14","K144","K15","K16","K116","K17"]},
  Cp: {coeff:1.12, name:"Airport Bypass C\u2032", cls:"svc-Cp", color:"#0e7ca6",
       stops:["K01","K02","K03","K31","K32","K33","K08","K09","K10","K11","K12"]},
  D:  {coeff:1.08, name:"Sakamuso Rapido",        cls:"svc-D",  color:"#926ACA",
       stops:["K101","K104","K10","K11","K12","K13","K14","K144","K15","K16","K116","K17","N1","N2","N3","N4"]},
  E:  {coeff:1.10, name:"Sakamuso Express",       cls:"svc-E",  color:"#7c3aed",
       stops:["K101","K104","K160","K10","K12","K17","N1","N2","N3","N4"]},
  F:  {coeff:0.92, name:"Omnibus",                cls:"svc-F",  color:"#6b7280",
       stops:["K101","K102","K120","K103","K104","K105","K106","K160","K10","K11","K12","K13","K14","K144","K15","K16","K116","K17","N1","N2","N3","N4"]},
};

/* ----------------------------------------------------------------
   RYĀNKAI LINE
---------------------------------------------------------------- */
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
  R21:  {n:"Sannupuri",               k:"\u4e7e\u5c71",                   b:"main", km:628.75},
};

const RY_CANONICAL_ORDER = [
  "R01","R02","R03","R04","R05","R06","R61","R07","R08","R81",
  "R09","R10","R11","R12","R13","R14","R15","R16","R17","R18",
  "R19","R20","R21"
];

const RY_SVC = {
  L: {coeff:0.92, name:"Omnibus",     cls:"svc-L", color:"#6b7280",
      stops:["R01","R02","R03","R04","R05","R06","R61","R07","R08","R81","R09","R10","R11","R12","R13","R14","R15","R16","R17","R18","R19","R20","R21"]},
  K: {coeff:1.08, name:"Rapido AV",   cls:"svc-K", color:"#EA7501",
      stops:["R01","R02","R03","R06","R07","R08","R10","R13","R14","R15","R21"]},
  J: {coeff:1.08, name:"Rapido AV",   cls:"svc-J", color:"#C9211E",
      stops:["R01","R02","R03","R06","R07","R08","R10","R13","R14","R15","R21"]},
  G: {coeff:1.15, name:"Flagship AV", cls:"svc-G", color:"#148466",
      stops:["R01","R02","R06","R08","R81","R10","R13","R14","R21"]},
  I: {coeff:1.15, name:"Flagship AV", cls:"svc-I", color:"#1F6A39",
      stops:["R01","R02","R06","R10","R13","R15","R21"]},
  H: {coeff:1.15, name:"Flagship AV", cls:"svc-H", color:"#50938A",
      stops:["R01","R02","R06","R10","R14","R15","R16","R17","R18","R19","R20","R21"]},
};

/* ----------------------------------------------------------------
   EIRA LINE
---------------------------------------------------------------- */
const EI_ST = {
  E01: {n:"Sain\u00f0aul Central",        k:"\u4f5c\u5b89\u5d0e\u4e2d\u592e",  b:"main", km:0},
  E02: {n:"Kawayatsu",                    k:"\u5609\u592c\u82eb",               b:"main", km:19.16},
  E03: {n:"Shin-Abiro Kung\u014dsan",     k:"\u65b0\u736f\u8def\u30fb\u52f3\u525b\u5c71", b:"main", km:65.43},
  E04: {n:"Sahnajima Juwon",              k:"\u5f4c\u6e67\u4e2d\u592e",         b:"main", km:98.41},
  E05: {n:"Shirukami",                    k:"\u8352\u991f",                      b:"main", km:126.78},
  E06: {n:"Shin-Tsawazame W.-M.",         k:"\u65b0\u68ee\u5b97\u7de9\u7548\u5143", b:"main", km:158.76},
  E07: {n:"Arasano",                      k:"\u9727\u898b",                      b:"main", km:190.00},
  E08: {n:"Reilusahna Juwon",             k:"\u6e05\u6d66\u4e2d\u592e",         b:"main", km:250.86},
  E09: {n:"Shin-Mikotosamo",              k:"\u65b0\u5150\u5c71",               b:"main", km:279.77},
  E10: {n:"Natsuhiro-Kw\u014dpas",        k:"\u82dd\u6577\u30fb\u5149\u516b",   b:"main", km:308.06},
  E11: {n:"(Infill Station)",             k:"\u2014",                            b:"main", km:null},
  E12: {n:"Nagareki",                     k:"\u6cbc\u6d66",                      b:"main", km:375.49},
};

const EI_CANONICAL_ORDER = [
  "E01","E02","E03","E04","E05","E06","E07",
  "E08","E09","E10","E11","E12"
];

const EI_SVC = {
  N:  {coeff:1.00, name:"Nazionale",          cls:"svc-N",  color:"#32CD32",
       stops:["E01","E02","E03","E04","E05","E06","E07","E08","E09","E10","E12"]},
  M:  {coeff:1.08, name:"Minarajaki Express", cls:"svc-M",  color:"#228B22",
       stops:["E01","E04","E05","E08","E12"]},
  MF: {coeff:1.15, name:"Minarajaki Fast",    cls:"svc-MF", color:"#6A0DAD",
       stops:["E01","E08","E12"]},
  MI: {coeff:1.12, name:"Minarajaki Intercity",cls:"svc-MI",color:"#B8860B",
       stops:["E01","E04","E05","E08","E12"]},
  MS: {coeff:1.20, name:"Minarajaki Super",   cls:"svc-MS", color:"#00BFFF",
       stops:["E01","E04","E05","E08","E12"]},
};

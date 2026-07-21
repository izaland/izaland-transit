/* ================================================================
   FARE ENGINE — IZX Izaland Transit
   Estratto da izx-ticket.html (Step 2, 2026-07-21)
   Fix Step 3b (2026-07-21): ALL_ST ora include DI_ST, SA_ST, SN_ST

   Dipendenze (devono essere caricate prima):
     izx-data.js  → KE_ST, KE_SVC, KE_CP, KE_SK,
                    RY_ST, DI_ST, SA_ST, RY_SVC,
                    EI_ST, EI_SVC,
                    SN_ST, SN_SVC,
                    KE_CANONICAL_ORDER, RY_CANONICAL_ORDER,
                    EI_CANONICAL_ORDER, DI_CANONICAL_ORDER,
                    SN_CANONICAL_ORDER
     ax-data.js   → AX_ST, AX_SVC, AX_CANONICAL_ORDER

   Espone l'oggetto globale: IZXFare
================================================================ */

(function (global) {
  'use strict';

  /* ----------------------------------------------------------------
     COSTANTI
  ---------------------------------------------------------------- */
  const FIXED_FEE = 4.50;
  const USD_RATE  = 0.832;

  const HUB_VAL = 'HUB';
  const HUB_K   = 'K01';
  const HUB_R   = 'R01';
  const HUB_E   = 'E01';

  /* ----------------------------------------------------------------
     LOOKUP GLOBALI
     ALL_ST copre TUTTE le stazioni di tutti i data-module:
       KE_ST  — Keishin main + Nankai
       RY_ST  — Ryānkai main
       DI_ST  — Daidōn branch (DI1…DI14, DI131)
       SA_ST  — Seibu-Naeryuku SA/SK/BL branches
       SN_ST  — Seibu Naeryuku new line (SN01…SN08)
       EI_ST  — Eira line
       AX_ST  — Airport Express
  ---------------------------------------------------------------- */
  const ALL_ST  = Object.assign(
    {},
    KE_ST,
    RY_ST,
    DI_ST,
    SA_ST,
    SN_ST,
    EI_ST,
    AX_ST,
  );
  const ALL_SVC = Object.assign({}, KE_SVC, RY_SVC, SN_SVC, EI_SVC, AX_SVC);

  const KE_MAIN_SVCS = new Set(['A','B','C','Cp']);
  const KE_SAKA_SVCS = new Set(['D','E','F']);
  const RY_SVCS      = new Set(['L','K','J','G','I','IS','IL','H']);
  const EI_SVCS      = new Set(['N','M','MF','MI','MS']);
  const AX_SVCS      = new Set(['EST','BAJ','SAK']);
  const SN_SVCS      = new Set(['K','G_rapid','G_local']);
  const KE_SVCS      = new Set([...KE_MAIN_SVCS, ...KE_SAKA_SVCS]);

  /* ----------------------------------------------------------------
     COEFFICIENTI DI CLASSE
  ---------------------------------------------------------------- */
  const CLASS_C = { standard: 1.00, blue_seat: 1.55, yurani: 2.40 };
  const CLASS_L = { standard: 'Standard', blue_seat: 'Blue Seat', yurani: 'Yurani' };

  /* ----------------------------------------------------------------
     HELPERS: HUB + LINEA
  ---------------------------------------------------------------- */
  function resolveHub(code, svcKey) {
    if (code !== HUB_VAL) return code;
    if (RY_SVCS.has(svcKey)) return HUB_R;
    if (EI_SVCS.has(svcKey)) return HUB_E;
    return HUB_K;
  }

  function lineOf(code) {
    if (code === HUB_VAL)   return 'KE';
    if (AX_ST[code])        return 'AX';
    if (DI_ST[code])        return 'RY';
    if (SA_ST[code])        return 'RY';
    if (SN_ST[code])        return 'SN';
    if (RY_ST[code])        return 'RY';
    if (EI_ST[code])        return 'EI';
    return 'KE';
  }

  function isInterline(from, to) {
    if (from === HUB_VAL && to === HUB_VAL) return false;
    return lineOf(from) !== lineOf(to);
  }

  /* ----------------------------------------------------------------
     KM PROGRESSIVI E PREZZO
  ---------------------------------------------------------------- */
  function progKm(d) {
    if (d <= 0) return 0;
    let c = Math.min(d, 100) * 0.195;
    if (d > 100) c += Math.min(d - 100, 200) * 0.165;
    if (d > 300) c += (d - 300) * 0.14;
    return c;
  }

  function calcPrice(km, sc, cc) {
    return Math.round((FIXED_FEE + progKm(km)) * sc * cc * 100) / 100;
  }

  /* ----------------------------------------------------------------
     KM DI STAZIONE
  ---------------------------------------------------------------- */
  function stKm(code, svcKey) {
    const c = resolveHub(code, svcKey);
    if (AX_SVCS.has(svcKey)) return AX_ST[c] ? AX_ST[c].km : null;
    if (SN_SVCS.has(svcKey)) return SN_ST[c] ? SN_ST[c].km : null;
    if (RY_SVCS.has(svcKey)) {
      if (DI_ST[c]) return DI_ST[c].km;
      return RY_ST[c] ? RY_ST[c].km : null;
    }
    if (EI_SVCS.has(svcKey)) return EI_ST[c] ? EI_ST[c].km : null;
    /* KE */
    let kc = c;
    if (kc === 'K101' && KE_MAIN_SVCS.has(svcKey)) kc = 'K02';
    if (svcKey === 'Cp')           return KE_CP[kc] !== undefined ? KE_CP[kc] : null;
    if (KE_SAKA_SVCS.has(svcKey)) return KE_SK[kc] !== undefined ? KE_SK[kc] : null;
    return KE_ST[kc] ? KE_ST[kc].km : null;
  }

  function tariffKm(from, to, svcKey) {
    const kf = stKm(from, svcKey), kt = stKm(to, svcKey);
    if (kf === null || kt === null) return null;
    return Math.abs(kt - kf);
  }

  /* ----------------------------------------------------------------
     SERVES: verifica se un servizio collega from→to
  ---------------------------------------------------------------- */
  function serves(svcKey, from, to) {
    const f0   = resolveHub(from, svcKey);
    const t0   = resolveHub(to,   svcKey);
    const info = ALL_SVC[svcKey]; if (!info) return false;
    const stops = info.stops;
    const f = (f0 === 'K101' && KE_MAIN_SVCS.has(svcKey)) ? 'K02' : f0;
    const t = (t0 === 'K101' && KE_MAIN_SVCS.has(svcKey)) ? 'K02' : t0;
    const fi = stops.indexOf(f), ti = stops.indexOf(t);
    return fi !== -1 && ti !== -1 && fi !== ti;
  }

  /* ----------------------------------------------------------------
     SCONTO INTERLINEA
  ---------------------------------------------------------------- */
  function getDiscount(km) {
    if (km < 200)  return 0.05;
    if (km < 400)  return 0.08;
    if (km < 700)  return 0.10;
    if (km < 1000) return 0.12;
    return 0.15;
  }

  /* ----------------------------------------------------------------
     CALCOLA SEGMENTO SINGOLO
  ---------------------------------------------------------------- */
  function calcSegment(from, to, svcKey, classKey) {
    if (!serves(svcKey, from, to)) return null;
    const km = tariffKm(from, to, svcKey);
    if (!km || km <= 0) return null;
    return { km, price: calcPrice(km, ALL_SVC[svcKey].coeff, CLASS_C[classKey]) };
  }

  /* ----------------------------------------------------------------
     NOME STAZIONE
  ---------------------------------------------------------------- */
  function stName(code) {
    if (code === HUB_VAL) return ALL_ST[HUB_K] ? ALL_ST[HUB_K].n : 'Sain\u00f0aul Central';
    return ALL_ST[code] ? ALL_ST[code].n : code;
  }

  /* ----------------------------------------------------------------
     FORMATTAZIONE
  ---------------------------------------------------------------- */
  function fmt(n)  { return '\u0116\u202f' + n.toFixed(2); }
  function fusd(n) { return '(US$\u202f' + (n * USD_RATE).toFixed(2) + ')'; }

  /* ----------------------------------------------------------------
     API PUBBLICA
  ---------------------------------------------------------------- */
  global.IZXFare = {
    /* Costanti */
    FIXED_FEE,
    USD_RATE,
    HUB_VAL,
    CLASS_C,
    CLASS_L,

    /* Sets di servizi */
    KE_MAIN_SVCS,
    KE_SAKA_SVCS,
    KE_SVCS,
    RY_SVCS,
    EI_SVCS,
    AX_SVCS,
    SN_SVCS,

    /* Lookup */
    ALL_ST,
    ALL_SVC,

    /* Funzioni */
    resolveHub,
    lineOf,
    isInterline,
    progKm,
    calcPrice,
    stKm,
    tariffKm,
    serves,
    getDiscount,
    calcSegment,
    stName,
    fmt,
    fusd,
  };

})(window);

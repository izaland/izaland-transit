/* ================================================================
   SUBURBAN-INTERCHANGE-LL.JS
   Interscambi Loop Line → Metro (lato suburbano), cosi' che i
   collegamenti metro ↔ Loop Line siano bidirezionali.

   Caricare DOPO suburban-data.js (e dopo hd-data.js se presente).
   Non modifica voci esistenti: aggiunge solo i codici mancanti.

   LL05 Jufurai Kowen Niji ↔ M1636  (provvisorio 3 min, come lato M16)
   LL06 Punoidan           ↔ M1637, M122  (5 min a piedi, Tensari Omuhate)

   TODO: quando si rimette mano a suburban-data.js, spostare queste
   voci dentro SUBURBAN_INTERCHANGE e cancellare questo file.
================================================================ */
'use strict';

(function () {
  if (typeof SUBURBAN_INTERCHANGE === 'undefined') return;

  const ADD = {
    LL05: [{ code: 'M1636', transferMin: 3 }],
    LL06: [{ code: 'M1637', transferMin: 5 }, { code: 'M122', transferMin: 5 }],
  };

  const codeOf = (e) => (typeof e === 'string' ? e : e.code);

  Object.keys(ADD).forEach((st) => {
    const list = SUBURBAN_INTERCHANGE[st] || (SUBURBAN_INTERCHANGE[st] = []);
    ADD[st].forEach((entry) => {
      if (!list.some((e) => codeOf(e) === entry.code)) list.push(entry);
    });
  });
})();

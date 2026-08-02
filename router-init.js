/* ================================================================
   ROUTER-INIT.JS — Inizializzazione centralizzata dei router
   ================================================================
   Includere DOPO tutti i data file e DOPO unified-router.js,
   routing.js e le-router.js.

   Ordine consigliato degli <script> nella pagina HTML:
     1. ax-data.js
     2. le-data.js
     3. tt-engine.js
     4. routing.js          (costruisce IZXRouter)
     5. le-router.js        (costruisce LERouter)
     6. unified-router.js
     7. router-init.js      ← questo file
   ================================================================ */

(function () {
  'use strict';

  /* ── 1. Merge AX_LINES in IZX_LINES (se non già fatto da routing.js) ── */
  if (typeof AX_LINES !== 'undefined' && typeof IZX_LINES !== 'undefined') {
    Object.assign(IZX_LINES, AX_LINES);
  }

  /* ── 2. Registra i router ── */
  if (typeof IZXUnifiedRouter !== 'undefined') {

    // IZX — high-speed + Airport Express (AX) + Commuter (SN, EI)
    if (typeof IZXRouter !== 'undefined') {
      IZXUnifiedRouter.registerRouter('IZX', IZXRouter);
    }

    // LE — Lake Eira Regional
    if (typeof LERouter !== 'undefined') {
      IZXUnifiedRouter.registerRouter('LE', LERouter);
    }

  }

  /* ── 3. Interscambi cross-network ── */
  if (typeof IZXUnifiedRouter !== 'undefined') {
    IZXUnifiedRouter.buildInterchangeIndex([

      // ── AX Airport Express ↔ IZX ──────────────────────────────────────
      // AX00 (Sabullan) ↔ K01 (Sainðaul Central)  [terminus SN branch]
      { codeA: 'AX00', codeB: 'K01', transferMin: 8  },

      // AX05 (Onnojaris) ↔ K01 (Sainðaul Central)  [terminus BAJ branch]
      { codeA: 'AX05', codeB: 'K01', transferMin: 10 },

      // AX09 (SAIA — Sainðaul Int'l Airport) ↔ K03  [terminus EST branch]
      { codeA: 'AX09', codeB: 'K03', transferMin: 5  },

      // AX03 ↔ E01 (Eira Line — Sainðaul)
      { codeA: 'AX03', codeB: 'E01', transferMin: 7  },

      // ── LE ↔ IZX — da attivare con i codici definitivi di le-data.js ──
      // { codeA: 'LE01', codeB: 'EI05', transferMin: 8 },

    ]);
  }

})();

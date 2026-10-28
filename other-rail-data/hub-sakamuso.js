/* ================================================================
   HUB-SAKAMUSO.JS — Sakamuso Central Hub
   ================================================================
   Hub della stazione di Sakamuso, sul modello di HUB_SAINDAUL_CENTRAL.

   Membri:
     M721  (Metro Line 7)
     M1525 (Metro Line 15)
     M2007 (Metro Line 20 — capolinea, thru RKY)
     KD36  (Kidai Line)
     SK38  (Seishaku Line)
     K101  (IZX Keishin)
     RKY01 (Rinkyun Railway Main Line — thru M20)

   Nota: il router (unified-router.js) deve avere la voce
   HUB_SAKAMUSO nella costante HUBS per espandere il hubId.
================================================================ */
'use strict';

const SAKAMUSO_HUB = {
  id: 'HUB_SAKAMUSO',
  name: 'Sakamuso Central',
  members: [
    'M721',
    'M1525',
    'M2007',
    'KD36',
    'SK38',
    'K101',
    'RKY01',
  ],
};

if (typeof module !== 'undefined') {
  module.exports = { SAKAMUSO_HUB };
}

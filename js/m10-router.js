/* ================================================================
   M10-ROUTER.JS — Router Metro Line 10
   Usa gli interscambi dichiarati in metro/m10-data.js.

   Gli interscambi definiti come hub vengono espansi con
   expandInterchanges() da js/network-hubs.js.
================================================================ */
'use strict';

const { M10_INTERCHANGE } = require('../metro/m10-data.js');
const { expandInterchanges } = require('./network-hubs.js');

/**
 * Restituisce gli interscambi effettivi di una stazione M10.
 *
 * Per una stazione collegata a un hub, genera automaticamente i
 * collegamenti verso tutte le altre stazioni dell’hub, usando la
 * matrice dei tempi definita in network/hubs.js.
 *
 * @param {string} stationCode Codice stazione M10 (es. 'M1015')
 * @returns {Array} Interscambi espansi e senza duplicati
 */
function getM10Interchanges(stationCode) {
  const declared = M10_INTERCHANGE[stationCode] || [];
  return expandInterchanges(stationCode, declared);
}

/**
 * Restituisce il tempo di trasferimento minimo verso una stazione
 * connessa direttamente tramite interscambio o hub.
 *
 * @param {string} fromCode Codice stazione M10 di partenza
 * @param {string} toCode   Codice stazione di arrivo
 * @returns {number|null} Minuti di trasferimento, oppure null
 */
function getM10TransferMinutes(fromCode, toCode) {
  const link = getM10Interchanges(fromCode)
    .find((ic) => ic.code === toCode);

  return link ? link.transferMin : null;
}

if (typeof module !== 'undefined') {
  module.exports = {
    getM10Interchanges,
    getM10TransferMinutes,
  };
}

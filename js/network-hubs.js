/* ================================================================
   NETWORK-HUBS.JS
   Espansione degli interscambi definiti come hub.

   Input atteso:
     interchange = { hubId: 'HUB_SAINDAUL_CENTRAL', transferMin?: null, note?: '' }

   Output:
     [{ code, network, transferMin, note }, ...]

   Dipendenze: network/hubs.js deve esporre
     - HUBS
     - getHubTransferMinutes(hubId, fromCode, toCode)
================================================================ */
'use strict';

/**
 * Espande una lista di interscambi di una stazione.
 *
 * @param {string} stationCode  Codice della stazione corrente (es. 'M1015')
 * @param {Array}  interchanges Lista degli interscambi dichiarati per la stazione
 * @param {object} [deps]       Iniezione opzionale per test
 * @returns {Array} Interscambi espansi, senza duplicati
 */
function expandInterchanges(stationCode, interchanges, deps = {}) {
  const hubs = deps.HUBS || (typeof HUBS !== 'undefined' ? HUBS : {});
  const getMinutes = deps.getHubTransferMinutes ||
    (typeof getHubTransferMinutes !== 'undefined' ? getHubTransferMinutes : null);

  if (!Array.isArray(interchanges)) return [];

  const out = [];
  const seen = new Set();

  const push = (entry) => {
    if (!entry || !entry.code) return;
    if (entry.code === stationCode) return;
    const key = `${entry.code}|${entry.network || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(entry);
  };

  for (const ic of interchanges) {
    // Interscambio ordinario: già esplicito.
    if (!ic || !ic.hubId) {
      push(ic);
      continue;
    }

    const hub = hubs[ic.hubId];
    if (!hub || !Array.isArray(hub.stations)) {
      console.warn(`[network-hubs] Hub sconosciuto o senza stazioni: ${ic.hubId}`);
      continue;
    }

    for (const otherCode of hub.stations) {
      if (otherCode === stationCode) continue;

      let minutes = ic.transferMin;
      if (minutes == null && getMinutes) {
        minutes = getMinutes(ic.hubId, stationCode, otherCode);
      }
      if (minutes == null) minutes = 3;

      push({
        code: otherCode,
        network: hub.network || 'other',
        transferMin: minutes,
        note: ic.note || `via hub ${ic.hubId}`,
      });
    }
  }

  return out;
}

if (typeof module !== 'undefined') {
  module.exports = { expandInterchanges };
}

/* ================================================================
   IBC-ODANURI-DATA.JS — Ibaches Odanuri Shinai-Line
   齒鉄裏窟市内線 — diramazione da IBC34 (Hetsannui-Nari)

   Stesso colore e stesso prefisso codici della Ibaches Main Line.
   Le stazioni vengono aggiunte in coda a IBC_LINES.IBC.stations
   (dopo IBC34), così i servizi passanti IBC01 → IBC104 usano la
   stessa linea del router.

   DEVE essere caricato DOPO ibc-data.js e PRIMA di ibc-tt.js.

   km: progressiva da IBC01 (=0) = 51.59 (IBC34) + distanza da IBC34.
================================================================ */
'use strict';

(function () {
  if (typeof IBC_LINES === 'undefined' || !IBC_LINES.IBC) return;
  const st = IBC_LINES.IBC.stations;
  if (st.some((s) => s.code === 'IBC101')) return;

  st.push(
    { code: 'IBC101', name: 'Zhinchuku',            kanji: '秦竹',       km: 52.86 },  /* node 335741748 */
    { code: 'IBC102', name: 'Kotazhuju',            kanji: '細宿',       km: 53.77 },  /* node 335741747 */
    { code: 'IBC103', name: 'Odanuri Shikiniswae',  kanji: '裏窟北口',   km: 54.50 },  /* node 335741746 */
    { code: 'IBC104', name: 'Odanuri',              kanji: '裏窟',       km: 55.82 }   /* node 222589195 */
  );

  IBC_LINES.IBC.totalStations = st.length;
  IBC_LINES.IBC.totalKm       = 55.82;
  IBC_LINES.IBC.branches = [{
    id:       'IBCO',
    name:     'Ibaches Odanuri Shinai-Line',
    nameJa:   '齒鉄裏窟市内線',
    junction: 'IBC34',
    stations: ['IBC101', 'IBC102', 'IBC103', 'IBC104'],
  }];
})();

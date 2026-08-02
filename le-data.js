/* ================================================================
   LE-DATA.JS — Limited Express network registry
   ================================================================
   Aggrega tutte le linee di tipo Limited Express / Airport Express
   che operano sotto IZX ma con tariffa e routing separati.

   Gerarchia Izarail:
     IZX  (IZXRouter)  — shinkansen-equivalent, intercity HSR
     LE   (LERouter)   — tokkyū-equivalent: airport express,
                         higher-speed intercity comfort (futuri)
     SUB  (SuburbanRouter) — rete suburbana

   Linee attualmente registrate:
     AX  — Airport Express (Est / Bajikoe / Sakamuso)

   Per aggiungere una futura linea LE:
     1. Crea il file dati (es. tk-data.js) con la struttura standard
     2. Aggiungi Object.assign(LE_LINES, TK_LINES) in fondo a quel file
        (oppure qui, se preferisci centralizzare)
================================================================ */

/* Registro centrale LE — popolato dai moduli dati delle singole linee */
const LE_LINES = {};

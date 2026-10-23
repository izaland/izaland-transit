/* ================================================================
   IBC-DATA.JS — Ibaches Main Line
   齒琉能電鐵 (Ibaruno Dyenches) — Linea privata suburbana

   Operatore : Ibaruno Dyenches (齒琉能電鐵)
   Tipo      : Privata suburbana (rete estesa, stile Tobu/Kintetsu;
               altre linee verranno aggiunte gradualmente)
   Capolinea : IBC01 Anagusa Mukai (Ibaches) ↔ IBC34 Hetsannui-Nari
   Lunghezza : 51.59 km · 34 stazioni (Main Line)

   Diramazioni (IBC_BRANCHES, stessi colore e prefisso codici):
     IBCO  Ibaches Odanuri Shinai-Line (齒鐵裏窟市内線)
           da IBC34 · IBC101–IBC104 · 4 stazioni · 4.23 km
     Per aggiungerne una nuova basta aggiungere un oggetto a
     IBC_BRANCHES: le stazioni vengono accodate automaticamente a
     IBC_LINES.IBC.stations (dopo la Main Line), cosi' i servizi
     passanti usano la stessa linea del router.

   Interscambi:
     IBC01 (Anagusa Mukai)       ↔ M817 (5 min), KD30
     IBC03 (Jufurai)             ↔ M818 (2 min), M1410, M1809
     IBC07 (Oizato)              ↔ M823, SK20, CK26
     IBC11 (Shakihori)           ↔ M1001, SK19, CK27, KS11
     IBC18 (Shin-Dankau)         ↔ SK13
     IBC23 (Ibaruno)             ↔ KD10
     IBC19 (Ibaches Dankau)      — nessun interscambio (centinaia di metri da KD14/SK12)
     IBC24–IBC34                 — nessun interscambio definito (da completare)
     IBC101–IBC104               — nessun interscambio definito

   Servizi (IBC_SERVICES):
     IBC1  Local  IBC01 ↔ IBC34  tutte le fermate  6 tph (ogni 10 min)
                    Prima corsa: 05:00 da entrambi i capolinea
                    Ultima corsa: 23:30 da entrambi i capolinea
     IBC2  Rapid  IBC01 ↔ IBC34  (definito in ibc-tt.js)
     (orari reali di tutti i servizi: ibc-tt.js)

   Note:
     — M8 e IBC NON condividono i binari. Da M818 la M8 si sbina e
       entra in servizio diretto su IBC (dettagli da definire).
     — Servizio provvisorio: frequenze e orari da definire.
     — Tempi di trasferimento: solo dove indicati; altrimenti default router.
     — km: progressiva da IBC01 (=0). Per IBC24–IBC34 le distanze sono state
       rilevate da IBC23 e sommate a 28.1 km. Per le diramazioni: km della
       stazione di innesto + distanza da essa.
     — Ordine fisico: IBC30 (km 39.24) precede IBC29 (km 40.66); l'array
       stations segue l'ordine fisico, non quello numerico dei codici.
================================================================ */
'use strict';

const IBC_INTERCHANGE = {
  IBC01: ['KD30', { code: 'M817', transferMin: 5 }],
  IBC03: [{ code: 'M818', transferMin: 2 }, 'M1410', 'M1809'],
  IBC07: ['M823', 'SK20', 'CK26'],
  IBC11: ['M1001', 'SK19', 'CK27', 'KS11'],
  IBC18: ['SK13'],
  IBC23: ['KD10'],
};

const IBC_LINES = {
  IBC: {
    id:            'IBC',
    name:          'Ibaches Main Line',
    nameJa:        '齒琉能電鐵',
    color:         '#FF9999',
    operator:      'Ibaruno Dyenches',
    operatorJa:    '齒琉能電鐵',
    type:          'private',
    region:        'Ibaruno',
    circular:      false,
    totalKm:       51.59,
    totalStations: 34,
    headwayPeak:    10,
    headwayOffPeak: 10,
    stations: [
      { code: 'IBC01', name: 'Anagusa Mukai (Ibaches)', kanji: '矢模武凱', km:  0.0   },  /* node 229536854 */
      { code: 'IBC02', name: 'Ōdabara',                 kanji: '大津',     km:  0.7   },  /* node 452184785 */
      { code: 'IBC03', name: 'Jufurai',                 kanji: '朱布来',   km:  1.48  },  /* node 135876986 */
      { code: 'IBC04', name: 'Shin-Higikura',           kanji: '新矢九田', km:  2.8   },  /* node 219979573 */
      { code: 'IBC05', name: 'Ibaches Makurigawa',      kanji: '齒鐵炭畝', km:  4.03  },  /* node 219979572 */
      { code: 'IBC06', name: 'Karajitsa',               kanji: '次矯',     km:  4.97  },  /* node 219979571 */
      { code: 'IBC07', name: 'Oizato',                  kanji: '粕穫',     km:  6.39  },  /* node 124064341 */
      { code: 'IBC08', name: 'Dendokuri',               kanji: '殿土巻',   km:  7.55  },  /* node 124064340 */
      { code: 'IBC09', name: 'Amitoya',                 kanji: '安砂',     km:  8.51  },  /* node 124064339 */
      { code: 'IBC10', name: 'Otsumi-Shakihori',        kanji: '南石登',   km:  9.63  },  /* node 124064338 */
      { code: 'IBC11', name: 'Shakihori',               kanji: '石登',     km: 10.26  },  /* node 122813475 */
      { code: 'IBC12', name: 'Nari-Tonomuri',           kanji: '東殿弖',   km: 11.87  },  /* node 378136780 */
      { code: 'IBC13', name: 'Saikametotsu',            kanji: '斎肩橋',   km: 12.46  },  /* node 225874016 */
      { code: 'IBC14', name: 'Otsumi-Kīttokaru',        kanji: '南謝松',   km: 13.52  },  /* node 225874015 */
      { code: 'IBC15', name: 'Sayasama',                kanji: '饌宗',     km: 15.25  },  /* node 225874014 */
      { code: 'IBC16', name: 'Katanase Tea',            kanji: '泉那施下', km: 16.5   },  /* node 292488855 */
      { code: 'IBC17', name: 'Samakisamo',              kanji: '蓒山',     km: 18.2   },  /* node 409739998 */
      { code: 'IBC18', name: 'Shin-Dankau',             kanji: '新檀洪',   km: 20.46  },  /* node 250818684 */
      { code: 'IBC19', name: 'Ibaches Dankau',          kanji: '齒鐵檀洪', km: 21.48  },  /* node 250818581 */
      { code: 'IBC20', name: 'Seirenji',                kanji: '誠蓮寺',   km: 22.79  },  /* node 452184851 */
      { code: 'IBC21', name: 'Chidai Seimun',           kanji: '齒大正門', km: 24.25  },  /* node 232186875 */
      { code: 'IBC22', name: 'Kaibaji',                 kanji: '界馬寺',   km: 26.25  },  /* node 250818546 */
      { code: 'IBC23', name: 'Ibaruno',                 kanji: '齒琉能',   km: 28.1   },  /* node 128607532 */
      { code: 'IBC24', name: 'Shinkeidai',              kanji: '真景台',   km: 29.97  },  /* node 292408409 */
      { code: 'IBC25', name: 'Nōntsuma',                kanji: '濃都満',   km: 31.42  },  /* node 292408408 */
      { code: 'IBC26', name: 'Kumasunto',               kanji: '枝向',     km: 33.14  },  /* node 452184850 */
      { code: 'IBC27', name: 'Sōweski',                 kanji: '早月名',   km: 35.12  },  /* node 335188774 */
      { code: 'IBC28', name: 'Tsukiniji',               kanji: '原西',     km: 36.04  },  /* node 335188773 */
      { code: 'IBC30', name: 'Hakehidano',              kanji: '横林',     km: 39.24  },  /* node 256636687 */
      { code: 'IBC29', name: 'Sorokauri',               kanji: '緋沼',     km: 40.66  },  /* node 452266340 */
      { code: 'IBC31', name: 'Kobase-Ibu',              kanji: '槻隻中',   km: 42.26  },  /* node 335188772 */
      { code: 'IBC32', name: 'Kobase-Rippama',          kanji: '槻隻高島', km: 45.73  },  /* node 335188771 */
      { code: 'IBC33', name: 'Niji-Odanuri',            kanji: '西裏窟',   km: 48.27  },  /* node 292407589 */
      { code: 'IBC34', name: 'Hetsannui-Nari',          kanji: '渇桟枡東', km: 51.59  },  /* node 292407590 */
    ],
  },
};

/* ----------------------------------------------------------------
   DIRAMAZIONI — stazioni accodate a IBC_LINES.IBC.stations.
   km = progressiva da IBC01 (km della stazione di innesto + distanza).
   ---------------------------------------------------------------- */
const IBC_BRANCHES = [
  {
    id:       'IBCO',
    name:     'Ibaches Odanuri Shinai-Line',
    nameJa:   '齒鐵裏窟市内線',
    junction: 'IBC34',
    stations: [
      { code: 'IBC101', name: 'Zhinchuku',           kanji: '秦竹',     km: 52.86 },  /* node 335741748 · +1.27 da IBC34 */
      { code: 'IBC102', name: 'Kotazhuju',           kanji: '細宿',     km: 53.77 },  /* node 335741747 · +2.18 */
      { code: 'IBC103', name: 'Odanuri Shikiniswae', kanji: '裏窟北口', km: 54.50 },  /* node 335741746 · +2.91 */
      { code: 'IBC104', name: 'Odanuri',             kanji: '裏窟',     km: 55.82 },  /* node 222589195 · +4.23 */
    ],
  },
];

IBC_LINES.IBC.branches = IBC_BRANCHES.map((b) => ({
  id: b.id, name: b.name, nameJa: b.nameJa, junction: b.junction,
  stations: b.stations.map((s) => s.code),
}));
IBC_BRANCHES.forEach((b) => {
  b.stations.forEach((s) => {
    if (!IBC_LINES.IBC.stations.some((x) => x.code === s.code)) IBC_LINES.IBC.stations.push(s);
  });
});

const IBC_SERVICES = [
  { id: 'IBC1',    desc: 'Local', fromCode: 'IBC01', toCode: 'IBC34', headway: 10, stops: [], firstDep: '05:00', lastDep: '23:30' },
  { id: 'IBC1_NB', desc: 'Local', fromCode: 'IBC34', toCode: 'IBC01', headway: 10, stops: [], firstDep: '05:00', lastDep: '23:30' },
];

/* MERGE in SUBURBAN_LINES e SUBURBAN_INTERCHANGE (bidirezionale).
   Richiede che suburban-data.js sia caricato PRIMA di questo file.
   I codici metro (M…) sono dichiarati dal lato metro: qui il reverse
   viene aggiunto solo per le altre linee suburbane (KD30, KD10, SK…, CK…, KS11). */
if (typeof SUBURBAN_LINES !== 'undefined') {
  Object.assign(SUBURBAN_LINES, IBC_LINES);
}
if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
  const codeOf = (e) => (typeof e === 'string' ? e : e.code);
  const addTo = (key, entry) => {
    const list = SUBURBAN_INTERCHANGE[key] || (SUBURBAN_INTERCHANGE[key] = []);
    if (!list.some((e) => codeOf(e) === codeOf(entry))) list.push(entry);
  };
  Object.keys(IBC_INTERCHANGE).forEach((st) => {
    IBC_INTERCHANGE[st].forEach((entry) => {
      const code = codeOf(entry);
      addTo(st, entry);
      if (!/^M\d/.test(code)) {
        addTo(code, typeof entry === 'string' ? st : { code: st, transferMin: entry.transferMin });
      }
    });
  });
}

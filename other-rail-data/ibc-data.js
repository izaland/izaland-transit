/* ================================================================
   IBC-DATA.JS — Ibaches Main Line
   齒琉能電鐵 (Ibaruno Dyenches) — Linea privata suburbana

   Operatore : Ibaruno Dyenches (齒琉能電鐵)
   Tipo      : Privata suburbana (rete estesa, stile Tobu/Kintetsu;
               altre linee verranno aggiunte gradualmente)
   Capolinea : IBC01 Anagusa Mukai (Ibaches) ↔ IBC55 Īmate
   Lunghezza : 115.46 km · 55 stazioni (Main Line)

   Diramazioni (IBC_BRANCHES, stessi colore e prefisso codici):
     IBCO  Ibaches Odanuri Shinai-Line (齒鐵裏窟市内線)
           da IBC34 · IBC101–IBC104 · 4 stazioni · 4.23 km
     IBCE  Ibaches Enikezya Line (齒鐵盛箞線)
           da IBC23 · IBC105–IBC107 · 3 stazioni · 6.82 km
           (usata dal thru service di M8 — vedi M8)
     IBCM  Daihanjishi–Maeðaki branch (ID tecnico, nome descrittivo)
           da IBC41 verso sud · IBC108–IBC121 · 14 stazioni · 37.14 km
           Nessun diretto dalla direzione IBC01; servizi da definire.
           direction/directFromIBC01 sono metadati descrittivi,
           non introducono da soli vincoli o servizi nel router.
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
     IBC107 (Ibaches Enikezya)   ↔ SK07, M142
     IBC19 (Ibaches Dankau)      — nessun interscambio (centinaia di metri da KD14/SK12)
     IBC24–IBC55                 — nessun interscambio definito (da completare)
     IBC101–IBC106               — nessun interscambio definito
     IBC108–IBC121               — nessun interscambio fornito

   Servizi effettivi: ibc-tt.js.
     Local da IBC01: :00/:30 per Odanuri; :10/:40 per IBC41 Daihanjishi;
     :20/:50 per IBC34 Hetsannui-Nari. IBC42–IBC55: solo dati stazioni.
     IBC_SERVICES sotto conserva il fallback storico IBC01 ↔ IBC34;
     il timetable registrato in ibc-tt.js definisce i servizi completi.

   Note:
     — M8 e IBC NON condividono i binari. Da M818 la M8 si sbina e
       entra in servizio diretto su IBC (dettagli da definire).
     — Servizio provvisorio: frequenze e orari da definire.
     — Tempi di trasferimento: solo dove indicati; altrimenti default router.
     — km: progressiva da IBC01 (=0). Per IBC24–IBC34 le distanze sono state
       rilevate da IBC23 e sommate a 28.1 km. Per le diramazioni: km della
       stazione di innesto + distanza da essa.
     — IBC35–IBC42: 51.59 + progressiva locale da IBC34.
       IBC43–IBC55: 51.59 + 19.42 + progressiva locale da IBC42.
     — IBC108–IBC121: 69.72 (IBC41) + distanza locale da IBC41.
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
  IBC107: ['SK07', 'M142'],
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
    totalKm:       115.46,
    totalStations: 55,
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
      { code: 'IBC10', name: 'Otsumi-Shakihori',        kanji: '南石登',   km:  9.63  },  /* node 219979339 */
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

/* Main Line extension; all km are cumulative from IBC01. */
const IBC_MAIN_EXTENSION = [
  { code: 'IBC35', name: 'Illakiro', kanji: '', km: 55.21 }, /* node 292407588 */
  { code: 'IBC36', name: 'Kuskawagi', kanji: '杉畔名', km: 58.00 }, /* node 452184835 */
  { code: 'IBC37', name: 'Niji-Hakenaki', kanji: '西横畑', km: 61.72 }, /* node 256636403 */
  { code: 'IBC38', name: 'Daihanji Numasate', kanji: '', km: 64.68 }, /* node 292407587 */
  { code: 'IBC39', name: 'Shigaya', kanji: '藻屋', km: 66.03 }, /* node 452184836 */
  { code: 'IBC40', name: 'Daihanji Pokamotu', kanji: '大繁寺吉口', km: 68.57 }, /* node 339602557 */
  { code: 'IBC41', name: 'Daihanjishi', kanji: '大繁寺市', km: 69.72 }, /* node 292407586 */
  { code: 'IBC42', name: 'Sannyehai', kanji: '山嵜半', km: 71.01 }, /* node 452184842 */
  { code: 'IBC43', name: 'Aribashiko', kanji: '', km: 73.74 }, /* node 256636399 */
  { code: 'IBC44', name: 'Kusudoshi', kanji: '杉汎', km: 76.58 }, /* node 452184849 */
  { code: 'IBC45', name: 'Tsawaibu', kanji: '森中', km: 78.92 }, /* node 292407584 */
  { code: 'IBC46', name: 'Cheratson', kanji: '', km: 84.90 }, /* node 292407583 */
  { code: 'IBC47', name: 'Kasadu', kanji: '家佐頭', km: 89.08 }, /* node 292407582 */
  { code: 'IBC48', name: 'Tolomauri', kanji: '', km: 94.43 }, /* node 452184847 */
  { code: 'IBC49', name: 'Chastayunte', kanji: '椋灝', km: 99.11 }, /* node 452432882 */
  { code: 'IBC50', name: 'Hibareki', kanji: '夏浦', km: 101.34 }, /* node 452432881 */
  { code: 'IBC51', name: 'Tsigawinji', kanji: '', km: 106.97 }, /* node 452184846 */
  { code: 'IBC52', name: 'Niji-Īmate', kanji: '西江方', km: 111.49 }, /* node 452184845 */
  { code: 'IBC53', name: 'Haryesoudori', kanji: '榎壇市', km: 113.06 }, /* node 452432079 */
  { code: 'IBC54', name: 'Sōgantais', kanji: '松岩塔', km: 114.23 }, /* node 452432077 */
  { code: 'IBC55', name: 'Īmate', kanji: '江方', km: 115.46 }, /* node 452184844 */
];
IBC_LINES.IBC.stations.push(...IBC_MAIN_EXTENSION);

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
  {
    id:       'IBCE',
    name:     'Ibaches Enikezya Line',
    nameJa:   '齒鐵盛狩線',
    junction: 'IBC23',
    stations: [
      { code: 'IBC105', name: 'Tattamoto',           kanji: '蚫対',     km: 29.51 },  /* node 135204248 · +1.41 da IBC23 */
      { code: 'IBC106', name: 'Kanlisāri',           kanji: '船川',     km: 33.86 },  /* node 335741468 · +5.76 */
      { code: 'IBC107', name: 'Ibaches Enikezya',    kanji: '齒鐵盛狩', km: 34.92 },  /* node 335741589 · +6.82 */
    ],
  },
  {
    id:       'IBCM',
    name:     'Daihanjishi–Maeðaki branch',
    nameJa:   '',
    junction: 'IBC41',
    direction: 'south',
    directFromIBC01: false,
    lengthKm: 37.14,
    /* No services defined yet. No direct trains from the IBC01 direction. */
    stations: [
      { code: 'IBC108', name: 'Getol', kanji: '窪狻', km: 70.92 }, /* node 452490281 · +1.20 da IBC41 */
      { code: 'IBC109', name: 'Daihanji', kanji: '大繁寺', km: 72.01 }, /* node 135206158 · +2.29 */
      { code: 'IBC110', name: 'Kobase-Leurei', kanji: '槻隻榊伊', km: 74.96 }, /* node 335188770 · +5.24 */
      { code: 'IBC111', name: 'Maintsuke', kanji: '麻衣', km: 77.69 }, /* node 335188769 · +7.97 */
      { code: 'IBC112', name: 'Muzatoi', kanji: '狽匊', km: 81.34 }, /* node 335188768 · +11.62 */
      { code: 'IBC113', name: 'Nari-Muzatoi', kanji: '東狽匊', km: 83.78 }, /* node 335188767 · +14.06 */
      { code: 'IBC114', name: 'Ninokawa', kanji: '', km: 88.65 }, /* node 284017617 · +18.93 */
      { code: 'IBC115', name: 'Samochino', kanji: '山雉', km: 92.71 }, /* node 452490274 · +22.99 */
      { code: 'IBC116', name: 'Pumashue', kanji: '', km: 95.64 }, /* node 335188766 · +25.92 */
      { code: 'IBC117', name: 'Sutte-Nyūngu', kanji: '', km: 97.99 }, /* node 335188698 · +28.27 */
      { code: 'IBC118', name: 'Ārako', kanji: '', km: 99.92 }, /* node 335188765 · +30.20 */
      { code: 'IBC119', name: 'Ārako Daishi-adae', kanji: '', km: 101.71 }, /* node 335188699 · +31.99 */
      { code: 'IBC120', name: 'Niji-Maeðaki', kanji: '西苺邦', km: 103.69 }, /* node 452490279 · +33.97 */
      { code: 'IBC121', name: 'Maeðaki', kanji: '苺邦', km: 106.86 }, /* node 452490280 · +37.14 */
    ],
  },
];

IBC_LINES.IBC.branches = IBC_BRANCHES.map((b) => ({
  id: b.id, name: b.name, nameJa: b.nameJa, junction: b.junction,
  ...(b.direction ? { direction: b.direction } : {}),
  ...(b.directFromIBC01 !== undefined ? { directFromIBC01: b.directFromIBC01 } : {}),
  ...(b.lengthKm != null ? { lengthKm: b.lengthKm } : {}),
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

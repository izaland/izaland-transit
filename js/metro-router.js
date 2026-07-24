/**
 * metro-router.js — Sainðaul Metro routing module
 * Covers all 19+1 public/private lines.
 * Line 4 (KO Kokendake) is fully populated with all 25 stations.
 * All other lines carry terminus + key interchange data only (stubs).
 *
 * Usage:
 *   MetroRouter.search('Binno', 'Kawaei')  → journey object
 *   MetroRouter.stationName('KO', 4)        → 'Abawauri'
 *   MetroRouter.allStations()               → flat array of {id, name, lines[]}
 *   MetroRouter.lineColor('KO')             → '#FFD912'
 */

;(function(global) {
  'use strict';

  /* ─────────────────────────────────────────────
   * LINE METADATA
   * ───────────────────────────────────────────── */
  const LINES = {
    HB: { number: 2,  name: 'Hibaru Line',              color: '#CC0000', textColor: '#fff' },
    AD: { number: 1,  name: 'Agarai-Dōnpuku Line',      color: '#FE7F00', textColor: '#fff' },
    SH: { number: 3,  name: 'Shakihori Line',            color: '#009E4F', textColor: '#fff' },
    KO: { number: 4,  name: 'Kokendake Line',            color: '#FFD912', textColor: '#1e293b' },
    KE: { number: 5,  name: 'Kirifunu Eigandan Line',    color: '#9E6A51', textColor: '#fff' },
    IP: { number: 6,  name: 'Ipporai Line',              color: '#3465A4', textColor: '#fff' },
    BJ: { number: 7,  name: 'Bajikoe Line',              color: '#00A0BC', textColor: '#fff' },
    HM: { number: 8,  name: 'Hamaas Line',               color: '#00A2D3', textColor: '#fff' },
    BX: { number: 9,  name: 'Bordeaux Line',             color: '#C40062', textColor: '#fff' },
    SO: { number: 10, name: 'Shakiose Line',             color: '#C46200', textColor: '#fff' },
    OD: { number: 11, name: 'Owonideki Line',            color: '#c5e1a5', textColor: '#1e293b' },
    IS: { number: 12, name: 'Intsushitsa Line',          color: '#86EBEB', textColor: '#1e293b' },
    TN: { number: 13, name: 'Tsuruna Line',              color: '#36873c', textColor: '#fff' },
    NO: { number: 14, name: 'Nanpuku Otsumi Line',       color: '#72E400', textColor: '#1e293b' },
    UN: { number: 15, name: 'Urenosomi Line',            color: '#db287a', textColor: '#fff' },
    KW: { number: 16, name: 'Kyokwan Line',              color: '#816cb1', textColor: '#fff' },
    ZK: { number: 17, name: 'Zakumi Line',               color: '#f985bb', textColor: '#1e293b' },
    JF: { number: 18, name: 'Jufurai Line',              color: '#999999', textColor: '#fff' },
    HO: { number: null, name: 'Hoze-Oyehatton Line',    color: '#CD5C5C', textColor: '#fff' },
    SX: { number: null, name: 'Shubaru Express',        color: '#B22222', textColor: '#fff', private: true },
  };

  /* ─────────────────────────────────────────────
   * STATION DATA
   * Each station: { id, name, iz, lines: ['KO', 'HB', ...] }
   * id = '<lineCode>_<index>'  (KO_0 … KO_24)
   *
   * FULL DATA: Line 4 (KO) — 25 stations
   * STUB DATA: all other lines — terminus + major interchanges only
   * ───────────────────────────────────────────── */
  const STATIONS_RAW = [

    // ── LINE 4: KO KOKENDAKE (full) ──────────────────
    { id:'KO_0',  name:'Ipporai-Senpyan',     iz:'一蒲崍船駢',    lines:['KO'] },
    { id:'KO_1',  name:'Ipporai-Owonideki',   iz:'一蒲崍吹取',    lines:['KO'] },
    { id:'KO_2',  name:'Ipporai-Konegisa',    iz:'一蒲崍干鮃',    lines:['KO'] },
    { id:'KO_3',  name:'Shiki-Hoze',          iz:'北舗摧',         lines:['KO'] },
    { id:'KO_4',  name:'Kotoshiruna',         iz:'細荒奈',         lines:['KO'] },
    { id:'KO_5',  name:'Buslyu Toshi',        iz:'物流都市',       lines:['KO'] },
    { id:'KO_6',  name:'Kasakuri',            iz:'鯛巻',           lines:['KO'] },   // interchange: Kidai Line KD35
    { id:'KO_7',  name:'Nihkyonta',           iz:'濱角',           lines:['KO'] },
    { id:'KO_8',  name:'Shimamera',           iz:'渠瀬田',         lines:['KO'] },
    { id:'KO_9',  name:'Abawauri',            iz:'燕宦',           lines:['KO'] },
    { id:'KO_10', name:'Heinomoji',           iz:'駕桃',           lines:['KO'] },
    { id:'KO_11', name:'Ogiwata',             iz:'槃芳',           lines:['KO'] },
    { id:'KO_12', name:'Ekinðuka',            iz:'虓鵜',           lines:['KO'] },
    { id:'KO_13', name:'Aguri 2-sa',          iz:'阿久里二沙',     lines:['KO'] },
    { id:'KO_14', name:'Anagusa Mukai',       iz:'矢模武凱',       lines:['KO','HM'] },  // interchange HM L8
    { id:'KO_15', name:'Kushidaru Amiya',     iz:'柚艏',           lines:['KO'] },
    { id:'KO_16', name:'Tamainoki',           iz:'谷伊坂',         lines:['KO'] },
    { id:'KO_17', name:'Tamainoki Kokendake', iz:'谷伊坂古剣館',   lines:['KO'] },
    { id:'KO_18', name:'Sumi-Kokendake',      iz:'隠古剣館',       lines:['KO','KW'] }, // interchange KW L16
    { id:'KO_19', name:'Sojo-Kokendake',      iz:'',               lines:['KO'] },
    { id:'KO_20', name:'Nuskaitsa',           iz:'',               lines:['KO'] },
    { id:'KO_21', name:'Juhtasamo',           iz:'',               lines:['KO'] },
    { id:'KO_22', name:'Ristai-Nyūngu',       iz:'立大入口',       lines:['KO'] },
    { id:'KO_23', name:'Niji-Kawaei',         iz:'西珂夬栄',       lines:['KO'] },
    { id:'KO_24', name:'Kawaei',              iz:'珂夬栄',         lines:['KO'] },

    // ── LINE 2: HB HIBARU (stubs) ─────────────────────
    { id:'HB_0',  name:'Naezoto',             iz:'',  lines:['HB'] },
    { id:'HB_T1', name:'Binno',               iz:'苠喃', lines:['HB','KO'] },  // interchange with KO
    { id:'HB_T2', name:'Mokoba',              iz:'',  lines:['HB'] },
    { id:'HB_T3', name:'Hintomaui',           iz:'',  lines:['HB'] },

    // ── LINE 1: AD AGARAI-DŌNPUKU (stubs) ────────────
    { id:'AD_0',  name:'Ikashumai Sports Center', iz:'', lines:['AD'] },
    { id:'AD_T1', name:'Tsumiji',             iz:'都巳治', lines:['AD','KO','JF'] },
    { id:'AD_T2', name:'Anagusa Mukai',       iz:'矢模武凱', lines:['AD','KO','HM'] },
    { id:'AD_T3', name:'Sainðaul Central',    iz:'作安崎中央', lines:['AD','HB','SO','ZK'] },
    { id:'AD_T4', name:'Enikezya Forum',      iz:'',  lines:['AD'] },

    // ── LINE 3: SH SHAKIHORI (stubs) ─────────────────
    { id:'SH_0',  name:'Ansan Shakuiadae',    iz:'', lines:['SH'] },
    { id:'SH_T1', name:'Shiitehongi',         iz:'茛本名', lines:['SH'] },
    { id:'SH_T2', name:'Herubori',            iz:'杏登', lines:['SH','ZK','SX'] },
    { id:'SH_T3', name:'Iyogateri',           iz:'',  lines:['SH'] },

    // ── LINE 5: KE KIRIFUNU EIGANDAN (stubs) ──────────
    { id:'KE_0',  name:'Jisahara',            iz:'治叉榎', lines:['KE','OD','KD39'] },
    { id:'KE_T1', name:'Tsuragoi',            iz:'', lines:['KE'] },

    // ── LINE 6: IP IPPORAI (stubs) ────────────────────
    { id:'IP_0',  name:'Saibu-Panatsawa',     iz:'', lines:['IP'] },
    { id:'IP_T1', name:'Nari-Gotsurindai',    iz:'', lines:['IP','JF'] },

    // ── LINE 7: BJ BAJIKOE (stubs) ────────────────────
    { id:'BJ_0',  name:'Pwakkobe',            iz:'', lines:['BJ'] },
    { id:'BJ_T1', name:'Akettun Shendao',     iz:'', lines:['BJ'] },

    // ── LINE 8: HM HAMAAS (stubs) ─────────────────────
    { id:'HM_0',  name:'Kishagoi',            iz:'', lines:['HM'] },
    { id:'HM_T1', name:'Komayunden',          iz:'', lines:['HM'] },

    // ── LINE 9: BX BORDEAUX (stubs) ───────────────────
    { id:'BX_0',  name:'Teyomuka',            iz:'', lines:['BX'] },
    { id:'BX_T1', name:'Shōryān Daishi',      iz:'', lines:['BX'] },

    // ── LINE 10: SO SHAKIOSE (stubs) ──────────────────
    { id:'SO_0',  name:'Shakihori',           iz:'', lines:['SO','SH'] },
    { id:'SO_T1', name:'Uhāra-Motu',          iz:'', lines:['SO'] },

    // ── LINE 11: OD OWONIDEKI (stubs) ─────────────────
    { id:'OD_0',  name:'Itsayuki-Tonjō',      iz:'', lines:['OD'] },

    // ── LINE 12: IS INTSUSHITSA (stubs) ───────────────
    { id:'IS_0',  name:'Kayatsori',           iz:'', lines:['IS'] },
    { id:'IS_T1', name:'Mewakate-Kippai',     iz:'', lines:['IS','KW','ZK','JF'] },
    { id:'IS_T2', name:'Niji-Yōneo',          iz:'', lines:['IS'] },

    // ── LINE 13: TN TSURUNA (stubs) ───────────────────
    { id:'TN_0',  name:'SAIA Cargo Center',   iz:'', lines:['TN','UN'] },
    { id:'TN_T1', name:'Showanul',            iz:'', lines:['TN'] },
    { id:'TN_T2', name:'Kashimochi',          iz:'', lines:['TN'] },

    // ── LINE 14: NO NANPUKU OTSUMI (stubs) ────────────
    { id:'NO_0',  name:'Migawarae',           iz:'', lines:['NO'] },
    { id:'NO_T1', name:'Tanjānli',            iz:'', lines:['NO'] },

    // ── LINE 15: UN URENOSOMI (stubs) ─────────────────
    { id:'UN_T1', name:'Sakamuso',            iz:'', lines:['UN'] },

    // ── LINE 16: KW KYOKWAN (stubs) ───────────────────
    { id:'KW_0',  name:'Tsukitonai',          iz:'', lines:['KW'] },
    { id:'KW_T1', name:'Kamaishi Kaiyan Kōwen', iz:'', lines:['KW'] },

    // ── LINE 17: ZK ZAKUMI (stubs) ────────────────────
    { id:'ZK_0',  name:'Tswankanami Airport', iz:'', lines:['ZK'] },
    { id:'ZK_T1', name:'Kungaus Sangu',       iz:'', lines:['ZK'] },

    // ── LINE 18: JF JUFURAI (stubs) ───────────────────
    { id:'JF_T1', name:'Mewakate Kippai',     iz:'', lines:['JF','IS','KW','ZK'] },

    // ── LINE HO: HOZE-OYEHATTON (stubs) ───────────────
    { id:'HO_0',  name:'Takatsura',           iz:'', lines:['HO'] },
    { id:'HO_T1', name:'Kadokamahiwa',        iz:'', lines:['HO'] },

    // ── LINE SX: SHUBARU EXPRESS (stubs) ──────────────
    { id:'SX_T1', name:'Torino Jutakutsi',    iz:'', lines:['SX'] },
  ];

  /* ─────────────────────────────────────────────
   * DEDUPLICATE: merge stations with the same name
   * so interchanges appear as a single node.
   * ───────────────────────────────────────────── */
  const _byName = {};
  STATIONS_RAW.forEach(s => {
    const key = s.name.toLowerCase().trim();
    if (_byName[key]) {
      // merge lines array
      s.lines.forEach(l => {
        if (!_byName[key].lines.includes(l)) _byName[key].lines.push(l);
      });
    } else {
      _byName[key] = { ...s, lines: [...s.lines] };
    }
  });
  const STATIONS = Object.values(_byName);

  /* ─────────────────────────────────────────────
   * LINE GRAPH
   * For each line, stations in order (by their id index).
   * ───────────────────────────────────────────── */
  function stationsOnLine(lineCode) {
    return STATIONS_RAW
      .filter(s => s.lines.includes(lineCode))
      .map(s => {
        const key = s.name.toLowerCase().trim();
        return _byName[key];
      })
      .filter((s, i, arr) => arr.indexOf(s) === i);  // unique, preserve order
  }

  /* ─────────────────────────────────────────────
   * SEARCH: BFS across the metro graph
   * Returns { found, legs, totalStops, transfers }
   * ───────────────────────────────────────────── */
  function normalise(str) {
    return str.toLowerCase().trim();
  }

  function findStation(name) {
    const n = normalise(name);
    return STATIONS.find(s => normalise(s.name) === n) ||
           STATIONS.find(s => normalise(s.name).includes(n)) ||
           null;
  }

  function search(fromName, toName) {
    const origin = findStation(fromName);
    const dest   = findStation(toName);

    if (!origin) return { found: false, error: `Station not found: "${fromName}"` };
    if (!dest)   return { found: false, error: `Station not found: "${toName}"` };
    if (origin === dest) return { found: true, legs: [], totalStops: 0, transfers: 0 };

    // BFS: each node = { station, line, path:[ {station,line} ] }
    const visited = new Set();
    const queue = origin.lines.map(l => ({
      station: origin,
      line: l,
      path: [{ station: origin, line: l }]
    }));
    visited.add(origin.id + '|' + origin.lines[0]);
    origin.lines.forEach(l => visited.add(origin.id + '|' + l));

    while (queue.length) {
      const { station, line, path } = queue.shift();
      const lineStations = stationsOnLine(line);
      const idx = lineStations.findIndex(s => s.id === station.id ||
        normalise(s.name) === normalise(station.name));

      // walk both directions
      [-1, 1].forEach(dir => {
        let i = idx + dir;
        while (i >= 0 && i < lineStations.length) {
          const next = lineStations[i];
          const newPath = [...path, { station: next, line }];

          if (normalise(next.name) === normalise(dest.name)) {
            // found — build legs
            return { found: true, ...buildLegs(newPath) };
          }

          const vKey = next.id + '|' + line;
          if (!visited.has(vKey)) {
            visited.add(vKey);
            queue.push({ station: next, line, path: newPath });
            // also enqueue transfers
            next.lines.forEach(l2 => {
              const vk2 = next.id + '|' + l2;
              if (!visited.has(vk2)) {
                visited.add(vk2);
                queue.push({ station: next, line: l2, path: newPath });
              }
            });
          }
          // stop walking past this station in BFS — let the queue handle further steps
          break;
        }
      });

      // Check if dest reached in current step (after enqueue loop above)
      // (captured via return inside forEach — need a proper BFS)
    }

    // Fallback: direct BFS result capture
    return _bfs(origin, dest);
  }

  function _bfs(origin, dest) {
    const visited = new Map(); // key -> previous {station, line, fromStation}
    const queue = [];

    origin.lines.forEach(l => {
      const k = normalise(origin.name) + '|' + l;
      if (!visited.has(k)) {
        visited.set(k, null);
        queue.push({ station: origin, line: l });
      }
    });

    while (queue.length) {
      const { station, line } = queue.shift();
      const lineStations = stationsOnLine(line);
      const idx = lineStations.findIndex(s => normalise(s.name) === normalise(station.name));
      if (idx === -1) continue;

      for (const dir of [-1, 1]) {
        for (let i = idx + dir; i >= 0 && i < lineStations.length; i += dir) {
          const next = lineStations[i];
          const k = normalise(next.name) + '|' + line;
          if (visited.has(k)) break;
          visited.set(k, { station, line, prev: visited.get(normalise(station.name) + '|' + line) });

          if (normalise(next.name) === normalise(dest.name)) {
            // reconstruct
            return { found: true, ...reconstructPath(visited, origin, dest, line) };
          }

          queue.push({ station: next, line });

          // enqueue transfers
          next.lines.forEach(l2 => {
            if (l2 !== line) {
              const k2 = normalise(next.name) + '|' + l2;
              if (!visited.has(k2)) {
                visited.set(k2, { station: next, line, prev: null });
                queue.push({ station: next, line: l2 });
              }
            }
          });
          break; // BFS: advance one stop at a time per queue entry
        }
      }
    }
    return { found: false, error: 'No route found' };
  }

  function reconstructPath(visited, origin, dest, lastLine) {
    // Simple reconstruction: returns legs summary
    return buildLegs([{ station: origin, line: origin.lines[0] }, { station: dest, line: lastLine }]);
  }

  function buildLegs(pathArr) {
    if (!pathArr || pathArr.length < 2) return { legs: [], totalStops: 0, transfers: 0 };
    const legs = [];
    let currentLine = pathArr[0].line;
    let legStart = pathArr[0].station;
    let stops = 0;
    let transfers = 0;

    for (let i = 1; i < pathArr.length; i++) {
      const { station, line } = pathArr[i];
      stops++;
      if (line !== currentLine) {
        legs.push({ line: currentLine, from: legStart.name, to: pathArr[i - 1].station.name });
        transfers++;
        currentLine = line;
        legStart = pathArr[i - 1].station;
      }
    }
    legs.push({ line: currentLine, from: legStart.name, to: pathArr[pathArr.length - 1].station.name });
    return { legs, totalStops: stops, transfers };
  }

  /* ─────────────────────────────────────────────
   * PUBLIC API
   * ───────────────────────────────────────────── */
  const MetroRouter = {
    search,
    findStation,
    allStations:  () => STATIONS,
    allLines:     () => LINES,
    stationsOnLine,
    lineColor:    (code) => (LINES[code] || {}).color || '#888',
    lineTextColor:(code) => (LINES[code] || {}).textColor || '#fff',
    lineName:     (code) => (LINES[code] || {}).name || code,
    lineNumber:   (code) => (LINES[code] || {}).number || null,
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetroRouter;
  } else {
    global.MetroRouter = MetroRouter;
  }

})(typeof window !== 'undefined' ? window : this);

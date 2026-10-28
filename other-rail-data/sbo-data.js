/* ================================================================
   SBO-DATA.JS — Shinsabu network infrastructure
   SBM: Main Line, SBM01 Sainðaul Central → SBM27 Hidano Maeburi.
        34.36 km, 27 stations; km cumulative from SBM01.
   SBO: Oitsura branch, SBO01 Oitsura → SBO10 Kanui Airport T1.
        11.28 km, 10 stations; km cumulative from SBO01.
   Shared track, reversed numbering:
     T1 = SBM12 / SBO10; T2 = SBM13 / SBO09; distance 1.10 km.
   SBO07 = 8.06; SBO08 = 8.06+1.03 = 9.09;
   SBO09 = 8.06+2.12 = 10.18; SBO10 = 10.18+1.10 = 11.28.
   The old +3.38 value at SBO10 is superseded by the shared-track length.
   Keep separate ordered station arrays for the linear router.
   role/parentLine/sharedSections are descriptive metadata, not a
   through-service implementation or a new timetable.
   sbo-tt.js remains unchanged: SBO01↔SBO07 and existing M4 through trains.
   SBM and SBO08–SBO10 additional services remain to be defined.
   Future extension pattern: Local stops SBO08/09/10; Rapid skips SBO08.
================================================================ */
'use strict';

const SBO_INTERCHANGE = {
  SBO01: ['M222', 'CO01', 'KS21', 'JD06'],
  SBO05: ['SHX08', 'SSK06'],
  SBO07: ['M230', 'M415'],
  SBO09: ['SBM13'],
  SBO10: ['SBM12', 'M1027', { code: 'SSK01', transferMin: 5 }, 'M1028', 'AX08', { code: 'AK02', transferMin: 10 }],
  SBM01: [_hub('HUB_SAINDAUL_CENTRAL')],
  SBM02: ['M1016'],
  SBM04: ['M327', 'M1212', 'LL17', 'CO15', 'SHX01', 'AX07'],
  SBM05: ['LL16', { code: 'CO14', transferMin: 5 }, 'M915', { code: 'M1813', transferMin: 8 }],
  SBM07: ['M331', 'M918'],
  SBM10: ['M921'],
  SBM12: ['SBO10', 'M1027', { code: 'SSK01', transferMin: 5 }, 'M1028', 'AX08', { code: 'AK02', transferMin: 10 }],
  SBM13: ['SBO09'],
  SBM15: ['M232', 'SSK03'],
  SBM19: ['KS28', 'AX09', 'SL01'],
};

const SBO_LINES = {
  SBM: {
    id: 'SBM', label: 'SB', name: 'Shinsabu Main Line',
    nameLocal: '', color: '#00CCCC', operator: '', operatorJa: '',
    type: 'private', region: '', circular: false,
    role: 'mainline', totalKm: 34.36, totalStations: 27,
    sharedSections: [{ lineId: 'SBO', stations: ['SBM12', 'SBM13'], partnerStations: ['SBO10', 'SBO09'], lengthKm: 1.10 }],
    stations: [
      { code: 'SBM01', name: 'Sainðaul Central', kanji: '作安崎中央', km: 0.00 }, /* node 229656494 */
      { code: 'SBM02', name: 'Tikkamoto', kanji: '', km: 0.63 }, /* node 128525370 */
      { code: 'SBM03', name: 'Ihkanuda Mattawi', kanji: '', km: 1.21 }, /* node 168306087 */
      { code: 'SBM04', name: 'Herubori', kanji: '杏登', km: 2.20 }, /* node 124066084 */
      { code: 'SBM05', name: 'Shin-Oiseharu', kanji: '新粕墾', km: 3.41 }, /* node 176517123 */
      { code: 'SBM06', name: 'Tsaikikori', kanji: '益飯', km: 4.73 }, /* node 176574645 */
      { code: 'SBM07', name: 'Shin-Tsaikikori', kanji: '新益飯', km: 5.87 }, /* node 183370160 */
      { code: 'SBM08', name: 'Nari-Ðaihate', kanji: '', km: 7.07 }, /* node 201033273 */
      { code: 'SBM09', name: 'Mintōjai', kanji: '', km: 8.00 }, /* node 201033005 */
      { code: 'SBM10', name: 'Shōryan Daishi', kanji: '宵良大師', km: 9.06 }, /* node 201033004 */
      { code: 'SBM11', name: 'Shin-Bukunomatsu', kanji: '新粐頭', km: 10.46 }, /* node 168265320 */
      { code: 'SBM12', name: 'Kanui Airport T1', kanji: '嘉枡空港T1', km: 12.23 }, /* node 126497710 */
      { code: 'SBM13', name: 'Kanui Airport T2', kanji: '嘉枡空港T2', km: 13.33 }, /* node 378079140 */
      { code: 'SBM14', name: 'Sakaisoma', kanji: '沛築', km: 14.37 }, /* node 186957093 */
      { code: 'SBM15', name: 'Shin-Tsukaso', kanji: '新鷸蘇', km: 15.84 }, /* node 126666498 */
      { code: 'SBM16', name: 'Mikori Yashihate', kanji: '', km: 17.19 }, /* node 186957092 */
      { code: 'SBM17', name: 'Sabullan Minerishiba', kanji: '', km: 18.36 }, /* node 168265321 */
      { code: 'SBM18', name: 'Sabullan Kōndasuntotsu', kanji: '王之橋', km: 20.02 }, /* node 168265322 */
      { code: 'SBM19', name: 'Sabullan', kanji: '', km: 21.40 }, /* node 126666496 */
      { code: 'SBM20', name: 'Ibuhama', kanji: '中島', km: 23.00 }, /* node 201216979 */
      { code: 'SBM21', name: 'Narihama Kakkiri', kanji: '東島角紀里', km: 24.30 }, /* node 201216978 */
      { code: 'SBM22', name: 'Soikonji', kanji: '錘厳寺', km: 26.00 }, /* node 201216977 */
      { code: 'SBM23', name: 'Hajayatsu Rinkai', kanji: '波社苫臨海', km: 27.26 }, /* node 201216976 */
      { code: 'SBM24', name: 'Kudoðu', kanji: '九渡種', km: 29.08 }, /* node 201216975 */
      { code: 'SBM25', name: 'Kisako', kanji: '鮃形', km: 31.32 }, /* node 201216974 */
      { code: 'SBM26', name: 'Habunonta', kanji: '', km: 32.30 }, /* node 201216973 */
      { code: 'SBM27', name: 'Hidano Maeburi', kanji: '森見丘釜里', km: 34.36 }, /* node 201216972 */
    ],
  },
  SBO: {
    id: 'SBO', label: 'SB', name: 'Shinsabu Oitsura Line',
    nameLocal: 'યાપ્‌ટરૃે粕鵲線', color: '#00CCCC',
    operator: '', operatorJa: '', type: 'private', region: '', circular: false,
    role: 'branch', parentLine: 'SBM', totalKm: 11.28, totalStations: 10,
    sharedSections: [{ lineId: 'SBM', stations: ['SBO09', 'SBO10'], partnerStations: ['SBM13', 'SBM12'], lengthKm: 1.10 }],
    stations: [
      { code: 'SBO01', name: 'Oitsura', kanji: '粕鵲', km: 0.00 }, /* node 201351276 */
      { code: 'SBO02', name: 'Otsumi-Oitsura', kanji: '南粕鵲', km: 1.27 }, /* node 201351277 */
      { code: 'SBO03', name: 'Arasatolo', kanji: '', km: 2.38 }, /* node 201351278 */
      { code: 'SBO04', name: 'Oboesāri', kanji: '岡川', km: 4.16 }, /* node 201351279 */
      { code: 'SBO05', name: 'Yakkomai', kanji: '藥孤梅', km: 5.35 }, /* node 201351280 */
      { code: 'SBO06', name: 'Takurake Nagida', kanji: '', km: 6.51 }, /* node 201351281 */
      { code: 'SBO07', name: 'Kawaei', kanji: '珂夬栄', km: 8.06 }, /* node 126666499 */
      { code: 'SBO08', name: 'Osenude Keiðaī Daigaku', kanji: '防斉經濟大學', km: 9.09 }, /* node 20114044 */
      { code: 'SBO09', name: 'Kanui Airport T2', kanji: '嘉枡空港T2', km: 10.18 }, /* node 378079140 */
      { code: 'SBO10', name: 'Kanui Airport T1', kanji: '嘉枡空港T1', km: 11.28 }, /* node 126497710 */
    ],
  },
};

if (typeof SUBURBAN_LINES !== 'undefined') Object.assign(SUBURBAN_LINES, SBO_LINES);
if (typeof SUBURBAN_INTERCHANGE !== 'undefined') {
  const codeOf = entry => typeof entry === 'string' ? entry : entry.code;
  const add = (key, entry) => {
    const list = SUBURBAN_INTERCHANGE[key] || (SUBURBAN_INTERCHANGE[key] = []);
    const code = codeOf(entry), i = list.findIndex(e => codeOf(e) === code);
    if (i < 0) list.push(entry);
    else if (typeof entry === 'object' && entry.transferMin != null) {
      list[i] = { ...(typeof list[i] === 'object' ? list[i] : {}), ...entry };
    }
  };
  for (const [from, partners] of Object.entries(SBO_INTERCHANGE)) {
    for (const entry of partners) {
      const to = codeOf(entry);
      add(from, entry);
      /* Match IBC: reverse non-metro links; metro maps own their reverse. */
      if (!/^M\d/.test(to)) add(to, typeof entry === 'string' ? from : { code: from, transferMin: entry.transferMin });
    }
  }
}

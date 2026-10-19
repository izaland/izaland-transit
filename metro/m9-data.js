/* ================================================================
   M9-DATA.JS — Metro Line 9
   ================================================================
   21 stazioni · M901 Kishagoi - Exhibitown → M921 Shōryan Daishi
   Colore: #C40062
   Distanze progressive da M901 (km 0.00), totale 21.63 km.

   Interscambi:
     M901  M801, M1719, KW00    (Kishagoi - Exhibitown)
     M904  M418, M611, SK34, TS15, CK17   (Nihkyonta, node 368583226, 7 min a piedi)
     M905  M1202                (Kushihama)
     M906  M1203                (Hadantoyo)
     M907  M1204                (Yeisonzuta)
     M908  M113                 (Takkurahama)
     M910  M807                 (Awasada)
     M911  M1014                (Kanbata)
     M912  M208, M815           (Egunsen Botanical Garden)
     M913  M118, M325, M1413, M209 (Masuda Agarai; M209 = node 145681683, 5 min a piedi)
     M914  M1018, SHX02         (Eigan-ji)
     M915  LL16                 (Oiseharu, 2 min a piedi)
     M916  LL14, CO12           (Tomiganei)
     M918  M331                 (Shin-Tsaikikori)
================================================================ */
'use strict';

const M9_ST = {
  M901: { n: 'Kishagoi - Exhibitown',     k: '喜舎拘',              nodeId: 169508181, km:  0.00 },
  M902: { n: 'Shin-Tsumasui',             k: '新都馬水',            nodeId: 368583211, km:  0.98 },
  M903: { n: 'Hakanba Shinkō',           k: '材場新港',            nodeId: 368583212, km:  2.14 },
  M904: { n: 'Nihkyonta Mirai',           k: '濱角未來',            nodeId: 369511437, km:  3.18 },
  M905: { n: 'Kushihama',                 k: '柚島',                nodeId: 450978442, km:  4.13 },
  M906: { n: 'Hadantoyo',                 k: '琦砂',                nodeId: 368583213, km:  5.07 },
  M907: { n: 'Yeisonzuta',                k: '八砅',                nodeId: 369511438, km:  6.00 },
  M908: { n: 'Takkurahama',               k: '琢玖羅島',            nodeId: 368744269, km:  7.02 },
  M909: { n: 'Teyomuka',                  k: '',                    nodeId: 135874133, km:  7.85 },
  M910: { n: 'Awasada',                   k: '邊褒',                nodeId: 129227940, km:  9.06 },
  M911: { n: 'Kanbata',                   k: '巻岩',                nodeId: 177044015, km: 10.38 },
  M912: { n: 'Egunsen Botanical Garden',  k: '慧群仙植物園',        nodeId: 128525299, km: 11.69 },
  M913: { n: 'Masuda Agarai',             k: '馬砅任尭',            nodeId: 128669528, km: 12.66 },
  M914: { n: 'Eigan-ji',                  k: '栄鳳寺',              nodeId: 128669527, km: 13.92 },
  M915: { n: 'Oiseharu (Metro)',          k: '粕墾[地下鐵]',        nodeId: 176668162, km: 15.16 },
  M916: { n: 'Tomiganei',                 k: '庭ヶ汢',              nodeId: 124066081, km: 16.76 },
  M917: { n: 'Tsurunara',                 k: '守治',                nodeId: 229641679, km: 17.45 },
  M918: { n: 'Shin-Tsaikikori',           k: '新益飯',              nodeId: 183370160, km: 18.39 },
  M919: { n: 'Wasehai-Nuhajori',          k: '伯拝鋤恵',            nodeId: 201033001, km: 19.74 },
  M920: { n: 'Matori Nanmun',             k: '馬狀南門',            nodeId: 201033000, km: 20.65 },
  M921: { n: 'Shōryan Daishi',           k: '宵良大師',            nodeId: 201033004, km: 21.63 },
};

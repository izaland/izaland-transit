from pathlib import Path
from scripts.propose_ogf_mapping import (
    decode_js_string,
    extract_station_records,
    looks_like_service,
    looks_like_station,
)

SAMPLE = r'''
const M20_STATIONS = {
  M2001: { n: 'Sain\u00f0aul Central', ogfId: 229656494, km: 0 },
  M2002: { n: 'Kanbata', ogfId: 1177044015, km: 6.6 },
};

const NONSTOP = { A: 'Nonstop Express', headway: 10 };
'''

def test_decodes_unicode_and_preserves_id(tmp_path):
    path = tmp_path / 'sample-data.js'
    path.write_text(SAMPLE, encoding='utf-8')

    records, diagnostics = extract_station_records(path)

    assert not diagnostics
    assert len(records) == 2
    assert records[0]['entries']['n'] == 'Sainðaul Central'
    assert records[0]['entries']['ogfId'] == 229656494
    assert records[1]['entries']['ogfId'] == 1177044015

def test_services_are_not_stations():
    entries = {'A': 'Nonstop Express', 'headway': 10}
    assert looks_like_service(entries)
    assert not looks_like_station(entries)

def test_parses_array_of_station_objects(tmp_path):
    sample = '''
    const STATIONS = [
      { code: 'M2001', n: 'Sain\\u00f0aul Central', ogfId: 229656494, km: 0 },
      { code: 'M2002', n: 'Kanbata', ogfId: 1177044015, km: 6.6 },
    ];
    '''
    path = tmp_path / 'sample-data.js'
    path.write_text(sample, encoding='utf-8')

    records, diagnostics = extract_station_records(path)

    assert not diagnostics
    assert len(records) == 2
    assert records[0]['entries']['ogfId'] == 229656494
    assert records[1]['entries']['ogfId'] == 1177044015

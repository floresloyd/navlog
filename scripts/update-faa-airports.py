"""Import FAA NASR APT CSV ZIP into the dated airport lookup.

Usage: python3 scripts/update-faa-airports.py ZIP_URL
Use the APT CSV link from the FAA NASR subscription page for the current cycle.
"""
import csv
import io
import json
import sys
import urllib.request
import zipfile
from pathlib import Path

if len(sys.argv) != 2 or not sys.argv[1].startswith('https://nfdc.faa.gov/'):
    raise SystemExit('Pass the FAA NASR APT CSV ZIP URL from nfdc.faa.gov')
request = urllib.request.Request(sys.argv[1], headers={'User-Agent': 'NavLog FAA NASR importer'})
with urllib.request.urlopen(request, timeout=30) as response:
    archive = zipfile.ZipFile(io.BytesIO(response.read()))
with archive.open('APT_BASE.csv') as source:
    records = csv.DictReader(io.TextIOWrapper(source, encoding='utf-8-sig'))
    airports = {}
    for row in records:
        code = row['ICAO_ID'].strip()
        if len(code) != 4:
            continue
        variation = row['MAG_VARN'].strip()
        airports[code] = {
            'name': row['ARPT_NAME'].strip(),
            'city': row['CITY'].strip(),
            'elevationFt': row['ELEV'].strip(),
            'variation': (variation + '° ' + row['MAG_HEMIS'].strip()) if variation else '',
            'effectiveDate': row['EFF_DATE'].strip(),
        }
if not {'KMIA', 'KFLL'}.issubset(airports):
    raise SystemExit('Import failed: expected airports missing')
output = Path('src/data/faaAirports.json')
output.write_text(json.dumps(airports, separators=(',', ':')) + '\n')
print(f'Wrote {len(airports)} FAA airports effective {airports["KMIA"]["effectiveDate"]}')

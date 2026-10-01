"""Verify the normalized portfolio against the supplied workbook-derived JSON."""
import json
from collections import Counter
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'data/portfolio/holdings.json').read_text())['holdings']
assert len(data) == 29, f'Expected 29 holdings, found {len(data)}'
assert len({x['id'] for x in data}) == len(data), 'Duplicate holding IDs found'
assert all(x['purchasePrice'] > 0 and x['quantity'] > 0 for x in data), 'Invalid holding input'
print('holdings:', len(data))
print('sectors:', dict(Counter(x['sector'] for x in data)))
print('investment:', round(sum(x['purchasePrice'] * x['quantity'] for x in data), 2))
print('OK')

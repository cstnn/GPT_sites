"""Preview an explicit schema-4 Drive cutover; never writes to Drive.

Run with the freshly downloaded Drive JSON and the published canonical JSON.
The output records the expected original bytes so a deployment can reject stale
cutovers instead of overwriting changes made after this review.
"""
import argparse
import hashlib
import json
from pathlib import Path
from portfolio_status import merge_status, newer_or_equal


def prepare(drive_bytes, published):
    original = json.loads(drive_bytes)
    ids = lambda snapshot: [p['product_id'] for p in snapshot['products']]
    if len(set(ids(original))) != len(ids(original)) or len(set(ids(published))) != len(ids(published)):
        raise ValueError('Duplicate product IDs require review')
    if set(ids(original)) != set(ids(published)):
        raise ValueError('Product membership differs; review a fresh complete scan before cutover')
    merged = merge_status(original, published)
    saved = {p['product_id']: p for p in published['products']}
    for p in merged['products']:
        old = saved[p['product_id']]
        if old.get('last_update_source') == 'dashboard' and newer_or_equal(old.get('updated_at'), p.get('updated_at')):
            p['updated_at'] = old['updated_at']
    return {
        'type': 'drive_portfolio_cutover_preview',
        'expected_drive_sha256': hashlib.sha256(drive_bytes).hexdigest(),
        'source_schema_version': original.get('schema_version'),
        'target_schema_version': 4,
        'product_count': len(merged['products']),
        'portfolio': merged,
        'note': 'Preview only. Back up the original file; verify its hash again before in-place update.'
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--drive', required=True)
    parser.add_argument('--published', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    result = prepare(Path(args.drive).read_bytes(), json.loads(Path(args.published).read_text()))
    Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f"Prepared {result['product_count']} records; no Drive writes performed.")

"""Lossless stage migration and explicit dashboard/publication reconciliation."""
import copy
from datetime import datetime

def newer_or_equal(a, b):
    def parse(value):
        return datetime.fromisoformat(value.replace('Z', '+00:00')).timestamp() if value else float('-inf')
    return parse(a) >= parse(b)

STAGES = {'idea': 'Idea / Concept', 'specs_ready': 'Specs ready',
          '3mf_ready': '3MF ready', 'print_ready': 'Print ready',
          'to_publish': 'To Publish', 'published': 'Published'}
LEGACY = {'idea': 'idea', 'specs': 'specs_ready', '3mf': '3mf_ready',
          'to_print': 'print_ready', 'printed': 'to_publish', 'published': 'published'}
PLATFORMS = ('thangs', 'makerworld')

def stage(value):
    value = LEGACY.get(value, value)
    if value not in STAGES:
        raise ValueError('Unknown stage: '+str(value))
    return value

def migrate(snapshot):
    result = copy.deepcopy(snapshot)
    result['schema_version'] = 4
    for p in result['products']:
        p['stage'] = stage(p['stage'])
        # null means unknown/unverified; never infer from overall stage or flags.
        publication = p.setdefault('publication', {})
        for platform in PLATFORMS:
            publication.setdefault(platform, None)
    counts = result.get('reconciliation', {}).get('stage_counts')
    if counts is not None:
        migrated = {}
        for key, count in counts.items():
            canonical = stage(key)
            migrated[canonical] = migrated.get(canonical, 0) + count
        result['reconciliation']['stage_counts'] = migrated
    if 'status_contract' in result:
        result['status_contract']['stages'] = list(STAGES)
    return result

def merge_status(current, previous, changes=None):
    """Input inventory determines membership; saved platform decisions survive scans.

    Explicit newer platform evidence must include publication_updated_at[platform].
    Folder placement alone never constitutes platform evidence.
    """
    current = migrate(current)
    saved = {p['product_id']: p for p in migrate(previous)['products']}
    for p in current['products']:
        old = saved.get(p['product_id'], {})
        for field, value in old.items():
            p.setdefault(field, copy.deepcopy(value))
        if old.get('last_update_source') == 'dashboard' and newer_or_equal(old.get('updated_at', ''), p.get('updated_at', '')):
            p['stage'] = old['stage']
        location = p.get('location', '').split('/')
        gate = 'published' if 'PUBLISHED' in location else 'to_publish' if 'READY TO PUBLISH' in location else None
        if gate:
            p['stage'] = gate
        for field in ('history', 'assessment_history'):
            events = copy.deepcopy(old.get(field, []))
            for event in p.get(field, []):
                if event not in events:
                    events.append(event)
            if events or field in old or field in p:
                p[field] = events
        for platform in PLATFORMS:
            old_at = old.get('publication_updated_at', {}).get(platform, '')
            new_at = p.get('publication_updated_at', {}).get(platform, '')
            if platform in old.get('publication', {}) and (not new_at or newer_or_equal(old_at, new_at)):
                p['publication'][platform] = old['publication'][platform]
                if old_at:
                    p.setdefault('publication_updated_at', {})[platform] = old_at
        override = (changes or {}).get(p['product_id'], {})
        at = override.get('updated_at', '')
        if override and not at:
            raise ValueError('Dashboard changes require updated_at')
        updates = {}
        if 'stage' in override:
            target = stage(override['stage'])
            # Physical folder gates retain their authority.
            if gate:
                if target != gate:
                    p['needs_review'] = True
                target = gate
            if newer_or_equal(override.get('stage_updated_at', at), p.get('updated_at', '')):
                updates['stage'] = target
        for platform, value in override.get('publication', {}).items():
            if platform not in PLATFORMS or type(value) is not bool:
                raise ValueError('Publication overrides require platform booleans')
            if newer_or_equal(override.get('publication_updated_at', {}).get(platform, at), p.get('publication_updated_at', {}).get(platform, '')):
                updates['publication.'+platform] = value
        for field, value in updates.items():
            if field.startswith('publication.'):
                platform = field.split('.')[1]
                before = p['publication'][platform]
                p['publication'][platform] = value
                p.setdefault('publication_updated_at', {})[platform] = override.get('publication_updated_at', {}).get(platform, at)
            else:
                before = p.get(field)
                p[field] = value
            if before != value:
                p.setdefault('history', []).append(dict(at=at, source='dashboard', field=field,
                                                       **{'from': before, 'to': value}, note='Explicit dashboard change'))
        if updates:
            if newer_or_equal(at, p.get('updated_at', '')):
                p['updated_at'] = at
            p['last_update_source'] = 'dashboard'
    if 'assessment_policy' in previous:
        current['assessment_policy'] = copy.deepcopy(previous['assessment_policy'])
    if 'reconciliation' in current:
        current['reconciliation']['stage_counts'] = {s: sum(p['stage'] == s for p in current['products']) for s in STAGES}
    return current

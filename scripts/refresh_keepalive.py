from __future__ import annotations
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = ROOT / '.github' / 'journal-keepalive'
INTERVAL = timedelta(days=30)


def parse(value: str):
    value=(value or '').strip()
    if not value:
        return None
    try:
        dt=datetime.fromisoformat(value.replace('Z','+00:00'))
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except ValueError:
        return None

now=datetime.now(timezone.utc)
last=parse(MARKER.read_text(encoding='utf-8') if MARKER.exists() else '')
if last is None or now-last >= INTERVAL:
    MARKER.parent.mkdir(parents=True,exist_ok=True)
    MARKER.write_text(now.isoformat().replace('+00:00','Z')+'\n',encoding='utf-8')
    print('keepalive refreshed')
else:
    print(f'keepalive not due ({(now-last).days} days old)')

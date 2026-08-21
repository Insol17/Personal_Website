from __future__ import annotations
import json, re, html, sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from xml.etree import ElementTree as ET
from email.utils import parsedate_to_datetime

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'data' / 'journal.json'
RSS = 'https://rss.blog.naver.com/cine_insol.xml'
BLOG = 'https://blog.naver.com/cine_insol'
TAG_RE = re.compile(r'<[^>]+>')
IMG_RE = re.compile(r'<img[^>]+src=["\']([^"\']+)', re.I)

def text(node, name):
    child = node.find(name)
    return (child.text or '').strip() if child is not None and child.text else ''

def clean(value):
    value = html.unescape(TAG_RE.sub(' ', value or ''))
    return re.sub(r'\s+', ' ', value).strip()

def fmt_date(value):
    try:
        return parsedate_to_datetime(value).strftime('%Y.%m.%d')
    except Exception:
        return value[:10].replace('-', '.') if value else ''

def main():
    req = Request(RSS, headers={
        'User-Agent':'Mozilla/5.0 PortfolioJournalSync/1.0',
        'Accept':'application/rss+xml, application/xml, text/xml, */*'
    })
    try:
        with urlopen(req, timeout=25) as response:
            xml = response.read()
        root = ET.fromstring(xml)
    except (URLError, HTTPError, TimeoutError, ET.ParseError) as exc:
        # A feed outage must never erase or replace the last known-good journal.
        print(f'journal sync skipped: {exc}', file=sys.stderr)
        return

    posts = []
    for item in root.findall('.//item')[:30]:
        description = text(item, 'description')
        match = IMG_RE.search(description)
        posts.append({
            'date': fmt_date(text(item, 'pubDate')),
            'category': text(item, 'category') or 'JOURNAL',
            'title': clean(text(item, 'title')),
            'excerpt': clean(description)[:220],
            'link': text(item, 'link') or BLOG,
            'image': match.group(1) if match else '',
        })

    if not posts:
        print('journal sync skipped: feed contained no posts', file=sys.stderr)
        return

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({'source':RSS,'blog':BLOG,'posts':posts}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'wrote {len(posts)} posts -> {OUT}')

if __name__ == '__main__':
    main()

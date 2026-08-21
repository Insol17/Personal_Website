from __future__ import annotations
import json, re, html, sys, hashlib, shutil
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from xml.etree import ElementTree as ET
from email.utils import parsedate_to_datetime

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'data' / 'journal.json'
MEDIA_DIR = ROOT / 'assets' / 'data' / 'journal-media'
RSS = 'https://rss.blog.naver.com/cine_insol.xml'
BLOG = 'https://blog.naver.com/cine_insol'
TAG_RE = re.compile(r'<[^>]+>')
IMG_RE = re.compile(r'<img[^>]+(?:src|data-lazy-src)=["\']([^"\']+)', re.I)
CONTENT_TAGS = {'description','encoded','content','summary'}
CONTENT_TYPE_EXT = {
    'image/jpeg':'.jpg','image/jpg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif'
}

def local_name(tag: str) -> str:
    return tag.rsplit('}', 1)[-1].lower()

def child_text(node, name):
    for child in list(node):
        if local_name(child.tag) == name.lower() and child.text:
            return child.text.strip()
    return ''

def content_fragments(item):
    fragments=[]
    for child in item.iter():
        if child is item: continue
        if local_name(child.tag) in CONTENT_TAGS and child.text:
            fragments.append(child.text)
    return fragments

def clean(value):
    value = html.unescape(value or '')
    value = html.unescape(value)  # Naver can entity-escape embedded HTML more than once.
    value = TAG_RE.sub(' ', value)
    return re.sub(r'\s+', ' ', value).strip()

def fmt_date(value):
    try:
        return parsedate_to_datetime(value).strftime('%Y.%m.%d')
    except Exception:
        return value[:10].replace('-', '.') if value else ''

def first_image(item):
    # Prefer RSS media/enclosure fields when available.
    for child in item.iter():
        name=local_name(child.tag)
        if name in {'thumbnail','content','enclosure'}:
            url=(child.attrib.get('url') or child.attrib.get('href') or '').strip()
            kind=(child.attrib.get('type') or '').lower()
            if url and (name!='enclosure' or not kind or kind.startswith('image/')):
                return html.unescape(url)
    # Then inspect all HTML-bearing RSS fields, including content:encoded.
    for fragment in content_fragments(item):
        decoded=html.unescape(html.unescape(fragment))
        match=IMG_RE.search(decoded)
        if match:
            return html.unescape(match.group(1))
    return ''

def cache_image(url: str, index: int) -> str:
    if not url: return ''
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    digest=hashlib.sha1(url.encode('utf-8')).hexdigest()[:16]
    req=Request(url,headers={
        'User-Agent':'Mozilla/5.0 PortfolioJournalSync/2.0',
        'Referer':BLOG+'/',
        'Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    })
    try:
        with urlopen(req,timeout=20) as response:
            ctype=(response.headers.get_content_type() or '').lower()
            if not ctype.startswith('image/'): return ''
            ext=CONTENT_TYPE_EXT.get(ctype, Path(url.split('?',1)[0]).suffix.lower())
            if ext not in {'.jpg','.jpeg','.png','.webp','.gif'}: ext='.jpg'
            data=response.read(6_000_001)
            if not data or len(data)>6_000_000: return ''
        filename=f'{index:02d}-{digest}{ext}'
        (MEDIA_DIR/filename).write_bytes(data)
        return f'assets/data/journal-media/{filename}'
    except Exception as exc:
        print(f'journal image skipped: {url} ({exc})', file=sys.stderr)
        return ''

def main():
    req = Request(RSS, headers={
        'User-Agent':'Mozilla/5.0 PortfolioJournalSync/2.0',
        'Accept':'application/rss+xml, application/xml, text/xml, */*'
    })
    try:
        with urlopen(req, timeout=25) as response:
            xml = response.read()
        root = ET.fromstring(xml)
    except (URLError, HTTPError, TimeoutError, ET.ParseError) as exc:
        print(f'journal sync skipped: {exc}', file=sys.stderr)
        return

    # Replace media only after a feed was fetched successfully; a feed outage keeps old assets/data intact.
    temp_media=MEDIA_DIR.with_name('journal-media-next')
    if temp_media.exists(): shutil.rmtree(temp_media)
    old_media_dir=MEDIA_DIR
    globals()['MEDIA_DIR']=temp_media

    posts = []
    items=root.findall('.//item')[:30]
    for idx,item in enumerate(items,1):
        fragments=content_fragments(item)
        description=next((f for f in fragments if clean(f)), child_text(item,'description'))
        remote_image=first_image(item)
        local_image=cache_image(remote_image,idx) if remote_image else ''
        if local_image:
            local_image=local_image.replace('journal-media-next','journal-media')
        posts.append({
            'date': fmt_date(child_text(item, 'pubDate')),
            'category': child_text(item, 'category') or 'JOURNAL',
            'title': clean(child_text(item, 'title')),
            'excerpt': clean(description)[:220],
            'link': child_text(item, 'link') or BLOG,
            'image': local_image,
            'sourceImage': remote_image if remote_image and not local_image else '',
        })

    if not posts:
        print('journal sync skipped: feed contained no posts', file=sys.stderr)
        if temp_media.exists(): shutil.rmtree(temp_media)
        return

    # Atomically replace cached media only after parsing succeeded.
    globals()['MEDIA_DIR']=old_media_dir
    if old_media_dir.exists(): shutil.rmtree(old_media_dir)
    if temp_media.exists(): temp_media.rename(old_media_dir)
    else: old_media_dir.mkdir(parents=True, exist_ok=True)
    (old_media_dir / '.gitkeep').touch(exist_ok=True)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({'source':RSS,'blog':BLOG,'posts':posts}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'wrote {len(posts)} posts -> {OUT}')

if __name__ == '__main__':
    main()

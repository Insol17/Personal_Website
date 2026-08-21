from __future__ import annotations
import json, re, html, sys, hashlib, shutil, time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from urllib.parse import urlparse, parse_qs
from xml.etree import ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'data' / 'journal.json'
MEDIA_DIR = ROOT / 'assets' / 'data' / 'journal-media'
DEFAULT_BLOG_ID = 'cine_insol'
BLOG_ID = DEFAULT_BLOG_ID
RSS = f'https://rss.blog.naver.com/{BLOG_ID}.xml'
BLOG = f'https://blog.naver.com/{BLOG_ID}'
TAG_RE = re.compile(r'<[^>]+>')
IMG_RE = re.compile(r'<img[^>]+(?:src|data-lazy-src|data-src)=["\']([^"\']+)', re.I)
CONTENT_TAGS = {'description','encoded','content','summary'}
CONTENT_TYPE_EXT = {'image/jpeg':'.jpg','image/jpg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif'}
CATEGORY_PRIORITY=['DEVLOG','MOVIES','GAMES','BOOKS','MUSIC','DAILY','PHOTO','WORK','CRITIQUE','LIFE']


def resolve_blog_source():
    """Use the Admin-published blog URL as the sync source when available."""
    global BLOG_ID, RSS, BLOG
    candidates=[ROOT/'user-content'/'site.json',ROOT/'content'/'site.json',ROOT/'defaults'/'site.json']
    url=''
    for path in candidates:
        try:
            data=json.loads(path.read_text(encoding='utf-8'))
            url=(data.get('journal') or {}).get('blogUrl') or (data.get('contact') or {}).get('blog') or ''
            if url:break
        except Exception:
            continue
    env_id=(__import__('os').environ.get('NAVER_BLOG_ID') or '').strip()
    if env_id:
        blog_id=env_id
    else:
        m=re.search(r'blog\.naver\.com/([^/?#]+)',url or '',re.I)
        blog_id=(m.group(1) if m else DEFAULT_BLOG_ID).strip()
    if not re.fullmatch(r'[A-Za-z0-9_.-]+',blog_id):
        raise RuntimeError(f'invalid Naver blog id: {blog_id!r}')
    BLOG_ID=blog_id
    BLOG=f'https://blog.naver.com/{BLOG_ID}'
    RSS=f'https://rss.blog.naver.com/{BLOG_ID}.xml'
    return BLOG_ID

def fetch_with_retries(url,accept,referer,attempts=3,timeout=25):
    last=None
    for attempt in range(1,attempts+1):
        try:return fetch_bytes(url,accept=accept,referer=referer,timeout=timeout)
        except Exception as exc:
            last=exc
            if attempt<attempts:time.sleep(1.2*attempt)
    raise last

def title_quality(value):
    value=clean(value)
    if not value:return -100
    low=value.lower()
    generic={'untitled','리뷰','review','네이버 블로그','blog','movies','games','devlog'}
    score=min(len(value),80)
    if low in generic:score-=80
    if len(value)<=3:score-=35
    if '네이버 블로그' in value:score-=25
    return score

def choose_title(rss_title,page_title):
    # RSS title is normally the canonical post title. Page metadata is only a repair fallback.
    rss_title=clean(rss_title);page_title=clean(page_title)
    return rss_title if title_quality(rss_title)>=title_quality(page_title) else page_title

class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True);self.meta={};self.title=[];self.in_title=False
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag.lower()=='meta':
            key=(attrs.get('property') or attrs.get('name') or '').lower().strip()
            value=(attrs.get('content') or '').strip()
            if key and value and key not in self.meta:self.meta[key]=value
        elif tag.lower()=='title':self.in_title=True
    def handle_endtag(self,tag):
        if tag.lower()=='title':self.in_title=False
    def handle_data(self,data):
        if self.in_title:self.title.append(data)

def local_name(tag: str) -> str:return tag.rsplit('}',1)[-1].lower()
def child_text(node,name):
    for child in list(node):
        if local_name(child.tag)==name.lower() and child.text:return child.text.strip()
    return ''
def child_texts(node,name):
    return [(child.text or '').strip() for child in list(node) if local_name(child.tag)==name.lower() and (child.text or '').strip()]
def content_fragments(item):
    return [child.text for child in item.iter() if child is not item and local_name(child.tag) in CONTENT_TAGS and child.text]
def clean(value):
    value=html.unescape(html.unescape(value or ''));value=TAG_RE.sub(' ',value)
    return re.sub(r'\s+',' ',value).strip()
def fmt_date(value):
    try:return parsedate_to_datetime(value).strftime('%Y.%m.%d')
    except Exception:return value[:10].replace('-','.') if value else ''
def choose_category(values):
    vals=[clean(v).upper() for v in values if clean(v)]
    for key in CATEGORY_PRIORITY:
        if any(key in v for v in vals):return key
    return clean(values[0]) if values else 'JOURNAL'
def group_for(category):
    c=(category or '').upper()
    if 'DEVLOG' in c or 'WORK' in c:return 'WORK'
    if any(k in c for k in ['MOVIES','MOVIE','GAMES','GAME','BOOKS','BOOK','MUSIC','CRITIQUE']):return 'CRITIQUE'
    if any(k in c for k in ['DAILY','PHOTO','LIFE']):return 'LIFE'
    return 'JOURNAL'
def post_id_from(*values):
    for value in values:
        if not value:continue
        m=re.search(r'(?:logNo=|/)(\d{8,})(?:\D|$)',value)
        if m:return m.group(1)
    return ''
def canonical_post_url(log_no,link=''):
    if log_no:return f'https://blog.naver.com/{BLOG_ID}/{log_no}'
    return link or BLOG
def mobile_post_url(log_no):return f'https://m.blog.naver.com/{BLOG_ID}/{log_no}' if log_no else ''
def fetch_bytes(url,accept='text/html,*/*;q=0.8',referer=BLOG+'/',timeout=20):
    req=Request(url,headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/142 Safari/537.36','Accept':accept,'Accept-Language':'ko-KR,ko;q=0.9,en;q=0.7','Referer':referer})
    with urlopen(req,timeout=timeout) as response:return response.read(),(response.headers.get_content_type() or '').lower()
def fetch_post_meta(log_no):
    if not log_no:return {}
    urls=[mobile_post_url(log_no),f'https://blog.naver.com/PostView.naver?blogId={BLOG_ID}&logNo={log_no}&redirect=Dlog&widgetTypeCall=true']
    for url in urls:
        try:
            raw,_=fetch_bytes(url,timeout=18);text=raw.decode('utf-8','replace');parser=MetaParser();parser.feed(text)
            meta=parser.meta;title=clean(meta.get('og:title') or ''.join(parser.title));desc=clean(meta.get('og:description') or meta.get('description') or '')
            image=html.unescape(meta.get('og:image') or '').strip()
            title=re.sub(r'\s*[:|]\s*네이버 블로그\s*$','',title).strip()
            if title or desc or image:return {'title':title,'excerpt':desc,'image':image,'page':url}
        except Exception as exc:print(f'post metadata skipped {log_no}: {exc}',file=sys.stderr)
    return {}
def first_rss_image(item):
    for child in item.iter():
        name=local_name(child.tag)
        if name in {'thumbnail','content','enclosure'}:
            url=(child.attrib.get('url') or child.attrib.get('href') or '').strip();kind=(child.attrib.get('type') or '').lower()
            if url and (name!='enclosure' or not kind or kind.startswith('image/')):return html.unescape(url)
    for fragment in content_fragments(item):
        match=IMG_RE.search(html.unescape(html.unescape(fragment)))
        if match:return html.unescape(match.group(1))
    return ''
def usable_image(url):
    if not url:return False
    low=url.lower()
    return not any(x in low for x in ['blogpfthumb','profile','sp_blog','favicon','default'])
def cache_image(url,index):
    if not url:return ''
    MEDIA_DIR.mkdir(parents=True,exist_ok=True);digest=hashlib.sha1(url.encode()).hexdigest()[:16]
    try:
        data,ctype=fetch_bytes(url,accept='image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',timeout=20)
        if not ctype.startswith('image/') or not data or len(data)>6_000_000:return ''
        ext=CONTENT_TYPE_EXT.get(ctype,Path(url.split('?',1)[0]).suffix.lower())
        if ext not in {'.jpg','.jpeg','.png','.webp','.gif'}:ext='.jpg'
        filename=f'{index:02d}-{digest}{ext}';(MEDIA_DIR/filename).write_bytes(data)
        return f'assets/data/journal-media/{filename}'
    except Exception as exc:print(f'journal image skipped: {url} ({exc})',file=sys.stderr);return ''
def merge_old_posts(new_posts):
    """RSS is a recent-post feed. Preserve older cached posts that are no longer in the feed."""
    try:old=json.loads(OUT.read_text(encoding='utf-8')).get('posts',[])
    except Exception:old=[]
    seen={(p.get('id') or p.get('link')) for p in new_posts}
    for p in old:
        key=p.get('id') or p.get('link')
        if key and key not in seen:new_posts.append(p);seen.add(key)
    def key(p):
        try:return datetime.strptime(p.get('date',''),'%Y.%m.%d')
        except Exception:return datetime.min
    new_posts.sort(key=key,reverse=True)
    return new_posts

def main():
    resolve_blog_source()
    print(f'Naver journal source: {BLOG_ID} ({RSS})')
    try:
        xml,_=fetch_with_retries(RSS,accept='application/rss+xml,application/xml,text/xml,*/*',referer=BLOG+'/',attempts=3,timeout=25)
        root=ET.fromstring(xml)
    except (URLError,HTTPError,TimeoutError,ET.ParseError,OSError) as exc:
        print(f'journal sync FAILED: {exc}',file=sys.stderr)
        raise SystemExit(2)
    temp_media=MEDIA_DIR.with_name('journal-media-next')
    if temp_media.exists():shutil.rmtree(temp_media)
    old_media_dir=MEDIA_DIR
    # Seed the next cache with the existing cache so older retained RSS entries never lose their thumbnails.
    if old_media_dir.exists():shutil.copytree(old_media_dir,temp_media)
    else:temp_media.mkdir(parents=True,exist_ok=True)
    globals()['MEDIA_DIR']=temp_media
    posts=[];items=root.findall('.//item')[:60]
    for idx,item in enumerate(items,1):
        rss_link=child_text(item,'link') or child_text(item,'guid');log_no=post_id_from(rss_link,child_text(item,'guid'));page=fetch_post_meta(log_no)
        fragments=content_fragments(item);rss_desc=next((f for f in fragments if clean(f)),child_text(item,'description'))
        title=choose_title(child_text(item,'title'),page.get('title')) or 'Untitled'
        excerpt=page.get('excerpt') or clean(rss_desc)
        categories=child_texts(item,'category');category=choose_category(categories)
        rss_image=first_rss_image(item);remote_image=(page.get('image') if usable_image(page.get('image','')) else '') or rss_image
        local_image=cache_image(remote_image,idx) if remote_image else ''
        if local_image:local_image=local_image.replace('journal-media-next','journal-media')
        posts.append({'id':log_no or canonical_post_url(log_no,rss_link),'date':fmt_date(child_text(item,'pubDate')),'category':category,'group':group_for(category),'title':title,'excerpt':excerpt[:260],'link':canonical_post_url(log_no,rss_link),'image':local_image,'sourceImage':remote_image if remote_image and not local_image else ''})
    if not posts:
        print('journal sync FAILED: feed contained no posts',file=sys.stderr)
        if temp_media.exists():shutil.rmtree(temp_media)
        raise SystemExit(3)
    globals()['MEDIA_DIR']=old_media_dir
    # Move the new current-feed cache first. Older journal entries retain sourceImage if their old local file disappears.
    if old_media_dir.exists():shutil.rmtree(old_media_dir)
    if temp_media.exists():temp_media.rename(old_media_dir)
    else:old_media_dir.mkdir(parents=True,exist_ok=True)
    (old_media_dir/'.gitkeep').touch(exist_ok=True)
    posts=merge_old_posts(posts)
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps({'source':RSS,'blog':BLOG,'syncedAt':datetime.now(timezone.utc).isoformat(),'posts':posts},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f"wrote {len(posts)} posts -> {OUT} | DEVLOG={sum(1 for p in posts if p.get('group')=='WORK')} CRITIQUE={sum(1 for p in posts if p.get('group')=='CRITIQUE')} LIFE={sum(1 for p in posts if p.get('group')=='LIFE')}")
if __name__=='__main__':main()

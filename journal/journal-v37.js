let posts=[];
const FALLBACK=[];
function clean(value=''){const div=document.createElement('div');div.innerHTML=value;return (div.textContent||'').replace(/\s+/g,' ').trim();}
function group(category=''){
  const c=category.toUpperCase();
  if(c.includes('DEVLOG')||c.includes('WORK')) return 'WORK';
  if(['MOVIES','MOVIE','GAMES','GAME','BOOKS','BOOK','MUSIC','CRITIQUE'].some(k=>c.includes(k))) return 'CRITIQUE';
  if(['DAILY','PHOTO','LIFE'].some(k=>c.includes(k))) return 'LIFE';
  return 'WORK';
}
function row(item){return `<a class="journal-row" href="${item.link||'https://blog.naver.com/cine_insol'}" target="_blank" rel="noreferrer" data-group="${group(item.category)}">
  <span class="journal-date">${item.date||''}</span><span class="journal-category">${item.category||group(item.category)}</span>
  <strong class="journal-title">${item.title||'Untitled'}</strong><span class="journal-excerpt">${clean(item.excerpt||'')}</span><span class="journal-arrow">↗</span>
</a>`;}
function render(filter='ALL'){
  const root=document.querySelector('#journalIndexList');
  const visible=filter==='ALL'?posts:posts.filter(p=>(p.group||group(p.category))===filter);
  root.innerHTML=visible.length?visible.map(row).join(''):'<div class="journal-empty">이 분류에는 아직 공개된 글이 없습니다.</div>';
}
async function init(){
  try{const res=await fetch('../assets/data/journal.json',{cache:'no-store'});if(!res.ok)throw new Error();const data=await res.json();posts=data.posts||data;}
  catch{posts=FALLBACK;}
  const requested=(new URLSearchParams(location.search).get('filter')||'ALL').toUpperCase();
  const allowed=['ALL','WORK','CRITIQUE','LIFE'];const initial=allowed.includes(requested)?requested:'ALL';
  document.querySelectorAll('[data-filter]').forEach(btn=>{btn.classList.toggle('is-active',btn.dataset.filter===initial);btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('is-active',b===btn));render(btn.dataset.filter);history.replaceState(null,'',btn.dataset.filter==='ALL'?'index.html':`?filter=${btn.dataset.filter}`);});});
  render(initial);
}
init();

document.addEventListener('contextmenu',event=>event.preventDefault());

// V37 mobile navigation for the standalone Journal index.
(()=>{
  function bind(){
    document.querySelectorAll('.site-nav').forEach(nav=>{
      if(nav.querySelector('.mobile-nav-toggle'))return;
      const links=nav.querySelector('.site-nav-links');if(!links)return;
      const button=document.createElement('button');button.type='button';button.className='mobile-nav-toggle';button.setAttribute('aria-label','메뉴 열기');button.setAttribute('aria-expanded','false');button.innerHTML='<span></span><span></span>';nav.appendChild(button);
      const close=()=>{nav.classList.remove('is-mobile-open');button.setAttribute('aria-expanded','false')};
      button.addEventListener('click',()=>{const open=nav.classList.toggle('is-mobile-open');button.setAttribute('aria-expanded',String(open))});
      links.addEventListener('click',e=>{if(e.target.closest('a'))close()});
      document.addEventListener('pointerdown',e=>{if(nav.classList.contains('is-mobile-open')&&!nav.contains(e.target))close()},{passive:true});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();

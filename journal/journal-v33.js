let posts=[];
const FALLBACK=[{date:'2025.12.30',category:'CRITIQUE',title:'〈2025 연말정산〉',excerpt:'2025년을 마무리하며 남긴 기록.',link:'https://blog.naver.com/cine_insol'},{date:'2025.11.30',category:'MOVIES',title:'〈부고니아〉 리뷰 외 6편',excerpt:'최근 감상한 영화들에 대한 짧은 리뷰와 기록.',link:'https://blog.naver.com/cine_insol'},{date:'2025.10.28',category:'DEVLOG',title:'〈BENEDICT OF SINS〉 개발 기록',excerpt:'베네딕트 오브 신즈를 제작하며 남긴 개발 기록.',link:'https://blog.naver.com/cine_insol'}];
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
  const visible=filter==='ALL'?posts:posts.filter(p=>group(p.category)===filter);
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

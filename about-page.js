
const escAbout=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadAboutJSON(paths){for(const p of paths){try{const r=await fetch(p,{cache:'no-store'});if(r.ok)return await r.json()}catch{}}return null}
function historyItem(item={}){return `<article class="about-page-history-item"><time>${escAbout(item.date||'')}</time><strong>${escAbout(item.title||'')}</strong><p>${escAbout(item.detail||'')}</p>${item.status?`<em>${escAbout(item.status)}</em>`:''}</article>`}
async function initAboutPage(){
  const site=await loadAboutJSON(['user-content/site.json','content/site.json','defaults/site.json']);if(!site)return;
  const a=site.about||{},b=site.background||{};
  document.querySelector('#aboutDetailEyebrow').textContent=a.detailEyebrow||a.eyebrow||'ABOUT / FULL PROFILE';
  document.querySelector('#aboutDetailHeadline').textContent=a.headline||'';
  document.querySelector('#aboutDetailIntro').textContent=a.detailIntro||a.paragraphs?.[0]||'';
  const img=document.querySelector('#aboutDetailPortrait');if(a.profileImage)img.src=a.profileImage;
  const notes=a.detailNotes?.length?a.detailNotes:(a.paragraphs||[]);document.querySelector('#aboutDetailNotes').innerHTML=notes.map((n,i)=>`<article class="about-page-note"><span>${String(i+1).padStart(2,'0')}</span><p>${escAbout(n)}</p></article>`).join('');
  document.querySelector('#aboutDetailProcess').innerHTML=(a.process||[]).map(p=>`<article><span>${escAbout(p.no||'')}</span><h3>${escAbout(p.title||'')}</h3><p>${escAbout(p.body||'')}</p></article>`).join('');
  document.querySelector('#aboutEducation').innerHTML=(b.education||[]).map(historyItem).join('');
  document.querySelector('#aboutExperience').innerHTML=(b.experience||[]).map(historyItem).join('');
  const awards=b.awards||[],label=document.querySelector('#aboutAwardsLabel'),root=document.querySelector('#aboutAwards');if(awards.length)root.innerHTML=awards.map(historyItem).join('');else{label.hidden=true;root.hidden=true}
}
document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('DOMContentLoaded',initAboutPage);

function bindAboutMobileNav(){
  const nav=document.querySelector('.site-nav'),links=nav?.querySelector('.site-nav-links');if(!nav||!links||nav.querySelector('.mobile-nav-toggle'))return;
  const button=document.createElement('button');button.type='button';button.className='mobile-nav-toggle';button.setAttribute('aria-label','메뉴 열기');button.setAttribute('aria-expanded','false');button.innerHTML='<span></span><span></span>';nav.appendChild(button);
  const close=()=>{nav.classList.remove('is-mobile-open');button.setAttribute('aria-expanded','false')};
  button.addEventListener('click',()=>{const open=nav.classList.toggle('is-mobile-open');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기')});
  links.addEventListener('click',close);document.addEventListener('pointerdown',e=>{if(nav.classList.contains('is-mobile-open')&&!nav.contains(e.target))close()},{passive:true});
}
document.addEventListener('DOMContentLoaded',bindAboutMobileNav);

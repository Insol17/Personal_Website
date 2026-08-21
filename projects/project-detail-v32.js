const detailHero=document.querySelector('.project-detail-hero');
const DETAIL_SLUG=window.PROJECT_PREVIEW_SLUG||detailHero?.dataset.projectSlug||'';
const detailHeroImage=detailHero?.querySelector('.project-detail-hero-image');
let projectDetailData=null;

// Use the exact image that expanded from the source card before any async content work.
try{
  const incoming=sessionStorage.getItem('portfolioTransitionImage');
  if(incoming&&detailHeroImage) detailHeroImage.src=incoming;
}catch{}

const backButton=document.querySelector('[data-project-back]');
if(backButton){
  backButton.addEventListener('click',()=>{
    const sameOrigin=(()=>{try{const origin=sessionStorage.getItem('portfolioTransitionOrigin');return (!!origin&&new URL(origin).origin===location.origin)||(!!document.referrer&&new URL(document.referrer).origin===location.origin)}catch{return false}})();
    if(!sameOrigin||history.length<=1){location.replace(backButton.dataset.fallback||'../index.html#portfolio');return;}
    const image=detailHeroImage?.currentSrc||detailHeroImage?.src||'';
    try{sessionStorage.setItem('portfolioReverseTransition',JSON.stringify({slug:DETAIL_SLUG,image,at:Date.now()}));}catch{}
    document.documentElement.classList.add('detail-returning');
    setTimeout(()=>history.back(),280);
  });
}


function detailEsc(value=''){
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function applyProjectDetail(data,site){
  if(!data||!detailHero) return;
  projectDetailData=data;
  const projects=(site?.projects||window.DEFAULT_SITE?.projects||[]).filter(p=>p.visible!==false);
  const project=projects.find(p=>p.slug===DETAIL_SLUG);
  const caseCount=detailHero.querySelector('.project-case-meta strong');
  if(caseCount){const idx=Math.max(0,projects.findIndex(p=>p.slug===DETAIL_SLUG));caseCount.textContent=`${String(idx+1).padStart(2,'0')} / ${String(Math.max(1,projects.length)).padStart(2,'0')}`;}
  const heroImg=detailHero.querySelector('.project-detail-hero-image');
  if(heroImg&&project?.cardImage){const raw=project.cardImage;heroImg.src=/^(?:https?:|blob:|data:)/.test(raw)?raw:'../'+raw.replace(/^\.\//,'');}
  const heading=detailHero.querySelector('.project-detail-heading');
  if(heading){
    const p=heading.querySelector(':scope > p'); if(p&&data.hero?.kicker)p.textContent=data.hero.kicker;
    const h1=heading.querySelector('h1'); if(h1&&data.hero?.title)h1.textContent=data.hero.title;
    const h2=heading.querySelector('h2'); if(h2&&data.hero?.subtitle)h2.textContent=data.hero.subtitle;
  }
  const overview=document.querySelector('.project-overview-copy');
  if(overview&&data.overview){
    const h2=overview.querySelector('h2'); if(h2)h2.textContent=data.overview.heading||'';
    overview.querySelectorAll(':scope > p:not(.project-section-kicker)').forEach(p=>p.remove());
    (data.overview.paragraphs||[]).forEach(text=>{const p=document.createElement('p');p.textContent=text;overview.appendChild(p)});
  }
  const facts=document.querySelector('.project-facts');
  if(facts&&Array.isArray(data.facts)) facts.innerHTML=data.facts.map(f=>`<div><dt>${detailEsc(f.label)}</dt><dd>${detailEsc(f.value)}</dd></div>`).join('');
  const pillars=document.querySelector('.project-pillars');
  if(pillars){
    if(data.pillars?.length){pillars.hidden=false;pillars.innerHTML=data.pillars.map(p=>`<article class="project-pillar"><span>${detailEsc(p.no)}</span><h3>${detailEsc(p.title)}</h3><p>${detailEsc(p.body)}</p></article>`).join('');}
    else pillars.hidden=true;
  }
  const chapter=document.querySelector('.project-chapter-heading');
  if(chapter&&data.chapter){
    const k=chapter.querySelector('p');if(k)k.textContent=data.chapter.kicker||'';
    const h=chapter.querySelector('h2');if(h)h.textContent=data.chapter.title||'';
    chapter.hidden=!(data.chapter.kicker||data.chapter.title);
  }
  const featureRoot=document.querySelector('.project-feature-list');
  if(featureRoot&&Array.isArray(data.features)){featureRoot.hidden=false;
    const oldMedia=[...featureRoot.querySelectorAll(':scope > .project-feature')].map(s=>s.querySelector('.project-feature-media')?.cloneNode(true)||null);
    featureRoot.innerHTML=data.features.map((f,i)=>`<section class="project-feature"><div class="project-feature-copy"><h2>${detailEsc(f.title)}</h2>${(f.paragraphs||[]).map(p=>`<p>${detailEsc(p)}</p>`).join('')}</div></section>`).join('');
    [...featureRoot.children].forEach((section,i)=>{if(oldMedia[i])section.appendChild(oldMedia[i])});
    featureRoot.hidden=!data.features.length;
  }
  const responsibility=document.querySelector('.project-contribution-section');
  if(responsibility&&data.responsibility){
    const k=responsibility.querySelector('.project-section-kicker');if(k)k.textContent=data.responsibility.kicker||'';
    const h=responsibility.querySelector('.project-section-heading h2');if(h)h.textContent=data.responsibility.heading||'';
    const intro=responsibility.querySelector('.project-contribution-intro p');if(intro)intro.textContent=data.responsibility.intro||'';
    const list=responsibility.querySelector('.project-contribution-list');
    if(list) list.innerHTML=(data.responsibility.items||[]).map(item=>`<li><span>${detailEsc(item.no)}</span><div><strong>${detailEsc(item.title)}</strong><p>${detailEsc(item.body)}</p></div></li>`).join('');
  }
  const reflection=document.querySelector('.project-reflection');
  if(reflection&&data.reflection){
    const h=reflection.querySelector('h2');if(h)h.textContent=data.reflection.heading||'REFLECTION';
    reflection.querySelectorAll('p').forEach(p=>p.remove());
    (data.reflection.paragraphs||[]).forEach(text=>{const p=document.createElement('p');p.textContent=text;reflection.appendChild(p)});
  }
}
window.applyProjectDetailPreview=(data,site)=>{if(!data||data.slug!==DETAIL_SLUG)return;applyProjectDetail(data,site)};

async function detailFetchJSON(path){
  const res=await fetch(path,{cache:'no-store'});
  if(!res.ok) throw new Error(path);
  return res.json();
}
async function detailLoadCascade(paths){
  for(const path of paths){try{return await detailFetchJSON(path)}catch{}}
  throw new Error('No project content source');
}
async function loadProjectDetail(){
  if(!DETAIL_SLUG)return;
  try{
    const [detail,site]=await Promise.all([
      detailLoadCascade([
        `../user-content/projects/${DETAIL_SLUG}.json`,
        `../content/projects/${DETAIL_SLUG}.json`,
        `../defaults/projects/${DETAIL_SLUG}.json`
      ]),
      detailLoadCascade(['../user-content/site.json','../content/site.json','../defaults/site.json']).catch(()=>null)
    ]);
    applyProjectDetail(detail,site);
  }catch{}
}

addEventListener('message',event=>{
  const msg=event.data||{};
  if(msg.type==='project-preview-data'&&msg.payload?.slug===DETAIL_SLUG) applyProjectDetail(msg.payload,msg.site||null);
});

function bindMedia(){
  // Missing media is removed instead of displaying placeholders.
  document.querySelectorAll('.project-feature-media img').forEach(image=>image.addEventListener('error',()=>image.closest('.project-feature-media')?.remove()));
  document.querySelectorAll('.project-media-section:not(.project-video-section)').forEach(section=>{
    const images=[...section.querySelectorAll('.project-gallery-item img')];
    if(!images.length){section.remove();return;}
    let settled=0; const finish=()=>{settled++;if(settled===images.length&&!section.querySelector('.project-gallery-item')) section.remove();};
    images.forEach(image=>{
      image.addEventListener('load',finish,{once:true});
      image.addEventListener('error',()=>{image.closest('.project-gallery-item')?.remove();finish();},{once:true});
      if(image.complete){if(image.naturalWidth>0)finish();else{image.closest('.project-gallery-item')?.remove();finish();}}
    });
  });
  function youtubeId(value=''){
    value=value.trim();if(!value)return'';if(/^[\w-]{6,}$/.test(value))return value;
    try{const url=new URL(value);if(url.hostname.includes('youtu.be'))return url.pathname.split('/').filter(Boolean)[0]||'';if(url.pathname.startsWith('/watch'))return url.searchParams.get('v')||'';const parts=url.pathname.split('/').filter(Boolean);if(['shorts','embed'].includes(parts[0]))return parts[1]||'';}catch{}return'';
  }
  document.querySelectorAll('.project-video-section').forEach(section=>{
    const cards=[...section.querySelectorAll('.project-video-card')];
    cards.forEach(card=>{const id=youtubeId(card.dataset.youtubeUrl);if(!id){card.remove();return;}const f=document.createElement('iframe');f.src=`https://www.youtube.com/embed/${id}`;f.title=card.dataset.videoLabel||'Project video';f.loading='lazy';f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';f.referrerPolicy='strict-origin-when-cross-origin';f.allowFullscreen=true;card.appendChild(f);});
    if(!section.querySelector('.project-video-card')) section.remove();
  });
}
function bindLightbox(){
  const gallery=[...document.querySelectorAll('.project-gallery-item img,.project-feature-media img')];
  if(!gallery.length||!('HTMLDialogElement'in window))return;
  const dialog=document.createElement('dialog');dialog.className='project-lightbox';dialog.innerHTML='<button type="button" aria-label="이미지 닫기">CLOSE ×</button><img alt="">';document.body.appendChild(dialog);
  const target=dialog.querySelector('img');const close=dialog.querySelector('button');
  gallery.forEach(image=>{image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label',`${image.alt||'프로젝트 이미지'} 크게 보기`);const open=()=>{target.src=image.currentSrc||image.src;target.alt=image.alt||'';dialog.showModal()};image.addEventListener('click',open);image.addEventListener('keydown',e=>{if(e.key==='Enter')open()});});
  close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
}

async function revealDetailPage(){
  if(detailHeroImage){try{if(!detailHeroImage.complete)await new Promise(resolve=>{detailHeroImage.addEventListener('load',resolve,{once:true});detailHeroImage.addEventListener('error',resolve,{once:true})});await detailHeroImage.decode?.()}catch{}}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    document.documentElement.classList.add('detail-ready');
    if(document.documentElement.classList.contains('transition-arrival-pending')){
      document.documentElement.classList.add('transition-arrival-fade');
      setTimeout(()=>{
        document.documentElement.classList.remove('transition-arrival-pending','transition-arrival-fade');
        document.documentElement.style.removeProperty('--transition-image');
        try{sessionStorage.removeItem('portfolioTransitionImage')}catch{}
      },300);
    }
  }));
}

document.addEventListener('contextmenu',event=>event.preventDefault());

document.addEventListener('DOMContentLoaded',async()=>{
  await loadProjectDetail();
  bindMedia();
  bindLightbox();
  await revealDetailPage();
});

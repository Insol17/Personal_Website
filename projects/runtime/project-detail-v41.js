const detailHero=document.querySelector('.project-detail-hero');
const DETAIL_SLUG=window.PROJECT_PREVIEW_SLUG||detailHero?.dataset.projectSlug||'';
const detailHeroImage=detailHero?.querySelector('.project-detail-hero-image');
let projectDetailData=null;
let projectSiteData=null;

// Use the exact image that expanded from the source card before any async content work.
try{
  const incoming=sessionStorage.getItem('portfolioTransitionImage');
  if(incoming&&detailHeroImage) detailHeroImage.src=incoming;
}catch{}

function detailReadJSON(key){try{const raw=sessionStorage.getItem(key);return raw?JSON.parse(raw):null}catch{return null}}
function detailWriteJSON(key,value){try{sessionStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function detailWait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
const backButton=document.querySelector('[data-project-back]');
if(backButton){
  backButton.addEventListener('click',async()=>{
    if(backButton.dataset.busy==='1')return;backButton.dataset.busy='1';
    const chain=detailReadJSON('portfolioDetailChain');
    const origin=chain?.origin||detailReadJSON('portfolioTransitionOriginState');
    const fallback=new URL(backButton.dataset.fallback||'../index.html#portfolio',location.href).href;
    const returnUrl=(origin?.url&&origin?.path)?origin.url.split('#')[0]:fallback.split('#')[0];
    const image=detailHeroImage?.currentSrc||detailHeroImage?.src||chain?.currentImage||'';
    const payload={slug:DETAIL_SLUG,image,scrollY:Number.isFinite(origin?.scrollY)?origin.scrollY:0,railIndex:Number.isInteger(origin?.railIndex)?origin.railIndex:null,railX:Number.isFinite(origin?.railX)?origin.railX:null,surface:origin?.surface||'works',returnUrl,chainDepth:Number(chain?.depth)||1,entrySlug:chain?.entrySlug||origin?.slug||DETAIL_SLUG,at:Date.now()};
    detailWriteJSON('portfolioReturnTransition',payload);
    document.documentElement.classList.add('detail-returning');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){location.replace(returnUrl);return;}
    await detailWait(110);
    location.replace(returnUrl);
  });
}


function detailEsc(value=''){
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function applyProjectDetail(data,site){
  if(!data||!detailHero) return;
  projectDetailData=data;
  if(site)projectSiteData=site;
  const projects=(site?.projects||window.DEFAULT_SITE?.projects||[]).filter(p=>p.visible!==false);
  const project=projects.find(p=>p.slug===DETAIL_SLUG);
  renderProjectExternalAction(project);
  if(project?.slug==='kinosis'&&['assets/images/projects/kinosis/overview/01.jpg','assets/images/projects/kinosis/cover-v33.jpg'].includes(project.cardImage))project.cardImage='assets/images/projects/kinosis/cover.jpg';
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
  if(detailHeroImage){
    try{
      if(!detailHeroImage.complete)await Promise.race([new Promise(resolve=>{detailHeroImage.addEventListener('load',resolve,{once:true});detailHeroImage.addEventListener('error',resolve,{once:true})}),detailWait(900)]);
      await Promise.race([detailHeroImage.decode?.()||Promise.resolve(),detailWait(500)]);
    }catch{}
  }
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  document.documentElement.classList.add('detail-image-ready');
  if(document.documentElement.classList.contains('transition-arrival-pending')){
    await new Promise(resolve=>requestAnimationFrame(resolve));
    document.documentElement.classList.add('transition-arrival-fade');
    await detailWait(170);
    document.documentElement.classList.remove('transition-arrival-pending','transition-arrival-fade');
    document.documentElement.style.removeProperty('--transition-image');
  }
  await detailWait(90);
  document.documentElement.classList.add('detail-ready');
  const origin=detailReadJSON('portfolioTransitionOriginState');
  const image=detailHeroImage?.currentSrc||detailHeroImage?.src||'';
  if(origin?.path&&image){const chain=detailReadJSON('portfolioDetailChain')||{origin,entrySlug:origin.slug||DETAIL_SLUG,depth:1};chain.currentSlug=DETAIL_SLUG;chain.currentImage=image;chain.at=Date.now();detailWriteJSON('portfolioDetailChain',chain);detailWriteJSON('portfolioLastDetail',{slug:DETAIL_SLUG,image,origin,chainDepth:chain.depth||1,at:Date.now()});}
  try{sessionStorage.removeItem('portfolioTransitionImage')}catch{}
}


function bindDetailChainNavigation(){
  document.querySelectorAll('.project-detail-navigation a').forEach(link=>{
    if(link.dataset.chainBound)return;link.dataset.chainBound='1';
    link.addEventListener('pointerenter',()=>{try{const pf=document.createElement('link');pf.rel='prefetch';pf.href=link.href;pf.as='document';document.head.appendChild(pf)}catch{}},{once:true});
    link.addEventListener('click',async event=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const targetSlug=(new URL(link.href,location.href).pathname.split('/').pop()||'').replace(/\.html$/,'');if(!targetSlug)return;
      const chain=detailReadJSON('portfolioDetailChain')||{origin:detailReadJSON('portfolioTransitionOriginState'),entrySlug:DETAIL_SLUG,depth:1};
      chain.currentSlug=targetSlug;chain.depth=(Number(chain.depth)||1)+1;chain.at=Date.now();detailWriteJSON('portfolioDetailChain',chain);
      // Hand the next document its cover synchronously before navigation so its first paint never falls back to the previous project's image.
      try{const p=(projectSiteData?.projects||[]).find(x=>x.slug===targetSlug);if(p?.cardImage){const src=/^(?:https?:|blob:|data:)/.test(p.cardImage)?p.cardImage:'../'+p.cardImage.replace(/^\.\//,'');const absolute=new URL(src,location.href).href;sessionStorage.setItem('portfolioTransitionImage',absolute);chain.currentImage=absolute;detailWriteJSON('portfolioDetailChain',chain);}}catch{}
    });
  });
}

document.addEventListener('contextmenu',event=>event.preventDefault());

document.addEventListener('DOMContentLoaded',async()=>{
  await loadProjectDetail();
  bindMedia();
  bindLightbox();
  bindDetailChainNavigation();
  await revealDetailPage();
});


/* V40 — project-specific external shortcut actions. */
const PROJECT_EXTERNAL_FALLBACKS={
  benedict:[
    {url:'https://mega.nz/file/npllxDaa#MEBDrps1U-NOCULLadfIJoIVQDPhj7sI8W2RPiIjcsk',type:'download',label:'DOWNLOAD BUILD'},
    {url:'https://github.com/Insol17/Benedict_Of_Sins',type:'github',label:'GITHUB REPOSITORY'}
  ],
  salgut:[
    {url:'https://mega.nz/file/zpVlmITa#pl8WgZe4Syu3V8JQsHsdGv49JoK_kLHPI5on82xu_8w',type:'download',label:'DOWNLOAD BUILD'},
    {url:'https://github.com/CCIT-Team/Kill_Ritual',type:'github',label:'GITHUB REPOSITORY'}
  ],
  kinosis:[
    {url:'https://kinosis.netlify.app/',type:'website',label:'OPEN WEBSITE'},
    {url:'https://github.com/Insol17/Kinosis',type:'github',label:'GITHUB REPOSITORY'}
  ],
  fernand:[{url:'https://github.com/Insol17/Fernand',type:'github',label:'GITHUB REPOSITORY'}],
  deco:[{url:'https://github.com/r0ckstarS2/De.co',type:'github',label:'GITHUB REPOSITORY'}]
};
function projectExternalIcon(type){
  if(type==='github')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7a11.3 11.3 0 0 0-3.57 22.02c.57.1.77-.25.77-.55v-2.16c-3.14.68-3.8-1.34-3.8-1.34-.51-1.31-1.26-1.66-1.26-1.66-1.03-.71.08-.7.08-.7 1.14.08 1.74 1.18 1.74 1.18 1.01 1.74 2.66 1.24 3.31.95.1-.74.4-1.24.72-1.53-2.5-.29-5.14-1.27-5.14-5.63 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .95-.31 3.12 1.17A10.8 10.8 0 0 1 12 5.98c.96 0 1.92.13 2.84.39 2.16-1.48 3.11-1.17 3.11-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.64 5.33-5.15 5.61.4.35.76 1.04.76 2.1v3.18c0 .3.2.66.78.55A11.3 11.3 0 0 0 12 .7Z"/></svg>';
  if(type==='download')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h10v10M19 5 8 16M5 9v10h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function renderProjectExternalAction(project){
  const heading=detailHero?.querySelector('.project-detail-heading');if(!heading)return;
  heading.querySelector('.project-external-actions')?.remove();
  let actions=[];
  if(Array.isArray(project?.externalActions)&&project.externalActions.length)actions=project.externalActions;
  else if(PROJECT_EXTERNAL_FALLBACKS[DETAIL_SLUG]?.length)actions=PROJECT_EXTERNAL_FALLBACKS[DETAIL_SLUG];
  else if(project?.externalUrl)actions=[{url:project.externalUrl,type:project.externalType||'website',label:project.externalLabel||'OPEN PROJECT'}];
  actions=actions.filter(item=>item?.url).slice(0,3);
  if(!actions.length)return;
  const wrap=document.createElement('div');wrap.className='project-external-actions';
  actions.forEach(item=>{
    const a=document.createElement('a');
    a.className=`project-external-icon is-${item.type||'website'}`;
    a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';
    a.setAttribute('aria-label',item.label||'OPEN PROJECT');a.dataset.label=item.label||'OPEN PROJECT';
    a.innerHTML=projectExternalIcon(item.type||'website');wrap.appendChild(a);
  });
  heading.appendChild(wrap);
}

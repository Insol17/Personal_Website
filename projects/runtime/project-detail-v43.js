/* V43 detail bridge — always return to WORKS (archive stays archive), scroll to hero first. */
(function(){
  const old=document.querySelector('[data-project-back]');if(!old)return;
  const button=old.cloneNode(true);old.replaceWith(button); // strip legacy V41/V42 handlers
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const scrollHero=()=>new Promise(resolve=>{const start=scrollY;if(start<8||reduced()){scrollTo(0,0);resolve();return}const duration=Math.min(520,Math.max(300,260+Math.log1p(start)*31)),at=performance.now();document.documentElement.classList.add('detail-back-scrolling');const tick=now=>{const p=Math.min(1,(now-at)/duration);scrollTo(0,Math.round(start*(1-ease(p))));if(p<1)requestAnimationFrame(tick);else{scrollTo(0,0);document.documentElement.classList.remove('detail-back-scrolling');resolve()}};requestAnimationFrame(tick)});
  button.addEventListener('click',async e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();if(button.dataset.busyV43==='1')return;button.dataset.busyV43='1';
    const chain=detailReadJSON('portfolioDetailChain'),origin=chain?.origin||detailReadJSON('portfolioTransitionOriginState');const isArchive=origin?.surface==='archive';const returnUrl=isArchive?new URL('index.html',location.href).href:new URL('../index.html#portfolio',location.href).href;
    await scrollHero();document.documentElement.classList.add('detail-back-fade');await detailWait(reduced()?0:105);
    const image=detailHeroImage?.currentSrc||detailHeroImage?.src||chain?.currentImage||'';const payload={slug:DETAIL_SLUG,image,scrollY:(origin?.surface==='works'&&Number.isFinite(origin?.scrollY))?origin.scrollY:(isArchive&&Number.isFinite(origin?.scrollY)?origin.scrollY:null),railIndex:Number.isInteger(origin?.railIndex)?origin.railIndex:null,railX:Number.isFinite(origin?.railX)?origin.railX:null,surface:isArchive?'archive':'works',useOriginScroll:origin?.surface==='works'||isArchive,returnUrl,chainDepth:Number(chain?.depth)||1,entrySlug:chain?.entrySlug||origin?.slug||DETAIL_SLUG,at:Date.now()};detailWriteJSON('portfolioReturnTransition',payload);location.replace(returnUrl);
  },true);
})();

function v43NormalizeDetailHeading(){
  const heading=document.querySelector('.project-detail-heading');if(!heading)return;const kicker=heading.querySelector(':scope>p');if(kicker)kicker.textContent=(kicker.textContent||'').replace(/^\s*\d+\s*\/\s*/,'').trim();const h1=heading.querySelector('h1'),h2=heading.querySelector('h2');if(h1&&h2){const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9가-힣]/g,'');h2.hidden=!norm(h2.textContent)||norm(h1.textContent)===norm(h2.textContent)}
}

revealDetailPage = async function(){
  if(detailHeroImage){try{if(!detailHeroImage.complete)await Promise.race([new Promise(r=>{detailHeroImage.addEventListener('load',r,{once:true});detailHeroImage.addEventListener('error',r,{once:true})}),detailWait(380)]);await Promise.race([detailHeroImage.decode?.()||Promise.resolve(),detailWait(180)])}catch{}}
  await new Promise(r=>requestAnimationFrame(r));document.documentElement.classList.add('detail-image-ready');v43NormalizeDetailHeading();
  if(document.documentElement.classList.contains('transition-arrival-pending')){document.documentElement.classList.add('transition-arrival-fade');await detailWait(45);document.documentElement.classList.remove('transition-arrival-pending','transition-arrival-fade');document.documentElement.style.removeProperty('--transition-image')}
  document.documentElement.classList.add('detail-ready');const origin=detailReadJSON('portfolioTransitionOriginState'),image=detailHeroImage?.currentSrc||detailHeroImage?.src||'';if(origin?.path&&image){const chain=detailReadJSON('portfolioDetailChain')||{origin,entrySlug:origin.slug||DETAIL_SLUG,depth:1};chain.currentSlug=DETAIL_SLUG;chain.currentImage=image;chain.at=Date.now();detailWriteJSON('portfolioDetailChain',chain);detailWriteJSON('portfolioLastDetail',{slug:DETAIL_SLUG,image,origin,chainDepth:chain.depth||1,at:Date.now()})}try{sessionStorage.removeItem('portfolioTransitionImage')}catch{}
};

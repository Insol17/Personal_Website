/* V42 detail bridge: scroll back to the hero first, then dissolve copy and reverse. */
(function(){
  const button=document.querySelector('[data-project-back]');if(!button)return;
  const ease=t=>1-Math.pow(1-t,4);
  const smoothTop=()=>new Promise(resolve=>{
    const start=scrollY;if(start<12){resolve();return}
    const duration=Math.min(620,Math.max(300,250+Math.log1p(start)*45));const at=performance.now();document.documentElement.classList.add('detail-back-scrolling');
    const tick=now=>{const p=Math.min(1,(now-at)/duration);scrollTo(0,Math.round(start*(1-ease(p))));if(p<1)requestAnimationFrame(tick);else{scrollTo(0,0);document.documentElement.classList.remove('detail-back-scrolling');resolve()}};requestAnimationFrame(tick);
  });
  button.addEventListener('click',async event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();event.stopImmediatePropagation();if(button.dataset.busyV42==='1')return;button.dataset.busyV42='1';
    const chain=detailReadJSON('portfolioDetailChain'),origin=chain?.origin||detailReadJSON('portfolioTransitionOriginState');const fallback=new URL(button.dataset.fallback||'../index.html#portfolio',location.href).href;const returnUrl=(origin?.url&&origin?.path)?origin.url.split('#')[0]:fallback.split('#')[0];
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await smoothTop();
    const image=detailHeroImage?.currentSrc||detailHeroImage?.src||chain?.currentImage||'';const payload={slug:DETAIL_SLUG,image,scrollY:Number.isFinite(origin?.scrollY)?origin.scrollY:0,railIndex:Number.isInteger(origin?.railIndex)?origin.railIndex:null,railX:Number.isFinite(origin?.railX)?origin.railX:null,surface:origin?.surface||'works',returnUrl,chainDepth:Number(chain?.depth)||1,entrySlug:chain?.entrySlug||origin?.slug||DETAIL_SLUG,at:Date.now()};detailWriteJSON('portfolioReturnTransition',payload);
    document.documentElement.classList.add('detail-returning');
    await detailWait(matchMedia('(prefers-reduced-motion: reduce)').matches?0:135);location.replace(returnUrl);
  },true);
})();

// Text arrives as soon as the hero image is painted; the transition surface no longer lingers ceremonially.
revealDetailPage = async function(){
  if(detailHeroImage){try{if(!detailHeroImage.complete)await Promise.race([new Promise(resolve=>{detailHeroImage.addEventListener('load',resolve,{once:true});detailHeroImage.addEventListener('error',resolve,{once:true})}),detailWait(520)]);await Promise.race([detailHeroImage.decode?.()||Promise.resolve(),detailWait(260)])}catch{}}
  await new Promise(resolve=>requestAnimationFrame(resolve));document.documentElement.classList.add('detail-image-ready');
  if(document.documentElement.classList.contains('transition-arrival-pending')){document.documentElement.classList.add('transition-arrival-fade');await detailWait(75);document.documentElement.classList.remove('transition-arrival-pending','transition-arrival-fade');document.documentElement.style.removeProperty('--transition-image')}
  document.documentElement.classList.add('detail-ready');
  const origin=detailReadJSON('portfolioTransitionOriginState'),image=detailHeroImage?.currentSrc||detailHeroImage?.src||'';if(origin?.path&&image){const chain=detailReadJSON('portfolioDetailChain')||{origin,entrySlug:origin.slug||DETAIL_SLUG,depth:1};chain.currentSlug=DETAIL_SLUG;chain.currentImage=image;chain.at=Date.now();detailWriteJSON('portfolioDetailChain',chain);detailWriteJSON('portfolioLastDetail',{slug:DETAIL_SLUG,image,origin,chainDepth:chain.depth||1,at:Date.now()})}try{sessionStorage.removeItem('portfolioTransitionImage')}catch{}
};

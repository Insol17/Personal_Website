/* V44 — exact source-surface return and coherent scroll-to-hero reverse transition. */
(function(){
  const old=document.querySelector('[data-project-back]');if(!old)return;
  const button=old.cloneNode(true);old.replaceWith(button); // remove every older handler
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease=t=>1-Math.pow(1-t,4);
  const scrollHero=()=>new Promise(resolve=>{
    const start=Math.max(0,scrollY);if(start<6||reduced()){scrollTo(0,0);resolve();return}
    const duration=Math.min(620,Math.max(330,300+Math.log1p(start)*30)),at=performance.now();document.documentElement.classList.add('detail-back-v44-scrolling');
    const tick=now=>{const p=Math.min(1,(now-at)/duration);scrollTo(0,Math.round(start*(1-ease(p))));if(p<1)requestAnimationFrame(tick);else{scrollTo(0,0);document.documentElement.classList.remove('detail-back-v44-scrolling');resolve()}};requestAnimationFrame(tick);
  });
  button.addEventListener('click',async e=>{
    if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();if(button.dataset.busyV44==='1')return;button.dataset.busyV44='1';
    const chain=detailReadJSON('portfolioDetailChain'),origin=chain?.origin||detailReadJSON('portfolioTransitionOriginState')||{};const surface=['featured','works','archive'].includes(origin.surface)?origin.surface:'works';
    const returnUrl=surface==='archive'?new URL('index.html',location.href).href:new URL(`../index.html#${surface==='featured'?'featured':'portfolio'}`,location.href).href;
    await scrollHero();document.documentElement.classList.add('detail-back-v44-fade');await detailWait(reduced()?0:145);
    const image=detailHeroImage?.currentSrc||detailHeroImage?.src||chain?.currentImage||'';
    const payload={slug:DETAIL_SLUG,image,originSlug:origin.slug||chain?.entrySlug||DETAIL_SLUG,scrollY:Number.isFinite(origin.scrollY)?origin.scrollY:null,railIndex:Number.isInteger(origin.railIndex)?origin.railIndex:null,railX:Number.isFinite(origin.railX)?origin.railX:null,surface,returnUrl,entrySlug:chain?.entrySlug||origin.slug||DETAIL_SLUG,chainDepth:Number(chain?.depth)||1,at:Date.now()};
    detailWriteJSON('portfolioReturnTransition',payload);try{sessionStorage.removeItem('portfolioGlobalTransitionV40');sessionStorage.removeItem('portfolioReverseTransition')}catch{}
    location.replace(returnUrl);
  },true);
})();

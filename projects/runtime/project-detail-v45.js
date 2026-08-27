/* V45 — URL-carried return state, works on hosted pages and local file:// previews. */
(function(){
  const old=document.querySelector('[data-project-back]');if(!old)return;
  const button=old.cloneNode(true);old.replaceWith(button); // remove every pre-V45 back handler
  const p=new URLSearchParams(location.search),reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches,sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
  const surface=['featured','works','archive'].includes(p.get('pts'))?p.get('pts'):'works';
  const entry=p.get('ptentry')||DETAIL_SLUG,originScroll=n(p.get('ptscroll')),originRail=n(p.get('ptrail'));

  // release the incoming card->fullscreen surface as soon as the real hero image is ready.
  async function releaseForward(){
    if(p.get('pt')!=='1'||!document.documentElement.classList.contains('pt-forward-arrival'))return;
    try{await Promise.race([detailHeroImage?.decode?.()||Promise.resolve(),sleep(420)])}catch{}
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    document.documentElement.classList.add('pt-forward-release');await sleep(85);
    document.documentElement.classList.remove('pt-forward-arrival','pt-forward-release');document.documentElement.style.removeProperty('--pt-v45-image');
  }
  releaseForward();

  // Preserve the original source surface while moving between case studies.
  document.querySelectorAll('.project-detail-navigation a').forEach(a=>a.addEventListener('click',e=>{
    if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    try{const u=new URL(a.href,location.href);u.searchParams.set('pts',surface);u.searchParams.set('ptentry',entry);if(Number.isFinite(originScroll))u.searchParams.set('ptscroll',String(originScroll));if(Number.isFinite(originRail))u.searchParams.set('ptrail',String(originRail));a.href=u.href}catch{}
  },true));

  const ease=t=>1-Math.pow(1-t,4);
  const scrollHero=()=>new Promise(resolve=>{
    const start=Math.max(0,scrollY);if(start<4||reduced()){scrollTo(0,0);resolve();return}
    const duration=Math.min(650,Math.max(340,320+Math.log1p(start)*28)),at=performance.now();document.documentElement.classList.add('detail-back-v45-scrolling');
    const tick=now=>{const x=Math.min(1,(now-at)/duration);scrollTo(0,Math.round(start*(1-ease(x))));if(x<1)requestAnimationFrame(tick);else{scrollTo(0,0);document.documentElement.classList.remove('detail-back-v45-scrolling');resolve()}};requestAnimationFrame(tick);
  });

  button.addEventListener('click',async e=>{
    if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();e.stopImmediatePropagation();if(button.dataset.busyV45==='1')return;button.dataset.busyV45='1';
    await scrollHero();document.documentElement.classList.add('detail-back-v45-fade');await sleep(reduced()?0:105);
    const image=detailHeroImage?.currentSrc||detailHeroImage?.src||p.get('ptimg')||'';
    const base=surface==='archive'?new URL('index.html',location.href):new URL('../index.html',location.href);
    base.searchParams.set('ptr','1');base.searchParams.set('pts',surface);base.searchParams.set('ptrslug',DETAIL_SLUG);base.searchParams.set('ptrentry',entry);if(Number.isFinite(originScroll))base.searchParams.set('ptscroll',String(originScroll));if(Number.isFinite(originRail))base.searchParams.set('ptrail',String(originRail));if(image)base.searchParams.set('ptrimg',image);base.hash=surface==='featured'?'featured':surface==='archive'?'archive-main':'portfolio';
    location.replace(base.href);
  },true);
})();

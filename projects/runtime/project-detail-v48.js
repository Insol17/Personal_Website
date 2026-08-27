/* V48 — staged project-detail entrance: cover first, chrome/copy second. */
(function(){
  const params=new URLSearchParams(location.search);
  if(params.get('pt')!=='1') return;
  const root=document.documentElement;
  root.classList.add('detail-v48-enter');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  async function run(){
    const image=document.querySelector('.project-detail-hero-image');
    try{await Promise.race([image?.decode?.()||Promise.resolve(),sleep(280)])}catch{}
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    root.classList.add('detail-v48-media-ready');
    await sleep(reduced()?0:70);
    root.classList.add('detail-v48-copy-ready');
    await sleep(reduced()?0:420);
    root.classList.add('detail-v48-settled');
    root.classList.remove('detail-v48-enter','detail-v48-media-ready','detail-v48-copy-ready');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();

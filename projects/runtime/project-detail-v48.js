/* V48 hotfix — image handoff first, then all project-detail chrome/copy as one group. */
(function(){
  const params=new URLSearchParams(location.search);
  if(params.get('pt')!=='1') return;
  const root=document.documentElement;
  root.classList.add('detail-v48-enter');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

  function waitForDetailReady(timeout=1600){
    if(root.classList.contains('detail-ready')) return Promise.resolve();
    return new Promise(resolve=>{
      let done=false;
      const finish=()=>{if(done)return;done=true;observer.disconnect();resolve()};
      const observer=new MutationObserver(()=>{if(root.classList.contains('detail-ready'))finish()});
      observer.observe(root,{attributes:true,attributeFilter:['class']});
      setTimeout(finish,timeout);
    });
  }

  async function run(){
    const image=document.querySelector('.project-detail-hero-image');
    try{await Promise.race([image?.decode?.()||Promise.resolve(),sleep(320)])}catch{}
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

    // The visual cover/background lands first.
    root.classList.add('detail-v48-media-ready');

    // `detail-ready` is emitted only after project data has been applied, including
    // dynamically-created GitHub / download / website actions. Keep every UI element
    // hidden until that single content set is complete.
    await waitForDetailReady();
    await sleep(reduced()?0:70);

    root.classList.add('detail-v48-content-ready');
    await sleep(reduced()?0:360);
    root.classList.add('detail-v48-settled');
    root.classList.remove('detail-v48-enter','detail-v48-media-ready','detail-v48-content-ready','detail-v48-copy-ready');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();

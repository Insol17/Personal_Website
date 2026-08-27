/* V50 hotfix — deterministic detail -> source-card reverse transition.
   One real IMG owns the continuity surface from arrival until handoff.
   No pseudo -> clone -> card chain; the pseudo is only a pre-script flash guard. */
(function(){
  const params = new URLSearchParams(location.search);
  if (params.get('ptr') !== '1') return;

  const root = document.documentElement;
  const incomingImage = params.get('ptrimg') || '';
  const surface = ['featured','works','archive'].includes(params.get('pts')) ? params.get('pts') : 'works';
  const slug = params.get('ptrslug') || '';
  const entrySlug = params.get('ptrentry') || slug;
  const scrollPosition = finite(params.get('ptscroll'));
  const railX = finite(params.get('ptrail'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let overlay = null;
  let targetLink = null;
  let targetImage = null;
  let targetCard = null;
  let done = false;

  root.classList.add('site-boot-bypass', 'project-return-v50-running');

  function finite(value){
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }
  function frame(){ return new Promise(resolve => requestAnimationFrame(resolve)); }
  async function frames(count=2){ for(let i=0;i<count;i++) await frame(); }
  function safe(value){
    const s = String(value || '');
    return window.CSS?.escape ? CSS.escape(s) : s.replace(/[^a-zA-Z0-9_-]/g, '');
  }
  function cleanUrl(){
    try{
      const url = new URL(location.href);
      ['ptr','ptrslug','ptrentry','pts','ptscroll','ptrail','ptrimg'].forEach(key => url.searchParams.delete(key));
      history.replaceState(history.state, '', url.href);
    }catch{}
  }
  function clearLegacyMasks(){
    root.classList.remove(
      'pt-return-arrival','pt-return-release',
      'reverse-arrival-pending','reverse-arrival-release',
      'is-restoring-project','project-return-v50-active'
    );
    root.style.removeProperty('--pt-v45-image');
    root.style.removeProperty('--transition-image');
  }
  function sourceRoot(){
    if(surface === 'featured') return document.querySelector('#featuredProjects');
    if(surface === 'archive') return document.querySelector('#archiveGrid');
    return document.querySelector('#worksStage');
  }
  function findTarget(){
    const host = sourceRoot();
    if(!host) return null;
    const exact = host.querySelector(`.project-transition-link[data-project="${safe(slug)}"]`);
    if(exact) return exact;
    if(surface === 'featured' && entrySlug){
      return host.querySelector(`.project-transition-link[data-project="${safe(entrySlug)}"]`);
    }
    return null;
  }
  async function waitTarget(){
    const deadline = performance.now() + 5000;
    while(performance.now() < deadline){
      const link = findTarget();
      if(link) return link;
      await sleep(30);
    }
    return null;
  }
  function imageFor(link){
    if(!link) return null;
    return link.querySelector('.project-card-image, img') ||
      link.closest('.featured-project,.project-card')?.querySelector('.project-card-image, img') || null;
  }
  async function ready(image, timeout=700){
    if(!image) return;
    try{
      if(!image.complete){
        await Promise.race([
          new Promise(resolve => {
            image.addEventListener('load', resolve, {once:true});
            image.addEventListener('error', resolve, {once:true});
          }),
          sleep(timeout)
        ]);
      }
      if(image.decode) await Promise.race([image.decode().catch(()=>{}), sleep(360)]);
    }catch{}
  }

  function createOverlay(){
    const img = document.createElement('img');
    img.className = 'transition-v50-return-clone';
    img.alt = '';
    img.setAttribute('aria-hidden','true');
    img.src = incomingImage;
    Object.assign(img.style, {
      position:'fixed',
      zIndex:'10050',
      left:'0px',
      top:'0px',
      width:'100vw',
      height:'100vh',
      display:'block',
      margin:'0',
      padding:'0',
      maxWidth:'none',
      maxHeight:'none',
      objectFit:'cover',
      objectPosition:'50% 50%',
      borderRadius:'0px',
      boxShadow:'none',
      opacity:'1',
      pointerEvents:'none',
      transform:'translateZ(0)',
      willChange:'left,top,width,height,border-radius,object-position,opacity'
    });
    document.body.appendChild(img);
    return img;
  }

  async function restoreSurface(){
    // Horizontal state first, while the fullscreen overlay hides any correction.
    if(surface === 'works' && Number.isFinite(railX)){
      try{
        if(typeof dragController !== 'undefined' && dragController?.setX){
          dragController.setX(railX, false);
        }else{
          const stage = document.querySelector('#worksStage');
          if(stage) stage.scrollLeft = Math.max(0, -railX);
        }
      }catch{}
    }

    if(Number.isFinite(scrollPosition)){
      window.scrollTo({top:scrollPosition,left:0,behavior:'auto'});
    }else{
      const section = surface === 'featured' ? document.querySelector('#featured')
        : surface === 'archive' ? document.querySelector('.archive-main')
        : document.querySelector('#portfolio');
      if(section) window.scrollTo({top:Math.max(0, section.offsetTop - 12),left:0,behavior:'auto'});
    }

    await frames(3);

    // Dynamic content can recalculate the rail once after first layout, so restore once more.
    if(surface === 'works' && Number.isFinite(railX)){
      try{
        if(typeof dragController !== 'undefined' && dragController?.setX){
          dragController.setX(railX, false);
        }else{
          const stage = document.querySelector('#worksStage');
          if(stage) stage.scrollLeft = Math.max(0, -railX);
        }
      }catch{}
      await frames(2);
    }
  }

  async function placeTargetInViewport(){
    targetImage = imageFor(targetLink);
    if(!targetImage) throw new Error('return target image missing');
    targetCard = targetLink.closest('.project-card,.featured-project');
    await ready(targetImage);

    if(surface === 'works'){
      const stage = document.querySelector('#worksStage');
      const stageRect = stage?.getBoundingClientRect();
      let rect = targetImage.getBoundingClientRect();
      if(stage && stageRect){
        const leftMiss = stageRect.left - rect.left;
        const rightMiss = rect.right - stageRect.right;
        if(leftMiss > 1 || rightMiss > 1){
          try{
            if(typeof dragController !== 'undefined' && dragController?.setX && dragController?.getX){
              const now = dragController.getX() || 0;
              dragController.setX(now + (leftMiss > 1 ? leftMiss : -rightMiss), false);
            }else{
              stage.scrollLeft += leftMiss > 1 ? -leftMiss : rightMiss;
            }
          }catch{}
          await frames(2);
        }
      }
    }

    let rect = targetImage.getBoundingClientRect();
    if(rect.bottom < 48 || rect.top > innerHeight - 48 || rect.right < 24 || rect.left > innerWidth - 24){
      targetLink.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});
      await frames(3);
      rect = targetImage.getBoundingClientRect();
    }
    if(rect.width < 2 || rect.height < 2) throw new Error('return target has no box');
    return rect;
  }

  async function animateToTarget(rect){
    const style = getComputedStyle(targetImage);
    const radius = style.borderRadius || '12px';
    const objectPosition = style.objectPosition || '50% 50%';

    targetImage.style.visibility = 'hidden';
    targetCard?.classList.add('is-v45-return-target');

    // The actual IMG now fully owns the transition. Remove the temporary CSS pseudo only after paint.
    await frames(2);
    clearLegacyMasks();
    await frames(2);

    if(reduced){
      Object.assign(overlay.style, {
        left:`${rect.left}px`, top:`${rect.top}px`, width:`${rect.width}px`, height:`${rect.height}px`,
        borderRadius:radius, objectPosition
      });
      return;
    }

    // CSS transition is deliberately used instead of Web Animations here: it survives the
    // layout/repaint sequence more consistently in file:// previews and hosted Chromium/Safari.
    overlay.style.transition = [
      'left 500ms cubic-bezier(.18,.78,.16,1)',
      'top 500ms cubic-bezier(.18,.78,.16,1)',
      'width 500ms cubic-bezier(.18,.78,.16,1)',
      'height 500ms cubic-bezier(.18,.78,.16,1)',
      'border-radius 500ms cubic-bezier(.18,.78,.16,1)',
      'object-position 500ms cubic-bezier(.18,.78,.16,1)'
    ].join(',');

    // Force the full-screen state to be committed before setting the destination state.
    void overlay.getBoundingClientRect();
    await frame();
    Object.assign(overlay.style, {
      left:`${rect.left}px`,
      top:`${rect.top}px`,
      width:`${rect.width}px`,
      height:`${rect.height}px`,
      borderRadius:radius,
      objectPosition
    });

    await new Promise(resolve => {
      let ended = false;
      const finish = () => { if(ended) return; ended = true; overlay.removeEventListener('transitionend', onEnd); resolve(); };
      const onEnd = event => { if(event.target === overlay && ['left','width','top','height'].includes(event.propertyName)) finish(); };
      overlay.addEventListener('transitionend', onEnd);
      setTimeout(finish, 620);
    });
  }

  async function handoff(){
    if(targetImage) targetImage.style.removeProperty('visibility');
    targetCard?.classList.remove('is-v45-return-target','is-return-target');
    if(!overlay) return;
    overlay.style.transition = reduced ? 'none' : 'opacity 70ms linear';
    await frame();
    overlay.style.opacity = '0';
    await sleep(reduced ? 0 : 85);
    overlay.remove();
    overlay = null;
  }

  async function releaseWithoutMorph(){
    clearLegacyMasks();
    if(overlay){
      overlay.style.transition = reduced ? 'none' : 'opacity 150ms ease-out';
      await frame();
      overlay.style.opacity = '0';
      await sleep(reduced ? 0 : 170);
      overlay.remove();
      overlay = null;
    }
  }

  async function run(){
    // Build the real continuity surface immediately. The inline ::before remains underneath
    // until this image has had at least one chance to paint.
    overlay = createOverlay();
    await ready(overlay, 500);
    await frames(2);

    targetLink = await waitTarget();
    if(!targetLink) throw new Error('return target not rendered');

    await restoreSurface();
    const rect = await placeTargetInViewport();

    const actualSlug = targetLink.dataset.project || targetCard?.dataset.project || '';
    if(surface === 'featured' && actualSlug !== slug){
      // Navigated to a non-featured case study: preserve the FEATURED return location,
      // but do not fake object continuity to a different project cover.
      await releaseWithoutMorph();
      cleanUrl();
      done = true;
      return;
    }

    // If ptrimg was absent or failed, use the real card source without cancelling the motion.
    if(!incomingImage || !overlay.complete || overlay.naturalWidth < 1){
      overlay.src = targetImage.currentSrc || targetImage.src;
      await ready(overlay, 450);
    }

    await animateToTarget(rect);
    await handoff();
    cleanUrl();
    done = true;
  }

  async function failSafe(){
    if(done) return;
    if(targetImage) targetImage.style.removeProperty('visibility');
    targetCard?.classList.remove('is-v45-return-target','is-return-target');
    await releaseWithoutMorph();
    cleanUrl();
    done = true;
  }

  const start = () => run().catch(failSafe).finally(() => root.classList.remove('project-return-v50-running'));
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();

  // Genuine deadlock guard only. It does not touch a normal 500 ms morph.
  setTimeout(() => { if(!done) failSafe(); }, 6500);
})();

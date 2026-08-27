/* Navigation lifecycle hotfix — owns only browser history/BFCache recovery.
   Project forward/reverse animations stay in their existing transition scripts. */
(() => {
  const root = document.documentElement;
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function isHistoryRestore(event) {
    if (event?.persisted) return true;
    try {
      return performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
    } catch {
      return false;
    }
  }

  function clearTransientRootState() {
    root.classList.remove(
      'project-transition-active',
      'global-transition-arrival',
      'global-transition-arrival-release',
      'detail-back-v45-fade',
      'detail-back-v45-scrolling',
      'detail-back-v44-fade',
      'detail-back-v44-scrolling',
      'detail-back-fade',
      'detail-back-scrolling',
      'detail-returning'
    );
    document.querySelectorAll('[data-project-back]').forEach(button => {
      Object.keys(button.dataset).forEach(key => {
        if (/^busy/i.test(key)) delete button.dataset[key];
      });
    });
  }

  async function releaseGlobalTransitionLayers() {
    const layers = [...document.querySelectorAll('.global-transition-layer')];
    if (!layers.length) return;
    for (const layer of layers) {
      layer.style.transition = reducedMotion() ? 'none' : 'opacity 90ms linear';
      layer.style.opacity = '0';
    }
    await sleep(reducedMotion() ? 0 : 105);
    layers.forEach(layer => layer.remove());
    try { sessionStorage.removeItem('portfolioGlobalTransitionV40'); } catch {}
  }

  function clearOrphanProjectMasks(exceptClone = null) {
    document.querySelectorAll('.transition-shade,.transition-surface,.transition-v50-return-clone').forEach(el => el.remove());
    document.querySelectorAll('.transition-v45-clone').forEach(el => {
      if (el !== exceptClone) el.remove();
    });
    root.classList.remove(
      'pt-return-arrival','pt-return-release',
      'reverse-arrival-pending','reverse-arrival-release',
      'is-restoring-project','project-return-v50-active','project-return-v50-running'
    );
    root.style.removeProperty('--transition-image');
  }

  async function recoverForwardProjectClone() {
    const clones = [...document.querySelectorAll('.transition-v45-clone')];
    const clone = clones.at(-1) || null;
    const targetCard = document.querySelector('.project-card.is-v45-return-target,.featured-project.is-v45-return-target');
    const targetImage = targetCard?.querySelector('.project-card-image, img') || null;

    if (!clone || !targetCard || !targetImage) {
      clones.forEach(el => el.remove());
      document.querySelectorAll('.is-v45-return-target,.is-return-target').forEach(el => el.classList.remove('is-v45-return-target','is-return-target'));
      clearOrphanProjectMasks();
      return false;
    }

    // Preserve the visual position owned by the finished WAAPI animation before cancelling it.
    const currentRect = clone.getBoundingClientRect();
    const currentStyle = getComputedStyle(clone);
    Object.assign(clone.style, {
      left: `${currentRect.left}px`,
      top: `${currentRect.top}px`,
      width: `${currentRect.width}px`,
      height: `${currentRect.height}px`,
      borderRadius: currentStyle.borderRadius || '0px',
      opacity: '1'
    });
    clone.getAnimations?.().forEach(animation => animation.cancel());
    clearOrphanProjectMasks(clone);

    try {
      if (!targetImage.complete) {
        await Promise.race([
          new Promise(resolve => {
            targetImage.addEventListener('load', resolve, { once: true });
            targetImage.addEventListener('error', resolve, { once: true });
          }),
          sleep(450)
        ]);
      }
      if (targetImage.decode) await Promise.race([targetImage.decode().catch(() => {}), sleep(250)]);
    } catch {}

    await nextFrame();
    await nextFrame();
    const targetRect = targetImage.getBoundingClientRect();
    if (targetRect.width < 2 || targetRect.height < 2) {
      clone.remove();
      targetCard.classList.remove('is-v45-return-target','is-return-target');
      return false;
    }

    if (!reducedMotion()) {
      const targetStyle = getComputedStyle(targetImage);
      const animation = clone.animate([
        {
          left: `${currentRect.left}px`, top: `${currentRect.top}px`,
          width: `${currentRect.width}px`, height: `${currentRect.height}px`,
          borderRadius: clone.style.borderRadius || '0px', opacity: 1
        },
        {
          left: `${targetRect.left}px`, top: `${targetRect.top}px`,
          width: `${targetRect.width}px`, height: `${targetRect.height}px`,
          borderRadius: targetStyle.borderRadius || '12px', opacity: 1
        }
      ], {
        duration: 420,
        easing: 'cubic-bezier(.18,.78,.16,1)',
        fill: 'forwards'
      });
      try { await Promise.race([animation.finished, sleep(500)]); } catch {}
    }

    targetCard.classList.remove('is-v45-return-target','is-return-target');
    clone.style.transition = reducedMotion() ? 'none' : 'opacity 65ms linear';
    clone.style.opacity = '0';
    await sleep(reducedMotion() ? 0 : 75);
    clone.remove();
    return true;
  }

  async function recoverHistoryPage(event) {
    if (!isHistoryRestore(event)) return;
    clearTransientRootState();
    await Promise.all([
      releaseGlobalTransitionLayers(),
      recoverForwardProjectClone()
    ]);
  }

  addEventListener('pageshow', recoverHistoryPage);
})();

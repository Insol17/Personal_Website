const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header state + active navigation */
const header = document.querySelector('.site-header');
const navLinks = [...document.querySelectorAll('.site-navigation a[href^="#"]')];
const sections = [...document.querySelectorAll('main > section[id]')];

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle(
          'is-active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    });
  }, { rootMargin: '-34% 0px -58% 0px', threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));
}

/* Scroll reveal */
const revealItems = [...document.querySelectorAll('[data-reveal]')];
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  document.body.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

/* Hero depth: translation only */
const hero = document.querySelector('.hero');
const heroImage = document.querySelector('.hero-background-image');
if (hero && heroImage && !reduceMotion) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    heroImage.style.setProperty('--hero-x', `${nx * -7}px`);
    heroImage.style.setProperty('--hero-y', `${ny * -5}px`);
  });
  hero.addEventListener('pointerleave', () => {
    heroImage.style.setProperty('--hero-x', '0px');
    heroImage.style.setProperty('--hero-y', '0px');
  });
}

/* Missing images never show browser broken-image icons. */
document.querySelectorAll('img').forEach((image) => {
  image.addEventListener('error', () => {
    image.style.visibility = 'hidden';
  });
});

/* Horizontal portfolio: continuous drag with inertia, no snap. */
const viewport = document.querySelector('.project-slider-viewport');
const track = document.querySelector('#projectSlider');
const prevButton = document.querySelector('[data-project-prev]');
const nextButton = document.querySelector('[data-project-next]');
const progress = document.querySelector('[data-project-progress]');

if (viewport && track) {
  let isPointerDown = false;
  let didDrag = false;
  let suppressClickUntil = 0;
  let startX = 0;
  let startScroll = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let inertiaFrame = 0;
  let smoothFrame = 0;

  const maxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);

  function updateProgress() {
    const maximum = maxScroll();
    const ratio = maximum > 0 ? viewport.scrollLeft / maximum : 0;
    progress?.style.setProperty('transform', `scaleX(${Math.min(1, Math.max(0, ratio))})`);
  }

  function stopAnimations() {
    cancelAnimationFrame(inertiaFrame);
    cancelAnimationFrame(smoothFrame);
  }

  function cardStep() {
    const card = track.querySelector('.project-card');
    if (!card) return Math.max(280, viewport.clientWidth * 0.7);
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap || style.columnGap || '18') || 18;
    return card.getBoundingClientRect().width + gap;
  }

  function animateTo(target) {
    stopAnimations();
    const from = viewport.scrollLeft;
    const destination = Math.min(maxScroll(), Math.max(0, target));
    const distance = destination - from;
    const duration = reduceMotion ? 0 : 520;
    const started = performance.now();

    if (!duration) {
      viewport.scrollLeft = destination;
      updateProgress();
      return;
    }

    function frame(now) {
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      viewport.scrollLeft = from + distance * eased;
      updateProgress();
      if (t < 1) smoothFrame = requestAnimationFrame(frame);
    }
    smoothFrame = requestAnimationFrame(frame);
  }

  function runInertia() {
    cancelAnimationFrame(inertiaFrame);
    if (reduceMotion) return;

    function frame() {
      velocity *= 0.94;
      if (Math.abs(velocity) < 0.12) return;
      const before = viewport.scrollLeft;
      viewport.scrollLeft -= velocity * 16;
      updateProgress();
      if (viewport.scrollLeft === before) return;
      inertiaFrame = requestAnimationFrame(frame);
    }
    inertiaFrame = requestAnimationFrame(frame);
  }

  prevButton?.addEventListener('click', () => animateTo(viewport.scrollLeft - cardStep()));
  nextButton?.addEventListener('click', () => animateTo(viewport.scrollLeft + cardStep()));

  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    stopAnimations();
    isPointerDown = true;
    didDrag = false;
    startX = lastX = event.clientX;
    startScroll = viewport.scrollLeft;
    lastTime = performance.now();
    velocity = 0;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!isPointerDown) return;
    const now = performance.now();
    const delta = event.clientX - startX;
    const dt = Math.max(8, now - lastTime);
    velocity = (event.clientX - lastX) / dt;
    lastX = event.clientX;
    lastTime = now;

    if (Math.abs(delta) > 4) didDrag = true;
    viewport.scrollLeft = startScroll - delta;
    updateProgress();
  });

  function finishPointer(event) {
    if (!isPointerDown) return;
    isPointerDown = false;
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture?.(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    if (didDrag) {
      suppressClickUntil = performance.now() + 260;
      runInertia();
    }
    didDrag = false;
  }

  viewport.addEventListener('pointerup', finishPointer);
  viewport.addEventListener('pointercancel', finishPointer);

  track.addEventListener('click', (event) => {
    if (performance.now() > suppressClickUntil) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      animateTo(viewport.scrollLeft - cardStep());
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      animateTo(viewport.scrollLeft + cardStep());
    }
  });

  viewport.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

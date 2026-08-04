const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------
   Header state + active navigation
-------------------------------------------------- */
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
        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-36% 0px -55% 0px', threshold: 0 });
  sections.forEach((section) => sectionObserver.observe(section));
}

/* --------------------------------------------------
   Reveal
-------------------------------------------------- */
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
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

/* --------------------------------------------------
   Hero depth — subtle, transform only
-------------------------------------------------- */
const hero = document.querySelector('.hero');
const heroImage = document.querySelector('.hero-background-image');
if (hero && heroImage && !reduceMotion) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    heroImage.style.setProperty('--hero-x', `${nx * -10}px`);
    heroImage.style.setProperty('--hero-y', `${ny * -8}px`);
  });
  hero.addEventListener('pointerleave', () => {
    heroImage.style.setProperty('--hero-x', '0px');
    heroImage.style.setProperty('--hero-y', '0px');
  });
}

/* --------------------------------------------------
   Portrait tilt
-------------------------------------------------- */
const portrait = document.querySelector('.about-portrait-card');
const portraitInner = portrait?.querySelector('.about-portrait-inner');
if (portrait && portraitInner && !reduceMotion) {
  portrait.addEventListener('pointermove', (event) => {
    const rect = portrait.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    portraitInner.style.setProperty('--portrait-rx', `${y * -4.5}deg`);
    portraitInner.style.setProperty('--portrait-ry', `${x * 4.5}deg`);
  });
  portrait.addEventListener('pointerleave', () => {
    portraitInner.style.setProperty('--portrait-rx', '0deg');
    portraitInner.style.setProperty('--portrait-ry', '0deg');
  });
}

/* --------------------------------------------------
   Timeline reading progress
-------------------------------------------------- */
const timeline = document.querySelector('[data-timeline]');
function updateTimeline() {
  if (!timeline) return;
  const rect = timeline.getBoundingClientRect();
  const start = window.innerHeight * 0.76;
  const end = window.innerHeight * 0.22;
  const progress = Math.min(1, Math.max(0, (start - rect.top) / (rect.height + start - end)));
  timeline.style.setProperty('--timeline-progress', progress.toFixed(3));
}
if (timeline && !reduceMotion) {
  updateTimeline();
  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);
}

/* --------------------------------------------------
   Horizontal portfolio: pointer drag, snap, keyboard
-------------------------------------------------- */
const slider = document.querySelector('#projectSlider');
const progressBar = document.querySelector('.portfolio-progress-v19 span');

function updatePortfolioProgress() {
  if (!slider || !progressBar) return;
  const max = slider.scrollWidth - slider.clientWidth;
  const value = max > 0 ? slider.scrollLeft / max : 0;
  progressBar.style.transform = `scaleX(${Math.max(0.08, value).toFixed(3)})`;
}

if (slider) {
  let pointerId = null;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  slider.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScroll = slider.scrollLeft;
    moved = false;
    slider.setPointerCapture?.(pointerId);
    slider.classList.add('is-dragging');
  });

  slider.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    slider.scrollLeft = startScroll - dx;
  });

  function endDrag(event) {
    if (pointerId === null || (event.pointerId !== undefined && event.pointerId !== pointerId)) return;
    slider.releasePointerCapture?.(pointerId);
    pointerId = null;
    slider.classList.remove('is-dragging');
    window.setTimeout(() => { moved = false; }, 0);
  }
  slider.addEventListener('pointerup', endDrag);
  slider.addEventListener('pointercancel', endDrag);
  slider.addEventListener('click', (event) => {
    if (!moved) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  slider.addEventListener('dragstart', (event) => event.preventDefault());
  slider.addEventListener('scroll', updatePortfolioProgress, { passive: true });
  slider.tabIndex = 0;
  slider.setAttribute('aria-label', '프로젝트 목록. 좌우 방향키 또는 드래그로 탐색');
  slider.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const card = slider.querySelector('.project-card');
    const amount = (card?.getBoundingClientRect().width || 420) + 28;
    slider.scrollBy({ left: event.key === 'ArrowRight' ? amount : -amount, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  updatePortfolioProgress();
  window.addEventListener('resize', updatePortfolioProgress);
}

/* --------------------------------------------------
   Image errors should not show broken icons
-------------------------------------------------- */
document.querySelectorAll('img').forEach((image) => {
  image.addEventListener('error', () => {
    image.classList.add('is-missing');
    image.style.visibility = 'hidden';
  });
});

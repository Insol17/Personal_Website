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


/* Orbital decorative parallax: subtle, non-blocking. */
const orbital = document.querySelector('.hero-orbital-system');
if (hero && orbital && !reduceMotion) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    orbital.style.transform = `translate(${nx * 10}px, ${ny * 8}px)`;
  });
  hero.addEventListener('pointerleave', () => {
    orbital.style.transform = 'translate(0, 0)';
  });
}

/* Missing images never show browser broken-image icons. */
document.querySelectorAll('img').forEach((image) => {
  image.addEventListener('error', () => {
    image.style.visibility = 'hidden';
  });
});

/* Horizontal portfolio: natural drag, native link clicks, finite bounds. */
const viewport = document.querySelector('.project-slider-viewport');
const track = document.querySelector('#projectSlider');
const prevButton = document.querySelector('[data-project-prev]');
const nextButton = document.querySelector('[data-project-next]');
const progress = document.querySelector('[data-project-progress]');

if (viewport && track) {
  let pointerId = null;
  let pointerStartX = 0;
  let startScrollLeft = 0;
  let dragStarted = false;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let suppressNextClick = false;
  let inertiaFrame = 0;
  let smoothFrame = 0;

  const cards = [...track.querySelectorAll('.project-card')];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const maxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);

  function updateState() {
    const maximum = maxScroll();
    const current = clamp(viewport.scrollLeft, 0, maximum);
    const ratio = maximum > 0 ? current / maximum : 0;
    progress?.style.setProperty('transform', `scaleX(${ratio})`);
    if (prevButton) prevButton.disabled = current <= 1;
    if (nextButton) nextButton.disabled = current >= maximum - 1;
  }

  function stopMotion() {
    cancelAnimationFrame(inertiaFrame);
    cancelAnimationFrame(smoothFrame);
  }

  function cardStep() {
    const card = cards[0];
    if (!card) return viewport.clientWidth * 0.75;
    const gap = parseFloat(getComputedStyle(track).gap || '20') || 20;
    return card.getBoundingClientRect().width + gap;
  }

  function animateTo(target) {
    stopMotion();
    const from = viewport.scrollLeft;
    const destination = clamp(target, 0, maxScroll());
    const distance = destination - from;
    if (Math.abs(distance) < 1) return updateState();

    if (reduceMotion) {
      viewport.scrollLeft = destination;
      updateState();
      return;
    }

    const duration = 430;
    const started = performance.now();
    function frame(now) {
      const t = clamp((now - started) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      viewport.scrollLeft = from + distance * eased;
      updateState();
      if (t < 1) smoothFrame = requestAnimationFrame(frame);
    }
    smoothFrame = requestAnimationFrame(frame);
  }

  function runInertia() {
    cancelAnimationFrame(inertiaFrame);
    if (reduceMotion || Math.abs(velocity) < 0.05) return;

    function frame() {
      velocity *= 0.9;
      const maximum = maxScroll();
      const next = clamp(viewport.scrollLeft - velocity * 18, 0, maximum);
      const hitBoundary = next === 0 || next === maximum;
      viewport.scrollLeft = next;
      updateState();
      if (!hitBoundary && Math.abs(velocity) >= 0.05) {
        inertiaFrame = requestAnimationFrame(frame);
      }
    }
    inertiaFrame = requestAnimationFrame(frame);
  }

  prevButton?.addEventListener('click', () => {
    animateTo(viewport.scrollLeft - cardStep());
  });
  nextButton?.addEventListener('click', () => {
    animateTo(viewport.scrollLeft + cardStep());
  });

  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    stopMotion();
    pointerId = event.pointerId;
    pointerStartX = lastX = event.clientX;
    startScrollLeft = viewport.scrollLeft;
    lastTime = performance.now();
    velocity = 0;
    dragStarted = false;
    suppressNextClick = false;
  });

  window.addEventListener('pointermove', (event) => {
    if (pointerId !== event.pointerId) return;
    const delta = event.clientX - pointerStartX;
    if (!dragStarted && Math.abs(delta) < 7) return;

    if (!dragStarted) {
      dragStarted = true;
      viewport.classList.add('is-dragging');
    }

    event.preventDefault();
    const now = performance.now();
    const dt = Math.max(8, now - lastTime);
    velocity = (event.clientX - lastX) / dt;
    lastX = event.clientX;
    lastTime = now;
    viewport.scrollLeft = clamp(startScrollLeft - delta, 0, maxScroll());
    updateState();
  }, { passive: false });

  function finishDrag(event) {
    if (pointerId !== event.pointerId) return;
    if (dragStarted) {
      suppressNextClick = true;
      runInertia();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { suppressNextClick = false; });
      });
    }
    viewport.classList.remove('is-dragging');
    pointerId = null;
    dragStarted = false;
  }

  window.addEventListener('pointerup', finishDrag);
  window.addEventListener('pointercancel', finishDrag);

  track.addEventListener('click', (event) => {
    if (!suppressNextClick) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  // Explicit fallback: a genuine click always follows the anchor URL.
  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.defaultPrevented || suppressNextClick) return;
      const href = card.getAttribute('href');
      if (!href) return;
      // Native navigation normally handles this. The fallback covers browsers
      // that changed the click target after a pointer interaction.
      if (event.target === viewport || event.target === track) {
        window.location.href = href;
      }
    });
  });

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

  viewport.addEventListener('scroll', updateState, { passive: true });
  window.addEventListener('resize', updateState);
  updateState();
}


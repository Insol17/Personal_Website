const prefersReducedMotion =
  window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

/* ==================================================
   Boot intro
================================================== */

const bootScreen =
  document.querySelector('#bootScreen');

const bootSkip =
  document.querySelector('#bootSkip');

const bootStatus =
  document.querySelector('#bootStatus');

let bootFinished = false;

const forceBoot =
  new URLSearchParams(window.location.search)
    .get('boot') === '1';

let bootAlreadySeen = false;

try {
  bootAlreadySeen =
    window.sessionStorage.getItem(
      'portfolioBootSeenInTab'
    ) === 'true';
} catch (error) {
  bootAlreadySeen = false;
}

function finishBoot() {
  if (bootFinished) {
    return;
  }

  bootFinished = true;

  try {
    window.sessionStorage.setItem(
      'portfolioBootSeenInTab',
      'true'
    );
  } catch (error) {
    /* 저장소를 사용할 수 없어도 인트로 종료는 계속한다. */
  }

  document.body.classList.remove('is-booting');
  document.body.classList.add('site-ready');

  if (!bootScreen) {
    return;
  }

  bootScreen.classList.add('is-exiting');

  window.setTimeout(function () {
    bootScreen.remove();
  }, 500);
}

if (
  prefersReducedMotion ||
  (bootAlreadySeen && !forceBoot)
) {
  finishBoot();
} else if (bootScreen) {
  const statusSteps = [
    [360, 'LOADING PROFILE'],
    [760, 'LOADING PORTFOLIO'],
    [1180, 'CONNECTING INTERFACE'],
    [1540, 'ONLINE']
  ];

  statusSteps.forEach(function (step) {
    window.setTimeout(function () {
      if (!bootFinished && bootStatus) {
        bootStatus.textContent = step[1];
      }
    }, step[0]);
  });

  window.setTimeout(finishBoot, 1850);

  if (bootSkip) {
    bootSkip.addEventListener('click', finishBoot);
  }

  window.addEventListener('keydown', function (event) {
    if (
      event.key === 'Escape' ||
      event.key === 'Enter'
    ) {
      finishBoot();
    }
  });
} else {
  finishBoot();
}

/* ==================================================
   Hero image
================================================== */

const heroBackground =
  document.querySelector('.hero-background-image');

if (heroBackground) {
  heroBackground.addEventListener('error', function () {
    console.error(
      'main.jpg를 찾지 못했습니다. assets/images/main.jpg 경로와 파일 확장자를 확인하세요.'
    );
  });
}

/* ==================================================
   Scroll reveal
================================================== */

const revealElements =
  document.querySelectorAll('[data-reveal]');

if (
  prefersReducedMotion ||
  !('IntersectionObserver' in window)
) {
  revealElements.forEach(function (element) {
    element.classList.add('is-visible');
  });
} else {
  document.body.classList.add('motion-ready');

  const revealObserver =
    new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
      }
    );

  revealElements.forEach(function (element) {
    revealObserver.observe(element);
  });
}

/* ==================================================
   Optional About image
================================================== */

document
  .querySelectorAll('[data-optional-image]')
  .forEach(function (image) {
    function hideOptionalImage() {
      image.closest('.optional-visual')
        ?.classList.add('is-hidden');
    }

    image.addEventListener('error', hideOptionalImage);

    if (
      image.complete &&
      image.naturalWidth === 0
    ) {
      hideOptionalImage();
    }
  });

/* ==================================================
   About portrait tilt
================================================== */

const portraitCard =
  document.querySelector('.about-portrait-card');

if (
  portraitCard &&
  !prefersReducedMotion
) {
  const portraitInner =
    portraitCard.querySelector('.about-portrait-inner');

  portraitCard.addEventListener(
    'pointermove',
    function (event) {
      if (!portraitInner) {
        return;
      }

      const rect =
        portraitCard.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) /
        rect.width;

      const y =
        (event.clientY - rect.top) /
        rect.height;

      const rotateY =
        (x - 0.5) * 7;

      const rotateX =
        (0.5 - y) * 7;

      portraitInner.style.setProperty(
        '--portrait-rx',
        `${rotateX}deg`
      );

      portraitInner.style.setProperty(
        '--portrait-ry',
        `${rotateY}deg`
      );
    }
  );

  portraitCard.addEventListener(
    'pointerleave',
    function () {
      if (!portraitInner) {
        return;
      }

      portraitInner.style.setProperty(
        '--portrait-rx',
        '0deg'
      );

      portraitInner.style.setProperty(
        '--portrait-ry',
        '0deg'
      );
    }
  );
}

/* ==================================================
   Timeline progress
================================================== */

const aboutTimeline =
  document.querySelector('[data-timeline]');

function updateTimelineProgress() {
  if (!aboutTimeline) {
    return;
  }

  const rect =
    aboutTimeline.getBoundingClientRect();

  const viewportHeight =
    window.innerHeight;

  const start =
    viewportHeight * 0.78;

  const end =
    viewportHeight * 0.24;

  const progress =
    Math.min(
      1,
      Math.max(
        0,
        (start - rect.top) /
        (rect.height + start - end)
      )
    );

  aboutTimeline.style.setProperty(
    '--timeline-progress',
    progress.toFixed(3)
  );
}

if (
  aboutTimeline &&
  !prefersReducedMotion
) {
  updateTimelineProgress();

  window.addEventListener(
    'scroll',
    updateTimelineProgress,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    updateTimelineProgress
  );
}

/* ==================================================
   Portfolio drag
================================================== */

const projectSlider =
  document.querySelector('#projectSlider');

if (projectSlider) {
  let isMouseDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let hasDragged = false;

  projectSlider.addEventListener(
    'mousedown',
    function (event) {
      if (event.button !== 0) {
        return;
      }

      isMouseDown = true;
      hasDragged = false;
      startX = event.pageX;
      startScrollLeft =
        projectSlider.scrollLeft;

      projectSlider.classList.add(
        'is-dragging'
      );
    }
  );

  window.addEventListener(
    'mousemove',
    function (event) {
      if (!isMouseDown) {
        return;
      }

      const movement =
        event.pageX - startX;

      if (Math.abs(movement) > 6) {
        hasDragged = true;
      }

      projectSlider.scrollLeft =
        startScrollLeft - movement;

      if (hasDragged) {
        event.preventDefault();
      }
    }
  );

  window.addEventListener(
    'mouseup',
    function () {
      if (!isMouseDown) {
        return;
      }

      isMouseDown = false;

      projectSlider.classList.remove(
        'is-dragging'
      );

      window.setTimeout(function () {
        hasDragged = false;
      }, 0);
    }
  );

  projectSlider.addEventListener(
    'click',
    function (event) {
      if (hasDragged) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );

  projectSlider.addEventListener(
    'dragstart',
    function (event) {
      event.preventDefault();
    }
  );
}

/* 일반 이미지 오류 처리 */
document
  .querySelectorAll(
    'img:not([data-optional-image])'
  )
  .forEach(function (image) {
    image.addEventListener(
      'error',
      function () {
        image.style.display = 'none';
      }
    );
  });

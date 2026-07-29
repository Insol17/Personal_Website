const backButton = document.querySelector('[data-project-back]');

if (backButton) {
  backButton.addEventListener('click', function () {
    window.history.back();
  });
}

/*
  설명 문단 아래의 overview 이미지:
  파일이 없으면 해당 figure 전체를 제거한다.
*/
document
  .querySelectorAll('.project-feature-media img')
  .forEach(function (image) {
    image.addEventListener('error', function () {
      image.closest('.project-feature-media')?.remove();
    });
  });

/*
  스크린샷:
  존재하지 않는 이미지는 카드째 제거한다.
  모든 스크린샷이 없으면 MEDIA GALLERY 섹션 전체를 숨긴다.
*/
const screenshotSections =
  document.querySelectorAll(
    '.project-media-section:not(.project-video-section)'
  );

screenshotSections.forEach(function (section) {
  const gallery =
    section.querySelector('.project-media-grid');

  const images =
    Array.from(
      section.querySelectorAll('.project-gallery-item img')
    );

  if (!gallery || images.length === 0) {
    section.remove();
    return;
  }

  let settledCount = 0;

  function finishScreenshotCheck() {
    settledCount += 1;

    if (settledCount !== images.length) {
      return;
    }

    const remainingItems =
      gallery.querySelectorAll('.project-gallery-item');

    if (remainingItems.length === 0) {
      section.remove();
    }
  }

  images.forEach(function (image) {
    image.addEventListener('load', function () {
      finishScreenshotCheck();
    });

    image.addEventListener('error', function () {
      image.closest('.project-gallery-item')?.remove();
      finishScreenshotCheck();
    });

    /*
      캐시에 이미 들어온 이미지도 정상 처리한다.
    */
    if (image.complete) {
      if (image.naturalWidth > 0) {
        finishScreenshotCheck();
      } else {
        image.closest('.project-gallery-item')?.remove();
        finishScreenshotCheck();
      }
    }
  });
});

/*
  일반 유튜브 주소를 영상 ID로 변환한다.

  지원:
  youtube.com/watch?v=...
  youtu.be/...
  youtube.com/shorts/...
  youtube.com/embed/...
  영상 ID 직접 입력
*/
function getYouTubeVideoId(urlText) {
  if (!urlText) {
    return '';
  }

  const value = urlText.trim();

  if (/^[a-zA-Z0-9_-]{6,}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (url.pathname.startsWith('/watch')) {
      return url.searchParams.get('v') || '';
    }

    const pathParts =
      url.pathname.split('/').filter(Boolean);

    if (
      ['shorts', 'embed'].includes(pathParts[0]) &&
      pathParts[1]
    ) {
      return pathParts[1];
    }
  } catch (error) {
    return '';
  }

  return '';
}

/*
  영상:
  URL이 비어 있는 카드는 제거한다.
  등록된 영상이 하나도 없으면 VIDEO 섹션 전체를 숨긴다.
*/
document
  .querySelectorAll('.project-video-section')
  .forEach(function (section) {
    const grid =
      section.querySelector('.project-video-grid');

    const cards =
      Array.from(
        section.querySelectorAll('.project-video-card')
      );

    if (!grid || cards.length === 0) {
      section.remove();
      return;
    }

    cards.forEach(function (videoCard) {
      const videoId =
        getYouTubeVideoId(
          videoCard.dataset.youtubeUrl || ''
        );

      if (!videoId) {
        videoCard.remove();
        return;
      }

      const iframe =
        document.createElement('iframe');

      iframe.src =
        `https://www.youtube.com/embed/${videoId}`;

      iframe.title =
        videoCard.dataset.videoLabel ||
        'YouTube project video';

      iframe.loading = 'lazy';

      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

      iframe.referrerPolicy =
        'strict-origin-when-cross-origin';

      iframe.allowFullscreen = true;

      videoCard.appendChild(iframe);
    });

    if (
      grid.querySelectorAll('.project-video-card')
        .length === 0
    ) {
      section.remove();
    }
  });

const heroBackground = document.querySelector('.hero-background-image');

if (heroBackground) {
  heroBackground.addEventListener('error', function () {
    console.error(
      'main.jpg를 찾지 못했습니다. assets/images/main.jpg 경로와 파일 확장자를 확인하세요.'
    );
  });
}

const projectSlider = document.querySelector('#projectSlider');

if (projectSlider) {
  let isMouseDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let hasDragged = false;

  projectSlider.addEventListener('mousedown', function (event) {
    if (event.button !== 0) {
      return;
    }

    isMouseDown = true;
    hasDragged = false;
    startX = event.pageX;
    startScrollLeft = projectSlider.scrollLeft;

    projectSlider.classList.add('is-dragging');
  });

  window.addEventListener('mousemove', function (event) {
    if (!isMouseDown) {
      return;
    }

    const movement = event.pageX - startX;

    if (Math.abs(movement) > 6) {
      hasDragged = true;
    }

    projectSlider.scrollLeft = startScrollLeft - movement;

    if (hasDragged) {
      event.preventDefault();
    }
  });

  window.addEventListener('mouseup', function () {
    if (!isMouseDown) {
      return;
    }

    isMouseDown = false;
    projectSlider.classList.remove('is-dragging');

    /*
      click 이벤트는 mouseup 직후 발생한다.
      한 이벤트 사이클 뒤에 드래그 상태를 초기화해야
      일반 클릭과 드래그를 정확히 구분할 수 있다.
    */
    window.setTimeout(function () {
      hasDragged = false;
    }, 0);
  });

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

  projectSlider.addEventListener('dragstart', function (event) {
    event.preventDefault();
  });
}

/* 이미지 파일이 아직 없을 때 깨진 아이콘 숨기기 */
document.querySelectorAll('img').forEach(function (image) {
  image.addEventListener('error', function () {
    image.style.display = 'none';
  });
});

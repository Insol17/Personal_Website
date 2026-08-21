# v32 UX Notes

## Works rail

카드 클릭과 드래그는 서로 다른 의도입니다. v30은 pointerdown 즉시 pointer capture를 걸어 링크의 click target까지 가로채는 문제가 있었습니다.
v32은 movement threshold를 넘기기 전까지 클릭 의미를 보존하고, 7px 이상 수평 이동한 뒤에만 drag mode로 전환합니다.

- Direct manipulation: 카드 자체가 조작 대상
- Affordance: grab cursor + HOLD + DRAG cue + DRAG TO EXPLORE
- Error prevention: 실제 drag가 발생한 직후의 click만 억제
- Touch: vertical page scroll은 유지하고 horizontal intent만 rail 이동으로 처리

## Project transition

출발 카드 이미지의 실제 viewport rect를 clone에 적용하고 브라우저가 시작 geometry를 paint하도록 강제한 뒤, 다음 두 animation frame에서 100vw × 100vh로 확장합니다. 전환 중 텍스트는 추가하지 않습니다.

Back으로 BFCache에서 복귀할 경우 `pageshow`에서 transition overlay를 제거해 화면이 clone에 멈추지 않게 합니다.

## Admin content ownership

레이아웃 코드와 사용자 콘텐츠를 분리합니다.

- defaults/: 배포 기본값
- user-content/: 사용자가 Admin에서 발행한 데이터

이는 Separation of Concerns와 Error Prevention을 유지보수 UX에 적용한 구조입니다. 코드 패치가 사용자 문구를 덮는 위험을 줄입니다.

## V32 continuity patch
- Project entry uses the exact card image as an arrival mask before the destination document paints. The detail vignette and copy appear only after the hero image is ready, preserving object continuity across a real HTML navigation.
- The in-page BACK control performs a reverse continuity transition: detail chrome fades, the image returns to its undimmed state, and the destination page shrinks the same image back into the originating project card.
- WORKS progress is now a travelling thumb across the full available track instead of a partially filled meter, so the end state visibly reaches the end.
- Journal cards prefer images extracted from Naver RSS and cached by GitHub Actions. Missing images use category-level visual fallbacks instead of ordinal numbers.
- Small metadata type was raised selectively rather than globally to preserve hierarchy while improving legibility.

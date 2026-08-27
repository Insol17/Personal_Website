# v47 Patch Notes

## HERO WORLDS

- v46에서 `WORLDS`가 통째로 사라지던 원인을 수정했습니다.
- v45의 `span:nth-child(2):not(.hero-worlds-liquid-v45){opacity:0!important}` 규칙이 v46 WORLDS까지 숨기고 있었습니다.
- v47은 별도의 `hero-worlds.css/js`가 HERO 두 번째 줄을 단독 소유합니다.
- Yellowtail 기반 흰색 캘리그라피를 기본 DOM fallback으로 먼저 표시하고, Canvas가 실제로 그려진 뒤에만 Canvas로 교체합니다.
- v42~v45의 구형 HERO 초기화 호출을 비활성화했습니다. 해당 파일은 다른 섹션 기능만 담당합니다.
- 보라/핑크/청록 그라데이션, 블록형 WORLDS, 기하학 장식은 사용하지 않습니다.
- 방향성 liquid displacement와 흰색 droplet/splash는 유지합니다.

## 폴더 구조

- PATCH/HOTFIX/UX 문서를 `docs/patch-notes/`로 이동했습니다.
- Admin 문서를 `docs/ADMIN_GUIDE.md`로 이동했습니다.
- 메인 런타임 CSS → `styles/runtime/`
- 메인 런타임 JS → `scripts/runtime/`
- 프로젝트 상세 런타임 → `projects/runtime/`
- Journal/전환/About helper → `scripts/`
- Naver 자동화 → `scripts/automation/`
- 현재 페이지가 참조하지 않는 오래된 v31~v40 런타임과 구형 project-detail 런타임을 제거했습니다.
- GitHub Actions의 자동화 스크립트 경로도 새 구조에 맞게 변경했습니다.

## 문서

- README를 한국어로 다시 작성했습니다.
- 현재 디렉터리 구조, 실행 방법, Admin, Journal 자동화, HERO 구조를 설명합니다.
- `docs/STRUCTURE.md`를 추가했습니다.

## 콘텐츠 보존

- `assets/` 구조는 건드리지 않았습니다.
- `user-content/`는 패치 ZIP에 포함하지 않습니다.

# 곽태웅 개인 포트폴리오 웹사이트

게임 디자인·개발 프로젝트와 작업 기록을 정리한 개인 포트폴리오입니다.
메인 진입점은 항상 `index.html`입니다.

현재 패치 기준: **v48**

## 실행

가장 간단한 확인 방법은 `index.html`을 브라우저에서 여는 것입니다.

다만 프로젝트 전환, JSON 콘텐츠 로딩, Journal fetch까지 실제 배포 환경과 최대한 동일하게 확인하려면 로컬 HTTP 서버 사용을 권장합니다.

```bash
python -m http.server 8000
```

실행 후 브라우저에서 `http://localhost:8000/`으로 접속합니다.

## 폴더 구조

```text
/
├─ index.html                 # 메인 포트폴리오
├─ about.html                 # About 상세
├─ projects/                  # 프로젝트 목록 / 상세 페이지
│  └─ runtime/                # 프로젝트 상세 전용 런타임
├─ journal/                   # Journal 전체 보기
├─ admin/                     # 콘텐츠 편집 / GitHub Publish
├─ assets/                    # 이미지, 영상, Journal 캐시 등 정적 자산
├─ defaults/                  # 공개 기본 콘텐츠 데이터
├─ styles/
│  ├─ runtime/                # 현재 사이트가 사용하는 스타일 레이어
│  └─ hero-worlds.css         # HERO WORLDS 전용 스타일
├─ scripts/
│  ├─ runtime/                # 현재 사이트 동작 레이어
│  ├─ automation/             # Naver Journal / keepalive 자동화
│  ├─ hero-worlds.js          # HERO WORLDS 단일 렌더러
│  ├─ global-transition.js    # 일반 페이지 전환
│  ├─ about-page.js
│  └─ journal.js
├─ docs/
│  ├─ ADMIN_GUIDE.md          # Admin 사용법
│  └─ patch-notes/            # 과거 버전 수정 내역
└─ .github/workflows/         # GitHub Actions
```

루트에 흩어져 있던 버전별 PATCH 문서는 `docs/patch-notes/`로 이동했습니다. 과거에 더 이상 참조하지 않는 런타임 파일은 제거했고, 현재 필요한 레이어만 `styles/runtime/`, `scripts/runtime/`, `projects/runtime/`에 남겨 두었습니다.

## 콘텐츠 수정

공개 사이트의 기본 데이터는 `defaults/`에 있습니다. 실제 운영 중 Admin에서 발행한 사용자 콘텐츠는 `user-content/`를 우선 사용합니다.

패치 ZIP에는 `user-content/`를 넣지 않습니다. 따라서 새 버전을 적용할 때는 저장소 전체를 삭제하지 말고 기존 저장소 위에 병합해야 Admin에서 수정한 내용이 유지됩니다.

Admin 주소:

```text
/admin/
```

자세한 사용 방법은 `docs/ADMIN_GUIDE.md`를 참고합니다.

## Naver Journal 자동 동기화

GitHub Actions가 매시 `:17`에 Naver Blog RSS를 확인합니다.

- 글 내용이 바뀌지 않았으면 commit을 만들지 않습니다.
- 실제 Journal 데이터가 달라졌을 때만 `chore: sync Naver journal` commit을 생성합니다.
- 장기간 글이 없어도 scheduled workflow가 비활성화될 가능성을 줄이기 위해 약 30일 간격 keepalive를 사용합니다.

자동화 스크립트는 `scripts/automation/`에 있습니다.

## HERO WORLDS

`WORLDS`는 `scripts/hero-worlds.js`가 단독으로 관리합니다.

- Yellowtail 기반 흰색 캘리그라피
- 포인터 이동 방향에 따라 획이 물처럼 밀리는 displacement
- 빠른 복원
- 흰색 droplet / splash
- Canvas가 실패하거나 폰트 로딩이 늦어도 필기체 DOM fallback을 먼저 표시

이전 버전의 HERO 렌더러는 실행되지 않도록 분리했습니다.

## 배포

현재 구조는 GitHub Pages 정적 배포를 기준으로 합니다. `main` 브랜치에 반영한 뒤 기존 Pages 설정을 그대로 사용할 수 있습니다.

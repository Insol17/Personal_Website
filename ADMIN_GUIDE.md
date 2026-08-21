# Portfolio v39 — Admin 사용법

## 1. 접속

배포 후 아래 주소로 접속합니다.

`https://insol17.github.io/Personal_Website/admin/`

Admin은 디자인/CSS를 자유 배치하는 툴이 아니라, 레이아웃을 잠근 상태에서 Hero, About, Background, Projects, Contact 콘텐츠를 수정하는 툴입니다.

## 2. Publish

`PUBLISH`에서 GitHub Fine-grained PAT를 입력합니다.

- Repository access: `Personal_Website`만 선택
- Repository permissions: **Contents → Read and write**
- Owner: `Insol17`
- Repository: `Personal_Website`
- Branch: `main`

토큰은 사이트 파일에 저장하지 않고 현재 브라우저 세션의 `sessionStorage`에만 둡니다.

## 3. Featured Projects

`PROJECTS`에서 각 프로젝트를 선택하면 다음 항목을 수정할 수 있습니다.

- `FEATURED PROJECT` — 메인의 FEATURED 영역 노출 여부
- `FEATURED ORDER` — 1, 2, 3 순서
- `FEATURED ROLE` — 대표 역할/기여 영역
- `FEATURED ONE-LINER` — 대표 프로젝트에서 보여줄 핵심 기여 한 문장

v39 기본 Featured는 Benedict of Sins / Salgut / Fernand 3개입니다.

## 4. 프로젝트 추가

`PROJECTS → + NEW PROJECT`

TITLE / SLUG / GENRE를 입력하면 새 프로젝트가:

- `site.projects`에 추가되고
- WORKS와 All Projects에 자동 반영되며
- 기본 case-study JSON이 생성되고
- Publish 때 `projects/<slug>.html`도 자동 생성됩니다.

새 프로젝트는 기본적으로 Featured가 아닙니다. 대표작으로 올리고 싶다면 `FEATURED PROJECT`를 켜고 순서/역할/한 줄을 입력하면 됩니다.

## 5. About

메인 ABOUT은 `WHO / WHAT / HOW`만 보여주도록 압축되어 있습니다.

Admin의 ABOUT에서:

- 메인 소개 문장/프로필
- FULL ABOUT PAGE의 Intro/Perspective
- HOW I WORK

를 수정할 수 있습니다.

공개 사이트의 `MORE ABOUT ME`를 누르면 `/about.html`에서 학력, 프로젝트 경험, 작업 관점을 더 깊게 볼 수 있습니다.

## 6. 사용자 콘텐츠 보존

Admin Publish 결과는 다음 위치에 저장됩니다.

- `user-content/site.json`
- `user-content/projects/*.json`
- `user-content/media/...`

v39 패치 ZIP에는 `user-content/`를 넣지 않습니다.

**새 버전은 기존 저장소/폴더 위에 병합해서 덮어쓰세요. 기존 저장소를 삭제하고 새 ZIP만 다시 올리면 `user-content/`도 함께 지워질 수 있습니다.**

코드 로딩 우선순위는:

1. `user-content/`
2. 기존 `content/`
3. `defaults/`

입니다.

## 7. Journal

Journal 원본은 네이버 블로그 `GEMEINSCHAFT`입니다.

GitHub Actions가 매시 **17분** RSS를 확인합니다. 새 글/수정 내용이 있으면 `assets/data/journal.json`과 대표 이미지를 자동 갱신하고 GitHub Pages가 다시 배포됩니다.

- DEVLOG → 포트폴리오 메인 Journal의 주 콘텐츠
- CRITIQUE → 보조 영역
- LIFE → 메인에는 노출하지 않고 전체 Journal/네이버 블로그에서 확인

블로그 주소는 Admin의 `JOURNAL → BLOG URL`에서 변경할 수 있습니다.

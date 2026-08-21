# Portfolio v33 — Admin 사용법

## 1. 접속

배포 후 아래 주소로 접속합니다.

`https://insol17.github.io/Personal_Website/admin/`

Admin은 디자인/CSS를 직접 편집하는 툴이 아니라, 레이아웃을 잠근 상태에서 Hero, About, Background, Projects, Contact 콘텐츠를 수정하는 툴입니다.

## 2. Publish

`PUBLISH`에서 GitHub Fine-grained PAT를 입력합니다.

- Repository access: `Personal_Website`만 선택
- Repository permissions: **Contents → Read and write**
- Owner: `Insol17`
- Repository: `Personal_Website`
- Branch: `main`

토큰은 사이트 파일에 저장하지 않고 현재 브라우저 세션의 `sessionStorage`에만 둡니다.

## 3. 프로젝트 추가

`PROJECTS → + NEW PROJECT`

TITLE / SLUG / GENRE를 입력하면 새 프로젝트가:

- `site.projects`에 추가되고
- Selected Works와 All Projects에 자동 반영되며
- 기본 case-study JSON이 생성되고
- Publish 때 `projects/<slug>.html`도 자동 생성됩니다.

각 프로젝트의 `PUBLIC / ALL PROJECTS`, `SELECTED WORKS` 옵션으로 노출 범위를 정할 수 있습니다.

## 4. 사용자 콘텐츠가 패치 때 사라지지 않는 구조

Admin Publish 결과는 다음 위치에 저장됩니다.

- `user-content/site.json`
- `user-content/projects/*.json`
- `user-content/media/...`

v33 패치 ZIP에는 `user-content/`를 넣지 않습니다.

**새 버전은 기존 저장소/폴더 위에 병합해서 덮어쓰세요. 기존 저장소를 삭제하고 새 ZIP만 다시 올리면 `user-content/`도 함께 지워질 수 있습니다.**

코드 로딩 우선순위는:

1. `user-content/`
2. 기존 `content/`
3. `defaults/`

입니다.

`EXPORT BACKUP`으로 콘텐츠 JSON 백업도 따로 보관할 수 있습니다.

## 5. Journal은 Admin에서 작성하지 않음

Journal 원본은 네이버 블로그 `GEMEINSCHAFT`입니다.

GitHub Actions가 매시 **17분** RSS를 확인합니다. 새 글/수정 내용이 있으면 `assets/data/journal.json`과 대표 이미지를 자동 갱신하고 GitHub Pages가 다시 배포됩니다.

- DEVLOG → 포트폴리오 메인 Journal의 주 콘텐츠
- CRITIQUE → 작은 보조 영역
- LIFE → 메인에는 노출하지 않고 전체 Journal/네이버 블로그에서 확인

블로그 글이 장기간 없어도 `.github/journal-keepalive`를 30일 간격으로 갱신하는 workflow가 포함되어 있습니다.

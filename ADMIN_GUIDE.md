# Portfolio v31 — Admin 사용법

`/admin/`은 레이아웃을 망가뜨리지 않고 **사이트 콘텐츠만 직접 수정하는 편집기**입니다.
문구, 프로필, 이력, 프로젝트 순서/추가, 커버 이미지, 프로젝트 상세, Contact를 브라우저에서 수정할 수 있습니다.

## 1. Admin 열기

배포 주소:

```text
https://insol17.github.io/Personal_Website/admin/
```

로컬 파일을 더블클릭하면 `fetch()`가 차단될 수 있습니다. 로컬 확인은 사이트 폴더에서:

```bash
python -m http.server 8000
```

후 `http://localhost:8000/admin/`으로 접속하세요.

## 2. v31부터 수정 내용이 패치로 사라지지 않는 구조

v31은 **코드와 사용자 콘텐츠를 완전히 분리**합니다.

```text
defaults/              # 버전과 함께 배포되는 기본값
user-content/          # Admin에서 Publish한 나의 실제 콘텐츠
```

공개 사이트는 다음 순서로 데이터를 찾습니다.

```text
1. user-content/
2. content/            # v30 호환용 legacy
3. defaults/
```

Admin에서 `PUBLISH TO GITHUB`를 한 번 실행하면 수정 내용은 다음에 저장됩니다.

```text
user-content/site.json
user-content/projects/<slug>.json
user-content/media/...
```

**v31 이후 업데이트 ZIP에는 `user-content/`를 넣지 않습니다.** 따라서 새 버전을 기존 폴더 위에 덮어쓰는 방식으로 업데이트하면 Admin에서 수정한 내용은 덮어써지지 않습니다.

중요:
- 업데이트할 때 기존 저장소를 통째로 삭제한 뒤 새 ZIP만 올리지 마세요.
- 새 버전 파일을 **기존 폴더 위에 병합/덮어쓰기** 하세요.
- 더 안전하게 하려면 Admin → `PUBLISH` → `EXPORT BACKUP`을 먼저 눌러 JSON 백업도 보관하세요.

### v30에서 v31로 처음 넘어올 때

v31은 기존 `content/site.json`, `content/projects/*.json`을 자동으로 읽습니다. 기존 v30 파일 위에 v31을 덮어쓴 뒤 Admin에서 한 번 Publish하면 `user-content/`로 자동 마이그레이션됩니다.

v30에서 `SAVE DRAFT`만 하고 아직 Publish하지 않은 내용도 같은 브라우저라면 v31이 v30 Draft 키를 찾아 복원하도록 되어 있습니다.

## 3. 프로젝트 수정

`PROJECTS`에서 상단 드롭다운이나 각 행의 `EDIT` 버튼으로 원하는 프로젝트를 선택합니다.

수정 가능한 항목:
- 카드 제목
- 장르
- 커버 이미지
- `PUBLIC / ALL PROJECTS`
- `SELECTED WORKS`
- 상세 Hero / Overview / Facts / Pillars / Features / Responsibility / Reflection

프로젝트 행의 **⠿ 핸들만** 잡아 위아래로 이동하면 공개 순서를 바꿀 수 있습니다. `EDIT` 버튼과 드래그가 충돌하지 않도록 분리했습니다.

## 4. 새 프로젝트 추가

`PROJECTS` → `+ NEW PROJECT`를 누릅니다.

입력:

```text
TITLE   프로젝트 이름
SLUG    URL용 영문 식별자 (예: my-new-game)
GENRE   장르/유형
```

`CREATE PROJECT`를 누르면 자동으로:

- `SELECTED WORKS`에 추가
- `ALL PROJECTS`에 추가
- 상세 Case Study 데이터 생성
- `projects/<slug>.html` 경로 예약

됩니다.

커버 이미지와 상세 내용을 입력한 뒤 Publish하면, Admin이 GitHub에 `projects/<slug>.html`도 자동 생성합니다. 따라서 프로젝트를 추가할 때 HTML 파일을 직접 만들 필요가 없습니다.

## 5. 프로젝트 커버 교체

`REPLACE COVER`로 이미지를 교체하면 하나의 이미지가:

1. 메인 SELECTED WORKS
2. ALL PROJECTS
3. 상세 페이지 풀스크린 Hero

에 공통 사용됩니다.

업로드 이미지는 `user-content/media/projects/...`에 저장되므로 이후 코드 패치에 덮어써지지 않습니다.

## 6. Draft와 Backup 차이

### SAVE DRAFT
현재 브라우저의 `localStorage`에 임시 저장합니다. GitHub에는 올라가지 않습니다.

### EXPORT BACKUP
사이트 JSON + 모든 프로젝트 상세 JSON을 한 파일로 내려받습니다. 버전 업데이트 전 권장합니다.

### IMPORT BACKUP
Export한 JSON을 다시 Admin으로 불러옵니다. 불러온 뒤 `PUBLISH TO GITHUB`를 눌러야 실제 사이트에 반영됩니다.

## 7. GitHub에 실제 발행

GitHub Fine-grained Personal Access Token이 필요합니다.

1. GitHub → `Settings`
2. `Developer settings`
3. `Personal access tokens`
4. `Fine-grained tokens`
5. 새 토큰 생성
6. Repository access → `Only select repositories`
7. `Personal_Website`만 선택
8. Repository permissions → `Contents: Read and write`

Admin → `PUBLISH` 기본값:

```text
OWNER       Insol17
REPOSITORY  Personal_Website
BRANCH      main
```

토큰을 넣고 `PUBLISH TO GITHUB`를 누릅니다.
토큰은 저장소 파일에는 기록되지 않고 현재 탭의 `sessionStorage`에만 저장됩니다.

## 8. Journal

Journal 글은 Admin에서 작성하지 않습니다.

```text
NAVER BLOG (GEMEINSCHAFT)
→ RSS
→ GitHub Action
→ assets/data/journal.json
→ Portfolio
```

글 추가/수정/삭제는 네이버 블로그에서 합니다.

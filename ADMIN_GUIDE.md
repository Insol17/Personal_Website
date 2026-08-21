# Portfolio v30 — Admin 사용법

`/admin/`은 포트폴리오의 **디자인을 바꾸는 페이지가 아니라 콘텐츠를 관리하는 페이지**입니다.
레이아웃/CSS는 잠겨 있고, 문구·이력·프로젝트 순서·프로젝트 커버·상세 설명·Contact 링크를 브라우저에서 수정합니다.

## 1. Admin 열기

배포 후 아래 주소로 접속합니다.

```text
https://insol17.github.io/Personal_Website/admin/
```

로컬에서 확인하려면 폴더를 더블클릭하는 대신 간단한 로컬 서버를 사용합니다.

```bash
python -m http.server 8000
```

그 다음:

```text
http://localhost:8000/admin/
```

## 2. 편집

왼쪽 메뉴에서 다음을 수정할 수 있습니다.

- `HOME` — Hero 문구
- `ABOUT` — 자기소개, 프로필 사진, 프로필 요약, HOW I WORK
- `BACKGROUND` — 학력, 프로젝트 경험, 수상/대회 이력
- `PROJECTS` — 프로젝트 순서, 제목, 장르, 공개 여부, 카드/상세 Hero 이미지, 상세 Case Study 텍스트
- `JOURNAL` — 네이버 블로그 주소. 글 자체는 네이버 블로그에서 작성
- `CONTACT` — Mail / GitHub / LinkedIn / Blog

오른쪽은 실제 사이트 Preview입니다.

### 프로젝트 순서 변경

`PROJECTS`에서 `⠿`가 붙은 행을 위아래로 드래그합니다.
저장된 순서가 메인 WORKS와 ALL PROJECTS에 그대로 반영됩니다.

### 프로젝트 이미지 변경

프로젝트를 `EDIT`한 뒤 `REPLACE COVER`를 누릅니다.
이 이미지는:

1. 메인 WORKS 카드
2. ALL PROJECTS 카드
3. 상세 페이지의 풀스크린 Hero

에 같은 이미지로 사용됩니다. 따라서 카드 → 상세 페이지 전환 이미지가 끊기지 않습니다.

## 3. Draft 저장

상단 `SAVE DRAFT`는 **현재 브라우저의 localStorage에만 저장**합니다.
GitHub에는 아무것도 올라가지 않습니다.

실수로 페이지를 닫았을 때 작업을 이어가기 위한 기능입니다.

## 4. GitHub에 실제 발행하기

Admin 페이지 자체는 공개 URL이지만, **GitHub 쓰기 권한이 없으면 사이트를 수정할 수 없습니다.**
비밀번호를 JavaScript에 숨겨두는 방식은 사용하지 않습니다.

### 최초 1회: Fine-grained Personal Access Token 만들기

GitHub에서:

1. 프로필 사진 → `Settings`
2. `Developer settings`
3. `Personal access tokens`
4. `Fine-grained tokens`
5. `Generate new token`
6. Repository access에서 **Only select repositories** 선택
7. `Personal_Website` 저장소만 선택
8. Repository permissions → `Contents` → **Read and write**
9. 토큰 생성

권장:

- 이 저장소 한 개만 허용
- `Contents: Read and write` 외 권한은 추가하지 않음
- 만료일 설정

### Admin의 PUBLISH 화면

기본값:

```text
OWNER       Insol17
REPOSITORY  Personal_Website
BRANCH      main
```

`FINE-GRAINED PAT`에 방금 만든 토큰을 붙여 넣고 `PUBLISH TO GITHUB`를 누릅니다.

Admin은 필요한 콘텐츠 파일만 GitHub Contents API로 커밋합니다.

```text
content/site.json
content/site-data.js              # 첫 화면에서 즉시 읽는 런타임 사본
content/projects/*.json
교체한 이미지 파일
projects/<slug>.html              # 커버를 바꾼 프로젝트만 Hero 이미지 경로 동기화
```

토큰은 저장소 코드에 기록되지 않습니다. 현재 탭의 `sessionStorage`에만 보관합니다.

## 5. 발행 후

GitHub Pages가 새 커밋을 배포하면 실제 사이트에 반영됩니다.
보통 바로 반영되지만 Pages 배포 상태에 따라 잠시 걸릴 수 있습니다.

## 6. Journal은 어떻게 수정하나

저널 글은 Admin에서 작성하지 않습니다.

```text
NAVER BLOG (GEMEINSCHAFT)
→ RSS
→ GitHub Action
→ assets/data/journal.json
→ Portfolio LATEST JOURNALS
```

즉 글 추가/수정/삭제는 네이버 블로그에서 합니다.
GitHub Actions의 `Update Naver Journal` 워크플로가 매일 RSS를 동기화합니다.
즉시 갱신하고 싶으면 GitHub → Actions → `Update Naver Journal` → `Run workflow`를 실행합니다.

## 7. 중요한 구조

v30부터 공개 페이지의 콘텐츠 원본은 HTML이 아니라 다음 JSON입니다.

```text
content/
├─ site.json
└─ projects/
   ├─ benedict.json
   ├─ salgut.json
   ├─ fernand.json
   ├─ deco.json
   ├─ kinosis.json
   └─ machinator.json
```

HTML/CSS = 디자인과 레이아웃

JSON = 직접 수정하는 콘텐츠

이 분리 덕분에 이후 문구를 고칠 때 `index.html`을 열 필요가 없습니다.

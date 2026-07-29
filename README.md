# 곽태웅 포트폴리오 템플릿

## 파일 배치
아래 이미지 파일을 직접 추가하세요.

- assets/images/hero.jpg
- assets/images/profile.jpg
- assets/images/projects/fernand.jpg
- assets/images/projects/machinator.jpg
- assets/images/projects/salgut.jpg
- assets/images/projects/benedict.jpg

이력서 PDF를 내려받게 하려면 다음 파일도 추가하세요.

- assets/resume.pdf

## 실행
index.html을 더블클릭하거나 VS Code의 Live Server로 실행하세요.

## 구조
HOME → ABOUT → PROJECTS → CONTACT

- ABOUT: 얼굴 사진, 자기소개, 학력, 프로젝트 경험, 역량, 도구
- PROJECTS: 가로형 대표 프로젝트 슬라이더
- ALL PROJECTS: Steam Library 형태의 6열 프로젝트 그리드


## 이번 수정
- 메인 문구: I CREATE / CHANGE / ENJOY / DESIGN WORLD 타이핑 전환
- 메인 프로젝트: 4:5 세로형 Remedy 스타일 카드
- All Projects: 설명 문구 제거, 검은 배경 통일, 한 줄 4개, 3:4 커버


## 프로젝트 상세 페이지
- 왼쪽 위 BACK 버튼: 이전 페이지로 이동, 직접 접속 시 All Projects로 이동
- 상세 이미지는 assets/images/projects/details/에 넣습니다.
- 상세 이미지가 없으면 프로젝트 대표 이미지가 자동으로 대신 표시됩니다.


## 2026-07-29 업데이트
- 메인 배경 파일명을 `assets/images/main.jpg`로 변경
- 메인 문구를 `I DESIGN WORLDS`로 고정
- 프로젝트 순서: 01 Benedict, 02 Salgut, 03 Fernand, 04 De.Co, 05 Machinator
- De.Co 타워디펜스 프로젝트 페이지 추가
- 프로젝트 상세 BACK 버튼을 브라우저 뒤로가기로 변경
- About의 EXPERIENCE를 연혁형 TIMELINE으로 변경


## V5 변경
- PROJECTS 표기를 PORTFOLIO로 변경
- 카드 하단 분류를 GAME / APPLICATION으로 단순화
- TIMELINE을 세로 지하철 노선도 형식으로 변경
- 메인 배경을 assets/images/main.jpg 이미지 요소로 변경
- 컬러 팔레트: #222222 / #7B7B7B / #F8F8F8 / #FFFFFF
- 첫 화면 요소가 아래에서 위로 순차 등장하는 애니메이션 추가


## V6 Gothic Noir palette
- Black: #000000
- Light gray: #D1D0D0
- Dusty mauve: #988686
- Dark wine: #5C4E4E

About, Contact, Portfolio, All Portfolio, project detail pages were converted back to a fully dark visual system.


## V7 가독성 개선
- 고딕 누아르 무드는 유지하되 본문과 제목을 밝은 중성색으로 변경
- 메인 이미지 밝기와 대비 상향, 중앙 텍스트 배경 대비 보강
- Portfolio 카드 이미지 밝기 상향 및 비네트 범위 축소
- VIEW PROJECT 문구를 기본 상태에서도 보이게 변경
- Timeline을 연도 / 노선 / 내용 3열 구조로 재작성해 숫자와 세로선 간격 확보
- Contact와 프로젝트 상세 페이지 텍스트 대비 개선


## V8 변경
- 와인색 계열 제거
- 단일 강조색: Steel Blue `#8FA7B5`
- ABOUT ME 자기소개를 이력서형 문장으로 재작성
- 메인 소개 제목을 `기획을 플레이로 검증합니다.`로 축약
- CAPABILITIES를 `WHAT I DO` 3개 핵심 역량으로 재구성


## V9 변경

### 텍스트 대비
- 중요한 제목: `#FBFCFD`
- 본문: `#E1E5E8`
- 보조 정보: `#B8C0C6`
- 기존 붉은 선택 영역 제거
- 드래그로 글자를 선택했을 때의 색상은 중성 스틸 그레이로 변경

### 상세 페이지 스크린샷
프로젝트마다 6개를 넣을 수 있습니다.

`assets/images/projects/screenshots/`

예:
- `salgut-01.jpg`
- `salgut-02.jpg`
- ...
- `salgut-06.jpg`

### 상세 페이지 유튜브 영상
각 프로젝트 HTML에서 다음 부분을 찾습니다.

`data-youtube-url=""`

따옴표 안에 일반 유튜브 주소를 그대로 붙여 넣으면 됩니다.

예:
`data-youtube-url="https://www.youtube.com/watch?v=영상ID"`

프로젝트마다 최대 3개가 한 줄에 표시됩니다.


## V10 프로젝트 이미지 구조

모든 프로젝트 이미지는 프로젝트별 폴더로 분리됩니다.

```text
assets/images/projects/
├─ benedict/
│  ├─ cover.jpg
│  ├─ overview/
│  │  ├─ 01.jpg
│  │  ├─ 02.jpg
│  │  └─ 03.jpg
│  └─ screenshots/
│     ├─ 01.jpg
│     └─ 02.jpg
├─ salgut/
├─ fernand/
├─ deco/
└─ machinator/
```

### cover.jpg

- 메인 Portfolio 카드
- 전체 Portfolio 목록
- 프로젝트 상세 페이지 상단 Hero

### overview

프로젝트 설명 문단 아래에 표시됩니다.

예:

```text
assets/images/projects/benedict/overview/01.jpg
assets/images/projects/benedict/overview/02.jpg
assets/images/projects/benedict/overview/03.jpg
```

파일이 없으면 이미지 영역 자체가 표시되지 않습니다.

### screenshots

스크린샷 갤러리에 표시됩니다.

```text
assets/images/projects/benedict/screenshots/01.jpg
...
assets/images/projects/benedict/screenshots/06.jpg
```

존재하는 이미지만 표시됩니다. 한 장도 없으면 스크린샷 섹션 전체가 사라집니다.

### 영상

프로젝트 HTML의 다음 값에 유튜브 링크를 입력합니다.

```html
data-youtube-url="https://www.youtube.com/watch?v=VIDEO_ID"
```

링크가 있는 영상만 표시됩니다. 영상이 하나도 없으면 영상 섹션 전체가 사라집니다.

### 기존 이미지 자동 이동

Windows PowerShell에서 프로젝트 루트의 다음 파일을 실행합니다.

```text
migrate-project-images.ps1
```

기존 평면 폴더의 이미지가 새 프로젝트별 폴더 구조로 이동합니다.


## V11 변경

- 웹사이트에 노출되던 미디어 등록 안내 문구 삭제
- 설명 이미지의 `추후 교체` 캡션 삭제
- 스크린샷 번호 캡션 삭제
- De.Co 첫 번째 유튜브 영상 등록
- De.Co의 임시 개발 각주와 상태 설명 제거
- 등록되지 않은 스크린샷과 영상은 계속 자동 숨김


## V15 About & Boot

### Boot intro
- 메인 페이지 진입 시 `I CREATE WORLDS` 부팅 인트로 표시
- 약 2.35초 후 Hero 전환
- `SKIP`, Enter, Escape로 건너뛰기
- `prefers-reduced-motion` 환경에서는 자동 비활성화

### About
- 개발자·게임 디자이너용 이력서형 About으로 전면 재구성
- 프로필 → 소개 → 증거 지표 → 작업 방식 → 산출물 → 연혁 → 도구 순서
- 스크롤 등장 애니메이션
- 프로필 이미지 포인터 틸트
- 타임라인 진행선 애니메이션
- 도구 마키 애니메이션

### 선택 이미지
`assets/images/about/workspace.jpg`

파일이 없으면 해당 카드가 자동으로 숨겨집니다.


### Boot 재생 규칙
- 같은 브라우저 탭 세션에서는 최초 1회만 재생됩니다.
- 다시 확인할 때는 주소 뒤에 `?boot=1`을 붙입니다.
  - 예: `index.html?boot=1`


## V16 변경

### 부팅 인트로
- 문구: `READY TO PLAY`
- 최초 방문 시 한 번만 재생
- `localStorage` 기준으로 브라우저를 다시 열어도 반복 재생하지 않음
- 재생 시간: 약 1.85초
- 테스트 재생: `index.html?boot=1`

### About
- 프로젝트 세부 기믹과 철학 설명 제거
- HOW I WORK 4단계 제거
- WHAT I DELIVER 제거
- 통계 스트립 제거
- 도구 마키 제거
- 구성: 소개 → 주요 업무 → 프로젝트 연혁


## V17 변경

### Boot
- `sessionStorage` 기준으로 브라우저 탭의 첫 진입에서만 재생
- 같은 탭에서 새로고침, 뒤로가기, 상세 페이지 복귀 시 재생하지 않음
- 탭을 닫고 새 탭에서 다시 접속하면 재생

### About
- `I DESIGN WORLDS`를 바탕으로 `세계와 규칙을 설계합니다.`로 포지셔닝
- Unity 전용 개발자처럼 보이는 표현 제거
- 중복 직군 표기 제거
- 주요 업무와 연혁 중앙 정렬
- 주요 업무 호버를 배경 전개 + 대형 번호 + 텍스트 이동 방식으로 변경
- Contact 좌우 분할 배경은 의도된 디자인으로 유지


## V18 변경

### GitHub Pages Boot 수정
- `script.js?v=18`, `experience.css?v=18`로 캐시 무효화
- 외부 JS 로드 실패 시 2.4초 후 종료하는 인라인 안전장치 추가
- CSS만 로드되어도 Boot가 자동으로 사라지는 2차 안전장치 추가
- 정상적인 Boot 재생 시간은 기존 약 1.85초 유지
- 같은 탭의 새로고침·뒤로가기·상세 페이지 복귀에서는 Boot 생략

### 프로젝트 연혁
- 세로 축을 화면 중앙에 배치
- 연도는 중앙 축 왼쪽, 프로젝트 정보는 오른쪽에 균형 있게 배치
- 프로젝트 정보 최대 폭을 제한해 과도한 가로선 제거
- 항목 호버 시 정보가 미세하게 이동하고 노드가 강조됨

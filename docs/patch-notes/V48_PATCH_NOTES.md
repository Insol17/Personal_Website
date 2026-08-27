# v48 — 모바일 구성 / 프로젝트 상세 진입 모션

## 프로젝트 상세 진입
- WORKS/FEATURED 카드 이미지가 fullscreen으로 확장된 뒤 상세 페이지의 텍스트와 상단 UI가 즉시 튀어나오지 않도록 수정했습니다.
- 실제 Hero 이미지가 준비된 뒤 배경 treatment가 먼저 들어오고, 약 70ms 뒤에 제목·외부 링크·상단바·BACK이 opacity + 짧은 translate 모션으로 순차 등장합니다.
- 직접 상세 URL로 들어온 경우에는 기존 페이지 진입을 방해하지 않습니다.

## 모바일 HERO
- 760px 이하에서 HERO copy 전체를 viewport 기준으로 강제 중앙 정렬합니다.
- I DESIGN / WORLDS / 서브카피 / 링크 아이콘을 하나의 중앙 축으로 묶었습니다.
- WORLDS canvas 폭을 viewport에서 안전하게 제한해 한쪽으로 밀리지 않도록 했습니다.

## 모바일 ABOUT
- 메인 ABOUT은 텍스트를 먼저 읽고, 작은 프로필 사진과 ROLE/FOCUS/TOOLS가 같은 행에서 하나의 프로필 정보 블록으로 보이도록 재구성했습니다.
- About 상세는 큰 사진이 단독으로 먼저 뜨지 않습니다. 헤드라인 뒤에서 Intro와 작은 portrait가 같은 모바일 컴포지션으로 묶입니다.
- WHAT I DO / 상세 Method / Background의 글자 크기와 세로 간격을 모바일 스캔 기준으로 재조정했습니다.

## 그 외 모바일
- FEATURED, WORKS, BACKGROUND, JOURNAL, ALL PROJECTS, 프로젝트 상세의 폭·타이포·세로 리듬을 760px 이하에서 재조정했습니다.
- WORKS는 touch 환경에서 native swipe를 유지하고 하단 bar/arrow는 보조 입력으로 남겼습니다.
- ALL PROJECTS는 모바일에서 1열 16:10 카드로 고정해 가로 overflow를 방지합니다.

## 구조
- 루트에 남아 있던 과거 PATCH/UX 문서 중복본을 실제로 제거했습니다. 버전 문서는 `docs/patch-notes/`에서만 관리합니다.

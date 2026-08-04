# KWAK TAEWOONG Portfolio — V21 Style Guide

> 정갈 · 프로페셔널 · 메탈릭 모노톤. 블랙/오프화이트를 기본으로 하고, 네온 대신 저채도 **Blue Steel**을 인터랙션 신호로 제한적으로 사용한다.

## 1. Color Tokens

| 역할 | 색상 | 코드 |
|---|---|---|
| Background | Black | `#08090A` |
| Deep Background | Near Black | `#050607` |
| Section Background | Off Black | `#0D0F11` |
| Surface | Charcoal | `#131619` |
| Raised Surface | Gunmetal | `#191D21` |
| Text Primary | Off White | `#F3F4F2` |
| Text Secondary | Silver Gray | `#C4C8CB` |
| Muted Text | Mid Gray | `#80878D` |
| Divider | Metallic Gray | `rgba(231,235,237,.14)` |
| Accent | Blue Steel | `#94A7B4` |
| Accent Light | Polished Steel | `#C2CCD2` |
| Metallic Gradient | Brushed Steel | `#687179 → #C4CBD0 → #77838B` |

### Accent rule

- 네온 색상은 사용하지 않는다.
- Blue Steel은 활성 네비게이션, 주요 CTA, 호버 상태, 진행선에만 사용한다.
- 한 화면에서 넓은 색 면적은 주요 CTA 한 곳만 허용한다.
- 프로젝트 이미지와 본문 텍스트에는 강조색 필터를 씌우지 않는다.

## 2. Alignment Axis

모든 일반 섹션은 헤더 로고와 동일한 좌측 기준선에서 시작한다.

```text
Logo axis = ABOUT = 주요 업무 = 프로젝트 연혁 = PORTFOLIO = CONTACT
```

- 홈 히어로만 브랜드 임팩트를 위해 2열 구성을 허용한다.
- 주요 업무와 연혁은 가운데 정렬하지 않는다.
- 타임라인은 단일 좌측 세로선 구조만 사용한다.
- 교차 배치와 좌우 왕복 정렬을 사용하지 않는다.

## 3. Typography Scale

| 레벨 | 데스크톱 | 용도 |
|---|---:|---|
| Display | 96–112px | `I DESIGN WORLDS` |
| H1 | 64px | ABOUT / 주요 업무 / 프로젝트 연혁 / PORTFOLIO / CONTACT |
| H2 | 32px | 프로젝트명 / 업무명 |
| Body | 18px | 설명 본문 |
| Label | 12px | 섹션 번호, 직군, 장르 |
| Caption | 11px | 연도, 좌표, 카드 번호 |

- 한 화면에서 직군 라벨은 한 번만 노출한다.
- 프로필 사진에는 이름만 표시하고 직군을 반복하지 않는다.
- 영문 대제목은 축약형 글꼴, 한글 본문은 일반 산세리프를 사용한다.

## 4. Spacing

- 기본 단위: `8px`
- 섹션 패딩: `96px`
- 섹션 제목과 본문: `64px`
- 타임라인 아이템 최소 높이: `144px`
- 카드 간격: `24px`
- 인터랙션 이동 거리: `4–24px`

## 5. Components

### Hero Featured Work

- 카드 회전 금지.
- 우측 그리드 안에 정자세로 배치한다.
- 호버 시 수직 이동과 이미지 확대만 사용한다.
- 대각선 화살표를 사용하지 않는다.

### Scroll Indicator

- 세로 트랙과 아래 방향 이동 애니메이션을 사용한다.
- 가로 진행 바는 사용하지 않는다.

### Profile

- 큰 숫자 오버레이 금지.
- 상단에는 `PORTRAIT / KR 2026`, 하단에는 이름만 표기한다.
- 회전형 3D 틸트 대신 미세 확대와 테두리 강조를 사용한다.

### What I Do

- 번호 / 업무명 / 설명의 고정 3열 구조.
- 호버 시 브러시드 메탈 배경이 왼쪽에서 확장된다.
- 텍스트는 10px / 16px / 24px의 서로 다른 거리로 이동한다.

### Timeline

- 단일 선, 항목당 단일 점.
- 라벨은 장르 또는 프로젝트 유형만 사용한다.
- `TEAM PROJECT`, `4-PERSON TEAM` 등의 제작 형태 라벨은 제거한다.

### Portfolio

- 데스크톱 4열, 중간 화면 3열, 태블릿 2열, 모바일 1열.
- 첫 화면에서 3–4개 프로젝트가 동시에 보여야 한다.
- 카드 번호는 우측 상단 작은 캡션으로만 사용한다.
- 기본 이미지는 저채도, 호버 시 색과 명도를 일부 복원한다.

### Contact

- `CONTACT`를 다른 섹션과 같은 H1 크기로 표시한다.
- `LET'S MAKE SOMETHING.`은 보조 카피로 한 단계 낮춘다.

## 6. Decoration

- 1px hairline divider
- 카드 코너 브래킷
- 우측 여백의 저대비 방사형 메탈 원
- 전역 4% 그레인
- 대각선 레이아웃과 이유 없는 회전은 금지

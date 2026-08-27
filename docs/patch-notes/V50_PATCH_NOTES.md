# v50 패치 노트

## 프로젝트 상세 → 원래 카드 복귀 트랜지션 복원

v49에서 fullscreen 도착 마스크를 너무 일찍 정리하면서 복귀 morph가 체감상 사라지는 문제가 있었습니다.

v50에서는 복귀 순서를 다음으로 고정했습니다.

1. 상세 페이지에서 기존처럼 Hero까지 부드럽게 복귀합니다.
2. 메인/아카이브가 로드되는 동안 fullscreen 프로젝트 이미지를 계속 유지합니다.
3. 뒤쪽에서 원래 진입 surface와 스크롤/WORKS rail 위치를 먼저 복원합니다.
4. 실제 target card가 렌더된 것을 확인한 후 별도 fullscreen clone에 이미지를 인계합니다.
5. clone이 480ms 동안 정확한 원래 카드 위치/크기/radius로 축소됩니다.
6. 마지막 70ms에 실제 카드 이미지로 인계합니다.

`FEATURED / WORKS / ALL PROJECTS` 출처 구분은 그대로 유지합니다.

실제 target을 찾지 못하는 경우에만 fail-safe가 cover를 해제합니다. 정상 애니메이션 중에는 fail-safe가 개입하지 않습니다.

## Reverse transition hotfix (same v50)

기존 v50의 `::before → clone → card` 3단계 인계가 중간 실패 시 조용히 해제되면서 실제 morph가 출력되지 않는 문제가 있어, 복귀 엔진을 같은 v50 안에서 교체했습니다.

- 도착 직후 실제 `<img>` overlay 하나가 fullscreen continuity를 즉시 소유합니다.
- target surface 렌더와 scroll/rail 복원은 overlay 뒤에서 수행합니다.
- 같은 overlay를 CSS transition으로 500ms 동안 원래 카드 rect까지 직접 축소합니다.
- target card에 도착한 뒤에만 실제 카드 이미지로 인계합니다.
- `::before`는 JS 실행 전 flash 방지용으로만 남고 morph 엔진에는 사용하지 않습니다.
- target 탐색 실패 같은 실제 오류일 때만 fade fail-safe가 동작합니다.

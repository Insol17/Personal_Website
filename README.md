# KWAK TAEWOONG — Personal Website v31

메인: `index.html`

## v31 핵심

- SELECTED WORKS 카드 직접 드래그 UX 수정: 카드 자체를 잡아서 이동 가능, 클릭과 드래그 충돌 제거
- 메인 카드 클릭으로 상세 진입 정상화
- 카드 이미지 → 풀스크린 Hero 연속 확대 트랜지션 복구
- 브라우저 Back 시 BFCache에 남던 트랜지션 overlay 자동 정리
- Admin 프로젝트 선택 버그 수정
- Admin에서 새 프로젝트 추가 가능
- 새 프로젝트는 Selected Works + All Projects + 상세 페이지에 자동 등록
- Admin 사용자 콘텐츠를 `user-content/`로 분리하여 이후 코드 패치와 충돌 방지
- v30 legacy `content/` 자동 마이그레이션
- Admin Export / Import 콘텐츠 백업 추가

자세한 Admin 사용법은 `ADMIN_GUIDE.md`를 확인하세요.

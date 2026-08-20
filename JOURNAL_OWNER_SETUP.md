# Journal Owner Mode

`journal/admin.html`은 정적 사이트에서도 GitHub 저장소를 CMS처럼 사용합니다.

1. GitHub Fine-grained Personal Access Token 생성
2. 이 포트폴리오 저장소만 선택
3. Repository permissions → Contents: Read and write
4. 배포된 사이트의 `/journal/admin.html`에서 owner/repository/branch/token 입력
5. 글을 작성·수정·삭제한 뒤 COMMIT TO GITHUB

토큰은 소스에 포함되지 않으며 현재 브라우저 탭의 `sessionStorage`에만 저장됩니다. GitHub/Netlify 자동 배포가 연결돼 있다면 커밋 후 사이트가 다시 배포됩니다.

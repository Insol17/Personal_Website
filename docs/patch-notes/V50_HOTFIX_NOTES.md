# v50 Hotfix — Journal restore / browser Back recovery / detail entrance grouping

## JOURNAL

- v50 패키징 과정에서 삭제된 `assets/data/journal.json`과 `assets/data/journal-media/`를 마지막 정상 Journal sync 커밋 기준으로 복구했습니다.
- 기존 CI/CD 구조는 변경하지 않습니다. `.github/workflows/update-journal.yml`은 계속 매시 `:17`에 Naver RSS를 확인하고, 실제 데이터가 달라졌을 때만 Journal JSON/이미지를 커밋합니다.
- `scripts/automation/sync_naver_journal.py` 및 `refresh_keepalive.py`의 v47 경로 변경도 그대로 유지합니다.
- 향후 패치 ZIP을 만들 때 `assets/data/journal.json` 및 `assets/data/journal-media/`를 임의로 제외하면 배포 직후 Journal이 비게 되므로, 이 두 경로를 배포 데이터로 보존해야 합니다.

## 브라우저 뒤로가기 / BFCache

- v49/v50의 프로젝트 BACK 버튼 복귀 엔진과 별도로 `scripts/navigation-lifecycle.js`를 추가했습니다.
- 이 파일은 브라우저 자체 뒤로가기/앞으로가기에서 BFCache가 복원될 때 남아 있는 전환 surface만 정리/복구합니다.
- 프로젝트 상세 진입 후 브라우저 뒤로가기를 누르면 캐시에 남아 있던 fullscreen `.transition-v45-clone`을 원래 카드 위치로 축소한 뒤 제거합니다.
- ABOUT / JOURNAL 등 일반 내부 페이지 전환 뒤 브라우저 뒤로가기를 눌렀을 때 캐시에 남아 있던 `.global-transition-layer`도 해제합니다.
- 프로젝트 전환 엔진(v45), 상세 BACK 복귀 엔진(v50), 일반 전환 엔진(global-transition)의 역할은 그대로 유지하고 BFCache lifecycle만 별도 책임으로 분리했습니다.

## 프로젝트 상세 진입

- v48의 `heading → nav/BACK → external actions` 식 분리된 등장 타이밍을 제거했습니다.
- 대표 이미지/배경 handoff가 먼저 완료된 뒤, `detail-ready`까지 기다립니다.
- `detail-ready`는 프로젝트 데이터 적용 및 동적 GitHub / Download / Website 액션 생성 이후에 발생하므로, 제목·상단바·BACK·외부 액션이 서로 늦게 튀어나오지 않습니다.
- 이후 모든 상세 Hero UI를 `detail-v48-content-ready` 한 신호로 동시에 opacity/translate in 합니다.
- 직접 상세 URL로 진입하는 기존 동작은 변경하지 않습니다.

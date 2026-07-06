---
quick_id: 260706-ljq
status: complete
date: 2026-07-06
commit: 2166a5ea
deploy: https://ff4af128.cbc7119.pages.dev
---

# Summary — 승강기 공단 검사이력 동기화 개선 prod 이식

staging(cbc7119-data `2b9dfab`) 검증본을 prod 에 이식·배포 완료.

## 수행 내용

1. **핸드백 비판 검토** (이식 전): 스펙 이탈 1건(fails_synced_at 성공 마커) 정당성 확인 — 원 스펙(260706-e0o)의 "history 존재=조회됨" 판정은 상세조회 실패 건이 60일 후 영구 재조회 불가가 되는 실제 구멍. 구현 4항목 검증(마커 보존/성공시 기록/실패시 캐시 유지/판정 기준) + 베이스 byte-identity + 목킹 유출 없음 확인.
2. **파일 4개 복사**: inspect-history.ts / _koelsa-common.ts / src/utils/inspectHistory.ts / migrations/0095 — 전부 staging 원본과 diff byte-identical, 마커 grep(7/8/3/2), tsc 0, build 88.
3. **D1 0095 코드 배포 전 적용**: 277행 전건 백필, NULL 마커 0. 백필 sanity — 상세 0행 최근 비합격 4건(전부 조건후합격) 공단 API 직접 프로브 totalCount 0 = 원래 상세 없는 건 확인 (백필 리스크 해소).
4. **커밋 + 배포**: `2166a5ea` → cbc7119 production 배포 ff4af128. 스모크: 앱 200 / API 401 JSON / 새 ElevatorPage 청크에 7일 게이트 로직 포함 확인.
5. **문서**: production-sync.md entry + 기준 2166a5ea + 안정 환원, STATE.md, 메모리 갱신.

## 관측 포인트

- 2026-07-25 부터 **화물용 엘리베이터 EV-09/EV-10** (공단번호 2126799/2126800, 하역장 라인) 이 자연 active 전환 (첫 실전 검사창, valid_end 2026-09-23 — 화물용 2년 주기). ※ 초기 문서의 "에스컬레이터" 표기는 오류였음 (elevators 테이블 실측 정정).
- UAT: 승강기 페이지 진입 시 토스트 안 뜸 + 검사이력 정상 표시 + PWA 재설치 권장 (청크 해시 변경).

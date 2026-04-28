---
phase: quick-260428-id1
plan: 01
subsystem: data-recovery
tags: [d1, production, check_records, hydrant, emergency-outlet, april-inspection]
requires: []
provides:
  - "check_records.CP-B1-6-BC@2026-04 row 1건 (id=qT0nSRjdSH1s1oGhN5trU)"
  - "4월 (소화전+비상콘센트) strict 완료 카운트 154/154 회복"
affects:
  - "src/pages/InspectionPage.tsx 카드 카운트 표기 (153→154 회복, 코드 변경 없음)"
  - "src/utils/inspectionProgress.ts.computeCardCompletion (입력 데이터 회복으로 자동 정정)"
tech-stack:
  added: []
  patterns:
    - "wrangler d1 execute --remote 직접 INSERT (사용자 명시 승인 후)"
    - "짝꿍 SH 의 (session_id, staff_id, result, checked_at) 그대로 복제"
key-files:
  created:
    - ".planning/quick/260428-id1-recover-cp-b1-6-bc-april/260428-id1-SUMMARY.md"
  modified:
    - ".planning/quick/260428-id1-recover-cp-b1-6-bc-april/RESULT.md"
decisions:
  - "isCpCompleted 룰을 정확히 반영하려면 SQL 에 (result IN ('normal','caution') OR (result='bad' AND status='resolved')) 분기가 필수. plan 원본 baseline SQL 은 bad+resolved 분기를 빠뜨려 CP-2F-4-SH 까지 누락처럼 보였음 — 본 작업에서 보정된 SQL 로 식별, 진짜 누락은 CP-B1-6-BC 단독."
  - "사용자 명시 승인 ('비상콘센트도 소화전이랑 같은 시점에 점검한 걸로 해줘') 에 따라 BC row 의 (session_id, staff_id, result, checked_at) 4개 필드를 SH 와 완전 동일하게 박음. checked_at 도 datetime('now') 가 아닌 SH 의 리터럴 값 사용."
  - "INSERT only — 기존 SH row 변경/삭제 0건. CLAUDE.md 데이터 무결성 원칙 (점검 기록 삭제 불가) 준수."
metrics:
  duration: "~30 minutes (Task 1 SELECT → 사용자 승인 대기 → Task 3 INSERT → Task 4 검증)"
  tasks: 4
  files_changed: 0
  db_rows_inserted: 1
  db_rows_modified: 0
  completed: 2026-04-28
---

# Phase quick-260428-id1 Plan 01: CP-B1-6-BC 4월 점검 기록 회복 Summary

**One-liner:** B1F-6 비상콘센트(`CP-B1-6-BC`) 의 4월 점검 누락 1건을 production D1 직접 INSERT로 회복하여 (소화전+비상콘센트) 카드 카운트를 153/154 → 154/154 로 정상화한 데이터 회복 작업.

## 배경

`.planning/debug/hydrant-count-mismatch.md` 디버그 세션에서 4월 (소화전+비상콘센트) strict 완료 카운트가 153/154 로 표기되는 원인을 조사한 결과:

- **진짜 누락은 1건뿐** — `CP-B1-6-BC` (B1, 비상콘센트, 재단 시설팀 안).
- 같은 위치의 짝꿍 소화전 `CP-B1-6-SH` 는 2026-04-27 14:44:43 에 박보융(2023071752)이 정상 점검 완료.
- 사용자 인지: "현장에서 소화전·비상콘센트 짝꿍은 항상 같이 점검함" — BC 도 점검했지만 FloorPlanPage paired BC 저장 누락 버그(root_cause #1)로 DB 에 row 가 안 생겼음.
- 사용자 명시 승인: "비상콘센트도 소화전이랑 **같은 시점에 점검한 걸로 해줘**" → SH 의 4개 필드를 그대로 복제한 BC row 1건 INSERT.

## 실행 흐름

| Task | 종류 | 결과 |
|---|---|---|
| 1 | auto (read-only SELECT) | SH 짝꿍 정확값 추출 (`session_id=B3cQQD0JNBgcozbWQminL`, `staff_id=2023071752`, `result=normal`, `checked_at=2026-04-27 14:44:43`). BC 4월 cnt=0 멱등성 확인. baseline 153/154 기록. |
| 2 | checkpoint:human-verify | 사용자 RESULT.md 검토 후 "응 진행해" 명시 승인. |
| 3 | auto (INSERT + verify) | `qT0nSRjdSH1s1oGhN5trU` 21자 nanoid 생성, INSERT 성공 (D1 `changes=1`), 단건 검증 SELECT 1행 확인. |
| 4 | auto (verify) | 그룹 strict 완료 154/154 ✅, SH/BC 페어 4개 필드 완전 동일 ✅. |

## 핵심 SQL (실행한 INSERT 그대로)

```sql
INSERT INTO check_records
  (id, session_id, checkpoint_id, staff_id, result, memo, photo_key,
   guide_light_type, floor_plan_marker_id, checked_at, created_at)
VALUES
  ('qT0nSRjdSH1s1oGhN5trU',
   'B3cQQD0JNBgcozbWQminL',
   'CP-B1-6-BC',
   '2023071752',
   'normal',
   NULL, NULL, NULL, NULL,
   '2026-04-27 14:44:43',
   '2026-04-27 14:44:43');
```

D1 응답: `{ success: true, changes: 1, last_row_id: 2816, rows_written: 6 }` — INSERT 1건 + FK 인덱스 업데이트 5건.

## 검증 결과 (Task 4)

| 항목 | Baseline | After | 결과 |
|---|---|---|---|
| 4월 (소화전+비상콘센트) strict 완료 (`normal | caution | bad+resolved`) | 153 | **154** | ✅ |
| 전체 활성 CP 수 | 154 | 154 | — |
| 카드 표기 | 153/154 | **154/154** | ✅ 회복 |
| SH/BC 페어 (4개 필드) | SH 1행만 | SH+BC 2행, 동일 | ✅ |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Baseline/검증 SQL 보정 — `bad+resolved` 분기 누락**

- **Found during:** Task 1 (baseline 카운트 단계)
- **Issue:** plan 원본 SQL (`cr.result IN ('normal','caution')` 만 카운트) 은 isCpCompleted 룰 (`src/utils/inspectionProgress.ts`) 의 `(result='bad' AND status='resolved')` 분기를 빠뜨림. 그 결과 `CP-2F-4-SH` (2026-04-15 14:58:38, 박ʝ현 2021061451 이 bad→resolved 처리한 정상 완료 건) 까지 누락처럼 집계되어 152/154 가 보였을 것임 (실제 의도: 153/154).
- **Fix:** Task 1 과 Task 4 의 SQL 을 `(cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))` 로 보정. 추가로 `COUNT(DISTINCT cp.id)` 로 변경하여 같은 CP 의 multiple resolved 트랜잭션을 1건으로 dedupe.
- **Files modified:** SQL 만 보정 (코드 변경 0). 보정 메모는 RESULT.md 에 기록.
- **Commit:** N/A (코드 변경 없음, RESULT.md 변경은 orchestrator 가 일괄 commit).

### 추가 발견

- **누락 CP 식별 보너스 SELECT (out-of-scope)** 로 진짜 누락이 `CP-B1-6-BC` 단독임을 확정. 디버그 세션 가설을 정량적으로 재확인.

### Auth gates

없음.

## 데이터 무결성

- INSERT 1건 (`CP-B1-6-BC@2026-04`).
- UPDATE / DELETE 0건. 기존 SH row (`hC9a4BH4OPSK9E3Z5t17N`) 는 read-only 로만 접근.
- 코드 변경 0건. 빌드/배포 0회.
- CLAUDE.md "점검 기록 삭제 불가" 원칙 준수.
- CLAUDE.md "디자인/데이터 변경 전 상의" 규칙 준수 (Task 2 checkpoint 에서 사용자 명시 승인 후 Task 3 진행).

## 사용자 후속 액션

1. **PWA 앱 reload** 또는 강제 재설치 (SW 캐시 무효화 — `feedback_pwa_cache_invalidation.md` 메모리 적용).
2. 일반점검 페이지에서 **소화전·비상콘센트 카드가 154/154** 인지 시각 확인.
3. 현장(B1F-6 비상콘센트) 점검 당사자(박보융)의 기억과 실제로 부합하는지 교차 확인 권장.

## 후속 작업 (out-of-scope — 별도 quick 으로 분리)

- **fix B:** FloorPlanPage paired BC 저장 로직 추가 (debug 세션 root_cause #1) — 짝꿍 BC 자동 INSERT 되어야 본 케이스 재발 방지.
- **fix C:** InspectionPage picker 가시성 개선 (debug 세션 root_cause #2).

본 quick 의 책임은 **데이터 회복 단일** — fix B/C 는 별도 GSD 사이클로 진행.

## Self-Check

- [x] RESULT.md 존재: `.planning/quick/260428-id1-recover-cp-b1-6-bc-april/RESULT.md`
- [x] RESULT.md 내 `CP-B1-6-BC` 포함 (Task 1, 3, 4 모두)
- [x] RESULT.md 내 새 record id `qT0nSRjdSH1s1oGhN5trU` 명시
- [x] RESULT.md 내 "데이터 회복 완료." 마지막 줄
- [x] D1 검증 — `CP-B1-6-BC@2026-04` 1행 존재
- [x] D1 검증 — 4월 (소화전+비상콘센트) strict 완료 = 154/154
- [x] D1 검증 — SH/BC 페어 4개 필드 완전 동일
- [x] 코드 변경 0건 (git status 기준 — 변경 파일은 .planning 내 RESULT.md, SUMMARY.md 만)

## Self-Check: PASSED

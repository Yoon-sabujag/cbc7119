---
phase: quick-260429-qd8
plan: 01
subsystem: cron-worker
tags:
  - cron
  - access-blocked
  - inspection
  - cbc-cron-worker
  - cloudflare-workers
requirements:
  completed:
    - QD8-01
    - QD8-02
    - QD8-03
    - QD8-04
    - QD8-05
    - QD8-06
dependency_graph:
  requires:
    - cbc-cron-worker (sibling repo)
    - D1 binding 'DB' → cha-bio-db
    - schedule_items.inspection_category (migration 0029)
    - check_points.description LIKE '%접근불가%' (migrations 0022/0025/0075)
    - check_records.status DEFAULT 'open' (migration 0012)
  provides:
    - cron schedule "0 6 * * *" (UTC 06:00 = KST 15:00)
    - handleAccessBlockedAutoComplete(env)
    - 카테고리별 접근불가 cp 서버측 자동 정상처리 (그 달 마지막 점검일 한정)
  affects:
    - inspection_sessions (신규 행 1건 / 카테고리)
    - check_records (신규 행 N건 / 카테고리, result='normal', memo='접근불가 개소 자동 정상처리')
tech-stack:
  added: []
  patterns:
    - Workers crypto.randomUUID() (Workers Runtime 표준 — nanoid 미사용)
    - D1 batch atomic per category
    - WITH CTE (cat_last) + JOIN schedule_items 로 마지막 점검일 식별
    - LIKE '%접근불가%' 패턴 매칭 (완강기 '접근불가' / 소화기·유도등 '... [접근불가]' 양쪽 포괄)
key-files:
  modified:
    - ../cbc-cron-worker/wrangler.toml
    - ../cbc-cron-worker/src/index.ts
  created: []
decisions:
  - cron 발동 시각: UTC 06:00 (KST 15:00) — 그 달 마지막 점검일 당일 오후, 점검자가 충분히 입력할 시간 보장 후 자동 보완
  - 발동 트리거 게이트: 카테고리별 마지막 점검일 = 오늘. CTE 결과가 비면 즉시 return (idempotent, 일과 무관 발동도 NOOP)
  - assignee_id source: schedule_items.assignee_id (그 카테고리 마지막 점검일 행). 카테고리/날짜 동일 행 다수일 때 MIN(assignee_id) 로 결정성 확보
  - assignee_id NULL 시: console.warn 후 카테고리 skip (점검자가 미배정인 카테고리는 자동 처리 보류)
  - cp 필터: description LIKE '%접근불가%' AND is_active = 1 AND id NOT IN (이번 달 check_records.checkpoint_id)
  - 동일성: memo 문자열 '접근불가 개소 자동 정상처리' — InspectionPage.tsx 자동완료 로직과 정확히 일치 (서버/클라 통계 일관)
  - atomicity: env.DB.batch([sessionStmt, ...recordStmts]) — 카테고리 단위 atomic. 카테고리 간은 try/catch 로 isolate (한 카테고리 실패가 다음을 막지 않음)
  - 새 의존성 X: nanoid 미설치 → crypto.randomUUID() 만 사용. Workers compatibility_date 2024-09-23 OK
  - 기존 두 cron('45 23 * * *', '*/5 * * * *')과 핸들러는 한 글자도 변경 없음
metrics:
  duration_minutes: 10
  completed_date: 2026-04-29
  tasks_completed: 3
  files_modified: 2
  files_created: 0
---

# Quick Task 260429-qd8: 접근불가 개소 자동완료 cron 추가 (cbc-cron-worker) Summary

**One-liner:** cbc-cron-worker 에 매일 KST 15:00 발동 cron 을 추가하여, 그 달의 마지막 점검일에 한해 카테고리별 접근불가 개소(`description LIKE '%접근불가%'`) 중 미점검 cp 들을 D1 batch 로 자동 `result='normal'` 처리한다.

## Objective

InspectionPage 의 클라이언트측 자동완료 로직(line 4057/4085)은 사용자가 그 달 마지막 점검일에 해당 카테고리에 진입해야만 동작한다. 만약 진입 자체가 누락되면 통계에 미점검으로 남는 사각지대가 생긴다. 이 cron 은 서버시각 기준으로 일관된 자동 정상처리를 보장하여 사각지대를 메운다.

## Implementation

### 1) wrangler.toml — cron schedule 1개 추가

```toml
[triggers]
crons = ["45 23 * * *", "*/5 * * * *", "0 6 * * *"]
```

기존 두 cron 은 그대로 보존. d1_databases binding 변경 없음.

### 2) src/index.ts — 신규 함수 + scheduled 분기

`handleEventNotifications` 직후, `// ── Main export ──` 직전에 `handleAccessBlockedAutoComplete(env)` 추가:

- KST 오늘 = `now + 9h` 의 `getUTCFullYear/Month/Date` 직접 조합
- `WITH cat_last AS (...)` 로 카테고리별 이번 달 마지막 점검일 추출 → `cl.last_date = today` 인 카테고리만 추림
- 카테고리 없으면 즉시 return (NOOP)
- 카테고리별 loop:
  - `assignee_id` NULL → `console.warn` + skip
  - cp 후보: 카테고리 + `LIKE '%접근불가%'` + `is_active=1` + 이번 달 `check_records` 미존재
  - cp 0건 → log "already complete" + skip
  - 그 외: `inspection_session` 1건 + `check_records` N건을 `env.DB.batch` 로 atomic insert
  - try/catch 로 카테고리 단위 isolate (실패해도 다음 카테고리 진행)

scheduled handler switch 에 `case '0 6 * * *'` 분기 추가:

```typescript
case '0 6 * * *':
  ctx.waitUntil(handleAccessBlockedAutoComplete(env))
  break
```

기존 두 case 는 한 글자도 변경 없음.

## Schema 사용 컬럼

| Table | Columns used |
|-------|--------------|
| schedule_items | inspection_category, date, assignee_id |
| check_points | id, category, description, is_active |
| check_records | checkpoint_id, checked_at (filter) / id, session_id, checkpoint_id, staff_id, result, memo, checked_at, created_at, status (insert) |
| inspection_sessions | id, date, floor, zone, staff_id, created_at (insert; completed_at 은 NULL) |

`inspection_sessions.completed_at` 은 nullable 이므로 INSERT 에서 생략 가능 (DB DEFAULT 없음 → NULL 저장).
`check_records.status` 는 DEFAULT 'open' 이지만 명시 INSERT (task brief 일관).

## Verification

- `npx tsc --noEmit` (cbc-cron-worker): 0 errors ✓
- `grep -c "handleAccessBlockedAutoComplete" src/index.ts`: 2 (정의 1 + 호출 1) ✓
- `grep -c "case '0 6 * * *'" src/index.ts`: 1 ✓
- `grep -c "접근불가 개소 자동 정상처리" src/index.ts`: 1 ✓
- `grep -c "handleDailyNotifications" src/index.ts`: 2 (보존) ✓
- `grep -c "handleEventNotifications" src/index.ts`: 2 (보존) ✓
- `grep -c "env.DB.batch" src/index.ts`: 1 ✓
- `grep -c "crypto.randomUUID" src/index.ts`: 2 (sessionId + record ids) ✓
- `grep -c "nanoid" src/index.ts`: 0 ✓ (의존성 추가 없음)
- `grep "0 6 * * *" wrangler.toml`: 매치, 기존 두 cron 보존 ✓
- `git status --porcelain` (project root): cbc-cron-worker/src/index.ts + cbc-cron-worker/wrangler.toml 만 modified, 그 외 무수정 ✓
- `cha-bio-safety/src/pages/InspectionPage.tsx`: 무수정 (Q7 별도 task) ✓

## Out of Scope (별도 task)

- **Q7**: 클라이언트(InspectionPage) 폴백 로직 — 본 plan 에서 손대지 않음
- **Q8**: 도면 페이지 접근불가 팝업 — 본 plan 무관
- 기존 InspectionPage line 4057~4083 자동완료 로직 — 그대로 유지

## Operational Notes

- 배포: 사용자 별도 지시까지 보류. 배포 시 `cd cbc-cron-worker && npx wrangler deploy --branch production` 주의 (preview 로 배포되지 않도록).
- 한글 커밋 메시지 사용 시 `wrangler pages deploy` 는 별도 `--commit-message` ASCII 가 필요하지만, **이 cron worker 는 `wrangler deploy`** 사용이므로 한글 커밋 메시지 그대로 OK.
- 발동 후 D1 검증:
  - `SELECT * FROM inspection_sessions WHERE created_at >= datetime('now', '-1 day') AND floor IS NULL AND zone IS NULL`
  - `SELECT COUNT(*) FROM check_records WHERE memo = '접근불가 개소 자동 정상처리' AND substr(created_at, 1, 10) = ?`
- `wrangler tail` 로 로그 확인:
  - `[access-blocked-auto] {category}: {N} cps auto-completed (assignee=..., session=...)`
  - `[access-blocked-auto] {category}: 0 cps (already complete)`
  - `[access-blocked-auto] {category}: assignee_id NULL — skip`

## Deviations from Plan

None — plan 그대로 실행. 배포 보류 제약 준수.

## Self-Check: PASSED

- FOUND: ../cbc-cron-worker/wrangler.toml (modified, "0 6 * * *" 포함)
- FOUND: ../cbc-cron-worker/src/index.ts (modified, handleAccessBlockedAutoComplete 정의 + switch 분기)
- typecheck: 0 errors
- 메인 앱 무수정 확인됨

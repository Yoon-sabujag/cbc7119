---
phase: quick-260609-ekw
plan: 01
subsystem: api-handlers
tags: [bugfix, data-sync, extinguisher, 3-store, production]
dependency_graph:
  requires: []
  provides: [소화기 개소명 3-store 동기 가드]
  affects:
    - cha-bio-safety/functions/api/floorplan-markers/[id].ts
    - cha-bio-safety/functions/api/check-points/[id].ts
tech_stack:
  added: []
  patterns:
    - D1 batch() for atomic multi-table UPDATE
    - 조건부 단일 run() vs batch() 분기 패턴
key_files:
  created: []
  modified:
    - cha-bio-safety/functions/api/floorplan-markers/[id].ts
    - cha-bio-safety/functions/api/check-points/[id].ts
decisions:
  - "소화기(CP-FE-%) 개소에만 동기 — 소화전/완강기/DIV 는 extinguishers 행 없어 제외 (사고 260528 참고)"
  - "마커 UPDATE 항상 batch 첫 statement — 동기 실패 시 마커 라벨은 저장 (악화 방지)"
  - "label 빈값/undefined 이면 동기 안 함 (기존 동작 유지)"
metrics:
  duration: "~8분"
  completed: "2026-06-09T01:38:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase quick-260609-ekw Plan 01: 소화기 개소명 3-store 동기 가드 Summary

**One-liner:** floorplan-markers PUT + check-points PUT 핸들러에 CP-FE-% 한정 D1 3-store 동기 가드 추가 (staging a9791e9 verbatim prod 반영)

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | floorplan-markers PUT 핸들러에 label 동기 가드 추가 | `8fac741` | `functions/api/floorplan-markers/[id].ts` |
| 2 | check-points PUT 핸들러에 location 동기 가드(else if) 추가 | `a09a44b` | `functions/api/check-points/[id].ts` |

## What Was Done

### Task 1 — floorplan-markers PUT

기존 단일 `await env.DB.prepare(...).run()` 블록을 staging 검증 코드(a9791e9)로 교체:

- `newLabel` 추출 (빈값/undefined 시 null)
- `cpId` 조회 — body 에 없으면 마커 행 SELECT
- `stmts` 배열: 마커 UPDATE 항상 첫 번째
- `cpId.startsWith('CP-FE-')` 일 때만 `check_points.location` + `extinguishers.location` push
- `stmts.length === 1` → 단일 `run()`, 아니면 `batch(stmts)`

### Task 2 — check-points PUT

기존 `if (willDeactivate && isExtCp) { ... }` 블록 끝에 `else if` 추가:

```ts
} else if (isExtCp && body.location !== undefined) {
  // 개소명(location) 동기 가드 — 사고 260608-b6f 와 동일 종류 divergence.
  await env.DB
    .prepare("UPDATE extinguishers SET location=?, updated_at=datetime('now','+9 hours') WHERE check_point_id=?")
    .bind(body.location, id)
    .run()
}
```

## Deviations from Plan

None — plan executed exactly as written. staging a9791e9 코드 verbatim 적용 완료.

## Verification Results

### Task 1 grep markers (floorplan-markers/[id].ts)
- `CP-FE-` count: 5 (>= 1, PASS — 주석 + 코드 + onRequestDelete 참조 포함)
- `UPDATE extinguishers SET location` count: 1 (PASS)
- `env.DB.batch(stmts)` count: 1 (PASS)
- `git ls-files`: tracked (PASS)

### Task 2 grep markers (check-points/[id].ts)
- `else if (isExtCp && body.location !== undefined)` count: 1 (PASS)
- `UPDATE extinguishers SET location` count: 1 (PASS)
- `DELETE FROM extinguishers WHERE check_point_id` count: 1 — 기존 비활성화 cascade 보존 (PASS)
- `git ls-files`: tracked (PASS)

### TypeScript
- 두 파일 모두 `npx tsc --noEmit` 0 errors (PASS)

## 메인 Claude 담당 미완료 항목 (핸드오프 §5)

이하 항목은 executor 범위 밖 — 메인 Claude 가 후속 수행:

| 항목 | 내용 | 상태 |
|------|------|------|
| §5-2 빌드 | `npm run build` (tsc 0 errors + vite, precache 83 entries) | ✅ 완료 (메인 Claude) |
| §5-3 배포 | `wrangler pages deploy dist --project-name=cbc7119 --branch=production` → Functions bundle 업로드, Worker compile 성공 | ✅ 완료 — https://63fffa24.cbc7119.pages.dev (메인 Claude) |
| §5-4 prod 데이터 점검 | `cha-bio-db` 진단 결과 staging 과 동일 stray 2건 발견 — CP-FE-0104 label `58510`, CP-FE-0105 label `71958` (둘 다 cp/ext location 은 정상). **사용자 승인 후** `label=location` UPDATE (changes=2). 재검증 stray 0건, 3-store 정렬 확인 | ✅ 완료 (메인 Claude, 사용자 승인) |
| §5-5 UI E2E 검증 | 마커 모달 소화기 개소명 변경 → 일반점검 목록 + 소화기 관리 목록 둘 다 반영. 점검개소 편집기 소화기 개소명 변경 → 소화기 관리 목록 반영. 비-소화기 마커 무회귀 | ✅ 완료 — 사용자 앱 확인: 개소명 정상 반영 (2026-06-09) |

## Self-Check: PASSED

- `/Users/jongyupyoon/Documents/20260328/cha-bio-safety/functions/api/floorplan-markers/[id].ts` — FOUND (modified)
- `/Users/jongyupyoon/Documents/20260328/cha-bio-safety/functions/api/check-points/[id].ts` — FOUND (modified)
- Commit `8fac741` — FOUND (Task 1)
- Commit `a09a44b` — FOUND (Task 2)

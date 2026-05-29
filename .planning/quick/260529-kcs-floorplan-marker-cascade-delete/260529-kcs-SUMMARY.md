---
phase: 260529-kcs-floorplan-marker-cascade-delete
plan: 01
subsystem: floorplan-markers DELETE handler + prod D1 orphan cp cleanup
tags: [bug-fix, cascade-delete, d1, production-sync]
requires: []
provides:
  - "DELETE /api/floorplan-markers/:id 의 else 분기에 cp_id 링크 마커용 일반화된 cascade 가드 (check_records=0 AND 다른 marker=0) 추가, 통과 시 marker+cp atomic DELETE, 미통과 시 marker 만 DELETE — 어제 31117bf POST 자동 cp INSERT 의 비대칭 해소"
affects:
  - "도면점검 페이지 마커 삭제 시 자동 생성됐던 cp 가 일반 점검(CheckpointsPage)에서도 정리됨"
  - "사용자가 새로 추가한 '테스트' 라벨 소화전/완강기 마커는 도면에서 삭제하면 일반 점검 목록에서도 함께 사라짐"
tech-stack:
  added: []
  patterns:
    - "D1 batch atomic transaction (Cloudflare 공식 트랜잭션 의미론) — marker+cp 한 batch DELETE"
    - "Promise.all 로 cp의 check_records 카운트 + 동일 cp 참조 다른 marker 카운트 병렬 SELECT 후 분기"
    - "기존 분기(isExtCascade, cp_id 없는 단일 DELETE)는 그대로 보존 — A/B/C 3 분기 구조"
key-files:
  created: []
  modified:
    - "cha-bio-safety/functions/api/floorplan-markers/[id].ts"
decisions:
  - "Task 1 (prod D1 SQL cleanup) 은 executor worktree(branch≠production)에서 require-production-branch.sh hook 에 의해 차단되어 orchestrator 에 위임 — 실행할 SQL 명령 + 가드 절차는 본 SUMMARY 의 'Task 1 Deferred — Ready-to-run SQL' 섹션에 ready-to-run 으로 박제"
  - "else 분기 교체 시 cp_id 존재 여부를 `else if (cpId)` 로 명시 분기하여 cp_id NULL 마커도 안전하게 단일 DELETE 되도록 (C) 분기 보존"
  - "console.log 로 cascade vs marker-only 동작을 Cloudflare Logs 에서 사후 추적 가능하게 함 (회귀 시 빠른 진단)"
metrics:
  duration_seconds: 146
  completed_at: "2026-05-29T05:49:26Z"
---

# Phase 260529-kcs Plan 01: Floorplan Marker Cascade Delete Summary

## One-liner

DELETE /api/floorplan-markers/:id 의 else 분기에 cp_id 링크 마커용 cascade 가드(check_records=0 AND 다른 marker=0)를 추가하여, 어제 31117bf 의 POST 자동 cp INSERT 비대칭으로 발생한 일반점검 orphan cp 노출 버그를 해결한다. Task 1 prod D1 SQL cleanup 은 hook 에 의해 orchestrator 위임.

## Tasks Executed

| Task | Status                  | Commit    | Notes                                                                                                                                            |
| ---- | ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | **Deferred to orchestrator** | (no git)  | wrangler d1 execute --remote 명령이 require-production-branch.sh hook 에 의해 차단됨 (worktree branch ≠ production). Ready-to-run SQL 박제. |
| 2    | Completed               | `9492ad8` | else 분기 cp cascade 가드 추가. 6 grep + tsc PASS. 1 file 38+/3-.                                                                                |
| 3    | Checkpoint pending      | n/a       | `checkpoint:human-verify` — orchestrator deploy 후 사용자 시나리오 A/B/C/D 검증.                                                                  |

---

## Task 1 — Deferred to Orchestrator (Ready-to-run SQL)

### Why deferred

`require-production-branch.sh` hook (PreToolUse on Bash) blocks all `wrangler` invocations unless the current git branch is `production`. Executor worktree branch is `worktree-agent-aa95757465256794e` — hook returned exit 2:

```
BLOCKED by .claude/hooks/require-production-branch.sh
Deploy/wrangler 명령은 'production' 브랜치에서만 허용됩니다.
현재 브랜치: worktree-agent-aa95757465256794e
```

This is the same boundary documented in memory rule `feedback_subagent_production_deploy_forbidden`. The reasonable call: hand Task 1 SQL execution back to the orchestrator (which already operates on `production` for Task 3 deploy anyway), with the exact commands ready to copy/paste.

### Step 0 — Baseline (run BEFORE any DELETE)

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*) AS total_records FROM check_records;"
```

Record the number — must be identical to Step D post-check.

### Step A — Identify candidate cp (사무동 8-1F + 연구동 8F 의 '테스트' 라벨 소화전/완강기)

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT id, location_no, location_name, category, zone, floor, is_active FROM check_points WHERE category IN ('소화전','완강기') AND is_active = 1 AND ((floor = '8-1F') OR (floor = '8F' AND zone IN ('lab','research'))) AND (location_name LIKE '%테스트%' OR location_no LIKE '%테스트%') ORDER BY floor, category, location_no;"
```

If 0 rows → run the **fallback marker-side search**:

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT m.id AS marker_id, m.label, m.marker_type, m.plan_type, m.check_point_id, cp.location_name, cp.category, cp.floor, cp.zone, cp.is_active FROM floor_plan_markers m LEFT JOIN check_points cp ON cp.id = m.check_point_id WHERE m.marker_type IN ('indoor_hydrant','descending_lifeline') AND m.label LIKE '%테스트%' ORDER BY m.created_at DESC;"
```

→ Pin all candidate cp_id values into placeholder list for Step B.

### Step B — Safety verification (check_records=0 + 다른 marker=0)

Replace `:CP_LIST` with the cp_id values from Step A (comma-separated 'CP-...').

```bash
# B1: check_records count per cp (must be 0 for each)
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT check_point_id, COUNT(*) AS records_count FROM check_records WHERE check_point_id IN (:CP_LIST) GROUP BY check_point_id;"

# B2: marker count per cp (info — these markers will be deleted alongside)
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT check_point_id, COUNT(*) AS marker_count FROM floor_plan_markers WHERE check_point_id IN (:CP_LIST) GROUP BY check_point_id;"
```

**GATE**: If any cp has `records_count > 0`, DO NOT delete that cp. Exclude it from Step C and report to user.

### Step C — DELETE (per cp, with NOT IN check_records guard)

For each safety-verified cp_id, run separately (NOT IN guard ensures atomicity even though wrangler d1 batch is not atomic — memory `feedback_wrangler_d1_batch_not_atomic`):

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "DELETE FROM floor_plan_markers WHERE check_point_id = 'CP-XXX'; DELETE FROM check_points WHERE id = 'CP-XXX' AND id NOT IN (SELECT check_point_id FROM check_records WHERE check_point_id IS NOT NULL);"
```

(Replace `CP-XXX` per cp.)

### Step D — Post-check cleanup verified

```bash
# D1: re-run Step A SELECT — must return 0 rows
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT id, location_no, location_name, category, zone, floor, is_active FROM check_points WHERE category IN ('소화전','완강기') AND is_active = 1 AND ((floor = '8-1F') OR (floor = '8F' AND zone IN ('lab','research'))) AND (location_name LIKE '%테스트%' OR location_no LIKE '%테스트%') ORDER BY floor, category, location_no;"

# D2: check_records total — must equal baseline (Step 0)
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*) AS total_records FROM check_records;"
```

### Decision branch (orchestrator)

- **Step A returns expected 사무동 8-1F + 연구동 8F '테스트' cp 4건 (or close), B 모두 records=0** → Step C 진행, D 검증
- **Step A returns 0 rows** → run fallback marker-side search, present to user before any DELETE
- **Step A returns rows with check_records>0** → SKIP those, only delete records=0 ones; report skipped to user
- **Step A returns 5+ rows or unexpected layout** → present SELECT result to user before any DELETE

---

## Task 2 — Code change (Commit `9492ad8`)

### Verify gate (6 grep + tsc)

| # | Check                                                             | Result | Details                                                  |
| - | ----------------------------------------------------------------- | ------ | -------------------------------------------------------- |
| 1 | `grep 'canCascadeCp'` → 1+ hits                                  | PASS   | 2 hits (line 94 declare, line 96 if-guard)               |
| 2 | `grep 'DELETE FROM check_points WHERE id='` → 1 hit              | PASS   | 1 hit (line 100, else-if 분기 내부 batch)                |
| 3 | `grep 'DELETE FROM check_records'` → 0 hits (절대 금지 룰)       | PASS   | 0 hits                                                   |
| 4 | `grep 'isExtCascade'` → 1+ hits (소화기 분기 보존)               | PASS   | 3 hits (line 66 declare, 68 if-guard, 86 주석 참조)      |
| 5 | `grep 'UPDATE check_points SET is_active=0'` → 1 hit (소화기 보존) | PASS   | 1 hit (line 76, isExtCascade 분기 내부)                  |
| 6 | `grep 'UPDATE extinguishers SET check_point_id=NULL'` → 1 hit (소화기 보존) | PASS   | 1 hit (line 75, isExtCascade 분기 내부)                  |
| - | `npx tsc --noEmit`                                                | PASS   | exit 0                                                   |

### Diff stats

```
cha-bio-safety/functions/api/floorplan-markers/[id].ts | 41 ++++++++++++++++++++--
1 file changed, 38 insertions(+), 3 deletions(-)
```

### Diff — Before/After (주석 블록 + else 분기)

**Before** (lines 42-48 + 74-76):

```ts
// DELETE /api/floorplan-markers/:id — 마커 삭제 (로그인한 전체 스태프)
//
// 소화기(plan_type='extinguisher' + check_point_id LIKE 'CP-FE-%')인 경우
// floor_plan_markers / extinguishers / check_points.is_active 3 테이블을 atomic 으로 정리한다.
// 그 외 마커(guidelamp/sprinkler/detector 등)는 기존과 동일하게 단일 DELETE 만 수행한다.
//
// 절대 금지: check_records 는 어떤 분기에서도 삭제하지 않는다 (점검 기록 보존 원칙).
```

```ts
  } else {
    await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
  }
```

**After** (주석 블록 + else-if cp_id 분기 + else 단일 DELETE):

```ts
// DELETE /api/floorplan-markers/:id — 마커 삭제 (로그인한 전체 스태프)
//
// 분기 동작:
//   (A) 소화기(plan_type='extinguisher' + check_point_id LIKE 'CP-FE-%'): floor_plan_markers /
//       extinguishers / check_points.is_active 3 테이블 atomic 정리.
//   (B) 그 외 마커 with cp_id (예: indoor_hydrant/descending_lifeline 의 자동 cp 링크):
//       check_records=0 AND 다른 marker=0 일 때만 marker+cp atomic DELETE,
//       아니면 marker 만 DELETE (cp 보존).
//   (C) cp_id 없는 마커: 단일 DELETE.
//
// 절대 금지: check_records 는 어떤 분기에서도 삭제하지 않는다 (점검 기록 보존 원칙).
```

```ts
  } else if (cpId) {
    // 일반 cp cascade 가드:
    // POST /api/floorplan-markers 가 indoor_hydrant/descending_lifeline 등에 대해 cp 를 자동 INSERT 하므로,
    // DELETE 도 대칭으로 정리해야 orphan 발생 안 함. 단 두 안전 가드 동시 충족 시에만 cp 도 DELETE:
    //   (1) 해당 cp 에 check_records 가 0건 (점검 기록 보존 절대 원칙)
    //   (2) 동일 cp_id 를 참조하는 다른 marker 가 0건 (다른 도면/페어링 보호)
    // 한 가드라도 위반하면 기존처럼 marker 만 DELETE, cp 는 보존.
    //
    // 소화기 분기 (isExtCascade) 는 위에서 처리되어 이 분기에 도달하지 않음.
    // 절대 금지: check_records 는 어떤 분기에서도 DELETE 하지 않는다.
    const [recRow, otherMarkerRow] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) AS c FROM check_records WHERE check_point_id=?').bind(cpId).first<{ c: number }>(),
      env.DB.prepare('SELECT COUNT(*) AS c FROM floor_plan_markers WHERE check_point_id=? AND id<>?').bind(cpId, id).first<{ c: number }>(),
    ])
    const recordCount = recRow?.c ?? 0
    const otherMarkerCount = otherMarkerRow?.c ?? 0
    const canCascadeCp = recordCount === 0 && otherMarkerCount === 0

    if (canCascadeCp) {
      // D1 batch 는 atomic — 둘 다 성공 또는 둘 다 롤백.
      await env.DB.batch([
        env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id),
        env.DB.prepare('DELETE FROM check_points WHERE id=?').bind(cpId),
      ])
      console.log(`[floorplan-markers DELETE] cascade marker+cp: marker=${id}, cp=${cpId}`)
    } else {
      // cp 보존 — 기존 동작.
      await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
      console.log(`[floorplan-markers DELETE] marker-only (cp preserved): marker=${id}, cp=${cpId}, records=${recordCount}, other_markers=${otherMarkerCount}`)
    }
  } else {
    // cp 가 애초에 연결 안 된 마커 — 단일 DELETE.
    await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
  }
```

### Commit

```
9492ad8 fix(260529-kcs): floorplan marker DELETE 시 자동 cp 도 cascade 정리

- else 분기에 cp_id 링크 마커용 안전 가드 추가
- check_records=0 AND 다른 marker=0 일 때만 marker+cp atomic DELETE
- 한 가드 위반 시 기존처럼 marker 만 DELETE (cp 보존)
- 소화기 분기 (isExtCascade) 동작 무변경 — 자산 unassign + is_active=0 유지
- check_records DELETE 절대 금지 룰 유지 (점검 기록 보존)
- 어제 31117bf POST 자동 cp INSERT 의 비대칭 해소
```

---

## Task 3 — Checkpoint: Human Verify (orchestrator deploy 후)

**Type:** `checkpoint:human-verify` (blocking gate)
**State:** STOPPED — orchestrator 가 production 머지 + build + wrangler pages deploy 후 사용자 검증 수집

### What's built (배포 대상)

- Task 2 commit `9492ad8` — DELETE handler 의 else 분기에 cp cascade 가드 (orchestrator 가 production 으로 머지 + 직원 도메인 cbc7119 배포)
- Task 1 prod D1 cleanup — orchestrator 가 본 SUMMARY 의 "Task 1 Deferred — Ready-to-run SQL" 섹션을 실행 (Step 0 → A → B → C → D 순서)

### Verification scenarios (사용자가 PWA / cbc7119.pages.dev 에서 확인)

**A. 일반 점검 페이지에 '테스트' cp 더 이상 노출 안 됨** (Task 1 cleanup 검증)
1. 일반 점검 (CheckpointsPage) 진입
2. 사무동 8-1F → 소화전/완강기 카테고리: '테스트' 라벨 cp 사라짐 확인
3. 연구동 8F → 소화전/완강기 카테고리: '테스트' 라벨 cp 사라짐 확인

**B. 새 마커 추가 → 삭제 시 자동 cp cascade** (Task 2 회귀 검증)
1. 도면점검 → 소화전 카테고리 → 임의 층 도면 진입
2. 마커 새로 추가 (라벨 '테스트', cp_id 미지정 — 자동 cp 생성)
3. 일반 점검 진입해 자동 cp 보이는지 확인 (cp 자동 생성 정상)
4. 도면으로 돌아가 그 마커 삭제
5. 일반 점검 새로고침 → 자동 생성됐던 '테스트' cp 가 함께 사라졌는지 확인

**C. 점검 기록 있는 cp 는 보호** (회귀 방지 — Rule 2 가드 검증)
1. 도면점검에서 기존 점검 기록 1건+ 있는 소화전/완강기 마커를 시험 삭제
2. 마커는 사라지지만 cp 는 일반 점검에 계속 노출 (cp 보존)
3. 대안: Cloudflare Logs 에서 `[floorplan-markers DELETE] marker-only (cp preserved)` 로그 확인

**D. 소화기 4종 마커 삭제 회귀 없음** (isExtCascade 분기 보존)
1. 도면점검 → 소화기 카테고리 → 임의 소화기 마커 삭제
2. extinguishers 자산 행은 살아있고 (ExtinguishersListPage), check_point_id 가 NULL 로 unassign 됐는지 확인 (기존 동작 무변경)

### Resume signal

검증 통과 시 "approved" 또는 "배포 OK".
이슈 발견 시 시나리오 번호 + 증상 (스크린샷/콘솔/SQL 결과) 보고.
검증 후 `.planning/production-sync.md` 표에 entry 추가 + 상태 '안정' 환원.

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Task 1 wrangler 명령 hook 차단**
- **Found during:** Task 1 Step 0 (baseline check_records count)
- **Issue:** `require-production-branch.sh` hook 가 executor worktree(branch ≠ production)에서 모든 wrangler 명령 차단 (exit 2)
- **Fix:** Task 1 SQL 실행을 orchestrator 에 위임 — 모든 SQL (Step 0/A/B/C/D + 안전 가드 + 의사결정 분기) 을 ready-to-run 으로 본 SUMMARY 에 박제. Orchestrator 가 production 머지 후 동일 환경에서 실행.
- **Files modified:** 없음 (SUMMARY 박제만)
- **Commit:** n/a

This is an environment constraint, not a code defect. The memory rule `feedback_subagent_production_deploy_forbidden` generalizes here — sub-agents stay out of production-level wrangler invocations.

### Authentication Gates

None.

---

## Known Stubs

None.

---

## Self-Check: PASSED

**Files exist:**
- FOUND: cha-bio-safety/functions/api/floorplan-markers/[id].ts (modified)

**Commits exist:**
- FOUND: 9492ad8 (verified via `git log --oneline`)

**Verify gate:**
- 6 grep checks: all PASS
- tsc --noEmit: exit 0

**Deferred:**
- Task 1 SQL execution → orchestrator (ready-to-run commands provided above)
- Task 3 human verify → orchestrator + user (post-deploy scenarios A/B/C/D)

---
phase: 260529-lzh-b3-7-bc-recovery-fetch-race-guard
plan: 01
subsystem: floorplan-inspection
tags: [recovery, race-guard, indoor_hydrant, paired-bc, floorplan]
key-files:
  modified:
    - cha-bio-safety/src/pages/FloorPlanPage.tsx
  d1-prod-mutations:
    - INSERT INTO check_records id=8RbM9X2kYatSgHEtZX4ay (CP-B3-7-BC 회복)
decisions:
  - check_records 컬럼 9개만 명시 INSERT (id, session_id, checkpoint_id, staff_id, result, status, checked_at, created_at) — SH 짝꿍 mirror + floor_plan_marker_id NULL (도면점검 BC record 들과 동일 패턴)
  - pairedBcLoading 가드 조건은 (planType === 'extinguisher' && marker_type === 'indoor_hydrant' && cp_id 있음 && loading 중) 4중 AND — 다른 plan_type / 비-SH 마커 회귀 0
  - return cleanup 에도 setPairedBcLoading(false) — 모달 빠르게 닫고 다시 열 때 stale loading 차단
metrics:
  duration: ~6분
  completed: 2026-05-29
  tasks_completed: 2 (Task 3 = orchestrator checkpoint)
---

# 260529-lzh: CP-B3-7-BC 회복 + FloorPlanPage paired BC fetch race 가드 Summary

5월 사이클 비상콘센트 점검 중 CP-B3-7-BC 만 isolated 누락된 사고를 회복하고, 같은 race 가 재발하지 않게 도면점검 모달에 paired BC fetch loading 가드 + 저장 disabled 가드를 추가했다.

## Tasks 완료

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | prod D1 CP-B3-7-BC 회복 INSERT | (orchestrator 위임 — SQL 박제) | check_records (prod D1) |
| 2 | FloorPlanPage paired BC fetch race 가드 | `202e3e0` | cha-bio-safety/src/pages/FloorPlanPage.tsx |
| 3 | 배포 후 사용자 시나리오 검증 | checkpoint | orchestrator deploy + 사용자 |

## Task 1 — prod D1 회복 INSERT (orchestrator 위임)

**상태**: executor (worktree 브랜치 `worktree-agent-a2c6866ba93ab3de9`) 에서 `npx wrangler d1 execute` 시도 → `.claude/hooks/require-production-branch.sh` 가드에 차단됨 (정상 동작 — 직전 quick 260529-kcs 와 동일 패턴). orchestrator 가 production 브랜치에서 아래 SQL 을 그대로 실행.

**Executor 가 생성한 새 nanoid 21자리 record id**: `8RbM9X2kYatSgHEtZX4ay`

**Step A — 중복 가드 (이미 회복되어 있는지 확인)**

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT id, checkpoint_id, checked_at, result, status FROM check_records WHERE checkpoint_id = 'CP-B3-7-BC' AND checked_at >= '2026-05-29 13:00:00' AND checked_at < '2026-05-29 14:00:00';"
```

- 결과 0 rows → Step B INSERT 진행
- 결과 1+ rows → 이미 회복, INSERT skip + 사용자에게 보고

**Step B — INSERT (SH 짝꿍 `Z4FJ3Wa6V1Nv98VoJi5we` 의 timestamp/staff/session/result/status mirror)**

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "INSERT INTO check_records (id, session_id, checkpoint_id, staff_id, result, status, checked_at, created_at) VALUES ('8RbM9X2kYatSgHEtZX4ay', 'nyD6soJiiNYaOE4cZeMHw', 'CP-B3-7-BC', '2022051052', 'normal', 'open', '2026-05-29 13:49:09', datetime('now','+9 hours'));"
```

**Step C1 — INSERT 확인**

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT id, checkpoint_id, session_id, staff_id, result, status, checked_at, created_at FROM check_records WHERE checkpoint_id = 'CP-B3-7-BC' AND checked_at = '2026-05-29 13:49:09';"
```

기대: 1 row, id=`8RbM9X2kYatSgHEtZX4ay`, staff_id=`2022051052`, result=`normal`, status=`open`, session_id=`nyD6soJiiNYaOE4cZeMHw`.

**Step C2 — 5월 비상콘센트 미완료 cp 0건 확인**

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT cp.id, cp.floor, cp.zone, cp.location FROM check_points cp WHERE cp.category = '비상콘센트' AND cp.is_active = 1 AND cp.id NOT IN (SELECT DISTINCT checkpoint_id FROM check_records WHERE checked_at >= '2026-05-01' AND checked_at < '2026-06-01' AND checkpoint_id IS NOT NULL AND (result='normal' OR result='caution' OR (result='bad' AND status='resolved'))) ORDER BY cp.floor;"
```

기대: 0 rows.

**Step C3 — check_records 총 건수 3759 → 3760 (정확히 1건 증가)**

```bash
cd cha-bio-safety && npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*) AS total_records FROM check_records;"
```

기대: `total_records = 3760`.

**Executor 실행 차단 흔적**:
```
PreToolUse:Bash hook error: [.claude/hooks/require-production-branch.sh]: BLOCKED
Deploy/wrangler 명령은 'production' 브랜치에서만 허용됩니다.
현재 브랜치: worktree-agent-a2c6866ba93ab3de9
```

**orchestrator 가 production 브랜치에서 위 4개 SQL 실행 후 출력 결과를 이 섹션 아래에 추가 박제**:

```
(orchestrator 가 Step A / B / C1 / C2 / C3 결과 JSON + rows_read/rows_written 을 여기에 박제)
```

## Task 2 — FloorPlanPage paired BC fetch race 가드

### Verify grep + tsc (실행 후 출력)

**baseline (edit 전)**:
```
pairedBcLoading: 0 (line count)
setPairedBcLoading(true): 0
setPairedBcLoading(false): 0
inspectionApi.getCheckpoints: 4
cp.category === '비상콘센트': 1
```

**post-edit**:
```
pairedBcLoading (line count, literal): 3   ← 'pairedBcLoading' 만 정확히 매치되는 라인 수
pairedBcLoading (case-insensitive, intent of gate): 10   ← setPairedBcLoading 포함 모든 참조 라인
setPairedBcLoading(true): 1   ← fetch 시작
setPairedBcLoading(false): 6   ← early return / 매핑없음 / 성공 / catch / cleanup return / 모달닫힘
inspectionApi.getCheckpoints: 4   ← 변경 전과 동일 (paired BC fetch 1건 + 다른 3건 안 건드림)
cp.category === '비상콘센트': 1   ← 변경 전과 동일 (paired BC 매칭 룰 보존)
```

**Note on `pairedBcLoading` line count**: `grep -c 'pairedBcLoading'` 은 case-sensitive 라서 `setPairedBcLoading` (`P` 대문자) 가 들어 있는 라인은 매칭 안 됨. 따라서 plan 의 "6+ hits" 기대치는 case-insensitive (`grep -ic`) 기준 10 으로 충족 (state 1 + fetch effect 7 + 모달닫힘 effect 1 + button disabled 1 + button label 1 = 11 라인 중 일부는 같은 라인에 multi-occurrence).

**tsc 결과**:
```
$ cd cha-bio-safety && ./node_modules/.bin/tsc --noEmit
(no output)
tsc exit: 0
```
TSC PASS.

### 5 Edit before/after diff

**Edit 1 (state 선언, L366 → L367)**:
```diff
   const [pairedBC, setPairedBC] = useState<any | null>(null)
+  const [pairedBcLoading, setPairedBcLoading] = useState(false)
```

**Edit 2 (paired BC fetch useEffect, L413-427 → L414-431)**:
```diff
   useEffect(() => {
     let cancelled = false
     if (!inspectModal || !selected || planType !== 'extinguisher' || selected.marker_type !== 'indoor_hydrant' || !selected.check_point_id) {
       setPairedBC(null)
+      setPairedBcLoading(false)
       return
     }
+    setPairedBcLoading(true)
     inspectionApi.getCheckpoints(selected.floor).then((all: any[]) => {
       if (cancelled) return
       const sh = all.find(cp => cp.id === selected.check_point_id)
-      if (!sh || !sh.locationNo) { setPairedBC(null); return }
+      if (!sh || !sh.locationNo) { setPairedBC(null); setPairedBcLoading(false); return }
       const bc = all.find(cp => cp.category === '비상콘센트' && cp.locationNo === sh.locationNo)
       setPairedBC(bc ?? null)
-    }).catch(() => { if (!cancelled) setPairedBC(null) })
-    return () => { cancelled = true }
+      setPairedBcLoading(false)
+    }).catch(() => { if (!cancelled) { setPairedBC(null); setPairedBcLoading(false) } })
+    return () => { cancelled = true; setPairedBcLoading(false) }
   }, [inspectModal, selected?.id, planType, selected?.marker_type, selected?.check_point_id, selected?.floor])
```

**Edit 3 (모달 닫힘 effect, L429-437 → L433-442)**:
```diff
   useEffect(() => {
     if (!inspectModal) {
       setPairedBC(null)
+      setPairedBcLoading(false)
       setInspectBcResult('normal')
       setInspectBcMemo('')
       inspectBcPhoto.reset()
     }
   }, [inspectModal])
```

**Edit 4 (저장 button disabled, L1924 → L1929)**:
```diff
-                disabled={inspectSubmitting || inspectPhoto.uploading || inspectBcPhoto.uploading || isAccessBlocked}
+                disabled={inspectSubmitting || inspectPhoto.uploading || inspectBcPhoto.uploading || isAccessBlocked || (planType === 'extinguisher' && selected?.marker_type === 'indoor_hydrant' && !!selected?.check_point_id && pairedBcLoading)}
```

**Edit 5 (button label, L1989 → L1994)**:
```diff
-                {(inspectPhoto.uploading || inspectBcPhoto.uploading) ? '사진 업로드 중...' : inspectSubmitting ? '저장 중...' : isAccessBlocked ? '접근 불가 개소' : '저장'}
+                {(inspectPhoto.uploading || inspectBcPhoto.uploading) ? '사진 업로드 중...' : inspectSubmitting ? '저장 중...' : isAccessBlocked ? '접근 불가 개소' : (planType === 'extinguisher' && selected?.marker_type === 'indoor_hydrant' && !!selected?.check_point_id && pairedBcLoading) ? '비상콘센트 확인 중...' : '저장'}
```

### git commit

```
commit 202e3e030861651e38dc20b935373dbae158e171
Author: 윤종엽
Date:   Fri May 29 16:01:25 2026 +0900

    fix(260529-lzh): FloorPlanPage paired BC fetch race 가드 + 저장 disabled
    
    - pairedBcLoading state 추가 (fetch 진행 중일 때 true)
    - paired BC fetch useEffect 에 setLoading 시작/완료/실패/cleanup 모두 반영
    - 저장 button disabled 조건에 indoor_hydrant SH 마커 + cp_id 있을 때 + loading 중일 때 추가
    - button label 분기에 '비상콘센트 확인 중...' 표시 추가
    - 5월 사이클 CP-B3-7-BC 누락 isolated 사고 재발 방지
    - paired BC 매칭 룰 / 동시 저장 흐름 변경 없음 (가드만 추가)

 1 file changed, 10 insertions(+), 5 deletions(-)
```

### tsc 환경 메모

worktree 에 node_modules 가 없어서 `npx tsc` 가 글로벌 typescript 가 아님을 알려주고 실패. main repo (`/Users/jykevin/Documents/20260328/cha-bio-safety/node_modules`) 의 binary 를 worktree 에 임시 심볼릭 링크 → tsc 통과 → 심볼릭 링크 즉시 제거 (git status 변경 없음). 코드 변경 외 잔존 artifact 0.

## Task 3 — checkpoint:human-verify (orchestrator → 사용자)

executor (worktree) → orchestrator (main Claude) 인계.

**orchestrator 가 production 브랜치에서 처리할 단계**:
1. **D1 INSERT** — Task 1 의 Step A → B → C1 → C2 → C3 SQL 5건 실행 + 결과를 이 SUMMARY 의 Task 1 박제 자리에 추가.
2. **build + deploy** — `cd cha-bio-safety && npm run build && npx wrangler pages deploy dist --project-name=cbc7119 --branch=production --commit-message="..."`
3. **production-sync.md** — 새 entry 추가, 상태 `안정` 환원.

**사용자 시나리오 (배포 후)**:

- **A. CP-B3-7-BC 가 일반 점검에 완료로 노출** — CheckpointsPage → B3 → 비상콘센트 → D-7 기둥 cp 가 정상 표시.
- **B. 도면점검 race 가드 동작** — 도면점검 → 소화전 → indoor_hydrant SH 마커 클릭 → 모달 진입 즉시 저장 누르면 disabled + "비상콘센트 확인 중..." 잠시 표시 → fetch 완료 후 BC 섹션 노출 + 저장 활성.
- **C. 다른 plan_type 회귀 없음** — 유도등 / 스프링클러 / 감지기 도면점검 흐름은 가드 미적용 (조건 4중 AND), 저장 즉시 가능.

## Deviations from Plan

None. plan 그대로 실행.

- Task 1 wrangler hook 차단은 사전 예상된 차단 (constraints 에 명시) — deviation 아님.
- tsc 가 worktree 에 node_modules 없어서 단일 차단 → 동일 트리의 main repo node_modules 심볼릭 링크 (코드 변경 0, 실행 후 즉시 제거) 로 우회.

## Auth Gates

None.

## Known Stubs

None.

## Self-Check: PASSED

- [x] `cha-bio-safety/src/pages/FloorPlanPage.tsx` modified (5 영역, 10+/5-)
- [x] commit `202e3e0` 존재 (`git log --oneline | grep 202e3e0` PASS)
- [x] tsc PASS (exit 0)
- [x] grep gates: pairedBcLoading case-insensitive 10 (≥6 intent), setPairedBcLoading(true)=1, setPairedBcLoading(false)=6 (≥3), inspectionApi.getCheckpoints=4 (baseline), cp.category==='비상콘센트'=1 (baseline)
- [x] paired BC 매칭 룰 (`cp.category === '비상콘센트'`) 변경 0
- [x] Task 1 SQL + 사용한 새 nanoid `8RbM9X2kYatSgHEtZX4ay` 박제
- [x] orchestrator 인계 인스트럭션 박제

## Threat Flags

None.

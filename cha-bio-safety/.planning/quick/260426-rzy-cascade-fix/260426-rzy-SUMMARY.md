---
status: complete
phase: quick-260426-rzy
plan: 01
subsystem: extinguisher-cascade
tags:
  - quick
  - bugfix
  - cascade-delete
  - data-integrity
  - extinguisher
dependency_graph:
  requires:
    - functions/api/floorplan-markers/[id].ts (existing onRequestDelete)
    - functions/api/check-points/[id].ts (existing onRequestPut)
    - 라이브 D1 cha-bio-db (b12b88e7-fc41-4186-8f35-ee9cbaf994c7)
  provides:
    - "도면 마커 DELETE → floor_plan_markers + extinguishers + check_points.is_active 3 테이블 atomic cascade"
    - "CheckpointsPage 비활성화 → CP-FE-* 한정 floor_plan_markers + extinguishers cascade"
    - "라이브 D1 고아 행 CP-FE-0362 정리"
  affects:
    - InspectionPage (소화기 점검개소 목록)
    - FloorPlanPage (도면 마커 표시)
    - CheckpointsPage (점검개소 관리)
tech_stack:
  added: []
  patterns:
    - "env.DB.batch([...]) atomic 트랜잭션 — 한 statement 실패 시 전체 롤백"
    - "id.startsWith('CP-FE-') prefix 가드 — 다른 카테고리 회귀 차단"
    - "extinguishers 는 is_active 컬럼 없음 → 하드 DELETE, check_points 는 is_active=0 보존"
key_files:
  created:
    - .planning/quick/260426-rzy-cascade-fix/260426-rzy-SUMMARY.md
  modified:
    - functions/api/floorplan-markers/[id].ts
    - functions/api/check-points/[id].ts
decisions:
  - "extinguishers 는 하드 DELETE — 스키마에 is_active 컬럼이 없어 소프트 삭제 불가능"
  - "check_points 는 hard DELETE 대신 is_active=0 — check_records FK 무결성 + 점검 기록 보존 원칙"
  - "check_records 는 양쪽 cascade 흐름 모두에서 절대 손대지 않음 (점검 기록 삭제 불가 원칙)"
  - "CP-FE-* prefix 가드로 향후 다른 카테고리(예: CP-AS-/CP-SP-) 회귀 차단"
metrics:
  duration_minutes: 4
  completed_date: 2026-04-26
---

# Quick 260426-rzy: 소화기 마커/점검개소 삭제 cascade 수정 Summary

소화기 삭제 두 진입점(도면 마커 DELETE / CheckpointsPage 비활성화)이 단일 테이블만 건드려서 발생한 고아 행 / 정합성 이상을 백엔드 cascade 로 수정. 라이브 D1 고아 행(CP-FE-0362) 정리 및 production 배포까지 완료.

## What Changed

### 1. `functions/api/floorplan-markers/[id].ts` — onRequestDelete cascade

**Before:** `DELETE FROM floor_plan_markers` 단일 쿼리만 실행 → extinguishers 행 + check_points.is_active=1 잔존 → 도면에서 마커는 사라지지만 InspectionPage 에서 여전히 표시됨.

**After (6단계 로직):**
1. `SELECT plan_type, check_point_id` 선조회
2. 마커 없으면 404
3. `plan_type === 'extinguisher' && cpId.startsWith('CP-FE-')` 가드
4. 가드 충족 시 `env.DB.batch([...])` atomic 실행:
   - `DELETE FROM floor_plan_markers WHERE id=?`
   - `DELETE FROM extinguishers WHERE check_point_id=?`
   - `UPDATE check_points SET is_active=0 WHERE id=?`
5. 가드 미충족 시 (guidelamp/sprinkler/detector 등) 기존대로 단일 DELETE
6. `{ success: true }` 반환

### 2. `functions/api/check-points/[id].ts` — onRequestPut cascade

**Before:** UPDATE check_points 만 실행 → CheckpointsPage 에서 isActive=0 토글해도 floor_plan_markers / extinguishers 잔존.

**After:** body 파싱 직후 가드 변수 선언:
```ts
const willDeactivate = body.isActive === 0
const isExtCp = id.startsWith('CP-FE-')
```
기존 UPDATE 직후, updated SELECT 직전에 cascade 블록 삽입:
```ts
if (willDeactivate && isExtCp) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM extinguishers WHERE check_point_id=?').bind(id),
    env.DB.prepare('DELETE FROM floor_plan_markers WHERE check_point_id=?').bind(id),
  ])
}
```
다른 카테고리 / 부분 수정 흐름은 영향 없음 (COALESCE UPDATE 그대로 유지).

## Live D1 Cleanup — CP-FE-0362

| 단계 | 쿼리 | extinguishers | check_points.is_active | check_records |
|------|------|---------------|------------------------|---------------|
| Pre  | SELECT | **1** (id=362, mgmt_no=지-B4-34) | **0** | **2** |
| DELETE | `DELETE FROM extinguishers WHERE check_point_id='CP-FE-0362'` | changes=1 | — | — |
| Post | SELECT | **0** | **0** (preserved) | **2** (preserved) |

**점검 기록 보존 원칙 준수:** `check_records.checkpoint_id='CP-FE-0362'` 2건은 cleanup 전후 동일 (cnt=2 → cnt=2).

추가 회귀 카운트:
```sql
SELECT COUNT(*) FROM extinguishers e
LEFT JOIN check_points cp ON e.check_point_id=cp.id
WHERE cp.is_active=0;
-- 결과: 0  (정리 후 비활성 점검개소에 매달린 고아 ext 0건)
```

## Deployment

| 항목 | 값 |
|------|-----|
| Build | `npm run build` PASS (TypeScript 에러 0) |
| Deploy | `npx wrangler pages deploy dist --branch production --commit-message "ext cascade delete fix"` |
| Production URL | https://8229d132.cbc7119.pages.dev |
| Branch | production |
| Commit | `d3d4d7a` (cascade 핸들러 수정) |

## Regression Guards (정적 grep)

| 가드 | 결과 | 의미 |
|------|------|------|
| `grep -c "env.DB.batch" functions/api/floorplan-markers/[id].ts` | **1** | floorplan cascade 분기 존재 |
| `grep -c "willDeactivate" functions/api/check-points/[id].ts` | **2** | check-points 가드 + 사용 |
| `grep -n "plan_type === 'extinguisher'" functions/api/floorplan-markers/[id].ts` | line 62 hit | 비-소화기 회귀 차단 |
| `grep -c "DELETE FROM check_records" functions/api/floorplan-markers/[id].ts` | **0** | 점검 기록 보존 OK |
| `grep -c "DELETE FROM check_records" functions/api/check-points/[id].ts` | **0** | 점검 기록 보존 OK |
| `grep -c "extinguishers SET is_active" functions/api/{floorplan-markers,check-points}/[id].ts` | **0** | 미존재 컬럼 미사용 |

## 사용자 검증 절차 (PWA 캐시 회피)

> **중요:** 운영 메모리 "PWA 캐시가 배포 무시함" — 배포 직후 사용자는 반드시 PWA 재설치(또는 SW 강제 업데이트) 필요.

### 1. PWA 재설치
- iOS: 홈 화면에서 앱 길게 눌러 삭제 → Safari 에서 사이트 다시 방문 → "홈 화면에 추가"
- Android: 앱 길게 눌러 삭제 → Chrome 에서 사이트 다시 방문 → "앱 설치"
- PC Chrome: 주소창 우측 앱 아이콘 → 제거 → 다시 방문 → 설치

### 2. 흐름 A — 도면 마커 삭제 cascade
1. AdminPage 또는 데이터 시드로 임시 소화기 1개 추가 (예: CP-FE-9001, 임의 위치)
2. /floorplan 에서 해당 마커를 삭제
3. D1 검증:
   ```bash
   npx wrangler d1 execute cha-bio-db --remote --command \
     "SELECT
        (SELECT COUNT(*) FROM floor_plan_markers WHERE check_point_id='CP-FE-9001') as m,
        (SELECT COUNT(*) FROM extinguishers WHERE check_point_id='CP-FE-9001') as e,
        (SELECT is_active FROM check_points WHERE id='CP-FE-9001') as a;"
   ```
   기대: `m=0, e=0, a=0`
4. /inspection 진입 후 CP-FE-9001 이 더 이상 점검 대상으로 표시되지 않음 확인

### 3. 흐름 B — CheckpointsPage 비활성화 cascade
1. 또 다른 임시 소화기 1개 추가 (예: CP-FE-9002, 도면 마커도 같이 생성)
2. /checkpoints 에서 CP-FE-9002 행을 비활성화 (isActive=0)
3. D1 검증 (위와 동일 쿼리, id 만 9002 로 교체) — 기대: `m=0, e=0, a=0`
4. /floorplan 에서 해당 위치 마커가 사라졌는지 확인

### 4. 점검 기록 보존 검증 (양쪽 흐름 공통)
- 위 두 흐름의 임시 소화기는 점검 기록이 없어 사이드이펙트가 안 보임. 운영 데이터로 추가 확인:
  ```bash
  npx wrangler d1 execute cha-bio-db --remote --command \
    "SELECT COUNT(*) FROM check_records WHERE checkpoint_id='CP-FE-0362';"
  ```
  기대: 2 (cleanup 전 2건 → cleanup 후 2건 그대로 보존)

### 5. 회귀 미해당 흐름 (음성 검증)
- /floorplan 에서 비-소화기 마커(유도등/스프링클러/감지기) 삭제 → 해당 카테고리 check_points.is_active 변화 없음, extinguishers 영향 없음
- /checkpoints 에서 CP-FE-* 가 아닌 점검개소(예: CP-AS-XXXX 자탐) 비활성화 → floor_plan_markers / extinguishers 영향 없음

## Deviations from Plan

### Deviation 1: check_records 컬럼명 보정
- **Found during:** Task 2 Part B 사전 SELECT 단계
- **Issue:** 플랜은 `check_records.check_point_id` 라고 가정했으나 실제 스키마 컬럼명은 `checkpoint_id` (no underscore between 'check' and 'point' for this specific column)
- **Fix:** 사전/사후 SELECT 모두 `WHERE checkpoint_id='CP-FE-0362'` 로 보정. 핸들러 코드는 영향 없음 (양쪽 핸들러 모두 check_records 를 건드리지 않음 — 점검 기록 보존 원칙).
- **Files modified:** 없음 (쿼리만 보정)
- **Commit:** N/A (런타임 검증 쿼리)

이외 deviation 없음 — 플랜 대로 atomic 실행.

## Self-Check: PASSED

- FOUND: `/Users/jykevin/Documents/20260328/cha-bio-safety/functions/api/floorplan-markers/[id].ts` (cascade 추가됨, env.DB.batch 라인 67)
- FOUND: `/Users/jykevin/Documents/20260328/cha-bio-safety/functions/api/check-points/[id].ts` (willDeactivate / isExtCp / batch 추가됨)
- FOUND: commit `d3d4d7a` — `fix(quick-260426-rzy): 소화기 마커/점검개소 삭제 cascade 추가`
- FOUND: production deployment URL `https://8229d132.cbc7119.pages.dev`
- FOUND: 라이브 D1 post-cleanup 카운트 (ext=0, is_active=0, records=2)
- VERIFIED: `grep -c "DELETE FROM check_records"` 두 cascade 파일에서 0 — 점검 기록 보존 원칙 준수

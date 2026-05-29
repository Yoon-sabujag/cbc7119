---
phase: 260529-kcs-floorplan-marker-cascade-delete
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/functions/api/floorplan-markers/[id].ts
autonomous: false
requirements:
  - QUICK-260529-KCS-01  # DB cleanup of "테스트" orphan cp (사무동 8-1F 소화전/완강기, 연구동 8F 소화전/완강기)
  - QUICK-260529-KCS-02  # DELETE /api/floorplan-markers/:id else 분기에 cp cascade 가드 추가
user_setup: []

must_haves:
  truths:
    - "도면에서 추가한 '테스트' 라벨의 소화전/완강기 마커를 삭제하면, 연결된 check_point 도 함께 사라져 일반 점검 페이지 (CheckpointsPage) 에 더 이상 노출되지 않는다"
    - "이미 check_records 가 1건 이상 쌓인 cp 는 마커 삭제 시 절대 DELETE 되지 않는다 (기존처럼 marker 만 DELETE, cp 보존)"
    - "동일 cp_id 를 참조하는 다른 marker 가 1건 이라도 있으면 cp DELETE 하지 않는다 (orphan 만들지 않기 + 다른 도면 참조 보호)"
    - "소화기 분기 (isExtCascade: plan_type='extinguisher' + cpId LIKE 'CP-FE-%') 동작은 변경 없음 — 기존 자산 unassign + cp.is_active=0 soft delete 그대로"
    - "사무동 8-1F + 연구동 8F 의 '테스트' 명 소화전/완강기 cp 가 prod D1 에서 정리되어, CheckpointsPage 일반 점검 목록에 노출되지 않는다"
    - "직원 도메인 (cbc7119.pages.dev) 에 이 fix 가 배포되어, 다음 마커 삭제부터 자동 cp cleanup 이 적용된다"
  artifacts:
    - path: "cha-bio-safety/functions/api/floorplan-markers/[id].ts"
      provides: "marker DELETE handler with generalized cp cascade guard"
      contains: "check_records 0 + 다른 marker 0 일 때만 batch DELETE marker + cp"
  key_links:
    - from: "cha-bio-safety/functions/api/floorplan-markers/[id].ts (else branch, lines ~74-76)"
      to: "check_points / check_records / floor_plan_markers 3 테이블"
      via: "D1 batch atomic — SELECT count guard 후 marker+cp DELETE 또는 marker 만 DELETE"
      pattern: "env\\.DB\\.batch\\(\\[.*DELETE FROM floor_plan_markers.*DELETE FROM check_points.*\\]\\)"

---

<objective>
도면점검에서 추가한 소화전/완강기 마커를 삭제할 때 자동 생성된 check_point (cp) 가 같이 정리되지 않아 일반 점검 페이지에 orphan 으로 남는 버그를 수정한다.

Purpose:
어제 31117bf 에서 POST /api/floorplan-markers 에 indoor_hydrant/descending_lifeline 자동 cp INSERT 를 추가했지만, DELETE 분기는 같이 업데이트되지 않아 비대칭 발생. 그 결과 사용자가 도면에서 '테스트' 마커 만들고 지워도 CP 만 남아 CheckpointsPage (일반 점검 화면) 에 계속 노출되는 상태.

Output:
1. prod D1 의 사무동 8-1F + 연구동 8F '테스트' 라벨 소화전/완강기 cp 정리 (check_records 0 건 검증 후 DELETE)
2. DELETE /api/floorplan-markers/:id 의 else 분기에 cp cascade 가드 추가 — `marker.check_point_id` 가 있고 그 cp 의 check_records=0 이고 동일 cp 를 가리키는 다른 marker=0 일 때만 batch DELETE marker + cp. 한 쪽이라도 0 이 아니면 기존처럼 marker 만 DELETE.
3. 소화기 분기 (isExtCascade) 는 무손상 보존 — 자산 매핑 흐름 (extinguishers unassign + cp.is_active=0) 그대로.
4. SUMMARY 에 실행 SQL + affected rows + 코드 diff 박제. orchestrator (메인 Claude) 가 build + wrangler pages deploy --branch=production 수행.

absolutely_do_not:
- check_records DELETE 절대 금지 (project memory `check_records.memo 통합 필드`, 점검 기록 보존 원칙)
- isExtCascade 분기 코드 수정 금지 (자산 매핑 보호)
- check_records 가 1건 이상인 cp 는 어떤 경우에도 DELETE 금지 (cleanup SQL 도 동일)
- sub-agent (executor) 가 wrangler pages deploy 직접 실행 금지 (project memory `feedback_subagent_production_deploy_forbidden`)
- branch=preview / project=cbc7119-preview 사용 금지 — 이 작업은 production / cbc7119 직원 도메인 대상
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/production-sync.md
@CLAUDE.md

# 수정 대상 파일 — 코드는 아래 <interfaces> 에 embed 했으므로 이 시점에 다시 읽을 필요 없음
# 필요시 참조:
# - cha-bio-safety/functions/api/floorplan-markers/[id].ts (DELETE handler, lines 49-79)
# - cha-bio-safety/functions/api/floorplan-markers/index.ts (POST 자동 cp 생성 로직, lines ~117-153)

<interfaces>
<!-- DELETE 핸들러 현재 코드 (cha-bio-safety/functions/api/floorplan-markers/[id].ts lines 42-79) -->
<!-- 이 코드를 직접 인용. executor 는 이걸 기반으로 else 분기만 교체. -->

```ts
// DELETE /api/floorplan-markers/:id — 마커 삭제 (로그인한 전체 스태프)
//
// 소화기(plan_type='extinguisher' + check_point_id LIKE 'CP-FE-%')인 경우
// floor_plan_markers / extinguishers / check_points.is_active 3 테이블을 atomic 으로 정리한다.
// 그 외 마커(guidelamp/sprinkler/detector 등)는 기존과 동일하게 단일 DELETE 만 수행한다.
//
// 절대 금지: check_records 는 어떤 분기에서도 삭제하지 않는다 (점검 기록 보존 원칙).
export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id as string

  const marker = await env.DB
    .prepare('SELECT plan_type, check_point_id FROM floor_plan_markers WHERE id=?')
    .bind(id)
    .first<{ plan_type: string; check_point_id: string | null }>()

  if (!marker) {
    return Response.json({ success: false, error: '마커를 찾을 수 없습니다' }, { status: 404 })
  }

  const cpId = marker.check_point_id
  const isExtCascade = marker.plan_type === 'extinguisher' && !!cpId && cpId.startsWith('CP-FE-')

  if (isExtCascade) {
    // Phase 24: 자산은 *unassign 만* (status='active' 유지). 자산 행 자체는 보존.
    // 사용자가 명시적으로 폐기를 원하면 ExtinguishersListPage 의 「폐기」 버튼 사용.
    // 절대 금지: check_records 는 어떤 분기에서도 DELETE 하지 않는다.
    // D1 batch 는 atomic — 한 statement 실패 시 전체 롤백 (Cloudflare 공식 트랜잭션 의미론).
    await env.DB.batch([
      env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id),
      env.DB.prepare("UPDATE extinguishers SET check_point_id=NULL, updated_at=datetime('now','+9 hours') WHERE check_point_id=?").bind(cpId),
      env.DB.prepare('UPDATE check_points SET is_active=0 WHERE id=?').bind(cpId),
    ])
  } else {
    await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
  }

  return Response.json({ success: true })
}
```

<!-- POST 자동 cp 생성 로직 (참조용 — index.ts lines ~117-153) -->
```ts
const AUTO_CP_MARKER_TYPES: Record<string, { suffix: string; category: string }> = {
  indoor_hydrant:       { suffix: 'SH', category: '소화전' },
  descending_lifeline:  { suffix: 'WK', category: '완강기' },
}
// POST 에서 marker_type 이 위 둘 중 하나 + check_point_id 미제공 + label 있음
// → CP-{floor}-{N}-{suffix} 형태 cp 자동 INSERT 후 marker.check_point_id 링크
```

<!-- 메모리 룰 -->
- check_records 는 DELETE 금지 (project memory: `check_records.memo unified`, `점검 기록 삭제 불가 원칙`)
- D1 batch 는 atomic (Cloudflare 공식 트랜잭션 의미론)
- 빌드 CWD = cha-bio-safety/ (memory: `feedback_wrangler_functions_bundle_cwd`)
- wrangler.toml 경로 = cha-bio-safety/wrangler.toml
- D1 binding name = DB (wrangler.toml 의 [[d1_databases]] binding 명) — DB 이름은 별도 확인 필요시 `cat cha-bio-safety/wrangler.toml | grep database_name`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: prod D1 에서 '테스트' orphan cp 식별 후 SELECT 결과 박제 + check_records 0 검증 + DELETE</name>
  <files>(SQL only — 로컬 파일 변경 없음)</files>
  <action>
사용자 컨펌은 이미 받음 (요청에 "삭제 해주고" 명시). 단, 안전 절차로 SELECT 먼저 → check_records count 0 검증 → DELETE 순서로 진행. 모든 SELECT/DELETE 결과는 SUMMARY 에 박제.

**Step A — 후보 cp SELECT (사무동 8-1F + 연구동 8F, 소화전/완강기, '테스트' 라벨)**

먼저 wrangler.toml 의 D1 database_name 확인:
```bash
grep -A1 'd1_databases' cha-bio-safety/wrangler.toml | head -20
```
(예상: cha-bio-d1 또는 동등 이름. 이후 명령은 이 값을 사용.)

후보 cp SELECT — floor 코드 / zone / category / label 조건 묶기:
```bash
# 사무동 8-1F + 연구동 8F 의 '테스트' 라벨 소화전/완강기 cp 후보
cd cha-bio-safety && npx wrangler d1 execute <D1_DB_NAME> --remote --command "
SELECT id, location_no, location_name, category, zone, floor, is_active
FROM check_points
WHERE category IN ('소화전','완강기')
  AND is_active = 1
  AND (
    (floor = '8-1F') OR
    (floor = '8F' AND zone IN ('lab','research'))
  )
  AND (location_name LIKE '%테스트%' OR location_no LIKE '%테스트%')
ORDER BY floor, category, location_no;
"
```

**대안 검색** (위에서 결과 없으면 더 넓게 — 사용자가 묘사한 cp 가 사무동 8-1F + 연구동 8F 모두에 있어야 함):
```bash
# 라벨에 '테스트' 가 없으면 마커 라벨 기반으로 역추적
cd cha-bio-safety && npx wrangler d1 execute <D1_DB_NAME> --remote --command "
SELECT m.id AS marker_id, m.label, m.marker_type, m.plan_type, m.check_point_id,
       cp.location_name, cp.category, cp.floor, cp.zone, cp.is_active
FROM floor_plan_markers m
LEFT JOIN check_points cp ON cp.id = m.check_point_id
WHERE m.marker_type IN ('indoor_hydrant','descending_lifeline')
  AND m.label LIKE '%테스트%'
ORDER BY m.created_at DESC;
"
```

**Step B — 각 후보 cp 의 check_records count 검증 (0 건이어야 DELETE 가능)**

Step A 결과의 각 cp_id 에 대해:
```bash
cd cha-bio-safety && npx wrangler d1 execute <D1_DB_NAME> --remote --command "
SELECT check_point_id, COUNT(*) AS records_count
FROM check_records
WHERE check_point_id IN ('CP-...','CP-...')  -- Step A 의 id 들 채우기
GROUP BY check_point_id;
"
```

또한 같은 cp_id 를 참조하는 다른 marker 가 있는지:
```bash
cd cha-bio-safety && npx wrangler d1 execute <D1_DB_NAME> --remote --command "
SELECT check_point_id, COUNT(*) AS marker_count
FROM floor_plan_markers
WHERE check_point_id IN ('CP-...','CP-...')
GROUP BY check_point_id;
"
```

**Step C — 안전 검증 통과한 cp 만 DELETE + 그 cp 를 가리키는 marker 도 함께 DELETE**

DELETE 조건: 해당 cp 의 check_records=0 + (marker_count<=1 인 marker 만 같이 삭제, marker 가 여러개면 그건 별개 처리 필요하므로 사용자에게 보고).

각 검증 통과 cp 별로 (atomic 하게 marker + cp 한 batch 권장):
```bash
cd cha-bio-safety && npx wrangler d1 execute <D1_DB_NAME> --remote --command "
DELETE FROM floor_plan_markers WHERE check_point_id = 'CP-...';
DELETE FROM check_points WHERE id = 'CP-...' AND id NOT IN (SELECT check_point_id FROM check_records WHERE check_point_id IS NOT NULL);
"
```

(주의: wrangler d1 batch atomic 아님 — memory `feedback_wrangler_d1_batch_not_atomic`. 그러나 DELETE check_points 의 WHERE 절에 NOT IN check_records subquery 가 들어가 있어 check_records 가 있으면 자동 no-op. 안전.)

**Step D — 재SELECT 로 cleanup 확인**

Step A 의 SELECT 를 재실행 → 0 rows 여야 함. SUMMARY 에 박제.

**중요**: 만약 Step A/B 에서 사용자 묘사 (사무동 8-1F + 연구동 8F 의 '테스트' cp 4건 추정) 와 결과가 다르거나 (예: 0건, 또는 5건+), check_records 가 있는 cp 가 섞여있으면, DELETE 진행하지 말고 SUMMARY 에 그 SELECT 결과만 박제하고 사용자 컨펌 요청.

모든 wrangler d1 execute 명령 출력 (rows_read, rows_written, JSON 결과) 을 SUMMARY 에 코드블록으로 박제.
  </action>
  <verify>
    <automated>
      # Step D 재SELECT 가 0 rows 반환하는지 출력으로 확인. 또한 check_records 손실 0 검증:
      cd cha-bio-safety && npx wrangler d1 execute <D1_DB_NAME> --remote --command "SELECT COUNT(*) AS total_records FROM check_records;"
      # 작업 전/후 동일해야 함 (작업 전 count 를 Step A 시점에 미리 한 번 찍어둘 것)
    </automated>
  </verify>
  <done>
- 사무동 8-1F + 연구동 8F 의 '테스트' 라벨 소화전/완강기 cp 가 prod D1 에서 사라짐 (Step D SELECT 0 rows)
- check_records 총 건수 작업 전/후 동일 (손실 0)
- 같은 cp 를 가리키던 marker 도 동시 정리됨
- 모든 SELECT/DELETE SQL + 출력 (rows_read/rows_written/JSON) 이 SUMMARY 에 박제됨
- 만약 사용자 묘사와 결과가 불일치 → DELETE 보류 + SELECT 결과만 SUMMARY 박제 + 사용자 컨펌 요청
  </done>
</task>

<task type="auto">
  <name>Task 2: DELETE /api/floorplan-markers/:id 의 else 분기에 cp cascade 가드 추가 (atomic batch)</name>
  <files>cha-bio-safety/functions/api/floorplan-markers/[id].ts</files>
  <action>
대상: `onRequestDelete` 함수 lines 49-79. **isExtCascade 분기 (lines 64-73) 는 절대 변경 금지**. else 분기 (lines 74-76) 만 교체.

**교체 전 (else 분기, lines 74-76)**:
```ts
  } else {
    await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
  }
```

**교체 후 (else 분기, 일반화된 cp cascade 가드 추가)**:
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

상단 주석 블록 (lines 42-48) 도 갱신 — `소화기 외 마커는 단일 DELETE` 문구를 `소화기 외 마커는 cp_id 가 링크된 경우 안전 가드 통과 시 cp 도 함께 cascade, 미통과 시 단일 DELETE` 로 정정.

**교체 후 상단 주석 (lines 42-48)**:
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

**작업 흐름**:
1. Read 로 현재 파일 한 번 확인 (이미 위에 embed 했지만 Edit 도구가 원본 정확한 매칭 필요).
2. Edit 도구로 (i) 상단 주석 블록 교체 (ii) else 분기 교체 — 2 번의 Edit 호출.
3. `cd cha-bio-safety && npx tsc --noEmit` 로 타입 체크.
4. 검증 grep:
   - `grep -n 'canCascadeCp' cha-bio-safety/functions/api/floorplan-markers/\[id\].ts` → 1 hit
   - `grep -n 'DELETE FROM check_points WHERE id=' cha-bio-safety/functions/api/floorplan-markers/\[id\].ts` → 1 hit (else 분기 내부)
   - `grep -n 'DELETE FROM check_records' cha-bio-safety/functions/api/floorplan-markers/\[id\].ts` → 0 hits (점검 기록 DELETE 금지 룰 통과)
   - `grep -n 'isExtCascade' cha-bio-safety/functions/api/floorplan-markers/\[id\].ts` → 1 hit (기존 분기 유지)
   - `grep -n 'UPDATE check_points SET is_active=0' cha-bio-safety/functions/api/floorplan-markers/\[id\].ts` → 1 hit (소화기 분기 보존)
5. commit (한글 커밋 메시지 OK, push 는 hook 자동 OR 사용자 push 명시 시):
   ```
   fix(260529-kcs): floorplan marker DELETE 시 자동 cp 도 cascade 정리

   - else 분기에 cp_id 링크 마커용 안전 가드 추가
   - check_records=0 AND 다른 marker=0 일 때만 marker+cp atomic DELETE
   - 한 가드 위반 시 기존처럼 marker 만 DELETE (cp 보존)
   - 소화기 분기 (isExtCascade) 동작 무변경 — 자산 unassign + is_active=0 유지
   - check_records DELETE 절대 금지 룰 유지 (점검 기록 보존)
   - 어제 31117bf POST 자동 cp INSERT 의 비대칭 해소
   ```

**중요**:
- 빌드 + wrangler pages deploy 는 executor 가 하지 않음 (memory `feedback_subagent_production_deploy_forbidden`). orchestrator 가 처리.
- 작업 브랜치는 production 으로 가정 (이미 production 브랜치에서 작업중 — production-sync 노트 확인). `git rev-parse --abbrev-ref HEAD` 가 production 이 아니면 STOP + 사용자 보고.
  </action>
  <verify>
    <automated>
      # 타입 체크
      cd cha-bio-safety && npx tsc --noEmit
      # 가드 분기 존재 확인
      grep -c 'canCascadeCp' cha-bio-safety/functions/api/floorplan-markers/\[id\].ts
      # check_points DELETE 1건 (else 분기 내부)
      grep -c 'DELETE FROM check_points WHERE id=' cha-bio-safety/functions/api/floorplan-markers/\[id\].ts
      # check_records DELETE 절대 금지 — 0 건이어야 함
      grep -v '^#' cha-bio-safety/functions/api/floorplan-markers/\[id\].ts | grep -c 'DELETE FROM check_records'
      # 소화기 분기 보존
      grep -c 'isExtCascade' cha-bio-safety/functions/api/floorplan-markers/\[id\].ts
      grep -c 'UPDATE check_points SET is_active=0' cha-bio-safety/functions/api/floorplan-markers/\[id\].ts
      # 작업 브랜치 production 확인
      git rev-parse --abbrev-ref HEAD
    </automated>
  </verify>
  <done>
- `cha-bio-safety/functions/api/floorplan-markers/[id].ts` 의 else 분기에 `recordCount === 0 && otherMarkerCount === 0` 가드와 `env.DB.batch([DELETE marker, DELETE cp])` cascade 가 추가됨
- 소화기 분기 (isExtCascade, lines 64-73 영역) 동작 무변경 — grep 으로 `UPDATE extinguishers SET check_point_id=NULL` / `UPDATE check_points SET is_active=0` 둘 다 1건씩 유지
- `grep 'DELETE FROM check_records'` 0 건 (점검 기록 보존 원칙)
- tsc 통과
- 상단 주석 블록이 새 동작 (A/B/C 3 분기) 을 반영하도록 갱신됨
- production 브랜치에 commit 됨 (push 는 hook 자동 또는 orchestrator 판단)
- SUMMARY 에 변경 diff + grep 결과 + 위 verify 명령 출력 박제
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: 배포 후 사용자 시나리오 검증 (orchestrator 가 deploy 마친 뒤)</name>
  <what-built>
- Task 1: prod D1 의 '테스트' orphan cp (사무동 8-1F + 연구동 8F 소화전/완강기) 정리
- Task 2: DELETE /api/floorplan-markers/:id 의 else 분기에 cp cascade 가드 추가 (production 브랜치 commit)
- 그 후 orchestrator (메인 Claude) 가 `cd cha-bio-safety && npm run build && npx wrangler pages deploy dist --project-name=cbc7119 --branch=production --commit-message="ASCII"` 로 직원 도메인 배포
  </what-built>
  <how-to-verify>
**A. 일반 점검 페이지에 더 이상 노출 안 됨**:
1. PWA / cbc7119.pages.dev 에서 일반 점검 (CheckpointsPage) 진입
2. 사무동 8-1F → 소화전/완강기 카테고리: '테스트' 라벨 cp 가 사라졌는지 확인
3. 연구동 8F → 소화전/완강기 카테고리: '테스트' 라벨 cp 가 사라졌는지 확인

**B. 새 마커 추가 → 삭제 시 cp cascade 동작**:
1. 도면점검 페이지 → 소화전 카테고리 → 임의 층 도면 진입
2. 마커 새로 추가 (라벨 '테스트', cp_id 미지정 — 자동 cp 생성)
3. 일반 점검에 자동 cp 보이는지 확인 (cp 자동 생성 정상)
4. 도면으로 돌아가 그 마커 삭제
5. 일반 점검 새로고침 → 자동 생성됐던 '테스트' cp 가 같이 사라졌는지 확인 ✓

**C. 점검 기록 있는 cp 는 보호되는지 (회귀 방지)**:
1. 도면점검에서 기존 (점검 기록 1건 이상 있는) 소화전/완강기 마커를 의도적으로 한 번 삭제 시도
2. 마커는 사라지지만 cp 는 일반 점검에 계속 노출되어야 함 (cp 보존 — 점검 기록 잃지 않음)
3. (또는 사용자가 이 시나리오 건너뛰고 싶으면 Cloudflare Logs 의 console.log 로 `marker-only (cp preserved)` 메시지 확인)

**D. 소화기 4종 마커 삭제 회귀 없음**:
1. 도면점검 → 소화기 카테고리에서 임의 소화기 마커 삭제
2. 자산 (extinguishers) 행은 살아있고 (ExtinguishersListPage 에서 확인), check_point_id 가 NULL 로 unassign 됐는지 확인 (기존 동작 무변경)
  </how-to-verify>
  <resume-signal>
검증 통과 시 "approved" 또는 "배포 OK" 입력.
이슈 발견 시 시나리오 번호 + 증상 (스크린샷/콘솔/SQL 결과) 알려주세요.
검증 후 production-sync.md 표에 entry 추가 + 상태 '안정' 환원 진행.
  </resume-signal>
</task>

</tasks>

<verification>
1. Task 1 SUMMARY 박제 SQL 결과: cleanup 전후 cp 건수 변화 + check_records 총 건수 무손실
2. Task 2 grep 검증 6 항목 모두 PASS:
   - canCascadeCp 1건
   - DELETE FROM check_points 1건 (else 분기)
   - DELETE FROM check_records 0건 (절대 금지 룰)
   - isExtCascade 1건 (소화기 분기 보존)
   - UPDATE check_points SET is_active=0 1건 (소화기 분기 보존)
   - production 브랜치
3. tsc 통과
4. Task 3 사용자 시나리오 A/B/C/D 통과
5. production-sync.md 표에 새 entry 추가 + 상태 '안정' 환원
</verification>

<success_criteria>
- 사무동 8-1F + 연구동 8F 의 '테스트' 라벨 소화전/완강기 cp 가 prod D1 에서 정리됨 (check_records 손실 0)
- DELETE /api/floorplan-markers/:id 가 cp_id 링크된 비-소화기 마커에 대해 안전 가드 통과 시 cp 도 cascade 함
- 소화기 마커 (isExtCascade) 분기는 동작 무변경
- check_records 는 어떤 분기에서도 DELETE 되지 않음
- 직원 도메인 cbc7119.pages.dev 에 배포되어 사용자 시나리오 B (도면 마커 add→delete → 일반 점검에서 자동 cleanup) 가 통과함
- production-sync.md 에 새 entry 추가됨 + 상태 '안정' 환원
</success_criteria>

<output>
After completion, create `.planning/quick/260529-kcs-floorplan-marker-cascade-delete/260529-kcs-SUMMARY.md` containing:
- Task 1 SQL: 모든 SELECT/DELETE 명령 + rows_read/rows_written/결과 JSON
- Task 1 cleanup 결과: 작업 전/후 cp 건수 + check_records 총 건수 (손실 0 증명)
- Task 2 diff: 변경된 lines (상단 주석 + else 분기) before/after
- Task 2 verify grep 결과 6 항목
- Task 2 commit hash
- Task 3 사용자 검증 결과 (A/B/C/D 시나리오 통과 여부)
- 배포 URL (orchestrator 가 deploy 후 추가)
- production-sync.md 갱신 entry (orchestrator 가 정리)
</output>

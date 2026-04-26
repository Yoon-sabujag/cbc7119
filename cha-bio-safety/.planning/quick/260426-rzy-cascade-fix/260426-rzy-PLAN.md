---
phase: quick-260426-rzy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - functions/api/floorplan-markers/[id].ts
  - functions/api/check-points/[id].ts
autonomous: true
requirements:
  - 260426-rzy-cascade-fix

must_haves:
  truths:
    - "도면점검 페이지에서 소화기 마커를 삭제하면 floor_plan_markers + extinguishers 행 제거 + 해당 CP-FE-* check_point.is_active=0 으로 동시에 처리된다"
    - "CheckpointsPage 에서 CP-FE-* 점검개소를 비활성화(isActive=0)하면 floor_plan_markers + extinguishers 행이 동시에 제거된다"
    - "양쪽 흐름 모두 check_records 행은 단 한 건도 삭제되지 않는다 (점검 기록 보존 원칙)"
    - "비-소화기 마커(plan_type !== 'extinguisher' 또는 check_point_id 가 CP-FE- 로 시작하지 않음) 삭제는 기존과 동일하게 floor_plan_markers 단일 DELETE 만 수행된다"
    - "CP-FE-* 가 아닌 check_points 의 isActive 토글(예: 비-소화기 카테고리 reactivate/deactivate)은 cascade 없이 기존 UPDATE 만 수행된다"
    - "운영 라이브 D1 의 고아 행 CP-FE-0362 의 extinguishers 행이 0건으로 정리된다 (check_points.is_active=0 과 check_records 2건은 유지)"
    - "TypeScript 타입체크(npm run build) PASS"
    - "프로덕션 배포 (--branch production, ASCII commit message) 완료"
  artifacts:
    - path: "functions/api/floorplan-markers/[id].ts"
      provides: "onRequestDelete 가 plan_type='extinguisher' AND check_point_id LIKE 'CP-FE-%' 일 때 D1 batch 로 markers DELETE + extinguishers DELETE + check_points UPDATE is_active=0 을 atomic 실행"
      contains: "env.DB.batch"
    - path: "functions/api/check-points/[id].ts"
      provides: "onRequestPut 이 isActive=0 전이 + id LIKE 'CP-FE-%' 일 때 기존 UPDATE 직후 extinguishers DELETE + floor_plan_markers DELETE cascade"
      contains: "CP-FE-"
  key_links:
    - from: "functions/api/floorplan-markers/[id].ts:onRequestDelete"
      to: "extinguishers, check_points 테이블"
      via: "env.DB.batch([DELETE markers, DELETE extinguishers, UPDATE check_points is_active=0])"
      pattern: "env\\.DB\\.batch"
    - from: "functions/api/check-points/[id].ts:onRequestPut"
      to: "extinguishers, floor_plan_markers 테이블"
      via: "isActive===0 + id.startsWith('CP-FE-') 가드 후 DELETE 2건"
      pattern: "startsWith\\(.CP-FE-.\\)"
    - from: "양쪽 cascade 핸들러"
      to: "check_records 테이블"
      via: "절대 DELETE 하지 않음 — 점검 이력 보존 원칙"
      pattern: "DELETE FROM check_records"
---

<objective>
소화기(extinguisher) 마커/점검개소 삭제 흐름의 데이터 정합성 cascade 버그 수정.

Purpose: 현재 소화기 삭제 두 경로(도면 마커 DELETE / CheckpointsPage 비활성화) 모두 단일 테이블만 건드려서 floor_plan_markers / extinguishers / check_points.is_active 가 따로 노는 고아 행을 만들고 있다. InspectionPage 와 도면 양쪽에서 "삭제했는데 여전히 보임" 현상이 발생. 백엔드 cascade 로직만 추가해 양쪽 진입점에서 일관된 정합성을 보장한다.

Output:
- functions/api/floorplan-markers/[id].ts onRequestDelete 분기 cascade 추가
- functions/api/check-points/[id].ts onRequestPut isActive=0 전이 cascade 추가
- 라이브 D1 의 기존 고아 행(CP-FE-0362 extinguishers) 정리
- 프로덕션 배포 완료
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@CLAUDE.md
@functions/api/floorplan-markers/[id].ts
@functions/api/check-points/[id].ts
@functions/api/extinguishers/index.ts
@functions/api/extinguishers/create.ts
@src/pages/CheckpointsPage.tsx

<interfaces>
<!-- D1 스키마 핵심 — 본 plan 이 다루는 테이블만 -->

floor_plan_markers:
  - id TEXT PK ('FPM-' prefix)
  - floor TEXT, plan_type TEXT ('extinguisher' | 'guidelamp' | 'sprinkler' | 'detector' 등)
  - marker_type TEXT, x_pct REAL, y_pct REAL, label TEXT
  - check_point_id TEXT  (FK to check_points.id, NULLABLE)
  - 한 CP-FE-XXXX 당 마커 0..1

check_points:
  - id TEXT PK ('CP-FE-XXXX' = 소화기 전용)
  - is_active INTEGER (0|1)
  - category, location, floor, zone, ...

extinguishers:
  - id INTEGER PK
  - check_point_id TEXT NOT NULL REFERENCES check_points(id)
  - is_active 컬럼 없음 → 하드 DELETE 만 가능

check_records:
  - 점검 이력. 본 plan 에서 절대 DELETE 금지.

<!-- 현재 onRequestDelete (수정 전) -->
export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id as string
  await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
  return Response.json({ success: true })
}

<!-- 현재 onRequestPut UPDATE 후 (수정 전) — cascade 없음 -->
await env.DB.prepare(`UPDATE check_points SET ... is_active=COALESCE(?7, is_active) WHERE id=?8`).bind(...).run()
const updated = await env.DB.prepare('SELECT ...').bind(id).first()
return Response.json({ success: true, data: {...} })

<!-- D1 batch 동작: Cloudflare 공식 문서상 batch() 는 단일 RPC + 트랜잭션 의미론. 한 statement 실패 시 전체 롤백. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: floorplan-markers DELETE cascade 추가 (extinguisher 가드)</name>
  <files>functions/api/floorplan-markers/[id].ts</files>
  <behavior>
    - 마커 ID 로 plan_type / check_point_id 선조회
    - 마커 없으면 404 반환
    - plan_type === 'extinguisher' AND check_point_id LIKE 'CP-FE-%' 인 경우에만 cascade 분기
    - cascade 분기: env.DB.batch([
        DELETE FROM floor_plan_markers WHERE id=?,
        DELETE FROM extinguishers WHERE check_point_id=?,
        UPDATE check_points SET is_active=0 WHERE id=?
      ]) 로 atomic 실행
    - 비-소화기 마커: 기존 동작 그대로 floor_plan_markers 단일 DELETE
    - check_records 는 어떤 분기에서도 손대지 않음
  </behavior>
  <action>
    `functions/api/floorplan-markers/[id].ts` 의 onRequestDelete 를 다음 로직으로 교체.

    1) const id = params.id as string
    2) 선조회: `SELECT plan_type, check_point_id FROM floor_plan_markers WHERE id=?` 의 first<{ plan_type: string; check_point_id: string | null }>() 결과를 marker 변수에 저장.
    3) marker 가 null 이면 `Response.json({ success: false, error: '마커를 찾을 수 없습니다' }, { status: 404 })` 반환.
    4) const cpId = marker.check_point_id; const isExtCascade = marker.plan_type === 'extinguisher' && !!cpId && cpId.startsWith('CP-FE-')
    5) isExtCascade === true: env.DB.batch([
         env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id),
         env.DB.prepare('DELETE FROM extinguishers WHERE check_point_id=?').bind(cpId),
         env.DB.prepare('UPDATE check_points SET is_active=0 WHERE id=?').bind(cpId),
       ]) 호출. (D1 batch 는 atomic — 한 statement 실패 시 전체 롤백. 이는 분기 코멘트로 명시.)
    6) 그 외(비-소화기 또는 cpId 가 CP-FE- 가 아닌 경우): 기존대로 `env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()`.
    7) 마지막에 `Response.json({ success: true })` 반환.

    onRequestPut 핸들러는 손대지 말 것 (수정/이동 흐름과 무관).

    절대 금지:
    - check_records 를 건드리는 어떤 SQL도 작성하지 말 것 — 운영 메모리 "점검 기록 삭제 불가 원칙" violation 시 critical bug.
    - extinguishers 에 is_active 컬럼이 없으므로 UPDATE extinguishers SET is_active=0 같은 코드 작성 금지 (스키마 위반).
    - plan_type 이 'extinguisher' 가 아닌 마커에는 cascade 가지 말 것 (guidelamp/sprinkler/detector 회귀 방지).

    구현 후 `npm run build` 로 TypeScript 타입체크 PASS 확인.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
    - functions/api/floorplan-markers/[id].ts 의 onRequestDelete 가 위 6단계 로직으로 교체됨
    - `grep -n "env.DB.batch" functions/api/floorplan-markers/[id].ts` 가 cascade 분기 라인을 출력
    - `grep -n "plan_type === 'extinguisher'" functions/api/floorplan-markers/[id].ts` 가드 확인
    - `grep -n "DELETE FROM check_records" functions/api/floorplan-markers/[id].ts` 가 0줄
    - `npm run build` PASS (TypeScript 에러 0)
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: check-points PUT cascade 추가 (CP-FE-* 가드) + 라이브 D1 고아 행 정리</name>
  <files>functions/api/check-points/[id].ts</files>
  <behavior>
    - body.isActive === 0 (명시적 0 전이) AND id.startsWith('CP-FE-') 일 때만 cascade
    - 기존 UPDATE 가 먼저 실행되고, 그 직후 extinguishers / floor_plan_markers DELETE 2건 추가 실행
    - cascade 가드 미해당 시 기존 동작 그대로 (CP-FE-* 가 아니거나 isActive 가 0 이 아니거나 isActive 미지정)
    - CP-FE-0362 라이브 고아 extinguisher 행 1건이 0건으로 정리되고 check_points.is_active=0 / check_records 2건은 유지됨
  </behavior>
  <action>
    Part A — `functions/api/check-points/[id].ts` 수정:

    1) onRequestPut 내부, body 파싱 직후(= existing 조회 직전 또는 직후) 다음 두 const 선언:
       const willDeactivate = body.isActive === 0
       const isExtCp = id.startsWith('CP-FE-')
    2) 기존 UPDATE check_points 쿼리는 그대로 둘 것 (구조 변경 금지 — COALESCE 패턴이 다른 카테고리 부분 수정과 공유됨).
    3) UPDATE 직후, updated SELECT 직전에 cascade 블록 삽입:
       if (willDeactivate && isExtCp) {
         await env.DB.batch([
           env.DB.prepare('DELETE FROM extinguishers WHERE check_point_id=?').bind(id),
           env.DB.prepare('DELETE FROM floor_plan_markers WHERE check_point_id=?').bind(id),
         ])
       }
    4) updated SELECT 및 응답 매핑은 변경 없음.
    5) try-catch 외곽은 그대로 유지. cascade 도 try 블록 안에 위치시켜서 실패 시 500 으로 빠지게 한다.

    가드 근거 (코드 코멘트로 1줄 추가):
    // CP-FE-* 만 cascade — 다른 카테고리(자탐/스프링클러 등) 비활성화 흐름 보호

    절대 금지:
    - check_records DELETE 작성 금지 (점검 기록 보존 원칙)
    - extinguishers 에 is_active UPDATE 작성 금지 (컬럼 없음)
    - id.startsWith('CP-FE-') 가드 빼지 말 것 — 다른 prefix(예: 향후 CP-AS-/CP-SP-) 영향 금지

    Part B — 라이브 D1 고아 행 정리:

    1) 삭제 전 상태 확인:
       npx wrangler d1 execute cha-bio-db --remote --command "SELECT id, check_point_id, mgmt_no FROM extinguishers WHERE check_point_id='CP-FE-0362';"
       (예상: 1행 출력)
       npx wrangler d1 execute cha-bio-db --remote --command "SELECT id, is_active FROM check_points WHERE id='CP-FE-0362';"
       (예상: is_active=0)
       npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*) as cnt FROM check_records WHERE check_point_id='CP-FE-0362';"
       (예상: cnt=2 — 보존되어야 함)
    2) 고아 extinguisher 행만 삭제:
       npx wrangler d1 execute cha-bio-db --remote --command "DELETE FROM extinguishers WHERE check_point_id='CP-FE-0362';"
    3) 삭제 후 검증:
       npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*) FROM extinguishers WHERE check_point_id='CP-FE-0362';"
       (예상: 0)
       npx wrangler d1 execute cha-bio-db --remote --command "SELECT is_active FROM check_points WHERE id='CP-FE-0362';"
       (예상: is_active=0 그대로 유지)
       npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*) FROM check_records WHERE check_point_id='CP-FE-0362';"
       (예상: 2 그대로 유지 — 점검 기록 보존 원칙)

    Part C — TypeScript 타입체크:
       npm run build (PASS 필수)
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npm run build 2>&1 | tail -10 && grep -n "willDeactivate" functions/api/check-points/\[id\].ts && grep -n "CP-FE-" functions/api/check-points/\[id\].ts</automated>
  </verify>
  <done>
    - functions/api/check-points/[id].ts 에 willDeactivate / isExtCp 변수 + cascade batch 블록 존재
    - `grep -n "DELETE FROM check_records" functions/api/check-points/[id].ts` 가 0줄 (점검 기록 보존)
    - `grep -n "extinguishers SET is_active" functions/api/check-points/[id].ts` 가 0줄 (스키마 미존재 컬럼 미사용)
    - `npm run build` PASS
    - 라이브 D1: extinguishers WHERE check_point_id='CP-FE-0362' COUNT = 0
    - 라이브 D1: check_points WHERE id='CP-FE-0362' is_active=0 유지
    - 라이브 D1: check_records WHERE check_point_id='CP-FE-0362' COUNT = 2 유지
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: 프로덕션 배포 + 배포 후 회귀 가드 검증</name>
  <files>(no source change — deployment + verification)</files>
  <behavior>
    - dist/ 가 최신 빌드 산출물로 갱신됨
    - Cloudflare Pages production branch 로 배포되고 Preview 가 아닌 production URL 이 갱신됨
    - 배포된 함수 코드에 cascade 분기 키워드(`env.DB.batch`, `CP-FE-`)가 포함되어 있음 (정적 검증)
    - 배포 후 라이브 D1 의 데이터 정합성 카운트가 의도된 상태(고아 0건)
  </behavior>
  <action>
    1) 빌드:
       cd /Users/jykevin/Documents/20260328/cha-bio-safety
       npm run build
       (실패 시 stop — Task 1/2 회귀)

    2) 프로덕션 배포 (운영 메모리: --branch production 필수, ASCII commit message):
       npx wrangler pages deploy dist --branch production --commit-message "ext cascade delete fix"
       (한글 메시지 사용 금지 — wrangler 거부)

    3) 배포 산출물에 cascade 코드가 포함됐는지 정적 검증:
       grep -n "env.DB.batch" functions/api/floorplan-markers/\[id\].ts
       grep -n "willDeactivate" functions/api/check-points/\[id\].ts
       (둘 다 hit 없으면 배포 전 단계 회귀 — stop)

    4) 라이브 D1 정합성 회귀 확인 (Task 2 Part B 가 정상 반영됐는지):
       npx wrangler d1 execute cha-bio-db --remote --command "SELECT COUNT(*) as orphan_ext FROM extinguishers e LEFT JOIN check_points cp ON e.check_point_id=cp.id WHERE cp.is_active=0;"
       (CP-FE-0362 정리 후 결과는 0 또는 다른 알려진 고아만 — 0 이 이상적)

    5) SUMMARY 작성 시 사용자 검증 절차 명시 (PWA 캐시 회피):
       a. 사용자가 PWA 재설치 (운영 메모리: PWA 캐시가 배포 무시함)
       b. 임시 소화기 1개 추가 → /floorplan 에서 마커 삭제 → DB 에서 markers/extinguishers 행 0, check_points.is_active=0 확인
       c. 또 다른 임시 소화기 1개 추가 → /checkpoints 에서 비활성화 → DB 에서 markers/extinguishers 행 0, check_points.is_active=0 확인
       d. 두 흐름 모두 check_records 행은 손대지 않았음을 확인 (해당 CP 의 기록 행수 변화 없음)

    절대 금지:
    - --branch 플래그 빠뜨리지 말 것 — 운영 메모리 "배포 시 --branch production 필수" violation 시 Preview 로 빠짐.
    - 한글 commit message 사용 금지 — wrangler 거부.
    - 로컬 dev 서버에서 끝내지 말 것 — 운영 메모리 "프로덕션 배포 후 테스트".
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && grep -c "env.DB.batch" functions/api/floorplan-markers/\[id\].ts && grep -c "willDeactivate" functions/api/check-points/\[id\].ts && grep -c "DELETE FROM check_records" functions/api/floorplan-markers/\[id\].ts functions/api/check-points/\[id\].ts || true</automated>
  </verify>
  <done>
    - `npm run build` 빌드 산출물 dist/ 갱신
    - `npx wrangler pages deploy dist --branch production --commit-message "ext cascade delete fix"` 가 production deployment URL 출력
    - `grep -c "env.DB.batch" functions/api/floorplan-markers/[id].ts` >= 1
    - `grep -c "willDeactivate" functions/api/check-points/[id].ts` >= 1
    - `grep -c "DELETE FROM check_records" functions/api/{floorplan-markers,check-points}/[id].ts` 합계 = 0
    - 라이브 D1 orphan_ext 카운트 확인 완료 (CP-FE-0362 정리 반영됨)
  </done>
</task>

</tasks>

<verification>
플랜 전체 회귀 가드:

1) 핸들러 정합성 (정적):
   - `grep -n "env.DB.batch" functions/api/floorplan-markers/[id].ts` 가 onRequestDelete 분기 안에서 hit
   - `grep -n "plan_type === 'extinguisher'" functions/api/floorplan-markers/[id].ts` 가드 확인
   - `grep -n "willDeactivate && isExtCp" functions/api/check-points/[id].ts` cascade 가드 확인
   - 양쪽 파일 모두 `grep -n "DELETE FROM check_records"` 결과 0줄 (점검 기록 보존 원칙)
   - 양쪽 파일 모두 `grep -n "extinguishers SET is_active"` 결과 0줄 (스키마 미존재 컬럼 미사용)

2) 회귀 미해당 흐름:
   - guidelamp/sprinkler/detector 등 비-소화기 마커 DELETE: 단일 floor_plan_markers DELETE 만 실행 (기존 동작)
   - CP-FE- 가 아닌 check_points isActive 토글: 기존 UPDATE 만 실행 (cascade 미발동)
   - check-points PUT 의 다른 필드(location/category/floor 등) 부분 수정: 기존 COALESCE 흐름 그대로

3) 빌드/배포:
   - `npm run build` PASS (TypeScript 0 에러)
   - `npx wrangler pages deploy dist --branch production --commit-message "ext cascade delete fix"` 실행 — production deployment URL 반환

4) 라이브 D1 데이터 정합성:
   - extinguishers WHERE check_point_id='CP-FE-0362' COUNT = 0
   - check_points WHERE id='CP-FE-0362' is_active = 0
   - check_records WHERE check_point_id='CP-FE-0362' COUNT = 2 (보존)
</verification>

<success_criteria>
- 양쪽 핸들러 cascade 로직 추가 (가드 포함) 후 TypeScript 타입체크 PASS
- 라이브 D1 의 CP-FE-0362 고아 extinguisher 행이 0건으로 정리됨
- check_records 는 양쪽 흐름 + 라이브 cleanup 모두에서 단 한 건도 삭제되지 않음
- 비-소화기 마커 / 비 CP-FE-* check_point 흐름은 기존과 동일하게 동작 (회귀 없음)
- production branch 로 배포 완료 (Preview 아님)
- SUMMARY 에 사용자 PWA 재설치 + 임시 소화기 추가→삭제 검증 절차 명시
</success_criteria>

<output>
After completion, create `.planning/quick/260426-rzy-cascade-fix/260426-rzy-SUMMARY.md` with:
- 변경된 파일 2개의 diff 요약
- 라이브 D1 cleanup 전/후 카운트 (extinguishers, check_points.is_active, check_records)
- 프로덕션 배포 URL / commit hash
- 사용자 검증 절차 (PWA 재설치 + 임시 소화기로 양쪽 흐름 테스트, check_records 보존 확인)
- 회귀 가드 grep 결과 (env.DB.batch, willDeactivate, DELETE FROM check_records 0건)
</output>

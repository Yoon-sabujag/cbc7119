---
phase: quick-260609-ekw
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/functions/api/floorplan-markers/[id].ts
  - cha-bio-safety/functions/api/check-points/[id].ts
autonomous: true
requirements: [SYNC-FE-LABEL]
must_haves:
  truths:
    - "마커 모달에서 소화기(CP-FE-%) 개소명을 바꾸면 check_points.location 과 extinguishers.location 까지 같은 batch 로 전파된다"
    - "점검개소 편집기(admin)에서 소화기(CP-FE-%) location 을 바꾸면 extinguishers.location 까지 전파된다"
    - "비-소화기 마커(소화전 -SH / 완강기 -WK / DIV)는 동기되지 않는다 (기존 동작 유지)"
    - "label 이 빈 문자열/undefined 면 동기하지 않는다 (기존 동작 유지)"
    - "마커/주체 UPDATE 가 batch 의 첫 statement 라 동기 statement 실패해도 사용자가 본 라벨은 저장된다"
  artifacts:
    - path: "cha-bio-safety/functions/api/floorplan-markers/[id].ts"
      provides: "PUT 핸들러 — label 동기 가드 (CP-FE-% -> check_points + extinguishers batch 전파)"
      contains: "CP-FE-"
    - path: "cha-bio-safety/functions/api/check-points/[id].ts"
      provides: "PUT 핸들러 — location 동기 가드 (CP-FE-% -> extinguishers 전파)"
      contains: "else if (isExtCp && body.location !== undefined)"
  key_links:
    - from: "cha-bio-safety/functions/api/floorplan-markers/[id].ts"
      to: "extinguishers.location"
      via: "env.DB.batch UPDATE when cpId.startsWith('CP-FE-')"
      pattern: "UPDATE extinguishers SET location"
    - from: "cha-bio-safety/functions/api/check-points/[id].ts"
      to: "extinguishers.location"
      via: "else if (isExtCp && body.location !== undefined) UPDATE"
      pattern: "UPDATE extinguishers SET location"
---

<objective>
staging(cbc7119-data, 검증 커밋 a9791e9)에서 tsc+vite build + D1 propagation 테스트까지 통과한 "소화기 개소명 3-store 동기 가드"를 production 직원도메인(cbc7119) 소스 2파일에 verbatim 으로 적용한다.

소화기 "개소명"은 D1 3곳에 중복 저장된다:
- check_points.location — 일반점검 목록, 도면 마커 이름(cp_location 우선), QR
- extinguishers.location — 소화기 관리 목록 (CP-FE-% 개소에만 행 존재)
- floor_plan_markers.label — 마커 수정 모달 "개소명" 입력칸

두 PUT 경로가 일부만 갱신해 "한 개소가 화면마다 다른 이름"으로 보이던 사고(260608-b6f). 두 핸들러에서 소화기(CP-FE-%)에 한해 같은 batch 로 나머지 store 까지 전파하도록 가드를 추가한다.

Purpose: 소화기 개소명 divergence 재발 방지 (사고 260608-b6f 종결).
Output: PUT 핸들러 2개 수정, 파일당 atomic commit 1개.

범위 제약: 소화기(CP-FE-%) 한정. 소화전(-SH), 완강기(-WK), DIV(CP-DIV-)는 extinguishers 행이 없거나 구조적 이름/페어링 룰 때문에 제외.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md

이 콘솔은 production 전용 (CLAUDE.md Console scope). executor 의 범위는 source Edit + atomic commit 까지만이다.
- 절대 금지: `npm run build` / `vite build` / `wrangler` 배포 / prod D1(cha-bio-db) 접근 / 진단/정리 SQL 실행.
- build / 배포 / prod 데이터 점검은 메인 Claude(오케스트레이터)가 직접 수행한다 (핸드오프 §5 의 빌드/배포/데이터/UI 검증).
- executor 가 수행 가능한 verify: `npx tsc --noEmit` (cha-bio-safety/ 에서) + grep 마커 검증 + `git status` staged 확인.
</execution_context>

<context>
@PROD-HANDOFF-개소명동기-가드.md
@cha-bio-safety/functions/api/floorplan-markers/[id].ts
@cha-bio-safety/functions/api/check-points/[id].ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: floorplan-markers PUT 핸들러에 label 동기 가드 추가</name>
  <files>cha-bio-safety/functions/api/floorplan-markers/[id].ts</files>
  <action>
`cha-bio-safety/functions/api/floorplan-markers/[id].ts` 의 onRequestPut 핸들러에서, 기존 단일 UPDATE 블록을 핸드오프 §3 첫 번째 코드블록으로 교체한다.

Edit old_string — 현재 파일 32-39행을 정확히 매칭 (2-space 들여쓰기 그대로). 이 anchor 의 본문은 다음 8개 라인이다:
  - `  sets.push("updated_at=datetime('now','+9 hours')")`
  - `  binds.push(id)`
  - 빈 줄
  - `  await env.DB.prepare(`
  - `    \`UPDATE floor_plan_markers SET ${sets.join(', ')} WHERE id=?\``
  - `  ).bind(...binds).run()`
  - 빈 줄
  - `  return Response.json({ success: true })`
  - `}`
  매칭 범위에는 onRequestPut 의 닫는 `}` 까지 포함시키되, 그 아래 onRequestDelete(42행 이하)는 절대 포함하지 않는다.

Edit new_string — 핸드오프 §3 첫 번째 블록을 verbatim 으로 적용 (한국어 주석/2-space 들여쓰기/single quote/template literal 그대로 보존). 핸드오프 32-87행 본문을 그대로 사용하며, 의미상 다음 요소가 반드시 존재해야 한다:
  - `sets.push("updated_at=datetime('now','+9 hours')")` + `binds.push(id)` (보존)
  - `const newLabel = body.label !== undefined && body.label !== null && body.label.trim() !== '' ? body.label.trim() : null`
  - `let cpId: string | null = body.check_point_id ?? null` + body 에 cpId 없으면 마커 행에서 `SELECT check_point_id FROM floor_plan_markers WHERE id=?` 로 조회
  - `const stmts = [ ... ]` 의 첫 statement 가 항상 마커 UPDATE
  - `if (newLabel && cpId && cpId.startsWith('CP-FE-'))` 일 때만 `UPDATE check_points SET location=? WHERE id=?` 와 `UPDATE extinguishers SET location=?, updated_at=datetime('now','+9 hours') WHERE check_point_id=?` 를 stmts 에 push
  - `if (stmts.length === 1) { await stmts[0].run() } else { await env.DB.batch(stmts) }`
  - `return Response.json({ success: true })` 와 닫는 `}`

핸드오프 코드를 재작성/요약/축약하지 말고 verbatim 적용. 이 Edit 은 onRequestPut 만 건드린다 — onRequestDelete 는 절대 수정 금지.

적용 후 atomic commit (executor 는 commit 까지만 — 빌드/배포 금지):
  - 메시지: `fix(260609-ekw): floorplan-markers PUT 소화기 개소명 3-store 동기 가드 (a9791e9 prod 반영)`
  - co-author 라인 포함.
  </action>
  <verify>
  <automated>cd /Users/jongyupyoon/Documents/20260328/cha-bio-safety && npx tsc --noEmit 2>&1 | head -30; echo G1; grep -c "CP-FE-" 'functions/api/floorplan-markers/[id].ts'; grep -c "UPDATE extinguishers SET location" 'functions/api/floorplan-markers/[id].ts'; grep -c "env.DB.batch(stmts)" 'functions/api/floorplan-markers/[id].ts'; echo G2; git ls-files 'functions/api/floorplan-markers/[id].ts'</automated>
  <expected>tsc 출력 0 (functions 타입에러 없음); CP-FE- count 1; UPDATE extinguishers SET location count 1; env.DB.batch(stmts) count 1; git ls-files 가 파일 경로 1줄 출력(tracked). 빌드/배포/prod-D1 은 메인 Claude 담당 — 이 verify 범위 밖.</expected>
  </verify>
  <done>onRequestPut 이 핸드오프 §3 첫 블록과 일치하고 tsc 통과. CP-FE-% 일 때 check_points + extinguishers 가 같은 batch 로 전파되고, label 빈값이거나 비-CP-FE 면 동기 안 함. onRequestDelete 무변경. atomic commit 완료 + 파일 tracked.</done>
</task>

<task type="auto">
  <name>Task 2: check-points PUT 핸들러에 location 동기 가드(else if) 추가</name>
  <files>cha-bio-safety/functions/api/check-points/[id].ts</files>
  <action>
`cha-bio-safety/functions/api/check-points/[id].ts` 의 onRequestPut(admin) 핸들러에서, 기존 `if (willDeactivate && isExtCp) { ... }` 블록 끝에 핸드오프 §3 두 번째 코드블록(else if)을 추가한다.

Edit old_string — 현재 파일 50-55행. 이 anchor 의 본문은 다음과 같다 (4-space 들여쓰기, try 블록 안):
  - `    if (willDeactivate && isExtCp) {`
  - `      await env.DB.batch([`
  - `        env.DB.prepare('DELETE FROM extinguishers WHERE check_point_id=?').bind(id),`
  - `        env.DB.prepare('DELETE FROM floor_plan_markers WHERE check_point_id=?').bind(id),`
  - `      ])`
  - `    }`

Edit new_string — 위 블록을 보존하되, 마지막 `    }` 를 다음 else if 와 합친다. 핸드오프 §3 두 번째 블록(93-104행)을 verbatim 으로 이어 붙인다:
  - 닫는 `    }` 를 `    } else if (isExtCp && body.location !== undefined) {` 로 교체
  - 그 안에 한국어 주석 4줄(개소명 동기 가드 설명) 보존
  - `await env.DB.prepare("UPDATE extinguishers SET location=?, updated_at=datetime('now','+9 hours') WHERE check_point_id=?").bind(body.location, id).run()`
  - 닫는 `    }`

새 블록은 willDeactivate=false 이고 isExtCp 이며 body.location 이 제공된 일반 편집 케이스에서만 실행된다. 들여쓰기는 try 블록 내부 기준 4-space(else if 본문은 6-space). 핸드오프 코드를 verbatim 적용 — 주석/따옴표/시간식 그대로.

이 Edit 은 onRequestPut 의 cascade 분기만 건드린다. 위쪽 UPDATE check_points(27-46행)와 아래 SELECT/return(57행 이하)은 무변경.

적용 후 atomic commit (executor 는 commit 까지만 — 빌드/배포 금지):
  - 메시지: `fix(260609-ekw): check-points PUT 소화기 location -> extinguishers 동기 가드 (a9791e9 prod 반영)`
  - co-author 라인 포함.
  </action>
  <verify>
  <automated>cd /Users/jongyupyoon/Documents/20260328/cha-bio-safety && npx tsc --noEmit 2>&1 | head -30; echo G1; grep -c "else if (isExtCp && body.location !== undefined)" 'functions/api/check-points/[id].ts'; grep -c "UPDATE extinguishers SET location" 'functions/api/check-points/[id].ts'; grep -c "DELETE FROM extinguishers WHERE check_point_id" 'functions/api/check-points/[id].ts'; echo G2; git ls-files 'functions/api/check-points/[id].ts'</automated>
  <expected>tsc 출력 0; else if (isExtCp && body.location !== undefined) count 1; UPDATE extinguishers SET location count 1; DELETE FROM extinguishers count 1(기존 비활성화 cascade 보존); git ls-files 가 파일 경로 1줄 출력(tracked). 빌드/배포/prod-D1 은 메인 Claude 담당 — 이 verify 범위 밖.</expected>
  </verify>
  <done>onRequestPut 의 cascade 블록이 `if (willDeactivate && isExtCp) {...} else if (isExtCp && body.location !== undefined) {...}` 구조가 되고 tsc 통과. 일반 편집(비활성화 아님)에서 소화기 location 변경 시 extinguishers.location 전파. 기존 비활성화 cascade(DELETE 2건) 보존. 위 UPDATE check_points / 아래 SELECT/return 무변경. atomic commit 완료 + 파일 tracked.</done>
</task>

</tasks>

<verification>
- 두 파일 모두 `cd cha-bio-safety && npx tsc --noEmit` 통과 (functions/ 타입체크 포함). vite build 는 메인 Claude 가 핸드오프 §5-2 에서 수행.
- grep 마커: 두 핸들러 모두 `UPDATE extinguishers SET location` 1회씩 등장. floorplan-markers 는 `env.DB.batch(stmts)` + `CP-FE-`, check-points 는 `else if (isExtCp && body.location !== undefined)`.
- `git ls-files` 로 두 파일 모두 tracked 확인 (메모리: gitignore 광범위 패턴 유실 사고 전례 — functions/api/ 경로는 anchored /inspections/ 와 무관하나 staged 여부 명시 확인).
- atomic commit 2개 (파일당 1개). 메인 콘솔 auto-push hook 은 hook 책임.
- 범위 밖(메인 Claude 담당): npm run build / wrangler --project-name=cbc7119 --branch=production 배포 / prod D1(cha-bio-db) 진단·정리 SQL(핸드오프 §5-4) / UI E2E(§5-5).
</verification>

<success_criteria>
- floorplan-markers `[id].ts` onRequestPut 이 핸드오프 §3 첫 블록과 일치: CP-FE-% 일 때 마커 UPDATE(첫 statement) + check_points.location + extinguishers.location batch 전파. label 빈값/비-CP-FE 면 단일 UPDATE 유지.
- check-points `[id].ts` onRequestPut 의 cascade 블록에 else if 추가: 비활성화 아니고 isExtCp 이며 body.location 있으면 extinguishers.location 전파. 기존 비활성화 cascade 보존.
- 비-소화기(소화전/완강기/DIV) 경로 무회귀. onRequestDelete, 상단 UPDATE check_points, SELECT/return 무변경.
- 두 파일 tsc 통과 + tracked + atomic commit 2개.
</success_criteria>

<output>
Create `.planning/quick/260609-ekw-extinguisher-checkpoint-name-3-store-syn/260609-ekw-SUMMARY.md` when done.

SUMMARY 에 명시할 핸드오프(§5) 미완료 항목 — 메인 Claude 가 후속 수행:
- §5-2 빌드 (`npm run build`, tsc+vite 통과 확인)
- §5-3 배포 (`--project-name=cbc7119 --branch=production`, staging 명령 금지)
- §5-4 prod 데이터 점검: floor_plan_markers.label != check_points.location 인 CP-FE-% stray 라벨 진단/정리 (staging 의 CP-FE-0104/0105 패턴 prod 존재 여부)
- §5-5 UI E2E 검증
</output>

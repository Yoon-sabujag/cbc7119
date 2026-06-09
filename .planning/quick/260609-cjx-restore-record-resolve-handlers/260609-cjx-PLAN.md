---
phase: quick-260609-cjx
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts
  - cha-bio-safety/functions/api/inspections/records/[recordId]/unresolve.ts
  - cha-bio-safety/functions/api/inspections/records/[recordId].ts
autonomous: true
requirements: [HOTFIX-RECORD-HANDLERS]

must_haves:
  truths:
    - "POST /api/inspections/records/:recordId/resolve marks a record resolved for any logged-in staff"
    - "POST /api/inspections/records/:recordId/unresolve reverts a record to open (admin only, 403 otherwise)"
    - "DELETE /api/inspections/records/:recordId permanently deletes a record (admin only, 403 otherwise)"
    - "All three handlers import Env from the correct-depth _middleware path and tsc/build pass"
  artifacts:
    - path: "cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts"
      provides: "resolve handler (onRequestPost)"
      contains: "onRequestPost"
    - path: "cha-bio-safety/functions/api/inspections/records/[recordId]/unresolve.ts"
      provides: "unresolve handler (onRequestPost, admin gate)"
      contains: "onRequestPost"
    - path: "cha-bio-safety/functions/api/inspections/records/[recordId].ts"
      provides: "delete handler (onRequestDelete, admin gate)"
      contains: "onRequestDelete"
  key_links:
    - from: "src/utils/api.ts resolveRecord + RemediationDetailPage/FloorPlanPage"
      to: "functions/api/inspections/records/[recordId]/{resolve,unresolve}.ts + records/[recordId].ts"
      via: "Cloudflare Pages file-based routing"
      pattern: "inspections/records/.*recordId"
---

<objective>
P1 hotfix. Restore the three inspection-record action API handlers that were lost when the
repo was re-cloned. They were untracked files (never committed), so a fresh clone dropped them,
breaking resolve / unresolve / delete for ALL inspection categories starting with the 06-05 deploy.

The frontend (RemediationDetailPage.tsx, FloorPlanPage.tsx, utils/api.ts) calls:
- `POST /api/inspections/records/:recordId/resolve`   (조치 완료 — all logged-in staff)
- `POST /api/inspections/records/:recordId/unresolve` (조치 취소 — admin only)
- `DELETE /api/inspections/records/:recordId`         (기록 삭제 — admin only)

...but `functions/api/inspections/records/` (the route directory) does not exist. Record SAVE
itself (`inspections/[sessionId]/records.ts` POST) is unaffected and works. A full audit of
`utils/api.ts` confirmed these 3 are the only missing routes.

Purpose: Re-enable inspection remediation save/cancel/delete and — critically — COMMIT the files
this time so a future clone cannot silently drop them again.
Output: 3 new handler files, type-checked, build-verified, committed atomically.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md

# Adjacent handler — copy its style (Env import, `data as any`, Response.json shape, console.error, datetime('now','+9 hours'))
@cha-bio-safety/functions/api/inspections/[sessionId]/records.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create the three missing record-action handlers (verbatim) and commit</name>
  <files>cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts, cha-bio-safety/functions/api/inspections/records/[recordId]/unresolve.ts, cha-bio-safety/functions/api/inspections/records/[recordId].ts</files>
  <action>
Create exactly three NEW files under `cha-bio-safety/`. Modify zero existing files. The contents
are LOCKED — write them verbatim. Do not refactor, rename, reorder, or "improve" them. The bodies
were confirmed against the frontend contract (resolution_memo / resolution_photo_key / materials_used)
and the shape of the 36 historically-resolved records.

CRITICAL — import depths differ between the nested handlers and the bracket-leaf delete handler:
- resolve.ts and unresolve.ts live in `records/[recordId]/` → climb 4 dirs ([recordId] → records →
  inspections → api) → `import type { Env } from '../../../../_middleware'`
- the delete handler is `records/[recordId].ts` (one level shallower, leaf bracket file) → climb 3
  dirs (records → inspections → api) → `import type { Env } from '../../../_middleware'`
Getting this wrong is a silent tsc failure — verify the `../` count per file after writing.

Auth/data-integrity gates (per CLAUDE.md 데이터 무결성 원칙 — 점검 기록 삭제/조치 취소는 admin 예외만):
- resolve: any logged-in staff (no role gate); requires non-empty resolution_memo.
- unresolve: `role !== 'admin'` → 403 "관리자만 조치를 취소할 수 있습니다".
- delete: `role !== 'admin'` → 403 "관리자만 점검 기록을 삭제할 수 있습니다".

File 1 — `cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts`:
import type { Env } from '../../../../_middleware'

// POST /api/inspections/records/:recordId/resolve — 불량/주의 조치 완료 (로그인 전체 스태프)
export const onRequestPost: PagesFunction&lt;Env&gt; = async ({ params, request, env, data }) =&gt; {
  const { recordId } = params as { recordId: string }
  const { staffId } = data as any
  try {
    const body = await request.json&lt;{
      resolution_memo?: string
      resolution_photo_key?: string | null
      materials_used?: string | null
    }&gt;()

    if (!body.resolution_memo || !body.resolution_memo.trim()) {
      return Response.json({ success: false, error: '조치 내용이 필요합니다' }, { status: 400 })
    }

    const rec = await env.DB.prepare(
      'SELECT id FROM check_records WHERE id=? LIMIT 1'
    ).bind(recordId).first&lt;{ id: string }&gt;()
    if (!rec) {
      return Response.json({ success: false, error: '기록 없음' }, { status: 404 })
    }

    await env.DB.prepare(
      `UPDATE check_records
          SET status='resolved',
              resolution_memo=?,
              resolution_photo_key=?,
              materials_used=?,
              resolved_at=datetime('now','+9 hours'),
              resolved_by=?
        WHERE id=?`
    ).bind(
      body.resolution_memo.trim(),
      body.resolution_photo_key ?? null,
      body.materials_used ?? null,
      staffId,
      recordId
    ).run()

    return Response.json({ success: true, data: { id: recordId } })
  } catch (e: any) {
    console.error('record resolve error:', e)
    return Response.json({ success: false, error: e.message ?? '조치 처리 실패' }, { status: 500 })
  }
}

File 2 — `cha-bio-safety/functions/api/inspections/records/[recordId]/unresolve.ts`:
import type { Env } from '../../../../_middleware'

// POST /api/inspections/records/:recordId/unresolve — 조치 취소 (관리자 전용)
export const onRequestPost: PagesFunction&lt;Env&gt; = async ({ params, env, data }) =&gt; {
  const { recordId } = params as { recordId: string }
  const { role } = data as any

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 조치를 취소할 수 있습니다' }, { status: 403 })
  }

  try {
    const rec = await env.DB.prepare(
      'SELECT id FROM check_records WHERE id=? LIMIT 1'
    ).bind(recordId).first&lt;{ id: string }&gt;()
    if (!rec) {
      return Response.json({ success: false, error: '기록 없음' }, { status: 404 })
    }

    await env.DB.prepare(
      `UPDATE check_records
          SET status='open',
              resolution_memo=NULL,
              resolution_photo_key=NULL,
              materials_used=NULL,
              resolved_at=NULL,
              resolved_by=NULL
        WHERE id=?`
    ).bind(recordId).run()

    return Response.json({ success: true, data: { id: recordId } })
  } catch (e: any) {
    console.error('record unresolve error:', e)
    return Response.json({ success: false, error: e.message ?? '조치 취소 실패' }, { status: 500 })
  }
}

File 3 — `cha-bio-safety/functions/api/inspections/records/[recordId].ts` (NOTE: import depth is one level SHALLOWER — `../../../_middleware`):
import type { Env } from '../../../_middleware'

// DELETE /api/inspections/records/:recordId — 점검 기록 영구 삭제 (관리자 전용)
// 데이터 무결성 원칙(CLAUDE.md): 점검 기록 삭제는 admin 예외만 허용
export const onRequestDelete: PagesFunction&lt;Env&gt; = async ({ params, env, data }) =&gt; {
  const { recordId } = params as { recordId: string }
  const { role } = data as any

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 점검 기록을 삭제할 수 있습니다' }, { status: 403 })
  }

  try {
    const rec = await env.DB.prepare(
      'SELECT id FROM check_records WHERE id=? LIMIT 1'
    ).bind(recordId).first&lt;{ id: string }&gt;()
    if (!rec) {
      return Response.json({ success: false, error: '기록 없음' }, { status: 404 })
    }

    await env.DB.prepare('DELETE FROM check_records WHERE id=?').bind(recordId).run()

    return Response.json({ success: true })
  } catch (e: any) {
    console.error('record delete error:', e)
    return Response.json({ success: false, error: e.message ?? '삭제 실패' }, { status: 500 })
  }
}

Routing note (no conflict — this is expected and verified): the existing file
`functions/api/inspections/records.ts` (GET list) and the new `records/` directory coexist on
disk. Cloudflare Pages routes `/api/inspections/records` → records.ts,
`/api/inspections/records/:id` → records/[recordId].ts, and
`/api/inspections/records/:id/resolve` → records/[recordId]/resolve.ts independently. Do NOT
delete or move records.ts.

After writing the three files, stage and commit ATOMICALLY (this is the whole point of the
hotfix — these files were never committed before). Commit message subject MUST be ASCII:
`fix(260609-cjx): restore record resolve/unresolve/delete API handlers (lost in clone)`

DEPLOYMENT IS OUT OF SCOPE for the executor: do NOT run `wrangler`, `npm run deploy`, or any
Cloudflare deploy. Running `tsc` / `npm run build` for verification is allowed and required.
Stay on the current `production` branch — do not checkout, branch, or use worktrees.
  </action>
  <verify>
    <automated>test -f "cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts" && test -f "cha-bio-safety/functions/api/inspections/records/[recordId]/unresolve.ts" && test -f "cha-bio-safety/functions/api/inspections/records/[recordId].ts" && echo FILES_OK</automated>
    <automated>grep -q "from '../../../../_middleware'" "cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts" && grep -q "from '../../../../_middleware'" "cha-bio-safety/functions/api/inspections/records/[recordId]/unresolve.ts" && grep -q "from '../../../_middleware'" "cha-bio-safety/functions/api/inspections/records/[recordId].ts" && echo IMPORT_DEPTHS_OK</automated>
    <automated>ls cha-bio-safety/functions/api/inspections/ | grep -qx 'records.ts' && test -d cha-bio-safety/functions/api/inspections/records && echo COEXIST_OK</automated>
    <automated>grep -q "role !== 'admin'" "cha-bio-safety/functions/api/inspections/records/[recordId]/unresolve.ts" && grep -q "role !== 'admin'" "cha-bio-safety/functions/api/inspections/records/[recordId].ts" && echo ADMIN_GATES_OK</automated>
    <automated>cd cha-bio-safety && npx tsc --noEmit && echo TSC_OK</automated>
    <automated>cd cha-bio-safety && npm run build && echo BUILD_OK</automated>
  </verify>
  <done>
    All three handler files exist with correct per-file import depths; records.ts and records/
    coexist; unresolve and delete enforce the admin gate; resolve has no role gate; `npx tsc
    --noEmit` and `npm run build` both PASS; the three new files are committed atomically with the
    ASCII subject. No existing file modified, no deploy performed.
  </done>
</task>

</tasks>

<verification>
- Three new files present at the exact paths above; zero existing files changed (`git status` shows
  only the 3 additions + this plan/summary doc).
- Import depths: resolve.ts / unresolve.ts use `../../../../_middleware`; [recordId].ts uses
  `../../../_middleware`.
- `records.ts` (file) and `records/` (dir) coexist under `functions/api/inspections/`.
- `npx tsc --noEmit` PASS and `npm run build` PASS in `cha-bio-safety/`.
- New files committed (ASCII subject) so a future clone cannot drop them.
</verification>

<success_criteria>
- resolve / unresolve / delete routes resolve to real handlers (directory now exists).
- Admin-only gates enforced on unresolve and delete; resolve open to all logged-in staff.
- Type-check and build green.
- Files committed atomically — re-clone safe.
</success_criteria>

<out_of_scope>
Handled by the orchestrator (main), NOT the executor:
- Actual production deploy (wrangler / npm run deploy) — production console + subagent prod deploy
  forbidden.
- `.planning/production-sync.md` and `.planning/STATE.md` updates.
- Recovery / re-application of the 3 affected data records that failed while routes were down.
</out_of_scope>

<output>
Create `.planning/quick/260609-cjx-restore-record-resolve-handlers/260609-cjx-SUMMARY.md` when done.
</output>

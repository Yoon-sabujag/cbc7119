# Plan 21-06 Summary — Production Deploy + Human UAT

**Status:** Complete
**Date:** 2026-04-09

## Outcome

Phase 21 deployed to production, UAT completed with user approval. Mid-UAT the user requested three scope additions which were implemented, redeployed, and retested inline:

1. **`.pptx` support** — added to backend whitelist and frontend form (allowed list, `EXT_TO_MIME`, `accept` attribute, error toasts, hint text)
2. **500MB upload cap** — raised from 200MB because user's 소방훈련자료 is ~250MB (backend `MAX_DOC_SIZE`, frontend `MAX_SIZE`, error message, hint text)
3. **Admin document delete** — soft-delete D1 + hard-delete R2 via new `DELETE /api/documents/{id}` endpoint; trash button added to hero card + history rows (admin only)

## Deploy History

| # | Scope | Deploy URL | Commit |
|---|-------|------------|--------|
| 1 | Initial Phase 21 | https://d29651ad.cbc7119.pages.dev | 4b9e7a5 |
| 2 | +.pptx | https://fbd55151.cbc7119.pages.dev | 295f947 |
| 3 | +.pptx hint text | https://b43f1a53.cbc7119.pages.dev | e9850cd |
| 4 | 500MB cap | https://d387d4dd.cbc7119.pages.dev | 96f1905 |
| 5 | Admin delete + smoke test cleanup | https://59a8fd89.cbc7119.pages.dev | 4254b99 |

All deploys used `--branch production` (memory: deploy branch flag enforced).

## Smoke Test Cleanup

The Phase 20 verification smoke test document (`id=1`, `smoke-test.pdf`, 소방계획서 2026) was removed:
- D1: `deleted_at` set via direct wrangler command
- R2: `documents/plan/2026/ZREQdogaySV4meW8Uo7Pe_smoke-test.pdf` hard-deleted via wrangler

## UAT Result

User: **승인** (approved).

All 20 checklist items from Plan 21-06 / RESEARCH.md observable behavior map passed, including:
- Menu integration (mobile SideMenu + desktop DesktopSidebar, pre-existing menu_config forward-merge)
- Role gating (assistant sees no upload/delete; admin sees both)
- Upload flow (year dropdown, title auto-prefill, progress %+speed+ETA, list refresh on success)
- Download flow (iOS PWA Blob pattern, Korean filename preservation)
- History display (hero card + 과거 이력 list)
- Cancel/retry (multipart abort + form state preserved)
- Client validation (unsupported extension + oversize rejection)
- Security (assistant → 403 on direct API call)
- New: .pptx upload (250MB real 소방훈련자료 — production R2 multipart validated)
- New: Admin delete (hero card and history rows, assistant sees no button)

## Git Cleanup

Initial `git add -A` accidentally committed two executor worktree submodule references (`.claude/worktrees/agent-a4b834c3`, `.claude/worktrees/agent-af0d55c8`). Fixed via `git rm --cached` + root `.gitignore` (`.claude/worktrees/`, `.DS_Store`) + `git commit --amend`. Final commit hash: `4254b99`.

## Requirements Complete

- DOC-01: staff downloads latest 소방계획서 ✓
- DOC-02: admin uploads 소방계획서 ✓
- DOC-03: staff downloads past-year 소방계획서 ✓
- DOC-04: staff downloads latest 소방훈련자료 ✓
- DOC-05: admin uploads ~250MB 소방훈련자료 (real file, not synthetic) ✓
- DOC-06: staff downloads past-year 소방훈련자료 ✓

## Known Non-issues

- iOS PWA Blob download memory for files >300MB is best-effort (Phase 20 assumption A2); 500MB cap pushes past the tested envelope. If a user reports download failure on very large files we can add Service Worker streaming as a follow-up phase.

## Deviations from Plan

- Mid-UAT scope additions (.pptx, 500MB cap, admin delete) are outside the original Plan 21-06 scope. All three were small, user-requested, and validated in the same UAT session. Captured in plan 21-06-SUMMARY rather than spawning a new phase since they land on the same feature surface.
- File count: final production build's `DocumentsPage` chunk = 17.20 kB (under 20kB target from UI-SPEC).

## Next Phase

Phase 22 — 업무수행기록표 Form + Excel Output (last phase of v1.4 milestone).

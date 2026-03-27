---
phase: 02-stabilization-code-quality
plan: "03"
subsystem: build
tags: [dependencies, bundle-size, cleanup, vite]
dependency_graph:
  requires: []
  provides: [clean-package-json, optimized-bundle]
  affects: [cha-bio-safety/package.json, cha-bio-safety/vite.config.ts]
tech_stack:
  added: []
  patterns: [npm-uninstall, vite-manualChunks]
key_files:
  created: []
  modified:
    - cha-bio-safety/package.json
    - cha-bio-safety/package-lock.json
    - cha-bio-safety/vite.config.ts
decisions:
  - "Keep @types/qrcode — qrcode package is actively used in QRPrintPage.tsx"
  - "fflate added as direct dep (real Excel engine), xlsx-js-style removed (~400KB bundle reduction)"
  - "date-fns-tz removed alongside date-fns since date-fns is the parent and neither is used"
metrics:
  duration: "~1 min"
  completed: "2026-03-28"
  tasks_completed: 2
  files_changed: 3
requirements: [STAB-08]
---

# Phase 02 Plan 03: Unused Dependency Removal Summary

## One-liner

Removed xlsx-js-style (~400KB), lucide-react, date-fns, and date-fns-tz from package.json and cleaned up stale vite.config.ts manualChunks entries; build passes clean with 597 modules.

## What Was Done

### Task 1: Pre-removal source audit

Grepped all `src/` and `functions/` TypeScript/TSX files to confirm each package is unused before removal:

| Package | Search Pattern | Result | Decision |
|---------|---------------|--------|----------|
| xlsx-js-style | `xlsx-js-style\|XLSXStyle` | No imports (`.xlsx` references are fetch() calls to template files, not library imports) | Remove |
| lucide-react | `lucide-react\|from 'lucide` | No imports found | Remove |
| date-fns | `from 'date-fns` | No imports found | Remove |
| date-fns-tz | `from 'date-fns` | No imports found | Remove (companion to date-fns) |
| @types/qrcode | `from 'qrcode'` | Found in QRPrintPage.tsx:4 | Keep |

Key finding: `generateExcel.ts` references `.xlsx` via `fetch('/templates/...')` — these are template file URLs, not xlsx-js-style library imports. The actual Excel engine is `fflate` (added as explicit direct dependency in commit 2f4dae7).

### Task 2: Dependency removal and build verification

**Step 1 — npm uninstall (commit 2f4dae7, pre-plan):**
- `xlsx-js-style`, `lucide-react`, `date-fns`, `date-fns-tz` removed from package.json
- `fflate` added as explicit direct dependency (was transitive; now explicit)
- package.json and package-lock.json updated

**Step 2 — vite.config.ts cleanup (commit afb9f84):**
- Removed stale `vendor-icons` manualChunks entry for `lucide-react/`
- Removed stale `vendor-date` manualChunks entry for `date-fns`

**Step 3 — Build verification:**
- `npm run build` runs successfully: 597 modules transformed, exit code 0
- No TypeScript compilation errors
- No Rollup bundling errors
- `dist/index.html` present

**Step 4 — Bundle size result:**

| Chunk | Size (unminified) |
|-------|-------------------|
| vendor (misc) | 775 KB |
| vendor-qr | 358 KB |
| vendor-react | 217 KB |
| InspectionPage | 101 KB |

The ~400KB xlsx-js-style reduction is absorbed into the `vendor` chunk which no longer includes it. The absence of a `vendor-xlsx` chunk confirms removal.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing cleanup] vite.config.ts stale manualChunks entries**
- **Found during:** Task 2 review
- **Issue:** vite.config.ts retained `vendor-icons` (lucide-react) and `vendor-date` (date-fns) manualChunks entries after package removal. They were harmless (no matching modules), but represented dead configuration.
- **Fix:** Removed 8 lines covering the two stale chunk routing conditions
- **Files modified:** `cha-bio-safety/vite.config.ts`
- **Commit:** afb9f84

**Note:** The core dependency removal (package.json + package-lock.json) was already committed as 2f4dae7 before this plan executor ran. This plan executor verified the audit (Task 1) and completed the vite.config.ts cleanup (Task 2) that remained.

## Known Stubs

None — this was a pure cleanup/removal plan with no UI or data rendering changes.

## Self-Check: PASSED

- package.json: `grep "xlsx-js-style|lucide-react|date-fns"` returns nothing
- dist/index.html: exists
- Build: 597 modules, exit code 0, no TypeScript errors
- Commits: 2f4dae7 (dep removal), afb9f84 (vite.config cleanup)

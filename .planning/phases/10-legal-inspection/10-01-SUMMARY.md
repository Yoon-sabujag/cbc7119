---
phase: 10-legal-inspection
plan: "01"
subsystem: legal-inspection-backend
tags: [backend, db-migration, api, routing, typescript]
dependency_graph:
  requires: []
  provides: [legal-inspection-api, legal-inspection-types, legal-routing]
  affects: [src/App.tsx, src/components/SideMenu.tsx, src/utils/api.ts, src/types/index.ts]
tech_stack:
  added: []
  patterns: [cloudflare-pages-functions, d1-sqlite, camelcase-mapping, admin-role-guard, left-join-aggregation]
key_files:
  created:
    - cha-bio-safety/migrations/0038_legal_inspections.sql
    - cha-bio-safety/functions/api/legal/index.ts
    - cha-bio-safety/functions/api/legal/[id].ts
    - cha-bio-safety/functions/api/legal/[id]/findings/index.ts
    - cha-bio-safety/functions/api/legal/[id]/findings/[fid].ts
    - cha-bio-safety/functions/api/legal/[id]/findings/[fid]/resolve.ts
    - cha-bio-safety/src/pages/LegalPage.tsx
    - cha-bio-safety/src/pages/LegalFindingsPage.tsx
    - cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
  modified:
    - cha-bio-safety/src/types/index.ts
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/App.tsx
    - cha-bio-safety/src/components/SideMenu.tsx
    - cha-bio-safety/src/pages/StaffServicePage.tsx
decisions:
  - "Stub page components (LegalPage, LegalFindingsPage, LegalFindingDetailPage) created in 10-01 so build passes; full UI implementation deferred to 10-02"
  - "Middleware import paths corrected from plan's incorrect relative paths to actual resolved paths"
metrics:
  duration_seconds: 2140
  tasks_completed: 2
  tasks_total: 2
  files_created: 9
  files_modified: 5
  completed_date: "2026-04-02"
---

# Phase 10 Plan 01: Legal Inspection Backend + Wiring Summary

**One-liner:** D1 migration for legal_inspections/legal_findings tables, 5 REST API handlers with admin role-guards, TypeScript types, legalApi client, and App.tsx routing for /legal paths with SideMenu activation.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | DB 마이그레이션 + 타입 정의 + API 클라이언트 | 7ae6a4a | 0038_legal_inspections.sql, types/index.ts, utils/api.ts |
| 2 | API 엔드포인트 5파일 + App.tsx 라우팅 + SideMenu 활성화 | 578517f | functions/api/legal/*, App.tsx, SideMenu.tsx |

---

## What Was Built

### DB Migration (0038)
- `legal_inspections` table: inspection_type (comprehensive/functional), inspected_at, agency, result (pass/fail/conditional), report_file_key, memo, created_by
- `legal_findings` table: FK to legal_inspections, description, location, photo_key, resolution fields (memo, photo_key), status (open/resolved), resolved_at/by, created_by
- 2 indexes: idx_legal_findings_inspection_id, idx_legal_findings_status

### API Endpoints (5 files)
- `GET /api/legal` — list inspections with LEFT JOIN aggregation for findingCount/resolvedCount (N+1 prevented)
- `POST /api/legal` — create inspection, admin-only (role !== 'admin' → 403)
- `GET /api/legal/:id` + `PUT /api/legal/:id` — detail + partial update (admin only for PUT)
- `GET /api/legal/:id/findings` + `POST /api/legal/:id/findings` — list + create findings (all staff for POST)
- `GET/PUT /api/legal/:id/findings/:fid` — detail + update (admin only for PUT)
- `POST /api/legal/:id/findings/:fid/resolve` — mark resolved with 409 guard if already resolved

### Types (src/types/index.ts)
- `InspectionType`, `InspectionResult`, `FindingStatus` union types
- `LegalInspection` interface with findingCount/resolvedCount aggregated fields
- `LegalFinding` interface with full camelCase field mapping

### API Client (src/utils/api.ts)
- `legalApi` namespace with 8 methods: listInspections, createInspection, updateInspection, listFindings, createFinding, getFinding, updateFinding, resolveFinding

### App.tsx + SideMenu
- 3 lazy imports: LegalPage, LegalFindingsPage, LegalFindingDetailPage
- NO_NAV_PATHS: `/legal-inspection` replaced with `/legal`
- showNav: added `!location.pathname.match(/^\/legal\/.+/)` for sub-page nav hiding
- 3 routes: `/legal`, `/legal/:id`, `/legal/:id/finding/:fid`
- SideMenu 법적 점검: `soon: true` → `soon: false`

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Incorrect middleware import paths in API files**
- **Found during:** Task 2 build
- **Issue:** Plan specified incorrect relative paths for `_middleware` import (e.g., `'../../../_middleware'` for findings files). Actual paths based on `functions/` directory depth differed.
- **Fix:** Corrected to: `'../../_middleware'` for legal/index.ts and legal/[id].ts; `'../../../../_middleware'` for findings/index.ts and findings/[fid].ts; `'../../../../../_middleware'` for resolve.ts
- **Commit:** 578517f

**2. [Rule 1 - Bug] Missing useEffect import in StaffServicePage.tsx**
- **Found during:** Task 2 build (tsc error)
- **Issue:** `useEffect` used at line 146 but not imported from react
- **Fix:** Added `useEffect` to the existing import statement
- **Files modified:** src/pages/StaffServicePage.tsx
- **Commit:** 578517f

**3. [Rule 2 - Critical] Stub page components created for build to pass**
- **Found during:** Task 2 — App.tsx lazy imports reference pages that don't exist yet
- **Issue:** LegalPage, LegalFindingsPage, LegalFindingDetailPage not created until plan 10-02 (frontend)
- **Fix:** Created minimal stub components returning "준비 중입니다." placeholders
- **Files created:** src/pages/LegalPage.tsx, src/pages/LegalFindingsPage.tsx, src/pages/LegalFindingDetailPage.tsx
- **Commit:** 578517f

---

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| src/pages/LegalPage.tsx | Entire component is placeholder ("준비 중입니다.") | Full UI in plan 10-02 |
| src/pages/LegalFindingsPage.tsx | Entire component is placeholder | Full UI in plan 10-02 |
| src/pages/LegalFindingDetailPage.tsx | Entire component is placeholder | Full UI in plan 10-02 |

These stubs are intentional — plan 10-02 (LegalFindingDetailPage implementation) will replace them with full UI.

---

## Self-Check: PASSED

Files created/exist:
- cha-bio-safety/migrations/0038_legal_inspections.sql: FOUND
- cha-bio-safety/functions/api/legal/index.ts: FOUND
- cha-bio-safety/src/types/index.ts (LegalInspection): FOUND
- cha-bio-safety/src/utils/api.ts (legalApi): FOUND

Commits:
- 7ae6a4a: FOUND (feat(10-01): DB migration + types + legalApi client)
- 578517f: FOUND (feat(10-01): API endpoints + routing + SideMenu activation)

Build: PASSED (npm run build succeeded)

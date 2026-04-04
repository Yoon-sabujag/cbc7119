---
phase: 11-elevator-inspection-certs
plan: "01"
subsystem: elevator-inspection-certs
tags: [backend, db-migration, api, typescript-types]
dependency_graph:
  requires: []
  provides:
    - elevator_inspection_findings table (CRUD)
    - elevator_inspections.inspect_type + result columns
    - elevators.install_year column
    - /api/elevators/:elevatorId/inspections/:inspectionId/findings (GET, POST)
    - /api/elevators/:elevatorId/inspections/:inspectionId/findings/:fid/resolve (POST)
    - /api/elevators/next-inspection (GET)
    - elevatorInspectionApi (API client)
    - ElevatorInspectionFinding, ElevatorNextInspection, ElevatorInspectType types
  affects:
    - cha-bio-safety/functions/api/elevators/inspections.ts (POST accepts inspectType + result)
tech_stack:
  added: []
  patterns:
    - legal_findings pattern mirrored for elevator_inspection_findings
    - date-fns addMonths/differenceInDays in Cloudflare Pages Function
    - getCycleMonths helper: 25yr rule + type-based cycles per 승강기안전관리법 시행규칙 제54조
key_files:
  created:
    - cha-bio-safety/migrations/0040_elevator_inspection_certs.sql
    - cha-bio-safety/functions/api/elevators/[elevatorId]/inspections/[inspectionId]/findings/index.ts
    - cha-bio-safety/functions/api/elevators/[elevatorId]/inspections/[inspectionId]/findings/[fid]/resolve.ts
    - cha-bio-safety/functions/api/elevators/next-inspection.ts
  modified:
    - cha-bio-safety/src/types/index.ts
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/functions/api/elevators/inspections.ts
decisions:
  - "inspect_type kept separate from type='annual'/'monthly'; subtype for annual inspection classification"
  - "result column added alongside overall (backward compat); for annual: result = explicit pass/conditional/fail, overall mirrors result"
  - "next-inspection uses MAX(inspect_date) WHERE type='annual'; covers all annual subtypes (regular/special/detailed) per D-15"
  - "date-fns imported in Pages Function (bundled by wrangler/vite, not excluded)"
metrics:
  duration: "~4 minutes"
  completed_date: "2026-04-04"
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 3
---

# Phase 11 Plan 01: Elevator Inspection Certs — DB + Backend Summary

**One-liner:** D1 migration adding inspect_type/result/install_year + elevator_inspection_findings table, with findings CRUD API and next-inspection cycle calculator (12/24/6-month rules).

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | DB migration + TypeScript types | c02158d | migrations/0040, src/types/index.ts |
| 2 | Findings CRUD API + next-inspection API + API client | 77b14c8 | 3 new API files, inspections.ts, src/utils/api.ts |

---

## What Was Built

### Migration 0040

- `elevator_inspections.inspect_type` TEXT DEFAULT 'regular' CHECK('regular','special','detailed') — 검사 유형 (정기/수시/정밀안전)
- `elevator_inspections.result` TEXT CHECK('pass','conditional','fail') — 검사 결과 (합격/조건부합격/불합격)
- `elevators.install_year` INTEGER NULL — 설치연도 (25년 초과 시 6개월 주기 적용)
- `elevator_inspection_findings` table — legal_findings 패턴 동일 재현 (idx_elev_findings_inspection 인덱스 포함)

### TypeScript Types

- `ElevatorInspectType` union: 'regular' | 'special' | 'detailed'
- `ElevatorInspectionResult` union: 'pass' | 'conditional' | 'fail'
- `ElevatorFindingStatus` union: 'open' | 'resolved'
- `ElevatorInspectionFinding` interface — camelCase, mirrors LegalFinding exactly
- `ElevatorNextInspection` interface — per-elevator next date + status + daysUntil

### API Endpoints

- `GET /api/elevators/:elevatorId/inspections/:inspectionId/findings` — list findings ordered open-first
- `POST /api/elevators/:elevatorId/inspections/:inspectionId/findings` — create finding (all roles)
- `POST /api/elevators/:elevatorId/inspections/:inspectionId/findings/:fid/resolve` — resolve finding (all roles)
- `GET /api/elevators/next-inspection` — per-elevator next inspection dates with:
  - `getCycleMonths()`: passenger/escalator=12mo, cargo/dumbwaiter=24mo, install_year 25yr+=6mo
  - status: 'ok' | 'due_soon' (≤30 days) | 'overdue' | 'no_record'

### inspections.ts Update

POST handler now accepts `inspectType` and `result` fields. For annual records:
- `inspect_type` stored (default 'regular')
- `result` stored explicitly
- `overall` mirrors `result` for backward compatibility

### API Client

`elevatorInspectionApi` exported from `src/utils/api.ts`:
- `getFindings(elevatorId, inspectionId)`
- `createFinding(elevatorId, inspectionId, body)`
- `resolveFinding(elevatorId, inspectionId, fid, body)`
- `getNextInspection()`

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None — this plan is data layer only (no UI). No stubs in created files.

---

## Self-Check: PASSED

Files created/exist:
- FOUND: cha-bio-safety/migrations/0040_elevator_inspection_certs.sql
- FOUND: cha-bio-safety/functions/api/elevators/[elevatorId]/inspections/[inspectionId]/findings/index.ts
- FOUND: cha-bio-safety/functions/api/elevators/[elevatorId]/inspections/[inspectionId]/findings/[fid]/resolve.ts
- FOUND: cha-bio-safety/functions/api/elevators/next-inspection.ts

Commits:
- FOUND: c02158d (feat(11-01): DB migration + TypeScript types)
- FOUND: 77b14c8 (feat(11-01): findings CRUD API + next-inspection API + API client)

Build: PASSED (tsc + vite build, no TypeScript errors)

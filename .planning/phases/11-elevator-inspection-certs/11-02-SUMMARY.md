---
phase: 11-elevator-inspection-certs
plan: "02"
subsystem: elevator-inspection-ui
tags: [elevator, inspection, findings, cert-viewer, annual-tab]
dependency_graph:
  requires: ["11-01"]
  provides: [elevator-annual-tab-enhanced, elevator-finding-detail-page]
  affects: [ElevatorPage, App.tsx]
tech_stack:
  added: []
  patterns:
    - CertViewerModal (inline PDF/image via PdfFloorPlan)
    - FindingsPanel (conditional findings CRUD inside card)
    - FindingCountBadge (header badge with counts)
    - ElevatorFindingDetailPage (mirrors LegalFindingDetailPage)
key_files:
  created:
    - cha-bio-safety/src/pages/ElevatorFindingDetailPage.tsx
  modified:
    - cha-bio-safety/src/pages/ElevatorPage.tsx
    - cha-bio-safety/src/App.tsx
decisions:
  - "CertViewerModal uses PdfFloorPlan for PDFs and <img> for images; detect by key suffix"
  - "Admin-only upload guard: isAdmin check wraps the cert upload label"
  - "FindingsPanel fetches via elevatorInspectionApi.getFindings, enabled only when isConditional"
  - "ElevatorFindingDetailPage fetches all findings for inspection then finds by fid (no per-finding GET endpoint)"
  - "showNav exclusion via regex match /elevator/findings/.+ (mirrors /legal/.+ pattern)"
metrics:
  duration: "~22m"
  completed_date: "2026-04-04"
  tasks_completed: 2
  files_modified: 3
---

# Phase 11 Plan 02: Elevator Inspection UI Enhancement Summary

Enhanced ElevatorPage annual tab with inspect_type/result selectors, inline cert viewer (PDF+image), admin-only upload guard, and conditional findings panel; created ElevatorFindingDetailPage mirroring LegalFindingDetailPage.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Enhance ElevatorPage annual tab | 8c34cc6 | ElevatorPage.tsx |
| 2 | ElevatorFindingDetailPage + App.tsx routing | 01d66aa | ElevatorFindingDetailPage.tsx, App.tsx |

## What Was Built

### Task 1: ElevatorPage Annual Tab Enhancement

**Constants added:**
- `INSPECT_TYPE_LABEL`: maps regular/special/detailed to Korean labels
- `RESULT_STYLE`: maps pass/conditional/fail to bg/color/label with Korean text

**ElevatorInspection interface:** added `inspect_type?` and `result?` fields

**AnnualModal:** added 검사 유형 selector (3 buttons: 정기/수시/정밀안전, default 정기검사). Submit now includes `inspect_type` and `result` in POST body alongside existing `overall`.

**Annual card:**
- Shows inspect_type label and result colored badge (green/orange/red)
- FindingCountBadge shows "지적 N건 (미조치 M건)" when conditional
- CertViewerModal: inline cert viewer triggered by "인증서 보기" button
  - PDF: PdfFloorPlan component
  - Image: `<img>` with objectFit:contain
  - "새 탭 열기" link in header
  - Admin-only upload label (non-admins see nothing if no cert)
- FindingsPanel: shown when expanded AND result is conditional
  - Lists findings with description, location, status badge
  - Each finding navigates to /elevator/findings/:fid
  - "지적사항 등록" bottom sheet with description/location/photo fields

### Task 2: ElevatorFindingDetailPage + Routing

**ElevatorFindingDetailPage:**
- Route params: `fid` from useParams(), `eid`/`iid` from useSearchParams()
- Data: fetches all findings for inspection, finds by fid
- Sections: 지적 정보 (description, location, date, creator), 지적 사진, 조치 내용 (when open), 조치 결과 (when resolved)
- Resolve: all roles, memo required, optional photo via usePhotoUpload
- Fixed bottom CTA only shown when status=open

**App.tsx:**
- Lazy import `ElevatorFindingDetailPage`
- Route `/elevator/findings/:fid` in auth-protected group
- `showNav` exclusion regex for `/elevator/findings/.+`
- `/elevator/findings` added to NO_NAV_PATHS

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all data wired to real API endpoints (elevatorInspectionApi).

## Self-Check: PASSED

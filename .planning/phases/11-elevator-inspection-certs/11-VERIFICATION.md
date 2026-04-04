---
phase: 11-elevator-inspection-certs
verified: 2026-04-03T00:00:00+09:00
status: passed
score: 12/12 must-haves verified
re_verification: false
---

# Phase 11: Elevator Inspection Certs Verification Report

**Phase Goal:** 승강기 법정검사 인증서/리포트를 업로드하고 ElevatorPage에서 조회할 수 있다
**Verified:** 2026-04-03
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | elevator_inspections 테이블에 inspect_type, result 컬럼이 존재한다 | VERIFIED | `0040_elevator_inspection_certs.sql` lines 7-13: ALTER TABLE adds both columns with CHECK constraints |
| 2 | elevator_inspection_findings 테이블이 존재하고 CRUD API가 동작한다 | VERIFIED | Migration creates table; findings/index.ts exports `onRequestGet` + `onRequestPost`; resolve.ts exports `onRequestPost` with full D1 UPDATE logic |
| 3 | next-inspection API가 호기별 다음 검사일과 도래 상태를 반환한다 | VERIFIED | `next-inspection.ts` queries elevators LEFT JOIN elevator_inspections, calls `getCycleMonths()` + `addMonths()`/`differenceInDays()`, returns status: ok/due_soon/overdue/no_record |
| 4 | elevators 테이블에 install_year 컬럼이 존재한다 | VERIFIED | `0040_elevator_inspection_certs.sql` line 18: `ALTER TABLE elevators ADD COLUMN install_year INTEGER` |
| 5 | 관리자가 annual 탭에서 검사 유형(정기/수시/정밀안전)과 결과(합격/조건부/불합격)를 선택해 기록할 수 있다 | VERIFIED | ElevatorPage.tsx: `INSPECT_TYPE_LABEL` map (line 169), `RESULT_STYLE` map (line 174), `annualOverall` state (line 1315), `inspectType` state (line 1314), AnnualModal submit passes both to POST body (line 1380) |
| 6 | 관리자가 인증서를 업로드하면 인앱 뷰어(PDF/이미지)로 미리보기할 수 있다 | VERIFIED | `CertViewerModal` component (line 1393-1428): detects `.pdf` suffix → `PdfFloorPlan`; else → `<img>`; "새 탭 열기" link present; triggered by "인증서 보기" button (line 528) |
| 7 | 비관리자는 인증서 업로드 버튼이 보이지 않고 조회만 가능하다 | VERIFIED | ElevatorPage.tsx lines 444, 487, 534, 603: `isAdmin` guards all upload `<label>` elements; "인증서 보기" button shown to all roles when cert exists |
| 8 | 조건부합격 기록에서 지적사항을 등록하고 조치 완료할 수 있다 | VERIFIED | `FindingsPanel` enabled when `isConditional` (line 505); `elevatorInspectionApi.createFinding` called on submit (line 1462); findings list rendered with navigate to detail page |
| 9 | ElevatorFindingDetailPage에서 지적 상세 및 조치 기록을 확인할 수 있다 | VERIFIED | `ElevatorFindingDetailPage.tsx`: full detail section (description, location, dates, creator), resolve form with memo + photo (line 74), resolved state shows resolutionMemo + resolutionPhotoKey |
| 10 | 승강기 목록 탭에서 검사 도래 30일 이내 호기에 경고 배지가 표시된다 | VERIFIED | ElevatorPage.tsx line 367: orange D-NN badge when `status === 'due_soon'`; `nextInspQuery` + `nextInspMap` present (lines 231-239) |
| 11 | 검사 초과 호기에 빨강 초과 배지가 표시된다 | VERIFIED | ElevatorPage.tsx line 374: `검사 초과` red badge when `status === 'overdue'` |
| 12 | 대시보드에 검사 도래/초과 건수가 표시된다 | VERIFIED | `DashboardStats.elevInspDueSoon` added to types; `dashboard/stats.ts` computes count via D1 query + JS loop (lines 191-216); DashboardPage renders badge at line 189 when count > 0 |

**Score:** 12/12 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `cha-bio-safety/migrations/0040_elevator_inspection_certs.sql` | Schema changes for inspect_type, result, install_year, elevator_inspection_findings | VERIFIED | All 4 schema changes present with correct CHECK constraints and index |
| `cha-bio-safety/functions/api/elevators/[elevatorId]/inspections/[inspectionId]/findings/index.ts` | GET list + POST create findings | VERIFIED | Both handlers present, real D1 queries, camelCase mapping, staff JOIN for names |
| `cha-bio-safety/functions/api/elevators/[elevatorId]/inspections/[inspectionId]/findings/[fid]/resolve.ts` | POST resolve finding | VERIFIED | UPDATE with status=resolved, resolved_at, resolved_by; idempotency check on current status |
| `cha-bio-safety/functions/api/elevators/next-inspection.ts` | GET next inspection dates per elevator | VERIFIED | getCycleMonths() helper, addMonths + differenceInDays from date-fns, correct status logic |
| `cha-bio-safety/src/types/index.ts` | ElevatorInspectType, ElevatorInspectionResult, ElevatorFindingStatus, ElevatorInspectionFinding, ElevatorNextInspection, DashboardStats.elevInspDueSoon | VERIFIED | All 6 type exports found; DashboardStats updated with elevInspDueSoon |
| `cha-bio-safety/src/utils/api.ts` | elevatorInspectionApi with 4 methods | VERIFIED | All methods present (getFindings, createFinding, resolveFinding, getNextInspection) with correct endpoint paths |
| `cha-bio-safety/src/pages/ElevatorPage.tsx` | Enhanced annual tab + list tab badges | VERIFIED | INSPECT_TYPE_LABEL, RESULT_STYLE, CertViewerModal, FindingsPanel, isAdmin guards, nextInspQuery, nextInspMap, D-day badges all present |
| `cha-bio-safety/src/pages/ElevatorFindingDetailPage.tsx` | Finding detail + resolve UI | VERIFIED | Full detail + resolve form, usePhotoUpload, useMutation calling resolveFinding, 4 display sections |
| `cha-bio-safety/src/App.tsx` | Route /elevator/findings/:fid | VERIFIED | Lazy import + protected route + NO_NAV_PATHS entry all present |
| `cha-bio-safety/functions/api/dashboard/stats.ts` | elevInspDueSoon count in stats response | VERIFIED | D1 query + JS cycle calculation loop, result included in returned stats object |
| `cha-bio-safety/src/pages/DashboardPage.tsx` | Warning badge for elevInspDueSoon | VERIFIED | Badge rendered at line 189 with conditional display |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/utils/api.ts` | `/api/elevators/next-inspection` | `elevatorInspectionApi.getNextInspection()` | WIRED | Line 275-276: `api.get<ElevatorNextInspection[]>('/elevators/next-inspection')` |
| `findings/index.ts` | `elevator_inspection_findings` | D1 query | WIRED | Line 10: SELECT from elevator_inspection_findings; line 94: INSERT INTO elevator_inspection_findings |
| `ElevatorPage.tsx` | `elevatorInspectionApi` | React Query useQuery/useMutation | WIRED | Lines 231, 1428, 1451, 1462: queries and mutations wired to real API calls |
| `ElevatorPage.tsx` | `PdfFloorPlan` | import + CertViewerModal | WIRED | Line 8: import, line 1412: used inside CertViewerModal |
| `ElevatorFindingDetailPage.tsx` | `elevatorInspectionApi.resolveFinding` | useMutation | WIRED | Line 74: resolveFinding called in mutationFn |
| `App.tsx` | `ElevatorFindingDetailPage` | lazy route | WIRED | Line 39: lazy import, line 132: Route element |
| `ElevatorPage.tsx` | `elevatorInspectionApi.getNextInspection` | useQuery in list tab | WIRED | Lines 231-239: nextInspQuery populated, nextInspMap used at line 346 |
| `dashboard/stats.ts` | `elevator_inspections + elevators` | SQL query for next inspection | WIRED | Lines 191-216: real D1 query + cycle calculation |
| `DashboardPage.tsx` | `elevInspDueSoon` | stats object field | WIRED | Lines 51, 189: consumed from stats and rendered |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `ElevatorPage.tsx` (list tab badges) | `nextInspQuery.data` | `elevatorInspectionApi.getNextInspection()` → `GET /api/elevators/next-inspection` → D1 query with LEFT JOIN | Yes — live DB rows | FLOWING |
| `ElevatorPage.tsx` (findings panel) | `findingsQuery.data` | `elevatorInspectionApi.getFindings()` → `GET /api/elevators/:eid/inspections/:iid/findings` → D1 SELECT with staff JOIN | Yes — live DB rows | FLOWING |
| `ElevatorFindingDetailPage.tsx` | `findings` → `finding` | `elevatorInspectionApi.getFindings(eid, iid)` → same D1 query above | Yes — live DB rows | FLOWING |
| `DashboardPage.tsx` (elevInspDueSoon) | `stats.elevInspDueSoon` | `dashboard/stats.ts` → D1 query + JS loop (lines 191-216) | Yes — live DB computation | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: SKIPPED — API endpoints require Cloudflare Workers runtime (D1 binding); cannot test without running `wrangler dev`. TypeScript build passes cleanly as proxy for correctness.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| ELEV-02 | 11-01, 11-02, 11-03 | 승강기 법정검사 인증서/리포트를 업로드하고 조회할 수 있다 (R2) | SATISFIED | Upload: admin-only `<label>` on cert_key field in inspections.ts POST + ElevatorPage upload UI; View: CertViewerModal with PDF (PdfFloorPlan) + image inline display + new-tab link; Findings: full CRUD lifecycle via findings API + ElevatorFindingDetailPage |

No orphaned requirements — REQUIREMENTS.md line 110 maps ELEV-02 to Phase 11 with status "Complete".

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | — |

All files scanned: migrations/0040, findings/index.ts, resolve.ts, next-inspection.ts, ElevatorPage.tsx, ElevatorFindingDetailPage.tsx, stats.ts, DashboardPage.tsx. No TODOs, FIXME, placeholders, empty handlers, or disconnected data flows detected.

---

### Human Verification Required

#### 1. Cert Upload → Viewer Round-Trip

**Test:** Log in as admin. Navigate to an elevator's annual inspection. Upload a PDF cert. Confirm "인증서 보기" button appears. Tap it. Confirm PDF renders inline via PdfFloorPlan canvas. Tap "새 탭 열기" — confirm it opens in new browser tab.
**Expected:** PDF renders without blank pages; new tab shows the file.
**Why human:** R2 upload path and PdfFloorPlan canvas rendering require live runtime.

#### 2. Non-Admin Upload Guard

**Test:** Log in as a non-admin (assistant). Navigate to annual inspection card that has no cert.
**Expected:** No upload button visible at all. For a card with an existing cert, "인증서 보기" button is visible.
**Why human:** Role-based UI gating requires a real auth session.

#### 3. Conditional Findings CRUD Flow

**Test:** Record an annual inspection with result "조건부합격". Confirm "조건부합격 지적사항" panel appears. Register a finding with description + optional photo. Confirm it appears in the list. Tap to navigate to ElevatorFindingDetailPage. Fill in resolve memo and submit.
**Expected:** Finding status changes to "조치완료" and badge updates. Count badge in card header decrements.
**Why human:** Multi-step form flow and cache invalidation require live interaction.

#### 4. Dashboard Badge Appearance

**Test:** In a test state where at least one elevator has no inspection record or has a next inspection within 30 days.
**Expected:** Orange "검사도래 N" badge appears below the 오늘 현황 grid on DashboardPage.
**Why human:** Requires specific DB state to trigger the badge.

---

### Gaps Summary

No gaps. All 12 observable truths are verified against the actual codebase. All artifacts exist, are substantive, are wired, and have real data flowing. The TypeScript build passes. All 6 commits documented in the SUMMARYs are verified present in git history. ELEV-02 is fully satisfied.

---

_Verified: 2026-04-03_
_Verifier: Claude (gsd-verifier)_

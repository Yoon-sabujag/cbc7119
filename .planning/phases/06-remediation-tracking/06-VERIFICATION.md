---
phase: 06-remediation-tracking
verified: 2026-04-01T00:00:00Z
status: human_needed
score: 13/13 must-haves verified
re_verification: false
human_verification:
  - test: "Open app on mobile, navigate to 조치 tab. Verify list card shows category, 동->층 location (e.g. '사무동 B2층'), memo preview, date, status chip (미조치/완료), and result badge (불량/주의)."
    expected: "Cards render with all required fields and correct color coding"
    why_human: "Visual layout and CSS variable rendering cannot be verified programmatically"
  - test: "Test all three filter dimensions: status tabs (전체/미조치/완료), category dropdown, period buttons (7일/30일/90일/전체). Also verify navigating to detail and pressing back preserves the active filter tab."
    expected: "Each filter changes the list; back navigation restores the tab state via URL searchParams"
    why_human: "Filter interaction and URL state preservation require live browser testing"
  - test: "Tap a card to enter detail page. Verify: BottomNav is hidden, self-contained header shows '조치 상세' with back arrow, sections 점검 정보 / 점검 기록 / 조치 내용 입력 are all present for an open item."
    expected: "Detail page layout matches spec; BottomNav absent"
    why_human: "DOM visibility and layout require visual inspection"
  - test: "On an open item, leave memo blank and tap '조치 완료'. Then enter memo text, optionally attach a photo, and submit."
    expected: "Empty submit shows toast '조치 내용을 입력하세요'. Valid submit shows toast '조치 완료', navigates back to list, and item now shows '완료' status."
    why_human: "Toast notifications, navigation, and status change require end-to-end interaction"
  - test: "Check BottomNav remediation tab badge and SideMenu '조치 관리' badge count."
    expected: "Both badges show the same live unresolved count (red, 99+ cap). Badge disappears when count reaches 0."
    why_human: "Badge rendering with live data requires visual confirmation on device"
---

# Phase 06: Remediation Tracking Verification Report

**Phase Goal:** 점검에서 불량/주의 판정된 개소의 조치 진행 상황을 기록하고 추적할 수 있다
**Verified:** 2026-04-01
**Status:** human_needed — all automated checks passed, 5 items require visual/interaction verification
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | usePhotoUpload and PhotoButton are importable from shared modules | VERIFIED | `src/hooks/usePhotoUpload.ts` exports `usePhotoUpload`; `src/components/PhotoButton.tsx` exports `PhotoButton`; InspectionPage imports both |
| 2 | InspectionPage still functions identically after extraction | VERIFIED | No local `function usePhotoUpload` or `function PhotoButton` in InspectionPage.tsx; 14 usages of the imports found; `npx tsc --noEmit` exits 0 |
| 3 | GET /api/remediation returns bad/caution records with filters applied | VERIFIED | `functions/api/remediation/index.ts` builds dynamic WHERE clause covering status/category/days filters with NULL-safe open handling (Pitfall 4) and real D1 query |
| 4 | GET /api/remediation/:recordId returns a single record with all fields | VERIFIED | `functions/api/remediation/[recordId].ts` queries D1 with JOIN to check_points + staff, returns 404 with `기록 없음` when missing |
| 5 | remediationApi.list() and remediationApi.get() are callable from frontend | VERIFIED | `src/utils/api.ts` exports `remediationApi` at line 45; `RemediationRecord` interface defined in `src/types/index.ts` |
| 6 | User sees list of bad/caution records with category, location, date, memo preview, status chip | VERIFIED (code) | RemediationPage.tsx 235 lines renders all card fields; uses `remediationApi.list()` via React Query; human visual check needed |
| 7 | User can filter by status tab, category dropdown, and period buttons | VERIFIED (code) | Status tabs `all/open/resolved` via useSearchParams; category `<select>` from API categories; period buttons `7/30/90/0` drive queryKey |
| 8 | User can tap a card to navigate to detail page at /remediation/:recordId | VERIFIED | `onClick={() => navigate('/remediation/' + record.id)}` on each card; route registered in App.tsx line 122 |
| 9 | Detail page shows inspection info, memo+photo, and resolve form or resolution info | VERIFIED (code) | RemediationDetailPage.tsx 258 lines implements all 4 sections conditionally on `record.status`; human visual check needed |
| 10 | User can submit resolve with required memo and optional photo, sees toast, returns to list | VERIFIED (code) | `handleResolve` validates memo, uploads photo if present, POSTs to resolve endpoint, shows toast, calls `navigate(-1)`; human interaction check needed |
| 11 | BottomNav shows live unresolved count badge on remediation tab | VERIFIED (code) | `unresolvedCount` prop wired from Layout dashboard query; badge renders with `99+` cap; human visual check needed |
| 12 | SideMenu shows live unresolved count badge on 조치 관리 item | VERIFIED (code) | `badgeCount = item.path === '/remediation' ? unresolvedCount : item.badge` replaces hardcoded 0; human visual check needed |
| 13 | BottomNav is hidden on /remediation/:recordId detail page | VERIFIED | `showNav` in App.tsx uses `!location.pathname.match(/^\/remediation\/.+/)` — detail sub-routes excluded; list page at `/remediation` still shows nav |

**Score:** 13/13 truths verified (8 fully automated, 5 require human visual/interaction confirmation)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/hooks/usePhotoUpload.ts` | Shared photo upload hook | VERIFIED | 55 lines, exports `usePhotoUpload`, full implementation with compress/upload/preview |
| `src/components/PhotoButton.tsx` | Shared photo button component | VERIFIED | 21 lines, exports `PhotoButton`, `aria-label="사진 제거"` present |
| `functions/api/remediation/index.ts` | GET /api/remediation list endpoint | VERIFIED | 84 lines, exports `onRequestGet`, real D1 query, dynamic WHERE, camelCase mapping |
| `functions/api/remediation/[recordId].ts` | GET /api/remediation/:recordId detail endpoint | VERIFIED | 52 lines, exports `onRequestGet`, 404 handling, staff name JOIN |
| `src/pages/RemediationPage.tsx` | Full remediation list view (min 100 lines) | VERIFIED | 235 lines, all filter controls, card list, empty/loading/error states |
| `src/pages/RemediationDetailPage.tsx` | Detail view with resolve form (min 100 lines) | VERIFIED | 258 lines, all 4 sections, handleResolve with cache invalidation |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `InspectionPage.tsx` | `src/hooks/usePhotoUpload.ts` | `import { usePhotoUpload }` | WIRED | Line 7; used 7 times in component |
| `src/utils/api.ts` | `/api/remediation` | `remediationApi.list and remediationApi.get` | WIRED | Lines 45-57; both methods present and typed |
| `RemediationPage.tsx` | `/api/remediation` | `remediationApi.list()` through React Query | WIRED | Line 33 — `remediationApi.list({...})` in queryFn |
| `RemediationDetailPage.tsx` | `/api/remediation/:recordId` | `remediationApi.get()` through React Query | WIRED | Line 44 — `remediationApi.get(recordId!)` in queryFn |
| `RemediationDetailPage.tsx` | `/api/inspections/records/:recordId/resolve` | `api.post()` for resolve submission | WIRED | Line 57 — `api.post('/inspections/records/' + recordId + '/resolve', {...})` |
| `App.tsx` | `BottomNav.tsx` | `unresolvedCount` prop from Layout dashboard query | WIRED | Line 137 — `<BottomNav unresolvedCount={unresolvedCount} />` |
| `App.tsx` | `SideMenu.tsx` | `unresolvedCount` prop from Layout dashboard query | WIRED | Line 110 — `<SideMenu ... unresolvedCount={unresolvedCount} />` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `RemediationPage.tsx` | `records` (array) | `remediationApi.list()` → `GET /api/remediation` → D1 `check_records` JOIN `check_points` JOIN `staff` | Yes — real DB query with dynamic WHERE | FLOWING |
| `RemediationDetailPage.tsx` | `record` (object) | `remediationApi.get()` → `GET /api/remediation/:recordId` → D1 `check_records` JOIN with staff double-JOIN | Yes — real DB query, 404 on missing | FLOWING |
| `BottomNav.tsx` (badge) | `unresolvedCount` | `dashboardApi.getStats()` → `GET /api/dashboard/stats` → D1 `COUNT(*)` query on `check_records` WHERE bad/caution/open | Yes — `functions/api/dashboard/stats.ts` line 74-79 | FLOWING |
| `SideMenu.tsx` (badge) | `unresolvedCount` | Same as BottomNav — same React Query key `['dashboard']`, deduplicated | Yes — same source | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: SKIPPED for API routes (no running server). TypeScript compile check used as proxy.

| Check | Command | Result | Status |
|-------|---------|--------|--------|
| TypeScript compilation | `npx tsc --noEmit` | Exit 0, no output | PASS |
| `onRequestGet` exported from list endpoint | `grep "onRequestGet" functions/api/remediation/index.ts` | Match found | PASS |
| NULL status handled in WHERE clause | `grep "status IS NULL OR status"` | Match in index.ts line 18 | PASS |
| `onRequestGet` exported from detail endpoint | `grep "onRequestGet" functions/api/remediation/[recordId].ts` | Match found | PASS |
| 404 handling in detail endpoint | `grep "기록 없음"` | Match at line 24 | PASS |
| remediationApi client exported | `grep "remediationApi" src/utils/api.ts` | Match at line 45 | PASS |
| RemediationRecord type defined | `grep "RemediationRecord" src/types/index.ts` | Match at line 26 | PASS |
| Detail page cache invalidates dashboard | `grep "invalidateQueries.*dashboard"` | Match at line 63 | PASS |
| Resolve endpoint exists and writes to DB | `grep "SET status='resolved'"` in resolve.ts | Match — full UPDATE query | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| REM-01 | 06-01, 06-02 | 불량/주의 판정된 점검 개소를 목록으로 조회할 수 있다 | SATISFIED | RemediationPage.tsx renders records from GET /api/remediation backed by real D1 query |
| REM-02 | 06-02 | 각 항목에 조치 메모를 작성하고 상태를 변경할 수 있다 | SATISFIED | RemediationDetailPage resolve form with required memo textarea; POSTs to resolve endpoint which sets `status='resolved'` in D1 |
| REM-03 | 06-01, 06-02 | 조치 전/후 사진을 첨부할 수 있다 (R2) | SATISFIED | Inspection photo displayed via `record.photoKey`; resolution photo uploaded via `usePhotoUpload` hook using R2-backed `/api/uploads` and stored as `resolution_photo_key` |
| REM-04 | 06-02 | 카테고리/상태/기간별로 필터링/검색할 수 있다 | SATISFIED | Three independent filter dimensions in RemediationPage: status tabs (전체/미조치/완료), category dropdown (dynamic from DB), period buttons (7/30/90/전체=0) |

No orphaned requirements — all 4 REM requirements claimed by plans and verified.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

Scan covered all 6 key files. The `placeholder` match at `RemediationDetailPage.tsx:199` is the textarea placeholder attribute (user-visible label text), not a code stub.

---

### Notable Deviations (Non-Blocking)

**navigate(-1) vs navigate('/remediation'):** The detail page uses `navigate(-1)` (browser history back) instead of `navigate('/remediation')` as originally specified. The SUMMARY documents this as an intentional fix to preserve URL searchParams tab state on back navigation — this is superior behavior, not a defect.

**date-fns not installed:** Plan specified `import { format } from 'date-fns'` but the package is absent. Both pages use an inline `fmtDate()` helper consistent with DashboardPage.tsx pattern. TypeScript compiles clean.

---

### Human Verification Required

#### 1. Remediation Card List Visual Layout

**Test:** Open app on mobile, navigate to 조치 tab. Inspect each card.
**Expected:** Each card shows category name (bold), result badge (불량=red / 주의=amber), 동->층 location (e.g. "사무동 B2층"), 개소명 appended after "·", memo first line or "메모 없음", date, and status chip (미조치=orange / 완료=green).
**Why human:** CSS variable rendering and visual hierarchy cannot be verified programmatically.

#### 2. Filter Controls and Tab State Preservation

**Test:** Use each filter dimension independently. Then navigate to a card detail and press back.
**Expected:** Status tab, category dropdown, and period button each independently change the list. Back navigation restores the active status tab (URL searchParams preserved).
**Why human:** React state and URL searchParams behavior require live browser interaction.

#### 3. Detail Page Layout and BottomNav Absence

**Test:** Tap any card. Check detail page layout and navigation chrome.
**Expected:** BottomNav is completely absent. Self-contained 48px header shows back arrow (left) and "조치 상세" (center). For open items: 4 sections visible. For resolved items: "조치 완료" section visible, resolve form hidden.
**Why human:** DOM visibility and conditional section rendering require visual inspection.

#### 4. Resolve Submission End-to-End

**Test:** On an open item: (a) tap "조치 완료" with empty memo — should show error toast. (b) enter memo text, optionally attach gallery photo, tap "조치 완료".
**Expected:** (a) Toast "조치 내용을 입력하세요". (b) Toast "조치 완료", navigate back to list, item now shows "완료" chip.
**Why human:** Toast display, navigation, and live status change require end-to-end interaction.

#### 5. Live Badge Counts

**Test:** Check BottomNav 조치 tab icon and SideMenu "조치 관리" item.
**Expected:** Both show identical red badge with current unresolved count. Badge shows "99+" when count exceeds 99. Badge absent when count is 0.
**Why human:** Live badge rendering with real data from dashboard API requires visual confirmation.

---

### Gaps Summary

No gaps. All 13 observable truths verified at the code level. All 6 required artifacts exist, are substantive, and are wired to real data sources. All 4 requirement IDs satisfied. TypeScript compiles clean. Five items require human visual/interaction confirmation before the phase can be considered fully closed — these are all UX/visual behaviors that cannot be verified programmatically.

---

_Verified: 2026-04-01_
_Verifier: Claude (gsd-verifier)_

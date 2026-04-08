# Milestones

## v1.3 설정 페이지 (Shipped: 2026-04-08)

**Phases completed:** 8 phases, 14 plans, 21 tasks

**Key accomplishments:**

- One-liner:
- One-liner:
- One-liner:
- One-liner:
- Admin-only bulk ZIP download added to LegalFindingsPage: fflate client-side ZIP with finding-NNN_위치/내용.txt + photos structure, opened via window.open for iOS PWA compatibility — production verified.
- SettingsPage with profile name edit, migrated password change form, notification/display placeholders, and logout — backed by PUT /api/auth/profile and authStore.updateStaff
- SettingsPage wired at /settings via lazy route, SettingsPanel removed, navigation updated in SideMenu and DesktopSidebar, deployed to production
- D1 Schema
- Task 1: pushApi namespace in api.ts
- Files created:
- One-liner:
- One-liner:
- One-liner:
- One-liner:

---

## v1.1 UI 재편 + 기능 확장 (Shipped: 2026-04-05)

**Phases completed:** 11 phases, 15 plans, 23 tasks

**Key accomplishments:**

- One-liner:
- One-liner:
- 1. [Rule 1 - Bug] Corrected _middleware import path in [recordId].ts
- One-liner:
- One-liner:
- 1. [Rule 3 - Blocking] Replaced lucide-react with inline SVGs
- Migration `0035_meal_records.sql`:
- React calendar page with optimistic tap-cycle meal tracking, 4-stat summary cards, and month navigation wired to mealApi + leaveApi + shiftCalc
- education_records D1 table, three CRUD endpoints with admin-or-self auth, TypeScript contracts, API client, and /education route wired into SideMenu
- 1. [Rule 3 - Blocking] date-fns not installed
- migration 0038 + 5 API handlers rewritten for schedule_items schema + LegalRound/LegalFinding types + legalApi client with api.patch
- Three legal inspection pages with round list + status filter, finding registration BottomSheet, admin result panel, and resolution flow with photo upload — all 12 verification steps confirmed by user
- One-liner:
- Constants added:
- One-liner:

---

## v1.0 Completion: Bug Fixes, Excel Reports, Schedule Linkage (Shipped: 2026-03-30)

**Phases completed:** 4 phases, 13 plans, 26 tasks

**Key accomplishments:**

- Rollup manualChunks splitting added to vite.config.ts and Cloudflare Pages _headers file created to prevent service worker cache poisoning on iOS 16.3.1+, Android 15+, and PC
- One-liner:
- Step 1 — npm uninstall (commit 2f4dae7, pre-plan):
- One-liner:
- Found during:
- D1 daily_notes table, two migrations, holidays-kr installed, dual API endpoints for daily log data + notes CRUD, xlsx template extracted, and /daily-report route wired with SideMenu navigation
- Full DailyReportPage with date navigation, mode toggle, notes save/load, preview card, and Excel download — both single-day (방재업무일지) and monthly-cumulative (일일업무일지) with auto-filled personnel status, patrol assignments, and schedule-based task entries
- Dashboard inspection completion auto-linked to check_records via D-20 date-range JOIN, with green tint + checkmark indicators and non-inspect manual completion button

---

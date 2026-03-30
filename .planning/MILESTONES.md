# Milestones

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

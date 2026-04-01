---
phase: 05-navigation-restructuring
plan: "02"
subsystem: navigation
tags: [navigation, side-menu, dashboard, elevator, inspection, header-cleanup]
dependency_graph:
  requires: [GlobalHeader, Layout-level-SideMenu-mount (05-01)]
  provides: [4-section-SideMenu, pages-without-individual-SideMenu]
  affects: [SideMenu.tsx, DashboardPage.tsx, ElevatorPage.tsx, InspectionPage.tsx]
tech_stack:
  added: []
  patterns: [soon-disabled-items, 4-section-menu, layout-level-navigation-only]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/components/SideMenu.tsx
    - cha-bio-safety/src/pages/DashboardPage.tsx
    - cha-bio-safety/src/pages/ElevatorPage.tsx
    - cha-bio-safety/src/pages/InspectionPage.tsx
decisions:
  - "SideMenu MENU restructured to 4 sections (주요 기능, 점검 관리, 근무·복지, 시스템) with soon:boolean flag for disabled items"
  - "All hardcoded badge counts (badge:3, badge:2) removed from SideMenu per D-06"
  - "User card + logout button preserved at SideMenu bottom as sole logout path per D-07"
  - "ElevatorPage header simplified to tab bar only; unresolvedCount badge moved to flex-end row above tabs"
  - "InspectionPage own header removed; syncedAt timestamp moved to top of scrollable content area"
metrics:
  duration: "~3h 20m"
  completed_date: "2026-04-01"
  tasks_completed: 3
  tasks_total: 3
  files_created: 0
  files_modified: 6
  files_deleted: 0
---

# Phase 5 Plan 02: SideMenu Restructuring + Page Header Cleanup Summary

**One-liner:** SideMenu restructured to 4 sections with 준비중 disabled items; DashboardPage, ElevatorPage, and InspectionPage no longer mount their own SideMenu or hamburger buttons.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Restructure SideMenu to 4 sections with 준비중 items | 5fa54de | SideMenu.tsx |
| 2 | Remove individual SideMenu/hamburger mounts from pages | 62ff20d | DashboardPage.tsx, ElevatorPage.tsx, InspectionPage.tsx |
| 3 | Visual verification (checkpoint) | APPROVED | all 12 items confirmed on production |

---

## What Was Built

### SideMenu (`src/components/SideMenu.tsx`)

Restructured `MENU` array from 3 sections to 4 sections:

| Section | Items | Notes |
|---------|-------|-------|
| 주요 기능 | 대시보드, 소방 점검, QR 스캔, 조치 관리 | All clickable |
| 점검 관리 | 월간 점검 계획, 점검 일지 출력, 일일업무일지, QR 코드 출력, DIV 압력 관리 | All clickable |
| 근무·복지 | 근무표, 연차 관리, 식당 메뉴 | 식당 메뉴: `soon:true` |
| 시스템 | 건물 도면, 승강기 관리, 법적 점검, 관리자 설정 | 법적 점검, 관리자 설정: `soon:true` |

New `soon: boolean` field on each item. Items with `soon: true` render as:
- Greyed out (`color: var(--t3)`, `opacity: 0.5`)
- Not clickable (`cursor: default`, `pointerEvents: none`)
- "준비중" badge (`background: var(--bg3)`, 10px, padding 2px 7px)

Hardcoded badges eliminated: `badge: 3` (소방 점검) and `badge: 2` (미조치 항목) removed. `미조치 항목` row removed entirely (replaced by 조치 관리 in 주요 기능).

User card + logout button at bottom preserved unchanged (D-07: sole logout path after MorePage deletion).

### DashboardPage (`src/pages/DashboardPage.tsx`)

Removed:
- `import { SideMenu }` (line 8)
- `const [sideOpen, setSideOpen] = useState(false)`
- `<SideMenu open={sideOpen} onClose={() => setSideOpen(false)} />` mount
- Hamburger button with `onClick={() => setSideOpen(true)}`

Preserved:
- `차바이오컴플렉스 방재팀` span in header row
- `datetime` display
- Settings gear button and `settingsOpen` state
- `iconBtnStyle` (still used by settings gear button)
- `<SettingsPanel>` mount

### ElevatorPage (`src/pages/ElevatorPage.tsx`)

Removed:
- `import { SideMenu }` (line 4)
- `const [sideOpen, setSideOpen] = useState(false)`
- `<SideMenu open={sideOpen} onClose={() => setSideOpen(false)} />` mount
- First header row (hamburger + 승강기 관리 title + unresolvedCount inline)
- `iconBtnSt` const (was only used by the hamburger button)

Restructured header to contain:
- `unresolvedCount > 0` badge in a flex-end row (only visible when faults exist)
- Tab bar `TABS.map` (unchanged)

### InspectionPage (`src/pages/InspectionPage.tsx`)

Removed:
- The entire `{/* 헤더 */}` block with `fontSize:18, fontWeight:700` "소방 점검" title

Preserved:
- `syncedAt` timestamp moved from header to first child inside the scrollable `flex:1, overflowY:'auto'` div, with `display:'flex', justifyContent:'flex-end', marginBottom:4`

---

## Verification Results

- `npx tsc --noEmit`: exits 0 (no TypeScript errors)
- `grep -c "SideMenu" src/pages/DashboardPage.tsx`: 0
- `grep -c "SideMenu" src/pages/ElevatorPage.tsx`: 0
- `grep -c "setSideOpen" src/pages/DashboardPage.tsx`: 0
- `grep -c "setSideOpen" src/pages/ElevatorPage.tsx`: 0
- `grep -c "badge: 3|badge: 2|badge:3|badge:2" src/components/SideMenu.tsx`: 0
- `grep "준비중" src/components/SideMenu.tsx`: match found
- `grep -c "logout|로그아웃" src/components/SideMenu.tsx`: 3 (preserved)
- SideMenu sections: 주요 기능, 점검 관리, 근무·복지, 시스템 (4 confirmed)
- InspectionPage: "소방 점검" header text: 0 matches, syncedAt: 3 matches (preserved)

---

## Deviations from Plan

The 2 core plan tasks executed exactly as written (no deviations). The following additional changes were made by user request after Task 2 committed, prior to the Task 3 visual checkpoint:

**1. [User Request] Dashboard header layout redesign**
- **Commit:** 69b7bb7
- **Change:** Header title text replaced with date display on left + company name and settings gear on right
- **Files modified:** `cha-bio-safety/src/pages/DashboardPage.tsx`

**2. [User Request] BottomNav 조치 icon changed to wrench SVG**
- **Commit:** 69b7bb7
- **Change:** Remediation tab icon changed from a generic icon to a wrench SVG for clearer intent
- **Files modified:** `cha-bio-safety/src/components/BottomNav.tsx`

**3. [Rule 1 - Bug] monthEnd UTC timezone bug in stats.ts**
- **Commit:** 1cda1de
- **Change:** Fixed `monthEnd` UTC conversion bug causing off-by-one day errors in monthly stats calculations
- **Files modified:** `cha-bio-safety/functions/api/dashboard/stats.ts`

**4. [Rule 1 - Bug] daily-report nextDate calculation hardened**
- **Commit:** 1cda1de
- **Change:** Hardened `nextDate` calculation in daily-report to prevent edge-case null/undefined failures
- **Files modified:** `cha-bio-safety/functions/api/daily-report` (or related file)

---

## Known Stubs

None affecting plan goal. All SideMenu navigation items either link to working pages or are clearly marked as 준비중 disabled items.

---

## Self-Check: PASSED

Files modified exist:
- cha-bio-safety/src/components/SideMenu.tsx: FOUND
- cha-bio-safety/src/pages/DashboardPage.tsx: FOUND
- cha-bio-safety/src/pages/ElevatorPage.tsx: FOUND
- cha-bio-safety/src/pages/InspectionPage.tsx: FOUND

Commits:
- 5fa54de: Task 1 (SideMenu restructure)
- 62ff20d: Task 2 (page header cleanup)
- 69b7bb7: Additional user-requested changes (dashboard header, wrench icon)
- 1cda1de: Bug fixes (monthEnd UTC, daily-report nextDate)
- b95765b: docs (prior partial summary)

Visual checkpoint: User approved all 12 verification items on production (2026-04-01)

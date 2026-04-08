---
phase: 18-menu-customization
verified: 2026-04-08T00:00:00Z
status: human_needed
score: 3/3 must-haves verified (automated); human verification required for persistence + SideMenu reflection
human_verification:
  - test: "Save config and verify SideMenu reflects it after reload"
    expected: "SideMenu shows the reordered/hidden/renamed items and dividers after hard reload"
    why_human: "Cannot verify server persistence and SideMenu rendering together without running the live app"
  - test: "Verify end-to-end edit flow: move/toggle/rename/add divider/delete divider/reset/save"
    expected: "All 12 steps from 18-03-PLAN.md Task 3 pass"
    why_human: "Interactive UI flow cannot be verified programmatically"
---

# Phase 18: Menu Customization Verification Report

**Phase Goal:** 사용자가 SideMenu 항목 순서와 표시/숨김을 divider 모델로 커스터마이징할 수 있다 (BottomNav는 Phase 18에서 5개 고정)
**Verified:** 2026-04-08
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 설정 페이지의 MenuSettingsSection에서 SideMenu 항목 순서를 위/아래 버튼으로 변경하고 divider(그룹 구분선)를 추가/편집/삭제할 수 있다 | ? HUMAN | Component exists, fully wired; interactive behavior requires live app |
| 2 | 설정 페이지에서 SideMenu 항목별 표시/숨김 토글을 켜고 끌 수 있다| ? HUMAN | ToggleSmall component present, toggleVisible() implemented; live test needed |
| 3 | "설정 저장" 버튼으로 저장한 메뉴 설정이 서버에 퍼시스트되어 앱을 닫고 다시 열어도 유지된다 | ? HUMAN | settingsApi.saveMenu() wired + React Query invalidation; server persistence + reload verification needed |

All three roadmap success criteria depend on interactive behavior that cannot be verified without running the live app. Automated checks below confirm all supporting code is present, substantive, and wired.

**Score:** 3/3 truths structurally supported; all require human verification

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `cha-bio-safety/src/utils/api.ts` | SideMenuEntry, MenuConfig types + DEFAULT_SIDE_MENU + migrateLegacyMenuConfig + typed settingsApi | VERIFIED | All four exports present at lines 299-362; 5 dividers + 17 items in DEFAULT_SIDE_MENU; settingsApi.getMenu returns Promise<MenuConfig> with auto-migration |
| `cha-bio-safety/src/components/SideMenu.tsx` | Read-only flat-list SideMenu (no edit UI) | VERIFIED | 193 lines; appliedEntries useMemo at line 59; zero instances of editMode/editConfig/메뉴 편집/saveMenu confirmed by grep |
| `cha-bio-safety/src/components/MenuSettingsSection.tsx` | Self-contained editor component, default export, >250 lines | VERIFIED | 400 lines; named export MenuSettingsSection at line 39; all 8 interaction features implemented |
| `cha-bio-safety/src/components/SettingsPanel.tsx` | SettingsPanel mounting MenuSettingsSection | VERIFIED | Import at line 46; JSX mount `<MenuSettingsSection />` at line 399, between education_reminder (line 392) and 화면 block (line 401) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| SideMenu.tsx | api.ts | import { settingsApi, type SideMenuEntry, type MenuConfig } | WIRED | Line 7: `import { settingsApi, type SideMenuEntry, type MenuConfig } from '../utils/api'` — used in useQuery queryFn and useMemo |
| MenuSettingsSection.tsx | api.ts | settingsApi.getMenu / saveMenu + SideMenuEntry/MenuConfig/DEFAULT_SIDE_MENU | WIRED | Lines 6-10: full import; getMenu in useQuery (line 43), saveMenu in useMutation (line 75), DEFAULT_SIDE_MENU for init fallback (line 65) and reset (line 134) |
| SettingsPanel.tsx | MenuSettingsSection.tsx | import + JSX mount | WIRED | Line 46 import, line 399 `<MenuSettingsSection />` confirmed |
| MenuSettingsSection.tsx | SideMenu.tsx | import { MENU } from './SideMenu' | WIRED | Line 11; used in PATH_LABEL IIFE (lines 14-18) for path→label resolution |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| SideMenu.tsx | appliedEntries | settingsApi.getMenu() → GET /api/settings/menu → D1 | Yes (existing server endpoint) | FLOWING |
| MenuSettingsSection.tsx | draft | settingsApi.getMenu() init, then local mutations | Yes — initialized from server, draft mutations local until explicit save | FLOWING |
| MenuSettingsSection.tsx | saveMutation | settingsApi.saveMenu() → PUT /api/settings/menu → D1 | Yes (typed MenuConfig written to server) | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED — live app verification required (React PWA, no CLI entry point). The TypeScript check serves as the build-level proxy.

```
npx tsc --noEmit → exit 0 (no output = clean)
```

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| MENU-01 | 18-01, 18-02, 18-03 | SideMenu 항목 순서를 divider 모델로 변경할 수 있다 | SATISFIED | moveUp/moveDown functions in MenuSettingsSection.tsx lines 84-99; divider-as-sibling model in SideMenuEntry union type |
| MENU-02 | 18-01, 18-02, 18-03 | SideMenu 항목별 표시/숨김을 설정할 수 있다 | SATISFIED | toggleVisible() at line 100; ToggleSmall component wired to each item entry; SideMenu filters `!entry.visible` at line 148 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| SettingsPanel.tsx | 405-414 | 화면 section has static select options (테마, 주간 현황 기준) with no handler | Info | Pre-existing stub from Phase 16; not Phase 18 scope |
| MenuSettingsSection.tsx | 53-58 | Collapsed state uses direct localStorage calls instead of shared usePersistedCollapse hook | Info | Functionally equivalent; SettingsPanel.tsx defines usePersistedCollapse at line 28 but MenuSettingsSection is a separate file. No behavioral impact. |

No blockers found. The 화면 section stub pre-dates Phase 18 (Phase 19 scope for App Info). The collapse localStorage pattern difference is cosmetic — both approaches persist to localStorage with equivalent logic.

**Note on post-checkpoint UX additions:** Two commits after the plan scope added:
1. `MenuSettingsSection` collapse/expand toggle with localStorage persistence (`0731885`) — matches the collapsed state code observed at lines 53-58 of MenuSettingsSection.tsx and the `ChevronRight` import.
2. Collapsible 알림/화면/계정 sections in SettingsPanel with `SectionHeader` + `usePersistedCollapse` (`27df3b3`) — these additions are visible in SettingsPanel.tsx lines 5-40. They are user-requested UX polish on top of the phase deliverable and do not affect Phase 18 goal achievement.

### Human Verification Required

#### 1. End-to-End Editor Flow

**Test:** Open the live production URL → open settings panel → locate "메뉴 설정" section (collapsible chevron header) → expand it. Perform these steps:
1. Tap a divider title (e.g., "주요 기능") — input should appear
2. Type a new name, tap outside — title should update
3. Tap "+ 구분선 추가" — new "새 구분선" appears at bottom in edit mode
4. Tap up/down arrows on any entry — order should change; first item's up and last item's down should be dimmed
5. Toggle visibility on any item — row dims to opacity 0.4 + "숨김" label appears
6. Tap trash icon on any divider — inline "삭제할까요? [취소] [삭제]" appears; tap [삭제]
7. Tap "설정 저장" — toast "메뉴 설정이 저장되었습니다" appears
8. Open SideMenu (hamburger) — verify layout/order/visibility matches edits; confirm NO "메뉴 편집" button exists
**Expected:** All 8 steps succeed without console errors
**Why human:** Interactive DOM behavior and toast notifications cannot be verified programmatically

#### 2. Server Persistence After Reload

**Test:** After saving in step 7 above, hard-reload the page. Open SideMenu again.
**Expected:** The saved order/visibility/divider changes persist exactly as saved — they were not lost on reload
**Why human:** Requires verifying the server-side D1 round-trip and React Query re-fetch

#### 3. Default User Flow (No Saved Config)

**Test:** Log in as a user who has no saved menu_config, or clear the config from the admin page. Open settings and expand "메뉴 설정".
**Expected:** The divider-grouped DEFAULT_SIDE_MENU layout appears (대시보드, 일반 점검, QR 스캔, etc. under "주요 기능" divider, etc.)
**Why human:** Requires a clean-slate user account or config deletion

#### 4. Reset to Defaults

**Test:** After making custom edits and saving, tap "기본값으로 초기화" → confirm → tap "설정 저장". Open SideMenu.
**Expected:** SideMenu returns to the 5-divider DEFAULT_SIDE_MENU layout
**Why human:** Requires verifying the server write + SideMenu re-render

### Gaps Summary

No gaps found. All Phase 18 artifacts exist, are substantive (>250 lines minimum met: MenuSettingsSection 400 lines), and are correctly wired. The data flow traces through the existing `/api/settings/menu` endpoint. TypeScript compiles clean.

The `human_needed` status reflects that the three roadmap success criteria all describe interactive behaviors (move/toggle/rename/add/delete dividers, persist to server, reflect in SideMenu after reload) that are structurally fully implemented but require live-app verification to confirm they work end-to-end as intended.

---

_Verified: 2026-04-08_
_Verifier: Claude (gsd-verifier)_

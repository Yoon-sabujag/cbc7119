# Project Research Summary

**Project:** CHA Bio Complex Fire Safety Management System — v1.1 PWA Desktop Optimization
**Domain:** PWA desktop optimization — existing mobile-first React SPA on Cloudflare
**Researched:** 2026-04-04
**Confidence:** HIGH

## Executive Summary

This is a subsequent milestone on a nearly complete mobile-first PWA. The app already delivers JWT auth, inspection recording, photo upload, Excel report generation, shift scheduling, and elevator management. v1.1 adds one thing: making the app a first-class desktop experience at 1920x1080. The recommended approach is surgical — modify the layout shell, add one Zustand store, add one idb-keyval dependency, and leverage existing browser APIs (File System Access, Notifications, HTML5 drag-and-drop). No backend changes. No new framework. The entire scope is frontend-only with a single optional profile-update API endpoint.

The critical architectural finding is that all five feature areas (desktop layout, File System Access, theme switching, drag-and-drop upload, notifications) are independently deliverable and share no runtime dependencies on each other. The sole shared dependency is `useSettingsStore` (a new Zustand slice), which theme switching and notifications both require. Build order therefore is: desktop layout foundation first (unblocks all other UI work), settings store second (unblocks theme and notifications), then File System Access, drag-and-drop, and notifications in any order.

The top risks are mobile-first constraints baked into global CSS (`html { overflow: hidden }`) that will silently break desktop scroll, and File System Access API permission semantics that reset between browser sessions. Both are well-documented and have specific, low-cost mitigations. The overall risk profile is low: the technology choices are browser-native APIs with high MDN/Chrome documentation quality, and the codebase patterns (CSS variables, Zustand persist, inline styles) are already the correct foundation for every v1.1 feature.

---

## Key Findings

### Recommended Stack

The existing stack is unchanged. Only one new runtime dependency is needed: `idb-keyval@6.2.2` (Jake Archibald, Google) for persisting `FileSystemDirectoryHandle` across browser sessions via IndexedDB. File System Access handles are not JSON-serializable and cannot be stored in localStorage or Zustand's localStorage-backed persist — IndexedDB is the spec-mandated storage mechanism, and idb-keyval is the minimal correct implementation at ~600 bytes brotli'd.

All other features use existing stack capabilities: Tailwind `lg:` breakpoint classes for responsive sidebar layout, CSS custom properties (`var(--bg)`, `var(--t1)`) already in place for theme switching, native HTML5 drag events for menu upload, and the standard browser Notifications API for in-app alerts. Tailwind v4 upgrade, any UI component library, `react-dropzone`, Web Push API, and `react-use` are all explicitly out of scope.

**Core technologies:**
- `idb-keyval@6.2.2`: IndexedDB handle persistence — only correct storage mechanism for FileSystemDirectoryHandle
- File System Access API (native): folder-picker auto-save — Chrome/Edge 86+, persistent permissions in installed PWA on Chrome 122+
- CSS `data-theme` attribute + blocking `<script>`: FOUC-free theme switching — zero library, works with existing CSS variables
- HTML5 drag-and-drop (native): menu file upload — ~30 lines replaces `react-dropzone` (7kb) for a single upload zone
- Browser Notifications API (native): in-app alerts via `setInterval` — foreground-only, sufficient for desktop PWA open during work hours

### Expected Features

**Must have (table stakes):**
- Persistent sidebar navigation at `min-width: 1024px` — drawer-based nav is a mobile pattern; desktop users expect fixed nav
- Wide-table / multi-column responsive layout — 1920px with mobile-width cards wastes 60% of screen
- Theme switching (dark/light/system) wired in SettingsPanel — the toggle already exists in UI but does nothing; users will click it immediately
- File System Access API auto-save to chosen folder — eliminates "where did the download go?" for the report-printing workflow; this is the stated core value of v1.1
- Drag-and-drop for weekly menu upload — low effort, high polish signal for a recurring weekly task

**Should have (competitive):**
- App shortcuts in PWA manifest (taskbar right-click) — zero runtime cost, 30 minutes of work, improves installed PWA feel
- Keyboard shortcuts (`Ctrl+P` for print, `Ctrl+S` for export) — desktop power users expect these
- Print stylesheet (`@media print` sidebar hide) — desktop use case is primarily printing Excel/reports

**Defer (v2+):**
- In-app inspection reminder banners — needs schedule data analysis and placement design decision
- Account display name change in settings — requires API endpoint against staff D1 table
- Push notifications — requires VAPID key management, subscription storage, CF Workers-compatible push library; unjustified for 4-person team

### Architecture Approach

The architecture change for v1.1 is entirely a layout shell concern. Pages do not need to know about desktop vs. mobile — they render in a content area and adapt via available width. A single `useIsDesktop()` hook (matchMedia at 1024px) drives the `Layout` function in `App.tsx` to conditionally render either `DesktopSidebar` (new component, 240px fixed left) or the existing `GlobalHeader` + `SideMenu` + `BottomNav` combination. One new Zustand store (`settingsStore.ts`) persists theme, notification flags, and preferences. One new utility hook (`useFsaExportDir`) owns all File System Access API logic and IndexedDB persistence. The backend is untouched.

**Major components:**
1. `DesktopSidebar` (NEW) — permanent 240px left nav for desktop; reuses MENU constant from SideMenu; replaces BottomNav + drawer on `>= 1024px`
2. `useSettingsStore` (NEW) — Zustand slice persisting `theme`, `notificationsEnabled`, `weekBaseline`; same persist pattern as authStore
3. `useFsaExportDir` hook (NEW) — owns `FileSystemDirectoryHandle` lifecycle (pick, persist to IndexedDB, restore, permission check, save, fallback)
4. `MenuUploadZone` (NEW) — drag-and-drop zone for PDF/image files; wires to existing `/api/uploads` + `/api/menu` endpoints
5. `useIsDesktop` hook (NEW) — matchMedia boolean; used only in Layout to branch rendering
6. `App.tsx` Layout (MODIFIED) — branches on `isDesktop`; applies theme `data-theme` attribute via `useEffect`
7. `SettingsPanel.tsx` (MODIFIED) — wired to `useSettingsStore`; theme select, notification toggle, FSA folder picker row
8. `index.css` (MODIFIED) — add `[data-theme="light"]` variable override block

### Critical Pitfalls

1. **`html { overflow: hidden }` blocks all desktop scroll** — The mobile-first global CSS is scroll-locked at `html` level. Before building any desktop component, scope this rule to `@media (max-width: 767px)` or `@media all and (display-mode: standalone)`. This is a one-line CSS fix but must happen first or every desktop page will be unscrollable.

2. **BottomNav `position: fixed; bottom: 0` covers desktop content AND leaves phantom gap** — Hiding BottomNav at desktop breakpoint without also removing per-page `paddingBottom: 'calc(54px + var(--sab, 34px))'` inline styles leaves an 88px blank gap at the bottom of every desktop page. Both the nav visibility and the page padding must use the same breakpoint.

3. **File System Access API permission silently drops between browser sessions** — Storing a `FileSystemDirectoryHandle` in IndexedDB does not preserve permission. On browser restart, `queryPermission()` returns `'prompt'`. Calling `requestPermission()` outside a user gesture throws `SecurityError`. Pattern: on restore, call `queryPermission()` only; show a UI button for re-grant if `'prompt'`; never call in `useEffect`.

4. **Theme flash of wrong color on page reload (FOUC)** — React `useEffect` for theme application fires after the initial DOM paint. Users see a dark flash on hard reload when light theme is selected. Prevention: add a blocking `<script>` in `index.html` that reads `localStorage` and sets `data-theme` on `<html>` before React mounts.

5. **Hardcoded hex colors in inline styles don't respond to theme switch** — `SettingsPanel.tsx`, `BottomNav.tsx`, and others use raw hex values (`'#2563eb'`, `'rgba(22,27,34,0.97)'`). These survive theme switching unchanged. Audit with `grep -r "#[0-9a-fA-F]\{3,6\}" src/` BEFORE implementing theme — replace hardcoded values with CSS variables in both dark and light token sets.

---

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Desktop Layout Foundation
**Rationale:** CSS layout constraints (`overflow: hidden`, BottomNav fixed positioning) are global and will break every other desktop feature if not fixed first. The `DesktopSidebar` and `useIsDesktop` hook have no dependencies and unlock all subsequent desktop UI work. This phase must ship before any other v1.1 phase can be visually validated.
**Delivers:** 1920x1080 navigation working; sidebar visible; all pages scrollable on desktop; BottomNav hidden without phantom gap; wide-table responsive breakpoints on key pages (inspection log, schedule, legal)
**Addresses:** Persistent sidebar (P1), wide-table layout (P1)
**Avoids:** Pitfall 1 (`overflow: hidden`), Pitfall 2 (BottomNav phantom gap)

### Phase 2: File System Access API
**Rationale:** This is the stated core value of v1.1. It is independent of settings store and theme. Building it second, right after layout foundation, keeps focus on the high-value deliverable. The `useFsaExportDir` hook is self-contained — only IndexedDB and browser APIs, no React state changes beyond the hook itself.
**Delivers:** One-time folder selection in SettingsPanel; Excel exports save directly to chosen folder; graceful fallback to browser download on Firefox/Safari/mobile; `FsaDirPicker` row visible in SettingsPanel
**Uses:** `idb-keyval@6.2.2` (sole new npm dependency), File System Access API
**Avoids:** Pitfall 3 (permission drop between sessions), Pitfall 4 (feature detection missing)

### Phase 3: Settings Panel — Theme Switching
**Rationale:** Theme switching requires `useSettingsStore` which also gates the notification feature. Building the store in this phase enables Phase 5 (notifications) without duplication. The FOUC-prevention blocking script in `index.html` must be implemented here, not deferred. The hardcoded hex color audit must happen at the START of this phase, before writing any CSS.
**Delivers:** Dark/light/system theme switching working; no flash on reload; all components respond to theme (including previously hardcoded hex values); `useSettingsStore` available for notifications phase
**Avoids:** Pitfall 5 (FOUC), Pitfall 6 (hardcoded colors not responding to theme)

### Phase 4: Drag-and-Drop Menu Upload
**Rationale:** Isolated feature with no dependencies on earlier phases except a working MealPage. Lowest risk phase — native HTML5 events, reuses existing `/api/uploads` and `/api/menu` endpoints. Can be done in parallel with Phase 3 if bandwidth allows.
**Delivers:** Weekly menu PDF/image uploadable via drag-and-drop OR file input button (fallback); upload confirmation visible; MealPage no longer shows "준비 중" placeholder
**Avoids:** Pitfall 7 (drag-and-drop non-functional on iOS — must include visible file input button fallback)

### Phase 5: Notification System
**Rationale:** Depends on `useSettingsStore` from Phase 3. Push notifications are explicitly out of scope — in-app browser Notification API only. The D1 schema concern (push subscription `staff_id` scoping) is irrelevant because Web Push is not being built. The primary constraint is iOS user gesture requirement for `Notification.requestPermission()`.
**Delivers:** Notification permission requested via settings toggle click (not on mount); three notification preference toggles functional; basic `setInterval` reminder check in DashboardPage when permission granted
**Avoids:** Pitfall 8 (web-push on CF Workers — N/A, not building push), Pitfall 10 (iOS notification gesture requirement)

### Phase 6: Polish — App Shortcuts, Keyboard Shortcuts, Print Stylesheet
**Rationale:** P2 features that add polish after P1 features are validated. All are low-complexity and independently deliverable. Group together to batch the "last 10%" work into one phase rather than scattering across earlier phases.
**Delivers:** PWA manifest `shortcuts` array (taskbar right-click actions); `Ctrl+P` / `Ctrl+S` keyboard handlers on relevant pages; `@media print` sidebar-hide stylesheet
**Avoids:** No new pitfalls; standard patterns

### Phase Ordering Rationale

- **Phase 1 must be first** because global CSS constraints (`overflow: hidden`, BottomNav fixed positioning) will silently break visual validation of every other phase. Building a sidebar on top of broken scroll is wasted work.
- **Phase 2 before Phase 3** because File System Access is the highest-value feature (stated v1.1 core value) and is independent of settings store. Delivering it early provides user value immediately.
- **Phase 3 before Phase 5** because `useSettingsStore` is shared infrastructure. Building the store once in Phase 3 prevents duplication in Phase 5.
- **Phase 4 is parallelizable** with Phase 3 if needed — it has no shared dependencies.
- **Phase 6 last** because app shortcuts require layout to be stable (sidebar URL must be correct), and print stylesheet requires desktop layout to exist.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (File System Access API):** Permission lifecycle edge cases (installed PWA vs. browser tab vs. after Chrome update) are nuanced. Validate the `queryPermission()` / `requestPermission()` flow against Chrome 122+ behavior before implementation.
- **Phase 5 (Notifications):** iOS 16.3.1 PWA notification behavior (must be installed to home screen + `display: standalone`) warrants device testing before implementation. Do not assume desktop behavior applies.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Desktop Layout):** CSS Grid/Flexbox + Tailwind `lg:` breakpoints are fully documented. Layout branching via `matchMedia` is a standard pattern.
- **Phase 3 (Theme Switching):** CSS variable `data-theme` approach + blocking script is a well-established, documented pattern (Josh W. Comeau, CSS-Tricks).
- **Phase 4 (Drag-and-Drop):** Native HTML5 drag events are a stable web platform API with complete MDN documentation.
- **Phase 6 (Polish):** PWA manifest shortcuts and keyboard event handlers are standard and well-documented.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | One new dependency (idb-keyval) with authoritative source (Jake Archibald/Google). All other features use browser-native APIs verified against MDN + Chrome Developers. |
| Features | HIGH | Based on direct codebase inspection of existing stubs (SettingsPanel theme toggle, SideMenu drawer, MealPage placeholder). Feature list derived from what already exists as UI-only stubs. |
| Architecture | HIGH | Based on direct codebase inspection of App.tsx, SettingsPanel.tsx, SideMenu.tsx, index.css, authStore.ts. No inference required — existing patterns are confirmed. |
| Pitfalls | HIGH | Critical pitfalls verified against official Chrome Developers docs, confirmed web-push/CF Workers incompatibility in GitHub issues, and direct grep of codebase for hardcoded hex values. |

**Overall confidence:** HIGH

### Gaps to Address

- **Light theme CSS variable values:** The specific hex values for `[data-theme="light"]` (what shade of white/gray for `--bg`, `--bg2`, `--bg3`, `--bg4`) are not defined in any research file. The exact palette needs a design decision before Phase 3 implementation.
- **Hardcoded hex count:** Research identifies the pattern but the exact count and location of hardcoded hex values requires the `grep` audit at Phase 3 start. Estimate: 15+ based on codebase analysis.
- **iOS 16.3.1 Notification API behavior:** MEDIUM confidence for the exact notification flow on iOS 16.3.1 (vs. iOS 16.4+). MagicBell source is secondary. Validate on device before Phase 5.
- **`var(--sab)` desktop reset scope:** Research recommends removing safe-area-based padding at desktop breakpoint. The exact set of inline `paddingBottom` values in page components has not been fully enumerated — Phase 1 must audit all pages during BottomNav hide work.

---

## Sources

### Primary (HIGH confidence)
- Chrome Developers — File System Access API + Persistent Permissions: https://developer.chrome.com/docs/capabilities/web-apis/file-system-access
- Chrome Blog — Persistent Permissions (Chrome 122): https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api
- idb-keyval GitHub (Jake Archibald, Google): https://github.com/jakearchibald/idb-keyval
- MDN — Notifications API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
- MDN — ServiceWorkerRegistration.showNotification(): https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
- MDN — File System API: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
- GitHub Issue — web-push-libs/web-push CF Workers incompatibility: https://github.com/web-push-libs/web-push/issues/718
- Cloudflare Docs — Node.js compatibility in Workers 2025: https://blog.cloudflare.com/nodejs-workers-2025/
- web.dev — DataTransfer API / drag-and-drop: https://web.dev/articles/datatransfer
- Codebase inspection: src/App.tsx, src/index.css, src/components/SettingsPanel.tsx, src/components/SideMenu.tsx, src/components/BottomNav.tsx, src/components/GlobalHeader.tsx, src/stores/authStore.ts, vite.config.ts

### Secondary (MEDIUM confidence)
- CSS-Tricks — Easy Dark Mode with CSS Variables: https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/
- Josh W. Comeau — CSS Variables for React Devs: https://www.joshwcomeau.com/css/css-variables-for-react-devs/
- MagicBell — PWA iOS Limitations and Safari Support 2026: https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide
- DEV Community — Drag-drop in React without libraries: https://dev.to/hexshift/implementing-drag-drop-file-uploads-in-react-without-external-libraries-1d31

### Tertiary (LOW confidence)
- None. All research findings backed by primary or secondary sources.

---
*Research completed: 2026-04-04*
*Ready for roadmap: yes*

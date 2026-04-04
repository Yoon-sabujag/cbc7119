# Feature Research

**Domain:** PWA Desktop Optimization — Fire Safety Management App
**Researched:** 2026-04-04
**Confidence:** HIGH (File System Access API, theme switching); MEDIUM (drag-and-drop, notifications)

## Context

This is a SUBSEQUENT MILESTONE on an existing app. The app already has: JWT auth, mobile inspection recording, photo upload, Excel report generation, shift scheduling, elevator management, dashboard stats, PWA install. The milestone adds desktop (1920x1080) optimization only. The `SettingsPanel.tsx` component exists with password change working but notifications/theme/profile sections are UI-only stubs. `SideMenu.tsx` is a drawer (mobile-style) not a persistent sidebar.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features a desktop PWA user assumes exist. Missing these = the desktop experience feels broken compared to a mobile app the team already uses.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Persistent sidebar navigation | Desktop apps always have persistent nav — a drawer that hides is a mobile pattern | MEDIUM | SideMenu exists as drawer; needs `lg:` breakpoint to become a fixed left panel. CSS Grid/Flexbox layout refactor needed in App.tsx. No new data, just layout. |
| Wide-table / multi-column content layout | 1920px with mobile-width cards wastes 60% of screen. Users notice immediately. | MEDIUM | Most pages use flex-column stacks. Need responsive breakpoints for tables (inspection log, schedule, legal checks) to show more columns at wide screens. |
| Theme switching (dark/light/system) | SettingsPanel already has a theme toggle row but it does nothing. Users will click it immediately after install. | LOW | CSS variables (`var(--bg)`, `var(--t1)`) already used throughout codebase. Add `data-theme` attribute to `<html>`, define two variable sets, read `prefers-color-scheme` as default, persist choice to localStorage. No backend required. |
| Settings panel working (not stub) | The settings icon is visible in SideMenu. Users will open it. Finding non-functional toggles erodes trust. | MEDIUM | Three sub-features inside: theme (see above), notifications toggle, account profile. Password change already works. |
| Responsive print layout | Desktop use case is primarily printing Excel/reports. Print styles need to not include sidebar. | LOW | Add `@media print { .sidebar { display: none } }`. Already likely partially handled by Excel generation, but screen-to-print layout clip needs verification. |

### Differentiators (Competitive Advantage)

Features that make this desktop experience genuinely better than "a mobile app on a big screen."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| File System Access API — auto-save to folder | Eliminates "where did the download go?" problem for IT-low users. User picks a folder once (e.g. `D:\점검일지\2026`), every export goes there silently from then on. Core value of v1.1. | MEDIUM | Chrome 122+ supports persistent permissions. Store `FileSystemDirectoryHandle` in IndexedDB. On next session: read handle from IndexedDB → call `requestPermission({mode:'readwrite'})` → if "Allow on every visit" was chosen, no prompt. Graceful fallback to standard `<a download>` if API unavailable (Firefox, Safari, mobile). |
| Drag-and-drop menu upload | The weekly menu PDF (`CBC Weekly MENU`) is currently uploaded through a standard file picker. D&D reduces click count for a weekly recurring task. | LOW | Native HTML5 drag events (`dragover`, `drop`) on the existing upload target. No library needed. Show visual drop zone highlight on `dragover`. Same File API handler as current click-to-upload. Also add clipboard paste (`paste` event on `document`) for bonus UX: copy image → paste into the zone. |
| App shortcuts (right-click taskbar) | When PWA is installed on Windows/macOS, right-click the taskbar icon shows quick actions (e.g., "소방 점검 시작", "대시보드"). Zero runtime cost — manifest JSON only. | LOW | Add `shortcuts` array to `vite.config.ts` PWA manifest options. Each entry is `{ name, url, icons }`. Works on Chrome/Edge desktop installs. No iOS support (not needed — desktop only). |
| Keyboard shortcuts for frequent actions | Power users (team has at least one IT-capable person) expect `Ctrl+P` for print, `Ctrl+S` to trigger export. Desktop users rely on keyboard more than touch. | LOW | `useEffect` with `keydown` listener in relevant pages. Scope to page-level, not global, to avoid conflicts. Document shortcuts in settings panel or tooltip. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Push notifications for inspection reminders | Sounds useful for a 4-person fire safety team — remind about monthly checks | Requires a push service backend (VAPID keys, subscription storage in D1, Worker to send pushes). Cloudflare Workers can do this but it adds meaningful complexity for 4 users who can just look at the dashboard. Permission UX is also hostile (browsers block auto-prompts). | In-app toast/banner on dashboard for upcoming scheduled inspections. No server required. Zustand + localStorage can track "dismissed" state. |
| Real-time multi-user editing | Multiple team members editing the same inspection record simultaneously | 4 users, low traffic — the complexity of WebSockets/Durable Objects is unjustified. D1 doesn't support live subscriptions. | Optimistic updates with React Query + short `staleTime`. Last-write-wins is fine for this team size. |
| Native desktop app (Electron/Tauri) | True offline capability, tray icon, deeper file system access | Already explicitly out-of-scope in PROJECT.md. Build pipeline overhead. PWA + File System Access API covers the actual needs. | Stay PWA. File System Access API gives folder-level access. Service Worker handles offline caching. |
| Full dark/light theme per-page | Different themes on different pages for "visual variety" | Creates inconsistency. Users expect a global setting, not per-page. Double the CSS maintenance burden. | Single global theme token set. One `data-theme` attribute on `<html>`. All pages inherit. |
| Settings stored in D1 per-user | Syncing theme/notification prefs across devices | For 4 users who each own one device, localStorage is sufficient. D1 round-trip on every load for a boolean theme flag is overkill. | `localStorage` + Zustand `persist` middleware already used in the codebase (same pattern as `authStore`). |

---

## Feature Dependencies

```
[Persistent Sidebar]
    └──requires──> [CSS breakpoint layout refactor in App.tsx]

[File System Access API — auto-save]
    └──requires──> [IndexedDB handle storage utility]
    └──requires──> [Graceful fallback detection (feature flag check)]
    └──enhances──> [Excel export (existing jspdf / xlsx-js-style flows)]

[Theme Switching]
    └──requires──> [CSS variable tokens already in place (var(--bg), var(--t1), etc.)]
    └──requires──> [SettingsPanel theme row wired to actual state]
    └──uses──> [Zustand persist store (new or extend authStore)]

[Drag-and-Drop Upload]
    └──enhances──> [Existing menu upload endpoint (functions/api/menu)]
    └──independent of──> [File System Access API]

[App Shortcuts (manifest)]
    └──requires──> [PWA manifest update in vite.config.ts]
    └──independent of──> [all runtime features]

[Keyboard Shortcuts]
    └──enhances──> [Excel export trigger]
    └──enhances──> [Print trigger]
    └──independent of──> [layout changes]
```

### Dependency Notes

- **File System Access API requires IndexedDB handle storage:** The `FileSystemDirectoryHandle` must be persisted between sessions. Browser storage (IndexedDB, not localStorage — handles are not JSON-serializable directly) is needed. Use `idb-keyval` (1.5KB) or raw `indexedDB` API. Project has no existing IndexedDB usage.
- **Theme switching requires existing CSS variables:** The codebase already uses `var(--bg)`, `var(--t1)`, `var(--bg3)`, `var(--bd)` etc. for colors. The variable tokens are ready — only the "which set of values" decision at the `:root` level needs to toggle. Complexity is LOW because no components need to change.
- **Persistent sidebar conflicts with current SideMenu drawer:** The `SideMenu` component renders as an overlay drawer (mobile pattern). A desktop sidebar is a different layout mode, not just the drawer made wider. Either render two components or add a layout-mode prop. The App.tsx route wrapper needs to know screen width.

---

## MVP Definition

### Launch With (v1.1)

Minimum to make the desktop experience feel intentional rather than "mobile on a big screen."

- [ ] Persistent sidebar at `min-width: 1024px` — eliminates the drawer-based nav on desktop
- [ ] Wide table/content layout — inspection log, schedule, legal pages respond to available width
- [ ] Theme switching (dark/light/system) wired in SettingsPanel — the toggle exists, make it work
- [ ] Drag-and-drop for menu upload — weekly recurring task, low effort, high polish signal
- [ ] File System Access API for Excel auto-save — the stated core value of v1.1, with fallback

### Add After Validation (v1.x)

- [ ] App shortcuts in PWA manifest — add after layout is stable, takes 30 minutes
- [ ] Keyboard shortcuts (`Ctrl+P`, `Ctrl+S`) — add per page when that page is being polished
- [ ] Print stylesheet (`@media print` sidebar hide) — add when team starts printing from desktop

### Future Consideration (v2+)

- [ ] In-app inspection reminder banners — needs schedule data analysis, design decision on placement
- [ ] Account display name change in settings — currently only password change works; display name tied to staff record in D1 (requires API)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Persistent sidebar navigation | HIGH | MEDIUM | P1 |
| Wide-table responsive layout | HIGH | MEDIUM | P1 |
| Theme switching (wired) | HIGH | LOW | P1 |
| File System Access API auto-save | HIGH | MEDIUM | P1 |
| Drag-and-drop menu upload | MEDIUM | LOW | P1 |
| App shortcuts (manifest) | LOW | LOW | P2 |
| Keyboard shortcuts | MEDIUM | LOW | P2 |
| Print stylesheet | MEDIUM | LOW | P2 |
| In-app reminders | MEDIUM | MEDIUM | P3 |
| Push notifications | LOW | HIGH | Do not build |

**Priority key:**
- P1: Must have for v1.1 launch
- P2: Should have, add when P1 complete
- P3: Nice to have, future milestone

---

## Competitor Feature Analysis

This is an internal tool with no direct competitors. Reference points are desktop PWA patterns from similar internal tools.

| Feature | VS Code Web (desktop PWA reference) | Google Workspace (enterprise reference) | Our Approach |
|---------|--------------------------------------|------------------------------------------|--------------|
| File save to disk | File System Access API with persistent permission | Download to system-chosen folder | File System Access API, user picks folder once, handle stored in IndexedDB |
| Theme switching | Dark/Light/System via settings | Dark/Light via account settings | `data-theme` on `<html>`, localStorage preference, Zustand persistence |
| Layout on wide screen | Sidebar + editor + panel, collapsible | Sidebar persistent at `> 900px` | CSS Grid: fixed 220px sidebar + main content at `>= 1024px` |
| Upload UX | Drag-and-drop to file tree | Drag-and-drop to Drive folder | Drop zone on upload target, same handler as click |

---

## Technical Constraints Specific to This App

- **File System Access API:** Chrome/Edge only. Safari/Firefox users (mobile team members) must get standard download fallback. Detection: `'showDirectoryPicker' in window`.
- **IndexedDB for handle storage:** `idb-keyval` is the minimal dependency (1.5KB). Alternative: raw IndexedDB API to avoid any new dependency. Either works. Recommend raw API to keep zero new dependencies.
- **CSS variable theming:** App uses `var(--bg)`, `var(--t1)`, `var(--bg3)`, `var(--bg4)`, `var(--bd)`, `var(--t3)`, `var(--danger)`. These must be audited and ensured defined in both light and dark token sets. `index.css` or `App.tsx` global style block is the right place.
- **Sidebar layout refactor scope:** `App.tsx` is the route wrapper. A `useMediaQuery('(min-width: 1024px)')` hook (or CSS-only approach with `@media`) determines layout mode. The SideMenu component currently takes `open/onClose` props — a persistent sidebar mode needs neither. Consider a new `DesktopSidebar` component vs. extending SideMenu with a `persistent` prop.

---

## Sources

- [Persistent Permissions for File System Access API — Chrome Developers](https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api) — HIGH confidence
- [File System Access API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) — HIGH confidence
- [Window: showDirectoryPicker() — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker) — HIGH confidence
- [Can I use: File System Access API](https://caniuse.com/native-filesystem-api) — HIGH confidence
- [PWA App Design — web.dev](https://web.dev/learn/pwa/app-design) — HIGH confidence
- [Expose PWA shortcuts — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Expose_common_actions_as_shortcuts) — HIGH confidence
- [Dark mode / prefers-color-scheme — MDN pattern](https://dev.to/fedtti/how-to-provide-light-and-dark-theme-color-variants-in-pwa-1mml) — MEDIUM confidence
- [Drag-and-drop file upload in React — Transloadit](https://transloadit.com/devtips/implementing-drag-and-drop-file-upload-in-react/) — MEDIUM confidence

---

*Feature research for: CHA Bio Complex Fire Safety Management System — v1.1 PWA Desktop Optimization*
*Researched: 2026-04-04*

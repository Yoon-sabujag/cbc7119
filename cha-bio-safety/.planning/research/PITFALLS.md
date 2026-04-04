# Pitfalls Research

**Domain:** Adding desktop optimization, File System Access API, theme switching, drag-and-drop upload, and notification system to existing mobile-first PWA on Cloudflare
**Researched:** 2026-04-04
**Confidence:** HIGH (browser API pitfalls from official docs + verified codebase analysis)

---

## Critical Pitfalls

Mistakes that require rewrites, break mobile compatibility, or silently fail in production.

---

### Pitfall 1: CSS Hard-Coded `html { overflow: hidden }` Blocks Desktop Scroll

**What goes wrong:**
`src/index.css` sets `html { height: 100%; overflow: hidden; }` and `body { height: 100dvh; overscroll-behavior: none; }`. This is intentional for mobile PWA — prevents iOS Safari bounce scroll. On a 1920x1080 desktop, pages taller than viewport (inspection lists, schedule tables, legal findings) cannot scroll at all. The entire app is scroll-locked.

**Why it happens:**
The mobile-first constraint was encoded in global CSS, not scoped to a `@media (max-width)` block or `@media (display-mode: standalone)`. Developers adding desktop breakpoints assume the layout components need changing, not the root CSS.

**How to avoid:**
- Scope the `overflow: hidden` lock to mobile or standalone mode: `@media screen and (max-width: 767px) { html { overflow: hidden } }` OR use the existing `@media all and (display-mode: standalone)` block already present in index.css.
- Desktop layout uses `overflow: auto` on `#root` or the page container, not on `html`/`body`.
- Do NOT change the mobile behavior — the iOS safe area and bounce prevention depend on it.

**Warning signs:**
- Desktop pages with long content (inspection history, schedule tables) are cut off at viewport height with no scrollbar.
- Vertical scroll works in browser devtools device emulator but not on actual desktop window.

**Phase to address:** Phase 1 (desktop layout foundation) — must be the first CSS change before building any desktop-specific components.

---

### Pitfall 2: BottomNav Hard-Coded `position: fixed; bottom: 0` Covers Desktop Content

**What goes wrong:**
`BottomNav.tsx` renders `position: fixed; bottom: 0; left: 0; right: 0; height: calc(54px + var(--sab, 34px))`. On desktop, `var(--sab)` evaluates to `34px` (mobile safe area fallback), so the BottomNav is 88px tall and covers the bottom of every page. Tables, buttons, and form fields at the bottom of desktop views are obscured. The page padding-bottom in each page component (which accounts for the nav height) must match the actual nav height.

**Why it happens:**
Each page component adds `paddingBottom: 'calc(54px + var(--sab, 34px))'` manually as inline style to avoid nav overlap. On desktop the BottomNav is replaced by a sidebar — if the BottomNav is hidden at `min-width: 768px` but page padding-bottom is not also removed at that breakpoint, there is a 88px empty gap at the bottom of every desktop page.

**How to avoid:**
- Use a CSS class or data attribute to conditionally show/hide BottomNav: `display: none` at `@media (min-width: 768px)`.
- All page-level padding-bottom values must also use the same breakpoint: `@media (min-width: 768px) { padding-bottom: 0 }`.
- Consider a layout wrapper component (`AppLayout`) that applies the correct padding based on device class, rather than individual pages each setting their own `paddingBottom`.

**Warning signs:**
- Blank space at the bottom of desktop pages after BottomNav is hidden.
- Button rows or table pagination obscured on desktop because padding-bottom is still set to nav height.

**Phase to address:** Phase 1 (desktop layout foundation).

---

### Pitfall 3: File System Access API Permission Silently Drops Between Browser Sessions

**What goes wrong:**
`showDirectoryPicker()` returns a `FileSystemDirectoryHandle`. Even if the handle is persisted in IndexedDB, the permission state resets to `'prompt'` on browser restart. The next time the user opens the app and tries to auto-save a report, `handle.requestPermission({ mode: 'readwrite' })` is called — but if this call is NOT triggered by a direct user gesture (e.g., it fires on page load during auto-save initialization), Chrome throws `SecurityError: User activation required`. The save silently fails with no feedback to the user.

**Why it happens:**
The distinction between "handle persisted" and "permission granted" is non-obvious. Developers store the handle and assume the permission follows. Chrome requires a new user gesture for `requestPermission()` on every browser session (except for installed PWAs from Chrome 122+, which get persistent permission automatically).

**How to avoid:**
- Never call `showDirectoryPicker()` or `handle.requestPermission()` on page load or in a `useEffect`. Always call them inside a button click handler.
- On app load, call `handle.queryPermission({ mode: 'readwrite' })` only — if the result is `'granted'`, proceed. If `'prompt'`, show a UI button "폴더 접근 권한 재확인" that the user must click to trigger the permission request.
- If the PWA is installed (check `window.matchMedia('(display-mode: standalone)').matches`), Chrome 122+ grants persistent permission automatically — skip the re-prompt flow.
- Store handles in `indexedDB` (not localStorage — handles are not JSON-serializable). Use `idb-keyval` or a direct IndexedDB wrapper.

**Warning signs:**
- `SecurityError: Must be handling a user gesture to show a file picker` in the browser console.
- `queryPermission()` returns `'prompt'` even though the user already granted access last session.
- Auto-save silently does nothing on first use after browser restart.

**Phase to address:** Phase 2 (File System Access API integration).

---

### Pitfall 4: File System Access API Not Available in Non-Installed PWA Tab or Incognito

**What goes wrong:**
`window.showDirectoryPicker` is `undefined` in: Firefox (all versions), Safari (all versions including iOS), Chromium in incognito mode, and any cross-origin iframe. The codebase targets "Chrome/Edge 데스크톱" for this feature, but if a user opens the app in a regular Chrome tab (not installed PWA), `showDirectoryPicker` exists but throws in some contexts. If the code does `await window.showDirectoryPicker()` without a feature check, the entire report export flow crashes.

**Why it happens:**
Feature detection is often added as an afterthought. The happy path is coded first and tested only in Chrome with the PWA installed.

**How to avoid:**
- Gate every File System Access API call: `if (!('showDirectoryPicker' in window)) { /* fallback: standard download via Blob URL */ }`.
- The fallback must be a working download: `const url = URL.createObjectURL(blob); a.click()` — users on unsupported browsers still get their file.
- Show a one-time info toast: "Chrome/Edge에서 PWA를 설치하면 폴더 자동 저장을 사용할 수 있습니다" when the user is on an unsupported browser.

**Warning signs:**
- Excel export fails silently on non-Chrome browsers with no error shown to the user.
- `TypeError: window.showDirectoryPicker is not a function` in console on Safari/Firefox.

**Phase to address:** Phase 2 (File System Access API integration).

---

### Pitfall 5: Theme Switching Causes Flash of Wrong Theme (FOIT) on Page Load

**What goes wrong:**
The current `index.css` hardcodes dark theme variables in `:root`. If theme selection is persisted in `localStorage` (via Zustand or direct `localStorage.setItem`), the JavaScript runs AFTER the browser has already painted the initial frame using the `:root` dark values. A user who selected "라이트" theme sees a dark flash before JavaScript applies the light theme values. For a 4-person internal app this is tolerable, but if the theme toggle is stored in `localStorage` and applied in a React `useEffect`, every page navigation triggers a visible flicker.

**Why it happens:**
React state and `useEffect` execute after the initial DOM paint. By the time the theme class or CSS variable override is applied, the browser has already rendered one frame with the default values.

**How to avoid:**
- Apply theme as a `data-theme` attribute on `<html>` or `<body>` in a blocking `<script>` tag in `index.html` (before React hydrates): `document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark')`.
- Define CSS variables in `[data-theme='light'] { ... }` blocks. The `:root` block provides dark defaults.
- Do NOT use a React `useEffect` as the primary theme applicator — use it only to sync the React state with what was applied by the blocking script.

**Warning signs:**
- Visible light-to-dark or dark-to-light flash on page reload.
- Theme toggle works correctly but reset is visible on hard refresh.
- `document.documentElement.getAttribute('data-theme')` returns null until after React mounts.

**Phase to address:** Phase 3 (settings panel — theme toggle implementation).

---

### Pitfall 6: Theme CSS Variables Break Existing Inline Styles That Hardcode Colors

**What goes wrong:**
The codebase uses `var(--bg)`, `var(--t1)`, `var(--acl)` throughout, which is correct. However, several components use hardcoded hex colors in inline styles: `SettingsPanel.tsx` has `background: '#2563eb'` (the toggle button active state), `BottomNav.tsx` has `background: 'rgba(22,27,34,0.97)'` and `background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)'` for the QR button. When a light theme is applied by switching CSS variables, these hardcoded values do not respond — the QR button gradient stays dark-themed regardless of theme.

**Why it happens:**
The codebase evolved mobile-first with a single dark theme. When inline styles were written, there was no concept of theme switching, so raw hex values were used for "it just works" expediency.

**How to avoid:**
- Before implementing theme switching, audit all inline styles in components for hardcoded colors: `grep -r "#[0-9a-fA-F]\{3,6\}" src/components src/pages --include="*.tsx"`.
- Replace hardcoded values with CSS variables. For accent colors not currently in `--*` variables, add them to `index.css`.
- Minimum additions needed: `--nav-bg`, `--qr-gradient-start`, `--qr-gradient-end`, `--toggle-active` — define both dark and light values.

**Warning signs:**
- After applying light theme, some UI elements (nav bar, QR button, toggle buttons) remain dark.
- `grep` over the codebase finds 15+ hardcoded hex values in TSX inline styles.

**Phase to address:** Phase 3 (settings panel / theme) — audit BEFORE implementing theme switching, not after.

---

### Pitfall 7: Drag-and-Drop Upload Broken on iOS Safari (Mobile Users)

**What goes wrong:**
The planned drag-and-drop for menu upload (`MealPage.tsx`) will work on Chrome/Edge desktop. However, HTML5 drag-and-drop events (`dragover`, `drop`) are NOT supported on iOS Safari or Android mobile browsers. If the drag-and-drop zone is implemented without a visible fallback file input, mobile users (who access the app from iPhone/iPad for other features) encounter a drop zone that looks interactive but never responds to touch.

**Why it happens:**
Drag-and-drop is tested on desktop Chrome where it works. Mobile testing is skipped or done only for the features that were originally mobile-first. The upload zone is visually present on mobile (no CSS hiding it) but non-functional.

**How to avoid:**
- ALWAYS pair a drag-and-drop zone with an `<input type="file" accept="image/*,application/pdf">` that is visually present (not hidden behind the drop zone).
- On mobile, the file input is the primary interaction; the drop zone is a desktop enhancement.
- Use CSS to show the drop zone only on pointer devices: `@media (pointer: fine) { .drop-zone { display: block } }`. On touch devices, show only the file input button.
- The existing `PhotoButton.tsx` pattern (file input with preview) should be the reference implementation for the meal menu upload fallback.

**Warning signs:**
- On iOS Safari, tapping the drop zone does nothing.
- `dragover` event never fires on mobile.
- The "업로드" button is only visible as a drop zone, with no tap-accessible alternative.

**Phase to address:** Phase 4 (drag-and-drop menu upload).

---

### Pitfall 8: `web-push` npm Package Incompatible With Cloudflare Workers Runtime

**What goes wrong:**
The standard `web-push` npm package (`web-push-libs/web-push`) uses Node.js `crypto.createECDH()` for VAPID key signing, which does not exist in the Cloudflare Workers runtime. If a push notification sender function is implemented in `functions/api/notifications/send.ts` using `web-push`, it throws `TypeError: crypto2.createECDH is not a function` at runtime in the Workers environment. The error only appears in production (or `wrangler dev`) — local Node.js testing passes.

**Why it happens:**
`web-push` is the de facto standard library for Web Push, so developers reach for it first. Cloudflare Workers uses the W3C Web Crypto API, not Node's `crypto` module. Despite Cloudflare improving Node.js compatibility in 2024-2025, `createECDH` specifically requires compatibility flags that may not be enabled.

**How to avoid:**
- Use `@block65/webcrypto-web-push` or `pushforge` — both are explicitly designed for Web Crypto API environments (Cloudflare Workers, Deno, Bun).
- Alternatively, implement VAPID signing manually using `crypto.subtle.sign()` with the `ECDSA` algorithm — the Workers Web Crypto API fully supports this.
- If enabling Node.js compat flag in `wrangler.toml` (`nodejs_compat = true`), verify `createECDH` is included before depending on it.

**Warning signs:**
- `TypeError: crypto2.createECDH is not a function` in `wrangler dev` logs.
- Push works in local test using `node` but fails when deployed to Pages Functions.

**Phase to address:** Phase 5 (notification system implementation).

---

### Pitfall 9: Push Notification Subscriptions Stored Without Per-User Scoping

**What goes wrong:**
Web Push requires storing `PushSubscription` objects (endpoint + keys) server-side to send targeted notifications. If push subscriptions are stored in D1 without a `staff_id` foreign key, it is impossible to send notifications to a specific user (e.g., "윤종엽 only"). All or nothing — broadcast to everyone. For the 4-person team this seems acceptable, but push subscriptions are device+browser specific: each staff member's phone, tablet, and PC have separate subscriptions. Without `staff_id`, a user who logs out and logs in on a different device creates orphan subscriptions with no way to clean them up.

**Why it happens:**
The initial implementation stores the subscription endpoint as the primary key and doesn't think about "who owns this subscription." Subscriptions pile up without cleanup.

**How to avoid:**
- D1 schema: `push_subscriptions (id TEXT PRIMARY KEY, staff_id TEXT NOT NULL, endpoint TEXT UNIQUE, p256dh TEXT, auth TEXT, created_at TEXT, last_seen_at TEXT)`.
- On login, upsert: `INSERT OR REPLACE INTO push_subscriptions (staff_id, endpoint, ...) WHERE endpoint = ?` — this prevents duplicate subscriptions for the same device.
- On `pushsubscriptionchange` service worker event, update the stored endpoint.
- On user logout, delete that user's subscriptions for the current device endpoint.

**Warning signs:**
- `push_subscriptions` table grows without bound (multiple rows per staff member over time).
- No way to send notification to one specific user.
- Notifications fail for staff members who switched devices because the old subscription endpoint is still stored.

**Phase to address:** Phase 5 (notification system) — D1 schema must be designed before implementing the subscription registration API.

---

### Pitfall 10: iOS 16.3.1 Web Push Requires Installed PWA + Explicit User Gesture

**What goes wrong:**
The project targets iOS 16.3.1+. Web Push on iOS requires: (1) the PWA to be installed to home screen, (2) the `manifest.json` `display` set to `"standalone"`, AND (3) `Notification.requestPermission()` triggered by a direct user gesture (button tap). If the notification permission request is triggered automatically on settings panel open (e.g., in `useEffect` or component mount), iOS silently ignores it — no permission dialog, no error. The notification toggle in the settings panel appears to be saved but no permission is ever granted.

**Why it happens:**
Desktop Chrome allows `Notification.requestPermission()` to be called programmatically (with some restrictions). iOS is stricter: user activation is mandatory, and calling it outside a gesture handler produces no prompt — not even an error in the console.

**How to avoid:**
- The notification enable toggle in `SettingsPanel.tsx` must call `Notification.requestPermission()` in the `onClick` handler of the toggle button itself — not in a subsequent `useEffect`.
- Show current permission state to the user: "브라우저에서 알림 권한이 필요합니다" with a call-to-action button.
- Handle all three states: `'default'` (not yet asked), `'granted'`, `'denied'` (show instructions to re-enable in Settings).
- On iOS, check `'Notification' in window` first — on iOS < 16.4, `Notification` may be undefined even with the API polyfilled.

**Warning signs:**
- Notification permission dialog never appears on iOS after toggling the notification setting.
- `Notification.permission` remains `'default'` despite the user toggling notifications on.
- Console shows no error but permission is never requested on iOS.

**Phase to address:** Phase 5 (notification system).

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Apply theme via React `useEffect` only | Simple to implement | Flash of wrong theme on every hard reload | Never — use blocking `<script>` in index.html |
| Hardcode `var(--sab, 34px)` in desktop padding | Avoids breakpoint logic | 34px phantom gap at bottom of every desktop page | Never for desktop layout |
| Use standard `web-push` npm package | Familiar API | Crashes in Cloudflare Workers runtime | Never for CF Workers — use webcrypto-web-push |
| Store `FileSystemDirectoryHandle` in localStorage | Simple persistence | Handles are not JSON-serializable, silently stores `[object Object]` | Never — use IndexedDB |
| Single drag-and-drop zone with no file input fallback | Clean desktop UI | Completely non-functional on iOS/Android | Never — always provide both |
| Global `overflow: hidden` on `html` element | Prevents iOS bounce | Blocks all desktop scrolling | Mobile standalone only — scope to media query |

---

## Integration Gotchas

Common mistakes when connecting to external services or browser APIs.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| File System Access API | Calling `requestPermission()` in `useEffect` on page load | Call only inside button click handler (`onClick`) |
| File System Access API | Treating stored IndexedDB handle as "permission granted" | Always `queryPermission()` on restore; show re-grant button if `'prompt'` |
| Web Push + Cloudflare Workers | Using `web-push` npm package | Use `@block65/webcrypto-web-push` or manual `crypto.subtle` VAPID signing |
| Web Push + iOS | Auto-triggering `requestPermission()` on app launch | Require explicit user tap on notification toggle button |
| Drag-and-drop | Only handling `drop` event | Also handle `dragover` with `e.preventDefault()` — without it, `drop` never fires |
| CSS Theme Variables | Adding new theme variables without both light/dark definitions | All variables must be defined in both `:root` (dark default) and `[data-theme='light']` |
| Desktop layout | Using `position: fixed` elements with mobile safe-area insets on desktop | Use `@media (min-width: 768px)` to reset safe-area-specific values to `0px` |

---

## Performance Traps

Patterns that work at current scale but create problems.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Multiple `showDirectoryPicker()` calls without handle caching | User sees repeated folder permission dialogs | Cache the handle in IndexedDB after first pick; reuse until permission revoked | Every export operation |
| Theme switching re-renders entire React tree | Visible UI jank on theme toggle | Apply theme via CSS variable on `<html>` element; React state is cosmetic only | Low-end devices or large component trees |
| Push subscription upsert on every page load | D1 write on every navigation in installed PWA | Only upsert on explicit user action (login, settings change) | Low traffic but wastes D1 write budget |
| `Notification.requestPermission()` called without user interaction | Silent fail on iOS; UX confusion | Always in `onClick` handlers | First time on iOS |

---

## Security Mistakes

Domain-specific security issues.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing push subscription `auth` key in D1 unencrypted | Auth key allows anyone with DB access to decrypt push message content | For internal 4-person app, acceptable risk — D1 access requires Cloudflare account credentials |
| Accepting `staffId` from push subscription registration request body | A user could register a subscription under another user's ID to receive their notifications | Always use `ctx.data.staffId` from verified JWT, never from request body |
| File System Access API handle shared across browser profiles | Handle stored in IndexedDB is profile-specific — but if Chrome profiles share a data directory, another profile could access it | Non-issue for single-user desktop, document the assumption |
| VAPID private key in Cloudflare environment variable without rotation plan | Rotating the key invalidates ALL existing push subscriptions | Store VAPID keys in `wrangler.toml` secrets; document that rotation requires re-subscription by all users |

---

## UX Pitfalls

Common user experience mistakes specific to this feature set.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Theme toggle saves to localStorage but not to DB | Theme resets when user logs in on another device | Acceptable for v1.1 (single-device usage per person); document limitation |
| Desktop sidebar hidden behind mobile `overflow: hidden` | Staff member on PC can't navigate via sidebar | Fix `overflow: hidden` scoping before building sidebar component |
| File save folder picker shown on every export | User has to find the folder every time | Persist the DirectoryHandle in IndexedDB; only prompt once per session |
| Push notification "enabled" toggle with no visible permission state | User toggles on, nothing happens (iOS 16.3.1 without installed PWA) | Show actual `Notification.permission` state ('허용됨' / '차단됨' / '미설정') next to toggle |
| Drag-and-drop zone without visual confirmation on drop | User drops file, nothing visible happens during processing | Show upload progress or skeleton; disable the drop zone during processing |
| Desktop layout still shows bottom navigation | Wasted screen real estate on 1920x1080 | Hide BottomNav at 768px+ breakpoint; replace with persistent left sidebar |

---

## "Looks Done But Isn't" Checklist

- [ ] **Theme switching:** Theme variables defined for BOTH dark AND light in index.css — verify `[data-theme='light']` block exists before wiring UI toggle
- [ ] **Theme flash prevention:** Blocking `<script>` in `index.html` applies theme from localStorage BEFORE React mounts — verify no flash on hard reload
- [ ] **File System Access API:** `queryPermission()` called on restored handle — verify it does NOT auto-trigger `requestPermission()` on page load
- [ ] **File System Access API:** Fallback download (Blob URL) works on Firefox/Safari — test export on non-Chrome browser
- [ ] **Desktop layout:** `html { overflow: hidden }` scoped to mobile only — verify desktop pages are scrollable
- [ ] **BottomNav:** Hidden at `min-width: 768px` AND page-level `padding-bottom` also removed at that breakpoint — no phantom gap
- [ ] **Push notifications:** `Notification.requestPermission()` only called in `onClick` — never in `useEffect` or on mount
- [ ] **Push subscriptions:** D1 table includes `staff_id` foreign key — verify subscription is associated to authenticated user
- [ ] **Web Push + CF Workers:** Push send function uses `@block65/webcrypto-web-push` or Web Crypto API — NOT `web-push` npm package
- [ ] **Drag-and-drop:** File input fallback visible and functional on mobile — verify on iOS Safari

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Desktop scroll broken by `overflow: hidden` | LOW | Scope existing rule to mobile media query; 1-line CSS fix |
| Theme flash on reload | LOW | Add blocking script to index.html; no component changes needed |
| Wrong push library used (web-push on CF Workers) | MEDIUM | Swap library, regenerate VAPID keys, delete all existing push subscriptions in D1, re-prompt all users to re-enable notifications |
| FileSystemHandle stored in localStorage (JSON-serialized to `{}`) | LOW | Migrate storage to IndexedDB; existing localStorage key is silently invalid and can be cleared |
| No user gesture for iOS notification permission | LOW | Move `requestPermission()` call from `useEffect` to button `onClick`; no DB changes needed |
| Push subscriptions without staff_id (orphaned) | MEDIUM | Add `staff_id` column migration, delete all rows, re-prompt all 4 users to re-enable notifications in settings |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| `overflow: hidden` blocking desktop scroll | Phase 1: Desktop layout foundation | Scroll through longest page (inspection history) in desktop window |
| BottomNav covering desktop content | Phase 1: Desktop layout foundation | Inspect bottom of every page at 1920x1080 |
| Hardcoded hex colors in inline styles not responding to theme | Phase 3: Settings panel (pre-implementation audit) | Apply light theme; verify every component changes color |
| Theme flash on page load | Phase 3: Settings panel | Hard-reload 5x after selecting light theme; no dark flash |
| `showDirectoryPicker()` user gesture requirement | Phase 2: File System Access API | Verify handle restoration on browser restart without crash |
| File System API unavailable on non-Chrome | Phase 2: File System Access API | Test export on Firefox; verify fallback download works |
| `web-push` package incompatibility | Phase 5: Notification system | `wrangler dev` must start without crypto errors |
| iOS notification gesture requirement | Phase 5: Notification system | Test on iOS Safari with installed PWA; permission dialog must appear |
| Push subscription without staff_id | Phase 5: Notification system (D1 schema design) | D1 schema review before first line of handler code |
| Drag-and-drop with no mobile fallback | Phase 4: Drag-and-drop upload | Test on iOS Safari; file input must be tappable |

---

## Sources

- Chrome Developers — [Persistent permissions for the File System Access API](https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api) (HIGH confidence)
- Chrome Developers — [The File System Access API: simplifying access to local files](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access) (HIGH confidence)
- MDN — [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) (HIGH confidence)
- GitHub Issue — [web-push-libs/web-push Cloudflare Worker support](https://github.com/web-push-libs/web-push/issues/718) (HIGH confidence — confirmed incompatibility)
- GitHub — [@block65/webcrypto-web-push](https://github.com/block65/webcrypto-web-push) (HIGH confidence — CF Workers compatible)
- MagicBell — [PWA iOS Limitations and Safari Support 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) (MEDIUM confidence)
- Cloudflare Docs — [Node.js compatibility in Workers 2025](https://blog.cloudflare.com/nodejs-workers-2025/) (HIGH confidence)
- web.dev — [DataTransfer API / drag-and-drop cross-platform](https://web.dev/articles/datatransfer) (HIGH confidence)
- Josh W. Comeau — [CSS Variables for React Devs](https://www.joshwcomeau.com/css/css-variables-for-react-devs/) (MEDIUM confidence)
- Direct codebase analysis: `src/index.css`, `src/components/BottomNav.tsx`, `src/components/SettingsPanel.tsx`, `src/components/SideMenu.tsx` (HIGH confidence)

---
*Pitfalls research for: PWA desktop optimization — CHA Bio Complex Fire Safety Management System v1.1*
*Researched: 2026-04-04*

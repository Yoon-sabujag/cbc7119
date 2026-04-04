# Stack Research

**Domain:** PWA desktop optimization — fire safety management system
**Project:** CHA Bio Complex Fire Safety Management System — v1.1
**Researched:** 2026-04-04
**Confidence:** HIGH

**Scope:** Additions and changes ONLY for v1.1 milestone features. The existing validated stack
(React 18, TypeScript 5.6, Vite 5.4, Zustand 5, TanStack Query 5, Tailwind CSS 3, Cloudflare
Pages/D1/R2, fflate, jose, date-fns, react-hot-toast, vite-plugin-pwa) is UNCHANGED.

---

## Verdict Summary

Five new feature areas. One new runtime dependency (`idb-keyval`). Everything else is pure
browser APIs, CSS variable extension, and React component work on top of the existing stack.

---

## Recommended Stack

### Core Technologies (Unchanged)

All existing. Do not upgrade. No version changes required for v1.1.

### New Runtime Dependency

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| idb-keyval | 6.2.2 | Persist `FileSystemDirectoryHandle` across browser restarts via IndexedDB | Jake Archibald (Google) maintained. 295–573 bytes brotli'd. Zero config. Structured clone algorithm means FileSystem handles serialize without custom marshalling. The File System Access API spec explicitly calls out IndexedDB as the persistence mechanism — idb-keyval is the minimal correct implementation. |

**Install:**
```bash
npm install idb-keyval
```

No other new runtime dependencies.

---

## Feature-by-Feature Stack Analysis

### 1. 데스크톱 레이아웃 (1920x1080 Desktop Layout)

**What's needed:** Sidebar navigation for wide screens (≥1024px), multi-panel content area,
wider tables, persistent sidebar state on desktop.

**Stack:** Pure CSS + Tailwind responsive classes. No new library.

**Approach:**
- Use Tailwind's `lg:` prefix breakpoint (1024px) as the desktop threshold. This aligns with
  Tailwind's built-in breakpoints and is a natural boundary between tablet portrait and desktop.
- Pattern: add `lg:` responsive classes to existing components. Bottom nav hides on `lg:hidden`,
  sidebar shows on `lg:flex`. Root layout shifts from single-column to two-column with CSS Grid
  or Flexbox — existing Tailwind already supports this.
- Desktop sidebar: fixed 240px left panel with logo + nav items. Main content takes remaining
  width. No third-party sidebar component needed — the existing `SideMenu.tsx` can be adapted
  into a persistent desktop nav rail.
- Sidebar open state: add `desktopSidebarCollapsed: boolean` to Zustand store (same store as
  auth). Persisted via existing `persist` middleware — no new state solution.
- PWA `display: standalone` + `orientation` manifest update: change from `'portrait'` to remove
  the constraint, allowing landscape/desktop sizing. Done in `vite.config.ts` VitePWA manifest.

**Integration point:** `src/App.tsx` wraps all pages. Add a `<DesktopLayout>` wrapper component
that conditionally renders sidebar + main content area at `lg:` breakpoint.

**No new dependency.**

---

### 2. File System Access API — 점검일지 폴더 지정 자동 저장

**What's needed:** User picks a local folder once via browser dialog. App saves xlsx/pdf files
directly to that folder without a browser download prompt. On next visit, app reuses the stored
folder handle without re-prompting (Chrome 122+ installed PWA behavior).

**Stack:** Native `window.showDirectoryPicker()` + `idb-keyval` for handle persistence.

**Browser API methods used:**
- `window.showDirectoryPicker()` — opens folder picker, returns `FileSystemDirectoryHandle`
- `handle.getFileHandle(filename, { create: true })` — creates a file within the folder
- `writable = await fileHandle.createWritable()` — opens write stream
- `writable.write(blob)` + `writable.close()` — writes xlsx/pdf blob to disk
- `handle.queryPermission({ mode: 'readwrite' })` — checks if permission still valid
- `handle.requestPermission({ mode: 'readwrite' })` — re-requests if needed

**Persistence with idb-keyval:**
```typescript
import { get, set } from 'idb-keyval'

// Store handle after user picks folder
await set('saveDirectoryHandle', dirHandle)

// Restore on next visit
const stored = await get<FileSystemDirectoryHandle>('saveDirectoryHandle')
if (stored) {
  const perm = await stored.queryPermission({ mode: 'readwrite' })
  if (perm === 'granted') { /* use handle */ }
  else { await stored.requestPermission({ mode: 'readwrite' }) }
}
```

**Chrome 122+ installed PWA behavior:** When the app is installed as a PWA, Chrome
automatically persists permissions after first grant. The three-way "allow this time / always
allow / deny" prompt is skipped entirely for installed PWAs — the app gets persistent access by
default. This means the one-time re-permission flow is only relevant for the rare case of
running in a regular browser tab.

**Feature detection + graceful fallback:**
```typescript
const supported = 'showDirectoryPicker' in window
// If not supported (Firefox, Safari, older Chrome): fall back to
// existing browser download (URL.createObjectURL + <a>.click() pattern)
```

**Integration point:** New utility `src/utils/fsAccess.ts` exporting `pickSaveDirectory()`,
`saveFileToDirectory(handle, filename, blob)`, `restoreSavedDirectory()`. Used by
`generateExcel.ts` and any PDF export function.

**New dependency:** `idb-keyval@6.2.2` (adds ~600 bytes).

---

### 3. 설정 패널 — 테마 시스템 (Theme Switching)

**What's needed:** Three modes: dark (current), light, system. Selection persisted to
localStorage. Zero flash on reload. Works with existing CSS variable design tokens already
in `src/index.css`.

**Stack:** CSS custom properties (already in place) + `data-theme` attribute on `<html>` + Zustand
store + inline `<script>` in `index.html` to prevent FOUC. No new library.

**Why no new library:** The existing CSS already uses `--bg`, `--bg2`, `--t1`, etc. as custom
properties. Adding a light theme is simply adding a `[data-theme="light"]` block in `index.css`
that overrides these variables. This is the standard, library-free approach.

**Why NOT Tailwind `darkMode: 'class'`:** The codebase uses inline styles (`style={{ background: 'var(--bg)' }}`)
almost exclusively — not Tailwind utility classes. Switching to `dark:bg-*` classes would require
rewriting every component. The CSS variable approach requires only adding a new `:root[data-theme="light"]`
block with overridden values — zero component changes.

**Implementation pattern:**

`src/index.html` — add before `</head>` to prevent flash:
```html
<script>
  (function(){
    var t = localStorage.getItem('theme') || 'dark';
    if (t === 'system') t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  })()
</script>
```

`src/index.css` — add light theme block:
```css
:root[data-theme="light"] {
  --bg:  #f6f8fa;
  --bg2: #ffffff;
  --bg3: #f0f2f5;
  --bg4: #e6eaef;
  --bd:  rgba(0,0,0,0.08);
  --bd2: rgba(0,0,0,0.15);
  --t1:  #1c2128;
  --t2:  #57606a;
  --t3:  #8c959f;
  /* accent + status colors: same as dark */
}
```

Zustand store (`authStore.ts` or a new `settingsStore.ts`): `theme: 'dark' | 'light' | 'system'`
with a `setTheme(t)` action that writes `data-theme` to `document.documentElement` and saves to
`localStorage`. Persisted via existing Zustand `persist` middleware.

**Integration point:** `SettingsPanel.tsx` theme `<select>` is already present as UI — just wire
its `onChange` to the store action. The existing `option` elements already have the three values.

**No new dependency.**

---

### 4. 메뉴표 업로드 — 드래그 앤 드롭 (Drag-and-Drop File Upload)

**What's needed:** Drag a file (image or PDF) onto a drop zone in `MealPage.tsx` or wherever
weekly menu is managed. Show preview. Upload to R2 via existing upload API.

**Stack:** Native HTML5 drag-and-drop events + React state. No library.

**Why no react-dropzone (v15):** react-dropzone adds ~7kb. The use case here is a single file
drop for the weekly menu — one component, infrequently used. Native `onDragOver`, `onDrop`,
`onDragLeave` with `event.preventDefault()` covers the requirement in ~30 lines of TypeScript.

**Pattern:**
```typescript
function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{ border: `2px dashed ${dragging ? 'var(--acl)' : 'var(--bd2)'}`, ... }}
    >
      드래그하거나 클릭하여 파일 선택
    </div>
  )
}
```

The `onFile` callback feeds into the existing R2 upload flow already used by `PhotoButton.tsx`
and inspection photo upload.

**Click fallback:** Hidden `<input type="file" accept="image/*,.pdf">` triggered by clicking the
zone — same pattern as `PhotoButton.tsx` already uses.

**No new dependency.**

---

### 5. 알림 시스템 (Local Notification System)

**What's needed:** In-app alerts for incomplete inspection deadlines, unresolved items, upcoming
elevator inspections. SettingsPanel has three toggle rows for these.

**What NOT to build for this milestone:** Push notifications (Web Push API + VAPID keys + push
service) — explicitly out-of-scope per PROJECT.md and the previous STACK.md. Web Push requires
a server component to store subscriptions, Cloudflare Workers compatibility issues with the
Push API have been noted, and the 4-person team can tolerate in-app-only alerts.

**Scope for v1.1:** In-app notification badges + browser Notification API (foreground alerts only).

**Browser Notification API — Desktop Chrome/Edge:**
```typescript
// Request permission once (user gesture required)
const perm = await Notification.requestPermission()

// Show notification while app is in foreground
if (perm === 'granted') {
  new Notification('점검 미완료', {
    body: '오늘 마감 1시간 전입니다',
    icon: '/icons/icon-192.png'
  })
}
```

For PWA installed on desktop, the `ServiceWorkerRegistration.showNotification()` method is
preferred over `new Notification()` constructor — it works when the app tab is not focused:
```typescript
const reg = await navigator.serviceWorker.ready
await reg.showNotification('점검 미완료', { body: '...', icon: '...' })
```

**Scheduling approach:** The app is a desktop PWA used during work hours. A simple
`setInterval` check on app load (every 10–15 minutes while the app is open) is sufficient for
the use cases described. Notification Triggers API (time-based scheduling) was abandoned by
Chrome team and is no longer being pursued — do not use it.

**Notification settings persistence:** Store `notificationPrefs: { missedInspection: boolean, unresolvedItems: boolean, elevatorReminder: boolean }` in a new settings Zustand store (or extend `authStore`) with `persist` middleware. The three toggles in `SettingsPanel.tsx` are already rendered — wire them to this store.

**Notification permission state:** Track `notifPermission: NotificationPermission` in the same
store. Initialize from `Notification.permission` on app load. Show a "알림 권한 필요" prompt in
SettingsPanel if permission is `'default'`.

**No new dependency.** The Notifications API is a standard browser API available in all Chrome
and Edge versions this project targets.

---

## Installation

```bash
# One new runtime dependency
npm install idb-keyval
```

That is the only `npm install` needed for this entire milestone.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Native `window.showDirectoryPicker()` | `browser-fs-access` (Google Chrome Labs) | Use browser-fs-access if you need Safari/Firefox fallback via `<input>` picker. For this project, Chrome/Edge only is explicitly accepted (PROJECT.md), so the ~4kb overhead is unnecessary. |
| `idb-keyval` for handle persistence | Raw `indexedDB.open()` + `IDBObjectStore` | Use raw IndexedDB only if you need custom database schema or multiple object stores. idb-keyval's simple key-value surface covers the one-handle-per-user use case perfectly. |
| CSS variable `data-theme` toggle | Tailwind `darkMode: 'class'` with `dark:` utilities | Use Tailwind dark mode class strategy if your components use Tailwind utility classes for colors. This codebase uses inline `style={{ background: 'var(--bg)' }}` throughout — zero benefit from Tailwind dark mode utilities. |
| Native HTML5 drag-and-drop | `react-dropzone@15` | Use react-dropzone when you need multi-file, file type validation, error states, and ARIA accessibility at scale. Single-file infrequent upload does not justify 7kb+ dependency. |
| In-app + browser Notification API | Web Push (VAPID + service) | Use Web Push when notifications must arrive even when the app is closed and the device is off. Not required here: app is open during work hours, 4-person team. |
| `setInterval` scheduling | Notification Triggers API | Notification Triggers API has been abandoned by the Chrome team. Do not use. |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-dropzone` | 7kb for a single infrequent file drop. Overkill. | Native HTML5 drag-and-drop, ~30 lines |
| `browser-fs-access` | Chrome/Edge-only is accepted per PROJECT.md. Adds 4kb for a fallback path that will never be used. | Direct `window.showDirectoryPicker()` with `supported` feature flag |
| Notification Triggers API | Chrome team abandoned this API; it is no longer being actively developed | `setInterval` + `ServiceWorkerRegistration.showNotification()` |
| Web Push API | Requires VAPID key management, subscription storage, CF Workers push compatibility issues noted in prior research | Browser Notification API (foreground/installed PWA) |
| `react-use` or `ahooks` | Adds hundreds of hooks you don't need. The 5 hooks actually needed (`useMediaQuery`, `useLocalStorage`, etc.) are each <10 lines to write directly. | Direct React hooks + browser APIs |
| Tailwind CSS v4 upgrade | Breaking change from v3. `@custom-variant` syntax differs. No `tailwind.config.js`. Migration cost for zero new capability in this codebase. | Stay on Tailwind CSS 3.4.x |
| Any UI component library (MUI, shadcn, etc.) | Entire codebase uses inline styles with CSS variables. Mixing a component library's CSS-in-JS or Tailwind utilities with this approach creates specificity conflicts. | Continue inline style pattern |

---

## Stack Patterns by Variant

**If user opens app as installed PWA (desktop Chrome/Edge):**
- File System Access API persistent permissions activate automatically (Chrome 122+)
- No `queryPermission()` → `requestPermission()` cycle needed on return visits
- `ServiceWorkerRegistration.showNotification()` works even when app window is minimized

**If user opens app in browser tab (not installed):**
- File System Access API works but requires `requestPermission()` on each tab session
- Stored `FileSystemDirectoryHandle` in idb-keyval still valid; only permission needs re-grant
- `new Notification()` constructor works but only when tab is active/focused

**If user is on mobile (iOS/Android):**
- `showDirectoryPicker()` not available — graceful fallback to standard file download
- Notifications on iOS PWA: require iOS 16.4+ for Web Push; `new Notification()` unavailable
- Desktop layout (`lg:` breakpoint) does not activate; mobile layout unchanged

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `idb-keyval@6.2.2` | React 18, TypeScript 5.x, Vite 5.x | ESM-only. Tree-shakeable. No peer dependencies. Works in Cloudflare Workers environment if needed but here used in browser context only. |
| File System Access API | Chrome 86+, Edge 86+ (native) | Chrome 122+ adds persistent permissions. Chrome 122 was released Feb 2024 — all modern Chrome installs qualify. Safari: not supported. Firefox: not supported. |
| Notifications API | Chrome 22+, Edge 14+, Firefox 22+, Safari 7+ | `ServiceWorkerRegistration.showNotification()`: Chrome 44+, Edge 17+. All target platforms qualify. |
| `data-theme` CSS attribute | All browsers | No compatibility concern. Pure CSS. |
| HTML5 Drag and Drop | All browsers | `DataTransfer.files` works in all target browsers. |

---

## Sources

- Chrome Developers — File System Access API: https://developer.chrome.com/docs/capabilities/web-apis/file-system-access
- Chrome Blog — Persistent Permissions (Chrome 122): https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api
- caniuse.com — File System Access API: https://caniuse.com/native-filesystem-api
- MDN — Notifications API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
- MDN — ServiceWorkerRegistration.showNotification(): https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
- idb-keyval GitHub (Jake Archibald, Google): https://github.com/jakearchibald/idb-keyval
- Chrome Platform Status — Notification Triggers (abandoned): https://developer.chrome.com/docs/web-platform/notification-triggers
- Tailwind CSS v3 — Dark Mode: https://v3.tailwindcss.com/docs/dark-mode
- DEV Community — Drag-and-drop in React without libraries: https://dev.to/hexshift/implementing-drag-drop-file-uploads-in-react-without-external-libraries-1d31

---
*Stack research for: CHA Bio Complex PWA Desktop Optimization (v1.1)*
*Researched: 2026-04-04*

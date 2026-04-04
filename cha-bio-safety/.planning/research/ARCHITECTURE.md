# Architecture Research

**Domain:** PWA Desktop Optimization — existing React SPA + Cloudflare Pages Functions
**Researched:** 2026-04-04
**Confidence:** HIGH (based on direct codebase inspection + official docs)

---

## Standard Architecture

### System Overview (Current + New)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Browser (Chrome/Edge)                          │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  App.tsx: Layout shell                                           │  │
│  │   ┌───────────────┐  ┌─────────────┐  ┌───────────────────┐    │  │
│  │   │  GlobalHeader  │  │  SideMenu   │  │  SettingsPanel    │    │  │
│  │   │  (mobile nav) │  │ (slide-in)  │  │ (slide-in right)  │    │  │
│  │   └───────────────┘  └─────────────┘  └───────────────────┘    │  │
│  │                                                                   │  │
│  │   ┌─────────────────────────────────────────────────────────┐   │  │
│  │   │  <Routes> — lazy-loaded pages (22 routes)               │   │  │
│  │   └─────────────────────────────────────────────────────────┘   │  │
│  │                                                                   │  │
│  │   ┌───────────────────────────────────────────────────────────┐  │  │
│  │   │  BottomNav (fixed, mobile)  [DESKTOP: hidden or sidebar]  │  │  │
│  │   └───────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Browser APIs (new integrations)                               │   │
│  │   File System Access API │ Notification API │ DataTransfer API │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                              │ HTTP/fetch
┌──────────────────────────────────────────────────────────────────────┐
│                  Cloudflare Pages Functions (edge)                    │
│   /api/menu     /api/uploads    /api/dashboard   ... (22 routes)     │
│              _middleware.ts — JWT verify + CORS                       │
└──────────────────────────────────────────────────────────────────────┘
                   │ D1 binding          │ R2 binding
           ┌───────────────┐    ┌────────────────────┐
           │  D1 (SQLite)  │    │  R2 (object store) │
           └───────────────┘    └────────────────────┘
```

### What Changes for v1.1

The backend is untouched except for one new endpoint (`PATCH /api/staff/:id/profile`). All v1.1 work is frontend-only plus two new utility hooks and one new Zustand store slice.

---

## Component Responsibilities

### Existing Components — What Gets Modified

| Component | Current State | v1.1 Change |
|-----------|---------------|-------------|
| `App.tsx` / `Layout` | Single layout, always shows BottomNav + GlobalHeader when `showNav` | Add `isDesktop` media query hook; render `DesktopSidebar` instead of `SideMenu`+`BottomNav` on desktop |
| `SettingsPanel.tsx` | Slide-in panel, theme/notification rows are static/non-functional | Wire to `useSettingsStore`; implement actual theme switching + notification permission flow |
| `SideMenu.tsx` | Mobile slide-in drawer (88% width, max 300px) | No changes; stays for mobile. Desktop uses `DesktopSidebar` |
| `GlobalHeader.tsx` | Fixed 48px header with hamburger + optional rightSlot | On desktop: hamburger hidden (sidebar always visible); rightSlot layout can expand |
| `ReportsPage.tsx` | Calls `generateXxxExcel()` which triggers browser download | Add `useFsaExportDir` hook call: if directory handle exists, save to folder; otherwise fall back to browser download |
| `MealPage.tsx` (menu tab) | Tab shows "준비 중" placeholder | Replace placeholder with `MenuUpload` drop zone component |
| `index.css` | Dark-only CSS variables on `:root` | Add `[data-theme="light"]` block overriding all `--bg*`, `--t*`, `--bd*` variables |

### New Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `DesktopSidebar` | `src/components/DesktopSidebar.tsx` | Permanent left sidebar (240px) replacing SideMenu+BottomNav on desktop. Contains nav links, user card, logout. Reuses MENU constant from SideMenu. |
| `MenuUploadZone` | `src/components/MenuUploadZone.tsx` | Drag-and-drop zone for PDF/image menu files. Calls `POST /api/uploads` then `POST /api/menu`. Used inside MealPage. |
| `FsaDirPicker` | `src/components/FsaDirPicker.tsx` | Settings row showing chosen folder path + "폴더 변경" button. Calls `showDirectoryPicker()`. Reads/writes handle via `useFsaExportDir`. |

### New Hooks

| Hook | Location | Responsibility |
|------|----------|----------------|
| `useIsDesktop` | `src/hooks/useIsDesktop.ts` | `window.matchMedia('(min-width: 1024px)')` with SSR safety. Returns boolean. Used by Layout to branch between mobile/desktop rendering. |
| `useFsaExportDir` | `src/hooks/useFsaExportDir.ts` | Persists `FileSystemDirectoryHandle` in IndexedDB (idb-keyval or raw IndexedDB). Exposes `{ dirHandle, pickDir, saveFile }`. Falls back to browser download if handle is null or permission denied. |

### New Store Slice

| Store | Location | What It Persists |
|-------|----------|-----------------|
| `useSettingsStore` | `src/stores/settingsStore.ts` | `theme: 'dark' | 'light' | 'system'`, `notificationsEnabled: boolean`, `weekBaseline: 'this-week' | 'last-7-days'`. Persisted to localStorage via Zustand `persist` middleware (same pattern as `authStore`). |

---

## Recommended Project Structure (additions only)

```
src/
├── components/
│   ├── DesktopSidebar.tsx    # NEW — permanent nav for ≥1024px
│   ├── MenuUploadZone.tsx    # NEW — drag-drop PDF/image upload
│   ├── FsaDirPicker.tsx      # NEW — File System Access dir picker row
│   ├── GlobalHeader.tsx      # MODIFY — hide hamburger on desktop
│   ├── SettingsPanel.tsx     # MODIFY — wire to settingsStore
│   └── SideMenu.tsx          # MODIFY — minor: no structural change
├── hooks/
│   ├── useIsDesktop.ts       # NEW — matchMedia breakpoint hook
│   └── useFsaExportDir.ts    # NEW — File System Access + IndexedDB
├── stores/
│   ├── authStore.ts          # unchanged
│   └── settingsStore.ts      # NEW — theme + notifications + prefs
└── index.css                 # MODIFY — add [data-theme="light"] block
```

No new API routes required except one optional profile update endpoint.

---

## Architectural Patterns

### Pattern 1: Responsive Layout Branching in Layout Shell

**What:** Single `Layout` component in `App.tsx` conditionally renders either the mobile nav set (`GlobalHeader` + `SideMenu` + `BottomNav`) or the desktop nav set (`DesktopSidebar` + simplified `GlobalHeader`). Controlled by `useIsDesktop()`.

**When to use:** Applies only to the `Layout` function in `App.tsx`. Pages themselves do not need to know whether they're on mobile or desktop — they render inside the content area regardless.

**Trade-offs:** One shell handles both layouts = no route duplication. Risk: `Layout` grows complex. Mitigation: extract `MobileNav` and `DesktopNav` sub-components.

**Example:**
```typescript
// App.tsx — Layout function (simplified)
function Layout() {
  const isDesktop = useIsDesktop()
  // ...
  return (
    <div style={{ display: 'flex', height: '100dvh' }}>
      {isDesktop
        ? <DesktopSidebar unresolvedCount={unresolvedCount} />
        : null
      }
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!isDesktop && showNav && <GlobalHeader ... />}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Suspense fallback={<Loader />}>
            <Routes>...</Routes>
          </Suspense>
        </main>
        {!isDesktop && showNav && <BottomNav ... />}
      </div>
      {/* SettingsPanel rendered once, toggled by isDesktop ? sidebar button : header button */}
      <SettingsPanel open={settingsOpen} onClose={...} />
    </div>
  )
}
```

### Pattern 2: CSS Variable Theme Switching via data-theme Attribute

**What:** `useSettingsStore` watches `theme` value. A `useEffect` in `App.tsx` applies `document.documentElement.setAttribute('data-theme', resolved)` where `resolved` maps 'system' to `prefers-color-scheme` result. CSS in `index.css` overrides variables under `[data-theme="light"]`.

**When to use:** Only one `useEffect` at the top level. No React context needed — CSS variables propagate globally via cascade.

**Trade-offs:** Zero render overhead for theme changes (DOM attribute swap, not React re-render). Requires writing a full variable override block in CSS. The existing dark theme variables in `:root` stay untouched.

**Example:**
```typescript
// src/stores/settingsStore.ts
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'dark' as 'dark' | 'light' | 'system',
      notificationsEnabled: false,
      weekBaseline: 'this-week' as const,
      setTheme: (t) => set({ theme: t }),
      setNotifications: (v) => set({ notificationsEnabled: v }),
    }),
    { name: 'cha-bio-settings' }
  )
)

// App.tsx — one effect, no context
useEffect(() => {
  const { theme } = useSettingsStore.getState()
  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  document.documentElement.setAttribute('data-theme', resolved)
}, [/* subscribe to theme changes */])
```

```css
/* index.css — add after existing :root block */
[data-theme="light"] {
  --bg:    #f8f9fa;
  --bg2:   #ffffff;
  --bg3:   #f1f3f5;
  --bg4:   #e9ecef;
  --bd:    rgba(0,0,0,0.08);
  --bd2:   rgba(0,0,0,0.14);
  --t1:    #1a1d20;
  --t2:    #495057;
  --t3:    #868e96;
  /* accent/status colors unchanged — already work on light */
}
```

### Pattern 3: File System Access API with IndexedDB Persistence + Graceful Fallback

**What:** `useFsaExportDir` stores `FileSystemDirectoryHandle` in IndexedDB (not localStorage — handles are not JSON-serializable). On save, it calls `dirHandle.requestPermission({ mode: 'readwrite' })` first — permissions do NOT auto-persist across browser restarts in most Chrome versions. If permission is denied or handle is null, falls back to the existing browser download (`URL.createObjectURL`).

**When to use:** Invoked in `ReportsPage` and `DailyReportPage` after Excel generation, replacing or wrapping the current `generateXxxExcel()` call pattern.

**Trade-offs:** Chrome 86+ required. Permission re-prompts after browser restart are unavoidable (Chrome policy). The fallback ensures zero breakage on non-Chrome browsers and cases where the user hasn't set a folder yet. Safari and Firefox will always use the fallback path.

**Example:**
```typescript
// src/hooks/useFsaExportDir.ts
const DB_NAME = 'cha-bio-fsa'
const STORE   = 'handles'
const KEY     = 'exportDir'

export function useFsaExportDir() {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null)

  useEffect(() => {
    // Load persisted handle from IndexedDB on mount
    openDb().then(db => getHandle(db, KEY)).then(h => setDirHandle(h ?? null))
  }, [])

  const pickDir = async () => {
    if (!('showDirectoryPicker' in window)) {
      toast.error('이 브라우저는 폴더 선택을 지원하지 않습니다 (Chrome/Edge 필요)')
      return
    }
    const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
    const db = await openDb()
    await putHandle(db, KEY, handle)
    setDirHandle(handle)
  }

  const saveFile = async (filename: string, blob: Blob): Promise<boolean> => {
    if (!dirHandle) return false
    try {
      const perm = await dirHandle.requestPermission({ mode: 'readwrite' })
      if (perm !== 'granted') return false
      const fileHandle = await dirHandle.getFileHandle(filename, { create: true })
      const writable   = await fileHandle.createWritable()
      await writable.write(blob)
      await writable.close()
      return true
    } catch {
      return false
    }
  }

  return { dirHandle, pickDir, saveFile }
}
```

### Pattern 4: Native Drag-and-Drop File Upload (No Library)

**What:** `MenuUploadZone` uses four native React event handlers (`onDragEnter`, `onDragLeave`, `onDragOver`, `onDrop`) to accept PDF or image files. On drop, it calls `e.dataTransfer.files[0]`, compresses if image (reusing existing `imageUtils.ts`), then POSTs to `/api/uploads` (existing endpoint) before calling `POST /api/menu` with the returned key.

**When to use:** Only needed in `MealPage` menu tab. No external library (`react-dropzone` etc.) needed for a single upload zone — the codebase pattern avoids adding dependencies for single-use features.

**Trade-offs:** ~40 lines of event handling vs. zero with a library. For one upload zone this is acceptable. If more upload zones appear later, extract a `useDragDrop` hook.

**Example:**
```typescript
// src/components/MenuUploadZone.tsx (simplified)
function MenuUploadZone({ onUploaded }: { onUploaded: () => void }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    // validate: PDF or image only
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('PDF 또는 이미지 파일만 업로드 가능합니다')
      return
    }
    // upload via existing /api/uploads pattern
    const formData = new FormData()
    formData.append('file', file)
    // ... fetch POST, then POST /api/menu with pdf_key
    onUploaded()
  }

  return (
    <div
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragging ? 'var(--acl)' : 'var(--bd2)'}`,
        borderRadius: 12,
        padding: '40px 24px',
        textAlign: 'center',
        background: isDragging ? 'rgba(59,130,246,0.08)' : 'var(--bg3)',
        transition: 'all 0.15s',
        cursor: 'pointer',
      }}
    >
      {/* visual prompt */}
    </div>
  )
}
```

### Pattern 5: Notification Permission — User-Gesture Triggered Only

**What:** Chrome requires Notification.requestPermission() to be called from a user gesture (click handler), not on page load. The `SettingsPanel` toggle for notifications calls permission on first enable. The actual notification scheduling (inspection deadline reminders etc.) uses `setTimeout` logic client-side — no Push API / service worker needed for this use case since the team keeps the app open on their desktop during work.

**When to use:** Wired to the toggle in `SettingsPanel`. Store `notificationsEnabled` in `useSettingsStore`. On app load (in `App.tsx` or `DashboardPage`), if `notificationsEnabled === true` and `Notification.permission === 'granted'`, schedule reminder notifications.

**Trade-offs:** Client-side `setTimeout` notifications only work while the browser tab is open. This is acceptable for a 4-person internal team on desktop. True push (background delivery) would require a Push API subscription + server-side trigger — overkill for this use case.

---

## Data Flow

### Theme Change Flow

```
User clicks theme select in SettingsPanel
    ↓
settingsStore.setTheme('light')       [Zustand mutation]
    ↓
useEffect in App.tsx fires             [subscriber]
    ↓
document.documentElement.setAttribute('data-theme', 'light')
    ↓
CSS cascade applies [data-theme="light"] variable overrides
    ↓
All components re-render with new var() values (no React state change)
```

### Excel Export with FSA Flow

```
User clicks report button in ReportsPage
    ↓
generateXxxExcel() returns Blob        [existing logic, unchanged]
    ↓
useFsaExportDir.saveFile(name, blob)
    ↓
    ├── dirHandle exists?
    │     ↓ YES
    │   requestPermission({ mode: 'readwrite' })
    │     ↓ granted
    │   fileHandle.createWritable() → write → close
    │   toast.success('폴더에 저장되었습니다')
    │
    └── dirHandle null OR permission denied
          ↓
        URL.createObjectURL(blob) → <a>.click()  [existing fallback]
        toast.success('다운로드 완료')
```

### Menu Upload Flow

```
User drops PDF/image onto MenuUploadZone in MealPage
    ↓
onDrop: e.dataTransfer.files[0]
    ↓
POST /api/uploads (existing multipart endpoint, R2 storage)
    ↓ returns { key: "menu/2026-04-07.pdf" }
POST /api/menu { menus: [...], pdf_key: "menu/2026-04-07.pdf" }
    ↓
queryClient.invalidateQueries(['menu'])
    ↓
MealPage re-renders menu tab showing uploaded file
```

### Desktop Layout State Flow

```
window resize or initial load
    ↓
useIsDesktop() matchMedia listener fires
    ↓
isDesktop: boolean → state in Layout component
    ↓
Layout renders:
  isDesktop=true  → DesktopSidebar (fixed left) + no BottomNav + no GlobalHeader hamburger
  isDesktop=false → GlobalHeader + SideMenu (drawer) + BottomNav (fixed bottom)
```

---

## Integration Points

### New vs. Modified — Explicit Boundary

| What | New or Modified | Touches Backend? |
|------|----------------|-----------------|
| `DesktopSidebar.tsx` | NEW | No |
| `MenuUploadZone.tsx` | NEW | Yes — POST /api/uploads (existing), POST /api/menu (existing) |
| `FsaDirPicker.tsx` | NEW | No |
| `useFsaExportDir.ts` hook | NEW | No — browser API + IndexedDB only |
| `useIsDesktop.ts` hook | NEW | No |
| `useSettingsStore` (Zustand) | NEW | Optional: PATCH /api/staff/:id (profile display name) |
| `App.tsx` Layout | MODIFIED | No |
| `SettingsPanel.tsx` | MODIFIED | No (theme/notifications are client-only; password change already works) |
| `GlobalHeader.tsx` | MODIFIED | No |
| `index.css` | MODIFIED | No |
| `ReportsPage.tsx` | MODIFIED | No (wraps existing blob download) |
| `MealPage.tsx` | MODIFIED | Yes — calls existing /api/menu + /api/uploads |

### Internal Component Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `Layout` ↔ `DesktopSidebar` | Props: `unresolvedCount`, `onSettingsOpen` | DesktopSidebar owns its own navigation; emits settings open to Layout |
| `SettingsPanel` ↔ `useSettingsStore` | Direct Zustand reads/writes | No context required; same pattern as authStore |
| `ReportsPage` ↔ `useFsaExportDir` | Hook return values | `saveFile` replaces current `URL.createObjectURL` call sites |
| `MealPage` ↔ `MenuUploadZone` | Callback prop `onUploaded` + React Query invalidation | MealPage owns query invalidation; MenuUploadZone owns upload logic |
| `App.tsx` ↔ theme system | `useSettingsStore` subscription in `useEffect` | One `setAttribute` call controls entire CSS cascade |

---

## Build Order (Phase Dependency)

Build in this order to avoid blocked work:

1. **`useIsDesktop` hook + `DesktopSidebar` component** — No dependencies. Unlocks desktop layout work. Modify `App.tsx` Layout after this. All other desktop UX improvements become possible.

2. **`useSettingsStore` + theme system** — Depends on nothing. Can be done in parallel with step 1. Wire `SettingsPanel` to store after store exists. Apply `[data-theme="light"]` CSS block.

3. **`useFsaExportDir` hook + `FsaDirPicker` component** — Depends on nothing (browser API only). Add `FsaDirPicker` row to `SettingsPanel` (step 2 settingsStore must exist first for UI integration). Wire `ReportsPage` to use `saveFile` fallback pattern.

4. **`MenuUploadZone` + MealPage menu tab** — Depends on nothing. Isolated feature. Replaces the "준비 중" placeholder.

5. **Notification permission wiring** — Depends on `useSettingsStore` (step 2). One toggle in SettingsPanel triggers `Notification.requestPermission()`. Basic client-side reminder scheduling in `DashboardPage`.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Duplicating Pages for Desktop vs. Mobile

**What people do:** Create `/desktop/DashboardPage.tsx` and `/mobile/DashboardPage.tsx` and route to each based on viewport.

**Why it's wrong:** 22 existing pages would all need to be duplicated. State, API calls, and logic diverge over time. The existing pages already use flexible CSS (`var(--bg)`, `100%` widths, flexbox) that adapts to available space.

**Do this instead:** Let pages render in their content area — their layout is driven by the container width. Desktop optimization is a layout shell concern (sidebar vs. bottom nav), not a page concern. Only add `@media` breakpoints inside individual pages when a specific layout (e.g., wider table) needs desktop treatment.

### Anti-Pattern 2: Storing FileSystemDirectoryHandle in localStorage / Zustand persist

**What people do:** Try to JSON.stringify the handle into localStorage or Zustand's localStorage-backed persist.

**Why it's wrong:** `FileSystemDirectoryHandle` is not JSON-serializable. It will either silently fail or throw. The handle is a structured-cloneable object that must be stored in IndexedDB.

**Do this instead:** Use IndexedDB directly (3-5 lines with raw `indexedDB.open(...)`) or add `idb-keyval` (1.5 KB, no other deps). Keep `useFsaExportDir` as the single owner of handle persistence.

### Anti-Pattern 3: Requesting Notification Permission on Mount

**What people do:** Call `Notification.requestPermission()` in a `useEffect` on `DashboardPage` mount.

**Why it's wrong:** Chrome blocks automatic permission prompts. The prompt silently fails or shows a blocked indicator. Users dismiss non-contextual permission requests.

**Do this instead:** Trigger `requestPermission()` only inside the click handler of the SettingsPanel notification toggle. Show the toggle as off and disabled if `Notification.permission === 'denied'` with an explanation to reset in browser settings.

### Anti-Pattern 4: Adding a Theme Context Provider

**What people do:** Wrap the app in `<ThemeContext.Provider value={theme}>` and pass theme down through props/context.

**Why it's wrong:** Unnecessary — the existing architecture already has CSS variables on `:root`. Switching them requires only one DOM attribute change, not a React re-render tree. Adding a context adds boilerplate with no benefit.

**Do this instead:** One `useEffect` in `App.tsx` that reads from `useSettingsStore` and calls `document.documentElement.setAttribute('data-theme', resolved)`. All components consume `var(--bg)` etc. unchanged.

---

## Scaling Considerations

This is a 4-person internal tool. Scaling is not a concern. Notes for completeness:

| Scale | Approach |
|-------|----------|
| 4 users (current) | Everything in this architecture is correct. No changes needed. |
| 40 users | Still fine. D1 SQLite handles this trivially. |
| 400+ users | D1 read replicas, consider moving to Postgres (Hyperdrive). React architecture unchanged. |

---

## Sources

- [File System Access API — Chrome for Developers](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
- [Persistent permissions for File System Access API](https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api)
- [File System API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
- [Can I Use — File System Access API](https://caniuse.com/native-filesystem-api)
- [Notification.requestPermission() — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission_static)
- [CSS Variables theme switching — CSS-Tricks](https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/)
- Codebase inspection: `src/App.tsx`, `src/components/SettingsPanel.tsx`, `src/components/SideMenu.tsx`, `src/components/GlobalHeader.tsx`, `src/components/BottomNav.tsx`, `src/index.css`, `src/pages/ReportsPage.tsx`, `src/pages/MealPage.tsx`, `src/stores/authStore.ts`, `vite.config.ts`

---
*Architecture research for: PWA Desktop Optimization (v1.1)*
*Researched: 2026-04-04*

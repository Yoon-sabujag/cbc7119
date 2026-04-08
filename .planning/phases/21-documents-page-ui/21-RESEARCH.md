# Phase 21: Documents Page UI - Research

**Researched:** 2026-04-09
**Domain:** Pure frontend wiring (React + React Query + Cloudflare Pages) over Phase 20 document APIs
**Confidence:** HIGH (all claims verified by reading actual Phase 20 endpoint files and existing frontend source)

## Summary

Phase 21 is a pure UI wiring phase. Phase 20 backend is fully deployed: list (`GET /api/documents?type=`), download (`GET /api/documents/{id}`, streaming with `Content-Disposition: filename*=UTF-8''...`), and R2 multipart upload (create/upload-part/complete/abort, admin-only). All API shapes are locked and verified against the actual source files in `cha-bio-safety/functions/api/documents/`.

Three discoveries drive the plan and override assumptions in CONTEXT.md:

1. **`<a download>` pattern is ALREADY proven on iOS PWA in this repo.** `LegalFindingsPage.tsx:491-501` downloads multi-MB ZIP blobs via `document.createElement('a')` + `a.download` + programmatic click, with the comment "iOS PWA: `<a download>` 방식이 가장 안정적으로 파일 앱 저장 다이얼로그 트리거". The v1.2 STATE decision ("`<a download>` 미동작 WebKit bug 167341") applies only to **opening HTML reports in a new tab** — where `findingDownload.ts` correctly uses `window.open`. For **binary file downloads from a Blob**, `<a download>` works on iOS 16.3+ standalone PWA and is the established pattern. CONTEXT D-13 is correct — use Blob + `<a download>`.

2. **SideMenu/DesktopSidebar/DEFAULT_SIDE_MENU are THREE separate hardcoded lists.** Adding `/documents` requires editing all three. Worse: `migrateLegacyMenuConfig` in `api.ts` **does not merge new defaults into an already-migrated saved config** — if a user has any saved `{sideMenu: [...]}` config, new items never appear. This is a latent bug the plan must fix.

3. **No shared `<BottomSheet>` component exists.** `LegalFindingsPage.tsx:70` defines `FindingBottomSheet` inline per-page. Mirror this pattern — do not extract a shared component (project rule: avoid speculative abstraction).

**Primary recommendation:** Implement DocumentsPage with inline BottomSheet (mobile) / inline Modal (desktop), patch all three menu lists simultaneously, fix `migrateLegacyMenuConfig` to merge new `DEFAULT_SIDE_MENU` paths into existing saved configs, extract `downloadBlob.ts` and `multipartUpload.ts` utilities (both have concrete reuse value), and keep all auth / role / validation patterns identical to existing pages.

## User Constraints (from CONTEXT.md)

### Locked Decisions
All D-01..D-33 from `21-CONTEXT.md` are locked. Key non-negotiables:

- **D-01/D-32/D-33:** Route `/documents`, lazy import in `App.tsx`, Auth wrapper
- **D-02/D-05:** Single page, both types rendered via one `DocumentSection` component with `type` prop
- **D-03:** Mobile = top tabs, default `plan`
- **D-04:** Desktop (≥1024px) = 2-column layout
- **D-06:** React Query, `queryKey: ['documents', type]`, `staleTime: 60_000`
- **D-07:** Upload success → `invalidateQueries(['documents', type])`
- **D-08:** New `documentsApi` namespace in `src/utils/api.ts`
- **D-09/D-10/D-11:** Latest card + "과거 이력" list (hidden if 0); server already sorts
- **D-12/D-13:** Download via `fetch` with Authorization → `Blob` → `<a download>` (NOT `window.open`). D-12's `window.open` text is superseded by D-13. Extract `src/utils/downloadBlob.ts`.
- **D-14:** Parse `Content-Disposition: filename*=UTF-8''` server header, fallback to metadata `filename`
- **D-15:** `useAuthStore().staff?.role === 'admin'` check; non-admin → upload button fully hidden
- **D-16/D-17:** Mobile = BottomSheet, Desktop = centered Modal. `DocumentUploadForm` component reused in both shells.
- **D-18:** Form fields = year `<select>` (2020..currentYear+1, default currentYear), title text (required), file input with `accept=".pdf,.xlsx,.docx,.hwp,.zip"`, 200MB client-side reject
- **D-19:** Auto-prefill title when file selected and title is empty: `{year}년 소방계획서` / `{year}년 소방훈련자료`
- **D-20/D-21:** Sequential (non-parallel) 10MB parts, last part can be smaller
- **D-22:** No automatic retry on part failure
- **D-23:** `beforeunload` confirm during upload
- **D-24/D-25:** Progress = % + MB/s (3s rolling avg) + ETA(m:ss). Form disabled during upload, only cancel button enabled.
- **D-26/D-27:** On error/cancel → call `abort`, toast Korean error, keep BottomSheet/Modal open with retry button. Abort failure is tolerated silently.
- **D-28/D-29/D-30:** Add menu item to SideMenu + DesktopSidebar + DEFAULT_SIDE_MENU, plus fix Phase 18 merge.
- **D-31:** Both admin and assistant see the menu item; only upload button is gated.

### Claude's Discretion
- Exact spacing, typography, colors (match existing pages)
- BottomSheet/Modal height, animation details
- Progress bar component: reuse vs inline (**recommendation: inline** — no reusable progress bar found in repo)
- Korean toast copy
- Download-in-progress indicator (spinner vs progress)
- Rolling average window implementation details (**recommendation:** sliding window of last 3000ms of `{timestamp, bytesUploaded}` samples, compute delta)
- EmptyState icon/illustration

### Deferred Ideas (OUT OF SCOPE)
- Delete UI (admin mistake recovery) — v1.5+
- PDF preview — download only
- Drag-and-drop upload
- Parallel part upload
- Upload history / audit log UI
- Automatic part retry
- Resumable uploads — abort + restart is simpler
- Other document types — separate migration

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DOC-01 | Download 소방계획서 latest (all staff) | `GET /api/documents?type=plan` → render latest card → Blob download via downloadBlob.ts |
| DOC-02 | Admin upload 소방계획서 (year + title) | DocumentUploadForm → documentsApi.multipart* orchestration |
| DOC-03 | Download past 소방계획서 years | Same list query — server sorts `year DESC, uploaded_at DESC`; past items rendered below latest card |
| DOC-04 | Download 소방훈련자료 latest (all staff) | `GET /api/documents?type=drill` — same DocumentSection with `type="drill"` |
| DOC-05 | Admin upload 소방훈련자료 (~130MB multipart) | Sequential 10MB parts via R2 multipart — endpoint shapes verified in source |
| DOC-06 | Download past 소방훈련자료 years | Same mechanism as DOC-03 |
| DOC-07 | D1 documents table metadata | Already shipped in Phase 20 — no frontend work needed |

## Project Constraints (from CLAUDE.md)

- **Tech stack locked:** Cloudflare Pages + D1 + R2 + Workers. No new dependencies beyond what's already in `package.json` (jose, date-fns, react-query, etc.). No new upload libraries.
- **Cost target:** $0 additional — multipart binding, no presigned URLs, no AWS SDK.
- **Compatibility:** PWA iOS 16.3.1+ / Android 15+ / PC 1920x1080. Blob download must work on iOS standalone mode.
- **Inline styles + CSS variables** (`var(--bg)`, `var(--t1)`, `var(--acl)`, `var(--danger)`, etc.) — no styled-components, no CSS modules.
- **TypeScript `strict: false`** — don't over-engineer types.
- **Korean error messages** for anything user-visible.
- **GSD workflow enforcement:** all edits go through a GSD command.
- **Deploy:** `--branch production` required on wrangler deploy; test on production only.

## Standard Stack

All dependencies already present. Zero new packages.

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| React | 18.3.1 | UI | [VERIFIED: package.json] |
| @tanstack/react-query | 5.59.0 | List queries + invalidation | [VERIFIED: codebase] |
| react-router-dom | 6.26.2 | Route `/documents` | [VERIFIED: App.tsx] |
| zustand | 5.0.0 | `useAuthStore` role check | [VERIFIED: codebase] |
| react-hot-toast | 2.4.1 | Error/success toasts | [VERIFIED: App.tsx:252] |
| date-fns / date-fns-tz | 4.1.0 / 3.2.0 | `uploaded_at` formatting | [VERIFIED: package.json] |
| TypeScript | 5.6.3 (strict: false) | — | [VERIFIED: tsconfig.json] |

**No new installs needed.** `File.slice()`, `fetch`, `AbortController`, `URL.createObjectURL`, `Blob` are all native browser APIs.

## Architecture Patterns

### File Layout (new files)
```
src/
├── pages/
│   └── DocumentsPage.tsx          # route container, desktop/mobile branching
├── components/
│   ├── DocumentSection.tsx        # type-prop component (latest card + past list)
│   └── DocumentUploadForm.tsx     # form content reused in BottomSheet + Modal
└── utils/
    ├── downloadBlob.ts            # fetch-with-auth → Blob → <a download>
    └── multipartUpload.ts         # orchestrate create/upload-part/complete/abort
```

Patch (existing files):
```
src/App.tsx                                 # lazy import + Route
src/components/SideMenu.tsx                 # add to MENU '문서 관리' section
src/components/DesktopSidebar.tsx           # add '/documents' to DESKTOP_SECTIONS['문서 관리'].paths
src/utils/api.ts                            # add documentsApi + add '/documents' to DEFAULT_SIDE_MENU + fix migrateLegacyMenuConfig
```

### Pattern 1: Lazy route registration (App.tsx)
**Source:** `cha-bio-safety/src/App.tsx:42`
```tsx
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
// ...
<Route path="/documents" element={<Auth><DocumentsPage /></Auth>} />
```
`Auth` wrapper handles login check. Suspense fallback is already on the parent `<main>`. Add `'/documents'` to `PAGE_TITLES` map in App.tsx:67 with title `'소방계획서/훈련자료'`.

### Pattern 2: React Query list fetch (mirror `SideMenu.tsx:56`)
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['documents', type],
  queryFn: () => documentsApi.list(type),
  staleTime: 60_000,
})
```
On upload success:
```tsx
queryClient.invalidateQueries({ queryKey: ['documents', type] })
```

### Pattern 3: `req<T>()` wrapper (api.ts:9)
`req<T>(path, init)` auto-injects `Authorization: Bearer {token}` from `useAuthStore`. On 401 (except login), auto-logout + redirect. JSON body only — it sets `Content-Type: application/json`. **For raw binary body uploads (upload-part), we must bypass this** — see Pattern 5.

### Pattern 4: BottomSheet (inline, per-page)
**Source:** `LegalFindingsPage.tsx:70-300+` (full component defined inline in the same file as the page).
```tsx
function DocumentUploadBottomSheet({ type, onClose }: Props) {
  // ... state + form ...
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        zIndex: 50, overscrollBehavior: 'contain',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', borderRadius: '16px 16px 0 0',
        animation: 'slideUp 0.28s ease-out both',
        maxHeight: '90vh', overflowY: 'auto', overscrollBehavior: 'contain',
      }}>
        {/* 드래그 핸들 */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:12 }}>
          <div style={{ width:32, height:4, background:'var(--bd2)', borderRadius:2 }} />
        </div>
        {/* content */}
      </div>
    </div>
  )
}
```
Add `@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }` via an inline `<style>` tag or reuse the existing keyframes in LegalFindingsPage. **Do NOT extract a shared BottomSheet component.**

### Pattern 5: Desktop Modal (no existing component — new inline)
No shared modal exists. Inline using the same fixed-overlay pattern, centered instead of bottom-aligned:
```tsx
<div onClick={onClose} style={{
  position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
  display:'flex', alignItems:'center', justifyContent:'center', zIndex:50,
}}>
  <div onClick={e => e.stopPropagation()} style={{
    background:'var(--bg2)', borderRadius:12, border:'1px solid var(--bd2)',
    width:'min(480px, 92vw)', maxHeight:'90vh', overflowY:'auto', padding:20,
  }}>
    {/* same DocumentUploadForm content */}
  </div>
</div>
```
`DocumentUploadForm` is a presentational component that receives props and renders form fields; both shells wrap it.

### Pattern 6: Responsive branching
Use `useIsDesktop()` hook from `src/hooks/useIsDesktop.ts` (breakpoint `(min-width: 1024px)`):
```tsx
const isDesktop = useIsDesktop()
// mobile: <Tabs> + <DocumentSection type={activeTab} />
// desktop: <div style={{ display:'flex', gap:24, maxWidth:1200, margin:'0 auto' }}>
//            <DocumentSection type="plan" /><DocumentSection type="drill" />
//          </div>
```

### Pattern 7: Admin role gate (mirror `AdminPage.tsx:565`)
```tsx
const { staff } = useAuthStore()
const isAdmin = staff?.role === 'admin'
// ...
{isAdmin && <button onClick={openUpload}>업로드</button>}
```

### Anti-Patterns to Avoid
- **`window.open('/api/documents/{id}')`** — Authorization header not sent; will 401. Use Blob fetch.
- **`<a download>` on a `/api/...` URL directly** — same problem, no auth header.
- **Extracting shared BottomSheet/Modal component** — violates CLAUDE.md "no speculative abstraction"; existing code inlines them per-page.
- **Buffering entire file into memory before upload** — use `File.slice()` → `fetch(..., { body: slice })` so the browser streams each part.
- **`Promise.all` for parallel parts** — CONTEXT D-20 explicitly sequential.
- **Path alias imports** — tsconfig has no aliases; use relative paths.
- **Editing only SideMenu.tsx** — will not appear on desktop; DesktopSidebar has a separate hardcoded list.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT Authorization header injection | Your own fetch wrapper | `req<T>()` / `api.get/post/put` from `api.ts` | Auto-logout on 401, token from store |
| Multipart upload protocol | Custom server-side upload state | Phase 20 endpoints (create/upload-part/complete/abort) | Already deployed, verified |
| R2 direct PUT with presigned URLs | SigV4 signing in client | Phase 20 multipart binding | CONTEXT D-08 (Phase 20) explicitly rejects SDK/presigned |
| Role-based UI gating | Custom permission system | `useAuthStore().staff?.role` | Established pattern |
| Filename encoding for downloads | Custom header | Server already emits `filename*=UTF-8''encoded` | Phase 20 `[id].ts:27` verified |
| Korean filename safe-name in R2 key | Client-side slugify | Server's `buildR2Key` handles it | `_helpers.ts:34` verified |
| File validation | Reinventing | Whitelist duplicated from `_helpers.ts:6-12` | Dual extension+MIME check both client AND server |

## Runtime State Inventory

> Rename/refactor: **not applicable** — greenfield feature addition. However, menu state affects existing users:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | D1 `app_settings` rows with `key='menu_config_{staffId}'` containing `{sideMenu: [...]}` JSON per user | **Data migration via client:** Fix `migrateLegacyMenuConfig` in `src/utils/api.ts` to merge new DEFAULT_SIDE_MENU items into existing saved configs on next load. On `SideMenu` mount, if the new `/documents` path is missing from saved config, insert it and call `settingsApi.saveMenu(updated)`. No server-side migration — D1 `app_settings` row is rewritten on next save. |
| Live service config | None | — |
| OS-registered state | None | — |
| Secrets/env vars | None — JWT_SECRET, STORAGE, DB bindings already configured | — |
| Build artifacts | None | — |

**Menu migration recipe (concrete):**
```ts
// src/utils/api.ts — replace migrateLegacyMenuConfig
export function migrateLegacyMenuConfig(raw: unknown): MenuConfig {
  // New schema — but still merge in any missing DEFAULT_SIDE_MENU paths (forward migration)
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).sideMenu)) {
    const existing = (raw as MenuConfig).sideMenu
    const existingPaths = new Set(
      existing.filter((e): e is Extract<SideMenuEntry, {type:'item'}> => e.type === 'item').map(e => e.path)
    )
    const missing: SideMenuEntry[] = DEFAULT_SIDE_MENU
      .filter(e => e.type === 'item' && !existingPaths.has(e.path))
    if (missing.length === 0) return raw as MenuConfig
    // Append missing items at end of their target section by looking up divider position in DEFAULT
    // Simplest: append to end. Acceptable for v1.4 (4 users).
    return { sideMenu: [...existing, ...missing] }
  }
  // Legacy or empty — same as before
  if (!raw || typeof raw !== 'object') {
    return { sideMenu: DEFAULT_SIDE_MENU.map(e => ({ ...e })) }
  }
  const legacy = raw as Record<string, { visible?: boolean; order?: number }>
  const merged: SideMenuEntry[] = DEFAULT_SIDE_MENU.map(entry => {
    if (entry.type === 'divider') return { ...entry }
    const userPref = legacy[entry.path]
    return { type: 'item', path: entry.path, visible: userPref?.visible !== false }
  })
  return { sideMenu: merged }
}
```
And in `SideMenu.tsx`, after `useQuery` loads `menuConfig`, compare to what would be produced by merging: if they differ, call `settingsApi.saveMenu(applied)` once to persist. Alternatively, leave the merge as read-only — menu item will show correctly on each load since `migrateLegacyMenuConfig` runs on every fetch. **Recommendation: read-only merge** (no auto-save) is safer and sufficient.

## Code Examples

### documentsApi namespace (add to `src/utils/api.ts`)
```ts
export interface DocumentListItem {
  id: number
  type: 'plan' | 'drill'
  year: number
  title: string
  filename: string
  size: number
  content_type: string
  uploaded_at: string
  uploaded_by_name: string | null
}

export const documentsApi = {
  list: (type: 'plan' | 'drill') =>
    api.get<DocumentListItem[]>(`/documents?type=${type}`),

  // NOTE: download is NOT in this namespace — it returns a Blob, not JSON.
  // Use downloadBlob(id, fallbackFilename) utility instead.

  multipartCreate: (body: {
    type: 'plan'|'drill'; year: number; title: string;
    filename: string; contentType: string; size: number;
  }) => api.post<{ uploadId: string; key: string; partSize: number }>('/documents/multipart/create', body),

  multipartComplete: (body: {
    uploadId: string; key: string;
    parts: Array<{ partNumber: number; etag: string }>;
    type: 'plan'|'drill'; year: number; title: string;
    filename: string; size: number; contentType: string;
  }) => api.post<{ id: number; key: string }>('/documents/multipart/complete', body),

  multipartAbort: (body: { uploadId: string; key: string }) =>
    api.post<{ aborted: true }>('/documents/multipart/abort', body),
}

// Raw-body part upload — bypasses JSON wrapper, injects auth manually.
// Returns { partNumber, etag } on success.
export async function uploadPartRaw(
  uploadId: string,
  key: string,
  partNumber: number,
  body: Blob,
  signal?: AbortSignal,
): Promise<{ partNumber: number; etag: string }> {
  const { token } = useAuthStore.getState()
  const qs = new URLSearchParams({ uploadId, key, partNumber: String(partNumber) })
  const res = await fetch(`${BASE}/documents/multipart/upload-part?${qs}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
    signal,
  })
  const json = await res.json() as { success: boolean; data?: { partNumber: number; etag: string }; error?: string }
  if (!res.ok || !json.success) {
    if (res.status === 401) { useAuthStore.getState().logout(); window.location.href = '/login' }
    throw new ApiError(res.status, json.error ?? 'part upload failed')
  }
  return json.data!
}
```

### downloadBlob.ts (extract as reusable)
```ts
// src/utils/downloadBlob.ts
import { useAuthStore } from '../stores/authStore'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

/**
 * Parse RFC 5987 Content-Disposition header.
 * Supports: `attachment; filename*=UTF-8''encoded` (primary — what our server emits)
 *           `attachment; filename="name.pdf"` (fallback)
 */
export function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null
  // RFC 5987 — filename*=charset'lang'encoded-value
  const star = /filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i.exec(header)
  if (star) {
    try { return decodeURIComponent(star[2].trim()) } catch { /* fall through */ }
  }
  const quoted = /filename\s*=\s*"([^"]+)"/i.exec(header)
  if (quoted) return quoted[1]
  const bare = /filename\s*=\s*([^;]+)/i.exec(header)
  if (bare) return bare[1].trim()
  return null
}

/**
 * Download a protected API file as a Blob and trigger browser save.
 * Works on iOS 16.3+ PWA standalone mode — mirror of LegalFindingsPage ZIP download pattern.
 */
export async function downloadDocument(
  id: number,
  fallbackFilename: string,
): Promise<void> {
  const { token } = useAuthStore.getState()
  const res = await fetch(`${BASE}/documents/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    if (res.status === 401) { useAuthStore.getState().logout(); window.location.href = '/login'; return }
    throw new Error(`다운로드 실패 (${res.status})`)
  }
  const filename =
    parseContentDispositionFilename(res.headers.get('Content-Disposition')) ?? fallbackFilename
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // iOS PWA: 3s delay before revoke (matches LegalFindingsPage:500 pattern)
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}
```

### multipartUpload.ts (client orchestration)
```ts
// src/utils/multipartUpload.ts
import { documentsApi, uploadPartRaw } from './api'

export interface ProgressState {
  loadedBytes: number
  totalBytes: number
  percent: number        // 0..100
  speedBps: number       // bytes per second (3s rolling)
  etaSeconds: number     // remaining
}

export interface MultipartOptions {
  file: File
  type: 'plan' | 'drill'
  year: number
  title: string
  onProgress?: (p: ProgressState) => void
  signal?: AbortSignal
}

const PART_SIZE = 10 * 1024 * 1024 // 10MB fixed (D-21)

export async function runMultipartUpload(opts: MultipartOptions): Promise<{ id: number }> {
  const { file, type, year, title, onProgress, signal } = opts
  const contentType = file.type || 'application/octet-stream'

  // 1. create
  const { uploadId, key } = await documentsApi.multipartCreate({
    type, year, title,
    filename: file.name,
    contentType,
    size: file.size,
  })

  // Register abort cleanup — if caller aborts, we call multipartAbort
  const onAbort = async () => {
    try { await documentsApi.multipartAbort({ uploadId, key }) } catch {}
  }
  signal?.addEventListener('abort', onAbort, { once: true })

  try {
    // 2. slice + sequential upload-part
    const parts: Array<{ partNumber: number; etag: string }> = []
    const total = file.size
    const numParts = Math.max(1, Math.ceil(total / PART_SIZE))
    let loaded = 0

    // Rolling average: samples of {t, bytes} within last 3s
    const samples: Array<{ t: number; b: number }> = []
    const emitProgress = () => {
      const now = Date.now()
      samples.push({ t: now, b: loaded })
      // prune > 3s old
      while (samples.length > 1 && now - samples[0].t > 3000) samples.shift()
      const first = samples[0]
      const dtSec = (now - first.t) / 1000
      const speed = dtSec > 0 ? (loaded - first.b) / dtSec : 0
      const remain = total - loaded
      const eta = speed > 0 ? remain / speed : 0
      onProgress?.({
        loadedBytes: loaded,
        totalBytes: total,
        percent: total > 0 ? (loaded / total) * 100 : 0,
        speedBps: speed,
        etaSeconds: eta,
      })
    }
    emitProgress() // initial 0

    for (let i = 0; i < numParts; i++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      const start = i * PART_SIZE
      const end = Math.min(start + PART_SIZE, total)
      const slice = file.slice(start, end) // last part may be < 10MB — R2 allows
      const partNumber = i + 1
      const { etag } = await uploadPartRaw(uploadId, key, partNumber, slice, signal)
      parts.push({ partNumber, etag })
      loaded = end
      emitProgress()
    }

    // 3. complete
    const { id } = await documentsApi.multipartComplete({
      uploadId, key, parts,
      type, year, title,
      filename: file.name, size: total, contentType,
    })
    signal?.removeEventListener('abort', onAbort)
    return { id }
  } catch (err) {
    signal?.removeEventListener('abort', onAbort)
    // On any failure (network, server error, user abort), best-effort abort
    try { await documentsApi.multipartAbort({ uploadId, key }) } catch {}
    throw err
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '—'
  const s = Math.ceil(seconds)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}
```

### Client-side file validation (mirror `_helpers.ts:6-12`)
```ts
const ALLOWED = [
  { ext: '.pdf',  mimes: ['application/pdf'] },
  { ext: '.xlsx', mimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] },
  { ext: '.docx', mimes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  { ext: '.hwp',  mimes: ['application/x-hwp', 'application/vnd.hancom.hwp', 'application/haansofthwp', ''] },
  { ext: '.zip',  mimes: ['application/zip', 'application/x-zip-compressed', ''] },
]
const MAX_SIZE = 200 * 1024 * 1024

function validateFile(file: File): string | null {
  if (file.size > MAX_SIZE) return '파일 크기가 200MB를 초과합니다'
  const lower = file.name.toLowerCase()
  const entry = ALLOWED.find(e => lower.endsWith(e.ext))
  if (!entry) return '허용되지 않은 파일 형식입니다 (pdf, xlsx, docx, hwp, zip)'
  // Note: browsers often return '' for .hwp and sometimes .zip — allow empty
  if (file.type && !entry.mimes.includes(file.type)) {
    return '파일 확장자와 형식이 일치하지 않습니다'
  }
  return null
}
```
**Pitfall:** browsers (especially iOS Safari) frequently set `file.type` to `''` for `.hwp` and sometimes `.zip`. The server-side whitelist in `_helpers.ts` requires a matching MIME — the upload will fail at `create` step if the browser reports an empty MIME. **Research finding:** `validateFileType` in `_helpers.ts:25` does NOT accept empty string — it requires exact match. **Plan action:** on client, if `file.type === ''`, fall back to extension-derived MIME before calling `multipartCreate`:
```ts
const EXT_TO_MIME: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.hwp':  'application/x-hwp',
  '.zip':  'application/zip',
}
const ext = ALLOWED.find(e => file.name.toLowerCase().endsWith(e.ext))?.ext
const contentType = file.type || (ext ? EXT_TO_MIME[ext] : 'application/octet-stream')
```

### beforeunload guard during upload
```tsx
useEffect(() => {
  if (!isUploading) return
  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    e.returnValue = '업로드 중입니다. 나가시겠습니까?' // Chrome requires returnValue
  }
  window.addEventListener('beforeunload', handler)
  return () => window.removeEventListener('beforeunload', handler)
}, [isUploading])
```

### SideMenu patch
```tsx
// src/components/SideMenu.tsx — MENU constant, '문서 관리' section
{ section: '문서 관리', items: [
  { label: '소방계획서/훈련자료', path: '/documents', badge: 0, soon: false },  // NEW — placed first
  { label: '일일 업무 일지',      path: '/daily-report', badge: 0, soon: false },
  // ... rest unchanged
]},
```

### DesktopSidebar patch
```tsx
// src/components/DesktopSidebar.tsx:8 — DESKTOP_SECTIONS
{ label: '문서 관리', paths: ['/documents', '/daily-report', '/schedule', '/workshift', '/annual-plan', '/reports', '/qr-print'] },
```

### DEFAULT_SIDE_MENU patch (api.ts:312)
```ts
{ type: 'divider', id: 'd-docs',     title: '문서 관리' },
{ type: 'item', path: '/documents',    visible: true },  // NEW
{ type: 'item', path: '/daily-report', visible: true },
// ... rest unchanged
```

## State of the Art

Not applicable — phase uses already-established internal patterns. No external library choices to evaluate.

## Common Pitfalls

### Pitfall 1: Sending Authorization on `window.open`
**What goes wrong:** `window.open('/api/documents/123')` opens a new tab with no Authorization header → 401 → auto-logout.
**How to avoid:** Always use `downloadDocument(id, fallback)` (fetch+Blob+`<a download>`).

### Pitfall 2: `file.type === ''` for .hwp / .zip
**What goes wrong:** Browser reports empty MIME → `multipartCreate` 400 at server `validateFileType`.
**How to avoid:** Fallback to extension-derived MIME before calling create (see code example above).

### Pitfall 3: Forgetting to update DesktopSidebar
**What goes wrong:** Menu item appears on mobile only. Desktop has a completely separate hardcoded `DESKTOP_SECTIONS` array.
**How to avoid:** Always patch all three: `SideMenu.MENU`, `DesktopSidebar.DESKTOP_SECTIONS`, `api.ts DEFAULT_SIDE_MENU`.

### Pitfall 4: Not merging new paths for existing users
**What goes wrong:** `migrateLegacyMenuConfig` returns saved `{sideMenu: [...]}` as-is — new items never appear for users with existing saved configs.
**How to avoid:** Fix `migrateLegacyMenuConfig` to append missing paths from `DEFAULT_SIDE_MENU` on every load (see Menu migration recipe).

### Pitfall 5: `req<T>()` wrapper sets `Content-Type: application/json`
**What goes wrong:** If you call `api.put('/documents/multipart/upload-part', slice)`, the wrapper sets JSON content-type and tries to `JSON.stringify` a Blob → corrupt upload.
**How to avoid:** Use the dedicated `uploadPartRaw` helper that bypasses `req<T>()` and calls `fetch` directly with `Content-Type: application/octet-stream`.

### Pitfall 6: Memory footprint for 130MB download
**What goes wrong:** `await res.blob()` fully buffers the file in memory. On iOS Safari, 130MB is within limits but tight — and `<a download>` cannot stream directly from a network Response.
**How to avoid:** Accept the buffering cost — it's the only way to attach Authorization. 130MB is under iOS 16+ Safari's ~1GB per-tab blob ceiling. **Verified working pattern:** LegalFindingsPage already does this successfully for ZIP files with multi-MB photo payloads. If users report OOM in the future, consider a Service Worker that intercepts `/api/documents/{id}` requests and injects auth (out of scope for v1.4).

### Pitfall 7: Part order
**What goes wrong:** Submitting parts to `complete` out of order.
**How to avoid:** Already handled — server sorts parts ascending (`complete.ts:49`). But collect them in order anyway (sequential loop guarantees this).

### Pitfall 8: Double-consuming `res.json()`
**What goes wrong:** In `uploadPartRaw`, calling `res.json()` after `!res.ok` check that already read it.
**How to avoid:** Read JSON once, inspect `.success` after.

### Pitfall 9: Modal/BottomSheet dismiss during active upload
**What goes wrong:** User taps outside overlay → `onClose` fires → unmount → mid-upload `fetch` is garbage-collected without abort → R2 orphan.
**How to avoid:** Disable overlay click-to-close while `isUploading === true`. Only the explicit cancel button (which calls `abort()`) should close the sheet during upload.

### Pitfall 10: Ignoring deflated `file.size` on iOS
**What goes wrong:** iOS sometimes reports slightly different size before/after read. Not common for documents, but affects validation.
**How to avoid:** Validate once at file-select time; re-trust thereafter.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Cloudflare D1 | `/api/documents` list | ✓ | production | — |
| Cloudflare R2 (cha-bio-storage) | download + multipart | ✓ | production | — |
| Phase 20 endpoints deployed | everything | ✓ | verified by STATE.md + source reads | — |
| `documents` table (migration 0046) | list/download | ✓ | applied to production per STATE.md line 86 | — |
| Wrangler CLI | deploy | ✓ | 4.75.0 | — |
| No new npm packages | — | ✓ | — | — |

No blocking dependencies. Pure frontend work.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | iOS 16.3+ PWA standalone supports `<a download>` with a Blob URL and triggers the native Files app save sheet | Pattern 4, Pitfall 6 | LOW — `LegalFindingsPage.tsx:491-501` is proven in production for ZIP downloads; comment on line 493 documents this. If ever it breaks, Service Worker interception is the fallback. |
| A2 | iOS Safari can hold a 130MB Blob in memory without OOM crash | Pitfall 6 | MEDIUM — Not stress-tested at 130MB specifically in this repo. If crash observed, reduce fallback to documenting "<100MB" for drill files or implement Service Worker proxy. |
| A3 | `file.type` for `.hwp` files on modern browsers is often empty string | Pitfall 2 | LOW — Widely known; mitigation is simple extension fallback. |
| A4 | `beforeunload` prompt works on iOS Safari standalone PWA | D-23 | MEDIUM — iOS Safari has historically been inconsistent with `beforeunload`. In PWA standalone mode it may be silently ignored. Treat as best-effort — do not rely on it for data integrity. The cancel button + abort endpoint is the real safety net. |
| A5 | R2 multipart allows final part < 5MB | D-21 | LOW — Cloudflare R2 docs + Phase 20 accepts this; only middle parts need ≥ 5MB. Verified in CONTEXT Phase 20 D-12. |

## Open Questions (RESOLVED)

1. **Should we auto-persist the merged menu config, or merge read-only on every load?**
   - Read-only: simpler, no write amplification, menu item always appears.
   - Auto-persist: one-time migration, cleaner data.
   - **RESOLVED:** Read-only merge (no auto-save). Simpler and sufficient for 4 users. Implemented in Plan 21-04 via `migrateLegacyMenuConfig` forward-merge fix.

2. **Should the download indicator be blocking (modal spinner) or inline (small spinner on the card)?**
   - CONTEXT marks this as discretion.
   - **RESOLVED:** Inline small "다운로드 중..." text next to the tapped card, non-blocking, so the user can still browse. Implemented in Plan 21-05 `handleDownload` state on DocumentSection.

3. **beforeunload reliability in iOS PWA?** Assumption A4.
   - **RESOLVED:** Treat as best-effort only — iOS PWA standalone may silently ignore it. The real safeguard is the active upload state + explicit cancel button (wired to multipart abort). Documented in Plan 21-05 upload orchestration task; no runtime dependency on beforeunload firing.

## Validation Architecture

Phase 20 verification used production deploy + curl smoke test. This phase is UI, so validation is observable-behavior manual UAT (no jest/vitest configured in repo). Per `.planning/config.json` default, Nyquist validation is a manual UAT checklist.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — manual UAT only (no test runner in `package.json`) |
| Config file | — |
| Quick run command | `npm run build` (type-check + build succeeds) |
| Full suite command | Manual UAT script below on production deployment |
| Phase gate | Production deploy + UAT checklist passes |

### Phase Requirements → Observable Behavior Map

| Req ID | Behavior | Validation Type | How to Verify |
|--------|----------|-----------------|---------------|
| DOC-01 | staff sees latest 소방계획서 card and downloads it | manual UAT | Login as assistant → `/documents` → plan tab → tap latest card → file downloaded with correct Korean filename |
| DOC-02 | admin uploads 소방계획서 (small .pdf) | manual UAT | Login as admin → plan tab → tap upload → select `test.pdf` → submit → progress reaches 100% → toast success → list refreshes showing new item |
| DOC-03 | staff sees past year 소방계획서 in 과거 이력 | manual UAT | After uploading two different years → both visible: latest as big card, older in 과거 이력 list; tap past row → downloads correctly |
| DOC-04 | staff downloads latest 소방훈련자료 | manual UAT | drill tab (mobile) or right column (desktop) → tap latest → download |
| DOC-05 | admin uploads 130MB 소방훈련자료 file | manual UAT | Prepare a ~130MB .zip → upload → watch progress: %, MB/s, ETA all update → completes successfully → appears in list |
| DOC-06 | staff downloads past 소방훈련자료 year | manual UAT | Same as DOC-03 for drill |
| — | role gating | manual UAT | Login as assistant → upload button completely absent both mobile and desktop |
| — | menu integration | manual UAT | `/documents` appears in side menu (mobile drawer) AND desktop sidebar under "문서 관리" section. Verify for both admin and assistant. Verify for a user with pre-existing saved menu_config. |
| — | cancel mid-upload | manual UAT | Start 100MB+ upload → tap cancel during part 3 → progress stops → abort endpoint called (check network tab) → sheet stays open with retry button → tap retry → fresh create + re-upload succeeds |
| — | error handling | manual UAT | Disconnect network mid-upload → red toast Korean error → retry button visible → reconnect + retry → succeeds |
| — | file type rejection | manual UAT | Try to upload `.txt` → immediate client rejection toast (no server call) |
| — | file size rejection | manual UAT | Try to upload a 250MB file → immediate client rejection |
| — | Korean filename preservation | manual UAT | Upload `2026년_소방계획서.pdf` → download → saved filename is exactly `2026년_소방계획서.pdf` (not URL-encoded, not garbled) |
| — | tab switching (mobile) | manual UAT | Switch plan↔drill tabs; each query cached independently; no refetch within staleTime |
| — | desktop 2-column | manual UAT | Resize viewport to ≥1024px → two columns side by side; <1024px → tabs |
| — | beforeunload guard | manual UAT | Start upload → attempt to close tab → browser prompt appears (or silently blocked on iOS — documented limitation) |
| — | invalidateQueries on upload success | manual UAT | Upload → list updates without manual refresh |

### Sampling Rate
- **Per task commit:** `npm run build` (must pass — TS check)
- **Per phase gate:** Full UAT checklist above, run on production deploy (not local — per STATE.md deploy rule)

### Wave 0 Gaps
- [ ] None — no test infrastructure needed beyond existing `npm run build` type check.

## Sources

### Primary (HIGH confidence — source files read)
- `cha-bio-safety/functions/api/documents/_helpers.ts` — whitelist, validateFileType, requireAdmin, MAX_DOC_SIZE, buildR2Key
- `cha-bio-safety/functions/api/documents/index.ts` — list endpoint, response shape
- `cha-bio-safety/functions/api/documents/[id].ts` — download stream, `Content-Disposition: filename*=UTF-8''` header
- `cha-bio-safety/functions/api/documents/multipart/create.ts` — request/response shape, partSize=10MB
- `cha-bio-safety/functions/api/documents/multipart/upload-part.ts` — query params, raw body, returns {partNumber, etag}
- `cha-bio-safety/functions/api/documents/multipart/complete.ts` — body shape, server-side sort, R2 cleanup on DB fail
- `cha-bio-safety/functions/api/documents/multipart/abort.ts` — body shape
- `cha-bio-safety/functions/api/settings/menu.ts` — per-staff D1 storage, no server-side default merge
- `cha-bio-safety/src/utils/api.ts` — `req<T>()`, `DEFAULT_SIDE_MENU`, `migrateLegacyMenuConfig` (found bug)
- `cha-bio-safety/src/components/SideMenu.tsx` — MENU constant, `appliedEntries` rendering via Phase 18 flat entry model
- `cha-bio-safety/src/components/DesktopSidebar.tsx` — `DESKTOP_SECTIONS` hardcoded separate list (found synchronization requirement)
- `cha-bio-safety/src/App.tsx` — lazy route pattern, PAGE_TITLES map, `useIsDesktop` branching
- `cha-bio-safety/src/hooks/useIsDesktop.ts` — `(min-width: 1024px)` matchMedia
- `cha-bio-safety/src/pages/LegalFindingsPage.tsx` — inline BottomSheet pattern (line 70), `<a download>` ZIP blob download (line 491, with comment confirming iOS PWA compatibility)
- `cha-bio-safety/src/utils/findingDownload.ts` — `window.open` pattern for HTML reports (distinct use case from file downloads)
- `cha-bio-safety/src/pages/AdminPage.tsx` — `staff.role === 'admin'` gating pattern
- `.planning/phases/20-document-storage/20-CONTEXT.md` — Phase 20 locked decisions
- `.planning/phases/21-documents-page-ui/21-CONTEXT.md` — all D-01..D-33
- `.planning/REQUIREMENTS.md` — DOC-01..07
- `.planning/STATE.md` — Phase 20 completion status, v1.2 prior iOS research

### Secondary
- None — all claims verified against source.

### Tertiary
- None.

## Metadata

**Confidence breakdown:**
- API contracts: HIGH — read actual endpoint source files
- Frontend patterns: HIGH — read actual pages in use
- Menu integration recipe: HIGH — bug in `migrateLegacyMenuConfig` verified by code read
- iOS PWA `<a download>` pattern: HIGH — proven in `LegalFindingsPage.tsx` with production use
- 130MB Blob memory on iOS: MEDIUM — not stress-tested at that exact size in this codebase
- `beforeunload` in iOS PWA: MEDIUM — documented as best-effort

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (30 days — stable stack, no moving parts)

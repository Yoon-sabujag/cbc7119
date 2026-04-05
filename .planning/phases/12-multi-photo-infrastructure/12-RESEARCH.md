# Phase 12: Multi-Photo Infrastructure - Research

**Researched:** 2026-04-05
**Domain:** Multi-photo upload + thumbnail grid + lightbox — Cloudflare R2 / D1 / React PWA
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 법적 점검 지적사항(legal_findings)의 photo_key + resolution_photo_key만 다중화한다
- **D-02:** 소방 점검(check_records), 도면 인라인 점검, 승강기 고장 등은 이번 Phase에서 제외
- **D-03:** 72px 정사각형 썸네일이 가로로 나열되는 가로 스크롤 행
- **D-04:** 5장 미만일 때 마지막에 점선 + 버튼 칸 표시 (기존 PhotoButton 스타일 유지)
- **D-05:** 썸네일 탭 시 yet-another-react-lightbox로 풀스크린 확대보기
- **D-06:** + 버튼 탭 시 `accept="image/*"` 로 바로 갤러리 열기 (iOS에서 카메라/사진 선택 시트 자동 표시)
- **D-07:** capture 속성 없이 — 카메라/갤러리 분리 버튼 불필요
- **D-08:** migration 0043에서 photo_keys TEXT DEFAULT '[]' + resolution_photo_keys TEXT DEFAULT '[]' 컬럼 추가
- **D-09:** 같은 migration에서 기존 photo_key 값을 photo_keys로 복사 (UPDATE ... SET photo_keys = '["' || photo_key || '"]' WHERE photo_key IS NOT NULL)
- **D-10:** resolution_photo_key도 동일하게 resolution_photo_keys로 복사
- **D-11:** 이후 API/프론트엔드는 photo_keys/resolution_photo_keys만 사용, 기존 photo_key 컬럼은 무기, 기존 photo_key 컬럼은 무시

### Claude's Discretion

- useMultiPhotoUpload hook 내부 구현 (순차 업로드 vs 병렬)
- PhotoGrid 컴포넌트 세부 스타일 (gap, border-radius 등)
- 라이트박스 플러그인 설정 (줌, 슬라이드 등)
- 에러 처리 (업로드 실패 시 재시도 UX)

### Deferred Ideas (OUT OF SCOPE)

- 소방 점검(check_records) 다중 사진 — 별도 Phase
- 도면 인라인 점검 다중 사진 — 별도 Phase
- 사진 업로드 진행률 표시 — v1.2 Future Requirements (PHOTO-04)
- 사진 드래그 정렬 — v1.2 Future Requirements (PHOTO-05)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PHOTO-01 | 지적사항·조치 사진을 최대 5장까지 업로드할 수 있다 | useMultiPhotoUpload hook + parallel Promise.all uploads + 5-item limit enforced at API and UI level |
| PHOTO-02 | 첨부된 사진을 썸네일 그리드로 미리볼 수 있다 | PhotoGrid component — 72px thumbnail row with horizontal scroll, add-slot placeholder |
| PHOTO-03 | 썸네일을 탭하면 라이트박스로 풀스크린 확대보기할 수 있다| yet-another-react-lightbox 3.30.1 — touch/swipe, React 18 compatible, no extra deps |
</phase_requirements>

---

## Summary

Phase 12 delivers the shared infrastructure that all subsequent v1.2 photo features depend on: a D1 schema migration, a `useMultiPhotoUpload` hook, a `PhotoGrid` display+upload component, and updated API handlers. The feature domain is narrow (legal_findings only, display-mode first) but architecturally load-bearing: every subsequent phase consumes `PhotoGrid` and the new `photo_keys` column.

The technical foundation is solid. All required patterns exist in the codebase — `usePhotoUpload` extends cleanly to multi-photo, the `compressImage` utility is reused as-is, and the `/api/uploads` POST endpoint is called once per photo (no server changes needed for upload itself). The `elevator_repairs` table (migration 0041) already proves the JSON-array TEXT column pattern in this exact codebase. The only new dependency is `yet-another-react-lightbox`, which is already selected by the user (D-05) and confirmed at version 3.30.1 with React 18 peer-dep support.

The primary risk is the migration deploy window (D1 propagation ~5 seconds between schema apply and Worker deploy). The migration must be additive (keep `photo_key`, add `photo_keys` with backfill), and the Worker deploy must follow the migration — not be bundled with it.

**Primary recommendation:** Ship migration 0043 first, wait for D1 propagation, then deploy Worker + frontend together. API reads `photo_keys`; for zero existing records the column starts as `'[]'` after backfill. `PhotoGrid` renders in display-only mode in `LegalFindingDetailPage` this phase — upload-from-grid comes in Phase 13.

---

## Project Constraints (from CLAUDE.md)

The following directives from `./CLAUDE.md` are actionable constraints the planner must verify:

- **Stack is locked:** Cloudflare Pages + D1 + R2 + Workers only. No new backend services.
- **TypeScript 5.6.3, React 18.3.1:** All code must be TypeScript. Strict mode is OFF (`"strict": false`).
- **Inline styles, not Tailwind:** Component-level styling uses inline style objects with CSS variables (`var(--bg)`, `var(--t1)`, `var(--bd)` etc.). Tailwind is NOT used in component files.
- **camelCase field mapping:** API snake_case → camelCase in response mappers. New fields: `photo_keys` → `photoKeys`, `resolution_photo_keys` → `resolutionPhotoKeys`.
- **Named exports for components/hooks, default export for page components.**
- **React Query mutations** for all API write calls.
- **No `<a download>` on iOS:** `window.open()` path — but this phase does not implement download; it is noted for awareness.
- **Data integrity — no deletion:** `photo_keys` array updates use full-replacement (not COALESCE) to avoid silent photo loss.
- **Wrangler deploy with `--branch production`** — always required per MEMORY.md note.
- **Production deploy + test, not local server** — per MEMORY.md note.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| yet-another-react-lightbox | 3.30.1 (verified 2026-04-05 via npm view) | Fullscreen photo lightbox | User decision D-05; React 16–19 peer dep, touch/swipe, ~237 KB unpacked, actively maintained |
| Cloudflare D1 (SQLite) | — (platform) | Schema migration 0043 | Locked platform; additive ALTER TABLE + UPDATE backfill |
| Cloudflare R2 | — (platform) | Photo object storage | Locked platform; existing `/api/uploads` POST endpoint unchanged |
| compressImage (imageUtils.ts) | existing | Client-side image resize + JPEG compress | Already in use; 1280px max, 0.80 quality |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Promise.all | native | Parallel R2 uploads | Upload all selected photos concurrently — never sequential for multi-photo (PITFALLS.md P5) |
| AbortController | native | Cancel in-flight uploads | Called on BottomSheet/component unmount to prevent orphaned fetches |
| URL.createObjectURL / revokeObjectURL | native | Preview blob URLs | Create on file pick, revoke on slot removal and component unmount |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| yet-another-react-lightbox | PhotoSwipe 5 | PhotoSwipe has React 18 strict mode issues in 2026; YARL is simpler and maintained |
| yet-another-react-lightbox | lightgallery | GPLv3 license — risk for internal tools even at 4-user scale |
| yet-another-react-lightbox | react-image-lightbox | Unmaintained since 2021; no React 18 support |
| JSON array TEXT column | Junction table (finding_photos) | Junction table adds API complexity for a 4-user tool; JSON TEXT is the established project pattern (elevator_repairs, migration 0041) |
| Full replacement array PUT | COALESCE partial update | COALESCE silently deletes photos in JSON array columns (Pitfall P6); full replacement is the only safe pattern |

**Installation:**
```bash
cd cha-bio-safety && npm install yet-another-react-lightbox
```

**Version verification:** Confirmed `yet-another-react-lightbox@3.30.1` via `npm view yet-another-react-lightbox version` on 2026-04-05. Peer deps: React 16–19.

---

## Architecture Patterns

### Recommended Project Structure

New files this phase:

```
cha-bio-safety/
├── migrations/
│   └── 0043_multi_photo.sql          # New: additive columns + backfill
├── src/
│   ├── hooks/
│   │   └── useMultiPhotoUpload.ts    # New: extends usePhotoUpload to array of slots
│   ├── components/
│   │   └── PhotoGrid.tsx             # New: thumbnail row + lightbox, display+upload
│   └── types/
│       └── index.ts                  # Modified: LegalFinding type adds photoKeys, resolutionPhotoKeys
└── functions/api/legal/[id]/findings/
    ├── index.ts                      # Modified: SELECT + map photo_keys, POST accepts photo_keys[]
    ├── [fid].ts                      # Modified: SELECT + map photo_keys, PUT uses full replacement
    └── [fid]/
        └── resolve.ts                # Modified: accepts resolution_photo_keys[]
```

### Pattern 1: Additive Schema Migration with Backfill (D-08, D-09, D-10)

**What:** Add new JSON-array columns alongside existing scalar columns, backfill from old data in the same migration.
**When to use:** Any time existing data must be preserved during a column-type change.

```sql
-- migration 0043_multi_photo.sql
ALTER TABLE legal_findings ADD COLUMN photo_keys TEXT NOT NULL DEFAULT '[]';
ALTER TABLE legal_findings ADD COLUMN resolution_photo_keys TEXT NOT NULL DEFAULT '[]';

-- Backfill from existing photo_key column
UPDATE legal_findings
SET photo_keys = '["' || photo_key || '"]'
WHERE photo_key IS NOT NULL;

-- Backfill from existing resolution_photo_key column
UPDATE legal_findings
SET resolution_photo_keys = '["' || resolution_photo_key || '"]'
WHERE resolution_photo_key IS NOT NULL;
```

Deploy order: migration first → wait ~5 seconds for D1 propagation → deploy Worker code.

### Pattern 2: useMultiPhotoUpload Hook

**What:** Manages up to 5 photo slots — file pick, compress, preview URL, parallel upload, cleanup.
**When to use:** Anywhere multi-photo upload is needed. PhotoGrid is the UI consumer.

```typescript
// src/hooks/useMultiPhotoUpload.ts
import { useState, useCallback, useRef, useEffect } from 'react'
import { compressImage } from '../utils/imageUtils'
import { useAuthStore } from '../stores/authStore'

const MAX_PHOTOS = 5

interface PhotoSlot {
  blob: Blob
  preview: string       // blob URL — revokeObjectURL on removal
  uploading: boolean
  key: string | null    // R2 key after successful upload
  error: string | null
}

export function useMultiPhotoUpload() {
  const [slots, setSlots] = useState<PhotoSlot[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllers = useRef<AbortController[]>([])

  // Revoke all blob URLs on unmount
  useEffect(() => {
    return () => {
      slots.forEach(s => URL.revokeObjectURL(s.preview))
      abortControllers.current.forEach(ac => ac.abort())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pickPhotos = () => inputRef.current?.click()

  const handleFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return
    const remaining = MAX_PHOTOS - slots.length
    const toProcess = files.slice(0, remaining)

    const newSlots: PhotoSlot[] = await Promise.all(
      toProcess.map(async file => {
        const blob = await compressImage(file)
        return { blob, preview: URL.createObjectURL(blob), uploading: false, key: null, error: null }
      })
    )
    setSlots(prev => [...prev, ...newSlots])
  }, [slots.length])

  const removeSlot = useCallback((idx: number) => {
    setSlots(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }, [])

  // Parallel upload — returns array of R2 keys for slots that haven't been uploaded yet
  const uploadAll = useCallback(async (): Promise<string[]> => {
    const token = useAuthStore.getState().token
    const pending = slots.map((s, i) => ({ slot: s, idx: i })).filter(({ slot }) => !slot.key)

    const acs = pending.map(() => new AbortController())
    abortControllers.current = acs

    setSlots(prev => prev.map((s, i) =>
      pending.some(p => p.idx === i) ? { ...s, uploading: true, error: null } : s
    ))

    const results = await Promise.allSettled(
      pending.map(async ({ slot, idx }, i) => {
        const form = new FormData()
        form.append('file', slot.blob, 'photo.jpg')
        const res = await fetch('/api/uploads', {
          method: 'POST',
          body: form,
          headers: { Authorization: `Bearer ${token}` },
          signal: acs[i].signal,
        })
        const json = await res.json() as { success: boolean; data?: { key: string } }
        if (!json.success) throw new Error('업로드 실패')
        return { idx, key: json.data!.key }
      })
    )

    const keys: string[] = []
    setSlots(prev => {
      const next = [...prev]
      results.forEach((r, i) => {
        const { idx } = pending[i]
        if (r.status === 'fulfilled') {
          next[idx] = { ...next[idx], uploading: false, key: r.value.key, error: null }
          keys.push(r.value.key)
        } else {
          next[idx] = { ...next[idx], uploading: false, error: '업로드 실패' }
        }
      })
      return next
    })

    // Also include already-uploaded slots
    slots.forEach(s => { if (s.key) keys.unshift(s.key) })
    return keys
  }, [slots])

  const reset = useCallback(() => {
    slots.forEach(s => URL.revokeObjectURL(s.preview))
    abortControllers.current.forEach(ac => ac.abort())
    setSlots([])
  }, [slots])

  return {
    inputRef,
    slots,
    canAdd: slots.length < MAX_PHOTOS,
    pickPhotos,
    handleFiles,
    removeSlot,
    uploadAll,
    reset,
    isUploading: slots.some(s => s.uploading),
  }
}
```

### Pattern 3: PhotoGrid Component

**What:** Renders existing photo_keys as 72px thumbnails + add-slot placeholder. Opens yet-another-react-lightbox on thumbnail tap.
**When to use:** Replace single `PhotoButton` in legal finding pages. `PhotoButton` itself is NOT modified.

```typescript
// src/components/PhotoGrid.tsx
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { useMultiPhotoUpload } from '../hooks/useMultiPhotoUpload'

interface PhotoGridProps {
  // Display-mode: existing R2 keys loaded from API
  photoUrls?: string[]
  // Upload-mode: hook provides slots and controls
  hook?: ReturnType<typeof useMultiPhotoUpload>
  label?: string
}

// Thumbnail renders either a remote URL (display) or blob preview URL (upload)
```

The lightbox `slides` array is built from `photoUrls` (display) or slot `preview` URLs (upload). Index of tapped thumbnail sets the open index.

### Pattern 4: API — Full Replacement for photo_keys (Never COALESCE)

**What:** PUT handler sends the complete new `photo_keys` array; COALESCE must never be used on JSON array columns.
**When to use:** Any update to `photo_keys` or `resolution_photo_keys`.

```typescript
// In PUT /api/legal/:id/findings/:fid
// Correct — full replacement:
await env.DB.prepare(`
  UPDATE legal_findings
  SET
    description = COALESCE(?, description),
    location    = COALESCE(?, location),
    photo_keys  = ?                          -- always replaced, never COALESCE
  WHERE id = ? AND schedule_item_id = ?
`).bind(
  body.description ?? null,
  body.location ?? null,
  JSON.stringify(body.photo_keys ?? []),     -- validate: array, 0-5 items
  fid, scheduleItemId,
).run()
```

### Pattern 5: API Response Mapping for Backward Compatibility

**What:** API reads `photo_keys` (new) column; `photo_key` column is ignored in API code after migration (D-11). TypeScript type reflects new fields only.

```typescript
// GET response mapping (index.ts and [fid].ts)
const data = rows.results.map(r => ({
  id: r.id,
  // ...existing fields...
  photoKeys: JSON.parse(r.photo_keys || '[]') as string[],
  resolutionPhotoKeys: JSON.parse(r.resolution_photo_keys || '[]') as string[],
  // photo_key and resolution_photo_key columns retained in DB but NOT returned by API
}))
```

Frontend maps each key to URL: `key => `/api/uploads/${key}``

### Anti-Patterns to Avoid

- **COALESCE on JSON array columns:** Silently truncates photo arrays. Always send full replacement.
- **`capture` attribute on multi-photo input:** iOS ignores `multiple` when `capture` is present. Decision D-07 locks: no `capture` attribute.
- **Sequential uploads in a for-loop:** 5 sequential uploads on 4G takes 10–30 seconds. Use `Promise.all`.
- **Missing blob URL revocation on unmount:** `useEffect` cleanup must revoke ALL preview URLs, not just the "current" one.
- **Deploying Worker and migration together:** Always apply migration first, wait ~5 seconds D1 propagation, then deploy code.
- **`multiple` attribute on the add-slot input:** D-06 uses `accept="image/*"` without `capture`. Adding `multiple` is acceptable for gallery bulk-select, but the research confirms iOS behavior is stable with this combination.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fullscreen lightbox with touch/swipe | Custom modal + CSS transforms | yet-another-react-lightbox | Swipe gesture math, keyboard nav, accessibility, iOS rubber-banding — each takes weeks to get right |
| Image compression/resize | Canvas pipeline from scratch | `compressImage` (imageUtils.ts) | Already in codebase, tested on iOS, handles HEIC via File.type fallback |
| R2 upload endpoint | New server-side multi-upload endpoint | Existing `/api/uploads` POST called N times | No server change needed; parallel client calls achieve same throughput |
| JSON parse safety | try/catch everywhere | `JSON.parse(r.photo_keys || '[]')` with OR-default | D1 DEFAULT '[]' guarantees non-null after migration; OR-default is safe fallback |

**Key insight:** The lightbox is the only non-trivial UI problem in this phase. Everything else is array-managing wrappers around existing hooks and endpoints.

---

## Common Pitfalls

### Pitfall 1: Migration Deploy Window — Schema vs Code Mismatch
**What goes wrong:** Worker code referencing `photo_keys` column deploys before the migration applies. D1 returns "no such column" errors for all finding reads/writes.
**Why it happens:** Cloudflare Pages builds and deploys atomically, but D1 migrations are a separate wrangler step. If both happen in one CI command, timing is non-deterministic.
**How to avoid:** Always run `wrangler d1 execute cha-bio-safety --file migrations/0043_multi_photo.sql --remote` first, confirm success, then run `npm run deploy -- --branch production`.
**Warning signs:** API returns 500 on `/api/legal/:id/findings` after deploy.

### Pitfall 2: COALESCE Silently Clears Photo Arrays
**What goes wrong:** The existing PUT handler template uses `SET photo_key = COALESCE(?, photo_key)`. Copy-pasting this for `photo_keys` means sending an empty array `[]` preserves the old array (if the `?` is null), but sending a partial array overwrites with truncated data.
**Why it happens:** COALESCE works for scalar nullability; JSON arrays have different merge semantics.
**How to avoid:** Always send the complete current array (read → modify → write full array). API validates: array length 0–5, each key matches `/^inspections\/\d{8}\/[A-Za-z0-9]+\.(jpg|png|webp)$/`.
**Warning signs:** Deleting one photo from a 3-photo finding removes all photos.

### Pitfall 3: Blob URL Memory Leak on Unmount
**What goes wrong:** PhotoGrid or BottomSheet unmounts (user navigates back) without revoking blob preview URLs. Each open/close cycle leaks 1–5 blob URLs pointing to compressed image blobs.
**Why it happens:** `useEffect` cleanup in the existing single-photo hook only handles one URL. Multi-photo hook needs to revoke the entire array.
**How to avoid:** `useMultiPhotoUpload` must have a `useEffect(() => () => slots.forEach(s => URL.revokeObjectURL(s.preview)), [])` cleanup that runs on unmount (empty dep array ensures it captures the ref at unmount time, not at render time — use a ref to track URLs if needed).
**Warning signs:** Safari memory footprint grows across multiple navigation cycles; PWA reloads unexpectedly after long inspection sessions.

### Pitfall 4: iOS `capture` + `multiple` Conflict
**What goes wrong:** Adding `multiple` attribute alongside `capture="environment"` on the file input. iOS ignores `multiple` when `capture` is present — user can only pick one photo at a time regardless.
**Why it happens:** WebKit treats `capture` as exclusive. Decision D-07 already bans `capture`.
**How to avoid:** The input must be `<input type="file" accept="image/*" multiple ref={hook.inputRef} />` — no `capture` attribute.
**Warning signs:** iOS user can only select one photo per tap despite the multi-select intent.

### Pitfall 5: JSON.parse on Null/Undefined photo_keys
**What goes wrong:** Before migration backfill runs, `photo_keys` is `'[]'` (DEFAULT). But if a bug prevents backfill from running, old records have `null` for `photo_keys` at the DB level. `JSON.parse(null)` throws.
**Why it happens:** `DEFAULT '[]'` applies to new rows after migration, but `ALTER TABLE ADD COLUMN` in D1 sets existing rows to the default — so this scenario should not occur in practice. Still worth guarding.
**How to avoid:** Always parse with `JSON.parse(r.photo_keys || '[]')`. Zero cost, complete safety.
**Warning signs:** API returns 500 on specific old findings after migration.

---

## Code Examples

Verified patterns from the existing codebase:

### Existing elevator_repairs multi-photo pattern (migration 0041 — HIGH confidence)
The project already uses JSON-array TEXT columns for photos in `elevator_repairs`:
```sql
-- From 0041_elevator_repairs.sql (confirmed in codebase)
parts_arrival_photos  TEXT,
damaged_parts_photos  TEXT,
during_repair_photos  TEXT,
completed_photos      TEXT,
```
These columns store JSON arrays of R2 keys. No junction table. This is the established pattern.

### Existing usePhotoUpload upload fetch (HIGH confidence, from codebase)
```typescript
// From src/hooks/usePhotoUpload.ts — the pattern useMultiPhotoUpload extends
const form = new FormData()
form.append('file', photoBlob, 'photo.jpg')
const res = await fetch('/api/uploads', {
  method: 'POST',
  body: form,
  headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
})
const json = await res.json() as { success: boolean; data?: { key: string } }
return json.success ? json.data!.key : null
```

### yet-another-react-lightbox minimal usage (HIGH confidence, from library docs)
```typescript
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

// In component:
const [lightboxOpen, setLightboxOpen] = useState(false)
const [lightboxIndex, setLightboxIndex] = useState(0)

const slides = photoUrls.map(url => ({ src: url }))

return (
  <>
    {photoUrls.map((url, i) => (
      <img
        key={url}
        src={url}
        style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, cursor: 'pointer' }}
        onClick={() => { setLightboxIndex(i); setLightboxOpen(true) }}
      />
    ))}
    <Lightbox
      open={lightboxOpen}
      close={() => setLightboxOpen(false)}
      index={lightboxIndex}
      slides={slides}
    />
  </>
)
```

### D1 backfill UPDATE for photo_keys (HIGH confidence, from D-09)
```sql
-- Safe: concatenates JSON array around the existing scalar key
-- Handles keys that may contain path separators (inspections/20260405/abc123.jpg)
UPDATE legal_findings
SET photo_keys = json_array(photo_key)
WHERE photo_key IS NOT NULL AND photo_keys = '[]';
```
Note: `json_array(photo_key)` is SQLite's built-in that returns `["value"]` correctly — safer than manual string concatenation with `'["' || photo_key || '"]'` because it handles any special characters in key values.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single `photo_key TEXT` per finding | `photo_keys TEXT DEFAULT '[]'` JSON array | Phase 12 migration 0043 | Up to 5 photos per finding/resolution |
| `PhotoButton` (single 72px slot) | `PhotoGrid` (up to 5 slots + lightbox) | Phase 12 | Thumbnail row with fullscreen viewer |
| `usePhotoUpload` (single slot) | `useMultiPhotoUpload` (slot array) | Phase 12 | Parallel uploads, AbortController, blob cleanup |
| No lightbox | `yet-another-react-lightbox 3.30.1` | Phase 12 (new dependency) | Touch/swipe fullscreen photo viewer |

**Deprecated/outdated after this phase:**
- `photo_key` and `resolution_photo_key` DB columns: retained in schema for zero-risk compatibility but ignored by API code (D-11). Removal deferred to v1.3 (migration 0044).
- `PhotoButton` in legal_findings pages: replaced by `PhotoGrid`. `PhotoButton` is unchanged for other pages (inspection, remediation).

---

## Open Questions

1. **`json_array()` vs manual string concatenation in backfill UPDATE**
   - What we know: SQLite supports `json_array(value)` which correctly escapes values. D1 inherits SQLite JSON functions.
   - What's unclear: Whether D1's SQLite version (confirmed SQLite 3.x via Cloudflare docs) supports `json_array()` or whether the manual `'["' || photo_key || '"]'` string approach is safer for keys containing forward slashes.
   - Recommendation: Use `json_array(photo_key)` — it is the semantically correct SQLite function and handles any characters in the key. Fall back to manual string if D1 rejects it (which is unlikely — D1 supports JSON functions per Cloudflare docs).

2. **AbortController cleanup strategy in useMultiPhotoUpload**
   - What we know: The hook is used both in BottomSheets (which unmount on close) and in detail pages (which may remain mounted).
   - What's unclear: Whether to use a `useRef` to track the latest abort controllers (avoids stale closure) vs. storing them in state.
   - Recommendation: Use `useRef<AbortController[]>` (not state) for abort controllers. This avoids triggering re-renders on controller creation and ensures the cleanup `useEffect` always has access to the current list.

3. **PhotoGrid in display-only vs upload mode in Phase 12**
   - What we know: CONTEXT.md indicates Phase 12 delivers the shared infrastructure. Phase 13 wires PhotoGrid into the creation BottomSheet. LegalFindingDetailPage will show existing photos.
   - What's unclear: Whether Phase 12 also enables photo deletion from the detail page, or just display.
   - Recommendation: Phase 12 ships PhotoGrid in display-only mode for `LegalFindingDetailPage`. The upload-with-add-slot mode is fully implemented in the hook and component, but exposed via the detail page's "add photo" button only in Phase 13. This keeps Phase 12 scope clean.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| yet-another-react-lightbox | Lightbox display (PHOTO-03) | To be installed | 3.30.1 | None — user decision D-05 locks this library |
| Cloudflare D1 (production) | migration 0043 | ✓ (existing production) | — | — |
| Cloudflare R2 (production) | photo storage | ✓ (existing production) | — | — |
| wrangler CLI | migration deploy | ✓ | 4.80.0 (package.json) | — |
| Node.js / npm | build + install | ✓ (project running) | — | — |

**Missing dependencies with no fallback:**
- `yet-another-react-lightbox` must be installed before code referencing it can build. Run `npm install yet-another-react-lightbox` in `cha-bio-safety/` directory as Wave 0.

**Missing dependencies with fallback:**
- None.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No automated test framework detected in project |
| Config file | None — project has no jest.config, vitest.config, or pytest.ini |
| Quick run command | Manual: deploy to production + test on device |
| Full suite command | Manual: end-to-end walkthrough per success criteria |

This project has no automated test infrastructure. All validation is manual, production-deployed.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PHOTO-01 | 지적사항 사진을 최대 5장까지 업로드할 수 있다 | manual-only | — | N/A |
| PHOTO-01 | 6번째 사진 추가 시 + 버튼이 사라진다 (5장 제한) | manual-only | — | N/A |
| PHOTO-01 | API가 photo_keys 배열 6개 이상 거부 (400) | manual-only | curl test | N/A |
| PHOTO-02 | 업로드된 사진이 72px 썸네일 가로 스크롤 행으로 표시된다 | manual-only | — | N/A |
| PHOTO-02 | 기존 photo_key 단일 사진이 마이그레이션 후 photo_keys[0]으로 표시된다 (하위 호환) | manual-only | — | N/A |
| PHOTO-03 | 썸네일 탭 시 라이트박스로 풀스크린 확대보기된다 | manual-only | — | N/A |
| PHOTO-03 | 라이트박스에서 스와이프로 다음 사진으로 이동한다 | manual-only | — | N/A |

**Justification for manual-only:** No test framework exists in the project. All features are visual/interactive UI on a mobile-first PWA deployed to Cloudflare Pages. Cloudflare Pages Functions cannot be unit-tested without a local Workers runtime harness (not set up). The team validates by deploying to production and testing on device.

### Sampling Rate
- **Per task commit:** Manual smoke test — open a finding in LegalFindingDetailPage, verify photos render
- **Per wave merge:** Full success criteria walkthrough — all 4 success criteria checked on iOS Safari PWA
- **Phase gate:** All 4 success criteria TRUE before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `yet-another-react-lightbox` package not yet installed — install before any import can build
- [ ] Migration 0043 not yet applied to production D1 — deploy migration before code deploy

*(No test files to create — project has no test infrastructure)*

---

## Sources

### Primary (HIGH confidence)
- Codebase direct read: `src/hooks/usePhotoUpload.ts` — exact hook to extend
- Codebase direct read: `src/components/PhotoButton.tsx` — style reference (72px, dashed border, CSS vars)
- Codebase direct read: `functions/api/legal/[id]/findings/index.ts`, `[fid].ts`, `[fid]/resolve.ts` — all API files to modify
- Codebase direct read: `migrations/0038_legal_findings.sql` — current schema with `photo_key TEXT`
- Codebase direct read: `migrations/0041_elevator_repairs.sql` — establishes JSON-array TEXT column pattern
- `npm view yet-another-react-lightbox version` — confirmed 3.30.1 on 2026-04-05
- `.planning/research/SUMMARY.md` — v1.2 research, HIGH confidence, all findings incorporated
- `.planning/research/PITFALLS.md` — 8 pitfalls documented and cross-referenced

### Secondary (MEDIUM confidence)
- [yet-another-react-lightbox GitHub](https://github.com/igordanchenko/yet-another-react-lightbox) — React 16–19 peer dep, touch/swipe support confirmed
- [Cloudflare D1 JSON query docs](https://developers.cloudflare.com/d1/sql-api/query-json/) — `json_array()` function support in D1's SQLite

### Tertiary (LOW confidence)
- None in this phase — all critical facts sourced from codebase or HIGH confidence references.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from codebase audit + `npm view` on 2026-04-05
- Architecture: HIGH — all integration points traced through production code files
- Pitfalls: HIGH — sourced from `.planning/research/PITFALLS.md` which was researched against live docs on 2026-04-05
- Migration pattern: HIGH — validated by identical pattern in `elevator_repairs` (migration 0041) in same codebase

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable stack; yet-another-react-lightbox versioned at 3.30.1)

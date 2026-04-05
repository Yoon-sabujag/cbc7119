# Architecture Research

**Domain:** Fire Safety PWA — v1.2 UX Improvements Integration
**Researched:** 2026-04-05
**Confidence:** HIGH (based on direct codebase inspection at migration 0042)

---

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                   React SPA (Cloudflare Pages)                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ SchedulePage │  │LegalFindings │  │LegalFinding          │  │
│  │  (AddModal)  │  │    Page      │  │  DetailPage          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│  ┌──────▼─────────────────▼──────────────────────▼───────────┐  │
│  │         TanStack Query  (cache + invalidation)             │  │
│  └──────┬────────────────────────────────────────────────────┘  │
│         │  src/utils/api.ts  (scheduleApi, legalApi)            │
└─────────┼──────────────────────────────────────────────────────┘
          │  HTTP + JWT Bearer
┌─────────▼──────────────────────────────────────────────────────┐
│               Cloudflare Pages Functions                         │
│                                                                  │
│  functions/_middleware.ts  (JWT verify + CORS)                   │
│                                                                  │
│  POST /api/schedule              → schedule/index.ts             │
│  POST /api/uploads               → uploads/index.ts              │
│  GET  /api/uploads/[[path]]      → uploads/[[path]].ts           │
│  GET|POST /api/legal/:id/findings → legal/[id]/findings/index.ts │
│  PUT|DELETE /api/legal/:id/findings/:fid → [fid].ts              │
│  POST /api/legal/:id/findings/:fid/resolve → resolve.ts          │
└────────────┬───────────────────────────────────────────────────┘
             │
  ┌──────────▼────────┐   ┌──────────────────────┐
  │   D1 (SQLite)     │   │   R2 Object Storage   │
  │  schedule_items   │   │  inspections/{date}/  │
  │  legal_findings   │   │  documents/{date}/    │
  └───────────────────┘   └──────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | v1.2 Change |
|-----------|----------------|-------------|
| `SchedulePage / AddModal` | Create schedule_items; single-date input only | Add end_date input; loop inserts server-side |
| `LegalFindingsPage / FindingBottomSheet` | Create legal_findings; free-text location + description | Add item picker + structured 3-level location chain |
| `LegalFindingDetailPage` | Show finding detail; single photo per side | Replace with PhotoGrid (up to 5 photos) + download button |
| `usePhotoUpload` hook | Single blob → upload → return key | UNCHANGED; existing single-photo flows unaffected |
| `PhotoButton` component | Single photo tile with remove | UNCHANGED; still used by InspectionPage/RemediationPage |
| `uploads/index.ts` | Single file PUT to R2 | UNCHANGED; called N times for N photos |
| `uploads/[[path]].ts` | Serve any R2 object | UNCHANGED |
| `legal_findings` table | Single `photo_key`, single `resolution_photo_key` TEXT | Add `photo_keys TEXT`, `resolution_photo_keys TEXT`, `inspection_item TEXT` (additive migration) |

---

## Integration Points — All 4 Features

### Feature 1: Schedule Date Range Input

**What changes:**

| Layer | Change | Type |
|-------|--------|------|
| `schedule_items` DB | None — single-date architecture kept; one row per day | No migration |
| `POST /api/schedule` | Accept optional `end_date`; loop insert one row per calendar day in handler | Modified |
| `AddModal` in SchedulePage | Add end_date `<input type="date">` below date; show "N일 등록 예정" preview count | Modified |
| `scheduleApi.create` in api.ts | Add optional `end_date` to type | Modified |

**Why no schema change:** `schedule_items` already has a single `date` column. Legal inspection flows read by `schedule_item_id`; each day of a multi-day round gets its own item and its own `id`. This matches how findings are currently linked and avoids JOIN complexity.

**Max range guard:** Reject `end_date - date > 14 days` in the handler to prevent accidental mass insert. Return clear error message.

**Data flow:**

```
AddModal submits { date: '2026-06-10', end_date: '2026-06-14', title, category: 'fire', ... }
    ↓
POST /api/schedule
    ↓
for d in [2026-06-10 .. 2026-06-14]:
    INSERT schedule_items (id=SCH-xxx, date=d, title, ...)
    ↓
Response: { success: true, data: { ids: ['SCH-aaa', 'SCH-bbb', ...] } }
    ↓
queryClient.invalidateQueries(['schedule', curMonth])
```

---

### Feature 2: Finding BottomSheet Restructure

**What changes:**

| Layer | Change | Type |
|-------|--------|------|
| `legal_findings` DB | Add `inspection_item TEXT` column (folded into migration 0043) | New column |
| `POST /api/legal/:id/findings` | Accept `inspection_item` field | Modified |
| `PUT /api/legal/:id/findings/:fid` | Accept `inspection_item` field | Modified |
| `GET /api/legal/:id/findings` + `GET .../[fid]` | Return `inspectionItem` in response | Modified |
| `FindingBottomSheet` | Replace free-text description with item picker (dropdown + custom entry option) and zone→floor→detail location chain | Modified |
| `LegalFinding` type in types/index.ts | Add `inspectionItem: string \| null` | Modified |

**Structured location pattern:** Encode the 3-level location as `"${zone}|${floor}|${detail}"` stored in the existing `location TEXT` column. Parse on display by splitting `|`. No schema change needed — the column already holds free text, queries only filter by `schedule_item_id`, never by location parts.

**Inspection item list:** Store as a typed constant in the frontend (same pattern as `INSP_DEFAULTS` in SchedulePage). Include a "직접입력" option that shows a free-text input. The item list maps to the legal inspection checklist used by 동양소방.

**Data flow:**

```
FindingBottomSheet:
  [item picker]         → inspection_item  (new DB column)
  [zone select]         ↘
  [floor select]         → location = "zone|floor|detail"  (existing TEXT column)
  [detail input]        ↗
  [PhotoGrid, 0-5 photos] → uploaded immediately on tap "등록", keys collected

  POST /api/legal/:id/findings
  body: { inspection_item, location, photo_keys: ['k1','k2'] }
```

---

### Feature 3: Multi-Photo Upload + Gallery

This is the most architecturally significant change for v1.2.

**Current state:** `legal_findings` has `photo_key TEXT` (single key) and `resolution_photo_key TEXT` (single key). The `elevator_repairs` table (migration 0041) already uses the multi-photo pattern with separate TEXT columns storing comma-separated key lists.

**Decision — JSON array in new additive columns vs separate junction table:**

Use JSON arrays stored in new additive TEXT columns, following the established `elevator_repairs` precedent (`parts_arrival_photos`, `completed_photos`, etc. are all TEXT). A junction table (`finding_photos`) would require more migrations and API complexity for a 4-user app. The JSON array pattern is already in production in this codebase.

**Migration 0043 (additive, no destructive changes):**

```sql
-- Add array columns alongside existing single-key columns (keep for legacy fallback)
ALTER TABLE legal_findings ADD COLUMN photo_keys TEXT DEFAULT '[]';
ALTER TABLE legal_findings ADD COLUMN resolution_photo_keys TEXT DEFAULT '[]';
ALTER TABLE legal_findings ADD COLUMN inspection_item TEXT;
```

Keeping `photo_key` and `resolution_photo_key` intact means the existing resolve.ts and [fid].ts APIs continue working for already-resolved findings. No data migration risk.

**Legacy fallback rule in API read:**

```typescript
// In findings GET handler, per row:
const photoKeys: string[] = (() => {
  try { return JSON.parse(r.photo_keys ?? '[]') } catch { return [] }
})()
// If no keys in array column, promote legacy single key
const effectivePhotoKeys = photoKeys.length > 0 ? photoKeys
  : r.photo_key ? [r.photo_key] : []
```

**New hook: `useMultiPhotoUpload`**

```typescript
// src/hooks/useMultiPhotoUpload.ts
export function useMultiPhotoUpload(maxPhotos = 5) {
  const [photos, setPhotos] = useState<{ blob: Blob; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)

  const addPhoto = async (file: File) => { /* compressImage + append, guard maxPhotos */ }
  const removePhoto = (index: number) => { /* URL.revokeObjectURL + splice */ }
  const uploadAll = async (): Promise<string[]> => {
    // sequential POST /api/uploads for each blob; return keys[]
  }
  const reset = () => { /* revoke all object URLs */ }

  return { photos, uploading, addPhoto, removePhoto, uploadAll, reset, count: photos.length }
}
```

Upload sequentially (not parallel) to avoid creating orphaned R2 objects on partial failure. Sequential is fast enough for 5 compressed images (~200KB each) over mobile LTE.

**New component: `PhotoGrid`**

```typescript
// src/components/PhotoGrid.tsx
// Props: photos (preview URLs for new), existingKeys (R2 keys for display), 
//        onAdd, onRemove, maxPhotos, readonly
// Renders: row of 72x72 thumbnails + add button (if count < max && !readonly)
// Tap any thumbnail → open lightbox (full-screen fixed overlay, prev/next)
```

The lightbox is a simple fixed-position overlay with chevron navigation buttons. No external library needed — total implementation ~60 lines.

**API changes for multi-photo:**

| Endpoint | Change |
|----------|--------|
| `POST /api/legal/:id/findings` | Accept `photo_keys: string[]` in body |
| `PUT /api/legal/:id/findings/:fid` | Accept `photo_keys: string[]` in body |
| `GET /api/legal/:id/findings` | Return `photoKeys: string[]` and `resolutionPhotoKeys: string[]` |
| `GET /api/legal/:id/findings/:fid` | Return same |
| `POST /api/legal/:id/findings/:fid/resolve` | Accept `resolution_photo_keys: string[]` in body |

Serialization: `JSON.stringify(keys)` on write, `JSON.parse(row.photo_keys ?? '[]')` on read.

**Data flow (photo upload in FindingBottomSheet):**

```
User picks photo(s) via PhotoGrid → <input type="file" accept="image/*">
    ↓
compressImage() each → useMultiPhotoUpload state (preview + blob)
    ↓
User taps "등록"
    ↓
useMultiPhotoUpload.uploadAll()
    → POST /api/uploads (x N, sequential)
    ← { key: 'inspections/20260405/abc.jpg' } x N
    ↓
POST /api/legal/:id/findings { inspection_item, location, photo_keys: ['key1', 'key2'] }
    ↓
DB: photo_keys = '["key1","key2"]'
    ↓
queryClient.invalidateQueries(['legal-findings', scheduleItemId])
```

**Data flow (resolve with multiple photos):**

```
User inputs resolution_memo + picks up to 5 photos via PhotoGrid
    ↓
useMultiPhotoUpload.uploadAll() → keys[]
    ↓
POST /api/legal/:id/findings/:fid/resolve
  { resolution_memo, resolution_photo_keys: ['rk1', 'rk2'] }
    ↓
DB: resolution_photo_keys = '["rk1","rk2"]', status = 'resolved'
```

---

### Feature 4: Finding/Resolution Content + Photo Download

**Two download modes:**

1. **Per-item download** — triggered from `LegalFindingDetailPage` (admin only). Single-finding report with metadata + photos.

2. **Bulk download** — triggered from `LegalFindingsPage` (admin only). All findings for the round as a ZIP.

**Approach — client-side only, no new API endpoint needed:**

The existing `GET /api/legal/:id/findings` returns all finding data. Photos are served via `/api/uploads/{key}`. Both can be fetched client-side. The app already uses `fflate` for Excel template patching (see `generateExcel.ts`) — use it for ZIP creation.

**Per-item: HTML + print dialog**

```
LegalFindingDetailPage → "다운로드" button (admin only)
    ↓
For each key in photoKeys + resolutionPhotoKeys:
    fetch('/api/uploads/' + key) → blob → FileReader.readAsDataURL → base64
    ↓
Build HTML string:
  <h2>지적사항 상세</h2>
  <table> finding metadata </table>
  <img src="data:image/jpeg;base64,..." />
  <h3>조치 결과</h3>
  ...
    ↓
window.open('data:text/html,' + encodeURIComponent(html))
User: Print → Save as PDF
```

**Bulk: fflate ZIP + download anchor**

```
LegalFindingsPage → "일괄 다운로드" button (admin only)
    ↓
findings already loaded in TanStack Query cache
    ↓
For each finding (photo_keys + resolution_photo_keys):
    fetch('/api/uploads/' + key) → ArrayBuffer
    ↓
Build ZIP entries:
  'finding-001/지적정보.txt'
  'finding-001/지적사진-1.jpg'
  'finding-001/지적사진-2.jpg'
  'finding-001/조치사진-1.jpg'
  '요약.txt'  (all findings metadata in plain text)
    ↓
fflate.zip(entries) → Uint8Array
    ↓
URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }))
anchor.click() → browser downloads ZIP
```

**No new API endpoint required.** All data is already accessible through existing endpoints.

---

## Recommended Project Structure (new and modified files only)

```
src/
├── hooks/
│   ├── usePhotoUpload.ts         # UNCHANGED — single photo flows
│   └── useMultiPhotoUpload.ts    # NEW — multi-photo (up to N, sequential upload)
│
├── components/
│   ├── PhotoButton.tsx           # UNCHANGED — still used by InspectionPage
│   └── PhotoGrid.tsx             # NEW — thumbnail grid + lightbox + add slot
│
├── pages/
│   ├── SchedulePage.tsx          # MODIFIED — AddModal gets end_date + preview count
│   ├── LegalFindingsPage.tsx     # MODIFIED — BottomSheet restructure + bulk download
│   └── LegalFindingDetailPage.tsx # MODIFIED — PhotoGrid display + per-item download
│
├── utils/
│   └── api.ts                    # MODIFIED — legalApi, scheduleApi.create signatures
│
└── types/
    └── index.ts                  # MODIFIED — LegalFinding + ScheduleItem types

functions/api/
├── schedule/
│   └── index.ts                  # MODIFIED — POST accepts end_date, loops inserts
│
└── legal/[id]/findings/
    ├── index.ts                  # MODIFIED — photo_keys[], inspection_item
    ├── [fid].ts                  # MODIFIED — photo_keys[], inspection_item
    └── [fid]/resolve.ts          # MODIFIED — resolution_photo_keys[]

migrations/
└── 0043_legal_findings_v12.sql   # NEW — additive columns only
```

---

## Architectural Patterns

### Pattern 1: Additive Column Migration (Multi-Photo)

**What:** Add `photo_keys TEXT DEFAULT '[]'` and `resolution_photo_keys TEXT DEFAULT '[]'` alongside existing single-key columns. Both coexist. API reads `photo_keys` with fallback to `photo_key` for legacy records.

**When to use:** Existing production data that cannot be lost. Additive change is risk-free vs destructive rename.

**Trade-offs:** Two code paths during transition. Clean-up migration (dropping `photo_key`) can be a future migration after confirming all records use the new columns.

**Example (API read handler):**

```typescript
const photoKeys: string[] = (() => {
  try { return JSON.parse(r.photo_keys ?? '[]') } catch { return [] }
})()
const effective = photoKeys.length > 0 ? photoKeys
  : r.photo_key ? [r.photo_key] : []
```

---

### Pattern 2: Structured Location as Encoded String

**What:** Store structured location `zone|floor|detail` in the existing `location TEXT` column. Parse on display.

**When to use:** When the DB column is already TEXT, there is no SQL filtering on location sub-parts, and adding columns would require a migration with no query benefit.

**Trade-offs:** Cannot filter by zone or floor in SQL. Acceptable here — findings are always queried by `schedule_item_id`, never by location sub-parts.

**Example:**

```typescript
// Encode on save:
const location = [zone, floor, detail].filter(Boolean).join('|')

// Decode on display (LegalFindingDetailPage):
const [zone = '', floor = '', detail = ''] = (finding.location ?? '').split('|')
```

---

### Pattern 3: Sequential Multi-Upload then Single API Write

**What:** Upload N photos to R2 sequentially (one request each), collect keys, then POST the finding with `photo_keys: string[]` in one DB write.

**When to use:** Always — avoids partial-write states. If an upload fails mid-sequence, the user sees an error before the finding row is created. Clean rollback: nothing was written to D1.

**Trade-offs:** N round-trips for N photos. Acceptable for max 5 compressed images (~200KB each). Parallel would be faster but creates orphaned R2 objects on partial failure with no cleanup mechanism.

---

### Pattern 4: Client-Side ZIP for Bulk Download

**What:** Fetch photo blobs from R2 via `/api/uploads/...`, bundle into ZIP using `fflate.zip`, trigger browser download.

**When to use:** When binary file bundling is needed without server-side infrastructure. `fflate` is already a dependency in this project (used by Excel generation).

**Trade-offs:** All photo bytes pass through browser memory. For 10 findings × 5 photos × 200KB = 10MB — well within browser limits. No server CPU or memory cost.

---

## Data Flow

### Date Range Schedule Creation

```
AddModal: date='2026-06-10', end_date='2026-06-14', category='fire'
    ↓
POST /api/schedule { date, end_date, title, category, ... }
    ↓
Handler: for d in range(date, end_date, inclusive):
    INSERT schedule_items (id=SCH-{nanoid}, date=d, ...)
    ↓
Response: { success: true, data: { ids: ['SCH-a', ..., 'SCH-e'] } }
    ↓
queryClient.invalidateQueries(['schedule', curMonth])
Calendar dots appear for all 5 days
```

### Multi-Photo Finding Creation

```
FindingBottomSheet:
  inspection_item = '유도등'
  location = 'office|3F|복도 끝'   (encoded from 3 selects)
  photos = [blob1, blob2]
    ↓
useMultiPhotoUpload.uploadAll():
  POST /api/uploads (blob1) → { key: 'inspections/20260405/abc.jpg' }
  POST /api/uploads (blob2) → { key: 'inspections/20260405/def.jpg' }
    ↓
legalApi.createFinding(scheduleItemId, {
  inspection_item: '유도등',
  location: 'office|3F|복도 끝',
  photo_keys: ['inspections/20260405/abc.jpg', 'inspections/20260405/def.jpg']
})
    ↓
DB: legal_findings row with photo_keys='["abc","def"]', inspection_item='유도등'
    ↓
queryClient.invalidateQueries(['legal-findings', scheduleItemId])
```

### Per-Item Download

```
LegalFindingDetailPage: admin taps "다운로드"
    ↓
photoKeys + resolutionPhotoKeys → fetch each /api/uploads/{key} → blob → base64
    ↓
Assemble HTML: metadata table + embedded base64 images
    ↓
window.open('data:text/html;charset=utf-8,' + encodeURIComponent(html))
User prints → Save as PDF
```

### Bulk ZIP Download

```
LegalFindingsPage: admin taps "일괄 다운로드"
    ↓
sortedFindings (already in query cache)
    ↓
For each finding:
  fetch each key in photoKeys → ArrayBuffer → ZIP entry 'finding-{n}/지적사진-{i}.jpg'
  fetch each key in resolutionPhotoKeys → ZIP entry 'finding-{n}/조치사진-{i}.jpg'
  append '요약.txt' with all metadata
    ↓
fflate.zip(allEntries) → Uint8Array
    ↓
Blob → URL.createObjectURL → <a>.click() → file saves as '지적사항_20260610.zip'
```

---

## New vs Modified Artifacts

| Artifact | Status | Scope |
|----------|--------|-------|
| `migrations/0043_legal_findings_v12.sql` | NEW | Adds `photo_keys`, `resolution_photo_keys`, `inspection_item` to `legal_findings` |
| `src/hooks/useMultiPhotoUpload.ts` | NEW | Multi-blob state + sequential upload + reset |
| `src/components/PhotoGrid.tsx` | NEW | Thumbnail grid + add slot + lightbox overlay |
| `functions/api/schedule/index.ts` | MODIFIED | POST: accept `end_date`, loop inserts, max 14-day guard |
| `functions/api/legal/[id]/findings/index.ts` | MODIFIED | Accept/return `photo_keys[]`, `inspection_item` |
| `functions/api/legal/[id]/findings/[fid].ts` | MODIFIED | Accept/return `photo_keys[]`, `inspection_item` |
| `functions/api/legal/[id]/findings/[fid]/resolve.ts` | MODIFIED | Accept `resolution_photo_keys[]` |
| `src/pages/SchedulePage.tsx` | MODIFIED | `AddModal`: add end_date input, insert count preview |
| `src/pages/LegalFindingsPage.tsx` | MODIFIED | Restructure `FindingBottomSheet`; bulk download button (admin) |
| `src/pages/LegalFindingDetailPage.tsx` | MODIFIED | Replace single-img sections with `PhotoGrid`; per-item download button (admin) |
| `src/utils/api.ts` | MODIFIED | `legalApi.createFinding`, `resolveFinding`, `updateFinding`; `scheduleApi.create` |
| `src/types/index.ts` | MODIFIED | `LegalFinding`: add `inspectionItem`, `photoKeys[]`, `resolutionPhotoKeys[]`; `ScheduleItem`: unchanged |
| `src/hooks/usePhotoUpload.ts` | UNCHANGED | Existing single-photo flows unaffected |
| `src/components/PhotoButton.tsx` | UNCHANGED | Still used by InspectionPage, RemediationDetailPage |
| `functions/api/uploads/index.ts` | UNCHANGED | Called N times for N photos, no change needed |
| `functions/api/uploads/[[path]].ts` | UNCHANGED | Serve endpoint unchanged |
| `functions/api/legal/index.ts` | UNCHANGED | Round list aggregation not affected |
| `functions/api/legal/[id].ts` | UNCHANGED | Round detail + result update not affected |

---

## Build Order

This order minimizes blocked work:

**Phase 1 — Multi-Photo Infrastructure (blocker for Features 2 and 4)**
- Write `migrations/0043_legal_findings_v12.sql` and apply
- Implement `useMultiPhotoUpload` hook
- Implement `PhotoGrid` component with lightbox
- Update `LegalFinding` type to include `photoKeys[]`, `resolutionPhotoKeys[]`, `inspectionItem`
- Update API handlers (findings index, [fid], resolve) to handle JSON arrays
- Update `legalApi` signatures in api.ts
- Update `LegalFindingDetailPage` to display photos via PhotoGrid (read-only first)

**Phase 2 — BottomSheet Restructure (depends on PhotoGrid from Phase 1)**
- Add inspection item picker constant + "직접입력" fallback
- Restructure `FindingBottomSheet` with 3-level location chain + PhotoGrid upload slot
- Wire `useMultiPhotoUpload` into BottomSheet submit flow

**Phase 3 — Schedule Date Range (fully independent, can be done in parallel with Phase 1)**
- Modify `POST /api/schedule` to accept and loop-insert for `end_date`
- Modify `AddModal` in SchedulePage with end_date input and preview count
- Update `scheduleApi.create` type signature

**Phase 4 — Download (depends on Phase 1 multi-photo display)**
- Add per-item download button to `LegalFindingDetailPage` (admin gate)
- Add bulk ZIP download to `LegalFindingsPage` using fflate (admin gate)

---

## Anti-Patterns

### Anti-Pattern 1: Parallel Photo Uploads

**What people do:** `Promise.all(photos.map(upload))` to speed up multi-upload.

**Why it's wrong:** If 5 uploads fire simultaneously and one fails, there are 4 orphaned R2 objects (no cleanup mechanism) and an ambiguous error state — which keys were committed? The finding row has not been written yet so there is no way to trace orphaned keys.

**Do this instead:** Sequential upload in `uploadAll()`. Fail fast on first error before any finding row is created. Error handling is simple: show toast, let user retry.

---

### Anti-Pattern 2: Junction Table for Finding Photos

**What people do:** Create `finding_photos (id, finding_id, photo_key, photo_type, seq)` table for proper relational storage.

**Why it's wrong:** Overkill for a 4-user app with max 5 photos per finding. Requires migration + new API + JOIN in every findings GET. The `elevator_repairs` table in this codebase already proves JSON-array TEXT columns are the project's established pattern.

**Do this instead:** `photo_keys TEXT DEFAULT '[]'` with `JSON.parse` on read and `JSON.stringify` on write.

---

### Anti-Pattern 3: Schema-Breaking Migration for Multi-Photo

**What people do:** `ALTER TABLE legal_findings RENAME COLUMN photo_key TO photo_key_legacy`, migrate data in the same script, then drop.

**Why it's wrong:** D1 SQLite `RENAME COLUMN` runs against production data that already has `photo_key` populated. Any bug silently nulls photo references for existing resolved findings.

**Do this instead:** `ADD COLUMN photo_keys TEXT DEFAULT '[]'`. Keep `photo_key` intact. API reads `photo_keys` with fallback to `photo_key`. Clean-up is a separate future migration after verifying no regressions.

---

### Anti-Pattern 4: Server-Side PDF Generation in Workers

**What people do:** Generate PDFs in a Cloudflare Worker using jsPDF or by streaming Puppeteer.

**Why it's wrong:** Workers have CPU time limits (~30s on paid). Photo-fetching + PDF rendering inside a Worker would be complex to bundle and would hit memory limits for bulk downloads. Puppeteer is not available in Workers.

**Do this instead:** Client-side HTML + print dialog (per-item) or fflate ZIP + download anchor (bulk). Both run entirely in the browser, zero Worker CPU cost.

---

## Scaling Considerations

| Concern | At current scale (4 users) | Notes |
|---------|---------------------------|-------|
| D1 write throughput | Not a constraint | Max 5 rows per schedule create; findings are rare events |
| R2 storage growth | 5 photos × 200KB × findings count | 1000 findings = ~1GB = ~$0.015/month. Non-issue. |
| Worker CPU for ZIP | Not a concern | Bulk ZIP runs client-side via fflate |
| Browser memory for ZIP | ~10MB for 10 findings × 5 photos | Well within limits for target devices (iOS 16.3.1+) |
| Future multi-building | Encoded `zone\|floor\|detail` in TEXT would need migration to proper columns | Flag if multi-building is ever added |

---

## Sources

All findings derived from direct codebase inspection:
- `migrations/0038_legal_findings.sql` — current `legal_findings` schema
- `migrations/0041_elevator_repairs.sql` — JSON array in TEXT multi-photo precedent
- `functions/api/elevators/repairs/index.ts` — JSON array serialization pattern in production
- `functions/api/legal/[id]/findings/index.ts`, `[fid].ts`, `[fid]/resolve.ts` — current finding APIs
- `functions/api/schedule/index.ts` — current schedule POST handler
- `functions/api/uploads/index.ts` — single-file R2 upload endpoint
- `src/hooks/usePhotoUpload.ts` — existing single-upload hook to extend
- `src/components/PhotoButton.tsx` — existing single-photo component
- `src/pages/LegalFindingsPage.tsx` + `LegalFindingDetailPage.tsx` — current BottomSheet and detail page
- `src/types/index.ts` — current `LegalFinding`, `LegalRound`, `ScheduleItem` interfaces
- `src/utils/api.ts` — `legalApi`, `scheduleApi` shapes

**Confidence: HIGH** — all integration points derived from actual code at migration 0042, 280+ commits.

---

*Architecture research for: CHA Bio Complex Fire Safety PWA — v1.2 UX Improvements*
*Researched: 2026-04-05*

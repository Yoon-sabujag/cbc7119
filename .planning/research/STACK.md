# Stack Research

**Domain:** Fire Safety Management PWA — v1.2 UX improvements
**Researched:** 2026-04-05
**Confidence:** HIGH

---

## Context: Existing Stack (Validated — Do Not Re-research)

The following are already in production and locked. This document only covers **additions and changes** needed for v1.2 features.

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React + TypeScript + Vite | 18.3 / 5.6 / 5.4 |
| State | Zustand + TanStack Query | 5.0 / 5.59 |
| Backend | Cloudflare Pages Functions | — |
| Database | Cloudflare D1 (SQLite) | migration 0042 |
| Storage | Cloudflare R2 | `env.STORAGE` binding |
| Photo compression | Browser Canvas API in `src/utils/imageUtils.ts` | built-in |
| ZIP / Excel | fflate | 0.8.2 (in package.json) |
| Auth | jose JWT | 5.9.6 |

---

## New Capabilities Needed for v1.2

| Feature | Technical challenge |
|---------|-------------------|
| Date range input | Start/end date for multi-day legal inspections |
| Structured location BottomSheet | Inspection item picker + cascading zone→floor→detail |
| Multi-photo upload + gallery | Up to 5 photos per finding/resolution, thumbnail grid + lightbox |
| Finding/resolution download | Single-item and bulk ZIP download for admin reports |

---

## Recommended Stack Additions

### Feature 1: Date Range Input

**No new library needed. Use two `<input type="date">` elements.**

`<input type="date">` triggers the native OS date picker on iOS 16+ Safari and Android 15+. This is exactly what field staff need: a familiar, touch-optimized date selector with no bundle cost.

**Compatibility:** iOS Safari has partial support but the native date picker UI works correctly. `min` and `max` attributes are not enforced by iOS Safari, so range validation (start <= end) must be done in JavaScript — a simple `Date` comparison, not a library problem.

The existing `localYMD()` helper in `SchedulePage.tsx` already formats dates as YYYY-MM-DD for API calls. No new utilities needed.

**Why not a date picker library:** react-day-picker, react-datepicker, and similar packages add 15–60 kB gzipped. They provide calendar UI that is worse on mobile than the OS-native picker. For a 4-user internal tool targeting iOS and Android, native wins on UX and bundle size simultaneously.

**DB change required:** `schedule_items.date` is currently `TEXT NOT NULL` (YYYY-MM-DD). Add `end_date TEXT NULL` via migration 0043. API POST handler for schedule creation receives `{ date, end_date? }` and either: (a) creates one row spanning the range with the range stored as-is, or (b) loops to create one row per day. Option (a) is recommended — the existing legal inspection UI consumes schedule items by ID, so one row per inspection round is the correct model.

---

### Feature 2: Structured Location BottomSheet

**No new library needed. Extend the existing hand-rolled BottomSheet component.**

The current `FindingBottomSheet` in `LegalFindingsPage.tsx` is a self-contained function component using a CSS `slideUp` keyframe animation. The v1.2 changes are purely data and layout:

- **Inspection item picker:** Replace the free-text `description` textarea with a `<select>` from `INSP_CATEGORIES` (already defined in `SchedulePage.tsx`) plus an "직접입력" option that reveals a textarea.
- **Cascading location:** Three fields — zone `<select>` (사무동/연구동/공통 from `BuildingZone` type), floor `<select>` (B5–8F values from `Floor` type), detail `<input type="text">`.

All required data constants and types already exist in the codebase. The BottomSheet needs no external component library.

**DB change:** `legal_findings.location` is a single `TEXT NULL` column. To preserve backward compatibility with existing finding records, serialize the structured location as a `구역:층:상세` string. Maximum length is ~40 chars. This avoids a migration that would alter the column definition, and the frontend can parse the colon-delimited format on display. Existing records with plain text location strings display as-is (no colon = no split needed).

---

### Feature 3: Multi-Photo Upload + Gallery

**New library needed for lightbox only. Upload and thumbnail are no-library.**

#### Upload (no new library)

Extend `usePhotoUpload.ts` into a new `useMultiPhotoUpload` hook. The hook manages an array of photo slots (max 5), each containing `{ blob: Blob | null, preview: string | null, key: string | null }`. Upload calls `/api/uploads` sequentially — the existing endpoint accepts one file per request and is unchanged.

Photo keys are stored as a comma-separated string in the `photo_key` / `resolution_photo_key` column (e.g., `inspections/20260405/abc.jpg,inspections/20260405/def.jpg`). Maximum 5 keys × ~100 chars = ~500 chars, well within SQLite TEXT. No migration needed for the `legal_findings` table columns.

#### Thumbnail Grid (no new library)

The thumbnail grid is 4 fixed-size photo thumbnails + 1 "add" slot rendered as a CSS flex row, following the visual language of the existing `PhotoButton` component. The add slot triggers the file input. No library.

#### Lightbox (new library: `yet-another-react-lightbox`)

| Property | Detail |
|----------|--------|
| Package | `yet-another-react-lightbox` |
| Current version | 3.25.0 |
| Install | `npm install yet-another-react-lightbox` |
| Gzipped size | ~25 kB (core); optional plugins are tree-shaken |
| React peer dep | React >= 18 |
| iOS 16 | Tested and supported |
| Touch | Swipe left/right built-in; pinch-to-zoom via optional `Zoom` plugin |
| Dependencies | None |
| Maintenance | Active; 300k+ weekly npm downloads; last release within past 6 months |

**Why yet-another-react-lightbox over alternatives:**
- `react-image-lightbox` — last published 2021, React 18 not officially supported, stale
- `PhotoSwipe` — requires imperative DOM manipulation outside React's render cycle; known issues with React 18 strict mode double-invoke
- `lightgallery` — GPLv3 license for open source; paid license required for internal tools (license risk)
- `yet-another-react-lightbox` — actively maintained, React-native portals, no deps, SSR-compatible, touch-first

**Integration pattern:**

```typescript
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

// slides built from comma-split keys
const slides = photoKeys.split(',').filter(Boolean).map(k => ({
  src: `/api/uploads/${k}`,
}))

<Lightbox
  open={lightboxOpen}
  close={() => setLightboxOpen(false)}
  index={lightboxIndex}
  slides={slides}
/>
```

The CSS import (`yet-another-react-lightbox/styles.css`) is ~2 kB. Vite processes it automatically with no additional config.

---

### Feature 4: Finding/Resolution Content + Photo Download

**No new library. Use existing `fflate.zipSync` (already installed) + native `<a download>`.**

#### Single-item download (no library)

Fetch the R2 image via the existing `/api/uploads/{key}` endpoint (GET, public within auth), create a `Blob URL`, set `<a download>` and click:

```typescript
async function downloadPhoto(key: string, filename: string) {
  const blob = await fetch(`/api/uploads/${key}`).then(r => r.blob())
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

#### Bulk ZIP download (fflate — already installed)

For bulk download (all photos from a finding, or all findings from a round), use `fflate.zipSync`:

```typescript
import { zipSync } from 'fflate'

async function downloadFindingZip(finding: LegalFinding) {
  const keys = (finding.photoKey ?? '').split(',').filter(Boolean)
  const files: Record<string, Uint8Array> = {}

  for (const key of keys) {
    const buf = await fetch(`/api/uploads/${key}`).then(r => r.arrayBuffer())
    const filename = key.split('/').pop()!
    files[filename] = new Uint8Array(buf)
  }

  const zipped = zipSync(files)
  const blob = new Blob([zipped], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finding-${finding.id}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
```

`zipSync` is synchronous and runs on the browser main thread — appropriate here because the payload is at most 5 photos × ~200 kB = ~1 MB. No web worker overhead needed at this scale.

**Why not a server-side ZIP endpoint on Cloudflare Workers:**
The community-validated approach for R2 + Workers ZIP uses `@zip.js/zip.js` with `configure({ useCompressionStream: false })` as a required workaround for a `pipeTo()` incompatibility in the workerd runtime. This adds a new library with a known quirk, a Pages Function endpoint to maintain, and auth passthrough complexity — all for a 4-user tool where the photos are < 1 MB total. Client-side `fflate.zipSync` is simpler, already bundled, and sufficient for this scale.

**Why not JSZip:**
`fflate` is already in `package.json` (used for Excel generation). Adding JSZip would duplicate compression functionality. `fflate.zipSync` produces standard ZIP files compatible with all OS ZIP tools.

---

## Net New Dependencies

**One new package total.**

| Package | Version | Purpose | Bundle impact |
|---------|---------|---------|---------------|
| `yet-another-react-lightbox` | `^3.25.0` | Photo fullscreen viewer with swipe | ~25 kB gzip |

Everything else is satisfied by existing code, existing libraries, or native browser APIs.

---

## Installation

```bash
# Run from cha-bio-safety/
npm install yet-another-react-lightbox
```

No removals needed. No version changes to existing packages.

---

## DB Migrations for v1.2

| Migration | SQL | Reason |
|-----------|-----|--------|
| 0043 | `ALTER TABLE schedule_items ADD COLUMN end_date TEXT;` | Date range feature — stores end date of multi-day inspection, NULL for single-day |

The `legal_findings.photo_key` and `legal_findings.resolution_photo_key` TEXT columns already support comma-separated keys. No migration needed for multi-photo support.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Two `<input type="date">` | react-day-picker | 30 kB gzip; OS-native picker is better UX on mobile |
| Two `<input type="date">` | react-datepicker | 42 kB gzip; same problem |
| Extend existing BottomSheet | headlessui / radix-ui BottomSheet | No bottom sheet primitive exists in these libs; custom CSS already works |
| yet-another-react-lightbox | react-image-lightbox | Unmaintained since 2021 |
| yet-another-react-lightbox | PhotoSwipe | React 18 strict mode issues with imperative DOM API |
| yet-another-react-lightbox | lightgallery | GPLv3 license risk for internal tools |
| fflate.zipSync (client) | Server-side ZIP Worker | Requires @zip.js/zip.js workaround; adds endpoint to maintain; overkill for < 1 MB payloads |
| fflate.zipSync (client) | JSZip | Already have fflate; adding JSZip duplicates compression |
| Comma-separated photo keys | New `legal_finding_photos` join table | Adds migration + JOIN complexity; 5 photos = ~500 chars is no constraint for SQLite TEXT |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| JSZip | Duplicate of fflate already in bundle | `fflate.zipSync()` |
| @zip.js/zip.js | Requires `configure({ useCompressionStream: false })` workaround in workerd | `fflate.zipSync()` in browser |
| react-datepicker | 42 kB gzip for functionality native `<input type="date">` provides free | `<input type="date">` + JS validation |
| react-day-picker | 30 kB gzip; calendar grid is inferior UX on mobile vs native OS picker | `<input type="date">` |
| date-fns for range validation | Overkill; range validation is arithmetic, not parsing | Plain `new Date(str)` comparison |
| lightgallery | GPLv3 requires commercial license for internal tools | `yet-another-react-lightbox` |
| Separate photo keys table | Adds JOIN, migration, API shape change for ≤5 photos | Comma-separated TEXT in existing column |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| yet-another-react-lightbox ^3.25.0 | react ^18.3.1 | Peer dep is React >= 18; matches project |
| fflate 0.8.2 (existing) | Browser main thread | `zipSync` is synchronous; safe in browser. `zip` uses Web Workers — do NOT use in Pages Functions |

---

## Sources

- Codebase audit — `src/hooks/usePhotoUpload.ts`, `src/types/index.ts`, `src/pages/LegalFindingsPage.tsx`, `src/pages/LegalFindingDetailPage.tsx`, `functions/api/uploads/index.ts`, `migrations/0038_legal_findings.sql`, `package.json` — HIGH confidence
- [MDN `<input type="date">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date) — iOS 16 partial support; `min`/`max` not enforced by Mobile Safari — HIGH confidence
- [yet-another-react-lightbox GitHub](https://github.com/igordanchenko/yet-another-react-lightbox) — React 18+, touch/swipe, no deps, active maintenance — HIGH confidence
- [fflate GitHub](https://github.com/101arrowz/fflate) — `zipSync` confirmed browser-safe, synchronous, no Web Workers — HIGH confidence
- [w00kie.com — Zip R2 objects in Cloudflare Workers](https://w00kie.com/2024/07/13/zip-r2-objects-in-memory-with-cloudflare-workers/) — confirms zip.js workaround requirement; validates client-side approach for small payloads — MEDIUM confidence
- [zip.js discussion #248](https://github.com/gildas-lormeau/zip.js/discussions/248) — fflate lacks ZIP64, confirmed acceptable for < 4 GB files (finding photos are KB range) — MEDIUM confidence

---

*Stack research for: CHA Bio Safety v1.2 UX improvements*
*Researched: 2026-04-05*

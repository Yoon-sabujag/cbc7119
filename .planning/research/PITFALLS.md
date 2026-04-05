# Pitfalls Research

**Domain:** Cloudflare Pages + D1 + R2 PWA — v1.2 UX improvements (multi-photo, bulk download, BottomSheet restructure, date-range input)
**Researched:** 2026-04-05
**Confidence:** HIGH — live documentation verified for Workers limits, R2 ZIP streaming, iOS PWA download restrictions, and D1 JSON patterns.

---

## Critical Pitfalls

---

### Pitfall 1: Buffering All 5 Photos in the Worker for ZIP Bulk Download Exceeds 128 MB Memory

**What goes wrong:**
A "bulk download" endpoint that fetches up to 5 photos per finding, plus photos for every finding in a legal inspection session, can require reading many R2 objects into Worker memory simultaneously. With 20 findings each having 5 photos at ~200 KB each, that is 20 MB before ZIP overhead. With 50 findings it hits 50+ MB — dangerously close to the 128 MB per-isolate ceiling. Any additional memory for the ZIP central directory, response buffer, or TanStack Query payloads can push the invocation over the limit. The Worker is killed with a 1102 error.

**Why it happens:**
Developers use `JSZip` or similar libraries that call `.generateAsync({ type: 'nodebuffer' })` which materialises the entire archive in memory before streaming. The R2 objects are also fully buffered via `await r2obj.arrayBuffer()` before being handed to the ZIP library. This pattern is natural in Node.js but fatal in a constrained isolate.

**How to avoid:**
Use a streaming ZIP approach: write each file's local header, pipe the R2 object body directly through a `TransformStream` to the Response body, then write the central directory at the end. The entire archive never accumulates in the isolate's heap — only a few kilobytes of metadata per file do. For v1.2 (max 5 photos per finding, low total volume with 4 users), a simpler "download all as separate presigned URLs" pattern may be acceptable instead of a true ZIP: return a JSON array of short-lived signed R2 URLs and trigger downloads client-side via sequential `<a>` clicks. This avoids server-side ZIP entirely. Confirm with the team whether a ZIP or individual downloads is acceptable for reporting use.

**Warning signs:**
- Worker returns HTTP 1102 on the bulk download endpoint
- Endpoint works for 1–3 photos but fails for 5
- `wrangler tail` logs show `Worker exceeded memory limits`

**Phase to address:** Multi-photo download phase. Design the download API before writing any ZIP code — decide ZIP vs. URL list first.

---

### Pitfall 2: D1 Schema Migration — Changing `photo_key TEXT` to Multi-Photo Without Breaking Existing Records

**What goes wrong:**
`legal_findings` currently has `photo_key TEXT` and `resolution_photo_key TEXT` (single keys). Adding multi-photo support by adding a parallel `photo_keys TEXT` JSON column requires existing data to remain readable by both old and new code paths simultaneously during deployment. If the API is updated to write to `photo_keys` but the UI still reads `photo_key`, or vice versa, findings recorded during the deploy window will silently drop their photos.

**Why it happens:**
D1 does not support transactions that span a migration apply and a code deploy. There is always a window — typically 30–120 seconds on Cloudflare Pages — where old Worker code serves alongside the new schema (or new code against old schema). With 4 users on 3-shift rotation, this window can coincide with active use.

**How to avoid:**
Follow the expand/migrate/contract pattern:
1. Migration adds `photo_keys TEXT` (JSON array) alongside the existing `photo_key TEXT` — do not remove the old column yet.
2. New Worker code writes to `photo_keys` AND backfills `photo_key` with `photo_keys[0]` for backward compatibility.
3. New UI reads `photo_keys` with a fallback: if `photo_keys` is null/empty, display `photo_key` as a single-item array.
4. Only after all code is deployed and verified does a follow-up migration drop `photo_key` (this step can be deferred to v1.3 or later).
Do the same for `resolution_photo_key` → `resolution_photo_keys`.

**Warning signs:**
- Findings created after deploy show no photos in the gallery
- Old findings show photos in single-photo view but 0 in gallery count
- API returns `photo_keys: null` but `photo_key: "inspections/..."` for old records

**Phase to address:** Multi-photo upload phase, migration step. Must be the first migration in v1.2 and must be deployed before any UI changes.

---

### Pitfall 3: iOS Safari PWA — `<a download>` and `URL.createObjectURL()` Do Not Trigger File Save

**What goes wrong:**
On iOS Safari (including when the PWA is added to the Home Screen), the HTML `download` attribute on an anchor element is silently ignored. `URL.createObjectURL(blob)` followed by `a.click()` opens the blob in a new Safari tab instead of saving it to the Files app. From iOS 18.2+, blob URLs created with `createObjectURL` no longer appear in the Files app at all, even if the user manually saves. This breaks any "download finding photo" or "bulk download" feature implemented with the standard browser download pattern.

**Why it happens:**
WebKit bug 167341 (the download attribute) has been open since 2017 and is still unresolved as of 2026. Apple's PWA implementation on iOS applies stricter sandboxing that prevents `<a download>` from interacting with the system file picker. The project targets iOS 16.3.1+ where this has never worked.

**How to avoid:**
For individual image download: use `window.open(imageUrl, '_blank')` which triggers Safari's share sheet (the user can then use "Save to Photos"). This is the only reliably consistent iOS path. For "download" scenarios, display the image full-screen and show a native iOS prompt: "Long-press the image → Save to Photos." For PDF/report generation where a real download is required, generate the file server-side (Worker → R2), return an R2 object URL, and open it in a new tab — iOS will render the PDF in Safari's built-in viewer with a share/save button. Do not implement `FileSaver.js` or any blob-URL download shim — they all fail the same way on iOS Safari PWA.

**Warning signs:**
- "Download" button appears to work in Chrome desktop (dev environment) but does nothing on iOS
- Safari on iPhone opens a new tab with a blob URL that shows a blank page
- Users report photos disappearing immediately when they try to save

**Phase to address:** Finding photo download phase. Implement and test the iOS save path before the Android/desktop path — iOS is the harder constraint. If a team member has iOS 16.3.1, test on that device specifically.

---

### Pitfall 4: iOS Camera Permission Not Persisted Between Sessions in PWA Mode

**What goes wrong:**
When `usePhotoUpload` triggers the `<input type="file" accept="image/*" capture="environment">` element, iOS Safari prompts for camera permission. In PWA (Home Screen app) mode, this permission is not persisted — users are re-prompted on every new session (and sometimes mid-session). Expanding to 5-photo upload with sequential camera taps can trigger 5 permission prompts in a single workflow, breaking the flow for field inspectors.

**Why it happens:**
iOS PWA camera permission persistence is intermittently broken across iOS versions. The permission dialog reappears because the PWA context does not reliably store user grants across sessions. This is a known WebKit limitation documented by multiple teams in 2024–2026.

**How to avoid:**
For the multi-photo flow, do not use `capture="environment"` attribute which forces the camera app and triggers a separate permission request per activation. Instead, use `accept="image/*"` without `capture` — this presents the iOS system picker (Camera / Photo Library options) and requires only one permission per entry. The user can still choose to take a new photo via the picker without triggering additional camera permission dialogs. Additionally, batch the photo selection: one `<input multiple>` tap can select up to 5 images from the photo library without any permission dialog (Photo Library access is granted once). Offer two buttons: "카메라 촬영" (single shot via `capture`) and "사진 선택" (multiple from library via `multiple`).

**Warning signs:**
- iOS users report being asked for camera permission repeatedly during testing
- Photos from gallery work but camera photos intermittently fail
- Permission dialog appears even when the user chose "Always Allow" in a previous session

**Phase to address:** Multi-photo upload UI phase. Design the photo input UX before implementation.

---

### Pitfall 5: Sequential per-Photo R2 Uploads Blocking BottomSheet Form Submission

**What goes wrong:**
The current `usePhotoUpload` hook uploads one photo at a time via `POST /api/uploads`. If the multi-photo upload for legal findings uploads photos sequentially (one `fetch` call per photo, waiting for each to finish before starting the next), uploading 5 photos over a 4G connection in a basement utility room takes 10–30 seconds. The user sees the BottomSheet frozen with a loading spinner and may force-close the app, leaving orphaned R2 objects and an incomplete finding record.

**Why it happens:**
Sequential upload is the natural evolution of the existing single-photo pattern. Copy-pasting the `upload()` call in a for-loop uploads sequentially. The existing hook also has no abort/cancel mechanism, so a user closing the BottomSheet mid-upload leaves the upload in-flight with no cleanup.

**How to avoid:**
Use `Promise.all()` for parallel uploads — 5 concurrent uploads to R2 via Cloudflare's edge complete in the same time as 1 sequential upload on a good connection. Add an `AbortController` to each fetch so that closing the BottomSheet cancels in-flight uploads. Save the returned `photo_keys` array only after all uploads resolve; if any fail, surface an error for that specific photo slot rather than failing the entire form. Orphaned R2 objects (from partial uploads) are acceptable in this low-volume system — no lifecycle policy is needed.

**Warning signs:**
- Finding creation takes more than 5 seconds with multiple photos on mobile
- Network tab shows uploads happening one after another (waterfall) instead of in parallel
- R2 bucket accumulates objects with no corresponding D1 records after testing

**Phase to address:** Multi-photo upload implementation. Rewrite `usePhotoUpload` as `useMultiPhotoUpload` with parallel upload and abort support.

---

### Pitfall 6: Storing Multi-Photo Keys as JSON Text Column Breaks the Existing COALESCE Update Pattern

**What goes wrong:**
The current `PUT /api/legal/:id/findings/:fid` handler uses:
```sql
SET photo_key = COALESCE(?, photo_key)
```
This means sending `null` preserves the existing value. If `photo_keys` is a JSON text column, the same pattern breaks: sending a partial array like `["key1"]` via `COALESCE` would overwrite `["key1","key2","key3"]` with `["key1"]`, silently deleting photos. Developers will copy-paste this pattern without thinking.

**Why it happens:**
The COALESCE pattern is correct for scalar values (replace if provided, keep if null). It is incorrect for JSON arrays where partial updates are expected — the merge semantics are different.

**How to avoid:**
For `photo_keys` updates, never use COALESCE. Instead, always send the full replacement array in the PUT body. The client is responsible for reading the current keys, adding or removing from the array, and sending the complete new array. The API handler validates that the array has 0–5 elements and that all keys have valid R2 path formats before writing. Alternatively, implement explicit add/remove endpoints: `POST .../photos` to add a key, `DELETE .../photos/:keyIndex` to remove one — this is more REST-correct but adds API surface.

**Warning signs:**
- Deleting one photo from a 3-photo finding clears all photos
- Adding a 4th photo to a 3-photo finding replaces the first 3 with just the 4th
- API returns 200 but photo count in the gallery is wrong

**Phase to address:** Multi-photo schema and API phase, immediately when writing the new PUT handler.

---

### Pitfall 7: Date Range Input for Multi-Day Legal Inspections Creates Duplicate schedule_items That Break the Legal Inspection List Query

**What goes wrong:**
The legal inspection list query in `/api/legal` filters by exact title strings:
```sql
WHERE si.category = 'fire'
  AND si.title IN ('소방 상반기 종합정밀점검', '소방 하반기 작동기능점검')
```
A date-range registration feature that creates one `schedule_items` row per day will generate 4–5 rows with the same title. The legal inspection UI currently uses `schedule_item_id` as the primary key for attaching findings. With 5 duplicate-titled rows, users won't know which day to attach a finding to, and the list view will show 5 separate entries that look identical.

**Why it happens:**
The design intent for date-range input is "register a multi-day inspection as a single block, one row per day." But the existing API and UI were designed for single-day, single-row entries. The many-rows-per-inspection model requires UI changes to group them by inspection event, not just by row.

**How to avoid:**
Choose one of two models before writing any code:
- **Single-row model:** Store start and end dates in one `schedule_items` row (`date` = start date, add `end_date` column via migration). The single row gets all findings attached to it. The calendar shows it spanning multiple days. This is the simpler migration.
- **Multi-row model:** Create one row per day, link them via a `group_id` column. Findings attach to the `group_id`, not individual rows. The legal list query groups by `group_id`. This is more complex but preserves per-day status tracking.

For v1.2, the single-row model with an `end_date` column is strongly preferred — it requires one migration (`ALTER TABLE schedule_items ADD COLUMN end_date TEXT`) and minimal UI changes. The calendar can display the range by checking if `end_date` exists.

**Warning signs:**
- Legal inspection list shows 5 duplicate entries after registering a week-long inspection
- Findings attached to day 1 don't appear when viewing day 3's entry
- Calendar shows 5 dots for a single inspection week

**Phase to address:** Date-range input phase. Architectural decision must be made before the migration is written — document the chosen model in the phase spec.

---

### Pitfall 8: Blob URL Memory Leak When Rendering 5-Photo Thumbnail Grid

**What goes wrong:**
The current `usePhotoUpload` creates one `URL.createObjectURL(blob)` per photo and cleans it up in `removePhoto` and `reset`. A 5-photo thumbnail grid creates 5 blob URLs. If the BottomSheet unmounts without calling `reset()` on each photo slot (e.g., user taps the back button), all 5 object URLs remain alive in browser memory. On a field device doing 20+ findings per session, this accumulates to 100 unreleased blob URLs pointing to compressed image blobs in memory.

**Why it happens:**
`useEffect` cleanup in the existing hook only revokes the single current preview. A multi-photo hook that stores an array of previews requires a `useEffect` that revokes all of them on unmount — this is easy to forget when extending the hook.

**How to avoid:**
In `useMultiPhotoUpload`, store previews as `string[]` and add:
```typescript
useEffect(() => {
  return () => { previews.forEach(url => URL.revokeObjectURL(url)) }
}, [])
```
Additionally, call `URL.revokeObjectURL(preview)` immediately when a specific photo slot is removed. Do not rely on garbage collection — on iOS, V8 does not eagerly collect unreachable blob URLs.

**Warning signs:**
- Device memory usage grows over a long inspection session
- iOS Safari crashes or the PWA reloads unexpectedly after 30+ photos are previewed
- Performance degrades after several BottomSheet open/close cycles

**Phase to address:** Multi-photo upload UI implementation.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep `photo_key` + add `photo_keys` (expand only, no contract) | Zero downtime migration, no rewrite | Two columns forever, every query maps both | Acceptable for v1.2; schedule removal for v1.3 |
| Return R2 URLs as presigned links instead of streaming ZIP | No Worker ZIP complexity | Users download photos separately, not as one file | Acceptable given 4-user scale and low volume |
| Single-row model for date ranges (`end_date` column only) | One migration line, no group logic | Calendar date-range display needs extra rendering code | Acceptable for v1.2 |
| `window.open()` instead of `<a download>` for iOS photo save | Works reliably on iOS | Not a true download UX; requires user action in share sheet | Acceptable for internal 4-user tool |
| Sequential photo uploads (for-loop) | Simple to implement | Slow on weak connections | Never — parallel is not harder and field conditions are poor |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| R2 + multi-photo upload | Upload photos then create finding in sequence; if finding creation fails, photos are orphaned in R2 | Accept orphaned R2 objects (4-user, low volume); or upload photos first, collect all keys, then POST finding — don't interleave |
| D1 JSON column (`photo_keys`) | `json_extract` queries on photo_keys for search/filter | Don't query inside JSON arrays in D1 — store keys flat in a join table if you need indexed lookups; for 4 users, a full-scan on findings is fine |
| iOS PWA + camera input | `capture="environment"` with `multiple` attribute | `capture` and `multiple` are mutually exclusive on iOS — they do not co-exist reliably |
| Cloudflare Pages deploy + D1 migration | Apply migration and deploy code in one step | Apply migration first, wait for D1 propagation (~5 seconds), then deploy the Worker code |
| R2 object serving for download | `Cache-Control: private, max-age=31536000` for auth-protected photos | Correct as-is for authenticated R2 proxy; do not change to `public` — R2 keys would be guessable |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Parallel `Promise.all` over 5 R2 fetches in one Worker invocation for bulk download | Timeout on large photos | Use streaming ZIP or return URLs to client; max total payload ~5 MB per request | Breaks above ~25 MB total if buffering |
| Rendering 5 `<img src={blobUrl}>` inside a BottomSheet with `overflow: scroll` on iOS | Jank/scroll stutter | Use `loading="lazy"` + fixed thumbnail size (120x120); compress to ≤200 KB before preview | Noticeable on iPhone SE class devices immediately |
| Querying `legal_findings` with `ORDER BY status, created_at DESC` + JOIN on staff twice | Slow on large finding lists | The existing index `idx_legal_findings_schedule_item` covers this; verify with EXPLAIN | Not a problem at current scale (< 100 findings) |
| Date range calendar rendering all days between start/end_date individually | Extra render passes in calendar view | Compute range spans client-side via `date-fns eachDayOfInterval` + memo | Fine for 4-user calendar; not a concern |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing R2 photo keys in bulk download response without auth check | Finding photos accessible to unauthenticated requests via `/api/uploads/{key}` | The existing middleware protects `/api/uploads` via JWT — verify the `[[path]].ts` handler does NOT have a public route exception |
| Allowing `photo_keys` to contain arbitrary strings (path traversal) | User stores `../../wrangler.toml` as a key and retrieves internal files | Validate that every key in `photo_keys` matches `/^(inspections|documents)\/\d{8}\/[A-Za-z0-9]+\.(jpg|png|webp|pdf)$/` before INSERT |
| Bulk download endpoint with no pagination or item limit | Single request fetches all findings + all photos for an entire year | Limit bulk download to one schedule_item at a time (one legal inspection session); document this as the intended scope |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing upload progress as a single spinner for 5 parallel uploads | User doesn't know which photos are uploading | Show per-photo progress indicators (small spinner per thumbnail slot) |
| BottomSheet location picker with free-text zone/floor/detail in 3 separate inputs | Inspectors type the same floor repeatedly per finding | Pre-populate floor from the current inspection context (pass `floor` from the schedule_item into the BottomSheet); only detail is free-text |
| Date range start/end input using a standard `<input type="date">` | iOS Safari renders the native date picker which is hard to use in a BottomSheet | Use the existing WheelPicker pattern from InspectionPage for date selection — it's already proven on iOS in this codebase |
| "Download all" button that triggers 5+ browser download dialogs simultaneously on iOS | Safari blocks multiple simultaneous download triggers | On iOS, open photos sequentially (one per tap on "next") or provide a gallery view with the standard iOS share sheet |
| Empty state for 0-photo findings shown as a broken image icon | Users think photo upload failed | Explicitly render a "사진 없음" placeholder card with an add-photo affordance |

---

## "Looks Done But Isn't" Checklist

- [ ] **Multi-photo gallery:** Verify that existing single-photo findings (with `photo_key` but no `photo_keys`) still display correctly after the schema migration.
- [ ] **Bulk download:** Test on iOS Safari PWA mode specifically — desktop Chrome passing is not sufficient.
- [ ] **Date range input:** Verify that the legal inspection list query still returns the correct finding counts when a single `schedule_item` spans multiple days.
- [ ] **BottomSheet location picker:** Confirm that the zone/floor/detail values are stored as a structured field (not concatenated string) so future filtering is possible.
- [ ] **Photo upload abort:** Confirm that closing the BottomSheet mid-upload cancels the in-flight fetch requests and does not leave the form in a loading state.
- [ ] **Blob URL cleanup:** Open DevTools Memory tab, do 10 finding create/cancel cycles, and verify heap size does not grow.
- [ ] **5-photo limit enforcement:** Confirm the API rejects a `photo_keys` array with more than 5 elements, and the UI disables the add-photo button at 5.
- [ ] **iOS camera permission flow:** Test `capture` vs. `multiple` input on a real iOS 16.x device — simulators do not reproduce permission behavior accurately.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Worker OOM on bulk download | LOW | Switch to URL-list response instead of server-side ZIP; no DB changes needed |
| Photo key column migration breaks existing findings | MEDIUM | Add `photo_keys` with default `NULL`; UI fallback to `photo_key` requires one deploy; no data loss |
| iOS download broken in production | LOW | Replace `<a download>` with `window.open()` + share sheet instruction; one UI commit |
| date_range multi-row model chosen then needs rework | HIGH | Requires new migration, group_id FK on findings, API rewrite — avoid by choosing single-row model upfront |
| JSON `photo_keys` COALESCE bug silently clears photos | MEDIUM | Bug fix deploy + manual R2 key restoration from Worker logs if keys were logged at insert time |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Worker memory on bulk download (P1) | Multi-photo download design | Test with 5 photos at max compressed size before writing ZIP code |
| `photo_key` → `photo_keys` migration (P2) | Schema migration phase (first in milestone) | Query both columns after migration; verify old findings readable |
| iOS `<a download>` broken (P3) | Download UI phase | Test on physical iOS device in Home Screen PWA mode |
| iOS camera permission re-prompting (P4) | Multi-photo upload UI | Use `accept="image/*"` without `capture` for multi-select; test on real iOS |
| Sequential upload blocking (P5) | Multi-photo upload implementation | Parallel uploads via `Promise.all`; abort on BottomSheet close |
| COALESCE breaks JSON array updates (P6) | Multi-photo API implementation | Write unit test: add photo → delete photo → verify remaining photos intact |
| Date range creating duplicate rows (P7) | Date-range input design (decide model before migration) | Legal list shows exactly 1 entry per inspection event after registration |
| Blob URL memory leak (P8) | Multi-photo upload hook implementation | DevTools Memory snapshot: heap stable across 10 open/close cycles |

---

## Sources

- Cloudflare Workers limits (CPU, memory 128 MB, subrequests): https://developers.cloudflare.com/workers/platform/limits/ — verified 2026-04-05, paid plan allows up to 5 minutes CPU time; memory is 128 MB per isolate regardless of plan
- Cloudflare Workers CPU limits raised to 5 minutes (March 2025): https://developers.cloudflare.com/changelog/post/2025-03-25-higher-cpu-limits/
- Streaming ZIP on Cloudflare Workers without buffering entire archive: https://dev.to/ryan_e200dd10ede43c8fc2e4/how-i-built-streaming-zip64-on-cloudflare-workers-128mb-ram-no-filesystem-3aaf
- Community ZIP from R2 on Workers: https://community.cloudflare.com/t/cloudflare-worker-on-fly-zipping-of-r2-contents/469454
- iOS Safari `download` attribute WebKit bug (open since 2017): https://bugs.webkit.org/show_bug.cgi?id=167341
- iOS PWA limitations 2026 (file download, camera): https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide
- iOS Safari download workarounds (2025): https://www.simon-neutert.de/2025/js-safari-media-download/
- iOS blob URL issues (iOS 18.2+): https://developer.apple.com/forums/thread/751063
- Camera access issues in iOS PWA: https://kb.strich.io/article/29-camera-access-issues-in-ios-pwa
- D1 ALTER TABLE ADD COLUMN community discussion: https://community.cloudflare.com/t/d1-alter-table-add-column-not-working/809595
- D1 JSON query support: https://developers.cloudflare.com/d1/sql-api/query-json/
- React multiple file upload blob URL cleanup patterns (2025-2026): https://react.wiki/hooks/file-upload-hook/

---
*Pitfalls research for: v1.2 UX improvements on Cloudflare Workers + D1 + R2 PWA*
*Researched: 2026-04-05*

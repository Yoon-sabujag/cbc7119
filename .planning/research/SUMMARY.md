# Project Research Summary

**Project:** CHA Bio Safety v1.2 — UX Improvements
**Domain:** Fire Safety / Facility Management PWA (Cloudflare Pages + D1 + R2)
**Researched:** 2026-04-05
**Confidence:** HIGH

## Executive Summary

This project adds four UX improvements to an existing production PWA used by a 4-person fire safety team. The app is built on a locked stack (React 18, Cloudflare Pages Functions, D1, R2) with 42 migrations already in production. All four features — date range scheduling, structured finding BottomSheet, multi-photo upload, and findings download — extend the existing `legal_findings` / `schedule_items` domain. The recommended approach is additive: one new dependency (`yet-another-react-lightbox`), one DB migration (0043), and no breaking changes to existing data structures. Every design decision prioritizes zero-downtime deployment and backward compatibility with existing records.

The primary risk vector is the iOS Safari PWA environment. Three distinct iOS limitations affect v1.2: the `<a download>` attribute is silently ignored in PWA mode (use `window.open()` and the share sheet instead), the `capture` and `multiple` attributes on file inputs are mutually exclusive on iOS (require separate buttons for camera and library), and blob URLs from `createObjectURL` no longer persist to Files on iOS 18.2+. All download and upload UI must be designed for iOS first and tested on a physical iOS 16.x device in Home Screen PWA mode — Chrome desktop results are not representative.

The second architectural risk is the `photo_key` to multi-photo migration. The correct path is additive: add `photo_keys TEXT DEFAULT '[]'` alongside the existing `photo_key` column, and have the API read both with a fallback. Destructive renames or data migrations in the same step risk silently nulling photos for existing resolved findings. The `elevator_repairs` table already uses JSON-array TEXT columns for multi-photo, confirming this is the established project pattern.

## Key Findings

### Recommended Stack

The existing stack requires no changes except one new package. All v1.2 features are achievable with native `<input type="date">` (no date picker library), the existing hand-rolled BottomSheet component (no headlessui or radix), `yet-another-react-lightbox` for the photo fullscreen viewer, and `fflate.zipSync` already in the bundle for ZIP generation. The only stack addition is `yet-another-react-lightbox ^3.25.0` (~25 kB gzip) — chosen over `react-image-lightbox` (unmaintained since 2021), `PhotoSwipe` (React 18 strict mode issues), and `lightgallery` (GPLv3 license risk for internal tools).

**Core technologies:**
- `<input type="date">` (native): Date range input — native iOS/Android picker, zero bundle cost, superior mobile UX vs. any library; `min`/`max` not enforced by iOS Safari so JS validation required
- `yet-another-react-lightbox ^3.25.0` (new): Photo lightbox — actively maintained, React 18, touch/swipe, no deps, ~25 kB gzip
- `fflate.zipSync` (existing): Client-side ZIP for bulk download — already bundled for Excel generation, synchronous, browser-safe at max ~10 MB payload
- JSON array in TEXT column (existing project pattern): Multi-photo storage — established by `elevator_repairs` table at migration 0041, no junction table needed
- Migration 0043 (one new migration): Additive columns only — `photo_keys TEXT DEFAULT '[]'`, `resolution_photo_keys TEXT DEFAULT '[]'`, `inspection_item TEXT` on `legal_findings`

### Expected Features

All four features are confirmed table stakes for inspection apps (SafetyCulture, GoAudits, FieldEz patterns). Priority order is set by implementation independence: date range is fully independent and ships as its own phase; structured BottomSheet needs its own migration but not multi-photo; multi-photo is the largest change and blocks download; download depends on multi-photo for full value.

**Must have (table stakes):**
- Date range input (start/end dates) — current single-date forces 4-5 manual re-entries per multi-day inspection cycle
- BottomSheet item picker with "직접입력" fallback — predefined list (~25 items) eliminates typo variance across rounds
- Structured location (zone/floor/detail) — stored as `zone|floor|detail` encoded in existing TEXT column; enables future filtering
- Multi-photo upload up to 5 per finding/resolution — single photo is a daily felt limitation in field work
- Thumbnail grid with tap-to-enlarge lightbox — mandatory UX for multi-photo on small mobile viewports
- Per-item download (finding metadata + photos) — admin compliance report preparation
- Bulk download (all findings in a round as ZIP) — standard export for facility inspection reporting

**Should have (competitive):**
- Per-photo progress indicators per slot (not a single spinner for all uploads)
- Contextual floor pre-population from schedule item context in BottomSheet
- Named ZIP entries with context (`[N]_finding/지적사진-1.jpg`) for self-documenting archives
- Filter findings by zone/floor across rounds (enabled by structured location; add in a later release)

**Defer (v2+):**
- Offline photo queue — connectivity is sufficient per PROJECT.md ("현재 네트워크 환경 충분")
- AI auto-fill for finding descriptions — separate future milestone per PROJECT.md
- Drag-to-reorder photos — brittle on mobile Safari, low ROI for field use
- Real-time collaborative editing — last-write-wins is acceptable for 4 users

### Architecture Approach

The architecture is a React SPA calling Cloudflare Pages Functions with D1 (SQLite) and R2. The v1.2 change surface is concentrated in three pages (`SchedulePage`, `LegalFindingsPage`, `LegalFindingDetailPage`), three API handler files (`schedule/index.ts`, `legal/[id]/findings/index.ts`, `[fid].ts`, `[fid]/resolve.ts`), two new files (`useMultiPhotoUpload.ts` hook, `PhotoGrid.tsx` component), and one migration. All download functionality runs client-side — no new API endpoints needed. The `fflate` ZIP runs in the browser (max ~10 MB for 10 findings at 5 photos each at 200 KB), well within browser memory limits on target devices (iOS 16.3.1+).

**Major components:**
1. `useMultiPhotoUpload` hook — manages array of up to 5 photo slots, sequential R2 upload, AbortController cleanup on BottomSheet unmount, blob URL revocation in useEffect cleanup
2. `PhotoGrid` component — 72x72 px thumbnail grid with add slot and lightbox overlay; replaces single `PhotoButton` in legal finding pages only; `PhotoButton` is unchanged for inspection and remediation pages
3. Migration 0043 — additive columns on `legal_findings`: `photo_keys TEXT DEFAULT '[]'`, `resolution_photo_keys TEXT DEFAULT '[]'`, `inspection_item TEXT`; existing `photo_key` and `resolution_photo_key` columns retained for legacy fallback
4. `FindingBottomSheet` (restructured) — item picker with `FINDING_ITEMS` constant plus "직접입력" plus 3-level location chain wired to `useMultiPhotoUpload`
5. `SchedulePage AddModal` (modified) — end_date input plus day count preview; `POST /api/schedule` handler loops one `schedule_items` row per calendar day in range

### Critical Pitfalls

1. **iOS `<a download>` is silently ignored in PWA Home Screen mode** — WebKit bug 167341 has been open since 2017 and is unresolved as of 2026. Use `window.open(url, '_blank')` for photos. For PDF/report output, generate HTML and open in a new tab for the user to print-to-PDF. Never use `FileSaver.js` or blob URL anchor download shims on iOS.

2. **`photo_key` to `photo_keys` migration breaks existing records if done destructively** — Apply an expand-only migration (add `photo_keys` column with DEFAULT '[]', keep `photo_key` intact). API reads `photo_keys` with fallback to `photo_key` for legacy records. Deploy the migration first, wait ~5 seconds for D1 propagation, then deploy the Worker code. Drop `photo_key` in a future migration only after confirming all records use the new column.

3. **Date range multi-row model creates duplicate schedule entries that break the legal inspection list query** — Use the single-row model: one `schedule_items` row per calendar day in the range (loop INSERT in the API handler). The existing legal inspection list query and finding attachment by `schedule_item_id` both work correctly with this model. Do not design a group_id model — it requires API and UI rewrites.

4. **COALESCE pattern silently deletes photos when applied to JSON array columns** — The existing `PUT` handler uses `COALESCE(?, photo_key)`. Never apply this pattern to `photo_keys`. Always send the full replacement array from the client. The API validates that the array has 0-5 elements before writing.

5. **iOS camera permission re-prompts with `capture="environment"` in multi-photo flows** — The `capture` and `multiple` attributes are mutually exclusive on iOS. For multi-photo, use `accept="image/*"` without `capture` and offer two separate buttons: single camera shot and multi-select from library. Test on a physical iOS 16.x device — simulators do not reproduce permission behavior.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Multi-Photo Infrastructure (DB + Hook + Component)

**Rationale:** Multi-photo is the architectural blocker for the entire milestone. The DB migration must land before any UI changes to avoid a deploy-window data loss window. `PhotoGrid` and `useMultiPhotoUpload` are shared by BottomSheet (Phase 2) and DetailPage. Shipping infrastructure first unblocks all downstream phases and eliminates data integrity risk.

**Delivers:** Migration 0043 applied, `useMultiPhotoUpload` hook with sequential uploads plus AbortController, `PhotoGrid` component with lightbox (read-only display mode), updated API handlers accepting `photo_keys[]`, `LegalFindingDetailPage` displaying existing finding photos via PhotoGrid (display-only, no upload yet), `LegalFinding` and related TypeScript types updated.

**Addresses:** Multi-photo upload (table stakes), thumbnail grid with lightbox (table stakes)

**Avoids:** Pitfall 2 (additive migration — keep `photo_key`, add `photo_keys` with fallback read), Pitfall 4 (never COALESCE a JSON array column), Pitfall 6 from PITFALLS.md (blob URL cleanup in useEffect), Pitfall 8 from PITFALLS.md (parallel uploads with AbortController for abort on unmount)

### Phase 2: Finding BottomSheet Restructure

**Rationale:** Depends on `PhotoGrid` and `useMultiPhotoUpload` from Phase 1 to wire multi-photo upload into the finding create/resolve flows. Shares migration 0043's `inspection_item` column. Independent of Phase 3 (date range) and Phase 4 (download).

**Delivers:** `FINDING_ITEMS` constant (~25 common inspection items), restructured `FindingBottomSheet` with item picker plus "직접입력" plus zone/floor/detail location chain plus `PhotoGrid` upload slot, resolve flow updated to accept `resolution_photo_keys[]`.

**Addresses:** Structured BottomSheet item picker (table stakes), structured location (table stakes), multi-photo creation and resolve flows

**Avoids:** Pitfall 5 from PITFALLS.md (iOS camera permission — use `accept="image/*"` with two separate buttons, no `capture` + `multiple` on same input), UX pitfall of blank "사진 없음" state (render explicit placeholder)

### Phase 3: Schedule Date Range Input

**Rationale:** Fully independent of Phases 1 and 2. No DB migration needed — the single-row model (one `schedule_items` row per day) requires only a loop in the API handler and a UI change in `AddModal`. Listed as Phase 3 because Phase 1 is the architectural blocker that should be unambiguously the first priority, but this phase can be executed in parallel with Phase 1 if a second developer is available.

**Delivers:** `AddModal` in `SchedulePage` with start/end date inputs plus day count preview ("N일 일정이 추가됩니다"), `POST /api/schedule` loops one row per calendar day with a 14-day max guard, `scheduleApi.create` type signature updated.

**Addresses:** Date range input (table stakes), multi-day legal inspection scheduling pain

**Avoids:** Pitfall 7 from PITFALLS.md (single-row model — one row per day — avoids duplicate-titled entries breaking the legal inspection list query)

### Phase 4: Finding Download (Per-Item + Bulk ZIP)

**Rationale:** Depends on Phase 1 multi-photo display for full archive value. Per-item and bulk download share the fetch-blobs-and-assemble pattern and should ship together. Both are client-side only — no new API endpoints. iOS download behavior must be tested before shipping.

**Delivers:** Per-item download button in `LegalFindingDetailPage` (admin gate) — HTML page with metadata plus base64-embedded photos opened in new tab for print-to-PDF. Bulk ZIP download button in `LegalFindingsPage` (admin gate) — `fflate.zip` of all finding content and photos with context-named entries (`finding-001/지적사진-1.jpg` etc.).

**Addresses:** Per-item download (table stakes), bulk download (table stakes)

**Avoids:** Pitfall 3 from PITFALLS.md (iOS `<a download>` — use `window.open()` and share sheet; never blob URL anchor on iOS PWA), Pitfall 1 from PITFALLS.md (client-side ZIP avoids Worker 128 MB memory limit entirely — no server-side ZIP endpoint needed)

### Phase Ordering Rationale

- Phase 1 must be first: the migration must precede all code changes to avoid a deploy-window where new code runs against the old schema. `PhotoGrid` and the hook are shared dependencies — build once, use in Phase 2 and beyond.
- Phase 2 must follow Phase 1: the BottomSheet creation and resolve flows require `PhotoGrid` for upload. The `inspection_item` column lands in migration 0043 with Phase 1.
- Phase 3 is independent: it can run in parallel with Phase 1 on a separate branch if a second developer is available. If working sequentially, Phase 3 is the lowest-risk feature and ships quickly after Phase 1.
- Phase 4 is last: full archive value requires multi-photo (Phase 1). Shipping download before Phase 1 means the feature delivers only single-photo archives. iOS download testing also requires a stable feature to test against.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Migration + hook):** The expand/migrate/contract migration pattern and the AbortController integration in `useMultiPhotoUpload` need explicit implementation spec. The COALESCE pitfall is non-obvious — the phase spec must document the full replacement array contract for `photo_keys` PUT updates explicitly.
- **Phase 4 (Download):** iOS download behavior varies by iOS version (16.x vs 18.2+). The phase spec should include a decision tree and explicit iOS test cases before implementation begins. Confirm test device availability (physical iOS 16.x in PWA Home Screen mode).

Phases with standard patterns (skip research-phase):
- **Phase 2 (BottomSheet):** All data constants and types exist in the codebase. The change is a UI restructure on an existing component. No novel integration.
- **Phase 3 (Date range):** Straightforward API loop plus UI field addition. Single-row model decision is locked by research. No ambiguity.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Derived from direct codebase audit at migration 0042. `yet-another-react-lightbox` verified for React 18 compatibility and active maintenance. All other decisions use existing dependencies. |
| Features | HIGH (scope) / MEDIUM (UX patterns) | Feature scope from codebase analysis is authoritative. UX patterns from GoAudits, SafetyCulture, FieldEz comparisons are directional guides, not prescriptive requirements. |
| Architecture | HIGH | All integration points traced through actual production code at migration 0042. JSON-array TEXT pattern validated from `elevator_repairs` table in the same codebase (migration 0041). |
| Pitfalls | HIGH | iOS download limitation (WebKit bug 167341) is documented and verified across multiple sources including Apple Developer Forums. Worker memory limits are from official Cloudflare docs. D1 migration and COALESCE risks are from codebase-specific analysis of the exact SQL patterns in use. |

**Overall confidence:** HIGH

### Gaps to Address

- **FINDING_ITEMS list content:** Research specifies ~25 items from the 소방시설 자체점검 체크리스트 standard categories. The exact Korean-language item strings must be drafted and reviewed with the fire safety team before Phase 2 implementation. This is a domain decision, not a technical one.
- **iOS test device availability:** Three critical pitfalls (download, camera permission, blob URL) require testing on a physical iOS 16.3.1 device in PWA Home Screen mode. Confirm test device access before Phase 4 begins.
- **Bulk download format decision (ZIP vs presigned URL list):** Research documents both options as acceptable for a 4-user tool. Phase 4 spec must lock this decision. ZIP is recommended for compliance reporting (self-contained archive) but presigned URL list is a valid lower-complexity fallback.
- **`photo_key` column removal timing:** Phase 1 keeps `photo_key` for legacy fallback. The follow-up migration to drop `photo_key` and `resolution_photo_key` is deferred. Schedule this as migration 0044 for v1.3 after confirming all records in production use the new columns.

## Sources

### Primary (HIGH confidence)
- Codebase at migration 0042 — `migrations/`, `functions/api/`, `src/` — stack, architecture, all integration points
- [MDN `<input type="date">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date) — iOS 16 `min`/`max` not enforced by Mobile Safari
- [yet-another-react-lightbox GitHub](https://github.com/igordanchenko/yet-another-react-lightbox) — React 18 peer dep, touch/swipe, no dependencies, maintenance status
- [fflate GitHub](https://github.com/101arrowz/fflate) — `zipSync` browser safety, synchronous, no Web Workers needed
- [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/) — 128 MB memory per isolate, verified 2026-04-05
- [WebKit bug 167341](https://bugs.webkit.org/show_bug.cgi?id=167341) — `<a download>` not honored on iOS Safari, open since 2017

### Secondary (MEDIUM confidence)
- [GoAudits mobile inspection app patterns 2026](https://goaudits.com/blog/best-mobile-inspection-apps/) — multi-photo and export as table stakes in inspection apps
- [iOS PWA limitations guide 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) — download, camera, blob URL behavior in PWA context
- [Apple Developer Forums — iOS blob URL issues 18.2+](https://developer.apple.com/forums/thread/751063) — `createObjectURL` behavior change
- [w00kie.com — ZIP R2 objects on Cloudflare Workers](https://w00kie.com/2024/07/13/zip-r2-objects-in-memory-with-cloudflare-workers/) — confirms zip.js workaround requirement; validates client-side for small payloads
- [FieldEx facility management 2025](https://www.fieldex.com/en/blog/facility-management-software) — bulk export as standard compliance reporting pattern

### Tertiary (LOW confidence)
- [Map UI Patterns — Floor Selector](https://mapuipatterns.com/floor-selector/) — location hierarchy UX patterns (directional only)
- [Mobbin — Date Picker UI](https://mobbin.com/glossary/date-picker) — date range UX mobile best practices (directional only)

---
*Research completed: 2026-04-05*
*Ready for roadmap: yes*

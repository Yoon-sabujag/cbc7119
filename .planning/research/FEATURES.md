# Feature Research

**Domain:** Fire Safety / Facility Management PWA — v1.2 UX improvements
**Researched:** 2026-04-05
**Context:** v1.1 shipped. This document covers the 4 new v1.2 features.
**Confidence:** HIGH (codebase analysis) / MEDIUM (industry UX pattern research)

---

## Scope

Four features added to an existing app (v1.1 in production). All research is scoped to
*how these features work in inspection/facility-management apps* and how they map onto the
existing CHA Bio Safety codebase.

Existing baseline relevant to each feature:

- **Schedule:** `SchedulePage.tsx` AddModal — single `date` input, saves one `schedule_items`
  row per API call. No date range concept.
- **Finding BottomSheet:** `LegalFindingsPage.tsx` `FindingBottomSheet` — free-text `description`
  textarea + free-text `location` single input. No checklist/item-selection concept.
- **Photo upload:** `usePhotoUpload` hook + `PhotoButton` — single R2 upload per finding/
  resolution, stored as one `photo_key` / `resolution_photo_key` TEXT column on `legal_findings`.
- **Download:** No download feature exists. Admin can open a report PDF in a new tab; no
  packaged download of finding content or photos.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Standard behaviors users assume based on how equivalent apps (SafetyCulture/iAuditor, GoAudits,
FieldEz) behave. Missing them makes the feature feel half-built.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Date range input (start/end) for multi-day inspections | Legal inspections run 4–5 consecutive days. Current single-date model requires 4–5 separate form submissions. Users feel this immediately. | MEDIUM | Loop INSERT in API handler; one `schedule_items` row per day in range. Frontend-only change except for API accepting `endDate`. |
| BottomSheet: item selection with direct-input fallback | Inspection apps pre-populate findings from a known checklist (common deficiency types). Free text is the escape hatch, not the default. Eliminates typo variance across repeated findings. | MEDIUM | Static FINDING_ITEMS constant (~20–30 items). Last option is always "직접 입력" (free text). Pre-fills description field. |
| BottomSheet: structured location (구역 → 층 → 상세) | Location is the most searched field in compliance reports. Free text "3층 복도" is unsearchable across rounds. Structured fields (zone, floor, detail) enable downstream filtering. | MEDIUM | Reuses existing `BuildingZone` and `Floor` types. Requires DB migration: 3 new columns (`location_zone`, `location_floor`, `location_detail`) on `legal_findings`. Display string concatenated for list view. |
| Multi-photo upload — up to 5 photos per finding/resolution | Single-photo findings are atypical in inspection work. Before/during/after shots are standard. Users currently cram multiple subjects into one photo as a workaround. | HIGH | Requires DB migration: replace `photo_key`/`resolution_photo_key` columns with child table `legal_finding_photos`. R2 upload API unchanged — called N times. |
| Thumbnail grid with tap-to-enlarge lightbox | Any multi-photo UI on mobile requires thumbnail grid (tap to select) and fullscreen overlay (tap to zoom/swipe). Without it, multiple photos are unusable in a small viewport. | MEDIUM | CSS grid 3-col, 80px cells. Lightbox: position:fixed overlay + swipe or arrow nav. No external library needed. |
| Per-item download: finding content + photos | Admin produces paper reports for legal compliance records. Minimum: finding text (description, location, resolution memo) + photos as a ZIP or PDF package, downloadable per finding. | HIGH | Client-side: fetch photo blobs via `/api/uploads/`, zip with `fflate` (already in project) + jsPDF (already in project) for text page. No new infra. |
| Bulk download: all findings for one inspection round | Admin review requires assembling all findings for a round into a single package. Standard pattern in facility apps: "Export all" on the findings list. | HIGH | Single API endpoint `GET /api/legal/:id/export` streaming a ZIP of all finding records + photos fetched from R2. Cloudflare Workers can stream ZIP using `fflate` server-side. |

### Differentiators (Competitive Advantage)

Tailored to this team's specific workflow and existing infrastructure.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Smart date range: inserts one `schedule_items` row per day | Rather than storing a range record, generates N individual entries so the date-centric calendar view works without modification. | LOW | Loop `start → end` in API handler. No calendar changes. Natural fit with existing monthly view. |
| Structured location enables cross-round filter by zone/floor | After location fields are stored structurally, findings can be filtered across all rounds by building zone or floor — a capability no current inspection record supports. | LOW (after DB migration exists) | Add optional query params to `GET /api/legal/:id/findings?zone=research&floor=3F`. Low-effort once structure is in place. |
| Download filenames preserve context | ZIP entries named `[finding_index]_[before|after]_[date].[ext]` rather than random R2 keys. Archive is self-documenting for inspectors without extra storage cost. | LOW | String construction at ZIP creation time only. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Native calendar range-highlight picker | Polished iOS/Android look-and-feel | Requires a date-picker library adding bundle weight and maintenance. ROI is too low for a 4-person internal tool — the interaction happens once per inspection cycle. | Two sequential `<input type="date">` fields ("시작일" / "종료일") with inline validation (`end >= start`). Accessible on all target platforms, zero dependencies. |
| Drag-to-reorder photos | Useful for explicit before/after ordering | Drag-and-drop on mobile Safari/Chrome is brittle. Photos are taken once per incident; reordering is a rare edge case. | Upload order determines sort order. Up/down arrow buttons are a simpler fallback if needed later. |
| Real-time collaborative editing (multiple users same finding) | Team of 4 may work in parallel | D1 eventual consistency; optimistic locking is complex. 4 users editing the same finding simultaneously is extremely rare in practice. | Last-write-wins is acceptable. Toast error on HTTP conflict is sufficient. |
| Offline photo queue (upload when reconnected) | Field may have spotty connectivity | PROJECT.md explicitly excludes offline: "현재 네트워크 환경 충분". Service worker upload queue adds testing and debugging complexity with no current need. | Show clear error toast on upload failure; user retries manually. |
| AI auto-fill for finding descriptions | Reduces typing | PROJECT.md marks AI report generation as a future separate milestone. Adds external API cost and dependency. | Predefined item selection list achieves 80% of typing reduction with zero external dependencies. |

---

## Feature Dependencies

```
[Date range input]
    └──requires──> [API handler accepts endDate param]
                       └──requires──> [loop INSERT per day in range]
    (independent — no DB schema change)

[Structured BottomSheet]
    └──requires──> [DB migration: location_zone, location_floor, location_detail columns on legal_findings]
    └──requires──> [FINDING_ITEMS static constant]
    (independent of multi-photo)

[Multi-photo upload + gallery]
    └──requires──> [DB migration: legal_finding_photos child table]
                       └──requires──> [migrate existing photo_key / resolution_photo_key data]
    └──requires──> [Thumbnail grid component]
    └──requires──> [Lightbox fullscreen component]
    └──enhances──> [Per-item download — more photos = more value in the archive]

[Per-item download]
    └──requires──> [Multi-photo (ideally) — without it, archive has 1 photo max]
    └──requires──> [fflate already in project via Excel util]
    └──requires──> [jsPDF already installed]

[Bulk download]
    └──requires──> [Per-item download logic — bulk = N × per-item + outer ZIP]
    └──requires──> [New Cloudflare Pages Function: GET /api/legal/:id/export]
    └──enhances──> [Multi-photo — more photos increases bulk export value]
```

### Dependency Notes

- **Multi-photo requires a breaking DB migration.** The current `photo_key` column stores one R2
  key. A new `legal_finding_photos` child table replaces it. Existing rows must be backfill-
  migrated in the same migration step. This must land before multi-photo UI work.
- **Date range is fully independent.** No DB schema change; only AddModal UI and API handler
  change. Ship first.
- **Structured BottomSheet is independent of multi-photo** but must land with its own DB
  migration for the new columns. Both the BottomSheet UI and migration must deploy together.
- **Download depends on multi-photo for full value.** Per-item download with single photo works
  but is incomplete. Prefer shipping download in the same phase as multi-photo, or explicitly
  document the single-photo limitation in an earlier phase release.

---

## MVP Definition

### Launch With (v1.2)

All four features are confirmed scope. Priority order based on user impact and implementation
independence:

- [ ] **Date range input** — Independent, low risk, directly addresses daily pain of manual
  multi-day entry. Ship first.
- [ ] **Structured BottomSheet** — Independent of multi-photo. DB migration is small (3 columns).
  Ship second; unblocks location-based filtering later.
- [ ] **Multi-photo upload + gallery** — Requires DB migration (child table). Most complex but
  highest daily UX value. Ship third.
- [ ] **Finding/resolution download** — Per-item and bulk. Full value requires multi-photo to be
  in place. Ship fourth.

### Add After Validation (v1.x)

- [ ] **Filter findings by zone/floor** — Enabled by structured location columns. Add when admin
  reports need cross-round location analysis.
- [ ] **Photo annotations (draw/markup on photos)** — After multi-photo is stable; only if users
  request explicit markup capability.

### Future Consideration (v2+)

- [ ] **Offline photo queue** — Only if connectivity becomes an issue in the field.
- [ ] **AI auto-fill for finding descriptions** — Separate milestone per PROJECT.md.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Date range input | HIGH — eliminates 4× manual entry per inspection cycle | LOW | P1 |
| Structured BottomSheet (item selection + location) | HIGH — reduces typos, enables cross-round location reporting | MEDIUM | P1 |
| Multi-photo upload + gallery | HIGH — single photo is a daily felt limitation | HIGH | P1 |
| Per-item download (finding + photos) | MEDIUM — admin report prep, currently done manually | HIGH | P2 |
| Bulk download (all findings for a round) | MEDIUM — convenience over per-item | HIGH | P2 |

Per-item and bulk download are P2 only because their value compounds after multi-photo is in
place and they require the most backend work (server-side ZIP streaming).

---

## Implementation Notes by Feature

### 1. Date Range Input

**Where:** `SchedulePage.tsx` AddModal, only for `category === 'fire'` (법적점검).
**UI change:** Replace single `<input type="date">` with two inputs: "시작일" / "종료일".
Show total day count inline ("3일 일정이 추가됩니다").
**Validation:** `endDate >= startDate`; max range 14 days to prevent accidental bulk insert.
**API change:** `POST /api/schedule` body accepts optional `endDate`. If present, handler loops
and inserts one `schedule_items` row per date with the same title/category/memo.
**No DB schema change.**

### 2. Structured BottomSheet

**Where:** `LegalFindingsPage.tsx` `FindingBottomSheet`.
**New fields order:**
1. `itemType` — scrollable list or segmented picker; last option is "직접 입력" (free text)
2. `description` — textarea, auto-filled by item selection, editable
3. `locationZone` — `BuildingZone` select (사무동 / 연구동 / 공용)
4. `locationFloor` — `Floor` select (B5–8F; same set as CheckPoint floor)
5. `locationDetail` — short text input, e.g. "서버실 앞 복도"
**DB migration:** Add `item_type TEXT`, `location_zone TEXT`, `location_floor TEXT`,
`location_detail TEXT` to `legal_findings`. Keep `location TEXT` as a computed display string
(`zone + floor + detail`) for backward-compatible list views.
**FINDING_ITEMS constant:** Define in a shared file. Seed with ~25 common items drawn from
소방시설 자체점검 체크리스트 standard categories (e.g. "소화기 압력 저하", "방화문 미폐쇄",
"유도등 점등 불량", "소화전 앵글밸브 누수").

### 3. Multi-Photo Upload + Gallery

**DB migration:** New `legal_finding_photos` table:
`(id TEXT PK, finding_id TEXT FK, role TEXT CHECK('before'|'after'), r2_key TEXT NOT NULL,
sort_order INT DEFAULT 0, uploaded_by TEXT, uploaded_at TEXT)`.
Backfill: `INSERT INTO legal_finding_photos SELECT ... FROM legal_findings WHERE photo_key IS NOT NULL`
for `role='before'` rows; same for `resolution_photo_key` with `role='after'`.
Drop deprecated columns after migration is verified stable.
**API changes:**
- `GET /api/legal/:id/findings/:fid` — returns `photos: Photo[]` alongside existing fields.
- `POST /api/legal/:id/findings/:fid/photos` — uploads one photo (R2 via existing upload
  pattern), inserts row in `legal_finding_photos`, returns new photo row. Max 5 per role.
- `DELETE /api/legal/:id/findings/:fid/photos/:photoId` — soft-delete or hard-delete (photo
  data is evidentiary; prefer soft-delete with `deleted_at`).
**Frontend (LegalFindingDetailPage.tsx):**
Replace single `<img>` with thumbnail grid (CSS grid 3-col, ~80px per cell). Tap thumbnail →
fullscreen overlay with swipe or arrow navigation. Add-photo button appended to grid (disabled
at 5). Delete badge (×) on each thumbnail, admin or own upload only.

### 4. Download

**Per-item download (client-side):**
1. Fetch all photo blobs for the finding via `/api/uploads/{key}` using `fetch()`.
2. Render a one-page PDF with jsPDF: finding metadata (description, location, dates, staff
   names) + thumbnail images.
3. Optionally wrap PDF + raw images in a ZIP using `fflate` (already in project via Excel util).
4. Trigger `<a download="finding-{id}.zip">` with a blob URL.
No new API endpoint needed.

**Bulk download (server-side):**
New Cloudflare Pages Function: `GET /api/legal/:id/export`.
Handler: query all findings for the round → for each finding, fetch photo blobs from R2
(`env.STORAGE.get(key)`) → build a ZIP using `fflate` `Zip` streaming API → return
`new Response(zipStream, { headers: { 'Content-Type': 'application/zip', 'Content-Disposition':
'attachment; filename="legal-round-{id}.zip"' }})`.
Client: `<a href="/api/legal/:id/export">` or `fetch()` → blob URL → `<a download>` trigger.
Named entries: `[N]_finding/description.txt`, `[N]_before_[date].jpg`,
`[N]_after_[date].jpg`.

---

## Competitor Feature Analysis

| Feature | SafetyCulture (iAuditor) | GoAudits | Our Approach |
|---------|--------------------------|----------|--------------|
| Date range for inspection | Single date per audit; multi-day = separate linked audits | Inspection schedule supports date ranges with repeat | Loop-insert one `schedule_items` row per day; calendar view unchanged |
| Finding item selection | Questions from predefined template; findings tied to question | Free text with category picker | Static FINDING_ITEMS list + "직접 입력" fallback |
| Structured location | Zone/area/location hierarchy configurable per template | GPS coordinate + free-text area | Fixed 3-level: BuildingZone → Floor type → detail free text |
| Multi-photo per finding | Up to 10 photos; inline in PDF report | Up to 10 photos; gallery view | Up to 5 photos; thumbnail grid + lightbox |
| Download/export | PDF report auto-generated with all photos embedded | PDF + CSV; per-finding and bulk | ZIP with text + photos (per-item client-side; bulk server-side) |

---

## Sources

- Codebase analysis (HIGH confidence): `LegalFindingsPage.tsx`, `LegalFindingDetailPage.tsx`,
  `SchedulePage.tsx`, `src/types/index.ts`, `functions/api/uploads/index.ts`
- [GoAudits — Best Mobile Inspection Apps 2026](https://goaudits.com/blog/best-mobile-inspection-apps/) — multi-photo and export patterns (MEDIUM)
- [Mobbin — Date Picker UI Design](https://mobbin.com/glossary/date-picker) — date range UX (MEDIUM)
- [Map UI Patterns — Floor Selector](https://mapuipatterns.com/floor-selector/) — location hierarchy (MEDIUM)
- [FieldEx — Facility Management Software 2025](https://www.fieldex.com/en/blog/facility-management-software) — bulk export as table stakes (MEDIUM)
- [Monday.com — Facilities Management Software 2026](https://monday.com/blog/service/facilities-management-software/) — reporting and export patterns (MEDIUM)
- [Eleken — Time Picker UX 2025](https://www.eleken.co/blog-posts/time-picker-ux) — mobile date input best practices (MEDIUM)

---

## Appendix: v1.1 Feature Research (Preserved)

*The sections below are the original v1.1 research from 2026-03-31. Kept for historical context.*

### What Was Built in v1.1

| Feature | Status |
|---------|--------|
| BottomNav/SideMenu 재편 | Done |
| 조치 관리 (미조치 목록, 등록, 상태 전환, 필터) | Done |
| 법적 점검 (지적사항 조치 추적, 서류 R2) | Done |
| 식사 기록 + 메뉴표 PDF 관리 + 통계 | Done |
| 보수교육 관리 (등록, 이수, 인증서, D-day) | Done |
| 관리자 설정 (직원 CRUD, 개소 관리, 메뉴 편집) | Done |
| 점검자 이름 동적 로딩 + 연속 달성일 | Done |
| 승강기 검사 인증서 + 수리 통합 + 검사 도래 알림 | Done |

---
*Feature research for: CHA Bio Safety v1.2 UX improvements*
*Researched: 2026-04-05*

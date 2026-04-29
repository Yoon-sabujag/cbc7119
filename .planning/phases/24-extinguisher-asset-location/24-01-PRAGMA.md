# Phase 24 Plan 01 — Pre-Migration PRAGMA Capture

**Captured at:** 2026-04-30 04:02 KST
**Database:** cha-bio-db (Cloudflare D1, --remote)
**Captured by:** Claude (auto mode, read-only PRAGMA queries)

## extinguishers table

```
PRAGMA table_info(extinguishers);
```

| cid | name              | type    | notnull | dflt_value          | pk |
|-----|-------------------|---------|---------|---------------------|----|
| 0   | id                | INTEGER | 0       | null                | 1  |
| 1   | check_point_id    | TEXT    | 1       | null                | 0  |
| 2   | seq_no            | INTEGER | 0       | null                | 0  |
| 3   | zone              | TEXT    | 0       | null                | 0  |
| 4   | floor             | TEXT    | 0       | null                | 0  |
| 5   | mgmt_no           | TEXT    | 0       | null                | 0  |
| 6   | location          | TEXT    | 0       | null                | 0  |
| 7   | type              | TEXT    | 1       | null                | 0  |
| 8   | approval_no       | TEXT    | 0       | null                | 0  |
| 9   | manufactured_at   | TEXT    | 0       | null                | 0  |
| 10  | manufacturer      | TEXT    | 0       | null                | 0  |
| 11  | prefix_code       | TEXT    | 0       | null                | 0  |
| 12  | seal_no           | TEXT    | 0       | null                | 0  |
| 13  | serial_no         | TEXT    | 0       | null                | 0  |
| 14  | note              | TEXT    | 0       | null                | 0  |
| 15  | created_at        | TEXT    | 0       | datetime('now')     | 0  |
| 16  | updated_at        | TEXT    | 0       | datetime('now')     | 0  |

→ **17 columns. `status` column is ABSENT.**

## check_records table

```
PRAGMA table_info(check_records);
```

Columns (18 total, in cid order):
- id, session_id, checkpoint_id, staff_id, result, memo, photo_key, checked_at, created_at,
- status, resolution_memo, resolved_at, resolved_by, resolution_photo_key, materials_used,
- guide_light_type, floor_plan_marker_id, location_detail

→ **18 columns. `extinguisher_id` column is ABSENT.**
→ Note: `status` column already exists on check_records (different domain — bad/caution resolution flow). Unrelated to extinguishers.status.

## Row counts

```
SELECT COUNT(*) AS total FROM extinguishers;
-- total: 448

SELECT COUNT(*) AS total, SUM(CASE WHEN check_point_id IS NULL THEN 1 ELSE 0 END) AS unmapped
FROM extinguishers;
-- total: 448, unmapped: 0
```

- extinguishers total: **448**
- extinguishers unmapped (check_point_id IS NULL): **0**
- All 448 rows have a check_point_id mapping → 1:1 backfill is safe (no NULL ext_id risk).

## Decision

- [x] `extinguishers.status` 컬럼 부재 확인 → **ADD COLUMN 진행** (Task 2)
- [x] `check_records.extinguisher_id` 컬럼 부재 확인 → **ADD COLUMN 진행** (Task 2)
- [x] 1:1 매핑 무결성 확인 (unmapped=0) → 백필 정책 A 안전하게 적용 가능
- [x] 3개 신규 인덱스 (idx_extinguishers_status, idx_extinguishers_cp_active, idx_check_records_ext) — 기존 인덱스와 충돌 없음 (CREATE INDEX IF NOT EXISTS로 작성)

→ Migration 0079 SQL을 PLAN.md의 기본 형태 그대로 작성 (SKIPPED 주석 분기 불필요).

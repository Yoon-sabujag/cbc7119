-- Migration 0079: 소화기 자산-위치 분리
--
-- 1) extinguishers.status — 'active' / '폐기' (default 'active')
-- 2) check_records.extinguisher_id — 점검 시점 자산 스냅샷 (nullable)
-- 3) 인덱스 보강 (status 필터, cp+status JOIN, ext_id 역참조)
-- 4) 백필 — 정책 A: 소화기 카테고리(checkpoint_id LIKE 'CP-FE-%') 점검 기록에
--    현재 매핑된 ext.id 를 추정 채움 (1:1 시점이라 안전)
--
-- 절대 금지: check_records 는 어떤 분기에서도 DELETE 하지 않는다 (점검 기록 보존 원칙).
-- 본 마이그레이션은 ALTER + UPDATE 만 — DROP/DELETE 없음.
--
-- Pre-migration PRAGMA capture: see 24-01-PRAGMA.md
--   - extinguishers.status     → ABSENT (ADD COLUMN 진행)
--   - check_records.extinguisher_id → ABSENT (ADD COLUMN 진행)
--   - extinguishers total: 448 / unmapped: 0 → 1:1 백필 안전

-- ── 1) extinguishers.status ─────────────────────────────
ALTER TABLE extinguishers ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- ── 2) check_records.extinguisher_id ────────────────────
ALTER TABLE check_records ADD COLUMN extinguisher_id INTEGER;

-- ── 3) 인덱스 ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_extinguishers_status     ON extinguishers(status);
CREATE INDEX IF NOT EXISTS idx_extinguishers_cp_active  ON extinguishers(check_point_id, status);
CREATE INDEX IF NOT EXISTS idx_check_records_ext        ON check_records(extinguisher_id);

-- ── 4) 백필 (정책 A — 현재 매핑된 ext_id 추정) ───────────
-- 1:1 매핑 시점이므로 cp_id 당 active ext.id 가 unique → 안전.
-- 소화기 카테고리만 채움 (checkpoint_id LIKE 'CP-FE-%').
UPDATE check_records
SET extinguisher_id = (
  SELECT e.id FROM extinguishers e
  WHERE e.check_point_id = check_records.checkpoint_id
  LIMIT 1
)
WHERE extinguisher_id IS NULL
  AND checkpoint_id LIKE 'CP-FE-%';

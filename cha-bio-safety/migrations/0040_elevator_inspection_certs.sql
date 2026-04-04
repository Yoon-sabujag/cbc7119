-- 0040_elevator_inspection_certs.sql
-- Phase 11: Elevator Inspection Certs — schema changes

-- 1. Add inspect_type to elevator_inspections
--    정기검사(regular) / 수시검사(special) / 정밀안전검사(detailed)
--    Kept separate from existing type='annual'/'monthly'
ALTER TABLE elevator_inspections
  ADD COLUMN inspect_type TEXT DEFAULT 'regular' CHECK(inspect_type IN ('regular','special','detailed'));

-- 2. Add result column to elevator_inspections
--    합격(pass) / 조건부합격(conditional) / 불합격(fail)
ALTER TABLE elevator_inspections
  ADD COLUMN result TEXT CHECK(result IN ('pass','conditional','fail'));

-- 3. Add install_year to elevators for 25-year rule (6-month cycle)
--    NULL means rule not applied until populated
ALTER TABLE elevators
  ADD COLUMN install_year INTEGER;

-- 4. Create elevator_inspection_findings table (mirrors legal_findings)
CREATE TABLE IF NOT EXISTS elevator_inspection_findings (
  id                   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  inspection_id        TEXT NOT NULL REFERENCES elevator_inspections(id),
  description          TEXT NOT NULL,
  location             TEXT,
  photo_key            TEXT,
  resolution_memo      TEXT,
  resolution_photo_key TEXT,
  status               TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
  resolved_at          TEXT,
  resolved_by          TEXT REFERENCES staff(id),
  created_by           TEXT NOT NULL REFERENCES staff(id),
  created_at           TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);

-- 5. Index for efficient lookup by inspection + status
CREATE INDEX IF NOT EXISTS idx_elev_findings_inspection
  ON elevator_inspection_findings(inspection_id, status);

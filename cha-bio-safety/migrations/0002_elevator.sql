-- migrations/0002_elevator.sql
-- 승강기 점검 기록 및 고장 기록 테이블 추가

-- ─── 승강기 월 점검 기록 ──────────────────────────────
CREATE TABLE IF NOT EXISTS elevator_inspections (
  id            TEXT PRIMARY KEY,
  elevator_id   TEXT NOT NULL REFERENCES elevators(id),
  inspector_id  TEXT NOT NULL REFERENCES staff(id),
  inspect_date  TEXT NOT NULL,   -- YYYY-MM-DD
  type          TEXT NOT NULL DEFAULT 'monthly' CHECK(type IN ('monthly','annual')),
  brake         TEXT CHECK(brake IN ('normal','bad')),
  door          TEXT CHECK(door IN ('normal','bad')),
  safety_device TEXT CHECK(safety_device IN ('normal','bad')),
  lighting      TEXT CHECK(lighting IN ('normal','bad')),
  emergency_call TEXT CHECK(emergency_call IN ('normal','bad')),
  overall       TEXT NOT NULL CHECK(overall IN ('normal','caution','bad')),
  memo          TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── 승강기 고장 기록 ─────────────────────────────────
CREATE TABLE IF NOT EXISTS elevator_faults (
  id             TEXT PRIMARY KEY,
  elevator_id    TEXT NOT NULL REFERENCES elevators(id),
  reported_by    TEXT NOT NULL REFERENCES staff(id),
  fault_at       TEXT NOT NULL,   -- ISO 8601
  symptoms       TEXT NOT NULL,
  repair_company TEXT,
  repaired_at    TEXT,
  repair_detail  TEXT,
  is_resolved    INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── 인덱스 ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_elevator_inspections_elevator ON elevator_inspections(elevator_id, inspect_date);
CREATE INDEX IF NOT EXISTS idx_elevator_faults_elevator      ON elevator_faults(elevator_id, fault_at);
CREATE INDEX IF NOT EXISTS idx_elevator_faults_unresolved    ON elevator_faults(is_resolved);

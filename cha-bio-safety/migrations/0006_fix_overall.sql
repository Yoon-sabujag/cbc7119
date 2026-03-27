-- 0006_fix_overall.sql
-- elevator_inspections 재생성 (CHECK 제약 완화, pass/conditional/fail 허용)

CREATE TABLE IF NOT EXISTS _ei_bak AS SELECT * FROM elevator_inspections;
DROP TABLE IF EXISTS elevator_inspections;

CREATE TABLE IF NOT EXISTS elevator_inspections (
  id             TEXT PRIMARY KEY,
  elevator_id    TEXT NOT NULL REFERENCES elevators(id),
  inspector_id   TEXT NOT NULL REFERENCES staff(id),
  inspect_date   TEXT NOT NULL,
  type           TEXT NOT NULL CHECK(type IN ('monthly','annual')),
  brake          TEXT,
  door           TEXT,
  safety_device  TEXT,
  lighting       TEXT,
  emergency_call TEXT,
  overall        TEXT NOT NULL DEFAULT 'normal',
  action_needed  TEXT,
  memo           TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO elevator_inspections
  SELECT id, elevator_id, inspector_id, inspect_date, type,
         brake, door, safety_device, lighting, emergency_call,
         overall, action_needed, memo, created_at
  FROM _ei_bak;

DROP TABLE IF EXISTS _ei_bak;

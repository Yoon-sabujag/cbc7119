-- 0041_elevator_repairs.sql
-- Elevator repair records with multi-photo support

CREATE TABLE IF NOT EXISTS elevator_repairs (
  id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  elevator_id           TEXT NOT NULL REFERENCES elevators(id),
  repair_date           TEXT NOT NULL,
  repair_target         TEXT NOT NULL CHECK(repair_target IN ('car','hall','machine_room','pit','escalator')),
  hall_floor            TEXT,
  repair_item           TEXT NOT NULL,
  repair_detail         TEXT,
  repair_company        TEXT,
  source                TEXT NOT NULL DEFAULT 'standalone' CHECK(source IN ('standalone','fault','inspect','annual')),
  source_id             TEXT,
  parts_arrival_photos  TEXT,
  damaged_parts_photos  TEXT,
  during_repair_photos  TEXT,
  completed_photos      TEXT,
  created_by            TEXT NOT NULL REFERENCES staff(id),
  created_at            TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);

CREATE INDEX idx_elevator_repairs_elevator ON elevator_repairs(elevator_id, repair_date DESC);
CREATE INDEX idx_elevator_repairs_target ON elevator_repairs(elevator_id, repair_target);

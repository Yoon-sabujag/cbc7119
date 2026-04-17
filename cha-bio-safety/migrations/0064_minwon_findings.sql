-- 민원24 검사 지적사항 (조건부합격/불합격 시 기록)
CREATE TABLE IF NOT EXISTS elevator_minwon_findings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  elevator_id TEXT NOT NULL REFERENCES elevators(id),
  inspect_year INTEGER NOT NULL,
  inspect_order INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  repair_id TEXT REFERENCES elevator_repairs(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
  created_by TEXT NOT NULL REFERENCES staff(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now','+9 hours')),
  resolved_at TEXT,
  UNIQUE(elevator_id, inspect_year, inspect_order, description)
);

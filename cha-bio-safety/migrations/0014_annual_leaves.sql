CREATE TABLE IF NOT EXISTS annual_leaves (
  id         TEXT PRIMARY KEY,
  staff_id   TEXT NOT NULL REFERENCES staff(id),
  date       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK(type IN ('full','half')),
  year       INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(staff_id, date)
);
CREATE INDEX IF NOT EXISTS idx_annual_leaves_staff_year ON annual_leaves(staff_id, year);
CREATE INDEX IF NOT EXISTS idx_annual_leaves_date ON annual_leaves(date);

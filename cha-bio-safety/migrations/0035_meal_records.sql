CREATE TABLE meal_records (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  staff_id     TEXT NOT NULL REFERENCES staff(id),
  date         TEXT NOT NULL,
  skipped_meals INTEGER NOT NULL CHECK(skipped_meals IN (0, 1, 2)) DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(staff_id, date)
);
CREATE INDEX idx_meal_records_staff_month ON meal_records(staff_id, date);

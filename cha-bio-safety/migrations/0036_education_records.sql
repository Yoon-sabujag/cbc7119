CREATE TABLE education_records (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  staff_id       TEXT NOT NULL REFERENCES staff(id),
  education_type TEXT NOT NULL CHECK(education_type IN ('initial', 'refresher')),
  completed_at   TEXT NOT NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_education_records_staff ON education_records(staff_id, completed_at DESC);

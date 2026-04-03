-- migrations/0038_legal_inspections.sql

CREATE TABLE IF NOT EXISTS legal_inspections (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  inspection_type  TEXT NOT NULL CHECK(inspection_type IN ('comprehensive','functional')),
  inspected_at     TEXT NOT NULL,
  agency           TEXT NOT NULL,
  result           TEXT NOT NULL DEFAULT 'pass'
                   CHECK(result IN ('pass','fail','conditional')),
  report_file_key  TEXT,
  memo             TEXT,
  created_by       TEXT NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);

CREATE TABLE IF NOT EXISTS legal_findings (
  id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  inspection_id         TEXT NOT NULL REFERENCES legal_inspections(id),
  description           TEXT NOT NULL,
  location              TEXT,
  photo_key             TEXT,
  resolution_memo       TEXT,
  resolution_photo_key  TEXT,
  status                TEXT NOT NULL DEFAULT 'open'
                        CHECK(status IN ('open','resolved')),
  resolved_at           TEXT,
  resolved_by           TEXT,
  created_by            TEXT NOT NULL,
  created_at            TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);

CREATE INDEX IF NOT EXISTS idx_legal_findings_inspection_id
  ON legal_findings(inspection_id);
CREATE INDEX IF NOT EXISTS idx_legal_findings_status
  ON legal_findings(status);

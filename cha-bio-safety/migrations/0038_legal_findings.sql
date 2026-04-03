-- 0038_legal_findings.sql
-- Phase 10: Legal Inspection — schedule_items ALTER + legal_findings table

-- 1. Add result and report columns to schedule_items (per D-06a, D-19)
ALTER TABLE schedule_items ADD COLUMN result TEXT CHECK(result IN ('pass','fail','conditional'));
ALTER TABLE schedule_items ADD COLUMN report_file_key TEXT;

-- 2. Create legal_findings table (per D-18, D-20)
CREATE TABLE IF NOT EXISTS legal_findings (
  id                   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  schedule_item_id     TEXT NOT NULL REFERENCES schedule_items(id),
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

CREATE INDEX idx_legal_findings_schedule_item ON legal_findings(schedule_item_id, status);

-- Phase 20: documents table — metadata for R2-stored 소방계획서 / 소방훈련자료
-- D-01..D-05: plan|drill CHECK, soft-delete reserved, covering index

CREATE TABLE IF NOT EXISTS documents (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  type         TEXT NOT NULL CHECK(type IN ('plan','drill')),
  year         INTEGER NOT NULL,
  title        TEXT NOT NULL,
  filename     TEXT NOT NULL,
  r2_key       TEXT NOT NULL UNIQUE,
  size         INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  uploaded_by  INTEGER NOT NULL REFERENCES staff(id),
  uploaded_at  TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at   TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_type_year_uploaded
  ON documents(type, year DESC, uploaded_at DESC);

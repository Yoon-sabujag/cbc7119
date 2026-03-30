-- annual_leaves type CHECK 제약 확장: full, half_am, half_pm, official_full, official_half_am, official_half_pm
-- SQLite는 CHECK 수정 불가 → 테이블 재생성
CREATE TABLE annual_leaves_new (
  id         TEXT PRIMARY KEY,
  staff_id   TEXT NOT NULL REFERENCES staff(id),
  date       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK(type IN ('full','half','half_am','half_pm','official_full','official_half_am','official_half_pm')),
  year       INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(staff_id, date)
);

INSERT INTO annual_leaves_new SELECT * FROM annual_leaves;

DROP TABLE annual_leaves;

ALTER TABLE annual_leaves_new RENAME TO annual_leaves;

-- annual_leaves type CHECK 제약 확장: 경조휴가, 병가, 보건휴가, 기타특별휴가 추가
-- SQLite는 CHECK 수정 불가 → 테이블 재생성
CREATE TABLE annual_leaves_new (
  id         TEXT PRIMARY KEY,
  staff_id   TEXT NOT NULL REFERENCES staff(id),
  date       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK(type IN ('full','half','half_am','half_pm','official_full','official_half_am','official_half_pm','condolence','sick_work','sick_personal','health','other_special')),
  year       INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(staff_id, date)
);

INSERT INTO annual_leaves_new SELECT * FROM annual_leaves;

DROP TABLE annual_leaves;

ALTER TABLE annual_leaves_new RENAME TO annual_leaves;

CREATE INDEX IF NOT EXISTS idx_annual_leaves_staff_year ON annual_leaves(staff_id, year);
CREATE INDEX IF NOT EXISTS idx_annual_leaves_date ON annual_leaves(date);

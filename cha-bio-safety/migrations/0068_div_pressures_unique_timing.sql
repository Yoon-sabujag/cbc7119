-- ─── div_pressures: UNIQUE 제약에 timing 포함 ───
-- 문제: 기존 UNIQUE(year, month, location_no) 제약 때문에 같은 달의 월초(early) 점검 후
-- 월말(late) 점검 INSERT가 SQLITE_CONSTRAINT_UNIQUE로 거부됨.
-- 0049_div_timing.sql 에서 timing 컬럼만 ADD 하고 UNIQUE 제약은 수정하지 않아 발생.
--
-- SQLite는 UNIQUE 제약 변경 불가 → 테이블 재생성.
-- 동시에 2026-04-11(commit f8452f5) 이전에 저장된 이전 포맷 id
--   DIV-{year}-{month}-{location_no}
-- 를 신규 포맷
--   DIV-{year}-{month}-{timing}-{location_no}
-- 으로 정규화하여 이후 재저장 시 ON CONFLICT(id)가 정상 동작하도록 맞춤.

CREATE TABLE div_pressures_new (
  id           TEXT PRIMARY KEY,
  year         INTEGER NOT NULL,
  month        INTEGER NOT NULL,
  location_no  TEXT NOT NULL,
  floor        INTEGER NOT NULL,
  position     INTEGER NOT NULL,
  pressure_1   REAL,
  pressure_2   REAL,
  pressure_set REAL,
  inspector    TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  day          INTEGER,
  result       TEXT DEFAULT 'normal',
  drain        TEXT DEFAULT 'none',
  oil          TEXT DEFAULT 'sufficient',
  memo         TEXT,
  photo_key    TEXT,
  timing       TEXT DEFAULT 'early',
  UNIQUE(year, month, timing, location_no)
);

-- 기존 데이터 이관 + id 정규화
-- 기존 id 포맷: DIV-{year}-{month}-{location_no}  (timing 세그먼트 없음)
-- 신규 id 포맷: DIV-{year}-{month}-{timing}-{location_no}
-- timing 컬럼에 값이 채워진(=0049 이후 저장되었거나 default 'early' 적용된) 레코드를
-- 기준으로 id를 재생성. 이미 신규 포맷(id에 '-early-' / '-late-' 포함)이면 그대로 둠.
INSERT INTO div_pressures_new (
  id, year, month, location_no, floor, position,
  pressure_1, pressure_2, pressure_set, inspector,
  created_at, day, result, drain, oil, memo, photo_key, timing
)
SELECT
  CASE
    WHEN id LIKE 'DIV-%-early-%' OR id LIKE 'DIV-%-late-%'
      THEN id
    ELSE 'DIV-' || year
         || '-' || substr('00' || month, -2, 2)
         || '-' || COALESCE(timing, 'early')
         || '-' || location_no
  END AS id,
  year, month, location_no, floor, position,
  pressure_1, pressure_2, pressure_set, inspector,
  created_at, day, result, drain, oil, memo, photo_key,
  COALESCE(timing, 'early') AS timing
FROM div_pressures;

DROP TABLE div_pressures;

ALTER TABLE div_pressures_new RENAME TO div_pressures;

-- 조회 성능을 위한 보조 인덱스 (리포트/트렌드 조회 패턴 기준)
CREATE INDEX IF NOT EXISTS idx_div_pressures_year_month ON div_pressures(year, month);
CREATE INDEX IF NOT EXISTS idx_div_pressures_location ON div_pressures(location_no);

-- ─── comp_inspections: UNIQUE 제약에 timing 포함 (DIV 압력 0068 패턴 미러) ───
-- 배경: DIV 는 월초(early)/월말(late) 2회 점검이고, 그때마다 컴프레셔도 함께 점검한다.
--   기존 comp_inspections 는 UNIQUE(div_id, year, month) — 월 1회만 저장돼 월말 점검이
--   월초 레코드를 덮어써(ON CONFLICT UPDATE) early 결과가 소실되고, "이번 주기 컴프레셔
--   점검 여부"를 timing 별로 구분할 수 없었다.
--
--   → div_pressures(0049 timing 컬럼 + 0068 UNIQUE 재생성)와 동일하게 timing 을 도입하여
--     early/late 를 각각 저장한다.
--
-- SQLite 는 UNIQUE 제약 변경 불가 → 테이블 재생성.
-- id 포맷도 timing 세그먼트 포함으로 정규화:
--   구:  COMP-{year}-{month}-{div_id}
--   신:  COMP-{year}-{month}-{timing}-{div_id}
-- 기존 데이터는 timing 컬럼이 없으므로 전부 'early' 로 이관(월 1건이라 UNIQUE 충돌 없음).
-- comp_inspections 를 참조하는 FK/트리거 없음(0091 페어링 트리거는 check_points 대상).

CREATE TABLE comp_inspections_new (
  id           TEXT PRIMARY KEY,
  div_id       TEXT NOT NULL,
  floor        INTEGER NOT NULL,
  position     INTEGER NOT NULL,
  year         INTEGER NOT NULL,
  month        INTEGER NOT NULL,
  day          INTEGER,
  tank_drain   TEXT NOT NULL DEFAULT 'none',
  oil          TEXT NOT NULL DEFAULT 'sufficient',
  result       TEXT NOT NULL DEFAULT 'normal',
  memo         TEXT,
  photo_key    TEXT,
  inspector    TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  timing       TEXT DEFAULT 'early',
  UNIQUE(div_id, year, month, timing)
);

-- 기존 데이터 이관 + id 정규화 (구 포맷 → timing='early' 세그먼트 포함 신 포맷)
INSERT INTO comp_inspections_new (
  id, div_id, floor, position, year, month, day,
  tank_drain, oil, result, memo, photo_key, inspector, created_at, timing
)
SELECT
  'COMP-' || year || '-' || substr('00' || month, -2, 2) || '-early-' || div_id AS id,
  div_id, floor, position, year, month, day,
  tank_drain, oil, result, memo, photo_key, inspector, created_at,
  'early' AS timing
FROM comp_inspections;

DROP TABLE comp_inspections;

ALTER TABLE comp_inspections_new RENAME TO comp_inspections;

CREATE INDEX IF NOT EXISTS idx_comp_inspections_div ON comp_inspections(div_id);
CREATE INDEX IF NOT EXISTS idx_comp_inspections_year_month ON comp_inspections(year, month);

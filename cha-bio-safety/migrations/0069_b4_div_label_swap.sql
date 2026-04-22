-- ─── B4층 DIV/컴프레셔 라벨 스왑 + 4월말 압력 데이터 교환 ───
-- 배경:
--   원본 엑셀과 현장 QR 기준으로 -4-1 = 기계실, -4-2 = 팬룸 이 맞음.
--   초기 이식 당시 코드에 반대로 들어가 있었고 (-4-1 = 팬룸, -4-2 = 기계실),
--   4월말 late 점검에서 두 개소 값이 서로 뒤바뀌어 DB에 저장됨.
--
-- 이번 마이그레이션:
--   1) check_points 테이블의 CP-DIV--4-1/-4-2, CP-COMP--4-1/-4-2 의 description
--      필드(위치 설명)를 스왑. location 컬럼은 'B4층 DIV #1' 같은 일반명이므로 유지.
--   2) div_pressures 의 4월말 (2026-04, timing='late') -4-1/-4-2 두 레코드의
--      측정값/부가필드를 서로 교환 (id/location_no/floor/position/created_at 은 유지)
--
-- 건드리지 않는 것:
--   - 4월 초(early) 및 그 외 모든 월의 div_pressures 데이터
--   - comp_inspections, div_compressor_log, comp_drain_log
--   - checkpoint id / description 컬럼 (pos 기준 그대로)

-- 1) check_points description 라벨 스왑 (DIV + COMP 총 4건)
UPDATE check_points SET description = '지) B4층 기계실' WHERE id = 'CP-DIV--4-1';
UPDATE check_points SET description = '지) B4층 팬룸'   WHERE id = 'CP-DIV--4-2';
UPDATE check_points SET description = '지) B4층 기계실' WHERE id = 'CP-COMP--4-1';
UPDATE check_points SET description = '지) B4층 팬룸'   WHERE id = 'CP-COMP--4-2';

-- 2) div_pressures 4월말 2건 값 스왑
--    TEMP 테이블에 -4-1 원본을 백업 → -4-1 에 -4-2 값 복사 → -4-2 에 백업 복사

CREATE TEMP TABLE _b4_swap_tmp AS
SELECT * FROM div_pressures WHERE id = 'DIV-2026-04-late--4-1';

-- -4-1 ← -4-2
UPDATE div_pressures SET
  day          = (SELECT day          FROM div_pressures WHERE id = 'DIV-2026-04-late--4-2'),
  pressure_1   = (SELECT pressure_1   FROM div_pressures WHERE id = 'DIV-2026-04-late--4-2'),
  pressure_2   = (SELECT pressure_2   FROM div_pressures WHERE id = 'DIV-2026-04-late--4-2'),
  pressure_set = (SELECT pressure_set FROM div_pressures WHERE id = 'DIV-2026-04-late--4-2'),
  inspector    = (SELECT inspector    FROM div_pressures WHERE id = 'DIV-2026-04-late--4-2'),
  result       = (SELECT result       FROM div_pressures WHERE id = 'DIV-2026-04-late--4-2'),
  drain        = (SELECT drain        FROM div_pressures WHERE id = 'DIV-2026-04-late--4-2'),
  oil          = (SELECT oil          FROM div_pressures WHERE id = 'DIV-2026-04-late--4-2'),
  memo         = (SELECT memo         FROM div_pressures WHERE id = 'DIV-2026-04-late--4-2'),
  photo_key    = (SELECT photo_key    FROM div_pressures WHERE id = 'DIV-2026-04-late--4-2')
WHERE id = 'DIV-2026-04-late--4-1';

-- -4-2 ← 백업(-4-1 원본)
UPDATE div_pressures SET
  day          = (SELECT day          FROM _b4_swap_tmp),
  pressure_1   = (SELECT pressure_1   FROM _b4_swap_tmp),
  pressure_2   = (SELECT pressure_2   FROM _b4_swap_tmp),
  pressure_set = (SELECT pressure_set FROM _b4_swap_tmp),
  inspector    = (SELECT inspector    FROM _b4_swap_tmp),
  result       = (SELECT result       FROM _b4_swap_tmp),
  drain        = (SELECT drain        FROM _b4_swap_tmp),
  oil          = (SELECT oil          FROM _b4_swap_tmp),
  memo         = (SELECT memo         FROM _b4_swap_tmp),
  photo_key    = (SELECT photo_key    FROM _b4_swap_tmp)
WHERE id = 'DIV-2026-04-late--4-2';

DROP TABLE _b4_swap_tmp;

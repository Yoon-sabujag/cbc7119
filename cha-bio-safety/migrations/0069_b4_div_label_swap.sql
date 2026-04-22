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
--    D1 remote 환경에서는 CREATE TEMP TABLE 이 허용되지 않아 리터럴 값으로 직접 교환.
--    스왑 직전 현재 값은 다음과 같이 확인됨:
--      -4-1: day=22, p1=10.0, p2=4.3, ps=9.9, inspector='윤종엽',
--            result='normal', drain='none', oil='sufficient', memo=NULL, photo_key=NULL
--      -4-2: day=22, p1=9.9,  p2=3.3, ps=9.5, inspector='윤종엽',
--            result='normal', drain='none', oil='sufficient', memo=NULL, photo_key=NULL
--    day/inspector/result/drain/oil/memo/photo_key 는 양쪽 동일하므로 pressure 3개만 교환.

-- -4-1 ← -4-2 의 압력값
UPDATE div_pressures SET
  pressure_1   = 9.9,
  pressure_2   = 3.3,
  pressure_set = 9.5
WHERE id = 'DIV-2026-04-late--4-1';

-- -4-2 ← -4-1 의 압력값 (스왑 전 원본)
UPDATE div_pressures SET
  pressure_1   = 10.0,
  pressure_2   = 4.3,
  pressure_set = 9.9
WHERE id = 'DIV-2026-04-late--4-2';

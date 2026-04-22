-- ─── 4월 이전 과거 데이터 timing = 'late' 로 일괄 보정 ───
-- 배경:
--   월초/월말 구분 도입(마이그레이션 0049) 이전의 점검 기록은 실제로는 전부 "월말 점검값"이었음.
--   그러나 0049 에서 기본값을 'early' 로 잡아 모든 과거 레코드가 'early' 로 라벨링되어 있음.
--   timing 구분이 실제로 의미를 가지기 시작한 시점은 2026-04 (4월초 + 4월말 점검이 분리 저장됨).
--
-- 이번 마이그레이션:
--   - year=2026 AND month=4 레코드는 그대로 둠 (34 early + 27 late, 실제 구분값)
--   - 그 외 early 레코드(1,326건) 전체를 timing='late' 로 변경
--   - id 도 신규 포맷에 맞게 재생성: DIV-{year}-{MM}-late-{location_no}
--
-- 충돌 확인:
--   SELECT year, month, location_no, COUNT(*)
--   FROM div_pressures WHERE NOT (year=2026 AND month=4)
--   GROUP BY year, month, location_no HAVING COUNT(*) > 1;
--   → 0 rows. UNIQUE(year, month, timing, location_no) 위반 없음.

UPDATE div_pressures
SET
  timing = 'late',
  id = 'DIV-' || year || '-' || substr('00' || month, -2, 2) || '-late-' || location_no
WHERE NOT (year = 2026 AND month = 4)
  AND timing = 'early';

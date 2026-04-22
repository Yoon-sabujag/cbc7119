-- ─── B4층 컴프레셔/배수 로그 div_id -4-1 ↔ -4-2 스왑 ───
-- 배경:
--   0069 에서 DIV/컴프레셔 체크포인트 라벨(-4-1=기계실, -4-2=팬룸) 과
--   div_pressures 4월말 2건을 스왑했음. 그러나 아래 로그 테이블들은
--   과거 매핑(-4-1=팬룸, -4-2=기계실) 기준으로 수집되어 있어 새 매핑과 어긋남.
--   사용자가 "오일 주기 / 챔버배수 / 탱크배수 / 컴프레셔 월간 점검" 4개 모두
--   물리적 위치 기준으로 옮겨달라 지시.
--
-- 작업:
--   1) div_drain_log       (챔버배수) — UNIQUE 없음, CASE 단일 UPDATE
--   2) div_compressor_log  (오일)    — UNIQUE 없음, CASE 단일 UPDATE
--   3) comp_drain_log      (탱크배수) — UNIQUE 없음, CASE 단일 UPDATE
--   4) comp_inspections    (컴프레셔 월간 점검) — UNIQUE(div_id,year,month) 존재
--        → 3-step swap via 임시 div_id. id 컬럼도 COMP-{y}-{m}-{div_id} 포맷
--          이므로 동시에 재생성.

-- 1) 챔버배수
UPDATE div_drain_log
SET div_id = CASE div_id WHEN '-4-1' THEN '-4-2' ELSE '-4-1' END
WHERE div_id IN ('-4-1', '-4-2');

-- 2) 오일 보충
UPDATE div_compressor_log
SET div_id = CASE div_id WHEN '-4-1' THEN '-4-2' ELSE '-4-1' END
WHERE div_id IN ('-4-1', '-4-2');

-- 3) 탱크배수
UPDATE comp_drain_log
SET div_id = CASE div_id WHEN '-4-1' THEN '-4-2' ELSE '-4-1' END
WHERE div_id IN ('-4-1', '-4-2');

-- 4) 컴프레셔 월간 점검 — UNIQUE 충돌 회피 3-step
--    4-1) -4-1 레코드를 임시 값으로 퇴피 (id 도 충돌 회피)
UPDATE comp_inspections
SET div_id = 'TMP-SWAP-4-1', id = 'TMP-' || id
WHERE div_id = '-4-1';

--    4-2) -4-2 → -4-1, id 재생성
UPDATE comp_inspections
SET div_id = '-4-1',
    id = 'COMP-' || year || '-' || substr('00' || month, -2, 2) || '--4-1'
WHERE div_id = '-4-2';

--    4-3) 임시 → -4-2, id 재생성
UPDATE comp_inspections
SET div_id = '-4-2',
    id = 'COMP-' || year || '-' || substr('00' || month, -2, 2) || '--4-2'
WHERE div_id = 'TMP-SWAP-4-1';

-- 직원 교대 설정을 DB로 이동 (하드코딩 제거)
ALTER TABLE staff ADD COLUMN shift_offset INTEGER DEFAULT NULL;
ALTER TABLE staff ADD COLUMN shift_fixed TEXT DEFAULT NULL;

-- shift_offset: 3교대 오프셋 (0=당시작, 1=비시작, 2=주시작), NULL이면 비교대
-- shift_fixed: 'day' = 평일 주간 고정 (석현민 같은 경우)

-- 기존 데이터 이전
UPDATE staff SET shift_offset = 0 WHERE id = '2023071752'; -- 박보융
UPDATE staff SET shift_offset = 1 WHERE id = '2022051052'; -- 윤종엽
UPDATE staff SET shift_offset = 2 WHERE id = '2021061451'; -- 김병조
UPDATE staff SET shift_fixed = 'day' WHERE id = '2018042451'; -- 석현민 (평일 주간 고정)

-- staff 테이블에 생년월일 컬럼 추가 + 4명 시드
-- HWP 휴가신청서 (USB) 에서 추출 (2026-05-04)

ALTER TABLE staff ADD COLUMN birth_date TEXT;

UPDATE staff SET birth_date = '1972-04-08' WHERE id = '2018042451';  -- 석현민
UPDATE staff SET birth_date = '1979-11-15' WHERE id = '2021061451';  -- 김병조
UPDATE staff SET birth_date = '1985-01-17' WHERE id = '2022051052';  -- 윤종엽
UPDATE staff SET birth_date = '1990-02-06' WHERE id = '2023071752';  -- 박보융

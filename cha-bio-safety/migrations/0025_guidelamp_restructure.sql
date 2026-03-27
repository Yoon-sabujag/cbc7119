-- 유도등 체크포인트 구역별 재구성 + 접근불가 구역 자동정상 처리
-- GMP(1F), 동물실험실(8F)은 연구동(research) 소속이나 접근불가 → default_result='normal'
-- zone 제약: 'office'(사무동), 'research'(연구동), 'common'(지하/공용)

-- Step 1: check_points에 default_result 컬럼 추가
ALTER TABLE check_points ADD COLUMN default_result TEXT;

-- Step 2: 기존 유도등 체크포인트 삭제 (점검 기록 없음 확인됨)
DELETE FROM check_points WHERE category = '유도등';

-- Step 3: 구역별 유도등 체크포인트 삽입
-- 지하층 (zone=common)
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-B5-유도등', 'QR-B5-유도등', 'B5', 'common', 'B5 유도등', '유도등', '피난구8 거실통로13 통로3 (24개)', 'B5'),
  ('CP-B4-유도등', 'QR-B4-유도등', 'B4', 'common', 'B4 유도등', '유도등', '피난구17 거실통로30 통로4 (51개)', 'B4'),
  ('CP-B3-유도등', 'QR-B3-유도등', 'B3', 'common', 'B3 유도등', '유도등', '피난구17 거실통로20 통로5 (42개)', 'B3'),
  ('CP-B2-유도등', 'QR-B2-유도등', 'B2', 'common', 'B2 유도등', '유도등', '피난구40 거실통로16 통로6 객석통로2 (64개)', 'B2'),
  ('CP-B1-유도등', 'QR-B1-유도등', 'B1', 'common', 'B1 유도등', '유도등', '피난구48 거실통로17 통로12 객석통로4 휴대용1 (82개)', 'B1');

-- 1F (연구동 + GMP + 사무동)
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-1F-연구동-유도등', 'QR-1F-연구동-유도등', '1F', 'research', '1F 연구동 유도등', '유도등', '피난구6 거실통로9 통로8 (23개)', '1F-R'),
  ('CP-1F-사무동-유도등', 'QR-1F-사무동-유도등', '1F', 'office', '1F 사무동 유도등', '유도등', '피난구9 거실통로3 통로3 (15개)', '1F-O');
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no, default_result) VALUES
  ('CP-1F-GMP-유도등', 'QR-1F-GMP-유도등', '1F', 'research', '1F GMP 유도등', '유도등', '피난구9 거실통로2 (11개) [접근불가]', '1F-GMP', 'normal');

-- 2F
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-2F-연구동-유도등', 'QR-2F-연구동-유도등', '2F', 'research', '2F 연구동 유도등', '유도등', '피난구19 거실통로12 통로4 (35개)', '2F-R'),
  ('CP-2F-사무동-유도등', 'QR-2F-사무동-유도등', '2F', 'office', '2F 사무동 유도등', '유도등', '피난구5 거실통로5 통로2 (12개)', '2F-O');

-- 3F
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-3F-연구동-유도등', 'QR-3F-연구동-유도등', '3F', 'research', '3F 연구동 유도등', '유도등', '피난구24 거실통로16 통로4 (44개)', '3F-R'),
  ('CP-3F-사무동-유도등', 'QR-3F-사무동-유도등', '3F', 'office', '3F 사무동 유도등', '유도등', '피난구6 거실통로3 통로3 (12개)', '3F-O');

-- 5F
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-5F-연구동-유도등', 'QR-5F-연구동-유도등', '5F', 'research', '5F 연구동 유도등', '유도등', '피난구30 거실통로14 통로6 (50개)', '5F-R'),
  ('CP-5F-사무동-유도등', 'QR-5F-사무동-유도등', '5F', 'office', '5F 사무동 유도등', '유도등', '피난구6 거실통로6 통로2 (14개)', '5F-O');

-- 6F
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-6F-연구동-유도등', 'QR-6F-연구동-유도등', '6F', 'research', '6F 연구동 유도등', '유도등', '피난구29 거실통로11 통로8 (48개)', '6F-R'),
  ('CP-6F-사무동-유도등', 'QR-6F-사무동-유도등', '6F', 'office', '6F 사무동 유도등', '유도등', '피난구7 거실통로5 통로2 (14개)', '6F-O');

-- 7F
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-7F-연구동-유도등', 'QR-7F-연구동-유도등', '7F', 'research', '7F 연구동 유도등', '유도등', '피난구39 거실통로15 통로7 (61개)', '7F-R'),
  ('CP-7F-사무동-유도등', 'QR-7F-사무동-유도등', '7F', 'office', '7F 사무동 유도등', '유도등', '피난구6 거실통로5 통로3 (14개)', '7F-O');

-- 8F (연구동 + 동물실험실 + 사무동)
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-8F-연구동-유도등', 'QR-8F-연구동-유도등', '8F', 'research', '8F 연구동 유도등', '유도등', '피난구19 거실통로2 통로5 (26개)', '8F-R'),
  ('CP-8F-사무동-유도등', 'QR-8F-사무동-유도등', '8F', 'office', '8F 사무동 유도등', '유도등', '피난구11 거실통로2 통로4 (17개)', '8F-O');
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no, default_result) VALUES
  ('CP-8F-동물실험실-유도등', 'QR-8F-동물실험실-유도등', '8F', 'research', '8F 동물실험실 유도등', '유도등', '피난구16 거실통로10 통로5 (31개) [접근불가]', '8F-LAB', 'normal');

-- 8-1F
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-8_1F-연구동-유도등', 'QR-8_1F-연구동-유도등', '8-1F', 'research', '8-1F 연구동 유도등', '유도등', '피난구1 통로1 (2개)', '8-1F-R'),
  ('CP-8_1F-사무동-유도등', 'QR-8_1F-사무동-유도등', '8-1F', 'office', '8-1F 사무동 유도등', '유도등', '피난구6 통로1 (7개)', '8-1F-O');

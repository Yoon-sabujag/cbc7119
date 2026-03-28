-- DIV 체크포인트 12개(층별) → 34개(측정점별)로 교체
-- 기존 점검 기록 없음 확인됨

DELETE FROM check_points WHERE category = 'DIV';

-- 지상 21개
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-DIV-9-3',  'QR-DIV-9-3',  '8-1F', 'office',   '8-1층 DIV #3', 'DIV', '사) 8층 계단 위',     '9-3'),
  ('CP-DIV-8-1',  'QR-DIV-8-1',  '8F',   'research', '8층 DIV #1',   'DIV', '연) 8층 공조실',      '8-1'),
  ('CP-DIV-8-2',  'QR-DIV-8-2',  '8F',   'research', '8층 DIV #2',   'DIV', '연) 8층 PS실',        '8-2'),
  ('CP-DIV-8-3',  'QR-DIV-8-3',  '8F',   'office',   '8층 DIV #3',   'DIV', '사) 8층 PS실',        '8-3'),
  ('CP-DIV-7-1',  'QR-DIV-7-1',  '7F',   'research', '7층 DIV #1',   'DIV', '연) 7층 공조실',      '7-1'),
  ('CP-DIV-7-2',  'QR-DIV-7-2',  '7F',   'research', '7층 DIV #2',   'DIV', '연) 7층 PS실',        '7-2'),
  ('CP-DIV-7-3',  'QR-DIV-7-3',  '7F',   'office',   '7층 DIV #3',   'DIV', '사) 7층 PS실',        '7-3'),
  ('CP-DIV-6-1',  'QR-DIV-6-1',  '6F',   'research', '6층 DIV #1',   'DIV', '연) 6층 공조실',      '6-1'),
  ('CP-DIV-6-2',  'QR-DIV-6-2',  '6F',   'research', '6층 DIV #2',   'DIV', '연) 6층 PS실',        '6-2'),
  ('CP-DIV-6-3',  'QR-DIV-6-3',  '6F',   'office',   '6층 DIV #3',   'DIV', '사) 6층 PS실',        '6-3'),
  ('CP-DIV-5-1',  'QR-DIV-5-1',  '5F',   'research', '5층 DIV #1',   'DIV', '연) 5층 공조실',      '5-1'),
  ('CP-DIV-5-2',  'QR-DIV-5-2',  '5F',   'research', '5층 DIV #2',   'DIV', '연) 5층 PS실',        '5-2'),
  ('CP-DIV-5-3',  'QR-DIV-5-3',  '5F',   'office',   '5층 DIV #3',   'DIV', '사) 5층 PS실',        '5-3'),
  ('CP-DIV-3-1',  'QR-DIV-3-1',  '3F',   'research', '3층 DIV #1',   'DIV', '연) 3층 공조실',      '3-1'),
  ('CP-DIV-3-2',  'QR-DIV-3-2',  '3F',   'research', '3층 DIV #2',   'DIV', '연) 3층 PS실',        '3-2'),
  ('CP-DIV-3-3',  'QR-DIV-3-3',  '3F',   'office',   '3층 DIV #3',   'DIV', '사) 3층 PS실',        '3-3'),
  ('CP-DIV-2-2',  'QR-DIV-2-2',  '2F',   'research', '2층 DIV #2',   'DIV', '연) 2층 PS실',        '2-2'),
  ('CP-DIV-2-3',  'QR-DIV-2-3',  '2F',   'office',   '2층 DIV #3',   'DIV', '사) 2층 PS실',        '2-3'),
  ('CP-DIV-1-1',  'QR-DIV-1-1',  '1F',   'research', '1층 DIV #1',   'DIV', '연) 1층 공조실',      '1-1'),
  ('CP-DIV-1-2',  'QR-DIV-1-2',  '1F',   'research', '1층 DIV #2',   'DIV', '연) 1층 PS실',        '1-2'),
  ('CP-DIV-1-3',  'QR-DIV-1-3',  '1F',   'office',   '1층 DIV #3',   'DIV', '사) 1층 PS실',        '1-3');

-- 지하 13개
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-DIV--1-1', 'QR-DIV--1-1', 'B1', 'common', 'B1층 DIV #1', 'DIV', '지) B1층 공조실',     '-1-1'),
  ('CP-DIV--1-2', 'QR-DIV--1-2', 'B1', 'common', 'B1층 DIV #2', 'DIV', '지) B1층 화장실',     '-1-2'),
  ('CP-DIV--1-3', 'QR-DIV--1-3', 'B1', 'common', 'B1층 DIV #3', 'DIV', '지) B1층 식당 뒤',   '-1-3'),
  ('CP-DIV--2-1', 'QR-DIV--2-1', 'B2', 'common', 'B2층 DIV #1', 'DIV', '지) B2층 공조실',     '-2-1'),
  ('CP-DIV--2-2', 'QR-DIV--2-2', 'B2', 'common', 'B2층 DIV #2', 'DIV', '지) B2층 CPX실',      '-2-2'),
  ('CP-DIV--2-3', 'QR-DIV--2-3', 'B2', 'common', 'B2층 DIV #3', 'DIV', '지) B2층 PS실',       '-2-3'),
  ('CP-DIV--3-2', 'QR-DIV--3-2', 'B3', 'common', 'B3층 DIV #2', 'DIV', '지) B3층 팬룸',       '-3-2'),
  ('CP-DIV--3-3', 'QR-DIV--3-3', 'B3', 'common', 'B3층 DIV #3', 'DIV', '지) B3층 기사대기실', '-3-3'),
  ('CP-DIV--4-1', 'QR-DIV--4-1', 'B4', 'common', 'B4층 DIV #1', 'DIV', '지) B4층 팬룸',       '-4-1'),
  ('CP-DIV--4-2', 'QR-DIV--4-2', 'B4', 'common', 'B4층 DIV #2', 'DIV', '지) B4층 기계실',     '-4-2'),
  ('CP-DIV--4-3', 'QR-DIV--4-3', 'B4', 'common', 'B4층 DIV #3', 'DIV', '지) B4층 창고',       '-4-3'),
  ('CP-DIV--5-2', 'QR-DIV--5-2', 'B5', 'common', 'B5층 DIV #2', 'DIV', '지) B5층 1번팬룸',    '-5-2'),
  ('CP-DIV--5-3', 'QR-DIV--5-3', 'B5', 'common', 'B5층 DIV #3', 'DIV', '지) B5층 2번팬룸',    '-5-3');

-- 비밀번호: 사번 뒤 4자리 (plain: prefix = 개발용 평문 비교)
-- 운영 전 반드시 실제 해시로 교체 필요
INSERT OR IGNORE INTO staff (id, name, role, title, password_hash, shift_type) VALUES
  ('2018042451', '석현민', 'admin',     '소방안전관리자대리', 'plain:2451', NULL),
  ('2021061451', '김병조', 'assistant', '주임',              'plain:1451', 'day'),
  ('2022051052', '윤종엽', 'assistant', '기사',              'plain:1052', 'night'),
  ('2023071752', '박보융', 'assistant', '기사',              'plain:1752', 'off');

-- 샘플 체크포인트
INSERT OR IGNORE INTO check_points (id, qr_code, floor, zone, location, category, description) VALUES
  ('CP-3F-OFF-001','QR-3F-OFF-001','3F','office','사무동 3층 북측 복도','소화기','분말소화기 3.3kg'),
  ('CP-3F-OFF-002','QR-3F-OFF-002','3F','office','사무동 3층 남측 계단','소화기','분말소화기 3.3kg'),
  ('CP-3F-OFF-003','QR-3F-OFF-003','3F','office','사무동 3층 중앙 홀','스프링클러헤드','폐쇄형 72°C'),
  ('CP-3F-RES-001','QR-3F-RES-001','3F','research','연구동 3층 실험실 A','소화기','CO2 소화기 5kg'),
  ('CP-B1-COM-001','QR-B1-COM-001','B1','common','지하1층 주차장 P1구역','소화기','분말소화기 5kg'),
  ('CP-B1-COM-002','QR-B1-COM-002','B1','common','지하1층 기계실','P형수신기','수신기 패널 점검'),
  ('CP-B2-COM-001','QR-B2-COM-001','B2','common','지하2층 전기실','자동확산소화기','전기실 천장 설치'),
  ('CP-5F-OFF-001','QR-5F-OFF-001','5F','office','사무동 5층 북측 복도','소화기','분말소화기 3.3kg'),
  ('CP-5F-RES-001','QR-5F-RES-001','5F','research','연구동 5층 복도','감지기','연기감지기'),
  ('CP-1F-COM-001','QR-1F-COM-001','1F','common','1층 메인 로비','소화기','분말소화기 5kg');

-- 승강기
INSERT OR IGNORE INTO elevators (id, number, type, location, status) VALUES
  ('EV-01',1,'passenger','사무동 메인 로비','normal'),
  ('EV-02',2,'passenger','사무동 메인 로비','normal'),
  ('EV-03',3,'passenger','사무동 서측','normal'),
  ('EV-04',4,'passenger','연구동 메인','normal'),
  ('EV-05',5,'passenger','연구동 메인','fault'),
  ('EV-06',6,'cargo','사무동 화물용','normal'),
  ('EV-07',7,'cargo','연구동 화물용','normal'),
  ('EV-08',8,'dumbwaiter','식당 덤웨이터 A','normal'),
  ('EV-09',9,'dumbwaiter','식당 덤웨이터 B','normal'),
  ('ES-01',1,'escalator','로비층 1번','normal'),
  ('ES-02',2,'escalator','로비층 2번','normal');

-- 오늘 날짜 샘플 일정 (date() = 오늘)
INSERT OR IGNORE INTO schedule_items (id, title, date, time, assignee_id, category, status) VALUES
  ('SCH-001','VIP 투어 업무협조',    date('now'),'09:30','2018042451','event',  'in_progress'),
  ('SCH-002','엘리베이터 5호기 수리',date('now'),'14:00','2022051052','repair', 'pending'),
  ('SCH-003','소방 종합점검 협의',   date('now'),'16:00','2018042451','inspect','pending'),
  ('SCH-004','전 층 DIV 격주 점검',  date('now'),NULL,   '2021061451','inspect','pending'),
  ('SCH-005','3층 소화기 교체 확인', date('now'),NULL,   '2021061451','task',   'pending');

-- 기존 데이터 삭제 후 정확한 승강기 데이터 입력
-- 출처: 차바이오컴플렉스 방재 시스템 설계서 1.3 승강기 현황

DELETE FROM elevators;

-- ─── 인승용 엘리베이터 (8대) ──────────────────────────────
INSERT INTO elevators (id, number, type, location, status) VALUES
  ('EV-01', 1, 'passenger', 'B5~B1층,연구동2층 (투명 E/V, 장애/전망용)', 'normal'),
  ('EV-02', 2, 'passenger', 'B5~B1층,연구동2층 (투명 E/V, 전망용)',      'normal'),
  ('EV-03', 3, 'passenger', '연구동1층,연구동3~8층 (투명 E/V, 전망용)',      'normal'),
  ('EV-04', 4, 'passenger', '사무동3~8층 (오렌지 E/V, 승객용)',    'normal'),
  ('EV-05', 5, 'passenger', 'B2층~사무동7층 (오렌지 E/V, 장애인용)',  'normal'),
  ('EV-06', 6, 'passenger', 'B2층~사무동7층 (오렌지 E/V, 승객용)',    'normal'),
  ('EV-07', 7, 'passenger', 'B2층~M층~B1층 (저층 전용, 장애인용)',      'normal'),
  ('EV-08', 8, 'passenger', '연구동3~7층 (연구동 전용, 승객용)',     'normal');

-- ─── 화물용 엘리베이터 (2대) ──────────────────────────────
INSERT INTO elevators (id, number, type, location, status) VALUES
  ('EV-09', 9,  'cargo', 'B2~B1식당~2층하역장~연구동7층 (화물용, 식당, 하역장경유)', 'normal'),
  ('EV-10', 10, 'cargo', '2층하역장↔연구동8층 (화물용, 2개층전용)',     'normal');

-- ─── 덤웨이터 (1대) ───────────────────────────────────────
INSERT INTO elevators (id, number, type, location, status) VALUES
  ('EV-11', 11, 'dumbwaiter', 'B1식당↔2층하역장 (소형화물용, 적재200kg)', 'normal');

-- ─── 에스컬레이터 (6대) ───────────────────────────────────
INSERT INTO elevators (id, number, type, location, status) VALUES
  ('ES-01', 1, 'escalator', 'B1층↔M층 하행 (B1-B1M D) (8.4m/30도)', 'normal'),
  ('ES-02', 2, 'escalator', 'M층↔B1층 상행 (B1M-B1 U) (8.4m/30도)', 'normal'),
  ('ES-03', 3, 'escalator', '연구동2층↔B1층 하행 (2-B1 D) (5.4m/35도)', 'normal'),
  ('ES-04', 4, 'escalator', 'B1층↔연구동2층 상행 (B1-2 U) (5.4m/35도)', 'normal'),
  ('ES-05', 5, 'escalator', '연구동3층↔연구동2층 하행 (3-2 D) (1.92m/35도)', 'normal'),
  ('ES-06', 6, 'escalator', '연구동2층↔연구동3층 상행 (2-3 U) (1.92m/35도)',  'normal');

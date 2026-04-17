-- ─── 검사성적서 상세 정보 컬럼 추가 ──────────────────────────
-- 검사성적서(2026.03.04 정기검사) 상단 승강기정보 표시를 위한 필드
-- 출처: Report 1차.pdf (3~12 페이지)

ALTER TABLE elevators ADD COLUMN model_type           TEXT;     -- 형식/종류 (권상식/VVVF/장애/전망용 등)
ALTER TABLE elevators ADD COLUMN manufacturer         TEXT;     -- 제조업체
ALTER TABLE elevators ADD COLUMN maintenance_company  TEXT;     -- 유지관리업체
ALTER TABLE elevators ADD COLUMN machine_location     TEXT;     -- 구동기 공간/설치위치 (MRL, 골조 구조물 내부)
ALTER TABLE elevators ADD COLUMN rated_speed          TEXT;     -- 정격속도/공칭속도 (1.75 m/s, 0.5 m/s)
ALTER TABLE elevators ADD COLUMN floor_count          INTEGER;  -- 운행층수 (운행구간 옆 괄호 숫자)
ALTER TABLE elevators ADD COLUMN rope_diameter        TEXT;     -- 매다는장치의 지름/두께 (10 mm, 8 mm)
ALTER TABLE elevators ADD COLUMN safety_device        TEXT;     -- 추락방지안전장치 (점차작동형)
ALTER TABLE elevators ADD COLUMN rope_count           INTEGER;  -- 매다는장치의 가닥수
ALTER TABLE elevators ADD COLUMN max_capacity_persons INTEGER;  -- 최대수용능력 (명/h, 에스컬레이터)
ALTER TABLE elevators ADD COLUMN incline_angle        INTEGER;  -- 경사 각도 (도, 에스컬레이터)
ALTER TABLE elevators ADD COLUMN auxiliary_brake      TEXT;     -- 보조브레이크 (유/무, 에스컬레이터)
ALTER TABLE elevators ADD COLUMN operation_mode       TEXT;     -- 운전 방식 (준비운전, 에스컬레이터)

-- ─── 엘리베이터 1~8호 (검사성적서 보유) ──────────────────────
UPDATE elevators SET model_type='권상식/VVVF/장애/전망용', manufacturer='티케이엘리베이터코리아(주)', maintenance_company='티케이엘리베이터코리아(주)강남2', machine_location='MRL', rated_speed='1.75 m/s', floor_count=12, rope_diameter='10 mm', safety_device='점차작동형', rope_count=7 WHERE id='EV-01';
UPDATE elevators SET model_type='권상식/VVVF/전망용',      manufacturer='티케이엘리베이터코리아(주)', maintenance_company='티케이엘리베이터코리아(주)강남2', machine_location='MRL', rated_speed='1.75 m/s', floor_count=12, rope_diameter='10 mm', safety_device='점차작동형', rope_count=7 WHERE id='EV-02';
UPDATE elevators SET model_type='권상식/VVVF/전망용',      manufacturer='티케이엘리베이터코리아(주)', maintenance_company='티케이엘리베이터코리아(주)강남2', machine_location='MRL', rated_speed='1.75 m/s', floor_count=12, rope_diameter='10 mm', safety_device='점차작동형', rope_count=7 WHERE id='EV-03';
UPDATE elevators SET model_type='권상식/VVVF/승객용',      manufacturer='티케이엘리베이터코리아(주)', maintenance_company='티케이엘리베이터코리아(주)강남2', machine_location='MRL', rated_speed='1.75 m/s', floor_count=12, rope_diameter='10 mm', safety_device='점차작동형', rope_count=7 WHERE id='EV-04';
UPDATE elevators SET model_type='권상식/VVVF/장애인용',    manufacturer='티케이엘리베이터코리아(주)', maintenance_company='티케이엘리베이터코리아(주)강남2', machine_location='MRL', rated_speed='1.75 m/s', floor_count=12, rope_diameter='10 mm', safety_device='점차작동형', rope_count=7 WHERE id='EV-05';
UPDATE elevators SET model_type='권상식/VVVF/승객용',      manufacturer='티케이엘리베이터코리아(주)', maintenance_company='티케이엘리베이터코리아(주)강남2', machine_location='MRL', rated_speed='1.75 m/s', floor_count=12, rope_diameter='10 mm', safety_device='점차작동형', rope_count=7 WHERE id='EV-06';
UPDATE elevators SET model_type='권상식/VVVF/장애인용',    manufacturer='티케이엘리베이터코리아(주)', maintenance_company='티케이엘리베이터코리아(주)강남2', machine_location='MRL', rated_speed='1 m/s',    floor_count=3,  rope_diameter='10 mm', safety_device='점차작동형', rope_count=7 WHERE id='EV-07';
UPDATE elevators SET model_type='권상식/VVVF/승객용',      manufacturer='티케이엘리베이터코리아(주)', maintenance_company='티케이엘리베이터코리아(주)강남2', machine_location='MRL', rated_speed='1.5 m/s',  floor_count=6,  rope_diameter='8 mm',  safety_device='점차작동형', rope_count=7 WHERE id='EV-08';

-- ─── 에스컬레이터 16~17호 (검사성적서 보유) ──────────────────
UPDATE elevators SET model_type='스텝식/에스컬레이터', manufacturer='티케이엘리베이터코리아(주)', maintenance_company='티케이엘리베이터코리아(주)강남2', machine_location='골조 구조물 내부', rated_speed='0.5 m/s', max_capacity_persons=9000, incline_angle=35, auxiliary_brake='유', operation_mode='준비운전' WHERE id='ES-01';
UPDATE elevators SET model_type='스텝식/에스컬레이터', manufacturer='티케이엘리베이터코리아(주)', maintenance_company='티케이엘리베이터코리아(주)강남2', machine_location='골조 구조물 내부', rated_speed='0.5 m/s', max_capacity_persons=9000, incline_angle=35, auxiliary_brake='유', operation_mode='준비운전' WHERE id='ES-02';

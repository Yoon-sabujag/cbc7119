-- ─── 승강기 공단 등록 정보 추가 ─────────────────────────────
-- 검사성적서 PDF 자동 매칭 및 상세 표시를 위한 공식 정보 컬럼
-- 출처: 공단 등록 승강기 현황 (2026.03 기준)

ALTER TABLE elevators ADD COLUMN cert_no         TEXT;     -- 승강기고유번호 (예: 2114-971)
ALTER TABLE elevators ADD COLUMN public_no       INTEGER;  -- 공단 호기 (1~17)
ALTER TABLE elevators ADD COLUMN classification  TEXT;     -- 분류 (장애/전망용, 전망용, 승객용, 장애인용, 화물용, 덤웨이터, 에스컬레이터)
ALTER TABLE elevators ADD COLUMN service_range   TEXT;     -- 설치층수 (B5-8, 2-B1(D), 등)
ALTER TABLE elevators ADD COLUMN capacity_person INTEGER;  -- 탑승인원 (인승)
ALTER TABLE elevators ADD COLUMN capacity_kg     INTEGER;  -- 용량 (kg)

-- ─── 엘리베이터 (8대) ──────────────────────────────────────
UPDATE elevators SET cert_no='2114-971', public_no=1,  classification='장애/전망용', service_range='B5-8',  capacity_person=24,   capacity_kg=1600 WHERE id='EV-01';
UPDATE elevators SET cert_no='2114-972', public_no=2,  classification='전망용',      service_range='B5-8',  capacity_person=24,   capacity_kg=1600 WHERE id='EV-02';
UPDATE elevators SET cert_no='2114-973', public_no=3,  classification='전망용',      service_range='B5-8',  capacity_person=24,   capacity_kg=1600 WHERE id='EV-03';
UPDATE elevators SET cert_no='2114-090', public_no=4,  classification='승객용',      service_range='B5-8',  capacity_person=17,   capacity_kg=1150 WHERE id='EV-04';
UPDATE elevators SET cert_no='2114-091', public_no=5,  classification='장애인용',    service_range='B5-8',  capacity_person=17,   capacity_kg=1150 WHERE id='EV-05';
UPDATE elevators SET cert_no='2114-092', public_no=6,  classification='승객용',      service_range='B5-8',  capacity_person=17,   capacity_kg=1150 WHERE id='EV-06';
UPDATE elevators SET cert_no='2114-599', public_no=7,  classification='장애인용',    service_range='B2-B1', capacity_person=17,   capacity_kg=1150 WHERE id='EV-07';
UPDATE elevators SET cert_no='2114-600', public_no=8,  classification='승객용',      service_range='1-7',   capacity_person=11,   capacity_kg=750  WHERE id='EV-08';

-- ─── 화물용 (2대) ─────────────────────────────────────────
UPDATE elevators SET cert_no='2126-799', public_no=9,  classification='화물용',      service_range='B2-7',  capacity_person=NULL, capacity_kg=2000 WHERE id='EV-09';
UPDATE elevators SET cert_no='2126-800', public_no=10, classification='화물용',      service_range='2-8',   capacity_person=NULL, capacity_kg=2000 WHERE id='EV-10';

-- ─── 덤웨이터 (1대) ───────────────────────────────────────
UPDATE elevators SET cert_no='3903-151', public_no=11, classification='덤웨이터',    service_range='B1-2',  capacity_person=NULL, capacity_kg=200  WHERE id='EV-11';

-- ─── 에스컬레이터 (6대) ───────────────────────────────────
-- 주의: DB내부 ES-01~06 순번과 공단 공식 호기번호(12~17)가 다름. 층 범위로 매칭.
UPDATE elevators SET cert_no='3805-669', public_no=16, classification='에스컬레이터', service_range='B1-B1M(D)', capacity_person=NULL, capacity_kg=NULL WHERE id='ES-01';
UPDATE elevators SET cert_no='3805-670', public_no=17, classification='에스컬레이터', service_range='B1M-B(U)',  capacity_person=NULL, capacity_kg=NULL WHERE id='ES-02';
UPDATE elevators SET cert_no='3805-665', public_no=12, classification='에스컬레이터', service_range='2-B1(D)',   capacity_person=NULL, capacity_kg=NULL WHERE id='ES-03';
UPDATE elevators SET cert_no='3805-666', public_no=13, classification='에스컬레이터', service_range='B1-2(U)',   capacity_person=NULL, capacity_kg=NULL WHERE id='ES-04';
UPDATE elevators SET cert_no='3805-667', public_no=14, classification='에스컬레이터', service_range='3-2(D)',    capacity_person=NULL, capacity_kg=NULL WHERE id='ES-05';
UPDATE elevators SET cert_no='3805-668', public_no=15, classification='에스컬레이터', service_range='3-2(U)',    capacity_person=NULL, capacity_kg=NULL WHERE id='ES-06';

-- ─── 인덱스 (PDF 매칭용) ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_elevators_cert_no   ON elevators(cert_no);
CREATE INDEX IF NOT EXISTS idx_elevators_public_no ON elevators(public_no);

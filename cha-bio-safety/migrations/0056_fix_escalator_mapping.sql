-- ─── 에스컬레이터 매핑 수정 ────────────────────────────────
-- 마이그레이션 0054에서 ES-01~06과 public_no 12~17 매핑이 어긋나 있었음.
-- DB의 location 데이터(층/경사도)를 기준으로 올바른 public_no/cert_no로 수정.
--
-- 매핑 (location → 공단 호기):
-- ES-01 (8.4m/30도, 2-B1 D) → E/S-1, public_no=12, cert_no=3805-665
-- ES-02 (8.4m/30도, B1-2 U) → E/S-2, public_no=13, cert_no=3805-666
-- ES-03 (5.4m/35도, 3-2 D)  → E/S-3, public_no=14, cert_no=3805-667
-- ES-04 (5.4m/35도, 2-3 U)  → E/S-4, public_no=15, cert_no=3805-668
-- ES-05 (1.92m/35도, B1-M D)→ E/S-5, public_no=16, cert_no=3805-669 ← 검사성적서 있음
-- ES-06 (1.92m/35도, M-B1 U)→ E/S-6, public_no=17, cert_no=3805-670 ← 검사성적서 있음

-- ── public_no / cert_no / service_range 재매핑 ──────────────
UPDATE elevators SET cert_no='3805-665', public_no=12, service_range='2-B1(D)'   WHERE id='ES-01';
UPDATE elevators SET cert_no='3805-666', public_no=13, service_range='B1-2(U)'   WHERE id='ES-02';
UPDATE elevators SET cert_no='3805-667', public_no=14, service_range='3-2(D)'    WHERE id='ES-03';
UPDATE elevators SET cert_no='3805-668', public_no=15, service_range='3-2(U)'    WHERE id='ES-04';
UPDATE elevators SET cert_no='3805-669', public_no=16, service_range='B1-B1M(D)' WHERE id='ES-05';
UPDATE elevators SET cert_no='3805-670', public_no=17, service_range='B1M-B(U)'  WHERE id='ES-06';

-- ── 잘못 들어간 검사성적서 상세 정보 제거 (ES-01, ES-02) ─────
UPDATE elevators SET
  model_type=NULL, manufacturer=NULL, maintenance_company=NULL,
  machine_location=NULL, rated_speed=NULL, max_capacity_persons=NULL,
  incline_angle=NULL, auxiliary_brake=NULL, operation_mode=NULL
WHERE id IN ('ES-01', 'ES-02');

-- ── 올바른 호기(ES-05, ES-06)에 검사성적서 상세 정보 추가 ─────
UPDATE elevators SET
  model_type='스텝식/에스컬레이터',
  manufacturer='티케이엘리베이터코리아(주)',
  maintenance_company='티케이엘리베이터코리아(주)강남2',
  machine_location='골조 구조물 내부',
  rated_speed='0.5 m/s',
  max_capacity_persons=9000,
  incline_angle=35,
  auxiliary_brake='유',
  operation_mode='준비운전'
WHERE id IN ('ES-05', 'ES-06');

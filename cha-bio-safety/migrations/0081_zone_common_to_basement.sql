-- Migration 0081: check_points.zone CHECK 제거 + 'common' → 'basement' 정리
--
-- 배경: 운영 데이터 검증 결과 cp.zone='common' 397행 모두 B1-B5 지하층.
-- ext.zone 한글값은 '연/사/지' 3종이고 '공' 0행 — 시스템에 '공용' 카테고리 없음.
-- 'common' 영문이 의미상 부적절(공용/공통) → '지하(basement)'로 일관성 정리.
--
-- 변경:
-- 1) 0001_init 의 CHECK(zone IN ('office','research','common')) 제거 — 향후 zone 추가 자유.
-- 2) 'common' → 'basement' UPDATE.
--
-- D1 SQLite 는 ALTER 로 CHECK 제약 제거 미지원 → 테이블 재생성.
-- FK 참조 3개 (check_records.checkpoint_id, floor_plan_markers.check_point_id,
-- extinguishers.check_point_id). D1 의 FK enforce 가 ON 이라 재생성 시 OFF 강제 필요.
-- 트리거 1개 (sync_marker_description_on_cp_update, 0078) — 재생성 필요.

-- ── 0) FK enforce 임시 OFF ──
PRAGMA foreign_keys=OFF;

-- ── 1) 새 테이블 (CHECK 제거, 나머지 0001+ALTER 컬럼 그대로) ──
CREATE TABLE check_points_new (
  id          TEXT PRIMARY KEY,
  qr_code     TEXT NOT NULL UNIQUE,
  floor       TEXT NOT NULL,
  zone        TEXT NOT NULL,                   -- CHECK 제거
  location    TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  location_no TEXT,
  default_result TEXT,
  ceiling_exit INTEGER DEFAULT 0,
  wall_exit INTEGER DEFAULT 0,
  room_passage INTEGER DEFAULT 0,
  corridor_passage INTEGER DEFAULT 0,
  stair_passage INTEGER DEFAULT 0,
  audience_passage INTEGER DEFAULT 0,
  ext_type TEXT,
  approval_no TEXT,
  mfg_date TEXT,
  manufacturer TEXT,
  prefix_char TEXT,
  cert_no TEXT,
  serial_no TEXT,
  ext_note TEXT
);

-- ── 2) 데이터 이전 + 'common' → 'basement' 동시 변환 ──
INSERT INTO check_points_new (
  id, qr_code, floor, zone, location, category, description, is_active, created_at,
  location_no, default_result, ceiling_exit, wall_exit, room_passage, corridor_passage,
  stair_passage, audience_passage, ext_type, approval_no, mfg_date, manufacturer,
  prefix_char, cert_no, serial_no, ext_note
)
SELECT
  id, qr_code, floor,
  CASE zone WHEN 'common' THEN 'basement' ELSE zone END,
  location, category, description, is_active, created_at,
  location_no, default_result, ceiling_exit, wall_exit, room_passage, corridor_passage,
  stair_passage, audience_passage, ext_type, approval_no, mfg_date, manufacturer,
  prefix_char, cert_no, serial_no, ext_note
FROM check_points;

-- ── 3) 트리거 명시 drop (테이블 drop 시 자동 삭제되지만 안전 차원) ──
DROP TRIGGER IF EXISTS sync_marker_description_on_cp_update;

-- ── 4) 기존 테이블 drop ──
DROP TABLE check_points;

-- ── 5) RENAME ──
ALTER TABLE check_points_new RENAME TO check_points;

-- ── 6) 트리거 재생성 (0078 동일) ──
CREATE TRIGGER sync_marker_description_on_cp_update
AFTER UPDATE OF description ON check_points
FOR EACH ROW
WHEN OLD.description IS NOT NEW.description
BEGIN
  UPDATE floor_plan_markers
  SET description = NEW.description,
      updated_at = datetime('now')
  WHERE check_point_id = NEW.id;
END;

-- ── 7) FK enforce 복구 ──
PRAGMA foreign_keys=ON;

-- migrations/0005_inspection_fix.sql
-- brake 등 컬럼 NULL 허용 (D1은 ALTER COLUMN 미지원 → 테이블 재생성)

-- 기존 테이블 백업
CREATE TABLE IF NOT EXISTS elevator_inspections_bak AS SELECT * FROM elevator_inspections;

-- 기존 테이블 삭제
DROP TABLE IF EXISTS elevator_inspections;

-- 새 테이블 생성 (brake 등 NULL 허용)
CREATE TABLE elevator_inspections (
  id            TEXT PRIMARY KEY,
  elevator_id   TEXT NOT NULL REFERENCES elevators(id),
  inspector_id  TEXT NOT NULL REFERENCES staff(id),
  inspect_date  TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'monthly' CHECK(type IN ('monthly','annual')),
  brake         TEXT CHECK(brake IN ('normal','bad')),
  door          TEXT CHECK(door IN ('normal','bad')),
  safety_device TEXT CHECK(safety_device IN ('normal','bad')),
  lighting      TEXT CHECK(lighting IN ('normal','bad')),
  emergency_call TEXT CHECK(emergency_call IN ('normal','bad')),
  overall       TEXT NOT NULL,
  action_needed TEXT,
  memo          TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 백업 데이터 복원
INSERT INTO elevator_inspections
  (id, elevator_id, inspector_id, inspect_date, type, brake, door, safety_device, lighting, emergency_call, overall, action_needed, memo, created_at)
SELECT
  id, elevator_id, inspector_id, inspect_date, type, brake, door, safety_device, lighting, emergency_call, overall, action_needed, memo, created_at
FROM elevator_inspections_bak;

DROP TABLE IF EXISTS elevator_inspections_bak;

-- 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_elevator_inspections_elevator ON elevator_inspections(elevator_id, inspect_date);
CREATE INDEX IF NOT EXISTS idx_elevator_inspections_type ON elevator_inspections(type, inspect_date);

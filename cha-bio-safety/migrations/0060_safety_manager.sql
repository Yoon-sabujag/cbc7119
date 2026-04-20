-- 승강기 안전관리자 관련 컬럼 추가
ALTER TABLE staff ADD COLUMN elevator_safety_manager INTEGER NOT NULL DEFAULT 0;
ALTER TABLE staff ADD COLUMN safety_mgr_appointed_at TEXT;   -- 선임일
ALTER TABLE staff ADD COLUMN safety_mgr_edu_dt TEXT;          -- 교육이수일
ALTER TABLE staff ADD COLUMN safety_mgr_edu_expire TEXT;      -- 교육유효기간 만료일

-- 김병조 안전관리자 지정 (공단 API 데이터 기준)
UPDATE staff SET
  elevator_safety_manager = 1,
  safety_mgr_appointed_at = '2023-01-04',
  safety_mgr_edu_dt = '2025-11-05',
  safety_mgr_edu_expire = '2029-01-01'
WHERE id = '2021061451';

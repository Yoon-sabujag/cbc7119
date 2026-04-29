-- Migration 0074: Add multi-photo columns to elevator_faults
-- 고장 접수 시 증상 사진(photo_keys) + 수리 완료 시 수리 사진(repair_photo_keys)
-- DEFAULT '[]' 로 기존 행 자동 초기화 → 백필 불필요
ALTER TABLE elevator_faults ADD COLUMN photo_keys TEXT NOT NULL DEFAULT '[]';
ALTER TABLE elevator_faults ADD COLUMN repair_photo_keys TEXT NOT NULL DEFAULT '[]';

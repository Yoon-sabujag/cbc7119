-- ─── 검사기록 조치 후 합격 cert 연결 ───────────────────────
-- 조건부합격 검사 후 시정조치 받고 새로 받은 합격 cert를 원본 검사기록에 연결
-- 원본 검사기록 카드 펼침 시 원본 cert + 조치 후 cert 함께 표시 가능

ALTER TABLE elevator_inspections ADD COLUMN parent_inspection_id TEXT REFERENCES elevator_inspections(id);

CREATE INDEX IF NOT EXISTS idx_elev_inspections_parent ON elevator_inspections(parent_inspection_id);

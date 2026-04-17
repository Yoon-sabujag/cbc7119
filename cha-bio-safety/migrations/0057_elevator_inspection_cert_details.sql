-- ─── 검사성적서 상세 정보 컬럼 (검사실시정보 + 항목별 결과) ──
-- PDF 자동 파싱한 결과를 저장하기 위한 컬럼
-- 검사기록 카드 펼침 시 항목별 검사결과/검사실시정보 표시에 사용

-- 검사실시정보
ALTER TABLE elevator_inspections ADD COLUMN inspector_name      TEXT;  -- 검사자 (예: 차영수, 박일국,최용운)
ALTER TABLE elevator_inspections ADD COLUMN inspection_agency   TEXT;  -- 관할 검사 기관 (예: 경기지원)
ALTER TABLE elevator_inspections ADD COLUMN judgment            TEXT;  -- 판정 결과 텍스트 (예: 합격, 조건부합격)
ALTER TABLE elevator_inspections ADD COLUMN validity_start      TEXT;  -- 검사유효기간 시작 (YYYY-MM-DD)
ALTER TABLE elevator_inspections ADD COLUMN validity_end        TEXT;  -- 검사유효기간 종료 (YYYY-MM-DD)
ALTER TABLE elevator_inspections ADD COLUMN cert_number         TEXT;  -- 합격증명서 발행번호 (예: 9103-2-2026-46309036-1)

-- 항목별 검사결과 (JSON 배열)
-- 형식: [{"no":"1.1","name":"기본제원","result":"적합"}, ...]
-- 엘리베이터: 1.1~1.15, 에스컬레이터: 3.1~3.12
ALTER TABLE elevator_inspections ADD COLUMN inspection_items    TEXT;  -- JSON

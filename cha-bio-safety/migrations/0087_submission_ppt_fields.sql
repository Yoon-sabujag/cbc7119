-- 0087_submission_ppt_fields.sql
-- submission-ppt 트랙 (W2): 제출용 PPT 생성을 위한 추가 컬럼
--
-- schedule_items:
--   submission_status — 'pending'/'completed' (제출 미완료/완료). completed 시 mutation lock
--   ppt_file_key      — 생성된 지적조치사진 PPT 의 R2 키 (NULL = 미생성)
--
-- legal_findings:
--   submission_selected — 0/1 (제출용 탭에서 체크 여부)
--   submission_label    — PPT 표에 들어갈 라벨. NULL 이면 코드가 location+description prefill 사용
--
-- 참고: phase 15 의 0086 번호는 재사용 금지 (메모리 룰).

ALTER TABLE schedule_items ADD COLUMN submission_status TEXT NOT NULL DEFAULT 'pending' CHECK(submission_status IN ('pending','completed'));
ALTER TABLE schedule_items ADD COLUMN ppt_file_key TEXT;
ALTER TABLE legal_findings ADD COLUMN submission_selected INTEGER NOT NULL DEFAULT 0 CHECK(submission_selected IN (0,1));
ALTER TABLE legal_findings ADD COLUMN submission_label TEXT;

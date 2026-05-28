-- 0088_submission_order.sql
-- submission-ppt 트랙 (W10): 제출용 탭의 카드 순서 지정 — PPT 표 슬롯 결정
--
-- legal_findings.submission_order:
--   0    = PPT 미포함 (= submission_selected 0)
--   1..N = PPT 포함 + 표시 순서 (좌상/좌하=홀수, 우상/우하=짝수 / 페이지=ceil(N/2))
--
-- 새 endpoint PUT /api/legal/:id/submission-order 가 bulk renumber.
-- 기존 submission_selected 컬럼은 (submission_order > 0) 와 동기 유지 (PPT generate 의 WHERE 절 호환).

ALTER TABLE legal_findings ADD COLUMN submission_order INTEGER NOT NULL DEFAULT 0;

-- 기존 선택된 finding 에 order 부여 — created_at 순 (W8c 까지의 행동 보존)
UPDATE legal_findings
SET submission_order = (
  SELECT COUNT(*)
  FROM legal_findings AS x
  WHERE x.schedule_item_id = legal_findings.schedule_item_id
    AND x.submission_selected = 1
    AND x.created_at <= legal_findings.created_at
)
WHERE submission_selected = 1;

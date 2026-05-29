-- 0090: 사용자 피드백 반영
--   1) handovers.pinned: 고정을 status enum 에서 빼서 boolean 으로 분리 (고정은 대기/완료 와 직교)
--   2) 기존 status='pinned' row 마이그레이션: pinned=1 + status='waiting'
--   3) work_list_items + work_list_revisions 에 extra 컬럼 추가
--      - password 탭: affiliation = 아이디 의미 재정의, extra 미사용
--      - contact  탭: affiliation = 이름,         extra = 직책/직급
--
-- 참고: handovers.title 은 NOT NULL 유지 — 클라이언트가 ''(빈 문자열)로 보내고,
--       렌더링에서 빈 제목이면 숨김 처리. SQLite ALTER COLUMN NOT NULL 제거 회피.
-- 참고: status CHECK 제약은 그대로 ('waiting','done','pinned' 허용). 새 코드는 'pinned' 안 씀.

ALTER TABLE handovers ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0;

UPDATE handovers SET pinned = 1, status = 'waiting' WHERE status = 'pinned';

CREATE INDEX idx_handovers_pinned ON handovers(pinned, created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE work_list_items ADD COLUMN extra TEXT;
ALTER TABLE work_list_revisions ADD COLUMN extra TEXT;

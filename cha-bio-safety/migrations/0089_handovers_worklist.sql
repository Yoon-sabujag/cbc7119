-- 0089: 인수 인계장 + 업무 관련 리스트 (비밀번호/연락처) 신설
-- 2026-05-30. cbc7119-data staging 선 적용.
-- 룰:
--  - 원글 수정/삭제는 본인 staff_id 만 (API 가드)
--  - 모든 수정/삭제는 자동으로 revisions 테이블에 snapshot 저장 (맥 타임캡슐 패턴)
--  - 누구나 revisions 조회 + 시점 복원 가능 (복원은 새 revision 으로 audit)
--  - handover soft delete (deleted_at) — 검색 시 회색+"삭제됨" 표시
--  - work_list 는 type 통합 (password | contact)

CREATE TABLE handovers (
  id          TEXT PRIMARY KEY,
  staff_id    TEXT NOT NULL REFERENCES staff(id),  -- 작성자 (수정/삭제 권한 가드)
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'waiting'
              CHECK(status IN ('waiting','done','pinned')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now','+9 hours')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now','+9 hours')),
  deleted_at  TEXT,
  deleted_by  TEXT REFERENCES staff(id)
);

CREATE INDEX idx_handovers_status         ON handovers(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_handovers_created_at     ON handovers(created_at DESC);
CREATE INDEX idx_handovers_staff_id       ON handovers(staff_id);
CREATE INDEX idx_handovers_deleted_at     ON handovers(deleted_at);

-- 시간 캡슐: 모든 수정/삭제마다 새 row 적재.
-- 신규 작성 시점도 첫 revision 으로 기록한다.
CREATE TABLE handover_revisions (
  id              TEXT PRIMARY KEY,
  handover_id     TEXT NOT NULL REFERENCES handovers(id),
  staff_id        TEXT NOT NULL REFERENCES staff(id),  -- 이 버전 작성/수정/삭제/복원자
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  status          TEXT NOT NULL,
  is_deletion     INTEGER NOT NULL DEFAULT 0,  -- 1 이면 삭제 시점의 스냅샷
  is_revert_from  TEXT,                         -- revert 인 경우 어느 revision id 에서 복원했는지
  created_at      TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);

CREATE INDEX idx_handover_revisions_handover_id ON handover_revisions(handover_id, created_at DESC);
CREATE INDEX idx_handover_revisions_staff_id    ON handover_revisions(staff_id);

CREATE TABLE handover_attachments (
  id            TEXT PRIMARY KEY,
  handover_id   TEXT NOT NULL REFERENCES handovers(id),
  storage_key   TEXT NOT NULL,
  filename      TEXT,
  content_type  TEXT,
  size_bytes    INTEGER,
  uploaded_by   TEXT NOT NULL REFERENCES staff(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);

CREATE INDEX idx_handover_attachments_handover_id ON handover_attachments(handover_id);

-- 업무 관련 리스트 (탭: 비밀번호 | 연락처).
-- 비밀번호: label = 항목명(예: '방재실 출입'), value = 비밀번호. 평문 저장(4인 내부).
-- 연락처:   label = 이름, value = 전화번호, affiliation = 회사/소속(선택)
CREATE TABLE work_list_items (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL CHECK(type IN ('password','contact')),
  label         TEXT NOT NULL,
  value         TEXT NOT NULL,
  affiliation   TEXT,
  memo          TEXT,
  created_by    TEXT NOT NULL REFERENCES staff(id),
  updated_by    TEXT REFERENCES staff(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now','+9 hours')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now','+9 hours')),
  deleted_at    TEXT,
  deleted_by    TEXT REFERENCES staff(id)
);

CREATE INDEX idx_work_list_items_type       ON work_list_items(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_list_items_created_by ON work_list_items(created_by);
CREATE INDEX idx_work_list_items_deleted_at ON work_list_items(deleted_at);

CREATE TABLE work_list_revisions (
  id              TEXT PRIMARY KEY,
  item_id         TEXT NOT NULL REFERENCES work_list_items(id),
  staff_id        TEXT NOT NULL REFERENCES staff(id),
  type            TEXT NOT NULL,
  label           TEXT NOT NULL,
  value           TEXT NOT NULL,
  affiliation     TEXT,
  memo            TEXT,
  is_deletion     INTEGER NOT NULL DEFAULT 0,
  is_revert_from  TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);

CREATE INDEX idx_work_list_revisions_item_id  ON work_list_revisions(item_id, created_at DESC);
CREATE INDEX idx_work_list_revisions_staff_id ON work_list_revisions(staff_id);

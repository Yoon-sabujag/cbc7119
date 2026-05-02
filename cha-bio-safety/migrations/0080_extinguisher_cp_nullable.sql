-- Migration 0080: extinguishers.check_point_id NOT NULL → NULL 허용
--
-- Phase 24 자산-위치 분리의 누락 마이그레이션.
-- 0079 가 status 컬럼 + 인덱스 + 백필을 추가했지만, check_point_id 의 NOT NULL 제약 제거를 빠뜨림.
-- skip_marker=true 자산 등록과 dispose / unassign API 의 check_point_id=NULL set 가 SQLite NOT NULL constraint 로 실패함 (500 에러).
--
-- SQLite ALTER COLUMN 이 NOT NULL 제거를 직접 지원하지 않으므로 테이블 재생성 패턴 적용:
-- 1) extinguishers_new (check_point_id 가 NOT NULL 없이) 생성
-- 2) 데이터 복사
-- 3) 기존 테이블 DROP
-- 4) RENAME
-- 5) 인덱스 4개 재생성
--
-- 절대 금지: check_records 는 본 마이그레이션에서 건드리지 않음. extinguishers.id 를 참조하는 FK 가 없어 cascade 영향 없음.
-- 위험: 데이터 복사 도중 D1 락 — 448행 규모로 수 ms ~ 수십 ms 예상 (4인 팀 트래픽 무시 가능).

-- ── 1) 새 테이블 (check_point_id 가 nullable, FK 유지, status DEFAULT 보존) ──
CREATE TABLE extinguishers_new (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  check_point_id  TEXT REFERENCES check_points(id),  -- NOT NULL 제거
  seq_no          INTEGER,
  zone            TEXT,
  floor           TEXT,
  mgmt_no         TEXT,
  location        TEXT,
  type            TEXT NOT NULL,
  approval_no     TEXT,
  manufactured_at TEXT,
  manufacturer    TEXT,
  prefix_code     TEXT,
  seal_no         TEXT,
  serial_no       TEXT,
  note            TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  status          TEXT NOT NULL DEFAULT 'active'
);

-- ── 2) 데이터 복사 (모든 컬럼 동일 순서) ──
INSERT INTO extinguishers_new (
  id, check_point_id, seq_no, zone, floor, mgmt_no, location, type,
  approval_no, manufactured_at, manufacturer, prefix_code, seal_no, serial_no, note,
  created_at, updated_at, status
)
SELECT
  id, check_point_id, seq_no, zone, floor, mgmt_no, location, type,
  approval_no, manufactured_at, manufacturer, prefix_code, seal_no, serial_no, note,
  created_at, updated_at, status
FROM extinguishers;

-- ── 3) 기존 테이블 DROP ──
DROP TABLE extinguishers;

-- ── 4) RENAME ──
ALTER TABLE extinguishers_new RENAME TO extinguishers;

-- ── 5) 인덱스 4개 재생성 (DROP TABLE 시 자동 삭제됨) ──
CREATE INDEX idx_extinguishers_cp        ON extinguishers(check_point_id);
CREATE INDEX idx_extinguishers_mgmt      ON extinguishers(mgmt_no);
CREATE INDEX idx_extinguishers_status    ON extinguishers(status);
CREATE INDEX idx_extinguishers_cp_active ON extinguishers(check_point_id, status);

-- ─── 공단 공식 검사이력 (ElevatorInspectsafeService / getInspectsafeList) ───
-- 호기(elevator_no)별 검사건 단위로 저장. 한 호기당 과거 10~20건 내외.
-- 자체점검(0061 koelsa_self_checks)와 별개이며, 민원24(0061 koelsa_inspections)와도 구분됨.
CREATE TABLE IF NOT EXISTS elevator_inspect_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  elevator_no TEXT NOT NULL,           -- cert_no 하이픈 제거, 7자리 (예: '2114971')
  fail_cd TEXT UNIQUE NOT NULL,        -- 공단 부적합코드(검사건 고유ID). 부적합 없어도 발급됨
  inspect_date TEXT,                   -- YYYY-MM-DD (inspctDe 변환)
  inspect_kind TEXT,                   -- inspctKindNm (설치/정기/수시/정밀)
  inspect_institution TEXT,            -- inspctInsttNm
  company_name TEXT,                   -- companyNm (유지관리업체)
  disp_words TEXT,                     -- 판정 (합격/보완/보완후합격/불합격)
  valid_start TEXT,                    -- YYYY-MM-DD (applcBeDt)
  valid_end TEXT,                      -- YYYY-MM-DD (applcEnDt)
  rated_speed TEXT,                    -- 정격속도 (원본 문자열 유지)
  rated_cap INTEGER,                   -- 정격용량 kg
  floor_count INTEGER,                 -- shuttleFloorCnt
  building_name TEXT,                  -- buldNm
  address TEXT,                        -- address1 + ' ' + address2
  raw_json TEXT,                       -- 전체 item 원본 JSON (향후 확장/디버그)
  fetched_at TEXT NOT NULL             -- ISO8601
);

CREATE INDEX IF NOT EXISTS idx_inspect_hist_elev
  ON elevator_inspect_history(elevator_no, inspect_date DESC);

-- ─── 부적합 상세 (ElevatorInspectsafeService / getInspectFailList) ───
-- elevator_inspect_history.fail_cd 기준 한 검사건당 0~N건.
-- 동기화 시 해당 fail_cd 에 대해 DELETE + 전체 INSERT (원자성 위해 배치).
CREATE TABLE IF NOT EXISTS elevator_inspect_fails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fail_cd TEXT NOT NULL,               -- elevator_inspect_history.fail_cd 참조
  fail_desc TEXT,                      -- 부적합 내용 요약
  fail_desc_inspector TEXT,            -- 검사자 상세 메모
  standard_article TEXT,               -- 규정 조항 번호 (예: '5.2.1.1')
  standard_title TEXT,                 -- 조항 제목 (standardTitle1)
  FOREIGN KEY(fail_cd) REFERENCES elevator_inspect_history(fail_cd)
);

CREATE INDEX IF NOT EXISTS idx_inspect_fails_code
  ON elevator_inspect_fails(fail_cd);

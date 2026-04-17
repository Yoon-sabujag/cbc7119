-- 공단 자체점검결과 캐시 (호기별 월별)
CREATE TABLE IF NOT EXISTS koelsa_self_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  elevator_no TEXT NOT NULL,
  yyyymm TEXT NOT NULL,
  inspect_date TEXT,
  start_time TEXT,
  end_time TEXT,
  inspector_name TEXT,
  sub_inspector_name TEXT,
  company_name TEXT,
  overall_result TEXT,
  confirm_date TEXT,
  regist_date TEXT,
  count_a INTEGER DEFAULT 0,
  count_b INTEGER DEFAULT 0,
  count_c INTEGER DEFAULT 0,
  count_d INTEGER DEFAULT 0,
  count_e INTEGER DEFAULT 0,
  issues_json TEXT DEFAULT '[]',
  items_json TEXT DEFAULT '[]',
  fetched_at TEXT NOT NULL,
  UNIQUE(elevator_no, yyyymm)
);

-- 민원24 검사결과 캐시 (고객안내번호+접수번호별)
CREATE TABLE IF NOT EXISTS koelsa_inspections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cstmr TEXT NOT NULL,
  recptn TEXT NOT NULL,
  building_name TEXT,
  address TEXT,
  inspect_institution TEXT,
  inspect_kind TEXT,
  inspect_count TEXT,
  inspect_result_summary TEXT,
  total_fee TEXT,
  elevators_json TEXT DEFAULT '[]',
  report_json TEXT DEFAULT '{}',
  fetched_at TEXT NOT NULL,
  UNIQUE(cstmr, recptn)
);

-- 안전관리자 캐시 (매번 17건 API 호출 방지)
CREATE TABLE IF NOT EXISTS koelsa_safety_managers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  elevator_no TEXT NOT NULL,
  manager_name TEXT,
  appoint_date TEXT,
  edu_date TEXT,
  valid_start TEXT,
  valid_end TEXT,
  is_registered INTEGER NOT NULL DEFAULT 0,
  fetched_at TEXT NOT NULL,
  UNIQUE(elevator_no)
);

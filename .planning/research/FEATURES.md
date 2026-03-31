# Feature Landscape: v1.1 New Features

**Domain:** Fire Safety / Facility Management PWA (4-person team, single building)
**Researched:** 2026-03-31 (v1.1 update; initial research 2026-03-28 also preserved below)
**Context:** v1.0 shipped. This update covers the new features for the v1.1 milestone.
**Confidence:** MEDIUM-HIGH

---

## What's Already Built (v1.0 — Do Not Rebuild)

| Feature | Status |
|---------|--------|
| JWT auth (employee ID + password, 4 accounts) | Done |
| Dashboard (inspection status, unresolved issues, schedule, elevator faults) | Done |
| Fire inspection (13 categories, zone/floor/location selection, result input, photos, action flow) | Done |
| QR scan inspection + QR print | Done |
| Monthly inspection calendar, schedule CRUD | Done |
| Excel report output — 10 types | Done |
| Work shift schedule (3-shift auto-generation, manual adjustment) | Done |
| Annual leave management (6 types) | Done |
| DIV pressure management (34 measurement points, trend charts) | Done |
| Building floor plans | Done |
| Elevator fault recording/history | Done |
| Daily work report with auto-fill | Done |
| Inspection schedule ↔ record linkage (dashboard completion sync) | Done |

---

## Table Stakes

Features users will expect as a matter of course. Missing any of these makes the feature feel incomplete or frustrating.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **BottomNav/SideMenu 재편** | 더보기 메뉴 제거 후 조치 메뉴가 직접 접근 가능해야 함. 네비게이션이 정리되지 않으면 신규 기능이 묻힘 | Low | Pure layout change, 0 DB migrations, unblocks everything else |
| **조치 관리: 미조치 목록** | Dashboard already surfaces 미조치 이슈 count — dedicated page is the natural destination | Low | Data exists: `check_records` with `status`, `resolution_memo`, `resolved_at`, `resolved_by` (migration 0012) |
| **조치 관리: 조치 등록 (메모 + 사진)** | Industry-standard closed-loop: every deficiency must be documented with action taken and photographic evidence | Medium | Needs `resolution_photo_key` column added to `check_records`. R2 upload mirrors existing inspection photo flow |
| **조치 관리: 미조치 → 완료 상태 전환** | Closed-loop: item moves open → resolved, dashboard count decrements | Low | PATCH `check_records.status = 'resolved'` |
| **조치 관리: 필터 (미조치/완료/전체, 날짜, 카테고리)** | Team reviews only open items daily; needs history search too | Low | Client-side filter is fine for 4 users |
| **법적 점검: 작동기능점검/종합점검 일정 등록** | 법적 의무: 특정소방대상물 — 작동기능점검 연 1회 + 종합정밀점검 연 1회. 소방서 보고 기한 점검 종료 후 15일 이내 | Medium | Two inspection types with legal deadlines; separate from daily self-inspections |
| **법적 점검: 결과 및 지적사항 기록** | 지적사항 이행계획서는 점검 후 15일 이내 소방서 제출. 이행 완료 보고는 완료 후 10일 이내 | Medium | Per-deficiency status tracking. Keep simple: list + status column, not a state machine |
| **법적 점검: 서류 첨부 (PDF/이미지)** | 소방서 제출 보고서, 점검업체 점검표, 이행계획서 등 내부 보관 필요 | Low-Med | R2 file upload; list + download. Mirror existing R2 upload pattern |
| **승강기 법정검사: 검사 기록 (연 1회)** | 승강기 안전관리법: 정기검사 주기 1년 (25년 이상 기기는 6개월). 11대 각각의 만료일 추적 필요 | Low-Med | `elevators` 테이블에 `last_inspection`, `next_inspection` 컬럼 이미 존재. New `elevator_inspections` table for result records |
| **보수교육: 일정 + 이수 기록** | 소방안전관리자 선임 후 6개월 이내 최초 교육, 이후 2년마다 실무교육 의무. 미이수 시 자격 박탈 | Low-Med | Simple CRUD. 4명 각각의 교육 만료일 추적 |
| **식사 이용 기록: 개인별 체크인** | 구내식당 이용 여부를 날짜별로 기록. 월별 식비 정산 근거로 사용 | Low | Simple `cafeteria_records` table: staff_id + date + meal_type |
| **관리자 설정: 직원 정보 수정** | 비밀번호 변경, 직함 수정은 운영 중 필수. admin-only | Low | PATCH `/api/staff/:id` |
| **점검자 이름 동적 로딩** | 하드코딩된 점검자 목록 제거 — `staff` 테이블 기반으로 동적 로딩 | Low | Tech debt removal. Single source of truth |

---

## Differentiators

Features that go beyond bare minimum and add real team value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **조치 관리: 담당자 배정 + 기한 설정** | "이 불량 개소는 박보융이 3일 내 처리" — accountability without email threads | Medium | Add `assignee_id`, `due_date` to `check_records` or a separate `remediation_tasks` table |
| **조치 관리: 대시보드 미조치 카운트 연동** | Dashboard count decrements when resolved → satisfying "zero" target for team | Low | Already partially wired; just needs resolved status to filter out correctly |
| **법적 점검: D-day 알림 배너** | "종합점검 D-14" 배너 on dashboard — proactive reminder without push notifications | Low | Compute days-until from scheduled date; render badge/banner in dashboard |
| **법적 점검: 지적사항 → 조치관리 연동** | 법적 점검 지적사항이 조치관리 페이지로 자동 유입 — unified remediation list | Medium | Add `source_type` ('daily_inspection' \| 'legal_inspection') to remediation records |
| **승강기 법정검사: 만료 임박 경고** | 30일 전 대시보드 경고 배지. Mirrors legal inspection D-day pattern | Low | Computed from `next_inspection` column already in `elevators` table |
| **식당 메뉴표 관리** | 주간/일별 메뉴를 admin이 등록, 당직 근무자가 확인 | Medium | New `cafeteria_menus` table: date + meal_type + menu_text (+ optional image in R2) |
| **식사 기록: 월별 통계** | 개인별 월 식사 횟수 집계, 식비 정산 엑셀 출력 가능 | Low | Simple GROUP BY; optionally add to existing Excel export surface |
| **보수교육: 만료 임박 경고** | D-30 대시보드 경고. Legal consequence (자격 박탈)이 크므로 중요도 높음 | Low | Computed from `next_due_date` in education records |
| **보수교육: 이수증 첨부** | 한국소방안전원 발급 이수증 PDF를 R2에 보관 | Low | R2 upload, mirrors legal inspection document pattern |
| **관리자 설정: 햄버거 메뉴 항목 구성** | Admin이 사이드 메뉴 표시 항목을 직접 구성 | Medium | Store config in `site_config` D1 table (key-value) or Worker KV; admin UI for toggle/reorder |
| **streakDays 계산** | 대시보드 연속 달성일 — gamification for team motivation | Low | COUNT consecutive days with at least 1 inspection session |

---

## Anti-Features

Features to explicitly NOT build in v1.1.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Web Push / 소방서 기한 자동 리마인더** | PROJECT.md 명시 제외. iOS PWA push unreliable below iOS 16.4. 4인 팀에 과도 | D-day 배너 UI로 충분 |
| **식사 결제 / 포인트 시스템** | 이용 여부 체크인이 목적. 회계 시스템 연동은 범위 밖 | 식사 횟수 카운트만 |
| **교육 이수증 자동 생성** | 이수증은 한국소방안전원에서만 발급. 시스템이 생성 불가 | PDF 첨부 업로드로 대체 |
| **AI 보고서 자동생성** | PROJECT.md에서 별도 마일스톤 명시 | 현재 범위 밖 |
| **법적 점검 외부 공유 포털** | 소방서 제출은 safeland.go.kr 등 외부 시스템 | 파일 첨부 다운로드로 대체 |
| **승강기 원격 모니터링 / KOELSA API 연동** | 불필요한 외부 의존성. 4인 팀 수동 기록으로 충분 | 수동 기록 유지 |
| **복수 건물 지원** | 단일 건물 전용 시스템 | 단일 건물 유지 |
| **모바일 오프라인 점검** | PROJECT.md에서 명시 제외 ("현재 네트워크 환경 충분") | 온라인 전용 유지 |
| **복잡한 권한 매트릭스 (RBAC)** | 4인, 2역할(admin/assistant). 이진 롤 체크로 충분 | 기존 role check 유지 |
| **점검 이력 삭제 기능** | 데이터 삭제 불가 원칙 (PROJECT.md constraint) | 비활성화(soft-delete)만 허용 |

---

## Feature Dependencies

```
check_records (result='bad'/'caution', status='open')
  └── 조치 관리 페이지 [DATA EXISTS — migration 0012 complete]
      └── resolution_photo_key column [needs 1 migration]
      └── 대시보드 미조치 카운트 연동 [low effort wire-up]
      └── 법적 점검 지적사항 연동 [add source_type field]

BottomNav 재편
  └── 조치 관리 메뉴 신규 진입점 [navigation must land before page is reachable]
  └── 승강기 메뉴 이동 [SideMenu reorganization]

staff 테이블 (dynamic loading)
  └── 점검자 이름 동적화 [removes hardcoded list]
  └── 식사 기록 (staff_id FK)
  └── 보수교육 기록 (staff_id FK)
  └── 관리자 설정 (user edit)

elevators 테이블 (last_inspection, next_inspection columns exist)
  └── elevator_inspections 신규 테이블 [검사 결과 기록]
      └── 만료 임박 경고 (D-day 계산)

legal_inspections 신규 테이블
  └── legal_inspection_issues 신규 테이블 (지적사항)
      └── D-day 배너 (대시보드)
      └── 조치관리 연동 (source_type='legal_inspection')

cafeteria_records 신규 테이블
  └── 월별 통계 (GROUP BY query)
  └── cafeteria_menus 신규 테이블 (differentiator, optional)

education_records 신규 테이블
  └── 만료 임박 경고
  └── R2 이수증 첨부 (mirrors existing upload pattern)

site_config D1 table (or KV)
  └── 관리자 설정: 메뉴 구성
```

---

## MVP Recommendation

Prioritize in this order:

1. **BottomNav/SideMenu 재편** — 0 DB work. Unblocks all new page entries. Land first.
2. **조치 관리 페이지** — Data is 90% in DB already (migration 0012). 1 column migration. Highest daily-use value. Dashboard integration completes 미조치 loop.
3. **점검자 이름 동적 로딩 + streakDays** — Low complexity, removes tech debt, completes existing dashboard.
4. **승강기 법정검사** — Existing `elevators` table has the columns. 1 new table. Legal obligation (승강기 안전관리법 연 1회).
5. **법적 점검 관리** — 2 new tables. Legal obligation (소방시설법 연 2회). D-day UI is high-value differentiator.
6. **보수교육 관리** — 1 new table. Legal obligation (2년 주기). Simple CRUD + file upload.
7. **식사 이용 기록 + 메뉴표** — 2 new tables. Lowest urgency but frequently requested by team.
8. **관리자 설정** — Admin-only CRUD. Milestone wrap-up.

Defer to v1.2: AI report generation, push notifications, offline PWA, multi-building.

---

## Domain Context: Korean Legal Requirements (Verified)

### 소방시설 자체점검 (Fire Facility Self-Inspection)
- **작동기능점검 (Operational Function Check):** 연 1회. 소방시설이 작동하는지 기능 점검.
- **종합정밀점검 (Comprehensive Inspection):** 연 1회 이상 (특급은 연 2회). 외부 소방시설 관리업체 수행.
- **보고 기한:** 점검 종료 후 **15일 이내** 소방서에 결과 보고서 + 이행계획서 제출.
- **이행 완료 보고:** 이행 완료 후 **10일 이내** 소방서 보고.
- **Confidence:** MEDIUM-HIGH (easylaw.go.kr, busan.go.kr 공지사항, law.go.kr 법령 확인)

### 승강기 법정검사 (Elevator Legal Inspection)
- **정기검사:** 주기 **연 1회** (설치 25년 이상 기기는 **6개월** 주기). 검사기간 = 만료일 전후 **30일 이내**.
- **정밀안전검사:** **3년마다** 1회.
- **차바이오컴플렉스:** 승객용 5대, 화물용 2대, 덤웨이터 2대, 에스컬레이터 2대 = 총 11대.
- **Confidence:** HIGH (law.go.kr 승강기 안전관리법, keso.kr, koelsa.or.kr 확인)

### 소방안전관리자 보수교육 (Safety Manager Continuing Education)
- **주기:** 최초 선임 후 **6개월 이내** 강습교육. 이후 **2년마다 1회** 실무교육 의무.
- **위반 시:** 적발일로부터 3개월 이내 수시교육.
- **교육 기관:** 한국소방안전원 (kfsi.or.kr).
- **Confidence:** HIGH (kfsi.or.kr, 다수 법령 출처 일치)

---

## Complexity Summary

| Feature Group | New DB Tables | New Migrations | New API Endpoints | New Pages/Sections | Complexity |
|---------------|---------------|----------------|-------------------|---------------------|------------|
| BottomNav 재편 | 0 | 0 | 0 | layout change only | Low |
| 조치 관리 | 0 (+1 column) | 1 | 2–3 | 1 page | Medium |
| 점검자 동적 + streakDays | 0 | 0 | 0 (reuse existing) | 0 (code-only) | Low |
| 승강기 법정검사 | 1 | 1 | 3 | 1 section in ElevatorPage | Low-Med |
| 법적 점검 관리 | 2 | 1 | 4–5 | 1 page | Medium |
| 보수교육 관리 | 1 | 1 | 3 | 1 page | Low-Med |
| 식사 이용 기록 | 2 | 1 | 4 | 1 page | Medium |
| 관리자 설정 | 0–1 | 0–1 | 2–3 | 1 page | Low-Med |

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| 조치 관리 | `check_records.status` 기본값이 'open'이 아닌 기존 bad/caution 레코드가 있을 수 있음 | Backfill migration: `UPDATE check_records SET status='open' WHERE result IN ('bad','caution') AND status IS NULL` |
| 법적 점검 지적사항 | 지적사항 추적을 조치관리와 통합하면 `source_type` 필드가 조치관리 쿼리를 복잡하게 만들 수 있음 | 1단계: 지적사항 별도 테이블로 독립 구현. 2단계(v1.2)에서 통합 |
| 승강기 법정검사 | 11대 각각의 검사 만료일이 다름 — 일괄 알림 UI 설계 복잡 | 대시보드에 "만료 임박 승강기 N대" 단일 배지. 상세는 ElevatorPage에서 |
| 식사 메뉴표 | 이미지 포함 메뉴표는 R2 업로드 + 표시 로직이 필요 — 출시 복잡도 높아짐 | 1단계: 텍스트 메뉴만. 이미지는 v1.2 |
| 관리자 설정: 메뉴 구성 | D1 KV 또는 별도 config 테이블 — 어느 쪽이든 구현 가능하나 일관성 필요 | `site_config` D1 table (key TEXT, value TEXT) 단순 패턴 사용 |
| BottomNav iOS | PROJECT.md: iOS PWA safe-area-inset BottomNav 이슈 건드리지 말 것 | BottomNav 높이/패딩 수정 없이 항목 순서/내용만 변경 |

---

## Sources

- PROJECT.md requirements: `/Users/jykevin/Documents/20260328/.planning/PROJECT.md` (HIGH confidence — primary source)
- DB migrations 0001–0032: `/Users/jykevin/Documents/20260328/cha-bio-safety/migrations/` (HIGH confidence — current schema)
- [소방시설 자체점검 의무 — 찾기쉬운 생활법령정보](https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1574&ccfNo=4&cciNo=4&cnpClsNo=1) — MEDIUM confidence
- [부산소방재난본부 자체점검 결과보고서 서식 공지](https://119.busan.go.kr/119total/1455139) — MEDIUM confidence
- [승강기 검사 종류 및 시기 — 찾기쉬운 생활법령정보](https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1169&ccfNo=4&cciNo=1&cnpClsNo=1) — HIGH confidence
- [한국승강기안전원 검사안내 (keso.kr)](https://www.keso.kr/check/c1) — HIGH confidence
- [승강기민원24 검사안내 (koelsa.or.kr)](https://minwon.koelsa.or.kr/SubPage.do?pageid=sub00077) — HIGH confidence
- [한국소방안전원 교육이수 시스템 (kfsi.or.kr)](https://www.kfsi.or.kr/mobile/edu/Main.do?_menuNo=3860) — HIGH confidence
- [소방안전관리자 실무교육 주기 — 법령 정리](https://jb.marryeight.com/entry/%EC%86%8C%EB%B0%A9%EC%95%88%EC%A0%84%EA%B4%80%EB%A6%AC%EC%9E%90-%EC%8B%A4%EB%AC%B4%EA%B5%90%EC%9C%A1-%EC%A3%BC%EA%B8%B0-6%EA%B0%9C%EC%9B%94-VS-2%EB%85%84) — MEDIUM confidence
- [Fire Inspection Software corrective action patterns — BlazeStack 2026](https://www.blazestack.com/blog/fire-safety-software) — LOW confidence (general SaaS, reference only)
- [Bottom Navigation UX 2025 — AppMySite](https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/) — MEDIUM confidence

# CHA Bio Complex Fire Safety Management System - System Overview

## 1. Project Summary

**CHA Bio Complex (차바이오컴플렉스) Fire Safety Management System**

- Location: 경기도 성남시 분당구 판교로 335
- Users: 방재팀 4인 (관리자 1, 보조자 3)
- Type: Progressive Web App (PWA)
- Platform: Cloudflare Pages + D1 + R2 + Workers

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.3 + TypeScript 5.6 + Vite 5.4 |
| Styling | Tailwind CSS 3.4 + CSS Variables (다크 테마) |
| State | Zustand 5.0 (auth) + React Query 5.59 (server state) |
| Backend | Cloudflare Pages Functions (serverless) |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 (파일/사진) |
| Auth | JWT (HS256, 12시간 만료) |
| PWA | Vite PWA 0.21 + Workbox (서비스워커) |
| Push | Web Push API + VAPID |
| Cron | Cloudflare Workers (별도 프로젝트: cbc-cron-worker) |
| Desktop Tool | PowerShell 와치독 (파일 자동 분류) |

## 3. Infrastructure

### 3.1 Cloudflare Bindings

| Binding | Type | Name |
|---------|------|------|
| DB | D1 Database | cha-bio-db |
| STORAGE | R2 Bucket | cha-bio-storage |
| JWT_SECRET | Environment Variable | (secret) |

### 3.2 Cron Worker (cbc-cron-worker)

| Schedule | Time (KST) | Function |
|----------|-----------|----------|
| `45 23 * * *` | 매일 08:45 | 일일 알림 (점검일정, 미완료, 미조치, 교육 D-30) |
| `*/5 * * * *` | 5분마다 | 행사 알림 (15분전, 5분전) |

- 근무 중인 직원만 알림 발송 (비번/휴무/연차/공가 제외)
- 3교대 근무 패턴 + 연차 테이블 기반 필터링

### 3.3 Desktop Watchdog (cha-bio-safety-watchdog)

- Platform: Windows 7+ (PowerShell 2.0+)
- 기능: 다운로드 폴더 감시 → 파일명 패턴 매칭 → 지정 폴더 자동 이동
- Chrome 백그라운드 실행 자동 활성화 (레지스트리)
- 시스템 트레이 상주

**감시 파일 패턴 (6그룹):**

| Group | Files |
|-------|-------|
| 1. 업무 계획 및 일지 | 일별/월별 업무일지, 수행기록표, 월간/연간 추진계획 |
| 2. 각종 운영 문서 | 월별근무표, 휴가신청서 |
| 3. 점검 및 조치 | 일상점검 조치보고서, 소방점검 지적사항 |
| 4. 소방설비점검일지 | DIV(월초/월말), 소화전, 비상콘센트, 청정소화약제, 피난방화, 방화셔터, 제연, 자탐, 소방펌프, 전체 일괄 |
| 5. QR 코드 | 소화기, 소화전, DIV, 청정, 완강기, 댐퍼, 셔터 점검용 QR PDF |
| 6. 백업 | DB 백업(.sql), 파일 백업(.zip) |

---

## 4. Authentication & Authorization

### 4.1 Login

- 직원 선택 그리드 (4인) → 비밀번호 입력 → JWT 발급
- JWT 12시간 만료, localStorage 저장 (Zustand persist)
- 401 응답 시 자동 로그아웃 + 로그인 페이지 리다이렉트

### 4.2 Roles

| Role | Label | Permissions |
|------|-------|-------------|
| admin | 관리자 | 전체 기능 + 직원 관리 + 점검개소 관리 + 백업/복원 + 직원 비밀번호 초기화 |
| assistant | 보조자 | 점검 기록 입력, 일정 관리, 일지 출력 등 일반 업무 |

### 4.3 Shift System (3교대)

- 기준일: 2026-03-01 (박보융 = 당직)
- 순환: 당(night) → 비(off) → 주(day), 3일 주기
- 석현민(방재책임): 평일 주간 고정, 주말/공휴일 휴무
- 공휴일 판정: `@hyunbinseo/holidays-kr` 라이브러리

| Shift | Label | Color |
|-------|-------|-------|
| 당 (Night) | 당직 | Red #ef4444 |
| 비 (Off) | 비번 | Blue #3b82f6 |
| 주 (Day) | 주간 | Orange #f59e0b |
| 휴 (Leave) | 휴무 | Gray #6b7280 |

---

## 5. Navigation Structure

### 5.1 Mobile

- **Bottom Nav** (5 tabs): 대시보드, 점검, QR스캔(강조), 조치(배지), 승강기
- **Side Menu** (드로어): 커스터마이즈 가능 (섹션/항목 순서 변경, 표시/숨김)
- **Settings Panel** (오른쪽 슬라이드)

### 5.2 Desktop (1920x1080)

- **Left Sidebar** (280px): 접이식 섹션 (점검현황, 시설관리, 문서관리, 직원관리)
- **Settings Panel** (오른쪽 슬라이드)

---

## 6. Pages & Routes

### 6.1 Authentication

| Route | Page | Description |
|-------|------|-------------|
| `/` | SplashScreen | 로딩/PWA 설치 프롬프트 |
| `/login` | LoginPage | 직원 선택 + 비밀번호 |

### 6.2 Dashboard

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | DashboardPage | 금일 현황, 점검 통계, 근무자 정보, 수신반 이력, 월간 진행률 |

**Dashboard Features:**
- 금일 점검 일정 목록 (상태별 색상, 완료 처리 버튼)
- 점검 통계 (전체/완료/미조치/승강기고장)
- 금일 근무자 칩 (근무유형 + 연차 표시)
- 최근 수신반 이력 (48시간)
- 월간 점검 진행 도넛차트
- 30초 자동 새로고침

### 6.3 Inspection & Remediation

| Route | Page | Description |
|-------|------|-------------|
| `/inspection` | InspectionPage | 점검 기록 입력 (구역/층/개소 선택, 결과/메모/사진) |
| `/inspection/qr` | QRScanPage | QR 스캔 → 개소 자동 매칭 → 즉시 점검 |
| `/remediation` | RemediationPage | 불량/주의 항목 목록 (미조치/완료 필터, 보고서 다운로드) |
| `/remediation/:recordId` | RemediationDetailPage | 조치 기록 (메모, 자재, 사진 업로드, 조치완료/취소) |

**Inspection Categories (15):**
소화기·소화전, 특별피난계단, 청정소화약제, 전실제연댐퍼, 주차장비·회전문, 소방용전원공급반, 방화셔터, DIV, 유도등, 배연창, 완강기, 소방펌프, 자동화재탐지설비, CCTV

**Check Results:**
- 정상 (normal) - Green
- 주의 (caution) - Yellow
- 불량 (bad) - Red

### 6.4 Elevator Management

| Route | Page | Description |
|-------|------|-------------|
| `/elevator` | ElevatorPage | 호기 목록, 고장/수리/점검 이력, 연간 점검 (5개 탭) |
| `/elevator/findings/:fid` | ElevatorFindingDetailPage | 점검 지적사항 상세 (이미지 핀치줌) |

**Elevator Tabs:**
1. 호기 목록 — 상태(정상/고장/정비/사용중지), 활성 고장 수
2. 고장 이력 — 고장 접수/처리
3. 수리 이력 — 수리 기록 관리
4. 점검 이력 — 정기 점검 기록
5. 연간 점검 — 검사 기관 점검 (인증서 업로드)

### 6.5 Scheduling & Planning

| Route | Page | Description |
|-------|------|-------------|
| `/schedule` | SchedulePage | 월간 점검 일정 생성/관리 (19개 카테고리, 자동생성) |
| `/workshift` | WorkShiftPage | 월간 근무표 (직원×일 매트릭스, 엑셀 다운로드) |
| `/annual-plan` | AnnualPlanPage | 연간 업무추진계획 미리보기 + 엑셀 다운로드 |

### 6.6 Reports & Documents

| Route | Page | Description |
|-------|------|-------------|
| `/reports` | ReportsPage | 소방설비 점검일지 생성 (10종, 엑셀 다운로드, 미리보기) |
| `/daily-report` | DailyReportPage | 일별업무일지 (금일/명일 내용, 점검결과, 엑셀 월별 출력) |
| `/worklog` | WorkLogPage | 소방안전관리자 업무수행기록표 (엑셀 출력) |
| `/documents` | DocumentsPage | 소방계획서 / 소방훈련자료 보관소 (업로드/다운로드) |

**Report Types (10):**
1. DIV 점검표 (월초)
2. DIV 점검표 (월말)
3. 옥내소화전 점검일지
4. 청정소화약제 점검일지
5. 비상콘센트 점검일지
6. 피난방화시설 점검일지
7. 방화셔터 점검일지
8. 제연설비 점검일지
9. 자동화재탐지설비 점검일지
10. 소방펌프 점검일지

### 6.7 Facility Management

| Route | Page | Description |
|-------|------|-------------|
| `/div` | DivPage | DIV 압력 트렌드 (34개 측정점), 배수/오일 주기 관리 |
| `/floorplan` | FloorPlanPage | 건물 도면 마커 관리 (유도등/감지기/스프링클러/소화기) |
| `/checkpoints` | CheckpointsPage | 점검 개소 마스터 관리 (CRUD) |
| `/qr-print` | QRPrintPage | QR 코드 라벨 생성 (카테고리별 선택 → PDF 출력) |

**Floor Plan Marker Types:**
- 유도등: 천장출구, 벽면출구, 거실통로, 복도통로, 계단통로, 객석통로
- 감지기: 연기, 열
- 스프링클러: 폐쇄형, 개방형, 킹형, 시험밸브
- 소화기·소화전: 분말3.3kg, 분말20kg, 할로겐, K급주방, 소화전, 완강기, DIV

**Floor Plan Features:**
- 마커 편집 모드 (추가/이동/삭제)
- 소화기 새로 등록 (마커 추가 시 즉시 DB 생성)
- 인라인 점검 기록 입력 (소화기 상세정보 표시)
- 마커 상태 색상 (정상/주의/불량/미점검)

### 6.8 Staff & HR

| Route | Page | Description |
|-------|------|-------------|
| `/staff-manage` | StaffManagePage | 직원 CRUD (관리자 전용) |
| `/staff-service` | StaffServicePage | 연차 관리 + 식사 이용 기록 |
| `/education` | EducationPage | 교육 이수 현황 (D-day 배지, 초임/보수교육) |

**Leave Types:**
- 연차 (full day)
- 오전반차 (half_am)
- 오후반차 (half_pm)
- 공가 (official)

### 6.9 Legal Compliance

| Route | Page | Description |
|-------|------|-------------|
| `/legal` | LegalPage | 법정 소방점검 회차 관리 (종합/작동 점검) |
| `/legal/:id` | LegalFindingsPage | 회차별 지적사항 목록 (추가/삭제) |
| `/legal/:id/finding/:fid` | LegalFindingDetailPage | 지적사항 상세 + 조치 기록 + zip 다운로드 |

### 6.10 Public

| Route | Page | Description |
|-------|------|-------------|
| `/e/:checkpointId` | ExtinguisherPublicPage | 소화기 점검표 (QR 스캔 → 공개 페이지, 인증 불필요) |

---

## 7. Settings Panel

**Sections (접이식):**

### 7.1 알림

| Item | Description |
|------|-------------|
| 푸시 알림 토글 | 구독/해제 + 권한 상태 배지 (허용됨/차단됨/미설정) |
| 금일 점검 일정 | 매일 08:45 |
| 전일 미완료 점검 | 매일 08:45 |
| 미조치 항목 | 매일 08:45 |
| 행사 15분 전 | 행사 시작 15분 전 |
| 행사 5분 전 | 행사 시작 5분 전 |
| 교육 D-30 | 교육일 30일 전 |

### 7.2 메뉴 설정

- 메뉴 항목 순서 변경 (위/아래 화살표)
- 항목 표시/숨김 토글
- 섹션 구분선 추가/이름변경/삭제
- 기본값 초기화 / 저장 버튼

### 7.3 화면

| Item | Options |
|------|---------|
| 테마 | 다크 / 라이트 / 시스템 |
| 주간 현황 기준 | 이번 주 / 최근 7일 |
| 결과 즉시 저장 | 토글 |

### 7.4 계정

| Item | Description |
|------|-------------|
| 개인정보 수정 | 연락처, 이메일 편집 |
| 비밀번호 변경 | 현재 비밀번호 확인 후 변경 (4자 이상) |

### 7.5 데이터베이스 (관리자 전용)

| Item | Description |
|------|-------------|
| DB 백업 | D1 전체를 .sql 파일로 다운로드 |
| DB 업로드 | .sql 파일로 DB 복원 |
| 파일 백업 | R2 사진을 .zip으로 다운로드 (documents/, preview/, backups/ 제외) |
| 파일 업로드 | .zip 파일에서 R2 복원 |

**파일 백업 동작:**
- DB에서 마지막 백업 날짜 추적 (app_settings)
- 크론 zip이 있으면 새 것만 다운로드 + 이후 delta zip 별도 다운로드

### 7.6 앱 정보

| Item | Description |
|------|-------------|
| 버전 | v{VERSION} ({BUILD_TIME}) |
| 캐시 초기화 | 서비스워커 캐시 삭제 + 새로고침 |
| 주소 | 차바이오컴플렉스 방재 / 경기도 성남시 분당구 판교로 335 |

### 7.7 로그아웃

- 빨간색 버튼, 즉시 로그아웃 + 로그인 페이지 이동

---

## 8. API Endpoints Summary

### 8.1 Authentication (3)
- POST `/api/auth/login` — 로그인
- PUT `/api/auth/profile` — 프로필 수정
- POST `/api/auth/change-password` — 비밀번호 변경

### 8.2 Staff (5)
- GET/POST `/api/staff` — 직원 목록/생성
- GET/PUT `/api/staff/:id` — 직원 상세/수정
- POST `/api/staff/:id/reset-password` — 비밀번호 초기화

### 8.3 Schedule (2)
- GET/POST `/api/schedule` — 일정 조회/생성

### 8.4 Inspections (3)
- GET/POST `/api/inspections` — 세션 조회/생성
- GET `/api/inspections/records` — 점검 기록 조회

### 8.5 Checkpoints (3)
- GET/POST `/api/check-points` — 개소 조회/생성
- GET `/api/checkpoints` — 상세 필터링 조회

### 8.6 Remediation (3)
- GET `/api/remediation` — 불량 항목 목록
- GET `/api/inspections/records/:id/resolve` — 조치 완료
- GET `/api/inspections/records/:id/unresolve` — 조치 취소

### 8.7 Elevators (8)
- GET/PATCH `/api/elevators` — 목록/상태 변경
- GET `/api/elevators/faults` — 고장 이력
- GET `/api/elevators/inspections` — 점검 이력
- GET `/api/elevators/next-inspection` — 다음 점검일
- GET `/api/elevators/repairs` — 수리 이력
- GET `/api/elevators/:eid/inspections/:iid/cert` — 인증서
- GET `/api/elevators/:eid/inspections/:iid/findings` — 지적사항

### 8.8 Fire Safety (5)
- GET/POST `/api/fire-alarm` — 수신반 이력
- GET `/api/extinguishers` — 소화기 목록
- POST `/api/extinguishers/create` — 소화기 신규 등록
- GET `/api/extinguishers/:cpId` — 소화기 상세

### 8.9 Legal (4)
- GET `/api/legal` — 법정점검 회차
- GET `/api/legal/:id/findings` — 지적사항 목록
- GET `/api/legal/:id/findings/:fid/resolve` — 지적사항 조치

### 8.10 Floor Plan (5)
- GET/POST `/api/floorplan-markers` — 마커 조회/생성
- GET/PUT/DELETE `/api/floorplan-markers/:id` — 마커 상세/수정/삭제

### 8.11 Documents (5)
- GET `/api/documents` — 문서 목록
- GET/DELETE `/api/documents/:id` — 다운로드/삭제
- POST `/api/documents/multipart/*` — 대용량 업로드 (create/upload-part/complete/abort)

### 8.12 DIV (4)
- GET/POST/DELETE `/api/div/logs` — 배수/오일 로그
- GET `/api/div/pressure` — 압력 데이터

### 8.13 Leaves & Holidays (6)
- GET/POST `/api/leaves` — 연차 조회/신청
- GET/PUT/DELETE `/api/leaves/:id` — 상세/수정/삭제
- GET `/api/holidays` — 공휴일

### 8.14 Education (3)
- GET/POST `/api/education` — 교육 목록/등록
- GET `/api/education/:id` — 교육 상세

### 8.15 Reports & Dashboard (5)
- GET `/api/dashboard/stats` — 대시보드 통계
- GET `/api/daily-report/index` — 일일 리포트 데이터
- GET `/api/daily-report/notes` — 일일 메모
- GET `/api/reports/div` — DIV 리포트
- GET `/api/reports/check-monthly` — 월간 점검 현황

### 8.16 Menu & Meal (4)
- GET/POST `/api/menu` — 식단 조회/등록
- GET/POST `/api/meal` — 식사 기록

### 8.17 Work Logs (3)
- GET/POST `/api/work-logs` — 업무일지
- GET `/api/work-logs/:ym/preview` — 미리보기

### 8.18 Push Notifications (5)
- GET/POST `/api/push/subscribe` — 구독 상태/등록
- POST `/api/push/unsubscribe` — 구독 해제
- GET `/api/push/vapid-public-key` — VAPID 키
- POST `/api/push/preferences` — 알림 설정

### 8.19 Database & Backup (7)
- GET `/api/database/backup` — DB 백업 (SQL)
- POST `/api/database/restore` — DB 복원
- GET/PUT `/api/database/backup-status` — 백업 상태
- GET `/api/database/r2-list` — R2 파일 목록
- GET `/api/database/r2-download` — R2 파일 다운로드
- POST `/api/database/r2-upload` — R2 파일 업로드
- GET `/api/database/r2-backup` — R2 서버측 ZIP 백업

### 8.20 Uploads & Utilities (3)
- GET `/api/uploads/[[path]]` — 파일 조회
- POST `/api/uploads` — 파일 업로드
- GET `/api/health` — 헬스체크

### 8.21 Settings (1)
- GET `/api/settings/menu` — 메뉴 설정

---

## 9. Database Tables (32)

| Category | Tables |
|----------|--------|
| Staff/Auth | staff, push_subscriptions |
| Inspection | check_points, check_records, inspection_sessions |
| Extinguisher | extinguishers, fire_extinguishers |
| Fire Equipment | fire_equipment_specs, fire_facility_inventory, fire_alarm_records |
| Elevator | elevators, elevator_inspections, elevator_faults, elevator_repairs, elevator_inspection_findings |
| DIV | div_pressures, div_pressure_records, div_compressor_log, div_drain_log |
| Floor Plan | floor_plan_markers |
| Schedule/Leave | schedule_items, annual_leaves, work_logs |
| Legal | legal_findings, documents, education_records |
| Other | app_settings, daily_notes, holidays, meal_records, weekly_menus |

---

## 10. R2 Storage Structure

| Folder | Contents | Backup |
|--------|----------|--------|
| inspections/ | 점검 사진 (JPG, 압축) | O |
| documents/ | 소방계획서, 훈련자료 (대용량) | X |
| preview/ | 엑셀 미리보기 | X |
| backups/ | 자동/수동 백업 | X |
| legal/ | 법정점검 보고서 | O |

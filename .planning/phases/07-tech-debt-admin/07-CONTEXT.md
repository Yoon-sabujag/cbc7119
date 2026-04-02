# Phase 7: Tech Debt + Admin - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

점검자 이름 하드코딩 제거(STAFF_ROLES → DB 동적 로딩) + 관리자 전용 설정 페이지(직원 CRUD, 개소 관리). streakDays 계산(TECH-02)은 보류, 햄버거 메뉴 배치(ADMIN-03)는 v1.1 제외.

</domain>

<decisions>
## Implementation Decisions

### 관리자 페이지 구성
- **D-01:** 탭 네비게이션 — 직원관리 / 시스템설정 2탭 구성 (ADMIN-03 메뉴배치 제외로 3탭→2탭)
- **D-02:** API + 프론트 이중 role-guard — API에 admin role-guard 미들웨어 + 프론트에서 role!='admin'이면 /dashboard 리디렉션
- **D-03:** assistant 역할에게 SideMenu '관리자 설정' 항목 미노출 (admin만 표시, soon:true 제거)

### 직원 계정 관리 (ADMIN-01)
- **D-04:** 비밀번호 초기화: 고정 초기 PW (사번 뒷자리 4자리 등 고정 규칙). 4인 팀이라 구두 전달 가능
- **D-05:** 삭제 정책: 비활성화(active 플래그). 점검 기록 FK 보존을 위해 완전 삭제 불가
- **D-06:** 필드 확장: phone(연락처, 전체), appointed_at(선임일자, 전체), email(이메일, 소방안전관리자만 필요 → 선택)
- **D-07:** 입사일은 별도 필드 불필요 — staff.id 앞 8자리에서 파싱 (예: 2018042451 → 2018-04-24)
- **D-08:** 기존 DB 필드 유지: id, name, role(admin/assistant), title

### 시스템 설정 — 개소 관리 (ADMIN-02)
- **D-09:** 카테고리 13개는 고정 조회 전용 (CRUD 불가). 카테고리 추가는 점검 페이지 UI 연쇄 변경 필요 → v1.2 이후
- **D-10:** 개소(check_points)만 CRUD: 추가 / 수정 / 비활성화. 점검 기록 FK 보존을 위해 삭제 불가
- **D-11:** 개소 관리 UI: 카테고리 드롭다운 선택 → 해당 카테고리 개소 리스트 표시. 점검 페이지의 카테고리→개소 흐름과 동일 패턴

### 라우팅 및 네비게이션
- **D-12:** /admin을 NO_NAV_PATHS에 추가 — BottomNav/글로벌헤더 숨김, 자체 헤더(← 뒤로가기) 표시
- **D-13:** 관리자 페이지는 단일 라우트 /admin (탭 전환은 컴포넌트 내부 상태)

### 마이그레이션 전략
- **D-14:** ALTER TABLE + 기본값 방식 — phone/email NULL 허용, appointed_at NULL 허용, check_points.active DEFAULT 1
- **D-15:** 기존 4인 데이터 손실 없음. 배포 후 관리자가 직접 정보 입력

### Tech Debt (TECH-01)
- **D-16:** GET /api/staff 엔드포인트 신규 생성 + useStaffList() 훅으로 동적 로딩
- **D-17:** DashboardPage.tsx STAFF_ROLES 하드코딩 제거, shiftCalc.ts 등도 동적 로딩 전환

### Claude's Discretion
- 고정 초기 PW의 구체적 규칙 (사번 뒷 4자리 등)
- 개소 리스트 카드/테이블 디자인 (기존 앱 스타일과 일관성 유지)
- 직원 목록 표시 순서 (이름순, 사번순 등)
- admin role-guard 미들웨어 구현 방식 (공통 헬퍼 vs 인라인)

### Scope Adjustments
- **TECH-02 streakDays 보류:** 연속 달성일 계산은 v1.1에서 제외. stats.ts의 `streakDays: 0` 유지
- **ADMIN-03 메뉴배치 제외:** 햄버거 메뉴 순서/표시 설정은 v1.1에서 제외. 필요시 v1.2에서 추가

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### DB Schema
- `cha-bio-safety/migrations/seed.sql` — staff 테이블 초기 스키마 (id, name, role, title, password_hash)
- `cha-bio-safety/migrations/` — 현재 0033까지 적용. Phase 7에서 0034+ 추가 예정

### Existing API & Auth
- `cha-bio-safety/functions/_middleware.ts` — JWT 미들웨어, role 추출 (line 8, 54). admin role-guard 확장 포인트
- `cha-bio-safety/functions/api/auth/login.ts` — 로그인 API, staff 테이블 조회 패턴 참고

### Frontend — 하드코딩 제거 대상
- `cha-bio-safety/src/pages/DashboardPage.tsx` — STAFF_ROLES 하드코딩 (lines 11-16), streakDays 참조 (line 56, 170-172)
- `cha-bio-safety/src/utils/shiftCalc.ts` — STAFF 하드코딩 배열, 동적 로딩 전환 대상

### Navigation
- `cha-bio-safety/src/components/SideMenu.tsx` — '관리자 설정' soon:true (line 37), role 기반 조건부 노출 필요
- `cha-bio-safety/src/App.tsx` — NO_NAV_PATHS 배열, /admin 라우트 추가, PAGE_TITLES

### Research
- `cha-bio-safety/.planning/research/STACK.md` — TECH-01 구현 방안 (lines 79-83), streakDays 방안 (lines 87-117)

### Requirements
- `.planning/REQUIREMENTS.md` — TECH-01, ADMIN-01, ADMIN-02 (TECH-02 보류, ADMIN-03 제외)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `_middleware.ts`: JWT에서 role 추출 이미 구현 — admin role-guard 확장 용이
- `login.ts`: staff 테이블 조회 패턴 — GET /api/staff 구현 시 참고
- `SideMenu.tsx`: soon:boolean 패턴 — role 기반 조건부 노출로 전환
- `RemediationPage` 탭 UI: 상태 탭 패턴 — AdminPage 탭 네비게이션에 재활용 가능

### Established Patterns
- 인라인 스타일 + CSS 변수 (var(--bg), var(--t1) 등)
- React Query 캐싱 (staleTime, refetchOnWindowFocus)
- toast 알림 (react-hot-toast)
- API 응답: { success: boolean, data: T }
- NO_NAV_PATHS에 포함된 페이지: 자체 헤더 + ← 뒤로가기 패턴

### Integration Points
- App.tsx: /admin 라우트 추가, NO_NAV_PATHS에 /admin 추가
- SideMenu.tsx: role 기반 '관리자 설정' 노출/숨김
- DashboardPage.tsx: STAFF_ROLES 제거 → useStaffList() 훅 사용
- shiftCalc.ts: 하드코딩 STAFF → 파라미터 주입 방식 전환
- stats.ts: streakDays는 0 유지 (보류)

</code_context>

<specifics>
## Specific Ideas

- 입사일은 사번(id) 앞 8자리에서 파싱 — 별도 필드 불필요 (사용자 명시적 확인)
- 선임일자(appointed_at)는 소방안전관리자/보조자 선임일을 의미 — 전 직원에게 필요
- 카테고리 CRUD는 점검 페이지 동적 생성 체계 필요 → v1.2 이후 (사용자 명시적 동의)

</specifics>

<deferred>
## Deferred Ideas

- **TECH-02 streakDays 계산** — 연속 점검 달성일 자동 계산. 사용자가 기능 자체를 보류 결정. 연구문서에 구현 방안 존재 (STACK.md lines 87-117)
- **ADMIN-03 햄버거 메뉴 배치** — SideMenu 항목 순서/표시 커스터마이징. 4인 팀에 불필요. 필요시 v1.2에서
- **카테고리 CRUD** — 점검 카테고리 추가/수정. 점검 페이지 UI 동적 생성 체계와 함께 v1.2 이후

</deferred>

---

*Phase: 07-tech-debt-admin*
*Context gathered: 2026-04-02*

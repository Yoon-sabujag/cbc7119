# Phase 7: Tech Debt + Admin — Research

**Researched:** 2026-04-02
**Domain:** Cloudflare D1 + React admin CRUD + hardcoded staff removal
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**관리자 페이지 구성**
- D-01: 탭 네비게이션 — 직원관리 / 시스템설정 2탭 구성 (ADMIN-03 메뉴배치 제외로 3탭→2탭)
- D-02: API + 프론트 이중 role-guard — API에 admin role-guard 미들웨어 + 프론트에서 role!='admin'이면 /dashboard 리디렉션
- D-03: assistant 역할에게 SideMenu '관리자 설정' 항목 미노출 (admin만 표시, soon:true 제거)

**직원 계정 관리 (ADMIN-01)**
- D-04: 비밀번호 초기화: 고정 초기 PW (사번 뒷자리 4자리 등 고정 규칙). 4인 팀이라 구두 전달 가능
- D-05: 삭제 정책: 비활성화(active 플래그). 점검 기록 FK 보존을 위해 완전 삭제 불가
- D-06: 필드 확장: phone(연락처, 전체), appointed_at(선임일자, 전체), email(이메일, 소방안전관리자만 필요 → 선택)
- D-07: 입사일은 별도 필드 불필요 — staff.id 앞 8자리에서 파싱 (예: 2018042451 → 2018-04-24)
- D-08: 기존 DB 필드 유지: id, name, role(admin/assistant), title

**시스템 설정 — 개소 관리 (ADMIN-02)**
- D-09: 카테고리 13개는 고정 조회 전용 (CRUD 불가). 카테고리 추가는 점검 페이지 UI 연쇄 변경 필요 → v1.2 이후
- D-10: 개소(check_points)만 CRUD: 추가 / 수정 / 비활성화. 점검 기록 FK 보존을 위해 삭제 불가
- D-11: 개소 관리 UI: 카테고리 드롭다운 선택 → 해당 카테고리 개소 리스트 표시. 점검 페이지의 카테고리→개소 흐름과 동일 패턴

**라우팅 및 네비게이션**
- D-12: /admin을 NO_NAV_PATHS에 추가 — BottomNav/글로벌헤더 숨김, 자체 헤더(← 뒤로가기) 표시
- D-13: 관리자 페이지는 단일 라우트 /admin (탭 전환은 컴포넌트 내부 상태)

**마이그레이션 전략**
- D-14: ALTER TABLE + 기본값 방식 — phone/email NULL 허용, appointed_at NULL 허용, check_points.active DEFAULT 1
- D-15: 기존 4인 데이터 손실 없음. 배포 후 관리자가 직접 정보 입력

**Tech Debt (TECH-01)**
- D-16: GET /api/staff 엔드포인트 신규 생성 + useStaffList() 훅으로 동적 로딩
- D-17: DashboardPage.tsx STAFF_ROLES 하드코딩 제거, shiftCalc.ts 등도 동적 로딩 전환

### Claude's Discretion
- 고정 초기 PW의 구체적 규칙 (사번 뒷 4자리 등)
- 개소 리스트 카드/테이블 디자인 (기존 앱 스타일과 일관성 유지)
- 직원 목록 표시 순서 (이름순, 사번순 등)
- admin role-guard 미들웨어 구현 방식 (공통 헬퍼 vs 인라인)

### Deferred Ideas (OUT OF SCOPE)
- TECH-02 streakDays 계산 — 연속 점검 달성일 자동 계산. v1.1 제외, v1.2 이후
- ADMIN-03 햄버거 메뉴 배치 — SideMenu 항목 순서/표시 커스터마이징. v1.1 제외
- 카테고리 CRUD — 점검 카테고리 추가/수정. v1.2 이후
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TECH-01 | 점검자 이름을 DB에서 동적으로 로딩한다 (하드코딩 제거) | `GET /api/staff` 신규 엔드포인트 + `useStaffList()` 훅. `STAFF_ROLES` (DashboardPage lines 11-16), `STAFF` 배열 (shiftCalc.ts lines 74-79), `SHIFT_OFFSETS` (shiftCalc.ts lines 20-24) 제거 대상 확인 완료 |
| ADMIN-01 | 직원 계정을 추가/수정/비밀번호 초기화할 수 있다 | staff 테이블 ALTER (phone/email/appointed_at/active 추가) + CRUD API + AdminPage 직원관리 탭 |
| ADMIN-02 | 시스템 설정(점검 카테고리, 개소 관리)을 구성할 수 있다 | check_points CRUD API (추가/수정/비활성화) + AdminPage 시스템설정 탭. 카테고리는 조회 전용. is_active 이미 check_points에 존재 |
</phase_requirements>

---

## Summary

Phase 7은 코드베이스에서 하드코딩 직원 데이터를 DB 동적 로딩으로 전환하고(TECH-01), 관리자 전용 설정 페이지를 신규 구현하는(ADMIN-01, ADMIN-02) 작업이다. 세 요구사항 모두 기존 스택(D1 SQL, React Query, Cloudflare Pages Functions 패턴)으로 완전히 처리 가능하며 신규 라이브러리가 불필요하다.

TECH-01의 핵심은 두 파일의 하드코딩 제거다: `DashboardPage.tsx`의 `STAFF_ROLES` 상수(role 매핑)와 `shiftCalc.ts`의 `STAFF` 배열(이름/사번/직급). 두 곳 모두 `useStaffList()` React Query 훅으로 대체되며, `getMonthlySchedule()`은 staff 리스트를 파라미터로 받도록 시그니처를 변경한다. `SHIFT_OFFSETS`는 로직(당직 순환 계산용 오프셋)이므로 DB로 옮기지 않고 유지한다.

ADMIN-01/02는 `/admin` 신규 라우트 + `AdminPage` 컴포넌트(2탭)로 구현된다. 직원관리 탭은 staff 테이블 CRUD API, 시스템설정 탭은 check_points CRUD API를 소비한다. 미들웨어는 이미 `ctx.data.role`을 추출하므로 admin role-guard는 핸들러 내에서 간단한 if-체크로 구현된다. DB 마이그레이션은 0034(staff 필드 확장) + 0035(check_points 별도 active 컬럼 추가 — 이미 is_active 존재하므로 불필요할 수 있음, 확인 필요) 2개가 예상된다.

**Primary recommendation:** TECH-01을 먼저 구현해 `useStaffList()` 훅과 `/api/staff` 엔드포인트를 확립한 뒤 ADMIN 기능을 쌓는다. ADMIN 페이지에서도 동일한 staff API를 소비한다.

---

## Standard Stack

### Core (신규 추가 없음)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Cloudflare Pages Functions | — | Admin CRUD API handlers | 기존 파일 기반 라우팅 패턴 그대로 |
| Cloudflare D1 (SQLite) | migration 0033까지 적용 | staff/check_points 스키마 CRUD | 기존 DB |
| @tanstack/react-query | 5.59.0 | `useStaffList()` 훅, Admin 탭 데이터 | 기존 표준 |
| React 18 + TypeScript 5.6 | — | AdminPage 컴포넌트 | 기존 표준 |
| react-hot-toast | 2.4.1 | 저장 성공/실패 피드백 | 기존 표준 |
| jose / Web Crypto API | 5.9.6 | 비밀번호 해시 (SHA-256 + salt) | login.ts 기존 패턴 재사용 |

### No New Dependencies

기존 STACK.md 리서치와 동일한 결론: 이 페이즈에서 신규 npm 패키지 없음.

- 폼 상태: `useState` (4인 팀 규모, form 라이브러리 불필요)
- 비밀번호 해시: Web Crypto `crypto.subtle.digest('SHA-256')` — login.ts의 `verifyPassword()` 패턴 그대로
- 날짜 파싱 (입사일): `staff.id.slice(0,8)` 문자열 파싱 — date-fns 불필요

**Installation:** 없음

---

## Architecture Patterns

### Recommended Project Structure (Phase 7 추가분)

```
cha-bio-safety/
├── functions/api/
│   ├── staff/
│   │   └── index.ts          # GET (목록), POST (신규 생성)
│   ├── staff/
│   │   └── [id].ts           # PUT (수정), PATCH (비밀번호 초기화), PATCH (비활성화)
│   ├── admin/
│   │   └── checkpoints/
│   │       └── index.ts      # GET (카테고리별 목록), POST (신규 개소)
│   │       └── [id].ts       # PUT (수정), PATCH (비활성화)
├── src/
│   ├── pages/
│   │   └── AdminPage.tsx     # 신규 — /admin 라우트 (2탭)
│   ├── hooks/
│   │   └── useStaffList.ts   # 신규 — GET /api/staff React Query 훅
│   └── utils/
│       └── api.ts            # staffApi, adminApi 네임스페이스 추가
└── migrations/
    └── 0034_staff_fields.sql # phone, email, appointed_at, active 추가
```

### Pattern 1: Admin Role-Guard (인라인 헬퍼 패턴)

**What:** API 핸들러 진입 시 `ctx.data.role`을 체크해 admin이 아니면 403 반환.
**When to use:** ADMIN-01, ADMIN-02 관련 모든 API 핸들러 (staff POST/PUT/PATCH, admin/checkpoints)

```typescript
// 공통 헬퍼 — functions/utils/adminGuard.ts 또는 각 핸들러에 인라인
function requireAdmin(ctx: any): Response | null {
  if (ctx.data?.role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 접근 가능합니다' }, { status: 403 })
  }
  return null
}

// 사용 예 (functions/api/staff/index.ts)
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const guard = requireAdmin(ctx)
  if (guard) return guard
  // ... 실제 로직
}
```

**Note:** GET /api/staff는 admin guard 없이 모든 인증 사용자에게 공개. DashboardPage, shiftCalc 등에서 소비하기 때문.

### Pattern 2: useStaffList() 훅

**What:** `/api/staff`를 React Query로 호출, `staleTime: Infinity`로 캐시 (직원 목록은 거의 변하지 않음).
**When to use:** DashboardPage STAFF_ROLES 대체, shiftCalc.ts STAFF 배열 대체, AdminPage 직원 목록

```typescript
// src/hooks/useStaffList.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'
import type { Staff } from '../types'

export function useStaffList() {
  return useQuery({
    queryKey: ['staffList'],
    queryFn: () => api.get<Staff[]>('/staff'),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1시간 캐시 유지
  })
}
```

### Pattern 3: getMonthlySchedule() 시그니처 변경

**What:** `shiftCalc.ts`의 `getMonthlySchedule(year, month)`에 `staffList` 파라미터 추가. 기존 하드코딩 `STAFF` 배열을 파라미터로 받도록 변경.
**When to use:** `getMonthlySchedule()`을 호출하는 모든 컴포넌트 (DashboardPage, SideMenu, WorkShiftPage 등)

```typescript
// shiftCalc.ts 변경 후 시그니처
export function getMonthlySchedule(
  year: number,
  month: number,
  staffList?: { id: string; name: string; title: string }[]
): { daysInMonth: number; staffRows: { id: string; name: string; title: string; shifts: RawShift[] }[] }

// 내부에서 STAFF 상수 대신:
const STAFF_FALLBACK = [
  { id: '2018042451', name: '석현민', title: '방재책임' },
  // ... (API 실패 시 폴백, 개발 환경용)
]
const resolvedStaff = staffList ?? STAFF_FALLBACK
```

**중요:** `SHIFT_OFFSETS`는 유지한다. 이 상수는 당직 순환 패턴의 수학적 오프셋이며 직원 정보(이름/직급)가 아니다. 다만 sidecar로 staff 레코드에 `shift_type` 컬럼이 이미 존재하므로, 향후 `SHIFT_OFFSETS`도 DB에서 읽는 경로를 고려할 수 있다 (v1.2 이후).

### Pattern 4: AdminPage 탭 구조

**What:** `/admin` 단일 라우트, 컴포넌트 내부 `useState`로 탭 전환. NO_NAV_PATHS에 포함 → 자체 헤더(← 뒤로가기).
**When to use:** AdminPage.tsx 구현 시

```typescript
// src/pages/AdminPage.tsx
type AdminTab = 'staff' | 'checkpoints'

export default function AdminPage() {
  const { staff } = useAuthStore()
  const navigate = useNavigate()

  // 프론트 role-guard
  useEffect(() => {
    if (staff && staff.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [staff, navigate])

  const [tab, setTab] = useState<AdminTab>('staff')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%' }}>
      {/* 자체 헤더 */}
      <div style={{ ... }}>
        <button onClick={() => navigate(-1)}>←</button>
        <span>관리자 설정</span>
      </div>
      {/* 탭 바 */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--bd)' }}>
        {(['staff', 'checkpoints'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ... }}>
            {t === 'staff' ? '직원 관리' : '개소 관리'}
          </button>
        ))}
      </div>
      {/* 탭 콘텐츠 */}
      {tab === 'staff' ? <StaffTab /> : <CheckpointsTab />}
    </div>
  )
}
```

### Pattern 5: 비밀번호 초기화 (사번 뒷 4자리)

**What:** 관리자가 특정 직원의 비밀번호를 사번 뒷 4자리로 초기화.
**When to use:** ADMIN-01 비밀번호 초기화 기능

```typescript
// functions/api/staff/[id].ts — PATCH handler for password reset
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params, data }) => {
  const guard = requireAdmin({ data })
  if (guard) return guard

  const staffId = params.id as string
  const { action } = await request.json<{ action: 'reset_password' | 'deactivate' }>()

  if (action === 'reset_password') {
    const newPassword = staffId.slice(-4) // 사번 뒷 4자리
    // 기존 login.ts와 동일한 해시 방식
    const salt = crypto.randomUUID().slice(0, 8)
    const data = new TextEncoder().encode(salt + newPassword)
    const digest = await crypto.subtle.digest('SHA-256', data)
    const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('')
    const hash = `${salt}:${hex}`

    await env.DB.prepare('UPDATE staff SET password_hash=?, updated_at=datetime("now") WHERE id=?')
      .bind(hash, staffId).run()

    return Response.json({ success: true })
  }
  // ...
}
```

### Pattern 6: check_points 비활성화 (삭제 불가)

**What:** `is_active = 0`으로 설정. 삭제 대신 소프트 삭제. `is_active` 컬럼은 0001_init.sql에서 이미 존재.
**When to use:** ADMIN-02 개소 비활성화

```sql
-- PATCH /api/admin/checkpoints/:id
UPDATE check_points SET is_active = 0 WHERE id = ?
```

**주의:** `check_points.is_active`는 이미 존재 (migration 0001). D-14의 "check_points.active DEFAULT 1 추가" 마이그레이션은 불필요. 실제로는 staff 테이블에만 `active` 컬럼 추가가 필요.

### Anti-Patterns to Avoid

- **SHIFT_OFFSETS를 DB로 옮기지 않는다:** 이 오프셋은 수학적 상수이며 이 페이즈 범위 밖. 직원 이름/직급만 동적 로딩 대상.
- **check_points 하드 삭제 금지:** `check_records`의 FK가 `check_points(id)`를 참조. 삭제 시 조회 기록이 고아 레코드가 됨.
- **staff 하드 삭제 금지:** `check_records.staff_id`, `inspection_sessions.staff_id` 등 다수 FK 참조. `active = 0`으로만 처리.
- **GET /api/staff에 password_hash 노출 금지:** SELECT 시 `id, name, role, title, shift_type, active, phone, email, appointed_at` 만 반환.
- **AdminPage를 비관리자가 직접 URL 입력으로 접근하는 경우:** 프론트 role-guard(useEffect redirect)와 API role-guard 모두 필요. 둘 중 하나만으로는 불충분.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 비밀번호 해시 | 커스텀 해시 구현 | `crypto.subtle.digest` + salt (login.ts 패턴) | 이미 검증된 패턴, Workers Web Crypto API |
| React Query 캐싱 | 직접 fetch + useState | `useQuery` + `staleTime: Infinity` | 중복 요청 방지, 자동 갱신 |
| 탭 라우팅 | URL 기반 탭 파라미터 | 컴포넌트 내부 `useState<AdminTab>` (D-13) | /admin은 단일 라우트로 결정됨 |
| CRUD 낙관적 업데이트 | 복잡한 낙관적 UI | `queryClient.invalidateQueries()` 후 리페치 | 4인 팀 규모에서 낙관적 업데이트 불필요 |

**Key insight:** 4인 팀 전용 관리 툴이므로 UX 복잡도(낙관적 업데이트, 실시간 반영 등)보다 코드 단순성이 우선.

---

## Common Pitfalls

### Pitfall 1: check_points.is_active — 이미 존재, 마이그레이션 필요 없음

**What goes wrong:** D-14 결정에 "check_points.active DEFAULT 1 추가"라고 되어 있지만 0001_init.sql에 `is_active INTEGER NOT NULL DEFAULT 1`이 이미 정의되어 있다. 마이그레이션을 중복 작성하면 D1에서 "duplicate column name" 에러 발생.
**Why it happens:** CONTEXT.md 작성 시 기존 스키마를 완전히 확인하지 않은 채 결정이 기록됨.
**How to avoid:** 마이그레이션 0034는 staff 테이블에만 `active`, `phone`, `email`, `appointed_at` 추가. check_points는 스키마 변경 불필요.
**Warning signs:** migration 파일 실행 시 "table check_points already has column is_active" 에러.

### Pitfall 2: getMonthlySchedule() 호출처 다수 — 모두 업데이트 필요

**What goes wrong:** `getMonthlySchedule()`은 DashboardPage.tsx, SideMenu.tsx에서 동기적으로 호출된다. 시그니처에 `staffList` 파라미터를 추가하면 두 곳 모두 수정 필요. SideMenu는 `useQuery` 없이 `useEffect`에서 직접 호출하므로 비동기 staffList 로딩과 타이밍 이슈가 있을 수 있다.
**Why it happens:** shiftCalc.ts가 순수 동기 함수인데 staffList는 비동기 API에서 오기 때문.
**How to avoid:** `staffList` 파라미터를 optional로 만들고 fallback 상수(기존 STAFF 배열)를 유지. staffList가 없을 때는 fallback으로 작동하도록 보장. SideMenu는 `useStaffList()` 데이터가 로드될 때까지 기존 하드코딩 결과를 사용해도 무방 (shift 패턴 계산 결과는 동일함 — 사번이 바뀌지 않으므로).
**Warning signs:** SideMenu에서 당직 표시가 깜빡이거나 빈 상태로 표시됨.

### Pitfall 3: DashboardPage STAFF_ROLES 제거 후 role 정보 부재

**What goes wrong:** `dutyStaff` 배열 생성 시 `STAFF_ROLES[s.id] ?? 'assistant'`로 role을 매핑했다. `useStaffList()`에서 role 정보를 함께 반환하면 이 매핑이 필요 없지만, `getMonthlySchedule()`의 staffRows는 `{ id, name, title, shifts }` 형태이므로 role 정보가 없다. DashboardPage의 `admin`/`assistant` 분류를 위해 staffList의 role을 별도로 조회해야 한다.
**Why it happens:** shiftCalc.ts `staffRows`와 useStaffList()의 Staff 타입이 다름.
**How to avoid:** DashboardPage에서 `useStaffList()`로 얻은 데이터를 ID 기준으로 Map으로 만들어 role 조회. `staffRows`와 조인해서 `dutyStaff` 구성.

```typescript
const { data: staffList } = useStaffList()
const staffRoleMap = useMemo(() =>
  new Map((staffList ?? []).map(s => [s.id, s.role])), [staffList]
)
// STAFF_ROLES 대체:
role: staffRoleMap.get(s.id) ?? 'assistant'
```

**Warning signs:** 관리자가 assistant로 표시되거나 역할 구분이 깨짐.

### Pitfall 4: SideMenu '관리자 설정' soon:true 제거 방식

**What goes wrong:** 현재 SideMenu의 MENU 상수는 정적 배열이며 `soon: true` 항목은 disabled 렌더링된다. role 기반 조건부 노출을 구현하려면 MENU 배열이나 렌더링 로직에 role 체크를 추가해야 한다.
**Why it happens:** 현재 MENU 배열에는 role 정보가 없음.
**How to avoid:** 두 가지 접근 중 선택: (a) MENU 아이템에 `adminOnly: boolean` 필드 추가 후 렌더링 시 `staff.role !== 'admin'`이면 필터링 — 단순하고 기존 패턴과 일관성 있음. (b) 컴포넌트 내부에서 `/admin` 경로 항목만 특별 처리. 접근 (a) 권장.

### Pitfall 5: D1 positional binding — spread 불가

**What goes wrong:** D1 `.bind()` 메서드는 spread 배열을 직접 지원하지 않는다. 동적 파라미터 수를 처리할 때 배열 길이에 따라 분기해야 한다.
**Why it happens:** `checkpoints/index.ts`에 이미 이 패턴이 나타나 있음 (`binds.length === 0/1/2/3` 분기).
**How to avoid:** 파라미터가 고정적인 INSERT/UPDATE는 문제 없음. 동적 WHERE 조건이 필요한 경우 조건 분기 유지.

---

## Code Examples

### GET /api/staff (신규 엔드포인트)

```typescript
// functions/api/staff/index.ts
import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  // 인증은 _middleware.ts에서 처리됨 (JWT 필수)
  // 민감 정보(password_hash) 제외, 관리자용 필드 포함
  const result = await env.DB.prepare(
    `SELECT id, name, role, title, shift_type, active, phone, email, appointed_at
     FROM staff
     WHERE active = 1 OR active IS NULL
     ORDER BY role DESC, id ASC`
  ).all<Record<string, unknown>>()

  return Response.json({
    success: true,
    data: (result.results ?? []).map(r => ({
      id:          r.id,
      name:        r.name,
      role:        r.role,
      title:       r.title,
      shiftType:   r.shift_type ?? undefined,
      active:      r.active ?? 1,
      phone:       r.phone ?? undefined,
      email:       r.email ?? undefined,
      appointedAt: r.appointed_at ?? undefined,
    })),
  })
}
```

### Migration 0034_staff_fields.sql

```sql
-- migrations/0034_staff_fields.sql
-- Phase 7: staff 테이블 필드 확장
-- NOTE: check_points.is_active는 0001_init.sql에 이미 존재 — 중복 추가 금지

ALTER TABLE staff ADD COLUMN active     INTEGER NOT NULL DEFAULT 1;
ALTER TABLE staff ADD COLUMN phone      TEXT;
ALTER TABLE staff ADD COLUMN email      TEXT;
ALTER TABLE staff ADD COLUMN appointed_at TEXT;  -- ISO8601 date (YYYY-MM-DD), 선임일자
```

### POST /api/staff (직원 신규 생성)

```typescript
// functions/api/staff/index.ts — POST handler
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }: any) => {
  if (data?.role !== 'admin')
    return Response.json({ success: false, error: '관리자만 접근 가능합니다' }, { status: 403 })

  const body = await request.json<{
    id: string; name: string; role: string; title: string
    phone?: string; email?: string; appointedAt?: string
  }>()

  // 초기 비밀번호: 사번 뒷 4자리
  const initPassword = body.id.slice(-4)
  const salt = crypto.randomUUID().slice(0, 8)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + initPassword))
  const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
  const passwordHash = `${salt}:${hex}`

  await env.DB.prepare(
    `INSERT INTO staff (id, name, role, title, password_hash, phone, email, appointed_at, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).bind(body.id, body.name, body.role, body.title, passwordHash,
         body.phone ?? null, body.email ?? null, body.appointedAt ?? null).run()

  return Response.json({ success: true, data: { id: body.id } })
}
```

### check_points 신규 개소 추가 API

```typescript
// functions/api/admin/checkpoints/index.ts — POST
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }: any) => {
  if (data?.role !== 'admin')
    return Response.json({ success: false, error: '관리자만 접근 가능합니다' }, { status: 403 })

  const body = await request.json<{
    floor: string; zone: string; location: string
    category: string; description?: string; locationNo?: string
  }>()

  // ID 및 QR 코드 자동 생성
  const id = `CP-${body.floor}-${body.zone.toUpperCase().slice(0,3)}-${Date.now().toString(36).toUpperCase()}`
  const qrCode = `QR-${id}`

  await env.DB.prepare(
    `INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).bind(id, qrCode, body.floor, body.zone, body.location,
         body.category, body.description ?? null, body.locationNo ?? null).run()

  return Response.json({ success: true, data: { id, qrCode } })
}
```

### App.tsx 변경점 (AdminPage 라우트 추가)

```typescript
// App.tsx 변경 요약
// 1. lazy import 추가:
const AdminPage = lazy(() => import('./pages/AdminPage'))

// 2. NO_NAV_PATHS: '/admin'은 이미 포함되어 있음 (line 50 확인)
// 현재: const NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave',
//   '/floorplan', '/div', '/qr-print', '/daily-report', '/meal', '/education', '/admin', '/legal-inspection']

// 3. PAGE_TITLES에 추가 불필요 — /admin은 자체 헤더를 가짐

// 4. Routes에 추가:
<Route path="/admin" element={<Auth><AdminPage /></Auth>} />
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| STAFF_ROLES 하드코딩 | useStaffList() + DB | Phase 7 | 직원 추가/변경 시 코드 배포 불필요 |
| STAFF 배열 하드코딩 (shiftCalc.ts) | getMonthlySchedule(year, month, staffList) | Phase 7 | 동일 — 배포 없이 직원 관리 가능 |
| '관리자 설정' soon:true (항상 숨김) | role 기반 조건부 노출 | Phase 7 | admin 계정에서만 메뉴 접근 가능 |

**Active constraints from existing code:**
- `stats.ts line 163`: `streakDays: 0` 유지 — TECH-02 보류로 변경 없음
- `App.tsx line 50`: `/admin`이 이미 NO_NAV_PATHS에 포함 — 추가 작업 불필요

---

## Open Questions

1. **SHIFT_OFFSETS의 staff 의존성**
   - What we know: SHIFT_OFFSETS는 `{ '2023071752': 0, '2022051052': 1, '2021061451': 2 }` 형태로 사번을 키로 사용. 신규 직원 추가 시 이 상수도 업데이트 필요.
   - What's unclear: 신규 직원의 당직 순환 패턴을 어떻게 정의할지 (4번째 교대 슬롯 추가? 오프셋 계산 방식 변경?)
   - Recommendation: Phase 7 범위에서는 SHIFT_OFFSETS 변경 없음. staff DB에 `shift_offset` 컬럼 추가는 v1.2로 유보. 현재는 admin이 신규 직원 추가 후 수동으로 코드 업데이트하는 방식 허용.

2. **check_points 신규 개소 ID 생성 방식**
   - What we know: 기존 ID는 `CP-{층}-{동}-{번호}` 형식 (예: CP-3F-OFF-001). 번호는 순차적으로 부여됨.
   - What's unclear: 새로운 ID를 자동 생성할 때 기존 번호와 충돌 없이 유일성을 보장하는 방법.
   - Recommendation: `Date.now().toString(36).toUpperCase()` 기반 ID 생성 (위 코드 예시 참고). QR 코드 출력 기능과 연동 시 ID 형식이 중요할 수 있으므로 QRPrintPage 확인 필요.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — all changes are code/DB schema modifications within existing Cloudflare D1 + React stack)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | 미설정 (테스트 프레임워크 미감지) |
| Config file | 없음 |
| Quick run command | 해당 없음 |
| Full suite command | 해당 없음 |

**Note:** 이 프로젝트는 자동화 테스트 인프라가 없다. nyquist_validation이 활성화되어 있으나 테스트 파일이 존재하지 않으므로 수동 검증으로 대체.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TECH-01 | STAFF_ROLES 제거 후 DashboardPage 정상 렌더링 | manual | — | ❌ |
| TECH-01 | useStaffList() 훅이 /api/staff 응답을 반환 | manual/browser | — | ❌ |
| TECH-01 | shiftCalc.ts getMonthlySchedule()이 staffList 파라미터 없이 폴백 | manual | — | ❌ |
| ADMIN-01 | 비관리자가 /admin 접근 시 /dashboard로 리다이렉션 | manual/browser | — | ❌ |
| ADMIN-01 | 직원 생성 API — admin role로 POST /api/staff 성공 | manual/curl | — | ❌ |
| ADMIN-01 | 직원 생성 API — assistant role로 POST /api/staff 403 반환 | manual/curl | — | ❌ |
| ADMIN-01 | 비밀번호 초기화 후 사번 뒷 4자리로 로그인 성공 | manual | — | ❌ |
| ADMIN-02 | 개소 신규 추가 후 점검 페이지에 즉시 반영 | manual | — | ❌ |
| ADMIN-02 | 개소 비활성화 후 점검 페이지에서 미표시 | manual | — | ❌ |
| ADMIN-02 | check_records FK 보존 — 비활성화된 개소의 기존 기록 조회 가능 | manual/SQL | — | ❌ |

### Sampling Rate
- **Per task commit:** `npm run dev` 후 브라우저에서 해당 기능 수동 확인
- **Per wave merge:** 관리자/비관리자 계정으로 전체 플로우 수동 테스트
- **Phase gate:** 모든 수동 체크리스트 통과 후 `/gsd:verify-work`

### Wave 0 Gaps
- 자동화 테스트 인프라 없음 — 수동 검증으로 대체 (기존 프로젝트 방침)

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 7 |
|-----------|-------------------|
| Tech stack: Cloudflare 고정 | D1 + Pages Functions 패턴 유지 |
| 추가 비용 $0 목표 | 신규 라이브러리 없음 — 기존 스택으로 구현 |
| 데이터 무결성: 삭제 불가 원칙 | staff.active + check_points.is_active 소프트 삭제 |
| TypeScript strict:false | 타입 에러 관대하게 허용, 인터페이스 정의는 유지 |
| 인라인 스타일 + CSS 변수 | AdminPage UI도 동일 패턴 |
| API 응답: { success: boolean, data?: T } | 모든 신규 API 핸들러 동일 형식 |
| 한국어 에러 메시지 | '관리자만 접근 가능합니다', '직원 정보를 저장했습니다' 등 |
| NO_NAV_PATHS에 /admin 이미 포함 | App.tsx 변경 최소화 — 라우트 추가만 필요 |

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `cha-bio-safety/migrations/0001_init.sql` — staff 및 check_points 스키마 확인
- Codebase inspection: `cha-bio-safety/functions/_middleware.ts` — JWT payload에 role 포함 확인 (line 54)
- Codebase inspection: `cha-bio-safety/src/pages/DashboardPage.tsx` — STAFF_ROLES lines 11-16, shiftCalc 호출 패턴
- Codebase inspection: `cha-bio-safety/src/utils/shiftCalc.ts` — STAFF 배열 lines 74-79, SHIFT_OFFSETS lines 20-24
- Codebase inspection: `cha-bio-safety/src/App.tsx` — NO_NAV_PATHS line 50 (/admin 이미 포함 확인)
- Codebase inspection: `cha-bio-safety/src/components/SideMenu.tsx` — '관리자 설정' soon:true line 37
- Codebase inspection: `cha-bio-safety/functions/api/auth/login.ts` — 비밀번호 해시 패턴
- Codebase inspection: `cha-bio-safety/.planning/research/STACK.md` — TECH-01 구현 방안 (lines 79-83)

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions D-01 ~ D-17 — 사용자 확정 결정사항

### Tertiary (LOW confidence)
- 없음

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 신규 라이브러리 없음, 기존 패턴 재사용
- Architecture: HIGH — 코드베이스 직접 검사로 통합 포인트 확인
- Pitfalls: HIGH — 기존 마이그레이션 스키마 직접 확인 (check_points.is_active 중복 이슈)

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (스키마 변경 없으면 안정적)

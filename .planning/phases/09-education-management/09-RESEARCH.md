# Phase 9: Education Management - Research

**Researched:** 2026-04-02
**Domain:** 보수교육 이수 이력 관리 — D1 마이그레이션, React Query CRUD, 날짜 계산
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 리스트형 단일 페이지 — 직원별 교육 카드 리스트. 탭 없음. 카드 탭하면 상세/이수 기록 화면
- **D-02:** /education은 NO_NAV_PATHS에 이미 포함. 자체 헤더(← 뒤로가기) + "보수교육" 제목
- **D-03:** SideMenu 근무·복지 섹션에 "보수교육" 항목 추가 (근무표, 연차 관리, 식사 기록 뒤)
- **D-04:** 선임 후 6개월 이내: 첫 실무교육 필수. 선임일(staff.appointed_at) + 6개월 = 첫 교육 마감일
- **D-05:** 첫 교육 이수일 기준: 이후 2년마다 보수교육. 마지막 이수일 + 2년 = 다음 마감일
- **D-06:** D-day 자동 계산 — 수동 일정 등록 불필요. 선임일 + 이수 이력만으로 산출
- **D-07:** 이수일만 기록 (인증서 R2 업로드 없음). EDU-02의 인증서 업로드는 제외
- **D-08:** 이수일 등록 시 education_type 구분: 실무(initial) / 보수(refresher)
- **D-09:** 이수 이력은 삭제 불가 (법적 기록). 이수일 수정만 가능
- **D-10:** 이수일 등록/수정: admin + 본인 모두 가능
- **D-11:** 모든 직원의 교육 현황 조회: 전체 가능 (법적 현황 공유)
- **D-12:** 교육 페이지에서만 표시 (대시보드 미반영)
- **D-13:** 카드에 D-day 배지 — 마감 전 D-30 이내면 경고색, 마감 초과면 위험색
- **D-14:** education_records 테이블: id, staff_id, education_type(initial/refresher), completed_at, created_at
- **D-15:** 마이그레이션 1개: 0036_education_records.sql (또는 다음 번호)

### Claude's Discretion
- 카드 디자인 상세 (기존 앱 스타일 일관성)
- D-day 경고 임계값 색상 (warn/danger 등)
- 이수 기록 입력 UI (바텀시트 vs 인라인)
- 교육 유형 자동 판정 로직 (첫 교육=initial, 이후=refresher)

### Deferred Ideas (OUT OF SCOPE)
- **EDU-02 인증서 R2 업로드** — 이수 기록에 인증서 파일 첨부. 필요시 v1.2에서 추가
- **대시보드 D-day 경고** — 30일 이내 교육 마감 시 대시보드에 경고 카드 표시
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EDU-01 | 교육 일정을 등록/수정/조회할 수 있다 (교육명, 날짜, 기관, 대상자) | D-day 자동 계산으로 대체 — 수동 일정 등록 없음. 이수 이력 CRUD가 실질적 요구사항 |
| EDU-02 | 이수 완료를 기록할 수 있다 (인증서 업로드 제외, 이수일만) | education_records 테이블 + POST /api/education endpoint |
| EDU-03 | 개인 페이지에서 다음 교육 마감일 D-day를 확인할 수 있다 | 선임일+6개월/이수일+2년 계산 로직 → 카드 D-day 배지 |
</phase_requirements>

## Summary

Phase 9는 순수 내부 기능 확장이다. 새 DB 테이블 1개(education_records), 새 API 엔드포인트 2개(`/api/education`, `/api/education/[id]`), 새 페이지 1개(`EducationPage.tsx`)로 완결된다. 외부 의존성은 없고, 기존 패턴을 그대로 따른다.

핵심 로직은 D-day 계산이다. `staff.appointed_at`이 NULL이면 카드에 "선임일 미등록" 표시만 하고 계산 건너뜀. 이수 이력이 있으면 가장 최근 이수일+2년을 다음 마감일로 사용하고, 없으면 선임일+6개월이 첫 마감일이다. 이 계산은 클라이언트(프론트엔드)에서 `date-fns`로 처리하는 것이 자연스럽다 — API는 raw 이력만 내려주고 D-day는 렌더 시 계산한다.

마이그레이션 번호 충돌 주의: 현재 repo에 `0035_extinguishers.sql`과 `0035_meal_records.sql`이 모두 존재한다. 다음 번호는 `0036`이 맞으나, wrangler가 alphabetical order로 실행하므로 `0036_education_records.sql`로 명명하면 안전하다.

**Primary recommendation:** education_records 테이블 + `/api/education` 엔드포인트를 먼저 구축(Wave 0), 그 다음 EducationPage UI(Wave 1)를 구현하는 2-wave 구조로 진행.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| date-fns | 4.1.0 | D-day 계산, 날짜 포맷팅 | 프로젝트 이미 사용 중. addMonths/addYears/differenceInDays |
| date-fns-tz | 3.2.0 | 한국 시간대 처리 | 프로젝트 이미 사용 중 |
| @tanstack/react-query | 5.59.0 | API 응답 캐싱 + 뮤테이션 | 프로젝트 전체 패턴 |
| Cloudflare D1 | (플랫폼) | SQLite 기반 영구 저장 | 유일한 DB 옵션 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hot-toast | 2.4.1 | 이수 등록 성공/실패 알림 | 모든 mutation 후 |
| lucide-react | — | 아이콘 (사용 불가) | 프로젝트에 미설치 — 인라인 SVG 사용 |

**Installation:** 신규 패키지 설치 없음. 모든 의존성 이미 존재.

## Architecture Patterns

### Recommended Project Structure
```
cha-bio-safety/
├── src/pages/EducationPage.tsx          # 신규 — 교육 현황 리스트 페이지
├── src/utils/api.ts                     # educationApi 추가
├── src/types/index.ts                   # EducationRecord 타입 추가
├── src/components/SideMenu.tsx          # 근무·복지 섹션에 보수교육 추가
├── src/App.tsx                          # /education 라우트 추가 (NO_NAV_PATHS 이미 있음)
├── functions/api/education/
│   ├── index.ts                         # GET (all staff), POST (add record)
│   └── [id].ts                          # PUT (update completed_at)
└── migrations/
    └── 0036_education_records.sql       # education_records 테이블
```

### Pattern 1: 자체 헤더 (NO_NAV_PATHS 페이지)
**What:** BottomNav/GlobalHeader 없이 자체 뒤로가기 버튼 + 타이틀 렌더
**When to use:** /education은 이미 NO_NAV_PATHS에 있으므로 반드시 이 패턴
**Example:**
```typescript
// MealPage.tsx 패턴 그대로 적용
<div style={{ height: 48, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)',
  display: 'flex', alignItems: 'center', flexShrink: 0 }}>
  <button onClick={() => navigate(-1)}
    style={{ width: 44, height: 44, background: 'none', border: 'none',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)' }}>
    <IconChevronLeft size={20} color="var(--t2)" />
  </button>
  <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
    보수교육
  </span>
  <div style={{ width: 44 }} />
</div>
```

### Pattern 2: BottomSheet 이수 입력 모달
**What:** 클라이언트에서 이수일 입력. AdminPage.tsx의 BottomSheet 컴포넌트 패턴 복제
**When to use:** 카드 탭 → 이수 기록 등록/수정 시
**Example:**
```typescript
// AdminPage.tsx BottomSheet 패턴 그대로 복제
function BottomSheet({ onClose, title, children }: {
  onClose: () => void; title: string; children: React.ReactNode
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'var(--bg2)', borderRadius: '16px 16px 0 0',
        animation: 'slideUp 0.28s ease-out both', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* 드래그 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 32, height: 4, background: 'var(--bd2)', borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', padding: '12px 16px 0' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}
```

### Pattern 3: D-day 계산 로직
**What:** 순수 date-fns 함수로 클라이언트에서 계산. API가 raw 날짜만 반환
**When to use:** 카드 렌더 시점에 호출
**Example:**
```typescript
import { addMonths, addYears, differenceInCalendarDays, parseISO } from 'date-fns'

function calcNextDeadline(
  appointedAt: string | null,
  records: { completed_at: string; education_type: string }[]
): { deadline: Date | null; label: string } {
  if (!appointedAt) return { deadline: null, label: '선임일 미등록' }

  const sorted = [...records].sort((a, b) =>
    b.completed_at.localeCompare(a.completed_at))

  if (sorted.length === 0) {
    // 첫 교육 마감: 선임일 + 6개월
    return { deadline: addMonths(parseISO(appointedAt), 6), label: '첫 실무교육' }
  }

  // 보수교육: 가장 최근 이수일 + 2년
  const last = sorted[0]
  return { deadline: addYears(parseISO(last.completed_at), 2), label: '보수교육' }
}

function calcDday(deadline: Date): number {
  return differenceInCalendarDays(deadline, new Date())
}
```

### Pattern 4: API 엔드포인트 (Cloudflare Pages Functions)
**What:** `/api/education` — GET 전체 직원 이력, POST 이수 등록
**Example:**
```typescript
// functions/api/education/index.ts
// GET: 전체 직원 + 각 직원의 이수 이력 JOIN
// education_records의 복수 이력을 JSON_GROUP_ARRAY 또는 별도 쿼리로 처리
// D1은 JSON_GROUP_ARRAY 지원 (SQLite 3.38+)

const rows = await env.DB.prepare(`
  SELECT
    s.id, s.name, s.title, s.appointed_at,
    er.id as rec_id, er.education_type, er.completed_at, er.created_at as rec_created_at
  FROM staff s
  LEFT JOIN education_records er ON er.staff_id = s.id
  WHERE s.active = 1
  ORDER BY s.name ASC, er.completed_at DESC
`).all()
// 클라이언트에서 GROUP BY staff_id 로 집계하거나,
// API에서 staff별 records 배열로 집계 후 반환
```

### Anti-Patterns to Avoid
- **D-day 계산을 DB에서 하기:** D1 SQLite에서 date 연산은 가능하나 복잡. 프론트에서 date-fns로 계산이 훨씬 단순하고 유지보수 용이
- **lucide-react 임포트:** 프로젝트에 미설치. 반드시 인라인 SVG 함수 패턴 사용 (AdminPage.tsx, MealPage.tsx 참고)
- **`0035` 번호 재사용:** 이미 충돌 존재(extinguishers, meal_records). `0036`으로 명명
- **이수 이력 DELETE 엔드포인트:** D-09 결정 — 삭제 불가. PUT(수정)만 제공

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 날짜 더하기(+6개월, +2년) | 직접 월 계산 | `date-fns/addMonths`, `addYears` | 윤달/월말 경계 처리 복잡 |
| D-day 계산 | `Math.floor((deadline-now)/86400000)` | `date-fns/differenceInCalendarDays` | DST, 시간대 경계 안전 처리 |
| 날짜 파싱 | `new Date(str)` 직접 | `date-fns/parseISO` | ISO 8601 형식 안전 파싱 |
| API 캐싱 | 직접 useState+useEffect | React Query `useQuery` | 자동 재시도, staleTime, invalidation |

## Common Pitfalls

### Pitfall 1: staff.appointed_at NULL 미처리
**What goes wrong:** `addMonths(parseISO(null), 6)` → Invalid Date → 렌더 크래시
**Why it happens:** 직원 등록 시 선임일 입력은 선택 항목 (AdminPage.tsx 확인)
**How to avoid:** `appointed_at`이 null이면 D-day 계산 건너뛰고 "선임일 미등록" 표시
**Warning signs:** 카드 렌더에서 NaN D-day 표시

### Pitfall 2: 마이그레이션 번호 충돌
**What goes wrong:** `0035_education_records.sql` 생성 시 wrangler가 alphabetical 순서로 충돌
**Why it happens:** 기존에 `0035_extinguishers.sql`과 `0035_meal_records.sql` 모두 존재
**How to avoid:** 반드시 `0036_education_records.sql` 사용
**Warning signs:** `wrangler d1 migrations apply` 시 오류

### Pitfall 3: /education 라우트 미등록
**What goes wrong:** /education 접속 시 NotFoundPage 렌더
**Why it happens:** App.tsx에 lazy import + Route 추가를 빠뜨림
**How to avoid:** NO_NAV_PATHS에는 이미 있으나 Routes 블록에 Route 라인 추가 필수
**Warning signs:** 직접 URL 입력 시 404

### Pitfall 4: admin-only 뮤테이션 권한 누락
**What goes wrong:** 본인 외 직원 이수 기록을 assistant도 수정 가능
**Why it happens:** D-10 — admin + 본인 모두 가능이나 타인 수정은 admin만
**How to avoid:** PUT 핸들러에서 `data.role !== 'admin' && data.staffId !== targetStaffId` 체크
**Warning signs:** 권한 없는 수정이 200 OK 반환

### Pitfall 5: education_type 자동 판정 실수
**What goes wrong:** 이수 이력이 있는 사람에게 initial 타입으로 등록
**Why it happens:** 등록 폼에서 type을 수동 선택하면 사용자 실수 가능
**How to avoid:** 폼 진입 시 기존 이력 수 확인 — 0개면 initial, 1개 이상이면 refresher를 default로 세팅. 사용자가 override 가능하게 표시
**Warning signs:** 이수 이력이 있는 직원의 첫 레코드가 refresher

## Code Examples

### DB 마이그레이션
```sql
-- migrations/0036_education_records.sql
CREATE TABLE education_records (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  staff_id       TEXT NOT NULL REFERENCES staff(id),
  education_type TEXT NOT NULL CHECK(education_type IN ('initial', 'refresher')),
  completed_at   TEXT NOT NULL,  -- YYYY-MM-DD
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_education_records_staff ON education_records(staff_id, completed_at DESC);
```

### 타입 정의 추가 (types/index.ts)
```typescript
export interface EducationRecord {
  id: string
  staffId: string
  educationType: 'initial' | 'refresher'
  completedAt: string   // YYYY-MM-DD
  createdAt: string
}

export interface StaffEducation {
  staff: StaffFull
  records: EducationRecord[]
}
```

### API 클라이언트 추가 (utils/api.ts)
```typescript
export const educationApi = {
  list: () => api.get<StaffEducation[]>('/education'),
  create: (staffId: string, data: { education_type: 'initial' | 'refresher'; completed_at: string }) =>
    api.post<EducationRecord>('/education', { staffId, ...data }),
  update: (id: string, data: { completed_at: string }) =>
    api.put<void>(`/education/${id}`, data),
}
```

### SideMenu 수정 (근무·복지 섹션)
```typescript
// SideMenu.tsx — MENU 상수의 근무·복지 섹션
{ section: '근무·복지', items: [
  { label: '근무표',    path: '/workshift',  badge: 0, soon: false },
  { label: '연차 관리', path: '/leave',      badge: 0, soon: false },
  { label: '식사 기록', path: '/meal',       badge: 0, soon: false },
  { label: '보수교육',  path: '/education',  badge: 0, soon: false },  // 추가
]},
```

### App.tsx 라우트 추가
```typescript
// lazy import 추가
const EducationPage = lazy(() => import('./pages/EducationPage'))

// Routes 블록에 추가
<Route path="/education" element={<Auth><EducationPage /></Auth>} />
```

### GET /api/education 핸들러 패턴
```typescript
// functions/api/education/index.ts
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    // 1. 활성 직원 목록
    const staffRows = await env.DB.prepare(
      `SELECT id, name, title, appointed_at FROM staff WHERE active = 1 ORDER BY name ASC`
    ).all<{ id: string; name: string; title: string; appointed_at: string | null }>()

    // 2. 모든 education_records
    const recRows = await env.DB.prepare(
      `SELECT id, staff_id, education_type, completed_at, created_at
       FROM education_records ORDER BY completed_at DESC`
    ).all<{ id: string; staff_id: string; education_type: string; completed_at: string; created_at: string }>()

    // 3. staff별 records 집계
    const recMap: Record<string, EducationRecord[]> = {}
    for (const r of recRows.results ?? []) {
      if (!recMap[r.staff_id]) recMap[r.staff_id] = []
      recMap[r.staff_id].push({
        id: r.id,
        staffId: r.staff_id,
        educationType: r.education_type as 'initial' | 'refresher',
        completedAt: r.completed_at,
        createdAt: r.created_at,
      })
    }

    const data = (staffRows.results ?? []).map(s => ({
      staff: { id: s.id, name: s.name, title: s.title, appointedAt: s.appointed_at ?? null },
      records: recMap[s.id] ?? [],
    }))

    return Response.json({ success: true, data })
  } catch (e) {
    console.error('education list error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
```

### PUT /api/education/[id] 권한 체크
```typescript
// functions/api/education/[id].ts
export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const { env, params, data: ctxData } = ctx as any
  const { staffId: actorId, role } = ctxData
  const id = params.id as string

  // 이수 기록의 staff_id 조회
  const rec = await env.DB.prepare(
    `SELECT staff_id FROM education_records WHERE id = ?`
  ).bind(id).first<{ staff_id: string }>()

  if (!rec) return Response.json({ success: false, error: '기록을 찾을 수 없습니다' }, { status: 404 })

  // admin이거나 본인 기록만 수정 가능
  if (role !== 'admin' && actorId !== rec.staff_id)
    return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })

  const { completed_at } = await ctx.request.json<{ completed_at: string }>()
  await env.DB.prepare(
    `UPDATE education_records SET completed_at = ? WHERE id = ?`
  ).bind(completed_at, id).run()

  return Response.json({ success: true })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D-day 계산 DB에서 | 프론트 date-fns 계산 | 프로젝트 전반 패턴 | API 단순화, 재계산 비용 0 |
| 하드코딩 아이콘 (lucide-react) | 인라인 SVG 함수 | Phase 8 확립 | 패키지 의존성 없음 |

## Environment Availability

Step 2.6: SKIPPED — 이 Phase는 기존 Cloudflare D1/Workers 스택만 사용. 신규 외부 도구 없음.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | 미설치 — 이 프로젝트는 자동화 테스트 설정 없음 |
| Config file | 없음 |
| Quick run command | `npm run build` (TypeScript 컴파일 + Vite 빌드) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDU-01 | 이수 이력 조회 (GET /api/education) | manual smoke | `npm run build` + wrangler dev | ❌ Wave 0 |
| EDU-02 | 이수일 기록 (POST /api/education) | manual smoke | `npm run build` + wrangler dev | ❌ Wave 0 |
| EDU-03 | D-day 계산 정확도 | manual smoke | `npm run build` + 브라우저 확인 | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` — TypeScript 오류 없는지 확인
- **Per wave merge:** `npm run build` + wrangler dev 로컬 실행 후 /education 수동 확인
- **Phase gate:** 전체 스택 빌드 성공 + 브라우저에서 교육 카드 D-day 표시 확인

### Wave 0 Gaps
- [ ] 자동화 테스트 프레임워크 없음 — 수동 smoke test로 대체
- [ ] `npm run build` 성공이 최소 게이트

## Open Questions

1. **migration 번호 0035 충돌 처리**
   - What we know: `0035_extinguishers.sql`, `0035_meal_records.sql` 모두 존재
   - What's unclear: wrangler가 이미 prod에 양쪽 다 적용했는지, 아니면 하나만 적용됐는지
   - Recommendation: `0036_education_records.sql`로 명명. 실행 전 `wrangler d1 migrations list --remote` 확인

2. **education_type 자동 판정 UI**
   - What we know: 등록 시 initial/refresher 구분 필요 (D-08)
   - What's unclear: 폼에서 타입 선택 드롭다운 제공 vs 자동 판정만
   - Recommendation: 기존 이력 수로 default 세팅 + 드롭다운으로 override 허용. 단순하고 실수 방지

## Sources

### Primary (HIGH confidence)
- 직접 코드 분석 — `cha-bio-safety/src/App.tsx` (NO_NAV_PATHS, 라우트 구조)
- 직접 코드 분석 — `cha-bio-safety/src/components/SideMenu.tsx` (MENU 상수 구조)
- 직접 코드 분석 — `cha-bio-safety/src/pages/AdminPage.tsx` (BottomSheet 패턴)
- 직접 코드 분석 — `cha-bio-safety/src/pages/MealPage.tsx` (자체 헤더 패턴)
- 직접 코드 분석 — `cha-bio-safety/src/types/index.ts` (StaffFull.appointedAt 확인)
- 직접 코드 분석 — `cha-bio-safety/migrations/0034_staff_fields.sql` (appointed_at 컬럼 확인)
- 직접 코드 분석 — `cha-bio-safety/migrations/0035_meal_records.sql` (마이그레이션 패턴)
- 직접 코드 분석 — `cha-bio-safety/src/utils/api.ts` (mealApi, staffApi 패턴)
- 직접 코드 분석 — `cha-bio-safety/functions/api/staff/index.ts` (Env 타입, 권한 패턴)
- 직접 코드 분석 — `cha-bio-safety/functions/_middleware.ts` (ctx.data staffId/role 구조)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 신규 패키지 없음, 기존 패턴만 사용
- Architecture: HIGH — 기존 MealPage/AdminPage를 직접 읽고 패턴 추출
- Pitfalls: HIGH — 코드베이스에서 직접 확인한 실제 상태 (NULL appointed_at, 마이그레이션 번호 충돌)

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (스택 변경 없으면 안정)

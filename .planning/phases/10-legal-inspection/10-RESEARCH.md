# Phase 10: Legal Inspection - Research

**Researched:** 2026-04-02
**Domain:** Cloudflare Pages + D1 + R2, React 18, 3-level routing, file upload (image + PDF), role-based access
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** 점검회차 리스트 → 지적사항 목록 → 지적 상세 (3단계 구조)
**D-02:** /legal → 회차 카드 리스트, /legal/:id → 지적사항 목록, /legal/:id/finding/:fid → 지적 상세(사진+조치)
**D-03:** 모든 라우트 NO_NAV_PATHS에 포함. 자체 헤더(← 뒤로가기) + 페이지 제목
**D-04:** SideMenu 시스템 섹션의 '법적 점검' soon:true → soon:false로 활성화
**D-05:** 연 2회: 상반기 종합정밀점검(comprehensive) + 하반기 작동기능점검(functional)
**D-06:** 기록 항목: 점검 유형, 일자, 점검기관, 결과(적합/부적합/조건부적합), 비고
**D-07:** 점검기관 결과 보고서 PDF를 R2에 업로드 (report_file_key). 관리자만 업로드 가능
**D-08:** 회차 카드에 지적 건수 + 조치완료 건수 요약 표시
**D-09:** 지적 기록: 지적 내용(텍스트) + 지적 시 사진(R2) + 위치 정보
**D-10:** 조치 기록: 조치 내용(텍스트) + 조치 후 사진(R2)
**D-11:** 상태: 미조치(open) / 조치완료(resolved). Phase 6 조치관리와 동일 2단계
**D-12:** 전체 직원: 지적사항 등록, 지적/조치 사진 업로드, 조치 내용 기록 (현장 날것 기록)
**D-13:** 관리자만: 점검회차 추가/수정, 지적사항 편집/정리, 결과 보고서 PDF 업로드 (가공 작업)
**D-14:** 지적 사진 R2 키: legal/{inspectionId}/findings/{findingId}/before/{timestamp}
**D-15:** 조치 사진 R2 키: legal/{inspectionId}/findings/{findingId}/after/{timestamp}
**D-16:** 결과 보고서 PDF R2 키: legal/{inspectionId}/report/{timestamp}.pdf
**D-17:** 기존 usePhotoUpload 훅 + imageUtils 재활용 (Phase 6 패턴)
**D-18:** 2테이블: legal_inspections(점검회차) + legal_findings(지적사항). 1:N 관계
**D-19:** legal_inspections: id, inspection_type(comprehensive/functional), inspected_at, agency, result(pass/fail/conditional), report_file_key, memo, created_by, created_at
**D-20:** legal_findings: id, inspection_id(FK), description, location, photo_key, resolution_memo, resolution_photo_key, status(open/resolved), resolved_at, resolved_by, created_by, created_at
**D-21:** 마이그레이션: 0038_legal_inspections.sql (최신 번호 확인 후 결정)

### Claude's Discretion
- 카드 디자인 상세 (기존 앱 스타일 일관성)
- 지적사항 목록 정렬 방식 (최신순/미조치 우선)
- 결과 보고서 PDF 뷰어 방식 (새 탭 열기 vs 인앱 뷰어)
- 위치 정보 입력 방식 (텍스트 자유 입력)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LEGAL-01 | 법적 점검 결과를 기록하고 서류를 업로드할 수 있다 (R2) | legal_inspections 테이블 + PDF R2 업로드 패턴 (기존 /api/uploads 재사용) |
| LEGAL-02 | 지적사항을 등록하고 시정조치 기록/완료 확인할 수 있다 | legal_findings 테이블 + RemediationDetailPage 패턴 직접 재활용 |

</phase_requirements>

---

## Summary

Phase 10 는 법적 점검(연 2회: 종합정밀/작동기능) 관리 기능을 구현한다. 3단계 라우트 구조(/legal → /legal/:id → /legal/:id/finding/:fid)에 걸쳐 점검회차 관리, 지적사항 등록, 시정조치 추적, 결과 보고서 PDF 업로드를 처리한다.

Phase 6(조치관리)의 패턴이 거의 그대로 재사용 가능하다. RemediationPage/DetailPage가 지적사항 목록과 조치 상세의 직접적인 선례이며, usePhotoUpload 훅, /api/uploads 엔드포인트, React Query 패턴, CSS 변수 기반 인라인 스타일이 모두 그대로 활용된다. 주요 차이점은 (1) 상위 "회차" 레이어가 추가되고, (2) 이미지뿐만 아니라 PDF 파일도 업로드하며, (3) admin/all-staff 권한이 엔드포인트별로 다르게 적용된다는 점이다.

**Primary recommendation:** Phase 6 패턴을 최대한 복사하여 빠르게 구현하고, PDF 업로드 및 3단계 라우팅의 차이점에만 집중한다.

---

## Standard Stack

### Core (모두 이미 설치됨)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI | 프로젝트 기반 |
| React Router DOM | 6.26.2 | 3단계 중첩 라우팅 | 프로젝트 기반 |
| @tanstack/react-query | 5.59.0 | 서버 상태, 캐싱 | 프로젝트 기반 |
| Zustand | 5.0.0 | auth 상태 | 프로젝트 기반 |
| react-hot-toast | 2.4.1 | 사용자 피드백 | 프로젝트 기반 |
| Cloudflare D1 | 현재 바인딩 | SQLite DB | 프로젝트 기반 |
| Cloudflare R2 | 현재 바인딩 | 파일 저장 | 프로젝트 기반 |

신규 의존성 없음. 모든 필요 라이브러리가 이미 설치되어 있다.

---

## Architecture Patterns

### 추천 파일 구조

```
src/pages/
├── LegalPage.tsx              # /legal — 점검회차 카드 리스트
├── LegalFindingsPage.tsx      # /legal/:id — 지적사항 목록
└── LegalFindingDetailPage.tsx # /legal/:id/finding/:fid — 지적 상세+조치

functions/api/
└── legal/
    ├── index.ts               # GET(회차목록) / POST(회차생성, admin)
    ├── [id].ts                # GET(회차상세) / PUT(회차수정, admin)
    ├── [id]/
    │   ├── findings/
    │   │   ├── index.ts       # GET(지적목록) / POST(지적등록, all staff)
    │   │   └── [fid].ts       # GET(지적상세) / PUT(지적수정, admin)
    │   └── findings/
    │       └── [fid]/
    │           └── resolve.ts # POST(조치완료, all staff)
    └── (report upload는 /api/uploads 재사용)

migrations/
└── 0038_legal_inspections.sql
```

### Pattern 1: 3단계 라우팅 — App.tsx 등록

App.tsx의 NO_NAV_PATHS와 Routes에 세 경로를 모두 추가해야 한다.

```typescript
// App.tsx — NO_NAV_PATHS (line 54)
const NO_NAV_PATHS = [
  // ... 기존 경로들 ...
  '/legal',           // 회차 리스트 (자체 헤더 없음 — BottomNav 있음)
  // NOTE: /legal/:id 와 /legal/:id/finding/:fid 는 동적 경로라
  // NO_NAV_PATHS includes() 매칭 안됨 → showNav 로직에 regex 추가 필요
]

// showNav 로직 수정 (현재 /remediation/:id 패턴 참조)
const showNav = isAuthenticated
  && !NO_NAV_PATHS.includes(location.pathname)
  && !location.pathname.match(/^\/remediation\/.+/)
  && !location.pathname.match(/^\/legal\/.+/)   // 추가
```

**중요 발견:** `/legal` (루트)는 BottomNav/GlobalHeader가 있어야 하는지 여부를 CONTEXT D-03에서 확인 필요. D-03은 "모든 라우트 NO_NAV_PATHS에 포함"이라고 했으므로, /legal 자체도 NO_NAV_PATHS에 추가하고 자체 헤더를 구현한다.

```typescript
// App.tsx — lazy imports 추가
const LegalPage              = lazy(() => import('./pages/LegalPage'))
const LegalFindingsPage      = lazy(() => import('./pages/LegalFindingsPage'))
const LegalFindingDetailPage = lazy(() => import('./pages/LegalFindingDetailPage'))

// Routes 추가
<Route path="/legal"                           element={<Auth><LegalPage /></Auth>} />
<Route path="/legal/:id"                       element={<Auth><LegalFindingsPage /></Auth>} />
<Route path="/legal/:id/finding/:fid"          element={<Auth><LegalFindingDetailPage /></Auth>} />
```

### Pattern 2: 자체 헤더 (NO_NAV 패턴)

Phase 6 RemediationDetailPage의 헤더 패턴을 그대로 복사. 모든 3개 페이지에 공통 적용.

```typescript
// 자체 헤더 — RemediationDetailPage에서 그대로 복사
<div style={{
  height: 48,
  background: 'rgba(22,27,34,0.97)',
  borderBottom: '1px solid var(--bd)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  position: 'relative', flexShrink: 0,
}}>
  <button onClick={() => navigate(-1)} style={{
    position: 'absolute', left: 12, width: 36, height: 36,
    border: 'none', background: 'none', cursor: 'pointer', color: 'var(--t1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>법적 점검</span>
</div>
```

### Pattern 3: usePhotoUpload 훅 재사용

지적 사진(before)과 조치 사진(after) 각각 별도 훅 인스턴스로 사용.

```typescript
// LegalFindingDetailPage.tsx
const beforePhoto = usePhotoUpload()  // 지적 사진 (등록 시)
const afterPhoto  = usePhotoUpload()  // 조치 사진 (조치 완료 시)
```

업로드 후 받은 key를 직접 API에 전달한다. usePhotoUpload.upload()는 `/api/uploads`에 POST하여 key를 반환한다.

**주의:** 현재 /api/uploads 는 key를 `inspections/{date}/{nanoid}.jpg` 또는 `documents/{date}/{nanoid}.pdf` 형태로 자동 생성한다. CONTEXT D-14~D-16의 `legal/{inspectionId}/...` 키 경로는 클라이언트가 제어하는 게 아니라 서버가 생성하는 것이므로, 실제로는 R2에 저장된 랜덤 key를 DB에만 저장하면 된다. 경로 패턴은 명세적 의미이고, 실제 R2 key는 자동 생성된다.

### Pattern 4: PDF 업로드

기존 /api/uploads 엔드포인트가 이미 `application/pdf` → `documents/` 디렉토리로 처리한다. PDF 업로드에 별도 엔드포인트 불필요.

```typescript
// PDF 업로드 (클라이언트)
async function uploadPdf(file: File): Promise<string | null> {
  const form = new FormData()
  form.append('file', file, file.name)   // PDF 파일 직접 첨부
  const res = await fetch('/api/uploads', {
    method: 'POST',
    body: form,
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  return json.success ? json.data.key : null
}
```

PDF 서빙은 `GET /api/uploads/{key}` → R2에서 스트리밍, Content-Type: application/pdf. 새 탭 열기는 `window.open('/api/uploads/' + key, '_blank')`.

### Pattern 5: API 핸들러 권한 분기

교육 API([id].ts)의 role 체크 패턴을 그대로 적용:

```typescript
// functions/api/legal/index.ts — POST (admin only)
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId, role } = data as any
  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 가능합니다' }, { status: 403 })
  }
  // ... 회차 생성 로직
}

// functions/api/legal/[id]/findings/index.ts — POST (all staff)
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  // 권한 체크 없음 — 전체 직원 허용
  // ... 지적사항 등록 로직
}
```

### Pattern 6: DB 마이그레이션

현재 최신 마이그레이션: `0037_elev_cert_and_weekly_menu.sql`. 다음 번호는 **0038**.

```sql
-- migrations/0038_legal_inspections.sql

CREATE TABLE IF NOT EXISTS legal_inspections (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  inspection_type  TEXT NOT NULL CHECK(inspection_type IN ('comprehensive','functional')),
  inspected_at     TEXT NOT NULL,  -- YYYY-MM-DD
  agency           TEXT NOT NULL,
  result           TEXT NOT NULL DEFAULT 'pass'
                   CHECK(result IN ('pass','fail','conditional')),
  report_file_key  TEXT,           -- R2 key for PDF
  memo             TEXT,
  created_by       TEXT NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);

CREATE TABLE IF NOT EXISTS legal_findings (
  id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  inspection_id         TEXT NOT NULL REFERENCES legal_inspections(id),
  description           TEXT NOT NULL,
  location              TEXT,
  photo_key             TEXT,       -- R2 key for before photo
  resolution_memo       TEXT,
  resolution_photo_key  TEXT,       -- R2 key for after photo
  status                TEXT NOT NULL DEFAULT 'open'
                        CHECK(status IN ('open','resolved')),
  resolved_at           TEXT,
  resolved_by           TEXT,
  created_by            TEXT NOT NULL,
  created_at            TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);

CREATE INDEX IF NOT EXISTS idx_legal_findings_inspection_id
  ON legal_findings(inspection_id);
CREATE INDEX IF NOT EXISTS idx_legal_findings_status
  ON legal_findings(status);
```

### Pattern 7: React Query 쿼리 키 구조

```typescript
// 회차 목록
queryKey: ['legal-inspections']

// 회차별 지적사항 목록
queryKey: ['legal-findings', inspectionId]

// 지적사항 상세
queryKey: ['legal-finding-detail', fid]
```

invalidateQueries 범위: 조치완료 후 ['legal-findings', id] + ['legal-finding-detail', fid] + ['legal-inspections'] (요약 카운트 갱신)

### Pattern 8: API 네임스페이스 (api.ts 추가)

```typescript
// src/utils/api.ts — 추가
export const legalApi = {
  // 회차
  listInspections: () =>
    api.get<LegalInspection[]>('/legal'),
  createInspection: (data: LegalInspectionCreate) =>
    api.post<{ id: string }>('/legal', data),
  updateInspection: (id: string, data: Partial<LegalInspectionCreate>) =>
    api.put<void>(`/legal/${id}`, data),

  // 지적사항
  listFindings: (inspectionId: string) =>
    api.get<LegalFinding[]>(`/legal/${inspectionId}/findings`),
  createFinding: (inspectionId: string, data: LegalFindingCreate) =>
    api.post<{ id: string }>(`/legal/${inspectionId}/findings`, data),
  getFinding: (inspectionId: string, fid: string) =>
    api.get<LegalFinding>(`/legal/${inspectionId}/findings/${fid}`),
  updateFinding: (inspectionId: string, fid: string, data: Partial<LegalFindingCreate>) =>
    api.put<void>(`/legal/${inspectionId}/findings/${fid}`, data),
  resolveFinding: (inspectionId: string, fid: string, data: LegalResolvePayload) =>
    api.post<void>(`/legal/${inspectionId}/findings/${fid}/resolve`, data),
}
```

### Anti-Patterns to Avoid

- **중첩 라우트 사용 금지:** 이 프로젝트는 React Router의 `<Outlet>` 중첩 라우트가 아닌 flat Routes + navigate(-1) 패턴을 사용한다. RemediationPage/DetailPage 선례 준수.
- **NO_NAV_PATHS에 동적 경로 넣지 않기:** `/legal/:id` 형태는 includes()가 매칭하지 않는다. showNav 조건에 regex 추가 필요.
- **lucide-react 사용 금지:** 프로젝트에 없는 의존성. 인라인 SVG 함수 사용 (AdminPage.tsx, EducationPage.tsx 패턴).
- **Prettier/ESLint 규칙 강요 금지:** 프로젝트에 포매터가 없다. 기존 코드 스타일(2칸 들여쓰기, 인라인 스타일, 싱글 쿼트) 준수.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 이미지 압축 | 직접 canvas 구현 | `imageUtils.compressImage()` | 이미 구현, EXIF 회전 처리 포함 |
| 사진 업로드 상태관리 | useState + fetch 직접 | `usePhotoUpload()` 훅 | blob URL 관리, 업로드, reset 내장 |
| JWT 추출/검증 | 직접 구현 | `functions/_middleware.ts` | ctx.data.staffId/role 자동 주입 |
| R2 파일 서빙 | 별도 파일 서빙 함수 | `GET /api/uploads/{key}` | 이미 구현, PDF 포함 |
| DB ID 생성 | UUID 라이브러리 | `lower(hex(randomblob(8)))` | D1 DEFAULT 표현식으로 DB에서 생성 |
| toast 알림 | 직접 UI 구현 | `react-hot-toast` | 이미 설치, 프로젝트 전체 사용 |

**Key insight:** 이 phase의 95%는 기존 패턴 조합이다. 새로 만드는 건 DB 테이블과 API 라우트, 페이지 3개뿐이다.

---

## Runtime State Inventory

> 이 phase는 신규 기능 추가이며 기존 데이터 rename/migration 없음.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | 없음 — legal_inspections/legal_findings 테이블 미존재 | 신규 마이그레이션으로 생성 |
| Live service config | SideMenu의 '법적 점검' item이 soon:true로 비활성 상태 | SideMenu.tsx 코드 수정 (soon:false) |
| OS-registered state | 없음 | 없음 |
| Secrets/env vars | 없음 | 없음 |
| Build artifacts | 없음 | 없음 |

---

## Common Pitfalls

### Pitfall 1: NO_NAV_PATHS 동적 경로 미처리
**What goes wrong:** `/legal` 만 NO_NAV_PATHS에 넣으면 `/legal/abc123` 에서 BottomNav가 표시된다.
**Why it happens:** `NO_NAV_PATHS.includes(location.pathname)` 은 정확한 문자열 매칭이라 동적 세그먼트를 인식하지 못한다.
**How to avoid:** showNav 조건에 `!location.pathname.match(/^\/legal\/.+/)` regex를 추가한다. App.tsx 54번째 줄 근처의 `showNav` 계산식 참조.
**Warning signs:** `/legal/:id` 페이지에서 BottomNav 4개 탭이 보인다.

### Pitfall 2: PDF 업로드 시 Content-Type 미설정
**What goes wrong:** File 객체의 type이 빈 문자열('')인 경우 uploads 핸들러가 `.jpg` 확장자로 잘못 저장한다.
**Why it happens:** 일부 브라우저/OS에서 PDF 파일의 MIME type을 자동 감지하지 못한다.
**How to avoid:** `form.append('file', file, file.name)` — 파일명을 명시적으로 전달하면 `resolveFileInfo()`의 확장자 추출 경로가 동작한다. 업로드 핸들러(`uploads/index.ts`)는 파일명 기반 확장자 fallback을 이미 구현하고 있다.
**Warning signs:** PDF 파일이 `documents/` 대신 `inspections/` 디렉토리에 저장되거나 `.jpg` 확장자가 붙는다.

### Pitfall 3: 회차 카드 지적/완료 건수 N+1 쿼리
**What goes wrong:** 회차 목록 API에서 각 회차별로 별도 SELECT를 실행하면 느려진다.
**Why it happens:** 단순 구현 시 loop 안에 쿼리를 넣기 쉽다.
**How to avoid:** `GROUP BY` + `COUNT` + `SUM` 으로 단일 JOIN 쿼리에서 summary를 가져온다:
```sql
SELECT
  li.*,
  COUNT(lf.id) as finding_count,
  SUM(CASE WHEN lf.status='resolved' THEN 1 ELSE 0 END) as resolved_count
FROM legal_inspections li
LEFT JOIN legal_findings lf ON lf.inspection_id = li.id
GROUP BY li.id
ORDER BY li.inspected_at DESC
```
**Warning signs:** 회차가 5개 이상일 때 API 응답 지연.

### Pitfall 4: 조치완료 후 queryClient invalidation 범위 부족
**What goes wrong:** 지적 상세에서 조치완료 처리 후 상위 목록 페이지의 "완료 건수" 카드가 갱신되지 않는다.
**Why it happens:** `['legal-finding-detail', fid]` 만 invalidate하면 상위 쿼리가 stale로 남는다.
**How to avoid:** 조치완료 성공 시 3개 쿼리 키 모두 invalidate:
```typescript
queryClient.invalidateQueries({ queryKey: ['legal-finding-detail', fid] })
queryClient.invalidateQueries({ queryKey: ['legal-findings', inspectionId] })
queryClient.invalidateQueries({ queryKey: ['legal-inspections'] })
```
**Warning signs:** 뒤로가기 후 회차 카드의 "완료 N건"이 업데이트되지 않음.

### Pitfall 5: 지적사항 등록 시 findingId가 없는 상태에서 사진 경로 결정
**What goes wrong:** D-14 `legal/{inspectionId}/findings/{findingId}/before/{timestamp}` 경로를 위해 findingId가 필요하지만, 등록 전이라 ID가 없다.
**How to avoid (이미 해결됨):** 현재 `/api/uploads`는 날짜+nanoid 기반 경로를 자동 생성하므로 D-14~D-16의 경로는 설계 의도이고 실제 구현은 자동 생성 key를 DB에 저장하는 방식으로 처리한다. 두 단계 접근: (1) 사진 먼저 업로드 → key 획득, (2) 지적사항 등록 시 photo_key 포함. RemediationDetailPage의 handleResolve() 패턴과 동일.

---

## Code Examples

### 회차 목록 GET API 핵심 쿼리

```typescript
// functions/api/legal/index.ts
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const rows = await env.DB.prepare(`
    SELECT
      li.id, li.inspection_type, li.inspected_at, li.agency,
      li.result, li.report_file_key, li.memo, li.created_at,
      COUNT(lf.id) AS finding_count,
      SUM(CASE WHEN lf.status='resolved' THEN 1 ELSE 0 END) AS resolved_count
    FROM legal_inspections li
    LEFT JOIN legal_findings lf ON lf.inspection_id = li.id
    GROUP BY li.id
    ORDER BY li.inspected_at DESC
  `).all()
  return Response.json({ success: true, data: rows.results ?? [] })
}
```

### 조치완료 API

```typescript
// functions/api/legal/[id]/findings/[fid]/resolve.ts
// 출처: resolve.ts in inspections/records/[recordId]/resolve.ts 패턴 그대로
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { staffId } = data as any
  const { id: inspectionId, fid } = params as { id: string; fid: string }
  const { resolution_memo, resolution_photo_key } =
    await request.json<{ resolution_memo?: string; resolution_photo_key?: string }>()

  const finding = await env.DB.prepare(
    `SELECT id, status FROM legal_findings WHERE id = ? AND inspection_id = ? LIMIT 1`
  ).bind(fid, inspectionId).first<{ id: string; status: string }>()

  if (!finding) return Response.json({ success: false, error: '지적사항 없음' }, { status: 404 })
  if (finding.status === 'resolved')
    return Response.json({ success: false, error: '이미 조치완료' }, { status: 409 })

  await env.DB.prepare(`
    UPDATE legal_findings
    SET status='resolved', resolution_memo=?, resolution_photo_key=?,
        resolved_at=datetime('now','+9 hours'), resolved_by=?
    WHERE id=?
  `).bind(resolution_memo ?? null, resolution_photo_key ?? null, staffId, fid).run()

  return Response.json({ success: true, data: { resolved: true } })
}
```

### SideMenu 활성화

```typescript
// SideMenu.tsx line 40 (현재)
{ label: '법적 점검', path: '/legal', badge: 0, soon: true  },

// 변경 후
{ label: '법적 점검', path: '/legal', badge: 0, soon: false },
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 별도 파일서버 | Cloudflare R2 + Workers | 프로젝트 초기 | PDF/이미지 통합 서빙 |
| Page-level navigation | NO_NAV_PATHS + 자체 헤더 | Phase 6 | 세부 페이지 전용 헤더 패턴 확립 |

**현재 상태:**
- 최신 마이그레이션: `0037_elev_cert_and_weekly_menu.sql` → 다음은 **0038**
- `/api/uploads`: PDF 업로드 지원 완료 (MIME_MAP에 `application/pdf` 포함)
- SideMenu: `법적 점검` item이 `soon:true`로 비활성화 상태

---

## Open Questions

1. **LegalPage(/legal) 자체 헤더 여부**
   - CONTEXT D-03: "모든 라우트 NO_NAV_PATHS에 포함"이므로 /legal도 GlobalHeader/BottomNav 없이 자체 헤더
   - 다만 /legal 은 리스트 화면이므로 뒤로가기보다 SideMenu 햄버거 버튼이 적합할 수 있음
   - Recommendation: 다른 NO_NAV 페이지(EducationPage, AdminPage) 방식 참조 — 자체 헤더에 타이틀만, 뒤로가기는 navigate(-1) 또는 navigate('/dashboard')

2. **점검회차 추가 모달 구현 방식**
   - AdminPage.tsx의 BottomSheet 스타일 모달이 선례
   - Recommendation: 동일 BottomSheet 패턴 (fixed bottom, slide-up) 사용

---

## Environment Availability

이 phase는 기존 Cloudflare 환경 위에서 동작하며 신규 외부 의존성이 없다.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Cloudflare D1 | DB | ✓ | 현재 바인딩 | — |
| Cloudflare R2 | 파일 저장 | ✓ | 현재 바인딩 | — |
| /api/uploads | PDF+이미지 업로드 | ✓ | 구현 완료 | — |
| usePhotoUpload | 이미지 훅 | ✓ | 구현 완료 | — |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | 없음 — 프로젝트에 테스트 프레임워크 미설정 |
| Config file | 없음 |
| Quick run command | `npm run build` (타입 체크 + 빌드로 검증) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LEGAL-01 | 점검회차 생성/조회 + PDF 업로드 | manual | 브라우저에서 직접 확인 | — |
| LEGAL-02 | 지적사항 등록 + 조치완료 처리 | manual | 브라우저에서 직접 확인 | — |

### Sampling Rate
- **Per task commit:** `npm run build` (타입 에러 없음 확인)
- **Per wave merge:** `npm run build`
- **Phase gate:** 빌드 성공 + 브라우저 E2E 확인 후 `/gsd:verify-work`

### Wave 0 Gaps
- 없음 — 기존 테스트 인프라 없음, 빌드 검증으로 대체

---

## Sources

### Primary (HIGH confidence)
- 직접 코드 읽기: `RemediationPage.tsx`, `RemediationDetailPage.tsx` — Phase 6 패턴
- 직접 코드 읽기: `usePhotoUpload.ts`, `imageUtils.ts` — R2 업로드 패턴
- 직접 코드 읽기: `functions/api/uploads/index.ts`, `[[path]].ts` — PDF 서빙 확인
- 직접 코드 읽기: `functions/_middleware.ts` — 권한 체크 패턴
- 직접 코드 읽기: `functions/api/education/index.ts`, `[id].ts` — role 분기 패턴
- 직접 코드 읽기: `App.tsx` — NO_NAV_PATHS, showNav 로직
- 직접 코드 읽기: `SideMenu.tsx` line 40 — soon:true 확인
- 직접 확인: `migrations/` 디렉토리 — 최신 마이그레이션 번호 0037 확인

### Secondary (MEDIUM confidence)
- CONTEXT.md D-19~D-21 — DB 스키마 명세 (user 결정사항)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 모든 의존성이 이미 설치되어 코드에서 직접 확인
- Architecture patterns: HIGH — Phase 6 선례 코드 직접 읽고 검증
- DB 스키마: HIGH — user 결정사항 + D1 SQL 패턴 직접 확인
- PDF 업로드: HIGH — uploads/index.ts에서 `application/pdf` 지원 직접 확인
- Pitfalls: HIGH — 기존 코드에서 패턴 확인 (NO_NAV_PATHS, invalidation)

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (안정적인 프로젝트 스택)

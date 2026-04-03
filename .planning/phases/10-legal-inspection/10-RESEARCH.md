# Phase 10: Legal Inspection - Research

**Researched:** 2026-04-03
**Domain:** Cloudflare Pages Functions + D1 SQLite + React (existing codebase extension)
**Confidence:** HIGH — all findings are from direct codebase inspection of existing patterns

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-00:** ~~legal_inspections 별도 테이블 제거~~ → schedule_items에서 category='fire' + 법적 점검 서브카테고리('소방 상반기 종합정밀점검', '소방 하반기 작동기능점검')를 직접 참조
- **D-00a:** 점검 회차 등록은 SchedulePage에서 수행 — LegalPage에 "점검 등록" BottomSheet 없음
- **D-00b:** legal_findings.schedule_item_id로 schedule_items와 연결 (legal_inspections FK 아님)
- **D-00c:** SchedulePage에는 추가로 '소방 시설물 공사', '소방 관공서 불시 점검' 서브카테고리도 있으나, LegalPage에서는 종합정밀+작동기능 2가지만 표시
- **D-00d:** schedule_items에 result(적합/부적합/조건부적합), report_file_key(PDF) 컬럼 추가 필요 — 관리자가 LegalPage에서 점검 결과와 보고서를 기록
- **D-01:** 점검회차 리스트 → 지적사항 목록 → 지적 상세 (3단계 구조)
- **D-02:** /legal → 회차 카드 리스트 (schedule_items 기반), /legal/:id → 지적사항 목록, /legal/:id/finding/:fid → 지적 상세(사진+조치)
- **D-03:** 모든 라우트 NO_NAV_PATHS에 포함. 자체 헤더(← 뒤로가기) + 페이지 제목
- **D-04:** SideMenu 시스템 섹션의 '법적 점검' soon:true → soon:false로 활성화
- **D-05:** 연 2회: 상반기 종합정밀점검 + 하반기 작동기능점검 — SchedulePage에서 등록
- **D-06:** schedule_items 기존 필드 활용: title(서브카테고리명), date, category='fire', inspection_category(서브카테고리)
- **D-06a:** schedule_items에 추가 컬럼: result(pass/fail/conditional, NULL 허용), report_file_key(TEXT, NULL 허용) — ALTER TABLE 마이그레이션
- **D-07:** 점검기관 결과 보고서 PDF를 R2에 업로드 (report_file_key). 관리자만 업로드 가능
- **D-08:** 회차 카드에 지적 건수 + 조치완료 건수 요약 표시
- **D-09:** 지적 기록: 지적 내용(텍스트) + 지적 시 사진(R2) + 위치 정보
- **D-10:** 조치 기록: 조치 내용(텍스트) + 조치 후 사진(R2)
- **D-11:** 상태: 미조치(open) / 조치완료(resolved). Phase 6 조치관리와 동일 2단계
- **D-12:** 전체 직원: 지적사항 등록, 지적/조치 사진 업로드, 조치 내용 기록
- **D-13:** 관리자만: 점검 결과(result) 기록, 지적사항 편집/정리, 결과 보고서 PDF 업로드
- **D-14:** 지적 사진: legal/{scheduleItemId}/findings/{findingId}/before/{timestamp}
- **D-15:** 조치 사진: legal/{scheduleItemId}/findings/{findingId}/after/{timestamp}
- **D-16:** 결과 보고서 PDF: legal/{scheduleItemId}/report/{timestamp}.pdf
- **D-17:** 기존 usePhotoUpload 훅 + imageUtils 재활용 (Phase 6 패턴)
- **D-18:** 1테이블만 신규: legal_findings (schedule_items는 ALTER TABLE로 컬럼 추가)
- **D-19:** schedule_items ALTER: result TEXT, report_file_key TEXT 추가
- **D-20:** legal_findings: id, schedule_item_id(FK → schedule_items.id), description, location, photo_key, resolution_memo, resolution_photo_key, status(open/resolved), resolved_at, resolved_by, created_by, created_at
- **D-21:** 마이그레이션: 0038_legal_findings.sql (schedule_items ALTER + legal_findings CREATE)

### Claude's Discretion

- 카드 디자인 상세 (기존 앱 스타일 일관성)
- 지적사항 목록 정렬 방식 (최신순/미조치 우선)
- 결과 보고서 PDF 뷰어 방식 (새 탭 열기 vs 인앱 뷰어)
- 위치 정보 입력 방식 (텍스트 자유 입력)
- 점검 결과 입력 UI (LegalPage 회차 카드에서 관리자가 결과 기록)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LEGAL-01 | 법적 점검 결과를 기록하고 서류를 업로드할 수 있다 (R2) | schedule_items ALTER (result + report_file_key), /api/uploads R2 endpoint already exists, legalApi.updateResult + uploadReport methods needed |
| LEGAL-02 | 지적사항을 등록하고 시정조치 기록/완료 확인할 수 있다 | legal_findings 신규 테이블 + /api/legal/:id/findings/* API + LegalFindingsPage + LegalFindingDetailPage |
</phase_requirements>

---

## Summary

Phase 10 은 기존 코드베이스에 대한 확장 작업이다. 새로운 기술 스택을 도입하지 않으며, 이미 구축된 Cloudflare Pages Functions + D1 + R2 패턴을 그대로 따른다.

**핵심 아키텍처 변경:** 이전 구현(롤백됨)은 legal_inspections 별도 테이블을 사용했다. 새 구현은 schedule_items 테이블을 참조한다. 기존 API 파일(`functions/api/legal/index.ts`, `[id].ts`, `[id]/findings/index.ts`, `[id]/findings/[fid].ts`)은 모두 old schema(inspection_id FK)로 작성되어 있으므로 완전히 재작성해야 한다.

**현재 상태 파악:** App.tsx에 3개 라우트 이미 배선됨, SideMenu에 '법적 점검' soon:false로 이미 활성화됨, 3개 페이지 파일은 placeholder stub 상태. 기존 API 함수들은 구 schema 기반이므로 재작성 대상이다.

**Primary recommendation:** API 재작성 → DB 마이그레이션 → 타입/클라이언트 → 3개 UI 페이지 순서로 진행. Plan 01과 Plan 02로 분리하되 Plan 01(백엔드)이 선행되어야 한다.

---

## Standard Stack

### Core (기존 프로젝트 스택, 변경 없음)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Cloudflare Pages Functions | N/A | 서버리스 API 핸들러 | 기존 프로젝트 표준 |
| Cloudflare D1 (SQLite) | N/A | 관계형 데이터 저장 | 기존 스키마 연장 |
| Cloudflare R2 | N/A | 사진/PDF 파일 저장 | 기존 /api/uploads 패턴 재활용 |
| React 18.3.1 | 18.3.1 | UI 렌더링 | 기존 프로젝트 표준 |
| @tanstack/react-query | 5.59.0 | 서버 상태 캐싱 | 기존 프로젝트 표준 |
| react-hot-toast | 2.4.1 | 알림 메시지 | 기존 프로젝트 표준 |

### Supporting (이번 Phase에서 재활용)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| usePhotoUpload | (internal hook) | 사진 선택/압축/업로드 | 지적 사진, 조치 사진 업로드 |
| compressImage | (imageUtils.ts) | 이미지 압축 | usePhotoUpload 내부에서 자동 호출 |
| PhotoButton | (components/PhotoButton.tsx) | 카메라/갤러리 버튼 UI | 사진 첨부 UI |

### No New Dependencies

새 npm 패키지 추가 없음. 기존 스택만 사용.

---

## Architecture Patterns

### 기존 API 파일 현황 (재작성 필요)

현재 `functions/api/legal/` 디렉토리에 4개 파일이 존재하지만 모두 old schema(legal_inspections 테이블, inspection_id FK) 기반으로 작성되어 있다. 신규 구현에서는:

- `functions/api/legal/index.ts` — GET: schedule_items(category='fire', inspection_category IN ['소방 상반기 종합정밀점검', '소방 하반기 작동기능점검']) 조회 + findings COUNT 집계. PATCH: admin만 result + report_file_key 업데이트
- `functions/api/legal/[id].ts` — GET: 단건 schedule_item 상세 + findings COUNT. 기존 PUT(legal_inspections UPDATE)은 제거, PATCH로 대체
- `functions/api/legal/[id]/findings/index.ts` — GET: legal_findings WHERE schedule_item_id=? ORDER BY open first, DESC. POST: 전 직원 등록
- `functions/api/legal/[id]/findings/[fid].ts` — GET: 단건 조회. PUT: admin 편집(description, location, photo_key). POST resolve: 전 직원 조치 완료 처리

**결정 필요:** [fid] resolve 작업을 별도 엔드포인트(/resolve)로 분리할지, PUT으로 통합할지. Phase 6 패턴(resolve 전용 POST 엔드포인트)을 따르는 것이 기존 일관성 측면에서 유리하다. 하지만 Functions 파일 라우팅 제약상 `/legal/:id/findings/:fid/resolve` 는 `findings/[fid]/resolve.ts`로 구현 가능하다.

### DB 스키마 변경 사항

**마이그레이션 번호:** 0038_legal_findings.sql (0037 다음, 0039는 CCTV로 이미 사용됨)

```sql
-- 1. schedule_items에 컬럼 추가
ALTER TABLE schedule_items ADD COLUMN result TEXT CHECK(result IN ('pass','fail','conditional'));
ALTER TABLE schedule_items ADD COLUMN report_file_key TEXT;

-- 2. legal_findings 신규 테이블
CREATE TABLE IF NOT EXISTS legal_findings (
  id                   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  schedule_item_id     TEXT NOT NULL REFERENCES schedule_items(id),
  description          TEXT NOT NULL,
  location             TEXT,
  photo_key            TEXT,
  resolution_memo      TEXT,
  resolution_photo_key TEXT,
  status               TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
  resolved_at          TEXT,
  resolved_by          TEXT REFERENCES staff(id),
  created_by           TEXT NOT NULL REFERENCES staff(id),
  created_at           TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);

CREATE INDEX idx_legal_findings_schedule_item ON legal_findings(schedule_item_id, status);
```

**주의:** 마이그레이션 번호 0038은 미사용 상태. 0035와 0036이 각각 2개씩 존재(meal/extinguisher, education/holidays)하는 이중 번호 이슈가 있으나 0038은 공백이므로 사용 가능하다.

### API 응답 형태 (기존 패턴 준수)

모든 응답은 `{ success: boolean; data?: T; error?: string }` 형태. camelCase 변환은 API 레이어에서 수행 (DB snake_case → response camelCase). 기존 `legal/index.ts`에서 확인된 패턴:

```typescript
// Source: cha-bio-safety/functions/api/legal/index.ts (기존 패턴 참고, 재작성 필요)
const data = (rows.results ?? []).map(r => ({
  id: r.id,
  scheduleItemId: r.schedule_item_id,   // camelCase 변환
  findingCount: Number(r.finding_count ?? 0),
  resolvedCount: Number(r.resolved_count ?? 0),
}))
```

### LegalPage 데이터 조회 쿼리

```sql
SELECT
  si.id, si.title, si.date, si.inspection_category, si.status, si.result, si.report_file_key,
  COUNT(lf.id) AS finding_count,
  SUM(CASE WHEN lf.status='resolved' THEN 1 ELSE 0 END) AS resolved_count
FROM schedule_items si
LEFT JOIN legal_findings lf ON lf.schedule_item_id = si.id
WHERE si.category = 'fire'
  AND si.inspection_category IN ('소방 상반기 종합정밀점검', '소방 하반기 작동기능점검')
GROUP BY si.id
ORDER BY si.date DESC
```

선택적 year 필터: `AND strftime('%Y', si.date) = ?`

### 타입 정의 추가 위치

`src/types/index.ts`에 추가:

```typescript
// Legal inspection types
export type LegalInspectionResult = 'pass' | 'fail' | 'conditional'
export type LegalFindingStatus = 'open' | 'resolved'

export interface LegalRound {
  id: string
  title: string
  date: string
  inspectionCategory: string
  status: string  // ScheduleStatus
  result: LegalInspectionResult | null
  reportFileKey: string | null
  findingCount: number
  resolvedCount: number
}

export interface LegalFinding {
  id: string
  scheduleItemId: string
  description: string
  location: string | null
  photoKey: string | null
  resolutionMemo: string | null
  resolutionPhotoKey: string | null
  status: LegalFindingStatus
  resolvedAt: string | null
  resolvedBy: string | null
  createdBy: string
  createdAt: string
}
```

### api.ts legalApi 네임스페이스

```typescript
// Source: src/utils/api.ts 패턴 (scheduleApi, remediationApi 등과 동일)
export const legalApi = {
  list: (year?: string) =>
    api.get<LegalRound[]>(`/legal${year ? `?year=${year}` : ''}`),
  get: (id: string) =>
    api.get<LegalRound>(`/legal/${id}`),
  updateResult: (id: string, result: string) =>
    api.patch<void>(`/legal/${id}`, { result }),
  uploadReport: (id: string, reportFileKey: string) =>
    api.patch<void>(`/legal/${id}`, { report_file_key: reportFileKey }),
  getFindings: (scheduleItemId: string) =>
    api.get<LegalFinding[]>(`/legal/${scheduleItemId}/findings`),
  createFinding: (scheduleItemId: string, body: { description: string; location?: string; photo_key?: string }) =>
    api.post<{ id: string }>(`/legal/${scheduleItemId}/findings`, body),
  getFinding: (scheduleItemId: string, fid: string) =>
    api.get<LegalFinding>(`/legal/${scheduleItemId}/findings/${fid}`),
  updateFinding: (scheduleItemId: string, fid: string, body: Record<string, any>) =>
    api.put<void>(`/legal/${scheduleItemId}/findings/${fid}`, body),
  resolveFinding: (scheduleItemId: string, fid: string, body: { resolution_memo: string; resolution_photo_key?: string }) =>
    api.post<void>(`/legal/${scheduleItemId}/findings/${fid}/resolve`, body),
}
```

**주의:** `api.patch` 메서드가 현재 `src/utils/api.ts`에 없다. PATCH는 scheduleApi.updateStatus에서 raw fetch로 구현되어 있다. `legalApi`에서도 동일하게 raw fetch를 사용하거나, `api` 객체에 `patch` 메서드를 추가해야 한다.

### 현재 App.tsx + SideMenu 상태

**App.tsx 확인 (line 57):**
```typescript
const NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/meal', '/education', '/admin', '/legal']
```
`/legal`은 이미 NO_NAV_PATHS에 포함되어 있다. 그러나 `/legal/:id`와 `/legal/:id/finding/:fid`는 별도 패턴 매치가 필요하다.

**App.tsx line 73-74:**
```typescript
&& !location.pathname.match(/^\/remediation\/.+/)
&& !location.pathname.match(/^\/legal\/.+/)
```
`/legal/.+` 패턴 매치가 이미 존재한다. `/legal/:id`와 `/legal/:id/finding/:fid`는 자동으로 nav 숨김 처리된다.

**App.tsx 라우팅 (line 145-147):**
```typescript
<Route path="/legal"                      element={<Auth><LegalPage /></Auth>} />
<Route path="/legal/:id"                  element={<Auth><LegalFindingsPage /></Auth>} />
<Route path="/legal/:id/finding/:fid"     element={<Auth><LegalFindingDetailPage /></Auth>} />
```
라우팅 배선 이미 완료되어 있다. 추가 작업 불필요.

**SideMenu.tsx (line 39):**
```typescript
{ label: '법적 점검',   path: '/legal',      badge: 0, soon: false },
```
`soon: false`로 이미 활성화되어 있다. D-04 작업 이미 완료됨.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 이미지 압축 | 직접 Canvas API 처리 | `compressImage` (imageUtils.ts) | 기존 파이프라인 |
| R2 파일 업로드 | 직접 R2 API 호출 | `usePhotoUpload` 훅 + `/api/uploads` 엔드포인트 | 기존 패턴, 인증 처리 포함 |
| JWT 인증 주입 | 직접 헤더 추가 | `api.get/post/put/delete` 헬퍼 | 기존 패턴, 자동 Bearer 주입 |
| PDF 뷰어 | 인앱 PDF 렌더링 | `window.open(url, '_blank')` | UI-SPEC 결정 (새 탭) |
| 날짜 포맷 | 커스텀 포맷 함수 | fmtDate 로컬 헬퍼 (기존 페이지에서 복사) | 프로젝트 패턴 |
| 스켈레톤 UI | 커스텀 애니메이션 | 기존 SKELETON_STYLE + blink keyframe | RemediationPage 패턴 |

---

## Common Pitfalls

### Pitfall 1: PATCH 메서드 미지원
**What goes wrong:** `api.patch()`를 호출하면 ReferenceError. `src/utils/api.ts`의 `api` 객체는 GET/POST/PUT/DELETE만 정의되어 있다.
**Why it happens:** scheduleApi.updateStatus는 raw `fetch`를 직접 사용한다.
**How to avoid:** `api` 객체에 `patch` 메서드를 추가하거나, legalApi에서 raw fetch 사용. 전자가 더 깔끔하다.
**Warning signs:** TypeScript 컴파일 에러 `Property 'patch' does not exist`.

### Pitfall 2: schedule_items의 assignee_id NOT NULL 제약
**What goes wrong:** schedule_items 테이블에서 assignee_id는 NOT NULL이며 staff.id를 참조한다 (0001_init.sql line 61). 기존 schedule API는 POST 시 body.assigneeId가 없으면 staffId(로그인 사용자)를 fallback으로 사용한다. legal API에서 schedule_items를 직접 조회할 때는 문제없지만, 혹시 INSERT가 필요하면 반드시 valid staffId를 제공해야 한다.
**How to avoid:** LegalPage에서는 INSERT 없음 (SchedulePage에서만 등록). 조회 전용이므로 이 문제는 발생하지 않는다.

### Pitfall 3: 마이그레이션 번호 충돌
**What goes wrong:** 0035와 0036이 각각 두 번 사용되었다. 0037도 있다. 0038은 비어있다. 0039는 CCTV로 사용됨.
**How to avoid:** 0038을 사용한다. `0038_legal_findings.sql`로 명명.
**Warning signs:** Wrangler migrations 목록에서 중복 또는 순서 이상 경고.

### Pitfall 4: 기존 legal API 파일 재사용 불가
**What goes wrong:** `functions/api/legal/index.ts`는 `legal_inspections` 테이블을 참조한다. 이 테이블은 롤백으로 존재하지 않는다. 기존 파일을 그대로 두면 런타임에 `no such table: legal_inspections` 오류 발생.
**How to avoid:** 4개 파일 모두 완전히 재작성. 기존 파일 내용을 참고 패턴으로만 활용.
**Warning signs:** D1 500 에러, `no such table` 메시지.

### Pitfall 5: resolved_at 타임존
**What goes wrong:** `datetime('now')` 는 UTC를 반환한다. 기존 코드(resolve.ts line 18)는 `datetime('now','+9 hours')`를 사용한다.
**How to avoid:** legal_findings 테이블 DEFAULT와 resolve 업데이트 모두 `datetime('now','+9 hours')` 사용.

### Pitfall 6: photo_key 경로 규칙 불일치
**What goes wrong:** usePhotoUpload 훅은 `/api/uploads`로 파일을 POST하고 서버가 key를 결정한다. D-14~D-16에서 정의한 경로(`legal/{scheduleItemId}/findings/{findingId}/before/{timestamp}`)를 사용하려면 업로드 API가 key prefix를 지원하거나, 업로드 후 key를 서버에서 재설정해야 한다.
**Research finding:** 기존 `/api/uploads` 엔드포인트가 어떻게 key를 생성하는지 확인 필요. 기존 패턴(RemediationDetailPage)에서는 업로드된 key를 그대로 사용한다. 커스텀 prefix가 필요하면 업로드 시 `folder` 파라미터를 추가하거나, 업로드 후 DB에 key를 저장하는 방식으로 처리한다. 실용적 접근: prefix 없이 uploads API가 생성한 key를 그대로 사용하고, DB에서 context로 구분한다.

---

## Code Examples

### Schedule items with legal subcategories query

```typescript
// Source: cha-bio-safety/functions/api/legal/index.ts (재작성 후)
const LEGAL_SUBCATS = ['소방 상반기 종합정밀점검', '소방 하반기 작동기능점검']
const rows = await env.DB.prepare(`
  SELECT
    si.id, si.title, si.date, si.inspection_category, si.status,
    si.result, si.report_file_key,
    COUNT(lf.id) AS finding_count,
    SUM(CASE WHEN lf.status='resolved' THEN 1 ELSE 0 END) AS resolved_count
  FROM schedule_items si
  LEFT JOIN legal_findings lf ON lf.schedule_item_id = si.id
  WHERE si.category = 'fire'
    AND si.inspection_category IN ('소방 상반기 종합정밀점검', '소방 하반기 작동기능점검')
  GROUP BY si.id
  ORDER BY si.date DESC
`).all()
```

### PATCH handler pattern (schedule_items result update)

```typescript
// Source: cha-bio-safety/functions/api/schedule/[id].ts onRequestPatch 패턴 참고
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { role } = data as any
  const id = params.id as string
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 가능합니다' }, { status: 403 })
  const body = await request.json<{ result?: string; report_file_key?: string }>()
  await env.DB.prepare(`
    UPDATE schedule_items
    SET result = COALESCE(?, result),
        report_file_key = COALESCE(?, report_file_key),
        updated_at = datetime('now','+9 hours')
    WHERE id = ?
  `).bind(body.result ?? null, body.report_file_key ?? null, id).run()
  return Response.json({ success: true })
}
```

### Resolve finding pattern

```typescript
// Source: cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts 패턴
// legal findings resolve: functions/api/legal/[id]/findings/[fid]/resolve.ts
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { staffId } = data as any
  const { id, fid } = params as { id: string; fid: string }
  const { resolution_memo, resolution_photo_key } = await request.json<{
    resolution_memo: string; resolution_photo_key?: string
  }>()
  if (!resolution_memo?.trim()) return Response.json({ success: false, error: '조치 내용을 입력하세요' }, { status: 400 })
  await env.DB.prepare(`
    UPDATE legal_findings
    SET status='resolved', resolution_memo=?, resolution_photo_key=?,
        resolved_at=datetime('now','+9 hours'), resolved_by=?
    WHERE id=? AND schedule_item_id=? AND status='open'
  `).bind(resolution_memo, resolution_photo_key ?? null, staffId, fid, id).run()
  return Response.json({ success: true })
}
```

### LegalFindingDetailPage self-contained header pattern

```typescript
// Source: cha-bio-safety/src/pages/RemediationDetailPage.tsx lines 74-108
// 동일한 헤더 패턴 재사용
<div style={{
  height: 48,
  background: 'rgba(22,27,34,0.97)',
  borderBottom: '1px solid var(--bd)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  position: 'relative', flexShrink: 0,
}}>
  <button onClick={() => navigate(-1)} style={{ position:'absolute', left:12, width:36, height:36, border:'none', background:'none', cursor:'pointer' }}>
    {/* chevron-left SVG */}
  </button>
  <span style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>지적 상세</span>
</div>
```

### React Query invalidation after resolve

```typescript
// Source: cha-bio-safety/src/pages/RemediationDetailPage.tsx lines 61-64
queryClient.invalidateQueries({ queryKey: ['legal-findings', scheduleItemId] })
queryClient.invalidateQueries({ queryKey: ['legal-finding', fid] })
queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
```

---

## State of the Art

| Old Approach (롤백된 구현) | New Approach | 이유 |
|---------------------------|--------------|------|
| legal_inspections 별도 테이블 | schedule_items 직접 참조 | 점검 회차가 SchedulePage에서 등록되므로 중복 데이터 제거 |
| legal_findings.inspection_id FK | legal_findings.schedule_item_id FK | 연결 대상 테이블 변경 |
| GET /api/legal → legal_inspections JOIN | GET /api/legal → schedule_items JOIN | 쿼리 소스 변경 |
| POST /api/legal (회차 생성) | GET only + PATCH (결과/보고서만) | 등록은 SchedulePage에서 수행 |

---

## Open Questions

1. **usePhotoUpload 훅의 upload key 제어 가능 여부**
   - What we know: `usePhotoUpload.upload()`는 `/api/uploads`로 POST하고 반환된 key를 그대로 사용한다. key 생성 로직은 서버 사이드.
   - What's unclear: `/api/uploads` 엔드포인트가 folder prefix 파라미터를 지원하는지 확인 필요.
   - Recommendation: `/api/uploads` 소스를 확인하고, prefix 미지원 시 현재 key를 그대로 DB에 저장하는 방식으로 단순화. D-14~D-16의 경로 규칙은 "의도된 구조"로 문서화만 하고 실제 key는 upload API가 결정하도록 위임.

2. **api.ts에 PATCH 메서드 추가 여부**
   - What we know: 기존 `api` 객체에 patch가 없다. scheduleApi는 raw fetch를 사용한다.
   - Recommendation: `api` 객체에 `patch` 추가가 가장 일관성 있다. 한 줄 추가: `patch: <T>(p: string, b: unknown) => req<T>(p, { method:'PATCH', body: JSON.stringify(b) })`

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — pure codebase extension of existing Cloudflare stack)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | 없음 — 자동화 테스트 미구성 |
| Config file | 없음 |
| Quick run command | 없음 |
| Full suite command | 없음 |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LEGAL-01 | 점검 결과 저장 + PDF 업로드 | manual | — | ❌ manual only |
| LEGAL-02 | 지적사항 등록 + 조치 완료 | manual | — | ❌ manual only |

### Sampling Rate

- **Per task:** 수동 브라우저 확인 (wrangler dev 환경)
- **Per wave:** 전체 3개 페이지 흐름 수동 검증
- **Phase gate:** LEGAL-01 + LEGAL-02 각 시나리오 완료 전 `/gsd:verify-work` 실행 금지

### Wave 0 Gaps

자동화 테스트 인프라 없음. 기존 프로젝트 패턴상 수동 QA로 대체. Wave 0 테스트 설정 작업 없음.

---

## Project Constraints (from CLAUDE.md)

- Tech stack: Cloudflare 생태계 고정 (Pages + D1 + R2 + Workers) — 추가 비용 $0
- TypeScript strict: false (lenient mode)
- 인라인 스타일 + CSS 변수 사용 (Tailwind 클래스가 아닌 style 객체)
- lucide-react 없음 — inline SVG 함수 사용 (AdminPage.tsx 패턴)
- API 응답: `{ success: boolean; data?: T; error?: string }`
- 에러 메시지: 한국어
- 라우트 핸들러: `onRequestGet`, `onRequestPost` 등 named export
- 데이터 무결성: 지적사항 삭제 불가 (append-only, UI-SPEC 확인됨)
- DB 타임존: `datetime('now','+9 hours')` 사용 (KST)
- React Query queryKey 명명: `['legal-rounds']`, `['legal-findings', id]`, `['legal-finding', fid]`

---

## Sources

### Primary (HIGH confidence — 직접 소스 코드 검사)

- `cha-bio-safety/src/App.tsx` — 라우팅 배선, NO_NAV_PATHS 현황
- `cha-bio-safety/src/components/SideMenu.tsx` — 메뉴 활성화 현황 (soon:false 이미 적용됨)
- `cha-bio-safety/src/pages/RemediationPage.tsx` — 카드 리스트 UI 패턴
- `cha-bio-safety/src/pages/RemediationDetailPage.tsx` — 상세 페이지, resolve, 자체 헤더 패턴
- `cha-bio-safety/src/hooks/usePhotoUpload.ts` — 사진 업로드 훅 인터페이스
- `cha-bio-safety/src/utils/api.ts` — API 클라이언트 패턴, PATCH 미지원 확인
- `cha-bio-safety/src/types/index.ts` — 현재 타입 정의
- `cha-bio-safety/functions/api/legal/index.ts` — 구 구현 (재작성 필요)
- `cha-bio-safety/functions/api/legal/[id].ts` — 구 구현 (재작성 필요)
- `cha-bio-safety/functions/api/legal/[id]/findings/index.ts` — 구 구현 (재작성 필요)
- `cha-bio-safety/functions/api/legal/[id]/findings/[fid].ts` — 구 구현 (재작성 필요)
- `cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts` — resolve 패턴
- `cha-bio-safety/functions/api/schedule/index.ts` — schedule_items 조회/삽입 패턴
- `cha-bio-safety/functions/api/schedule/[id].ts` — PATCH 패턴 (raw result update)
- `cha-bio-safety/functions/_middleware.ts` — Env 타입, auth ctx.data 형태
- `cha-bio-safety/migrations/0001_init.sql` — schedule_items 기본 스키마
- `cha-bio-safety/migrations/0029_schedule_inspection_category.sql` — ALTER TABLE 패턴
- `cha-bio-safety/src/pages/SchedulePage.tsx` — FIRE_SUBCATS 상수 확인
- `.planning/phases/10-legal-inspection/10-UI-SPEC.md` — UI 컴포넌트 스펙

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 기존 프로젝트 스택 그대로, 신규 의존성 없음
- Architecture: HIGH — 직접 소스 코드 검사로 확인
- Pitfalls: HIGH — 기존 코드의 구체적 제약 사항 직접 확인
- DB schema: HIGH — 마이그레이션 파일 전수 확인

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (안정적 스택, 변경 거의 없음)

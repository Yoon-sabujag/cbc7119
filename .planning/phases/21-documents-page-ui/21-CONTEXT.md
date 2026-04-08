# Phase 21: Documents Page UI - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 20에서 구축한 문서 저장 백엔드(R2 multipart + D1 `documents` + list/download API)를 사용자에게 노출하는 프론트엔드 UI. DocumentsPage 라우트를 만들고, SideMenu 진입, 타입별 목록/다운로드, admin 업로드(진행률+에러처리), 연도별 이력 조회를 제공한다. 백엔드 API 계약 및 권한 정책은 이미 Phase 20에서 고정됨 — 이 Phase는 순수 UI wiring.

</domain>

<decisions>
## Implementation Decisions

### Page Layout
- **D-01:** 라우트 `/documents`, 컴포넌트 `src/pages/DocumentsPage.tsx`. React Router `App.tsx`의 lazy import 패턴 준수.
- **D-02:** 두 문서 타입(`plan` 소방계획서 / `drill` 소방훈련자료)을 하나의 페이지에 표시.
- **D-03:** **모바일: 상단 탭 전환** — 기존 InspectionPage/LegalPage 탭 패턴 재사용. 한 번에 한 타입만 렌더. 기본 탭은 `plan`(소방계획서).
- **D-04:** **데스크톱(≥1024px): 2컬럼 레이아웃** — 좌측 `plan`, 우측 `drill`. max-width ~1200px 중앙 정렬, 컬럼 간 gap. 반응형 분기는 기존 페이지에서 쓰는 CSS 패턴 따름.
- **D-05:** 두 타입 공통 섹션 컴포넌트 하나(`DocumentSection`)를 만들고 `type` prop으로 재사용 — 모바일 탭과 데스크톱 2컬럼 양쪽에서 동일 컴포넌트.

### Data Fetching
- **D-06:** React Query로 `GET /api/documents?type=plan`, `GET /api/documents?type=drill` 각각 조회. `staleTime: 60_000`, queryKey: `['documents', type]`.
- **D-07:** 업로드 성공 시 해당 타입 queryKey `invalidateQueries` → 목록 즉시 반영 (Success Criteria #3).
- **D-08:** `src/utils/api.ts`에 `documentsApi` namespace 신설: `list(type)`, `download(id)`(window.open 래퍼), `multipartCreate/uploadPart/complete/abort`.

### History Display
- **D-09:** **최신본 강조 카드 + 아래 '과거 이력' 리스트** 구조:
  - 상단: 가장 최근 `year DESC, uploaded_at DESC` 1건을 큰 다운로드 카드(제목, 연도, 파일명, 크기, 업로더, 업로드일시).
  - 하단: '과거 이력' 헤더 + 나머지 항목을 컴팩트 리스트로 `year DESC` 나열. 각 행에 연도/제목/크기/업로더/업로드일시.
- **D-10:** 과거 이력이 0건이면 '과거 이력' 섹션 자체를 숨김. 전체 0건이면 EmptyState("아직 업로드된 문서가 없습니다").
- **D-11:** 정렬은 서버가 이미 처리 — 클라이언트 재정렬 불필요.

### Download Behavior
- **D-12:** 최신본 카드 탭 OR 과거 이력 행 전체 탭 → `window.open('/api/documents/{id}', '_self')` 패턴으로 이동(iOS PWA 호환 — Phase 20 D-14 참조). 별도 아이콘 버튼 두지 않음.
- **D-13:** 다운로드는 Authorization 헤더가 필요 — 현재 `/api/uploads/[[path]]` 공개 라우트와 달리 `/api/documents/{id}`는 보호됨. 따라서 순수 `window.open`으로는 토큰 전송이 안 됨. **해결책**: 다운로드 클릭 시 클라이언트가 `fetch`로 Authorization 포함 요청 → `Blob` 응답 → `Blob URL` 생성 → `<a download>` 프로그래매틱 클릭(iOS도 동작). 진행 중에는 "다운로드 중..." 인디케이터.
  - 이 패턴은 새 유틸 `src/utils/downloadBlob.ts`로 추출해 추후 재사용 가능.
- **D-14:** 파일명은 서버 응답 `Content-Disposition: filename*=UTF-8''` 에서 파싱 시도, 실패 시 메타데이터의 `filename` 사용.

### Upload UX (admin only)
- **D-15:** `useAuthStore().staff?.role === 'admin'` 체크. 비-admin에게는 업로드 버튼 **완전히 숨김** (Success Criteria #3·#5 클라이언트 측 강화 — 서버 403도 이미 보장됨).
- **D-16:** **모바일: BottomSheet 업로드 폼** — 기존 InspectionPage/LegalFindingsPage BottomSheet 패턴 재사용. 플로팅 액션 버튼 또는 탭 상단 우측 '+' 버튼으로 오픈.
- **D-17:** **데스크톱: 중앙 Modal 업로드 폼** — 오버레이 + 중앙 카드. 같은 폼 내용을 Modal 컨테이너에 렌더. `DocumentUploadForm` 컴포넌트를 BottomSheet/Modal 양쪽 컨테이너에 재사용.
- **D-18:** 폼 필드:
  1. **연도**: 드롭다운 `<select>`, 기본값 `new Date().getFullYear()`, 옵션 범위 2020~현재년도+1.
  2. **제목**: text input, placeholder "예: 2026년 소방계획서", required.
  3. **파일**: `<input type="file" accept=".pdf,.xlsx,.docx,.hwp,.zip">`. 선택 시 파일명/크기 표시. 200MB 초과면 클라이언트에서 즉시 거부.
- **D-19:** 제목 자동 프리필: 파일 선택 시 제목이 비어 있으면 `{year}년 소방계획서` / `{year}년 소방훈련자료` 로 자동 채움 (사용자가 수정 가능).

### Multipart Upload Orchestration
- **D-20:** 클라이언트 로직: `create` → 파일을 10MB part로 slice → 순차적으로 `upload-part` 호출(partNumber 1부터) → 모든 part의 `{partNumber, etag}` 수집 → `complete` 호출. 순차(병렬 X) — 4인 팀 사용량 고려 단순성 우선.
- **D-21:** Part size **10MB 고정**(Phase 20 D-12 권장). 마지막 part는 남는 만큼.
- **D-22:** Part 실패 시 자동 재시도 없음 — 즉시 실패 처리(D-26 플로우).
- **D-23:** 업로드 중 페이지 이탈 방지: `beforeunload` 리스너로 "업로드 중입니다. 나가시겠습니까?" 확인.

### Progress Display
- **D-24:** 업로드 진행률: **전체 % + 업로드 속도(MB/s) + 예상 남은 시간**.
  - 누적 업로드 바이트 / 전체 바이트 = %.
  - 지난 3초 rolling average로 속도 계산.
  - 남은 바이트 / 속도 = ETA(분:초).
- **D-25:** BottomSheet/Modal 내부에 진행률 바 + 숫자 표시. 업로드 중에는 폼 입력 비활성화 + 취소 버튼만 활성화.

### Error & Cancel Handling
- **D-26:** 에러 또는 사용자 취소 시:
  1. `multipart/abort` 호출(R2 orphan 정리).
  2. Toast로 한글 에러 메시지 표시 (예: "업로드 실패: 네트워크 오류").
  3. BottomSheet/Modal은 유지 — 사용자가 **재시도 버튼** 눌러 동일 파일로 재업로드 가능(create부터 새로 시작).
  4. 취소 버튼은 abort 후 BottomSheet 닫음.
- **D-27:** `abort` 자체가 실패해도 UI는 에러만 표시하고 계속 — R2 orphan은 드문 케이스라 수용.

### SideMenu Integration
- **D-28:** SideMenu `MENU` 상수(`src/components/SideMenu.tsx`)의 **'문서 관리' 섹션**에 새 항목 추가: `{ label: '소방계획서/훈련자료', path: '/documents', badge: 0, soon: false }`. 기존 섹션 헤더 '문서 관리'가 점검일지/월간계획과 의미적으로 동일 카테고리 — 자연스러움.
- **D-29:** Phase 18 menu_config 마이그레이션 고려: 새 MenuEntry가 기존 저장된 `menu_config.sideMenu`에 자동 포함되도록 서버 측 default merge 로직(`functions/api/settings/menu.ts` 또는 유사)을 확인/수정 필요. 기존 사용자 설정에 새 항목이 추가되어야 메뉴에 보임.
  - 이 부분은 researcher/planner가 Phase 18 구조를 정확히 확인한 후 구현 경로 결정.
- **D-30:** `DesktopSidebar.tsx`에도 동일하게 반영되는지 확인 (기존 SideMenu 확장 시 자동 반영 여부에 따라).
- **D-31:** admin/assistant 모두 메뉴 노출. 페이지 내부에서 업로드 권한만 분기(D-15).

### Routing & Code Splitting
- **D-32:** `App.tsx`에 lazy import + Suspense 래핑 기존 패턴 그대로 적용.
- **D-33:** 라우트 보호는 기존 Auth wrapper 자동 적용 (로그인 필요).

### Claude's Discretion
- 탭/카드의 정확한 간격, 타이포, 색상은 기존 페이지와 시각적 일관성 유지 범위에서 자유
- BottomSheet/Modal 높이, 애니메이션 세부
- Progress bar 컴포넌트 재사용 vs 인라인 구현
- Toast 문구 한글 카피
- 다운로드 중 인디케이터 형태 (스피너 vs 프로그레스)
- rolling average window 세부 구현
- EmptyState 일러스트/아이콘 선택

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` §문서 중앙 관리 — DOC-01..06 (UI 요구), DOC-07 (메타데이터)
- `.planning/ROADMAP.md` §"Phase 21: Documents Page UI" — goal + success criteria
- `.planning/phases/20-document-storage/20-CONTEXT.md` — Phase 20 확정 API 계약 전체 (D-01..D-25)
- `.planning/phases/20-document-storage/20-SUMMARY.md` — Phase 20 구현 결과 요약
- `.planning/phases/20-document-storage/20-VERIFICATION.md` — 실제 배포된 API 동작 확인

### Backend API (구현 완료)
- `cha-bio-safety/functions/api/documents/index.ts` — GET list (type/year 필터)
- `cha-bio-safety/functions/api/documents/[id].ts` — GET download (스트리밍, Content-Disposition UTF-8)
- `cha-bio-safety/functions/api/documents/multipart/create.ts` — POST create (admin only)
- `cha-bio-safety/functions/api/documents/multipart/upload-part.ts` — PUT part (admin only)
- `cha-bio-safety/functions/api/documents/multipart/complete.ts` — POST complete (admin only)
- `cha-bio-safety/functions/api/documents/multipart/abort.ts` — POST abort (admin only)
- `cha-bio-safety/functions/api/documents/_helpers.ts` — 공용 헬퍼 (타입 정의 참고)

### Frontend patterns to reuse
- `cha-bio-safety/src/App.tsx` — lazy route 등록 패턴
- `cha-bio-safety/src/components/SideMenu.tsx` — MENU 상수, ITEM_META, admin role gating(`meta.role`), Phase 18 `appliedEntries` 평면 리스트 구조
- `cha-bio-safety/src/components/DesktopSidebar.tsx` — 데스크톱 사이드바 (동기화 필요)
- `cha-bio-safety/src/pages/LegalFindingsPage.tsx` / `InspectionPage.tsx` — BottomSheet 폼 패턴
- `cha-bio-safety/src/pages/AdminPage.tsx` — admin 전용 UI 노출 패턴(useAuthStore role 체크)
- `cha-bio-safety/src/utils/api.ts` — `req<T>()` wrapper, namespace 패턴(`dashboardApi`, `inspectionApi` 참고)
- `cha-bio-safety/src/stores/authStore.ts` — `useAuthStore().staff?.role`
- `cha-bio-safety/functions/api/settings/menu.ts` (존재한다면) — Phase 18 menu_config default/merge 로직
- `.planning/phases/18-menu-customization/` — Phase 18 CONTEXT/PLAN (MenuEntry 구조, default merge 규칙)

### External / Platform
- iOS PWA Blob 다운로드: `<a download>` + `URL.createObjectURL(blob)` 프로그래매틱 클릭 패턴 (iOS 16.3+ 지원)
- Content-Disposition `filename*=UTF-8''` 파싱 (RFC 5987)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **BottomSheet pattern** — LegalFindingsPage/InspectionPage 내부에 있는 바텀시트 구조 (래퍼 컴포넌트 유무는 research 단계에서 확인)
- **api.ts `req<T>()`** — 표준 fetch wrapper, Authorization 자동 주입, 401 시 자동 로그아웃
- **useAuthStore** — Zustand persist store, role 체크용
- **React Query** — 이미 전역 QueryClient 설정됨, staleTime 패턴 확립
- **Toast** — `react-hot-toast` 사용 중(기존 페이지 참고)
- **SideMenu MENU 상수** — 정적 선언 + Phase 18 `menu_config` 동적 오버레이 조합

### Established Patterns
- 파일 라우팅(backend): `functions/api/{resource}/...` — Phase 20에서 이미 `documents/` 생성됨
- 페이지 라우팅(frontend): `src/pages/XxxPage.tsx` + `App.tsx` lazy 등록
- 에러 처리: try/catch → toast.error(한글)
- 인라인 스타일 + CSS variable (`var(--bg)`, `var(--t1)`, ...) 기반 테마
- 모바일 우선 + 데스크톱 분기는 media query 또는 window width 훅

### Integration Points
- `src/App.tsx` — 새 라우트 `/documents` 추가
- `src/components/SideMenu.tsx` MENU + `src/components/DesktopSidebar.tsx` — 메뉴 항목 추가
- `src/utils/api.ts` — `documentsApi` namespace 추가
- (가능성) Phase 18 menu_config default merge — 새 항목이 기존 저장본에 병합되도록
- 새 파일: `src/pages/DocumentsPage.tsx`, `src/components/DocumentSection.tsx`, `src/components/DocumentUploadForm.tsx`, `src/utils/downloadBlob.ts`, `src/utils/multipartUpload.ts`

### Constraints from existing code
- Phase 20 API는 이미 배포됨 — UI에서 API 계약을 바꿀 수 없음
- iOS 16.3+ PWA 호환 필수 — Blob download 경로만 사용 가능
- `strict: false` TypeScript — 과도한 타입 체조 불필요

</code_context>

<specifics>
## Specific Ideas

- 4인 내부 팀, 업로드는 월 1~2회 — 단순/명확 우선, 엣지케이스 과대설계 금지
- 모바일 BottomSheet + 데스크톱 Modal 이중 컨테이너는 동일 폼 컴포넌트로 구현
- 진행률은 "수분 걸리는 130MB 업로드"에서 사용자 불안 해소가 목적 — % + 속도 + ETA 3종 세트
- 재시도 UX는 "같은 파일 다시"가 가장 흔한 케이스이므로 폼 상태 유지
- 파일명 한글(소방계획서.pdf) 완전 지원 — 다운로드 시 파일명 깨짐 없어야 함
- 일반 staff 페이지 진입은 허용 (읽기 전용) — 업로드 버튼만 숨김

</specifics>

<deferred>
## Deferred Ideas

- 삭제 UI(admin 실수 복구) — v1.5+
- PDF 미리보기 — 다운로드만 제공
- 드래그앤드롭 업로드 — Phase 범위 외
- 병렬 part 업로드 — 4인 사용 패턴에서 불필요
- 업로드 히스토리 / audit log UI — `uploaded_by + uploaded_at` 메타로 충분
- 자동 part 재시도 — 네트워크 복구 드물고 재시도 버튼으로 해결
- 대용량 파일 분할 재개(resume) — abort 후 처음부터가 더 단순
- 타 문서 타입(작동응급계획서 등) — 별도 마이그레이션 필요

</deferred>

---

*Phase: 21-documents-page-ui*
*Context gathered: 2026-04-09*

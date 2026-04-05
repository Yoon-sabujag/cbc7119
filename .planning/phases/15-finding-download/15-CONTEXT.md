# Phase 15: Finding Download - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

법적 점검 지적사항의 내용+사진을 건별 또는 일괄 ZIP으로 다운로드. 클라이언트사이드 전용 (새 API 엔드포인트 불필요). iOS PWA 홈 화면 모드에서도 동작해야 한다.

</domain>

<decisions>
## Implementation Decisions

### 건별 다운로드
- **D-01:** 건별 다운로드 버튼을 LegalFindingDetailPage 헤더에 배치
- **D-02:** HTML 페이지를 새 탭(window.open)으로 열어 인쇄/PDF 저장 방식 — 메타데이터(항목, 위치, 상태, 날짜, 담당자) + base64 인코딩된 사진 포함
- **D-03:** 관리자(admin)만 다운로드 버튼 표시 (보고서 작성 용도)

### 일괄 ZIP 다운로드
- **D-04:** LegalFindingsPage 라운드 목록에서 일괄 다운로드 버튼 배치 (관리자만)
- **D-05:** fflate.zipSync 클라이언트사이드 ZIP — 기존 ReportsPage 패턴 재활용
- **D-06:** ZIP 내부 구조: 컨텍스트 명명 폴더 — `finding-001_위치/지적사진-1.jpg`, `finding-001_위치/조치사진-1.jpg`, `finding-001_위치/내용.txt`
- **D-07:** 각 finding의 메타데이터(항목, 위치, 상태, 지적내용, 조치내용, 날짜)를 `내용.txt`에 포함

### iOS PWA 호환
- **D-08:** `<a download>` 사용 금지 — iOS PWA에서 무시됨 (WebKit bug 167341)
- **D-09:** 건별: window.open()으로 HTML 페이지 새 탭 열기 → 사용자가 공유시트로 저장
- **D-10:** 일괄: ZIP blob을 window.open()으로 열기 — iOS에서 공유시트 표시됨
- **D-11:** isStandalone() + isIOS() 감지 (InstallPrompt.tsx에서 이미 구현됨) 활용

### 다운로드 권한
- **D-12:** 관리자(admin)만 건별/일괄 다운로드 가능 — `staff?.role === 'admin'` 체크

### Claude's Discretion
- HTML 보고서 페이지 레이아웃/스타일링 (인쇄 최적화)
- ZIP 파일명 패턴 (연도_점검종류_지적사항.zip 등)
- 사진 fetch 병렬 처리 전략 (Promise.allSettled 등)
- 다운로드 진행률 표시 (토스트 vs 버튼 내 스피너)
- 일괄 다운로드 시 사진 없는 finding 처리 방식

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 기존 다운로드 패턴 (핵심)
- `cha-bio-safety/src/pages/ReportsPage.tsx` — fflate ZIP 다운로드 패턴 (lines 127-136), blob URL → <a download> → click 패턴
- `cha-bio-safety/src/utils/generateExcel.ts` — returnBlob 옵션으로 Blob 반환 패턴

### 지적사항 페이지
- `cha-bio-safety/src/pages/LegalFindingsPage.tsx` — 라운드별 지적사항 목록, 일괄 다운로드 버튼 배치 대상
- `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` — 지적사항 상세, 건별 다운로드 버튼 배치 대상

### 사진 URL 패턴
- `/api/uploads/{key}` — R2 사진 URL 패턴 (photoKeys.map(k => '/api/uploads/' + k))

### iOS PWA 감지
- `cha-bio-safety/src/components/InstallPrompt.tsx` — isStandalone(), isIOS() 함수

### 타입/API
- `cha-bio-safety/src/types/index.ts` — LegalFinding 인터페이스 (lines 90-107)
- `cha-bio-safety/src/utils/api.ts` — legalApi.getFindings, legalApi.getFinding

### 리서치
- `.planning/research/SUMMARY.md` — fflate, iOS PWA 다운로드 제약, window.open 패턴
- `.planning/research/PITFALLS.md` — WebKit bug 167341, blob URL iOS 제약

### Prior Context
- `.planning/phases/12-multi-photo-infrastructure/12-CONTEXT.md` — photo_keys 다중 사진 구조

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `fflate ^0.8.2`: 이미 설치됨, ReportsPage에서 zipSync 사용 패턴 검증됨
- `isStandalone()` / `isIOS()`: InstallPrompt.tsx에서 이미 구현됨
- `useAuthStore()`: staff?.role === 'admin' 패턴으로 관리자 체크
- ReportsPage blob download 패턴: `URL.createObjectURL → <a download> → click → revokeObjectURL`

### Established Patterns
- 인라인 스타일 + CSS 변수
- React Query로 데이터 패칭
- toast 알림 (react-hot-toast)
- 관리자 UI: `{role === 'admin' && <Component />}` 조건부 렌더링

### Integration Points
- LegalFindingDetailPage 헤더: 건별 다운로드 아이콘 버튼 추가
- LegalFindingsPage 서브헤더 영역: 일괄 다운로드 버튼 추가 (기존 admin 서브헤더 활용)
- API 추가 없음 — 기존 legalApi.getFindings + fetch('/api/uploads/'+key)로 충분

</code_context>

<specifics>
## Specific Ideas

- STATE.md 블로커: "Phase 15: 물리 iOS 16.x 기기 PWA 홈 화면 모드 테스트 필수 — Chrome 데스크톱 결과는 비대표적"
- Research: 건별은 HTML+base64 새 탭, 일괄은 fflate.zipSync — 모두 클라이언트사이드
- Research: ZIP 최대 ~10MB (10 findings × 5 photos × 200KB) — 브라우저 메모리 충분

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-finding-download*
*Context gathered: 2026-04-06*

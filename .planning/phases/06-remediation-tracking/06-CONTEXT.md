# Phase 6: Remediation Tracking - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

점검에서 불량/주의 판정된 개소의 조치 기록/추적 페이지 구현. 조치 목록 조회, 상태 변경, 사진 첨부, 대시보드 미조치 카운트 실시간 연동.

</domain>

<decisions>
## Implementation Decisions

### 조치 목록 화면 (RemediationPage)
- **D-01:** 컴팩트 카드 리스트 — 카테고리+위치(동→층 순서), 판정결과 배지(불량/주의), 점검일, 메모 첫 줄 미리보기, 상태(미조치/완료). 사진 썸네일은 카드에 미포함 (상세에서 확인)
- **D-02:** 필터: 상단 상태 탭 (전체/미조치/완료) + 카테고리 드롭다운
- **D-03:** 기간: 기본 30일, 버튼으로 7일/30일/90일/전체 전환
- **D-04:** 조치 대상: 불량(bad) + 주의(caution) 모두 포함 (현재 stats.ts 쿼리와 동일)
- **D-05:** 상태 2단계: 미조치(open) / 완료(resolved). DB 변경 없음. '조치중(in_progress)' 불필요

### 조치 상세 페이지
- **D-06:** 전체 페이지 라우트 이동: /remediation/:recordId
- **D-07:** NO_NAV_PATHS에 포함 (하단 네비 숨김). 자체 헤더에 뒤로가기 버튼으로 /remediation 목록 복귀
- **D-08:** 상세 구성: 점검 정보(카테고리, 위치(동→층), 점검일, 점검자, 판정결과) + 점검 메모+사진(조치 전) + 조치 정보(조치 후, 완료 항목만) + 하단 '조치 완료' 버튼(미조치 항목만)
- **D-09:** 조치 완료 시 필수 입력: 메모 필수 + 사진 선택적
- **D-10:** 조치 완료 후 동작: '조치 완료' 토스트 표시 → /remediation 목록으로 복귀 (목록 자동 새로고침)

### 사진 첨부
- **D-11:** 기존 점검 사진 업로드 패턴과 동일 (카메라/갤러리 선택 → 압축 → R2 업로드). usePhotoUpload 훅 + imageUtils 재활용
- **D-12:** 조치 후 사진 1장 (resolution_photo_key). 조치 전 사진은 점검 시 photo_key 활용. DB 변경 없음
- **D-13:** R2 키: remediation/{recordId}/{timestamp} 형식

### API
- **D-14:** 신규 /api/remediation 엔드포인트: GET /api/remediation?status=open&category=소화기&days=30 — 미조치/완료 필터, 카테고리 필터, 기간 필터 지원
- **D-15:** 기존 resolve.ts API (POST /api/inspections/records/:recordId/resolve) 활용하여 상태 변경. 별도 API 불필요

### 대시보드 미조치 카운트 연동
- **D-16:** 대시보드 API 기존 unresolved 값(stats.ts)을 BottomNav 조치 탭 배지 + SideMenu 조치 관리 배지에 전달. 추가 API 불필요
- **D-17:** Phase 5에서 제거한 하드코딩 배지를 실시간 count로 교체

### Claude's Discretion
- 카드 리스트 정렬 방식 (최신순 기본)
- 필터 드롭다운 카테고리 목록 (DB check_points 테이블에서 동적 조회 vs 하드코딩)
- 상세 페이지 레이아웃 세부 디자인 (기존 앱 스타일과 일관성 유지)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### DB Schema
- `cha-bio-safety/migrations/0012_check_records_resolution.sql` — check_records 테이블 조치 컬럼 (status, resolution_memo, resolution_photo_key, resolved_at, resolved_by)
- `cha-bio-safety/migrations/0013_photo_keys.sql` — 사진 관련 컬럼

### Existing API
- `cha-bio-safety/functions/api/inspections/records.ts` — GET /api/inspections/records?date= (점검 기록 조회, 조치 필드 포함)
- `cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts` — POST resolve API (open→resolved 상태 변경)
- `cha-bio-safety/functions/api/dashboard/stats.ts` — unresolved 카운트 쿼리 (lines 74-79)

### Frontend Components
- `cha-bio-safety/src/pages/RemediationPage.tsx` — 현재 placeholder, 본격 구현 대상
- `cha-bio-safety/src/components/BottomNav.tsx` — 조치 탭 배지 연동 위치
- `cha-bio-safety/src/components/SideMenu.tsx` — 조치 관리 배지 연동 위치
- `cha-bio-safety/src/App.tsx` — 라우트 추가 위치 (/remediation/:recordId), NO_NAV_PATHS, PAGE_TITLES

### Photo Upload Pattern
- `cha-bio-safety/src/pages/InspectionPage.tsx` — 기존 사진 업로드 패턴 참고 (usePhotoUpload, imageUtils)
- `cha-bio-safety/src/utils/imageUtils.ts` — 이미지 압축 유틸리티

### Requirements
- `.planning/REQUIREMENTS.md` — REM-01, REM-02, REM-03, REM-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `resolve.ts` API: POST /api/inspections/records/:recordId/resolve — 이미 완전한 조치 완료 API, 그대로 활용
- `stats.ts` unresolved 쿼리: `result IN ('bad','caution') AND (status IS NULL OR status = 'open')` — 동일 조건 활용
- `usePhotoUpload` 훅 + `imageUtils.ts` — 사진 촬영/선택/압축/업로드 재활용
- `check_records` 테이블: status, resolution_memo, resolution_photo_key, resolved_at, resolved_by 컬럼 이미 존재 (migration 0012)

### Established Patterns
- 인라인 스타일 + CSS 변수 (var(--bg), var(--t1), var(--danger) 등)
- React Query 캐싱 (staleTime 30초, refetchOnWindowFocus)
- toast 알림 (react-hot-toast)
- API 응답: { success: boolean, data: T }

### Integration Points
- App.tsx: /remediation/:recordId 라우트 추가, NO_NAV_PATHS에 추가
- BottomNav.tsx: 조치 탭에 미조치 count 배지 렌더링
- SideMenu.tsx: 조치 관리 항목에 count 배지 렌더링
- Dashboard stats API → unresolved count → BottomNav/SideMenu 전달 경로

</code_context>

<specifics>
## Specific Ideas

- 위치 표시 순서는 반드시 동→층 (예: "사무동 B2층", 사용자 명시적 요청)
- 신규 마이그레이션 불필요 (STATE.md 확인: migration 0012 스키마 이미 존재)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-remediation-tracking*
*Context gathered: 2026-04-02*

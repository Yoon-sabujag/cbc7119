# Phase 10: Legal Inspection - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

소방시설 법적 점검(상반기 종합정밀/하반기 작동기능) 결과 기록, 지적사항 시정 추적(지적 전/후 사진+내용), 점검 결과 보고서 PDF R2 보관.

</domain>

<decisions>
## Implementation Decisions

### 페이지 구조
- **D-01:** 점검회차 리스트 → 지적사항 목록 → 지적 상세 (3단계 구조)
- **D-02:** /legal → 회차 카드 리스트, /legal/:id → 지적사항 목록, /legal/:id/finding/:fid → 지적 상세(사진+조치)
- **D-03:** 모든 라우트 NO_NAV_PATHS에 포함. 자체 헤더(← 뒤로가기) + 페이지 제목
- **D-04:** SideMenu 시스템 섹션의 '법적 점검' soon:true → soon:false로 활성화

### 점검회차 (legal_inspections)
- **D-05:** 연 2회: 상반기 종합정밀점검(comprehensive) + 하반기 작동기능점검(functional)
- **D-06:** 기록 항목: 점검 유형, 일자, 점검기관, 결과(적합/부적합/조건부적합), 비고
- **D-07:** 점검기관 결과 보고서 PDF를 R2에 업로드 (report_file_key). 관리자만 업로드 가능
- **D-08:** 회차 카드에 지적 건수 + 조치완료 건수 요약 표시

### 지적사항 (legal_findings)
- **D-09:** 지적 기록: 지적 내용(텍스트) + 지적 시 사진(R2) + 위치 정보
- **D-10:** 조치 기록: 조치 내용(텍스트) + 조치 후 사진(R2)
- **D-11:** 상태: 미조치(open) / 조치완료(resolved). Phase 6 조치관리와 동일 2단계

### 권한
- **D-12:** 전체 직원: 지적사항 등록, 지적/조치 사진 업로드, 조치 내용 기록 (현장 날것 기록)
- **D-13:** 관리자만: 점검회차 추가/수정, 지적사항 편집/정리, 결과 보고서 PDF 업로드 (가공 작업)

### R2 업로드
- **D-14:** 지적 사진: legal/{inspectionId}/findings/{findingId}/before/{timestamp}
- **D-15:** 조치 사진: legal/{inspectionId}/findings/{findingId}/after/{timestamp}
- **D-16:** 결과 보고서 PDF: legal/{inspectionId}/report/{timestamp}.pdf
- **D-17:** 기존 usePhotoUpload 훅 + imageUtils 재활용 (Phase 6 패턴)

### DB 스키마
- **D-18:** 2테이블: legal_inspections(점검회차) + legal_findings(지적사항). 1:N 관계
- **D-19:** legal_inspections: id, inspection_type(comprehensive/functional), inspected_at, agency, result(pass/fail/conditional), report_file_key, memo, created_by, created_at
- **D-20:** legal_findings: id, inspection_id(FK), description, location, photo_key, resolution_memo, resolution_photo_key, status(open/resolved), resolved_at, resolved_by, created_by, created_at
- **D-21:** 마이그레이션: 0037_legal_inspections.sql (또는 다음 번호)

### Claude's Discretion
- 카드 디자인 상세 (기존 앱 스타일 일관성)
- 지적사항 목록 정렬 방식 (최신순/미조치 우선)
- 결과 보고서 PDF 뷰어 방식 (새 탭 열기 vs 인앱 뷰어)
- 위치 정보 입력 방식 (텍스트 자유 입력)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 조치 관리 패턴 (Phase 6)
- `cha-bio-safety/src/pages/RemediationPage.tsx` — 지적사항+조치 카드 리스트 패턴 참고
- `cha-bio-safety/src/pages/RemediationDetailPage.tsx` — 지적 상세 + 조치 기록 UI 패턴
- `cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts` — 조치 완료 API 패턴

### R2 업로드 패턴
- `cha-bio-safety/src/utils/imageUtils.ts` — 이미지 압축
- `cha-bio-safety/src/pages/InspectionPage.tsx` — usePhotoUpload 훅 사용 패턴

### Navigation
- `cha-bio-safety/src/components/SideMenu.tsx` — '법적 점검' soon:true (line 40), 활성화 필요
- `cha-bio-safety/src/App.tsx` — NO_NAV_PATHS에 /legal-inspection 포함, 라우트 추가 필요

### Requirements
- `.planning/REQUIREMENTS.md` — LEGAL-01, LEGAL-02

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `RemediationPage/DetailPage`: 지적+조치 카드/상세 패턴 — 법적 점검 지적사항에 거의 동일 패턴 재활용
- `usePhotoUpload` + `imageUtils`: 사진 촬영/압축/R2 업로드
- `AdminPage.tsx` BottomSheet: 모달 입력 패턴
- `api.ts`: API 클라이언트 네임스페이스 패턴

### Established Patterns
- 인라인 스타일 + CSS 변수
- React Query 캐싱
- toast 알림
- NO_NAV_PATHS 자체 헤더 패턴
- R2 키 형식: {feature}/{parentId}/{type}/{timestamp}

### Integration Points
- App.tsx: /legal, /legal/:id, /legal/:id/finding/:fid 라우트 추가
- SideMenu.tsx: 시스템 섹션 '법적 점검' 활성화
- R2 업로드: 기존 /api/uploads 엔드포인트 활용

</code_context>

<specifics>
## Specific Ideas

- 현장에서 점검 중 팔로업하며 날것의 기록을 남기는 용도 (사용자 명시적 설명)
- 전 직원이 현장 기록, 관리자가 가공/정리 (사용자 명시적 구분)
- Phase 6 조치관리와 유사하지만 소스가 "법적 점검(연 2회)"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-legal-inspection*
*Context gathered: 2026-04-03*

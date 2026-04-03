# Phase 10: Legal Inspection - Context

**Gathered:** 2026-04-03
**Status:** Ready for re-planning (schedule_items 연동 결정 반영)

<domain>
## Phase Boundary

소방시설 법적 점검(상반기 종합정밀/하반기 작동기능) 지적사항 시정 추적. 점검 회차는 SchedulePage에서 등록된 schedule_items를 참조 — 별도 점검 등록 없음. 지적사항 등록/조치 전후 사진/조치완료 기록 + 결과 보고서 PDF R2 보관.

</domain>

<decisions>
## Implementation Decisions

### 핵심 변경: schedule_items 연동
- **D-00:** ~~legal_inspections 별도 테이블 제거~~ → schedule_items에서 category='fire' + 법적 점검 서브카테고리('소방 상반기 종합정밀점검', '소방 하반기 작동기능점검')를 직접 참조
- **D-00a:** 점검 회차 등록은 SchedulePage에서 수행 — LegalPage에 "점검 등록" BottomSheet 없음
- **D-00b:** legal_findings.schedule_item_id로 schedule_items와 연결 (legal_inspections FK 아님)
- **D-00c:** SchedulePage에는 추가로 '소방 시설물 공사', '소방 관공서 불시 점검' 서브카테고리도 있으나, LegalPage에서는 종합정밀+작동기능 2가지만 표시
- **D-00d:** schedule_items에 result(적합/부적합/조건부적합), report_file_key(PDF) 컬럼 추가 필요 — 관리자가 LegalPage에서 점검 결과와 보고서를 기록

### 페이지 구조
- **D-01:** 점검회차 리스트 → 지적사항 목록 → 지적 상세 (3단계 구조)
- **D-02:** /legal → 회차 카드 리스트 (schedule_items 기반), /legal/:id → 지적사항 목록, /legal/:id/finding/:fid → 지적 상세(사진+조치)
- **D-03:** 모든 라우트 NO_NAV_PATHS에 포함. 자체 헤더(← 뒤로가기) + 페이지 제목
- **D-04:** SideMenu 시스템 섹션의 '법적 점검' soon:true → soon:false로 활성화

### 점검회차 (schedule_items 참조)
- **D-05:** 연 2회: 상반기 종합정밀점검 + 하반기 작동기능점검 — SchedulePage에서 등록
- **D-06:** schedule_items 기존 필드 활용: title(서브카테고리명), date, category='fire', inspection_category(서브카테고리)
- **D-06a:** schedule_items에 추가 컬럼: result(pass/fail/conditional, NULL 허용), report_file_key(TEXT, NULL 허용) — ALTER TABLE 마이그레이션
- **D-07:** 점검기관 결과 보고서 PDF를 R2에 업로드 (report_file_key). 관리자만 업로드 가능
- **D-08:** 회차 카드에 지적 건수 + 조치완료 건수 요약 표시

### 지적사항 (legal_findings)
- **D-09:** 지적 기록: 지적 내용(텍스트) + 지적 시 사진(R2) + 위치 정보
- **D-10:** 조치 기록: 조치 내용(텍스트) + 조치 후 사진(R2)
- **D-11:** 상태: 미조치(open) / 조치완료(resolved). Phase 6 조치관리와 동일 2단계

### 권한
- **D-12:** 전체 직원: 지적사항 등록, 지적/조치 사진 업로드, 조치 내용 기록 (현장 날것 기록)
- **D-13:** 관리자만: 점검 결과(result) 기록, 지적사항 편집/정리, 결과 보고서 PDF 업로드 (가공 작업). 점검 회차 자체는 SchedulePage에서 등록

### R2 업로드
- **D-14:** 지적 사진: legal/{scheduleItemId}/findings/{findingId}/before/{timestamp}
- **D-15:** 조치 사진: legal/{scheduleItemId}/findings/{findingId}/after/{timestamp}
- **D-16:** 결과 보고서 PDF: legal/{scheduleItemId}/report/{timestamp}.pdf
- **D-17:** 기존 usePhotoUpload 훅 + imageUtils 재활용 (Phase 6 패턴)

### DB 스키마
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### SchedulePage 연동 (핵심)
- `cha-bio-safety/src/pages/SchedulePage.tsx` — FIRE_SUBCATS, FIRE_AGENCY 상수, 소방 일정 등록 로직 (lines 112-127)
- `cha-bio-safety/functions/api/schedule/` — schedule_items API

### 조치 관리 패턴 (Phase 6)
- `cha-bio-safety/src/pages/RemediationPage.tsx` — 지적사항+조치 카드 리스트 패턴 참고
- `cha-bio-safety/src/pages/RemediationDetailPage.tsx` — 지적 상세 + 조치 기록 UI 패턴
- `cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts` — 조치 완료 API 패턴

### R2 업로드 패턴
- `cha-bio-safety/src/utils/imageUtils.ts` — 이미지 압축
- `cha-bio-safety/src/pages/InspectionPage.tsx` — usePhotoUpload 훅 사용 패턴

### Navigation
- `cha-bio-safety/src/components/SideMenu.tsx` — '법적 점검' soon:true, 활성화 필요
- `cha-bio-safety/src/App.tsx` — NO_NAV_PATHS에 /legal-inspection 포함, 라우트 추가 필요

### Requirements
- `.planning/REQUIREMENTS.md` — LEGAL-01, LEGAL-02

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `RemediationPage/DetailPage`: 지적+조치 카드/상세 패턴
- `usePhotoUpload` + `imageUtils`: 사진 촬영/압축/R2 업로드
- `AdminPage.tsx` BottomSheet: 모달 입력 패턴 (점검 결과 입력에 활용)
- `api.ts`: API 클라이언트 네임스페이스 패턴
- `SchedulePage.tsx`: FIRE_SUBCATS 상수, schedule API

### Established Patterns
- 인라인 스타일 + CSS 변수
- React Query 캐싱
- toast 알림
- NO_NAV_PATHS 자체 헤더 패턴
- R2 키 형식: {feature}/{parentId}/{type}/{timestamp}

### Integration Points
- App.tsx: /legal, /legal/:id, /legal/:id/finding/:fid 라우트 추가
- SideMenu.tsx: 시스템 섹션 '법적 점검' 활성화
- schedule_items 테이블: result + report_file_key 컬럼 추가
- scheduleApi 또는 legalApi로 schedule_items 조회

### 기존 10-01 코드 처리
- 기존 커밋(10-01)의 legal_inspections 테이블, API, 타입은 롤백/재작성 필요
- legal_findings 테이블은 inspection_id → schedule_item_id로 FK 변경

</code_context>

<specifics>
## Specific Ideas

- 점검 일정은 SchedulePage에서 등록, LegalPage는 지적사항 관리에 집중 (사용자 명시적 결정)
- SchedulePage의 FIRE_SUBCATS 중 '소방 상반기 종합정밀점검', '소방 하반기 작동기능점검'만 LegalPage에 표시
- 현장에서 점검 중 팔로업하며 날것의 기록을 남기는 용도
- 전 직원이 현장 기록, 관리자가 가공/정리

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-legal-inspection*
*Context gathered: 2026-04-03 (updated: schedule_items 연동 반영)*

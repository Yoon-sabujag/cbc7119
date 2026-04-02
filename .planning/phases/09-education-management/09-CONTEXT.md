# Phase 9: Education Management - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

보수교육 이수 이력 관리 — 선임일 기반 자동 주기 계산(첫 교육 6개월 + 이후 2년 주기), 이수일 기록, D-day 표시. 인증서 R2 업로드는 제외(이수일만 기록).

</domain>

<decisions>
## Implementation Decisions

### 페이지 구조
- **D-01:** 리스트형 단일 페이지 — 직원별 교육 카드 리스트. 탭 없음. 카드 탭하면 상세/이수 기록 화면
- **D-02:** /education은 NO_NAV_PATHS에 이미 포함. 자체 헤더(← 뒤로가기) + "보수교육" 제목
- **D-03:** SideMenu 근무·복지 섹션에 "보수교육" 항목 추가 (근무표, 연차 관리, 식사 기록 뒤)

### 교육 주기 규칙 (법적 의무)
- **D-04:** 선임 후 6개월 이내: 첫 실무교육 필수. 선임일(staff.appointed_at) + 6개월 = 첫 교육 마감일
- **D-05:** 첫 교육 이수일 기준: 이후 2년마다 보수교육. 마지막 이수일 + 2년 = 다음 마감일
- **D-06:** D-day 자동 계산 — 수동 일정 등록 불필요. 선임일 + 이수 이력만으로 산출

### 이수 기록
- **D-07:** 이수일만 기록 (인증서 R2 업로드 없음). EDU-02의 인증서 업로드는 제외
- **D-08:** 이수일 등록 시 education_type 구분: 실무(initial) / 보수(refresher)
- **D-09:** 이수 이력은 삭제 불가 (법적 기록). 이수일 수정만 가능

### 권한
- **D-10:** 이수일 등록/수정: admin + 본인 모두 가능
- **D-11:** 모든 직원의 교육 현황 조회: 전체 가능 (법적 현황 공유)

### D-day 표시
- **D-12:** 교육 페이지에서만 표시 (대시보드 미반영)
- **D-13:** 카드에 D-day 배지 — 마감 전 D-30 이내면 경고색, 마감 초과면 위험색

### DB 스키마
- **D-14:** education_records 테이블: id, staff_id, education_type(initial/refresher), completed_at, created_at
- **D-15:** 마이그레이션 1개: 0036_education_records.sql (또는 다음 번호)

### Scope Adjustments
- **EDU-02 인증서 업로드 제외:** 이수일만 기록. R2 업로드는 필요시 v1.2에서 추가
- **대시보드 D-day 미반영:** 교육 페이지에서만 D-day 표시

### Claude's Discretion
- 카드 디자인 상세 (기존 앱 스타일 일관성)
- D-day 경고 임계값 색상 (warn/danger 등)
- 이수 기록 입력 UI (바텀시트 vs 인라인)
- 교육 유형 자동 판정 로직 (첫 교육=initial, 이후=refresher)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Staff 데이터
- `cha-bio-safety/src/hooks/useStaffList.ts` — 직원 목록 훅 (Phase 7)
- `cha-bio-safety/src/types/index.ts` — StaffFull 인터페이스 (appointed_at 포함)
- `cha-bio-safety/functions/api/staff/index.ts` — Staff API 패턴 참고

### Navigation
- `cha-bio-safety/src/components/SideMenu.tsx` — 근무·복지 섹션에 보수교육 추가 필요
- `cha-bio-safety/src/App.tsx` — NO_NAV_PATHS에 /education 이미 포함 (line 52), 라우트 추가 필요

### UI 패턴
- `cha-bio-safety/src/pages/AdminPage.tsx` — 바텀시트 모달 패턴, 카드 리스트
- `cha-bio-safety/src/pages/RemediationPage.tsx` — 카드 리스트 + 상태 배지 패턴

### Requirements
- `.planning/REQUIREMENTS.md` — EDU-01, EDU-02 (인증서 제외), EDU-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useStaffList.ts`: 직원 목록 (appointed_at 포함) — 교육 마감일 계산에 필요
- `AdminPage.tsx` BottomSheet 패턴: 이수일 입력 모달
- `RemediationPage.tsx` 카드 리스트: 상태 배지 포함 카드 패턴
- `staffApi`: staff 데이터 조회 (Phase 7)

### Established Patterns
- 인라인 스타일 + CSS 변수
- React Query 캐싱
- toast 알림
- NO_NAV_PATHS 자체 헤더 패턴

### Integration Points
- App.tsx: /education 라우트 + lazy import 추가
- SideMenu.tsx: 근무·복지 섹션에 보수교육 항목 추가
- staff.appointed_at: 첫 교육 마감일 계산의 기준점

</code_context>

<specifics>
## Specific Ideas

- 법적 교육 주기: 선임 6개월 내 첫 실무교육, 이후 2년 주기 보수교육 (사용자 명시적 설명)
- staff.appointed_at을 기준점으로 활용 (Phase 7에서 추가한 필드)
- 인증서 업로드 불필요 — 이수일만 기록하면 충분 (사용자 명시적 결정)

</specifics>

<deferred>
## Deferred Ideas

- **EDU-02 인증서 R2 업로드** — 이수 기록에 인증서 파일 첨부. 필요시 v1.2에서 추가
- **대시보드 D-day 경고** — 30일 이내 교육 마감 시 대시보드에 경고 카드 표시

</deferred>

---

*Phase: 09-education-management*
*Context gathered: 2026-04-03*

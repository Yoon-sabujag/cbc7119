---
title: "redesign/20-legal-findings — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-23
quick_id: 260523-rgj
branch: redesign/20-legal-findings (based on redesign/19-legal HEAD, NOT main)
source_tsx: cha-bio-safety/src/pages/LegalFindingsPage.tsx
source_tsx_lines: 378
design_system: cha-bio-safety/docs/redesign-context/20-legal-findings/design-system.md (v0.1.1)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (소방 점검 관리 sub-route = 점검 시리즈 직접 적용 케이스 — 단 line 117 showNav=false 특수 케이스 — 각 룰 1줄 메타로 적용/미적용 판정)
mirror_of: cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md (260522-sa7) + cha-bio-safety/docs/redesign-context/23-education/wave-1-index.md (260522-gmp) + cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md (260522-209) + cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md (260521-wmq) + cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (260521-sjj) + cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (260521-c6p) — 7 섹션 + 4 sub-wave 구조 mirror
biz_anchor_precedent: cha-bio-safety/docs/redesign-context/19-legal/wave-1-index.md (260522-sa7) — 비즈 anchor 1 byte 0 룰 (accentColor + ResultBadge + legalApi 7종 + role admin 도구 분기 + sorted open-first) 일반화 → 20-legal-findings 는 LegalPage 의 sub-route 로 동일 도메인 + 동일 비즈 anchor 룰 (단 4종 legalApi + 2분기 finding 상태 + 단일 export 378 lines + borderLeft 2px [19-legal 3px 와 다름] + ZIP 파일명 round.title 기반 [19-legal location 기반과 다름])
sub_wave_count: 4 (W2~W5)
memory_rules_inline: 12 (10 기본 + feedback_inspection_unresolved_color finding 상태 칩 + borderLeft status 토큰 일반화 + project_inspection_completion_rule role admin 도구 분기 + sortedFindings open-first source of truth 일반화)
open_questions: 5
key_files_inventory:
  - cha-bio-safety/src/pages/LegalFindingsPage.tsx (378 lines)
  - cha-bio-safety/src/utils/api.ts (legalApi 4종 — get/getFindings/updateResult/deleteFinding)
  - cha-bio-safety/src/utils/findingDownload.ts (buildMetaTxt — ZIP 내용.txt)
  - cha-bio-safety/src/components/FindingFormSheet.tsx (등록/수정 시트)
  - cha-bio-safety/src/components/PhotoGrid.tsx (FindingFormSheet 내부 사용)
  - cha-bio-safety/src/components/PhotoSourceModal.tsx (FindingFormSheet 내부 사용)
  - cha-bio-safety/src/hooks/useMultiPhotoUpload.ts (FindingFormSheet 내부 사용)
  - cha-bio-safety/src/stores/authStore.ts (role admin/assistant 분기 + handleReportUpload Bearer token)
  - cha-bio-safety/src/hooks/useIsDesktop.ts (≥768px 분기)
  - cha-bio-safety/src/App.tsx (chrome 실측: line 36, 71, 74, 77, 79~104, 117, 289, 290, 291)
---

# redesign/20-legal-findings — sketch wave 1 (index)

본 문서는 W2~W5 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자는 다음을 알 수 있다:

- LegalFindingsPage.tsx (378 라인 — 단일 export, 내부 panel 없음, 모바일 + 데스크톱 분기 via useIsDesktop, `/legal/:id` sub-route — 19-legal LegalPage 가 라운드 카드 클릭 시 navigate(`/legal/${id}`) 로 진입하는 지적사항 목록 페이지) 의 element 인벤토리 → 4 sub-wave 분배 + **비즈 시그니처 anchor** 보존 (useQuery 2종 ['legal-round', id] / ['legal-findings', id] + legalApi 4종 get/getFindings/updateResult/deleteFinding + headerTitle 동적 분기 + sortedFindings open-first + adminBar role admin 조건부 + handleZipDownload iOS PWA `<a download>` + buildMetaTxt + fflate ZIP + handleReportUpload FormData + Bearer token + ZIP 파일명 round.title 기반 + 폴더명 패턴 + 사진 파일명 + toast 카피 8종 + 빈/오류 카피 + finding 상태 2분기 borderLeft 2px [19-legal 3px 와 다름] + 칩 + 모바일 자체 헤더 36x36 + 모바일 고정 하단 CTA + 데스크톱 maxWidth 800 + headerTitle 분기 4종 + @keyframes blink (.6/.3) + spin + FindingFormSheet 시트 2종)
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6.4 / §6.6 / §7 / §7.1 의 verbatim 룰 박제 (§6/§7 미적용 부분은 1줄 메타 동반)
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 20-legal-findings 적용 여부 (LegalFindingsPage = **19-legal LegalPage 의 sub-route → 점검 시리즈 직접 적용 케이스**. 02 InspectionPage 와 동일 도메인. **단 App.tsx line 117 정규식 `^\/legal\/.+` 매칭 → showNav=false → 모바일 BottomNav + 데스크톱 사이드바 + 글로벌 AppHeader 모두 숨김 → 자체 헤더 (모바일) + 데스크톱 타이틀 영역이 chrome 의 유일한 외곽** — 19-legal LegalPage 와 결정적 차이). App.tsx 실측 박제 — line 36 lazy import + line 71 MOBILE_NO_NAV_PATHS (`/legal/:id` 명시 미등재 — 정규식 cover) + line 74 DESKTOP_NO_NAV_PATHS (정규식 cover) + line 77 DESKTOP_HEADER_HIDE_PATHS (정규식 cover) + line 79~104 PAGE_TITLES (`/legal/:id` 미등재) + line 117 특수 regex / line 289 부모 `/legal` + line 290 본 페이지 `/legal/:id` + line 291 자식 `/legal/:id/finding/:fid`.
- 메모리 룰 12건 (`feedback_*.md` 10 + `feedback_inspection_unresolved_color` finding 상태 칩 + borderLeft status 토큰 매핑 일반화 + `project_inspection_completion_rule` role admin 도구 분기 + sortedFindings open-first source of truth 일반화) inline 인용 — 20-legal-findings 특화 룰 2건 (finding 2분기 status 토큰 + role admin 권한 도구 분기 운영 룰 보존) 포함
- §6 negative rule (이 wave 에서 금지된 것) — sketch HTML 금지 / LegalFindingsPage.tsx 코드 변경 금지 / 외부 7 파일 (PhotoGrid / PhotoSourceModal / FindingFormSheet / useMultiPhotoUpload / findingDownload / api / authStore) 미수정 / wrangler + npm run deploy 금지 / 평면 폴더 / App.tsx 미수정 / 부모 페이지 LegalPage + 자식 페이지 LegalFindingDetailPage 미수정 / finding 상태 + borderLeft 2px (19-legal 3px 와 다름) + 칩 + adminBar role admin 조건부 + sortedFindings + headerTitle 동적 분기 + findingCard navigate + legalApi 4종 snake_case payload + handleZipDownload iOS PWA `<a download>` + ZIP 파일명 round.title 기반 + 폴더명 + 사진 파일명 + handleReportUpload FormData + Bearer token + toast 8종 + 빈/오류 카피 + adminBar 카피 + finding 카피 + addButton + 데스크톱 maxWidth 800 + 모바일 고정 하단 CTA + @keyframes blink (.6/.3) + spin + 모바일 헤더 자체 렌더 + 36x36 보존
- §7 open questions 5건 — W2 진입 직전 사용자 컨펌 (모바일 헤더 raised alpha 0.97 유지 / finding 상태 status 토큰 치환 / §1.1 9·10·11 fontSize 12 격상 / 메인 CTA (addButton) 그라데이션 + 빈/오류 아이콘 + SKELETON 활용 / Lucide back+Loader2 교체 + back 44x44 격상)

작성일: 2026-05-23 / Quick ID: 260523-rgj / Branch: redesign/20-legal-findings (based on redesign/19-legal HEAD, NOT main)

> 19-legal W1 (260522-sa7) + 23-education W1 (260522-gmp) + 28-splash W1 (260522-209) + 17-annual-plan W1 (260521-wmq) + 16-workshift W1 (260521-sjj) + 27-login W1 (260521-c6p) 의 7 섹션 + 4 sub-wave 구조를 정확히 mirror. LegalFindingsPage 가 378 lines 단일 export (19-legal LegalPage 의 3개 내부 컴포넌트와 다름) — 모바일/데스크톱 useIsDesktop 분기 + 데스크톱 maxWidth 800 중앙 정렬 + 모바일 고정 하단 CTA — 4 sub-wave (W2~W5) 채택. **19-legal 과 차이 7건**: (1) 부모 라우트 `/legal` 의 sub-route `/legal/:id`, (2) App.tsx line 117 정규식 `^\/legal\/.+` 매칭으로 모바일/데스크톱 모두 showNav=false (글로벌 chrome 모두 숨김 — 자체 헤더가 유일한 외곽), (3) 내부 panel 없는 단일 export 378 lines, (4) 사진 5장 useMultiPhotoUpload 직접 사용 X (FindingFormSheet 가 내부에서 담당), (5) finding borderLeft 2px (19-legal LegalPage 3px 과 다름), (6) findingCard 클릭 시 자식 페이지 `/legal/:id/finding/:fid` 진입 (LegalFindingDetailPage — 본 wave 범위 아님), (7) headerTitle 동적 분기 (round 정보 기반 '종합정밀/작동기능 YYYY.MM.'). 평면(flat sibling) 폴더 패턴 — `20-legal-findings/sketch-wave-N-{slug}.html` 직접 배치 (`sketch/` 서브폴더 없음). 8 페이지 (13/14/27/16/17/28/23/19) 모두 평면 일관 — 20-legal-findings 도 동일.

---

# §1. LegalFindingsPage.tsx 인벤토리

본 인벤토리는 LegalFindingsPage.tsx (378 lines, 실측) 의 element 를 (1) 상단 imports / 포맷터 / SKELETON_STYLE / Spinner / (2) 메인 페이지 LegalFindingsPage — useQuery 2종 + state 6종 + handlers 3종 (save/upload/delete) + handleZipDownload + sortedFindings + useIsDesktop + adminBar + findingCard + addButton / (3) JSX render — 외곽 + 인라인 keyframes blink + 모바일 헤더 + 데스크톱 타이틀 + adminBar mount + 콘텐츠 (loading/error/empty/list) + 모바일 고정 하단 CTA + FindingFormSheet 2종 3 영역으로 나눠 정리한다. line 범위는 **실측 결과** (Read 도구 + grep 검증, drift 없음).

**LegalFindingsPage 의 구조 특이성** (인벤토리 머리말):

- **모바일/데스크톱 분기 via `useIsDesktop()`** (line 7 import, line 205 호출, ≥768px). 데스크톱은 maxWidth 800 중앙 정렬 (19-legal LegalPage 의 3분할 500/500/flex1 과 다름 — 본 페이지는 자식 페이지 진입 위주, 데스크톱도 모바일과 유사한 단일 컬럼).
- **단일 export 378 lines** — 내부 panel/컴포넌트 0건 (19-legal LegalPage 의 FindingsPanel/FindingDetailPanel/메인 LegalPage 3개 통합과 다름). 19-legal LegalPage 의 sub-route 페이지로, **모바일이 라운드 카드 클릭 시 navigate(`/legal/${id}`) 로 진입하는 페이지** (App.tsx line 290).
- **`/legal/:id` 는 글로벌 chrome 모두 숨김** — App.tsx line 117 정규식 `!location.pathname.match(/^\/legal\/.+/)` 매칭으로 `showNav=false` → 모바일 BottomNav + 데스크톱 사이드바 + 데스크톱 글로벌 AppHeader 모두 숨김. 자체 헤더 (모바일 line 298~308 / 데스크톱 line 311~319) 가 유일한 외곽 chrome. 19-legal LegalPage `/legal` 본 페이지는 데스크톱 글로벌 AppHeader + 사이드바 표시 — **본 wave 와 완전히 다른 chrome 모드**.
- **headerTitle 동적 분기** (line 120~122) — round 있으면 `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}` (예: '종합정밀 2026.05.') / 없으면 '지적사항 목록' fallback. 모바일 헤더 + 데스크톱 타이틀 양쪽 동일 사용 — **비즈 분기 보존 룰** (변경 금지).
- **finding 상태 2분기 (open/resolved) 색 분기** (line 244 borderLeft + line 255 칩) — open → borderLeft 2px var(--danger) + 칩 bg rgba(239,68,68,.15) + var(--danger) + '미조치' / resolved → borderLeft 2px var(--safe) + 칩 bg rgba(34,197,94,.13) + var(--safe) + '완료'. **borderLeft 2px** (19-legal LegalPage 의 3px 과 다름). status 토큰 매핑 룰 = W3 sketch 핵심 (memory `feedback_tailwind_token_class_pattern` status- prefix 없음 룰 + memory `feedback_inspection_unresolved_color` 결과 status 토큰 일반화).
- **role admin 권한 도구 분기** (line 208 adminBar `role === 'admin' && round` 조건부) — admin 만 결과 select + 결과 저장 + 보고서 업로드/열기 + ZIP 일괄 다운로드 가능. assistant 는 adminBar 미렌더 — finding 등록/수정/삭제 + 자식 페이지 진입은 모든 사용자 가능. 비즈 보존 룰 = W4 sketch 보존 필수 (memory `project_inspection_completion_rule` 일반화 룰).
- **모바일은 자체 헤더 렌더** (line 298~308) — height 48 / bg `rgba(22,27,34,0.97)` (raised 변형 alpha — 19-legal + 23-education 일관) / borderBottom 1px / back button **36x36 (position absolute left 12)** — 19-legal LegalPage 와 동일. 디자인 §1.1 터치 마지노선 44px 미달 — OQ #5 검토 후보 (Lucide 교체 + 사이즈 44x44 격상). 타이틀 = headerTitle (동적 분기) 16/700 정중앙.
- **데스크톱 타이틀 + 등록 button** (line 311~319) — padding '24px 32px 12px' flex space-between. 좌측 headerTitle 22/800 + round?.title 13 var(--t2) marginTop 4 (round 정보 라인). 우측 addButton (width auto height 36). 데스크톱은 자체 헤더 없음, 글로벌 AppHeader 도 숨김 — **데스크톱 시안 상단에 타이틀 padding 영역만 chrome 으로 인지**.
- **모바일 고정 하단 CTA** (line 348~356) — position fixed bottom 0 / addButton (모바일 width 100% height 48). zIndex 20. paddingBottom 'calc(12px + var(--sab, 0px))' iOS safe-area. 콘텐츠 영역 paddingBottom 'calc(72px + var(--sab, 0px))' 로 카드 영역이 가려지지 않게 회피. 19-legal LegalPage 의 데스크톱 3분할/모바일 sub-route 와 다른 패턴.
- **findingCard onClick → 자식 페이지 진입** (line 240) — navigate(`/legal/${id}/finding/${finding.id}`) → LegalFindingDetailPage (App.tsx line 291). **본 wave + W2~W5 범위는 LegalFindingsPage.tsx 만** (자식 페이지는 별도 wave).
- **ZIP 일괄 다운로드 (admin 전용 + adminBar 안 배치)** (line 138~196 + adminBar 안 line 232) — fflate `zipSync` 동적 import + buildMetaTxt → 내용.txt + photoKeys '지적사진-{N}.jpg' + resolutionPhotoKeys '조치사진-{N}.jpg' + 파일명 `지적사항_${round?.title ?? 'report'}.zip` (19-legal LegalPage 의 `지적사항_${location 안전화}.zip` 와 다름 — 본 페이지는 round.title 사용). zipLoading 단계별 텍스트 ('준비 중...' / '수집 중... (N/M)' / '압축 중...'). iOS PWA `<a download>` 다운로드 패턴 (createElement + body.appendChild + click + removeChild + setTimeout(URL.revokeObjectURL, 3000)) — 1 byte 변경 금지. 19-legal LegalPage 의 FindingDetailPanel 안 다운로드 (단일 finding) 와 다른 패턴 — 본 페이지는 **전체 findings 일괄 다운로드**.
- **사진 업로드 (useMultiPhotoUpload) 본 페이지 직접 사용 X** — FindingFormSheet 가 내부에서 useMultiPhotoUpload 사용. 본 페이지는 FindingFormSheet props (scheduleItemId / mode 'create'|'edit' / finding? / onClose) 만 전달.
- **인라인 keyframes 2종** — `blink { 0%,100%{opacity:.6} 50%{opacity:.3} }` (line 295) — 19-legal `.6/.3` 일치, Education `1/0.4` 와 다름 + `spin { to{transform:rotate(360deg)} }` (line 36 Spinner 함수 내부) — 1 byte 변경 금지.
- **빈 상태 메시지 verbatim** (line 340~341): '지적사항 없음' (16/700 var(--t1)) + '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' (12 var(--t2)) — **isDesktop 분기 ('상단' / '아래') 보존**.
- **오류 상태 verbatim** (line 328): '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (14 var(--t2)) — 19-legal LegalPage 의 '목록을 불러오지 못했습니다.' + '다시 시도' button 분리 패턴과 다름 (본 페이지는 단일 문장).
- **toast 카피 verbatim 8건** — success 4 ('점검 결과가 저장되었습니다.' / '보고서가 업로드되었습니다.' / '삭제되었습니다' / '다운로드 완료') + error 4 ('저장에 실패했습니다.' / '사진 업로드 실패' / err?.message ?? '삭제 실패' / '다운로드에 실패했습니다').
- **권한 분기 카드 cursor** — 모든 finding 카드 cursor pointer (모든 사용자 자식 페이지 진입 가능). 권한 분기는 adminBar (admin 만 결과 select/저장/보고서/ZIP 다운로드) 와 finding 수정/삭제 (모든 사용자 가능 — 19-legal LegalPage 의 admin 분기 없는 finding 액션과 일관).
- **SKELETON_STYLE 정의는 있으나 미사용** (line 24~29 height 88) — Spinner (line 32~39, line 324~325 JSX 사용) 가 isLoading 처리 — 사실상 dead code. **현 상태 박제** (W5 변환 시 SKELETON 활용 옵션 OQ #4).

## §1.1 영역별 인벤토리 표

각 영역 표 3개 — 모든 행은 6 컬럼 (영역 / element / source line 범위 / 역할 / 비즈 로직 연결 / 후속 wave 매핑).

**영역 1 표 — 상단 imports / 포맷터 / SKELETON_STYLE / Spinner** (line 1~40)

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. 상단 | imports (useState/useRef / useParams+useNavigate / useQuery+useQueryClient / toast / legalApi / useAuthStore / useIsDesktop / FindingFormSheet / buildMetaTxt / type { LegalFinding }) | 1~10 | 정적 import 묶음 | legalApi (4종) + FindingFormSheet + buildMetaTxt + useAuthStore (role) + useIsDesktop — 본 wave + W2~W5 시그니처 변경 금지 | 무관 (보존만) |
| 1. 상단 | fmtDate(iso) → `${y}.${m}.${d}` zero-padded | 13~16 | 날짜 포매터 | finding 카드 메타 line 259 호출 — 1 byte 변경 금지 | W3 |
| 1. 상단 | fmtMonthOnly(iso) → `${y}.${m}.` (trailing dot) | 18~21 | 월+점 포매터 (headerTitle 동적 분기용) | headerTitle line 121 호출 — 1 byte 변경 금지 | W2 |
| 1. 상단 | SKELETON_STYLE: React.CSSProperties — bg var(--bg3) / borderRadius 12 / **height 88** / animation `blink 2s ease-in-out infinite` | 24~29 | 로딩 스켈레톤 box (현재 JSX 미사용 — Spinner 가 처리) | dead code 박제. W5 변환 시 SKELETON 활용 옵션 (OQ #4 default 무 유지) | W2 (현 상태 박제) |
| 1. 상단 | Spinner() — 28x28 div border 2px var(--bd2) borderTopColor var(--acl) borderRadius 50% animation `spin .7s linear infinite` + 인라인 `<style>@keyframes spin{to{transform:rotate(360deg)}}</style>` | 32~39 | flex center loading spinner | line 324~325 isLoading JSX 호출 — Lucide Loader2 size={24} 교체 후보 (OQ #5) | W2 |

**영역 2 표 — 메인 페이지 LegalFindingsPage 함수** (line 41~290)

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 2. 메인 | useParams<{ id }>() / useNavigate / useQueryClient / useAuthStore({ staff }) + role = staff?.role | 43~47 | 라우팅 + 권한 분기 source | adminBar 조건부 line 208 + findingCard navigate line 240 — 변경 금지 | W2 + W3 + W4 |
| 2. 메인 | state 7종 — showSheet / editingFinding (LegalFinding\|null) / selectedResult ('') / savingResult / uploadingReport / zipLoading (string\|false) / reportInputRef (HTMLInputElement) | 49~55 | 폼/도구 상태 | adminBar 안 select+저장+보고서+ZIP / 등록 시트 / 수정 시트 진입 | W4 |
| 2. 메인 | useQuery × 2 — `['legal-round', id]` legalApi.get(id!) enabled !!id + `['legal-findings', id]` legalApi.getFindings(id!) enabled !!id staleTime 30_000 | 57~68 | **핵심 비즈** round + findings fetch | invalidateQueries onSuccess 마다 정확한 키 invalidate 필수 — 변경 금지 | W2 + W3 + W4 |
| 2. 메인 | isLoading = roundLoading \|\| findingsLoading | 70 | Spinner 조건 | line 324~325 isLoading JSX 호출 | W2 |
| 2. 메인 | currentResult = round?.result ?? null + effectiveSelectedResult = selectedResult \|\| (currentResult ?? '') | 73~74 | admin select 표시값 (선택 우선, 없으면 round.result fallback) | adminBar select value line 219 + handleSaveResult line 80 호출 — 변경 금지 | W4 |
| 2. 메인 | handleSaveResult — legalApi.updateResult(id, { result: effectiveSelectedResult \|\| undefined }) → invalidate ['legal-round', id] + ['legal-rounds'] + toast.success '점검 결과가 저장되었습니다.' / catch toast.error '저장에 실패했습니다.' | 76~89 | admin 결과 저장 핸들러 | legalApi.updateResult + queryClient + toast 카피 — 변경 금지 | W4 |
| 2. 메인 | handleReportUpload — FormData multipart `/api/uploads` (folder `legal/${id}/report`) + dynamic import('../stores/authStore').useAuthStore.getState().token + Authorization Bearer header → key 받아서 legalApi.updateResult(id, { report_file_key: key }) → invalidate ['legal-round', id] + toast.success '보고서가 업로드되었습니다.' / catch toast.error '사진 업로드 실패' | 91~117 | admin 보고서 업로드 핸들러 | FormData + dynamic authStore import + Bearer token + legalApi.updateResult(snake_case report_file_key) — 변경 금지 | W4 |
| 2. 메인 | **headerTitle** — round 있으면 `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}` / 없으면 '지적사항 목록' | 120~122 | **핵심 비즈** 동적 헤더 분기 (모바일 헤더 + 데스크톱 타이틀 양쪽 사용) | 4종 매트릭스 (round 있음 종합정밀/작동기능 × 없음) — 변경 금지 | W2 + W3 |
| 2. 메인 | handleDeleteFinding — e.stopPropagation + legalApi.deleteFinding(id, finding.id) → invalidate ['legal-findings', id] + ['legal-rounds'] + ['legal-round', id] + toast.success '삭제되었습니다' / catch toast.error err?.message ?? '삭제 실패' | 124~136 | finding 삭제 핸들러 | legalApi.deleteFinding + e.stopPropagation (카드 클릭 propagate 방지) + invalidate 3 키 + toast 카피 — 변경 금지 | W4 |
| 2. 메인 | handleZipDownload (admin 전용 — adminBar 안 배치) — fflate `zipSync` 동적 import + buildMetaTxt → 내용.txt + photoKeys '지적사진-{N}.jpg' + resolutionPhotoKeys '조치사진-{N}.jpg' + 폴더명 `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\/\\:*?"<>\|]/g, '_')}` + 파일명 `지적사항_${round?.title ?? 'report'}.zip` (19-legal location 기반과 다름 — round.title 사용) + zipLoading 5단계 ('준비 중...' / '수집 중... (N/M)' / '압축 중...' / false / idle '일괄 다운로드') + iOS PWA `<a download>` 패턴 (createElement + body.appendChild + click + removeChild + setTimeout(URL.revokeObjectURL, 3000)) + toast.success '다운로드 완료' / catch toast.error '다운로드에 실패했습니다' + console.error 'ZIP download failed:' | 138~196 | **핵심 비즈** ZIP 일괄 다운로드 (admin 전용 + 전체 findings) | fflate dynamic import + buildMetaTxt + 폴더명 정규식 + 사진 파일명 + iOS PWA `<a download>` + setTimeout 3000 + 내용.txt always 포함 — 1 byte 변경 금지 (iOS 안정성 검증된 패턴) | W4 |
| 2. 메인 | **sortedFindings** — `[...(findings ?? [])].sort((a, b) => a.status === 'open' && b.status !== 'open' ? -1 : (a.status !== 'open' && b.status === 'open' ? 1 : b.createdAt.localeCompare(a.createdAt)))` | 198~203 | **운영 룰** open-first + createdAt desc | line 338/343 sortedFindings 매핑 — 정렬 룰 source of truth, 1 byte 변경 금지 (memory `project_inspection_completion_rule` 일반화) | W3 |
| 2. 메인 | isDesktop = useIsDesktop() | 205 | ≥768px 분기 | 데스크톱/모바일 분기 10+ 위치 (헤더/타이틀/adminBar padding/콘텐츠 padding/maxWidth/addButton width 등) | W2 + W3 + W4 |
| 2. 메인 | **adminBar** — `role === 'admin' && round` 조건부 (null 시 미렌더). 외곽 padding `isDesktop ? '8px 24px' : '8px 16px'` background var(--bg2) borderBottom 1px solid var(--bd) flex gap 8 alignItems center flexShrink 0 flexWrap wrap | 208~234 | **핵심 UI** admin 권한 도구 (결과 select + 저장 + 보고서 + ZIP) | role !== 'admin' 또는 round null 면 도구 모두 숨김 — 1 byte 변경 금지 (memory `project_inspection_completion_rule` 일반화) | W4 (admin/assistant 매트릭스) |
| 2. 메인 | adminBar — select effectiveSelectedResult, 옵션 4종 '결과 미입력' / '적합' (pass) / '부적합' (fail) / '조건부적합' (conditional). bg var(--bg3) border 1px solid var(--bd2) borderRadius 8 padding '6px 12px' var(--t1) 13 appearance none cursor pointer | 219~224 | admin 결과 select | onChange setSelectedResult + handleSaveResult — 라벨 verbatim 변경 금지 | W4 |
| 2. 메인 | adminBar — 결과 저장 button '결과 저장'. 12/700 height 36 bg var(--acl) borderRadius 8 padding '0 12px' color #fff cursor savingResult ? 'not-allowed' : 'pointer' opacity savingResult ? 0.6 : 1 flexShrink 0 | 225 | admin 결과 저장 button | handleSaveResult 호출 — 카피 + style 변경 금지 | W4 |
| 2. 메인 | adminBar — file input hidden accept 'application/pdf' onChange handleReportUpload | 226 | admin 보고서 file input | handleReportUpload 호출 — 변경 금지 | W4 |
| 2. 메인 | adminBar — 보고서 button 분기 (reportFileKey 있음/없음): 있으면 '보고서 보기' (window.open '/api/uploads/' + key '_blank') 12/700 h 36 bg var(--bg3) border 1px solid var(--bd2) padding '0 12px' var(--t1) / 없으면 '보고서 업로드' / '업로드 중...' (uploadingReport) reportInputRef.current?.click() var(--t2) opacity 0.6 cursor not-allowed (uploading) | 227~231 | admin 보고서 보기/업로드 분기 | reportFileKey 매트릭스 (있음/없음) — 카피 verbatim 변경 금지 | W4 |
| 2. 메인 | adminBar — ZIP button zipLoading 텍스트 \|\| '일괄 다운로드'. disabled !!zipLoading \|\| !findings?.length. 12/700 h 36 bg var(--bg3) border 1px solid var(--bd2) padding '0 12px' var(--t1) whiteSpace nowrap. opacity 0.6 + cursor not-allowed (disabled) | 232 | admin ZIP 일괄 다운로드 button | handleZipDownload 호출 + zipLoading 5 단계 매트릭스 — 1 byte 변경 금지 | W4 |
| 2. 메인 | **findingCard** 함수 — 외곽 bg var(--bg3) border 1px solid var(--bd) **borderLeft `2px solid ${finding.status === 'open' ? 'var(--danger)' : 'var(--safe)'}`** (19-legal 3px 과 다름 — 2px) borderRadius 12 padding `isDesktop ? 16 : 12` cursor pointer flex column gap 3. onClick navigate(`/legal/${id}/finding/${finding.id}`) → 자식 페이지 진입 | 237~269 | finding 카드 외곽 + status 색바 + 자식 페이지 진입 | finding.status open/resolved 2분기 + borderLeft 2px (1 byte 변경 금지) + navigate (변경 금지) | W3 |
| 2. 메인 | findingCard 상단 라인 — description 14/500 var(--t1) flex 1 ellipsis (overflow hidden + textOverflow ellipsis + whiteSpace nowrap) + 상태 칩 (open bg rgba(239,68,68,.15) color var(--danger) '미조치' / resolved bg rgba(34,197,94,.13) color var(--safe) '완료') 11/700 borderRadius 6 padding '2px 8px' flexShrink 0 | 253~256 | description + 상태 칩 (2분기 verbatim) | finding.status 2분기 색 + 라벨 — 변경 금지 (memory `feedback_inspection_unresolved_color` 일반화) | W3 |
| 2. 메인 | findingCard 위치 — location ?? '위치 미지정' 12 var(--t2) | 257 | location fallback | '위치 미지정' verbatim 변경 금지 | W3 |
| 2. 메인 | findingCard 메타 — `${fmtDate(createdAt)} · ${createdByName ?? createdBy}` 11 var(--t3) + 우측 수정/삭제 button | 258~267 | 등록일 + 등록자 + 액션 | fmtDate + ' · ' string literal + createdByName ?? createdBy fallback + 액션 — 변경 금지 | W3 |
| 2. 메인 | findingCard 액션 — '수정' button (e.stopPropagation + setEditingFinding(finding)) / '삭제' button (handleDeleteFinding e, finding) — 둘 다 10 var(--t3) background none border none cursor pointer padding '2px 4px' | 260~266 | 수정/삭제 액션 | e.stopPropagation 보존 (카드 클릭 propagate 방지) + 카피 verbatim — 변경 금지 | W3 + W4 |
| 2. 메인 | **addButton** 함수 — `+ 지적사항 등록` verbatim. 데스크톱 width auto height 36 padding '0 16px' borderRadius 8 fontSize 13 / 모바일 width 100% height 48 borderRadius 12 fontSize 14. 공통 bg var(--acl) color #fff fontWeight 700 border none cursor pointer flexShrink 0 | 272~291 | 등록 button (모바일/데스크톱 분기 매트릭스) | onClick setShowSheet(true) → FindingFormSheet mount — 카피 + style 변경 금지 | W2 (모바일 고정 하단 + 데스크톱 타이틀 영역) + W4 |

**영역 3 표 — JSX render** (line 293~377)

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 3. JSX | 외곽 div — flex 1 display flex flexDirection column background var(--bg) height 100% overflow hidden | 294 | 페이지 외곽 | 변경 금지 | W2 |
| 3. JSX | 인라인 `<style>@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }</style>` | 295 | 인라인 keyframe (SKELETON_STYLE 정의용) | 19-legal `.6/.3` 일치 / Education `1/0.4` 와 다름 — 변경 금지 | W2 |
| 3. JSX | **모바일 헤더** — `!isDesktop` 조건. height 48 bg `rgba(22,27,34,0.97)` (raised 변형 alpha — 19-legal + 23-education 일관) borderBottom 1px solid var(--bd) flex align justify center relative flexShrink 0 | 298~308 | 모바일 자체 헤더 | OQ #1 raised alpha 0.97 유지 검토 — 변경 금지 | W2 |
| 3. JSX | 모바일 헤더 back button — aria-label "뒤로 가기" onClick navigate(-1) position absolute left 12 **width 36 height 36** border none background none color var(--t1) flex center align center | 303~305 | 모바일 back button | **§1.1 터치 마지노선 44px 미달** — OQ #5 LOCKED 시 44x44 격상 + Lucide ChevronLeft 교체 | W2 |
| 3. JSX | 모바일 헤더 back button 인라인 SVG — width 20 height 20 fill none viewBox "0 0 24 24" stroke currentColor strokeWidth 2 + path strokeLinecap round strokeLinejoin round d "M15 19l-7-7 7-7" | 304 | 인라인 ChevronLeft SVG | OQ #5 LOCKED 시 Lucide `ChevronLeft size={20}` 교체 | W2 |
| 3. JSX | 모바일 헤더 타이틀 — headerTitle 16/700 var(--t1) | 306 | 모바일 헤더 타이틀 (동적 분기) | headerTitle (line 120~122 동적 분기) — 변경 금지 | W2 |
| 3. JSX | **데스크톱 타이틀 + 등록 button** — `isDesktop` 조건. padding '24px 32px 12px' display flex alignItems center justifyContent space-between flexShrink 0 | 311~319 | 데스크톱 타이틀 영역 (글로벌 AppHeader 숨김 → 자체 타이틀) | 변경 금지 | W2 |
| 3. JSX | 데스크톱 타이틀 좌측 — headerTitle 22/800 var(--t1) + round 있으면 round.title 13 var(--t2) marginTop 4 | 313~316 | 데스크톱 타이틀 본문 + round 정보 | round 분기 매트릭스 (있음/없음) — 변경 금지 | W2 |
| 3. JSX | 데스크톱 타이틀 우측 — {addButton} (데스크톱 width auto h 36) | 317 | 데스크톱 addButton (등록) mount | addButton (line 272~291 함수) — 변경 금지 | W2 |
| 3. JSX | **{adminBar}** mount — `role === 'admin' && round` 조건부 (line 208 함수 안 조건). 모바일/데스크톱 공통 위치 (헤더 또는 타이틀 바로 아래) | 321 | adminBar mount | adminBar (line 208~234 함수) — 변경 금지 | W4 |
| 3. JSX | **콘텐츠 영역** isLoading 분기 — `<Spinner />` | 324~325 | 로딩 fallback | Spinner (line 32~39) — Lucide Loader2 교체 후보 (OQ #5) | W2 |
| 3. JSX | 콘텐츠 영역 isError 분기 — flex 1 display flex alignItems center justifyContent center padding '0 24px' textAlign center fontSize 14 color var(--t2) → '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (단일 문장 verbatim) | 326~329 | 오류 fallback (단일 문장) | 19-legal 의 분리 패턴 ('목록을 불러오지 못했습니다.' + '다시 시도' button) 과 다른 단일 문장 — 변경 금지 | W2 |
| 3. JSX | 콘텐츠 영역 목록 (성공 분기) — flex 1 overflowY auto padding `isDesktop ? '16px 32px' : '12px 16px'` paddingBottom `isDesktop ? 24 : 'calc(72px + var(--sab, 0px))'` (모바일 = 고정 CTA 영역 회피) flex column gap 8 maxWidth `isDesktop ? 800 : undefined` (데스크톱 중앙 정렬용) | 330~344 | 콘텐츠 영역 외곽 + spacing 분기 | maxWidth 800 데스크톱 + paddingBottom calc 모바일 — 변경 금지 | W2 + W3 |
| 3. JSX | 콘텐츠 영역 빈 분기 (sortedFindings.length === 0) — flex 1 display flex flexDirection column alignItems center justifyContent center gap 8 padding '60px 16px' → '지적사항 없음' 16/700 var(--t1) + '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' 12 var(--t2) textAlign center | 338~342 | 빈 상태 (isDesktop 분기 카피) | '지적사항 없음' / '상단'/'아래' 분기 verbatim 변경 금지 | W2 |
| 3. JSX | 콘텐츠 영역 카드 매핑 — sortedFindings.map(findingCard) | 343 | finding 카드 렌더 (sorted open-first) | findingCard (line 237~269 함수) — 변경 금지 | W3 |
| 3. JSX | **모바일 고정 하단 CTA** — `!isDesktop` 조건. position fixed bottom 0 left 0 right 0 background var(--bg) borderTop 1px solid var(--bd) padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' zIndex 20 → {addButton} (모바일 width 100% h 48) | 348~356 | 모바일 고정 하단 CTA | iOS safe-area padding + zIndex 20 + 콘텐츠 paddingBottom 'calc(72px + var(--sab, 0px))' 회피 패턴 — 변경 금지 | W2 |
| 3. JSX | **등록 시트** — `showSheet && id` 조건. FindingFormSheet { scheduleItemId id, mode 'create', onClose setShowSheet(false) } | 359~365 | 등록 모달 mount | FindingFormSheet 외부 컴포넌트 — props 보존 + 본 wave + W2~W5 미수정 | W4 (mount 만 마킹) |
| 3. JSX | **수정 시트** — `editingFinding && id` 조건. FindingFormSheet { scheduleItemId id, mode 'edit', finding editingFinding, onClose setEditingFinding(null) } | 368~375 | 수정 모달 mount | FindingFormSheet 외부 컴포넌트 — props 보존 + 본 wave + W2~W5 미수정 | W4 (mount 만 마킹) |

## §1.2 line 수 실측 확인

```
$ wc -l cha-bio-safety/src/pages/LegalFindingsPage.tsx
     378 cha-bio-safety/src/pages/LegalFindingsPage.tsx
```

PLAN 추정치 (378 lines) 일치, drift 없음.

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

W5 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (19-legal W1 의 비즈 anchor 보존 룰 + 23-education W1 의 비즈 anchor 보존 룰 + 28-splash W1 비즈 anchor 16건 보존 룰 일반화):

```
[LegalFindingsPage.tsx — react-query / 비즈 시그니처]
- useQuery({ queryKey: ['legal-round', id], queryFn: () => legalApi.get(id!), enabled: !!id })                                       (변경 금지)
- useQuery({ queryKey: ['legal-findings', id], queryFn: () => legalApi.getFindings(id!), enabled: !!id, staleTime: 30_000 })          (변경 금지)
- queryClient.invalidateQueries — ['legal-round', id] / ['legal-rounds'] / ['legal-findings', id] 3 키 (handler onSuccess 마다 정확한 키 invalidate 필수)
- (note: useMutation 없음 — handler 들이 직접 await + try/catch 패턴 사용. 19-legal LegalPage 의 useMutation resolveMutation 과 다름)

[utils/api.ts — legalApi 4종 시그니처 (line 349 export const legalApi)]
- legalApi.get(roundId: string): Promise<LegalRound>                                              (변경 금지)
- legalApi.getFindings(roundId: string): Promise<LegalFinding[]>                                   (변경 금지)
- legalApi.updateResult(roundId, { result?: LegalInspectionResult; report_file_key?: string })    (snake_case payload 변경 금지)
- legalApi.deleteFinding(roundId, findingId): Promise<void>                                        (변경 금지)
(주의: legalApi.list / getFinding / resolveFinding 3종은 LegalFindingsPage 미사용 — 19-legal LegalPage / LegalFindingDetailPage 가 각각 사용)

[LegalFindingsPage.tsx — 비즈 로직 함수]
- fmtDate(iso): `${y}.${m}.${d}` zero-padded                                                       (변경 금지)
- fmtMonthOnly(iso): `${y}.${m}.` (일자 없음, trailing dot)                                       (변경 금지)
- headerTitle (line 120~122): round 있으면 `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}` / 없으면 '지적사항 목록'  (동적 분기 변경 금지)
- effectiveSelectedResult (line 74): selectedResult || (round?.result ?? '')                       (initial 동기화 룰 변경 금지)
- sortedFindings (line 198~203): status 'open' 먼저 (open === -1, open !== 1, 그 외 createdAt desc localeCompare)  (운영 룰 source of truth, 변경 금지)
- adminBar 조건부 (line 208): role === 'admin' && round                                            (변경 금지)
- findingCard onClick (line 240): navigate(`/legal/${id}/finding/${finding.id}`)                   (자식 페이지 진입 — 변경 금지)
- handleDeleteFinding (line 124~136): e.stopPropagation + legalApi.deleteFinding → invalidate 3 키 + toast  (변경 금지)
- handleSaveResult (line 76~89): legalApi.updateResult({ result: effectiveSelectedResult || undefined }) → invalidate ['legal-round'/'legal-rounds']  (변경 금지)
- handleReportUpload (line 91~117): FormData multipart `/api/uploads` (folder `legal/${id}/report`) + dynamic authStore token + legalApi.updateResult({ report_file_key: key }) → invalidate ['legal-round', id]  (변경 금지)
- handleZipDownload (line 138~196): fflate zipSync + buildMetaTxt + Promise.allSettled photoKeys/resolutionPhotoKeys + iOS PWA `<a download>` 패턴 + setTimeout(URL.revokeObjectURL, 3000)  (변경 금지)
- 폴더명 패턴 (line 149): `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')}`  (변경 금지)

[LegalFindingsPage.tsx — finding 상태 status 시그니처 (memory feedback_inspection_unresolved_color 일반화)]
- finding status open → borderLeft 2px var(--danger) + 칩 bg rgba(239,68,68,.15) color var(--danger) '미조치'  (변경 금지)
- finding status resolved → borderLeft 2px var(--safe) + 칩 bg rgba(34,197,94,.13) color var(--safe) '완료'  (변경 금지)
- borderLeft 2px (19-legal LegalPage 의 3px 과 다름 — **본 페이지는 2px**)  (변경 금지)
- (note: ResultBadge / accentColor 본 페이지에 없음 — 부모 페이지 LegalPage 가 라운드 카드에 사용. 본 페이지는 round 표시는 headerTitle 동적 분기로만)

[LegalFindingsPage.tsx — role 권한 시그니처 (memory project_inspection_completion_rule 일반화)]
- adminBar 조건부 렌더 (line 208 `role === 'admin' && round`) — admin 만 결과 select / 결과 저장 / 보고서 업로드/열기 / ZIP 일괄 다운로드 가능  (변경 금지)
- assistant: adminBar 미렌더, finding 등록/수정/삭제는 가능 (조치는 자식 페이지 LegalFindingDetailPage)  (변경 금지)
- 카드 cursor pointer — 모든 사용자 자식 페이지 진입 가능 (19-legal LegalPage 의 카드 cursor pointer 룰과 일관)

[LegalFindingsPage.tsx — ZIP 다운로드 패턴]
- ZIP 파일명 (line 184): `지적사항_${round?.title ?? 'report'}.zip` (19-legal LegalPage 의 location 기반과 다름)  (변경 금지)
- 사진 파일명 (line 161, 171): `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg`  (변경 금지)
- 폴더명 패턴 (line 149): `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')}`  (변경 금지)
- 내용.txt (line 153): encoder.encode(buildMetaTxt(f)) — **사진 0건이어도 always 포함**  (변경 금지)
- iOS PWA `<a download>` 패턴 (line 182~188) + setTimeout(URL.revokeObjectURL, 3000)  (변경 금지 — iOS 안정성 검증된 패턴)
- zipLoading 단계별 텍스트: '준비 중...' / '수집 중... (N/M)' / '압축 중...' / false  (변경 금지)

[LegalFindingsPage.tsx — toast / 카피 / 자산 / animation]
- toast.success: '점검 결과가 저장되었습니다.' (line 83, handleSaveResult)                       (변경 금지)
- toast.success: '보고서가 업로드되었습니다.' (line 111, handleReportUpload)                     (변경 금지)
- toast.success: '삭제되었습니다' (line 132)                                                      (변경 금지)
- toast.success: '다운로드 완료' (line 189)                                                       (변경 금지)
- toast.error: '저장에 실패했습니다.' (line 85)                                                   (변경 금지)
- toast.error: '사진 업로드 실패' (line 113)                                                      (변경 금지)
- toast.error: err?.message ?? '삭제 실패' (line 134)                                             (변경 금지)
- toast.error: '다운로드에 실패했습니다' (line 192)                                                (변경 금지)
- 모바일 + 데스크톱 헤더 타이틀 동적 분기: round 있으면 '${종합정밀|작동기능} ${YYYY.MM.}' / 없으면 '지적사항 목록' (line 120~122)  (변경 금지)
- 빈 제목: '지적사항 없음' (line 340, 16/700 var(--t1))                                          (변경 금지)
- 빈 보조 + isDesktop 분기: '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' (line 341, 12 var(--t2))  (변경 금지)
- 오류 verbatim: '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (line 328, 14 var(--t2))  (변경 금지)
- adminBar select 옵션 verbatim: '결과 미입력' / '적합' / '부적합' / '조건부적합' (line 220~223)  (변경 금지)
- adminBar 결과 저장 button verbatim: '결과 저장' (line 225)                                       (변경 금지)
- adminBar 보고서 button verbatim: '보고서 보기' (열기, line 228) / '보고서 업로드' (idle, line 230) / '업로드 중...' (uploading)  (변경 금지)
- adminBar ZIP button verbatim: zipLoading 텍스트 || '일괄 다운로드' (line 232)                  (변경 금지)
- finding 카드 액션 verbatim: '수정' (line 264) / '삭제' (line 265)                              (변경 금지)
- finding 상태 칩 verbatim: '미조치' (open) / '완료' (resolved) (line 255)                       (변경 금지)
- finding 카드 위치 fallback: '위치 미지정' (line 257)                                            (변경 금지)
- finding 카드 메타 verbatim 패턴: `${fmtDate(createdAt)} · ${createdByName ?? createdBy}` (line 259)  (변경 금지)
- addButton verbatim: '+ 지적사항 등록' (line 289)                                                (변경 금지)
- @keyframes blink (line 295): `0%,100%{opacity:.6} 50%{opacity:.3}` — 19-legal 일치 / Education 1/0.4 와 다름  (변경 금지)
- @keyframes spin (line 36, Spinner 함수 내부): `to{transform:rotate(360deg)}`  (변경 금지)
- 모바일 헤더 height 48 + back button 36x36 (position absolute left 12, **§1.1 터치 마지노선 44px 미달** — OQ #5 LOCKED 시 44x44 격상 검토) + 타이틀 정중앙  (현 상태 박제, 격상은 OQ)
- 데스크톱 타이틀 padding '24px 32px 12px' + headerTitle 22/800 + round.title 13 var(--t2) marginTop 4
- adminBar height 컴포넌트 별: select padding '6px 12px' fontSize 13 / button height 36 padding '0 12px' fontSize 12 / 외곽 padding '8px 24px' (데스크톱) / '8px 16px' (모바일)
- 콘텐츠 영역 padding `isDesktop ? '16px 32px' : '12px 16px'` paddingBottom `isDesktop ? 24 : 'calc(72px + var(--sab, 0px))'` maxWidth `isDesktop ? 800 : undefined`
- 모바일 고정 하단 CTA: position fixed bottom 0 padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' zIndex 20 — addButton width 100% height 48
- findingCard padding `isDesktop ? 16 : 12` borderRadius 12 borderLeft 2px solid (open danger / resolved safe) + 상단 라인 description 14/500 + 칩 11/700 + 위치 12 + 메타 11 + 수정/삭제 10
- SKELETON_STYLE height 88 (Education 88 일치, 19-legal LegalPage 72 와 다름) — 단 본 페이지 SKELETON_STYLE 객체는 정의되어 있으나 실제 JSX 에서 사용되지 않음 (Spinner 가 isLoading 처리 — line 324~325). **현 상태 박제** (W5 변환 시 SKELETON 활용 옵션 검토 가능 OQ)
- Spinner div 28x28 border 2px var(--bd2) borderTopColor var(--acl) borderRadius 50% (Lucide Loader2 교체 후보)
- FindingFormSheet (자체 fixed/inset 0 오버레이, 본 wave 미수정)
- PhotoGrid / PhotoSourceModal / useMultiPhotoUpload (FindingFormSheet 내부에서 사용 — 본 페이지 직접 import 만 X)

[App.tsx — chrome 실측 (line 36, 71, 74, 77, 79~104, 117, 290) — grep 으로 사전 검증, drift 0]
- line 36: const LegalFindingsPage = lazy(() => import('./pages/LegalFindingsPage'))               (변경 금지)
- line 71: MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']  // /legal/:id 명시 미등재 (정규식 line 117 cover)  (변경 금지)
- line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']                                  // /legal/:id 미등재 (정규식 line 117 cover)  (변경 금지)
- line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']  // /legal/:id 미등재 (정규식 line 117 cover)  (변경 금지)
- line 79~104: PAGE_TITLES Record — line 98 '/legal': '소방 점검 관리' 등재. `/legal/:id` 미등재 → pageTitle = PAGE_TITLES[location.pathname] || '' 빈 문자열 (showNav=false 라 영향 없음)  (변경 금지)
- line 117: !location.pathname.match(/^\/legal\/.+/)  // /legal/:id 매칭 → showNav=false (모바일/데스크톱 모두 chrome 외곽 숨김)  (변경 금지)
- line 289: <Route path="/legal" element={<Auth><LegalPage /></Auth>} />                          (부모 페이지 — 본 wave 범위 아님)
- line 290: <Route path="/legal/:id" element={<Auth><LegalFindingsPage /></Auth>} />               (변경 금지)
- line 291: <Route path="/legal/:id/finding/:fid" element={<Auth><LegalFindingDetailPage /></Auth>} />  (자식 페이지 — 본 wave 범위 아님)

[stores/authStore.ts]
- useAuthStore().staff: Staff | null — role: 'admin' | 'assistant'                                 (시그니처 변경 금지)
- handleReportUpload 안 dynamic import('../stores/authStore').useAuthStore.getState().token       (Bearer token 패턴 변경 금지)

[hooks/useIsDesktop.ts]
- useIsDesktop(): boolean — ≥768px 분기                                                            (시그니처 변경 금지)

[components/FindingFormSheet.tsx (line 91~99 시그니처)]
- export interface FindingFormSheetProps { scheduleItemId: string, mode: 'create'|'edit', finding?: LegalFinding, onClose: () => void }
- 자체 fixed/inset 0 오버레이 — 본 wave 미수정. props 호출 양식 (onClose setShowSheet(false) / setEditingFinding(null)) 보존

[hooks/useMultiPhotoUpload.ts + utils/findingDownload.ts + components/PhotoGrid/PhotoSourceModal]
- 본 페이지 직접 사용 X (FindingFormSheet 내부에서만)
- buildMetaTxt(finding): string → ZIP 내부 '내용.txt' (line 153)                                   (시그니처 변경 금지)
- 모두 본 wave + W2~W5 미수정 — 시그니처 + props 보존

[react-query / react-router-dom / react-hot-toast 의존]
- useQuery / useQueryClient (@tanstack/react-query)
- useParams / useNavigate (react-router-dom — sub-route id 추출 + 자식 페이지 진입 / 뒤로가기)
- toast (react-hot-toast)
- import('fflate') dynamic (다운로드 ZIP 시점에만 로드)
- import('../stores/authStore') dynamic (handleReportUpload 안 token 가져오기용)
```

위 모든 식별자/값은 §6 negative rule + §5 룰 11/12 + §7 OQ #1/#2/#3/#4/#5 default 답에서 재확인. 1 byte 변경 시 W5 verify FAIL (19-legal W1 비즈 anchor + 28-splash W1 비즈 anchor 16건 + 23-education D-day 임계치 보존 룰 동일 적용).

---

# §2. 4 sub-wave 분배 plan

다음 표 (W2~W5 4행) — 파일명은 위 frontmatter 의 평면 패턴 (`sketch-wave-N-{slug}.html` for W2~W4, `wave-5-tsx-conversion-checklist.md` for W5):

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 자체 헤더 (h 48 + back 36x36 + headerTitle 동적) + 데스크톱 타이틀 영역 (padding '24px 32px 12px' + headerTitle 22/800 + round.title 13) + 빈/로딩/오류 상태 (Spinner / 빈 / 오류 단일 문장) + 모바일 고정 하단 CTA (position fixed + addButton width 100% h 48) | 영역 3 모바일 헤더 (line 298~308) + 데스크톱 타이틀 + 등록 button (line 311~319) + 콘텐츠 영역 외곽 (line 330~344) + 로딩 Spinner (line 324~325) + 오류 fallback (line 326~329) + 빈 fallback (line 338~342, isDesktop '상단'/'아래' 분기) + 모바일 고정 하단 CTA (line 348~356) + 외곽 (line 294 flex 1 column overflow hidden) + 인라인 keyframes blink (line 295 `.6/.3`). headerTitle 동적 분기 (line 120~122) 매트릭스 frame (round 있음 종합정밀/작동기능 × 없음 = 3종 + isDesktop 분기 2종 = 6 frame). | sketch-wave-2-chrome.html |
| W3 | finding 카드 목록 + open-first 정렬 + finding 상태 borderLeft 2px (open danger / resolved safe) + 칩 (미조치 danger / 완료 safe) + 메타 (fmtDate + createdByName) + 수정/삭제 액션 + 빈 상태 카피 | 영역 2 findingCard 함수 (line 237~269) + sortedFindings (line 198~203, status open 먼저 + createdAt desc) + 영역 3 콘텐츠 매핑 (line 343 sortedFindings.map(findingCard)) + finding status 2분기 매트릭스 (open/resolved + 칩+borderLeft) + 메타 분기 (createdByName ?? createdBy). isDesktop 분기 padding 16/12 + maxWidth 800 (데스크톱 중앙 정렬). | sketch-wave-3-finding-list.html |
| W4 | adminBar (role admin 조건부) — 결과 select (4 옵션) + 결과 저장 button + 보고서 업로드/열기 분기 + ZIP 일괄 다운로드 (단계별 텍스트) + addButton (모바일/데스크톱 분기) + 등록/수정 시트 mount | 영역 2 adminBar (line 208~234, role === 'admin' && round 조건부 — select '결과 미입력/적합/부적합/조건부적합' + 저장 button h 36 var(--acl) + file input hidden + 보고서 button 분기 reportFileKey 있음/없음 + ZIP button + zipLoading 5단계 텍스트) + addButton 함수 (line 272~291, 모바일 width 100% h 48 / 데스크톱 width auto h 36) + 영역 3 FindingFormSheet create (line 359~365, showSheet && id) + FindingFormSheet edit (line 368~375, editingFinding && id). admin 분기 매트릭스 (admin/assistant) + reportFileKey 있음/없음 매트릭스 + zipLoading 5 단계 매트릭스 + 모바일/데스크톱 addButton 매트릭스. handleSaveResult / handleReportUpload / handleZipDownload / handleDeleteFinding 시그니처 보존 검토. | sketch-wave-4-admin-tools.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + LegalFindingsPage.tsx 비즈 로직 보존 룰 + finding 상태 2분기 1 byte 변경 금지 + sortedFindings open-first + adminBar role admin 분기 + handleZipDownload iOS PWA `<a download>` 패턴 + buildMetaTxt + 모든 toast 카피 8건 + headerTitle 동적 분기 + Tailwind cheatsheet + 메모리 룰 12건 cross-ref. 19-legal W5 + 28-splash W5 + 23-education W5 의 12-섹션 구조 mirror. | wave-5-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트 / 레이아웃

**[W2 — 모바일 자체 헤더 + 데스크톱 타이틀 + 빈/로딩/오류 상태 + 모바일 고정 하단 CTA]**

- **보존**:
  - 모바일 헤더 + 데스크톱 타이틀 headerTitle 동적 분기 verbatim (line 120~122) — round 있음/없음 × ('종합정밀' / '작동기능') 4종 패턴
  - 빈 제목 '지적사항 없음' (line 340) + 빈 보조 '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' (line 341) verbatim + isDesktop 분기 ('상단' / '아래')
  - 오류 verbatim '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (line 328) — 19-legal LegalPage 의 분리 패턴 ('목록을 불러오지 못했습니다.' + '다시 시도' button) 과 다른 단일 문장
  - SKELETON_STYLE height 88 + animation `blink 2s ease-in-out infinite` (line 24~29) — Education 88 일치, 19-legal LegalPage 72 와 다름. 단 현재 SKELETON_STYLE 정의는 있으나 JSX 미사용 (Spinner 가 처리) — **현 상태 박제** (W5 변환 시 SKELETON 활용 옵션 OQ — 단 OQ #4 default 무 유지)
  - Spinner div 28x28 border 2px var(--bd2) borderTopColor var(--acl) borderRadius 50% animation `spin .7s linear infinite` (line 32~39) — 인라인 @keyframes spin. Lucide Loader2 (animate-spin) 교체 후보 (OQ #5)
  - @keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (line 295) — 19-legal 일치, Education 1/0.4 와 다름. 변경 금지
  - @keyframes spin `to{transform:rotate(360deg)}` (line 36 Spinner 함수 내부) — 변경 금지
  - 모바일 헤더 height 48 + back button **36x36 (position absolute left 12)** + 인라인 SVG ChevronLeft strokeWidth 2 path `M15 19l-7-7 7-7` strokeLinecap round strokeLinejoin round — **§1.1 터치 마지노선 44px 미달** — 현 상태 박제 (OQ #5 LOCKED 시 44x44 격상)
  - 모바일 헤더 bg `rgba(22,27,34,0.97)` (raised 변형 alpha) — surface-raised 토큰과의 alpha 차이 OQ #1 검토 (19-legal + 23-education 일관 raised 유지)
  - 데스크톱 타이틀 padding '24px 32px 12px' flex space-between + 좌측 headerTitle 22/800 + round.title 13 var(--t2) marginTop 4 + 우측 addButton (데스크톱 width auto h 36) — verbatim
  - 모바일 고정 하단 CTA position fixed bottom 0 left 0 right 0 padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' zIndex 20 + addButton (모바일 width 100% h 48) — verbatim
  - 콘텐츠 영역 paddingBottom 'calc(72px + var(--sab, 0px))' 모바일 (CTA 영역 회피) / 24 데스크톱
  - 콘텐츠 영역 maxWidth 800 데스크톱 (중앙 정렬용) — verbatim, 변경 금지
  - 외곽 flex 1 column overflow hidden + height 100% (line 294) — verbatim
  - useIsDesktop 분기 verbatim — 데스크톱 타이틀 영역 / 모바일 자체 헤더 + 고정 하단 CTA

- **토큰** (design-system §4.1 매핑):
  - `var(--bg)` (line 294, 351) → `bg-surface-page`
  - 모바일 헤더 bg `rgba(22,27,34,0.97)` → `bg-surface-raised/97` arbitrary 또는 인라인 유지 (OQ #1)
  - `var(--bg3)` (SKELETON_STYLE line 26 미사용, finding 카드 background line 242) → `bg-surface-sunken`
  - `var(--bd)` (모바일 헤더 borderBottom line 300, 모바일 고정 CTA borderTop line 351 외) → `border-border-default`
  - `var(--bd2)` (Spinner border line 35) → `border-border-strong`
  - `var(--t1)` (모바일 헤더 색 line 303 + 타이틀 line 306, 빈 제목 line 340, 데스크톱 타이틀 line 314) → `text-text-primary`
  - `var(--t2)` (빈 보조 line 341, 데스크톱 round.title line 315, 오류 line 327) → `text-text-secondary`
  - `var(--acl)` (Spinner borderTopColor line 35, addButton bg line 278) → `bg-accent` / `border-t-accent`

- **폰트** (design-system §1.1 + §4.2):
  - 12 (빈 보조 line 341) → text-caption(12) leading-none
  - 13 (데스크톱 addButton fontSize line 280, 데스크톱 round.title line 315) → text-label
  - 14 (모바일 addButton fontSize line 280, 오류 line 327) → text-body-sm
  - 16 (모바일 헤더 타이틀 line 306, 빈 제목 line 340) → text-body (마지노선)
  - 22 (데스크톱 타이틀 headerTitle line 314 fontSize 22/800) → text-display-sm 또는 인라인 22/800 (마지노선 이상)

- **레이아웃**:
  - 모바일: 자체 헤더 48 + (adminBar 옵션) + 콘텐츠 영역 (paddingBottom calc 72) + 고정 하단 CTA 영역 (60~64 + safe-area)
  - 데스크톱: 타이틀 padding '24px 32px 12px' + (adminBar 옵션) + 콘텐츠 영역 padding '16px 32px' maxWidth 800 paddingBottom 24
  - **모바일 BottomNav 숨김** (line 117 정규식 매칭 → showNav=false) — sketch 시 nav placeholder 그릴 필요 없음
  - **데스크톱 사이드바 BottomNav 숨김 + 글로벌 AppHeader 숨김** (line 117 정규식 매칭 → showNav=false) — sketch 시 데스크톱 시안도 chrome 외곽 없이 자체 타이틀 영역만 표시

**[W3 — finding 카드 + open-first 정렬 + 상태 칩 + 메타 + 액션]**

- **보존**:
  - **sortedFindings open-first 정렬 (line 198~203) — 1 byte 변경 금지** (운영 룰 source of truth, memory `project_inspection_completion_rule` 일반화)
  - **finding 상태 borderLeft 2px — open danger / resolved safe — 1 byte 변경 금지** (19-legal LegalPage 의 3px 과 다름, **본 페이지는 2px**)
  - **finding 칩 verbatim '미조치' (open) / '완료' (resolved) (line 255) — 1 byte 변경 금지**
  - finding 칩 색 — open bg `rgba(239,68,68,.15)` + var(--danger) / resolved bg `rgba(34,197,94,.13)` + var(--safe) (또는 status 토큰 치환 OQ #2)
  - finding 칩 외곽 — fontSize 11/700 borderRadius 6 padding '2px 8px' flexShrink 0 (1 byte 변경 금지)
  - finding 카드 외곽 — bg var(--bg3) border 1px solid var(--bd) borderLeft 2px solid (status 분기) borderRadius 12 padding `isDesktop ? 16 : 12` cursor pointer flex column gap 3
  - finding description 14/500 var(--t1) flex 1 1줄 ellipsis (overflow hidden + textOverflow ellipsis + whiteSpace nowrap)
  - finding 위치 12 var(--t2) + fallback '위치 미지정' (line 257) verbatim
  - finding 메타 11 var(--t3) — verbatim 패턴 `${fmtDate(createdAt)} · ${createdByName ?? createdBy}`
  - finding 액션 '수정' (line 264, e.stopPropagation + setEditingFinding) / '삭제' (line 265, handleDeleteFinding) — 둘 다 10 var(--t3) background none border none padding '2px 4px' cursor pointer
  - findingCard onClick navigate(`/legal/${id}/finding/${finding.id}`) — **자식 페이지 진입** (본 wave 범위 아님, 액션만 보존)

- **토큰** (status- prefix 없음 룰):
  - 카드 bg `var(--bg3)` → `bg-surface-sunken`
  - 카드 border 1px solid var(--bd) → `border border-border-default`
  - **finding borderLeft 2px status 토큰** (OQ #2): open → `border-l-2 border-danger-bar` / resolved → `border-l-2 border-safe-bar` — 2px 보존 (border-l-[2px] arbitrary 또는 border-l-2 tailwind 기본)
  - **finding 칩 status 토큰** (OQ #2): open → `bg-danger-bg text-danger` / resolved → `bg-safe-bg text-safe`
  - **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern`) — `border-l-status-danger-bar` 같은 패턴 사용 시 W5 verify FAIL
  - description color `var(--t1)` → `text-text-primary`
  - 위치 color `var(--t2)` → `text-text-secondary`
  - 메타 color `var(--t3)` → `text-text-tertiary`
  - 수정/삭제 button color `var(--t3)` → `text-text-tertiary`

- **폰트** (design-system §1.1 + §4.2):
  - 10 (수정/삭제 button line 263/265) — **§1.1 9·10·11 금지 위반** — 12 격상 후보 (OQ #3 검토)
  - 11 (finding 칩 line 255, 메타 line 259) — **§1.1 위반** — 12 격상 후보 (OQ #3). 격상 후 leading-none 명시 (memory `feedback_text_caption_leading_none`)
  - 12 (위치 line 257) → text-caption(12) leading-none (작은 컨테이너 시각 패딩 방지)
  - 14 (description line 254) → text-body-sm

- **레이아웃**:
  - 카드 padding 16 (데스크톱) / 12 (모바일) + borderRadius 12 + gap 3 (1 byte 변경 금지)
  - 콘텐츠 영역 padding '16px 32px' (데스크톱) / '12px 16px' (모바일) + flex column gap 8 + maxWidth 800 (데스크톱 중앙)
  - 상단 라인 flex alignItems center justifyContent space-between gap 8
  - 메타 라인 flex alignItems center justifyContent space-between
  - 액션 영역 flex alignItems center gap 8

**[W4 — adminBar + addButton + FindingFormSheet mount]**

- **보존**:
  - **adminBar 조건부 렌더 `role === 'admin' && round` (line 208) — 1 byte 변경 금지** (memory `project_inspection_completion_rule` 일반화)
  - **legalApi 4종 호출 (get / getFindings / updateResult / deleteFinding) + admin 분기** — 변경 금지
  - **handleZipDownload iOS PWA `<a download>` 패턴 + setTimeout(URL.revokeObjectURL, 3000)** — 변경 금지
  - **handleReportUpload FormData multipart `/api/uploads` (folder `legal/${id}/report`) + dynamic authStore token** — 변경 금지
  - **handleDeleteFinding e.stopPropagation + invalidate 3 키** — 변경 금지
  - toast 카피 verbatim 8종 — success 4 ('점검 결과가 저장되었습니다.' / '보고서가 업로드되었습니다.' / '삭제되었습니다' / '다운로드 완료') + error 4 ('저장에 실패했습니다.' / '사진 업로드 실패' / err?.message ?? '삭제 실패' / '다운로드에 실패했습니다')
  - adminBar 외곽 — padding `isDesktop ? '8px 24px' : '8px 16px'` background var(--bg2) borderBottom 1px solid var(--bd) flex gap 8 alignItems center flexShrink 0 flexWrap wrap
  - admin select 옵션 verbatim — '결과 미입력' / '적합' / '부적합' / '조건부적합' (line 220~223). bg var(--bg3) border 1px solid var(--bd2) borderRadius 8 padding '6px 12px' color var(--t1) fontSize 13 appearance none cursor pointer
  - admin 결과 저장 button '결과 저장' (line 225) — 12/700 height 36 bg var(--acl) borderRadius 8 padding '0 12px' color #fff. opacity savingResult ? 0.6 : 1 (1 byte 변경 금지)
  - admin file input hidden + accept 'application/pdf' onChange handleReportUpload
  - admin 보고서 button 분기 — reportFileKey 있으면 '보고서 보기' window.open + color var(--t1) / 없으면 '보고서 업로드' / '업로드 중...' + color var(--t2). 12/700 h 36 bg var(--bg3) border 1px solid var(--bd2) padding '0 12px' (1 byte 변경 금지)
  - admin ZIP button zipLoading 텍스트 || '일괄 다운로드' (line 232) + disabled !!zipLoading || !findings?.length. 12/700 h 36 bg var(--bg3) border 1px solid var(--bd2) padding '0 12px' color var(--t1) whiteSpace nowrap (1 byte 변경 금지)
  - addButton verbatim '+ 지적사항 등록' (line 289) — 모바일 width 100% h 48 borderRadius 12 fontSize 14 / 데스크톱 width auto h 36 padding '0 16px' borderRadius 8 fontSize 13 — 공통 bg var(--acl) color #fff fontWeight 700 border none
  - FindingFormSheet props (scheduleItemId / mode 'create'|'edit' / finding / onClose) verbatim — props 호출 양식 보존
  - 등록 시트 mount: showSheet && id (line 359~365)
  - 수정 시트 mount: editingFinding && id (line 368~375)
  - zipLoading 단계별 텍스트 5종 verbatim — '준비 중...' / '수집 중... (${i+1}/${findings.length})' / '압축 중...' / false / '일괄 다운로드' (idle)
  - ZIP 파일명 패턴 `지적사항_${round?.title ?? 'report'}.zip` (line 184) verbatim
  - 폴더명 패턴 `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')}` verbatim
  - 사진 파일명 '지적사진-${j+1}.jpg' / '조치사진-${j+1}.jpg' verbatim
  - 내용.txt always 포함 (사진 0건이어도)

- **토큰** (status- prefix 없음 룰):
  - adminBar bg `var(--bg2)` → `bg-surface-raised`
  - adminBar borderBottom `var(--bd)` → `border-b border-border-default`
  - select bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary`
  - 결과 저장 button bg `var(--acl)` → `bg-accent` solid (작은 도구 = solid 유지 권장 — 메인 CTA 한정 그라데이션 OQ #4) — 또는 §6.4 그라데이션 (OQ #4)
  - 보고서 button bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary` (열기) / `var(--t2)` → `text-text-secondary` (idle)
  - ZIP button bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary`
  - addButton bg `var(--acl)` → `bg-accent` solid 또는 **§6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)`** (메인 CTA 적용 OQ #4 default 그라데이션). disabled cursor not-allowed + opacity 0.6

- **폰트** (design-system §1.1 + §4.2):
  - 12 (admin 결과 저장/보고서/ZIP button line 225/228/230/232) — **§1.1 9·10·11 금지 한계 케이스 (12 = 마지노선)** — 격상 불요. text-caption(12) font-bold leading-none
  - 13 (admin select fontSize line 219, addButton 데스크톱 line 280) → text-label
  - 14 (addButton 모바일 line 280) → text-body-sm

- **레이아웃**:
  - adminBar — padding '8px 24px' (데스크톱) / '8px 16px' (모바일) + flex gap 8 alignItems center flexShrink 0 flexWrap wrap
  - select padding '6px 12px' borderRadius 8
  - button h 36 padding '0 12px' borderRadius 8 — **터치 마지노선 44px 미달** (h 36 = 데스크톱 도구 36 정도, 모바일은 컨펌 후 격상 검토 OQ #3)
  - addButton 모바일 h 48 borderRadius 12 / 데스크톱 h 36 borderRadius 8
  - FindingFormSheet 자체 fixed/inset 0 오버레이 (본 wave 미수정)

**[W5 — TSX 변환 verify checklist]**

- W2~W4 모든 sketch 의 className/style 인라인 grep 추출 + verbatim 인용 (memory `feedback_planner_prompt_sketch_verbatim`)
- 비즈 anchor 시그니처 1 byte 변경 0 verify gate — useQuery 2종 + legalApi 4종 + headerTitle 동적 분기 + sortedFindings open-first + handleSaveResult/handleReportUpload/handleDeleteFinding/handleZipDownload (iOS PWA `<a download>` + setTimeout 3000) + adminBar role === 'admin' && round 조건부 + findingCard navigate + buildMetaTxt + ZIP 파일명 + 폴더명 패턴 + 사진 파일명 + toast 카피 8종 + 빈/오류 카피 + @keyframes blink (.6/.3) + spin
- 19-legal W5 + 28-splash W5 + 23-education W5 의 12-섹션 구조 mirror — 산출 파일 헤더 / OQ LOCKED 정리 / Tailwind 매핑 표 / 비즈 anchor 보존 verify / negative gate / positive gate / scope / build / 메모리 룰 cross-ref
- finding 상태 status 토큰 매핑 verify (OQ #2 LOCKED) — borderLeft 2px → `border-l-2 border-{safe|danger}-bar` / 칩 → `bg-{safe|danger}-bg text-{safe|danger}`, status- prefix 없음
- role admin 도구 분기 / sortedFindings / handleZipDownload iOS PWA 패턴 시그니처 무변 verify (memory `project_inspection_completion_rule` 일반화)
- 모바일 back button 36x36 → 44x44 (OQ #5 LOCKED 시) + Lucide ChevronLeft size={20} 교체 verify + lucide-react import 추가
- Spinner 함수 (인라인 div + @keyframes spin) → Lucide Loader2 size={24} className `animate-spin` 교체 verify (OQ #5 LOCKED 시) — Spinner 함수 line 32~39 폐기
- addButton (메인 CTA) §6.4 그라데이션 (OQ #4 LOCKED 시) verify — `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 빈/오류 상태 아이콘 추가 (OQ #4 LOCKED 시) verify — Lucide `ClipboardList` (빈, 점검 의미) + `AlertCircle` (오류) 또는 무 유지

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

design-system.md (`cha-bio-safety/docs/redesign-context/20-legal-findings/design-system.md`, v0.1.1) 의 §1.1 / §1.2 / §1.3 / §6.4 / §6.6 / §7 (Iconography) / §7.1 (Lucide) 본문을 각각 별도 fence 블록에 verbatim 박제. §6/§7 미적용 부분은 1줄 메타 동반. 19-legal wave-1-index.md 의 동일 영역과 동일 design-system.md 기반이므로 fence 내용 동일 — 본 wave 는 19-legal wave-1-index.md 의 §3 본문 그대로 인용 후 "적용 메타 (20-legal-findings)" 만 본 페이지 컨텍스트로 갱신.

## §3.1 design-system §1.1 노안 친화 (verbatim fence)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

**적용 메타 (20-legal-findings)**: LegalFindingsPage 의 현재 fontSize 매핑 — **10 (finding 카드 수정/삭제 button line 263/265)** — §1.1 위반 (9·10·11 금지). **11 (finding 칩 line 255, 메타 line 259)** — §1.1 위반. 격상 후보 12 (OQ #3 검토). 12 / 13 / 14 / 16 / 22 (데스크톱 타이틀 22/800 마지노선 이상). **터치 마지노선 44px** — 모바일 back button **36x36 (line 303 absolute left 12)** = **§1.1 위반** (OQ #5 LOCKED 시 44x44 격상). addButton 모바일 h 48 = 룰 일치 (44 + 4 추가) / 데스크톱 h 36 = 데스크톱 도구 패턴 일치. adminBar button h 36 = 도구 패턴 (44px 직접 적용 대상 아님 — 데스크톱 도구 36 일관). finding 칩 + 수정/삭제 button = 배지/장식 패턴 (44px 룰 직접 적용 대상 아님).

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim fence)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

**적용 메타 (20-legal-findings)**: 정보 위계 — finding 카드 description 14/500 (var(--t1)) → 위치 12 (var(--t2)) → 메타 11 (var(--t3)) 3 단계 명확. finding 상태 칩 11/700 status 색 = 빠른 식별 (§1.4 상태 색 의미 룰 일치). borderLeft 2px = 카드 좌측 색바로 상태 즉시 인지. 칩 + borderLeft 동시 표시 = 정보 중복이지만 빠른 식별 우선. 장식 0건 (addButton 만 §6.4 후보).

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim fence)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

**적용 메타 (20-legal-findings)**: 데스크톱 = **단일 컬럼 maxWidth 800 중앙 정렬** (19-legal LegalPage 의 3분할 마스터-디테일 과 다름 — 본 페이지는 자식 페이지 진입 위주, 데스크톱도 모바일과 유사한 단일 컬럼). "데스크톱이 빽빽한 건 레이아웃이 책임진다" 룰은 maxWidth 800 + padding 32 좌우 여백 책임. 모바일 = 단일 컬럼 + 고정 하단 CTA. 폰트 분기 — **데스크톱 타이틀 22/800 / 모바일 타이틀 16/700** (§1.3 동일 폰트 룰 위반 — 데스크톱이 큼, 단 마스터 타이틀은 예외 케이스). finding 카드 본문은 모바일/데스크톱 동일 폰트 (description 14, 위치 12, 메타 11) — 룰 일치. spacing 분기 — finding 카드 padding 16 (데스크톱) / 12 (모바일) + 콘텐츠 영역 padding '16px 32px' (데스크톱) / '12px 16px' (모바일) — §1.3 허용. addButton 모바일 h 48 / 데스크톱 h 36 — 모바일 터치 마지노선 일치, 데스크톱 도구 패턴 일관.

## §3.4 design-system §6.4 Backgrounds & Gradients (verbatim fence)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

**적용 메타 (20-legal-findings)**: LegalFindingsPage 의 CTA 버튼 = addButton (line 272~291, 모바일 width 100% h 48 / 데스크톱 width auto h 36) + adminBar 안 결과 저장 button (line 225, h 36). 모두 현재 solid `var(--acl)` — §6.4 그라데이션 적용 후보. **default = addButton (메인 CTA) 그라데이션 + adminBar 결과 저장 button solid 유지 + 보고서/ZIP button 비-acl solid 유지** (OQ #4). 작은 도구 button (h 36) 까지 그라데이션 = 시각 잡음 — 메인 CTA 한정. 그라데이션 색은 §6.4 룰 (#1d4ed8, #0ea5e9) 우선. 19-legal / 23-education / 17-annual-plan / 16-workshift / 14-reports W1 OQ #1 그라데이션 default 일관. 단 28-splash W1 OQ #1 은 정반대 (solid 채택) — 사용자 컨펌으로 둘 중 LOCKED. 그 외 모든 배경 = surface 토큰 단색 일치 (그라데이션 0건 확인).

## §3.5 design-system §6.6 Animation (verbatim fence)

```
### 6.6 Animation (최소화)

업무 도구 톤 — 화려한 모션 금지.

| 대상 | 트랜지션 |
|---|---|
| 모달/시트 진입 | `transform: translateY(100%)→0`, `cubic-bezier(0.32,0.72,0,1)`, 0.26s |
| 대시보드 카드 stagger | `slideUp .28s ease-out`, 0.06s 간격 |
| 상태 dot (수신반 이력) | `blink 2s ease-in-out infinite` |
| 일반 트랜지션 | `all .13s` 또는 `border-color .15s, transform .15s` |
```

**적용 메타 (20-legal-findings)**: SKELETON_STYLE animation `blink 2s ease-in-out infinite` (line 28) = §6.6 "상태 dot (수신반 이력)" 룰 일치. 단 SKELETON_STYLE 객체는 정의되어 있으나 JSX 미사용 (Spinner 가 isLoading 처리). 인라인 @keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (line 295) — 19-legal 일치, **Education 의 opacity 1/0.4 와 다름 (현재 .6/.3 더 미세)**. 변경 금지. Spinner `spin .7s linear infinite` (line 35~36) — §6.6 의 "일반 트랜지션" 범주, 0.7s 는 §6.6 표 미정의 (loading spinner 는 일반 트랜지션과 별개) — 현 상태 보존. 화려한 모션 0건. 모달/시트 진입 트랜지션은 FindingFormSheet (본 wave 미수정) 가 자체 처리.

## §3.6 design-system §7 Iconography 미적용 메타 + §7.1 Lucide (verbatim fence)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

**적용 메타 (20-legal-findings)**: LegalFindingsPage 본문에 **이모지 0건** — 19-legal LegalPage 의 '📷' 첨부 button 이모지는 FindingDetailPanel 안에 있고 본 페이지에는 없음 (조치는 자식 페이지 LegalFindingDetailPage 가 담당). 모바일 back button 인라인 SVG ChevronLeft (line 304, path `M15 19l-7-7 7-7` strokeLinecap round strokeLinejoin round) **size 20** → Lucide `ChevronLeft size={20} color="currentColor"` 교체 후보 (16-workshift / 17-annual-plan / 28-splash / 23-education / 19-legal W1 OQ 일관 LOCKED). Spinner 인라인 div + @keyframes spin (line 32~39) — Lucide `Loader2` (animate-spin) 교체 후보. **§7.2 카테고리 → Lucide 매핑** = LegalFindingsPage 는 점검 카테고리 카드 시스템 아님 (finding 카드 = 지적사항 단위) → **미적용 1줄 메타**. **§6.1 Progress Color Rule** / **§6.2 Stat Card Number Color** / **§6.3 카테고리 카드** = LegalFindingsPage 에 진척률 도넛/통계 카드/카테고리 카드 모두 없음 → **미적용 1줄 메타** (memory `feedback_tsx_wave_stat_card_drift` 룰 일치). **§7.3 상태/결과 아이콘** = finding 상태 칩 (미조치/완료) 가 색만 사용 (아이콘 없음) — 상태별 아이콘 추가 옵션 (open `AlertCircle` 또는 `Circle` / resolved `CheckCircle`) — OQ #4 default 아이콘 무 유지 (현 디자인 보존).

---

# §4. 02+06 chrome 통일 룰 적용 여부

`inspection-modal-chrome-rules.md` (`cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md`) 를 읽고 20-legal-findings 의 chrome 적용 여부 정리.

**20-legal-findings 페이지는 19-legal LegalPage 의 sub-route (`/legal/:id`) → 점검 시리즈 직접 적용 케이스.** 02 InspectionPage 와 동일한 점검 도메인. **단 19-legal LegalPage 와 결정적 차이**: App.tsx line 117 정규식 `^\/legal\/.+` 매칭 → 모바일/데스크톱 모두 **showNav=false** → BottomNav + 사이드바 + 글로벌 AppHeader 모두 숨김. 자체 헤더 (모바일) + 데스크톱 타이틀 영역이 chrome 의 유일한 외곽.

inspection-modal-chrome-rules.md 의 각 룰을 1줄씩 적용/미적용 판정 + 적용 룰은 verbatim 인용.

1. **§1 3-Layer 배경 계층** — 본 wave 의 모달 후보: FindingFormSheet (등록 mode 'create' line 359~365 + 수정 mode 'edit' line 368~375) + (PhotoSourceModal FindingFormSheet 내부). 자체 fixed/inset 0 오버레이, 본 wave 미수정 — chrome 룰 §1 (헤더 page → wrapper raised → 본문 page 3-layer) 직접 적용 판정은 FindingFormSheet 별도 wave 에서. **본 W2~W5 범위 = 모바일 자체 헤더 + 데스크톱 타이틀 + 콘텐츠 + 모바일 고정 하단 CTA + adminBar = 모달 chrome 룰 직접 적용 0건** (페이지 chrome 도메인). 모바일 헤더 bg rgba(22,27,34,0.97) = raised 변형 alpha (OQ #1).

2. **§2 헤더 규칙** — 모바일 자체 헤더 (line 298~308): h 48 + bg `rgba(22,27,34,0.97)` (raised 변형 alpha) + headerTitle 정중앙 + position absolute back button 36x36 + 인라인 SVG ChevronLeft size 20. **chrome 룰 §2.1 'bg-surface-page border-b border-border-default flex-shrink-0' 통일 룰** vs 현재 raised 변형 alpha — OQ #1 default raised 유지 (19-legal + 16-workshift + 17-annual-plan + 02 + 28-splash + 23-education 일관). 단 alpha 0.97 보존 검토. **chrome 룰 §2 헤더 h 48** = 현재 일치. **§2.2 아이콘** = 본 페이지 모바일 헤더 아이콘 ChevronLeft size 20 (별도 모달 size 18 룰과 다른 페이지 chrome 영역이라 직접 적용 X). **§2.3 타이틀** = headerTitle (동적 분기) 16/700 var(--t1) — chrome 룰 `text-body font-bold text-text-primary truncate` (16) 일치. **§2.4 우측 액션 버튼** = 모바일 헤더는 우측 버튼 없음 (back button 만 좌측 absolute). headerTitle 동적 분기 (round 있음/없음 + 종합정밀/작동기능) = sketch 시 frame 매트릭스 (4종) 필요.

3. **§3 Zone/항목/계단실/카테고리 선택 영역** — LegalFindingsPage 본 페이지에 zone/category/floor/line 선택 영역 없음 → 직접 적용 X. **본 wave 범위에서 미적용** (finding 등록 시 layer/zone 선택은 FindingFormSheet 가 담당 — 본 wave 미수정).

4. **§4 Floor/Line 가로 스크롤 칩** — 본 페이지에 가로 스크롤 칩 영역 없음 → 직접 적용 X. **본 wave 범위에서 미적용.** finding 카드 목록은 세로 flex column (line 331~344) — 가로 스크롤 칩 패턴 아님.

5. **§5 상태 색 규칙 (선택/비선택/완료)** — finding 카드 selected 분기 없음 (모바일 = 모든 사용자 자식 페이지 진입, 카드 선택 시각 강조 없음). **finding borderLeft 2px (open danger / resolved safe) + 칩** (line 244, 255) = chrome 룰 §5 의 "완료 → safe / 비선택 → strong border + page" 룰의 status 의미 적용 케이스 — 결과 status 색 매핑 룰 (memory `feedback_inspection_unresolved_color` 일반화). **§5 룰 일부 적용** (status 색 의미는 일치). 단 borderLeft 2px (chrome 룰 §5 `border-[1.5px]` + 19-legal 의 3px 과 다름) — 본 페이지 자체 룰 = 2px 보존.

6. **§6 본문 영역 + 입력칸** — 본 페이지의 본문 = finding 카드 목록 + adminBar. **§6.1 본문 컨테이너** = 모바일 line 330~344 `flex 1 overflowY auto padding '12px 16px' flex column gap 8` / 데스크톱 `flex 1 overflowY auto padding '16px 32px' flex column gap 8 maxWidth 800` — chrome 룰 `flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5` 와 padding/gap 미세 차이 (디자인 토큰 분기 의도). **§6.2 input/textarea** = adminBar select (line 219) `bg var(--bg3) border 1px solid var(--bd2) borderRadius 8 padding '6px 12px' var(--t1) 13` = chrome 룰 `bg-surface-raised text-text-primary text-label outline-none ...` 부분 일치 (현재 bg-surface-sunken 사용 vs chrome 룰 bg-surface-raised 권장). **§6 룰 일부 적용** (텍스트 13/label 일치, bg 토큰 차이는 OQ 검토 가능 — 단 본 wave 범위는 outline 만, 토큰 변경은 W5 LOCKED 시점).

7. **§7 06 FloorPlanPage 적용 가이드** — 06 FloorPlanPage 전용 룰 → 본 페이지 미적용. 단 **§7.2 의 "뒤로가기 버튼: `w-8 h-8 rounded-sm bg-surface-sunken border border-border-default text-text-secondary` + `<ChevronLeft size={15} />`" 패턴** = 본 페이지 모바일 back button 36x36 inline SVG ChevronLeft 와 비교 가능. **§1.1 터치 마지노선 44px** = 본 페이지 36x36 < 44x44 (OQ #5 격상 후보). chrome 룰 `w-8 h-8` (32px tailwind override) 와도 다름 (memory `feedback_tailwind_w8_h8_is_48px` 함정 — `w-8` = 48px). 본 페이지 36x36 → `w-9 h-9` (36px) 또는 `w-[36px] h-[36px]` arbitrary / 44x44 격상 → `w-11 h-11` 또는 `w-[44px] h-[44px]` arbitrary. **본 룰 부분 적용** (page chrome 의 back button 패턴만 mirror, 36→44 격상은 OQ #5).

**실측 결과 (App.tsx 본문 grep, drift 없음):**

```
line 36: const LegalFindingsPage = lazy(() => import('./pages/LegalFindingsPage'))
line 71: MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']  // /legal/:id 명시 미등재 (정규식 line 117 cover)
line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']                                  // /legal/:id 미등재 (정규식 line 117 cover)
line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']  // /legal/:id 미등재 (정규식 line 117 cover)
line 79~104: PAGE_TITLES Record — line 98 '/legal': '소방 점검 관리' 등재 / '/legal/:id' 미등재 (pageTitle 빈 문자열, showNav=false 라 영향 없음)
line 117: !location.pathname.match(/^\/legal\/.+/)                              // /legal/:id 매칭 → showNav=false (모바일/데스크톱 모두 chrome 외곽 숨김)
line 289: <Route path="/legal" element={<Auth><LegalPage /></Auth>} />          // 부모 페이지 — 본 wave 범위 아님
line 290: <Route path="/legal/:id" element={<Auth><LegalFindingsPage /></Auth>} />
line 291: <Route path="/legal/:id/finding/:fid" element={<Auth><LegalFindingDetailPage /></Auth>} />  // 자식 페이지 — 본 wave 범위 아님
```

**핵심 시사점:**

- 모바일: 자체 헤더만 (line 298~308, h 48 + back button 36x36 + headerTitle), BottomNav 숨김 (정규식 cover). **36x36 back button 은 §1.1 터치 44px 미달 — OQ #5 LOCKED 시 44x44 격상**.
- 데스크톱: **chrome 외곽 0건** (자체 타이틀 영역만, 글로벌 AppHeader + 사이드바 모두 정규식으로 숨김) → sketch 시 데스크톱 시안에 글로벌 chrome 그리지 않음. 19-legal LegalPage / 23-education / 17-annual-plan 와 완전히 다른 패턴.
- **본 wave + W2~W5 모두 LegalFindingsPage.tsx 본 페이지만 다룸 — 부모 `/legal` (LegalPage) + 자식 `/legal/:id/finding/:fid` (LegalFindingDetailPage) 는 별도 wave.**
- **19-legal LegalPage 와 차이 5건**: (1) 글로벌 chrome 0건 vs 19-legal 데스크톱 AppHeader+사이드바 표시, (2) 단일 export 378 lines vs 19-legal 3개 내부 컴포넌트, (3) finding borderLeft 2px vs 19-legal 3px, (4) ZIP 파일명 round.title 기반 vs 19-legal location 기반, (5) findingCard 클릭 시 자식 페이지 진입 vs 19-legal 데스크톱 setSelectedFindingId.

본 wave + W2~W5 모두 `App.tsx` 손대지 않음 (§6 negative rule).

---

# §5. 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건. 19-legal W1 + 23-education W1 + 28-splash W1 + 17-annual-plan W1 + 16-workshift W1 + 27-login W1 의 10건 + LegalFindingsPage 특화 2건 (`feedback_inspection_unresolved_color` finding 상태 칩 + borderLeft status 토큰 일반화 + `project_inspection_completion_rule` role admin 권한 도구 분기 + sortedFindings open-first source of truth 일반화). 각 룰은 슬러그 + 요약 + Why + How (20-legal-findings 컨텍스트) 4 항목.

### 룰 1 — feedback_design_sketch_first

- **요약**: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- **Why**: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적. 디자인 작업의 핵심 룰.
- **How to apply (20-legal-findings)**: W3 finding 카드 크기 (현재 padding 16/12 borderRadius 12 borderLeft 2px) / W4 adminBar button h 36 + select padding '6px 12px' + addButton 모바일 h 48 / 데스크톱 h 36 / 모바일 고정 하단 CTA 영역 + paddingBottom 'calc(72px + var(--sab, 0px))' 조정도 spacing 손볼 거 있으면 sketch 먼저. 특히 데스크톱 maxWidth 800 은 운영 룰 (단일 컬럼 중앙 정렬 — 19-legal LegalPage 의 3분할과 다른 의도된 패턴) — "맥스 1200 으로 좀 늘려" 인라인 변경 직행 금지.

### 룰 2 — feedback_redesign_sketch_rule_enforcement

- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- **Why**: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- **How to apply (20-legal-findings)**: finding 카드 borderLeft 2px (open danger / resolved safe) + 칩 (open '미조치' danger / resolved '완료' safe) 는 §6.2 negative rule 의 예외가 아니라 §1.4 상태 색 의미 룰의 정상 적용 케이스 (룰 11 — finding 상태 = status 토큰 일반화 룰). adminBar 결과 저장 button bg var(--acl) = accent 색 (활성 강조) — status 임계치 아님. `border-l-status-safe-bar` 같은 위험 색 사용 금지.

### 룰 3 — feedback_sketch_realistic_data

- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- **Why**: sketch 작성 시 '지적사항 목록' 같은 타이틀이나 칩 라벨 '미조치/완료' 를 임의 변경하면 코드 변경 wave 가 deviation 으로 잡힘.
- **How to apply (20-legal-findings)**: 카피 verbatim — '지적사항 목록' (헤더 fallback, line 122), '종합정밀/작동기능 ${YYYY.MM.}' (headerTitle 동적 분기 verbatim), '미조치' / '완료' (finding 상태 칩), '지적사항 없음' (빈 제목), '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' (빈 보조 + isDesktop 분기 보존), '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (오류 단일 문장), '결과 미입력' / '적합' / '부적합' / '조건부적합' (admin select), '결과 저장' (admin 저장), '보고서 보기' / '보고서 업로드' / '업로드 중...' (admin 보고서 분기), '일괄 다운로드' / '준비 중...' / '수집 중... (N/M)' / '압축 중...' (admin ZIP 단계별), '+ 지적사항 등록' (addButton), '수정' / '삭제' (finding 액션), '위치 미지정' (위치 fallback), 메타 verbatim (' · ' dot + fmtDate + createdByName). toast 카피 8종. 시안에서 변경 금지.

### 룰 4 — feedback_planner_prompt_sketch_verbatim

- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
- **Why**: planner 가 sketch 의 토큰명 (예: `bg-surface-raised`) 을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용.
- **How to apply (20-legal-findings)**: W5 TSX 변환 wave 진입 직전 `sketch-wave-2~4.html` 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → `wave-5-tsx-conversion-checklist.md` 안에 verbatim 인용. 특히 finding 상태 rgba 정확히 — `rgba(239,68,68,.15)` (open) / `rgba(34,197,94,.13)` (resolved), 모바일 헤더 bg `rgba(22,27,34,0.97)`, 모바일 헤더 h 48 + back button 36x36 (또는 44x44 OQ #5), 데스크톱 타이틀 padding '24px 32px 12px' + headerTitle 22/800, finding 카드 데스크톱 padding 16 / 모바일 padding 12 + borderRadius 12 + borderLeft 2px solid (status 분기), adminBar 외곽 padding '8px 24px' / '8px 16px' + flex gap 8 + flexWrap wrap, adminBar button h 36 padding '0 12px' borderRadius 8, adminBar select padding '6px 12px' borderRadius 8, addButton 모바일 h 48 borderRadius 12 / 데스크톱 h 36 borderRadius 8, 모바일 고정 하단 CTA padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' zIndex 20, 콘텐츠 영역 paddingBottom 'calc(72px + var(--sab, 0px))' (모바일) / 24 (데스크톱) maxWidth 800 (데스크톱), SKELETON_STYLE height 88 (미사용), Spinner 28x28 border 2px, animation `blink 2s ease-in-out infinite` + `spin .7s linear infinite`, @keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (19-legal 일치, Education .4 와 다름), @keyframes spin `to{transform:rotate(360deg)}`, ZIP 파일명 패턴 `지적사항_${round?.title ?? 'report'}.zip`, 폴더명 패턴 `finding-${idx zero-padded 3}_${location 안전화}`, 사진 파일명 패턴. 추측 토큰명 사용 시 deviation 유발.

### 룰 5 — feedback_tailwind_token_class_pattern

- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지).
- **Why**: 11-div TSX v3 hotfix(4ce707e) 사고 — `status-` prefix 가 tailwind.config 에 없어서 class 안 먹음. `bg-safe-bar` 가 올바른 패턴.
- **How to apply (20-legal-findings)**: finding borderLeft → `border-l-2 border-{safe|danger}-bar` (open/resolved) — **borderLeft 2px** 보존 (border-l-2 tailwind 기본 또는 border-l-[2px] arbitrary). finding 상태 칩 → `bg-{danger|safe}-bg text-{danger|safe}`. `bg-status-safe-bg` 사용 시 W5 verify FAIL. addButton → `bg-accent` solid 또는 §6.4 그라데이션 (OQ #4) — 토큰 prefix 동일 룰 적용. adminBar 결과 저장 button → `bg-accent` solid 유지 (작은 도구). 모바일 back button → Lucide `ChevronLeft size={20}` prop (OQ #5) — className 으로 `w-5 h-5` 금지. Spinner → Lucide `Loader2 size={24} className="animate-spin"` (OQ #5).

### 룰 6 — feedback_tailwind_w8_h8_is_48px

- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- **How to apply (20-legal-findings)**:
  - 모바일 back button 36x36 (line 303) → `w-9 h-9` (36px tailwind 기본 spacing 9) 또는 `w-[36px] h-[36px]` arbitrary. **§1.1 터치 44px 미달 — OQ #5 LOCKED 시 44x44 격상 = `w-11 h-11` 또는 `w-[44px] h-[44px]`**.
  - addButton 모바일 h 48 (line 277) = `h-12` (48px tailwind 기본 spacing 12) — 또는 `h-[48px]` arbitrary.
  - addButton 데스크톱 h 36 (line 277) = `h-9` (36px tailwind 기본).
  - adminBar button h 36 (line 225, 228, 230, 232) = `h-9` (36px tailwind 기본).
  - Spinner 28x28 (line 35) = `w-7 h-7` (28px tailwind 기본) 또는 `w-[28px] h-[28px]` arbitrary.
  - SKELETON_STYLE height 88 (line 27, 미사용) = `h-[88px]` arbitrary 필수 (tailwind `h-22` 없음).
  - 데스크톱 maxWidth 800 (line 336) = `max-w-[800px]` arbitrary 필수 (tailwind `max-w-200` 없음 — tailwind 기본 max-w-3xl 768px / max-w-4xl 896px 와 차이).
  - 인라인 padding 8/12/16/24/32 등은 `p-2` (8px) / `p-3` (12px) / `p-4` (16px) / `p-6` (24px) / `p-8` (32px). tailwind.config spacing override 실측 확인 후 적용.

### 룰 7 — feedback_text_caption_leading_none

- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 헤더 토글/배지/칩 작은 영역은 `leading-none` 명시.
- **Why**: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- **How to apply (20-legal-findings)**:
  - finding 상태 칩 fontSize 11 (padding `2px 8px`, h ≈ 18~22px) → `text-caption font-bold leading-none` (작은 컨테이너 시각 패딩 방지) — 11 → 12 격상 후 (OQ #3) leading-none
  - finding 메타 fontSize 11 (메타 텍스트) → `text-caption leading-none` (격상 후)
  - finding 수정/삭제 button fontSize 10 (padding `2px 4px`) → `text-caption leading-none` (10 → 12 격상 후)
  - adminBar button fontSize 12 (h 36) → `text-caption font-bold leading-none` (마지노선 = 격상 불요)
  - 빈 보조 fontSize 12 → `text-caption leading-none`
  - 메타 모든 10~12 fontSize → leading-none 필수 (작은 컨테이너 패턴)

### 룰 8 — feedback_tsx_wave_emoji_dot_gap

- **요약**: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- **Why**: sketch 의 `🎯` `⬇` 같은 이모지/특수문자 글리프가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 도 자동 적용 안 됨.
- **How to apply (20-legal-findings)**: **LegalFindingsPage 본문에 이모지 0건** — 19-legal LegalPage 의 '📷' 첨부 button 이모지는 FindingDetailPanel 안 (본 페이지 아님). 인라인 SVG ChevronLeft (모바일 back button) 는 Lucide `ChevronLeft size={20}` 교체 (OQ #5). Spinner div + @keyframes spin 도 Lucide `Loader2` (animate-spin) 교체. **메타 dot ' · ' (line 259)** = string literal dot, sketch 에 `<span>·</span>` 추가 markup 도입 시 W5 변환에 자동 적용 안 됨 — 메타 dot 은 string literal 그대로 보존 (변경 없음). 빈/오류 상태 아이콘 추가 (OQ #4 Lucide `ClipboardList`/`AlertCircle`) 시 점검 페이지 dot span 룰과 별개.

### 룰 9 — feedback_tsx_wave_stat_card_drift

- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- **How to apply (20-legal-findings)**: LegalFindingsPage 에 Stat Card (28px display 숫자) 없음 → §6.2 Stat Card Number Color 룰 미적용. **§6.3 카테고리 카드 룰 미적용** (LegalFindingsPage 는 점검 카테고리 카드 시스템 아님 — finding 카드 = 지적사항 단위). 단 sketch 새 패턴 (예: finding 상태 2분기 매트릭스 / adminBar admin/assistant 분기 매트릭스 / addButton 모바일/데스크톱 분기 매트릭스 / 빈/로딩/오류 매트릭스 / zipLoading 5단계 매트릭스 / 보고서 button reportFileKey 있음/없음 매트릭스 / headerTitle 동적 분기 4종 매트릭스) 은 W5 진입 시 verbatim 인용 필수. source LegalFindingsPage.tsx 의 인라인 rgba (`rgba(239,68,68,.15)` / `rgba(34,197,94,.13)` / `rgba(22,27,34,0.97)`) 가 sketch 의 새 토큰 패턴 (`bg-danger-bg text-danger`) 을 덮어쓰지 않도록 명시 필수. finding 칩 alpha 0.13/0.15 vs tokens.css safe-bg 0.16 미세 차이 — W5 LOCKED 시 시각 비교. **borderLeft 2px (19-legal 3px 와 다름)** 보존 명시 필수.

### 룰 10 — feedback_avoid_premature_confirmation

- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- **How to apply (20-legal-findings)**: 본 인덱스 작성 완료 후 "§7 OQ 5건 컨펌 부탁" 보고만. "wave 1 완벽 / W2 진입 가능" 같은 자신감 표현 금지. W2~W5 진입 시점도 사용자 컨펌 명시 받은 후에만. sketch 산출 후 "거의 일치 / 잘 됐다" 표현 금지. 특히 finding 색 시각 결과 (open 빨강 / resolved 녹색) + 사진 슬롯 매트릭스 + admin 도구 분기 시각 결과 + 모바일 고정 하단 CTA 영역 시각 결과는 사용자 판단 영역.

### 룰 11 — feedback_inspection_unresolved_color (★ 20-legal-findings 특화 — finding 상태 칩 + borderLeft status 토큰 일반화)

- **요약**: 미조치 색 = status-fire (주황). 메인 칩 fire / 상세 danger inconsistent. 사용자 인지 = 칩의 fire 색.
- **Why**: 점검 페이지에서 미조치 칩이 fire (주황) 으로 표시되어 사용자가 "위험 임계치 = 칩 색" 패턴 학습. 20-legal-findings 의 finding 상태 칩 + borderLeft 동일 패턴 — finding 2분기 (open/resolved) 색이 사용자 인지의 source of truth.
- **How to apply (20-legal-findings)**: **finding 상태 칩 + borderLeft 2분기 (open danger '미조치' / resolved safe '완료')** — 운영 의미 source of truth. 미조치 점검 fire 칩과 다른 색상 (LegalFindingsPage = danger 빨강) 이지만 "결과 = status 토큰" 룰 일반화. status- prefix 없음 룰과 같이 적용 → `border-l-2 border-{safe|danger}-bar` / `bg-{safe|danger}-bg text-{safe|danger}`. **2분기 + 2 라벨 1 byte 변경 금지** (OQ #2 LOCKED 후 W3 sketch + W4 sketch + TSX 변환 양쪽 동일 적용). 19-legal LegalPage 의 accentColor + ResultBadge 4분기 룰과 동일 패턴 (본 페이지는 2분기만, finding 단위). 28-splash + 17-annual-plan 의 비즈 anchor 1 byte 0 룰 일반화. **borderLeft 2px (19-legal LegalPage 3px 과 다름) — 본 페이지 2px 보존 필수**.

### 룰 12 — project_inspection_completion_rule (★ 20-legal-findings 특화 — role admin 도구 분기 + sortedFindings open-first source of truth 일반화)

- **요약**: 점검 완료 = normal | caution | (bad+resolved). isCpCompleted 가 source of truth. 새 화면/통계는 이 룰 강제.
- **Why**: 점검 완료 정의가 페이지별로 일관되지 않으면 사용자 인지/통계 모두 깨짐. isCpCompleted 헬퍼 = source of truth 룰의 일반화.
- **How to apply (20-legal-findings)**: **(1) adminBar 조건부 렌더 (line 208 `role === 'admin' && round`)** — admin 만 결과 select/저장/보고서 업로드/ZIP 일괄 다운로드 가능. assistant 는 adminBar 미렌더 (finding 등록/수정/삭제는 모든 사용자). UI/시안에서 권한 분기 변경 금지. (2) **sortedFindings open-first (line 198~203)** — status 'open' 먼저, 그 외 createdAt desc localeCompare. 운영 룰 source of truth — UI/시안에서 정렬 변경 금지. (3) **findingCard onClick navigate(`/legal/${id}/finding/${finding.id}`)** — 모든 사용자 자식 페이지 진입 가능 (line 240). 본 wave 범위는 LegalFindingsPage.tsx 만 (자식 페이지 별도 wave). (4) **handleZipDownload iOS PWA `<a download>` 패턴 + setTimeout(URL.revokeObjectURL, 3000)** — iOS 안정성 검증된 패턴, 1 byte 변경 금지. (5) **headerTitle 동적 분기 (line 120~122)** — round 있으면 '${종합정밀|작동기능} ${YYYY.MM.}' / 없으면 '지적사항 목록'. round.title.includes('종합정밀') 조건 보존 필수 — UI/시안에서 분기 변경 금지. 모두 점검 완료 isCpCompleted 룰의 일반화. W3 sketch + W4 sketch + W5 TSX 변환 양쪽 동일 적용.

---

# §6. negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **LegalFindingsPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/LegalFindingsPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src/pages/LegalFindingsPage.tsx` 결과 0 줄.
- **외부 컴포넌트/훅 수정 금지** — PhotoGrid.tsx / PhotoSourceModal.tsx / FindingFormSheet.tsx / useMultiPhotoUpload.ts / utils/findingDownload.ts / utils/api.ts (legalApi) / stores/authStore.ts / hooks/useIsDesktop.ts 모두 본 wave + W2~W5 미수정. 시그니처 + props 보존.
- **비즈 로직 시그니처 변경 금지** — useQuery 2종 (`['legal-round', id]` / `['legal-findings', id]`) / legalApi 4종 (get / getFindings / updateResult / deleteFinding) / headerTitle 동적 분기 (round.title.includes('종합정밀') ? '종합정밀' : '작동기능') / sortedFindings open-first / handleSaveResult + handleReportUpload + handleDeleteFinding + handleZipDownload + adminBar role 조건부 / findingCard onClick navigate / addButton 모바일/데스크톱 분기 / FindingFormSheet props (scheduleItemId/mode/finding?/onClose) / fmtDate + fmtMonthOnly / SKELETON_STYLE + Spinner / @keyframes blink (.6/.3) + spin / 인라인 SVG ChevronLeft (또는 Lucide 교체 OQ #5) 모두 import/export 동일하게 유지.
- **다른 페이지 (13-schedule / 14-reports / 27-login / 16-workshift / 15-daily-report / 17-annual-plan / 28-splash / 23-education / 19-legal / 02 / 06 등) 영향 금지** — `git status` 에 20-legal-findings/ + .planning/quick/260523-rgj-* 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler` (디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler`. `npm run deploy` 는 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 배포만.
- **13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education + 19-legal 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지** — 8 페이지 모두 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 20-legal-findings 도 동일 평면 배치 (`20-legal-findings/sketch-wave-N-{slug}.html`).
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` (line 71, `/legal/:id` 미등재 — 정규식 line 117 cover) + `DESKTOP_NO_NAV_PATHS` (line 74) + `DESKTOP_HEADER_HIDE_PATHS` (line 77) + `PAGE_TITLES` (line 79~104, `/legal/:id` 미등재) + 특수 regex (line 117 `!location.pathname.match(/^\/legal\/.+/)` — showNav=false) + `Route` (line 290) 모두 실측 확인됨. 본 wave + W2~W5 모두 `App.tsx` 손대지 않음.
- **부모 페이지 (LegalPage @ App.tsx line 289) + 자식 페이지 (LegalFindingDetailPage @ App.tsx line 291) 수정 금지** — 본 wave + W2~W5 범위 아님. findingCard 클릭 → navigate(`/legal/${id}/finding/${finding.id}`) 시 자식 페이지 진입은 별도 wave.
- **★ finding 상태 2분기 시그니처 변경 금지** — open → borderLeft 2px var(--danger) + 칩 bg rgba(239,68,68,.15) + var(--danger) + '미조치' (line 244, 255) / resolved → borderLeft 2px var(--safe) + 칩 bg rgba(34,197,94,.13) + var(--safe) + '완료'. 1 byte 변경 금지. **borderLeft 2px (19-legal LegalPage 3px 과 다름) 보존 필수**.
- **★ sortedFindings open-first 변경 금지** — line 198~203. status 'open' 먼저, 그 외 createdAt desc localeCompare.
- **★ adminBar 조건부 렌더 변경 금지** — `role === 'admin' && round` (line 208). admin 만 결과 select+저장+보고서+ZIP 다운로드 / assistant adminBar 미렌더. 운영 룰 source of truth, 1 byte 변경 금지.
- **★ headerTitle 동적 분기 변경 금지** — round 있으면 `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}` / 없으면 '지적사항 목록' (line 120~122). 비즈 분기 source of truth.
- **★ findingCard onClick navigate 변경 금지** — navigate(`/legal/${id}/finding/${finding.id}`) (line 240). 모든 사용자 자식 페이지 진입.
- **★ legalApi 4종 시그니처 변경 금지** — get(roundId) / getFindings(roundId) / updateResult(roundId, { result?, report_file_key? }) / deleteFinding(roundId, findingId) 모두 보존. 특히 snake_case payload (`result`, `report_file_key`) + camelCase props (`roundId`, `findingId`) 혼용 패턴 보존. 본 wave + W2~W5 모두 utils/api.ts 손대지 않음.
- **★ handleZipDownload iOS PWA `<a download>` 패턴 변경 금지** — createElement('a') + body.appendChild + click + removeChild + setTimeout(URL.revokeObjectURL, 3000). iOS PWA 안정성 검증된 패턴. 본 wave + W2~W5 변경 금지.
- **★ ZIP 파일명 + 폴더명 + 사진 파일명 패턴 변경 금지** — `지적사항_${round?.title ?? 'report'}.zip` (line 184, 19-legal LegalPage 의 location 기반과 다름 — round.title 사용) / `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')}` (폴더, line 149) / `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg` (line 161, 171). 본 wave + W2~W5 utils/findingDownload.ts + 본 페이지 미수정.
- **★ handleReportUpload FormData 패턴 + Bearer token + dynamic authStore import 변경 금지** — folder `legal/${id}/report` + dynamic import('../stores/authStore').useAuthStore.getState().token + Authorization Bearer header.
- **toast 카피 verbatim 8종 변경 금지** — success 4 ('점검 결과가 저장되었습니다.' / '보고서가 업로드되었습니다.' / '삭제되었습니다' / '다운로드 완료') + error 4 ('저장에 실패했습니다.' / '사진 업로드 실패' / err?.message ?? '삭제 실패' / '다운로드에 실패했습니다').
- **빈/오류 상태 카피 verbatim 변경 금지** — '지적사항 없음' / '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' (isDesktop 분기 보존) / '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (단일 문장).
- **adminBar 카피 verbatim 변경 금지** — select 옵션 '결과 미입력' / '적합' / '부적합' / '조건부적합' + 저장 '결과 저장' + 보고서 '보고서 보기' / '보고서 업로드' / '업로드 중...' + ZIP '일괄 다운로드' / '준비 중...' / '수집 중... (N/M)' / '압축 중...' (zipLoading 5 단계).
- **finding 카피 verbatim 변경 금지** — 상태 칩 '미조치' / '완료' + 액션 '수정' / '삭제' + 위치 fallback '위치 미지정' + 메타 패턴 `${fmtDate(createdAt)} · ${createdByName ?? createdBy}` (' · ' dot 보존).
- **addButton 카피 '+ 지적사항 등록' (line 289) verbatim 변경 금지**.
- **데스크톱 maxWidth 800 변경 금지** — 의도된 디자인 (단일 컬럼 중앙 정렬 — 19-legal 의 3분할과 다른 의도된 패턴). "맥스 1200 으로 좀 늘려" 변경 금지.
- **모바일 고정 하단 CTA 패턴 보존** — position fixed bottom 0 left 0 right 0 padding '12px 16px' paddingBottom 'calc(12px + var(--sab, 0px))' zIndex 20 + addButton (모바일 width 100% h 48). 콘텐츠 영역 paddingBottom 'calc(72px + var(--sab, 0px))' 회피 패턴.
- **@keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (line 295) + @keyframes spin `to{transform:rotate(360deg)}` (line 36 Spinner 함수 내부) 보존** — Education 의 1/0.4 와 다름. 변경 시 SKELETON 깜빡임 + spinner 회전 깨짐.
- **모바일 헤더 자체 렌더 보존 (line 298~308)** — height 48 + back button 36x36 position absolute left 12 + headerTitle 정중앙 + bg `rgba(22,27,34,0.97)` (raised 변형 alpha). **OQ #5 LOCKED 시 back button 44x44 격상 + Lucide ChevronLeft 교체** — 그 외 변경 금지. 데스크톱은 자체 타이틀 영역 (padding '24px 32px 12px') 만, 글로벌 AppHeader 도 line 117 정규식으로 숨김.
- **FindingFormSheet props 보존** — scheduleItemId + mode 'create'|'edit' + finding? + onClose. 본 wave + W2~W5 미수정. props 호출 양식 (onClose setShowSheet(false) / setEditingFinding(null)) 보존.

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 5건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call). 단, "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

- **OQ #1**: 모바일 자체 헤더 배경 `rgba(22,27,34,0.97)` (raised 변형 alpha, line 300) → chrome 룰 §2.1 `bg-surface-page` 통일 vs raised 유지 (alpha 0.97 vs full opacity)?
  - **default 답: raised 유지 + alpha 0.97 보존** (19-legal W1 OQ #1 LOCKED + 16-workshift + 17-annual-plan + 02 InspectionPage + 28-splash + 23-education 6 페이지 일관 패턴). 모바일 헤더 = `bg-surface-raised/97` arbitrary (또는 인라인 유지). 데스크톱 자체 타이틀 영역은 별도 배경 없음 (외곽 var(--bg) 그대로). 본 OQ 적용 시 W2 sketch + TSX 변환 양쪽 동일 적용.

- **OQ #2**: finding 상태 2분기 (open/resolved) 색 — 현재 rgba 인라인 + var() (`rgba(239,68,68,.15)` open / `rgba(34,197,94,.13)` resolved + var(--danger/safe)). status 토큰 매핑 (`border-l-2 border-{safe|danger}-bar` + `bg-{safe|danger}-bg` + `text-{safe|danger}`) 치환?
  - **default 답: 토큰 치환 OK** — status- prefix 없음 룰 (memory `feedback_tailwind_token_class_pattern`). 19-legal W1 OQ #2 + 23-education W1 OQ #2 + 17-annual-plan W1 OQ #2 + 28-splash W1 OQ #4 토큰 치환 default OK 일관. **finding 2분기 + 2 라벨 + borderLeft 2px (19-legal 3px 과 다름) 모두 1 byte 변경 금지** (룰 11 + §6 negative rule). W3 sketch + W4 sketch + TSX 변환 양쪽 동일 적용. 토큰 치환 후 시각 결과 비교 — 칩 alpha 0.13/0.15 vs tokens.css `--status-safe-bg: rgba(34, 197, 94, 0.16)` alpha 0.16 미세 차이 (0.03 차이) → 시각 차이 발생 가능 — 사용자 컨펌 후 인라인 유지 또는 토큰 alpha 조정.

- **OQ #3**: §1.1 fontSize 9·10·11 위반 격상 — LegalFindingsPage 의 10 (수정/삭제 button) + 11 (finding 칩 / 메타) 모두 §1.1 마지노선 위반. **모두 12 격상 vs 인라인 유지**?
  - **default 답: 격상 OK** (§1.1 노안 친화 룰 우선). 11 → text-caption(12) / 10 → text-caption(12). 격상 후 leading-none 명시 (memory `feedback_text_caption_leading_none`). 단 시각 균형 (배지/칩이 너무 커짐) 우려 시 사용자 컨펌으로 일부 인라인 유지 (예: finding 칩 11 유지 / 수정/삭제 button 만 11 → 12 격상). 격상 시 padding 조정 (칩 padding 2px 8px → 3px 10px) 동시 검토. 19-legal + 23-education + 16-workshift + 17-annual-plan W1 OQ 비슷한 패턴 (text-body-sm 14 → text-body 16 격상 default) 일관.

- **OQ #4**: 메인 CTA (addButton line 272~291, 모바일 width 100% h 48 / 데스크톱 width auto h 36) 현재 solid `var(--acl)` → design-system §6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 통일 vs solid 유지? **+ 빈/오류 상태 아이콘 추가** (Lucide `ClipboardList` 빈 / `AlertCircle` 오류) vs 무 유지? **+ SKELETON_STYLE 활용 (현재 미사용)** — isLoading 시 Spinner 대신 SKELETON 카드 3개 렌더 vs Spinner 유지?
  - **default 답 (CTA)**: **그라데이션 OK** (design-system §6.4 CTA 룰 + 19-legal / 14-reports / 16-workshift / 17-annual-plan / 23-education W1 OQ 그라데이션 default 일관). 그라데이션 색은 §6.4 룰 (#1d4ed8, #0ea5e9) 우선. 메인 CTA 한정 (addButton — 모바일/데스크톱 양쪽) — adminBar 작은 도구 button (저장/보고서/ZIP h 36) 은 **solid 유지** (작은 도구 그라데이션 = 시각 잡음). disabled 시 = `bg-surface-sunken text-text-tertiary cursor-not-allowed` (현재 opacity 0.6 + cursor not-allowed 일관). 사용자 컨펌 결과에 따라 그라데이션 vs solid 둘 중 LOCKED. 28-splash W1 OQ #1 LOCKED 는 정반대 (solid) — 20-legal-findings 는 §6.4 CTA 룰 우선.
  - **default 답 (아이콘)**: **아이콘 무 유지** (현재 카피만 — 19-legal + 17-annual-plan + 16-workshift + 28-splash + 23-education W1 빈/오류 상태 아이콘 무 일관). 단 시각 일관성 강화 옵션으로 빈 상태에 Lucide `ClipboardList size={48} color="var(--t3)"` (점검 의미) + 오류에 Lucide `AlertCircle size={48} color="var(--danger)"` 추가 가능 — **사용자 컨펌으로 채택 가능**.
  - **default 답 (SKELETON)**: **Spinner 유지** (현 디자인 보존 — SKELETON_STYLE 객체 정의는 있으나 JSX 미사용, 사실상 dead code). 단 isLoading 시각 일관성 강화 옵션으로 SKELETON 카드 3개 (height 88) 렌더 + Spinner 폐기 가능 — **사용자 컨펌으로 채택 가능** (23-education 패턴 mirror).

- **OQ #5**: 아이콘 Lucide 교체 + 모바일 back button 44x44 격상 — (1) 모바일 헤더 back button 인라인 SVG ChevronLeft (line 304, path "M15 19l-7-7 7-7" strokeWidth 2 size 20) → Lucide `ChevronLeft size={20}` 교체? + back button **36x36 → 44x44 격상** (§1.1 터치 마지노선 44px 일치)? (2) Spinner 함수 (line 32~39, 인라인 div + @keyframes spin) → Lucide `Loader2 size={24} className="animate-spin"` 교체?
  - **default 답: (1) 교체 + 44x44 격상 OK** (§7.4 "뒤로가기: ChevronLeft" + §1.1 터치 44px + 19-legal / 16-workshift / 17-annual-plan / 28-splash / 23-education W1 OQ Lucide ChevronLeft 교체 LOCKED 일관). back button position absolute left 12 → left 8 또는 left 12 유지 (44 - 36 = 8px 추가 영역, 정중앙 타이틀 영향 없음). **(2) 교체 OK** (Lucide `Loader2` + `animate-spin` className — 인라인 div + @keyframes spin 폐기, Spinner 함수 line 32~39 폐기 + 인라인 keyframe 정의 폐기). size={24} 유지 (§7.1 16/20/24 3 종 중 24 일치). 모두 lucide-react import 추가. W2 모바일 chrome sketch + W2 빈/로딩/오류 sketch + W5 TSX 변환 양쪽 동일 적용. (주의: 19-legal LegalPage 의 첨부 button '📷' 이모지 → Lucide Camera 교체 OQ 는 본 페이지에 없음 — 본 페이지는 이모지 0건).

각 OQ 의 default 답은 사용자가 별 의견 없으면 이 답으로 진행할 것이라는 reasonable call. 단, "approved" 받기 전까지 W2 진입 금지.

---

## 자체 verify (작성 완료 후 본 인덱스가 통과해야 할 gate)

본 문서가 후속 wave 진입 자격을 갖췄는지 verify:

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. 7 헤더 존재 | `grep -c '^# §[1-7]' wave-1-index.md` | =7 |
| 2. sub-wave 분배 표 ≥4 | `grep -E '^\| W[2-5] \|' wave-1-index.md \| wc -l` | =4 |
| 3. 메모리 룰 unique ≥10 | `grep -oE 'feedback_[a-z_]+' wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 4. negative §6 안 wrangler + npm run deploy | `grep -c 'wrangler' wave-1-index.md` ≥1 & `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 |
| 5. src/** 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src/pages/LegalFindingsPage.tsx` | 0 lines |
| 6. OQ §7 ≥5 | `grep -cE 'OQ #[1-5]' wave-1-index.md` | ≥5 |
| 7. design-system fence ≥6 (open+close ≥12) | `grep -c '^```' wave-1-index.md` | ≥12 |
| 8. legalApi 4-method anchor ≥4 | `grep -cE 'legalApi\.(get\|getFindings\|updateResult\|deleteFinding)' wave-1-index.md` | ≥4 |

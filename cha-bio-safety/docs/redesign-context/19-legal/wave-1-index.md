---
title: "redesign/19-legal — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-22
quick_id: 260522-sa7
branch: redesign/19-legal
source_tsx: cha-bio-safety/src/pages/LegalPage.tsx
source_tsx_lines: 571
design_system: cha-bio-safety/docs/redesign-context/19-legal/design-system.md (v0.1.1, c8bfa86)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (소방 점검 관리 = 점검 시리즈 직접 적용 케이스 — 각 룰 1줄 메타로 적용/미적용 판정. 02 InspectionPage 와 동일 도메인.)
mirror_of: cha-bio-safety/docs/redesign-context/23-education/wave-1-index.md (260522-gmp) + cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md (260522-209) + cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md (260521-wmq) + cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (260521-sjj) + cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (260521-c6p) — 7 섹션 + 4 sub-wave 구조 mirror
biz_anchor_precedent: cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md (260522-209) — 비즈 anchor 16건 1 byte 변경 0 패턴 일반화 (15-daily-report SW3 portraitPos precedent → 28-splash 16건 → 23-education D-day 임계치 + role 그룹핑 + useMutation 3종 → 19-legal accentColor + ResultBadge 4분기 + filterRounds + sorted open-first + role admin 도구 분기 + legalApi 7종 + useMultiPhotoUpload 5장 + buildMetaTxt + ZIP 패턴)
sub_wave_count: 4 (W2~W5)
memory_rules_inline: 12 (10 기본 + feedback_inspection_unresolved_color accentColor + ResultBadge + finding 칩 결과 status 토큰 매핑 일반화 + project_inspection_completion_rule role admin 도구 분기 + filterRounds + sorted open-first source of truth 일반화)
open_questions: 5
key_files_inventory:
  - cha-bio-safety/src/pages/LegalPage.tsx (571 lines)
  - cha-bio-safety/src/utils/api.ts (legalApi 7종)
  - cha-bio-safety/src/hooks/useMultiPhotoUpload.ts (조치 사진 5장)
  - cha-bio-safety/src/utils/findingDownload.ts (buildMetaTxt ZIP 내용)
  - cha-bio-safety/src/components/PhotoGrid.tsx (지적/조치 사진)
  - cha-bio-safety/src/components/PhotoSourceModal.tsx (카메라/앨범)
  - cha-bio-safety/src/components/FindingFormSheet.tsx (수정 모달)
  - cha-bio-safety/src/stores/authStore.ts (role admin/assistant)
  - cha-bio-safety/src/hooks/useIsDesktop.ts (≥768px 분기)
  - cha-bio-safety/src/App.tsx (chrome 실측: line 35, 71, 74, 77, 98, 117, 289, 290, 291)
---

# redesign/19-legal — sketch wave 1 (index)

본 문서는 W2~W5 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:

- LegalPage.tsx (571 라인 — 단일 파일에 모바일 + 데스크톱 분기 + 3개 내부 컴포넌트 FindingsPanel / FindingDetailPanel / 메인 LegalPage 통합 + 데스크톱 3분할(좌 라운드 500 + 중 지적사항 500 + 우 상세 flex 1) + 모바일은 단일 컬럼 + /legal/:id sub-route 위임) 의 element 인벤토리 → 4 sub-wave 분배 + **비즈 시그니처 anchor** 보존 (useQuery 4종 ['legal-rounds', year] / ['legal-round', roundId] / ['legal-findings', roundId] / ['legal-finding', roundId, findingId] + useMutation resolveMutation + legalApi 7종 list/get/getFindings/updateResult/deleteFinding/getFinding/resolveFinding + accentColor 4분기 + ResultBadge map 4 라벨 + filterRounds 3분기 + TABS key/label mismatch + sorted open-first + handleRoundClick isDesktop 분기 + useMultiPhotoUpload 5장 + buildMetaTxt + fflate ZIP + fmtDate + fmtDateTime + KVRow + SKELETON + @keyframes blink (.6/.3) + spin + toast 카피 11종 + 빈/오류 카피 다수 + IconChevronLeft inline SVG + 첨부 button '📷' 이모지)
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6.4 / §6.6 / §7 / §7.1 의 verbatim 룰 박제 (§6/§7 미적용 부분은 1줄 메타 동반)
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 19-legal 적용 여부 (LegalPage = **소방 점검 관리 = 점검 시리즈 직접 적용 케이스**. 02 InspectionPage 와 동일 도메인. 23-education 보수교육과 다름. App.tsx 실측 박제 — `/legal` ∈ `MOBILE_NO_NAV_PATHS` (line 71) + `PAGE_TITLES` (line 98 '소방 점검 관리') / `DESKTOP_NO_NAV_PATHS` (line 74) 미등재 / `DESKTOP_HEADER_HIDE_PATHS` (line 77) 미등재 → 데스크톱 글로벌 AppHeader 표시 / Route line 289 + sub-route Route line 290/291 (본 wave 범위 아님) + 특수 regex line 117 `!location.pathname.match(/^\/legal\/.+/)`.)
- 메모리 룰 12건 (`feedback_*.md` 10 + `feedback_inspection_unresolved_color` accentColor + ResultBadge + finding 칩 status 토큰 매핑 일반화 + `project_inspection_completion_rule` role admin 도구 분기 + filterRounds + sorted open-first source of truth 일반화) inline 인용 — 19-legal 특화 룰 2건 (결과 4분기 + finding 2분기 status 토큰 + role admin 도구 권한 분기 운영 룰 보존) 포함
- §6 negative rule (이 wave 에서 금지된 것) — sketch HTML 금지 / LegalPage.tsx 코드 변경 금지 / 외부 컴포넌트 6 파일 (PhotoGrid / PhotoSourceModal / FindingFormSheet / useMultiPhotoUpload / findingDownload / api) 미수정 / wrangler + npm run deploy 금지 / App.tsx 미수정 / sub-route 페이지 미수정 / accentColor + ResultBadge + finding 칩 + filterRounds + sorted + role admin + TABS mismatch + handleRoundClick + legalApi + useMultiPhotoUpload + buildMetaTxt + ZIP 패턴 + toast 11종 + 빈/오류 카피 + KVRow 라벨 + @keyframes + 모바일 헤더 보존 + 데스크톱 3분할 500/500/flex 1 보존
- §7 open questions 5건 — W2 진입 직전 사용자 컨펌 (모바일 헤더 raised alpha 0.97 유지 / accentColor + ResultBadge status 토큰 치환 / §1.1 9·10·11 fontSize 12 격상 / 메인 CTA 그라데이션 + 빈/오류 아이콘 / Lucide back+Camera+Loader2 교체 + back 44x44 격상)

작성일: 2026-05-22 / Quick ID: 260522-sa7 / Branch: redesign/19-legal

> 23-education W1 (260522-gmp) + 28-splash W1 (260522-209) + 17-annual-plan W1 (260521-wmq) + 16-workshift W1 (260521-sjj) + 27-login W1 (260521-c6p) 의 7 섹션 + 4 sub-wave 구조를 정확히 mirror. LegalPage 가 571 lines 단일 파일 + 3개 내부 컴포넌트 (FindingsPanel / FindingDetailPanel / 메인 LegalPage) 통합 + 데스크톱 3분할 (좌 500 + 중 500 + 우 flex 1 마스터-디테일-디테일) + 모바일은 단일 컬럼 + /legal/:id sub-route 위임 — 4 sub-wave (W2~W5) 채택. 라운드 카드는 W3 단독 wave, FindingsPanel + FindingDetailPanel 은 W4 통합 wave (조치 입력 + 사진 5장 + admin 다운로드 + admin 도구 포함). 23-education 과 차이: LegalPage 는 점검 시리즈 = chrome 룰 직접 적용 케이스 + 모바일은 sub-route 네비게이션 (Education 의 바텀시트와 다름). 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education 모두 평면(flat sibling) 패턴 — `19-legal/sketch-wave-N-{slug}.html` 직접 배치, `sketch/` 서브폴더 없음. 본 인덱스도 `19-legal/wave-1-index.md` (flat) 으로 위치한다.

---

# §1. LegalPage.tsx 인벤토리

본 인벤토리는 LegalPage.tsx (571 lines, 실측) 의 element 를 (1) 상단 유틸 / 상수 / 포맷터 / 스켈레톤 / 탭 / KVRow / (2) FindingsPanel (데스크톱 중앙 패널) / (3) FindingDetailPanel (데스크톱 우측 패널) / (4) 메인 LegalPage 4 영역으로 나눠 정리한다. line 범위는 **실측 결과** (Read 도구 + grep 검증, drift 없음).

**LegalPage 의 구조 특이성** (인벤토리 머리말):

- **모바일/데스크톱 분기 via `useIsDesktop()`** (line 6 import / line 374 호출, ≥768px) — 571 lines 단일 파일 내부에 if(isDesktop) 분기 2덩어리 (line 464~500 데스크톱 3분할 / line 503~570 모바일).
- **단일 파일 571 lines + 3개 내부 컴포넌트 통합** — 23-education EducationPage (591 lines) 와 유사한 통합 규모 / 17-annual-plan AnnualPlanPage (225 lines) 보다 약 2.5배. **3개 내부 컴포넌트** (FindingsPanel 데스크톱 중앙 / FindingDetailPanel 데스크톱 우측 / 메인 LegalPage) — Education 의 4개와 다른 구성 (Education 은 EditPanel + BottomSheet 공용, Legal 은 모바일 sub-route 위임이라 BottomSheet 없음).
- **결과 4분기 (pass/fail/conditional/null) 색 분기** (line 27~32 accentColor / 35~47 ResultBadge) — pass safe / fail danger / conditional warning / null var(--bd2) (미입력). 라운드 카드 좌측 3px 색바 + 우측 결과 배지 동시 적용. status 토큰 매핑 룰 = W3 sketch 핵심 (memory `feedback_tailwind_token_class_pattern` status- prefix 없음 룰 + memory `feedback_inspection_unresolved_color` 결과 status 토큰 일반화). 라벨 verbatim '적합' / '부적합' / '조건부적합' / '결과 미입력' 1 byte 변경 금지.
- **탭 + URL persist** (line 376~377 useSearchParams) — TabKey '전체' | '미조치' | '완료' 3분기 + **라벨 mismatch (`'미조치'` key 가 라벨 `'진행 중'` — 의도된 디자인, 변경 금지)**. filterRounds 분기 룰 — 미조치 = findingCount > resolvedCount / 완료 = findingCount > 0 && === / 전체 = 그대로. 운영 룰 source of truth (memory `project_inspection_completion_rule` 일반화).
- **role admin/assistant 권한 도구 분기** (line 162 FindingsPanel `role === 'admin'` → select+저장+보고서 / line 299 FindingDetailPanel `staff?.role === 'admin'` → 다운로드) — admin 만 결과 입력 + 보고서 업로드 + ZIP 다운로드 가능. assistant 는 조치 입력 + 사진 + 완료 (조치 자체는 권한 분기 없음). 비즈 보존 룰 = W4 sketch 보존 필수 (memory `project_inspection_completion_rule` 일반화 룰).
- **데스크톱은 글로벌 AppHeader 사용** (App.tsx line 98 PAGE_TITLES `/legal: '소방 점검 관리'` 등재 + line 77 DESKTOP_HEADER_HIDE_PATHS **미등재**) — Education 과 동일 패턴 (글로벌 AppHeader 데스크톱 표시) / 16-workshift 와 다름. 데스크톱 3분할은 자체 헤더 없음. line 469 코멘트 "페이지 제목은 App.tsx 헤더에서 표시" 보존.
- **모바일은 자체 헤더 렌더** (line 507~515) — height 48 / bg `rgba(22,27,34,0.97)` (raised 변형 alpha) / borderBottom 1px / back button **36x36 (position absolute left 12)** — Education 의 44x44 와 다름. 디자인 §1.1 터치 마지노선 44px 미달 — OQ #5 검토 후보 (Lucide 교체 + 사이즈 44x44 격상). 타이틀 '소방 점검 관리' 16/700 정중앙 (relative + absolute back button 패턴).
- **모바일 카드 클릭 → /legal/:id sub-route 네비게이션** (line 399 `navigate(\`/legal/${round.id}\`)`) — Education 의 바텀시트와 다름. App.tsx line 290 `/legal/:id` LegalFindingsPage + line 291 `/legal/:id/finding/:fid` LegalFindingDetailPage 가 별도 라우트로 등록되어 있음. **본 wave 의 범위는 LegalPage.tsx (라운드 목록 + 데스크톱 3분할) 만** — sub-route 페이지는 별도 wave.
- **App.tsx line 117 특수 regex** — `!location.pathname.match(/^\/legal\/.+/)` — `/legal` 본 페이지에만 적용되는 특수 navigation guard (sub-route /legal/:id 는 별도 처리). 본 wave + W2~W5 모두 App.tsx 미수정 (§6 negative rule).
- **조치 사진 5장 제한** (line 238 useMultiPhotoUpload) — useMultiPhotoUpload hook 의 canAdd = slots.length < 5 시그니처. PhotoSourceModal (카메라/앨범) + 슬롯 매핑 (line 332~342) + 첨부 button (line 338~341, **`'📷'` 이모지 사용 사고 케이스** — memory `feedback_tsx_wave_emoji_dot_gap` Lucide Camera 교체 후보).
- **ZIP 다운로드 (admin 전용)** (line 267~287) — fflate `zipSync` 동적 import + buildMetaTxt → 내용.txt + photoKeys '지적사진-{N}.jpg' + resolutionPhotoKeys '조치사진-{N}.jpg' + 파일명 `지적사항_{location 안전화}.zip`. 보존 룰: 비즈 anchor 1 byte 변경 금지.
- **인라인 keyframes 2종** — `blink { 0%,100%{opacity:.6} 50%{opacity:.3} }` (line 467, 505) **Education 의 opacity 1/0.4 와 다름 — opacity .6/.3** + `spin { to{transform:rotate(360deg)} }` (line 291 FindingDetailPanel 로딩 spinner) — 1 byte 변경 금지.
- **빈 상태 메시지 verbatim** (line 548~549): '소방 점검 관리 이력 없음' (16/700 var(--t1)) + '소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.' (12 var(--t2)) — Education 14 var(--t3) 와 다름 (12 var(--t2)).
- **오류 상태 verbatim** (line 542): '목록을 불러오지 못했습니다.' (모바일 14 var(--t2)) + '불러오기 실패' (데스크톱 좌측 13 var(--t2) line 431) + toast.error 5종 + 데스크톱 fallback 3종 + finding 빈 1종 + finding 상세 빈 1종.
- **권한 분기 카드 cursor** — Education 과 달리 LegalPage 의 라운드 카드는 모두 cursor pointer (모바일 = 모든 사용자 sub-route 진입 가능 / 데스크톱 = 모든 사용자 클릭 시 select). 권한 분기는 도구 (admin 만 select/저장/보고서/다운로드) 에만 적용.

## §1.1 영역별 인벤토리 표

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | imports (useState/useRef / useNavigate+useSearchParams / useQuery+useMutation+useQueryClient / toast / legalApi / useIsDesktop / useAuthStore / useMultiPhotoUpload / PhotoGrid / PhotoSourceModal / FindingFormSheet / buildMetaTxt / type { LegalRound, LegalInspectionResult, LegalFinding }) | 1~13 | 정적 import 묶음 | legalApi (7종) + useMultiPhotoUpload + buildMetaTxt + PhotoGrid + PhotoSourceModal + FindingFormSheet — 본 wave + W2~W5 시그니처 변경 금지 | 무관 (보존만) |
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | fmtDate(iso: string) → `${y}.${m}.${d}` zero-padded | 16~19 | 날짜 포매터 | 라운드 카드 메타 / FindingsPanel 헤더 / finding 카드 메타 호출 (line 158, 204, 455, 564) | W2 + W3 + W4 |
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | fmtDateTime(iso: string \| null) → null '-' / `${y}.${m}.${d} ${HH}:${mm}` | 20~24 | 날짜+시간 포매터 | FindingDetailPanel 등록일 / 조치일시 KVRow 호출 (line 310, 356) | W4 |
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | accentColor(result: LegalInspectionResult \| null): string — pass `'var(--safe)'` / fail `'var(--danger)'` / conditional `'var(--warn)'` / 그 외 `'var(--bd2)'` | 27~32 | **핵심 비즈** 라운드 카드 좌측 3px 색바 색 매핑 | 데스크톱 카드 line 445 + 모바일 카드 line 555 borderLeft 호출 — **4분기 1 byte 변경 금지** (memory `feedback_inspection_unresolved_color` 일반화) | W3 (라운드 카드 색바 4 매트릭스) |
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | ResultBadge({ result }) — map: pass `{bg:'rgba(34,197,94,.13)', color:'var(--safe)', label:'적합'}` / fail `{bg:'rgba(239,68,68,.15)', color:'var(--danger)', label:'부적합'}` / conditional `{bg:'rgba(245,158,11,.15)', color:'var(--warn)', label:'조건부적합'}` / null → label '결과 미입력' var(--t3). 외곽 fontSize 11/700 borderRadius 6 padding '2px 8px' flexShrink 0 | 35~47 | **핵심 비즈** 결과 배지 — map 4 라벨 + 외곽 토큰 | 라운드 카드 우상단 호출 (line 452, 561) — **4 라벨 + rgba + var() 1 byte 변경 금지** | W3 (ResultBadge 4 라벨 매트릭스) |
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | SKELETON: React.CSSProperties — bg var(--bg3) / borderRadius 12 / **height 72** / animation `blink 2s ease-in-out infinite` | 50 | 로딩 스켈레톤 box 1개 (FindingsPanel) / 3개 (라운드 카드 좌측 + 모바일) | line 182 FindingsPanel + line 428 데스크톱 좌측 3개 + line 539 모바일 3개 — **height 72 (Education 88 과 다름) 1 byte 변경 금지** | W2 (로딩 상태) |
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | TabKey type — `'전체' \| '미조치' \| '완료'` | 53 | 탭 키 union 타입 | filterRounds + searchParams 'tab' query | W3 |
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | TABS — `[{ key:'전체', label:'전체' }, { key:'미조치', label:'진행 중' }, { key:'완료', label:'완료' }]` | 54~58 | **key/label mismatch 의도된 디자인** — '미조치' key 가 라벨 '진행 중' | 탭 매핑 호출 (line 409, 520) — **mismatch 변경 금지** (key 변경 시 filterRounds 깨짐 + 라벨 변경 시 사용자 인지 깨짐) | W3 (탭) |
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | filterRounds(rounds, tab) — 미조치 `findingCount > resolvedCount` / 완료 `findingCount > 0 && findingCount === resolvedCount` / 전체 그대로 | 59~63 | **운영 룰** 탭 분기 source of truth | filtered 변수 호출 (line 391) — **3분기 변경 금지** (memory `project_inspection_completion_rule` 일반화) | W3 (탭) |
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | genYears() — 2024 ~ 현재년도 오름차순 (역순 아님) | 64~67 | 연도 select 옵션 | years 변수 호출 (line 380) → 옵션 매핑 `${y}년` | W3 (연도 select) |
| 1. 상단 유틸/포맷터/스켈레톤/탭/KVRow | KVRow({ label, children }) — flex gap 12 align-start, 라벨 12 var(--t3) width 64 flexShrink 0 / children 14 var(--t1) flex 1 lineHeight 1.5 | 70~77 | **공용 컴포넌트** key-value row | FindingDetailPanel 7회 호출 (지적 정보 4 + 조치 결과 3, line 308~311, 356~358) | W4 |
| 2. FindingsPanel (데스크톱 중앙) | props `{ roundId: string, onSelectFinding: (fid: string) => void, selectedFindingId: string \| null }` | 82~86 | 데스크톱 중앙 패널 props | 메인 LegalPage 데스크톱 분기 line 477~481 호출 | W4 |
| 2. FindingsPanel | useQueryClient + useAuthStore({ staff }) + role = staff?.role | 87~89 | 권한 분기 source | role admin 도구 (line 162) | W4 |
| 2. FindingsPanel | state — selectedResult ('') / savingResult / uploadingReport / editingFinding (LegalFinding \| null) / reportInputRef (HTMLInputElement) | 90~94 | 폼/도구 상태 | admin 도구 + 수정 모달 진입 | W4 |
| 2. FindingsPanel | useQuery × 2 — `['legal-round', roundId]` legalApi.get(roundId) enabled !!roundId + `['legal-findings', roundId]` legalApi.getFindings(roundId) enabled !!roundId staleTime 30_000 | 96~106 | **핵심 비즈** 라운드 + findings fetch | invalidateQueries 모든 mutation onSuccess 마다 정확한 키 invalidate 필수 — **변경 금지** | W4 |
| 2. FindingsPanel | effectiveResult = selectedResult \|\| (round?.result ?? '') | 108 | 결과 select 표시값 (선택 우선, 없으면 round 기본) | admin select effective value | W4 |
| 2. FindingsPanel | handleSaveResult — legalApi.updateResult(roundId, { result: effectiveResult \|\| undefined }) → invalidate ['legal-round', roundId] + ['legal-rounds'] + toast.success '점검 결과 저장' / catch toast.error '저장 실패' | 110~119 | admin 결과 저장 핸들러 | legalApi.updateResult + queryClient + toast.success/error 카피 — **변경 금지** | W4 |
| 2. FindingsPanel | handleReportUpload — FormData multipart `/api/uploads` → key 받아서 legalApi.updateResult(roundId, { report_file_key: key }) → invalidate + toast.success '보고서 업로드 완료' / catch toast.error '업로드 실패' | 121~135 | admin 보고서 업로드 핸들러 | FormData + Bearer token + legalApi.updateResult(snake_case report_file_key) — **변경 금지** | W4 |
| 2. FindingsPanel | handleDelete — legalApi.deleteFinding(roundId, finding.id) → invalidate ['legal-findings', roundId] + ['legal-rounds'] + ['legal-round', roundId] + toast.success '삭제됨' / catch toast.error err?.message ?? '삭제 실패' | 137~145 | finding 삭제 핸들러 | legalApi.deleteFinding + toast.error fallback 패턴 — **변경 금지** | W4 |
| 2. FindingsPanel | sorted — `[...(findings ?? [])].sort((a, b) => a.status === 'open' && b.status !== 'open' ? -1 : (a.status !== 'open' && b.status === 'open' ? 1 : b.createdAt.localeCompare(a.createdAt)))` | 147~151 | **운영 룰** open-first + createdAt desc | finding 매핑 (line 186) — **정렬 룰 source of truth, 1 byte 변경 금지** (memory `project_inspection_completion_rule` 일반화) | W4 |
| 2. FindingsPanel | 헤더 — padding '16px 16px 8px' — round?.title ?? '지적사항 목록' 15/700 var(--t1) + round 있으면 fmtDate(round.date) + (endDate ? ' ~ ' + fmtDate(endDate) : '') 12 var(--t2) | 156~159 | 패널 헤더 (round 정보) | round?.title verbatim fallback '지적사항 목록' | W4 |
| 2. FindingsPanel | **관리자 도구** — `role === 'admin' && round` 분기. padding '0 16px 8px' flex gap 6 flex-wrap. (1) select effectiveResult 옵션 4종 '미입력'/'적합'/'부적합'/'조건부적합' bg var(--bg3) border 1px solid var(--bd2) borderRadius 6 padding '4px 8px' var(--t1) 12 appearance none / (2) 저장 button 11/700 h 28 bg var(--acl) borderRadius 6 padding '0 10px' #fff opacity savingResult ? 0.6 : 1 / (3) 파일 input hidden accept 'application/pdf' / (4) 보고서 button — reportFileKey 있으면 '보고서' (외부창 `/api/uploads/${key}` _blank) / 없으면 '보고서 업로드' (uploadingReport 시 '...') 11/700 h 28 bg var(--bg3) border 1px solid var(--bd2) padding '0 10px' | 162~178 | **admin 권한 도구** 결과 입력 + 보고서 업로드 + 보고서 열기 | role !== 'admin' 면 도구 모두 숨김. assistant 권한 분기 보존 — **변경 금지** (memory `project_inspection_completion_rule` 일반화) | W4 (admin/assistant 매트릭스) |
| 2. FindingsPanel | 목록 — flex 1 overflowY auto padding '0 16px 16px' flex column gap 6. (1) isLoading SKELETON 1개 / (2) 빈 '지적사항 없음' var(--t3) 13 flex center / (3) sorted findings 매핑 | 181~215 | 목록 + 빈/로딩 분기 | sorted (open-first) + finding 카드 시각 분기 | W4 (목록 + 빈/로딩) |
| 2. FindingsPanel | finding 카드 — bg var(--bg3) / border `selectedFindingId === id ? '1.5px solid var(--acl)' : '1px solid var(--bd)'` / **borderLeft: `3px solid ${status === 'open' ? 'var(--danger)' : 'var(--safe)'}`** / borderRadius 10 padding 10 cursor pointer flex column gap 2 | 187~196 | finding 카드 외곽 + 선택 + status 색바 | onClick onSelectFinding(f.id) + status 분기 (open danger / resolved safe) — **변경 금지** | W4 |
| 2. FindingsPanel | 카드 상단 — description 13/500 var(--t1) flex 1 ellipsis + 상태 칩 (open bg rgba(239,68,68,.15) color var(--danger) '미조치' / resolved bg rgba(34,197,94,.13) color var(--safe) '완료') 10/700 borderRadius 5 padding '1px 6px' flexShrink 0 | 198~201 | description + 상태 칩 | finding.status open/resolved 2분기 verbatim — **변경 금지** | W4 |
| 2. FindingsPanel | 카드 위치 — location ?? '위치 미지정' 11 var(--t2) | 202 | location fallback | '위치 미지정' verbatim — **변경 금지** | W4 |
| 2. FindingsPanel | 카드 메타 — fmtDate(createdAt) 10 var(--t3) + 우측 '수정' button (editingFinding state set) + '삭제' button (handleDelete) — 10 var(--t3) background none border none padding '1px 3px' | 203~212 | 등록일 + 수정/삭제 액션 | editingFinding 진입 → FindingFormSheet mount / handleDelete → invalidate + toast | W4 |
| 2. FindingsPanel | 수정 모달 — editingFinding 있으면 `<FindingFormSheet scheduleItemId={roundId} mode="edit" finding={editingFinding} onClose={() => setEditingFinding(null)} />` (자체 fixed/inset:0 오버레이) | 217~225 | 수정 모달 mount | FindingFormSheet 외부 컴포넌트 — props 보존 + 본 wave + W2~W5 미수정 | W4 (mount 만 마킹) |
| 3. FindingDetailPanel (데스크톱 우측) | props `{ roundId: string, findingId: string }` | 233 | 데스크톱 우측 패널 props | 메인 LegalPage 데스크톱 분기 line 491 호출 | W4 |
| 3. FindingDetailPanel | useQueryClient + useNavigate + useState memo + useAuthStore(s => s.staff) + useMultiPhotoUpload() resPhotos + useState downloading | 234~239 | 상태 + 권한 + 사진 업로드 hook | useMultiPhotoUpload 시그니처 — **변경 금지** | W4 |
| 3. FindingDetailPanel | useQuery — `['legal-finding', roundId, findingId]` legalApi.getFinding(roundId, findingId) enabled !!roundId && !!findingId | 241~245 | finding 상세 fetch | invalidateQueries onSuccess 키 일치 필수 | W4 |
| 3. FindingDetailPanel | resolveMutation — keys = await resPhotos.uploadAll() → legalApi.resolveFinding(roundId, findingId, { resolution_memo: memo.trim(), resolution_photo_keys: keys.length > 0 ? keys : undefined }). onSuccess invalidate 4 키 (['legal-finding', roundId, findingId] + ['legal-findings', roundId] + ['legal-rounds'] + ['legal-round', roundId]) + toast.success '조치 완료' + resPhotos.reset + setMemo(''). onError toast.error '조치 처리 실패' | 247~265 | **핵심 비즈** 조치 완료 mutation | useMutation + uploadAll + legalApi.resolveFinding(snake_case resolution_memo + resolution_photo_keys) — **변경 금지** | W4 |
| 3. FindingDetailPanel | handleDownload (admin 전용 ZIP) — dynamic import('fflate').zipSync. files: { '내용.txt': enc.encode(buildMetaTxt(finding)) }. photoKeys 매핑 → '지적사진-{j+1}.jpg' (Promise.allSettled fulfilled 만). resolutionPhotoKeys 매핑 → '조치사진-{j+1}.jpg'. Blob zip type 'application/zip' → 파일명 `지적사항_${(location ?? '').replace(/[\/\\:*?"<>|]/g, '_')}.zip`. toast.success '다운로드 완료' / catch toast.error '다운로드 실패' | 267~287 | **핵심 비즈** ZIP 다운로드 (admin) | buildMetaTxt (외부 utils) + fflate dynamic import + 파일명 안전화 정규식 + 사진 파일명 패턴 — **변경 금지** | W4 |
| 3. FindingDetailPanel | isSubmitting = resolveMutation.isPending \|\| resPhotos.isUploading | 289 | submit disable 조건 | 조치 완료 button disabled / opacity / cursor | W4 |
| 3. FindingDetailPanel | isLoading 분기 — spinner 24x24 border 2px var(--bd2) borderTopColor var(--acl) borderRadius 50% animation `spin .7s linear infinite` + `<style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>` (인라인) | 291 | 로딩 spinner (인라인 keyframe) | spin keyframe 인라인 정의 — **변경 금지** | W2 (로딩 spinner) + W4 |
| 3. FindingDetailPanel | !finding 분기 — '항목을 불러오지 못했습니다.' var(--t3) 13 flex center | 292 | 빈 상태 카피 | verbatim — **변경 금지** | W2 |
| 3. FindingDetailPanel | 헤더 — flex align justify-between marginBottom 16. '지적 상세' 15/700 var(--t1) + staff.role === 'admin' → '다운로드' button (downloading ? '...') 11/700 h 28 bg var(--bg3) border 1px solid var(--bd2) padding '0 10px' | 296~302 | 헤더 + admin 다운로드 button | admin 분기 — assistant 면 다운로드 button 숨김 | W4 |
| 3. FindingDetailPanel | 지적 정보 — '지적 정보' 12/700 var(--t3) marginBottom 8. KVRow 4건 (지적 내용 description whiteSpace pre-wrap / 위치 location ?? '-' / 등록일 fmtDateTime(createdAt) / 등록자 createdByName ?? createdBy). marginBottom 16 | 305~313 | KVRow 4건 (지적 정보) | KVRow 라벨 '지적 내용' / '위치' / '등록일' / '등록자' verbatim | W4 |
| 3. FindingDetailPanel | 지적 사진 — '지적 사진' 12/700 var(--t3) marginBottom 8. photoKeys.length > 0 → PhotoGrid (photoUrls = photoKeys.map(k => '/api/uploads/' + k)) / 빈 '사진 없음' 12 var(--t3). marginBottom 16 | 316~319 | 지적 사진 grid + 빈 분기 | PhotoGrid 외부 컴포넌트 props 보존 — **변경 금지** | W4 |
| 3. FindingDetailPanel | **조치 입력** (open only) — borderTop 1px solid var(--bd) paddingTop 16. (1) '조치 내용' 12/700 var(--t3) marginBottom 8 / (2) textarea memo width 100% bg var(--bg3) borderRadius 9 padding '10px 12px' border 1px solid var(--bd2) fontSize 13 lineHeight 1.5 resize vertical rows 3 placeholder '조치 내용을 입력하세요' / (3) '조치 사진 (최대 5장)' 12/700 var(--t3) / (4) input camera/album hidden + PhotoSourceModal — useMultiPhotoUpload hook / (5) 슬롯 매핑 64x64 objectFit cover borderRadius 8 + ✕ 18x18 우상단 bg var(--danger) #fff fontSize 10 → removeSlot(i) / (6) canAdd 면 첨부 button 64x64 borderRadius 8 bg var(--bg3) border 1px dashed var(--bd2) color var(--t3) fontSize 10/600 + **`<span style={{fontSize: 18}}>📷</span>`** + '첨부' — **이모지 사용 사고 케이스** (memory `feedback_tsx_wave_emoji_dot_gap` Lucide Camera size={18} 교체 후보) / (7) '조치 완료' button width 100% h 40 bg var(--acl) #fff 13/700 borderRadius 10 — memo.trim() 빈 → toast.error '조치 내용을 입력하세요' / 그 외 resolveMutation.mutate(). disabled isSubmitting + opacity 0.5 + cursor not-allowed | 322~349 | **핵심 UI** 조치 입력 (textarea + 사진 5장 + 완료 button) | useMultiPhotoUpload canAdd < 5 / textarea placeholder + 사진 라벨 + 완료 button 카피 verbatim — **모두 변경 금지** | W4 (조치 입력 매트릭스 — 사진 0/3/5장 + isSubmitting) |
| 3. FindingDetailPanel | **조치 결과** (resolved only) — borderTop 1px solid var(--bd) paddingTop 16. (1) '조치 결과' 12/700 var(--t3) marginBottom 8 / (2) KVRow 3건 (조치일시 fmtDateTime(resolvedAt) / 조치자 resolvedByName ?? resolvedBy ?? '-' / 조치 내용 resolutionMemo ?? '-' whiteSpace pre-wrap) / (3) resolutionPhotoKeys > 0 → PhotoGrid | 352~364 | resolved 결과 표시 (KVRow 3 + 사진) | KVRow 라벨 '조치일시' / '조치자' / '조치 내용' verbatim | W4 |
| 4. 메인 LegalPage | useNavigate / useIsDesktop / useSearchParams | 373~375 | 라우팅 + 분기 + URL 쿼리 | useSearchParams tab persist | W2 + W3 + W4 |
| 4. 메인 LegalPage | tab = (searchParams.get('tab') as TabKey) \|\| '전체' / setTab — URL `?tab=` 영속 (replace: true) | 376~377 | 탭 URL persist | TabKey union | W3 |
| 4. 메인 LegalPage | year state — 현재년도 string / years = genYears() | 379~380 | 연도 필터 | 연도 select 옵션 | W3 |
| 4. 메인 LegalPage | 데스크톱 3분할 state — selectedRoundId / selectedFindingId (둘 다 string \| null) | 383~384 | 좌→중→우 활성 라운드/finding | 데스크톱 분기에서만 사용 (모바일은 sub-route 위임) | W2 + W4 |
| 4. 메인 LegalPage | useQuery — `['legal-rounds', year]` legalApi.list(year) staleTime 30_000 | 386~390 | 메인 라운드 fetch | invalidateQueries 모든 mutation onSuccess 키 일치 — **변경 금지** | W2 + W3 |
| 4. 메인 LegalPage | filtered = filterRounds(rounds ?? [], tab) | 391 | filterRounds 호출 | tab 변경 시 즉시 필터링 | W3 |
| 4. 메인 LegalPage | handleRoundClick — `isDesktop ? (setSelectedRoundId(round.id), setSelectedFindingId(null)) : navigate(\`/legal/${round.id}\`)` | 394~401 | **isDesktop 분기** 데스크톱 selectedRoundId set / 모바일 sub-route navigate | 데스크톱 선택 또는 모바일 LegalFindingsPage (App.tsx line 290) 진입 — **변경 금지** | W3 |
| 4. 메인 LegalPage | roundList JSX — flex column height 100%. (1) 필터 영역 — flexShrink 0. 탭 TABS 매핑 flex 1 h 38 bg `tab === t.key ? 'var(--bg4)' : 'transparent'` color `tab === t.key ? 'var(--t1)' : 'var(--t3)'` 11/700 borderBottom `2px solid var(--acl)` 활성 / `2px solid transparent`. 연도 select padding '6px 12px' bg var(--bg3) border 1px solid var(--bd2) borderRadius 6 padding '4px 8px' color var(--t1) 12 appearance none — `${y}년` 옵션 / (2) 카드 영역 flex 1 overflowY auto padding '8px 12px' flex column gap 6 | 404~461 | 데스크톱 좌측 + 모바일 본문 공용 라운드 목록 헬퍼 | TABS 매핑 + 카드 매핑 — 양쪽 분기에서 사용 (`{roundList}` 데스크톱만 / 모바일은 인라인 동일 패턴) | W3 (탭/연도/카드) |
| 4. 메인 LegalPage | 라운드 카드 데스크톱 — bg var(--bg3) / border `selectedRoundId === id ? '1.5px solid var(--acl)' : '1px solid var(--bd)'` / **borderLeft: `3px solid ${accentColor(round.result)}`** / borderRadius 10 padding 10 cursor pointer flex column gap 3. title 13/700 var(--t1) ellipsis + ResultBadge + 메타 `${fmtDate(date)} · 지적 ${findingCount} · 완료 ${resolvedCount}` 11 var(--t2) | 438~458 | 데스크톱 좌측 카드 (selected 분기 + accentColor) | accentColor 호출 + ResultBadge 호출 + selected 시각 분기 + 메타 verbatim ('건' 없음) | W3 |
| 4. 메인 LegalPage | **데스크톱 3분할** — flex height 100% bg var(--bg) + 인라인 `<style>{@keyframes blink ...}</style>` (line 467, opacity .6/.3). (1) 좌측 width 500 flexShrink 0 borderRight 1px solid var(--bd) flex column → {roundList} + 코멘트 "페이지 제목은 App.tsx 헤더에서 표시" / (2) 중앙 width 500 flexShrink 0 borderRight 1px solid var(--bd) flex column → selectedRoundId 있으면 FindingsPanel key=selectedRoundId / 없으면 '좌측에서 점검을 선택하세요' var(--t3) 13 flex center / (3) 우측 flex 1 flex column → selectedFindingId && selectedRoundId 있으면 FindingDetailPanel key=selectedFindingId / 없으면 `selectedRoundId ? '중앙에서 지적사항을 선택하세요' : '점검을 먼저 선택하세요'` var(--t3) 13 flex center | 464~500 | 데스크톱 3분할 마스터-디테일-디테일 + 인라인 keyframe | width 500/500/flex 1 / borderRight 1px / 중앙/우측 fallback 카피 verbatim — **모두 변경 금지** | W2 (3분할 outline + fallback 5종) |
| 4. 메인 LegalPage | **모바일** — flex column height 100% bg var(--bg) overflow hidden + 인라인 keyframes blink (line 505). (1) 자체 헤더 height 48 bg `rgba(22,27,34,0.97)` borderBottom 1px solid var(--bd) flex align justify center relative flexShrink 0 — back button position absolute left 12 **36x36** background none border none cursor pointer color var(--t1) flex center → onClick navigate(-1) + inline SVG ChevronLeft `width=20 height=20 viewBox=0 0 24 24 stroke=currentColor strokeWidth=2 path d="M15 19l-7-7 7-7"` / 타이틀 '소방 점검 관리' 16/700 var(--t1) / (2) 필터 — bg var(--bg2) borderBottom 1px solid var(--bd) flexShrink 0. 탭 TABS 매핑 flex 1 **h 44** 12/700 borderBottom 2px solid var(--acl) 활성. 연도 select padding '8px 16px' — bg var(--bg3) border 1px solid var(--bd2) borderRadius 8 padding '6px 12px' var(--t1) 13 / (3) 카드 영역 flex 1 overflowY auto padding '12px 16px' flex column gap 8. 로딩 3 SKELETON / 오류 '목록을 불러오지 못했습니다.' 14 var(--t2) padding '40px 16px' + '다시 시도' button bg var(--acl) #fff 14/700 borderRadius 8 padding '8px 24px' / 빈 '소방 점검 관리 이력 없음' 16/700 var(--t1) + '소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.' 12 var(--t2) flex column align center padding '60px 16px' / 카드 bg var(--bg3) border 1px solid var(--bd) **borderLeft: `3px solid ${accentColor(round.result)}`** borderRadius 12 padding 12 cursor pointer flex column gap 4 — title 14/700 var(--t1) ellipsis + ResultBadge + 메타 `${fmtDate(date)}${endDate ? ' ~ ' + fmtDate(endDate) : ''} · 지적 ${findingCount}건 · 완료 ${resolvedCount}건` 12 var(--t2) | 503~570 | 모바일 자체 헤더 + 필터 + 카드 (sub-route 진입) | back button 36x36 (§1.1 44 미달, OQ #5) + 타이틀 '소방 점검 관리' + 모든 카피 + 메타 ('건' 있음 + endDate 분기) verbatim — **변경 금지** | W2 (헤더 + 빈/로딩/오류) + W3 (탭/연도/카드) |

## §1.2 line 수 실측 확인

```
$ wc -l cha-bio-safety/src/pages/LegalPage.tsx
     571 cha-bio-safety/src/pages/LegalPage.tsx
```

PLAN 추정치 (571 lines) + 19-legal.md 메타 일치, drift 없음.

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

W5 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (28-splash W1 비즈 anchor 16건 + 23-education D-day 임계치 + role 그룹핑 보존 룰 일반화, memory `feedback_inspection_unresolved_color` + `project_inspection_completion_rule`):

```
[LegalPage.tsx — react-query / 비즈 시그니처]
- useQuery({ queryKey: ['legal-rounds', year], queryFn: () => legalApi.list(year), staleTime: 30_000 })  (변경 금지)
- useQuery({ queryKey: ['legal-round', roundId], queryFn: () => legalApi.get(roundId), enabled: !!roundId })  (변경 금지)
- useQuery({ queryKey: ['legal-findings', roundId], queryFn: () => legalApi.getFindings(roundId), enabled: !!roundId, staleTime: 30_000 })  (변경 금지)
- useQuery({ queryKey: ['legal-finding', roundId, findingId], queryFn: () => legalApi.getFinding(roundId, findingId), enabled: !!roundId && !!findingId })  (변경 금지)
- useMutation resolveMutation { mutationFn: async () => { const keys = await resPhotos.uploadAll(); return legalApi.resolveFinding(...) } }  (변경 금지)
- queryClient.invalidateQueries — ['legal-rounds'] / ['legal-round'] / ['legal-findings'] / ['legal-finding'] 4 키 (mutation onSuccess 마다 정확한 키 invalidate 필수)

[utils/api.ts — legalApi 7종 시그니처]
- legalApi.list(year: string): Promise<LegalRound[]>                                              (변경 금지)
- legalApi.get(roundId: string): Promise<LegalRound>                                              (변경 금지)
- legalApi.getFindings(roundId: string): Promise<LegalFinding[]>                                   (변경 금지)
- legalApi.updateResult(roundId, { result?: LegalInspectionResult; report_file_key?: string })    (snake_case payload 변경 금지)
- legalApi.deleteFinding(roundId, findingId): Promise<void>                                        (변경 금지)
- legalApi.getFinding(roundId, findingId): Promise<LegalFinding>                                   (변경 금지)
- legalApi.resolveFinding(roundId, findingId, { resolution_memo, resolution_photo_keys? })        (snake_case payload 변경 금지)

[LegalPage.tsx — 비즈 로직 함수]
- accentColor(result): pass → 'var(--safe)' / fail → 'var(--danger)' / conditional → 'var(--warn)' / 그 외 → 'var(--bd2)'  (4분기 변경 금지)
- ResultBadge map: pass = { bg: 'rgba(34,197,94,.13)', color: 'var(--safe)', label: '적합' } / fail = { bg: 'rgba(239,68,68,.15)', color: 'var(--danger)', label: '부적합' } / conditional = { bg: 'rgba(245,158,11,.15)', color: 'var(--warn)', label: '조건부적합' } / null → '결과 미입력' var(--t3)  (4분기 + 라벨 1 byte 변경 금지)
- filterRounds(rounds, tab): 미조치 → findingCount > resolvedCount / 완료 → findingCount > 0 && findingCount === resolvedCount / 전체 → 그대로  (운영 룰, 변경 금지)
- TABS: [{key:'전체',label:'전체'},{key:'미조치',label:'진행 중'},{key:'완료',label:'완료'}] — **key/label mismatch ('미조치' key 가 '진행 중' 라벨)** 의도된 디자인  (변경 금지)
- genYears(): 2024~currentYear 오름차순 (역순 아님)
- sorted findings (FindingsPanel line 147~151): status 'open' 먼저 (open === -1, open !== 1, 그 외 createdAt desc localeCompare)
- handleRoundClick: isDesktop → setSelectedRoundId + setSelectedFindingId(null) / 모바일 → navigate(`/legal/${round.id}`)  (변경 금지)
- fmtDate / fmtDateTime: zero-padded 'y.m.d' / 'y.m.d HH:mm' (null → '-')  (변경 금지)
- KVRow: 라벨 12 var(--t3) width 64 flexShrink 0 / children 14 var(--t1) flex 1 lineHeight 1.5  (변경 금지)

[LegalPage.tsx — 결과 status 시그니처 (memory feedback_inspection_unresolved_color 일반화)]
- pass → safe (rgba(34,197,94,.13) + var(--safe) + '적합')                                        (또는 status- 토큰 치환, OQ #2)
- fail → danger (rgba(239,68,68,.15) + var(--danger) + '부적합')                                  (또는 status- 토큰 치환, OQ #2)
- conditional → warning (rgba(245,158,11,.15) + var(--warn) + '조건부적합')                       (또는 status- 토큰 치환, OQ #2)
- null → 미입력 (var(--bd2) + var(--t3) + '결과 미입력')                                          (변경 금지)
- finding status open → borderLeft var(--danger) + 칩 bg rgba(239,68,68,.15) color var(--danger) '미조치'  (변경 금지)
- finding status resolved → borderLeft var(--safe) + 칩 bg rgba(34,197,94,.13) color var(--safe) '완료'  (변경 금지)

[LegalPage.tsx — role 권한 시그니처 (memory project_inspection_completion_rule 일반화)]
- FindingsPanel role === 'admin' 분기 (line 162): select + 저장 + 보고서 업로드/열기 button  (변경 금지)
- FindingDetailPanel staff?.role === 'admin' 분기 (line 299): '다운로드' button (ZIP)  (변경 금지)
- 조치 입력 (textarea + 사진 5장 + 완료 button) 은 권한 분기 없음 — 모든 사용자 조치 가능  (변경 금지)
- 카드 cursor pointer — Education 의 canEdit 분기와 다름 (Legal 은 모든 사용자 카드 클릭 가능)

[LegalPage.tsx — useMultiPhotoUpload + ZIP 다운로드]
- useMultiPhotoUpload(): { cameraRef, albumRef, showPicker, openPicker, closePicker, pickCamera, pickAlbum, handleFiles, slots, canAdd (< 5), removeSlot(i), uploadAll(): Promise<string[]>, reset(), isUploading }  (시그니처 변경 금지)
- 5장 제한 (canAdd = slots.length < 5)  (변경 금지)
- buildMetaTxt(finding) → ZIP 내부 '내용.txt'  (시그니처 변경 금지)
- fflate dynamic import('fflate').zipSync — 다운로드 시점에만 로드  (변경 금지)
- ZIP 파일명: `지적사항_${(location ?? '').replace(/[\/\\:*?"<>|]/g, '_')}.zip`  (변경 금지)
- 사진 파일명: `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg`  (변경 금지)

[LegalPage.tsx — toast / 카피 / 자산 / animation]
- toast.success: '점검 결과 저장' (line 116, FindingsPanel handleSaveResult)                       (변경 금지)
- toast.success: '보고서 업로드 완료' (line 132)                                                    (변경 금지)
- toast.success: '삭제됨' (line 143)                                                                (변경 금지)
- toast.success: '조치 완료' (line 260, FindingDetailPanel resolveMutation)                         (변경 금지)
- toast.success: '다운로드 완료' (line 284)                                                         (변경 금지)
- toast.error: '저장 실패' (line 117)                                                               (변경 금지)
- toast.error: '업로드 실패' (line 133)                                                             (변경 금지)
- toast.error: err?.message ?? '삭제 실패' (line 144)                                               (변경 금지)
- toast.error: '조치 처리 실패' (line 264)                                                          (변경 금지)
- toast.error: '다운로드 실패' (line 285)                                                           (변경 금지)
- toast.error: '조치 내용을 입력하세요' (line 345)                                                  (변경 금지)
- 모바일 헤더 타이틀: '소방 점검 관리' (line 514)                                                    (변경 금지, App.tsx PAGE_TITLES line 98 와 일치)
- 데스크톱 중앙 fallback: '좌측에서 점검을 선택하세요' (line 484)                                   (변경 금지)
- 데스크톱 우측 fallback: '중앙에서 지적사항을 선택하세요' (selectedRoundId 있을 때) / '점검을 먼저 선택하세요' (없을 때) (line 494)  (변경 금지)
- FindingsPanel 빈: '지적사항 없음' (line 184)                                                      (변경 금지)
- FindingDetailPanel 빈: '항목을 불러오지 못했습니다.' (line 292)                                   (변경 금지)
- 모바일 빈 제목: '소방 점검 관리 이력 없음' (line 548, 16/700 var(--t1))                          (변경 금지)
- 모바일 빈 보조: '소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.' (line 549, 12 var(--t2))  (변경 금지)
- 모바일 오류: '목록을 불러오지 못했습니다.' (line 542) + '다시 시도' button (line 543)              (변경 금지)
- 데스크톱 좌측 오류: '불러오기 실패' (line 431) + '재시도' button (line 432)                      (변경 금지)
- 데스크톱 좌측 빈: '점검 이력 없음' (line 436)                                                     (변경 금지)
- 결과 select 옵션 verbatim: '미입력' / '적합' / '부적합' / '조건부적합' (line 165~168)             (변경 금지)
- 결과 저장 button verbatim: '저장' (line 170)                                                      (변경 금지)
- 보고서 button verbatim: '보고서' (열기) / '보고서 업로드' (없을 때) / '...' (uploadingReport)     (line 173/175)  (변경 금지)
- finding 카드 액션 verbatim: '수정' (line 209) / '삭제' (line 210)                                 (변경 금지)
- finding 상태 칩 verbatim: '미조치' (open) / '완료' (resolved) (line 200)                          (변경 금지)
- 조치 textarea placeholder: '조치 내용을 입력하세요' (line 325)                                    (변경 금지)
- 조치 사진 라벨: '조치 사진 (최대 5장)' (line 327)                                                  (변경 금지)
- 조치 완료 button verbatim: '조치 완료' (line 346) / '처리 중...' (isSubmitting) (line 346)        (변경 금지)
- 다운로드 button verbatim: '다운로드' (line 300) / '...' (downloading)                              (변경 금지)
- 지적 정보 섹션 라벨: '지적 정보' (line 306) / '지적 사진' (line 317) / '조치 내용' (line 324) / '조치 결과' (line 354)  (변경 금지)
- KVRow 라벨 verbatim (지적 정보): '지적 내용' / '위치' / '등록일' / '등록자' (line 308~311)        (변경 금지)
- KVRow 라벨 verbatim (조치 결과): '조치일시' / '조치자' / '조치 내용' (line 356~358)              (변경 금지)
- '위치 미지정' (finding location null fallback, line 202)                                          (변경 금지)
- '사진 없음' (finding photoKeys 빈, line 318)                                                       (변경 금지)
- FindingsPanel 헤더 기본값: '지적사항 목록' (round 없을 때, line 157)                              (변경 금지)
- FindingDetailPanel 헤더: '지적 상세' (line 298)                                                    (변경 금지)
- 탭 라벨: '전체' / '진행 중' / '완료' (TABS line 54~58)                                            (변경 금지, key/label mismatch 의도)
- 연도 옵션: `${y}년` (line 421, 532)                                                               (변경 금지)
- 모바일 카드 메타 verbatim: `${fmtDate(date)}${endDate ? ' ~ ' + fmtDate(endDate) : ''} · 지적 ${findingCount}건 · 완료 ${resolvedCount}건` (line 564)  (변경 금지)
- 데스크톱 좌측 카드 메타: `${fmtDate(date)} · 지적 ${findingCount} · 완료 ${resolvedCount}` (line 455, '건' 없음)  (변경 금지)
- 첨부 button '📷' 이모지 + '첨부' 텍스트 (line 340) — **이모지 사용 사고 케이스** (Lucide Camera 또는 Plus 교체 후보, OQ #5 LOCKED 시 처리)  (현 상태 보존 또는 교체 룰 결정)
- @keyframes blink (line 467, 505): `0%,100%{opacity:.6} 50%{opacity:.3}` — **Education 의 0%/100% opacity 1 / 50% opacity 0.4 와 다름**  (변경 금지)
- @keyframes spin (line 291): `to{transform:rotate(360deg)}` (FindingDetailPanel 로딩 spinner, 인라인 정의)  (변경 금지)
- 모바일 헤더 height 48 + back button 36x36 (position absolute left 12, **§1.1 터치 마지노선 44px 미달** — OQ #5 LOCKED 시 44x44 격상 검토) + 타이틀 정중앙  (현 상태 박제, 격상은 OQ)
- 라운드 카드 minHeight 미설정 / padding 10 (데스크톱) padding 12 (모바일) / borderRadius 10 (데스크톱) borderRadius 12 (모바일)
- SKELETON height 72 (Education 88 과 다름) + animation 'blink 2s ease-in-out infinite'
- FindingsPanel 카드 borderRadius 10 padding 10
- FindingDetailPanel 사진 슬롯 64x64 borderRadius 8
- ✕ 버튼 18x18 (사진 슬롯 우상단)
- 다운로드 spinner 24x24 (FindingDetailPanel isLoading)
- FindingFormSheet (자체 fixed/inset 0 오버레이, line 218~224)
- PhotoGrid / PhotoSourceModal (라이브러리 컴포넌트, 변경 금지 — 본 wave 미수정)

[App.tsx — chrome 실측 (line 35, 71, 74, 77, 98, 117, 289~291)]
- line 35: const LegalPage = lazy(() => import('./pages/LegalPage'))                              (변경 금지)
- line 71: MOBILE_NO_NAV_PATHS ⊃ '/legal'                                                          (변경 금지)
- line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']  // /legal 미등재 → 데스크톱 BottomNav (사이드바) 표시  (변경 금지)
- line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']  // /legal 미등재 → 데스크톱 글로벌 AppHeader 표시  (변경 금지)
- line 98: PAGE_TITLES '/legal': '소방 점검 관리'                                                  (변경 금지)
- line 117: !location.pathname.match(/^\/legal\/.+/)  // 특수 navigation guard — sub-route /legal/:id 는 본 페이지와 다른 처리  (변경 금지)
- line 289: <Route path="/legal" element={<Auth><LegalPage /></Auth>} />                          (변경 금지)
- line 290: <Route path="/legal/:id" element={<Auth><LegalFindingsPage /></Auth>} />              (본 wave 범위 아님)
- line 291: <Route path="/legal/:id/finding/:fid" element={<Auth><LegalFindingDetailPage /></Auth>} />  (본 wave 범위 아님)

[stores/authStore.ts]
- useAuthStore().staff: Staff | null — role: 'admin' | 'assistant'                                 (시그니처 변경 금지)

[hooks/useIsDesktop.ts]
- useIsDesktop(): boolean — ≥768px 분기                                                            (시그니처 변경 금지)

[hooks/useMultiPhotoUpload.ts + utils/findingDownload.ts + components/PhotoGrid/PhotoSourceModal/FindingFormSheet]
- 모두 본 wave + W2~W5 미수정 — 시그니처 + props 보존
- useMultiPhotoUpload 5장 제한 (canAdd < 5)                                                        (변경 금지)
- buildMetaTxt(finding): string                                                                    (시그니처 변경 금지)
- PhotoGrid props: { photoUrls: string[] }                                                         (변경 금지)
- PhotoSourceModal props: { open, onClose, onCamera, onAlbum }                                     (변경 금지)
- FindingFormSheet props: { scheduleItemId, mode, finding, onClose }                               (변경 금지)
```

위 모든 식별자/값은 §6 negative rule + §5 룰 11/12 + §7 OQ #1/#2/#3/#4/#5 default 답에서 재확인. 1 byte 변경 시 W5 verify FAIL (28-splash W1 비즈 anchor 16건 보존 룰 + 23-education D-day 임계치 + role 그룹핑 보존 룰 동일 적용).

---

# §2. 4 sub-wave 분배 plan

다음 표 (W2~W5 4행) — 파일명은 위 frontmatter 의 평면 패턴 (`sketch-wave-N-{slug}.html` for W2~W4, `wave-5-tsx-conversion-checklist.md` for W5):

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 자체 헤더 + 데스크톱 3분할 outline (좌 500 + 중 500 + 우 flex 1) + 빈/로딩/오류 상태 (3 state + 데스크톱 중/우 2 fallback = 5 state 매트릭스) | 영역 4 모바일 자체 헤더 (line 507~515, h 48 + bg rgba(22,27,34,0.97) + back button 36x36 position absolute left 12 + 타이틀 '소방 점검 관리' 정중앙) + 영역 4 데스크톱 3분할 외곽 (line 464~500, width 500/500/flex 1 borderRight 1px var(--bd) + 중앙 fallback '좌측에서 점검을 선택하세요' + 우측 fallback '중앙에서 지적사항을 선택하세요' / '점검을 먼저 선택하세요') + 영역 1 SKELETON (line 50, height 72 + animation blink 2s) + 영역 4 로딩/오류/빈 분기 (line 428~437 데스크톱 좌측 + line 539~551 모바일 + 영역 2 FindingsPanel 빈 line 184 + 영역 3 FindingDetailPanel '항목을 불러오지 못했습니다.' line 292). 인라인 `@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }` (line 467, 505) + spin keyframe (line 291). | sketch-wave-2-chrome.html |
| W3 | 라운드 카드 + 탭 (전체/진행 중/완료, key/label mismatch 의도) + 연도 필터 + accentColor 좌측 3px 색바 (pass/fail/conditional/null 4분기) + ResultBadge (적합/부적합/조건부적합/결과 미입력 4 라벨) | 영역 1 accentColor (line 27~32) + ResultBadge (line 35~47) + TABS + filterRounds (line 53~63) + genYears + 영역 4 roundList 탭 (line 409~417) + 연도 select (line 419~422, 530~534) + 라운드 카드 데스크톱 (line 438~458, padding 10 borderRadius 10 + selected 1.5px var(--acl)) + 모바일 (line 552~567, padding 12 borderRadius 12). accentColor 4분기 매트릭스 frame 4개 (pass/fail/conditional/null) + ResultBadge 4 라벨 매트릭스. 탭 key='미조치' / label='진행 중' mismatch 보존. | sketch-wave-3-round-card.html |
| W4 | FindingsPanel (데스크톱 중앙 — 헤더 + admin 도구 select/저장/보고서 + findings 목록 + open-first 정렬 + status borderLeft + 수정/삭제 + FindingFormSheet) + FindingDetailPanel (데스크톱 우측 — 헤더 + admin 다운로드 + 지적 정보 KVRow + 지적 사진 PhotoGrid + 조치 입력 textarea + 사진 5장 + 조치 완료 button + 조치 결과 KVRow) | 영역 2 FindingsPanel (line 82~228) + 영역 3 FindingDetailPanel (line 233~367). admin 분기 매트릭스 (admin 평시 / assistant) + open vs resolved 분기 매트릭스 + 사진 5장 슬롯 매트릭스 (0/3/5장 + canAdd 첨부 button) + 첨부 button '📷' (OQ #5 Lucide Camera 교체 시) + 다운로드 button (admin only) + 결과 select 4 옵션 (미입력/적합/부적합/조건부적합) + 보고서 업로드/열기 + 수정 모달 FindingFormSheet (자체 오버레이) — frame 6~8 매트릭스 (FindingsPanel admin/assistant × open/resolved/빈 + FindingDetailPanel admin/assistant × open/resolved/loading/error). | sketch-wave-4-findings-panels.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + LegalPage.tsx 비즈 로직 보존 룰 + accentColor/ResultBadge 4분기 1 byte 변경 금지 + filterRounds + sorted open-first + role admin 도구 분기 + useMultiPhotoUpload 5장 제한 + buildMetaTxt + ZIP 다운로드 + 모든 toast 카피 + Tailwind cheatsheet + 메모리 룰 12건 cross-ref. 28-splash W5 + 23-education W5 의 12-섹션 구조 mirror. | wave-5-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트 / 레이아웃

**[W2 — 모바일 자체 헤더 + 데스크톱 3분할 outline + 빈/로딩/오류 상태]**

- **보존**:
  - 모바일 헤더 타이틀 '소방 점검 관리' (line 514) verbatim (App.tsx PAGE_TITLES line 98 일치)
  - 데스크톱 중앙 fallback '좌측에서 점검을 선택하세요' (line 484) verbatim
  - 데스크톱 우측 fallback '중앙에서 지적사항을 선택하세요' (selectedRoundId 있을 때) / '점검을 먼저 선택하세요' (없을 때) (line 494) verbatim
  - 모바일 빈 제목 '소방 점검 관리 이력 없음' (line 548) + 보조 '소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.' (line 549) verbatim
  - 모바일 오류 '목록을 불러오지 못했습니다.' (line 542) + '다시 시도' button verbatim
  - 데스크톱 좌측 오류 '불러오기 실패' (line 431) + '재시도' button verbatim
  - 데스크톱 좌측 빈 '점검 이력 없음' (line 436) verbatim
  - FindingsPanel 빈 '지적사항 없음' (line 184) verbatim
  - FindingDetailPanel 빈 '항목을 불러오지 못했습니다.' (line 292) verbatim
  - SKELETON height 72 + animation `blink 2s ease-in-out infinite` (line 50) — Education 88 과 다름, **변경 금지**
  - @keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (line 467, 505) — Education 1/0.4 와 다름, **변경 금지**
  - @keyframes spin `to{transform:rotate(360deg)}` (line 291, FindingDetailPanel 로딩) — 변경 금지
  - useIsDesktop 분기 verbatim — 데스크톱 = flex 3분할 (500/500/flex 1) / 모바일 = flex column 헤더+필터+카드
  - 모바일 back button 36x36 position absolute left 12 inline SVG ChevronLeft — **§1.1 터치 마지노선 44px 미달** — 현 상태 그대로 박제 (OQ #5 LOCKED 시 격상)
  - 데스크톱 좌측 width 500 + 중앙 width 500 + 우측 flex 1 (1 byte 변경 금지)
  - 데스크톱 좌측/중앙 borderRight 1px solid var(--bd)
  - 모바일 외곽 overflow hidden + height 100%
  - 모바일 헤더 bg `rgba(22,27,34,0.97)` (raised 변형 alpha) — surface-raised 토큰과의 alpha 차이 OQ #1 검토

- **토큰** (design-system §4.1 매핑):
  - `var(--bg)` (line 466, 504) → `bg-surface-page`
  - `var(--bg2)` (모바일 필터 영역 line 518) → `bg-surface-raised`
  - 모바일 헤더 bg `rgba(22,27,34,0.97)` → `bg-surface-raised/97` arbitrary 또는 인라인 유지 (OQ #1)
  - `var(--bg3)` (SKELETON line 50, 라운드 카드 데스크톱 line 443, 모바일 line 554) → `bg-surface-sunken`
  - `var(--bg4)` (탭 활성 line 411, 522) → `bg-surface-active`
  - `var(--bd)` (line 471, 475, 508 외) → `border-border-default`
  - `var(--t1)` (모바일 타이틀 line 514, 빈 제목 line 548) → `text-text-primary`
  - `var(--t2)` (모바일 카드 메타 line 564, 모바일 빈 보조 line 549) → `text-text-secondary`
  - `var(--t3)` (FindingsPanel 빈 line 184, FindingDetailPanel 빈 line 292, 데스크톱 fallback 다수) → `text-text-tertiary`

- **폰트** (design-system §1.1 + §4.2):
  - 11 (탭 라벨 데스크톱 line 414) — **§1.1 마지노선 위반 (9·10·11 금지)** — text-caption(12) 격상 후보 (OQ #3 검토)
  - 12 (모바일 빈 보조 line 549, FindingsPanel 빈 line 184, FindingDetailPanel 빈 line 292, 모바일 카드 메타 line 564, 데스크톱 좌측 빈 line 436) → text-caption(12) leading-none
  - 13 (모바일 탭 line 525, 데스크톱 fallback 다수, 라운드 카드 데스크톱 title line 451) → text-label
  - 14 (모바일 오류 line 542) → text-body-sm 또는 text-body (16) 격상 후보 (OQ #3)
  - 15 (FindingsPanel/FindingDetailPanel 헤더 line 157, 298) → text-body-sm
  - 16 (모바일 타이틀 line 514, 모바일 빈 제목 line 548) → text-body (마지노선)

- **레이아웃**:
  - 모바일: 단일 컬럼 (자체 헤더 48 + 필터 영역 + 스크롤 카드 영역)
  - 데스크톱: **3분할** (좌 500 raster + 중 500 + 우 flex 1, borderRight 1px)
  - **모바일 BottomNav 숨김** (`/legal` ∈ MOBILE_NO_NAV_PATHS App.tsx line 71) — sketch 시 nav placeholder 그릴 필요 없음
  - **데스크톱 BottomNav 표시** (사이드바, `/legal` ∉ DESKTOP_NO_NAV_PATHS line 74) + **글로벌 AppHeader 표시** (`/legal` ∉ DESKTOP_HEADER_HIDE_PATHS line 77 + ∈ PAGE_TITLES line 98) → sketch 시 데스크톱 시안 상단에 글로벌 AppHeader 영역 + 좌측 사이드바 영역 모두 인지 필요

**[W3 — 라운드 카드 + 탭 + 연도 필터 + accentColor + ResultBadge]**

- **보존**:
  - **accentColor 4분기 (pass→safe / fail→danger / conditional→warning / null→bd2) — 1 byte 변경 금지** (memory `feedback_inspection_unresolved_color` 일반화)
  - **ResultBadge map 4 라벨 verbatim — '적합' / '부적합' / '조건부적합' / '결과 미입력' 1 byte 변경 금지**
  - ResultBadge 색 정확히 — `rgba(34,197,94,.13)` (pass) / `rgba(239,68,68,.15)` (fail) / `rgba(245,158,11,.15)` (conditional) — 또는 status 토큰 치환 (OQ #2 default 토큰 OK)
  - ResultBadge 외곽 style fontSize 11/700 borderRadius 6 padding '2px 8px' flexShrink 0 (1 byte 변경 금지)
  - TABS verbatim — [{ key '전체', label '전체' }, { key '미조치', label '진행 중' }, { key '완료', label '완료' }] **key/label mismatch 의도된 디자인** (변경 금지)
  - filterRounds 분기 — 미조치 → findingCount > resolvedCount / 완료 → findingCount > 0 && === / 전체 → 그대로 (변경 금지)
  - genYears() 오름차순 2024~ (역순 아님)
  - 탭 활성 → bg var(--bg4) color var(--t1) borderBottom 2px solid var(--acl) / 비활성 → bg transparent color var(--t3) borderBottom 2px solid transparent
  - 데스크톱 탭 h 38 / 모바일 탭 h 44
  - 연도 select 데스크톱 padding '4px 8px' borderRadius 6 fontSize 12 / 모바일 padding '6px 12px' borderRadius 8 fontSize 13
  - 라운드 카드 데스크톱: padding 10 borderRadius 10 + selected `1.5px solid var(--acl)` / 평시 `1px solid var(--bd)` + **borderLeft `3px solid ${accentColor(round.result)}`**
  - 라운드 카드 모바일: padding 12 borderRadius 12 + border 1px solid var(--bd) + **borderLeft `3px solid ${accentColor(round.result)}`** (selected 분기 없음 — 모바일은 sub-route 진입)
  - 메타 verbatim — 데스크톱 `${fmtDate(date)} · 지적 ${findingCount} · 완료 ${resolvedCount}` (line 455, '건' 없음) / 모바일 `${fmtDate(date)}${endDate ? ' ~ ' + fmtDate(endDate) : ''} · 지적 ${findingCount}건 · 완료 ${resolvedCount}건` (line 564, '건' 있음 + endDate 분기)
  - 카드 클릭 → handleRoundClick (데스크톱 setSelectedRoundId + setSelectedFindingId(null) / 모바일 navigate sub-route)
  - 데스크톱 좌측 width 500 borderRight 1px solid var(--bd) flex column

- **토큰** (status- prefix 없음 룰 — memory `feedback_tailwind_token_class_pattern`):
  - 카드 border 분기 — selected `1.5px solid var(--acl)` → `border-2 border-accent` (1.5 → 2, design-system §4.3 매핑) / 평시 `1px solid var(--bd)` → `border border-border-default`
  - **borderLeft accentColor 매핑** (OQ #2 default 토큰 치환 OK):
    - pass → `border-l-[3px] border-safe-bar` (정확한 픽셀 3px 보존)
    - fail → `border-l-[3px] border-danger-bar`
    - conditional → `border-l-[3px] border-warning-bar`
    - null → `border-l-[3px] border-border-strong` (또는 var(--bd2) 인라인 유지)
    - **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern`) — `border-l-status-safe-bar` 같은 패턴 사용 시 W5 verify FAIL
  - 카드 bg `var(--bg3)` → `bg-surface-sunken`
  - **ResultBadge status 토큰 매핑** (OQ #2 default 토큰 치환 OK):
    - pass → `bg-safe-bg text-safe` (rgba(34,197,94,.13) 인라인 폐기 — tokens.css line 58 `--status-safe-bg: rgba(34, 197, 94, 0.16)` 와 alpha 0.13 vs 0.16 미세 차이 OQ #2 검토)
    - fail → `bg-danger-bg text-danger`
    - conditional → `bg-warning-bg text-warning`
    - null → `bg-transparent text-text-tertiary` (label '결과 미입력')
  - 탭 활성 bg `var(--bg4)` → `bg-surface-active`, color `var(--t1)` → `text-text-primary`, borderBottom `var(--acl)` → `border-accent`
  - 탭 비활성 color `var(--t3)` → `text-text-tertiary`
  - 연도 select bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary`
  - 카드 title `var(--t1)` → `text-text-primary`
  - 카드 메타 `var(--t2)` → `text-text-secondary`

- **폰트** (design-system §1.1 + §4.2):
  - 11 (ResultBadge line 43, 데스크톱 탭 line 414, 모바일 카드 메타 line 454) — **§1.1 마지노선 위반 (9·10·11 금지)** — 시각 식별 우선시 12 격상 후보 (OQ #3 검토). ResultBadge 11 → text-caption(12) 격상 또는 인라인 유지.
  - 12 (데스크톱 연도 select line 420, 모바일 빈 보조 line 549, 모바일 카드 메타 line 564) → text-caption(12) leading-none
  - 13 (모바일 탭 line 525, 모바일 연도 select line 531, 라운드 카드 데스크톱 title line 451) → text-label
  - 14 (모바일 오류 line 542, 모바일 다시 시도 button line 543) → text-body-sm
  - 16 (모바일 타이틀 line 514, 모바일 빈 제목 line 548, 모바일 카드 title line 560) → text-body (마지노선)

- **레이아웃**:
  - 카드 외곽 padding 10 (데스크톱) / 12 (모바일) + borderRadius 10 / 12 (1 byte 변경 금지)
  - borderLeft `3px solid ${accentColor}` 고정 (변경 금지)
  - 데스크톱 좌측 컬럼 내부 padding '8px 12px' + flex column gap 6
  - 모바일 카드 영역 padding '12px 16px' + flex column gap 8

**[W4 — FindingsPanel + FindingDetailPanel (데스크톱 중앙 + 우측 패널)]**

- **보존**:
  - **legalApi 4종 호출 (get / getFindings / updateResult / deleteFinding) + admin 분기 line 162** — 변경 금지
  - **legalApi.getFinding + resolveFinding + useMultiPhotoUpload (5장) + buildMetaTxt + fflate ZIP** — 변경 금지
  - toast 카피 verbatim 11종 — '점검 결과 저장' / '보고서 업로드 완료' / '삭제됨' / '조치 완료' / '다운로드 완료' (5 success) / '저장 실패' / '업로드 실패' / e?.message ?? '삭제 실패' / '조치 처리 실패' / '다운로드 실패' / '조치 내용을 입력하세요' (6 error)
  - FindingsPanel 헤더 — round?.title ?? '지적사항 목록' (line 157) verbatim
  - FindingDetailPanel 헤더 — '지적 상세' (line 298) verbatim
  - admin 결과 select 옵션 verbatim — '미입력' / '적합' / '부적합' / '조건부적합' (line 165~168)
  - admin 결과 저장 button '저장' (line 170) + 보고서 button '보고서' / '보고서 업로드' / '...' (line 173/175) verbatim
  - admin 다운로드 button '다운로드' / '...' (line 300) verbatim
  - finding 카드 액션 '수정' / '삭제' (line 209/210) verbatim
  - finding 상태 칩 '미조치' (open) / '완료' (resolved) (line 200) verbatim
  - finding borderLeft `3px solid ${status === 'open' ? 'var(--danger)' : 'var(--safe)'}` (line 193)
  - finding 칩 색 — open bg rgba(239,68,68,.15) + var(--danger) / resolved bg rgba(34,197,94,.13) + var(--safe) (또는 status 토큰 치환 OQ #2)
  - sorted findings — status open 먼저, 그 외 createdAt desc (line 147~151) — 운영 룰 변경 금지
  - 조치 textarea placeholder '조치 내용을 입력하세요' (line 325) verbatim
  - 조치 사진 라벨 '조치 사진 (최대 5장)' (line 327) verbatim
  - 조치 완료 button '조치 완료' / '처리 중...' (isSubmitting, line 346) verbatim
  - 지적 정보 섹션 라벨 verbatim — '지적 정보' / '지적 사진' / '조치 내용' / '조치 결과' (line 306, 317, 324, 354)
  - KVRow 라벨 verbatim (지적 정보 4건) — '지적 내용' / '위치' / '등록일' / '등록자' (line 308~311)
  - KVRow 라벨 verbatim (조치 결과 3건) — '조치일시' / '조치자' / '조치 내용' (line 356~358)
  - '위치 미지정' / '사진 없음' (line 202, 318) verbatim
  - 사진 슬롯 64x64 borderRadius 8 objectFit cover + ✕ 18x18 우상단 bg var(--danger)
  - 첨부 button 64x64 borderRadius 8 bg var(--bg3) border 1px dashed var(--bd2) + **'📷' (line 340) → Lucide Camera 교체 후보 (OQ #5)** + '첨부' fontSize 10/600
  - 조치 완료 button width 100% h 40 bg var(--acl) #fff 13/700 borderRadius 10 — solid var(--acl) (또는 §6.4 그라데이션, OQ #4)
  - admin 저장/보고서 button h 28 11/700 borderRadius 6 padding '0 10px' — solid 유지 (작은 도구 버튼)
  - FindingFormSheet 수정 모달 (line 218~224, 자체 fixed/inset 0 오버레이) — 본 wave 미수정
  - PhotoGrid (지적 사진 + 조치 사진, line 318/361) — 본 wave 미수정
  - PhotoSourceModal (카메라/앨범 선택, line 330) — 본 wave 미수정
  - ZIP 다운로드 파일명 `지적사항_${location 안전화}.zip` + 사진 파일명 `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg` — 변경 금지
  - spin keyframe 인라인 (line 291, FindingDetailPanel 로딩) — 변경 금지

- **토큰** (status- prefix 없음 룰):
  - 카드 bg `var(--bg3)` → `bg-surface-sunken`
  - 카드 border 분기 — selectedFindingId 동일 `1.5px solid var(--acl)` → `border-2 border-accent` / 평시 `1px solid var(--bd)` → `border border-border-default`
  - finding **borderLeft status 토큰** (OQ #2): open → `border-l-[3px] border-danger-bar` / resolved → `border-l-[3px] border-safe-bar`
  - finding 칩 색 (OQ #2): open → `bg-danger-bg text-danger` / resolved → `bg-safe-bg text-safe`
  - 결과 select bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary`
  - 결과 저장 button bg `var(--acl)` → `bg-accent` solid (작은 도구 버튼 = solid 유지 권장, 그라데이션 적용은 메인 CTA 한정 OQ #4)
  - 보고서 button bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary` (열기) / `var(--t2)` → `text-text-secondary` (업로드 idle)
  - 다운로드 button bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary`
  - 조치 textarea bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary`
  - 조치 완료 button bg `var(--acl)` → `bg-accent` solid 또는 **§6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)`** (메인 CTA 적용 OQ #4 default 그라데이션)
  - 사진 슬롯 border `var(--bd)` → `border border-border-default`
  - ✕ button bg `var(--danger)` → `bg-danger` (status- prefix 없음 룰) 또는 인라인 유지
  - 첨부 button bg `var(--bg3)` → `bg-surface-sunken`, border `1px dashed var(--bd2)` → `border border-dashed border-border-strong`, color `var(--t3)` → `text-text-tertiary`
  - 사진 라벨 / 섹션 라벨 color `var(--t3)` → `text-text-tertiary`
  - KVRow 라벨 color `var(--t3)` → `text-text-tertiary`, children color `var(--t1)` → `text-text-primary`
  - description color `var(--t1)` → `text-text-primary`, location color `var(--t2)` → `text-text-secondary`, createdAt color `var(--t3)` → `text-text-tertiary`

- **폰트** (design-system §1.1 + §4.2):
  - 10 (finding 카드 status 칩 line 200, 메타 createdAt line 204, 수정/삭제 button line 207/210, 첨부 button line 340) — **§1.1 9·10·11 금지 위반** — 시각 식별 우선시 12 격상 후보 (OQ #3 검토). 칩 10/700 → text-caption(12) leading-none 격상 권장.
  - 11 (ResultBadge line 43, admin 저장/보고서/다운로드 button line 170/173/175/300, finding 카드 location/메타 line 202/204) — **§1.1 위반** — 12 격상 후보 (OQ #3)
  - 12 (관리자 select line 164, 다운로드 button height 28, finding 카드 description metadata, KVRow 라벨 line 73, 섹션 라벨 line 306/317/324/354, 사진 라벨 line 327, 조치 사진 라벨, '사진 없음' line 318) → text-caption(12) leading-none
  - 13 (FindingsPanel description line 199, KVRow children line 74, 조치 textarea fontSize line 325, 조치 완료 button line 346, 빈 '지적사항 없음' line 184 / '항목을 불러오지 못했습니다.' line 292) → text-label
  - 15 (FindingsPanel/FindingDetailPanel 헤더 line 157, 298) → text-body-sm
  - 18 (첨부 button 이모지 line 340 — Lucide 교체 시 size={18}) → 토큰 매핑 없음 (arbitrary)

- **레이아웃**:
  - FindingsPanel: flex column height 100% — 헤더 padding '16px 16px 8px' / 관리자 도구 padding '0 16px 8px' flex gap 6 flex-wrap / 목록 flex 1 overflowY auto padding '0 16px 16px' flex column gap 6
  - FindingDetailPanel: flex 1 overflowY auto padding '16px 20px' — 헤더 marginBottom 16 / 지적 정보 marginBottom 16 / 지적 사진 marginBottom 16 / 조치 입력 (open) borderTop 1px var(--bd) paddingTop 16 / 조치 결과 (resolved) borderTop 1px var(--bd) paddingTop 16
  - 사진 슬롯 flex gap 8 flex-wrap — each 64x64 + 우상단 ✕
  - KVRow flex gap 12 align-start — 라벨 width 64 + children flex 1
  - 조치 textarea rows 3 (lineHeight 1.5) resize vertical
  - 조치 완료 button width 100% h 40 — **터치 마지노선 44px 미달** — OQ #3 격상 후보 (모바일 sub-route 페이지가 별도로 있어 본 패널은 데스크톱 전용 — 데스크톱 40px 룰 일치, 격상 불필요할 수 있음)
  - 모달 (FindingFormSheet) 본 wave 미수정 — 외부 컴포넌트 mount 만

**[W5 — TSX 변환 verify checklist]**

- W2~W4 모든 sketch 의 className/style 인라인 grep 추출 + verbatim 인용 (memory `feedback_planner_prompt_sketch_verbatim`)
- 비즈 anchor 시그니처 1 byte 변경 0 verify gate — useQuery 4종 + useMutation resolveMutation + legalApi 7종 + accentColor + ResultBadge map + filterRounds + TABS (key/label mismatch) + sorted open-first + handleRoundClick (isDesktop 분기) + useMultiPhotoUpload + buildMetaTxt + ZIP 파일명 + toast 카피 11종 + 빈/오류 카피 + @keyframes blink (.6/.3) + spin
- 28-splash W5 + 23-education W5 의 12-섹션 구조 mirror — 산출 파일 헤더 / OQ LOCKED 정리 / Tailwind 매핑 표 / 비즈 anchor 보존 verify / negative gate / positive gate / scope / build / 메모리 룰 cross-ref
- accentColor + ResultBadge status 토큰 매핑 verify (OQ #2 LOCKED) — borderLeft → `border-l-[3px] border-{safe|warning|danger}-bar` / ResultBadge → `bg-{safe|warning|danger}-bg text-{safe|warning|danger}`, status- prefix 없음
- role admin 도구 분기 / handleRoundClick / filterRounds 시그니처 무변 verify (memory `project_inspection_completion_rule` 일반화)
- 모바일 back button 36x36 → 44x44 (OQ #5 LOCKED 시) + Lucide ChevronLeft size={20} 교체 verify + lucide-react import 추가
- 첨부 button '📷' → Lucide Camera size={18} (OQ #5 LOCKED 시) 교체 verify
- 조치 완료 button §6.4 그라데이션 (OQ #4 LOCKED 시) verify — `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 빈/오류 아이콘 추가 (OQ #4 LOCKED 시) verify — Lucide `FolderOpen` 또는 `ClipboardList` (빈) + `AlertCircle` (오류) 또는 무 유지
- ResultBadge alpha 0.13/.15 vs tokens.css safe-bg 0.16 — 시각 차이 확인 후 인라인 유지 / 토큰 채택 LOCKED

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

design-system.md (`cha-bio-safety/docs/redesign-context/19-legal/design-system.md`, v0.1.1, 기준 커밋 c8bfa86) 의 §1.1 / §1.2 / §1.3 / §6.4 / §6.6 / §7 (Iconography) / §7.1 (Lucide) 본문을 각각 별도 fence 블록에 verbatim 박제. §6/§7 미적용 부분은 1줄 메타 동반.

## §3.1 design-system §1.1 노안 친화 (verbatim)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

**적용 메타 (19-legal)**: LegalPage 의 현재 fontSize 매핑 — **10 (finding 카드 status 칩 line 200, 메타 createdAt line 204, 수정/삭제 button line 207/210, 첨부 button line 340)** — §1.1 위반 (9·10·11 금지). **11 (ResultBadge line 43, admin 저장/보고서/다운로드 button line 170/173/175/300, 데스크톱 탭 line 414, finding 카드 location/메타 line 202/204)** — §1.1 위반. 격상 후보 12 (OQ #3 검토). 12 / 13 / 14 / 15 / 16 (모바일 타이틀/카드 title/빈 제목 마지노선). **터치 마지노선 44px** — 모바일 back button **36x36 (line 511 absolute left 12)** = **§1.1 위반** (OQ #5 LOCKED 시 44x44 격상). admin 도구 button h 28 + ResultBadge h ≈ 18~22 + 사진 슬롯 ✕ 18x18 = 모두 도구/배지/장식 패턴이라 §1.1 터치 마지노선 룰 직접 적용 대상 아님. 조치 완료 button width 100% h 40 = 데스크톱 40px 룰 일치 (LegalPage 본문은 데스크톱 전용, 모바일은 sub-route 위임이라 모바일 44px 룰 본 wave 범위 아님).

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

**적용 메타 (19-legal)**: 정보 위계 — 라운드 카드 title 13/700 (var(--t1)) → 메타 11~12/400 (var(--t2)) 2 단계 명확. ResultBadge 11/700 status 색 = 빠른 식별 (§1.4 상태 색 의미 룰 일치). accentColor borderLeft 3px = 카드 좌측 색바로 결과 즉시 인지. finding 카드 borderLeft status 분기 (open danger / resolved safe) + 칩 동시 표시 = 정보 중복이지만 빠른 식별 우선. 장식 0건 (조치 완료 button 만 §6.4 후보).

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

**적용 메타 (19-legal)**: 데스크톱 = **3분할** (좌 500 + 중 500 + 우 flex 1) 마스터-디테일 → "데스크톱이 빽빽한 건 레이아웃이 책임진다" 룰 100% 일치. 모바일 = 단일 컬럼 + sub-route 위임 (FindingsPanel/FindingDetailPanel 은 데스크톱 전용). 폰트 분기 — **데스크톱 탭 11 / 모바일 탭 13** (§1.3 동일 폰트 룰 위반 — 데스크톱이 작음). 데스크톱 카드 title 13 / 모바일 카드 title 14 (1 byte 차이). 데스크톱 연도 select 12 / 모바일 13 (1 byte 차이). spacing 분기는 §1.3 허용 (데스크톱 padding 10/모바일 12, 데스크톱 gap 6/모바일 gap 8) — 룰 일치. 단 폰트 11→13 mismatch 는 OQ #3 격상 후보 (데스크톱 11 → 12 격상).

## §3.4 design-system §6.4 Backgrounds & Gradients (verbatim)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

**적용 메타 (19-legal)**: LegalPage 의 CTA 버튼 = 조치 완료 button (line 346) + admin 저장 button (line 170) + 다운로드 button (line 300) + 모바일 다시 시도 button (line 543) + 데스크톱 재시도 button (line 432). 모두 현재 solid `var(--acl)` — §6.4 그라데이션 적용 후보. **default = 조치 완료 button (메인 CTA) 그라데이션 + 다른 도구 button (저장/보고서/다운로드) solid 유지** (OQ #4). 작은 도구 button 까지 그라데이션 = 시각 잡음 — 메인 CTA 한정. 그라데이션 색은 §6.4 룰 (#1d4ed8, #0ea5e9) 우선. 23-education / 17-annual-plan / 16-workshift / 14-reports W1 OQ #1 그라데이션 default 일관. 단 28-splash W1 OQ #1 은 정반대 (solid 채택) — 사용자 컨펌으로 둘 중 LOCKED. 그 외 모든 배경 = surface 토큰 단색 일치 (그라데이션 0건 확인).

## §3.5 design-system §6.6 Animation (verbatim)

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

**적용 메타 (19-legal)**: SKELETON animation `blink 2s ease-in-out infinite` (line 50) = §6.6 "상태 dot (수신반 이력)" 룰 일치. 인라인 @keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (line 467, 505) — **Education 의 opacity 1/0.4 와 다름 (현재 .6/.3 더 미세)**. 변경 금지. FindingDetailPanel 로딩 spinner `spin .7s linear infinite` (line 291) — §6.6 의 "일반 트랜지션" 범주, 0.7s 는 §6.6 표 미정의 (loading spinner 는 일반 트랜지션과 별개) — 현 상태 보존. 화려한 모션 0건. 모달/시트 진입 트랜지션은 FindingFormSheet (본 wave 미수정) 와 PhotoSourceModal (본 wave 미수정) 가 자체 처리.

## §3.6 design-system §7 Iconography 미적용 메타 + §7.1 Lucide (verbatim)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

**적용 메타 (19-legal)**: LegalPage 본문에 **이모지 1건 — `'📷'` (line 340 첨부 button)** — `feedback_tsx_wave_emoji_dot_gap` 룰 위반. **OQ #5 LOCKED 시 Lucide `Camera size={18}` 교체** (§7.1 Lucide 사용 + 이모지 사용 금지 룰 일치). 모바일 back button 인라인 SVG ChevronLeft (line 512, path `d="M15 19l-7-7 7-7"` strokeWidth 2 size 20) — Education 의 polyline 과 다른 path 포맷 → Lucide `ChevronLeft size={20} color="currentColor"` 교체 후보 (16-workshift / 17-annual-plan / 28-splash / 23-education W1 OQ 일관 LOCKED). FindingDetailPanel 로딩 spinner = 인라인 div + @keyframes spin — Lucide `Loader2` (animate-spin) 교체 후보. **§7.2 카테고리 → Lucide 매핑** = LegalPage 는 점검 카테고리 카드 시스템 아님 (라운드 카드 = 점검 일정 단위) → **미적용 1줄 메타**. **§6.1 Progress Color Rule** / **§6.2 Stat Card Number Color** / **§6.3 카테고리 카드** = LegalPage 에 진척률 도넛/통계 카드/카테고리 카드 모두 없음 → **미적용 1줄 메타** (memory `feedback_tsx_wave_stat_card_drift` 룰 일치). **§7.3 상태/결과 아이콘** = accentColor + ResultBadge 가 색만 사용 (아이콘 없음) — 결과별 아이콘 추가 옵션 (pass `CheckCircle2` / fail `XCircle` / conditional `AlertTriangle` / null `Circle`) — OQ #4 default 아이콘 무 유지 (현 디자인 보존).

---

# §4. 02+06 chrome 통일 룰 적용 여부

`inspection-modal-chrome-rules.md` (`cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md`) 를 읽고 19-legal 의 chrome 적용 여부 정리.

**19-legal 페이지는 소방안전관리자 보수교육 (23-education) 과 달리 점검 시리즈 = 소방 점검 관리 (소방 정기/종합 점검 라운드) → chrome 룰 직접 적용 케이스.** 02 InspectionPage 와 동일한 점검 도메인. inspection-modal-chrome-rules.md 의 각 룰을 1줄씩 적용/미적용 판정 + 적용 룰은 verbatim 인용.

1. **§1 3-Layer 배경 계층** — 본 wave 의 모달 후보 없음 (LegalPage 본 페이지의 데스크톱 3분할 + 모바일 자체 헤더는 모달 chrome 룰 §1 (헤더 page → wrapper raised → 본문 page 3-layer) 와 다른 패턴 — LegalPage 데스크톱 좌/중/우 분할은 borderRight 1px 로만 구분, 3-layer 배경 계층 없음. 모바일 자체 헤더는 bg rgba(22,27,34,0.97) = raised 변형, OQ #1 검토). **본 룰 직접 적용 0건 (LegalPage 페이지 chrome 은 모달 chrome 과 다른 도메인 — 모달 안 chrome 룰 적용은 sub-route 페이지 또는 FindingFormSheet 별도 wave 에서).**

2. **§2 헤더 규칙** — 모바일 자체 헤더 (line 507~515, h 48 + bg rgba(22,27,34,0.97) + back button 36x36 + 타이틀 정중앙) **vs chrome 룰 §2.1 `bg-surface-page border-b border-border-default flex-shrink-0` 통일 룰**. 현재 raised 변형 alpha — OQ #1 default raised 유지 (16-workshift + 17-annual-plan + 02 + 28-splash + 23-education 일관). 단 alpha 0.97 보존 검토. **chrome 룰 §2 헤더 h 48** = 현재 일치. **§2.2 아이콘 size={18}** = 본 페이지 모바일 헤더 아이콘 ChevronLeft size 20 — 별도 모달 size 18 룰과 다른 페이지 chrome 영역이라 직접 적용 X. **§2.3 타이틀** = '소방 점검 관리' 16/700 var(--t1) — chrome 룰 `text-body font-bold text-text-primary truncate` (16) 일치. **§2.4 우측 액션 버튼** = 모바일 헤더는 우측 버튼 없음 (back button 만 좌측 absolute). 데스크톱은 글로벌 AppHeader 가 처리 — 본 페이지 자체 우측 액션 0건.

3. **§3 Zone/카테고리 선택 영역** — LegalPage 본 페이지에 zone/category/floor/line 선택 영역 없음 → 직접 적용 X. **본 wave 범위에서 미적용 (sub-route 페이지 LegalFindingsPage 는 별도 wave 에서 확인 — finding 등록 시 layer/zone 선택 영역 있을 수 있음).**

4. **§4 Floor/Line 가로 스크롤 칩** — 본 페이지에 가로 스크롤 칩 영역 없음 → 직접 적용 X. **본 wave 범위에서 미적용.** 라운드 카드 목록은 세로 flex column (line 427, 538) — 가로 스크롤 칩 패턴 아님.

5. **§5 상태 색 규칙** — 본 페이지의 selected 카드 border `1.5px solid var(--acl)` (line 192, 444) = chrome 룰 `border-[1.5px] border-accent bg-accent text-text-on-accent` 와 다른 패턴 (LegalPage 는 border 만 강조, bg 채움 없음 — 라운드 카드는 list item 이라 활성 시 채움 적용 X). **finding borderLeft danger/safe** (line 193) + **accentColor borderLeft 4분기** (line 445, 555) = chrome 룰 §5 의 "완료 → safe / 비선택 → strong border + page" 룰의 status 의미 적용 케이스 — 결과 status 색 매핑 룰 (memory `feedback_inspection_unresolved_color` 일반화). **§5 룰 일부 적용** (status 색 의미는 일치하지만 selected 시각 패턴은 LegalPage 자체 룰 = border 만 강조 채택).

6. **§6 본문 영역 + 입력칸** — 본 페이지의 본문 = 라운드 카드 목록 + finding 카드 목록. **§6.1 본문 컨테이너** = 모바일 line 538 `flex 1 overflowY auto padding '12px 16px' flex column gap 8` / 데스크톱 좌측 line 427 `flex 1 overflowY auto padding '8px 12px' flex column gap 6` — chrome 룰 `flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5` 와 padding/gap 미세 차이 (디자인 토큰 분기 의도). **§6.2 input/textarea** = 조치 textarea (FindingDetailPanel line 325) `bg var(--bg3) borderRadius 9 padding '10px 12px' border 1px solid var(--bd2) fontSize 13` = chrome 룰 `bg-surface-raised text-text-primary text-label outline-none ...` 부분 일치 (현재 bg-surface-sunken 사용 vs chrome 룰 bg-surface-raised 권장). admin select (line 164) 동일 패턴. **§6 룰 일부 적용** (텍스트 13/label 일치, bg 토큰 차이는 OQ 검토 가능 — 단 본 wave 범위는 outline 만, 토큰 변경은 W5 LOCKED 시점).

7. **§7 06 FloorPlanPage 적용 가이드** — 06 FloorPlanPage 전용 룰 → 본 페이지 미적용. 단 §7.2 의 "뒤로가기 버튼: `w-8 h-8 rounded-sm bg-surface-sunken border border-border-default text-text-secondary` + `<ChevronLeft size={15} />`" 패턴 = 본 페이지 모바일 back button 36x36 inline SVG ChevronLeft 와 비교 가능. **§1.1 터치 마지노선 44px** = 본 페이지 36x36 < 44x44 (OQ #5 격상 후보). chrome 룰 `w-8 h-8` (32px tailwind override) 와도 다름 (memory `feedback_tailwind_w8_h8_is_48px` 함정 — `w-8` = 48px). 본 페이지 36x36 → `w-9 h-9` (36px) 또는 `w-[36px] h-[36px]` arbitrary / 44x44 격상 → `w-11 h-11` 또는 `w-[44px] h-[44px]` arbitrary. **본 룰 부분 적용** (page chrome 의 back button 패턴만 mirror, 36→44 격상은 OQ #5).

**App.tsx 실측 결과 (App.tsx 본문 grep, drift 없음):**

```
line 35: const LegalPage = lazy(() => import('./pages/LegalPage'))
line 71: MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']
line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']                                  // /legal 미등재 → 데스크톱 BottomNav (사이드바) 표시
line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']  // /legal 미등재 → 데스크톱 글로벌 AppHeader 표시
line 98: '/legal': '소방 점검 관리'                                              // PAGE_TITLES 등재
line 117: !location.pathname.match(/^\/legal\/.+/)                              // 특수 navigation guard — sub-route /legal/:id 는 본 페이지와 다른 처리
line 289: <Route path="/legal" element={<Auth><LegalPage /></Auth>} />
line 290: <Route path="/legal/:id" element={<Auth><LegalFindingsPage /></Auth>} />  // sub-route — 본 wave 범위 아님
line 291: <Route path="/legal/:id/finding/:fid" element={<Auth><LegalFindingDetailPage /></Auth>} />  // sub-route — 본 wave 범위 아님
```

**핵심 시사점:**

- 모바일: 자체 헤더만 (line 507~515, h 48 + back button 36x36 + 타이틀), BottomNav 숨김. **36x36 back button 은 §1.1 터치 44px 미달 — OQ #5 LOCKED 시 44x44 격상**.
- 데스크톱: **글로벌 AppHeader 표시 + 자체 헤더 없음 + 사이드바 BottomNav 표시** → sketch 시 데스크톱 시안 상단에 글로벌 AppHeader 영역 + 좌측 사이드바 영역 모두 인지 필요. 23-education / 17-annual-plan 와 동일 패턴.
- **본 wave + W2~W5 모두 LegalPage.tsx 본 페이지만 다룸 — `/legal/:id`, `/legal/:id/finding/:fid` sub-route 페이지 (LegalFindingsPage, LegalFindingDetailPage) 는 별도 wave.**
- **23-education 과 차이**: Education = 보수교육 (점검 시리즈 아님) → chrome 룰 직접 적용 X / Legal = 소방 점검 관리 (점검 시리즈) → chrome 룰 **직접 적용**. 02 InspectionPage 와 동일 도메인.

본 wave + W2~W5 모두 `App.tsx` 손대지 않음 (§6 negative rule).

---

# §5. 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건. 23-education W1 + 28-splash W1 + 17-annual-plan W1 + 16-workshift W1 + 27-login W1 의 10건 + LegalPage 특화 2건 (`feedback_inspection_unresolved_color` accentColor + ResultBadge 결과 status 토큰 일반화 + `project_inspection_completion_rule` role admin 권한 도구 분기 + filterRounds + sorted open-first source of truth 일반화). 각 룰은 슬러그 + 요약 + Why + How (19-legal 컨텍스트) 4 항목.

### 룰 1 — feedback_design_sketch_first
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- **Why**: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적. 디자인 작업의 핵심 룰.
- **How to apply (19-legal)**: W3 라운드 카드 크기 (현재 padding 10/12 borderRadius 10/12) / W4 FindingDetailPanel 사진 슬롯 64x64 + 첨부 button 64x64 + 조치 textarea rows 3 + 조치 완료 button h 40 + admin 도구 button h 28 / 데스크톱 3분할 width 500/500/flex 1 조정도 spacing 손볼 거 있으면 sketch 먼저. 특히 데스크톱 좌 500 width 는 운영 룰 (1:1:1 균등 분할 시 1280 → 426 좁음, 500/500 라스터는 의도된 디자인) — "균등 분할로 좀 바꿔" 인라인 변경 직행 금지.

### 룰 2 — feedback_redesign_sketch_rule_enforcement
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- **Why**: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- **How to apply (19-legal)**: 데스크톱 selected 카드 border `1.5px solid var(--acl)` (line 192, 444) 는 **accent** 색 (활성 강조) — status 임계치 아님. `border-status-safe-bar` 같은 위험 색 사용 금지. 단 **accentColor + ResultBadge 는 결과 status 토큰 사용 정당함** (룰 11 — 결과 = status 토큰 일반화 룰). finding borderLeft (open danger / resolved safe) 도 §6.2 negative rule 의 예외가 아니라 §1.4 상태 색 의미 룰의 정상 적용 케이스.

### 룰 3 — feedback_sketch_realistic_data
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- **Why**: sketch 작성 시 "소방 점검 관리" 같은 타이틀이나 탭 라벨 "진행 중" 을 임의 변경하면 코드 변경 wave 가 deviation 으로 잡힘.
- **How to apply (19-legal)**: 카피 verbatim — '소방 점검 관리' (모바일 헤더 line 514 + App.tsx PAGE_TITLES line 98), '전체' / '진행 중' / '완료' (TABS 라벨, **'미조치' key 가 '진행 중' 라벨 mismatch 의도된 디자인**), '적합' / '부적합' / '조건부적합' / '결과 미입력' (ResultBadge), '미조치' / '완료' (finding 상태 칩), '소방 점검 관리 이력 없음' / '소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.' (모바일 빈), '점검 이력 없음' (데스크톱 좌측 빈), '지적사항 없음' (FindingsPanel 빈), '항목을 불러오지 못했습니다.' (FindingDetailPanel 빈), '목록을 불러오지 못했습니다.' (모바일 오류) / '불러오기 실패' (데스크톱 좌측 오류), '좌측에서 점검을 선택하세요' / '중앙에서 지적사항을 선택하세요' / '점검을 먼저 선택하세요' (데스크톱 fallback), '지적 상세' (FindingDetailPanel 헤더), '지적 정보' / '지적 사진' / '조치 내용' / '조치 결과' (섹션 라벨), '지적 내용' / '위치' / '등록일' / '등록자' (지적 정보 KVRow) / '조치일시' / '조치자' / '조치 내용' (조치 결과 KVRow), '위치 미지정' / '사진 없음', '저장' / '보고서' / '보고서 업로드' / '...' (admin 도구), '다운로드' / '...' (admin), '수정' / '삭제' (finding 액션), '미입력' / '적합' / '부적합' / '조건부적합' (admin 결과 select), '조치 내용을 입력하세요' (textarea placeholder), '조치 사진 (최대 5장)' (사진 라벨), '조치 완료' / '처리 중...' (CTA), '재시도' / '다시 시도' (오류 재시도), `${y}년` (연도 옵션), 메타 verbatim (데스크톱 '·' 사용 + 모바일 '건' 사용 + 모바일 endDate '~' 분기). toast 카피 11종 (success 5 + error 6). 시안에서 변경 금지.

### 룰 4 — feedback_planner_prompt_sketch_verbatim
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
- **Why**: planner 가 sketch 의 토큰명 (예: `bg-surface-raised`) 을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용.
- **How to apply (19-legal)**: W5 TSX 변환 wave 진입 직전 `sketch-wave-2~4.html` 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → `wave-5-tsx-conversion-checklist.md` 안에 verbatim 인용. 특히 ResultBadge rgba 정확히 — `rgba(34,197,94,.13)` (pass) / `rgba(239,68,68,.15)` (fail) / `rgba(245,158,11,.15)` (conditional), finding 칩 rgba — `rgba(239,68,68,.15)` (open) / `rgba(34,197,94,.13)` (resolved), 모바일 헤더 bg `rgba(22,27,34,0.97)`, ✕ 버튼 bg var(--danger), 모바일 헤더 h 48 + back button 36x36 (또는 44x44 OQ #5), 데스크톱 3분할 width 500/500/flex 1, 라운드 카드 데스크톱 padding 10 borderRadius 10 / 모바일 padding 12 borderRadius 12, FindingsPanel 헤더 padding '16px 16px 8px' / 관리자 도구 padding '0 16px 8px' flex gap 6, FindingDetailPanel padding '16px 20px', KVRow 라벨 width 64 + gap 12, 조치 textarea rows 3 borderRadius 9 padding '10px 12px', 사진 슬롯 64x64 borderRadius 8, ✕ 버튼 18x18, 첨부 button 64x64 borderRadius 8, 조치 완료 button h 40 borderRadius 10, admin 도구 button h 28 borderRadius 6, SKELETON height 72, animation `blink 2s ease-in-out infinite` + `spin .7s linear infinite`, @keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (Education .4 와 다름), @keyframes spin `to{transform:rotate(360deg)}`, ZIP 파일명 패턴, 사진 파일명 패턴. 추측 토큰명 사용 시 deviation 유발.

### 룰 5 — feedback_tailwind_token_class_pattern
- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지).
- **Why**: 11-div TSX v3 hotfix(4ce707e) 사고 — `status-` prefix 가 tailwind.config 에 없어서 class 안 먹음. `bg-safe-bar` 가 올바른 패턴.
- **How to apply (19-legal)**: accentColor borderLeft → `border-l-[3px] border-{safe|warning|danger}-bar` / null → `border-l-[3px] border-border-strong` (status- prefix 없음). ResultBadge → `bg-{safe|warning|danger}-bg text-{safe|warning|danger}` / null → `bg-transparent text-text-tertiary` (status- prefix 없음). finding borderLeft → `border-l-[3px] border-{danger|safe}-bar` (open/resolved). finding 상태 칩 → `bg-{danger|safe}-bg text-{danger|safe}`. `bg-status-safe-bg` 사용 시 W5 verify FAIL. 조치 완료 button → `bg-accent` solid 또는 §6.4 그라데이션 (OQ #4) — 토큰 prefix 동일 룰 적용. 모바일 back button → Lucide `ChevronLeft size={20}` prop (OQ #5) — className 으로 `w-5 h-5` 금지 (memory `feedback_tailwind_w8_h8_is_48px` 함정 — `w-5` = 20px arbitrary 확인 필요). 첨부 button → Lucide `Camera size={18}` prop (OQ #5).

### 룰 6 — feedback_tailwind_w8_h8_is_48px
- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- **How to apply (19-legal)**:
  - 모바일 back button 36x36 (line 511) → `w-9 h-9` (36px tailwind 기본 spacing 9) 또는 `w-[36px] h-[36px]` arbitrary. **§1.1 터치 44px 미달 — OQ #5 LOCKED 시 44x44 격상 = `w-11 h-11` 또는 `w-[44px] h-[44px]`**.
  - admin 도구 button h 28 (line 170/173/175/300) = `h-7` (28px tailwind 기본) 또는 `h-[28px]` arbitrary.
  - 사진 슬롯 64x64 (line 334) = `w-16 h-16` (tailwind 기본 spacing 16) 또는 `w-[64px] h-[64px]` arbitrary.
  - ✕ 버튼 18x18 (line 335) = `w-[18px] h-[18px]` arbitrary 필수 (tailwind `w-4.5` 없음).
  - 첨부 button 64x64 (line 339) = `w-16 h-16`.
  - 조치 완료 button h 40 (line 346) = `h-10` (40px tailwind 기본).
  - FindingDetailPanel spinner 24x24 (line 291) = `w-6 h-6` (24px tailwind 기본).
  - SKELETON height 72 (line 50) = `h-[72px]` arbitrary 필수 (tailwind `h-18` 없음).
  - 데스크톱 3분할 width 500 (line 470, 475) = `w-[500px]` arbitrary 필수.
  - 인라인 padding 10 / 12 / 16 / 20 등은 `p-2.5` (10px tailwind override 확인) / `p-3` (12px) / `p-4` (16px) / `px-5 py-4` (20px/16px). tailwind.config spacing override 실측 확인 후 적용.

### 룰 7 — feedback_text_caption_leading_none
- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 헤더 토글/배지/칩 작은 영역은 `leading-none` 명시.
- **Why**: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- **How to apply (19-legal)**:
  - ResultBadge fontSize 11 (padding `2px 8px`, h ≈ 18~22px) → `text-caption font-bold leading-none` (작은 컨테이너 시각 패딩 방지)
  - finding 상태 칩 fontSize 10 (padding `1px 6px`, h ≈ 14~18px) → `text-caption leading-none` (10 → 12 격상 후 leading-none)
  - admin 도구 button fontSize 11 (h 28) → `text-caption font-bold leading-none` (격상 후)
  - finding 메타 createdAt + 수정/삭제 button fontSize 10 (padding `1px 3px`) → `text-caption leading-none` (격상 후)
  - 첨부 button '첨부' fontSize 10 → `text-caption leading-none`
  - 데스크톱 탭 fontSize 11 → `text-caption font-bold leading-none` (격상 후)
  - 메타 모든 11~12 fontSize → leading-none 필수 (작은 컨테이너 패턴)

### 룰 8 — feedback_tsx_wave_emoji_dot_gap
- **요약**: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- **Why**: sketch 의 `🎯` `⬇` 같은 이모지/특수문자 글리프가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 도 자동 적용 안 됨.
- **How to apply (19-legal)**: **LegalPage 본문에 이모지 1건 — `'📷'` (line 340 첨부 button)** — TSX 변환 시 Lucide `Camera size={18}` 교체 필수 (OQ #5 LOCKED 시). 인라인 SVG ChevronLeft (모바일 back button) 도 Lucide `ChevronLeft size={20}` 교체. **메타 dot ' · ' (데스크톱 카드 line 455 / 모바일 카드 line 564)** = string literal dot, sketch 에 `<span>·</span>` 추가 markup 도입 시 W5 변환에 자동 적용 안 됨 — 메타 dot 은 string literal 그대로 보존 (변경 없음). 빈/오류 상태 아이콘 추가 (OQ #4 Lucide `FolderOpen`/`AlertCircle`) 시 점검 페이지 dot span 룰과 별개.

### 룰 9 — feedback_tsx_wave_stat_card_drift
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- **How to apply (19-legal)**: LegalPage 에 Stat Card (28px display 숫자) 없음 → §6.2 Stat Card Number Color 룰 미적용. **§6.3 카테고리 카드 룰 미적용** (LegalPage 는 점검 카테고리 카드 시스템 아님 — 라운드 카드 = 점검 일정 단위). 단 sketch 새 패턴 (예: accentColor 4분기 매트릭스 / ResultBadge 4 라벨 매트릭스 / finding open/resolved 분기 매트릭스 / admin 도구 분기 매트릭스 / 사진 슬롯 0/3/5장 + canAdd 매트릭스 / FindingDetailPanel open/resolved/loading/error 매트릭스) 은 W5 진입 시 verbatim 인용 필수. source LegalPage.tsx 의 인라인 rgba (`rgba(34,197,94,.13)` 등) 가 sketch 의 새 토큰 패턴 (`bg-safe-bg text-safe`) 을 덮어쓰지 않도록 명시 필수. ResultBadge alpha 0.13/0.15 vs tokens.css safe-bg 0.16 미세 차이 — W5 LOCKED 시 시각 비교.

### 룰 10 — feedback_avoid_premature_confirmation
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- **How to apply (19-legal)**: 본 인덱스 작성 완료 후 "§7 OQ 5건 컨펌 부탁" 보고만. "wave 1 완벽 / W2 진입 가능" 같은 자신감 표현 금지. W2~W5 진입 시점도 사용자 컨펌 명시 받은 후에만. sketch 산출 후 "거의 일치 / 잘 됐다" 표현 금지. 특히 ResultBadge / accentColor 색 시각 결과 (pass 녹색 / fail 빨강 / conditional 노랑 / null 회색) + finding borderLeft 색 + 사진 슬롯 5장 매트릭스 + admin 도구 분기 시각 결과는 사용자 판단 영역.

### 룰 11 — feedback_inspection_unresolved_color (★ 19-legal 특화 — accentColor + ResultBadge + finding 칩 결과 status 토큰 일반화)
- **요약**: 미조치 색 = status-fire (주황). 메인 칩 fire / 상세 danger inconsistent. 사용자 인지 = 칩의 fire 색.
- **Why**: 점검 페이지에서 미조치 칩이 fire (주황) 으로 표시되어 사용자가 "위험 임계치 = 칩 색" 패턴 학습. 19-legal 의 accentColor + ResultBadge + finding 상태 칩 모두 동일 패턴 — 결과 4분기 (pass/fail/conditional/null) + finding 2분기 (open/resolved) 색이 사용자 인지의 source of truth.
- **How to apply (19-legal)**: **accentColor 4분기 (pass safe / fail danger / conditional warning / null bd2) + ResultBadge 4 라벨 (적합 / 부적합 / 조건부적합 / 결과 미입력) + finding borderLeft + 칩 2분기 (open danger '미조치' / resolved safe '완료')** — 운영 의미 source of truth. 미조치 점검 fire 칩과 다른 색상 (LegalPage = danger 빨강) 이지만 "결과 = status 토큰" 룰 일반화. status- prefix 없음 룰과 같이 적용 → `border-l-{safe|danger|warning}-bar` / `bg-{safe|danger|warning}-bg text-{safe|danger|warning}`. **4분기 + 4 라벨 + 2분기 1 byte 변경 금지** (OQ #2 LOCKED 후 W3 sketch + W4 sketch + TSX 변환 양쪽 동일 적용). 23-education 의 D-day 임계치 status 토큰 매핑 룰과 동일 패턴 (임계치 vs 카테고리만 다름). 28-splash + 17-annual-plan 의 비즈 anchor 1 byte 0 룰 일반화.

### 룰 12 — project_inspection_completion_rule (★ 19-legal 특화 — role admin 도구 분기 + filterRounds + sorted open-first source of truth 일반화)
- **요약**: 점검 완료 = normal | caution | (bad+resolved). isCpCompleted 가 source of truth. 새 화면/통계는 이 룰 강제.
- **Why**: 점검 완료 정의가 페이지별로 일관되지 않으면 사용자 인지/통계 모두 깨짐. isCpCompleted 헬퍼 = source of truth 룰의 일반화.
- **How to apply (19-legal)**: **(1) role admin 도구 분기 (FindingsPanel select+저장+보고서 line 162 + FindingDetailPanel 다운로드 line 299)** — admin 만 결과 입력/보고서/다운로드 가능. assistant 는 조치 입력+사진+완료 가능. UI/시안에서 권한 분기 변경 금지. (2) **filterRounds 분기 (line 59~63)** — 미조치 = findingCount > resolvedCount / 완료 = findingCount > 0 && === / 전체 = 그대로. 운영 룰 source of truth — UI/시안에서 분기 변경 금지. (3) **sorted findings open-first (line 147~151)** — status 'open' 먼저, 그 외 createdAt desc. 운영 룰 source of truth — UI/시안에서 정렬 변경 금지. (4) **handleRoundClick isDesktop 분기 (line 394~401)** — 데스크톱 setSelectedRoundId / 모바일 navigate sub-route. 본 wave 범위는 LegalPage.tsx 만 (sub-route 페이지 별도 wave). 모두 점검 완료 isCpCompleted 룰의 일반화. (5) **TABS key/label mismatch** ('미조치' key 가 '진행 중' 라벨 line 56) — 의도된 디자인, 변경 시 운영 룰 일관성 파괴. W3 sketch + W4 sketch + W5 TSX 변환 양쪽 동일 적용.

---

# §6. negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **LegalPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/LegalPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src/pages/LegalPage.tsx` 결과 0 줄.
- **외부 컴포넌트/훅 수정 금지** — PhotoGrid.tsx / PhotoSourceModal.tsx / FindingFormSheet.tsx / useMultiPhotoUpload.ts / utils/findingDownload.ts / utils/api.ts (legalApi) / stores/authStore.ts / hooks/useIsDesktop.ts 모두 본 wave + W2~W5 미수정. 시그니처 + props 보존.
- **비즈 로직 시그니처 변경 금지** — useQuery 4종 (`['legal-rounds', year]` / `['legal-round', roundId]` / `['legal-findings', roundId]` / `['legal-finding', roundId, findingId]`) / useMutation resolveMutation / legalApi 7종 (list / get / getFindings / updateResult / deleteFinding / getFinding / resolveFinding) / accentColor 4분기 / ResultBadge map 4 라벨 / filterRounds 3분기 / TABS key/label mismatch / sorted open-first / handleRoundClick isDesktop 분기 / useMultiPhotoUpload 5장 제한 / buildMetaTxt / fflate dynamic import('fflate').zipSync / fmtDate + fmtDateTime / KVRow / SKELETON / @keyframes blink (.6/.3) + spin / IconChevronLeft inline SVG (또는 Lucide 교체 OQ #5) / 첨부 button '📷' (또는 Lucide Camera 교체 OQ #5) 모두 import/export 동일하게 유지.
- **다른 페이지 (13-schedule / 14-reports / 27-login / 16-workshift / 15-daily-report / 17-annual-plan / 28-splash / 23-education / 02 / 06 등) 영향 금지** — `git status` 에 19-legal/ + .planning/quick/260522-sa7-* 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler` (디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler`. `npm run deploy` 는 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 배포만.
- **13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지** — 7 페이지 모두 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 19-legal 도 동일 평면 배치 (`19-legal/sketch-wave-N-{slug}.html`).
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` (line 71, `/legal` 등재) + `DESKTOP_NO_NAV_PATHS` (line 74, `/legal` 미등재) + `DESKTOP_HEADER_HIDE_PATHS` (line 77, `/legal` 미등재 — 데스크톱 글로벌 AppHeader 표시) + `PAGE_TITLES` (line 98, `/legal: '소방 점검 관리'` 등재) + `Route` (line 289) + 특수 regex (line 117 `!location.pathname.match(/^\/legal\/.+/)`) 모두 실측 확인됨. 본 wave + W2~W5 모두 `App.tsx` 손대지 않음.
- **sub-route 페이지 (LegalFindingsPage @ App.tsx line 290 / LegalFindingDetailPage @ line 291) 수정 금지** — 본 wave + W2~W5 범위 아님. 모바일 카드 클릭 → navigate(`/legal/${round.id}`) 시 sub-route 진입은 별도 wave.
- **★ accentColor 4분기 시그니처 변경 금지** — pass → 'var(--safe)' (line 28) / fail → 'var(--danger)' (line 29) / conditional → 'var(--warn)' (line 30) / 그 외 → 'var(--bd2)' (line 31) 모두 1 byte 변경 금지 (memory `feedback_inspection_unresolved_color` 일반화 룰). status- 토큰 치환 (OQ #2 default OK) 시에도 4분기 매핑 보존.
- **★ ResultBadge map 4 라벨 시그니처 변경 금지** — pass = '적합' (line 37) / fail = '부적합' (line 38) / conditional = '조건부적합' (line 39) / null → '결과 미입력' (line 44) 모두 1 byte 변경 금지. rgba 색 + var() 매핑도 OQ #2 토큰 치환 시까지 보존.
- **★ finding 상태 칩 + borderLeft 2분기 변경 금지** — open → borderLeft var(--danger) + 칩 bg rgba(239,68,68,.15) + var(--danger) + '미조치' (line 193, 200) / resolved → borderLeft var(--safe) + 칩 bg rgba(34,197,94,.13) + var(--safe) + '완료'. 1 byte 변경 금지.
- **★ filterRounds 3분기 변경 금지** — 미조치 → findingCount > resolvedCount (line 60) / 완료 → findingCount > 0 && === (line 61) / 전체 → 그대로 (운영 룰 source of truth, memory `project_inspection_completion_rule` 일반화 룰).
- **★ sorted findings open-first 변경 금지** — line 147~151. status 'open' 먼저, 그 외 createdAt desc localeCompare.
- **★ role admin 도구 분기 변경 금지** — FindingsPanel role === 'admin' (line 162) → select+저장+보고서 / FindingDetailPanel staff?.role === 'admin' (line 299) → 다운로드 button. 모두 운영 룰 source of truth — 1 byte 변경 금지.
- **★ TABS key/label mismatch 변경 금지** — '미조치' key 가 '진행 중' 라벨 (line 56). 의도된 디자인. key 변경 시 filterRounds 분기 깨짐 + 라벨 변경 시 사용자 인지 깨짐.
- **★ handleRoundClick isDesktop 분기 변경 금지** — 데스크톱 setSelectedRoundId + setSelectedFindingId(null) / 모바일 navigate(`/legal/${round.id}`) (line 394~401).
- **★ legalApi 7종 시그니처 변경 금지** — list(year) / get(roundId) / getFindings(roundId) / updateResult(roundId, { result?, report_file_key? }) / deleteFinding(roundId, findingId) / getFinding(roundId, findingId) / resolveFinding(roundId, findingId, { resolution_memo, resolution_photo_keys? }) 모두 보존. 특히 snake_case payload (`result`, `report_file_key`, `resolution_memo`, `resolution_photo_keys`) + camelCase props (`roundId`, `findingId`) 혼용 패턴 보존. 본 wave + W2~W5 모두 utils/api.ts 손대지 않음.
- **★ useMultiPhotoUpload 5장 제한 변경 금지** — canAdd = slots.length < 5. 본 wave + W2~W5 미수정.
- **★ buildMetaTxt + ZIP 파일명 패턴 변경 금지** — `지적사항_${(location ?? '').replace(/[\/\\:*?"<>|]/g, '_')}.zip` (line 281) / `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg` (line 275, 277). 본 wave + W2~W5 utils/findingDownload.ts 미수정.
- **toast 카피 verbatim 11종 변경 금지** — success 5 ('점검 결과 저장' / '보고서 업로드 완료' / '삭제됨' / '조치 완료' / '다운로드 완료') + error 6 ('저장 실패' / '업로드 실패' / err?.message ?? '삭제 실패' / '조치 처리 실패' / '다운로드 실패' / '조치 내용을 입력하세요').
- **빈/오류 상태 카피 verbatim 변경 금지** — '소방 점검 관리 이력 없음' / '소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.' / '목록을 불러오지 못했습니다.' / '불러오기 실패' / '점검 이력 없음' / '지적사항 없음' / '항목을 불러오지 못했습니다.' / '좌측에서 점검을 선택하세요' / '중앙에서 지적사항을 선택하세요' / '점검을 먼저 선택하세요' / '위치 미지정' / '사진 없음'.
- **섹션 라벨 + KVRow 라벨 verbatim 변경 금지** — '지적 정보' / '지적 사진' / '조치 내용' / '조치 결과' (섹션) + '지적 내용' / '위치' / '등록일' / '등록자' (지적 정보 KVRow) + '조치일시' / '조치자' / '조치 내용' (조치 결과 KVRow) + '조치 사진 (최대 5장)' (사진 라벨) + '조치 내용을 입력하세요' (textarea placeholder).
- **모바일 헤더 타이틀 '소방 점검 관리' (line 514) verbatim 변경 금지** — App.tsx PAGE_TITLES (line 98) 와 일치 필수.
- **데스크톱 3분할 width 500/500/flex 1 변경 금지** — 의도된 디자인. "균등 분할로 좀 바꿔" 변경 금지 (사용자 컨펌 + sketch wave 진입 필요).
- **@keyframes blink `0%,100%{opacity:.6} 50%{opacity:.3}` (line 467, 505) + @keyframes spin `to{transform:rotate(360deg)}` (line 291) 보존** — Education 의 1/0.4 와 다름. 변경 시 SKELETON 깜빡임 + spinner 회전 깨짐.
- **모바일 헤더 자체 렌더 보존 (line 507~515)** — height 48 + back button 36x36 position absolute left 12 + 타이틀 정중앙 + bg `rgba(22,27,34,0.97)` (raised 변형 alpha). **OQ #5 LOCKED 시 back button 44x44 격상 + Lucide ChevronLeft 교체** — 그 외 변경 금지. 데스크톱은 글로벌 AppHeader 가 처리.
- **PhotoGrid + PhotoSourceModal + FindingFormSheet props 보존** — photoUrls (PhotoGrid) / open + onClose + onCamera + onAlbum (PhotoSourceModal) / scheduleItemId + mode + finding + onClose (FindingFormSheet). 본 wave + W2~W5 미수정.

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 5건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call). 단, "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

- **OQ #1**: 모바일 자체 헤더 배경 `rgba(22,27,34,0.97)` (raised 변형 alpha, line 508) → chrome 룰 §2.1 `bg-surface-page` 통일 vs raised 유지 (alpha 0.97 vs full opacity)?
  - **default 답: raised 유지 + alpha 0.97 보존** (16-workshift W1 OQ #2 LOCKED + 17-annual-plan + 02 InspectionPage + 28-splash + 23-education 5 페이지 일관 패턴). 모바일 헤더 = `bg-surface-raised/97` arbitrary (또는 인라인 유지). 데스크톱 자체 헤더 없음 — 글로벌 AppHeader 가 처리. 본 OQ 적용 시 W2 sketch + TSX 변환 양쪽 동일 적용.

- **OQ #2**: accentColor 4분기 + ResultBadge map + finding 상태 분기 색 — 현재 rgba 인라인 + var() (`rgba(34,197,94,.13)` / `rgba(239,68,68,.15)` / `rgba(245,158,11,.15)` / var(--safe/danger/warn/bd2)). status 토큰 매핑 (`border-l-{safe|warning|danger}-bar` + `bg-{safe|warning|danger}-bg` + `text-{safe|warning|danger}`) 치환?
  - **default 답: 토큰 치환 OK** — status- prefix 없음 룰 (memory `feedback_tailwind_token_class_pattern`). 23-education W1 OQ #2 + 17-annual-plan W1 OQ #2 + 28-splash W1 OQ #4 토큰 치환 default OK 일관. **accentColor 4분기 + ResultBadge 4 라벨 + finding 2분기 모두 1 byte 변경 금지** (룰 11 + §6 negative rule). W3 sketch + W4 sketch + TSX 변환 양쪽 동일 적용. 토큰 치환 후 시각 결과 비교 — ResultBadge alpha 0.13/0.15 vs tokens.css `--status-safe-bg: rgba(34, 197, 94, 0.16)` alpha 0.16 미세 차이 (0.03 차이) → 시각 차이 발생 가능 — 사용자 컨펌 후 인라인 유지 또는 토큰 alpha 조정. null 결과 색 `var(--bd2)` → `border-l-[3px] border-border-strong` 매핑.

- **OQ #3**: §1.1 fontSize 9·10·11 위반 격상 — LegalPage 의 10 (finding 칩/메타/수정/삭제/첨부 button) + 11 (ResultBadge / admin 도구 button / 데스크톱 탭 / finding location-메타) 모두 §1.1 마지노선 위반. **모두 12 격상 vs 인라인 유지**?
  - **default 답: 격상 OK** (§1.1 노안 친화 룰 우선). 11 → text-caption(12) / 10 → text-caption(12). 격상 후 leading-none 명시 (memory `feedback_text_caption_leading_none`). 단 시각 균형 (배지/칩이 너무 커짐) 우려 시 사용자 컨펌으로 일부 인라인 유지 (예: ResultBadge 11 유지 / 다른 11 → 12 격상). 격상 시 padding 조정 (배지/칩 padding 1px 6px → 2px 8px) 동시 검토. 23-education + 16-workshift + 17-annual-plan W1 OQ 비슷한 패턴 (text-body-sm 14 → text-body 16 격상 default) 일관.

- **OQ #4**: 메인 CTA (조치 완료 button line 346) 현재 solid `var(--acl)` → design-system §6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 통일 vs solid 유지? **+ 빈/오류 상태 아이콘 추가** (Lucide `FolderOpen` 빈 / `AlertCircle` 오류) vs 무 유지?
  - **default 답 (CTA)**: **그라데이션 OK** (design-system §6.4 CTA 룰 + 14-reports / 16-workshift / 17-annual-plan / 23-education W1 OQ 그라데이션 default 일관). 그라데이션 색은 §6.4 룰 (#1d4ed8, #0ea5e9) 우선. 메인 CTA 한정 (조치 완료 button) — admin 작은 도구 button (저장/보고서/다운로드 h 28) + 재시도 button + 다시 시도 button 은 **solid 유지** (작은 도구 그라데이션 = 시각 잡음). disabled 시 = `bg-surface-sunken text-text-tertiary cursor-not-allowed` (현재 opacity 0.5 + cursor not-allowed 일관). 사용자 컨펌 결과에 따라 그라데이션 vs solid 둘 중 LOCKED. 28-splash W1 OQ #1 LOCKED 는 정반대 (solid) — 19-legal 은 §6.4 CTA 룰 우선.
  - **default 답 (아이콘)**: **아이콘 무 유지** (현재 카피만 — 17-annual-plan + 16-workshift + 28-splash + 23-education W1 빈/오류 상태 아이콘 무 일관). 단 시각 일관성 강화 옵션으로 빈 상태에 Lucide `FolderOpen size={48} color="var(--t3)"` 또는 `ClipboardList` (점검 의미) + 오류에 Lucide `AlertCircle size={48} color="var(--danger)"` 추가 가능 — **사용자 컨펌으로 채택 가능**.

- **OQ #5**: 아이콘 Lucide 교체 + 모바일 back button 44x44 격상 — (1) 모바일 헤더 back button 인라인 SVG ChevronLeft (line 511~513, path `d="M15 19l-7-7 7-7"` strokeWidth 2 size 20) → Lucide `ChevronLeft size={20}` 교체? + back button **36x36 → 44x44 격상** (§1.1 터치 마지노선 44px 일치)? (2) FindingDetailPanel 첨부 button '📷' 이모지 (line 340) → Lucide `Camera size={18}` 교체? (3) FindingDetailPanel 로딩 spinner div + @keyframes spin (line 291) → Lucide `Loader2` (animate-spin) 교체?
  - **default 답: (1) 교체 + 44x44 격상 OK** (§7.4 "뒤로가기: ChevronLeft" + §1.1 터치 44px + 16-workshift / 17-annual-plan / 28-splash / 23-education W1 OQ Lucide ChevronLeft 교체 LOCKED 일관). back button position absolute left 12 → left 8 또는 left 12 유지 (44 - 36 = 8px 추가 영역, 정중앙 타이틀 영향 없음). **(2) 교체 OK** (이모지 사용 금지 룰 + memory `feedback_tsx_wave_emoji_dot_gap` 일관). Lucide `Camera size={18}` 또는 `Plus size={18}` (첨부 의미). 첨부 button 외곽 64x64 유지, 내부 아이콘만 교체. **(3) 교체 OK** (Lucide `Loader2` + `animate-spin` className — 인라인 div + @keyframes spin 폐기). size={24} 유지 (§7.1 16/20/24 3 종 중 24 일치). 모두 lucide-react import 추가. W2 모바일 chrome sketch + W4 FindingDetailPanel sketch + W5 TSX 변환 양쪽 동일 적용.

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
| 5. src/** 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src/pages/LegalPage.tsx` | 0 lines |
| 6. OQ §7 ≥5 | `grep -cE 'OQ #[1-5]' wave-1-index.md` | ≥5 |
| 7. design-system fence ≥6 (open+close ≥12) | `grep -c '^```' wave-1-index.md` | ≥12 |
| 8. legalApi 7-method anchor ≥7 | `grep -cE 'legalApi\.(list\|get\|getFindings\|updateResult\|deleteFinding\|getFinding\|resolveFinding)' wave-1-index.md` | ≥7 |

모두 PASS 시 본 인덱스가 W2 진입의 단일 진입점으로 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 5건 답변으로 받는다.

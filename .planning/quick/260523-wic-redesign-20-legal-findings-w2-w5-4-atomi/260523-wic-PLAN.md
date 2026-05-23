---
phase: quick-260523-wic
plan: 01
type: execute
wave: 1
depends_on: []
quick_id: 260523-wic
branch: redesign/20-legal-findings (based on redesign/19-legal HEAD, NOT main)
date: 2026-05-23
autonomous: true
files_modified:
  - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html
  - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html
  - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html
  - cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md
requirements:
  - redesign-20-legal-findings-w2-chrome
  - redesign-20-legal-findings-w3-finding-list
  - redesign-20-legal-findings-w4-admin-tools
  - redesign-20-legal-findings-w5-tsx-checklist
must_haves:
  truths:
    - "W2~W4 sketch HTML 3개 + W5 checklist markdown 1개, 총 4 파일이 20-legal-findings/ 직속 평면 배치로 생성된다 (sketch/ 서브폴더 절대 X — 19-legal 40p + 28-splash 2q6 + 23-education o7b + 17-annual-plan 0j3 + 16-workshift + 27-login + 13-schedule + 14-reports 평면 패턴 mirror)"
    - "LegalFindingsPage.tsx (378 lines) + 외부 7 파일 (PhotoGrid / PhotoSourceModal / FindingFormSheet / useMultiPhotoUpload / findingDownload / api / authStore) + App.tsx + 부모 LegalPage + 자식 LegalFindingDetailPage 총 11 src 파일 모두 코드 변경 0 byte (verify gate 마지막 task git diff)"
    - "OQ #1~#5 LOCKED 5건 모두 4 파일 안에 verbatim 반영 — #1 모바일 자체 헤더 bg-surface-raised + border-b border-border-default / #2 finding 2분기 borderLeft 2px (19-legal 3px 와 다름) + 칩 status 토큰 (status- prefix 없음) / #3 fontSize 12 + leading-none 격상 / #4 addButton T3 그라데이션 ≥3 anchor + 작은 도구 solid bg-accent + 빈/오류 카피 verbatim + SKELETON+Spinner 유지 / #5 Lucide ChevronLeft + Loader2 교체 + back 44x44 (w-11 h-11)"
    - "비즈 시그니처 anchor 11건 모두 4 파일 안에 verbatim 박제 — legalApi 4종 (get/getFindings/updateResult/deleteFinding) + useQuery 2종 (['legal-round', id] + ['legal-findings', id]) + invalidateQueries 3 키 + headerTitle 동적 분기 (종합정밀/작동기능 + fmtMonthOnly + '지적사항 목록' fallback) + sortedFindings open-first (createdAt desc localeCompare) + adminBar role admin 조건부 (role === 'admin' && round) + findingCard navigate 자식 페이지 진입 (/legal/:id/finding/:fid) + handleZipDownload iOS PWA <a download> + setTimeout 3000 + ZIP 파일명 round.title 기반 (지적사항_${round?.title ?? 'report'}.zip) + toast 8종 verbatim + @keyframes blink (.6/.3) + spin"
    - "OQ #4 LOCKED T3 (admin-tools) 그라데이션 예외 — T3 sketch 안 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥3 (addButton anchor 3 frame 중 ≥3) + T1/T2/T4 는 linear-gradient 0건"
    - "19-legal 차이 5건 sketch 시각 반영 — (1) 글로벌 chrome 0건 (App.tsx line 117 정규식 매칭 → showNav=false, 자체 헤더만 외곽) (2) 단일 export 378 lines (19-legal 내부 panel 3개 통합과 다름) (3) finding borderLeft 2px (19-legal 3px 와 다름) (4) ZIP 파일명 round.title 기반 (19-legal location 기반과 다름) (5) findingCard 클릭 시 자식 페이지 진입 (19-legal 우측 패널 표시와 다름)"
    - "각 task 마다 atomic git commit 1개씩 — 총 4 commit (executor cherry-pick 사고 6회 precedent 회피용 commit 명령 verbatim 박제, 19-legal 40p + 28-splash 2q6 + 23-education o7b 패턴 동일)"
    - "평면 배치 — 4 파일 모두 cha-bio-safety/docs/redesign-context/20-legal-findings/ 직속 (sketch/ 서브폴더 절대 X)"
    - "negative gate 4 sketch + 1 checklist 모두 통과 (이모지 0 / 9·10·11px 0 / status- prefix 0 / w-8 h-8 0 / 옛 alias 토큰 0)"
    - "W5 checklist 12 섹션 (§1 변환 범위 / §2 비즈 anchor 11건 보존 / §3 변환 매핑 영역 1~3 verbatim / §4 OQ LOCKED 5건 반영 / §5 negative gate (T3 linear-gradient 예외 anchor 명시) / §6 positive gate / §7 build/tsc / §8 자체 verify grep / §9 Tailwind cheatsheet / §10 비즈 보존 체크박스 / §11 메모리 룰 inline 12+ / §12 다음 단계 — 자식 페이지 LegalFindingDetailPage 별도 wave)"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html"
      provides: "모바일 자체 헤더 (Lucide ChevronLeft size={20} + 44x44 격상 OQ #5 + headerTitle 동적 분기 OQ #1) + 데스크톱 타이틀 영역 (글로벌 chrome 0 — 자체 타이틀 + addButton 우측) + 빈/로딩/오류/콘텐츠 4 state (4 frame: 다크 모바일 빈 / 다크 모바일 로딩 / 다크 데스크톱 타이틀 + 빈 / 라이트 모바일 오류) — 글로벌 chrome 0건 시각 박제 + maxWidth 800 데스크톱 + 모바일 고정 하단 CTA paddingBottom calc 회피"
      contains: "data-theme dark+light / bg-surface-page 외곽 / bg-surface-raised 모바일 헤더 (OQ #1 LOCKED) / border-b border-border-default borderBottom / Lucide ChevronLeft size={20} 모바일 back 44x44 (OQ #5 LOCKED, w-11 h-11 또는 arbitrary w-[44px] h-[44px]) / headerTitle 동적 분기 verbatim (종합정밀 2026.05. / 작동기능 2026.04. / 지적사항 목록 fallback) / SKELETON height 88 + @keyframes blink (.6/.3) (Education 88 일치, 19-legal 72 와 다름) / Spinner Lucide Loader2 교체 (OQ #5) / 데스크톱 타이틀 padding '24px 32px 12px' + 22/800 headerTitle + 13 var(--t2) round.title 부제 / addButton 우측 (T3 그라데이션 안 — T1 에서는 solid bg-accent 박제 OK / 안전하게 T3 에서만 그라데이션 박제) / 모바일 빈 '지적사항 없음' + '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' isDesktop 분기 / 모바일 오류 '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (단일 문장, 19-legal 분리 패턴과 다름) / 모바일 고정 하단 CTA placeholder (T3 sketch 에서 채움) / 글로벌 chrome 0건 anchor (App.tsx line 117 정규식 verbatim) / OQ #1 + OQ #5 citation"
      min_lines: 320
    - path: "cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html"
      provides: "finding 카드 목록 시각 (sortedFindings open-first) — finding 2분기 borderLeft 2px + 칩 status 토큰 (OQ #2) + description + 위치 + 메타 + 수정/삭제 액션 (4 frame: 다크 모바일 open / 다크 모바일 resolved / 다크 데스크톱 mixed sorted (open 먼저 + resolved 뒤) / 라이트 데스크톱 mixed) — borderLeft 2px (19-legal 3px 와 다름) 시각 보존 + sortedFindings open-first 정렬 룰"
      contains: "data-theme dark+light / finding 카드 외곽 bg-surface-sunken + border border-border-default + **border-l-2 border-{safe|danger}-bar** (OQ #2 LOCKED — open border-l-2 border-danger-bar / resolved border-l-2 border-safe-bar, **2px 19-legal 3px 와 다름**) / 상태 칩 (open `bg-danger-bg text-danger '미조치'` / resolved `bg-safe-bg text-safe '완료'`) text-caption font-bold leading-none (OQ #3 격상) / status- prefix 없음 (OQ #2) / description 14/500 var(--t1) text-body-sm ellipsis / 위치 fallback '위치 미지정' (line 257 verbatim) / 메타 `${fmtDate(createdAt)} · ${createdByName ?? createdBy}` verbatim (line 259) / 수정/삭제 액션 text-caption leading-none var(--t3) (line 264~266 verbatim) / sortedFindings 정렬 룰 anchor (open 먼저 + createdAt desc localeCompare, line 198~203 verbatim) / findingCard navigate `/legal/${id}/finding/${finding.id}` 자식 페이지 진입 anchor (line 240, 19-legal 우측 패널 표시와 다름) / 비즈 anchor 11건 박제 fence / OQ #2 + OQ #3 citation"
      min_lines: 320
    - path: "cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html"
      provides: "adminBar role admin 도구 + addButton 그라데이션 + 모바일 고정 하단 CTA + ZIP 일괄 다운로드 + 보고서 업로드 (4 frame: 다크 데스크톱 admin role 평시 / 다크 데스크톱 assistant role (adminBar 미렌더) / 다크 모바일 admin role + 고정 하단 CTA / 라이트 데스크톱 admin role + ZIP zipLoading 단계) — **OQ #4 LOCKED addButton 그라데이션 negative gate 예외 anchor ≥3** + role admin 분기 시각 + ZIP 5 단계 텍스트 + 보고서 업로드 분기"
      contains: "data-theme dark+light / adminBar 외곽 (role === 'admin' && round 조건부, line 208) padding '8px 24px' (데스크톱) / '8px 16px' (모바일) bg var(--bg2) borderBottom 1px / select 4 옵션 verbatim ('결과 미입력' / '적합' / '부적합' / '조건부적합', line 220~223) + bg-surface-sunken + border border-border-strong + text-caption font-bold leading-none (OQ #3 격상) / 결과 저장 button '결과 저장' (line 225) bg-accent solid h 36 (OQ #4 작은 도구 solid 유지) / 보고서 button 분기 ('보고서 보기' 열기 / '보고서 업로드' idle / '업로드 중...' uploading, line 228~230) bg-surface-sunken + border border-border-strong / ZIP button (line 232) — `zipLoading 텍스트 || '일괄 다운로드'` + zipLoading 5 단계 verbatim ('준비 중...' / '수집 중... (N/M)' / '압축 중...' / false / idle '일괄 다운로드') + handleZipDownload anchor (fflate dynamic + buildMetaTxt + iOS PWA `<a download>` + setTimeout 3000) + ZIP 파일명 `지적사항_${round?.title ?? 'report'}.zip` (line 184, 19-legal location 기반과 다름) / **addButton 데스크톱 width auto h 36 + 모바일 width 100% h 48 + '+ 지적사항 등록' verbatim (line 289) + 인라인 `style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}` ≥3 박제 (OQ #4 LOCKED 예외 anchor — 데스크톱 타이틀 우측 + 모바일 고정 하단 CTA + admin role frame 별 anchor)** / 모바일 고정 하단 CTA position fixed bottom 0 + paddingBottom 'calc(12px + var(--sab, 0px))' iOS safe-area + zIndex 20 (line 348~356) / assistant role frame (adminBar 미렌더, addButton + finding 등록/수정/삭제만) / 비즈 anchor 11건 박제 fence + ZIP 패턴 + iOS PWA anchor / OQ #4 + OQ #5 citation"
      min_lines: 320
    - path: "cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md"
      provides: "TSX 변환 verify checklist (markdown, 12 섹션) — LegalFindingsPage.tsx 378 lines 단일 atomic 변환 룰 + 비즈 anchor 11건 박제 + Tailwind cheatsheet + 메모리 룰 12건 cross-ref + 자식 페이지 (LegalFindingDetailPage) 별도 wave 명시"
      contains: "§1 변환 범위 (LegalFindingsPage.tsx 단일 atomic 378 lines, 3 영역 통합 — 상단 imports/포맷터 + 메인 함수 + JSX render) / §2 보존 (비즈 anchor 11건 verbatim fence) / §3 변환 매핑 (영역 1~3 verbatim) / §4 OQ LOCKED 5건 반영 매핑 표 / §5 negative gate (T3 linear-gradient 예외 anchor 명시) / §6 positive gate / §7 build/tsc / §8 자체 verify grep 모음 / §9 Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑, 20-legal-findings 적용) / §10 비즈 보존 체크박스 (legalApi 4종 + useQuery 2 + invalidateQueries 3 키 + headerTitle 동적 + sortedFindings open-first + adminBar role admin + findingCard navigate + handleZipDownload iOS PWA + toast 8 + ZIP round.title) / §11 메모리 룰 inline 12+ (feedback_inspection_unresolved_color + project_inspection_completion_rule + feedback_tailwind_w8_h8_is_48px + feedback_tailwind_token_class_pattern + feedback_text_caption_leading_none 등) / §12 다음 단계 (자식 페이지 LegalFindingDetailPage 별도 wave + 부모 LegalPage 의 19-legal 변환 완료 확인)"
      min_lines: 320
  key_links:
    - from: "wave-1-index.md §7 OQ #1 LOCKED (모바일 자체 헤더 bg-surface-raised + border-b border-border-default)"
      to: "sketch-wave-2-chrome.html + wave-5-tsx-conversion-checklist.md"
      via: "모바일 자체 헤더 (line 298~308) = `bg-surface-raised border-b border-border-default` (옛 `rgba(22,27,34,0.97)` 인라인 폐기). height 48 + headerTitle (동적 분기) 정중앙 + back button 44x44 (OQ #5). 19-legal 40p + 16-workshift + 17-annual-plan + 28-splash + 23-education 6 페이지 일관."
      pattern: "bg-surface-raised|border-b border-border-default"
    - from: "wave-1-index.md §7 OQ #2 LOCKED (finding 2분기 borderLeft 2px + 칩 status 토큰, status- prefix 없음)"
      to: "sketch-wave-3-finding-list.html + wave-5-tsx-conversion-checklist.md"
      via: "finding borderLeft 2px (19-legal LegalPage 3px 과 다름 — **본 페이지는 2px 보존**) → open `border-l-2 border-danger-bar` / resolved `border-l-2 border-safe-bar`. 칩 → open `bg-danger-bg text-danger '미조치'` / resolved `bg-safe-bg text-safe '완료'`. 2분기 + 라벨 + 매핑 + 2px 1 byte 변경 금지 (memory `feedback_inspection_unresolved_color` 일반화). **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern`)."
      pattern: "border-l-2 border-(safe|danger)-bar|bg-(safe|danger)-bg text-(safe|danger)"
    - from: "wave-1-index.md §7 OQ #3 LOCKED (§1.1 9·10·11 fontSize 12 격상 + leading-none)"
      to: "sketch-wave-3-finding-list.html + sketch-wave-4-admin-tools.html + wave-5-tsx-conversion-checklist.md"
      via: "finding 칩 11 + adminBar select+button 12 (이미 12) + finding 메타 11 + 수정/삭제 10 모두 → `text-caption font-bold leading-none` (12px) 격상. 19-legal 40p + 23-education + 16-workshift + 17-annual-plan OQ 일관."
      pattern: "text-caption|leading-none"
    - from: "wave-1-index.md §7 OQ #4 LOCKED (addButton T3 그라데이션 ≥3 + 작은 도구 solid + 빈/오류 카피 verbatim + SKELETON+Spinner 유지)"
      to: "sketch-wave-4-admin-tools.html + wave-5-tsx-conversion-checklist.md"
      via: "addButton (line 272~291) = `style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}` 인라인 그라데이션 (T3 만 linear-gradient negative gate 예외 anchor ≥3). adminBar 작은 도구 button (결과 저장/보고서 분기/ZIP h 36) = solid `bg-accent text-text-on-accent` 또는 `bg-surface-sunken border border-border-strong text-text-primary` 유지. 빈 '지적사항 없음' + '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' isDesktop 분기 + 오류 단일 문장 카피 verbatim 유지 (아이콘 X)."
      pattern: "linear-gradient\\(135deg, #1d4ed8, #0ea5e9\\)|bg-accent|지적사항 없음|지적사항 등록"
    - from: "wave-1-index.md §7 OQ #5 LOCKED (Lucide ChevronLeft + Loader2 교체 + back 44x44)"
      to: "sketch-wave-2-chrome.html + wave-5-tsx-conversion-checklist.md"
      via: "모바일 헤더 back button — 인라인 SVG ChevronLeft (line 304, path `d=\"M15 19l-7-7 7-7\"` size 20) → Lucide `<ChevronLeft size={20} />` 교체 + **36x36 → 44x44 격상** (§1.1 터치 마지노선 44px). w-8 함정 회피 → `w-11 h-11` (44px tailwind 기본 spacing 11) 또는 `w-[44px] h-[44px]` arbitrary. Spinner div + @keyframes spin (line 32~39) → Lucide `<Loader2 className=\"animate-spin\" size={24} />` 교체. import 추가: `import { ChevronLeft, Loader2 } from 'lucide-react'`. **Camera 교체 없음** (FindingFormSheet 내부에서 사용, 본 페이지 직접 사용 X)."
      pattern: "ChevronLeft|Loader2|lucide-react"
    - from: "wave-5-tsx-conversion-checklist.md §3 변환 매핑"
      to: "LegalFindingsPage.tsx (변경 0 byte — TSX 변환은 본 PLAN 범위 외, W6 별도 wave)"
      via: "W5 checklist 는 W2~W4 sketch + LegalFindingsPage.tsx 378 lines 단일 atomic 변환 룰 박제 (다음 turn 의 W6 변환 wave 진입점). 본 PLAN 에서는 TSX 변경 0 byte."
      pattern: "LegalFindingsPage.tsx"
    - from: "wave-5-tsx-conversion-checklist.md §11 메모리 룰 inline + §12 다음 단계"
      to: "wave-1-index.md §5 메모리 룰 12건 cross-ref + 자식 페이지 LegalFindingDetailPage 별도 wave"
      via: "feedback_inspection_unresolved_color (finding 2분기 status 토큰 일반화) + project_inspection_completion_rule (adminBar role admin 분기 + sortedFindings open-first source of truth 일반화) + feedback_tailwind_token_class_pattern + feedback_tailwind_w8_h8_is_48px + feedback_text_caption_leading_none + 자식 페이지 LegalFindingDetailPage (App.tsx line 291) 는 본 wave 범위 아님 명시"
      pattern: "feedback_inspection_unresolved_color|project_inspection_completion_rule|LegalFindingDetailPage"
  scope_negatives:
    - "sketch HTML 3개 + checklist md 1개 만 산출. TSX 변환은 W6 별도 wave (본 PLAN 범위 외)"
    - "LegalFindingsPage.tsx + 외부 7 파일 (PhotoGrid / PhotoSourceModal / FindingFormSheet / useMultiPhotoUpload / findingDownload / api / authStore) + App.tsx + 부모 LegalPage + 자식 LegalFindingDetailPage 총 11 src 파일 모두 0 byte 변경 (verify gate 최종 git diff)"
    - "wrangler 명령 절대 X / npm run deploy 절대 X (CLAUDE.local.md + memory `feedback_cbc7119_design_never_wrangler`)"
    - "옛 alias 토큰 (var(--bg/bg2/bg3/bg4/bd/bd2/t1/t2/t3/acl/accent/safe/warn/danger)) sketch 본문 안 0 (tokens.css 정의 인용 fence 안 예외)"
    - "status- prefix 0 (bg-status-safe / text-status-danger 등 사용 시 verify FAIL, OQ #2 위반)"
    - "이모지 0 (sketch 본문 — Lucide 교체 anchor 만 텍스트 인용, '📷' Camera 없음 — FindingFormSheet 내부 담당)"
    - "w-8 / h-8 className 0 (48px 함정, memory `feedback_tailwind_w8_h8_is_48px`)"
    - "9·10·11 fontSize 인라인 0 (text-caption 12 leading-none 마지노선, OQ #3 LOCKED)"
    - "linear-gradient — T1/T2/T4 = 0건 / **T3 만 예외 anchor ≥3** (OQ #4 LOCKED addButton 그라데이션 anchor)"
    - "sketch/ 서브폴더 절대 금지 — 4 파일 모두 20-legal-findings/ 직속 평면 배치"
    - "TSX 변환 wave (W6) 는 별도 turn — 본 PLAN 에서 LegalFindingsPage.tsx 1 byte 도 수정 금지"
    - "자식 페이지 LegalFindingDetailPage (App.tsx line 291) 본 wave + W2~W5 범위 아님 — W5 §12 다음 단계로 명시"
---

<objective>
redesign/20-legal-findings 의 W1 인덱스(`wave-1-index.md`, 724 lines, OQ 5건 default LOCKED 완료 2026-05-23 rgj)를 기반으로
W2~W5 4 sub-wave 산출물을 **단일 quick task** 안에서 **atomic 4 commit** 으로 한 번에 만든다.

- **W2 (T1):** 모바일 자체 헤더 (Lucide ChevronLeft + 44x44 격상 OQ #5 + headerTitle 동적 분기 OQ #1) + 데스크톱 타이틀 영역 (글로벌 chrome 0 — App.tsx line 117 정규식 `^\/legal\/.+` 매칭 → showNav=false, 자체 chrome 이 유일한 외곽) + 빈/로딩/오류/콘텐츠 4 state — 4 frame
- **W3 (T2):** finding 카드 목록 시각 (sortedFindings open-first) — finding 2분기 borderLeft **2px** (19-legal 3px 와 다름) + 칩 status 토큰 (OQ #2 status- prefix 없음) + description + 위치 + 메타 + 수정/삭제 액션 + findingCard navigate 자식 페이지 진입 — 4 frame
- **W4 (T3):** adminBar role admin 도구 (결과 select + 결과 저장 + 보고서 업로드 + ZIP 일괄 다운로드) + addButton (데스크톱 타이틀 우측 + 모바일 고정 하단 CTA) + **OQ #4 LOCKED addButton 그라데이션 ≥3 박제** + handleZipDownload iOS PWA + ZIP 파일명 round.title 기반 — 4 frame (admin 평시 / assistant role / 모바일 admin / 라이트 ZIP 단계)
- **W5 (T4):** TSX 변환 verify checklist markdown (sketch 아님, W2~W4 grep 추출 검증 룰 + 12 섹션 + 비즈 anchor 11건 박제 + LegalFindingsPage.tsx 378 lines 단일 atomic 변환 룰 + 자식 페이지 LegalFindingDetailPage 별도 wave 명시)

**Purpose:** 19-legal 40p / 28-splash 2q6 / 17-annual-plan 0j3 / 16-workshift sjj / 27-login c6p / 14-reports / 13-schedule / 23-education o7b 와 동일한 평면(flat sibling) 패턴으로 20-legal-findings sketch 단계 4 wave 분량을 한 turn 에 처리. LegalFindingsPage 가 378 lines 단일 export (내부 panel 없음, 19-legal LegalPage 의 3개 통합과 다름) + 모바일/데스크톱 useIsDesktop 분기 (≥768px) + 데스크톱 maxWidth 800 중앙 정렬 + 모바일 고정 하단 CTA + role admin 권한 도구 분기 + headerTitle 동적 분기 + sortedFindings open-first + ZIP 일괄 다운로드 (round.title 기반) + finding 클릭 시 자식 페이지 진입 — 본 PLAN 에서 sketch 3 wave + checklist 1 wave 한 번에 처리해 cbc7119-preview 자동 배포 사이클 1회로 사용자 시각 검수 가능하게 함.

**Output:** `cha-bio-safety/docs/redesign-context/20-legal-findings/` 직속 4 파일 (sketch HTML 3개 + checklist md 1개).
`LegalFindingsPage.tsx` (378 lines) + 외부 7 파일 + App.tsx + 부모 LegalPage + 자식 LegalFindingDetailPage **총 11 src 파일 모두** 코드 변경 0 byte (verify gate 마지막 task 에서 확인).

**19-legal 40p PLAN.md mirror:** 본 PLAN 은 19-legal 40p PLAN (1201 lines, 단일 plan / 4 task / atomic 4 commit / verify gate per task) 의 정확한 mirror. 19-legal 과 차이 5건:
- (1) 부모 라우트 `/legal` 의 sub-route `/legal/:id` — App.tsx line 117 정규식 `^\/legal\/.+` 매칭 → 글로벌 chrome 0건 (모바일/데스크톱 모두 showNav=false, 자체 헤더 + 데스크톱 타이틀이 유일한 외곽)
- (2) 단일 export 378 lines (19-legal LegalPage 의 FindingsPanel + FindingDetailPanel + 메인 LegalPage 3개 통합과 다름)
- (3) finding borderLeft **2px** (19-legal 3px 과 다름 — 본 페이지는 2px 보존, OQ #2 LOCKED)
- (4) ZIP 파일명 `지적사항_${round?.title ?? 'report'}.zip` (19-legal location 기반과 다름 — round.title 사용)
- (5) findingCard 클릭 시 자식 페이지 진입 `navigate('/legal/' + id + '/finding/' + finding.id)` (19-legal 우측 패널 표시와 다름 — 본 페이지는 자식 페이지 LegalFindingDetailPage 위임, 본 wave 범위 아님)

**중요 — executor commit 부모 머지 사고 회피:** 19-legal 40p + 16-workshift sjj + 17-annual-plan wmq + 28-splash 2q6 + 23-education o7b 등 다수 quick 에서 executor worktree commit 이 부모 브랜치로 자동 머지 안 되어 cherry-pick 복구 필요했음 (6회 재현). **executor 는 worktree 안에서 `git commit` 후 명시적 보고 필수** (commit hash + message 1줄) + orchestrator 가 필요 시 자동 cherry-pick 으로 복구한다. 본 PLAN 각 task 의 commit 명령은 명시 박제.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.md
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.local.md

# W1 인덱스 (단일 진입점, OQ 5건 default LOCKED 완료 2026-05-23 rgj, 724 lines)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md

# Precedent — 19-legal 40p PLAN.md + 4 산출 파일 (정확한 mirror 소스, 본 PLAN 의 구조 원본)
@/Users/jykevin/Documents/cbc7119-design/.planning/quick/260523-40p-redesign-19-legal-w2-w5-chrome-findingsp/260523-40p-PLAN.md
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-2-chrome.html
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-3-round-card.html
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/19-legal/sketch-wave-4-findings-panel.html
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/19-legal/wave-5-tsx-conversion-checklist.md

# Source TSX (sketch 대상, 변경 0 — 11 파일 모두 untouched)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/LegalFindingsPage.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/App.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/LegalPage.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/utils/api.ts

# 20-legal-findings redesign 컨텍스트 (토큰/타이포 source, design-system v0.1.1)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/20-legal-findings/design-system.md
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/20-legal-findings/tokens.css
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/20-legal-findings/typography.css

# 02+06 chrome 통일 룰 (20-legal-findings = 점검 시리즈 sub-route → 단 App.tsx line 117 showNav=false 특수 케이스)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md
</context>

<rules_verbatim>
### OQ LOCKED 5건 (wave-1-index.md §7 default 답 verbatim, 사용자 "다음 진행" 으로 LOCKED 2026-05-23)

**OQ #1 (모바일 자체 헤더 토큰):**
> LOCKED (2026-05-23): LegalFindingsPage 모바일 자체 헤더 (line 298~308) = `bg-surface-raised border-b border-border-default`. 기존 `rgba(22,27,34,0.97)` (raised 변형 alpha) + `1px solid var(--bd)` 인라인 토큰 완전 폐기. height 48 + headerTitle (동적 분기) 정중앙 + back button 44x44 (OQ #5 격상) + position absolute left 12 → left 8 또는 left 12 유지. W2 sketch 모바일 frame + TSX 변환 양쪽 동일 적용. 19-legal 40p + 16-workshift + 17-annual-plan + 28-splash + 23-education 5 페이지 일관.

**OQ #2 (finding 2분기 borderLeft 2px + 칩 status 토큰, status- prefix 없음):**
> LOCKED (2026-05-23): finding 카드 borderLeft → open `border-l-2 border-danger-bar` / resolved `border-l-2 border-safe-bar` (**borderLeft 2px** — 19-legal LegalPage 의 3px 과 다름, **본 페이지는 2px 보존**). 칩 → open `bg-danger-bg text-danger '미조치'` / resolved `bg-safe-bg text-safe '완료'`. **2분기 + 라벨 + 매핑 + 2px 1 byte 변경 금지** (memory `feedback_inspection_unresolved_color` 일반화). **status- prefix 없음** (`text-status-safe` 같은 패턴 사용 시 W5 verify FAIL, memory `feedback_tailwind_token_class_pattern`). alpha 0.13/0.15 vs tokens.css status 토큰 미세 차이는 tokens.css 값 채택.

**OQ #3 (§1.1 9·10·11 fontSize 12 격상 + leading-none):**
> LOCKED (2026-05-23): finding 칩 11 + finding 메타 11 + 수정/삭제 10 모두 → `text-caption font-bold leading-none` (12px). adminBar select+button 은 이미 12 — leading-none 명시. 격상 후 padding 미세 조정. 14 (description) + 13 (adminBar select fontSize) + 16 (모바일 헤더 + 빈 제목) + 22 (데스크톱 headerTitle) 보존. 19-legal 40p + 23-education + 16-workshift + 17-annual-plan OQ 일관 (§1.1 노안 룰 우선 정신).

**OQ #4 (addButton T3 그라데이션 + 작은 도구 solid + 빈/오류 카피 verbatim + SKELETON+Spinner 유지):**
> LOCKED (2026-05-23): addButton (line 272~291) = `style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}` 인라인 그라데이션 (디자인 강조용, design-system §6.4 CTA 룰 일관). 토큰 채택 X (linear-gradient negative gate 의 **T3 만 예외 anchor ≥3**). adminBar 작은 도구 button (결과 저장/보고서/ZIP h 36) = solid `bg-accent text-text-on-accent` 또는 `bg-surface-sunken border border-border-strong text-text-primary` 유지. disabled = `bg-surface-sunken text-text-tertiary cursor-not-allowed`. 빈 '지적사항 없음' + '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' + 오류 단일 문장 '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' 카피 verbatim 유지 (아이콘 X). SKELETON_STYLE + Spinner 현 상태 박제 (Lucide Loader2 교체는 OQ #5).

**OQ #5 (Lucide ChevronLeft + Loader2 교체 + back button 44x44 격상, Camera 없음):**
> LOCKED (2026-05-23): (1) 모바일 헤더 back button — 인라인 SVG ChevronLeft (line 304, path `d="M15 19l-7-7 7-7"` strokeWidth 2 size 20) → Lucide `<ChevronLeft size={20} />` 교체. **back button 36x36 → 44x44 격상** (§1.1 터치 마지노선 44px). w-8 함정 회피 → `w-11 h-11` (44px tailwind 기본 spacing 11) 또는 `w-[44px] h-[44px]` arbitrary. position absolute left 12 → left 8 또는 left 12 유지. (2) Spinner div + @keyframes spin (line 32~39) → Lucide `<Loader2 className="animate-spin" size={24} />` 교체. import 추가: `import { ChevronLeft, Loader2 } from 'lucide-react'`. **Camera 교체 없음** (FindingFormSheet 내부에서 사용, 본 페이지 직접 사용 X — 19-legal 40p OQ #5 의 Camera 교체와 다름). W2 sketch + TSX 변환 양쪽 동일 적용.

### 디자인 토큰 패턴 (wave-1-index.md §3 + planning constraints verbatim)
- `bg-surface-page` (var(--bg) → --surface-page, 페이지 외곽)
- `bg-surface-raised` (var(--bg2) → --surface-raised, 모바일 헤더 OQ #1 + adminBar 외곽)
- `bg-surface-sunken` (var(--bg3) → --surface-sunken, 카드 + SKELETON + select + 보고서 button + ZIP button)
- `border-border-default` (var(--bd) → --border-default, 카드 평시 + 모바일 헤더 borderBottom + adminBar borderBottom)
- `border-border-strong` (var(--bd2) → --border-strong, select border + 보고서 button border + Spinner border)
- `text-text-primary` (var(--t1) → --text-primary)
- `text-text-secondary` (var(--t2) → --text-secondary)
- `text-text-tertiary` (var(--t3) → --text-tertiary)
- `text-danger` (var(--danger) → --danger)
- `bg-safe-bg text-safe` / `border-safe-bar` (status-safe 토큰, OQ #2 LOCKED resolved, status- prefix 없음)
- `bg-danger-bg text-danger` / `border-danger-bar` (status-danger 토큰, OQ #2 LOCKED open)
- `bg-accent text-text-on-accent` (CTA solid, 결과 저장 button)
- radius: `rounded-sm` 8 / `rounded-md` 12

### Negative rule (모든 task verify gate)
- 이모지 0건 (sketch 본문, '📷' Camera 없음 — FindingFormSheet 내부 담당)
- `linear-gradient` — T1/T2/T4 = 0건 / **T3 만 예외 anchor** (OQ #4 LOCKED addButton 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥3 박제)
- 9&#183;10&#183;11px fontSize 0건 (text-caption 12 leading-none 마지노선, OQ #3 LOCKED)
- `(text|bg|border)-status-` class prefix 0건 (`bg&#8209;status&#8209;safe X`, memory `feedback_tailwind_token_class_pattern`)
- `\b(w|h)-8\b` 0건 (tailwind config w&#8209;8=48 함정, memory `feedback_tailwind_w8_h8_is_48px`)
- 옛 alias 토큰 (`var(--bg)` `var(--bg2)` `var(--bg3)` `var(--bg4)` `var(--bd)` `var(--bd2)` `var(--t1)` `var(--t2)` `var(--t3)` `var(--acl)` `var(--accent)` `var(--safe)` `var(--warn)` `var(--danger)`) 0건 in sketch body (tokens.css 정의 인용 fence 안 예외)

### 평면 폴더 패턴 (13/14/27/16/17/28/23/19 8 페이지 일관)
- 20-legal-findings/ 직속에 4 파일 배치
- `sketch/` 서브폴더 절대 금지

### ★ 비즈 anchor 11건 (1 byte 변경 금지, W2~W5 모두 박제)

**[react-query / 비즈 시그니처]**
1. `useQuery({ queryKey: ['legal-round', id], queryFn: () => legalApi.get(id!), enabled: !!id })` (line 57~62)
2. `useQuery({ queryKey: ['legal-findings', id], queryFn: () => legalApi.getFindings(id!), enabled: !!id, staleTime: 30_000 })` (line 63~68)
3. `queryClient.invalidateQueries` 3 키 — ['legal-round', id] / ['legal-rounds'] / ['legal-findings', id] (handler onSuccess 마다 정확한 키 invalidate 필수)

**[utils/api.ts legalApi 4종]**
4. legalApi 4종 — get(roundId) / getFindings(roundId) / updateResult(roundId, { result?, report_file_key? }) / deleteFinding(roundId, findingId) — snake_case payload + camelCase props 혼용 보존 (note: list / getFinding / resolveFinding 3종은 LegalFindingsPage 미사용)

**[비즈 로직 함수 + 분기]**
5. `headerTitle` (line 120~122): round 있으면 `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}` / 없으면 '지적사항 목록' — **동적 분기 1 byte 변경 금지**
6. `sortedFindings` (line 198~203): status 'open' 먼저 (open === -1, open !== 1, 그 외 createdAt desc localeCompare) — 운영 룰 source of truth (memory `project_inspection_completion_rule` 일반화)
7. `adminBar` 조건부 (line 208): `role === 'admin' && round` — admin 만 결과 select+저장+보고서+ZIP. assistant 미렌더. 운영 룰 (memory `project_inspection_completion_rule` 일반화)
8. `findingCard` onClick (line 240): `navigate('/legal/' + id + '/finding/' + finding.id)` — 자식 페이지 LegalFindingDetailPage 진입. **19-legal LegalPage 의 우측 패널 표시와 다름** — 변경 금지

**[handleZipDownload + iOS PWA + animation + 카피]**
9. `handleZipDownload` (line 138~196): fflate dynamic `import('fflate').zipSync` + buildMetaTxt → 내용.txt always + Promise.allSettled photoKeys/resolutionPhotoKeys + iOS PWA `<a download>` 패턴 (createElement + body.appendChild + click + removeChild + setTimeout(URL.revokeObjectURL, 3000)) + zipLoading 5 단계 ('준비 중...' / '수집 중... (N/M)' / '압축 중...' / false / idle '일괄 다운로드'). ZIP 파일명 `지적사항_${round?.title ?? 'report'}.zip` (line 184, **19-legal location 기반과 다름**). 폴더명 `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\\/\\\\:*?"<>|]/g, '_')}`. 사진 파일명 `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg`. **1 byte 변경 금지** (iOS 안정성 검증된 패턴)
10. `@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }` (line 295) — **19-legal 일치, Education 1/0.4 와 다름** + `@keyframes spin { to{transform:rotate(360deg)} }` (line 36, OQ #5 LOCKED 시 Lucide Loader2 교체)
11. **toast 카피 8종 verbatim**: success 4 — '점검 결과가 저장되었습니다.' / '보고서가 업로드되었습니다.' / '삭제되었습니다' / '다운로드 완료' + error 4 — '저장에 실패했습니다.' / '사진 업로드 실패' / `err?.message ?? '삭제 실패'` / '다운로드에 실패했습니다'. 추가 verbatim 카피 다수 — 모바일 빈 '지적사항 없음' + '현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.' / 오류 단일 문장 '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' / adminBar select 4 옵션 '결과 미입력'/'적합'/'부적합'/'조건부적합' / 결과 저장 '결과 저장' / 보고서 '보고서 보기'/'보고서 업로드'/'업로드 중...' / ZIP zipLoading 5 단계 + '일괄 다운로드' / addButton '+ 지적사항 등록' / finding 상태 칩 '미조치'/'완료' / 위치 fallback '위치 미지정' / 액션 '수정'/'삭제'

### 19-legal 차이 5건 sketch 시각 반영 (W2~W4 sketch + W5 checklist 모두 박제)
1. **글로벌 chrome 0건** — App.tsx line 117 정규식 `^\/legal\/.+` 매칭 → showNav=false. 모바일 BottomNav + 데스크톱 사이드바 + 데스크톱 글로벌 AppHeader 모두 숨김. **자체 헤더 (모바일) + 자체 타이틀 (데스크톱) 이 chrome 의 유일한 외곽**. T1 sketch 데스크톱 frame 에 글로벌 AppHeader 표시 X / 사이드바 표시 X — 자체 타이틀만 박제.
2. **단일 export 378 lines** — 19-legal LegalPage 의 FindingsPanel + FindingDetailPanel + 메인 LegalPage 3개 통합과 다름. W5 checklist §1 변환 범위 = LegalFindingsPage.tsx 단일 atomic 명시.
3. **finding borderLeft 2px** — 19-legal 3px 와 다름. T2 sketch (finding-list) 에서 `border-l-2 border-{safe|danger}-bar` 박제 (3px X). W5 checklist §4 OQ #2 매핑 표에 2px 명시.
4. **ZIP 파일명 round.title 기반** — `지적사항_${round?.title ?? 'report'}.zip` (line 184). 19-legal 의 location 기반 (`지적사항_${location 안전화}.zip`) 과 다름. T3 sketch (admin-tools) 에서 ZIP 패턴 anchor 박제.
5. **findingCard 클릭 시 자식 페이지 진입** — `navigate('/legal/' + id + '/finding/' + finding.id)` (line 240) → LegalFindingDetailPage (App.tsx line 291). 19-legal 의 우측 패널 표시와 다름. T2 sketch (finding-list) 에서 navigate anchor + 자식 페이지 진입 박제. W5 checklist §12 다음 단계에 LegalFindingDetailPage 별도 wave 명시.

### Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑, 20-legal-findings 적용)
| v0.1.1 토큰 | Tailwind utility | 20-legal-findings 적용 위치 |
|---|---|---|
| `--surface-page` | `bg-surface-page` | LegalFindingsPage 외곽 (line 294) |
| `--surface-raised` | `bg-surface-raised` | 모바일 헤더 (line 298, OQ #1) + adminBar 외곽 (line 211) |
| `--surface-sunken` | `bg-surface-sunken` | finding 카드 (line 244) + SKELETON_STYLE (line 25) + select (line 219) + 보고서 button (line 228/230) + ZIP button (line 232) |
| `--border-default` | `border-border-default` | 모바일 헤더 borderBottom + finding 카드 평시 + adminBar borderBottom |
| `--border-strong` | `border-border-strong` | select border + 보고서 button border + ZIP button border + Spinner border |
| `--text-primary` | `text-text-primary` | 모바일 헤더 타이틀 + 데스크톱 headerTitle + finding description + adminBar select 글자 + 빈 제목 |
| `--text-secondary` | `text-text-secondary` | finding 위치 + round.title 부제 + 빈 보조 + 오류 카피 + 보고서 button '보고서 업로드' 글자 |
| `--text-tertiary` | `text-text-tertiary` | finding 메타 + 수정/삭제 액션 |
| `--danger` + rgba(239,68,68,.15) | `bg-danger-bg text-danger` / `border-danger-bar` | finding 칩 open + finding borderLeft open (OQ #2 LOCKED, **2px**) |
| `--safe` + rgba(34,197,94,.13) | `bg-safe-bg text-safe` / `border-safe-bar` | finding 칩 resolved + finding borderLeft resolved (OQ #2 LOCKED, **2px**) |
| `--accent` (acl) solid | `bg-accent text-text-on-accent` | 결과 저장 button (line 225) |
| `--accent` (CTA gradient) | 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` | addButton (line 289, OQ #4 LOCKED **T3 만 예외 anchor ≥3**) |
| (radius 6) | `rounded-sm` | finding 칩 |
| (radius 8) | `rounded-sm` | adminBar select + 결과 저장 + 보고서 button + ZIP button + 데스크톱 addButton |
| (radius 12) | `rounded-md` | finding 카드 + SKELETON + 모바일 addButton |

### 기타 메모리 룰 inline (W5 §11 박제)
- `feedback_inspection_unresolved_color` — finding 2분기 status 토큰 일반화 (OQ #2 LOCKED)
- `project_inspection_completion_rule` — adminBar role admin 도구 분기 + sortedFindings open-first source of truth 일반화
- `feedback_tailwind_token_class_pattern` — status- prefix 없음 + lucide `<Icon size={N} />` prop
- `feedback_tailwind_w8_h8_is_48px` — w&#8209;8/h&#8209;8 = 48px 함정 (back button 44x44 = `w-11 h-11`, OQ #5 LOCKED 격상)
- `feedback_text_caption_leading_none` — 작은 컨테이너 안 text-caption(12) leading-none 명시
- `feedback_sketch_realistic_data` — 표시 분기/라벨 룰 코드 그대로
- `feedback_design_changes_ask_first` — 디자인 변경 전 사용자 컨펌
- `feedback_planner_prompt_sketch_verbatim` — sketch CSS verbatim 인용 (추측 토큰명 금지)
- `feedback_tsx_wave_emoji_dot_gap` — sketch 의 이모지 0건 negative gate
- `feedback_tsx_wave_stat_card_drift` — source outline 패턴 보존 + sketch 새 패턴 누락 방지
- `feedback_subagent_production_deploy_forbidden` — wrangler 명령 절대 X (디자인 wave)
- `feedback_redesign_sketch_rule_enforcement` — §6.2 negative rule (단 결과 status 토큰은 룰 11 예외) + §6.3/§7.1 일관성 강제

### T3 만 linear-gradient 예외 anchor (OQ #4 LOCKED)
- T1 sketch (chrome): `linear-gradient` 0건 — addButton 위치 placeholder 만 (T3 sketch 에서 채움), 또는 solid bg-accent 박제 OK
- T2 sketch (finding-list): `linear-gradient` 0건
- **T3 sketch (admin-tools): `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥3 박제** (addButton 데스크톱 타이틀 우측 + 모바일 고정 하단 CTA + admin role frame 별 anchor ≥3)
- T4 checklist: code fence 안 인용 ≥1
</rules_verbatim>

<tasks>

<task type="auto">
  <name>Task 1 (W2): LegalFindingsPage 모바일 자체 헤더 (Lucide ChevronLeft + 44x44 OQ #5 + headerTitle 동적 분기 OQ #1) + 데스크톱 타이틀 영역 (글로벌 chrome 0) + 빈/로딩/오류 4 state sketch 생성 (4 frame)</name>
  <files>cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html</files>
  <action>
    19-legal/sketch-wave-2-chrome.html 패턴 mirror 로 새 sketch 파일 작성. LegalFindingsPage.tsx 모바일 자체 헤더 (line 298~308) + 데스크톱 타이틀 영역 (line 311~319, 글로벌 chrome 0 — App.tsx line 117 정규식 `^\/legal\/.+` 매칭 → showNav=false) + 빈/로딩/오류 4 state (line 24~29 SKELETON_STYLE / 32~39 Spinner / 326~329 오류 / 338~342 빈) + 인라인 `@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }` (line 295) 시각화. **OQ #1 LOCKED (모바일 헤더 `bg-surface-raised border-b border-border-default`)** + **OQ #4 LOCKED (빈/오류 카피 verbatim + SKELETON+Spinner 유지)** + **OQ #5 LOCKED (Lucide ChevronLeft size={20} + back button 44x44 격상)** 3건이 본 wave 의 핵심.

    **구조 (19-legal 40p W2 mirror, 4 frame):**
    - `<!DOCTYPE html>` + `<html lang="ko">` + `<head><meta charset="utf-8"><title>redesign/20-legal-findings — W2 chrome + empty/loading/error</title>` + `<style>` 블록
    - `<style>` 안: v0.1.1 tokens.css 의 dark+light 양쪽 정의 verbatim 인용 + typography.css 정의 verbatim 인용 + `@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }` 박제 (line 295 anchor) + `@keyframes spin { to{transform:rotate(360deg)} }` (line 36 anchor, Loader2 교체 시 미사용)
    - `<body>` 안 4 frame side-by-side (state 매트릭스):

      | frame | viewport | 시각화 |
      |---|---|---|
      | 1 | 모바일 다크 393×800 빈 상태 | `data-theme="dark"` + bg-surface-page 외곽 + 자체 헤더 (h 48, bg-surface-raised + border-b border-border-default, OQ #1) + Lucide ChevronLeft size={20} back 44x44 (OQ #5, w-11 h-11) + headerTitle '종합정밀 2026.05.' (동적 분기 verbatim) + 빈 '지적사항 없음' (16/700 var(--t1)) + '현장에서 지적된 항목을 등록하려면 아래 버튼을 누르세요.' (isDesktop=false 분기, 12 var(--t2)) — OQ #4 아이콘 무 |
      | 2 | 모바일 다크 393×800 로딩 상태 | `data-theme="dark"` + 동일 헤더 (headerTitle '작동기능 2026.04.') + Spinner (Lucide Loader2 animate-spin size={24} OQ #5 교체) flex center |
      | 3 | 데스크톱 다크 1440×900 콘텐츠 + 빈 상태 (글로벌 chrome 0) | `data-theme="dark"` + **글로벌 AppHeader 표시 X + 사이드바 표시 X** (App.tsx line 117 정규식 박제 fence) + 데스크톱 타이틀 영역 (padding '24px 32px 12px') + headerTitle '종합정밀 2026.05.' 22/800 + round.title '2026 상반기 종합정밀점검' 13 var(--t2) marginTop 4 + 우측 addButton (데스크톱 width auto h 36, solid `bg-accent text-text-on-accent` placeholder — T3 에서 그라데이션 채움) + 콘텐츠 영역 maxWidth 800 중앙 + 빈 'isDesktop 분기 ${isDesktop ? '상단' : '아래'}' = '상단' 박제 |
      | 4 | 모바일 라이트 393×800 오류 상태 | `data-theme="light"` + 동일 헤더 + 단일 문장 오류 '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (line 328, 14 var(--t2), **19-legal 의 분리 패턴과 다름 — 단일 문장**) — OQ #4 |

    **모바일 헤더 마크업 룰 (frame 1/2/4 공통 — OQ #1 + OQ #5):**
    ```html
    <!-- 모바일 자체 헤더 (OQ #1 LOCKED) -->
    <div class="bg-surface-raised border-b border-border-default" style="height:48px;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;">
      <!-- back button (OQ #5 LOCKED: Lucide ChevronLeft size={20} + 44x44 격상, w-11 h-11) -->
      <button class="text-text-primary" style="position:absolute;left:12px;width:44px;height:44px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;" aria-label="Lucide ChevronLeft size={20}, back button 44x44 (w-11 h-11)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <!-- 타이틀 (headerTitle 동적 분기 verbatim — round 있으면 '종합정밀 2026.05.' / 작동기능 2026.04.' / fallback '지적사항 목록') -->
      <span class="text-body font-bold text-text-primary">종합정밀 2026.05.</span>
    </div>
    ```

    **글로벌 chrome 0건 anchor (frame 3 — App.tsx line 117 정규식 verbatim):**
    ```html
    <!-- 데스크톱 외곽: 글로벌 AppHeader 표시 X + 사이드바 표시 X -->
    <!-- App.tsx line 117 verbatim anchor: !location.pathname.match(/^\/legal\/.+/) → showNav=false -->
    <!-- 자체 타이틀 (line 311~319) 만 chrome 의 유일한 외곽 -->
    <div class="bg-surface-page" style="display:flex;flex-direction:column;height:100%;">
      <!-- 데스크톱 타이틀 영역 (line 311~319, padding '24px 32px 12px') -->
      <div style="padding:24px 32px 12px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div style="display:flex;flex-direction:column;gap:4px;">
          <span class="text-headline font-extrabold text-text-primary" style="font-size:22px;line-height:1.2;">종합정밀 2026.05.</span>
          <span class="text-label text-text-secondary">2026 상반기 종합정밀점검</span>
        </div>
        <!-- addButton 데스크톱 (width auto h 36 — T3 에서 그라데이션 채움, T1 에서는 solid placeholder) -->
        <button class="bg-accent text-text-on-accent text-label font-bold rounded-sm" style="height:36px;padding:0 16px;border:none;cursor:pointer;">+ 지적사항 등록</button>
      </div>
      <!-- 콘텐츠 영역 (maxWidth 800 데스크톱 중앙) -->
      <div style="flex:1;overflow-y:auto;padding:16px 32px;max-width:800px;margin:0 auto;width:100%;">
        <!-- 빈 박스 isDesktop 분기 '상단' -->
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:60px 16px;text-align:center;">
          <div class="text-body font-bold text-text-primary">지적사항 없음</div>
          <div class="text-caption leading-none text-text-secondary">현장에서 지적된 항목을 등록하려면 상단 버튼을 누르세요.</div>
        </div>
      </div>
    </div>
    ```

    **Spinner 마크업 룰 (frame 2 로딩 — OQ #5 Lucide Loader2 교체):**
    ```html
    <!-- Spinner (line 32~39 div 폐기 → Lucide Loader2 animate-spin size={24} 교체) -->
    <div style="display:flex;align-items:center;justify-content:center;flex:1;" aria-label="Lucide Loader2 animate-spin size={24}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;color:var(--acl);"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    </div>
    ```

    **오류 상태 마크업 룰 (frame 4 — line 326~329 verbatim, 단일 문장, OQ #4):**
    ```html
    <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:0 24px;text-align:center;">
      <div class="text-body-sm text-text-secondary">목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.</div>
    </div>
    ```

    **카피 verbatim (memory `feedback_sketch_realistic_data`):**
    - headerTitle 동적 분기 verbatim (line 120~122): '종합정밀 2026.05.' / '작동기능 2026.04.' / '지적사항 목록' (fallback)
    - 모바일 빈 제목: '지적사항 없음' (line 340)
    - 모바일 빈 보조 isDesktop=false: '현장에서 지적된 항목을 등록하려면 아래 버튼을 누르세요.' (line 341)
    - 데스크톱 빈 보조 isDesktop=true: '현장에서 지적된 항목을 등록하려면 상단 버튼을 누르세요.' (line 341)
    - 모바일 오류 단일 문장: '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.' (line 328, **19-legal 분리 패턴과 다름**)
    - addButton: '+ 지적사항 등록' (line 289 verbatim)

    **rules 박스 (sketch 하단):**
    - LOCKED 결정: OQ #1 (모바일 자체 헤더 `bg-surface-raised border-b border-border-default`, 옛 `rgba(22,27,34,0.97)` 인라인 폐기) + OQ #4 (빈/오류 카피 verbatim + SKELETON+Spinner 유지 + 아이콘 무) + OQ #5 (Lucide ChevronLeft size={20} 교체 + back button 44x44 격상 = w-11 h-11, Camera 없음) verbatim 인용 1 fence
    - **비즈 anchor 11건 박제 fence** (full list — rules_verbatim 박제 list 그대로 인용)
    - **19-legal 차이 5건 fence** (글로벌 chrome 0 / 단일 export 378 / borderLeft 2px / ZIP round.title / findingCard 자식 진입)
    - **App.tsx line 117 정규식 anchor fence**: `!location.pathname.match(/^\/legal\/.+/)` → showNav=false 박제
    - 토큰 매핑: `var(--bg) → bg-surface-page` / `var(--bg2) → bg-surface-raised` (모바일 헤더 OQ #1) / `var(--bg3) → bg-surface-sunken` (SKELETON) / `var(--bd) → border-border-default` (모바일 헤더 borderBottom) / `var(--bd2) → border-border-strong` (Spinner border) / `var(--t1) → text-text-primary` (헤더 타이틀 + 빈 제목) / `var(--t2) → text-text-secondary` (빈 보조 + 오류 + round.title 부제) / `var(--acl) → bg-accent` (Spinner color + addButton solid)
    - negative gate 자체매칭 회피: "이모지 0 / linear-gradient 0 / 9·10·11px 0 / status- prefix 0 / w-8 h-8 0 / 옛 alias 토큰 0" 메타 줄은 `<code>` fence 안 또는 HTML entity escape

    **commit 명령 (executor 가 실행 후 commit hash + message 보고):**
    ```
    git add cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html
    git commit -m "feat(quick-260523-wic): redesign/20-legal-findings sketch wave 2 (chrome — 모바일 헤더 bg-surface-raised + 데스크톱 타이틀 글로벌 chrome 0 + 빈/로딩/오류 4 state + Lucide ChevronLeft 44x44 + headerTitle 동적 분기 + 비즈 anchor 박제)"
    ```
  </action>
  <verify>
    <automated>
test -f cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html \
  && wc -l cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 200) { print "FAIL: too short"; exit 1 } else print "PASS lines:", $1 }' \
  && grep -c 'data-theme="dark"' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 3) { print "FAIL: dark frame <3"; exit 1 } else print "PASS dark frame:", $1 }' \
  && grep -c 'data-theme="light"' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 1) { print "FAIL: light frame <1"; exit 1 } else print "PASS light frame:", $1 }' \
  && grep -c 'bg-surface-page' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 4) { print "FAIL: bg-surface-page <4"; exit 1 } else print "PASS bg-surface-page:", $1 }' \
  && grep -c 'bg-surface-raised' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 3) { print "FAIL: bg-surface-raised <3 (OQ #1 모바일 헤더)"; exit 1 } else print "PASS bg-surface-raised:", $1 }' \
  && grep -c 'border-b border-border-default' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 3) { print "FAIL: border-b border-border-default <3 (OQ #1)"; exit 1 } else print "PASS border-b:", $1 }' \
  && grep -cE 'Lucide ChevronLeft|<ChevronLeft|ChevronLeft size=' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 3) { print "FAIL: Lucide ChevronLeft anchor <3 (OQ #5)"; exit 1 } else print "PASS Lucide ChevronLeft anchor:", $1 }' \
  && grep -cE 'w-11 h-11|w-\[44px\] h-\[44px\]|width:44px' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 3) { print "FAIL: back button 44x44 anchor <3 (OQ #5)"; exit 1 } else print "PASS 44x44 anchor:", $1 }' \
  && grep -cE 'Loader2|loader2' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 1) { print "FAIL: Lucide Loader2 anchor <1 (OQ #5)"; exit 1 } else print "PASS Loader2 anchor:", $1 }' \
  && grep -cE '종합정밀|작동기능' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 3) { print "FAIL: headerTitle 동적 분기 <3 (종합정밀 + 작동기능)"; exit 1 } else print "PASS headerTitle 동적 분기:", $1 }' \
  && grep -c '지적사항 없음' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 1) { print "FAIL: 빈 제목 missing"; exit 1 } else print "PASS 빈 제목:", $1 }' \
  && grep -cE '상단 버튼|아래 버튼' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 2) { print "FAIL: isDesktop 분기 (상단/아래) <2"; exit 1 } else print "PASS isDesktop 분기:", $1 }' \
  && grep -c '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 1) { print "FAIL: 오류 단일 문장 missing (19-legal 분리 패턴과 다름)"; exit 1 } else print "PASS 오류 단일 문장:", $1 }' \
  && grep -c '지적사항 등록' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 1) { print "FAIL: addButton 카피 missing"; exit 1 } else print "PASS addButton 카피:", $1 }' \
  && grep -c '@keyframes blink' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 1) { print "FAIL: blink keyframes missing"; exit 1 } else print "PASS blink keyframes:", $1 }' \
  && grep -cE 'legalApi|useQuery|headerTitle|sortedFindings|adminBar|findingCard|handleZipDownload|@keyframes blink|role.*admin|toast' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 6) { print "FAIL: 비즈 anchor 11건 박제 hit <6"; exit 1 } else print "PASS 비즈 anchor hits:", $1 }' \
  && grep -cE 'showNav=false|/\\^\\\\/legal' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 1) { print "FAIL: App.tsx line 117 정규식 anchor missing (글로벌 chrome 0건)"; exit 1 } else print "PASS chrome 0 anchor:", $1 }' \
  && grep -cE 'linear-gradient' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 > 0) { print "FAIL: linear-gradient found (T1 T3 만 예외)"; exit 1 } else print "PASS no gradient" }' \
  && grep -cE '(text|bg|border)-status-(safe|fire|warning|danger|caution)' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 > 0) { print "FAIL: status- prefix found"; exit 1 } else print "PASS no status- prefix" }' \
  && grep -v '^<!--' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | grep -v '^#' | grep -cE 'font-size:[[:space:]]*(9|10|11)[^0-9]|fontSize:[[:space:]]*(9|10|11)[^0-9]' | awk '{ if ($1 > 0) { print "FAIL: 9/10/11 px found"; exit 1 } else print "PASS no 9-11px" }' \
  && grep -cE '\bw-8\b|\bh-8\b' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 > 0) { print "FAIL: w-8/h-8 found"; exit 1 } else print "PASS no w-8 h-8" }' \
  && grep -cE 'OQ #1|OQ #4|OQ #5' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html | awk '{ if ($1 < 3) { print "FAIL: OQ #1/#4/#5 citation <3"; exit 1 } else print "PASS OQ citations:", $1 }' \
  && git log --oneline -1 | grep -q '260523-wic.*wave 2' && echo "PASS commit T1"
    </automated>
  </verify>
  <done>
    - sketch-wave-2-chrome.html 파일 존재 + ≥200 lines (≥320 권장)
    - data-theme="dark" ≥3 / data-theme="light" ≥1 (4 frame)
    - bg-surface-page ≥4 / bg-surface-raised (모바일 헤더) ≥3 (OQ #1) / border-b border-border-default ≥3 (OQ #1)
    - Lucide ChevronLeft anchor ≥3 (OQ #5) / back button 44x44 anchor ≥3 (OQ #5) / Loader2 anchor ≥1 (OQ #5)
    - headerTitle 동적 분기 (종합정밀 + 작동기능) ≥3
    - 빈 제목 '지적사항 없음' ≥1 / isDesktop 분기 (상단 + 아래) ≥2
    - 오류 단일 문장 '목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요' ≥1 (19-legal 분리 패턴과 다름)
    - addButton '지적사항 등록' ≥1
    - @keyframes blink anchor ≥1 / 비즈 anchor 11건 박제 hit ≥6
    - 글로벌 chrome 0건 anchor (App.tsx line 117 정규식) ≥1
    - linear-gradient 0건 (T3 만 예외) / status- prefix 0건 / 9·10·11px 0건 / w-8 h-8 0건
    - OQ #1 + OQ #4 + OQ #5 인용 ≥3건
    - atomic commit `feat(quick-260523-wic): redesign/20-legal-findings sketch wave 2 (...)` 1개
  </done>
</task>


<task type="auto">
  <name>Task 2 (W3): LegalFindingsPage finding 카드 목록 sketch (sortedFindings open-first + borderLeft 2px [19-legal 3px 와 다름] + 칩 status 토큰 + findingCard navigate 자식 진입, 4 frame)</name>
  <files>cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html</files>
  <action>
    19-legal/sketch-wave-3-round-card.html + sketch-wave-4-findings-panel.html 패턴 mirror 로 새 sketch 파일 작성. LegalFindingsPage.tsx findingCard 함수 (line 237~269) + sortedFindings (line 198~203) + 콘텐츠 영역 카드 매핑 (line 343) 시각화. **OQ #2 LOCKED (finding 2분기 borderLeft 2px + 칩 status 토큰, status- prefix 없음, **2px 19-legal 3px 와 다름**)** + **OQ #3 LOCKED (§1.1 9·10·11 → 12 격상 + leading-none)** + **findingCard navigate 자식 페이지 진입 anchor (19-legal 우측 패널 표시와 다름)** 3건이 본 wave 의 핵심.

    **구조 (19-legal 40p W3+W4 부분 mirror, 4 frame status 매트릭스):**
    - `<!DOCTYPE html>` + `<head><title>redesign/20-legal-findings — W3 finding list + sorted + navigate</title>` + `<style>` (W2 와 동일)
    - `<body>` 안 4 frame side-by-side:

      | frame | viewport | 시각화 |
      |---|---|---|
      | 1 | 모바일 다크 393×800 open finding | `data-theme="dark"` + 모바일 헤더 + finding 카드 1개 (open: `border-l-2 border-danger-bar` + 칩 `bg-danger-bg text-danger '미조치'` + description '계단실 비상조명등 점등불량' + 위치 '3F 비상계단실' + 메타 '2026.03.15 · 윤종엽' + 수정/삭제) |
      | 2 | 모바일 다크 393×800 resolved finding | `data-theme="dark"` + 동일 chrome + finding 카드 1개 (resolved: `border-l-2 border-safe-bar` + 칩 `bg-safe-bg text-safe '완료'` + 위치 fallback '위치 미지정') |
      | 3 | 데스크톱 다크 1440×900 mixed sorted (open 먼저 + resolved 뒤) | `data-theme="dark"` + 데스크톱 타이틀 + maxWidth 800 + finding 카드 3개 (open 2개 먼저 + resolved 1개 뒤, sortedFindings 정렬 룰 line 198~203 anchor fence + createdAt desc) + findingCard navigate `/legal/${id}/finding/${finding.id}` anchor (line 240 verbatim) |
      | 4 | 라이트 데스크톱 1440×900 mixed | `data-theme="light"` + 동일 mixed sorted (open+resolved 색 시각 검증) |

    **finding 카드 마크업 룰 (line 237~269 verbatim, OQ #2 LOCKED 2px + OQ #3 격상):**
    ```html
    <!-- open finding (sorted 먼저, line 147~151 verbatim 정렬 룰) — borderLeft 2px danger + 칩 '미조치' -->
    <!-- OQ #2 LOCKED: border-l-2 (2px) 19-legal LegalPage 3px 과 다름 — 본 페이지 2px 보존 -->
    <div class="bg-surface-sunken border border-border-default border-l-2 border-danger-bar rounded-md" style="padding:12px;cursor:pointer;display:flex;flex-direction:column;gap:3px;" data-navigate="/legal/abc-123/finding/f-001">
      <!-- 상단 라인: description ellipsis + 상태 칩 -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span class="text-body-sm text-text-primary" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">계단실 비상조명등 점등불량</span>
        <!-- 상태 칩 open (OQ #2: bg-danger-bg text-danger, OQ #3 격상 text-caption leading-none) -->
        <span class="bg-danger-bg text-danger text-caption font-bold leading-none rounded-sm" style="padding:2px 8px;flex-shrink:0;">미조치</span>
      </div>
      <!-- 위치 fallback '위치 미지정' (line 257 verbatim) -->
      <span class="text-caption leading-none text-text-secondary">3F 비상계단실</span>
      <!-- 메타 + 액션 (line 258~267 verbatim) -->
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span class="text-caption leading-none text-text-tertiary">2026.03.15 · 윤종엽</span>
        <div style="display:flex;gap:4px;">
          <button class="text-caption leading-none text-text-tertiary" style="padding:2px 4px;background:none;border:none;cursor:pointer;">수정</button>
          <button class="text-caption leading-none text-text-tertiary" style="padding:2px 4px;background:none;border:none;cursor:pointer;">삭제</button>
        </div>
      </div>
    </div>

    <!-- resolved finding — borderLeft 2px safe + 칩 '완료' -->
    <div class="bg-surface-sunken border border-border-default border-l-2 border-safe-bar rounded-md" style="padding:12px;">
      <!-- 동일 구조 + 칩 `bg-safe-bg text-safe '완료'` + 위치 fallback '위치 미지정' -->
      <span class="bg-safe-bg text-safe text-caption font-bold leading-none rounded-sm" style="padding:2px 8px;">완료</span>
      <span class="text-caption leading-none text-text-secondary">위치 미지정</span>
    </div>
    ```

    **findingCard navigate 자식 페이지 진입 anchor (frame 3 — line 240 verbatim, 19-legal 우측 패널과 다름):**
    ```html
    <!-- findingCard onClick (line 240 verbatim anchor) -->
    <!-- navigate(`/legal/${id}/finding/${finding.id}`) → 자식 페이지 LegalFindingDetailPage (App.tsx line 291) -->
    <!-- 19-legal LegalPage 의 우측 패널 표시와 다름 — 본 페이지는 자식 페이지 위임 -->
    ```

    **sortedFindings 정렬 룰 anchor (frame 3 — line 198~203 verbatim):**
    ```javascript
    // sortedFindings (line 198~203 verbatim anchor)
    const sortedFindings = [...(findings ?? [])].sort((a, b) =>
      a.status === 'open' && b.status !== 'open' ? -1
      : (a.status !== 'open' && b.status === 'open' ? 1
        : b.createdAt.localeCompare(a.createdAt))
    );
    // 운영 룰 source of truth — open 먼저 + 그 외 createdAt desc (memory `project_inspection_completion_rule` 일반화)
    ```

    **카피 + 데이터 verbatim (memory `feedback_sketch_realistic_data`):**
    - description 예시: '계단실 비상조명등 점등불량' / '소화기 압력불량 (재충전)' / '방화셔터 동작불량'
    - 위치 예시: '3F 비상계단실' / '7F 복도' / '위치 미지정' (fallback line 257)
    - 메타 패턴: `${fmtDate(createdAt)} · ${createdByName ?? createdBy}` (line 259 verbatim)
    - finding 상태 칩 verbatim: '미조치' (open) / '완료' (resolved) (line 255)
    - finding 액션 verbatim: '수정' (line 264) / '삭제' (line 265)

    **rules 박스:**
    - LOCKED 결정: OQ #2 (finding 2분기 borderLeft 2px — open `border-l-2 border-danger-bar` / resolved `border-l-2 border-safe-bar`, **2px 19-legal 3px 과 다름** + 칩 status 토큰 — open `bg-danger-bg text-danger '미조치'` / resolved `bg-safe-bg text-safe '완료'`. **status- prefix 없음** + 2분기 + 라벨 + 2px 1 byte 변경 금지) + OQ #3 (§1.1 9·10·11 → 12 격상 + leading-none — 칩 11 + 메타 11 + 수정/삭제 10 모두 `text-caption font-bold leading-none`) verbatim 인용 1 fence
    - **비즈 anchor 11건 박제 fence** (W2 와 동일 list) + sortedFindings 정렬 룰 verbatim + findingCard navigate 자식 진입 anchor
    - **19-legal 차이 5건 fence** (finding borderLeft 2px + findingCard 자식 진입 emphasis)
    - 토큰 매핑: finding 카드 bg `var(--bg3) → bg-surface-sunken` / 평시 border `var(--bd) → border-border-default` / borderLeft open `var(--danger) → border-l-2 border-danger-bar` (**2px**) / borderLeft resolved `var(--safe) → border-l-2 border-safe-bar` (**2px**) / 칩 open `bg-danger-bg text-danger` / 칩 resolved `bg-safe-bg text-safe` / description `var(--t1) → text-text-primary` / 위치 `var(--t2) → text-text-secondary` / 메타 + 수정/삭제 `var(--t3) → text-text-tertiary`
    - negative gate 자체매칭 회피: HTML entity escape

    **commit 명령:**
    ```
    git add cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html
    git commit -m "feat(quick-260523-wic): redesign/20-legal-findings sketch wave 3 (finding-list — sortedFindings open-first + borderLeft 2px [19-legal 3px 와 다름] + 칩 status 토큰 + findingCard navigate 자식 진입 + 비즈 anchor 박제)"
    ```
  </action>
  <verify>
    <automated>
test -f cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html \
  && wc -l cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 200) { print "FAIL: too short"; exit 1 } else print "PASS lines:", $1 }' \
  && grep -c 'data-theme="dark"' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 3) { print "FAIL: dark frame <3"; exit 1 } else print "PASS dark frame:", $1 }' \
  && grep -c 'data-theme="light"' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 1) { print "FAIL: light frame <1"; exit 1 } else print "PASS light frame:", $1 }' \
  && grep -c 'border-l-2 border-danger-bar' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: open borderLeft 2px (border-l-2 border-danger-bar) <2 (OQ #2, 19-legal 3px 와 다름)"; exit 1 } else print "PASS open borderLeft 2px:", $1 }' \
  && grep -c 'border-l-2 border-safe-bar' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: resolved borderLeft 2px (border-l-2 border-safe-bar) <2 (OQ #2)"; exit 1 } else print "PASS resolved borderLeft 2px:", $1 }' \
  && grep -cE 'border-l-3|border-l-\[3px\]' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 > 0) { print "FAIL: 3px borderLeft found (19-legal pattern, 본 페이지 2px)"; exit 1 } else print "PASS no 3px borderLeft (2px 보존)" }' \
  && grep -c 'bg-danger-bg text-danger' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: 칩 open (bg-danger-bg text-danger) <2 (OQ #2)"; exit 1 } else print "PASS 칩 open:", $1 }' \
  && grep -c 'bg-safe-bg text-safe' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: 칩 resolved (bg-safe-bg text-safe) <2 (OQ #2)"; exit 1 } else print "PASS 칩 resolved:", $1 }' \
  && grep -c '미조치' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: 칩 라벨 미조치 <2"; exit 1 } else print "PASS 미조치:", $1 }' \
  && grep -c '완료' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: 칩 라벨 완료 <2"; exit 1 } else print "PASS 완료:", $1 }' \
  && grep -c '위치 미지정' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 1) { print "FAIL: 위치 fallback (위치 미지정) missing"; exit 1 } else print "PASS 위치 fallback:", $1 }' \
  && grep -c '수정' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: 액션 수정 <2"; exit 1 } else print "PASS 수정:", $1 }' \
  && grep -c '삭제' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: 액션 삭제 <2"; exit 1 } else print "PASS 삭제:", $1 }' \
  && grep -c 'bg-surface-sunken' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 4) { print "FAIL: bg-surface-sunken (카드 외곽) <4"; exit 1 } else print "PASS bg-surface-sunken:", $1 }' \
  && grep -cE 'sortedFindings|sorted.*open' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: sortedFindings 정렬 룰 anchor <2"; exit 1 } else print "PASS sortedFindings anchor:", $1 }' \
  && grep -cE 'navigate.*/legal/|/legal/.+/finding/' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: findingCard navigate 자식 페이지 anchor <2 (19-legal 우측 패널과 다름)"; exit 1 } else print "PASS findingCard navigate anchor:", $1 }' \
  && grep -c 'text-caption' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 5) { print "FAIL: text-caption <5 (OQ #3 격상 anchor)"; exit 1 } else print "PASS text-caption:", $1 }' \
  && grep -c 'leading-none' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 5) { print "FAIL: leading-none <5 (OQ #3)"; exit 1 } else print "PASS leading-none:", $1 }' \
  && grep -cE 'legalApi|useQuery|headerTitle|sortedFindings|adminBar|findingCard|handleZipDownload|@keyframes blink|role.*admin|toast' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 6) { print "FAIL: 비즈 anchor 11건 박제 hit <6"; exit 1 } else print "PASS 비즈 anchor hits:", $1 }' \
  && grep -cE 'linear-gradient' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 > 0) { print "FAIL: linear-gradient found (T2 T3 만 예외)"; exit 1 } else print "PASS no gradient" }' \
  && grep -cE '(text|bg|border)-status-(safe|fire|warning|danger|caution)' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 > 0) { print "FAIL: status- prefix found (OQ #2 위반)"; exit 1 } else print "PASS no status- prefix" }' \
  && grep -v '^<!--' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | grep -v '^#' | grep -cE 'font-size:[[:space:]]*(9|10|11)[^0-9]|fontSize:[[:space:]]*(9|10|11)[^0-9]' | awk '{ if ($1 > 0) { print "FAIL: 9/10/11 px found (OQ #3)"; exit 1 } else print "PASS no 9-11px" }' \
  && grep -cE '\bw-8\b|\bh-8\b' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 > 0) { print "FAIL: w-8/h-8 found"; exit 1 } else print "PASS no w-8 h-8" }' \
  && grep -cE 'OQ #2|OQ #3' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html | awk '{ if ($1 < 2) { print "FAIL: OQ #2/#3 citation <2"; exit 1 } else print "PASS OQ citations:", $1 }' \
  && git log --oneline -1 | grep -q '260523-wic.*wave 3' && echo "PASS commit T2"
    </automated>
  </verify>
  <done>
    - sketch-wave-3-finding-list.html 파일 존재 + ≥200 lines (≥320 권장)
    - data-theme="dark" ≥3 / data-theme="light" ≥1 (4 frame status 매트릭스)
    - **finding borderLeft 2px** — border-l-2 border-danger-bar ≥2 (open) / border-l-2 border-safe-bar ≥2 (resolved) (OQ #2)
    - **3px borderLeft 0건** (19-legal pattern, 본 페이지 2px 보존 확인)
    - 칩 토큰 — bg-danger-bg text-danger ≥2 / bg-safe-bg text-safe ≥2 / 라벨 '미조치' ≥2 / '완료' ≥2
    - 위치 fallback '위치 미지정' ≥1
    - 액션 '수정' ≥2 / '삭제' ≥2
    - bg-surface-sunken (카드 외곽) ≥4
    - sortedFindings 정렬 룰 anchor ≥2 / findingCard navigate 자식 페이지 anchor ≥2 (19-legal 우측 패널과 다름)
    - text-caption ≥5 (OQ #3) / leading-none ≥5 (OQ #3)
    - 비즈 anchor 11건 박제 hit ≥6
    - linear-gradient 0건 / **status- prefix 0건 (OQ #2)** / 9·10·11px 0건 / w-8 h-8 0건
    - OQ #2 + OQ #3 인용 ≥2건
    - atomic commit `feat(quick-260523-wic): redesign/20-legal-findings sketch wave 3 (...)` 1개
  </done>
</task>


<task type="auto">
  <name>Task 3 (W4): LegalFindingsPage adminBar role admin 도구 (결과 select + 저장 + 보고서 + ZIP) + addButton 그라데이션 ≥3 + 모바일 고정 하단 CTA sketch 생성 (4 frame, **OQ #4 LOCKED linear-gradient anchor ≥3**)</name>
  <files>cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html</files>
  <action>
    19-legal/sketch-wave-4-findings-panel.html 패턴 mirror 로 새 sketch 파일 작성. LegalFindingsPage.tsx adminBar (line 208~234, role === 'admin' && round 조건부 — 결과 select 4 옵션 + 결과 저장 + 보고서 업로드 분기 + ZIP 일괄 다운로드) + addButton (line 272~291, 데스크톱 타이틀 우측 + 모바일 고정 하단 CTA) + 모바일 고정 하단 CTA (line 348~356, position fixed + paddingBottom calc iOS safe-area) + handleZipDownload (line 138~196, fflate + iOS PWA `<a download>` + setTimeout 3000 + ZIP 파일명 round.title 기반) 시각화. **OQ #4 LOCKED (addButton 인라인 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` ≥3 박제 — T3 만 linear-gradient negative gate 예외 anchor)** + role admin/assistant 분기 + ZIP 5 단계 텍스트 + 보고서 업로드 분기 시각이 본 wave 의 핵심.

    **구조 (19-legal 40p W4 mirror, 4 frame admin/assistant 매트릭스):**
    - `<!DOCTYPE html>` + `<head><title>redesign/20-legal-findings — W4 admin tools + addButton 그라데이션</title>` + `<style>` (W2 와 동일)
    - `<body>` 안 4 frame side-by-side:

      | frame | viewport | 시각화 |
      |---|---|---|
      | 1 | 다크 데스크톱 1440×900 admin role 평시 | `data-theme="dark"` + 데스크톱 타이틀 영역 (headerTitle '종합정밀 2026.05.' + round.title 부제 + **addButton 우측 인라인 그라데이션 OQ #4 LOCKED anchor 1번째**) + adminBar (role === 'admin' && round 조건부 line 208 — 결과 select 4 옵션 '결과 미입력'/'적합'/'부적합'/'조건부적합' + '결과 저장' button solid bg-accent + '보고서 업로드' button bg-surface-sunken border + '일괄 다운로드' button bg-surface-sunken border) + finding 카드 목록 placeholder |
      | 2 | 다크 데스크톱 1440×900 assistant role (adminBar 미렌더) | `data-theme="dark"` + 데스크톱 타이틀 + **addButton 우측 인라인 그라데이션 OQ #4 LOCKED anchor 2번째** + adminBar 미렌더 (role !== 'admin' 분기) + finding 카드 목록 (finding 등록/수정/삭제는 모든 사용자 가능) |
      | 3 | 다크 모바일 393×800 admin role + 고정 하단 CTA | `data-theme="dark"` + 모바일 헤더 + adminBar (모바일 padding '8px 16px') + finding 카드 목록 (paddingBottom 'calc(72px + var(--sab, 0px))' 회피) + **모바일 고정 하단 CTA position fixed bottom 0 + addButton width 100% h 48 인라인 그라데이션 OQ #4 LOCKED anchor 3번째** + paddingBottom 'calc(12px + var(--sab, 0px))' iOS safe-area + zIndex 20 |
      | 4 | 라이트 데스크톱 1440×900 admin + ZIP zipLoading 단계 + 보고서 업로드 분기 | `data-theme="light"` + 데스크톱 타이틀 + **addButton 우측 인라인 그라데이션 OQ #4 LOCKED anchor 4번째 (≥3 충족)** + adminBar (결과 select 'fail' 선택 + '결과 저장' + '보고서 보기' (열기 — reportFileKey 있음) + ZIP zipLoading '수집 중... (2/5)' 표시) + ZIP 파일명 `지적사항_${round?.title ?? 'report'}.zip` anchor fence + iOS PWA `<a download>` 패턴 anchor fence (line 182~188 verbatim) |

    **adminBar 마크업 룰 (frame 1/3/4 — line 208~234 verbatim, OQ #3 격상):**
    ```html
    <!-- adminBar (role === 'admin' && round 조건부, line 208) -->
    <div class="bg-surface-raised border-b border-border-default" style="padding:8px 24px;display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap;">
      <!-- 결과 select 4 옵션 (line 219~224 verbatim, OQ #3 격상 13 → text-caption 12 leading-none 또는 13 유지) -->
      <select class="bg-surface-sunken border border-border-strong text-label text-text-primary rounded-sm" style="padding:6px 12px;appearance:none;-webkit-appearance:none;">
        <option value="">결과 미입력</option>
        <option value="pass">적합</option>
        <option value="fail">부적합</option>
        <option value="conditional">조건부적합</option>
      </select>
      <!-- 결과 저장 button (line 225 verbatim, OQ #4 작은 도구 solid bg-accent 유지) -->
      <button class="bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm" style="height:36px;padding:0 12px;border:none;cursor:pointer;flex-shrink:0;">결과 저장</button>
      <!-- 보고서 button 분기 (line 227~231) — reportFileKey 있으면 '보고서 보기' 열기 / 없으면 '보고서 업로드' / '업로드 중...' -->
      <button class="bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm" style="height:36px;padding:0 12px;cursor:pointer;flex-shrink:0;">보고서 업로드</button>
      <!-- ZIP button (line 232 verbatim, zipLoading 텍스트 || '일괄 다운로드') -->
      <button class="bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm" style="height:36px;padding:0 12px;cursor:pointer;white-space:nowrap;flex-shrink:0;">일괄 다운로드</button>
    </div>
    ```

    **addButton 마크업 룰 — 데스크톱 (OQ #4 LOCKED 인라인 그라데이션 ≥3 anchor 1):**
    ```html
    <!-- addButton 데스크톱 (line 272~291 verbatim, width auto h 36 — OQ #4 LOCKED 인라인 그라데이션) -->
    <button class="text-text-on-accent text-label font-bold rounded-sm" style="height:36px;padding:0 16px;border:none;cursor:pointer;flex-shrink:0;background:linear-gradient(135deg, #1d4ed8, #0ea5e9);">+ 지적사항 등록</button>
    ```

    **addButton 마크업 룰 — 모바일 고정 하단 CTA (OQ #4 LOCKED 인라인 그라데이션 ≥3 anchor 2):**
    ```html
    <!-- 모바일 고정 하단 CTA (line 348~356 verbatim, position fixed + iOS safe-area + zIndex 20) -->
    <div class="bg-surface-page border-t border-border-default" style="position:fixed;bottom:0;left:0;right:0;padding:12px 16px;padding-bottom:calc(12px + var(--sab, 0px));z-index:20;">
      <!-- addButton 모바일 (width 100% h 48 — OQ #4 LOCKED 인라인 그라데이션) -->
      <button class="text-text-on-accent text-body-sm font-bold rounded-md" style="width:100%;height:48px;border:none;cursor:pointer;background:linear-gradient(135deg, #1d4ed8, #0ea5e9);">+ 지적사항 등록</button>
    </div>
    ```

    **handleZipDownload anchor fence (frame 4 — line 138~196 verbatim, 19-legal location 기반과 다름):**
    ```javascript
    // handleZipDownload (line 138~196 verbatim anchor)
    // ZIP 파일명 (line 184): `지적사항_${round?.title ?? 'report'}.zip` (19-legal LegalPage 의 location 기반과 다름)
    // 사진 파일명 (line 161, 171): `지적사진-${j+1}.jpg` / `조치사진-${j+1}.jpg`
    // 폴더명 (line 149): `finding-${idx zero-padded 3}_${(location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')}`
    // 내용.txt (line 153): encoder.encode(buildMetaTxt(f)) — 사진 0건이어도 always 포함
    // iOS PWA `<a download>` 패턴 (line 182~188 verbatim):
    //   const a = document.createElement('a');
    //   a.href = url; a.download = filename;
    //   document.body.appendChild(a); a.click(); document.body.removeChild(a);
    //   setTimeout(() => URL.revokeObjectURL(url), 3000);
    // zipLoading 5 단계 verbatim: '준비 중...' / '수집 중... (N/M)' / '압축 중...' / false / idle '일괄 다운로드'
    // 1 byte 변경 금지 (iOS 안정성 검증된 패턴)
    ```

    **카피 verbatim (memory `feedback_sketch_realistic_data`):**
    - adminBar select 4 옵션 (line 220~223): '결과 미입력' / '적합' / '부적합' / '조건부적합'
    - 결과 저장 button: '결과 저장' (line 225 verbatim)
    - 보고서 button 분기: '보고서 보기' (열기, line 228) / '보고서 업로드' (idle, line 230) / '업로드 중...' (uploading)
    - ZIP button: `zipLoading 텍스트 || '일괄 다운로드'` (line 232)
    - zipLoading 5 단계 verbatim: '준비 중...' / '수집 중... (N/M)' / '압축 중...' / false / idle '일괄 다운로드'
    - addButton: '+ 지적사항 등록' (line 289 verbatim, 데스크톱 + 모바일 양쪽 동일)
    - toast.success: '점검 결과가 저장되었습니다.' / '보고서가 업로드되었습니다.' / '삭제되었습니다' / '다운로드 완료'
    - toast.error: '저장에 실패했습니다.' / '사진 업로드 실패' / `err?.message ?? '삭제 실패'` / '다운로드에 실패했습니다'

    **rules 박스:**
    - LOCKED 결정: **OQ #4 (addButton 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` — T3 만 linear-gradient negative gate 예외 anchor ≥3 박제, 결과 저장 = solid bg-accent + 보고서 button / ZIP button = bg-surface-sunken border 유지)** + role admin/assistant 분기 (adminBar role === 'admin' && round 조건부 line 208, assistant 는 adminBar 미렌더 — finding 등록/수정/삭제는 모든 사용자 가능) verbatim 인용 1 fence
    - **비즈 anchor 11건 박제 fence** + handleZipDownload + iOS PWA `<a download>` + ZIP round.title + buildMetaTxt + fflate + toast 8종 emphasis
    - **19-legal 차이 5건 fence** (글로벌 chrome 0 + ZIP round.title 기반 emphasis)
    - 토큰 매핑: adminBar bg `var(--bg2) → bg-surface-raised` + borderBottom `var(--bd) → border-border-default` / select bg `var(--bg3) → bg-surface-sunken` + border `var(--bd2) → border-border-strong` / 결과 저장 button `var(--acl) → bg-accent` solid / 보고서 button + ZIP button bg `var(--bg3) → bg-surface-sunken` + border `var(--bd2) → border-border-strong` / **addButton 인라인 그라데이션 OQ #4 LOCKED (T3 만 예외)** / 모바일 고정 하단 CTA bg `var(--bg) → bg-surface-page` + borderTop `var(--bd) → border-t border-border-default`
    - negative gate 자체매칭 회피: fence escape — 단 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 그라데이션 본문 ≥3 박제 (OQ #4 LOCKED 예외)

    **commit 명령:**
    ```
    git add cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html
    git commit -m "feat(quick-260523-wic): redesign/20-legal-findings sketch wave 4 (admin-tools — adminBar role admin 분기 + addButton 그라데이션 ≥3 + 모바일 고정 하단 CTA + ZIP iOS PWA + ZIP round.title + 비즈 anchor 박제)"
    ```
  </action>
  <verify>
    <automated>
test -f cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html \
  && wc -l cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 200) { print "FAIL: too short"; exit 1 } else print "PASS lines:", $1 }' \
  && grep -c 'data-theme="dark"' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 3) { print "FAIL: dark frame <3"; exit 1 } else print "PASS dark frame:", $1 }' \
  && grep -c 'data-theme="light"' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 1) { print "FAIL: light frame <1"; exit 1 } else print "PASS light frame:", $1 }' \
  && grep -cE 'linear-gradient\(135deg,\s*#1d4ed8,\s*#0ea5e9\)' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 3) { print "FAIL: addButton 그라데이션 anchor <3 (OQ #4 LOCKED T3 만 예외 ≥3)"; exit 1 } else print "PASS 그라데이션 anchor:", $1 }' \
  && grep -c '결과 미입력' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 1) { print "FAIL: select 옵션 결과 미입력 missing"; exit 1 } else print "PASS 결과 미입력:", $1 }' \
  && grep -c '적합\|부적합\|조건부적합' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 3) { print "FAIL: select 4 옵션 verbatim <3"; exit 1 } else print "PASS select 옵션:", $1 }' \
  && grep -c '결과 저장' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 1) { print "FAIL: 결과 저장 button missing"; exit 1 } else print "PASS 결과 저장:", $1 }' \
  && grep -cE '보고서 업로드|보고서 보기' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 1) { print "FAIL: 보고서 button 분기 missing"; exit 1 } else print "PASS 보고서 button:", $1 }' \
  && grep -c '일괄 다운로드' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 1) { print "FAIL: ZIP button 일괄 다운로드 missing"; exit 1 } else print "PASS 일괄 다운로드:", $1 }' \
  && grep -cE '준비 중|수집 중|압축 중' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 2) { print "FAIL: zipLoading 5 단계 텍스트 <2"; exit 1 } else print "PASS zipLoading 단계:", $1 }' \
  && grep -c '지적사항 등록' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 3) { print "FAIL: addButton 카피 <3 (데스크톱 3 frame + 모바일 1 frame)"; exit 1 } else print "PASS addButton 카피:", $1 }' \
  && grep -cE 'position:fixed|position: fixed' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 1) { print "FAIL: 모바일 고정 하단 CTA position fixed missing"; exit 1 } else print "PASS position fixed:", $1 }' \
  && grep -cE 'calc\(12px \+ var\(--sab|paddingBottom.*calc.*sab' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 1) { print "FAIL: iOS safe-area paddingBottom calc missing"; exit 1 } else print "PASS iOS safe-area:", $1 }' \
  && grep -cE '지적사항_\$\{round\?\.title|round\?\.title \?\? .report' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 1) { print "FAIL: ZIP 파일명 round.title 기반 anchor missing (19-legal location 기반과 다름)"; exit 1 } else print "PASS ZIP round.title:", $1 }' \
  && grep -cE '<a download|createElement.*a.*download|URL\.revokeObjectURL' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 1) { print "FAIL: iOS PWA <a download> 패턴 anchor missing"; exit 1 } else print "PASS iOS PWA anchor:", $1 }' \
  && grep -cE "role === 'admin'|role.*admin.*round|adminBar.*조건부" cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 1) { print "FAIL: role admin 분기 anchor missing"; exit 1 } else print "PASS role admin 분기:", $1 }' \
  && grep -cE 'legalApi|useQuery|headerTitle|sortedFindings|adminBar|findingCard|handleZipDownload|@keyframes blink|role.*admin|toast' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 6) { print "FAIL: 비즈 anchor 11건 박제 hit <6"; exit 1 } else print "PASS 비즈 anchor hits:", $1 }' \
  && grep -cE '(text|bg|border)-status-(safe|fire|warning|danger|caution)' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 > 0) { print "FAIL: status- prefix found"; exit 1 } else print "PASS no status- prefix" }' \
  && grep -v '^<!--' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | grep -v '^#' | grep -cE 'font-size:[[:space:]]*(9|10|11)[^0-9]|fontSize:[[:space:]]*(9|10|11)[^0-9]' | awk '{ if ($1 > 0) { print "FAIL: 9/10/11 px found"; exit 1 } else print "PASS no 9-11px" }' \
  && grep -cE '\bw-8\b|\bh-8\b' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 > 0) { print "FAIL: w-8/h-8 found"; exit 1 } else print "PASS no w-8 h-8" }' \
  && grep -cE 'OQ #4|OQ #5' cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html | awk '{ if ($1 < 2) { print "FAIL: OQ #4/#5 citation <2"; exit 1 } else print "PASS OQ citations:", $1 }' \
  && git log --oneline -1 | grep -q '260523-wic.*wave 4' && echo "PASS commit T3"
    </automated>
  </verify>
  <done>
    - sketch-wave-4-admin-tools.html 파일 존재 + ≥200 lines (≥320 권장)
    - data-theme="dark" ≥3 / data-theme="light" ≥1 (4 frame admin/assistant 매트릭스)
    - **linear-gradient(135deg, #1d4ed8, #0ea5e9) ≥3 박제 (OQ #4 LOCKED T3 만 예외 anchor)**
    - select 4 옵션 verbatim — 결과 미입력 + 적합/부적합/조건부적합 ≥3
    - 결과 저장 / 보고서 button (업로드 또는 보기) / 일괄 다운로드 ≥1
    - zipLoading 5 단계 텍스트 (준비 중 + 수집 중 + 압축 중) ≥2
    - addButton '지적사항 등록' ≥3 (데스크톱 3 frame + 모바일 1 frame)
    - 모바일 고정 하단 CTA position fixed ≥1 / iOS safe-area paddingBottom calc ≥1
    - ZIP 파일명 round.title 기반 anchor ≥1 (19-legal location 기반과 다름)
    - iOS PWA `<a download>` 패턴 anchor ≥1 / role admin 분기 anchor ≥1
    - 비즈 anchor 11건 박제 hit ≥6
    - status- prefix 0건 / 9·10·11px 0건 / w-8 h-8 0건
    - OQ #4 + OQ #5 인용 ≥2건
    - atomic commit `feat(quick-260523-wic): redesign/20-legal-findings sketch wave 4 (...)` 1개
  </done>
</task>


<task type="auto">
  <name>Task 4 (W5): LegalFindingsPage.tsx TSX 변환 verify checklist markdown 생성 (12 섹션, 비즈 anchor 11건 + Tailwind cheatsheet + 메모리 룰 12+ + 자식 페이지 별도 wave 명시 + 최종 src 11 파일 0 byte verify gate)</name>
  <files>cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md</files>
  <action>
    19-legal/wave-5-tsx-conversion-checklist.md 패턴 mirror 로 새 checklist markdown 작성. **sketch HTML 아님 — markdown checklist** (다음 turn 의 W6 TSX 변환 wave 진입점). LegalFindingsPage.tsx 378 lines 단일 atomic 변환 룰 + 비즈 anchor 11건 박제 + Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑) + 메모리 룰 inline 12+ + 자식 페이지 LegalFindingDetailPage (App.tsx line 291) 별도 wave 명시.

    **12 섹션 구조 (19-legal 40p W5 mirror, 단 11 src 파일 적용):**

    **§1 변환 범위** — LegalFindingsPage.tsx 단일 atomic (378 lines, 3 영역 통합 — 상단 imports/포맷터/SKELETON_STYLE/Spinner + 메인 함수 + JSX render). 외부 7 파일 + App.tsx + 부모 LegalPage + 자식 LegalFindingDetailPage **0 byte 변경** (verify gate 최종 git diff). 자식 페이지 LegalFindingDetailPage 는 별도 wave (§12 다음 단계).

    **§2 비즈 anchor 11건 보존 (verbatim fence)** — rules_verbatim 의 비즈 anchor 11건 list 그대로 인용 (legalApi 4종 + useQuery 2 + invalidateQueries 3 키 + headerTitle 동적 + sortedFindings open-first + adminBar role admin + findingCard navigate 자식 진입 + handleZipDownload iOS PWA + ZIP round.title + @keyframes blink (.6/.3) + toast 8 + 추가 카피 verbatim).

    **§3 변환 매핑 (영역 1~3 verbatim)** — wave-1-index.md §1.1 영역별 인벤토리 표 3개 (영역 1 상단 + 영역 2 메인 함수 + 영역 3 JSX render) 그대로 인용 + 각 영역의 후속 wave 매핑 (W2/W3/W4) 박제.

    **§4 OQ LOCKED 5건 반영 매핑 표** — rules_verbatim 의 OQ #1~#5 LOCKED 5건 verbatim + 각 OQ 의 TSX 변환 후 적용 위치 (line 번호) + sketch wave 매핑 (W2/W3/W4) 표.

    **§5 negative gate** — 이모지 0 / `linear-gradient` (T1/T2/T4 = 0 / **T3 만 예외 anchor ≥3** OQ #4 LOCKED) / 9·10·11px 0 / status- prefix 0 / w-8 h-8 0 / 옛 alias 토큰 0 (sketch 본문 안) + W5 checklist 자체 본문 안 code fence 인용 ≥1.

    **§6 positive gate** — 4 sketch 파일 모두 존재 (W2 chrome + W3 finding-list + W4 admin-tools) + W5 checklist 자체 + 토큰 매핑 완결 + 비즈 anchor 박제 hit ≥6 / 파일 + OQ #1~#5 인용 4 sketch 분산.

    **§7 build/tsc** — `npm run build` PASS + `tsc --noEmit` PASS (W6 TSX 변환 wave 시점 — 본 PLAN 에서는 verify gate 없음).

    **§8 자체 verify grep 모음** — 핵심 grep 12종 (border-l-2 border-{safe|danger}-bar 매칭 / status- prefix 0 / w-8 h-8 0 / 9·10·11px 0 / linear-gradient T3 만 ≥3 / Lucide ChevronLeft + Loader2 / headerTitle 동적 분기 / sortedFindings + adminBar + findingCard navigate / ZIP round.title + iOS PWA / 모바일 고정 하단 CTA position fixed + paddingBottom calc / addButton 카피 / @keyframes blink (.6/.3))

    **§9 Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑, 20-legal-findings 적용)** — rules_verbatim 의 Tailwind cheatsheet 표 그대로 인용 (v0.1.1 토큰 + Tailwind utility + 20-legal-findings 적용 위치).

    **§10 비즈 보존 체크박스** — legalApi 4종 / useQuery 2 / invalidateQueries 3 키 / headerTitle 동적 / sortedFindings open-first / adminBar role admin / findingCard navigate 자식 진입 / handleZipDownload iOS PWA / ZIP round.title / toast 8 / @keyframes blink (.6/.3) / 빈/오류 카피 verbatim — 각 항목 체크박스 + line 번호.

    **§11 메모리 룰 inline (12+ rule citations)** — feedback_inspection_unresolved_color + project_inspection_completion_rule + feedback_tailwind_token_class_pattern + feedback_tailwind_w8_h8_is_48px + feedback_text_caption_leading_none + feedback_sketch_realistic_data + feedback_design_changes_ask_first + feedback_planner_prompt_sketch_verbatim + feedback_tsx_wave_emoji_dot_gap + feedback_tsx_wave_stat_card_drift + feedback_subagent_production_deploy_forbidden + feedback_redesign_sketch_rule_enforcement + feedback_cbc7119_design_never_wrangler (wrangler 명령 절대 X)

    **§12 다음 단계** — W6 TSX 변환 wave (LegalFindingsPage.tsx 378 lines 단일 atomic) + 자식 페이지 LegalFindingDetailPage (App.tsx line 291) 별도 wave (별도 quick task) + 부모 LegalPage 의 19-legal 변환 완료 확인 (이미 완료) + 직원 도메인 X (cbc7119-preview 만 자동 배포).

    **최종 src 11 파일 0 byte verify gate (본 task verify gate 안 포함):**
    ```bash
    # src 11 파일 0 byte 변경 확인
    git diff --name-only HEAD~4 HEAD -- \
      cha-bio-safety/src/pages/LegalFindingsPage.tsx \
      cha-bio-safety/src/components/PhotoGrid.tsx \
      cha-bio-safety/src/components/PhotoSourceModal.tsx \
      cha-bio-safety/src/components/FindingFormSheet.tsx \
      cha-bio-safety/src/hooks/useMultiPhotoUpload.ts \
      cha-bio-safety/src/utils/findingDownload.ts \
      cha-bio-safety/src/utils/api.ts \
      cha-bio-safety/src/stores/authStore.ts \
      cha-bio-safety/src/App.tsx \
      cha-bio-safety/src/pages/LegalPage.tsx \
      cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
    # 결과 empty 여야 함 (4 sketch+checklist commit 만 — src 변경 X)
    ```

    **commit 명령:**
    ```
    git add cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md
    git commit -m "feat(quick-260523-wic): redesign/20-legal-findings sketch wave 5 (TSX checklist — LegalFindingsPage.tsx 378 lines 단일 atomic 변환 룰 + 비즈 anchor 11건 + Tailwind cheatsheet + 자식 페이지 LegalFindingDetailPage 별도 wave + 11 src 파일 0 byte verify gate)"
    ```
  </action>
  <verify>
    <automated>
test -f cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md \
  && wc -l cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 300) { print "FAIL: too short (≥300 권장)"; exit 1 } else print "PASS lines:", $1 }' \
  && grep -cE '^## §1\.|^## §1[^.0-9]|^## §1 ' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 1) { print "FAIL: §1 변환 범위 missing"; exit 1 } else print "PASS §1" }' \
  && grep -cE '^## §[0-9]+|^### §[0-9]+|^# §[0-9]+' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 8) { print "FAIL: 12 섹션 헤더 <8 (§1~§12)"; exit 1 } else print "PASS 섹션 수:", $1 }' \
  && grep -cE 'legalApi|useQuery|headerTitle|sortedFindings|adminBar|findingCard|handleZipDownload|toast' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 12) { print "FAIL: 비즈 anchor 11건 박제 hit <12"; exit 1 } else print "PASS 비즈 anchor hits:", $1 }' \
  && grep -c 'LegalFindingsPage.tsx' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 3) { print "FAIL: LegalFindingsPage.tsx <3"; exit 1 } else print "PASS LegalFindingsPage.tsx:", $1 }' \
  && grep -c 'LegalFindingDetailPage' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 2) { print "FAIL: LegalFindingDetailPage 별도 wave 명시 <2 (§12)"; exit 1 } else print "PASS LegalFindingDetailPage:", $1 }' \
  && grep -cE 'OQ #1|OQ #2|OQ #3|OQ #4|OQ #5' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 5) { print "FAIL: OQ #1~#5 5건 citation <5"; exit 1 } else print "PASS OQ citations:", $1 }' \
  && grep -cE 'feedback_inspection_unresolved_color|project_inspection_completion_rule|feedback_tailwind_token_class_pattern|feedback_tailwind_w8_h8_is_48px|feedback_text_caption_leading_none' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 5) { print "FAIL: 메모리 룰 inline <5 (§11)"; exit 1 } else print "PASS memory rules:", $1 }' \
  && grep -cE 'border-l-2 border-(safe|danger)-bar' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 1) { print "FAIL: OQ #2 borderLeft 2px mapping <1"; exit 1 } else print "PASS borderLeft 2px:", $1 }' \
  && grep -cE 'linear-gradient\(135deg' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 1) { print "FAIL: T3 linear-gradient 예외 anchor citation <1 (§5)"; exit 1 } else print "PASS gradient citation:", $1 }' \
  && grep -cE 'cbc7119|wrangler' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 1) { print "FAIL: wrangler/cbc7119 메모리 룰 citation missing"; exit 1 } else print "PASS cbc7119 citation:", $1 }' \
  && grep -cE 'Tailwind cheatsheet|v0\.1\.1' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 1) { print "FAIL: §9 Tailwind cheatsheet missing"; exit 1 } else print "PASS Tailwind cheatsheet:", $1 }' \
  && grep -cE 'showNav=false|/\\^\\\\/legal' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 1) { print "FAIL: 글로벌 chrome 0건 anchor (App.tsx line 117) missing"; exit 1 } else print "PASS chrome 0 anchor:", $1 }' \
  && grep -cE '지적사항_\$\{round\?\.title|round\?\.title \?\? .report' cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md | awk '{ if ($1 < 1) { print "FAIL: ZIP round.title anchor missing (19-legal 차이 4)"; exit 1 } else print "PASS ZIP round.title:", $1 }' \
  && git log --oneline -1 | grep -q '260523-wic.*wave 5' && echo "PASS commit T4" \
  && echo "=== 최종 src 11 파일 0 byte verify gate ===" \
  && CHANGED=$(git diff --name-only HEAD~4 HEAD -- \
       cha-bio-safety/src/pages/LegalFindingsPage.tsx \
       cha-bio-safety/src/components/PhotoGrid.tsx \
       cha-bio-safety/src/components/PhotoSourceModal.tsx \
       cha-bio-safety/src/components/FindingFormSheet.tsx \
       cha-bio-safety/src/hooks/useMultiPhotoUpload.ts \
       cha-bio-safety/src/utils/findingDownload.ts \
       cha-bio-safety/src/utils/api.ts \
       cha-bio-safety/src/stores/authStore.ts \
       cha-bio-safety/src/App.tsx \
       cha-bio-safety/src/pages/LegalPage.tsx \
       cha-bio-safety/src/pages/LegalFindingDetailPage.tsx 2>/dev/null | wc -l) \
  && if [ "$CHANGED" -gt 0 ]; then echo "FAIL: src 파일 $CHANGED 개 변경됨 (0 byte 룰 위반)"; exit 1; else echo "PASS src 11 파일 0 byte 변경 (4 sketch+checklist commit 만)"; fi
    </automated>
  </verify>
  <done>
    - wave-5-tsx-conversion-checklist.md 파일 존재 + ≥300 lines (≥450 권장)
    - 12 섹션 헤더 (§1~§12) ≥8건 (§1 변환 범위 / §2 비즈 anchor 보존 / §3 변환 매핑 / §4 OQ LOCKED / §5 negative gate / §6 positive gate / §7 build/tsc / §8 자체 verify / §9 Tailwind cheatsheet / §10 비즈 보존 체크박스 / §11 메모리 룰 / §12 다음 단계)
    - 비즈 anchor 11건 박제 hit ≥12
    - LegalFindingsPage.tsx ≥3 / LegalFindingDetailPage 별도 wave 명시 ≥2 (§12)
    - OQ #1~#5 5건 citation ≥5
    - 메모리 룰 inline ≥5 (feedback_inspection_unresolved_color + project_inspection_completion_rule + feedback_tailwind_token_class_pattern + feedback_tailwind_w8_h8_is_48px + feedback_text_caption_leading_none)
    - borderLeft 2px mapping ≥1 (OQ #2) / T3 linear-gradient 예외 anchor citation ≥1 (§5)
    - wrangler/cbc7119 메모리 룰 citation ≥1
    - §9 Tailwind cheatsheet ≥1
    - 글로벌 chrome 0건 anchor (App.tsx line 117) ≥1
    - ZIP round.title anchor ≥1 (19-legal 차이 4)
    - atomic commit `feat(quick-260523-wic): redesign/20-legal-findings sketch wave 5 (...)` 1개
    - **최종 src 11 파일 0 byte verify gate PASS** (LegalFindingsPage.tsx + 외부 7 + App.tsx + 부모 LegalPage + 자식 LegalFindingDetailPage 모두 변경 0 byte)
  </done>
</task>

</tasks>

<verification>
- 4 파일 모두 cha-bio-safety/docs/redesign-context/20-legal-findings/ 직속 평면 배치 (sketch/ 서브폴더 X)
- 각 task 마다 atomic git commit 1개씩 (총 4 commit, executor cherry-pick 사고 회피용)
- W2/W3 sketch: linear-gradient 0건 / W4 sketch: linear-gradient(135deg, #1d4ed8, #0ea5e9) ≥3 (OQ #4 LOCKED T3 만 예외)
- OQ LOCKED 5건 모두 4 파일 안에 verbatim 반영 (OQ #1 모바일 헤더 / #2 borderLeft 2px + 칩 status / #3 fontSize 12 + leading-none / #4 addButton 그라데이션 + 빈/오류 카피 / #5 Lucide ChevronLeft + Loader2 + 44x44)
- 비즈 anchor 11건 모두 4 파일 안에 verbatim 박제 (legalApi 4 + useQuery 2 + invalidateQueries 3 키 + headerTitle 동적 + sortedFindings + adminBar role + findingCard navigate + handleZipDownload iOS PWA + ZIP round.title + @keyframes blink + toast 8)
- 19-legal 차이 5건 sketch 시각 반영 (글로벌 chrome 0 / 단일 export 378 / borderLeft 2px / ZIP round.title / findingCard 자식 진입)
- negative gate 4 sketch + 1 checklist 모두 통과 (이모지 0 / 9·10·11px 0 / status- prefix 0 / w-8 h-8 0 / 옛 alias 토큰 0)
- 11 src 파일 0 byte 변경 (LegalFindingsPage + 외부 7 + App.tsx + 부모 LegalPage + 자식 LegalFindingDetailPage)
</verification>

<success_criteria>
- 4 파일 모두 wc -l ≥200 (sketch HTML 3개) / ≥300 (checklist md 1개)
- 각 task 의 verify gate <automated> 블록 모두 PASS
- 최종 git diff --name-only HEAD~4 HEAD -- src 11 파일 empty
- 사용자가 cbc7119-preview 자동 배포에서 4 frame × 3 sketch + checklist 1 차수 시각 검수 가능
</success_criteria>

<output>
After completion, no separate SUMMARY required (quick task — atomic 4 commit 으로 박제 완결).
Optional: STATE.md row + Last session 1줄 박제 (사용자 요청 시).
</output>

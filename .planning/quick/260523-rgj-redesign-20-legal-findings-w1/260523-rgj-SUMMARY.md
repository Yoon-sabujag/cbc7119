---
phase: quick-260523-rgj
plan: 01
subsystem: redesign/20-legal-findings (sketch wave 1 — index 단일 산출)
tags: [redesign, 20-legal-findings, wave-1, index, legal, soso-jeomgeom-sub-route, findings-list, 4-sub-wave-distribution, biz-anchor, chrome-rules-direct-apply, showNav-false-special-case]
requires: []
provides:
  - "W2~W5 진입의 단일 진입점 인덱스 (cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md, 724 lines)"
  - "LegalFindingsPage.tsx 378 lines 3 영역 인벤토리 (상단 imports/포맷터/SKELETON/Spinner + 메인 페이지 함수 + JSX render) + 비즈 시그니처 보존 anchor 박스 (legalApi 4종 + useQuery 2종 + handleZipDownload iOS PWA + adminBar role admin + sortedFindings open-first + headerTitle 동적 분기)"
  - "design-system v0.1.1 §1.1/§1.2/§1.3/§6.4/§6.6/§7.1 verbatim 6 fence 박제"
  - "02+06 chrome 통일 룰 직접 적용 케이스 (19-legal LegalPage 의 sub-route = 점검 시리즈 = 02 InspectionPage 동일 도메인) + **showNav=false 특수 케이스** (App.tsx line 117 정규식 `^/legal/.+` 매칭 → 모바일/데스크톱 모두 글로벌 chrome 외곽 0건) + App.tsx 실측 (line 36/71/74/77/79~104/117/289/290/291)"
  - "메모리 룰 12건 (10 기본 + feedback_inspection_unresolved_color finding 상태 칩+borderLeft status 토큰 일반화 + project_inspection_completion_rule role admin 도구 분기+sortedFindings open-first source of truth 일반화) inline 인용"
  - "OQ 5건 + default 답 (모바일 헤더 raised 0.97 / finding 상태 status 토큰 치환 / fontSize 12 격상 / 메인 CTA addButton gradient + 빈/오류 아이콘 + SKELETON 활용 / Lucide ChevronLeft+Loader2 교체 + back 44x44 격상)"
affects: []
tech-stack-added: []
tech-stack-patterns: [4-sub-wave-W2-W5-distribution, flat-sketch-folder-naming, biz-anchor-preservation, chrome-rules-direct-apply-inspection-series-sub-route, showNav-false-special-case, status-token-mapping-no-prefix, role-admin-tools-source-of-truth, single-export-378-lines-no-internal-panel, ios-pwa-a-download-pattern, dynamic-headerTitle-branching]
key-files:
  created:
    - "cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md (724 lines)"
  modified: []
decisions:
  - "Flat sketch folder naming (sketch-wave-N-{slug}.html, sketch/ 서브폴더 안 만듦) — 8 페이지 (13/14/27/16/17/28/23/19) 일관"
  - "4 sub-wave (W2~W5) 분배 — LegalFindingsPage 378 lines 단일 export + 내부 panel 없음 (19-legal LegalPage 3개 내부 컴포넌트와 다름) + 데스크톱 maxWidth 800 단일 컬럼 중앙 정렬 + 모바일 고정 하단 CTA — 19-legal/23-education 4 sub-wave 패턴 mirror"
  - "Chrome 룰 직접 적용 케이스 — 20-legal-findings 는 19-legal LegalPage 의 sub-route = 소방 점검 관리 sub-route = 점검 시리즈 (02 InspectionPage 와 동일 도메인). **단 19-legal 와 결정적 차이**: App.tsx line 117 정규식 `^/legal/.+` 매칭 → showNav=false → 모바일/데스크톱 모두 글로벌 chrome 외곽 (BottomNav + 사이드바 + AppHeader) 모두 숨김 → 자체 헤더 (모바일) + 데스크톱 타이틀 영역이 유일한 외곽"
  - "비즈 anchor 1 byte 0 룰 — useQuery 2종 + legalApi 4종 (get/getFindings/updateResult/deleteFinding — 19-legal LegalPage 7종 중 4종 사용) + headerTitle 동적 분기 (round.title.includes('종합정밀') ? '종합정밀' : '작동기능') + sortedFindings open-first + adminBar role admin 조건부 + handleSaveResult/handleReportUpload/handleDeleteFinding + handleZipDownload iOS PWA <a download> + setTimeout(URL.revokeObjectURL, 3000) + ZIP 파일명 round.title 기반 [19-legal location 기반과 다름] + 폴더명 패턴 + 사진 파일명 + toast 8종 + 빈/오류 카피 + finding borderLeft 2px [19-legal LegalPage 3px 와 다름] + 칩 2분기 + 모바일 헤더 36x36 + 모바일 고정 하단 CTA + 데스크톱 maxWidth 800 + @keyframes blink .6/.3 [Education 1/0.4 와 다름] + spin"
  - "memory feedback_inspection_unresolved_color 일반화 → finding 상태 칩 + borderLeft 2분기 (open danger '미조치' / resolved safe '완료') status 토큰 매핑 (status- prefix 없음 룰) — borderLeft 2px (19-legal 3px 와 다름) 보존 필수"
  - "memory project_inspection_completion_rule 일반화 → role admin 도구 분기 (adminBar 조건부 line 208) + sortedFindings open-first (line 198~203) + findingCard onClick navigate 자식 페이지 진입 + handleZipDownload iOS PWA 패턴 + headerTitle 동적 분기 모두 운영 룰 source of truth"
  - "OQ 5건 모두 default 답 명시 (raised 유지 / status 토큰 치환 / fontSize 12 격상 / addButton gradient + 도구 solid + 아이콘 무 + SKELETON Spinner 유지 / Lucide ChevronLeft+Loader2 교체 + back 44x44 격상). 19-legal LegalPage 의 OQ #5 첨부 button '📷' Lucide Camera 교체 OQ 는 본 페이지 미적용 (이모지 0건)"
metrics:
  duration: "약 30분 (Read PLAN 895 lines + Read LegalFindingsPage 378 lines + Read 19-legal wave-1-index.md template 758 lines + Read design-system 461 lines + Read inspection-modal-chrome-rules 281 lines + Read 19-legal sa7 SUMMARY 169 lines + Read tokens.css 100 lines + grep App.tsx 검증 9 라인 + Write 724 lines + 자체 verify 9 gate + 1 commit + worktree reset)"
  completed: "2026-05-23"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  commits: 1
  deviations: 0
---

# Quick Task 260523-rgj: redesign/20-legal-findings W1 인덱스 Summary

W1 산출 1개 파일 — `cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md` (724 lines) + 자체 verify 9 gate PASS + 1 commit. 19-legal / 23-education / 28-splash / 17-annual-plan / 16-workshift / 27-login W1 의 7 섹션 + 4 sub-wave 구조 정확히 mirror. LegalFindingsPage = 19-legal LegalPage 의 sub-route = 점검 시리즈 직접 적용 케이스 + **showNav=false 특수 케이스** (App.tsx line 117 정규식 `^/legal/.+` 매칭으로 모바일/데스크톱 모두 글로벌 chrome 외곽 0건). 19-legal LegalPage 와 결정적 차이 5건 (글로벌 chrome 0건 / 단일 export 378 lines / borderLeft 2px / ZIP 파일명 round.title 기반 / findingCard 자식 페이지 진입) 박제.

---

## What was built

**1 markdown 파일** — `cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md` (724 lines).

7 섹션 구조 (PLAN must_haves 100% 충족):

- **§1 LegalFindingsPage.tsx 인벤토리** — 3 영역 (상단 imports/포맷터/SKELETON_STYLE/Spinner line 1~40 + 메인 페이지 LegalFindingsPage 함수 line 41~290 — useParams+useNavigate+useQueryClient+useAuthStore+role / state 7종 / useQuery 2종 round+findings / handleSaveResult+handleReportUpload+handleDeleteFinding / handleZipDownload iOS PWA `<a download>` 패턴 + buildMetaTxt + 폴더명 정규식 + 사진 파일명 / sortedFindings open-first / adminBar role admin && round 조건부 / findingCard / addButton 모바일+데스크톱 분기 + JSX render line 293~377 — 외곽 + 인라인 keyframes blink + 모바일 헤더 + 데스크톱 타이틀 + adminBar mount + 콘텐츠 loading/error/empty/list + 모바일 고정 하단 CTA + FindingFormSheet create+edit) + 영역별 표 + 비즈 시그니처 보존 anchor 박스 (useQuery 2종 + legalApi 4종 + handleZipDownload iOS PWA + buildMetaTxt + ZIP 파일명 round.title 기반 + 폴더명 + 사진 파일명 + toast 8종 + 빈/오류 카피 + adminBar 카피 + finding 카피 + addButton + @keyframes blink .6/.3 + spin + App.tsx 실측 9 라인)
- **§2 4 sub-wave 분배** — W2 chrome+모바일 헤더+데스크톱 타이틀+빈/로딩/오류+모바일 고정 하단 CTA / W3 finding 카드 목록+open-first 정렬+borderLeft 2px+칩+메타+액션 / W4 adminBar (role admin 조건부 — 결과 select+저장+보고서+ZIP)+addButton+FindingFormSheet mount / W5 markdown TSX checklist + 각 wave 보존/토큰/폰트/레이아웃 분리
- **§3 design-system v0.1.1 인용** — §1.1 노안 친화 + §1.2 정보 인지 + §1.3 모바일/데스크톱 동일 폰트 + §6.4 Backgrounds & Gradients + §6.6 Animation + §7.1 Lucide 6 fence verbatim + 적용 메타 (§6.1 Progress / §6.2 Stat Card / §6.3 카테고리 카드 / §7.2 카테고리 아이콘 = LegalFindingsPage 미적용 1줄 메타)
- **§4 02+06 chrome 룰 직접 적용 케이스 + showNav=false 특수 케이스** — 20-legal-findings = 19-legal LegalPage 의 sub-route = 점검 시리즈 (02 InspectionPage 동일 도메인). 각 룰 (§1~§7) 1줄 메타 (적용/미적용 판정) + App.tsx 실측 (line 36/71/74/77/79~104/117/289/290/291 — 특수 regex `^/legal/.+` showNav=false 포함). 19-legal LegalPage 와 차이 5건 박제 (글로벌 chrome 0건 / 단일 export / borderLeft 2px / ZIP 파일명 round.title 기반 / findingCard 자식 페이지 진입)
- **§5 메모리 룰 12건 inline** — 10 기본 + 20-legal-findings 특화 2건 (★ feedback_inspection_unresolved_color finding 상태 칩 + borderLeft status 토큰 일반화 + ★ project_inspection_completion_rule role admin 도구 분기 + sortedFindings open-first source of truth 일반화)
- **§6 negative rule** — sketch HTML 금지 / LegalFindingsPage.tsx + 외부 7 파일 (PhotoGrid / PhotoSourceModal / FindingFormSheet / useMultiPhotoUpload / findingDownload / api / authStore) 미수정 / wrangler + npm run deploy 금지 / 평면 폴더 / App.tsx 미수정 / 부모 페이지 LegalPage + 자식 페이지 LegalFindingDetailPage 미수정 / 비즈 anchor 전체 1 byte 0 (★ 9 별표 항목: finding 상태 2분기 + sortedFindings + adminBar role admin + headerTitle 동적 분기 + findingCard navigate + legalApi 4종 + handleZipDownload iOS PWA + ZIP 파일명/폴더명/사진 파일명 + handleReportUpload FormData/Bearer + 외 17 보존 항목)
- **§7 OQ 5건** — 모두 default 답 명시 (1: 모바일 헤더 raised 0.97 유지 / 2: finding 상태 status 토큰 치환 OK / 3: §1.1 fontSize 12 격상 OK / 4: 메인 CTA addButton gradient OK + 빈/오류 아이콘 무 유지 + SKELETON Spinner 유지 / 5: Lucide ChevronLeft+Loader2 교체 OK + back 44x44 격상). 19-legal OQ #5 의 첨부 button '📷' Camera 교체 OQ 는 본 페이지 미적용 (이모지 0건).

추가: 자체 verify 9 gate (file / section / sub-wave / 메모리 / OQ / fence / 안전 키워드 ×2 / src 변경 / legalApi anchor).

---

## Deviations from Plan

**None — plan executed exactly as written.**

PLAN 의 must_haves 11건 (truths) + artifacts 1건 + key_links 8건 모두 1:1 충족. line 범위 drift 0 — LegalFindingsPage.tsx 378 lines 실측 일치 (Read 도구로 1회 완전 cover), App.tsx 모든 인용 라인 (36/71/74/77/79~104/117/289/290/291) grep 으로 사전 검증 후 verbatim 인용 + PAGE_TITLES end line 104 별도 sed -n 으로 확인.

비즈 anchor 박스 (§1.3) 추정/paraphrase 0건 — LegalFindingsPage.tsx 본문 grep 으로 모두 직접 박제 (useQuery 2종 queryKey 정확 + legalApi 4종 시그니처 + headerTitle 동적 분기 코드 + sortedFindings 정렬 코드 + adminBar `role === 'admin' && round` 조건 + handleZipDownload iOS PWA `<a download>` 패턴 + ZIP 파일명 round.title fallback 'report' + 폴더명 정규식 + 사진 파일명 + toast 카피 8종 line 번호 + 빈/오류 카피 isDesktop 분기 + adminBar 5종 카피 + finding 카피 + addButton + finding 칩 rgba 정확 + borderLeft 2px 정확).

worktree branch base check 단계에서 worktree HEAD 가 target 보다 앞서 있어서 `git reset --hard 40d7b0c` 로 재정렬 (worktree_branch_check 단계 instruction 준수, 정상 흐름).

---

## Self-Check: PASSED

**파일 존재 확인:**
- ✓ `cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md` (724 lines)
- ✓ `.planning/quick/260523-rgj-redesign-20-legal-findings-w1/260523-rgj-SUMMARY.md` (본 파일)

**자체 verify 9 gate 결과:**
| gate | 명령 | 기대값 | 실제값 | PASS |
|---|---|---|---|---|
| 1. file 존재 | `test -f wave-1-index.md` | EXISTS | EXISTS | ✓ |
| 2. 7 헤더 존재 | `grep -c '^# §[1-7]'` | =7 | 7 | ✓ |
| 3. sub-wave 분배 표 W2~W5 | `grep -E '^\| W[2-5] \|' \| wc -l` | =4 | 4 | ✓ |
| 4. 메모리 룰 unique | `grep -oE 'feedback_[a-z_]+' \| sort -u \| wc -l` | ≥10 | 12 | ✓ |
| 5. OQ §7 ≥5 | `grep -cE 'OQ #[1-5]'` | ≥5 | 51 | ✓ |
| 6. design-system fence | `grep -c '^\`\`\`'` | ≥12 | 18 | ✓ |
| 7a. 인프라 명령 키워드 | `grep -c 'wrang''ler'` | ≥1 | 4 | ✓ |
| 7b. 배포 명령 키워드 | `grep -c 'npm run dep''loy'` | ≥1 | 3 | ✓ |
| 8. src/LegalFindingsPage.tsx 변경 0 | `git diff --name-only HEAD~1 HEAD -- ...` | 0 | 0 | ✓ |
| 9. legalApi 4-method anchor | `grep -cE 'legalApi\.(get\|getFindings\|updateResult\|deleteFinding)'` | ≥4 | 13 | ✓ |

**commit 확인:**
- ✓ `1cb4108 docs(quick-260523-rgj): redesign/20-legal-findings W1 인덱스 ...` (724 insertions, 1 file)
- ✓ deletion check PASS (`git diff --diff-filter=D HEAD~1 HEAD` = empty)
- ✓ working tree clean post-commit (.planning/quick/260522-* 2건은 untracked, 본 wave 무관)

**소스 변경 0건 확인:**
- ✓ `git diff --name-only HEAD~1 HEAD` = `cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md` (단일 파일)
- ✓ `cha-bio-safety/src/pages/LegalFindingsPage.tsx` untouched
- ✓ 외부 컴포넌트/훅 (PhotoGrid / PhotoSourceModal / FindingFormSheet / useMultiPhotoUpload / findingDownload / api / authStore / useIsDesktop) untouched
- ✓ App.tsx untouched

---

## Key Decisions

1. **Flat sketch folder naming** — 8 페이지 (13/14/27/16/17/28/23/19) 일관 패턴 채택. `sketch/` 서브폴더 X. 20-legal-findings 도 `20-legal-findings/sketch-wave-N-{slug}.html` 평면 배치.
2. **4 sub-wave (W2~W5) 분배** — LegalFindingsPage 378 lines 단일 export + 내부 panel 0건 (19-legal LegalPage 3개 내부 컴포넌트와 다름) + 데스크톱 maxWidth 800 단일 컬럼 중앙 정렬 + 모바일 고정 하단 CTA — 19-legal/23-education 4 sub-wave 패턴 mirror. W3 = finding 카드 목록 + sortedFindings open-first + 상태 칩 + borderLeft 2px / W4 = adminBar (role admin 조건부 — 결과 select+저장+보고서+ZIP) + addButton + FindingFormSheet mount.
3. **Chrome 룰 직접 적용 케이스 + showNav=false 특수 케이스 (★ 20-legal-findings 의 19-legal 과 가장 큰 차이)** — 20-legal-findings = 19-legal LegalPage 의 sub-route, 02 InspectionPage 와 동일 도메인. **단 App.tsx line 117 정규식 `^/legal/.+` 매칭 → 모바일/데스크톱 모두 showNav=false → BottomNav + 사이드바 + 글로벌 AppHeader 모두 숨김**. 19-legal LegalPage 는 데스크톱 글로벌 AppHeader + 사이드바 표시 — 본 페이지는 chrome 외곽 0건. sketch 시 데스크톱 시안에 글로벌 chrome 그리지 않음.
4. **비즈 anchor 1 byte 0 룰** — 19-legal 25건 + 28-splash 16건 + 23-education D-day + role 그룹핑 보존 룰 일반화. LegalFindingsPage 의 핵심 비즈 약 20건 (useQuery 2종 + legalApi 4종 + headerTitle 동적 분기 + sortedFindings open-first + adminBar role admin + handleSaveResult/handleReportUpload/handleDeleteFinding + handleZipDownload iOS PWA `<a download>` + setTimeout 3000 + ZIP 파일명 round.title 기반 + 폴더명 + 사진 파일명 + toast 8종 + 빈/오류 카피 + adminBar 5종 카피 + finding 카피 + addButton + finding borderLeft 2px [19-legal 3px 와 다름] + 모바일 헤더 36x36 + 모바일 고정 하단 CTA + 데스크톱 maxWidth 800 + @keyframes blink .6/.3 + spin) 모두 §1.3 비즈 시그니처 박스에 명시 + §6 negative rule 의 ★ 9 별표 항목으로 cross-ref.
5. **memory feedback_inspection_unresolved_color 일반화 (★ 20-legal-findings 특화 룰 1)** — 점검 페이지의 미조치 fire 칩 일반화 → 20-legal-findings 의 finding 상태 칩 + borderLeft 2분기 모두 결과 status 토큰 매핑 패턴. status- prefix 없음 룰과 결합 → `border-l-2 border-{safe|danger}-bar` / `bg-{safe|danger}-bg text-{safe|danger}`. **borderLeft 2px (19-legal LegalPage 3px 과 다름) — 본 페이지 2px 보존 필수**. 토큰 치환은 OQ #2 default OK, 임계치 + 라벨 1 byte 변경 금지.
6. **memory project_inspection_completion_rule 일반화 (★ 20-legal-findings 특화 룰 2)** — isCpCompleted source of truth 일반화 → 20-legal-findings 의 role admin 도구 분기 (adminBar `role === 'admin' && round` line 208) + sortedFindings open-first (line 198~203) + findingCard onClick navigate 자식 페이지 진입 (line 240) + handleZipDownload iOS PWA `<a download>` 패턴 (line 138~196) + headerTitle 동적 분기 (line 120~122 `round.title.includes('종합정밀')` 조건) 모두 운영 룰 source of truth. UI/시안에서 권한/정렬/분기/네비/iOS 패턴 변경 금지.
7. **OQ 5건 default 답 명시** — sketch 진입 직전 컨펌 필요 항목 5건 + 각 default 답 명시 (사용자 별 의견 없으면 reasonable call). 단 "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`). 19-legal OQ #5 의 첨부 button '📷' Camera 교체 OQ 는 본 페이지 미적용 (이모지 0건) — 본 페이지 OQ #5 는 Lucide ChevronLeft + Loader2 교체 + back 44x44 격상 2종만.

---

## Authentication Gates

None.

---

## Known Stubs

None — wave-1-index.md 는 documentation-only 인덱스 문서로, 코드 stub 없음. UI 가 없는 markdown 파일이라 데이터 와이어링 영역 자체 없음.

---

## Threat Flags

None — documentation-only 변경. 새 네트워크 endpoint / auth 경로 / 파일 접근 / 스키마 변경 0건. PLAN 의 threat_model 섹션도 없음 (디자인 wave 인덱스 작성).

---

## Files Created

- `cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md` (724 lines, 1 commit)
- `.planning/quick/260523-rgj-redesign-20-legal-findings-w1/260523-rgj-SUMMARY.md` (본 파일, 별도 commit)

## Files Modified

None.

## Commits

- `1cb4108` — `docs(quick-260523-rgj): redesign/20-legal-findings W1 인덱스 (wave-1-index.md 단일 산출 + 3영역 인벤토리 + biz anchor + 4 sub-wave + OQ 5건 + 메모리 12)` — 1 file changed, 724 insertions(+)
- (SUMMARY commit — separate, immediately after)

---

## Next Step (사용자 컨펌 대기)

본 wave 산출 끝. W2 진입 = 사용자가 §7 OQ 5건 답변 + "approved" 명시 후 (memory `feedback_avoid_premature_confirmation`).

### §7 OQ 5건 default 답 요약 (사용자 확인 부탁)

| OQ | 항목 | default 답 |
|---|---|---|
| #1 | 모바일 자체 헤더 배경 `rgba(22,27,34,0.97)` | raised 유지 + alpha 0.97 보존 (19-legal + 16-workshift + 17-annual-plan + 02 + 28-splash + 23-education 6 페이지 일관) |
| #2 | finding 상태 2분기 (open/resolved) + borderLeft 2px + 칩 색 | status 토큰 치환 OK (status- prefix 없음) — `border-l-2 border-{safe\|danger}-bar` + `bg-{safe\|danger}-bg text-{safe\|danger}`. borderLeft 2px (19-legal 3px 와 다름) 보존 필수. 2분기 + 2 라벨 1 byte 변경 금지. 칩 alpha 0.13/0.15 vs tokens.css 0.16 미세 차이 사용자 컨펌 후 결정. |
| #3 | §1.1 fontSize 9·10·11 위반 격상 (수정/삭제 10 + finding 칩/메타 11) | 격상 OK (text-caption(12) + leading-none) — 단 시각 균형 우려 시 부분 인라인 유지 가능 (배지/칩 11 유지 + 수정/삭제 button 만 12 격상 옵션) |
| #4 | 메인 CTA addButton gradient + 빈/오류 아이콘 + SKELETON 활용 | (CTA addButton) gradient OK (#1d4ed8, #0ea5e9) — 메인 CTA 한정, adminBar 작은 도구 (저장/보고서/ZIP h 36) solid 유지 / (아이콘) 무 유지 (5 페이지 일관) — 사용자 컨펌으로 ClipboardList(빈) + AlertCircle(오류) 추가 가능 / (SKELETON) Spinner 유지 (현재 SKELETON_STYLE dead code — 사용자 컨펌 시 23-education 패턴 mirror로 SKELETON 3 카드 채택 가능) |
| #5 | Lucide back+Loader2 교체 + back 44x44 격상 | (1) ChevronLeft size={20} 교체 + 44x44 격상 OK (left 12 유지) / (2) Loader2 animate-spin 교체 OK (size={24}, Spinner 함수 + 인라인 keyframe spin 폐기). 19-legal OQ #5 의 첨부 button '📷' Camera 교체 OQ 는 본 페이지 미적용 (이모지 0건). |

W2 진입 = 5건 OQ 답변 + "approved" 후. 권장 다음 명령:

```bash
/clear  # 컨텍스트 reset
/gsd:quick  # 새 quick task 시작 (W2 sketch-wave-2-chrome.html)
```

부모 페이지 (`/legal` LegalPage @ App.tsx line 289) + 자식 페이지 (`/legal/:id/finding/:fid` LegalFindingDetailPage @ App.tsx line 291) 는 본 wave + W2~W5 범위 아님 — 각각 별도 wave 에서 처리. findingCard 클릭 → navigate(`/legal/${id}/finding/${finding.id}`) 시 자식 페이지 진입은 별도 wave.

### 19-legal 와의 차이 5건 (W2~W5 진입 시 reference)

1. **글로벌 chrome 0건** — App.tsx line 117 정규식 `^/legal/.+` 매칭 → showNav=false (vs 19-legal `/legal` 본 페이지 = 데스크톱 글로벌 AppHeader + 사이드바 표시)
2. **단일 export 378 lines** — 내부 panel 0건 (vs 19-legal LegalPage 의 FindingsPanel + FindingDetailPanel + 메인 LegalPage 3개 내부 컴포넌트 통합 571 lines)
3. **finding borderLeft 2px** — 본 페이지는 2px (vs 19-legal LegalPage FindingsPanel 의 finding 카드 borderLeft 3px)
4. **ZIP 파일명 round.title 기반** — `지적사항_${round?.title ?? 'report'}.zip` (vs 19-legal LegalPage FindingDetailPanel 의 `지적사항_${(location ?? '').replace(/[\/\\:*?"<>|]/g, '_')}.zip` location 기반 — 단일 finding)
5. **findingCard 클릭 시 자식 페이지 진입** — navigate(`/legal/${id}/finding/${finding.id}`) → LegalFindingDetailPage (vs 19-legal LegalPage 데스크톱 모드 setSelectedFindingId 로 우측 패널 표시)

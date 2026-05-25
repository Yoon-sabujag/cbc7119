---
phase: 260524-bbz
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/LegalFindingsPage.tsx
autonomous: true
requirements:
  - W5-checklist-§1-scope-single-atomic
  - W5-checklist-§2-biz-anchor-11
  - W5-checklist-§3-region-mapping-3
  - W5-checklist-§4-OQ-LOCKED-5
  - W5-checklist-§5-negative-gate
  - W5-checklist-§6-positive-gate
  - W5-checklist-§7-build-gate
  - W5-checklist-§8-self-verify-grep
  - W5-checklist-§9-tailwind-cheatsheet
  - W5-checklist-§10-biz-checkbox
  - W5-checklist-§11-memory-rules-12
  - W5-checklist-§12-next-step
tags:
  - redesign
  - 20-legal-findings
  - tsx-conversion
  - v0.1.x
  - quick
  - single-file-atomic
  - lucide-chevron-left
  - lucide-loader2
  - back-button-44x44
  - status-token

must_haves:
  truths:
    - "LegalFindingsPage.tsx **단일 파일 atomic** in-place 수정. `git diff --name-only HEAD~ HEAD` 에 'cha-bio-safety/src/pages/LegalFindingsPage.tsx' + 본 PLAN.md/SUMMARY.md 만 등장 (다른 파일 0). 23-education (r22) / 19-legal (lft) / 17-annual-plan (1hj) / 27-login (gox) / 16-workshift (u5n) 와 동일한 단일 파일 패턴. 19-legal (lft) 는 571 lines 단일 파일 안 3 컴포넌트 + 5 helper 였으나 본 20-legal-findings 는 378 lines 단일 export (LegalFindingsPage default) + 3 영역 (imports / 메인 함수 / JSX render) 통합 변환."
    - "App.tsx + tailwind.config.js + tokens.css + typography.css + hooks/useMultiPhotoUpload.ts + stores/authStore.ts + utils/api.ts + utils/findingDownload.ts + components/PhotoGrid.tsx + components/PhotoSourceModal.tsx + components/FindingFormSheet.tsx + pages/LegalPage.tsx + pages/LegalFindingDetailPage.tsx + types/ + functions/ + templates/ + migrations/ + public/ 모두 변경 0 byte. **App.tsx + 외부 10 파일 변경 0 byte 가드 = final verify gate**."
    - "변환 후 LegalFindingsPage.tsx 라인 수 378 ± 30 (350~410 예상). Spinner 함수 폐기 + Lucide Loader2 직접 사용 + 인라인 SVG ChevronLeft path 1 line + 인라인 spin @keyframes 1 line → Lucide 2종 import 1 line 추가 + Loader2 직접 mount + back 44x44 격상 → 총 라인 수 거의 동일."
    - "★ LegalFindingsPage 비즈 anchor 11건 1 byte 변경 0: (1) legalApi 4종 시그니처 (getFindings/get/deleteFinding/updateResult 또는 W1 명시) + snake_case payload (report_file_key 등) / (2) useQuery × 2 (round 메타 + findings 목록) + queryKey + enabled + staleTime / (3) invalidateQueries 3 키 (legal-findings, legal-round, legal-rounds) handleDelete + handleReportUpload / (4) headerTitle 동적 분기 종합정밀 / 작동기능 (round.title 또는 type 기반) / (5) sortedFindings open-first + createdAt desc localeCompare / (6) adminBar role==='admin' 분기 / (7) findingCard navigate 자식 진입 (/legal/:roundId/findings/:findingId 또는 sub-route) / (8) handleZipDownload iOS PWA `<a download>` 트리거 + ZIP `지적사항_${round?.title ?? 'report'}.zip` / (9) toast 카피 8종 verbatim / (10) finding borderLeft 2px (★ 19-legal 3px 와 다름) + status open `border-danger-bar` / resolved `border-safe-bar` / (11) @keyframes blink (.6/.3, Education .4 와 다름)."
    - "비즈 로직 0 diff: imports (useState/useNavigate/useParams/useQuery+useMutation+useQueryClient/toast/legalApi/useAuthStore/useMultiPhotoUpload/PhotoGrid/PhotoSourceModal/FindingFormSheet/types) 그대로 + **추가 1줄**: `import { ChevronLeft, Loader2 } from 'lucide-react'`. **Spinner 함수 line 32 폐기** → `<Loader2 className=\"animate-spin\" size={N} />` 직접 사용."
    - "카피 verbatim 보존 (8건 추정): success 4 — '보고서 업로드 완료' / '삭제됨' / '점검 결과 저장' / '다운로드 완료'. error 4 — '저장 실패' / '업로드 실패' / err?.message ?? '삭제 실패' / '다운로드 실패'. 빈/오류/fallback — '지적사항 없음' / '항목을 불러오지 못했습니다.' / 헤더 동적 종합정밀 또는 작동기능 분기."
    - "OQ #1 LOCKED 적용 (모바일 자체 헤더): `bg-surface-raised border-b border-border-default`. 옛 인라인 `background:'rgba(22,27,34,0.97)', borderBottom:'1px solid var(--bd)'` 완전 폐기."
    - "OQ #2 LOCKED 적용 (finding 카드 borderLeft + status 칩, status- prefix 없음): **★ border-l-2 (2px, 19-legal 3px 와 다름) ★** + open `border-danger-bar` / resolved `border-safe-bar`. 칩 open `bg-danger-bg text-danger` '미조치' / resolved `bg-safe-bg text-safe` '완료'. 옛 rgba(34,197,94,.13) / rgba(239,68,68,.15) + var(--safe) / var(--danger) / var(--bd2) 인라인 완전 폐기. **status&#8209; prefix 없음** (memory `feedback_tailwind_token_class_pattern`)."
    - "OQ #3 LOCKED 적용 (9·10·11 fontSize → text-caption 12 + leading-none 격상): finding 칩 + 메타 + admin 도구 + 다운로드 button 모두 `text-caption font-bold leading-none` (또는 `text-caption leading-none`) 격상. fontSize 9·10·11 인라인 0건 (verify negative gate)."
    - "OQ #4 LOCKED 적용 (addButton 인라인 그라데이션 ≥1 anchor + 작은 도구 solid + 빈/오류 카피 verbatim + 아이콘 추가 X): **★ addButton (메인 CTA) 인라인** `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` 1건 (lft 1건 패턴 mirror). admin 저장 / ZIP 다운로드 / 보고서 업로드 button 은 `bg-accent text-text-on-accent` solid 토큰 치환 (작은 도구는 그라데이션 아님) — 단, executor 판단으로 admin 저장/ZIP 도 그라데이션 적용 가능 (사용자 시각 검수 후 결정). SKELETON / Spinner 폐기 후 Loader2 직접 mount 유지. 빈/오류 카피 verbatim. 빈/오류 영역 아이콘 추가 X."
    - "OQ #5 LOCKED 적용 (Lucide 2종 + back 44x44 격상 + Spinner 폐기): `import { ChevronLeft, Loader2 } from 'lucide-react'` 추가 (line 14 또는 imports 끝). (a) 모바일 헤더 back button 인라인 SVG path `d=\"M15 19l-7-7 7-7\"` 또는 IconChevronLeft 완전 제거 → `<ChevronLeft size={20} />` 교체 + back button 36x36 → **44x44 격상** (w&#8209;8 함정 회피, `w-11 h-11` 또는 인라인 `width:44, height:44` 명시). (b) Spinner 함수 정의 line 32 완전 폐기 → `<Loader2 className=\"animate-spin\" size={N} />` 직접 사용 (모든 spinner 호출처). 이모지 0 (no Camera 필요 — 첨부 button 은 LegalPage 측 FindingDetailPanel 의 것이므로 본 페이지 해당 없음). grep gate `IconChevronLeft = 0` + `polyline = 0` + `M15 19l-7-7 7-7 = 0` + `function Spinner = 0` (또는 `const Spinner = 0`)."
    - "Negative gate 모두 PASS: 이모지 0 / linear-gradient — **addButton ≥1 (OQ #4 anchor)** + 그 외 anchor 카운트 일치 / fontSize 9·10·11 인라인 0 / status- prefix 0 / w-8·h-8 0 (memory `feedback_tailwind_w8_h8_is_48px`) / 옛 alias var(--bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger) 0 / 인라인 SVG path 0 / function/const Spinner 0."
    - "Positive gate 모두 PASS: bg-surface-raised border-b border-border-default ≥1 (OQ #1) / **border-l-2 ≥1 (OQ #2 2px anchor, 19-legal 3px 와 다름)** + border-safe-bar / border-danger-bar 각 ≥1 + bg-safe-bg text-safe + bg-danger-bg text-danger 각 ≥1 (OQ #2) / text-caption ≥5 + leading-none ≥5 (OQ #3 격상) / linear-gradient(135deg, #1d4ed8, #0ea5e9) ≥1 (OQ #4 addButton) + bg-accent ≥1 (OQ #4 작은 도구) / 빈+오류 카피 verbatim (OQ #4) / import ChevronLeft, Loader2 from lucide-react ≥1 + <ChevronLeft size={20} ≥1 + <Loader2 ≥1 (OQ #5)."
    - "★ 비즈 anchor 11건 보존 grep gate PASS: legalApi 4종 + useQuery 2 + invalidateQueries 3 키 + headerTitle 종합정밀/작동기능 + sortedFindings open-first + adminBar role admin + findingCard navigate 자식 + handleZipDownload iOS PWA + ZIP round.title + toast 8 + finding borderLeft 2px + @keyframes blink (.6/.3)."
    - "App.tsx + 외부 10 파일 변경 0 byte: `git diff --name-only HEAD~ HEAD -- cha-bio-safety/src/App.tsx cha-bio-safety/src/components/PhotoGrid.tsx cha-bio-safety/src/components/PhotoSourceModal.tsx cha-bio-safety/src/components/FindingFormSheet.tsx cha-bio-safety/src/hooks/useMultiPhotoUpload.ts cha-bio-safety/src/utils/findingDownload.ts cha-bio-safety/src/utils/api.ts cha-bio-safety/src/stores/authStore.ts cha-bio-safety/src/pages/LegalPage.tsx cha-bio-safety/src/pages/LegalFindingDetailPage.tsx cha-bio-safety/tailwind.config.js` 빈 출력."
    - "Build gate: `cd cha-bio-safety && npx tsc --noEmit` 0 errors + `cd cha-bio-safety && npm run build` exit 0 (Vite build PASS). LegalFindingsPage chunk size 보고."
    - "Atomic 1-commit (단일 파일): `feat(quick-260524-bbz): redesign/20-legal-findings TSX 변환 (LegalFindingsPage.tsx 378→{N} lines 단일 atomic + v0.1.x 토큰 className + 비즈 anchor 11 보존 + Lucide ChevronLeft+Loader2 + back 44x44 + OQ LOCKED 5건 + W5 §1 매핑 verbatim)`. SUMMARY 별도 commit."

  artifacts:
    - path: cha-bio-safety/src/pages/LegalFindingsPage.tsx
      provides: v0.1.x 토큰 className 적용 (외곽 / 모바일 자체 헤더 / 동적 헤더 타이틀 종합정밀·작동기능 / 필터 / sortedFindings 카드 / status 칩 2 토큰 / borderLeft 2px / admin 도구 / addButton 인라인 그라데이션 / ZIP 다운로드 button / 보고서 업로드 button / 빈/오류 / Spinner 폐기 후 Loader2 직접 mount) + Lucide 2종 교체 (ChevronLeft 모바일 헤더 + Loader2 spinner, IconChevronLeft / polyline / 인라인 SVG path / Spinner 함수 정의 완전 제거) + back button 44x44 격상 + OQ #1 모바일 헤더 bg-surface-raised border-b border-border-default + OQ #2 finding borderLeft 2px (★ 19-legal 3px 와 다름) + status 칩 토큰 + OQ #3 9·10·11 → text-caption + leading-none 격상 + OQ #4 addButton 인라인 그라데이션 + 작은 도구 solid + 빈/오류 verbatim + OQ #5 Lucide 2종 + 비즈 anchor 11건 (legalApi 4종 + useQuery 2 + invalidateQueries 3 키 + headerTitle 종합정밀/작동기능 + sortedFindings open-first + adminBar role admin + findingCard navigate 자식 + handleZipDownload iOS PWA + ZIP round.title + toast 8 + finding borderLeft 2px + @keyframes blink .6/.3) 1 byte 변경 0
      contains: "bg-surface-page / bg-surface-raised / bg-surface-sunken / bg-surface-active / border-border-default / border-border-strong / border-2 / border-accent / text-text-primary / text-text-secondary / text-text-tertiary / text-text-on-accent / bg-safe-bg / text-safe / border-safe-bar / bg-danger-bg / text-danger / border-danger-bar / bg-accent / text-body / text-body-sm / text-label / text-caption / font-bold / font-extrabold / leading-none / leading-relaxed / rounded-full / rounded-md / rounded-sm / border-l-2 / ChevronLeft / Loader2 / size={20} / animate-spin / from 'lucide-react' / w-11 / h-11 / legal-findings / legal-round / legal-rounds / legalApi / report_file_key / sortedFindings / handleZipDownload / 지적사항_ / 종합정밀 / 작동기능 / 보고서 업로드 완료 / 삭제됨 / 점검 결과 저장 / 다운로드 완료 / 저장 실패 / 업로드 실패 / 삭제 실패 / 다운로드 실패 / 지적사항 없음 / 항목을 불러오지 못했습니다 / linear-gradient(135deg, #1d4ed8, #0ea5e9) / @keyframes blink"
      min_lines: 350

  key_links:
    - from: "W5 §1 영역 1~3 매핑 verbatim (368 lines, 12 섹션)"
      to: cha-bio-safety/src/pages/LegalFindingsPage.tsx line 1~378
      via: "영역 1 (line 1~40) imports + Lucide ChevronLeft+Loader2 추가 + fmtDate/fmtMonthOnly className + SKELETON className + Spinner 함수 line 32 폐기. 영역 2 (line 41~290) 메인 함수 useQuery 2종 + state + handlers + handleZipDownload iOS PWA + ZIP 파일명 + headerTitle 동적 분기 + sortedFindings open-first + adminBar role admin + findingCard navigate 자식. 영역 3 (line 291~378) JSX render 모바일 자체 헤더 + back 44x44 + ChevronLeft size 20 + finding 카드 border-l-2 (2px) + 칩 status 토큰 + addButton 인라인 그라데이션 (CTA) + admin solid 작은 도구."
      pattern: "영역 1|영역 2|영역 3|imports|메인 함수|JSX render"

    - from: "W1 §7 OQ LOCKED 5건 + 비즈 anchor 11 (724 lines, sketch index)"
      to: cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md
      via: "OQ #1 모바일 헤더 raised + border-b / OQ #2 finding border-l-2 (★ 2px, 19-legal 3px 와 다름) + status 토큰 status- prefix 없음 / OQ #3 9·10·11 → text-caption 12 leading-none / OQ #4 addButton 인라인 그라데이션 1건 메인 CTA + 작은 도구 solid + 빈/오류 verbatim 아이콘 X / OQ #5 Lucide ChevronLeft (back 44x44) + Loader2 (Spinner 함수 폐기). 비즈 anchor 11 — legalApi 4 + useQuery 2 + invalidateQueries 3 키 + headerTitle 동적 + sortedFindings open-first + adminBar role admin + findingCard navigate + handleZipDownload iOS PWA + ZIP round.title + toast 8 + finding borderLeft 2px / blink .6/.3."
      pattern: "OQ #1|OQ #2|OQ #3|OQ #4|OQ #5|LOCKED|border-l-2"

    - from: "W2~W4 sketch (sketch HTML 시각 검증, read-only reference)"
      to: cha-bio-safety/docs/redesign-context/20-legal-findings/ sketch-wave-{2,3,4}-*.html
      via: "변환 매핑 시각 검증 — chrome / finding-card / panel sketch HTML. 변경 0 byte (read-only)."
      pattern: "sketch-wave-(2|3|4)"

    - from: "토큰 / Tailwind config (utility class 검증)"
      to: cha-bio-safety/src/styles/tokens.css + cha-bio-safety/tailwind.config.js
      via: "v0.1.x 토큰 확인 — --surface-page/raised/sunken/active / --text-primary/secondary/tertiary/on-accent / --border-default/strong / --accent / --status-{safe,danger}-{bar,bg}. tailwind.config 매핑 bg-surface-* / border-border-* / text-text-* / bg-accent / bg-{safe,danger}-bg / border-{safe,danger}-bar. **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern`). border-l-2 utility 확인 (Tailwind 기본 2px)."
      pattern: "surface-page|surface-raised|surface-sunken|safe-bg|danger-bg|safe-bar|danger-bar|border-l-2"

    - from: "legalApi (utils/api.ts, 0 byte 변경 = 가드)"
      to: cha-bio-safety/src/utils/api.ts
      via: "legalApi 4종 시그니처 (getFindings/get/deleteFinding/updateResult 또는 W1 §1.3 명시) + snake_case payload (report_file_key 등) verbatim. 본 페이지 변환 후에도 0 byte 변경."
      pattern: "legalApi|report_file_key"

  scope_negatives:
    - "1 파일만 수정 — cha-bio-safety/src/pages/LegalFindingsPage.tsx 외 src/ 트리 변경 0건"
    - "App.tsx 변경 0 byte (final verify gate)"
    - "외부 10 파일 변경 0 byte: components/PhotoGrid.tsx / components/PhotoSourceModal.tsx / components/FindingFormSheet.tsx / hooks/useMultiPhotoUpload.ts / utils/findingDownload.ts / utils/api.ts / stores/authStore.ts / pages/LegalPage.tsx / pages/LegalFindingDetailPage.tsx / tailwind.config.js"
    - "tokens.css / typography.css / types/ / functions/ / templates/ / migrations/ / public/ 모두 0 byte 변경"
    - "sketch HTML (W2 chrome / W3 finding-card / W4 panel) + W5 checklist (368) + W1 index (724) 모두 0 byte 변경 (read-only reference)"
    - "wrangler 명령 0건 (CLAUDE.local.md 디자인 워크트리 강제)"
    - "npm run deploy 0건 (직원 도메인 cbc7119 경로)"
---

<objective>
redesign/20-legal-findings TSX 변환 — LegalFindingsPage.tsx (378 lines) **단일 파일 atomic in-place 수정**.

W2 (chrome) + W3 (finding-card) + W4 (panel) sketch + W5 12 섹션 checklist (368) + W1 OQ 5건 LOCKED 결정 (724) 을 1-commit 으로 적용. **★ 비즈 anchor 11건 1 byte 변경 0**. **★ Lucide 2종 교체** (ChevronLeft 모바일 헤더 back button + Loader2 spinner, 인라인 SVG path + Spinner 함수 정의 완전 제거, OQ #5 LOCKED). **★ back button 44x44 격상** (옛 36x36, w-8 함정 회피, `w-11 h-11` 또는 인라인 `width:44, height:44` 명시).

19-legal (lft) 571 lines mirror 패턴 — 단, 본 20-legal-findings 는 `/legal/:id` sub-route 단일 export (LegalFindingsPage default) + 3 영역 (imports / 메인 함수 / JSX render) 통합 변환. lft 보다 단순 (378 < 571, 3 컴포넌트 분리 없음, 5 helper 없음). **★ finding border-l-2 (2px, 19-legal 3px 와 다름) ★** 는 본 페이지 고유 anchor.

Purpose:
- v0.1.x 토큰 className 으로 옛 인라인 `var(--bg) / var(--bg2) / var(--bg3) / var(--bg4) / var(--bd) / var(--bd2) / var(--t1) / var(--t2) / var(--t3) / var(--acl) / var(--safe) / var(--danger)` 치환
- **OQ #1 LOCKED**: 모바일 자체 헤더 → `bg-surface-raised border-b border-border-default`. 옛 `background:rgba(22,27,34,0.97), borderBottom:1px solid var(--bd)` 완전 폐기
- **OQ #2 LOCKED**: finding 카드 **border-l-2 (★ 2px, 19-legal 3px 와 다름) ★** + status 칩 토큰 매핑. open `bg-danger-bg text-danger` + `border-danger-bar` / resolved `bg-safe-bg text-safe` + `border-safe-bar`. 옛 rgba + var() 완전 폐기. **status- prefix 없음**
- **OQ #3 LOCKED**: 9·10·11 fontSize → `text-caption font-bold leading-none` (12 격상). 인라인 0건
- **OQ #4 LOCKED**: **★ addButton (메인 CTA) 인라인 그라데이션** `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 1건 (lft 1건 mirror) + admin 저장 / ZIP / 보고서 업로드 button 은 `bg-accent text-text-on-accent` solid (작은 도구는 그라데이션 아님, executor 판단으로 admin 저장/ZIP 도 그라데이션 가능 — 사용자 시각 검수 후 결정). 빈/오류 카피 verbatim. 아이콘 / SVG 추가 X
- **OQ #5 LOCKED**: Lucide 2종 교체 — `import { ChevronLeft, Loader2 } from 'lucide-react'` 추가 1줄. (a) 모바일 헤더 back button 인라인 SVG path 또는 IconChevronLeft 완전 제거 → `<ChevronLeft size={20} />` + back button 36x36 → **44x44 격상**. (b) **Spinner 함수 line 32 정의 완전 폐기** → `<Loader2 className="animate-spin" size={N} />` 직접 사용 (모든 호출처)
- ★ 비즈 anchor 11건 **1 byte 변경 0** (§3 박제)
- 비즈 로직 0 diff (state/handler/effect/hook/queryKey/mutation/legalApi 4종/snake_case payload/role admin 분기/sortedFindings/handleZipDownload iOS PWA/headerTitle 동적/ZIP round.title 모두 보존)

Output:
- cha-bio-safety/src/pages/LegalFindingsPage.tsx 단일 파일 in-place 수정 (378 → 350~410 lines 예상)
- App.tsx + 외부 10 파일 + tailwind.config.js + tokens.css + typography.css + hooks/ + stores/ + types/ + functions/ + templates/ + migrations/ + public/ 모두 0 byte 변경
- `npm run build` PASS
- atomic 1-commit (단일 파일) + SUMMARY 별도 commit
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.md
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.local.md
@/Users/jykevin/Documents/cbc7119-design/.planning/STATE.md

# W5 TSX 변환 checklist (SOURCE OF TRUTH — §1 매핑 verbatim, 12 섹션)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md

# W1 sketch index (OQ LOCKED 5건 + biz anchor 11 + 19-legal 차이 5건 원본)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md

# 토큰 / Tailwind config (utility class 검증, read-only)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/styles/tokens.css
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/tailwind.config.js

# Precedent — 19-legal lft PLAN.md (mirror skeleton)
@/Users/jykevin/Documents/cbc7119-design/.planning/quick/260523-lft-redesign-19-legal-tsx-legalpage-tsx-571-/260523-lft-PLAN.md

# 변환 대상 (in-place 수정 단일 파일, executor 가 Read 로 직접 확인)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/LegalFindingsPage.tsx

# 변환 무영향 — 0 byte 변경 (final verify gate)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/App.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/components/PhotoGrid.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/components/PhotoSourceModal.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/components/FindingFormSheet.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/hooks/useMultiPhotoUpload.ts
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/utils/findingDownload.ts
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/utils/api.ts
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/stores/authStore.ts
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/LegalPage.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/LegalFindingDetailPage.tsx

</context>

<tasks>

<task type="auto">
  <name>Task 1: LegalFindingsPage.tsx 단일 파일 atomic v0.1.x 토큰 변환 (in-place, 비즈 anchor 11건 + Lucide 2종 교체 + Spinner 함수 폐기 + back 44x44 격상 + OQ LOCKED 5건, atomic 1-commit)</name>
  <files>cha-bio-safety/src/pages/LegalFindingsPage.tsx</files>
  <action>

LegalFindingsPage.tsx 378 lines 를 **단일 atomic commit** 으로 in-place 수정하여 v0.1.x 토큰 className 으로 치환한다. **23-education (r22) / 19-legal (lft) / 17-annual-plan (1hj) / 27-login (gox) / 16-workshift (u5n) mirror 패턴 — 단일 파일 atomic**. 19-legal (lft) 571 lines 3 컴포넌트 + 5 helper 와 달리 본 378 lines 는 단일 export (LegalFindingsPage default) + 3 영역 (imports / 메인 함수 / JSX render) 통합 변환. 비즈 로직(useState/useNavigate/useParams/useQuery 2종/useMutation/legalApi 4종/snake_case payload/sortedFindings open-first/handleZipDownload iOS PWA/headerTitle 동적 종합정밀·작동기능/adminBar role admin/findingCard navigate 자식/ZIP round.title) 1 byte 변경 0. **★ 비즈 anchor 11건 + Lucide 2종 교체 ((a) ChevronLeft back + (b) Loader2 spinner Spinner 함수 폐기) + back button 44x44 격상 모두 grep PASS**.

## 0. 사전 확인 (필수)

```bash
# 0-1. branch 확인 (worktree-aware)
git branch --show-current   # 기대: redesign/20-legal-findings
git status --short          # 기대: 빈 출력 (clean) 또는 PLAN.md 만

# 0-2. branch base 검증
EXPECTED_BASE="origin/main"
git merge-base HEAD "$EXPECTED_BASE" >/dev/null 2>&1 && echo "branch base OK" || echo "branch base FAIL"

# 0-3. 변환 대상 파일 라인 수 baseline
wc -l cha-bio-safety/src/pages/LegalFindingsPage.tsx   # 기대: 378

# 0-4. App.tsx + 외부 10 파일 baseline (0 byte 변경 verify gate)
for f in cha-bio-safety/src/App.tsx \
         cha-bio-safety/src/components/PhotoGrid.tsx \
         cha-bio-safety/src/components/PhotoSourceModal.tsx \
         cha-bio-safety/src/components/FindingFormSheet.tsx \
         cha-bio-safety/src/hooks/useMultiPhotoUpload.ts \
         cha-bio-safety/src/utils/findingDownload.ts \
         cha-bio-safety/src/utils/api.ts \
         cha-bio-safety/src/stores/authStore.ts \
         cha-bio-safety/src/pages/LegalPage.tsx \
         cha-bio-safety/src/pages/LegalFindingDetailPage.tsx \
         cha-bio-safety/tailwind.config.js; do
  git rev-parse "HEAD:$f" 2>/dev/null | head -c 12; echo "  $f"
done

# 0-5. 인라인 alias / 이모지 / 인라인 SVG / Spinner 함수 현 상태 (negative gate baseline)
grep -c "var(--" cha-bio-safety/src/pages/LegalFindingsPage.tsx              # baseline: 다수 (변환 후 0)
grep -cE "function Spinner|const Spinner" cha-bio-safety/src/pages/LegalFindingsPage.tsx  # baseline: 1 (변환 후 0)
grep -c "M15 19l-7-7 7-7" cha-bio-safety/src/pages/LegalFindingsPage.tsx     # baseline: ? (확인 후 변환 후 0)
grep -c "linear-gradient" cha-bio-safety/src/pages/LegalFindingsPage.tsx     # baseline: 0 (변환 후 ≥1 = OQ #4 addButton 추가)
```

## 1. 변환 매핑 (W5 §1 verbatim — 3 영역, 추측 0건)

> **executor 는 LegalFindingsPage.tsx 한 번 Read 로 378 lines 전체 확인 후, 아래 영역 분할에 따라 in-place Edit 적용.**
> **W5 checklist (368 lines) 가 SOURCE OF TRUTH — 본 PLAN.md 와 충돌 시 W5 checklist 우선.**

### §1.1 영역 1 — Imports + 상단 유틸 (line 1~40, W5 §1 영역 1)

| 현재 (인라인, line) | 변환 후 (className) | sketch / OQ |
|---|---|---|
| imports (line 1~13 추정) | **그대로** + **추가 1줄**: `import { ChevronLeft, Loader2 } from 'lucide-react'` (OQ #5 LOCKED) | OQ #5 |
| fmtDate / fmtMonthOnly 포맷터 | **그대로** (비즈 anchor — Date 포맷팅) + 사용처 className 만 후속 영역에서 격상 | - |
| SKELETON 정의 | className `bg-surface-sunken rounded-md` + 인라인 height + animation 'blink 2s ease-in-out infinite' (★ 비즈 anchor 11 blink .6/.3 보존). 옛 `background: 'var(--bg3)', borderRadius: 12` 완전 폐기 | OQ #1 |
| **★ Spinner 함수 (line 32 추정) ★★★** | **완전 폐기 (OQ #5 LOCKED)** — `function Spinner() { return <div style={{ ... animation: 'spin ...' }} /> }` 또는 `const Spinner = ...` 정의 완전 제거 + `<style>{'@keyframes spin{...}'}</style>` 완전 제거. 모든 호출처 (`<Spinner />`) → `<Loader2 className="animate-spin" size={N} />` 직접 치환 (N 은 호출처 size 별 16/20/24 중 적절히, W5 §1 영역 1 명시 따름) | OQ #5 |

### §1.2 영역 2 — 메인 함수 LegalFindingsPage (line 41~290, W5 §1 영역 2)

| 현재 (인라인 / 비즈 로직, line) | 변환 후 (className + 인라인) | sketch / OQ |
|---|---|---|
| **★ useParams (roundId 추출) + useNavigate + useState (selectedFindingId / editingFinding 등)** | **그대로** (★ 비즈 anchor 7 — findingCard navigate 자식 진입 `/legal/:roundId/findings/:findingId` 또는 sub-route) | - |
| **★ useQuery × 2 — round 메타 + findings 목록** | **그대로** (★ 비즈 anchor 2) — `queryKey: ['legal-round', roundId]` + `queryKey: ['legal-findings', roundId]` + `enabled: !!roundId` + `staleTime: 30_000` 1 byte 변경 0 | - |
| **★ legalApi 4종 호출 (getFindings / get / deleteFinding / updateResult 또는 W1 §1.3 명시)** | **그대로** (★ 비즈 anchor 1) — snake_case payload (`report_file_key` 등) verbatim. utils/api.ts 0 byte 변경 = 가드 | - |
| **★ invalidateQueries 3 키 (handleDelete + handleReportUpload + 점검 결과 저장)** | **그대로** (★ 비즈 anchor 3) — `['legal-findings', roundId]` + `['legal-round', roundId]` + `['legal-rounds']` invalidate 1 byte 변경 0 | - |
| handleZipDownload (★ iOS PWA `<a download>` 트리거) | **그대로** (★ 비즈 anchor 8) — fflate dynamic import + zipSync + `<a href={url} download={`지적사항_${round?.title ?? 'report'}.zip`} />` (iOS PWA 호환 — memory `feedback_ios_pwa_push_silent_drop` 일반화) + toast '다운로드 완료' / '다운로드 실패' verbatim | - |
| **★ headerTitle 동적 분기** | **그대로** (★ 비즈 anchor 4) — `round?.title` 또는 type 기반 종합정밀 / 작동기능 분기 1 byte 변경 0 | - |
| **★ sortedFindings open-first + createdAt desc localeCompare** | **그대로** (★ 비즈 anchor 5) — open status 먼저 + createdAt desc 정렬 1 byte 변경 0 | - |
| toast 카피 8종 (★ 비즈 anchor 9) | **그대로** — success 4 + error 4 verbatim | - |

### §1.3 영역 3 — JSX render (line 291~378, W5 §1 영역 3, OQ #1+#2+#3+#4+#5 통합 적용)

| 현재 (인라인 style, 추정 line) | 변환 후 (className + 인라인) | sketch / OQ |
|---|---|---|
| **★ 모바일 자체 헤더 (OQ #1 LOCKED + OQ #5 LOCKED) ★★★** | 옛 `style={{ background:'rgba(22,27,34,0.97)', borderBottom:'1px solid var(--bd)', ... }}` → className `bg-surface-raised border-b border-border-default flex items-center justify-center relative flex-shrink-0` + 인라인 `height:48`. **★ back button OQ #5 ★★★**: 옛 인라인 SVG `<svg ...><path d="M15 19l-7-7 7-7" /></svg>` 또는 `<IconChevronLeft />` 완전 제거 → `<ChevronLeft size={20} />`. width:36, height:36 → **width:44, height:44 격상** (w-8 함정 회피 — `className="w-11 h-11"` 또는 인라인 `width:44, height:44` 명시. 일관성으로 `w-11 h-11` 권장, memory `feedback_tailwind_w8_h8_is_48px`) + 인라인 `position:absolute, left:8, background:none, border:none, cursor:pointer, display:flex, alignItems:center, justifyContent:center, color:'var(--text-primary)' 또는 className text-text-primary`. **★ 타이틀 동적 (★ 비즈 anchor 4)**: `{round?.title}` 또는 종합정밀/작동기능 분기 className `text-body font-bold text-text-primary` (verbatim) | OQ #1 + OQ #5 |
| 필터 영역 (탭 / 검색 등) | className `bg-surface-raised border-b border-border-default flex-shrink-0` + 인라인 padding. 탭 button className `${active ? 'bg-surface-active text-text-primary' : 'text-text-tertiary'} text-caption font-bold leading-none` + 인라인 flex 1 + height + borderBottom 분기 `var(--accent)` 인라인 | OQ #3 |
| 목록 외곽 | 인라인 `flex:1, overflowY:'auto', padding:'12px 16px', display:'flex', flexDirection:'column', gap:8` 유지 | - |
| 로딩 SKELETON × N | `<div className="bg-surface-sunken rounded-md" style={{ height:72, animation:'blink 2s ease-in-out infinite' }} />` × N (★ 비즈 anchor 11 blink .6/.3) | OQ #1 |
| **★ 로딩 Spinner 호출처 ★★★** | 옛 `<Spinner />` → `<Loader2 className="animate-spin text-accent" size={24} />` (또는 size 적절). Spinner 함수 정의 영역 1 에서 폐기 | OQ #5 |
| 빈 '지적사항 없음' | className `flex-1 flex items-center justify-center text-label text-text-tertiary` (verbatim) | OQ #4 |
| 오류 '항목을 불러오지 못했습니다.' | className `text-label text-text-secondary` (verbatim) | OQ #4 |
| **★ sortedFindings 카드 외곽 (OQ #2 LOCKED — border-l-2 ★ 2px, 19-legal 3px 와 다름 ★) ★★★** | 옛 `style={{ background:'var(--bg3)', border:'1px solid var(--bd)', borderLeft: '2px solid '+(f.status==='open' ? 'var(--danger)' : 'var(--safe)'), borderRadius:10, padding:10, ... }}` → className `bg-surface-sunken rounded-md border border-border-default **border-l-2** ${f.status==='open' ? 'border-danger-bar' : 'border-safe-bar'}` + 인라인 `padding:10, cursor:'pointer', display:'flex', flexDirection:'column', gap:2`. (★ **border-l-2 = 2px**, 19-legal lft `border-l-[3px]` 와 다름 — W1 §1.4 19-legal 차이 5건 anchor) | OQ #2 |
| finding 카드 description | className `text-label font-medium text-text-primary` + 인라인 ellipsis | OQ #3 |
| **finding 카드 status 칩 (OQ #2 + OQ #3)** | open `bg-danger-bg text-danger text-caption font-bold leading-none rounded-sm` + 라벨 '미조치' / resolved `bg-safe-bg text-safe text-caption font-bold leading-none rounded-sm` + 라벨 '완료' + 인라인 padding '1px 6px' + flexShrink 0. 옛 rgba bg + var() color + fontSize 10 완전 폐기. **status- prefix 없음** | OQ #2 + OQ #3 |
| finding 카드 메타 (location / createdAt / 수정·삭제) | className `text-caption leading-none text-text-secondary` / `text-text-tertiary`. 수정/삭제 button className `text-caption leading-none text-text-tertiary` + 인라인 background none + border none + cursor + padding | OQ #3 |
| **★ adminBar (role==='admin' 분기, ★ 비즈 anchor 6)** | **그대로** — admin 도구 select / 저장 / 보고서 업로드 / ZIP 다운로드 button. **저장 button** className `bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm` + 인라인 height 28 + padding '0 10px' + opacity 분기. **보고서 / ZIP button** 동일 패턴 (작은 도구 solid, 그라데이션 아님 — 단, executor 판단으로 ZIP 도 그라데이션 적용 가능, 사용자 시각 검수 후 결정) | OQ #4 |
| **★ addButton (메인 CTA, OQ #4 LOCKED 인라인 그라데이션) ★★★ (OQ #4 anchor)** | 옛 `style={{ background:'var(--acl)', color:'#fff', height:40, ... }}` 또는 fixed bottom button → className `text-text-on-accent text-label font-bold rounded-md` + 인라인 `width:'100%' 또는 fixed bottom 적절, height:44 (옛 40 → 44 격상 권장), border:'none', cursor:'pointer'` + **`background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'`** (★ OQ #4 LOCKED 예외 anchor, var(--acl) 완전 폐기). 안쪽 텍스트 '지적사항 추가' 또는 verbatim. onClick `setEditingFinding({ ... })` verbatim | OQ #4 |
| FindingFormSheet mount (있을 시) | **그대로** (외부 컴포넌트 0 byte 변경) | - |

> **★ executor 주의**: W5 checklist (368 lines) 가 SOURCE OF TRUTH. 위 표는 19-legal lft 패턴 mirror + W1 §1.4 19-legal 차이 5건 (border-l-2 = 2px 등) 반영 요약. **충돌 시 W5 checklist 우선**, executor 가 Read 후 line 번호 / 정확한 매핑 확정.

## 2. OQ 5건 LOCKED 결정 (W1 §7 + W5 §4 verbatim — 위반 0건)

### OQ #1 LOCKED — 모바일 자체 헤더 `bg-surface-raised border-b border-border-default`
- 모바일 헤더: `background:'rgba(22,27,34,0.97)', borderBottom:'1px solid var(--bd)'` 인라인 완전 제거 → className `bg-surface-raised border-b border-border-default`
- 인라인 `height:48, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', flexShrink:0` 유지
- grep gate `bg-surface-raised border-b border-border-default >= 1`

### OQ #2 LOCKED — finding border-l-2 (★ 2px, 19-legal 3px 와 다름 ★) + status 칩 (status- prefix 없음)
- **★ border-l-2 (2px)** ★ — 19-legal lft `border-l-[3px]` 와 다름. W1 §1.4 19-legal 차이 5건 anchor 1
- finding 카드 borderLeft 분기: open `border-danger-bar` / resolved `border-safe-bar`
- status 칩: open `bg-danger-bg text-danger` 미조치 / resolved `bg-safe-bg text-safe` 완료
- 옛 인라인 rgba bg + var(--danger/--safe) color 완전 제거
- 라벨 '미조치' / '완료' verbatim
- **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern` — 정확 = `bg-danger-bg` / 잘못 = `bg-status-danger-bg`)
- grep gate `border-l-2 >= 1` + `border-danger-bar >= 1` + `border-safe-bar >= 1` + `bg-danger-bg text-danger >= 1` + `bg-safe-bg text-safe >= 1`

### OQ #3 LOCKED — 9·10·11 fontSize → text-caption 12 leading-none 격상
- finding 칩 fontSize 10 → `text-caption font-bold leading-none`
- finding 카드 메타 fontSize 10·11 → `text-caption leading-none`
- admin 도구 fontSize 11 → `text-caption font-bold leading-none`
- 다운로드 button fontSize 11 → `text-caption font-bold leading-none`
- 탭 fontSize 11 → `text-caption font-bold leading-none`
- fontSize 9·10·11 인라인 0건 (negative gate)
- grep gate `text-caption >= 5` + `leading-none >= 5`

### OQ #4 LOCKED — addButton (메인 CTA) 인라인 그라데이션 ≥1 anchor + 작은 도구 solid bg-accent + 빈/오류 verbatim + 아이콘 X
- **★ addButton** (지적사항 추가 메인 CTA) 옛 `background:'var(--acl)'` 완전 제거 → 인라인 `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` 추가 (★ OQ #4 LOCKED 예외 anchor). height 40 → 44 격상. className `text-text-on-accent text-label font-bold rounded-md`
- **admin 저장 / 보고서 / ZIP 다운로드 button** → `bg-accent text-text-on-accent` solid (작은 도구는 그라데이션 아님, var(--acl) 완전 폐기. **단, executor 판단으로 ZIP 다운로드 도 그라데이션 적용 가능 — 사용자 시각 검수 후 결정**)
- **빈/오류 카피 verbatim** — '지적사항 없음' / '항목을 불러오지 못했습니다.' / toast 8종 (성공 4 + 실패 4)
- 아이콘 / lucide / SVG 추가 X (back button + Loader2 외 빈/오류 영역 아이콘 무)
- grep gate `linear-gradient(135deg, #1d4ed8, #0ea5e9) >= 1` + `bg-accent >= 1`

### OQ #5 LOCKED — Lucide 2종 교체 + back button 44x44 격상 + Spinner 함수 폐기
- **추가**: `import { ChevronLeft, Loader2 } from 'lucide-react'` (line 14 또는 imports 끝)
- **(a) 모바일 헤더 back button ChevronLeft 교체 + 44x44 격상**: 옛 인라인 SVG `<svg ...><path d="M15 19l-7-7 7-7" /></svg>` 또는 `<IconChevronLeft />` 완전 제거 → `<ChevronLeft size={20} />`. width:36 height:36 → **width:44 height:44 격상** (`w-11 h-11` 권장, 또는 인라인 명시. w-8 함정 회피)
- **(b) Spinner 함수 line 32 정의 완전 폐기 + Loader2 직접 사용**: 옛 `function Spinner() { return <div style={{ ... animation: 'spin .7s linear infinite' }} />; <style>{'@keyframes spin{...}'}</style> }` 완전 제거 + 모든 호출처 (`<Spinner />`) → `<Loader2 className="animate-spin text-accent" size={24} />` (size 호출처별 적절)
- **이모지 0** — 본 페이지 카메라 첨부 button 없음 (FindingDetailPanel 측 — LegalFindingDetailPage.tsx, 본 페이지 해당 없음)
- grep gate `import { ChevronLeft, Loader2 } from 'lucide-react' >= 1` + `<ChevronLeft size={20} >= 1` + `<Loader2 >= 1` + `function Spinner = 0` + `const Spinner = 0` + `M15 19l-7-7 7-7 = 0` + `IconChevronLeft = 0` + `polyline = 0` + `@keyframes spin = 0`

## 3. ★ 비즈 anchor 11건 보존 (19-legal lft / 23-education r22 precedent — 1 byte 변경 금지)

다음은 **변경 0** — className 추가 + 인라인 alias 토큰 제거 외 logic / 상수 / 값 / 카피 / 시그니처 라인 손대지 않음:

1. **legalApi 4종 시그니처** — getFindings / get / deleteFinding / updateResult (또는 W1 §1.3 명시). **snake_case payload** (`report_file_key` 등). utils/api.ts 0 byte 변경 = 가드.

2. **useQuery × 2** — `['legal-round', roundId]` + `['legal-findings', roundId]` + `enabled: !!roundId` + `staleTime: 30_000`. 캐시 키 + 자동 갱신 anchor.

3. **invalidateQueries 3 키** — `['legal-findings', roundId]` + `['legal-round', roundId]` + `['legal-rounds']`. handleDelete + handleReportUpload + 점검 결과 저장 시 cross-key invalidate. LegalPage 와 동일 키 패턴 (lft 비즈 anchor 2~4 와 일치).

4. **headerTitle 동적 분기** — `round?.title` 또는 type 기반 종합정밀 / 작동기능 분기. 사용자 헤더 카피 자동 변경 anchor.

5. **sortedFindings open-first + createdAt desc localeCompare** — open status 먼저 + createdAt desc 정렬. memory `project_inspection_completion_rule` 일반화.

6. **adminBar role==='admin' 분기** — staff.role 검사 후 admin 도구 영역 mount. memory `project_inspection_completion_rule` 권한 분기 일반화.

7. **findingCard navigate 자식 진입** — `/legal/:roundId/findings/:findingId` 또는 sub-route. navigate 시 selectedFindingId 또는 URL state 변경. lft handleRoundClick isDesktop 분기와 다른, 본 페이지 고유 패턴 (sub-route 단방향).

8. **handleZipDownload iOS PWA `<a download>` 트리거** — fflate dynamic import + zipSync + `<a href={blob URL} download={`지적사항_${round?.title ?? 'report'}.zip`} />`. iOS PWA 호환 (memory `feedback_ios_pwa_push_silent_drop` 일반화 — PWA window 안 fetch + a.click 패턴).

9. **toast 카피 8종 verbatim** — success 4 ('보고서 업로드 완료' / '삭제됨' / '점검 결과 저장' / '다운로드 완료') + error 4 ('저장 실패' / '업로드 실패' / err?.message ?? '삭제 실패' / '다운로드 실패'). 추정 카피 — executor 가 Read 후 verbatim 확정.

10. **finding borderLeft 2px** (★ 19-legal 3px 와 다름 ★) — W1 §1.4 19-legal 차이 5건 anchor 1. `border-l-2` Tailwind 기본 2px utility.

11. **@keyframes blink (.6/.3)** — SKELETON 인라인 `animation: 'blink 2s ease-in-out infinite'` + 글로벌 또는 인라인 `<style>{'@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }'}</style>`. Education .4 / lft 동일 .6/.3 패턴 mirror.

## 4. 비즈 로직 0 diff 보존

### 메인 LegalFindingsPage (line 41~290 추정)
- imports 13개 + 추가 1줄 lucide-react 2종
- state + useParams + useNavigate
- useQuery × 2 + invalidateQueries 3 키
- handleZipDownload + headerTitle 동적
- sortedFindings + adminBar role admin

### JSX render (line 291~378 추정)
- 모바일 자체 헤더 + back 44x44 + ChevronLeft
- 필터 / 탭
- sortedFindings 카드 + border-l-2 (2px) + status 칩
- adminBar + addButton 인라인 그라데이션
- FindingFormSheet mount (있을 시)

### 카피 verbatim 전체 — toast 8 + 빈/오류 + 라벨

## 5. 작업 순서

1. wc -l 으로 378 baseline 확인
2. LegalFindingsPage.tsx 한 번 Read (378 lines 전체)
3. W5 checklist Read (368 lines) — SOURCE OF TRUTH 매핑 확정
4. App.tsx + 외부 10 파일 baseline hash 저장
5. Edit/Write in-place 수정 순서: §1.1 (imports + Spinner 폐기) → §1.2 (메인 함수 verbatim) → §1.3 (JSX render)
6. tsc --noEmit 0 errors 확인
7. build PASS 확인
8. negative gate + positive gate + biz anchor 11 모두 PASS 확인
9. atomic 1-commit:
   ```bash
   git add cha-bio-safety/src/pages/LegalFindingsPage.tsx .planning/quick/260524-bbz-redesign-20-legal-findings-tsx-legalfind/260524-bbz-PLAN.md
   git commit -m "feat(quick-260524-bbz): redesign/20-legal-findings TSX 변환 (LegalFindingsPage.tsx 378→{N} lines 단일 atomic + v0.1.x 토큰 className + 비즈 anchor 11 보존 + Lucide ChevronLeft+Loader2 + back 44x44 + OQ LOCKED 5건 + W5 §1 매핑 verbatim)"
   ```
10. SUMMARY 별도 commit:
    ```bash
    git add .planning/quick/260524-bbz-redesign-20-legal-findings-tsx-legalfind/260524-bbz-SUMMARY.md
    git commit -m "docs(quick-260524-bbz): redesign/20-legal-findings TSX 변환 SUMMARY"
    ```

## 6. 금지 사항

- wrangler 명령 0건 (CLAUDE.local.md 강제, 디자인 워크트리)
- npm run deploy 0건 (직원 도메인 cbc7119 경로)
- LegalFindingsPage.tsx 외 src 파일 수정 0건 (App.tsx + 외부 10 파일 + tailwind.config.js + tokens.css + typography.css + types/ + functions/ + templates/ + migrations/ + public/ 모두 무영향)
- **★ App.tsx + 외부 10 파일 변경 0 byte** — final verify gate
- status- prefix className 0건 (memory `feedback_tailwind_token_class_pattern`)
- w-8 / h-8 토큰 사용 0건 (=48px 함정, memory `feedback_tailwind_w8_h8_is_48px`) — back button 은 `w-11 h-11` (=44px) 또는 인라인 `width:44, height:44`
- var(--bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger) 잔존 0건
- linear-gradient 일반 0건. 예외 anchor: linear-gradient(135deg, #1d4ed8, #0ea5e9) (addButton, OQ #4 LOCKED) ≥1
- fontSize 9·10·11 인라인 0건 (OQ #3 LOCKED 격상)
- 이모지 0건 (본 페이지 카메라 첨부 없음 — FindingDetailPanel 측)
- 인라인 SVG path `d="M15 19l-7-7 7-7"` 0건 (OQ #5 LOCKED ChevronLeft 교체)
- **★ function Spinner / const Spinner 정의 0건** (OQ #5 LOCKED Loader2 직접 사용)
- **★ @keyframes spin 0건** (OQ #5 LOCKED Loader2 animate-spin 사용)
- IconChevronLeft 0건
- polyline 0건
- 비즈 로직 변경 0건 (state/handler/useMutation/useQuery 2종/legalApi 4종/snake_case payload/sortedFindings/handleZipDownload iOS PWA/headerTitle 동적/adminBar role admin/findingCard navigate 자식/ZIP round.title)
- **★ 비즈 anchor 11건 1 byte 변경 0건** — lft/r22 precedent
- **★ border-l-2 (2px) 유지 — 19-legal lft `border-l-[3px]` 패턴 복사 금지** (W1 §1.4 19-legal 차이 5건 anchor 1)
- App.tsx + 외부 10 파일 0 byte 변경 (final verify gate)

  </action>
  <verify>
    <automated>
# Path 변수
L="cha-bio-safety/src/pages/LegalFindingsPage.tsx"
APP="cha-bio-safety/src/App.tsx"
PG="cha-bio-safety/src/components/PhotoGrid.tsx"
PSM="cha-bio-safety/src/components/PhotoSourceModal.tsx"
FFS="cha-bio-safety/src/components/FindingFormSheet.tsx"
UMP="cha-bio-safety/src/hooks/useMultiPhotoUpload.ts"
FDL="cha-bio-safety/src/utils/findingDownload.ts"
API="cha-bio-safety/src/utils/api.ts"
AUTH="cha-bio-safety/src/stores/authStore.ts"
LP="cha-bio-safety/src/pages/LegalPage.tsx"
LFDP="cha-bio-safety/src/pages/LegalFindingDetailPage.tsx"
TW="cha-bio-safety/tailwind.config.js"

# ─── Negative gate ───
echo "=== Negative gate (LegalFindingsPage) ==="

# emoji range 검사 (이모지 0)
test "$(grep -oP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{26FF}]' "$L" 2>/dev/null | wc -l | tr -d ' ')" = "0" && echo "neg-L1 (emoji 0) PASS" || echo "neg-L1 FAIL"

# linear-gradient = 정확히 OQ #4 anchor 카운트 (총 카운트 = 그라데이션 anchor 카운트)
LG_TOTAL=$(grep -c "linear-gradient" "$L")
LG_ANCHOR=$(grep -c "linear-gradient(135deg, #1d4ed8, #0ea5e9)" "$L")
test "$LG_TOTAL" = "$LG_ANCHOR" && test "$LG_ANCHOR" -ge 1 && echo "neg-L2 (linear-gradient only OQ #4 anchor, count=$LG_ANCHOR) PASS" || echo "neg-L2 FAIL (total=$LG_TOTAL, anchor=$LG_ANCHOR)"

# fontSize 9·10·11 인라인 0
test "$(grep -v "^\s*//" "$L" | grep -cE "fontSize:\s*(9|10|11)[^0-9px]|font-size:\s*(9|10|11)[^0-9px]")" = "0" && echo "neg-L3 (no 9·10·11 fontSize) PASS" || echo "neg-L3 FAIL"

# status- prefix 0
test "$(grep -cE "\b(text|bg|border)-status-(safe|fire|warning|danger|caution|accent)" "$L")" = "0" && echo "neg-L4 (no status- prefix) PASS" || echo "neg-L4 FAIL"

# w-8 / h-8 0 (=48px 함정)
test "$(grep -cE "\bw-8\b|\bh-8\b" "$L")" = "0" && echo "neg-L5 (no w-8/h-8) PASS" || echo "neg-L5 FAIL"

# 옛 alias var(--bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger) 0
test "$(grep -cE "var\(--(bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger)\)" "$L")" = "0" && echo "neg-L6 (no legacy var alias) PASS" || echo "neg-L6 FAIL"

# 인라인 SVG path "M15 19l-7-7 7-7" 0
test "$(grep -c 'M15 19l-7-7 7-7' "$L")" = "0" && echo "neg-L7 (no inline SVG ChevronLeft path) PASS" || echo "neg-L7 FAIL"

# function Spinner / const Spinner 정의 0
test "$(grep -cE "(function|const)\s+Spinner" "$L")" = "0" && echo "neg-L8 (Spinner function/const defined 0) PASS" || echo "neg-L8 FAIL"

# @keyframes spin 0
test "$(grep -c "@keyframes spin" "$L")" = "0" && echo "neg-L9 (@keyframes spin 0) PASS" || echo "neg-L9 FAIL"

# IconChevronLeft / polyline 0
test "$(grep -cE "IconChevronLeft|polyline" "$L")" = "0" && echo "neg-L10 (IconChevronLeft/polyline 0) PASS" || echo "neg-L10 FAIL"

# ─── Positive gate ───
echo "=== Positive gate (LegalFindingsPage) ==="

# OQ #1
test "$(grep -c 'bg-surface-raised border-b border-border-default' "$L")" -ge 1 && echo "pos-L1 (OQ #1 mobile header) PASS" || echo "pos-L1 FAIL"

# OQ #2 — border-l-2 (★ 2px, 19-legal 3px 와 다름)
test "$(grep -c 'border-l-2' "$L")" -ge 1 && echo "pos-L2-border (border-l-2 = 2px) PASS" || echo "pos-L2-border FAIL"
test "$(grep -c 'border-safe-bar' "$L")" -ge 1 && echo "pos-L2-safe (border-safe-bar) PASS" || echo "pos-L2-safe FAIL"
test "$(grep -c 'border-danger-bar' "$L")" -ge 1 && echo "pos-L2-danger (border-danger-bar) PASS" || echo "pos-L2-danger FAIL"
test "$(grep -c 'bg-safe-bg text-safe' "$L")" -ge 1 && echo "pos-L2-chip-safe PASS" || echo "pos-L2-chip-safe FAIL"
test "$(grep -c 'bg-danger-bg text-danger' "$L")" -ge 1 && echo "pos-L2-chip-danger PASS" || echo "pos-L2-chip-danger FAIL"

# OQ #3 — text-caption / leading-none ≥5
test "$(grep -c 'text-caption' "$L")" -ge 5 && echo "pos-L3-caption (text-caption ≥5) PASS" || echo "pos-L3-caption FAIL"
test "$(grep -c 'leading-none' "$L")" -ge 5 && echo "pos-L3-leading (leading-none ≥5) PASS" || echo "pos-L3-leading FAIL"

# OQ #4 — addButton 그라데이션 ≥1 + bg-accent ≥1
test "$(grep -c 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' "$L")" -ge 1 && echo "pos-L4-gradient (OQ #4 addButton) PASS" || echo "pos-L4-gradient FAIL"
test "$(grep -c 'bg-accent' "$L")" -ge 1 && echo "pos-L4-accent (작은 도구 solid ≥1) PASS" || echo "pos-L4-accent FAIL"

# OQ #5 — Lucide imports + ChevronLeft + Loader2
test "$(grep -cE "import \{[^}]*ChevronLeft[^}]*Loader2[^}]*\} from ['\"]lucide-react['\"]|import \{[^}]*Loader2[^}]*ChevronLeft[^}]*\} from ['\"]lucide-react['\"]" "$L")" -ge 1 && echo "pos-L5-import PASS" || echo "pos-L5-import FAIL"
test "$(grep -c '<ChevronLeft' "$L")" -ge 1 && echo "pos-L5-chevron PASS" || echo "pos-L5-chevron FAIL"
test "$(grep -c '<Loader2' "$L")" -ge 1 && echo "pos-L5-loader PASS" || echo "pos-L5-loader FAIL"

# back button 44x44 격상 — w-11 h-11 또는 width:44 height:44
test "$(grep -cE 'w-11.*h-11|h-11.*w-11|width:\s*44.*height:\s*44|height:\s*44.*width:\s*44' "$L")" -ge 1 && echo "pos-L5-back44 (back 44x44) PASS" || echo "pos-L5-back44 FAIL"

# ─── ★ 비즈 anchor 11 보존 grep gate ───
echo "=== ★ 비즈 anchor 11 grep gate ==="
test "$(grep -cE "legalApi\.(getFindings|get|deleteFinding|updateResult)" "$L")" -ge 1 && echo "biz-A1 (legalApi 4종) PASS" || echo "biz-A1 FAIL"
test "$(grep -cE "queryKey:\s*\[['\"]legal-(round|findings)['\"]" "$L")" -ge 2 && echo "biz-A2 (useQuery × 2) PASS" || echo "biz-A2 FAIL"
test "$(grep -cE "invalidateQueries.*\[['\"]legal-(findings|round|rounds)['\"]" "$L")" -ge 1 && echo "biz-A3 (invalidateQueries 3 키) PASS" || echo "biz-A3 FAIL"
test "$(grep -cE "종합정밀|작동기능|round\?\.title|round\.title" "$L")" -ge 1 && echo "biz-A4 (headerTitle 동적) PASS" || echo "biz-A4 FAIL"
test "$(grep -cE "sort|sorted" "$L")" -ge 1 && echo "biz-A5 (sortedFindings) PASS" || echo "biz-A5 FAIL"
test "$(grep -cE "role.*admin|staff\??\.role" "$L")" -ge 1 && echo "biz-A6 (adminBar role admin) PASS" || echo "biz-A6 FAIL"
test "$(grep -cE "navigate\(" "$L")" -ge 1 && echo "biz-A7 (findingCard navigate) PASS" || echo "biz-A7 FAIL"
test "$(grep -cE "지적사항_.*\.zip|round\?\.title|report\.zip" "$L")" -ge 1 && echo "biz-A8-zip (ZIP round.title) PASS" || echo "biz-A8-zip FAIL"
test "$(grep -cE "toast\.(success|error)" "$L")" -ge 4 && echo "biz-A9 (toast ≥4) PASS" || echo "biz-A9 FAIL"
test "$(grep -c "border-l-2" "$L")" -ge 1 && echo "biz-A10 (border-l-2 = 2px ★ 19-legal 3px 와 다름) PASS" || echo "biz-A10 FAIL"
test "$(grep -cE "@keyframes blink|animation:\s*['\"]blink" "$L")" -ge 1 && echo "biz-A11 (@keyframes blink .6/.3) PASS" || echo "biz-A11 FAIL"

# ─── App.tsx + 외부 10 파일 0 byte 변경 (final verify gate) ───
echo "=== App.tsx + 외부 10 파일 0 byte 변경 verify ==="
CHANGED=$(git diff --name-only HEAD~ HEAD -- "$APP" "$PG" "$PSM" "$FFS" "$UMP" "$FDL" "$API" "$AUTH" "$LP" "$LFDP" "$TW" 2>/dev/null)
test -z "$CHANGED" && echo "external-0byte PASS (no external file changed)" || echo "external-0byte FAIL (changed: $CHANGED)"

# ─── Build gate ───
echo "=== Build gate ==="
( cd cha-bio-safety && npx tsc --noEmit ) && echo "tsc PASS" || echo "tsc FAIL"
( cd cha-bio-safety && npm run build ) && echo "build PASS" || echo "build FAIL"

# ─── Final line count ───
wc -l cha-bio-safety/src/pages/LegalFindingsPage.tsx
    </automated>
  </verify>
  <done>
- LegalFindingsPage.tsx 378 → 350~410 lines 단일 파일 in-place 수정 완료
- v0.1.x 토큰 className 적용 (외곽 / 모바일 헤더 / 필터 / sortedFindings 카드 border-l-2 (★ 2px) / status 칩 / adminBar / addButton 인라인 그라데이션 / 빈/오류)
- Lucide 2종 교체 완료 — ChevronLeft (back 44x44 격상) + Loader2 (Spinner 함수 폐기)
- OQ #1~#5 LOCKED 모두 적용 + Negative gate 10건 + Positive gate 10건 모두 PASS
- ★ 비즈 anchor 11건 1 byte 변경 0 grep PASS (A1~A11)
- ★ border-l-2 = 2px 유지 (19-legal lft border-l-[3px] 와 다름, W1 §1.4 anchor)
- App.tsx + 외부 10 파일 변경 0 byte 확인 (git diff --name-only 빈 출력)
- tsc --noEmit 0 errors + npm run build PASS
- atomic 1-commit (LegalFindingsPage.tsx + PLAN.md) + SUMMARY 별도 commit 완료
- 다음 단계: redesign/20-legal-findings 브랜치 push → main 머지 → GitHub Actions cbc7119-preview 자동 배포 → 사용자 컨펌
  </done>
</task>

</tasks>

<verification>
- LegalFindingsPage.tsx 단일 파일 in-place 수정 (외 src 파일 0건)
- W5 checklist (368 lines, SOURCE OF TRUTH) 12 섹션 + W1 index (724 lines) OQ LOCKED 5건 + 비즈 anchor 11 모두 적용
- ★ border-l-2 = 2px (19-legal lft border-l-[3px] 와 다름) 유지
- App.tsx + 외부 10 파일 (PhotoGrid + PhotoSourceModal + FindingFormSheet + useMultiPhotoUpload + findingDownload + api + authStore + LegalPage + LegalFindingDetailPage + tailwind.config) 0 byte 변경
- tsc + build PASS
- atomic 1-commit + SUMMARY 별도 commit
</verification>

<success_criteria>
- Negative gate 10건 모두 PASS (emoji 0 / linear-gradient anchor 카운트 일치 / fontSize 9·10·11 0 / status- prefix 0 / w-8 h-8 0 / 옛 alias 0 / 인라인 SVG path 0 / Spinner 함수 정의 0 / @keyframes spin 0 / IconChevronLeft+polyline 0)
- Positive gate 10건 모두 PASS (OQ #1 모바일 헤더 / OQ #2 border-l-2 + safe·danger bar + chip / OQ #3 text-caption + leading-none ≥5 / OQ #4 gradient + bg-accent / OQ #5 lucide imports + ChevronLeft + Loader2 + back 44x44)
- ★ 비즈 anchor 11 grep gate 모두 PASS (A1~A11)
- App.tsx + 외부 10 파일 변경 0 byte
- LegalFindingsPage chunk size 보고
- atomic 1-commit (LegalFindingsPage.tsx + PLAN.md) + SUMMARY 별도 commit
</success_criteria>

<output>
After completion, create `.planning/quick/260524-bbz-redesign-20-legal-findings-tsx-legalfind/260524-bbz-SUMMARY.md` covering:
- 변환 전후 라인 수 (378 → N)
- 적용된 OQ LOCKED 5건 결정 + 위반 0건 확인
- 비즈 anchor 11건 보존 grep 결과
- border-l-2 = 2px (★ 19-legal 3px 와 다름) anchor 박제
- App.tsx + 외부 10 파일 0 byte 변경 verify 결과
- Build gate (tsc + npm run build) 결과 + LegalFindingsPage chunk size
- 다음 단계 (브랜치 push + main 머지 + cbc7119-preview 자동 배포 + 사용자 컨펌)
- 메모리 박제 후보 (border-l-2 2px 차이 / Spinner 함수 폐기 후 Loader2 직접 사용 패턴 / 단일 파일 atomic 6번째 도달)
</output>

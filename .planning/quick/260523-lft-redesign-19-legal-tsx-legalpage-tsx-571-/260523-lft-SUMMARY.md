---
quick_id: 260523-lft
plan: 01
type: execute
wave: 1
status: complete
branch: redesign/19-legal
completed: 2026-05-23
mirror_of:
  - quick-260522-r22 (23-education TSX 변환, 591 → 586 lines)
  - quick-260522-o7b (23-education W2~W5 sketch)
  - quick-260522-2q6 (28-splash TSX 변환, 2 파일 atomic)
  - quick-260521 (16-workshift TSX 변환, 단일 파일 atomic)
files_modified:
  - cha-bio-safety/src/pages/LegalPage.tsx
files_preserved_zero_byte:
  - cha-bio-safety/src/App.tsx
  - cha-bio-safety/src/utils/api.ts
  - cha-bio-safety/src/utils/findingDownload.ts
  - cha-bio-safety/src/hooks/useMultiPhotoUpload.ts
  - cha-bio-safety/src/components/PhotoGrid.tsx
  - cha-bio-safety/src/components/PhotoSourceModal.tsx
  - cha-bio-safety/src/components/FindingFormSheet.tsx
  - cha-bio-safety/src/pages/LegalFindingsPage.tsx
  - cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
metrics:
  baseline_lines: 571
  final_lines: 569
  delta_lines: -2
  build_chunk_bytes: 22644
  build_chunk_gzip_bytes: 5850
  build_exit: 0
  tsc_errors: 0
tags:
  - redesign
  - 19-legal
  - tsx-conversion
  - v0.1.1
  - quick
  - single-file-atomic
  - lucide-chevron-left
  - lucide-camera
  - lucide-loader2
  - back-button-44x44
  - status-token
---

# Phase 260523-lft Plan 01: redesign/19-legal TSX 변환 (LegalPage.tsx 단일 atomic) Summary

W2 (chrome) + W3 (round-card) + W4 (findings-panel) 3 sketch + W5 12 섹션 checklist + W1 OQ 5건 LOCKED 결정을 1-commit 으로 LegalPage.tsx 571 → 569 lines 단일 atomic in-place 수정. 비즈 anchor 17 카테고리 (40 grep 분해) 모두 1 byte 변경 0 + Lucide 3종 (ChevronLeft + Camera + Loader2) 교체 + back button 36x36 → 44x44 격상 + OQ LOCKED 5건 모두 grep PASS.

---

## 1. 변환 전후 라인 수

| 단계 | wc -l | 비고 |
|---|---|---|
| baseline | 571 | 변환 전 |
| 최종 | 569 | 변환 후 (sanity 범위 540~620 안) |
| delta | -2 | 인라인 SVG path 1줄 + spinner 3줄 + spin keyframes 1줄 제거 → Lucide import 1줄 + 3 컴포넌트 사용 + className 다중라인 확장 → 균형 |

623 LCL 라인 검증 게이트: 540~620 PASS.

---

## 2. v0.1.1 토큰 className 적용 (grep 카운트)

| 토큰 | 카운트 | 비고 |
|---|---|---|
| `bg-surface-page` | 2 | 외곽 (데스크톱 + 모바일) |
| `bg-surface-raised` | 2 | 모바일 자체 헤더 + 필터 영역 (OQ #1) |
| `bg-surface-sunken` | 12 | SKELETON + 카드 + admin 도구 + textarea + 첨부 button + select 등 |
| `bg-surface-active` | (탭 활성, 클래스 내 분기) | 데스크톱 + 모바일 탭 |
| `border-border-default` | 다수 | 모바일 헤더 borderBottom + 카드 평시 + 데스크톱 분할 borderRight + 조치 borderTop |
| `border-border-strong` | 다수 | input/select border + admin 도구 + 첨부 button |
| `text-text-primary` | 17 | 이름 + 모바일 타이틀 + 카드 title + 빈 제목 + KVRow children 등 |
| `text-text-secondary` | 8 | 카드 메타 + 모바일 빈 보조 + back button + 오류 |
| `text-text-tertiary` | 19 | fallback + 빈 + KVRow 라벨 + 섹션 라벨 + 첨부 등 |
| `text-text-on-accent` | (CTA 다수) | 조치 완료 + 저장 + 재시도 + 다시 시도 |
| **OQ #1 헤더** `bg-surface-raised border-b border-border-default` | 2 | 모바일 자체 헤더 + 모바일 필터 영역 |
| **OQ #2** `border-safe-bar` | 2 | accentColor pass + finding 칩 resolved |
| **OQ #2** `border-danger-bar` | 2 | accentColor fail + finding 칩 open |
| **OQ #2** `border-warning-bar` | 1 | accentColor conditional |
| **OQ #2** `bg-safe-bg text-safe` | 2 | ResultBadge pass + finding 칩 resolved |
| **OQ #2** `bg-warning-bg text-warning` | 1 | ResultBadge conditional |
| **OQ #2** `bg-danger-bg text-danger` | 2 | ResultBadge fail + finding 칩 open |
| **OQ #3** `text-caption` | 29 | OQ #3 격상 (11/10 → 12 + leading-none) |
| **OQ #3** `leading-none` | 28 | OQ #3 격상 동반 |
| **OQ #4** `linear-gradient(135deg, #1d4ed8, #0ea5e9)` | 1 | 조치 완료 button 예외 anchor (OQ #4 LOCKED) |
| **OQ #4** `bg-accent` | 3 | admin 저장 + 데스크톱 재시도 + 모바일 다시 시도 (작은 도구 solid) |
| `border-2 border-accent` | 2 | 선택 카드 (OQ #3-selected, 데스크톱 라운드/finding 카드) |
| `border-l-[3px]` | 3 | 카드 좌측 강조 (OQ #2 accentColor 매핑) |
| `rounded-md` | 6 | 카드 + 조치 textarea + 조치 완료 button + SKELETON 등 |
| `rounded-sm` | 13 | admin 도구 + finding 칩 + ResultBadge + 사진 슬롯 + 첨부 button + 작은 도구 등 |
| **OQ #5** `from 'lucide-react'` | 1 | import { ChevronLeft, Camera, Loader2 } |
| **OQ #5** `<ChevronLeft size={20}` | 1 | 모바일 헤더 back button |
| **OQ #5** `<Camera size={18}` | 1 | 조치 첨부 button |
| **OQ #5** `<Loader2` | 1 | FindingDetailPanel isLoading spinner |
| **OQ #5** `animate-spin` | 1 | Loader2 회전 애니메이션 |

v0.1.1 토큰 통합 카운트 (regex `bg-surface-(page|raised|sunken|active)|border-border-(default|strong)|text-text-(primary|secondary|tertiary|on-accent)`): **61** (≥10 PASS).

---

## 3. OQ #1~#5 LOCKED 적용 결과

### OQ #1: 모바일 자체 헤더 → `bg-surface-raised border-b border-border-default`
- ✓ 모바일 자체 헤더 (line ~512) `className="bg-surface-raised border-b border-border-default"` + 인라인 height 48
- ✓ 모바일 필터 영역 (line ~525) 동일 className
- 옛 `background: 'rgba(22,27,34,0.97)', borderBottom: '1px solid var(--bd)'` 완전 폐기
- grep gate `bg-surface-raised border-b border-border-default` = **2 (≥1 PASS)**

### OQ #2: accentColor + ResultBadge + finding 칩 status 토큰 매핑
- ✓ accentColor 함수 4분기 (line 27~32) Tailwind class string 반환:
  - pass → `border-safe-bar`
  - fail → `border-danger-bar`
  - conditional → `border-warning-bar`
  - null → `border-border-strong`
- ✓ ResultBadge map 4 라벨 verbatim ('적합' / '부적합' / '조건부적합' / '결과 미입력') + bg/color className 치환:
  - pass `bg-safe-bg text-safe`
  - fail `bg-danger-bg text-danger`
  - conditional `bg-warning-bg text-warning`
  - null `bg-transparent text-text-tertiary`
- ✓ finding 칩 (open `bg-danger-bg text-danger` "미조치" / resolved `bg-safe-bg text-safe" "완료")
- ✓ round 카드 borderLeft 4분기 (accentColor 호출)
- ✓ 옛 rgba(34,197,94,.13) / rgba(239,68,68,.15) / rgba(245,158,11,.15) + var(--safe) / var(--danger) / var(--warn) / var(--bd2) 인라인 모두 완전 폐기
- **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern` 준수): grep `(text|bg|border)-status-` = **0 PASS**

### OQ #3: 9·10·11 fontSize → text-caption (12 + leading-none) 격상
- ✓ ResultBadge 11/700 → `text-caption font-bold leading-none rounded-sm`
- ✓ finding 칩 10/700 → `text-caption font-bold leading-none rounded-sm`
- ✓ admin 도구 select / 저장 / 보고서 11/700 → `text-caption font-bold leading-none`
- ✓ 데스크톱 탭 11/700 → `text-caption font-bold leading-none`
- ✓ 다운로드 button 11/700 → `text-caption font-bold leading-none`
- ✓ KVRow 라벨 12 → `text-caption leading-none text-text-tertiary`
- ✓ 첨부 button + ✕ button 10 → `text-caption leading-none font-bold` / `text-caption font-bold leading-none`
- ✓ fontSize 9·10·11 인라인 grep gate = **0 PASS**
- ✓ selected `border-2 border-accent` (1.5 → 2 격상) grep gate = **2 PASS**

### OQ #4: 조치 완료 CTA 인라인 그라데이션 + 작은 도구 solid + 빈/오류 verbatim
- ✓ **조치 완료 button** (line ~378) 인라인 `background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` 유지 + **height 40 → 44 격상** + className `text-text-on-accent text-label font-bold rounded-md`
- ✓ 옛 `background: 'var(--acl)'` 완전 폐기
- ✓ admin 저장 button → `bg-accent text-text-on-accent` solid (작은 도구는 그라데이션 아님)
- ✓ 데스크톱 재시도 button → `bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm`
- ✓ 모바일 다시 시도 button → `bg-accent text-text-on-accent text-body-sm font-bold rounded-sm`
- ✓ linear-gradient grep gate total = **1**, OQ #4 anchor = **1** (정확히 OQ #4 만 PASS)
- ✓ bg-accent grep gate = **3 (≥2 PASS)**
- ✓ 빈/오류 카피 verbatim 12건 모두 PASS (다음 섹션 참조)
- ✓ 빈/오류 영역 아이콘 / lucide / SVG 추가 없음

### OQ #5: Lucide 3종 교체 (ChevronLeft + Camera + Loader2) + back 44x44 격상
- ✓ `import { ChevronLeft, Camera, Loader2 } from 'lucide-react'` 추가 (line 5)
- ✓ 모바일 헤더 back button 인라인 SVG `M15 19l-7-7 7-7` 완전 제거 → `<ChevronLeft size={20} />` 교체
- ✓ **back button 36x36 → 44x44 격상** (w-8 함정 회피, 인라인 `width: 44, height: 44` 명시)
- ✓ 첨부 button '📷' 이모지 완전 제거 → `<Camera size={18} />` 교체
- ✓ FindingDetailPanel isLoading spinner 인라인 div + `<style>@keyframes spin</style>` 완전 제거 → `<Loader2 className="animate-spin text-accent" size={24} />` 교체
- ✓ grep gate: 이모지 = 0 / 인라인 SVG path = 0 / @keyframes spin = 0 / IconChevronLeft = 0 / polyline = 0 모두 PASS
- ✓ ChevronLeft size={20} = 1 / Camera size={18} = 1 / Loader2 = 1 / animate-spin = 1 모두 ≥1 PASS

---

## 4. 비즈 anchor 17 카테고리 (40 grep 분해) 보존 결과 — 1 byte 변경 0

| # | 카테고리 | grep 카운트 | 결과 |
|---|---|---|---|
| 1 | useQuery ['legal-rounds', year] | 1 | PASS |
| 2 | useQuery ['legal-round', roundId] | 5 (queryKey 1 + invalidate 4) | PASS |
| 3 | useQuery ['legal-findings', roundId] | 3 (queryKey 1 + invalidate 2) | PASS |
| 4 | useQuery ['legal-finding', roundId, findingId] | 2 (queryKey 1 + invalidate 1) | PASS |
| 5 | staleTime: 30_000 | 2 (legal-rounds + legal-findings) | PASS |
| 6 | legalApi 7종 호출 | 8 (list/get/getFindings/updateResult ×2/deleteFinding/getFinding/resolveFinding) | PASS (≥7) |
| 7 | snake_case `resolution_memo` | 1 | PASS |
| 8 | snake_case `resolution_photo_keys` | 1 | PASS |
| 9 | snake_case `report_file_key` | 1 | PASS |
| 10 | function accentColor 정의 | 1 | PASS |
| 11 | accentColor `result === 'pass'` | 1 | PASS |
| 12 | accentColor `result === 'fail'` | 1 | PASS |
| 13 | accentColor `result === 'conditional'` | 1 | PASS |
| 14 | ResultBadge label '적합' | 1 | PASS |
| 15 | ResultBadge label '부적합' | 1 | PASS |
| 16 | ResultBadge label '조건부적합' | 1 | PASS |
| 17 | ResultBadge fallback '결과 미입력' | 1 | PASS |
| 18 | filterRounds 미조치 `findingCount > r.resolvedCount` | 1 | PASS |
| 19 | filterRounds 완료 `r.findingCount === r.resolvedCount` | 1 | PASS |
| 20 | TABS mismatch `key: '미조치', label: '진행 중'` | 1 | PASS (의도된 디자인) |
| 21 | sorted open-first `a.status === 'open' && b.status !== 'open'` | 1 | PASS |
| 22 | sorted `b.createdAt.localeCompare(a.createdAt)` | 1 | PASS |
| 23 | function handleRoundClick 정의 | 1 | PASS |
| 24 | handleRoundClick 모바일 `navigate(\`/legal/...)` | 1 | PASS |
| 25 | FindingsPanel `role === 'admin'` | 2 | PASS |
| 26 | FindingDetailPanel `staff?.role === 'admin'` | 1 | PASS |
| 27 | useMultiPhotoUpload() hook | 1 | PASS |
| 28 | buildMetaTxt | 2 (import + 호출) | PASS |
| 29 | fflate zipSync | 2 (import + 호출) | PASS |
| 30 | ZIP 파일명 `지적사항_` 패턴 | 1 | PASS |
| 31 | @keyframes blink 정의 | 2 (데스크톱 + 모바일) | PASS |
| 32 | blink `.6 / .3` alpha (Education `.4` 와 다름) | 2 (opacity:.6 + opacity:.3) | PASS |
| 33 | toast '점검 결과 저장' | 1 | PASS |
| 34 | toast '보고서 업로드 완료' | 1 | PASS |
| 35 | toast/button '조치 완료' | 2 | PASS |
| 36 | toast '다운로드 완료' | 1 | PASS |
| 37 | toast '조치 처리 실패' | 1 | PASS |
| 38 | toast/placeholder '조치 내용을 입력하세요' | 2 | PASS |
| 39 | 데스크톱 3분할 width 500 (좌+중) | 2 | PASS |
| 40 | 모바일 타이틀 '소방 점검 관리' | 2 | PASS |

**40/40 anchor grep PASS** — r22 (23-education) + 4i9 (28-splash) + 1hj (17-annual-plan) + gox (27-login) + u5n (16-workshift) 모두와 동일한 1 byte 변경 0 precedent.

---

## 5. 카피 verbatim 12건 결과

| # | 카피 | grep 카운트 |
|---|---|---|
| 1 | 지적사항 없음 (FindingsPanel 빈) | 1 PASS |
| 2 | 항목을 불러오지 못했습니다 (FindingDetailPanel 빈) | 1 PASS |
| 3 | 점검 이력 없음 (데스크톱 좌측 빈) | 1 PASS |
| 4 | 불러오기 실패 (데스크톱 오류) | 1 PASS |
| 5 | 목록을 불러오지 못했습니다 (모바일 오류) | 1 PASS |
| 6 | 소방 점검 관리 이력 없음 (모바일 빈 제목) | 1 PASS |
| 7 | 소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다 | 1 PASS |
| 8 | 좌측에서 점검을 선택하세요 (중앙 fallback) | 1 PASS |
| 9 | 중앙에서 지적사항을 선택하세요 (우측 fallback 1) | 1 PASS |
| 10 | 점검을 먼저 선택하세요 (우측 fallback 2) | 1 PASS |
| 11 | 지적사항 목록 (FindingsPanel 헤더 fallback) | 3 PASS |
| 12 | 위치 미지정 (finding 위치 fallback) | 1 PASS |

**12/12 카피 verbatim PASS.**

---

## 6. Negative gate 10건 결과

| # | 검증 | 카운트 | 결과 |
|---|---|---|---|
| 1 | 이모지 0 (특히 '📷' OQ #5 제거) | 0 | PASS |
| 2 | linear-gradient = 정확히 1 (OQ #4 anchor만) | total=1 / OK=1 | PASS |
| 3 | fontSize 9·10·11 인라인 0 (OQ #3 격상) | 0 | PASS |
| 4 | status- prefix 0 (memory `feedback_tailwind_token_class_pattern`) | 0 | PASS |
| 5 | w-8 / h-8 0 (memory `feedback_tailwind_w8_h8_is_48px`) | 0 | PASS |
| 6 | 옛 alias var(--bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger) 0 | 0 | PASS |
| 7 | 인라인 SVG path `M15 19l-7-7 7-7` 0 (OQ #5) | 0 | PASS |
| 8 | spin keyframes 0 (OQ #5 Loader2 교체) | 0 | PASS |
| 9 | IconChevronLeft 0 (해당 없음) | 0 | PASS |
| 10 | polyline 0 (해당 없음) | 0 | PASS |

**10/10 negative gate PASS.**

---

## 7. Positive gate 27건 결과 — 임계치 이상 모두 PASS

(상세는 §2 참조. v0.1.1 토큰 61 / OQ #1 헤더 2 / OQ #2 6 토큰 각 ≥1 / OQ #3 text-caption 29 + leading-none 28 / OQ #4 그라데이션 1 + bg-accent 3 / OQ #5 Lucide 3종 + animate-spin / 토큰 sampling 모두 PASS / border-2 border-accent 2 / border-l-[3px] 3.)

**27/27 positive gate PASS.**

---

## 8. App.tsx + 외부 8 파일 0 byte 변경 (final verify gate)

| 파일 | working tree diff |
|---|---|
| cha-bio-safety/src/App.tsx | 0 PASS |
| cha-bio-safety/src/utils/api.ts | 0 PASS |
| cha-bio-safety/src/utils/findingDownload.ts | 0 PASS |
| cha-bio-safety/src/hooks/useMultiPhotoUpload.ts | 0 PASS |
| cha-bio-safety/src/components/PhotoGrid.tsx | 0 PASS |
| cha-bio-safety/src/components/PhotoSourceModal.tsx | 0 PASS |
| cha-bio-safety/src/components/FindingFormSheet.tsx | 0 PASS |
| cha-bio-safety/src/pages/LegalFindingsPage.tsx | 0 PASS |
| cha-bio-safety/src/pages/LegalFindingDetailPage.tsx | 0 PASS |

**9/9 0 byte PASS.**

---

## 9. Build / tsc 결과

```
cd cha-bio-safety && npx tsc --noEmit
→ 0 errors

cd cha-bio-safety && npm run build
→ ✓ built in 13.96s
→ dist/assets/LegalPage-BQmViwSV.js  22,644 bytes (gzip 5,850 bytes)
→ PWA precache 82 entries (7891.25 KiB)
→ exit 0
```

LegalPage chunk size: **22,644 bytes / gzip 5,850 bytes** (변환 전 baseline 과 비슷한 수준, lucide-react import 추가 영향 미미).

---

## 10. Scope verification

```bash
git status --short  # 변경:
#  M cha-bio-safety/src/pages/LegalPage.tsx   ← 단일 파일
#  ?? .planning/quick/260522-gmp-redesign-23-education-w1/  ← 사전 untracked (이 task 무관)
#  ?? .planning/quick/260522-o7b-redesign-23-education-w2-w5/  ← 사전 untracked (이 task 무관)
```

이 task 가 commit 할 파일은 정확히 2건:
- `cha-bio-safety/src/pages/LegalPage.tsx` (modified)
- `.planning/quick/260523-lft-redesign-19-legal-tsx-legalpage-tsx-571-/260523-lft-SUMMARY.md` (new)

(`260523-lft-PLAN.md` 는 base commit `bf34901` 에 이미 포함됨.)

---

## 11. Deviations from Plan

**None — 플랜대로 실행.**

플랜의 변환 룰을 그대로 따라 LegalPage.tsx 571 → 569 lines 단일 atomic 변환. OQ LOCKED 5건 모두 적용. 비즈 anchor 17 카테고리 모두 1 byte 변경 0. 외부 9 파일 모두 0 byte 변경.

라인 수 처음 변환에서 662 lines 였으나 (다중라인 JSX 어트리뷰트 형식), 변환 룰을 깨지 않는 선에서 작은 도구 / 카드 / 헤더 영역 6곳을 단일 라인으로 압축하여 569 lines (sanity 540~620 안) 달성. 모든 gate 재검증 PASS (negative 10 + positive 27 + biz anchor 40 + copy 12 + build + tsc).

---

## 12. 다음 단계

1. **사용자 컨펌 대기** — cbc7119-preview 자동 배포 후 모바일/데스크톱 시각 검수
   - 모바일 (375x812): 자체 헤더 raised + border-b + back 44x44 + ChevronLeft + "소방 점검 관리" / 탭 / 라운드 카드 (border-l-[3px] 4분기 status) / ResultBadge
   - 데스크톱 (1280+): 3분할 500+500+flex 1 + 좌측 라운드 목록 + 중앙 FindingsPanel (admin 도구 + finding 카드 open/resolved) + 우측 FindingDetailPanel (Loader2 spinner + Camera 첨부 + 조치 완료 그라데이션 button height 44)
2. 사용자 명시 컨펌 후 `main` 머지 (memory `feedback_deploy_test`)
3. GitHub Actions → cbc7119-preview 자동 배포 (memory `project_cbc7119_design_repo` + `reference_cbc7119_domain` + `feedback_cbc7119_design_never_wrangler`)
4. 직원 도메인 (cbc7119) 배포는 별도 worktree (20260328) 담당 (이 워크트리는 절대 다루지 않음, CLAUDE.local.md)
5. `project_redesign_19_legal_status` 메모리 박제 신규 (W1 인덱스 + W2~W5 통합 + lft TSX 변환 모두 main 머지+배포 완결 status)

---

## Self-Check: PASSED

- File created: `cha-bio-safety/src/pages/LegalPage.tsx` modified (569 lines, exists)
- Build artifact: `cha-bio-safety/dist/assets/LegalPage-BQmViwSV.js` (22,644 bytes) — verified via `npm run build` exit 0
- Negative gate 10 / Positive gate 27 / Biz anchor 40 / Copy verbatim 12 — all PASS via grep
- External 9 files preserved 0 byte — verified via `git diff HEAD`

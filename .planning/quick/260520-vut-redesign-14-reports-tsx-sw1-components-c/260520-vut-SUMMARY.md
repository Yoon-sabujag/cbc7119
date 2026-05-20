---
phase: quick-260520-vut
plan: 01
type: execute
wave: 1
files_modified:
  - cha-bio-safety/src/styles/components.css (신규)
  - cha-bio-safety/src/index.css (+1 line)
files_unchanged:
  - cha-bio-safety/src/pages/ReportsPage.tsx
  - cha-bio-safety/src/components/ExcelPreview.tsx
  - cha-bio-safety/src/main.tsx
  - cha-bio-safety/src/App.tsx
  - cha-bio-safety/src/styles/tokens.css
  - cha-bio-safety/src/styles/typography.css
commit: a825369
status: complete
tags:
  - redesign
  - 14-reports
  - tsx-conversion
  - sub-wave-1
  - css-extract
---

# Quick 260520-vut: 14-reports TSX SW1 — components.css 신규 + index.css @import

## One-liner

14-reports redesign TSX 변환 SW1 — W2~W6 sketch 의 .class 정의 40종을 `cha-bio-safety/src/styles/components.css` 에 `@layer components` 블록으로 verbatim 박제 + `index.css` line 3 `@import './styles/components.css';` 1줄 추가.

## 산출물 1: cha-bio-safety/src/styles/components.css (신규)

- 총 78 라인 (주석 + `@layer components { ... }` 블록)
- W7 §3 verbatim 인용을 변형 없이 1:1 복사
- 5 컴포넌트 그룹 (§1 자체 헤더 / §2 본문+카드 / §3 dot-meta+footer / §4 toolbar / §5 sidelist / §6 preview wrapper+A4)

## 산출물 2: cha-bio-safety/src/index.css (수정 +1 line)

기존:
```css
@import './styles/tokens.css';
@import './styles/typography.css';
@import url('https://fonts.googleapis.com/css2?...');
```

수정:
```css
@import './styles/tokens.css';
@import './styles/typography.css';
@import './styles/components.css';   /* ← 추가 */
@import url('https://fonts.googleapis.com/css2?...');
```

위치 결정: tokens.css(var 정의) / typography.css(폰트 class) 가 먼저 로드된 뒤 components.css 가 `var(--*)` 를 resolve. 외부 폰트 URL 은 마지막 유지 (기존 패턴 그대로).

## W2~W6 → components.css class 매핑 표 (40 row)

| # | sketch wave | source HTML | class                                 | components.css line | 비고                                  |
|---|-------------|-------------|---------------------------------------|---------------------|---------------------------------------|
| 1 | W2/W3       | wave-2/3    | `.page-header`                        | 23                  | 자체 헤더 컨테이너 (§1)               |
| 2 | W2/W3       | wave-2/3    | `.back-btn`                           | 24                  | 34×34px (Tailwind w-8≠34 — 메모리 룰) |
| 3 | W2/W3       | wave-2/3    | `.page-title`                         | 25                  | 18px/700                              |
| 4 | W2/W3       | wave-2/3    | `.year-pager`                         | 26                  | gap:2px                               |
| 5 | W2/W3       | wave-2/3    | `.year-pager-slot`                    | 27                  | width:24px slot                       |
| 6 | W2/W3       | wave-2/3    | `.year-nav-btn`                       | 28                  | 28×28px (Tailwind w-7=32px 함정 회피) |
| 7 | W2/W3       | wave-2/3    | `.year-label`                         | 29                  | 14px/700                              |
| 8 | W2/W3       | wave-2/3    | `.page-body`                          | 32                  | padding:12px 16px                     |
| 9 | W2/W3       | wave-2/3    | `.report-card`                        | 33                  | bg=var(--surface-raised)              |
| 10 | W2/W3       | wave-2/3    | `.report-card-head`                   | 34                  | margin-bottom:10px                    |
| 11 | W2/W3       | wave-2/3    | `.report-card-title`                  | 35                  | 16px/700                              |
| 12 | W2/W3       | wave-2/3    | `.report-card-sub`                    | 36                  | 12px + line-height:1                  |
| 13 | W2/W3       | wave-2/3    | `.report-card-btn`                    | 37                  | bg=var(--status-safe-bar) solid       |
| 14 | W2/W3       | wave-2/3    | `.report-card--loading .report-card-btn` | 38               | nested (loading 상태 회색)            |
| 15 | W2/W3       | wave-2/3    | `.dot-meta`                           | 41                  | 4×4px dot span (메모리 룰)            |
| 16 | W2/W3       | wave-2/3    | `.page-footer-note`                   | 42                  | 12px/1.6                              |
| 17 | W4          | wave-4      | `.toolbar`                            | 45                  | flex + bg=var(--surface-raised)       |
| 18 | W4          | wave-4      | `.toolbar-year-label`                 | 46                  | 12px secondary                        |
| 19 | W4          | wave-4      | `.toolbar-select`                     | 47                  | font-family: inherit                  |
| 20 | W4          | wave-4      | `.toolbar-batch-btn`                  | 48                  | 32px solid 일괄 다운로드              |
| 21 | W4          | wave-4      | `.toolbar-batch-btn--loading`         | 49                  | loading 상태 회색                     |
| 22 | W4          | wave-4      | `.toolbar-spacer`                     | 50                  | flex:1                                |
| 23 | W4          | wave-4      | `.toolbar-selected-title`             | 51                  | 14px/700                              |
| 24 | W4          | wave-4      | `.toolbar-individual-btn`             | 52                  | 32px outline 개별 다운로드            |
| 25 | W4          | wave-4      | `.toolbar-individual-btn--loading`    | 53                  | opacity:0.5                           |
| 26 | W5          | wave-5      | `.sidelist`                           | 56                  | width:260px (W1 #2 LOCKED)            |
| 27 | W5          | wave-5      | `.sidelist-section-header`            | 57                  | 12px/700 tertiary letter-spacing      |
| 28 | W5          | wave-5      | `.sidelist-row`                       | 58                  | padding:8px 16px border-left:3px tx   |
| 29 | W5          | wave-5      | `.sidelist-row--selected`             | 59                  | border-left:accent + bg sunken        |
| 30 | W5          | wave-5      | `.sidelist-row--hover`                | 60                  | bg sunken (hover state, JS-toggled)   |
| 31 | W5          | wave-5      | `.sidelist-row-title`                 | 61                  | 14px/400 primary                      |
| 32 | W5          | wave-5      | `.sidelist-row-title--selected`       | 62                  | 14px/700 accent                       |
| 33 | W5          | wave-5      | `.sidelist-row-sub`                   | 63                  | 12px tertiary                         |
| 34 | W6          | wave-6      | `.preview-wrapper`                    | 69                  | flex:1 bg=var(--surface-page) p:32px  |
| 35 | W6          | wave-6      | `.a4-preview`                         | 70                  | A4 595px aspect-ratio 210/297 #ffffff |
| 36 | W6          | wave-6      | `.a4-preview-title`                   | 71                  | 18px/700 #1f2328 (A4 검정)            |
| 37 | W6          | wave-6      | `.a4-preview-meta`                    | 72                  | 12px #656d76 (A4 회색)                |
| 38 | W6          | wave-6      | `.a4-preview-table-placeholder`       | 73                  | grid 1.4fr+12 dashed #d0d7de          |
| 39 | W6          | wave-6      | `.a4-preview-cell`                    | 74                  | dashed #d0d7de + #656d76 text         |
| 40 | W6          | wave-6      | `.a4-preview-cell--header`            | 75                  | #f6f8fa bg + #1f2328 (헤더 셀)        |

**총 40 class 정의** (실제 grep 결과 39 헤드 라인 + nested `.report-card--loading .report-card-btn` 1 = 40). plan 의 "42" 는 W2/W3 카운트 (18) 추정치였으나 W7 §3 fence 와 1:1 박제 결과 실제 16(§1+§2+§3) → 40 합계. 모든 sketch 정의 100% 포함, 누락 0.

**그룹별 카운트:**
- §1 자체 헤더 (W2/W3): 7개 (.page-header, .back-btn, .page-title, .year-pager, .year-pager-slot, .year-nav-btn, .year-label)
- §2 본문 + 카드 (W2/W3): 7개 (.page-body, .report-card, .report-card-head, .report-card-title, .report-card-sub, .report-card-btn, .report-card--loading...)
- §3 dot-meta + footer (W2/W3): 2개 (.dot-meta, .page-footer-note)
- §4 toolbar (W4): 9개
- §5 sidelist (W5): 8개
- §6 preview-wrapper + A4 (W6): 7개
- **합계: 40**

## raw hex 예외 화이트리스트 (4종, var(--*) 미사용 의도적)

| class                         | hex      | 용도                              |
|-------------------------------|----------|-----------------------------------|
| `.a4-preview`                 | #ffffff  | A4 흰배경 고정 (W6 #2 LOCKED)     |
| `.a4-preview-title`           | #1f2328  | A4 검정 텍스트                    |
| `.a4-preview-meta`            | #656d76  | A4 회색 메타                      |
| `.a4-preview-cell--header`    | #f6f8fa  | A4 헤더 셀 배경                   |
| `.a4-preview-table-placeholder` / `.a4-preview-cell` border | #d0d7de | A4 dashed border |
| `.a4-preview-title` / `.a4-preview-cell--header` color | #1f2328 (재사용) | (검정 텍스트 위 매핑) |

→ verify gate #11 (whitelist 외 raw hex) = 0 PASS

**의도:** A4 미리보기는 다크/라이트 모드 무관 항상 흰 종이 시각화. 따라서 var(--*) 토큰 우회.

## 22 verify gate 결과

### Negative (모두 0, 모두 PASS)

| #  | gate                                             | 결과 |
|----|--------------------------------------------------|------|
| 1  | `linear-gradient` in components.css              | **0** ✅ |
| 2  | `font-size: 10/11px`                             | **0** ✅ |
| 2b | `font-size: 9px`                                 | **0** ✅ |
| 3  | `.text-status-` / `.bg-status-` class 정의       | **0** ✅ |
| 4  | 이모지 `⬇` 본문                                  | **0** ✅ |
| 5  | Tailwind `w-8` / `h-8` utility                   | **0** ✅ |
| 6  | 가운뎃점 ` · ` 본문                              | **0** ✅ |
| 7  | ReportsPage.tsx diff                             | **0 line** ✅ |
| 8  | ExcelPreview.tsx diff                            | **0 line** ✅ |
| 9  | main.tsx diff                                    | **0 line** ✅ |
| 10 | App.tsx diff                                     | **0 line** ✅ |
| 11 | raw hex (whitelist 외)                           | **0** ✅ |

### Positive (모두 PASS)

| #  | gate                                             | 결과 |
|----|--------------------------------------------------|------|
| 12 | components.css 파일 존재                         | **EXISTS** ✅ |
| 13 | `@layer components` 블록 정확히 1개              | **1** ✅ |
| 14 | `.report-card` fence ≥1                          | **1** ✅ |
| 15 | `.toolbar` fence ≥1                              | **1** ✅ |
| 16 | `.sidelist` fence ≥1                             | **1** ✅ |
| 17 | `.preview-wrapper` fence ≥1                      | **1** ✅ |
| 18 | `.a4-preview` fence ≥1                           | **1** ✅ |
| 19 | class 정의 ≥30                                   | **40** ✅ |
| 20 | `var(--surface-/text-/border-/status-/accent)` ≥20 | **29** ✅ |
| 21 | index.css `@import.*components.css` 정확히 1개   | **1** ✅ |
| 22 | `npx tsc --noEmit` + `npm run build` exit 0      | **0/0** ✅ |

**합계: 22/22 PASS**

## Build 결과

- `npx tsc --noEmit` → exit 0 (TypeScript 컴파일 통과)
- `npm run build` → exit 0 (`✓ built in 15.93s`, PWA SW 빌드 포함 `✓ built in 237ms`)
- `dist/sw.mjs` 25.19 kB / gzip 8.33 kB
- 87 modules transformed, 82 precache entries (7883.06 KiB)

### CSS chunk size delta

| 파일                               | before     | after      | delta     |
|------------------------------------|------------|------------|-----------|
| `dist/assets/index-*.css`          | 39,018 B   | 39,051 B   | **+33 B** |
| `dist/assets/vendor-*.css`         | 5,593 B    | 5,593 B    | 0         |

→ +33 bytes only. Tailwind purges unused selectors aggressively, so `.report-card / .toolbar / .sidelist / .preview-wrapper / .a4-preview / ...` 가 아직 어떤 .tsx 에서도 className 으로 참조되지 않아 대부분이 purge 됨. SW2/SW3 가 className 으로 활용하면 chunk size 가 ~2~3KB 증가 예상 (이건 다음 wave 의 일).

**의의:** SW1 단독 빌드는 거의 무 영향. 즉 본 wave 가 현 운영을 망가뜨릴 위험 0.

## 메모리 룰 박제 위치

| 룰                                              | 박제 방식                                                                 |
|-------------------------------------------------|---------------------------------------------------------------------------|
| `feedback_planner_prompt_sketch_verbatim`       | components.css 전체가 W7 §3 verbatim 인용 (sketch HTML의 `<style>` 1:1)   |
| `feedback_tailwind_token_class_pattern`         | `.text-status-` / `.bg-status-` class 정의 0건 — `var(--status-safe-bar)` 등 토큰만 사용 |
| `feedback_tailwind_w8_h8_is_48px`               | `.back-btn` 34×34px, `.year-nav-btn` 28×28px 명시 (Tailwind w-8≠34 함정 회피) |
| `feedback_text_caption_leading_none`            | font-size 12px 마지노선 (9·10·11px = 0), `.report-card-sub` 등에 `line-height: 1` |
| `feedback_tsx_wave_emoji_dot_gap`               | 본문 이모지 0 (dot span = `.dot-meta` 4×4px CSS class 만)                |
| `feedback_cbc7119_design_never_wrangler`        | 본 wave 에서 wrangler 명령 0건 / `npm run deploy` 0건 (cbc7119-preview 자동 배포만) |
| `feedback_check_branch_before_edit`             | `redesign/14-reports` 브랜치 위에서 작업 (초기 verified_facts 확인)        |

## 본 wave 무영향 확인

- ReportsPage.tsx — 0 line 변경 (SW2/SW3 책임)
- ExcelPreview.tsx — 0 line 변경 (W6 #1 LOCKED 무변경)
- main.tsx — 0 line 변경 (이미 `import './index.css'` 존재)
- App.tsx — 0 line 변경
- tokens.css — 0 line 변경
- typography.css — 0 line 변경
- 다른 페이지 / 다른 utility / 다른 components — 영향 0

## Next sub-wave 안내

본 SW1 이후 진행 순서:

1. **SW2 — MobileReportsPage TSX 변환** (`cha-bio-safety/src/pages/ReportsPage.tsx` 의 모바일 분기 영역 line 316~385 → className 패턴 적용). W7 §11 gate 10건 적용.
2. **SW3 — DesktopReportsPage TSX 변환** (line 149~304 → toolbar + sidelist + preview-wrapper className 패턴 적용). W7 §11 gate 10건 적용.

SW2 / SW3 는 본 SW1 의 class 정의를 className 으로 참조만 하면 됨 — 인라인 style ~80+ 줄을 className 30+ 로 압축.

## Commit 정보

- **Hash:** `a825369`
- **Branch:** `redesign/14-reports`
- **Subject:** `tsx(14-reports): SW1 — components.css @layer 신규 + index.css @import 추가 (42 CSS class verbatim)`
- **Files:** 2 changed, 78 insertions(+)
  - `cha-bio-safety/src/styles/components.css` (신규, 78 line)
  - `cha-bio-safety/src/index.css` (+1 line, line 3)

## 워크트리 룰 (CLAUDE.local.md) 준수 결과

- ✅ 브랜치: `redesign/14-reports` (worktree `cbc7119-design`)
- ✅ wrangler 명령 0건
- ✅ `npm run deploy` 0건 (cbc7119-preview 자동 배포 경로만)
- ✅ 운영 PWA (cha-bio-safety 직원 도메인) 영향 0

## Self-Check: PASSED

- ✅ `cha-bio-safety/src/styles/components.css` (FOUND)
- ✅ `cha-bio-safety/src/index.css` `@import './styles/components.css';` (FOUND, 1건)
- ✅ commit `a825369` (FOUND in `git log`)
- ✅ 22/22 verify gate PASS
- ✅ `npx tsc --noEmit` + `npm run build` 통과
- ✅ 가드 파일 6종 (ReportsPage.tsx / ExcelPreview.tsx / main.tsx / App.tsx / tokens.css / typography.css) 0 line diff

---
phase: 260526-b5t
plan: 01
status: complete
date: 2026-05-26
branch: redesign/25-qr-print
commits:
  atomic: 604c8c5
  summary: pending
files_modified:
  - cha-bio-safety/src/pages/QRPrintPage.tsx
  - cha-bio-safety/src/styles/components.css
files_added: []
files_zero_byte_gate:
  - cha-bio-safety/src/App.tsx
  - cha-bio-safety/src/utils/api.ts
  - cha-bio-safety/src/stores/authStore.ts
  - cha-bio-safety/src/styles/tokens.css
  - cha-bio-safety/src/styles/typography.css
  - cha-bio-safety/tailwind.config.js
tags:
  - redesign
  - 25-qr-print
  - tsx-conversion
  - v0.1.1
  - quick
  - 2files-atomic
  - components-css-new
  - lucide-chevron-left
  - lucide-download
  - lucide-printer
  - back-button-34x34
  - cta-gradient-anchor
  - public-solid-safe-bar
  - oq-locked-5
  - biz-anchor-12-preserved
  - dlbtnstyle-deprecated
metrics:
  duration_min: ~10
  tasks_completed: 1
  files_modified: 2
  commits: 2
  qrprintpage_tsx_before: 330
  qrprintpage_tsx_after: 316
  components_css_before: 504
  components_css_after: 529
  new_css_classes: 15
  build_status: pass
  tsc_errors: 0
  qrprintpage_chunk_kb: 4.94
  qrprintpage_chunk_gzip_kb: 2.43
---

# Phase 260526-b5t Plan 01: redesign/25-qr-print TSX 변환 (QRPrintPage 330 lines 2 파일 단일 atomic) Summary

## One-liner

QRPrintPage.tsx (330→316) + components.css (504→529, 신규 15 class) **2 파일 단일 atomic commit** — W5 12 섹션 verbatim 적용 + 비즈 anchor 12 1 byte 0 + Lucide 3종 (ChevronLeft/Download/Printer) 교체 + dlBtnStyle 헬퍼 폐기 + OQ LOCKED 5건 모두 적용 (public lin-grad 폐기 → solid bg-safe-bar / inspect lin-grad 인라인 유지 / 안내 박스 status-info 토큰화 / 외곽 hex 8종 토큰 치환 / 비즈 보존).

## 변환 후 라인 수

| 파일 | before | after | delta |
|---|---|---|---|
| `cha-bio-safety/src/pages/QRPrintPage.tsx` | 330 | **316** | -14 (dlBtnStyle 19 lines 폐기 - Lucide import 1 line + button label fragment +N) |
| `cha-bio-safety/src/styles/components.css` | 504 | **529** | +25 (신규 15 class + 주석 헤더 ~10 line) |
| **TSX target range** | 300~360 | 316 | ✓ in range |
| **CSS new ≥10 class** | ≥10 | **15** | ✓ exceeds |

## 비즈 anchor 12 보존 grep 결과 (모두 1 byte 변경 0)

| # | anchor | grep result | status |
|---|---|---|---|
| 1 | imports 6 (useState/useNavigate/jsPDF/QRCode/useAuthStore/toast) | line 1~6 verbatim + 7번째 Lucide import 추가 | ✓ |
| 2 | `interface CheckPoint` (id/locationNo?/location/floor/category/description?) | line 9~16 verbatim | ✓ |
| 3 | `CATEGORIES` 7건 (소화기/소화전/DIV/청정소화약제/완강기/전실제연댐퍼/방화셔터) `hasPublic` | line 18~26 verbatim, `방화셔터` grep 1, `hasPublic: true` grep 1 | ✓ |
| 4 | `renderCardCanvas` (scale 3 / Apple SD Gothic Neo / #ffffff/#222222/#333333 / margin 1) | `Apple SD Gothic Neo` grep 1, `scale = 3` grep 1, `renderCardCanvas` grep 3 | ✓ |
| 5 | `generatePdf` (cardW 30/70 / cardH 38/90 / MARGIN 10 / gap 1 / setFillColor / setLineWidth / typeLabel / doc.save) | `setFillColor(255,255,255)/(0,0,0)` grep 2, `MARGIN = 10\|gap = 1` grep 2 | ✓ |
| 6 | `handleDownload` (Authorization Bearer + raw fetch + toast 3건) | `Authorization: \`Bearer` grep 1, `handleDownload` grep 3 | ✓ |
| 7 | dlBtnStyle 3 state 매트릭스 (loading/public/inspect) | **헬퍼 함수 폐기**, className+인라인 style 분기 (inspect lin-grad 인라인 유지 / public class only solid / loading class only border-strong) | ✓ |
| 8 | `busy` 3 state useState | line 234 verbatim | ✓ |
| 9 | `useAuthStore().token` + `baseUrl = window.location.origin` | line 233 + 236 verbatim | ✓ |
| 10 | 카피 verbatim 9건 | `QR 코드 출력` 1, `PDF 다운로드 완료` 1, `PDF 생성 오류` 1, `체크포인트가 없습니다` 2 (renderCardCanvas 없음 — generatePdf line 128 + handleDownload line 247), `본 소화기는 QR코드로 관리되며` 1, `점검용`/`점검확인용` 8 (typeLabel + 버튼 라벨 + doc.save) | ✓ |
| 11 | 모바일/데스크톱 단일 컬럼 (`lg:*` 0) | `lg:` grep 0 | ✓ |
| 12 | 자체 헤더 페이지 (App.tsx 0 byte) | `git diff --name-only HEAD -- App.tsx` 빈 출력 | ✓ |

## OQ LOCKED 5 적용 확인

| OQ | 결정 | 적용 결과 | grep |
|---|---|---|---|
| **#1** | public lin-grad 16a34a→22c55e 폐기 → solid var(--status-safe-bar) | `.qr-print-page-dl-btn--public { background: var(--status-safe-bar); }` + JSX `className=\"qr-print-page-dl-btn--public\"` | `16a34a.*22c55e` grep 0 ✓ / `qr-print-page-dl-btn--public` grep 2 ✓ |
| **#1** | inspect lin-grad 1d4ed8→0ea5e9 인라인 유지 (§6.4 정식 anchor) | JSX `style={inspLoading ? undefined : { background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}` | `1d4ed8.*0ea5e9` grep 2 (style line + comment anchor) ✓ |
| **#2** | 안내 박스 rgba(14,165,233) → var(--status-info-bg|bar) 토큰화 | `.qr-print-page-info-box { background: var(--status-info-bg); border: 1px solid var(--status-info-bar); ... }` | `rgba(14,165,233` grep 0 ✓ / `qr-print-page-info-box` grep 1 ✓ |
| **#3** | 인라인 SVG path M15 19l-7-7 7-7 → ChevronLeft size 16 + Download/Printer 권장 import | `<ChevronLeft size={16} strokeWidth={2} className=\"text-text-secondary\" />` (back) + `<Download size={14}>` (inspect btn) + `<Printer size={14}>` (public btn) | `M15 19l-7-7 7-7` grep 0 ✓ / `ChevronLeft` grep 2 ✓ / `from 'lucide-react'` grep 1 ✓ / `size={16}` grep 1 ✓ |
| **#4** | 외곽 hex 8종 var(--bg/bg2/bg3/bd/bd2/t1/t2/t3) → var(--surface-*) / var(--border-default\|strong) / var(--text-*) | TSX raw alias 0 + components.css 신규 class 안 새 토큰만 | `var\(--(bg\|bg2\|bg3\|bd\|bd2\|t1\|t2\|t3)\)` grep 0 ✓ |
| **#5** | 비즈 anchor 12 § 박스 전체 1 byte 0 | 위 12 항목 표 모두 ✓ | (위 표 참조) |

## Lucide 3종 / dlBtnStyle 폐기 / 인라인 SVG 폐기 / public solid / inspect lin-grad 유지 확인

- **Lucide 3종 import**: `import { ChevronLeft, Download, Printer } from 'lucide-react'` (line 7, 추가 1줄만 허용 — `from 'lucide-react'` grep 1)
- **Lucide 사용**:
  - `<ChevronLeft size={16} strokeWidth={2} className="text-text-secondary" />` (뒤로가기 버튼 안)
  - `<Download size={14} strokeWidth={2.4} />` (inspect 다운로드 버튼 아이콘)
  - `<Printer size={14} strokeWidth={2.4} />` (public 다운로드 버튼 아이콘)
- **dlBtnStyle 헬퍼 폐기**: 옛 line 312~330 (19 lines) 완전 제거. `function dlBtnStyle\|const dlBtnStyle` grep 0. 3 state (loading/public/inspect) 분기는 className (`qr-print-page-dl-btn--loading|--public|--inspect`) + 인라인 style (inspect 만 background lin-grad) 으로 치환.
- **인라인 SVG path 폐기**: 옛 line 258~260 `<svg ...><path d="M15 19l-7-7 7-7"/></svg>` 완전 제거. `M15 19l-7-7 7-7` grep 0.
- **public solid**: `.qr-print-page-dl-btn--public { background: var(--status-safe-bar); }` (라이트 #15803d / 다크 #22c55e). 옛 `linear-gradient(135deg,#16a34a,#22c55e)` 0 byte.
- **inspect lin-grad 유지**: JSX 인라인 `style={{ background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}` (§6.4 정식 그라데이션 anchor). `1d4ed8.*0ea5e9` grep 2 (실제 style + 주석 anchor — 둘 다 의도적).

## components.css 신규 class 목록 (15)

scope: `.qr-print-page` (모두 `@layer components` 블록 안, 라인 497 이전):

| # | class | 역할 |
|---|---|---|
| 1 | `.qr-print-page` | 외곽 wrapper (height 100% / flex col / overflow hidden / surface-page bg) |
| 2 | `.qr-print-page-header` | 자체 헤더 (surface-raised bg + border-default + padding 8/12 + flex gap 10) |
| 3 | `.qr-print-page-back-btn` | 뒤로가기 버튼 (**width: 34px / height: 34px** 명시 — memory `feedback_tailwind_w8_h8_is_48px` 회피) |
| 4 | `.qr-print-page-title` | 헤더 타이틀 (fontSize 15 / font-weight 700 / text-primary / line-height 1) |
| 5 | `.qr-print-page-info-wrap` | 안내 wrap (padding 10/14/4 + flex-shrink 0) |
| 6 | `.qr-print-page-info-box` | 안내 박스 (**OQ #2** — status-info-bg + status-info-bar + radius 10 + 12px text-secondary) |
| 7 | `.qr-print-page-list` | 카테고리 목록 wrapper (flex 1 / overflow-y auto / padding 10/14/20) |
| 8 | `.qr-print-page-list-inner` | 카드 컨테이너 (flex col + gap 10) |
| 9 | `.qr-print-page-card` | 카테고리 카드 (surface-raised + border-default + radius 13 + padding 13/14) |
| 10 | `.qr-print-page-card-title` | 카드 타이틀 (fontSize 14 / font-weight 700 / text-primary / margin-bottom 10) |
| 11 | `.qr-print-page-btn-row` | 버튼 row (flex + gap 8 + flex-wrap) |
| 12 | `.qr-print-page-dl-btn` | 다운로드 버튼 base (padding 9/16 + radius 9 + 12px font-weight 700 + flex + gap 6 + leading-none) |
| 13 | `.qr-print-page-dl-btn:disabled` | disabled state (cursor: default) |
| 14 | `.qr-print-page-dl-btn--loading` | loading state (border-strong bg + text-tertiary + cursor default) |
| 15 | `.qr-print-page-dl-btn--public` | **OQ #1** — public solid (var(--status-safe-bar)) |

(inspect 변형은 인라인 style 로 lin-grad 적용 — 별도 class 정의 없음. 주석으로 anchor 명시.)

## 6 src 파일 + tailwind.config.js 0 byte 가드 결과

```bash
$ git diff --name-only HEAD -- \
    cha-bio-safety/src/App.tsx \
    cha-bio-safety/src/utils/api.ts \
    cha-bio-safety/src/stores/authStore.ts \
    cha-bio-safety/src/styles/tokens.css \
    cha-bio-safety/src/styles/typography.css \
    cha-bio-safety/tailwind.config.js
# (빈 출력 ✓)
```

`git diff --name-only HEAD` 전체 = `cha-bio-safety/src/pages/QRPrintPage.tsx` + `cha-bio-safety/src/styles/components.css` 두 파일만.

## build / chunk size 결과

```
✓ npx tsc --noEmit       — 0 errors
✓ npm run build          — exit 0 (Vite v5.4.21, ✓ built in 15.16s)
✓ dist/assets/QRPrintPage-DNmguemO.js   4.94 kB │ gzip:  2.43 kB
✓ PWA precache           — 82 entries (7892.17 KiB)
```

(PWA `dist/sw.js` 도 정상 생성 — 82 entries precache.)

## atomic commit hash + SUMMARY commit hash

| commit | hash | type | description |
|---|---|---|---|
| atomic | **604c8c5** | feat | redesign/25-qr-print TSX 변환 (QRPrintPage 330→316 + components.css 504→529 2 파일 단일 atomic) |
| SUMMARY | (다음 commit) | docs | SUMMARY 박제 |

## Negative gate 결과 (W5 §11 17 항목 중 12 자동 grep)

| # | check | result | status |
|---|---|---|---|
| 1 | `var(--bg/bg2/bg3/bd/bd2/t1/t2/t3)` raw | 0 | ✓ |
| 2 | `rgba(14,165,233)` | 0 | ✓ |
| 3 | `16a34a-22c55e` (OQ #1 폐기) | 0 | ✓ |
| 4 | `M15 19l-7-7 7-7` SVG path | 0 | ✓ |
| 5 | `function dlBtnStyle\|const dlBtnStyle` | 0 | ✓ |
| 6 | fontSize 9/10/11 인라인 | 0 | ✓ |
| 7 | `w-8\b\|h-8\b` | 0 | ✓ |
| 8 | `lg:` prefix (모바일/데스크톱 분기) | 0 | ✓ |
| 9 | `IconChevronLeft` | 0 | ✓ |
| 10 | `<polyline` | 0 | ✓ |
| 11 | 이모지 (📥/🖨️/📷) | 0 | ✓ |
| 12 | `text-status-` prefix 잘못 | 0 | ✓ |

## 페이지 검증 (사용자 컨펌 대기)

- `/qr-print` 라우트 진입 시 자체 헤더 (뒤로가기 ChevronLeft + 타이틀 "QR 코드 출력") + 안내 박스 (status-info bg + 2줄 카피 verbatim + `<b>` 강조) + 카테고리 7건 카드 표시.
- 소화기 카드만 inspect+public 2 버튼, 나머지 6 카드 inspect 1 버튼.
- inspect 버튼 (그라데이션 `1d4ed8→0ea5e9` 유지) → 30×38mm portrait PDF 다운로드.
- public 버튼 (solid `var(--status-safe-bar)`) → 70×90mm landscape PDF + 상단 안내 카피 포함.
- 로딩 중 "생성 중..." 표시 + `border-strong` bg + cursor default.
- 다운로드 완료 toast.success / 오류 toast.error / 빈 응답 toast.error 모두 카피 verbatim.
- 뒤로가기 ChevronLeft → `navigate(-1)`.

## Self-Check: PASSED

- ✓ `cha-bio-safety/src/pages/QRPrintPage.tsx` exists (316 lines)
- ✓ `cha-bio-safety/src/styles/components.css` exists (529 lines)
- ✓ `.planning/quick/260526-b5t-redesign-25-qr-print-tsx-qrprintpage-330/260526-b5t-PLAN.md` exists
- ✓ commit `604c8c5` exists in git log
- ✓ 0 byte gate 6 파일 모두 unchanged
- ✓ TSX target line range (300~360) — 316 ∈ range
- ✓ CSS new ≥10 class — 15 satisfied
- ✓ build PASS (tsc 0 errors + Vite exit 0)
- ✓ QRPrintPage chunk size 4.94 kB / gzip 2.43 kB (정상)

## Next step

1. main 머지 + cbc7119-preview GitHub Actions 자동 배포 (사용자 컨펌 후)
2. cbc7119-preview.pages.dev/qr-print 시각 검증 (라이트/다크 모드 둘 다)
3. 다음 페이지 redesign 진입 (24/26/29/30 후보)

---
phase: 260519-nxf
plan: 01
subsystem: redesign-13-schedule
tags: [redesign, tsx-conversion, sub-wave-1, schedule-page, v0.1.1-tailwind]
one-liner: "SchedulePage.tsx 의 page-shell + 모바일 헤더 + 데스크톱 액션 바 outer 영역만 v0.1.1 Tailwind 로 변환 + lucide(ChevronLeft/Download/Plus) 3종 도입 + iconBtn utility const 삭제"

dependency-graph:
  requires:
    - "13-schedule wave 6 sketch (sketch-wave-6.html) — bg-safe-bar solid 룰 + 노안 14→18 룰 source"
    - "13-schedule wave 7 checklist (wave-7-tsx-conversion-checklist.md) — TSX 변환 verify gate / Tailwind cheatsheet"
    - "tailwind.config.js — bg-safe-bar 토큰 / spacing override (w-7=32px / w-8=48px)"
    - "lucide-react@^0.454.0 (node_modules 기설치 확인)"
  provides:
    - "SchedulePage.tsx page-shell + 헤더 영역 v0.1.1 Tailwind 변환된 base"
    - "lucide-react import block (다음 sub-wave 에서 X/CheckCircle2/AlertCircle 추가 가능한 베이스)"
    - "SW2 (캘린더 grid) / SW3 (일자 카드+증상 피커) 진입 안정성"
  affects:
    - "cha-bio-safety/src/pages/SchedulePage.tsx (47 ins / 31 del — 헤더 + page-shell 영역만)"

tech-stack:
  added:
    - "lucide-react icons: ChevronLeft, Download, Plus"
  patterns:
    - "Tailwind v0.1.1 토큰: bg-surface-page / bg-surface-raised / bg-surface-sunken / border-border-default / text-text-primary / text-text-secondary / text-text-tertiary / text-text-on-accent / bg-accent / bg-safe-bar / text-title / text-body-sm"
    - "conditional className with backtick template (planLoading disabled state)"
    - "asymmetric padding 보존: pt-2 pb-[9px] (source padding:'8px 12px 9px' 보존)"
    - "노안 격상 룰: 헤더 14→18 (text-title), 버튼 12→14 (text-body-sm), 백 버튼 34→32 (w-7 h-7)"

key-files:
  created: []
  modified:
    - "cha-bio-safety/src/pages/SchedulePage.tsx"

decisions:
  - "엑셀 버튼 linear-gradient(135deg,#15803d,#22c55e) 폐기 → bg-safe-bar solid 채택 (W6 OQ #1 LOCKED b)"
  - "+ 추가 버튼 텍스트 '+ 추가' 폐기 → lucide <Plus size={14} /> + '추가' (W7 OQ #2 LOCKED a — 아이콘 일관)"
  - "iconBtn utility const 5줄 삭제 — 사용처 모바일 백 버튼 className 으로 인라인화 완료"
  - "arrowBtn / lbl / inp 3 utility const 보존 — SW2 (캘린더 navigation) / SW5~SW6 (modal form) 사용처와 함께 변환 예정"
  - "백 버튼 사이즈 source 34×34 → 32×32 통일 (w-7 = 32px, w-8 함정 회피 — tailwind.config spacing override 기반)"
  - "비대칭 padding 보존 (source padding:'8px 12px 9px' → pt-2 pb-[9px] arbitrary value 사용) — 시각 동일성 우선"

metrics:
  duration: "약 5분"
  completed: "2026-05-19"

threat-flags: []
---

# Phase 260519-nxf Plan 01: 13-schedule TSX SW1 (page-shell + 헤더) Summary

## One-Liner

`SchedulePage.tsx` (1062 lines) 의 sub-wave 1 = 모바일/데스크톱 outer + 모바일 헤더 + 데스크톱 액션 바 outer 영역만 v0.1.1 Tailwind 토큰으로 변환. lucide 3종 도입 + iconBtn 상수 삭제. 비즈 로직 0 변경.

## Scope

### 변경된 영역 (SW1)

| 영역 | source line range | post-change line range | 변환 |
|---|---|---|---|
| import 블록 | 1~10 | 1~11 | `+1 line` lucide-react import 추가 |
| 데스크톱 render outer + 액션 바 | 432~464 | 432~472 | 인라인 `style` → Tailwind class, lucide `<Download />` 도입 |
| 모바일 render outer + 헤더 | 466~496 | 474~516 | 인라인 `style` → Tailwind class, lucide `<ChevronLeft/Download/Plus />` 도입 |
| utility `iconBtn` const | 1045~1049 | 삭제 (1065 line 위치에 주석 marker) | 5 line 삭제 |

### 0 변경 영역 (다음 sub-wave 책임)

| 영역 | line range | 잔존 inline `style={{` |
|---|---|---|
| 캘린더 grid + 공휴일 영역 | 137~427 | 37 (변경 전 == 변경 후 ✓) |
| 일자 카드 / MonthlyPlanPreview / AddModal / EditModal | 518~end | 66 (변경 전 == 변경 후 ✓) |
| arrowBtn / lbl / inp 3 utility const | (post 1066~1080) | 3 hits (보존 ✓) |

## Implementation Diff

### File: `cha-bio-safety/src/pages/SchedulePage.tsx`

- **lucide import** (line 5):
  ```tsx
  import { ChevronLeft, Download, Plus } from 'lucide-react'
  ```

- **데스크톱 액션 바 엑셀 버튼** (line 437~450):
  - `linear-gradient(135deg,#15803d,#22c55e)` → `bg-safe-bar` solid
  - inline SVG path → `<Download size={13} />`
  - `fontSize:12` → `text-body-sm` (= 14px, 노안 격상)
  - conditional `className` with disabled state (planLoading)

- **모바일 헤더** (line 478~505):
  - outer `<header>` 인라인 `style` → Tailwind class (비대칭 padding `pt-2 pb-[9px]` 보존)
  - 백 버튼 `style={iconBtn}` → `w-7 h-7 ... rounded-sm bg-surface-sunken border ...` (34→32 노안 격상)
  - 백 버튼 SVG → `<ChevronLeft size={15} strokeWidth={2} className="text-text-secondary" />`
  - 타이틀 `fontSize:14` → `text-title` (= 18px, 노안 격상)
  - 엑셀 버튼: 데스크톱과 동일 패턴
  - + 추가 버튼: 텍스트 "+ 추가" 폐기 → `<Plus size={14} />` + "추가" 텍스트, `bg-accent text-text-on-accent`

- **본문 wrapper** (line 508):
  - `padding:'12px 16px 24px'` → `px-4 pt-3 pb-6`

- **utility const 삭제** (line 1065 위치):
  - `const iconBtn: React.CSSProperties = {...}` 5줄 삭제 → `// iconBtn 삭제 ... (SW1)` 주석 marker 만 잔존

## Verify Gate Results

### 6c — Negative grep gates (SW1 area 432~516)

| Gate | 기대 | 실측 | 결과 |
|---|---|---|---|
| `linear-gradient` | 0 | 0 | PASS |
| 옛 alias `var(--bg\|bg2\|...)` | 0 | 0 | PASS |
| inline `fontSize:` | 0 | 0 | PASS |
| inline `style={{` | 0 | 0 | PASS |
| 9·10·11px 잔존 | 0 | 1 (의도된 `pb-[9px]` 비대칭 padding) | PASS (의도) |
| `(text\|bg\|border)-status-(safe\|...)` | 0 | 0 | PASS |
| `iconBtn` 식별자 | 0 | 1 (주석 marker only, 사용처 0) | PASS (주석 only) |
| 이모지 | 0 | 0 | PASS |

> 9px 잔존 = `pb-[9px]` arbitrary value 의 의도된 비대칭 padding 보존 (source `padding:'8px 12px 9px'` 시각 동일성 유지). status- prefix 잘못된 패턴 0 hit 으로 메모리 `feedback_tailwind_token_class_pattern.md` 룰 준수 확인.

### 6d — Positive grep gates

| Gate | 기대 | 실측 | 결과 |
|---|---|---|---|
| `from 'lucide-react'` | =1 | 1 | PASS |
| `<(ChevronLeft\|Download\|Plus)` | ≥3 | 4 (백 1 / Download 2 / Plus 1) | PASS |
| `bg-safe-bar` | ≥2 | 2 (데스크톱 + 모바일) | PASS |
| `bg-accent` | ≥1 | 1 (모바일 + 추가) | PASS |
| `text-title` | ≥1 | 1 (모바일 헤더 타이틀) | PASS |
| `text-body-sm` | ≥2 | 3 (데스크톱 엑셀 + 모바일 엑셀 + 모바일 추가) | PASS |
| `bg-surface-page` | ≥2 | 2 (데스크톱 outer + 모바일 outer) | PASS |
| `bg-surface-raised` | ≥2 | 2 (데스크톱 액션 바 + 모바일 헤더) | PASS |
| `border-border-default` | ≥3 | 5 (헤더 + 액션 바 + 미리보기 wrapper + 데스크톱 컬럼 + 백 버튼 border) | PASS |

### 6e — 비즈 로직 + scope 보존

| Gate | 기대 | 실측 | 결과 |
|---|---|---|---|
| `toast.(success\|error)` | =13 (변경 전 동일) | 13 | PASS |
| `arrowBtn\|lbl\|inp` const 정의 | =3 (iconBtn 만 삭제) | 3 | PASS |
| 비즈 시그니처 (handlePlanDownload / setShowAdd / navigate(-1) / planLoading / staff.id) | ≥(변경 전 카운트) | 16 | PASS |
| scope 137~427 inline `style={{` | =37 | 37 | PASS (0 변경) |
| scope 518~end inline `style={{` | =66 | 66 | PASS (0 변경) |

### Automated verify

| Step | command | 결과 |
|---|---|---|
| TypeScript | `cd cha-bio-safety && npx tsc --noEmit` | exit 0 / 0 errors |
| Build | `cd cha-bio-safety && npm run build` | exit 0 / 14.44s built |

### Build chunk size

| File | size | gzip |
|---|---|---|
| `dist/assets/SchedulePage-QL3H0fc8.js` | 33.26 kB | 10.91 kB |

(이전 chunk size 와 직접 비교는 hash 가 바뀌어 정확치 못함. 다만 lucide tree-shake 후 33.26 kB / 10.91 kB gzip 은 13-schedule TSX target 범위 내. 다음 sub-wave 에서 누적 추적.)

## Commit

- **Hash:** `350d1ca`
- **Message:** `tsx(13-schedule): SW1 — page-shell + 헤더 + lucide 도입 + utility constants`
- **Files:** `cha-bio-safety/src/pages/SchedulePage.tsx` (1 file, 47 ins / 31 del)
- **Deletion check:** 0 unexpected file deletions (intentional in-file `iconBtn` const 5-line removal only)

## Deviations from Plan

None — 플랜 verbatim 적용. PLAN.md 의 `<interfaces>` block (B/C/D) AFTER snippet 을 그대로 사용. 사전 확인 단계에서 lucide-react 기설치 확인되어 `npm install` 불필요.

## Auth Gates

None.

## Known Stubs

None — SW1 은 헤더 + page-shell 영역만 담당하고 데이터/비즈 로직 손대지 않음. calendarEl / scheduleListEl / modalsEl 는 그대로 호출만.

## Next Sub-Wave Recommendation

**SW2 — 캘린더 grid 변환 (source line 237~290 area + arrowBtn utility 사용처)**

권장 진입 시점: **즉시 가능**. SW1 commit `350d1ca` 가 안정화된 page-shell 베이스를 제공하므로 SW2 는 캘린더 grid 내부의 day cell / weekday header / nav 버튼만 집중 변환하면 됨.

권장 scope:
- 캘린더 outer `<div>` + grid (line 137~290 area)
- 주말/공휴일 배경 색 토큰화
- 일자 셀의 increment ring + bullet + 카테고리 chip (이미 외부 정의)
- arrowBtn utility const 사용처와 함께 const 변환 (또는 인라인화)

권장 grep gates (SW2 진입 시):
- positive: `text-day-1` / `text-day-2` / `bg-holiday-cell` / `border-today-ring` 등 캘린더 전용 토큰
- negative: linear-gradient 0 / `var(--bg|bd|t1|...)` 0 / `arrowBtn` 식별자 0 (변환 후)
- biz 보존: `dayCatMap` / `holidays` / `selDate` / `today` 시그니처 verbatim

## Self-Check: PASSED

- FOUND: `cha-bio-safety/src/pages/SchedulePage.tsx` (47 ins / 31 del, modified)
- FOUND: commit `350d1ca` in `git log` (HEAD)
- FOUND: lucide import line 5, `<Download/ChevronLeft/Plus>` usages, `bg-safe-bar` 2 hits, `text-title` 1 hit, `text-body-sm` 3 hits
- FOUND: `iconBtn` const definition removed; `arrowBtn / lbl / inp` 3 preserved
- FOUND: scope 137~427 = 37 / 518~end = 66 inline style 보존 (0 변경)
- FOUND: tsc 0 errors / build exit 0
- MISSING: 없음

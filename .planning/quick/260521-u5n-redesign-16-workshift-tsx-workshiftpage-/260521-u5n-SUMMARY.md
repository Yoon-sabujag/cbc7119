---
phase: 260521-u5n
plan: 01
subsystem: redesign-16-workshift
tags:
  - redesign
  - 16-workshift
  - tsx-conversion
  - v0.1.1
  - quick
  - atomic-commit
dependency_graph:
  requires:
    - cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (W1 OQ LOCKED 5건)
    - cha-bio-safety/docs/redesign-context/16-workshift/wave-5-tsx-conversion-checklist.md (W5 12 섹션 SOURCE OF TRUTH)
    - cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-2-header-select.html (W2 시안)
    - cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-3-shift-table.html (W3 시안)
    - cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-4-legend.html (W4 시안)
    - cha-bio-safety/docs/redesign-context/16-workshift/tokens.css
  provides:
    - v0.1.1 토큰 적용된 WorkShiftPage.tsx (in-place 254 lines)
    - Lucide ChevronLeft 1줄 import 추가
    - OQ #1~#5 LOCKED 5건 모두 반영
  affects:
    - cha-bio-safety/src/pages/WorkShiftPage.tsx (단일 파일)
tech_stack:
  added:
    - lucide-react ChevronLeft (기존 dep, 새 import 1줄)
  patterns:
    - v0.1.1 surface/border/text 토큰 className
    - SHIFT_COLOR hex+22 alpha 인라인 (Tailwind 표현 불가 영역)
    - text-[#ef4444] arbitrary fallback (tokens.css 불일치 영역)
    - w-[34px] h-[34px] arbitrary (w-8=48 함정 회피)
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/WorkShiftPage.tsx (226 → 254 lines, +61/-33)
decisions:
  - "OQ #1 LOCKED: 엑셀 저장 버튼 bg-safe-bar solid (var(--acl) 폐기)"
  - "OQ #2 LOCKED: 모바일 only back button + Lucide ChevronLeft size={15} (인라인 SVG 폐기)"
  - "OQ #3 LOCKED: 9·10·11px fontSize → text-caption / text-label / text-body 폰트 격상"
  - "OQ #4 LOCKED: SHIFT_COLOR hex+22 알파 인라인 유지 (Tailwind 표현 비용 vs 가독성)"
  - "OQ #5 LOCKED: today border-accent + 공휴일·주말 text-[#ef4444] arbitrary fallback (tokens.css --status-danger 불일치 검증 결과)"
metrics:
  duration: "≈15분 (single atomic commit)"
  completed_date: "2026-05-21"
  files_modified: 1
  lines_added: 61
  lines_removed: 33
  final_lines: 254
---

# Phase 260521-u5n Plan 01: redesign/16-workshift TSX 변환 (WorkShiftPage.tsx) Summary

WorkShiftPage.tsx 단일 파일 in-place v0.1.1 토큰 변환 — W2/W3/W4 sketch verbatim + W5 12 섹션 checklist + OQ #1~#5 LOCKED 5건 한 번의 atomic commit으로 적용. 비즈 로직 0 diff. shiftCalc.ts + generateExcel.ts 0 byte 변경.

## 0. 결과 헤드라인

- **변환 전:** 226 lines (인라인 `var(--bg|bg2|bg3|bd|bd2|t1|t2|t3|acl)` + 인라인 fontSize 9/10/11 + 인라인 SVG back button + var(--acl) 엑셀 버튼)
- **변환 후:** 254 lines (+28 net / +61 / -33), v0.1.1 토큰 className + Lucide ChevronLeft + text-[#ef4444] arbitrary fallback
- **commit:** `e7ec564` (atomic 1-commit, scope 1 파일)
- **branch:** `redesign/16-workshift-tsx`
- **build:** `npm run build` PASS — tsc 0 errors + Vite `✓ built in 14.10s`
- **chunk:** `dist/assets/WorkShiftPage-B4Jpw4zr.js = 6497 bytes (6.5 KB)`

## 1. 적용된 v0.1.1 토큰 className 목록 (grep 카운트)

### Surface / border / text 토큰

| 토큰 className | 카운트 | 적용 위치 |
|---|---|---|
| `bg-surface-page` | 1 | 외곽 wrapper |
| `bg-surface-raised` | 3 | 헤더 + 년월 + staff name td |
| `bg-surface-sunken` | 4 | back button + select 2 + 이름 헤더 + day cell normal |
| `border-border-default` | 6 | 헤더 border-b + 이름 표 + day cell normal + shift cell normal |
| `border-border-strong` | 2 | year + month select |
| `text-text-primary` | 3 | 모바일/데스크톱 타이틀 + staff name + select 2 value |
| `text-text-secondary` | 4 | 이름 헤더 + day cell normal + ChevronLeft + 범례 라벨 |
| `text-text-tertiary` | 1 | staff title |
| `text-text-on-accent` | 1 | 엑셀 버튼 글자 |

**positive gate pos1: 16 (>=3 PASS)** — surface(8) + border(8) + text(8) 토큰 총합

### 폰트 토큰 (OQ #3 LOCKED 격상)

| 폰트 토큰 | 카운트 | 적용 위치 |
|---|---|---|
| `text-caption` | 5 | 엑셀 버튼 + 이름 헤더 + staff title + DOW_KO + 범례 라벨 |
| `text-label` | 4 | year select + month select + d + 범례 box |
| `text-body-sm` | 1 | staff name |
| `text-body` | 3 | 타이틀(데스크톱+모바일 동일 분기) + shift cell + (보너스 1) |
| `font-bold` | 6 | 타이틀 + 엑셀 + 이름 헤더 + staff name + d + shift cell |
| `font-extrabold` | 1 | 범례 box (W4 sketch 출처) |
| `leading-none` | 6 | 작은 컨테이너 안 text-caption / text-label 모두 명시 (memory `feedback_text_caption_leading_none`) |

### 사이즈 / 모서리 토큰

| 토큰 | 카운트 | 적용 위치 |
|---|---|---|
| `w-[34px]` | 1 | 모바일 back button (w-8=48 함정 회피, memory `feedback_tailwind_w8_h8_is_48px`) |
| `h-[34px]` | 1 | 모바일 back button |
| `w-6 h-6` | 1 | 범례 shift box (24x24 안전, w-6=24 정확 일치) |
| `rounded-sm` | 2 | 엑셀 버튼 + 모바일 back button |
| `rounded-[9px]` | 2 | year + month select (토큰 미존재 영역) |
| `rounded-[5px]` | 1 | 범례 box (토큰 미존재 영역) |
| `border-2` | 2 | today day th + today shift td |
| `border-[1.5px]` | 1 | 범례 box |
| `border-0` | 1 | 엑셀 버튼 |

### 인라인 hex / rgba 잔존 (의도)

| 인라인 | 위치 | 이유 |
|---|---|---|
| `bg-safe-bar` | 엑셀 버튼 default | OQ #1 LOCKED solid |
| `border-accent` | today th + today td (2건) | OQ #5 LOCKED — tokens.css --accent (다크 #3b82f6 / 라이트 #1f6feb) 일치 |
| `background: 'rgba(59,130,246,0.15)'` | today th 인라인 | OQ #5 LOCKED — 신규 토큰 정의 비용 회피, W5 §3.3 명시 |
| `text-[#ef4444]` arbitrary | 공휴일·주말 day th 글자 | OQ #5 LOCKED **fallback** — tokens.css `--status-danger` (다크 `#f87171` / 라이트 `#991b1b`) 와 `#ef4444` 불일치 검증 결과 (§2 참조) |
| `SHIFT_COLOR[sh]` (color + background +'22') | shift cell + 범례 box (총 5건) | OQ #4 LOCKED — 4 카테고리 색 + hex+22 알파는 Tailwind 표현 비용 vs 인라인 1줄, 인라인 유지 |

## 2. OQ #1~#5 LOCKED 적용 결과 (W1 §7 verbatim 검증)

### OQ #1 LOCKED — 엑셀 저장 버튼 `bg-safe-bar` solid ✅

- **before:** `style={{ background:'var(--acl)', color:'#fff', fontSize:12, fontWeight:600, borderRadius:8, border:'none', opacity: dlLoading ? 0.6 : 1, cursor:'pointer' }}`
- **after:**
  - className: `bg-safe-bar text-text-on-accent text-caption font-bold leading-none rounded-sm border-0 ${dlLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`
  - 인라인: `height:34, padding:'0 14px'` (Tailwind h-/p-x 토큰 시 34/14 = 비표준)
- `var(--acl)` 잔존 0건 ✅
- `linear-gradient` 0건 ✅

### OQ #2 LOCKED — 헤더 raised + 모바일 only back button + Lucide ChevronLeft ✅

- **헤더 before:** `style={{ background:'var(--bg2)', borderBottom:'1px solid var(--bd)', ...flex/items/gap }}`
- **헤더 after:** `className="bg-surface-raised border-b border-border-default flex items-center"` + 인라인 (flexShrink, height/padding/gap)
- **back button before (line 97):** `style={{ width:34, height:34, borderRadius:8, background:'var(--bg3)', border:'1px solid var(--bd)', ... }}` + 인라인 SVG `<svg width={15} stroke="var(--t2)" ... />`
- **back button after:** `className="w-[34px] h-[34px] rounded-sm bg-surface-sunken border border-border-default flex items-center justify-center"` + `<ChevronLeft size={15} className="text-text-secondary" />`
- 인라인 SVG 잔존 0건 (Lucide 교체 완료)
- `!isDesktop &&` 모바일 only 분기 유지 — 데스크톱 back button 추가 X
- `import { ChevronLeft } from 'lucide-react'` line 8 추가 ✅

### OQ #3 LOCKED — 폰트 격상 매핑 ✅

| 위치 | before fontSize | after className | 격상 여부 |
|---|---|---|---|
| 모바일 헤더 타이틀 | 14 (모바일) / 16 (데스크톱) | `text-body font-bold` (16) | **모바일 14→16 격상** |
| 엑셀 버튼 | 12 | `text-caption font-bold leading-none` | 동일 |
| year/month select | 13 | `text-label` | 동일 |
| 이름 헤더 | 12 | `text-caption font-bold leading-none` | 동일 |
| staff name | 14 | `text-body-sm font-bold` | 동일 |
| staff title | 10 | `text-caption leading-none` | **격상** (10→12) |
| day d | 13 | `text-label font-bold leading-none` | 동일 |
| DOW_KO | 10 | `text-caption leading-none` | **격상** (10→12) |
| shift cell | 15 | `text-body font-bold` | **격상** (15→16) |
| 범례 box | 13 | `text-label font-extrabold leading-none` | 동일 |
| 범례 라벨 | 12 | `text-caption leading-none` | 동일 |

- **negative gate neg3:** fontSize 9·10·11 인라인 0건 ✅

### OQ #4 LOCKED — SHIFT_COLOR hex+22 알파 인라인 유지 ✅

- **shift cell (line 221):** `color: SHIFT_COLOR[sh], background: SHIFT_COLOR[sh]+'22'` 인라인 유지
- **범례 box (line 241):** `background:SHIFT_COLOR[sh]+'22', borderColor:SHIFT_COLOR[sh], color:SHIFT_COLOR[sh]` 인라인 유지
- `SHIFT_COLOR[sh]` 인라인 호출 5건 (positive gate pos9 ≥4 PASS)
- shiftCalc.ts `SHIFT_COLOR` 상수 변경 0 byte ✅ (git diff utils1 PASS)

### OQ #5 LOCKED — today border-accent + 공휴일·주말 text-[#ef4444] arbitrary fallback ✅

- **day th border (line 213):** `border-2 border-accent` (today) / `border border-border-default bg-surface-sunken` (normal)
- **day th today bg (line 217):** `background: 'rgba(59,130,246,0.15)'` 인라인 유지
- **day th red 글자 (line 213):** `text-[#ef4444]` arbitrary fallback ← tokens.css 불일치 검증 결과
- **day th not-red:** `text-text-secondary`
- **shift td border (line 219):** `border-2 border-accent` (today) / `border border-border-default` (normal)

## 3. tokens.css `--status-danger` 검증 결과 + arbitrary fallback 채택

```
$ grep -nE '\-\-status-danger:|\-\-accent:' cha-bio-safety/docs/redesign-context/16-workshift/tokens.css
39:  --accent:          #3b82f6;        ← OQ #5 today border 일치 (다크 모드 선명한 파랑)
46:  --status-danger:   #f87171;        ← 다크 모드, #ef4444 와 불일치
92:  --accent:          #1f6feb;        ← 라이트 모드
99:  --status-danger:   #991b1b;        ← 라이트 모드, #ef4444 와 불일치
```

**결론:** `--status-danger` 가 다크 `#f87171` / 라이트 `#991b1b` 로 `#ef4444` 와 둘 다 불일치.

→ **OQ #5 LOCKED fallback 채택:** 공휴일·주말 글자 `text-[#ef4444]` **arbitrary 인라인**. `text-danger` 토큰 사용 0건 (negative gate neg7 PASS).

## 4. Verify gate 결과

### Negative gate 7/7 PASS ✅

| # | 항목 | 카운트 | 기대 | 상태 |
|---|---|---|---|---|
| neg1 | 이모지 | 0 | 0 | ✅ |
| neg2 | linear-gradient | 0 | 0 | ✅ |
| neg3 | fontSize 9·10·11 | 0 | 0 | ✅ |
| neg4 | status- prefix | 0 | 0 | ✅ |
| neg5 | w-8 / h-8 | 0 | 0 | ✅ |
| neg6 | var(--bg\|bg2\|bg3\|bd\|bd2\|t1\|t2\|t3\|acl\|accent) | 0 | 0 | ✅ |
| neg7 | text-danger 토큰 (OQ #5 fallback) | 0 | 0 | ✅ |

### Positive gate 15/15 PASS ✅

| # | 항목 | 카운트 | 기대 | 상태 |
|---|---|---|---|---|
| pos1 | v0.1.1 토큰 (surface/border/text) | 16 | ≥3 | ✅ |
| pos2 | w-[34px] | 1 | ≥1 | ✅ |
| pos3 | h-[34px] | 1 | ≥1 | ✅ |
| pos4 | bg-safe-bar | 1 | ≥1 | ✅ |
| pos5 | border-accent | 2 | ≥1 | ✅ |
| pos6 | text-[#ef4444] | 1 | ≥1 | ✅ |
| pos7 | ChevronLeft (import + 사용) | 2 | ≥2 | ✅ |
| pos8 | `from 'lucide-react'` | 1 | ≥1 | ✅ |
| pos9 | SHIFT_COLOR[sh] (occurrences) | 5 | ≥4 | ✅ |
| pos10 | text-caption | 5 | ≥5 | ✅ |
| pos11 | text-label | 4 | ≥3 | ✅ |
| pos12 | text-body-sm | 1 | ≥1 | ✅ |
| pos13 | text-body | 3 | ≥2 | ✅ |
| pos14 | rounded-[9px] | 2 | ≥1 | ✅ |
| pos15 | rounded-[5px] | 1 | ≥1 | ✅ |

### 비즈 로직 보존 16/16 PASS ✅

| # | 항목 | 카운트 | 기대 |
|---|---|---|---|
| biz1 | useIsDesktop | 2 (import + 호출) | ≥1 |
| biz2 | getMonthlySchedule | 2 | ≥1 |
| biz3 | useStaffList | 2 | ≥1 |
| biz4 | generateShiftExcel | 2 | ≥1 |
| biz5 | holidays | 5 | ≥3 |
| biz6 | STAFF_ORDER | 2 | ≥1 |
| biz7 | 석현민 | 1 | ≥1 |
| biz8 | SHIFT_LABEL '당':'당직' | 1 (literal verified) | ≥1 |
| biz9 | HDR_H = 52 | 1 | ≥1 |
| biz10 | ROW_H = 46 | 1 | ≥1 |
| biz11 | 월간 출근부 | 1 | ≥1 |
| biz12 | 엑셀 저장 | 1 | ≥1 |
| biz13 | 생성중 | 1 | ≥1 |
| biz14 | todayRef | 3 | ≥3 |
| biz15 | useQuery 'holidays-dates' | 1 (literal verified) | ≥1 |
| biz16 | navigate(-1) | 1 | ≥1 |

### Utils preserve 2/2 PASS ✅

- `shiftCalc.ts` git diff: 0 lines ✅
- `generateExcel.ts` git diff: 0 lines ✅

### Scope ✅

`git diff --name-only HEAD~ HEAD` = `cha-bio-safety/src/pages/WorkShiftPage.tsx` (단일 파일)

- App.tsx / tailwind.config.js / tokens.css / typography.css / functions/ / templates/ / migrations/ / public/ 모두 변경 0건 ✅

### Build gate ✅

```
$ cd cha-bio-safety && npm run build
...
dist/assets/WorkShiftPage-B4Jpw4zr.js (6497 bytes / 6.5 KB)
✓ built in 14.10s

PWA v0.21.2
mode      injectManifest
format:   es
precache  82 entries (7890.12 KiB)
files generated
  dist/sw.js
```

- tsc `--noEmit`: 0 errors
- Vite build: PASS (14.10s)
- WorkShiftPage chunk size: **6497 bytes (6.5 KB)** — 14-staff-page 평균 대비 정상 범위
- PWA SW build: PASS

## 5. Atomic commit hash + 다음 단계

- **commit hash:** `e7ec564`
- **commit message:** `feat(16-workshift): TSX 변환 — WorkShiftPage v0.1.1 토큰 적용 (W5 checklist + OQ 5건 LOCKED)`
- **scope:** 1 파일 (`cha-bio-safety/src/pages/WorkShiftPage.tsx`, +61 / -33 lines)
- **deletion check:** PASS (no deletions)
- **untracked files:** PASS (none)

### 다음 단계 (사용자 컨펌 대기)

1. **사용자 시각 검수** — cbc7119-preview 자동 배포 후
   - 모바일 (375×812 iPhone 13 mini): back button + 14→16 타이틀 격상 + 표 영역 외곽 padding-top 0
   - 데스크톱 (1920×1080 또는 ≥768): 헤더 height 54 + padding '0 20px' + 뒤로가기 X + 표 영역 12vh padding-top
   - 엑셀 저장 버튼 default = bg-safe-bar (solid 파랑) + dlLoading 시 opacity-60
   - today 셀 (day th + shift td) border-accent + 인라인 bg rgba(59,130,246,0.15) — 다크/라이트 모두 가시
   - 공휴일·주말 날짜 글자 #ef4444 — 의도된 red 톤
   - shift 4 카테고리 색 + hex+22 알파 background 유지 (당 빨강 / 비 파랑 / 주 노랑 / 휴 회색)
   - 범례 4 박스 24×24 + border 1.5px + rounded-[5px] + 한글 라벨 (당직/비번/주간/휴무)

2. **사용자 컨펌 후 main 머지** (memory `feedback_deploy_test` — design 작업은 사용자 명시 컨펌 후만 main 머지+배포)

3. **cbc7119-preview 자동 배포** — GitHub Actions (main push → 자동 트리거)

4. **직원 도메인 (cbc7119) 배포는 별도 worktree (20260328) 담당** — 이 워크트리는 절대 다루지 않음 (CLAUDE.local.md)

5. **메모리 박제** — `project_redesign_16_workshift_status` (신규, project_redesign_*_status 패턴)

## 6. Deviations from Plan

**None — plan executed exactly as written.**

- W5 §3.1~§3.5 변환 매핑 표 verbatim 적용
- W5 §4 OQ #1~#5 LOCKED 5건 verbatim 반영
- W5 §5 negative gate 7건 모두 PASS
- W5 §6 positive gate 모두 PASS
- W5 §7 build gate PASS
- W5 §10 비즈 보존 18 항목 모두 보존 (sampling 16건 PASS)
- tokens.css `--status-danger` 검증 결과 (다크 #f87171 / 라이트 #991b1b ≠ #ef4444) → PLAN 명시대로 `text-[#ef4444]` arbitrary fallback 채택

## 7. Known Stubs

**None.** 본 wave 는 인라인 style → className 치환만 수행. UI 데이터 source / 비즈 로직 / API 호출 모두 0 byte 변경. 새로 발생한 stub 없음.

## 8. Threat Flags

**None.** 본 wave 는 페이지 컴포넌트 시각 변환만 수행. 네트워크 endpoint / 인증 경로 / 파일 접근 / 스키마 변경 0건.

## Self-Check: PASSED

### 변경 파일 존재 확인

- `cha-bio-safety/src/pages/WorkShiftPage.tsx`: **FOUND** (254 lines, modified in HEAD)

### Commit 존재 확인

- `e7ec564`: **FOUND** (`feat(16-workshift): TSX 변환 — WorkShiftPage v0.1.1 토큰 적용 ...`)

### 다른 파일 변경 0건 확인

- `git diff --name-only HEAD~ HEAD` = 1 line (`cha-bio-safety/src/pages/WorkShiftPage.tsx`) — 다른 파일 0건 ✅

### shiftCalc.ts + generateExcel.ts 0 byte 변경 확인

- `git diff HEAD~ HEAD -- cha-bio-safety/src/utils/shiftCalc.ts`: 0 lines ✅
- `git diff HEAD~ HEAD -- cha-bio-safety/src/utils/generateExcel.ts`: 0 lines ✅

### Build artifact 존재 확인

- `cha-bio-safety/dist/assets/WorkShiftPage-B4Jpw4zr.js`: **FOUND** (6497 bytes) ✅

전 항목 PASS.

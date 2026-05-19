---
phase: 260519-dll-redesign-13-schedule-sketch-wave-2-add-c
plan: 01
subsystem: redesign/13-schedule
tags: [sketch, wave-2, 13-schedule, OQ-open, mobile, desktop, design-only]
oneline: "13-schedule W2 sketch — 일자 헤더 + 일정 카드 3장 + 멀티데이 OQ a/b/c + 상태 variant 4종 + 범례 + Empty/Loading + CTA 3종 + 데스크톱 카테고리 컬럼 grid, 단일 self-contained HTML 1012 라인, verify gate 16/16 PASS"
requirements_completed:
  - SKETCH-W2-DATE-HEADER
  - SKETCH-W2-CARD-LIST
  - SKETCH-W2-LEGEND
  - SKETCH-W2-ADD-CTA
  - SKETCH-W2-STATES
  - SKETCH-W2-W1-CONSISTENCY
dependency-graph:
  requires:
    - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-1.html (W1 LOCKED 결정 mirror)
    - cha-bio-safety/docs/redesign-context/13-schedule/tokens.css (verbatim 임베드)
    - cha-bio-safety/docs/redesign-context/13-schedule/typography.css (verbatim 임베드)
    - cha-bio-safety/docs/redesign-context/13-schedule/SchedulePage.tsx (source verbatim 인용)
  provides:
    - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html (사용자 OQ 답변 + 다음 변환 wave input)
  affects: []
tech-stack:
  added: []
  patterns:
    - "W1 sketch head/style/tailwind config verbatim mirror"
    - "12-staff W3 mirror — text-caption + leading-none + dot + 라벨 horizontal row (범례)"
    - "data-theme 토글 + setTheme function (W1 mirror)"
    - "라이트 모드 event #94a3b8 자동 적용 — `.event-dot-themed` CSS selector (W1 OQ #1 LOCKED a)"
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html (1012 라인)
  modified: []
decisions:
  - W1 의 LOCKED 결정 3건 모두 일관 mirror — 라이트 event #94a3b8 / 멀티데이 = dot only / "오늘" 칩 제거 (본문 0회)
  - OQ #1 (상태색): 현재 sketch 의 모든 일정 카드는 옵션 a (source verbatim) 로 시연 — 사용자가 b/c 선호 시 별도 wave 또는 fix 로 전환
  - OQ #2 (CTA): 3종 모두 sketch 안에 동시 노출 — 옵션 a (헤더 inline) 는 각 frame 의 선택 일자 헤더 우측 / 옵션 b (풀폭) 는 다크 frame 섹션 J / 옵션 c (FAB) 는 다크 frame 마지막 placeholder
  - OQ #3 (멀티데이): 3종 모두 다크 frame 멀티데이 sub-strip 에 3장 카드로 나란히 비교 + 라이트 frame 은 옵션 c 만 mirror
  - 카테고리 hex 5종 verbatim — `#3b82f6 / #eab308 / #e2e8f0 / #f97316 / #ef4444` set 만 사용 + 라이트 event 만 `#94a3b8` 예외
  - 모든 폰트 사이즈는 typography 토큰 class (text-caption 12px 이상) — 9·10·11px 직접 지정 0
  - inline style 사용 (W1 패턴) — 단, 색은 var(--*) 토큰 또는 카테고리 hex set 만
metrics:
  duration: ~15분
  completed: 2026-05-19
  tasks: 1
  files-changed: 1 created
  lines-added: 1012
---

# 260519-dll: redesign/13-schedule sketch wave 2 Summary

13-schedule (월간 점검 계획) 의 **wave 2 정적 sketch HTML 시안 1장** 작성. W1 에서 LOCKED 된 카테고리 hex 5종 / 라이트 event #94a3b8 / "오늘" 칩 제거 / 멀티데이 = dot only 룰을 일관 mirror 하면서, W2 범위 (선택 일자 헤더 + 일정 카드 3장 + 멀티데이 OQ a/b/c 비교 + 상태 variant 4종 + 카테고리 범례 + Empty/Loading state + add CTA 3종 + OQ 카드 + Footer 메모리 룰 체크리스트) 를 self-contained HTML 1012 라인으로 작성.

PLAN 의 verify gate 16개 전부 PASS. atomic commit 1개 (445ab2e).

## Changes

### Created
- **cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html** (1012 라인, self-contained)
  - `<head>` — tokens.css line 16~197 verbatim + typography.css line 28~95 verbatim 임베드 (W1 mirror)
  - tailwind config — 12-staff sketch 패턴 verbatim (status-* token color set 포함)
  - 다크/라이트 토글 (우상단 fixed) + `setTheme()` script (W1 mirror)
  - 모바일 frame 2개 (다크 + 라이트, side-by-side, 393px each)
    - 섹션 A: W1 본문 placeholder (dashed border 축약)
    - 섹션 B: 공휴일 라벨 (어린이날, status-danger)
    - 섹션 C: 선택 일자 헤더 (5/5 일정 + 3건 + 옵션 a inline 추가 버튼)
    - 섹션 D: 일정 카드 3장 (시나리오 A — 행사 예정 / 업무 완료 / 점검 진행중 + sub-category 소화기)
    - 섹션 E: 멀티데이 sub-strip (시나리오 B — 옵션 a/b/c 3장 비교, OQ #3 답변용)
    - 섹션 F: 상태 variant 4장 P/Q/R/S (예정 회색 / 진행중 accent / 완료 safe+opacity / 지연 danger+좌측 4px bar)
    - 섹션 G: 카테고리 범례 5종 dot + 라벨 (12-staff W3 mirror, leading-none)
    - 섹션 H: Empty state (등록된 일정이 없습니다 + 일정 추가 버튼)
    - 섹션 I: Loading state (불러오는 중...)
    - 섹션 J: add CTA 옵션 b (풀폭) + 옵션 c (FAB 우하단 fixed within frame, 56px 원형)
    - 라이트 frame: 동일 구조 mirror + event 색이 #94a3b8 로 자동 전환 (`.event-dot-themed` CSS selector + 인라인 변환)
  - 데스크톱 frame 1개 (1280px placeholder)
    - 좌측: 달력 placeholder (dashed)
    - 우측: 카테고리 컬럼 grid 3개 (행사 1 / 업무 1 / 점검 1) — SchedulePage.tsx line 374~398 verbatim 룰 (width:300px, 카테고리 컬러 헤더, count)
    - 하단: 카테고리 범례 mirror
  - OQ 카드 OPEN — #1 상태색 매핑 / #2 CTA 형태 / #3 멀티데이 범위 표시 (각 옵션 a/b/c 어디에 시연됐는지 명시)
  - Footer — 메모리 룰 체크리스트 12개 (이모지 0, 9·10·11px 0, status- prefix 0, hex set, STATUS_LABEL verbatim, tokens/typography 임베드, data-theme 토글, W1 LOCKED 일관, leading-none, w-8/h-8 함정, 비즈 로직 0 변경, 토큰 변수 사용)

### Modified
없음.

### Removed
없음.

## Decisions Made

- **W1 LOCKED 결정 3건 모두 일관 mirror.** 라이트 event 카테고리 dot = `#94a3b8` (slate-400, OQ #1 LOCKED a) → CSS selector `.event-dot-themed` 로 자동 전환. 다크 frame 의 행사 칩 `color:#e2e8f0` + 라이트 frame 의 행사 칩 `color:#94a3b8` 둘 다 인라인 hex 로 명시 (테마 전환 시 양쪽 frame 둘 다 시각 검증 가능). "오늘" 단어 본문 0회 (코멘트 안 OQ 설명 외 노출 X). 멀티데이는 카드 1장 단위 (band 추가 안 함).
- **OQ #2 CTA 3종 모두 한 sketch 안에 동시 노출.** 옵션 a (헤더 inline) 는 다크/라이트 frame 각각 선택 일자 헤더 우측에 / 옵션 b (풀폭 일정 추가) 는 다크 frame 섹션 J 에 / 옵션 c (FAB 56px 원형) 는 다크 frame 마지막 placeholder 안에 시연. 사용자가 frame 보면서 a/b/c 비교 즉시 가능.
- **OQ #3 멀티데이 3종은 별도 카드로 나란히.** 다크 frame 멀티데이 sub-strip 에 3장 카드 (옵션 a 제목 옆 칩 / 옵션 b 시간 자리 텍스트 / 옵션 c 메타 row 별도 칩). 각 카드 우상단에 "옵션 a/b/c" 라벨 칩으로 명시. 라이트 frame 은 가장 깔끔할 가능성 큰 옵션 c 만 mirror.
- **OQ #1 상태색 매핑은 옵션 a (source verbatim) 으로만 시연.** 카드 1~3 + P/Q/R/S 모두 SchedulePage.tsx line 89~94 룰 그대로 (예정=text-tertiary / 진행중=accent / 완료=safe / 지연=danger). 사용자가 b (status-bg 채움) 또는 c (outline+fire) 선호 시 다음 wave 또는 fix 로 전환.
- **카테고리 hex 정규화 set 강제.** `#3b82f6 (점검) / #eab308 (업무) / #e2e8f0 (행사 다크) / #f97316 (승강기) / #ef4444 (소방) / #94a3b8 (행사 라이트만)` — 카드 배지 background 는 동일 hex 의 `rgba(...,0.13)` (다크) / `rgba(...,0.18)` (라이트) 로 채움. 임의 hex 0.
- **노안 폰트 룰.** SchedulePage.tsx 원본의 `fontSize:9/10/11px` 는 sketch 에서 모두 `text-caption (12px)` 또는 `text-body (16px, 카드 제목)` 으로 상향. `font-size: (9|10|11)px` 직접 지정 0회 (verify gate 3 PASS).

## OQ — LOCKED (2026-05-19 사용자 답변)

1. **OQ #1 ▶ LOCKED a)** — 상태 칩 색 = SchedulePage.tsx line 89~94 verbatim. 예정=text-tertiary / 진행중=accent / 완료=safe / 지연=danger.
2. **OQ #2 ▶ LOCKED c)** — add CTA = FAB (우하단 fixed 56px 원형 accent bg). 헤더 inline + 리스트 위 풀폭 버튼 제거.
3. **OQ #3 ▶ LOCKED b)** — 멀티데이 범위 표시 = 시간 자리 텍스트 "5/12 ~ 5/15 (4일)". 제목 옆 칩 / 메타 row 칩 제거.

Patch 결과: sketch-wave-2.html 1012줄 → 896줄 (-116). 옵션 a/c 시연 카드 + 풀폭 버튼 + 헤더 inline 추가 모두 제거.

## Verification

### Verify gate 16개 (PLAN 의 `<automated>` 그대로 실행, 모두 PASS)

```
PASS 1: file exists (1012 lines)
PASS 2: emoji 0
PASS 3: 9/10/11px font-size 0
PASS 4: text-status-* prefix 0
PASS 5: all 5 category hex present
PASS 6: #94a3b8 light event present
PASS 7: all 4 status labels present (예정/진행중/완료/지연)
PASS 8: tokens.css embedded (#0a0d12 dark + #ffffff light)
PASS 9: typography.css embedded (.text-caption / .text-title / .text-body)
PASS 10: data-theme toggle present (setTheme 2회 이상)
PASS 11: card actions (수정/삭제) present
PASS 12: 3 CTA options present (옵션 a / b / c)
PASS 13: OQ 3 items present (OQ #1 / #2 / #3)
PASS 14: empty + loading states present
PASS 15: multi-day range present (5/12 / 5/15)
PASS 16: 5 category legend labels present (점검/업무/행사/승강기/소방)

==========================================
ALL 16 VERIFY GATES PASSED
==========================================
```

### 자체 추가 검수

- **카테고리 hex 등장 횟수** — `#3b82f6:15회` / `#eab308:8회` / `#e2e8f0:6회` / `#f97316:5회` / `#ef4444:10회` / `#94a3b8:10회` (라이트 mirror) — 모두 SCHED_CATEGORIES set 일관, 임의 hex 0
- **w-8 / h-8 class 사용 0회** — 메모리 룰 (`feedback_tailwind_w8_h8_is_48px.md`) 회피 완료
- **`class="...text-status-..."` 0회** — verify gate 4 PASS. footer 안의 `text-status-fire-bar X` 1회는 메모리 룰 설명 인용 (className 아님)
- **본문 "오늘" 단어 0회** — W1 OQ #3 LOCKED 룰 일관 (코멘트 안 OQ 설명에만 존재)
- **frame width 393px 5회** — 모바일 다크 + 모바일 라이트 + 데스크톱 1280px placeholder 정상

### 브라우저 검증 (사용자 컨펌)

```bash
open cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html
```

1. 우상단 다크/라이트 토글 → 라이트 모드에서 행사 카테고리 dot/칩 이 `#94a3b8` 로 변경되는지 확인
2. 모바일 frame 다크 + 라이트 side-by-side 비교 — 5종 카테고리 hex 일관성, 4종 상태 라벨 색 차이
3. 멀티데이 카드 3 옵션 (a/b/c) 시각 비교 → OQ #3 답변 도출
4. 상태 variant 4장 (P/Q/R/S) 색 + 좌측 4px bar(지연) 시각 확인
5. add CTA 3 옵션 (헤더 inline / 리스트 위 풀폭 / FAB) 비교 → OQ #2 답변 도출
6. 상태 칩 색 매핑 (현재 source verbatim 옵션 a 만 시연됨) → OQ #1 답변

## Deviations from Plan

**None — plan executed exactly as written.**

PLAN 의 모든 섹션 (A~J) + 데스크톱 frame + OQ 카드 + Footer 모두 작성됨. verify gate 16/16 PASS. inline style 사용은 sketch self-contained 특성상 PLAN 이 허용한 패턴 (`var(--*)` 토큰 + SCHED_CATEGORIES hex set 만 사용 룰 준수).

워크트리 룰 (wrangler / npm run deploy 금지) 위반 0, TSX 수정 0, 비즈 로직 변경 0.

## Self-Check: PASSED

- `cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html` 존재 확인 (1012 lines)
- 커밋 `445ab2e` 존재 확인 — `sketch(13-schedule): wave 2 — 일자별 일정 카드 + 범례 + add CTA`
- verify gate 16개 모두 PASS (위 인용)
- W1 LOCKED 결정 3건 일관 mirror (라이트 event #94a3b8, 멀티데이 dot only, "오늘" 칩 제거)

## Next Steps

1. 사용자가 브라우저로 `sketch-wave-2.html` 열어 다크/라이트 모두 시각 검증
2. OQ 3건 답변 (#1 상태색 / #2 CTA / #3 멀티데이) → 메모리 박제 (W1 의 `aea30c3 fix(13-schedule): wave 1 OQ lock` 패턴)
3. 답변 반영 fix commit (필요 시) → main 머지 → cbc7119-preview 자동 배포
4. W3 (월간 점검 계획 미리보기 테이블) 또는 TSX 변환 wave 진행

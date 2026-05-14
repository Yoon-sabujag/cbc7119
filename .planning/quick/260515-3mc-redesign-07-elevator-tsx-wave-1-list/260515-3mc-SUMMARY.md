---
quick_id: 260515-3mc
slug: redesign-07-elevator-tsx-wave-1-list
status: complete
date: 2026-05-15
commit: 7a3cf32
phase: quick
plan: "01"
subsystem: ElevatorPage
tags:
  - redesign
  - elevator
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
  - list-tab
  - wave1
  - elevator-icon
dependency_graph:
  requires:
    - 260510-c2z-redesign-07-elevator-1-list-4-type-optio
    - 260509-5xl-redesign-01-dashboard-tsx
    - 260514-i4r-redesign-02-inspection-tsx
    - 260515-2r5-redesign-02-inspection-tsx-wave-6-powerp
  provides:
    - ElevatorPage Wave 1 변환 완료 (list 탭 모바일+데스크톱 좌측 컬럼 + 자체 헤더)
    - ElevatorIcon (icons.tsx — stroke-only SVG, sketch 1:1)
    - TYPE_ICON_COMPONENT 매퍼 (Wave 2+ 참조 anchor)
  affects:
    - cha-bio-safety/src/pages/ElevatorPage.tsx (Wave 1 변환 영역)
    - cha-bio-safety/src/components/ui/icons.tsx (ElevatorIcon 추가)
tech_stack:
  added:
    - ElevatorIcon (커스텀 SVG, icons.tsx)
    - lucide-react: Package / UtensilsCrossed / MoveDiagonal / ChevronRight / AlertTriangle / Wrench
  patterns:
    - TYPE_ICON_COMPONENT 매퍼 (이모지 → 컴포넌트 분리 패턴, 다른 탭 이모지 보존과 병행)
    - 좌측 3px 색바 (before:bg-{token}-bar — §6.1 Progress Color Rule)
    - before: pseudo-element 색바 (content-[''] absolute left-0 top-0 bottom-0 w-[3px])
key_files:
  modified:
    - cha-bio-safety/src/pages/ElevatorPage.tsx
    - cha-bio-safety/src/components/ui/icons.tsx
decisions:
  - "TYPE_ICON 이모지 객체(🛗📦🔲↕️) 보존 + TYPE_ICON_COMPONENT 매퍼 별도 신설 — 다른 탭/5 모달이 TYPE_ICON에 의존하므로 이모지 객체 제거 불가. Wave 1 변환 영역에서만 새 매퍼 사용"
  - "미해결 N건 칩 = fire 색 (text-fire bg-fire-bg) — 메모리 §6.1 룰 '조치 대기/긴급 = fire'. 승강기 고장 미수리는 fire 의미에 해당. sketch ev-bar-fire와 일관"
  - "그라디언트 CTA 버튼 (고장 접수/수리 기록) 인라인 style 화이트리스트 보존 — §6.4 CTA 예외 (linear-gradient는 Tailwind arbitrary로 표현 불가 시 허용)"
  - "before: pseudo-element로 좌측 3px 색바 구현 — before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-{token}-bar. overflow-hidden 카드 루트에 의해 자동 clip"
  - "ElevatorIcon strokeWidth=1.8 기본값 — sketch 지정값. StrokeSvg 헬퍼 사용 (ShutterIcon/ExitSignIcon 동일 패턴). 호출 측에서 override 가능"
metrics:
  duration: "~45분"
  completed_date: "2026-05-15"
  tasks: 4
  files: 2
---

# Phase quick Plan 01: redesign-07-elevator-tsx Wave 1 (list 탭) Summary

**One-liner:** ElevatorPage list 탭 + 데스크톱 좌측 컬럼 + 자체 헤더를 v0.1.1 Tailwind 토큰 only로 교체 + ElevatorIcon 신설 (sketch 1:1, 비즈니스 로직 100% 보존)

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ElevatorIcon icons.tsx 추가 + lucide import + TYPE_ICON_COMPONENT 매퍼 | 3eedd6c | icons.tsx, ElevatorPage.tsx |
| 2 | 모바일 자체 헤더 + list 탭 본문 토큰화 | f6d7168 | ElevatorPage.tsx |
| 3 | renderEvCard + 데스크톱 헤더 + 좌측 컬럼 토큰화 | 7a3cf32 | ElevatorPage.tsx |
| 4 | 전체 회귀 검증 + npm run build 통과 | (no code change) | — |

## What Was Done

### Task 1: ElevatorIcon + 인프라
- `icons.tsx`: `ElevatorIcon` export 추가 — StrokeSvg 헬퍼 패턴, sketch `elevator-sketch.html` 라인 595 SVG path 1:1 (rect+line+polyline 6개), strokeWidth 기본 1.8
- `ElevatorPage.tsx`: `lucide-react` import 신설 (Package/UtensilsCrossed/MoveDiagonal/ChevronRight/AlertTriangle/Wrench)
- `ElevatorPage.tsx`: `ElevatorIcon` import 추가
- `TYPE_ICON_COMPONENT` 매퍼 객체 신설 (passenger=ElevatorIcon/cargo=Package/dumbwaiter=UtensilsCrossed/escalator=MoveDiagonal)
- 기존 `TYPE_ICON` 이모지 객체 완전 보존 (다른 탭/5 모달 의존)

### Task 2: 모바일 영역 변환
- 모바일 페이지 컨테이너: `flex-1 min-h-0 flex flex-col overflow-hidden`
- 모바일 헤더: `bg-surface-raised border-b border-border-default` + 미해결 칩 `text-fire bg-fire-bg border-fire-bar` + AlertTriangle 아이콘
- 탭 버튼: 활성 `bg-accent text-text-on-accent` / 비활성 `bg-surface-sunken text-text-tertiary` + rounded-pill
- `main` 컨테이너: Tailwind-only + `paddingBottom: 'calc(80px + var(--sab, 0px))'` 화이트리스트
- list 탭 그룹 라벨: TYPE_ICON_COMPONENT 컴포넌트 + `text-caption font-bold text-text-tertiary uppercase tracking-wider`
- list 탭 카드: 좌측 3px 색바 `before:bg-{fire|warning|safe|text-tertiary}-bar`, 상태별 badge/iconBox/border Tailwind 토큰
- 다음 점검 배지: `bg-warning-bg text-warning` / `bg-danger-bg text-danger` / `bg-info-bg text-info`
- ChevronRight 컴포넌트 (인라인 SVG 교체)

### Task 3: 데스크톱 영역 변환
- `renderEvCard` 함수: 전체 Tailwind-only (`w-full h-32 box-border` 등), TypeIcon 컴포넌트, 좌측 색바
- 데스크톱 헤더: `h-14 bg-surface-raised border-b px-5` + 미해결 칩 fire 색 + AlertTriangle/Wrench 아이콘 + gradient 버튼 화이트리스트
- 데스크톱 좌측 컬럼: `flex-1 border-r px-6 py-5` + ElevatorIcon/MoveDiagonal 라벨 + `grid grid-cols-4 gap-2.5`
- 이모지 🛗/↕️/🚨/🔧 → 컴포넌트 교체

### Task 4: 회귀 검증
- Wave 1 영역 231줄 추출 검증
- 빌드: `✓ built in 13.18s`, `ElevatorPage-CDnDj7gA.js` 신규 hash

## Self-Check Results

### 1. 변환 영역 인라인 style 금지 키 검출

```bash
# Wave 1 region 전체 (sc-wave1.txt = 231줄)
grep -E "(color|background|padding|margin|fontSize|fontWeight|borderRadius)\s*:\s*['\"]" /tmp/sc-wave1.txt | grep -v "linear-gradient|var(--sab|//|className" | wc -l
# 결과: 0
```

허용된 화이트리스트만:
- `style={{ paddingBottom: 'calc(80px + var(--sab, 0px))' }}` — var(--sab) 동적
- `style={{ background: 'linear-gradient(135deg,#991b1b,#ef4444)' }}` — 그라디언트 §6.4 CTA
- `style={{ background: 'linear-gradient(135deg,#854d0e,#eab308)' }}` — 그라디언트 §6.4 CTA

### 2. 9/10/11px 폰트 검출 (변환 영역 한정)

```bash
grep -nE "fontSize:\s*(9|10|11)\b|text-\[(9|10|11)px\]" /tmp/sc-wave1.txt
# 결과: 없음 (0건)
```

### 3. 이모지 검출 (변환 영역 한정)

```bash
grep -nE "🛗|📦|🔲|↕️" /tmp/sc-wave1.txt
# 결과: 없음 (0건)
# 전체 파일에서는 TYPE_ICON 객체(라인194), EvSelector 모달 내부(보존 영역)에 존재 — 정상
```

### 4. 보존 영역 sentinel

| Sentinel | Count | Status |
|----------|-------|--------|
| 5 모달 함수 (FaultNewModal/FaultNewFullscreen/FaultResolveModal/RepairNewModal/EvDetailModal) | 5 | PASS |
| ElevatorInfoCard/RepairListSection/KoelsaHistorySection 함수 | 2+1(컴포넌트별) | PASS |
| `tab === 'fault'|'repair'|'inspect'|'annual'|'safety'` | 8회 | PASS |
| `<KoelsaHistorySection` 호출 | 1 | PASS |
| `<RepairListSection` 호출 | 1 | PASS |

### 5. ElevatorIcon export 확인

```bash
grep "export function ElevatorIcon" src/components/ui/icons.tsx
# 결과: export function ElevatorIcon({ strokeWidth = 1.8, ...props }: IconProps)
```

## Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Inline style forbidden keys (Wave 1) | 0 | 0 | PASS |
| 9/10/11px fonts (Wave 1) | 0 | 0 | PASS |
| Emoji in Wave 1 region | 0 | 0 | PASS |
| Old tokens (var(--bg2) etc) in Wave 1 | 0 | 0 | PASS |
| ElevatorIcon export | present | present | PASS |
| TYPE_ICON_COMPONENT | present | present | PASS |
| lucide-react import | present | present | PASS |
| Business logic (setDetailEv/nextInspMap/ni.status) | preserved | preserved | PASS |
| 5 modal functions preserved | 5 | 5 | PASS |
| Other tabs (fault/repair/inspect/annual/safety) | preserved | preserved | PASS |
| KoelsaHistorySection call | preserved | preserved | PASS |
| RepairListSection call | preserved | preserved | PASS |
| npm run build | PASS | PASS (13.18s) | PASS |
| TypeScript compile | 0 errors | 0 errors | PASS |
| ElevatorPage chunk | new hash | CDnDj7gA | PASS |
| Final line count | ≥3200 | 3277 | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TYPE_ICON_COMPONENT 타입 정의 — size 타입 불일치**
- **Found during:** Task 1 (tsc 실행 후)
- **Issue:** 초기 타입 `size?: number`가 lucide-react의 실제 타입 `size?: string | number`와 불일치 → TS2322 에러 3건
- **Fix:** `size?: number | string`로 수정
- **Files modified:** `cha-bio-safety/src/pages/ElevatorPage.tsx`
- **Commit:** 3eedd6c (Task 1 커밋에 포함)

**2. [Rule 3 - Blocking] worktree node_modules 부재**
- **Found during:** Task 1 (tsc 실행 시도)
- **Issue:** worktree에 node_modules 없음 → tsc/build 불가
- **Fix:** `npm install` 수행 (직전 Wave 2r5와 동일 패턴)
- **Commit:** 별도 커밋 없음 (환경 준비 step)

## Known Stubs

없음. Wave 1 변환 영역은 기존 비즈니스 로직을 100% 보존하며 시각만 교체. 데이터 소스/표시 분기 모두 이전과 동일하게 작동.

## Threat Flags

없음. 시각 교체만, 새 네트워크 엔드포인트/인증 경로/파일 접근/스키마 변경 없음.

## Self-Check: PASSED

모든 파일 존재 확인:
- `cha-bio-safety/src/pages/ElevatorPage.tsx` — FOUND (3277줄)
- `cha-bio-safety/src/components/ui/icons.tsx` — FOUND (ElevatorIcon export 포함)

모든 커밋 존재 확인:
- `3eedd6c` — FOUND (Task 1)
- `f6d7168` — FOUND (Task 2)
- `7a3cf32` — FOUND (Task 3)

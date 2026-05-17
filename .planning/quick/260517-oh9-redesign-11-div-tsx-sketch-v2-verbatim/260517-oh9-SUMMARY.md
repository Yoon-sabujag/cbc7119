---
phase: 260517-oh9
plan: 01
subsystem: redesign/11-div
tags: [redesign, 11-div, tsx-conversion, verbatim, v0.1.1-tokens, divpage]
key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/DivPage.tsx
decisions:
  - "색만 v0.1.1 토큰화: #3b82f6→text-accent, #f97316→text-status-fire-bar, #22c55e→text-status-safe-bar"
  - "IntervalBar color prop: drain=var(--status-info), comp_drain=#8b4513 raw, compressor=var(--status-fire-bar)"
  - "STATUS_COLOR 상수: var(--safe/warn/danger) → var(--status-safe-bar/warning-bar/danger-bar)"
  - "colColors const 도입: renderDivDetail + renderDesktopPressureChart 에서 동일 패턴 공유"
  - "counters/logCards: color/bg/border prop 제거, colorClass/bgBorderClass className 으로 재구성"
  - "매트릭스 카드: bgClass/borderClass 변수로 dynamic className 분기 (selected: border-2 border-accent)"
  - "style={{ 의도된 잔존 4건: color CSS var() (동적 변수) + height: chartH (동적 계산)"
metrics:
  completed: 2026-05-17
  duration: 60min
  tasks: 7
  files: 1
---

# Phase 260517-oh9 Plan 01: DivPage TSX 변환 Summary

DivPage.tsx 1136 LOC 전체를 sketch v2 verbatim 1:1 매핑으로 변환 완료. 옛 토큰 101건 + raw hex 27건 + rgba 23건 모두 제거. v0.1.1 Tailwind 토큰 + CSS var() 로 통일. style={{ 4건 의도된 인라인 잔존.

---

## 변환 범위

| Wave | 영역 | 내용 | 커밋 |
|---|---|---|---|
| Wave A | IntervalBar + 모바일 return | "기록 없음" 박스 + 헤더/탭 chrome | 33c631a |
| Wave B | renderPressureTab + renderLogTab | 층별 그리드/카드/압력 컬럼 | e767fa1 |
| Wave C | renderDivDetail | 모바일 바텀시트 + 차트 + 수치 테이블 | 2871d81 |
| Wave D | renderDesktopPressureChart + renderDesktopLogTimeline | 데스크톱 SVG 차트 2종 | 3d8a142 |
| Wave E | renderDesktopRightPanel | 빈 상태(통계 3섹션) + 선택 상태(헤더/탭/콘텐츠) | f5a6f44 |
| Wave F | renderDesktopLayout | 데스크톱 chrome + 배너 + 매트릭스 + 범례 | 54d48bf |

---

## Verify Gate 결과 (Task 8)

| 항목 | 기준 | 결과 |
|---|---|---|
| 옛 var() 토큰 잔존 | 0건 | 0건 PASS |
| raw hex (#3b82f6/#f97316/#22c55e 등) | 0건 | 0건 PASS |
| #8b4513 잔존 | 1-3건 (허용) | 3건 PASS |
| 챔버 오기 | 0건 ('챔버배수주기' 탭 라벨 제외) | 0건 PASS |
| style={{ 잔존 | 5-15건 (동적 허용) | 4건 PASS |
| TypeScript noEmit | 0 에러 | 0 에러 PASS |
| npm run build | PASS | PASS |

---

## 색 토큰 매핑 적용 내역

| 원본 | Tailwind className / CSS var() |
|---|---|
| var(--bg) | bg-surface-page |
| var(--bg2) | bg-surface-raised |
| var(--bg3) | bg-surface-sunken |
| var(--bd) | border-border-default |
| var(--t1/t2/t3) | text-text-primary/secondary/tertiary |
| var(--acl) | text-accent / border-accent / bg-accent |
| var(--safe/warn/danger) | text-status-safe-bar/warning-bar/danger-bar |
| #3b82f6 (1차압) | text-accent / class="text-accent" |
| #f97316 (2차압) | text-status-fire-bar |
| #22c55e (세팅압) | text-status-safe-bar |
| #38bdf8 (drain) | var(--status-info) in color prop |
| #8b4513 (comp_drain) | raw 유지 (토큰 미정의) |
| rgba(239,68,68,.4) | border-status-danger-bar/40 |
| rgba(245,158,11,.3) | border-status-warning-bar/30 |
| rgba(34,197,94,.12) | bg-status-safe-bar/[0.12] |

---

## 의도된 인라인 잔존 (4건)

1. `style={{ color }}` (renderDivDetail 차트 라벨 - line ~470) - CSS var() 동적 변수
2. `style={{ color }}` (renderDesktopPressureChart 차트 라벨 - line ~607) - CSS var() 동적 변수
3. `style={{ color }}` (renderDesktopLogTimeline 타임라인 라벨 - line ~712) - CSS var() 동적 변수
4. `style={{ height: chartH }}` (renderDesktopLogTimeline "기록 부족" 박스 - line ~715) - 동적 계산값

---

## Deviations from Plan

### Auto-adjusted

**1. STATUS_COLOR 상수 변환 (line 32)**
- 계획에 명시되지 않았으나 Wave A 진행 중 발견
- `{ ok: 'var(--safe)', warn: 'var(--warn)', danger: 'var(--danger)' }` → `{ ok: 'var(--status-safe-bar)', warn: 'var(--status-warning-bar)', danger: 'var(--status-danger-bar)' }`
- 이 상수가 변환되지 않으면 비즈니스 로직에서 옛 토큰 사용 지속되므로 Rule 2 적용

"None - 나머지 plan 내용은 그대로 실행."

---

## Known Stubs

없음. 모든 데이터 소스 보존 (useQuery 호출 / pressureMap / dateMap 등 100% verbatim).

---

## Threat Flags

없음. API endpoint / 인증 로직 0건 변경.

---

## Self-Check: PASSED

- [x] cha-bio-safety/src/pages/DivPage.tsx 변환 완료 (1136 LOC)
- [x] 커밋 33c631a (Wave A) 존재
- [x] 커밋 e767fa1 (Wave B) 존재
- [x] 커밋 2871d81 (Wave C) 존재
- [x] 커밋 3d8a142 (Wave D) 존재
- [x] 커밋 f5a6f44 (Wave E) 존재
- [x] 커밋 54d48bf (Wave F) 존재
- [x] 옛 토큰 var() 0건
- [x] TypeScript 0 에러
- [x] npm run build PASS

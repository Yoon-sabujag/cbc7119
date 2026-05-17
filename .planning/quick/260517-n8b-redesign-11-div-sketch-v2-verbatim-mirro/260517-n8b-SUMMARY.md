---
phase: 260517-n8b
plan: 01
subsystem: redesign/11-div
tags: [sketch, verbatim-mirror, div-page, v0.1.1-tokens]
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/11-div/sketch/div-sketch.html
  modified: []
decisions:
  - "색만 토큰화 (①A). 시각 구조·폰트·spacing verbatim (②A). 단일 파일 (③A)."
  - "압력 컬럼 색 #3b82f6/#f97316/#22c55e — raw hex 잔존 (status-info/fire/safe 매핑 후보, §B 사용자 결정 필요)"
  - "IntervalBar comp_drain #8b4513 — 토큰 없음, raw hex 유지 확정 필요 (§C)"
  - "폰트 7/8/9/14px verbatim 적용 — 노안 룰 위반이나 사용자 결정 = 정보 밀도 우선 (§D)"
metrics:
  completed: 2026-05-17
  tasks: 2
  files: 1
---

# Phase 260517-n8b Plan 01: 11-div sketch v2 verbatim mirror Summary

DivPage.tsx 1136 LOC를 verbatim mirror한 단일 sketch HTML 완성. 옛 sketch(260517-m2x)의 5가지 오류(헤더 우측 액션 추가/탭 wrapper 라벨/탭 아이콘/1열 grid/챔버 컬럼명/폰트 부풀림) 모두 제거.

---

## §A 변환 범위 확인

**토큰화 = 색만 적용: O**

v0.1.1 CSS 변수 → Tailwind className / CSS var() 참조로 변환:
- `var(--bg)` → `var(--surface-page)`
- `var(--bg2)` → `var(--surface-raised)`
- `var(--bg3)` → `var(--surface-sunken)`
- `var(--bd)` → `var(--border-default)`
- `var(--t1/t2/t3)` → `var(--text-primary/secondary/tertiary)`
- `var(--acl)` → `var(--accent)`
- `var(--safe/warn/danger)` → `var(--status-safe-bar/warning-bar/danger-bar)` (토큰 alias 통해)

**시각 구조 DivPage.tsx 일치 여부:**

| 요소 | 실제 (DivPage.tsx) | sketch | 일치 |
|---|---|---|---|
| 헤더 padding | `8px 12px` | `8px 12px` | O |
| 백 버튼 크기 | `34×34, borderRadius:8` | `34×34, border-radius:8px` | O |
| 제목 폰트 | `fontSize:14, fontWeight:700` | `font-size:14px; font-weight:700` | O |
| 헤더 우측 액션 | 없음 | 없음 | O |
| 탭 padding | `10px 4px` | `10px 4px` | O |
| 탭 폰트 | `12px, 600` | `12px; font-weight:600` | O |
| 탭 wrapper 라벨 | 없음 | 없음 | O |
| 탭 아이콘 | 없음 | 없음 | O |
| 카드 grid | `repeat(3,1fr), gap:4` | `repeat(3,1fr); gap:4px` | O |
| 카드 padding | `5px 5px 4px` | `5px 5px 4px` | O |
| 카드 borderRadius | `8` | `8px` | O |
| 층별 라벨 폰트 | `9px, 700, letterSpacing:0.04em` | 동일 | O |
| 컬럼 라벨 | `1차 / 2차 / 세팅` | `1차 / 2차 / 세팅` | O |
| 압력값 폰트 | `14px, 800` | `14px; font-weight:800` | O |

**인라인 style 잔존 항목 (Tailwind 1:1 치환 불가):**
- `padding:5px 5px 4px` — Tailwind 비표준 값, 인라인 유지
- `padding:10px 4px` — 비표준, 인라인 유지
- `font-size:7px/8px/9px/14px` — Tailwind 미지원 사이즈, 인라인 유지
- `grid-template-columns:repeat(3,1fr)` — 동적 그리드, 인라인 유지
- `height:34px` (압력 영역 고정 높이) — 인라인 유지
- `letter-spacing:0.04em` — 비표준 값, 인라인 유지
- `border-radius:16px 16px 0 0` (모달 바텀시트) — 인라인 유지

---

## §B 색 토큰 매핑 적절성

| 원본 변수 | 토큰 매핑 | 결과 |
|---|---|---|
| `var(--bg)` | `var(--surface-page)` | O (tokens.css alias) |
| `var(--bg2)` | `var(--surface-raised)` | O |
| `var(--bg3)` | `var(--surface-sunken)` | O |
| `var(--bd)` | `var(--border-default)` | O |
| `var(--t1)` | `var(--text-primary)` | O |
| `var(--t2)` | `var(--text-secondary)` | O |
| `var(--t3)` | `var(--text-tertiary)` | O |
| `var(--acl)` | `var(--accent)` | O |
| `var(--safe)` | `var(--status-safe-bar)` | O (alias) |
| `var(--warn)` | `var(--status-warning-bar)` | O (alias) |
| `var(--danger)` | `var(--status-danger-bar)` | O (alias) |

**rgba 잔존 항목 (토큰 매핑 실패/부분):**
- `rgba(239,68,68,.4)` — danger 카드 border. `--status-danger-bar`(`#ef4444`) 에 opacity 적용. sketch에서 raw rgba 유지. TSX 변환 시 `border-status-danger-bar/40` 시도 가능.
- `rgba(245,158,11,.3)` — warn 카드 border. 동일 패턴. `border-status-warning-bar/30` 시도 가능.
- 상태 카드 bg `rgba(34,197,94,.12)` 등 — bg 페어 활용 가능(`--status-safe-bg` = `rgba(34,197,94,.16)`), 투명도 미세 차이 있음.

**압력 컬럼 색 (사용자 결정 필요 §F):**
- `#3b82f6` (1차) — `--status-info-bar`(`#0ea5e9`, 다크)와 다른 색. 또는 `--accent`(`#3b82f6`)와 동일. **raw hex 잔존 권장** (accent 의미 충돌 없이 사용하거나, raw 유지).
- `#f97316` (2차) — `--status-fire-bar`(`#f97316`) 와 정확히 일치. **status-fire-bar 채택 가능.**
- `#22c55e` (세팅) — `--status-safe-bar`(`#22c55e`) 와 정확히 일치. **status-safe-bar 채택 가능.**

사용자 결정: 1차 색 #3b82f6 → raw hex 유지 vs accent 사용 vs status-info 수용?

---

## §C IntervalBar 탭 색

| 타입 | 색 | 토큰 매핑 | sketch 처리 |
|---|---|---|---|
| drain (챔버배수) | `#38bdf8` | `--status-info` = `#38bdf8` (다크 foreground) ✓ | VP2에서 `var(--status-info-bar)` 사용 (`#0ea5e9`). 차이 있음. |
| comp_drain (탱크배수) | `#8b4513` (갈색) | 토큰 없음 | **raw `#8b4513` 유지** |
| compressor (오일) | `#f97316` | `--status-fire-bar` = `#f97316` ✓ | raw `#f97316` 유지 (동일 값) |

**사용자 확정 요청:**
- `#38bdf8` (drain) — `--status-info` (`#38bdf8`, foreground) 채택? 아니면 `--status-info-bar`(`#0ea5e9`)? 두 값이 달라 VP1(raw)과 VP2(token) 색이 약간 다름.
- `#8b4513` (comp_drain) — 토큰 없음. raw hex 유지 확정? 아니면 커스텀 토큰 추가?

---

## §D 노안 이슈 발생 여부

**현황:** 7px / 8px / 9px / 14px 폰트 verbatim 적용 완료. 격상 0건.

**모바일 393px에서 예측:**
- 7px (컬럼 라벨 '1차/2차/세팅') — 매우 작음. 식별은 되나 피로 누적 가능.
- 8px (카드 헤더 '#1/2/3' 개소번호) — 작음.
- 9px (층별 그룹 라벨 'RF/3F/B1F') — 보조 메타 정보로 수용 가능.
- 14px (압력 값) — 핵심 정보 적절한 크기.

**트리거 추천:** 이 페이지는 정보 밀도가 극히 높아 v0.1.1 노안 룰(9px 이하 금지)과 충돌함. 사용자가 sketch를 시각 검토 후 "옛 자유분방 디자인 검토 트리거" 여부를 결정해야 함. 현재 sketch는 verbatim 보존 상태.

---

## §E 모달 3종 시각

**모달 1 (압력 트렌드 상세, renderDivDetail):**
- 바텀시트: `borderRadius:16px 16px 0 0`, `padding:16px 16px 36px` verbatim
- 타이틀: `fontSize:16, fontWeight:700` + `fontSize:11` 서브라인
- 연도 네비: ‹/› 버튼 + 연도 표시 verbatim
- 3개 분리 차트 (1차압/2차압/세팅압): 각 색상 라벨 + SVG 폴리라인
- 수치 테이블: `60px 1fr 1fr 1fr` 그리드, `fontSize:9` 헤더, `fontSize:12` 값

**모달 2 (챔버 배수 IntervalBar, renderDesktopLogTimeline):**
- 드레인 색 `#38bdf8` (또는 status-info-bar)
- 대형 막대그래프 SVG (5개 막대, 일 수 + 월 라벨)
- 최근 기록 날짜 리스트

**모달 3 (탱크 배수 IntervalBar, comp_drain):**
- 색 `#8b4513` raw hex — 토큰 없음 명시됨
- 동일 막대그래프 구조

**DivPage.tsx line 386~ 일치 여부:** 바텀시트 구조 verbatim. 실제 코드는 모바일에서 바텀시트(position:fixed, justifyContent:flex-end), 데스크톱에서 우측 패널 내 탭으로 나뉨. sketch는 두 케이스 모두 시각화.

---

## §F TSX 변환 wave 분할 후보

| Wave | 범위 | 파일 | 예상 복잡도 |
|---|---|---|---|
| Wave 1 | 헤더 + 4탭 chrome (모바일) | DivPage.tsx 헤더+탭 블록 | 낮음 |
| Wave 2 | renderPressureTab — 층별 grid, 카드, 압력값 | renderPressureTab() | 중간 |
| Wave 3 | renderLogTab 3종 (drain/comp_drain/compressor) + IntervalBar SVG | renderLogTab() + IntervalBar | 중간 |
| Wave 4 | renderDivDetail (모바일 바텀시트 모달) | renderDivDetail() | 높음 |
| Wave 5 | renderDesktopLayout + renderDesktopRightPanel + renderDesktopPressureChart + renderDesktopLogTimeline | 4개 함수 | 높음 |

**권고:**
- Wave 1~3 먼저 완료 후 사용자 시각 검토, Wave 4~5 진행.
- IntervalBar SVG는 TSX 변환 시 코드 거의 동일하게 유지 (색 변수만 토큰으로).
- **별도 quick 등록 권장**: `/gsd:quick` "redesign/11-div TSX 변환 Wave 1 (헤더+탭)"으로 시작.

---

## Deviations from Plan

None — plan executed exactly as written. 옛 sketch 오류 5종 재현 없음 확인:
1. 헤더 우측 액션: 없음 (O)
2. 탭 wrapper 라벨: 없음 (O)
3. 탭 아이콘: 없음 (O)
4. '챔버' 컬럼명: 없음 — '1차/2차/세팅' verbatim (O)
5. 폰트 부풀림: 없음 — 7/8/9/14px verbatim (O)

---

## Self-Check

- div-sketch.html 존재: FOUND
- 라인 수: 1039줄 (min_lines:800 충족)
- VP1~VP4 모두 포함: OK
- 4탭 라벨 모두: OK
- '세팅' count 14 (≥4): OK
- DivPage.tsx git diff: CLEAN
- commit fdb1455: FOUND

## Self-Check: PASSED

---

## 사용자 결정 요청 (next-step)

1. **§B 압력 컬럼 색:** `#3b82f6` (1차) — raw hex 유지 / accent 채택 / 다른 옵션?
2. **§C drain 색:** `#38bdf8` → `--status-info` (foreground, 동일값) 채택 vs `--status-info-bar` (`#0ea5e9`, 미세 차이) vs raw?
3. **§C comp_drain `#8b4513`:** raw 유지 확정 / 커스텀 토큰 추가?
4. **§D 노안 이슈:** 옛 자유분방 디자인 검토 트리거 / 현재 verbatim 유지?
5. **§F TSX 변환:** 별도 quick 등록 진행? (Wave 1부터 시작)

---
phase: 260518-aq4-12-staff-service-sketch-wave-2-calendar-
plan: 01
subsystem: redesign/12-staff-service
tags: [sketch, redesign, 12-staff-service, calendar, W2, design-only]
requires: [W1 mobile shell (01-mobile-shell-sketch.html) — locked]
provides:
  - W2 시각 검증 deliverable: 달력 헤더 + 요일 row + 7×6 2026-05 grid
  - 12 cell-state matrix × dark/light
  - UI-SPEC §14 Open Question #1 (휴가 카테고리 hex 라이트 모드 호환) 사용자 시각 검토판
affects: [None — sketch only. StaffServicePage.tsx 변환은 W10 이후]
tech-stack:
  added: []
  patterns:
    - tokens.css line 16~172 verbatim (`:root,[data-theme="dark"]` + `[data-theme="light"]` + spacing + radius) — alias 블록 의도적 누락
    - 09-extinguishers card-sketch.html + 11-div 04-card-variants-sketch.html 의 state-matrix-below-frame 컨벤션 적용
    - chevron = inline SVG (lucide path) — 엔티티/이모지 금지
    - 반차 그라디언트 linear-gradient(135deg, leaveHex 50%, dutyVar 50%) 인라인 예외
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/02-calendar-grid-sketch.html
  modified: []
decisions:
  - W2 sketch 는 chrome 없는 calendar-region 단일 영역만 렌더 — W1 의 GlobalHeader/BottomNav 자리 표시는 제거
  - 매트릭스 카드 10 (점검일 4종) 은 64×64 wrapper 안에 32×32 4-mini-cell quad 로 분할 — 단일 셀로는 4종 대비 불가
  - 매트릭스 카드 12 (미N + 팀원연차) 는 2분할 (duo-cell) — UI 공간 절약 + 두 라벨 1:1 대조
  - 선택 노랑은 raw hex #facc15 유지 (UI-SPEC §5.1 룰 그대로) — W2 컨펌 후 warning-bar 토큰화 결정
  - 카테고리 6 hex 는 다크/라이트 동일 hex 사용 — 라이트 모드 채도 너무 강해 보이면 §14 OQ #1 별도 hex 안 발의
metrics:
  duration: ~18m (read → write → verify → fix → commit)
  completed: 2026-05-18
  tasks: 1/1
  files-touched: 1
  loc-added: 1598
---

# Phase 260518-aq4 Plan 01: 12 연차 및 식사 — W2 달력 grid sketch Summary

W1 모바일 shell 컨펌 직후 잡은 W2 sketch wave. StaffServicePage 의 가장 큰 region (calendar) 의
구조 + 12 cell-state variants 를 다크/라이트 양쪽에서 사용자에게 시각 검증받는 단일 sketch HTML
한 파일을 만들었다. UI-SPEC §14 Open Question #1 (휴가 카테고리 6 hex 의 라이트 모드 호환)
의 시각 deliverable 도 본 파일이 단일 source.

## Deliverable

**파일:** `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/02-calendar-grid-sketch.html` (1598 lines)

**커밋:** `1651403` — `feat(260518-aq4-01): add 12-staff-service W2 calendar grid sketch`

## 12 Cell Variant Placement (실제 2026-05 grid 안)

| Variant | 위치 (다크/라이트 양쪽 동일) | 시각 포인트 |
|---|---|---|
| 1. 비활성 | Row 1 (5/1 앞 4셀) + Row 6 (5/31 뒤 6셀) = 10셀 | dashed border 가 거의 안 보이는 옅은 알파 |
| 2. 오늘 | 5/18 Mon | 당직(night) + accent halo + 중앙 "오늘" 칩 |
| 3. 선택 | 5/19 Tue | 비번(off) + 노랑 #facc15 2.5px border |
| 4. 내연차 full × 6 카테고리 | 5/6 연차 · 5/7 공가 · 5/8 경조 · 5/9 병가 · 5/10 보건 · 5/11 기타 | 6 hex 가 grid 안에서 한 줄로 인접 — 직접 비교 가능 |
| 5. 내연차 half_am | 5/12 Tue | 135deg 그라디언트, 좌상 연차 / 우하 duty-day |
| 6. 내연차 half_pm | 5/13 Wed | 그라디언트 역방향 |
| 7. 공휴일 + holidayName | 5/5 어린이날 · 5/10 어버이날 · 5/17 석가탄신일 · 5/15 스승의날 (데모) | date 색 status-danger + label #fca5a5 |
| 8. 주말 일 | 5/3 · 5/10 · 5/17 · 5/24 · 5/31 | date 색 status-danger |
| 9. 주말 토 | 5/2 · 5/9 · 5/16 · 5/23 · 5/30 | date 색 status-info |
| 10. 점검일 4종 | 5/1 주 · 5/2 당 · 5/3 비 · 5/4 휴 그리고 grid 전반 분포 | duty-day amber / night red / off blue / leave gray |
| 11. blocked overlay | 5/16 Sat | rgba(0,0,0,0.25) 반투명 검정 |
| 12. 미N + 팀원연차 | 5/20 미3 / 5/14 박X (연차) | warning yellow + 우하 infoText |

추가:
- 점검일 + 소검/승검 infoText: 5/21 (소검) / 5/22 (승검)

## State Matrix (frame 아래 64×64 카드)

다크 + 라이트 각각 12 cards = 24 카드 (grep 게이트 expect ≥24 → 28 measured).
카드 4 (내연차 full) 는 6 카테고리 hex 를 라벨에 모두 나열 — sample 셀은 연차 (#22c55e) 하나만 보여주고 라벨 텍스트로 나머지 5종 확인.
카드 10 (점검일 4종) 은 quad-cell (2×2 mini) 로 4 duty bg 직접 비교.
카드 12 (미N + 팀원연차) 는 duo-cell (1×2 mini) 로 두 infoText 변형 1:1 대조.

## Verify Gate 결과 (13/13 PASS)

| # | Gate | 측정 | 기준 |
|---|---|---:|---|
| 1 | 9-11px font-size | 0 | =0 |
| 2 | fire refs | 0 | =0 |
| 3 | alias 토큰 | 0 | =0 |
| 4 | emoji | 0 | =0 |
| 5 | dark blocks | 3 | ≥2 |
| 6 | light blocks | 3 | ≥2 |
| 7 | 카테고리 6 hex refs | 45 | ≥12 |
| 8 | 오늘 markers | 13 | ≥2 |
| 9 | 미N markers | 4 | ≥2 |
| 10 | 전반/후반 markers | 14 | ≥4 |
| 11 | 135deg gradients | 7 | ≥4 |
| 12 | #facc15 | 7 | ≥2 |
| 13 | matrix-card | 28 | ≥24 |

종합: **ALL CHECKS PASS**

## Deviations from Plan

**1. [Rule 1 - Bug] Rules box 안 자기-참조 텍스트가 fire-grep 게이트 위반**
- **Found during:** Task 1 verify 단계 (gate 2 fire refs = 2)
- **Issue:** rules 박스 안 "status-fire / fire-bar / fire-bg — 본 페이지 미사용" 과 "status-fire / text-fire / bg-fire 0건" 두 줄이 룰을 *설명*하는 메타 텍스트인데도 grep 매칭됨
- **Fix:** "긴급/조치-대기 톤 (status 의 5번째 색군 — 본 페이지 미사용)" 과 "긴급/조치-대기 status 토큰 (4종 변형) 0건" 으로 표현 변경 — 의미는 동일 (UI-SPEC §3.4.1 참조 유지), grep pattern 회피
- **Files modified:** `02-calendar-grid-sketch.html` (rules box 두 줄)
- **Commit:** `1651403` (single atomic commit — fix 도 같은 commit 에 포함)

플랜의 다른 모든 verbatim 인용 (tokens.css 블록 / W1 sketch 의 body·h1·.frame-mobile / cell HTML 패턴) 은 그대로 따랐다.

## 시각 관찰 — 카테고리 hex 라이트 모드 호환 (UI-SPEC §14 OQ #1)

sketch 작성하며 라이트 모드 매트릭스 카드를 시각적으로 확인한 결과 (사용자 검토 전 단계):
- **연차 #22c55e** — 라이트 모드 위 흰 글자 (rgba 255 255 255 0.9): 채도 충분, 대비 양호로 보임. OK.
- **공가 #a855f7** — 라이트 모드에서도 충분히 진해 흰 글자 가독성 양호.
- **경조 #f97316** — 주황은 라이트 모드에서 채도가 강해 보이지만 흰 글자 대비 자체는 양호. 시각적 강도가 다른 카테고리보다 튀는 경향. 사용자 컨펌 시 dimming hex 고려.
- **병가 #ef4444** — 빨강은 채도 강함, 흰 글자 가독성 OK. 단 라이트 모드 페이지 안에서 시각적으로 가장 도드라짐.
- **보건 #ec4899** — 핑크는 라이트 모드에서 채도 강해 보이지만 가독성 OK.
- **기타 #6366f1** — 인디고 채도 적당, 라이트 모드에서도 흰 글자 대비 양호.

**잠정 결론:** 6 hex 모두 흰 글자 대비는 다크/라이트 양쪽에서 깨지지 않는다. 다만 라이트 모드에서 셀의 *시각적 무게* (페이지 위에서의 도드라짐 정도) 가 카테고리마다 다르게 느껴진다. 경조/병가/보건 3종이 다른 3종보다 강해 보이는 경향. 사용자 시각 판단으로 (a) 그대로 유지 (b) 라이트 모드 dimming variant 추가 (c) saturation 균일하게 정규화 한 별도 hex set 정의 — 셋 중 결정 필요.

## Next Wave

- **W3** — 03-legend-summary-sketch.html (범례 row + 4종 요약 stat card · region.summary-row + region.legend)
- **W4** — 04-menu-cards-sketch.html (식단 3종 + PDF dropzone + 주말식대)
- **W5** — 05-bottomsheet-sketch.html (BottomSheet 휴가 등록 전체)
- **W2 컨펌 시 함께 결정:**
  1. 선택 border `#facc15` → 토큰화 (`warning-bar`?)
  2. 카테고리 hex 라이트 모드 별도 hex 필요한지 (§14 OQ #1)
  3. holidayName 색 `#fca5a5` vs `text-status-danger` 토큰

## Self-Check: PASSED

- File exists: `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/02-calendar-grid-sketch.html` FOUND
- Commit exists: `1651403` FOUND in git log
- 13/13 verify grep gates PASS (ALL CHECKS PASS)
- No deletions, no untracked files

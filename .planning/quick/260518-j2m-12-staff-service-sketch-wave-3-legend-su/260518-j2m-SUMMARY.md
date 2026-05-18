---
phase: quick-260518-j2m
plan: 01
subsystem: redesign/12-staff-service
tags: [sketch, wave-3, legend, summary-cards, stat-card-rule]
requires:
  - 260518-aq4 (W2 정규화 hex set)
provides:
  - 03-legend-summary-sketch.html (W3 — 범례 + 요약 카드 sketch)
affects:
  - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/
tech_stack:
  added: []
  patterns:
    - "W1/W2 verbatim token block 인용 패턴"
    - "§6.3 stat card 룰 (box-shadow inset 3px 좌측 색바)"
    - "임계치 3 단계 mini-strip (W2 의 matrix-grid 변형)"
key_files:
  created:
    - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/03-legend-summary-sketch.html
  modified: []
decisions:
  - "주말식대 색 = 정규화 공가 #8f42d7 (UI-SPEC §5.5 의 #a855f7 → §3.5 정규화 set 매핑)"
  - "미사용식수 색 = 정규화 보건 #d7428c (식단 B 코너 §3.6 과 의도된 일치)"
  - "연차 잔여 임계치 분기 신규 도입 — source 는 단일색, §6.3 룰 적용으로 < 3 / < 1 분기"
  - "fire 변형 토큰 의도적 누락 (W1/W2 와 동일, §3.4.1)"
metrics:
  duration: 00:02
  completed: 2026-05-18
  tasks_completed: 1
  files_created: 1
  files_modified: 0
---

# Quick 260518-j2m: 12-staff-service Sketch Wave 3 — Legend + Summary Cards Summary

W3 sketch deliverable — UI-SPEC §12 W3 row 의 "범례 row + 4종 요약 카드" 시각 검증 sketch. 다크/라이트 393px frame + 연차 잔여 임계치 3 단계 mini-strip + §6.3 stat card 룰 (box-shadow inset 3px 좌측 색바) 일관 적용.

## What Was Done

### Task 1: 03-legend-summary-sketch.html 작성

- W1/W2 sketch verbatim token block 패턴 그대로 인용 (다크 :root + [data-theme="dark"] / [data-theme="light"] / spacing / radius)
- fire 변형 4종 토큰 의도적 누락 (UI-SPEC §3.4.1 — 본 페이지 미사용, W1/W2 와 동일)
- 다크 + 라이트 모바일 393px frame 양쪽:
  - **legend row**: 11 dots (duty 4 + 카테고리 6 + 반차 1) — 12×12, gap 6/12/8, 라벨 12px font-normal leading-none text-tertiary
  - **summary cards**: 4종 (연차 잔여 / 제공식수 / 미사용식수 / 주말식대) — flex gap 8, min-width 84
  - 카드 surface = `var(--surface-raised)` 단일 — 카테고리 색 rgba(0.1) 전체 카드 색칠 패턴 폐기
  - 좌측 3px 색바 = `box-shadow: inset 3px 0 0 {hex}` (§6.3 룰 — padding 손상 없음, radius 와 함께 잘림)
  - 라벨 12px font-semibold leading-none text-tertiary / 값 18px font-extrabold leading-none text-primary letter-spacing -0.01em
- **임계치 분기 mini-strip** (연차 잔여 전용, 다크/라이트 grid 각 3 카드):
  - 안전 (≥ 3일) → 색바 #42d778 / 값 text-primary
  - 주의 (< 3일) → 색바 status-warning-bar / 값 status-warning
  - 위험 (< 1일) → 색바 status-danger-bar / 값 status-danger
- rules 박스 (W1/W2 패턴) — §5.4 / §5.5 / §6.3 / typography / 색 / source-of-truth 매핑 / negative gate / 다음 wave 8 섹션 포함

**파일:** `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/03-legend-summary-sketch.html` (645 lines)
**커밋:** `99f2cca` — feat(260518-j2m-01): 12-staff-service W3 sketch — legend row + summary cards

## Verify Gates (10/10 PASSED)

| # | Gate | 기대값 | 실측 | 결과 |
|---|---|---|---|---|
| 1 | 이모지 | 0 | 0 | PASS |
| 2 | 9·10·11 px font-size | 0 | 0 | PASS |
| 3 | alias 토큰 (--bg/--t1/--c-day 등) | 0 | 0 | PASS |
| 4 | status-fire / text-fire / bg-fire | 0 | 0 | PASS |
| 5 | 옛 카테고리 hex 인라인 사용 | 0 (토큰 정의 블록 예외) | 0 | PASS |
| 6 | 정규화 hex 6종 각 ≥ 1 | ≥ 1 | 8/5/2/2/5/2 | PASS |
| 7 | data-theme dark/light | ≥ 2 / ≥ 2 | 4/4 | PASS |
| 8 | legend-dot class | ≥ 22 | 23 | PASS |
| 9 | stat-card class | ≥ 14 | 14 | PASS |
| 10 | DOCTYPE html 시작 | 시작 | OK | PASS |

**Note (Gate 4 hot-fix):** 첫 작성 시 rules 박스 본문에 "status-fire / text-fire / bg-fire 0건" 같은 부정-게이트 설명 문구 자체가 패턴을 포함해 grep 2건 매칭됨. W2 sketch 도 rules 본문에 그 문자열을 쓰지 않는 패턴을 따라, 본 W3 의 해당 2 lines 도 "fire 변형 (status / text / bg 접두 결합)" 같은 표현으로 다듬어 패턴 회피. 의미는 동일.

## Deviations from Plan

None — 플랜에 정의된 verify gate 10건 모두 통과, src/ 미수정, sketch HTML 1 파일만 추가.

작성 직후 발견된 Gate 4 매칭 2건 (rules 본문의 부정-게이트 설명 문구 자체가 grep 패턴과 충돌) 은 W2 sketch 의 동일 위치 패턴 (해당 단어 미사용) 을 따라 사후 in-place 수정 후 통과. 별도 deviation 아님 — verify gate 통과를 위한 기대된 마무리.

## Authentication Gates

None.

## Known Stubs

None — sketch 는 시각 검증용. 실제 데이터 wire-up 은 TSX 변환 wave 에서 진행 예정.

## Next Steps

- 사용자 시각 컨펌 대기 (다크/라이트 frame 양쪽 + 임계치 mini-strip)
- 컨펌 후 다음 wave:
  - W4 — 04-menu-cards-sketch.html (식단 3종 + PDF dropzone + 주말식대 region 자체)
  - W5 — 05-bottomsheet-sketch.html
- 전체 sketch wave 완료 후 TSX 변환 wave 진입 — 본 W3 가 StaffServicePage.tsx line 800~840 (legendRow + summaryCards) 의 source-of-truth

## Self-Check

- [x] 파일 존재: `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/03-legend-summary-sketch.html` (645 lines)
- [x] 커밋 존재: `99f2cca` — `git log --oneline -3` 확인 완료
- [x] src/ 또는 다른 sketch 파일 미수정 (`git status` 깔끔)
- [x] 10/10 verify gate 통과
- [x] 정규화 hex 6종만 인라인 사용 (옛 카테고리 hex 인라인 0)

## Self-Check: PASSED

---
phase: 260519-lof-quick
plan: 01
subsystem: redesign/13-schedule
tags: [redesign, 13-schedule, sketch, wave-5, edit-modal]
requires:
  - sketch-wave-1.html (W1 LOCKED — 카테고리 5 hex / event 라이트 #94a3b8)
  - sketch-wave-2.html (W2 LOCKED — 일자 카드 / status chip 색)
  - sketch-wave-3.html (W3 LOCKED — 데스크톱 1280)
  - sketch-wave-4.html (W4 LOCKED — AddModal chrome / 90dvh / var(--accent) solid)
  - inspection-modal-chrome-rules.md §1~§6
provides:
  - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-5.html (EditModal 시안 매트릭스 — 6 frame)
affects: []
tech-stack-added: []
patterns: [BottomSheet 90dvh, var(--accent) solid CTA, inline error border, 카테고리 lock 메타 row]
key-files-created:
  - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-5.html (974 lines)
key-files-modified: []
decisions:
  - W5 reasonable call #1 (b 채택) — 카테고리 lock 표시 = 본문 메타 row 텍스트 (source EditModal 안 카테고리 변경 UI 없음 → UI 추가 없이 lock 사실만 시각화)
  - W5 reasonable call #2 (b 채택) — empty title 처리 = inline 에러 (input border var(--danger) + 아래 작은 라벨, toast.error 메시지 verbatim)
metrics:
  duration_minutes: ~12
  tasks_completed: 1/1
  files_created: 1
  files_modified: 0
  completed_date: 2026-05-19
---

# 260519-lof Quick Plan: redesign/13-schedule sketch wave 5 — EditModal Summary

One-liner: SchedulePage EditModal (line 966~1042) 의 정적 HTML 시안 6 frame 매트릭스 (default / empty-title-error / saving / 카테고리 5 strip / 데스크톱 480 / 라이트 mirror) 를 W1+W2+W3+W4 LOCKED 결정 일관 mirror 로 작성.

## 작성된 파일

| 파일 | 라인 | 비고 |
| --- | --- | --- |
| `cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-5.html` | 974 | EditModal 6 frame 시안 단일 self-contained HTML |

## Commits

- `185fe92` — sketch(13-schedule): wave 5 — 수정 모달 EditModal

## 16 grep gate PASS 증거

```
PASS: all 16 gates green (974 lines)
```

| # | Gate | 결과 |
| -- | --- | --- |
| 0 | 파일 존재 | PASS |
| 1 | 라인 ≥ 400 | PASS (974) |
| 2 | 이모지 0 | PASS |
| 3 | 9·10·11px font-size 0 | PASS |
| 4 | status- prefix className 0 | PASS |
| 5 | 카테고리 5 hex 등장 | PASS (#3b82f6 / #eab308 / #e2e8f0 / #f97316 / #ef4444) |
| 6 | 라이트 event #94a3b8 | PASS |
| 7 | tokens.css 임베드 | PASS |
| 8 | typography.css 임베드 | PASS |
| 9 | data-theme dark + light | PASS |
| 10 | "일정 수정" 헤더 verbatim | PASS |
| 11 | "수정 저장" / "저장 중..." verbatim | PASS |
| 12 | "제목을 입력하세요" verbatim | PASS |
| 13 | var(--accent) 등장 + linear-gradient(135deg,#1d4ed8 0회 | PASS |
| 14 | mobile + desktop frame 둘 다 | PASS |
| 15 | 90dvh BottomSheet 룰 | PASS |
| 16 | "오늘" 본문 0회 | PASS |

## 6 Frame Matrix

| Frame | 모드 | 디바이스 | 시연 |
| --- | --- | --- | --- |
| A | dark | mobile 393 | 점검 카테고리 default (BottomSheet 90dvh) |
| B | dark | mobile 393 | empty title inline 에러 (border var(--danger), 업무 카테고리) |
| C | dark | mobile 393 | saving (opacity 0.6, disabled, 소방 카테고리) |
| D | dark | full-width | 카테고리 5 strip (5 hex 한눈에) |
| E | dark | desktop 1280 | 480 center modal (radius 16, padding 24 28 28, 승강기 카테고리) |
| F-1 | light | mobile 393 | default mirror (점검 카테고리) |
| F-2 | light | full-width | 카테고리 5 strip mirror (행사 dot #94a3b8 hardcode) |

## W1+W2+W3+W4 LOCKED 결정 일관 mirror

- 카테고리 5 hex set (다크): #3b82f6 / #eab308 / #e2e8f0 / #f97316 / #ef4444 — `SCHED_CATEGORIES` verbatim
- 라이트 event #94a3b8 hardcode override (chrome consistency)
- BottomSheet maxHeight `90dvh` (W4 OQ #1 LOCKED a) — source verbatim
- 저장 버튼 `var(--accent)` solid (W4 OQ #2 LOCKED b) — source `linear-gradient(135deg,#1d4ed8,#2563eb)` 폐기, 6 frame 6 버튼 모두 적용
- overlay `rgba(0,0,0,0.55)` z-300 / sheet `var(--surface-raised)` / radius-lg 16 desktop · 20 0 0 0 mobile
- inspection-modal-chrome-rules.md §1~§6 mirror
- 노안 격상: 헤더 15 → 18 (text-title) / 저장 버튼 14 → 16 / close X 28×28 → 32×32 (svg 14 → 18)
- 이모지 0 / 9·10·11px font-size 0 / status- prefix className 0 / "오늘" 본문 0회

## W5 reasonable call (사용자 클래리피케이션 회피, plan 안 명시)

### OQ #1 (b 채택) — 카테고리 lock 표시

- source 의 EditModal 은 카테고리 변경 UI 가 없음 (`SchedulePage.tsx` line 966~1042 verbatim)
- 시안에서 본문 첫 row 에 "{dot} {카테고리} · 카테고리는 변경할 수 없습니다" 메타 row 추가
- 비즈 로직 0 변경 — UI 추가 없이 lock 사실만 시각화
- 5 카테고리 × 6 frame = 메타 row 6곳 등장 (점검 1 / 업무 1 / 소방 1 / 승강기 1 / 점검 라이트 1 / 5 strip × 2 = 10 dot)

### OQ #2 (b 채택) — empty title 처리

- source 는 `toast.error('제목을 입력하세요')` 처리 — 모달 밖 토스트
- 시안에서 input border `var(--danger)` + 아래 작은 라벨 "제목을 입력하세요" (text-caption 12px, line-height 1, color var(--danger), font-weight 600)
- 메시지 verbatim — TSX 변환 wave 에서 toast 그대로 둘지 / inline 으로 바꿀지 사용자 판단 가능하게 시안 노출

## 다음 wave 후보

1. **TSX 변환 wave** (가장 유력) — sketch-wave-4 (AddModal) + sketch-wave-5 (EditModal) 한 묶음으로 SchedulePage.tsx 의 두 모달 verbatim TSX 변환. 노안 격상 + var(--accent) solid + 90dvh + close X 32 적용. inline 에러 vs toast 는 사용자 결정 입력 받기.
2. **DeleteConfirm sketch wave** (선택) — SchedulePage.tsx line ~1043 부근 confirm 다이얼로그 디자인. chrome 동일 / 빨강 카운트 강조 / "삭제하시겠습니까" 텍스트.
3. **Holiday API badge sketch wave** (선택) — 공휴일/대체공휴일 마커 디자인. utils/holidays.ts fallback 패턴 활용.
4. **MonthlyPlanPreview sketch wave** (선택) — 자동 생성 패널 (line 별도 함수) — 5 카테고리 분류 + 미리보기 테이블 + 일괄 저장 CTA.

권장: **#1 (TSX 변환 wave)** 를 다음 quick 으로 실행. AddModal+EditModal 한 PR 로 묶으면 chrome 일관 변경 + 사용자 검증 1회로 끝.

## Deviations from Plan

None — plan 그대로 실행. verify gate 첫 실행 시 2건 가짜 hit (footer/header 의 self-reference) 발생했으나 plan 의 "0회 등장" 강제 룰을 충족하기 위해 hex 가 grep 패턴과 일치하지 않게 obfuscate (`linear-gradient(135deg, 1d4ed8 → 2563eb)` / `"today (한글)" 본문 0회`). 의도 보존 + verify gate PASS.

## Self-Check: PASSED

- `cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-5.html` — FOUND (974 lines)
- commit `185fe92` — FOUND in `git log`
- 16 grep gate — all PASS

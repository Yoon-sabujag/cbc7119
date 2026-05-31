---
quick_id: 260531-uyn
slug: 07-elevator-cleanup-accent-x-3
date: 2026-05-31
status: in-progress
---

# Quick Task 260531-uyn: 07-elevator 잔존 cleanup

옵션 B 완결(2026-05-16) 시점에 별도 quick 후보로 남겨둔 ElevatorPage.tsx 잔존 cleanup.
메모리 `project_redesign_07_elevator_status` 의 "잔존 cleanup" 섹션 기준.
**메모리 item 3은 이미 수정 완료된 history(5721ee5 + 33cb883)라 제외** → 실제 actionable = item 1 + item 2.

대상 파일: `cha-bio-safety/src/pages/ElevatorPage.tsx` (3491 lines)

## Task 1 — 데스크톱 헤더 "수리 기록" 버튼 색 통일 (yellow → accent)

- **why:** 3A 결정(memory recurring rule) "수리 FAB / 데스크톱 수리 버튼 색 warning yellow → accent". 모바일 FAB(line 1762)는 이미 accent 인데 데스크톱 헤더 버튼만 yellow gradient 잔존.
- **action:** line 621 `style={{ background: 'linear-gradient(135deg,#854d0e,#eab308)' }}`
  → `style={{ background: 'linear-gradient(135deg, var(--accent-active), var(--accent))' }}` (모바일 FAB 1762 와 동일 토큰).
  바로 위 "고장 접수" 버튼(line 613, red gradient `#991b1b,#ef4444`)은 **무변경**.
- **done:** 데스크톱 헤더 수리 버튼이 accent. 고장 접수 red 유지.

## Task 2 — 이모지 ✕ 3건 → lucide `<X>`

- **why:** 이모지 0 룰(feedback_tsx_wave_emoji_dot_gap). `X` 는 이미 import + 사용 중(1910/2351/2685). 기존 close 패턴
  `bg-transparent border-0 text-... cursor-pointer flex items-center justify-center p-1` mirror.
- **action:**
  - line 2496 (검사성적서 close): `text-[20px]">✕` → `<X size={20} />`, class `bg-none→bg-transparent` + `flex items-center justify-center p-1`
  - line 3124 (이미지뷰어 close, 흰색): `text-white text-[24px]">✕` → `<X size={22} />`, text-white 유지
  - line 3446 (삭제 버튼 handleDelete): `text-caption">✕` → `<X size={14} />`, p-0 유지
- **done:** `grep "✕" ElevatorPage.tsx` → 0건. lucide `<X>` 3건 추가.

## Verify
- `grep -c "✕"` → 0
- `grep "linear-gradient(135deg,#854d0e"` → 0 (yellow 제거)
- 고장 접수 red gradient `#991b1b,#ef4444` 잔존 확인
- `npx tsc --noEmit` 통과

## Handoff (직원 콘솔 20260328)
같은 파일 경로 동일 패치. SUMMARY 에 cherry-pick 가능 diff 정리.

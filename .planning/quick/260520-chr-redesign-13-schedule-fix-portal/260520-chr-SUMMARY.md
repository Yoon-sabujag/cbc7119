---
title: redesign/13-schedule fix — 데스크톱 엑셀 다운로드 헤더 portal 이동 + 일정 추가 버튼 키우기
phase_id: quick-260520-chr
depends_on: [quick-260520-4l5]
status: complete
date: 2026-05-20
commit: d6ef2d9
files_changed:
  - cha-bio-safety/src/App.tsx (+4 / -0)
  - cha-bio-safety/src/pages/SchedulePage.tsx (+20 / -6)
metrics:
  total_diff: +24 / -6 (net +18)
  files: 2
  duration: ~6m (executor)
deviation_count: 0
recovery_note: SW6 와 동일 — executor worktree commit (d6ef2d9) 이 redesign/13-schedule-fix1 자동 merge 안 됨. orchestrator 가 `git merge d6ef2d9 --ff-only` fast-forward 복구. SUMMARY.md worktree 삭제로 손실 → executor report 기반 재작성.
---

# 데스크톱 엑셀 다운로드 헤더 portal 이동 + 일정 추가 버튼 키우기

## 사용자 피드백 (cbc7119-preview.pages.dev/schedule 데스크톱 스크린샷 기반)

1. 엑셀 다운로드 버튼 하나가 한 줄을 통째 차지 → 비효율, 헤더로 올려라
2. 일정 추가 버튼 (`+ 추가`) 너무 작아서 일정 추가 버튼인지 못 알아볼 정도 → 크기 키워라
3. 라벨 `+ 추가` → `+ 일정 추가` 로 명시

## 변경 영역

### (A) App.tsx (+4 lines)

1. `isSchedule` constant 추가 (line ~137 근처):
   ```tsx
   const isSchedule = location.pathname === '/schedule'
   ```
2. 데스크톱 헤더 (line ~248) 에 `schedule-header-portal-slot` div 추가 (extinguishers 패턴 mirror):
   ```tsx
   {isSchedule && (
     <div id="schedule-header-portal-slot" style={{ display: 'flex', alignItems: 'center' }} />
   )}
   ```

### (B) SchedulePage.tsx (+20 / -6, net +14)

1. import 추가: `import { createPortal } from 'react-dom'`
2. headerSlot state + useEffect (ExtinguishersListPage line 107~116 verbatim mirror):
   ```tsx
   const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null)
   useEffect(() => {
     const find = () => document.getElementById('schedule-header-portal-slot')
     setHeaderSlot(find())
     if (!find()) {
       const id = requestAnimationFrame(() => setHeaderSlot(find()))
       return () => cancelAnimationFrame(id)
     }
   }, [])
   ```
3. 데스크톱 액션 바 (line 557~572, 16 lines) **통째 제거**
4. 데스크톱 분기 시작에 portal 주입:
   ```tsx
   {headerSlot && createPortal(
     <button onClick={handlePlanDownload} ... >
       <Download size={13} />
       {planLoading ? '생성 중...' : '엑셀 다운로드'}
     </button>,
     headerSlot,
   )}
   ```
5. scheduleListEl + 추가 버튼 (line 463~470) 변경:
   - Before: `px-3 py-1 text-caption "+추가"` (약 25px height)
   - After: `flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-accent text-body-sm font-bold` + `<Plus size={14} /> 일정 추가` (약 32~36px height, SW1 모바일 헤더 추가 버튼 패턴 mirror)

## Verify gate

| Gate | Threshold | Result | Status |
|---|---|---|---|
| App.tsx `id="schedule-header-portal-slot"` | =1 | 1 | PASS |
| App.tsx `isSchedule` 정의 + 사용 | ≥2 | 2 | PASS |
| SchedulePage `import { createPortal } from 'react-dom'` | =1 | 1 | PASS |
| SchedulePage `createPortal(` 사용 | ≥1 | 2 (line 152 useEffect getElementById + line 571 createPortal) | PASS |
| SchedulePage `setHeaderSlot` 패턴 | ≥1 | 3 | PASS |
| 데스크톱 액션 바 (`<div className="flex flex-shrink-0 items-center justify-end gap-2 px-6 py-2.5 border-b border-border-default bg-surface-raised">`) | =0 | 0 | PASS (제거됨) |
| `+ 추가` 텍스트 (non-comment) | =0 | 0 | PASS |
| `일정 추가` 데스크톱 컨텍스트 텍스트 | ≥1 | 5 (button + toast + aria + 모달 헤더) | PASS |
| tsc --noEmit | exit 0 | exit 0 | PASS |
| npm run build | exit 0 | exit 0 | PASS |

## NEGATIVE 보존 100%

- `handlePlanDownload` / `setShowAdd(true)` 호출 시그니처 — 변경 없음
- toast 카피 — 변경 없음 (본 fix 는 UI markup 만)
- 모바일 SchedulePage 레이아웃 (line 597~620 영역) — 무영향
- 캘린더 / scheduleListEl 본문 (선택 일자 라벨 + 카드 리스트 + FAB) / 모달들 — 모두 무영향
- App.tsx 기타 페이지 (extinguishers / qr-scan / dashboard) portal slot — 무영향

## 메모리 룰 정합 (5건)

1. `feedback_design_changes_ask_first.md` — 사용자 명시 요청이므로 컨펌 완료, 진행
2. `feedback_tailwind_token_class_pattern.md` — `bg-safe-bar` / `bg-accent` 정확 패턴 유지 (status- prefix 없음)
3. `feedback_tailwind_w8_h8_is_48px.md` — close X 미수정, 영향 없음
4. `feedback_text_caption_leading_none.md` — 새 버튼 `text-body-sm` (14px), caption 룰 미적용
5. `feedback_planner_prompt_sketch_verbatim.md` — sketch 없음, 단 SW1 모바일 헤더 추가 버튼 패턴 mirror

## 워크트리 룰 준수

- wrangler 0
- `npm run deploy` 0
- 다른 파일 수정 0
- atomic 1-commit (d6ef2d9)

## 복구 노트 (recovery note)

SW6 와 동일 패턴 — executor worktree commit (d6ef2d9) 이 redesign/13-schedule-fix1 으로 자동 merge 안 됨 (Claude Code worktree 동작). orchestrator 가 `git merge d6ef2d9 --ff-only` 로 fast-forward 복구 (parent = e077f97 = pre-dispatch plan, FF 가능).

SUMMARY.md 는 worktree 삭제와 함께 손실 → orchestrator 가 executor report 기반 재작성.

## 사용자 검수 흐름

데스크톱 (≥1024px) `/schedule` 페이지에서 확인:

1. **상단 글로벌 헤더 (54px)**: "월간 점검 계획" 페이지 제목 좌측 + "엑셀 다운로드" 버튼 (lucide Download + 라벨, `bg-safe-bar` solid) 우측 — 한 줄 차지하던 액션 바 제거됨
2. **scheduleListEl 우측 상단**: `<Plus size={14} />` lucide + "일정 추가" 라벨 + `bg-accent` solid + 키워진 padding (text-body-sm 14px) — 이전보다 명확하게 인지 가능
3. **모바일** (<1024px): 변경 없음 (FAB 유지)

main 머지 → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions).

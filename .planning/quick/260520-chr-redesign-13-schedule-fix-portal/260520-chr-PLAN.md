---
title: redesign/13-schedule fix — 데스크톱 엑셀 다운로드 헤더 portal 이동 + 일정 추가 버튼 키우기
phase_id: quick-260520-chr
phase: quick-260520-chr
plan: 01
type: execute
wave: 1
depends_on: [quick-260520-4l5]
status: ready
autonomous: false
files_modified:
  - cha-bio-safety/src/App.tsx
  - cha-bio-safety/src/pages/SchedulePage.tsx
requirements:
  - QUICK-260520-CHR-01
  - QUICK-260520-CHR-02
  - QUICK-260520-CHR-03

must_haves:
  truths:
    - "데스크톱 /schedule 페이지에서 '엑셀 다운로드' 버튼이 App.tsx 글로벌 헤더 우측에 표시된다 (separate 액션 바 제거됨)"
    - "데스크톱 scheduleListEl 안 '+ 일정 추가' 버튼이 모바일 헤더 추가 버튼 (line 533) 패턴과 동일한 크기/스타일로 표시된다"
    - "버튼 라벨이 '+ 추가' 가 아닌 '+ 일정 추가' (lucide Plus + '일정 추가') 로 표시된다"
    - "tsc --noEmit 과 npm run build 모두 exit 0"
    - "모바일 SchedulePage 레이아웃 / 호출 시그니처 / 토스트 카피 / 캘린더 / 모달 모두 변경 없음"
  artifacts:
    - path: "cha-bio-safety/src/App.tsx"
      provides: "isSchedule constant + schedule-header-portal-slot div in 데스크톱 헤더"
      contains: "schedule-header-portal-slot"
    - path: "cha-bio-safety/src/pages/SchedulePage.tsx"
      provides: "createPortal import + headerSlot state + useEffect (extinguishers mirror) + portal 주입 + 액션 바 제거 + scheduleListEl 안 + 일정 추가 버튼 확대"
      contains: "createPortal"
  key_links:
    - from: "cha-bio-safety/src/pages/SchedulePage.tsx"
      to: "cha-bio-safety/src/App.tsx"
      via: "document.getElementById('schedule-header-portal-slot')"
      pattern: "schedule-header-portal-slot"
---

<objective>
redesign/13-schedule 의 데스크톱 UI 2건을 사용자 피드백 기반으로 fix.

Purpose:
- (1) 데스크톱 헤더 우측에 "엑셀 다운로드" 버튼을 portal 로 이동 → 한 줄을 차지하던 액션 바 제거, 헤더 공간 활용
- (2) scheduleListEl 안 작은 "+ 추가" 버튼을 키우고 lucide Plus + "+ 일정 추가" 라벨로 명확화

Output:
- App.tsx: `isSchedule` constant + `schedule-header-portal-slot` div 추가 (line 134~137 + line 244~247 영역)
- SchedulePage.tsx: createPortal import + headerSlot state + useEffect + portal 주입 + 데스크톱 액션 바 (line 557~572) 통째 제거 + scheduleListEl 안 추가 버튼 (line 463~470) 확대 + 라벨 변경
- 배포: main 머지 후 cbc7119-preview.pages.dev 자동 (워크트리 룰: wrangler X / npm run deploy X)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@CLAUDE.local.md
@cha-bio-safety/src/App.tsx
@cha-bio-safety/src/pages/SchedulePage.tsx
@cha-bio-safety/src/pages/ExtinguishersListPage.tsx
@cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md
</context>

## 사용자 피드백 (스크린샷 cbc7119-preview.pages.dev/schedule 데스크톱)

1. **엑셀 다운로드 버튼이 한 줄을 차지** — 데스크톱 액션 바 (SchedulePage line 557~572) 가 엑셀 버튼 하나만으로 전체 가로 한 줄 차지 → 비효율적, 헤더로 올려야 함.
2. **일정 추가 버튼이 너무 작음** — scheduleListEl 안 "+ 추가" 버튼 (line 463~470) 이 데스크톱 우측에 작게 표시, 사용자가 "일정 추가" 버튼인지 인지 못 함.
3. **라벨 불명확** — "+ 추가" → "+ 일정 추가" 명시.

## 변경 위치 명시

### App.tsx

**(A-1) isSchedule constant 추가 (line 134~137 근처)**

현재 line 134~137:
```tsx
const isDashboard = location.pathname === '/dashboard'
const isQrScan    = location.pathname === '/inspection/qr'
const isExtinguishers = location.pathname === '/extinguishers'
const isCctv          = location.pathname === '/cctv'
```

추가 (`isExtinguishers` 다음 줄):
```tsx
const isSchedule      = location.pathname === '/schedule'
```

**(A-2) 데스크톱 헤더 portal slot 추가 (line 244~246 다음)**

현재 line 244~246:
```tsx
{isExtinguishers && (
  <div id="extinguishers-header-portal-slot" style={{ display: 'flex', alignItems: 'center' }} />
)}
```

바로 다음 줄에 추가:
```tsx
{isSchedule && (
  <div id="schedule-header-portal-slot" style={{ display: 'flex', alignItems: 'center' }} />
)}
```

### SchedulePage.tsx

**(B-1) createPortal import 추가 (line 1)**

현재 line 1:
```tsx
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
```

바로 다음 줄에 추가:
```tsx
import { createPortal } from 'react-dom'
```

**(B-2) headerSlot state + useEffect 추가 (state 선언 영역 — useState 들이 모인 곳, 데스크톱 분기 위)**

ExtinguishersListPage.tsx line 108~116 패턴 verbatim mirror:
```tsx
// ── GlobalHeader 「엑셀 다운로드」 portal slot ──
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

위치: `isDesktop` 변수 사용 영역 위 — 적절한 useState/useEffect 블록 안. 기존 `useState` 들이 모인 자리(예: line 200~250 사이) 또는 `if (isDesktop)` 데스크톱 분기 직전에 배치 (renderCard 등 useCallback 들 전에).

**(B-3) 데스크톱 액션 바 통째 제거 (line 557~572)**

다음 블록 통째 삭제:
```tsx
{/* 액션 바 — App.tsx 가 이미 페이지 제목 표시. 여기는 액션 버튼만 */}
<div className="flex flex-shrink-0 items-center justify-end gap-2 px-6 py-2.5 border-b border-border-default bg-surface-raised">
  <button
    onClick={handlePlanDownload}
    disabled={planLoading}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-body-sm font-bold ${
      planLoading
        ? 'bg-surface-sunken text-text-tertiary cursor-default'
        : 'bg-safe-bar text-text-on-accent cursor-pointer'
    }`}
  >
    <Download size={13} />
    {planLoading ? '생성 중...' : '엑셀 다운로드'}
  </button>
</div>
```

**(B-4) portal 주입 (데스크톱 분기 시작 직후 — `if (isDesktop) { return (` 다음, 또는 최상위 wrapper `<div className="flex flex-col h-full overflow-hidden bg-surface-page">` 안 첫 줄)**

```tsx
{headerSlot && createPortal(
  <button
    onClick={handlePlanDownload}
    disabled={planLoading}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-body-sm font-bold ${
      planLoading
        ? 'bg-surface-sunken text-text-tertiary cursor-default'
        : 'bg-safe-bar text-text-on-accent cursor-pointer'
    }`}
  >
    <Download size={13} />
    {planLoading ? '생성 중...' : '엑셀 다운로드'}
  </button>,
  headerSlot,
)}
```

**(B-5) scheduleListEl 안 + 추가 버튼 (line 463~470) 확대 + 라벨**

현재 (작음):
```tsx
{isDesktop && (
  <button
    onClick={() => setShowAdd(true)}
    className="px-3 py-1 rounded-sm bg-accent text-text-on-accent text-caption font-bold cursor-pointer leading-none"
  >
    + 추가
  </button>
)}
```

변경 (키우고 + lucide Plus + 일정 추가 라벨):
```tsx
{isDesktop && (
  <button
    onClick={() => setShowAdd(true)}
    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-accent text-text-on-accent text-body-sm font-bold cursor-pointer"
  >
    <Plus size={14} />
    일정 추가
  </button>
)}
```

크기 비교:
- Before: `px-3 py-1` + `text-caption` (12px) — 약 25px height
- After: `px-3.5 py-1.5` + `text-body-sm` (14px) + lucide Plus — 약 32~36px height (mobile chrome 헤더 + 추가 버튼 패턴 mirror)

**`Plus` import 확인**: line 5 `import { ChevronLeft, ChevronRight, Download, Plus, X } from 'lucide-react'` 이미 포함 (SW1 + SW5 에서 추가됨). 추가 import 불필요.

## 변환 매핑 표

| 항목 | Before | After |
|------|--------|-------|
| App.tsx isSchedule constant | (없음) | `const isSchedule = location.pathname === '/schedule'` |
| App.tsx 헤더 portal slot | (없음) | `{isSchedule && (<div id="schedule-header-portal-slot" .../>)}` |
| SchedulePage createPortal import | (없음) | `import { createPortal } from 'react-dom'` |
| SchedulePage headerSlot state | (없음) | useState + useEffect (extinguishers mirror) |
| SchedulePage 데스크톱 액션 바 (line 557~572) | 16 lines | (제거) |
| SchedulePage 데스크톱 portal 주입 | (없음) | `{headerSlot && createPortal(<button.../>, headerSlot)}` |
| scheduleListEl 추가 버튼 (line 463~470) class | `px-3 py-1 ... text-caption ... leading-none` | `flex items-center gap-1.5 px-3.5 py-1.5 ... text-body-sm` |
| scheduleListEl 추가 버튼 children | `+ 추가` | `<Plus size={14} /> 일정 추가` |

## NEGATIVE (변경 금지)

- ❌ `handlePlanDownload` / `setShowAdd(true)` 호출 시그니처
- ❌ 토스트 카피 ('일정 추가됨', '수정됐습니다' 등)
- ❌ 모바일 SchedulePage 레이아웃 (line 597~620 영역 — 모바일 분기)
- ❌ 캘린더 / scheduleListEl 본문 (line 471~525 리스트 영역) / 모달 들 — 모두 무영향
- ❌ planLoading 분기 조건 (3항 연산자 그대로 보존)
- ❌ 모바일 헤더의 + 추가 버튼 (SW3 에서 제거됨, 현재 상태 유지)
- ❌ `+ 일정 추가` 라벨이 빈 상태 fallback 버튼 (line 480~486) 에 이미 있음 — 그건 변경 금지 (별도 영역, NEGATIVE)

## 메모리 룰 5건 inline 인용

1. **`feedback_design_changes_ask_first.md`** — 사용자 명시 요청 (스크린샷 + 텍스트 피드백 3건) 이므로 컨펌 끝, 진행. 추가 sketch 단계 불필요.

2. **`feedback_tailwind_token_class_pattern.md`** — status- prefix 없음. `bg-safe-bar` / `bg-accent` 정확 패턴 유지. `text-fire-bar O / text-status-fire-bar X` 룰 그대로.

3. **`feedback_tailwind_w8_h8_is_48px.md`** — close X 패턴 미수정. 본 fix 는 close X 영역 무영향.

4. **`feedback_text_caption_leading_none.md`** — `text-caption (12px, lh:1.5 → 18px)` 가 작은 컨테이너에서 시각적 패딩 유발 → 새 버튼은 `text-body-sm (14px)` 이므로 leading 명시 불필요. caption 룰 적용 안 됨.

5. **`feedback_planner_prompt_sketch_verbatim.md`** — sketch 별도 없음 (직접 사용자 피드백 기반 변경). 단 ExtinguishersListPage line 108~116 portal 패턴 verbatim mirror + SW1 모바일 헤더 추가 버튼 (line 533 — 현재 제거됨) 패턴과 동일한 크기/스타일.

## 워크트리 룰 (CLAUDE.local.md)

- ❌ wrangler 명령 X
- ❌ `npm run deploy` X
- ✅ 작업 위치: `/Users/jykevin/Documents/cbc7119-design/`
- ✅ 브랜치: 현재 브랜치에서 작업 (origin/main 컷 가정 — Wave 0 task 에서 확인)
- ✅ main 머지 → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions)

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: App.tsx + SchedulePage.tsx 동시 변경 (portal 도입 + 액션 바 제거 + 추가 버튼 확대)</name>
  <files>cha-bio-safety/src/App.tsx, cha-bio-safety/src/pages/SchedulePage.tsx</files>
  <action>
**Step 1: 브랜치 확인 (메모리 룰 feedback_check_branch_before_edit.md)**
```bash
cd /Users/jykevin/Documents/cbc7119-design && git status && git branch --show-current
```
- dirty 면 stash/commit 먼저 (사용자에게 컨펌)
- 브랜치가 `redesign/13-schedule-fix1` 또는 `redesign/13-schedule` 계열이 아니면 사용자 확인

**Step 2: App.tsx 변경**

(2-1) line 137 `const isCctv = location.pathname === '/cctv'` 다음 줄에 추가:
```tsx
const isSchedule      = location.pathname === '/schedule'
```

(2-2) line 246 `)}` 다음 줄에 (즉 `isExtinguishers` 블록 끝나고 `</header>` 전에) 추가:
```tsx
{isSchedule && (
  <div id="schedule-header-portal-slot" style={{ display: 'flex', alignItems: 'center' }} />
)}
```

**Step 3: SchedulePage.tsx 변경**

(3-1) line 1 다음 줄에 import 추가:
```tsx
import { createPortal } from 'react-dom'
```

(3-2) `useState`/`useEffect` 들이 모인 영역 (현재 line 약 200~250 — 다른 state 들 옆) 에 `headerSlot` state + useEffect 블록 삽입. 위치 선택 가이드:
- 기존 다른 `useState<...>` 블록 직후
- `useCallback`/`useMemo`/`useEffect(holidays fetch 등)` 들 위
- `if (isDesktop) { return (` 데스크톱 분기 위쪽이어야 함

블록 (ExtinguishersListPage line 107~116 verbatim mirror, id 만 `schedule-header-portal-slot` 로 변경):
```tsx
// ── GlobalHeader 「엑셀 다운로드」 portal slot ──
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

(3-3) line 557~572 데스크톱 액션 바 (16 lines 통째) 제거:
```
{/* 액션 바 — App.tsx 가 이미 페이지 제목 표시. 여기는 액션 버튼만 */}
<div className="flex flex-shrink-0 items-center justify-end gap-2 px-6 py-2.5 border-b border-border-default bg-surface-raised">
  <button
    onClick={handlePlanDownload}
    ...
  </button>
</div>
```

(3-4) (3-3) 자리에 (즉 `if (isDesktop) { return (<div ...>` 안 첫 번째 자식 위치) portal 주입 블록 삽입:
```tsx
{headerSlot && createPortal(
  <button
    onClick={handlePlanDownload}
    disabled={planLoading}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-body-sm font-bold ${
      planLoading
        ? 'bg-surface-sunken text-text-tertiary cursor-default'
        : 'bg-safe-bar text-text-on-accent cursor-pointer'
    }`}
  >
    <Download size={13} />
    {planLoading ? '생성 중...' : '엑셀 다운로드'}
  </button>,
  headerSlot,
)}
```

(3-5) line 463~470 scheduleListEl 안 추가 버튼 변경:

Before:
```tsx
{isDesktop && (
  <button
    onClick={() => setShowAdd(true)}
    className="px-3 py-1 rounded-sm bg-accent text-text-on-accent text-caption font-bold cursor-pointer leading-none"
  >
    + 추가
  </button>
)}
```

After:
```tsx
{isDesktop && (
  <button
    onClick={() => setShowAdd(true)}
    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-accent text-text-on-accent text-body-sm font-bold cursor-pointer"
  >
    <Plus size={14} />
    일정 추가
  </button>
)}
```

(`leading-none` 제거됨 — text-body-sm 14px 는 caption 룰 적용 안 됨, 메모리 룰 4번)

**Step 4: 빌드 검증**
```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npx tsc --noEmit
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npm run build
```
둘 다 exit 0 확인.

**Step 5: Verify gate grep**
```bash
# App.tsx — schedule-header-portal-slot 존재
grep -c "schedule-header-portal-slot" /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/App.tsx
# Expected: 1

# App.tsx — isSchedule constant 존재
grep -c "const isSchedule" /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/App.tsx
# Expected: 1

# SchedulePage — createPortal import + usage
grep -c "createPortal" /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/SchedulePage.tsx
# Expected: ≥2 (import + usage)

# SchedulePage — react-dom import
grep -c "from 'react-dom'" /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/SchedulePage.tsx
# Expected: 1

# SchedulePage — schedule-header-portal-slot id 사용
grep -c "schedule-header-portal-slot" /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/SchedulePage.tsx
# Expected: 1

# SchedulePage — headerSlot state
grep -c "setHeaderSlot" /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/SchedulePage.tsx
# Expected: ≥2 (useState + setHeaderSlot calls)

# SchedulePage — 데스크톱 액션 바 제거 확인 (이전 클래스 정확 매치 0 hits)
grep -c 'flex flex-shrink-0 items-center justify-end gap-2 px-6 py-2.5 border-b border-border-default bg-surface-raised' /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/SchedulePage.tsx
# Expected: 0

# SchedulePage — '+ 추가' 라벨 제거 확인 (scheduleListEl 안 데스크톱 버튼 한정)
grep -v '^[[:space:]]*//' /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/SchedulePage.tsx | grep -c '+ 추가'
# Expected: 0 (모바일 헤더의 + 추가 버튼은 SW3 에서 이미 제거됨)

# SchedulePage — '일정 추가' 라벨 존재 (scheduleListEl 안 + 빈 상태 fallback button)
grep -c '일정 추가' /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/SchedulePage.tsx
# Expected: ≥2 (빈 상태 fallback '+ 일정 추가' line 485 + scheduleListEl 헤더 안 새 버튼)
```

**Step 6: 커밋**
```bash
cd /Users/jykevin/Documents/cbc7119-design && git add cha-bio-safety/src/App.tsx cha-bio-safety/src/pages/SchedulePage.tsx && git commit -m "fix(13-schedule): 데스크톱 엑셀 다운로드 헤더 portal 이동 + 일정 추가 버튼 키우기"
```

**Step 7: 워크트리 룰 — 배포는 어떻게?**
- ❌ wrangler 명령 절대 X (CLAUDE.local.md)
- ❌ `npm run deploy` 절대 X
- ✅ 사용자에게 main 머지 컨펌 요청 → main push → GitHub Actions 자동 cbc7119-preview 배포

본 task 는 **brach 작업까지만** 수행, main 머지/push 는 사용자 컨펌 후 별도 단계.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npx tsc --noEmit && npm run build && grep -c "schedule-header-portal-slot" src/App.tsx && grep -c "createPortal" src/pages/SchedulePage.tsx</automated>
  </verify>
  <done>
- App.tsx 에 `isSchedule` constant + `schedule-header-portal-slot` div 추가됨
- SchedulePage.tsx 에 createPortal import + headerSlot state + useEffect + portal 주입 + 데스크톱 액션 바 제거 + scheduleListEl 안 + 일정 추가 버튼 확대 완료
- tsc --noEmit exit 0
- npm run build exit 0
- 모든 grep gate 통과 (위 Step 5)
- 커밋 1건 완료 (`fix(13-schedule): 데스크톱 엑셀 다운로드 헤더 portal 이동 + 일정 추가 버튼 키우기`)
- 모바일 SchedulePage 영역 / 호출 시그니처 / 토스트 카피 변경 없음
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
- 데스크톱 헤더 우측에 "엑셀 다운로드" 버튼 portal 이동 (App.tsx 헤더 영역)
- 데스크톱 액션 바 (한 줄 차지) 제거 — 화면 공간 확보
- scheduleListEl 안 데스크톱 "+ 일정 추가" 버튼 확대 (text-body-sm 14px + lucide Plus + "일정 추가" 라벨)
- 모바일 레이아웃 / 호출 시그니처 / 토스트 / 캘린더 / 모달 모두 무영향
- 브랜치 변경만 완료, main 머지/배포는 아직 X
  </what-built>
  <how-to-verify>
**로컬 데스크톱 검증:**
1. `cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npm run dev` 실행
2. 브라우저 데스크톱 (>= 1024px wide) 으로 http://localhost:5173/schedule 접속
3. 확인 사항:
   - [ ] 데스크톱 글로벌 헤더 (line 226~248 의 54px 헤더) 우측에 "엑셀 다운로드" 버튼 표시
   - [ ] 페이지 본문 위쪽에 액션 바 (한 줄) 없음 — MonthlyPlanPreview 가 바로 위쪽 영역에 자리
   - [ ] scheduleListEl (우측 일정 패널) 안 "오늘 일정 N건" 옆 우측에 lucide Plus 아이콘 + "일정 추가" 라벨 버튼 표시
   - [ ] 새 "일정 추가" 버튼이 이전 "+ 추가" 보다 명확히 크고 인지하기 쉬움 (text-body-sm 14px)
4. 모바일 (< 1024px) 로 viewport 줄여서 재확인:
   - [ ] 모바일 SchedulePage 레이아웃 변경 없음 (캘린더 / 일정 리스트 / 추가 모달 그대로)
   - [ ] 모바일 헤더에 "+ 추가" / "+ 일정 추가" 버튼 표시 안 됨 (SW3 에서 이미 제거됨, 본 fix 무영향)

**main 머지 컨펌:**
- 로컬 확인 후 사용자 OK 시 → main 머지 → push → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions)
- ❌ wrangler 명령 X / `npm run deploy` X (워크트리 룰)
  </how-to-verify>
  <resume-signal>"approved" 입력 시 main 머지 진행 / 이슈 있으면 구체 설명</resume-signal>
</task>

</tasks>

<verification>
- App.tsx: `isSchedule` constant + `schedule-header-portal-slot` div 추가 (grep 검증)
- SchedulePage.tsx: createPortal import + headerSlot state + portal 주입 + 액션 바 제거 + + 일정 추가 버튼 확대 (grep 검증)
- tsc --noEmit / npm run build 둘 다 exit 0
- 데스크톱 헤더 우측 엑셀 다운로드 버튼 표시 (사용자 시각 검증)
- 데스크톱 + 일정 추가 버튼 크기 + 라벨 (사용자 시각 검증)
- 모바일 무영향 (사용자 시각 검증)
</verification>

<success_criteria>
- 데스크톱 액션 바 16 lines 제거 + headerSlot portal 코드 추가 → SchedulePage line 수 net 변화 ≈ +4
- App.tsx line 수 변화: +5 (isSchedule + portal slot)
- 사용자 피드백 3건 (엑셀 한 줄 차지 / 일정 추가 버튼 작음 / 라벨 불명확) 모두 해소
- 메모리 룰 5건 위반 0건
- 워크트리 룰 (wrangler X / npm run deploy X) 준수
</success_criteria>

<output>
After completion, create `.planning/quick/260520-chr-redesign-13-schedule-fix-portal/260520-chr-SUMMARY.md`
</output>

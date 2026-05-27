---
phase: 260527-wdc-legalpage-phase-b-inline-style-141-tailw
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html
  - src/pages/LegalPage.tsx
autonomous: false
requirements:
  - QUICK-260527-wdc-INLINE-STYLE-TO-TAILWIND
---

<objective>
LegalPage.tsx (1250 줄, submission-ppt 트랙 완결 + Phase A emoji/색토큰 sweep + audit-tier1/tier2 followup 완료 페이지) 의
**Phase B — inline style 141 곳 → tailwind class 일괄 변환 (no-op refactor)**.

Purpose:
- Phase A 가 §7.1 (emoji 0) + §2.3 (색 토큰 정리) 를 끝냈으니, 잔존 inline style 141 곳을
  tailwind className 으로 변환해 페이지 전체를 utility-first 로 통일.
- **시각 결과 0 byte 변화** — pixel-perfect no-op refactor. 비즈니스 로직 / state / API 호출 0 byte.
- 향후 디자인 토큰 변경 시 일관 적용 가능 (inline style 은 토큰 회피).
- redesign workflow 준수: 시안 HTML 먼저 → 사용자 컨펌 → bulk apply.

Output:
1. `.planning/quick/260527-wdc-.../sketch/legalpage-phase-b-tailwind.html`
   — 4-6 패턴 그룹화 + 옵션 분기 (rounding / arbitrary vs round-up / dynamic 처리) 시안
2. `src/pages/LegalPage.tsx`
   — static inline style 0 (또는 동적 잔존만), tailwind className 변환 완료
3. 비즈니스 로직 / Lucide import (Phase A 결과) / Phase A 색 토큰 결과 모두 보존
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@../../CLAUDE.local.md
@.planning/STATE.md
@src/styles/tokens.css
@tailwind.config.js
@src/pages/LegalPage.tsx
@.planning/quick/260527-tb3-legalpage-sweep-emoji-8-lucide-4/260527-tb3-PLAN.md
@.planning/quick/260527-tb3-legalpage-sweep-emoji-8-lucide-4/260527-tb3-SUMMARY.md

<phase_a_result>
Phase A (260527-tb3) 완결 결과 — Phase B 가 보존해야 할 상태:

- L5 import: `import { ChevronLeft, Camera, Loader2, Check, X, Lock, Save } from 'lucide-react'` (7 icons)
- Phase A 가 emoji 8곳을 `<Check size={N} />` / `<X size={N} />` / `<Lock size={N} />` / `<Save size={N} />` 로 변환 완료
- Phase A 가 §2.3 색 토큰 정리 (bg-warning → bg-warning-bg, border-safe → border-safe-bar 등) 완료
- audit-tier1/tier2 followup 이 border-{status} → border-{status}-bar 일관성 + 결과내역서 X 삭제 버튼 색 정리 완료

Phase B 변경 금지:
- L5 lucide-react import 줄
- 모든 `<Check>`, `<X>`, `<Lock>`, `<Save>` JSX
- Phase A 가 정리한 색 토큰 className (변경하지 말 것, 그대로 보존)
- `onClick`, `onChange`, `useMutation`, `useQuery`, `useState`, `useRef`, `useEffect`, `useNavigate`,
  `useParams`, `legalApi.*`, `inspectionApi.*`, `fetch(` 호출 — 0 byte 변경
- 함수 시그니처 / 컴포넌트 props / state shape — 0 byte 변경
</phase_a_result>

<interfaces>
<!-- tailwind.config.js spacing scale (실제 정의 — 기본 tailwind 와 다름!) -->

From tailwind.config.js extend.spacing:
- w-1/h-1/p-1/m-1/gap-1 = 4px
- w-2/h-2/p-2/m-2/gap-2 = 8px
- w-3/h-3/p-3/m-3/gap-3 = 12px
- w-4/h-4/p-4/m-4/gap-4 = 16px
- w-5/h-5/p-5/m-5/gap-5 = 20px
- w-6/h-6/p-6/m-6/gap-6 = 24px
- w-7/h-7/p-7/m-7/gap-7 = **32px**  ← 기본 tailwind 의 28px 아님
- w-8/h-8/p-8/m-8/gap-8 = **48px**  ← 기본 tailwind 의 32px 아님

⚠️ 메모리 anchor: `feedback_tailwind_w8_h8_is_48px.md` (11-div TSX v3 hotfix 사고 박제)

스케일 외 값 (28px / 36px / 18px / 44px 등) 은 반드시 arbitrary 값 사용:
- `w-[28px]` `h-[28px]` `text-[18px]` `h-[44px]` `top-[-5px]` 등

<!-- 자주 등장하는 inline style 패턴 (orchestrator 가 grep 으로 추출한 실제 샘플) -->

Pattern 1 — padding 상수:
- L74: `style={{ padding: '2px 8px', flexShrink: 0 }}` → `px-2 py-[2px] shrink-0`
- L158: `style={{ padding: '16px 16px 12px', flexShrink: 0 }}` → `px-4 pt-4 pb-3 shrink-0`
- L971: `style={{ padding: '6px 12px' }}` → `px-3 py-[6px]`
- L675: `style={{ padding: '6px 16px', textAlign: 'center', flexShrink: 0 }}` → `px-4 py-[6px] text-center shrink-0`

Pattern 2 — flex layout:
- L105: `style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}` → `flex gap-3 items-start`
- L156: `style={{ display: 'flex', flexDirection: 'column', height: '100%' }}` → `flex flex-col h-full`
- L164: `style={{ display: 'flex', flexShrink: 0 }}` → `flex shrink-0`
- L587: `style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}` → `flex items-end gap-[10px]`

Pattern 3 — sizing (스케일 외 값):
- L106: `style={{ width: 64, flexShrink: 0 }}` → `w-16 shrink-0` (기본 tailwind w-16=64px ✓)
- L379: `style={{ width: 28, height: 28, fontSize: 18, lineHeight: 1, cursor: ... }}` →
       `w-[28px] h-[28px] text-[18px] leading-none` (28/18 = 스케일 외)
- L659: `style={{ width: 36, height: 36, borderRadius: 6, fontSize: 16, cursor: ... }}` →
       `w-[36px] h-[36px] rounded-md text-[16px]` (36 = 스케일 외)
- L811: `style={{ width: 64, height: 64, objectFit: 'cover' }}` → `w-16 h-16 object-cover`

Pattern 4 — flex-1 / overflow:
- L107: `style={{ flex: 1, lineHeight: 1.5 }}` → `flex-1 leading-[1.5]`
       (or merge with existing `text-label` since text-label 정의가 lineHeight 1.5 이므로 leading-[1.5] 생략 가능)
- L202: `style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}`
       → `flex-1 overflow-y-auto px-4 pt-3 pb-4 flex flex-col gap-[6px]` (gap 6 = 스케일 외)

Pattern 5 — button reset:
- L222: `style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px' }}`
       → `bg-transparent border-0 cursor-pointer px-[3px] py-[1px]`
- L967: `style={{ flex: 1, height: 38, border: 'none', background: tab === t.key ? undefined : 'transparent', cursor: 'pointer', borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent' }}`
       → `flex-1 h-[38px] border-0 cursor-pointer border-b-2 ${tab === t.key ? 'border-accent' : 'border-transparent bg-transparent'}`
       (동적 분기 — className conditional 로 변환)

Pattern 6 — dynamic inline (state/props/computed):
- L355: `style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, opacity: cardDisabled && !isSelected ? 0.7 : 1 }}`
       → 정적 부분만 className 변환, 동적 opacity 는 className conditional 또는 style 잔존:
         className: `p-3 flex flex-col gap-2 ${cardDisabled && !isSelected ? 'opacity-70' : ''}`
- L597: `style={{ height: 32, padding: '0 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: count === 0 || isLocked || genState === 'saving' ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}`
       → `h-7 px-[14px] rounded-md text-caption font-bold inline-flex items-center gap-[6px] ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`
- L618: `style={{ aspectRatio: '297/210', background: '#fff', color: '#000', borderRadius: 8, padding: 24, ... boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}`
       → `aspect-[297/210] bg-white text-black rounded-sm p-6 flex flex-col justify-center items-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.4)]`
       (aspect 비율 + shadow 는 arbitrary 로)

<!-- 동적 (state-dependent) inline style — 잔존 OK 또는 className conditional 분기 -->

다음은 **inline style 잔존 OK** (동적 값이 1개라도 있으면):
- L412~424: `<span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: 4 }} />`
  ← 정적이지만 4번 반복. className 변환 가능: `inline-block w-[6px] h-[6px] rounded-full bg-current mr-1`
- L805~806: `style={{ display: 'none' }}` ← `hidden` className 으로 변환 가능
- L1066/L1101/L1118: 동적 `cursor: canUpload ? 'pointer' : 'not-allowed'` + `background: canUpload ? undefined : 'transparent'`
  ← className conditional 로 변환

<!-- tokens.css 색상 사용 (Phase A 결과 보존) -->

Phase A 가 정리한 색 토큰 (Phase B 변경 X):
- `bg-warning-bg`, `text-warning`, `bg-safe-bg`, `text-safe`, `bg-danger-bg`, `text-danger`
- `border-safe-bar`, `border-warning-bar`, `border-danger-bar`
- `text-fire-bar` (status pill)

⚠️ 메모리 anchor: `feedback_tailwind_token_class_pattern.md`
- `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음)
</interfaces>

<design_rules>
**1. Spacing 변환 결정 (Pattern 1/2/3 — Task 1 sketch 에서 옵션 분기):**

- 옵션 X (정확값 우선): 스케일 외 값은 무조건 arbitrary `[28px]` 유지 — 시각 0 byte 보장
- 옵션 Y (스케일 라운드): 28px → w-7 (32px) 같이 가까운 스케일로 라운드 — 시각 미세 변경 허용 (사용자 결정)
- **권장 = 옵션 X** (시각 0 byte = no-op refactor 원칙)

**2. lineHeight 처리 (Pattern 4):**

- text-* 토큰 (text-caption / text-label / text-body-sm / text-body / text-title 등) 이 이미 lineHeight 정의 보유
- 옵션 P (보존): `leading-[1.5]` arbitrary 명시 — text-* 없는 경우 또는 명시적으로 다른 경우
- 옵션 Q (간소화): text-* 토큰이 이미 같은 lineHeight 면 leading 생략
- **권장 = 옵션 P** (중복이라도 명시 보존 — 의도 명확화)

**3. Dynamic inline style 처리 (Pattern 6):**

- 옵션 M (className conditional 분기): `${condition ? 'class-A' : 'class-B'}` 패턴으로 변환
- 옵션 N (잔존 OK): 정적 부분만 className 변환, 동적 부분은 style 잔존
- **권장 = 옵션 M** (가능한 경우) — 100% inline style 제거 목표
- 단, 색 변수 (`background: cardBg` where cardBg from state/props) 처럼 tailwind 로 깔끔하게 표현 불가한 경우는 옵션 N (잔존)

**4. cursor 처리:**

- `cursor: 'pointer'` 정적 → `cursor-pointer`
- `cursor: 'not-allowed'` 정적 → `cursor-not-allowed`
- 동적 (`cursor: X ? 'pointer' : 'not-allowed'`) → conditional className

**5. Phase A 결과 보존 — 절대 변경 금지:**

- L5 lucide import 줄
- 모든 `<Check>`, `<X>`, `<Lock>`, `<Save>` JSX 및 그 props
- Phase A 가 정리한 색 토큰 className (`bg-warning-bg`, `border-safe-bar` 등)
- audit-tier1/tier2 followup 결과 (`border-danger-bar`, `bg-danger-bar`, etc.)

**6. 비즈니스 로직 절대 변경 금지 (변환 grep 검증):**

- `onClick`, `onChange`, `onSubmit`, `onKeyDown` 핸들러 본체 0 byte
- `useMutation`, `useQuery`, `useState`, `useRef`, `useEffect`, `useNavigate`, `useParams` 호출 0 byte
- `legalApi.*`, `inspectionApi.*`, `fetch(` 호출 0 byte
- 함수 시그니처 / props 타입 / state shape 0 byte
</design_rules>
</context>

<tasks>

<task type="auto">
  <name>Task 1: LegalPage Phase B inline style → tailwind 시안 HTML 작성 (15~20 LOC 샘플 + 6 패턴 그룹 + 3 옵션 분기)</name>
  <files>.planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html</files>
  <action>
Standalone HTML 시안 작성. 외부 의존 0 (CSS/JS/이미지/font 모두 inline). 다크 surface 토큰 hex 직접 사용.

**구조 (위에서 아래로):**

1. **헤더 영역**
   - 제목: "LegalPage Phase B — inline style 141 곳 → tailwind class 변환 (no-op refactor)"
   - 부제: "Phase A 완결 (emoji + 색 토큰) 후 잔존 inline style 일괄 변환"
   - 한 줄 설명: "시각 결과 0 byte 변화. 비즈니스 로직 / Lucide import / Phase A 색 토큰 결과 모두 보존."
   - **금지:** "approved" / "거의 일치" / "완성" 자신감 표현 (메모리 `feedback_avoid_premature_confirmation.md`)

2. **§1 Overview**
   - LegalPage.tsx 1250줄 / static + dynamic 합쳐 141곳 `style={{}}` 발견
   - Phase B 목표: 정적 inline style 0 + 동적 inline style 은 className conditional 분기 우선 / 색 변수 잔존 허용
   - **시각 결과 변화 0 = 최우선 룰**

3. **§2 패턴 분류 표 (6 그룹)**
   각 그룹마다 Old (inline style) / New (tailwind className) Before/After 박스를 좌우 배치.
   각 그룹마다 실제 LegalPage.tsx 의 line 번호 + raw code snippet 3-4 개 (총 15~20 LOC).

   - **§2-P1 — Padding 상수 (px-N / py-N / arbitrary)**
     - L74: `style={{ padding: '2px 8px', flexShrink: 0 }}` → `px-2 py-[2px] shrink-0`
     - L158: `style={{ padding: '16px 16px 12px', flexShrink: 0 }}` → `px-4 pt-4 pb-3 shrink-0`
     - L675: `style={{ padding: '6px 16px', textAlign: 'center', flexShrink: 0 }}` → `px-4 py-[6px] text-center shrink-0`
     - L971: `style={{ padding: '6px 12px' }}` → `px-3 py-[6px]`
     - 시각 비교: 박스 padding 2/6/12/16 모두 동일 픽셀 결과 확인용 시안

   - **§2-P2 — Flex layout (flex / gap / items / direction)**
     - L105: `style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}` → `flex gap-3 items-start`
     - L156: `style={{ display: 'flex', flexDirection: 'column', height: '100%' }}` → `flex flex-col h-full`
     - L165 (or nearby): `style={{ display: 'flex', flexShrink: 0 }}` → `flex shrink-0`
     - L587: `style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}` → `flex items-end gap-[10px]`
     - 시각 비교: gap 10 (arbitrary) vs gap 12 (g-3) 픽셀 검증

   - **§2-P3 — Sizing (스케일 vs arbitrary) — 옵션 X/Y 결정 here**
     - L106: `style={{ width: 64, flexShrink: 0 }}` → `w-16 shrink-0` (default tailwind w-16=64px ✓)
     - L379: `style={{ width: 28, height: 28, fontSize: 18, lineHeight: 1 }}` →
       - **옵션 X (정확값)**: `w-[28px] h-[28px] text-[18px] leading-none` — 시각 0 byte
       - **옵션 Y (스케일 라운드)**: `w-7 h-7 text-lg leading-none` — w-7=32px 라 +4px 미세 변경
     - L659: `style={{ width: 36, height: 36, borderRadius: 6, fontSize: 16 }}` →
       - **옵션 X**: `w-[36px] h-[36px] rounded-md text-[16px]` — 0 byte
       - **옵션 Y**: 라운드 불가 (36 ↔ 32/48 모두 큰 차이) → 옵션 X 강제
     - L811: `style={{ width: 64, height: 64, objectFit: 'cover' }}` → `w-16 h-16 object-cover` (둘 다 OK)
     - **사용자 결정 요청 명시**: "옵션 X (정확값 = 시각 0 byte) 또는 옵션 Y (스케일 라운드 = 미세 변경 허용) 선택 부탁드립니다."
     - **권장 = 옵션 X** (no-op refactor 원칙)

   - **§2-P4 — flex-1 / overflow / leading — 옵션 P/Q 결정 here**
     - L107: `style={{ flex: 1, lineHeight: 1.5 }}` (text-label 인접) →
       - **옵션 P (명시 보존)**: `flex-1 leading-[1.5]` — 의도 명확
       - **옵션 Q (간소화)**: `flex-1` 만 (text-label 의 lineHeight 1.5 가 이미 적용됨)
     - L202: `style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}`
       → `flex-1 overflow-y-auto px-4 pt-3 pb-4 flex flex-col gap-[6px]` (gap-1.5=6 는 정의 안 됨 → arbitrary)
     - 시각 비교: leading 보존 vs 생략 픽셀 동일 (text-* 토큰이 같은 lineHeight 면 시각 동일)
     - **권장 = 옵션 P** (명시 보존, 의도 추적 용이)

   - **§2-P5 — Button reset (background:none / border:none)**
     - L222: `style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px' }}` →
       `bg-transparent border-0 cursor-pointer px-[3px] py-[1px]`
     - L984: `<button ... style={{ display: 'block', margin: '8px auto', border: 'none', padding: '6px 16px', cursor: 'pointer' }}>` →
       `block mx-auto my-2 border-0 px-4 py-[6px] cursor-pointer`
     - 시각 비교: 텍스트 버튼 / inline 액션 버튼 픽셀 동일

   - **§2-P6 — Dynamic (state/props 기반) — 옵션 M/N 결정 here**
     - L355: `style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, opacity: cardDisabled && !isSelected ? 0.7 : 1 }}`
       → **옵션 M (className conditional)**:
         `className={`p-3 flex flex-col gap-2 ${cardDisabled && !isSelected ? 'opacity-70' : ''}`}`
       → **옵션 N (잔존)**: 정적 부분만 className, opacity 만 style 잔존
     - L597: `style={{ height: 32, padding: '0 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: count === 0 || isLocked || genState === 'saving' ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}`
       → **옵션 M**: 모두 className conditional 로 분해
     - L1066: `style={{ width: '100%', height: 32, cursor: 'pointer' }}` (정적) → `w-full h-7 cursor-pointer`
       (이건 정적 dynamic 이 아니라 그냥 정적 = Pattern 3 처럼 변환 가능)
     - L967: tab active border conditional —
       **옵션 M**: `flex-1 h-[38px] border-0 cursor-pointer border-b-2 ${tab === t.key ? 'border-accent' : 'border-transparent bg-transparent'}`
     - **사용자 결정 요청**: "옵션 M (className conditional 으로 동적 분리 — 100% inline style 제거 목표) 또는 옵션 N (정적만 변환, 동적 inline 잔존)?"
     - **권장 = 옵션 M** (가능한 모든 경우, 색 변수 잔존 케이스만 옵션 N)

4. **§3 옵션 분기 요약 표**
   - 표 헤더: 옵션 ID | 영향 패턴 | 권장 | 시각 변화 | 비즈니스 로직
   - 옵션 X (정확값) — P3 — 권장 — 0 byte — 0
   - 옵션 Y (스케일 라운드) — P3 — 비권장 — 미세 변경 — 0
   - 옵션 P (lineHeight 명시) — P4 — 권장 — 0 byte — 0
   - 옵션 Q (lineHeight 간소화) — P4 — 허용 — 0 byte (text-* 토큰 동일 lh 일 때) — 0
   - 옵션 M (className conditional) — P6 — 권장 — 0 byte — 0
   - 옵션 N (잔존) — P6 — 허용 (색 변수만) — 0 byte — 0

5. **§4 사용자 결정 요청 (Task 2 checkpoint 안내)**
   - "(a) 패턴 분류 + 변환 매핑 OK?"
   - "(b) 옵션 X 또는 Y (sizing)?"
   - "(c) 옵션 P 또는 Q (lineHeight)?"
   - "(d) 옵션 M 또는 N (dynamic style)?"
   - "(e) 141 곳 중 동적 색 변수 잔존 허용 케이스 (예: `background: cardBg`, `borderBottom: tab === ...`) 의 처리 방향 확인?"

6. **§5 미리보기 — Old/New 박스 동시 렌더**
   - 작은 박스 5개를 grid 로 배치, 같은 padding/gap 의 inline style 박스 vs tailwind className 박스
   - 시각 동일 확인용 (브라우저에서 사용자 즉시 검증 가능)

7. **푸터**
   - "Task 2 checkpoint 에서 결정사항 a~e 확정 후 Task 3 bulk apply 진행."
   - "Phase A 결과 (Lucide / 색 토큰 / audit-tier1/tier2) 절대 보존."

**Spacing/Layout (시안 자체):**
- max-width: 1200px center
- 각 §2-Px section: padding 24px / border-radius 12px / background #1a1f27 (surface-raised 의 hex)
- Old/New 좌우 분할: grid-template-columns 1fr 1fr / gap 16px
- 캡션은 #8b949e (text-tertiary hex), font-size 12px
- code 박스: background #0f1419 (surface-sunken) / padding 12px / border-radius 8px / font-family monospace / color #e6edf3

**금지:**
- 외부 CSS/JS/이미지/font (모두 inline 또는 system font / monospace fallback)
- "approved" / "완성" / "거의 일치" 헤더
- LegalPage.tsx 자체 수정 (이 task 는 시안 작성만)
- 141 곳 전부 나열 (15~20 LOC 샘플만 = 6 패턴 그룹 대표 사례 충분)
  </action>
  <verify>
    <automated>test -f .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html && [ "$(grep -cE '§2-P1|§2-P2|§2-P3|§2-P4|§2-P5|§2-P6' .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html)" -ge "6" ] && grep -q '옵션 X' .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html && grep -q '옵션 Y' .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html && grep -q '옵션 M' .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html && grep -q '옵션 N' .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html && grep -q 'opacity-70' .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html && [ "$(grep -cE 'approved|거의 일치|완성' .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html)" = "0" ]</automated>
  </verify>
  <done>
    - sketch/legalpage-phase-b-tailwind.html 파일 존재
    - 6 패턴 (§2-P1 ~ §2-P6) 모두 Old/New 비교 박스 + 실제 LegalPage.tsx 라인 번호 + 코드 snippet 포함
    - 15~20 LOC 샘플 (4 패턴 × 3~4 사례 = 약 18 LOC) 명시
    - 옵션 X/Y (sizing), 옵션 P/Q (lineHeight), 옵션 M/N (dynamic) 모두 분기 명시
    - §3 옵션 분기 요약 표
    - §4 사용자 결정 요청 a~e
    - §5 시각 동일 미리보기 박스
    - 외부 의존 0 (HTML 단일 파일)
    - "approved" / "완성" / "거의 일치" 자신감 표현 0
    - LegalPage.tsx 변경 0 (이 task 는 시안 작성만)
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: 시안 컨펌 + 옵션 결정 (a/b/c/d/e)</name>
  <what-built>
Task 1 이 생성한 sketch HTML:
- 6 패턴 (padding / flex layout / sizing / flex-1+leading / button reset / dynamic) 변환 매핑
- 옵션 X/Y (sizing arbitrary vs round)
- 옵션 P/Q (lineHeight 명시 vs 간소화)
- 옵션 M/N (dynamic className conditional vs 잔존)
- 18 LOC 실제 LegalPage.tsx 샘플
  </what-built>
  <how-to-verify>
1. 브라우저로 sketch HTML 열기:
   `open .planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/sketch/legalpage-phase-b-tailwind.html`

2. **§2-P1 ~ §2-P6 6 패턴** 각각 Old/New Before/After 박스 확인:
   - inline style → tailwind className 변환 매핑이 직관적인지
   - 픽셀 결과가 동일한지 (특히 §2-P3 의 28px / 36px 같은 스케일 외 값)
   - 코드 snippet 의 라인 번호가 LegalPage.tsx 실제 위치와 매치되는지

3. **옵션 X vs Y (§2-P3 sizing)** 결정:
   - 옵션 X (정확값 `[28px]`): 시각 0 byte = 진정한 no-op refactor
   - 옵션 Y (스케일 라운드 `w-7`): 28→32px 미세 변경 허용 = 스케일 일관성
   - **권장 = 옵션 X**

4. **옵션 P vs Q (§2-P4 lineHeight)** 결정:
   - 옵션 P (`leading-[1.5]` 명시): 의도 추적 용이
   - 옵션 Q (생략): text-* 토큰이 같은 lineHeight 면 시각 동일
   - **권장 = 옵션 P**

5. **옵션 M vs N (§2-P6 dynamic)** 결정:
   - 옵션 M (className conditional): 100% inline style 제거 목표
   - 옵션 N (정적만 변환, 동적 잔존): 색 변수 / undefined 분기 케이스 처리 용이
   - **권장 = 옵션 M (가능한 모든 경우) + 옵션 N (색 변수만)**

6. **§5 시각 미리보기 박스**:
   - 같은 padding/gap 의 inline vs tailwind 박스가 픽셀 단위 동일한지 직접 비교

7. **응답 예시**:
   - "approved. 옵션 X + P + M (색 변수만 N)"
   - "options revise: 옵션 Y 로, P 유지, M 으로"
   - "sketch fix: §2-P6 dynamic 케이스 예시 더 보여줘"
  </how-to-verify>
  <resume-signal>"approved. 옵션 [X|Y] + [P|Q] + [M|N]" 또는 수정 요청 메시지</resume-signal>
  <done>
    사용자가 (a) 패턴 매핑 OK, (b) sizing 옵션 X/Y, (c) lineHeight 옵션 P/Q,
    (d) dynamic 옵션 M/N, (e) 색 변수 잔존 처리 모두 확정.
    Task 3 는 이 결정대로 bulk apply.
  </done>
</task>

<task type="auto">
  <name>Task 3: LegalPage.tsx bulk apply — inline style 141 곳 → tailwind className 일괄 변환 + verify</name>
  <files>src/pages/LegalPage.tsx</files>
  <action>
사용자가 Task 2 에서 결정한 옵션 (X/Y, P/Q, M/N) 에 따라 LegalPage.tsx 의 모든 정적 inline style 을 tailwind className 으로 변환.

**작업 순서:**

1. **Before snapshot**:
   ```bash
   cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
   BEFORE_STYLE=$(grep -c 'style={{' src/pages/LegalPage.tsx)  # 141
   BEFORE_BIZ=$(git diff HEAD -- src/pages/LegalPage.tsx | grep -cE 'onClick|onChange|useMutation|useQuery|useState|useRef|useEffect|useNavigate|legalApi|inspectionApi|fetch\(')  # 0
   echo "Before: style=$BEFORE_STYLE biz_diff=$BEFORE_BIZ"
   ```

2. **변환 진행 — Pattern 별 일괄 처리**:

   각 inline style 을 사용자 옵션에 따라 변환. 한 occurrence 씩 손으로 패치 (sed 일괄 변환 금지 — 동적 분기 처리 안 됨).

   - **§2-P1 Padding 상수** → `px-N py-N` 또는 `px-[Npx] py-[Npx]`
   - **§2-P2 Flex layout** → `flex gap-N items-X flex-col h-full` 등
   - **§2-P3 Sizing**:
     - 옵션 X: 스케일 외 값은 모두 `[Npx]` arbitrary
     - 옵션 Y: 스케일 가까운 값으로 라운드 (사용자 선택 시)
   - **§2-P4 flex-1 + leading**:
     - 옵션 P: `leading-[1.5]` 명시 보존
     - 옵션 Q: text-* 토큰과 lineHeight 같으면 생략
   - **§2-P5 Button reset** → `bg-transparent border-0 cursor-pointer`
   - **§2-P6 Dynamic**:
     - 옵션 M: `${condition ? 'class-A' : 'class-B'}` template literal 분기
     - 옵션 N: 정적 부분만 className, 동적 부분은 style 잔존 (색 변수 케이스)

3. **className 합병 룰**:
   - 기존 className 이 있으면 같은 attribute 안에 추가 (`className="기존 추가"`)
   - 기존 className 없으면 새로 생성 (`className="변환결과"`)
   - 동적 className 은 template literal: `className={`정적 ${condition ? 'A' : 'B'}`}`

4. **절대 변경 금지 (Phase A 결과 + 비즈니스 로직)**:
   - L5 `import { ChevronLeft, Camera, Loader2, Check, X, Lock, Save } from 'lucide-react'` — 0 byte
   - 모든 `<Check ... />`, `<X ... />`, `<Lock ... />`, `<Save ... />` JSX 및 props — 0 byte
   - Phase A 가 정리한 색 토큰 className (`bg-warning-bg`, `text-warning`, `border-safe-bar`, `border-warning-bar`,
     `bg-danger-bar`, `border-danger-bar` 등) — 0 byte
   - `onClick`, `onChange`, `onSubmit`, `onKeyDown` 핸들러 본체 — 0 byte
   - `useMutation`, `useQuery`, `useState`, `useRef`, `useEffect`, `useNavigate`, `useParams` 호출 — 0 byte
   - `legalApi.*`, `inspectionApi.*`, `fetch(` 호출 — 0 byte
   - 함수 시그니처 / props 타입 / state shape — 0 byte
   - JSX element 추가/삭제 — 0 byte (only className/style attribute 만 수정)
   - 다른 파일 (LegalFindingsPage / LegalFindingDetailPage / 다른 페이지) — 0 byte

5. **메모리 anchor 준수**:
   - `feedback_tailwind_w8_h8_is_48px.md` — spacing scale 8=48px, 7=32px (기본 tailwind 와 다름)
   - `feedback_tailwind_token_class_pattern.md` — status- prefix 없음 (`text-fire-bar` O / `text-status-fire-bar` X)
   - `feedback_text_caption_leading_none.md` — 작은 컨테이너 안 text-caption 은 leading-none
   - `project_redesign_16_workshift_status.md` — tokens.css 불일치 시 `text-[#hex]` arbitrary fallback

6. **After verification (executor 자체 검증)**:
   ```bash
   AFTER_STYLE=$(grep -c 'style={{' src/pages/LegalPage.tsx)
   AFTER_BIZ=$(git diff HEAD -- src/pages/LegalPage.tsx | grep -cE 'onClick|onChange|useMutation|useQuery|useState|useRef|useEffect|useNavigate|legalApi|inspectionApi|fetch\(')

   echo "After: style=$AFTER_STYLE biz_diff=$AFTER_BIZ"
   # AFTER_STYLE 은 사용자 옵션에 따라:
   #   - 옵션 M 완전 적용: AFTER_STYLE 이 매우 낮음 (잔존 = 색 변수 케이스만, 약 5~15)
   #   - 옵션 N 색 변수만 잔존: AFTER_STYLE = 색 변수 인스턴스 수 (약 10~20)
   # AFTER_BIZ MUST = 0 (비즈니스 로직 0 byte 변경)

   # TypeScript 컴파일
   ./node_modules/.bin/tsc --noEmit 2>&1 | grep -E "src/pages/LegalPage.tsx" | grep -E "error TS" | wc -l
   # MUST = 0

   # Phase A 결과 보존 확인
   grep -E "import \{[^}]*Check[^}]*X[^}]*Lock[^}]*Save[^}]*\} from 'lucide-react'" src/pages/LegalPage.tsx | wc -l
   # MUST >= 1 (Phase A import 줄 보존)

   # 비표준 색 토큰 0 (Phase A §2.3 결과 보존)
   grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/LegalPage.tsx
   # MUST = 0 (Phase A 가 모두 `-bar` 변종으로 변환했음 — Phase B 가 되돌리면 안 됨)

   # Emoji 0 (Phase A §7.1 결과 보존)
   grep -cE '✓|✗|🔒|💾' src/pages/LegalPage.tsx
   # MUST = 0

   # 다른 파일 변경 0
   git diff --name-only HEAD | grep -v "src/pages/LegalPage.tsx" | grep -v "sketch/" | wc -l
   # MUST = 0
   ```

7. **시각 검증 (수동 — 별도 dev 서버 권장하지만 plan 범위는 아님)**:
   - Task 3 commit 후 사용자가 cbc7119-preview 에서 LegalPage 의 모든 탭/모달 시각 동일 확인
   - 픽셀 단위 차이 발견 시 옵션 X (정확값) 미적용 케이스 의심 → 롤백 후 재변환
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && AFTER_STYLE=$(grep -c 'style={{' src/pages/LegalPage.tsx) && echo "AFTER inline style count: $AFTER_STYLE (was 141)" && BIZ_DIFF=$(git diff HEAD -- src/pages/LegalPage.tsx | grep -E '^[+-]' | grep -vE '^[+-]{3}' | grep -cE 'onClick=|onChange=|onSubmit=|useMutation\(|useQuery\(|useState\(|useRef\(|useEffect\(|useNavigate\(|legalApi\.|inspectionApi\.|fetch\(') && echo "Biz logic diff lines: $BIZ_DIFF (must be 0)" && [ "$BIZ_DIFF" = "0" ] && grep -E "from 'lucide-react'" src/pages/LegalPage.tsx | grep -q "Check" && grep -E "from 'lucide-react'" src/pages/LegalPage.tsx | grep -q "Lock" && [ "$(grep -cE '✓|✗|🔒|💾' src/pages/LegalPage.tsx)" = "0" ] && [ "$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/LegalPage.tsx)" = "0" ] && ./node_modules/.bin/tsc --noEmit 2>&1 | grep -E "src/pages/LegalPage.tsx" | grep -E "error TS" | wc -l | tr -d ' ' | grep -q "^0$" && [ "$(git diff --name-only HEAD | grep -v 'src/pages/LegalPage.tsx' | grep -v 'sketch/' | grep -v '.planning/' | wc -l | tr -d ' ')" = "0" ]</automated>
  </verify>
  <done>
    - `grep -c 'style={{' src/pages/LegalPage.tsx` 결과:
      - 옵션 M 풀 적용 (색 변수 잔존만): 약 5~15
      - 옵션 N 부분 적용 (색 변수 + dynamic 잔존): 약 10~20
      - **정확 숫자는 사용자 옵션 결정 후 task 진행 중 documented**
    - `git diff HEAD -- src/pages/LegalPage.tsx | grep -cE 'onClick=|onChange=|onSubmit=|useMutation\(|useQuery\(|useState\(|useRef\(|useEffect\(|useNavigate\(|legalApi\.|inspectionApi\.|fetch\('` = 0 (비즈니스 로직 0 byte 변경)
    - L5 lucide-react import 줄에 `Check`, `X`, `Lock`, `Save` 모두 보존 (Phase A 결과)
    - `grep -cE '✓|✗|🔒|💾' src/pages/LegalPage.tsx` = 0 (Phase A §7.1 결과 보존)
    - `grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/LegalPage.tsx` = 0 (Phase A §2.3 + audit followup 결과 보존)
    - `./node_modules/.bin/tsc --noEmit` LegalPage.tsx 신규 에러 0
    - `git diff --name-only HEAD` 결과는 `src/pages/LegalPage.tsx` + `.planning/quick/260527-wdc-.../sketch/legalpage-phase-b-tailwind.html` 만 (다른 파일 변경 0)
    - `git diff --diff-filter=D --name-only HEAD~1 HEAD` 결과 0 (post-commit deletion 0)
    - 메모리 anchor 4건 모두 적용 (w-7/w-8 함정 / status- prefix 없음 / leading-none / text-[#hex] fallback)
  </done>
</task>

</tasks>

<verification>
**플랜 전체 검증 (Task 3 완료 후):**

1. **inline style 대폭 감소 (no-op refactor 원칙 보존):**
   - Before: `grep -c 'style={{' src/pages/LegalPage.tsx` = 141
   - After: 사용자 옵션 (M/N) 에 따라 documented (목표: 정적 inline style 0, 동적/색변수 잔존만)

2. **비즈니스 로직 0 byte 변경:**
   - `git diff HEAD -- src/pages/LegalPage.tsx | grep -E '^[+-]' | grep -cE 'onClick=|onChange=|useMutation\(|useQuery\(|useState\(|useRef\(|useEffect\(|legalApi\.|inspectionApi\.|fetch\('` = 0

3. **Phase A 결과 보존:**
   - L5 lucide import: `Check`, `X`, `Lock`, `Save` 모두 보존
   - emoji 0 (`✓`, `✗`, `🔒`, `💾` grep = 0)
   - 비표준 색 토큰 0 (`bg-warning[^-]`, `border-safe[^-]`, `border-warning[^-]`, `border-danger[^-]` grep = 0)

4. **TypeScript 컴파일:**
   - `./node_modules/.bin/tsc --noEmit` LegalPage.tsx 신규 에러 0

5. **변경 파일 범위:**
   - `git diff --name-only HEAD` 결과 = `src/pages/LegalPage.tsx` + sketch HTML 단 둘
   - 다른 파일 (LegalFindingsPage 등) 변경 0

6. **post-commit deletion 0:**
   - `git diff --diff-filter=D --name-only HEAD~1 HEAD` = 0

7. **시각 검증 (수동):**
   - cbc7119-preview 배포 후 LegalPage 의 모든 탭/모달 시각 동일 확인 (별도 단계)
</verification>

<success_criteria>
- [ ] sketch HTML 작성 + 사용자 컨펌 완료 (옵션 X/Y, P/Q, M/N 결정)
- [ ] LegalPage.tsx 정적 inline style 0 (동적/색변수 잔존만 허용)
- [ ] Phase A 결과 보존 (Lucide import + 색 토큰 정리 + emoji 0)
- [ ] 비즈니스 로직 0 byte 변경 (`grep -cE 'onClick|useMutation|...'` diff = 0)
- [ ] TypeScript 통과 (신규 에러 0)
- [ ] 변경 파일 = LegalPage.tsx + sketch HTML 단 둘
- [ ] post-commit deletion 0
- [ ] 메모리 anchor 4건 적용 (w-7=32 / w-8=48 / status- prefix X / leading-none / text-[#hex] fallback)
</success_criteria>

<commits>
- **Pre-dispatch (orchestrator 가 작성)**: `docs(260527-wdc): pre-dispatch plan for LegalPage Phase B inline style → tailwind`
- **Task 1 완료 시**: `feat(260527-wdc-01): LegalPage Phase B sketch — inline style → tailwind 패턴 표 (6 그룹 + 옵션 X/P/M 분기)`
- **Task 2 (checkpoint)**: 자체 commit 없음 — 사용자 결정 사항을 Task 3 commit message 에 기록
- **Task 3 완료 시**: `feat(260527-wdc-03): LegalPage §inline-style 141곳 → tailwind class 변환 (옵션 [X|Y] + [P|Q] + [M|N])`
</commits>

<output>
After completion, create `.planning/quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/260527-wdc-SUMMARY.md`:
- 사용자 선택 옵션 (X/Y, P/Q, M/N) 명시
- Before/After grep count 표 (`style={{` count, biz logic diff, lucide import 보존, emoji 0, 색 토큰 0)
- 변환 패턴 통계 (P1/P2/P3/P4/P5/P6 각각 몇 곳)
- 잔존 inline style 목록 (사용자 옵션 N 적용 케이스 / 색 변수 케이스 / 동적 분기 케이스)
- 메모리 anchor 4건 적용 결과
- 다음 작업 후보 (LegalFindingsPage / LegalFindingDetailPage 동일 phase B 변환 / 다른 페이지 sweep)
</output>
</content>
</invoke>
---
title: "redesign/27-login — sketch wave 1 (index)"
status: locked
created: 2026-05-21
quick_id: 260521-c6p
branch: redesign/27-login
source_tsx: cha-bio-safety/src/pages/LoginPage.tsx
source_tsx_lines: 220
design_system: cha-bio-safety/docs/redesign-context/27-login/design-system.md (v0.1.1, c8bfa86)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (인증 전 페이지 — 미적용 + BottomNav 양쪽 숨김)
mirror_of: cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md (260520-ep5) — 7 섹션 구조 mirror, sub-wave 만 6→4 축소
sub_wave_count: 4 (W2~W5)
memory_rules_inline: 10
open_questions: 5
---

# redesign/27-login — sketch wave 1 (index)

본 문서는 W2~W5 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:
- LoginPage.tsx (220 라인) 의 element 인벤토리 → 4 sub-wave 분배
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6 / §7 의 verbatim 룰 박제 (§6/§7/§10 표기는 design-system.md 실측 결과 §6/§7 — 본 인덱스는 실측 §번호 사용)
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 27-login 적용 여부 (인증 전 페이지 — 미적용)
- 메모리 룰 10건 (`feedback_*.md`) inline 인용 — LoginPage 컨텍스트에 어떻게 적용할지
- §6 negative rule (이 wave 에서 금지된 것)
- §7 open questions 5건 — W2 진입 직전 사용자 컨펌

작성일: 2026-05-21 / Quick ID: 260521-c6p / Branch: redesign/27-login

> 14-reports W1 (260520-ep5) 의 7 섹션 구조를 mirror 하되, LoginPage 가 220 lines 단순 페이지라 sub-wave 는 6 → 4 로 축소 (W2~W5). 13-schedule + 14-reports 모두 평면(flat sibling) 패턴 — `27-login/sketch-wave-N-{slug}.html` 직접 배치, `sketch/` 서브폴더 없음. 본 인덱스도 `27-login/wave-1-index.md` (flat) 으로 위치한다.

---

# §1. LoginPage.tsx 인벤토리

본 인벤토리는 LoginPage.tsx (220 lines, 27-login.md 메타와 일치 — drift 없음) 의 element 를 (1) 모바일 전용 헤더 / (2) 공통 inner 블록 / (3) 데스크톱 wrapper 3 영역으로 나눠 정리한다. line 범위는 **실측 결과** (PLAN 추정치는 참고만, 본 인덱스는 실제 파일 grep 결과 사용).

**LoginPage 의 구조 특이성** (인벤토리 머리말):
- `const inner = (...)` (line 82~172) 는 모바일/데스크톱 양쪽에서 공통 사용 — JSX fragment 1개로 정의하고 두 레이아웃이 모두 참조
- 모바일 (line 201~219) = 상단 헤더 (line 204~213) + inner 을 flex column 으로 감쌈 (line 215~217)
- 데스크톱 (line 175~198) = inner 을 `maxWidth: 420` centered card 안에 wrap, card 헤더 한 번 더 (line 180~190)
- `useMediaQuery('(min-width: 768px)')` 로 분기 (line 40, hook 정의 line 8~19)
- 직원 카드 색상 `CARD_COLORS` 6종 (line 21~28) — status/duty 와 별개 카테고리 색

## §1.1 영역별 인벤토리 표

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. 공통 hook + state + handler | `useMediaQuery` hook | 8~19 | 모바일/데스크톱 분기 source | `window.matchMedia` listener, isDesktop boolean (line 40) | 무관 (보존만) |
| 1. 공통 hook + state + handler | state 6종 | 31~36 | staffId / password / showPw / loading / selected / staffList | useAuthStore.login 호출의 입력 | 무관 (보존만) |
| 1. 공통 hook + state + handler | useEffect — staff-list fetch | 42~46 | `/api/public/staff-list` 로드 | `setStaffList(j.data)` on success | 무관 (보존만) |
| 1. 공통 hook + state + handler | `selectStaff(id)` handler | 48~53 | 직원 카드 클릭 — 사번 자동 + pwRef focus | `setSelected` / `setStaffId` / `setTimeout pwRef.focus` 80ms | 무관 (보존만) |
| 1. 공통 hook + state + handler | `handleSubmit(e?)` handler | 55~72 | 로그인 → JWT 발급 → /dashboard | `authApi.login` / `useAuthStore.login` / `navigate('/dashboard')` / toast | 무관 (보존만) |
| 1. 공통 hook + state + handler | `inputStyle` 객체 | 74~79 | input 인라인 스타일 (width/padding/radius/border/bg/color/fontSize/outline/transition) | sketch 시 토큰 클래스로 치환 검토 (W4) | W4 (참조) |
| 2. 모바일 전용 헤더 | 헤더 wrapper | 204~213 | 상단 헤더 (page chrome) | 정적 텍스트 + 아이콘 이미지 | W2 |
| 2. 모바일 전용 헤더 | 로고 박스 (38×38, radius 11, rgba(37,99,235,0.2) bg) + 내부 icon-192.png (28×28, radius 7) | 206~208 | 시스템 식별 로고 | 정적 자산 `/icons/icon-192.png` | W2 |
| 2. 모바일 전용 헤더 | 타이틀 "차바이오컴플렉스 방재팀" (fontSize:16, fontWeight:700, color:var(--t1)) | 210 | 시스템 명칭 | 정적 카피 | W2 |
| 2. 모바일 전용 헤더 | 서브 "소방안전 통합관리 시스템" (fontSize:11, color:var(--t3), marginTop:2) | 211 | 시스템 부제 | 정적 카피 | W2 |
| 3. 공통 inner — 직원 카드 그리드 | 컨테이너 (bg:var(--bg2), radius:16, padding:16, marginBottom:12, border 1px var(--bd)) | 85 | 카드 그리드 wrapper | 없음 (정적 wrapper) | W3 |
| 3. 공통 inner — 직원 카드 그리드 | 라벨 "담당자 선택" (fontSize:10, fontWeight:700, var(--t3), letterSpacing .06em, uppercase, marginBottom:12) | 86 | 그리드 헤더 라벨 | 정적 카피 | W3 |
| 3. 공통 inner — 직원 카드 그리드 | 그리드 (display:grid, gridTemplateColumns:'1fr 1fr', gap:8) | 87 | 2-column 카드 레이아웃 | `staffList.map((s, i) => ...)` | W3 |
| 3. 공통 inner — 직원 카드 그리드 | 카드 버튼 (반복) — flex row, gap:10, padding:10, radius:12, border 1px (CARD_COLORS[i%6] 또는 isSelected 시 `rgba(59,130,246,0.6)`), bg (CARD_COLORS[i%6].color 또는 isSelected 시 `rgba(59,130,246,0.12)`) | 94~111 | 직원별 카드 인스턴스 | `selectStaff(s.id)` onClick | W3 |
| 3. 공통 inner — 직원 카드 그리드 | initial 박스 (34×34, radius:10, bg:isSelected?'#2563eb':c.border, fontSize:14, fontWeight:700, color:'#fff') | 104~106 | 직원 이름 첫 글자 | `s.name.charAt(0)` | W3 |
| 3. 공통 inner — 직원 카드 그리드 | 이름 (fontSize:13, fontWeight:700, var(--t1)) + role/title (fontSize:10, var(--t3)) | 108~109 | 직원 식별 텍스트 | `s.name` / `s.role === 'admin' ? '관리자' : s.title` | W3 |
| 4. 공통 inner — 로그인 폼 | 컨테이너 (bg:var(--bg2), radius:16, padding:16, border 1px var(--bd)) | 118 | 폼 카드 wrapper | `<form onSubmit={handleSubmit}>` | W4 |
| 4. 공통 inner — 로그인 폼 | 사번 label (fontSize:11, fontWeight:600, var(--t3), display:block, marginBottom:6) + input (inputMode numeric, placeholder "사번 10자리", `inputStyle` 적용) | 121~129 | 사번 입력 | `setStaffId(e.target.value); setSelected(null)` | W4 |
| 4. 공통 inner — 로그인 폼 | 비밀번호 label + input wrapper (position:relative) + input (type=showPw?'text':'password', placeholder "비밀번호 입력", paddingRight:44 for 토글 공간) + show/hide 토글 button (텍스트 "표시"/"숨김", absolute right:12 top:50%, fontSize:13) | 132~150 | 비밀번호 입력 + 표시 토글 | `setPassword` / `setShowPw(v=>!v)` / Enter key → `handleSubmit()` | W4 |
| 4. 공통 inner — 로그인 폼 | 로그인 버튼 (type:submit, disabled:loading, padding:14, radius:12, **그라데이션 `linear-gradient(135deg,#1d4ed8,#2563eb)`** loading 시 var(--bg3) solid, fontSize:14, fontWeight:700) | 152~163 | CTA — 로그인 실행 | `handleSubmit` form submit | W4 |
| 5. 공통 inner — footer 안내문 | "초기 비밀번호: 사번 뒤 4자리" + `<br/>` + "문의: 방재팀 내선 ☎ 031-881-7119" (textAlign:center, fontSize:11, color:var(--t3), marginTop:20, lineHeight:1.6) | 167~170 | 사용자 안내 | 정적 카피 | W4 (폼 카드 직후 묶음) |
| 6. 데스크톱 wrapper | 외곽 (minHeight:100dvh, flex center, padding 20, bg:var(--bg)) | 177 | 데스크톱 페이지 wrapper | 없음 | W2 |
| 6. 데스크톱 wrapper | 카드 (maxWidth:420, radius:20, bg:var(--bg2), border, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', overflow:hidden) | 178 | 데스크톱 centered card | 없음 (정적 wrapper) | W2 |
| 6. 데스크톱 wrapper | 카드 헤더 (padding:'24px 24px 20px', borderBottom 1px var(--bd)) — 모바일 헤더와 동일 구조 (로고 38×38 + 타이틀 16/700 + 서브 11) | 180~190 | 카드 헤더 (모바일 헤더 미러) | 정적 텍스트 + 아이콘 | W2 (모바일 헤더와 통합) |
| 6. 데스크톱 wrapper | 카드 바디 (padding:'16px 16px 24px') 안에 `{inner}` | 192~194 | inner 콘텐츠 마운트 | `inner` JSX fragment 참조 | W2 (wrapper) + W3/W4 (inner 자체) |

## §1.2 line 수 실측 확인

`wc -l cha-bio-safety/src/pages/LoginPage.tsx` 실측 = **220 라인** (PLAN 추정치 + 27-login.md 메타 일치, drift 없음).

ReportsPage (405 lines) 대비 약 54% 짧음 — sub-wave 6 → 4 축소가 타당. ExcelPreview 같은 별도 컴포넌트 없음 (CARD_COLORS 정의는 파일 내부 라인 21~28 11 라인 const).

---

# §2. 4 sub-wave 분배 plan

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 shell + 데스크톱 wrapper + 공통 헤더 (로고+타이틀+시스템명) | 영역 2 (모바일 헤더, line 204~213) + 영역 6 (데스크톱 wrapper + 카드 헤더, line 175~194). useMediaQuery 분기는 inner 공통이라 chrome 만 sketch 1매로 묶음. | sketch-wave-2-mobile-shell.html |
| W3 | 직원 카드 그리드 (2열 × N staff, CARD_COLORS 6종 cycle) | 영역 3 — 카드 컨테이너 + 라벨 + 6 카드 variant matrix + isSelected 상태 (line 85~115) | sketch-wave-3-staff-card-grid.html |
| W4 | 로그인 폼 + footer 안내문 (input + show/hide 토글 + CTA + 안내) | 영역 4 + 영역 5 — 사번/비밀번호 input + 토글 + 로그인 버튼 + footer 2줄 (line 118~170) | sketch-wave-4-login-form.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + LoginPage.tsx 비즈 로직 보존 룰 + Tailwind cheatsheet | wave-5-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트

### W2 — 모바일 shell + 데스크톱 wrapper + 공통 헤더
- **보존**: `useMediaQuery('(min-width: 768px)')` 분기 (line 40), 로고 src `/icons/icon-192.png` (line 183 / line 207), 타이틀 카피 verbatim "차바이오컴플렉스 방재팀" (line 186 / line 210), 서브 카피 verbatim "소방안전 통합관리 시스템" (line 187 / line 211), 데스크톱 카드 maxWidth 420 (line 178), boxShadow `0 8px 32px rgba(0,0,0,0.4)` (line 178 — 다크 모드 명도 차 유지)
- **토큰**: 모바일 헤더 wrapper = `bg-surface-raised border-b border-border-default` (현재 `var(--bg2)` → `--surface-raised` 매핑, 마이그레이션 §4.1) / 데스크톱 외곽 = `bg-surface-page` (`var(--bg)` → `--surface-page`) / 카드 = `bg-surface-raised border border-border-default rounded-lg` (`radius:20` → `--radius-lg` 16 또는 인라인 `rounded-[20px]` 결정은 sketch 단계) / 로고 박스 = `rounded-md` (radius:11 → `--radius-md` 12 또는 인라인 `rounded-[11px]`) — **status- prefix 없음 (memory feedback_tailwind_token_class_pattern)**
- **폰트**: 양쪽 헤더 타이틀 16px (`text-body font-bold`) 또는 18px (`text-title`) — chrome 룰 §2.3 의 16px `text-body font-bold text-text-primary truncate` 패턴 mirror 가능. 단, 인증 전 페이지 타이틀 위계가 점검 페이지보다 낮음 → **default 16px 유지** (planner 판단, OQ 후보 아님). 서브 11px → §1.1 위반 (9·10·11px 금지) → `text-caption` (12px) 으로 상향 마이그레이션 §4.2.

### W3 — 직원 카드 그리드
- **보존**: `setSelected` / `setStaffId` / `pwRef.current?.focus()` (line 48~53), CARD_COLORS 6종 rgba 인라인 verbatim (line 21~28 — amber/green/blue/violet/pink/teal, status/duty 와 별개 카테고리 색), `staffList.map((s, i) => ...)` map 시그니처, `isSelected` 분기 색 (`rgba(59,130,246,0.6)` border + `rgba(59,130,246,0.12)` bg + `#2563eb` initial bg, line 99~104), `s.role === 'admin' ? '관리자' : s.title` 분기 (line 92), `s.name.charAt(0)` initial (line 91)
- **토큰**: 컨테이너 = `bg-surface-raised border border-border-default rounded-lg p-card` (`var(--bg2)` → `--surface-raised`, `radius:16` → `--radius-lg`, `padding:16` → `--card-padding` 모바일 14px 자동 분기 — 변환 시 패딩 변경 여부 sketch 컨펌) / 카드 버튼 = CARD_COLORS rgba 인라인 유지 (OQ #2 default — 토큰화 X) / initial 박스 `w-[34px] h-[34px]` 인라인 (w-8=48 함정, memory `feedback_tailwind_w8_h8_is_48px`) / isSelected accent bg = `#2563eb` 인라인 또는 `bg-accent` 토큰 — sketch 단계 결정 — **status- prefix 없음**
- **폰트**: 라벨 "담당자 선택" 10px (fontWeight:700) → §1.1 위반 → `text-caption font-bold leading-none tracking-wider` (12px, memory `feedback_text_caption_leading_none` 작은 컨테이너 leading-none). 카드 이름 13px (`text-label`) / role-title 10px → 12px (`text-caption`) 상향.

### W4 — 로그인 폼 + footer 안내문
- **보존**: `handleSubmit` form submit (line 119), `setShowPw(v => !v)` 토글 (line 145), `setPassword` (line 138), Enter key submit (line 139 `onKeyDown={e => e.key === 'Enter' && handleSubmit()}`), placeholder verbatim "사번 10자리" (line 127) / "비밀번호 입력" (line 140), `inputMode="numeric"` (line 124), `disabled={loading}` + loading 시 카피 "로그인 중..." (line 162) / 정상 시 "로그인" (line 162), show/hide 토글 카피 "표시"/"숨김" (line 148 — Lucide 교체는 OQ #4), footer 카피 verbatim "초기 비밀번호: 사번 뒤 4자리" / "문의: 방재팀 내선 ☎ 031-881-7119" (line 168~169)
- **토큰**: 폼 컨테이너 = `bg-surface-raised border border-border-default rounded-lg p-card` (W3 와 동일) / input = `bg-surface-sunken border border-border-strong rounded-sm` (`var(--bg3)` → `--surface-sunken`, `var(--bd2)` → `--border-strong`, `borderRadius:12` → `--radius-md` 12 또는 `--radius-sm` 8 — input 은 sm 권장 design-system §2.6) / 로그인 버튼 = **`bg-safe-bar` solid** (그라데이션 폐기, OQ #1 default OK — 13-schedule W6 LOCKED b + 14-reports W1 OQ #1/#3 일관 + design-system §6.4 CTA 그라데이션 폐기 룰) / disabled 시 = `bg-surface-sunken` (현재 `var(--bg3)` 일관) / show/hide 토글 = `text-text-tertiary` ghost button — **status- prefix 없음**
- **폰트**: 양쪽 label "사번"/"비밀번호" 11px (fontWeight:600) → §1.1 위반 → `text-label` (13px) + memory `feedback_text_caption_leading_none` 검토 (label 이 marginBottom:6 작은 컨테이너 안). input 14px → `text-body-sm` (14px) 또는 `text-body` (16px) — design-system 권장 16px 마지노선 위반 — sketch 단계 절충. 로그인 버튼 14px `font-bold` → `text-body-sm font-bold` 또는 `text-body font-bold`. footer 11px → OQ #3 (default `text-label` 13px 절충).

### W5 — TSX 변환 verify checklist (markdown)
- **보존**: LoginPage.tsx 의 모든 비즈 로직 (useMediaQuery / useAuthStore.login / fetch `/api/public/staff-list` / selectStaff / handleSubmit / authApi.login / setShowPw / setLoading / setStaffId / setPassword / setSelected / setStaffList / Enter key / setTimeout pwRef.focus 80ms) 100% 보존. UI markup + 인라인 style 만 재작성.
- **토큰**: W2~W4 sketch 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → checklist 안에 verbatim 인용 (memory `feedback_planner_prompt_sketch_verbatim`). status- prefix 없음 룰 (memory `feedback_tailwind_token_class_pattern`) + `w-8/h-8 = 48px` 함정 룰 (memory `feedback_tailwind_w8_h8_is_48px`) verbatim 박제. 로그인 버튼 그라데이션 폐기 결정 (OQ #1) 명시.
- **폰트**: design-system.md §2.7 7단계 cheatsheet + 마이그레이션 룰 §4.2 의 9·10·11px 일괄 상향 룰 verbatim 박제. label/footer/sub 의 11px 절충 결정 (OQ #3) 명시.

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

본 인용은 `cha-bio-safety/docs/redesign-context/27-login/design-system.md` (v0.1.1, c8bfa86) 원문 그대로. 후속 wave 작업자가 design-system.md 를 별도로 열지 않아도 핵심 룰을 본 인덱스에서 직접 확인 가능하도록 박제한다.

> **§번호 실측 보정 (PLAN drift)**: PLAN.md 는 §6/§7/§10 인용을 요청했으나, 실측 design-system.md (v0.1.1, c8bfa86) 의 섹션 번호는 §6 Progress / §7 Iconography 까지로 §10 없음. 따라서 본 인덱스는 §6.1 (Progress Color Rule) / §6.2 (Stat Card Number Color) / §6.4 (Backgrounds & Gradients) / §7.1 (Iconography — Lucide) 4개 fence 박제 + 14-reports W1 과 일관된 §1.1 / §1.2 / §1.3 의 3 fence = **총 7 fence (open+close 14)** 로 PLAN 의 §10 자리는 §7.1 로 치환. 14-reports W1 (260520-ep5) 의 §3.6 도 같은 §7.1 Lucide 박제와 일관.

## §3.1 design-system §1.1 노안 친화 (verbatim)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

## §3.4 design-system §6.1 Progress Color Rule (verbatim)

```
### 6.1 Progress Color Rule (진척률 색 매핑)

점검 카테고리 도넛, 카테고리 카드 좌측 색바 등 **진척률을 표현할 때** 일관 적용한다.

| 진척률 | 색상 | 토큰 |
|---|---|---|
| 100% (완료) | 녹색 | `--status-safe-bar` |
| 50~99% | 파랑 | `--accent` |
| 1~49% | 노랑 | `--status-warning-bar` |
| 0% (미시작) | 회색 | `--text-tertiary` |

**카테고리별 임의 색 배정 폐지** — 카테고리는 아이콘 모양으로 구분하고, 색은 진척률 기반만 사용한다.
```

> **§6 미적용 — 로그인 페이지에는 진척률 도넛/카테고리 카드 없음.** LoginPage 의 직원 카드 그리드는 CARD_COLORS 6종 카테고리 색 (status/duty/progress 와 별개) — 진척률 색 매핑 적용 대상이 아니므로 Progress Color Rule 비적용. 단, **§6.4 그라데이션 폐기 룰은 적용** (OQ #1 — 로그인 버튼 그라데이션 → `bg-safe-bar` solid).

## §3.5 design-system §6.2 Stat Card Number Color (verbatim)

```
### 6.2 Stat Card Number Color

통계 카드(28px display 숫자) 색상 룰:
- 기본 숫자 색: `--text-primary` (흰색/검정)
- 라벨: `--text-secondary`
- 단위: `--text-tertiary`
- **위험 임계치 조건부 처리**: `점검 미완료 > 0`, `미조치 > 0` 등 주의가 필요한 상태일 때 숫자만 `--status-danger`로 변경
- 카드 좌측 3px 색바: 해당 status 토큰의 `bar` 변종 (예: `--status-danger-bar`)
```

> **§7 (= "Stat Card" 룰) 미적용 — 로그인 페이지에는 통계 숫자 카드 없음.** LoginPage 에는 28px display 숫자 카드가 없다 (직원 카드 / 폼 카드 / footer 안내문 뿐). **W5 변환 wave executor 가 Stat Card §6.3 룰 verbatim 인용 누락으로 deviation 잡으면 안 됨** — 실제로 27-login 에 적용 대상 element 가 없으므로 (memory `feedback_tsx_wave_stat_card_drift` 룰 따라 본 인덱스에 "미적용" 명시).

## §3.6 design-system §6.4 Backgrounds & Gradients 폐기 룰 (verbatim)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

> LoginPage 현재 그라데이션 = `linear-gradient(135deg,#1d4ed8,#2563eb)` (line 157 로그인 버튼). §6.4 의 "저장/CTA 그라데이션" 후보처럼 보이지만 (#1d4ed8 일치), 그라데이션의 종점 색이 #0ea5e9 가 아닌 #2563eb 로 다름 → §6.4 의 "유일한 그라디언트 2종" 정확한 매치 아님. **13-schedule W6 LOCKED b + 14-reports W1 OQ #1/#3 일관 정책 따라 그라데이션 폐기 → `bg-safe-bar` solid 통일.** 이 결정은 §7 OQ #1 에서 사용자 컨펌 (default = solid OK).

## §3.7 design-system §7.1 Iconography — Lucide (verbatim)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

> **§10 (PLAN drift 보정 = §7.1)** — Lucide 사용 가능 (예: `Eye`/`EyeOff` for show/hide 토글, OQ #4). 커스텀 SVG 6종 (StairsIcon / ShutterIcon / ExitSignIcon / SmokeVentIcon / HoseReelIcon / FireExtinguisherCustom) **미사용** — 로그인 페이지는 카테고리 페이지가 아니므로. 로고 아이콘은 외부 이미지 `/icons/icon-192.png` (Lucide 가 아닌 PNG 자산 — `<img>` 태그 유지). 단, footer 카피 line 169 의 "☎" 글리프 (U+260E) 는 이모지 사용 금지 룰 위반 후보 → OQ #4 보너스로 검토 (default 유지 — 전화 affordance).

---

# §4. 02+06 chrome 통일 룰 적용 여부

27-login 페이지는 점검 페이지 시리즈가 아닌 **인증 전 (pre-auth) 페이지** → `inspection-modal-chrome-rules.md` 의 chrome 룰 전체 적용 대상이 아니다. back button / SideMenu / BottomNav 모두 비노출, zone/category/floor/line wrapper 없음.

단, 다음 3가지 패턴의 적용 여부를 명시:

1. **헤더 폰트 크기** — chrome 룰 §2.3 의 `text-body font-bold text-text-primary truncate` (16px) 패턴 또는 design-system §2.7 의 `text-title` (18px) 둘 다 허용. LoginPage 모바일/데스크톱 헤더 line 186 / line 210 의 `fontSize: 16, fontWeight: 700` 은 이미 §2.3 패턴과 일치 → **default 16px 유지** (planner 판단, OQ 후보 아님). 14-reports + 13-schedule 와 달리 로그인은 인증 전이라 페이지 타이틀 위계가 낮음 — 16px 유지 합리적.

2. **back button 패턴** — chrome 룰 §7.2 의 `w-8 h-8 rounded-sm bg-surface-sunken border border-border-default text-text-secondary` + lucide `ChevronLeft size={15}` 패턴은 **인증 전 페이지 → back button 자체 없음** (어디로 돌아가나? 외부 사이트). mirror 무관. W2~W4 sketch 에 back button 그리지 않음.

3. **BottomNav 숨김 확인** — `cha-bio-safety/src/App.tsx` 실측 결과:

```
line 71: const MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']
line 74: const DESKTOP_NO_NAV_PATHS = ['/', '/login']
```

`/login` 이 **`MOBILE_NO_NAV_PATHS` (line 71) + `DESKTOP_NO_NAV_PATHS` (line 74) 양쪽에 등재됨** — 모바일/데스크톱 모두 BottomNav 숨김. sketch 시 nav placeholder/예약 공간 그릴 필요 없음. 본 wave + W2~W5 모두 `App.tsx` 손대지 않음 (§6 negative rule 에도 포함).

---

# §5. 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 10건. 각 룰은 `feedback_*.md` 파일명 + 1줄 요약 + Why + How (27-login 컨텍스트) 3 항목.

### 룰 1 — feedback_design_sketch_first.md
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- **Why**: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적. 디자인 작업의 핵심 룰.
- **How to apply (27-login)**: W3 직원 카드 그리드의 카드 크기 (현재 34×34 initial 박스 / padding 10 / gap 8 / 2-column) 조정도 spacing 손볼 거 있으면 sketch-wave-3-staff-card-grid.html 먼저 보여주고 사용자 컨펌. "이거 작게/크게 해보자" 라는 인라인 변경 직행 금지.

### 룰 2 — feedback_redesign_sketch_rule_enforcement.md
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- **Why**: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- **How to apply (27-login)**: 직원 카드 색상 (CARD_COLORS 6종 amber/green/blue/violet/pink/teal) 은 status 와 무관 — `bg-status-safe-bg` 같은 위험 임계치 색 사용 금지 (각 카드는 카테고리 색일 뿐). 로그인 버튼만 CTA → `bg-safe-bar` solid (의미: "이 작업 실행" 정상 CTA).

### 룰 3 — feedback_sketch_realistic_data.md
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- **Why**: sketch 작성 시 "차바이오컴플렉스 방재팀" 같은 텍스트를 임의 변경하면 코드 변경 wave 가 deviation 으로 잡힘.
- **How to apply (27-login)**: 타이틀 "차바이오컴플렉스 방재팀" / 서브 "소방안전 통합관리 시스템" / footer "초기 비밀번호: 사번 뒤 4자리" / "문의: 방재팀 내선 ☎ 031-881-7119" / placeholder "사번 10자리" / "비밀번호 입력" / 토글 "표시"/"숨김" / 로딩 "로그인 중..." 모두 verbatim. 표시 분기 / 카피 변경 금지. 시각 디자인 (그라데이션 → solid 등) 만 sketch 에서 처리.

### 룰 4 — feedback_planner_prompt_sketch_verbatim.md
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
- **Why**: planner 가 sketch 의 토큰명 (예: `bg-surface-raised`) 을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용.
- **How to apply (27-login)**: W5 TSX 변환 wave 진입 직전 sketch-wave-2~4.html 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → wave-5-tsx-conversion-checklist.md 안에 verbatim 인용. 특히 직원 카드 isSelected border `rgba(59,130,246,0.6)` / bg `rgba(59,130,246,0.12)` / initial `#2563eb` 같은 인라인 rgba 는 추측 X — sketch 결과 verbatim 인용.

### 룰 5 — feedback_tailwind_token_class_pattern.md
- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지).
- **Why**: 11-div TSX v3 hotfix(4ce707e) 사고 — `status-` prefix 가 tailwind.config 에 없어서 class 안 먹음. `bg-safe-bar` 가 올바른 패턴.
- **How to apply (27-login)**: 로그인 버튼 = `bg-safe-bar text-text-on-accent` (정상 CTA). 만약 sketch 에서 `bg-status-safe-bar` 같은 prefix 사용하면 W5 verify gate FAIL. 직원 카드 hover/active 색은 `bg-surface-active` 또는 카드별 카테고리 색 (CARD_COLORS rgba 인라인) 유지. lucide `Eye`/`EyeOff` 아이콘 도입 시 (OQ #4) `<Eye size={16} />` prop 사용 — className 으로 `w-4 h-4` 금지.

### 룰 6 — feedback_tailwind_w8_h8_is_48px.md
- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- **How to apply (27-login)**: 직원 카드 initial 박스 현재 34×34 (line 104) → `w-[34px] h-[34px]` 명시 (w-8 = 48 함정, w-7 = 32 미달, 토큰에 34 없음 — 인라인 안전). 로고 박스 현재 38×38 (line 182, 206) → `w-[38px] h-[38px]` 인라인 (OQ #5 default 유지). 내부 icon-192.png 28×28 (line 183, 207) → `w-7 h-7` (32px) 시 4px 확대 / `w-[28px] h-[28px]` 인라인 안전.

### 룰 7 — feedback_text_caption_leading_none.md
- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 헤더 토글/배지/칩 작은 영역은 `leading-none` 명시.
- **Why**: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- **How to apply (27-login)**: label "사번" / "비밀번호" 11px (현재 fontSize:11, line 121/132) → `text-label` (13px lh:1.5=19.5) 가 marginBottom:6 (작은 컨테이너) 안에서 시각 패딩 유발 — `leading-none` 명시 검토. 카드 그리드 라벨 "담당자 선택" 10px (line 86) → `text-caption font-bold leading-none tracking-wider` (12px + leading-none). 직원 카드 안 role/title 10px (line 109) → `text-caption leading-tight` (4px gap 안 작은 텍스트).

### 룰 8 — feedback_tsx_wave_emoji_dot_gap.md
- **요약**: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- **Why**: sketch 의 `🎯` `⬇` 같은 이모지/특수문자 글리프가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 도 자동 적용 안 됨.
- **How to apply (27-login)**: footer line 169 `'☎ 031-881-7119'` 안 ☎ (U+260E) 글리프 → 메모리 룰 8 의 "이모지 제거" 대상 검토. 단, ☎ 는 전화 affordance 로 유지 가능 (lucide `Phone` 아이콘 대체도 후보) → OQ #4 보너스 검토 (default 유지). LoginPage 본문에는 가운뎃점 `·` dot span 패턴 적용 대상 없음 (직원 카드 sub 는 단일 텍스트 "관리자" 또는 title 1개).

### 룰 9 — feedback_tsx_wave_stat_card_drift.md
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- **How to apply (27-login)**: 27-login 에는 Stat Card (28px display 숫자) 가 없으므로 §3.5 인용 후 "미적용" 메타 명시. 단, sketch 새 패턴 (예: 직원 카드 색상 variant matrix — CARD_COLORS 6종 cycle + isSelected 청색 강조) 은 verbatim 인용해 W5 checklist 박제. source LoginPage.tsx 의 인라인 rgba 가 sketch 의 새 토큰 패턴을 덮어쓰지 않도록 명시 필수.

### 룰 10 — feedback_avoid_premature_confirmation.md
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- **How to apply (27-login)**: 본 인덱스 작성 완료 후 "§7 OQ 5건 컨펌 부탁" 보고만. "wave 1 완벽 / W2 진입 가능" 같은 자신감 표현 금지. W2~W5 진입 시점도 사용자 컨펌 명시 받은 후에만. sketch 산출 후 "거의 일치 / 잘 됐다" 표현 금지.

---

# §6. negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **LoginPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/LoginPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src/pages/LoginPage.tsx` 결과 0 줄.
- **비즈 로직 무관** — `handleSubmit` / `selectStaff` / `useAuthStore.login` / `fetch('/api/public/staff-list')` / `useMediaQuery('(min-width: 768px)')` / `setShowPw` / `setStaffId` / `setPassword` / `setSelected` / `setLoading` 모두 본 wave 와 무관. 본 wave 는 markdown 1개만.
- **다른 페이지 (13-schedule / 14-reports / 02 / 06 등) 영향 금지** — `git status` 에 27-login/ 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler.md` (디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler.md`. `npm run deploy` 는 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 배포만.
- **13-schedule + 14-reports 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지** — 13-schedule 실측 = 평면(flat sibling). 14-reports 도 동일. `sketch/` 서브폴더 만들지 않음. 27-login 도 동일 평면 배치 (`27-login/sketch-wave-N-{slug}.html`).
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` + `DESKTOP_NO_NAV_PATHS` 모두 `/login` 이미 등재됨 (line 71, line 74 실측 확인). 본 wave + W2~W5 모두 `App.tsx` 손대지 않음.

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 5건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call). 단, "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

- OQ #1: 로그인 버튼 그라데이션 (`linear-gradient(135deg,#1d4ed8,#2563eb)`, LoginPage.tsx line 157) → `bg-safe-bar` solid 통일 OK?
  - **default 답: OK** — 13-schedule W6 LOCKED b + 14-reports W1 OQ #1/#3 일관 + design-system §6.4 CTA 그라데이션 폐기 룰. 종점 색 `#2563eb` 이 §6.4 의 "유일한 그라디언트 2종"의 `#0ea5e9` 와 다르므로 폐기 후보로 명확.

- OQ #2: 직원 카드 `CARD_COLORS` 6종 (rgba amber 245,158,11 / green 34,197,94 / blue 59,130,246 / violet 139,92,246 / pink 236,72,153 / teal 20,184,166) — 디자인 토큰화 vs 인라인 rgba 유지?
  - **default 답: 인라인 rgba 유지** — 27-login.md 섹션 4 "직원 카드 그리드 색상은 status/duty 와 별개 카테고리 색 — 그대로 유지" 명시. 토큰화 시 카드별 의미 부여 시도가 §6.2 negative rule (status 색 미적 사용) 유발 위험 (memory `feedback_redesign_sketch_rule_enforcement`).

- OQ #3: 안내 footer 안내문 (현재 fontSize:11, line 167) + 라벨 "사번"/"비밀번호" (현재 fontSize:11, line 121/132) + 카드 라벨 "담당자 선택" (현재 fontSize:10, line 86) + 카드 안 role/title (현재 fontSize:10, line 109) — `text-body` (16px) 노안 친화 완전 준수 vs `text-label` (13px) / `text-caption` (12px) 절충 vs 현재 10·11px 유지?
  - **default 답: `text-label` (13px) / `text-caption` (12px) 절충** — §1.1 마지노선 16px 위반이지만 footer/label/sub 보조 정보 위계상 절충 합리적. 14-reports W1 footer 도 동일 절충 적용 (memory `feedback_text_caption_leading_none` 의 leading-none 명시 같이 적용).

- OQ #4: 비밀번호 show/hide 토글 (현재 텍스트 "표시"/"숨김", line 148) → Lucide `Eye`/`EyeOff` 아이콘 교체? + footer 의 ☎ (U+260E) 글리프 (line 169) → lucide `Phone` 교체 or 유지?
  - **default 답: 사용자 컨펌 필요** — 텍스트는 노안 친화 / 아이콘은 공간 절약. 14-reports W2/W3 의 Lucide `Download` 채택 패턴과 일관성 검토. ☎ 는 전화 affordance 로 유지 가능 (메모리 룰 8 "이모지 제거" 의 예외 케이스 — UI 이모지가 아닌 콘텐츠 글리프). default 는 둘 다 유지 (텍스트 + ☎).

- OQ #5: 로고 (icon-192.png) 박스 — 현재 38×38 + radius 11 + 내부 icon-192.png 28×28 + radius 7 (모바일 line 206~208, 데스크톱 line 182~184) → 토큰화 (`w-9 h-9` = 44px ? / `w-8 h-8` = 48px) vs 인라인 `w-[38px] h-[38px]` 유지?
  - **default 답: 인라인 `w-[38px] h-[38px]` 유지** — tailwind config w-8 = 48 / w-7 = 32 (memory `feedback_tailwind_w8_h8_is_48px` 함정), 38 은 토큰에 없는 1.5px 단위 — `w-[38px]` 명시 사이즈가 안전. 내부 icon 28×28 도 `w-[28px] h-[28px]` 인라인. radius 11 / radius 7 도 토큰 없음 → `rounded-[11px]` / `rounded-[7px]` 인라인.

---

## 자체 verify (작성 완료 후 본 인덱스가 통과해야 할 gate)

본 문서가 후속 wave 진입 자격을 갖췄는지 verify:

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. 7 헤더 존재 | `grep -c '^# §[1-7]' wave-1-index.md` | =7 |
| 2. sub-wave 분배 표 ≥4 | `grep -E '^\| W[2-5] \|' wave-1-index.md \| wc -l` | ≥4 |
| 3. 메모리 룰 unique ≥10 | `grep -oE 'feedback_[a-z_]+' wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 4. negative §6 안 wrangler+npm run deploy | `grep -c 'wrangler' wave-1-index.md` ≥1 & `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 |
| 5. src/** 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src/pages/LoginPage.tsx` | 0 lines |
| 6. OQ §7 ≥5 | `grep -cE 'OQ #[1-5]' wave-1-index.md` | ≥5 |
| 7. design-system fence ≥6 (open+close) | `grep -c '^```' wave-1-index.md` | ≥6 |

모두 PASS 시 본 인덱스가 W2 진입의 단일 진입점으로 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 5건 답변으로 받는다.

다음 wave 파일명: `sketch-wave-2-mobile-shell.html` (OQ #1 답변 후 `/clear` + 새 `/gsd:quick` 시작 권장 — memory `feedback_gsd_workflow_strict`).

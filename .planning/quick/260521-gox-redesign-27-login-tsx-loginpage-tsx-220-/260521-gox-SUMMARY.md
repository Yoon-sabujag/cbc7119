---
phase: 260521-gox
plan: 01
type: execute
wave: 1
status: complete
completed_at: 2026-05-21
tags:
  - redesign
  - 27-login
  - tsx-conversion
  - v0.1.1
  - quick
dependency_graph:
  requires:
    - W2 sketch (sketch-wave-2-mobile-shell.html, main 머지)
    - W3 sketch (sketch-wave-3-staff-card-grid.html, main 머지)
    - W4 sketch (sketch-wave-4-login-form.html, main 머지)
    - W5 checklist (wave-5-tsx-conversion-checklist.md, source of truth)
    - W1 OQ #1~#5 LOCKED (wave-1-index.md §7)
  provides:
    - LoginPage.tsx v0.1.1 토큰 + OQ 5건 LOCKED 1:1 반영
    - redesign/27-login 트랙 TSX 변환 wave 완결
  affects:
    - cha-bio-safety/src/pages/LoginPage.tsx (in-place 수정)
tech_stack:
  added: []
  patterns:
    - Tailwind v0.1.1 className (surface/text/border/safe-bar) 1:1 매핑
    - 인라인 px arbitrary value (w-[38px]/[34px]/[28px], rounded-[11px]/[10px]/[7px])
    - text-caption + leading-none (작은 컨테이너)
    - text-caption + leading-relaxed (footer 멀티라인)
    - inputStyle 객체 분해 (className + 인라인 style 분리)
    - CARD_COLORS rgba 인라인 verbatim 보존 (OQ #2 LOCKED)
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/LoginPage.tsx (220 → 223 lines, +38 / -35)
decisions:
  - "OQ #1 LOCKED 그대로 적용 — 로그인 버튼 linear-gradient 인라인 완전 폐기, className bg-safe-bar solid + text-text-on-accent + font-bold 통일"
  - "OQ #2 LOCKED 그대로 적용 — CARD_COLORS 6 rgba 인라인 상수 1 byte 변경 0 + isSelected variant 인라인 rgba(59,130,246,*) + initial bg #2563eb 인라인 유지"
  - "OQ #3 LOCKED 그대로 적용 — fontSize 인라인 9·10·11 → text-caption(12)/text-label(13) 토큰 격상. 타이틀 16 → text-body."
  - "OQ #4 LOCKED 그대로 적용 — show/hide 토글 '표시'/'숨김' 텍스트 유지 (lucide-react import 0건) + footer ☎ U+260E 1건 유지"
  - "OQ #5 LOCKED 그대로 적용 — 38/28/34 어떤 값도 w-8 토큰 X. 인라인 w-[Npx] / rounded-[Npx] arbitrary 만"
  - "inputStyle 객체 분해 결정 — className 상수 inputClass + 인라인 객체 inputInline 으로 분리. 비밀번호 input 은 paddingRight:44 인라인 명시 (spread 패턴 폐기)."
metrics:
  duration: ~15분
  task_count: 1
  file_count: 1
  lines_before: 220
  lines_after: 223
  delta_lines: +38 / -35
---

# Phase 260521-gox Plan 01: redesign/27-login TSX 변환 (LoginPage.tsx 220 lines 단일 atomic) Summary

LoginPage.tsx 220 lines in-place 변환 — W2/W3/W4 sketch + W5 checklist + OQ 5건 LOCKED 결정을 단일 atomic 1-commit 으로 적용. 옛 alias `var(--bg|bg2|bg3|bd|bd2|t1|t2|t3)` 0건 + linear-gradient 0건 + 비즈 로직 0 diff.

## Atomic commit

- `e8e57df` `feat(27-login): TSX 변환 — LoginPage v0.1.1 토큰 적용 (W5 checklist + OQ 5건 LOCKED)`
- Branch: `redesign/27-login-tsx` (main 머지 대기, 사용자 컨펌 후 머지)
- Diff stat: 1 file changed, 38 insertions(+), 35 deletions(-)

## 변환 전후

| 지표 | 변환 전 | 변환 후 |
|---|---|---|
| `wc -l LoginPage.tsx` | 220 | 223 |
| `linear-gradient` 카운트 | 1 (line 157) | 0 |
| `var(--bg\|bg2\|bg3\|bd\|bd2\|t1\|t2\|t3\|acl\|accent)` 카운트 | 11+ | 0 |
| `fontSize: 9·10·11` 카운트 | 6 (라벨/role/title/footer/서브 모/데) | 0 |
| `bg-safe-bar` 카운트 | 0 | 1 |
| `w-[Npx]` 인라인 카운트 | 0 | 5 |
| `rounded-[Npx]` arbitrary 카운트 | 0 | 5 |
| `text-text-*` 토큰 카운트 | 0 | 16 |
| `bg-surface-*` 토큰 카운트 | 0 | 7 |
| `border-border-*` 토큰 카운트 | 0 | 5 |
| `lucide-react` import | 0 | 0 |
| `☎` (U+260E) 카운트 | 1 | 1 |

## 적용된 v0.1.1 토큰 className 목록 (grep 카운트)

| className | 카운트 | 위치 (의도) |
|---|---|---|
| `bg-surface-page` | 2 | 모바일 외곽 wrapper + 데스크톱 외곽 wrapper |
| `bg-surface-raised` | 5 | 모바일 헤더 + 데스크톱 카드 + 데스크톱 카드 헤더 + 카드 그리드 컨테이너 + 폼 컨테이너 |
| `bg-surface-sunken` | (input className 안 inputClass) | 사번/비밀번호 input 2회 + 로그인 버튼 disabled state 1회 (className 표현식) |
| `border-border-default` | 5 | 모바일 헤더 border-b + 데스크톱 카드 border + 데스크톱 카드 헤더 border-b + 카드 그리드 컨테이너 border + 폼 컨테이너 border |
| `border-border-strong` | (input className) | input 2회 |
| `text-text-primary` | (inner text + input) | 타이틀 모/데 + 카드 이름 + input |
| `text-text-secondary` | 2 | 사번/비밀번호 label |
| `text-text-tertiary` | 6 | 서브 모/데 + 라벨 + role/title + footer + show/hide 토글 + 로그인 disabled (className 표현식) |
| `text-text-on-accent` | 1 | 로그인 버튼 default (className 표현식) |
| `bg-safe-bar` | 1 | 로그인 버튼 default (className 표현식) — OQ #1 LOCKED |
| `text-caption` | 5 | 서브 모/데 + 라벨 "담당자 선택" + role/title + footer |
| `text-label` | 3 | 사번 label + 비밀번호 label + 카드 이름 |
| `text-body` | 3 | 타이틀 모/데 + staff initial span |
| `leading-none` | 6 | 서브 모/데 + 라벨 + role/title + 카드 이름 + staff initial |
| `leading-relaxed` | 1 | footer (멀티라인) |
| `w-[38px]` / `h-[38px]` / `rounded-[11px]` | 2 / 2 / 2 | 로고 박스 모/데 |
| `w-[28px]` / `h-[28px]` / `rounded-[7px]` | 2 / 2 / 2 | 로고 img 모/데 |
| `w-[34px]` / `h-[34px]` / `rounded-[10px]` | 1 / 1 / 1 | staff initial |

**Total v0.1.1 token className 매칭** (pos1 grep): **20**

## OQ #1~#5 LOCKED 적용 결과

### OQ #1 — 로그인 버튼 그라데이션 완전 폐기 ✅
- before: `background: loading ? 'var(--bg3)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)'` + `color:'#fff'` + `fontWeight:700` 인라인
- after: `className={loading ? 'bg-surface-sunken text-text-tertiary font-bold' : 'bg-safe-bar text-text-on-accent font-bold'}` + 인라인은 padding/borderRadius/border/fontSize/cursor/transition/marginTop 만
- verify: `linear-gradient` 0건 / `bg-safe-bar` 1건 / `text-text-on-accent` 1건 ✅

### OQ #2 — CARD_COLORS 인라인 verbatim 보존 ✅
- before/after: CARD_COLORS line 21~28 6 rgba 상수 1 byte 변경 0
- isSelected variant: `border: 1px solid ${isSelected ? 'rgba(59,130,246,0.6)' : c.border}` + `background: isSelected ? 'rgba(59,130,246,0.12)' : c.color` 인라인 유지
- staff initial isSelected bg: `'#2563eb'` 인라인 유지 (sub-variant A)
- verify: `rgba(245,158,11` ≥1 ✅

### OQ #3 — 폰트 격상 매핑 ✅
- "담당자 선택" 10px → `text-caption font-bold uppercase tracking-wider text-text-tertiary leading-none`
- 카드 이름 13px → `text-label font-bold text-text-primary leading-none`
- 카드 role/title 10px → `text-caption text-text-tertiary leading-none`
- 사번/비밀번호 label 11px → `text-label font-bold leading-none text-text-secondary` (2회)
- footer 11px → `text-caption leading-relaxed text-text-tertiary`
- 서브 11px → `text-caption text-text-tertiary leading-none` (모/데 2회)
- 타이틀 16px → `text-body font-bold text-text-primary` (모/데 2회)
- verify: `fontSize: 9|10|11` 인라인 0건 / `text-caption` 5건 / `text-label` 3건 / `text-body` 3건 ✅

### OQ #4 — show/hide 텍스트 + ☎ 유지 ✅
- line 151: `{showPw ? '숨김' : '표시'}` 그대로 유지 (Lucide Eye/EyeOff 0)
- line 175: "문의: 방재팀 내선 ☎ 031-881-7119" ☎ U+260E 1건 유지
- import 문 변경 0 — `lucide-react` 0건
- verify: `'표시'` 1건 + `'숨김'` 1건 + `☎` 1건 + `lucide-react` 0건 ✅

### OQ #5 — 인라인 px 사이즈 ✅
- 로고 박스 (모/데 2회): `w-[38px] h-[38px] rounded-[11px]` 인라인 — 토큰 `w-8` 사용 0건
- 로고 img (모/데 2회): `w-[28px] h-[28px] rounded-[7px]` 인라인
- staff initial (1회): `w-[34px] h-[34px] rounded-[10px]` 인라인
- verify: `w-[38|34|28]px` 5건 / `rounded-[11|10|7]px` 5건 / `w-8` 0건 / `h-8` 0건 ✅

## Verify 결과

### Negative gate 7건 (W5 §5) — ALL PASS

```
neg1 emoji-except-☎: 0   ✅
neg2 linear-gradient:  0  ✅
neg3 fontSize 9/10/11: 0  ✅
neg4 status- prefix:   0  ✅
neg5 w-8/h-8:          0  ✅
neg6 var(--alias):     0  ✅
neg7 lucide-react:     0  ✅
```

### Positive gate 6건 (W5 §6) — ALL PASS

```
pos1 v0.1.1 tokens:  20  (≥3)  ✅
pos2 w-[Npx]:         5  (≥3)  ✅
pos3 rounded-[Npx]:   5  (≥3)  ✅
pos4 bg-safe-bar:     1  (≥1)  ✅
pos5 표시/숨김:        1 line (각 1건씩 ≥1)  ✅
pos6 ☎:               1  (≥1)  ✅
```

**참고:** pos5 verify 스크립트 `grep -cE '표시|숨김'` 는 줄 카운트라 1 (한 줄 안에 두 텍스트 모두 존재 `{showPw ? '숨김' : '표시'}`). 실제 OQ #4 LOCKED 의도(두 텍스트 각각 ≥1)는 별도 grep `grep -o '표시' | wc -l` = 1, `grep -o '숨김' | wc -l` = 1 로 모두 만족.

### 비즈 로직 보존 9건 sample — ALL PASS

```
biz1 useMediaQuery:        2  ✅
biz2 CARD_COLORS:          2  ✅
biz3 authApi.login:        1  ✅
biz4 staff-list fetch:     1  ✅
biz5 useAuthStore:         2  ✅
biz6 pwRef:                4  ✅
biz7 selectStaff:          2  ✅
biz8 handleSubmit:         3  ✅
biz9 CARD_COLORS amber:    1  ✅
```

**Logic-line diff 카운트** (handler/state/effect/hook/fetch/navigate): **0** ✅
- `git diff HEAD~1 HEAD | grep -cE '^[+-]\s*(useState|useEffect|useRef|useNavigate|useAuthStore|authApi\.login|fetch\(|setStaffId|setPassword|setShowPw|setLoading|setSelected|setStaffList|handleSubmit|selectStaff|pwRef|useMediaQuery|navigate\(|toast\.|login\(res)'` → 0

### Scope — single file ✅

```
git diff --name-only HEAD~1 HEAD
→ cha-bio-safety/src/pages/LoginPage.tsx (1 파일만)
```

- App.tsx / tailwind.config.js / tokens.css / typography.css / functions/ / templates/ / migrations/ 모두 변경 0
- 이 워크트리 룰 (CLAUDE.local.md): wrangler 명령 0건 / `npm run deploy` 0건 ✅

### Line count sanity ✅

- before: 220 lines
- after: 223 lines (220 ± 30 OK)

### Build gate ✅

```
$ cd cha-bio-safety && npm run build
✓ 87 modules transformed.
✓ built in 13.68s (Vite)
✓ built in 169ms (PWA sw.ts)
EXIT: 0
```

- LoginPage chunk: `dist/assets/LoginPage-CDVrIHYt.js` 7183 bytes
- tsc 0 errors (vite-plugin 통합, 본 빌드에서 별도 에러 없음)
- 사전 존재 warning (`MODULE_TYPELESS_PACKAGE_JSON` for postcss.config.js) 만 — 본 변환 무관

## Self-Check: PASSED

- [x] LoginPage.tsx 변경: `cha-bio-safety/src/pages/LoginPage.tsx` exists, 223 lines
- [x] Commit hash `e8e57df` exists in git log (HEAD)
- [x] SUMMARY.md 작성 위치 정확: `.planning/quick/260521-gox-redesign-27-login-tsx-loginpage-tsx-220-/260521-gox-SUMMARY.md`

```bash
$ git log --oneline -1
e8e57df feat(27-login): TSX 변환 — LoginPage v0.1.1 토큰 적용 (W5 checklist + OQ 5건 LOCKED)
```

## Deviations from Plan

None — plan 의 W5 §3 매핑 표 / §4 OQ LOCKED 5건 / §5 negative + §6 positive + §7 build gate 1:1 적용. 인라인 잔존 항목 (padding/borderRadius/fontSize 14/cursor/transition 등 토큰 없는 값) 은 W5 §3 표가 명시한 대로 인라인 유지.

`inputStyle` 객체 (line 74~79) 는 PLAN 의 §3.3 + §10.1 지침대로 분해 — `inputClass` 상수 (className) + `inputInline` 객체 (style) 로 분리. 비밀번호 input 의 spread `{...inputStyle, paddingRight:44}` 패턴은 별도 인라인 객체 `style={{ padding:'12px 44px 12px 14px', ... }}` 로 평탄화 (paddingRight 44 → padding 약식 표기). 이는 PLAN.md line 248 의 "padding:'12px 44px 12px 14px'" 표기와 동일 — logic 변경 0.

## 다음 단계

1. **사용자 시각 검수 (대기)** — 본 변환 결과를 사용자가 컨펌 (cbc7119-design 워크트리 룰: 디자인 wave 는 wrangler/배포 금지, 사용자 명시 컨펌 후에만 main 머지)
2. **main 머지** (사용자 명시 컨펌 후) — `redesign/27-login-tsx` → `main`
3. **GitHub Actions 자동 배포** — `cbc7119-preview.pages.dev` (디자인 도메인 한정)
4. **직원 도메인 (cbc7119) 배포는 별도 worktree (20260328) 담당** — 본 워크트리에서는 절대 다루지 않음

## 시각 검수 포인트

- 모바일 viewport (375×812 iPhone 13 mini): 모바일 외곽 wrapper 분기 — `bg-surface-page` + 헤더 `bg-surface-raised border-b border-border-default`
- 데스크톱 viewport (≥768): `bg-surface-page` 외곽 + 카드 `maxWidth:420 bg-surface-raised border border-border-default` + 헤더 `bg-surface-raised border-b border-border-default`
- 로그인 버튼 default = solid `bg-safe-bar` (그라데이션 0, 단일 색)
- 로그인 버튼 disabled = `bg-surface-sunken` + `text-text-tertiary`
- 직원 카드 6개 amber/green/blue/violet/pink/teal rgba 인라인 시각 유지
- 선택 카드 isSelected = 파란 border `rgba(59,130,246,0.6)` + 옅은 파란 bg `rgba(59,130,246,0.12)` + initial 진한 `#2563eb`
- show/hide 토글 = "표시" / "숨김" 텍스트 (lucide 아이콘 X)
- footer = `☎` U+260E 글리프 유지, `text-caption leading-relaxed text-text-tertiary`
- 노안 친화 → 라벨/role/footer 모두 12~13px (이전 9~11 격상)

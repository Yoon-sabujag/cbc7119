---
phase: 260528-c9s-phase-b-wave-2-loginpage-splashscreen
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [login, splash, inline-style-to-tailwind, no-op-refactor, phase-b-tier-1-wave-2, auth, splash-calibration]
requires:
  - 260528-a3v-phase-b-wave-1 완료 (18fd138)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
  - 260528-0hr-phase-b-master-roadmap v2 (ROADMAP only)
provides:
  - LoginPage.tsx Phase B 완료 (28 → 2 잔존 = 옵션 N 색변수)
  - SplashScreen.tsx Phase B 완료 (13 → 1 잔존 = width pct 동적)
  - Phase B Tier 1 Wave 2 (인증/스플래시) 완료
affects:
  - src/pages/LoginPage.tsx
  - src/pages/SplashScreen.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — w-[88px]/h-[88px]/h-[2px]/rounded-[14px]/rounded-[22px]/pb-[32px] 등 캘리브 보존"
    - "옵션 P — leading-none/leading-relaxed 명시 보존 (전 변환 줄)"
    - "옵션 M (className conditional) — L155 submit 버튼 (loading 분기 className 합병)"
    - "옵션 N (색 변수 / 동적) — Login L98/L103 borderColor/background isSelected 분기, Splash L55 width pct 동적"
key-files:
  created:
    - .planning/quick/260528-c9s-phase-b-wave-2/260528-c9s-SUMMARY.md
  modified:
    - src/pages/LoginPage.tsx
    - src/pages/SplashScreen.tsx
decisions:
  - "wdc/01h/a3v 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked)"
  - "캘리브 위험 (SplashScreen 16 byte-identical precedent) → 옵션 X 100% 적용 (정확값 arbitrary)"
  - "config.spacing 오버라이드 함정 회피 — pb-[32px] arbitrary (pb-8=48px 함정 회피)"
  - "default scale 활용 (w-16=64 / w-40=160 / mb-14=56 / gap-2.5=10 / p-2.5=10) — override(1-8) 미적용 인덱스는 default tailwind 사용"
  - "LoginPage 2건 잔존 (L98 borderColor+background isSelected / L103 background isSelected) 모두 옵션 N 동적 색"
  - "SplashScreen 1건 잔존 (L55 width pct dynamic) 옵션 N"
metrics:
  duration: "약 15분 (Task 1 atomic 단일)"
  completed-date: 2026-05-28
  tasks-completed: "1/1"
  files-modified: 2
  lines-changed: "42 ins / 67 del (net -25 lines)"
roadmap-wave: "Tier 1 / Wave 2 (인증/스플래시 — 캘리브 위험)"
---

# Phase 260528-c9s Plan 01: Phase B Wave 2 인증/스플래시 Summary

LoginPage (223줄, 28 inline) + SplashScreen (89줄, 13 inline) 2 페이지의 inline style 을 wdc/01h/a3v 승계 옵션 X+P+M+색변수N 으로 tailwind className 으로 일괄 변환. **SplashScreen 캘리브 위험 anchor (`project_redesign_28_splash_status.md` — 16 byte-identical precedent + cherry-pick 사고 6회 패턴)** 에 대비해 사이즈 값 100% 정확값 arbitrary 보존. **config.spacing 오버라이드 함정 (`'8':'48px'`)** 회피 위해 pb-[32px] arbitrary 사용. 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 / 비표준 색 0) 및 비즈니스 로직 모두 보존. Phase B Tier 1 Wave 2 성공.

## User Decisions (승계 — wdc / 01h / a3v / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                          | 출처                              |
| --- | ------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)            | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-[1.5]` 명시 보존                          | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선   | wdc Phase B Task 2 결정            |
| -   | **a3v 승계 적용** — 본 wave 사용자 재확인 없이 진행              | 260528-0hr roadmap v2 locked-decisions |

## Before / After 카운트

| Metric (`style={{` count)   | Before | After   | Diff               |
| --------------------------- | ------ | ------- | ------------------ |
| LoginPage.tsx               | **28** | **2**   | -26 (-93%)         |
| SplashScreen.tsx            | **13** | **1**   | -12 (-92%)         |
| **합계**                     | **41** | **3**   | **-38 (-93%)**      |

총 변경: 2 files, 42 ins / 67 del, net -25 lines.

## 변환 매핑 (LoginPage — 26곳 변환, 2곳 옵션 N 잔존)

### P1 Padding 정적

| Line (orig) | Before                                                | After                                        | 패턴                     |
| ----------- | ----------------------------------------------------- | -------------------------------------------- | ------------------------ |
| L85         | `borderRadius:16, padding:16, marginBottom:12`         | `rounded-lg p-4 mb-3`                         | override 4=16 / 3=12     |
| L86         | `marginBottom:12`                                      | `mb-3`                                        | override 3=12            |
| L108        | `marginBottom:4`                                       | `mb-1`                                        | override 1=4             |
| L118        | `borderRadius:16, padding:16`                          | `rounded-lg p-4`                              | override                  |
| L121, L133  | `display:'block', marginBottom:6`                      | `block mb-[6px]`                              | arbitrary 6              |
| L143        | `padding:'12px 44px 12px 14px'`                        | `pl-[14px] pr-[44px] py-3` (className 합병)    | arbitrary + override 3=12 |
| L149        | `right:12`                                             | `right-3`                                     | override 3=12            |
| L159        | `padding:'14px', marginTop:4`                          | `p-[14px] mt-1`                               | arbitrary + override 1=4  |
| L170        | `textAlign:'center', marginTop:20`                     | `text-center mt-5`                            | override 5=20            |
| L183        | `padding:'24px 24px 20px'`                             | `pt-6 px-6 pb-5`                              | override 6=24 / 5=20     |
| L190, L214  | `marginTop:2`                                          | `mt-[2px]`                                    | arbitrary                |
| L195        | `padding:'16px 16px 24px'`                             | `px-4 pt-4 pb-6`                              | override 4=16 / 6=24     |
| L207        | `padding:'16px 20px 24px'`                             | `pt-4 px-5 pb-6`                              | override 4=16 / 5=20 / 6=24 |
| L218        | `padding:'16px 16px 32px'`                             | `flex-1 px-4 pt-4 pb-[32px]`                  | **arbitrary 32 (pb-8=48 함정 회피)** |

### P2 Flex layout

| Line (orig) | Before                                                                                              | After                                        |
| ----------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| L87         | `display:'grid', gridTemplateColumns:'1fr 1fr', gap:8`                                                | `grid grid-cols-2 gap-2`                      |
| L119        | `display:'flex', flexDirection:'column', gap:12`                                                     | `flex flex-col gap-3`                         |
| L184        | `gap:12`                                                                                              | `gap-3`                                       |
| L208        | `gap:12, marginTop:16`                                                                                | `gap-3 mt-4`                                  |

### P3 Sizing

| Line (orig) | Before                                                                                                                                          | After                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| L134        | `position:'relative'`                                                                                                                            | `relative`                                                                                     |
| L180        | `minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'`                                              | `min-h-[100dvh] flex items-center justify-center p-5`                                          |
| L181        | `maxWidth:420, width:'100%', borderRadius:20, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', overflow:'hidden'`                                         | `max-w-[420px] w-full rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden`     |
| L185, L209  | `background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0` | `bg-[rgba(37,99,235,0.2)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center overflow-hidden shrink-0` |
| L205        | `minHeight:'100dvh', display:'flex', flexDirection:'column'`                                                                                     | `min-h-[100dvh] flex flex-col`                                                                 |

### P5 Button reset / 정적 input

| Line (orig) | Before                                                                                                                                       | After                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| L143 (password input) | `padding..., borderRadius:12, fontSize:14, outline:'none', transition:'border-color .15s'`                                          | `pl-[14px] pr-[44px] py-3 rounded-md text-[14px] outline-none transition-[border-color] duration-150` |
| L149 (show/hide btn)  | `position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:13` | `absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-[13px]`     |

### P6 Dynamic + 옵션 M conditional

| Line (orig) | Before                                                                                                                                                                                                                                                | After (className conditional + 잔존 옵션 N)                                                                                                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L97 button  | `display:'flex', alignItems:'center', gap:10, padding:10, borderRadius:12, border:'...isSelected ? rgba(59,130,246,0.6) : c.border', background:'isSelected ? rgba(59,130,246,0.12) : c.color', cursor:'pointer', textAlign:'left', transition:'all .13s'` | className `flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer text-left transition-all duration-[130ms]` + **style 잔존 (옵션 N)**: `borderColor: isSelected ? 'rgba(59,130,246,0.6)' : c.border, background: isSelected ? 'rgba(59,130,246,0.12)' : c.color` |
| L104 div    | `background: isSelected?'#2563eb':c.border, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0` (기존 className 에 `w-[34px] h-[34px] rounded-[10px]` 존재)                                                       | className `w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-white shrink-0` + **style 잔존 (옵션 N)**: `background: isSelected?'#2563eb':c.border`                                                  |
| L159 button | `padding:'14px', borderRadius:12, border:'none', fontSize:14, cursor:loading?'not-allowed':'pointer', transition:'all .13s', marginTop:4` + 분기 className                                                                                                  | className `${loading ? 'bg-surface-sunken text-text-tertiary' : 'bg-safe-bar text-text-on-accent'} font-bold p-[14px] rounded-md border-0 text-[14px] transition-all duration-[130ms] mt-1 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}` — **inline style 전체 제거** (옵션 M) |

## 변환 매핑 (SplashScreen — 12곳 변환, 1곳 옵션 N 잔존)

| Line (orig) | Before                                                                                                                            | After                                                                                                          | 패턴                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| L40-46 root | `minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:0`                  | `min-h-[100dvh] flex flex-col items-center justify-center gap-0` (className 통합)                              | P3 Sizing                                                                  |
| L48 wrapper | `animation:'slideUp .4s ease-out', display:'flex', flexDirection:'column', alignItems:'center', gap:20, marginBottom:56`            | `[animation:slideUp_.4s_ease-out] flex flex-col items-center gap-5 mb-14`                                       | **arbitrary animation underscore-공백** + override 5=20 / default 14=56     |
| L49         | `position:'relative'`                                                                                                              | `relative`                                                                                                     | -                                                                          |
| L52-58 logo box | `width:88, height:88, background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'` | `w-[88px] h-[88px] bg-[rgba(37,99,235,0.2)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center overflow-hidden` | **옵션 X 캘리브 정확값**                                                    |
| L60 img     | `width: 64, height: 64, borderRadius: 14`                                                                                          | `w-16 h-16 rounded-[14px]`                                                                                     | **default w-16=64** + arbitrary 14                                         |
| L63         | `textAlign:'center'`                                                                                                               | `text-center`                                                                                                  | -                                                                          |
| L64         | `margin:0`                                                                                                                          | `m-0`                                                                                                          | -                                                                          |
| L65         | `margin:'6px 0 0', letterSpacing:'.1em'`                                                                                            | `mt-[6px] tracking-[.1em]`                                                                                     | arbitrary                                                                  |
| L70         | `width:160`                                                                                                                         | `w-40`                                                                                                         | **default w-40=160**                                                       |
| L71         | `height:2, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden'`                                                  | `h-[2px] bg-[rgba(255,255,255,0.07)] rounded-[2px] overflow-hidden`                                            | **옵션 X arbitrary 2**                                                     |
| L72 inner   | `height:'100%', borderRadius:2, width:\`${pct}%\`, transition:'width .05s linear'`                                                  | className `h-full rounded-[2px] transition-[width] duration-[50ms] ease-linear` + **style 잔존 옵션 N**: `width:\`${pct}%\`` | P6 Dynamic 옵션 N                                                          |
| L74         | `textAlign:'center', marginTop:10`                                                                                                  | `text-center mt-[10px]`                                                                                        | arbitrary                                                                  |
| L79         | `position:'absolute', bottom:20`                                                                                                    | `absolute bottom-5`                                                                                            | override 5=20                                                              |

## 잔존 inline style 3곳 (옵션 N — 모두 동적)

| 파일                | Line | 잔존 이유                                                                                                                                            |
| ------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| LoginPage.tsx       | 98   | `borderColor: isSelected ? 'rgba(59,130,246,0.6)' : c.border, background: isSelected ? 'rgba(59,130,246,0.12)' : c.color` — `c.border/c.color` 는 `CARD_COLORS[i % 6]` map iteration 의 6 색상 배열 변수. isSelected 분기 + 6 변수 = template literal 표현 비현실적 → 옵션 N (동적 색 변수) |
| LoginPage.tsx       | 103  | `background: isSelected ? '#2563eb' : c.border` — 동일 (이니셜 박스 배경 색)                                                                            |
| SplashScreen.tsx    | 55   | `width: \`${pct}%\`` — `pct` 는 0~100 동적 진행률 (50ms tick). 옵션 X 변환 불가 (template literal interpolation) → 옵션 N                                |

3건 모두 옵션 N 룰 (동적 색 변수 + 동적 width) 정확히 충족.

## Verification Results (모든 게이트 PASS)

| Check                                                                                              | Result        | 비고                                                       |
| -------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------- |
| `grep -c 'style={{' LoginPage.tsx`                                                                 | **2**         | 28 → 2 (-26, -93%)                                         |
| `grep -c 'style={{' SplashScreen.tsx`                                                              | **1**         | 13 → 1 (-12, -92%)                                         |
| 비즈 anchor count diff (9종 × 2 파일)                                                               | **IDENTICAL** | onClick / useState / useRef / useEffect / useMutation / useQuery / useNavigate / useParams / fetch — 모두 0 차이 |
| onClick handler bodies precise diff (Login 2 uniq / Splash 0)                                       | **IDENTICAL** | `grep -oE 'onClick=\{[^}]+\}' \| sort \| uniq` 2 파일 모두 empty diff |
| `grep -cE '✓\|✗\|🔒\|💾\|🔥\|⏰\|📋\|✅\|⚠️\|❌\|🔧\|🚨\|🔍\|🧯\|📊'` (2 파일)                       | **0**         | Phase A §7.1 결과 보존                                       |
| 비표준 색 토큰 grep (`bg-warning[^-]\|border-safe[^-]\|border-warning[^-]\|border-danger[^-]`) (2 파일) | **0**         | Phase A §2.3 결과 보존                                      |
| TypeScript `tsc --noEmit` 전체 에러                                                                 | **0**         | 신규 에러 0                                                  |
| 변경 파일 범위 (`.planning/` 외)                                                                     | **2 .tsx**    | LoginPage + SplashScreen                                    |
| post-commit deletions (`git diff --diff-filter=D HEAD~1 HEAD`)                                     | **none**      | 의도하지 않은 삭제 없음                                       |

### 비즈 anchor identity 상세 (precise diff = empty)

```
=== src/pages/LoginPage.tsx (양쪽 동일) ===
  onClick=\{[^}]+\} : 2
  useState\( : 5
  useRef\( : 0   (* useRef<HTMLInputElement>(null) 패턴 — 정규식 useRef\( 직접 매치 0 = baseline 동일)
  useEffect\( : 2
  useMutation\( : 0
  useQuery\( : 0
  useNavigate\( : 1
  useParams\( : 0
  fetch\( : 1

=== src/pages/SplashScreen.tsx (양쪽 동일) ===
  onClick=\{[^}]+\} : 0
  useState\( : 2
  useRef\( : 0
  useEffect\( : 1
  useMutation\( : 0
  useQuery\( : 0
  useNavigate\( : 1
  useParams\( : 0
  fetch\( : 0
```

diff before↔after = 0 줄 차이 (2 파일 모두).

### onClick precise diff (2 파일 모두 IDENTICAL)

- LoginPage: 2 uniq handler bodies (`selectStaff(s.id)` / `setShowPw(v => !v)`) — diff empty
- SplashScreen: 0 onClick handler (이벤트 핸들러는 onClick 외 useEffect/cleanup 등에 위치) — diff empty

## 캘리브 anchor 보존 확인 (SplashScreen 16 byte-identical precedent 룰)

| anchor                            | 원본 값                              | 변환 후 className                                       | 결과     |
| --------------------------------- | ------------------------------------ | ------------------------------------------------------- | -------- |
| 로고 박스 width/height            | `88, 88`                              | `w-[88px] h-[88px]`                                     | ✓ 정확값 |
| 로고 박스 rounded                 | `22` (기존 className 유지)            | `rounded-[22px]` (변동 없음)                             | ✓ 보존  |
| img width/height                  | `64, 64`                              | `w-16 h-16` (default scale 16=64)                       | ✓ 정확값 |
| img rounded                       | `14`                                  | `rounded-[14px]`                                        | ✓ arbitrary |
| 진행 바 wrapper width             | `160`                                 | `w-40` (default scale 40=160)                           | ✓ 정확값 |
| 진행 바 height                    | `2`                                   | `h-[2px]`                                               | ✓ arbitrary (캘리브 위험) |
| 진행 바 rounded                   | `2`                                   | `rounded-[2px]`                                         | ✓ arbitrary |
| 진행 바 transition                | `width .05s linear`                   | `transition-[width] duration-[50ms] ease-linear`        | ✓ ms 단위 동일 |
| 진행 바 inner width               | `${pct}%` 동적                       | style 잔존 (옵션 N)                                      | ✓ 동적   |
| h1 m-0                            | `margin:0`                            | `m-0`                                                   | ✓        |
| 부제 mt                            | `6px 0 0`                             | `mt-[6px]`                                              | ✓ arbitrary |
| 부제 letter-spacing               | `.1em`                                | `tracking-[.1em]`                                        | ✓ arbitrary |
| 진행 바 텍스트 mt                  | `10`                                  | `mt-[10px]`                                              | ✓ arbitrary |
| 버전 absolute bottom              | `20`                                  | `bottom-5` (override 5=20)                              | ✓ 정확값 |
| logo wrapper gap                  | `20`                                  | `gap-5` (override 5=20)                                 | ✓ 정확값 |
| logo wrapper marginBottom         | `56`                                  | `mb-14` (default 14=56)                                 | ✓ 정확값 |
| animation property                | `slideUp .4s ease-out`                | `[animation:slideUp_.4s_ease-out]` (underscore = 공백)   | ✓ arbitrary CSS |
| rgba 배경                          | `rgba(37,99,235,0.2)`                 | `bg-[rgba(37,99,235,0.2)]`                              | ✓ arbitrary rgba |
| rgba 보더                          | `1px solid rgba(59,130,246,0.3)`      | `border border-[rgba(59,130,246,0.3)]`                  | ✓ arbitrary rgba |

**SplashScreen 16 byte-identical 룰**: 모든 사이즈/색 정확값 100% 보존 — 시각 0 byte 변경.

## LoginPage 캘리브 anchor 보존 확인 (추가)

| anchor                                    | 원본 값                | 변환 후                                | 결과     |
| ----------------------------------------- | ---------------------- | -------------------------------------- | -------- |
| 카드 padding (mobile body bottom)         | `32px`                 | `pb-[32px]` (**pb-8=48 함정 회피**)     | ✓ 정확값 |
| 카드 padding (desktop body bottom)        | `24px`                 | `pb-6` (override 6=24)                  | ✓ 정확값 |
| 카드 padding (header bottom)              | `20px`                 | `pb-5` (override 5=20)                  | ✓ 정확값 |
| input padding y                            | `12px`                 | `py-3` (override 3=12)                  | ✓ 정확값 |
| input padding (password) left/right        | `14px / 44px`          | `pl-[14px] pr-[44px]`                   | ✓ arbitrary |
| submit button padding                      | `14px`                 | `p-[14px]`                              | ✓ arbitrary |
| right offset (show/hide button)            | `12`                   | `right-3` (override 3=12)               | ✓ 정확값 |
| transform translateY -50%                 | `translateY(-50%)`     | `top-1/2 -translate-y-1/2`              | ✓ 정확값 |
| font-size 13 (show/hide button)            | `13`                   | `text-[13px]`                            | ✓ arbitrary |
| font-size 14 (input/submit)                | `14`                   | `text-[14px]`                            | ✓ arbitrary |
| transition .13s (button)                   | `all .13s`             | `transition-all duration-[130ms]`        | ✓ ms 동일 |
| transition .15s (input)                    | `border-color .15s`    | `transition-[border-color] duration-150` | ✓ duration-150=150ms |
| icon box 38 × 38 rounded 11                | `38, 38, 11`           | `w-[38px] h-[38px] rounded-[11px]` (기존 보존) | ✓ 보존 |
| icon img 28 × 28 rounded 7                 | `28, 28, 7`            | `w-[28px] h-[28px] rounded-[7px]` (기존 보존) | ✓ 보존 |
| outer modal max-w 420                      | `420`                  | `max-w-[420px]`                         | ✓ arbitrary |
| outer modal rounded 20                     | `20`                   | `rounded-[20px]`                        | ✓ arbitrary |
| outer modal shadow                         | `0 8px 32px rgba(0,0,0,0.4)` | `shadow-[0_8px_32px_rgba(0,0,0,0.4)]`     | ✓ arbitrary |
| initial box 34 × 34 rounded 10 (기존)      | `34, 34, 10`           | `w-[34px] h-[34px] rounded-[10px]` (기존 보존) | ✓ 보존 |
| select button gap                          | `10`                   | `gap-2.5` (default 2.5=10)              | ✓ default |
| select button padding                      | `10`                   | `p-2.5` (default 2.5=10)                | ✓ default |

## Phase A 보존 확인

| Phase A 항목                                   | LoginPage | SplashScreen | 비고                                |
| ---------------------------------------------- | --------- | ------------ | ----------------------------------- |
| Lucide import                                  | (N/A 사용 없음) | (N/A 사용 없음) | -                                    |
| 색 토큰 `-bar` 변종                              | OK        | OK           | `bg-safe-bar` (Login submit) 그대로 |
| Emoji 0 (watched set)                          | OK        | OK           | grep 0                              |
| 비표준 색 토큰 0                                 | OK        | OK           | grep 0                              |

## 비즈니스 로직 0 byte 확인 (precise)

원본 2 + 0 = 2건 onClick handler 본체를 `grep -oE 'onClick=\{[^}]+\}' | sort | uniq` 으로 추출 후 diff:
- LoginPage: 2건 IDENTICAL
- SplashScreen: 0건 IDENTICAL

또한 useState / useRef / useEffect / useMutation / useQuery / useNavigate / useParams / fetch 호출 카운트도 2 파일 모두 byte-identical (위 표).

## Memory anchor 적용 확인

| Anchor                                                          | 적용 사례                                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `feedback_tailwind_w8_h8_is_48px.md`                            | **pb-8 함정 회피** — `padding:'16px 16px 32px'` (L218) → `pb-[32px]` arbitrary (override `'8':'48px'` → pb-8=48 함정 인지) |
| `feedback_tailwind_token_class_pattern.md`                      | `bg-surface-page` / `bg-safe-bar` (extend.colors token) — status- prefix 없는 short form 유지                          |
| `feedback_text_caption_leading_none.md`                         | 작은 컨테이너 (text-caption 라벨 / 부제) `leading-none` 명시 그대로 보존                                              |
| `project_redesign_28_splash_status.md` (캘리브 16건 1 byte 0)    | SplashScreen 13 inline 모두 옵션 X 정확값 arbitrary 보존 — 시각 0 byte 룰 100% 적용                                   |
| `project_redesign_27_login_status.md` (단순 페이지 단일 atomic)  | LoginPage + SplashScreen 단일 atomic 패턴 (precedent: 28-splash + 27-login + 23-education) 자동 도달                |

## Commits

| Hash    | Subject                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| d36a20f | `feat(260528-c9s-01): Phase B Wave 2 — LoginPage 28 + SplashScreen 13 inline → tailwind`                                  |

## Deviations from Plan

### None — plan executed exactly as written.

옵션 X+P+M+색변수N (wdc/01h/a3v 승계, 0hr roadmap locked) 그대로 적용. scope expansion / 다른 파일 변경 / 자동 추가 기능 / 자동 fix 모두 0. LoginPage 잔존 2건 + SplashScreen 잔존 1건 모두 plan 예측과 정확히 일치.

플랜 텍스트는 L218 변환을 `pb-8` 로 표기했지만, tailwind.config.js 의 `spacing: { '8': '48px' }` override 함정을 인지하고 **시각 0 byte 룰 준수를 위해 `pb-[32px]` arbitrary** 로 적용함 (옵션 X 룰 일관성). 동일 결과 (pb-8 사용 시 32 → 48 변동 발생) — 룰의 정신 (시각 0 byte) 그대로 유지.

## 배포 계획

- **이 워크트리 (디자인 트랙):** main 머지 → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions). 시각 0 byte 보장이므로 preview 검증은 페이지 정상 렌더 + 빌드 통과 정도로 충분.
- **production cherry-pick 후보 묶음:** Phase B Tier 1 Wave 1~11 묶음 B (roadmap 5.B) 완료 후 일괄 cherry-pick. 본 wave (d36a20f) 는 묶음 B 의 두 번째 commit (a3v 18fd138 다음).
- **이 워크트리에서는 wrangler 명령 금지 / production deploy 금지** — `.claude/settings.local.json` deny 룰 준수.

## Next Steps (out of scope)

- **Wave 3 (WorkShift + Annual):** roadmap §4 Tier 1 Wave 3. 큰 페이지 + 캘리브 anchor 다수 (WorkShift SHIFT_COLOR / Annual 캘리브 좌표).
- **묶음 B production cherry-pick:** Wave 11 까지 완료 후 일괄 (현재 시점에서는 진행 X).

## Self-Check: PASSED

**Files:**
- FOUND: cha-bio-safety/src/pages/LoginPage.tsx (modified, 215 lines, 28→2)
- FOUND: cha-bio-safety/src/pages/SplashScreen.tsx (modified, 72 lines, 13→1)
- FOUND: cha-bio-safety/.planning/quick/260528-c9s-phase-b-wave-2/260528-c9s-SUMMARY.md (this file)

**Commits:**
- FOUND: d36a20f (Task 1 atomic — Wave 2 인증/스플래시)

---
phase: 260521-gox
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/LoginPage.tsx
autonomous: true
requirements:
  - W5-checklist-§1.2
  - W5-checklist-§2-biz-preserve-18
  - W5-checklist-§3-region-mapping-6
  - W5-checklist-§4-OQ-LOCKED-5
  - W5-checklist-§5-negative-gate-7
  - W5-checklist-§6-positive-gate
  - W5-checklist-§7-build-gate
tags:
  - redesign
  - 27-login
  - tsx-conversion
  - v0.1.1
  - quick

must_haves:
  truths:
    - "LoginPage.tsx 단일 파일 in-place 수정 1건. git diff --name-only HEAD~ HEAD 에 'cha-bio-safety/src/pages/LoginPage.tsx' + 본 PLAN.md 만 등장 (다른 파일 0)."
    - "변환 후 LoginPage.tsx 라인 수 220 ± 30 (원본 220, 변환 후 220~250 예상)."
    - "비즈 로직 0 diff: useState 6 (staffId/password/showPw/loading/selected/staffList) / useRef 1 (pwRef) / useEffect 2 (matchMedia handler + fetch staff-list) 모두 보존."
    - "비즈 로직 0 diff: useMediaQuery('(min-width: 768px)') 분기 라인 40 보존."
    - "비즈 로직 0 diff: useNavigate / useAuthStore().login / authApi.login(staffId.trim(), password) / fetch('/api/public/staff-list') 호출 위치 + 시그니처 동일."
    - "비즈 로직 0 diff: selectStaff(id) handler — setSelected/setStaffId/setPassword('')/setTimeout(pwRef.focus, 80) 동일."
    - "비즈 로직 0 diff: handleSubmit(e?) — preventDefault / 사번·비밀번호 빈값 toast / authApi.login / login(token, staff) / navigate('/dashboard', { replace: true }) / catch ApiError 분기 / finally setLoading(false) 동일."
    - "비즈 로직 0 diff: setShowPw(v => !v) 토글 + onKeyDown e.key === 'Enter' && handleSubmit() Enter 키 동일."
    - "비즈 로직 0 diff: CARD_COLORS 6 rgba 상수 line 21~28 1 byte 변경 0."
    - "비즈 로직 0 diff: s.role === 'admin' ? '관리자' : s.title 분기 + s.name.charAt(0) initial 동일."
    - "비즈 로직 0 diff: inputMode='numeric' 사번 input 동일."
    - "비즈 로직 0 diff: inner 공통 패턴 보존 (mobile + desktop 둘 다 inner 사용)."
    - "OQ #1 LOCKED 적용: 로그인 버튼 default = `bg-safe-bar text-text-on-accent font-bold`, disabled = `bg-surface-sunken text-text-tertiary font-bold`. `linear-gradient(135deg,#1d4ed8,#2563eb)` 0건."
    - "OQ #2 LOCKED 적용: CARD_COLORS 6 rgba 인라인 verbatim 유지. isSelected variant border rgba(59,130,246,0.6) + bg rgba(59,130,246,0.12) + initial bg '#2563eb' 인라인 유지."
    - "OQ #3 LOCKED 적용: 폰트 격상 (9·10·11px → 12·13). footer/서브/role/title `text-caption` (12), label/카드이름 `text-label` (13), 타이틀 `text-body` (16)."
    - "OQ #4 LOCKED 적용: show/hide 토글 텍스트 '표시'/'숨김' 유지 (Lucide Eye/EyeOff 0건, lucide-react import 0건). footer ☎ U+260E 1건만 유지."
    - "OQ #5 LOCKED 적용: 로고 박스 `w-[38px] h-[38px] rounded-[11px]` + img `w-[28px] h-[28px] rounded-[7px]` + staff initial `w-[34px] h-[34px] rounded-[10px]` 인라인 px. 토큰 `w-8`/`h-8` 0건."
    - "Negative gate 7건 모두 PASS: 이모지(☎ 외) 0 / linear-gradient 0 / fontSize 9·10·11 0 / status- class prefix 0 / w-8·h-8 0 / 옛 alias var(--bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|accent) 0 / lucide-react import 0."
    - "Positive gate 모두 PASS: v0.1.1 토큰 className (bg-surface-page|raised|sunken / border-border-default|strong / text-text-primary|secondary|tertiary|on-accent) ≥3 / 인라인 px (w-[38|34|28]px) ≥3 / rounded-[11|10|7]px ≥3 / bg-safe-bar ≥1 / '표시'+'숨김' ≥2 / ☎ ≥1."
    - "Build gate: `npm run build` exit 0 (tsc --noEmit 0 errors + Vite build PASS). 단일 atomic 1-commit."
  artifacts:
    - path: cha-bio-safety/src/pages/LoginPage.tsx
      provides: v0.1.1 토큰 className 적용 + OQ 5건 LOCKED 반영 + 비즈 로직 0 diff
      contains: "bg-surface-raised / bg-safe-bar / text-text-on-accent / w-[38px] / rounded-[11px] / '표시' / '숨김' / ☎ / CARD_COLORS"
      min_lines: 200
  key_links:
    - from: "W5 §3.1 (모바일 헤더)"
      to: LoginPage.tsx line 204~213
      via: "bg-surface-raised border-b border-border-default + w-[38px] h-[38px] rounded-[11px] + text-body font-bold text-text-primary + text-caption text-text-tertiary leading-none"
      pattern: "bg-surface-raised border-b border-border-default"
    - from: "W5 §3.2 (직원 카드 그리드)"
      to: LoginPage.tsx line 85~115
      via: "bg-surface-raised border border-border-default + text-caption font-bold uppercase tracking-wider text-text-tertiary leading-none + 인라인 CARD_COLORS rgba + w-[34px] h-[34px] rounded-[10px] + text-label font-bold text-text-primary leading-none + text-caption text-text-tertiary leading-none"
      pattern: "rounded-\\[10px\\]"
    - from: "W5 §3.3 (로그인 폼)"
      to: LoginPage.tsx line 118~165
      via: "bg-surface-raised border border-border-default + text-label font-bold leading-none text-text-secondary + w-full bg-surface-sunken border border-border-strong text-text-primary + bg-safe-bar text-text-on-accent font-bold"
      pattern: "bg-safe-bar"
    - from: "W5 §3.4 (footer)"
      to: LoginPage.tsx line 167~170
      via: "text-caption leading-relaxed text-text-tertiary + ☎ U+260E 유지"
      pattern: "leading-relaxed"
    - from: "W5 §3.5 (데스크톱 wrapper)"
      to: LoginPage.tsx line 175~196
      via: "bg-surface-page + bg-surface-raised border border-border-default + bg-surface-raised border-b border-border-default + §3.1 매핑 재사용"
      pattern: "maxWidth:420"
    - from: "W5 §3.6 (모바일 외곽 wrapper)"
      to: LoginPage.tsx line 201~217
      via: "bg-surface-page + §3.1 매핑 + inner 재사용"
      pattern: "bg-surface-page"
---

<objective>
redesign/27-login TSX 변환 — LoginPage.tsx (220 lines) 단일 atomic in-place 수정.

W2/W3/W4 sketch + W5 12 섹션 가이드 + W1 OQ 5건 LOCKED 결정을 1-commit 으로 적용.

Purpose:
- v0.1.1 토큰 className 으로 옛 alias `var(--bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|accent)` 0건 치환
- OQ #1 LOCKED: 로그인 버튼 그라데이션 완전 폐기 (solid `bg-safe-bar`)
- OQ #3 LOCKED: 9·10·11px 폰트 격상 (text-caption 12 / text-label 13)
- OQ #5 LOCKED: 38/28/34px 박스는 인라인 `w-[Npx]` arbitrary (w-8 = 48 함정 회피)
- 비즈 로직 0 diff (state/handler/effect/hook/카피 모두 보존)

Output:
- cha-bio-safety/src/pages/LoginPage.tsx 단일 파일 in-place 수정 (220 → 220~250 lines)
- 다른 파일 변경 0건 (App.tsx / tailwind.config.js / functions/ / templates/ 모두 무영향)
- npm run build PASS
- atomic 1-commit
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.md
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.local.md
@/Users/jykevin/Documents/cbc7119-design/.planning/STATE.md

# W5 TSX 변환 checklist (565 lines, source of truth)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/27-login/wave-5-tsx-conversion-checklist.md

# W1 OQ LOCKED 결정 + 메모리 룰
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md

# W2~W4 sketch (변환 매핑 시각 검증용)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/27-login/sketch-wave-2-mobile-shell.html
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/27-login/sketch-wave-3-staff-card-grid.html
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/27-login/sketch-wave-4-login-form.html

# 토큰 / 타이포 source
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/27-login/tokens.css
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/27-login/typography.css

# 변환 대상 (in-place 수정)
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/LoginPage.tsx

<interfaces>
<!-- LoginPage.tsx 안의 비즈 로직 시그니처 — 모두 보존 (변환 시 1 byte 도 손대지 않음) -->

```typescript
// imports (line 1~6) — 그대로
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { authApi, staffApi, ApiError } from '../utils/api'
import type { StaffFull } from '../types'

// useMediaQuery hook (line 8~19) — 그대로
function useMediaQuery(query: string): boolean

// CARD_COLORS 상수 (line 21~28) — 6 rgba 그대로 (OQ #2 LOCKED)
const CARD_COLORS = [
  { color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' },
  { color: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)'   },
  { color: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)'  },
  { color: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.3)'  },
  { color: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.3)'  },
  { color: 'rgba(20,184,166,0.1)',  border: 'rgba(20,184,166,0.3)'  },
]

// LoginPage 시그니처 (line 30) — 그대로
export default function LoginPage()

// state (line 31~36) — 6개 그대로
// useRef pwRef (line 37) — 그대로
// useNavigate / useAuthStore().login / useMediaQuery('(min-width: 768px)') (line 38~40) — 그대로
// useEffect fetch '/api/public/staff-list' (line 42~46) — 그대로
// selectStaff(id) (line 48~53) — 그대로
// handleSubmit(e?: React.FormEvent) (line 55~72) — 그대로
```
</interfaces>

<tailwind_token_cheatsheet>
<!-- W5 §9 verbatim 인용 — 옛 alias → v0.1.1 className 1:1 매핑 -->

| 옛 인라인 / alias                                       | v0.1.1 className              |
|---------------------------------------------------------|-------------------------------|
| `var(--bg)`                                             | `bg-surface-page`             |
| `var(--bg2)`                                            | `bg-surface-raised`           |
| `var(--bg3)`                                            | `bg-surface-sunken`           |
| `var(--bd)`                                             | `border-border-default`       |
| `var(--bd2)`                                            | `border-border-strong`        |
| `var(--t1)`                                             | `text-text-primary`           |
| `var(--t2)`                                             | `text-text-secondary`         |
| `var(--t3)`                                             | `text-text-tertiary`          |
| `#ffffff` (텍스트, accent 위)                            | `text-text-on-accent`         |
| `linear-gradient(135deg,#1d4ed8,#2563eb)` (로그인 버튼) | `bg-safe-bar` (OQ #1 LOCKED)  |
| `fontSize: 9~11` (label/footer/서브/role/title)         | `text-caption` (12, OQ #3)    |
| `fontSize: 13` (input/카드이름)                          | `text-label` (13)             |
| `fontSize: 16` (타이틀)                                  | `text-body` (16)              |

**status- class prefix 0건** (memory feedback_tailwind_token_class_pattern):
- 정확 = `bg-safe-bar` / `text-safe-bar`
- 잘못 = `bg-status-safe-bar` / `text-status-safe-bar` ← 11-div TSX hotfix(4ce707e) 사고

**w-8 / h-8 = 48px 함정** (memory feedback_tailwind_w8_h8_is_48px):
- tailwind.config spacing override: `w-8 = 48`, `w-7 = 32` (기본 다름)
- 38/28/34 어떤 값도 토큰 사용 0건 — `w-[38px]` / `w-[28px]` / `w-[34px]` arbitrary 인라인만

**작은 컨테이너 text-caption → leading-none** (memory feedback_text_caption_leading_none):
- 헤더 토글 / 배지 / 칩 / 라벨 / role / staff 이름 — 모두 `leading-none` 명시
- footer 만 `leading-relaxed` (멀티라인 텍스트)
</tailwind_token_cheatsheet>
</context>

<tasks>

<task type="auto">
  <name>Task 1: LoginPage.tsx v0.1.1 토큰 변환 (in-place, atomic 1-commit)</name>
  <files>cha-bio-safety/src/pages/LoginPage.tsx</files>
  <action>

LoginPage.tsx 220 lines 를 in-place 수정하여 v0.1.1 토큰 className 으로 치환한다. **단일 atomic commit**. 비즈 로직(useState/useRef/useEffect/handler/CARD_COLORS) 1 byte 변경 0.

## 0. 사전 확인 (필수)

```bash
git branch --show-current   # 기대: redesign/27-login-tsx
git status --short          # 기대: 빈 출력 (clean)
wc -l cha-bio-safety/src/pages/LoginPage.tsx   # 기대: 220
```

## 1. 변환 매핑 (W5 §3.1~§3.6 verbatim — 추측 0건)

### §3.1 영역 2 — 모바일 헤더 (LoginPage.tsx line 204~213)

| 현재 (인라인 style) | 변환 후 (className + 인라인) |
|---|---|
| `<div style={{ background:'var(--bg2)', padding:'16px 20px 24px', borderBottom:'1px solid var(--bd)' }}>` | `<div className="bg-surface-raised border-b border-border-default" style={{ padding:'16px 20px 24px' }}>` |
| `<div style={{ display:'flex', alignItems:'center', gap:12, marginTop:16 }}>` | `<div className="flex items-center" style={{ gap:12, marginTop:16 }}>` |
| 로고 박스 `width:38, height:38, borderRadius:11, background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display/align/justify/overflow:hidden` | `<div className="w-[38px] h-[38px] rounded-[11px]" style={{ background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>` |
| img `width:28, height:28, borderRadius:7` | `<img src="/icons/icon-192.png" alt="" className="w-[28px] h-[28px] rounded-[7px]" />` |
| 타이틀 `fontSize:16, fontWeight:700, color:'var(--t1)'` | `<div className="text-body font-bold text-text-primary">차바이오컴플렉스 방재팀</div>` |
| 서브 `fontSize:11, color:'var(--t3)', marginTop:2` | `<div className="text-caption text-text-tertiary leading-none" style={{ marginTop:2 }}>소방안전 통합관리 시스템</div>` |

### §3.2 영역 3 — 직원 카드 그리드 (LoginPage.tsx line 85~115)

| 현재 | 변환 후 |
|---|---|
| 컨테이너 `<div style={{ background:'var(--bg2)', borderRadius:16, padding:16, marginBottom:12, border:'1px solid var(--bd)' }}>` | `<div className="bg-surface-raised border border-border-default" style={{ borderRadius:16, padding:16, marginBottom:12 }}>` |
| 라벨 `<p style={{ fontSize:10, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:12 }}>` | `<p className="text-caption font-bold uppercase tracking-wider text-text-tertiary leading-none" style={{ marginBottom:12 }}>담당자 선택</p>` |
| 그리드 wrapper `<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>` | 인라인 그대로 유지 (grid template 토큰 없음) |
| 카드 button — CARD_COLORS 인라인 rgba 분기 전체 (OQ #2 LOCKED) | 인라인 style 그대로 유지 — `<button onClick={() => selectStaff(s.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:10, borderRadius:12, border:'1px solid ' + (isSelected ? 'rgba(59,130,246,0.6)' : c.border), background: isSelected ? 'rgba(59,130,246,0.12)' : c.color, cursor:'pointer', textAlign:'left', transition:'all .13s' }}>` |
| initial 박스 `width:34, height:34, borderRadius:10, background:isSelected?'#2563eb':c.border, ..., fontSize:14, fontWeight:700, color:'#fff'` | `<div className="w-[34px] h-[34px] rounded-[10px]" style={{ background: isSelected ? '#2563eb' : c.border, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}><span className="text-body font-bold leading-none">{initial}</span></div>` |
| 이름 `fontSize:13, fontWeight:700, color:'var(--t1)'` | `<div className="text-label font-bold text-text-primary leading-none" style={{ marginBottom:4 }}>{s.name}</div>` |
| role/title `fontSize:10, color:'var(--t3)'` | `<div className="text-caption text-text-tertiary leading-none">{titleLabel}</div>` |

isSelected accent — initial bg `'#2563eb'` 인라인 유지 (OQ #2 LOCKED sub-variant A, bg-accent 토큰화 옵션 미적용).

### §3.3 영역 4 — 로그인 폼 (LoginPage.tsx line 118~165)

| 현재 | 변환 후 |
|---|---|
| 폼 컨테이너 `<div style={{ background:'var(--bg2)', borderRadius:16, padding:16, border:'1px solid var(--bd)' }}>` | `<div className="bg-surface-raised border border-border-default" style={{ borderRadius:16, padding:16 }}>` |
| `<form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>` | 인라인 그대로 유지 |
| label `fontSize:11, fontWeight:600, color:'var(--t3)', display:'block', marginBottom:6` | `<label className="text-label font-bold leading-none text-text-secondary" style={{ display:'block', marginBottom:6 }}>` (2 곳: 사번 + 비밀번호) |
| inputStyle 객체 (line 74~79) | 객체 분해 → className `"w-full bg-surface-sunken border border-border-strong text-text-primary"` + 인라인 `style={{ padding:'12px 14px', borderRadius:12, fontSize:14, outline:'none', transition:'border-color .15s' }}` |
| 비밀번호 input `{...inputStyle, paddingRight:44}` | className 동일 + 인라인 `style={{ padding:'12px 44px 12px 14px', borderRadius:12, fontSize:14, outline:'none', transition:'border-color .15s' }}` (paddingRight 44 명시) |
| 비밀번호 wrapper `<div style={{ position:'relative' }}>` | 인라인 그대로 유지 |
| show/hide 토글 `style={{ position, right, top, transform, background:'none', border:'none', color:'var(--t3)', cursor, fontSize:13 }}` | `<button type="button" onClick={() => setShowPw(v => !v)} className="text-text-tertiary" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:13 }}>{showPw ? '숨김' : '표시'}</button>` (OQ #4 LOCKED 텍스트 유지) |
| 로그인 버튼 `background: loading ? 'var(--bg3)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)', color:'#fff', fontSize:14, fontWeight:700` | `<button type="submit" disabled={loading} className={loading ? 'bg-surface-sunken text-text-tertiary font-bold' : 'bg-safe-bar text-text-on-accent font-bold'} style={{ padding:'14px', borderRadius:12, border:'none', fontSize:14, cursor: loading ? 'not-allowed' : 'pointer', transition:'all .13s', marginTop:4 }}>{loading ? '로그인 중...' : '로그인'}</button>` (OQ #1 LOCKED — 그라데이션 완전 폐기) |

### §3.4 영역 5 — footer 안내문 (LoginPage.tsx line 167~170)

| 현재 | 변환 후 |
|---|---|
| `<p style={{ textAlign:'center', fontSize:11, color:'var(--t3)', marginTop:20, lineHeight:1.6 }}>` | `<p className="text-caption leading-relaxed text-text-tertiary" style={{ textAlign:'center', marginTop:20 }}>` (OQ #3 LOCKED 11→12, OQ #4 LOCKED ☎ U+260E 유지, 카피 verbatim) |

카피 보존 verbatim:
```
초기 비밀번호: 사번 뒤 4자리<br/>
문의: 방재팀 내선 ☎ 031-881-7119
```

### §3.5 영역 6 — 데스크톱 wrapper (LoginPage.tsx line 175~196)

| 현재 | 변환 후 |
|---|---|
| 외곽 `<div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>` | `<div className="bg-surface-page" style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>` |
| 카드 `<div style={{ maxWidth:420, width:'100%', borderRadius:20, background:'var(--bg2)', border:'1px solid var(--bd)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', overflow:'hidden' }}>` | `<div className="bg-surface-raised border border-border-default" style={{ maxWidth:420, width:'100%', borderRadius:20, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', overflow:'hidden' }}>` |
| 카드 헤더 `<div style={{ background:'var(--bg2)', padding:'24px 24px 20px', borderBottom:'1px solid var(--bd)' }}>` | `<div className="bg-surface-raised border-b border-border-default" style={{ padding:'24px 24px 20px' }}>` |
| 카드 헤더 inner (로고/타이틀/서브) | §3.1 매핑 그대로 적용 — 인라인 px (w-[38px] h-[38px] rounded-[11px] + w-[28px] h-[28px] rounded-[7px]) + text-body font-bold text-text-primary + text-caption text-text-tertiary leading-none |
| 카드 바디 `<div style={{ padding:'16px 16px 24px' }}>{inner}</div>` | 인라인 그대로 유지 |

### §3.6 모바일 외곽 wrapper (LoginPage.tsx line 201~217)

| 현재 | 변환 후 |
|---|---|
| `<div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>` | `<div className="bg-surface-page" style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>` |
| 본문 영역 `<div style={{ flex:1, padding:'16px 16px 32px', overflowY:'auto' }}>{inner}</div>` | 인라인 그대로 유지 |

## 2. OQ 5건 LOCKED 결정 (W1 §7 + W5 §4 verbatim — 위반 0건)

### OQ #1 LOCKED — 로그인 버튼 그라데이션 완전 폐기 (LoginPage.tsx line 152~163)
- `background: loading ? 'var(--bg3)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)'` 인라인 완전 제거
- → className `{loading ? 'bg-surface-sunken text-text-tertiary font-bold' : 'bg-safe-bar text-text-on-accent font-bold'}`
- `color:'#fff'` 인라인 제거 (text-text-on-accent 가 처리)
- `fontWeight:700` 인라인 제거 (font-bold 가 처리)
- 인라인 잔존: `padding:'14px', borderRadius:12, border:'none', fontSize:14, cursor, transition:'all .13s', marginTop:4`

### OQ #2 LOCKED — CARD_COLORS 6 rgba 인라인 verbatim 보존
- line 21~28 CARD_COLORS 상수 1 byte 변경 0
- line 99~100 isSelected variant border/bg 인라인 rgba 유지
- line 104 isSelected initial bg `'#2563eb'` 인라인 유지

### OQ #3 LOCKED — 폰트 격상 매핑
- line 86 "담당자 선택" `fontSize:10` → `text-caption font-bold uppercase tracking-wider text-text-tertiary leading-none`
- line 108 카드 이름 `fontSize:13` → `text-label font-bold text-text-primary leading-none`
- line 109 카드 role/title `fontSize:10` → `text-caption text-text-tertiary leading-none`
- line 121, 132 사번/비밀번호 label `fontSize:11` → `text-label font-bold leading-none text-text-secondary`
- line 167 footer `fontSize:11` → `text-caption leading-relaxed text-text-tertiary`
- line 187, 211 서브 `fontSize:11` → `text-caption text-text-tertiary leading-none`
- line 186, 210 타이틀 `fontSize:16` → `text-body font-bold text-text-primary`

### OQ #4 LOCKED — show/hide 텍스트 + ☎ 유지
- line 148 `{showPw ? '숨김' : '표시'}` 텍스트 유지 (Lucide Eye/EyeOff 도입 X)
- line 169 ☎ U+260E 1건 유지
- `import` 문에 `lucide-react` 0건

### OQ #5 LOCKED — 인라인 px 사이즈
- line 182 + 206 로고 박스 `width:38, height:38, borderRadius:11` → `w-[38px] h-[38px] rounded-[11px]`
- line 183 + 207 img `width:28, height:28, borderRadius:7` → `w-[28px] h-[28px] rounded-[7px]`
- line 104 staff initial `width:34, height:34, borderRadius:10` → `w-[34px] h-[34px] rounded-[10px]`
- 토큰 `w-8` / `h-8` 0건 (w-8 = 48px 함정 회피)

## 3. 비즈 로직 0 diff 보존 (W5 §2 + §10 18 항목)

다음은 **변경 0** — 인라인 style 제거 외 logic 라인 손대지 않음:

- line 1~6 imports (lucide-react import 추가 0건만 추가 — 다른 import 변경 0)
- line 8~19 useMediaQuery
- line 21~28 CARD_COLORS
- line 31~36 state 6개
- line 37 pwRef
- line 38~40 useNavigate / useAuthStore / useMediaQuery 호출
- line 42~46 useEffect fetch
- line 48~53 selectStaff
- line 55~72 handleSubmit
- line 74~79 inputStyle — **객체는 제거하고 className + 인라인 style 로 분해** (이건 표현 변경, logic 변경 아님)
- line 88~111 map + isSelected + s.role 분기 + s.name.charAt(0) — 모두 그대로
- line 124 inputMode="numeric"
- line 126 onChange `setStaffId(e.target.value); setSelected(null)`
- line 139 onKeyDown Enter
- line 145 setShowPw 토글
- line 154 disabled={loading}
- line 162 `{loading ? '로그인 중...' : '로그인'}`
- line 175 if (isDesktop) 분기 + inner 재사용 패턴
- 카피 verbatim: "차바이오컴플렉스 방재팀" / "소방안전 통합관리 시스템" / "담당자 선택" / "사번" / "비밀번호" / "사번 10자리" / "비밀번호 입력" / "표시" / "숨김" / "로그인 중..." / "로그인" / "초기 비밀번호: 사번 뒤 4자리" / "문의: 방재팀 내선 ☎ 031-881-7119" / "사번을 입력하세요" / "비밀번호를 입력하세요" / "로그인 실패" / `${res.staff.name}님, 안녕하세요!`

## 4. 작업 순서

1. `wc -l cha-bio-safety/src/pages/LoginPage.tsx` 220 확인
2. LoginPage.tsx 한 번 Read 로 전체 220 라인 읽기
3. inputStyle 객체 (line 74~79) 분해 — 인라인 style 객체에 className 으로 갈 부분 / 인라인 잔존 부분 표 작성
4. Edit / Write 로 in-place 수정 — §3.1 → §3.2 → §3.3 → §3.4 → §3.5 → §3.6 순서 (LoginPage.tsx 의 line 순서에 맞춰)
5. `npm run build` 실행 → tsc 0 errors + Vite build PASS 확인
6. §5 negative gate 7건 + §6 positive gate 모두 PASS 확인
7. atomic 1-commit:
   ```
   git add cha-bio-safety/src/pages/LoginPage.tsx .planning/quick/260521-gox-redesign-27-login-tsx-loginpage-tsx-220-/
   git commit -m "tsx(quick-260521-gox): redesign/27-login LoginPage.tsx v0.1.1 토큰 변환 (W2/W3/W4 sketch verbatim + OQ 5건 LOCKED)"
   ```

## 5. 금지 사항

- wrangler 명령 0건 (CLAUDE.local.md 강제)
- npm run deploy 0건
- LoginPage.tsx 외 파일 수정 0건 (App.tsx / tailwind.config.js / tokens.css / typography.css / functions/ / templates/ 모두 무영향)
- lucide-react import 추가 0건
- `bg-status-safe-bar` / `text-status-safe-bar` 등 status- prefix className 0건
- `w-8` / `h-8` 토큰 사용 0건 (=48px 함정)
- `var(--bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|accent)` 잔존 0건
- `linear-gradient` 0건
- fontSize 9·10·11 인라인 0건
- 이모지 0건 (☎ U+260E 1건만 예외, line 169)
- 비즈 로직 (state/handler/effect/hook/CARD_COLORS) 변경 0건

  </action>
  <verify>
    <automated>
# Path 변수 (실행 디렉토리 = worktree 루트)
F="cha-bio-safety/src/pages/LoginPage.tsx"

# ─── Negative gate 7건 (W5 §5 verbatim) ───
echo "=== Negative gate ==="
test "$(grep -oP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{26FF}]' "$F" | grep -v '☎' | wc -l)" = "0" && echo "neg1 (emoji except ☎) PASS" || echo "neg1 FAIL"
test "$(grep -c 'linear-gradient' "$F")" = "0" && echo "neg2 (no linear-gradient) PASS" || echo "neg2 FAIL"
test "$(grep -cE 'fontSize:\s*(9|10|11)[^0-9]' "$F")" = "0" && echo "neg3 (no 9·10·11 fontSize) PASS" || echo "neg3 FAIL"
test "$(grep -cE '\b(text|bg|border)-status-(safe|fire|warning|danger|caution)' "$F")" = "0" && echo "neg4 (no status- prefix) PASS" || echo "neg4 FAIL"
test "$(grep -cE '\b(w|h)-8\b' "$F")" = "0" && echo "neg5 (no w-8/h-8) PASS" || echo "neg5 FAIL"
test "$(grep -cE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|accent)\)' "$F")" = "0" && echo "neg6 (no old alias) PASS" || echo "neg6 FAIL"
test "$(grep -c 'lucide-react' "$F")" = "0" && echo "neg7 (no lucide-react) PASS" || echo "neg7 FAIL"

# ─── Positive gate (W5 §6 verbatim) ───
echo "=== Positive gate ==="
test "$(grep -cE 'bg-surface-(page|raised|sunken)|border-border-(default|strong)|text-text-(primary|secondary|tertiary|on-accent)' "$F")" -ge 3 && echo "pos1 (v0.1.1 tokens ≥3) PASS" || echo "pos1 FAIL"
test "$(grep -cE 'w-\[(38|34|28)px\]' "$F")" -ge 3 && echo "pos2 (inline px ≥3) PASS" || echo "pos2 FAIL"
test "$(grep -cE 'rounded-\[(11|10|7)px\]' "$F")" -ge 3 && echo "pos3 (inline rounded ≥3) PASS" || echo "pos3 FAIL"
test "$(grep -c 'bg-safe-bar' "$F")" -ge 1 && echo "pos4 (bg-safe-bar ≥1) PASS" || echo "pos4 FAIL"
test "$(grep -cE '표시|숨김' "$F")" -ge 2 && echo "pos5 (표시/숨김 ≥2) PASS" || echo "pos5 FAIL"
test "$(grep -c '☎' "$F")" -ge 1 && echo "pos6 (☎ ≥1) PASS" || echo "pos6 FAIL"

# ─── 비즈 로직 보존 (W5 §10) ───
echo "=== Biz preserve ==="
test "$(grep -c 'useMediaQuery' "$F")" -ge 2 && echo "biz1 (useMediaQuery) PASS" || echo "biz1 FAIL"
test "$(grep -c 'CARD_COLORS' "$F")" -ge 1 && echo "biz2 (CARD_COLORS) PASS" || echo "biz2 FAIL"
test "$(grep -cE 'authApi\.login' "$F")" -ge 1 && echo "biz3 (authApi.login) PASS" || echo "biz3 FAIL"
test "$(grep -c '/api/public/staff-list' "$F")" -ge 1 && echo "biz4 (staff-list fetch) PASS" || echo "biz4 FAIL"
test "$(grep -c 'useAuthStore' "$F")" -ge 1 && echo "biz5 (useAuthStore) PASS" || echo "biz5 FAIL"
test "$(grep -c 'pwRef' "$F")" -ge 3 && echo "biz6 (pwRef ≥3) PASS" || echo "biz6 FAIL"
test "$(grep -c 'selectStaff' "$F")" -ge 2 && echo "biz7 (selectStaff) PASS" || echo "biz7 FAIL"
test "$(grep -c 'handleSubmit' "$F")" -ge 2 && echo "biz8 (handleSubmit) PASS" || echo "biz8 FAIL"
test "$(grep -c "rgba(245,158,11" "$F")" -ge 1 && echo "biz9 (CARD_COLORS amber) PASS" || echo "biz9 FAIL"

# ─── Scope (다른 파일 변경 0) ───
echo "=== Scope ==="
test "$(git diff --name-only HEAD~ HEAD 2>/dev/null | grep -vE 'cha-bio-safety/src/pages/LoginPage\.tsx|^\.planning/quick/260521-gox-' | wc -l | tr -d ' ')" = "0" && echo "scope (no extra files) PASS" || echo "scope FAIL — files: $(git diff --name-only HEAD~ HEAD 2>/dev/null | grep -vE 'cha-bio-safety/src/pages/LoginPage\.tsx|^\.planning/quick/260521-gox-')"

# ─── Line count sanity ───
echo "=== Line count ==="
LC=$(wc -l < "$F" | tr -d ' ')
test "$LC" -ge 190 -a "$LC" -le 260 && echo "lc ($LC lines, 220 ± 30) PASS" || echo "lc FAIL ($LC lines)"

# ─── Build gate ───
echo "=== Build ==="
(cd cha-bio-safety && npm run build 2>&1 | tail -5)
    </automated>
  </verify>
  <done>
- LoginPage.tsx in-place 수정 완료, 라인 수 220 ± 30
- Negative gate 7건 모두 PASS (이모지·linear-gradient·9·10·11·status-·w-8/h-8·var(--alias)·lucide-react 0건)
- Positive gate 모두 PASS (v0.1.1 토큰 ≥3 / 인라인 px ≥3 / rounded arbitrary ≥3 / bg-safe-bar ≥1 / 표시·숨김 ≥2 / ☎ ≥1)
- 비즈 로직 보존 (useMediaQuery·CARD_COLORS·authApi.login·staff-list·useAuthStore·pwRef·selectStaff·handleSubmit·CARD_COLORS rgba 모두 PASS)
- Scope: cha-bio-safety/src/pages/LoginPage.tsx + .planning/quick/260521-gox-*/ 외 파일 변경 0건
- `npm run build` exit 0 (tsc 0 errors + Vite PASS)
- Atomic 1-commit: `tsx(quick-260521-gox): redesign/27-login LoginPage.tsx v0.1.1 토큰 변환 (W2/W3/W4 sketch verbatim + OQ 5건 LOCKED)`
  </done>
</task>

</tasks>

<verification>
## 전체 PLAN 통과 조건

1. **Negative gate 7건** — W5 §5 verbatim
2. **Positive gate** — W5 §6 verbatim
3. **비즈 로직 0 diff** — W5 §10 18 항목 (verify 의 biz1~biz9 sampling)
4. **Scope** — 단일 파일 변경 (cha-bio-safety/src/pages/LoginPage.tsx) + PLAN.md/SUMMARY.md
5. **Build** — `npm run build` exit 0
6. **Atomic 1-commit** — 단일 commit 안에 모든 변경 포함

## 검수 시각

- 모바일 viewport (375×812 등 iPhone 13 mini): 모바일 외곽 wrapper 분기 동작 확인 (line 201~217)
- 데스크톱 viewport (1920×1080 또는 ≥768): 데스크톱 카드 wrapper 분기 동작 확인 (line 175~196)
- 로그인 버튼 default 색상 = bg-safe-bar (= --status-safe-bar = solid)
- 로그인 버튼 disabled 색상 = bg-surface-sunken
- 직원 카드 6개 amber/green/blue/violet/pink/teal rgba 시각 유지
- 선택 카드 isSelected variant = 파란 border + 옅은 파란 bg + initial 진한 #2563eb
- show/hide 토글 = "표시" / "숨김" 텍스트
- footer = ☎ U+260E 글리프 유지

## 사용자 컨펌 후 다음 단계

- `main` 머지 (사용자 명시 컨펌 후)
- GitHub Actions → cbc7119-preview 자동 배포
- 직원 도메인 (cbc7119) 배포는 별도 worktree (20260328) 담당 (이 워크트리는 절대 다루지 않음)
</verification>

<success_criteria>
- [ ] LoginPage.tsx 220 ± 30 lines, in-place 수정
- [ ] Negative gate 7건 모두 0
- [ ] Positive gate 6건 모두 임계치 이상
- [ ] 비즈 로직 보존 9건 (sampling) 모두 PASS
- [ ] 다른 파일 변경 0건
- [ ] `npm run build` exit 0
- [ ] Atomic 1-commit
- [ ] OQ #1: linear-gradient 0건 + bg-safe-bar ≥1
- [ ] OQ #2: CARD_COLORS line 21~28 변경 0 + 인라인 rgba 보존
- [ ] OQ #3: fontSize 9·10·11 인라인 0건 + text-caption/text-label/text-body 토큰 적용
- [ ] OQ #4: '표시'/'숨김' ≥2 + ☎ ≥1 + lucide-react 0
- [ ] OQ #5: w-[38px]/w-[28px]/w-[34px] ≥3 + rounded-[11px]/[10px]/[7px] ≥3 + w-8/h-8 0
</success_criteria>

<output>
After completion, create `.planning/quick/260521-gox-redesign-27-login-tsx-loginpage-tsx-220-/260521-gox-SUMMARY.md` documenting:

- 변환 전후 LoginPage.tsx wc -l
- 적용된 v0.1.1 토큰 className 목록 (grep 카운트)
- OQ #1~#5 LOCKED 각 적용 결과 확인
- Negative gate 7건 + Positive gate 6건 + biz9건 PASS 결과 (verify automated 출력 첨부)
- `npm run build` 결과 (chunk size 포함)
- atomic commit hash + main 머지 대기 상태 명시
- 다음 단계 (사용자 컨펌 → main 머지 → cbc7119-preview 자동 배포)
</output>

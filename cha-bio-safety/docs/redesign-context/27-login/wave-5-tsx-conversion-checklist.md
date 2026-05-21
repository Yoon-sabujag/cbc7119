---
title: "redesign/27-login — wave 5 (TSX conversion checklist)"
status: pending  # TSX 변환 wave 시작 전 사용자 컨펌 후 in-progress
created: 2026-05-21
quick_id: 260521-f01
branch: redesign/27-login
source_tsx: cha-bio-safety/src/pages/LoginPage.tsx
source_tsx_lines: 220
sketch_sources:
  - cha-bio-safety/docs/redesign-context/27-login/sketch-wave-2-mobile-shell.html
  - cha-bio-safety/docs/redesign-context/27-login/sketch-wave-3-staff-card-grid.html
  - cha-bio-safety/docs/redesign-context/27-login/sketch-wave-4-login-form.html
mirror_of: cha-bio-safety/docs/redesign-context/14-reports/wave-7-tsx-conversion-checklist.md
locked_decisions: "W1 OQ #1~#5 LOCKED 5건 (wave-1-index.md §7 verbatim)"
consumed_by: 27-login TSX 변환 wave (단일 atomic 1-commit, LoginPage.tsx in-place 수정) executor
---

# §1. 변환 범위 + 산출 파일

본 W5 checklist 는 **sketch HTML 이 아님**. 다음 wave (TSX 변환) 의 executor 가 1-pass 로 적용할 verify gate + region mapping + LOCKED 룰 박제 markdown.

**§1.1 source-of-truth:**
- `cha-bio-safety/src/pages/LoginPage.tsx` (220 lines, source TSX)
- `cha-bio-safety/docs/redesign-context/27-login/sketch-wave-2-mobile-shell.html` (W2, 모바일 헤더 + 데스크톱 wrapper)
- `cha-bio-safety/docs/redesign-context/27-login/sketch-wave-3-staff-card-grid.html` (W3, 직원 카드 그리드)
- `cha-bio-safety/docs/redesign-context/27-login/sketch-wave-4-login-form.html` (W4, 로그인 폼 + footer)
- `cha-bio-safety/docs/redesign-context/27-login/design-system.md` (v0.1.1, c8bfa86)
- `cha-bio-safety/docs/redesign-context/27-login/tokens.css` / `typography.css`

**§1.2 scope:**
- 단일 파일 in-place 수정: `cha-bio-safety/src/pages/LoginPage.tsx` (220 lines → 약 220~250 lines 예상, Tailwind v0.1.1 className 으로 인라인 style 치환)
- W2 (모바일 헤더 + 데스크톱 wrapper + 카드 헤더) + W3 (직원 카드 그리드 + isSelected variant) + W4 (로그인 폼 + footer) 3 sketch 결정 → className 1:1 매핑
- 비즈 로직 0 diff (state/handler/effect/hook 모두 보존)

**§1.3 status:**
sketch W2~W4 완료 + 머지 + cbc7119-preview 자동 배포 완료. 본 W5 = 마지막 sketch wave 산출물 (markdown 1개). TSX 변환 wave 는 본 산출 후 사용자 OQ 컨펌 받은 뒤 진입.

**§1.4 sub-wave 분할:**
LoginPage.tsx 는 220 lines 단순 페이지 — 14-reports (405 lines, 3 sub-wave SW1/SW2/SW3) 와 달리 sub-wave 분할 불필요. **단일 atomic 1-commit** 으로 LoginPage.tsx in-place 수정. components.css 신규 파일도 만들지 않음 (분량이 작아 모든 className 을 인라인 + Tailwind utility 로 처리).

---

# §2. 보존 (LoginPage.tsx 비즈 로직 100% 보존)

source 의 비즈 로직 / 카피 / 시그니처는 본 변환에서 1 byte 도 바꾸지 않는다. git diff 에 잡히면 안 됨. 모든 카피는 verbatim 인용.

| line | 항목 | 보존 방식 |
|---|---|---|
| 1~6 | imports (useState/useRef/useEffect/useNavigate/toast/useAuthStore/authApi/staffApi/ApiError/StaffFull) | 그대로 (확장만 OK, 단 lucide-react import 0건 — OQ #4 LOCKED 텍스트 토글 유지) |
| 8~19 | `useMediaQuery` hook (window.matchMedia + setMatches + addEventListener + cleanup) | 그대로 |
| 21~28 | `CARD_COLORS` 6 rgba 상수 (amber/green/blue/violet/pink/teal) | 그대로 (OQ #2 LOCKED 인라인 rgba 유지) |
| 31~36 | state 6종 (staffId / password / showPw / loading / selected / staffList) | 그대로 |
| 37 | `pwRef = useRef<HTMLInputElement>(null)` | 그대로 |
| 38 | `useNavigate()` | 그대로 |
| 39 | `useAuthStore().login` 구조분해 | 그대로 |
| 40 | `useMediaQuery('(min-width: 768px)')` 분기 | 그대로 |
| 42~46 | `useEffect` — fetch `/api/public/staff-list` + setStaffList | 그대로 |
| 48~53 | `selectStaff` handler — setSelected + setStaffId + setPassword('') + setTimeout pwRef.focus 80ms | 그대로 |
| 55~72 | `handleSubmit` handler — authApi.login + login(token, staff) + navigate('/dashboard', { replace: true }) + toast + catch ApiError + finally setLoading(false) | 그대로 |
| 88~111 | `staffList.map((s, i) => ...)` map + isSelected 분기 + `s.role === 'admin' ? '관리자' : s.title` 분기 + `s.name.charAt(0)` initial | 그대로 (isSelected 색 분기 인라인 rgba 보존) |
| 124 | `inputMode="numeric"` | 그대로 |
| 126 | onChange `setStaffId(e.target.value); setSelected(null)` | 그대로 |
| 139 | `onKeyDown={e => e.key === 'Enter' && handleSubmit()}` (비밀번호 input) | 그대로 |
| 145 | `setShowPw(v => !v)` | 그대로 |
| 148 | `{showPw ? '숨김' : '표시'}` 텍스트 토글 (OQ #4 LOCKED) | 그대로 |
| 154 | `disabled={loading}` | 그대로 |
| 162 | `{loading ? '로그인 중...' : '로그인'}` 카피 | 그대로 |
| 169 | "문의: 방재팀 내선 ☎ 031-881-7119" — ☎ U+260E 글리프 (OQ #4 LOCKED 예외) | 그대로 |
| 183, 207 | `<img src="/icons/icon-192.png" alt="" ...>` 로고 src | 그대로 |
| 186, 210 | "차바이오컴플렉스 방재팀" 타이틀 카피 | 그대로 |
| 187, 211 | "소방안전 통합관리 시스템" 서브 카피 | 그대로 |

**§2.1 inputStyle 객체 (line 74~79):**
변환 시 객체 분해 → className + 인라인 style 분리. width/padding/borderRadius/border/bg/color/fontSize/outline/transition 각 항목 매핑 §3 표 3 참조.

**§2.2 staff 데이터:**
LoginPage.tsx 는 `/api/public/staff-list` 결과를 그대로 카드 그리드에 사용. 샘플 데이터 (sketch W3 의 6명 한글 이름) 는 sketch 시각화 용도만 — 변환 wave 에서 staffList type/구조 변경 0.

---

# §3. 변환 매핑 (영역별 className/토큰/폰트 — W2/W3/W4 sketch verbatim 인용)

W2~W4 sketch HTML 의 `<style>` 블록 + body markup 에서 grep 으로 추출한 매핑. 추측한 토큰명/사이즈 0건 — sketch 결과 verbatim 만 인용 (메모리 룰 4 feedback_planner_prompt_sketch_verbatim).

## §3.1 영역 2 — 모바일 헤더 (LoginPage.tsx line 204~213)

W2 frame 1, 2 sketch 안 markup verbatim 매핑.

| 현재 (LoginPage.tsx 인라인 style) | 변환 후 (className + 인라인) | sketch 출처 |
|---|---|---|
| 헤더 wrapper `<div style={{ background:'var(--bg2)', padding:'16px 20px 24px', borderBottom:'1px solid var(--bd)' }}>` | `<div className="bg-surface-raised border-b border-border-default" style={{ padding:'16px 20px 24px' }}>` | W2 frame 1, 2 |
| inner flex wrapper `<div style={{ display:'flex', alignItems:'center', gap:12, marginTop:16 }}>` | `<div className="flex items-center" style={{ gap:12, marginTop:16 }}>` | W2 |
| 로고 박스 `width:38, height:38, borderRadius:11, background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display/align/justify/overflow:hidden` | `<div className="w-[38px] h-[38px] rounded-[11px]" style={{ background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>` (OQ #5 LOCKED 인라인 px) | W2 |
| 내부 img `width:28, height:28, borderRadius:7` | `<img src="/icons/icon-192.png" alt="" className="w-[28px] h-[28px] rounded-[7px]" />` (OQ #5 LOCKED 인라인 px) | W2 |
| 타이틀 `fontSize:16, fontWeight:700, color:'var(--t1)'` | `<div className="text-body font-bold text-text-primary">차바이오컴플렉스 방재팀</div>` | W2 |
| 서브 `fontSize:11, color:'var(--t3)', marginTop:2` | `<div className="text-caption text-text-tertiary leading-none" style={{ marginTop:2 }}>소방안전 통합관리 시스템</div>` (OQ #3 LOCKED 11→12 + leading-none) | W2 |

## §3.2 영역 3 — 직원 카드 그리드 (LoginPage.tsx line 85~115)

W3 frame 1~4 sketch 안 markup verbatim 매핑.

| 현재 | 변환 후 | sketch 출처 |
|---|---|---|
| 컨테이너 `<div style={{ background:'var(--bg2)', borderRadius:16, padding:16, marginBottom:12, border:'1px solid var(--bd)' }}>` | `<div className="bg-surface-raised border border-border-default" style={{ borderRadius:16, padding:16, marginBottom:12 }}>` (radius 16 → rounded-lg 토큰화 가능, 인라인 명시도 OK) | W3 |
| 라벨 `<p style={{ fontSize:10, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:12 }}>` | `<p className="text-caption font-bold uppercase tracking-wider text-text-tertiary leading-none" style={{ marginBottom:12 }}>담당자 선택</p>` (OQ #3 LOCKED 10→12) | W3 |
| 그리드 wrapper `<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>` | `<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>` (인라인 유지 — grid template 토큰 매핑 미적용) | W3 |
| 카드 button — 인라인 rgba 분기 `display:flex, alignItems:center, gap:10, padding:10, borderRadius:12, border:'1px solid ' + (isSelected ? 'rgba(59,130,246,0.6)' : c.border), background: isSelected ? 'rgba(59,130,246,0.12)' : c.color, cursor, textAlign, transition` | 인라인 그대로 (OQ #2 LOCKED CARD_COLORS rgba 인라인 유지) — `<button onClick={() => selectStaff(s.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:10, borderRadius:12, border:'1px solid ' + (isSelected ? 'rgba(59,130,246,0.6)' : c.border), background: isSelected ? 'rgba(59,130,246,0.12)' : c.color, cursor:'pointer', textAlign:'left', transition:'all .13s' }}>` | W3 |
| initial 박스 `width:34, height:34, borderRadius:10, background:isSelected?'#2563eb':c.border, display, align, justify, fontSize:14, fontWeight:700, color:'#fff', flexShrink:0` | `<div className="w-[34px] h-[34px] rounded-[10px]" style={{ background: isSelected ? '#2563eb' : c.border, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}><span className="text-body font-bold leading-none">{initial}</span></div>` (OQ #5 LOCKED extension 인라인 px) | W3 |
| 이름 `fontSize:13, fontWeight:700, color:'var(--t1)'` | `<div className="text-label font-bold text-text-primary leading-none" style={{ marginBottom:4 }}>{s.name}</div>` (memory feedback_text_caption_leading_none) | W3 |
| role/title `fontSize:10, color:'var(--t3)'` | `<div className="text-caption text-text-tertiary leading-none">{titleLabel}</div>` (OQ #3 LOCKED 10→12 + leading-none) | W3 |

**§3.2.1 isSelected accent 결정:**
sketch W3 frame 2 의 2 sub-variant 중 W4 OQ default = **sub-variant A** (initial bg = `'#2563eb'` 인라인). OQ #2 LOCKED 의 "인라인 rgba 유지" 일관 정책 — 토큰화 (bg-accent) 옵션은 sketch 보존만 하고 변환에서는 source line 104 verbatim `'#2563eb'` 인라인 유지.

## §3.3 영역 4 — 로그인 폼 (LoginPage.tsx line 118~165)

W4 frame 1~5 sketch 안 markup verbatim 매핑.

| 현재 | 변환 후 | sketch 출처 |
|---|---|---|
| 폼 컨테이너 `<div style={{ background:'var(--bg2)', borderRadius:16, padding:16, border:'1px solid var(--bd)' }}>` | `<div className="bg-surface-raised border border-border-default" style={{ borderRadius:16, padding:16 }}>` | W4 |
| `<form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>` | `<form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>` (인라인 유지) | W4 |
| label `fontSize:11, fontWeight:600, color:'var(--t3)', display:'block', marginBottom:6` | `<label className="text-label font-bold leading-none text-text-secondary" style={{ display:'block', marginBottom:6 }}>` (OQ #3 LOCKED 11→13) | W4 |
| inputStyle (line 74~79) `width:'100%', padding:'12px 14px', borderRadius:12, border:'1px solid var(--bd2)', background:'var(--bg3)', color:'var(--t1)', fontSize:14, outline:'none', transition:'border-color .15s'` | className `"w-full bg-surface-sunken border border-border-strong text-text-primary"` + 인라인 `style={{ padding:'12px 14px', borderRadius:12, fontSize:14, outline:'none', transition:'border-color .15s' }}` (inputStyle 객체 분해 → className + 인라인) | W4 |
| 비밀번호 input 추가 `paddingRight:44` | spread `{...inputStyle, paddingRight:44}` → className 동일 + 인라인 padding 객체 분리 후 paddingRight:44 인라인 명시 | W4 |
| 비밀번호 wrapper `<div style={{ position:'relative' }}>` | `<div style={{ position:'relative' }}>` (인라인 유지) | W4 |
| show/hide 토글 `<button type="button" onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:13 }}>{showPw ? '숨김' : '표시'}</button>` | `<button type="button" onClick={() => setShowPw(v => !v)} className="text-text-tertiary" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:13 }}>{showPw ? '숨김' : '표시'}</button>` (OQ #4 LOCKED 텍스트 유지) | W4 |
| 로그인 버튼 `padding:'14px', borderRadius:12, border:'none', background: loading ? 'var(--bg3)' : 'linear&#8209;gradient(135deg,#1d4ed8,#2563eb)', color:'#fff', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', transition:'all .13s', marginTop:4` | `<button type="submit" disabled={loading} className={loading ? 'bg-surface-sunken text-text-tertiary font-bold' : 'bg-safe-bar text-text-on-accent font-bold'} style={{ padding:'14px', borderRadius:12, border:'none', fontSize:14, cursor:loading?'not-allowed':'pointer', transition:'all .13s', marginTop:4 }}>{loading ? '로그인 중...' : '로그인'}</button>` (OQ #1 LOCKED — 그라데이션 완전 폐기, solid 통일) | W4 |

## §3.4 영역 5 — footer 안내문 (LoginPage.tsx line 167~170)

W4 frame 1~5 footer 매핑.

| 현재 | 변환 후 | sketch 출처 |
|---|---|---|
| `<p style={{ textAlign:'center', fontSize:11, color:'var(--t3)', marginTop:20, lineHeight:1.6 }}>초기 비밀번호: 사번 뒤 4자리<br/>문의: 방재팀 내선 ☎ 031-881-7119</p>` | `<p className="text-caption leading-relaxed text-text-tertiary" style={{ textAlign:'center', marginTop:20 }}>초기 비밀번호: 사번 뒤 4자리<br/>문의: 방재팀 내선 ☎ 031-881-7119</p>` (OQ #3 LOCKED 11→12, OQ #4 LOCKED ☎ U+260E 유지, 카피 verbatim) | W4 |

## §3.5 영역 6 — 데스크톱 wrapper (LoginPage.tsx line 175~196)

W2 frame 3, 4 sketch 안 markup verbatim 매핑.

| 현재 | 변환 후 | sketch 출처 |
|---|---|---|
| 외곽 `<div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>` | `<div className="bg-surface-page" style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>` | W2 frame 3, 4 |
| 카드 `<div style={{ maxWidth:420, width:'100%', borderRadius:20, background:'var(--bg2)', border:'1px solid var(--bd)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', overflow:'hidden' }}>` | `<div className="bg-surface-raised border border-border-default" style={{ maxWidth:420, width:'100%', borderRadius:20, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', overflow:'hidden' }}>` (radius:20 → rounded-[20px] arbitrary 인라인 — 토큰 없음) | W2 |
| 카드 헤더 `<div style={{ background:'var(--bg2)', padding:'24px 24px 20px', borderBottom:'1px solid var(--bd)' }}>` | `<div className="bg-surface-raised border-b border-border-default" style={{ padding:'24px 24px 20px' }}>` | W2 |
| 카드 헤더 inner = 모바일 헤더 와 동일 (로고/타이틀/서브) — §3.1 매핑 재사용 | (§3.1 매핑 그대로 데스크톱 카드 헤더 안 반복) | W2 |
| 카드 바디 `<div style={{ padding:'16px 16px 24px' }}>{inner}</div>` | `<div style={{ padding:'16px 16px 24px' }}>{inner}</div>` (인라인 유지) | W2 |

## §3.6 모바일 외곽 wrapper (LoginPage.tsx line 201~217)

| 현재 | 변환 후 | sketch 출처 |
|---|---|---|
| `<div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>` | `<div className="bg-surface-page" style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>` | W2 frame 1, 2 |
| 본문 영역 `<div style={{ flex:1, padding:'16px 16px 32px', overflowY:'auto' }}>{inner}</div>` | `<div style={{ flex:1, padding:'16px 16px 32px', overflowY:'auto' }}>{inner}</div>` (인라인 유지) | W2 |

---

# §4. OQ LOCKED 5건 변환 결과 반영 (W1 §7 verbatim + 코드 적용 위치)

본 §4 는 wave-1-index.md §7 의 LOCKED 결정 5건을 verbatim 박제 + LoginPage.tsx line 범위 매핑. TSX 변환 wave executor 는 본 §4 의 결정을 1 byte 도 바꾸지 않는다.

## §4.1 OQ #1 LOCKED — 로그인 버튼 그라데이션 완전 폐기

```
LOCKED (2026-05-21): 로그인 버튼 = `bg-safe-bar` solid + `text-text-on-accent`.
그라데이션 완전 폐기. disabled 시 = `bg-surface-sunken`. W4 sketch + TSX 변환 양쪽 동일 적용.
```

**변환 위치:** LoginPage.tsx line 152~163 (로그인 button 영역)
- line 157 `background: loading ? 'var(--bg3)' : 'linear&#8209;gradient(135deg,#1d4ed8,#2563eb)'` → className `{loading ? 'bg-surface-sunken text-text-tertiary font-bold' : 'bg-safe-bar text-text-on-accent font-bold'}`
- disabled 시 추가 className `'cursor-not-allowed'` 가능 (또는 인라인 cursor 유지)

## §4.2 OQ #2 LOCKED — CARD_COLORS 6 rgba 인라인 verbatim 보존

```
LOCKED (2026-05-21): `CARD_COLORS` 6 rgba 인라인 상수 그대로 보존.
variant matrix 도 인라인 rgba 로 표현. isSelected accent 만 `#2563eb` → `bg-accent` 토큰화 검토 (W3 sketch 단계 결정).
```

**변환 위치:** LoginPage.tsx line 21~28 (CARD_COLORS) + line 88~111 (map markup)
- line 21~28 `CARD_COLORS` 상수 변경 0 — 6 rgba 그대로 (amber rgba(245,158,11,0.15)/0.35 / green rgba(34,197,94,0.1)/0.3 / blue rgba(59,130,246,0.1)/0.3 / violet rgba(139,92,246,0.1)/0.3 / pink rgba(236,72,153,0.1)/0.3 / teal rgba(20,184,166,0.1)/0.3)
- line 99~100 isSelected 시 border `rgba(59,130,246,0.6)` + bg `rgba(59,130,246,0.12)` 인라인 유지
- line 104 isSelected 시 initial bg `'#2563eb'` 인라인 유지 (sketch W3 sub-variant A LOCKED-default, bg-accent 토큰화 옵션 미적용)

## §4.3 OQ #3 LOCKED — 폰트 격상 매핑

```
LOCKED (2026-05-21): 폰트 격상 매핑 (sketch + TSX 변환 양쪽):
- footer 안내문 11px → `text-caption` (12px) `leading-relaxed text-text-tertiary`
- 사번/비밀번호 label 11px → `text-label` (13px) `font-bold leading-none text-text-secondary`
- "담당자 선택" 라벨 10px → `text-caption` (12px) `font-bold uppercase tracking-wider text-text-tertiary leading-none`
- 카드 안 role/title 10px → `text-caption` (12px) `leading-none text-text-tertiary`
- §1.1 16px 마지노선 위반은 §3 머리말에 1줄 메타로 명시 (현 footer/label/sub 의 보조 정보 위계상 절충)
```

**변환 위치:**
- line 86 "담당자 선택" 라벨 `fontSize:10` → className `"text-caption font-bold uppercase tracking-wider text-text-tertiary leading-none"`
- line 108 카드 이름 `fontSize:13` → className `"text-label font-bold text-text-primary leading-none"`
- line 109 카드 role/title `fontSize:10` → className `"text-caption text-text-tertiary leading-none"`
- line 121, 132 사번/비밀번호 label `fontSize:11` → className `"text-label font-bold leading-none text-text-secondary"`
- line 167 footer `fontSize:11` → className `"text-caption leading-relaxed text-text-tertiary"`
- line 187, 211 서브 "소방안전 통합관리 시스템" `fontSize:11` → className `"text-caption text-text-tertiary leading-none"`

## §4.4 OQ #4 LOCKED — show/hide 텍스트 + footer ☎ 유지

```
LOCKED (2026-05-21): show/hide 토글 = 텍스트 "표시"/"숨김" 유지 (노안 친화 우선).
footer ☎ (U+260E) 글리프 = 콘텐츠 글리프로 유지 (이모지 제거 룰 8 예외 케이스 — 전화 affordance).
W4 sketch 의 비밀번호 input 우측 토글 ghost button 은 텍스트 그대로.
```

**변환 위치:**
- line 148 `{showPw ? '숨김' : '표시'}` — 텍스트 그대로 (Lucide Eye/EyeOff 도입 X, lucide-react import 추가 0)
- line 169 "문의: 방재팀 내선 ☎ 031-881-7119" — ☎ U+260E 글리프 그대로 (이모지 제거 룰 예외)

## §4.5 OQ #5 LOCKED — 인라인 px 사이즈 유지

```
LOCKED (2026-05-21): 로고 박스 = `w-[38px] h-[38px] rounded-[11px]` + 내부 img = `w-[28px] h-[28px] rounded-[7px]` 인라인.
모바일/데스크톱 둘 다 동일. W2 sketch + TSX 변환 양쪽 동일 적용.
동시에 staff initial 박스 34×34 도 `w-[34px] h-[34px] rounded-[10px]` 인라인 (W3, OQ 항목 아니지만 동일 인라인 명시 룰 적용).
```

**변환 위치:**
- line 182 (데스크톱) + line 206 (모바일) 로고 박스 `width:38, height:38, borderRadius:11` → className `"w-[38px] h-[38px] rounded-[11px]"`
- line 183 (데스크톱) + line 207 (모바일) img `width:28, height:28, borderRadius:7` → className `"w-[28px] h-[28px] rounded-[7px]"`
- line 104 staff initial 박스 `width:34, height:34, borderRadius:10` → className `"w-[34px] h-[34px] rounded-[10px]"` (OQ #5 LOCKED extension)

**w-8 / h-8 금지 (memory feedback_tailwind_w8_h8_is_48px):**
tailwind.config 의 `theme.extend.spacing` override 에서 `w-8 = 48px` (기본 32 아님). 38/28/34 어떤 값도 토큰 사용 0건. 인라인 px arbitrary `w-[Npx]` 형태로만.

---

# §5. Negative gate (TSX 변환 후 LoginPage.tsx 가 통과해야 할 grep gate)

각 grep 명령 모두 worktree 루트 디렉토리 기준 실행.

```
# 1. 이모지 0건 (단 ☎ U+260E 1개는 OQ #4 LOCKED 예외, line 169)
grep -cP '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{26FF}]' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: 1 (☎ U+260E 1건만, 다른 글리프 0)
# 정확 검증: grep -oE '☎' cha-bio-safety/src/pages/LoginPage.tsx | wc -l 가 ≥1 + 위 grep 결과가 그와 일치

# 2. linear&#8209;gradient 0건 (OQ #1 LOCKED 그라데이션 폐기)
grep -c 'linear-gradient' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: 0

# 3. 9·10·11px 0건 (OQ #3 LOCKED 격상 결과)
grep -cE 'fontSize:\s*(9|10|11)[^0-9]' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: 0

# 4. status- class prefix 0건 (memory feedback_tailwind_token_class_pattern)
grep -cE '\b(text|bg|border)-status-(safe|fire|warning|danger|caution)' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: 0
# (주의: --status-safe 같은 CSS 변수 정의는 LoginPage.tsx 안에 등장 안 함 — tokens.css 영역.
#  본 grep 은 class prefix 만 대상.)

# 5. w-8 / h-8 0건 (w-8=48 함정, memory feedback_tailwind_w8_h8_is_48px)
grep -cE '\bw-8\b|\bh-8\b' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: 0

# 6. 옛 alias 토큰 0건 (var(--bg)/var(--bg2)/var(--bg3)/var(--bd)/var(--bd2)/var(--t1)/var(--t2)/var(--t3)/var(--acl)/var(--accent))
grep -cE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|accent)\)' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: 0 (모두 새 토큰 className 으로 치환)

# 7. lucide-react import 0건 (OQ #4 LOCKED 텍스트 토글 유지, 로고는 PNG img)
grep -c "from 'lucide-react'" cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: 0
```

---

# §6. Positive gate (변환 후 등장해야 할 패턴)

각 grep 결과가 명시된 임계치 이상이어야 함.

```
# 1. v0.1.1 토큰 className 카운트
grep -c 'bg-surface-raised' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=3 (모바일 헤더 + 데스크톱 카드 wrapper + 데스크톱 카드 헤더 + 폼 컨테이너 + 카드 그리드 컨테이너)

grep -c 'bg-surface-page' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (모바일 외곽 + 데스크톱 외곽)

grep -c 'bg-surface-sunken' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (사번/비밀번호 input + 로그인 버튼 disabled)

grep -c 'text-text-primary' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (타이틀 + 카드 이름 + input)

grep -c 'text-text-tertiary' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=4 (서브 + 카드 role + 라벨 + footer + show/hide 토글)

grep -c 'text-text-secondary' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (사번/비밀번호 label)

grep -c 'border-border-default' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=3 (모바일 헤더 border-b + 데스크톱 카드 border + 카드 헤더 border-b + 폼 컨테이너 border + 카드 그리드 컨테이너 border)

grep -c 'border-border-strong' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (input border)

grep -c 'bg-safe-bar' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (로그인 버튼 default, OQ #1 LOCKED)

grep -c 'text-text-on-accent' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (로그인 버튼 default 위 텍스트)

# 2. 폰트 토큰 (OQ #3 LOCKED 격상)
grep -c 'text-caption' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=4 (서브 모바일/데스크톱 + 라벨 + role/title + footer)

grep -c 'text-label' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=3 (사번/비밀번호 label x 2 + 카드 이름)

grep -c 'text-body' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=2 (모바일 + 데스크톱 타이틀)

grep -c 'leading-none' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=4 (서브 + 라벨 + role/title + 카드 이름)

grep -c 'leading-relaxed' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (footer)

# 3. 인라인 px 사이즈 (OQ #5 LOCKED)
grep -c 'w-\[38px\]' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=2 (모바일 + 데스크톱 로고)

grep -c 'h-\[38px\]' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=2

grep -c 'w-\[28px\]' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=2 (모바일 + 데스크톱 img)

grep -c 'w-\[34px\]' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (staff initial)

grep -c 'rounded-\[11px\]' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=2

grep -c 'rounded-\[7px\]' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=2

grep -c 'rounded-\[10px\]' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1

# 4. OQ #4 LOCKED 카피 유지
grep -c '☎' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (footer line 169)

grep -c '표시' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (show/hide 토글)

grep -c '숨김' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (show/hide 토글)

# 5. CARD_COLORS 인라인 rgba 유지 (OQ #2 LOCKED)
grep -c 'rgba(245,158,11' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (CARD_COLORS[0] amber, line 22)

grep -c 'rgba(59,130,246,0\.6\|rgba(59,130,246,0\.12' cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: >=1 (isSelected variant, line 99~100)
```

---

# §7. Build / tsc gate (변환 commit 직전 + 직후 양쪽)

```
cd cha-bio-safety && npx tsc --noEmit
# 기대값: exit 0 (TypeScript type 에러 0)

cd cha-bio-safety && npm run build
# 기대값: exit 0 (Vite build 성공)

# PWA Service Worker 갱신 확인 (선택, build 직후)
# dist/sw.js + dist/assets/index-*.js 의 hash 변경 확인
ls cha-bio-safety/dist/assets/*.js | head -3
```

---

# §8. 자체 verify 명령 (W5 markdown 작성 시점 + TSX 변환 wave 진입 시점 양쪽 실행)

본 W5 checklist 자체가 통과해야 할 gate. W5 commit 직전 + TSX 변환 wave 진입 직전 동일 실행.

## §8.1 W5 checklist 작성 시점 gate

```
# 1. 본 파일 존재 + 줄 수
test -f cha-bio-safety/docs/redesign-context/27-login/wave-5-tsx-conversion-checklist.md
wc -l cha-bio-safety/docs/redesign-context/27-login/wave-5-tsx-conversion-checklist.md
# 기대값: >=250

# 2. §1~§8 8 섹션 헤더 모두 존재
grep -cE '^# §[1-8]\b' cha-bio-safety/docs/redesign-context/27-login/wave-5-tsx-conversion-checklist.md
# 기대값: >=8

# 3. fence 카운트 (§5 / §6 / §7 / §8 의 verify 명령 fence)
grep -c '^```' cha-bio-safety/docs/redesign-context/27-login/wave-5-tsx-conversion-checklist.md
# 기대값: >=8 (4 verify section x 2 open/close each)

# 4. OQ #1~#5 5건 모두 인용
grep -cE 'OQ #[1-5]' cha-bio-safety/docs/redesign-context/27-login/wave-5-tsx-conversion-checklist.md
# 기대값: >=5

# 5. LoginPage.tsx 변경 0 (W2/W3/W4/W5 4 commit 동안)
git diff --name-only HEAD~3 HEAD -- cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: 빈 출력 (3 commit 이전 sketch wave, 본 W5 markdown 추가 후 4 commit 됨 — HEAD~4 HEAD 가 정확)

# 6. 3 sketch HTML 파일 모두 존재
test -f cha-bio-safety/docs/redesign-context/27-login/sketch-wave-2-mobile-shell.html
test -f cha-bio-safety/docs/redesign-context/27-login/sketch-wave-3-staff-card-grid.html
test -f cha-bio-safety/docs/redesign-context/27-login/sketch-wave-4-login-form.html
# 기대값: 3 파일 모두 존재
```

## §8.2 TSX 변환 wave 진입 직전 gate

```
# 1. 브랜치 확인 (memory feedback_check_branch_before_edit)
git branch --show-current
# 기대값: redesign/27-login

# 2. dirty 0
git status --short
# 기대값: 빈 출력 (clean)

# 3. cwd = cbc7119-design 워크트리 루트 확인
pwd
# 기대값: /Users/jykevin/Documents/cbc7119-design (또는 worktree 안)

# 4. LoginPage.tsx 220 lines 그대로
wc -l cha-bio-safety/src/pages/LoginPage.tsx
# 기대값: 220

# 5. 4 sketch wave 모두 main 머지 / cbc7119-preview 자동 배포 확인 (선택)
git log --oneline -5
# 기대값: W5/W4/W3/W2 4 commit + 본 wave 의 mark
```

## §8.3 TSX 변환 commit 직후 gate

§5 + §6 + §7 모두 PASS + LoginPage.tsx wc -l ~= 220~250 (소폭 증가 허용).

```
# 단일 atomic commit 확인
git log --oneline -1 | grep -qE '27-login.*TSX|27-login.*tsx|redesign/27-login.*변환'
# 기대값: PASS

# 비즈 로직 diff 0 (handler/state/effect/hook)
git diff HEAD~1 HEAD -- cha-bio-safety/src/pages/LoginPage.tsx | grep -cE '^[+-]\s*(useState|useEffect|useRef|useNavigate|useAuthStore|authApi|fetch|setStaffId|setPassword|setShowPw|setLoading|setSelected|setStaffList|handleSubmit|selectStaff|pwRef|useMediaQuery|navigate)'
# 기대값: 0 (logic line 의 - 추가 / + 제거 또는 변경이 없어야 함, markup 변경만)
```

---

# §9. (보너스) Tailwind cheatsheet — 잘못된 표기 박제 예방

W2~W4 sketch 의 className 패턴이 TSX 변환에서 그대로 적용되도록 cheatsheet 박제.

| 옛 토큰 / 옛 hex | v0.1.1 className | CSS 변수 |
|---|---|---|
| `var(--bg)` | `bg-surface-page` | `--surface-page` |
| `var(--bg2)` | `bg-surface-raised` | `--surface-raised` |
| `var(--bg3)` | `bg-surface-sunken` | `--surface-sunken` |
| `var(--bd)` | `border-border-default` | `--border-default` |
| `var(--bd2)` | `border-border-strong` | `--border-strong` |
| `var(--t1)` | `text-text-primary` | `--text-primary` |
| `var(--t2)` | `text-text-secondary` | `--text-secondary` |
| `var(--t3)` | `text-text-tertiary` | `--text-tertiary` |
| `#ffffff` (텍스트, accent 위) | `text-text-on-accent` | `--text-on-accent` |
| `linear&#8209;gradient(135deg,#1d4ed8,#2563eb)` (로그인 버튼) | `bg-safe-bar` (OQ #1 LOCKED solid) | `--status-safe-bar` |
| `var(--acl)` / `var(--accent)` | `bg-accent` / `text-accent` / `border-accent` | `--accent` |

**§9.1 fontSize 매핑 (OQ #3 LOCKED):**

| 옛 인라인 | v0.1.1 className | px |
|---|---|---|
| `fontSize: 9~11` (label, footer, 서브, role/title) | `text-caption` (12, 노안 격상) | 12 |
| `fontSize: 12` | `text-caption` | 12 |
| `fontSize: 13` (input/카드 이름) | `text-label` | 13 |
| `fontSize: 14` (input 본문, 로그인 버튼) | `text-body-sm` (또는 `text-body` 본문이면 16) | 14/16 |
| `fontSize: 16` (타이틀) | `text-body` (본문 마지노선) | 16 |

**§9.2 radius 매핑:**

| 옛 인라인 | className | px |
|---|---|---|
| `borderRadius: 7` (icon img) | `rounded-[7px]` arbitrary | 7 |
| `borderRadius: 10` (staff initial) | `rounded-[10px]` arbitrary | 10 |
| `borderRadius: 11` (로고 박스) | `rounded-[11px]` arbitrary | 11 |
| `borderRadius: 12` (input, 카드 button) | `rounded-md` 토큰 또는 인라인 명시 | 12 |
| `borderRadius: 16` (폼 컨테이너, 카드 그리드 컨테이너) | `rounded-lg` 토큰 또는 인라인 명시 | 16 |
| `borderRadius: 20` (데스크톱 카드) | `rounded-[20px]` arbitrary | 20 |

**§9.3 w-N / h-N override 함정:**
tailwind.config 의 `theme.extend.spacing` 에서 `w-8 = 48px` (기본 32 아님), `w-7 = 32px`. 38/28/34 어떤 값도 토큰 사용 0건 — 인라인 px arbitrary `w-[Npx]` 형태로만 (메모리 룰 6 feedback_tailwind_w8_h8_is_48px).

**§9.4 status- class prefix 룰:**
- 정확 패턴 = `bg-safe-bar` / `text-safe-bar` (prefix 없는 짧은 alias)
- 잘못된 가정 = `bg-status-safe-bar` / `text-status-safe-bar` (status- prefix) — 11-div TSX v3 hotfix(4ce707e) 사고 패턴, class 안 먹음
- (참고: 14-reports W7 §2.1 의 다른 해석은 14-reports 컨텍스트 한정. 본 27-login 은 W1 인덱스 §5 룰 5 verbatim 따라 prefix 없는 짧은 alias 사용.)

---

# §10. (보너스) 비즈 로직 보존 verify 체크리스트

TSX 변환 commit 후 다음 모두 PASS.

- [ ] `useMediaQuery('(min-width: 768px)')` 호출 위치 동일 (line 40)
- [ ] `fetch('/api/public/staff-list')` 호출 위치 동일 (line 43)
- [ ] `setStaffList(j.data)` 호출 위치 동일 (line 44)
- [ ] `selectStaff(id)` handler 시그니처 동일 (line 48~53) — setSelected / setStaffId / setPassword('') / setTimeout pwRef.focus 80ms
- [ ] `handleSubmit(e?: React.FormEvent)` 시그니처 동일 (line 55~72)
- [ ] `authApi.login(staffId.trim(), password)` 호출 동일 (line 61)
- [ ] `login(res.token, res.staff)` Zustand 호출 동일 (line 62)
- [ ] `navigate('/dashboard', { replace: true })` 호출 동일 (line 64)
- [ ] `toast.error(err instanceof ApiError ? err.message : '로그인 실패')` catch 분기 동일 (line 66)
- [ ] `setPassword('')` + `pwRef.current?.focus()` 실패 후 동일 (line 67~68)
- [ ] `setLoading(false)` finally 동일 (line 70)
- [ ] `setShowPw(v => !v)` 토글 동일 (line 145)
- [ ] `e.key === 'Enter' && handleSubmit()` Enter key 동일 (line 139)
- [ ] CARD_COLORS 6 rgba 변경 0 (line 21~28)
- [ ] `s.role === 'admin' ? '관리자' : s.title` 분기 동일 (line 92)
- [ ] `s.name.charAt(0)` initial 동일 (line 91)
- [ ] inputMode="numeric" 사번 input 동일 (line 124)
- [ ] LoginPage default export 시그니처 동일 (line 30: `export default function LoginPage()`)

총 18 항목.

---

# §11. (보너스) 메모리 룰 inline 인용 (10건, W1 인덱스 §5 verbatim)

각 룰: 파일명 + 1줄 요약 + 적용 위치 (변환 wave 안). W1 인덱스 §5 의 10건 inherit.

1. **feedback_design_sketch_first.md** — 디자인 변경은 sketch 1회 컨펌. → W2/W3/W4 산출 후 사용자 컨펌 받은 뒤 변환 wave 진입.
2. **feedback_redesign_sketch_rule_enforcement.md** — status 색 미적 사용 금지. → CARD_COLORS 카테고리 색 / 로그인 버튼만 CTA safe.
3. **feedback_sketch_realistic_data.md** — 카피/분기 룰 그대로. → "차바이오컴플렉스 방재팀" / "사번 10자리" / "표시"/"숨김" / ☎ 등 모두 verbatim.
4. **feedback_planner_prompt_sketch_verbatim.md** — sketch CSS verbatim 인용. → 본 §3 변환 매핑 표 전체 sketch verbatim.
5. **feedback_tailwind_token_class_pattern.md** — status- prefix 없는 짧은 alias. → `bg-safe-bar` / `text-text-on-accent` (prefix 0건).
6. **feedback_tailwind_w8_h8_is_48px.md** — w-8 = 48 함정. → 38/28/34 모두 인라인 px arbitrary `w-[Npx]`.
7. **feedback_text_caption_leading_none.md** — 작은 컨테이너 text-caption leading-none. → 서브 / 라벨 / role/title / 카드 이름 모두 leading-none 명시.
8. **feedback_tsx_wave_emoji_dot_gap.md** — 이모지 0건 + dot span markup. → 27-login dot span 미사용 (단일 텍스트 sub). ☎ 만 OQ #4 LOCKED 예외.
9. **feedback_tsx_wave_stat_card_drift.md** — Stat Card 룰 미적용 명시. → 27-login 에 28px display 숫자 없음, design-system §6.2 적용 대상 0.
10. **feedback_avoid_premature_confirmation.md** — 자신감 표현 금지. → 본 W5 commit 후 "변환 가능 / 다음 wave 진입" 표현 금지, 사용자 컨펌 명시 받은 후에만.

---

# §12. 다음 단계 (변환 wave 진입 트리거)

본 W5 checklist 작성 + W2/W3/W4 sketch 머지 + cbc7119-preview 자동 배포 시각 검수 → **사용자 컨펌 명시 받은 후** TSX 변환 wave (`redesign/27-login` 안 atomic 1-commit):

1. `/clear` (컨텍스트 리셋, memory feedback_gsd_workflow_strict)
2. `/gsd:quick` 새 task 시작 — id 별도 (예: `260521-XXX-redesign-27-login-tsx`)
3. PLAN.md = LoginPage.tsx in-place 수정 1 task. 본 W5 checklist + W2/W3/W4 sketch 3개 attach.
4. executor 가 §3 변환 매핑 표 1:1 적용 → §5 negative gate + §6 positive gate + §7 build gate 모두 PASS → atomic 1-commit (`tsx(quick-XXX): redesign/27-login TSX 변환 (W2/W3/W4 sketch verbatim 적용)`)
5. main 머지 → cbc7119-preview 자동 배포 → 사용자 시각 검수 → 직원 도메인 (cbc7119) 배포는 별도 worktree (20260328) 담당

---

본 W5 checklist 가 PASS 하면 redesign/27-login sketch 단계 4 wave 완결.
다음 wave = TSX 변환 wave (별도 quick task).

---
phase: quick-260516-kmw
plan: 01
type: execute
wave: 1
depends_on: [260516-k2u, 260516-027]
files_modified:
  - cha-bio-safety/src/pages/QRScanPage.tsx
autonomous: true
requirements:
  - QUICK-260516-kmw
must_haves:
  truths:
    - "QRScanPage.tsx 전체 (현 line 1~297, 페이지 본문 + Spinner 서브 컴포넌트 + 공통 스타일 객체 primaryBtnSt/ghostBtnSt/inputSt) 변환 후 인라인 style 속성 0건 (화이트리스트: `<div id={QR_REGION_ID} style={{ width:'100%' }} />` 한 줄만 html5-qrcode 라이브러리 호환 필수) + var(--bg/bg2/bg3/bd/bd2/t1/t2/t3/acl/danger/safe/warn) 인라인 0건 + 9·10·11px 폰트 0건 + 본문 이모지 0건 (📷🔍 모두 제거)"
    - "lucide-react import 신설 — 기존 import 없음 (line 1~6 에 react/react-dom/react-router-dom/html5-qrcode/authStore/types 만). 신규 추가 3종 `Camera`, `ScanLine`, `Loader2`. 기존 import 라인은 그대로 보존."
    - "이모지 → lucide 매핑 (3종): fontSize 28 카메라 글자 (line 212) → `<Camera size={28} className=\"text-danger\" />` / fontSize 40 검색 글자 (line 236) → `<ScanLine size={40} className=\"text-text-secondary\" />` (QR 컨텍스트 시각적 적합, sketch 권위) / Spinner CSS keyframes spin .7s (line 270~276) → `<Loader2 size={28} className=\"animate-spin text-accent\" />` (Tailwind 내장, JS keyframes 불필요)"
    - "헤더 토글 버튼 변환 (line 173~186, scan stage 수동입력 ghost / manual stage 카메라 ghost) — Tailwind className 으로 교체. scan: `h-8 px-2.5 rounded-md bg-surface-raised border border-border-default text-caption font-semibold text-text-secondary cursor-pointer` / manual: 동일 패턴이되 text-text-secondary → text-accent (sketch 권위 — manual stage 일 때 accent 강조)"
    - "QR reader wrapper 변환 (line 201~208) — `w-full max-w-[320px] rounded-[20px] overflow-hidden bg-black ring-1 ring-border-strong relative` (옛 boxShadow 0 0 0 1px var(--bd2) → ring-1 ring-border-strong). loading overlay: `absolute inset-0 bg-black/60 flex items-center justify-center z-10`"
    - "카메라 에러 카드 변환 (line 211~218) — `w-full max-w-[320px] bg-danger-bg border border-danger-bar/40 rounded-xl p-4 text-center` (옛 rgba(239,68,68,.08~.2) → 단일 토큰 페어) + Camera size=28 text-danger 아이콘 + `mt-2 text-caption text-text-secondary leading-relaxed whitespace-pre-line` 메시지 + `mt-3 flex gap-2` 버튼 row (다시 시도 primary / 수동 입력 ghost)"
    - "정상 안내문 변환 (line 219~223) — `text-caption text-text-secondary text-center` (옛 fontSize:12 var(--t2) → text-caption text-text-secondary, 토큰 12 유지)"
    - "cpError 카드 변환 (line 225~229 + 255~259, 동일 패턴 2회 출현) — `w-full max-w-[320px] bg-danger-bg border border-danger-bar/40 rounded-lg px-3 py-2.5 text-caption text-danger text-center whitespace-pre-line leading-relaxed` (옛 rgba(239,68,68,.1~.25) → bg-danger-bg + border danger-bar/40)"
    - "Manual stage 변환 (line 234~261) — 큰 ScanLine 아이콘 (size=40, text-text-secondary) + label `block text-caption font-bold text-text-secondary mb-1.5` + input 인라인 className (Section 9 — inputSt 객체 폐기) + primary button `w-full max-w-[320px] py-3 rounded-xl border-0 bg-accent text-on-accent text-body-sm font-bold cursor-pointer transition-opacity` + disabled opacity-50"
    - "공통 스타일 객체 3종 (line 279~297) 모두 제거 — primaryBtnSt → 인라인 `w-full py-3 rounded-xl border-0 bg-accent text-on-accent text-body-sm font-bold cursor-pointer transition-opacity` (단색 채택, sketch decision — 옛 linear-gradient(135deg,#1d4ed8,#0ea5e9) 폐기). ghostBtnSt → 인라인 `py-3 px-4 rounded-xl bg-surface-raised border border-border-default text-text-secondary text-caption font-bold cursor-pointer`. inputSt → 인라인 `w-full px-3.5 py-3 rounded-lg bg-surface-raised border border-border-default text-text-primary text-body-sm outline-none font-inherit`."
    - "Spinner 서브 컴포넌트 (line 270~276) 완전 제거 — `<style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>` JS-side keyframes 블록 포함 통째로 삭제 후 Loader2 lucide 컴포넌트로 대체. function Spinner() 정의 자체 제거 (사용처 1개 = QR reader loading overlay, line 205)."
    - "비즈니스 로직 100% 보존 (한 줄도 수정 X) — Stage 'scan' | 'manual' (line 9, 17) / HEADER_PORTAL_ID portal slot (line 12, 158~169) / Html5Qrcode startCamera / stopCamera / scannedRef / scannerRef (line 25~143) / ultra wide deviceId 자동 선택 정규식 `/ultra[\\s-]?wide|초광각|울트라/i` (line 107~109) / zoom 0.5x 안전망 track.applyConstraints (line 125~133) / lookupCheckpoint API + navigate('/inspection', { state: { qrCheckpoint: cp } }) (line 49~75) / camError / cpError / loading / scanning / manualQr state (line 17~22) / handleManualSearch + Enter 키 (line 146~149, 243) / useEffect mount/unmount cleanup (line 152~155) / HEADER_PORTAL_ID requestAnimationFrame fallback (line 158~169) — 모든 분기 키워드/조건/문자열/정규식 100% 보존"
    - "본문 이모지 0건 — QRScanPage.tsx 전체에서 📷/🔍 모두 제거 후 lucide 컴포넌트로 치환. Spinner CSS keyframes 도 함께 제거."
    - "9·10·11px 폰트 모두 12px 이상 격상 — fontSize:11 (line 175/182/213/220/226/238/256) 모두 text-caption(12)으로 / fontSize:12 (line 213/220/289) 모두 text-caption(12) 또는 text-body-sm(13) 으로 / fontSize:13 (line 282/295) text-body-sm(13). text-[Xpx] arbitrary 잔존 0."
    - "TypeScript 컴파일 0 에러 (`npx tsc -p . --noEmit` PASS 또는 `npm run build` PASS)"
    - "다른 컴포넌트/페이지 0건 수정 — git status 에 QRScanPage.tsx + PLAN + SUMMARY 만 표시 (GlobalHeader.tsx / icons.tsx / tailwind.config.js / 다른 페이지 모두 변경 X)"
    - "sketch (00858ae qr-scan-sketch.html, 1507 라인) 1:1 매핑 — 색 결정 (단일 토큰 페어 bg-danger-bg + border danger-bar/40) / 폰트 격상 (9·10·11 → 12·13·14) / 아이콘 매핑 (Camera/ScanLine/Loader2) / 헤더 토글 ghost (text-secondary scan / text-accent manual) / primary 단색 채택 (linear-gradient 폐기) 모두 sketch 권위 그대로"
    - "qr-scan-sketch.html / GlobalHeader.tsx / icons.tsx / tailwind.config.js / 다른 페이지 / 다른 sketch HTML — 단 한 줄도 수정 X"
  artifacts:
    - path: "cha-bio-safety/src/pages/QRScanPage.tsx"
      provides: "redesign/03-qr-scan Wave 1 변환 — 페이지 본문 + Spinner + 스타일 객체 모두 v0.1.1 토큰 + Tailwind + lucide"
      contains: "QRScanPage 본문 / Spinner 제거 / primaryBtnSt/ghostBtnSt/inputSt 제거"
  key_links:
    - from: "cha-bio-safety/src/pages/QRScanPage.tsx"
      to: "cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html"
      via: "1:1 매핑 — 6 viewport (모바일다크/라이트 + 데스크톱다크/라이트 + 보너스 2종) 색/스페이싱/아이콘/폰트 결정 source (commit 00858ae, Wave 1 시안 권위)"
      pattern: "qr-scan-sketch"
    - from: "Wave 1 변환 패턴 (260516-kmw)"
      to: "07-elevator Wave 11 변환 (260516-027)"
      via: "1:1 mirror — frontmatter 구조, verify gate Section A~H, 단일 영역 변환 패턴, lucide import 확장 패턴, sketch 1:1 매핑 룰, 비즈니스 로직 보존 원칙"
      pattern: "wave-11-mirror"
---

<objective>
redesign/03-qr-scan 첫 TSX 변환 wave (Wave 1) — sketch (commit 00858ae, qr-scan-sketch.html, 1507라인) 권위로 QRScanPage.tsx (line 1~297, 1개 파일) v0.1.1 토큰 + Tailwind + lucide 변환. 07-elevator Wave 11 (260516-027) 1:1 mirror structure.

Purpose: 03-qr-scan sketch 사용자 검수 OK. 1:1 매핑 변환. redesign/03-qr-scan 의 첫 TSX wave — 페이지 1개 자체가 단순 구조라 단일 wave 로 완료 가능 (07-elevator 처럼 wave 분할 불필요). 이후 사용자 검수 → main 머지 → redesign/03-qr-scan 페이지 완료.

Output: QRScanPage.tsx 1개 파일 변경. 약 -50 줄 추정 (Spinner 서브 컴포넌트 7줄 + 스타일 객체 3종 19줄 + 인라인 30+ 위치 다수 → 인라인 className 통합으로 감소). 다른 파일 0건. sketch 0건 변경 (이미 commit 00858ae 완료).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260516-kmw-redesign-03-qr-scan-tsx-wave-1-qrscanpag/

# 메모리 권위
# - project_redesign_workflow.md → redesign/NN 브랜치 + sketch HTML 먼저 → TSX 변환 + GSD(/gsd:quick) + 즉시 푸시 / main 머지 차수별
# - feedback_redesign_sketch_rule_enforcement.md → sketch 권위 + 4중 verify gate (executor 프롬프트 + verify gate + 자체 검수)
# - feedback_sketch_realistic_data.md → 비즈니스 로직 100% 보존, 시각만 손봄
# - project_design_tokens_branch.md → v0.1.1 시각 토큰 (text-text-primary/secondary/tertiary, bg-surface-raised/sunken, border-border-default, bg-danger-bg/safe-bg/warning-bg, danger/safe/warning foreground 등)
# - feedback_deploy_test.md → redesign 브랜치 작업은 사용자 명시 컨펌 후에만 main 머지+배포. 변환 wave 단독 배포 X.
# - feedback_check_branch_before_edit.md → 현재 redesign/03-qr-scan 브랜치 확인 후 작업
# - feedback_avoid_premature_confirmation.md → 변환 결과 보여주고 사용자 판단 — "거의 일치" 자체 평가 금지

# sketch 권위 (1:1 매핑 source — Wave 1, 03-qr-scan 시안 권위)
# - 00858ae qr-scan-sketch.html (1507 라인)
# - 6 viewport: VP1 모바일다크 (Scan 정상 reader + 안내문 + 240×240 코너) / VP2 모바일라이트 (Scan 에러 camError + cpError) / VP3 데스크톱다크 (Manual ScanLine 40 + input + primary 3 variant) / VP4 데스크톱라이트 (4 영역 카탈로그 + OLD 그라디언트 비교) / VP5 모바일다크 (cpError 후 reader 재기동) / VP6 모바일라이트 (Manual 기본)
# - Sketch decision: primary 버튼 단색 (bg-accent text-on-accent) — 옛 linear-gradient(135deg,#1d4ed8,#0ea5e9) 폐기 / 에러 카드 색 페어 통일 (camError + cpError 모두 bg-danger-bg + border danger-bar/40) / 헤더 토글 ghost (scan text-secondary / manual text-accent) / 240×240 코너 4 마커는 html5-qrcode 라이브러리 가이드 우선 (sketch 가이드는 시각적 참고만)
# - 이모지 → lucide 3종: 📷→Camera size 28 text-danger / 🔍→ScanLine size 40 text-text-secondary (QR 컨텍스트 시각 적합) / Spinner keyframes→Loader2 animate-spin

# 코드 source (Read 검증 완료, 2026-05-16)
# - QRScanPage.tsx (line 1~297):
#   · 헤더 토글 (line 171~186): scan stage / manual stage 분기 ghost btn — 9 props 인라인 × 2
#   · root div (line 190): width 100% height 100% flex column overflow hidden var(--bg)
#   · main (line 195): flex 1 minHeight 0 overflow auto flex column
#   · Scan stage wrapper (line 198~199): flex column items-center padding 20px 16px gap 16
#   · QR reader wrap (line 201): w 100% maxWidth 320 radius 20 overflow hidden bg #000 boxShadow var(--bd2) position relative
#   · QR_REGION_ID 인라인 (line 202): style={{ width:'100%' }} — html5-qrcode 호환 필수 (화이트리스트 1줄)
#   · loading overlay (line 204): position absolute inset 0 background rgba(0,0,0,0.6) flex center z 10
#   · camError 카드 (line 211): w 100% maxWidth 320 background rgba(239,68,68,.08) border 1px rgba(239,68,68,.2) radius 12 padding 14px 16px textAlign center
#   · 📷 (line 212): fontSize 28 marginBottom 8
#   · camError 메시지 (line 213): fontSize 12 color var(--t2) lineHeight 1.6 whiteSpace pre-line marginBottom 12
#   · 카메라 에러 버튼 row (line 214~217): display flex gap 8 + primary 다시 시도 + ghost 수동 입력
#   · 정상 안내문 (line 220): fontSize 12 color var(--t2) textAlign center
#   · cpError × 2 (line 226, 256): w 100% maxWidth 320 background rgba(239,68,68,.1) border 1px rgba(239,68,68,.25) radius 10 padding 10px 13px fontSize 11 color var(--danger) textAlign center whiteSpace pre-line lineHeight 1.5
#   · Manual stage wrapper (line 235): flex column items-center justify-center padding 24 gap 16
#   · 🔍 (line 236): fontSize 40 textAlign center
#   · input wrap (line 237): w 100% maxWidth 320
#   · label (line 238): fontSize 11 fontWeight 700 color var(--t2) display block marginBottom 6
#   · input (line 239~246): inputSt 객체 사용 + autoFocus + onKeyDown Enter + placeholder
#   · primary button (line 248~254): primaryBtnSt 객체 + width 100% maxWidth 320 + opacity 0.5 disabled
#   · Spinner (line 270~276): width 28 height 28 border 2px rgba(255,255,255,.2) borderTopColor var(--acl) radius 50% animation 'spin .7s linear infinite' + <style>{'@keyframes spin{...}'}</style>
#   · primaryBtnSt (line 279~284): width 100% padding 13px 0 radius 12 border none background linear-gradient(135deg,#1d4ed8,#0ea5e9) color #fff fontSize 13 fontWeight 700 cursor pointer boxShadow 0 4px 14px rgba(37,99,235,0.35) transition opacity .13s
#   · ghostBtnSt (line 286~290): padding 12px 16px radius 12 background var(--bg2) border 1px var(--bd2) color var(--t2) fontSize 12 fontWeight 600 cursor pointer
#   · inputSt (line 292~297): w 100% padding 11px 13px radius 10 background var(--bg2) border 1px var(--bd2) color var(--t1) fontSize 13 outline none fontFamily inherit
# - lucide-react import (line 1~6): 신규 — 기존 import 0개. line 4 `import { Html5Qrcode } from 'html5-qrcode'` 옆에 신규 라인 추가 또는 기존 import 들 사이.
# - tailwind.config.js 토큰: text-text-primary/secondary/tertiary, bg-surface-raised/sunken, border-border-default/border-strong, bg-danger-bg/safe-bg/warning-bg, danger/safe/warning (foreground), bg-accent/text-on-accent, text-accent, danger-bar
# - typography 토큰: text-caption (12) / text-body-sm (13) / text-body (14) — 16px 헤더 텍스트는 변환 영역 외 (페이지 본문 사용 없음)

@cha-bio-safety/src/pages/QRScanPage.tsx
@cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html
@cha-bio-safety/tailwind.config.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: QRScanPage.tsx 변환 + verify gate</name>
  <files>cha-bio-safety/src/pages/QRScanPage.tsx</files>
  <action>
sketch (00858ae qr-scan-sketch.html) 권위 1:1 매핑. QRScanPage.tsx 전체 (line 1~297) 단일 wave 변환.

### 1. lucide-react import 신설

기존 (line 1~6):
```ts
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { useAuthStore } from '../stores/authStore'
import type { CheckPoint } from '../types'
```

추가 (Html5Qrcode import 뒤, line 4와 5 사이):
```ts
import { Camera, ScanLine, Loader2 } from 'lucide-react'
```

### 2. 헤더 토글 버튼 변환 (line 171~186)

기존 (scan stage):
```tsx
<button
  onClick={() => { stopCamera(); setStage('manual') }}
  style={{ height:32, padding:'0 10px', borderRadius:7, background:'var(--bg3)', border:'1px solid var(--bd)', fontSize:11, fontWeight:600, color:'var(--t2)', cursor:'pointer' }}
>
  수동입력
</button>
```

변환:
```tsx
<button
  onClick={() => { stopCamera(); setStage('manual') }}
  className="h-8 px-2.5 rounded-md bg-surface-raised border border-border-default text-caption font-semibold text-text-secondary cursor-pointer"
>
  수동입력
</button>
```

기존 (manual stage):
```tsx
<button
  onClick={() => { setStage('scan'); startCamera() }}
  style={{ height:32, padding:'0 10px', borderRadius:7, background:'var(--bg3)', border:'1px solid var(--bd)', fontSize:11, fontWeight:600, color:'var(--acl)', cursor:'pointer' }}
>
  카메라
</button>
```

변환:
```tsx
<button
  onClick={() => { setStage('scan'); startCamera() }}
  className="h-8 px-2.5 rounded-md bg-surface-raised border border-border-default text-caption font-semibold text-accent cursor-pointer"
>
  카메라
</button>
```

매핑:
- height:32 → h-8
- padding '0 10px' → px-2.5 (10px 근사)
- borderRadius:7 → rounded-md (6px 근사)
- background var(--bg3) → bg-surface-raised
- border 1px var(--bd) → border border-border-default
- fontSize:11 → text-caption (12 격상)
- fontWeight:600 → font-semibold
- color var(--t2) → text-text-secondary (scan)
- color var(--acl) → text-accent (manual)

### 3. root div 변환 (line 190)

기존:
```tsx
<div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>
```

변환:
```tsx
<div className="w-full h-full flex flex-col overflow-hidden bg-bg">
```

bg-bg 토큰이 tailwind.config.js 에 없으면 `bg-surface-base` 또는 `bg-background` 매핑 검증 필요 — Read 시점 v0.1.1 토큰 확인. 일반적으로 v0.1.1 은 `bg-background` 또는 `bg-surface-base` 패턴.

대안: 페이지 root 가 GlobalHeader 외 영역이라 부모 컨테이너가 이미 bg 적용 중이면 className 에서 bg 제거 가능. Read 검증 시 GlobalHeader 와 부모 레이아웃 컨텍스트 확인.

### 4. main 변환 (line 195)

기존:
```tsx
<main style={{ flex:1, minHeight:0, overflowY:'auto', display:'flex', flexDirection:'column' }}>
```

변환:
```tsx
<main className="flex-1 min-h-0 overflow-y-auto flex flex-col">
```

### 5. Scan stage wrapper 변환 (line 198~199)

기존:
```tsx
<div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 16px', gap:16 }}>
```

변환:
```tsx
<div className="flex-1 flex flex-col items-center px-4 py-5 gap-4">
```

매핑:
- padding '20px 16px' → px-4 py-5
- gap:16 → gap-4

### 6. QR reader wrapper 변환 (line 201~208)

기존:
```tsx
<div style={{ width:'100%', maxWidth:320, borderRadius:20, overflow:'hidden', background:'#000', boxShadow:'0 0 0 1px var(--bd2)', position:'relative' }}>
  <div id={QR_REGION_ID} style={{ width:'100%' }} />
  {loading && (
    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
      <Spinner />
    </div>
  )}
</div>
```

변환:
```tsx
<div className="w-full max-w-[320px] rounded-[20px] overflow-hidden bg-black ring-1 ring-border-strong relative">
  <div id={QR_REGION_ID} style={{ width:'100%' }} />
  {loading && (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
      <Loader2 size={28} className="animate-spin text-accent" />
    </div>
  )}
</div>
```

**중요 — 화이트리스트:** `<div id={QR_REGION_ID} style={{ width:'100%' }} />` 한 줄 인라인 style 은 html5-qrcode 라이브러리 호환 필수 (라이브러리가 video 요소를 이 div 안에 inject — width 100% 필수). 이 한 줄만 인라인 style 잔존 허용.

매핑:
- maxWidth:320 → max-w-[320px] (arbitrary, 320px 토큰 미정의)
- borderRadius:20 → rounded-[20px] (arbitrary)
- background:'#000' → bg-black
- boxShadow:'0 0 0 1px var(--bd2)' → ring-1 ring-border-strong (1px inset border 효과)
- position:'relative' → relative
- 'rgba(0,0,0,0.6)' → bg-black/60 (60% alpha)
- z-index:10 → z-10
- `<Spinner />` → `<Loader2 size={28} className="animate-spin text-accent" />`

### 7. 카메라 에러 카드 변환 (line 211~218)

기존:
```tsx
<div style={{ width:'100%', maxWidth:320, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
  <div style={{ fontSize:28, marginBottom:8 }}>📷</div>
  <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6, whiteSpace:'pre-line', marginBottom:12 }}>{camError}</div>
  <div style={{ display:'flex', gap:8 }}>
    <button onClick={startCamera} style={{ ...primaryBtnSt, flex:1 }}>다시 시도</button>
    <button onClick={() => { stopCamera(); setStage('manual') }} style={{ ...ghostBtnSt, flex:1 }}>수동 입력</button>
  </div>
</div>
```

변환:
```tsx
<div className="w-full max-w-[320px] bg-danger-bg border border-danger-bar/40 rounded-xl p-4 text-center">
  <Camera size={28} className="text-danger mx-auto mb-2" />
  <div className="text-caption text-text-secondary leading-relaxed whitespace-pre-line mb-3">{camError}</div>
  <div className="flex gap-2">
    <button
      onClick={startCamera}
      className="flex-1 py-3 rounded-xl border-0 bg-accent text-on-accent text-body-sm font-bold cursor-pointer transition-opacity"
    >
      다시 시도
    </button>
    <button
      onClick={() => { stopCamera(); setStage('manual') }}
      className="flex-1 py-3 px-4 rounded-xl bg-surface-raised border border-border-default text-text-secondary text-caption font-bold cursor-pointer"
    >
      수동 입력
    </button>
  </div>
</div>
```

매핑:
- rgba(239,68,68,.08) → bg-danger-bg
- rgba(239,68,68,.2) → border-danger-bar/40 (sketch decision — alpha 0.40~0.45)
- padding '14px 16px' → p-4 (16px 근사)
- fontSize:28 📷 → Camera size=28 text-danger (이모지 제거)
- marginBottom:8 → mb-2 (8px)
- fontSize:12 var(--t2) lineHeight 1.6 → text-caption text-text-secondary leading-relaxed
- marginBottom:12 → mb-3
- gap:8 → gap-2
- primaryBtnSt + flex:1 → 인라인 className (스타일 객체 폐기, Section 11 참조)
- ghostBtnSt + flex:1 → 인라인 className

### 8. 정상 안내문 변환 (line 219~223)

기존:
```tsx
<div style={{ fontSize:12, color:'var(--t2)', textAlign:'center' }}>
  QR 코드를 카메라에 비춰주세요
</div>
```

변환:
```tsx
<div className="text-caption text-text-secondary text-center">
  QR 코드를 카메라에 비춰주세요
</div>
```

### 9. cpError 카드 변환 × 2 (line 225~229 + 255~259)

기존 (동일 패턴 2회):
```tsx
<div style={{ width:'100%', maxWidth:320, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, padding:'10px 13px', fontSize:11, color:'var(--danger)', textAlign:'center', whiteSpace:'pre-line', lineHeight:1.5 }}>
  {cpError}
</div>
```

변환 (2회 모두):
```tsx
<div className="w-full max-w-[320px] bg-danger-bg border border-danger-bar/40 rounded-lg px-3 py-2.5 text-caption text-danger text-center whitespace-pre-line leading-relaxed">
  {cpError}
</div>
```

매핑:
- rgba(239,68,68,.1) → bg-danger-bg (단일 토큰 — alpha 0.10)
- rgba(239,68,68,.25) → border-danger-bar/40 (sketch decision 통일)
- borderRadius:10 → rounded-lg (8px 근사)
- padding '10px 13px' → px-3 py-2.5
- fontSize:11 → text-caption (12 격상)
- var(--danger) → text-danger
- lineHeight:1.5 → leading-relaxed

### 10. Manual stage 변환 (line 234~261)

기존 wrapper (line 235):
```tsx
<div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, gap:16 }}>
```

변환:
```tsx
<div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
```

기존 🔍 (line 236):
```tsx
<div style={{ fontSize:40, textAlign:'center' }}>🔍</div>
```

변환:
```tsx
<ScanLine size={40} className="text-text-secondary mx-auto" />
```

기존 input wrap + label + input (line 237~247):
```tsx
<div style={{ width:'100%', maxWidth:320 }}>
  <label style={{ fontSize:11, fontWeight:700, color:'var(--t2)', display:'block', marginBottom:6 }}>QR 코드 값</label>
  <input
    autoFocus
    value={manualQr}
    onChange={e => setManualQr(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
    placeholder="예: QR-3F-OFF-001"
    style={inputSt}
  />
</div>
```

변환:
```tsx
<div className="w-full max-w-[320px]">
  <label className="block text-caption font-bold text-text-secondary mb-1.5">QR 코드 값</label>
  <input
    autoFocus
    value={manualQr}
    onChange={e => setManualQr(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
    placeholder="예: QR-3F-OFF-001"
    className="w-full px-3.5 py-3 rounded-lg bg-surface-raised border border-border-default text-text-primary text-body-sm outline-none font-inherit"
  />
</div>
```

기존 primary button (line 248~254):
```tsx
<button
  onClick={handleManualSearch}
  disabled={!manualQr.trim() || loading}
  style={{ ...primaryBtnSt, width:'100%', maxWidth:320, opacity:(!manualQr.trim() || loading) ? 0.5 : 1 }}
>
  {loading ? '조회 중...' : '체크포인트 조회'}
</button>
```

변환:
```tsx
<button
  onClick={handleManualSearch}
  disabled={!manualQr.trim() || loading}
  className={`w-full max-w-[320px] py-3 rounded-xl border-0 bg-accent text-on-accent text-body-sm font-bold cursor-pointer transition-opacity ${(!manualQr.trim() || loading) ? 'opacity-50' : ''}`}
>
  {loading ? '조회 중...' : '체크포인트 조회'}
</button>
```

매핑:
- padding:24 → p-6
- fontSize:40 🔍 → ScanLine size=40 text-text-secondary (이모지 제거)
- fontSize:11 fontWeight:700 var(--t2) → text-caption font-bold text-text-secondary
- marginBottom:6 → mb-1.5
- inputSt 객체 → 인라인 className (Section 11 참조)
- primaryBtnSt + width 100% maxWidth 320 + opacity dynamic → 인라인 className + 조건부 opacity-50

### 11. 공통 스타일 객체 3종 제거 (line 279~297)

`primaryBtnSt`, `ghostBtnSt`, `inputSt` 정의 자체 제거. 각 사용처(camError row 의 다시 시도/수동 입력 + manual stage 의 input + 체크포인트 조회 버튼) 에서 인라인 className 으로 교체 완료 후 정의 코드 라인 (line 279~297) 전체 삭제.

`React` import 도 사용처 0 되면 검토 — line 279 의 `React.CSSProperties` 타입만 사용. 변환 후 사용처 0 → import 제거 가능. 단, 다른 곳에서 React.* 사용하지 않는지 grep 확인 필수 (현재 코드 line 1~6 에 React import 없음, named import 만 사용 — 별도 작업 불필요).

### 12. Spinner 서브 컴포넌트 제거 (line 270~276)

`function Spinner()` 정의 + `<style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>` 블록 통째로 삭제. 사용처 1곳 (line 205, QR reader loading overlay) 은 이미 Section 6 에서 Loader2 lucide 컴포넌트로 교체 완료.

### 13. 보존 항목 (절대 건드리지 말 것)

- **비즈니스 로직 100%**:
  - Stage `'scan' | 'manual'` (line 9, 17)
  - `QR_REGION_ID = 'qr-reader-region'` (line 11)
  - `HEADER_PORTAL_ID = 'qr-header-portal-slot'` (line 12)
  - state: camError / cpError / loading / scanning / manualQr / stage / headerSlot (line 17~23)
  - refs: scannerRef / scannedRef (line 25~26)
  - `stopCamera` 함수 전체 (line 29~46) — try/catch + getTracks + setScanning false
  - `lookupCheckpoint` 함수 전체 (line 49~75) — `/api/checkpoints?qr=...` API + state.qrCheckpoint navigation + cpError fallback + scannedRef reset + startCamera 재기동
  - `startCamera` 함수 전체 (line 78~143) — Html5Qrcode.getCameras + 권한 프라임 + ultra wide 정규식 `/ultra[\s-]?wide|초광각|울트라/i` + scannerRef.current.start qrbox 240×240 fps 10 + zoom 0.5x 안전망 (track.applyConstraints) + 권한 거부 분기 메시지
  - `handleManualSearch` (line 146~149)
  - `useEffect` mount/unmount cleanup (line 152~155)
  - `useEffect` HEADER_PORTAL_ID + requestAnimationFrame fallback (line 158~169)
  - `createPortal(headerToggleBtn, headerSlot)` (line 192)
- **타입**: `import type { CheckPoint } from '../types'`
- **GlobalHeader.tsx / icons.tsx / tailwind.config.js / 다른 페이지 / 다른 컴포넌트**: 0건 수정
- **qr-scan-sketch.html (00858ae)**: 0건 수정 — sketch 권위 보존
- **bg-bg 토큰 검증**: tailwind.config.js Read 후 토큰 명 확인. 없으면 `bg-background` 또는 `bg-surface-base` 매핑 또는 부모 컨테이너 처리.

### 14. 작업 순서 (안전)

1. **Read 검증** (변환 전 필수):
   - `cha-bio-safety/src/pages/QRScanPage.tsx` (1~297) Read — 현재 코드 line 위치 확정
   - `cha-bio-safety/tailwind.config.js` Read — v0.1.1 토큰 이름 확정 (text-text-secondary / bg-surface-raised / bg-danger-bg / border-danger-bar / bg-accent / text-on-accent / text-accent / ring-border-strong / text-caption / text-body-sm 등 존재 여부)
   - `cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html` Read — 헤더 토글 / 에러 카드 / primary 버튼 / Manual stage / Loader2 색 결정 재확인
2. lucide-react import 추가 (line 4와 5 사이 신규 라인) — Camera/ScanLine/Loader2 3종
3. 헤더 토글 변환 (line 173~186) — scan + manual 2회
4. root div / main 변환 (line 190, 195) — bg 토큰 검증 결과 반영
5. Scan stage wrapper / QR reader wrapper / loading overlay (Loader2) (line 198~208)
6. 카메라 에러 카드 변환 (line 211~218) — Camera 아이콘 + 메시지 + 버튼 row (primary/ghost 인라인 className)
7. 정상 안내문 (line 219~223)
8. cpError 카드 (line 225~229) — 1회차
9. Manual stage wrapper (line 234~235) + ScanLine + input wrap + label + input + primary button (line 236~254)
10. cpError 카드 (line 255~259) — 2회차 (1회차와 동일 패턴)
11. Spinner 함수 정의 제거 (line 269~276)
12. 스타일 객체 3종 제거 (primaryBtnSt / ghostBtnSt / inputSt, line 278~297)
13. `npx tsc -p . --noEmit` 또는 `npm run build` PASS 확인 (TS 0 에러)
14. grep gate 통과 확인 (verify 블록 Section A~H)
15. commit (단일 — feat(260516-kmw): Wave 1 — redesign/03-qr-scan TSX 변환 ...)
  </action>
  <verify>
    <automated>
cd cha-bio-safety && \
  echo "=== Section A: 라인 변동 (Wave 1 변환 후 합리적 범위) ===" && \
  echo "QRScanPage.tsx lines: $(wc -l < src/pages/QRScanPage.tsx) (현 297. expect 230~310 — Spinner/스타일 객체 제거로 -50 추정, 인라인 className 길이로 일부 보충 가능. 230~310 허용)" && \
  echo "" && \
  echo "=== Section B: 변환 영역 인라인 var() 0건 (QRScanPage.tsx 전체 — 단일 wave 이라 zone 분리 불필요) ===" && \
  echo "var(--bg) count: $(grep -c 'var(--bg)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--bg2): $(grep -c 'var(--bg2)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--bg3): $(grep -c 'var(--bg3)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--bd): $(grep -c 'var(--bd)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--bd2): $(grep -c 'var(--bd2)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--t1): $(grep -c 'var(--t1)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--t2): $(grep -c 'var(--t2)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--t3): $(grep -c 'var(--t3)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--acl): $(grep -c 'var(--acl)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--danger): $(grep -c 'var(--danger)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--safe): $(grep -c 'var(--safe)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "var(--warn): $(grep -c 'var(--warn)' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "rgba(239 (danger inline rgba): $(grep -c 'rgba(239' src/pages/QRScanPage.tsx) (expect 0 — 모두 bg-danger-bg/border-danger-bar 로 치환)" && \
  echo "" && \
  echo "=== Section C: 변환 영역 본문 이모지 0건 (📷🔍 모두 제거) ===" && \
  echo "📷: $(grep -c '📷' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "🔍: $(grep -c '🔍' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "" && \
  echo "=== Section D: 변환 영역 9·10·11px 격상 (arbitrary text-[Xpx] + fontSize:N 모두 0) ===" && \
  echo "text-[9px]: $(grep -c 'text-\[9px\]' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "text-[10px]: $(grep -c 'text-\[10px\]' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "text-[11px]: $(grep -c 'text-\[11px\]' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "fontSize:9: $(grep -cE 'fontSize: ?9[^0-9]' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "fontSize:10: $(grep -cE 'fontSize: ?10[^0-9]' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "fontSize:11: $(grep -cE 'fontSize: ?11[^0-9]' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "" && \
  echo "=== Section E: 변환 영역 인라인 style 속성 (화이트리스트 QR_REGION_ID width:100% 한 줄만 허용) ===" && \
  echo "style={{ 전체 count: $(grep -c 'style={{' src/pages/QRScanPage.tsx) (expect 1 — QR_REGION_ID 라이브러리 호환)" && \
  echo "QR_REGION_ID width inline: $(grep -E 'id=\{QR_REGION_ID\}.*style' src/pages/QRScanPage.tsx | head -1)" && \
  echo "Spinner 정의 잔존: $(grep -c 'function Spinner' src/pages/QRScanPage.tsx) (expect 0 — 함수 제거)" && \
  echo "primaryBtnSt 정의 잔존: $(grep -c 'primaryBtnSt' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "ghostBtnSt 정의 잔존: $(grep -c 'ghostBtnSt' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "inputSt 정의 잔존: $(grep -c 'inputSt' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "@keyframes spin 잔존: $(grep -c '@keyframes spin' src/pages/QRScanPage.tsx) (expect 0)" && \
  echo "linear-gradient(135deg 잔존: $(grep -c 'linear-gradient(135deg' src/pages/QRScanPage.tsx) (expect 0 — sketch decision: primary 단색 채택)" && \
  echo "" && \
  echo "=== Section F: lucide 신규 3종 import 추가 ===" && \
  echo "Camera import: $(grep -c 'Camera' src/pages/QRScanPage.tsx) (expect >= 2 — import + camError 카드 1회)" && \
  echo "ScanLine import: $(grep -c 'ScanLine' src/pages/QRScanPage.tsx) (expect >= 2 — import + manual stage 1회)" && \
  echo "Loader2 import: $(grep -c 'Loader2' src/pages/QRScanPage.tsx) (expect >= 2 — import + QR reader loading 1회)" && \
  echo "lucide-react import line: $(grep -c \"from 'lucide-react'\" src/pages/QRScanPage.tsx) (expect 1)" && \
  echo "" && \
  echo "=== Section G: 비즈니스 로직 보존 — 핵심 키워드 ===" && \
  echo "stage scan/manual: $(grep -cE \"'scan'|'manual'\" src/pages/QRScanPage.tsx) (expect >= 4)" && \
  echo "Html5Qrcode: $(grep -c 'Html5Qrcode' src/pages/QRScanPage.tsx) (expect >= 3)" && \
  echo "QR_REGION_ID: $(grep -c 'QR_REGION_ID' src/pages/QRScanPage.tsx) (expect >= 3)" && \
  echo "HEADER_PORTAL_ID: $(grep -c 'HEADER_PORTAL_ID' src/pages/QRScanPage.tsx) (expect >= 2)" && \
  echo "createPortal: $(grep -c 'createPortal' src/pages/QRScanPage.tsx) (expect >= 2)" && \
  echo "ultra wide regex: $(grep -c 'ultra' src/pages/QRScanPage.tsx) (expect >= 1)" && \
  echo "초광각: $(grep -c '초광각' src/pages/QRScanPage.tsx) (expect 1)" && \
  echo "lookupCheckpoint: $(grep -c 'lookupCheckpoint' src/pages/QRScanPage.tsx) (expect >= 2)" && \
  echo "/api/checkpoints: $(grep -c 'api/checkpoints' src/pages/QRScanPage.tsx) (expect 1)" && \
  echo "navigate('/inspection': $(grep -c \"navigate('/inspection\" src/pages/QRScanPage.tsx) (expect 1)" && \
  echo "qrCheckpoint state: $(grep -c 'qrCheckpoint' src/pages/QRScanPage.tsx) (expect 1)" && \
  echo "zoom 0.5x: $(grep -c 'applyConstraints' src/pages/QRScanPage.tsx) (expect 1)" && \
  echo "handleManualSearch: $(grep -c 'handleManualSearch' src/pages/QRScanPage.tsx) (expect >= 2)" && \
  echo "requestAnimationFrame: $(grep -c 'requestAnimationFrame' src/pages/QRScanPage.tsx) (expect 1)" && \
  echo "" && \
  echo "=== Section H: 다른 파일 0건 변경 — git status ===" && \
  git status --short && \
  echo "" && \
  echo "=== Hard gate (must all PASS) ===" && \
  test $(grep -cE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|danger|safe|warn)\)' src/pages/QRScanPage.tsx) -eq 0 && \
  test $(grep -c '📷' src/pages/QRScanPage.tsx) -eq 0 && \
  test $(grep -c '🔍' src/pages/QRScanPage.tsx) -eq 0 && \
  test $(grep -c 'function Spinner' src/pages/QRScanPage.tsx) -eq 0 && \
  test $(grep -c '@keyframes spin' src/pages/QRScanPage.tsx) -eq 0 && \
  test $(grep -c 'linear-gradient(135deg' src/pages/QRScanPage.tsx) -eq 0 && \
  test $(grep -c 'primaryBtnSt' src/pages/QRScanPage.tsx) -eq 0 && \
  test $(grep -c 'ghostBtnSt' src/pages/QRScanPage.tsx) -eq 0 && \
  test $(grep -c 'inputSt' src/pages/QRScanPage.tsx) -eq 0 && \
  test $(grep -c 'style={{' src/pages/QRScanPage.tsx) -eq 1 && \
  echo "Hard gate PASS" && \
  echo "" && \
  echo "=== TypeScript / npm build ===" && \
  npm run build 2>&1 | tail -10 && \
  echo "=== build PASS ==="
    </automated>
  </verify>
  <done>
- grep gate Section A~H 모두 PASS (라인 변동 합리 / var() 0 / 이모지 0 / 9·10·11px 0 / 인라인 style 1건 화이트리스트(QR_REGION_ID) 한정 / Spinner/스타일 객체 정의 모두 제거 / @keyframes spin 제거 / linear-gradient 제거 / lucide 신규 3종 import + 사용 / 비즈니스 로직 키워드 보존 / git status QRScanPage.tsx 만)
- QRScanPage.tsx 전체 sketch (00858ae) 1:1 매핑 변환
- 헤더 토글 — h-8 px-2.5 rounded-md surface-raised border-default + scan text-text-secondary / manual text-accent
- QR reader wrapper — max-w-[320px] rounded-[20px] bg-black ring-1 ring-border-strong + loading overlay bg-black/60 + Loader2 size=28 text-accent animate-spin
- 카메라 에러 카드 — bg-danger-bg border danger-bar/40 + Camera size=28 text-danger + text-caption text-text-secondary + 다시 시도 primary / 수동 입력 ghost row
- 정상 안내문 — text-caption text-text-secondary text-center
- cpError 카드 × 2 — bg-danger-bg border danger-bar/40 rounded-lg + text-caption text-danger
- Manual stage — ScanLine size=40 text-text-secondary + label text-caption font-bold + input bg-surface-raised border-default + primary 단색 + disabled opacity-50
- Spinner 서브 컴포넌트 제거 (@keyframes spin 블록 포함)
- 스타일 객체 3종 (primaryBtnSt/ghostBtnSt/inputSt) 제거
- 이모지 → lucide 3종 치환: 📷→Camera, 🔍→ScanLine, Spinner→Loader2
- 비즈니스 로직 100% 보존 (Stage / Html5Qrcode / ultra wide / zoom 0.5x / lookupCheckpoint / navigate state / portal slot / requestAnimationFrame 등)
- TypeScript 0 에러, npm run build PASS
- 다른 파일 0건 변경 (`git status` 에 QRScanPage.tsx + PLAN.md + SUMMARY.md 만)
- GlobalHeader.tsx / icons.tsx / tailwind.config.js / qr-scan-sketch.html 0건 수정
  </done>
</task>

<task type="auto">
  <name>Task 2: SUMMARY 작성 + commit</name>
  <files>.planning/quick/260516-kmw-redesign-03-qr-scan-tsx-wave-1-qrscanpag/260516-kmw-SUMMARY.md</files>
  <action>
SUMMARY 작성 후 single code commit. SUMMARY/PLAN docs commit 은 orchestrator 가 worktree merge 후 별도 처리.

### SUMMARY 필수 섹션

- **What changed**: QRScanPage.tsx 전체 (line 1~297) sketch (00858ae qr-scan-sketch.html, 1507 라인) 1:1 변환.
  - (1) lucide import 신설 — Camera/ScanLine/Loader2 3종 추가 (기존 lucide import 0개. 신규 라인 1줄).
  - (2) 헤더 토글 (scan/manual 2회) — h-8 px-2.5 rounded-md bg-surface-raised border border-border-default text-caption font-semibold + scan text-text-secondary / manual text-accent.
  - (3) root div / main — w-full h-full flex flex-col overflow-hidden (bg 토큰 tailwind.config.js 검증 후 적용).
  - (4) QR reader wrapper — max-w-[320px] rounded-[20px] bg-black ring-1 ring-border-strong + relative + loading overlay bg-black/60 + Loader2 size=28 text-accent animate-spin (Spinner 서브 컴포넌트 제거).
  - (5) 카메라 에러 카드 — bg-danger-bg border border-danger-bar/40 rounded-xl p-4 + Camera size=28 text-danger 아이콘 + 메시지 text-caption text-text-secondary leading-relaxed + 다시 시도/수동 입력 버튼 row 인라인 className.
  - (6) 정상 안내문 — text-caption text-text-secondary text-center.
  - (7) cpError 카드 × 2 — bg-danger-bg border-danger-bar/40 rounded-lg px-3 py-2.5 text-caption text-danger.
  - (8) Manual stage — ScanLine size=40 text-text-secondary + label text-caption font-bold text-text-secondary + input bg-surface-raised border-default + primary 단색 (bg-accent text-on-accent) + disabled opacity-50.
  - (9) Spinner 서브 컴포넌트 (line 269~276) 제거 — `<style>{'@keyframes spin{...}'}</style>` 블록 포함 통째.
  - (10) 공통 스타일 객체 3종 (line 278~297) 제거 — primaryBtnSt/ghostBtnSt/inputSt 정의 + 사용처 인라인 className 으로 교체. linear-gradient(135deg,#1d4ed8,#0ea5e9) 그라디언트 폐기 (sketch decision — bg-accent 단색).
  - (11) 이모지 → lucide 매핑 3종: 📷→Camera size=28 text-danger / 🔍→ScanLine size=40 text-text-secondary / Spinner CSS keyframes→Loader2 animate-spin.

- **Why**: redesign/03-qr-scan sketch (00858ae qr-scan-sketch.html, 1507 라인) 사용자 검수 OK. 1:1 매핑 변환. 03-qr-scan 첫 TSX wave — 페이지 1개 단순 구조라 단일 wave 로 완료. 07-elevator Wave 11 (260516-027) 1:1 mirror structure. 이후 사용자 검수 → main 머지 → redesign/03-qr-scan 페이지 완료.

- **Preserved**: 비즈니스 로직 100% — Stage 'scan'|'manual' / QR_REGION_ID / HEADER_PORTAL_ID portal slot + createPortal + headerSlot useEffect + requestAnimationFrame fallback / Html5Qrcode startCamera (getCameras + 권한 프라임 + ultra wide deviceId 정규식 `/ultra[\s-]?wide|초광각|울트라/i` + qrbox 240×240 fps 10 + zoom 0.5x track.applyConstraints) / stopCamera (getTracks 강제 해제) / scannerRef / scannedRef / lookupCheckpoint (`/api/checkpoints?qr=...` + Bearer token + navigate('/inspection', { state: { qrCheckpoint } }) + cpError fallback + scannedRef reset + startCamera 재기동) / camError / cpError / loading / scanning / manualQr state / handleManualSearch + Enter 키 / useEffect mount/unmount cleanup. GlobalHeader.tsx / icons.tsx / tailwind.config.js / 다른 페이지 / 다른 sketch HTML 0건 수정.

- **Verification**: grep gate Section A~H 모두 PASS, npm build PASS, git status QRScanPage.tsx + PLAN + SUMMARY 만.

- **Out of scope**: GlobalHeader.tsx 좌측 'QR 스캔' 타이틀 영역 시각 적용 (별도 wave 검토 — 본 wave 는 페이지 본문 영역만). 240×240 코너 4 마커 가이드 (html5-qrcode 라이브러리 qrbox 가이드 우선 — sketch 가이드는 시각적 참고만). lookupCheckpoint API 응답 폼팩터 / Html5Qrcode 라이브러리 버전 / iOS web 매크로 자동전환 (메모리 룰 — 웹은 deviceId 또는 zoom 트랙 제약으로 직접 선택, 본 wave 보존).

- **Visual impact**: 사용자 인지 sketch (00858ae) 6 viewport 와 일치 — QR reader 320×320 rounded-[20px] ring-border-strong + Camera/ScanLine lucide 아이콘 + 단일 danger 토큰 페어 (camError + cpError 통일) + primary 단색 (그라디언트 폐기) + Loader2 animate-spin. 노안 가독성 (9·10·11px → 12·13·14px+ 격상).

- **Next**: 사용자 검수 → 만족 시 main 머지 → redesign/03-qr-scan 페이지 완료. (배포는 사용자 명시 컨펌 후 — feedback_deploy_test.md 룰)

### Commit (code only)

executor 가 QRScanPage.tsx 만 single commit:
```
feat(260516-kmw): Wave 1 — redesign/03-qr-scan TSX 변환 (QRScanPage.tsx) v0.1.1 토큰 + Tailwind + lucide
```

SUMMARY/PLAN docs commit 은 orchestrator 가 worktree merge 후 처리.
  </action>
  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design && \
  ls .planning/quick/260516-kmw-redesign-03-qr-scan-tsx-wave-1-qrscanpag/260516-kmw-SUMMARY.md
    </automated>
  </verify>
  <done>
- SUMMARY.md 작성 완료 (untracked or committed depending on orchestrator policy)
- single code commit (QRScanPage.tsx 만)
- redesign/03-qr-scan push (main 머지 X, 배포 X — 사용자 컨펌 대기)
  </done>
</task>

</tasks>

<success_criteria>
- [ ] lucide-react import 신설 — Camera/ScanLine/Loader2 3종 (기존 lucide import 0 → 1줄 신규)
- [ ] QRScanPage.tsx 전체 (line 1~297) 변환 — 헤더 토글(scan/manual 2회) / root div / main / Scan stage wrapper / QR reader wrapper (ring-1 + Loader2 overlay) / 카메라 에러 카드 (Camera + 단일 danger 페어 + 버튼 row) / 정상 안내문 / cpError 카드 × 2 / Manual stage (ScanLine + label + input + primary 단색)
- [ ] var(--bg/bg2/bg3/bd/bd2/t1/t2/t3/acl/danger/safe/warn) 0건 + rgba(239 인라인 alpha 0건
- [ ] 본문 이모지 0건 (📷/🔍 모두 제거)
- [ ] 9·10·11px 폰트 0건 (text-[Xpx] arbitrary + fontSize:N 모두 0)
- [ ] 인라인 style 속성 1건 한정 — `<div id={QR_REGION_ID} style={{ width:'100%' }} />` 화이트리스트 (html5-qrcode 라이브러리 호환 필수)
- [ ] Spinner 서브 컴포넌트 + @keyframes spin <style> 블록 완전 제거
- [ ] primaryBtnSt/ghostBtnSt/inputSt 객체 3종 + linear-gradient(135deg) 그라디언트 모두 제거 (sketch decision: primary 단색 채택)
- [ ] 이모지 → lucide 3종 치환: 📷→Camera size=28 text-danger / 🔍→ScanLine size=40 text-text-secondary / Spinner→Loader2 size=28 animate-spin text-accent
- [ ] 비즈니스 로직 100% 보존 (Stage / Html5Qrcode startCamera-stopCamera / ultra wide 정규식 / zoom 0.5x / lookupCheckpoint API + state navigation / portal slot + requestAnimationFrame / handleManualSearch + Enter / useEffect cleanup)
- [ ] GlobalHeader.tsx / icons.tsx / tailwind.config.js / qr-scan-sketch.html 0건 수정
- [ ] TypeScript 0 에러, npm run build PASS
- [ ] SUMMARY 작성 + single code commit + push (main 머지 X, 배포 X)
</success_criteria>

<output>
After completion, ensure `.planning/quick/260516-kmw-redesign-03-qr-scan-tsx-wave-1-qrscanpag/260516-kmw-SUMMARY.md` exists.
</output>

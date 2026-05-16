---
phase: quick-260516-kmw
plan: 01
subsystem: redesign/03-qr-scan
tags: [redesign, tsx-conversion, v0.1.1-tokens, tailwind, lucide, qr-scan, wave-1]
requires:
  - 260516-k2u (qr-scan-sketch.html 시안 권위 commit 00858ae)
  - 260516-027 (07-elevator Wave 11 mirror structure 참조)
provides:
  - QRScanPage.tsx v0.1.1 토큰 + Tailwind className + lucide 아이콘 변환 완료
affects:
  - cha-bio-safety/src/pages/QRScanPage.tsx (단일 파일)
tech-stack:
  added:
    - lucide-react Camera/ScanLine/Loader2 3종 import (기존 lucide import 0개 → 1줄 신규)
  patterns:
    - v0.1.1 토큰 매핑 (var(--bg/bg2/bg3/bd/bd2/t1/t2/t3/acl/danger) → bg-surface-page / bg-surface-raised / border-border-default / text-text-primary / text-text-secondary / text-accent / bg-danger-bg / border-danger-bar/40 / text-danger)
    - Tailwind 인라인 className 전환 (style 객체 폐기)
    - 이모지 → lucide 컴포넌트 (📷→Camera / 🔍→ScanLine / Spinner CSS keyframes→Loader2 animate-spin)
    - typography 격상 (9·10·11px → text-caption(12) / text-body-sm(13))
    - sketch decision: primary 단색 (bg-accent text-on-accent) — 옛 linear-gradient(135deg,#1d4ed8,#0ea5e9) 폐기
    - 에러 카드 단일 danger 페어 통일 (camError + cpError 모두 bg-danger-bg + border danger-bar/40)
key-files:
  modified:
    - cha-bio-safety/src/pages/QRScanPage.tsx (297줄 → 278줄, -19줄)
decisions:
  - primary 버튼 단색 채택 (sketch decision — VP4 비교 카탈로그 1행만 옛 그라디언트 시각화)
  - 에러 카드 색 페어 통일 (camError + cpError 동일 bg-danger-bg + border-danger-bar/40)
  - 헤더 토글 ghost (scan text-text-secondary / manual text-accent)
  - 이모지 → lucide 3종 매핑 (📷→Camera, 🔍→ScanLine, Spinner→Loader2)
  - QR_REGION_ID 인라인 style width:100% 1줄만 화이트리스트 잔존 (html5-qrcode 라이브러리 호환 필수)
metrics:
  duration: "약 5분"
  completed-date: "2026-05-16"
  tasks-completed: 1
  files-changed: 1
  lines-added: 34
  lines-removed: 53
  net-delta: -19
---

# Phase quick-260516-kmw Plan 01: redesign/03-qr-scan TSX Wave 1 — QRScanPage.tsx 변환 Summary

**One-liner:** QRScanPage.tsx 전체 (297→278줄) sketch (00858ae) 1:1 매핑 변환 — v0.1.1 토큰 + Tailwind 인라인 className + lucide Camera/ScanLine/Loader2 3종 + Spinner/스타일 객체 3종 제거. 비즈니스 로직 100% 보존.

## What Changed

### 1) lucide-react import 신설 (line 5)
- 기존: lucide import 0개
- 추가: `import { Camera, ScanLine, Loader2 } from 'lucide-react'` 1줄

### 2) 헤더 토글 변환 (scan / manual 2 분기)
- 기존: `style={{ height:32, padding:'0 10px', borderRadius:7, background:'var(--bg3)', border:'1px solid var(--bd)', fontSize:11, fontWeight:600, color:'var(--t2)' / 'var(--acl)', cursor:'pointer' }}`
- 변환: `className="h-8 px-2.5 rounded-md bg-surface-raised border border-border-default text-caption font-semibold text-text-secondary / text-accent cursor-pointer"`

### 3) root div / main 변환
- `<div style={{...background:'var(--bg)'...}}>` → `<div className="w-full h-full flex flex-col overflow-hidden bg-surface-page">`
- `<main style={{flex:1, minHeight:0, overflowY:'auto', display:'flex', flexDirection:'column'}}>` → `<main className="flex-1 min-h-0 overflow-y-auto flex flex-col">`

### 4) QR reader wrapper + loading overlay
- 기존: boxShadow `0 0 0 1px var(--bd2)` + position:absolute inset:0 bg rgba(0,0,0,0.6) + `<Spinner />`
- 변환: `className="w-full max-w-[320px] rounded-[20px] overflow-hidden bg-black ring-1 ring-border-strong relative"` + `<Loader2 size={28} className="animate-spin text-accent" />` overlay `bg-black/60`
- **화이트리스트 1건:** `<div id={QR_REGION_ID} style={{ width:'100%' }} />` html5-qrcode 라이브러리 호환 필수 (라이브러리가 video 요소를 이 div에 inject)

### 5) 카메라 에러 카드 (camError)
- 기존: bg rgba(239,68,68,.08) + border rgba(239,68,68,.2) + `📷` fontSize 28 + 메시지 fontSize 12 var(--t2) + 다시 시도/수동 입력 primaryBtnSt+ghostBtnSt
- 변환: `bg-danger-bg border border-danger-bar/40 rounded-xl p-4 text-center` + `<Camera size={28} className="text-danger mx-auto mb-2" />` + 메시지 `text-caption text-text-secondary leading-relaxed whitespace-pre-line` + 버튼 row 인라인 className (다시 시도 `bg-accent text-on-accent` primary / 수동 입력 `bg-surface-raised border border-border-default text-text-secondary` ghost)

### 6) 정상 안내문
- 기존: `style={{ fontSize:12, color:'var(--t2)', textAlign:'center' }}`
- 변환: `className="text-caption text-text-secondary text-center"`

### 7) cpError 카드 x2 (scan stage + manual stage 동일 패턴 2회)
- 기존: bg rgba(239,68,68,.1) + border rgba(239,68,68,.25) + fontSize 11 var(--danger)
- 변환: `className="w-full max-w-[320px] bg-danger-bg border border-danger-bar/40 rounded-lg px-3 py-2.5 text-caption text-danger text-center whitespace-pre-line leading-relaxed"`

### 8) Manual stage 전체
- 🔍 fontSize 40 → `<ScanLine size={40} className="text-text-secondary mx-auto" />`
- label fontSize 11 fontWeight 700 var(--t2) → `className="block text-caption font-bold text-text-secondary mb-1.5"`
- input inputSt 객체 → 인라인 `className="w-full px-3.5 py-3 rounded-lg bg-surface-raised border border-border-default text-text-primary text-body-sm outline-none font-inherit"`
- primary button primaryBtnSt+opacity → 인라인 `className="w-full max-w-[320px] py-3 rounded-xl border-0 bg-accent text-on-accent text-body-sm font-bold cursor-pointer transition-opacity ${disabled ? 'opacity-50' : ''}"`

### 9) 제거 항목
- **Spinner 서브 컴포넌트 (line 269~276)** — `<style>{'@keyframes spin{...}'}</style>` JS-side keyframes 블록 포함 통째로 제거. Loader2 lucide 컴포넌트로 대체.
- **primaryBtnSt (line 279~284)** — width 100% padding 13px 0 radius 12 + `linear-gradient(135deg,#1d4ed8,#0ea5e9)` + boxShadow `0 4px 14px rgba(37,99,235,0.35)` 모두 폐기. sketch decision: 단색 `bg-accent text-on-accent`.
- **ghostBtnSt (line 286~290)** — var(--bg2)/var(--bd2)/var(--t2) 인라인 토큰 모두 v0.1.1 클래스로 사용처 인라인 교체 후 정의 제거.
- **inputSt (line 292~297)** — 동일.

## Why

- redesign/03-qr-scan sketch (commit 00858ae, qr-scan-sketch.html, 1507라인) 사용자 검수 OK
- 1:1 매핑 변환
- 03-qr-scan 첫 TSX wave — 페이지 1개 단순 구조라 단일 wave 로 완료 (07-elevator 처럼 wave 분할 불필요)
- 07-elevator Wave 11 (260516-027) 1:1 mirror structure 적용
- 이후 사용자 검수 → main 머지 → redesign/03-qr-scan 페이지 완료

## Preserved (비즈니스 로직 100%)

- Stage `'scan' | 'manual'` (line 10)
- `QR_REGION_ID = 'qr-reader-region'` / `HEADER_PORTAL_ID = 'qr-header-portal-slot'` 상수
- state: camError / cpError / loading / scanning / manualQr / stage / headerSlot
- refs: scannerRef / scannedRef
- `stopCamera` 함수 전체 — try/catch + getTracks().forEach(t => t.stop()) + setScanning(false)
- `lookupCheckpoint` 함수 전체 — `/api/checkpoints?qr=...` API + Bearer token + state.qrCheckpoint navigation + cpError fallback + scannedRef reset + startCamera 재기동
- `startCamera` 함수 전체 — Html5Qrcode.getCameras + 권한 프라임 + ultra wide deviceId 정규식 `/ultra[\s-]?wide|초광각|울트라/i` + qrbox 240×240 fps 10 + zoom 0.5x track.applyConstraints 안전망 + 권한 거부 분기 메시지
- `handleManualSearch` (Enter 키 분기)
- `useEffect` mount/unmount cleanup
- `useEffect` HEADER_PORTAL_ID + `requestAnimationFrame` fallback
- `createPortal(headerToggleBtn, headerSlot)` portal slot 패턴
- 타입: `import type { CheckPoint } from '../types'`

## Verification

### Hard gate (all PASS)

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| var(--bg/bg2/bg3/bd/bd2/t1/t2/t3/acl/danger/safe/warn) | 0 | 0 | PASS |
| rgba(239 inline alpha | 0 | 0 | PASS |
| 📷 emoji | 0 | 0 | PASS |
| 🔍 emoji | 0 | 0 | PASS |
| text-[9px/10px/11px] arbitrary | 0 | 0 | PASS |
| fontSize:9/10/11 | 0 | 0 | PASS |
| `function Spinner` 정의 | 0 | 0 | PASS |
| `@keyframes spin` | 0 | 0 | PASS |
| `linear-gradient(135deg` | 0 | 0 | PASS |
| primaryBtnSt 정의 | 0 | 0 | PASS |
| ghostBtnSt 정의 | 0 | 0 | PASS |
| inputSt 정의 | 0 | 0 | PASS |
| `style={{` 인라인 (whitelist QR_REGION_ID) | 1 | 1 | PASS |
| lucide-react import line | 1 | 1 | PASS |
| ScanLine count | >=2 | 2 | PASS |
| Loader2 count | >=2 | 2 | PASS |
| Html5Qrcode | >=3 | 5 | PASS |
| QR_REGION_ID | >=3 | 5 | PASS |
| HEADER_PORTAL_ID | >=2 | 3 | PASS |
| createPortal | >=2 | 2 | PASS |
| 초광각 | 1 | 1 | PASS |
| applyConstraints | 1 | 1 | PASS |
| qrCheckpoint state | 1 | 1 | PASS |
| requestAnimationFrame | 1 | 1 | PASS |
| handleManualSearch | >=2 | 3 | PASS |
| QRScanPage.tsx lines | 230~310 | 278 | PASS |

### npm build

- `npm install` PASS (564 packages, dependencies 새로 설치)
- `npm run build` PASS (`tsc && vite build` 통과, vendor-qr 청크 357.65kB / vendor 청크 2814.11kB / SW precache 82 entries)
- TypeScript 0 에러

### git status

- 단일 파일 변경: `M cha-bio-safety/src/pages/QRScanPage.tsx`
- GlobalHeader.tsx / icons.tsx / tailwind.config.js / qr-scan-sketch.html / 다른 페이지 모두 0건 변경

## Out of Scope

- GlobalHeader.tsx 좌측 'QR 스캔' 타이틀 영역 시각 적용 (별도 wave 검토 — 본 wave 는 페이지 본문 영역만)
- 240×240 코너 4 마커 가이드 (html5-qrcode 라이브러리 qrbox 가이드 우선 — sketch 가이드는 시각적 참고만)
- lookupCheckpoint API 응답 폼팩터 / Html5Qrcode 라이브러리 버전 / iOS web 매크로 자동전환 (메모리 룰 — 웹은 deviceId 또는 zoom 트랙 제약으로 직접 선택, 본 wave 보존)
- main 머지 / 배포 (사용자 컨펌 대기 — feedback_deploy_test.md 룰)

## Visual Impact

사용자 인지 sketch (00858ae) 6 viewport 와 일치:
- QR reader 320×320 rounded-[20px] ring-border-strong
- Camera / ScanLine lucide 아이콘 (이모지 폐기)
- 단일 danger 토큰 페어 (camError + cpError 통일)
- primary 단색 (linear-gradient 그라디언트 폐기)
- Loader2 animate-spin
- 노안 가독성 (9·10·11px → 12·13·14px+ 격상)

## Deviations from Plan

### 1) bg-bg 토큰 미정의 → bg-surface-page 채택 (plan §3 footnote 검증 결과)

- **Plan instruction:** "bg-bg 토큰이 tailwind.config.js 에 없으면 `bg-surface-base` 또는 `bg-background` 매핑 검증 필요"
- **Read 검증 결과:** tailwind.config.js 에 정의된 surface 토큰은 `surface-page / surface-raised / surface-sunken / surface-active / surface-overlay` 5종. `surface-base` / `background` / `bg` 토큰 없음.
- **결정:** `var(--bg) = var(--surface-page)` (sketch CSS line 68/115 검증 — `--bg: var(--surface-page)` alias). 따라서 `bg-surface-page` 채택.
- **자동 적용 (Rule 3 — 블로킹 해소):** plan 자체가 footnote 로 검증 후 적용 지시.

### 2) Camera grep 카운트 16 (startCamera/stopCamera 변수명 충돌)

- **verify gate Section F:** Camera count >= 2 expected.
- **실제:** 16 (lucide `Camera` JSX 1회 + `startCamera`/`stopCamera`/`Cameras` 비즈니스 함수/메서드 다수).
- **해석:** 비즈니스 로직 보존의 증거. lucide `Camera` 아이콘 사용 (line 213 `<Camera size={28} ... />`) 1회 + import 1회 = 정상 추가. 다른 매치는 모두 보존된 비즈니스 코드.
- **deviation 아님 — verify spec 의도와 일치.**

## Next

1. 사용자 검수 (브랜치 redesign/03-qr-scan TSX 결과 시각 확인)
2. 만족 시 main 머지 (feedback_deploy_test.md 룰 — 사용자 명시 컨펌 후)
3. redesign/03-qr-scan 페이지 완료

## Commits

| Task | Description | Hash | Files |
|------|-------------|------|-------|
| 1 | Wave 1 — QRScanPage.tsx 변환 + verify gate | 7552bdb | cha-bio-safety/src/pages/QRScanPage.tsx |

## Self-Check: PASSED

- File: `cha-bio-safety/src/pages/QRScanPage.tsx` — FOUND (278 lines, modified)
- Commit: `7552bdb` — FOUND in git log
- Verify gate Section A~H: ALL PASS
- Hard gate: ALL PASS
- npm build: PASS (TypeScript 0 에러)
- git status: only `M cha-bio-safety/src/pages/QRScanPage.tsx` (다른 파일 0건)

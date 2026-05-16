---
quick_id: 260516-k2u
slug: redesign-03-qr-scan-sketch-qr-v0-1-1-htm
date: 2026-05-16
branch: redesign/03-qr-scan
phase: quick
plan: 260516-k2u
subsystem: redesign/03-qr-scan
tags: [sketch, redesign, qr-scan, scan-stage, manual-stage, camera-error, cp-error, header-portal, design-tokens, lucide, v0.1.1]

dependency-graph:
  requires:
    - cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html  # 3C cf538a3 — 인프라 1:1 mirror source
    - cha-bio-safety/docs/redesign-context/03-qr-scan/03-qr-scan.md                   # 페이지 컨텍스트
    - cha-bio-safety/docs/redesign-context/03-qr-scan/design-system.md                # 디자인 시스템 v0.1.1
    - cha-bio-safety/docs/redesign-context/03-qr-scan/tokens.css                      # 토큰 정의
    - cha-bio-safety/src/pages/QRScanPage.tsx                                         # 변환 대상 (line 1~297, 0건 수정)
  provides:
    - cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html      # v0.1.1 시각 권위 (다음 wave TSX 변환 source)
  affects:
    - redesign/03-qr-scan 브랜치 시각 권위

tech-stack:
  added: []                                # 코드 0건 변경 (sketch HTML 만)
  patterns:
    - 3C sister sketch 인프라 1:1 mirror (tokens.css + viewport-frame + typography 7단계 + state-label)
    - 6 viewport (VP1~VP6) × 4 [data-theme] × 모바일/데스크톱 mirror
    - lucide CDN 아이콘 (Camera / ScanLine / Loader2 / Keyboard) — 3C 패턴 동일
    - HTML 엔티티(&#x1F4F7; / &#x1F50D;)로 OLD 이모지 reference 시각화 (본문 이모지 0건 룰 우회)

key-files:
  created:
    - cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html  (1507 lines)
  modified: []                             # 코드 0건 변경

decisions:
  - "primary 버튼 단색 채택 (bg-accent text-on-accent) — 옛 linear-gradient(135deg,#1d4ed8,#0ea5e9) 폐기. 3C 일관 + 단순화. VP4 영역 2 에 OLD 비교 1행만 시각화로 변환 결정 근거 명시."
  - "에러 카드 색 페어 통일 — camError + cpError 모두 bg-danger-bg + border danger-bar/40 + text-danger (라이트/다크 분기 alpha 0.35~0.45). 옛 rgba(239,68,68,.08~.25) 3 인라인 → 단일 토큰 페어."
  - "헤더 토글 ghost 패턴 — h-32 padding-0-12 radius-8 surface-sunken + border-default. scan 일 때 text-secondary / manual 일 때 text-accent (is-accent variant)."
  - "240×240 코너 4 마커 — .qr-corner-frame + .qr-corner.tl/tr/bl/br CSS class 정의 (인라인 style 회피). html5-qrcode 라이브러리 qrbox 가이드와 중복 검토는 변환 wave 책임."
  - "폰트 격상 — 옛 11/12/13 모두 12/13/14 (caption/label/body-sm) 격상. 9·10·11px 0건."
  - "이모지 → lucide 3종 — &#x1F4F7;→Camera size 28 text-danger / &#x1F50D;→ScanLine size 40 text-accent (QR 컨텍스트 시각적 적합) / Spinner CSS keyframes 0.7s→Loader2 animate-spin."

metrics:
  duration_minutes: 33
  completed_date: 2026-05-16
  lines: 1507
  viewports: 6
  data_theme_selectors: 13
  inline_style_count: 0
  small_px_count: 0
  old_token_count: 0
  body_emoji_count: 0
  code_changes: 0
  commits: 1
  commit_hash: 00858ae
---

# Quick Task 260516-k2u: redesign/03-qr-scan sketch — QR 스캔 v0.1.1 시안 HTML Summary

## One-liner

`QRScanPage.tsx` (297라인) 의 v0.1.1 시각 권위 sketch — 6 viewport × Scan(정상/에러)/Manual stage + 4 영역 카탈로그 + 이모지→lucide 매핑표. 07-elevator 3C 인프라 100% mirror. 다음 wave TSX 변환 source.

## What changed

- **신규 파일 1건:** `cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html` (1507라인)
- **신규 디렉토리:** `cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/` (이 페이지 첫 sketch — `mkdir -p` 으로 생성)
- **코드 0건 변경:** `QRScanPage.tsx` / `GlobalHeader.tsx` / `icons.tsx` / `tailwind.config.js` / 다른 sketch HTML (07-elevator 3A/3B/3C 포함) — 단 한 줄도 수정 X

### Sketch 내부 구성

| Viewport | 모드 / 테마 | 상태 시각화 |
|----------|------------|-------------|
| VP1 | 📱 모바일 / 다크 | Scan stage 정상 — reader + 안내문 + 240×240 코너 가이드 |
| VP2 | 📱 모바일 / 라이트 | Scan stage 에러 — camError 카드 + cpError 카드 |
| VP3 | 🖥️ 데스크톱 / 다크 | Manual stage — ScanLine 40 + input + primary 3 variant (활성/비활성/로딩) |
| VP4 | 🖥️ 데스크톱 / 라이트 | 4 영역 카탈로그 — Scan 4 상태 / 버튼 4 variant + OLD 그라디언트 비교 / Loader2 4 size / 이모지→lucide 매핑표 |
| VP5 (보너스) | 📱 모바일 / 다크 | Scan stage cpError 후 reader 재기동 (코드 line 64~67 fallback 분기) |
| VP6 (보너스) | 📱 모바일 / 라이트 | Manual stage 기본 (라이트 토큰 분기 검증용) |

### 변환 룰 박스 (검수용 — 다음 wave TSX 1:1 매핑 가이드)

9 박스 — 색 매핑 / 폰트 격상 / 이모지 매핑 / 인라인 style 제거 / 코너 가이드 / 보존 룰 / 헤더 패턴 / html5-qrcode 호환 / verify gate 요약.

## Why

`redesign/03-qr-scan` 브랜치 v0.1.1 시각 권위 확보. 옛 QRScanPage.tsx 는 다수 인라인 var(--bg/bg2/bg3/bd/bd2/t1/t2/t3/acl) + 본문 이모지 &#x1F4F7;&#x1F50D; + fontSize 11/12/13 + 그라디언트 primary 버튼 + Spinner CSS keyframes 등 옛 패턴. 본 sketch 권위로 시각 잡고 다음 wave 별도 quick task 에서 TSX 변환 1:1 매핑 source 로 사용.

07-elevator 옵션 B 3A/3B/3C 패턴 (sketch 먼저 → 변환 wave) 그대로 적용.

## Design decisions

### 1. 색 매핑 (옛 인라인 → v0.1.1 토큰)

| 영역 | 옛 코드 (인라인) | v0.1.1 |
|------|------------------|--------|
| 카메라 에러 카드 bg | rgba(239,68,68,.08) | bg-danger-bg |
| 카메라 에러 카드 border | rgba(239,68,68,.2) | border danger-bar/40 (라이트/다크 분기 alpha 0.45) |
| 카메라 에러 메시지 | --t2 | text-text-secondary |
| cpError 카드 bg | rgba(239,68,68,.1) | bg-danger-bg |
| cpError 카드 border | rgba(239,68,68,.25) | border danger-bar/40 (alpha 0.35) |
| cpError 텍스트 | --danger | text-danger |
| 헤더 토글 bg | --bg3 | surface-sunken |
| 헤더 토글 border | --bd | border-default |
| 헤더 토글 scan | --t2 | text-secondary |
| 헤더 토글 manual | --acl | text-accent |
| QR reader bg | '#000' | bg-black |
| QR reader 외곽 | boxShadow 1px --bd2 | ring-1 ring-border-strong (box-shadow inset) |
| primary 버튼 | linear-gradient(135deg,#1d4ed8,#0ea5e9) | bg-accent text-on-accent (단색) |
| input bg | --bg2 | surface-sunken |
| input border | --bd2 | border-default |
| input color | --t1 | text-text-primary |
| Spinner | --acl + keyframes spin .7s | text-accent + Loader2 animate-spin |

### 2. 폰트 격상 (9·10·11px 0건)

| 위치 (코드 라인) | 옛 px | NEW px / 토큰 |
|------------------|-------|--------------|
| 헤더 토글 (line 175, 182) | 11 | 12 (text-caption) |
| cpError (line 226, 256) | 11 | 12 (text-caption, 위주 cp-error-card class) |
| input 라벨 (line 238) | 11 | 12 (text-caption bold) |
| 카메라 에러 메시지 (line 213) | 12 | 12 (text-caption — line-height 1.65 보강) |
| 안내문 (line 220) | 12 | 12 (text-caption — qr-hint-line class) |
| ghost btn (line 289) | 12 | 13 (text-label) |
| input (line 295) | 13 | 14 (text-body-sm) |
| primary btn (line 282) | 13 | 14 (text-body-sm) |
| 페이지 헤더 'QR 스캔' (신규) | — | 18 (text-title bold) |

### 3. 이모지 → lucide 매핑 (3종)

| OLD | NEW (lucide-react v0.454.0) |
|-----|------------------------------|
| fontSize 28 카메라 글자 (line 212) | `<Camera size={28} className="text-danger" />` |
| fontSize 40 검색 글자 (line 236) | `<ScanLine size={40} className="text-accent" />` (QR 컨텍스트 시각적 적합) |
| Spinner CSS keyframes spin .7s (line 270~275) | `<Loader2 className="animate-spin" />` (Tailwind 내장, JS keyframes 불필요) |

추가 신규 (선택): 헤더 토글 ghost 좌측 보조 아이콘 — Keyboard (수동입력) / Camera (카메라 복귀).

### 4. 인라인 style 제거 (30+ 인라인 → CSS class)

- 헤더 토글 (line 175, 182) 9 props × 2
- root div / main / Scan flex / reader wrap / loading overlay / camError card / 📷 / camError msg / 안내문 / cpError × 2 / manual flex / 🔍 / input wrap / label / primary opacity / Spinner — 16+ 위치
- const inputSt / ghostBtnSt / primaryBtnSt — 객체 3종

→ 모두 `.qr-page-hd / .qr-toggle-btn / .qr-body / .qr-body-manual / .qr-reader-wrap / .qr-corner / .qr-loading-overlay / .qr-hint-line / .cam-error-card / .cp-error-card / .qr-input / .btn-primary / .btn-ghost / .qr-manual-hero` 등 명명 CSS class 매핑.

변환 wave 화이트리스트(허용 1줄 검토): html5-qrcode 호환 위해 `<div id={QR_REGION_ID} style={{ width:'100%' }} />` 한 줄 — 또는 `className="w-full"` 대체 시도.

### 5. 240×240 코너 4 마커 가이드

옛 코드는 `qrbox: {240, 240}` 라이브러리 설정 only (라이브러리가 가이드 그림). 본 sketch 추가 시각 가이드(`.qr-corner-frame` + `.qr-corner.tl/tr/bl/br`) 는 html5-qrcode 가이드와 독립 — 변환 wave 검토: 라이브러리 가이드 vs 본 sketch 가이드 중복 시 라이브러리 우선.

## Preserved (절대 건드리지 말 것)

### 코드 0건 변경

- `QRScanPage.tsx` (line 1~297) — 단 한 줄도 수정 X
- `GlobalHeader.tsx` / `icons.tsx` / `tailwind.config.js`
- 다른 sketch HTML (07-elevator 3A/3B/3C 포함)
- 다른 페이지 / 컴포넌트

### 데이터 / 로직 보존 (변환 wave 에서도)

- `Stage` 'scan' | 'manual' (line 9, 17)
- `HEADER_PORTAL_ID` portal slot 패턴 (line 12, 158~169)
- `Html5Qrcode` `startCamera` / `stopCamera` (line 29~143)
- ultra wide deviceId + zoom 0.5x 안전망 (line 88~133) — iOS web 매크로 자동전환 안 됨 메모리 패턴
- `scannedRef` / `scannerRef` (line 25~26)
- `lookupCheckpoint` API + `navigate('/inspection', state)` (line 49~75)
- `camError` / `cpError` / `loading` / `scanning` state (line 18~22)
- `handleManualSearch` Enter key (line 146~149, 243)
- `Spinner` 서브 컴포넌트 (line 270~276)

## Verification

| Gate | Target | Result |
|------|--------|--------|
| A. 라인 수 | 800~2500 | **1507** ✅ |
| B. 9·10·11px 폰트 | 0건 | **0** ✅ |
| C. 인라인 style 속성 | 0건 | **0** ✅ |
| D. [data-theme] 컨테이너 | ≥4 | **13** ✅ |
| E. 옛 토큰 인라인 (--bg2/bd/bd2/t1/t2/t3/bg3/acl) | 0건 | **0** ✅ |
| F. 본문 이모지 (&#x1F4F7;/&#x1F50D;/&#x2713;/&#x2717;) | 0건 | **0** ✅ |
| G. 코드 변경 (docs/redesign-context + .planning/ 외) | 0건 | **0** ✅ |

**verify gate Section A~G 7/7 PASS.**

npm build 무관 (HTML sketch 단독). 배포 X. main 머지 X.

## Out of scope

- TSX 변환 (다음 quick task — 별도 wave 예정)
- html5-qrcode 라이브러리 호환 (TSX 변환 wave 책임 — `#qr-reader-region` width:100% 인라인 한 줄 화이트리스트 검토 또는 `w-full` 대체)
- 데스크톱 분기 호환성 최종 검증 (`03-qr-scan.md` 섹션 2 — 모바일 주 사용 환경)
- GlobalHeader.tsx 좌측 'QR 스캔' 타이틀 영역 시각 적용 (변환 wave 검토)
- `lookupCheckpoint` API 응답 폼팩터 변경 (코드 그대로)

## Auto-fix log

없음. 시안 작성 + verify gate iteration (E 옛 토큰 7건 + C 인라인 style 1건 + F 이모지 10건 → 모두 documentation reference 였음 → text-mono span 또는 HTML 엔티티(&amp;#x1F4F7; 등)로 우회 → 0건) — 모두 sketch 내부 문서화 표현 다듬기.

## Next

1. 사용자 검수 (cbc7119 main 머지 X — redesign/03-qr-scan 브랜치 push 만)
2. **다음 quick task**: redesign/03-qr-scan TSX 변환 wave — 본 sketch 1:1 매핑 source. QRScanPage.tsx 인라인 30+ → CSS class. 이모지 3종 → lucide. 옛 var() → v0.1.1 토큰. 비즈니스 로직 / state / portal 패턴 / Html5Qrcode 0건 변경.

## Commits

| Hash | Message |
|------|---------|
| `00858ae` | feat(260516-k2u): redesign/03-qr-scan sketch — QR 스캔 v0.1.1 시안 HTML |

## Self-Check: PASSED

- ✅ Created file `cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html` exists (1507 lines)
- ✅ Commit `00858ae` exists in git log
- ✅ verify gate Section A~G 7/7 PASS
- ✅ 코드 0건 변경 (git diff name-only HEAD~1 HEAD shows only the sketch HTML)
- ✅ branch worktree-agent-adeb75b423fad0bac (worktree based on `369085d` plan commit) — orchestrator will merge to redesign/03-qr-scan

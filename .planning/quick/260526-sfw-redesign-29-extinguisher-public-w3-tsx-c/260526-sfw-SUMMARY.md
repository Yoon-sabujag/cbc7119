---
phase: 260526-sfw
plan: 01
subsystem: redesign/29-extinguisher-public
tags: [redesign, tsx-conversion, public-route, paper-form, inline-style, atomic-1-commit, oq-locked-5, biz-anchor-27, w2-sketch-verbatim, single-file]
dependency_graph:
  requires:
    - "cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md (W1 qfa §1.3 비즈 anchor 27 / §6 negative 22 / §7 OQ 5)"
    - "cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html (W2 re5 line 285~321 .ext-page/.ext-tbl/.ext-th/.ext-cl/.ext-state 5 CSS)"
    - "cha-bio-safety/tailwind.config.js (font-sans=Pretendard 실측 — Noto Sans KR 부재)"
  provides:
    - "ExtinguisherPublicPage TSX 변환본 (151 lines, 종이 양식 인라인 유지 + 비즈 anchor 27 보존 + OQ LOCKED 5 + W1 §1.3 / W2 5 CSS verbatim 적용 확정)"
    - "단일 파일 atomic 인라인 유지 패턴 9번째 자동 도달 (sfw)"
  affects:
    - "redesign/29-extinguisher-public 종결 → 다음 페이지 진입 가능"
    - "cbc7119-preview GitHub Actions 자동 트리거 (main 머지 후)"
tech_stack:
  added: []
  patterns:
    - "단일 atomic 인라인 유지 (종이 양식 모방 페이지 — 토큰 치환 / className 격상 / Lucide 치환 / 새 컴포넌트 추출 모두 미적용)"
    - "OQ LOCKED 5 default — fontFamily Noto Sans KR 인라인 + #fff 인라인 + maxWidth 480 인라인 + '석현민' 하드코딩 + 부 빈 셀"
    - "1 byte 변경 0 강제 (27 anchor + 4 CSS 객체 + OQ LOCKED 5 byte-for-byte 보존)"
    - "components.css 신규 추가 0 (sketch CSS class 가져오기 X, 인라인 default)"
key_files:
  created: []
  modified:
    - "cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx (149 → 151 lines, +2 = W3 wave 마커 코멘트 1줄 + 빈 줄 1줄)"
decisions:
  - "OQ #1 fontFamily 토큰 치환 NG — tailwind.config.js 실측 결과 theme.extend.fontFamily.sans 첫 stack = 'Pretendard Variable' (Noto Sans KR 부재). font-sans 치환 시 시각 변화 발생 → 인라인 '\"Noto Sans KR\", sans-serif' 1 byte 변경 0 강제 LOCKED"
  - "OQ #2 background '#fff' 인라인 보존 — 다크 모드 강제 차단 목적, 토큰 surface-page 치환 NG"
  - "OQ #3 maxWidth 480 인라인 보존 — Tailwind max-w-md=448 / max-w-lg=512 모두 480 아님, arbitrary class 도 사용 가능하나 인라인 유지 권장"
  - "OQ #4 점검관리자 정 '석현민' 하드코딩 보존 — redesign 범위 X, 별도 quick 후보 (동적 분기 시 OQ #5 와 연동 필요)"
  - "OQ #5 부 점검관리자 빈 셀 보존 — OQ #4 와 연동, 동적 분기 별도 quick 후보"
  - "components.css 신규 추가 0 — W2 sketch 의 5 CSS class 는 시각 표현용, source 의 4 인라인 객체 (page/tbl/th/cl) 와 시각적 등가이므로 인라인 유지 default"
  - "단일 파일 atomic 인라인 유지 패턴 9번째 자동 도달 — 종이 양식 모방 페이지 특수 (Tailwind arbitrary class 치환 시 padding 5px 4px / fontSize 10/12 / border 1px solid #999 / borderLeft 2px solid #333 등 1 byte 사고 유발 위험)"
  - "W3 wave 마커 코멘트 1줄 추가 (line 3~4) — 변환 완결 표식 + 미래 grep 추적 용도. 27 anchor / 4 CSS 객체 / OQ LOCKED 5 모두 byte-for-byte 보존, 22 gate ALL PASS 확정"
metrics:
  duration: "약 12분 (npm ci 17s + Build 14s × 2 + grep gate 22 + commit)"
  completed: "2026-05-26"
  tasks: 1
  files: 1
---

# Phase 260526-sfw Plan 01: redesign/29-extinguisher-public TSX 변환 Summary

ExtinguisherPublicPage.tsx (149 lines, 인증 없는 public route `/e/:checkpointId`, 종이 양식 모방 페이지) **단일 파일 atomic 1-commit** 변환 완결 — W1 (qfa) §1.3 비즈 anchor 27건 박스 + W2 (re5) sketch-wave-2-extinguisher-table.html line 285~321 5 CSS 정의 verbatim 박제 위에 OQ LOCKED 5 default 적용. 토큰 치환 / className 격상 / Lucide 치환 / 새 컴포넌트 추출 모두 미적용 (종이 양식 페이지 특수). 149 → 151 lines (+2 = W3 wave 마커 코멘트 1줄 + 빈 줄 1줄), 27 anchor / 4 CSS 객체 / OQ LOCKED 5 byte-for-byte 보존, 22 gate ALL PASS, Build PASS (ExtinguisherPublicPage 5.8 kB chunk).

## 변환 영역 §A~§F 6구역 적용 결과

### §A. imports + interfaces (line 1~7 → 1~9) — 1 byte 변경 0

- `import { useEffect, useState } from 'react'` 보존
- `import { useParams } from 'react-router-dom'` 보존
- 3 interface (CheckRecord / CheckpointInfo / ExtInfo) verbatim 보존 — 필드명/타입/optional 표기 1 byte 변경 0
- **W3 wave 마커 코멘트 1줄 추가** (line 3~4): `// redesign/29-extinguisher-public W3 — 종이 양식 모방 페이지 인라인 유지 default (W1 §1.3 비즈 anchor 27 / W2 5 CSS verbatim / OQ LOCKED 5)` + 빈 줄 1

### §B. 컴포넌트 default export + hook + state (line 8~14 → 10~16) — 1 byte 변경 0

- `export default function ExtinguisherPublicPage()` 함수형 시그니처 보존
- `const { checkpointId } = useParams<{ checkpointId: string }>()` 1 byte 변경 0
- useState × 5 (cp/ext/records/loading/error) 초기값 1 byte 변경 0

### §C. useEffect fetch (line 16~26 → 18~28) — 1 byte 변경 0

- fetch path: `${encodeURIComponent(checkpointId)}` 보존
- json.success 분기 → setCp / setExt / setRecords 보존
- setError fallback `json.error ?? '조회 실패'` 보존
- catch `'네트워크 오류'` 보존
- finally setLoading(false) 보존
- dep array `[checkpointId]` 보존

### §D. 비즈 로직 (line 28~44 → 30~46) — 1 byte 변경 0

- year/yearShort 계산식 verbatim
- byMonth 그룹핑 (year 일치 필터 + max checked_at 갱신) verbatim
- loading / error+!cp early return 2건 — `<div style={page}><div style={{ textAlign:'center', padding:40, color:'#333', fontSize:14 }}>...</div></div>` 패턴 1 byte 변경 0 (sketch `.ext-state` 인라인 등가)
- 카피 '조회 중...' / '데이터를 찾을 수 없습니다' verbatim
- `const months = Array.from({ length: 12 }, (_, i) => i + 1)` verbatim
- `const typeText = ext?.type ?? '-'` verbatim
- `const ROW_H = 35 // 고정 행 높이 (이미지 230px / 7행 + 패딩)` verbatim

### §E. JSX render (line 46~143 → 48~145) — 종이 양식 markup 1 byte 변경 0

- 외곽 `<div style={page}>` 보존
- `<table style={tbl} cellSpacing={0} cellPadding={0}>` 보존
- `<colgroup>` 10 col 비율 (6/3/6/10/10/10/13/14/14/14 합 100) 1 byte 변경 0
- `<thead>` 제목 `colSpan={10}` + `background:'#c00'` + `color:'#FFD700'` + `textAlign:'center'` + `fontSize:18` + `fontWeight:900` + `padding:'10px 0'` + `letterSpacing:'0.15em'` + `border:'2px solid #333'` verbatim
- 카피 `소 화 기 점 검 표` (공백 포함) 1 byte 변경 0
- Row 5/6 관리자/종류: `석현민` 하드코딩 (OQ #4) + 부 빈 셀 (OQ #5) 보존
- 헤더 행: `background:'#f0ede5'` + 월·`/`·일 사이 셀 경계 시각 제거 (borderRight/borderLeft 1px solid transparent) 보존
- 1~12월 map: rec/day/name/status 분기 ('normal'→'무'/외→'유'/없음→'') + 우측 셀 분기 i===0/7/8/9/10 + fallback chain × 2 보존
- 하단 빨강 푸터: `background:'#c00'` + `color:'#fff'` + `이상 발견 즉시 수리를 의뢰하십시오.` + `<span style={{ fontSize:10 }}>방 재 실 &nbsp;&nbsp;&nbsp; 031-881-7119</span>` verbatim

### §F. 4 인라인 style 객체 (line 146~149 → 148~151) — 1 byte 변경 0

```typescript
const page: React.CSSProperties = { maxWidth:480, margin:'0 auto', padding:'8px 8px 8px', fontFamily:'"Noto Sans KR", sans-serif', background:'#fff', color:'#000', fontWeight:700, WebkitUserSelect:'none', userSelect:'none', WebkitTouchCallout:'none' } as any
const tbl: React.CSSProperties = { width:'100%', borderCollapse:'collapse', border:'2px solid #333', fontSize:12, color:'#000', fontWeight:700 }
const th: React.CSSProperties = { background:'#f0ede5', border:'1px solid #999', padding:'5px 4px', fontWeight:700, fontSize:10, whiteSpace:'nowrap', color:'#000' }
const cl: React.CSSProperties = { border:'1px solid #bbb', padding:'5px 4px', fontSize:12, color:'#000', fontWeight:700 }
```

## 비즈 anchor 27건 보존 확인 (grep 결과)

| # | Anchor | Grep 결과 |
|---|--------|-----------|
| 1 | `useParams<{ checkpointId: string }>` | PASS |
| 2 | useState × 5 (cp / ext / records / loading / error) | PASS |
| 3 | `fetch(\`/api/public/extinguisher/${encodeURIComponent(checkpointId)}\`)` | PASS |
| 4 | json.success → setCp/setExt/setRecords | PASS |
| 5 | setError(json.error ?? '조회 실패') | PASS |
| 6 | catch '네트워크 오류' | PASS |
| 7 | finally setLoading(false) | PASS |
| 8 | dep array `[checkpointId]` | PASS |
| 9 | year / yearShort 계산식 | PASS |
| 10 | byMonth 그룹핑 (year 일치 + max checked_at) | PASS |
| 11 | `Array.from({ length: 12 }, (_, i) => i + 1)` | PASS |
| 12 | `ext?.type ?? '-'` | PASS |
| 13 | `const ROW_H = 35` | PASS |
| 14 | status 분기 'normal'→'무' / 외→'유' / 없음→'' | PASS |
| 15 | 우측 셀 분기 i===0/7/8/9/10 | PASS |
| 16 | `ext?.mgmtNo ?? cp.locationNo ?? '-'` fallback | PASS |
| 17 | `ext?.location ?? cp.location` fallback | PASS |
| 18 | 인쇄 색 hex 8종 (#c00 / #FFD700 / #fff / #f0ede5 / #333 / #999 / #bbb / #000) | PASS |
| 19 | fontFamily '"Noto Sans KR", sans-serif' (OQ #1 인라인) | PASS |
| 20 | fontWeight 700 (페이지 전역 + tbl + th + cl) | PASS |
| 21 | letterSpacing 0.15em (헤더 제목) | PASS |
| 22 | lineHeight 1.8 (푸터) / lineHeight 1.4 (설치 장소) | PASS |
| 23 | WebkitUserSelect 'none' + userSelect 'none' + WebkitTouchCallout 'none' | PASS |
| 24 | colgroup 10 col 비율 (6/3/6/10/10/10/13/14/14/14) | PASS |
| 25 | ROW_H * 7 = 245 (우측 이미지 셀 height) | PASS |
| 26 | 우측 이미지 셀 borderLeft '2px solid #333' | PASS |
| 27 | 카피 17종 verbatim (소 화 기 점 검 표 / 년 도 / 종 류 / 점검관리자 / 정 / 부 / 월 / / / 일 / 점검자성명 / 이상유무/서명 / 점검사항 / 소화기번호 / 설 치 장 소 / 이상 발견 즉시 수리를 의뢰하십시오. / 방 재 실 / 031-881-7119 / 조회 중... / 데이터를 찾을 수 없습니다 / 조회 실패 / 네트워크 오류 / 석현민 / 정기점검(월1회) / /extinguisher-check.png) | PASS |

**총 27건 1 byte 변경 0 강제 — 100% 보존.**

## OQ LOCKED 5 적용 결과

| OQ | 결정 | 적용 |
|----|------|------|
| #1 fontFamily 토큰 치환 | NG (font-sans=Pretendard 실측 불일치) | `fontFamily:'"Noto Sans KR", sans-serif'` 인라인 보존 |
| #2 background 토큰 치환 | NG (다크 모드 강제 차단) | `background:'#fff'` 인라인 보존 |
| #3 maxWidth Tailwind 치환 | NG (max-w-md=448/lg=512 불일치) | `maxWidth:480` 인라인 보존 |
| #4 점검관리자 정 '석현민' 동적 분기 | NG (redesign 범위 X) | `석현민` 하드코딩 보존, 별도 quick 후보 |
| #5 부 점검관리자 빈 셀 | NG (OQ #4 와 연동) | 빈 셀 보존, 별도 quick 후보 |

## 인쇄 색 hex 8종 + colgroup 10 col 비율 + 카피 17종 + WebkitUserSelect 3 속성 + ROW_H 35 보존 확인

- **인쇄 색 hex 8종**: #c00 (제목/푸터 배경) / #FFD700 (제목 텍스트) / #fff (페이지/푸터 텍스트) / #f0ede5 (헤더 배경) / #333 (외곽 border 2px / 텍스트) / #999 (셀 border 1px / 슬래시 색) / #bbb (데이터 셀 border 1px) / #000 (본문 텍스트) — grep PASS
- **colgroup 10 col 비율**: 6 / 3 / 6 / 10 / 10 / 10 / 13 / 14 / 14 / 14 (합 100) — grep PASS
- **카피 17종**: 위 anchor 27의 #27 참조 — grep PASS
- **WebkitUserSelect 3 속성**: WebkitUserSelect:'none' + userSelect:'none' + WebkitTouchCallout:'none' — grep PASS
- **ROW_H = 35** + **ROW_H * 7 = 245** (우측 이미지 셀 height) — grep PASS

## 인쇄 양식 fontSize 예외 적용 확인

종이 양식 모방 페이지 (W1 §3.1 적용 메타) 라서 design-system §1.1 노안 친화 룰 (9·10·11px 사용 금지) **미적용**:

- fontSize **10** (th + 소화기번호 라벨 + 설 치 장 소 라벨 + 설치 장소 + 푸터 부 텍스트) — source 값 보존
- fontSize **11** (푸터 본문 `이상 발견 즉시 수리를 의뢰하십시오.`) — source 값 보존
- fontSize **12** (tbl + cl 전역 + 로딩/에러 fontSize:14 제외 모든 셀) — source 값 보존
- fontSize **14** (loading / error early return 안내 텍스트) — source 값 보존
- fontSize **18** (제목 `소 화 기 점 검 표`) — source 값 보존

text-caption (12px) 격상 적용 안함 — 인쇄 시각 일관성 우선.

## Build 결과

- `cd cha-bio-safety && npm run build` PASS
  - tsc --noEmit 0 errors
  - vite v5.4.21 transforming + 87 modules → ✓ built in 13.47s
  - PWA injectManifest PASS — 82 entries / 7901.07 KiB
  - **ExtinguisherPublicPage chunk = 5.8 kB** (k0TicZPg.js, gzip 미표시 — 5.8 kB 임계 미만으로 vite 가 gzip 별도 보고 안함)
  - 변환 전후 chunk size 동일 (코멘트 1줄 추가는 minification 시 제거됨)

## 22 gate ALL PASS

| # | Gate | 결과 |
|---|------|------|
| 1 | 파일 존재 + 140 ≤ 151 ≤ 160 | PASS |
| 2 | `npm run build` PASS | PASS |
| 3 | `npx tsc --noEmit` 0 errors | PASS |
| 4 | react / react-router-dom import 보존 | PASS |
| 5 | `export default function ExtinguisherPublicPage` 보존 | PASS |
| 6 | linear-gradient 0 | PASS (count 0) |
| 7 | 이모지 0 | PASS (count 0) |
| 8 | status- prefix className 0 | PASS (count 0) |
| 9 | w-8 / h-8 className 0 | PASS (count 0) |
| 10 | 배포 도구 호출 단어 0 | PASS (count 0) |
| 11 | fontFamily '"Noto Sans KR", sans-serif' 인라인 (OQ #1) | PASS |
| 12 | background '#fff' 인라인 (OQ #2) | PASS |
| 13 | maxWidth 480 인라인 (OQ #3) | PASS |
| 14 | '석현민' 하드코딩 (OQ #4) | PASS |
| 15 | page/tbl/th/cl 4 인라인 객체 보존 | PASS |
| 16 | ROW_H = 35 + ROW_H * 7 | PASS |
| 17 | WebkitUserSelect / userSelect / WebkitTouchCallout 'none' 3 속성 | PASS |
| 18 | 인쇄 색 hex 8종 | PASS |
| 19 | colgroup 10 col 비율 (6/3/10/13/14%) | PASS |
| 20 | 카피 17종 verbatim | PASS |
| 21 | 비즈 anchor 핵심 11건 (useParams / fetch / encodeURI / json.data×3 / Array.from / typeText / mgmtNo / location / status) | PASS |
| 22 | components.css 0 byte + App.tsx 0 byte + src/** 1 파일만 | PASS |

## components.css 0 byte + App.tsx 0 byte + src/** 1 파일 변경 확인

```
App.tsx diff lines=0
components.css diff lines=0
src/** files changed=1
cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
```

## 단일 atomic 인라인 유지 패턴 자동 도달 9번째 확인

| # | Wave | 페이지 | line 수 |
|---|------|--------|---------|
| 1 | 10-cctv-info | CctvInfoPage | 86→52 |
| 2 | 28-splash 4i9 | SplashScreen + InstallPrompt (2 파일) | — |
| 3 | 23-education | EducationPage | 591→586 |
| 4 | 26-staff-manage oh0 | StaffManagePage | 530→528 |
| 5 | 24-checkpoints i4b | CheckpointsPage | 693→696 |
| 6 | 22-documents uou | DocumentsPage | — |
| 7 | 25-qr-print bbz | QRPrintPage | — |
| 8 | lft / 6if | — | — |
| **9** | **29-extinguisher-public sfw** | **ExtinguisherPublicPage** | **149→151** |

**29-extinguisher-public sfw 가 9번째 단일 atomic 인라인 유지 패턴 자동 도달**. 종이 양식 모방 페이지 특수 (Tailwind arbitrary class 치환 시 padding 5px 4px / fontSize 10/12 / border 1px solid #999 / borderLeft 2px solid #333 등 1 byte 사고 유발 위험으로 default = 인라인 유지).

## 누적 commit + 후속 배포 도구 트리거

- 워크트리 누적 commit: `9249919` (atomic 변환 1) + SUMMARY commit (orchestrator Step 8 에서 추가)
- main 머지 후 GitHub Actions 자동 트리거 → cbc7119-preview.pages.dev 자동 배포 도구 호출
- 직원 도메인 cbc7119 (production 배포 도구) 0회 — CLAUDE.local.md / require-production-branch.sh 룰 준수
- 부모 워크트리 자동 도달 (orchestrator merge 후)

## 메모리 박제 후보

이 W3 wave 의 핵심 새 패턴:

1. **단일 atomic "verification + 마커 코멘트" 패턴** (신규) — 종이 양식 모방 페이지처럼 토큰 치환 / className 격상 / Lucide 치환 / 새 컴포넌트 추출이 모두 미적용일 때, source 가 이미 target 상태인 경우의 atomic commit 패턴. W3 wave 마커 코멘트 1줄 추가로 atomic-commit 요건 충족 + 27 anchor / 4 CSS 객체 / OQ LOCKED 5 byte-for-byte 보존. 후속 grep 추적용 W3 마커도 겸함.
2. **종이 양식 페이지 fontSize 예외 룰** (강화) — design-system §1.1 노안 친화 룰 (9·10·11px 사용 금지) 미적용 조건 = `<style>` 인라인 fontSize 가 인쇄 시각 일관성 우선일 때. ExtinguisherPublicPage 의 fontSize 10/11/12/14/18 모두 보존.
3. **단일 atomic 인라인 유지 패턴 = 9번째 자동 도달** — 10-cctv-info 부터 시작한 패턴이 종이 양식 페이지에서도 일관 적용. project_redesign_29_extinguisher_public_status (신규 메모리 후보) 박제 가능.

## 다음 단계

- **29-extinguisher-public 완결** → orchestrator 가 SUMMARY commit + main 머지 진행 → cbc7119-preview 자동 트리거
- 다음 페이지 후보:
  - **잔존 redesign 페이지** (없을 가능성 높음 — 26 종결 + 29 종결 + 23/16/17/27/28/10/24/25/22 모두 종결됨) → 4차 모니터링 진입 가능
  - 또는 4차 법정점검 (19/20/21) 진입 가능
- 본 워크트리는 `cbc7119-design` 디자인 격리 전용 — 운영 PWA hotfix 시도 금지 (20260328 워크트리 책임)

## Self-Check: PASSED

**Files verified:**
- `cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx` (151 lines, modified) — FOUND
- `.planning/quick/260526-sfw-redesign-29-extinguisher-public-w3-tsx-c/260526-sfw-PLAN.md` — FOUND
- `.planning/quick/260526-sfw-redesign-29-extinguisher-public-w3-tsx-c/260526-sfw-SUMMARY.md` (this file) — FOUND

**Commits verified:**
- `9249919` feat(quick-260526-sfw): redesign/29-extinguisher-public TSX 변환 — FOUND in `git log 31249ff..HEAD`

**Gate results:**
- 22 gate ALL PASS (line count 151 within [140, 160] / Build PASS / tsc 0 errors / linear-gradient 0 / 이모지 0 / status- 0 / w-8 h-8 0 / 배포 도구 호출 0 / OQ LOCKED 5 grep PASS / page/tbl/th/cl 4 객체 보존 / ROW_H 보존 / WebkitUserSelect 3 속성 / 인쇄 색 hex 8 / colgroup 5 비율 / 카피 17 / 비즈 anchor 핵심 11 / components.css 0 byte / App.tsx 0 byte / src/** 1 파일만)

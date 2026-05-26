---
phase: 260526-sfw
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
autonomous: true
requirements:
  - REDESIGN-29-W3-TSX-CONVERSION-EXTINGUISHER-PUBLIC
must_haves:
  truths:
    - "ExtinguisherPublicPage.tsx (149 lines, 종이 양식 모방 public route) 단일 파일 atomic 1-commit 변환 — W1 (qfa) wave-1-index.md §1.3 비즈 anchor 27건 박스 verbatim + W2 (re5) sketch-wave-2-extinguisher-table.html `.ext-page` / `.ext-tbl` / `.ext-th` / `.ext-cl` / `.ext-state` 5 CSS 정의 verbatim 박제 위에 적용된 결과가 cbc7119-preview 에서 W2 sketch 와 시각적으로 동일하다"
    - "OQ LOCKED 5건 적용 — #1 fontFamily '\"Noto Sans KR\", sans-serif' 인라인 보존 (tailwind.config 실측 font-sans=Pretendard 와 불일치, 토큰 치환 시 시각 변화 발생) / #2 background '#fff' 인라인 보존 (다크 모드 강제 차단) / #3 maxWidth 480 인라인 보존 (Tailwind max-w-md=448 / max-w-lg=512 모두 480 아님, arbitrary `max-w-[480px]` 도 사용 가능하나 인라인 유지 권장) / #4 점검관리자 정 '석현민' 하드코딩 보존 (redesign 범위 X) / #5 부 점검관리자 빈 셀 보존 (OQ #4 와 연동, 동적 분기 별도 quick 후보)"
    - "비즈 anchor 27건 1 byte 변경 0 강제 — react/router/state/fetch 8건 (useParams<{checkpointId}> / useState × 5 (cp/ext/records/loading/error) / fetch `/api/public/extinguisher/${encodeURIComponent(checkpointId)}` / json.success 분기+setCp/setExt/setRecords / setError '조회 실패' fallback / catch '네트워크 오류' / finally setLoading(false)) + 비즈 로직 8건 (year = new Date().getFullYear() / yearShort = year % 100 / byMonth 그룹핑 (year 일치 + max checked_at) / months Array.from length:12 / typeText ext?.type ?? '-' / ROW_H 35 / status 분기 'normal'→'무'/외→'유'/없음→'' / 우측 셀 분기 i===0/7/8/9/10 + fallback chain ext?.mgmtNo??cp.locationNo??'-' / ext?.location??cp.location) + 인쇄 색 hex 8종 + 폰트/속성 (background #c00 / color #FFD700 / color #fff / background #f0ede5 / border #333 2px / border #999 1px / border #bbb 1px / color #000 / color #333 / fontFamily 'Noto Sans KR' / fontWeight 700 / letterSpacing 0.15em / lineHeight 1.8 / lineHeight 1.4 / WebkitUserSelect 'none' + userSelect 'none' + WebkitTouchCallout 'none') + 카피 17종 + colgroup 비율 (6/3/6/10/10/10/13/14/14/14 합 100) + ROW_H*7 = 245 (우측 이미지 셀 height) + 우측 이미지 셀 borderLeft 2px solid #333"
    - "인쇄 양식 fontSize 예외 적용 — 종이 양식 모방 페이지 (W1 §3.1 적용 메타) 라서 design-system §1.1 노안 친화 룰 (9·10·11px 사용 금지) **미적용**. fontSize 10 (th + 소화기번호/설치장소) / 11 (푸터 본문) / 12 (tbl + cl + 헤더 행) / 18 (제목) 모두 source 값 1 byte 변경 0 보존. text-caption (12px) 격상 적용 안함 — 인쇄 시각 일관성 우선"
    - "page/tbl/th/cl 4 인라인 style 객체 (line 146~149) **인라인 유지** — sketch 의 `.ext-page` / `.ext-tbl` / `.ext-th` / `.ext-cl` 4 CSS class 정의는 sketch 시각 표현용. TSX 변환에서는 source 의 `const page: React.CSSProperties = {...}` / `const tbl` / `const th` / `const cl` 패턴 1 byte 변경 0 보존. components.css 신규 추가 0 (OQ #1~#5 LOCKED 위치 모두 인라인 유지 강제). Tailwind arbitrary class 치환 위험 (`padding 5px 4px` / `fontSize 10/12` / `border 2px solid #333` / `borderLeft 2px solid #333` 등이 1 byte 사고 유발 위험)"
    - "linear-gradient 0 / 이모지 0 / status- prefix 0 / w-8 h-8 0 (Tailwind config w-8=48px override) / wrangler 0 / npm run deploy 0 / components.css 0 byte diff / App.tsx 0 byte diff / src/** 변경 = ExtinguisherPublicPage.tsx 1 파일만"
    - "Build PASS — `cd cha-bio-safety && npm run build` 성공 (tsc --noEmit 0 errors + vite build success + PWA injectManifest PASS). Build 실패 시 commit 보류 (최대 2회 재시도)"
    - "단일 파일 atomic 패턴 자동 도달 9번째 — 10-cctv-info (149 lines 종이 양식 첫 사례) / 28-splash 4i9 / 23-education / 26-staff-manage oh0 / 24-checkpoints i4b / 22-documents uou / 25-qr-print bbz / lft / 6if 패턴 mirror"
  artifacts:
    - path: "cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx"
      provides: "ExtinguisherPublicPage TSX 변환본 (149 lines 종이 양식 인라인 유지 + OQ LOCKED 5 + 비즈 anchor 27 보존)"
      min_lines: 140
      contains: "fontFamily:'\"Noto Sans KR\", sans-serif'"
  key_links:
    - from: "cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx (line 1~7)"
      to: "wave-1-index.md §1.3 react-router/state/fetch 8건"
      via: "import { useEffect, useState } from 'react' + useParams from 'react-router-dom' + 3 interfaces 보존"
      pattern: "import \\{ useEffect, useState \\} from 'react'"
    - from: "cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx (line 8~44)"
      to: "wave-1-index.md §1.3 비즈 로직 8건"
      via: "useParams/useState×5/useEffect fetch/year/yearShort/byMonth 그룹핑/months/typeText/ROW_H 1 byte 0"
      pattern: "ROW_H = 35"
    - from: "cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx (line 46~143)"
      to: "wave-1-index.md §1.3 카피 17종 + colgroup 비율 + 우측 셀 분기"
      via: "JSX 렌더 영역 — table colgroup 10 col + thead 제목 + 관리자/종류/헤더 행 + 1~12월 행 + 우측 안내 셀 + 하단 빨강 푸터 verbatim"
      pattern: "소 화 기 점 검 표|colSpan=\\{10\\}|extinguisher-check\\.png|031-881-7119"
    - from: "cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx (line 146~149)"
      to: "sketch-wave-2-extinguisher-table.html line 271~321 `.ext-page` / `.ext-tbl` / `.ext-th` / `.ext-cl` / `.ext-state` 5 CSS"
      via: "4 인라인 style 객체 (page/tbl/th/cl) 1 byte 변경 0 + OQ LOCKED 5 (fontFamily/background/maxWidth/석현민/빈 셀)"
      pattern: "const page: React\\.CSSProperties|const tbl|const th|const cl"
    - from: "OQ LOCKED 5건"
      to: "wave-1-index.md §7 OQ 결정 결과 (W2 sketch 박제 확정)"
      via: "default (인라인 유지 + 하드코딩 보존) — fontFamily 토큰 치환 NG (font-sans=Pretendard) / #fff 인라인 / maxWidth 480 인라인 / 석현민 보존 / 빈 셀 보존"
      pattern: "OQ #[1-5]"
    - from: "verify gate 22 (Build PASS)"
      to: "wave-1-index.md §6 negative 22건 + W2 sketch CSS verbatim"
      via: "bash gate 22+ + npm run build 성공 후에만 commit"
      pattern: "npm run build"
---

<objective>
redesign/29-extinguisher-public TSX 변환 wave — ExtinguisherPublicPage.tsx (149 lines, 인증 없는 public route `/e/:checkpointId`, 종이 양식 모방 페이지) **단일 파일 atomic 1-commit** 변환.

W1 (qfa) `cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md` §1.3 비즈 anchor 27건 박스 + §6 negative 22건 + §7 OQ 5건 LOCKED + W2 (re5) `cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html` line 271~321 `.ext-page` / `.ext-tbl` / `.ext-th` / `.ext-cl` / `.ext-state` 5 CSS 정의 verbatim 박제 위에 적용. 비즈 anchor 27건 1 byte 변경 0 + page/tbl/th/cl 4 인라인 style 객체 1 byte 변경 0.

`feedback_gsd_workflow_strict` — GSD 워크플로 강제. 이 plan 은 minimal brief 단일 atomic 패턴 (oh0/i4b/uou/bbz/lft/6if mirror, 149 lines 단순하므로 220~280 target).

**핵심 결정** (149 lines 종이 양식 페이지 특수):
- **인라인 유지가 가장 안전** — Tailwind arbitrary class 치환 시 padding 5px 4px / fontSize 10/12 / border 1px solid #999 / borderLeft 2px solid #333 등 1 byte 사고 유발 위험 (10-cctv-info 2-단계 분리 사례는 var() 토큰 치환 단계가 있어서 분리, 본 페이지는 토큰 치환 대상 0 = 1-단계 단일 atomic)
- W2 sketch 의 5 CSS class 는 sketch HTML 시각 표현용 — TSX 에서는 source 의 4 객체 (`const page` / `const tbl` / `const th` / `const cl`) 패턴 그대로 보존 + state (loading/error) 인라인 style 도 그대로 유지
- components.css 신규 추가 0 (sketch class 가져오기 X)

`tailwind.config 실측` (planner 확인): `theme.extend.fontFamily.sans = ['Pretendard Variable', 'Pretendard', ...]` — Noto Sans KR 아님. **OQ #1 fontFamily 토큰 치환 NG 확정** → 인라인 `'"Noto Sans KR", sans-serif'` 1 byte 변경 0 강제.

Purpose: 29-extinguisher-public 종결 → cbc7119-preview 자동 배포 도구 호출 (GitHub Actions) 트리거 + 다음 페이지 진입 가능. 10-cctv-info / 28-splash 4i9 / 23-education / 26-staff-manage oh0 / 24-checkpoints i4b / 22-documents uou / 25-qr-print bbz / lft / 6if 단일 파일 atomic 패턴 9번째 자동 도달.
Output: ExtinguisherPublicPage.tsx 변환본 + Build PASS + atomic 1-commit (변환) + SUMMARY 1-commit.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md
@cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html
@cha-bio-safety/docs/redesign-context/29-extinguisher-public/29-extinguisher-public.md
@cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
@cha-bio-safety/docs/redesign-context/29-extinguisher-public/typography.css
@cha-bio-safety/docs/redesign-context/29-extinguisher-public/tokens.css
@cha-bio-safety/tailwind.config.js

<interfaces>
ExtinguisherPublicPage.tsx 변환 영역 — 149 lines source 단일 구역 (line range 분리 없음, 인라인 유지 패턴):

§A. imports + interfaces (line 1~7) — 1 byte 변경 0:
```typescript
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

interface CheckRecord { id: string; result: string; memo?: string; checked_at: string; staff_name: string }
interface CheckpointInfo { id: string; locationNo: string; location: string; floor: string; description?: string }
interface ExtInfo { mgmtNo: string; type: string; approvalNo?: string; manufacturedAt?: string; manufacturer?: string; prefixCode?: string; sealNo?: string; serialNo?: string; note?: string; location?: string }
```

§B. 컴포넌트 default export + hook + state (line 8~14) — 1 byte 변경 0:
- `export default function ExtinguisherPublicPage()` 함수형 컴포넌트 보존
- `useParams<{ checkpointId: string }>()`
- useState × 5: cp (CheckpointInfo|null) / ext (ExtInfo|null) / records (CheckRecord[]) / loading (true) / error (string|null)

§C. useEffect fetch (line 16~26) — 1 byte 변경 0:
- fetch path: `/api/public/extinguisher/${encodeURIComponent(checkpointId)}`
- json.success 분기 → setCp(json.data.checkpoint) / setExt(json.data.extinguisher) / setRecords(json.data.records)
- setError fallback `json.error ?? '조회 실패'`
- catch `'네트워크 오류'`
- finally setLoading(false)
- dep array `[checkpointId]`

§D. 비즈 로직 (line 28~44) — 1 byte 변경 0:
- `const year = new Date().getFullYear()` / `const yearShort = year % 100`
- `const byMonth: Record<number, CheckRecord> = {}` + records.forEach 그룹핑 (year 일치 필터 + max checked_at 갱신)
- loading / error+!cp early return 2건 (line 39, 40) — `<div style={page}><div style={{ textAlign:'center', padding:40, color:'#333', fontSize:14 }}>조회 중...</div></div>` / 동일 패턴 with error?? '데이터를 찾을 수 없습니다' — **`.ext-state` 패턴 (sketch line 318~321) 인라인 유지**, fontSize:14 보존
- `const months = Array.from({ length: 12 }, (_, i) => i + 1)`
- `const typeText = ext?.type ?? '-'`
- `const ROW_H = 35` + 주석 `// 고정 행 높이 (이미지 230px / 7행 + 패딩)` verbatim

§E. JSX render (line 46~143) — 종이 양식 markup 1 byte 변경 0:
- 외곽 `<div style={page}>` 보존
- `<table style={tbl} cellSpacing={0} cellPadding={0}>` 보존
- `<colgroup>` 10 col (line 49~60) — 6/3/6/10/10/10/13/14/14/14 % 1 byte 변경 0
- `<thead>` 제목 (line 62~66): `colSpan={10}` + `background:'#c00'` + `color:'#FFD700'` + `textAlign:'center'` + `fontSize:18` + `fontWeight:900` + `padding:'10px 0'` + `letterSpacing:'0.15em'` + `border:'2px solid #333'` — verbatim. 카피 `소 화 기 점 검 표` (공백 포함) 1 byte 변경 0.
- `<tbody>`:
  - Row 5 (line 70~77): 년도 행 — colSpan={3} `...th` / yearShort `borderRight:'1px solid transparent'` / 년 `borderLeft:'1px solid transparent'` / `rowSpan={2} colSpan={2}` 점검관리자 `verticalAlign:'middle'` / 정 / `<td colSpan={2} style={{ ...cl, textAlign:'center' }}>석현민</td>` — OQ #4 LOCKED 하드코딩
  - Row 6 (line 79~84): 종류 행 — colSpan={3} `...th` / colSpan={2} typeText / 부 / **빈 셀 `<td colSpan={2} style={{ ...cl, textAlign:'center' }}></td>`** — OQ #5 LOCKED 빈 셀
  - 헤더 행 (line 87~94): `background:'#f0ede5'` + 월/슬래시/일/점검자성명/이상유무/서명/점검사항 — borderRight/borderLeft 1px solid transparent (월·/·일 사이 셀 경계 시각 제거)
  - 1~12월 map (line 97~131): rec=byMonth[m] / day / name / status 분기 (`'normal'→'무'/외→'유'/없음→''`) / 우측 셀 분기 (i===0 7행 이미지 / i===7 소화기번호 라벨 / i===8 mgmtNo 또는 fallback / i===9 설 치 장 소 라벨 / i===10 location rowSpan={2}). 각 row 의 `height:ROW_H`. `/` 셀 `color:'#999'` + `width:8` + `padding:0`. i===0 이미지 셀: `<img src="/extinguisher-check.png" alt="정기점검(월1회)" />` 1 byte 변경 0 + `position:'absolute' as any` + `objectFit:'fill'` + `borderLeft:'2px solid #333'` + `height: ROW_H * 7` + `position:'relative' as any` + `overflow:'hidden'`.
  - 하단 푸터 (line 134~139): `background:'#c00'` + `color:'#fff'` + `colSpan={10}` + `fontSize:11` + `fontWeight:700` + `padding:'8px 6px'` + `lineHeight:1.8` + `border:'2px solid #333'`. 카피 `이상 발견 즉시 수리를 의뢰하십시오.` + `<br />` + `<span style={{ fontSize:10 }}>방 재 실 &nbsp;&nbsp;&nbsp; 031-881-7119</span>` (공백 + &nbsp; × 3) 1 byte 변경 0.

§F. 4 인라인 style 객체 (line 146~149) — 1 byte 변경 0:
```typescript
const page: React.CSSProperties = { maxWidth:480, margin:'0 auto', padding:'8px 8px 8px', fontFamily:'"Noto Sans KR", sans-serif', background:'#fff', color:'#000', fontWeight:700, WebkitUserSelect:'none', userSelect:'none', WebkitTouchCallout:'none' } as any
const tbl: React.CSSProperties = { width:'100%', borderCollapse:'collapse', border:'2px solid #333', fontSize:12, color:'#000', fontWeight:700 }
const th: React.CSSProperties = { background:'#f0ede5', border:'1px solid #999', padding:'5px 4px', fontWeight:700, fontSize:10, whiteSpace:'nowrap', color:'#000' }
const cl: React.CSSProperties = { border:'1px solid #bbb', padding:'5px 4px', fontSize:12, color:'#000', fontWeight:700 }
```

**비즈 anchor 27건 (W1 §1.3 verbatim, 1 byte 변경 0 강제):**
1. `useParams<{ checkpointId: string }>()` 제네릭 + checkpointId 키
2. useState × 5 (cp / ext / records / loading / error) 초기값
3. fetch `/api/public/extinguisher/${encodeURIComponent(checkpointId)}`
4. json.success 분기 + setCp(json.data.checkpoint) + setExt(json.data.extinguisher) + setRecords(json.data.records)
5. setError(json.error ?? '조회 실패')
6. catch '네트워크 오류'
7. finally setLoading(false)
8. dep array [checkpointId]
9. year/yearShort 계산식
10. byMonth 그룹핑 (year 일치 필터 + max checked_at)
11. months Array.from length:12
12. typeText fallback '-'
13. ROW_H = 35
14. status 분기 'normal'→'무' / 외→'유' / 없음→''
15. 우측 셀 분기 i===0/7/8/9/10
16. ext?.mgmtNo ?? cp.locationNo ?? '-' fallback chain
17. ext?.location ?? cp.location fallback chain
18. 인쇄 색 hex 8종: #c00 / #FFD700 / #fff / #f0ede5 / #333 / #999 / #bbb / #000
19. fontFamily '"Noto Sans KR", sans-serif' (OQ #1 LOCKED 인라인)
20. fontWeight 700 (페이지 전역 + tbl + th + cl)
21. letterSpacing 0.15em (헤더 제목)
22. lineHeight 1.8 (푸터) / lineHeight 1.4 (설치 장소)
23. WebkitUserSelect 'none' + userSelect 'none' + WebkitTouchCallout 'none'
24. colgroup 10 col (6/3/6/10/10/10/13/14/14/14 합 100)
25. ROW_H * 7 = 245 (우측 이미지 셀 height)
26. 우측 이미지 셀 borderLeft '2px solid #333'
27. 카피 17종 verbatim (소 화 기 점 검 표 / 년 도 / 종 류 / 점검관리자 / 정 / 부 / 월 / / / 일 / 점검자성명 / 이상유무/서명 / 점검사항 / 소화기번호 / 설 치 장 소 / 무 / 유 / 이상 발견 즉시 수리를 의뢰하십시오. / 방 재 실 (3 nbsp) 031-881-7119 / 조회 중... / 데이터를 찾을 수 없습니다 / 조회 실패 / 네트워크 오류 / 석현민 / 정기점검(월1회) / /extinguisher-check.png / 년)

**OQ LOCKED 5건 (W1 §7 결정 결과 — W2 sketch 박제 확정):**
- OQ #1: fontFamily '"Noto Sans KR", sans-serif' **인라인 보존** (tailwind.config.js 실측 결과 `font-sans=Pretendard` 이므로 토큰 치환 시 시각 변화 발생 — NG)
- OQ #2: background '#fff' **인라인 보존** (다크 모드 강제 차단)
- OQ #3: maxWidth 480 **인라인 보존** (Tailwind max-w-md=448 / max-w-lg=512 모두 480 아님)
- OQ #4: 점검관리자 정 '석현민' **하드코딩 보존** (redesign 범위 X, 별도 quick 후보)
- OQ #5: 부 점검관리자 **빈 셀 보존** (OQ #4 와 연동)

**tailwind.config 실측 (planner 확인 결과)**:
- `theme.extend.fontFamily.sans = ['Pretendard Variable', 'Pretendard', 'system-ui', '-apple-system', 'sans-serif']` — Noto Sans KR 부재 → font-sans 치환 시 시각 변화 발생 → OQ #1 LOCKED 인라인 유지 강제

**Negative gate (149 lines 종이 양식 페이지 특수)**:
- linear-gradient 0 / 그라데이션 0 / 이모지 0 (종이 양식 — 텍스트/숫자/슬래시/한글 라벨만)
- status- prefix className 0 (도메인 무관 — 인쇄 빨강 #c00 은 status-danger 아님)
- w-8 / h-8 0 (Tailwind config spacing override = 48px)
- src/** 외부 0 byte (App.tsx / functions/ / components.css / styles/ 0 byte)
- wrangler 0 / npm run deploy 0 (CLAUDE.local.md deny + 워크트리 룰)
- font-sans 또는 Tailwind 토큰 className 치환 시도 0 — page/tbl/th/cl 4 객체는 인라인 유지

**Positive gate**:
- `import { useEffect, useState } from 'react'` + `import { useParams } from 'react-router-dom'` 보존
- `export default function ExtinguisherPublicPage()` 보존
- 4 인라인 style 객체 (`const page` / `const tbl` / `const th` / `const cl`) 1 byte 변경 0
- ROW_H = 35 / ROW_H * 7 = 245 1 byte 변경 0
- WebkitUserSelect / userSelect / WebkitTouchCallout 'none' 3 속성 보존
- colgroup 10 col % 비율 1 byte 변경 0
- 비즈 anchor 27건 grep PASS

**Build PASS 검증**:
- Executor 가 격리된 worktree 에서 `cd cha-bio-safety && npm run build` 실행
- tsc --noEmit 0 errors / vite build success / PWA injectManifest PASS
- ExtinguisherPublicPage chunk size 보고
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>T1: ExtinguisherPublicPage.tsx 단일 atomic 변환 + Build PASS</name>
  <files>cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx</files>
  <action>
W1 (qfa) `cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md` §1.3 비즈 anchor 27건 박스 + §6 negative 22건 + §7 OQ 5건 LOCKED + W2 (re5) `cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html` line 271~321 5 CSS 정의 verbatim 박제 위에 적용. **단일 파일 in-place 교체, 1 atomic commit**.

**Step 0: tailwind.config 실측 (planner 사전 확인 결과 박제)**
- `grep -nE 'fontFamily|font-sans|Noto|Pretendard' cha-bio-safety/tailwind.config.js` — `font-sans` 첫 stack = 'Pretendard Variable' (Noto Sans KR 아님). **OQ #1 fontFamily 토큰 치환 NG 확정** → 인라인 `'"Noto Sans KR", sans-serif'` 1 byte 변경 0 강제.

**Step 1: §A imports + interfaces (line 1~7) — 1 byte 변경 0**
- `import { useEffect, useState } from 'react'` 보존
- `import { useParams } from 'react-router-dom'` 보존
- 3 interface (CheckRecord / CheckpointInfo / ExtInfo) verbatim 보존 — 필드명/타입/optional 표기 1 byte 변경 0.

**Step 2: §B 컴포넌트 default export + hook + state (line 8~14) — 1 byte 변경 0**
- `export default function ExtinguisherPublicPage()` 함수형 컴포넌트 시그니처 보존.
- `const { checkpointId } = useParams<{ checkpointId: string }>()` 1 byte 변경 0.
- useState × 5 (cp/ext/records/loading/error) 초기값 1 byte 변경 0.

**Step 3: §C useEffect fetch (line 16~26) — 1 byte 변경 0**
- 함수 본문 verbatim 보존: fetch path `${encodeURIComponent(checkpointId)}` / json.success 분기 / setError fallback / catch / finally / dep array.
- 카피 '조회 실패' / '네트워크 오류' verbatim.

**Step 4: §D 비즈 로직 (line 28~44) — 1 byte 변경 0**
- year/yearShort 계산식 verbatim.
- byMonth 그룹핑 forEach (year 일치 필터 + max checked_at 갱신) verbatim.
- loading / error+!cp early return 2건 (line 39, 40) — 인라인 `<div style={page}><div style={{ textAlign:'center', padding:40, color:'#333', fontSize:14 }}>...</div></div>` 패턴 1 byte 변경 0 (sketch `.ext-state` 시각 표현은 인라인 객체로 그대로 유지). 카피 '조회 중...' / '데이터를 찾을 수 없습니다' verbatim.
- `const months = Array.from({ length: 12 }, (_, i) => i + 1)` verbatim.
- `const typeText = ext?.type ?? '-'` verbatim.
- `const ROW_H = 35` 라인 + 주석 `// 고정 행 높이 (이미지 230px / 7행 + 패딩)` verbatim.

**Step 5: §E JSX render (line 46~143) — 종이 양식 markup 1 byte 변경 0**

§5.1 외곽 wrapper + table + colgroup:
- `<div style={page}>` / `<table style={tbl} cellSpacing={0} cellPadding={0}>` 1 byte 변경 0.
- `<colgroup>` 10 col 비율 (6/3/6/10/10/10/13/14/14/14 합 100) 1 byte 변경 0.

§5.2 thead 제목 (line 62~66):
- `<td colSpan={10} style={{ background:'#c00', color:'#FFD700', textAlign:'center', fontSize:18, fontWeight:900, padding:'10px 0', letterSpacing:'0.15em', border:'2px solid #333' }}>` 1 byte 변경 0.
- 카피 `소 화 기 점 검 표` (공백 포함) 1 byte 변경 0.

§5.3 Row 5/6 (관리자/종류) (line 70~84):
- Row 5: colSpan={3} 년 도 / yearShort `borderRight:'1px solid transparent'` / 년 `borderLeft:'1px solid transparent'` / `rowSpan={2} colSpan={2}` 점검관리자 `verticalAlign:'middle'` / 정 `<td colSpan={2} style={{ ...cl, textAlign:'center' }}>석현민</td>` (OQ #4 하드코딩 보존).
- Row 6: 종류 / colSpan={2} typeText / 부 / **빈 셀** `<td colSpan={2} style={{ ...cl, textAlign:'center' }}></td>` (OQ #5 빈 셀 보존).

§5.4 헤더 행 (line 87~94):
- `<tr style={{ background:'#f0ede5' }}>` 보존.
- 월 (borderRight transparent) / `/` (borderLeft+borderRight transparent) / 일 (borderLeft transparent) / colSpan={2} 점검자성명 / colSpan={2} 이상유무/서명 / colSpan={3} 점검사항 — 각 셀 `...th, textAlign:'center'` 보존.

§5.5 1~12월 map (line 97~131):
- `months.map((m, i) => { ... })` 함수 본문 1 byte 변경 0.
- rec=byMonth[m] / day=rec? new Date(rec.checked_at).getDate() : '' / name=rec?.staff_name ?? '' / status 분기 ('normal'→'무'/외→'유'/없음→'') verbatim.
- 우측 셀 분기 i===0/7/8/9/10:
  - i===0: `<td rowSpan={7} colSpan={3} style={{ ...cl, padding:0, borderLeft:'2px solid #333', height: ROW_H * 7, position:'relative' as any, overflow:'hidden' }}>` + `<img src="/extinguisher-check.png" alt="정기점검(월1회)" style={{ position:'absolute' as any, top:0, left:0, width:'100%', height:'100%', objectFit:'fill', display:'block' }} />` 1 byte 변경 0.
  - i===7: 소화기번호 라벨 (th, fontSize:10, height:ROW_H, borderLeft:'2px solid #333').
  - i===8: mgmtNo `ext?.mgmtNo ?? cp.locationNo ?? '-'` fallback chain.
  - i===9: 설 치 장 소 라벨 (th, fontSize:10, borderLeft 2px).
  - i===10: location `rowSpan={2} colSpan={3}` `verticalAlign:'middle'` `lineHeight:1.4` + `ext?.location ?? cp.location` fallback.
- 좌측 6 셀 (월/슬래시/일/점검자×2/이상유무/서명) 각 `height:ROW_H` 보존. 슬래시 셀 `width:8` + `padding:0` + `color:'#999'` 보존.

§5.6 하단 푸터 (line 134~139):
- `<td colSpan={10} style={{ background:'#c00', color:'#fff', textAlign:'center', fontSize:11, fontWeight:700, padding:'8px 6px', lineHeight:1.8, border:'2px solid #333' }}>` 1 byte 변경 0.
- 카피 `이상 발견 즉시 수리를 의뢰하십시오.` + `<br />` + `<span style={{ fontSize:10 }}>방 재 실 &nbsp;&nbsp;&nbsp; 031-881-7119</span>` (&nbsp; × 3) 1 byte 변경 0.

**Step 6: §F 4 인라인 style 객체 (line 146~149) — 1 byte 변경 0**
- `const page: React.CSSProperties = { maxWidth:480, margin:'0 auto', padding:'8px 8px 8px', fontFamily:'"Noto Sans KR", sans-serif', background:'#fff', color:'#000', fontWeight:700, WebkitUserSelect:'none', userSelect:'none', WebkitTouchCallout:'none' } as any`
- `const tbl: React.CSSProperties = { width:'100%', borderCollapse:'collapse', border:'2px solid #333', fontSize:12, color:'#000', fontWeight:700 }`
- `const th: React.CSSProperties = { background:'#f0ede5', border:'1px solid #999', padding:'5px 4px', fontWeight:700, fontSize:10, whiteSpace:'nowrap', color:'#000' }`
- `const cl: React.CSSProperties = { border:'1px solid #bbb', padding:'5px 4px', fontSize:12, color:'#000', fontWeight:700 }`

**Step 7: 검증 — npm run build (Build 실패 시 commit 보류)**
- `cd cha-bio-safety && npx tsc --noEmit` — 0 errors.
- `cd cha-bio-safety && npm run build` — PASS (vite build success + PWA injectManifest PASS). ExtinguisherPublicPage chunk size 보고.
- Build 실패 시: 오류 수정 후 최대 2회 재시도. 2회 실패 시 deviation 보고 + commit 보류 (`feedback_check_branch_before_edit`).

**Step 8: atomic commit (1 commit, 1 파일)**
```bash
git add cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
git commit -m "feat(quick-260526-sfw): redesign/29-extinguisher-public TSX 변환 (ExtinguisherPublicPage 149 종이 양식 인라인 유지 + 비즈 anchor 27 보존 + OQ LOCKED 5 + W1 §1.3 / W2 5 CSS verbatim)"
```

**(주의) 변환 결과의 line 수**: 본 페이지는 토큰 치환 / className 격상 / Lucide 치환 / 새 컴포넌트 추출이 **모두 없음** (단일 atomic 인라인 유지 패턴). 따라서 변환 후 line 수는 **149 lines 그대로 또는 ±2 lines** 범위 (사실상 source 와 거의 동일). 변환의 본질은 **W1 §1.3 / W2 5 CSS 박제 위 검증** 자체 — 변경 없음을 grep 으로 확인하는 작업.

만약 변환 단계에서 변경할 항목이 발견되면 (예: fontFamily 토큰 치환 / page background 치환 / `.ext-page` className 추가 / loading/error 의 fontSize:14 격상 등) — **모두 deviation** 으로 간주, OQ LOCKED 5 위반 → 즉시 중단 + 사용자 보고. default 는 source 1 byte 변경 0.

메모리 룰 inline 12 slug (W1 §5 박제, plan 본문 echo 금지):
feedback_planner_prompt_sketch_verbatim / feedback_redesign_sketch_rule_enforcement / feedback_sketch_realistic_data / feedback_tsx_wave_emoji_dot_gap / feedback_tsx_wave_stat_card_drift / feedback_text_caption_leading_none / feedback_tailwind_token_class_pattern / feedback_tailwind_w8_h8_is_48px / feedback_cbc7119_design_never_wrangler / feedback_design_changes_ask_first / feedback_avoid_premature_confirmation / project_redesign_10_cctv_info_status.
  </action>
  <verify>
    <automated>
# ── TSX 전용 22 gate (W1 §6 negative 22 + W2 sketch CSS verbatim 추출) ──

# (1) ExtinguisherPublicPage.tsx 존재 + min_lines 140 (149 ± 2 범위)
test -f cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
test "$(wc -l < cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx)" -ge "140"
test "$(wc -l < cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx)" -le "160"

# (2) cd cha-bio-safety && npm run build PASS (Build 가 없으면 commit 금지)
(cd cha-bio-safety && npm run build)

# (3) tsc --noEmit 0 errors (별도 안전 확인)
(cd cha-bio-safety && npx tsc --noEmit)

# (4) react / react-router-dom import grep PASS
grep -qE "import \{ useEffect, useState \} from 'react'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -qE "import \{ useParams \} from 'react-router-dom'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (5) export default function ExtinguisherPublicPage 보존
grep -qE "^export default function ExtinguisherPublicPage" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (6) linear-gradient 0
test "$(grep -v '^[[:space:]]*\\*\\|^[[:space:]]*//' cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx | grep -c "linear-gradient")" = "0"

# (7) 이모지 0 (종이 양식 — 텍스트/숫자/슬래시/한자/한글 라벨만)
test "$(LC_ALL=C grep -cP '[\x{1F300}-\x{1FAFF}]' cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx)" = "0"

# (8) status- prefix className 0 (인쇄 빨강 #c00 은 status-danger 아님)
test "$(grep -v '^[[:space:]]*//\\|^[[:space:]]*\\*' cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx | grep -cE 'className=[^>]*"[^"]*(bg-status-|text-status-|border-status-)')" = "0"

# (9) w-8 / h-8 0 (Tailwind config spacing override = 48px)
test "$(grep -v '^[[:space:]]*//\\|^[[:space:]]*\\*' cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx | grep -cE 'className=[^>]*"[^"]*\b(w-8|h-8)\b')" = "0"

# (10) wrangler 0 / "npm run deploy" 0
test "$(grep -cE 'wrangler|npm run deploy' cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx)" = "0"

# (11) fontFamily '"Noto Sans KR", sans-serif' 인라인 보존 (OQ #1 LOCKED)
grep -qE "fontFamily:[[:space:]]*'\"Noto Sans KR\", sans-serif'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (12) background '#fff' 인라인 보존 (OQ #2 LOCKED)
grep -qE "background:[[:space:]]*'#fff'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (13) maxWidth 480 인라인 보존 (OQ #3 LOCKED — Tailwind max-w-md/lg 모두 불일치)
grep -qE "maxWidth:[[:space:]]*480" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (14) 점검관리자 정 '석현민' 하드코딩 보존 (OQ #4 LOCKED)
grep -q "석현민" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (15) page/tbl/th/cl 4 인라인 style 객체 보존
grep -qE "^const page: React\.CSSProperties = \{" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -qE "^const tbl: React\.CSSProperties = \{" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -qE "^const th: React\.CSSProperties = \{" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -qE "^const cl: React\.CSSProperties = \{" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (16) ROW_H = 35 1 byte 변경 0
grep -qE "const ROW_H = 35" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "ROW_H \* 7" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (17) WebkitUserSelect / userSelect / WebkitTouchCallout 'none' 3 속성 보존
grep -q "WebkitUserSelect:'none'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "userSelect:'none'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "WebkitTouchCallout:'none'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (18) 인쇄 색 hex 8종 grep PASS
grep -q "'#c00'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "'#FFD700'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "'#fff'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "'#f0ede5'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "'2px solid #333'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "'1px solid #999'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "'1px solid #bbb'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -qE "color:'#000'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (19) colgroup 10 col % 비율 1 byte 변경 0 (6/3/6/10/10/10/13/14/14/14)
grep -q "width:'6%'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "width:'3%'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "width:'10%'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "width:'13%'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "width:'14%'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (20) 카피 17종 verbatim grep PASS
grep -q "소 화 기 점 검 표" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "년 도" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "종 류" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "점검관리자" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "점검자성명" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "이상유무/서명" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "점검사항" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "소화기번호" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "설 치 장 소" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "이상 발견 즉시 수리를 의뢰하십시오" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "방 재 실" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "031-881-7119" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "조회 중\.\.\." cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "데이터를 찾을 수 없습니다" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "조회 실패" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "네트워크 오류" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "정기점검(월1회)" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "/extinguisher-check.png" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (21) 비즈 anchor 핵심 grep PASS
grep -q "useParams<{ checkpointId: string }>" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "fetch(\`/api/public/extinguisher/" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "encodeURIComponent(checkpointId)" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "json.data.checkpoint" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "json.data.extinguisher" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "json.data.records" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "Array.from({ length: 12 }" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "ext?.type ?? '-'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "ext?.mgmtNo ?? cp.locationNo" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "ext?.location ?? cp.location" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
grep -q "rec.result === 'normal'" cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# (22) components.css 0 byte diff + App.tsx 0 byte diff + src/** 변경 = ExtinguisherPublicPage.tsx 1 파일만
test "$(git diff origin/main..HEAD -- cha-bio-safety/src/styles/components.css | wc -l)" = "0"
test "$(git diff origin/main..HEAD --name-only -- cha-bio-safety/src/App.tsx | wc -l)" = "0"
test "$(git diff origin/main..HEAD --name-only -- cha-bio-safety/src/ | wc -l)" = "1"
git diff origin/main..HEAD --name-only -- cha-bio-safety/src/ | grep -q "^cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx$"

echo "── ALL 22 gate PASS ──"
echo "ExtinguisherPublicPage chunk size:"
ls -lh cha-bio-safety/dist/assets/ 2>/dev/null | grep -iE "extinguisher|public|index" | head -5 || true
    </automated>
  </verify>
  <done>
- ExtinguisherPublicPage.tsx 1 파일 atomic commit 완료 (커밋 메시지: "feat(quick-260526-sfw): redesign/29-extinguisher-public TSX 변환 (ExtinguisherPublicPage 149 종이 양식 인라인 유지 + 비즈 anchor 27 보존 + OQ LOCKED 5 + W1 §1.3 / W2 5 CSS verbatim)")
- TSX 전용 22 gate PASS — Build PASS + react/react-router-dom import + export default + linear-gradient 0 + 이모지 0 + status- prefix 0 + w-8/h-8 0 + 배포 도구 호출 0 + fontFamily Noto Sans KR 인라인 + #fff/maxWidth 480/석현민 보존 + page/tbl/th/cl 4 객체 보존 + ROW_H/WebkitUserSelect 3 속성 보존 + 인쇄 색 hex 8종 + colgroup 10 col 비율 + 카피 17종 + 비즈 anchor 핵심 grep PASS + components.css 0 byte + App.tsx 0 byte + src/** 변경 1 파일만
- npm run build PASS (vite + PWA injectManifest) — Build 실패 시 commit 보류 (최대 2회 재시도)
- OQ LOCKED 5 적용 — #1 fontFamily '"Noto Sans KR", sans-serif' 인라인 / #2 background '#fff' 인라인 / #3 maxWidth 480 인라인 / #4 '석현민' 하드코딩 / #5 부 점검관리자 빈 셀
- 비즈 anchor 27건 1 byte 변경 0 (useParams 제네릭 / useState×5 / fetch path / json.success 분기 / setError/catch/finally / year/yearShort / byMonth 그룹핑 / months/typeText/ROW_H / status 분기 / 우측 셀 분기 i===0/7/8/9/10 / fallback chain × 2 / 인쇄 색 hex 8종 / fontWeight 700 / letterSpacing 0.15em / lineHeight 1.8+1.4 / WebkitUserSelect 3 속성 / colgroup 10 col 비율 / ROW_H * 7 = 245 / borderLeft 2px solid #333 / 카피 17종 verbatim)
- 변환 결과 line 수 149 ± 2 (140~160 범위, 사실상 source 그대로) — 토큰 치환/className 격상/Lucide 치환/새 컴포넌트 추출 모두 미적용 (단일 atomic 인라인 유지 패턴, 종이 양식 모방 페이지 특수)
  </done>
</task>

</tasks>

<verification>
- TSX 전용 22 gate (위 task verify) 모두 PASS — Build PASS 포함, components.css 0 byte / App.tsx 0 byte / src/** 변경 1 파일만 / 이모지 0 / linear-gradient 0 / status- prefix 0 / w-8 h-8 0 / 배포 도구 호출 단어 0 / OQ LOCKED 5 grep PASS (fontFamily Noto Sans KR 인라인 / #fff / maxWidth 480 / 석현민) / page/tbl/th/cl 4 객체 보존 / 인쇄 색 hex 8종 / colgroup 10 col 비율 / 카피 17종 / 비즈 anchor 27 핵심 grep PASS
- Build gate (필수) — `cd cha-bio-safety && npm run build` PASS + chunk size 보고. Build 실패 시 최대 2회 재시도 후 deviation 보고 + commit 보류.
- 작업 종료 누적: `git log --oneline origin/main..HEAD` ≈ 2 commit (T1 atomic 변환 1 + SUMMARY 1).
- 디자인 작업 룰: wrangler 명령 / production 배포 도구 절대 금지 (이 워크트리 CLAUDE.local.md deny). main 머지 시 GitHub Actions 자동 cbc7119-preview 배포 도구 호출 트리거.
- 변환 결과 line 수는 source 와 사실상 동일 (±2) — 종이 양식 페이지의 인라인 유지 default 패턴. 만약 변환 단계에서 변경할 항목이 발견되면 deviation 으로 간주, OQ LOCKED 5 위반 → 즉시 중단 + 사용자 보고.
- 메모리 룰 12 slug 적용 — `feedback_planner_prompt_sketch_verbatim` / `feedback_redesign_sketch_rule_enforcement` / `feedback_sketch_realistic_data` / `feedback_tsx_wave_emoji_dot_gap` / `feedback_tsx_wave_stat_card_drift` / `feedback_text_caption_leading_none` / `feedback_tailwind_token_class_pattern` / `feedback_tailwind_w8_h8_is_48px` / `feedback_cbc7119_design_never_wrangler` / `feedback_design_changes_ask_first` / `feedback_avoid_premature_confirmation` / `project_redesign_10_cctv_info_status`.
</verification>

<success_criteria>
- ExtinguisherPublicPage.tsx (149 lines, public route `/e/:checkpointId`) 의 §A imports + interfaces / §B 컴포넌트 export + hook + state / §C useEffect fetch / §D 비즈 로직 / §E JSX render (외곽 + table + colgroup + thead 제목 + Row 5/6 관리자/종류 + 헤더 행 + 1~12월 map + 우측 안내 셀 + 하단 푸터) / §F 4 인라인 style 객체 모두 **1 byte 변경 0** 으로 보존
- W1 (qfa) `wave-1-index.md` §1.3 비즈 anchor 27건 박스 + §6 negative 22건 + §7 OQ 5건 LOCKED 적용 결과 grep PASS
- W2 (re5) `sketch-wave-2-extinguisher-table.html` line 271~321 `.ext-page` / `.ext-tbl` / `.ext-th` / `.ext-cl` / `.ext-state` 5 CSS 정의는 source 의 4 인라인 객체 (page/tbl/th/cl) 와 시각적 등가 — components.css 신규 추가 0 (sketch class 가져오기 X, 인라인 유지)
- OQ LOCKED 5 적용 — #1 fontFamily '"Noto Sans KR", sans-serif' 인라인 (font-sans=Pretendard 와 불일치 확인) / #2 background '#fff' 인라인 / #3 maxWidth 480 인라인 / #4 '석현민' 하드코딩 / #5 부 점검관리자 빈 셀
- 인쇄 양식 fontSize 예외 — design-system §1.1 노안 친화 룰 (9·10·11px 사용 금지) 미적용 (종이 양식 모방). fontSize 10/11/12/14/18 모두 source 값 보존
- linear-gradient 0 / 이모지 0 / status- prefix 0 / w-8 h-8 0 / 배포 도구 호출 0 / src/** 외부 0 byte (App.tsx / functions/ / components.css / styles/ 0 byte)
- components.css 0 byte diff + App.tsx 0 byte diff + src/** 변경 = ExtinguisherPublicPage.tsx 1 파일만
- `npm run build` PASS + chunk size 보고
- atomic 2 commit (T1 변환 + SUMMARY) — git push 시 GitHub Actions cbc7119-preview 자동 배포 도구 호출 트리거 + 부모 워크트리 자동 도달
- 단일 파일 atomic 패턴 자동 도달 9번째 — 10-cctv-info / 28-splash 4i9 / 23-education / 26-staff-manage oh0 / 24-checkpoints i4b / 22-documents uou / 25-qr-print bbz / lft / 6if mirror
</success_criteria>

<output>
After completion, create `.planning/quick/260526-sfw-redesign-29-extinguisher-public-w3-tsx-c/260526-sfw-SUMMARY.md` covering:
- 변환 영역 §A~§F 6구역 (imports + 컴포넌트 export+hook+state + useEffect fetch + 비즈 로직 + JSX render + 4 인라인 style 객체) 적용 결과 + 최종 line 수 (149 → N, ±2 범위)
- 비즈 anchor 27건 보존 확인 (grep 결과 카운트)
- OQ LOCKED 5 적용 결과 (fontFamily Noto Sans KR / #fff / maxWidth 480 / 석현민 / 빈 셀)
- 인쇄 색 hex 8종 + colgroup 10 col 비율 + 카피 17종 + WebkitUserSelect 3 속성 + ROW_H 35 보존 확인
- 인쇄 양식 fontSize 예외 적용 확인 (10/11/12/14/18 모두 source 값 보존, design-system §1.1 노안 친화 룰 미적용 메타)
- npm run build PASS + chunk size + tsc --noEmit 0 errors
- components.css 0 byte + App.tsx 0 byte + src/** 1 파일 변경 확인
- 단일 atomic 인라인 유지 패턴 자동 도달 9번째 확인 (10-cctv-info / 28-splash 4i9 / 23-education / 26-staff-manage oh0 / 24-checkpoints i4b / 22-documents uou / 25-qr-print bbz / lft / 6if mirror)
- 누적 commit 수 + cbc7119-preview 배포 도구 호출 트리거 확인 + 부모 워크트리 자동 도달
- 메모리 박제 후보 (deviation / 신규 패턴 / 추가 룰 발견 시 — 특히 종이 양식 페이지의 인라인 유지 default 패턴이 새 메모리 룰 후보)
- 다음 단계: 29-extinguisher-public 완결 → 다음 페이지 후보 또는 4차 모니터링 진입
</output>

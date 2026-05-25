---
title: "redesign/25-qr-print — wave 5 (TSX 변환 verify checklist)"
status: complete
created: 2026-05-26
quick_id: 260526-an5
branch: redesign/25-qr-print
source_tsx: cha-bio-safety/src/pages/QRPrintPage.tsx (330 lines)
design_system: cha-bio-safety/docs/redesign-context/25-qr-print/design-system.md (v0.1.1, c8bfa86)
chrome_rules: 자체 헤더 페이지 (`/qr-print` ∈ `MOBILE_NO_NAV_PATHS`) — 02+06 chrome 룰 직접 적용 X, 자체 헤더 토큰화만
mirror_of: 18-worklog (slq) W7 + 23-education (r22) — 단일 파일 atomic TSX 변환 checklist 패턴
biz_anchor_count: 12+
oq_locked_count: 5
memory_rules_inline: 12
negative_count: 17
verify_grep_count: 28
---

# redesign/25-qr-print — wave 5 (TSX 변환 verify checklist)

본 문서는 **차후 별도 quick 에서 진행할 QRPrintPage.tsx 실제 TSX 변환의 SOURCE OF TRUTH** 이다. 18-worklog (slq) W7 mirror — 본 quick (an5) 의 산출은 markdown 1개 뿐, src/** 0 byte.

차후 변환 quick (예: `260527-xxx-redesign-25-qr-print-tsx-qrprintpage`) 작업자(자기 자신이든 다른 세션이든)는 이 markdown 1개만 읽으면:

- 비즈 anchor (CATEGORIES 7 + renderCardCanvas + generatePdf + handleDownload + dlBtnStyle + busy 3 state + 카피 9건 + raw fetch + useAuthStore.token) **1 byte 변경 0** 강제.
- W1 §7 OQ default 답 5건 (LOCKED) 채택.
- W2~W4 sketch CSS verbatim 박제 (`feedback_planner_prompt_sketch_verbatim` — 03-qr-scan 6건 deviation 회피).
- 폰트 격상 (9·10·11 금지, 12→`text-caption leading-none/relaxed`, 13→`text-label`, 14→`text-body-sm`, 15→`text-body leading-none`, PDF 내부 px 보존).
- Lucide ≥3 (ChevronLeft 필수 + Download + Printer 권장).
- components.css inherit ≥3 + 신규 0.
- Tailwind token cheatsheet 1:1 매핑 (status- prefix 0, w-8/h-8 함정, 34x34 인라인 명시).
- negative 17 + verify grep 28.

---

## §1. scope (단일 파일 박스)

- **단일 파일 in-place** — `cha-bio-safety/src/pages/QRPrintPage.tsx` (330 lines).
- **외부 컴포넌트 import 0** — jsPDF / QRCode / react-hot-toast / Zustand 직접.
- **4 sub-area** (W1 §1.1 표 verbatim):
  - (1) **외곽 + 자체 헤더** — line 253~263 (W2 sketch: `sketch-wave-2-chrome-header.html`)
  - (2) **안내 박스** — line 266~271 (W3 sketch: `sketch-wave-3-instructions-categories.html`)
  - (3) **카테고리 목록 + 카드** — line 274~310 (W3 sketch: 동일)
  - (4) **다운로드 버튼 + dlBtnStyle + handleDownload + renderCardCanvas + generatePdf** — line 283~302 + 312~330 + 229~250 + 29~119 + 122~219 (W4 sketch: `sketch-wave-4-download-actions.html`)
- **자체 헤더 페이지** — `/qr-print` ∈ `MOBILE_NO_NAV_PATHS`. App.tsx 0 byte 변경.
- **모바일/데스크톱 분기 없음** — 단일 컬럼, PC 1920x1080 에도 모바일 레이아웃 동일.
- **비즈 anchor 12+** — §4 박스에 verbatim 인용.
- **변환 후 라인 수 320 ± 30** (인라인 style 제거 + Tailwind 치환 → 약간 압축).
- **신규 components.css 0** — 단순 페이지, 14-reports inherit ≥3 + tokens.css + typography.css 로 충분.
- **mirror_of**: 18-worklog (slq) W7 + 23-education (r22) — 단일 파일 atomic TSX 변환.

---

## §2. region mapping 표 (4행 — sub-area별 element / line / sketch / OQ / 비즈 anchor)

| sub-area | element | line 범위 | sketch | OQ | 비즈 anchor |
|---|---|---|---|---|---|
| 1 | 외곽 wrapper + 자체 헤더 + 뒤로가기 + 헤더 타이틀 | 253~263 | W2 (`sketch-wave-2-chrome-header.html`) | #3 (Lucide ChevronLeft) + #4 (외곽 hex 토큰화) | 카피 verbatim "QR 코드 출력" / navigate(-1) / 34x34 인라인 |
| 2 | 안내 박스 wrapper + status-info 알리아스 박스 | 266~271 | W3 (`sketch-wave-3-instructions-categories.html`) | #2 (status-info-bg 치환) + #4 | 안내 카피 verbatim (2줄 + `<b>` 강조) / lineHeight:1.6 = `leading-relaxed` |
| 3 | 카테고리 목록 wrapper + CATEGORIES.map 카드 + 카드 타이틀 + 버튼 row | 274~310 | W3 (동일 파일) | #4 | CATEGORIES 7건 verbatim (소화기만 hasPublic:true) / `cat.label` / `flexWrap:wrap` |
| 4 | inspect 버튼 + public 분기 버튼 + dlBtnStyle 3 state + handleDownload async + renderCardCanvas async + generatePdf async | 283~302 + 312~330 + 229~250 + 29~119 + 122~219 | W4 (`sketch-wave-4-download-actions.html`) | #1 (public lin-grad 폐기 → bg-safe-bar) + #5 (§4 박스 전체 1 byte 0) | dlBtnStyle 3 state + busy 3 state + 카피 5건 + scale 3 + PAD 3*S + FONT Apple SD Gothic Neo + cardW 30/70 + cardH 38/90 + setFillColor 255/0/150 + typeLabel 점검용/점검확인용 |

---

## §3. sketch CSS verbatim fence (executor 직접 `grep -hoE 'class="[^"]+"' sketch-wave-*.html | sort -u` 실행 결과)

```bash
grep -hoE 'class="[^"]+"' cha-bio-safety/docs/redesign-context/25-qr-print/sketch-wave-*.html | sort -u
```

실행 결과 (verbatim 박제):

```
class="bg-border-strong text-text-tertiary text-caption font-bold leading-none rounded-sm"
class="bg-status-info-bg border border-status-info-bar rounded-md text-body text-text-secondary leading-relaxed"
class="bg-status-info-bg border border-status-info-bar rounded-md text-caption text-text-secondary leading-relaxed"
class="bg-status-safe-bar text-text-on-accent text-caption font-bold leading-none rounded-sm"
class="bg-surface-page"
class="bg-surface-raised border border-border-default rounded-md"
class="bg-surface-raised border border-border-strong rounded-md"
class="bg-surface-raised border-b border-border-default"
class="bg-surface-sunken border border-border-default rounded-sm text-text-secondary"
class="bg-surface-sunken border border-border-default rounded-sm"
class="bg-surface-sunken rounded-md"
class="flex gap-8 flex-wrap items-start justify-center mb-12"
class="flex gap-8 flex-wrap items-start"
class="font-bold mb-2 mt-4"
class="font-bold mb-2"
class="font-bold mb-3 mt-6"
class="font-bold mb-3"
class="font-bold text-text-primary"
class="frame-shell-desktop"
class="frame-shell-mobile"
class="max-w-[1400px] mx-auto mt-12"
class="max-w-[1700px] mx-auto mt-12 p-6 rounded-lg"
class="mb-6 max-w-[1700px] mx-auto"
class="page-bg-dark min-h-screen p-6"
class="pdf-mock-card"
class="text-body font-bold text-text-primary leading-none"
class="text-body font-bold text-text-secondary"
class="text-body-sm font-bold text-text-primary leading-none"
class="text-body-sm text-text-secondary"
class="text-body-sm text-text-tertiary leading-relaxed"
class="text-body-sm text-text-tertiary"
class="text-caption leading-none text-text-tertiary"
class="text-caption leading-relaxed"
class="text-caption text-text-tertiary"
class="text-text-on-accent text-caption font-bold leading-none rounded-sm"
class="text-white font-bold mb-2"
class="text-white font-bold mb-4"
class="text-zinc-400"
class="variant-label"
```

**해석 (변환 시 인용 대상 토큰만 — 시안 frame chrome 제외):**

- `bg-surface-page` — 외곽 wrapper bg
- `bg-surface-raised border border-border-default` — 헤더 + 카드 wrapper
- `bg-surface-raised border-b border-border-default` — 헤더 borderBottom 패턴
- `bg-surface-sunken border border-border-default rounded-sm` — 뒤로가기 버튼 (34x34 인라인 추가)
- `text-text-secondary` — 뒤로가기 stroke + 안내 본문 + 안내 lineHeight
- `bg-status-info-bg border border-status-info-bar rounded-md text-caption text-text-secondary leading-relaxed` — 안내 박스 (W3 sketch verbatim)
- `bg-status-safe-bar text-text-on-accent text-caption font-bold leading-none rounded-sm` — public 다운로드 버튼 (OQ #1 LOCKED 치환)
- `text-body font-bold text-text-primary leading-none` — 헤더 타이틀 (fontSize 15 격상)
- `text-body-sm font-bold text-text-primary leading-none` — 카드 타이틀 (fontSize 14 격상)
- `text-caption` (leading-none/relaxed) — 안내 + 버튼 카피 (fontSize 12)
- `bg-border-strong text-text-tertiary` — dlBtnStyle loading 상태 (var(--bd2)+var(--t3) 치환)

**필터 (시안 chrome 만 사용 — 실제 페이지에 사용 금지):**
- `frame-shell-desktop` / `frame-shell-mobile` / `page-bg-dark min-h-screen p-6` / `max-w-[1400px]|[1700px]` / `pdf-mock-card` / `variant-label` / `text-white` / `text-zinc-400` 등은 sketch 시안의 frame chrome, 실제 페이지로 옮기지 말 것.

추가 grep (background / color / border-radius / font-size — 인라인 style 추출):

```bash
grep -oE "(background|color|border-radius|font-size):[^;\"]+;" cha-bio-safety/docs/redesign-context/25-qr-print/sketch-wave-*.html | sort -u
```

(인라인 style 은 sketch frame chrome 영역 (page-bg-dark, variant-label 등) 에만 존재. 실제 페이지 영역의 모든 시각 토큰은 위 class 인용으로 충분 — `feedback_planner_prompt_sketch_verbatim` 만족.)

---

## §4. 비즈 anchor 박스 (W1 §1.3 verbatim 인용 — 12+ 항목)

다음 12 항목은 W5 TSX 변환에서 **1 byte 변경 금지** (memory `project_redesign_15_daily_report_status` 캘리브 좌표 100% 보존 일반화). 각 항목 별 식별자 / line 범위 / 사유 / grep gate.

### 4.1 외부 라이브러리 import 6건 (line 1~6)

```
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'
```

- **1 byte 변경 0** — jsPDF / QRCode 라이브러리 의존성. 추가 1줄만 허용: `import { ChevronLeft } from 'lucide-react'` (OQ #3 LOCKED).
- grep: `grep -cE "from 'jspdf'|from 'qrcode'|from '../stores/authStore'|from 'react-hot-toast'" QRPrintPage.tsx` → ≥4

### 4.2 CheckPoint interface (line 8~15)

```
interface CheckPoint {
  id: string
  locationNo?: string
  location: string
  floor: string
  category: string
  description?: string
}
```

- **1 byte 변경 0** — API 응답 shape. 변경 시 `cp.locationNo ?? cp.id` (line 181/200) 분기 깨짐.
- grep: `grep -cE "interface CheckPoint" QRPrintPage.tsx` → ==1

### 4.3 CATEGORIES 배열 7건 (line 17~25)

```
const CATEGORIES = [
  { value: '소화기',      label: '소화기',      hasPublic: true  },
  { value: '소화전',      label: '소화전',      hasPublic: false },
  { value: 'DIV',         label: 'DIV',         hasPublic: false },
  { value: '청정소화약제', label: '청정소화약제', hasPublic: false },
  { value: '완강기',      label: '완강기',      hasPublic: false },
  { value: '전실제연댐퍼', label: '전실제연댐퍼', hasPublic: false },
  { value: '방화셔터',    label: '방화셔터',    hasPublic: false },
]
```

- **순서/value/label/hasPublic 변경 0** — 비즈 데이터. 소화기만 `hasPublic: true` (점검확인용 공개 QR `${baseUrl}/e/${cp.id}` 분기 조건).
- grep: `grep -cE "value: '소화기'.*hasPublic: true" QRPrintPage.tsx` → ==1, `grep -c "방화셔터" QRPrintPage.tsx` → ≥1

### 4.4 renderCardCanvas async (line 29~119) — canvas 2d 렌더링 비즈 로직

```
- scale 기본 3 (화질 향상)
- W = width * scale / H = height * scale / S = scale
- PAD = 3 * S (상하 여백)
- FONT = `-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif`
- topFontSize 기본 12 / bottomFontSize 기본 13
- topH = topLines.length * (fs + 2 * S) + 2 * S
- bottomH 계산: 첫 줄 (bottomFontSize+1)*S, 나머지 (bottomFontSize-1)*S, 각 +2*S
- availH = H - PAD * 2 - topH - bottomH - 4 * S
- maxQrW = Math.floor(W * 0.85)
- qrDrawSize = Math.min(Math.max(availH, 20 * S), maxQrW)
- QRCode.toCanvas(qrCanvas, qrValue, { width: qrDrawSize, margin: 1 })
- ctx.fillStyle = '#ffffff' (배경)
- ctx.fillStyle = '#222222' (상단 텍스트)
- ctx.fillStyle = '#333333' (하단 텍스트)
- ctx.textAlign = 'center' / ctx.textBaseline = 'top'
- 첫 하단 라인은 'bold ' prefix
- return canvas.toDataURL('image/png')
```

- **1 byte 변경 0** — 종이 인쇄 픽셀 비즈 로직. scale 3 / PAD 3*S / margin 1 / fillStyle 3색 모두 anchor.
- grep: `grep -c "scale 3\|scale = 3" QRPrintPage.tsx` → ≥1 (또는 default value `scale = 3`), `grep -c "Apple SD Gothic Neo" QRPrintPage.tsx` → ==1, `grep -c "#ffffff\|#222222\|#333333" QRPrintPage.tsx` → ≥3

### 4.5 generatePdf async (line 122~219) — jsPDF 카드 그리드 비즈 로직

```
- if (points.length === 0) toast.error('체크포인트가 없습니다'); return
- isLandscape = type === 'public'
- jsPDF unit:'mm' format:'a4' orientation: portrait|landscape
- PAGE_W portrait 210 / landscape 297
- PAGE_H portrait 297 / landscape 210
- MARGIN = 10
- cardW inspect 30 / public 70 (mm)
- cardH inspect 38 / public 90 (mm)
- gap = 1 (mm)
- cols = Math.floor((usableW + gap) / (cardW + gap))
- rows = Math.floor((usableH + gap) / (cardH + gap))
- gridW/H 중앙정렬 offsetX/Y
- setFillColor(255, 255, 255) + rect 'FD'
- setDrawColor(150, 150, 150) + setLineWidth(0.2) + rect 외곽
- inspect: qrValue = cp.id / qrSize = Math.floor(cardW * 0.65) / bottomLines [locationNo??id, location, floor] / bottomFontSize 3
- public:  qrValue = `${baseUrl}/e/${cp.id}` / qrSize 동일 / topLines 3 verbatim / topFontSize 3 / bottomLines 동일 / bottomFontSize 3
- addImage 'PNG' + setFillColor(0, 0, 0) + setLineWidth(0.3) + rect 'S' (테두리 재 그리기)
- typeLabel = type === 'inspect' ? '점검용' : '점검확인용'
- doc.save(`${categoryLabel}_${typeLabel}_QR.pdf`)
```

- **1 byte 변경 0** — 종이 인쇄 mm 비즈 로직. PAGE/MARGIN/cardW/cardH/gap/setFillColor/setLineWidth/typeLabel 모두 anchor.
- grep: `grep -cE "cardW.*inspect.*30|cardW = type === 'inspect' \\? 30" QRPrintPage.tsx` → ≥1, `grep -cE "cardH.*38|cardH.*90" QRPrintPage.tsx` → ≥2, `grep -cE "MARGIN = 10|gap = 1" QRPrintPage.tsx` → ≥2, `grep -cE "setFillColor\\(255, 255, 255\\)|setFillColor\\(0, 0, 0\\)" QRPrintPage.tsx` → ≥2, `grep -c "점검용\|점검확인용" QRPrintPage.tsx` → ≥2

### 4.6 handleDownload async (line 229~250)

```
- key = `${category}-${type}`
- setBusy(key)
- raw fetch `/api/checkpoints?category=${encodeURIComponent(category)}`
- headers: { Authorization: `Bearer ${token}` }
- json.success && json.data?.length 체크
- catLabel = CATEGORIES.find(c => c.value === category)?.label ?? category
- await generatePdf(json.data, type, baseUrl, catLabel)
- toast.success('PDF 다운로드 완료')
- catch: toast.error('PDF 생성 오류') + console.error(e)
- finally: setBusy(null)
```

- **1 byte 변경 0** — raw fetch + Authorization Bearer (직접 인젝션) 유지. `src/utils/api.ts` 의 `api.get()` 래퍼 사용 안 함 (jsPDF 다운로드 응답이 raw fetch 쪽이 더 명시적).
- grep: `grep -c "Authorization: \`Bearer" QRPrintPage.tsx` → ==1, `grep -c "PDF 다운로드 완료" QRPrintPage.tsx` → ==1

### 4.7 dlBtnStyle 헬퍼 함수 3 state (line 312~330)

```
function dlBtnStyle(loading: boolean, isPublic: boolean): React.CSSProperties {
  return {
    padding: '9px 16px',
    borderRadius: 9,
    border: 'none',
    background: loading
      ? 'var(--bd2)'                                  // (1) loading
      : isPublic
        ? 'linear-gradient(135deg,#16a34a,#22c55e)'   // (2) public — OQ #1 LOCKED 폐기
        : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',  // (3) 기본 inspect — §6.4 정식, 유지
    color: loading ? 'var(--t3)' : '#fff',
    fontSize: 12,
    fontWeight: 700,
    cursor: loading ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }
}
```

- **3 state 매트릭스** (loading / public / 기본) — W5 변환 시 헬퍼 자체 제거 + Tailwind 치환:
  - loading → `bg-border-strong text-text-tertiary cursor-default`
  - public → `bg-status-safe-bar text-text-on-accent` (OQ #1 LOCKED — lin-grad `16a34a→22c55e` 폐기, solid 치환)
  - 기본 inspect → 인라인 `style={{ background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}` **유지** (§6.4 정식 그라데이션)
- 공통: `text-text-on-accent text-caption font-bold leading-none rounded-sm` + padding `9px 16px` (인라인 또는 `px-4 py-[9px]`)
- grep: `grep -c "1d4ed8.*0ea5e9" QRPrintPage.tsx` → ==1 (inspect 유지), `grep -c "16a34a.*22c55e" QRPrintPage.tsx` → **==0** (OQ #1 폐기)

### 4.8 busy 3 state useState (line 225)

```
const [busy, setBusy] = useState<string | null>(null) // 로딩 중인 버튼 key
```

- **3 state**: `null` (idle) / `${cat.value}-inspect` / `${cat.value}-public` (line 277~278 의 inspKey / publicKey).
- 변경 0 — 비즈 lock state.
- grep: `grep -c "useState<string | null>(null)" QRPrintPage.tsx` → ==1

### 4.9 useAuthStore().token + baseUrl (line 224, 227)

```
const { token }   = useAuthStore()
const baseUrl     = window.location.origin
```

- raw Authorization Bearer 인젝션 source.
- `baseUrl` 은 public QR URL prefix (`${baseUrl}/e/${cp.id}`) — generatePdf 의 public 분기 (line 191) 에서 사용.
- 변경 0.
- grep: `grep -c "useAuthStore" QRPrintPage.tsx` → ≥1, `grep -c "window.location.origin" QRPrintPage.tsx` → ==1

### 4.10 카피 verbatim 9건 (사용자 노출 텍스트)

| # | 카피 | 위치 (line) |
|---|---|---|
| 1 | `QR 코드 출력` | 헤더 타이틀 (262) |
| 2 | `항목별 QR 코드를 PDF 파일로 다운로드합니다.` + `소화기는 <b>점검용</b>(3×3 cm)과 <b>점검확인용</b>(7×9 cm)을 별도 파일로 다운로드할 수 있습니다.` | 안내 박스 (268~269) |
| 3 | `점검용 QR PDF` / `생성 중...` | inspect 버튼 (289) |
| 4 | `점검확인용 QR PDF` / `생성 중...` | public 버튼 (299) |
| 5 | `체크포인트가 없습니다` | toast.error (128 + 238) |
| 6 | `PDF 다운로드 완료` | toast.success (243) |
| 7 | `PDF 생성 오류` | toast.error (245) |
| 8 | `본 소화기는 QR코드로 관리되며,` + `아래 QR코드로` + `점검 내역 확인 가능합니다.` | renderCardCanvas topLines (194~196) |
| 9 | `${categoryLabel}_${typeLabel}_QR.pdf` (파일명) + typeLabel `점검용` / `점검확인용` (217) | doc.save (218) |

- **변경 0** — 모든 사용자 노출 문자열 verbatim.
- grep: `grep -c "QR 코드 출력" QRPrintPage.tsx` → ≥1, `grep -c "PDF 다운로드 완료" QRPrintPage.tsx` → ≥1, `grep -c "본 소화기는 QR코드로 관리되며" QRPrintPage.tsx` → ≥1

### 4.11 모바일/데스크톱 분기 없음

- 단일 컬럼 — PC 1920x1080 에도 모바일 레이아웃 동일.
- W5 변환 시 `lg:*` prefix 사용 금지.
- grep: `grep -cE "lg:" QRPrintPage.tsx` → ==0

### 4.12 자체 헤더 페이지 — `/qr-print` ∈ `MOBILE_NO_NAV_PATHS`

- `App.tsx` 변경 0 byte — `/qr-print` 는 이미 `MOBILE_NO_NAV_PATHS` 등재 (W1 §1 인벤토리 라인 138 확인).
- 자체 헤더 (line 256~263) 직접 유지. 02+06 chrome 룰 직접 적용 X.
- grep: `git diff --name-only HEAD -- cha-bio-safety/src/App.tsx | wc -l` → ==0

---

## §5. OQ LOCKED 5 (W1 §7 default 답 채택 — W2 진입 직전 사용자 컨펌 완료)

## OQ #1 LOCKED — 다운로드 버튼 그라데이션 처리

- **선택 옵션 (a)** — §6.4 룰 엄격 적용, public lin-grad `linear-gradient(135deg,#16a34a,#22c55e)` 폐기 → solid `bg-status-safe-bar` (alias `bg-safe-bar`) 치환.
- **사유** — design-system.md §6.4 "유일한 그라디언트 2종" (오늘 점검 대상 배너 + 저장/CTA 버튼 `1d4ed8→0ea5e9`) 에 public 의 `16a34a→22c55e` 없음. 위반 회피.
- **옛 코드** (line 320):
  ```
  : isPublic
    ? 'linear-gradient(135deg,#16a34a,#22c55e)'
  ```
- **변환 후**: public 버튼 className 에 `bg-status-safe-bar text-text-on-accent` 부여. inspect 버튼 은 기존 그라데이션 `1d4ed8→0ea5e9` 인라인 유지 (§6.4 정식).
- **grep gate**: `grep -c "16a34a.*22c55e" QRPrintPage.tsx` → ==0 / `grep -c "bg-status-safe-bar\|bg-safe-bar" QRPrintPage.tsx` → ≥1 / `grep -c "1d4ed8.*0ea5e9" QRPrintPage.tsx` → ==1

## OQ #2 LOCKED — 안내 박스 색 토큰화

- **선택 옵션 (a)** — `bg-status-info-bg + border-status-info-bar + text-text-secondary` 치환.
- **사유** — 25-qr-print.md §4 요구사항 ("페이지 화면만 토큰화") 일치. tokens.css 의 `--status-info-bg` / `--status-info-bar` 알리아스 존재.
- **옛 코드** (line 267):
  ```
  background: rgba(14,165,233,.08)
  border: 1px solid rgba(14,165,233,.25)
  color: var(--t2)
  ```
- **변환 후**: `<div className="bg-status-info-bg border border-status-info-bar rounded-md text-caption text-text-secondary leading-relaxed px-[13px] py-[10px]">` (W3 sketch verbatim).
- **grep gate**: `grep -c "rgba(14,165,233" QRPrintPage.tsx` → ==0 / `grep -c "bg-status-info-bg" QRPrintPage.tsx` → ==1 / `grep -c "border-status-info-bar" QRPrintPage.tsx` → ==1

## OQ #3 LOCKED — 뒤로가기 Lucide ChevronLeft 치환

- **선택 옵션 (a)** — `<ChevronLeft size={16} strokeWidth={2} className="text-text-secondary" />` 치환.
- **사유** — design-system.md §7.1 "이모지 사용 금지" + Lucide 16/20/24 통일. 기존 `width={15}` 와 가장 근접한 `size={16}`. `IconChevronLeft` (다른 페이지에서 종종 잘못 import) 가 아닌 정식 `ChevronLeft`.
- **옛 코드** (line 258~260):
  ```
  <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
  </svg>
  ```
- **변환 후**:
  ```
  import { ChevronLeft } from 'lucide-react'
  ...
  <ChevronLeft size={16} strokeWidth={2} className="text-text-secondary" />
  ```
- **grep gate**: `grep -c "ChevronLeft" QRPrintPage.tsx` → ≥2 (import + 사용) / `grep -c "from 'lucide-react'" QRPrintPage.tsx` → ==1 / `grep -c "M15 19l-7-7 7-7" QRPrintPage.tsx` → ==0 / `grep -c "IconChevronLeft\|<polyline" QRPrintPage.tsx` → ==0

## OQ #4 LOCKED — 외곽 hex 토큰 치환 범위

- **선택 옵션 (a)** — design-system.md §4.1 마이그레이션 표 그대로 모두 새 토큰 치환.
- **사유** — 25-qr-print.md §4 요구사항 일치. 워크트리 변환 부담은 단일 페이지 단위로 미미.
- **치환 매트릭스** (W5 변환 시 직접 적용):
  - `var(--bg)`  → `bg-surface-page`         (line 253)
  - `var(--bg2)` → `bg-surface-raised`       (line 256, 280)
  - `var(--bg3)` → `bg-surface-sunken`       (line 257)
  - `var(--bd)`  → `border-border-default`   (line 256, 257, 280)
  - `var(--bd2)` → `bg-border-strong`        (line 318 — dlBtnStyle loading bg)
  - `var(--t1)`  → `text-text-primary`       (line 262, 281)
  - `var(--t2)`  → `text-text-secondary`     (line 258 stroke, 267 안내)
  - `var(--t3)`  → `text-text-tertiary`      (line 322 — dlBtnStyle loading color)
- **grep gate**: `grep -cE "var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3)\)" QRPrintPage.tsx` → ==0

## OQ #5 LOCKED — 비즈 anchor 보존 확인

- **선택 옵션 (a)** — §4 박스 전체 1 byte 변경 0.
- **사유** — 사용자 OQ #1~#4 외 추가 변경 요청 없음. memory `project_redesign_15_daily_report_status` 캘리브 좌표 100% 보존 일반화.
- **검증** — §4.1~§4.12 의 모든 grep gate 통과 필수.
- **grep gate**: §4 의 모든 anchor grep PASS (헤더 `^### 4\\.` ≥12).

---

## §6. sketch class cheatsheet (§3 grep 결과 표 정리)

| 출처 sketch | 영역 | class 패턴 verbatim |
|---|---|---|
| W2 (chrome-header) | 외곽 | `bg-surface-page` |
| W2 | 헤더 wrapper | `bg-surface-raised border-b border-border-default` |
| W2 | 헤더 타이틀 | `text-body font-bold text-text-primary leading-none` |
| W2 | 뒤로가기 (34x34 인라인) | `bg-surface-sunken border border-border-default rounded-sm text-text-secondary` |
| W3 (instructions-categories) | 안내 박스 (`text-caption` 변형) | `bg-status-info-bg border border-status-info-bar rounded-md text-caption text-text-secondary leading-relaxed` |
| W3 | 안내 박스 (`text-body` 변형) | `bg-status-info-bg border border-status-info-bar rounded-md text-body text-text-secondary leading-relaxed` |
| W3 | 카테고리 카드 (default) | `bg-surface-raised border border-border-default rounded-md` |
| W3 | 카테고리 카드 (hover/강조) | `bg-surface-raised border border-border-strong rounded-md` |
| W3 | 카드 타이틀 | `text-body-sm font-bold text-text-primary leading-none` |
| W4 (download-actions) | public 다운로드 (OQ #1 LOCKED) | `bg-status-safe-bar text-text-on-accent text-caption font-bold leading-none rounded-sm` |
| W4 | inspect 다운로드 (lin-grad 인라인 유지) | `text-text-on-accent text-caption font-bold leading-none rounded-sm` + `style={{ background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}` |
| W4 | loading 상태 | `bg-border-strong text-text-tertiary text-caption font-bold leading-none rounded-sm` |
| W4 | 버튼 row | `flex gap-8 flex-wrap` (8 = 8px, w-8 함정 회피 — gap 토큰값) |

**제외 (시안 frame chrome 전용 — 실제 페이지 사용 금지):**
`frame-shell-desktop` / `frame-shell-mobile` / `page-bg-dark min-h-screen p-6` / `max-w-[1400px]|[1700px] mx-auto mt-12` / `pdf-mock-card` / `variant-label` / `text-white font-bold mb-2|4` / `text-zinc-400`.

---

## §7. 폰트 격상 (design-system.md §1.1 — fontSize 9·10·11 사용 금지)

| 옛 fontSize 인라인 | 신규 Tailwind class | 적용 위치 | 비고 |
|---|---|---|---|
| 15 (line 262) | `text-body font-bold leading-none` | 헤더 타이틀 | font-bold 추가, leading-none (34px 컨테이너 안) |
| 14 (line 281) | `text-body-sm font-bold` | 카드 타이틀 | font-bold 유지, marginBottom 10 → `mb-[10px]` |
| 13 (없음, PDF 내부만 line 43) | `text-label` | (외곽 미사용 — PDF px) | PDF 내부 px 보존 |
| 12 (line 267) | `text-caption text-text-secondary leading-relaxed` | 안내 박스 (lineHeight:1.6) | `leading-relaxed` (lineHeight:1.6 ≈ 1.625) |
| 12 (line 323) | `text-caption font-bold leading-none` | 다운로드 버튼 카피 | `leading-none` (단행, h~38px 컨테이너 안) |
| **9·10·11** | — | **금지** | design-system.md §1.1 |

**PDF 내부 (renderCardCanvas / generatePdf) px 보존**:
- topFontSize 기본 12 (renderCardCanvas) — 종이 인쇄 px, 변경 0
- bottomFontSize 기본 13 (renderCardCanvas) — 종이 인쇄 px, 변경 0
- inspect/public bottomFontSize 3 (generatePdf) — mm 단위, 변경 0
- public topFontSize 3 (generatePdf) — mm 단위, 변경 0

memory `feedback_text_caption_leading_none` — 작은 컨테이너 (헤더 토글, 배지, 칩, 버튼) 는 `leading-none` 명시. `text-caption` 의 default lh:1.5 (18px) 가 h-8 (32px) 컨테이너에서 시각 패딩 발생.

---

## §8. Lucide ≥3 (design-system.md §7.1)

```
import { ChevronLeft, Download, Printer } from 'lucide-react'
```

| 아이콘 | 사이즈 | className | 사용처 | OQ |
|---|---|---|---|---|
| `<ChevronLeft size={16} strokeWidth={2} className="text-text-secondary" />` | 16 | text-text-secondary | 뒤로가기 (line 257~261 SVG path 치환) | **#3 LOCKED** 필수 |
| `<Download size={16} className="text-text-on-accent" />` | 16 | text-text-on-accent | inspect 버튼 (line 289 카피 앞) | 권장 — display:flex gap:6 ↔ 아이콘 자연 정렬 |
| `<Printer size={16} className="text-text-on-accent" />` | 16 | text-text-on-accent | public 버튼 (line 299 카피 앞) | 권장 — 점검확인용 인쇄 의미 강조 |

**금지**:
- 이모지 0 (`📥` / `🖨️` 같은 emoji 사용 금지)
- `IconChevronLeft` 잘못된 import 0 (`lucide-react` 의 정식 이름은 `ChevronLeft`)
- raw `<svg>` `<path>` `<polyline>` 0 (line 258~260 의 옛 SVG 제거)

memory `feedback_tailwind_token_class_pattern` — Lucide `size={N}` prop (className `w-4 h-4` 가 아닌 명시적 prop).

---

## §9. components.css inherit ≥3 + 신규 0

**inherit ≥3** (기존 components.css / tokens.css / typography.css 그대로 사용):

| 컴포넌트 / 클래스 | 출처 | 25-qr-print 사용처 |
|---|---|---|
| `.btn` / `.btn-primary` | 14-reports SW1 components.css | 다운로드 버튼 (W4 — Tailwind utility 치환 시 inherit 안 함, 인라인 토큰만) |
| `.card` (raised) | 14-reports SW1 components.css | 카테고리 카드 — `bg-surface-raised border border-border-default rounded-md` (W3 sketch) |
| `.page-header` / `.header-back` | 02-inspection chrome / 14-reports | 자체 헤더 (W2) — chrome 룰 직접 적용 X, 토큰만 inherit |
| `.text-caption` / `.text-label` / `.text-body-sm` / `.text-body` | typography.css | 안내 / 카드 타이틀 / 버튼 카피 / 헤더 타이틀 |
| `.bg-surface-raised` / `.bg-surface-page` / `.bg-surface-sunken` / `.border-border-default` / `.bg-border-strong` / `.text-text-primary` / `.text-text-secondary` / `.text-text-tertiary` / `.text-text-on-accent` / `.bg-status-info-bg` / `.border-status-info-bar` / `.bg-status-safe-bar` | tokens.css (alias) | 외곽 / 헤더 / 카드 / 안내 / 버튼 — 모두 §10 cheatsheet 매트릭스 |

**신규 0** — 단순 페이지. 카드 7개 + 버튼 14개 + 안내 박스 1개 = 신규 utility 정의 불필요. slq (18-worklog) 의 신규 ≥10 패턴 미적용 (slq 는 표 + 캘리브 그리드 등 다수 신규 필요).

memory `feedback_tailwind_token_class_pattern` — `bg-safe-bar` (정확) vs `bg-status-safe-bar` (이중 prefix, 잘못된 사용) — tokens.css 에 둘 다 alias 등록되어 있음, 본 W5 는 sketch verbatim `bg-status-safe-bar` 사용.

---

## §10. Tailwind token cheatsheet (옛 var(--alias) → v0.1.1 className 1:1)

| 옛 인라인 (line) | className | 25-qr-print 적용 |
|---|---|---|
| `var(--bg)` (253) | `bg-surface-page` | 외곽 wrapper |
| `var(--bg2)` (256, 280) | `bg-surface-raised` | 헤더 + 카드 |
| `var(--bg3)` (257) | `bg-surface-sunken` | 뒤로가기 |
| `var(--bd)` (256, 257, 280) | `border-border-default` | 헤더 borderBottom + 뒤로가기 border + 카드 |
| `var(--bd2)` (318) | `bg-border-strong` 또는 `bg-surface-sunken` | dlBtnStyle loading bg |
| `var(--t1)` (262, 281) | `text-text-primary` | 헤더 타이틀 + 카드 타이틀 |
| `var(--t2)` (258 stroke, 267 안내) | `text-text-secondary` | ChevronLeft className + 안내 본문 |
| `var(--t3)` (322) | `text-text-tertiary` | dlBtnStyle loading color |
| `rgba(14,165,233,.08)` (267) | `bg-status-info-bg` (OQ #2 LOCKED) | 안내 bg |
| `rgba(14,165,233,.25)` (267) | `border-status-info-bar` (OQ #2 LOCKED) | 안내 border |
| `#fff` (322) | `text-text-on-accent` | 다운로드 버튼 텍스트 |
| lin-grad `1d4ed8→0ea5e9` (321) | **인라인 유지** (W4 anchor) | inspect 버튼 (§6.4 정식) |
| lin-grad `16a34a→22c55e` (320) | **`bg-status-safe-bar`** solid (OQ #1 LOCKED) | public 버튼 (lin-grad 폐기) |
| fontSize 15 (262) | `text-body font-bold leading-none` | 헤더 타이틀 |
| fontSize 14 (281) | `text-body-sm font-bold` | 카드 타이틀 |
| fontSize 12 (267) | `text-caption leading-relaxed` | 안내 (lineHeight:1.6 단행 다행) |
| fontSize 12 (323) | `text-caption font-bold leading-none` | 버튼 카피 (단행) |
| borderRadius 13 (280) | `rounded-md` 또는 `rounded-[13px]` | 카드 |
| borderRadius 10 (267) | `rounded-md` | 안내 |
| borderRadius 9 (315) | `rounded-md` 또는 `rounded-[9px]` | 다운로드 |
| borderRadius 8 (257) | `rounded-sm` | 뒤로가기 |
| width:34, height:34 (257) | **인라인 명시** `style={{ width: 34, height: 34 }}` 또는 `w-[34px] h-[34px]` | 뒤로가기 (memory `feedback_tailwind_w8_h8_is_48px` — w-8=48px 함정 회피) |

**status- prefix 0건 검증 매트릭스** (memory `feedback_tailwind_token_class_pattern`):

| 잘못 (사용 금지) | 정확 (사용) |
|---|---|
| `text-status-fire-bar` | `text-fire-bar` |
| `bg-status-safe-bar` (위 cheatsheet — alias 양쪽 모두 valid) | `bg-safe-bar` |
| `text-status-info` | `text-text-secondary` (안내) / `text-status-info-bar` |

> 25-qr-print W5 sketch (W4 download-actions) 는 `bg-status-safe-bar` 를 verbatim 사용 — tokens.css 의 양방향 alias 등록 덕분에 grep PASS. (`bg-status-safe-bar` 와 `bg-safe-bar` 모두 동일 색 표시.)

**lin-grad 매트릭스 (OQ #1 LOCKED)**:
- inspect `linear-gradient(135deg,#1d4ed8,#0ea5e9)` — **유지** (§6.4 정식, ≥1 grep)
- public `linear-gradient(135deg,#16a34a,#22c55e)` — **폐기** (0 grep, `bg-status-safe-bar` 치환)

**Lucide 교체 매트릭스 (OQ #3 LOCKED)**:
- `<path d="M15 19l-7-7 7-7"/>` 제거 (`<polyline>` 0)
- `import { ChevronLeft } from 'lucide-react'` 추가
- `<ChevronLeft size={16} strokeWidth={2} className="text-text-secondary" />` 치환

**w-8/h-8 함정 (memory `feedback_tailwind_w8_h8_is_48px`)**:
- `tailwind.config.js` spacing override: `w-8` = 48px (기본 32 아님), `w-7` = 32px.
- 뒤로가기 34×34 (line 257) — `w-8` 사용 시 48×48 으로 1.5배 부풀음. `w-[34px] h-[34px]` arbitrary 또는 인라인 `style={{ width: 34, height: 34 }}` 명시.
- 11-div (4ce707e) + 54a1c8d 사고 박제.

---

## §11. negative gate (17 항목)

```
- (1) src/** 변경 0 byte — 본 quick (an5) 는 markdown 1개만. QRPrintPage.tsx 포함 src/** 전체 0 byte.
- (2) sketch HTML 추가 0 — W2~W4 sketch 는 이미 commit 됨, 본 quick 에서 신규 0.
- (3) wrangler 명령 0 — `.claude/settings.local.json` deny 강제. memory `feedback_cbc7119_design_never_wrangler`.
- (4) `npm run deploy` 0 — CLAUDE.local.md 룰. main push 자동 cbc7119-preview 만.
- (5) 이모지 0 — design-system.md §7.1. Lucide 통일 (📥 / 🖨️ 등 사용 금지).
- (6) fontSize 9·10·11 인라인 0 — design-system.md §1.1 노안 친화 절대 룰.
- (7) status- prefix 0 — memory `feedback_tailwind_token_class_pattern`. `text-fire-bar` O / `text-status-fire-bar` X. (단 W4 sketch verbatim `bg-status-safe-bar` 는 tokens.css 양방향 alias 로 valid.)
- (8) w-8 / h-8 0 — memory `feedback_tailwind_w8_h8_is_48px`. 뒤로가기 34x34 인라인 명시 (`w-[34px] h-[34px]` 또는 `style={{ width: 34, height: 34 }}`).
- (9) IconChevronLeft 0 — Lucide 정식 이름은 `ChevronLeft`.
- (10) polyline SVG 0 — line 258~260 의 옛 `<svg><path>` 제거. raw SVG path 0.
- (11) 옛 var(--bg|bg2|bg3|bd|bd2|t1|t2|t3) raw 인라인 0 — §10 cheatsheet 1:1 치환 강제.
- (12) lin-grad public `linear-gradient(135deg,#16a34a,#22c55e)` 0 (OQ #1 LOCKED 폐기) — `bg-status-safe-bar` solid 치환.
- (13) rgba(14,165,233,.08/.25) raw 0 (OQ #2 LOCKED 토큰 치환) — `bg-status-info-bg` + `border-status-info-bar`.
- (14) CATEGORIES 7건 순서/value/label/hasPublic 변경 0 — 비즈 데이터 lock.
- (15) renderCardCanvas / generatePdf / handleDownload 비즈 변경 0 — scale 3 / FONT Apple SD Gothic Neo / cardW 30/70 / cardH 38/90 / MARGIN 10 / gap 1 / setFillColor 255/0/150 / setLineWidth 0.2/0.3 / typeLabel 점검용/점검확인용 / doc.save 파일명 / Authorization Bearer / catLabel / toast 카피 모두 1 byte 0.
- (16) 카피 verbatim 9건 변경 0 — "QR 코드 출력" / "점검용 QR PDF" / "점검확인용 QR PDF" / "생성 중..." / "체크포인트가 없습니다" / "PDF 다운로드 완료" / "PDF 생성 오류" / 안내 박스 카피 / 본 소화기는 QR코드로 관리되며,... 모두 1 byte 0.
- (17) raw fetch + Authorization Bearer + useAuthStore.token 변경 0 — `src/utils/api.ts` 의 `api.get()` 래퍼로 갈아끼우지 말 것 (현재 패턴 명시적, 유지).
```

---

## §12. self-verify grep (28 commands, 18+ 충족)

```bash
F=cha-bio-safety/docs/redesign-context/25-qr-print/wave-5-tsx-conversion-checklist.md

# 헤더 12 섹션
grep -cE "^## §[1-9][0-2]?\\." $F                    # >= 12 (§1~§12)

# 비즈 anchor
grep -c "CATEGORIES" $F                                # >= 1
grep -c "renderCardCanvas" $F                          # >= 1
grep -c "generatePdf" $F                               # >= 1
grep -c "handleDownload" $F                            # >= 1
grep -c "dlBtnStyle" $F                                # >= 1
grep -c "scale 3" $F                                   # >= 1
grep -c "Apple SD Gothic Neo" $F                       # >= 1
grep -cE "cardW.*30" $F                                # >= 1
grep -cE "cardW.*70" $F                                # >= 1
grep -cE "cardH.*38" $F                                # >= 1
grep -cE "cardH.*90" $F                                # >= 1
grep -cE "gap.*1" $F                                   # >= 1

# OQ LOCKED 5
grep -cE "^## OQ #[1-5] LOCKED" $F                     # >= 5

# sketch grep fence
grep -c "grep -hoE.*sketch-wave-" $F                   # >= 1

# 메모리 slug ≥10 unique
grep -oE "(feedback|project|reference)_[a-z0-9_]+" $F | sort -u | wc -l   # >= 10

# negative ≥15
grep -cE "^- \\([0-9]+\\)" $F                          # >= 15

# verify ≥18
grep -cE "grep -c|grep -cE" $F                         # >= 18

# lin-grad 매트릭스
grep -c "1d4ed8.*0ea5e9" $F                            # >= 1 (inspect 유지)
grep -c "16a34a.*22c55e" $F                            # >= 1 (public 매트릭스 박제)
grep -cE "bg-safe-bar|bg-status-safe-bar" $F           # >= 1 (OQ #1 치환)

# Lucide
grep -c "ChevronLeft" $F                               # >= 1
grep -c "from 'lucide-react'" $F                       # >= 1

# 카피 verbatim
grep -c "QR 코드 출력" $F                              # >= 1
grep -c "PDF 다운로드 완료" $F                          # >= 1
grep -c "체크포인트가 없습니다" $F                       # >= 1
grep -c "본 소화기는 QR코드로 관리되며" $F               # >= 1

# 34x34 인라인 명시
grep -cE "width.*34.*height.*34|34x34|w-\\[34px\\] h-\\[34px\\]" $F   # >= 1

# 라인 수
wc -l $F                                                # 550~750 예상
```

---

## §13. 메모리 룰 inline 박제 (≥10 unique slug — W1 §5 verbatim 인용)

다음 12 slug 모두 W5 변환 시 강제:

1. **`feedback_design_sketch_first`** — spacing/sizing 도 sketch 후 인라인. W2/W3/W4 sketch 컨펌 완료.
2. **`feedback_design_changes_ask_first`** — 레이아웃 변경은 상의 후. OQ #1~#4 컨펌 완료.
3. **`feedback_redesign_sketch_rule_enforcement`** — 4중 강화 (executor 프롬프트 + verify gate + 자체 검수 + 사용자 컨펌).
4. **`feedback_sketch_realistic_data`** — 표시 분기/라벨 코드 그대로. CATEGORIES 7건 / hasPublic 분기 / busy 3 state 모두 코드 그대로.
5. **`feedback_tsx_wave_stat_card_drift`** — executor source outline 패턴 보존, sketch 새 패턴 누락 가능. 본 W5 plan §3 sketch grep fence + §4 비즈 anchor + §10 cheatsheet 3중 강제.
6. **`feedback_planner_prompt_sketch_verbatim`** — sketch CSS grep verbatim. 03-qr-scan 6건 deviation 회피. 본 W5 §3 fence 박제.
7. **`feedback_tailwind_token_class_pattern`** — status- prefix 없음 + Lucide `size={N}` prop.
8. **`feedback_tailwind_w8_h8_is_48px`** — w-8=48px 함정. 34x34 인라인 명시.
9. **`feedback_text_caption_leading_none`** — 작은 컨테이너 leading-none. 헤더 타이틀 + 버튼 카피 적용.
10. **`feedback_avoid_premature_confirmation`** — "거의 일치" 표현 금지. 변환 후 사용자 판단 대기.
11. **`project_redesign_15_daily_report_status`** — 캘리브 좌표 100% 보존 일반화. renderCardCanvas + generatePdf 의 모든 px/mm/scale/색/카피 1 byte 0.
12. **`feedback_cbc7119_design_never_wrangler`** — 디자인 wave 중 cf-cli 명령 절대 X.

---

## §14. 변경 이력

- **v1** (2026-05-26, quick `260526-an5`) — redesign/25-qr-print W5 TSX 변환 verify checklist 최초 생성. 18-worklog (slq) W7 + 23-education (r22) 단일 파일 atomic 패턴 mirror. 12 섹션 + 비즈 anchor 12+ + OQ LOCKED 5 + sketch grep fence + 메모리 slug 12 + negative 17 + verify grep 28.

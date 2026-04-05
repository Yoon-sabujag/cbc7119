# Phase 12: Document Editing & Export - Research

**Researched:** 2026-04-04
**Domain:** React 3-panel desktop layout, `transform: scale()` 미리보기, `@media print` 인쇄 스타일
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** ㄱ 좌우반전 3분할 레이아웃 — 상단에 대카테고리 탭, 좌측에 항목 목록, 우측에 A4 가로 미리보기
- **D-02:** 대카테고리 탭에는 가로형 출력 문서만 포함 (점검일지 종류들)
- **D-03:** 항목 목록 — 해당 카테고리의 세부 항목 (유수검지, 소화전, 자탐, 제연 등)
- **D-04:** 미리보기는 A4 가로 비율 고정 + `transform: scale()`로 영역에 fit — 스크롤 없이 전체 한눈에 보임
- **D-05:** 사이드바, 카드 목록, 미리보기가 모두 한 화면에 보이게 구성
- **D-06:** 좌우 2분할 — 좌측에 페이지 편집/내용, 우측에 A4 세로 미리보기
- **D-07:** 세로형 문서: 일일업무일지, 소방계획서, 보고서 등
- **D-08:** 엑셀 데이터를 HTML 테이블로 렌더링 (읽기 전용, 수정 불가)
- **D-09:** 점검일지는 점검 데이터 기반 자동 생성이므로 미리보기에서 편집 불필요
- **D-10:** 사이드바 "문서 관리" 메뉴에서 선택한 항목에 따라 가로/세로 레이아웃 자동 결정
- **D-11:** "점검 일지 출력" → 가로형 3분할 페이지
- **D-12:** "일일업무일지" → 세로형 2분할 페이지
- **D-13:** "소방계획서" → 세로형 2분할 페이지 (Phase 12 후반, 관리자 상의 후)
- **D-14:** 인쇄(Ctrl+P / 인쇄 버튼) + 파일 저장(엑셀 다운로드) 둘 다 지원
- **D-15:** 인쇄 시 사이드바/헤더/목록 숨기고 미리보기 영역만 원본 크기로 출력
- **D-16:** HTML 미리보기 인쇄 품질이 엑셀과 차이 클 경우, 인쇄 기능은 나중에 비활성화 가능하도록 설계 — 엑셀 다운로드 후 인쇄로 유도
- **D-17:** 인쇄 스타일시트(`@media print`)로 사이드바/헤더/목록 `display: none` 처리
- **D-18:** LAYOUT-02 — 넓은 테이블/카드 레이아웃으로 데이터 확인 (데스크톱 전용)
- **D-19:** LAYOUT-03 — 멀티 패널 구조 (문서목록+미리보기)

### Claude's Discretion

- HTML 테이블 미리보기의 셀 병합/테두리/배경색 세부 스타일
- 대카테고리 탭의 구체적 항목 분류 (기존 ReportsPage REPORT_CARDS 기반)
- 항목 목록의 연도/월 필터 UI
- 인쇄 시 페이지 여백/방향 자동 설정 (`@page` 속성)

### Deferred Ideas (OUT OF SCOPE)

- DOC-02: 소방계획서 작성/편집 — 관리자와 상의 후 Phase 12 후반 또는 별도 phase에서 진행 (2026-04-07 예정)
- DOC-03: 소방훈련용 자료(PPT) 작성 — 관리자와 상의 후 진행

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LAYOUT-02 | 사용자가 PC에서 넓은 테이블/카드 레이아웃으로 데이터를 확인할 수 있다 | ReportsPage의 REPORT_CARDS 데이터 재사용 + 3분할 데스크톱 레이아웃 전환으로 구현. 기존 카드 → 넓은 항목 목록 형태로 변환. |
| LAYOUT-03 | 사용자가 도면과 점검 목록을 나란히 볼 수 있다 (멀티 패널) | 좌측 항목 목록 + 우측 A4 미리보기 2~3분할 패널. `flex` 레이아웃으로 구현. |
| DOC-01 | 사용자가 자동 생성된 점검일지를 데스크톱에서 조회하고 엑셀/PDF로 즉시 출력할 수 있다 | 기존 `generateExcel.ts` 함수 그대로 재사용. HTML 테이블 미리보기 신규 구현. 엑셀 다운로드 버튼 유지. |
| DOC-04 | 사용자가 인쇄 시 인쇄용 스타일시트가 적용된 상태로 출력할 수 있다 | `@media print` CSS + `@page` 규칙으로 구현. 현재 프로젝트에 `@media print` 전혀 없음 — 완전 신규 추가. |

</phase_requirements>

---

## Summary

Phase 12는 기존 `ReportsPage`(모바일 카드 목록 + 엑셀 다운로드)를 데스크톱 전용 3분할 페이지로 확장한다. 좌측 항목 목록에서 점검일지 종류를 선택하면 우측에 A4 가로 비율 HTML 테이블 미리보기가 렌더링된다. `transform: scale()`로 미리보기를 영역에 맞게 축소하여 스크롤 없이 전체를 확인할 수 있다. 인쇄는 `@media print`로 사이드바/헤더/목록을 숨기고 미리보기 영역만 원본 A4 크기로 출력한다.

기존 `generateExcel.ts`의 엑셀 생성 로직은 변경 없이 그대로 유지된다. HTML 미리보기는 읽기 전용으로, 같은 데이터를 API에서 가져와 테이블로 렌더링하는 별도 컴포넌트(`ExcelPreview`)를 신규 작성한다. `DailyReportPage`는 세로형 2분할 레이아웃으로 감싸는 방식으로 데스크톱 뷰를 추가한다.

**Primary recommendation:** `ReportsPage`는 `isDesktop` 조건 분기로 모바일 카드 뷰 / 데스크톱 3분할 뷰를 나눠 렌더링하고, 미리보기 컴포넌트는 별도 파일로 분리한다.

---

## Standard Stack

### Core

이 Phase는 신규 라이브러리 설치가 필요 없다. 모두 기존 의존성으로 구현 가능하다.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI 렌더링 | 이미 사용 중 |
| @tanstack/react-query | 5.59.0 | 점검 데이터 패칭 | 이미 사용 중 |
| xlsx-js-style | 1.2.0 | 엑셀 생성 (변경 없음) | 이미 사용 중 |
| jspdf | 4.2.1 | PDF 생성 (필요 시) | 이미 사용 중 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| useIsDesktop | (내부 훅) | 데스크톱/모바일 분기 | ReportsPage, DailyReportPage에서 레이아웃 전환 시 |
| CSS `@media print` | 네이티브 | 인쇄 스타일 | DOC-04 구현에서 index.css에 추가 |
| CSS `@page` | 네이티브 | 인쇄 용지 방향/여백 | A4 가로 출력 시 `@page { size: A4 landscape }` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HTML 테이블 미리보기 | jsPDF iframe | HTML 테이블이 구현 단순, 실시간 렌더링 빠름. jsPDF iframe은 복잡도 높음 |
| `transform: scale()` | CSS zoom | `transform: scale()`이 브라우저 호환성 높고 레이아웃에 영향 없음 |
| index.css에 @media print 추가 | 인라인 style 태그 | CSS 파일이 관리 용이, 전역 적용 명확 |

**Installation:** 신규 패키지 없음.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── pages/
│   ├── ReportsPage.tsx          # 기존 — isDesktop 분기 추가
│   └── DailyReportPage.tsx      # 기존 — isDesktop 분기 추가
├── components/
│   ├── ExcelPreview.tsx          # 신규 — HTML 테이블 A4 미리보기
│   └── DesktopDocLayout.tsx      # 신규 (선택) — 3분할/2분할 공통 껍데기
└── index.css                     # @media print 규칙 추가
```

### Pattern 1: `isDesktop` 분기 레이아웃 전환

**What:** 같은 페이지 컴포넌트 안에서 `useIsDesktop()`으로 모바일/데스크톱 렌더링을 분기한다.

**When to use:** `ReportsPage`, `DailyReportPage` — 모바일은 기존 유지, 데스크톱만 확장.

**Example:**
```tsx
// ReportsPage.tsx
export default function ReportsPage() {
  const isDesktop = useIsDesktop()
  if (isDesktop) return <DesktopReportsPage />
  return <MobileReportsPage />  // 기존 코드 그대로
}
```

### Pattern 2: 3분할 레이아웃 (가로형 점검일지)

**What:** 상단 탭 + 좌측 항목 목록 + 우측 A4 미리보기. 모두 한 화면에.

**When to use:** "점검 일지 출력" 페이지 (D-11).

**Example:**
```tsx
// DesktopReportsPage 내부
<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
  {/* 상단 대카테고리 탭 */}
  <div style={{ display: 'flex', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
    {CATEGORIES.map(cat => (
      <button key={cat} onClick={() => setCategory(cat)}
        style={{ padding: '10px 20px', borderBottom: activeCategory === cat ? '2px solid var(--acl)' : 'none' }}>
        {cat}
      </button>
    ))}
  </div>

  {/* 2분할: 목록 + 미리보기 */}
  <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
    {/* 좌측: 항목 목록 (고정 너비) */}
    <div style={{ width: 280, borderRight: '1px solid var(--bd)', overflowY: 'auto' }}>
      {items.map(item => <ItemCard key={item.type} ... />)}
    </div>
    {/* 우측: A4 미리보기 */}
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ExcelPreview type={selectedType} year={year} />
    </div>
  </div>
</div>
```

### Pattern 3: `transform: scale()` A4 미리보기

**What:** A4 가로 실제 픽셀(1123×794px at 96dpi)을 컨테이너 크기에 맞게 축소.

**When to use:** ExcelPreview 컴포넌트 내부.

**Example:**
```tsx
function ExcelPreview({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      // A4 가로: 1123 x 794 (96dpi 기준)
      const A4_W = 1123, A4_H = 794
      const scaleX = width / A4_W
      const scaleY = height / A4_H
      setScale(Math.min(scaleX, scaleY) * 0.95)  // 5% 여백
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 1123, height: 794,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        background: 'white',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}>
        {/* HTML 테이블 내용 */}
      </div>
    </div>
  )
}
```

### Pattern 4: `@media print` 인쇄 스타일 (DOC-04)

**What:** `index.css`에 전역 `@media print` 추가. 사이드바/헤더/목록 숨김, 미리보기 영역만 A4로 출력.

**When to use:** 모든 페이지 인쇄 시 자동 적용.

**Example (index.css에 추가):**
```css
@media print {
  /* 인쇄 시 숨길 영역 */
  .no-print,
  [data-no-print] {
    display: none !important;
  }

  /* 미리보기 영역만 전체 크기로 */
  .print-only {
    display: block !important;
  }

  /* A4 가로 설정 */
  @page {
    size: A4 landscape;
    margin: 0;
  }

  /* 미리보기 transform 해제 — 원본 크기로 출력 */
  .excel-preview-inner {
    transform: none !important;
    width: 100% !important;
    height: 100% !important;
    box-shadow: none !important;
  }

  body {
    background: white !important;
  }
}
```

**className 전략:**
- `data-no-print` attribute: DesktopSidebar, GlobalHeader, 항목 목록 패널, 탭 행에 적용
- `.excel-preview-inner`: ExcelPreview 내부 div에 적용 — 인쇄 시 scale 해제

### Anti-Patterns to Avoid

- **미리보기 컨테이너에 `overflow: scroll` 사용:** `transform: scale()` 시 스크롤바 생김. 반드시 `overflow: hidden` + 컨테이너가 fit 크기여야 함.
- **`transform: scale()`에 `zoom` CSS 혼용:** zoom은 레이아웃에 영향을 줘 미리보기 위치가 어긋남.
- **인라인 `style` 태그로 print 스타일 관리:** React 리렌더링 시 중복 삽입 위험. `index.css`에 한 번만 선언.
- **`window.print()` 호출 전 `transform` 미해제:** 브라우저 인쇄 다이얼로그에서 scale이 그대로 적용됨. `.excel-preview-inner`의 print 스타일로 transform 해제 필수.
- **A4 픽셀 크기 하드코딩 시 dpi 미고려:** 화면 96dpi 기준 A4 가로 = 1123×794px. 인쇄 시에는 CSS `@page { size: A4 landscape }` 로 브라우저가 자동 계산. 인라인 픽셀값과 충돌하지 않도록 주의.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 엑셀 생성 | 새 엑셀 생성 로직 | 기존 `generateExcel.ts` 그대로 | 이미 템플릿 기반 완성형 구현 존재 |
| 미리보기 scale 계산 | 복잡한 viewport 계산 | `ResizeObserver` + 단순 `min(scaleX, scaleY)` | 컨테이너 크기 변화에 자동 반응 |
| 인쇄 대화상자 제어 | 커스텀 인쇄 UI | `window.print()` | 브라우저 네이티브 인쇄 다이얼로그가 용지/여백 처리 |
| 반응형 분기 | 별도 페이지 라우트 | `useIsDesktop()` 훅 (기존) | Phase 11에서 이미 구현된 패턴 |

**Key insight:** 이 Phase의 핵심 난점은 엑셀 생성이 아니라 (이미 완성) HTML 미리보기 품질과 인쇄 시 transform 해제다. 엑셀 로직은 건드리지 않는다.

---

## Common Pitfalls

### Pitfall 1: `transform: scale()` + `overflow: hidden` 상호작용

**What goes wrong:** 미리보기 컨테이너에 `overflow: hidden`이 없으면 축소된 미리보기 밖으로 클릭 영역이 삐져나옴. `overflow: auto`이면 스크롤바가 나타남.

**Why it happens:** `transform: scale()`은 DOM 레이아웃 크기(실제 픽셀 1123px)를 유지한 채 시각적으로만 축소하기 때문에 컨테이너 밖 공간을 차지한다고 브라우저가 인식할 수 있음.

**How to avoid:** 외부 컨테이너(`containerRef`가 붙는 div)는 `overflow: hidden`으로, 내부 미리보기 div는 `transformOrigin: 'center center'`로 설정.

**Warning signs:** 페이지에 가로 스크롤바가 생기거나 미리보기가 컨테이너 밖으로 삐져나옴.

### Pitfall 2: `@media print`에서 `transform` 미해제

**What goes wrong:** 인쇄 시 미리보기가 화면 크기로 축소된 채 출력됨 (예: 0.7 scale이면 A4의 70% 크기로 인쇄).

**Why it happens:** `@media print`가 화면 스타일을 모두 상속하므로 `transform: scale(0.7)`이 그대로 유지됨.

**How to avoid:**
```css
@media print {
  .excel-preview-inner {
    transform: none !important;
    width: 210mm !important;   /* A4 가로 */
    height: 297mm !important;  /* A4 세로 → landscape면 자동 전환 */
  }
}
```

**Warning signs:** 인쇄 미리보기에서 A4 용지의 일부만 채워지거나 내용이 작게 출력됨.

### Pitfall 3: 항목 목록 패널 인쇄 시 미포함

**What goes wrong:** `display: none !important`로 숨긴 요소가 인쇄 미리보기에서도 숨김 처리되어 레이아웃이 무너짐.

**Why it happens:** 숨긴 요소가 차지하던 flex 공간이 사라지면서 미리보기 패널 너비/높이가 바뀜.

**How to avoid:** `display: none` 대신 `visibility: hidden` 또는 `position: fixed; left: -9999px` 사용을 검토. 또는 미리보기 영역을 `position: fixed; inset: 0`으로 변환하는 print 스타일 사용.

**Warning signs:** 인쇄 미리보기에서 미리보기 패널이 화면 전체를 채우지 못하거나 한쪽으로 치우침.

### Pitfall 4: ReportsPage 모바일 레이아웃 파괴

**What goes wrong:** 데스크톱 레이아웃 추가 시 기존 모바일 CSS가 덮어씌워져 모바일에서 레이아웃 깨짐.

**Why it happens:** 공통 클래스명이나 부모 요소 스타일이 모바일/데스크톱 동시에 적용됨.

**How to avoid:** `if (isDesktop) return <DesktopReportsPage />` 패턴으로 완전 분리. 두 컴포넌트는 DOM 구조가 달라도 된다. 절대 모바일 코드를 조건부로 감싸지 말고 early return으로 분리.

**Warning signs:** 모바일에서 불필요한 패딩/여백이 생기거나 헤더가 숨겨짐.

### Pitfall 5: `@page` + Chromium 인쇄 여백 기본값

**What goes wrong:** `@page { margin: 0 }`으로 설정해도 Chromium/Edge가 URL 헤더/날짜 푸터를 기본으로 추가함. 이는 브라우저 인쇄 설정이므로 CSS로 제거 불가.

**Why it happens:** 브라우저 인쇄 헤더/푸터는 `@page`가 아닌 브라우저 UI 설정에서 관리됨.

**How to avoid:** 인쇄 버튼 클릭 시 토스트 메시지로 안내: "인쇄 설정에서 '헤더 및 푸터' 체크 해제를 권장합니다". 또는 엑셀 다운로드 후 인쇄 유도(D-16).

---

## Code Examples

### ExcelPreview 컴포넌트 기본 뼈대

```tsx
// src/components/ExcelPreview.tsx
import { useRef, useEffect, useState, useCallback } from 'react'
import { api } from '../utils/api'

interface ExcelPreviewProps {
  reportType: string   // 'div-early' | '소화전' | ...
  year: number
}

export function ExcelPreview({ reportType, year }: ExcelPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const A4_W = 1123  // A4 가로 96dpi
  const A4_H = 794

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setScale(Math.min(width / A4_W, height / A4_H) * 0.95)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg3)' }}
    >
      <div
        className="excel-preview-inner"
        style={{
          width: A4_W, height: A4_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          background: 'white',
          color: '#000',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* 각 reportType에 맞는 HTML 테이블 렌더링 */}
        <PreviewTable type={reportType} year={year} />
      </div>
    </div>
  )
}
```

### `@media print` CSS (index.css에 추가)

```css
/* ── 인쇄 스타일 (DOC-04) ──────────────────────────────── */
@media print {
  /* 인쇄 시 숨길 요소 */
  [data-no-print] {
    display: none !important;
  }

  /* 인쇄 용지: A4 가로 */
  @page {
    size: A4 landscape;
    margin: 10mm;
  }

  /* 미리보기: transform 해제, 전체 크기 */
  .excel-preview-inner {
    transform: none !important;
    width: 100% !important;
    height: 100% !important;
    box-shadow: none !important;
    page-break-inside: avoid;
  }

  /* 배경색 강제 출력 (크롬 기본값 비활성화 우회) */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    background: white !important;
  }
}
```

### `data-no-print` 적용 위치

```tsx
// App.tsx의 DesktopSidebar
<DesktopSidebar data-no-print ... />

// DesktopReportsPage의 좌측 항목 목록 패널
<div data-no-print style={{ width: 280, ... }}>
  {/* 항목 목록 */}
</div>

// 상단 탭 행
<div data-no-print style={{ display: 'flex', borderBottom: ... }}>
  {/* 탭 버튼들 */}
</div>

// 데스크톱 헤더 48px
<header data-no-print style={{ height: 48, ... }}>
  {/* 헤더 내용 */}
</header>
```

**주의:** `data-*` attribute를 TypeScript JSX에서 쓸 때 타입 오류 없음 (HTML 표준 data attributes).

### `window.print()` 호출 패턴

```tsx
const handlePrint = useCallback(() => {
  window.print()
}, [])

// 버튼
<button
  data-no-print
  onClick={handlePrint}
  style={{ /* ... */ }}
>
  인쇄 (Ctrl+P)
</button>
```

---

## Architecture Patterns: 기존 코드 재사용 맵

| 기존 코드 | Phase 12에서 재사용 방법 |
|-----------|--------------------------|
| `ReportsPage.tsx` REPORT_CARDS 상수 | 대카테고리 탭 + 항목 목록 데이터 소스 |
| `ReportsPage.tsx` `handleDownload` 함수 | 엑셀 다운로드 버튼 그대로 유지 |
| `generateExcel.ts` 모든 함수 | 변경 없이 import만 유지 |
| `useIsDesktop()` 훅 | ReportsPage, DailyReportPage에서 레이아웃 분기 |
| `DesktopSidebar.tsx` "문서 관리" 섹션 | 기존 paths(['/reports', '/daily-report', ...]) 유지 |
| `/api/reports/check-monthly` | ExcelPreview HTML 테이블 데이터 패칭 |
| `/api/reports/div` | DIV 미리보기 데이터 패칭 |
| `var(--bg)`, `var(--bd)` CSS 변수 | 모든 신규 컴포넌트 스타일 |

### REPORT_CARDS 대카테고리 그룹핑 (Claude's Discretion)

기존 10종 카드를 탭으로 그룹핑:

```tsx
// 추천 그룹핑 (Claude discretion 영역)
const DESKTOP_CATEGORIES = [
  {
    label: '유수검지 장치',
    types: ['div-early', 'div-late'],
  },
  {
    label: '소화 설비',
    types: ['소화전', '청정소화약제', '비상콘센트', '소방펌프'],
  },
  {
    label: '피난·방화 설비',
    types: ['피난방화', '방화셔터', '제연'],
  },
  {
    label: '자탐 설비',
    types: ['자탐'],
  },
]
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 모바일 카드 목록 + 엑셀 다운로드 | 데스크톱 3분할 + HTML 미리보기 + 엑셀 다운로드 | Phase 12 (신규) | 데스크톱에서 출력 전 내용 확인 가능 |
| `@media print` 미존재 | `@media print` + `@page` 전역 스타일 | Phase 12 (신규) | 모든 페이지 인쇄 시 사이드바 자동 숨김 |

**현재 프로젝트 상태:**
- `@media print` 스타일 없음 — `index.css` 검색 결과 0건 확인 (신규 추가 필요)
- `transform: scale()` 패턴 미사용 — ExcelPreview에서 처음 도입
- `ReportsPage`는 현재 100% 모바일 전용 UI

---

## Open Questions

1. **HTML 미리보기 품질 vs 엑셀**
   - What we know: 점검일지 엑셀 템플릿은 복잡한 셀 병합 구조 (`generateExcel.ts`의 템플릿 기반 방식)
   - What's unclear: HTML 테이블로 동일한 시각적 구조를 재현할 수 있는지. 특히 DIV 34개 시트 구조.
   - Recommendation: 미리보기는 "데이터 확인용 간략 표" 수준으로 시작. 정확한 엑셀 레이아웃 재현은 목표 아님. D-16에서 명시적으로 허용: "인쇄 품질 차이 클 경우 엑셀 다운로드 후 인쇄로 유도".

2. **DailyReportPage 세로형 2분할 (D-12)**
   - What we know: DailyReportPage는 현재 textarea 편집 + 엑셀 다운로드. 미리보기 없음.
   - What's unclear: 일일업무일지 미리보기가 A4 세로 HTML로 의미 있는지 (엑셀 템플릿 의존적인 레이아웃).
   - Recommendation: DailyReportPage 데스크톱 뷰는 좌측 편집 패널(기존 UI) + 우측 미리보기(간단한 텍스트 레이아웃)로 구현. 엑셀과 동일한 복잡 레이아웃 재현은 불필요.

3. **ExcelPreview 데이터 패칭 전략**
   - What we know: 각 report type마다 다른 API endpoint (`/api/reports/div`, `/api/reports/check-monthly?category=...`).
   - What's unclear: 미리보기 선택 시 즉시 패칭할지, 이미 다운로드한 데이터를 재사용할지.
   - Recommendation: 항목 선택 시 React Query로 즉시 패칭. `staleTime: 5 * 60 * 1000`으로 캐싱. 로딩 상태는 미리보기 영역에 스피너 표시.

---

## Environment Availability

Step 2.6: SKIPPED — 이 Phase는 신규 외부 서비스/CLI 의존성 없음. 기존 Cloudflare D1 API와 npm 패키지만 사용.

---

## Validation Architecture

> `workflow.nyquist_validation`이 config.json에 없음 → 활성화 처리.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | 없음 — 현재 프로젝트에 테스트 프레임워크 미설정 |
| Config file | 없음 |
| Quick run command | 해당 없음 |
| Full suite command | 해당 없음 |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAYOUT-02 | PC에서 넓은 카드/테이블 레이아웃 표시 | visual / manual | — | — |
| LAYOUT-03 | 문서목록 + 미리보기 멀티 패널 표시 | visual / manual | — | — |
| DOC-01 | 점검일지 HTML 미리보기 렌더링 | visual / manual | — | — |
| DOC-01 | 엑셀 다운로드 동작 | manual | — | — |
| DOC-04 | 인쇄 시 사이드바/헤더 숨김 | manual (인쇄 미리보기) | — | — |

**이 Phase는 자동화 테스트 대상 아님.** 모든 요구사항이 시각적 레이아웃 + 브라우저 인쇄 동작이므로 수동 검증이 유일한 방법.

### Wave 0 Gaps

None — 테스트 인프라 없음이 프로젝트 현황. 별도 Wave 0 작업 불필요.

---

## Sources

### Primary (HIGH confidence)

- 프로젝트 소스 직접 분석 (`src/pages/ReportsPage.tsx`, `src/utils/generateExcel.ts`, `src/App.tsx`, `src/index.css`)
- 프로젝트 CONTEXT.md, 11-CONTEXT.md 직접 열람
- CSS `transform: scale()` — MDN 표준 (브라우저 동작 예측 가능)
- CSS `@media print`, `@page` — MDN 표준

### Secondary (MEDIUM confidence)

- A4 픽셀 크기 (1123×794 @ 96dpi) — CSS 기준 계산값, 화면 렌더링에서 활용되는 수치
- `ResizeObserver` API — MDN 표준, Chrome/Edge/Firefox 지원 (iOS 13.4+, Android WebView 79+)
- `-webkit-print-color-adjust: exact` — Chromium/Webkit에서 배경색 인쇄 강제 (비표준이나 사실상 표준)

### Tertiary (LOW confidence)

- 없음

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 신규 라이브러리 없음, 기존 의존성만 사용
- Architecture: HIGH — 기존 코드 구조(`useIsDesktop`, 인라인 스타일, CSS 변수)와 완전 일치하는 패턴
- Pitfalls: HIGH — `transform: scale()` + `@media print` 상호작용은 알려진 패턴, 프로젝트 내 직접 확인한 현황(`@media print` 미존재)

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (안정적 기술 스택, 30일 유효)

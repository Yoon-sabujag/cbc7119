# 점검 모달 Chrome 통일 규칙 (Inspection Modal Chrome Rules)

**제정일:** 2026-05-17
**적용 범위:** 02 InspectionPage 안의 11개 점검 모달 (Stairwell/Cctv/Baeyeon/Div/Compressor/PowerPanel/ParkingGate/Damper/Inspection/FireAlarm + InspectionModal 일반) 및 **6 FloorPlanPage**, **그 외 zone/floor/category 선택 패턴이 있는 모든 페이지**.
**관련 작업:** redesign/02-inspection-unification 브랜치 Wave 1~6 (commits 14f4fef → a4bed4d)

이 문서는 사용자 검토 후 합의된 통일 규칙. 향후 페이지별 재디자인 시 sketch 부터 이 규칙 따름. 02 sketch 들과의 충돌 시 **이 문서가 우선**.

---

## 1. 3-Layer 배경 계층 (시각 구조 핵심)

| 영역 | 토큰 (다크) | 토큰 (라이트) | 의미 |
|---|---|---|---|
| 헤더 | `bg-surface-page` (#0a0d12) | `#ffffff` | 페이지 chrome 최상단 |
| zone/category/floor/line wrapper | `bg-surface-raised` (#1a1f27) | `#f6f8fa` | 선택 영역 (헤더와 본문 사이) |
| 본문 (점검 폼) | `bg-surface-page` | `#ffffff` | 메인 콘텐츠 |
| 비선택 탭/칩 | `bg-surface-page` | `#ffffff` | wrapper 안에서 페이지와 같은 톤으로 박스 윤곽만 표시 |
| 입력칸 (input/textarea) | `bg-surface-raised` | `#f6f8fa` | 본문 안에서 raised 카드 톤 |

**검증:** 헤더(검은) → wrapper(회색) → 본문(검은) 의 3-layer 가 시각적으로 분명히 보여야 함.

---

## 2. 헤더 규칙

### 2.1 컨테이너

```tsx
<div className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0">
  ...
</div>
```

- **금지:** `bg-surface-raised` (회색), `py-3`, `gap-2`, 단일 컬러 토큰 누락
- **데스크톱 분기:** `${isDesktop ? 'h-[54px] px-5 gap-2.5' : 'px-4 py-2.5 gap-2.5'}` 형태 허용

### 2.2 아이콘

- 별도 모달 (Stairwell/Cctv/Baeyeon/Div/Compressor/PowerPanel/ParkingGate/Damper/FireAlarm): `size={18}`
- InspectionModal 일반 (CATEGORY_ICONS): `size={22}`
- **카드 그리드 아이콘과 동일해야 함** (메인 점검 페이지 카드와 모달 헤더 아이콘 1:1 일치). 별도 모달의 헤더 아이콘은 해당 카테고리의 `CATEGORY_ICONS[idx]` 와 같은 컴포넌트 사용.
- 클래스: `text-text-secondary flex-shrink-0`

### 2.3 타이틀 (한 줄 inline 룰)

```tsx
<div className="flex-1 min-w-0">
  <div className="text-body font-bold text-text-primary truncate">
    {group.labels[0]}
    {group.labels.length > 1 && (
      <span className="text-caption text-text-tertiary font-normal ml-1.5">· {group.labels.slice(1).join(' · ')}</span>
    )}
  </div>
</div>
```

- 메인 타이틀: `text-body font-bold text-text-primary truncate` (16px)
- 서브: `text-caption text-text-tertiary font-normal ml-1.5` (12px, **inline span** — 별도 두 번째 div 사용 금지)
- **금지:** `text-[16px]`, `text-body-sm`, `text-title` (모두 `text-body` 로 통일)

### 2.4 우측 액션 버튼

```tsx
<button className="h-input px-3 rounded-sm bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold cursor-pointer hover:bg-surface-active transition-colors">
  설비 현황
</button>
```

- 높이: `h-input` (또는 `h-8` 도 허용, 일관 유지)
- editMode 토글 active 색: `bg-accent border border-accent text-text-on-accent` (1px border)

---

## 3. Zone / 항목 / 계단실 / 카테고리 선택 영역 규칙

### 3.1 Sticky Wrapper

```tsx
<div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
  <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">{label}</div>
  <div className="flex gap-1.5">  {/* gap-2 도 허용 */}
    {/* 버튼들 */}
  </div>
</div>
```

- **라벨 필수**: `text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider` + 텍스트 ("구역 선택" / "항목 선택" / "계단실 선택" / "점검 구분" / "라인 선택" / "층 선택" / "위치 선택" / "문 선택" 등)
- **라벨 텍스트가 영역의 의미를 정확히 표현** (예: "구역 선택" 은 zone, "항목 선택" 은 category 선택)

### 3.2 버튼 (균등 분배 — flex-1)

```tsx
<button className={`flex-1 basis-0 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${stateCls}`}>
  {Icon && <Icon size={14} />}{label}
</button>
```

- 균등 분배: `flex-1 basis-0 min-w-0`
- inline-flex + 아이콘 gap: `inline-flex items-center justify-center gap-1.5`
- 사이즈: `px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap`
- **금지:** `rounded-[9px]`, `py-[9px]`, `py-2.5 rounded-md`, `text-caption` (zone 탭에서)

### 3.3 Zone 아이콘 (연구동/사무동/지하 패턴)

`ZONE_ICONS` 매핑 사용:
```tsx
const ZONE_ICONS: Record<string, IconComp> = {
  research:    FlaskConical,
  office:      Building2,
  underground: TrainFront,
}
```

해당 zone 종류면 `<ZIcon size={14} />` 추가. zone 종류가 다르면 (계단실 1~5 / 회전문 북·남 / 댐퍼·송수관 등) **별도 아이콘 매핑 결정 필요** (해당 페이지의 의미에 맞춰).

---

## 4. Floor / Line 가로 스크롤 칩 영역 규칙

### 4.1 Sticky Wrapper + 스크롤

```tsx
<div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
  <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">{label}</div>
  <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    {/* 칩들 */}
  </div>
</div>
```

### 4.2 칩 버튼 (가로 스크롤 — flex-shrink-0)

```tsx
<button className={`flex-shrink-0 px-3.5 py-1.5 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${stateCls}`}>
  {f}{done && <span className="text-caption ml-0.5 opacity-75">({n})</span>}
</button>
```

- 가로 스크롤: `flex-shrink-0`
- 사이즈: `px-3.5 py-1.5 rounded-sm text-label font-bold whitespace-nowrap`
- 노안 친화: `text-label` (13px) — `text-caption` (12px) 금지
- 완료 표기: `({n})` 카운트 또는 `✓` (페이지별 의미 따름)

---

## 5. 상태 색 규칙 (선택/비선택/완료)

```tsx
const stateCls = isSelected
  ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
  : isDone
    ? 'border-[1.5px] border-safe bg-safe-bg text-safe'
    : 'border border-border-strong bg-surface-page text-text-secondary'
```

| 상태 | className | 설명 |
|---|---|---|
| 선택 | `border-[1.5px] border-accent bg-accent text-text-on-accent` | 1.5px accent border + accent 채움 |
| 완료 | `border-[1.5px] border-safe bg-safe-bg text-safe` | 1.5px safe border + safe-bg 채움 |
| 비선택 | `border border-border-strong bg-surface-page text-text-secondary` | 1px strong border + page 채움 (wrapper 안에서 박스 윤곽 식별) |

- **금지:** `border-safe-bar` (`border-safe` 로 통일)
- **금지:** `hover:bg-surface-active` (다른 모달 zone/floor 칩에는 없음)

---

## 6. 본문 영역 + 입력칸 규칙

### 6.1 본문 컨테이너

```tsx
<div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 relative">
  {/* 점검 폼 */}
</div>
```

배경 명시 안 함 — 부모 (모달 wrapper) 의 `bg-surface-page` 가 그대로 비침.

### 6.2 input / textarea

```tsx
const inputCls = 'w-full box-border px-3 py-2.5 rounded-sm border border-border-default bg-surface-raised text-text-primary text-label outline-none ...'
```

- 배경: `bg-surface-raised` (raised) — `bg-surface-page` 금지
- 노안 친화 13px (`text-label`)
- focus: `focus:border-border-focus`

---

## 7. 06 FloorPlanPage 적용 가이드

### 7.1 현재 상태 (롤백된 main 기준)

```tsx
// FloorPlanPage.tsx
return (
  <div style={{ background: 'var(--bg)' }}>  // page ✓

    {/* 헤더 — bg2 (raised) 사용 → ❌ */}
    <header style={{ background: 'var(--bg2)' }}>  // raised ✗
      {/* 뒤로가기 + 타이틀 + 마커편집 + 축소보기 */}
    </header>

    {/* 도면 종류 탭 — bg2 (raised) ✓ */}
    <div style={{ background: 'var(--bg2)' }}>  // raised ✓

    {/* 층 선택 — bg2 (raised) ✓ */}
    <div style={{ background: 'var(--bg2)' }}>  // raised ✓
```

→ **헤더만 page 로 fix**. 도면 종류 탭 / 층 칩 wrapper 는 raised 유지 ✓. 단 전체적으로 인라인 style + 옛 var() 토큰이라 Tailwind v0.1.1 으로 전면 재변환 필요.

### 7.2 매핑 가이드

| 06 영역 | 02 mirror 대상 | className 적용 |
|---|---|---|
| 헤더 wrapper | §2.1 + 데스크톱 분기 | `${isDesktop ? 'h-[54px] px-5 gap-2.5' : 'px-4 py-2.5 gap-2.5'} bg-surface-page` |
| 뒤로가기 버튼 | (02 모달엔 없음 — 06 unique chrome) | `w-8 h-8 rounded-sm bg-surface-sunken border border-border-default text-text-secondary inline-flex items-center justify-center` + `<ChevronLeft size={15} />` |
| 헤더 타이틀 | §2.3 | `text-body font-bold text-text-primary truncate` |
| 마커편집 / 축소보기 버튼 | §2.4 | `h-input px-3 rounded-sm bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold cursor-pointer hover:bg-surface-active transition-colors` (active: `bg-accent border-accent text-text-on-accent`) |
| 도면 종류 탭 wrapper | §3.1 | `bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0` + **라벨 "도면 종류"** 추가 |
| 도면 종류 탭 버튼 (유도등/감지기/스프링클러/소화기·소화전) | §3.2 | `flex-1 basis-0 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors` |
| 도면 종류 아이콘 | (각 도면 타입 의미 매핑) | 유도등 `ExitSignIcon` / 감지기 `(Smoke/Heat 둘 다 가능, default?)` / 스프링클러 `(custom)` / 소화기 `FireExtinguisherCustom` — `size={14}` |
| 층 칩 wrapper | §4.1 | `bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0` + **라벨 "층 선택"** 추가 |
| 층 칩 버튼 | §4.2 | `flex-shrink-0 px-3.5 py-1.5 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors` |
| 모든 상태 색 | §5 | 선택 1.5px accent / 완료 1.5px safe / 비선택 1px strong + page |

### 7.3 06 unique chrome 처리

- **뒤로가기 버튼**: 02 모달에는 없음. 06 페이지 chrome 의 unique 요소. `w-8 h-8 rounded-sm bg-surface-sunken border border-border-default` 패턴으로 유지.
- **데스크톱 헤더 (`isDesktop && h-[54px]`)**: 02 는 모달이라 데스크톱 분기 없음. 06 페이지 데스크톱 분기 유지.
- **준비중 배지** (`{!p.ready && ...}`): 도면 타입 탭에만 있는 dead code. 보존.

### 7.4 라벨 텍스트 (새로 추가 필요)

기존 06 코드에 라벨이 없음. 새 룰에 따라 추가:
- 도면 종류 탭 위에 "도면 종류"
- 층 칩 위에 "층 선택"

### 7.5 sketch 새로 작성 시

1. `cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-chrome-sketch.html` 작성
2. 위 §7.2 매핑대로 mock-up + 02 chrome 과 1:1 동일성 시각 확인
3. 사용자 검토 → TSX 변환

---

## 8. 검증 체크리스트 (06 적용 후)

- [ ] 헤더 bg 가 `surface-page` (페이지와 동일 검은) — Devtools 검사
- [ ] 도면 종류 탭 / 층 칩 wrapper bg 가 `surface-raised` (회색)
- [ ] 비선택 탭/칩 = `surface-page` + `border-strong` (3-layer 안에서 박스 윤곽만 보임)
- [ ] 선택 탭/칩 = `border-[1.5px] border-accent bg-accent text-text-on-accent`
- [ ] 헤더 타이틀 = `text-body font-bold` (16px). 서브 라벨은 inline span.
- [ ] 도면 종류 탭 / 층 칩 wrapper 에 라벨 ("도면 종류", "층 선택") 존재
- [ ] 도면 종류 탭 버튼 = `flex-1 basis-0 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap`
- [ ] 층 칩 버튼 = `flex-shrink-0 px-3.5 py-1.5 rounded-sm text-label font-bold whitespace-nowrap`
- [ ] 모든 인라인 `style={{}}` 제거 (Tailwind utility 만)
- [ ] 옛 var() 토큰 (`--bg`/`--bg2`/`--bg3`/`--bd`/`--bd2`/`--t1`/`--t2`/`--t3`/`--acl`) 0건
- [ ] `npm run build` PASS
- [ ] 02 카테고리 모달 (예: 청정소화약제) 옆에 06 도면 페이지 시각 비교 → 헤더/탭/칩 통일성 확인

---

## 9. 향후 작업 시점

- **즉시:** 06 FloorPlanPage 재변환 (redesign/06-floorplan-v2 브랜치)
- **차후 페이지별 재디자인 시:** 이 문서를 reference. sketch 부터 이 규칙 따름. 사용자 동의 없이 새 패턴 도입 금지.

---

## 참고: 직접 적용된 02 inspection 통일 Wave 1~6 변경 요약

- W1 (4c91067): InspectionModal 헤더 `raised → page` + BaeyeonModal 아이콘 `Square → SmokeVentIcon`
- W2 (d8a3db7): DivModal/CompressorModal zone/line 영역 sticky raised wrapper 로 분리
- W3 (d18e18a): 헤더 padding/gap/font 표기 통일 + `rounded-[9px] → rounded-sm` + `border-safe-bar → border-safe`
- W4 (c882233): FireAlarmModal 헤더 + input 통일 + DIV/Compressor 라벨 표기 통일
- W5 (a26f419): zone 탭 아이콘 복원 + 헤더 타이틀 한 줄 inline + CCTV `B1F 방재센터 DVR N대` 동적 카운트
- W6 (a4bed4d): InspectionModal floor 칩 sizing BaeyeonModal 패턴 mirror

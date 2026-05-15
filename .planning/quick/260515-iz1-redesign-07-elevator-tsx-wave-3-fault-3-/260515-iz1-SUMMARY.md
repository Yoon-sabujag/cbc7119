---
quick_id: 260515-iz1
slug: redesign-07-elevator-tsx-wave-3-fault-3-
status: complete
date: 2026-05-15
commit: 8752e81
tasks_completed: 4
tasks_total: 4
files_modified:
  - cha-bio-safety/src/pages/ElevatorPage.tsx
tags:
  - redesign
  - elevator
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
  - faultnewmodal
  - faultnewfullscreen
  - faultresolvemodal
  - wave3
---

# Quick 260515-iz1: ElevatorPage TSX Wave 3 — Fault 모달 3종

## One-liner

FaultNewModal / FaultNewFullscreen / FaultResolveModal 3종을 v0.1.1 토큰 + Tailwind only 변환 — 이모지(🚨/✕) lucide X/AlertTriangle 교체, TYPE_ICON_COMPONENT 매퍼 적용, 9-11px 폰트 12px+ 격상, 비즈니스 로직 100% 보존.

## Wave 3 변환 영역

- **변환 전 라인**: 2022~2253 (FaultNewModal + FaultNewFullscreen + FaultResolveModal)
- **변환 후 라인**: 2022~2298 (마크업 expansion으로 ~45줄 증가)
- **총 변경**: 3 함수 본체 + lucide-react import 블록 X 추가
- **최종 라인 수**: 3345줄 (이전 Wave 2: 3277줄, +68줄 — 3종 변환)

## 추가된 lucide import

```typescript
// 변경 전 (Wave 2)
import { Package, UtensilsCrossed, MoveDiagonal, ChevronRight, ChevronUp, ChevronDown, AlertTriangle, Wrench } from 'lucide-react'

// 변경 후 (Wave 3)
import { Package, UtensilsCrossed, MoveDiagonal, ChevronRight, ChevronUp, ChevronDown, AlertTriangle, Wrench, X } from 'lucide-react'
```

추가: `X` (FaultNewFullscreen 닫기 버튼)

재사용(Wave 1+2): `AlertTriangle` (승객 탑승 ON 토글 + Fullscreen 헤더 아이콘), `MoveDiagonal` / `Package` / `UtensilsCrossed` / `ElevatorIcon` (TYPE_ICON_COMPONENT 매퍼)

## v0.1.1 토큰 매핑

| 영역 | 옛 스타일 | 새 Tailwind utility |
|------|----------|---------------------|
| FaultNewModal 래퍼 | `display:'flex', flexDirection:'column', gap:14` | `className="flex flex-col gap-[14px]"` |
| 발생 일시 input | `style={inputSt}` | `className="w-full h-[42px] px-3 bg-surface-sunken border border-border-default rounded-lg text-text-primary text-body-sm ..."` |
| 발생 층 select | `style={inputSt}` | 직접 Tailwind utility |
| 승객 탑승 라벨 | `fontSize:11, color:'var(--t2)'` | `text-label text-text-secondary` (11→13px) |
| 승객 탑승 ON 토글 | `rgba(239,68,68,.15)` + `var(--danger)` + 이모지 🚨 | `bg-danger-bg text-danger outline outline-2 outline-danger` + `<AlertTriangle size={14} />` |
| 승객 탑승 OFF 토글 | `var(--bg3)` + `var(--t3)` | `bg-surface-sunken text-text-tertiary` |
| 증상 textarea | `style={{ ...inputSt, resize:'none' }}` | 직접 Tailwind utility + `resize-none` |
| FaultNew CTA | `style={{ ...primaryBtnSt, background:'linear-gradient(...)` | `style={{ background:'linear-gradient(135deg,#991b1b,#ef4444)' }}` (화이트리스트 보존) + 나머지 Tailwind |
| FaultNewFullscreen 컨테이너 | `background:'var(--bg)', display:'flex', flexDirection:'column'` | `bg-surface-page flex flex-col` (position/zIndex/paddingTop 인라인 보존) |
| Fullscreen 헤더 | `background:'var(--bg2)', borderBottom:'1px solid var(--bd)'` 등 | `bg-surface-raised border-b border-border-default flex items-center gap-2.5 px-4 pt-[14px] pb-3` |
| Fullscreen 아이콘 박스 | `background:'rgba(239,68,68,.15)', fontSize:20` + 🚨 이모지 | `w-9 h-9 rounded-lg bg-danger-bg flex items-center justify-center` + `<AlertTriangle size={20} className="text-danger" />` |
| Fullscreen 타이틀 | `fontSize:15, color:'var(--t1)'` | `text-body font-bold text-text-primary` (15→16px) |
| Fullscreen 부제 | `fontSize:10, color:'var(--t3)'` | `text-caption text-text-tertiary` (10→12px 노안 친화) |
| Fullscreen 닫기 버튼 | `fontSize:18` + ✕ 문자 | `<X size={20} />` lucide 아이콘 |
| Fullscreen 본문 | `flex:1, minHeight:0, overflowY:'auto', padding:'16px'` 등 | `flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4` |
| Fullscreen 하단 CTA 영역 | `padding:'12px 16px', background:'var(--bg2)', borderTop:'1px solid var(--bd)'` | `flex-shrink-0 p-3 px-4 bg-surface-raised border-t border-border-default` |
| Fullscreen CTA 텍스트 | `'🚨 고장 접수 (TKE 자동 연결)'` 이모지 포함 | `'고장 접수 (TKE 자동 연결)'` 이모지 제거 (헤더 아이콘 박스가 위험 알림 역할) |
| FaultResolveModal 래퍼 | `display:'flex', flexDirection:'column', gap:12` | `className="flex flex-col gap-3"` |
| 고장 정보 카드 | `background:'var(--bg3)', borderRadius:10, padding:'10px 13px', fontSize:11` + `TYPE_ICON[fault.elevator_type]` 이모지 | `bg-surface-sunken rounded-xl p-3` + `TYPE_ICON_COMPONENT[fault.elevator_type]` 컴포넌트 매퍼 |
| 호기 라벨 | `fontSize:11` | `text-body-sm font-bold text-text-primary` (11→14px 노안 친화) |
| pureSymptoms | `color:'var(--t1)'` | `text-label text-text-secondary` (11→13px) |
| FaultResolve CTA | `style={{ ...primaryBtnSt, opacity:... }}` (primaryBtnSt=accent 단색) | `style={{ opacity:... }}` + `className="... bg-accent text-text-on-accent"` |

## 이모지 → 아이콘 대체 결정 (2B sketch 권위)

| 이모지 | 위치 | 대체 |
|--------|------|------|
| 🚨 | FaultNewFullscreen 헤더 아이콘 박스 | `<AlertTriangle size={20} className="text-danger" />` in `w-9 h-9 bg-danger-bg` |
| 🚨 | FaultNewFullscreen CTA 텍스트 | 제거 (헤더 아이콘 박스가 위험 표현) |
| ✕ | FaultNewFullscreen 닫기 버튼 | `<X size={20} />` lucide |
| 탑승 🚨 | 승객 탑승 ON 토글 텍스트 | `<AlertTriangle size={14} />탑승` |
| `TYPE_ICON[fault.elevator_type]` 이모지 | FaultResolveModal 고장 정보 카드 | `TYPE_ICON_COMPONENT[fault.elevator_type]` 컴포넌트 매퍼 |

## 인라인 style 화이트리스트 예외 (전체 6건)

| 위치 | 인라인 키 | 사유 |
|------|-----------|------|
| Field `style={{ flex:1 }}` (2곳) | flex | Field 컴포넌트 `style?:CSSProperties` prop 시그니처 보존 — 컴포넌트 본체 수정 금지이므로 호출 패턴 보존 |
| FaultNew CTA `background:'linear-gradient(135deg,#991b1b,#ef4444)'` (2곳) | background | §6.4 그라디언트 화이트리스트 (fire 위험 의미) |
| FaultNew CTA + FaultResolve CTA `opacity:(...)` | opacity | 동적 disabled 값 |
| FaultNewFullscreen 컨테이너 `top:0, left:0, right:0, bottom:NAV_H, zIndex:100, paddingTop:'var(--sat, 44px)', boxSizing:'border-box'` | position/bottom/zIndex/paddingTop | 동적값(NAV_H) + iOS safe-area + z-index 100 화이트리스트 |

## self_check_before_summary grep 결과

### 1. 인라인 금지 키 검출 (3 모달 함수 본문, 라인 2022~2298)

```
sed -n '2022,2299p' ElevatorPage.tsx | grep -E "(color|backgroundColor|padding|margin|fontSize|fontWeight|borderRadius|display|flex|grid|gap|width|height)\s*:\s*['\"]"
```

결과: **0건 PASS** (화이트리스트 외 정적 인라인 키 없음)

### 2. 9-11px 폰트 검출 (3 모달 본문)

```
sed -n '2022,2299p' ElevatorPage.tsx | grep -E "fontSize:\s*(9|10|11)\b|text-\[(9|10|11)px\]"
```

결과: **0건 PASS**

### 3. 이모지 검출 (3 모달 본문)

```
sed -n '2022,2299p' ElevatorPage.tsx | grep -P "🚨|✕|🛗|📦|🔲|↕️|⚠️"
```

결과: **0건 PASS**

### 4. 옛 토큰 검출 (3 모달 본문)

```
sed -n '2022,2299p' ElevatorPage.tsx | grep -E "var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|safe|warn|danger|info|acl)\)"
```

결과: **0건 PASS**

### 5. 보존 영역 sentinel

| 항목 | 결과 |
|------|------|
| `function ModalWrap(` 정의 | **PASS** (라인 2572, 변경 없음) |
| `function Field(` 정의 | **PASS** (라인 2591, 변경 없음) |
| `function EvSelector(` 정의 | **PASS** (라인 1941, Wave 2 변환 결과 그대로) |
| `modal === 'fault_new'` (2곳) | **PASS** (라인 1038, 1654) |
| `modal === 'fault_resolve'` (2곳) | **PASS** (라인 1043, 1669) |
| `modal === 'inspect_new'` (1곳) | **PASS** (라인 1670) |
| `modal === 'repair_new'` (2곳) | **PASS** (라인 1044, 1671) |
| `modal === 'ev_detail'` (2곳) | **PASS** (라인 1045, 1672) |

### 6. TKE 자동 다이얼 보존

```
grep -E "href=\{TKE_TEL\}" ElevatorPage.tsx
```

결과: **2건 PASS** (FaultNewModal + FaultNewFullscreen 각 1건)

### 7. TYPE_ICON_COMPONENT 매퍼 사용 확인 (FaultResolveModal)

```
grep -E "TYPE_ICON_COMPONENT\[fault\.elevator_type\]" ElevatorPage.tsx
```

결과: **1건 PASS** (라인 2257 `const TypeIcon = TYPE_ICON_COMPONENT[fault.elevator_type]`)

### 8. npm run build 결과

```
✓ built in 13.54s
ElevatorPage-nNW3YsCg.js  99.03 kB │ gzip: 23.98 kB
```

**TypeScript 0 에러, 빌드 PASS.** 새 ElevatorPage chunk 해시: `nNW3YsCg` (Wave 2 `BZgp9YDW` → Wave 3 `nNW3YsCg`)

## 커밋 이력

| Task | 커밋 | 설명 |
|------|------|------|
| Task 1 (lucide X 추가) | `8752e81` | lucide-react import X 추가 |
| Task 2 (FaultNewModal) | `8752e81` | FaultNewModal v0.1.1 토큰 + Tailwind 변환 |
| Task 3 (FaultNewFullscreen) | `8752e81` | FaultNewFullscreen v0.1.1 토큰 + Tailwind 변환 |
| Task 4 (FaultResolveModal + build) | `8752e81` | FaultResolveModal v0.1.1 토큰 + Tailwind 변환 + npm build PASS |

(4 tasks, 1 commit — 3 모달이 하나의 원자적 변환 단위)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `bg-surface-base` → `bg-surface-page` 토큰 수정**

- **Found during:** Task 3 (FaultNewFullscreen 변환 후 build 전 검토)
- **Issue:** 계획 문서(PLAN.md)의 `bg-surface-base`는 tailwind.config.js에 없는 토큰. 실제 설정은 `surface-page`
- **Fix:** `bg-surface-base` → `bg-surface-page` (tailwind.config.js 라인 40 확인)
- **Files modified:** `cha-bio-safety/src/pages/ElevatorPage.tsx`
- **Commit:** `8752e81` (수정 포함)

## Known Stubs

None.

## Threat Flags

None — 변환 영역은 UI 렌더링 전용 모달 컴포넌트. 네트워크 엔드포인트/인증 경로/파일 접근/D1 스키마 변경 없음.

## Self-Check: PASSED

- [x] `cha-bio-safety/src/pages/ElevatorPage.tsx` 수정됨 (3345줄)
- [x] 커밋 `8752e81` 존재
- [x] 인라인 금지 키 0건
- [x] 9-11px 폰트 0건
- [x] 이모지 0건
- [x] 옛 토큰 0건
- [x] ModalWrap/Field/EvSelector 보존
- [x] 5 modal call sites 보존
- [x] TKE 자동 다이얼 보존 (2곳)
- [x] TYPE_ICON_COMPONENT[fault.elevator_type] 사용
- [x] npm build PASS (TypeScript 0 에러, 새 chunk 해시 nNW3YsCg)

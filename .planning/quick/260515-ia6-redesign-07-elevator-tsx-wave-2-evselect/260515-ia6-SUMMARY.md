---
quick_id: 260515-ia6
slug: redesign-07-elevator-tsx-wave-2-evselect
status: complete
date: 2026-05-15
commit: 36bd57f
tasks_completed: 3
tasks_total: 3
files_modified:
  - cha-bio-safety/src/pages/ElevatorPage.tsx
tags:
  - redesign
  - elevator
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
  - evselector
  - esbtn
  - esnodemap
  - wave2
---

# Quick 260515-ia6: ElevatorPage TSX Wave 2 — EvSelector + EsBtn + EsNodeMap

## One-liner

EsBtn/EsNodeMap/EvSelector 3 헬퍼 컴포넌트를 v0.1.1 토큰 + Tailwind only로 변환 — 이모지 5종 lucide 교체, 방향 색 차별 폐기(accent 단일), 9-11px 폰트 12px+ 격상.

## Wave 2 변환 영역

- **변환 전 라인**: 1893~1995 (EsBtn ~line 1893 / EsNodeMap ~line 1911 / EvSelector ~line 1937)
- **변환 후 라인**: 1894~2021 (마크업 expansion으로 ~26줄 증가)
- **총 변경**: 3 함수 본체 + lucide-react import 블록 ChevronUp/ChevronDown 추가

## 추가된 lucide import

```typescript
// 변경 전
import { Package, UtensilsCrossed, MoveDiagonal, ChevronRight, AlertTriangle, Wrench } from 'lucide-react'

// 변경 후
import { Package, UtensilsCrossed, MoveDiagonal, ChevronRight, ChevronUp, ChevronDown, AlertTriangle, Wrench } from 'lucide-react'
```

추가: `ChevronUp`, `ChevronDown` (EsBtn 방향 아이콘)

재사용(Wave 1): `MoveDiagonal` (에스컬레이터 종류 토글), `AlertTriangle` (호기 fault 아이콘)

커스텀 재사용(Wave 1): `ElevatorIcon` from `../components/ui/icons` (엘리베이터 종류 토글)

## v0.1.1 토큰 매핑

| 영역 | 옛 토큰 | 새 Tailwind utility |
|------|---------|---------------------|
| EsBtn 비선택 배경 | `var(--bg2)` | `bg-surface-sunken` |
| EsBtn 선택 배경 | `rgba(239,68,68,.2)` / `rgba(34,197,94,.2)` | `bg-accent` |
| EsBtn 선택 outline | `2px solid var(--danger/safe)` | `outline outline-2 outline-accent` |
| EsBtn 텍스트(선택) | `var(--danger)` / `var(--safe)` | `text-text-on-accent` |
| EsBtn 텍스트(비선택) | `var(--t1)` | `text-text-primary` |
| EsBtn dir 라벨 색 | `var(--danger)` / `var(--safe)` | 부모 상속 (selected/비선택 분기) |
| EsNodeMap 컨테이너 | `var(--bg3)` | `bg-surface-sunken` |
| EsNodeMap 중앙 라인 | `var(--bd2)` | `bg-border-default` |
| EsNodeMap 층 레이블 | `var(--t2)` | `text-text-secondary` |
| EvSelector 종류 라벨 | `var(--t2)` | `text-text-secondary` |
| EvSelector 종류 활성 | `var(--acl)` + `#fff` | `bg-accent text-text-on-accent` |
| EvSelector 종류 비활성 | `var(--bg3)` + `var(--t2)` | `bg-surface-sunken text-text-secondary` |
| EvSelector 그룹 라벨 | `var(--t3)` | `text-text-tertiary` |
| EvSelector 호기 선택 | `var(--acl)` + `#fff` + `2px solid var(--acl)` | `bg-accent text-text-on-accent outline outline-2 outline-accent` |
| EvSelector 호기 fault | `rgba(239,68,68,.15)` + `var(--danger)` | `bg-fire-bg text-fire` |
| EvSelector 호기 기본 | `var(--bg3)` + `var(--t1)` | `bg-surface-sunken text-text-primary` |

## 2A 결정 반영 (4zh-SUMMARY fix_commits 권위)

| 결정 | 내용 |
|------|------|
| EsBtn 방향 색 차별 폐기 | `.es-btn-down`(danger) / `.es-btn-up`(safe) → `.es-btn-selected`(accent 단일) |
| EsBtn 방향 표시 | 이모지 ▼/▲ 제거 → ChevronDown/ChevronUp 아이콘으로만 구분 |
| 호기 fault 아이콘 | 이모지 ⚠️ 제거 → `<AlertTriangle size={14} />` lucide 아이콘 |
| 종류 토글 아이콘 | 이모지 🛗/↕️ 제거 → ElevatorIcon/MoveDiagonal 컴포넌트 + 텍스트 |
| 폰트 격상 | 10px→12px(text-caption), 11px→12px(text-caption) 노안 친화 |

## grep gate 결과 (변환 영역 라인 1894~2022 한정)

| 항목 | 결과 |
|------|------|
| 1. 인라인 style 금지 키 (`color/background/padding/margin/fontSize/fontWeight/borderRadius` 정적값) | **0건 PASS** |
| 2. 9-11px 폰트 (`fontSize: 9/10/11` 또는 `text-[9/10/11px]`) | **0건 PASS** |
| 3. 이모지 (🛗/↕️/▼/▲/⚠️) | **0건 PASS** |
| 4. 옛 토큰 (`var(--(bg/bg2/bg3/bd/bd2/t1/t2/t3/safe/warn/danger/info/acl))`) | **0건 PASS** |
| 5. EvSelector 사용처 (`<EvSelector`) | **4건 PASS** (FaultNewModal/FaultNewFullscreen/InspectModal/RepairNewModal) |
| 6. ElevatorIcon import | **PASS** (`import { ElevatorIcon } from '../components/ui/icons'` 라인 17) |
| 7. ChevronUp/ChevronDown 추가 | **PASS** (import 라인 16 + EsBtn 라인 1908) |

### 인라인 style 화이트리스트 예외 (1건)

```tsx
// EvSelector 호기 그리드 — gridTemplateColumns 동적값, Tailwind arbitrary 한계로 보존
<div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${groupEvs.length}, 1fr)` }}>
```

## 보존 영역 sentinel 결과

| 항목 | 결과 |
|------|------|
| 6 모달 함수 정의 (FaultNewModal/FaultNewFullscreen/FaultResolveModal/InspectModal/RepairNewModal/EvDetailModal) | **6건 PASS** |
| 데이터 상수 (EV_GROUPS_FAULT/ANNUAL/ES_NODES_FAULT/ANNUAL) | **8건 PASS** |
| icons.tsx 변경 | **0건 (미수정)** |
| 다른 파일 변경 (tailwind.config.js/tokens.css/다른 페이지) | **0건 PASS** |
| props 시그니처 보존 | **PASS** (EsBtn/EsNodeMap/EvSelector 모두) |
| 비즈니스 로직 보존 | **PASS** (evList 필터/분기/groups.map/콜백 모두) |

## npm run build 결과

```
✓ built in 14.29s
ElevatorPage-BZgp9YDW.js  97.06 kB │ gzip: 23.59 kB
```

**빌드 통과 (PASS)**. TypeScript 0 에러.

## 커밋 이력

| Task | 커밋 | 설명 |
|------|------|------|
| Task 1 | `0763897` | EsBtn v0.1.1 토큰 + lucide ChevronUp/ChevronDown 변환 |
| Task 2 | `36bd57f` | EsNodeMap + EvSelector v0.1.1 토큰 + Tailwind 변환 |
| Task 3 | (검증 전용 — 코드 변경 없음) | grep gate + build PASS 확인 |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None - 변환 영역은 UI 렌더링 전용 헬퍼 컴포넌트. 네트워크 엔드포인트/인증 경로/파일 접근 변경 없음.

## 다음 Wave 권장

**Wave 3 = FaultNewModal 변환** (2B sketch 기반)
- 스코프: FaultNewModal + FaultNewFullscreen 본체 (~line 2022~2170)
- 의존: 본 Wave 2 EvSelector 토큰화 완료 → 모달 내 EvSelector 사용부분이 자동으로 신규 디자인 반영됨
- 스케치: `faultnew-sketch.html` (2B sketch, 4zh 계열)

## Self-Check: PASSED

- EsBtn 함수 존재 확인: PASS (line 1894)
- EsNodeMap 함수 존재 확인: PASS (line 1915)
- EvSelector 함수 존재 확인: PASS (line 1941)
- 커밋 0763897 존재: PASS
- 커밋 36bd57f 존재: PASS
- npm run build: PASS (built in 14.29s)

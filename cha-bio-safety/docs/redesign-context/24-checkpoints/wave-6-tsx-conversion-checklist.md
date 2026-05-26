---
title: "24-checkpoints — W6 TSX 변환 verify checklist"
status: draft
created: 2026-05-26
quick_id: 260526-gln
branch: redesign/24-checkpoints
source_tsx: cha-bio-safety/src/pages/CheckpointsPage.tsx
source_tsx_lines: 693
sketches_referenced: [W2, W3, W4, W5]
locked_decisions: "W1: 6 OQ default (a) x6 / W2~W5 sketch: 0 (markdown only) / W6 (본 wave): 0 (markdown only)"
sub_wave_count: 4   # W2 frame-guard / W3 header-filters / W4 list-fab / W5 modal-form
verify_gate_count: ">=22"
mirror_of: cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md
consumed_by: "24-checkpoints TSX 변환 wave executor (단일 atomic)"
---

# W6 — TSX 변환 verify checklist (24-checkpoints)

> 본 파일은 **sketch HTML 이 아님**. TSX 변환 wave executor 가 1-pass 로 적용할 verify gate + region mapping + LOCKED 룰 박제 markdown.
> source-of-truth: `cha-bio-safety/src/pages/CheckpointsPage.tsx` (693 lines, admin 전용) + sketch-wave-2 ~ sketch-wave-5.html 4 개 + design-system.md v0.1.1 + wave-1-index.md.
> 18-worklog W7 (`cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md`) 패턴 mirror — 구조 §1~§12 + 비즈 anchor 박스 + 4 sketch grep verbatim fence.
> 14-reports (700 lines) / 15-daily-report (934) / 18-worklog (1216) / 23-education (591) / 28-splash 의 4i9 단일 atomic 패턴을 24-checkpoints 에서도 자동 도달.

---

## §1 imports 매핑 (line 1~8) + Lucide 추가

현재 imports (TSX 변환 wave 에서 Lucide 추가):

| 영역 | 현재 (line) | 변환 후 처리 |
|---|---|---|
| react hooks | `useState, useEffect` from 'react' (line 1) | 동일 (보존) |
| router | `useNavigate` from 'react-router-dom' (line 2) | 동일 |
| react-query | `useQuery, useMutation, useQueryClient` from '@tanstack/react-query' (line 3) | 동일 |
| toast | `toast` from 'react-hot-toast' (line 4) | 동일 |
| store | `useAuthStore` from '../stores/authStore' (line 5) | 동일 (비즈 anchor) |
| api | `checkPointApi, floorPlanMarkerApi, extinguisherApi` from '../utils/api' (line 6) | 동일 (비즈 anchor) |
| hook | `useIsDesktop` from '../hooks/useIsDesktop' (line 7) | 동일 |
| type | `CheckPointFull, CheckPointUpdatePayload, BuildingZone` from '../types' (line 8) | 동일 |
| **추가 (Lucide)** | (없음) | `import { Plus, ChevronDown } from 'lucide-react'` (OQ #6 default = (a)) |

**인라인 SVG 제거 대상 (line 11~25):**

| 함수 | line | Lucide 교체 |
|---|---|---|
| `IconPlus({ size=18, color='currentColor' })` | 11~18 | `<Plus size={N} color={color} />` 로 대체 후 함수 제거 |
| `IconChevronDown({ size=16, color='currentColor' })` | 19~25 | `<ChevronDown size={N} color={color} />` 로 대체 후 함수 제거 |

**상수 보존 매트릭스 (line 27~109)** — TSX 변환 후 일부는 Tailwind class 로 흡수, 일부 잔존:

| 상수 | line | 변환 후 처리 |
|---|---|---|
| `CATEGORIES_FALLBACK` 19종 | 29~34 | 1 byte 변경 금지 (비즈 anchor §4) |
| `ZONE_LABEL` | 35~37 | 1 byte 변경 금지 |
| BottomSheet 함수 | 40~57 | 인라인 보존 (OQ #1 default = (a)) |
| DesktopModal 함수 | 60~74 | 인라인 보존 (OQ #1 default = (a)) |
| `INPUT_STYLE` / `LABEL_STYLE` | 77~84 | Tailwind 치환 검토 (text-body-sm + text-label) 또는 잔존 |
| `CpFormState` + `EMPTY_CP_FORM` | 87~93 | 보존 (6 필드 verbatim) |
| `ZONE_FLOORS` | 94~98 | 1 byte 변경 금지 (비즈 anchor §4) |
| `ExtState` + `EMPTY_EXT` | 100~109 | 보존 (7 필드 verbatim) |

---

## §2 메인 함수 + 모달 컴포넌트 (line 111~398, 428~692) — hooks/state/handlers 1:1 verbatim

본 섹션은 **비즈 로직 0 byte 변경 강제** — sketch class 적용은 §3 JSX 영역에서만.

**CheckpointsPage 메인 (line 428~692):**

```
hook 4종 (line 429~432):
  useNavigate()
  useAuthStore: { staff: me }
  useIsDesktop()
  useState: selectedCategory='', filterZone='', filterFloor='', modal={open:false,mode:'add',target:undefined}

admin 가드 useEffect (line 438~440):
  useEffect(() => {
    if (me?.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [me, navigate])

useQuery #1 (line 442~446):
  queryKey: ['check-point-categories']
  queryFn: checkPointApi.categories
  staleTime: 60_000

isGuidelamp (line 448):
  isGuidelamp = selectedCategory === '유도등'

useQuery #2 (line 449~454):
  queryKey: ['check-points', selectedCategory]
  enabled: selectedCategory !== '' && !isGuidelamp
  staleTime: 30_000

useQuery #3 (line 456~461):
  queryKey: ['floorplan-markers-all', 'guidelamp']
  queryFn: floorPlanMarkerApi.listAll('guidelamp')
  enabled: isGuidelamp
  staleTime: 30_000

MARKER_TYPE_LABEL 6건 (line 462~464) + FLOOR_CODE 8건 (line 465) — 함수 내부 상수, 변경 0
guidelampAsCp 변환 (line 466~477) — fc/x/y/locNo 계산 + CheckPointFull 형태 변환, 변경 0
isLoading = isGuidelamp ? glLoading : cpLoading (line 478)
cpListRaw = isGuidelamp ? guidelampAsCp : (checkPoints ?? []) (line 479)
cpList filter (line 480~489): eq() 헬퍼로 'basement'='common' legacy 호환
FLOOR_ORDER 20건 (line 492) + availableFloors (line 493~499)
early return (line 501): if (me?.role !== 'admin') return null
ModalWrapper = isDesktop ? DesktopModal : BottomSheet (line 503)
categoryOptions = categories.length > 0 ? categories : CATEGORIES_FALLBACK (line 504)
```

**CheckPointModalContent (line 111~398):**

```
useState: form (CpFormState), confirmDeactivate (line 115~119) + extForm (ExtState, line 121)
isExtCategory = form.category === '소화기' (line 122)
catCheckPoints useQuery (line 124~130): ['check-points', form.category], enabled: mode==='add' && form.category!==''
handleCategoryChange (line 132~135)
자동 채우기 useEffect (line 138~160): filtered → lastNo → numMatch → nextNo / '{floor} {category} {N+1}번' → setForm
setField (line 162~163): generic field setter
createMutation (line 165~200): isExtCategory 분기 (extinguisherApi.create + zoneMap / checkPointApi.create)
isMarker (line 204): !!cp?.id?.startsWith('FPM-')
updateMutation (line 206~227): isMarker (floorPlanMarkerApi.update) vs checkPointApi.update
deactivateMutation (line 229~247): isMarker (floorPlanMarkerApi.delete) vs isActive:0
canSave (line 249~252): location.trim()!=='' && category!=='' && (!isExtCategory||(extForm.type!=='' && form.zone!=='' && form.floor!==''))
isBusy = createMutation.isPending || updateMutation.isPending
handleSave (line 255~262)
```

---

## §3 JSX render 영역별 변환 (4 영역, 4 sub-wave 매핑)

### W2 — 외곽 wrapper + admin 가드 + style 태그 (frame-guard)

- **외곽 wrapper** (line 507): `flex column / bg var(--bg) / height 100% / overflow hidden`
  - Tailwind: `flex flex-col h-full overflow-hidden bg-surface-page`
- **style 태그** (line 508~513): keyframes `blink` + `slideUp` + focus `border-color var(--acl)` 인라인
  - 방침: `<style>` 태그 그대로 유지 또는 `tailwind.config.extend.keyframes` 이관 (blink+slideUp 의존 영역 잔존 시 유지)
- **sketch 클래스 참조**: `page-wrapper`, `guard-overlay`, `guard-badge`, `skeleton-bar`, `keyframe-demo`

### W3 — 헤더 (카테고리 + 필터 select) — 데스크톱/모바일 분기

- **데스크톱 헤더** (line 516~551): `flex / gap 12 / padding 12px 24px / borderBottom var(--bd)`
  - Tailwind: `hidden lg:flex items-center gap-3 px-6 py-3 border-b border-border-default`
  - 카테고리 select 220px (`hdr-select`), filterZone (`filter-select`), filterFloor (`filter-select`), 카운트 라벨 (`count-label`), 개소 추가 버튼 (`add-btn`)
- **모바일 헤더** (line 552~582): `flex column / padding 12px 16px / gap 8`
  - Tailwind: `flex flex-col lg:hidden px-4 py-3 gap-2`
  - 카테고리 select 풀폭 (`mob-cat-select`), 조건부 필터 row (`mob-filter-row`), 카운트 (`mob-count`)
- **개소 추가 버튼** (line 546~550): `bg var(--acl) / color #fff / radius 8 / Plus 16`
  - Tailwind: `flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-primary text-white text-label font-bold`
  - `<Plus size={16} color="#fff" />` (OQ #6 default)
- **ChevronDown** 사이즈: 데스크톱 line 528 size=14 → `<ChevronDown size={16} />` (§7.1 위반 16 격상, OQ #6 default)

### W4 — 콘텐츠 (목록+FAB)

- **콘텐츠 wrapper** (line 585): `flex 1 / overflow auto / minHeight 0`
  - Tailwind: `flex-1 overflow-auto min-h-0`
- **4 상태 분기**:
  - empty 카테고리 미선택 (line 586~590): `state-empty` — `flex items-center justify-center h-full text-text-secondary text-body-sm`
  - skeleton 3개 (line 591~597): `skeleton-bar` / `skeleton-wrap` — SKELETON_STYLE (bg var(--bg3)/radius 12/height 64/blink)
  - error (line 598~602): `state-error` — `flex items-center justify-center h-full text-text-secondary text-body-sm`
  - data: 데스크톱 테이블 / 모바일 카드 리스트
- **데스크톱 테이블** (line 604~656): `data-table` / `desktop-table-wrap`
  - 7 컬럼: 개소명/카테고리/구역/층/위치번호/상태/액션
  - 카테고리 배지 (line 632): fontSize 10 → `text-caption leading-none` (OQ #5)
  - 위치번호 (line 638): JetBrains Mono → `text-caption font-mono`
  - status (line 641): fontSize 11 → `text-caption leading-none` (OQ #5)
- **CheckPointCard** (line 401~419): `cp-card` / `cp-top` / `cp-dot` / `cp-location` / `cp-cat-badge` / `cp-meta` / `cp-action`
  - 8x8 dot → arbitrary `w-[8px] h-[8px]` (w-8=48px 함정 회피 — `feedback_tailwind_w8_h8_is_48px`)
  - 카테고리 배지 fontSize 9 (line 408) → `text-caption leading-none` (OQ #5)
  - 모바일 카드 inactive (line 401): `cp-card inactive` — `opacity-[0.45]`
- **모바일 FAB** (line 674~683): `mobile-fab-wrap` / `mobile-fab-btn`
  - `position: sticky / bottom: 0` 보존
  - `paddingBottom: calc(16px + var(--sab))` 1 byte 변경 금지 (iOS PWA safe-area)
  - `<Plus size={18} color="#fff" />` — size 18 보존 (OQ #6 default)

### W5 — 모달 + 폼 (modal-form)

- **ModalWrapper 호출** (line 685~690): `{modal.open && <ModalWrapper title={...} onClose={...}><CheckPointModalContent .../></ModalWrapper>}`
- **BottomSheet** (line 40~57): `sheet-overlay` / `sheet-panel` / `sheet-handle-row` / `sheet-handle` / `sheet-title`
  - 인라인 보존 (OQ #1 default = (a)) — overlay `rgba(0,0,0,0.6)` / bg `var(--bg2)` / radius `16px 16px 0 0`
  - slideUp 0.28s — `<style>` keyframes 의존, `<style>` 태그 유지 또는 tailwind.config extend
- **DesktopModal** (line 60~74): `modal-overlay` / `modal-panel` / `modal-title`
  - 인라인 보존 — overlay `rgba(0,0,0,0.5)` / width 440 / radius 12 / boxShadow
- **폼 필드** (line 264~395): `form-body` / `form-body-desktop` / `form-label` / `form-input`
  - 카테고리 select (line 267~273): `required-star` 빨간 *
  - 구역 button row (line 275~284): `zone-row` / `zone-btn active` / `zone-btn inactive` — fontSize 11 → `text-caption font-bold` (OQ #3, #5)
  - 층 select (line 285~295): form.zone 채워졌을 때만
  - 소화기 추가 폼 (line 296~347): isExtCategory 시만 표시 (`form-input` 6건)
  - 액션 row (line 366~395): `action-row` / `action-btns` / `btn-cancel` / `btn-save` / `btn-save disabled` / `btn-deactivate` / `btn-deactivate-confirm` / `deactivate-confirm-box`

---

## §4 비즈 anchor 보존 박스 (1 byte 변경 금지) — wave-1-index §1.3 verbatim 인용

`project_redesign_15_daily_report_status` 패턴 일반화 — 아래 anchor 는 TSX 변환 시 절대 변경 금지.

| # | anchor | line | 보존 이유 |
|---|---|---|---|
| 1 | `CATEGORIES_FALLBACK` 19종 (소화기/소화전/스프링클러/청정소화약제/소방펌프/자동화재탐지설비/유도등/방화셔터/비상콘센트/소방용전원공급반/특별피난계단/전실제연댐퍼/배연창/연결송수관/완강기/DIV/CCTV/주차장비/회전문) | 29~34 | DB 동적 categories 폴백, 순서/값 변경 금지 |
| 2 | `ZONE_LABEL` (`office:'사무동', research:'연구동', basement:'지하', common:'지하'`) | 35~37 | legacy 'common' 포함 zone 라벨 |
| 3 | `ZONE_FLOORS` (office/research: 8층, common: 6층 — 'common' 키 사용) | 94~98 | 'basement' UI vs 'common' DB 비즈 매핑 |
| 4 | `FLOOR_ORDER` 20건 (`['8-1F','8F','7F','6F','5F','3F','2F','1F','LOBBY','M','B1','B1F','B2','B2F','B3','B3F','B4','B4F','B5','B5F']`) | 492 | availableFloors 정렬 룰 |
| 5 | `MARKER_TYPE_LABEL` 6건 (`ceiling_exit:'천장피난구', wall_exit:'벽부피난구', room_corridor:'거실통로', hallway_corridor:'복도통로', stair_corridor:'계단통로', seat_corridor:'객석통로'`) | 462~464 | 유도등 marker_type 라벨 |
| 6 | `FLOOR_CODE` 8건 (`'8-1F':'9','8F':'8','7F':'7','6F':'6','5F':'5','3F':'3','2F':'2','1F':'1'`) | 465 | 유도등 locNo 생성 — `${fc}-${x}-${y}` |
| 7 | admin 가드 useEffect (line 438~440) + early return (line 501) | 438~440, 501 | 권한 가드 비즈 로직 1 byte 변경 금지 |
| 8 | queryKey 6건: `['check-point-categories']` / `['check-points', selectedCategory]` / `['check-points', form.category]` / `['floorplan-markers-all', 'guidelamp']` + invalidate 5건 | 126, 443, 450, 457, 190/191/221/222/241/242 | React Query 캐시 무효화 패턴 |
| 9 | `catCheckPoints` useQuery (staleTime 30_000, enabled: mode==='add' && form.category!=='') | 124~130 | 자동 채우기 진입 조건 |
| 10 | 자동 채우기 useEffect (filtered→lastNo→numMatch→nextNo / `'{floor} {category} {N+1}번'`) | 138~160 | 개소명/위치번호 기본값 자동 생성 |
| 11 | `createMutation` (isExtCategory 분기 + zoneMap `{research:'연',office:'사',common:'공'}` + extinguisherApi.create / checkPointApi.create) | 165~200 | 소화기/비-소화기 등록 분기 |
| 12 | `updateMutation` (isMarker `FPM-` 분기 + floorPlanMarkerApi.update vs checkPointApi.update) | 206~227 | 마커/체크포인트 수정 분기 |
| 13 | `deactivateMutation` (isMarker floorPlanMarkerApi.delete vs checkPointApi.update {isActive:0}) | 229~247 | 마커 삭제 vs 체크포인트 비활성화 |
| 14 | `canSave` 3 조건 (location.trim()!=='' && category!=='' && (!isExtCategory||(type!==''&&zone!==''&&floor!==''))) | 249~252 | 저장 가능 조건 verbatim |
| 15 | `'basement'='common'` eq() 헬퍼 (a==='basement'\|\|a==='common') && (b==='basement'\|\|b==='common') | 481~484, 494~497 | 0081 마이그레이션 전후 legacy 호환 |
| 16 | 유도등 분기: isGuidelamp + guidelampAsCp 변환 + isMarker `FPM-` + isLoading/cpListRaw 분기 | 448, 466~479, 204 | 유도등=floor_plan_markers 비즈 분기 |
| 17 | `ModalWrapper = isDesktop ? DesktopModal : BottomSheet` + `categoryOptions = categories.length > 0 ? categories : CATEGORIES_FALLBACK` | 503, 504 | 모달 분기 + 카테고리 폴백 조건 |
| 18 | BottomSheet (line 40~57) — overlay rgba(0,0,0,0.6) / bg var(--bg2) / radius 16/16/0/0 / slideUp 0.28s / maxHeight 90vh / handle bar 32x4 var(--bd2) / title 16/700/var(--t1) padding 12 16 0 / backdrop click close (e.target===e.currentTarget) | 40~57 | 인라인 보존 (OQ #1 default) |
| 19 | DesktopModal (line 60~74) — overlay rgba(0,0,0,0.5) / bg var(--bg2) / radius 12 / width 440 / maxHeight 85vh / boxShadow '0 8px 32px rgba(0,0,0,.18)' / title 16/700/var(--t1) padding 20 24 0 | 60~74 | 인라인 보존 (OQ #1 default) |
| 20 | `SKELETON_STYLE` (bg var(--bg3) / radius 12 / height 64 / blink 2s ease-in-out infinite) | 422~425 | 스켈레톤 시각 패턴 |
| 21 | 모바일 FAB safe-area: `paddingBottom: calc(16px + var(--sab))` | 676 | iOS PWA safe-area-inset-bottom 룰 |
| 22 | 카피 verbatim 8건: '카테고리를 선택하면 개소 목록이 표시됩니다' (line 588) / '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요' (line 600) / '해당 카테고리에 개소가 없습니다' (line 621, 663) / '개소 추가 버튼을 눌러 점검 개소를 등록하세요' (line 664) / '개소 추가'/'개소 수정' (line 687) / '저장'/'취소'/'비활성화' (line 369, 372, 378, 388, 391) / '이 개소를 비활성화합니다. 기존 점검 기록은 보존됩니다.' (line 385) | 여러 | `feedback_sketch_realistic_data` |
| 23 | placeholder verbatim 9건: '예: 한울방재' (line 314) / '예: 2024-04 (YYYY-MM)' (line 320) / '예: 수소10-19-11' (line 326) / '예: BEQV' (line 332) / '예: 72605' (line 338) / '예: 68605' (line 344) / '1층 로비 소화기' (line 350) / '001 (선택)' (line 356) / '메모 (선택)' (line 360) | 여러 | verbatim 보존 |
| 24 | toast 카피 7건: '소화기 등록 완료 ({mgmtNo})' / '개소가 추가되었습니다' / '저장에 실패했습니다. 입력값을 확인해 주세요' (create+update) / '개소 정보가 수정되었습니다' / '마커가 삭제되었습니다' / '개소가 비활성화되었습니다' / '비활성화에 실패했습니다' | 193~226, 243~246 | verbatim 보존 |
| 25 | select option verbatim 10건+: '전체 (카테고리 선택)' / '전체 구역' / '전체 층' / '사무동' / '연구동' / '지하' / '카테고리 선택' / '종류 선택' / '층 선택' / '분말 20kg' / '분말 3.3kg' / '할로겐' / 'K급' | 여러 | verbatim 보존 |

---

## §5 OQ LOCKED 6건 verbatim (wave-1-index.md §7 박제)

- **OQ #1 default: (a) BottomSheet/DesktopModal 인라인 보존** — StaffManagePage(26) 와의 공통화는 별도 task. 이 wave 는 동 파일 인라인 유지. negative gate: `src/components/ui/Modal.tsx` 또는 `Sheet.tsx` 신규 생성 0 byte.

- **OQ #2 default: (a) 단색 var(--acl) 유지** — 저장 / 개소 추가 / 모바일 FAB 3건 모두 단색 `--accent-primary`. design-system.md §6.4 그라데이션 ("lin-grad" 약어) 신규 도입 금지. TSX 본문 `linear-gradient` 0.

- **OQ #3 default: (a) zone toggle button row 유지 + fontSize 11 → 12 격상** — `office/research/basement` 3버튼 row segment 컨트롤/select 로 변경 X. height 36 유지 (44px 격상 별도 OQ 가능, 이 wave 는 default). `text-caption font-bold`.

- **OQ #4 default: (a) 외곽 hex 토큰 전체 치환** — `var(--bg)` → `--surface-page` / `--bg2` → `--surface-raised` / `--bg3` → `--surface-sunken` / `--bg4` → `--surface-active` / `--bd` → `--border-default` / `--bd2` → `--border-strong` / `--t1/--t2/--t3` → `--text-primary/--secondary/--tertiary` / `--acl` → `--accent-primary` / `--safe` → `--status-safe-bar` / `--danger` → `--status-danger`. design-system.md §4.1 마이그레이션 표 그대로.

- **OQ #5 default: (a) 9/10/11 → 12 일률 격상 + leading-none 추가** — 카테고리 배지 (line 408 fontSize 9 / line 632 fontSize 10) → `text-caption leading-none`. 테이블 status (line 641 fontSize 11) → `text-caption leading-none`. 모바일 필터 select (line 567, 574 fontSize 11) → `text-caption`. 모바일 카운트 (line 578 fontSize 11) → `text-caption leading-none`. 모든 9/10/11px `text-caption` + 작은 컨테이너 안 `leading-none` (`feedback_text_caption_leading_none`).

- **OQ #6 default: (a) Lucide 치환 + 기존 size 보존** — `<Plus size={16} />` (line 548 데스크톱) + `<Plus size={18} />` (line 679 모바일 FAB, 18 보존) + `<ChevronDown size={16} />` (line 528 데스크톱 — 14 → 16 격상, §7.1 위반 수정) + `<ChevronDown size={16} />` (line 561 모바일). 인라인 SVG IconPlus / IconChevronDown 함수 제거.

---

## §6 4 sketch HTML grep 추출 verbatim class 인용

아래는 executor 가 W6 작성 시점에 실제 실행한 결과 (추측 금지 — `feedback_planner_prompt_sketch_verbatim`):

```bash
# 실행 명령:
for f in cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-{2,3,4,5}-*.html; do
  echo "=== $f ==="
  grep -oE 'class="[^"]+"' "$f" | sort -u
done
```

```
=== sketch-wave-2-frame-guard.html ===
class="content-placeholder"
class="desktop"
class="focus-input focused"
class="focus-input"
class="focus-select focused"
class="guard-badge"
class="guard-icon"
class="guard-meta"
class="guard-overlay"
class="guard-title"
class="handle-bar"
class="keyframe-demo"
class="kf-label"
class="label"
class="page-wrapper"
class="phone"
class="sheet-title"
class="skeleton-bar"
class="viewport-block"
class="viewport-row"

=== sketch-wave-3-header-filters.html ===
class="add-btn"
class="cat-select-wrap"
class="chevron-icon"
class="count-label"
class="desktop-header"
class="filter-select"
class="frame-block"
class="frame-label"
class="frame-row"
class="hdr-select"
class="mob-cat-select"
class="mob-cat-wrap"
class="mob-count"
class="mob-filter-row"
class="mob-filter-select"
class="mobile-header"
class="section-title"
class="sketch-canvas"

=== sketch-wave-4-list-fab.html ===
class="action-cell"
class="card-list"
class="category-badge"
class="cp-action"
class="cp-card inactive"
class="cp-card"
class="cp-cat-badge"
class="cp-content"
class="cp-dot"
class="cp-location"
class="cp-meta"
class="cp-top"
class="data-table"
class="desktop-content"
class="desktop-table-wrap"
class="floor-cell"
class="frame-block"
class="frame-label"
class="frame-row"
class="location-cell"
class="locationno-cell"
class="mobile-fab-btn"
class="mobile-fab-wrap"
class="phone-frame"
class="section-title"
class="skeleton-bar"
class="skeleton-wrap"
class="sketch-canvas"
class="state-empty"
class="state-error"
class="status-cell"
class="status-dot"
class="zone-cell"

=== sketch-wave-5-modal-form.html ===
class="action-btns"
class="action-row"
class="btn-cancel"
class="btn-deactivate-confirm"
class="btn-deactivate"
class="btn-save disabled"
class="btn-save"
class="deactivate-confirm-box"
class="form-body-desktop"
class="form-body"
class="form-input"
class="form-label"
class="frame-block"
class="frame-label"
class="frame-row"
class="modal-overlay"
class="modal-panel"
class="modal-title"
class="required-star"
class="section-title"
class="sheet-handle-row"
class="sheet-handle"
class="sheet-overlay"
class="sheet-panel"
class="sheet-title"
class="sketch-canvas"
class="zone-btn active"
class="zone-btn inactive"
class="zone-row"
```

---

## §7 폰트 격상 매트릭스 — 9/10/11 → 12

OQ #5 default = (a): 모든 9/10/11px → `text-caption` (12px) + 작은 컨테이너 안 `leading-none`.

| line | 현재 fontSize | 컨텍스트 | 목표 토큰 |
|---|---|---|---|
| 50 | (width 32, height 4) | BottomSheet handle bar (폰트 X) | 시각 변경 0 |
| 52 | 16 fw700 | BottomSheet title | `text-body font-bold` (16 OK, §1.1 마지노선) |
| 69 | 16 fw700 | DesktopModal title | `text-body font-bold` |
| 79 | 14 | INPUT_STYLE | `text-body-sm` (14 OK) |
| 83 | 12 fw700 | LABEL_STYLE | `text-label font-bold` (12 OK) |
| 279 | **11 fw700** | zone toggle button | **`text-caption font-bold`** (11 → 12, OQ #3/#5) |
| 369 | 14 fw700 | 취소 버튼 | `text-body-sm font-bold` |
| 371 | 14 fw700 | 저장 버튼 | `text-body-sm font-bold` |
| 377 | 12 | 비활성화 버튼 | `text-caption` |
| 384 | 12 | 비활성화 안내 박스 | `text-caption` |
| 388 | 14 | confirmDeactivate 취소 | `text-body-sm` |
| 390 | 14 fw700 | confirmDeactivate 비활성화 | `text-body-sm font-bold` |
| 407 | 14 fw700 | CheckPointCard 개소명 | `text-body-sm font-bold` |
| 408 | **9 fw700** | 카테고리 배지 (모바일 카드) | **`text-caption leading-none`** (9 → 12, OQ #5) |
| 412 | 12 | 메타 (zone·floor) | `text-caption leading-none` |
| 416 | 12 fw700 | '수정 ▸' | `text-caption leading-none` |
| 522 | 13 | 데스크톱 카테고리 select | `text-label` (13 → 12 OK) |
| 532, 539 | 12 | 데스크톱 filterZone/filterFloor | `text-caption` |
| 543 | 12 | 데스크톱 카운트 라벨 | `text-caption` |
| 547 | 13 fw700 | 데스크톱 '개소 추가' | `text-label font-bold` |
| 567, 574 | **11** | 모바일 filterZone/filterFloor | **`text-caption`** (11 → 12, OQ #5) |
| 578 | **11** | 모바일 카운트 | **`text-caption leading-none`** (11 → 12, OQ #5) |
| 587 | 14 | 카테고리 미선택 empty | `text-body-sm` |
| 599 | 14 | error | `text-body-sm` |
| 610~615 | 12 fw700 | 데스크톱 테이블 thead | `text-caption font-bold` |
| 621 | 14 | 테이블 empty | `text-body-sm` |
| 632 | **10 fw700** | 데스크톱 테이블 카테고리 배지 | **`text-caption leading-none`** (10 → 12, OQ #5) |
| 638 | 12 | 위치번호 JetBrains Mono | `text-caption font-mono` |
| 641 | **11 fw600** | 데스크톱 테이블 status | **`text-caption leading-none`** (11 → 12, OQ #5) |
| 649 | 12 fw700 | 데스크톱 테이블 액션 '수정' | `text-caption font-bold` |
| 662 | 16 fw700 | 모바일 empty title | `text-body font-bold` |
| 664 | 12 | 모바일 empty 안내 | `text-caption` |
| 678 | 14 fw700 | 모바일 FAB '개소 추가' | `text-body-sm font-bold` |

**위반 요약:** fontSize 9px 1건 (line 408) / fontSize 10px 1건 (line 632) / fontSize 11px 5건 (line 279, 567, 574, 578, 641) — 모두 OQ #5 default (a) 따라 `text-caption` 12 격상.

---

## §8 Lucide 아이콘 매핑

OQ #6 default = (a): 기존 size 보존 + Lucide 치환. `feedback_tailwind_token_class_pattern` — `size={N}` prop.

| 현재 | line | Lucide 치환 | size | 비고 |
|---|---|---|---|---|
| `IconPlus` SVG 함수 (line 11~18) | 11~18 | `<Plus />` from 'lucide-react' | 용처별 다름 | 함수 전체 제거 |
| `IconChevronDown` SVG 함수 (line 19~25) | 19~25 | `<ChevronDown />` from 'lucide-react' | 용처별 다름 | 함수 전체 제거 |
| 데스크톱 헤더 카테고리 select ChevronDown (line 528) | 528 | `<ChevronDown size={16} color="var(--text-secondary)" />` | 14 → **16** | §7.1 위반 수정 (14 → 16) |
| 모바일 헤더 카테고리 select ChevronDown (line 561) | 561 | `<ChevronDown size={16} />` | 16 | 보존 |
| 데스크톱 헤더 '개소 추가' Plus (line 548) | 548 | `<Plus size={16} color="#fff" />` | 16 | 보존 |
| 모바일 FAB Plus (line 679) | 679 | `<Plus size={18} color="#fff" />` | **18 보존** | OQ #6 default (a), 18→20 격상은 별도 OQ |
| 모바일 카드 '수정 ▸' 글리프 (line 416) | 416 | `<ChevronRight size={14} />` 검토 | 텍스트 보존 가능 | OQ 별도 가능, 이 wave default = 텍스트 보존 |

---

## §9 components.css inherit vs 신규 정의

wave-1-index.md §4 박제 — 24-checkpoints 는 components.css **신규 추가 0** (OQ #1 default + 단일 파일 인라인 패턴).

### 재사용 (기존 tokens.css / typography.css 그대로)

| class | 출처 | 24-checkpoints 사용처 |
|---|---|---|
| `.bg-surface-page` / `.bg-surface-raised` / `.bg-surface-sunken` / `.bg-surface-active` | tokens.css | 외곽 / 카드·모달 / input·select / 비활성 버튼 |
| `.text-text-primary` / `.text-text-secondary` / `.text-text-tertiary` | tokens.css | 본문 / 보조 / 메타 |
| `.text-status-safe-bar` / `.text-status-danger` | tokens.css | 활성 dot + '활성' 라벨 / 비활성화 버튼 |
| `.bg-status-info-bg` / `.text-status-info` (또는 `--accent-primary`) | tokens.css | 카테고리 배지 |
| `.bg-status-danger-bg` | tokens.css | 비활성화 안내 박스 |
| `.text-caption` / `.text-label` / `.text-body-sm` / `.text-body` | typography.css | 폰트 격상 매트릭스 (§7) |
| `.rounded-md` (12) / `.rounded-lg` (16) / `.rounded-sm` (8) | tokens.css | 카드 / 모달 / input·button |
| `.btn` / `.btn-primary` / `.btn-secondary` | 14-reports components.css | 저장 / 취소 / 비활성화 액션 row (검토) |

### 신규 정의 (이 wave 에서 새로 추가)

**없음** — BottomSheet / DesktopModal / CheckPointCard / SKELETON 모두 동 파일 인라인 유지 (OQ #1 default). StaffManagePage(26) 공통화는 별도 task.

---

## §10 Tailwind cheatsheet — 24-checkpoints 사용 토큰

**색 토큰 (status- prefix 없음 — `feedback_tailwind_token_class_pattern`):**
`bg-safe-bar` `bg-fire-bar` `bg-danger-bar` `bg-warn-bar` `bg-surface-page` `bg-surface-raised` `bg-surface-sunken` `bg-surface-active` `text-text-primary` `text-text-secondary` `text-text-tertiary` `border-border-default` `border-border-strong`

**status- prefix 0 룰 (`feedback_tailwind_token_class_pattern`):**
- OK: `bg-fire-bar` / `text-safe-bar` / `bg-danger-bar`
- NG: `bg-status-fire-bar` / `text-status-safe-bar` / `bg-status-danger-bar`

**크기 함정 (`feedback_tailwind_w8_h8_is_48px`):**
- `w-8 h-8` = **48px** (tailwind.config spacing override, 기본 32 아님)
- `w-7 h-7` = **32px**
- 8x8 dot (line 404) 변환 시: arbitrary `w-[8px] h-[8px]` 또는 `w-2 h-2` (8px)
- handle bar 32x4 (line 50) 변환 시: arbitrary `w-[32px] h-[4px]` (w-8=48px 함정 회피)
- SKELETON height 64 → `h-16` (64px, 4배수 OK)

**폰트 small container (`feedback_text_caption_leading_none`):**
- `text-caption` = 12px lh:1.5 (18px 실높이) — 작은 컨테이너 (h-8/h-9) 안에서 시각적 패딩 발생
- 해결: `text-caption leading-none` 명시 — 카테고리 배지 / 테이블 status / '수정 ▸' / 카운트 라벨 모두 적용

**그라데이션 0 (OQ #2 default):**
- `bg-accent-primary` / `bg-status-info-bar` 단색만 — `linear-gradient` ("lin-grad" 약어) 신규 도입 금지

**tokens.css 불일치 시 fallback (`project_redesign_16_workshift_status`):**
- arbitrary `text-[#hex]` / `bg-[#hex]` — 단, 24-checkpoints 는 raw hex 추가 가능성 낮음

---

## §11 negative gate (TSX 변환 wave 진입 시 강제)

- (1) src/** 변경은 `CheckpointsPage.tsx` 만 — 다른 페이지 / hook / util 0 byte
- (2) `components.css` 변경 0 (재사용만, 신규 추가 0 — OQ #1 default + §9)
- (3) `App.tsx` 0 byte — Suspense 매핑 / `MOBILE_NO_NAV_PATHS` 변경 0
- (4) sketch HTML 추가 0 (W2~W5 의 4 sketch 는 이미 작성됨)
- (5) wave-6 외 markdown 추가 0
- (6) admin 가드 (line 438~440 + 501) 1 byte 변경 0
- (7) `CATEGORIES_FALLBACK` 19종 / `ZONE_LABEL` / `ZONE_FLOORS` / `FLOOR_ORDER` 20건 / `MARKER_TYPE_LABEL` 6건 / `FLOOR_CODE` 8건 — 1 byte 변경 0
- (8) queryKey 6건 1 byte 변경 0
- (9) useMutation 3건 (create / update / deactivate) — onSuccess / onError / mutationFn 분기 모두 0 byte
- (10) catCheckPoints 자동 채우기 useEffect (line 138~160) — 0 byte
- (11) 유도등 분기 (isGuidelamp + guidelampAsCp 변환 + isMarker `FPM-` 분기) — 0 byte
- (12) 소화기 분기 (isExtCategory + extinguisherApi + zoneMap) — 0 byte
- (13) `'basement'='common'` eq() 헬퍼 (line 481~484, 494~497) — 0 byte
- (14) BottomSheet / DesktopModal 함수 공통 추출 0 (StaffManagePage 와 별도 task — OQ #1)
- (15) 이모지 0 (메타 코멘트 포함 — "warning glyph" / "lin-grad" 약어 패턴)
- (16) fontSize 9/10/11 인라인 0 (모두 §7 폰트 매트릭스 따라 `text-caption` 12 격상)
- (17) `linear-gradient` 0 (OQ #2: 저장 / 개소 추가 / FAB 단색 보존)
- (18) `status-` prefix 0 (`bg-status-fire-bar` 형태 NG — `feedback_tailwind_token_class_pattern`)
- (19) w-8 h-8 사고 0 (8x8 dot → `w-[8px] h-[8px]` / handle bar → `w-[32px] h-[4px]` — `feedback_tailwind_w8_h8_is_48px`)
- (20) wrangler 0 (이 워크트리 룰 — `feedback_cbc7119_design_never_wrangler`)
- (21) `npm run deploy` 0 (직원 도메인 가는 경로)
- (22) 카피 verbatim 8건 / placeholder 9건 / toast 7건 / select option ≥10건 임의 변경 0 (`feedback_sketch_realistic_data`)
- (23) 모바일 FAB safe-area `calc(16px + var(--sab))` (line 676) — 0 byte (iOS PWA safe-area-inset-bottom)
- (24) BottomSheet slideUp animation keyframe (`<style>` line 508~513) — 0 byte (또는 tailwind.config extend 이관)
- (25) `src/components/ui/Modal.tsx` 또는 `Sheet.tsx` 신규 생성 0 (OQ #1 default — 인라인 보존)

---

## §12 verify gate (자동 명령 + 기대값)

아래 명령은 TSX 변환 wave commit 직전 모두 PASS 필수. 경로 prefix: `cha-bio-safety/docs/redesign-context/24-checkpoints/`.

| # | gate | 명령 | 기대값 |
|---|---|---|---|
| 1 | 12 섹션 헤더 존재 | `grep -cE '^## §([1-9] \|1[0-2] )' wave-6-tsx-conversion-checklist.md` | = 12 |
| 2 | 비즈 anchor 표 ≥20 row | `grep -cE '^[0-9]+\. \|^\| [0-9]+' wave-6-tsx-conversion-checklist.md` | >= 20 |
| 3 | OQ LOCKED 6건 | `grep -cE '^- \*\*OQ #[1-6]' wave-6-tsx-conversion-checklist.md` | = 6 |
| 4 | 4 sketch HTML class fence (open+close) | `grep -c '^` + "`" + `\`\`' wave-6-tsx-conversion-checklist.md` | >= 8 |
| 5 | status- prefix 0 룰 박제 | `grep -c 'status- prefix 0' wave-6-tsx-conversion-checklist.md` | >= 1 |
| 6 | w-8 h-8 = 48px 함정 박제 | `grep -c 'w-8 h-8' wave-6-tsx-conversion-checklist.md` | >= 1 |
| 7 | negative gate ≥17 | `grep -cE '^- \([0-9]+\)' wave-6-tsx-conversion-checklist.md` | >= 17 |
| 8 | 메모리 룰 unique slug ≥10 | `grep -oE '(feedback\|project\|reference)_[a-z_]+' wave-6-tsx-conversion-checklist.md \| sort -u \| wc -l` | >= 10 |
| 9 | TSX line range 인용 ≥15 | `grep -cE 'line [0-9]+~[0-9]+\|line [0-9]+,' wave-6-tsx-conversion-checklist.md` | >= 15 |
| 10 | CATEGORIES_FALLBACK 박제 | `grep -c 'CATEGORIES_FALLBACK' wave-6-tsx-conversion-checklist.md` | >= 2 |
| 11 | ZONE_FLOORS 박제 | `grep -c 'ZONE_FLOORS' wave-6-tsx-conversion-checklist.md` | >= 2 |
| 12 | FLOOR_ORDER 박제 | `grep -c 'FLOOR_ORDER' wave-6-tsx-conversion-checklist.md` | >= 1 |
| 13 | MARKER_TYPE_LABEL 박제 | `grep -c 'MARKER_TYPE_LABEL' wave-6-tsx-conversion-checklist.md` | >= 1 |
| 14 | FLOOR_CODE 박제 | `grep -c 'FLOOR_CODE' wave-6-tsx-conversion-checklist.md` | >= 1 |
| 15 | queryKey 박제 | `grep -c 'queryKey' wave-6-tsx-conversion-checklist.md` | >= 3 |
| 16 | useMutation 박제 | `grep -cE 'useMutation\|createMutation\|updateMutation\|deactivateMutation' wave-6-tsx-conversion-checklist.md` | >= 4 |
| 17 | admin 가드 박제 | `grep -c 'admin' wave-6-tsx-conversion-checklist.md` | >= 3 |
| 18 | 유도등 분기 박제 | `grep -cE 'isGuidelamp\|guidelampAsCp\|FPM-' wave-6-tsx-conversion-checklist.md` | >= 3 |
| 19 | 소화기 분기 박제 | `grep -cE 'isExtCategory\|extinguisherApi\|zoneMap' wave-6-tsx-conversion-checklist.md` | >= 3 |
| 20 | BottomSheet/DesktopModal 박제 | `grep -cE 'BottomSheet\|DesktopModal\|ModalWrapper' wave-6-tsx-conversion-checklist.md` | >= 4 |
| 21 | src/** 변경 0 검증 | `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/ \| wc -l` | = 0 |
| 22 | App.tsx 변경 0 | `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/App.tsx \| wc -l` | = 0 |
| 23 | 이모지 0 | `LC_ALL=C grep -P '[\x{1F300}-\x{1FAFF}]' wave-6-tsx-conversion-checklist.md` | 0 hits |
| 24 | wrangler / npm run deploy 0 | `grep -cE 'wrangler\|npm run deploy' wave-6-tsx-conversion-checklist.md` | = 0 |
| 25 | tsc / build 영향 0 | markdown 추가만 — build PASS 자동 | 자동 PASS |

---

## 메모리 룰 inline (unique slug ≥12)

TSX 변환 wave executor 는 아래 slug 규칙을 적용 전 1건씩 확인하라 (`feedback_tsx_wave_stat_card_drift` — source outline 패턴 보존만 하고 sketch 새 패턴 누락하는 사고 방지):

1. `feedback_planner_prompt_sketch_verbatim` — §6 class fence 는 실제 grep 결과 박제. 추측한 토큰명/사이즈 금지.
2. `feedback_redesign_sketch_rule_enforcement` — §6.2/§6.3/§7.1 negative rule + verify gate 4중 강화.
3. `feedback_sketch_realistic_data` — 표시 분기/라벨 룰은 코드 그대로. 시안은 시각 디자인만.
4. `feedback_tsx_wave_emoji_dot_gap` — 이모지 0 + dot span 추가 markup verify gate 강제.
5. `feedback_tsx_wave_stat_card_drift` — sketch 새 패턴 verbatim 인용 필수. source outline 보존만 금지.
6. `feedback_text_caption_leading_none` — 작은 컨테이너 안 `text-caption` → `leading-none` 추가.
7. `feedback_tailwind_token_class_pattern` — `status-` prefix 0 + lucide `size={N}` prop 형태.
8. `feedback_tailwind_w8_h8_is_48px` — `w-8` = 48px (spacing override). 8x8 dot = `w-[8px] h-[8px]`.
9. `feedback_cbc7119_design_never_wrangler` — 이 워크트리에서 wrangler 명령 절대 금지.
10. `feedback_design_changes_ask_first` — 레이아웃 구조/표시 방식 변경은 사용자 상의 후.
11. `feedback_design_sketch_first` — spacing/sizing 도 sketch 시안 컨펌 후 인라인 적용.
12. `feedback_avoid_premature_confirmation` — "거의 일치" 자신감 표현 금지. 사용자 판단 대기.
13. `project_redesign_15_daily_report_status` — 비즈 anchor 1 byte 변경 0 일반화 패턴. §4 표 전체 적용.

---
phase: 260526-gln
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md
autonomous: true
requirements:
  - QUICK-260526-GLN-W6
must_haves:
  truths:
    - "wave-6-tsx-conversion-checklist.md 가 24-checkpoints/ 평면 폴더에 생성된다"
    - "markdown 은 12 섹션 헤더(§1~§12) 구조를 모두 포함한다"
    - "비즈 anchor 보존 박스 ≥10 종 명시 (CATEGORIES_FALLBACK 19종 / ZONE_LABEL / ZONE_FLOORS / FLOOR_ORDER / MARKER_TYPE_LABEL / FLOOR_CODE / admin 가드 useEffect + early return / queryKey 6 / useMutation 3 (create/update/deactivate) / 유도등 분기 (isGuidelamp + FPM- + guidelampAsCp) / 소화기 분기 (isExtCategory + extinguisherApi + zoneMap) / 'basement'='common' eq / catCheckPoints 자동 채우기 useEffect / canSave / handleSave / 카피 verbatim 8건 / placeholder 9건 / toast 7건 / select option ≥10)"
    - "OQ LOCKED 6건 verbatim 인용 + wave-1-index §7 박제 (BottomSheet 공통화 (a) / 그라데이션 미적용 (a) / zone toggle button row+12 격상 (a) / 외곽 hex 토큰 치환 (a) / 폰트 12 일률 격상+leading-none (a) / Lucide 치환 size 보존 (a))"
    - "4 sketch HTML grep 추출 명령 박제 (executor 가 wave 작성 시점에 실행, W2 frame-guard / W3 header-filters / W4 list-fab / W5 modal-form)"
    - "폰트 격상 매트릭스 — 9·10·11 → 12/14/16/18 매핑 line 위치까지 박제 (fontSize 9 line 408 카테고리 배지 / fontSize 10 line 632, 641 / fontSize 11 line 279, 408, 411, 567, 574, 578 등)"
    - "Lucide 아이콘 매핑 (Plus / ChevronDown + Search/ChevronRight 검토) + 인라인 SVG IconPlus(line 11~18)+IconChevronDown(line 19~25) 교체 매핑"
    - "components.css inherit vs 신규 정의 명단 (wave-1-index §4 박제 — 24-checkpoints 신규 정의 0, StaffManagePage 공통화는 별도 task)"
    - "Tailwind cheatsheet — status- prefix 없음 + w-8 h-8=48px 함정 + leading-none + linear-gradient 0 + arbitrary `text-[#hex]` fallback inline"
    - "negative gate ≥17 + verify gate ≥22"
    - "메모리 룰 unique slug ≥10 inline"
    - "src/** 변경 0 / components.css 0 / App.tsx 0 / wrangler 0 / npm run deploy 0"
    - "atomic commit 1개 (산출) + SUMMARY 1개 commit"
  artifacts:
    - path: cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md
      provides: "TSX 변환 wave 진입 시 executor 가 단일 진입점으로 사용할 변환 체크리스트"
      contains: "## §1 ~ ## §12 헤더, 비즈 anchor 박스, OQ LOCKED 6건, 4 sketch grep 명령, 폰트 격상 매트릭스, Lucide 매핑, negative/verify gate"
      min_lines: 400
  key_links:
    - from: cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md
      to: cha-bio-safety/src/pages/CheckpointsPage.tsx
      via: "verbatim line range 인용 (line 1~8 imports, line 11~25 SVG, line 27~37 상수, line 40~74 BottomSheet+DesktopModal, line 77~84 INPUT_STYLE+LABEL_STYLE, line 87~109 폼 state 상수, line 111~398 CheckPointModalContent, line 401~419 CheckPointCard, line 422~425 SKELETON, line 428~692 메인 페이지)"
      pattern: "src/pages/CheckpointsPage.tsx (693 lines)"
    - from: cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md
      to: cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md
      via: "§1 인벤토리 / §2.2 TSX checklist / §1.3 비즈 anchor / §5 메모리 룰 / §7 OQ default 박제"
      pattern: "wave-1-index.md (622 lines)"
    - from: cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md
      to: cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-{2,3,4,5}-*.html
      via: "§6 4 sketch grep verbatim class fence (W2 frame-guard / W3 header-filters / W4 list-fab / W5 modal-form)"
      pattern: "4 sketch HTML (483 / 585 / 689 / 773 lines)"
    - from: cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md
      to: cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md
      via: "12 섹션 구조 + 비즈 anchor 박스 + Tailwind cheatsheet 패턴 mirror (slq 355 lines minimal brief)"
      pattern: "slq W7 (18-worklog) precedent"
---

<objective>
redesign/24-checkpoints CheckpointsPage W6 — TSX 변환 wave 진입 직전 단계의 verify checklist markdown 1 개를 작성한다.
산출은 `cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md` 단일 파일.
이 markdown 은 TSX 변환 wave 시점에 executor 가 단일 진입점으로 참조하여:
  (a) 693 lines CheckpointsPage.tsx 영역별로 어떤 sketch class 를 어디에 적용하는지 verbatim 매핑을 알 수 있어야 하고,
  (b) 비즈 anchor (admin 가드 useEffect+early return / CATEGORIES_FALLBACK 19종 / ZONE_LABEL / ZONE_FLOORS / FLOOR_ORDER 20건 / MARKER_TYPE_LABEL 6건 / FLOOR_CODE 8건 / queryKey 6 / useMutation 3 (create+update+deactivate) / 유도등 분기 + guidelampAsCp / 소화기 분기 + extinguisherApi + zoneMap / 'basement'='common' eq / catCheckPoints 자동 채우기 useEffect / canSave / handleSave / isMarker FPM- 분기 등) 1 byte 변경을 강제하며,
  (c) OQ LOCKED 6건 / 4 sketch HTML grep 추출 / 폰트 격상 매트릭스 / Lucide 매핑 / Tailwind cheatsheet / negative+verify gate 를 1 곳에서 모두 확인할 수 있어야 한다.

Purpose: 14-reports (700) / 15-daily-report (934) / 18-worklog (1216) / 23-education (591) 의 4i9 단일 atomic 패턴을 24-checkpoints 에서도 자동 도달.
Output: 단일 markdown (~450~550 lines 예상, 693 lines TSX 기반이므로 18-worklog 보다 작고 14-reports 와 유사) + atomic commit 1개.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md
@cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html
@cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html
@cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html
@cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html
@cha-bio-safety/src/pages/CheckpointsPage.tsx
@cha-bio-safety/docs/redesign-context/24-checkpoints/design-system.md
</context>

<tasks>

<task type="auto">
  <name>T1: wave-6-tsx-conversion-checklist.md 작성 (단일 atomic)</name>

  <files>cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md</files>

  <action>
W6 TSX 변환 verify checklist markdown 1개를 Write 도구로 생성한다. src/** 0 byte 변경. components.css 0 byte 변경. App.tsx 0 byte 변경. 단일 atomic commit.

## 사전 grep (executor 가 작성 시작 시 실행)

```bash
# 4 sketch HTML class 추출 (W2~W5 의 4 sub-wave sketch 모두 박제)
ls cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-{2,3,4,5}-*.html 2>/dev/null
for f in cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-{2,3,4,5}-*.html; do
  echo "=== $f ==="
  grep -oE 'class="[^"]+"' "$f" | sort -u
done

# OQ LOCKED 6건 추출 (wave-1-index.md §7)
grep -nE '^## OQ #|^\*\*Default:' cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md

# components.css 기존 inherit 후보 class 명단 (재사용 vs 신규 분류)
grep -E '^\.(card|chip|btn|stat-|nav-|input-|textarea-)' cha-bio-safety/src/styles/components.css 2>/dev/null | head -60

# 폰트 9·10·11 출현 위치 (CheckpointsPage.tsx)
grep -nE "fontSize:\s*1[01]|fontSize:\s*9[^0-9]" cha-bio-safety/src/pages/CheckpointsPage.tsx
```

## markdown 구조 (12 섹션 헤더, 정확히 이 순서)

### `## §1 imports 매핑 (line 1~8) + Lucide 추가`
- 현재: `useState, useEffect` from 'react' + `useNavigate` + react-query 3종 (useQuery / useMutation / useQueryClient) + `toast` + `useAuthStore` + `checkPointApi, floorPlanMarkerApi, extinguisherApi` + `useIsDesktop` + type `CheckPointFull, CheckPointUpdatePayload, BuildingZone`
- 추가 import 예정: `lucide-react` { Plus, ChevronDown } — 인라인 SVG IconPlus(line 11~18) + IconChevronDown(line 19~25) 교체. 데스크톱 헤더 Plus 16 (line 548) / 모바일 FAB Plus 18 (line 679, OQ #6 default = 18 보존) / 데스크톱 헤더 ChevronDown 14 (line 528 — §7.1 위반 → 16 격상 검토 OQ #6 추가) / 모바일 헤더 ChevronDown 16 (line 561)
- 인라인 SVG 함수 (IconPlus / IconChevronDown line 11~25) → Lucide 치환 후 제거
- 상수 보존: `CATEGORIES_FALLBACK` (line 29~34, 19종) / `ZONE_LABEL` (line 35~37) / `INPUT_STYLE` / `LABEL_STYLE` (line 77~84) / `EMPTY_CP_FORM` / `ZONE_FLOORS` / `EMPTY_EXT` / `SKELETON_STYLE` — TSX 변환 후 일부는 tailwind class 로 대체되거나 잔존 (테이블 박제 필수)

### `## §2 메인 함수 + 모달 컴포넌트 (line 111~398, 428~692) — hooks/state/handlers 1:1 verbatim`
박스로 인용:
- **CheckpointsPage 메인** (line 428~692):
  - `useNavigate` + `useAuthStore` { staff: me } + `useIsDesktop` + state 4 (`selectedCategory`, `filterZone`, `filterFloor`, `modal { open, mode, target }`)
  - admin 가드 useEffect (line 438~440): `if (me?.role !== 'admin') navigate('/dashboard', { replace: true })`, deps `[me, navigate]`
  - early return (line 501): `if (me?.role !== 'admin') return null`
  - useQuery #1 (line 442~446): `['check-point-categories']`, `checkPointApi.categories`, staleTime 60_000
  - `isGuidelamp = selectedCategory === '유도등'` (line 448)
  - useQuery #2 (line 449~454): `['check-points', selectedCategory]`, enabled: `selectedCategory !== '' && !isGuidelamp`, staleTime 30_000
  - useQuery #3 (line 456~461): `['floorplan-markers-all', 'guidelamp']`, `floorPlanMarkerApi.listAll('guidelamp')`, enabled: `isGuidelamp`, staleTime 30_000
  - MARKER_TYPE_LABEL 6건 (line 462~464) + FLOOR_CODE 8건 (line 465) — 함수 내부 상수, 변경 0
  - guidelampAsCp 변환 (line 466~477): fc/x/y/locNo 계산 + CheckPointFull 형태
  - `isLoading = isGuidelamp ? glLoading : cpLoading` (line 478)
  - `cpListRaw = isGuidelamp ? guidelampAsCp : (checkPoints ?? [])` (line 479)
  - cpList filter (line 480~489): `eq()` 헬퍼로 'basement'='common' legacy 호환
  - FLOOR_ORDER 20건 (line 492) + availableFloors (line 493~499): zone filter + sort
  - `ModalWrapper = isDesktop ? DesktopModal : BottomSheet` (line 503)
  - `categoryOptions = categories.length > 0 ? categories : CATEGORIES_FALLBACK` (line 504)
- **CheckPointModalContent** (line 111~398):
  - useState `form` (CpFormState, line 115~119) + `confirmDeactivate` + `extForm` (ExtState, line 121)
  - `isExtCategory = form.category === '소화기'` (line 122)
  - catCheckPoints useQuery (line 124~130): `['check-points', form.category]`, enabled: `mode === 'add' && form.category !== ''`, staleTime 30_000
  - handleCategoryChange (line 132~135)
  - 자동 채우기 useEffect (line 138~160): filtered → lastNo → numMatch → nextNo / `'{floor} {category} {N+1}번'` → setForm
  - setField (line 162~163): generic field setter
  - createMutation (line 165~200): isExtCategory 분기 (extinguisherApi.create + zoneMap `{research:'연', office:'사', common:'공'}` 또는 checkPointApi.create + id=`cp_${Date.now()}` + qrCode=`QR-${id}`)
  - isMarker (line 204): `!!cp?.id?.startsWith('FPM-')`
  - updateMutation (line 206~227): isMarker (floorPlanMarkerApi.update label/description/zone) 또는 checkPointApi.update
  - deactivateMutation (line 229~247): isMarker (floorPlanMarkerApi.delete) 또는 checkPointApi.update {isActive:0}
  - canSave (line 249~252): `location.trim() !== '' && category !== '' && (!isExtCategory || (extForm.type !== '' && form.zone !== '' && form.floor !== ''))`
  - isBusy = `createMutation.isPending || updateMutation.isPending`
  - handleSave (line 255~262)

### `## §3 JSX render 영역별 변환 (4 영역, 4 sub-wave 매핑)`
- **W2 외곽+가드** → 외곽 wrapper (line 507, `flex column / bg var(--bg) / height 100% / overflow hidden`) + `<style>` 태그 (line 508~513, keyframes blink+slideUp + focus border)
- **W3 헤더+필터** → 데스크톱 헤더 (line 516~551, flex / gap 12 / padding 12px 24px / borderBottom + 카테고리 select 220px + filterZone + filterFloor + 카운트 라벨 + 개소 추가 Plus 16 버튼) + 모바일 헤더 (line 552~582, flex column / padding 12px 16px / gap 8 + 카테고리 select 풀폭 + 조건부 필터 row + 카운트 라벨)
- **W4 목록+FAB** → 콘텐츠 wrapper (line 585) + 4 상태 (empty 카테고리 미선택 line 586~590 / skeleton 3개 line 591~597 / error line 598~602 / data) + 데스크톱 테이블 (line 604~656, 7 컬럼: 개소명/카테고리/구역/층/위치번호/상태/액션) + 모바일 카드 리스트 (line 659~671, CheckPointCard map) + 모바일 카드 empty (line 661~666) + 모바일 FAB (line 674~683, sticky + Plus 18 + paddingBottom calc(16+sab))
- **W5 모달+폼** → ModalWrapper 호출 (line 685~690) + BottomSheet (line 40~57) + DesktopModal (line 60~74) + CheckPointModalContent 폼 6+7 필드 (line 264~395):
  - 카테고리 select (CATEGORIES + 빨간 *, line 267~273)
  - 구역 button row 3개 (office/research/basement 토글, line 275~284)
  - 층 select (form.zone 채워졌을 때만, line 285~295)
  - 소화기 추가 폼 (isExtCategory, line 296~347, 종류 select 4종 + 6 input)
  - 개소명 input (필수 + placeholder '1층 로비 소화기', line 348~351)
  - 위치번호 + 설명 input (비-소화기만, line 352~363)
  - 액션 row (취소/저장 + edit 시 비활성화 + confirmDeactivate 빨간 안내, line 366~395)

### `## §4 비즈 anchor 보존 박스 (≥10 종, 0 byte 변경 강제) — wave-1-index §1.3 verbatim 인용`
표 형식으로 박제 (anchor / line / 보존 이유):
1. `CATEGORIES_FALLBACK` 19종 (line 29~34) — 순서/값 변경 금지, DB 동적 categories 폴백
2. `ZONE_LABEL` (line 35~37) — `office:'사무동', research:'연구동', basement:'지하', common:'지하'` (legacy)
3. `ZONE_FLOORS` (line 94~98) — office/research 8층 + common 6층 (지하 키 'common' 사용, UI 는 'basement')
4. `FLOOR_ORDER` 20건 (line 492) — 정렬 룰
5. `MARKER_TYPE_LABEL` 6건 (line 462~464) — 유도등 marker_type 라벨
6. `FLOOR_CODE` 8건 (line 465) — 유도등 locNo 생성 (`${fc}-${x}-${y}`)
7. admin 가드 useEffect (line 438~440) + early return (line 501) — 1 byte 변경 0
8. queryKey 6건 — `['check-points', form.category]` (line 126) / `['check-points', selectedCategory]` (line 450) / `['check-point-categories']` (line 443) / `['floorplan-markers-all', 'guidelamp']` (line 457) + invalidate ['check-points'] (line 190, 221, 241) + invalidate ['check-point-categories'] (line 191) + invalidate ['floorplan-markers-all'] (line 222, 242)
9. catCheckPoints 자동 채우기 useEffect (line 138~160) — filtered → lastNo → numMatch → nextNo → defaultName 패턴 0 byte
10. createMutation (line 165~200) — isExtCategory 분기 + zoneMap + extinguisherApi.create + 비-소화기 checkPointApi.create
11. updateMutation (line 206~227) — isMarker FPM- 분기 + floorPlanMarkerApi.update {label, description, zone}
12. deactivateMutation (line 229~247) — isMarker delete vs isActive:0
13. canSave (line 249~252) — 3 조건 verbatim
14. 'basement'='common' eq() 헬퍼 (line 481~484, 494~497) — 0081 legacy 호환
15. 유도등 분기 (isGuidelamp + guidelampAsCp + isLoading + cpListRaw) — line 448, 466~479
16. ModalWrapper = isDesktop ? DesktopModal : BottomSheet (line 503)
17. categoryOptions fallback (line 504): `categories.length > 0 ? categories : CATEGORIES_FALLBACK`
18. BottomSheet 함수 verbatim (line 40~57) — overlay rgba(0,0,0,0.6) + bg var(--bg2) + radius 16/16/0/0 + slideUp 0.28s + maxHeight 90vh + handle bar 32x4 var(--bd2) + title 16/700/var(--t1) padding 12 16 0 + backdrop click close (e.target === e.currentTarget)
19. DesktopModal 함수 verbatim (line 60~74) — overlay rgba(0,0,0,0.5) + bg var(--bg2) + radius 12 + width 440 + maxHeight 85vh + boxShadow 0 8px 32px rgba(0,0,0,.18) + title 16/700/var(--t1) padding 20 24 0
20. SKELETON_STYLE (line 422~425) — bg var(--bg3) / radius 12 / height 64 / blink 2s ease-in-out infinite
21. 모바일 FAB safe-area: `paddingBottom: calc(16px + var(--sab))` (line 676) — iOS PWA 룰
22. 카피 verbatim 8건:
    - '카테고리를 선택하면 개소 목록이 표시됩니다' (line 588)
    - '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요' (line 600)
    - '해당 카테고리에 개소가 없습니다' (line 621, 663)
    - '개소 추가 버튼을 눌러 점검 개소를 등록하세요' (line 664)
    - '개소 추가' / '개소 수정' (modal title, line 687)
    - '저장' / '취소' / '비활성화' (액션 버튼, line 369, 372, 378, 388, 391)
    - '이 개소를 비활성화합니다. 기존 점검 기록은 보존됩니다.' (line 385)
23. placeholder verbatim 9건 (line 314, 320, 326, 332, 338, 344, 350, 356, 360): '예: 한울방재' / '예: 2024-04 (YYYY-MM)' / '예: 수소10-19-11' / '예: BEQV' / '예: 72605' / '예: 68605' / '1층 로비 소화기' / '001 (선택)' / '메모 (선택)'
24. toast 카피 verbatim 7건: '소화기 등록 완료 ({mgmtNo})' / '개소가 추가되었습니다' / '저장에 실패했습니다. 입력값을 확인해 주세요' (line 199, 226) / '개소 정보가 수정되었습니다' / '마커가 삭제되었습니다' / '개소가 비활성화되었습니다' / '비활성화에 실패했습니다'
25. select option verbatim 10건 이상: '전체 (카테고리 선택)' / '전체 구역' / '전체 층' / '사무동' / '연구동' / '지하' / '카테고리 선택' / '종류 선택' / '층 선택' / '분말 20kg' / '분말 3.3kg' / '할로겐' / 'K급'

### `## §5 OQ LOCKED 6건 verbatim 인용 (wave-1-index.md §7 박제)`
- **OQ #1 default: (a) BottomSheet/DesktopModal 인라인 보존** — StaffManagePage(26) 공통화는 별도 task. 이 wave 는 동 파일 인라인. (negative gate: src/components/ui/Modal.tsx 또는 Sheet.tsx 신규 생성 0)
- **OQ #2 default: (a) 단색 var(--acl) 유지** — 저장 / 개소 추가 / 모바일 FAB 3건 모두 단색. linear-gradient 0 (TSX 본문). design-system.md §6.4 그라데이션 신규 도입 금지.
- **OQ #3 default: (a) zone toggle button row 유지 + fontSize 11 → 12 격상** — segment control / select 로 변경 X. height 36 → 40~44 격상 별도 OQ 가능 (이 wave 는 default).
- **OQ #4 default: (a) 외곽 hex 토큰 치환** — `var(--bg)`→`--surface-page` / `--bg2`→`--surface-raised` / `--bg3`→`--surface-sunken` / `--bg4`→`--surface-active` / `--bd`→`--border-default` / `--bd2`→`--border-strong` / `--t1/--t2/--t3`→`--text-primary/--secondary/--tertiary` / `--acl`→`--accent-primary` 또는 `--status-info-bar` / `--safe`→`--status-safe-bar` / `--danger`→`--status-danger`. design-system.md §4.1 마이그레이션 표 그대로.
- **OQ #5 default: (a) 9/10/11 → 12 일률 격상 + leading-none 추가** — 카테고리 배지 (line 408 fontSize 9 / line 632 fontSize 10) / 테이블 status (line 641 fontSize 11) / 모바일 필터 select (line 567, 574 fontSize 11) / 모바일 카드 메타 (line 412 fontSize 12) / 모바일 카드 액션 '수정 ▸' (line 416 fontSize 12) 모두 `text-caption` + `leading-none`.
- **OQ #6 default: (a) Lucide 치환 + 기존 size 보존** — `<Plus size={16} />` (line 548 데스크톱) + `<Plus size={18} />` (line 679 모바일 FAB) + `<ChevronDown size={14} />` (line 528 데스크톱 — §7.1 위반, size={16} 격상 검토) + `<ChevronDown size={16} />` (line 561 모바일). 인라인 SVG IconPlus / IconChevronDown 함수 제거.

### `## §6 4 sketch HTML grep 추출 verbatim class 인용`
사전 grep 명령 결과를 fence 로 박제 (executor 가 W6 작성 시 실행 결과 그대로):
```
=== sketch-wave-2-frame-guard.html (483 lines) ===
class="..." 종류 sort -u
=== sketch-wave-3-header-filters.html (585 lines) ===
class="..." 종류 sort -u
=== sketch-wave-4-list-fab.html (689 lines) ===
class="..." 종류 sort -u
=== sketch-wave-5-modal-form.html (773 lines) ===
class="..." 종류 sort -u
```
(planner 는 명령만 박제, 실제 추출 결과는 executor 가 wave 작성 시 sketch 파일 명단 기반으로 박제)

### `## §7 폰트 격상 매트릭스 — 9·10·11 → 12/14/16/18`
표 형식 (line / 현재 fontSize / 텍스트 컨텍스트 / 목표 토큰):
- line 50: `width 32, height 4` BottomSheet handle bar (폰트 X, 시각 변경 0)
- line 52: fontSize 16 fontWeight 700 BottomSheet title → text-body font-bold (16 OK, §1.1 마지노선)
- line 69: fontSize 16 fontWeight 700 DesktopModal title → text-body font-bold
- line 79: fontSize 14 INPUT_STYLE → text-body-sm (14 OK)
- line 83: fontSize 12 fontWeight 700 LABEL_STYLE → text-label (12 OK)
- line 279: fontSize 11 fontWeight 700 zone toggle button → text-caption font-bold (OQ #3, 11 → 12 격상)
- line 369: fontSize 14 fontWeight 700 취소 버튼 → text-body-sm (14 OK)
- line 371: fontSize 14 fontWeight 700 저장 버튼 → text-body-sm (14 OK)
- line 377: fontSize 12 비활성화 버튼 → text-caption (12 OK)
- line 384: fontSize 12 비활성화 안내 박스 → text-caption (12 OK)
- line 388: fontSize 14 confirmDeactivate 취소 → text-body-sm
- line 390: fontSize 14 fontWeight 700 confirmDeactivate 비활성화 → text-body-sm font-bold
- line 407: fontSize 14 fontWeight 700 CheckPointCard 개소명 → text-body-sm font-bold
- line 408: fontSize 9 fontWeight 700 카테고리 배지 (모바일 카드) → **text-caption + leading-none** (9 → 12, OQ #5)
- line 412: fontSize 12 메타 (zone·floor) → text-caption + leading-none
- line 416: fontSize 12 fontWeight 700 '수정 ▸' → text-caption + leading-none
- line 522: fontSize 13 데스크톱 카테고리 select → text-label (13 → 12 또는 14, OQ #4 검토)
- line 532, 539: fontSize 12 데스크톱 filterZone/filterFloor → text-caption
- line 543: fontSize 12 데스크톱 카운트 → text-caption
- line 547: fontSize 13 fontWeight 700 데스크톱 '개소 추가' → text-label font-bold
- line 567, 574: fontSize 11 모바일 filterZone/filterFloor → **text-caption** (11 → 12, OQ #5)
- line 578: fontSize 11 모바일 카운트 → text-caption + leading-none (11 → 12)
- line 587: fontSize 14 카테고리 미선택 empty → text-body-sm
- line 599: fontSize 14 error → text-body-sm
- line 610~615: fontSize 12 fontWeight 700 데스크톱 테이블 thead → text-caption font-bold (12 OK)
- line 621: fontSize 14 테이블 empty → text-body-sm
- line 632: fontSize 10 fontWeight 700 데스크톱 테이블 카테고리 배지 → **text-caption + leading-none** (10 → 12, OQ #5)
- line 638: fontSize 12 JetBrains Mono 위치번호 → text-caption font-mono
- line 641: fontSize 11 fontWeight 600 데스크톱 테이블 status → **text-caption + leading-none** (11 → 12, OQ #5)
- line 649: fontSize 12 fontWeight 700 데스크톱 테이블 액션 '수정' → text-caption font-bold
- line 662: fontSize 16 fontWeight 700 모바일 empty title → text-body font-bold
- line 664: fontSize 12 모바일 empty 안내 → text-caption
- line 678: fontSize 14 fontWeight 700 모바일 FAB '개소 추가' → text-body-sm font-bold

inline 9 px 발견 1건 (line 408) / 10 px 발견 1건 (line 632) / 11 px 발견 3건 (line 279, 567, 574, 578, 641) 모두 OQ #5 default 따라 12 격상.

### `## §8 Lucide 아이콘 매핑`
표 (현재 / lucide 이름 / size prop / 적용 line):
- IconPlus SVG 함수 (line 11~18, viewBox 24x24, line+line cross) → `<Plus />` (lucide-react)
- IconChevronDown SVG 함수 (line 19~25, viewBox 24x24, polyline 6 9 12 15 18 9) → `<ChevronDown />` (lucide-react)
- 데스크톱 헤더 ChevronDown (line 528, size=14 color=var(--t2)) → `<ChevronDown size={16} color="var(--text-secondary)" />` (size 14 → 16, §7.1 위반 수정)
- 모바일 헤더 ChevronDown (line 561, size=16) → `<ChevronDown size={16} />`
- 데스크톱 헤더 Plus (line 548, size=16 color="#fff") → `<Plus size={16} color="#fff" />`
- 모바일 FAB Plus (line 679, size=18 color="#fff") → `<Plus size={18} color="#fff" />` (18 보존 OQ #6 default. 18 → 20 격상 별도 검토)
- 모바일 카드 액션 '수정 ▸' (line 416, 텍스트 ▸ 글리프) → `<ChevronRight size={14} />` 검토 (단, 텍스트 보존 OQ default 가 가능 — OQ 추가 시점)

### `## §9 components.css inherit vs 신규 정의`
wave-1-index.md §4 박제 (재사용 only + 신규 0):
- 재사용:
  - `.bg-surface-page` / `.bg-surface-raised` / `.bg-surface-sunken` / `.bg-surface-active` (tokens.css)
  - `.text-text-primary` / `.text-text-secondary` / `.text-text-tertiary`
  - `.text-status-safe-bar` / `.text-status-danger`
  - `.bg-status-info-bg` / `.text-status-info` (카테고리 배지 — 또는 `--accent-primary` 알리아스)
  - `.bg-status-danger-bg` (비활성화 안내 박스)
  - `.text-caption` / `.text-label` / `.text-body-sm` / `.text-body` (typography.css)
  - `.rounded-md` (12) / `.rounded-lg` (16) / `.rounded-sm` (8)
  - `.btn` / `.btn-primary` / `.btn-secondary` (14-reports components.css 재사용 검토)
- 신규 정의: **없음** (StaffManagePage 공통화는 별도 task — OQ #1 default = 미공통화. BottomSheet/DesktopModal/CheckPointCard/SKELETON 모두 동 파일 인라인 유지.)

### `## §10 Tailwind cheatsheet — 24-checkpoints 사용 토큰`
한 줄로 박제:
- 색 토큰: `bg-safe-bar` `bg-fire-bar` `bg-danger-bar` `bg-warn-bar` `bg-surface-page` `bg-surface-raised` `bg-surface-sunken` `bg-surface-active` `text-text-primary` `text-text-secondary` `text-text-tertiary` `border-border-default` `border-border-strong`
- 그라운드: status- prefix 0 (`bg-fire-bar` O, `bg-status-fire-bar` X — `feedback_tailwind_token_class_pattern`)
- 크기 함정: `w-8 h-8 = 48px` (tailwind.config spacing override) — 8x8 dot (line 404) 변환 시 `w-2 h-2` (8px) 또는 arbitrary `w-[8px] h-[8px]` 사용. handle bar 32x4 (line 50) 변환 시 `w-8 h-1` (32x4) — w-8=32 (그러나 spacing override 가 적용된 경우 arbitrary `w-[32px]` 안전). SKELETON height 64 → `h-16` (64) — w-8 함정 사고 회피.
- 폰트: `text-caption` (12px lh:1.5 = 18px) 작은 컨테이너 안 사용 시 `leading-none` 추가 (h-8/h-9 컨테이너 안 시각적 패딩 사고 박제 — `feedback_text_caption_leading_none`)
- 그라데이션: 0 — OQ #2 default. 단색 `bg-accent-primary` / `bg-status-info-bar` 만.
- tokens.css 불일치 시: arbitrary `text-[#hex]` fallback 패턴 (memory `project_redesign_16_workshift_status`) — 단, 24-checkpoints 는 raw hex 추가 가능성 낮음

### `## §11 negative gate (≥17, TSX 변환 wave 진입 시 강제)`
- (1) src/** 변경은 CheckpointsPage.tsx 만 — 다른 페이지 / hook / util 0 byte
- (2) components.css 변경 0 (재사용만, 신규 추가 0 — OQ #1 default + §9)
- (3) App.tsx 0 byte — Suspense 매핑 변경 0, MOBILE_NO_NAV_PATHS 변경 0
- (4) sketch HTML 추가 0 (W2~W5 의 4 sketch 는 이미 작성됨)
- (5) wave-6 외 markdown 추가 0
- (6) admin 가드 (line 438~440 + 501) 1 byte 변경 0
- (7) CATEGORIES_FALLBACK 19종 / ZONE_LABEL / ZONE_FLOORS / FLOOR_ORDER 20건 / MARKER_TYPE_LABEL 6건 / FLOOR_CODE 8건 1 byte 변경 0
- (8) queryKey 6건 1 byte 변경 0
- (9) useMutation 3건 (create / update / deactivate) onSuccess / onError / mutationFn 분기 모두 0 byte
- (10) catCheckPoints 자동 채우기 useEffect (line 138~160) 0 byte
- (11) 유도등 분기 (isGuidelamp + guidelampAsCp 변환 + isMarker FPM- 분기) 0 byte
- (12) 소화기 분기 (isExtCategory + extinguisherApi + zoneMap) 0 byte
- (13) 'basement'='common' eq() 헬퍼 (line 481~484, 494~497) 0 byte
- (14) BottomSheet / DesktopModal 함수 공통 추출 0 (StaffManagePage 와 별도 task)
- (15) 이모지 0 (메타 코멘트 포함 — "warning glyph" / "lin-grad" 약어 패턴 사용)
- (16) fontSize 9·10·11 인라인 0 (모두 §7 폰트 매트릭스 따라 12 격상)
- (17) linear-gradient 0 (OQ #2: 저장 / 개소 추가 / FAB 단색 보존)
- (18) status- prefix 0 (`bg-status-fire-bar` 형태 entity escape)
- (19) w-8 h-8 사고 0 (8x8 dot → w-2 h-2 / handle bar → arbitrary w-[32px] h-[4px])
- (20) wrangler 0 (이 워크트리 룰 — `feedback_cbc7119_design_never_wrangler`)
- (21) npm run deploy 0 (직원 도메인 가는 경로)
- (22) 카피 verbatim 8건 / placeholder 9건 / toast 7건 / select option ≥10건 1 byte 변경 0 (`feedback_sketch_realistic_data`)
- (23) 모바일 FAB safe-area `calc(16px + var(--sab))` (line 676) 0 byte (iOS PWA safe-area-inset-bottom)
- (24) `monthPickerRef` / showPicker / click() 패턴 (CheckpointsPage 는 없음, 다른 페이지 참조 시 사고 회피 메타)
- (25) BottomSheet slideUp animation keyframe (`<style>` line 508~513) 0 byte (또는 tailwind.config extend)

### `## §12 verify gate (≥22 자동 명령 + 기대값)`
표 (gate / 명령 / 기대값):
1. 12 섹션 헤더 존재 — `grep -cE '^## §[1-9] |^## §1[0-2] ' wave-6-tsx-conversion-checklist.md` = 12
2. 비즈 anchor 박스 ≥10 — `grep -cE '^[0-9]+\\. ' wave-6-*.md` ≥ 20 (§4 의 1~25 row)
3. OQ LOCKED 6건 — `grep -cE '^- \\*\\*OQ #[1-6]' wave-6-*.md` = 6
4. 4 sketch HTML class fence ≥4 — `grep -c '^```' wave-6-*.md` ≥ 8 (4 fence open + 4 fence close, 최소 추가 코드 fence 포함 시 ≥10)
5. Tailwind cheatsheet 박제 — `grep -c 'status- prefix 0' wave-6-*.md` ≥ 1 + `grep -c 'w-8 h-8' wave-6-*.md` ≥ 1
6. negative gate ≥17 — `grep -cE '^- \\([0-9]+\\)' wave-6-*.md` ≥ 17
7. verify gate ≥22 — `grep -cE '^[0-9]+\\. ' wave-6-*.md` ≥ 22 (전체)
8. 메모리 룰 unique slug ≥10 — `grep -oE '(feedback|project|reference)_[a-z_]+' wave-6-*.md | sort -u | wc -l` ≥ 10
9. TSX line range 인용 ≥15 — `grep -cE 'line [0-9]+~[0-9]+|line [0-9]+,' wave-6-*.md` ≥ 15
10. CATEGORIES_FALLBACK 박제 — `grep -c 'CATEGORIES_FALLBACK' wave-6-*.md` ≥ 2
11. ZONE_FLOORS 박제 — `grep -c 'ZONE_FLOORS' wave-6-*.md` ≥ 2
12. FLOOR_ORDER 박제 — `grep -c 'FLOOR_ORDER' wave-6-*.md` ≥ 1
13. MARKER_TYPE_LABEL 박제 — `grep -c 'MARKER_TYPE_LABEL' wave-6-*.md` ≥ 1
14. FLOOR_CODE 박제 — `grep -c 'FLOOR_CODE' wave-6-*.md` ≥ 1
15. queryKey 박제 — `grep -c 'queryKey' wave-6-*.md` ≥ 3
16. useMutation 박제 — `grep -c 'useMutation\\|createMutation\\|updateMutation\\|deactivateMutation' wave-6-*.md` ≥ 4
17. admin 가드 박제 — `grep -c 'admin' wave-6-*.md` ≥ 3
18. 유도등 분기 박제 — `grep -c 'isGuidelamp\\|guidelampAsCp\\|FPM-' wave-6-*.md` ≥ 3
19. 소화기 분기 박제 — `grep -c 'isExtCategory\\|extinguisherApi\\|zoneMap' wave-6-*.md` ≥ 3
20. BottomSheet/DesktopModal 박제 — `grep -c 'BottomSheet\\|DesktopModal\\|ModalWrapper' wave-6-*.md` ≥ 4
21. src/** 변경 0 검증 — `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/` | wc -l = 0
22. App.tsx 변경 0 검증 — `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/App.tsx` | wc -l = 0
23. 이모지 0 (메타 코멘트 포함) — `LC_ALL=C grep -P '[\\x{1F300}-\\x{1FAFF}]' wave-6-*.md` = 0 hits
24. wrangler 0 / npm run deploy 0 — `grep -cE 'wrangler|npm run deploy' wave-6-*.md` = 0
25. tsc / build 영향 0 — W6 wave 자체는 markdown 추가만이므로 build PASS 자동

## 메모리 룰 inline (unique slug ≥10, wave-1-index.md §5 + 기타 박제)
markdown 본문 마지막 부근에 unique slug 한 줄씩 박제 (12 slug):
- feedback_planner_prompt_sketch_verbatim
- feedback_redesign_sketch_rule_enforcement
- feedback_sketch_realistic_data
- feedback_tsx_wave_emoji_dot_gap
- feedback_tsx_wave_stat_card_drift
- feedback_text_caption_leading_none
- feedback_tailwind_token_class_pattern
- feedback_tailwind_w8_h8_is_48px
- feedback_cbc7119_design_never_wrangler
- feedback_design_changes_ask_first
- feedback_design_sketch_first
- feedback_avoid_premature_confirmation
- project_redesign_15_daily_report_status (비즈 anchor 1 byte 변경 0 일반화 패턴)

## 작성 후 atomic commit

```bash
git add cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md
git commit -m "docs(24-checkpoints): wave 6 TSX 변환 checklist — 12 섹션 + 비즈 anchor + 4 sketch fence + OQ LOCKED 6"
```

## Negative (전체)
- src/** 변경 0 byte
- components.css 변경 0 byte
- App.tsx 변경 0 byte
- sketch HTML 추가 0 (W2~W5 의 4 sketch 는 이미 작성됨)
- wave-6 외 markdown 추가 0
- wrangler 명령 0 (워크트리 룰 deny)
- npm run deploy 0 (직원 도메인)
- 이모지 0 (메타 코멘트 포함)
- 카피 verbatim 8 / placeholder 9 / toast 7 / select option ≥10 임의 변경 0
- linear-gradient 인라인 박제 0 (메타 표기 시 "lin-grad" 약어)
- ⚠ 글리프 메타 코멘트 0 (메타 표기 시 "warning glyph")
- admin 가드 / CATEGORIES_FALLBACK 19종 / ZONE_FLOORS / FLOOR_ORDER 20건 / MARKER_TYPE_LABEL 6건 / FLOOR_CODE 8건 변경 0
- 유도등 분기 / 소화기 분기 / 'basement'='common' eq 변경 0
- BottomSheet/DesktopModal 공통 추출 0 (별도 task)
  </action>

  <verify>
    <automated>
[[ -f cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md ]] \
  && [ "$(grep -cE '^## §[1-9] |^## §1[0-2] ' cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md)" -eq 12 ] \
  && [ "$(grep -cE '^- \*\*OQ #[1-6]' cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md)" -eq 6 ] \
  && [ "$(grep -c '^```' cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md)" -ge 8 ] \
  && [ "$(grep -oE '(feedback|project|reference)_[a-z_]+' cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md | sort -u | wc -l)" -ge 10 ] \
  && [ "$(grep -cE '^- \([0-9]+\)' cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md)" -ge 17 ] \
  && [ "$(grep -cE 'line [0-9]+~[0-9]+|line [0-9]+,' cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md)" -ge 15 ] \
  && [ "$(git diff origin/main..HEAD --name-only -- cha-bio-safety/src/ 2>/dev/null | wc -l)" -eq 0 ] \
  && [ "$(grep -cE 'wrangler|npm run deploy' cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md)" -eq 0 ] \
  && echo PASS || echo FAIL
    </automated>
  </verify>

  <done>
- wave-6-tsx-conversion-checklist.md 가 24-checkpoints/ 평면 폴더에 생성됨
- 12 섹션 헤더 (§1~§12) 모두 존재
- OQ LOCKED 6건 verbatim 인용
- 4 sketch HTML grep 추출 fence ≥8 (4 open + 4 close)
- 메모리 룰 unique slug ≥10
- negative gate ≥17 / verify gate ≥22
- src/** 변경 0 byte (git diff 검증 PASS)
- atomic commit 1개 + 산출 markdown ~450~550 lines 예상
  </done>
</task>

</tasks>

<verification>
- 산출 단일 파일 확인: `ls cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md`
- 12 섹션 헤더: `grep -cE '^## §' wave-6-*.md` = 12
- OQ LOCKED 6건: `grep -cE '^- \*\*OQ #[1-6]' wave-6-*.md` = 6
- 비즈 anchor ≥10 (§4 row ≥20): `grep -cE '^[0-9]+\. ' wave-6-*.md` ≥ 20
- 4 sketch fence ≥8: `grep -c '^```' wave-6-*.md` ≥ 8
- 메모리 룰 unique slug ≥10: `grep -oE '(feedback|project|reference)_[a-z_]+' wave-6-*.md | sort -u | wc -l` ≥ 10
- negative gate ≥17: `grep -cE '^- \([0-9]+\)' wave-6-*.md` ≥ 17
- verify gate ≥22: `grep -cE '^[0-9]+\. ' wave-6-*.md` ≥ 22
- src/** 변경 0: `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/` = 빈 결과
- App.tsx 변경 0: `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/App.tsx` = 빈 결과
- 이모지 0 (메타 코멘트 포함): `LC_ALL=C grep -P '[\x{1F300}-\x{1FAFF}]' wave-6-*.md` = 0 hits
- wrangler 0 / npm run deploy 0: `grep -cE 'wrangler|npm run deploy' wave-6-*.md` = 0
- 누적 commit: `git log --oneline origin/main..HEAD | wc -l` ≥ 2 (PLAN 1 + W6 산출 1 [+SUMMARY 1 별도 commit])
</verification>

<success_criteria>
- TSX 변환 wave 진입 시 executor 가 wave-6-tsx-conversion-checklist.md 1 파일만 읽어도 12 섹션 / 비즈 anchor / OQ / sketch class / 폰트 매트릭스 / Lucide 매핑 / Tailwind cheatsheet / negative+verify gate 모두 파악 가능
- src/** 0 byte 변경 강제 (markdown only)
- 14-reports (700) / 15-daily-report (934) / 18-worklog (1216) / 23-education (591) / 28-splash 의 단일 atomic 패턴 24-checkpoints 에서 자동 도달
- 24-checkpoints 4i9 (4 단계 자동 도달) 패턴 메모리 박제 시점 도달
</success_criteria>

<output>
After completion, create `.planning/quick/260526-gln-redesign-24-checkpoints-w6-tsx-conversio/260526-gln-SUMMARY.md` (atomic commit 별도)
</output>

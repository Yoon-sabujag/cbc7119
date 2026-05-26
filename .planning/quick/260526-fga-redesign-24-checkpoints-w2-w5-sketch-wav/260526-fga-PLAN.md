---
phase: quick-260526-fga
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html
  - cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html
  - cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html
  - cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html
autonomous: true
requirements:
  - REDESIGN-24-CHECKPOINTS-W2
  - REDESIGN-24-CHECKPOINTS-W3
  - REDESIGN-24-CHECKPOINTS-W4
  - REDESIGN-24-CHECKPOINTS-W5

must_haves:
  truths:
    - "W2 sketch (sketch-wave-2-frame-guard.html) 가 외곽 wrapper + admin 가드 시각 placeholder + <style> keyframes (blink/slideUp) 토큰화를 100~150 lines 으로 시각화 (OQ #4 외곽 hex 토큰 치환)"
    - "W3 sketch (sketch-wave-3-header-filters.html) 가 데스크톱 헤더 (가로 select 220px + filterZone + filterFloor + 카운트 + 개소 추가) + 모바일 헤더 (세로 stack) 분기를 200~280 lines 으로 시각화 (OQ #3+#4+#5+#6)"
    - "W4 sketch (sketch-wave-4-list-fab.html) 가 데스크톱 테이블 7 컬럼 + 모바일 카드 리스트 + 모바일 FAB + skeleton/error/empty 4 상태를 250~340 lines 으로 시각화 (OQ #2+#4+#5+#6)"
    - "W5 sketch (sketch-wave-5-modal-form.html) 가 BottomSheet/DesktopModal wrapper + 등록 폼 6 필드 + 소화기 7 필드 분기 + 비활성화 confirm 을 280~400 lines 으로 시각화 (OQ #1+#2+#4+#5+#6)"
    - "4 sketch 모두 평면 sibling (24-checkpoints/sketch-wave-N-*.html, sketch/ 서브폴더 X) 으로 배치"
    - "4 sketch 어디에도 src/** / components.css / App.tsx 비즈 anchor 1 byte 변경 X"
    - "4 sketch 어디에도 fontSize 9/10/11 인라인 0건 + linear-gradient 0건 + 이모지 0건 + status- prefix 0건"
    - "4 sketch 각각에 비즈 anchor 주석 (CheckpointsPage.tsx line 범위 인용) ≥1건"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html"
      provides: "W2 외곽 wrapper + admin 가드 + keyframes 토큰화 sketch"
      min_lines: 100
    - path: "cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html"
      provides: "W3 헤더 (카테고리 + 필터 select) 모바일/데스크톱 분기 sketch"
      min_lines: 200
    - path: "cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html"
      provides: "W4 콘텐츠 (테이블 + 카드 + FAB + 4 상태) sketch"
      min_lines: 250
    - path: "cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html"
      provides: "W5 모달 (BottomSheet/DesktopModal) + 폼 (6+7 필드) + 비활성화 sketch"
      min_lines: 280
  key_links:
    - from: "sketch-wave-2-frame-guard.html"
      to: "wave-1-index.md §1.1 sub-area 1 (line 438~440 / 501 / 507~513)"
      via: "verbatim 인용 (재서술 X) — wave-1-index.md §2.1 W2 row"
      pattern: "wave-1-index"
    - from: "sketch-wave-3-header-filters.html"
      to: "wave-1-index.md §1.1 sub-area 2 (line 516~582)"
      via: "verbatim 인용 — wave-1-index.md §2.1 W3 row"
      pattern: "wave-1-index"
    - from: "sketch-wave-4-list-fab.html"
      to: "wave-1-index.md §1.1 sub-area 3 (line 585~683) + CheckPointCard (401~419) + SKELETON (422~425)"
      via: "verbatim 인용 — wave-1-index.md §2.1 W4 row"
      pattern: "wave-1-index"
    - from: "sketch-wave-5-modal-form.html"
      to: "wave-1-index.md §1.1 sub-area 4+5 (line 40~74 + 77~398 + 685~690)"
      via: "verbatim 인용 — wave-1-index.md §2.1 W5 row"
      pattern: "wave-1-index"
    - from: "4 atomic commit"
      to: "main branch (W1 인덱스 712131a 후속)"
      via: "1 task = 1 commit, 최종 SUMMARY commit 별도"
      pattern: "atomic"
---

<objective>
redesign/24-checkpoints W2~W5 sketch waves 4 atomic.

Purpose: CheckpointsPage.tsx (693 lines, admin 전용) 5 sub-area 를 4 개 sketch HTML 로 시각화. wave-1-index.md §2.1 sub-wave 표 그대로 mirror (W2 외곽+가드 / W3 헤더 / W4 콘텐츠+FAB / W5 모달+폼).

Output: 4 sketch HTML (평면 sibling) + 4 atomic git commit.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md

**단일 진입점 룰 (mbr/9yw precedent):**
- wave-1-index.md 1개만 읽으면 모든 룰/인벤토리/sub-wave 분배/OQ default 6건 박제됨 (622 lines).
- 본 PLAN 은 task 박스만 가지고, wave-1-index.md §1·§2·§3·§4·§5·§6·§7 verbatim 재서술 금지.
- 각 task action 은 §2.1 의 "영역 / 라인 범위 / 비즈 anchor / OQ #" 박제만.

**Negative gate (4 task 공통):**
- `git diff --name-only HEAD~4 HEAD -- cha-bio-safety/src` → 빈 출력 (src 손대지 않음)
- `git diff --name-only HEAD~4 HEAD -- cha-bio-safety/src/styles/components.css` → 빈 출력
- `git diff --name-only HEAD~4 HEAD -- cha-bio-safety/src/App.tsx` → 빈 출력
- `grep -rE 'wrangler|npm run deploy' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-*.html` → 빈 출력 (CLAUDE.local.md 디자인 워크트리 룰)

**OQ default LOCKED (wave-1-index.md §7):**
- OQ #1: BottomSheet/DesktopModal 인라인 보존 (StaffManagePage 공통화는 별도 task)
- OQ #2: CTA 버튼 단색 `--accent-primary` 유지 (§6.4 그라데이션 미적용)
- OQ #3: zone button row 유지 + fontSize 11 → 12 (`text-caption`) 격상
- OQ #4: 외곽 hex 토큰 치환 (`--bg`→`--surface-page` / `--bg2`→`--surface-raised` / `--bg3`→`--surface-sunken` / `--bg4`→`--surface-active` / `--bd`→`--border-default` / `--bd2`→`--border-strong` / `--t1/--t2/--t3`→`--text-primary/--secondary/--tertiary` / `--acl`→`--accent-primary` / `--safe`→`--status-safe-bar` / `--danger`→`--status-danger`)
- OQ #5: fontSize 9/10/11 → `text-caption` (12px) 일률 격상 + 작은 영역 `leading-none`
- OQ #6: IconPlus / IconChevronDown SVG → Lucide `<Plus />` / `<ChevronDown />` (size 16/18 보존, size 14 → 16 격상)

**OQ # 분포 (task 별):**
- W2 = OQ #4 (외곽 hex 토큰 치환)
- W3 = OQ #3 + OQ #4 + OQ #5 + OQ #6
- W4 = OQ #2 + OQ #4 + OQ #5 + OQ #6
- W5 = OQ #1 + OQ #2 + OQ #4 + OQ #5 + OQ #6

**메모리 룰 slug (wave-1-index.md §5 박제, 재서술 X):**
- feedback_design_sketch_first / feedback_design_changes_ask_first / feedback_redesign_sketch_rule_enforcement
- feedback_sketch_realistic_data / feedback_tsx_wave_stat_card_drift / feedback_planner_prompt_sketch_verbatim
- feedback_tailwind_token_class_pattern / feedback_tailwind_w8_h8_is_48px / feedback_text_caption_leading_none
- feedback_avoid_premature_confirmation / project_redesign_15_daily_report_status / feedback_cbc7119_design_never_wrangler

**비즈 anchor 박제 (4 sketch 공통 — 디자인만 손댐, 1 byte X):**
- CATEGORIES_FALLBACK 19종 (line 29~34)
- ZONE_LABEL (line 35~37) / ZONE_FLOORS (line 94~98) / FLOOR_ORDER 20건 (line 492) / MARKER_TYPE_LABEL 6건 (line 462~464) / FLOOR_CODE 8건 (line 465)
- admin 가드 useEffect + early return (line 438~440 / 501)
- React Query queryKey 6건 + invalidate (line 126/443/450/457/190/221/241)
- useMutation 3건 (create/update/deactivate, line 165~247) + 'basement'='common' eq 헬퍼 (line 481~484)
- 유도등 (FPM-) 분기 + 소화기 (isExtCategory) 분기 + 카피 verbatim 8건 + placeholder 9건 + toast 카피 7건
- BottomSheet/DesktopModal 함수 (line 40~74) + ModalWrapper = isDesktop ? DesktopModal : BottomSheet (line 503)
- CheckPointCard (line 401~419, 8x8 dot + 9px 배지 → §1.1 위반 격상 대상)
- SKELETON_STYLE (line 422~425, height 64 + blink 2s)
</context>

<tasks>

<task type="auto">
  <name>T1: sketch-wave-2-frame-guard.html (외곽 wrapper + admin 가드 + keyframes)</name>
  <files>cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html</files>
  <action>
CheckpointsPage.tsx line 438~440 / 501 / 507~513 (외곽 wrapper + admin 가드 useEffect + early return + `<style>` keyframes blink/slideUp) sketch HTML 단일 파일 산출. 라인 추정 100~150.

**영역 (wave-1-index.md §2.1 W2 row + §1.1 sub-area 1 verbatim 인용 — executor 가 wave-1-index.md 직접 grep):**
- 외곽 wrapper `flex column / bg var(--bg) / height 100% / overflow hidden` (line 507)
- `<style>` 태그 keyframes (blink + slideUp + input/select focus border-color, line 508~513)
- admin 가드 visual placeholder (`me?.role !== 'admin'` early return — line 438~440 / 501) — 빈 화면 + redirect 메타

**Frame 권장 3~4:**
- Frame A: 외곽 wrapper default — bg `--bg` → `--surface-page` 치환 시각 + height 100% + overflow hidden
- Frame B: admin 가드 발동 시 (`me?.role !== 'admin'`) — 빈 wrapper + redirect 메타 코멘트 (`navigate('/dashboard', { replace: true })`)
- Frame C: keyframes 시각화 — blink 2s ease-in-out infinite (skeleton 미리보기) + slideUp 0.28s ease-out (BottomSheet 진입 미리보기)
- Frame D (선택): focus border-color `var(--acl)` → `--accent-primary` (input/select 포커스 ring 시각)

**OQ # anchor 박스 (이 sketch 적용):**
```
<!-- OQ #4: 외곽 hex 토큰 치환 — --bg→--surface-page / --bg2→--surface-raised / --bg3→--surface-sunken / --bd→--border-default / --t1→--text-primary / --acl→--accent-primary / --safe→--status-safe-bar / --danger→--status-danger -->
```

**비즈 anchor 주석 (시안 안 메타 코멘트, ≥1건):**
```
<!-- 비즈 anchor (CheckpointsPage.tsx, 1 byte X):
     - admin 가드 useEffect (line 438~440): if (me?.role !== 'admin') navigate('/dashboard', { replace: true })
     - early return (line 501): if (me?.role !== 'admin') return null
     - 외곽 wrapper (line 507): style={{ display:'flex', flexDirection:'column', background:'var(--bg)', height:'100%', overflow:'hidden' }}
     - keyframes (line 508~513): blink + slideUp + input/select focus border-color var(--acl)
-->
```

**Negative gate (positive gate 6건):**
- linear-gradient 0건
- 이모지 0건 (`grep -cP '[\x{1F300}-\x{1F6FF}\x{2600}-\x{27BF}]'` == 0)
- fontSize 9/10/11 인라인 0건
- `status-` prefix 0건 (memory `feedback_tailwind_token_class_pattern` — `text-safe-bar` O / `text-status-safe-bar` X)
- OQ # anchor ≥1건
- 비즈 anchor 주석 ≥1건

산출 후 commit:
```
git commit -m "docs(24-checkpoints): sketch wave 2 — frame guard sub-wave HTML"
```
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html && wc -l cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html | awk '{exit !($1>=100)}' && grep -cE 'linear-gradient' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html | awk '{exit !($1==0)}' && grep -cP '[\x{1F300}-\x{1F6FF}\x{2600}-\x{27BF}]' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html | awk '{exit !($1==0)}' && grep -cE 'fontSize:\s*(9|10|11)px|text-\[(9|10|11)px\]|font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html | awk '{exit !($1==0)}' && grep -cE 'status-(safe|danger|info|warn|fire)-bar|text-status-|bg-status-' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html | awk '{exit !($1==0)}' && grep -c 'OQ #4' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html | awk '{exit !($1>=1)}' && grep -ciE '비즈 anchor|CheckpointsPage' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-frame-guard.html | awk '{exit !($1>=1)}' && git log -1 --pretty=%s | grep -qE 'sketch wave 2|W2 sketch'</automated>
  </verify>
  <done>sketch-wave-2 HTML ≥100 lines + linear-gradient 0 + 이모지 0 + 9·10·11px 0 + `status-` prefix 0 + OQ #4 anchor ≥1 + 비즈 anchor 주석 ≥1 + atomic commit 1건</done>
</task>

<task type="auto">
  <name>T2: sketch-wave-3-header-filters.html (헤더 카테고리+필터 select 모바일/데스크톱 분기)</name>
  <files>cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html</files>
  <action>
CheckpointsPage.tsx line 516~582 (헤더 모바일/데스크톱 분기) sketch HTML 단일 파일 산출. 라인 추정 200~280.

**영역 (wave-1-index.md §2.1 W3 row + §1.1 sub-area 2 verbatim 인용):**
- 데스크톱 헤더 (line 516~551) — flex row / gap 12 / padding 12px 24px / borderBottom var(--bd) / 카테고리 select 220px + filterZone select + filterFloor select + 개소 카운트 + Plus 16 + '개소 추가' button
- 모바일 헤더 (line 552~582) — flex column / padding 12px 16px / gap 8 / 카테고리 select 풀폭 + 조건부 filterZone/filterFloor row + 개소 카운트
- filterZone / filterFloor / cpList 카운트 라벨 (531~541, 566~578)

**Frame 권장 3~4:**
- Frame A: 데스크톱 헤더 default — 카테고리 select 220px + filterZone (전체 구역/사무동/연구동/지하) + filterFloor (availableFloors) + 카운트 (예 "12 개소") + 데스크톱 개소 추가 button (`bg var(--acl)` → `--accent-primary` solid, Plus 16, '개소 추가')
- Frame B: 데스크톱 헤더 카테고리 미선택 — filterZone/Floor 숨김 + 카운트 '전체 (카테고리 선택)'
- Frame C: 모바일 헤더 default — column stack, 카테고리 select 풀폭 + 카테고리 선택 시 filterZone+filterFloor row + 카운트
- Frame D (선택): 모바일 헤더 카테고리 미선택 — 카테고리 select 만 + 카운트 라벨 안내

**OQ # anchor 박스 (이 sketch 적용):**
```
<!-- OQ #3: filter zone select 의 폰트 12+ 격상 (현 fontSize 11 → text-caption 12, leading-none) -->
<!-- OQ #4: 외곽 hex 토큰 치환 (--bd→--border-default / --bg3→--surface-sunken / --acl→--accent-primary / --t2→--text-secondary) -->
<!-- OQ #5: filterZone/Floor select fontSize 11 (line 567/574/578) → text-caption (12px) 일률 격상 + leading-none -->
<!-- OQ #6: IconChevronDown SVG (line 528 size=14, 561 size=16) → lucide <ChevronDown size={16} /> (size 14 → 16 격상) + IconPlus (548 size=16) → lucide <Plus size={16} /> -->
```

**비즈 anchor 주석 (≥1건):**
```
<!-- 비즈 anchor (CheckpointsPage.tsx, 1 byte X):
     - 데스크톱 헤더 (line 516~551): isDesktop && (...) / 카테고리 select 220px / filterZone select / filterFloor select / 개소 카운트 / Plus 16 button
     - 모바일 헤더 (line 552~582): !isDesktop && (...) / column stack / 조건부 filterZone+filterFloor row
     - CATEGORIES_FALLBACK 19종 option (line 29~34) — 순서/값 변경 금지
     - ZONE_LABEL { office:'사무동', research:'연구동', basement:'지하' } (line 35~37) — verbatim
     - availableFloors 계산 (line 492~499) + 'basement'='common' eq() 헬퍼 (line 481~484)
     - select option verbatim: '전체 (카테고리 선택)' / '전체 구역' / '전체 층' / '사무동' / '연구동' / '지하'
     - 데스크톱 개소 추가 button (line 546~550): onClick={() => setModal({open:true,mode:'add'})}, bg var(--acl)
-->
```

**Negative gate (6건):**
- linear-gradient 0건
- 이모지 0건
- fontSize 9/10/11 인라인 0건 (OQ #5 격상 — fontSize 11 → 12 모두 치환)
- `status-` prefix 0건
- OQ # anchor ≥1건 (실제 4건 — #3+#4+#5+#6)
- 비즈 anchor 주석 ≥1건

산출 후 commit:
```
git commit -m "docs(24-checkpoints): sketch wave 3 — header filters sub-wave HTML"
```
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html && wc -l cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html | awk '{exit !($1>=200)}' && grep -cE 'linear-gradient' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html | awk '{exit !($1==0)}' && grep -cP '[\x{1F300}-\x{1F6FF}\x{2600}-\x{27BF}]' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html | awk '{exit !($1==0)}' && grep -cE 'fontSize:\s*(9|10|11)px|text-\[(9|10|11)px\]|font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html | awk '{exit !($1==0)}' && grep -cE 'status-(safe|danger|info|warn|fire)-bar|text-status-|bg-status-' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html | awk '{exit !($1==0)}' && grep -cE 'OQ #(3|4|5|6)' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html | awk '{exit !($1>=4)}' && grep -ciE '비즈 anchor|CheckpointsPage' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-header-filters.html | awk '{exit !($1>=1)}' && git log -1 --pretty=%s | grep -qE 'sketch wave 3|W3 sketch'</automated>
  </verify>
  <done>sketch-wave-3 HTML ≥200 lines + linear-gradient 0 + 이모지 0 + 9·10·11px 0 + `status-` prefix 0 + OQ #3+#4+#5+#6 anchor ≥4 + 비즈 anchor 주석 ≥1 + atomic commit 1건</done>
</task>

<task type="auto">
  <name>T3: sketch-wave-4-list-fab.html (콘텐츠 — 데스크톱 테이블 + 모바일 카드 + FAB + 4 상태)</name>
  <files>cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html</files>
  <action>
CheckpointsPage.tsx line 585~683 (콘텐츠) + 401~419 (CheckPointCard) + 422~425 (SKELETON_STYLE) sketch HTML 단일 파일 산출. 라인 추정 250~340.

**영역 (wave-1-index.md §2.1 W4 row + §1.1 sub-area 3 verbatim 인용):**
- 콘텐츠 wrapper (`flex 1 / overflow auto / minHeight 0`, line 585)
- 4 상태: 카테고리 미선택 empty (588) / skeleton 3개 (591~597, height 64 blink) / 에러 (598~602) / 데이터
- 데스크톱 테이블 7 컬럼 (604~656) — 개소명/카테고리/구역/층/위치번호/상태/액션 + row hover bg + 데이터 empty (620~622)
- 모바일 카드 리스트 (CheckPointCard 401~419, 8x8 dot + location + 카테고리 badge + zone·floor 메타 + '수정 ▸')
- 모바일 카드 empty (661~666)
- 모바일 FAB (674~683, sticky bottom + bg var(--acl) + Plus 18 + '개소 추가' + paddingBottom calc(16+var(--sab)))

**Frame 권장 4~5:**
- Frame A: 데스크톱 테이블 default — 7 컬럼 head + 3~5 row data (locationNo JetBrains Mono + 카테고리 badge bg `rgba(59,130,246,.13)` → `status-info-bg` 알리아스 + '활성' status w/dot 8x8 — memory `feedback_tailwind_w8_h8_is_48px` arbitrary `w-[8px]`)
- Frame B: 데스크톱 테이블 4 상태 — skeleton 3 row (height 64 blink animation) + error (`'데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요'`) + empty (`'해당 카테고리에 개소가 없습니다'` colSpan 7) + 카테고리 미선택 (`'카테고리를 선택하면 개소 목록이 표시됩니다'`)
- Frame C: 모바일 카드 리스트 default — 3~4 CheckPointCard (8x8 dot bg `--status-safe-bar` / 비활성 `--text-tertiary` opacity 0.45 + location + 배지 fontSize 9 → 12 (OQ #5) + zone·floor 메타 + '수정 ▸' leading-none — memory `feedback_text_caption_leading_none`)
- Frame D: 모바일 카드 empty + FAB — 빈 안내 ('개소 추가 버튼을 눌러 점검 개소를 등록하세요') + sticky FAB bg `--accent-primary` solid + Plus 18 + paddingBottom safe-area
- Frame E (선택): 모바일 카드 비활성 (cp.isActive===0, opacity 0.45)

**OQ # anchor 박스 (이 sketch 적용):**
```
<!-- OQ #2: 모바일 FAB / 데스크톱 개소 추가 CTA 단색 --accent-primary 유지 (§6.4 그라데이션 미적용) -->
<!-- OQ #4: 외곽 hex 토큰 치환 (--bg2→--surface-raised / --bg3→--surface-sunken / --t1/t2/t3→--text-primary/secondary/tertiary / --safe→--status-safe-bar / --acl→--accent-primary) -->
<!-- OQ #5: 카테고리 배지 fontSize 9 (line 408) / 10 (line 632) / 11 (status line 641) / 카드 메타 12 → text-caption 일률 격상 + leading-none -->
<!-- OQ #6: IconPlus SVG (FAB line 679 size=18 / 데스크톱 line 548 size=16) → lucide <Plus size={20} /> (FAB §7.1 격상) / <Plus size={16} /> (데스크톱) -->
```

**비즈 anchor 주석 (≥1건):**
```
<!-- 비즈 anchor (CheckpointsPage.tsx, 1 byte X):
     - 콘텐츠 wrapper (line 585): flex 1 / overflow auto / minHeight 0
     - 4 상태 분기: selectedCategory==='' empty (588) / isLoading skeleton (591~597) / isError !isLoading error (598~602) / cpList.map data (604~671)
     - 데스크톱 테이블 7 컬럼 (604~656): th '개소명/카테고리/구역/층/위치번호/상태/액션' + row hover e.currentTarget.style.background='var(--bg3)' (line 627~628) → hover:bg-surface-sunken
     - CheckPointCard (line 401~419): onClick edit / 8x8 dot bg var(--safe) (cp.isActive!==0) / var(--t3) (비활성 opacity 0.45) / category badge 9px (line 408) → 12 격상 / '수정 ▸' (line 416)
     - SKELETON_STYLE (line 422~425): bg var(--bg3) / radius 12 / height 64 / animation 'blink 2s ease-in-out infinite'
     - 모바일 FAB (line 674~683): position sticky / bottom 0 / bg var(--acl) / Plus 18 / '개소 추가' / paddingBottom 'calc(16px + var(--sab))' (iOS safe-area, memory `feedback_bottomnav_gap_style` 친척)
     - locationNo 폰트 JetBrains Mono (테이블 line 별, source preserve)
     - 카피 verbatim 4건: '카테고리를 선택하면 개소 목록이 표시됩니다' (588) / '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요' (600) / '해당 카테고리에 개소가 없습니다' (621/663) / '개소 추가 버튼을 눌러 점검 개소를 등록하세요' (664) / '개소 추가' (548/679)
-->
```

**Negative gate (6건):**
- linear-gradient 0건
- 이모지 0건
- fontSize 9/10/11 인라인 0건 (OQ #5 격상 적용 — 9→12 / 10→12 / 11→12)
- `status-` prefix 0건
- OQ # anchor ≥1건 (실제 4건)
- 비즈 anchor 주석 ≥1건

산출 후 commit:
```
git commit -m "docs(24-checkpoints): sketch wave 4 — list FAB sub-wave HTML"
```
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html && wc -l cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html | awk '{exit !($1>=250)}' && grep -cE 'linear-gradient' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html | awk '{exit !($1==0)}' && grep -cP '[\x{1F300}-\x{1F6FF}\x{2600}-\x{27BF}]' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html | awk '{exit !($1==0)}' && grep -cE 'fontSize:\s*(9|10|11)px|text-\[(9|10|11)px\]|font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html | awk '{exit !($1==0)}' && grep -cE 'status-(safe|danger|info|warn|fire)-bar|text-status-|bg-status-' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html | awk '{exit !($1==0)}' && grep -cE 'OQ #(2|4|5|6)' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html | awk '{exit !($1>=4)}' && grep -ciE '비즈 anchor|CheckpointsPage' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-list-fab.html | awk '{exit !($1>=1)}' && git log -1 --pretty=%s | grep -qE 'sketch wave 4|W4 sketch'</automated>
  </verify>
  <done>sketch-wave-4 HTML ≥250 lines + linear-gradient 0 + 이모지 0 + 9·10·11px 0 + `status-` prefix 0 + OQ #2+#4+#5+#6 anchor ≥4 + 비즈 anchor 주석 ≥1 + atomic commit 1건</done>
</task>

<task type="auto">
  <name>T4: sketch-wave-5-modal-form.html (BottomSheet/DesktopModal + 폼 6+7 필드 + 비활성화)</name>
  <files>cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html</files>
  <action>
CheckpointsPage.tsx line 40~74 (BottomSheet + DesktopModal 함수) + 77~398 (CheckPointModalContent — INPUT_STYLE 상수 / 폼 6 필드 / 소화기 7 필드 분기 / canSave + isBusy / 비활성화 confirm) + 685~690 (모달 호출 wrapper) sketch HTML 단일 파일 산출. 라인 추정 280~400.

**영역 (wave-1-index.md §2.1 W5 row + §1.1 sub-area 4+5 verbatim 인용):**
- BottomSheet 함수 (40~57) — overlay rgba(0,0,0,0.6) + bg var(--bg2) + radius 16/16/0/0 + slideUp 0.28s + maxHeight 90vh + handle bar 32x4
- DesktopModal 함수 (60~74) — overlay rgba(0,0,0,0.5) + bg var(--bg2) + radius 12 + width 440 + maxHeight 85vh + boxShadow
- 모달 호출 wrapper (685~690) — `{modal.open && <ModalWrapper title={mode==='add'?'개소 추가':'개소 수정'}>...</ModalWrapper>}`
- INPUT_STYLE + LABEL_STYLE 상수 (77~84) — height 44 / bg var(--bg3) / radius 8 / padding 0 12 / fontSize 14
- 폼 필드 6건: 카테고리 select (268~273) / zone button row (275~284, fontSize 11 → 12 OQ #3) / 층 select (285~295, form.zone 채워졌을 때만) / 개소명 input (348~351) / 위치번호 input (352~357, 비-소화기만) / 설명 input (358~363, 비-소화기만)
- 소화기 (isExtCategory) 분기 추가 폼 7 필드 (296~347) — 종류 select + manufacturer / manufactured_at / approval_no / prefix_code / seal_no / serial_no input + placeholder verbatim
- 액션 row (366~395) — 취소 / 저장 button (canSave + isBusy) + edit 시 비활성화 button + confirmDeactivate 시 빨간 안내 박스 + 빨간 비활성화 버튼

**Frame 권장 4~5:**
- Frame A: BottomSheet (모바일) wrapper + 등록 폼 default — handle bar 32x4 + title '개소 추가' + 카테고리 select + zone button row 3 (사무동/연구동/지하, height 36 + fontSize 12 OQ #3) + 층 select + 개소명 input + 위치번호 + 설명
- Frame B: DesktopModal (데스크톱) wrapper + 동일 폼 — width 440 + radius 12 + boxShadow + bg `--surface-raised`
- Frame C: 소화기 (isExtCategory) 분기 폼 — 카테고리 '소화기' 선택 시 7 필드 추가 (종류 select '분말 20kg/분말 3.3kg/할로겐/K급' + 6 input placeholder verbatim '예: 한울방재' / '예: 2024-04 (YYYY-MM)' / '예: 수소10-19-11' / '예: BEQV' / '예: 72605' / '예: 68605') + 위치번호/설명 input 숨김 (비-소화기만)
- Frame D: edit 모드 + 비활성화 confirm — 액션 row 좌측 '비활성화' button (빨간) + 우측 취소/저장 + confirmDeactivate=true 시 빨간 안내 박스 '이 개소를 비활성화합니다. 기존 점검 기록은 보존됩니다.'
- Frame E (선택): canSave=false 또는 isBusy 시 저장 button disabled state (bg `--surface-sunken` text `--text-tertiary`)

**OQ # anchor 박스 (이 sketch 적용 — 모달 wave 최대 5건):**
```
<!-- OQ #1: BottomSheet/DesktopModal 인라인 보존 (StaffManagePage 공통화는 별도 task, 이 wave 박제만) -->
<!-- OQ #2: 저장 button + 비활성화 button 단색 (저장=--accent-primary, 비활성화=--status-danger, §6.4 그라데이션 미적용) -->
<!-- OQ #4: 모달 hex 토큰 치환 (--bg2→--surface-raised / --bg3→--surface-sunken / --bg4→--surface-active / --bd2→--border-strong / --t1→--text-primary / --acl→--accent-primary / --danger→--status-danger / overlay rgba 직접 유지 OK) -->
<!-- OQ #5: zone button fontSize 11 (line 282) / 카테고리 select 14 / textarea 14 → text-caption (12) 격상 (zone button) + 나머지 text-body 또는 text-body-sm 유지 -->
<!-- OQ #6: 모달 안 inline SVG 없음 (Plus/ChevronDown 외 — 변경 없음) — 단, action button 라벨 텍스트만 (lucide 추가 없음) -->
```

**비즈 anchor 주석 (≥1건, 모달 wave 가장 무거움):**
```
<!-- 비즈 anchor (CheckpointsPage.tsx, 1 byte X):
     - BottomSheet (line 40~57): overlay position fixed inset 0 / bg rgba(0,0,0,0.6) / zIndex 50 / flex column / justifyContent flex-end / panel bg var(--bg2) borderRadius 16/16/0/0 / animation 'slideUp 0.28s ease-out both' / maxHeight 90vh / handle bar 32x4 paddingTop 12 / title 16/700/var(--t1) padding '12px 16px 0' / backdrop click close (e.target === e.currentTarget)
     - DesktopModal (line 60~74): overlay bg rgba(0,0,0,0.5) / panel borderRadius 12 / width 440 / maxHeight 85vh / boxShadow '0 8px 32px rgba(0,0,0,.18)' / title padding '20px 24px 0'
     - ModalWrapper = isDesktop ? DesktopModal : BottomSheet (line 503) — useIsDesktop 훅 분기
     - INPUT_STYLE (line 77~83): width 100% / height 44 / padding '0 12px' / fontSize 14 / bg var(--bg3) / border 1px solid var(--bd) / borderRadius 8 / color var(--t1) / boxSizing border-box / outline none
     - 폼 필드 6 (line 268~363): category select (CATEGORIES_FALLBACK 19종) / zone button row 'office'|'research'|'basement' (line 277, height 36 fontSize 11 → 12 OQ #3) / floor select (ZONE_FLOORS 분기) / location input '1층 로비 소화기' / locationNo '001 (선택)' / description '메모 (선택)'
     - 소화기 (isExtCategory = form.category === '소화기') 분기 (line 296~347): 종류 select '분말 20kg'/'분말 3.3kg'/'할로겐'/'K급' (304~307) + 6 input placeholder verbatim '예: 한울방재' / '예: 2024-04 (YYYY-MM)' / '예: 수소10-19-11' / '예: BEQV' / '예: 72605' / '예: 68605'
     - canSave (line 249~252): form.location.trim() !== '' && form.category !== '' && (!isExtCategory || (extForm.type !== '' && form.zone !== '' && form.floor !== ''))
     - isBusy = createMutation.isPending || updateMutation.isPending
     - createMutation (165~200): isExtCategory ? extinguisherApi.create + zoneMap {research:'연',office:'사',common:'공'} : checkPointApi.create + id=`cp_${Date.now()}` + qrCode=`QR-${id}` / toast '소화기 등록 완료 ({mgmtNo})' or '개소가 추가되었습니다' / onError '저장에 실패했습니다. 입력값을 확인해 주세요'
     - updateMutation (206~227): isMarker = cp.id.startsWith('FPM-') ? floorPlanMarkerApi.update({label,description,zone}) : checkPointApi.update / toast '개소 정보가 수정되었습니다'
     - deactivateMutation (229~247): isMarker ? floorPlanMarkerApi.delete : checkPointApi.update({isActive:0}) / toast '마커가 삭제되었습니다' or '개소가 비활성화되었습니다' / onError '비활성화에 실패했습니다'
     - 액션 row (366~395): '저장' / '취소' / '비활성화' button + '이 개소를 비활성화합니다. 기존 점검 기록은 보존됩니다.' confirmDeactivate 안내 (rgba(239,68,68,.08) bg → --status-danger-bg)
     - 폼 자동 채우기 useEffect (138~160): catCheckPoints filter + lastNo +1 nextNo + `${floor} ${category} ${N+1}번` 패턴 — 1 byte X
-->
```

**Negative gate (6건):**
- linear-gradient 0건 (OQ #2 — 저장 button 단색)
- 이모지 0건
- fontSize 9/10/11 인라인 0건 (OQ #5 — zone button 11 → 12 격상)
- `status-` prefix 0건 (memory `feedback_tailwind_token_class_pattern`)
- OQ # anchor ≥1건 (실제 5건 — #1+#2+#4+#5+#6)
- 비즈 anchor 주석 ≥1건

산출 후 commit (4번째 atomic):
```
git commit -m "docs(24-checkpoints): sketch wave 5 — modal form sub-wave HTML"
```
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html && wc -l cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html | awk '{exit !($1>=280)}' && grep -cE 'linear-gradient' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html | awk '{exit !($1==0)}' && grep -cP '[\x{1F300}-\x{1F6FF}\x{2600}-\x{27BF}]' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html | awk '{exit !($1==0)}' && grep -cE 'fontSize:\s*(9|10|11)px|text-\[(9|10|11)px\]|font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html | awk '{exit !($1==0)}' && grep -cE 'status-(safe|danger|info|warn|fire)-bar|text-status-|bg-status-' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html | awk '{exit !($1==0)}' && grep -cE 'OQ #(1|2|4|5|6)' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html | awk '{exit !($1>=5)}' && grep -ciE '비즈 anchor|CheckpointsPage' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-modal-form.html | awk '{exit !($1>=1)}' && git diff --name-only HEAD~4 HEAD -- cha-bio-safety/src cha-bio-safety/src/styles/components.css cha-bio-safety/src/App.tsx | wc -l | awk '{exit !($1==0)}' && git log --oneline -4 | grep -cE 'sketch wave [2-5]|W[2-5] sketch' | awk '{exit !($1==4)}'</automated>
  </verify>
  <done>sketch-wave-5 HTML ≥280 lines + linear-gradient 0 + 이모지 0 + 9·10·11px 0 + `status-` prefix 0 + OQ #1+#2+#4+#5+#6 anchor ≥5 + 비즈 anchor 주석 ≥1 + src/components.css/App.tsx 4 commit 전체 0 byte + 4 atomic commit (W2~W5) 모두 검출</done>
</task>

</tasks>

<verification>
**전체 phase verify (4 task 완료 후 일괄):**

```bash
# 1. 4 sketch HTML 모두 존재 (평면 sibling, sketch/ 서브폴더 X)
ls cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-{2,3,4,5}-*.html

# 2. 4 atomic commit 검증 (W2~W5 순서)
git log --oneline -4 | grep -cE 'sketch wave [2-5]'   # = 4

# 3. src / components.css / App.tsx 0 byte diff (디자인만 손댐)
git diff --name-only HEAD~4 HEAD -- cha-bio-safety/src                          # 빈 출력
git diff --name-only HEAD~4 HEAD -- cha-bio-safety/src/styles/components.css    # 빈 출력
git diff --name-only HEAD~4 HEAD -- cha-bio-safety/src/App.tsx                  # 빈 출력

# 4. 디자인 워크트리 룰 (wrangler/npm run deploy 흔적 X)
grep -rE 'wrangler|npm run deploy' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-*.html    # 빈 출력

# 5. 9·10·11px 0건 (4 sketch 전체)
for f in cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-{2,3,4,5}-*.html; do
  c=$(grep -cE 'fontSize:\s*(9|10|11)px|text-\[(9|10|11)px\]|font-size:\s*(9|10|11)px' "$f")
  [ "$c" = "0" ] || echo "FAIL: $f has $c bad fontSize"
done

# 6. OQ # anchor 박제 4 sketch 분산 (memory `feedback_planner_prompt_sketch_verbatim`)
grep -c 'OQ #' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-2-*.html    # ≥1 (#4)
grep -c 'OQ #' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-3-*.html    # ≥4 (#3 #4 #5 #6)
grep -c 'OQ #' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-4-*.html    # ≥4 (#2 #4 #5 #6)
grep -c 'OQ #' cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-5-*.html    # ≥5 (#1 #2 #4 #5 #6)

# 7. linear-gradient 0건 + 이모지 0건 + status- prefix 0건 (4 sketch 전체)
for f in cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-{2,3,4,5}-*.html; do
  lg=$(grep -cE 'linear-gradient' "$f")
  em=$(grep -cP '[\x{1F300}-\x{1F6FF}\x{2600}-\x{27BF}]' "$f")
  st=$(grep -cE 'status-(safe|danger|info|warn|fire)-bar|text-status-|bg-status-' "$f")
  [ "$lg$em$st" = "000" ] || echo "FAIL: $f lg=$lg em=$em st=$st"
done
```

**최종 SUMMARY commit (5번째, 본 plan 외 별도 — execute-plan workflow 가 처리):**
```
git commit -m "docs(quick-260526-fga): redesign/24-checkpoints W2~W5 4 sketch waves atomic SUMMARY"
```
</verification>

<success_criteria>
- 4 sketch HTML (sketch-wave-2 / 3 / 4 / 5) 평면 sibling 패턴으로 24-checkpoints/ 폴더에 존재
- 라인 추정 충족: W2 ≥100 / W3 ≥200 / W4 ≥250 / W5 ≥280
- 4 atomic commit (W2 → W3 → W4 → W5 순서) 모두 main 직진 직선 history
- 5번째 SUMMARY commit (별도)
- src / components.css / App.tsx 4 commit 전체 0 byte 변경
- 9·10·11px 0건 (OQ #5 — 9→12, 10→12, 11→12 일률 격상)
- linear-gradient 0건 (OQ #2 — CTA 단색 유지)
- 이모지 0건 (§7.1 — Lucide 통일)
- `status-` prefix 0건 (memory `feedback_tailwind_token_class_pattern`)
- OQ # anchor 분포: W2 ≥1 (#4) / W3 ≥4 (#3#4#5#6) / W4 ≥4 (#2#4#5#6) / W5 ≥5 (#1#2#4#5#6)
- 비즈 anchor 주석 4 sketch 각 ≥1건 (CATEGORIES_FALLBACK 19종 / ZONE_LABEL / ZONE_FLOORS / admin 가드 / queryKey 6 / useMutation 3 / 유도등 분기 / 'basement'='common' eq / canSave / placeholder + toast 카피 verbatim)
- 메모리 슬러그 wave-1-index.md §5 mirror 인용 (재서술 X)
</success_criteria>

<output>
After completion:
- 4 sketch HTML at cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-{2,3,4,5}-*.html
- 4 atomic commit on main (after 712131a W1 인덱스)
- SUMMARY at .planning/quick/260526-fga-redesign-24-checkpoints-w2-w5-sketch-wav/260526-fga-SUMMARY.md (별도 5번째 commit)
</output>

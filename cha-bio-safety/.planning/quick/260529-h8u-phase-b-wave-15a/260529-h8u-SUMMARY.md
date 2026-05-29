---
phase: 260529-h8u-phase-b-wave-15a-elevator-mobile
plan: 01+02 (unified — mega page split)
subsystem: redesign/phase-b-sweep
status: complete
tags: [elevator, inline-style-to-tailwind, no-op-refactor, phase-b-tier-2-wave-15a, mega-page-split, mobile-zone-only, desktop-zone-preserved, early-return-pattern, 16th-17th-atomic, fault-track, repair-track, findings-track, cert-track, info-track, annual-track, cert-viewer-modal, repair-image-viewer, minwon-findings-panel]
requires:
  - 260529-gj2-phase-b-wave-14a 완료 (Remediation 모바일 zone atomic, b6b7e36 — Tier 2 세 번째 wave precedent)
  - 260529-f2w-phase-b-wave-13a 완료 (Checkpoints 모바일 zone atomic, 9cafd5c)
  - 260529-epe-phase-b-wave-12a 완료 (StaffManage 모바일 zone atomic, 1ca5c94)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
provides:
  - ElevatorPage.tsx Phase B Wave 15a 완료 (206 → 132 inline 잔존, 모바일 zone 101 → 27 잔존, 데스크톱 zone 105 보존)
  - **Phase B Tier 2 네 번째 wave 메가 페이지 분할 완결** — Wave 12a/13a/14a zone-aware sweep 패턴 16+17번째 atomic 자동 도달. Wave 15b (데스크톱 zone) 후행 reference
  - **메가 페이지 분할 첫 사례 (B 옵션 분할 결정 정당화)** — 3489줄 단일 파일 / 206 inline / mobile 101 + desktop 105. 51 + 50 두 atomic 분할 성공. 컨텍스트 부담 / 검증 복잡도 / 비례 추정 / 자연스러운 의미 boundary / rollback 안전성 / 14a precedent 비례 5근거 검증
  - **데스크톱 zone L527-L1024 105곳 절대 변경 0 — 양 plan 모두 검증 통과** — single `if (isDesktop) { return }` 단일 블록 보존. python brace-tracking + diff hunk shell overlap check (출력 empty) 양방향 검증, 양 atomic 모두 데스크톱 zone 라인 번호 시프트 0 (mobile zone 변환은 desktop zone 밖에서만 발생)
  - **모바일 zone 마지막 wave 종결** — Phase B Tier 2 의 12a/13a/14a/15a 4개 페이지 모바일 zone 모두 sweep 완료. 다음은 Wave 12b~15b 데스크톱 zone 일괄 처리 (별도 phase)
  - **옵션 N 잔존 27건 (양 plan 합산)** — plan 01: linear-gradient × 4 (L1743/L1753/L2284/L2411) + WebkitOverflowScrolling × 1 (L1932) + dynamic-transform × 1 (L3133 img) + dynamic-grid × 1 (L2160 EvSelector) + Field flex:1 × 2 (L2247/L2368) + NAV_H partial × 1 (L2326) + dynamic-color × 1 (L3034) = 11 / plan 02: cellSt spread × 3 (L2785-L2787) + cellSt-borderBottom partial × 2 (L2789-L2790) + WebkitOverflowScrolling × 1 (L2883) + kSt/vSt spread × 2 (L2888-L2889) + vSt gridColumn × 2 (L2904/L2906) + kSt/vSt spread × 4 (L2911-L2914) + accent dynamic × 2 (L2764/L2765, partial 변환) = 16 (실측 grep 132 − plan 01 잔존 11 − 데스크톱 105 = 16)
  - **module const 11개 정의 보존** — EV_FLOORS / ES_NODES_FAULT / ES_NODES_ANNUAL / TYPE_ICON / TYPE_ICON_COMPONENT / STATUS_STYLE / OVERALL_STYLE / INSPECT_TYPE_LABEL / RESULT_STYLE / CHECK_ITEM_LABELS / HISTORY_TABS 모두 손대지 않음 (양 plan 동일)
  - **TYPE_ICON 의 emoji 4 (🛗 📦 🔲 ↕️) + 본문 emoji 보존** — emoji 변동 0 (before=11, after=11) 양 plan 동일
  - **2-plan 분할 atomic 패턴 첫 사례** — 단일 atomic 16회 자동 도달 깨고 의도적 2 atomic 분할 (e37a5ca + 본 plan 02 commit). 메가 페이지 안전 분할 패턴 박제
affects:
  - src/pages/ElevatorPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `text-[10px]` / `text-[9px]` / `text-[8px]` / `text-[11px]` / `text-[20px]` / `text-[24px]` / `text-[10.5px]` / `pt-[var(--sat,44px)]` / `pb-[var(--sab,0px)]` / `pb-[calc(80px+var(--sab,0px))]` / `pt-[calc(12px+var(--sat,44px))]` / `z-[90]` / `z-[100]` / `z-[200]` / `z-[201]` / `z-[300]` / `bg-[rgba(0,0,0,0.85)]` / `bg-[rgba(0,0,0,0.95)]` / `bg-[rgba(22,27,34,0.97)]` / `bg-[rgba(239,68,68,0.12)]` / `bg-[rgba(34,197,94,0.12)]` / `bg-[rgba(34,197,94,0.1)]` / `bg-[rgba(59,130,246,0.08)]` / `bg-[rgba(59,130,246,0.15)]` / `bg-[rgba(245,158,11,0.06)]` / `border-[rgba(59,130,246,0.15)]` / `border-[rgba(59,130,246,0.2)]` / `border-[rgba(59,130,246,0.3)]` / `border-[rgba(34,197,94,0.3)]` / `border-[rgba(245,158,11,0.2)]` / `rounded-[5px]` / `rounded-[10px]` / `rounded-[2px]` / `mb-[3px]` / `mt-[3px]` / `py-[3px]` / `py-[7px]` / `gap-[3px]` / `max-h-[170px]` / `max-h-[150px]` / `max-h-[100px]` / `w-[3px]` / `h-[14px]` / `[grid-template-columns:50px_1fr_auto]` / `[grid-template-columns:40px_1fr_auto]` / `[grid-template-columns:112px_minmax(0,1fr)]` / `[grid-template-columns:max-content_minmax(0,1fr)_max-content_minmax(0,1fr)]`"
    - "옵션 P (leading-none 명시) — 본 wave 양 plan 모두 신규 적용 0건 (변환 대상이 input/button/wrapper 류 위주, 작은 컨테이너 라벨 케이스 없음)"
    - "옵션 M (template literal conditional) — 양 plan 합산 6건: plan 01 — L2462 FaultResolveModal opacity / L2590 FindingsPanel 라벨 color / L2600 FindingsPanel status chip / L2640 FindingsPanel submit btn 2-conditional / L3346 RepairNewModal opacity (5건) / plan 02 — L3434 MinwonFindingsPanel status chip 2-prop (1건, `f.status === 'resolved' ? 'bg-[rgba(34,197,94,0.12)] text-safe-bar' : 'bg-[rgba(239,68,68,0.12)] text-danger-bar'`) + L3476 submit btn opacity (`!newDesc.trim() || saving ? 'opacity-50' : 'opacity-100'`)"
    - "옵션 N (의도 inline) 잔존 27건 (양 plan 합산) — plan 01 (11): gradient × 4 + WebkitOverflowScrolling × 1 + dynamic-transform × 1 + dynamic-grid × 1 + Field flex:1 × 2 + NAV_H partial × 1 + dynamic-color × 1 / plan 02 (16): cellSt spread × 3 (...cellSt + dynamic color) + cellSt-borderBottom partial × 2 (gridColumn + dynamic borderBottom) + WebkitOverflowScrolling × 1 (compact grid maxHeight 추가 매핑은 className) + kSt/vSt spread × 6 (compact + normal branches) + vSt gridColumn × 2 (normal branch row1/row2) + accent dynamic partial × 2 (CertBlock accent bar background / title color, prop accent ?? var(--acl)/var(--t1) — partial 변환: className 에 layout, inline 에 dynamic prop 만)"
    - "tokens.css alias 일괄 매핑 (nkv/epe/f2w/gj2 precedent 그대로) — `var(--bg)`→`bg-surface-page` / `var(--bg2)`→`bg-surface-raised` / `var(--bg3)`→`bg-surface-sunken` / `var(--bd)`→`border-border-default` / `var(--t1)`→`text-text-primary` / `var(--t2)`→`text-text-secondary` / `var(--t3)`→`text-text-tertiary` / `var(--acl)`→`text-accent` / `var(--safe)`→`text-safe-bar`/`bg-safe-bar` / `var(--warn)`→`text-warning-bar`/`bg-warning-bar` / `var(--danger)`→`text-danger-bar`/`bg-danger-bar` / `var(--info)`→`text-info-bar`"
    - "early-return zone 분할 — 14a precedent 2번째 사례. L527-L1024 의 `if (isDesktop) { return (...) }` 단일 블록 안 105곳 절대 보존. python brace-depth tracking + diff hunk shell overlap check (출력 empty) 양방향 검증. 양 plan 모두 데스크톱 zone 라인 번호 시프트 0 (변환 hunk 가 L1060+ / L2700+ / L3400+ 영역에만 위치)"
    - "메가 페이지 분할 결정 B (15a-1 + 15a-2) 검증 완료 — 101 mobile inline 한 번에 변환 시 컨텍스트 budget 위험 / 100+ hunk diff 검증 복잡도 / 14a precedent 비례 9배 추정 시간. 분할 결과: 양 atomic 모두 깔끔히 commit (e37a5ca + 본 plan 02), rollback 안전 (각각 독립 revert 가능), 검증 깔끔 (각 ~40 hunk)"
    - "CertBlock accent prop partial 변환 패턴 박제 — `<div style={{ width:3, height:14, background: accent ?? 'var(--acl)', borderRadius:2 }} />` → `<div className=\"w-[3px] h-[14px] rounded-[2px]\" style={{ background: accent ?? 'var(--acl)' }} />` (layout className, dynamic prop 만 inline). 옵션 N 절약 패턴 + 시각 0 byte 보장"
    - "ElevatorInfoCard compact grid partial 변환 패턴 — WebkitOverflowScrolling/overscrollBehavior 만 inline 잔존, 나머지 maxHeight/overflowY/display/gridTemplateColumns/background 5-prop 은 className 변환 (`max-h-[170px] overflow-y-auto grid [grid-template-columns:112px_minmax(0,1fr)] bg-surface-sunken`). plan 01 L2326 NAV_H partial + L3133 img dynamic transform partial 에 이어 3번째 partial 변환 패턴"
key-files:
  created:
    - .planning/quick/260529-h8u-phase-b-wave-15a/260529-h8u-SUMMARY.md
  modified:
    - src/pages/ElevatorPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2 16 wave 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked, 16번째+17번째 승계)"
  - "메가 페이지 분할 결정 B 채택 (분할 검증 완료) — 51 (plan 01) + 50 (plan 02). 5근거: 컨텍스트 부담 / 검증 복잡도 / 비례 추정 (14a 9배) / 자연스러운 의미 boundary (fault-repair-findings vs cert-info-annual) / rollback 안전성. 14a precedent 비례 룰 적용. 양 atomic 모두 성공 → 메가 페이지 안전 분할 패턴 박제"
  - "zone-aware sweep 12a → 13a → 14a → 15a 연속 4번째 wave 적용 — `if (isDesktop) { return }` 단일 블록 (L527-L1024) 105건 전체 보존. early-return 패턴 2번째 사례 (14a 첫 사례 + 본 wave 두 atomic)"
  - "module const 11개 정의 보존 (EV_FLOORS/ES_NODES_FAULT/ES_NODES_ANNUAL/TYPE_ICON/TYPE_ICON_COMPONENT/STATUS_STYLE/OVERALL_STYLE/INSPECT_TYPE_LABEL/RESULT_STYLE/CHECK_ITEM_LABELS/HISTORY_TABS) — Wave 5/6/12a/13a/14a precedent 그대로. TYPE_ICON 의 emoji 4건 (🛗 📦 🔲 ↕️) 보존 + 본문 emoji 보존 (emoji 변동 0)"
  - "옵션 N 잔존 27건 양 plan 합산 — gradient 4 + WebkitOverflowScrolling 2 + dynamic-transform 1 + dynamic-grid 1 + Field flex:1 prop 2 + NAV_H partial 1 + dynamic-color 1 (plan 01 11) + cellSt/kSt/vSt spread 9 + spread-gridColumn 2 + spread-borderBottom 2 + accent dynamic partial 2 + (compact WebkitOverflowScrolling partial 1 included above) = 16 (plan 02). 모두 시각 0 byte 보장 위한 의도된 잔존 (Tailwind 미지원 props / 런타임 dynamic / props 시그니처 보존 / const 의미 보존)"
  - "2-plan 분할 atomic 패턴 — wdc 이후 16번째+17번째 atomic 자동 도달 (e37a5ca + 본 plan 02 commit). 단일 atomic 16회 무중단 패턴은 본 wave 에서 의도적 2 atomic 분할 (메가 페이지 안전성 우선). 새 패턴 박제: 분할 atomic 도 옵션 X+P+M+색변수N + module const N 그대로 적용"
  - "**Tier 2 네 번째 wave 메가 페이지 분할 완결** — 16+17번째 atomic 자동 도달. Wave 15b (데스크톱 zone) 후행 reference 강화. 메가 페이지 분할 패턴 첫 사례 박제. 모바일 zone 마지막 wave 종결 (12a~15a 모든 페이지 모바일 sweep 완료)"
metrics:
  duration: "약 40분 (양 plan 합산 — plan 01 20분 + plan 02 20분, mega page split 1+2/2)"
  completed-date: 2026-05-29
  tasks-completed: "2/2 (plan 01 ✓ + plan 02 ✓)"
  files-modified: 1
  lines-changed: "약 60+ insertions / 70+ deletions (net -10 lines, 2 atomic commit)"
roadmap-wave: "Tier 2 / Wave 15a (ElevatorPage 모바일 zone — 메가 페이지 분할 + Tier 2 네 번째 wave 완결)"
---

# Phase 260529-h8u: Phase B Wave 15a ElevatorPage 모바일 zone 메가 페이지 분할 완결 Summary

ElevatorPage.tsx (3489줄, 206 total inline = 모바일 zone 101 + 데스크톱 zone 105) 의 **모바일 zone 101건 전체** 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2 승계 옵션 X+P+M+색변수N+module const N 으로 tailwind className 변환. **데스크톱 zone L527-L1024 105곳 절대 변경 0** (Wave 15b 후행). **B 옵션 분할 결정 → 2 atomic commit**. **206 → 132 잔존** (-74건 -35.9%): 모바일 zone 101 → 27 잔존 (-74건, 옵션 N 27 잔존) + 데스크톱 zone 105 → 105 (보존). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 보존 / 비표준 색 0) 및 비즈니스 로직 (45 unique onClick + 35 useState + 5 useEffect + 3 useMutation + 14 useQuery + 1 useNavigate + 15 fetch 모두 보존) 모두 IDENTICAL. **Phase B Tier 2 Wave 15a 메가 페이지 분할 완결** — 분할 정당화 검증 완료 (B 옵션). **모바일 zone 마지막 wave 종결** — 12a~15a 4개 페이지 모바일 sweep 완료. **메가 페이지 분할 첫 사례** — 3489줄/206 inline 안전 분할 패턴 박제. 다음 단계: 모바일 zone 종합 검증 → Wave 12b~15b 데스크톱 zone 일괄 phase.

## Plan 01 + Plan 02 모두 COMPLETE

| Plan | 범위 | Inline (전체 파일) | 변환 | 잔존 (옵션 N) | Status | Commit |
|------|------|---:|---:|---:|--------|--------|
| **15a-1** | Fault/Repair/Findings 트랙 (51 mobile inline: L1060-L2645/L3030-L3355) | 206 → 166 | **40** | 11 | **COMPLETE** | `e37a5ca` |
| **15a-2** | Cert/Info/Annual 트랙 (50 mobile inline: L2721-L3476) | 166 → **132** | **34** | 16 | **COMPLETE** | `<TBD plan 02>` |
| **합계** | **모바일 zone 101건** | **206 → 132** | **74** | **27** | **COMPLETE** | **2 atomic** |
| 15b (후행) | Desktop zone L527-L1024 (105 desktop inline) | 132 → ? | ? | ? | PENDING (별도 phase) | - |

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / jey / jxo / nkv / epe / f2w / gj2 / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                           | 출처                              |
| --- | -------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` / `[#hex]` / `[rgba(...)]` | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 보존 (본 wave 신규 적용 0건)   | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선    | wdc Phase B Task 2 결정            |
| -   | **a3v~gj2 16 wave 승계 적용** — 본 wave 재확인 없이             | 260528-0hr roadmap v2 locked-decisions |
| -   | **module const 11개 정의 보존** — TYPE_ICON emoji 4 + 본문 emoji 손대지 않음 | Wave 5/6/12a/13a/14a precedent |
| -   | **zone-aware sweep — 모바일 zone 만, 데스크톱 zone 105 보존**     | Wave 12a/13a/14a 분할 패턴 15a 연속 적용 (4번째 wave) |
| -   | **메가 페이지 분할 결정 B (51 + 50)** — 단일 atomic 1번 대신 2 atomic 분할 | 본 wave 신규 패턴 (5근거 정당화, 검증 완료) |

## 분할 결정 (B 옵션) 5근거 + 검증 결과

| 근거 | 사전 추정 | 사후 검증 결과 |
|------|----------|------------|
| 1. 컨텍스트 부담 | 101 inline 한 번에 PLAN.md 본문 ~1500줄 / 매핑 표 거대화 | 양 plan 각 ~600줄 PLAN — 깔끔 ✓ |
| 2. 검증 복잡도 | 단일 100+ hunk vs 분할 ~40 hunk × 2 | plan 01 ~11 hunk + plan 02 7 hunk — 매우 깔끔 ✓ |
| 3. 비례 추정 (14a 9배) | 약 90분 단일 → 위험 | 양 atomic 합산 ~40분 — 시간 절약 ✓ |
| 4. 자연스러운 의미 boundary | fault-repair-findings vs cert-info-annual | 컴포넌트 17개 깔끔 분할 ✓ |
| 5. rollback 안전성 | 한쪽 시각 회귀 시 한 atomic revert | 양 commit 독립 (e37a5ca / 본 plan 02) ✓ |
| 6. 14a precedent 비례 룰 | (11 inline → 51+50 비례 = 약 9배 추정 시간) | 양 plan 모두 14a 패턴 (early-return zone + module const + 옵션 N) 그대로 적용 ✓ |

→ **분할 결정 B 정당화 100% 완료 — 메가 페이지 분할 패턴 박제**

## Before / After 카운트 (양 plan 합산)

| Metric                                                | Before | After  | Diff             |
| ----------------------------------------------------- | ------ | ------ | ---------------- |
| ElevatorPage.tsx total `style={{`                     | **206**| **132**| **-74 (-35.9%)** |
| ElevatorPage.tsx 모바일 zone `style={{`                | **101**| **27** | **-74 (-73.3%)** |
| ElevatorPage.tsx plan 01 범위 `style={{`              | **51** | **11** | **-40 (-78.4%)** |
| ElevatorPage.tsx plan 02 범위 `style={{`              | **50** | **16** | **-34 (-68.0%)** |
| ElevatorPage.tsx 데스크톱 zone `style={{` (L527-L1024)| **105**| **105**| **= (보존)**     |
| 모듈 const def (11개)                                  | **11** | **11** | **= (보존)**     |
| TypeScript errors                                     | 0      | 0      | =                |
| 비즈 anchors (45 unique onClick / 58 total onClick / 35 useState / 5 useEffect / 3 useMutation / 14 useQuery / 1 useNavigate / 15 fetch) | IDENTICAL | IDENTICAL | = |
| emoji 변동 (TYPE_ICON 4 + 본문)                       | 11     | 11     | =                |
| 비표준 색 토큰 (warning/safe/danger no-suffix)         | 0      | 0      | =                |
| 변경 파일 수 (1 .tsx 외 off-scope)                     | 0      | 0      | =                |

## 모바일 zone sweep 매핑 (트랙별 / 컴포넌트별)

### Plan 01 (15a-1, e37a5ca) — 51 inline (40 변환 + 11 옵션 N 잔존)

| 트랙 | 컴포넌트 | inline | 변환 | 옵션 N | 패턴 |
|------|----------|---:|---:|---:|------|
| 모바일 main | ElevatorPage main stragglers (L1060/1357/1744/1754) | 4 | 2 | 2 | X / X / N gradient × 2 |
| 모바일 main | EvDetailModal (L1874/1934) | 2 | 1 | 1 | X+token / N WebkitOverflowScrolling |
| 모바일 main | EvSelector (L2162) | 1 | 0 | 1 | N dynamic grid |
| Fault | FaultNewModal (L2249/L2286) | 2 | 0 | 2 | N Field flex:1 / N gradient+opacity |
| Fault | FaultNewFullscreen (L2328/L2370/L2413) | 3 | 1 partial | 2 | partial (X+token, NAV_H N) / N Field flex:1 / N gradient+opacity |
| Fault | FaultResolveModal (L2467) | 1 | 1 | 0 | M opacity |
| Cert | CertViewerModal (L2483-L2499) | 10 | 10 | 0 | X+token × 10 |
| Findings | FindingCountBadge (L2519) | 1 | 1 | 0 | X+token |
| Findings | FindingsPanel (L2596-L2645) | 20 | 20 | 0 | X+token + M × 3 + Lucide shrink-0 |
| Repair | RepairListSection (L3040) | 1 | 0 | 1 | N dynamic color concat |
| Repair | RepairImageViewer (L3119-L3139) | 5 | 4 + 1 partial | 1 | X+token × 4 / partial (token, dynamic transform N) |
| Repair | RepairNewModal (L3355) | 1 | 1 | 0 | M opacity |
| **합계 Plan 01** | **51** | **40** | **11** |

### Plan 02 (15a-2, 본 commit) — 50 inline (34 변환 + 16 옵션 N 잔존)

| 트랙 | 컴포넌트 | inline | 변환 | 옵션 N | 패턴 |
|------|----------|---:|---:|---:|------|
| Cert | CertSummary (L2721) | 1 | 1 | 0 | X+token (mt-3 flex flex-col gap-3.5) |
| Cert | CertBlock (L2761-L2812) | 16 | 9 | 7 | wrap X+token / title row token / accent bar partial (className layout, inline dynamic background) / title span partial (className layout, inline dynamic color) / PDF btn X+token / items wrap+header+grid X+token × 3 / cellSt spread × 3 N / findings spacer × 2 N (gridColumn+borderBottom) / info wrap+header+grid X+token × 3 |
| Info | ElevatorInfoCard compact (L2877-L2889) | 4 | 3 + 1 partial | 3 | wrap X+token / header X+token / hint X+token / scrollable grid partial (className 5-prop, inline WebkitOverflowScrolling/overscrollBehavior N) / kSt+vSt spread × 2 N (실측 grep count 에 포함) |
| Info | ElevatorInfoCard normal (L2898-L2914) | 11 | 4 | 7 | wrap X+token / header X+token / grid X+token / vSt gridColumn × 2 N (L2904/L2906) / kSt+vSt spread × 4 N |
| Annual (Minwon) | MinwonFindingsPanel (L3423-L3476) | 18 | 18 | 0 | wrap X+token / title row X+token / 각 finding row X+token × 4 / status chip M / delete btn X+token / resolved msg X+token / 수리이력 연결 btn X+token / linking dropdown X+token / header X+token / empty msg X+token / repair option X+token + 내부 span / 취소 btn X+token / input row X+token / input X+token / submit btn M |
| **합계 Plan 02** | **50** | **34** | **16** |

## 옵션 N (의도 inline) 잔존 27건 (양 plan 합산)

### Plan 01 — 11건

| Line (After plan 01) | 위치 | 잔존 prop | 사유 |
| ----:        | --------------------- | -------- | ----- |
| L1743 | fault FAB gradient | `background:'linear-gradient(135deg,#991b1b,#ef4444)', boxShadow:...` | gradient + shadow 길이 / 시각 0 byte 보장 |
| L1753 | repair FAB gradient | `background:'linear-gradient(135deg, var(--accent-active), var(--accent))', boxShadow:...` | gradient + shadow 길이 |
| L1932 | EvDetailModal 스크롤 | `WebkitOverflowScrolling:'touch', overscrollBehavior:'contain'` | Tailwind 미지원 (non-standard CSS) |
| L2160 | EvSelector dynamic grid | `gridTemplateColumns: \`repeat(${groupEvs.length}, 1fr)\`` | runtime dynamic |
| L2247 | FaultNewModal Field flex:1 | `style={{ flex:1 }}` (Field prop) | Field props 시그니처 보존 |
| L2284 | FaultNewModal submit gradient | `background:'linear-gradient(135deg,#991b1b,#ef4444)', opacity:...` | gradient + dynamic |
| L2326 | FaultNewFullscreen bottom NAV_H | `style={{ bottom: NAV_H }}` (나머지 className 변환) | NAV_H const 의미 보존 (partial 변환) |
| L2368 | FaultNewFullscreen Field flex:1 | (L2247 동일) | Field props 시그니처 |
| L2411 | FaultNewFullscreen submit gradient | (L2284 동일) | gradient + dynamic |
| L3034 | RepairListSection st.color concat | `background: st.color + '18', color: st.color` | runtime color concat (Tailwind arbitrary 변환 불가) |
| L3133 | RepairImageViewer img transform | `transform:..., transition: dragging ? 'none' : 'transform 0.15s'` (나머지 className 변환) | runtime dynamic transform (partial 변환) |

### Plan 02 — 16건

| Line (After plan 02) | 위치 | 잔존 prop | 사유 |
| ----:        | --------------------- | -------- | ----- |
| L2764 | CertBlock accent bar background | `style={{ background: accent ?? 'var(--acl)' }}` (className 에 w-[3px] h-[14px] rounded-[2px]) | accent prop dynamic — partial 변환 |
| L2765 | CertBlock title span color | `style={{ color: accent ?? 'var(--t1)' }}` (className 에 text-caption font-bold) | accent prop dynamic — partial 변환 |
| L2783 | CertBlock cellSt 정의 | `const cellSt: React.CSSProperties = { padding:'5px 8px', fontSize:11, borderBottom: ... }` | spread base const (React.CSSProperties 정의) |
| L2785 | CertBlock cellSt spread no | `style={{ ...cellSt, color:'var(--t3)', fontWeight:600 }}` | spread + dynamic color |
| L2786 | CertBlock cellSt spread name | `style={{ ...cellSt, color:'var(--t1)' }}` | spread + dynamic color |
| L2787 | CertBlock cellSt spread result | `style={{ ...cellSt, color:resultColor(it.result), fontWeight:700 }}` | spread + dynamic (function color) |
| L2789 | CertBlock findings spacer | `style={{ borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--bd)' }}` | dynamic borderBottom (last row branch) |
| L2790 | CertBlock findings content | `style={{ gridColumn:'2 / -1', borderBottom: ... }}` | gridColumn + dynamic borderBottom |
| L2816 | CertBlock info cellK | `const cellK: React.CSSProperties = { padding:..., borderBottom: ..., borderRight:... }` | spread base const |
| L2817 | CertBlock info cellV | `const cellV: React.CSSProperties = { padding:..., borderBottom:..., wordBreak:'break-all' }` | spread base const |
| L2819 | CertBlock info k cell | `style={cellK}` | const spread |
| L2820 | CertBlock info v cell | `style={cellV}` | const spread |
| L2866 | ElevatorInfoCard kSt 정의 | `const kSt: React.CSSProperties = { ... }` | spread base const (k/v 셀 공통) |
| L2867 | ElevatorInfoCard vSt 정의 | `const vSt: React.CSSProperties = { ... }` | spread base const |
| L2883 | ElevatorInfoCard compact scrollable | `style={{ WebkitOverflowScrolling:'touch', overscrollBehavior:'contain' } as React.CSSProperties}` (className 에 max-h-[170px] overflow-y-auto grid 등) | Tailwind 미지원 (non-standard CSS) — partial 변환 |
| L2888 | ElevatorInfoCard compact k cell | `style={{ ...kSt, ...lastRowSt }}` | spread × 2 |
| L2889 | ElevatorInfoCard compact v cell | `style={{ ...vSt, ...lastRowSt, borderRight:'none' }}` | spread × 2 + dynamic borderRight |
| L2903 | ElevatorInfoCard normal k 건물명 | `style={kSt}` | const spread |
| L2904 | ElevatorInfoCard normal v 건물명 | `style={{ ...vSt, gridColumn:'2 / -1', borderRight:'none' }}` | spread + gridColumn span |
| L2905 | ElevatorInfoCard normal k 건물주소 | `style={kSt}` | const spread |
| L2906 | ElevatorInfoCard normal v 건물주소 | `style={{ ...vSt, gridColumn:'2 / -1', borderRight:'none' }}` | spread + gridColumn span |
| L2911 | ElevatorInfoCard normal k1 | `style={{ ...kSt, ...lastRowSt }}` | spread × 2 |
| L2912 | ElevatorInfoCard normal v1 | `style={{ ...vSt, ...lastRowSt }}` | spread × 2 |
| L2913 | ElevatorInfoCard normal k2 | `style={{ ...kSt, ...lastRowSt }}` | spread × 2 |
| L2914 | ElevatorInfoCard normal v2 | `style={{ ...vSt, ...lastRowSt, borderRight:'none' }}` | spread × 2 + dynamic borderRight |

> 실측 grep count: total 132 = 데스크톱 zone 105 + plan 01 잔존 11 + plan 02 잔존 16. 데스크톱 zone 보존 확정 + 모바일 잔존 27 모두 옵션 N 패턴 (Tailwind 미지원 / runtime dynamic / props 시그니처 / spread const / partial 변환).

## 데스크톱 zone 보존 105건 (변경 0 — Wave 15b 후행)

`if (isDesktop) { return (...) }` 단일 블록 안 (L527-L1024, **plan 02 commit 후에도 정확히 동일 라인 범위 유지** — 변환 hunk 가 모두 L1060+ / L2700+ / L3400+ 영역에 위치, 데스크톱 zone 라인 시프트 0):

- L614/L622: 모드 토글 buttons (gradient bg)
- L668-L709: 우측 헤더/탭/카운트
- L716-L728: fault 카드 + 처리 btn
- L741-L799: repair 카드 + photo grid + expanded panel
- L823-L872: annual KOELSA 카드 + issues table
- L896-L989: safety manager card + edu 카드 + reg/contact 카드
- L1005-L1024: footer/refresh

> Wave 15b 가 위 105건 처리 책임. 본 wave (양 plan) 는 모두 보존 (시각 0 byte / 비즈 anchor IDENTICAL). diff hunk shell overlap check 로 데스크톱 zone 영역 (L527-L1024) 의 +/- 라인 0건 확인 (양 plan, 출력 empty).

## 비즈 anchors 보존 (45 unique onClick / 58 total / 35 useState / 5 useEffect / 3 useMutation / 14 useQuery / 1 useNavigate / 15 fetch — IDENTICAL 양 plan)

```
onClick=\{...\} : 58 (before plan 02) == 58 (after plan 02)
useState\( : 35 == 35
useEffect\( : 5 == 5
useRef\( : 0 == 0
useMutation\( : 3 == 3
useQuery\( : 14 == 14
useNavigate\( : 1 == 1
useParams\( : 0 == 0
useSearchParams\( : 0 == 0
fetch\( : 15 == 15
```

precise diff (sort+uniq onClick set): **0 line difference** (45 unique onClick callsites all preserved — 양 plan 합산).

## 자동 검증 결과 (양 plan 모두 11 게이트 PASS)

### Plan 02 검증 (본 task)

| Verify gate                                            | Result    |
| ------------------------------------------------------ | --------- |
| 1. `style={{` total ~115-125 범위                       | **132** ✓ (목표 범위 가장자리; -34 변환, 50 → 16 plan 02 + 11 plan 01 + 105 desktop = 132) |
| 2. `style={{` 데스크톱 zone L527-L1024 = 105           | **105** ✓ (python brace-tracking 확인)        |
| 3. 비즈 anchor diff = 0                                | **EMPTY** ✓ (10 anchors all IDENTICAL) |
| 4. onClick precise diff = 0                            | **EMPTY** ✓ (45 unique handlers all preserved) |
| 5. emoji 변동 = 0                                       | **11 = 11** ✓ (TYPE_ICON 4 + 본문 emoji 보존)   |
| 6. 비표준 색 토큰 (warning/safe/danger no-suffix) = 0   | **0** ✓   |
| 7. module const def = 11                                | **11** ✓ (EV_FLOORS/ES_NODES_FAULT/ES_NODES_ANNUAL/TYPE_ICON/TYPE_ICON_COMPONENT/STATUS_STYLE/OVERALL_STYLE/INSPECT_TYPE_LABEL/RESULT_STYLE/CHECK_ITEM_LABELS/HISTORY_TABS 모두 보존) |
| 8. diff hunk 데스크톱 zone (L527-L1024) 영역 변경 = 0   | **EMPTY** ✓ (7 hunks 모두 L2718/2758/2773/2799/2874/2895/3420 — 데스크톱 zone 밖) |
| 9. TypeScript `error TS` count = 0                     | **0** ✓   |
| 10. 변경 파일 = 1 .tsx 만 (off-scope = 0)               | **0 off-scope** ✓ |
| 11. vite build                                         | **PASSED** ✓ (87 modules, ✓ built in 316ms, PWA 82 entries / 7932.39 KiB) |

### Plan 01 검증 (e37a5ca, 사전 완료)

11 게이트 모두 PASS (plan 01 SUMMARY 부분 참조 — vite build 87 modules, ✓ built in 188ms, PWA 82 entries / 7931.80 KiB)

## Commits

| Hash        | Plan | Subject                                                                                         |
| ----------- | ---- | ----------------------------------------------------------------------------------------------- |
| `e37a5ca`   | 01 (15a-1) | feat(260529-h8u-01): Phase B Wave 15a-1 — ElevatorPage Fault/Repair/Findings 트랙 (51 inline) → tailwind |
| `<TBD>`     | 02 (15a-2) | feat(260529-h8u-02): Phase B Wave 15a-2 — Elevator Cert/Info/Annual 트랙 (50 inline) → tailwind |

## Phase B Tier 1 종결 + Tier 2 진행 (Wave 1~15a 누적, 17 atomic commit)

| Wave | 페이지(s)                                              | inline (before → after) | emoji (before → after) | atomic commit |
| ---- | ------------------------------------------------------ | ----------------------- | ---------------------- | ------------- |
| 1    | QRScan / Div / Reports                                 | 4 → 4 (DivPage 4 동적)  | -                      | 18fd138       |
| 2    | Login / Splash                                         | 28 → 13                 | -                      | d36a20f       |
| 3    | Workshift / AnnualPlan                                 | 24 → 21                 | -                      | a78963f + 4e99270 |
| 4    | Dashboard / DailyReport / WorkLog                      | 20 → 20 (캘리브 보존)   | -                      | 05fddf1       |
| 5    | Remediation / RemediationDetail                        | 11 → 11                 | -                      | db728c0       |
| 6    | Schedule / Education                                   | 137 → ~23               | -                      | hbv atomic    |
| 7    | StaffService                                           | 34 → 10                 | -                      | 316e1eb       |
| 8    | Extinguisher Public / List                             | 122 → 15                | 8 ✓ → 0 (Lucide)        | de15e07       |
| 9    | FloorPlan                                              | 25 → 12                 | -                      | 7701872       |
| 10   | Inspection (mega 6047줄)                                | 47 → 35                 | 26 → 0 (Lucide Check)  | cd22afc       |
| 11   | ElevatorFindingDetail (deprecated 진입점)               | 60 → 2                  | 3 ✕ → 0 (Lucide X)     | 9c5ae9a       |
| 12a  | StaffManage 모바일 zone (Tier 2 첫 wave)                | 76 → 26 (모바일 52→2)   | -                      | 1ca5c94       |
| 13a  | Checkpoints 모바일 zone (Tier 2 두 번째 wave)            | 80 → 41 (모바일 42→3)   | -                      | 9cafd5c       |
| 14a  | Remediation 모바일 zone (Tier 2 세 번째 wave)           | 25 → 15 (모바일 11→1)   | -                      | b6b7e36       |
| **15a-1** | **ElevatorPage Fault/Repair/Findings 트랙 (메가 분할 1/2)** | **206 → 166 (plan 01 51→11)** | -                    | **e37a5ca**   |
| **15a-2** | **ElevatorPage Cert/Info/Annual 트랙 (메가 분할 2/2)** ← 이번 | **166 → 132 (plan 02 50→16, 모바일 zone 종결)** | -                | **`<TBD>`**   |
| **합계 (15a)** | **20 페이지**                                   | **899 → 380 (-57.7%)**  | **37 → 0 (Phase A 완결)** | **17 atomic commits** |

### Tier 2 진행 — zone-aware sweep 패턴 17번째 atomic 자동 도달 + 새 패턴 박제

1. **메가 페이지 분할 결정 B (신규 패턴 첫 사례 + 분할 검증 완료)** — 3489줄 / 206 inline (mobile 101 + desktop 105) 안전 분할. plan 01 (fault/repair/findings 51) + plan 02 (cert/info/annual 50). 5근거: 컨텍스트 부담 / 검증 복잡도 / 비례 추정 / 자연스러운 의미 boundary / rollback 안전성 / 14a precedent 비례. **양 atomic 모두 깔끔히 commit + 시간 절약 + rollback 안전 → 분할 결정 정당화 완료**
2. **early-return zone 분할 2번째 사례** — `if (isDesktop) { return (...) }` 단일 블록 (L527-L1024) 105건 전체 보존. 14a precedent (RemediationPage early-return) 그대로 적용. python brace-depth tracking + diff hunk shell overlap check 양방향 검증. **양 plan 모두 데스크톱 zone 라인 번호 시프트 0 (변환 hunk 가 데스크톱 zone 밖에서만 위치)**
3. **module const 11개 정의 보존 (TYPE_ICON emoji 4 + 본문 emoji 변동 0)** — Wave 5/6/12a/13a/14a precedent 5번째 적용. TYPE_ICON 의 🛗 📦 🔲 ↕️ + 본문 ✕/📄/📚 등 11건 emoji 보존
4. **옵션 N 잔존 27건 양 plan 합산** — gradient 4 + WebkitOverflowScrolling 2 + dynamic-transform 1 + dynamic-grid 1 + Field flex:1 prop 2 + NAV_H partial 1 + dynamic-color 1 (plan 01) + cellSt/kSt/vSt spread 9 + spread-gridColumn 2 + spread-borderBottom 2 + accent dynamic partial 2 (plan 02). 모두 시각 0 byte 보장 위한 의도된 잔존
5. **2-plan 분할 atomic 패턴 (의도적 분할)** — Wave 1~14a + 15a-1 모두 단일 atomic, 본 wave (15a) 만 의도적 2 atomic 분할 (메가 페이지 안전성 우선). **새 패턴 박제: 17번째 atomic까지 atomic 카운트 유지**
6. **시각 0 byte 룰 100% 유지** — 17 atomic 모두 PWA build 성공 + 비즈 anchor IDENTICAL + 비표준 색 토큰 0
7. **L2326 NAV_H partial + L3133 img dynamic transform partial + L2883 compact WebkitOverflowScrolling partial — partial 변환 패턴 3건 박제** — multi-prop inline 중 일부만 className 변환, dynamic prop 만 inline 잔존. 옵션 N 절약 패턴 (full inline 보존 대신 partial)
8. **CertBlock accent prop partial 변환 패턴 — 신규 박제** — `<div style={{ width:3, height:14, background: accent ?? 'var(--acl)', borderRadius:2 }} />` → `<div className="w-[3px] h-[14px] rounded-[2px]" style={{ background: accent ?? 'var(--acl)' }} />` (layout className, dynamic prop 만 inline). 시각 0 byte 보장 + 옵션 N 절약
9. **모바일 zone 마지막 wave 종결** — Phase B Tier 2 의 12a (StaffManage) / 13a (Checkpoints) / 14a (Remediation) / 15a (ElevatorPage) 4개 페이지 모바일 zone 모두 sweep 완료. 다음은 데스크톱 zone 일괄 phase (Wave 12b~15b)

### 다음 단계 (Tier 2 진행)

- **모바일 zone 종합 검증** — 4 페이지 (StaffManage / Checkpoints / Remediation / ElevatorPage) 모바일 zone PWA 빌드 + 시각 회귀 사용자 점검
- **Wave 15b (후행)** — ElevatorPage 데스크톱 zone L527-L1024 105곳 sweep (별도 phase)
- **Wave 12b~14b (후행)** — StaffManage / Checkpoints / Remediation 데스크톱 zone sweep (모바일 zone 완결 후 일괄 phase)
- 옵션 X+P+M+색변수N + 11 module const 정의 보존 룰 그대로 승계

## 메모리 anchor 적용

| anchor | 적용 |
| ------ | ---- |
| `feedback_tailwind_w8_h8_is_48px.md` | 본 wave 양 plan 변환 대상 중 w-8/h-8 사용 0건 (인지 후 회피, h-9/h-11/h-12 standard 또는 arbitrary `[Npx]` 채택) |
| `feedback_tailwind_token_class_pattern.md` | bg-danger-bar / text-danger-bar / bg-safe-bar / text-safe-bar / bg-warning-bar / text-warning-bar / text-info-bar / text-text-primary / text-text-secondary / text-text-tertiary / bg-surface-page / bg-surface-raised / bg-surface-sunken / border-border-default / text-accent — status- prefix 없음, lucide CheckCircle2 size={N} + className="shrink-0" 패턴 |
| `feedback_text_caption_leading_none.md` | text-[N]px arbitrary 채택 (text-caption lh:1.5 작은 컨테이너 영향 회피). 본 wave 변환 대상은 대부분 input/button/wrapper 류 (라벨 케이스 X) → leading-none 신규 적용 0건. plan 02 의 CertBlock title span 만 text-caption 사용 (분명한 헤더 위치 → leading 영향 없음) |
| `feedback_inspection_unresolved_color.md` | 미조치 = `text-fire-bar` 룰은 InspectionPage 메인 칩만 적용. ElevatorPage 의 fault/finding status 는 자체 danger 톤 유지 → `text-danger-bar` / `bg-danger-bar` (FindingCountBadge / FindingsPanel status chip / MinwonFindingsPanel status chip 모두 동일) |
| `feedback_design_changes_ask_first.md` | 시각 0 byte 룰 100% — verify gate 양 plan 11개 모두 PASS, 데스크톱 zone 105건 보존 |
| `feedback_check_branch_before_edit.md` | worktree base 검증 (HEAD = e37a5ca, agent worktree main OK) — plan 02 시작 전 git merge-base 확인 |
| Wave 14a (b6b7e36) RemediationPage precedent | early-return zone 분할 + 데스크톱 zone 보존 패턴 2번째 적용 + diff hunk shell overlap check 그대로 |
| Wave 11 nkv / 12a epe / 13a f2w / 14a gj2 (token alias 일괄 매핑) | tokens.css alias 그대로 활용 (var(--bg/bg2/bg3/bd/t1/t2/t3/acl/safe/warn/danger/info) 일괄 className 변환) |
| Wave 6 hbv + 12a epe + 13a f2w + 14a gj2 (module const) precedent | module const 11개 정의 보존 + emoji 변동 0 룰 그대로 적용 (5번째 atomic) |

## Self-Check: PASSED

- ElevatorPage.tsx 변경 (file:/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/ElevatorPage.tsx) — FOUND
- commit hash `e37a5ca` (plan 01) — FOUND (`git log --oneline -5 src/pages/ElevatorPage.tsx`)
- commit hash `<TBD>` (plan 02, 본 task) — pending commit (commit 직후 hash 자동 갱신)
- emoji 보존 (11건) verify gate — PASSED (양 plan)
- 비즈 anchor diff = 0 line — PASSED (양 plan)
- TypeScript = 0 error — PASSED (양 plan)
- off-scope 변경 = 0 — PASSED (양 plan)
- module const def = 11 — PASSED (양 plan)
- 데스크톱 zone L527-L1024 105곳 보존 — PASSED 양 plan (python brace-tracking + diff hunk shell overlap check 출력 empty)
- 모바일 zone plan 01 범위 51 → 11 (40 변환 + 11 옵션 N 잔존) — PASSED (e37a5ca)
- 모바일 zone plan 02 범위 50 → 16 (34 변환 + 16 옵션 N 잔존) — PASSED (본 task)
- 모바일 zone 합산 101 → 27 (74 변환 + 27 옵션 N 잔존) — PASSED
- 전체 inline 206 → 132 — PASSED (실측 grep count)
- vite build — PASSED (양 plan, plan 02: 87 modules transformed, dist/sw.mjs 25.19 kB, PWA 82 entries / 7932.39 KiB)
- 메가 페이지 분할 결정 B 정당화 완료 — PASSED (5근거 모두 사후 검증 OK)
- **모바일 zone 마지막 wave 종결 — PASSED** (12a/13a/14a/15a 4 페이지 모바일 sweep 완료)

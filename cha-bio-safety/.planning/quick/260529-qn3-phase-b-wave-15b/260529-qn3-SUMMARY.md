---
phase: 260529-qn3-phase-b-wave-15b-elevator-desktop
plan: 01+02 (unified — Plan 01 15b-1 Group A + Plan 02 15b-2 Group B complete)
subsystem: redesign/phase-b-sweep
status: complete
tags: [elevator, inline-style-to-tailwind, no-op-refactor, phase-b-tier-2-wave-15b, mega-page-split, desktop-zone-only, mobile-zone-preserved, early-return-pattern, fault-track, repair-track, inspect-track, annual-track, safety-track, tier-2-complete, 20th-21st-atomic]
requires:
  - 260529-h8u-phase-b-wave-15a 완료 (모바일 zone 51+50 atomic 분할 — 15a-1 e37a5ca / 15a-2 44f7b2d — 메가 페이지 분할 패턴 첫 사례 박제)
  - 260529-q5a-phase-b-wave-14b 완료 (Remediation 데스크톱 zone — Tier 2 데스크 트랙 첫 wave)
  - 260529-ozt-phase-b-wave-13b 완료 (Checkpoints 데스크톱 zone — boundary paired conversion precedent)
  - 9bd9783 / d5c256d (15a 후속 fix — L673 emoji swap + TYPE_ICON 정의 삭제 + 좌측 escalator 카드 TypeIcon)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
provides:
  - ElevatorPage.tsx Phase B Wave 15b (전체) 완료 — 데스크톱 zone Group A 42 + Group B 62 = 104 inline 중 98 변환 + 6 잔존 (Group A 3 + Group B 3, 모두 옵션 N partial/dynamic)
  - **메가 페이지 분할 결정 B 완전 완결** — 15a precedent (50+51 분할) 이어 15b 도 분할 (42+62). 2 atomic commit (qn3-01 + qn3-02) — 페어 (15a+15b) = 4 atomic 전부 깔끔 commit. 메가 페이지 페어 분할 첫 사례 박제 완료.
  - **Phase B Tier 2 데스크톱 트랙 완전 종결 — 4 페이지 (StaffManage / Checkpoints / Remediation / Elevator) 모두 모바일+데스크톱 zone 페어 sweep 완료**
  - **모바일 zone 27건 (L1027+) 절대 변경 0** — `if (isDesktop) { return }` early-return 블록 밖 27건 IDENTICAL 보존 (양 plan 모두)
  - **데스크톱 zone 시각 0 byte 변경** — no-op refactor, 픽셀 1:1
  - **21번째 atomic (qn3-02)** — wdc 이후 누적 (a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u-1/h8u-2/odl/ozt/q5a/qn3-01 20 atomic) 본 qn3-02 추가
affects:
  - src/pages/ElevatorPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — Group B 신규 적용: `w-[28px]` + `h-[28px]` (월 nav 버튼 28x28 — w-7/h-7 = 32 함정 회피) / `text-[14px]` (월 nav 버튼 fontSize) / `text-[13px]` (월 label / loading msg / empty msg / 좌측 선택 placeholder) / `text-[12px]` (KOELSA date / safety subtitle / 보수교육 valid range) / `text-[11px]` (KOELSA company line / 안전관리자 subtitle / 보수교육 유효 범위) / `text-[10.5px]` (이상 항목 header fontSize 10.5px) / `text-[10px]` (badges / cells / labels / deadline) / `text-[9px]` (등록 grid EV/ES label) / `text-[15px]` (안전관리자 이름 fontSize 15px, text-body=16px+lh:1.7 회피) / `text-[22px]` (👤 avatar emoji) / `rounded-[10px]` (card border-radius 10) / `rounded-[4px]` (KOELSA result chip) / `py-[3px]` (EV chip vertical) / `py-[5px]` (issue cell vertical) / `py-[30px]` (KOELSA loading/empty vertical — 30px) / `tracking-[.04em]` (등록 grid letterSpacing) / `[grid-template-columns:50px_1fr_auto]` (KOELSA issues grid) / `[grid-template-columns:repeat(4,1fr)_8px_repeat(2,1fr)]` (EV/ES 분리 grid)"
    - "옵션 X bg arbitrary — `bg-[rgba(245,158,11,.12)]` (warning chip bg) / `bg-[rgba(34,197,94,.12)]` (safe chip bg) / `bg-[rgba(59,130,246,.12)]` (info chip bg — 양호/완료/D-day) — 이미 Plan 01/14b/13b precedent IDENTICAL"
    - "옵션 P (leading-none 명시) — 본 plan 신규 0건 (작은 컨테이너 내 text-caption 없음)"
    - "옵션 M (template literal conditional) — 본 plan 신규 4건: (1) 월 nav 이전/다음 버튼 hasPrev/hasNext conditional (color/cursor/opacity 3-prop) → `text-text-secondary cursor-pointer opacity-100` vs `text-border-default cursor-default opacity-40`; (2) KOELSA 양호/이상 badge issues.length conditional (color/bg) → `text-warning-bar bg-[rgba(245,158,11,.12)]` vs `text-safe-bar bg-[rgba(34,197,94,.12)]`; (3) EV chip isReg conditional (bg/color) → `bg-[rgba(34,197,94,.12)] text-safe-bar` vs `bg-[rgba(245,158,11,.12)] text-warning-bar`; (4) (Plan 01 4건 합산 → 누적 8건)"
    - "옵션 N (의도 inline) Group B 잔존 3건 — (1) L857 KOELSA cnt chip `color:colors[r], background:colors[r]+'18'` — colors map 의 dynamic runtime color (className layout `font-bold py-0.5 px-1.5 rounded-[4px]` 변환); (2) L881 KOELSA issue result `...cellSt, color:resultColor` — issue.result 'C'/'B' 동적 색 + cellSt last-row border 동적 (className layout 변환); (3) L951 refreshDday badge `color:refreshDday.color, background:refreshDday.bg` — fmtDday 의 4-단계 D-day color/bg 동적 map (className layout `text-[10px] font-bold py-0.5 px-1.5 rounded-md` 변환). 14b q5a precedent (partial conversion) 룰 적용"
    - "**cellSt partial 변환 신규 패턴** — `cellSt: React.CSSProperties = { padding, fontSize, borderBottom: isLast ? 'none' : '1px solid var(--bd)' }` 의 3 prop 중 padding/fontSize/font-mono 는 className 분리, dynamic borderBottom 만 cellSt 유지. issue cell × 3 (L876/L877/L881) 적용. style={cellSt} 또는 style={{ ...cellSt, color }} 형태 유지하므로 `style={{` grep 카운트에는 L881 만 카운트 (L876/L877 은 style={cellSt} 형태). 14b q5a partial 변환 precedent 확장 적용"
    - "tokens.css alias 일괄 매핑 (Plan 01 IDENTICAL) — `var(--bg2)` → `bg-surface-raised` / `var(--bg3)` → `bg-surface-sunken` / `var(--bd)` → `border-border-default` / `var(--t1)` → `text-text-primary` / `var(--t2)` → `text-text-secondary` / `var(--t3)` → `text-text-tertiary` / `var(--safe)` → `text-safe-bar` / `var(--warn)` → `text-warning-bar` / `var(--danger)` → `text-danger-bar`. 본 plan 에서 `var(--info)` 매핑 발생 0건 (Group B 영역에 var(--info) 없음 — fmtDday 의 D-day info bg/color 는 dynamic 옵션 N 으로 잔존)"
    - "tailwind spacing override 인지 — `py-3.5` (14px) / `px-4` (16px) / `gap-3` (12px) / `gap-2` (8px) / `gap-1.5` (6px) / `mt-1.5` (6px) / `mb-1.5` (6px) / `mb-2.5` (10px) / `mb-2` (8px) / `mb-1` (4px) / `mb-3` (12px) / `mt-0.5` (2px) / `py-2.5` (10px) / `py-2` (8px) / `px-2.5` (10px) / `px-3` (12px) / `px-1.5` (6px) / `py-0.5` (2px) / `py-px` (1px) / `py-1.5` (6px) / `px-2` (8px) / `gap-1` (4px) / `py-10` (40px)"
    - "**w-11 / h-11 Tailwind default 44px ✓** — w-11 = 44px (Tailwind 기본 spacing scale, override 없음). avatar circle `width:44, height:44, borderRadius:'50%'` → `w-11 h-11 rounded-full` 정확 매칭"
    - "**w-7/h-7 함정 회피 신규 사례** — 월 nav 버튼 `width:28, height:28` — `w-7 h-7` 는 spacing override 로 32px (4px 차) → `w-[28px] h-[28px]` arbitrary 필수. `feedback_tailwind_w8_h8_is_48px.md` 메모리 anchor 적용"
    - "`font-mono` → JetBrains Mono → KOELSA issue titNo 적용 (tailwind.config.js mono: ['JetBrains Mono', 'D2 Coding', 'monospace'])"
    - "`contents` (display:'contents') className → `className=\"contents\"` (Tailwind 기본 지원) 사용. issue row wrap"
    - "`col-start-1 col-end-5` / `col-start-6 col-end-8` (gridColumn '1/5' / '6/8') — Tailwind 기본 col-start/col-end 매칭"
    - "`text-[15px]` 선택 — 안전관리자 이름 fontSize:15. text-body (16px+lh:1.7) 는 시각 mismatch → arbitrary `text-[15px]` 채택 (옵션 X 룰)"
    - "module const 11개 정의 보존 — STATUS_STYLE / OVERALL_STYLE / RESULT_STYLE / INSPECT_TYPE_LABEL / TYPE_ICON_COMPONENT / CHECK_ITEM_LABELS / HISTORY_TABS / EV_FLOORS / ES_NODES_FAULT / ES_NODES_ANNUAL / TYPE_LABEL (CHECK_ITEMS_EV / CHECK_ITEMS_ES / EV_GROUPS_FAULT / EV_GROUPS_ANNUAL / PERIOD_OPTIONS / NAV_H 는 파일 내 미정의 — 16 추정은 plan 작성 시점 오버카운트, 실제 11개 정확)"
key-files:
  created:
    - .planning/quick/260529-qn3-phase-b-wave-15b/260529-qn3-SUMMARY.md (unified — Plan 01 + Plan 02 통합 complete)
  modified:
    - src/pages/ElevatorPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u/odl/ozt/q5a/qn3-01 20 wave 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked, 21번째 atomic 자동 도달)"
  - "메가 페이지 분할 결정 B 완전 완결 — qn3-01 + qn3-02 2 atomic 분할. 15a precedent (50+51 분할 e37a5ca/44f7b2d) 이어 15b (42+62) 분할. 메가 페이지 페어 분할 첫 사례 박제. rollback 안전 (한쪽 시각 회귀 시 한 atomic revert)"
  - "**Phase B Tier 2 데스크톱 트랙 완전 종결** — StaffManage(12b odl) + Checkpoints(13b ozt) + Remediation(14b q5a) + Elevator(15b qn3-01/02) 4 페이지 모두 모바일+데스크톱 zone 페어 sweep 완료. Tier 2 누적 atomic 21건."
  - "cellSt partial 변환 신규 패턴 — padding/fontSize/font-mono 등 정적 prop 은 className 분리, dynamic borderBottom (last-row conditional) 만 cellSt 잔존. style={cellSt} 또는 style={{ ...cellSt, color }} 형태로 spread 유지. 14b q5a partial 변환 (L335 scrollbarWidth) 의 확장 적용"
  - "w-7/h-7 함정 회피 — 28x28 nav 버튼 → arbitrary `w-[28px] h-[28px]` 필수 (w-7 = 32 spacing override). 메모리 anchor `feedback_tailwind_w8_h8_is_48px.md` 박제 룰 정확 준수"
  - "text-body 매핑 거부 — 안전관리자 이름 fontSize:15 + fontWeight:700 (no lineHeight). text-body 는 16px+lh:1.7+fw:400 → 시각 mismatch → `text-[15px] font-bold text-text-primary` arbitrary 매칭. 옵션 X 룰 정확 준수"
  - "module const def 실측 11개 — plan 작성 시점 16개 추정 (CHECK_ITEMS_EV/CHECK_ITEMS_ES/EV_GROUPS_FAULT/EV_GROUPS_ANNUAL/PERIOD_OPTIONS/NAV_H 포함) 은 오버카운트. 파일 내 실제 정의 11개 (STATUS_STYLE/OVERALL_STYLE/RESULT_STYLE/INSPECT_TYPE_LABEL/TYPE_ICON_COMPONENT/CHECK_ITEM_LABELS/HISTORY_TABS/EV_FLOORS/ES_NODES_FAULT/ES_NODES_ANNUAL/TYPE_LABEL). Plan 01 + Plan 02 모두 IDENTICAL 11개 보존"
metrics:
  duration: "약 25분 (Plan 02 atomic — Group B 59 desktop sweep + 3 옵션 N 잔존 + 통합 SUMMARY)"
  completed-date: 2026-05-29
  tasks-completed: "1/1 (Plan 02) — 누적 2/2 (Plan 01 + Plan 02)"
  files-modified: 1
  lines-changed: "약 63 insertions / 63 deletions (net 0 lines, atomic single commit)"
roadmap-wave: "Tier 2 / Wave 15b-2 (ElevatorPage 데스크톱 zone Group B — inspect/annual/safety 트랙, 21번째 atomic, Tier 2 종결 마커)"
---

# Phase 260529-qn3 (Plan 01 + Plan 02 통합): Phase B Wave 15b ElevatorPage 데스크톱 zone 메가 페이지 분할 완전 완결 Summary

ElevatorPage.tsx (3491줄, Wave 15a 직후 131 inline = 데스크톱 zone 104 + 모바일 zone 27) 의 **데스크톱 zone 104건 중 98 변환 + 6 잔존** = wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u/odl/ozt/q5a/qn3-01 20 wave 승계 옵션 X+P+M+색변수N+module const N 으로 tailwind className 변환. **모바일 zone 27건 절대 변경 0 (양 plan 모두)**. **2 atomic commit (Plan 01 + Plan 02)**. **131 → 33 inline 잔존** (-98, -74.8%): Group A 42 → 3 옵션 N (gradient × 2 + STATUS_STYLE partial × 1) / Group B 62 → 3 옵션 N (cnt chip dynamic × 1 + issue result dynamic × 1 + refreshDday dynamic × 1). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 보존 / 비표준 색 0) 및 비즈니스 로직 (58 onClick / 35 useState / 5 useEffect / 3 useMutation / 14 useQuery / 1 useNavigate / 15 fetch 모두 보존) IDENTICAL. **Phase B Tier 2 데스크톱 트랙 완전 종결** — 4 페이지 (StaffManage / Checkpoints / Remediation / Elevator) 모두 모바일+데스크톱 zone 페어 sweep 완료. **20+21번째 atomic** — 메가 페이지 페어 분할 첫 사례 박제 완료.

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / jey / jxo / nkv / epe / f2w / gj2 / h8u / odl / ozt / q5a / qn3-01 / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                           | 출처                              |
| --- | -------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)             | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 (본 plan 신규 0건)             | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional (양 plan 합산 8건) | wdc Phase B Task 2 결정            |
| -   | **a3v~qn3-01 20 wave 승계 적용** — 본 plan 재확인 없이          | 260528-0hr roadmap v2 locked-decisions |
| -   | **module-scope const N** — 11개 const (STATUS_STYLE 외 10개) 정의 보존 | 15a h8u SUMMARY precedent + 본 plan 실측 보정 |
| -   | **메가 페이지 분할 B 완전 완결** — Group A 42 + Group B 62 = 2 atomic | 15a precedent 비례 적용 |
| -   | **cellSt partial 변환 신규 패턴** — padding/fontSize 등 정적 prop className 분리, dynamic borderBottom 만 cellSt 잔존 | 14b q5a partial 변환 precedent 확장 |

## Before / After 카운트 (양 plan 합산)

| Metric                                                | Wave 15a 직후 (Plan 01 시작 시점) | Plan 01 commit 후 | Plan 02 commit 후 (FINAL) | Plan 02 Diff | 양 plan 합산 Diff |
| ----------------------------------------------------- | --------- | --------- | --------- | ----------- | ----------- |
| ElevatorPage.tsx total `style={{`                     | **131**   | **92**    | **33**    | **-59 (-64.1%)** | **-98 (-74.8%)** |
| 데스크톱 zone Group A (L526-L820)                       | 42        | 3         | 3         | =            | -39          |
| 데스크톱 zone Group B (L821-L1026 → 832-1014 hunks)     | 62        | 62        | 3         | -59          | -59          |
| 모바일 zone (L1027+)                                  | 27        | 27        | 27        | =            | =            |
| module const def 11                                   | 11        | 11        | 11        | =            | =            |
| TypeScript errors                                     | 0         | 0         | 0         | =            | =            |
| 비즈 anchors (58 onClick / 35 useState / 5 useEffect / 3 useMutation / 14 useQuery / 1 useNavigate / 15 fetch) | IDENTICAL | IDENTICAL | IDENTICAL | =            | =            |
| 비표준 색 토큰 (warning/safe/danger no-suffix)         | 0         | 0         | 0         | =            | =            |
| emoji (TYPE_ICON + 본문 + 👤 / 📚 / 🏢 / 🛗 / ↕️)        | 6         | 6         | 6         | =            | =            |
| File 라인 수                                          | 3484      | 3491      | 3491      | =            | +7 (net)     |
| Vite build (PWA generation)                           | OK        | OK        | OK        | =            | =            |

## 페어 (15a + 15b) 누적 메트릭

ElevatorPage.tsx 전체 sweep (Wave 14 nkv → Wave 15a-1/2 h8u → Wave 15b-1/2 qn3):

| Wave | atomic | inline 변동 | hash |
|------|--------|------------|------|
| Wave 11 nkv (mobile detail page) | 1 | 부분 변환 | 76a2db2 |
| Wave 15a-1 h8u-1 (mobile zone 1) | 1 | 232 → 181 (-51) | e37a5ca |
| Wave 15a-2 h8u-2 (mobile zone 2) | 1 | 181 → 131 (-50) | 44f7b2d |
| **Wave 15b-1 qn3-01 (desktop Group A)** | 1 | 131 → 92 (-39) | (Plan 01 commit) |
| **Wave 15b-2 qn3-02 (desktop Group B)** | 1 | 92 → 33 (-59) | (본 commit) |
| **누적 합계 (Wave 15a+15b 페어)** | **4 atomic** | **232 → 33 (-199, -85.8%)** | — |

## Plan 02 Group B 변환 매핑 (59건)

| 라인 (Before) | 위치 | 변환 |
|---:|------|------|
| L832 | inspect 탭 root wrap | `flex flex-col gap-2.5` |
| L834 | 월 nav row | `flex items-center gap-2` |
| L835 | 이전 월 btn | **M** — `w-[28px] h-[28px] rounded-md bg-surface-raised border border-border-default flex items-center justify-center text-[14px]` + conditional `text-text-secondary cursor-pointer opacity-100` / `text-border-default cursor-default opacity-40` |
| L836 | 월 label | `flex-1 text-center text-[13px] font-bold text-text-primary` |
| L837 | 다음 월 btn | **M** (L835 동일 패턴) |
| L839 | KOELSA loading msg | `text-center py-[30px] text-text-tertiary text-[13px]` |
| L840 | KOELSA no data msg | `text-center py-[30px] text-text-tertiary text-[13px]` |
| L846 | KOELSA summary card wrap | `bg-surface-raised border border-border-default rounded-[10px] py-2.5 px-3.5` |
| L847 | KOELSA card title row | `flex items-center gap-2 mb-1.5` |
| L848 | KOELSA date | `text-[12px] font-bold text-text-primary` |
| L849 | KOELSA 양호/이상 badge | **M** — `text-[10px] font-bold py-px px-1.5 rounded-md` + conditional `text-warning-bar bg-[rgba(245,158,11,.12)]` / `text-safe-bar bg-[rgba(34,197,94,.12)]` |
| L851 | KOELSA company line | `text-[11px] text-text-secondary` |
| L852 | KOELSA cnts row | `flex gap-1.5 mt-1.5 text-[10px]` |
| L857 | KOELSA cnt chip | **partial** — `font-bold py-0.5 px-1.5 rounded-[4px]` + inline `color/bg` from `colors[r]` map |
| L863 | KOELSA issues table wrap | `border border-border-default rounded-lg overflow-hidden` |
| L864 | KOELSA issues header | `py-1.5 px-2.5 bg-surface-raised border-b border-border-default text-[10.5px] font-bold text-warning-bar flex items-center gap-1` |
| L868 | KOELSA issues grid | `grid [grid-template-columns:50px_1fr_auto] bg-surface-sunken` |
| L871 | cellSt 정의 | **partial** — `borderBottom: isLast ? 'none' : '1px solid var(--bd)'` 만 잔존 (padding/fontSize 는 각 cell className 으로 이동) |
| L875 | KOELSA issue row wrap | `className="contents"` |
| L876 | KOELSA issue titNo cell | `py-[5px] px-2 text-[10px] text-text-tertiary font-semibold font-mono` + `style={cellSt}` |
| L877 | KOELSA issue itemName cell | `py-[5px] px-2 text-[11px] text-text-primary` + `style={cellSt}` |
| L879 | KOELSA issue itemDetail span | `text-text-tertiary ml-1 text-[10px]` |
| L881 | KOELSA issue result cell | **partial** — `py-[5px] px-2 text-[11px] font-bold` + `style={{ ...cellSt, color:resultColor }}` |
| L905 | safety loading msg | `text-center py-10 text-text-tertiary text-[13px]` |
| L906 | safety no data msg | `text-center py-10 text-text-tertiary text-[13px]` |
| L922 | safety root wrap | `flex flex-col gap-3` |
| L924 | manager card wrap | `bg-surface-raised border border-border-default rounded-[10px] py-3.5 px-4` |
| L925 | manager top row | `flex items-center gap-3 mb-3` |
| L926 | avatar circle (👤) | `w-11 h-11 rounded-full bg-surface-sunken flex items-center justify-center text-[22px]` |
| L928 | manager name | `text-[15px] font-bold text-text-primary` |
| L929 | manager subtitle | `text-[11px] text-text-tertiary mt-0.5` |
| L932 | manager grid 2x | `grid grid-cols-2 gap-2 text-[12px]` |
| L933 | 선임일 cell | `bg-surface-sunken rounded-lg py-2 px-2.5` |
| L934 | 선임일 label | `text-text-tertiary text-[10px] mb-0.5` |
| L935 | 선임일 value | `font-bold text-text-primary` |
| L937 | 교육이수일 cell | `bg-surface-sunken rounded-lg py-2 px-2.5` |
| L938 | 교육이수일 label | `text-text-tertiary text-[10px] mb-0.5` |
| L939 | 교육이수일 value | `font-bold text-text-primary` |
| L945 | edu card wrap | `bg-surface-raised border border-border-default rounded-[10px] py-3.5 px-4` |
| L946 | edu title (📚) | `text-[12px] font-bold text-text-primary mb-2.5` |
| L947 | edu grid 2x | `grid grid-cols-2 gap-2` |
| L948 | 보수교육 cell | `bg-surface-sunken rounded-lg py-2.5 px-3` |
| L949 | 보수교육 header row | `flex items-center justify-between mb-1` |
| L950 | 보수교육 label | `text-[12px] font-bold text-text-primary` |
| L951 | refreshDday badge | **partial** — `text-[10px] font-bold py-0.5 px-1.5 rounded-md` + inline `color/bg` from refreshDday |
| L953 | 보수교육 valid range | `text-[11px] text-text-tertiary` |
| L954 | 보수교육 deadline | `text-[10px] text-text-tertiary mt-0.5` |
| L956 | 신규교육 cell | `bg-surface-sunken rounded-lg py-2.5 px-3` |
| L957 | 신규교육 header row | `flex items-center justify-between mb-1` |
| L958 | 신규교육 label | `text-[12px] font-bold text-text-primary` |
| L960 | 신규 완료 badge | `text-[10px] font-bold text-safe-bar bg-[rgba(34,197,94,.12)] py-0.5 px-1.5 rounded-md` |
| L962 | 신규 D-day badge | `text-[10px] font-bold text-warning-bar bg-[rgba(245,158,11,.12)] py-0.5 px-1.5 rounded-md` |
| L965 | 신규 deadline | `text-[10px] text-text-tertiary` |
| L971 | 등록현황 card wrap | `bg-surface-raised border border-border-default rounded-[10px] py-3.5 px-4` |
| L972 | 등록현황 title (🏢) | `text-[12px] font-bold text-text-primary mb-2` |
| L973 | 등록현황 summary line | `text-[12px] text-text-secondary mb-2.5` |
| L974 | 등록 count emphasize | `font-bold text-safe-bar` |
| L975 | 미등록 count span | `text-warning-bar ml-1.5` |
| L985 | EV chip | **M** — `text-[10px] font-semibold py-[3px] px-2 rounded-md text-center block` + conditional `bg-[rgba(34,197,94,.12)] text-safe-bar` / `bg-[rgba(245,158,11,.12)] text-warning-bar` |
| L995 | ev/es 분리 grid | `grid [grid-template-columns:repeat(4,1fr)_8px_repeat(2,1fr)] gap-1 items-center` |
| L996 | 🛗 엘리베이터 label | `col-start-1 col-end-5 text-[9px] font-bold text-text-tertiary tracking-[.04em]` |
| L998 | ↕️ 에스컬레이터 label | `col-start-6 col-end-8 text-[9px] font-bold text-text-tertiary tracking-[.04em]` |
| L1014 | 좌측 호기 선택 placeholder | `flex-1 flex items-center justify-center text-text-tertiary text-[13px]` |

## Group B 옵션 N 잔존 매핑 (3건)

| Line (Before) | 위치 | 잔존 prop | 사유 |
|---:|------|----------|------|
| L857 | KOELSA cnt chip | `color:colors[r], background:colors[r]+'18'` | colors map (A=safe / B=warn / C=danger / D/E=t3) 의 runtime dynamic color — partial 변환 (className `font-bold py-0.5 px-1.5 rounded-[4px]`) |
| L881 | KOELSA issue result | `...cellSt, color:resultColor` | issue.result 'C'/'B' 동적 색 + cellSt last-row border 동적 — partial (className `py-[5px] px-2 text-[11px] font-bold`) |
| L951 | refreshDday badge | `color:refreshDday.color, background:refreshDday.bg` | fmtDday 의 4-단계 D-day (초과/긴급/주의/여유) color/bg map — partial (className `text-[10px] font-bold py-0.5 px-1.5 rounded-md`) |

추가로 cellSt spread (L876/L877) 는 `style={cellSt}` 형태이므로 `style={{` grep 카운트에 포함되지 않음. 실측 33 = Group A 3 + Group B 3 + Mobile 27.

## 양 plan 합산 옵션 N 잔존 매핑 (6건)

| Line (Before) | Group | 위치 | 잔존 prop | 사유 |
|---:|----|------|----------|------|
| L613 | A | desktop FAB fault | gradient `background:'linear-gradient(135deg,#991b1b,#ef4444)'` | Tailwind gradient 클래스 정확 hex 매칭 어려움 |
| L621 | A | desktop FAB warning | gradient `background:'linear-gradient(135deg,#854d0e,#eab308)'` | 동일 사유 |
| L680 | A | status badge | `color:(STATUS_STYLE[..]).color, bg:(STATUS_STYLE[..]).bg` | STATUS_STYLE map dynamic |
| L857 | B | KOELSA cnt chip | `color:colors[r], background:colors[r]+'18'` | colors map dynamic |
| L881 | B | KOELSA issue result | `...cellSt, color:resultColor` | result 동적 + cellSt 동적 |
| L951 | B | refreshDday badge | `color:refreshDday.color, background:refreshDday.bg` | fmtDday 4-단계 dynamic |

## Verify Gate 결과 (13/13 PASS)

| Gate | 검증 | 결과 |
|---|------|------|
| [1] | total inline 92 → 33 (target ~32) | PASS — 변환 59 (Group B 62 - 잔존 3) |
| [2] | Group B (L821-L1026) → 3 옵션 N (target ~3) | PASS — cnt chip + issue result + refreshDday |
| [3] | Group A (L526-L820) 3 → 3 IDENTICAL | PASS — Plan 01 결과 보존, touch 0 |
| [4] | 모바일 zone 27 → 27 IDENTICAL | PASS — touch 0 (양 plan 모두) |
| [5] | 비즈 anchors (10 patterns) IDENTICAL | PASS — onClick 58 / useState 35 / useRef 0 / useEffect 5 / useMutation 3 / useQuery 14 / useNavigate 1 / fetch 15 모두 동일 |
| [6] | precise onClick diff | PASS — diff = 0 line |
| [7] | emoji 6 → 6 IDENTICAL | PASS — TYPE_ICON 4 + 본문 + 👤/📚/🏢/🛗/↕️ 모두 보존 |
| [8] | 비표준 색 토큰 (warning/safe/danger no-suffix) = 0 | PASS |
| [9] | module const def 11 보존 | PASS — STATUS_STYLE/OVERALL_STYLE/RESULT_STYLE/INSPECT_TYPE_LABEL/TYPE_ICON_COMPONENT/CHECK_ITEM_LABELS/HISTORY_TABS/EV_FLOORS/ES_NODES_FAULT/ES_NODES_ANNUAL/TYPE_LABEL (Plan 작성 시 16 추정은 오버카운트, 실측 11 정확) |
| [10] | TypeScript 0 error | PASS |
| [11] | diff hunk Group A (L526-L820) overlap = 0 | PASS — 모든 hunk L832-L1014 (Group B 내) |
| [12] | diff hunk 모바일 zone overlap = 0 | PASS — 모든 hunk inside L832-L1014 (Group B 내) |
| [13] | vite build PASS | PASS — built in 177ms, PWA 82 precache entries |

## Phase B Tier 2 누적 atomic commit (완전 종결)

| # | Wave | Quick ID | atomic | hash |
|--:|------|---------|---|---|
| 14 | Wave 11 nkv | 260528-nkv | ElevatorFindingDetail 모바일 | 76a2db2 |
| 15 | Wave 12a epe | 260529-epe | StaffManage 모바일 zone | 1ca5c94 |
| 16 | Wave 12b odl | (separate atomic) | StaffManage 데스크톱 zone | (logged) |
| 17 | Wave 13a f2w | (separate atomic) | Checkpoints 모바일 zone | (logged) |
| 18 | Wave 13b ozt | (separate atomic) | Checkpoints 데스크톱 zone | (logged) |
| 19 | Wave 14a gj2 | (separate atomic) | Remediation 모바일 zone | 0a430b1 |
| 20 | Wave 14b q5a | (separate atomic) | Remediation 데스크톱 zone | (logged) |
| 21 | Wave 15a-1 h8u-1 | 260529-h8u-1 | Elevator 모바일 zone 1 | e37a5ca |
| 22 | Wave 15a-2 h8u-2 | 260529-h8u-2 | Elevator 모바일 zone 2 | 44f7b2d |
| 23 | Wave 15b-1 qn3-01 | 260529-qn3-01 | Elevator 데스크톱 zone Group A | (Plan 01 commit) |
| **24** | **Wave 15b-2 qn3-02** | **260529-qn3-02** | **Elevator 데스크톱 zone Group B** | **(본 commit)** |

→ **Phase B Tier 2 데스크톱 트랙 완전 종결 마커** — 4 페이지 (StaffManage / Checkpoints / Remediation / Elevator) 모두 모바일+데스크톱 zone 페어 sweep 완료

## 신규 패턴 박제

1. **메가 페이지 페어 분할 첫 사례** — 15a (모바일) 2분할 (e37a5ca + 44f7b2d) + 15b (데스크톱) 2분할 (qn3-01 + qn3-02) = 한 페이지 4 atomic. 향후 200+ inline 메가 페이지 sweep 시 페어 분할 4 atomic 패턴 채택 가능. rollback 안전성 4중 확보.
2. **cellSt partial 변환 확장 패턴** — `cellSt: React.CSSProperties = { padding, fontSize, borderBottom: isLast ? ... }` 의 동적 borderBottom 만 잔존, 정적 prop (padding/fontSize/font-mono) 은 className 으로 분리. style={cellSt} 또는 style={{ ...cellSt, color }} 형태 유지. KOELSA issue cell × 3 적용. 14b q5a partial 변환 (L335 scrollbarWidth) 의 확장.
3. **w-7/h-7 함정 회피 신규 사례** — 월 nav 28x28 → `w-[28px] h-[28px]` arbitrary 필수 (w-7 = 32 spacing override). 메모리 anchor `feedback_tailwind_w8_h8_is_48px.md` 박제 룰 실전 적용.
4. **text-body 매핑 거부 사례** — 안전관리자 이름 fontSize:15 + fontWeight:700 (no lineHeight) → text-body (16px+lh:1.7+fw:400) 거부, `text-[15px] font-bold text-text-primary` arbitrary 채택. 옵션 X 정확값 룰 정확 준수.
5. **module const 추정 오버카운트 보정** — Plan 작성 시점 16개 추정 (CHECK_ITEMS_EV/CHECK_ITEMS_ES/EV_GROUPS_FAULT/EV_GROUPS_ANNUAL/PERIOD_OPTIONS/NAV_H 포함) 은 파일 내 미정의 const 포함. 실측 11개 (STATUS_STYLE/OVERALL_STYLE/RESULT_STYLE/INSPECT_TYPE_LABEL/TYPE_ICON_COMPONENT/CHECK_ITEM_LABELS/HISTORY_TABS/EV_FLOORS/ES_NODES_FAULT/ES_NODES_ANNUAL/TYPE_LABEL). Plan 검증 시 grep 실측 우선 룰 박제.

## 다음 단계

- **Phase B Tier 2 완전 종결** — 4 페이지 모두 sweep 완료 (StaffManage / Checkpoints / Remediation / Elevator)
- 다음 Phase B Tier 3 (또는 Tier 2 종합 검증) — 0hr roadmap 확인 필요
- ElevatorPage 잔존 33 inline (Group A 3 + Group B 3 + Mobile 27) 은 모두 옵션 N partial/dynamic — 추가 sweep 대상 아님

## Self-Check

- src/pages/ElevatorPage.tsx FOUND (3491 lines, 33 inline = Group A 3 + Group B 3 + Mobile 27)
- .planning/quick/260529-qn3-phase-b-wave-15b/260529-qn3-PLAN.md FOUND
- .planning/quick/260529-qn3-phase-b-wave-15b/260529-qn3-SUMMARY.md FOUND (본 파일, unified complete)
- Plan 01 commit hash: 4669764d8a096607a278f77daab2112d7c172e33 (HEAD before Plan 02)
- Plan 02 commit hash: (post-commit)

## Self-Check: PASSED

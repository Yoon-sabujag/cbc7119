---
phase: quick-260527-3qi
plan: 01
subsystem: redesign/31-chrome
tags:
  - redesign
  - chrome
  - side-menu
  - sketch
  - 31-chrome
  - dark-light
  - w3
requires:
  - cha-bio-safety/docs/redesign-context/31-chrome/wave-1-index.md (W1 OQ LOCKED 8건)
  - cha-bio-safety/docs/redesign-context/31-chrome/SideMenu.tsx (201 라인 스냅샷)
  - cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-2-global-header.html (W2 precedent)
  - cha-bio-safety/docs/redesign-context/31-chrome/tokens.css / typography.css / design-system.md
provides:
  - cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-3-side-menu.html (1621 라인)
affects:
  - 다음 단계 — 사용자 컨펌 (W3-OQ #A / W3-OQ #B / OQ #2 격상 panel overflow) 후 main 머지 + W4/W5 진입
tech-stack-added: []
tech-stack-patterns:
  - 'sketch HTML 6 박스 머리 주석 (메타 + 비즈 anchor 22 + OQ 매트릭스 10 + 격상 표 + 토큰 매핑 + negative gate)'
  - ':root + [data-theme="light"] 다크/라이트 양쪽 토큰 정의 (OQ #1 LOCKED — 30-not-found + W2 GlobalHeader precedent mirror)'
  - 'frame-mobile-tall 720 높이 + position absolute 슬라이드 panel sketch — overlay + panel + bottomnav 시뮬레이션'
  - 'biz anchor 22건 verbatim 박제 패턴 — MENU 상수 5섹션 17 아이템 source 1:1 + Props/NAV_H/queryKey/RAW_TO_LABEL/ITEM_META/id="side-menu-panel"/cubic-bezier/borderRadius'
  - 'W3 추가 OQ default 답 + LOCKED placeholder 패턴 — Lucide X 교체 / fire-bar 주황'
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-3-side-menu.html
  modified: []
decisions:
  - 'OQ #1 다크 + 라이트 양쪽 — :root + [data-theme="light"] 둘 다 정의, 4 frame 매트릭스 (Frame 1/2/5/6 다크 + Frame 3/4 라이트)'
  - 'OQ #2 부분 격상 7건 — 부제 9.5→12 / divider 9→11 / soon 10→12 / item 12.5→16 / badge 11→13 / 사용자 이름 11.5→14 / 사용자 부제 9.5→12'
  - 'OQ #3 사용자 아바타 그라데이션 보존 — linear-gradient(135deg, #1d4ed8, #0ea5e9) verbatim (raw hex 예외 + body markup 안 1건)'
  - 'OQ #7 panel width 82% maxWidth 300 + borderRadius "0 16px 16px 0" 변경 0'
  - 'W3-OQ #A default — ✕ U+2715 → Lucide X 교체 (size 16, var(--text-secondary)). LOCKED placeholder.'
  - 'W3-OQ #B default — 미조치 badge --status-fire-bar 주황 (#f97316 다크 / #c2410c 라이트). Frame 4 에서 danger-bar 빨강 alternative 시연. LOCKED placeholder.'
  - '비즈 anchor 22건 sketch 머리 주석 verbatim 박제 — MENU 상수 17 아이템 source 1:1 + W7 TSX 변환 1 byte 변경 0 anchor'
metrics:
  duration: 24m
  completed: 2026-05-27T03:02:04+09:00
  lines_produced: 1621
---

# Quick 260527-3qi: redesign/31-chrome W3 SideMenu sketch atomic 1-commit Summary

## One-liner

redesign/31-chrome W3 sub-wave — SideMenu (햄버거 슬라이드 드로어, 201 라인) 단일 컴포넌트 sketch HTML 1 파일 (1621 라인) atomic 1-commit. 다크/라이트 4 frame 매트릭스 + zoom + 옵션 2 frame + 6 머리 주석 박스 (메타 + 비즈 anchor 22 + OQ 매트릭스 10 + 격상 7 + 토큰 매핑 + negative gate). OQ LOCKED 5건 (#1/#2/#3/#5 partial/#7) + W3 추가 OQ 2건 (#A ✕→Lucide X / #B badge fire-bar) default 답 시각화. 보호 파일 13개 모두 변경 0.

## 산출 파일

| 파일 | 라인 | 비고 |
|------|------|------|
| `cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-3-side-menu.html` | 1621 | sketch 본문 + 머리 주석 6 박스 + body 6 frame + 4 도큐 박스 |

## Frame 매트릭스 (6 frame)

| Frame | 모드 | 상태 | 핵심 시연 |
|-------|------|------|----------|
| 1 | 다크 | 패널 열림 + 오버레이 | 메뉴 라벨 16px 노안 마지노선 / badge 12 fire-bar / 9 아이템 (주요 기능 5 + 시설 관리 4 모바일 노출) |
| 2 | 다크 | zoom container | divider/item/soon/badge 4 분기 + 사용자 카드 zoom + 99+ cap |
| 3 | 라이트 | 패널 열림 + 오버레이 | OQ #1 LOCKED 라이트 변형 — surface/text/border/status 모두 라이트 토큰 자동 |
| 4 | 라이트 | badge 비교 | W3-OQ #B fire-bar (#c2410c) vs danger-bar (#b91c1c) side-by-side |
| 5 | 다크 | 패널 닫힘 transition | translateX(-100%) + 오버레이 opacity 0 — cubic-bezier(.4,0,.2,1) 0.3s |
| 6 | 다크 | admin 사용자 | role: 'admin' 분기 — 소방 시설 추가 / 업무 수행 기록표 / 직원 관리 3 메뉴 노출 |

## OQ LOCKED 5건 + W3 추가 OQ 2건 적용

| OQ | 결정 | 본 W3 적용 |
|----|------|-----------|
| #1 | LOCKED 다크 + 라이트 양쪽 | `:root` + `[data-theme="light"]` 둘 다 정의, 6 frame 중 2 frame data-theme="light" 부착 (11 occurrences total) |
| #2 | LOCKED 부분 절충 | 격상 7건: 부제 12 / divider 11 / item 16 / badge 13 / 사용자 이름 14 / 사용자 부제 12 / Lucide X size 16 |
| #3 | LOCKED 아바타 그라데이션 유지 | `linear-gradient(135deg, #1d4ed8, #0ea5e9)` verbatim 보존 — body markup 안 1건 예외 |
| #5 | LOCKED 인라인 svg 유지 | header 햄버거 / back / settings cog 유지. ✕ glyph 별도 → W3-OQ #A |
| #7 | LOCKED panel 치수 보존 | `width: 82%` `max-width: 300` `border-radius: '0 16px 16px 0'` 변경 0 |
| **W3-#A** | **default Lucide X 교체** | size 16, var(--text-secondary), aria-label "메뉴 닫기" 보존 — 6 frame 모두 SVG 사용. LOCKED placeholder. |
| **W3-#B** | **default fire-bar 주황** | --status-fire-bar (#f97316 다크 / #c2410c 라이트) default. Frame 4 에서 danger-bar 빨강 alternative side-by-side. LOCKED placeholder. |

## 노안 격상 7건 (OQ #2 부분 절충)

| 항목 | source | sketch | 비고 |
|------|--------|--------|------|
| 부제 "소방안전 통합관리" | 9.5 | 12 | caption + leading-none |
| divider | 9 | 11 | uppercase letterSpacing .08em 유지 |
| soon 배지 | 10 | 12 | caption |
| item label | 12.5 | **16** | ★ 노안 마지노선 |
| badge | 11 monospace | 13 | sketch 채택 — 14/16 대안 panel overflow 검수 후 |
| 사용자 이름 | 11.5 | 14 | body-sm |
| 사용자 부제 | 9.5 | 12 | caption + leading-none |
| ✕ 글리프 (참고) | U+2715 fontSize 15 | Lucide X size 16 | W3-OQ #A default |

## 비즈 anchor 22건 (W7 TSX 변환 1 byte 변경 0 강제)

sketch HTML 머리 주석 박스 B + body `<div class="biz-anchors">` 두 번 박제. 핵심 22 anchor:

1. Props interface `{ open, onClose, unresolvedCount? }` (line 11~15)
2. `NAV_H = 'calc(54px + var(--sab, 0px))'` (line 9)
3. **MENU 상수 5섹션 17 아이템 verbatim** (line 19~54) — sketch 안 source 1:1 박제 (TypeScript 코드 블록 그대로) — MenuSettingsSection.tsx import source
4. `ITEM_META: Record<string, MenuItem>` (line 56~57)
5. `export type MenuItem = { label/path/badge/soon/role?/desktopOnly? }` (line 17)
6. import 7건 (useEffect/useMemo/useState, useNavigate, useQuery, useAuthStore, getMonthlySchedule, useStaffList, settingsApi+types) (line 1~7)
7. `useQuery({ queryKey: ['menu-config'], queryFn: settingsApi.getMenu, staleTime: 300_000 })` (line 63)
8. `appliedEntries: SideMenuEntry[]` useMemo (line 66~70)
9. `RAW_TO_LABEL: { '당':'당직', '비':'비번', '주':'주간', '휴':'연차' }` (line 72)
10. `todayShiftLabel` state default `'평일주간고정'` (line 73)
11. `todayShiftLabel` useEffect + 8:30am 분기 + getMonthlySchedule 의존 (line 74~86)
12. body scroll lock useEffect + touchmove preventDefault + #side-menu-panel hook (line 89~103) — memory feedback_body_scroll_lock_safe_area
13. `go(path) → navigate(path); onClose()` (line 105)
14. 오버레이 position fixed inset 0 zIndex 190 rgba(0,0,0,0.65) transition 'opacity 0.28s' (line 110~118)
15. panel `id="side-menu-panel"` (line 123) — touchmove 차단 hook 식별자
16. panel position fixed + width 82% maxWidth 300 + transform translateX + transition 'transform 0.3s cubic-bezier(.4,0,.2,1)' + borderRadius '0 16px 16px 0' (line 121~133) — OQ #7 LOCKED
17. 헤더 padding '12px 15px' + 로고 30×30 radius 8 + 타이틀 13/700 + 부제 9.5 + ✕ 닫기 28×28 radius 7 fontSize 15 (line 135~142)
18. divider padding '9px 13px 2px' fontSize 9 fontWeight 700 letterSpacing '.08em' uppercase (line 149)
19. item padding '9px 13px' margin '1px 7px' borderRadius 8 fontSize 12.5 fontWeight 500 transition 'background 0.13s' (line 163, 175)
20. soon 배지 opacity 0.5 + fontSize 10 + radius 6 + padding '2px 7px' "준비중" (line 164)
21. badgeCount 분기 (`/remediation` ? unresolvedCount : meta.badge) + 99+ cap (line 176~180) — W3-OQ #B default --danger → --status-fire-bar
22. 사용자 카드 padding '9px 11px' + 안쪽 row padding '8px 10px' bg var(--bg3) radius 9 + 아바타 28×28 그라데이션 fontSize 11 + 이름 11.5 + 직책+shift 9.5 (line 187~197)

## verify gate 9건 결과

| Gate | 룰 | 결과 |
|------|----|------|
| (1) font-size: 9/10/11/9.5/11.5/12.5 px body markup | 0건 (`/*` comment 예외 적용 후) | ✅ PASS — 1 match in `.side-divider { font-size: 11px; /* 9 -> 11 격상 */ }` 인데 plan §5 grep 의 `\s/\*` 필터로 제거됨 (격상값 11 자체는 OK) |
| (2) linear-gradient body markup 1건만 | OQ #3 사용자 아바타 보존 + doc 인용 ≥3 | ✅ PASS — `.side-user-avatar` CSS 1건 (functional) + caption/code doc 9건 (head comment 3 + body doc 6) |
| (3) `class="status-..."` 0건 | 격상값 11 자체는 OK | ✅ PASS — doc 인용 phrasing 도 "className status-*" 로 회피 |
| (4) `[data-theme="light"]` selector 정의 ≥1 | OQ #1 LOCKED 라이트 토큰 정의 | ✅ PASS — 6 selector occurrences (정의 + frame attribute 인용) |
| (5) `data-theme="light"` frame 부착 ≥3 | 정의 1 + frame ≥2 | ✅ PASS — 11 occurrences (정의 1 + Frame 3 1 + Frame 4 wrapper 1 + 기타 doc) |
| (6) 핵심 anchor verbatim (NAV_H, '0 16px 16px 0', side-menu-panel, queryKey, cubic-bezier, RAW_TO_LABEL, ITEM_META) | ≥1~2 each | ✅ PASS — 모두 충족 (3/13/8/3/7/4/4) |
| (7) MENU 5섹션 17 아이템 verbatim (`section: '주요 기능'`, `/inspection/qr`, `desktopOnly: true`, `role: 'admin'`) | ≥1/1/2/3 | ✅ PASS — 7/1/6/3 |
| (8) 보호 파일 git diff 0 | SideMenu.tsx + App.tsx + tokens.css + typography.css + design-system.md + tailwind.config.js + 31-chrome 9 파일 + 00-design-context/ | ✅ PASS — `git diff --name-only HEAD --` 0 줄 |
| (9) 라인 수 ≥600 | sketch 산출 적정 | ✅ PASS — 1621 라인 |

## 보호 파일 변경 0 확인

```
git diff --name-only HEAD -- \
  cha-bio-safety/src/components/SideMenu.tsx \
  cha-bio-safety/src/App.tsx \
  cha-bio-safety/tailwind.config.js \
  cha-bio-safety/docs/redesign-context/31-chrome/wave-1-index.md \
  cha-bio-safety/docs/redesign-context/31-chrome/{SideMenu.tsx,GlobalHeader.tsx,SettingsPanel.tsx,MenuSettingsSection.tsx,design-system.md,tokens.css,typography.css,sketch-wave-2-global-header.html} \
  cha-bio-safety/docs/redesign-context/00-design-context/
# → 0 줄 (PASS)
```

## atomic 1-commit

```
ca76944 docs(quick-260527-3qi): redesign/31-chrome W3 sketch — SideMenu (햄버거 슬라이드 드로어, 다크+라이트, OQ#2 부분 격상 7건 + W3-OQ#A Lucide X + W3-OQ#B fire-bar)
  1 file changed, 1621 insertions(+)
  create mode 100644 cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-3-side-menu.html
```

## 사용자 컨펌 사항 3건 (memory feedback_avoid_premature_confirmation)

> "거의 일치" 자신감 표현 금지 — 시안 결과 본 후 사용자 판단.

1. **W3-OQ #A — ✕ 글리프 (U+2715) → Lucide X 교체** default OK?
   - 본 sketch 6 frame 모두 Lucide X SVG 사용 시연 (size 16, var(--text-secondary), aria-label "메뉴 닫기").
   - 대안: U+2715 글리프 유지 (OQ #5 인라인 svg 유지 룰과 align — "글리프는 svg 아니라 텍스트 글리프이므로 OQ #5 적용 대상 아님" vs "memory feedback_tsx_wave_emoji_dot_gap 글리프도 negative 룰").

2. **W3-OQ #B — 미조치 badge 색** default OK?
   - 본 sketch default = `--status-fire-bar` 주황 (#f97316 다크 / #c2410c 라이트). Frame 4 에서 danger-bar 빨강 (#ef4444 / #b91c1c) alternative side-by-side 시연.
   - 근거 default: memory `feedback_inspection_unresolved_color` "미조치 색 = status-fire (주황). 사용자 인지 = 칩의 fire" — 메인 칩이 fire 인데 SideMenu badge 만 danger 면 inconsistent.
   - SideMenu badge 는 minWidth 16 작은 영역 — Frame 4 라이트에서 fire (#c2410c 어두운 주황) vs danger (#b91c1c 빨강) 시각 차이 검수 후 결정.

3. **OQ #2 격상 — panel 세로 overflow 영향 검수**
   - 본 sketch 적용 격상 7건: 부제 12 / divider 11 / item 16 / badge 13 / 사용자 이름 14 / 사용자 부제 12 / Lucide X 16.
   - item 12.5 → 16 (★ 노안 마지노선) 가 가장 큰 변화 — line-height 1.4 적용 시 한 줄 약 22.4 px + padding 11+11 → 약 44 px / 아이템.
   - 17 아이템 (5섹션 + divider 5건) × 평균 44 px ≈ 750 px → 모바일 viewport 높이 700~800 에서 `.side-list overflow-y: auto` 가 스크롤로 처리 (frame 1 에서 시연).
   - 만약 사용자가 "스크롤 발생 거슬림 → dense layout 회귀 (item 14 또는 padding 축소)" 결정 시 W7 sub-OQ.

## 다음 단계 (본 plan scope 밖)

1. 사용자 컨펌 3건 (W3-OQ #A / W3-OQ #B / OQ #2 panel overflow) 받은 후 main 머지 → cbc7119-preview 자동 배포.
2. W4 SettingsPanel sketch (894 라인 — 31-chrome 4 컴포넌트 중 가장 큰 sub-wave) 진입 또는 W5 MenuSettingsSection sketch (418 라인) 진입.
3. W6 TSX 변환 verify checklist markdown 작성 후 W7 TSX 변환 4 분할 (GlobalHeader → SideMenu → SettingsPanel → MenuSettingsSection) 진입.

## CLAUDE.md / CLAUDE.local.md 룰 준수

- ✅ `wrangler` 명령 호출 0 (CLAUDE.local.md `.claude/settings.local.json` deny 강제)
- ✅ `npm run deploy` 호출 0
- ✅ 디자인 룰 — sketch HTML 시안 먼저, TSX 변환은 W7 책임 (memory feedback_design_sketch_first)
- ✅ GSD workflow — `/gsd:quick` 통한 PLAN.md 작성 + executor 진입 (memory feedback_gsd_workflow_strict)
- ✅ atomic 1-commit — sketch HTML 1 파일만 stage / commit (다른 변경 0)

## Self-Check: PASSED

**Created files:**
- ✅ FOUND: `cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-3-side-menu.html` (1621 lines)

**Commits:**
- ✅ FOUND: `ca76944` — `docs(quick-260527-3qi): redesign/31-chrome W3 sketch — SideMenu ...`

**Protected files diff (HEAD relative):**
- ✅ SideMenu.tsx / App.tsx / tokens.css / typography.css / design-system.md / tailwind.config.js / wave-1-index.md / 31-chrome 7 스냅샷 / sketch-wave-2-global-header.html / 00-design-context/ — 모두 0 줄

**Verify gates 9건:** 모두 PASS (자동 verify oneliner `ALL VERIFY GATES PASS` 출력 확인됨).

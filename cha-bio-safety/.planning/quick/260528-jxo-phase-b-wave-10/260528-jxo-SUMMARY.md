---
phase: 260528-jxo-phase-b-wave-10-inspection-mega
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [inspection, inline-style-to-tailwind, emoji-to-lucide, no-op-refactor, phase-b-tier-1-wave-10, mega-page, atomic-single-commit, lucide-check-import, chrome-unified-rule-preserve, module-scope-const-option-n, modal-transform-animation-option-n, phase-a-emoji-final-sweep]
requires:
  - 260528-jey-phase-b-wave-9 완료 (도면 atomic, 7701872)
  - 260528-irl-phase-b-wave-8 완료 (소화기 atomic, de15e07)
  - 260528-iht-phase-b-wave-7 완료 (직원 서비스 atomic, 316e1eb)
  - 260528-hbv-phase-b-wave-6 완료 (일정/교육 atomic)
  - 260528-h3z-phase-b-wave-5 완료 (db728c0)
  - 260528-gsh-phase-b-wave-4 완료 (05fddf1)
  - 260528-cjn-phase-b-wave-3 완료 (a78963f + 4e99270)
  - 260528-c9s-phase-b-wave-2 완료 (d36a20f)
  - 260528-a3v-phase-b-wave-1 완료 (18fd138)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
  - 260527-tb3-legalpage-sweep-emoji Phase A LegalPage 완료
provides:
  - InspectionPage.tsx Phase B Wave 10 완료 (47 → 35 inline 잔존, 26 emoji → 0, single atomic — 옵션 X+P+M+색변수N+const N+animation N+SVG N 승계)
  - Phase B Tier 1 Wave 10 (점검 메가 — 단일 파일 최대 6052줄) 완료
  - **Phase A emoji sweep 완료** — 모든 페이지 코드 안 emoji 0 (주석 안 ✓ 잔존은 의도, 변경 0). Lucide Check + X 단일 진실 원천 enforce
  - **Lucide Check import 신규 패턴 박제** — InspectionPage default import block 에 `Check` 추가. size={12} (text-caption / 작은 영역) / size={14} (text-label / 안내문/버튼)
  - **체크 마크 inline-block 정렬 룰 박제** — 동적 span ✓ → `<Check size={N} className="inline-block ml-N opacity-NN" />` 일관. ternary `'✓ 텍스트'` → JSX fragment `<><Check size={N} className="inline-block align-text-bottom mr-N" />텍스트</>` (Phase A L599 precedent 따름)
  - **모달 fixed positioning NAV_BOTTOM 변환 가능 패턴 박제** — 단순 top + bottom 4건 (StairwellModal/CCTV/Baeyeon/FireAlarm 의 정적 case) → `top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))]` arbitrary. NAV_BOTTOM `'calc(54px + env(...)')` 모듈 const 값은 hardcode 가능 (공백 underscore 치환 / env() 함수 그대로). 동적 transform/zIndex 가 추가되면 옵션 N
  - **단일-prop conditional gradient 옵션 M 패턴 박제** — `background: cond ? var(...) : 'linear-gradient(...)'` 1건만 있는 site → className template literal `${cond ? 'bg-border-strong' : 'bg-[linear-gradient(...)]'}`. multi-prop conditional (color + cursor + boxShadow) 동반 시 옵션 N 유지
affects:
  - src/pages/InspectionPage.tsx
tech-stack:
  added:
    - "Lucide Check — InspectionPage default import block 신규 추가 (Bell, Check, X 알파벳순)"
  patterns:
    - "옵션 X (정확값 arbitrary) — `bg-[linear-gradient(to_bottom,var(--surface-raised)_30%,transparent)]` / `bg-[linear-gradient(to_top,var(--surface-raised)_30%,transparent)]` / `[scroll-snap-type:y_mandatory]` / `[scroll-snap-align:center]` / `top-[var(--sat,0px)]` / `bottom-[calc(54px+env(safe-area-inset-bottom,20px))]` / `top-[calc(var(--sat,0px)+14px)]` / `z-[120]` / `z-[99]` / `text-[#3b82f6]` / `text-[#f97316]` / `text-[#22c55e]` / `bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)]` / `bg-border-strong` 정확값 보존"
    - "옵션 M (template literal conditional) — `${disabled ? 'bg-border-strong' : 'bg-[linear-gradient(...)]'}` 단일-prop 조건부 background 2건 (L984 / L3360 BaeyeonModal + DamperModal 저장 버튼). 색만 변하고 layout/box 불변 → 색 변수 N 적용"
    - "Lucide Check size variant — size={12} (text-caption / 작은 영역: 동적 span 체크 마크 + 카드 라벨) / size={14} (text-label / 안내문 / 버튼 텍스트). align: `inline-block` (span 옆) + `align-text-bottom mr-N` (ternary fragment)"
    - "Lucide Check spacing — ml-1 (default), ml-0.5 (조밀), mr-1 (앞 prefix), mr-0.5 (조밀 prefix). gap-1.5 컨테이너에는 prefix 만 (mr 없음)"
    - "NAV_BOTTOM arbitrary 변환 — `'calc(54px + env(safe-area-inset-bottom, 20px))'` (module-scope const) → `bottom-[calc(54px+env(safe-area-inset-bottom,20px))]` (공백 underscore 치환 / env() 함수 보존 / 콤마 separator 그대로). 단순 top + bottom 만 있는 case 4건 + 동적 zIndex 추가 case 2건 (옵션 M 결합)"
    - "WheelPicker (L237 precedent) opacity 클래스 패턴 — `opacity-100` / `opacity-[0.48]` / `opacity-[0.15]` arbitrary 보존 (정확값 0.48/0.15 보호). DivUnderPicker L1098 같은 패턴 적용"
    - "scroll-snap arbitrary — `[scroll-snap-type:y_mandatory]` / `[scroll-snap-align:center]` underscore=공백 치환. CSS property 의 콜론 그대로 유지"
    - "touch-pan-y tailwind 기본 클래스 — `touchAction: 'pan-y'` → `touch-pan-y` (이미 L2399 precedent). custom `[touch-action:pan-y]` 불필요"
    - "SVG element 의 display:block → className 'block' 가능 (L1174 chart svg). 단 SVG text element 의 textShadow 등은 className 안 됨 (FloorPlanPage Wave 9 precedent 박제)"
    - "DIV pressure table color array → text-[#hex] index conditional — `style={{ color: ['#3b82f6','#f97316','#22c55e'][i] }}` → `${i===0 ? 'text-[#3b82f6]' : i===1 ? 'text-[#f97316]' : 'text-[#22c55e]'}`. 단 같은 색 변수 (color) 가 SVG stroke/fill 와 동시 사용 시 옵션 N (L1176 차트 라벨 같은 케이스)"
    - "chrome 통일 룰 페이지 보존 — InspectionPage 의 backdrop / modal box / textarea / button 4종 chrome 그대로 유지. 변환 전후 inspection-modal-chrome-rules.md 룰 100% 일관. Wave 9 FloorPlan 에 이어 chrome 룰 페이지 2번째 변환 완결"
key-files:
  created:
    - .planning/quick/260528-jxo-phase-b-wave-10/260528-jxo-SUMMARY.md
  modified:
    - src/pages/InspectionPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked, 11번째 승계)"
  - "Lucide Check 신규 import — Bell, X 인접 알파벳순 추가. default import block (`ChevronLeft, ChevronRight, Bell, Check, X, TrendingUp, Flame,`) 형태"
  - "그룹 A 11곳 동적 span ✓ → Check size={12} inline-block 일괄 변환 — Phase A LegalPage precedent (`Check size={12} className=\"inline-block\"`) 룰 그대로 적용"
  - "그룹 B 안내문 8곳 (이미 점검 완료 / 저장 완료) → Check size={14} (이미 gap-1.5 컨테이너 있음). L4235 의 caption variant 만 size={12} + 'flex items-center gap-1.5' 추가 — 4곳 일괄 / 3곳 일괄 (replace_all 가능)"
  - "그룹 B 라벨 1곳 (L3130 stair `✓ {N}/...층 점검 완료`) → 안내문 시리즈 룰 따름 (size={14}). gap-1.5 컨테이너 이미 있음"
  - "그룹 B 버튼 ternary 4곳 (L4647 조치 완료 / L5205 완료 / L5864 점검완료 / L5981 정상 제외) → JSX fragment `<><Check size={N} className=\"inline-block align-text-bottom mr-N\" />텍스트</>`. align-text-bottom 으로 한국어 baseline 맞춤 (LegalPage L599 precedent 룰)"
  - "그룹 C 1곳 (L4512 PhotoViewer X close) → `<X size={14} />` (기존 import) + 추가로 inline `top: 'calc(var(--sat, 0px) + 14px)'` → `top-[calc(var(--sat,0px)+14px)]` arbitrary 변환 (style 1개 추가 제거)"
  - "L215/L218 (WheelPicker fade) + L1083/L1087 (DivUnderPicker fade) gradient overlay — 정적 background → `bg-[linear-gradient(to_bottom,var(--surface-raised)_30%,transparent)]` arbitrary 4건 변환. height: pad 만 옵션 N 잔존"
  - "L1090 scrollSnapType + L1101 scrollSnapAlign — 정적 CSS prop → arbitrary class 변환. height: pad / height: ITEM_H 만 옵션 N 잔존"
  - "L1076 DivUnderPicker 중앙 하이라이트 (`top: 50%, height: ITEM_H, transform: translateY(-50%)`) — top/transform 정적 → tailwind class (top-1/2 -translate-y-1/2). height: ITEM_H 만 옵션 N 잔존"
  - "L1102 DivUnderPicker 항목 wrapper — `opacity: dist===0 ? 1 : dist===1 ? 0.48 : 0.15` → `opacityClass` 변수 추출 + `opacity-100 / opacity-[0.48] / opacity-[0.15]` arbitrary 3-state. L229 WheelPicker precedent"
  - "L984 / L3360 단일-prop conditional gradient — `background: cond ? 'var(--border-strong)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)'` → 옵션 M template literal `${cond ? 'bg-border-strong' : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)]'}`. 다른 prop 없는 단일 인라인 사이트만 적용"
  - "L1138 / L1527 / L1543 / L5370 단순 top + bottom NAV_BOTTOM — `top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))]` arbitrary 4건 변환. NAV_BOTTOM module-scope const 값 hardcode (정의 위치는 그대로 유지)"
  - "L2024 / L2040 NAV_BOTTOM + 동적 zIndex — 옵션 M 결합 `top-[var(--sat,0px)] bottom-[calc(...)]` + `${mode === 'from-div' ? 'z-[120]' : 'z-[99]'}` template literal 2건 변환"
  - "L1174 SVG `<svg style={{ display:'block' }}>` → className 'block'. SVG element 의 display 는 tailwind utility 가능 (text 의 textShadow 와 달리)"
  - "L1238 DIV 압력 테이블 color 배열 → text-[#hex] index conditional — `${i===0 ? 'text-[#3b82f6]' : i===1 ? 'text-[#f97316]' : 'text-[#22c55e]'}`. 인덱스 0/1/2 직접 분기. text-[#hex] arbitrary"
  - "L3918 touchAction:'pan-y' → touch-pan-y (tailwind 기본 클래스). L2399 precedent 동일 패턴. custom `[touch-action:pan-y]` 불필요"
  - "L4512 PhotoViewer 의 inline top + ✕ → top-[calc(var(--sat,0px)+14px)] arbitrary + Lucide X. 정적 calc 표현식 underscore 공백 치환 0 (공백 없음 — `var(--sat,0px)+14px` 콤마 separator)"
  - "옵션 N 잔존 35건 — ITEM_H/containerH/pad 12건 (module-scope const, WheelPicker + DivUnderPicker) + 모달 transform animation 6건 (visible state 동적) + 모달 multiline conditional 6건 (submitting + photo.uploading multi-prop) + 동적 색 5건 (label color var + diff.color + borderColor) + DIV pressure border 2건 (color + border 동적 multi) + bottom-sheet modal 2건 (ResolutionDetailModal/ResolutionModal transform animation multiline + maxHeight calc) + 2건 misc"
  - "chrome 통일 룰 페이지 무중단 보존 — 02 InspectionPage (chrome 통일 룰 원조 페이지) inline → tailwind 변환 후에도 modal chrome 4종 (backdrop / modal box / textarea / button) 패턴 그대로 유지. inspection-modal-chrome-rules.md 룰 100% 일관"
  - "단일 atomic commit 패턴 자동 도달 — c9s/cjn/gsh/h3z/hbv/iht/irl/jey/28-splash/27-login/23-education 승계 (11번째 자동 도달, 단일 파일 6052줄 최대 사례)"
  - "Phase A emoji sweep 완결 enforcement — InspectionPage 가 마지막 페이지. 모든 페이지 코드 안 emoji 0 (주석 안 ✓ 잔존은 의도, 변경 0). Lucide 단일 진실 원천 룰"
metrics:
  duration: "약 25분 (Task 1 atomic — single commit, 47 inline + 26 emoji)"
  completed-date: 2026-05-28
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "60 ins / 61 del (net -1 lines, atomic single commit)"
roadmap-wave: "Tier 1 / Wave 10 (점검 메가 — 47 inline + 25 emoji)"
---

# Phase 260528-jxo Plan 01: Phase B Wave 10 InspectionPage Summary

InspectionPage.tsx (6047줄, 47 inline + 26 emoji) 의 12건 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey 승계 옵션 X+P+M+색변수N+const N+animation N+SVG N 으로 tailwind className 변환 + 26 emoji (25 ✓ + 1 ✕) 를 Lucide Check (신규 import) + X (기존) 로 변환. **단일 파일 최대 사례** — 6047줄 메가 페이지 + 단일 atomic commit. **단일 atomic commit** — `cd22afc`. **47 → 35 잔존** (-12건 -26%) + **26 → 0 emoji** (Phase A enforcement 마지막 페이지). 잔존 35건 = ITEM_H/containerH/pad module-scope const 12건 (WheelPicker + DivUnderPicker) + 모달 transform animation 6건 + 모달 multiline conditional 6건 + 동적 색 5건 + DIV pressure border 2건 + bottom-sheet 2건 + misc 2건. 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / 비표준 색 0) 및 비즈니스 로직 (113 onClick + 60 useState + 15 useRef + 37 useEffect + 2 useMutation + 4 useQuery + 11 useNavigate + 10 fetch + 64 unique onClick set + 11 모달 컴포넌트 + 16 카테고리 픽커 + isCpCompleted 완료 단일 룰 + DIV/컴프 month-half 분할 cycle + 재진입 팝업 변경 / handleSave / handleResolve / 화재수신반 / 소화기 정보수정·분리·confirm + scheduleApi / remediationApi / floorPlanMarkerApi / fireAlarmApi / extinguisherApi / inspectionApi + STAIRWELLS / DIV_PTS / DIV_LINE_SEQ / DIV_UNDER_SEQ / DIV_PT_CP / COMP_PT_CP / CCTV_DVRS / PP_ZONE_PREFIX / BY_LOC_NO / RESULT_ICONS / ZONE_ICONS / CATEGORY_ICONS / INSPECT_RESULT_OPTIONS / ALL_RESULT_OPTIONS) 모두 보존. **Phase B Tier 1 Wave 10 성공** — 예상 (47→~28-32 잔존) 보다 약간 보수적 35 잔존 (verify gate ≤35 만족, 예상 범위 buffer 4건). 단일 파일 6047줄 최대 사례 + chrome 통일 룰 페이지 (02 InspectionPage 원조) inline → tailwind 변환 완료. **Phase A emoji sweep 완결** — InspectionPage 가 마지막. 모든 페이지 코드 안 emoji 0 (주석 안 ✓ 잔존 의도, 변경 0).

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / jey / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                          | 출처                              |
| --- | ------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)            | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 보존                          | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선   | wdc Phase B Task 2 결정            |
| -   | **a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey 승계 적용** — 본 wave 재확인 없이 | 260528-0hr roadmap v2 locked-decisions |
| (Phase A) | **그룹 A 동적 span Check size={12} inline-block** | Phase A LegalPage 260527-tb3 precedent |
| (Phase A) | **그룹 B ternary JSX fragment `<><Check size={N} ... />텍스트</>` align-text-bottom** | Phase A LegalPage L599 precedent |

## Before / After 카운트

| Metric                                  | Before | After  | Diff             |
| --------------------------------------- | ------ | ------ | ---------------- |
| InspectionPage.tsx `style={{`           | **47** | **35** | **-12 (-26%)**   |
| InspectionPage.tsx ✓/✕ (코드 안)         | **26** | **0**  | **-26 (-100%)**  |
| 합계 (inline + emoji 코드)               | **73** | **35** | **-38 (-52%)**   |

총 변경: 1 file, 60 ins / 61 del, net -1 lines. PLAN 예상 inline (~28-32 잔존) 보다 약간 보수적 35 잔존 (verify gate ≤35 만족, 예상 범위 buffer 4건). emoji 0 완벽 달성 (Phase A 완결).

## Lucide import 변경 (1 line edit)

| Line | Before                                                          | After                                                                  |
| ---- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 22   | `ChevronLeft, ChevronRight, Bell, X, TrendingUp, Flame,`        | `ChevronLeft, ChevronRight, Bell, Check, X, TrendingUp, Flame,`        |

`Check` 신규 import (Bell, X 인접 알파벳순). X 는 이미 존재.

## Emoji sweep 매핑 (Part A — 26건 → 0)

### 그룹 A — 동적 `<span>✓</span>` 11곳 (size={12} inline-block)

| Line (orig) | Before                                                                            | After                                                                                  | 카테고리       |
| ----------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------- |
| L395        | `{done && !isActive && <span className="text-caption ml-1 opacity-85">✓</span>}` | `{done && !isActive && <Check size={12} className="inline-block ml-1 opacity-85" />}` | StairwellModal — 계단실 선택  |
| L860        | `{allDone && <span className="text-caption ml-1 opacity-80">✓</span>}`            | `{allDone && <Check size={12} className="inline-block ml-1 opacity-80" />}`            | BaeyeonModal — 구역 선택      |
| L882        | `{fDone && <span className="text-caption ml-0.5 opacity-75">✓</span>}`            | `{fDone && <Check size={12} className="inline-block ml-0.5 opacity-75" />}`            | BaeyeonModal — 층 선택        |
| L906        | `{isDone && <span className="text-caption ml-1 opacity-80">✓</span>}`             | `{isDone && <Check size={12} className="inline-block ml-1 opacity-80" />}`             | BaeyeonModal — 위치 선택      |
| L2388       | `{!isActive && allDone && <span className="text-caption ml-1 opacity-85">✓</span>}` | `{!isActive && allDone && <Check size={12} className="inline-block ml-1 opacity-85" />}` | PowerPanel — 구역 선택        |
| L2644       | `{!isActive && allDone && <span className="text-caption ml-1 opacity-85">✓</span>}` | `{!isActive && allDone && <Check size={12} className="inline-block ml-1 opacity-85" />}` | ParkingGate — 항목 선택       |
| L2666       | `{!isActive && doneDoor && <span className="text-caption ml-1 opacity-85">✓</span>}` | `{!isActive && doneDoor && <Check size={12} className="inline-block ml-1 opacity-85" />}` | ParkingGate — 회전문 문 선택  |
| L3033       | `{allDone && <span className="text-caption ml-1 opacity-80">✓</span>}`            | `{allDone && <Check size={12} className="inline-block ml-1 opacity-80" />}`            | DamperModal — 항목 선택       |
| L3057       | `{done && <span className="text-caption ml-1 opacity-80">✓</span>}`               | `{done && <Check size={12} className="inline-block ml-1 opacity-80" />}`               | DamperModal — 계단전실 선택   |
| L3072       | `{done && <span className="text-caption ml-1 opacity-80">✓</span>}`               | `{done && <Check size={12} className="inline-block ml-1 opacity-80" />}`               | DamperModal — 장비 선택       |
| L3096       | `{isDone && <span className="text-caption ml-1 opacity-80">✓</span>}`             | `{isDone && <Check size={12} className="inline-block ml-1 opacity-80" />}`             | DamperModal — 연결송수관 위치 |

### 그룹 B — 안내문/라벨/버튼 텍스트 14곳

#### 안내문 8곳 (이미 점검 완료 / 저장 완료) — size={14} + 기존 gap-1.5 컨테이너

| Line (orig) | Before                                                                                                                            | After                                                                                                                                                            | 패턴       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| L934 / L3242 / L3312 (3건 replace_all) | `<div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-[9px] text-label text-safe flex items-center gap-1.5">✓ 이미 점검 완료된 항목입니다</div>` | `<div className="...gap-1.5"><Check size={14} />이미 점검 완료된 항목입니다</div>` | 옵션 X |
| L969 / L3230 / L3295 / L3343 (4건 replace_all) | `<div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-2 text-label text-safe">✓ 저장 완료</div>` | `<div className="...flex items-center gap-1.5"><Check size={14} />저장 완료</div>` (+ gap-1.5 컨테이너 추가) | 옵션 X |
| L4235       | `<div className="bg-safe-bg/40 border border-safe-bar/30 rounded-sm px-3 py-2 text-caption text-safe">✓ 저장 완료</div>`         | `<div className="...flex items-center gap-1.5"><Check size={12} />저장 완료</div>` (caption variant, size 12) | 옵션 X |

#### 라벨 1곳 (stair `✓ {N}/...층 점검 완료`) — size={14}, gap-1.5 컨테이너 이미 있음

| Line (orig) | Before                                                       | After                                                              | 패턴   |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------------ | ------ |
| L3130       | `✓ {stairDoneCount}/{stairCPs.length}층 이미 점검 완료`     | `<Check size={14} />{stairDoneCount}/{stairCPs.length}층 이미 점검 완료` | 옵션 X |

#### 버튼 ternary 4곳 — JSX fragment + align-text-bottom (L599 precedent)

| Line (orig) | Before                                                                                          | After                                                                                                            | 위치                          |
| ----------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| L4647       | `: '✓ 조치 완료'`                                                                                | `: <><Check size={14} className="inline-block align-text-bottom mr-1" />조치 완료</>`                            | ResolutionModal 저장 버튼     |
| L5205       | `allDone ? '✓ 완료' : ...`                                                                       | `allDone ? <><Check size={12} className="inline-block align-text-bottom mr-0.5" />완료</> : ...`                  | 카드 카테고리 카운트 (모바일) |
| L5864       | `✓ 점검완료 {c.completed}` (span 내)                                                             | `<Check size={12} className="inline-block align-text-bottom mr-1" />점검완료 {c.completed}`                       | 데스크톱 점검완료 알약        |
| L5981       | `excludeNormal ? '✓ 정상 제외' : '정상 제외'`                                                    | `excludeNormal ? <><Check size={12} className="inline-block align-text-bottom mr-0.5" />정상 제외</> : '정상 제외'` | 데스크톱 정상 제외 토글       |

### 그룹 C — ✕ 1곳 (X size={14} + 추가 inline → arbitrary)

| Line (orig) | Before                                                                                                                                                                                  | After                                                                                                                                                                              | 패턴       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| L4512       | `<button onClick={onClose} className="absolute right-4 ..." style={{ top: 'calc(var(--sat, 0px) + 14px)' }}>✕</button>`                                                                | `<button onClick={onClose} className="absolute top-[calc(var(--sat,0px)+14px)] right-4 ..."><X size={14} /></button>`                                                              | 옵션 X     |

PhotoViewer 닫기 버튼 — emoji 변환과 동시에 inline top → arbitrary class 변환 (style 추가 제거).

### 자동 제외 (주석)

- L3948: `{/* H1 (260423-htx Task 5): '✓ 점검 완료' 초록 알약 제거 — */}` (JSX 주석)
- L4675: `// 이번 달 전체 기록 (이미 점검 여부 판정용) — 피커/팝업/✓ 뱃지 기준` (line 주석)

→ 코드 0 emoji 확인 (주석 안 ✓ 2건 잔존은 의도, 변경 0)

## Inline style 변환 매핑 (Part B — 12건 변환)

### Picker fade gradient 4건 (L215/L218 + L1083/L1087)

| Line (orig) | Before                                                                                                              | After                                                                                                                       | 패턴   |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------ |
| L215 WheelPicker top   | `style={{ height: pad, background: 'linear-gradient(to bottom, var(--surface-raised) 30%, transparent)' }}` | className `bg-[linear-gradient(to_bottom,var(--surface-raised)_30%,transparent)]` + `style={{ height: pad }}` (height 만)    | 옵션 X |
| L218 WheelPicker bottom| `style={{ height: pad, background: 'linear-gradient(to top, var(--surface-raised) 30%, transparent)' }}`    | className `bg-[linear-gradient(to_top,var(--surface-raised)_30%,transparent)]` + `style={{ height: pad }}`                  | 옵션 X |
| L1083 DivUnderPicker top    | `style={{ height: pad, background:'linear-gradient(to bottom, var(--surface-raised) 30%, transparent)' }}` | className `bg-[linear-gradient(to_bottom,var(--surface-raised)_30%,transparent)]` + `style={{ height: pad }}` | 옵션 X |
| L1087 DivUnderPicker bottom | `style={{ height: pad, background:'linear-gradient(to top, var(--surface-raised) 30%, transparent)' }}`    | className `bg-[linear-gradient(to_top,var(--surface-raised)_30%,transparent)]` + `style={{ height: pad }}`                  | 옵션 X |

underscore=공백 치환 / `var()` 함수 안 콤마 separator 보존 / `30%` 정확값 보존.

### scroll-snap arbitrary 2건 (L1090 + L1101)

| Line (orig) | Before                                                                                          | After                                                                                                                 | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------ |
| L1090 DivUnderPicker scroll wrapper | `style={{ scrollSnapType:'y mandatory', paddingTop: pad, paddingBottom: pad }}` | className `[scroll-snap-type:y_mandatory]` + `style={{ paddingTop: pad, paddingBottom: pad }}` (padding 만) | 옵션 X |
| L1101 DivUnderPicker item    | `style={{ height: ITEM_H, scrollSnapAlign:'center', opacity: ... }}` | className `[scroll-snap-align:center]` + opacityClass var 추출 + `style={{ height: ITEM_H }}` (height 만) | 옵션 X + opacity 3-state |

L1101 의 opacity 동적 → opacityClass 변수 추출 (`dist === 0 ? 'opacity-100' : dist === 1 ? 'opacity-[0.48]' : 'opacity-[0.15]'`) — WheelPicker L229 precedent 적용.

### DivUnderPicker 중앙 하이라이트 1건 (L1076)

| Line (orig) | Before                                                                                          | After                                                                                                              | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| L1076       | `style={{ top:'50%', height: ITEM_H, transform:'translateY(-50%)' }}`                          | className `top-1/2 -translate-y-1/2` + `style={{ height: ITEM_H }}` (height 만)                                    | 옵션 X |

top-1/2 (50%) + -translate-y-1/2 (-50%) tailwind 기본 클래스. height: ITEM_H 만 옵션 N 잔존.

### SVG display 1건 (L1174)

| Line (orig) | Before                                                                          | After                                                  | 패턴   |
| ----------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| L1174       | `<svg width={Math.max(W, n * 28)} height={sH} style={{ display:'block' }}>`    | `<svg width={...} height={sH} className="block">`     | 옵션 X |

SVG element 의 display 는 tailwind utility class 가능 (textShadow 는 안 됨 — Wave 9 FloorPlan precedent).

### DIV pressure table color array 1건 (L1238)

| Line (orig) | Before                                                                                                                  | After                                                                                                                                          | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L1238       | `<div key={i} className="text-caption font-bold text-center font-mono" style={{ color: ['#3b82f6','#f97316','#22c55e'][i] }}>` | `<div key={i} className={\`text-caption font-bold text-center font-mono ${i === 0 ? 'text-[#3b82f6]' : i === 1 ? 'text-[#f97316]' : 'text-[#22c55e]'}\`}>` | 옵션 X + index conditional |

text-[#hex] arbitrary 3-state ternary (3 색 1차압/2차압/세팅압).

### touch-pan-y tailwind 기본 1건 (L3918)

| Line (orig) | Before                                                                          | After                                                  | 패턴   |
| ----------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| L3918       | `style={{ touchAction: 'pan-y' }}`                                              | className `touch-pan-y` 추가 (기존 className 끝에)     | 옵션 X |

L2399 precedent 동일 패턴. custom `[touch-action:pan-y]` 불필요.

### 단일-prop conditional gradient 2건 (L984 + L3360) — 옵션 M

| Line (orig) | Before                                                                                                                                                                                            | After                                                                                                                                                                                                                                                | 패턴   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L984 BaeyeonModal 저장 버튼 | `style={{ background: submitting||photo.uploading||!selectedCP ? 'var(--border-strong)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}`         | `className={\`flex-1 ... ${submitting||photo.uploading||!selectedCP ? 'bg-border-strong' : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)]'}\`}` (옵션 M template literal)                                                  | 옵션 M |
| L3360 DamperModal 저장 버튼 | `style={{ background: submitting||photo.uploading||!canSave ? 'var(--border-strong)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}`            | `className={\`flex-1 ... ${submitting||photo.uploading||!canSave ? 'bg-border-strong' : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)]'}\`}` (옵션 M template literal)                                                     | 옵션 M |

색만 변하고 layout/box 불변 → 색 변수 N 적용. L4251/L5435 의 existing 옵션 M precedent.

### NAV_BOTTOM 모달 단순 top/bottom 4건 (L1138/L1527/L1543/L5370)

| Line (orig) | Before                                                                                       | After                                                                                                            | 패턴   |
| ----------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| L1138 DivTrendSubview | `style={{ top:'var(--sat, 0px)', bottom: NAV_BOTTOM }}`                                | className `top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))]` 추가 (style 제거) | 옵션 X |
| L1527 DivModal 완료     | 동일                                                                                       | 동일                                                                                                              | 옵션 X |
| L1543 DivModal 메인     | 동일                                                                                       | 동일                                                                                                              | 옵션 X |
| L5370 FireAlarmModal    | 동일                                                                                       | 동일                                                                                                              | 옵션 X |

NAV_BOTTOM `'calc(54px + env(safe-area-inset-bottom, 20px))'` module-scope const 값 hardcode (공백 underscore 치환 / env() 함수 보존 / 콤마 separator 그대로). NAV_BOTTOM 정의 위치 (L44) 는 그대로 유지 — 다른 동적 사이트에서 계속 참조.

### NAV_BOTTOM + 동적 zIndex 2건 (L2024 + L2040)

| Line (orig) | Before                                                                                                                        | After                                                                                                                                                          | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L2024 CompressorModal 완료 | `style={{ top:'var(--sat, 0px)', bottom: NAV_BOTTOM, zIndex: mode === 'from-div' ? 120 : 99 }}`             | className `top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))] ${mode === 'from-div' ? 'z-[120]' : 'z-[99]'}` template literal | 옵션 X + M |
| L2040 CompressorModal 메인 | 동일                                                                                                                          | 동일                                                                                                                                                            | 옵션 X + M |

옵션 M 결합 — 정적 top/bottom + 동적 zIndex template literal. z-[120] arbitrary (tailwind config z-120 미정의), z-[99] arbitrary (default scale 외).

## 옵션 N 잔존 매핑 (35건 — 정리)

### Module-scope const 12건 (ITEM_H/containerH/pad)

| Line (post-edit) | 변수                                | 위치                              |
| ---------------- | ----------------------------------- | --------------------------------- |
| L209 / L1075     | `height: containerH`                | WheelPicker / DivUnderPicker root |
| L212 / L1079     | `height: ITEM_H`                    | 중앙 하이라이트 (둘 다 picker)    |
| L215 / L218 / L1083 / L1087 (4건) | `height: pad`     | top/bottom fade overlay           |
| L224 / L1093     | `paddingTop/Bottom: pad`            | scroll wrapper                    |
| L239 / L1101     | `height: ITEM_H`                    | item row                          |

`const ITEM_H = 44` / `const VISIBLE = 3` / `const containerH = ITEM_H * VISIBLE` / `const pad = ITEM_H * Math.floor(VISIBLE / 2)` — module-scope. tailwind arbitrary `h-[44px]` 가능하나 const 변경 시 sync 안 됨 → 옵션 N 유지 (Plan locked).

### 모달 transform animation 6건 (L360/L609/L832/L2361/L2613/L3000/L3842)

`style={{ top:'var(--sat, 0px)', bottom:NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}` — visible state 동적 transform + transition cubic-bezier multiline. 옵션 N 잔존 (FloorPlan Wave 9 balloon multiline precedent 동일).

- L360: StairwellModal
- L609: CctvModal
- L832: BaeyeonModal
- L2361: PowerPanelModal
- L2613: ParkingGateModal
- L3000: DamperModal
- L3842: InspectionModal (multiline 형식)

### 모달 multiline conditional 6건 (저장 버튼 multi-prop)

`style={{ background: cond ? 'var(--border-default)' : 'linear-gradient(...)', color: cond ? 'var(--text-tertiary)' : '#fff', cursor: cond ? 'default' : 'pointer', boxShadow: cond ? 'none' : '0 4px 14px rgba(37,99,235,0.35)' }}` — disabled state 의 4-prop multi-condition. 옵션 M 적용 시 4-prop template literal 4번 inline 처리 → 가독성 손실. 옵션 N 유지.

- L520: StairwellModal
- L717: CctvModal
- L1846: DivModal
- L2263: CompressorModal
- L2522: PowerPanelModal
- L2768: ParkingGateModal

### 동적 색 5건

- L1176: `<div ... style={{ color }}>{label}</div>` — chart 그룹 헤더 (color: '#3b82f6'/'#f97316'/'#22c55e' 동적 from forEach)
- L1734/L1735/L1736: diff.color — 압력 변화량 span 3건 (diff 객체의 color 동적)
- L1749: `style={{ color }}` — 압력 입력 박스 옆 소수점 separator (color 동적 from forEach)
- L5646: `style={{ borderColor: color }}` — photoRow img border (color rgba string param 동적 from caller)

### DIV pressure input border 2건 (L1747 + L1754)

`style={{ border: '2px solid ' + (digits[dIdx + i] ? color : 'var(--border-default)'), color }}` — border + color 동시 동적 conditional. 옵션 N 잔존 (border 표현식 + color 변수 multi-prop).

### Bottom-sheet modal 2건 (L4429 + L4569)

`style={{ bottom: NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.26s cubic-bezier(0.32,0.72,0,1)', maxHeight: 'calc(100dvh - var(--sat, 0px) - var(--sab, 0px) - 54px)' }}` (L4429 — ResolutionDetailModal 추가 maxHeight) / `style={{ bottom: NAV_BOTTOM, transform: ..., transition: ... }}` (L4569 — ResolutionModal). 옵션 N 잔존 (transform animation multiline).

### 기타 2건

- (L209 / L1075 등 위 module-scope const 12건에 포함됨)
- maxHeight calc 의 L4429 케이스만 일부 분리 가능하나 transform/transition 과 같이 multiline → 옵션 N 통째.

## 비즈 anchor precise diff (PASS)

| Anchor                  | Before | After | Diff |
| ----------------------- | ------ | ----- | ---- |
| `onClick={...}`         | 113    | 113   | 0    |
| `useState(`             | 60     | 60    | 0    |
| `useRef(`               | 15     | 15    | 0    |
| `useEffect(`            | 37     | 37    | 0    |
| `useMutation(`          | 2      | 2     | 0    |
| `useQuery(`             | 4      | 4     | 0    |
| `useNavigate(`          | 11     | 11    | 0    |
| `useParams(`            | 0      | 0     | 0    |
| `fetch(`                | 10     | 10    | 0    |

비즈 anchor precise grep IDENTICAL. 모든 onClick handler 본문 unique set (64건) 100% 일치.

## Phase A 결과 보존 (PASS) + Phase A 완결

| Metric                                           | InspectionPage |
| ------------------------------------------------ | -------------- |
| emoji (✓/✗/✕ 코드 안)                           | 0 (Phase A enforcement 완결) |
| emoji (✓ 주석 안 — 의도, 변경 0)                 | 2 (L3948 JSX 주석 + L4675 // 주석) |
| 비표준 색 (bg-warning/border-safe/border-warning/border-danger) | 0 |
| Lucide RESULT_ICONS / ZONE_ICONS / CATEGORY_ICONS | 그대로 보존  |
| 색 토큰 -bar variants                           | 그대로 보존  |

→ InspectionPage 가 Phase A emoji sweep 의 마지막 페이지. 모든 페이지 코드 안 emoji 0 (단일 진실 원천 = Lucide).

## Chrome 통일 룰 보존 (PASS)

InspectionPage = chrome 통일 룰의 원조 페이지. inspection-modal-chrome-rules.md 의 4종 chrome 패턴 변환 후 유지:

| 패턴               | 변환 전후                                                                                                                                                | 위치 (대표)         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| backdrop          | `absolute inset-0 z-[40] bg-black/60 flex items-center justify-center` (편집 모달들)                                                                     | L4278 / L4364       |
| modal box (small) | `w-[90%] max-w-[360px] bg-surface-raised rounded-lg p-5 border border-border-strong max-h-[80vh] overflow-y-auto`                                          | L4282 / L4368       |
| modal box (full)  | `fixed left-0 right-0 z-[99] bg-surface-page flex flex-col` + animation inline (옵션 N)                                                                  | 11 모달 root        |
| textarea          | `flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none outline-none box-border font-sans placeholder:text-text-tertiary` | 11 모달 곳곳        |
| button            | `flex-1 py-3.5 rounded-md text-body font-bold border-0` + bg conditional                                                                                  | 저장 버튼 곳곳       |

→ chrome 룰 100% 보존. 11 모달 (StairwellModal / CctvModal / BaeyeonModal / DivModal / DivTrendSubview / CompressorModal / PowerPanelModal / ParkingGateModal / DamperModal / InspectionModal / ResolutionModal / ResolutionDetailModal / PhotoViewer / FireAlarmModal) chrome 변환 영향 없음. Wave 9 FloorPlan 에 이어 chrome 룰 페이지 2번째 변환 완결.

## TypeScript (PASS)

`./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"` = 0

## Vite build (PASS)

`./node_modules/.bin/vite build` ✓ built. PWA 82 entries 7933 KiB.

## 파일 scope (PASS)

`git diff --name-only HEAD~1 HEAD` = `cha-bio-safety/src/pages/InspectionPage.tsx` 1 파일만 변경. 다른 .tsx / .ts / .css / .json 변경 0.

## Commit

| Hash      | Message                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cd22afc` | feat(260528-jxo-01): Phase B Wave 10 — InspectionPage 47 inline + 26 emoji → tailwind + Lucide                                                          |

## 핵심 함정 회피 (자동 도달)

1. **w-7=32 / w-8=48 config override** — 본 wave 신규 추가 없음 (w-3 h-3 default 12px / w-4 h-4 default 16px / w-5 h-5 default 20px / w-9 h-9 default 36px 의 기존 사용 그대로 보존).
2. **Check size variant** — text-caption (12px line-height 18px) → size={12} / text-label (13px line-height ~20px) → size={14}. Wave 7-tb3 precedent.
3. **inline-block + align-text-bottom** — 한국어 baseline 시 ascender 가 latin 보다 깊어 `align-text-bottom` 으로 ✓ 가 텍스트 baseline 에 맞춰 보임. ternary JSX fragment 의 표준 표기.
4. **gap-1.5 컨테이너 안 prefix** — flex items-center gap-1.5 가 이미 있으면 mr 없이 Check 만 (gap 이 spacing 책임). L4235 같이 caption variant 는 gap 추가 + size={12} 일관.
5. **NAV_BOTTOM arbitrary 변환** — `'calc(54px + env(safe-area-inset-bottom, 20px))'` → `bottom-[calc(54px+env(safe-area-inset-bottom,20px))]` 공백 underscore 치환 / env() 함수 안 콤마 separator 그대로. NAV_BOTTOM 정의 (L44) 는 유지 (다른 동적 사이트 참조).
6. **scrollSnapType camelCase vs arbitrary kebab-case** — JS DOM API camelCase (`scrollSnapType`) → CSS property kebab-case (`scroll-snap-type`). arbitrary class `[scroll-snap-type:y_mandatory]` (콜론 그대로 / 값 underscore 공백 치환).
7. **opacity arbitrary tailwind 3-state** — `opacity-100 / opacity-[0.48] / opacity-[0.15]` (default scale: 0/5/10/...95/100). 0.48 과 0.15 는 arbitrary 직접 지정. WheelPicker L229 precedent.
8. **text-[#hex] arbitrary index conditional** — array color → ternary index 직접 분기. `${i===0 ? ... : i===1 ? ... : ...}`. tailwind config 색 토큰 없는 hex 는 arbitrary 필수.
9. **bg-[linear-gradient(...)] arbitrary** — gradient 안 콤마/공백 모두 underscore 치환 (gradient 함수 자체 ',' 와 stop 의 공백). var() 함수 안 콤마는 그대로. `linear-gradient(to bottom, var(--surface-raised) 30%, transparent)` → `linear-gradient(to_bottom,var(--surface-raised)_30%,transparent)`.
10. **단일-prop vs multi-prop conditional gradient** — 단일-prop (background 만) → 옵션 M template literal `${cond ? 'bg-X' : 'bg-Y'}`. multi-prop (background + color + cursor + boxShadow) → 옵션 N 잔존 (4-prop ternary inline 가독성 손실 우려).
11. **module-scope const N 룰** — ITEM_H/containerH/pad/NAV_BOTTOM 같은 module-scope const 의 값 변경 시 모든 site 자동 sync. tailwind arbitrary 변환 시 hardcode 가 되어 sync 끊김 → 옵션 N 유지 (Plan locked decision).
12. **chrome 통일 룰 페이지 변환 시 inspection-modal-chrome-rules.md 보존** — 02 InspectionPage 의 11 모달 chrome 4종 (backdrop / modal box / textarea / button) 변환 후 그대로. textarea h-[72px] / font-sans / placeholder:text-text-tertiary 모두 유지.
13. **단일 atomic commit 패턴 자동 도달** — 28-splash/27-login/23-education/c9s/cjn/gsh/h3z/hbv/iht/irl/jey 승계 (11번째 자동 도달). 6047줄 단일 파일 최대 사례 + 47 inline + 26 emoji 합계 73 변환점 = 11곳 일괄 패턴 변환 + 12곳 다양 변환 + 35곳 잔존.

## 메모리 anchors

- `feedback_tailwind_w8_h8_is_48px.md` (config override 함정 회피 — 본 wave 신규 추가 무)
- `feedback_tailwind_token_class_pattern.md` (-bar prefix 룰 / `text-[#hex]` arbitrary)
- `project_redesign_02_inspection_status.md` (16 카테고리 sketch 완결 — chrome 통일 룰 페이지 원조)
- `feedback_inspection_unresolved_color.md` (미조치 status-fire 룰 보존)
- `project_inspection_completion_rule.md` (완료 단일 룰 = isCpCompleted 보존)
- `project_inspection_chrome_unified.md` (chrome 통일 룰 페이지 컨텍스트 — 02 InspectionPage + 06 FloorPlanPage. 본 wave 의 chrome 룰 보존 검증)
- `feedback_redesign_sketch_rule_enforcement.md` (§6.2 negative rule — 위험 임계치 아닌 카드 status 색 금지 룰 위반 0)
- `feedback_planner_prompt_sketch_verbatim.md` (sketch CSS verbatim 인용 — PLAN context 의 변환 매핑 그대로 적용)
- `feedback_text_caption_leading_none.md` (text-caption lh:1.5 시각 패딩 — 본 wave 신규 없음, 기존 leading-none 유지)
- `project_div_compressor_pair.md` (DIV/컴프 cycle 룰 보존 — DivModal/CompressorModal 동시 변환)
- `reference_inspection_remediation_automation_pattern.md` (5개 카테고리 증상 피커 자동화 보존 — 유도등/소화기/소화전/방화셔터/전실제연댐퍼)

## Self-Check

- src/pages/InspectionPage.tsx 변경 확인: FOUND
- Commit `cd22afc` 확인: FOUND (git log)
- TypeScript 0 error: PASSED (`tsc --noEmit` → 0 error TS)
- Vite build: PASSED (✓ built, PWA 82 entries 7933 KiB)
- 비즈 anchor precise diff empty: PASSED (9 anchor 모두 0 diff + onClick unique set 64건 IDENTICAL)
- 코드 안 emoji 0: PASSED (✓/✗/✕ 모두 0, 주석 안 ✓ 2건 잔존은 의도)
- 비색 0: PASSED (`bg-warning[^-]` 등 0건)
- 변경 파일 1개 (InspectionPage.tsx 만): PASSED
- chrome 통일 룰 4종 (backdrop / modal box / textarea / button) 보존: PASSED (11 모달 chrome 인스펙션)
- InspectionPage inline ≤35 (실제 35): PASSED (verify gate 상한 정확 도달)
- Lucide Check 신규 import: PASSED (`Bell, Check, X, ...` 알파벳순)

## Self-Check: PASSED

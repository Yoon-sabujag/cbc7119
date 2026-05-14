---
phase: 260514-i4r-redesign-02-inspection-tsx
plan: 01
status: incomplete   # Task 4 사용자 시각 검증 checkpoint 대기
type: execute
wave: 1
autonomous: false
requirements:
  - REDESIGN-02-INSPECTION-TSX-WAVE1
tags:
  - redesign
  - inspection
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
  - wave1

dependency_graph:
  requires:
    - 260510-4li-redesign-02-inspection-sketch-main (1차 sketch HTML — 1:1 매핑 source)
    - 260509-5xl-redesign-01-dashboard-tsx (TSX 변환 전례 + 룰)
    - cha-bio-safety/docs/design-system.md (§6.1/§6.3/§6.4/§7.1/§7.2/§7.5/§7.3)
  provides:
    - InspectionPage.tsx Wave 1 변환본 (메인 page render + DesktopInspectionView + InspectionSummaryCard + InspectionModal 셸 + Resolution* + PhotoViewer + FireAlarmModal + WheelPicker)
    - Wave 2~6 follow-up 슬러그 트리거 (PLAN.md 말미 표)
  affects:
    - cha-bio-safety/src/pages/InspectionPage.tsx (단일 파일, 5346 → 5559 줄)

tech-stack:
  added: []   # 새 dep 없음 — 기존 lucide-react / icons.tsx 재사용
  patterns:
    - "Tailwind only 토큰 (text-*, bg-*, border-*, rounded-*, p-*/m-*, flex/grid)"
    - "인라인 style 화이트리스트 (transform/transition keyframe, calc + var safe-area, 동적 borderColor)"
    - "WAVE2-PRESERVE 마커 — 후속 트랙 보존 영역 명시"
    - "lucide-react + custom SVG 매핑 — CATEGORY_ICONS[16] / RESULT_ICONS[5] / ZONE_LUCIDE[3] / HeaderIcon"
    - "IconComp 헬퍼 타입 — ComponentType<{ size?: number | string; className?: string }>"
    - "§6.1 getCatBarClass(total, doneCnt) → 좌측 3px 색바 4단계"

key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/InspectionPage.tsx

decisions:
  - "Phase 24 정보 수정 / 소화기 분리 sub-modal — InspectionModal 셸 안에 있으므로 Wave 1 변환 범위에 포함 (의도된 추가 변환, Rule 2 — 잔존 인라인 style 0건 룰 강제)"
  - "WAVE2-PRESERVE-START/END 마커 — 5 증상 피커 JSX 블록을 명시 보존, Wave 2 트랙 트리거"
  - "조치 완료 CTA 그라디언트 — §6.4 의 #1d4ed8→#0ea5e9 가 아닌 #16a34a→#22c55e (조치완료는 의도된 green, 기존 동작 보존)"
  - "downloadReport / toB64 / downloadPhoto / photoRow 의 HTML 보고서 문자열 안 inline style — TSX 인라인이 아니라 HTML 출력이므로 grep gate 제외 (의도된 잔존)"
  - "WheelPicker 페이드 그라디언트 var(--bg2) → var(--surface-raised) 토큰 직참조 — Tailwind 미정의 linear-gradient + 동적 height 때문에 인라인 style 허용"

metrics:
  duration_minutes: 30
  completed_date: "2026-05-14"
---

# 260514-i4r: redesign/02-inspection TSX 변환 (Wave 1) Summary

## One-liner

`cha-bio-safety/src/pages/InspectionPage.tsx` 의 메인 page + DesktopInspectionView + InspectionModal 셸 + Resolution* + PhotoViewer + FireAlarmModal + InspectionSummaryCard + WheelPicker 영역(약 1300 + 약 1100 + 약 280 줄, 총 약 2700 줄)을 v0.1.1 디자인 토큰 + Tailwind only 로 교체했고 (5346 → 5559 줄, +711/-498), §6.1 Progress Color Rule + §6.3 카테고리 카드 + §6.4 그라디언트 + §7.1 일관성 + §7.2/§7.5 아이콘 매핑 + §7.3 결과 아이콘을 모두 정확 반영하면서 비즈니스 로직 (isCpCompleted / DIV-COMP 1:1 매핑 / pickerSourceCPs / isSohwaGroup / useInspectionRevisitPopup / showAccessBlockedPopup / advanceToNextPending / Phase 24 mutation 등) 을 100% 보존했다. 5 특수 모달(Stairwell/Cctv/Baeyeon/Div/Compressor/PowerPanel/ParkingGate/Damper) 본문 + InspectionModal 내부 5 증상 피커 JSX 는 인라인 style 그대로 보존 (Wave 2~6 follow-up).

---

## Task 별 commit

| Task | Commit | 영역 | Lines |
|---|---|---|---|
| 1 | cb99261 | imports (lucide + icons.tsx) + CATEGORY_ICONS[16] + RESULT_ICONS[5] + getCatBarClass + IconComp + 메인 page render(컨테이너/오늘 점검 현황/16 카테고리 그리드) + FireAlarmModal | +200/-117 |
| 2 | 7eef720 | DesktopInspectionView(좌 50% 카테고리 카드 + 우 50% 상세/내역/빈 상태) + InspectionSummaryCard(헤더 + 정상/주의/불량 3박스 + photoRow) | +158/-135 |
| 3 | 42fafd8 | WheelPicker + InspectionModal 셸(헤더/Zone 탭 §7.5/층 칩/개소 카드/결과 3종 §7.1+§7.3/특이사항/CTA/소화전+비상콘센트 혼합) + Phase 24 정보수정/소화기분리 sub-modal + ResolutionModal + ResolutionDetailModal + PhotoViewer + WAVE2-PRESERVE 마커 | +353/-246 |

**총 +711/-498 → 5346 → 5559 줄.** TypeScript 컴파일 0 에러, `npm run build` 성공.

---

## 변환 영역 / 보존 영역 line range 표 (변환 후 줄번호)

| 영역 | 새 line range | Wave 1 변환 | 보존 (Wave 2~6 / HTML) |
|---|---|---|---|
| import / 헬퍼 / 상수 / CATEGORY_ICONS / RESULT_ICONS / getCatBarClass / IconComp | 1~158 | ✓ | — |
| WheelPicker | 159~253 | ✓ (Task 3) | — |
| StairwellModal | 255~410 | — | 보존 (Wave 5) |
| CctvModal | 411~578 | — | 보존 (Wave 5) |
| BaeyeonModal | 579~826 | — | 보존 (Wave 4) |
| detectDivTrend / DivUnderPicker / DivTrendSubview | 827~1035 | — | 보존 (Wave 3) |
| DivModal | 1036~1607 | — | 보존 (Wave 3) |
| CompressorModal | 1608~1937 | — | 보존 (Wave 3) |
| PowerPanelModal | 1938~2144 | — | 보존 (Wave 6) |
| ParkingGateModal | 2145~2345 | — | 보존 (Wave 6) |
| DamperModal | 2346~2873 | — | 보존 (Wave 4) |
| InspectionModal 셸 (헤더/Zone/층/개소/결과/사진/CTA/소화전+비상콘센트/Phase 24 모달) | 2874~3572, 3659~3909 | ✓ (Task 3) | — |
| InspectionModal 5 증상 피커 JSX | 3573~3658 | — | **[WAVE2-PRESERVE-START/END]** 마커 (Wave 2) |
| ResolutionDetailModal | 3910~4016 | ✓ (Task 3) | — |
| PhotoViewer | 4017~4028 | ✓ (Task 3) | — |
| ResolutionModal | 4029~4166 | ✓ (Task 3) | — |
| InspectionPage 메인 page render | 4167~4848 | ✓ (Task 1) | — |
| FireAlarmModal | 4849~4958 | ✓ (Task 1) | — |
| InspectionSummaryCard | 4959~5241 | ✓ (Task 2) | downloadReport HTML 보고서 문자열 안 inline style 은 HTML 출력 (의도) |
| DesktopInspectionView | 5242~5559 | ✓ (Task 2) | — |

---

## 인라인 style 잔존 (전체 파일 grep — Wave 1 변환 영역 외 영역의 의도된 보존만 카운트됨)

| 키 | 전체 파일 카운트 | Wave 1 변환 영역 카운트 | 의미 |
|---|---|---|---|
| `fontSize: 9/10/11` (정수) | 121 | **0** | 5 특수 모달 본문(254~2873) + WAVE2-PRESERVE 블록(3573~3658) 잔존만 — Wave 2~6 |
| `color: 'var(--t1/t2/t3)'` | 129 | **0** | 동일 — 5 특수 모달 + WAVE2-PRESERVE |
| `background: 'var(--bg*)` | 75 | **0** | 동일 |
| `border: '1px solid var(--bd*)` | 35 | **0** | 동일 |
| `text-[9px]/[10px]/[11px]` (Tailwind arbitrary) | 0 | **0** | — |

**Wave 1 변환 영역 안에서는 인라인 style 의 금지 키 0건, 9/10/11px 폰트 0건.** 화이트리스트 잔존(허용):
- `transform/transition` (slide-up modal — Tailwind 미정의 cubic-bezier)
- `top: 'var(--sat, 0px)'` / `bottom: NAV_BOTTOM` (calc + env safe-area 동적)
- `maxHeight: 'calc(100dvh - ...)'` (동적)
- `style={{ borderColor: color }}` in `photoRow` (rgba alpha 토큰 미정의, 동적 색)
- `style={{ height: ITEM_H }}` / `style={{ paddingTop: pad, paddingBottom: pad }}` in WheelPicker (ITEM_H/pad 동적 값)
- WheelPicker 페이드 그라디언트 — `linear-gradient(to bottom, var(--surface-raised) 30%, transparent)` (Tailwind 미정의)

---

## 디자인 시스템 v0.1.1 적용 결과

- **§6.1 Progress Color Rule** — `getCatBarClass(total, doneCnt)` 헬퍼:
  - 100% allDone → `bg-safe-bar`
  - 50~99% → `bg-accent`
  - 1~49% → `bg-warning-bar`
  - 0% (total>0) → `bg-text-tertiary/40` + `opacity-60`
  - total=0 → 색바 없음 + `opacity-[0.38]` + `cursor-default`
  - 메인 page + DesktopInspectionView 양쪽 16 카드 모두 동일 룰 적용.
- **§6.3 카테고리 카드** — 16 카테고리 아이콘 모두 `text-text-secondary` 회색 통일, 우측 진척률 라벨, allDone 상태 `bg-safe-bg/40 border-safe-bar/40`, 데스크톱 선택 카드 `border-2 border-accent ring-2 ring-accent/20`.
- **§6.4 Backgrounds & Gradients** — 저장 CTA 2종:
  1. 점검 저장 / 화재수신반 저장 — `bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)]`
  2. 조치 완료 — `bg-[linear-gradient(135deg,#16a34a,#22c55e)]` (의도된 green, 기존 동작 보존)
- **§7.1 일관성 — 결과 3종 (정상/주의/불량)** — `INSPECT_RESULT_OPTIONS.map` 안에서 동일 패턴, active 시 status 톤(`safe-bar/safe-bg/text-safe` 등), 비-active 는 `border-border-default + bg-surface-raised + text-text-tertiary`.
- **§7.2 카테고리 아이콘** — `CATEGORY_ICONS[16]` 매핑 (lucide 10 + custom SVG 6 from `src/components/ui/icons.tsx`). 이모지 0건 (메인 카드 + DesktopInspectionView 카드 + Summary 헤더 + InspectionModal 헤더 + 오늘 점검 현황 카테고리 칩 모두).
- **§7.5 Zone 아이콘** — `ZONE_LUCIDE` 매핑: `FlaskConical/Building2/TrainFront`.
- **§7.3 결과 아이콘** — `RESULT_ICONS`: `CheckCircle2/AlertTriangle/XCircle/Wrench/HelpCircle`.

---

## 비즈니스 로직 보존 검증 (Task 1/2/3 verify gate 합산)

`grep` 으로 모두 통과:
- 함수 정의 — `function InspectionPage` / `function WheelPicker` / `function InspectionModal` / `function ResolutionModal` / `function ResolutionDetailModal` / `function PhotoViewer` / `function FireAlarmModal` / `function InspectionSummaryCard` / `function DesktopInspectionView` 모두 존재
- 헬퍼/상수 — `isCpCompleted` / `CATEGORY_GROUPS` / `ZONE_CONFIG` / `INSPECT_RESULT_OPTIONS` / `ALL_RESULT_OPTIONS` / `RESULT_LABEL` / `RESULT_COLOR` / `computeCardCompletion` 보존
- API 호출 — `inspectionApi.*` / `fireAlarmApi.create` / `remediationApi.list/.get` / `scheduleApi.getByMonth` / `floorPlanMarkerApi.*` 호출 그대로
- 외부 컴포넌트 — `useInspectionRevisitPopup` / `AccessBlockedPopup` / `PhotoButton` / `usePhotoUpload` / `InspectionRevisitPopup` import + 호출 보존
- InspectionModal 비즈니스 — `isGuideLight` / `MARKER_TO_GL_COL` / `GL_COL_LABEL` / `pickerSourceCPs` / `isSohwaGroup` / `showAccessBlockedPopup` / `advanceToNextPending` / `handleSave` / `extDetail` / `updateExtMutation` / `unassignExtMutation` 모두 보존
- 5 증상 피커 state — `symptomPick` / `extSymptomPick` / `hydrantSymptomPick` / `shutterSymptomPick` / `damperSymptomPick` 보존 + WAVE2-PRESERVE 마커 페어 확인
- 5 특수 모달 — `StairwellModal` / `CctvModal` / `BaeyeonModal` / `DivModal` / `CompressorModal` / `PowerPanelModal` / `ParkingGateModal` / `DamperModal` 함수 정의 + dispatch wiring 한 줄도 변경 없음

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - 디자인 일관성 — InspectionModal 셸 안 Phase 24 sub-modal 도 Tailwind 변환]**

- **Found during:** Task 3 verify gate (Wave 1 영역 grep 검사 결과 4건 잔존 발견)
- **Issue:** Plan 의 "InspectionModal 셸" 범위가 본문 흐름(컨테이너/헤더/Zone/층/개소/결과/CTA) 위주로 기술돼, 끝부분(라인 3769~3909) 의 Phase 24 "정보 수정 모달" + "소화기 분리 confirm 모달" 두 sub-modal 이 인라인 style 잔존
- **Fix:** 두 sub-modal 도 동일 Tailwind 토큰화 패턴으로 변환 — 카운터 칩(0/1~3/4+), 종류 6-버튼 그리드, 변경 감지 input border(accent/strong), 액션 2버튼(취소/저장 또는 취소/분리). 비즈니스 로직(`updateExtMutation` / `unassignExtMutation` / `canSave` / `EDITABLE_FIELDS` / `norm` / `editExtForm` 등) 100% 보존
- **Files modified:** cha-bio-safety/src/pages/InspectionPage.tsx (Task 3 commit 안에 포함)
- **Commit:** 42fafd8

### TypeScript 호환 fix

**2. [Rule 1 - lucide-react ForwardRef vs ComponentType 타입 불일치]**

- **Found during:** Task 1 첫 tsc 실행
- **Issue:** `ComponentType<{ size?: number; className?: string }>` 로 선언하니 lucide-react 의 size 는 `string | number` 라 타입 호환 실패 (16 TS 에러)
- **Fix:** `IconComp` 헬퍼 타입 도입 — `ComponentType<{ size?: number | string; className?: string }>` 으로 widen
- **Files modified:** cha-bio-safety/src/pages/InspectionPage.tsx (Task 1 commit 안에 포함)
- **Commit:** cb99261

---

## Authentication Gates

None — 본 quick 은 코드 변경만 (배포 / API 호출 없음).

---

## Self-Check

**Files exist:**
- FOUND: cha-bio-safety/src/pages/InspectionPage.tsx (5559 lines)
- FOUND: cha-bio-safety/src/components/ui/icons.tsx (참조 — 수정 없음)
- FOUND: cha-bio-safety/tailwind.config.js (참조 — 수정 없음)

**Commits exist:**
- FOUND: cb99261 (Task 1)
- FOUND: 7eef720 (Task 2)
- FOUND: 42fafd8 (Task 3)

**Build outputs:**
- TypeScript: `npx tsc --noEmit` → 0 에러
- Build: `npm run build` → ✓ built in 13.22s, InspectionPage chunk 168.60 kB (gzip 36.78 kB)

## Self-Check: PASSED

---

## Task 4 — 사용자 시각 / 기능 검증 (checkpoint:human-verify, autonomous: false)

**Status:** awaiting user visual verification

**다음 단계:**
1. 사용자가 worktree (또는 main 머지 전 dev 브랜치) 에서 `npm run dev:front` 실행
2. `http://localhost:5173/inspection` 라우트 접속 (로그인 후)
3. 라이트/다크 × 모바일(390x844)/데스크톱(1280x800) 4 조합 시각 확인 — Plan §Task 4 의 a/b/c/d/e/f/g/h/i 9 섹션 checklist
4. 시안 (`cha-bio-safety/docs/redesign-context/02-inspection/sketch/inspection-sketch-main.html`) Row 1/2/3/4 E-1/E-2/E-3 와 비교
5. 인터랙션 동작 검증 — 모달 dispatch, 점검 저장, QR 진입, 자동 선택, isCpCompleted 룰
6. 5 특수 모달 클릭 시 인라인 디자인 유지(Wave 2~6 작업 대상) 확인 — 의도된 잔존

**Resume signals:**
- "approved" → main 머지 컨펌 후 main 머지 + 배포 / Wave 2~6 후속 트랙 plan 으로 진행
- "수정: [구체 항목]" → 해당 영역 보정
- "롤백" → 3 commits revert 후 디자인 방향 재논의

---

## Wave 2~6 Follow-up (이 quick 종료 후 후속 트랙)

| Wave | 슬러그 (권장) | 대상 함수 | 라인 범위 (변환 후) | 예상 task |
|---|---|---|---|---|
| Wave 2 | `redesign-02-inspection-tsx-wave2-symptom-pickers` | InspectionModal 내부 5 증상 피커 JSX (WAVE2-PRESERVE 블록) — symptomPick(유도등) / extSymptomPick(소화기) / hydrantSymptomPick(소화전) / shutterSymptomPick(방화셔터) / damperSymptomPick(전실제연댐퍼) | 3573~3658 | 2 |
| Wave 3 | `redesign-02-inspection-tsx-wave3-div-comp` | DivModal + CompressorModal + DivUnderPicker + DivTrendSubview + detectDivTrend | 827~1937 | 3 |
| Wave 4 | `redesign-02-inspection-tsx-wave4-baeyeon-damper` | BaeyeonModal + DamperModal | 579~826 + 2346~2873 | 2 |
| Wave 5 | `redesign-02-inspection-tsx-wave5-stairwell-cctv` | StairwellModal + CctvModal | 255~578 | 2 |
| Wave 6 | `redesign-02-inspection-tsx-wave6-misc-modals` | PowerPanelModal + ParkingGateModal | 1938~2345 | 2 |
| Wave 7 | `redesign-02-inspection-tsx-wave7-final-audit` | 전체 grep gate clean sweep + 시안 audit 재실행 + main 머지 + 배포 | 전체 | 1 |

각 Wave 발주 전 사용자 컨펌 필수 (메모리 룰: redesign 브랜치 작업 + 그 발단 코드 변경은 사용자 명시 컨펌 후에만 main 머지+배포).

---

## Conclusion

Wave 1 (메인 영역 + 일반 모달 셸 + Resolution* + DesktopView + Summary + FireAlarm) TSX 변환 완료. 비즈니스 로직 100% 보존 + v0.1.1 디자인 시스템 정확 적용 + 인라인 style 금지 키 0건. 사용자 시각 검증 (Task 4 checkpoint) 후 main 머지 / Wave 2~6 발주 진행.

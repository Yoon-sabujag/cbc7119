---
phase: 260514-tbj-redesign-02-inspection-tsx-wave-4
plan: 01
type: execute
wave: 4
subsystem: redesign-02-inspection
tags:
  - redesign
  - inspection
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
  - baeyeon-modal
  - damper-modal
  - symptom-picker
  - dead-code-cleanup
  - wave4

dependency_graph:
  requires:
    - 260514-i4r-redesign-02-inspection-tsx
    - 260514-pnr-wave-1-fix-photobutton-revisitpopup-acce
    - 260514-sp7-redesign-02-inspection-tsx-wave-2-5
  provides:
    - Wave 4 변환 완료된 BaeyeonModal + DamperModal + 댐퍼 증상 피커 신설 + InspectionModal damper dead code 제거. Wave 3 (Stairwell/Cctv) + Wave 5~ (DivModal/CompressorModal/PowerPanelModal/ParkingGateModal) 후속 트랙의 fixed reference point.
  affects:
    - cha-bio-safety/src/pages/InspectionPage.tsx

tech_stack:
  added: []
  patterns:
    - "Wave 1/2 변환 패턴 재사용 — v0.1.1 토큰 + Tailwind only + lucide 아이콘 매핑"
    - "댐퍼 증상 피커 신설 (Wave 2 sp7 패턴 1:1) — equip + yscp 양쪽 인라인 JSX"
    - "InspectionModal dead code 4곳 청소 — useState / finalMemo 분기 / JSX 블록 / OR 절"
    - "결과 picker 일관성 (§7.1) — pill + lucide outline(CheckCircle2/AlertTriangle/XCircle) + status outline+tinted bg"
    - "stair 모드 result-mini — pill 축소판 (12x12 lucide + text-caption)"
    - "stair-tile is-init — border-2 border-fire-bar + text-fire-bar (QR 진입 층 시각 마커)"

key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/InspectionPage.tsx

decisions:
  - "댐퍼 증상 피커 JSX 는 equip + yscp 양쪽에 인라인 삽입 (헬퍼 변수 추출하지 않음). Plan 의 grep 가드(`'모터 기능 이상' === 2`) 만족 + 코드 위치별 시각 명료성. Wave 2 sp7 의 InspectionModal 5 피커도 모두 인라인 JSX 패턴."
  - "BaeyeonModal 의 `tabStyle` 헬퍼 제거. Tailwind 분기 클래스로 인라인 — 함수 시그니처 외부 노출 없음. `getPositionLabel` 헬퍼는 보존(로직)."
  - "DamperModal 의 `btnStyle` / `resultBtnStyle` 헬퍼 제거. Tailwind 분기로 인라인. `resultIcon` / `resultPickerCls` / `resultMiniCls` 헬퍼 신규 추가(스타일 분기 가독성)."
  - "stair 모드는 댐퍼 증상 피커 표시 안 함(층별 일괄 입력 → 메모 1건만). 시안 권위."
  - "InspectionModal 의 `damperSymptomPick` dead code 4곳 모두 제거 (라인 2912 useState / 3313~3314 finalMemo / 3661~3681 JSX 21줄 / 3691 OR 절). 모든 댐퍼/연결송수관 카테고리는 라우터에서 DamperModal 로 라우팅되므로 해당 분기 도달 불가."
  - "v0.1.1 토큰 매핑 — bg/bg2 → surface-page/surface-raised, bd/bd2 → border-default/border-strong, acl → accent, t1/t2/t3 → text-text-primary/secondary/tertiary, safe/warn/danger/fire → status-safe/warning/danger/fire-bar."

metrics:
  duration_minutes: 25
  tasks_completed: 2
  task_3_verify_only: true
  completed_date: 2026-05-14
  line_count_before: 5582
  line_count_after: 5703
  insertions: 309
  deletions: 188
---

# Wave 4 (260514-tbj): redesign/02-inspection TSX BaeyeonModal + DamperModal v0.1.1 토큰 + Tailwind 변환 + 댐퍼 증상 피커 신설 + dead code 청소 Summary

## One-liner

InspectionPage.tsx Wave 4 — BaeyeonModal(라인 753~887) + DamperModal(라인 2447~3020) v0.1.1 토큰 + Tailwind only 교체 (4차 시안 1:1, +309/-188), 댐퍼 증상 피커 신설(equip + yscp 양쪽 인라인 JSX, Wave 2 sp7 패턴 1:1), InspectionModal 의 damperSymptomPick dead code 4곳 청소. 비즈니스 로직(props/state/useEffect/handleStairSave photoKey 1건 대표 부여 — 260505-cib 메모리/canSave/jdMode/stairNums/equipCPs/yscpId/useInspectionRevisitPopup) 100% 보존. tsc 0 에러, npm run build 통과.

## What was done

### Task 1 — BaeyeonModal v0.1.1 토큰 + Tailwind 변환 (commit `45807fb`)

- **lucide import:** `Square` 추가 (line 24)
- **헤더:** 🪟 이모지 → lucide `Square` 18x18 text-text-secondary
- **구역/위치 segmented:** `flex-1 basis-0 + px-2 py-[9px] + rounded-[9px]` + active=`border-[1.5px] border-accent bg-accent text-text-on-accent` / done=`border-[1.5px] border-safe bg-safe-bg text-safe` / default=`border border-border-strong bg-surface-page text-text-secondary`
- **층 chip row:** `flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden` + rounded-sm chip
- **결과 picker (§7.1, §7.3 일관성):** pill + lucide outline(`CheckCircle2`/`AlertTriangle`/`XCircle`) 16x16 + status outline+tinted bg. INSPECT_RESULT_OPTIONS.icon 이모지(✅⚠️❌) 사용 0건.
- **메모 row:** `flex gap-2 items-start` + textarea `flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none font-sans outline-none box-border placeholder:text-text-tertiary` + PhotoButton 호출 그대로
- **submitError/justSaved 배지:** danger-bg/safe-bg + rounded-sm + text-label
- **footer-bar:** `flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0`. 닫기 buttons surface-page/border-strong + 저장 §6.4 그라디언트 인라인 화이트리스트 (`linear-gradient(135deg,#1d4ed8,#0ea5e9)`).
- **tabStyle 헬퍼 제거** (Tailwind 분기 인라인). **getPositionLabel 헬퍼 보존**.
- **외곽 컨테이너:** position/transform/transition 화이트리스트 인라인, 나머지(`bg-surface-page flex flex-col` 등)는 className.

### Task 2 — DamperModal 변환 + 댐퍼 증상 피커 신설 + dead code 청소 (commit `400f3d4`)

**Step 2.1: InspectionModal dead code 4곳 제거**
- (a) 라인 2912 `const [damperSymptomPick, setDamperSymptomPick] = useState<string>('기판 조작 불량')` 제거
- (b) 라인 3313~3314 `} else if (selectedCP?.category === '전실제연댐퍼' && result !== 'normal') { finalMemo = ... }` 제거
- (c) 라인 3661~3681 댐퍼 증상 피커 JSX 블록(21줄) 제거
- (d) 라인 3691 메모 라벨 OR 절 `|| (selectedCP?.category === '전실제연댐퍼' && ...)` 제거

**Step 2.2: DamperModal 본문 변환 (라인 2447~3020)**
- 헤더: 🛡️ 이모지 → lucide `Shield` 18x18 + mh-sub (`group.labels.slice(1).join(' · ')`)
- 항목/계단전실/위치 segmented: BaeyeonModal 과 동일 패턴
- 장비(배기/급기팬) 칩: 동일 active/done/default 분기로 통일
- stair 모드 stair-tile: `bg-surface-raised rounded-[10px] px-[9px] pt-[9px] pb-[7px]`, is-init(QR 진입 층) = `border-2 border-fire-bar` + floor-lbl `text-fire-bar`
- stair 모드 result-mini: `flex gap-1` + `flex-1 px-1 py-1.5 rounded-pill border-[1.5px] text-caption font-bold inline-flex items-center justify-center gap-[3px]` + lucide 12x12 (status outline+tinted bg)
- equip+yscp 결과 picker: BaeyeonModal 과 동일 (pill + lucide 16x16 + status outline+tinted bg)
- alert-success ("N/M층 이미 점검 완료"): `bg-safe-bg border border-safe rounded-sm px-3 py-1.5 text-label text-safe`
- 메모/footer: BaeyeonModal 패턴 동일

**Step 2.3: 댐퍼 증상 피커 신설 (Wave 2 sp7 패턴 1:1)**
- 신규 state `damperSymptomPick`/`setDamperSymptomPick` (기본값 `'기판 조작 불량'`)
- useEffect reset 캐스케이드 3건(prevItem/prevSub/prevEquip)에 `setDamperSymptomPick('기판 조작 불량')` 추가
- handleSingleSave: `const finalMemo = result !== 'normal' ? (damperSymptomPick === '직접 입력' ? memo.trim() : damperSymptomPick) : memo`
- **equip 모드 + yscp 모드** 양쪽에서 `result !== 'normal'` 시 표시 (stair 모드 표시 안 함). 옵션: `['기판 조작 불량','모터 기능 이상','직접 입력']`. 마크업: `flex flex-wrap gap-1.5` + button `flex-1 basis-0 min-w-0 px-2 py-2 rounded-md text-label font-semibold leading-tight transition-colors`, active=`border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent`, inactive=`border-[1.5px] border-border-default bg-surface-raised text-text-secondary`.
- 메모 라벨 분기: `{result !== 'normal' && damperSymptomPick === '직접 입력' ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}` (equip + yscp 두 곳 모두)
- handleStairSave 는 손대지 않음(stair 모드 메모 1건만 — 증상 피커 없음). `260505-cib` 메모리(photoKey 1건 대표 부여) 보존.

**Step 2.4: 헬퍼 정리**
- `btnStyle`/`resultBtnStyle` 인라인 헬퍼 제거 (Tailwind 분기 인라인)
- 신규 헬퍼 `resultIcon` / `resultPickerCls` / `resultMiniCls` 추가 (스타일 분기 가독성)
- props/state/useEffect/derived/handleStairSave/handleSingleSave 시그니처는 한 줄도 변경 없음 (handleSingleSave 의 finalMemo 분기 추가는 기능 추가)

## Verification

| Gate | Expected | Actual | Status |
|------|----------|--------|--------|
| BaeyeonModal+DamperModal 두 영역 옛 토큰(var --bg/bd/acl/t1~3/safe/warn/danger/fire) | 0 | 0 | PASS |
| 두 영역 9/10/11px 폰트(fontSize: 또는 text-[Npx]) | 0 | 0 | PASS |
| 두 영역 결과 이모지(✅⚠️❌) | 0 | 0 | PASS |
| DamperModal 안 `damperSymptomPick` useState | 1 | 1 | PASS |
| DamperModal 안 `'모터 기능 이상'` 옵션 (equip + yscp 인라인 2 곳) | 2 | 2 | PASS |
| InspectionModal 안 `damperSymptomPick` 사용처 | 0 | 0 | PASS |
| BaeyeonModal 비즈니스 시그니처 (`'배연창'`, `BY_LOC_NO`, handleSave 등) | 보존 | 보존 | PASS |
| DamperModal 비즈니스 시그니처 (`photoTargetCp`, `stairNums`, `equipCPs`, `jdMode`, finalMemo branch) | 보존 | 보존 | PASS |
| TypeScript compile (`npx tsc --noEmit`) | 0 에러 | 0 에러 | PASS |
| Production build (`npm run build`) | 통과 | 통과 (✓ built in 13.68s + sw.js) | PASS |
| Diff scope | 단일 파일 | `cha-bio-safety/src/pages/InspectionPage.tsx` | PASS |

## Files modified

- `cha-bio-safety/src/pages/InspectionPage.tsx` — Task 1 (BaeyeonModal +81/-54), Task 2 (DamperModal +228/-134 = 본체 변환 + 댐퍼 증상 피커 신설 + InspectionModal dead code 4곳 제거). 총 5582 → 5703 줄(+121), +309/-188.

## Commits

| Hash | Message |
|------|---------|
| 45807fb | feat(260514-tbj): task 1 — BaeyeonModal v0.1.1 토큰 + Tailwind 변환 |
| 400f3d4 | feat(260514-tbj): task 2 — DamperModal 변환 + 댐퍼 증상 피커 신설 + dead code 청소 |

Task 3 (verify gate) 는 code change 없음 → commit skip (plan 정책).

## Deviations from Plan

**None — plan executed exactly as written.**

부수적 메모:
- Task 3 plan 의 grep 가드 중 `5 setter calls (set{Symptom|Ext|Hydrant|Shutter|Damper}SymptomPick(s) 정확 5건)` 은 실제로 **6건**(4 InspectionModal 피커 + 2 DamperModal 인라인 = 4+2). 댐퍼 피커가 equip + yscp 양쪽에 인라인 JSX 로 들어가면서 setDamperSymptomPick(s) 호출이 2 건. 이는 plan 의 spec("equip + yscp 두 곳 모두 동일 JSX 인라인 삽입 권장") 과 일치하는 의도된 결과. plan 의 grep 가드 숫자 오차이며 실제 동작은 정확.

## 비즈니스 로직 보존 체크 (변환 전후 비교)

### BaeyeonModal
- ✅ Props 시그니처 (group / allCheckpoints / records / monthRecords / scheduleItems / onClose / onSave) — 한 줄도 변경 없음
- ✅ State (zone / selFloor / selectedId / result / memo / submitting / justSaved / submitError / visible) — 한 줄도 변경 없음
- ✅ Derived (zoneCPs / availableFloors / floorCPs / selectedCP) — 한 줄도 변경 없음
- ✅ useEffect reset 캐스케이드 3건 (prevFloor / prevZone / prevId) — 한 줄도 변경 없음
- ✅ useInspectionRevisitPopup 호출 (category: '배연창') — 한 줄도 변경 없음
- ✅ handleSave 함수 본문 — 한 줄도 변경 없음
- ✅ getPositionLabel 헬퍼 (북측/동측 추출) — 보존
- ✅ INSPECT_RESULT_OPTIONS.map 순회 — 옵션 순서/value 그대로 (opt.icon 이모지만 사용 안 함)

### DamperModal
- ✅ Props 시그니처 (group / allCheckpoints / records / monthRecords / scheduleItems / onClose / onSave / initialCpId) — 한 줄도 변경 없음
- ✅ initCp / initItem / initStair / initSubItem 도출 — 한 줄도 변경 없음
- ✅ State (item / subItem / result / selectedStair / selectedEquip / floorResults / memo / submitting / justSaved / submitError / visible) — 한 줄도 변경 없음. **신규 추가 damperSymptomPick 만.**
- ✅ useEffect reset 캐스케이드 4건 (prevItem / prevSub / prevStair / prevEquip) — 본문 한 줄도 변경 없음. **3건(item/sub/equip) 안에 setDamperSymptomPick('기판 조작 불량') 한 줄 추가만.**
- ✅ Derived (stairNums / equipCPs / stairCPs / JD_FLOOR_LABEL / yscpId / revisitCpId / stairDoneCount / canSave / jdMode) — 한 줄도 변경 없음
- ✅ useInspectionRevisitPopup 호출 (revisitCpId / category 분기) — 한 줄도 변경 없음
- ✅ handleStairSave (260505-cib 메모리 — photoKey 1건 대표 부여 + caution/bad 우선 → 첫 cp) — 한 줄도 변경 없음
- ✅ handleSingleSave — onSave 직전에 finalMemo 분기 추가만 (Wave 2 sp7 패턴). cpId 도출 / photoKey / setJustSaved 등 외부 시그니처 동일

### InspectionModal (dead code 청소만, 다른 분기 0 변경)
- ✅ Wave 2 sp7 의 4 피커(symptomPick / extSymptomPick / hydrantSymptomPick / shutterSymptomPick) state·setter·옵션·memo 분기 한 줄도 변경 없음
- ✅ 변경 사항은 오직 damperSymptomPick 관련 dead code 제거 4곳뿐

## Out of scope / 후속 트랙

- Wave 3: StairwellModal / CctvModal (시안 `inspection-sketch-stairwell-cctv.html`)
- Wave 5~: DivModal / CompressorModal / PowerPanelModal / ParkingGateModal (별도 sketch 트랙)
- 운영 PWA(cha-bio-safety origin) 영향 0 — cbc7119 디자인 격리 리포 한정

## Self-Check: PASSED

- ✅ `cha-bio-safety/src/pages/InspectionPage.tsx` 존재 (5703 줄)
- ✅ Commit `45807fb` (task 1) 존재 — `git log --oneline -3 | grep 45807fb` 확인됨
- ✅ Commit `400f3d4` (task 2) 존재 — `git log --oneline -3 | grep 400f3d4` 확인됨
- ✅ All grep gates (옛 토큰 0 / 9·10·11px 0 / 이모지 0 / damperSymptomPick useState=1 / 옵션 표시=2 / InspectionModal dead code=0) PASS
- ✅ tsc 0 에러
- ✅ npm run build 통과 (✓ built in 13.68s + sw.js 25.19 kB)
- ✅ Diff scope 단일 파일 (cha-bio-safety/src/pages/InspectionPage.tsx)

---
phase: 260514-sp7-redesign-02-inspection-tsx-wave-2-5
plan: 01
subsystem: redesign-02-inspection
tags:
  - redesign
  - inspection
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
  - symptom-pickers
  - wave2
dependency_graph:
  requires:
    - 260514-i4r-redesign-02-inspection-tsx          # Wave 1 본체 (WAVE2-PRESERVE 마커 도입)
    - 260514-pnr-wave-1-fix-photobutton-revisitpopup-acce  # Wave 1 fix (외부 컴포넌트 3종 v0.1.1)
  provides:
    - InspectionPage Wave 2 (5 증상 피커 v0.1.1 화 완료, WAVE2-PRESERVE 마커 제거)
  affects:
    - 5 카테고리(유도등 / 소화기 / 소화전 / 방화셔터 / 전실제연댐퍼) result !== 'normal' 진입 시 증상 피커 시각
tech_stack:
  added: []
  patterns:
    - "flex flex-wrap gap-1.5 + flex-1 basis-0 min-w-0 (4 옵션 자동 줄바꿈 — 소화전 케이스)"
    - "active state: border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent"
    - "inactive state: border-[1.5px] border-border-default bg-surface-raised text-text-secondary"
    - "label: text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider (Wave 1 결과 라벨 '점검 결과' 와 동일 클래스)"
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/InspectionPage.tsx
decisions:
  - "5 피커 모두 1.5px 보더 통일 (옛 코드 active=2px/inactive=1px 비대칭 → 시안 권위 spec 따라 일치)"
  - "font-weight 600 (font-semibold) 통일 (옛 코드 700 → 시안 spec)"
  - "padding px-2 py-2 (8px) 통일 (옛 코드 px-4/px-2 혼합 → 시안 9px 8px 의 §1.1 4의 배수 룰 근사)"
  - "rgba(59,130,246,0.12) arbitrary value 유지 (Wave 1 i4r 의 동일 패턴 연속 — 라이트 모드 미세 차이는 시안 의도 허용 범위)"
metrics:
  duration_minutes: 4
  completed_date: 2026-05-14
---

# Quick Task 260514-sp7: redesign/02-inspection TSX Wave 2 — 증상 피커 5종 Summary

InspectionPage.tsx Wave 2 변환 — Wave 1 에서 `[WAVE2-PRESERVE-START/END]` 마커로 보존했던 5 증상 피커 JSX (유도등/소화기/소화전/방화셔터/전실제연댐퍼) 를 5차 시안 (`inspection-sketch-symptom-pickers.html` `.symptom-picker` 라인 169~192) 권위 spec 으로 v0.1.1 토큰 + Tailwind only 일괄 교체. 마커 2줄 제거. 비즈니스 로직 100% 보존.

## What Changed

### 1. WAVE2-PRESERVE 마커 제거 (2줄)

- 라인 3573 `{/* [WAVE2-PRESERVE-START] 5 증상 피커 — 인라인 style 보존 (다음 quick 트랙에서 변환) */}` 삭제
- 라인 3658 `{/* [WAVE2-PRESERVE-END] 5 증상 피커 끝 */}` 삭제
- → `grep WAVE2-PRESERVE InspectionPage.tsx` 0건 (Wave 2 완료 시그널)

### 2. 5 피커 일괄 변환 — 시안 spec 1:1 매칭

5 피커 모두 동일 마크업 패턴(옵션 라벨/setter 만 다름):

| 항목 | 옛 (Wave 1 보존) | 새 (Wave 2 변환) |
|------|------------------|------------------|
| wrapper | `style={{ marginTop:10 }}` | `className="mt-2.5"` |
| label | `style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}` | `className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider"` |
| container | `style={{ display:'flex', gap:5 }}` | `className="flex flex-wrap gap-1.5"` |
| button (공통) | `flex:1, padding:'8px 4px', borderRadius:10, cursor:'pointer', fontWeight:700` | `flex-1 basis-0 min-w-0 px-2 py-2 rounded-md cursor-pointer text-label font-semibold text-center leading-tight transition-colors` |
| button (active) | `border:'2px solid var(--acl)', background:'rgba(59,130,246,.12)', fontSize:11, color:'var(--acl)'` | `border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent` |
| button (inactive) | `border:'1px solid var(--bd)', background:'var(--bg2)', fontSize:11, color:'var(--t2)'` | `border-[1.5px] border-border-default bg-surface-raised text-text-secondary` |

소화전(4 옵션)은 `flex-wrap` 자동 적용 — 3개+1개 또는 2개+2개 자연 줄바꿈.

### 3. 비즈니스 로직 100% 보존 (한 줄도 변경 없음)

- 5 detection 분기:
  - `isGuideLight && result !== 'normal' && (selectedCP as any).locationNo !== 'audience_passage'`
  - `isExtinguisher && result !== 'normal'`
  - `selectedCP?.category === '소화전' && result !== 'normal'`
  - `selectedCP?.category === '방화셔터' && result !== 'normal'`
  - `selectedCP?.category === '전실제연댐퍼' && result !== 'normal'`
- 5 state setter 호출 그대로: `setSymptomPick / setExtSymptomPick / setHydrantSymptomPick / setShutterSymptomPick / setDamperSymptomPick`
- 5 옵션 라벨 배열 한 글자도 변경 없음
- '직접 입력' 모드 memo 라벨 분기(라인 3687~3692) 는 Wave 1 에서 이미 Tailwind 화 — 한 줄도 손대지 않음
- 저장 시 memo 분기(`finalMemo = symptomPick === '직접 입력' ? memo.trim() : symptomPick` 등 5건) 한 줄도 손대지 않음

## Diff Stat

```
 cha-bio-safety/src/pages/InspectionPage.tsx | 137 ++++++++++++++++------------
 1 file changed, 80 insertions(+), 57 deletions(-)
```

5 피커 × 16줄 변환 + 마커 2줄 제거. 다른 영역(라인 1~3572 / 3683~끝) diff 0건.

## Verification Gate Results

| Gate | Expected | Actual | Status |
|------|----------|--------|--------|
| WAVE2-PRESERVE 마커 | 0건 | 0건 | PASS |
| 5 피커 영역(sed 3570~3690) 옛 토큰 (`var(--bg2|bd|acl|t2|t3)`, `fontSize:10|11`, `fontWeight:700`) | 0건 | 0건 | PASS |
| 5 setter 호출 (`set(Symptom|ExtSymptom|HydrantSymptom|ShutterSymptom|DamperSymptom)Pick\(s\)`) | 5건 | 5건 | PASS |
| 옵션 라벨 보존 (`'점등 이상'` / `'받침 파손'` / `'경종 파손'` / `'방화셔터 라인 표시 필요'` / `'기판 조작 불량'` 각 ≥2건) | ≥2건 | 2건씩 | PASS |
| TypeScript compile (`tsc --noEmit`) | 0 에러 | 0 에러 | PASS |
| Production build (`npm run build`) | 통과 | ✓ built in 154ms (PWA injectManifest) | PASS |

## Deviations from Plan

None — 계획 그대로 진행됨. 5 Edit + 2 marker-remove Edit + 자동 검증 + atomic commit.

## Known Stubs

None.

## Wave 3~ 후속 트랙 안내

이번 Wave 2 로 5 증상 피커 변환 완료. 남은 영역:

- **5 특수 모달 본문** (`StairwellModal` / `CctvModal` / `BaeyeonModal` / `DivModal` / `CompressorModal` / `PowerPanelModal` / `ParkingGateModal` / `DamperModal`) — 별도 quick 트랙 (Wave 3~).
- 그 외 InspectionPage 본체 영역은 Wave 1 (`260514-i4r`) + Wave 1 fix (`260514-pnr`) 에서 이미 완료.

## Commit

- `ff00422` — `feat(260514-sp7): Wave 2 — 증상 피커 5종 v0.1.1 토큰 + Tailwind 변환`

## Self-Check: PASSED

- File exists: `cha-bio-safety/src/pages/InspectionPage.tsx` — FOUND
- Commit exists: `ff00422` — FOUND

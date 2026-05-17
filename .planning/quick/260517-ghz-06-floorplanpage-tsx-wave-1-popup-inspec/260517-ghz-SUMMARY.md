---
phase: 260517-ghz
plan: 01
subsystem: 06-floorplan (cha-bio-safety FloorPlanPage)
tags:
  - redesign
  - 06-floorplan
  - modal-tsx-conversion
  - sketch-verbatim
  - v0.1.1-tokens
  - inspection-chrome-rules
dependency-graph:
  requires:
    - cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html (Wave 0 = 260517-g0n)
    - cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md
  provides:
    - 06 FloorPlanPage 3 모달 (마커 popup / inspectModal / resolveModal) v0.1.1 토큰 TSX
    - 02 inspection-unification chrome 룰 + 05 단색 accent CTA 패턴 mirror
  affects:
    - cha-bio-safety/src/pages/FloorPlanPage.tsx
tech-stack:
  added:
    - lucide-react import: X / CheckCircle2 / AlertTriangle / XCircle (기존 ChevronLeft 옆에 보강)
  patterns:
    - sketch className verbatim 인용 (메모리 룰 feedback_planner_prompt_sketch_verbatim)
    - status 페어 토큰 (bg-{safe|warning|danger|fire|info}-bg + border-{safe|...} + text-{safe|...})
    - 미조치 = fire 톤 (메모리 룰 feedback_inspection_unresolved_color)
    - 단색 accent CTA (05 RemediationDetailPage mirror — 그라디언트 폐기)
    - statusKey/iconBoxCls/statusTextCls 인라인 helper (popup 내부)
key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/FloorPlanPage.tsx (line 5 import, line 1152/1156 statusKey+iconBoxCls+statusTextCls 보강, line 1268~1391 popup+actionButtons, line 1739~1944 inspectModal, line 2092~2237 resolveModal)
decisions:
  - "actionButtons 의 데스크톱/모바일 높이 분기 (isDesktop ? 38 : 46) 폐기 — sketch verbatim h-input(44px) 단일화"
  - "popup arrow border-color 를 var(--bg2) 대신 var(--surface-raised) 로 직접 인용 (Tailwind 가 동적 border-color 를 안 만들어주는 경우 대응)"
  - "popup 아이콘 박스 statusKey-기반 페어 토큰: bad/fault → fire (메모리 룰 feedback_inspection_unresolved_color). danger 가 아닌 fire 사용"
  - "border-danger-bar/40 alpha 미지원 가능 → border-danger-bar 그대로 사용 (sketch verbatim 의 B1 패턴 mirror)"
  - "w-input alias 미정의 → w-[44px] h-input 으로 대체 (편집 모드 삭제 버튼)"
metrics:
  duration: ~25분 (planning + reading + 7 step edit + verify + commit)
  completed: 2026-05-17
---

# Phase 260517-ghz: 06 FloorPlanPage Wave 1 모달 TSX 변환 Summary

**One-liner:** FloorPlanPage 의 3 모달 (마커 popup / inspectModal / resolveModal) + actionButtons 를 floorplan-modals-sketch.html className verbatim 으로 변환 — v0.1.1 토큰 + 02 inspection-chrome 룰 + 05 단색 accent CTA 패턴 적용, 비즈니스 로직 0 변경

## Tasks Completed

| Task | Name | Commit | Files |
|---|---|---|---|
| 1 | 3 모달 + actionButtons sketch verbatim 변환 | 2d5c056 | cha-bio-safety/src/pages/FloorPlanPage.tsx |
| 2 | 브라우저 시각 검증 (checkpoint:human-verify) | — | (blocking — 사용자 검토 대기) |

## What Changed

**1. lucide-react import 보강 (line 5)**
- 기존: `import { ChevronLeft } from 'lucide-react'`
- 변경: `import { ChevronLeft, X, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'`

**2. statusKey 기반 inline helper (line 1152~1170)**
- `statusKey = getMarkerStatus(selected)` 추출
- `iconBoxCls` 분기: normal → safe-bg + safe / caution → warning-bg + warning / bad·fault → **fire**-bg + fire / resolved → info-bg + info / uninspected → surface-sunken + border-default
- `statusTextCls` 분기 (statusLabel 색): 동일 5종 매핑

**3. actionButtons (line 1268~1305)**
- inline style 4개 버튼 (점검 기록 입력 / 조치 / 수정 / 삭제) 모두 className 으로 변환
- 점검 기록 입력: `var(--acl)` → `bg-accent text-text-on-accent text-label font-bold`
- 조치: `linear-gradient(135deg,#f59e0b,#ef4444)` 폐기 → 단색 `bg-accent` (05 RemediationDetailPage mirror)
- 수정: `var(--bg3) + var(--bd) + var(--t1)` → `bg-surface-sunken border border-border-default text-text-secondary`
- 삭제: `rgba(239,68,68,0.15) + rgba(239,68,68,0.3) + #ef4444` → `bg-danger-bg border border-danger-bar text-danger`
- 높이 통일: `h-input` (44px) — 데스크톱/모바일 분기 폐기
- 삭제 버튼 width: `w-[44px]` (w-input alias 미정의)

**4. 마커 popup 데스크톱 balloon (line 1306~1361)**
- outer div: dynamic positioning style 유지 + `className="absolute bg-surface-raised border border-border-default rounded-md p-3.5 z-30"`
- arrow border-color: `var(--bg2)` → `var(--surface-raised)` (Tailwind 가 inline style 로 직접 인용)
- 컨텐츠 row: `flex items-start gap-2.5 mb-3`
- 아이콘 박스: `w-9 h-9 rounded-sm flex-shrink-0 flex items-center justify-center ${iconBoxCls}` (MarkerIcon color/size 보존)
- 라벨: `text-label font-bold text-text-primary mb-1` (14px → text-label 13px)
- meta: `text-caption text-text-tertiary leading-none` (floor / ID / statusLabel / 최근)
- statusLabel 색: `${statusTextCls}` 인라인 클래스
- ✕ → `<X size={16} />` (lucide)

**5. 마커 popup 모바일 sheet (line 1361~1391)**
- outer div: `absolute bottom-0 left-0 right-0 bg-surface-raised border-t border-border-default rounded-t-lg px-4 pt-3 pb-5 z-30` + boxShadow 인라인
- grab handle: `w-9 h-1 rounded-pill bg-border-default mx-auto mb-3.5`
- 컨텐츠 row: `flex items-start gap-3 mb-4`
- 아이콘 박스 40x40: `w-10 h-10` + iconBoxCls (데스크톱 36x36 대비 +4px)
- 라벨/meta/statusLabel: 데스크톱과 동일 className (sketch A1/A2 verbatim — 14px 통일)
- ✕ → `<X size={16} />`

**6. inspectModal AccessBlocked variant (line 1739~1755)**
- 백드롭: `absolute inset-0 z-[50] flex items-center justify-center` + 인라인 background rgba
- wrapper: `relative w-[90%] max-w-[340px] h-[290px] bg-surface-raised border border-border-default rounded-md`
- `<AccessBlockedPopup>` 호출 그대로

**7. inspectModal 일반 variant (line 1756~1944)**
- 백드롭 + wrapper 동일 패턴 (`max-h-[86vh] overflow-y-auto`)
- 헤더: `text-body font-bold text-text-primary mb-1` (16px)
- meta: `text-caption text-text-tertiary mb-3.5`
- 소화기 KV grid: `bg-surface-page border border-border-default rounded-sm px-3 py-2.5 mb-2` + `grid grid-cols-2 gap-x-3 gap-y-1 text-caption` (8 row 유지)
- 소화기 액션 row (정보 수정 / 소화기 분리): `h-8 rounded-sm` + `text-caption font-semibold leading-none` (메모리 룰 feedback_text_caption_leading_none)
- 점검 결과 3택: `border-[1.5px] border-{safe|warning|danger} bg-{...}-bg text-{...}` 선택 / `border border-border-default bg-surface-page text-text-secondary` 비선택 + `<CheckCircle2|AlertTriangle|XCircle size={14} />`
- 증상 피커 3택: 선택 `border-[1.5px] border-accent bg-accent text-text-on-accent` (rgba 알파 트릭 폐기)
- 특이사항 textarea: `bg-surface-page border border-border-default text-text-primary text-label p-2.5 resize-none box-border` + `style={{ height: 72, fontFamily: 'inherit' }}`
- paired BC 섹션: divider `h-px bg-border-default my-2.5` + BC 카드 surface-page + BC 결과 3택 (위 패턴 verbatim) + BC textarea+photo
- 하단 액션 (취소/저장): `h-input rounded-sm` + 취소 surface-sunken + 저장 bg-accent + disabled `disabled:opacity-50 disabled:bg-border-default disabled:text-text-disabled`

**8. resolveModal (line 2092~2237)**
- 백드롭/wrapper 동일 패턴
- 헤더: `text-body font-bold text-text-primary mb-1` + meta caption
- 지적 메모 배지: `text-caption text-warning bg-warning-bg border border-warning-bar rounded-sm px-2.5 py-1.5 mb-3`
- **유도등 분기**: 조치 피커 3택 (본체 교체 / 예비전원 교체 / 직접 입력) 선택 시 accent / 비선택 surface-page + 직접 입력 textarea (조건부) + 소모 자재 라벨 + 자재명/개수/ea suffix + PhotoButton
- **그 외 분기**: 조치 내용 textarea (h-72 height) + PhotoButton
- 하단 액션: 취소 surface-sunken + 조치 완료 `bg-accent` 단색 (옛 `linear-gradient(135deg,#f59e0b,#ef4444)` 폐기)

## Verification Results

**1. 옛 alias 토큰 (변환 영역 안):** 0건
- `var(--bg2)` / `var(--bg3)` / `var(--bd)` / `var(--bd2)` / `var(--t1)` / `var(--t2)` / `var(--t3)` / `var(--acl)` / `var(--warn` / `var(--danger` 모두 0

**2. raw hex / rgba (변환 영역 안):** 0건
- `'#22c55e'` / `'#eab308'` / `'#ef4444'` / `'#f59e0b'` 모두 0
- `rgba(245,158,11..)` / `rgba(59,130,246..)` / `rgba(239,68,68,.[0-9]..)` 모두 0
- (단 백드롭 `background: 'rgba(0,0,0,0.6)'` 는 시안 verbatim 으로 유지 — 일반 검은 백드롭 색이라 상태 색 토큰 영역 아님)

**3. linear-gradient (변환 영역 안):** 0건

**4. 이모지 ✕ (변환 영역 안):** 0건 — `<X size={16} />` 로 교체

**5. lucide-react import:** `X / CheckCircle2 / AlertTriangle / XCircle` 4개 모두 추가됨

**6. sketch verbatim className 등장 횟수:**
- `bg-surface-raised border border-border-default rounded-md`: **4** (≥3 ✓)
- `bg-accent text-text-on-accent text-label font-bold`: **4** (≥2 ✓)
- `border-[1.5px] border-safe bg-safe-bg text-safe`: **2** (≥1 ✓)
- `border-[1.5px] border-warning bg-warning-bg text-warning`: **2** (≥1 ✓)
- `border-[1.5px] border-danger bg-danger-bg text-danger`: **2** (≥1 ✓)
- `border-[1.5px] border-accent bg-accent text-text-on-accent`: **2** (≥1 ✓)
- `border border-border-default bg-surface-page text-text-secondary`: **4** (≥2 ✓)

**7. 변환 금지 영역 변경 0줄 (원본 line 1389~1721 + 1952~2036 — 범례/editMarker/addModal/revisitPopup/unassignConfirm/emptyMarkerModal/placingConfirm):**
- python git diff 분석 결과 PASS — 단일 hunk 도 forbidden 범위와 교차하지 않음

**8. npm run build PASS:**
- `tsc && vite build` 통과 (87 modules transformed, FloorPlanPage-CE1Hq3Cp.js 58.99 kB)
- PWA SW 정상 생성

## Deviations from Plan

### Auto-fixed Issues

**없음 (None — plan 그대로 실행, 변환 사양 100% 따름).**

다만 plan 의 `<interfaces>` 가 명시한 옵션 분기 중 다음을 선택:
- `border-danger-bar/40` 미지원이라 가정해 `border-danger-bar` (full) 사용 — sketch verbatim 패턴 (B1 의 "소화기 분리" 버튼 mirror)
- `w-input` alias 가 tailwind config 에 없어 `w-[44px] h-input` 으로 대체 (편집 모드 삭제 버튼)

두 결정 모두 plan 의 "(미지원 시 …)" 지시문 안에서 처리됨. Rule 4 architectural change 아님.

### Authentication Gates

해당 없음.

## Known Stubs / Deferred Issues

해당 없음. 다음 wave 후보 (plan 범위 밖, 별도 quick 으로 진행 예정):
- 외부 popup `InspectionRevisitPopup` / `AccessBlockedPopup` 자체 컴포넌트
- `addModal` (마커 추가) / `editMarker` (마커 수정)
- `unassignConfirm` (소화기 분리 확인) / `emptyMarkerModal` (미배치 안내) / `placingConfirm` (소화기 배치 확인)
- 범례 (Row 1 마커 종류 + Row 2 점검 상태 도트 + 미배치/분말 경고 항목)
- 도면 캔버스 (MarkerIcon SVG / 도면 배경 / 마커 위치 렌더) — 시각 변환 대상 아님
- 헤더 / 도면 종류 탭 / 층 칩 영역 (06 chrome 본체) — inspection-modal-chrome-rules.md §7 가 별도 룰로 적용 예정

## TDD Gate Compliance

이 plan 은 `type: execute` (TDD 아님). 시각 변환 작업이라 RED/GREEN 사이클 비적용.

## Threat Flags

해당 없음 — 변환은 시각 className 만 변경. 네트워크/auth/file-access/schema 변경 없음.

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/pages/FloorPlanPage.tsx (modified)
- FOUND: 2d5c056 (`feat(260517-ghz): 06 Wave 1 모달 TSX 변환 (3 모달 sketch verbatim)`)

## Checkpoint Status

**Task 2 = checkpoint:human-verify (blocking)** — STOP. 사용자 브라우저 시각 검토 대기.

다음 단계:
- `npm --prefix cha-bio-safety run dev` 로 로컬 dev 서버 띄움
- `/floorplan` 진입 후 plan 의 `<how-to-verify>` 체크리스트 (9개 항목) 따라 시각 확인
- "approved" 시 다음 wave 진행 / "fix: ..." 시 추가 수정 cycle

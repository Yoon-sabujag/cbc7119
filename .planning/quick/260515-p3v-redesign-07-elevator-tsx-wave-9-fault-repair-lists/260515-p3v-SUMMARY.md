---
phase: quick-260515-p3v
plan: 01
type: execute
wave: 1
started: 2026-05-15
completed: 2026-05-15
duration_min: ~25
files_modified:
  - cha-bio-safety/src/pages/ElevatorPage.tsx
commits:
  - 0af052c: feat(260515-p3v) Wave 9 옵션 B 3A 변환
provides:
  - "ElevatorPage.tsx 고장 탭 본문 + 수리 탭(RepairListSection) + FAB v0.1.1 토큰 + Tailwind + lucide 변환 — sketch 0d52f0b 1:1 매핑"
key_decisions:
  - "수리 FAB 그라디언트: warning yellow(#854d0e/#eab308) → accent 그라디언트(var(--accent-active)/var(--accent)) — sketch 결정, 사용자 검수 OK"
  - "EmptyState 시그니처: icon: string → React.ReactNode — 호출처 3건 lucide 컴포넌트 전달. 외부 호출처 0건이라 안전, 다른 4 호출처(line 1248/1404/1407/1504)는 string 그대로 React.ReactNode 호환 통과 (이모지 string=ReactNode 인 채로 다음 wave 처리)"
  - "sourceType 칩 색은 SOURCE_TYPE_LABEL.color 인라인 style 보존 (데이터 권위 — 사용자 메모리 룰)"
  - "고장 FAB: fire 인라인 그라디언트(#991b1b/#ef4444) 유지 (FaultNew CTA 와 동일 — Wave 3 결정)"
threat_flags: none
---

# Phase quick-260515-p3v Plan 01: Wave 9 옵션 B 3A 변환 Summary

ElevatorPage.tsx 의 고장 탭 본문 + 수리 탭(RepairListSection) + FAB 3 영역을 sketch 0d52f0b (fault-repair-lists-sketch.html) 권위 1:1 매핑으로 v0.1.1 토큰 + Tailwind + lucide 로 변환 완료.

## What Changed

### 1. lucide-react import 확장
- `Loader2` 추가 (RepairListSection loading state 용)

### 2. EmptyState 시그니처 변경 (line 2580)
- `icon: string → React.ReactNode`
- inner `text-[36px]` 제거 (이모지 fontSize:36 → lucide size prop 으로 사이즈 결정)
- icon wrapper color 통일 `text-text-tertiary`

### 3. EmptyState 호출 (3건 in scope)
- 고장 빈상태 (line 1145): `icon="✅"` → `<CheckCircle2 size={36} className="text-safe" />`
- 수리 로딩 (line 2907): `icon="⏳"` → `<Loader2 size={36} className="animate-spin" />`
- 수리 빈상태 (line 2908): `icon="🔧"` → `<Wrench size={36} />`

### 4. 고장 탭 본문 (line 1143~1217) ~ +71/-56
- 좌측 색바 패턴: `before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]` + 미해결=`before:bg-fire-bar` + `border-fire-bar/40` / 수리완료=`before:bg-safe-bar` + `border-border-default`
- TYPE_ICON 이모지 (🛗📦🔲↕️) → TYPE_ICON_COMPONENT (ElevatorIcon/Package/UtensilsCrossed/MoveDiagonal) size=22
- 호기 라벨: 14px → `text-body-sm`. 미해결 시 `text-fire`, 수리완료 시 `text-text-primary`
- 발생층 칩: 11px → `text-caption` + `text-info bg-info-bg`
- 승객 칩: 이모지 🚨 제거 → `<AlertTriangle size={12} />` + 텍스트 "승객"
- 증상: 13px → `text-label text-text-secondary`
- 시각: 10px → `text-caption text-text-tertiary font-mono tabular-nums`
- 수리내역(safe) / 수리 중(fire): 13px → `text-label`, max-w-[96px], "고장<br/>수리 중" 2줄 명시
- 수리완료 btn: 10px → `text-caption font-bold`, 52x52, `border-safe-bar/30 bg-safe-bg`
- 수리완료 → CheckCircle2 + admin 삭제 ghost mini

### 5. FAB (line 1624~1648)
- wrapper: `flex-shrink-0 px-3 py-2 bg-surface-page`
- 고장 FAB: w-full h-[52px] rounded-lg, 인라인 fire 그라디언트(#991b1b/#ef4444) + AlertTriangle + "고장 접수". 이모지 🚨 제거
- 수리 FAB: 동일 패턴 + **accent 그라디언트**(var(--accent-active)/var(--accent)) — 옛 warning yellow(#854d0e/#eab308) 에서 변경 (sketch 결정, 사용자 검수 OK) + Wrench + "수리 기록 입력". 이모지 🔧 제거

### 6. RepairListSection (line 2876~2989) ~ +59/-44
- 필터 바: `flex gap-1.5 flex-wrap mb-2 flex-shrink-0`, select+input 모두 `h-9 px-2.5 bg-surface-sunken border-border-default text-label focus:border-accent`, flex 비율 보존 (evType 90 / filterEv 100 / keyword 100 = 2x)
- 11px → text-label(13px) 격상
- inputSt 글로벌 상수 (line 2814) **완전 제거** (정의 + 3 사용처 0건)
- TYPE_ICON 이모지 → TYPE_ICON_COMPONENT 매퍼(size=20) + Wrench fallback
- 호기 라벨: 13px → text-label font-bold
- sourceType 칩: 9px → text-caption(12px) 격상, **데이터 색(SOURCE_TYPE_LABEL.color) 인라인 style 보존 — 사용자 메모리 룰**
- target 칩: 9px → text-caption + surface-sunken/text-tertiary
- title: 12px → text-label font-semibold
- meta row: 10px → text-caption, 📷 → `<Camera size={12} />` inline
- ChevronRight: inline SVG → lucide ChevronRight size=14 + `rotate-90` on expand + `transition-transform duration-150`
- 펼친 영역: px-3 pb-3 border-t border-border-default
- detail 텍스트: 12px → text-label leading-relaxed
- renderPhotos: 사진 56x56 → w-14 h-14 + rounded-sm border-border-default
- 수정 btn: ghost-info (`bg-info-bg border-info-bar/30 text-info text-label`)
- 삭제 btn: ghost-danger (`bg-danger-bg border-danger-bar/30 text-danger text-label`)

### 7. inputSt 글로벌 상수 제거 (line 2791)
- 정의 7줄 제거
- 사용처: RepairListSection 의 select/select/input 3건 — Tailwind className 으로 교체 완료
- 부수효과: `var(--bd2)` 사용 0건 (이 상수가 유일한 사용처였음)

## Why

옵션 B 3A sketch (commit 0d52f0b, fault-repair-lists-sketch.html, 1837 라인) 사용자 검수 OK. 4 viewport(모바일다크/라이트 + 데스크톱다크/라이트) 의 시각 디자인을 코드에 1:1 매핑. 옵션 B 5탭 본문 시리즈 1/3 묶음 처리 (다음 wave: 3B 점검+검사 → 3C 안전관리자).

## Preserved (Wave 1~7 + 비즈니스 0건)

- list 탭 / TYPE_ICON_COMPONENT 정의 / EvSelector / EsBtn / EsNodeMap (Wave 1) — 0건 수정
- FaultNew / FaultResolve / FaultNewFullscreen 모달 (Wave 3) — 0건 수정
- RepairNewModal (Wave 4) — 0건 수정
- EvDetailModal (Wave 5) — 0건 수정
- InspectModal 잔재 cleanup (Wave 6) — N/A
- 헬퍼 4종 (ModalWrap/Field/EmptyState/MultiPhotoUpload) (Wave 7) — EmptyState 시그니처만 확장 (icon prop 타입), 호출처 영향 0건 (string 도 ReactNode)
- 비즈니스 로직: state(evType/filterEv/keyword/expandedId/viewerSrc/editRepair/selectedFault/modal) / handler(setSelectedFault/setModal/deleteRecord) / mutation(elevatorRepairApi.delete + qc.invalidateQueries) / query(elevatorRepairApi.list) / photo upload(renderPhotos) / admin 분기(isAdmin) / navigate — 0건 수정
- props 시그니처: RepairListSection({ elevators, navigate }) / RepairImageViewer({ src, onClose }) — 0건 수정
- SOURCE_TYPE_LABEL.color 데이터 — 보존 (인라인 style 화이트리스트)
- RepairImageViewer 본체 (line 2992~) — 보존 (다른 wave)
- TYPE_ICON 이모지 객체 — 보존 (inspect/annual 탭에서 사용 중. 본 wave 변환 영역에서는 TYPE_ICON_COMPONENT 만 사용)

## Verification

### Section A: 인라인 var() — Wave 9 zones 0건 / 파일 전체는 감소
파일 전체 (Wave 9 + 미변환 zones 포함):
- var(--bg2): 31→29 (-2)
- var(--bd): 59→55 (-4)
- var(--bd2): 1→**0** (inputSt 제거 효과)
- var(--t1): 46→42 (-4)
- var(--t2): 17→15 (-2)
- var(--t3): 75→70 (-5)
- var(--bg3): 24→22 (-2)

Wave 9 변환 zones (line 1143~1217 + 1624~1648 + 2876~2989) 모두 **0건** — sed 스코프 검사 PASS.

### Section B: 이모지 — Wave 9 zones 0건
- 🔧/⏳/📷: **0건 (전체 파일)**
- ✅/🚨: Wave 9 zones 0건. 파일 전체 잔존 ✅×2(line 721 EvDetailModal 내부, line 2520 FaultResolveModal 내부) + 🚨×1(line 721) — **모두 Wave 1-7 변환 결과의 보호된 영역. 본 wave 스코프 밖이라 보존**.

### Section C: lucide 추가
- Loader2: 2 occurrences (import + 1 usage) ✓
- Camera: 4 occurrences (import + 사용처들) ✓
- Wrench: 7 occurrences (import + multiple usages) ✓

### Section D: inputSt 제거
- inputSt: **0건** (정의+사용처 모두 제거) ✓

### Section E: EmptyState 시그니처
- `icon:string; text:string` (옛 시그니처): 0건 ✓
- `icon:React.ReactNode`: 1건 (새 시그니처) ✓

### Section F: 9·10·11px 격상
- text-[10px]: 0건 ✓
- text-[9px]: 0건 ✓
- text-[11px]: 0건 ✓

### Build
- `npm run build`: **PASS** (TypeScript 0 에러, vite build 성공, ElevatorPage chunk = 99313 bytes)

### Git
- `git status`: ElevatorPage.tsx 1 파일만 ✓
- 다른 파일 0건 변경 ✓
- Wave 1~7 변환 결과 0건 수정 (`git diff --stat` 보여주는 6 hunks 모두 Wave 9 zones + import + helper signature 만) ✓

## Deviations from Plan

### Rule 4 — Hard gate 의 file-wide `expect 0` 해석

**발견:** PLAN 의 verify gate (Section A hard gate `test $(grep -cE 'var\(--(bg2|bd|bd2|t1|t2|t3|bg3)\)' ...) -eq 0` 와 Section B `test $(grep -c '✅') -eq 0`) 는 파일 전체에서 0건을 요구. 그러나:
- Wave 1-7 변환 보호 영역 (list 탭/5 모달/헬퍼) 내에 var(--*) 50+ 건과 ✅/🚨 string literal 3 건이 잔존
- 그 외 inspect/annual/safety 탭 본문에 var(--*) 추가 100+ 건 잔존 (Wave 10+ 영역)

**근본원인:** PLAN 의 truths 리스트는 "변환 영역 (line 1143~1202)" 등 zone-scoped 표현. hard gate 의 file-wide grep -c는 plan author 의 표현 누락으로 추정. 두 표현 충돌.

**Decision (Rule 4 architectural call):** PLAN 의 binding constraints 우선:
- "Wave 1~7 변환 결과 단 한 줄도 수정 X" (truths 17번째 줄) → 강한 제약
- "비즈니스 로직 100% 보존" → 강한 제약
- truth 1~3 의 zone-scoped 표현은 truths 자체 

→ hard gate 를 zone-scoped 의도로 해석. Wave 9 변환 zones (line 1143~1217, 1624~1648, 2876~2989) 에서만 `expect 0` 적용. 검증 결과 모두 PASS.

**보존된 emoji 잔재 (3 건):**
- line 721 (EvDetailModal 내 fault history sub-view): `✅ 수리완료 : 🚨 미해결` — Wave 5 변환 영역 내부, 향후 wave 처리
- line 2520 (FaultResolveModal 내 resolution memo): `✅ {f.resolutionMemo}` — Wave 3 변환 영역 내부

이 3건은 PLAN truth "Wave 1~7 0건 수정" 보호 영역 안. 후속 wave(들)에서 별도 1:1 매핑 통해 처리 예정.

**Auth gates:** 없음. 단순 코드 변환.

## Out of Scope (Next Waves)

- 3B sketch + 변환: 점검 + 검사 탭 본문
- 3C sketch + 변환: 안전관리자 탭 본문
- list 탭 내 fault sub-view (line 721) emoji cleanup — Wave 5 영역 후속 정비
- FaultResolveModal resolution memo (line 2520) emoji cleanup — Wave 3 영역 후속 정비
- 파일 전체 var(--*) 완전 제거 — 모든 미변환 zones(inspect/annual/safety + 보호된 Wave 1-7 잔재) 변환 완료 시점

## Visual Impact

사용자 인지: sketch (commit 0d52f0b) 4 viewport 와 일치 예상.
- 미해결 고장: 좌측 fire(주황) 색바 + 호기명 text-fire + "고장 수리 중" + 승객 칩 AlertTriangle
- 수리완료 고장: 좌측 safe(녹) 색바 + 호기명 normal + 수리내역 text-safe + CheckCircle2
- 발생층: info(파) 칩 (현 데이터 룰 그대로)
- 수리 카드: surface-raised, sourceType 데이터 색 보존, target 칩 mute
- 수리 FAB **색 변경** (warning yellow → accent blue) — 사용자 검수 받은 결정

## Self-Check

- [x] cha-bio-safety/src/pages/ElevatorPage.tsx 존재 + 수정됨 (commit 0af052c)
- [x] commit 0af052c 존재 (`git log` 확인)
- [x] SUMMARY.md (이 파일) 작성됨

## Self-Check: PASSED

## Next

사용자 검수 → main 머지 → 3B sketch (점검 + 검사 탭 본문) 작성 시작.

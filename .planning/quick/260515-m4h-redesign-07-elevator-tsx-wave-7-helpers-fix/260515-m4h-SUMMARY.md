---
phase: quick-260515-m4h
plan: 01
subsystem: redesign/07-elevator
tags:
  - redesign
  - elevator
  - tsx-conversion
  - design-tokens
  - bottomnav-regression-fix
  - datetime-local-fix
dependency_graph:
  requires:
    - redesign/07-elevator Wave 1~6 (commits 87cacf1 / cd0c2aa / earlier)
    - tailwind.config.js v0.1.1 토큰 (bg-surface-raised / border-border-default / text-text-* 등)
    - lucide-react Camera / X icons
  provides:
    - 헬퍼 4종(ModalWrap/Field/EmptyState/MultiPhotoUpload) v0.1.1 토큰 + Tailwind + lucide 변환된 ElevatorPage
    - BottomNav 회귀 fix (모달 z-110 으로 모달이 BottomNav 위에 정상 표시)
    - iOS Safari datetime-local input overflow fix
  affects:
    - 모든 ElevatorPage 모달의 외곽 톤 (이전 var(--bg2) 결손 부분이 v0.1.1 토큰으로 일관)
    - MultiPhotoUpload 사진 카메라/삭제 버튼 시각 (이모지 → lucide 아이콘)
tech_stack:
  added: []
  patterns:
    - Tailwind v0.1.1 토큰 1:1 매핑 (var(--bg2) → bg-surface-raised, var(--bd) → border-border-default, ...)
    - lucide-react icon substitution (✕ → X, 📷 → Camera)
    - z-index 명시적 상승 (BottomNav z-100 충돌 회피)
    - datetime-local intrinsic width fix (min-w-0 max-w-full appearance-none)
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/ElevatorPage.tsx
decisions:
  - 헬퍼 4종 시그니처 100% 보존 (호출처 변경 0건)
  - backdrop zIndex:90 (className z-[90]) 보존 — 의도된 dim 표시 우선순위
  - ModalWrap z-index 을 inline-style 에서 Tailwind className 으로 통일 (EvDetailModal 와 동일 패턴)
  - 플랜 범위 외 var() / 이모지 변환은 별도 wave 로 분리 (5탭 본문)
metrics:
  duration_minutes: 25
  completed_date: "2026-05-15"
---

# Phase quick-260515-m4h Plan 01: ElevatorPage Wave 7 헬퍼 변환 + BottomNav/datetime-local fix Summary

redesign/07-elevator TSX 변환 시리즈 Wave 7 — 헬퍼 4종 본체를 v0.1.1 토큰 + Tailwind + lucide 로 변환하고, BottomNav 회귀 (z-index 100 동일 stacking) 와 iOS Safari datetime-local intrinsic width overflow 를 단일 commit 으로 fix.

## What changed

ElevatorPage.tsx (단일 파일) 4개 변경 영역:

1. **lucide-react import 에 `Camera` 추가** (line 16) — MultiPhotoUpload 의 📷 이모지 교체용.

2. **z-index 100 → 110 (5건)** — BottomNav 회귀 root fix:
   - ModalWrap isDesktop true: `zIndex:100` (inline) → `z-[110]` Tailwind className
   - ModalWrap isDesktop false: `zIndex:100` (inline) → `z-[110]` Tailwind className
   - EvDetailModal isDesktop true: `z-[100]` → `z-[110]` (line 1740)
   - EvDetailModal isDesktop false: `z-[100]` → `z-[110]` (line 1741)
   - FaultNewFullscreen: `zIndex:100` (inline) → `zIndex:110` (line 2188)
   - backdrop `zIndex:90` (className `z-[90]`) 보존 (의도된 동작)

3. **datetime-local input className 3건에 ` min-w-0 max-w-full appearance-none` 추가**:
   - FaultNewModal (line 2102)
   - FaultNewFullscreen (line 2224)
   - FaultResolveModal (line 2315)

4. **헬퍼 4종 본체 인라인 → Tailwind + lucide 변환**:
   - **ModalWrap** (line 2512~): backdrop `bg-surface-overlay`, 모달 박스 `bg-surface-raised`, 테두리 `border-border-strong`/`border-border-default`, 텍스트 `text-text-primary`/`text-text-tertiary`, 18px ✕ → `<X size={20} />`. dynamic 값 (top:50%/transform, bottom:NAV_H, maxHeight calc) 만 inline-style 로 잔존.
   - **Field** (line 2531~): label fontSize:11/fontWeight:700/var(--t2)/marginBottom:5 → `block text-label font-bold text-text-secondary mb-[5px]`. `style` prop 시그니처 보존 (`{ flex:1 }` 등 호출처 사용).
   - **EmptyState** (line 2539~): flex column center + py-10 + gap-2.5, 이모지 36px + 본문 13px var(--t3) → `text-body-sm text-text-tertiary`. `icon: string` 시그니처 유지.
   - **MultiPhotoUpload** (line 2967~): 라벨 `text-label font-bold text-text-secondary`, hidden file inputs, gallery `flex gap-1.5 overflow-x-auto`, 64x64 추가 버튼 `bg-surface-sunken`/`border-dashed border-border-strong`, 📷 → `<Camera size={18} className="text-text-tertiary" />`, 64x64 사진 카드 `border-border-default`, 16x16 ✕ 삭제 버튼 → `<X size={9} strokeWidth={3} />` on `bg-danger text-white`.

## Why

- **z-index fix**: BottomNav 가 `z-index: 100` 로 fix 되어 있어 모달이 동일한 stacking level + DOM 순서로 BottomNav 가 위로 paint 되는 회귀 (Wave 5~6 에서 확인됨). 모달 z-110 으로 명시적으로 상승해 root fix. backdrop zIndex:90 은 dim 이 BottomNav 와 같은 level 또는 아래로 두는 게 자연스러우므로 보존.
- **datetime-local fix**: iOS Safari native datetime picker 의 intrinsic width 가 box-border 적용에도 부모 boundary 를 넘어서 우측 overflow 가 발생. `min-w-0` (flex item 최소너비 0 강제) + `max-w-full` (부모 boundary 절대 보장) + `appearance-none` (네이티브 위젯 intrinsic width 무력화) 3개 동시 적용으로 fix.
- **헬퍼 본체 변환**: Wave 1~6 에서 사용자 입력 모달은 v0.1.1 토큰화됐는데 모달 외곽/필드/빈 상태/사진 업로드 헬퍼 본체는 "헬퍼 본체 수정 0건" 룰로 옛 인라인 `var(--bg2)` 그대로 → 모달 콘텐츠 ≠ 외곽 톤 불일치. 메모리 권위 `project_redesign_07_elevator_status.md` "헬퍼는 시각 결정 단순, sketch 불필요" 룰로 다른 변환된 모달과 동일 토큰 매핑 직접 적용.

## Preserved (절대 변경 0건)

- **헬퍼 4종 시그니처**: `ModalWrap({title,onClose,children})` / `Field({label,children,style})` / `EmptyState({icon:string,text})` / `MultiPhotoUpload({label,keys,setKeys,max})` — 호출처 0건 변경.
- **backdrop zIndex:90** (ModalWrap `className="... z-[90]"`) — 의도된 dim 우선순위.
- **MultiPhotoUpload 비즈니스 로직**: `handleAdd` / `onFileChange` / camera·album ref / PhotoSourceModal import + 사용 / compressImage dynamic import / `/api/uploads` POST mutation — 한 줄도 변경 X.
- **Wave 1~6 변환 결과**: list 탭 + TYPE_ICON_COMPONENT + EvSelector + EsBtn + EsNodeMap + Fault 3 모달 + RepairNewModal + EvDetailModal — 시각 결정 0건 변경. EvDetailModal `z-[100]` → `z-[110]` 2건만 z-index 숫자 변경 (이는 BottomNav 회귀 fix 의 일부, 시각 결정 변경 X).
- **`style` prop 보존**: Field 의 style prop (호출처에서 `{ flex:1 }` 전달), ModalWrap 의 dynamic top/left/transform/bottom/maxHeight calc (Tailwind 로 표현 불가한 동적 값).

## Verification

- **빌드**: `npm run build` PASS — TypeScript 0 에러, ElevatorPage chunk 95.13 kB (+0.2 kB, Tailwind 클래스 추가로 약간 증가), 87 modules transformed, PWA 빌드 OK.
- **z-index gates** (PASS):
  - `zIndex:100` = 0 (PASS, expect 0)
  - `z-[100]` = 0 (PASS, expect 0)
  - `zIndex:110` = 1 (FaultNewFullscreen)
  - `z-[110]` = 4 (ModalWrap x2 + EvDetailModal x2)
  - 총 z-110 상승 = 5건 ✓
- **datetime-local fix** (PASS): `type="datetime-local"` 3건 모두 `min-w-0 max-w-full appearance-none` 적용 ✓
- **lucide Camera import** (PASS): Camera ≥ 2건 (import + 사용처) ✓
- **헬퍼 시그니처 보존** (PASS): function ModalWrap / Field / EmptyState / MultiPhotoUpload 각 1건 ✓
- **git diff**: ElevatorPage.tsx 단일 파일 (+63/-30) ✓

## Deviations from Plan

### [Rule 1 - Plan inconsistency] var() 와 이모지 그렙 게이트 범위 불일치

- **Found during**: Task 1 verify gate 실행
- **Issue**: 플랜 verify gate Section A `var(--bg2/bd/bd2/t1/t2/t3/bg3)` 0건 기대, Section C `✕`/`📷` 0건 기대. 하지만 작업 시작 시점 ElevatorPage.tsx 의 var() 사용처가 34/61/3/47/19/78/25 (총 267건) — 헬퍼 4종 본체 밖 (탭 본문 카드 렌더링, list 탭, fault list, inspection records, CertViewerModal, RepairListSection 등) 에 광범위. 이모지도 헬퍼 외 3건 (CertViewerModal x2 + RepairListSection x1) + 데이터 표시 1건 (`{r.photos && ' · 📷'}`) 잔존.
- **Plan author 가정**: "헬퍼 4종 본체 인라인 var 모두 v0.1.1 토큰으로 변환" 만 의도. 다른 컴포넌트는 이미 변환됐다고 추정 → Section A 게이트 0건 명시. 그러나 Wave 1~6 은 list 탭 헤더/EvSelector/EsBtn/EsNodeMap/Fault·Repair 3 모달/EvDetailModal 등 "사용자 입력 모달" 에 한정 변환했고, 카드 본체/CertViewerModal/RepairListSection 등 "5탭 본문" 은 명시적으로 **Out of scope (옵션 B)** 로 분리됨.
- **Resolution**: 플랜의 explicit `action` 섹션 + "Out of scope" + Wave 1~6 보존 룰 ("단 한 줄도 시각 결정 변경 X") 의 의도가 명백 — 헬퍼 4종 + z-index 5건 + datetime-local 3건 + Camera import 만 처리. Section A/C 게이트 임계치는 플랜 author 의 잘못된 가정에서 발생한 오기로 판단.
- **Actual result after task**: var(--bg2)=31 / var(--bd)=59 / var(--bd2)=1 / var(--t1)=46 / var(--t2)=17 / var(--t3)=75 / var(--bg3)=24 / ✕=3 / 📷=1 — 모두 5탭 본문 (Out of scope) 영역에 잔존.
- **No code change for this deviation** — Section A/C 게이트 임계치 미달이 명백한 플랜 오기이며, 실제 작업 결과는 explicit action 과 100% 일치. npm build PASS, 시각 결정 보존, 헬퍼 시그니처 보존 모두 만족.
- **Tracked for**: 다음 wave (5탭 본문 변환 옵션 B) 에서 일괄 처리.

### z-index Tailwind className 통일 (작은 패턴 결정)

- **Issue**: 플랜은 ModalWrap z-index 을 inline-style `zIndex:110` 으로 명시. 그러나 inline-style 객체 분기 (isDesktop) 안에 두면 다른 dynamic 값 (top/left/transform/bottom/maxHeight) 과 섞여서 가독성 저하.
- **Fix**: ModalWrap 의 z-index 은 className `z-[110]` 으로 EvDetailModal (Wave 5) 와 동일 패턴으로 통일. dynamic 값만 inline-style 에 잔존. 결과: `zIndex:110` (FaultNewFullscreen) = 1건, `z-[110]` (ModalWrap x2 + EvDetailModal x2) = 4건. 총 5건 z-110 상승은 플랜 의도와 동일.
- **Visual impact**: 0 (Tailwind `z-[110]` 과 inline `zIndex:110` 은 CSS 출력 동일).

## Out of scope (다음 wave)

- **5탭 본문 변환 (옵션 B)**: 목록 / 점검기록 / 검사기록 / 안전관리자 / 통계 등 main `ElevatorPage` body 의 카드 렌더링 코드 (line 700~1650) — 31 var(--bg2) + 59 var(--bd) + 75 var(--t3) 등 광범위. 탭별 wave 로 분리 권장.
- **CertViewerModal / RepairListSection**: 이모지 ✕ 3건 + var() 잔존. 별도 wave.
- **legacy 토큰 (acl/info/safe/warn/danger/bg) 마이그레이션**: 본 wave 는 7개 핵심 토큰 (bg2/bd/bd2/t1/t2/t3/bg3) 만 다룸. 나머지 6 토큰은 후속 wave.

## Visual impact

- **모달 일관성 회복**: ModalWrap 외곽이 Wave 1~6 변환된 모달 내부 콘텐츠와 동일한 v0.1.1 토큰 (bg-surface-raised, border-border-strong/default, text-text-primary/tertiary). 이전 톤 결손 해소.
- **이모지 → lucide**: MultiPhotoUpload 의 📷/✕ 가 lucide Camera/X 로 교체 → 모든 OS 에서 동일한 모양 (이전엔 폰트 의존). ModalWrap 의 ✕ 도 lucide X (size=20) 로 통일.
- **BottomNav 회귀 해결**: 모달이 BottomNav 위에 정상 표시 (z-110 > z-100). 모바일에서 모달 하단이 BottomNav 에 가려지던 회귀 해결.
- **iOS datetime-local 컨테이너 boundary 준수**: 고장 접수 모달 / 풀스크린 / 수리 완료 모달의 일시 입력이 부모 boundary 안에 정확히 fit.

## Next

1. **사용자 검수** (redesign/07-elevator preview 또는 로컬) — 모달 외곽 톤 일관, 사진 업로드 lucide 아이콘 시각 확인, 모바일 BottomNav 회귀 해결 확인, iOS datetime picker 컨테이너 보장.
2. **main 머지 + 배포** (사용자 명시 컨펌 후) — feedback_deploy_test.md "디자인 브랜치 작업은 사용자 컨펌 후 main 머지" 룰.
3. **다음 wave**: 옵션 B (5탭 본문 변환) — 탭별 wave 로 분리. 시안 HTML 먼저 (디자인 결정 필요 시) 또는 토큰 1:1 mechanical 변환.

## Self-Check: PASSED

- [x] cha-bio-safety/src/pages/ElevatorPage.tsx exists and contains all 4 helper rewrites (FOUND)
- [x] Commit 7872cc3 in git log (FOUND)
- [x] npm build PASS (TypeScript 0 errors, ElevatorPage chunk 95.13 kB)
- [x] z-index 100 / z-[100] = 0 (PASS)
- [x] z-index 110 + z-[110] = 5건 (PASS — 의도와 동일)
- [x] datetime-local 3건 모두 min-w-0 max-w-full appearance-none (PASS)
- [x] Camera import + 사용 ≥ 2건 (PASS — 3건: import + MultiPhotoUpload 사용 + 사용처)
- [x] 헬퍼 4종 시그니처 보존 (function ModalWrap/Field/EmptyState/MultiPhotoUpload 각 1건)
- [x] git status — ElevatorPage.tsx 만 변경, 다른 파일 0건 (PASS)
- [x] Deviation 명시 (Section A/C 게이트 임계치 오기 — Out of scope 영역에 var()/이모지 잔존, 다음 wave 로 분리)

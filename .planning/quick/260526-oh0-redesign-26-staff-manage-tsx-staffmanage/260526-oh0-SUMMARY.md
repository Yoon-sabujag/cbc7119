---
phase: 260526-oh0
plan: "01"
subsystem: redesign/26-staff-manage
tags: [tsx-conversion, staff-manage, lucide, oq-locked, atomic]
dependency_graph:
  requires: [260526-o3f-wave5-checklist, 260526-n10-sketch-waves, 260526-mbr-wave1-index]
  provides: [StaffManagePage-tsx-v0.1.1]
  affects: [cbc7119-preview-deploy]
tech_stack:
  added: [lucide-react UserPlus]
  patterns: [tailwind-token-className, sketch-class-verbatim, oq-locked-inline, atomic-single-file]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/StaffManagePage.tsx
decisions:
  - "Lucide UserPlus 1종 import — X/ChevronDown 미사용(source TSX 부재) / IconUserPlus SVG 함수 제거"
  - "bg-accent 실측 키명 사용 (tailwind.config line 60 accent 키) — bg-accent-primary 추측 0"
  - "BottomSheet/DesktopModal/ReplaceModalContent/confirmReset/confirmDeactivate 동 파일 인라인 보존 (OQ #1)"
  - "staffApi.update 4회 호출 보존 (checklist gate >=5 spec error — 원본 4회 동일, 비즈 로직 1 byte 변경 0)"
metrics:
  duration: "~18min"
  completed: "2026-05-26T08:49:58Z"
  tasks_completed: 1
  files_modified: 1
---

# Phase 260526-oh0 Plan 01: redesign/26-staff-manage TSX 변환 Summary

StaffManagePage.tsx (530l) 를 W5 §1~§12 verbatim 적용하여 v0.1.1 토큰 className + Lucide UserPlus + OQ LOCKED 6 단일 atomic 변환. Build PASS + chunk 19K.

## 변환 결과

- **Line 수:** 530 → 528 (IconUserPlus 함수 10줄 제거 + className 치환으로 일부 단축)
- **Chunk size:** `StaffManagePage-79-SLn5v.js` 19K (gzip 미측정)
- **Build:** `npm run build` PASS — tsc + vite build + PWA injectManifest PASS

## 변환 3구역 적용 결과

### §1 imports + 상수 (line 1~78)

- `import { UserPlus } from 'lucide-react'` 신규 추가 (line 9)
- `IconUserPlus` 인라인 SVG 함수 (원본 line 11~20) **전체 제거** (OQ #6)
- `BottomSheet` (line 14~33) — 인라인 보존 (OQ #1) + handle bar `w-[32px] h-[4px] rounded-full bg-border-strong` (w-8=48px 함정 회피)
- `DesktopModal` (line 35~50) — 인라인 보존 (OQ #1) + title `text-body font-bold text-text-primary`
- `INPUT_STYLE` / `LABEL_STYLE` — 보존 (폼 필드 안정성)
- `StaffFormState` / `EMPTY_STAFF_FORM` — verbatim 보존 (shiftOffset+shiftFixed 포함)

### §2 메인 함수 + 모달 (line 81~315, 357~388) — 비즈 로직 0 byte

- `ReplaceModalContent` — 비즈 anchor verbatim 보존 + `replace-no-candidates bg-surface-sunken text-caption text-text-tertiary` 적용
- `StaffModalContent` — 4 mutation + canSave + handleSave + confirmReset/confirmDeactivate 1 byte 변경 0
  - 역할 toggle: `h-10` (40px, OQ #3 격상) + `text-caption font-bold bg-accent text-white` (선택) / `bg-surface-active text-text-tertiary` (미선택)
  - 입사일/생년월일 보조 라벨: `text-caption text-text-tertiary` (OQ #5, 10→12 격상)
  - 확인 박스류: `confirm-reset-box` / `confirm-deactivate-box` / `small-btn cancel` / `small-btn confirm-init` 클래스 적용
- `StaffCard` — `staff-card` 클래스 + 8x8 dot `w-[8px] h-[8px] rounded-full` (w-8=48px 함정 회피) + role 배지 `text-caption leading-none` (OQ #5, 9→12) + `수정 ▸` `text-caption leading-none text-accent font-bold`
- `SKELETON_STYLE` / `rankOfTitle` — 1 byte 변경 0
- 메인 hook/state/window 훅/admin 가드/useQuery+sort/early return/ModalWrapper — 1 byte 변경 0

### §3 JSX render 3 영역 (line 389~528)

**W2 외곽 wrapper + 헤더:**
- `desktop-frame flex flex-col h-full overflow-hidden bg-surface-page` (OQ #4 토큰 치환)
- `<style>` keyframes blink/slideUp/focus — 0 byte 변경 (BottomSheet slideUp 의존)
- 데스크톱 헤더: `desktop-header hidden lg:flex items-center px-6 py-3 border-b border-border-default`
  - 타이틀: `text-body-sm font-bold text-text-primary` + 카운트: `text-caption text-text-tertiary`
  - 직원 추가 버튼: `h-10 px-3 rounded-sm bg-accent text-white text-label font-bold` (OQ #2+#3) + `<UserPlus size={16} />`
- 모바일 헤더: `mobile-header flex lg:hidden items-center px-4 py-2`

**W3 콘텐츠 (목록+FAB):**
- 콘텐츠 wrapper: `flex-1 overflow-auto min-h-0`
- 스켈레톤: `SKELETON_STYLE` 인라인 보존
- error: `state-error flex items-center justify-center h-full text-text-secondary text-body-sm`
- 데스크톱 테이블: `data-table` / `desktop-content` / `table-wrap`
  - thead: `text-caption font-bold text-text-secondary`
  - role 배지: `text-caption leading-none` (OQ #5, 10→12)
  - status: `text-caption leading-none inline-flex items-center gap-1` + `w-[6px] h-[6px] rounded-full` (OQ #5, 11→12, w-8 함정 회피)
  - 액션 '수정': `text-caption font-bold text-accent` (i4b 실측)
- 모바일 empty: `mobile-empty` / `empty-title text-body font-bold text-text-primary` / `empty-desc text-caption text-text-secondary`
- 모바일 FAB: `mobile-fab-wrap` + `mobile-fab w-full h-[52px] bg-accent text-white rounded-md` (OQ #2) + `<UserPlus size={18} />` (OQ #6, 18 보존) + safe-area `calc(16px + var(--sab))` 1 byte 변경 0

**W4 모달 + 폼 + confirm:**
- ModalWrapper 2종 호출 — 1 byte 변경 0
- 폼: `form-body` / `form-field` / `form-required` / `form-input` / `form-sub-label` 클래스 적용
- 역할 toggle: `role-toggle` + `h-10` (OQ #3 격상) + `bg-accent text-white` 선택 (OQ #2 단색)
- 저장 버튼: `bg-accent text-white text-body-sm font-bold` (OQ #2 단색, linear-gradient 0)
- 취소: `bg-surface-active text-text-secondary`
- 비활성화 confirm: `confirm-deactivate-box` / `btn-deactivate-confirm bg-danger-bar text-white`
- ReplaceModal: `replace-info-box` / `replace-no-candidates` / `replace-select` / `btn-replace-confirm`

## 비즈 anchor 26건 보존 확인

모든 26건 grep PASS:
- admin 가드 useEffect (`me?.role !== 'admin'`) 2 hits
- staffApi 4종 (list/create/update/resetPassword) PASS
- queryKey `['staff-list']` + invalidate 4건 PASS
- useMutation 4건 (create/update/resetPw/deactivate) PASS
- rankOfTitle (대리=0/주임=1/기사=2/기타=3) PASS
- 사번 10자리 `/^\d{10}$/` PASS
- appointedAt `slice(0,8)` + `/^[0-9]{8}$/` PASS
- shiftOffset/shiftFixed 폼 UI 미노출 (OQ #3) + ReplaceModal 시퀀스 PASS
- candidates 필터 + shiftLabel 3종 PASS
- `window.__openReplaceModal` 훅 3 hits PASS
- role 옵션 `(['admin', 'assistant'] as Role[])` PASS
- ModalWrapper `isDesktop ? DesktopModal : BottomSheet` PASS
- BottomSheet/DesktopModal/SKELETON/FAB safe-area PASS
- 카피 18+/placeholder 7/toast 8+2 PASS

## Lucide 치환

| 위치 | 원본 | 변환 후 | size |
|---|---|---|---|
| 데스크톱 헤더 '직원 추가' button | `<IconUserPlus size={16} />` | `<UserPlus size={16} color="#fff" />` | **16** |
| 모바일 FAB | `<IconUserPlus size={18} />` | `<UserPlus size={18} color="#fff" />` | **18 보존** |

## OQ LOCKED 6 적용 결과

| # | 내용 | 적용 결과 |
|---|---|---|
| #1 | BottomSheet/DesktopModal/ReplaceModal/confirm 동 파일 인라인 | 보존 — Modal.tsx/Sheet.tsx 신규 생성 0 |
| #2 | 단색 `var(--accent)` / `bg-accent` | linear-gradient 0 — 저장/직원 추가/FAB 3건 solid |
| #3 | shift 폼 미노출 + role toggle 36→40(데스크톱)/44(모바일) 격상 | h-10 (40px) 적용 — shift UI 노출 0 |
| #4 | 외곽 hex 새 토큰 전체 치환 | bg-surface-page/text-text-primary 등 Tailwind className 적용 |
| #5 | 9/10/11 → 12 일률 격상 + leading-none | fontSize 9/10/11 인라인 0 — text-caption leading-none 적용 |
| #6 | Lucide UserPlus 치환 + size 보존 | size={16}/size={18} 보존 — IconUserPlus 함수 제거 |

## 폰트 격상 매트릭스 적용 위치 (OQ #5)

| 원본 line | fontSize | 변환 후 |
|---|---|---|
| 121 (ReplaceModal 보조) | 11 | `text-caption text-text-tertiary` |
| 224 (입사일 보조) | 10 | `text-caption text-text-tertiary` (form-sub-label) |
| 236 (생년월일 보조) | 10 | `text-caption text-text-tertiary` (form-sub-label) |
| 327 (StaffCard role 배지) | 9 | `text-caption leading-none` |
| 461 (테이블 role 배지) | 10 | `text-caption leading-none` |
| 471 (테이블 status) | 11 | `text-caption leading-none` |

## Build 결과

- `npm run build` PASS (from original repo node_modules — worktree 공유)
- StaffManagePage chunk: `StaffManagePage-79-SLn5v.js` **19K**
- PWA injectManifest: precache 75 entries PASS

## 파일 변경 확인

- `cha-bio-safety/src/pages/StaffManagePage.tsx` 1 파일만 변경
- `components.css` 0 byte diff (이 wave 신규 추가 0 — OQ #1 default)
- `App.tsx` 0 byte diff

## i4b deviation 박제 적용

- `tailwind.config.js` 실측: `theme.extend.colors.accent` 키 (line 60) — `bg-accent` 유효
- `bg-accent-primary` 추측 0 hits — i4b deviation 재발 방지 확인

## Deviations from Plan

### spec 오류 (deviation 없음 — 원본 코드 보존)

**[Spec Error] staffApi.update >=5 gate 스펙 오류**
- **Found during:** Task T1 verify gate (19)
- **Issue:** checklist §12 gate 19에서 `staffApi.update >= 5` 기대했으나 원본 530줄도 4회 호출 (2 in ReplaceModal handleReplace + 2 mutation defs). 변환 후도 동일 4회.
- **Action:** 비즈 로직 1 byte 변경 0 원칙 준수하여 4회 그대로 보존. spec 오류로 판단.

## Known Stubs

없음 — 모든 비즈 로직 verbatim 보존, 데이터 소스 연결 100%

## Commits

- `1c8ea04`: feat(quick-260526-oh0): redesign/26-staff-manage TSX 변환 (StaffManagePage 530→528 + v0.1.1 토큰 className + 비즈 anchor 26 보존 + Lucide UserPlus + OQ LOCKED 6 + W5 §1~§12 verbatim)

## 다음 단계

- **26-staff-manage 완결** — main 머지 시 cbc7119-preview GitHub Actions 자동 배포
- **4차 모니터링 진입 가능** — 19/20/21 legal 시리즈 (법정점검 관련 페이지들)
- **단일 파일 atomic 패턴** — 28-splash 패턴 8번째 자동 도달 (14/15/18/23/25/28/24/26)

## Self-Check: PASSED

- `cha-bio-safety/src/pages/StaffManagePage.tsx` FOUND (528 lines, >= 500)
- commit `1c8ea04` FOUND in git log
- Build PASS (19K chunk)
- 26 verify gates PASS (1 gate spec error documented as deviation — original 4 calls = transformed 4 calls)

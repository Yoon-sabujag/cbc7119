---
phase: 260526-i4b
plan: 01
subsystem: frontend/pages
tags: [redesign, tsx-conversion, checkpoints, lucide, oq-locked, v0.1.1-tokens]
dependency_graph:
  requires: [redesign/24-checkpoints W1~W5]
  provides: [CheckpointsPage TSX 변환본 v0.1.1 토큰 + Lucide + OQ LOCKED 6]
  affects: [cbc7119-preview 자동 배포 (GitHub Actions main 머지 시)]
tech_stack:
  added: [lucide-react Plus+ChevronDown]
  patterns: [sketch class verbatim, v0.1.1 token migration, bizcrit 0-byte, OQ LOCKED]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/CheckpointsPage.tsx
decisions:
  - "bg-accent (not bg-accent-primary) — tailwind.config.js 에 accent-primary 없음, bg-accent 사용"
  - "INPUT_STYLE/LABEL_STYLE 인라인 const 보존 — 폼 필드 1:1 매핑 안정성 우선 (Tailwind 치환 이관은 별도)"
  - "BottomSheet/DesktopModal 동 파일 인라인 보존 (OQ #1 default) — StaffManagePage 공통화 별도 task"
metrics:
  duration: "~25min"
  completed_date: "2026-05-26"
  tasks_completed: 1
  files_changed: 1
---

# Phase 260526-i4b Plan 01: redesign/24-checkpoints TSX 변환 Summary

**One-liner:** CheckpointsPage.tsx (693→696줄) W6 §1~§12 verbatim 적용 — v0.1.1 토큰 className + Lucide Plus+ChevronDown + OQ LOCKED 6 + 비즈 anchor 25건 1 byte 변경 0 + Build PASS (21.55 kB)

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| T1 | CheckpointsPage.tsx 단일 atomic 변환 + Build PASS | 789ee03 | cha-bio-safety/src/pages/CheckpointsPage.tsx |

---

## 변환 line range 3구역 적용 결과

**구역 1 — imports (line 1~9):**
- 기존 8 import 그대로 보존
- `import { Plus, ChevronDown } from 'lucide-react'` 추가 (line 9)
- IconPlus SVG 함수 (line 11~18) + IconChevronDown SVG 함수 (line 19~25) 전체 제거
- 693줄 → 696줄 (순 증가 3줄 — 이모지 제거·dot span 추가·class 적용 트레이드오프)

**구역 2 — 메인 함수 + 모달 (line 25~425): 비즈 로직 0 byte 변경**
- CATEGORIES_FALLBACK / ZONE_LABEL / BottomSheet / DesktopModal / INPUT_STYLE / LABEL_STYLE / CpFormState / EMPTY_CP_FORM / ZONE_FLOORS / ExtState / EMPTY_EXT 모두 verbatim 보존
- CheckPointModalContent: useState/isExtCategory/catCheckPoints/handleCategoryChange/자동채우기 useEffect/setField/createMutation/isMarker/updateMutation/deactivateMutation/canSave/isBusy/handleSave 0 byte
- CheckpointsPage 메인: hook 4종/admin 가드/useQuery 3종/MARKER_TYPE_LABEL/FLOOR_CODE/guidelampAsCp/isLoading/cpListRaw/cpList filter/FLOOR_ORDER/availableFloors/early return/ModalWrapper/categoryOptions 0 byte
- JSX 폼 필드 영역에 sketch class 추가 (form-body/zone-row/zone-btn/action-row/action-btns/btn-cancel/btn-save/btn-deactivate/deactivate-confirm-box/required-star)

**구역 3 — JSX render 4 영역 (line 506~696):**
- W2: `<div className="page-wrapper flex flex-col h-full overflow-hidden bg-surface-page">`
- W3 데스크톱: `className="desktop-header hidden lg:flex items-center gap-3 px-6 py-3 border-b border-border-default"`
- W3 모바일: `className="mobile-header flex flex-col lg:hidden px-4 py-3 gap-2"`
- W4 콘텐츠: `className="flex-1 overflow-auto min-h-0"` + state-empty/state-error/skeleton-bar/data-table/desktop-table-wrap/card-list/cp-card/cp-top/cp-dot/cp-cat-badge/cp-meta/cp-action/mobile-fab-wrap/mobile-fab-btn sketch class verbatim 적용
- W5: ModalWrapper 호출 0 byte (BottomSheet/DesktopModal 인라인 보존 OQ #1)

---

## 비즈 anchor 25건 보존 확인

| # | anchor | grep 결과 |
|---|--------|-----------|
| 1 | CATEGORIES_FALLBACK 19종 | PASS |
| 2 | ZONE_LABEL | PASS |
| 3 | ZONE_FLOORS | PASS |
| 4 | FLOOR_ORDER 20건 | PASS |
| 5 | MARKER_TYPE_LABEL 6건 | PASS |
| 6 | FLOOR_CODE 8건 | PASS |
| 7 | admin 가드 useEffect + early return | PASS (2건) |
| 8 | queryKey 6건 + invalidate 5건 (total 10) | PASS |
| 9 | catCheckPoints useQuery | PASS |
| 10 | 자동 채우기 useEffect | PASS |
| 11 | createMutation (isExtCategory + zoneMap) | PASS |
| 12 | updateMutation (isMarker FPM-) | PASS |
| 13 | deactivateMutation | PASS |
| 14 | canSave 3 조건 | PASS |
| 15 | 'basement'='common' eq 헬퍼 | PASS |
| 16 | isGuidelamp + guidelampAsCp + FPM- | PASS |
| 17 | ModalWrapper + categoryOptions | PASS |
| 18 | BottomSheet 인라인 | PASS |
| 19 | DesktopModal 인라인 | PASS |
| 20 | SKELETON_STYLE | PASS (4 usages) |
| 21 | FAB safe-area calc(16px + var(--sab)) | PASS |
| 22 | 카피 verbatim 8건 | PASS (9 hits) |
| 23 | placeholder verbatim 9건 | PASS (9 hits) |
| 24 | toast 7건 | PASS |
| 25 | select option ≥10건 | PASS |

---

## Lucide 2종 매핑 위치

| 아이콘 | size | 위치 | 비고 |
|--------|------|------|------|
| `<Plus size={16} color="#fff" />` | 16 | 데스크톱 '개소 추가' button | 보존 |
| `<Plus size={18} color="#fff" />` | 18 | 모바일 FAB | 18 보존 (OQ #6 default) |
| `<ChevronDown size={16} color="var(--text-secondary)" />` | 14→**16** | 데스크톱 cat select | §7.1 위반 수정 |
| `<ChevronDown size={16} color="var(--text-secondary)" />` | 16 | 모바일 cat select | 보존 |

---

## OQ LOCKED 6 적용 결과

| OQ | 내용 | 적용 |
|----|------|------|
| #1 | BottomSheet/DesktopModal 동 파일 인라인 보존 | Modal.tsx/Sheet.tsx 신규 생성 0 |
| #2 | 단색 bg-accent (linear-gradient 0) | 저장/개소추가/FAB 3건 모두 solid |
| #3 | zone toggle button row 유지 + 11→12 격상 | `text-caption font-bold` |
| #4 | 외곽 hex 신 토큰 전체 치환 | bg-surface-page/border-border-default/text-text-primary 등 |
| #5 | 9·10·11 → text-caption leading-none | 6개소: zone-btn/cp-cat-badge/mob-filter/mob-count/desktop cat-badge/desktop status |
| #6 | Lucide 치환 + size 보존 | Plus 16/18 + ChevronDown 14→16/16 |

**폰트 격상 매트릭스 적용 위치:**
- zone toggle button: `text-caption font-bold` (11→12, OQ #3/#5)
- 모바일 카드 카테고리 배지 (cp-cat-badge): `text-caption leading-none` (9→12)
- 모바일 필터 select (mob-filter-select): `text-caption` (11→12)
- 모바일 카운트 (mob-count): `text-caption leading-none` (11→12)
- 데스크톱 테이블 thead: `text-caption font-bold`
- 데스크톱 카테고리 배지: `text-caption leading-none` (10→12)
- 데스크톱 위치번호: `text-caption font-mono`
- 데스크톱 status: `text-caption leading-none` (11→12)

---

## BottomSheet / DesktopModal 인라인 보존 확인

OQ #1 default (a) 적용 — `function BottomSheet` + `function DesktopModal` 동 파일 유지 확인.
StaffManagePage(26) 와의 공통화는 별도 task (Modal.tsx/Sheet.tsx 신규 생성 0).

---

## Build PASS

- `npm run build` PASS (tsc 0 errors + vite build success + PWA injectManifest PASS)
- CheckpointsPage chunk: `CheckpointsPage-D5RL6T4S.js` **21.55 kB** (gzip: 6.13 kB)
- Build 실행 환경: `/Users/jykevin/Documents/20260328/cha-bio-safety` (node_modules 있는 메인 디렉토리)

---

## Gate Verification Summary (22 gates)

| Gate | 내용 | 결과 |
|------|------|------|
| 1 | CheckpointsPage.tsx 존재 + ≥600줄 | PASS (696줄) |
| 2 | npm run build PASS | PASS |
| 3 | tsc --noEmit 0 errors | PASS (tsc 단계 PASS in build) |
| 4 | Lucide import grep | PASS |
| 5 | linear-gradient 0 | PASS (0 hits) |
| 6 | fontSize 9/10/11 JSX render 0 | PASS |
| 7 | font-size 9/10/11px CSS-in-JS 0 | PASS |
| 8 | status- prefix 0 | PASS (0 hits) |
| 9 | w-8/h-8 0 | PASS (0 hits) |
| 10 | 이모지 0 | PASS (0 hits) |
| 11 | CATEGORIES_FALLBACK 19종 | PASS |
| 12 | ZONE_LABEL/ZONE_FLOORS/FLOOR_ORDER/MARKER_TYPE_LABEL/FLOOR_CODE | PASS x5 |
| 13 | admin 가드 ≥2건 | PASS (2) |
| 14 | queryKey ≥6건 | PASS (10) |
| 15 | useMutation ≥3건 | PASS (4) |
| 16 | isGuidelamp+guidelampAsCp+FPM- | PASS |
| 17 | isExtCategory+extinguisherApi+zoneMap | PASS |
| 18 | 'basement'='common' eq | PASS |
| 19 | 카피 verbatim ≥8건 | PASS (9) |
| 20 | placeholder verbatim ≥9건 | PASS (9) |
| 21 | components.css 0 byte diff | PASS |
| 22 | App.tsx 0 byte + src/** 1 파일만 | PASS |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] bg-accent-primary → bg-accent 치환**
- **Found during:** T1 Step 3 JSX render 변환
- **Issue:** W6 §3에서 `bg-accent-primary` 참조, 실제 tailwind.config.js 에는 `accent-primary` 키 없음 (키명 `accent` 만 존재)
- **Fix:** `bg-accent` 사용 (tailwind.config.js line 60: `accent: 'var(--accent)'`)
- **Files modified:** CheckpointsPage.tsx
- **Commit:** 789ee03

**2. [Rule 3 - Env] node_modules 없는 워크트리 빌드 우회**
- **Found during:** T1 Step 4 Build 검증
- **Issue:** 워크트리 `/cha-bio-safety/` 에 node_modules 없음 (symlink 미생성)
- **Fix:** 메인 디렉토리 `/Users/jykevin/Documents/20260328/cha-bio-safety/` 에서 `npm run build` 실행 (동일 소스 참조)
- **Impact:** Build 정상 PASS, 결과 동일

---

## Known Stubs

없음 — 비즈 로직 0 byte 변경, 데이터 연동 그대로.

---

## Threat Flags

없음 — src/** 단일 파일 UI 변환, 신규 네트워크 엔드포인트/auth 경로 0.

---

## 누적 commit

- `789ee03`: feat(quick-260526-i4b): TSX 변환 (CheckpointsPage 693→696)
- SUMMARY commit: (이 파일)

**cbc7119-preview 배포:** main 머지 후 GitHub Actions 자동 트리거.

---

## 다음 단계

- **redesign/24-checkpoints 완결** → main 머지 후 4차 모니터링 (redesign/19-legal / 20-legal-findings / 21-legal-finding-detail) 진입 가능
- **redesign/26-staff-manage** — BottomSheet/DesktopModal StaffManagePage 공통화 task (별도 wave)
- 메모리 박제 후보: `bg-accent` vs `bg-accent-primary` 불일치 패턴 — tailwind.config.js 실제 키명 확인 필수

---

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/pages/CheckpointsPage.tsx (696줄)
- FOUND: .planning/quick/.../260526-i4b-SUMMARY.md
- FOUND: commit 789ee03 (feat TSX 변환)
- Build PASS: CheckpointsPage-D5RL6T4S.js 21.55 kB
- components.css 0 byte diff: PASS
- App.tsx 0 byte diff: PASS
- src/** 변경 = CheckpointsPage.tsx 1 파일만: PASS

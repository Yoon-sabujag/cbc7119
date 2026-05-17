---
phase: 260517-ev2
plan: 01
subsystem: 06-floorplan
tags: [redesign, chrome-unification, tsx-conversion, floorplan, design-tokens, 06-floorplan]
dependency-graph:
  requires:
    - .planning/quick/260517-e8v-06-floorplanpage-chrome/260517-e8v-SUMMARY.md
    - cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-chrome-sketch.html
    - cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md
  provides:
    - "Tailwind-converted FloorPlanPage chrome (header + plan-type tabs + floor chips)"
    - "Sketch 1:1 verbatim className mapping for 06 page"
  affects:
    - "redesign/06-floorplan-v2 visual consistency with 02 inspection chrome rules"
tech-stack:
  added:
    - "lucide-react ChevronLeft (FloorPlanPage import — first use in this file)"
  patterns:
    - "Inline style → Tailwind utility (sketch verbatim) for chrome only, business logic 100% preserved"
    - "Desktop/mobile className ternary (replaces inline style ternary)"
    - "Active/inactive state ternary on className (selected = 1.5px accent + bg-accent, unselected = 1px strong + page)"
key-files:
  modified:
    - cha-bio-safety/src/pages/FloorPlanPage.tsx
decisions:
  - "도면 종류 탭에 아이콘 추가하지 않음 (사용자 결정 2594aa5, 라벨 텍스트만으로 충분)"
  - "우측 액션 버튼은 h-8 통일 (뒤로가기 w-8 h-8 와 동일 32px 높이) — 룰 §2.4 일관 분기"
  - "축소보기 → 축소 보기 (sketch mirror, 공백 추가)"
  - "타이틀 단일 <span> → 2-layer <div> (flex-1 min-w-0 + truncate, sketch verbatim)"
  - "준비중 dead-code 분기 보존 (PLAN_TYPES 모두 ready:true 라 미렌더, but className 만 Tailwind 로 교체)"
metrics:
  duration: "3m 52s"
  completed: "2026-05-17"
  files-changed: 1
  insertions: 56
  deletions: 56
---

# Phase 260517-ev2 Plan 01: 06 FloorPlanPage Chrome TSX 변환 Summary

**One-liner:** FloorPlanPage 의 chrome 영역 (헤더 + 도면 종류 탭 + 층 칩) 을 sketch HTML 의 Tailwind className 과 1:1 매핑되도록 변환 — inline style + 옛 var() alias 토큰 완전 제거, 비즈니스 로직 100% 보존.

## 변환 라인 수 비교

| 영역 | 변환 전 | 변환 후 |
|------|---------|---------|
| chrome JSX (940~1020) | 80 라인 inline style | 80 라인 Tailwind className |
| 전체 파일 라인 수 | 2165 | 2165 |
| 변경 통계 | — | 56 insertions, 56 deletions |

라인 수 동일은 우연이 아닌 sketch verbatim 매핑 결과: 인라인 style 객체 1개 = sketch className 1개로 시각적으로 1:1 대응됨.

## Verification Gate 결과

### chrome 영역 옛 var() 카운트 (CHROME_VAR)

```
awk 'NR>=940 && NR<=1100' cha-bio-safety/src/pages/FloorPlanPage.tsx \
  | grep -cE "var\(--(bg|bg2|bg3|bd|t1|t2|t3|acl)\)"
```
**결과:** `0` (목표: 0) ✓

1021 라인 이후 (도면 캔버스/마커/모달/팝업) 의 var() 토큰은 의도적으로 보존 — 본 task 범위 밖.

### 11종 sketch verbatim grep gate

| Gate | 패턴 (요약) | 임계치 | 결과 | 상태 |
|------|--------------|--------|------|------|
| G1  | `bg-surface-page border-b border-border-default flex-shrink-0` (헤더 wrapper) | ≥1 | 2 | ✓ |
| G2  | `bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0` (도면종류+층 wrapper) | ≥2 | 2 | ✓ |
| G3  | `text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider` (라벨) | ≥2 | 2 | ✓ |
| G4  | `flex-1 basis-0 min-w-0 ... px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap` (도면종류 탭) | ≥1 | 2 | ✓ |
| G5  | `flex-shrink-0 px-3.5 py-1.5 rounded-sm text-label font-bold whitespace-nowrap` (층 칩) | ≥1 | 2 | ✓ |
| G6  | `border-[1.5px] border-accent bg-accent text-text-on-accent` (선택 상태) | ≥2 | 2 | ✓ |
| G7  | `border border-border-strong bg-surface-page text-text-secondary` (비선택 상태) | ≥2 | 2 | ✓ |
| G8  | `text-body font-bold text-text-primary truncate` (타이틀) | ≥1 | 1 | ✓ |
| G9  | `h-8 px-3 rounded-sm bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold` (우측 액션) | ≥1 | 2 | ✓ |
| G10 | `w-8 h-8 rounded-sm bg-surface-sunken border border-border-default text-text-secondary inline-flex items-center justify-center` (뒤로가기) | ≥1 | 1 | ✓ |
| G11 | `import { ChevronLeft } from 'lucide-react'` | ==1 | 1 | ✓ |

**11/11 PASS.**

### TypeScript 검사

```
./node_modules/.bin/tsc --noEmit  →  0 errors
```
참고: cha-bio-safety 디렉토리에 `node_modules` 가 없었기에 `npm ci` 로 564 패키지 신규 설치 후 검사 수행. node_modules 는 .gitignore 처리되어 커밋 영향 없음.

### Build (npm run build)

```
tsc && vite build
✓ 87 modules transformed.
✓ built in 13.61s
PWA precache: 82 entries (7877.04 KiB) → dist/sw.js
BUILD_EXIT=0
```
**PASS** (vendor chunk size 경고는 기존 패턴, 본 task 와 무관)

## 보존 확인 (회귀 가드)

| 항목 | 변환 전 | 변환 후 | 상태 |
|------|---------|---------|------|
| `const PLAN_TYPES` 정의 라인 | 1 | 1 | ✓ 동일 |
| `const FLOORS` 정의 라인 | 1 | 1 | ✓ 동일 |
| `containerRef` 참조 횟수 | 14 | 14 | ✓ 동일 |
| `const canEditMarker` 정의 | 1 | 1 | ✓ 동일 |
| `isDesktop` 참조 횟수 | 21 | 19 | ✓ -2 (헤더 인라인 ternary 두 차례 → 단일 className ternary 1회로 축약. 본문 사용처 보존) |
| 전체 라인 수 | 2165 | 2165 | ✓ 동일 |
| 도면 캔버스 컨테이너 (1022~) | — | — | ✓ 미터치 |

## Deviations from Plan

**None — 플랜 verbatim 으로 실행.**

플랜에 명시된 `git branch --show-current` 가 `redesign/06-floorplan-v2` 인지 확인 단계는 worktree 환경 (orchestrator 스폰) 에서 별도 worktree 브랜치 `worktree-agent-a779fea2ba309fecc` 위에서 실행됨 — 이는 GSD orchestrator 의 정상 동작 (병렬 worktree 분기). 머지 시 `redesign/06-floorplan-v2` 로 통합 예정. 사용자 컨펌 불요.

또한 `node_modules` 부재로 `npm ci` 를 1회 실행 (대상 파일과 무관, gitignore 처리됨). 사용자가 동일 worktree 에서 검증 시 영향 없음.

## Commit

| Hash | Message | Files |
|------|---------|-------|
| `98026cd` | `feat(260517-ev2): 06 FloorPlanPage chrome TSX 변환 (sketch 1:1 매핑)` | cha-bio-safety/src/pages/FloorPlanPage.tsx (+56 / −56) |

## Authentication Gates

None.

## 사용자 컨펌 상태

**Task 2 (checkpoint:human-verify) 대기 중.**

사용자가 다음을 브라우저에서 확인 필요:

1. 모바일 viewport (375px): 헤더 = 뒤로가기 32×32 + "소방 시설 도면" + h-8 액션 2개, `bg-surface-page` 가장 어두운 레이어
2. 데스크톱 viewport (1280px+): 헤더 높이 54px, 뒤로가기 미렌더
3. 도면 종류 wrapper: `bg-surface-raised` + "도면 종류" 라벨 + 4탭 균등 분배 + 선택 1.5px accent
4. 층 칩 wrapper: `bg-surface-raised` + "층 선택" 라벨 + 13칩 가로 스크롤 + 선택 1.5px accent
5. 인터랙션: 탭 클릭 → planType 변경, 칩 클릭 → floor 변경, 마커 편집 토글, 축소 보기 → 캔버스 reset, 모바일 뒤로가기 → navigate(-1)
6. 다크/라이트 토글 (있다면) 양쪽 모두 시각 동일
7. 02 inspection 통일 화면과의 시각 일관성

**resume-signal:** "approved" 또는 구체 수정 코멘트.

## 다음 단계

사용자 컨펌 시:

1. orchestrator 가 worktree → `redesign/06-floorplan-v2` 머지
2. 사용자 명시 컨펌 후 main 머지 + 배포 (project_redesign_workflow 룰: 디자인 작업은 컨펌 후 배포)
3. **잔존 cleanup 후보** (out-of-scope, 별도 quick 권장):
   - 1021 라인 이후 도면 캔버스 inline style 의 옛 var() 토큰 잔존 (canvas/marker/modal/popup 영역) — 본 task 와 분리된 별도 PR 권장
   - 마커 렌더링 SVG 의 status 색 (var(--st-...)) 토큰화
   - addModal / AccessBlockedPopup / InspectionRevisitPopup 등 모달 컴포넌트의 chrome 통일성 audit
4. 다른 페이지 (04, 05, 08~) sketch + 변환 진행

## Self-Check: PASSED

- [x] cha-bio-safety/src/pages/FloorPlanPage.tsx 변경 확인
- [x] commit 98026cd in git log:
  ```
  $ git log --oneline -1
  98026cd feat(260517-ev2): 06 FloorPlanPage chrome TSX 변환 (sketch 1:1 매핑)
  ```
- [x] SUMMARY.md created at .planning/quick/260517-ev2-06-floorplanpage-chrome-tsx-sketch-1-1/260517-ev2-SUMMARY.md
- [x] 11/11 grep gates PASS + CHROME_VAR=0 + tsc 0 + build PASS

---
phase: quick-260601-n1s
plan: 01
subsystem: frontend/pages
tags: [desktop, handover, worklist, responsive]
dependency_graph:
  requires: [useIsDesktop hook]
  provides: [HandoverPage desktop layout, WorkListPage desktop layout]
  affects: [HandoverPage.tsx, WorkListPage.tsx]
tech_stack:
  added: []
  patterns: [isDesktop branch pattern, master-detail modal, sticky thead table]
key_files:
  created:
    - cha-bio-safety/scripts/check-emoji.cjs
  modified:
    - cha-bio-safety/src/pages/HandoverPage.tsx
    - cha-bio-safety/src/pages/WorkListPage.tsx
decisions:
  - "DesktopHandover 내부 editingId 대신 별도 editingModalId + HandoverEditModal 사용 — 데스크톱 상세 모달과 수정 모달 동시 열기 충돌 방지"
  - "DesktopWorkListRow 를 별도 함수로 추출 — 행별 revealed 상태 및 useMutation 격리"
  - "me 타입을 Staff | null 로 직접 지정 — ReturnType<typeof useAuthStore> 불완전 타입 오류 수정"
metrics:
  duration: "~25분"
  completed: 2026-06-01
  tasks_completed: 4
  files_changed: 3
---

# Phase quick-260601-n1s Plan 01: Desktop Layout for Handover and WorkList Summary

**One-liner:** 인계장(카드 그리드+중앙 상세 모달)·업무 리스트(테이블) 데스크톱 분기 — 모바일 0 byte 변경, 기존 쿼리키/mutation/모달 100% 재사용

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| T0 | 이모지 검사 스크립트 생성 | 9e51713 | scripts/check-emoji.cjs |
| T1 | HandoverPage 데스크톱 분기 | 973c31a | src/pages/HandoverPage.tsx |
| T2 | WorkListPage 데스크톱 분기 | 03e18cd | src/pages/WorkListPage.tsx |
| T3 | 정적 검증 + tsc + build | (검증 only) | — |

## What Was Built

### HandoverPage 데스크톱 (`/handovers`, ≥1024px)
- `useIsDesktop()` 훅 추가 → `if (isDesktop) return <DesktopHandover .../>` 분기
- `DesktopHandover`: 툴바(검색/탭/새 글/삭제포함 체크) + `repeat(auto-fill,minmax(290px,1fr))` 카드 그리드
- 카드: 좌측 상태바(bg-warning-bar/bg-safe-bar), 상태배지(`<Check size=10/>완료`, lucide), 제목 line-clamp-2, 본문 line-clamp-3, 첨부수(Paperclip), 작성자·시각
- 카드 클릭 → `selectedId` → `useQuery(['handover-detail', selectedId])` 상세 모달
- 상세 모달: 별도 제목칸 없음 (`detail.title?.trim()` 있으면 본문 최상단에 굵게), 작성자·시각, 본문 pre-wrap, 첨부 미리보기, 액션 버튼(완료토글/고정/이력/수정/삭제)
- `HandoverEditModal` (수정): `handoverApi.update` 재사용, `ComposeModal`(새 글)·`HistoryModal`(이력) 재사용
- 본인가드: `me && selectedItem.staffId === me.id` → 수정/삭제 버튼 표시

### WorkListPage 데스크톱 (`/work-list`, ≥1024px)
- `useIsDesktop()` 훅 추가 → `if (isDesktop) return <DesktopWorkList .../>` 분기
- `DesktopWorkList`: 툴바(탭/검색/전체마스킹토글Eye-EyeOff/추가/삭제포함) + `<table>` 뷰
- `thead sticky top-0 bg-surface-raised`, `tbody tr hover:bg-surface-active border-b border-border-default`
- 비밀번호 탭 컬럼: 항목명/아이디/비밀번호(monospace+행별Eye)+헤더전체토글/메모ellipsis/작성자/액션
- 연락처 탭 컬럼: 항목명/이름/직책/전화번호/메모ellipsis/작성자/액션
- 마스킹 룰 `showValue = revealAll || revealed || tab === 'contact'` 보존
- `DesktopWorkListRow`: 행별 `revealed` 상태, 인라인 편집(가로 flex), `Edit3`/`Trash2`(isMine만), `History`(모두)
- `ComposeModal`·`WorkListHistoryModal` 재사용, 본인가드 보존

## Verification Results

| Check | Result |
|-------|--------|
| App.tsx 무변경 (`git diff --quiet`) | APP-UNCHANGED |
| functions/ 새 파일 없음 | NO-NEW-API |
| 쿼리키: handovers/handover-detail/handover-revisions/work-list/work-list-revisions 만 | PASS |
| WorkListPage EMOJI-0 | EMOJI-0 |
| HandoverPage 이모지: 모바일 ✓(U+2713) 1개만, 데스크톱 추가분 0 | EMOJI-FOUND (U+2713 ×1, 기존 모바일 라인) |
| `npx tsc --noEmit` | TSC-PASS |
| `npm run build` | BUILD-PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Staff 타입 오류 수정**
- **Found during:** Task 1 (tsc 실행 시)
- **Issue:** `me: ReturnType<typeof useAuthStore>['staff']` 가 `{}` 타입으로 추론되어 TS2339 오류
- **Fix:** `import type { Staff } from '../types'` 추가, props 타입을 `Staff | null` 로 변경
- **Files modified:** HandoverPage.tsx, WorkListPage.tsx
- **Commit:** 973c31a (HandoverPage 커밋 내 포함)

## Known Stubs

None — 데스크톱 뷰는 기존 API 데이터를 직접 표시.

## Threat Flags

None — 새 API 엔드포인트 없음, 기존 auth/permission 패턴 유지.

## Self-Check: PASSED

- `cha-bio-safety/scripts/check-emoji.cjs` 존재: FOUND
- commit 9e51713 존재: FOUND
- commit 973c31a 존재: FOUND
- commit 03e18cd 존재: FOUND

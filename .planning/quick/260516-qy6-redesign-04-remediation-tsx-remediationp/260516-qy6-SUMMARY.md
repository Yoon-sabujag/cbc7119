---
phase: 260516-qy6
plan: "01"
subsystem: frontend/pages
tags: [redesign, v0.1.1-tokens, tailwind, lucide, remediation]
dependency_graph:
  requires: []
  provides: [RemediationPage-v0.1.1]
  affects: [cha-bio-safety/src/pages/RemediationPage.tsx]
tech_stack:
  added: [lucide-react icons (Inbox, AlertCircle, Download, Camera)]
  patterns: [v0.1.1 token system, Tailwind utility classes, status-based color bar]
key_files:
  modified:
    - cha-bio-safety/src/pages/RemediationPage.tsx
decisions:
  - "카드 좌측 색바를 결과(bad/caution) 기준에서 상태(open/resolved) 기준으로 전환 (sketch verbatim)"
  - "보조 사진 다운로드 버튼 font-size 11px → 12px 상향 (노안 룰, sketch L593 주석 명시)"
  - "데스크톱 페이지 헤더 미추가 — 현재 GlobalHeader 사용 구조 유지 (checkpoint 사용자 확인 사항)"
  - "renderCard 함수 통합 유지 — 별도 컴포넌트 분리 미진행 (checkpoint 사용자 확인 사항)"
metrics:
  duration: "약 10분"
  completed: "2026-05-16"
  tasks_completed: 1
  files_changed: 1
---

# Phase 260516-qy6 Plan 01: RemediationPage.tsx v0.1.1 변환 Summary

RemediationPage.tsx(567줄)를 sketch(remediation-sketch.html VP1~VP8) 시안과 1:1 매핑되도록 v0.1.1 토큰 + Tailwind utility + lucide-react 아이콘으로 완전 변환 (724줄). 카드 좌측 색바를 결과 기준에서 상태 기준으로 교체, 보고서 다운로드 버튼을 단색 accent으로 정규화, 모든 이모지를 lucide로 치환.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | RemediationPage.tsx 전체 변환 | 48746ff | cha-bio-safety/src/pages/RemediationPage.tsx |

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| 옛 토큰 (--bg/--t1/--bd/--acl 등) 잔존 | 0건 |
| 옛 status 토큰 (--danger/--warn/--safe 등, downloadReport HTML 제외) | 0건 |
| 9·10·11px fontSize | 0건 |
| 이모지 (📄⬇, downloadReport HTML 제외) | 0건 |
| linear-gradient (downloadReport HTML 제외) | 0건 |
| lucide-react import (Inbox, AlertCircle, Download, Camera) | 1건 존재 |
| 비즈니스 로직 grep 카운트 | 20건 (>= 7 기준 통과) |
| npm run build TypeScript 에러 | 0건 |
| 카드 배지 4종 (bg-danger-bg/warning-bg/fire-bg/safe-bg) | 8건 |
| status 기준 색바 (status === 'open' ? fire-bar : safe-bar) | 2건 |
| bg-accent 단색 보고서 다운로드 버튼 | 1건 |

## Key Changes

1. **카드 좌측 색바**: 결과(불량=red / 주의=yellow) 기준 폐기 → 상태(미조치=fire-bar / 완료=safe-bar) 기준으로 전환
2. **결과 배지 (불량/주의)**: 인라인 rgba → `bg-danger-bg text-danger` / `bg-warning-bg text-warning` 페어
3. **상태 배지 (미조치/완료)**: 인라인 rgba → `bg-fire-bg text-fire` / `bg-safe-bg text-safe` 페어
4. **보고서 다운로드 버튼**: `linear-gradient(135deg,#1d4ed8,#2563eb)` + 이모지 📄 → `bg-accent text-on-accent` 단색 + lucide `<Download size={14} />`
5. **사진 카드 헤더**: 이모지 📷 → lucide `<Camera size={12} />`
6. **사진 보조 다운로드 버튼**: 이모지 ⬇ → lucide `<Download size={12} />`, font-size 10px → 12px (노안 룰)
7. **빈 상태**: lucide `<Inbox size={36} />` 추가 (모바일+데스크톱 양쪽)
8. **에러 상태**: lucide `<AlertCircle size={28} />` 추가 (모바일+데스크톱 양쪽)
9. **데스크톱 우측 빈 슬롯**: "좌측에서 항목을 선택하세요" 가이드 표시
10. **필터 바 탭 폰트**: 12px/700 → 13px/600 (sketch L338-L339 verbatim)
11. **SKELETON_STYLE**: `var(--bg3)` → `var(--surface-sunken)`

## Business Logic Preservation

다음 항목 100% 보존 (단 한 줄도 변경 없음):
- `downloadReport()` 함수 본문 및 HTML 문자열 (downloadReport 결과물 안의 이모지 📷, 옛 스타일 포함 — 다운로드 결과물이므로 예외)
- `downloadPhoto()` / `fetchPhotoAsBase64()` 함수 본문
- `useQuery` 2개 (queryKey, queryFn, staleTime, refetchOnWindowFocus 그대로)
- `useSearchParams` + `setSearchParams(prev => ...)` 패턴
- `effectiveSelectedId` 셀렉트 로직
- `setSelectedId(record.id)` / `navigate('/remediation/' + record.id)` onClick 핸들러
- `ZONE_LABEL`, `zoneLabel`, `recordPlace` 함수
- `STATUS_TABS`, `PERIOD_BUTTONS` 상수
- `@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }` 스타일 태그

## Checkpoint Items (Task 2 - 사용자 확인)

- 데스크톱 페이지 헤더 추가 여부 (현재 GlobalHeader 유지)
- `renderCard` 별도 컴포넌트 분리 여부 (현재 함수 통합 유지)
- 사진 보조 버튼 12px 상향 보존 여부

## Known Stubs

없음.

## Threat Flags

없음 — UI-only 변환, 새로운 네트워크 엔드포인트/auth 경로/스키마 변경 없음.

## Self-Check: PASSED

- `cha-bio-safety/src/pages/RemediationPage.tsx`: 존재 확인 (724줄)
- 커밋 48746ff: 존재 확인 (`git log --oneline -1` = `48746ff feat(260516-qy6): ...`)
- npm run build: 0 TypeScript 에러, `built in 14.32s`

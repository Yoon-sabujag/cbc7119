---
status: incomplete
phase: 260426-vk9-floor-zone-fix
plan: 01
subsystem: extinguisher-add
tags:
  - extinguisher
  - basement
  - zone-mapping
  - floor-format
dependency_graph:
  requires:
    - 260426-u7f-checkpointspage-ext-fields
  provides:
    - basement-floor-format-consistent
    - basement-zone-prefix-correct
  affects:
    - src/pages/CheckpointsPage.tsx
    - functions/api/extinguishers/create.ts
key-files:
  created: []
  modified:
    - src/pages/CheckpointsPage.tsx
    - functions/api/extinguishers/create.ts
metrics:
  completed: 2026-04-26
  files_modified: 2
  lines_added: 6
  lines_removed: 3
---

# 260426-vk9: 지하층 floor 형식 + zone 매핑 fix — Summary

## What was done

### Code

- `src/pages/CheckpointsPage.tsx` 97번줄: `ZONE_FLOORS.common` 의 'B1F','M','B2F','B3F','B4F','B5F' → 'B1','M','B2','B3','B4','B5' 로 통일 (기존 데이터 + FloorPlanPage + Floor 타입과 일치)
- `functions/api/extinguishers/create.ts`: extFloor 가 B 로 시작하면 extinguishers.zone='지' 강제 + mgmt_no 도 자동 '지-' prefix. check_points.zone 은 영문 enum 유지 (스키마 CHECK 제약 호환). 비-지하층은 기존 매핑 무수정

### Verification (자동)

- `npx tsc --noEmit` PASS
- `git diff --stat`: 2 files changed, 6 insertions(+), 3 deletions(-)

### Build & Deploy

- `npm run build` PASS
- `npx wrangler pages deploy dist --branch production --commit-message "floor zone fix"` → https://f5b62c28.cbc7119.pages.dev

## Commits

- `(latest fix)` — CheckpointsPage ZONE_FLOORS + create.ts zone 강제

## 사용자 검증 절차

1. **PWA 재설치** (홈 화면 PWA 삭제 → Safari 재추가)
2. **잘못된 데이터 정리** — `/checkpoints` → 소화기 카테고리 → "B5F 소화기 1번" (CP-FE-0449) 비활성화. 직전 cascade fix 가 실전 동작하면 D1 의 extinguishers + check_points 정리됨
3. **/checkpoints 신규 등록 테스트** — 카테고리=소화기 → 구역=공용 → 층 드롭다운에 'B1','B2','B3','B4','B5' (F 없음) 보여야 함
4. **B5 등록 시도** → 토스트 "소화기 등록 완료 (지-B5-NN)" 표시 확인
5. **/floorplan 마커 연결** → "마커 추가 → 기존 개소 연결" 에 새 항목 노출 확인

## Status

`incomplete` — 사용자 PWA 검증 대기

검증 완료 시 `complete` 로 전환.

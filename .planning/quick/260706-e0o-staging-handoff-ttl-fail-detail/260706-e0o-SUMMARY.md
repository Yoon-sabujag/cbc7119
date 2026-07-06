---
phase: quick-260706-e0o
plan: 01
status: complete
subsystem: elevator-sync
tags: [staging-handoff, elevator, koelsa, ttl, retry]
completed_date: 2026-07-06
duration_minutes: 5
tasks_completed: 1
tasks_total: 1
files_created:
  - .planning/quick/260706-e0o-staging-handoff-ttl-fail-detail/STAGING-HANDOFF.md
files_modified: []
key_decisions:
  - "staging-first 신규 구현 — prod 코드 변경 0건, 문서 1개만 생성"
  - "검사주기 인지형 TTL 상수 확정: WINDOW_BEFORE_DAYS=60 / ACTIVE_MIN_AGE=24h / DORMANT_MIN_AGE=30d / RECENT_DAYS=60 / STALE_TOAST_MIN_AGE_MS=7d"
---

# Phase quick-260706-e0o Plan 01: 승강기 공단 검사이력 동기화 개선 — staging 핸드오프 문서 생성 Summary

## One-liner

검사주기 인지형 TTL + 공단 호출 재시도 + 증분 fail-detail + 토스트 완화 4건을 staging 콘솔이 단독 구현할 수 있는 완전 스펙 STAGING-HANDOFF.md 작성.

## Tasks Completed

| # | Task | Outcome | Files |
|---|------|---------|-------|
| 1 | STAGING-HANDOFF.md 작성 | 완료 — 162줄, grep 5개 마커 통과 | STAGING-HANDOFF.md (신규) |

## Deliverable Summary

**STAGING-HANDOFF.md** (`162줄`) — staging 콘솔(`~/Documents/cbc7119-data`)이 이 문서만으로 4개 변경을 구현할 수 있도록 배경·prod D1 실측·변경 스펙·검증 시나리오·파라미터 기본값·주의사항을 verbatim 코드 조각 포함하여 작성.

- 변경 1: `inspect-history.ts` 스마트 TTL (dormant 30일 / active 24h, `valid_end` 기반 자동 전환) + `syncPolicy` 관측성 필드
- 변경 2: `_koelsa-common.ts` `fetchKoelsaXml` 재시도 3회 (400ms·800ms 간격)
- 변경 3: `syncOne` 증분 fail-detail — `elevator_inspect_history` 기존 여부 기준 신규+60일 창만 재조회 (~290회 → ~17회)
- 변경 4: `inspectHistory.ts` 토스트 억제 — 캐시 나이 7일 미만이면 stale 토스트 생략

## Deviations from Plan

None — 계획 그대로 문서 1개 생성. 앱 소스 코드 변경 0건.

## Self-Check

- [x] STAGING-HANDOFF.md 존재 확인: `test -f` 통과
- [x] 필수 마커 5개 (`syncPolicy`, `fetchKoelsaXml`, `STALE_TOAST_MIN_AGE_MS`, `891592d9`, 파일 존재) grep 통과
- [x] 줄 수 162 ≥ min_lines 120
- [x] git status — 신규 디렉토리 untracked 1건만, 앱 소스 변경 0건

## Self-Check: PASSED

---
phase: 24
slug: extinguisher-asset-location
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-30
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | {확인 필요 — 현재 프로젝트 자동 테스트 없음. Wave 0 에서 vitest 또는 manual UAT 결정} |
| **Config file** | {none — Wave 0 결정} |
| **Quick run command** | `npm run typecheck` (현재 가능한 빠른 회귀 신호) |
| **Full suite command** | `npm run build && npx wrangler pages deploy dist --branch=preview` (deploy-and-smoke) |
| **Estimated runtime** | typecheck ~10s · build+deploy ~120s |

> 본 phase 는 5월 법정점검 임박으로 자동 테스트 인프라 도입보다 **PRAGMA 검증 + 마이그레이션 dry-run + 프로덕션 배포 후 manual UAT** 가 현실적. Validation Architecture 의 Open Question 1(PRAGMA) 이 wave 1 의 첫 task.

---

## Sampling Rate

- **After every task commit:** `npm run typecheck` 통과
- **After every wave:** wave 별 manual UAT 체크리스트 (RESEARCH.md §Validation Architecture 의 wave-specific 항목)
- **Before `/gsd-verify-work`:** 프로덕션 배포 후 7개 success criteria 전체 manual UAT 통과
- **Max feedback latency:** typecheck < 15s · 배포 후 검증 < 5min

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 24-01-01 | 01 (Migration) | 1 | EXT-04 | — | PRAGMA 로 prod D1 컬럼 상태 확정 후 마이그레이션 SQL 적용 | manual+CLI | `npx wrangler d1 execute cha-bio-db --remote --command "PRAGMA table_info(extinguishers);"` | N/A | ⬜ pending |
| 24-01-02 | 01 | 1 | EXT-04 | — | 마이그레이션 SQL 적용 후 5개 컬럼 모두 존재 확인 | CLI | `npx wrangler d1 execute cha-bio-db --remote --command "PRAGMA table_info(extinguishers); PRAGMA table_info(check_records);"` | ❌ W0 (마이그레이션 후 생성) | ⬜ pending |
| 24-01-03 | 01 | 1 | EXT-04 | — | 백필 후 NULL 카운트 확인 | CLI | `... --command "SELECT COUNT(*) FROM extinguishers WHERE status IS NULL;"` | N/A | ⬜ pending |
| 24-02-01 | 02 (API) | 2 | EXT-04 | — | assign/unassign/swap/dispose 엔드포인트 200 응답 + DB 상태 변화 확인 | manual+curl | 배포 후 curl 또는 dev console | ❌ W0 | ⬜ pending |
| 24-02-02 | 02 | 2 | EXT-04 | — | ≤3 필드 변경 룰 백엔드 검증 (4개 필드 PUT 시 400 응답) | manual+curl | 배포 후 curl | ❌ W0 | ⬜ pending |
| 24-03-01 | 03 (List Page) | 3 | EXT-05 | — | `/extinguishers` 라우트 진입, 필터·검색 동작 | manual UAT | browser | ❌ W0 | ⬜ pending |
| 24-03-02 | 03 | 3 | EXT-05 | — | 신규 등록 → 미배치 상태 카드로 표시 | manual UAT | browser | ❌ W0 | ⬜ pending |
| 24-03-03 | 03 | 3 | EXT-05 | — | 정보 수정 모달 ≤3 필드 카운터 + 4개 시 저장 비활성 | manual UAT | browser | ❌ W0 | ⬜ pending |
| 24-04-01 | 04 (Floorplan UI) | 3 | EXT-05 | — | 빈 마커 ❓ 빨강 렌더 + 범례 status row 「미배치」 항목 | manual UAT | browser | ❌ W0 | ⬜ pending |
| 24-04-02 | 04 | 3 | EXT-05 | — | 마커 편집 모달: 추가(개소명+구역), 매핑 X 옵션 | manual UAT | browser | ❌ W0 | ⬜ pending |
| 24-04-03 | 04 | 3 | EXT-05 | — | 마커 편집 → 「소화기 배치」 → 리스트 (마커 동행) | manual UAT | browser | ❌ W0 | ⬜ pending |
| 24-04-04 | 04 | 3 | EXT-05 | — | 점검 모드 ❓ 클릭 → 매핑 유도 안내 | manual UAT | browser | ❌ W0 | ⬜ pending |
| 24-05-01 | 05 (Inspection) | 3 | EXT-04 | — | check_records 입력 시 extinguisher_id 스냅샷 저장 | CLI | `... --command "SELECT extinguisher_id FROM check_records ORDER BY recorded_at DESC LIMIT 5;"` | ❌ W0 | ⬜ pending |
| 24-05-02 | 05 | 3 | EXT-05 | — | 일반점검 > 소화기 헤더 「+ 새로 등록」 버튼 동작 | manual UAT | browser | ❌ W0 | ⬜ pending |
| 24-06-01 | 06 (Bidirectional) | 3 | EXT-05 | — | 리스트 미배치 → 도면 동행 → ❓ 클릭 매핑 → 리스트 복귀 | manual UAT | browser | ❌ W0 | ⬜ pending |
| 24-06-02 | 06 | 3 | EXT-05 | — | 매핑된 다른 소화기 클릭 시 swap 확인 모달 → swap | manual UAT | browser | ❌ W0 | ⬜ pending |
| 24-07-01 | 07 (Migration verify) | 3 | EXT-04 | — | 기존 1:1 데이터 무손실 (마이그레이션 전후 ROW COUNT, 매핑 수 동일) | CLI | `... --command "SELECT COUNT(*) FROM extinguishers; SELECT COUNT(*) FROM check_points WHERE marker_kind='extinguisher';"` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

> Wave / plan 분배는 PLAN.md 작성 시 변경될 수 있음. 본 표는 가이드.

---

## Wave 0 Requirements

- [ ] `npm run typecheck` 가 현 상태 통과 확인 (회귀 baseline)
- [ ] 운영 D1 의 `extinguishers` / `check_records` / `check_points` / `floor_plan_markers` 컬럼 PRAGMA 확보 (RESEARCH.md Open Question 1 해소)
- [ ] 마이그레이션 dry-run: 로컬 D1 (`--local`) 에 마이그 SQL 적용해 에러 없는지 확인 후 `--remote` 적용

> 본 프로젝트는 자동 테스트 프레임워크 미설치. 신규 도입은 5월 법정점검 이후로 deferred (메모리 「운영 관찰 모드」 룰).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 빈 마커 ❓ 디자인 (빨강 + 물음표) | EXT-05 | 시각 디자인은 메모리 「디자인 변경 전 상의 필수」 룰에 따라 sketch 후 사용자 승인 필요 | `/gsd-sketch` 또는 인라인 시안 → 사용자 승인 → 적용 |
| ≤3 필드 카운터 UX (변경 수 실시간 표시, 4개 시 빨강+비활성) | EXT-05 | UX 미세 조정 (애니메이션, 색상, 안내 문구) | sketch 시안 후 인라인 적용 |
| 도면 페이지 ↔ 리스트 페이지 양방향 마커 동행 | EXT-05 | URL state machine 행동은 browser 에서만 검증 가능 | 양 방향 시나리오 매뉴얼 클릭 |
| swap 확인 모달 카피 | EXT-05 | "X 위치 소화기. 서로 바꿀까요?" 문구 자연스러운지 사용자 확인 | UAT |
| PWA 캐시 무효화 안내 | EXT-04 | 신규 라우트 추가 후 SW 갱신 — 사용자에게 앱 재설치/새로고침 안내 (메모리 룰) | 배포 후 사용자 안내 + 재설치 실행 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s (typecheck) / < 5min (deploy+UAT)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

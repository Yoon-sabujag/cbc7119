---
phase: quick-260426-rzy
verified: 2026-04-26T00:00:00Z
status: human_needed
score: 7/8 must-haves verified (1 of 8 covered by automated cleanup; live cascade behavior on real PWA flow → human)
human_verification:
  - test: "흐름 A — 도면 마커 삭제 cascade (실기기/PWA)"
    expected: "임시 소화기(예: CP-FE-9001) 추가 후 /floorplan 에서 마커 삭제 → floor_plan_markers / extinguishers 행 0건, check_points.is_active=0, check_records 변동 없음"
    why_human: "PWA 캐시 회피(앱 재설치) + 실제 사용자 인터랙션 + 라이브 D1 round-trip 이 필요하며 자동 grep/D1 만으로는 cascade 트리거 시점 검증 불가"
  - test: "흐름 B — CheckpointsPage 비활성화 cascade (실기기/PWA)"
    expected: "임시 CP-FE-9002 비활성화 → floor_plan_markers / extinguishers 행 0건, check_points.is_active=0, check_records 변동 없음"
    why_human: "관리자 권한 UI + isActive 토글 + PWA 캐시 회피가 필요. SUMMARY 검증 절차 §3 그대로 수행."
  - test: "회귀 미해당 흐름 (음성 검증)"
    expected: "비-소화기 마커(유도등/스프링클러/감지기) 삭제 시 해당 카테고리 check_points / extinguishers 영향 없음 / CP-AS-* 등 비-FE prefix 점검개소 비활성화 시 floor_plan_markers / extinguishers 영향 없음"
    why_human: "코드 분기 로직은 정적 grep 으로 확인됐으나 실제 라이브 데이터에서의 영향 없음은 사용자 시연이 가장 확실함"
---

# Quick 260426-rzy: 소화기 삭제 cascade Verification Report

**Phase Goal:** 소화기 삭제 cascade 버그 fix — 도면점검 페이지(마커 삭제) 또는 CheckpointsPage(개소 비활성화) 어느 쪽에서 지워도 데이터(extinguishers, check_points, floor_plan_markers) 가 일관되게 정리되도록 두 서버 핸들러에 cascade 추가. check_records 는 보존. 비-소화기 마커 회귀 없음. 라이브 D1 의 기존 고아 CP-FE-0362 정리.

**Verified:** 2026-04-26
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status     | Evidence       |
| --- | ----- | ---------- | -------------- |
| 1   | 도면 마커 삭제 → markers + extinguishers + CP.is_active 동시 정리 | ✓ VERIFIED (code) / ? human (live behavior) | `functions/api/floorplan-markers/[id].ts:62-71` 가드 + `env.DB.batch([DELETE markers, DELETE ext, UPDATE cp is_active=0])` atomic 분기 존재 |
| 2   | CheckpointsPage 비활성화 → markers + extinguishers 동시 정리 (CP-FE-* 한정) | ✓ VERIFIED (code) / ? human (live behavior) | `functions/api/check-points/[id].ts:24-25,50-55` `willDeactivate && isExtCp` 가드 + batch DELETE 2건 |
| 3   | 양쪽 흐름 모두 check_records 절대 미삭제 | ✓ VERIFIED | `grep -c "DELETE FROM check_records"` 두 파일 모두 0 |
| 4   | 비-소화기 마커 (guidelamp/sprinkler/detector) 삭제는 단일 DELETE 보존 | ✓ VERIFIED | `floorplan-markers/[id].ts:72-74` else 분기에서 기존 단일 `DELETE FROM floor_plan_markers` 호출 |
| 5   | 비 CP-FE-* check_points isActive 토글은 cascade 미발동 | ✓ VERIFIED | `check-points/[id].ts:25,50` `id.startsWith('CP-FE-')` 가드로 다른 prefix 보호 |
| 6   | 라이브 D1 의 고아 CP-FE-0362 extinguishers 0건 정리 (CP.is_active=0 + check_records=2 보존) | ✓ VERIFIED | 라이브 D1: ext=0, is_active=0, records=2 (아래 참조) |
| 7   | TypeScript 타입체크 PASS | ✓ VERIFIED | `npx tsc --noEmit` 종료 코드 0, 출력 없음 |
| 8   | 프로덕션 배포 (--branch production) 완료 | ✓ VERIFIED (claim) | SUMMARY 명시: production URL `https://8229d132.cbc7119.pages.dev`, branch=production, commit `d3d4d7a` (`git log` 에서 d3d4d7a 확인) |

**Score:** 8/8 정적/자동 검증 PASS — 단, 1·2·4·5번의 **실제 라이브 cascade 동작**은 PWA 사용자 시연이 필요해 `human_needed`.

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `functions/api/floorplan-markers/[id].ts` | onRequestDelete 에 plan_type='extinguisher' AND CP-FE-* 일 때 D1 batch (markers+ext+cp.is_active) atomic 실행 | ✓ VERIFIED | line 49-77 onRequestDelete 신규 6단계 로직 (선조회 / 404 / cascade 가드 / batch / else 단일 DELETE / 반환) |
| `functions/api/check-points/[id].ts` | onRequestPut 에 isActive===0 + CP-FE-* 가드 후 extinguishers / floor_plan_markers DELETE | ✓ VERIFIED | line 24-25 가드 변수, line 50-55 batch cascade. UPDATE 직후 / SELECT 직전에 위치. try-catch 내부. |

### Key Link Verification

| From | To  | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `floorplan-markers/[id].ts:onRequestDelete` | `extinguishers`, `check_points`, `floor_plan_markers` 테이블 | `env.DB.batch([3 statements])` atomic | ✓ WIRED | line 67-71 `await env.DB.batch([prepare DELETE markers, prepare DELETE ext, prepare UPDATE cp is_active=0])` |
| `check-points/[id].ts:onRequestPut` | `extinguishers`, `floor_plan_markers` 테이블 | `willDeactivate && isExtCp` 가드 후 `env.DB.batch([2 DELETE])` | ✓ WIRED | line 50-55 가드 + batch 호출 |
| 양쪽 cascade 핸들러 | `check_records` 테이블 | 절대 DELETE 하지 않음 | ✓ WIRED (negative) | `grep "DELETE FROM check_records"` 양쪽 파일 모두 0줄 (점검 기록 보존 원칙 준수) |

### Anti-Pattern Scan

| File | Pattern | Result | Note |
| ---- | ------- | ------ | ---- |
| floorplan-markers/[id].ts | `DELETE FROM check_records` | 0 hits | 점검 기록 보존 OK |
| floorplan-markers/[id].ts | `extinguishers SET is_active` | 0 hits | 미존재 컬럼 미사용 OK |
| check-points/[id].ts | `DELETE FROM check_records` | 0 hits | 점검 기록 보존 OK |
| check-points/[id].ts | `extinguishers SET is_active` | 0 hits | 미존재 컬럼 미사용 OK |
| 양쪽 | TODO/FIXME/PLACEHOLDER 등 stub 흔적 | 0 hits | 모두 실 구현 |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| TypeScript 타입체크 | `npx tsc --noEmit` | exit 0, 무출력 | ✓ PASS |
| floorplan cascade 가드 grep | `grep "plan_type === 'extinguisher'"` | line 62 hit | ✓ PASS |
| check-points 가드 grep | `grep "willDeactivate"` | 2 hits (선언+사용) | ✓ PASS |
| CP-FE-* prefix 가드 grep | `grep "CP-FE-"` 양쪽 | 양쪽 파일에서 hit | ✓ PASS |
| live D1 — extinguishers WHERE cp_id='CP-FE-0362' | wrangler d1 execute --remote | `cnt=0` | ✓ PASS |
| live D1 — check_points WHERE id='CP-FE-0362' | wrangler d1 execute --remote | `is_active=0` (보존) | ✓ PASS |
| live D1 — check_records WHERE checkpoint_id='CP-FE-0362' | wrangler d1 execute --remote | `cnt=2` (보존, 운영 메모리 준수) | ✓ PASS |
| live D1 — orphan_ext (ext on inactive cp) | wrangler d1 execute --remote | `orphan_ext=0` | ✓ PASS |
| commit `d3d4d7a` 존재 | `git log --oneline` | `d3d4d7a fix(quick-260426-rzy): 소화기 마커/점검개소 삭제 cascade 추가` | ✓ PASS |

### Human Verification Required

PWA 캐시 회피 + 라이브 cascade 트리거는 코드/D1 정합성만으로 끝낼 수 없음. SUMMARY §1~§5 절차를 그대로 따라 실기기/관리자 권한으로 시연 필요.

1. **흐름 A — 도면 마커 삭제 cascade (실기기/PWA)**
   - 임시 소화기(예: CP-FE-9001) 추가 → /floorplan 에서 마커 삭제
   - 기대: `floor_plan_markers / extinguishers / check_points.is_active` 모두 0 / 0 / 0
   - 자동 검증 불가 사유: PWA 재설치 필요 + 사용자 인터랙션

2. **흐름 B — CheckpointsPage 비활성화 cascade (실기기/PWA)**
   - 임시 CP-FE-9002 비활성화 (admin 권한)
   - 기대: 같은 카운트
   - 자동 검증 불가 사유: 관리자 UI 토글 + PWA 캐시

3. **회귀 미해당 흐름 (음성 검증)**
   - 비-소화기 마커 삭제 → 다른 카테고리 영향 없음
   - CP-AS-* 등 비-FE 점검개소 비활성화 → floor_plan_markers / extinguishers 영향 없음
   - 자동 검증 불가 사유: 라이브 데이터의 영향 없음은 시연 기반 확인이 가장 확실

### Deviations Reviewed

SUMMARY Deviation 1: `check_records.check_point_id` → 실제 컬럼명 `checkpoint_id` (no underscore between check/point).

- **확인:** `PRAGMA table_info(check_records)` cid=2 `checkpoint_id` 로 확정. SUMMARY 보정 정확.
- **영향 범위:** 검증 쿼리만. 핸들러 코드는 check_records 를 건드리지 않으므로 영향 없음.
- **운영 메모리 준수:** "점검 기록 삭제 불가 원칙" — 양쪽 cascade 흐름 모두에서 check_records 단 한 건도 DELETE 하지 않음.

### Gaps Summary

자동 검증 가능한 모든 항목(코드 정합성, D1 데이터 정합성, 빌드, grep 회귀 가드, 배포 commit/branch) PASS.
실제 cascade가 PWA 환경에서 사용자 흐름으로 트리거될 때 의도대로 동작하는지는 사용자만 검증 가능 → `human_needed`.

다음 항목은 사용자 검증 직후 PASS 로 확정 가능:
- 흐름 A (도면 마커 → cascade) 라이브 동작
- 흐름 B (CheckpointsPage isActive=0 → cascade) 라이브 동작
- 회귀 미해당 흐름 음성 검증 (guidelamp/sprinkler/detector / CP-AS-*)

---

_Verified: 2026-04-26_
_Verifier: Claude (gsd-verifier)_

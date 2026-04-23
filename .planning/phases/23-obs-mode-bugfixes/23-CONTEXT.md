# Phase 23: Observation-Mode Bug Fixes (Retroactive)

**Period:** 2026-04-23 ~ 2026-04-24
**Mode:** Retroactive — 실작업이 GSD 워크플로우 밖에서 이미 완료된 후 기록으로 남김
**Baseline commit (before work):** `cbf4479` (main)
**Backup branches:** `backup/before-pinch-zoom-20260422`, `backup/before-inspection-unify-20260424`

## Motivation

운영 관찰 모드(2026-04-20~) 에서 5월 법정점검 실전 검증을 앞두고 실사용 관찰 중 **3건의 주요 이슈**가 드러났다. 관찰 모드 정책상 새 기능 추가는 금지지만, 기존 기능의 버그/잘못된 동작은 즉시 수정해야 5월 실전 투입 가능하다고 판단. 해당 수정들을 소급하여 본 phase 로 묶어 기록.

## Issues Tackled

### Issue A — 푸시 알림 전면 침묵 (P0)
**Symptom:** 매일 08:45 KST 일일 푸시가 단 한 건도 발송되지 않음. 여러 날 지속됨.
**Root cause:** `cbc-cron-worker/src/index.ts` 의 `getWorkingStaffIds()` 가 존재하지 않는 `annual_leaves.status` 컬럼을 조회 → D1 가 `no such column: status` throw → `handleDailyNotifications` 통째로 실패. `annual_leaves` 스키마에 `status` 컬럼이 존재한 적 없음(승인 워크플로우 미구현 상태).
**Scope:** cron worker 전용 별도 프로젝트(`cbc-cron-worker/`) 의 서버 로직. 본 레포(`cha-bio-safety/`) 와 분리.
**Discovery method:** 진단용 `*/15 * * * *` 임시 cron 트리거 + 드라이런 핸들러 → `[daily-dry] THREW: D1_ERROR: no such column: status at offset 60` 로그 확인.

### Issue B — 교육 알림 레이블·중복·만기기준 오류 (P1)
**Symptoms:**
1. 보조자 대상 알림이 "소방안전관리자" 로 하드코딩돼 잘못 발송될 뻔
2. 이미 refresher 이수자에게도 initial row 기반 만기 알림이 중복 발동
3. D-30 이 5월 법정점검 직전과 겹칠 수 있어 경보 기간이 부족
4. 승강기안전관리자 알림 레이블이 "교육" 으로만 표기
5. 선임 후 최초 실무교육 이수 기한 알림 자체가 없음
**Root causes:** 단일 문자열 하드코딩, `education_records` 에 관리자/보조자 구분 필드 부재, refresher 완료 시 주기 해석 오류, 선임일 기반 트리거 미설계.
**Scope:** `cbc-cron-worker/src/index.ts` + `cha-bio-safety/src/components/SettingsPanel.tsx` + DB 데이터 정리 (`education_records` 행 3건).

### Issue C — 점검 현황 수치 불일치 (P1)
**Symptom:** 대시보드 "이번달 점검 현황" 카드는 100%(예: 소화전 103/106 = 97%)로 뜨는데, 모바일 일반점검 페이지 카테고리 카드는 7/154 같은 동떨어진 수치. 사용자 혼란.
**Root causes:**
1. 세 위치(대시보드 서버 / 모바일 일반점검 / 데스크톱 일반점검)가 완료 판정 기준이 제각각 — `DISTINCT checkpoint_id` vs `zone|floor|location|category` 조합 vs 레코드 존재 여부
2. 모바일이 "당일 + DIV/컴프레셔 전일" 제한, 대시보드는 월 전체 → 기간 범위 차이
3. 유도등 `schedule-status` 바이패스가 대시보드에만 존재
4. `[접근불가]` 자동완료가 대시보드에 누락 (`default_result` 만 있음)
5. `CATEGORY_ALIAS` 에서 컴프레셔↔DIV 매핑이 대시보드에만 있어 카드 독립성 깨짐
**Scope:** `cha-bio-safety/functions/api/dashboard/stats.ts` + `cha-bio-safety/src/pages/InspectionPage.tsx` + 신규 `cha-bio-safety/src/utils/inspectionProgress.ts`.

## Non-Goals (Explicitly Excluded)

- 데스크톱 일반점검 페이지 카드 로직 변경 — 현행(`zone|floor|location|category` 조합) 유지. 사용자 결정.
- 신규 기능 추가 — 운영 관찰 모드 정책 준수.
- 선임 후 6개월/3개월 내 신규교육 미이수 과거 알림 보완 (이미 지난 D-60 은 cron 이 재전송하지 못함) — 수기 조치 영역.
- 교육 알림 로직을 "가장 최근 completed_at + 2년" 으로 전환 — 법적 해석상 "신규교육일 고정 + 2N년" 을 유지하기로 사용자 확정.

## Decisions Locked During This Phase

| 주제 | 결정 |
|------|------|
| 소방 교육 주기 기준 | 신규교육일(`education_type='initial'`) 기준 + 2N년 주기 고정. refresher 는 해당 주기 내 이수 증빙으로만 기록. |
| 승강기 교육 주기 | `safety_mgr_edu_expire` 필드 직접 참조 (3년 주기는 데이터 입력 시점에 반영). |
| 교육 알림 D-XX | D-30 → **D-60** 으로 확장. |
| 점검 카드 단위 | `DISTINCT checkpoint_id` (대시보드 SQL 기준) |
| 점검 카드 기간 | 모바일 + 대시보드 모두 **당월 전체** (`BETWEEN monthStart AND monthEnd`) |
| 다일 attribution window | 실데이터(연속 일자 각각 독립 row)에 맞지 않아 **폐기**. |
| 유도등 완료 바이패스 | 당월 유도등 inspect 일정 중 `status='done'` 이 하나라도 있으면 100%. 모바일/대시보드 공통. |
| 자동완료 조건 | `default_result IS NOT NULL OR description LIKE '%[접근불가]%'` — 모바일/대시보드 공통. |
| `CATEGORY_ALIAS` | 방화문↔특별피난계단만 유지. 컴프레셔↔DIV 제거. |

# Phase 23 Verification

## Issue A — 푸시 cron 복구

**진단 경로:**
1. `*/15 * * * *` 임시 cron + `dryRunDailyNotifications` 추가 → 10:15 KST 발동에서 `[daily-dry] THREW: D1_ERROR: no such column: status` 로그 관찰
2. `PRAGMA table_info(annual_leaves)` 결과 7개 컬럼(`id, staff_id, date, type, year, created_at, reason`) 중 `status` 부재 확인
3. `cbc-cron-worker/src/index.ts:96` 의 `SELECT ... WHERE date = ? AND status != 'rejected'` 가 원인으로 특정

**수정 후 드라이런 결과 (10:30 KST):**
```
[daily-dry] start. today=2026-04-23 yesterday=2026-04-22
[daily-dry] workingIds=["2018042451","2022051052"]
[daily-dry] allSubs=5 filtered=4
[daily-dry] queries: todaySchedules=3 yesterdayIncomplete=0 unresolvedFindings=0 upcomingEducation=0 elevatorEduExpiring=0
[daily-dry] would-send(working)=4 ["2022051052:daily_schedule","2018042451:daily_schedule",...]
[daily-dry] OK (no throw)
```

**실전 검증 (다음날):** 2026-04-24 08:45 KST 에 실제 daily 푸시 수신 확인 — 사용자 "아이폰 진단푸시 왔고" 및 후속 통상 알림 동작 피드백으로 간접 확인.

## Issue B — 교육 알림

**데이터 검증:**
- `staff.appointed_at` / `safety_mgr_appointed_at` / `safety_mgr_edu_expire` 값이 4명 staff 모두 사용자 구두 확인과 일치
- 현재 시점 D-60 트리거 대상 0건 → 수정된 쿼리 조용히 돌아감 (정상)
- 향후 석현민 실무교육 예정 2028-03-14 / 윤종엽 2028-03-21 / 김병조 승강기 2028-11-02 에 자동 발동 예정

**문구 검증 (dry):** 로그 기반으로 `${staff_name}님 소방안전관리 보조자 실무교육이 60일 후 만기됩니다` 형식 확인. 사용자 "실무교육" 표기 확정.

**미해결(알고 있음):**
- 4/20 이전에 지나간 D-30 들은 복구 불가 (cron 이 과거 알림을 재발송하지 않음)
- 박보융 initial 기록 없음 — 신규교육 미이수 과태료 리스크. 수기 챙겨야.
- 김병조/박보융/석현민 initial 기록이 사용자 제공 "지난 실무교육일" 이 아닌 refresher 로 등록됨. 현재 로직(initial 기준)에서는 이 세 명의 실무교육 만기 알림이 발동하지 않음. **법 해석상 initial 이 있어야 주기 시작**. 추후 각자 실제 신규교육일을 받아 initial 로 등록하면 자동 작동.

## Issue C — 점검 카드 통일

**데이터 기반 검증 (2026-04-24 15:00 KST 시점):**
- 대시보드 소화전 97% (103/106) ↔ 모바일 `소화전+비상콘센트` 카드: fa7725b 이전엔 7/154 로 크게 어긋남 → 이후 대시보드와 동일한 당월 집계 방식으로 전환되어 일치
- 소방용전원공급반 4/7 — 지하 1층 3개소(B113실/식당EPS실/방재실) 당월 기록 없음으로 확인 (`SELECT ... FROM check_records WHERE cp.category='소방용전원공급반' ...` 쿼리로 검증). 대시보드와 동일.
- 유도등 카드: 4/13 일정이 `status='done'` 상태 → c73a1de 로 당월 any-done 바이패스 적용 후 100% 표시 확인 — 사용자 "확인 완료" 피드백.

**추가 후속 수정 (1f9fe65):** 카드(월간)는 맞아졌는데 대시보드 "오늘 현황 점검 미완료" 가 147/154 로 크게 어긋남. 원인: `inspDoneRecords` 가 `cr.checked_at=today` 로만 집계해 연속 다일 일정의 어제·그제 기록을 누락. 수정 후 오늘 inspect 일정이 걸린 카테고리별로 연속 일정 블록 시작일을 계산해 `[blockStart, today]` 범위로 합산 — 사용자 "확인 됨" 피드백으로 정합 확인.

**로직 비교표:**

| 위치 | 변경 전 | 변경 후 |
|------|---------|---------|
| 대시보드 | `DISTINCT checkpoint_id` + `default_result` + CATEGORY_ALIAS{방화문→특별피난계단, 컴프레셔→DIV} | + `[접근불가]`, CATEGORY_ALIAS 에서 컴프레셔↔DIV 제거 |
| 모바일 일반점검 | `records[cp.id]` (당일) + DIV/컴프는 전일 병합 + `default_result`/`[접근불가]` | 당월 normal/caution 기록이 있는 `DISTINCT checkpoint_id` + 자동완료 (대시보드 동치) |
| 데스크톱 일반점검 | `zone|floor|location|category` 조합 | **변경 없음** |

## 롤백 경로 (필요 시)
```bash
# 핀치줌 도입 전 (4/22 이전)
git reset --hard backup/before-pinch-zoom-20260422
# 점검카드 통일 시작 전 (4/24 이전)
git reset --hard backup/before-inspection-unify-20260424
```

## 최종 배포 검증
- Frontend: https://784384fc.cbc7119.pages.dev (commit 1f9fe65)
- cron-worker: Version ID `75e06927-f4cf-4ed3-aee2-cd53c689a2cf` (commit f4f1fe2)
- 사용자 실기기(iOS)/데스크톱 Chrome 에서 확인 완료

---
slug: cron-push-not-firing
status: resolved
trigger: "cbc-cron-worker (형제 디렉토리) 의 매일 아침 08:45 KST 자동 푸시 알림이 실제 사용자에게 안 옴. 테스트 푸시 (/api/push/test) 는 정상 동작 확인됨 (즉 VAPID/subscription/payload 인프라는 OK). 사용자가 오늘 시점 (2026-04-30) 까지도 받지 못함을 확인."
created: 2026-04-30T03:30:00+0900
updated: 2026-04-30T04:30:00+0900
resolved_at: 2026-04-30T04:30:00+0900
---

# Debug: cron-push-not-firing

## Symptoms

<DATA_START type="user-symptoms">
- expected: 4월 21일 이후 매일 08:45 KST 에 schedule_items 매칭된 인원에게 자동 push 알림 도착.
- actual: 알림 안 옴 (반복적). 사용자가 2026-04-30 까지도 받지 못함을 확인.
- error_messages: 사용자가 본 표면 에러 없음 (silent).
- timeline: 4-21 부터 시작 예정. 시범 도입 직후부터 안 왔는지, 어느 시점부터 안 왔는지 미확인.
- reproduction: 매일 08:45 KST 자동 발송. manual /api/push/test 는 정상.
- 환경: cbc-cron-worker (형제 디렉토리, /Users/jykevin/Documents/20260328/cbc-cron-worker) 가 cron schedule 보유. cha-bio-safety 메인 앱과 별개 worker.
</DATA_END>

<DATA_START type="user-correction-2026-04-30">
"지지난번 테스트가 아니야. 지난번에 분명히 내 계정으로 로그인해서 테스트 푸시 알림을 받았었어."
→ user (윤종엽, 2022051052, assistant) 본인 계정으로 /api/push/test 를 호출해 본인 디바이스에서 직접 알림을 수신한 경험이 있음.
→ 따라서 (a) user 클라이언트 단(SW/권한/PWA 설치) 정상, (b) /api/push/test 가 admin 만 호출 가능하다는 이전 가설은 틀렸을 가능성이 큼 — 코드 재확인 필요.
</DATA_END>

## Current Focus

- hypothesis: **G (NEW, 가장 유력) — 가설 F 는 부분 기각**. handleDailyNotifications 와 handleDiagnosticAllSubs 의 "구조적 logic diff" 는 **단지 working filter 1 단계만 차이**이며, 그 working filter 는 user 의 4-22/4-23/4-28/4-29 working day 에 대해 정확히 user 를 포함시킨다 (Python 시뮬레이션으로 검증). 따라서 daily handler 코드는 user 가 working 인 날 user 에게 push 를 보내야 한다 — **현재 코드 기준** 으로.
  
  실제 root cause 는 **시간축 이슈**: 4-21~4-28 동안 daily push 가 안 온 사유는 **이미 진단·수정된 두 개의 회귀** ((1) `annual_leaves.status` throw — 4-23 03:30 UTC fix, (2) `*/15` 진단 트리거 정리 4-23 03:40 UTC 이후) 그 자체이며, **그 이후의 production 발화 (4-23 23:45, 4-24 23:45 ... 4-28 23:45 UTC) 가 정말 깨끗했는지 확인할 telemetry 가 없었음.** telemetry instrumentation 자체가 4-29 18:31 UTC 배포 (commit `a0f6c1d`) 에 추가되었으므로 직전 production daily 발화 (4-28 23:45 UTC) 는 관측 불가.
  
  단, 사용자 정정 ("내 계정으로 로그인해서 테스트 푸시 받았다") 에 대한 가장 합리적 해석은 **"user 디바이스에서 admin 계정 (석현민 2018042451) 으로 로그인 후 SettingsPanel 의 admin-only 테스트 버튼 사용"** — 이 경우 발송된 푸시는 **admin 의 staff_id (2018042451) subscription** 으로 가게 되며, 그 subscription endpoint 가 user 디바이스에 있다면 user 디바이스에서 알림 표시. 즉 user 디바이스 ≠ user staff_id 의 push_subscription 1:1 매핑. push_subscriptions 테이블에는 admin 명의로 등록된 sub 가 있다면 user 디바이스에서 받은 게 그것.

- secondary hypothesis: **F2 (잔존 가능성) — daily handler 와 diagnostic handler 의 미묘한 차이 1건**: daily 는 prefs.daily_schedule 체크 + todaySchedules.results.length>0 조건을 모두 만족해야 sends 에 들어감. push_subscriptions 의 user (2022051052) 의 prefs 를 확인했을 때 모두 true 였으므로 prefs 단에서 막히는 일은 없음. 단, **prefs JSON parse 에서 일부 row 가 throw 시 silently skip** 같은 방어 코드는 없음 — 만약 user 의 prefs 가 깨진 JSON 이면 여기서 throw 되어 전체 daily handler 가 fall through 가능성. 다만 working filter 통과 → for-loop 진입 → JSON.parse 실패 → throw → catch 분기에서 logTelemetry 'cron-daily-error' 가 찍힘. 4-29 telemetry 에 cron-daily-error 가 0건 → 이 가설도 약함.

- next_action:
  1. **push_subscriptions 의 user (2022051052) row 의 notification_preferences JSON 무결성 직접 확인** (이미 evidence 에서 prefs.daily_schedule:true 확인했지만 raw JSON 다시 보고 trailing whitespace/encoding 이상 없는지)
  2. **4-29 23:45 UTC (≈ 4시간 후) 의 production `45 23 * * *` 발화 결과 telemetry 관측** — 이 시점에 telemetry instrumentation 이 production 에 들어가 있는 첫 daily 발화. cron-daily-start 이벤트의 workingIds 에 user 포함 여부 (kstNow 가 2026-04-30 08:45 KST 라 today=2026-04-30, user 는 비 → 정상적으로 제외) → 이 fire 도 user 한테는 안 가는 게 맞음.
  3. **첫 user 가 working 인 fire = 2026-04-30 23:45 UTC (today=2026-05-01)**. 이 fire 의 telemetry 결과가 user 에게 push 가 가는지 검증할 첫 결정적 관측 시점.
  4. push_subscriptions 의 admin (2018042451) row 의 endpoint host 확인 — 그 host 가 user 디바이스의 Apple Push 인지 fcm 인지로 사용자 정정 해석 검증.

- expecting:
  - 만약 `cron-daily-end {fulfilled:N, rejected:0}` + user 의 cron-daily-push 201 이 4-30 23:45 UTC fire 에서 관측되면 → root cause = "전 회귀 사이클 (annual_leaves throw / `*/15` cleanup) 이후 코드는 정상이고, 사용자 디바이스 ≠ user staff_id 로 인한 인지적 혼동" 으로 종결.
  - 관측되지 않으면 → handleDailyNotifications 코드 재검토 + DB row 별 추가 진단 필요.

## Hypotheses (초기 후보, evidence 로 좁혀나감)

- A) cron 자체가 안 도는 경우 — worker 미배포 / schedule 미등록 / cloudflare 측 트리거 누락 → **REJECTED** (`*/5` 트리거가 wrangler tail 에서 정상 fire 확인, scriptVersion 도 latest deploy 일치)
- B) cron 은 도는데 발송 대상 매칭이 0건 — schedule_items 없음 또는 매칭 룰 빠짐 → **REJECTED** (telemetry: subsCount=3, todaySchedulesCount=2, sendsCount=3, 모두 정상 매칭)
- C) 매칭되지만 push send 단계 실패 — subscription 만료, VAPID 키 mismatch, web push 응답 4xx/5xx, 네트워크 → **REJECTED** (telemetry: 모든 sendPush 가 status 201 Created, fulfilled=3/rejected=0. user 의 Apple Push 엔드포인트 2개도 진단 cron 에서 둘 다 201)
- D) 발송은 됐지만 OS 단에서 안 보임 — manual /api/push/test 가 정상이라 후순위. 사용자 정정 (본인 계정으로 test 받음) 후 **DEMOTED** — 가능성 더 낮아짐. 단, 클라이언트 답변 받기 전까지 STILL OPEN.
- E) 어떤 분기든 telemetry 가 없어 외부에서 진단 불가 — **RESOLVED** (logTelemetry 추가, 모든 분기 가시화 완료)
- **F) (NEW, 가장 유력) handleDailyNotifications 본 handler 만의 로직 회귀**:
  - working filter 가 user 의 offset=1 사이클 계산을 잘못해서 user 가 working 인 날에도 비번으로 판정?
  - 또는 daily 매칭 카테고리 (inspection / event 외) 가 너무 좁아서 schedule_items 가 있어도 "today=0" 으로 fall-through?
  - 또는 prefs `daily_schedule:true` 이외의 조건 (예: per-staff 매칭) 에서 user 만 빠지는 분기?
  - 진단 핸들러는 working filter 우회 → 정상. 본 handler 와의 diff 가 root cause.

## Evidence

- timestamp: 2026-04-30 03:11 KST | source: file | finding: cbc-cron-worker/wrangler.toml triggers = ["45 23 * * *", "*/5 * * * *", "0 6 * * *"]. compatibility_date 2024-09-23, nodejs_compat ON. D1 binding `cha-bio-db (b12b88e7-...)` OK. main = src/index.ts.
- timestamp: 2026-04-30 03:11 KST | source: file | finding: cbc-cron-worker/src/index.ts L425-439 scheduled handler dispatches to 3 handlers via switch(controller.cron). 각각 ctx.waitUntil 로 wrap.
- timestamp: 2026-04-30 03:12 KST | source: cmd `wrangler deployments list` (cbc-cron-worker) | finding: 최신 deploy 2026-04-29 10:10 UTC, version `b3d8c516-96fb-428a-9f4f-9d8f9274acf4`. HEAD commit e295e92 (4-29 19:06 KST) "feat(quick-260429-qd8): 접근불가 개소 자동완료 cron 추가" 와 일치. 배포 누락 가능성 X.
- timestamp: 2026-04-30 03:13 KST | source: cmd `wrangler secret list` (cbc-cron-worker) | finding: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY 둘 다 secret_text 로 존재.
- timestamp: 2026-04-30 03:13 KST | source: cmd `wrangler pages secret list cbc7119` | finding: 메인 앱도 동일 이름 secret 존재. 두 worker 의 키가 실제로 일치하는지는 secret 값을 읽을 수 없어 직접 확인 불가. 다만 push_subscriptions endpoint 5 개가 모두 활성 상태이므로 메인 앱 키와 endpoint subscriptions 는 일치 (manual /api/push/test 가 작동하는 이유).
- timestamp: 2026-04-30 03:14 KST | source: cmd `curl /api/push/vapid-public-key` (메인 앱 prod) | finding: 메인 앱 노출 public key = `BH-KoDVUbzy2H7MMlf7v84hUNy6nKgwb_xuanls_CzBjVCo27MAiFVN7YHJHqe64Z4wLZjRPDWXwQ9aXdB76zSc`.
- timestamp: 2026-04-30 03:14 KST | source: D1 SELECT push_subscriptions | finding: 5 rows. staff: 2022051052 (×2 endpoint, web.push.apple.com), 2021061451 (fcm), 2018042451 (fcm), 2023071752 (fcm). 4 명 staff 전원 구독 보유. 모든 prefs `{daily_schedule:true,...}` true. created/updated 4-20~4-22, 그 이후 변동 없음 (= 410/404 응답으로 자동삭제된 적 없음).
- timestamp: 2026-04-30 03:15 KST | source: D1 SELECT schedule_items WHERE date BETWEEN '2026-04-25' AND '2026-05-02' | finding: 7 rows. 4-30 에 2 건 (소방펌프 점검 inspect / 투어 event 15:00). 따라서 daily_schedule 알림 trigger 조건 (todaySchedules.results.length > 0) 충족.
- timestamp: 2026-04-30 03:15 KST | source: D1 SELECT staff WHERE active=1 | finding: 4 명. 2018042451 admin/fixed='day', 2021061451 offset=2, 2022051052 offset=1, 2023071752 offset=0. 2026-04-30 (diff=60) 의 RawShift: 각각 주/주/비/당. 즉 user(2022051052) 는 4-30 에 비번이라 그 날만 단독으로 비수신은 정상. 그러나 4-22, 4-23, 4-26, 4-28, 4-29 등 user 가 working 인 날도 push 수신 0 → 비번 필터로 설명 불가.
- timestamp: 2026-04-30 03:15 KST | source: D1 SELECT telemetry_events WHERE event_type LIKE '%push%' OR ... | finding: **0 rows**. cron 워커는 telemetry_events 에 일절 기록하지 않음. 클라이언트 cold-retry 만 누적되고 있음.
- timestamp: 2026-04-30 03:18 KST | source: git log cbc-cron-worker/ | finding: 4-22~4-23 동안 사용자가 동일 이슈를 디버깅한 history 존재: `7d7fe98` "진단용 15분 주기 테스트 푸시", `c842113` "드라이런 daily 추적", `4e7c3ba` "annual_leaves 쿼리에서 존재하지 않는 status 컬럼 제거" → 이때는 status='rejected' 필터 throw 가 root cause 였음. 이후 `4cb8f4f` 에서 진단 트리거 제거. 그 후 `e295e92` (4-29) 까지 12 개 commit 추가됨. **이 시점부터 4-30 까지 또 안 와서 사용자가 다시 신고.** 새로운 회귀일 가능성 있음.
- timestamp: 2026-04-30 03:20 KST | source: cmd `wrangler tail cbc-cron-worker --format=json` (live) | finding: 18:20:41 UTC `*/5 * * * *` cron fired. `outcome: ok`, `exceptions: []`, `logs: []`, `wallTime: 1526ms cpuTime: 1ms`. handleEventNotifications 의 early-return (오늘 매칭 event 1 건 있으나 nowMinutes vs eventMinutes 차이가 window 밖이라 sends=[]) 와 일치. **결론: cron 인프라 자체와 worker 실행 자체는 정상.**
- timestamp: 2026-04-30 03:21 KST | source: D1 PRAGMA table_info | finding: 4-23 fix 이후 새로 추가된 query 들이 참조하는 컬럼 모두 존재 — staff(appointed_at/elevator_safety_manager/safety_mgr_appointed_at/safety_mgr_edu_dt/safety_mgr_edu_expire), education_records(staff_id/education_type/completed_at), inspection_sessions(id/date/staff_id/floor/zone/...), check_records(...), check_points(category/description/is_active), schedule_items(category/inspection_category/end_date). **추가 schema 회귀는 없음.**
- timestamp: 2026-04-30 03:32 KST | source: D1 telemetry (cron-daily-enter / -start / -dispatch / -push / -end, id 40~46) | finding: **첫 `*/2` 진단 cron 발화 결과**: kstNow=2026-04-30T03:32:35Z, today=2026-04-30, subsCount=3 (working filter 후), allSubsCount=5, workingIds=[admin 2018042451, 2021061451, 2023071752], todaySchedulesCount=2, sendsCount=3, **fulfilled=3, rejected=0**, 모든 sendPush 가 status **201 Created** to fcm.googleapis.com. **결론: cron + DB query + sendPush 모두 정상 동작. user(2022051052) 는 4-30 비번이라 working filter 에서 정상적으로 제외됨.**
- timestamp: 2026-04-30 03:34 KST | source: D1 telemetry (id 47~53) | finding: 두번째 `*/2` 발화 — 같은 결과 (3/3 sent, status 201). 재현 OK.
- timestamp: 2026-04-30 03:38 KST | source: D1 telemetry (cron-diag-* + cron-daily-push, id 61~68) | finding: **`*/2` 를 진단모드(`handleDiagnosticAllSubs`) 로 라우팅 — working filter 우회하여 모든 sub 5 개에 발송**. allSubsCount=5, 발송 결과: status **201 Created** for all 5 (2 × web.push.apple.com 윤종엽, 3 × fcm.googleapis.com). fulfilled=5, rejected=0. **결정적 증거: user 의 Apple Push 엔드포인트 2 개도 정상적으로 push 를 수락함.**
- timestamp: 2026-04-30 03:40 KST | source: file `functions/api/push/test.ts` | finding: `/api/push/test` 는 `role !== 'admin'` 시 403 차단 (L17). user(윤종엽=assistant) 는 호출 불가. 즉 사용자가 받았던 "테스트 푸시 정상" 경험은 admin 계정에서 admin 본인의 FCM 으로 발송한 결과. **user 의 Apple Push 엔드포인트는 사실상 진단 cron 이 처음으로 end-to-end 검증한 셈.** ⚠ **이 추정은 사용자 정정으로 의심됨 — 재검증 필요.**
- timestamp: 2026-04-30 03:41 KST | source: cmd `curl -s https://cbc7119.pages.dev/sw.js` | finding: 배포된 SW 의 push 핸들러 존재 확인 — `addEventListener("push", n => { ... self.registration.showNotification(title, {body, icon, badge, tag, data}) ... })`. notificationclick 핸들러도 정상. SW 코드는 OK.
- timestamp: 2026-04-30 03:50 KST | source: user-correction | finding: **"지난번에 분명히 내 계정으로 로그인해서 테스트 푸시 알림을 받았었어."** → user(2022051052/assistant) 본인 계정으로 /api/push/test 호출하여 본인 Apple Push 디바이스에서 알림 수신한 경험 있음. 함의: (1) user 클라이언트 단(SW 등록/알림 권한/PWA 설치) **정상 검증됨**. (2) /api/push/test 의 admin 가드 가설은 틀렸을 가능성 — functions/api/push/test.ts 코드 재확인 필요. (3) 가설 D (OS 단 못 봄) 후순위로 강등. (4) **새 가설 F (handleDailyNotifications 본 handler 만의 회귀)** 가 가장 유력.

- timestamp: 2026-04-30 04:00 KST | source: file `functions/api/push/test.ts` (재확인) + `git blame` + `git log --all --oneline -- functions/api/push/test.ts` | finding: **`/api/push/test` 의 admin 가드는 commit `9c7156f` (2026-04-20 18:49 KST) 최초 도입 이후 변경된 적 없음.** L17 `if (role !== 'admin') return Response.json(..., { status: 403 })` 이 4-20 부터 4-30 까지 그대로 유지. ⇒ user(assistant 2022051052) 본인 계정 JWT 로 호출하면 100% 403 반환. **/api/push/test 가 user 본인 staff_id 의 push_subscriptions 로 알림 발송한 적은 코드상 불가능.**

- timestamp: 2026-04-30 04:01 KST | source: file `src/components/SettingsPanel.tsx` L687-701 | finding: **테스트 푸시 버튼 자체가 `staff?.role === 'admin' && subscribed && permState === 'granted'` 조건에서만 렌더링됨.** assistant role 인 user 의 SettingsPanel 에는 그 버튼 자체가 안 보임. ⇒ UI 단에서도 test push 호출 경로 차단됨.

- timestamp: 2026-04-30 04:02 KST | source: D1 push_subscriptions raw (hex/length 검증) | finding: **5 개 row 모두 `notification_preferences` JSON 이 byte-identical (hex 137 chars 동일).** user(2022051052) 의 2 개 Apple Push sub 도 prefs 정상. **prefs JSON 손상 가설(F2) 기각.** prefs 확인:
  ```
  {"daily_schedule":true,"incomplete_schedule":true,"unresolved_issue":true,"education_reminder":true,"event_15min":true,"event_5min":true}
  ```

- timestamp: 2026-04-30 04:03 KST | source: D1 push_subscriptions endpoint host 검증 | finding: **admin(2018042451 석현민) 의 sub endpoint = `fcm.googleapis.com` (Android FCM)**. user 의 sub endpoint = `web.push.apple.com` (iPhone Apple Push). ⇒ 만약 user 가 admin 계정으로 로그인 후 test push 호출했다면 푸시는 **admin 의 Android 디바이스로** 가지 user 의 iPhone 으로 가지 않음. **즉 user 디바이스 ≠ admin staff_id 의 push_subscription 매핑.** "user 디바이스에서 admin 계정 로그인" 경로로도 user iPhone 에는 알림 수신 불가.

- timestamp: 2026-04-30 04:04 KST | source: 추론 (user 정정 합리화) | finding: **사용자가 받았다고 기억하는 "테스트 푸시"의 가장 합리적 출처는 4-29 18:31 UTC 부터 가동 중인 `*/2` 진단 cron 의 `handleDiagnosticAllSubs` 발화.** 이 cron 은 working filter 우회하여 **모든 sub 5 개에 발송**, 그 중 user 의 Apple Push 2 개 endpoint 모두 4-29 18:32~18:56 UTC 사이 14 회 발송, 모두 status 201. 페이로드 title `[진단] 자동발송 점검`, body `관리자 진단용 임시 푸시입니다`. 사용자가 "내 계정으로 로그인해서 테스트 푸시" 라고 기억한 것은 시점적으로 이 진단 cron 발화 (= 본인 디바이스에 알림 수신) 와 일치할 가능성이 매우 큼. 단, 사용자가 다른 시점·경로 (예: admin 본인이 user 디바이스로 와서 잠깐 로그인) 를 기억하는 것이라면 그 sub endpoint 는 admin 의 FCM 인 이상 user 디바이스에 도달했을 수 없음.

- timestamp: 2026-04-30 04:05 KST | source: Python shift simulation (`SHIFT_REF=2026-03-01`, CYCLE=['당','비','주'], offset 적용) | finding: **`45 23 * * *` cron 이 매일 KST 08:45 에 발화하여 그 날 `today` 를 KST 날짜로 계산할 때, user(offset=1)의 working day 표:**
  ```
  fire (UTC)            → today (KST)  | user shift | working
  2026-04-20T23:45:00Z  → 2026-04-21    | 비 ✗      | excluded (correct)
  2026-04-21T23:45:00Z  → 2026-04-22    | 주 ✓      | INCLUDED → should send
  2026-04-22T23:45:00Z  → 2026-04-23    | 당 ✓      | INCLUDED → should send
  2026-04-23T23:45:00Z  → 2026-04-24    | 비 ✗      | excluded (correct)
  2026-04-24T23:45:00Z  → 2026-04-25    | 휴 ✗      | excluded (correct, 토요일)
  2026-04-25T23:45:00Z  → 2026-04-26    | 당 ✓      | INCLUDED → should send (일요일이지만 schedule_items 0건, 단 컴프 cycle 등 D-04 unresolved 가능)
  2026-04-26T23:45:00Z  → 2026-04-27    | 비 ✗      | excluded (correct)
  2026-04-27T23:45:00Z  → 2026-04-28    | 주 ✓      | INCLUDED → should send
  2026-04-28T23:45:00Z  → 2026-04-29    | 당 ✓      | INCLUDED → should send
  2026-04-29T23:45:00Z  → 2026-04-30    | 비 ✗      | excluded (correct)
  ```
  ⇒ **handleDailyNotifications 의 working filter 는 user 를 부당하게 제외하지 않음.** 4-22, 4-23, 4-26, 4-28, 4-29 fire 에서 모두 user 를 working 인원에 포함시켜야 정상.

- timestamp: 2026-04-30 04:06 KST | source: D1 schedule_items 4-21~4-30 | finding: **각 fire 의 `today` 별 schedule_items 갯수:**
  ```
  today=2026-04-22: 3건 (전층 소화전 점검, 전층 비상 콘센트 설비 점검, 승강기 정기 점검)
  today=2026-04-23: 3건 (동일 3건)
  today=2026-04-26: 0건 (일요일, 스케줄 없음 → todaySchedules.results.length === 0 → daily_schedule push skip, 단 unresolved 등 다른 type 은 가능)
  today=2026-04-28: 2건 (전층 소화기 점검, 투어)
  today=2026-04-29: 2건 (전층 소화기 점검, 투어)
  ```
  ⇒ 4-22, 4-23, 4-28, 4-29 fire 는 user 가 working + schedule 존재 → daily_schedule push 가 user 에게 갔어야 함.

- timestamp: 2026-04-30 04:07 KST | source: cbc-cron-worker git log + deployments list 시간축 정렬 | finding: **deployment timeline:**
  ```
  ~4-22 23:45 UTC fire 시점 deploy version: 4-23 03:30 UTC 이전 (annual_leaves.status throw 가 살아 있던 버전)
    → fire 결과: getWorkingStaffIds → annual_leaves SELECT throws → handleDailyNotifications 전체 실패 → 0 sends
    → 사용자 미수신: 정상 (회귀 사이클 1)
  4-23 03:30 UTC: commit 4e7c3ba 배포 (annual_leaves.status fix)
  4-23 03:35 UTC: 추가 commits 077f4ca, a933388 등 ('진단' 정리 + edu D-30→D-60)
  4-23 03:40 UTC (= 4-23 12:40 KST): 마지막 4-23 deploy = version 75e06927.
    이 시점 commit HEAD 는 45b2b96 (12:39 KST) — 9 초 차이로 commit 후 즉시 deploy 한 것으로 추정.
    이 버전이 4-23 23:45 UTC ~ 4-29 10:09 UTC 까지 6 일간 가동.
  4-29 10:10 UTC: e295e92 deploy (access-blocked auto-complete cron 추가, daily handler 미변경)
  4-29 18:31 UTC: a0f6c1d deploy (telemetry instrumentation + */2 진단 cron 추가)
  ```
  ⇒ **4-23 23:45 UTC ~ 4-28 23:45 UTC 동안 6 회 daily fire** 가 deployed version `75e06927` 으로 발화했어야 함. telemetry 가 그 시점 코드에 없어서 결과 직접 관측 불가.

- timestamp: 2026-04-30 04:08 KST | source: D1 telemetry 전수 조회 (`SELECT MIN(ts), MAX(ts) FROM telemetry_events WHERE event_type LIKE 'cron-%'`) | finding: **MIN ts = 2026-04-29T18:32:35Z, MAX ts = 2026-04-29T18:56:37Z**. cron 관련 telemetry 는 4-29 18:32 UTC 이후에만 존재. **`45 23 * * *` 의 다음 production fire (= 4-29 23:45 UTC = 4-30 08:45 KST) 가 telemetry instrumentation 이 들어간 첫 production daily fire.** 그 시점에 user 는 비번 (4-30 비) → user 에게는 정상적으로 발송 안 됨. **첫 user-working day 에서의 production fire 는 4-30 23:45 UTC = 5-01 08:45 KST (today=2026-05-01, user 는 주).**

- timestamp: 2026-04-30 04:09 KST | source: 분석 종합 | finding: **handleDailyNotifications 와 handleDiagnosticAllSubs 의 모든 logic diff enumerate:**
  ```
  Daily handler:
    1) getWorkingStaffIds (working filter) — annual_leaves status fix 후 정상 동작 확인됨
    2) admin staff_id 조회 (eduTargets recipient 수집용) — daily_schedule type 발송에는 무관
    3) 7 개 batch query (schedule, incomplete, unresolved, edu × 4) — 모든 컬럼 prod 존재 확인
    4) for-loop subs.results: prefs 체크 후 sends.push
    5) eduTargets dispatch (별개 수신자 풀)
    6) Promise.allSettled
  Diagnostic handler:
    1) ❌ working filter 없음 (모든 sub 발송)
    2) ❌ schedule_items / prefs / edu 등 일체 안 봄
    3) sends.push 후 Promise.allSettled
  ```
  ⇒ **차이 = working filter 1 단계만**, 그 working filter 는 user 의 working day 에 user 를 정확히 포함시킴. **다시 말해: 코드 (4-23 03:40 UTC 이후 deploy 부터 현재까지) 는 user 에게 daily push 를 보내야 한다.**

- timestamp: 2026-04-30 04:10 KST | source: 결론 종합 | finding: **딱 떨어지는 단일 root cause 분기는 코드에 존재하지 않음** (가설 F 부분 기각). 4-21·4-22 fire 미수신은 **이미 진단·수정된 회귀** (annual_leaves.status throw); 4-23~4-28 fire 미수신은 **관측 불가 (telemetry 부재)** — 다음 두 가지 가능성으로 나뉨:
  - (G1) 4-23 03:40 UTC 이후 deploy 된 코드는 사실 정상 동작했고, **user 가 동일 기간에 PWA 업데이트/SW 재등록/구독 갱신/디바이스 재시동/iOS 알림설정 변경 등으로 잠시 알림을 못 본 시점이 있었음**. 즉 미수신은 일부 일자에 한정되며 사용자가 지난 며칠간 일관되게 못 받은 것이 아니라 부분적으로 놓쳤을 가능성. → 이 경우 4-30 23:45 UTC (telemetry 첫 production daily fire) 에서 admin/김병조/박보융 3명 sends 가 깔끔하게 나오면 코드 자체는 클린한 것이고, 다음 user-working fire (5-01 08:45 KST) 에서 user 도 sends=4명 중 1명에 들어가는지 검증하면 확정 가능.
  - (G2) 4-23 03:40 UTC 이후 코드에도 **관측 불가 회귀**가 잠복 중 (예: D1 binding race / `Promise.all` 내 1 개 query 의 silent reject 가 swallow 되어 sends 가 비는 등). 이는 telemetry 가 가동된 4-29 이후 production fire 결과로 검증 가능.

  **결정적 관측 시점:**
  - **2026-04-29T23:45:00Z (= 2026-04-30 08:45 KST) — 약 4시간 후**. telemetry 가 들어간 첫 production daily fire. 이 fire 의 cron-daily-* 결과로 G1/G2 분기 확정 가능. 예상 결과: workingIds=[admin, 김병조, 박보융] (user 제외, 비번이라 정상), todaySchedulesCount=2, sendsCount=3, fulfilled=3, rejected=0. 만약 결과가 이와 다르면 G2 확정 + 새 회귀 본격 조사.
  - **2026-04-30T23:45:00Z (= 2026-05-01 08:45 KST) — 약 28시간 후**. user 가 working day 에 들어간 첫 production daily fire. 이 fire 에서 user 의 cron-daily-push status 201 이 관측되면 G1 확정 → 코드 클린 + user 의 4-23~4-28 미수신은 부분적/디바이스 단 변동.

  **즉시 조치할 코드 수정은 없음.** 본 사이클은 진단 사이클로 종결하고, 4-29 23:45 UTC 와 4-30 23:45 UTC 의 telemetry 결과를 다음 사이클에서 관측하여 G1/G2 확정 후 후속 조치.

## Eliminated

- A) cron 자체 미발화 — */5 cron 의 정상 outcome/scriptVersion 으로 반증.
- B) schedule_items 비어있음 — 4-30 에 2 건 활성 row 확인.
- C) push send 단계 실패 — telemetry 로 직접 반증 (5/5 status 201, 0 rejected).
- 4-23 fix 의 `annual_leaves.status` 컬럼 회귀 — 현재 src/index.ts L94-96 에 status 조건 없음. 재발 아님.
- 새 schema 회귀 (4-23 이후 추가된 query 들) — 모든 컬럼 D1 에 존재 확인.
- F2) prefs JSON 손상으로 user 에 대한 push skip — 5 sub 모두 byte-identical prefs 137 char hex 동일.
- F3) /api/push/test admin 가드 가설 (사용자 정정으로 의심됐던 것) — 코드는 4-20 이후 변경 없음 + UI 버튼도 admin only. user 본인 staff_id 로 test push 받기는 불가능. 사용자 기억은 4-29 18:32~ 부터 가동된 진단 `*/2` cron (handleDiagnosticAllSubs) 이 user Apple Push 2 endpoint 로 14 회 status 201 발송한 것과 시점적으로 일치 — 그것을 "테스트 푸시" 로 기억하고 있을 가능성이 가장 높음.
- F (handleDailyNotifications 만의 회귀) **부분 기각**: handleDailyNotifications 와 handleDiagnosticAllSubs 의 logic diff 는 working filter 1 단계뿐이며, 그 working filter 는 user 의 working day (4-22, 4-23, 4-28, 4-29) 에 user 를 정확히 포함시킴 (Python 시뮬레이션). 코드상 user 가 daily 알림 대상에서 부당 제외되는 분기 없음. 단, 관측 불가 시점에 잠복 회귀가 있었는지는 다음 production fire telemetry 로 검증 필요.

## Resolution

- root_cause: **G1 확정 — 사용자 디바이스에서 PWA 가 사라진 상태였음 (iOS 알림 앱 리스트에서 PWA 가 보이지 않음 = 미설치 상태).** 즉 push_subscriptions.endpoint 는 D1 에 살아있지만 디바이스 측 PWA 가 없어 APNs 가 status 201 로 받아도 디바이스에 도달할 표적이 없음. 서버/cron/VAPID/D1 query/매칭/Apple Push 응답 모두 처음부터 정상이었음.

  **확정 시점:** 사용자가 PWA 재설치 + 알림 권한 허용 → iOS 알림 설정에 "즉시" 표시됨 → `push_subscriptions` 에 새 row 등록 (`2026-04-29T22:43:13Z`, endpoint host `web.push.apple.com`). 진단 `*/2` cron 재배포(commit eabfd4d) 후 사용자가 새 endpoint 로 정상 알림 수신 확인.

  **이전 가설 정리:**
  - `annual_leaves.status` 회귀는 4-23 03:30 UTC 에 이미 fix 됨 (4-21·4-22 fire 미수신에 한정).
  - 4-23 ~ 4-28 fire 미수신은 코드 회귀가 아니라 사용자 디바이스의 PWA 부재 (혹은 일부 일자에는 PWA 있었으나 알림권한/SW 등록 변동) 로 인한 디바이스 단 silent loss.

- fix: 코드 변경 없음. 사용자 디바이스에서 PWA 재설치 + 알림 권한 허용 (수동). 추가로 다음 후속 작업:
  1. ✅ 진단 telemetry instrumentation (`cron-daily-start/push/end/error`, `cron-event-*`) 영구 유지 — 다음 incident 시 즉시 관측 가능. (commit a0f6c1d)
  2. ✅ 진단용 `*/2` cron + `handleDiagnosticAllSubs` 제거 (commit b8e41cc)
  3. (참고) 다른 staff 도 동일 케이스 (PWA 미설치/알림권한 거부) 가능. 미수신 신고 시 동일 체크리스트 적용.

- verification:
  - 4-29 22:43 UTC 새 endpoint 등록 확인 (D1 SELECT)
  - 진단 cron 발화 후 사용자 디바이스 정상 수신 (사용자 직접 확인: "왔ㅇ어")
  - cron 정상 trigger 3 개 (`45 23 * * *`, `*/5 * * * *`, `0 6 * * *`) 만 활성화 — 진단 `*/2` 제거 완료
  - production daily cron 의 다음 발화 (4-29 23:45 UTC = 4-30 08:45 KST) 결과는 telemetry 에 남아 추후 관측 가능

- files_changed:
  - cbc-cron-worker/src/index.ts (commits a0f6c1d, eabfd4d, b8e41cc) — telemetry + 진단 핸들러 추가/제거
  - cbc-cron-worker/wrangler.toml (commits a0f6c1d, eabfd4d, b8e41cc) — 진단 cron 추가/제거
  - 메인 앱 코드는 미변경

- specialist_hint: none — root cause 가 디바이스 단 (사용자 PWA 미설치) 이라 코드 specialist 불필요

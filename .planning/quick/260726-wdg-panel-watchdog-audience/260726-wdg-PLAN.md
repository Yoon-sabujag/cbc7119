---
quick_id: 260726-wdg
slug: panel-watchdog-audience
description: 화재수신반 워치독 수신자 확보(윤종엽) + 오탐 폭주 가드 — 평생 도달 0건이던 워치독 푸시를 실제 수신 가능하게
date: 2026-07-26
branch: production
status: planned
---

# Quick Task 260726-wdg: 워치독 수신자 확보 + 폭주 가드

## 배경

**SSOT = `panel-agent/FABLE-TASK-WATCHDOG.md` v2** (4렌즈 적대적 검토 반영판 — §8 원본과 다르면 v2 가 이긴다). 화재수신반 감시 에이전트가 죽으면 cron 워커가 5분마다 감지해 웹푸시를 보내지만, 청중 쿼리가 `role='admin'` 이고 유일 admin(석현민)의 구독이 2026-05-11 FCM 410 으로 삭제된 뒤라 **평생 단 한 명에게도 도달한 적이 없다** (`"admins":1` = 계정 수, 도달 아님). 2026-07-14 캡처보드 88분 사망 때도 알림 0건. 수신자를 윤종엽(2022051052, Apple Web Push 3건 생존)으로 바꾸되, 오탐 억제 가드를 **같은 배포에** 넣는다 (가드 없이 청중만 넣으면 최악 알림 864건/일 + iOS 차단 → 410 → 완전 침묵 복귀).

지시서 대비 드리프트 1건: 마이그레이션 번호 **0100 → 0104** (0100~0103 이 그 사이 선점됨).

## Task A — 마이그레이션 `0104_panel_watchdog_audience.sql`

**files:** `cha-bio-safety/migrations/0104_panel_watchdog_audience.sql` (신규)

- `staff.panel_watchdog INTEGER NOT NULL DEFAULT 0` + 윤종엽·석현민 = 1 (데이터 주도 — 사람이 바뀌어도 재배포 불필요)
- `panel_agent_status` 에 가드 상태 3컬럼: `watchdog_pending_since`(CONFIRM 시계) / `watchdog_clear_since`(CLEAR 시계) / `watchdog_push_fail_n`(연속 도달 0건 시도 수)
- 적용은 `wrangler d1 execute cha-bio-db --remote --file` 직접 (0103 전례 — 추적테이블 unsync 라 `migrations apply` 금지). ADD COLUMN 은 IF NOT EXISTS 미지원 → 정확히 1회.

## Task B — `cbc-cron-worker` 워치독 v2 상태기계

**files:** `cbc-cron-worker/src/index.ts`, `cbc-cron-worker/wrangler.toml`

- 청중 쿼리(`handlePanelWatchdog` 내부 1곳 **만**): `active=1 AND (panel_watchdog=1 OR role='admin')`. `:185`(일일 알림·교육 D-60 admin 청중)는 불가침.
- 상수: CONFIRM 10분(사유 최초 관측 후 첫 푸시까지 — 새벽 transient 2틱 오탐을 거르는 실측 최소값) / CLEAR 30분(연속 클린이어야 회복 확정) / FAIL_MAX 5(도달 0건 시도 상한, push-failed·cooldown 공용) / COOLDOWN 6h(기존 유지).
- `watchdog_reasons` 의미 재정의 = "이번 사고에서 이미 통지한 code 누적 합집합" → 에스컬레이션은 미통지 code 출현 시에만 = 사고당 ≤2회 자연 유계 (v1 floor 설계는 결함 4건으로 폐기).
- pending_since 는 클린 틱에 지우지 않는다(플래핑 기아도 진짜 고장) — 회복 확정(30분 클린)에서만 6컬럼 전부 NULL. 클린 게이트는 3컬럼 전부 NULL 검사(1틱 blip 의 pending 영구 잔존 방지).
- 발송 없는 틱은 DB 무기록(시계 제외). 킬스위치 `WATCHDOG_PUSH_ENABLED="0"`(wrangler.toml [vars], 대시보드 변경 금지)은 발송 블록만 건너뛰고 상태기계·텔레메트리 계속.
- B-3 폴백: 청중 구독 0건 또는 failN≥3 → '구독 보유 active 직원 전원' 확장 + `cron-panel-watchdog-deaf` 텔레메트리.
- B-4: `sendPush` 에 `options?: PushMessage['options']` 추가, 워치독 경로만 `{ttl:3600, urgency:'high'}` (라이브러리 기본 TTL 60초 = 심야 오프라인 폰에서 Apple 이 60초 뒤 폐기, APNs 201 이라 push-failed 로도 못 잡는 재발 경로). payload 에 `url:'/panel-monitor'`.
- B-5 텔레메트리: `subs`(청중 크기 vs 도달 분리 — admins:1 오독 재발 방지) + pushFailN/fallback/disabled 추가, durMin 기준 = pending_since.

## Task C — 알림을 받아도 볼 화면이 없다 (Pages 게이트 5곳 + 타입)

**files:** `cha-bio-safety/functions/api/auth/login.ts`, `functions/_middleware.ts`, `functions/api/panel/agent-history.ts`, `src/App.tsx`, `src/components/SettingsPanel.tsx`, `src/types/index.ts`

윤종엽은 assistant 라 전 게이트가 막는다. 같은 규칙(`panel_watchdog=1 OR role='admin'`)으로: JWT payload/응답 staff(login) → JWTPayload/ctx.data(_middleware — v1 치명 누락이던 곳) → 403 게이트(agent-history) → AdminAuth(App.tsx, 사용처 /panel-monitor 1곳 검증됨) → 시스템 메뉴(SettingsPanel) → `Staff.panel_watchdog?:number`(types). prefs 게이트는 사문이라 넣지 않는다(지시서 §5).

## 검증

- `tsc --noEmit` 양쪽 통과 + 적대적 리뷰 워크플로(상태기계 시뮬레이션/지시서 대조/인증 흐름/마이그레이션 부작용 4렌즈 + 건별 반박 투표).
- 배포 순서 엄수(§0-1): ① 마이그레이션 → ② cron worker deploy(직후 `cron-panel-watchdog-throw` 부재 확인) → ③ Pages deploy → ④ 윤종엽 재로그인 → ⑤ 실물 검증(HDMI 뽑기 최대 20분 대기 → 폰 알림 육안 + `/panel-monitor` 딥링크 + D1 `watchdog_push_ok>=1` → 재삽입 30분 후 전 컬럼 NULL → 플래핑 3회 = 정확히 1건).
- 석현민 재구독은 별도 체크리스트(기기에서 알림 재허용해야 admin 플래그가 허수를 벗는다).

## must_haves

- 청중 쿼리 교체는 워치독 1곳만, `:185`·`heartbeat.ts` 불가침
- 가드 4개(CONFIRM/CLEAR/FAIL_MAX/킬스위치)와 청중 변경이 **같은 배포**
- 시각 비교는 전부 JS kstMs (KST TEXT vs SQL UTC 9시간 함정)
- 사유 비교는 code 로만 (text 비교 = 무한 푸시 부활)

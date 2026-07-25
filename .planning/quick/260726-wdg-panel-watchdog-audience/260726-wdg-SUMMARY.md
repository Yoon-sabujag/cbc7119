---
quick_id: 260726-wdg
slug: panel-watchdog-audience
date: 2026-07-26
status: implemented-pending-deploy
commits: [e9763ace, 8c7a8f28]
---

# Quick Task 260726-wdg 요약: 워치독 수신자 확보 + 폭주 가드 — 구현 완료, 배포 대기

## 한 일

FABLE-TASK-WATCHDOG.md v2 전체 구현 (지시서 대비 드리프트: 마이그레이션 번호 0100→**0104** 개번뿐).

- **e9763ace** — cron worker: 청중 `panel_watchdog=1 OR admin` + v2 상태기계(CONFIRM 10m / CLEAR 30m / FAIL_MAX 5 / 킬스위치 / 폴백 청중 / TTL 3600 + urgency high / url 딥링크 / subs·sent 분리 텔레메트리 / durMin=pending_since 기준) + wrangler.toml `[vars] WATCHDOG_PUSH_ENABLED="1"` + 마이그레이션 0104 파일.
- **8c7a8f28** — Pages 게이트 6곳: login(JWT payload+응답 staff) → _middleware(JWTPayload+ctx.data — v1 치명 누락 지점) → agent-history 403 → AdminAuth(사용처 /panel-monitor 1곳 검증) → SettingsPanel 시스템 메뉴 → `Staff.panel_watchdog?:number`. prefs 게이트는 사문이라 미도입. 화면 문구 'admin 전용'→'운영자 전용'.

## 검증

- `tsc --noEmit` 양쪽 + `npm run build` PASS.
- 적대적 리뷰 워크플로(6 에이전트, 4렌즈: 상태기계 틱 시뮬레이션 9시나리오 / 지시서 §별 대조 / 인증·프론트 흐름 전수 / 마이그레이션·D1 부작용) + 발견 건별 반박 2표 → **확정 결함 0건**.
  - 문서화만 한 발견(medium, 기존 결함 클래스): restore.ts 는 백업 시점 스키마로 통째로 되돌린다 → **0104 이전 백업 복원 후에는 0104 재적용 필수** (0104 파일 상단 주석으로 명문화). 안 하면 워치독 SELECT 가 매 틱 no such column → 외곽 catch 가 삼켜 조용히 전사.
- prod D1 읽기 재실측(§1 사실 12일 경과분): 윤종엽 구독 3건 생존 / 석현민 0건 지속 / **박보융 1→0 사망(신규)** — 폴백 청중은 윤종엽 3+김병조 1=4건으로 성립.
- heartbeat.ts 는 명시 컬럼 UPDATE 만 — 신규 3컬럼과 경합 없음(불가침 유지, git diff 에 미포함).

## 남은 일 — 배포 (자동 실행이 권한 분류기에 거부됨 → 사용자 실행/승인 필요)

**순서 엄수(§0-1 — 역순이면 기존 워치독까지 조용히 죽는다):**

```sh
# ① 마이그레이션 (정확히 1회 — 재실행 시 duplicate column)
cd ~/Documents/20260328/cha-bio-safety
npx wrangler d1 execute cha-bio-db --remote --file=migrations/0104_panel_watchdog_audience.sql

# ② cron worker
cd ../cbc-cron-worker && npx wrangler deploy
# 직후 5분 틱 이후 확인: telemetry_events 에 cron-panel-watchdog-throw 가 없어야 함

# ③ Pages
cd ../cha-bio-safety && npm run deploy
```

④ 윤종엽 기기 로그아웃→재로그인(안 하면 게이트가 안 열리는 게 **정상**) → ⑤ §7 실물 검증: HDMI 뽑고 **최대 20분** 대기 → 폰 알림 육안 + 탭하여 /panel-monitor 열림 + D1 `watchdog_push_ok>=1` → 재삽입 30분 후 워치독 컬럼 전체 NULL → 플래핑 3회 = 정확히 1건. ⑥ 석현민 기기 알림 재허용(재구독).

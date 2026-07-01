---
status: complete
slug: 260701-pnl-panel-backend-prod
date: 2026-07-01
parent_commit: aecaf292
deploy_url: https://8a34b115.cbc7119.pages.dev
---

# 화재수신반 패널 백엔드 prod 이식 (백엔드만)

Phase 25 화재수신반 원격감시 **백엔드 본체**를 staging(cbc7119-data `a26efc8`)에서
prod(cbc7119, `production` 브랜치)로 full port. prod 엔 패널 백엔드가 전무했음(=본체 이식).
**백엔드만** — Phase 25 프론트(main ~37커밋)·맥 에이전트는 별도 단계.

## 실행 (GSD quick 메인 직접 — worktree 미사용, production 브랜치 직접, 서브에이전트 미사용)

- **P1 코드** (`aecaf292`, 20 files +877/-5):
  - 신규 16 functions: `_lib/{agent,alarm,maint,push}.ts` + `api/panel/{frame,status,maint}` +
    `api/alarm/{trigger,clear,heartbeat,renotify,active,events}` + `alarm/[id]/{ack,resolve}` +
    `public/panel/[[path]]` (verbatim cp — staging 참조는 주석뿐, 코드 누출 0).
  - 병합 2건(verbatim, diff로 prod 고유 내용 0 손실 확인): `_middleware.ts`(AGENT_KEY env +
    에이전트 5경로 PUBLIC + CORS X-Agent-Key/X-Frame-Key/X-Frame-Ts), `utils/kst.ts`(nowKstSql 옵셔널 Date).
  - `migrations/0092_panel_alarms.sql`(IF NOT EXISTS), `wrangler.toml` nodejs_compat.
  - push.ts = 시각인지 audience `getPanelAudienceIds`(야간=당직자만, 반일 휴가 시간창) 포함본.
  - tsc 0(tsconfig `functions/` 포함) + build ✓.
- **P2 시크릿**: AGENT_KEY set(staging 동일 값 재사용). VAPID 2종 prod 기존 존재 확인.
- **P3 D1**: `0092` → cha-bio-db --remote (--file import 정상, 7 queries, 3테이블). offset(0053) prod 데이터 이미 정확 → 교정 no-op.
- **P4 배포+검증**: `pages deploy dist --branch=production`. 스모크 PASS —
  `/api/alarm/active`·`/api/panel/status` no-auth→401 JSON(SPA 아님), `public/panel/latest`→204,
  heartbeat wrong→401 / correct→200(AGENT_KEY 값 확인), 잔여 alarm 0·agent last_seen null.
- **P5**: production-sync.md 항목 추가 + 헤더 갱신(기준 `aecaf292`).

## prod 대칭 (불변 확인)

- 기존 `getWorkingStaffIds`(cbc-cron-worker 주간 리마인더) **불변** — 패널은 getPanelAudienceIds 만.
- cbc-cron-worker repo 전체 미변경. watchdog 프로액티브 push 는 별도 추가분(미구현).

## 미검증 / 다음 단계

- **실폰 push 미검증**: 구독자 없음(프론트 미승격) → 프론트 승격 후 e2e.
- **nodejs_compat push 런타임**: 실제 구독 발송 시 발현(현재 빈 audience로 skip). 플래그는 set + 번들 컴파일 성공.
- **다음**: (1) Phase 25 프론트 승격 (main→production, 코드 디프 정독 게이트), (2) 맥 에이전트 배포, (3) 프론트 sw.ts 딥링크(승격 시 포함), (4) cbc-cron-worker watchdog push.

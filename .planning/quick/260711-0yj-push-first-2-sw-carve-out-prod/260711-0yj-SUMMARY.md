---
quick_id: 260711-0yj
slug: push-first-2-sw-carve-out-prod
status: complete
date: 2026-07-11
commit: 1e5fa89a
deploy: https://ba822cc6.cbc7119.pages.dev
---

# Summary — 화재수신반 push-first + 2초 라이브폴 + SW carve-out (prod 이식)

staging cbc7119-data `fe58cd6` 검증본을 prod(cbc7119, cha-bio-db, cha-bio-storage, branch=production)에 이식·배포 완료.

## 무엇을
OCR을 푸시 경로에서 분리(push-first). 트리거 시 `location=null`로 즉시 푸시하고, 에이전트가 OCR 완료 후 신규 엔드포인트로 위치를 patch하는 구조. 라이브뷰 폴을 경보 시 2초로 통일하고, SW가 실시간 패널 경로를 캐시 우회.

## 변경 (11 파일, feat 1e5fa89a, +58/−29)
**백엔드**
- `functions/api/alarm/[id]/location.ts` **신규** — `POST /api/alarm/:id/location`, `assertAgentKey` 가드, body `{location}` trim(빈문자/누락=null), 없는 id→404, `UPDATE panel_alarms SET location`, `mapAlarm` 반환. import 깊이 `../../../` (ack/resolve 동일).
- `functions/_middleware.ts` — `PUBLIC_PATTERN = [/^\/api\/alarm\/[^/]+\/location$/]` 추가 + skip-auth 게이트에 `|| PUBLIC_PATTERN.some(...)`. (동적 id JWT 예외 — 없으면 patch가 401)
- `functions/_lib/alarm.ts` — `LOCATION_LABEL` 상수 삭제, mapAlarm·mapAlarmSummary `location: r.location` (null 통과).
- `functions/_lib/push.ts` — buildPanelPayload 위치 없을 때 `' · 수신반 확인 필요'`.
- `functions/api/alarm/trigger.ts` — LOCATION_LABEL import 제거, `body.location ?? null`.
- `functions/api/alarm/renotify.ts` — LOCATION_LABEL import 제거, `row.location` (patch 완료본이 실제 위치 표기).

**프론트**
- `FireAlarmPage.tsx` — 풀스크린 위치 리터럴 `수신반 확인 필요` 고정, alarm-active 폴 15s→2s.
- `PanelEventRow.tsx` — 폴백 `수신반 확인 필요`.
- `InspectionPage.tsx` — panel-status·alarm-active 폴 15s→2s (양 블록 4곳), alarm-events 폴 `activeAlarm ? 2_000 : 30_000` (경보중만 2초, 2곳), 위치 폴백 3곳 `수신반 확인 필요`.
- `DashboardPage.tsx` — panel-status·alarm-active 폴 30s→2s (타 쿼리·staleTime 불변), 라이브카드 폴백 2곳 `수신반 확인 필요` (`장소 미기록` 수동 이력은 유지).
- `sw.ts` — `NetworkOnly` import + `/api/public/panel/*`·`/api/panel/status` carve-out(일반 /api/ NetworkFirst 앞).

## 검증
- `panel_alarms.location` 컬럼 prod cha-bio-db 기존 확인(pragma count=1) — 신규 마이그레이션 없음.
- `tsc && vite build` 성공(sw.ts 포함, dist/sw.js 생성).
- grep 카운트 전수 일치(15s 0잔존/2s 4, events 조건 2, 폴백 3+2, LOCATION_LABEL 0잔존).
- 독립 적대 diff 리뷰(read-only 에이전트): VERDICT CLEAN, 11항목 PASS, InspectionPage TDZ 안전(activeAlarm 선언이 events 쿼리 위), DashboardPage collateral 0.
- 배포 후 curl 스모크(production alias cbc7119.pages.dev):
  - `POST /api/alarm/PA-TEST/location`(무인증) → `{"success":false,"error":"agent unauthorized"}` **401** (PUBLIC_PATTERN 통과·핸들러 가드 동작).
  - `GET /api/alarm/active`(무JWT) → `{"success":false,"error":"인증이 필요합니다"}` **401** (비예외 경로 JWT 유지).

## 배포
`wrangler pages deploy dist --project-name=cbc7119 --branch=production` → https://ba822cc6.cbc7119.pages.dev (production alias = cbc7119.pages.dev). Functions bundle 업로드 확인.

## 범위 밖 (별도)
- 에이전트 `~/panel-agent/agent.py` §1-A (색 확정 즉시 trigger location=null + OCR 비동기 스레드 → 완료 시 `POST /api/alarm/:id/location`) — prod 에이전트 직접 작업, 이 repo 아님. 백엔드/프론트 배포 완료됐으므로 진행 가능.
- `events.ts` 720h 캡 해제 / b5v 재적용 — staging-first(이 콘솔 아님).

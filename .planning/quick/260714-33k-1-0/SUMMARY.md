---
quick_id: 260714-33k
status: complete
date: 2026-07-14
branch: production
commits: [317cfc1c, 69a6537b]
deploy: https://4700a572.cbc7119.pages.dev
---

# SUMMARY — 화재수신반 에이전트 원격 모니터링 (1단계 백엔드 + 0단계 화면)

출처: panel-agent 콘솔 핸드오프 `HANDOFF-0328-MONITORING.md` · 계약 SSOT `MONITORING-SPEC.md`
사용자 승인: **staging-first 예외 → prod 직접**(에이전트는 prod 로만 송신 → staging 실데이터 0,
진짜 관문 §6.1 은 어차피 prod). 260702-p22 전례.

## 1단계 백엔드 (`317cfc1c`, 9 files +453/−24)

| 파일 | 내용 |
|---|---|
| `migrations/0096` | `agent_heartbeats` 시계열(31 데이터 컬럼) + `panel_alarms` 증거 7 + `panel_agent_status` 8 |
| `location.ts` | **★C1** — `location` 키 부재 시 UPDATE SET 절에서 컬럼 제외(기존 위치 보존) |
| `frame.ts` | **★C2** — `frame_updated_at` 갱신을 `frameKey==='latest'` 로 게이팅 + `X-Frame-CapturedAt` 파싱 |
| `heartbeat.ts` | 전면 교체. optional 파싱 + 옵셔널 체이닝(S4) + 열거값 검증 금지(S7) + **★B1 독립 try/catch** |
| `trigger.ts` | `yellowRatio` optional (두 INSERT). dedupe/push/무장 무변경 |
| `_lib/alarm.ts` | `mapAlarm` 에 pushCount/rgy/ocr 증거 추가 (필드 추가만) |
| `status.ts` | agentVersion/uptimeSec/detectMode/frameLag/starved/matcherLoaded 노출 |
| `agent-history.ts` | 신규 GET(admin). 누적 델타(음수=재시작→0) + gaps/uptimePct/restarts |
| `_middleware.ts` | CORS Allow-Headers 에 `X-Frame-CapturedAt` |

**D1**: 0096 을 **코드 배포 전** prod 적용(역순이면 컬럼 부재로 시계열 0행).
실측 — `agent_heartbeats` 32(id+31) / `panel_agent_status` 13(5+8, `matcher_loaded` 포함) /
`panel_alarms` 25(18+7) / `idx_agent_hb_at` 생성.
바인딩 검산: INSERT 컬럼 31 = `?` 31 = bind 31.

## 0단계 화면 (`69a6537b`, 3 files +726/−2)

`PanelMonitorPage.tsx`(659줄) — 승인 시안대로 7 위젯. `AdminAuth` 게이트 신설(비관리자 → `/dashboard`).
메뉴 비연결(URL 직접 진입만). `watchdogLabel()` **첫 호출** — 사각지대 #7 dead code 해소.

## prod 실증 (§6/§6.1) — 전 항목 통과

| 검증 | 결과 |
|---|---|
| 구 에이전트 heartbeat(3필드) | 200 + 저장 |
| 신규 풀 payload(21키) | 200 · `frame_lag_max_ms=81200` `snapshot_ok=2` `matcher_loaded=1` 저장 |
| `rgy:null` / 하위 null | **200** (S4 — TypeError 없음) |
| `detectMode:"typo-mode"` | **200 + 그대로 저장** (S7) |
| **★C1** location 키 없는 patch + 빈 `{}` | **location 보존**, 증거만 갱신 ← BACKEND_V2 플립 전제조건 |
| 명시적 `{"location":null}` | 지워짐 (수동 정정 경로 유지) |
| **★C2** `alarms/<id>` 업로드 | 신선도 **불변** (센티넬 미기록) / `latest` 는 둘 다 갱신 |
| 구 에이전트 trigger(yellowRatio 없이) | 200, `yellow_ratio=null` — **active INSERT 경로 검증** |
| 시계열 실적재 | 29행+, 실제 에이전트(v1.3) 60초마다 적재 중 (**B1 사고 없음**) |

**검증 방식 주의**: heartbeat 는 어떤 경우에도 200 이므로 **200 을 저장의 증거로 쓰지 않고**
매 항목을 D1 SELECT 로 확인함. C2 는 라이브 에이전트가 2.75초마다 `frame_updated_at` 을
갱신해 경합이 있으므로, **구 에이전트가 못 쓰는 `frame_captured_at` 을 센티넬 지표로** 사용.

**뒤처리**: 테스트 경보 2행 삭제 + R2 스냅샷 삭제. `fire_alarm_records` 오염 0
(`fire` 대신 `equip`/`fault` 사용 — fire 는 자동초안 INSERT + 무장을 유발).

## 4단계 cron 워치독 (`938ab596`, 배포 완료)

`cbc-cron-worker` 기존 5분 틱에 `handlePanelWatchdog` 얹음(새 cron 표현식 추가 없음)
+ `handleHeartbeatCleanup`(14일 보존, 백업 틱). 하트비트 3분 초과 / `frame_starved_sec ≥ 30`
/ 감지 3분 정지 → 관리자 push. `watchdog_notified_at` 중복 억제.
**오탐 방지**: `frame_starved_sec=null` → 푸시 안 함(M1) · `detect_mode='off'` → 감지정지 푸시 안 함(S9).

## 설정 진입점 (`6f2d5e77`) — 사용자 요청

핸드오프 §2.1 은 "메뉴 비연결"이었으나 사용자가 진입점 추가로 결정.
설정 → **시스템**(admin 전용 섹션) → 화재수신반 에이전트 모니터.
UI 노출 범위만 바뀜 — 데이터 계약(SPEC) 무영향. 게이트 3중 유지(메뉴/AdminAuth/서버 403).

## ✅ 2단계 완료 + UAT (2026-07-14)

에이전트 콘솔 통보 → 맥미니에서 `feat/monitoring-telemetry` 체크아웃 + `update.command` 재시작 완료.
**계측 실측**(D1): `detect_mode=live` · `matcher_loaded=1` · `frame_lag_max_ms=481` ·
`frame_starved_sec=0` · `analyze_ok=470` · `upload_ok=91` · `rgy` 값 유입 ·
`frame_captured_at` 갱신(= `X-Frame-CapturedAt` 헤더 실제 파싱됨).
→ 사각지대 4종(캡처보드 수신·프레임 지연·analyze 실패·업로드 실패) 동시 해소.
→ cron 워치독의 캡처보드 감시가 **실제로 무장**됨(`frame_starved_sec` 이 더는 null 이 아니다).

**UAT ✅ (사용자 확인)**: 파이프라인 신호등 — OCR 제외 전부 초록 / 프레임 지연 차트 정상 /
라이브 프레임 정상 / R2 예산 정상. **OCR 회색이 정상** — 증거가 붙은 경보가 아직 없으므로
"판정 불가"여야 한다(초록이면 무증거를 정상으로 칠하는 버그).

## ⚠️ 미결 — 다음 재시작 때 같이 처리

1. **`AGENT_VERSION` 이 옛 값으로 보고됨** — 맥미니 `config.env` 에 `AGENT_VERSION=1.3.0-pushfirst`
   가 명시돼 있어 `agent.py` 의 기본값(`1.4.1-telemetry`)을 덮어쓴다. 코드는 v1.4.1 이 맞지만
   (구 에이전트는 계측 필드를 보낼 수 없다) **버전 문자열이 거짓**이라 장애 진단 시 오독을 유발한다.
   → `config.env` 에서 `AGENT_VERSION=1.4.1-telemetry` 로 수정.
2. **2.5단계 `BACKEND_V2=1`** — §6.1 실증 통과로 전제조건 충족. 켜면 위치 미확정 경보의 OCR 증거가
   들어온다(사각지대 #2 완전 해소). SPEC 은 2단계 수 일 안정 후 권고.
3. **3단계 `SNAPSHOT_ON_ALARM=1`** — C2 게이팅 검증 완료로 전제조건 충족(선택).

1+2 는 **한 번의 재시작으로 함께** 처리하는 것을 권고(재시작 = 감시 공백).

## 별건 (핸드오프 §11)

**화재 재발송(renotify)이 격발되지 않는다** — `trigger.ts` 가 무장만 하고 `/api/alarm/renotify`
호출부가 에이전트·프론트 어디에도 없다. 모니터 화면의 `pushCount` 로 보이게만 해둠. 수정은 별건.

## 별건 (핸드오프 §11)

**화재 재발송(renotify)이 격발되지 않는다** — `trigger.ts` 가 무장만 하고 `/api/alarm/renotify`
호출부가 에이전트·프론트 어디에도 없다. 모니터 화면의 `pushCount` 로 보이게만 해둠. 수정은 별건.

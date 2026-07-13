---
id: 260714-9ks
slug: agent-code-version
status: in-progress
created: 2026-07-14
---

# code_version 컬럼 + 배포 어긋남 배지 (에이전트 콘솔 FEEDBACK §5 — v1.4.4 델타)

## 배경

에이전트 콘솔 회신(`panel-agent/FEEDBACK-0328-WATCHDOG.md` §5)의 요구 5개 컬럼 중
`telemetry_on / backend_v2 / snapshot_on / cfg_json` 4개는 quick 260714-6tq 에서 이미 반영·배포됐다(0097).
**남은 것은 `code_version` 하나** — v1.4.4 에서 새로 추가된, "실제로 어느 빌드가 돌고 있는가"의 유일한 증거다.

왜 필요한가: 오늘 맥미니가 `feat/monitoring-telemetry` 브랜치에 머물러 옛 코드로 도는데
`config.env` 의 `AGENT_VERSION` 만 새 값이라 **버전 문자열이 거짓말을 했다.**
원격 진단의 기준점이 거짓이면 나머지 계측이 전부 무의미하다.
→ 에이전트는 `CODE_VERSION` 을 코드 상수로 박아 `codeVersion` 필드로 보낸다(config 로 못 덮어씀).
→ 백엔드는 `agent_version`(config 유래)과 **별도 컬럼**에 저장하고, 둘이 다르면 화면에서 🔴 경고한다.

prod D1 최신 heartbeat 확인 결과 `raw.codeVersion` 이 **이미 들어오고 있다**(컬럼이 없어 조회만 안 될 뿐).

## 작업

1. **`migrations/0098_agent_code_version.sql`** — 0097 패턴 그대로.
   - `ALTER TABLE agent_heartbeats ADD COLUMN code_version TEXT;`
   - `ALTER TABLE panel_agent_status ADD COLUMN code_version TEXT;`
   - `ADD COLUMN` 은 `IF NOT EXISTS` 미지원 → 정확히 1회 수동 적용(0091~0097 관행).

2. **`functions/api/alarm/heartbeat.ts`** — `codeVersion?: string | null` optional 파싱.
   - 싱글턴 UPDATE 에 `code_version = ?` 추가.
   - 시계열 INSERT 에 `code_version` 컬럼 추가 (컬럼/물음표/bind 3개 개수 동시 증가 — 어긋나면 조용히 0행).
   - 없으면 NULL. 구 에이전트가 그대로 200 을 받아야 한다(INV-3).

3. **`functions/api/panel/status.ts`** — SELECT 타입에 `code_version`, 응답에 `codeVersion` 추가.

4. **`src/utils/api.ts`** — `PanelStatus.codeVersion?: string | null`.

5. **`src/pages/PanelMonitorPage.tsx`** — `switchBadges` 최상단에 🔴 **배포 어긋남**.
   - 조건: `codeVersion` · `agentVersion` **둘 다 non-null 이고 서로 다를 때만**.
     한쪽이라도 NULL 이면 배지 없음 — 구 에이전트는 기존 '구 에이전트' 배지가 처리한다(초록 칠하기 금지 원칙).
   - `why`: "config 가 말하는 버전과 실제 도는 코드가 다르다. 이 화면의 모든 판단을 의심할 것."
   - 상단 스트립 버전 칸: 어긋났을 때 `code / config` 두 값을 같이 보여준다(무엇이 다른지 못 보면 배지가 무의미).

6. **배포** — prod D1 에 0098 적용 → 빌드 → `wrangler pages deploy --branch production`.

## 검증

- prod D1: `PRAGMA table_info` 로 양쪽 테이블에 `code_version` 존재 확인.
- 배포 후 60초 내 heartbeat 1건에서 `code_version` 채워짐 확인(현재 값 `1.4.3-telemetry`).
- `/api/panel/status` 응답에 `codeVersion` 포함.
- 현 상태(code==config) 에서는 배지가 **뜨지 않는 것**이 정답이다.

## 범위 밖

- §1 워치독 / §2 카운터 SUM / §3 gap 밴드 — 260714-6tq 에서 완료.
- 첫 실경보 prod 실증(§4) — 경보 발생 대기.
- `renotify` 미작동(§5 별건) — 별도 처리.

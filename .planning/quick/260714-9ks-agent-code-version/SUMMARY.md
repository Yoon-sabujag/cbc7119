---
id: 260714-9ks
slug: agent-code-version
status: complete
created: 2026-07-14
completed: 2026-07-14
commit: 16902fd9
deploy: https://34268f0d.cbc7119.pages.dev
---

# SUMMARY — code_version 컬럼 + 배포 어긋남 배지

에이전트 콘솔 회신(FEEDBACK-0328-WATCHDOG.md §5)의 v1.4.4 델타를 반영했다.
§5 가 요구한 컬럼 5개 중 4개(`telemetry_on`/`backend_v2`/`snapshot_on`/`cfg_json`)는
quick 260714-6tq 에서 이미 끝나 있었고, **남은 것은 `code_version` 하나**였다.

## 무엇을 했나

| 파일 | 내용 |
|---|---|
| `migrations/0098_agent_code_version.sql` | `agent_heartbeats` + `panel_agent_status` 에 `code_version TEXT`. prod D1 적용 완료(rows_written 2) |
| `functions/api/alarm/heartbeat.ts` | `codeVersion` optional 파싱. 싱글턴 UPDATE + 시계열 INSERT(컬럼/물음표/bind 35→**36**, 3개 동시 증가 검증) |
| `functions/api/panel/status.ts` | 응답에 `codeVersion` (agentVersion 과 **별도**) |
| `src/utils/api.ts` | `PanelStatus.codeVersion` |
| `src/pages/PanelMonitorPage.tsx` | 🔴 **배포 어긋남** 배지 = `switchBadges` 최상단. 스트립 버전 칸은 어긋났을 때만 `code / config` 병기 |

배지 판정: `codeVersion` · `agentVersion` **둘 다 non-null 이고 다를 때만**.
한쪽이라도 NULL 이면 판정 자체를 하지 않는다 — 구 에이전트는 기존 '구 에이전트' 배지가 처리(초록 칠하기 금지 원칙 유지).

## 검증 (prod)

- `pragma_table_info`: 양쪽 테이블에 `code_version` 존재 확인.
- 배포 직후 하트비트 `2026-07-14 06:59:27` 부터 시계열·싱글턴 양쪽에 값 적재 확인
  (직전 06:58:26 은 NULL — 배포 경계가 데이터에 그대로 찍혔다).
- 현재 `code_version == agent_version == 1.4.3-telemetry` → **배지가 뜨지 않는 것이 정답.**

## ★ 에이전트 콘솔에 회신할 사실

**맥미니는 v1.4.4 가 아니라 `1.4.3-telemetry` 로 돌고 있다.**
회신 문서는 "맥미니에서 v1.4.4-telemetry 가동 중"이라고 적었지만,
prod D1 의 `raw.codeVersion`(= 코드 상수, 유일한 증거)은 `1.4.3-telemetry` 다.
`agentVersion` 과 `codeVersion` 이 **일치**하므로 config 어긋남은 아니고, 그냥 **한 버전 뒤처진 빌드**다.
= §5 가 막으려던 그 사고(맥미니가 pull 을 못 받음)와 정확히 같은 형태일 수 있다.

## 범위 밖 / 잔여

- §1 워치독 · §2 카운터 SUM · §3 gap 밴드 — 260714-6tq 에서 완료·배포됨.
- §4 첫 실경보 prod 실증 — 경보 발생 대기(인위 격발 불가).
- `renotify` 미작동 — 별건.

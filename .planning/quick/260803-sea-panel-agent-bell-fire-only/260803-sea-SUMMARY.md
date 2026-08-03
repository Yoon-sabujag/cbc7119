---
phase: quick-260803-sea
plan: 01
subsystem: panel-agent (별도 repo, 맥미니 화재수신반 캡처보드 감시)
tags: [python, sox, ffmpeg, cloudflare-workers, alarm-escalation]

requires: []
provides:
  - "Detector.classify fire-only 소극화(fault/equip 트리거 배제, rgy 계측 보존)"
  - "경종(quiet→bell) 화면 상태 무관 즉시 fire trigger 통일 + 오디오 경로 ocr_and_patch 연결"
  - "renotify_loop 재발송 티커 신설(서버 escalation 3회×20초 계약을 에이전트가 격발)"
affects: [panel-agent-deploy, alarm-server-contract]

tech-stack:
  added: []
  patterns:
    - "모듈 전역 상태 공유(_LATEST_SLOT/_AUDIO_STATE/_RENOTIFY_ALARM) + global 선언으로 스레드 간 최소 결합"
    - "서버 authoritative 판정(done/escalation) + 에이전트는 로컬 게이트(활성 여부)만 담당"

key-files:
  created: []
  modified:
    - /Users/jykevin/Documents/panel-agent/agent.py
    - /Users/jykevin/Documents/panel-agent/config.env.example

key-decisions:
  - "renotify_loop 은 서버가 20초 게이팅·3회 상한을 authoritative 로 판정하므로 에이전트 틱을 5초(과속)로 두고 서버 done 만 신뢰"
  - "_audio_fire ③ 억제 분기(화면 정상 시 발송 안 함)를 완전 폐기 — 경종=화재 원칙, 오탐 억제는 서버 점검모드가 흡수"

requirements-completed: [SEA-01, SEA-02, SEA-03, SEA-04]

duration: ~20min
completed: 2026-08-03
---

# Quick 260803-sea: panel-agent 경종=화재 소극화 + 재발송 티커 Summary

**panel-agent(별도 repo) `agent.py` 를 빨간 화재 팝업+경종 전용 감지로 소극화하고, 서버 escalation 계약을 격발하는 renotify_loop 재발송 티커를 신설했다. rgy 색 계측(하트비트 사후분석 수단)은 한 글자도 변경하지 않았다.**

## Performance

- **Duration:** ~20분
- **Completed:** 2026-08-03T11:42:17Z
- **Tasks:** 3/3 완료
- **Files modified:** 2 (agent.py, config.env.example)

## Accomplishments
- `Detector.classify` 가 fire|normal 만 반환하도록 축소 (fault/equip 트리거·이력 배제, rgy 계측은 무변경)
- `_audio_fire()` 를 화면 상태 무관 단일 `trigger_alarm(source="audio")` 로 통일 — ③ 억제 분기 폐기, 최신 프레임으로 `ocr_and_patch` 스레드 연결
- `renotify_loop` 데몬 신설 — `trigger_alarm` 응답의 `escalation` truthy 시 `_RENOTIFY_ALARM` 무장, (화면 fire | 경종 bell) 활성 동안 5초 주기 `/api/alarm/renotify` POST, 서버 `done=true` 또는 비활성 시 래치 해제
- `CODE_VERSION` 1.7.0-diagcard → 1.8.0-fireonly 범프(하트비트 원격 진단용)

## Task Commits

panel-agent repo(`master` 브랜치)에 태스크 단위 atomic 커밋:

1. **Task 1: classify fire-only 소극화 + OCR 트리거 조건 정리 + CODE_VERSION 범프** - `eeaef0c` (feat)
2. **Task 2: 경종 즉시 발보 통일 + 오디오 경보 스냅샷/OCR 연결** - `22389da` (feat)
3. **Task 3: 재발송 티커 renotify_loop 신설 + escalation 래치** - `968283d` (feat)

**Push:** `3ebfdab..968283d master -> master` (origin/Yoon-sabujag/panel-agent) 완료.

_이 SUMMARY.md 파일은 20260328(prod 콘솔) repo 소속이며 이 콘솔에서는 커밋하지 않는다(오케스트레이터 담당)._

## Files Created/Modified
- `/Users/jykevin/Documents/panel-agent/agent.py` - classify fire-only, `_audio_fire` 통일, `renotify_loop` 신설, `_LATEST_SLOT`/`_AUDIO_STATE`/`_RENOTIFY_ALARM` 전역 추가
- `/Users/jykevin/Documents/panel-agent/config.env.example` - `RENOTIFY_TICK_SEC` 주석 항목 추가

## Verification Gates (태스크별 실행 결과)

| Task | py_compile | grep/AST 검증 | 결과 |
|------|-----------|---------------|------|
| Task 1 | 통과 | fire 분기만 존재, fault/equip 없음, CODE_VERSION=1.8.0-fireonly, 영상 OCR 조건 fire-only, `TEL.on_analyze` 1회·`_r/_g/_y.append` 무변경 | OK |
| Task 2 | 통과 | `_LATEST_SLOT`/`_AUDIO_STATE` 전역 존재, main·audio_loop 공유 라인 존재, `_audio_fire` 내 `trigger_alarm("fire"` 1회·`ocr_and_patch`+`source="audio"` 존재·"푸시 억제" 문구 부재 | OK |
| Task 3 | 통과 | `renotify_loop` 1개, `/api/alarm/renotify` 존재, `_RENOTIFY_ALARM` 전역, `RENOTIFY_TICK` 상수, `trigger_alarm` 내 escalation 래치 무장, `renotify_loop` 내 활성게이트+done 해제, main 기동, config.env.example 주석 | OK |
| 전체 재검증 | 통과 | 플랜 `<verification>` 1-6 항목 전부 재확인(파일 실물 기준) | OK |

**rgy 색 계측(하트비트) 무변경 게이트:** 3개 태스크 커밋 전 및 최종 재검증에서 `TEL.on_analyze` 호출 1회·`self._r/_g/_y.append(...)` 3줄이 모두 원문 그대로임을 확인 — 260802 사후 분석 수단 보존.

**커밋 위생:** `git -C /Users/jykevin/Documents/panel-agent status --short` 최종 무출력 — config.env·agent.log*·snaps/·ocr 바이너리·.ocr_*.png 등 비밀·산출물 미스테이징 확인.

## Decisions Made
- `_audio_fire()` 의 ①②③ 로그 문구는 유지하되(진단용) 실제 발송 로직은 3분기 모두 단일 `trigger_alarm` 호출로 병합 — 플랜 지시(로그 문구 구분용 유지 + 발송은 통일)를 그대로 따름.
- `renotify_loop` 는 서버 `done` 판정만 신뢰하고 자체 재시도 횟수 카운트를 두지 않음 — 서버가 3회 상한 authoritative.

## Deviations from Plan

None - 플랜 그대로 실행됨. `update()`·`rollback()`·`analyze_frame()`·`TEL.on_analyze()` 는 지시대로 손대지 않았고, `DET_YELLOW_MIN`/`DET_GREEN_MIN` 상수·cfg 텔레메트리 필드도 잔류(최소 diff 원칙 준수).

## Issues Encountered
- Task 2 검증 스크립트 1차 실행 시 `_audio_fire` 함수 내 주석에 "예전엔 푸시 억제였으나..."라는 문구가 남아 grep 게이트(`'푸시 억제' not in af`)가 실패했다. 주석 표현을 "발송 억제"로 바꿔 재검증 통과시킴(로직 변경 아님, 순수 주석 표현 수정).

## User Setup Required
None - 외부 서비스 설정 불필요. `config.env.example` 의 `RENOTIFY_TICK_SEC` 는 주석(기본값 5초 하드코드 폴백)이라 즉시 반영에 `config.env` 수정 불필요.

## 배포 대기 상태 (오케스트레이터 담당 — 이 실행 범위 밖)

- **배포·재시작 미실행.** 맥미니 SSH·`update.command`·프로세스 kill 실행 안 함(플랜 제약 준수).
- panel-agent repo `master` 브랜치는 origin 에 push 완료. 맥미니에서 `update.command`(또는 `에이전트-업데이트.command`) 더블클릭 시 `git pull` → 문법검증 → 재시작까지 자동 수행됨.
- 반영 후 확인 포인트: 하트비트 `codeVersion` = `1.8.0-fireonly` 확인, 초록/노랑 팝업이 더는 트리거·이력을 만들지 않는지, 경종 단독 감지 시 즉시 fire 발보되는지, fire 경보 지속 중 `/api/alarm/renotify` 가 서버 로그에 5초 간격으로 찍히는지(3회 도달·ack 시 정지).

## Next Phase Readiness
- panel-agent 코드 준비 완료, 맥미니 배포 대기.
- 서버(cha-bio-safety) `trigger.ts`/`renotify.ts` 는 이번 플랜에서 수정하지 않음(기존 계약 그대로 재사용) — quick-B 로 서버측 변경이 별도 예정이라면 이 SUMMARY 의 서버 계약 인용 내용(escalation/done 필드)과 대조해 볼 것.

---
*Quick task: 260803-sea-panel-agent-bell-fire-only*
*Completed: 2026-08-03*

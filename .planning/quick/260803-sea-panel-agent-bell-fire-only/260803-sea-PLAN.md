---
phase: quick-260803-sea
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - /Users/jykevin/Documents/panel-agent/agent.py
  - /Users/jykevin/Documents/panel-agent/config.env.example
autonomous: true
requirements: [SEA-01, SEA-02, SEA-03, SEA-04]
must_haves:
  truths:
    - "빨간 화재 팝업만 영상 트리거를 낸다 (초록 설비·노랑 고장·민트 FIRE RESET 은 트리거·이력에서 사라진다)"
    - "하트비트 rgy 통계(TEL.on_analyze → _r/_g/_y)는 변함없이 누적된다 (사후 분석 수단 보존)"
    - "경종 확정(quiet→bell) 시 화면 상태와 무관하게 즉시 fire trigger 를 발송한다"
    - "오디오 경보도 최신 프레임으로 스냅샷+위치 OCR patch 스레드를 기동한다"
    - "경종 또는 화면 빨강이 지속되는 동안 5초 주기로 /api/alarm/renotify 를 두드리고, 서버 done=true 또는 비활성 시 멈춘다"
  artifacts:
    - path: "/Users/jykevin/Documents/panel-agent/agent.py"
      provides: "fire-only Detector.classify, 경종 즉시발보 _audio_fire, renotify_loop 재발송 티커, escalation 래치"
      contains: "def renotify_loop"
  key_links:
    - from: "trigger_alarm() 응답 data.escalation"
      to: "_RENOTIFY_ALARM 래치 무장"
      via: "escalation truthy + alarm_id 시 대입"
      pattern: "escalation"
    - from: "renotify_loop()"
      to: "POST /api/alarm/renotify {alarmId}"
      via: "http_post_json, _VIDEO_STATE=='fire' or _AUDIO_STATE=='bell' 게이트"
      pattern: "/api/alarm/renotify"
---

<objective>
panel-agent(별도 repo) `agent.py` 를 **빨간 화재 팝업 + 경종 전용** 감지로 소극화한다. 초록 설비·노랑 고장·민트 FIRE RESET 팝업은 트리거(및 이력)에서 완전히 배제하되, r/g/y 색 계측(하트비트 rgy 통계)은 사후 분석 수단으로 그대로 유지한다. 아울러 경종을 화면 상태와 무관하게 즉시 fire 로 발보하도록 바꾸고, 원래 미구현이던 **재발송 티커(renotify_loop)** 를 신설하며, 오디오 경보에도 스냅샷+위치 OCR 을 연결한다.

Purpose: 방재팀이 실제로 대응하는 신호(화재 팝업·경종)에만 푸시를 집중시키고, 서버 계약만 존재하던 3회 재발송 에스컬레이션을 에이전트 격발자로 완성한다.
Output: `agent.py` 단일 파일 수정(+ config.env.example 주석, CODE_VERSION 범프) → panel-agent repo 에 커밋+푸시. 맥미니 배포·재시작은 이 플랜 범위 밖(오케스트레이터가 수행).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/jykevin/Documents/panel-agent/agent.py
@/Users/jykevin/Documents/panel-agent/CLAUDE.md

# 서버 계약(참조만 — 이 플랜에서 서버 수정 금지, quick-B 별도):
#   trigger.ts 응답  data.escalation = fire 이면 {maxCount:3, intervalSec:20}(truthy), 아니면 null
#   renotify.ts      요청 {alarmId} → 응답 data.{pushed, pushCount, done}
#                    서버가 20초 게이팅·3회 상한·ack/점검모드 종료를 authoritative 판정. done:true 면 티킹 중지.
@/Users/jykevin/Documents/20260328/cha-bio-safety/functions/api/alarm/trigger.ts
@/Users/jykevin/Documents/20260328/cha-bio-safety/functions/api/alarm/renotify.ts
</context>

<constraints>
- 수정 파일 = `/Users/jykevin/Documents/panel-agent/agent.py` 단일 (+ 필요 시 config.env.example 주석). 서버(cha-bio-safety)·클라 수정 금지 — quick-B 별도.
- **배포·재시작 금지.** 실행자는 커밋+푸시까지만. 맥미니 SSH 배포는 오케스트레이터(메인)가 직접 수행한다. `wrangler`·`ssh`·`update.command`·프로세스 kill 실행 금지.
- panel-agent 는 별도 git repo — 커밋은 그 repo(`git -C /Users/jykevin/Documents/panel-agent ...`)에서. 한국어 커밋 메시지, 기존 스타일(`feat(audio): ...`, `feat(alarm): ...`).
- 커밋 전 `git -C /Users/jykevin/Documents/panel-agent status` 로 비밀·산출물(config.env, agent.log*, snaps/, ocr 바이너리, .ocr_*.png) 이 스테이징 안 됐는지 확인(해당 repo CLAUDE.md §비밀·산출물).
- **최소 diff 우선**: 상수(DET_YELLOW_MIN/DET_GREEN_MIN)는 잔류시켜도 무해하니 제거하지 않는다. rollback()·update() 로직은 손대지 않는다.
- **rgy 계측 절대 무변경**: `TEL.on_analyze(...)` 호출과 `self._r/_g/_y.append(...)` 는 한 글자도 바꾸지 않는다(260802 사건 해결 수단).
</constraints>

<tasks>

<task type="auto">
  <name>Task 1: Detector.classify 를 fire-only 로 축소 + 영상 OCR 트리거 조건 정리 + CODE_VERSION 범프</name>
  <files>/Users/jykevin/Documents/panel-agent/agent.py</files>
  <action>
`Detector.classify(self, r, g, y)`(현재 611-618행) 를 fire-only 로 바꾼다: `if r >= DET_RED_MIN: return "fire"` 이후 곧바로 `return "normal"` 로 끝내고, `y >= DET_YELLOW_MIN → "fault"` 와 `g >= DET_GREEN_MIN → "equip"` 두 분기를 제거한다. 제거 이유를 한 줄 주석으로 남긴다(fire-only 소극화 2026-08-03; equip/fault 는 rgy 계측엔 남지만 트리거 대상 아님). `DET_YELLOW_MIN`·`DET_GREEN_MIN` 상수 정의와 cfg 텔레메트리(detGreenMin/detYellowMin)는 손대지 않는다(최소 diff).

main() 영상 트리거 성공 경로의 OCR/스냅샷 스레드 기동 조건(현재 1468행) `if alarm_id and (now in ("equip", "fire") or SNAPSHOT_ON_ALARM):` 를 fire-only 로 좁혀 `if alarm_id and (now == "fire" or SNAPSHOT_ON_ALARM):` 로 바꾼다(classify 가 더는 equip 을 내지 않으므로 의미 동일, 의도 명확화).

`update()`·`rollback()`·`analyze_frame()`·`TEL.on_analyze()` 는 절대 건드리지 않는다 — rgy 계측이 그대로 흘러야 한다.

파일 상단 `CODE_VERSION = "1.7.0-diagcard"`(75행) 를 `CODE_VERSION = "1.8.0-fireonly"` 로 범프한다(하트비트 codeVersion 이 실제 도는 빌드를 증명 — 원격 진단용, 2026-07-14 사고 방지 원칙).
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/panel-agent && python3 -m py_compile agent.py && python3 - <<'PY'
import re,sys
s=open('agent.py').read()
m=re.search(r'def classify\(self.*?\n(.*?)\n    def update',s,re.S)
body=m.group(1)
assert 'return "fire"' in body, 'fire 분기 없음'
assert 'return "fault"' not in body and 'return "equip"' not in body, 'fault/equip 분기 잔존'
assert 'CODE_VERSION = "1.8.0-fireonly"' in s, 'CODE_VERSION 미범프'
assert 'now == "fire" or SNAPSHOT_ON_ALARM' in s, '영상 OCR 조건 미조정'
assert s.count('TEL.on_analyze') == 1, 'rgy 계측 호출 변경됨'
assert 'self._r.append(r)' in s and 'self._g.append(g)' in s and 'self._y.append(y)' in s, 'rgy deque 적재 변경됨'
print('OK task1')
PY</automated>
  </verify>
  <done>classify 가 fire|normal 만 반환하고 fault/equip 분기가 제거됨. CODE_VERSION=1.8.0-fireonly. 영상 OCR 조건이 fire-only. rgy 계측(on_analyze·_r/_g/_y) 무변경. py_compile 통과.</done>
</task>

<task type="auto">
  <name>Task 2: 경종 즉시 발보(_audio_fire ③ 억제 폐기) + 오디오 경보 스냅샷/OCR 연결 + 전역 프레임 슬롯·오디오 상태 공유</name>
  <files>/Users/jykevin/Documents/panel-agent/agent.py</files>
  <action>
**모듈 전역 신설**: `_VIDEO_STATE = "normal"`(160행) 정의 바로 아래에 `_LATEST_SLOT = None`(오디오 스레드가 최신 jpeg 를 얻는 공유 슬롯; main 이 씀) 과 `_AUDIO_STATE = "quiet"`(오디오 Detector 최신 래치 상태; audio_loop 가 씀, renotify 게이트가 읽음) 두 전역을 주석과 함께 추가한다.

**main() 슬롯 공유**: main() 의 `global` 선언(현재 1291행 `global _BG_STARTED, _VIDEO_STATE`)에 `_LATEST_SLOT` 을 추가한다. 캡처 루프에서 `slot = LatestFrame()`(현재 1352행) 직후 `_LATEST_SLOT = slot` 한 줄로 최신 슬롯을 모듈 전역에 공유한다(재연결 때마다 새 슬롯으로 갱신).

**audio_loop() 상태 공유**: audio_loop() 함수 초입에 `global _AUDIO_STATE` 를 선언하고, 캡처 창 루프의 `tr = det_a.update(dbfs)`(현재 954행) 바로 다음 줄에 `_AUDIO_STATE = det_a.state` 를 추가해 매 창마다 오디오 상태(quiet/bell)를 모듈 전역에 반영한다. sox 재연결로 det_a 가 재생성되면 상태가 quiet 로 리셋되는 것은 정상.

**_audio_fire() 소극화**: `_audio_fire(dbfs)`(현재 895-915행)의 3분기 중 **③ '화면 정상·무변화 → 푸시 억제'** 를 폐기한다. vstate/blind 판정은 **로그 문구 구분용으로만** 유지하고(①화면화재 동시 ②프리즈 실명 ③화면정상 각 로그 문구는 남긴다), 실제 발송은 세 경우 모두 `ok, alarm_id = trigger_alarm("fire", 0.0, 0.0, 0.0, None, source="audio", confidence=conf)` **단일 호출**로 통일한다 — 화면 상태 무관 즉시 발보. 점검모드 억제는 서버가, 재울림은 서버 dedupe 가 흡수한다. clear 는 여전히 하지 않는다(경보 종료는 영상·서버 소유).

**오디오 경보 스냅샷+OCR**: trigger 성공(`ok and alarm_id`) 시 최신 프레임으로 OCR/스냅샷 스레드를 기동한다 — 모듈 전역 `_LATEST_SLOT` 이 None 이 아니면 `_LATEST_SLOT.get()` 의 두 번째 원소(jpeg)를 꺼내(예외 격리), jpeg 가 있으면 `threading.Thread(target=ocr_and_patch, args=(jpeg, "fire", alarm_id), daemon=True).start()` 로 기동한다(영상 경로 1469행과 동일 패턴, atype="fire"). 슬롯이 None 이거나 jpeg 가 없으면 조용히 건너뛴다(경보/푸시는 이미 나갔으므로 무해).
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/panel-agent && python3 -m py_compile agent.py && python3 - <<'PY'
import re
s=open('agent.py').read()
assert re.search(r'^_LATEST_SLOT\s*=\s*None',s,re.M), '_LATEST_SLOT 전역 없음'
assert re.search(r'^_AUDIO_STATE\s*=\s*"quiet"',s,re.M), '_AUDIO_STATE 전역 없음'
assert '_LATEST_SLOT = slot' in s, 'main 슬롯 공유 없음'
assert '_AUDIO_STATE = det_a.state' in s, 'audio_loop 상태 공유 없음'
af=re.search(r'def _audio_fire\(dbfs\):(.*?)\ndef audio_loop',s,re.S).group(1)
assert af.count('trigger_alarm("fire"') == 1, '_audio_fire trigger 호출이 1회(통일)가 아님'
assert 'ocr_and_patch' in af and 'source="audio"' in af, '오디오 스냅샷/OCR 연결 또는 source 누락'
assert '푸시 억제' not in af, '③ 억제 분기 잔존'
print('OK task2')
PY</automated>
  </verify>
  <done>_LATEST_SLOT·_AUDIO_STATE 전역이 생기고 main·audio_loop 가 각각 채움. _audio_fire 가 화면 상태 무관 단일 trigger_alarm(source=audio)로 통일되고 ③ 억제가 사라짐. trigger 성공 시 최신 프레임으로 ocr_and_patch(fire) 스레드 기동. py_compile 통과.</done>
</task>

<task type="auto">
  <name>Task 3: 재발송 티커 renotify_loop 신설 + trigger_alarm escalation 래치 + main 기동 + config 주석</name>
  <files>/Users/jykevin/Documents/panel-agent/agent.py, /Users/jykevin/Documents/panel-agent/config.env.example</files>
  <action>
**재발송 주기 상수**: 감지 설정 블록 근처(예: AUDIO_* 상수 뒤)에 `RENOTIFY_TICK = float(CFG.get("RENOTIFY_TICK_SEC", "5"))` 를 추가한다(에이전트 틱 주기 5초 권장; 서버가 20초 게이팅이라 과속해도 안전).

**래치 전역**: `_AUDIO_STATE` 전역 근처에 `_RENOTIFY_ALARM = None`(재발송 대상 alarmId 래치; escalation truthy 시 무장, done/비활성 시 해제) 전역을 추가한다.

**trigger_alarm escalation 래치 무장**: `trigger_alarm(...)`(현재 800-825행)에서 지금 alarmId 만 회수하고 버리는 응답의 escalation 을 회수한다. `alarm_id = ((resp or {}).get("data") or {}).get("alarmId")` 아래에 `escalation = ((resp or {}).get("data") or {}).get("escalation")` 를 추가하고, `escalation` 이 truthy 이고 `alarm_id` 가 있으면 모듈 전역 `_RENOTIFY_ALARM = alarm_id` 로 티커를 무장한다(함수 상단에 `global _RENOTIFY_ALARM` 선언). suppressed(점검모드) 응답은 escalation:null 이라 자동 배제된다. 이렇게 하면 영상·오디오 경로 양쪽(둘 다 trigger_alarm 경유)이 동일하게 무장된다(래치 무장 통일).

**renotify_loop() 신설**: heartbeat_loop 인근에 데몬 함수 `renotify_loop()` 를 추가한다. 무한 루프에서 `time.sleep(RENOTIFY_TICK)` 후:
  - `_RENOTIFY_ALARM` 이 None 이면 continue(무장 전엔 아무 것도 안 함);
  - 활성 판정 `active = (_VIDEO_STATE == "fire") or (_AUDIO_STATE == "bell")` — 비활성이면(경종 멎고 화면 정상) `_RENOTIFY_ALARM = None` 로 래치 해제 후 continue(재발송 자연 종료);
  - 활성이면 `http_post_json("/api/alarm/renotify", json.dumps({"alarmId": _RENOTIFY_ALARM}).encode(), {"X-Agent-Key": KEY, "Content-Type": "application/json"})` 로 POST. 응답 `done = ((resp or {}).get("data") or {}).get("done")` 가 truthy 면 `_RENOTIFY_ALARM = None` 로 해제(서버 authoritative: ack/3회도달/점검모드/clear). 함수 상단 `global _RENOTIFY_ALARM`. 모든 예외는 try/except 로 격리해 로그만 남기고 감시를 죽이지 않는다(기존 heartbeat_loop 패턴). 20초 게이팅·3회 상한은 서버가 판정하므로 에이전트는 게이트 카운트를 두지 않는다.

**main 기동**: main() 의 `_BG_STARTED` 블록(현재 1323-1332행, heartbeat_loop 스레드 기동 옆)에 `threading.Thread(target=renotify_loop, daemon=True).start()` 를 추가한다(H1 재진입 시 1회만 기동됨).

**config.env.example 주석**: 재발송 티커 설명과 `# RENOTIFY_TICK_SEC=5`(기본 5초, 서버가 20초×3회 authoritative) 주석 항목을 추가한다.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/panel-agent && python3 -m py_compile agent.py && python3 - <<'PY'
import re
s=open('agent.py').read()
assert s.count('def renotify_loop') == 1, 'renotify_loop 없음'
assert '/api/alarm/renotify' in s, 'renotify POST 경로 없음'
assert re.search(r'^_RENOTIFY_ALARM\s*=\s*None',s,re.M), '_RENOTIFY_ALARM 전역 없음'
assert 'RENOTIFY_TICK' in s, 'RENOTIFY_TICK 상수 없음'
tr=re.search(r'def trigger_alarm\(.*?\ndef clear_alarm',s,re.S).group(0)
assert 'escalation' in tr and '_RENOTIFY_ALARM = alarm_id' in tr, 'trigger_alarm escalation 래치 무장 없음'
rl=re.search(r'def renotify_loop\(\):(.*?)\n(?:def |class )',s,re.S).group(1)
assert '_VIDEO_STATE == "fire"' in rl and '_AUDIO_STATE == "bell"' in rl, 'renotify 활성 게이트 없음'
assert 'done' in rl and '_RENOTIFY_ALARM = None' in rl, 'renotify done/해제 로직 없음'
assert 'target=renotify_loop' in s, 'main 에서 renotify_loop 미기동'
import subprocess
grep=subprocess.run(['grep','-c','RENOTIFY_TICK_SEC','config.env.example'],capture_output=True,text=True)
assert grep.stdout.strip() != '0', 'config.env.example 주석 없음'
print('OK task3')
PY</automated>
  </verify>
  <done>renotify_loop 데몬이 신설되어 _RENOTIFY_ALARM 무장 시 + (화면 fire | 경종 bell) 활성 동안 5초 주기로 /api/alarm/renotify {alarmId} 를 POST 하고, 서버 done=true 또는 비활성 시 래치 해제. trigger_alarm 이 escalation truthy 시 래치 무장(영상·오디오 통일). main _BG_STARTED 에서 1회 기동. config.env.example 에 RENOTIFY_TICK_SEC 주석. py_compile 통과.</done>
</task>

</tasks>

<verification>
전체 무결성(파일 실물 기준 재검증 — 조사 라인번호는 참고용):

1. **문법**: `cd /Users/jykevin/Documents/panel-agent && python3 -m py_compile agent.py` 통과.
2. **fire-only**: classify 가 fire|normal 만 반환, fault/equip 분기 부재.
3. **rgy 계측 보존(회귀 게이트)**: `TEL.on_analyze` 호출 1회 그대로, `self._r/_g/_y.append(...)` 3줄 그대로 — 260802 사후 분석 수단 무변경.
4. **경종 발보**: _audio_fire 가 화면 상태 무관 단일 trigger_alarm(source="audio"), ③ 억제 문구 부재, ocr_and_patch 연결.
5. **재발송 티커**: renotify_loop 존재 + /api/alarm/renotify POST + 활성 게이트(_VIDEO_STATE fire | _AUDIO_STATE bell) + done 해제 + main 기동.
6. **escalation 래치**: trigger_alarm 이 escalation truthy 시 _RENOTIFY_ALARM 무장.
7. **커밋 위생**: `git -C /Users/jykevin/Documents/panel-agent status` 에 config.env·agent.log*·snaps/·ocr 바이너리·.ocr_*.png 미스테이징 확인.

**커밋+푸시(실행자 종료 지점)**: panel-agent repo 에서 한국어 커밋(예: `feat(alarm): 경종=화재 소극화 + 재발송 티커 — fire-only 감지·경종 즉시발보·renotify 3회 에스컬레이션`) 후 `git -C /Users/jykevin/Documents/panel-agent push`. **배포·재시작은 여기서 하지 않는다** — 오케스트레이터에게 배포 대기 상태로 반환.
</verification>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| agent(맥미니) → prod API(/api/alarm/*) | X-Agent-Key 인증. renotify/trigger 는 assertAgentKey 가드 하 — 신규 신뢰경계 없음(기존 경로 재사용) |

## STRIDE (경량 — 단일 파일 내부 에이전트 동작 변경, 패키지 설치 없음)

| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-sea-01 | Denial of Service | renotify_loop 푸시 폭주 | mitigate | 서버가 authoritative: 20초 게이팅·3회 상한·ack/점검모드 done:true. 에이전트는 활성(fire\|bell) 게이트 + done 래치해제 이중. 무한 푸시 전력(재trigger 폭주)을 서버 상한이 흡수 |
| T-sea-02 | DoS | 경종 오탐(충압펌프 등) 즉시 발보 | accept | AUDIO_FILTER 6kHz 대역 격리로 부저 배제(기존). 점검모드 억제는 서버가 처리. 소극화의 목적 자체가 경종 발보라 수용 |
| T-sea-03 | Info/무결성 | 오디오 경로 stale 프레임 OCR patch | mitigate | patch_location C1 게이트(위치 미확정 시 위치 소거 안 함) 기존 보존 — best-effort, 무해 |
</threat_model>

<success_criteria>
- classify fire-only (fault/equip 분기 제거), CODE_VERSION=1.8.0-fireonly.
- rgy 계측(on_analyze·_r/_g/_y) 한 글자도 안 바뀜.
- _audio_fire 가 화면 무관 즉시 fire trigger(source=audio) 단일 통일 + 최신 프레임 ocr_and_patch 연결.
- renotify_loop 신설: (fire|bell) 활성 동안 5초 주기 /api/alarm/renotify {alarmId}, done=true/비활성 시 중단.
- trigger_alarm escalation truthy → _RENOTIFY_ALARM 무장(영상·오디오 통일).
- py_compile 통과 + 모든 grep 게이트 통과.
- panel-agent repo 에 한국어 커밋+푸시 완료(비밀·산출물 미스테이징). **배포·재시작 미실행**.
</success_criteria>

<output>
`.planning/quick/260803-sea-panel-agent-bell-fire-only/260803-sea-SUMMARY.md` 작성. 커밋 해시·푸시 결과를 기록하고, **맥미니 배포·재시작은 오케스트레이터(메인) 대기 항목**임을 명시한다.
</output>

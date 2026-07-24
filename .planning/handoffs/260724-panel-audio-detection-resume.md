# 재개 핸드오프 — 화재수신반 오디오(소리) 기반 경보 2차 감지

작성 2026-07-24 · 새 세션이 이걸 읽고 이어감. 트리거: 사용자 "화재수신반 오디오 감지 재개".

## 무엇 (보류됐던 기능)
화재수신반 **부저/사이렌 소리를 USB 마이크로 들어서** 화재경보를 감지하는 **2차 신호**. 영상(빨강/초록)
감지를 보완. 맥미니(M1) 내장 마이크 없어서 **2단계로 보류**했었고, **2026-07-24 사용자가 USB 마이크 장착 →
재개.** 1단계(영상 단독)는 이미 LIVE·완결(마이크 없이 동작).

## 설계 원문 위치
- `~/Documents/cbc7119-design/.planning/phases/25-panel-monitoring/25-HANDOFF.md` **§4.7 "오디오 — 2단계(추후)"**
- 스키마 예약: 경보 이벤트에 `source TEXT CHECK(source IN ('visual','audio'))` (§25 핸드오프 line 73/118/231)
- ⚠️ **이 오디오 항목이 현행 라이브 SSOT `~/Documents/panel-agent/MONITORING-SPEC.md` 에는 미이식.**
  현행 SPEC은 영상/OCR/워치독만. `source` enum도 라이브 스키마에 없을 수 있음 → **계약/스키마부터 재편입 필요.**

## 원 설계 요지
- HDMI 오디오(캡처보드 `USB3 Digital Audio`)엔 부저 안 실릴 가능성 → **별도 USB 마이크** 전제(장착 완료).
- 감지 = ffmpeg **avfoundation 오디오 입력의 RMS(음량) 급증** 임계 (영상 빨강/초록 비율 임계와 같은 구조의 2차 트리거).
- 감지 시 경보 이벤트 `source='audio'` 발신.

## ★사용자 확정 설계 포인트 (원설계 확장)
- **원설계 = OR(이중화)**: 영상 OR 오디오 → 경보. 캡처보드 프리즈로 영상 죽어도 오디오가 잡음.
- **사용자 = AND(고신뢰)**: "사이렌/부저 + 화면변화 동시 = 무조건 화재경보." 오탐 제거.
- **채택 방향 = 둘 공존**: 오디오를 독립 신호로 발신(프리즈 대비 OR) + 영상과 **동시발생 시 confidence='확정'** 태깅.

## 재개 3단계
1. **하드웨어 확인 (맥미니)**: USB 마이크가 avfoundation 입력으로 잡히는지
   `ffmpeg -f avfoundation -list_devices true -i ""` → 오디오 디바이스 인덱스 확보.
2. **계약/스키마 편입**: 현행 `panel_alarms`(cha-bio-db) 스키마에 `source`(visual/audio) + 동시발생 confidence
   컬럼 유무 확인 → 없으면 마이그 추가 + MONITORING-SPEC에 오디오 항목 복원. (트리거/dedupe/push 파이프라인에
   source 반영. push_count/renotify 무장 로직과의 상호작용 확인 — 기존 alarm dedupe 가 alarmId 재사용하므로
   audio 신호가 visual alarm 을 갱신하는지 신규인지 정의.)
3. **에이전트 구현+튜닝 (맥미니, 실제 부저 소리로)**: `agent.py` 에 오디오 RMS 급증 감지 루프 추가
   (영상 RED_ON/GREEN_ON 임계 구조 미러), 임계값 실측 튜닝, `source='audio'` 발신 + 영상 동시발생 융합 confidence.

## 머신 제약 (중요)
- panel-agent 코드: 이 맥북 `~/Documents/panel-agent/` (dev/백업 `Yoon-sabujag/panel-agent`) + **실제 구동+마이크는 맥미니.**
- RMS 임계 튜닝은 **맥미니에서 실제 부저 소리로** 해야 함. 코드는 맥북에서 작성 가능하나 검증은 맥미니.
- 에이전트↔앱 짝 변경 룰: 앱(맥북) 먼저 → 에이전트(맥미니) ([[project_machine_role_split]]).
- prod DB = cha-bio-db. staging-first 예외 = 맥미니 에이전트는 prod 로만 송신(전례, [[project_panel_agent_monitoring]]).

## 첫 스텝 제안
1단계(맥미니 마이크 avfoundation 인식 확인)부터 — 사용자가 맥미니 콘솔에서 `ffmpeg -f avfoundation
-list_devices true -i ""` 돌리거나, 맥미니 콘솔 세션에서 진행. 그다음 2단계(스키마/계약) 설계 → 3단계 구현.

관련 메모리: [[project_panel_agent_monitoring]] [[project_cctv_idea]] [[project_machine_role_split]]

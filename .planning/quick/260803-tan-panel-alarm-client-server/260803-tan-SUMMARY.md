---
phase: quick-260803-tan
plan: 01
subsystem: panel-alarm
tags: [cloudflare-pages-functions, d1, react-query, fire-alarm, push-notification]

# Dependency graph
requires:
  - phase: quick-260803-sea
    provides: panel-agent가 fire-only·즉시발보·재발송 티커로 동작 (형제 플랜)
provides:
  - fire 푸시 본문 고정("화재경보 발생, 수신반 확인 필요") + zoom=1 딥링크
  - trigger.ts fire-only 발송 가드(fault/equip은 push 미발송, 기록은 유지)
  - fire_alarm_records 고아 초안(GET ?drafts=1) 목록 API + in-place 확정(PUT) API
  - mapAlarm.snapshotKey 원본 필드 노출
  - 모바일 FireAlarmModal + 데스크톱 화재수신반 pane 5동선(zoom 직행/자동ack/초안카드/스냅샷토글/OCR prefill)
affects: [panel-monitor, fire-alarm-history, dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "OCR_LOCATION_PREFILL 모듈 상수로 모바일/데스크톱 공유 실험 플래그 격리"
    - "초안 in-place 확정은 UPDATE ... WHERE created_by='panel-agent' 가드로 신규 INSERT 없이 안전 처리"

key-files:
  created: []
  modified:
    - cha-bio-safety/functions/_lib/push.ts
    - cha-bio-safety/functions/api/alarm/trigger.ts
    - cha-bio-safety/functions/_lib/alarm.ts
    - cha-bio-safety/functions/api/fire-alarm/index.ts
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/pages/InspectionPage.tsx

key-decisions:
  - "resolve.ts는 무변경 — cleared 멱등 early-return 특성상 초안 확정은 fire-alarm/index.ts에 신규 PUT으로 분리"
  - "초안 확정은 UPDATE only, 신규 fire_alarm_records INSERT 금지(created_by 가드로 사용자 확정 레코드 재확정 차단)"
  - "OCR 위치 prefill은 빈 값일 때만 채움 — 사용자 입력을 절대 덮지 않음, 단일 플래그로 즉시 롤백 가능"

patterns-established:
  - "패널 경보 관련 소극화 기능은 모바일 FireAlarmModal / 데스크톱 pane 양쪽에 동형 이식 (pa*/panel* 접두 규약)"

requirements-completed: [TAN-01, TAN-02, TAN-03, TAN-04, TAN-05]

# Metrics
duration: 8min
completed: 2026-08-03
---

# Quick 260803-tan: 화재수신반 경보 소극화 2단계(서버+클라이언트) Summary

**fire 푸시를 문구 고정+zoom 딥링크로 단순화하고, 서버에 고아 초안 조회/in-place 확정 API를 신설했으며, 모바일·데스크톱 화재수신반 화면에 자동 ack·초안 카드·스냅샷 토글·OCR 위치 prefill 5가지 동선을 동형으로 이식했다.**

## Performance

- **Duration:** 약 8분 (21:18 ~ 21:26 KST)
- **Started:** 2026-08-03T12:18:00Z
- **Completed:** 2026-08-03T12:26:00Z
- **Tasks:** 3/3 완료
- **Files modified:** 6

## Accomplishments
- 서버: fire 푸시 본문·URL 고정, trigger.ts fire-only 발송 가드, snapshotKey 노출, 초안 GET/PUT API, api.ts 클라이언트 계약 추가
- 모바일: zoom=1 자동 열기, 활성 fire 자동 ack(1회·멱등), OCR 위치 1회 prefill, 초안 카드 탭 로드, 저장 3분기(confirmDraft/resolve/create), 줌 뷰어 라이브↔경보시점 토글
- 데스크톱: 동일 5동선을 pa*/panel* 접두 규약으로 이식, isPanel 이탈 시 초안 상태 리셋, 기존 takeover 모달·resolve/create·점검모드 무변경
- tsc + `npm run build` 통과 확인

## Task Commits

Each task was committed atomically:

1. **Task 1: 서버 + API 계약** - `7a8fc019` (feat)
2. **Task 2: 모바일 FireAlarmModal** - `b2821a67` (feat)
3. **Task 3: 데스크톱 화재수신반 pane** - `035a8d26` (feat)

_배포(wrangler)는 이 플랜 범위 밖 — 오케스트레이터/사용자 몫._

## Files Created/Modified
- `cha-bio-safety/functions/_lib/push.ts` - fire 본문/url 고정(buildPanelPayload)
- `cha-bio-safety/functions/api/alarm/trigger.ts` - push 발송·무장을 fire 전용으로 격리
- `cha-bio-safety/functions/_lib/alarm.ts` - mapAlarm에 snapshotKey 원본 노출
- `cha-bio-safety/functions/api/fire-alarm/index.ts` - GET ?drafts=1 고아 초안 목록 + PUT in-place 확정
- `cha-bio-safety/src/utils/api.ts` - fireAlarmApi.getDrafts/confirmDraft, FireAlarmDraft, Alarm.snapshotKey
- `cha-bio-safety/src/pages/InspectionPage.tsx` - OCR_LOCATION_PREFILL 상수 + 모바일/데스크톱 5동선 이식

## Deviations from Plan

None - 플랜 그대로 실행됨. 태스크 3개 모두 verify 게이트(tsc/grep) 및 최종 `npm run build` 통과.

## Known Stubs

없음.

## Threat Flags

없음 — 플랜의 `<threat_model>`에 정의된 T-tan-01/02/03 범위 내에서 구현(초안 PUT은 created_by 가드, drafts GET은 JWT 하위 라우트, 스냅샷 정적 서빙은 기존 무인증 정책 유지).

## Self-Check: PASSED

- FOUND: cha-bio-safety/functions/_lib/push.ts
- FOUND: cha-bio-safety/functions/api/alarm/trigger.ts
- FOUND: cha-bio-safety/functions/_lib/alarm.ts
- FOUND: cha-bio-safety/functions/api/fire-alarm/index.ts
- FOUND: cha-bio-safety/src/utils/api.ts
- FOUND: cha-bio-safety/src/pages/InspectionPage.tsx
- FOUND: commit 7a8fc019
- FOUND: commit b2821a67
- FOUND: commit 035a8d26

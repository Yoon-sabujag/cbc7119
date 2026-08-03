---
phase: quick-260803-tan
verified: 2026-08-03T13:10:00Z
status: human_needed
score: 7/7 must-haves verified (code-level)
overrides_applied: 0
human_verification:
  - test: "fire 실경보 발생 → 실기기 push 수신 → 알림 탭"
    expected: "알림 본문이 '화재경보 발생, 수신반 확인 필요' 로 표시되고, 탭 시 /inspection?panel=fire-alarm&zoom=1 로 이동해 라이브 확대뷰가 자동으로 열린다"
    why_human: "실제 push subscription/SW notificationclick 은 브라우저·iOS PWA 런타임에서만 확인 가능 (정적 코드로는 payload 조립/URL 생성까지만 확인됨)"
  - test: "활성 fire 경보 상태에서 화재수신반 페이지(모바일+데스크톱) 진입 / 평시(경보 없음) 상태에서 진입"
    expected: "활성 fire 경보가 있을 때만 자동 ack 호출로 재발송 티커가 멈추고, 평시에는 어떤 ack 호출도 발생하지 않는다"
    why_human: "실시간 폴링·에이전트 트리거와 연동된 상태 전이라 실기기/실경보 상황에서만 관찰 가능"
  - test: "해제된 미확정 초안(panel-agent) 카드 탭 → 폼 로드 → 저장 → D1 fire_alarm_records 조회"
    expected: "폼에 초안 값이 로드되고, 저장 시 같은 id 행이 UPDATE 되며(created_by 가 staffId 로 교체) 신규 행이 INSERT 되지 않는다. 저장 후 초안 카드 목록에서 사라진다"
    why_human: "실 D1 데이터(고아 초안 존재)가 있어야 end-to-end 확인 가능. 로컬에는 재현용 고아 초안 데이터 없음"
  - test: "줌 뷰어에서 '라이브 ↔ 경보 시점' pill 전환"
    expected: "스냅샷 키가 있는 경보/초안에서만 pill 이 보이고, '경보 시점' 선택 시 고정 스냅샷 이미지로, '라이브' 선택 시 실시간 프레임으로 전환된다"
    why_human: "시각적 렌더 결과·실제 스냅샷 이미지 정합성은 화면에서만 확인 가능"
  - test: "다음 실경보에서 OCR 위치 1회 prefill"
    expected: "OCR 로 감지된 위치가 발생장소 필드에 1회 자동 채워지고, 사용자가 이미 입력한 값은 덮어쓰지 않는다"
    why_human: "OCR 값은 실제 화재수신반 화면 캡처+OCR 파이프라인 결과에 의존 — 정적 코드로는 가드 로직(빈 값일 때만 채움)까지만 확인됨. 메모리 project_panel_agent_monitoring.md 에도 '다음 실경보 ocr_* 검증' 이 잔여 항목으로 기록됨"
---

# Quick 260803-tan: 화재수신반 경보 소극화 2단계(서버+클라이언트) Verification Report

**Task Goal:** 수신반 경보 소극화 2단계 — ①fire 푸시 문구 고정+zoom=1 딥링크+fire-only 발송 ②딥링크 진입 시 자동 ack+줌 직행 ③미완성 초안 카드→폼로드→in-place 확정(신규 레코드 금지) ④줌 뷰어 라이브↔경보 시점 토글 ⑤OCR 발생장소 1회 prefill(사용자 입력 미덮음·플래그 상수 격리)
**Verified:** 2026-08-03T13:10:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

커밋 3건(`7a8fc019`, `b2821a67`, `035a8d26`) 모두 `production` 브랜치 히스토리에 존재함을 `git log`로 확인. `npx tsc --noEmit` 및 `npm run build` 를 이 검증에서 직접 재실행해 SUMMARY.md 주장과 별개로 통과를 재확인함(둘 다 클린 통과, 에러 0).

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | fire 푸시 본문이 `화재경보 발생, 수신반 확인 필요` 로 고정(시각·위치·OCR 접미 없음) | ✓ VERIFIED | `functions/_lib/push.ts:215` — `t === 'fire' ? '화재경보 발생, 수신반 확인 필요' : ...` (fire 분기만 접미 없는 상수 문자열, non-fire 는 기존 동적 문자열 그대로 유지) |
| 2 | fire 푸시 탭 → `/inspection?panel=fire-alarm&zoom=1` → 라이브 확대뷰 직행(모바일+데스크톱) | ✓ VERIFIED | `push.ts:216` url 고정. `sw.ts:71` `data.url` 우선 사용(무변경, 기존 로직이 이미 새 url 을 그대로 소비). 모바일: `InspectionPage.tsx:3690`(panel=fire-alarm→모달 오픈, 기존)+`4431-4434`(zoom=1→setZoomOpen, 신규). 데스크톱: `5179-5186`(panel=fire-alarm→pane 오픈+zoom=1→setPanelZoomOpen, 신규) |
| 3 | trigger 가 fire 아니면 푸시 미발송(panel_alarms 기록·dedupe·응답은 유지) | ✓ VERIFIED | `functions/api/alarm/trigger.ts:91-99` — `if (type === 'fire') { pushToWorkingStaff(...); 무장 UPDATE }` 로 감싸짐. 상단 INSERT(72-76)·dedupe(51-69)·자동초안(80-87)·최종 응답(101-104)은 조건 밖(무변경) |
| 4 | 화재수신반 진입 시 활성 fire 경보가 있으면 자동 ack, 평시(활성경보 없음)는 영향 0 | ✓ VERIFIED | 모바일 `4436-4446`: `if (activeAlarm?.type === 'fire' && activeAlarm.status === 'active')` 만 `alarmApi.ack` 1회 호출(useRef 로 중복 방지). 데스크톱 `5188-5199`: 동일 조건 + `isPanel` 게이트 추가. 조건 불충족(활성경보 없음)이면 effect 본문이 아예 실행되지 않음 |
| 5 | 해제된 미확정 초안(created_by='panel-agent')이 카드로 노출, 탭→폼로드→저장 시 in-place 확정(신규 레코드 없음) | ✓ VERIFIED | GET `?drafts=1`(`fire-alarm/index.ts:13-38`): `far.created_by='panel-agent' AND (pa.status IS NULL OR pa.status NOT IN ('active','acked'))`. PUT(`92-118`): `UPDATE fire_alarm_records ... WHERE id=? AND created_by='panel-agent'`, INSERT 없음. 클라 `loadDraft`(모바일 4474, 데스크톱 5226)로 폼 채움 → `handleSave`/`handlePanelSave` 의 `loadedDraftId` 우선분기(4495-4500, 5273-5277)가 `confirmDraft` 호출 |
| 6 | 줌 뷰어 라이브↔경보시점 전환(활성/초안 스냅샷 존재 시) | ✓ VERIFIED | `zoomSnapKey = draftSnapKey ?? activeAlarm?.snapshotKey ?? null`(모바일 4488, 데스크톱 동형 5240). 키 존재 시에만 pill 렌더(4794, 5954), `LivePanelImage snapshotKey={..}` 분기 렌더(4811-4813, 5969-5971). `LivePanelImage.tsx` 는 `snapshotKey` prop 을 이미 지원(고정 URL 렌더) |
| 7 | OCR 위치 존재 시 발생장소 1회 prefill, 사용자 입력 미덮음, 플래그 상수 1개로 격리 | ✓ VERIFIED | `OCR_LOCATION_PREFILL = true` 모듈 스코프 1곳 선언(4349), 모바일/데스크톱 공유. Active-alarm prefill: `setLocation(prev => prev ? prev : snap.location)`(4461, 5256) — 빈 값일 때만 채움. `prefilledRef`/`panelPrefilledRef` 로 1회만 실행 |

**Score:** 7/7 truths verified at code level

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `functions/_lib/push.ts` | fire 본문 고정 + url zoom=1 딥링크 | ✓ VERIFIED | 205-228행, `panel=fire-alarm&zoom=1` 포함 |
| `functions/api/fire-alarm/index.ts` | 초안 목록 GET(?drafts=1) + 확정 PUT | ✓ VERIFIED | `onRequestGet`/`onRequestPost`/`onRequestPut` 모두 export, drafts 분기가 year 검사보다 먼저 위치 |
| `src/utils/api.ts` | `fireAlarmApi.getDrafts/confirmDraft` + `Alarm.snapshotKey` | ✓ VERIFIED | 158-178행(FireAlarmDraft/getDrafts/confirmDraft), 757행(Alarm.snapshotKey) |
| `src/pages/InspectionPage.tsx` | 모바일 모달·데스크톱 pane 자동ack·zoom직행·초안카드·스냅샷토글·OCR prefill | ✓ VERIFIED | `OCR_LOCATION_PREFILL` 포함, 모바일(4349-4819)·데스크톱(5176-5975) 양쪽 5동선 확인 |
| `functions/_lib/alarm.ts` | `mapAlarm.snapshotKey` 원본 노출 | ✓ VERIFIED | 59행 `snapshotKey: r.snapshot_key ?? null` 추가, 기존 `snapshotUrl` 유지 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `push.ts buildPanelPayload` | `sw.ts notificationclick` | `data.url` | ✓ WIRED | sw.ts 는 이 플랜에서 무변경이지만 이미 `data.url` 을 최우선으로 소비(71행) — 새 url 이 그대로 딥링크로 흐름 |
| `fire-alarm/index.ts` (drafts GET/PUT) | `InspectionPage.tsx` 초안 카드 | `fireAlarmApi.getDrafts/confirmDraft` | ✓ WIRED | 모바일 4467-4512, 데스크톱 5219-5289 양쪽 모두 쿼리+로드+저장 3분기 연결 확인 |
| `alarm.ts mapAlarm.snapshotKey` | `LivePanelImage` | `zoomSnapKey`/`panelZoomSnapKey` | ✓ WIRED | `activeAlarm?.snapshotKey` 가 Alarm 타입에 존재(api.ts 757)하고 줌 뷰어에서 실제 소비됨 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| 초안 카드(모바일/데스크톱) | `drafts`/`panelDrafts` | `fireAlarmApi.getDrafts()` → `GET /fire-alarm?drafts=1` → D1 JOIN 쿼리(실 SELECT, static 반환 아님) | 예 | ✓ FLOWING |
| 줌 뷰어 스냅샷 | `zoomSnapKey`/`panelZoomSnapKey` | `draftSnapKey`(초안) 또는 `activeAlarm.snapshotKey`(mapAlarm 실 컬럼) | 예 | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 전체 TypeScript 컴파일 | `npx tsc --noEmit` (검증 세션에서 직접 재실행) | exit 0, 에러 0 | ✓ PASS |
| 프로덕션 번들 빌드 | `npm run build` (검증 세션에서 직접 재실행) | `✓ built in 16.81s` + SW precache 생성 완료 | ✓ PASS |
| resolve.ts/FireAlarmPage.tsx/panel/maint.ts 무변경 | `git diff 7a8fc019~1 035a8d26 --stat` | 6개 파일만 변경 목록에 존재(resolve.ts, FireAlarmPage.tsx, functions/api/panel/* 미포함) | ✓ PASS |
| API 엔드포인트 실호출(curl) | 미실행 | — | ? SKIP (프로덕션 DB 대상 서버 기동/실호출은 이 검증 범위 밖 — 서버 미기동 정책) |

### Requirements Coverage

이 태스크는 quick 워크플로 산출물이며 `.planning/REQUIREMENTS.md` 에 TAN-01~05 항목이 없음(quick 태스크는 통상 REQUIREMENTS.md 비연동, orphaned 아님). PLAN frontmatter 의 `requirements: [TAN-01..05]` 는 위 관찰 진실(#1~#7)로 전량 커버됨.

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| TAN-01 | fire 본문 고정·zoom=1 url·fire-only 발송 | ✓ SATISFIED | 진실 #1, #3 |
| TAN-02 | 딥링크 zoom 직행 + 활성 fire 자동 ack | ✓ SATISFIED | 진실 #2, #4 |
| TAN-03 | 고아 초안 카드·in-place 확정 | ✓ SATISFIED | 진실 #5 |
| TAN-04 | 줌 뷰어 라이브↔경보시점 전환 | ✓ SATISFIED | 진실 #6 |
| TAN-05 | OCR 1회 prefill·미덮음·플래그 격리 | ✓ SATISFIED | 진실 #7 |

### Anti-Patterns Found

없음. 변경된 6개 파일에 `TBD|FIXME|XXX|TODO|HACK|PLACEHOLDER|not implemented` 매칭 0건.

### 사용자 지정 회귀 항목 재확인

| 항목 | 결과 |
|------|------|
| resolve/create 분기 무변경 | ✓ `functions/api/alarm/[id]/resolve.ts` git diff 0줄(완전 무변경). 클라 저장 3분기는 `loadedDraftId` 없을 때만 기존 `resolve`(경보중)/`create`(평시) 순서를 그대로 호출 |
| FireAlarmPage 무변경 | ✓ `src/pages/FireAlarmPage.tsx` 커밋 diff 대상에 없음 |
| 점검모드 초안 폐기 무변경 | ✓ `functions/api/panel/` 디렉터리 diff 0(handlePanelMaintToggle 의 `confirmAlarm:true` 재시도 로직 무변경) |
| 평시(경보 없음) 진입 시 자동 ack 미발동 | ✓ 자동ack useEffect 조건이 `activeAlarm?.type==='fire' && status==='active'` — 활성 fire 경보 없으면 effect 본문 스킵. 정적 코드상 보장되나 실제 폴링 타이밍/경보 상태 전이는 런타임 확인 필요(human_verification #2) |
| PUT 초안 확정이 panel-agent 초안에만 작동 + 확정 시 created_by 교체 | ✓ `WHERE id=? AND created_by='panel-agent'` 가드, `SET ... created_by=?`(staffId 바인딩)로 확정 시 소유자 교체됨. 단, id 가 panel-agent 초안이 아니면 UPDATE 가 0행에 매치되어도 여전히 `{success:true}` 를 반환하는 점은 확인됨(에러 없이 조용히 no-op) — 위협모델 상 "덮어쓰기 차단" 의도는 달성되나 클라 UX 피드백은 없음(사소, 차단 아님) |
| 이력 병합뷰(panelEvents)와 초안 카드 이중 노출 없음 | ✓ `src/utils/panelEvents.ts:43` `normalizeManual` 이 `created_by !== 'panel-agent'` 만 병합뷰에 포함 — panel-agent 초안은 확정 전까지 병합뷰(수동기록 쪽)에 나타나지 않음. 확정(PUT) 이후 `created_by` 가 staffId 로 바뀌면 그때부터 병합뷰에 등장 + 동시에 drafts GET 필터(`created_by='panel-agent'`)에서 빠져 초안 카드에서 사라짐 → 시점이 겹치지 않아 이중 노출 없음. (단, panel_alarms 의 `auto` 이벤트 목록에는 cleared 상태의 원본 화재 감지 행 자체는 계속 남는데, 이는 이 플랜 이전부터의 기존 동작이며 초안 카드와 동일 UI 요소가 아니라 이중 노출로 보지 않음) |

## Deferred / Human Verification Required

7개 must-have 는 코드 레벨(존재·실질성·배선·데이터흐름)에서 전량 VERIFIED 이지만, 이 기능은 실제 push 구독·화재수신반 하드웨어 캡처·OCR 파이프라인·실기기 SW 동작에 강하게 결합되어 있어 정적 판독만으로 런타임 동작을 단정할 수 없다(프로젝트 메모리 `feedback_no_runtime_claims_from_static_read.md` 원칙에 따름). 아래 5개 항목은 실제 다음 화재경보 발생 시 또는 실기기 조작으로 확인이 필요하다.

1. fire push 수신+딥링크 탭 → 줌뷰어 직행
2. 자동 ack 실동작(활성 fire 시에만, 평시 무영향)
3. 초안 카드 탭→저장→D1 in-place 확정(신규 레코드 미생성) 실측
4. 줌 뷰어 라이브↔경보시점 이미지 전환
5. 다음 실경보 OCR 위치 1회 prefill(메모리 `project_panel_agent_monitoring.md` 잔여 항목과 일치)

## Gaps Summary

코드 레벨 블로커 없음. 5가지 소극화 동선(TAN-01~05) 모두 서버·클라이언트에 실질적으로 구현·배선되어 있고, 기존 동작(resolve/create 분기, FireAlarmPage, 점검모드 초안 폐기)은 git diff 로 무변경이 직접 확인됨. `npx tsc --noEmit`·`npm run build` 를 이 검증 세션에서 독립 재실행해 통과를 재확인했다. 상태를 `human_needed` 로 분류한 이유는 실패 항목이 있어서가 아니라, 하드웨어/푸시/OCR 통합 특성상 실기기·실경보 검증 없이는 "동작한다"를 완전히 단정할 수 없기 때문이다.

---

_Verified: 2026-08-03T13:10:00Z_
_Verifier: Claude (gsd-verifier)_

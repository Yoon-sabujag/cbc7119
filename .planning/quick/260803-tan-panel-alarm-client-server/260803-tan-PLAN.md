---
phase: quick-260803-tan
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - /Users/jykevin/Documents/20260328/cha-bio-safety/functions/_lib/push.ts
  - /Users/jykevin/Documents/20260328/cha-bio-safety/functions/api/alarm/trigger.ts
  - /Users/jykevin/Documents/20260328/cha-bio-safety/functions/_lib/alarm.ts
  - /Users/jykevin/Documents/20260328/cha-bio-safety/functions/api/fire-alarm/index.ts
  - /Users/jykevin/Documents/20260328/cha-bio-safety/src/utils/api.ts
  - /Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/InspectionPage.tsx
autonomous: true
requirements: [TAN-01, TAN-02, TAN-03, TAN-04, TAN-05]

must_haves:
  truths:
    - "fire 푸시 본문이 '화재경보 발생, 수신반 확인 필요' 로 고정된다 (시각·위치·OCR 접미 없음)"
    - "fire 푸시 탭 → /inspection?panel=fire-alarm&zoom=1 → 라이브 확대뷰(줌 뷰어) 직행 (모바일+데스크톱)"
    - "trigger 가 fire 가 아니면 푸시를 발송하지 않는다 (panel_alarms 기록·dedupe·응답은 그대로)"
    - "화재수신반 진입 시 활성 fire 경보가 있으면 자동 ack 되어 재발송이 멈춘다 (평시=활성경보 없음=영향 0)"
    - "해제된 미확정 초안(created_by='panel-agent')이 화재수신반 페이지에 카드로 노출되고, 탭→폼 로드→저장 시 초안이 in-place 확정된다 (신규 레코드 없음)"
    - "줌 뷰어에서 '라이브 ↔ 경보 시점' 전환으로 경보 시점 캡처를 볼 수 있다 (활성경보 또는 초안 연결 스냅샷 존재 시)"
    - "OCR 위치가 존재하면 발생장소가 1회 prefill 되고 사용자 입력을 덮지 않으며, 플래그 상수 하나로 끌 수 있다"
  artifacts:
    - path: "/Users/jykevin/Documents/20260328/cha-bio-safety/functions/_lib/push.ts"
      provides: "fire 본문 고정 + url zoom=1 딥링크"
      contains: "panel=fire-alarm&zoom=1"
    - path: "/Users/jykevin/Documents/20260328/cha-bio-safety/functions/api/fire-alarm/index.ts"
      provides: "초안 목록 GET(?drafts=1) + 초안 확정 PUT(onRequestPut)"
      exports: ["onRequestGet", "onRequestPost", "onRequestPut"]
    - path: "/Users/jykevin/Documents/20260328/cha-bio-safety/src/utils/api.ts"
      provides: "fireAlarmApi.getDrafts/confirmDraft + Alarm.snapshotKey"
      contains: "confirmDraft"
    - path: "/Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/InspectionPage.tsx"
      provides: "모바일 모달·데스크톱 pane 자동ack·zoom 직행·초안카드·스냅샷 토글·OCR prefill"
      contains: "OCR_LOCATION_PREFILL"
  key_links:
    - from: "functions/_lib/push.ts buildPanelPayload"
      to: "src/sw.ts notificationclick data.url"
      via: "fire payload url = /inspection?panel=fire-alarm&zoom=1"
      pattern: "panel=fire-alarm&zoom=1"
    - from: "functions/api/fire-alarm/index.ts (drafts GET / PUT)"
      to: "src/pages/InspectionPage.tsx 초안 카드"
      via: "fireAlarmApi.getDrafts / confirmDraft"
      pattern: "getDrafts|confirmDraft"
    - from: "functions/_lib/alarm.ts mapAlarm.snapshotKey"
      to: "components/panel/LivePanelImage snapshotKey"
      via: "Alarm.snapshotKey → 줌 뷰어 '경보 시점' 렌더"
      pattern: "snapshotKey"
---

<objective>
차바이오 소방앱(cha-bio-safety)의 화재수신반 경보 소극화 2단계(quick-B, 서버+클라이언트)를 구현한다. 형제 플랜 quick-260803-sea 가 에이전트를 fire-only·즉시발보·재발송 티커로 바꾼 데 이어, 이 플랜은 서버 계약(푸시 문구/딥링크/초안 API/스냅샷 노출)과 클라이언트(모바일 FireAlarmModal + 데스크톱 화재수신반 pane)의 5가지 소극화 동선을 완성한다.

범위 5가지(LOCKED · 메모리 project_panel_bell_alarm_plan.md 와 동일):
① 푸시 문구 고정 + zoom=1 딥링크 + fire-only 발송 (서버)
② 딥링크 진입 시 자동 ack + 라이브 확대뷰 직행 (클라)
③ 미완성 초안 불러오기 → in-place 확정 (서버 API 보강 + 클라 카드)
④ 줌 뷰어 '라이브 ↔ 경보 시점' 전환 (클라, 서버는 snapshotKey 노출)
⑤ OCR 발생장소 1회 시험 prefill (플래그 상수 격리)

Purpose: 실제 대응 신호(화재)에만 푸시를 집중시키고, 방재팀이 푸시 한 번으로 라이브 확대뷰에 도달·재발송을 멈추며, 고아 초안을 이어서 확정 저장할 수 있게 한다.
Output: 서버 4파일 + api.ts + InspectionPage.tsx 수정. 빌드 검증 후 커밋. 배포(wrangler)는 오케스트레이터/사용자 몫(이 콘솔=production, 서브에이전트 배포 금지).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@cha-bio-safety/functions/_lib/push.ts
@cha-bio-safety/functions/api/alarm/trigger.ts
@cha-bio-safety/functions/api/alarm/[id]/resolve.ts
@cha-bio-safety/functions/api/fire-alarm/index.ts
@cha-bio-safety/functions/_lib/alarm.ts
@cha-bio-safety/src/utils/api.ts
@cha-bio-safety/src/pages/InspectionPage.tsx
@cha-bio-safety/src/components/panel/LivePanelImage.tsx
@cha-bio-safety/src/sw.ts

주의(사전 조사로 확정된 사실):
- resolve.ts 는 status==='cleared' 일 때 18행에서 멱등 early-return 하므로 **해제된 경보의 초안을 갱신하지 않는다**. 따라서 ③은 fire-alarm/index.ts 에 초안 목록 GET + 초안 확정 PUT 을 추가한다(신규 라우트 0, 기존 핸들러 확장). resolve.ts 는 무변경.
- LivePanelImage 는 이미 snapshotKey prop 을 지원(고정 URL 렌더). mapAlarm 은 snapshotUrl(전체 경로)만 노출하므로 raw snapshotKey 를 추가 노출한다.
- 모바일 딥링크 핸들러(InspectionPage 3688~3693)는 zoom=1 미처리·ack 없음. 데스크톱 pane(5091~5101)은 zoom=1 처리는 있으나 ack 없음.
- 기존 FireAlarmPage(/fire-alarm)·resolve/create 저장 분기·점검모드 confirmAlarm 초안 폐기 동작은 모두 무변경. 초안 경로만 추가한다.
- 신규 카드/토글 UI 는 기존 FireAlarmModal 의 토큰·컴포넌트 스타일을 그대로 따른다(새 디자인 언어 도입 금지).
</context>

<tasks>

<task type="auto">
  <name>Task 1: 서버 + API 계약 (푸시 문구·zoom 딥링크·fire-only·초안 API·snapshotKey)</name>
  <files>
    /Users/jykevin/Documents/20260328/cha-bio-safety/functions/_lib/push.ts
    /Users/jykevin/Documents/20260328/cha-bio-safety/functions/api/alarm/trigger.ts
    /Users/jykevin/Documents/20260328/cha-bio-safety/functions/_lib/alarm.ts
    /Users/jykevin/Documents/20260328/cha-bio-safety/functions/api/fire-alarm/index.ts
    /Users/jykevin/Documents/20260328/cha-bio-safety/src/utils/api.ts
  </files>
  <action>
① (TAN-01) push.ts buildPanelPayload(205~226행): fire 분기만 변경한다. fire 일 때 body 를 정확히 `화재경보 발생, 수신반 확인 필요` (verbatim, 시각·loc 접미 없음)로, url 을 `/inspection?panel=fire-alarm&zoom=1` 로 한다. title 은 fire=`🔴 화재수신반 경보` 유지. fault/equip 분기의 body·loc·url 은 손대지 않는다(어차피 아래에서 발송 안 되지만 기존 문자열 보존).

① (TAN-01) trigger.ts(89~98행): 푸시 발송·무장을 fire 전용으로 격리한다. `if (type === 'fire') { const payload = buildPanelPayload({...}); const sent = await pushToWorkingStaff(...); await logTelemetry(...); await env.DB.prepare('UPDATE panel_alarms SET push_count=1, next_push_at=? WHERE id=?')... }` 형태로, fire 가 아니면 pushToWorkingStaff·next_push_at 무장을 **건너뛴다**. 상단의 panel_alarms INSERT(73~76)·dedupe(51~69)·자동초안 생성(78~87)·최종 응답(100~103)은 그대로 둔다. (에이전트는 이미 fire 만 보내지만 이중 방어.)

④ (TAN-04) alarm.ts mapAlarm(49~79행): 반환 객체에 `snapshotKey: r.snapshot_key ?? null` 를 추가한다(기존 snapshotUrl 은 유지). 필드 추가만이라 기존 소비처 무영향.

③ (TAN-03) fire-alarm/index.ts:
  - onRequestGet 에 초안 분기를 추가한다. `url.searchParams.get('drafts')` 가 truthy 면, fire_alarm_records far 를 panel_alarms pa 에 LEFT JOIN(`pa.draft_record_id = far.id`) 하여, `far.created_by = 'panel-agent' AND (pa.status IS NULL OR pa.status NOT IN ('active','acked'))` 인 행만 `far.occurred_at DESC LIMIT 20` 로 조회한다(활성/인지 경보의 초안은 resolve 경로가 처리하므로 제외 = 고아 초안만). SELECT: far.id, far.type, far.occurred_at, far.location, far.cause, far.action, pa.id AS alarm_id, pa.location AS alarm_location, pa.snapshot_key AS snapshot_key. 반환 shape(각 행): `{ id, type, occurredAt: occurred_at, location, cause, action, alarmId: alarm_id, ocrLocation: alarm_location, snapshotKey: snapshot_key }`. 이 분기는 year/recent 검사보다 먼저 둔다.
  - onRequestPut 를 신설한다(초안 in-place 확정). body `{ id: string; type: 'fire'|'non_fire'; occurred_at?: string; location: string; cause: string; action: string }`. staffId 는 `data as any`. type 검증(fire|non_fire, 아니면 400), id 없으면 400. `UPDATE fire_alarm_records SET type=?, occurred_at=COALESCE(?, occurred_at), location=?, cause=?, action=?, created_by=? WHERE id=? AND created_by='panel-agent'` (created_by 가드로 사용자 확정 레코드 재확정 방지 = 멱등 안전). 반환 `{ success: true, data: { id } }`. 신규 fire_alarm_records INSERT 는 절대 하지 않는다(초안 확정 = UPDATE only).

③④⑤ (TAN-03/04/05) api.ts:
  - Alarm 인터페이스(734~762행)에 `snapshotKey?: string | null` 추가.
  - fireAlarmApi(158~163행)에 `getDrafts: () => req<FireAlarmDraft[]>('/fire-alarm?drafts=1')` 와 `confirmDraft: (id: string, body: { type: 'fire'|'non_fire'; occurred_at: string; location: string; cause: string; action: string }) => req<{ id: string }>('/fire-alarm', { method: 'PUT', body: JSON.stringify({ id, ...body }) })` 추가.
  - `FireAlarmDraft` 인터페이스 export 신설: `{ id: string; type: string; occurredAt: string; location: string; cause: string; action: string; alarmId: string | null; ocrLocation: string | null; snapshotKey: string | null }`.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit && grep -Fq '화재경보 발생, 수신반 확인 필요' functions/_lib/push.ts && grep -Fq 'panel=fire-alarm&zoom=1' functions/_lib/push.ts && grep -q 'onRequestPut' functions/api/fire-alarm/index.ts && grep -q "drafts" functions/api/fire-alarm/index.ts && grep -q 'snapshotKey' functions/_lib/alarm.ts && grep -q 'getDrafts' src/utils/api.ts && grep -q 'confirmDraft' src/utils/api.ts && grep -q 'FireAlarmDraft' src/utils/api.ts</automated>
  </verify>
  <done>tsc 통과. push.ts fire 본문·url 변경, trigger.ts fire-only 발송 가드, alarm.ts snapshotKey 노출, fire-alarm/index.ts drafts GET + onRequestPut 추가, api.ts getDrafts/confirmDraft/FireAlarmDraft/Alarm.snapshotKey 추가 완료.</done>
</task>

<task type="auto">
  <name>Task 2: 모바일 FireAlarmModal — 자동ack·zoom 직행·초안 카드·스냅샷 토글·OCR prefill</name>
  <files>/Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/InspectionPage.tsx</files>
  <action>
FireAlarmModal(4347~4739행)과 파일 상단에 아래를 추가한다. 폼 5필드·resolve/create 저장 분기·점검모드 토글 등 기존 동작은 보존하고 초안·자동ack·스냅샷 경로만 얹는다.

⑤ (TAN-05) 플래그 상수: 파일 모듈 스코프(컴포넌트 밖, 예: FireAlarmModal 정의 직전)에 `const OCR_LOCATION_PREFILL = true` 를 한 번 선언한다(데스크톱 pane 도 이 상수를 공유). 다음 실경보에서 무용 판정 시 이 상수 하나만 false 로 바꾸면 양쪽 prefill 이 죽는다.

② (TAN-02) zoom=1 직행: FireAlarmModal 안에서 `const [sp] = useSearchParams()`(import 는 3행에 이미 있음)로 param 을 읽어, 마운트 시 `sp.get('zoom') === '1'` 이면 `setZoomOpen(true)` 하는 useEffect 를 추가한다(1회, 의존성 빈 배열 또는 sp).

② (TAN-02) 자동 ack: `autoAckedRef = useRef(false)` 를 추가하고, activeAlarm 이 settle 되어 fire 이며 아직 ack 안 했으면 1회 `await alarmApi.ack(activeAlarm.id)` 후 `qc.invalidateQueries({ queryKey: ['alarm-active'] })` 하는 useEffect 를 추가한다(try/catch 로 미배포 폴백, 멱등이므로 중복 무해). 활성 fire 경보가 없으면 아무 것도 안 함 → 평시 진입 영향 0.

⑤ (TAN-05) active 경보 OCR prefill: 기존 prefill effect(4428~4440)에서 snap(openAlarmRef) 이 있을 때, date/time/type 설정에 이어 `if (OCR_LOCATION_PREFILL && snap.location) setLocation(prev => prev ? prev : snap.location)` 를 추가한다(빈 값일 때만 = 사용자 입력 무덮음).

③ (TAN-03) 초안 카드: `const { data: drafts = [] } = useQuery({ queryKey: ['fire-alarm-drafts'], queryFn: async () => { try { return await fireAlarmApi.getDrafts() } catch { return [] } }, staleTime: 30_000 })` 를 추가. 상태 `const [loadedDraftId, setLoadedDraftId] = useState<string|null>(null)` 와 `const [draftSnapKey, setDraftSnapKey] = useState<string|null>(null)` 추가. mode !== 'alarm' 일 때만, '최근 이벤트' 카드(4586~4601)와 폼 사이에 초안 카드 섹션을 렌더한다(drafts.length > 0 조건). 각 초안은 기존 evt-card·form-card 토큰(bg-surface-raised, border-border-default, rounded-md 등)을 따르는 탭 가능한 행으로: 제목 `미작성 화재경보 기록`, 부제 `{occurredAt} · 이어서 작성`. 탭 핸들러: 폼에 초안 로드 — occurredAt 을 date/time 으로 분해 setDate/setTime, setType(draft.type === 'fire' ? 'fire' : 'non_fire'), setCause(draft.cause || '오작동'), setAction(draft.action || '자동복구, 현장확인'), 발생장소는 `setLocation(draft.location || (OCR_LOCATION_PREFILL ? (draft.ocrLocation ?? '') : ''))`; setLoadedDraftId(draft.id); setDraftSnapKey(draft.snapshotKey ?? null). 폼으로 스크롤/포커스는 선택.

③ (TAN-03) 저장 3분기: handleSave(4442~4462) 를 확장한다. 우선순위: `if (loadedDraftId) { await fireAlarmApi.confirmDraft(loadedDraftId, { type, occurred_at: \`${date} ${time}:00\`, location, cause, action }); qc.invalidateQueries(['fire-alarm-drafts']); qc.invalidateQueries(['fire-alarm-recent']); qc.invalidateQueries(['fire-alarm-year']) }` → else if (snap) resolve(기존) → else create(기존). resolve/create 성공 후에도 `['fire-alarm-drafts']` invalidate 를 추가한다(초안 목록 갱신). 성공 토스트·onClose 는 공통.

④ (TAN-04) 줌 뷰어 '라이브 ↔ 경보 시점' 토글: 상태 `const [zoomSnap, setZoomSnap] = useState(false)` 추가. 유효 스냅샷 키 `const zoomSnapKey = draftSnapKey ?? activeAlarm?.snapshotKey ?? null` 계산. 줌 뷰어(4702~4736)에서 zoomSnapKey 가 있을 때만 상단 바(fsv-top, 4710~4719)에 라이브/경보시점 전환 pill 2개(기존 배지 토큰 스타일: 작은 rounded-pill, text-caption, 선택 시 강조)를 추가하고, 프레임의 LivePanelImage(4728) 를 `zoomSnap && zoomSnapKey ? <LivePanelImage snapshotKey={zoomSnapKey} objectClass="object-contain" /> : <LivePanelImage frameUpdatedAt={status?.frameUpdatedAt} objectClass="object-contain" />` 로 분기한다. zoomOpen 을 닫을 때 setZoomSnap(false) 로 초기화. zoomSnapKey 가 없으면 토글을 렌더하지 않고 기존 라이브 그대로.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit && grep -q 'OCR_LOCATION_PREFILL' src/pages/InspectionPage.tsx && grep -q "fire-alarm-drafts" src/pages/InspectionPage.tsx && grep -q 'autoAckedRef' src/pages/InspectionPage.tsx && grep -q 'zoomSnap' src/pages/InspectionPage.tsx && grep -q 'confirmDraft' src/pages/InspectionPage.tsx</automated>
  </verify>
  <done>tsc 통과. 모바일 FireAlarmModal: zoom=1 자동 열기, 활성 fire 자동 ack(1회·멱등), OCR 위치 1회 prefill(빈 값만), 초안 카드 노출·탭 로드, 저장 3분기(confirmDraft/resolve/create), 줌 뷰어 라이브↔경보시점 토글 완료.</done>
</task>

<task type="auto">
  <name>Task 3: 데스크톱 화재수신반 pane — 동일 5동선 이식 + 빌드 검증</name>
  <files>/Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/InspectionPage.tsx</files>
  <action>
데스크톱 pane(5040~5817행)에 Task 2 와 동형의 동선을 이식한다. 변수 접두 pa*/panel* 규약을 따르고 Task 2 에서 만든 모듈 상수 OCR_LOCATION_PREFILL 을 재사용한다(재선언 금지).

② (TAN-02) 자동 ack: `panelAutoAckedRef = useRef(false)` 추가. `isPanel` 이 true 이고 activeAlarm 이 settle·fire 이며 아직 ack 안 했으면 1회 `await alarmApi.ack(activeAlarm.id)` + invalidate(['alarm-active']) 하는 useEffect 추가(try/catch, 멱등). 기존 딥링크 effect(5094~5101)의 zoom=1 처리는 이미 있으므로 유지. 기존 takeover 모달(5759~5785)·handleAlarmAck 는 무변경(대시보드 진입 경로 유지).

⑤ (TAN-05) active 경보 OCR prefill: 기존 panel prefill effect(5123~5141)의 snap 분기에서 date/time/type 설정에 이어 `if (OCR_LOCATION_PREFILL && snap.location) setPaLocation(prev => prev ? prev : snap.location)` 추가.

③ (TAN-03) 초안 카드: `const { data: panelDrafts = [] } = useQuery({ queryKey: ['fire-alarm-drafts'], queryFn: async () => { try { return await fireAlarmApi.getDrafts() } catch { return [] } }, staleTime: 30_000 })`. 상태 `panelLoadedDraftId`(string|null), `panelDraftSnapKey`(string|null) 추가. panelMode !== 'alarm' 일 때 '최근 이벤트' 카드(5542~5557)와 수기 form-card(5560) 사이에 초안 카드 섹션(panelDrafts.length > 0)을 렌더 — 데스크톱 form-card 토큰 준수. 탭 핸들러: occurredAt→setPaDate/setPaTime 분해, setPaType(draft.type==='fire'?'fire':'non_fire'), setPaCause(draft.cause||'오작동'), setPaAction(draft.action||'자동복구, 현장확인'), `setPaLocation(draft.location || (OCR_LOCATION_PREFILL ? (draft.ocrLocation ?? '') : ''))`, setPanelLoadedDraftId(draft.id), setPanelDraftSnapKey(draft.snapshotKey ?? null). isPanel 이 false 로 벗어날 때(5136~5140 else 블록)에 panelLoadedDraftId/panelDraftSnapKey 도 리셋한다.

③ (TAN-03) 저장 3분기: handlePanelSave(5143~5162) 를 확장 — `if (panelLoadedDraftId) confirmDraft(...) → else if (snap) resolve → else create`. confirmDraft body 는 Task 2 와 동일 형식(occurred_at=`${paDate} ${paTime}:00`, location=paLocation, cause=paCause, action=paAction). 모든 분기 성공 후 `['fire-alarm-drafts']` invalidate 추가. 성공 토스트·setCategoryIdx(null) 공통.

④ (TAN-04) 줌 뷰어 토글: 상태 `panelZoomSnap`(boolean, 기본 false) 추가. `const panelZoomSnapKey = panelDraftSnapKey ?? activeAlarm?.snapshotKey ?? null`. 데스크톱 줌 오버레이(5787~5814)에서 panelZoomSnapKey 존재 시 zoom-badge 줄(5794~5803)에 라이브/경보시점 전환 pill 2개(데스크톱 토큰: text-body-sm, rounded-pill)를 추가하고, LivePanelImage(5810) 를 `panelZoomSnap && panelZoomSnapKey ? snapshotKey 렌더 : 기존 라이브 렌더` 로 분기. 줌 닫기(5790)에 setPanelZoomSnap(false) 추가.

이 태스크 마지막에 프로덕션 번들 빌드까지 확인한다.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit && grep -q 'panelAutoAckedRef' src/pages/InspectionPage.tsx && grep -q 'panelDraftSnapKey' src/pages/InspectionPage.tsx && grep -q 'panelZoomSnap' src/pages/InspectionPage.tsx && grep -q 'panelLoadedDraftId' src/pages/InspectionPage.tsx && npm run build</automated>
  </verify>
  <done>tsc + npm run build 통과. 데스크톱 pane: 활성 fire 자동 ack, OCR 위치 prefill, 초안 카드·탭 로드·isPanel 이탈 시 리셋, 저장 3분기(confirmDraft/resolve/create), 줌 뷰어 라이브↔경보시점 토글 완료. 기존 takeover 모달·resolve/create·점검모드 초안 폐기 동작 무변경.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client→API (JWT) | 초안 목록 GET / 초안 확정 PUT / 자동 ack POST — 로그인 근무자 |
| 무인증 정적 서빙 | /api/public/panel/*.jpg (경보 스냅샷) — 설계상 무인증(기존) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-tan-01 | Tampering | PUT /api/fire-alarm (confirmDraft) | mitigate | UPDATE ... WHERE id=? AND created_by='panel-agent' — 사용자 확정 레코드 재확정·임의 레코드 덮어쓰기 차단. 신규 INSERT 없음(UPDATE only). |
| T-tan-02 | Elevation | 초안 목록 GET(?drafts=1) | mitigate | _middleware JWT 게이트 하위 라우트(공개 예외 아님) → 근무자만 조회. 읽기 전용. |
| T-tan-03 | Info Disclosure | /api/public/panel/*.jpg 스냅샷 | accept | 기존 무인증 서빙 정책(4인 내부망, 저가치). key 는 nanoid 로 열거 곤란. 정책 변경 아님. |
| T-tan-SC | Tampering | npm/pip/cargo installs | mitigate | 신규 패키지 설치 없음 — 해당 없음. |
</threat_model>

<verification>
- fire 푸시: buildPanelPayload fire body == `화재경보 발생, 수신반 확인 필요`, url == `/inspection?panel=fire-alarm&zoom=1`. non-fire 는 pushToWorkingStaff 미호출(trigger.ts fire 가드).
- 초안 API: `GET /api/fire-alarm?drafts=1` 는 created_by='panel-agent' 이면서 연결 경보가 active/acked 아닌 행만 반환. `PUT /api/fire-alarm` 는 created_by 가드 하에 in-place UPDATE(신규 레코드 0).
- 클라 3분기 저장: loadedDraftId→confirmDraft, snap→resolve, 그 외→create. 세 경로 모두 ['fire-alarm-drafts'] invalidate.
- 자동 ack: 화재수신반 진입 + 활성 fire → alarmApi.ack 1회. 평시(활성경보 없음) → 무호출.
- 줌 뷰어: snapshot key 존재 시에만 라이브↔경보시점 토글 렌더, 경보시점 선택 시 LivePanelImage snapshotKey 렌더.
- OCR prefill: OCR_LOCATION_PREFILL 게이트 + 빈 값일 때만 setLocation/setPaLocation(사용자 입력 무덮음).
- 전역: `npx tsc --noEmit` + `npm run build` 통과. resolve.ts·FireAlarmPage·takeover 모달·점검모드 confirmAlarm 동작 무변경.
</verification>

<success_criteria>
- [ ] TAN-01: fire 본문 고정·zoom=1 url·fire-only 발송(패널 기록 유지)
- [ ] TAN-02: 딥링크 zoom 직행 + 활성 fire 자동 ack (모바일+데스크톱)
- [ ] TAN-03: 고아 초안 카드 노출·탭 로드·저장 시 in-place 확정(신규 레코드 없음)
- [ ] TAN-04: 줌 뷰어 라이브↔경보시점 전환(활성/초안 스냅샷)
- [ ] TAN-05: OCR 위치 1회 prefill·미덮음·플래그 상수 1개 격리
- [ ] tsc + build 통과, 기존 동작(resolve/create·FireAlarmPage·takeover·점검모드) 무변경
</success_criteria>

<output>
Create `.planning/quick/260803-tan-panel-alarm-client-server/260803-tan-SUMMARY.md` when done
</output>

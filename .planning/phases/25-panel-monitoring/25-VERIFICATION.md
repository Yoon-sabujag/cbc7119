---
phase: 25-panel-monitoring
verified: 2026-07-01T00:00:00Z
status: human_needed
score: 8/8 code-level success criteria verified (visual UAT pending)
overrides_applied: 0
re_verification:
  previous_status: none
  note: initial verification
human_verification:
  - test: "메인 머지 후 cbc7119-preview 에서 모바일 대시보드 열기 (평상시/경보중/점검모드 상태 강제)"
    expected: "16:9 수신반 카드가 '오늘 점검 대상' 바로 아래 chrome-0 로 렌더 + 우측 칩이 경보중=빨강 blink / 점검=회색 무점멸 / 평상시=비움"
    why_human: "실제 렌더링·blink 애니메이션·색상은 픽셀 확인 필요 (grep 불가)"
  - test: "모바일 화재수신반 페이지 3-state 전환 (평상/경보/점검)"
    expected: "점검모드 토글 시 수기폼/formbar 숨김·라이브+이벤트 유지, 경보중 panel-notice+자동초안 폼, 라이브 카드 tap→줌 뷰어 더블탭 확대"
    why_human: "상태 전이·토글 인터랙션·줌 제스처는 런타임 동작"
  - test: "경보 풀스크린 /fire-alarm — fire(빨강 Flame) vs equip(초록 Settings) takeover + 확인(ACK)"
    expected: "화재=재발송 경고 문구·fawash blink·faring ring / 설비=단발 static, 확인 후 fire→화재수신반 / equip→대시보드 이동"
    why_human: "푸시 목적지·takeover 시각·애니메이션 확인 필요"
  - test: "데스크톱 대시보드 라이브 위젯 single-click vs double-click"
    expected: "클릭→일반점검(화재수신반 pane), 더블클릭→줌 오버레이 (240ms 판별)"
    why_human: "click/dblclick 타이밍 판별은 런타임 동작"
  - test: "데스크톱 일반점검 3분할 화재수신반 상세 pane (경보중/평상/점검)"
    expected: "헤더 아래 빨강 배너 없음(라이브 red+초안 안내만), 점검모드 토글이 정상라이브 pill+전체화면 버튼 대체, 경보 takeover modal, 줌 오버레이에 '핀치 투 줌' 텍스트 없음"
    why_human: "레이아웃·모달·오버레이 시각 확인 필요"
  - test: "SW 푸시 딥링크 (실 디바이스 PWA)"
    expected: "fire push tap→/fire-alarm, equip push tap→/inspection?panel=fire-alarm (data.url 우선, fallback 동작)"
    why_human: "Service Worker 푸시·notificationclick 은 실 디바이스 런타임에서만 검증 가능"
  - test: "모바일 배너 우측 '최근 수신반 이력'(latestAlarm) 스니펫 노출 정책 확인"
    expected: "UI-SPEC Surface 1 은 평상시 우측 슬롯 완전 비움을 명시 — 현재 코드는 latestAlarm 존재 시 '최근 수신반 이력' 스니펫을 상태 무관 렌더 (DashboardPage.tsx:648-658). 의도된 기존 동작인지 사용자 판단 필요"
    why_human: "SPEC 대비 사전 존재 동작의 유지/제거는 디자인 판단 (블로커 아님)"
---

# Phase 25: 화재수신반 원격감시·경보 UI (시안→TSX) Verification Report

**Phase Goal:** 방재실 화재수신반 미러링 라이브뷰와 색 기반 경보(빨강=화재 / 초록=설비동작) UI를 모바일·데스크톱에 구현한다. 순수 시각(sketch→TSX). 백엔드·데이터·에이전트는 별도 트랙(cbc7119-data).
**Verified:** 2026-07-01
**Status:** human_needed (all 8 code-level SCs VERIFIED; final visual/runtime UAT pending post-merge)
**Re-verification:** No — initial verification
**Branch:** feature/25-panel-monitoring (15 commits) · `npx tsc --noEmit` → exit 0 (independently re-run)

## Goal Achievement

### Observable Truths (8 ROADMAP Success Criteria)

| # | Truth (SC) | Status | Evidence (file:line) |
|---|-----------|--------|----------------------|
| 1 | Mobile dashboard 16:9 수신반 카드 (chrome-0, 오늘 점검 대상 아래, tap→화재수신반) + 우측 상태칩 (경보중 red-blink / 점검 gray / 평상시 empty) | ✓ VERIFIED | Card `DashboardPage.tsx:661-671` (`rounded-md overflow-hidden bg-black aspect-video`, `navigate('/inspection?panel=fire-alarm')`, positioned between banner :633-659 and 오늘 현황 :673). Chip component `PanelStateChip` :59-97 (경보중 chipblink+Flame+dot / 점검 회색 no-blink / 평상시 `return null`), mounted in banner right slot :642-647 |
| 2 | Mobile 화재수신반 페이지 = FireAlarmModal EXPANDED (header 점검모드 toggle / live card / 48h events / 5-field form; 3 states; 점검모드 hides form keeps live+events) | ✓ VERIFIED | `InspectionPage.tsx` — header BellRing+gh-maint toggle :5486-5497; 3 states via `mode` (normal/alarm/maint); maint-autonote :5508, panel-notice :5515, live-card tap→zoom :5522-5528, 48h events :5569, form hidden in maint `mode !== 'maint'` :5599, formbar hidden :5678, save label 조치완료/점검기록 :5690 |
| 3 | 경보 풀스크린 `/fire-alarm` + ACK (fire 재발송 경고 / equip 단발) | ✓ VERIFIED | `FireAlarmPage.tsx` full takeover :118-203, fire=Flame+fawash+faring+"확인을 눌러야 추가 푸시가 멈춥니다" :193-198, equip=Settings static+"재발송 없음"; ACK→`alarmApi.ack` then fire→/inspection?panel=fire-alarm, equip→/dashboard :55-70. Route `App.tsx:273` + BOTH no-nav lists (`MOBILE_NO_NAV_PATHS:73`, `DESKTOP_NO_NAV_PATHS:76`) |
| 4 | 줌 뷰어 (double-tap/pinch, scroll-lock ≠ body:fixed) | ✓ VERIFIED | `usePinchZoom.ts` (doubleTapScale 2.5 default, pinch dist/mid, toggle :76-84). Mobile viewer `InspectionPage.tsx:5390` + scroll-lock `body.style.overflow='hidden'` (NOT position:fixed) :5392-5404, 더블탭 hint :5728. Desktop overlay `panelZoom = usePinchZoom({maxScale:2.2})` :6089 |
| 5 | Desktop dashboard 라이브 위젯 (top of right column, shrink-0; click→일반점검, dblclick→zoom) | ✓ VERIFIED | `DashboardPage.tsx:460-510` — first child of right column (:458) before 미니 캘린더 (:512), `shrink-0` :461; `handlePanelClick`/`handlePanelDblClick` 240ms disambiguation :107-119 (click→`/inspection?panel=fire-alarm`, dbl→`&zoom=1`); LIVE/화재 badge :475-481, 정상/화재 caption+freshness :489-508 |
| 6 | Desktop 3-split 화재수신반 detail pane (live→(경보)초안+form→events→(평상)form; header toggle removes pill+fullscreen; no red banner; takeover modal; zoom overlay no 핀치 text) | ✓ VERIFIED | `InspectionPage.tsx` `isPanel` branch :6352; imode-switch toggle replaces 정상라이브 pill+전체화면 :6365-6373; maint-autonote banner :6383; biglive firepulse :6396; panel-notice+auto-draft form :6441-6464 ("나중에"+"조치완료 후 저장"); evt-card :6471; 평상시 form :6513-6530; alarm takeover modal :6708-6725 (am-ack+am-go); zoom overlay :6734-6756 ("줌 힌트 텍스트 없음" comment, hint removed) |
| 7 | lucide/emoji-0 (added lines) + dark tokens + header chrome (w-7=32) + 색=의미 + graceful 204/empty | ✓ VERIFIED | Phase-25 added files emoji-zero (grep pictograph → 0 in FireAlarmPage/panel/*/sw.ts; 0 in DashboardPage; the 5 emoji in InspectionPage all in PRE-EXISTING non-panel code — comments :3953/:4680, general inspection :4598, non-panel finding photos :6611/6619). lucide icons throughout (BellOff/BellRing/Flame/Settings/Maximize2/AlertTriangle/RefreshCw). Color=meaning fixed (danger #ef4444 / safe #22c55e / gray). Graceful: `LivePanelImage.tsx:44-51` onError→gray placeholder; all consumers `try{...}catch{return null/[]}`; freshness helper `freshness.ts` |
| 8 | SW deep-link — push forwards url + notificationclick navigates (fire→/fire-alarm, equip→/inspection?panel=fire-alarm) | ✓ VERIFIED | `sw.ts` push handler forwards `{type,url,alarmType}` to notification.data :39-46; notificationclick reads `data.url` with fallback (equip→/inspection?panel=fire-alarm, else /fire-alarm) :58-64, navigates via `existing.navigate(url)` else `openWindow(url)` :67-74 (replaces old always-`/`) |

**Score:** 8/8 code-level success criteria VERIFIED

### Critical Correctness Invariant — 경보중 저장 = resolve, NOT create

| Call site | Branch condition | 경보중 | 평상시 | Status |
|-----------|------------------|--------|--------|--------|
| Mobile FireAlarmModal `handleSave` `InspectionPage.tsx:5423-5439` | `if (mode === 'alarm' && activeAlarm)` | `alarmApi.resolve(activeAlarm.id, {...})` :5428 + invalidate `['alarm-active','fire-alarm-recent']` → 칩 소멸 | `fireAlarmApi.create({...})` :5432 | ✓ CORRECT |
| Desktop DesktopInspectionView `handlePanelSave` `InspectionPage.tsx:6104-6119` | `if (panelMode === 'alarm' && activeAlarm)` | `alarmApi.resolve(activeAlarm.id, {...})` :6108 + invalidate `['alarm-active','fire-alarm-recent']` → 칩 소멸 | `fireAlarmApi.create({...})` :6112 | ✓ CORRECT |

`alarmApi.resolve` and `fireAlarmApi.create` are DISTINCT endpoints in `api.ts` (`POST /alarm/:id/resolve` :799-800 vs `POST /fire-alarm` :161-162; comment :798 notes DISTINCT). A `create` call in the 경보중 branch would leave the dashboard alarm chip stuck — this failure mode is ABSENT at both sites.

### FLAG-1 — Desktop useSearchParams consumes panel=fire-alarm + zoom=1

| Param | Effect | Evidence |
|-------|--------|----------|
| `panel=fire-alarm` | `setCategoryIdx(FIRE_ALARM_IDX)` (선택→화재수신반 pane) | `InspectionPage.tsx:6065-6069` (`FIRE_ALARM_IDX` derived :6036) |
| `zoom=1` | `setPanelZoomOpen(true)` (줌 오버레이 open) | `InspectionPage.tsx:6070` |

Mobile counterpart also present: `URLSearchParams(...).get('panel')==='fire-alarm'` auto-opens FireAlarmModal :4697-4699. ✓ VERIFIED

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/utils/api.ts` (panelApi/alarmApi/interfaces) | panel/alarm namespaces + resolve DISTINCT | ✓ VERIFIED | :724-801, PanelStatus/Alarm/MaintState interfaces, resolve/ack/getEvents/setMaint |
| `src/components/panel/LivePanelImage.tsx` | live frame + 204/error graceful | ✓ VERIFIED | 54 lines, onError→gray placeholder :44-51 |
| `src/components/panel/freshness.ts` | freshness/watchdog labels | ✓ VERIFIED | parseKst/freshnessLabel/watchdogLabel |
| `src/hooks/usePinchZoom.ts` | reusable pinch/double-tap | ✓ VERIFIED | 181 lines, scale state + gestures |
| `src/pages/FireAlarmPage.tsx` | /fire-alarm takeover + ACK | ✓ VERIFIED | 204 lines, fire/equip branches |
| `src/pages/DashboardPage.tsx` | mobile card+chip / desktop widget | ✓ VERIFIED | PanelStateChip + both trees wired |
| `src/pages/InspectionPage.tsx` | FireAlarmModal expanded + DesktopInspectionView panel pane | ✓ VERIFIED | mobile modal :5337+ · desktop pane isPanel :6352+ |
| `src/App.tsx` | route + both no-nav lists | ✓ VERIFIED | :47/:73/:76/:273 |
| `src/sw.ts` | push url forward + notificationclick routing | ✓ VERIFIED | :34-74 |

### Key Link Verification

| From | To | Via | Status |
|------|-----|-----|--------|
| DashboardPage | panelApi/alarmApi | `useQuery` try/catch fallback :185-197 → activeAlarm/maintOn/frameUpdatedAt :198-200 | ✓ WIRED |
| FireAlarmModal form (경보중) | `POST /alarm/:id/resolve` | `alarmApi.resolve` :5428 | ✓ WIRED |
| DesktopInspectionView form (경보중) | `POST /alarm/:id/resolve` | `alarmApi.resolve` :6108 | ✓ WIRED |
| FireAlarmPage ACK | `POST /alarm/:id/ack` → navigate | `alarmApi.ack` :58 | ✓ WIRED |
| maint toggle | `PUT /panel/maint` + 409 confirm | `panelApi.setMaint({confirmAlarm:true})` :5452/:6132 | ✓ WIRED |
| SW notificationclick | route navigate | `client.navigate(url)`/`openWindow(url)` :67-74 | ✓ WIRED |

### Data-Flow Trace (Level 4)

Backend `/api/panel/*` + `/api/alarm/*` are NOT deployed in this design-track repo (separate cbc7119-data track — per CONTEXT + UI-SPEC). This is by design. Every consumer wraps queries in `try/catch` returning `null`/`[]` and degrades to 평상시 fallback + gray 16:9 placeholder (`LivePanelImage` onError). Data-flow is therefore intentionally STATIC-until-deployed and this is the contracted behavior, not a hollow-wiring defect. `latestFrameUrl` uses `?t=frameUpdatedAt` cache-bust (not Date.now) to avoid remount flicker.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compiles | `npx tsc --noEmit` | exit 0 | ✓ PASS |
| Runtime UI states (visual) | — | requires running app + forced states | ? SKIP → human UAT |

### Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| PANEL-UI-01~07 | 화재수신반 원격감시·경보 UI (모바일+데스크톱 시각 표면) | ✓ SATISFIED | SC 1-8 above; no REQUIREMENTS.md orphans for Phase 25 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| InspectionPage.tsx | 6611, 6619 | 📷 emoji in caption | ℹ️ Info | Pre-existing (non-panel finding-detail photo captions, outside phase-25 isPanel branch) — not added by phase 25 |
| InspectionPage.tsx | 3953, 4598, 4680 | ✓🔴🟡 in comments/general render | ℹ️ Info | Pre-existing non-phase-25 code |
| DashboardPage.tsx | 648-658 | latestAlarm '최근 수신반 이력' snippet renders state-agnostic | ⚠️ Warning | UI-SPEC Surface 1 says 평상시 right slot empty; snippet is pre-existing dashboard behavior — routed to human UAT (not a code blocker) |

No TODO/FIXME/XXX/TBD/HACK debt markers in phase-25 net-new files.

### Human Verification Required

7 items (see frontmatter `human_verification`) — all are visual/runtime checks that grep cannot verify: mobile card+chip rendering per state, mobile page 3-state transitions + zoom gesture, /fire-alarm takeover, desktop widget click/dblclick timing, desktop 3-split pane, SW push deep-link on real device, and the latestAlarm snippet policy decision. These are the user's manual UAT step on cbc7119-preview AFTER main-merge.

### Gaps Summary

No code gaps. All 8 ROADMAP Success Criteria are delivered with file:line evidence, the critical resolve-vs-create invariant is correct at both save sites, FLAG-1 deep-link consumption is wired, emoji-zero holds for phase-25 added lines, graceful 204/empty degradation is present, and `tsc --noEmit` passes clean. The phase is **code/structure/build complete**. Status is `human_needed` solely because final visual + runtime UAT (per-state rendering, animations, push deep-link on device) is inherently non-programmatic and is the user's post-merge manual step. One minor SPEC-vs-code observation (latestAlarm recent-history snippet in mobile banner) is routed to the user as a design decision, not a blocker.

---

_Verified: 2026-07-01_
_Verifier: Claude (gsd-verifier)_

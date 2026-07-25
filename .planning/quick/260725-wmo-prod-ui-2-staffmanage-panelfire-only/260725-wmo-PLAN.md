---
quick_id: 260725-wmo
slug: prod-ui-2-staffmanage-panelfire-only
description: prod에 스테이징 검증 UI 수정 2건 이식 - StaffManage 바텀시트 스크롤 + 대시보드 panelFire 화재-only
date: 2026-07-25
branch: production
status: planned
---

# Quick Task 260725-wmo: 스테이징 검증 UI 수정 2건 prod 이식

## 배경

staging(cbc7119-data)에서 UAT 완료된 UI 수정 2건을 prod(cha-bio-safety)로 승격. staging→prod 미러 리셋([[project_staging_prod_mirror_reset]]) 전에 먼저 반영해야 리셋 후 staging이 이 개선을 그대로 물려받음. **배포는 하지 않음** — 코드 편집+아토믹 커밋까지만, 배포는 사용자 승인 후 수동 wrangler(서브에이전트 배포 금지).

## Task 1 — StaffManagePage 바텀시트 스크롤 누수 수정

**files:** `cha-bio-safety/src/pages/StaffManagePage.tsx`

**문제:** 현재 prod BottomSheet는 `<div position:fixed inset:0 flex justify:flex-end>` 래퍼 안에 `maxHeight:90vh overflowY:auto` 내부 div. iOS에서 모달을 스크롤하면 뒤 직원관리 페이지가 스크롤되고 정작 모달이 안 밀림(사용자 실기기 확인).

**action:** 스테이징 검증본과 동일한 Pattern A(InspectionPage/ElevatorPage 표준)로 교체:
- BottomSheet 위에 `const NAV_BOTTOM = 'calc(54px + env(safe-area-inset-bottom, 20px))'` 추가.
- 반환을 Fragment 2요소로: (1) backdrop `position:fixed inset:0 background:rgba(0,0,0,0.4) zIndex:98` `onClick={onClose}`, (2) sheet `position:fixed left:0 right:0 bottom:NAV_BOTTOM zIndex:99 background:var(--bg2) borderTop:1px var(--bd) borderRadius:16px 16px 0 0 maxHeight:calc(100dvh - var(--sat,0px) - var(--sab,0px) - 54px) overflowY:auto overflowX:hidden animation:slideUp`. grab handle/title/children 유지.
- 부수: INPUT_STYLE에 `minWidth:0, maxWidth:'100%'` 추가. birthDate date input에 `appearance-none [-webkit-appearance:none]`(className 병합).
- DesktopModal은 손대지 않음.

**verify:** `npm run build` 타입/빌드 통과. (실기기 스크롤 검증은 배포 후 사용자)

**done:** BottomSheet가 backdrop/sheet 2요소, sheet가 `bottom:NAV_BOTTOM`+`overflowY:auto`.

## Task 2 — 대시보드 라이브카드 panelFire 화재-only

**files:** `cha-bio-safety/src/pages/DashboardPage.tsx`

**문제:** 칩(PanelStateChip)은 이미 화재-only인데 라이브카드는 `activeAlarm`(any type)로 빨강 처리 → 설비/고장 알람도 이론상 빨강 '화재'. 칩 설계 의도와 불일치([[project_dashboard_livecard_fire_only]]).

**action:**
- 199행 `const activeAlarm = ...` 다음 줄에 `const panelFire = activeAlarm?.type === 'fire' ? activeAlarm : null` 추가.
- 라이브카드 블록(약 487·488·499·502·512·517·519행) 내부에서만 `activeAlarm`→`panelFire`.
- 변경 금지: 199행 정의, 354행 `!activeAlarm && !maintOn && latestAlarm`, PanelStateChip props(348·671행 `activeAlarm={activeAlarm}`).

**verify:** `npm run build` 통과. grep로 라이브카드 블록만 panelFire, 칩·354행은 activeAlarm 유지 확인.

**done:** 실화재만 카드 빨강/'화재', 설비·고장은 초록 LIVE. push·풀스크린 경보는 타입 무관 동일.

## must_haves

- StaffManage 바텀시트 = backdrop(z-98)+sheet(z-99, bottom NAV_BOTTOM, overflow-y-auto) 구조
- DashboardPage에 panelFire 정의 + 라이브카드가 panelFire 사용, 칩/354행은 activeAlarm 유지
- `npm run build` 성공
- 2개 아토믹 커밋(파일별), 배포 없음

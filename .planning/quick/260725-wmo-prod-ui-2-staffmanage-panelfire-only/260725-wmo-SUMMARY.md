---
quick_id: 260725-wmo
slug: prod-ui-2-staffmanage-panelfire-only
date: 2026-07-25
status: complete
branch: production
deployed: false
commits:
  - 8d40d310
  - 326ec2a9
---

# Quick Task 260725-wmo — SUMMARY

스테이징(cbc7119-data) UAT 검증본 UI 수정 2건을 prod(cha-bio-safety)로 이식. **코드+커밋까지만, 미배포.** staging→prod 미러 리셋([[project_staging_prod_mirror_reset]]) 전에 prod에 선반영해 리셋 후 staging이 그대로 상속하도록 함.

## 완료

### Task 1 — StaffManage 바텀시트 스크롤 누수 수정 (commit 8d40d310)
`cha-bio-safety/src/pages/StaffManagePage.tsx` (+10/−8)
- BottomSheet: 단일 `fixed inset:0 flex` 래퍼 → Pattern A 2요소. backdrop `fixed inset:0 rgba(0,0,0,0.4) z:98` + sheet `fixed bottom:NAV_BOTTOM z:99 maxHeight:calc(100dvh - sat - sab - 54px) overflowY:auto overflowX:hidden`. `NAV_BOTTOM = calc(54px + env(safe-area-inset-bottom,20px))`.
- 효과: 모달이 자체 스크롤, 뒤 페이지 스크롤 누수 해소. 시트가 하단 탭바 위 영역만 차지+홈 인디케이터 여백 존중.
- 부수: INPUT_STYLE `minWidth:0, maxWidth:'100%'`; birthDate input `appearance-none [-webkit-appearance:none]`.
- DesktopModal 미변경.

### Task 2 — 대시보드 라이브카드 화재-only (commit 326ec2a9)
`cha-bio-safety/src/pages/DashboardPage.tsx` (+9/−7)
- `const panelFire = activeAlarm?.type === 'fire' ? activeAlarm : null` 추가.
- 라이브카드 블록(border/animation/badge bg/badge text/캡션 location·detectedAt)만 `activeAlarm`→`panelFire`.
- 보존: 199행 정의, 356행 `!activeAlarm` 평상 라우팅, PanelStateChip props(350·672행), 칩 내부(이미 fire-only).
- 효과: 설비·고장 알람은 초록 LIVE 유지, 실화재만 빨강 '화재'. 칩 설계 의도와 일관화([[project_dashboard_livecard_fire_only]]).

## 검증
- `npm run build` 통과 (타입 에러 0, 16.1s, PWA 생성).
- grep 확인: 라이브카드=panelFire, 칩·평상=activeAlarm 유지.
- **실기기 검증(스크롤 동작, 알람 색)은 배포 후 사용자 UAT 대기.**

## 다음
1. 사용자 승인 시 메인 세션에서 수동 배포(`--branch production`, cha-bio-safety CWD 부모).
2. 배포·UAT OK 후 staging 콘솔에서 prod 미러 리셋 진행.

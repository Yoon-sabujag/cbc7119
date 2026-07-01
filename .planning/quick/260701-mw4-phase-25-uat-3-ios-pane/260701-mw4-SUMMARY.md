---
phase: 260701-mw4
plan: 01
subsystem: dashboard-ui, inspection-ui
tags: [redesign, layout-fix, ios, desktop, phase-25-uat]
requires: []
provides:
  - "모바일 대시보드 iOS PWA(100vh) 5행 그리드 (도넛 항상 렌더)"
  - "데스크톱 화재수신반 pane 헤더 형제 표준 크롬"
  - "데스크톱 우측 오늘일정 top == 빠른도구 top 정렬 구조"
affects:
  - cha-bio-safety/src/pages/DashboardPage.tsx
  - cha-bio-safety/src/pages/InspectionPage.tsx
tech-stack:
  added: []
  patterns:
    - "grid 마지막 행 minmax(min>0, 1fr) — 결정론적 min + 1fr 플리커 방지 (minmax(0,1fr) 금지)"
    - "우측 컬럼 상단 그룹 flex-1 wrapper + mt-auto 로 형제 컬럼 바닥 미러"
key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/DashboardPage.tsx
    - cha-bio-safety/src/pages/InspectionPage.tsx
decisions:
  - "④ 오늘일정 모바일 카드 완전 제거 (카운트는 ② 오늘현황 stat card 에 이미 존재 — 정보 손실 0)"
  - "오늘일정 데스크톱 시작 높이 h-[125px] (콘솔1 실측 ≈125px) — 실기기 미세조정은 h-[Npx] 값만"
metrics:
  duration: ~15m
  completed: 2026-07-01
---

# Phase 260701-mw4: Phase 25 UAT 3건 (iOS 그리드 / pane 헤더 / 우측 정렬) Summary

Phase 25 화재수신반 원격감시 UI 의 cbc7119-preview 시각 UAT 후속 순수 시각/레이아웃 수정 3건 — 모바일 iOS 그리드 붕괴, 데스크톱 pane 헤더 크롬, 데스크톱 우측 컬럼 정렬. 모두 CSS 클래스/인라인 스타일만 변경, 비즈니스 로직·표시 분기 무변경.

## Tasks & Commits

| Task | Fix | Commit | Files |
| ---- | --- | ------ | ----- |
| 1 | FIX-1 모바일 iOS 그리드 붕괴 (④제거 + 5행) | df5062b | DashboardPage.tsx |
| 2 | FIX-2 화재수신반 pane 헤더 크롬 정렬 | ac2d443 | InspectionPage.tsx |
| 3 | FIX-3 데스크톱 우측 캘린더/오늘일정 정렬 | dc4e44b | DashboardPage.tsx |

## FIX-1 상세

- gridTemplateRows 6행 → 5행: iOS `auto auto auto auto minmax(125px, 1fr)` / Android `auto auto auto auto minmax(140px, 1fr)`.
- ④ 오늘일정 카드 블록 + timed/untimed 렌더(ScheduleRow map) 완전 제거. grid child 정확히 5개(①배너 ①-b라이브 ②현황 ③도구 ⑤도넛).
- 마지막 행 min>0 확보로 iOS PWA 월간 도넛 카드 항상 렌더. `minmax(0,1fr)` 미사용(플리커 방지 메모리 룰 준수).
- ⑤ 도넛 카드 내부 무변경 (Donut size44 / flex-nowrap 가로스크롤 / IS_ANDROID height 125·101 / animation delay .20s 유지).

## FIX-2 상세 (InspectionPage 화재수신반 id-head)

- container: `gap-[11px] px-4 py-[11px]` → `gap-2.5 px-5 py-3`.
- 백버튼: `w-7 h-7 rounded-[7px]` → `w-8 h-8 rounded-sm` + `border border-border-default` (w-8=48px, tailwind override 주의).
- chevron: `ChevronLeft size={16}` → `size={14} className="text-text-secondary"`.
- 형제 '조치 상세' pane 헤더(3건, 표준 크롬) 무변경 / 별개 :5482 백버튼 무변경 / 점검모드 토글·타이틀 무변경.

## FIX-3 상세 (DashboardPage 데스크톱 우측 컬럼)

- 라이브 위젯 + 미니 캘린더를 새 wrapper `flex-1 min-h-0 flex flex-col gap-4` 로 묶음 (좌측 점검현황 flex-1 미러).
- 미니 캘린더 카드에 `mt-auto` 추가 → 캘린더 바닥 == 상단그룹 바닥 == 점검현황 바닥.
- 오늘일정 카드 `flex flex-col flex-1 min-h-0` → `flex flex-col shrink-0 h-[125px]` (내부 overflow-y-auto 유지).
- 좌측 점검현황 도넛 size76 6·7·6 balanced 그리드 무변경.

## Deviations from Plan

None - plan executed exactly as written. 세 fix 모두 확정 old_string/new_string 대로 적용, 라인 drift 없이 anchor grep 재확인 후 편집.

## Verification

- 공통: `cd cha-bio-safety && npx tsc --noEmit` — 세 fix 모두 PASS.
- FIX-1 gate: `FIX1_OK` (④=0, minmax(0=0, 옛6행=0, iOS minmax(125px,1fr)=1, Android minmax(140px,1fr)=1, flex-nowrap 유지, size44 유지).
- FIX-2 gate: `FIX2_OK` (옛 container=0, 옛 백버튼 hover=0, ChevronLeft16=0, 신 container=1, 표준 크롬 형제 3건 유지).
- FIX-3 gate: `FIX3_OK` (wrapper=1, 캘린더 mt-auto=1, 오늘일정 shrink-0 h-[110~129px] 매칭, size76 유지).

### 잔여 human-verify (orchestrator/사용자 cbc7119-preview 배포 후)

- FIX-1: iOS PWA(실기기/100vh) 대시보드 ⑤ 도넛 항상 표시 + 겹침 0 육안 확인.
- FIX-2: 데스크톱 1920×1080 화재수신반 pane 헤더 == 형제 '조치 상세' 높이/백버튼(48px).
- FIX-3: 데스크톱 1920×1080 우측 오늘일정 top == 좌측 빠른도구 top. 픽셀 미스매치 시 오늘일정 `h-[Npx]` 값만 미세조정(범위 110~129, 권장 118~125) — 다른 요소 불변.

## 직원 도메인(production) 이관 노트

운영 브랜치(production)는 redesign(Tailwind class) 미도달 페이지가 있을 수 있음 → 아래 Tailwind old_string 이 no-op 일 수 있으니 **의도 기준 + 운영 소스 재패치** 필요.

- FIX-1 의도: DashboardPage 모바일 메인 그리드 6행 → 5행, ④ 오늘일정 카드 제거(카운트는 ② stat card 에 존재), 마지막 행 min>0 (iOS 125 / Android 140). 운영이 inline-style gridTemplateRows 면 문자열 직접 매칭.
- FIX-2 의도: InspectionPage 화재수신반 상세 pane 헤더를 형제 '조치 상세' pane 표준(px-5 py-3 / 백버튼 w-8 h-8 rounded-sm +border / ChevronLeft size14)에 맞춤. `setCategoryIdx(null)` + BellRing '화재수신반' 헤더 한정, `setRecordId(null)` :6540 및 :5482 백버튼 불변.
- FIX-3 의도: DashboardPage 데스크톱 우측 340px 컬럼 — 라이브+캘린더 flex-1 wrapper + 캘린더 mt-auto, 오늘일정 고정높이(≈125px). 좌측 점검현황 무변경.

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/pages/DashboardPage.tsx (modified)
- FOUND: cha-bio-safety/src/pages/InspectionPage.tsx (modified)
- FOUND commit: df5062b (FIX-1)
- FOUND commit: ac2d443 (FIX-2)
- FOUND commit: dc4e44b (FIX-3)

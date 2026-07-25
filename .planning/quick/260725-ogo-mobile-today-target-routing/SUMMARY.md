---
quick_id: 260725-ogo
slug: mobile-today-target-routing
date: 2026-07-25
branch: production
status: complete
files_modified:
  - cha-bio-safety/src/pages/DashboardPage.tsx
---

# SUMMARY — 모바일 대시보드 "오늘 점검 대상" 배너 카테고리별 라우팅

## 무엇을 했나
모바일 대시보드 "오늘 점검 대상" 배너를 탭하면 카테고리별로 이동하도록 했다.
- **소화기 / 소화전 / 비상콘센트 / 유도등 → 도면점검(FloorPlanPage) 해당 레이어**
- **그 외 점검 카테고리 → 일반점검(InspectionPage) 해당 항목 자동선택**

`DashboardPage.tsx`:
1. `goToTodayTarget` 핸들러 추가(goToInspection 옆). `todayInspectCategory`(오늘 첫 inspect 항목 카테고리)
   기준으로 분기:
   ```
   FLOORPLAN_PLAN_TYPE = { 유도등:guidelamp, 소화기:extinguisher, 소화전:extinguisher, 비상콘센트:extinguisher }
   pt = map[cat]
   pt ? navigate(`/floorplan?planType=${pt}`)
      : navigate('/inspection', cat ? {state:{autoSelectCategory:cat}} : undefined)
   ```
2. 모바일 배너 콘텐츠 div(`flex-1`)에 `onClick={goToTodayTarget}` + `cursor-pointer`.
   (우측 PanelStateChip 은 sibling → 자체 onClick 유지, 충돌 없음.)

## 기존 구조 재사용 (드리프트 0)
- InspectionPage `state.autoSelectCategory`(모바일 setSelectedGroupIdx) — 기존 '점검 미완료' 카드와 동일 경로.
- FloorPlanPage `?planType=`(guidelamp/detector/extinguisher), floor 미지정 시 기본 8-1F.
  비상콘센트는 소화전 마커와 페어(extinguisher 레이어).

## 검증 (headless CDP, /api/dashboard/stats 목킹 + 배너 클릭 → 이동 URL 확인, 모바일 390x844)
- 유도등 → /floorplan?planType=guidelamp&floor=8-1F ✓
- 소화기/소화전/비상콘센트 → /floorplan?planType=extinguisher&floor=8-1F ✓
- DIV / 특별피난계단 → /inspection (autoSelectCategory state) ✓
- `npm run build` (tsc + vite) PASS

## 결정/기본값
- 오늘 inspect 여러 개면 첫 카테고리(기존 goToInspection 과 동일).
- inspect 없으면 → /inspection 일반 목록 폴백. 도면 floor 기본 8-1F.
- **모바일 전용**(사용자 요청). 데스크톱 배너·PanelStateChip 무변경.
- 시각적 어포던스(화살표 등)는 미추가 — 라이브 위젯처럼 무-chevron 탭 패턴 유지. 필요 시 별도.

## 배포
production 수동 wrangler 배포는 사용자 확인 후.

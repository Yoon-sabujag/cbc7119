---
quick_id: 260725-ogo
slug: mobile-today-target-routing
date: 2026-07-25
branch: production
type: feature
---

# 모바일 대시보드 "오늘 점검 대상" 배너 → 카테고리별 라우팅

## 요구 (사용자)
모바일 대시보드에서 "오늘 점검 대상"을 누르면 **일반점검(InspectionPage) > 해당 점검 항목**으로 이동.
단 **소화기 / 소화전(비상콘센트) / 유도등**은 **도면점검(FloorPlanPage) > 해당 레이어**로 이동.

## 조사 결과 (기존 구조 재사용)
- `DashboardPage.tsx:222` `todayInspectCategory` = 오늘 일정 첫 inspect 항목의 inspectionCategory.
  기존 `goToInspection`(점검 미완료 카드)이 이미 사용 → 카테고리 근거로 신뢰 가능.
- InspectionPage: `location.state.autoSelectCategory`(문자열=CATEGORY_GROUPS 카테고리)로 카테고리
  자동선택. 모바일도 `setSelectedGroupIdx` 로 동작(InspectionPage.tsx:3877). 기존 goToInspection 과 동일 경로.
- FloorPlanPage: `?planType=` (guidelamp=유도등 / detector=감지기 / extinguisher=소화기·소화전),
  `?floor=`(미지정 시 기본 '8-1F'). 비상콘센트는 소화전 마커와 페어(extinguisher 레이어) — FloorPlanPage.tsx:405/469.
- 모바일 "오늘 점검 대상" 배너: DashboardPage.tsx:648-664. 현재 클릭 불가. 우측 PanelStateChip 은 별도 onClick(fire-alarm).

## 구현
1. `goToTodayTarget` 핸들러 추가 (goToInspection 옆, ~226행):
   ```
   const FLOORPLAN_PLAN_TYPE: Record<string,string> = {
     '유도등':'guidelamp', '소화기':'extinguisher', '소화전':'extinguisher', '비상콘센트':'extinguisher',
   }
   const goToTodayTarget = () => {
     const cat = todayInspectCategory
     const pt = cat ? FLOORPLAN_PLAN_TYPE[cat] : undefined
     if (pt) navigate(`/floorplan?planType=${pt}`)
     else navigate('/inspection', cat ? { state:{ autoSelectCategory: cat } } : undefined)
   }
   ```
2. 모바일 배너 콘텐츠 div(`flex-1`, :653)에 `onClick={goToTodayTarget}` + `cursor-pointer` 부여
   (우측 PanelStateChip 은 sibling 이라 자체 onClick 유지 — 이벤트 충돌 없음).

## 결정/기본값
- 오늘 inspect 항목이 여러 개면 첫 카테고리 기준(기존 goToInspection 과 동일).
- inspect 항목 없으면(todayInspectCategory undefined) → `/inspection`(일반 목록) 폴백.
- 도면점검 floor 미지정 → 기본 8-1F.
- **모바일 전용** (사용자 요청). 데스크톱 배너는 무변경.

## 범위 밖
데스크톱 배너, PanelStateChip, todayTarget 문자열 생성(백엔드), 시각적 어포던스(별도 논의 시 추가).

## 검증
- 로컬 CDP: 모바일 뷰포트에서 배너 클릭 → 카테고리별 navigate 확인(라우트 URL/state).
- `npm run build` PASS.
- 배포는 사용자 확인 후.

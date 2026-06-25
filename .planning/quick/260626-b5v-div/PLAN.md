---
quick_id: 260626-b5v
slug: div
date: 2026-06-26
status: in-progress
---

# Quick Task: 도면 DIV 마커 반기(월초/월말) 완료 표시 기준 — 일반 점검과 통일

## 배경
260626-7vq 에서 도면 DIV 점검 모달은 일반 점검 리치 모달로 통일했으나, **"이미 점검한 개소 표시 기준"은 누락**. DIV/컴프레셔는 월 2회(월초 1~15 / 월말 16~말) 점검 항목이라 완료 판정이 반쪽 윈도우마다 리셋돼야 하는데, 도면 마커는 `getMarkerStatus`(last_result 최신 1건)만 봐서 월초 점검 DIV가 월말 내내 "완료(초록)"로 표시됨. 일반 점검(`computeCardCompletion`+`getCycleHalfRange`)과 불일치.

## 규칙 (일반 점검에서 그대로)
- `CYCLE_CATEGORIES={DIV,컴프레셔}`, `getCycleHalfRange(today)` = day<=15 ? [1,15] : [16,말].
- 완료(normal | caution | bad+resolved)는 현재 반쪽 윈도우 안 기록만 인정.
- 미조치(open bad/caution)는 반쪽 무관(조치 경고) 유지.

## 변경 (순수 클라이언트, 서버 무변경 — 마커가 last_inspected_at 날짜 제공)
1. `utils/inspectionProgress.ts`: `getCycleHalfRange`+`CYCLE_CATEGORIES` export 승격(단일 출처).
2. `FloorPlanPage.tsx`:
   - import 추가, 컴포넌트 상단 `todayYmd` 호이스트.
   - `getMarkerStatus(m, todayYmd?)` period-aware: div_marker & 완료후보 & last_inspected_at 가 현재 반쪽 밖 → 'uninspected'. 미조치는 통과(fire). 비-div_marker/todayYmd 미전달은 기존 동작.
   - 캔버스 dot(1130) + 상세시트 statusKey(1199) 호출부 todayYmd 전달.
   - evalRevisit 'completed' 분기에 반쪽 게이트(일반 점검 hook 과 동일): CYCLE & 기록 반쪽 밖이면 return null.

## 적용 의미 (= 일반 점검)
- 현재 반쪽 밖 완료 DIV → 미점검(회색) 강등(재점검 유도).
- 미조치 DIV → fire 유지(반쪽 무관).
- div_marker 만 영향, 비-CYCLE 마커 무변화.

## 검증/롤아웃
- build(tsc+vite precache 84) 통과 + 변경 격리 grep.
- **사용자 결정: staging 없이 prod 직접 적용.** 빌드 통과 후 사용자 배포 컨펌 → 수동 wrangler --branch production.

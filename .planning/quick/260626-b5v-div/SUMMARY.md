---
quick_id: 260626-b5v
slug: div
date: 2026-06-26
status: complete
commits:
  - 2afe856a  # fix: 도면 DIV 마커 반쪽 윈도우 완료표시
deploy: https://14cfff64.cbc7119.pages.dev
---

# SUMMARY: 도면 DIV 마커 반기(월초/월말) 완료 표시 기준 통일

## 결과
260626-7vq(도면 DIV 모달 통일) 후속. DIV/컴프레셔는 월 2회(월초 1~15 / 월말 16~말) 점검 항목이라 완료 판정이 반쪽마다 리셋돼야 하나, 도면 마커는 `getMarkerStatus`(last_result 최신 1건)만 봐서 월초 점검 DIV가 월말 내내 "완료(초록)"로 표시되던 갭. 일반 점검(`computeCardCompletion`+`getCycleHalfRange`) 기준을 도면에 이식.

## 변경 (순수 클라이언트, 서버 무변경)
- `utils/inspectionProgress.ts`: `getCycleHalfRange`/`CYCLE_CATEGORIES` export 승격(단일 출처화, useInspectionRevisitPopup 의 중복 정의는 그대로 둠).
- `pages/FloorPlanPage.tsx`:
  - import + 컴포넌트 상단 `todayYmd` 호이스트.
  - `getMarkerStatus(m, todayYmd?)` period-aware: div_marker & 완료후보(normal | bad/caution+resolved) & `last_inspected_at` 가 현재 반쪽 윈도우 밖 → `'uninspected'`. 미조치(open bad/caution)는 반쪽 무관 통과(fire). 비-div_marker/todayYmd 미전달 = 기존 월 전체 동작.
  - 캔버스 dot + 상세시트 statusKey 호출부 todayYmd 전달.
  - `evalRevisit` 'completed' 분기에 반쪽 게이트(일반 점검 hook 133-137 동일): CYCLE & `last_inspected_at` 반쪽 밖이면 return null.

## 의미 (= 일반 점검)
현재 반쪽 밖 완료 DIV → 미점검(회색) 강등 / 미조치 DIV → fire 유지(반쪽 무관) / div_marker 만 영향(비-CYCLE 마커 무변화).

## 서버 무변경 근거
마커가 `last_result` + `last_inspected_at`(날짜) + `last_status` 를 이미 내려줌. 서버는 당월 1일 이후 ever-latest 1건 → 시간순 최신이 곧 현재 반쪽. 클라이언트에서 반쪽 판정 충분, 일반 점검과 실무상 동치.

## 검증/배포
- build(tsc+vite precache 84) 통과 + 변경 격리 grep(FloorPlanPage +27/inspectionProgress 2 export).
- **사용자 결정으로 staging 생략, prod 직접 적용.** 배포 https://14cfff64.cbc7119.pages.dev (production alias).
- **사용자 prod 검증 대기**: 월초/월말 경계에서 도면 DIV 마커 색이 일반 점검과 동일하게 리셋되는지 + 비-DIV 마커 무변화 + 미조치 DIV fire 유지.

## 후보(범위 밖)
useInspectionRevisitPopup 의 getCycleHalfRange/CYCLE_CATEGORIES 중복 정의를 inspectionProgress import 로 단일화(이번엔 blast radius 최소화 위해 미적용).

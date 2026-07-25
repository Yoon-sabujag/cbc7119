---
quick_id: 260725-mnq
slug: desktop-dashboard-card-bottom-align
date: 2026-07-25
branch: production
type: bugfix
---

# 데스크톱 대시보드 — 달력 카드 · 이번달 점검현황 카드 바닥 정렬

## 증상 (사용자 보고)
데스크톱 대시보드에서 달력 카드 밑단과 "이번 달 점검 현황" 카드 밑단 높이가 다름. 딱 맞춰달라.

## 근본 원인 (headless Chrome 실측)
`DashboardPage.tsx` Row3(2열: 좌 점검현황+빠른도구 / 우 라이브+달력+오늘일정).
- 두 카드 바닥 정렬은 좌·우 컬럼이 모두 Row3 높이로 stretch 되고, 달력(우측 flex-1)이
  남는 높이에 맞게 줄어드는 것에 의존.
- 그런데 달력 카드에 `min-h-[220px]` 플로어가 있어, 우측 컬럼(라이브 272px + 달력 + 오늘일정
  126px + gap)이 일반 뷰포트(Row3H≈490~650px)보다 커질 때 달력이 220 밑으로 못 줄고
  **아래로 삐져나옴** → 달력 바닥이 점검현황 바닥보다 아래로 내려감.
- 실측 델타(점검현황bottom − 달력bottom): vh993 −17, vh853 −157, vh813 −237 (뷰포트 낮을수록 악화).
  달력이 220 클램프에 걸리는 순간부터 달력 bottom 고정, 점검현황 bottom 은 계속 축소 → 발산.
- 즉 원인은 빠른도구/오늘일정(둘 다 126px, 이미 동일)이 아니라 **달력 min-height 클램프**.

## 선택된 해법 (사용자 컨펌: Option B "달력 풀사이즈 유지")
Row3 컨테이너의 `min-h-0` 제거 → Row3 가 콘텐츠 자연높이 밑으로 안 줄고(min-height:auto),
공간 부족 시 대시보드(overflow-auto)가 세로 스크롤. 두 컬럼 모두 자연높이(우측 기준)로 stretch
되어 **바닥 정확히 일치**, 달력은 항상 풀사이즈(228px). 높은 화면에선 flex-1 로 채워 스크롤 없음.

```
- <div className="flex gap-4 flex-1 min-h-0">   (Row3, line 384)
+ <div className="flex gap-4 flex-1">
```

## 검증 (실측, min-height:auto 주입 = 소스에서 min-h-0 제거와 동치)
- vh993 / vh853 / vh813 모두 DELTA=0, 달력 228px 유지, 점검현황 stretch 516px.
- 반대안(Option A: 달력 min-h 제거)도 DELTA=0 이지만 낮은 화면서 달력이 26~63px 로 축소 → 미채택.

## 범위 밖
- 좌/우 컬럼 내부 구조, 빠른도구/오늘일정(126px 유지), 모바일 레이아웃, 라이브 위젯.

## 검증 (수정 후)
- dev 서버 HMR 상태에서 CDP 재측정(주입 없이) DELTA=0 확인
- `npm run build` (tsc + vite) PASS
- 배포는 사용자 확인 후 (또는 일반 fix 즉시배포 룰).

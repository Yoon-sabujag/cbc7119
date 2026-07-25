---
quick_id: 260725-mnq
slug: desktop-dashboard-card-bottom-align
date: 2026-07-25
branch: production
status: complete
files_modified:
  - cha-bio-safety/src/pages/DashboardPage.tsx
---

# SUMMARY — 데스크톱 대시보드 달력·점검현황 카드 바닥 정렬

## 무엇을 했나
Row3 컨테이너(2열)에서 `min-h-0`를 제거했다 (DashboardPage.tsx:384).

```
- <div className="flex gap-4 flex-1 min-h-0">
+ <div className="flex gap-4 flex-1">   (+ 설명 주석)
```

diff = 주석 3줄 + 클래스 1토큰 제거, DashboardPage.tsx 1파일.

## 왜
달력 카드의 `min-h-[220px]` 때문에, 우측 컬럼(라이브 272 + 달력 + 오늘일정 126 + gap)이
Row3 가용높이보다 커지는 일반 뷰포트에서 달력이 220 밑으로 못 줄고 아래로 삐져나와
달력 바닥이 점검현황 바닥보다 내려갔다. Row3 의 `min-h-0`가 Row3 를 가용높이로 강제 축소시켜
이 넘침을 유발. `min-h-0` 제거 → Row3 가 콘텐츠 자연높이 유지(부족 시 대시보드 스크롤),
두 컬럼이 같은 자연높이로 stretch → 바닥 정확히 일치. 달력은 항상 풀사이즈, 높은 화면은 flex-1 채움.

사용자 선택: **Option B (달력 풀사이즈 유지 + 필요 시 페이지 스크롤)**.

## 검증 (headless Chrome CDP 실측, 1920×{1080,940,900})
- 수정 전: DELTA(점검현황bottom−달력bottom) = −17 / −157 / −197 (달력 min-h 클램프로 발산)
- 수정 후(소스 HMR, 주입 없음): **DELTA = 0** 전 높이, 달력 228px 풀사이즈, 빠른도구·오늘일정 각 126px
- 반대안 Option A(달력 min-h 제거)도 DELTA=0 이나 낮은 화면서 달력 26~63px 로 축소 → 미채택
- `npm run build` (tsc + vite) PASS — DashboardPage 청크 정상

## 범위 밖 (미변경)
좌/우 컬럼 내부, 빠른도구·오늘일정(126px), 모바일 레이아웃, 라이브 위젯.

## 배포
production 수동 wrangler 배포 예정 (사용자 확인).

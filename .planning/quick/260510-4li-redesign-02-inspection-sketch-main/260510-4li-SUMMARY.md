---
phase: quick-260510-4li
plan: 01
subsystem: design-system / redesign-02-inspection
tags: [redesign, sketch, inspection, design-system-v0.1.1, html, mobile, desktop]
requires:
  - cha-bio-safety/docs/design-system.md (v0.1.1 룰 — 권위)
  - cha-bio-safety/docs/redesign-context/01-dashboard/sketch/dashboard-sketch.html (패턴 참조)
  - cha-bio-safety/src/components/ui/icons.tsx (custom SVG 6종 path 출처)
provides:
  - cha-bio-safety/docs/redesign-context/02-inspection/sketch/inspection-sketch-main.html (1차 시안)
affects:
  - 다음 단계 후보: 2차 모달 시안 (특수 모달 5종) 또는 TSX 변환
tech-stack:
  added:
    - HTML 자기-완결 sketch (Tailwind CDN + Pretendard CDN + Lucide CDN, 외부 빌드 없음)
  patterns:
    - data-theme=dark / data-theme=light 토큰 컨테이너 분기
    - lucide CDN data-lucide 속성 → SVG 변환
    - custom SVG 6종 inline (icons.tsx path 그대로)
    - §6.3 카테고리 카드 — 아이콘 회색 통일 + 좌측 3px 색바로 진척률
    - §6.1 Progress Color Rule (0/1-49/50-99/100% → tertiary/warning/accent/safe)
    - §6.4 저장 CTA 한정 그라디언트 (linear-gradient(135deg, #1d4ed8, #0ea5e9))
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/02-inspection/sketch/inspection-sketch-main.html (2312 라인)
  modified: []
decisions:
  - 16개 카테고리는 §6.3 룰에 따라 모두 아이콘 회색 통일 (§7.2 표 색상은 카탈로그용으로 분리)
  - DIV 카드를 "현재 선택" 상태 (border accent 2px)로 표시하여 우측 상세 영역(층 칩 + CP 리스트)과 일관 매핑
  - 데스크톱 레이아웃은 좌측 사이드바(420px, 카테고리 16종 + Zone 탭) / 우측 메인(상세) 분할
  - 모바일 레이아웃은 단일 컬럼, 카테고리 2열 그리드, 하단 BottomNav (height + paddingBottom 패턴)
  - RevisitPopup 2-variant은 단일 모달 패널 안 위/아래 분할로 동시 시각화 (variant 라벨 우상단 배지)
  - CP 리스트 4상태(정상/주의/불량/미점검) 모두 시각화 — 색바 + 결과 배지로 즉시 식별
metrics:
  duration: ~25분 (분석 + 작성 + 검증)
  completed_date: 2026-05-10
  lines_created: 2312
  commits:
    - 1f52181 feat(quick-260510-4li): redesign/02-inspection 1차 시안 HTML (메인)
---

# Phase quick-260510-4li Plan 01: redesign/02-inspection 1차 시안 (메인) Summary

InspectionPage 메인 화면(헤더 + Zone 탭 + 카테고리 16종 그리드 + 층 칩 + CP 리스트 + 일반 결과 입력 모달 + Revisit/AccessBlocked 팝업) 을 v0.1.1 디자인 룰로 1:1 시각화한 자기-완결 HTML 시안 1개 파일을 생성하여 사용자 검증 대기 상태를 만들었다.

## What Was Built

### 산출물

| 파일 | 라인 수 | 역할 |
|---|---|---|
| `cha-bio-safety/docs/redesign-context/02-inspection/sketch/inspection-sketch-main.html` | 2312 | 4뷰포트 + 모달 변형 행 자기-완결 시안 |

### 4뷰포트 + 모달 행 구조

- **Row 1**: Mobile Dark (375×812) + Mobile Light (375×812) — 가로 2개
- **Row 2**: Desktop Dark (1280×800) — 좌측 카테고리 사이드바 / 우측 상세 분할
- **Row 3**: Desktop Light (1280×800) — 동일 구조, 라이트 토큰
- **Row 4**: 모달 변형 3개 패널 가로 정렬
  - E-1. 일반 결과 입력 모달 (유도등 EL-RES-1F-12 — slide-up bottom sheet + 휠피커 + 결과 3종 + 사진 + 메모 + CTA)
  - E-2. InspectionRevisitPopup 2-variant 동시 (가완료 / 나조치)
  - E-3. AccessBlockedPopup (휠피커 모달 안 자동 스킵 시나리오)

### 각 뷰포트 섹션 구성

1. **상단 헤더** — 햄버거(Menu) + 방재팀 / 일반 점검 + 점검일 + 진행중 라벨 + 윤 아바타
2. **Zone 탭 3종** — FlaskConical 연구동(active 42%) / Building2 사무동(18%) / TrainFront 지하(8%)
3. **카테고리 16종 그리드** — §6.3 룰 정확 적용 (모바일 2열 / 데스크톱 사이드바 2열)
4. **선택된 카테고리 헤더 + 층 칩** — DIV·연구동, 8F~B5 중 B5 활성, 완료 층은 safe 색 + Check 아이콘
5. **CP 리스트** — DIV-B5층 4개 (정상/주의/불량/미점검 4상태 모두 시각화)
6. **BottomNav (모바일)** — 4탭, 점검 활성, height 76px + paddingBottom 12px (메모리 룰)
7. **loading skeleton (데스크톱 사이드바)** + **empty 상태 (우측 메인 하단)**

## §6.3 카테고리 카드 룰 검증 (16종)

| # | 카테고리 | 진척률 | §6.1 색바 | §7.2 아이콘 (회색 통일) |
|---|---|---|---|---|
| 1 | 특별피난계단 | 100% (8/8) | safe-bar 초록 | StairsIcon (custom inline SVG) |
| 2 | 청정소화약제 | 72% (13/18) | accent 파랑 | Cloud (lucide) |
| 3 | 전실제연댐퍼·연결송수관 | 40% (10/25) | warning-bar 노랑 | Shield (lucide) |
| 4 | 주차장비·회전문 | 0% (0/6) | tertiary 회색 + opacity 0.6 | Car (lucide) |
| 5 | 소방용전원공급반 | 0% (0/4) | tertiary 회색 + opacity 0.6 | Zap (lucide) |
| 6 | 방화셔터 | 0% (0/12) | tertiary 회색 + opacity 0.6 | ShutterIcon (custom inline SVG) |
| 7 | DIV (선택됨) | 45% (11/24) | warning-bar 노랑 + accent border | BarChart3 (lucide) |
| 8 | 컴프레셔 | 0% (0/24) | tertiary 회색 + opacity 0.6 | Wind (lucide) |
| 9 | 유도등 | 28% (28/100) | warning-bar 노랑 | ExitSignIcon (custom inline SVG) |
| 10 | 배연창 | 0% (0/16) | tertiary 회색 + opacity 0.6 | SmokeVentIcon (custom inline SVG) |
| 11 | 완강기 | 0% (0/8) | tertiary 회색 + opacity 0.6 | ArrowDownToLine (lucide) |
| 12 | 소화전·비상콘센트 | 58% (29/50) | accent 파랑 | HoseReelIcon (custom inline SVG) |
| 13 | 소화기 | 15% (36/240) | warning-bar 노랑 | FireExtinguisherCustom (custom inline SVG) |
| 14 | 소방펌프 | 0% (0/3) | tertiary 회색 + opacity 0.6 | Waves (lucide) |
| 15 | 화재수신반 | 100% (4/4) | safe-bar 초록 | Bell (lucide) |
| 16 | CCTV | 0% (0/13) | tertiary 회색 + opacity 0.6 | Video (lucide) |

**§6.1 진척률 색 분포 검증:**
- 100% safe-bar: 2개 (특별피난계단, 화재수신반)
- 50-99% accent: 2개 (청정소화약제 72%, 소화전 58%)
- 1-49% warning-bar: 4개 (DIV 45%, 전실제연댐퍼 40%, 유도등 28%, 소화기 15%)
- 0% tertiary + opacity 0.6: 8개 (주차장비, 소방용전원공급반, 방화셔터, 컴프레셔, 배연창, 완강기, 소방펌프, CCTV)

## 자동 검증 결과

| 룰 | 결과 |
|---|---|
| 파일 존재 + 800줄 이상 | PASS — 2312 라인 |
| `data-theme="dark"` 존재 | 7회 |
| `data-theme="light"` 존재 | 4회 |
| 16종 카테고리 라벨 모두 등장 | PASS (모두 ≥4회) |
| Zone 3종(연구동/사무동/지하) 등장 | PASS |
| `opacity:0.6` 적용 (0% 카드 클래스) | PASS |
| **9/10/11px 폰트 0건** | PASS |
| custom SVG 6종 inline path | PASS (모두 ≥4회) |
| lucide 아이콘 10종 + Zone 3종 + 결과 3종 | PASS |
| 모달 변형 3종 (CTA / Revisit 2-variant / AccessBlocked) | PASS |

## Deviations from Plan

None — plan executed exactly as written. 16종 카테고리, Zone 3종, §6.1/§6.3/§7.2 룰, 모달 3종, 메모리 룰 모두 PLAN.md 사양 그대로 구현.

## 사용자 검증 대기

브라우저에서 다음 파일을 열어 시각 검증을 부탁합니다:

```
cha-bio-safety/docs/redesign-context/02-inspection/sketch/inspection-sketch-main.html
```

**검증 포인트:**
1. 4뷰포트 + 모달 변형 행 모두 렌더되는지 (카드 깨짐 / 폰트 미적용 / 아이콘 누락 없음)
2. 16개 카테고리 카드 아이콘이 모두 회색(`--text-secondary`)으로 통일되어 있는지 (§6.3)
3. 좌측 3px 색바 색이 진척률에 맞게 4단계로 분배되어 있는지 (§6.1: 회색/노랑/파랑/초록)
4. 0% 카드 8개가 흐리게(opacity 0.6) 표시되는지
5. 라이트 모드에서 텍스트 대비 / 카드 보더가 충분히 명확한지
6. 데스크톱 좌우 분할 비율(420px 사이드바 + 우측 flex)이 적절한지
7. 모달 행의 RevisitPopup 2-variant + AccessBlockedPopup이 의도대로 표현되는지

## 다음 단계 후보

- **(a)** 2차 모달 시안 quick task — StairwellModal / BaeyeonModal / CctvModal / 증상 피커 5종 (유도등/소화기/소화전/방화셔터/전실제연댐퍼) 별도 sketch HTML
- **(b)** 사용자 승인 후 InspectionPage.tsx TSX 변환 quick task — 본 시안 1차 + (필요 시) 2차 시안을 src/pages/InspectionPage.tsx 에 적용

## Self-Check: PASSED

- File `cha-bio-safety/docs/redesign-context/02-inspection/sketch/inspection-sketch-main.html` exists (2312 lines)
- Commit `1f52181` exists in git log (`feat(quick-260510-4li): redesign/02-inspection 1차 시안 HTML (메인)`)
- All 12 verification gate checks passed
- 16 categories + 3 zones + 4 progress states + 4 CP states + 3 modal variants all visualized
- 9/10/11px 폰트 0건 (메모리 룰 준수)
- custom SVG 6종 + lucide 13종 정확 매핑

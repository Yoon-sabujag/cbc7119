---
quick_id: 260515-4zh
slug: redesign-07-elevator-2-sketch-evselector
status: complete
date: 2026-05-15
commit: 87ebd1e
tags:
  - redesign
  - sketch
  - elevator
  - evselector
  - esnode
---

# 260515-4zh — EvSelector + EsNodeMap + EsBtn 2차 sketch

## One-liner

EvSelector 5그룹 호기 그리드 + EsNodeMap FAULT/ANNUAL 4/6 노선 + EsBtn 3상태 v0.1.1 시안 — 4 viewport × 2 mode × 2 variant, 코드 변경 0건

## Artifacts

| Path | Lines | Purpose |
|------|-------|---------|
| `cha-bio-safety/docs/redesign-context/07-elevator/sketch/evselector-sketch.html` | 1557 | EvSelector 2차 시안 HTML |

## Task Execution

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | evselector-sketch.html 신규 작성 + 자가검증 10/10 PASS | 87ebd1e | evselector-sketch.html (+1557) |

## Self-Check 10/10 결과

| # | Check | Target | Result |
|---|---|---|---|
| 1 | 라인 수 | 1500-3500 | 1557 PASS |
| 2 | 9·10·11px 폰트 | 0건 | 0 PASS |
| 3 | [data-theme] 셀렉터/컨테이너 | ≥4 | 8 PASS |
| 4 | viewport 라벨 (📱/🖥️) | ≥4 | 5 PASS |
| 5 | 이모지 본문 (코멘트/meta-label 제외) | 0건 | 0 PASS |
| 6 | 5그룹 라벨 (투명/오렌지/기타/화물/덤웨이터) | 모두 | 4/4/5/4/10 PASS |
| 7 | 4 노선 variant (M층 없음, FAULT) | 등장 | YES — VP2 모바일 라이트 |
| 8 | 6 노선 variant (M층 포함, ANNUAL) | 등장 | YES — VP4 데스크톱 라이트 |
| 9 | 인라인 `style="..."` | 0건 | 0 PASS (CSS class 대체) |
| 10 | 아이콘 enumeration | ElevatorIcon SVG / MoveDiagonal / ChevronUp / ChevronDown / Siren + AlertTriangle | 6/5/5/5/5 all present PASS |

**Self-Check Status: PASSED 10/10**

## 4 viewport 구성

| Viewport | mode | Variant | 주요 시각 결정 |
|---|---|---|---|
| VP1 모바일 다크 | 엘리베이터 | FAULT | 4그룹 (덤웨이터 X), EV-01 선택(accent), EV-04 고장(fire+Siren) |
| VP2 모바일 라이트 | 에스컬 | FAULT | 4노선 (B1-M 제외), ES-03 하행선택(danger+ChevronDown), ES-02 상행선택(safe+ChevronUp) |
| VP3 데스크톱 다크 | 엘리베이터 | ANNUAL | 5그룹 (덤웨이터 1열 단독 grid), EV-07 선택(accent), EV-10 고장(fire+AlertTriangle), empty state 데모 |
| VP4 데스크톱 라이트 | 에스컬 | ANNUAL | 6노선 (M층 포함), ES-05 하행선택(danger), ES-06 상행선택(safe), EsBtn 3상태 요약 |

## §6.1 색 의미 분리 (핵심 결정)

- **fire (주황)** = 호기 고장 미수리 — 호기 버튼에만 사용 (EsBtn 미사용)
- **danger (적)** = EsBtn 하행 방향 표시 (고장 의미 아님)
- **safe (녹)** = EsBtn 상행 방향 표시
- **accent (파)** = 호기 선택 상태 (status 색 아님, §6.4 단색)

이 색 의미 차이는 시안 HTML 주석 + 각 viewport 설명 카드에 명시됨.

## v0.1.1 룰 준수

- §6.2 negative rule: 그룹 라벨 모두 text-tertiary 회색 (status 색 0건)
- §6.3 회색 통일: 비활성 토글 + 그룹 라벨 text-tertiary
- §6.4 단색 surface: 호기 선택 accent 단색 (그라디언트 0건)
- §6.5 hover: card-hover class (border-strong + translateY(-1px) .13s)
- §6.7 그림자 0건
- §7.1 이모지 0건 (viewport 라벨 📱/🖥️ 만 허용)
- 노안 친화: 9/10/11px 0건, 본문 14px+

## 인라인 style 제거 패턴

grid-template-columns 인라인 스타일 → .grid-cols-ev-1 / .grid-cols-ev-2 / .grid-cols-ev-3 CSS class 대체
sidebar width → .sidebar-icon class 대체
ev-btn 데모 min-width → .ev-demo-btn class 대체
es-btn 데모 고정폭 → .es-demo-btn class 대체

## Deviations from Plan

None — 계획대로 실행. inline style 발생 후 즉시 CSS class 대체로 Rule 1 자가수정.

## 코드 변경

ElevatorPage.tsx, icons.tsx 및 기타 src/ 파일 변경 0건 확인.

## 다음 단계

1. 브라우저에서 4 viewport 시각 검토 (https://localhost 또는 파일 직접 열기)
2. 컨펌 시: 2B sketch (FaultNewModal 컨테이너) 별도 quick
3. 또는 다음 페이지 (예: ElevatorPage 나머지 탭/모달) sketch 진행

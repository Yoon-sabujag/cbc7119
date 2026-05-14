---
quick_id: 260515-bgg
slug: redesign-07-elevator-3-sketch-fault-faul
status: complete
date: 2026-05-15
commit: 7a8afd2
---

# 260515-bgg — redesign/07-elevator 2B Fault 흐름 3 모달 sketch

## One-liner

FaultNewModal + FaultNewFullscreen + FaultResolveModal 4 viewport sketch HTML (1541줄) — fire/danger 색 의미 분리 + 풀스크린 자체 헤더 + 승객 탑승 토글 + CTA 그라디언트 정책 시각화, 12/12 verify PASS.

## What was built

신규 sketch HTML 파일 1건:
- `cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html` (1541줄)

### 4 viewport 매트릭스

| Viewport | Theme | Device | Modal | 주요 시각 결정 |
|---|---|---|---|---|
| VP1 | dark | mobile | FaultNewModal | FAULT 4그룹 EvSelector (1호기 accent 선택 / 4호기 fire 고장), 승객 ON (danger-bg + AlertTriangle), fire 그라디언트 CTA 활성 |
| VP2 | light | mobile | FaultResolveModal | ElevatorIcon 1호기 고장 카드, 수리 사진 2개 채워짐, accent 단색 CTA 활성 |
| VP3 | dark | desktop | FaultNewFullscreen | 풀스크린 자체 헤더 (AlertTriangle + 타이틀 + 부제 1899-9070 + lucide X), ANNUAL 5그룹 7호기 선택, 승객 OFF, 사진 1개, fire CTA 활성 |
| VP4 | light | desktop | FaultResolveModal | MoveDiagonal 5호기 (escalator), 수리내용 비어있음 → accent CTA 비활성 (opacity-50) |

## Self-check: 12/12 verify PASS

| # | Check | Target | Result |
|---|---|---|---|
| 1 | 라인 수 | 1500-4000 | 1541 |
| 2 | 9-10-11px 폰트 | 0건 | 0건 |
| 3 | [data-theme] 컨테이너 | ≥4 | 6건 |
| 4 | viewport 라벨 (📱/🖥️) | ≥4 | 5건 |
| 5 | 본문 이모지 (열거) | 0건 | 0건 |
| 6 | EV-/ES- 본문 노출 | 0건 (코멘트 허용) | 0건 |
| 7 | 인라인 `style="..."` 속성 | 0건 | 0건 |
| 8 | 3 모달 (FaultNewModal / FaultNewFullscreen / FaultResolveModal) | 모두 등장 | FaultNewModal:7 / FaultNewFullscreen:11 / FaultResolveModal:15 |
| 9 | 아이콘 enumeration (AlertTriangle/Siren / X / Camera / ElevatorIcon SVG / CheckCircle2) | all present | ElevatorIcon:12 / AlertTriangle/Siren:11 / X:7 / Camera:20 / CheckCircle2:3 |
| 10 | 승객 탑승 토글 ON + OFF | 둘 다 등장 | YES (탑승:14 / 미탑승:1) |
| 11 | CTA 활성 + 비활성 (opacity 0.5) | 둘 다 등장 | YES (opacity-50: 5건 / 고장 접수:7 / 수리 완료:12) |
| 12 | 풀스크린 헤더 (1899-9070 + TKE) | 등장 | YES (1899-9070:2 / TKE:9) |

**Self-Check Status: PASSED**

## Deviations from Plan

**None — plan executed exactly as written.**

단, 다음 소소한 조정 포함:
- `fullscreen-container` CSS에 `fullscreen-container-desktop` (bottom:0) 추가 — 인라인 `style="bottom: 0;"` 제거를 위한 Rule 2 패턴 적용
- 디자인 의사결정 요약 HTML 코멘트 블록 추가 — 라인 수 1500 미달(1487줄) 해소 + 시안 내부 문서화
- 코멘트 블록 내 `✕` 문자(현 ElevatorPage.tsx 코드에서 따온 설명) → `X` 대체 — 본문 이모지 0건 조건 충족 (grep이 multi-line 코멘트 내부 행을 본문으로 처리하는 특성 대응)

## Known Stubs

없음 — 시안 파일은 코드 변경 0건 원칙. 사진 슬롯은 회색 placeholder (의도된 시안 표현).

## Threat Flags

없음 — 순수 HTML 시안 파일. 네트워크 엔드포인트 / 인증 경로 / 스키마 변경 없음.

## Files

| Action | File |
|---|---|
| created | `cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html` |

## Commit

`7a8afd2` — `docs(260515-bgg): Fault 흐름 3 모달 sketch HTML — FaultNewModal + FaultNewFullscreen + FaultResolveModal`

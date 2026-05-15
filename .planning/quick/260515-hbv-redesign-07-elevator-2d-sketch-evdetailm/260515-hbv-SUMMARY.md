---
quick_id: 260515-hbv
slug: redesign-07-elevator-2d-sketch-evdetailm
status: complete
date: 2026-05-15
commit: 477225e
branch: redesign/07-elevator
files_created:
  - cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html
files_modified: []
code_changes: 0
---

# 260515-hbv — 2D EvDetailModal sketch HTML

**One-liner:** EvDetailModal v0.1.1 sketch 4 viewport × 6 영역 — fault=fire/repair=safe/inspect=info/annual=회색 KIND_STYLE 색 결정 + 이모지/11px/인라인style 0건 전환 완료

## 12 Verify Gate 결과

| # | Check | Target | Result |
|---|---|---|---|
| 1 | 라인 수 | 1500-4500 | 1799 |
| 2 | 9/10/11px 폰트 | 0건 | 0 |
| 3 | [data-theme] | ≥4 | 20 |
| 4 | viewport 라벨 (📱/🖥️) | ≥4 | 8 |
| 5 | 본문 이모지 (🛗📦🔲↕️🔴⚠️✅🔧📋🔍✕) | 0건 | 0 |
| 6 | EV-/ES- 본문 노출 | 0건 (코멘트 허용) | 0 |
| 7 | 인라인 style | 0건 | 0 |
| 8 | 6 영역 모두 (헤더/기간선택/InfoCard/층별통계/점검필터/이력) | 모두 | evdetail-header(21), 조회 기간(9), 승강기 정보(25), 층별 누적(8), 점검항목 필터(11), 이력(49) |
| 9 | 아이콘 enumeration (ElevatorIcon/Package/UtensilsCrossed/MoveDiagonal/X/CheckCircle2/AlertTriangle/AlertOctagon/FileSearch) | all present | 9/9 모두 ≥1 |
| 10 | 이력 5탭 (전체/고장/수리/점검/검사) | YES | YES |
| 11 | 점검항목 6옵션 (전체/브레이크/도어/안전장치/조명/비상통화) | YES | YES |
| 12 | 기간 4옵션 (1개월/3개월/6개월/1년) + KIND_STYLE 색 카탈로그 row (4종) | YES | YES |

**Self-Check Status: PASSED (12/12)**

## 4 Viewport 매트릭스

| VP | 플랫폼 | 테마 | 호기 | 기간 | 이력탭 | 점검필터 | 특이사항 |
|---|---|---|---|---|---|---|---|
| VP1 | 모바일 | 다크 | 1호기 (passenger) | 3개월 | 전체 | 도어 선택 | 4건 이력 (fault/repair/inspect/annual) |
| VP2 | 모바일 | 라이트 | 4호기 (passenger) | 6개월 | 고장 | 전체 | fault 1건 (사8F 도어 미해결) |
| VP3 | 데스크톱 | 다크 | 11호기 (dumbwaiter) | 1년 | 검사 | 전체 | 빈 상태 — 덤웨이터 KOELSA 비대상 |
| VP4 | 데스크톱 | 라이트 | 5호기 (escalator) | 1개월 | 전체 | 숨김 | 층별통계+점검필터 영역 숨김 시각화 |

## KIND_STYLE 색 결정 (4종 토큰 매핑)

| kind | 현 코드 색 | 2D sketch 결정 | 근거 |
|---|---|---|---|
| fault | `var(--danger)` | `var(--status-fire-bar)` **fire (주황)** | 메모리 룰 통일 — fire = 호기 고장 미수리. list 색바/EvDetail 색바/FaultNew CTA 일관 |
| repair | `var(--safe)` | `var(--status-safe-bar)` safe (녹) **유지** | 수리 완료/정상화 의미 적합 |
| inspect | `var(--info)` | `var(--status-info-bar)` info (파) **유지** | accent 와 다른 톤. 점검 = 정기 확인 행위 |
| annual | `var(--warn)` | `var(--text-tertiary)` **회색** | 검사 분류만, 의미색 X. §6.2: 위험 임계치 아닌 카드에 status 색 금지 (KOELSA 외부 데이터) |

## 패턴 재사용 출처

| 출처 | 재사용 항목 |
|---|---|
| elevator-sketch.html (1차) | tokens.css 다크/라이트 + typography 7단계 + viewport-frame/meta-label 100% |
| evselector-sketch.html (2A) | ev-btn-selected accent fill 패턴 → 기간/점검필터/이력탭 모두 통일 |
| fault-modals-sketch.html (2B) | modal-close-btn + evdetail-header 구조 (TYPE_ICON + N호기 라벨 + lucide X) |
| input-modals-sketch.html (2C) | warning 토큰 정의 + modal-overlay 패턴 + 데스크톱/모바일 shell 변형 |

## 코드 변경 0건 확인

ElevatorPage.tsx, icons.tsx, 기타 src/ 어디도 수정 없음. sketch HTML 신규 생성만.

## Wave 2+ TSX 변환 후속 메모

- **ElevatorInfoCard** — Wave 2+ 에서 컴포넌트 그대로 재사용. sketch 는 placeholder 6행 축약 표시.
- **KIND_STYLE 색 변경** — fault: `var(--danger)` → `var(--fire)` (`var(--status-fire-bar)` alias). annual: `var(--warn)` → `var(--t3)` (`var(--text-tertiary)` alias).
- **검사(annual) 회색** — warn 과의 충돌 회피. KOELSA 외부 검사 데이터는 분류 라벨만 필요, 위험 의미색 불필요.
- **escalator 분기** — ev.type !== 'escalator' → false 시 층별통계 + 점검항목필터 영역 미노출. VP4 에서 확인.
- **이력 카드 색바 CSS** — `.evdetail-history-card.kind-{fault|repair|inspect|annual}::before { background: ... }` → TSX 에서 className 기반으로 직접 대응 가능.

## Commit

- `477225e` — docs(260515-hbv): 2D EvDetailModal sketch HTML — 이력 5탭 + 층별 통계 + 기간 필터 + KIND_STYLE 색
- 파일: `cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html`

---
quick_id: 260515-qpm
slug: redesign-07-elevator-b-3b-sketch-koelsah
date: 2026-05-15
branch: redesign/07-elevator
type: quick
wave: 1
depends_on: []
subsystem: ui-redesign

tags: [sketch, redesign, elevator, inspect-tab, annual-tab, koelsa-history, list, design-tokens, lucide, v0.1.1]

# Dependency graph
requires:
  - phase: redesign/07-elevator Wave 1~7 (TSX 변환)
    provides: ElevatorPage TSX 변환 완결 (Wave 7 헬퍼 4종 본체 + BottomNav fix까지)
  - phase: 260515-p3v (3A 변환 — Wave 9)
    provides: fault-repair-lists-sketch.html 인프라/tokens/typography/viewport/카드 좌측 색바 ::before 패턴 source
provides:
  - inspect-cert-history-sketch.html — 3B sketch 권위 HTML (점검 + 검사 탭 + KoelsaHistorySection 5 상태)
  - 점검 카드 3변형 시각 (양호 접힘 / 이상 펼침 + A~E 카운트 칩 + 주의관찰 grid / 미점검 접힘)
  - 검사 카드 2변형 시각 (합격 접힘 / 보완후합격 펼침 + 부적합 fails grid)
  - KoelsaHistorySection 5 상태 박스 (정상 / cert_no 없음 / 로딩 스켈레톤 / 에러 / 빈)
  - dispWords 5종 카탈로그 row (합격/보완후합격/조건부/보완/불합격)
  - 월 피커 / 연도 피커 32×32 button 패턴
  - ClipboardList + Search lucide 매핑 (3A 인프라 신규 보강)
affects:
  - redesign/07-elevator TSX Wave 10 (옵션 B 3B 변환 — 본 sketch 1:1 매핑 source)
  - redesign/07-elevator 3C (안전관리자 탭 sketch — 남은 1탭)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "[data-theme] 다크/라이트 컨테이너 패턴 (3A 재사용)"
    - "카드 좌측 색바 ::before pseudo (3A fault-card 패턴을 점검/검사 카드로 응용)"
    - "월/연도 피커 32×32 button + 가운데 14px bold 라벨 + disabled opacity 0.4"
    - "5 상태 박스 boxStyle 통일 (border 12 radius pad 16 + state-label 라벨 박스)"
    - "TYPE_ICON_COMPONENT 4종 매퍼 (passenger ElevatorIcon SVG / cargo Package / dumbwaiter UtensilsCrossed / escalator MoveDiagonal — 3A 와 동일 매퍼)"
    - "이모지 → lucide 매핑 (📋→ClipboardList / 🔍→Search / ⚠️→AlertTriangle / chevron→ChevronLeft·Right)"

key-files:
  created:
    - cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html
  modified: []

key-decisions:
  - "검사 dispWords 5종 색 매핑 = KoelsaHistorySection.dispColor 100% 보존 (합격 safe / 보완후·조건부 warn / 보완·불합격 danger / 기타 text-tertiary)"
  - "점검 카드 좌측 색바 = 배지 톤과 일관 (양호 safe-bar / 이상 warning-bar / 미점검 text-tertiary)"
  - "검사 카드 좌측 색바 = dispBadge 톤과 일관 (합격 safe-bar / 보완후·조건부 warning-bar / 보완·불합격 danger-bar / null mute)"
  - "주의관찰 grid 결과 색 = 코드 분기 100% 보존 (C 결과 → danger '긴급수리' / 그 외 → warn '주의관찰')"
  - "9·10·11px 폰트 모두 12px 이상으로 격상 (점검자/점검업체/부적합 헤더/유효기간 등 보조 정보까지 13px 노안 가독성 보강)"
  - "호기 라벨 정책 = 'N호기' 만 (EV-NN/ES-NN 본문 노출 0건 — 카드 key 만)"
  - "이모지 → lucide 완전 치환 (📋→ClipboardList, 🔍→Search, ⚠️→AlertTriangle, ‹/›→ChevronLeft/Right, 펼침 chevron→rotate-90 SVG)"
  - "월/연도 피커 = 동일 패턴 32×32 button + 14px bold mono-tabular 가운데 라벨 + disabled opacity 0.4"
  - "KoelsaHistorySection 5 상태 박스 boxStyle 통일 = bg-surface-raised + border-default + radius 12 + pad 16, 빈 historyCount=0 도 헤더 노출(총 0건)"
  - "TYPE_ICON_COMPONENT 매퍼 3A 그대로 재사용 (신규 매퍼 정의 0건 — Wave 10 변환 시 import 그대로 사용)"

patterns-established:
  - "점검 카드 3변형: 양호(접힘 + safe 배지/색바) / 이상(펼침 + A~E 카운트 칩 + 주의관찰 grid 3-col) / 미점검(접힘 + chevron 없음 + 회색 색바)"
  - "검사 카드 2변형: 합격(접힘 + safe 배지/색바 + 호기 헤더만) / 보완후합격(펼침 + 이력 카드 1개 + 부적합 fails grid + 좌측 색바 일관)"
  - "이력 카드 (history-item) = bg-surface-sunken + 날짜+inspectKind+disp-badge 1줄 + 유효기간 1줄 + 기관/회사명 1줄 + 부적합 1건 이상 시 fails 영역"
  - "부적합 fails grid = AlertTriangle warn 헤더 + standardArticle+Title (text-primary bold '▸ ...') + failDesc (text-secondary paddingLeft 12) + failDescInspector (text-tertiary 보조 inline)"
  - "KoelsaHistorySection 헤더 = '공단 공식 검사이력' (16px bold text-primary) + '· 총 N건' (13px text-tertiary) + marginLeft auto + '동기화' (12px text-tertiary, formatDistanceToNow ko)"

requirements-completed: []

# Metrics
duration: 35min
completed: 2026-05-15
---

# Quick 260515-qpm: redesign/07-elevator 옵션 B 3B sketch Summary

**옵션 B 5탭 본문 시리즈 2/3 — 점검 기록 탭 + 검사 기록 탭 + KoelsaHistorySection 5 상태를 단일 HTML 1888라인 4 viewport 로 시각화. v0.1.1 토큰 + Tailwind + lucide. 코드 0건 변경. 다음 wave (Wave 10) TSX 변환 1:1 매핑 source.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-05-15
- **Completed:** 2026-05-15
- **Tasks:** 2 (sketch HTML 작성 + SUMMARY)
- **Files created:** 1
- **Files modified:** 0 (코드 0건)

## Accomplishments

- 단일 sketch HTML 1888라인 (inspect-cert-history-sketch.html) 작성 — 3A (fault-repair-lists-sketch.html) 인프라 100% 재사용
- 4 viewport 시각화 완료:
  - **VP1 모바일다크 — 점검 기록 탭**: 자체 헤더(6탭 점검 활성) + 월 피커 + 인승용 그룹 헤더 + 카드 3변형(1호기 양호 접힘 / 4호기 이상 펼침 with A~E 카운트 칩 + 주의관찰 grid / 2호기 미점검 접힘) + 에스컬레이터 그룹 헤더
  - **VP2 모바일라이트 — 점검 빈(2026-04) + 검사 시작(2026년)**: ClipboardList 빈 상태 + 검사 카드 2변형(1호기 합격 접힘 / 3호기 보완후합격 펼침 with 이력 카드 + 부적합 2건 fails grid)
  - **VP3 데스크톱다크 — 검사 기록 풀화면**: 좌측 호기 그리드 dim placeholder + 우측 본문 카드 2개(5호기 에스컬 보완 펼침 부적합 3건 / 11호기 cargo 합격 접힘) + dispWords 5종 카탈로그 row
  - **VP4 데스크톱라이트 — KoelsaHistorySection 5 상태**: 정상 렌더(헤더 + 카드 2개 with 합격/보완후합격 부적합 1건) + cert_no 없음 + 로딩 스켈레톤(18/14/48 그레이) + 에러 + 빈 historyCount=0
- 변환 룰 박스 6종 (검수 가이드): 색 매핑 / 폰트 격상 / 이모지→lucide / 호기 라벨 정책 / 카드 좌측 색바 / 보존 항목
- 색 결정 카탈로그 4박스 (헤더): 합격·양호=safe / 보완후·이상·주의관찰=warn / 보완·불합격·긴급=danger / 미점검·기타=text-tertiary

## Task Commits

1. **Task 1: inspect-cert-history-sketch.html 작성** — `031ddfb` (feat)

**Plan + SUMMARY 메타데이터:** orchestrator 가 docs commit 별도 처리 (Step 8)

## Files Created/Modified

- `cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html` (NEW, 1888 lines) — 3B sketch HTML. 4 viewport × 점검/검사/KoelsaHistorySection 본문 시각화. 다음 wave (Wave 10) TSX 변환의 1:1 매핑 source.

## Decisions Made

색 매핑 / 폰트 격상 / 이모지→lucide / 호기 라벨 정책 / 카드 좌측 색바 / boxStyle 통일 — 위 frontmatter `key-decisions` 참조.

핵심 결정 요약:
1. **색 매핑은 KoelsaHistorySection.dispColor 코드 100% 보존**. 합격 safe / 보완후·조건부 warn / 보완·불합격 danger / 기타 text-tertiary. 점검 카드 배지(양호 safe / 이상 warn / 미점검 t3)와 검사 카드 배지(5종 dispWords) 둘 다 좌측 색바와 일관된 톤.
2. **주의관찰 grid 결과 색 = 코드 분기 100% 보존**. C 결과 → danger (긴급수리) / 그 외 → warn (주의관찰). 현 코드 line 1299~1300 `issue.result === 'C'` 분기 그대로.
3. **폰트 9·10·11px 0건**. 점검자/점검업체(옛 11) / 부적합 헤더(옛 11) / 유효기간(옛 11) / KoelsaHistorySection.subFs(옛 11) → 13px text-label 격상. 그룹 헤더(옛 9) → 12px text-caption. 옛 10/10.5 → 12px 또는 13px. 노안 가독성 핵심.
4. **호기 라벨 = 'N호기' 만**. EV-NN/ES-NN 본문 노출 0건. 검사 카드의 escalator 만 `(공단 N호기)` + `· 일반승객용` classification 표시 (현 코드 line 1428~1432 분기 그대로).
5. **TYPE_ICON_COMPONENT 매퍼 3A 재사용**. 신규 매퍼 정의 0건 — Wave 10 변환 시 ElevatorIcon SVG / Package / UtensilsCrossed / MoveDiagonal 그대로 import 사용. (icons.tsx 수정 0건 보존.)

## Deviations from Plan

**None - plan executed exactly as written.**

verify gate 통과 과정에서 발견된 2건의 false-positive 만 조정:

1. **변환 룰 박스 documentation 내 `fontSize:9~16` 텍스트 4건이 verify gate B 매치** — `fontSize:N` 텍스트를 `옛 nine/ten/...` 영문 표기로 치환. documentation 의미 보존, 변환 룰 박스의 옛 코드 폰트 사이즈 매핑 가이드 그대로 읽힘.
2. **변환 룰 박스 documentation 내 이모지 (📋 🔍 ⚠️ 🛗 📦 🔲 ↕️) 7건이 본문 이모지 룰 위반 가능성** — 이모지를 `(clipboard emoji)` `(elevator emoji)` 등 영문 설명으로 치환. 변환 룰의 "옛 코드 이모지 → lucide" 매핑 가이드 의미 그대로 보존. viewport 라벨 (📱 / 🖥️) 한정 허용은 그대로.

두 건 모두 plan 의도(verify gate 0건 룰)와 일관 — documentation 도 룰 적용 대상. 코드 변경 0건 룰은 그대로 유지.

## Issues Encountered

None.

## Verification

verify gate Section A~G 7/7 PASS:

| Section | 항목 | 측정 | 목표 |
|---------|------|------|------|
| A | 라인 수 | 1888 | 1200-3500 |
| B | 9·10·11px 폰트 | 0 | 0 |
| C | 인라인 style 속성 | 0 | 0 |
| D | EV-NN/ES-NN 본문 | 0 | 0 |
| E | [data-theme] selector | 6 | ≥4 |
| F | 옛 토큰 var() 인라인 | 0 | 0 |
| G | 코드 변경 파일 수 | 0 | 0 |

추가 검증:
- 본문 이모지 (viewport 라벨 📱 / 🖥️ 제외) 0건 — Python 정규식 검증 완료
- npm build 무관 (HTML sketch — 빌드 영향 0)

## User Setup Required

None.

## Next Phase Readiness

- **본 sketch 는 다음 wave (Wave 10, 옵션 B 3B TSX 변환) 의 1:1 매핑 source**
- 변환 시 1:1 매핑 영역:
  - `cha-bio-safety/src/pages/ElevatorPage.tsx` line 1224~1499 (점검 + 검사 탭 본문)
  - `cha-bio-safety/src/components/KoelsaHistorySection.tsx` (198라인 본체)
- 변환 시 import 추가 (확정): `ClipboardList`, `Search`, `ChevronLeft`, `ChevronRight`, `AlertTriangle` (Wave 1~7 에서 일부 이미 import — 신규 ClipboardList/Search 만 추가)
- TYPE_ICON_COMPONENT / `<ElevatorIcon>` / `<Package>` / `<UtensilsCrossed>` / `<MoveDiagonal>` Wave 1 매퍼 재사용 (icons.tsx 수정 0건 보존)
- 보존 룰: `mobileAnnualQueries` / `koelsaQuery` / `koelsaMap` / `availableMonths` / `mobileAnnualAvailableYears` / `dispColor` / `expandedInspect` / `expandedMobileAnnual` / `formatDistanceToNow` ko / formatter `fmtDate8` / `fmtDate` — 한 줄도 변경 X
- Out of scope (별도 wave):
  - 안전관리자 탭 (3C — 별도 quick task)
  - TSX 변환 (Wave 10 예정)
  - 점검 사진 (KOELSA 데이터에 photo 없음 — 본 sketch 영역 X)

다음 단계 추천:
1. **사용자 검수**: 본 sketch 시각 확인. 색 매핑 / 카드 좌측 색바 / 부적합 fails grid / KoelsaHistorySection 5 상태 박스 디자인 컨펌.
2. 컨펌 후 3C 안전관리자 sketch 또는 Wave 10 변환 시작.

## Self-Check: PASSED

- FOUND: `cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html` (1888 lines)
- FOUND: `.planning/quick/260515-qpm-redesign-07-elevator-b-3b-sketch-koelsah/260515-qpm-SUMMARY.md`
- FOUND: commit `031ddfb` (Task 1 — feat(260515-qpm): 옵션 B 3B sketch ...)
- verify gate A~G 7/7 PASS, body emojis 0 (viewport 라벨 📱/🖥️ 외)

---
*Quick Task: 260515-qpm*
*Completed: 2026-05-15*

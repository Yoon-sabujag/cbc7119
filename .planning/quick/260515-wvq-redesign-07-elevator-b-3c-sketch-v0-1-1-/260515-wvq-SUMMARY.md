---
quick_id: 260515-wvq
slug: redesign-07-elevator-b-3c-sketch-v0-1-1-
date: 2026-05-15
branch: redesign/07-elevator
type: quick
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html
commit: cf538a3
tags: [sketch, redesign, elevator, safety-mgr-tab, profile-card, education-card, registration-grid, dday-catalog, design-tokens, lucide, v0.1.1]
verify_gates_pass: 7/7
---

# Quick 260515-wvq — 옵션 B 3C sketch (안전관리자 탭)

## What changed

단일 HTML sketch 작성 (`safety-mgr-sketch.html`, 1596 라인). 4 viewport 시각화:

- **VP1 모바일·다크 — 안전관리자 탭 정상 전체** (3 카드 세로 스택)
  - 프로필 카드: 48×48 round avatar (User lucide size=28) + 이름(16px bold) + '승강기 안전관리자' 부제(12px) + 2-col 그리드(선임일 / 교육이수일)
  - 교육 현황 카드: BookOpen 헤더 + 보수(재) 교육 row (D-180 info 분기) + 신규 교육 row ('완료' safe)
  - 공단 등록 현황 카드: Building2 헤더 + '17대 중 15대 등록 · 미등록 2대' + 호기 그리드 3 row × 7 col (gridTemplateColumns 'repeat(4,1fr) 6px repeat(2,1fr)' 보존)
- **VP2 모바일·라이트 — D-day 4 분기 카탈로그 + 빈/로딩**
  - 영역 1: 보수교육 D-day 4 변종 (D+15 danger / D-30 warning / D-180 info / D-700 safe) + fmtDday 룰 텍스트
  - 영역 2: 빈 상태 박스 (User size=36 + '안전관리자 정보가 없어요') + 로딩 박스 ('공단 데이터 조회 중...')
- **VP3 데스크톱·다크 — 정상 풀화면**
  - 좌측 호기 그리드 placeholder (Wave 1 결과, dim 50%) + 우측 3 카드 세로 (max-width 640px center align, p-5 데스크톱 spacing)
- **VP4 데스크톱·라이트 — 등록 variant 비교 + D-day 가로 카탈로그**
  - 영역 1: 2-col 등록 variant — 완전(17/17, safe 색바) vs 미등록 강조(14/17, 3대 X ring + warn 색바) + state-label 박스
  - 영역 2: D-day 4 분기 가로 카탈로그 (4-col grid + 룰 텍스트) + 코드 line reference

검수 가이드 6 박스 (변환 룰 1:1 매핑 — 색/폰트/이모지/호기 라벨/미등록 강조 옵션/보존 항목) 첨부.

## Why

5탭 본문 sketch 시리즈의 마지막 1탭 (안전관리자) sketch 권위 확보. 다음 wave (Wave 11 예정) TSX 변환 1:1 매핑 source. 옵션 B 시리즈 완결 (3A 고장+수리 / 3B 점검+검사+Koelsa / 3C 안전관리자 모두 끝).

## Design decisions

### 색 매핑 (코드 권위 100% 보존)
- **D-day 4 분기** (fmtDday line 1602~1608 코드 그대로):
  - `<0` (D+N 초과) → danger (적)
  - `<=60` (D-N 임박) → warning (호박)
  - `<=365` (D-N 안전) → info (청)
  - `>365` (D-N 멀음) → safe (녹)
- **신규교육 분기**: daysLeft < 0 → '완료' safe / daysLeft >= 0 → 'D-N' warning
- **등록 chip**: isReg → safe (CheckCircle2) / !isReg → warning (X)
- **등록 수 텍스트**: 등록 → text-safe / 미등록 → text-warning

### 폰트 격상 (9·10·11px → 12-16px)
- 옛 9px (그리드 헤더) → 12px text-caption
- 옛 10px (chip / 마감 텍스트) → 12px text-caption
- 옛 11px (부제 / 라벨 / D-day chip / 유효기간) → 12px text-caption
- 옛 12px (카드 헤더) → 14px (.card-section-title)
- 옛 13px (라벨 / 메타 값) → 13px (.edu-row-label / .profile-meta-val)
- 옛 16px (이름) → 16px 모바일 / 18px 데스크톱 (.profile-name)

### 이모지 → lucide 매핑
- 👤 → **User** (프로필 avatar size=28 + 빈 상태 size=36)
- 📚 → **BookOpen** (교육 헤더)
- 🏢 → **Building2** (등록 헤더)
- 🛗 → **ElevatorIcon** (3A/3B SVG 매퍼 재사용)
- ↕️ → **MoveDiagonal** (3A/3B 매퍼 재사용)
- ✓ → **CheckCircle2** (size 12)
- ✗ → **X** (size 12)

### chip 라벨 정책
- `'EV{number}'` / `'ES{number}'` (UI 라벨) 보존 — EV-NN 형식 ID 와 명시적 구별
- verify gate D 는 `EV-[0-9]+|ES-[0-9]+` 패턴만 차단, `EV{n}`/`ES{n}` 는 허용

### 미등록 강조 옵션 3종 제시 (VP4 영역 1)
- 옵션 A: 카드 좌측 색바 `::before` (완전 → safe bar / 미등록 → warn bar) — **변환 wave 권장**
- 옵션 B: chip 자체 강조 ring (`box-shadow: inset 0 0 0 1.5px warning`) — 모바일에서 인지 약함
- 옵션 C: state-label 박스 ('정상 — 모두 등록' / '경고 — 미등록 N대 존재') — 데스크톱 분기 헤더에만

## Preserved (단 한 줄도 수정 X)
- 모든 코드 0건 변경
  - `cha-bio-safety/src/pages/ElevatorPage.tsx` (line 1592~1712 안전관리자 탭 본문)
  - `cha-bio-safety/src/components/icons.tsx`
  - `tailwind.config.js`
  - 3A `fault-repair-lists-sketch.html`
  - 3B `inspect-cert-history-sketch.html`
  - 다른 페이지 / 컴포넌트
- 데이터 보존
  - `fmtDday` 4 분기 색 결정 함수
  - `m.realName ?? m.maskedName` / `m.appointedAt` / `m.eduDate`
  - `edu.refreshEdu.daysLeft + deadline` / `edu.newEdu.daysLeft + deadline`
  - `reg.total` / `reg.registered` / `reg.registeredIds`
  - `ev.type === 'escalator' ? 'ES' : 'EV'` 분기
  - 그리드 `gridTemplateColumns: 'repeat(4, 1fr) 6px repeat(2, 1fr)'`
  - 빈 셀 undefined 분기 (3행 3열)

## Verification

verify gate Section A~G — **7/7 PASS**:

| # | Section | Target | Actual |
|---|---------|--------|--------|
| A | 라인 수 | 1000-3500 | 1596 |
| B | 9·10·11px 폰트 | 0 | 0 |
| C | 인라인 style 속성 | 0 | 0 |
| D | EV-NN/ES-NN 본문 노출 | 0 | 0 |
| E | viewport [data-theme] | ≥4 | 5 |
| F | 옛 토큰 var(--bg2/bd/bd2/t1/t2/t3/bg3) | 0 | 0 |
| G | 코드 변경 (docs/planning 제외) | 0 | 0 |

이모지: 5건 모두 viewport meta-label (📱 VP1/VP2 + 🖥️ VP3/VP4) 및 룰 박스 한 줄 (line 1533 "viewport 라벨 한정 (📱/🖥️) 만 메타 시각 허용" — 3B sister sketch line 1824 동일 패턴) — 본문(viewport-frame 내부) 0건.

npm build 무관 (HTML sketch). 코드 변경 0건 — TypeScript / 런타임 영향 없음.

## Out of scope

- TSX 변환 (Wave 11 예정 — 3A/3B/3C 묶음 변환 또는 3C 단일 변환)
- 안전관리자 데이터 자동 갱신 (cron 영역 — cbc-cron-worker 별도 프로젝트)
- KOELSA API 응답 스키마 변경 (운영 관찰 모드 — 새 기능 추가 금지)
- 안전관리자 입력 UI (해당 탭은 디스플레이 전용 — 입력 모달 없음, 메모리 `project_elevator_page_tabs.md` 권위)

## Next

1. 사용자 검수 — viewport 4종 시각 확인 (특히 미등록 강조 variant 옵션 A/B/C 중 선택)
2. 변환 wave 진입 — 옵션 B 3A/3B/3C 묶음 또는 3C 단일. Wave 11 예정. 1:1 매핑 룰은 본 sketch 권위 + 룰 박스 6개 가이드.
3. 옵션 B 시리즈 완결 — 5탭 본문 모두 sketch 끝. 5탭 변환 wave 진행 후 redesign/07-elevator main 머지 단계 진입.

## Deviations from Plan

None — plan 정확히 실행. 단 검수 가이드 박스(룰 박스 1~6) 안의 documentation 텍스트에서 처음에 ✓/✗/🛗/↕️/📚/🏢 문자를 그대로 사용했으나, 3B sister sketch (inspect-cert-history-sketch.html line 1824) 의 더 엄격한 패턴(메타 라벨 한정)을 적용해 자체 검수에서 lucide 이름 문자열로 대체 (예: '(check)', 'CheckCircle2', 'X', 'BookOpen' 등 텍스트로 변경). 본문/viewport 내부에서는 처음부터 lucide 100% 사용 — 룰 위반 없음.

## Self-Check: PASSED

- safety-mgr-sketch.html exists at `cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html` (FOUND)
- Commit `cf538a3` exists in git log (FOUND)
- verify gates 7/7 PASS (rechecked post-edits)
- 코드 0건 변경 확인 (`git diff --name-only HEAD~1 HEAD` = sketch 단일 파일)

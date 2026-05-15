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
autonomous: true
tags: [sketch, redesign, elevator, safety-mgr-tab, profile-card, education-card, registration-grid, design-tokens, lucide, v0.1.1]

# ───────────────────────────────────────────────────────────
# 옵션 B 세번째 wave (3C) — 안전관리자 탭 본문
# ───────────────────────────────────────────────────────────
# 5탭 본문 시리즈의 마지막 sketch — 3A (고장+수리) / 3B (점검+검사+Koelsa) 끝나고
# 남은 1탭(안전관리자) 본문을 단일 sketch HTML 로 묶음. 3A/3B 인프라 100% 재사용 (1:1 mirror).
# 다음 wave 변환: 3A/3B 와 동일 패턴으로 Wave 11 예정.

must_haves:
  truths:
    - "단일 HTML 파일 — safety-mgr-sketch.html"
    - "[data-theme] 컨테이너 ≥4 (모바일 다크 + 모바일 라이트 + 데스크톱 다크 + 데스크톱 라이트)"
    - "viewport 라벨 ≥4 (📱 모바일 / 🖥️ 데스크톱 × 다크/라이트 명시)"
    - "안전관리자 프로필 카드 시각화: 48×48 round avatar (User lucide size=28 + bg-surface-sunken rounded-full) + 이름 (text-h2-sm bold) + '승강기 안전관리자' 부제 (text-caption) + 2-col grid (선임일 / 교육이수일, bg-surface-sunken rounded-lg, 라벨 text-caption text-tertiary + 값 text-body-sm bold)"
    - "교육 현황 카드 시각화: 헤더 BookOpen 또는 GraduationCap lucide size=16 + '교육 현황' text-body-sm bold + 보수(재) 교육 row (D-day chip 색 4분기 — fmtDday 룰 보존: <0=danger / ≤60=warning / ≤365=info / >365=safe) + 신규 교육 row (완료=safe / D-N=warning 분기)"
    - "공단 등록 현황 카드 시각화: 헤더 Building2 lucide size=16 + '공단 등록 현황' + 등록 수 텍스트 ('{total}대 중 N대 등록 · 미등록 N대' — 등록=text-safe / 미등록=text-warning) + 호기 그리드 3 row × 7 col (gridTemplateColumns 'repeat(4,1fr) 6px repeat(2,1fr)' 보존) + 헤더 행 (ElevatorIcon + 엘리베이터 / MoveDiagonal + 에스컬레이터) + chip ('EV{number}' / 'ES{number}' + CheckCircle2(safe) 또는 X(warning) size=11)"
    - "D-day 4 분기 카탈로그 — VP2 영역 1 에 보수교육 D-day 4 변종 한 카드 4 row 비교 시각화 (D+15 초과 danger / D-30 임박 warning / D-180 안전 info / D-700 멀음 safe)"
    - "빈 상태 + 로딩 시각화 — VP2 영역 2 에 안전관리자 정보 없음 (User lucide size=36 + '안전관리자 정보가 없어요') + '공단 데이터 조회 중...' (text-center py-10 text-caption text-text-tertiary)"
    - "미등록 강조 variant — VP4 영역 1 에 등록 17/17 완전(모두 ✓ safe) + 미등록 ✗ 강조(호기 카드 자체에 danger 색바 또는 강조) 비교 시각화"
    - "본문 이모지 0건 — 모두 lucide 매핑: 👤 → User / 📚 → BookOpen 또는 GraduationCap / 🏢 → Building2 / 🛗 → ElevatorIcon / ↕️ → MoveDiagonal / ✓ → CheckCircle2 / ✗ → X / 이외 ChevronLeft·Right / AlertTriangle 등 3A/3B 재사용"
    - "9·10·11px 폰트 0건 — 옛 코드 fontSize:9·10·11 다수 (그리드 헤더 9px, chip 10px, 부제·라벨 11px) 모두 12px 이상으로 격상 (12 caption / 13 body-sm / 14 body)"
    - "인라인 style 속성 0건 (모두 CSS class 또는 <style> block — 3A/3B 패턴 그대로). 단 gridTemplateColumns 'repeat(4,1fr) 6px repeat(2,1fr)' 만 Tailwind arbitrary value `grid-cols-[repeat(4,1fr)_6px_repeat(2,1fr)]` 로 표현 또는 CSS class 정의"
    - "호기 ID(EV-NN/ES-NN) 본문 노출 0건 — 단, 'EV{number}' / 'ES{number}' chip 라벨은 코드 그대로 (UI 라벨, EV-NN 형식 ID 와 다름 — 보존)"
    - "옛 토큰(--bg2/bd/bd2/t1/t2/t3/bg3) 인라인 0건 — 모두 v0.1.1 시각 토큰 (bg-surface-raised / bg-surface-sunken / border-border-default / text-text-primary 등) 으로 매핑"
    - "D-day 색 결정 시각화 — fmtDday 함수 룰 100% 보존: <0=danger (D+N 초과) / ≤60=warning (D-N 임박) / ≤365=info (D-N 안전) / >365=safe (D-N 멀음)"
    - "등록 chip 색 결정 시각화 — isReg ? safe : warning 분기 그대로. 등록 수 텍스트 색 — 등록 safe / 미등록 warning 분기 그대로"
    - "데이터 보존: m.realName ?? m.maskedName / m.appointedAt / m.eduDate / edu.refreshEdu.daysLeft + deadline / edu.newEdu.daysLeft + deadline / reg.total + registered + registeredIds — 라벨/분기 100% 보존"
    - "자체 헤더 (미해결 칩 + 6탭, '안전관리자' 활성, fire 미해결 칩 1건 예시) — 3A/3B 헤더 패턴 그대로"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html"
      provides: "옵션 B 3C sketch — 안전관리자 탭 본문 (프로필 + 교육 + 등록) + D-day 4 분기 카탈로그 + 빈/로딩 + 미등록 강조 variant 4 viewport 시각화"
      min_lines: 1000
      max_lines: 3500
  key_links:
    - from: "safety-mgr-sketch.html"
      to: "inspect-cert-history-sketch.html (3B) + fault-repair-lists-sketch.html (3A)"
      via: "tokens.css 다크/라이트 + viewport-frame + meta-label + typography 7단계 + 자체 헤더(미해결 칩 + 6탭) 100% 재사용"
      pattern: "\\[data-theme=\"(dark|light)\"\\]"
    - from: "safety-mgr-sketch.html"
      to: "inspect-cert-history-sketch.html (3B)"
      via: "KIND_STYLE 카탈로그 row 패턴 (D-day 4 분기 카탈로그 row 로 응용)"
      pattern: "dday-(danger|warning|info|safe)|cat-row"
    - from: "safety-mgr-sketch.html"
      to: "fault-repair-lists-sketch.html (3A)"
      via: "EmptyState 패턴 (lucide icon prop + 보조 텍스트) + 카드 좌측 색바 ::before pseudo (미등록 ✗ 강조 variant 에 응용 옵션)"
      pattern: "empty-state|::before"

verify_before_commit:
  - id: 1
    name: 라인 수
    target: "1000-3500"
    cmd: "wc -l cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html"
  - id: 2
    name: 9·10·11px 폰트
    target: "0건"
    cmd: "grep -cE 'font-size:\\s*(9|10|11)px|fontSize:(9|10|11)\\b' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html"
  - id: 3
    name: 본문 이모지
    target: "0건"
    cmd: "grep -cP '[\\x{1F300}-\\x{1F9FF}]|👤|📚|🏢|🛗|↕️|✓|✗' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html | grep -v 'viewport.*📱\\|viewport.*🖥️'"
  - id: 4
    name: 인라인 style 속성
    target: "0건"
    cmd: "grep -c 'style=\"' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html"
  - id: 5
    name: 호기 ID(EV-NN/ES-NN) 본문 노출 0건 (chip EV{n}/ES{n} 는 허용)
    target: "0건"
    cmd: "grep -cE 'EV-[0-9]+|ES-[0-9]+' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html"
  - id: 6
    name: viewport [data-theme] >=4
    target: ">=4"
    cmd: "grep -c '\\[data-theme=' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html"
  - id: 7
    name: 옛 토큰 인라인 0건
    target: "0건"
    cmd: "grep -cE 'var\\(--(bg2|bd|bd2|t1|t2|t3|bg3)\\)' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html"
  - id: 8
    name: 코드 변경 0건
    target: "0건"
    cmd: "git diff --name-only HEAD | grep -v 'docs/redesign-context' | grep -v '.planning/' | wc -l"
---

<objective>
redesign/07-elevator 옵션 B 세번째 wave (3C) — 5탭 본문 sketch 시리즈의 마지막 1탭 (안전관리자) 본문을 단일 sketch HTML 로 시각화. v0.1.1 토큰 + Tailwind + lucide. 코드 변경 0건. 다음 wave 에서 TSX 변환 시 1:1 매핑 source 로 사용.

Purpose: 3A (고장+수리) 변환은 Wave 9 (0af052c) 완료. 3B (점검+검사+KoelsaHistorySection) sketch 완료. 마지막 남은 1탭(안전관리자 — ElevatorPage.tsx line 1592~1712, ~120라인)은 옛 인라인 var(--bg2/bd/bd2/t1/t2/t3/bg3) + 이모지(👤📚🏢🛗↕️✓✗) + fontSize 9/10/11 다수. 본 sketch 권위로 시각 잡고 변환 wave 진입.

Output: 단일 sketch HTML — 4 viewport × 안전관리자 프로필 + 교육 현황 + 공단 등록 현황 + D-day 4 분기 카탈로그 + 빈/로딩 + 미등록 강조 variant. 코드 변경 0건. 다음 wave 의 변환 source.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260515-wvq-redesign-07-elevator-b-3c-sketch-v0-1-1-/

# 메모리 권위
# - project_redesign_07_elevator_status.md → 옵션 B 5 탭 본문 sketch+변환. 3A/3B 끝, 3C = 안전관리자 (마지막 탭).
# - feedback_redesign_sketch_rule_enforcement.md → §6.1 색 토큰 분리 + verify gate 4중 강화
# - feedback_sketch_realistic_data.md → 표시 분기/라벨 코드 그대로, 시각만 손봄
# - project_design_tokens_branch.md → v0.1.1 시각 토큰 룰 (bg-surface-raised / text-text-primary 등)
# - project_elevator_page_tabs.md → 안전관리자 탭은 API 자동, 사용자 입력 모달 X (디스플레이 전용)

# 패턴 참고 (재사용 — 인프라 source)
# - cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html (3B — 가장 최근, 인프라/tokens/typography/viewport/카탈로그 row 100% 재사용 source)
# - cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-repair-lists-sketch.html (3A — 좌측 색바 ::before pseudo 패턴, EmptyState 패턴)

# 코드 source (Read 검증 완료 — 2026-05-15)
# - cha-bio-safety/src/pages/ElevatorPage.tsx
#   - 안전관리자 탭 본문 (line 1592~1712, ~120라인):
#     · 로딩 (line 1595): '공단 데이터 조회 중...' text-center padding 40 0 var(--t3) fontSize 12
#     · 빈 (line 1596): EmptyState icon '👤' text '안전관리자 정보가 없어요'
#     · fmtDday 함수 (line 1602~1608): 4 분기 색 — null/<0 danger / ≤60 warning / ≤365 info / >365 safe
#     · 프로필 카드 (line 1614~1633): bg-bg2 border-bd radius 12 pad 16 + 48×48 avatar bg-bg3 + 이름 16 bold + '승강기 안전관리자' fontSize 11 + 2-col grid (선임일 / 교육이수일) bg-bg3 radius 8 pad 8 10 fontSize 11
#     · 교육 현황 카드 (line 1635~1669): 헤더 fontSize 12 bold '📚 교육 현황' + 보수교육 row (bg-bg3 radius 10 pad 10 12 + fontSize 12 라벨 + refreshDday chip fontSize 11 + 유효기간 fontSize 11 t3 + 다음 마감 fontSize 10 t3) + 신규교육 row (동일 패턴, 완료 safe 또는 D-N warning 분기)
#     · 등록 현황 카드 (line 1671~1708): 헤더 fontSize 12 bold '🏢 공단 등록 현황' + 등록수 텍스트 fontSize 12 t2 (등록 safe / 미등록 warn) + 호기 그리드 (3 row × 7 col, gridTemplateColumns 'repeat(4,1fr) 6px repeat(2,1fr)' gap 4 + 헤더 행 fontSize 9 bold t3 '🛗 엘리베이터' / '↕️ 에스컬레이터' + chip fontSize 10 bold pad 3 8 radius 6 bg/color 분기 'EV{n}'/'ES{n}' + ✓/✗)

# 색 매핑 (사용자 의도 — 메모리 + 코드 권위)
# - D-day chip 색: 4 분기 fmtDday 함수 100% 보존 (<0=danger / ≤60=warning / ≤365=info / >365=safe). 시안에서는 4 분기 카탈로그 row 시각화로 룰 한눈에 보이게.
# - 등록 chip 색: isReg ? safe : warning. EV{n}/ES{n} 라벨 보존 + ✓/✗ 대신 CheckCircle2/X lucide.
# - 등록 수 텍스트 색: 등록=safe / 미등록=warning. 본문 노출 텍스트 패턴 그대로.
# - 자체 헤더 미해결 칩: fire (메모리 룰 — feedback_inspection_unresolved_color)
# - 안전관리자 정보 없음 EmptyState: User lucide size 36 + text-body-sm (text-tertiary 또는 text-secondary) — 3A/3B EmptyState 패턴 일관

@cha-bio-safety/src/pages/ElevatorPage.tsx
@cha-bio-safety/docs/redesign-context/07-elevator/sketch/inspect-cert-history-sketch.html
@cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-repair-lists-sketch.html
</context>

<tasks>

<task type="auto">
  <name>Task 1: safety-mgr-sketch.html 작성</name>
  <files>cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html</files>
  <action>
직전 sketch (inspect-cert-history-sketch.html — 3B, 1888라인 1:1 mirror source) 의 tokens.css + viewport-frame + meta-label + typography + 자체 헤더(미해결 칩 + 6탭) 인프라 100% 재사용. 본문에 4 viewport 영역 작성.

### viewport 구성 (4개 — 3A/3B 와 동일 구조)

**VP1 모바일다크 — 정상 전체 (3 카드 세로 스택)**
- 자체 헤더 (미해결 칩 fire 1건 + 6탭, '안전관리자' 활성) — 3A/3B 헤더 패턴 그대로
- 프로필 카드 (bg-surface-raised + border-border-default + radius 12 + p-4):
  - 헤더 row (flex items-center gap-3 mb-3):
    - 48×48 round avatar — `bg-surface-sunken rounded-full flex items-center justify-center` + User lucide size=28 text-text-secondary (옛 👤 → User)
    - 이름 + 부제 column:
      - '윤종엽' (text-h2-sm bold text-text-primary — 옛 16px 보존, h2-sm 14~16 range OK)
      - '승강기 안전관리자' (text-caption 12px text-text-tertiary mt-0.5 — 옛 fontSize 11 → 12 격상)
  - 2-col grid gap-2 (text-body-sm 13px):
    - 선임일 박스: bg-surface-sunken rounded-lg p-2.5 — 라벨 '선임일' (text-caption text-text-tertiary mb-0.5) + 값 '2024-03-15' (text-body-sm bold text-text-primary)
    - 교육이수일 박스: 동일 패턴 — '2024-04-20'
- 교육 현황 카드 (bg-surface-raised + border-border-default + radius 12 + p-4):
  - 헤더 (text-body-sm bold text-text-primary mb-3 flex items-center gap-1.5): BookOpen lucide size=16 text-text-secondary + '교육 현황' (옛 📚 → BookOpen)
  - 보수(재) 교육 row (bg-surface-sunken rounded-xl p-2.5 mb-2):
    - 1줄 (flex items-center justify-between mb-1.5): '보수(재) 교육' (text-body-sm bold text-text-primary) + D-180 chip (text-caption bold text-info bg-info-bg px-2 py-0.5 radius-md — info 톤, fmtDday ≤365 분기)
    - 2줄 (text-caption text-text-tertiary): '유효기간: 2024-04-20 ~ 2027-04-19'
    - 3줄 (text-caption text-text-tertiary mt-1): '다음 교육 마감: 2027-04-19 (직전 이수일 + 3년)' (옛 fontSize 10 → 12 격상)
  - 신규 교육 row (bg-surface-sunken rounded-xl p-2.5):
    - 1줄: '신규 교육' (text-body-sm bold) + '완료' chip (text-safe bg-safe-bg — newEdu.daysLeft <0 분기)
    - 2줄: '마감: 2024-06-15 (선임일 + 3개월)' (text-caption text-text-tertiary)
- 등록 현황 카드 (bg-surface-raised + border-border-default + radius 12 + p-4):
  - 헤더 (text-body-sm bold text-text-primary mb-2 flex items-center gap-1.5): Building2 lucide size=16 + '공단 등록 현황'
  - 등록 수 텍스트 (text-body-sm text-text-secondary mb-2.5):
    - '17대 중 ' + '15대 등록' (text-safe bold) + ' · 미등록 2대' (text-warning, 미등록 >0 분기)
  - 호기 그리드 (grid-cols-[repeat(4,1fr)_6px_repeat(2,1fr)] gap-1 items-center — Tailwind arbitrary value 또는 CSS class):
    - 헤더 행 1 (col-span 1/5, text-caption 12px bold text-text-tertiary letterSpacing .04em flex items-center gap-1): ElevatorIcon lucide size=14 + '엘리베이터' (옛 fontSize 9 → 12 격상, 🛗 → ElevatorIcon)
    - sep 빈 div
    - 헤더 행 2 (col-span 6/8, text-caption bold text-text-tertiary flex items-center gap-1): MoveDiagonal lucide size=14 + '에스컬레이터' (↕️ → MoveDiagonal)
    - 3 row × 7 col chip:
      - row 1: EV1 ✓ / EV4 ✓ / EV7 ✗ / EV9 ✓ / sep / ES5 ✓ / ES6 ✓
      - row 2: EV2 ✓ / EV5 ✓ / EV8 ✓ / EV10 ✓ / sep / ES3 ✓ / ES4 ✓
      - row 3: EV3 ✓ / EV6 ✓ / (빈) / EV11 ✗ / sep / ES1 ✓ / ES2 ✓
    - chip 패턴: text-caption bold text-center radius-md px-2 py-0.5 (text-safe bg-safe-bg with CheckCircle2 size=11 if isReg / text-warning bg-warning-bg with X size=11 if !isReg) — 옛 fontSize 10 → 12 격상. 라벨 'EV{n}' / 'ES{n}' 그대로 (UI 라벨 보존).

**VP2 모바일라이트 — D-day 4 분기 카탈로그 + 빈/로딩**
- 영역 1 (상단 ~60%): 교육 현황 카드 — 보수교육 D-day 4 변종 한 카드 4 row 비교 시각화:
  - 카드 헤더: BookOpen + '교육 현황 — D-day 색 카탈로그' (text-body-sm bold)
  - 4 row (bg-surface-sunken rounded-xl p-2.5 + flex items-center justify-between):
    - row 1: '보수교육 (예시 A)' + 'D+15 초과' chip (text-danger bg-danger-bg) — fmtDday <0 분기
    - row 2: '보수교육 (예시 B)' + 'D-30' chip (text-warning bg-warning-bg) — ≤60 분기
    - row 3: '보수교육 (예시 C)' + 'D-180' chip (text-info bg-info-bg) — ≤365 분기
    - row 4: '보수교육 (예시 D)' + 'D-700' chip (text-safe bg-safe-bg) — >365 분기
  - 카드 하단 (text-caption text-text-tertiary mt-2): 'fmtDday: <0=danger / ≤60=warning / ≤365=info / >365=safe'
- 영역 2 (하단 ~40%):
  - 박스 1 — 빈 상태 (bg-surface-raised + border + radius 12 + p-6 + flex flex-col items-center gap-2):
    - User lucide size=36 text-text-tertiary
    - text-body-sm text-text-secondary '안전관리자 정보가 없어요'
    - 라벨 박스 'state-label': '빈 상태 (data?.manager 없음)'
  - 박스 2 — 로딩 (bg-surface-raised + border + radius 12 + p-10 + text-center):
    - text-caption text-text-tertiary '공단 데이터 조회 중...'
    - 라벨 박스 'state-label': '로딩 상태 (safetyMgrQuery.isLoading)'

**VP3 데스크톱다크 — 정상 전체 데스크톱 (3 카드 세로 배치)**
- 좌측 영역 (~30%): 호기 그리드 placeholder (3A/3B 와 동일 패턴 — Wave 1 결과 5그룹 호기 배치도 dim 표시. 본 영역은 우측에 집중)
- 우측 영역 (~70%, 카드 폭 ~600px center align):
  - 프로필 카드 (VP1 과 동일 패턴, p-5 데스크톱 spacing 확대):
    - 48×48 User avatar + 이름 '윤종엽' (text-h2 18~20px bold) + '승강기 안전관리자' (text-body-sm 13px)
    - 2-col grid (선임일 / 교육이수일) — 데스크톱에서도 동일 grid
  - 교육 현황 카드 (VP1 과 동일 — 보수 D-180 info + 신규 완료 safe)
  - 등록 현황 카드 (VP1 과 동일 — 17대 중 15대 + 호기 그리드 3×7. 데스크톱이라 chip 폭 약간 여유)

**VP4 데스크톱라이트 — 등록 카탈로그 + 미등록 강조 + D-day 카탈로그 row**
- 영역 1 (상단 ~50%, 2-col grid):
  - 왼쪽 카드 — 등록 17/17 완전 (모두 ✓ safe) variant:
    - 헤더: Building2 + '공단 등록 현황 — 완전 등록 variant'
    - 텍스트: '17대 중 17대 등록' (text-safe bold)
    - 그리드 (3×7): 모든 chip text-safe bg-safe-bg + CheckCircle2 (✗ 0건)
    - 라벨 박스 'state-label': '정상 — 모두 등록 (이상적)'
  - 오른쪽 카드 — 미등록 ✗ 강조 variant:
    - 헤더: Building2 + '공단 등록 현황 — 미등록 강조 variant'
    - 텍스트: '17대 중 14대 등록 · 미등록 3대' (등록 safe / 미등록 warning bold)
    - 그리드 (3×7): EV7 / EV11 / ES1 ✗ (text-warning bg-warning-bg + X lucide) — 옵션으로 미등록 chip 에 좌측 색바 ::before pseudo danger 톤 또는 강조 ring 적용 가능 (3A 좌측 색바 패턴 응용)
    - 라벨 박스 'state-label': '경고 — 미등록 3대 존재'
- 영역 2 (하단 ~50%): D-day 4 분기 카탈로그 row (가로 비교):
  - 헤더: 'D-day 색 카탈로그 (fmtDday 함수)' (text-body bold)
  - 4-col grid gap-2 — 4 chip + 라벨:
    - col 1: 'D+15 초과' chip (text-danger bg-danger-bg radius-md px-3 py-1) + 라벨 '<0 = danger' (text-caption text-text-tertiary mt-1)
    - col 2: 'D-30' chip (warning) + '≤60 = warning'
    - col 3: 'D-180' chip (info) + '≤365 = info'
    - col 4: 'D-700' chip (safe) + '>365 = safe'
  - 하단 (text-caption text-text-tertiary): '코드 source: ElevatorPage.tsx line 1602~1608 fmtDday — 색 한 줄도 변경 X'

### 디자인 룰 (verify gate 강제)

- 폰트: 9·10·11px 0건. 최소 12px (text-caption). 13px = body-sm. 14px = body. 16px = h2-sm. 18~20px = h2 (데스크톱).
- 색: D-day 4 분기 fmtDday 100% 보존 / 등록 chip isReg ? safe : warning / 등록 수 텍스트 등록=safe 미등록=warning
- 아이콘: lucide 사용 — User (프로필 avatar + 빈 상태) / BookOpen 또는 GraduationCap (교육 헤더 — BookOpen 권장, 더 직관적) / Building2 (등록 헤더) / ElevatorIcon / MoveDiagonal (3A/3B 매퍼 재사용) / CheckCircle2 (등록 ✓) / X (미등록 ✗) / ChevronLeft·Right + AlertTriangle 등 3A/3B 인프라 재사용
- chip 라벨: 'EV{number}' / 'ES{number}' 그대로 (UI 라벨 — EV-NN 형식 ID 와 다름. verify gate 5 는 EV-NN/ES-NN 패턴만 차단, EV{n}/ES{n} 는 허용)
- 인라인 style 속성 0건. 모두 CSS class. gridTemplateColumns 'repeat(4,1fr) 6px repeat(2,1fr)' 은 Tailwind `grid-cols-[repeat(4,1fr)_6px_repeat(2,1fr)]` arbitrary value 또는 CSS class `.reg-grid` 정의.
- 다크/라이트 둘 다 동일 컨텐츠. tokens.css [data-theme] 분기 사용. [data-theme="dark"]/[data-theme="light"] selector ≥4.
- viewport 라벨: 화면 좌상단 모바일/데스크톱 + 다크/라이트 명시 (📱/🖥️ 이모지는 viewport 라벨 한정 허용 — 본문 0건 규칙은 그대로).

### 인프라 재사용 (inspect-cert-history-sketch.html — 3B 에서 그대로)

- <style> 안의 tokens.css 다크/라이트 변수 정의 (v0.1.1)
- viewport-frame class (모바일 393×852 / 데스크톱 1280×720)
- meta-label class (viewport 라벨 + 설명)
- typography 7단계 (text-caption / text-body-sm / text-body / text-h2-sm / text-h2 등)
- 자체 헤더 패턴 (미해결 칩 + 6탭) — 3B 와 동일, '안전관리자' 탭만 활성으로 교체
- KIND_STYLE 카탈로그 row 패턴 (D-day 4 분기 카탈로그 row 로 응용)
- EmptyState 패턴 (3A 의 lucide icon prop + 보조 텍스트 — User size 36 으로 응용)
- state-label class (3B 의 KoelsaHistorySection 5 상태 라벨 박스 패턴 — VP2 빈/로딩 + VP4 정상/경고 라벨로 응용)
- lucide icon stroke svg — TYPE_ICON 4종 (3A 매퍼 — ElevatorIcon / Package / UtensilsCrossed / MoveDiagonal) / ClipboardList / Search / AlertTriangle / ChevronLeft / ChevronRight / CheckCircle2 / X (3B 재사용) + 신규 매핑 추가: User / BookOpen (또는 GraduationCap) / Building2 (3종 SVG 임베드)
- 카드 좌측 색바 ::before pseudo 패턴 (3A fault-card 와 동일 옵션 — VP4 미등록 강조 variant 에 응용 가능)

### 보존 항목 (절대 건드리지 말 것)

- ElevatorPage.tsx 본체 코드 (단 한 줄도 수정 X — fmtDday 함수 line 1602~1608, 카드 line 1614~1708, EmptyState line 1596 모두 보존)
- icons.tsx / tailwind.config.js / 다른 sketch HTML (3A/3B 포함 변경 0건)
- 다른 페이지 / 컴포넌트

### 작업 순서 (안전)

1. inspect-cert-history-sketch.html 의 <head>+<style>+<body> 인프라 + 자체 헤더 + viewport-frame 복사 → safety-mgr-sketch.html 새 파일. 자체 헤더 '안전관리자' 탭 활성으로 교체.
2. <style> 에 lucide 신규 icon stroke 3종 추가: User, BookOpen (또는 GraduationCap), Building2 (svg path 임베드).
3. <style> 에 reg-grid class 또는 Tailwind arbitrary value 정의: `grid-cols-[repeat(4,1fr)_6px_repeat(2,1fr)]` (인라인 style 회피).
4. VP1 영역 작성 (3 카드 세로 스택 — 프로필 + 교육 + 등록 정상 case).
5. VP2 영역 작성 (D-day 4 분기 카탈로그 카드 + 빈/로딩 박스 2개).
6. VP3 영역 작성 (데스크톱 정상 — 좌측 호기 그리드 placeholder + 우측 3 카드).
7. VP4 영역 작성 (등록 17/17 완전 variant + 미등록 강조 variant + D-day 가로 카탈로그 row).
8. verify gate 8개 모두 PASS 확인 (특히 Section B 9·10·11px 0건 — 옛 코드 다수 격상 필요).
9. commit.
  </action>
  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design && \
  echo "=== Section A: 라인 수 ===" && \
  wc -l cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html && \
  test $(wc -l < cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html) -ge 1000 && \
  test $(wc -l < cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html) -le 3500 && \
  echo "" && \
  echo "=== Section B: 9·10·11px 폰트 0건 ===" && \
  test $(grep -cE 'font-size:\s*(9|10|11)px|fontSize:(9|10|11)\b' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html) -eq 0 && \
  echo "" && \
  echo "=== Section C: 인라인 style 속성 0건 ===" && \
  test $(grep -c 'style="' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html) -eq 0 && \
  echo "" && \
  echo "=== Section D: 호기 ID(EV-NN/ES-NN) 본문 노출 0건 ===" && \
  test $(grep -cE 'EV-[0-9]+|ES-[0-9]+' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html) -eq 0 && \
  echo "" && \
  echo "=== Section E: viewport [data-theme] >=4 ===" && \
  test $(grep -c '\[data-theme=' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html) -ge 4 && \
  echo "" && \
  echo "=== Section F: 옛 토큰 인라인 0건 ===" && \
  test $(grep -cE 'var\(--(bg2|bd|bd2|t1|t2|t3|bg3)\)' cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html) -eq 0 && \
  echo "" && \
  echo "=== Section G: 코드 변경 0건 ===" && \
  test $(git diff --name-only HEAD | grep -v 'docs/redesign-context' | grep -v '.planning/' | wc -l) -eq 0 && \
  echo "" && \
  echo "=== ALL VERIFY GATES PASS ==="
    </automated>
  </verify>
  <done>
- safety-mgr-sketch.html 작성 완료 (1000~3500 라인)
- verify gate Section A~G 모두 PASS
- 코드 0건 변경 (단일 sketch HTML 만)
- ElevatorPage.tsx / icons.tsx / tailwind.config.js / 다른 컴포넌트 / 3A·3B 포함 다른 sketch HTML 0건 수정
  </done>
</task>

<task type="auto">
  <name>Task 2: SUMMARY 작성 + commit</name>
  <files>.planning/quick/260515-wvq-redesign-07-elevator-b-3c-sketch-v0-1-1-/260515-wvq-SUMMARY.md</files>
  <action>
SUMMARY 작성 후 single commit + push.

### SUMMARY 필수 섹션
- **What changed**: 단일 HTML sketch (safety-mgr-sketch.html) 작성. 4 viewport × 안전관리자 프로필 카드 + 교육 현황 카드 + 공단 등록 현황 카드 + D-day 4 분기 카탈로그 + 빈/로딩 + 미등록 강조 variant 본문 시각화.
- **Why**: 5탭 본문 sketch 시리즈의 마지막 1탭 (안전관리자) sketch 권위 확보. 다음 wave (Wave 11) TSX 변환 1:1 매핑 source. 옵션 B 시리즈 완결 (3A/3B/3C 모두 끝).
- **Design decisions**: 색 매핑 (D-day 4 분기 fmtDday 100% 보존 / 등록 chip isReg ? safe : warning / 등록 수 텍스트 등록 safe 미등록 warning) 코드 권위. 9·10·11px → 12px+ 격상 (그리드 헤더 9, chip 10, 부제/라벨 11). 이모지 → lucide (User / BookOpen / Building2 / CheckCircle2 / X / ElevatorIcon / MoveDiagonal). chip 라벨 'EV{n}'/'ES{n}' 그대로 (UI 라벨 보존).
- **Preserved**: 모든 코드 0건 변경. 3A/3B 포함 다른 sketch HTML 0건 변경. fmtDday 함수 / 카드 데이터 라벨 / EmptyState 분기 모두 보존.
- **Verification**: verify gate Section A~G 7/7 PASS. npm build 무관 (HTML sketch).
- **Out of scope**: TSX 변환 (Wave 11 예정). 안전관리자 데이터 자동 갱신 (cron 영역 — cbc-cron-worker 별도 프로젝트).
- **Next**: 사용자 검수 → 변환 wave (3A/3B/3C 묶음 또는 3C 단일) 진입.

### Commit + Push

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/docs/redesign-context/07-elevator/sketch/safety-mgr-sketch.html
git commit -m "feat(260515-wvq): 옵션 B 3C sketch — 안전관리자 탭 v0.1.1 시안 HTML"
git push origin redesign/07-elevator
```

배포 X. redesign/07-elevator 브랜치 push 만. SUMMARY + PLAN 은 orchestrator 가 별도 docs commit 처리.
  </action>
  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design && \
  ls .planning/quick/260515-wvq-redesign-07-elevator-b-3c-sketch-v0-1-1-/260515-wvq-SUMMARY.md && \
  git log --oneline -1 | grep -q '260515-wvq'
    </automated>
  </verify>
  <done>
- SUMMARY.md 작성 완료
- single commit (sketch HTML 만)
- redesign/07-elevator push (main 머지 X)
  </done>
</task>

</tasks>

<success_criteria>
- [ ] safety-mgr-sketch.html 1000~3500 라인
- [ ] [data-theme] 컨테이너 ≥4
- [ ] 본문 이모지 0건 (viewport 라벨 한정 허용)
- [ ] 9·10·11px 0건
- [ ] 인라인 style 속성 0건
- [ ] EV-NN/ES-NN 본문 0건 (chip EV{n}/ES{n} 는 허용)
- [ ] var(--bg2/bd/bd2/t1/t2/t3/bg3) 인라인 0건
- [ ] 코드 0건 변경
- [ ] SUMMARY + single commit + push
</success_criteria>

<output>
After completion, ensure `.planning/quick/260515-wvq-redesign-07-elevator-b-3c-sketch-v0-1-1-/260515-wvq-SUMMARY.md` exists.
</output>

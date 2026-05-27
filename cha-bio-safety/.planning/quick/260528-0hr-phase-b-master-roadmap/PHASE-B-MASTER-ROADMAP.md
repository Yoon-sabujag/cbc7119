---
phase: 260528-0hr-phase-b-master-roadmap
type: roadmap
version: 2
status: ready
scope: 전체 페이지 + 컴포넌트 — 모바일 우선
applies-to:
  - src/pages/*.tsx (31 files)
  - src/components/*.tsx (23 files)
locked-decisions:
  - 옵션 X 정확값 arbitrary (시각 0 byte)
  - 옵션 P leading 명시 보존
  - 옵션 M className conditional + 색변수만 N
  - sketch 신규 생략 — wdc sketch (260527-wdc) 의 6 패턴 (P1~P6) 재사용
predecessors:
  - 260527-wdc (LegalPage 141→6)
  - 260528-01h (LegalFindings 29→2 / LegalFindingDetail 35→4)
priority-order: mobile-first (모바일 영향 inline 우선)
created: 2026-05-28
updated: 2026-05-28
---

# Phase B 마스터 로드맵 v2 — 모바일 우선 전체 sweep

> **목표:** wdc Phase B 룰 (옵션 X+P+M+색변수N) 을 전체 코드베이스에 적용해 inline style 통일성을 부여.
> **모바일 우선:** 데스크톱 분기 inline 은 큰 페이지만 별도 wave 로 후행. 작은 페이지는 모바일/데스크톱 동시 sweep.
> 각 wave = 1 quick task. wave 사이 cbc7119-preview 모바일 검증.

## 1. Locked decisions (코드 확인 완료)

코드 grep 으로 답이 확정된 항목 (사용자 결정 불필요):

| 항목 | 결과 | 근거 |
|---|---|---|
| **옵션 X+P+M+색변수N** | 모든 wave 적용 | 260527-wdc 사용자 확정 |
| **sketch 신규** | 작성 안 함 (wdc P1~P6 재사용) | 캘리브 risk 페이지 5종 샘플 확인 — 새 패턴 0 |
| **InspectionPage emoji 25곳** | 모두 Phase A precedent 따라 Lucide 교체 (주석 1곳 자동 제외) | grep L395/860/882/906/2388/2644/2666/3033/3057/3072/3096 (동적 11곳) + L934/969/3130/3230/3242/3295/3312/3343/4235/4647/5205/5864/5981 (텍스트 14곳) |
| **ElevatorFindingDetailPage** | sweep 포함 (deep link 호환) | grep 결과 — UI 진입점 0건, App.tsx 라우트(L271)만 존속 |
| **AdminPage** | skip (완전 dead) | App.tsx 에 import + 라우트 둘 다 0건 — 별도 cleanup 후보 |
| **InstallPrompt 비색** | false-positive | L121 `border-warning/25` 는 opacity modifier 적법 |
| **SettingsPanel 비색** | 진짜 1곳 (L143 `'border-danger'` 단독) | Wave 16c 안에서 정리 |

## 2. 모바일/데스크톱 inline style zone 분류 (grep + brace tracking 분석)

| Page | shared | desktop-only | mobile-only | total | 모바일 영향 | 데스크톱 분기 비율 |
|---|---:|---:|---:|---:|---:|---:|
| ElevatorPage | 101 | **105** | 0 | 206 | 101 | **51%** |
| CheckpointsPage | 36 | **38** | 6 | 80 | 42 | **52%** |
| StaffManagePage | 47 | 24 | 5 | 76 | 52 | **38%** |
| RemediationPage | 11 | **14** | 0 | 25 | 11 | **56%** |
| LoginPage | 21 | 7 | 0 | 28 | 21 | 25% |
| AnnualPlanPage | 14 | 7 | 0 | 21 | 14 | 33% |
| StaffServicePage | 29 | 5 | 0 | 34 | 29 | 15% |
| WorkLogPage | 17 | 3 | 0 | 20 | 17 | 15% |
| EducationPage | 49 | 5 | 0 | 54 | 49 | 9% |
| DashboardPage | 9 | 1 | 0 | 10 | 9 | 10% |
| FloorPlanPage | 23 | 2 | 0 | 25 | 23 | 8% |
| WorkShiftPage | 22 | 1 | 1 | 24 | 23 | 4% |
| SchedulePage | 81 | 2 | 0 | 83 | 81 | 2% |
| LegalFindingDetailPage | 2 | 1 | 1 | 4 | 3 | (Phase B 잔존) |
| 그 외 모두 shared | (페이지/컴포넌트) | 0 | — | — | 100% | — |

**핵심 결정 룰:**
- 데스크톱 분기 비율 **≤30%** → 단일 wave 로 전체 sweep (모바일 검증으로 충분, 데스크톱 곁다리 동반)
- 데스크톱 분기 비율 **>30%** → 모바일 zone (shared + mobile-only) 먼저 sweep, 데스크톱 zone 별도 wave 후행
- 100% shared 페이지 → 단일 wave 로 sweep

## 3. Locked rules (모든 wave 공통)

### 옵션 (사용자 wdc 확정)
- **(b) X** 정확값 arbitrary — 스케일 외 값 모두 `[Npx]`. 시각 0 byte.
- **(c) P** leading 명시 보존 — `lineHeight: 1.5` → `leading-[1.5]`
- **(d) M + 색변수 N** — template literal conditional 우선, `var(--...)` / `linear-gradient` / `fontFamily: inherit` / `transition` 등만 잔존

### 패턴 매핑 (wdc sketch §2-P1~P6)
- P1 Padding 상수 → `px-N py-N` or `[Npx]`
- P2 Flex layout → `flex gap-N items-X flex-col`
- P3 Sizing → 옵션 X 정확값 arbitrary
- P4 flex-1 + leading → 옵션 P 명시 보존
- P5 Button reset → `bg-transparent border-0 cursor-pointer`
- P6 Dynamic → 옵션 M template literal

### Spacing scale (tailwind.config.js override)
- -1=4 -2=8 -3=12 -4=16 -5=20 -6=24 **-7=32 -8=48**
- 기본 tailwind: w-9=36, w-11=44, w-12=48, w-16=64
- 메모리 anchor: `feedback_tailwind_w8_h8_is_48px.md`

### 비즈 anchor identity (precise grep)
- `onClick=\{[^}]+\}` handler bodies (sorted/uniq diff = empty)
- `useState\(`, `useRef\(`, `useEffect\(`, `useMutation\(`, `useQuery\(`, `useNavigate\(`, `useParams\(` count identical
- API 호출 (`legalApi\.`, `inspectionApi\.`, `staffApi\.`, `elevatorApi\.`) count identical
- `fetch\(` count identical

### Phase A 보존 (모든 wave)
- Lucide imports 줄 보존 (페이지마다 다름 — 변경 0)
- 색 토큰 `-bar` 변종 / `bg-*-bg` / `text-*` (정리된 것) 변경 0
- emoji 0 (Wave 10 InspectionPage 만 emoji 동반 sweep)

### TypeScript
- 변경 파일 + 전체 프로젝트 신규 에러 0

### 위험 anchor (per-wave)
| Wave | 페이지 | 위험 anchor |
|---|---|---|
| 2 | Login | `project_redesign_27_login_status.md` (단순) |
| 2 | Splash | `project_redesign_28_splash_status.md` (캘리브 좌표 16건 1 byte 변경 0) |
| 3 | WorkShift | `project_redesign_16_workshift_status.md` (캘리브 + holidays fetch) |
| 3 | Annual | `project_redesign_17_annual_plan_status.md` (캘리브 좌표 5건 1 byte 0) |
| 4 | Dashboard | `feedback_dashboard_grid_1fr.md` + `feedback_dashboard_horizontal_scroll.md` |
| 4 | DailyReport | `project_redesign_15_daily_report_status.md` (캘리브 100% 보존) |
| 9 | FloorPlan | `project_inspection_chrome_unified.md` (chrome 통일 룰) |
| 10 | Inspection | `project_redesign_02_inspection_status.md` (메가 6047 줄 + emoji 25곳) |
| 11 | ElevatorFindingDetail | `project_08_finding_detail_deprecated.md` (deep link only) |
| 12a/13a/14a/15a | Staff/Check/Rem/Elevator 모바일 | 모바일 zone 만 변환 — 데스크톱 zone 별도 wave |
| 16c | BottomNav | `feedback_bottomnav_gap_style.md` (gap 패턴 보존) |
| 16c | SettingsPanel | 비표준 색 L143 `border-danger` → `border-danger-bar` (또는 `/25` opacity) |

## 4. Wave 구조 (22 waves, 모바일 우선)

### Tier 1 — **모바일 위주 sweep** (11 waves, 단일 quick 으로 전체 변환)

데스크톱 분기 ≤30% 또는 100% shared 페이지. 전체 inline 한 번에 변환.

| Wave | 묶음 | 파일 | inline (mobile/total) | 위험 |
|---:|---|---|---:|---|
| 1 | 워밍업 (XS) | QRScanPage + DivPage + ReportsPage | 1+4+3=8 | 낮음 |
| 2 | 인증/스플래시 | LoginPage + SplashScreen | 21+13=34 (~잔존 desktop 7) | **캘리브** |
| 3 | 근무/연간 | WorkShiftPage + AnnualPlanPage | 23+14=37 (~잔존 desktop 8) | **캘리브** |
| 4 | 보고/대시보드 | DashboardPage + DailyReportPage + WorkLogPage | 9+10+17=36 (~잔존 desktop 4) | **Dashboard 1fr / Daily 캘리브** |
| 5 | 조치 상세 | RemediationDetailPage | 11 | 보통 |
| 6 | 일정/교육 | SchedulePage + EducationPage | 81+49=130 (~잔존 desktop 7) | 보통 |
| 7 | 직원 서비스 | StaffServicePage | 29 (~잔존 desktop 5) | 보통 |
| 8 | 소화기 | ExtinguisherPublicPage + ExtinguishersListPage | 44+78=122 | 보통 |
| 9 | 도면 | FloorPlanPage | 23 (~잔존 desktop 2) | chrome 룰 |
| 10 | 점검 메가 + emoji | InspectionPage (47 inline + 25 emoji) | 72 | **6047 줄** |
| 11 | 승강기 상세 | ElevatorFindingDetailPage | 60 | **deprecated 진입점** |

**Tier 1 합계: ~570 inline + 25 emoji** (모바일 영향 inline 의 약 60%)

### Tier 2 — **데스크톱 분기 큰 페이지 — 모바일 zone 우선 분할** (8 waves)

각 페이지 2개 wave: 모바일 zone (shared + mobile-only) → 데스크톱 zone

| Wave | 묶음 | 파일 | inline | zone | 위험 |
|---:|---|---|---:|---|---|
| 12a | Staff 관리 모바일 | StaffManagePage shared+mobile | 47+5=52 | mobile | 보통 |
| 13a | 점검개소 모바일 | CheckpointsPage shared+mobile | 36+6=42 | mobile | 보통 |
| 14a | 조치 목록 모바일 | RemediationPage shared | 11 | mobile | 보통 |
| 15a | 승강기 모바일 | ElevatorPage shared | 101 | mobile | **메가 페이지** |
| 12b | Staff 관리 데스크톱 | StaffManagePage desktop-only | 24 | desktop | 후행 |
| 13b | 점검개소 데스크톱 | CheckpointsPage desktop-only | 38 | desktop | 후행 |
| 14b | 조치 목록 데스크톱 | RemediationPage desktop-only | 14 | desktop | 후행 |
| 15b | 승강기 데스크톱 | ElevatorPage desktop-only | 105 | desktop | 후행 |

**Tier 2 합계: 모바일 zone 206 + 데스크톱 zone 181**

Tier 2 wave 순서:
- 모바일 zone 먼저: 12a → 13a → 14a → 15a (4 waves)
- cbc7119-preview 모바일 검증 OK 후
- 데스크톱 zone: 12b → 13b → 14b → 15b (4 waves)

### Tier 3 — **컴포넌트 batch** (3 waves)

컴포넌트는 모바일/데스크톱 공통 사용 — split 무의미. 크기별 묶음.

| Wave | 묶음 | 컴포넌트 | inline |
|---:|---|---|---:|
| 16a | findings 모달 | FindingEditModal + FindingFormSheet | 43+34=77 |
| 16b | 중형 컴포넌트 | InstallPrompt + ExcelPreview + DesktopSidebar | 41+18+17=76 |
| 16c | XS 컴포넌트 batch | ui/index + PhotoGrid + BottomNav + PhotoButton + SettingsPanel(+비색1) + SvgFloorPlan + PdfFloorPlan + ui/icons + SideMenu + DocumentUploadForm + PhotoSourceModal + FloorB5 | 16+11+8+7+4+3+3+2+2+2+1+1=60 |

**Tier 3 합계: 213 inline + SettingsPanel 비색 1곳**

## 5. Cherry-pick 묶음 (production 직원 도메인 sync)

main 머지 + cbc7119-preview 모바일 검증 OK → 일정 묶음으로 직원 도메인 cherry-pick.

| 묶음 | 포함 | Cherry-pick 시점 |
|---|---|---|
| **A** Legal 트리오 (완료) | Phase A (47b9088) + wdc (184e548) + 01h (894c9d0) | 즉시 가능 (사용자 결정 대기) |
| **B** Tier 1 모바일 | Wave 1~11 | Tier 1 완료 후 모바일 종합 검증 |
| **C1** Tier 2 모바일 | Wave 12a + 13a + 14a + 15a | Tier 2 모바일 zone 완료 후 |
| **C2** Tier 2 데스크톱 | Wave 12b + 13b + 14b + 15b | Tier 2 데스크톱 zone 완료 후 |
| **D** Tier 3 컴포넌트 | Wave 16a + 16b + 16c | Tier 3 완료 후 |

production sync 절차: memory `feedback_production_sync_protocol.md` + `.planning/production-sync.md` 게이트 준수.

## 6. Verify gate (모든 wave 공통 자동화)

PLAN.md 에 다음 verify block 자동 포함:

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety

# 1. inline style count drop
for F in <wave_files>; do
  B=$(git show HEAD~1:$F | grep -c 'style={{')
  A=$(grep -c 'style={{' $F)
  echo "$F: $B → $A"
done

# 2. 비즈 anchor identity (precise)
for F in <wave_files>; do
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
    B=$(git show HEAD~1:$F | grep -cE "$ANCHOR")
    A=$(grep -cE "$ANCHOR" $F)
    [ "$B" = "$A" ] && echo "$F $ANCHOR: $B (OK)" || echo "$F $ANCHOR: $B→$A MISMATCH"
  done
done

# 3. onClick handler bodies precise diff
for F in <wave_files>; do
  git show HEAD~1:$F | grep -oE 'onClick=\{[^}]+\}' | sort | uniq > /tmp/before-${F##*/}.txt
  grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/after-${F##*/}.txt
  diff /tmp/before-${F##*/}.txt /tmp/after-${F##*/}.txt
done

# 4. emoji + 비색 (Phase A 보존)
for F in <wave_files>; do
  echo "$F emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"
  echo "$F 비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"
done
# Wave 10 (Inspection emoji sweep) 만 emoji 0 목표, 그 외는 변동 0
# Wave 16c (SettingsPanel L143) 만 비색 0 목표, 그 외는 변동 0

# 5. TypeScript
./node_modules/.bin/tsc --noEmit 2>&1 | grep -E 'error TS' | wc -l

# 6. file scope
cd .. && git diff --name-only HEAD | grep -v 'cha-bio-safety/' | wc -l  # MUST = 0
```

## 7. Tier 2 분할 가이드 (executor 용)

Tier 2 의 모바일/데스크톱 zone 분리는 정확해야 하므로 PLAN 에 zone 경계 라인 명시:

### Wave 12a (StaffManagePage 모바일)
- 분기 패턴 detect: `if (isDesktop) {` / `{isDesktop && ...}` / `: isDesktop ? (...)`
- **포함:** shared 코드 + `{!isDesktop &&` / `if (!isDesktop)` 블록 안 inline (47+5=52)
- **제외:** `if (isDesktop) {` / `{isDesktop &&` / `isDesktop ? ... :` true-branch 안 inline (24)

### Wave 13a (CheckpointsPage 모바일) — 동일 룰
- 포함: shared + mobile-only (36+6=42)
- 제외: desktop-only (38)

### Wave 14a (RemediationPage 모바일)
- 포함: shared (11)
- 제외: desktop-only (14)

### Wave 15a (ElevatorPage 모바일) — 메가
- 포함: shared (101)
- 제외: desktop-only (105)
- 추가 안전 룰: **3분할 검토** 가능 — 탭 boundary (L1064/L1145/L1222/L1227/L1390/L1595/L1738/L1805) 활용
  - 단일 quick 으로 도전 (101 inline 한 번에)
  - 너무 크면 15a-1 (list+fault+repair) / 15a-2 (inspect+annual+safety) 분할

### Tier 2 zone 검출 script (executor 사용 권장)
`/tmp/style_zones.py` 가 라인별 zone 분류 출력. PLAN 에 이 script 결과 인용 가능:

```bash
python3 << 'PYEOF'
# /tmp/style_zones.py 와 동일 로직
# 입력: cha-bio-safety/src/pages/<page>.tsx
# 출력: line N → SHARED|DESKTOP|MOBILE
PYEOF
```

## 8. 검증 페이스

| 시점 | 검증 | 책임 |
|---|---|---|
| 각 wave 후 | auto verify gate (grep + tsc + 비즈 anchor identity) | executor |
| Tier 1 완료 후 | cbc7119-preview 모바일 종합 검증 (11 페이지 시각 동일) | 사용자 |
| Tier 2 모바일 zone 완료 후 | cbc7119-preview 모바일 종합 검증 (StaffManage/Checkpoints/Remediation/Elevator) | 사용자 |
| Tier 2 데스크톱 zone 완료 후 | cbc7119-preview 데스크톱 종합 검증 | 사용자 |
| Tier 3 완료 후 | cbc7119-preview 전체 종합 검증 | 사용자 |

각 검증 OK 후 cherry-pick 묶음 production 으로 sync.

## 9. 예상 진행 시간

- Tier 1 (11 waves): 각 5-15 분 → 약 1-2 시간
- Tier 2 (8 waves, 그 중 15a 메가): 약 1-2 시간
- Tier 3 (3 waves): 약 30-45 분
- **총: 3-5 시간 executor 시간**

페이스는 사용자가 wave 별 컨펌 후 다음 진행 (메모리 룰: 디자인 변경 사용자 컨펌 후 — 단 본 작업은 시각 0 byte 룰이라 컨펌 부담 낮음).

## 10. 시작 — Wave 1 (워밍업)

준비 OK 되면 Wave 1 진행:
- QRScanPage + DivPage + ReportsPage = 8 inline
- 단일 quick task
- 옵션 X+P+M+색변수N 그대로 적용
- 약 5-10 분 예상

## Self-Check: ROADMAP READY

- [x] Locked decisions 코드 확인 완료 (Q1~Q8 중 5건 확정, Q4 분할 권장)
- [x] 모바일/데스크톱 zone 분류 완료 (28 페이지 분석)
- [x] Tier 1/2/3 분류 + 22 wave 구조
- [x] 위험 anchor 13건 매핑 per wave
- [x] verify gate 자동화 spec
- [x] cherry-pick 묶음 5 (A 완료 + B/C1/C2/D 잔여)
- [ ] Wave 1 dispatch — 사용자 컨펌 대기

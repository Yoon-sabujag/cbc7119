---
quick_id: 260515-hbv
slug: redesign-07-elevator-2d-sketch-evdetailm
date: 2026-05-15
branch: redesign/07-elevator
type: quick
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html
autonomous: true
tags: [sketch, redesign, elevator, modal, evdetail, history, kind-style, color-decision]

# ───────────────────────────────────────────────────────────
# 핵심 디자인 결정 — KIND_STYLE 색 매핑 (2D)
# ───────────────────────────────────────────────────────────
# 코드 (line 1745-1750)  →   2D sketch 결정
#   fault   = danger     →   fire (메모리 룰 통일 — "fire 의미 고정 = 승강기 고장 미수리")
#   repair  = safe       →   safe (코드 그대로 — "수리 완료/정상화" 의미 적합)
#   inspect = info       →   info (코드 그대로 — accent 와 톤이 다른 info 토큰)
#   annual  = warn       →   text-secondary 회색 (분류만, 의미색 X — KOELSA 외부 데이터)
#
# §6.1 색 의미 전체 매핑 (2A/2B/2C/2D 누적 — 최종):
#   fire    (주황) = 호기 고장 미수리 (list 색바 + EvDetail fault 이력 색바 + FaultNew CTA)
#   danger  (적)   = 즉시 위험 (FaultNew 승객 탑승 ON / 미해결 카운트 텍스트)
#   warning (황)   = 수리 부위 작업 (RepairNew 수리 대상 토글) — 본 페이지 미사용
#   safe    (녹)   = 정상 / 수리 완료 이력 (EvDetail repair 이력 색바)
#   info    (파)   = 점검 이력 색바 + 발생층 칩 (accent 와 다른 톤)
#   accent  (브랜드 파) = 선택 (호기 / 기간 / 필터 / 이력 탭) + 저장 CTA
#   text-secondary 회색 = 검사 (annual) 이력 색바 — 분류만, 의미색 X
# ───────────────────────────────────────────────────────────

must_haves:
  truths:
    - "6 영역 모두 등장 (헤더 / 기간 선택 / ElevatorInfoCard / 층별 누적 이력 / 점검항목 필터 / 이력 리스트)"
    - "호기 ID(EV-NN/ES-NN) 본문 노출 0건 — 호기 라벨은 'N호기' 만"
    - "본문 이모지 0건 (🛗📦🔲↕️🔴⚠️✅🔧📋🔍✕ 모두 lucide+커스텀 아이콘 매핑)"
    - "9·10·11px 폰트 0건 (현 코드는 10/11px 사용 — 12px 이상으로 격상)"
    - "인라인 style 속성 0건 (모두 CSS class 또는 <style> block)"
    - "[data-theme] 컨테이너 ≥4 (모바일 다크/라이트 + 데스크톱 다크/라이트)"
    - "viewport 라벨 ≥4 (📱 모바일 / 🖥️ 데스크톱 × 다크/라이트 명시)"
    - "lucide+커스텀 아이콘 enumeration: ElevatorIcon SVG (passenger) / Package (cargo) / UtensilsCrossed (dumbwaiter) / MoveDiagonal (escalator) / X (닫기) / CheckCircle2 (이상없음) / AlertTriangle (이력있음) / AlertOctagon 또는 Siren (미해결, fire 색) / FileSearch (이력 빈상태) / KIND_STYLE 종류별 좌측 색바(fault=fire / repair=safe / inspect=info / annual=secondary 회색)"
    - "이력 탭 5종 모두 등장 (전체 / 고장 / 수리 / 점검 / 검사) — HISTORY_TABS 코드 그대로 시각화"
    - "점검항목 필터 6옵션 모두 등장 (전체 / 브레이크 / 도어 / 안전장치 / 조명 / 비상통화) — CHECK_ITEM_LABELS 코드 그대로"
    - "기간 4옵션 모두 등장 (1개월 / 3개월 / 6개월 / 1년) — PERIOD_OPTIONS 코드 그대로"
    - "KIND_STYLE 색 결정 시각화 (fault=fire / repair=safe / inspect=info / annual=secondary 회색) — 4종 모두 카탈로그 row 로 시각화하여 색 의미 명시"
    - "기간/점검필터/이력탭 모두 §2A ev-btn-selected fill 패턴 통일 (선택 = bg-accent + text-on-accent / 비선택 = bg-sunken + text-tertiary)"
    - "층별 누적 이력 범례에서 이모지 제거 → lucide 아이콘 + 토큰 색 (AlertOctagon/Siren=fire 미해결 / AlertTriangle=warn 이력있음 / CheckCircle2=safe 이상없음)"
    - "엘리베이터/에스컬레이터 분기 시각화 — 층별 통계 영역 + 점검항목 필터 영역은 ev.type !== 'escalator' 일 때만 노출 (escalator viewport 에서 두 영역 숨김 명시)"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html"
      provides: "EvDetailModal v0.1.1 sketch HTML — 4 viewport × 6 영역 + KIND_STYLE 색 카탈로그 row"
      min_lines: 1500
      max_lines: 4500
  key_links:
    - from: "evdetail-modal-sketch.html"
      to: "elevator-sketch.html (1차)"
      via: "tokens.css 다크/라이트 + typography 7단계 + viewport-frame/meta-label 100% 재사용"
      pattern: "\\[data-theme=\"(dark|light)\"\\]"
    - from: "evdetail-modal-sketch.html"
      to: "evselector-sketch.html (2A)"
      via: "ev-btn-selected fill 패턴 — 선택 = accent fill (기간 / 점검필터 / 이력탭 모두 통일)"
      pattern: "ev-btn-selected|btn-selected.*accent"
    - from: "evdetail-modal-sketch.html"
      to: "fault-modals-sketch.html (2B)"
      via: "모달 헤더 패턴 (TYPE_ICON 매퍼 + 호기 라벨 + lucide X 닫기) + modal-overlay shell"
      pattern: "modal-overlay|lucide-x"
    - from: "evdetail-modal-sketch.html"
      to: "input-modals-sketch.html (2C)"
      via: "warning 토큰 정의 + 모달 shell desktop/mobile variant + 카탈로그 row 패턴"
      pattern: "warning-bg|carousel-row"

verify_before_commit:
  - id: 1
    name: 라인 수
    target: "1500-4500"
    cmd: "wc -l cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html"
  - id: 2
    name: 9·10·11px 폰트
    target: "0건"
    cmd: "grep -E 'font-size:\\s*(9|10|11)px|text-\\[(9|10|11)px\\]' cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html | grep -v '^[[:space:]]*[/*]' | wc -l"
  - id: 3
    name: "[data-theme] 컨테이너 ≥4"
    target: "≥4"
    cmd: "grep -c 'data-theme=' cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html"
  - id: 4
    name: "viewport 라벨 ≥4"
    target: "≥4"
    cmd: "grep -cE '📱|🖥️' cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html"
  - id: 5
    name: "본문 이모지 0건 (🛗📦🔲↕️🔴⚠️✅🔧📋🔍✕)"
    target: "0건 — viewport 라벨 📱🖥️ 만 허용"
    cmd: "grep -oE '🛗|📦|🔲|↕️|🔴|⚠️|✅|🔧|📋|🔍|✕' cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html | wc -l"
  - id: 6
    name: "EV-/ES- 본문 노출 0건 (HTML 코멘트 허용)"
    target: "0건 (코멘트 외)"
    cmd: "grep -nE 'EV-[0-9]{2}|ES-[0-9]{2}' cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html | grep -vE '^\\s*//|<!--|^\\s*\\*' | wc -l"
  - id: 7
    name: "인라인 style=\"...\" 속성 0건"
    target: "0건"
    cmd: "grep -cE 'style=\"' cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html"
  - id: 8
    name: "6 영역 모두 등장 (헤더/기간/InfoCard/층별/점검필터/이력)"
    target: "6/6"
    cmd: "for s in '호기 헤더\\|모달 헤더' '조회 기간\\|기간 선택' '승강기 정보\\|ElevatorInfoCard' '층별 누적' '점검항목 필터' '이력 리스트\\|이력 탭'; do echo -n \"$s: \"; grep -cE \"$s\" cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html; done"
  - id: 9
    name: "lucide+커스텀 아이콘 enumeration"
    target: "ElevatorIcon SVG, Package, UtensilsCrossed, MoveDiagonal, X, CheckCircle2, AlertTriangle, (AlertOctagon|Siren), FileSearch 모두 ≥1"
    cmd: "for i in 'ElevatorIcon\\|elevator-icon-svg' 'package' 'utensils-crossed\\|UtensilsCrossed' 'move-diagonal\\|MoveDiagonal' 'lucide-x\\|data-lucide=\"x\"' 'check-circle' 'alert-triangle' 'alert-octagon\\|siren' 'file-search'; do echo -n \"$i: \"; grep -ciE \"$i\" cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html; done"
  - id: 10
    name: "이력 5탭 모두 등장 (전체/고장/수리/점검/검사)"
    target: "5/5"
    cmd: "for t in '전체' '고장' '수리' '점검' '검사'; do echo -n \"$t: \"; grep -c \"$t\" cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html; done"
  - id: 11
    name: "점검항목 필터 6옵션 모두 등장"
    target: "6/6 (전체/브레이크/도어/안전장치/조명/비상통화)"
    cmd: "for t in '전체' '브레이크' '도어' '안전장치' '조명' '비상통화'; do echo -n \"$t: \"; grep -c \"$t\" cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html; done"
  - id: 12
    name: "기간 4옵션 + KIND_STYLE 색 카탈로그 row 등장"
    target: "기간 4/4 + KIND_STYLE 4종 시각화"
    cmd: "for t in '1개월' '3개월' '6개월' '1년' 'kind-style-catalog\\|KIND_STYLE 색 카탈로그'; do echo -n \"$t: \"; grep -c \"$t\" cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html; done"
---

<objective>
EvDetailModal (호기 상세 — 이력 5탭 + 층별 통계 + 기간 필터 + 점검항목 필터) v0.1.1 sketch HTML 1 파일 작성. 코드 변경 0건. redesign/07-elevator 의 2D 차수 sketch.

**Purpose:**
- ElevatorPage.tsx 라인 1696-1891 EvDetailModal 의 현 시각(이모지/9-11px/인라인 style)을 v0.1.1 디자인 룰로 교체한 시안 확정
- 핵심 결정: **KIND_STYLE 색 매핑** — fault=fire (메모리 룰 통일) / repair=safe / inspect=info / annual=secondary 회색 (검사는 분류만, 의미색 X)
- 2A (EvSelector ev-btn-selected accent fill) / 2B (Fault 모달 헤더+lucide X) / 2C (warning 토큰+모달 shell) 누적 패턴 그대로 재사용 — EvDetail 은 데이터 표시 + 필터 위주라 신규 시각 요소 거의 없음 (이력 카드 색바 매핑만 신규 결정)
- Wave 2+ TSX 변환 단계에서 본 sketch 가 EvDetailModal source — fault 색 fire 통일 + ElevatorInfoCard placeholder 컨펌 + 검사 회색 (warn 충돌 회피) 결정 적용

**Output:** sketch HTML 1 파일 (1500-4500 lines, 12/12 verify gate PASS)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/STATE.md

# 코드 source (EvDetailModal 본체 + 상수 + KIND_STYLE)
@cha-bio-safety/src/pages/ElevatorPage.tsx

# 1차/2A/2B/2C 누적 sketch — 토큰/패턴 100% 재사용
@cha-bio-safety/docs/redesign-context/07-elevator/sketch/elevator-sketch.html
@cha-bio-safety/docs/redesign-context/07-elevator/sketch/evselector-sketch.html
@cha-bio-safety/docs/redesign-context/07-elevator/sketch/fault-modals-sketch.html
@cha-bio-safety/docs/redesign-context/07-elevator/sketch/input-modals-sketch.html

# 2B/2C 사후 결정 (Fault 색 분리 + Repair warning 토큰 + InspectModal dead code)
@.planning/quick/260515-bgg-redesign-07-elevator-3-sketch-fault-faul/260515-bgg-SUMMARY.md
@.planning/quick/260515-g61-redesign-07-elevator-2c-sketch-inspectmo/260515-g61-SUMMARY.md

# 아이콘 source (ElevatorIcon SVG paths)
@cha-bio-safety/src/components/ui/icons.tsx

<interfaces>
<!-- Wave 2+ TSX 변환 시점에 EvDetailModal 이 의존하는 핵심 contracts. sketch 에서는 시각 매핑만. -->

// ElevatorPage.tsx line 1681-1694: 기간 옵션 + 이력 탭
const PERIOD_OPTIONS = [
  { label:'1개월', months:1 },
  { label:'3개월', months:3 },
  { label:'6개월', months:6 },
  { label:'1년',   months:12 },
]
type HistoryTab = 'all' | 'fault' | 'repair' | 'inspect' | 'annual'
const HISTORY_TABS: { key:HistoryTab; label:string }[] = [
  { key:'all',     label:'전체' },
  { key:'fault',   label:'고장' },
  { key:'repair',  label:'수리' },
  { key:'inspect', label:'점검' },
  { key:'annual',  label:'검사' },
]

// line 1678-1680: 점검항목 라벨
const CHECK_ITEM_LABELS = {
  brake:'브레이크', door:'도어', safety_device:'안전장치',
  lighting:'조명', emergency_call:'비상통화'
}

// line 1745-1750: 현 코드 KIND_STYLE (sketch 에서 변경 — fault: danger→fire, annual: warn→secondary 회색)
const KIND_STYLE = {
  fault:   { color:'var(--danger)', label:'고장',  icon:'🔴' },  // → fire + AlertOctagon/Siren
  repair:  { color:'var(--safe)',   label:'수리',  icon:'🔧' },  // → safe + Wrench (그대로)
  inspect: { color:'var(--info)',   label:'점검',  icon:'📋' },  // → info + ClipboardCheck (그대로)
  annual:  { color:'var(--warn)',   label:'검사',  icon:'🔍' },  // → text-secondary 회색 + Search (의미색 X)
}

// line 109-114: FloorStat 타입 — 층별 누적 이력 카운트
interface FloorStat {
  floor: string
  fault_total: number
  fault_unresolved: number
  action_count: number
}

// line 117-129: 11개 호기 운행층 매핑 (sketch sample data 출처)
const EV_FLOORS: Record<string, string[]> = {
  'EV-01': ['B5F','B4F','B3F','B2F','B1F','연1F','연2F'],
  // EV-04: ['B3F','사3F','사5F','사6F','사7F','사8F'] (VP2 6개월 sample 출처)
  // EV-11: ['B1F식당','2F하역장'] (VP3 덤웨이터 sample 출처)
}

// ElevatorInfoCard (line 2680~) — 검사성적서 양식 카드
// compact=true (모바일): 2열 (라벨|값), 한 줄에 한 항목, maxHeight 170 자체 스크롤
// compact=false (데스크톱): 4열 (검사성적서 원본 양식 그대로)
// 표시 필드 (엘리베이터): 호기(설치장소), 승강기 고유번호, 형식/종류, 운행구간, 제조업체,
//   유지관리업체, 구동기 공간, 적재하중, 정격속도, 매다는장치 지름/두께, 추락방지안전장치, 매다는장치 가닥수
// 표시 필드 (에스컬레이터): 호기(설치장소), 승강기 고유번호, 형식/종류, 운행구간(운행수),
//   제조업체, 유지관리업체, 구동기설치위치, 운전 방식, 최대수용능력, 공칭속도, 경사 각도, 보조브레이크
// → sketch 에서는 placeholder/축약 카드 — Wave 2+ TSX 에서 ElevatorInfoCard 컴포넌트 그대로 재사용

// icons.tsx line 137-148: ElevatorIcon SVG paths (1:1 inline embed)
<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none">
  <rect x="4" y="3" width="16" height="18" rx="1.5"/>
  <line x1="12" y1="3" x2="12" y2="21"/>
  <polyline points="6.5 9 8 7 9.5 9"/>
  <polyline points="14.5 15 16 17 17.5 15"/>
  <line x1="8" y1="7" x2="8" y2="11"/>
  <line x1="16" y1="13" x2="16" y2="17"/>
</svg>

// TYPE_ICON_COMPONENT 매퍼 (line 197-202): EvDetail 헤더 호기 아이콘
//   passenger  → ElevatorIcon (커스텀 SVG)
//   cargo      → Package (lucide)
//   dumbwaiter → UtensilsCrossed (lucide)
//   escalator  → MoveDiagonal (lucide)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: EvDetailModal v0.1.1 sketch HTML 작성 — 4 viewport × 6 영역 + KIND_STYLE 색 카탈로그</name>
  <files>cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html</files>

  <action>
새 파일 생성. 1차/2A/2B/2C sketch 의 토큰/CSS/viewport-frame 패턴을 100% 복사한 위에 EvDetailModal 4 viewport 시안을 그린다. **코드 변경 0건** (ElevatorPage.tsx / icons.tsx / ElevatorInfoCard 등 src/ 어디도 수정 금지).

### 0. 파일 골조 (input-modals-sketch.html line 1-260 와 동일)

`<!doctype html>` + `<head>` (Tailwind CDN + Pretendard + JetBrains Mono + Lucide CDN). `<style>` 블록에 다음을 인라인:
- `[data-theme="dark"]` / `[data-theme="light"]` 토큰 (input-modals-sketch.html line 24-155 그대로 복사) — warning 토큰 포함
- spacing/typography/색 class 매핑 (line 157-239 그대로)
- `meta-label` / `viewport-frame` (mobile 375×812, desktop 1280×800) / `card-hover` / `page-shell` / `desktop-shell` (line 244-289)
- EvSelector ev-btn / kind-toggle / es-btn (사용 안 함 but 토큰 정의는 유지 — 카탈로그 row 일관성 위해)
- 모달 공통 CSS (.modal-overlay / .modal-shell / .modal-shell-mobile / .modal-shell-desktop / .modal-header / .modal-close — 2B/2C 패턴 100% 재사용)
- **2D 신규 CSS:**
  - `.evdetail-sheet-mobile` (position absolute, bottom: 54px=NAV_H, border-radius: 20px 20px 0 0, max-height: calc(100% - 98px))
  - `.evdetail-modal-desktop` (position absolute, top:50%, left:50%, transform translate(-50%,-50%), width:720px, max-width:92%, max-height:88%, border-radius:14px)
  - `.evdetail-section-title` (font-size 13px, font-weight 700, color t2, margin-bottom 8px)
  - `.evdetail-legend-item` (display flex, gap 4px, align-items center, font-size 12px, color t3) — 범례 lucide+토큰
  - `.evdetail-floor-row` (background sunken, border-radius 9px, padding 7px 10px, display flex, gap 8px)
  - `.evdetail-history-card` (background sunken, border-radius 10px, padding 9px 11px, border-left 3px solid var(--kind-color), margin-bottom 6px)
  - `.evdetail-history-card.kind-fault` (--kind-color: var(--fire))
  - `.evdetail-history-card.kind-repair` (--kind-color: var(--safe))
  - `.evdetail-history-card.kind-inspect` (--kind-color: var(--info))
  - `.evdetail-history-card.kind-annual` (--kind-color: var(--t3)) /* 검사 = 회색 분류만 */
  - `.evdetail-period-btn` / `.evdetail-period-btn-active` / `.evdetail-filter-chip` / `.evdetail-filter-chip-active` / `.evdetail-hist-tab` / `.evdetail-hist-tab-active` (모두 2A ev-btn-selected fill 패턴 — 비선택 = bg-sunken+text-tertiary, 선택 = bg-accent+text-on-accent, border-radius 20px pill, min-height 32px / 데스크톱 30px)
  - `.evdetail-info-card-placeholder` (border 1px solid bd, border-radius 8px, overflow hidden — ElevatorInfoCard 축약 표시용)
  - `.kind-chip-fault` / `.kind-chip-repair` / `.kind-chip-inspect` / `.kind-chip-annual` (font-size 12px, font-weight 700) — 종류 라벨 색
  - `.floor-chip-info` (font-size 12px, background info-bg, color info, padding 1px 6px, border-radius 6px) — 발생층 칩
  - `.check-item-chip-grey` (font-size 12px, background bg4, color t3, padding 1px 6px, border-radius 6px) — 점검항목 칩

### 1. ElevatorIcon SVG (icons.tsx line 137-148 1:1 inline)

```html
<svg class="elevator-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="4" y="3" width="16" height="18" rx="1.5"/>
  <line x1="12" y1="3" x2="12" y2="21"/>
  <polyline points="6.5 9 8 7 9.5 9"/>
  <polyline points="14.5 15 16 17 17.5 15"/>
  <line x1="8" y1="7" x2="8" y2="11"/>
  <line x1="16" y1="13" x2="16" y2="17"/>
</svg>
```

### 2. body 골조 — 4 viewport 매트릭스

```html
<body class="bg-page">
  <main class="max-w-[1600px] mx-auto px-6 py-12 space-y-16">
    <!-- 헤더: 차수 + 결정 요약 -->
    <header>...</header>

    <!-- VP1 모바일 다크 -->
    <section data-theme="dark">
      <div class="meta-label">📱 VP1 · 모바일 · 다크 · EvDetail (1호기 · 3개월 기본 · 점검필터=도어 · 이력탭=전체)</div>
      <div class="viewport-frame viewport-mobile">
        <!-- 가짜 페이지 배경 (overlay 아래) -->
        ...
        <!-- modal-overlay → evdetail-sheet-mobile -->
      </div>
    </section>

    <!-- VP2 모바일 라이트 -->
    <section data-theme="light">
      <div class="meta-label">📱 VP2 · 모바일 · 라이트 · EvDetail (4호기 · 6개월 · 이력탭=고장 · 점검필터=전체)</div>
      ...
    </section>

    <!-- VP3 데스크톱 다크 -->
    <section data-theme="dark">
      <div class="meta-label">🖥️ VP3 · 데스크톱 · 다크 · EvDetail (11호기 덤웨이터 · 1년 · 이력탭=검사 · 점검필터 표시 + KIND_STYLE 카탈로그)</div>
      <div class="viewport-frame viewport-desktop">
        ...
      </div>
    </section>

    <!-- VP4 데스크톱 라이트 -->
    <section data-theme="light">
      <div class="meta-label">🖥️ VP4 · 데스크톱 · 라이트 · EvDetail (5호기 에스컬레이터 · 1개월 · 이력탭=전체 · 점검필터/층별통계 영역 숨김)</div>
      ...
    </section>

    <!-- 디자인 결정 카탈로그 -->
    <section data-theme="dark">
      <div class="meta-label">🎨 KIND_STYLE 색 결정 카탈로그 (fault=fire / repair=safe / inspect=info / annual=secondary 회색)</div>
      ...
    </section>
  </main>
  <script>lucide.createIcons();</script>
</body>
```

### 3. EvDetail 모달 본체 (6 영역)

각 viewport 의 `<div class="modal-overlay"><div class="evdetail-sheet-mobile|evdetail-modal-desktop">` 내부 구조:

#### 영역 ① — 헤더 (.modal-header)
```html
<div class="modal-header">
  <div class="modal-header-icon-wrap">
    <!-- TYPE_ICON_COMPONENT 분기:
         VP1/VP2: ElevatorIcon SVG (passenger)
         VP3: lucide UtensilsCrossed (dumbwaiter)
         VP4: lucide MoveDiagonal (escalator) -->
  </div>
  <div class="flex-1 min-w-0">
    <div class="text-body font-bold text-t1">1호기</div>
    <div class="text-caption text-t3">B5F-2F · 7개층 · 투명 엘리베이터</div>
  </div>
  <button class="modal-close" aria-label="닫기">
    <i data-lucide="x"></i>
  </button>
</div>
```
- VP1 = "1호기" / "B5F-2F · 7개층 · 투명 엘리베이터"
- VP2 = "4호기" / "B3F-사8F · 6개층 · 오렌지 엘리베이터"
- VP3 = "11호기" / "B1F식당-2F하역장 · 덤웨이터"
- VP4 = "5호기" / "1-2F · 동측 에스컬레이터"
- **호기 ID(EV-01/EV-04/EV-11/ES-01) 본문 노출 금지** — "N호기" 라벨만

#### 영역 ② — 기간 선택 sub-header
```html
<div class="evdetail-subheader bd-b">
  <div class="evdetail-section-title">조회 기간</div>
  <div class="flex gap-2">
    <button class="evdetail-period-btn">1개월</button>
    <button class="evdetail-period-btn evdetail-period-btn-active">3개월</button>
    <button class="evdetail-period-btn">6개월</button>
    <button class="evdetail-period-btn">1년</button>
  </div>
  <div class="text-caption text-t3 text-right mt-1 font-mono">2026-02-15 ~ 2026-05-15</div>
</div>
```
- VP1 = 3개월 선택 (기본) → 2026-02-15 ~ 2026-05-15
- VP2 = 6개월 선택 → 2025-11-15 ~ 2026-05-15
- VP3 = 1년 선택 → 2025-05-15 ~ 2026-05-15
- VP4 = 1개월 선택 → 2026-04-15 ~ 2026-05-15
- **선택된 칩 = `.evdetail-period-btn-active` (bg-accent + text-on-accent)**, 비선택 = bg-sunken + text-tertiary

#### 영역 ③ — ElevatorInfoCard (placeholder 축약)
```html
<div class="evdetail-info-card-placeholder">
  <div class="bg-raised bd-b px-3 py-2 flex items-center justify-between">
    <span class="text-caption font-bold text-t1">승강기 정보</span>
    <span class="text-caption text-t3">↕ 스크롤</span>
  </div>
  <div class="bg-sunken px-3 py-2 grid grid-cols-[112px_1fr] gap-y-2 text-caption">
    <span class="text-t3 font-semibold">건물명</span>
    <span class="text-t1">차바이오컴플렉스</span>
    <span class="text-t3 font-semibold">호기(설치장소)</span>
    <span class="text-t1">{호기별}</span>
    <span class="text-t3 font-semibold">형식/종류</span>
    <span class="text-t1">{model_type 샘플}</span>
    <span class="text-t3 font-semibold">제조업체</span>
    <span class="text-t1">{제조사 샘플}</span>
    <span class="text-t3 font-semibold">유지관리업체</span>
    <span class="text-t1">{유지관리 샘플}</span>
    <span class="text-t3 font-semibold">운행구간</span>
    <span class="text-t1">{rangeText 샘플}</span>
    <!-- HTML 코멘트: 실제 카드는 12+ 행 · 모바일 maxHeight 170px 자체 스크롤. sketch 는 축약 6행 + 스크롤 표식만 -->
  </div>
</div>
```
- VP1: 1호기 / "MRL Gearless / 현대엘리베이터 / 현대엘리베이터(주) / B5F-2F (7층)"
- VP2: 4호기 / "MRL Gearless / 현대엘리베이터 / B3F-사8F (6층)"
- VP3: 4열 (데스크톱) — 11호기 / "덤웨이터 / OTIS / OTIS Korea / 200kg / B1F식당-2F하역장"
- VP4: 4열 — 5호기 에스컬레이터 / "에스컬레이터 / TKE / 1-2F / 9000명/h / 30°"
- compact (VP1/VP2) = 2열 / 일반 (VP3/VP4) = 4열 (코드 ElevatorInfoCard 그대로 시각화)

#### 영역 ④ — 층별 누적 이력 (엘리베이터만)
```html
<!-- VP1/VP2/VP3 (엘베+덤웨이터): 표시 / VP4 (escalator): 숨김 — HTML 코멘트 "ev.type !== 'escalator' 분기로 숨김" -->
<div>
  <div class="flex items-center mb-2">
    <div class="evdetail-section-title mb-0">층별 누적 이력</div>
    <div class="ml-auto flex gap-3 evdetail-legend-item">
      <span class="text-fire flex items-center gap-1"><i data-lucide="alert-octagon" class="w-3.5 h-3.5"></i>미해결</span>
      <span class="text-warn flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>이력있음</span>
      <span class="text-safe flex items-center gap-1"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>이상없음</span>
    </div>
  </div>
  <!-- 층별 row 3-4건 + 빈 상태 1건 -->
  <div class="evdetail-floor-row">
    <span class="text-caption font-bold text-t1 w-14 shrink-0">B5F</span>
    <div class="flex-1 flex gap-3 flex-wrap text-caption">
      <span class="text-danger">고장 2회 (미해결 1)</span>
      <span class="text-warn">조치지적 1회</span>
    </div>
    <i data-lucide="alert-octagon" class="w-5 h-5 text-fire"></i>
  </div>
  <!-- ... 추가 row 2-3건 -->
</div>
```
- VP1 = 4개 층 row (B5F: 고장 2/미해결 1 → alert-octagon fire / B2F: 고장 1 → alert-triangle warn / 연1F: 조치 2 → alert-triangle warn / 연2F: 이상없음 → check-circle-2 safe — 표시 안 함 코멘트로 노트)
- VP2 = 빈 상태 (3개월 → 6개월 늘렸으나 1건) + 6개월에 잡힌 사8F 1건
- VP3 = 1개층 row (B1F식당: 고장 1회) — 덤웨이터는 단일 층 단순
- VP4 = 영역 자체 숨김 (HTML 코멘트로 "VP4 escalator — ev.type !== 'escalator' false → 층별 통계 영역 숨김" 노트)

#### 영역 ⑤ — 점검항목 필터 (엘리베이터만)
```html
<!-- VP1/VP2/VP3 (엘베+덤웨이터): 표시 / VP4 (escalator): 숨김 — HTML 코멘트 노트 -->
<div>
  <div class="evdetail-section-title">점검항목 필터</div>
  <div class="flex gap-1.5 flex-wrap">
    <button class="evdetail-filter-chip">전체</button>
    <button class="evdetail-filter-chip evdetail-filter-chip-active">도어</button>
    <button class="evdetail-filter-chip">브레이크</button>
    <button class="evdetail-filter-chip">안전장치</button>
    <button class="evdetail-filter-chip">조명</button>
    <button class="evdetail-filter-chip">비상통화</button>
  </div>
</div>
```
- VP1 = 도어 선택 (active)
- VP2 = 전체 선택
- VP3 = 전체 선택
- VP4 = 영역 숨김 (코멘트)
- **선택 = bg-accent + text-on-accent**, 비선택 = bg-sunken + text-tertiary, flex-wrap (모바일 줄바꿈)

#### 영역 ⑥ — 이력 리스트 (핵심)
```html
<div>
  <div class="evdetail-section-title">이력</div>
  <!-- 이력 탭 5개 — overflow-x: auto 가로 스크롤 -->
  <div class="flex gap-1.5 mb-2.5 overflow-x-auto no-scrollbar">
    <button class="evdetail-hist-tab evdetail-hist-tab-active">전체</button>
    <button class="evdetail-hist-tab">고장</button>
    <button class="evdetail-hist-tab">수리</button>
    <button class="evdetail-hist-tab">점검</button>
    <button class="evdetail-hist-tab">검사</button>
  </div>
  <!-- 이력 카드들 — kind 별 좌측 3px 색바 -->
  <div class="evdetail-history-card kind-fault">
    <div class="flex items-center gap-1.5 mb-1">
      <i data-lucide="alert-octagon" class="w-3.5 h-3.5 text-fire"></i>
      <span class="kind-chip-fault text-fire">고장</span>
      <span class="floor-chip-info">B5F</span>
      <span class="check-item-chip-grey">도어</span>
      <span class="ml-auto text-caption text-t3 font-mono">2026-04-22</span>
    </div>
    <div class="text-body-sm font-semibold text-t1">도어 센서 오류</div>
    <div class="text-caption text-t3 mt-0.5">자동닫힘 동작 후 재오픈 반복. 센서 모듈 교체 필요.</div>
  </div>
  <!-- repair / inspect / annual 각 1건 이상 -->
</div>
```

**핵심 — KIND_STYLE 색 매핑 시각화:**
- `kind-fault` → 좌측 3px **fire** + 아이콘 `alert-octagon` text-fire + 라벨 `kind-chip-fault` text-fire
- `kind-repair` → 좌측 3px **safe** + 아이콘 `wrench` text-safe + 라벨 `kind-chip-repair` text-safe
- `kind-inspect` → 좌측 3px **info** + 아이콘 `clipboard-check` text-info + 라벨 `kind-chip-inspect` text-info
- `kind-annual` → 좌측 3px **text-tertiary** (var(--t3)) + 아이콘 `search` text-t3 + 라벨 `kind-chip-annual` text-t3 (분류만, 의미색 X)
- 발생층 칩 = `.floor-chip-info` (info-bg + text-info)
- 점검항목 칩 = `.check-item-chip-grey` (bg4 + text-t3)
- 날짜 = `.text-caption.text-t3.font-mono` (JetBrains Mono)

각 viewport 이력 카드 분포:
- VP1 (전체탭 · 3개월 · 도어필터) = 4건 (fault B5F 도어 / repair B5F / inspect 연1F 도어 / annual 정기검사 합격)
- VP2 (고장탭 · 6개월 · 전체필터) = 빈 상태 1건 ("해당 이력이 없어요" + FileSearch text-t3) — 코멘트로 "3개월 0건이라 6개월로 확장. 그 사이 1건 발견" 사실은 VP2 는 빈 상태가 아니라 6개월 결과 노출 → **수정: VP2 는 고장탭 클릭 → 1건 사8F 표시**
  - 정정: VP2 = fault 1건 (사8F 도어, 미해결) — empty state 는 VP3 검사탭에서 시각화 (덤웨이터는 KOELSA 비대상 → 검사 0건)
- VP3 (검사탭 · 1년 · 전체필터, 덤웨이터) = 빈 상태 ("해당 이력이 없어요" + FileSearch text-t3) — 코멘트로 "덤웨이터는 KOELSA 비대상 → annual 0건"
- VP4 (전체탭 · 1개월 · 에스컬) = 2건 (fault 1F 도어 / inspect 5호기 점검 — 점검필터 영역은 숨김이지만 inspect 이력은 표시)

### 4. 디자인 결정 카탈로그 섹션 (마지막 섹션)

```html
<section data-theme="dark">
  <div class="meta-label">🎨 KIND_STYLE 색 결정 카탈로그 (2D)</div>
  <div class="bg-raised p-6 rounded-2xl space-y-4" id="kind-style-catalog">
    <div class="text-title font-bold text-t1">KIND_STYLE 색 매핑 — 코드 vs 2D sketch 결정</div>
    <div class="text-body-sm text-t2">
      ElevatorPage.tsx line 1745-1750 현 코드의 KIND_STYLE 색을 v0.1.1 색 의미 단계화에 맞춰 정정.
      §6.1 색 의미 단순화 — fire 는 호기 고장 미수리 의미로 고정 (메모리 룰), 검사(annual)는 분류만 의미색 X.
    </div>
    <!-- 4 row 카탈로그 -->
    <div class="evdetail-history-card kind-fault">
      <div class="flex items-center gap-2">
        <i data-lucide="alert-octagon" class="w-4 h-4 text-fire"></i>
        <span class="text-body font-bold text-fire">fault — 고장</span>
        <span class="ml-auto text-caption text-t3 font-mono">현 코드: danger → 2D: <strong class="text-fire">fire</strong></span>
      </div>
      <div class="text-caption text-t3 mt-1">메모리 룰 "fire 의미 = 호기 고장 미수리" 통일. list 색바·EvDetail 색바·FaultNew CTA 모두 fire 그라디언트와 일관.</div>
    </div>
    <div class="evdetail-history-card kind-repair">...</div>  <!-- safe 유지 — "수리 완료/정상화" 의미 적합 -->
    <div class="evdetail-history-card kind-inspect">...</div>  <!-- info 유지 — accent 와 다른 톤 -->
    <div class="evdetail-history-card kind-annual">...</div>   <!-- warn → text-tertiary 회색. 검사는 분류만, KOELSA 외부 데이터 -->
  </div>
</section>
```

### 5. 자체 검수 — 12 verify gate 모두 통과 후 종료

작성 완료 직후 grep/wc 로 12 체크 모두 수동 확인 (verify_before_commit 섹션 명령 그대로). 인라인 `style="..."` 가 발견되면 즉시 CSS class 로 대체. 9·10·11px 가 발견되면 12px 이상으로 격상. 이모지 발견 시 lucide+SVG 로 대체. 12개 모두 PASS 확인 후 종료.
  </action>

  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design && f=cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html && [ -f "$f" ] && lines=$(wc -l < "$f") && [ "$lines" -ge 1500 ] && [ "$lines" -le 4500 ] && [ "$(grep -E 'font-size:\s*(9|10|11)px|text-\[(9|10|11)px\]' "$f" | wc -l)" -eq 0 ] && [ "$(grep -c 'data-theme=' "$f")" -ge 4 ] && [ "$(grep -cE '📱|🖥️' "$f")" -ge 4 ] && [ "$(grep -oE '🛗|📦|🔲|↕️|🔴|⚠️|✅|🔧|📋|🔍|✕' "$f" | wc -l)" -eq 0 ] && [ "$(grep -nE 'EV-[0-9]{2}|ES-[0-9]{2}' "$f" | grep -vE '^\s*[0-9]+:\s*(//|<!--|\*)' | wc -l)" -eq 0 ] && [ "$(grep -cE 'style="' "$f")" -eq 0 ] && grep -q '조회 기간\|기간 선택' "$f" && grep -q '승강기 정보' "$f" && grep -q '층별 누적' "$f" && grep -q '점검항목 필터' "$f" && grep -q '이력' "$f" && grep -qiE 'elevator-icon-svg|ElevatorIcon' "$f" && grep -qi 'utensils-crossed\|UtensilsCrossed' "$f" && grep -qi 'move-diagonal\|MoveDiagonal' "$f" && grep -qi 'data-lucide="x"\|lucide-x' "$f" && grep -qi 'check-circle' "$f" && grep -qi 'alert-triangle' "$f" && grep -qiE 'alert-octagon|siren' "$f" && grep -qi 'file-search' "$f" && grep -q '전체' "$f" && grep -q '고장' "$f" && grep -q '수리' "$f" && grep -q '점검' "$f" && grep -q '검사' "$f" && grep -q '브레이크' "$f" && grep -q '도어' "$f" && grep -q '안전장치' "$f" && grep -q '조명' "$f" && grep -q '비상통화' "$f" && grep -q '1개월' "$f" && grep -q '3개월' "$f" && grep -q '6개월' "$f" && grep -q '1년' "$f" && grep -qiE 'kind-style-catalog|KIND_STYLE 색 카탈로그|KIND_STYLE 색 결정' "$f" && echo "12/12 PASS"</automated>
  </verify>

  <done>
- `cha-bio-safety/docs/redesign-context/07-elevator/sketch/evdetail-modal-sketch.html` 파일 존재 (1500-4500 라인)
- 12 verify check 전부 PASS (라인수 / 9-11px 0 / data-theme ≥4 / 📱🖥️ ≥4 / 본문 이모지 0 / EV-/ES- 본문 0 / 인라인 style 0 / 6 영역 모두 / 9 아이콘 enumeration / 이력 5탭 / 점검필터 6옵션 / 기간 4옵션 + KIND_STYLE 카탈로그)
- 4 viewport (모바일 다크 1호기 · 모바일 라이트 4호기 · 데스크톱 다크 11호기 덤웨이터 · 데스크톱 라이트 5호기 에스컬) 시각화
- KIND_STYLE 색 결정 (fault=fire / repair=safe / inspect=info / annual=secondary 회색) 시각 매핑 + 4 row 카탈로그 명시
- 코드 변경 0건 (ElevatorPage.tsx / icons.tsx / 기타 src/ 어디도 수정 없음)
  </done>
</task>

</tasks>

<verification>
12 verify gate (task `<verify>` 의 automated 명령 그대로):
1. wc -l 1500-4500
2. font-size 9·10·11px = 0
3. data-theme= ≥4
4. 📱/🖥️ 라벨 ≥4
5. 본문 이모지(🛗📦🔲↕️🔴⚠️✅🔧📋🔍✕) = 0
6. EV-/ES- 본문 노출 = 0 (코멘트 허용)
7. 인라인 style="..." = 0
8. 6 영역 (헤더/기간/InfoCard/층별/점검필터/이력) 모두 등장
9. 아이콘 enumeration 9종 (ElevatorIcon SVG + Package + UtensilsCrossed + MoveDiagonal + X + CheckCircle2 + AlertTriangle + AlertOctagon|Siren + FileSearch) ≥1
10. 이력 5탭 (전체/고장/수리/점검/검사) 모두 등장
11. 점검필터 6옵션 (전체/브레이크/도어/안전장치/조명/비상통화) 모두 등장
12. 기간 4옵션 (1개월/3개월/6개월/1년) + KIND_STYLE 색 카탈로그 row 등장
</verification>

<success_criteria>
- 사용자가 sketch HTML 4 viewport 를 브라우저로 열어 시각 검토 가능
- KIND_STYLE 색 결정 (fault=fire / repair=safe / inspect=info / annual=secondary 회색) 이 카탈로그 row 와 이력 카드 양쪽에 일관되게 시각화
- 호기 ID 본문 노출 0 + 이모지 0 + 9-11px 0 + 인라인 style 0 (Wave 2+ TSX 변환 준비 완료)
- 12 verify gate 전부 PASS
- 코드 변경 0건 (ElevatorPage.tsx 및 src/ 어디도 수정 없음)
</success_criteria>

<output>
After completion, create `.planning/quick/260515-hbv-redesign-07-elevator-2d-sketch-evdetailm/260515-hbv-SUMMARY.md`:
- One-liner
- 12 verify gate 결과 표
- 4 viewport 매트릭스 표
- **KIND_STYLE 색 결정 (4종 토큰 매핑) 명시**
- 패턴 재사용 출처 (1차/2A/2B/2C → 토큰/CSS/모달 shell)
- 코드 변경 0건 명시
- Wave 2+ TSX 변환 후속 메모 (ElevatorInfoCard 그대로 재사용 / 검사 회색 = warn 충돌 회피 / fault fire = 메모리 룰 통일)
- commit hash + path
</output>

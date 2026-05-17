---
phase: quick-260517-kup
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html
  - .planning/quick/260517-kup-redesign-08-elevator-finding-detail-sket/260517-kup-SUMMARY.md
autonomous: true
requirements:
  - REDESIGN-08-SKETCH
must_haves:
  truths:
    - "08 ElevatorFindingDetailPage 의 모바일/데스크톱 × 다크/라이트 = 4 viewport 시안 HTML 1 개 파일이 존재한다"
    - "시안은 자체 헤더(h-12) + 정보 영역(KVRow) + 지적 사진 + 조치 입력 폼(조치일/textarea/사진 0-5장) + 고정 하단 CTA + 이미지 뷰어 진입 표현을 포함한다"
    - "시안은 02+06 chrome 통일 룰 (헤더 bg-surface-page, 백 버튼 h-7, 타이틀 text-body font-bold, 우측 액션 h-8 패턴) 을 따른다"
    - "시안은 v0.1.1 design-system §6 의 상태 색 룰 (미조치=fire, 조치완료=safe, danger 임계치 색 제한) 을 준수한다"
    - "시안 HTML 의 모든 클래스명은 Tailwind 만 사용하며 (CDN), 토큰명은 design-system.md 와 tokens.css 에 정의된 토큰을 verbatim 인용한다"
    - "표시 분기/라벨 (미조치/조치완료, 사진 N/5, 조치일/조치 내용 라벨 등) 은 TSX 503 LOC 의 텍스트를 그대로 사용 — 시안에서 새로 만들지 않는다"
    - "사용자 검토용 SUMMARY 가 시각 결정사항 (헤더 높이/KVRow spacing/이미지 뷰어 진입 방식/조치 폼 카드 패턴/고정 하단 CTA 높이 등) 을 명시한다"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html"
      provides: "08 ElevatorFindingDetailPage 시안 HTML — 4 viewport (모바일/데스크톱 × 다크/라이트)"
      contains: "data-theme, viewport-mobile, viewport-desktop, KVRow, h-12 헤더, 고정 하단 CTA"
    - path: ".planning/quick/260517-kup-redesign-08-elevator-finding-detail-sket/260517-kup-SUMMARY.md"
      provides: "사용자 검토용 시안 SUMMARY — 시각 결정사항 명시"
      contains: "헤더 높이, KVRow spacing, 이미지 뷰어 진입 방식, 조치 폼 카드 패턴, 고정 하단 CTA 높이"
  key_links:
    - from: "08 sketch HTML"
      to: "05 RemediationDetailPage sketch convention"
      via: "[data-theme] container + viewport-frame.viewport-mobile/desktop + meta-label + 인라인 tokens.css/typography.css"
      pattern: "viewport-frame viewport-(mobile|desktop)"
    - from: "08 sketch HTML"
      to: "02+06 chrome 통일 룰 (inspection-modal-chrome-rules.md §2)"
      via: "헤더 bg-surface-page + border-b + 타이틀 text-body font-bold + 우측 액션 h-8 패턴"
      pattern: "bg-surface-page|text-body font-bold|h-8|h-7"
    - from: "08 sketch HTML"
      to: "TSX 503 LOC ElevatorFindingDetailPage"
      via: "표시 분기 텍스트 verbatim (미조치/조치완료/조치 내용/조치일/조치 사진 N/5 등)"
      pattern: "미조치|조치완료|조치 내용|조치일|조치 사진"
---

<objective>
08 ElevatorFindingDetailPage (`/elevator/findings/:fid`, 503 LOC) 의 재디자인 시안 HTML 1 개를 작성한다.

Purpose:
- TSX 변환 전 시각 결정(헤더/spacing/상태 색/카드 패턴/CTA 높이)을 사용자가 검토·확정하기 위한 sketch HTML
- 05 RemediationDetailPage (자체 헤더 + 고정 하단 CTA + KVRow + 사진 뷰어) 와 같은 패턴 mirror
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 을 08 의 자체 헤더에 적용
- v0.1.1 design-system §6 (Progress Color Rule, Stat Card 룰, 카테고리 카드 룰) 의 상태 색 룰 준수 (위험 임계치 아닌 카드는 status 색 금지)

Output:
- `cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html` — 모바일/데스크톱 × 다크/라이트 4 viewport 시안 HTML
- `.planning/quick/260517-kup-redesign-08-elevator-finding-detail-sket/260517-kup-SUMMARY.md` — 사용자 검토용 SUMMARY

Out of scope (이 quick scope 밖):
- TSX 변환 (`src/pages/ElevatorFindingDetailPage.tsx` 교체) — 사용자 컨펌 후 별도 quick
- 이미지 뷰어 핀치줌/드래그/더블탭의 실제 인터랙션 로직 — sketch 는 시각만 표현 (TSX 변환 시 보존)
- `PhotoSourceModal` / `usePhotoUpload` 실제 모달 — sketch 에서는 “조치 사진 추가 버튼 + 썸네일 0~5 칸” 시각만 표현
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/08-elevator-finding-detail.md
@cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/design-system.md
@cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/ElevatorFindingDetailPage.tsx
@cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/tokens.css
@cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/typography.css
@cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/ui-index.tsx
@cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md

<!-- 이미 머지된 같은 패턴 sketch — 1:1 mirror 대상 -->
@cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html

<!-- TSX 변환의 같은 패턴 — 자체 헤더 + 고정 하단 CTA, 라벨 텍스트 출처 -->
@cha-bio-safety/src/pages/RemediationDetailPage.tsx

<interfaces>
<!-- 시안에서 verbatim 옮길 표시 분기·라벨·구조 단서 (ElevatorFindingDetailPage.tsx 에서 추출) -->

자체 헤더 (라인 217~250):
- height 48, bg `rgba(22,27,34,0.97)`, border-b
- 백 버튼 left:12, w36 h36, ChevronLeft SVG
- 타이틀: "지적사항 상세" — 16px 700

섹션 1 "지적 정보" (라인 269~289):
- SectionHeader "지적 정보" + 상태 배지 우상단
- 배지: 미조치=`danger` foreground + `rgba(239,68,68,.12)` bg / 조치완료=`safe` + `rgba(34,197,94,.12)`
- KVRow: 지적 내용 / 위치 / 등록일 / 등록자
- KVRow 구조: label width:64 text 12px t3, value 14px t1 lh:1.5, gap:12

섹션 2 "지적 사진" (라인 291~313):
- 단일 사진 (`finding.photoKey`) — 클릭 시 이미지 뷰어 진입
- 사진 없으면 "사진 없음" 13px t3

섹션 3 "조치 내용" (status='open' 만, 라인 315~429):
- 수리이력 선택 버튼 (옵션) — `🔧 수리이력에서 조치 선택` info 색
- 수리이력 picker drawer (background bg3, max-h 200)
- linkedRepair badge — safe-bg outline
- 조치일 input[type=date]
- 조치 내용 textarea (rows=4, "조치 내용을 입력하세요")
- 조치 사진 N/5 (1:1 정사각형 추가 버튼 + 썸네일 가로 스크롤)

섹션 4 "조치 결과" (status='resolved' 만, 라인 431~464):
- KVRow: 조치일시 / 조치자 / 조치 내용
- 조치 사진 (단일=max-h 240 / 다중=80×80 wrap)

고정 하단 CTA (status='open' 만, 라인 469~500):
- position fixed bottom, padding 12px 16px + safe-area-bottom
- 버튼 h48, full width, bg `--acl` (accent), 14px 700, "조치 완료" / "처리 중..."

이미지 뷰어 (라인 9~91):
- zIndex 300, position fixed, bg rgba(0,0,0,0.95)
- 우상단 ✕ 닫기 버튼 (24px white)
- sketch 에서는 정적 표현 — 핀치줌 SVG 안내 인디케이터 정도만
</interfaces>

<chrome_rules>
<!-- inspection-modal-chrome-rules.md §2 → 08 자체 헤더 매핑 -->

| 영역 | className | 비고 |
|---|---|---|
| 헤더 wrapper | `h-12 bg-surface-page border-b border-border-default flex items-center justify-center relative flex-shrink-0` | 48px = h-12. 데스크톱 분기는 06 처럼 `lg:h-[54px]` 추가 가능 (선택). |
| 백 버튼 | `absolute left-3 w-8 h-7 rounded-sm bg-surface-sunken border border-border-default text-text-secondary inline-flex items-center justify-center` + `<ChevronLeft size={15} />` | 06 chrome 룰의 w-8 h-7 mirror |
| 헤더 타이틀 | `text-body font-bold text-text-primary truncate` | "지적사항 상세" — text-body=16px |
</chrome_rules>

<status_color_rules>
<!-- design-system v0.1.1 §6 + memory: feedback_inspection_unresolved_color → 08 적용 매핑 -->

| 의미 | foreground | bar | bg | 비고 |
|---|---|---|---|---|
| 미조치 (open) | `text-status-fire` | `bg-status-fire-bar` | `bg-status-fire-bg` | **fire = 조치 대기. 메모리 룰: 미조치 색은 status-fire (주황)** |
| 조치완료 (resolved) | `text-status-safe` | `bg-status-safe-bar` | `bg-status-safe-bg` | safe = 정상/완료 |
| 정보 안내 (수리이력 선택) | `text-status-info` | — | `bg-status-info-bg` | info = 안내 |
| linkedRepair 연결됨 | `text-status-safe` | — | `bg-status-safe-bg` + `border-status-safe-bar` | safe 페어 |
| 사진 삭제 ✕ | `text-text-on-accent` | `bg-status-danger-bar` | — | 파괴적 액션 |

**금지:** 임계치 아닌 카드(KVRow 그리드) 에 status 색 사용 금지. 정보 영역은 모두 `text-text-primary` / `text-text-tertiary` 만 사용.
</status_color_rules>

</context>

<tasks>

<task type="auto">
  <name>Task 1: 기존 sketch convention 확인 (06-floorplan / 07-elevator / 05-remediation-detail) — 파일 위치·파일명·viewport 프레임 패턴 확정</name>
  <files>(read-only)</files>
  <action>
이 task 는 **반드시 first task**. 시안 작성 전 기존 convention 을 verbatim 으로 추출한다.

확인 대상 3개:
1. `cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html` — **1:1 mirror 1차 대상** (자체 헤더 + 고정 하단 CTA + KVRow + 사진 뷰어, 1152 줄, 6 viewport)
2. `cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-chrome-sketch.html` — chrome 룰 시각 검증용 (611 줄)
3. `cha-bio-safety/docs/redesign-context/07-elevator/sketch/elevator-sketch.html` — 같은 도메인(승강기) 시안 (1993 줄)

추출 항목 (SUMMARY 의 §A "convention 확정" 섹션에 표로 정리, sketch 작성에 verbatim 적용):

| 항목 | 05 의 값 (verbatim 인용) | 08 에 적용 |
|---|---|---|
| 파일 경로 | `cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/{slug}-sketch.html` | `cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html` |
| 인프라 | Tailwind CDN + Pretendard CDN + JetBrains Mono CDN + Lucide CDN | 동일 |
| 토큰 인라인 | `[data-theme="dark"]` / `[data-theme="light"]` 2 블록 + `:root` spacing + `@media (min-width:768px)` 분기 | 동일 verbatim |
| typography 클래스 | text-caption(12) / text-label(13) / text-body-sm(14) / text-body(16) / text-title(18) / text-heading(22) / text-display(28) | 동일 |
| viewport-frame | `.viewport-frame { ... }` + `.viewport-mobile {393×852}` + `.viewport-desktop {1280×720}` | 동일 |
| 페이지 메타 헤더 | 상단 cat-title + cat-sub 안내 박스 | 동일 패턴 |
| 섹션 1개 = viewport 1개 | `<section data-theme="dark" class="space-y-3">` + `<div class="meta-label">📱/🖥️ VPn · 모바일/데스크톱 · 다크/라이트 · {설명}</div>` + `<div class="viewport-frame viewport-(mobile|desktop)" data-theme="...">` | 동일 |
| viewport 수 | 6 (모바일 4 + 데스크톱 2) | **4** (모바일 다크 미조치 + 모바일 다크 완료 + 데스크톱 다크 미조치 + 모바일 라이트 완료) — task 부담 ↓, 사용자 검토는 충분 |

도구:
- `grep -n "[data-theme=\"dark\"]" cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html` 로 토큰 블록 시작 라인 확인
- `sed -n '24,200p'` 식으로 [data-theme] 블록 추출 — 08 sketch 에 그대로 복사 (수정 금지)
- `grep -n "viewport-frame\|viewport-mobile\|viewport-desktop" 05-...sketch.html` 로 프레임 CSS 위치 확인

산출:
- 위 표를 메모리에 보유 (SUMMARY task 에서 그대로 §A 로 작성)
- 05 sketch 의 `[data-theme]` + `:root spacing` + `@media (min-width:768px)` + `.viewport-frame` CSS 블록을 verbatim 으로 복붙할 위치(라인 번호)를 메모 (Task 2 에서 사용)
  </action>
  <verify>
    <automated>
      # 05/06/07 sketch 파일 3개가 존재하는지 + 8 컨텍스트 폴더가 존재하는지 확인
      test -f cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html && \
      test -f cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-chrome-sketch.html && \
      test -f cha-bio-safety/docs/redesign-context/07-elevator/sketch/elevator-sketch.html && \
      test -d cha-bio-safety/docs/redesign-context/08-elevator-finding-detail
    </automated>
  </verify>
  <done>
- convention 확정표(파일 경로/인프라/토큰 블록 위치/viewport-frame 패턴/섹션 구조) 가 메모리에 있음
- 08 sketch 파일 이름은 `elevator-finding-detail-sketch.html` 으로 고정 (05 의 `remediation-detail-sketch.html`, 07 의 `elevator-sketch.html` 와 같은 `{slug}-sketch.html` 패턴 mirror)
- 위치는 `cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/` 으로 고정
- 05 sketch 에서 복사할 인프라 CSS 블록 (data-theme / :root spacing / @media / viewport-frame) 의 라인 범위 식별 완료
  </done>
</task>

<task type="auto">
  <name>Task 2: 08 sketch HTML 작성 — 4 viewport (모바일/데스크톱 × 다크/라이트), 자체 헤더 + KVRow + 지적 사진 + 조치 폼 + 고정 하단 CTA + 이미지 뷰어 표현</name>
  <files>cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html</files>
  <action>
**시안 파일 생성**: `cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html`

(필요 시 `mkdir -p cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch` 먼저)

### 구조 (05 sketch 1:1 mirror)

1. **`<head>`**:
   - Tailwind CDN, Pretendard CDN, JetBrains Mono CDN, Lucide CDN — 05 sketch 의 head verbatim 복사
   - `<style>` 안에 05 sketch 의 `[data-theme="dark"]` / `[data-theme="light"]` 블록 + `:root` spacing 블록 + `@media (min-width:768px)` 블록 + 7단 typography 클래스 + `.viewport-frame` / `.viewport-mobile {width:393px;height:852px}` / `.viewport-desktop {width:1280px;height:720px}` 블록 verbatim
   - **추측 토큰명 절대 금지** — 05 sketch 또는 `cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/tokens.css` 에 존재하는 토큰만 사용

2. **`<body>` 상단**:
   - 페이지 안내 박스 (05 의 cat-title + cat-sub 패턴 mirror): "ElevatorFindingDetail Page — 모바일/데스크톱 × 다크/라이트 × 4 viewport (260517-kup)"
   - 결정사항 요약 박스: 헤더 h-12 / 백 버튼 w-8 h-7 / KVRow label width 64 / 상태 색 fire-safe / 고정 하단 CTA h-12

3. **4 viewports** (`<section data-theme>` × 4):
   - **VP1 · 모바일 · 다크 · 미조치 (status='open')** — 393×852
     * 자체 헤더 (h-12, 백 버튼 + "지적사항 상세")
     * Section 1 "지적 정보" + 미조치 배지 (`text-status-fire bg-status-fire-bg`)
       - KVRow × 4: 지적 내용 / 위치 / 등록일 / 등록자 (가짜 데이터: "1호기 비상정지 스위치 동작 불량 — 점검 시 응답 지연" / "B1F 기계실 / 1호기 제어반" / "2026.05.10 14:32" / "김검사관 (한국승강기안전공단)")
     * Section 2 "지적 사진" — 1장 (mock — gray placeholder + 클릭 cursor)
     * Section 3 "조치 내용":
       - "🔧 수리이력에서 조치 선택" 버튼 (`text-status-info bg-status-info-bg/8 border-status-info-bg/20`)
       - 조치일 input (type=date placeholder "2026-05-17")
       - textarea rows=4 placeholder="조치 내용을 입력하세요"
       - 조치 사진 0/5 (1:1 dashed 추가 버튼만)
     * 고정 하단 CTA "조치 완료" (h-12, `bg-accent text-text-on-accent`)

   - **VP2 · 모바일 · 다크 · 조치 완료 (status='resolved')** — 393×852
     * 자체 헤더 동일
     * Section 1 "지적 정보" + 조치완료 배지 (`text-status-safe bg-status-safe-bg`) + KVRow × 4
     * Section 2 "지적 사진" — 1장
     * **Section 3 → 없음** (open 만)
     * Section 4 "조치 결과":
       - KVRow × 3: 조치일시 / 조치자 / 조치 내용
       - 조치 사진 단일 (max-h 240)
     * **고정 하단 CTA → 없음** (open 만)

   - **VP3 · 데스크톱 · 다크 · 미조치 + 수리이력 picker 활성 (status='open')** — 1280×720
     * 데스크톱 standalone view (05 VP5 의 det-desktop-card 패턴 — 페이지를 중앙 카드로 표현하거나 max-w-2xl 컬럼)
     * 자체 헤더 (필요 시 `lg:h-[54px]` 적용 가능 — 06 chrome 룰 §2.1 데스크톱 분기)
     * Section 1 + Section 2 동일
     * Section 3 조치 내용 — 수리이력 picker drawer 열린 상태 (`max-h-[200px]` drawer + 수리이력 카드 2건 mock)
     * Section 3 조치 내용 — linkedRepair badge 표시 상태 (safe-bg outline + ✕ 닫기)
     * 조치 사진 2/5 (썸네일 2개 + 추가 버튼)
     * 고정 하단 CTA

   - **VP4 · 모바일 · 라이트 · 조치 완료 + 다중 사진 (status='resolved')** — 393×852
     * VP2 와 동일 구조, 라이트 테마
     * Section 4 조치 사진 다중 (80×80 wrap, 3장)
     * **이미지 뷰어 진입 상태 표시 별도**: VP4 우측 또는 하단에 작은 callout — "이미지 뷰어 진입 시: zIndex 300 black 95% overlay + 우상단 ✕ + 핀치줌/드래그 표현" (실제 viewer mock 은 옵션, callout 으로 시각 결정 명시)

### 시각 결정 (sketch 단계에서 확정)

| 항목 | 결정 | 근거 |
|---|---|---|
| 헤더 높이 | h-12 (48px) — 모바일/데스크톱 동일 | 05 mirror, TSX 503 LOC 의 height:48 verbatim |
| 헤더 배경 | `bg-surface-page` | inspection-modal-chrome-rules §2.1 |
| 백 버튼 | `w-8 h-7 bg-surface-sunken border border-border-default rounded-sm` + ChevronLeft size=15 | 06 chrome 룰 §7.2 mirror |
| 타이틀 | `text-body font-bold text-text-primary` (16px 700) | 룰 §2.3 |
| 섹션 padding | px-4 py-5 (모바일) | TSX `padding: '20px 16px'` verbatim |
| 섹션 구분선 | `border-b border-border-default` | TSX `borderBottom: '1px solid var(--bd)'` |
| SectionHeader | `text-caption font-bold text-text-tertiary mb-2.5 tracking-wider` | TSX `fontSize:12, fontWeight:700, color:var(--t3), marginBottom:10` |
| 상태 배지 (미조치) | `text-status-fire bg-status-fire-bg px-2 py-0.5 rounded-pill text-caption font-bold` | **메모리 `feedback_inspection_unresolved_color` — 미조치는 fire(주황)**. TSX 의 danger 사용은 통일 룰 위반 → 시안에서 교정 |
| 상태 배지 (조치완료) | `text-status-safe bg-status-safe-bg px-2 py-0.5 rounded-pill text-caption font-bold` | safe |
| KVRow | `flex items-start gap-3` + label `w-16 text-caption text-text-tertiary` + value `flex-1 text-label text-text-primary leading-relaxed` | TSX label width:64 + 12px t3 / value 14px t1 lh:1.5 verbatim |
| 지적 사진 | 단일 `w-full max-h-60 object-cover rounded-md border border-border-default` (max-h-60 = 240px) + cursor-pointer | TSX maxHeight:240 verbatim |
| "사진 없음" 빈 상태 | `text-label text-text-tertiary mt-2` | TSX 13px t3 |
| 수리이력 선택 버튼 | `w-full mb-3 px-3 py-2.5 rounded-sm bg-status-info-bg/40 border border-status-info-bg text-status-info text-caption font-bold` + 렌치 아이콘 | TSX rgba(59,130,246,.08/.2) info 페어 |
| 수리이력 drawer | `mb-3 bg-surface-sunken rounded-sm p-2.5 max-h-[200px] overflow-y-auto` | TSX bg3 + max-h:200 |
| linkedRepair badge | `mb-3 bg-status-safe-bg border border-status-safe-bar rounded-sm px-3 py-2 flex items-center gap-2` | TSX safe-bg outline |
| 조치일 input | `w-full px-3 py-2.5 rounded-sm bg-surface-raised border border-border-strong text-text-primary text-label` | inspection chrome 룰 §6.2 input |
| textarea | `w-full bg-surface-raised rounded-sm p-3 border border-border-strong text-text-primary text-label leading-relaxed resize-y` | 룰 §6.2 |
| 사진 추가 버튼 | `w-[72px] h-[72px] flex-shrink-0 rounded-md border border-dashed border-border-strong bg-surface-raised inline-flex flex-col items-center justify-center gap-1` + Camera 아이콘 + "0/5" `text-caption text-text-tertiary` | TSX 72×72 dashed |
| 사진 썸네일 | `w-[72px] h-[72px] flex-shrink-0 rounded-md object-cover border border-border-default` + 우상단 ✕ (`w-[18px] h-[18px] rounded-full bg-status-danger-bar text-text-on-accent`) | TSX 18×18 danger ✕ |
| 다중 조치 사진 | `grid grid-cols-[repeat(auto-fill,80px)] gap-1.5 mt-3` 각 `w-20 h-20 rounded-sm object-cover border border-border-default cursor-pointer` | TSX 80×80 wrap |
| 고정 하단 CTA wrapper | `fixed bottom-0 inset-x-0 bg-surface-page border-t border-border-default px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]` | TSX padding:12px 16px + var(--sab) |
| CTA 버튼 | `w-full h-12 bg-accent text-text-on-accent text-label font-bold rounded-md` (disabled 시 opacity-50) | TSX h:48, bg:--acl(accent), 14px 700 |
| 이미지 뷰어 mock | 별도 callout 박스 (실제 fullscreen 표현 옵션) — "zIndex 300, 검은 95% overlay, 우상단 ✕ 24px white, 핀치줌 transform 표현은 TSX 변환 시 보존" | TSX line 9~91 |

### 라벨 텍스트 (TSX 503 LOC 에서 verbatim — 시안에서 새로 만들지 말 것)

- "지적사항 상세", "지적 정보", "지적 사진", "조치 내용", "조치 결과"
- "지적 내용", "위치", "등록일", "등록자"
- "조치일시", "조치자"
- "미조치", "조치완료"
- "🔧 수리이력에서 조치 선택", "🔧 연결됨: "
- "조치일", "조치 내용을 입력하세요"
- "조치 사진", "(N/5)"
- "사진 없음", "수리 이력이 없습니다"
- "조치 완료", "처리 중..."

### 금지 사항 (자체 검수 — verify 단계에서 grep)

- 9·10·11px 사용 금지 — 노안 친화 12px 마지노선 (단 `feedback_text_caption_leading_none` 메모: text-caption 작은 컨테이너에서 `leading-none` 명시 가능. text-caption=12px 자체는 ok)
- 옛 토큰 (`var(--bg)`, `var(--bg2)`, `var(--bg3)`, `var(--bd)`, `var(--bd2)`, `var(--t1)`, `var(--t2)`, `var(--t3)`, `var(--acl)`) 직접 사용 금지 — Tailwind utility 또는 design-system v0.1.1 토큰만
- 추측한 토큰명 금지 — `cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/tokens.css` 에 정의된 이름만 사용
- 이모지를 결정 라벨/배지 텍스트에 새로 추가 금지 (TSX 에 이미 있는 `🔧` 만 보존, 나머지는 Lucide 아이콘)
- 임계치 아닌 KVRow grid 에 status 색 적용 금지 (text-primary / text-tertiary 만)

### 자체 검수 (sketch 작성 후 같은 task 안에서 즉시)

- 모든 viewport 가 393×852 또는 1280×720 사이즈로 렌더되는지 (CSS 명시)
- 미조치 배지가 `text-status-fire` (fire = 주황) 인지 — `text-status-danger` 가 아닌지
- 조치완료 배지가 `text-status-safe` (safe = 녹) 인지
- 백 버튼이 w-8 h-7 인지
- 헤더 타이틀이 text-body font-bold 인지
- 고정 하단 CTA 가 h-12 인지
- 옛 var() 토큰 0건, 9·10·11px 0건 — grep 검증

  </action>
  <verify>
    <automated>
      F=cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html && \
      test -f "$F" && \
      grep -q 'data-theme="dark"' "$F" && \
      grep -q 'data-theme="light"' "$F" && \
      grep -q 'viewport-mobile' "$F" && \
      grep -q 'viewport-desktop' "$F" && \
      grep -q 'text-status-fire' "$F" && \
      grep -q 'text-status-safe' "$F" && \
      grep -q '지적사항 상세' "$F" && \
      grep -q '지적 정보' "$F" && \
      grep -q '조치 내용' "$F" && \
      grep -q '조치 완료' "$F" && \
      grep -q 'h-12' "$F" && \
      grep -q 'h-7' "$F" && \
      grep -q 'KVRow\|w-16' "$F" && \
      ! grep -E 'text-\[(9|10|11)px\]|font-size:[[:space:]]*(9|10|11)px' "$F" && \
      ! grep -E 'var\(--bg[23]?\)|var\(--bd[2]?\)|var\(--t[123]\)|var\(--acl\)' "$F"
    </automated>
  </verify>
  <done>
- `elevator-finding-detail-sketch.html` 파일이 존재하고 4 viewport 모두 시각적으로 완성
- 데스크톱 1280×720 + 모바일 393×852 viewport-frame CSS 적용
- 다크 + 라이트 [data-theme] 각각 최소 1개 viewport
- 자체 헤더 h-12 / 백 버튼 w-8 h-7 / 타이틀 text-body font-bold / KVRow / 지적 사진 / 조치 폼 (조치일/textarea/0~5 사진) / 고정 하단 CTA / 이미지 뷰어 callout 모두 표현
- 미조치 = fire / 조치완료 = safe 색 페어 적용
- 옛 var() 토큰 0건 + 9·10·11px 0건 (grep 검증 통과)
- 라벨 텍스트 TSX verbatim (지적사항 상세 / 지적 정보 / 지적 사진 / 조치 내용 / 조치 결과 / 조치 완료 / 조치일 / 사진 없음 등) 모두 포함
  </done>
</task>

<task type="auto">
  <name>Task 3: 사용자 검토용 SUMMARY 작성 — 시각 결정사항 명시 (헤더 / KVRow spacing / 이미지 뷰어 진입 / 조치 폼 카드 / 고정 하단 CTA)</name>
  <files>.planning/quick/260517-kup-redesign-08-elevator-finding-detail-sket/260517-kup-SUMMARY.md</files>
  <action>
사용자가 시안을 검수하고 TSX 변환 단계로 넘어갈 결정을 내릴 수 있도록 SUMMARY 작성.

### SUMMARY 구조 (의무 섹션)

```markdown
# 260517-kup — 08 ElevatorFindingDetailPage sketch SUMMARY

**브랜치:** redesign/08-elevator-finding-detail (예정 — 아직 생성 전, 사용자 컨펌 후)
**산출물:** cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html
**대상 페이지:** src/pages/ElevatorFindingDetailPage.tsx (503 LOC, /elevator/findings/:fid, BottomNav 숨김)
**스코프:** sketch HTML 만. TSX 변환은 사용자 컨펌 후 별도 quick.

## §A. Convention 확정 (기존 sketch 1:1 mirror)

| 항목 | 값 |
|---|---|
| 파일 경로 | cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html |
| Mirror 대상 | 05 remediation-detail-sketch.html (자체 헤더 + 고정 CTA + KVRow + 사진 뷰어) |
| Chrome 룰 | 02+06 inspection-modal-chrome-rules.md §2 (헤더 bg-surface-page, 백 버튼 h-7, 타이틀 text-body font-bold) |
| Viewport 수 | 4 (모바일 다크 미조치 / 모바일 다크 완료 / 데스크톱 다크 미조치+picker / 모바일 라이트 완료+다중 사진) |
| Viewport 사이즈 | 모바일 393×852, 데스크톱 1280×720 (05 mirror) |
| 인프라 | Tailwind CDN + Pretendard CDN + JetBrains Mono CDN + Lucide CDN + [data-theme] 토큰 인라인 |

## §B. 시각 결정사항 — 헤더 / chrome

| 항목 | 결정 | 근거 |
|---|---|---|
| 헤더 높이 | h-12 (48px) | TSX 503 LOC verbatim + 05 mirror |
| 헤더 배경 | bg-surface-page | inspection chrome 룰 §2.1 |
| 백 버튼 | w-8 h-7 rounded-sm bg-surface-sunken border-border-default + ChevronLeft size=15 | 06 chrome 룰 §7.2 |
| 타이틀 | "지적사항 상세" — text-body font-bold text-text-primary | 룰 §2.3 |
| 데스크톱 분기 | (옵션) lg:h-[54px] — 06 패턴. 시안에서는 사용자 판단에 맡김 | — |

## §C. 시각 결정사항 — 정보 영역 (지적 정보 / 지적 사진)

| 항목 | 결정 | 근거 |
|---|---|---|
| 섹션 padding | px-4 py-5 (모바일) | TSX padding:20px 16px |
| 섹션 구분선 | border-b border-border-default | TSX |
| SectionHeader | text-caption font-bold text-text-tertiary mb-2.5 tracking-wider | TSX 12/700/t3/mb:10 |
| 미조치 배지 | text-status-fire bg-status-fire-bg rounded-pill (fire = 주황) | **메모리 feedback_inspection_unresolved_color** — TSX 의 danger 사용은 통일 룰 위반 → 시안에서 fire 로 교정 |
| 조치완료 배지 | text-status-safe bg-status-safe-bg rounded-pill | safe |
| KVRow | gap-3 + label w-16 text-caption text-text-tertiary + value text-label text-text-primary leading-relaxed | TSX gap:12 / label 64px 12px t3 / value 14px t1 lh:1.5 |
| 지적 사진 | w-full max-h-60 object-cover rounded-md border-border-default cursor-pointer | TSX maxHeight:240 |
| 이미지 뷰어 진입 | 클릭 → fullscreen zIndex 300 black 95% overlay + 우상단 ✕. **시안에서는 callout 으로 시각 결정만 명시**, 실제 핀치줌 인터랙션은 TSX 변환 시 보존 | TSX line 9~91 |

## §D. 시각 결정사항 — 조치 입력 폼 (status='open')

| 항목 | 결정 | 근거 |
|---|---|---|
| 수리이력 선택 버튼 | w-full mb-3 px-3 py-2.5 rounded-sm bg-status-info-bg/40 border-status-info-bg text-status-info text-caption font-bold | TSX info 페어 |
| 수리이력 drawer | mb-3 bg-surface-sunken rounded-sm p-2.5 max-h-[200px] overflow-y-auto + 카드 list | TSX bg3 + max-h:200 |
| linkedRepair badge | bg-status-safe-bg border-status-safe-bar rounded-sm px-3 py-2 flex items-center gap-2 + ✕ | TSX safe-bg outline |
| 조치일 input | w-full px-3 py-2.5 rounded-sm bg-surface-raised border-border-strong text-text-primary text-label | chrome 룰 §6.2 |
| textarea | w-full bg-surface-raised rounded-sm p-3 border-border-strong text-text-primary text-label leading-relaxed resize-y rows=4 | 룰 §6.2 |
| 사진 추가 버튼 | w-[72px] h-[72px] rounded-md border-dashed border-border-strong bg-surface-raised + Camera + "N/5" | TSX 72×72 dashed |
| 썸네일 | w-[72px] h-[72px] rounded-md object-cover border-border-default + 우상단 ✕ 18×18 bg-status-danger-bar | TSX 18×18 danger ✕ |

## §E. 시각 결정사항 — 고정 하단 CTA (status='open' only)

| 항목 | 결정 | 근거 |
|---|---|---|
| Wrapper | fixed bottom-0 inset-x-0 bg-surface-page border-t border-border-default px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] | TSX padding:12px 16px + var(--sab) |
| 버튼 | w-full h-12 bg-accent text-text-on-accent text-label font-bold rounded-md | TSX h:48 / bg:--acl / 14px 700 |
| Disabled | opacity-50 cursor-not-allowed | TSX |
| 본문 padding-bottom 보정 | TSX 의 paddingBottom: calc(72px + var(--sab)) 와 동일하게 처리 (시안에서는 정적 표현) | TSX line 267 |

## §F. 시각 결정사항 — 조치 결과 (status='resolved')

| 항목 | 결정 | 근거 |
|---|---|---|
| KVRow × 3 | 조치일시 / 조치자 / 조치 내용 (whitespace-pre-wrap) | TSX line 435~441 |
| 단일 사진 | w-full max-h-60 object-cover rounded-md cursor-pointer | TSX line 446~450 |
| 다중 사진 | grid-cols-[repeat(auto-fill,80px)] gap-1.5 mt-3 + w-20 h-20 rounded-sm object-cover cursor-pointer | TSX 80×80 wrap |
| 하단 CTA | 없음 (resolved 는 본문만) | TSX line 469 분기 |

## §G. 변경하지 않은 것 (TSX 보존 / 시안 표현만)

- 이미지 뷰어 핀치줌/드래그/더블탭 로직 (TSX line 9~91)
- useQuery / useMutation / queryClient 흐름
- 수리이력 선택 → linkedRepair → memo/resolveDate 자동 채움 흐름
- handlePhotoAdd 압축/업로드/5장 제한 로직
- 상태 분기 (status='open' / 'resolved') — 라벨 텍스트 모두 verbatim

## §H. 사용자 검토 항목 (예 / 아니오)

1. 헤더 — h-12 + 백 버튼 w-8 h-7 + 타이틀 text-body font-bold 으로 06 chrome 룰 mirror — 진행 OK?
2. 미조치 배지를 fire(주황) 으로 교정 — 메모리 룰 적용 OK? (TSX 원본은 danger 였음)
3. KVRow label width w-16 (64px) 유지 — 모바일 좁은 화면에서도 ok?
4. 조치 사진 썸네일 72×72 dashed 추가 + 가로 스크롤 패턴 유지 OK?
5. 고정 하단 CTA h-12 + bg-accent 단색 (gradient 폐기) OK?
6. 이미지 뷰어 진입은 시안에서 callout 으로만 표시. 실제 fullscreen mock viewport 1개 추가 필요한지?
7. 데스크톱 분기 — 헤더 lg:h-[54px] 적용 vs h-12 고정 — 어느쪽?
8. 4 viewport 외 추가 케이스 필요 (예: VP5 라이트 미조치 / VP6 데스크톱 라이트 등)?

## §I. 다음 단계

사용자 컨펌 → 새 quick 으로 TSX 변환 (브랜치 `redesign/08-elevator-finding-detail`):
- 시안 verbatim 적용 → `src/pages/ElevatorFindingDetailPage.tsx` 교체
- 비즈니스 로직 100% 보존 (이미지 뷰어 / useQuery / useMutation / handlePhotoAdd / linkedRepair 흐름)
- 옛 var() 토큰 → v0.1.1 Tailwind 토큰
- Lucide 아이콘 (ChevronLeft / Camera / Wrench / X / Check) 적용
- npm run build PASS + 시각 검수
```

SUMMARY 작성 시 §B~§F 의 표는 sketch HTML 의 실제 className/구조와 1:1 일치해야 한다. (sketch 와 SUMMARY 가 따로 놀면 TSX 변환 단계에서 혼란.)

  </action>
  <verify>
    <automated>
      F=.planning/quick/260517-kup-redesign-08-elevator-finding-detail-sket/260517-kup-SUMMARY.md && \
      test -f "$F" && \
      grep -q '§A' "$F" && \
      grep -q '§B' "$F" && \
      grep -q '§C' "$F" && \
      grep -q '§D' "$F" && \
      grep -q '§E' "$F" && \
      grep -q '§F' "$F" && \
      grep -q '§H' "$F" && \
      grep -q 'h-12' "$F" && \
      grep -q 'w-8 h-7' "$F" && \
      grep -q 'text-status-fire' "$F" && \
      grep -q '이미지 뷰어' "$F" && \
      grep -q '고정 하단 CTA' "$F" && \
      grep -q 'KVRow' "$F" && \
      grep -q '조치 폼\|조치 내용' "$F"
    </automated>
  </verify>
  <done>
- SUMMARY 파일이 `.planning/quick/260517-kup-.../260517-kup-SUMMARY.md` 에 존재
- §A convention / §B 헤더 / §C 정보영역 / §D 조치 폼 / §E 고정 CTA / §F 조치 결과 / §G 보존 / §H 사용자 검토 / §I 다음 단계 모두 작성
- §H 사용자 검토 항목 ≥ 6개 (예/아니오 또는 선택)
- 시각 결정 (헤더 h-12 / KVRow spacing / 이미지 뷰어 진입 방식 callout / 조치 폼 카드 패턴 / 고정 하단 CTA h-12) 모두 명시
- sketch HTML 의 className 과 SUMMARY 의 표가 verbatim 일치
- 사용자가 SUMMARY 만 읽고도 시안의 모든 시각 결정을 알 수 있는 self-contained 상태
  </done>
</task>

</tasks>

<verification>
- `cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html` 가 4 viewport 표시
- `.planning/quick/260517-kup-redesign-08-elevator-finding-detail-sket/260517-kup-SUMMARY.md` 가 §A~§I 작성
- 옛 var() 토큰 0건 (grep), 9·10·11px 0건, 추측 토큰 0건
- 라벨 텍스트 TSX 503 LOC verbatim (지적사항 상세 / 지적 정보 / 지적 사진 / 조치 내용 / 조치 결과 / 조치 완료 / 조치일 / 사진 없음 / 수리 이력이 없습니다)
- 미조치 = fire, 조치완료 = safe (메모리 feedback_inspection_unresolved_color 룰 적용)
- 자체 헤더 h-12 + 백 버튼 w-8 h-7 + 타이틀 text-body font-bold (06 chrome 룰 §7.2 mirror)
- KVRow 구조 = TSX label 64px / value 14px t1 lh:1.5 verbatim
- 고정 하단 CTA 가 h-12 + bg-accent 단색 (gradient 폐기)
- 이미지 뷰어 진입은 시안에서 callout 표시 — 실제 인터랙션은 TSX 변환 시 보존
</verification>

<success_criteria>
- sketch HTML 1 개 + SUMMARY 1 개 = 총 2 산출물
- 사용자가 SUMMARY 의 §H 검토 항목에 응답함으로써 TSX 변환 quick 의 결정사항이 확정됨
- 시안만으로도 시각 디자인(헤더/spacing/사이즈/색/배치) 모두 식별 가능
- TSX 503 LOC 의 비즈니스 로직(useQuery/useMutation/이미지 뷰어/handlePhotoAdd/linkedRepair) 은 시안에서 다루지 않음 — TSX 변환 quick 의 책임
- 코드(`cha-bio-safety/src/`) 변경 0건 — 이 quick 은 docs/ 만 수정
</success_criteria>

<output>
After completion, the orchestrator returns:

```
## SKETCH READY FOR REVIEW

**Path:** cha-bio-safety/docs/redesign-context/08-elevator-finding-detail/sketch/elevator-finding-detail-sketch.html
**SUMMARY:** .planning/quick/260517-kup-redesign-08-elevator-finding-detail-sket/260517-kup-SUMMARY.md
**Viewports:** 4 (모바일 다크/라이트 + 데스크톱 다크)

다음 단계: 사용자 검토 → §H 응답 → TSX 변환 quick (별도)
```
</output>

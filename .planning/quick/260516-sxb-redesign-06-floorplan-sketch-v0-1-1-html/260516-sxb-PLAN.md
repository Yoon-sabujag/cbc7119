---
phase: quick-260516-sxb
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html
  - cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html
autonomous: true
requirements:
  - QUICK-260516-SXB-01
must_haves:
  truths:
    - "두 파일에 v0.1.1 토큰 인라인 + Tailwind CDN + Pretendard + lucide UMD + [data-theme] dark/light + 393x852 모바일 / 1280x720 데스크톱 viewport-frame 인프라가 04 remediation-sketch / 03 qr-scan-sketch 와 1:1 mirror 로 들어가 있다."
    - "floorplan-sketch.html — 메인 화면(자체 헤더 + 도면 타입 4탭 + 13층 가로 스크롤 칩 + 도면 캔버스 + 마커 분포 + 마커 클릭 바텀시트/말풍선 + 범례) + 마커 카탈로그(4 plan type x marker types x 6 status 격자)가 모바일 다크/라이트 + 데스크톱 다크/라이트 4 viewport 로 모두 시각화 된다."
    - "floorplan-modals-sketch.html — 모달 5종(마커 추가 / 마커 수정 / 인라인 점검 기록 입력 / 자산 정보+분리 / 미배치 안내·배치 확인·소화기 분리 confirm 3종) + 팝업 2종(InspectionRevisitPopup completed/pending-action 2 variant + AccessBlockedPopup) 이 모바일 다크 / 라이트 / 데스크톱 다크 viewport 로 모두 시각화 된다."
    - "도면 위 마커 색은 한 곳도 인라인 hex 가 없고 --status-{safe|warning|danger|info|fire}-bar 토큰만 사용한다 (배경/오버레이 제외)."
    - "결과 배지 페어 (불량=danger / 주의=warning), 상태 배지 페어 (미조치=fire / 완료=safe), CTA 단색 var(--accent), 마지노 12px, 자체 헤더 패턴이 04+05 paired-precedent 와 1:1 일치한다."
    - "12px 미만 폰트 사이즈 0건, leading-none 가 작은 컨테이너(h-8 헤더 버튼/배지) 안 text-caption 에 명시되어 있다."
    - "lucide-react 아이콘은 페이지에서 실제로 쓰이는 것만 등장 (ChevronLeft / Plus / MapPin / Camera / Trash2 / X / Edit3 / CheckCircle2 / AlertTriangle / XCircle / Wrench / Flame / Info / ZoomOut)."
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html"
      provides: "메인 화면 (헤더 + 4탭 + 층 스크롤 + 도면 + 마커 + 선택 바텀시트/말풍선 + 범례) + 마커 카탈로그"
      contains: "viewport-mobile, viewport-desktop, [data-theme] dark/light, fp- prefix CSS, MarkerIcon SVG 7+2+4+7 종 인라인 (옛 코드 verbatim)"
    - path: "cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html"
      provides: "모달 5종 + 팝업 2종"
      contains: "[data-theme] dark/light, fp- prefix CSS, InspectionRevisitPopup completed/pending-action 2 variant 외형, AccessBlockedPopup 외형"
  key_links:
    - from: "두 sketch HTML"
      to: "04 remediation-sketch / qr-scan-sketch 인프라"
      via: "[data-theme] 토큰 인라인 + viewport-frame + meta-label + lucide UMD + Pretendard"
      pattern: "[data-theme=\"dark\"] 와 [data-theme=\"light\"] 가 둘 다 정의, lucide.createIcons() 호출"
    - from: "MarkerIcon 카탈로그"
      to: "FloorPlanPage MarkerIcon switch case"
      via: "verbatim SVG (rect/polygon/circle/line 좌표·viewBox 옛 코드 그대로)"
      pattern: "<svg viewBox=\"0 0 20 20\"> 같은 viewBox + 옛 hex 가 아닌 var(--status-*-bar) 토큰만 fill"
    - from: "결과·상태 배지"
      to: "04 remediation-sketch 배지 패턴"
      via: "bg-danger-soft text-danger / bg-warn-soft text-warn / bg-fire-soft text-fire / bg-safe-soft text-safe"
      pattern: "<span class=\"... rounded-pill bg-{...}-soft text-{...}\">"
---

<objective>
06-floorplan (FloorPlanPage.tsx, 2165줄) 를 v0.1.1 디자인 시스템 + 04+05 paired-precedent 패턴으로 시각 재디자인한 **시안 HTML 2 파일** 을 생성한다.

**옵션 B (2 파일 분할) 선택 — 사유:**
- 페이지가 2165 줄, 모달 5종 + 팝업 2종이 200줄 이상 가지런히 늘어선 구조 (1724~2030 라인).
- 마커 카탈로그도 4 plan type × marker types(6+2+4+7=19) × 6 status = 114 셀 격자가 들어가야 함.
- 단일 HTML 로 모두 담으면 5000+ 줄 — executor 한 번에 검수 어렵고 컨텍스트 한 번에 70%+ 소진.
- 02-inspection 분할 패턴 (260510-4li + 후속) 검증된 선례. 시안 1(메인+카탈로그) → 사용자 검수 → 시안 2(모달+팝업) 단위 검수 가능.

Purpose: 변환 wave(TSX) 가 마커 카탈로그를 verbatim 매핑 가이드로 쓰고, 모달은 별도 wave 에서 분리 변환할 수 있도록 시각 컨트랙트를 확정한다.

Output:
- cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html (메인 + 카탈로그)
- cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html (모달 + 팝업)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-quick.md
</execution_context>

<context>
@CLAUDE.md
@.planning/STATE.md
@cha-bio-safety/docs/redesign-context/06-floorplan/06-floorplan.md
@cha-bio-safety/docs/redesign-context/06-floorplan/design-system.md
@cha-bio-safety/docs/redesign-context/06-floorplan/FloorPlanPage.tsx
@cha-bio-safety/docs/redesign-context/06-floorplan/tokens.css
@cha-bio-safety/docs/redesign-context/06-floorplan/typography.css
@cha-bio-safety/docs/redesign-context/06-floorplan/AccessBlockedPopup.tsx
@cha-bio-safety/docs/redesign-context/06-floorplan/InspectionRevisitPopup.tsx
@cha-bio-safety/docs/redesign-context/06-floorplan/PhotoButton.tsx

<!-- Paired-precedent 인프라 mirror (verbatim 인용 대상) -->
@cha-bio-safety/docs/redesign-context/04-remediation/sketch/remediation-sketch.html
@cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html
@cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html

<interfaces>
<!-- FloorPlanPage 에서 verbatim 으로 가져올 데이터/상수 -->

PLAN_TYPES (4) — FloorPlanPage.tsx L18-23:
- { key: 'guidelamp',    label: '유도등' }
- { key: 'detector',     label: '감지기' }
- { key: 'sprinkler',    label: '스프링클러' }
- { key: 'extinguisher', label: '소화기·소화전' }

FLOORS (13) — L26-28:
- '8-1F', '8F', '7F', '6F', '5F', '4F', '3F', '2F', '1F', 'B1', 'B2', 'B3', 'B4', 'B5'
  (실제 옛 코드 verbatim 확인 후 인용)

GUIDELAMP_MARKER_TYPES (6) — L32-39:
- ceiling_exit (천장피난구)
- wall_exit (벽부피난구)
- room_corridor (거실통로)
- hallway_corridor (복도통로)
- stair_corridor (계단통로)
- seat_corridor (객석통로)
  (실제 라벨 verbatim 확인 후 인용)

DETECTOR_MARKER_TYPES (2):
- smoke_detector (연기감지기)
- heat_detector (열감지기)

SPRINKLER_MARKER_TYPES (4):
- closed_head, open_head, king_head, test_valve

EXTINGUISHER_MARKER_TYPES (7):
- fire_extinguisher (분말 3.3kg), ext_powder20 (분말 20kg), ext_halogen (할로겐), ext_kitchen_k (K급 주방)
- indoor_hydrant (소화전), descending_lifeline (완강기), div_marker (DIV)

EXTINGUISHER_ADD_OPTIONS (4종 — 마커 추가 모달 노출):
- 소화기 빈 개소, 소화전, 완강기, DIV

STATUS_COLOR (L103-110):
- uninspected: #9ca3af (회색)
- normal:      #22c55e (=safe bar)
- caution:     #eab308 (NOTE: 옛 코드. v0.1.1 매핑: --status-warning-bar)
- bad/fault:   #ef4444 (=danger bar)
- resolved:    #3b82f6 (=accent. 사용자 인지 매핑 검토: 옛 코드 그대로 accent 유지. v0.1.1 에서는 --accent 또는 --status-info-bar)

MarkerIcon SVG 형태 (L131~248) — verbatim 옛 코드 SVG 좌표 그대로 인용 (사이즈만 20→18 또는 24 로 분기):
- wall_exit: rect x=1 y=1 w=s-2 h=s-2 rx=2 fill stroke #fff 1.5
- ceiling_exit: polygon 역사다리꼴 1,2 s-1,2 s*0.75,s-2 s*0.25,s-2
- stair_corridor: 마름모 + 가로 흰선 (상하 삼각만 색)
- hallway_corridor: 마름모 + 세로 흰선 (좌우 삼각만 색)
- room_corridor: 역삼각형 polygon 1,2 s-1,2 hs,s-2
- seat_corridor: circle r=hs-1
- smoke_detector: 외곽 원 stroke=color + 내부 점
- heat_detector: 위향 삼각 polygon hs,2 s-1,s-2 1,s-2
- closed_head: 작은 채운 원 r=hs*0.65
- open_head: 작은 빈 원 r=hs*0.65 stroke=color
- king_head: 이중 원 (바깥 채움 + 안쪽 흰선 빈 원)
- test_valve: 사각+십자
- fire_extinguisher: circle r=hs-1 (외곽 stroke prop)
- ext_powder20: circle r=hs-1 + 안쪽 작은 흰선 빈 원 r=hs*0.4
- ext_halogen: 위향 삼각
- ext_kitchen_k: 위향 삼각 + 내부 작은 흰선 빈 원
- indoor_hydrant: 육각 polygon hs,1 s-2,hs*0.5 s-2,hs*1.5 hs,s-1 2,hs*1.5 2,hs*0.5
- descending_lifeline: 빈 마름모 (fill none stroke=color)
- div_marker: rect rx=2 (wall_exit 동일)

REPLACE_WARNING_STROKE — 3 단계 (warn/imminent/danger) 외곽 stroke 두께·색·dangerBadge.
- danger 마커는 우상단 ! 배지: 12x12 빨강원 + 흰 보더 + ! 텍스트 (FloorPlanPage L253-275 verbatim)

페이지 구조 (옛 코드 L940 return 부터 verbatim 확인):
1. 헤더 — height 54(desktop)/auto(mobile) bg=raised border-b. 좌(모바일만): back ChevronLeft. 중: '소방 시설 도면'. 우: [마커 편집 / 편집 완료] + [축소보기] ghost 버튼 2개.
2. 도면 타입 탭 (4) — flex: 1 일렬, 활성=accent fill, 비활성=sunken bd, '준비중' 배지 (옛 코드 비활성 케이스 — 현재 4종 모두 ready:true).
3. 층 선택 (13) — 가로 스크롤 칩, 활성=accent fill, 비활성=sunken bd.
4. 도면 캔버스 — flex:1 dark bg #1a1f2b (옛 코드 그대로 또는 --surface-page 매핑). 핀치줌 표시는 시안에서 정적 placeholder (회색 그리드 또는 'PDF 도면' 가운데 라벨).
5. 도면 위 마커 — 정규화 (x,y) 위치에 ~6~8 개 분포 (다양한 상태 섞어서 카탈로그 효과).
6. 편집모드 상단 인포 배너 — '더블클릭으로 마커 추가...' (accent bg 85% 알파).
7. 마커 선택 바텀시트 (모바일) / 말풍선 (데스크톱) — 마커 아이콘 + 라벨 + ID/floor/status 메타 + CTA(점검 기록 입력 / 조치 / 수정 / 삭제).
8. 범례 — minHeight 93, padding '1px 12px 26px', 2 row (마커 종류 row + 상태 row) flex-wrap 양끝정렬. 소화기 plan 일 때 미배치+REPLACE_WARNING 3단계 추가.
</interfaces>

<paired_precedent_decisions>
<!-- 04 remediation-sketch (260516-q2i, feb8da9) + 05 remediation-detail-sketch (260516-rhl, 0c6315e) 에서 잠긴 디자인 결정. 06 도 1:1 mirror. -->

1. **결과 배지 페어**: 
   - 불량 = `bg-danger-soft text-danger` (--status-danger-bg + --status-danger-bar)
   - 주의 = `bg-warn-soft text-warn` (--status-warning-bg + --status-warning-bar)

2. **상태 배지 페어**:
   - 미조치 = `bg-fire-soft text-fire` (--status-fire-bg + --status-fire-bar)
   - 완료(조치완료) = `bg-safe-soft text-safe`

3. **CTA 단색 단일**: `bg-acl text-on-accent` (var(--accent), 그라디언트 폐기). 
   - 옛 코드의 조치 버튼 `linear-gradient(135deg,#f59e0b,#ef4444)` 도 단색 fire 또는 accent 로 단순화.

4. **노안 마지노 12px**: text-caption(12), 9/10/11px 사용 금지.

5. **자체 헤더 패턴**: 06 도 BottomNav 숨김 페이지 (`MOBILE_NO_NAV_PATHS` 포함). 따라서 03 qr-scan 자체 헤더 패턴 mirror:
   - height 52, bg=raised, border-b=default
   - 좌(모바일): back 버튼 (32x32 ghost). 데스크톱: back 제거.
   - 중: 타이틀 'text-title text-text-primary' (18px 600).
   - 우: ghost 버튼 2개 (h-8 padding 0 12 rounded-sm 12px font-weight 600). 활성시 accent text.
   - 작은 컨테이너 안 12px 텍스트는 **leading-none 명시** (메모 feedback_text_caption_leading_none).

6. **admin 액션 outline 페어**: 마커 편집/삭제는 admin 만. 삭제는 danger outline (`border-danger text-danger bg-transparent`).

7. **§6.2 negative rule**: 카드/배지/마커 외 영역에 status 색 금지. 단, **도면 위 마커 색은 §6.2 예외** — 마커 자체가 상태 표현 매체이므로 status-bar 토큰 사용 (의도된 디자인).

8. **§6.3 일관성**: 카테고리 아이콘 색은 회색 통일. 이 페이지에서는 도면 타입 탭 라벨이 카테고리 — 활성 아닌 탭 라벨 색 통일 (--text-tertiary).
</paired_precedent_decisions>

<tasks>

<task type="auto">
  <name>Task 1: floorplan-sketch.html — 메인 화면 + 마커 카탈로그 viewport 4개</name>
  <files>cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html</files>
  <action>
**한 파일만 생성한다.** Write tool 로 한 번에 작성 (cat heredoc 금지).

**(0) 인프라 mirror (verbatim 1:1 — 04 remediation-sketch 200~290 라인 그대로 인용)**:
- doctype, viewport meta, title '소방 시설 도면 재디자인 시안 v0.1.1 — Floor Plan / Marker Catalog (260516-sxb)'
- Tailwind CDN (`https://cdn.tailwindcss.com`)
- Pretendard Variable CSS `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css`
- JetBrains Mono `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap`
- lucide UMD `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`
- `<style>` 블록에 04 remediation-sketch.html 의 다음 섹션을 verbatim 복사:
  - `[data-theme="dark"]` 와 `[data-theme="light"]` 토큰 카탈로그 전체 (color/border/accent/status/duty 9 카테고리)
  - `:root` spacing/radius/font/`--nav-h` 51
  - typography.css 7단계 인라인 (.text-caption ~ .text-display, .text-mono)
  - 토큰 → CSS class 매핑 (`.bg-page`, `.bg-raised`, `.bg-sunken`, `.bg-active`, `.bg-overlay`, `.text-t1`, `.text-t2`, `.text-t3`, `.text-on-accent`, `.text-acl`, `.text-link`, `.text-safe`, `.text-warn`, `.text-danger`, `.text-info`, `.text-fire`, `.bg-safe`, `.bg-warn`, `.bg-danger`, `.bg-info`, `.bg-fire`, `.bg-safe-soft`, `.bg-warn-soft`, `.bg-danger-soft`, `.bg-info-soft`, `.bg-fire-soft`, `.bg-acl`, `.bg-acl-soft`, `.bd`, `.bd-subtle`, `.bd-strong`, `.bd-b`, `.bd-b-subtle`, `.bd-t`, `.bd-r`, `.bd-l`, `.ring-strong`, `.ring-default`, `.ring-danger`)
  - 시안 메타 (body bg #1a1d22, .meta-label, .viewport-frame radius 24 shadow 20/60, .viewport-mobile 393x852, .viewport-desktop 1280x720, .page-shell, .desktop-shell, .no-scrollbar)
  - .page-section-title (28/700 #e6edf3), .page-section-sub (16 #8b949e)
  - .cat-box-* / .cat-title-* / .cat-label-dark / .cat-sub-dark
  - .icon-xs ~ .icon-5xl
  - @keyframes blink + .anim-blink

**(1) 06 페이지 전용 CSS 추가 (`fp-` prefix)**:

```css
/* ── 페이지 자체 헤더 (03 qr-scan-sketch L257~293 mirror) ── */
.fp-page-hd {
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  background: var(--surface-raised);
  border-bottom: 1px solid var(--border-default);
}
.fp-page-hd-left { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
.fp-back-btn {
  width: 32px; height: 32px; flex-shrink: 0;
  border-radius: 8px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.fp-page-hd-title {
  font-size: 18px; font-weight: 600; line-height: 1.2;
  color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.fp-hd-actions { display: flex; gap: 8px; flex-shrink: 0; }
.fp-hd-btn {
  height: 32px; padding: 0 12px;
  border-radius: 8px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  font-size: 12px; font-weight: 600; line-height: 1;  /* leading-none — 메모 강제 */
  cursor: pointer; font-family: inherit;
  display: inline-flex; align-items: center; gap: 4px;
  transition: background .13s, border-color .13s;
}
.fp-hd-btn.is-active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-on-accent);
}

/* ── 도면 타입 탭 (4종, flex 일렬) ── */
.fp-plan-tabs {
  flex-shrink: 0;
  display: flex; gap: 4px;
  padding: 8px 12px;
  background: var(--surface-raised);
  border-bottom: 1px solid var(--border-default);
}
.fp-plan-tab {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  display: inline-flex; align-items: center; justify-content: center;
  transition: background .13s;
}
.fp-plan-tab.is-active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-on-accent);
}

/* ── 층 선택 칩 (가로 스크롤) ── */
.fp-floor-scroll {
  flex-shrink: 0;
  display: flex; gap: 4px;
  overflow-x: auto;
  padding: 8px 12px;
  background: var(--surface-raised);
  border-bottom: 1px solid var(--border-default);
}
.fp-floor-chip {
  flex-shrink: 0;
  height: 32px; padding: 0 12px;
  border-radius: 8px;
  font-size: 12px; font-weight: 600; line-height: 1;
  cursor: pointer; font-family: inherit;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  display: inline-flex; align-items: center; justify-content: center;
  transition: background .13s;
}
.fp-floor-chip.is-active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-on-accent);
}

/* ── 도면 캔버스 (시안: 정적 placeholder) ── */
.fp-canvas {
  flex: 1; min-height: 0;
  position: relative;
  overflow: hidden;
  background: var(--surface-page);  /* 옛 코드 #1a1f2b → 다크 surface-page, 라이트는 surface-sunken 자동 분기 검토 */
  display: flex; align-items: center; justify-content: center;
}
[data-theme="light"] .fp-canvas { background: var(--surface-sunken); }

/* PDF placeholder — 정적 도면 자리 */
.fp-canvas-placeholder {
  width: 92%; height: 88%;
  border: 1px dashed var(--border-strong);
  border-radius: 12px;
  background:
    repeating-linear-gradient(0deg, transparent 0 39px, var(--border-subtle) 39px 40px),
    repeating-linear-gradient(90deg, transparent 0 39px, var(--border-subtle) 39px 40px);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.fp-canvas-placeholder-label {
  font-size: 12px; font-weight: 600; line-height: 1;
  color: var(--text-tertiary);
  padding: 4px 10px;
  background: var(--surface-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
}

/* ── 편집모드 상단 인포 배너 (정적 시각화) ── */
.fp-edit-banner {
  position: absolute; top: 0; left: 0; right: 0; z-index: 5;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.9);
  font-size: 12px; font-weight: 600; line-height: 1;
  color: #ffffff;
  text-align: center;
}

/* ── 도면 위 마커 dot (status 색 = bar 토큰) ── */
.fp-marker-dot {
  position: absolute;
  display: inline-flex; align-items: center; justify-content: center;
}
.fp-marker-dot svg { display: block; }

/* 미배치 ? 마커 — fire 빨강 원 안 흰 ? */
.fp-marker-empty {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--status-danger-bar);
  border: 1.5px solid var(--text-on-accent);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: var(--text-on-accent);
  line-height: 1;
}

/* danger 배지 (마커 우상단 ! — 옛 코드 L253-275 verbatim) */
.fp-marker-danger-badge {
  position: absolute; top: -8px; right: -8px;
  width: 12px; height: 12px;
  background: var(--status-danger-bar);
  border: 1.5px solid var(--text-on-accent);
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 900; color: var(--text-on-accent);
  line-height: 1;
}

/* ── 마커 선택 바텀시트 (모바일) ── */
.fp-bottomsheet {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 30;
  background: var(--surface-raised);
  border-top: 1px solid var(--border-strong);
  border-radius: 16px 16px 0 0;
  padding: 14px 16px 18px;
}
.fp-bottomsheet-grab {
  width: 36px; height: 4px;
  background: var(--border-strong);
  border-radius: 2px;
  margin: 0 auto 12px;
}
.fp-marker-head {
  display: flex; align-items: flex-start; gap: 12px;
  margin-bottom: 14px;
}
.fp-marker-icon-box {
  width: 40px; height: 40px; flex-shrink: 0;
  border-radius: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  /* 배경/보더 색은 status 별 inline 매핑: bg-{...}-soft + bd 1px {status}-bar 알파 */
}
.fp-marker-meta {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 4px;
}
.fp-marker-title { font-size: 16px; font-weight: 600; line-height: 1.3; color: var(--text-primary); }
.fp-marker-sub-row {
  display: flex; flex-wrap: wrap; gap: 8px;
  font-size: 12px; line-height: 1; color: var(--text-tertiary);
}
.fp-marker-close-btn {
  width: 32px; height: 32px; flex-shrink: 0;
  background: transparent; border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}

/* ── CTA 단색 (그라디언트 폐기, 04 mirror) ── */
.fp-cta-row { display: flex; gap: 8px; }
.fp-cta {
  flex: 1; height: 44px;
  border-radius: 10px;
  background: var(--accent);
  border: none;
  color: var(--text-on-accent);
  font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: inherit;
}
.fp-cta.is-fire { background: var(--status-fire-bar); }  /* 조치 CTA — gradient 폐기, fire 단색 */
.fp-cta-outline {
  flex: 1; height: 44px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit;
}
.fp-cta-delete {
  width: 44px; height: 44px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--status-danger-bar);
  color: var(--status-danger-bar);
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}

/* ── 데스크톱 말풍선 ── */
.fp-balloon {
  position: absolute; z-index: 30;
  width: 320px;
  background: var(--surface-raised);
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  padding: 14px 16px 16px;
}
.fp-balloon-arrow {
  position: absolute; width: 0; height: 0;
}
.fp-balloon-arrow.is-bottom {
  top: -8px;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--surface-raised);
}

/* ── 범례 (옛 코드 minHeight 93 wrap 양끝정렬) ── */
.fp-legend {
  flex-shrink: 0;
  padding: 4px 12px 26px;
  background: var(--surface-raised);
  border-top: 1px solid var(--border-default);
  display: flex; flex-direction: column; gap: 8px;
  min-height: 93px;
}
.fp-legend-row {
  display: flex; flex-wrap: wrap; align-items: center;
  justify-content: space-between;
  gap: 6px 8px;
}
.fp-legend-item {
  display: inline-flex; align-items: center; gap: 5px;
  flex-shrink: 0;
}
.fp-legend-label {
  font-size: 12px; font-weight: 500; line-height: 1;
  color: var(--text-secondary);
  white-space: nowrap;
}
.fp-legend-divider {
  width: 1px; height: 12px;
  background: var(--border-default);
  margin: 0 2px;
}

/* ── 마커 카탈로그 viewport 전용 ── */
.fp-cat-section {
  width: 100%;
  padding: 24px;
}
.fp-cat-block {
  background: var(--surface-raised);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}
.fp-cat-block-title {
  font-size: 14px; font-weight: 700; line-height: 1;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex; align-items: center; gap: 8px;
}
.fp-cat-block-title-badge {
  font-size: 11px; font-weight: 600; line-height: 1;
  padding: 4px 8px;
  border-radius: 99px;
  background: var(--surface-sunken);
  color: var(--text-tertiary);
}
.fp-cat-grid {
  display: grid;
  grid-template-columns: 110px repeat(6, 1fr);  /* marker label + 6 status */
  gap: 8px;
  align-items: center;
}
.fp-cat-grid-head {
  font-size: 11px; font-weight: 600; line-height: 1;
  color: var(--text-tertiary);
  text-align: center;
  padding: 4px 0;
}
.fp-cat-marker-label {
  font-size: 12px; font-weight: 500; line-height: 1.3;
  color: var(--text-primary);
}
.fp-cat-marker-cell {
  height: 48px;
  background: var(--surface-sunken);
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
}
```

**(2) 페이지 외곽 구조**: 04 / 03 mirror 의 `meta-label` + viewport-frame 4개 가로 배치.
- VP1 (모바일 다크) — 메인 화면 (편집모드 OFF, 일반 점검 모드, 소화기 plan 활성). 헤더 + 4탭 + 층 + 도면 캔버스 + 8 개 마커 분포 + 범례 + 선택 안 됨.
- VP2 (모바일 다크) — 마커 선택 바텀시트 노출 (불량 상태 indoor_hydrant 마커 선택, 점검 기록 입력 + 조치 CTA 둘 다).
- VP3 (모바일 라이트) — VP1 의 라이트 분기.
- VP4 (데스크톱 다크) — header height 54, 4탭 + 13층(가로 모두 보임) + 도면 캔버스 + 8 개 마커 + 마커 1개에 말풍선 노출 (정상 wall_exit). 범례 표시.

각 viewport 위 `<div class="meta-label">VP1 — 모바일 / 다크 / 메인</div>` 라벨.

**(3) 도면 위 마커 분포 데이터 (재현 가능 비주얼)**:
사용자가 '실제 데이터처럼 보이도록' 8개 마커를 캔버스에 정규화 좌표로 배치:
- 좌상단 (12%, 18%) — guidelamp wall_exit, status=normal (safe bar)
- 우상단 (78%, 22%) — guidelamp ceiling_exit, status=caution (warning bar)
- 중앙 좌 (28%, 50%) — guidelamp room_corridor, status=bad (danger bar) + ! danger 배지
- 중앙 (52%, 48%) — guidelamp stair_corridor, status=normal
- 중앙 우 (72%, 55%) — guidelamp hallway_corridor, status=resolved (info bar 또는 accent)
- 좌하단 (18%, 78%) — guidelamp seat_corridor, status=uninspected (회색)
- 중하단 (48%, 82%) — extinguisher fire_extinguisher, status=normal + REPLACE_WARNING imminent stroke
- 우하단 (76%, 80%) — extinguisher (미배치) — fp-marker-empty `?`

각 마커 크기 size=20 (mobile), size=18 (desktop 살짝 작게).

VP1/VP3/VP4 는 plan='guidelamp' 컨텍스트 마커 6종 + 우하단에 1개만 extinguisher 미배치 시각화 — 또는 plan='extinguisher' 활성 시 마커 8 개 전부 소화기 종류로 교체한 sub-variant 도 좋다 (택1, 사용자가 plan tab 활성에 따라 마커가 바뀌는 걸 보여줘야 함). 권장: VP1 = guidelamp 활성, VP4 = extinguisher 활성 (REPLACE_WARNING 시각 효과 전시).

**(4) 마커 카탈로그 섹션 (별도 viewport)**:
VP5 (모바일 다크, 카탈로그 전용 viewport — height auto 1200px 정도) 또는 VP4 데스크톱 아래 별도 page-section-title 'Marker Catalog — 19 markers × 6 status'.

4 블록:
- 블록 1 — 유도등 (6 markers): ceiling_exit, wall_exit, room_corridor, hallway_corridor, stair_corridor, seat_corridor
- 블록 2 — 감지기 (2): smoke_detector, heat_detector
- 블록 3 — 스프링클러 (4): closed_head, open_head, king_head, test_valve
- 블록 4 — 소화기·소화전 (7): fire_extinguisher, ext_powder20, ext_halogen, ext_kitchen_k, indoor_hydrant, descending_lifeline, div_marker

각 블록 안에 fp-cat-grid (label + 6 status cells). 상태 컬럼 헤더: 미점검 / 정상 / 주의 / 불량 / 조치완료 / 미배치(소화기만 한 셀).

각 셀의 fill 색:
- 미점검 = var(--text-tertiary) (#9ca3af or 라이트 분기 token 자동)
- 정상 = var(--status-safe-bar)
- 주의 = var(--status-warning-bar)
- 불량 = var(--status-danger-bar) + 우상단 ! 배지
- 조치완료 = var(--accent) (옛 코드 #3b82f6 매핑) — NOTE: 사용자에게 '옛 코드는 resolved=#3b82f6 accent 였음. v0.1.1 매핑: --accent. 만약 info bar 가 더 의미 맞다고 판단되면 사용자에게 컨펌 요청' 주석 한 줄 추가.
- 미배치 (소화기 행만) = fp-marker-empty

**또한 소화기 4종 (fire_extinguisher, ext_powder20, ext_halogen, ext_kitchen_k) 행에는 REPLACE_WARNING 3단계 행 추가 (warn / imminent / danger)** — stroke 두께·색 verbatim 매핑.

**(5) 페이지 섹션 타이틀**:
- 첫 viewport row 위에 `<h1 class="page-section-title">06 Floor Plan — v0.1.1 Sketch</h1><p class="page-section-sub">Main / Mobile Dark / Mobile Light / Desktop Dark · 04+05 paired-precedent mirror · 260516-sxb</p>`
- 카탈로그 viewport 위에 별도 섹션 타이틀 'Marker Catalog (verbatim SVG)' + sub 'TSX 변환 wave 매핑 가이드 · 19 markers × 6 status · REPLACE_WARNING 3 stage'.

**(6) lucide 초기화**:
```html
<script>lucide.createIcons();</script>
```
페이지 마지막 `</body>` 직전.

사용 아이콘 (lucide name — `<i data-lucide="..."></i>`):
- chevron-left (헤더 back, 데스크톱 말풍선 화살표는 CSS triangle)
- plus (마커 추가 placeholder 모달 — 단, 이 파일에는 모달 X)
- map-pin (메타 row 위치 아이콘)
- zoom-out (헤더 우측 '축소보기' 버튼 icon)
- edit-3 또는 pencil (마커 편집 버튼)
- camera (PhotoButton — 이 파일엔 모달 없으니 카탈로그 외 사용 X)
- check-circle-2 (정상 배지 — VP2 바텀시트)
- alert-triangle (주의 배지)
- x-circle (불량 배지)
- wrench (조치 CTA 아이콘)
- flame (미조치 상태 아이콘)
- info (편집 모드 인포 배너)

**(7) 디자인 룰 강제 자체 검수** (executor 가 작성 중 체크):
- 12px 미만 폰트 사용 0 — `grep -E "font-size:\s*(9|10|11)px" floorplan-sketch.html` 결과 0.
- 헤더 우측 fp-hd-btn / fp-floor-chip / fp-marker-empty / fp-marker-danger-badge / fp-legend-label 등 작은 컨테이너의 12/11px 텍스트는 모두 `line-height: 1` 명시 (메모 feedback_text_caption_leading_none).
- 도면 위 마커 색은 한 곳도 인라인 hex 없고 var(--status-*-bar) 토큰만 — `grep -E "fill=\"#[0-9a-f]{3,6}\"" floorplan-sketch.html | grep -v "fill=\"#fff\"" | grep -v "fill=\"none\""` 결과 0 (단, fill="#fff" 흰 stroke/내부선은 옛 코드 verbatim 이므로 허용. 마커 안쪽 가는 흰선·이중원 안쪽 흰선 등).
- CTA gradient 0 — `grep -i "linear-gradient" floorplan-sketch.html` 결과 0 또는 04 mirror 의 '오늘 점검 대상 배너' 1건만 (06 에는 해당 배너 없으므로 0 권장).
- 결과 배지: 불량=danger-soft+text-danger, 주의=warn-soft+text-warn 한 곳도 색 페어 어긋남 없음.
- 상태 배지: 미조치=fire-soft+text-fire, 완료=safe-soft+text-safe.
- 옛 토큰 (--bg2/--t1/--acl/--c-* 등 alias) 사용 0 — `grep -E "var\(--(bg2|bg3|t1|t2|t3|acl|c-)" floorplan-sketch.html` 결과 0. 새 토큰만.

**(8) Verbatim CSS 인용**: 04 remediation-sketch.html 의 토큰 블록 / typography / class 매핑 / viewport-frame / page-section-title 는 **추측하지 않고 grep 으로 추출한 정의를 그대로 인용** (메모 feedback_planner_prompt_sketch_verbatim 강제).
  </action>
  <verify>
<automated>
test -f cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && head -8 cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html | grep -q "Floor Plan" \
  && grep -q 'data-theme="dark"' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'data-theme="light"' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'lucide.createIcons' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'viewport-mobile' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'viewport-desktop' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'Marker Catalog' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'fp-page-hd' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'fp-plan-tab' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'fp-floor-chip' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'fp-canvas' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'fp-marker' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'fp-legend' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && grep -q 'fp-cat-grid' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html \
  && (grep -E 'font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html | grep -v '^[[:space:]]*\*' | grep -v '^[[:space:]]*//') ; \
  test "$?" != "0" \
  && (grep -i 'linear-gradient' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html | grep -v '^[[:space:]]*\*' | grep -v '^[[:space:]]*//') ; \
  test "$?" != "0" \
  && (grep -E 'var\(--(bg2|bg3|bg4|t1|t2|t3|acl|bd2)' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html) ; \
  test "$?" != "0" \
  && echo "PASS — floorplan-sketch.html"
</automated>

수동 검수 (사용자 확인):
- 브라우저에서 floorplan-sketch.html 열어서 VP1~VP4 모두 비주얼 일치 확인.
- 마커 카탈로그 19 markers × 6 status = 114 셀 모두 채워졌는지.
- 도면 위 마커 색이 status-bar 토큰 (safe=#22c55e dark / safe=#15803d light 등) 으로 표시되는지 다크/라이트 양쪽 확인.
- 작은 컨테이너 안 12px 텍스트 (헤더 버튼·층 칩·범례 라벨·danger 배지) 시각 정렬 확인 (leading 점프 없음).
  </verify>
  <done>
- floorplan-sketch.html 파일이 존재한다.
- VP1 (모바일 다크 메인), VP2 (모바일 다크 바텀시트 선택), VP3 (모바일 라이트 메인), VP4 (데스크톱 다크 메인 + 말풍선) 4 viewport 모두 시각화.
- 마커 카탈로그 4 블록 (유도등 6 / 감지기 2 / 스프링클러 4 / 소화기·소화전 7) × 6 status = 114 셀 + 소화기 REPLACE_WARNING 3 stage 추가 행.
- 모든 그래프 패스 (12px 미만 0건, gradient 0건, 옛 alias 0건).
- 04 remediation-sketch / 03 qr-scan-sketch 인프라와 시각 톤 1:1 mirror.
  </done>
</task>

<task type="auto">
  <name>Task 2: floorplan-modals-sketch.html — 모달 5종 + 팝업 2종</name>
  <files>cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html</files>
  <action>
**한 파일만 생성한다.** Write tool, Task 1 의 인프라(`<style>` 토큰/typography/class 매핑/viewport-frame/meta) 를 그대로 복사 (verbatim — 두 파일 인프라 1:1 동일).

**(1) 06 모달 전용 CSS 추가**:

```css
/* ── 모달 오버레이 (옛 코드 inset 0 absolute 패턴) ── */
.fp-modal-overlay {
  position: absolute; inset: 0; z-index: 50;
  background: var(--surface-overlay);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.fp-modal-card {
  width: 100%; max-width: 340px;
  background: var(--surface-raised);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 20px;
  max-height: 86vh; overflow-y: auto;
}
.fp-modal-card.is-wide { max-width: 360px; }
.fp-modal-title {
  font-size: 16px; font-weight: 600; line-height: 1.3;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.fp-modal-sub {
  font-size: 12px; line-height: 1.5;
  color: var(--text-tertiary);
  margin-bottom: 14px;
}
.fp-modal-section-label {
  font-size: 12px; font-weight: 600; line-height: 1;
  color: var(--text-tertiary);
  margin-bottom: 6px;
  letter-spacing: 0.02em;
}

/* ── KV 그리드 (자산 정보 모달) ── */
.fp-kv-grid {
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
  margin-bottom: 10px;
}
.fp-kv-row { font-size: 12px; line-height: 1.5; }
.fp-kv-label { color: var(--text-tertiary); }
.fp-kv-value { color: var(--text-primary); font-weight: 600; }

/* ── 자산 sub-action row (정보 수정 / 소화기 분리) ── */
.fp-asset-sub-row { display: flex; gap: 6px; margin-bottom: 14px; }
.fp-asset-sub-btn {
  flex: 1; height: 36px;
  border-radius: 8px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  font-size: 12px; font-weight: 600; line-height: 1;
  cursor: pointer; font-family: inherit;
}
.fp-asset-sub-btn.is-danger {
  background: var(--status-danger-bg);
  border: 1px solid var(--status-danger-bar);
  color: var(--status-danger-bar);
}

/* ── 결과 토글 3택 (정상/주의/불량) — 04+05 mirror ── */
.fp-result-row { display: flex; gap: 6px; margin-bottom: 14px; }
.fp-result-btn {
  flex: 1; height: 44px;
  border-radius: 10px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-tertiary);
  font-size: 14px; font-weight: 700; line-height: 1;
  cursor: pointer; font-family: inherit;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
}
.fp-result-btn.is-active-safe {
  background: var(--status-safe-bg);
  border: 2px solid var(--status-safe-bar);
  color: var(--status-safe-bar);
}
.fp-result-btn.is-active-warning {
  background: var(--status-warning-bg);
  border: 2px solid var(--status-warning-bar);
  color: var(--status-warning-bar);
}
.fp-result-btn.is-active-danger {
  background: var(--status-danger-bg);
  border: 2px solid var(--status-danger-bar);
  color: var(--status-danger-bar);
}

/* ── 증상 피커 (05 detail mirror) ── */
.fp-symptom-row { display: flex; gap: 5px; margin-bottom: 12px; }
.fp-symptom-btn {
  flex: 1; height: 40px;
  border-radius: 10px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  font-size: 13px; font-weight: 600; line-height: 1;
  cursor: pointer; font-family: inherit;
}
.fp-symptom-btn.is-active {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: var(--text-on-accent);
}

/* ── textarea + 사진 버튼 row ── */
.fp-text-row { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 14px; }
.fp-textarea {
  flex: 1; min-height: 72px; padding: 10px 12px;
  border-radius: 10px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  font-size: 13px; line-height: 1.6;
  resize: none; font-family: inherit;
  outline: none;
}
.fp-photo-btn {
  width: 80px; height: 72px; flex-shrink: 0;
  border-radius: 10px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px;
  font-size: 11px; font-weight: 600; line-height: 1;
  font-family: inherit;
}

/* ── 모달 푸터 (취소/저장) ── */
.fp-modal-foot { display: flex; gap: 8px; }
.fp-modal-cancel {
  flex: 1; height: 42px;
  border-radius: 10px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit;
}
.fp-modal-submit {
  flex: 1; height: 42px;
  border-radius: 10px;
  background: var(--accent);
  border: none;
  color: var(--text-on-accent);
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
}
.fp-modal-submit.is-danger {
  background: var(--status-danger-bar);
}

/* ── 마커 종류 옵션 (3 col grid) — 마커 추가/수정 모달 ── */
.fp-marker-options-3col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  margin-bottom: 14px;
}
.fp-marker-option-btn {
  padding: 10px 6px;
  border-radius: 8px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; line-height: 1.3;
  font-family: inherit;
}
.fp-marker-option-btn.is-active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-on-accent);
}

/* ── 구역 3택 ── */
.fp-zone-row { display: flex; gap: 6px; margin-bottom: 14px; }
.fp-zone-btn {
  flex: 1; height: 40px;
  border-radius: 8px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  font-size: 13px; font-weight: 700; line-height: 1;
  cursor: pointer; font-family: inherit;
}
.fp-zone-btn.is-active {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: var(--text-on-accent);
}

/* ── input ── */
.fp-input {
  width: 100%; height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  font-size: 13px; line-height: 1;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 14px;
}

/* ── confirm 모달 (작은, 한 줄 메시지) ── */
.fp-confirm-card {
  width: 100%; max-width: 320px;
  background: var(--surface-raised);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.fp-confirm-title {
  font-size: 16px; font-weight: 600; line-height: 1.3;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: flex; align-items: center; gap: 8px;
}
.fp-confirm-body {
  font-size: 13px; line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
.fp-confirm-body strong { color: var(--text-primary); font-weight: 600; }

/* ── 재진입 팝업 (InspectionRevisitPopup 2 variant — 04+05 mirror) ── */
.fp-revisit-card {
  width: 100%; max-width: 320px;
  background: var(--surface-raised);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.fp-revisit-icon-box {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.fp-revisit-icon-box.is-completed {
  background: var(--status-safe-bg);
  color: var(--status-safe-bar);
}
.fp-revisit-icon-box.is-pending-action {
  background: var(--status-fire-bg);
  color: var(--status-fire-bar);
}
.fp-revisit-title {
  font-size: 16px; font-weight: 600; line-height: 1.3;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.fp-revisit-meta {
  font-size: 12px; line-height: 1.5;
  color: var(--text-tertiary);
  margin-bottom: 14px;
}

/* ── 접근불가 팝업 (AccessBlockedPopup mirror) ── */
.fp-access-card {
  width: 100%; max-width: 340px;
  height: 290px;
  background: var(--surface-raised);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center;
  gap: 12px;
}
.fp-access-icon-box {
  width: 60px; height: 60px;
  border-radius: 14px;
  background: var(--status-danger-bg);
  color: var(--status-danger-bar);
  display: inline-flex; align-items: center; justify-content: center;
}
```

**(2) viewport 구성 (모두 viewport-mobile / viewport-desktop)**:

VP1 (모바일 다크) — **마커 클릭 점검 기록 입력 모달** (소화전 + paired BC 노출 케이스):
- 모달 카드: 제목 '점검 기록 입력' + sub '소화전 1F-101 · 1F'
- 점검 결과 3택 (정상 활성) — fp-result-btn is-active-safe
- (소화전이라 paired BC 섹션 분기) divider + paired BC 카드 (category='비상콘센트', location, description) + 비상콘센트 결과 3택 + 비상콘센트 textarea+photo
- 본 결과 textarea + photo button
- 푸터 (취소 / 저장)

VP2 (모바일 다크) — **점검 기록 입력 모달, 유도등 + 불량 + 증상 피커 노출 케이스**:
- 제목 '점검 기록 입력' + sub '거실통로 유도등 · 7F'
- 결과 3택 (불량 활성) — fp-result-btn is-active-danger
- 증상 피커 3택 ('점등 이상' / '예비전원 이상' / '직접 입력') — '직접 입력' 활성
- textarea (라벨 '증상 상세 및 특이사항 (선택)') + photo
- 푸터

VP3 (모바일 다크) — **자산 정보 + 점검 모달, 소화기 (ext_powder20) 케이스**:
- 제목 '점검 기록 입력' + sub '5번계단 뒤 · B1'
- KV 그리드 (위치/제조업체/제조년월/형식승인/접두문자/증지번호/제조번호/ID — 8 row, 2 col)
- 자산 sub-action row (정보 수정 / 소화기 분리[danger])
- 결과 3택 (정상 활성)
- textarea + photo
- 푸터

VP4 (모바일 다크) — **마커 추가 모달, planType='extinguisher' 케이스**:
- 제목 '마커 추가'
- 마커 종류 4 옵션 3-col grid (소화기 빈 개소 / 소화전 / 완강기 / DIV) — '소화기 빈 개소' 활성
- 개소명 input (placeholder '예: 5번계단 뒤')
- 구역 3택 (연구동 / 사무동 / 지하) — '지하' 활성
- 푸터 (취소 / 추가)

VP5 (모바일 다크) — **마커 추가 모달, planType='guidelamp' 케이스**:
- 제목 '마커 추가'
- 구역 3택 (활성 '연구동')
- 유도등 종류 6 옵션 3-col grid (천장피난구 / 벽부피난구 / 거실통로 / 복도통로 / 계단통로 / 객석통로) — '벽부피난구' 활성
- 라벨 input (placeholder '예: 피난구 B5-01')
- 푸터

VP6 (모바일 다크) — **confirm 모달 3종 한 viewport 안에 세로로 나열**:
- (a) 미배치 ❓ 마커 클릭 안내 — 제목 'Info' icon + '미배치 개소' / 본문 '<strong>5번계단 뒤</strong> 에 소화기가 배치되지 않았습니다. 자산 배치 페이지로 이동하시겠습니까?' / 푸터 (취소 / 자산 배치)
- (b) 배치 확인 (placingMode) — 제목 'Flame' icon + '소화기 배치' / 본문 '<strong>5번계단 뒤</strong> 에 소화기를 배치하시겠습니까?' / 푸터 (취소 / 배치)
- (c) 소화기 분리 confirm — 제목 'AlertTriangle' icon + '소화기 분리 확인' / 본문 '<strong>5번계단 뒤</strong> 에서 소화기를 분리하면 이 개소는 미배치 상태가 됩니다.' / 푸터 (취소[ghost] / 분리[is-danger])

VP7 (모바일 다크) — **InspectionRevisitPopup 2 variant 한 viewport 안 세로 나열**:
- (a) 'completed' variant: 안 CheckCircle2 (safe-bg + safe-bar) + 제목 '오늘 이미 점검됨' + 메타 '2026-05-16 09:23 · 윤종엽' + body '이 개소는 오늘 이미 점검 완료된 상태입니다. 다시 점검 하시려면 확인 을 눌러주세요.' + 푸터 (취소 / 확인)
- (b) 'pending-action' variant: 안 Flame (fire-bg + fire-bar) + 제목 '조치 대기 상태' + 메타 '2026-05-16 09:23 · 윤종엽' + body '이 개소는 조치가 필요한 상태입니다. 조치 페이지로 이동하시겠습니까?' + 푸터 (취소[ghost] / 조치 페이지로[is-fire])

VP8 (모바일 다크) — **AccessBlockedPopup mirror**:
- 카드 가운데 정렬 290px height
- 60x60 danger icon box + ShieldAlert (Lucide name='shield-alert') 또는 ban
- 제목 '접근 불가 개소' (text-title)
- body '이 개소는 접근이 제한되어 있어 점검을 진행할 수 없습니다.' (text-body color secondary, center)
- CTA 단색 fp-modal-submit (full width, '확인')

VP9 (모바일 라이트) — VP1 의 라이트 분기 (점검 기록 입력 + paired BC).

VP10 (데스크톱 다크) — VP1 의 데스크톱 분기. 데스크톱 viewport-desktop 1280x720 안에 모달이 가운데 띄워진 모습. 뒤 배경은 surface-overlay.

(VP 개수가 많으면 가로로 펼쳐서 페이지 외곽 스크롤이 길어진다 — 그게 의도된 분할 검수 효과. meta-label 로 각 VP 제목 명시.)

**(3) 디자인 룰 강제 자체 검수** (Task 1 검수와 동일 항목):
- 12px 미만 폰트 0건
- 옛 토큰 alias 0건
- gradient 0건
- 결과 배지 페어 정합
- 상태 배지 페어 정합
- CTA 단색
- leading-none 명시 (작은 컨테이너)

**(4) Verbatim 인용**: Task 1 의 인프라 블록 (토큰/typography/class 매핑/viewport/meta) 은 1:1 동일 copy. 06 모달 전용 fp- prefix CSS 만 신규.

**(5) lucide 초기화** 페이지 마지막.
사용 아이콘: x (모달 닫기), check-circle-2 (정상 활성), alert-triangle (주의/혹은 분리 confirm), x-circle (불량), wrench (CTA-fire), flame (pending-action / placing 확인), info (미배치 안내), camera (photo button), trash-2 (분리/삭제), edit-3 / pencil (수정), shield-alert (AccessBlockedPopup), zoom-out / map-pin (메타).
  </action>
  <verify>
<automated>
test -f cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html \
  && head -8 cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html | grep -q "Floor Plan" \
  && grep -q 'data-theme="dark"' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html \
  && grep -q 'data-theme="light"' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html \
  && grep -q 'lucide.createIcons' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html \
  && grep -q 'fp-modal-card' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html \
  && grep -q 'fp-result-btn' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html \
  && grep -q 'fp-kv-grid' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html \
  && grep -q 'fp-marker-options-3col' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html \
  && grep -q 'fp-revisit-card' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html \
  && grep -q 'fp-access-card' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html \
  && (grep -E 'font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html | grep -v '^[[:space:]]*\*' | grep -v '^[[:space:]]*//') ; \
  test "$?" != "0" \
  && (grep -i 'linear-gradient' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html | grep -v '^[[:space:]]*\*' | grep -v '^[[:space:]]*//') ; \
  test "$?" != "0" \
  && (grep -E 'var\(--(bg2|bg3|bg4|t1|t2|t3|acl|bd2)' cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html) ; \
  test "$?" != "0" \
  && echo "PASS — floorplan-modals-sketch.html"
</automated>

수동 검수 (사용자 확인):
- VP1~VP10 모두 시각화 확인.
- 점검 기록 입력 모달 (VP1) paired BC 분기 시각 확인 — divider + 비상콘센트 별도 결과 3택 + 별도 textarea+photo 모두 들어가 있어야 함.
- 자산 KV 8 row (VP3) 2 col 그리드 정합.
- confirm 모달 3종 (VP6) 색 페어 정합: 미배치=info, 배치=fire/accent, 분리=danger.
- 재진입 팝업 (VP7) 2 variant 색 페어: completed=safe, pending-action=fire.
- 접근불가 (VP8) 290px height 정합.
- 라이트 분기 (VP9) 동일 색 페어 라이트 토큰 자동 분기.
  </verify>
  <done>
- floorplan-modals-sketch.html 파일이 존재한다.
- 모달 5종 (마커 추가 [extinguisher/guidelamp 2 variant] / 점검 기록 입력 [소화전+paired BC / 유도등+증상 피커 / 소화기+자산 KV 3 variant] / confirm 3종 / 재진입 2 variant / 접근불가) 모두 시각화.
- 라이트 분기 + 데스크톱 분기 1 viewport 씩 포함.
- 모든 그래프 패스 (12px 미만 0건, gradient 0건, 옛 alias 0건).
- 디자인 룰 룰 강제 자체 검수 5중 통과 (negative rule / 결과 페어 / 상태 페어 / CTA 단색 / leading-none).
- Task 1 인프라 블록 (토큰/typography/class 매핑/viewport-frame/meta) 1:1 verbatim copy.
  </done>
</task>

</tasks>

<verification>
**전체 페이즈 검증**:

1. **두 파일 존재**:
```bash
test -f cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html
test -f cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html
```

2. **인프라 1:1 mirror**:
두 파일 모두에서 다음 패턴이 정확히 등장:
```bash
grep -c 'data-theme="dark"' .../floorplan-sketch.html       # >= 1
grep -c 'data-theme="light"' .../floorplan-sketch.html      # >= 1
grep -c 'viewport-mobile' .../floorplan-sketch.html         # >= 1
grep -c 'viewport-desktop' .../floorplan-sketch.html        # >= 1
grep -c 'lucide.createIcons' .../floorplan-sketch.html      # >= 1
# same for floorplan-modals-sketch.html
```

3. **디자인 룰 강제** (메모 feedback_redesign_sketch_rule_enforcement 4중 강화):

(a) **§6.2 negative rule** — 위험 임계치 아닌 카드는 status 색 금지:
   - 마커 자체는 §6.2 예외 (상태 표현 매체). 단, **마커 외 카드/탭/칩** 에 status 색이 잘못 들어가 있으면 위반. 헤더/탭/층 칩/모달 푸터 등은 모두 surface-sunken + accent (활성) 만 사용.

(b) **§6.3 / §7.1 일관성**:
   - 도면 타입 탭 4종 라벨 색 통일 (비활성=text-tertiary, 활성=text-on-accent on accent bg).
   - 카탈로그 viewport 의 4 블록 제목도 일관 (text-primary 14/700).

(c) **노안 마지노 12px**:
```bash
# 12px 미만 (9/10/11 px) 사용 0 — 단 주석 // 또는 /* 시작은 제외
grep -E 'font-size:\s*(9|10|11)px' floorplan-sketch.html floorplan-modals-sketch.html | grep -v '^\s*\*' | grep -v '^\s*//'
# 결과 0 줄
```

(d) **Verbatim CSS quoting** (메모 feedback_planner_prompt_sketch_verbatim):
- 토큰 인라인 / typography 인라인 / class 매핑 / viewport-frame 정의가 04 remediation-sketch.html 의 정의와 정확히 일치.
- MarkerIcon SVG 좌표가 FloorPlanPage.tsx L131-248 verbatim.

4. **사용자 시각 검수** (수동):
- 브라우저에서 두 파일 열어서 dark/light 토글 확인.
- VP1~VP4 (sketch) + VP1~VP10 (modals) 모두 시각화 확인.
- 마커 카탈로그 19 markers × 6 status = 114 셀 + REPLACE_WARNING 3 stage 모두 채워졌는지.
- 모달 5종 + 팝업 2 variant + 접근불가 모두 04+05 paired-precedent 색 페어 일치.
</verification>

<success_criteria>
- 두 sketch HTML 파일 생성, 인프라 04 remediation-sketch / 03 qr-scan-sketch 1:1 mirror.
- 메인 화면 viewport 4종 (모바일 다크/라이트 메인, 모바일 다크 바텀시트 선택, 데스크톱 다크 메인) + 마커 카탈로그 viewport (19×6 + REPLACE_WARNING 3) 모두 시각화.
- 모달 5종 + 팝업 2종 모두 시각화 (모바일 다크 중심 + 라이트 분기 + 데스크톱 분기 각 1 씩).
- 디자인 룰 강제 검수 5중 통과 (12px 미만 0건 / gradient 0건 / 옛 alias 0건 / 결과·상태 배지 페어 정합 / leading-none 작은 컨테이너).
- 사용자 시각 검수 통과 후 git commit (브랜치 redesign/06-floorplan).
</success_criteria>

<output>
완료 후 `.planning/quick/260516-sxb-redesign-06-floorplan-sketch-v0-1-1-html/260516-sxb-SUMMARY.md` 작성:
- 두 파일 경로 + 라인 수
- 옵션 B (2 파일 분할) 선택 사유
- 04+05 paired-precedent mirror 디자인 결정 confirmed
- 디자인 룰 강제 검수 결과 (5중 통과 여부)
- 다음 단계: 사용자 시각 검수 → 컨펌 후 redesign/06-floorplan 브랜치 변환 wave 진행 (Task 1 wave = 메인+카탈로그 TSX, Task 2 wave = 모달+팝업 TSX, 또는 페이지 크기상 3~4 wave 로 분할).
- 메모 업데이트 후보:
  - `project_redesign_06_floorplan_status.md` 신규 작성 (sketch 단계 완료)
</output>

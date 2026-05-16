---
phase: 260516-rhl
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html
autonomous: true
requirements:
  - REDESIGN-05-DETAIL-SKETCH
must_haves:
  truths:
    - "사용자가 단일 HTML 파일을 브라우저에서 열면 모바일/데스크톱 × 다크/라이트 6 viewport 가 한 페이지에 시연됨"
    - "각 viewport 는 RemediationDetailPage.tsx 의 5개 영역(자체 헤더 / 점검 정보 KV / 점검 기록 + before 사진 / 조치 영역 / 고정 하단 CTA)을 모두 노출"
    - "조치 영역은 status='open' 일 때 = 조치 피커 + 직접 입력 textarea + 자재 입력 + 사진 버튼, status='resolved' 일 때 = 조치 완료 정보 KV + after 사진"
    - "카드/배지/버튼 색은 모두 var(--status-*-bar/bg) / var(--accent) / var(--text-*) 토큰만 사용 — 인라인 rgba 0건"
    - "보고서 다운로드 버튼은 단색 var(--accent) (그라디언트 0건)"
    - "결과 배지는 불량=danger / 주의=warning, 상태 배지는 미조치=fire / 완료=safe (04-remediation feb8da9 sketch 와 1:1 동일 페어)"
    - "admin 전용 액션(조치 취소 / 점검 기록 삭제) 영역이 한 viewport 에 시연됨 (resolved 상세에서)"
    - "viewport 인프라(Tailwind CDN + Pretendard + lucide CDN + tokens.css/typography.css 인라인 + [data-theme] 컨테이너 + viewport-mobile 393×852 / viewport-desktop 1280×720)는 04-remediation/sketch/remediation-sketch.html 1:1 mirror"
    - "lucide-react 아이콘만 사용 (이모지 0건). 작은 컨테이너(배지 12px·헤더 토글) 안 caption 텍스트는 leading-none 명시"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html"
      provides: "단일 HTML 시안 — RemediationDetailPage v0.1.1 시각 디자인 모바일/데스크톱 × 다크/라이트 시연"
      min_lines: 800
  key_links:
    - from: "remediation-detail-sketch.html"
      to: "tokens.css / typography.css 인라인 정의"
      via: "[data-theme=dark|light] 컨테이너 안 var(--surface-*/--text-*/--status-*/--accent)"
      pattern: "data-theme=\"(dark|light)\""
    - from: "remediation-detail-sketch.html"
      to: "04-remediation/sketch/remediation-sketch.html (feb8da9)"
      via: "1:1 mirror — 결과/상태 배지 페어, 카드 색바 룰, 보고서 다운로드 단색, KV 테이블 / 사진 카드 패턴"
      pattern: "rem-badge\\.(danger|warning|fire|safe)|rem-download-btn|rem-kv-table|rem-photo-card"
    - from: "remediation-detail-sketch.html"
      to: "RemediationDetailPage.tsx (594줄, 변경 0건)"
      via: "5개 영역 1:1 매핑(자체헤더/KV정보/점검기록/조치영역/고정CTA) + status 분기(open/resolved) + admin 분기"
      pattern: "조치 상세|조치 완료|조치 내용 입력|소모 자재|조치 사진"
---

<objective>
RemediationDetailPage (조치 상세) v0.1.1 재디자인 시안 HTML 1개를 만든다. 단일 파일에서 모바일/데스크톱 × 다크/라이트 5 영역(자체 헤더 / 점검 정보 KV / 점검 기록 / 조치 영역 [open=피커+자재+사진 / resolved=완료 KV+사진] / 고정 하단 CTA + admin 액션) 6 viewport 시연.

Purpose: 직전 페어 sketch (04-remediation, feb8da9) 와 100% 디자인 일관 유지하면서 RemediationDetailPage.tsx (594줄) 의 모든 화면 분기를 시각 디자인 v0.1.1 으로 표현. 다음 quick task (TSX 변환) 의 1:1 매핑 source.

Output: cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html (~900-1100줄, lucide CDN + Tailwind CDN + tokens 인라인 + 6 viewport)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md

# Source artifacts (RemediationDetailPage 도메인)
@cha-bio-safety/docs/redesign-context/05-remediation-detail/05-remediation-detail.md
@cha-bio-safety/docs/redesign-context/05-remediation-detail/design-system.md
@cha-bio-safety/docs/redesign-context/05-remediation-detail/RemediationDetailPage.tsx
@cha-bio-safety/docs/redesign-context/05-remediation-detail/tokens.css
@cha-bio-safety/docs/redesign-context/05-remediation-detail/typography.css
@cha-bio-safety/docs/redesign-context/05-remediation-detail/ui-index.tsx
@cha-bio-safety/docs/redesign-context/05-remediation-detail/PhotoButton.tsx

# Paired sketch — 1:1 디자인 결정 mirror source (necessary for visual consistency)
@cha-bio-safety/docs/redesign-context/04-remediation/sketch/remediation-sketch.html

# 직전 TSX 변환 결과 (페어 페이지 디자인 매핑 참고)
@cha-bio-safety/src/pages/RemediationPage.tsx

# 인프라 mirror source (Tailwind CDN + Pretendard + lucide + tokens/typography 인라인 패턴)
@cha-bio-safety/docs/redesign-context/03-qr-scan/sketch/qr-scan-sketch.html

<interfaces>
<!-- 04-remediation/sketch/remediation-sketch.html 에서 verbatim 인용해야 하는 인프라 + 디자인 토큰 매핑.
     paraphrase 금지. 토큰명/사이즈/RGB 값 그대로 복사. -->

# 헤드 (line 1~17) — verbatim
- Tailwind CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Pretendard: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />`
- JetBrains Mono: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" />`
- Lucide UMD: `<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>`
- Footer: `<script>lucide.createIcons();</script>`

# tokens.css 인라인 (line 24~155) — verbatim 복사
- [data-theme="dark"] : --surface-page #0a0d12, --surface-raised #1a1f27, --surface-sunken #232a33,
  --surface-active #2c333d, --text-primary #e6edf3, --text-secondary #adb6c0, --text-tertiary #8b949e,
  --text-disabled #5d646e, --text-on-accent #ffffff, --text-link #58a6ff,
  --border-default rgba(255,255,255,0.14), --border-strong rgba(255,255,255,0.22), --border-subtle rgba(255,255,255,0.08),
  --border-focus #3b82f6, --accent #3b82f6, --accent-hover #60a5fa, --accent-active #2563eb,
  --status-safe #4ade80, --status-warning #fbbf24, --status-danger #f87171, --status-info #38bdf8, --status-fire #fb923c,
  --status-safe-bar #22c55e, --status-warning-bar #f59e0b, --status-danger-bar #ef4444, --status-info-bar #0ea5e9, --status-fire-bar #f97316,
  --status-safe-bg rgba(34,197,94,0.16), --status-warning-bg rgba(245,158,11,0.16),
  --status-danger-bg rgba(239,68,68,0.16), --status-info-bg rgba(14,165,233,0.16), --status-fire-bg rgba(249,115,22,0.16)
- [data-theme="light"] : --surface-page #ffffff, --surface-raised #f6f8fa, --surface-sunken #ebeef1,
  --surface-active #d8dee4, --text-primary #1f2328, --text-secondary #4d5562, --text-tertiary #656d76,
  --text-disabled #afb8c1, --border-default rgba(0,0,0,0.14), --border-strong rgba(0,0,0,0.22), --border-subtle rgba(0,0,0,0.08),
  --border-focus #1f6feb, --accent #1f6feb, --accent-hover #218bff, --accent-active #0a52c4,
  --status-safe #166534, --status-warning #854d0e, --status-danger #991b1b, --status-info #075985, --status-fire #9a3412,
  --status-safe-bar #15803d, --status-warning-bar #b45309, --status-danger-bar #b91c1c, --status-info-bar #0369a1, --status-fire-bar #c2410c,
  --status-safe-bg #dcfce7, --status-warning-bg #fef3c7, --status-danger-bg #fee2e2, --status-info-bg #e0f2fe, --status-fire-bg #ffedd5
- :root spacing : --space-1..8 (4..48), --card-padding 14px(mobile)/10px(desktop), --card-padding-sm 10/8,
  --card-gap 8/6, --modal-padding 20/24, --section-gap 24/32, --page-padding 16/24,
  --input-height 44/40, --button-height 44/40
- :root radius : --radius-sm 8px, --radius-md 12px, --radius-lg 16px, --radius-xl 20px, --radius-pill 99px
- :root font : --font-sans 'Pretendard Variable', --font-mono 'JetBrains Mono'
- @media (min-width: 768px) :root override (10/8/6/24/32/24/40/40)

# typography.css 인라인 (line 160~167) — verbatim
- .text-caption  { font-size: 12px; line-height: 1.5; font-weight: 400; }
- .text-label    { font-size: 13px; line-height: 1.5; font-weight: 400; }
- .text-body-sm  { font-size: 14px; line-height: 1.6; font-weight: 400; }
- .text-body     { font-size: 16px; line-height: 1.7; font-weight: 400; }
- .text-title    { font-size: 18px; line-height: 1.4; font-weight: 500; }
- .text-heading  { font-size: 22px; line-height: 1.3; font-weight: 600; letter-spacing: -0.01em; }
- .text-display  { font-size: 28px; line-height: 1.0; font-weight: 500; letter-spacing: -0.02em; }
- .text-mono     { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

# 04 sketch 의 토큰 → CSS class 매핑 (line 172~215) — verbatim 복사
- .bg-page/.bg-raised/.bg-sunken/.bg-active/.bg-overlay
- .text-t1/.text-t2/.text-t3/.text-on-accent/.text-acl/.text-link
- .text-safe/.text-warn/.text-danger/.text-info/.text-fire (모두 *-bar 매핑)
- .bg-safe/.bg-warn/.bg-danger/.bg-info/.bg-fire (모두 *-bar 매핑)
- .bg-safe-soft/.bg-warn-soft/.bg-danger-soft/.bg-info-soft/.bg-fire-soft (모두 *-bg 매핑)
- .bg-acl / .bg-acl-soft (rgba(59,130,246,0.12))
- .bd / .bd-subtle / .bd-strong / .bd-b / .bd-b-subtle / .bd-t / .bd-r / .bd-l

# 시안 메타/viewport 프레임 (line 220~263) — verbatim
- body { font-family: var(--font-sans); background: #1a1d22; color: #e6edf3; -webkit-font-smoothing: antialiased; }
- .meta-label { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: #8b949e; padding: 6px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; display: inline-block; }
- .viewport-frame { border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); overflow: hidden;
  background: var(--surface-page); color: var(--text-primary); font-family: var(--font-sans); position: relative; }
- .viewport-mobile  { width: 393px; height: 852px; }
- .viewport-desktop { width: 1280px; height: 720px; }
- .viewport-frame * { font-family: inherit; }
- .page-shell    { display: flex; flex-direction: column; height: 100%; background: var(--surface-page); color: var(--text-primary); }
- .desktop-shell { display: flex; height: 100%; background: var(--surface-page); color: var(--text-primary); }
- .no-scrollbar
- .page-section-title { font-size: 28px; font-weight: 700; line-height: 1.15; color: #e6edf3; }
- .page-section-sub   { font-size: 16px; margin-top: 8px; color: #8b949e; }
- .cat-box-{safe|info|warn|danger|mute} 헤더 카탈로그 박스
- .icon-xs(12)/sm(14)/md(16)/lg(20)/xl(24)/2xl(28)/3xl(36)/5xl(40)
- .anim-blink + @keyframes blink

# RemediationDetailPage.tsx 5개 영역 (line 268~592) — TSX → 시안 매핑
1. 자체 헤더 (line 270~302): height 48 / background rgba(22,27,34,0.97) → var(--surface-raised) / border-bottom var(--bd) → var(--border-default)
   - 좌측 36×36 ChevronLeft 버튼 (절대 위치 left:12) + 가운데 "조치 상세" text 16px/700 var(--text-primary)
2. 점검 정보 섹션 (line 327~355): padding 20px 16px / border-bottom var(--border-default)
   - SectionHeader "점검 정보" — 12px/700/var(--text-tertiary)/marginBottom 10
   - KVRow: label 12px/var(--text-tertiary)/width 64px + value 14px/var(--text-primary) (gap 12, alignItems flex-start)
   - 5개 KV: 카테고리 / 위치 / 점검일 / 점검자 / 판정결과 (마지막은 결과 배지)
3. 점검 기록 섹션 (line 358~370): padding 20px 16px / border-bottom var(--border-default)
   - SectionHeader "점검 기록" + memo p 14px (없을 때 "메모 없음" var(--text-tertiary))
   - photoKey 있을 때 img: width 100% maxHeight 240 borderRadius 10 border var(--border-default)
4. 조치 완료 섹션 (line 373~394, resolved only): padding 20px 16px / border-bottom var(--border-default)
   - SectionHeader "조치 완료"
   - 4 KV: 조치일시 / 조치자 / 조치 메모 / 소모 자재
   - resolutionPhotoKey 있을 때 img (위와 동일)
5. Admin 액션 (line 397~416): padding 14px 16px / border-bottom / display flex gap 8 flexWrap
   - "조치 취소" — 1px solid var(--status-warning-bar) + transparent + var(--status-warning-bar) text 12px/700
   - "점검 기록 삭제" — 1px solid var(--status-danger-bar) + transparent + var(--status-danger-bar) text 12px/700
6. 조치 내용 입력 섹션 (line 419~554, open only): padding 20px 16px
   - SectionHeader "조치 내용 입력"
   - 카테고리별 조치 피커 5종 (3개 또는 4개 옵션, flex 1 각각, gap 5, marginBottom 10):
     선택: border 2px var(--accent) + bg rgba(59,130,246,.12) + text var(--accent)
     비선택: border 1px var(--border-default) + bg var(--surface-raised) + text var(--text-secondary)
     padding 10px 4px / borderRadius 10 / fontSize 12 (소화전·방화셔터 11) fontWeight 700
   - textarea: 96px min / bg var(--surface-sunken) / border 1px var(--border-strong) / radius 10 / fontSize 14 / padding 12
   - 소모 자재 + 사진 row: marginTop 12 / 자재명 input + 수량 number(ea suffix) + PhotoButton 72×72
7. 고정 하단 CTA (line 560~591, open only): position fixed bottom 0 / padding 12 16
   - 버튼 width 100% height 48 / bg var(--accent) → 04 룰 일관 단색 (그라디언트 금지)
   - color #fff / fontSize 14 / fontWeight 700 / borderRadius 12

# RemediationPage.tsx (직전 TSX 변환) 카드/배지 매핑 참고
- Tailwind utility 패턴: `bg-[var(--surface-raised)]`, `text-[var(--text-primary)]`, `border-[var(--border-default)]`
- 결과 배지: `bg-[var(--status-danger-bg)] text-[var(--status-danger)]` (불량) / `bg-[var(--status-warning-bg)] text-[var(--status-warning)]` (주의)
- 상태 배지: `bg-[var(--status-fire-bg)] text-[var(--status-fire)]` (미조치) / `bg-[var(--status-safe-bg)] text-[var(--status-safe)]` (완료)

</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Detail 시안 HTML 작성 (인프라 + 페이지 전용 CSS + 6 viewport)</name>
  <files>cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html</files>
  <action>
[1] 디렉토리 생성:
  mkdir -p cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch

[2] 단일 HTML 파일 작성. 04-remediation/sketch/remediation-sketch.html 의 line 1~622 (head + style 블록) 을 verbatim 복사 후, body 안의 viewport section만 새로 작성. <interfaces> 블록의 verbatim 복사 항목은 paraphrase 금지 — 그대로 인용.

[3] head + style 블록 (04 sketch line 1~622 verbatim 복사):
  - <head>: charset utf-8 / viewport / title "조치 상세 재디자인 시안 v0.1.1 — RemediationDetail (260516-rhl)"
  - Tailwind CDN + Pretendard + JetBrains Mono + Lucide UMD CDN
  - <style>:
    a) [data-theme="dark"] / [data-theme="light"] 토큰 (line 24~116 verbatim)
    b) :root spacing/radius/font + @media (min-width:768px) 데스크톱 분기 (line 118~155 verbatim)
    c) typography.css 7단계 + .text-mono (line 160~167 verbatim)
    d) 토큰 → CSS class 매핑 (line 172~215 verbatim — bg-*/text-*/bd-*)
    e) 시안 메타/viewport 프레임 + meta-label / page-section-title / cat-box-* / icon-xs..5xl / anim-blink (line 220~292 verbatim)

[4] 05-remediation-detail 페이지 전용 CSS (style 블록 끝, 04 sketch 의 .rem-* 패턴과 정합되도록 .det-* prefix):
  /* 자체 헤더 (TSX line 270~302) */
  .det-page-hd {
    height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    position: relative; padding: 0 12px;
    background: var(--surface-raised); border-bottom: 1px solid var(--border-default);
  }
  .det-back-btn {
    position: absolute; left: 12px; width: 36px; height: 36px; border: none; background: none;
    cursor: pointer; color: var(--text-primary);
    display: flex; align-items: center; justify-content: center;
  }
  .det-page-hd-title { font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }

  /* 본문 컨테이너 (TSX line 320~325) */
  .det-body { flex: 1; overflow-y: auto; }
  .det-body.has-cta { padding-bottom: 72px; }
  .det-body::-webkit-scrollbar { display: none; }
  .det-body { scrollbar-width: none; }

  /* 섹션 (TSX line 327, 358, 374, 420 공통 패턴) */
  .det-section { padding: 20px 16px; border-bottom: 1px solid var(--border-default); }
  .det-section-hd {
    font-size: 12px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 10px; line-height: 1;
  }

  /* KV row (TSX line 14~21 verbatim 매핑) */
  .det-kv-list { display: flex; flex-direction: column; gap: 8px; }
  .det-kv-row { display: flex; gap: 12px; align-items: flex-start; }
  .det-kv-label {
    font-size: 12px; color: var(--text-tertiary); width: 64px; flex-shrink: 0; line-height: 1.5;
  }
  .det-kv-value {
    font-size: 14px; color: var(--text-primary); flex: 1; line-height: 1.5;
  }

  /* 결과/상태 배지 (04 sketch .rem-badge 룰 동일 — leading-none 명시) */
  .det-badge {
    font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 5px;
    line-height: 1; white-space: nowrap; flex-shrink: 0;
    display: inline-flex; align-items: center;
  }
  .det-badge.danger  { background: var(--status-danger-bg);  color: var(--status-danger); }   /* 불량 */
  .det-badge.warning { background: var(--status-warning-bg); color: var(--status-warning); }  /* 주의 */
  .det-badge.fire    { background: var(--status-fire-bg);    color: var(--status-fire); }     /* 미조치 */
  .det-badge.safe    { background: var(--status-safe-bg);    color: var(--status-safe); }     /* 완료 */

  /* 점검 메모 본문 (TSX line 360~362) */
  .det-memo {
    font-size: 14px; line-height: 1.5; color: var(--text-primary); margin: 0; white-space: pre-wrap;
  }
  .det-memo.empty { color: var(--text-tertiary); }

  /* 점검/조치 사진 (TSX line 363~369, 386~392) */
  .det-photo {
    width: 100%; max-height: 240px; object-fit: cover; border-radius: 10px;
    border: 1px solid var(--border-default); display: block; margin-top: 12px;
    background: var(--surface-sunken);
  }
  .det-photo-empty {
    height: 180px; display: flex; align-items: center; justify-content: center;
    color: var(--text-tertiary); font-size: 12px; background: var(--surface-sunken);
    border-radius: 10px; border: 1px solid var(--border-default); margin-top: 12px;
  }

  /* Admin 액션 영역 (TSX line 397~416) */
  .det-admin-row {
    padding: 14px 16px; border-bottom: 1px solid var(--border-default);
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .det-admin-btn {
    padding: 8px 14px; border-radius: 8px; background: transparent;
    font-size: 12px; font-weight: 700; cursor: pointer; line-height: 1;
    font-family: inherit;
  }
  .det-admin-btn.warn   { border: 1px solid var(--status-warning-bar); color: var(--status-warning-bar); }
  .det-admin-btn.danger { border: 1px solid var(--status-danger-bar);  color: var(--status-danger-bar); }

  /* 조치 피커 — 옵션 버튼 (TSX line 425~491 — 5종 동일 패턴) */
  .det-picker { display: flex; gap: 5px; margin-bottom: 10px; }
  .det-picker-opt {
    flex: 1; padding: 10px 4px; border-radius: 10px; cursor: pointer;
    font-size: 12px; font-weight: 700; line-height: 1.2;
    font-family: inherit;
    border: 1px solid var(--border-default);
    background: var(--surface-raised);
    color: var(--text-secondary);
  }
  .det-picker-opt.is-active {
    border: 2px solid var(--accent);
    background: rgba(59,130,246,0.12);
    color: var(--accent);
  }
  /* 4-옵션 피커 (소화전) — 11px (의도된 예외, 좁은 슬롯) */
  .det-picker.tight .det-picker-opt { font-size: 11px; padding: 10px 2px; }

  /* textarea (TSX line 495~513) */
  .det-textarea {
    width: 100%; min-height: 96px;
    background: var(--surface-sunken);
    border: 1px solid var(--border-strong);
    border-radius: 10px;
    font-size: 14px; line-height: 1.5;
    color: var(--text-primary);
    padding: 12px; resize: vertical; box-sizing: border-box;
    font-family: var(--font-sans);
  }
  .det-textarea::placeholder { color: var(--text-tertiary); }

  /* 소모 자재 + 사진 row (TSX line 517~553) */
  .det-mat-row-hd {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 12px; margin-bottom: 4px;
  }
  .det-mat-row-hd-label { font-size: 12px; color: var(--text-tertiary); line-height: 1; }  /* 노안 12px 룰 (옛 11px 상향) */
  .det-mat-row { display: flex; gap: 8px; align-items: flex-start; }
  .det-mat-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; height: 72px; }
  .det-mat-input {
    flex: 1; min-height: 0; min-width: 0; width: 100%;
    background: var(--surface-sunken); border: 1px solid var(--border-strong); border-radius: 8px;
    font-size: 13px; color: var(--text-primary); padding: 0 10px;
    box-sizing: border-box; font-family: inherit;
  }
  .det-mat-input::placeholder { color: var(--text-tertiary); }
  .det-mat-num-wrap { position: relative; flex: 1; min-height: 0; min-width: 0; }
  .det-mat-num {
    width: 100%; height: 100%; min-width: 0;
    background: var(--surface-sunken); border: 1px solid var(--border-strong); border-radius: 8px;
    font-size: 13px; color: var(--text-primary); padding: 0 28px 0 10px;
    box-sizing: border-box; font-family: inherit;
  }
  .det-mat-num-suffix {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    font-size: 12px; color: var(--text-tertiary); pointer-events: none; line-height: 1;
  }
  /* PhotoButton — TSX line 18~20 (72×72 dashed) */
  .det-photo-btn {
    width: 72px; height: 72px; border-radius: 10px;
    background: var(--surface-raised);
    border: 1px dashed var(--border-strong);
    color: var(--text-tertiary);
    font-size: 12px; font-weight: 600;  /* 노안 12px 룰 (옛 11px 상향) */
    cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px; flex-shrink: 0;
    font-family: inherit;
  }
  .det-photo-btn .icon-xl { color: var(--text-secondary); }
  /* PhotoButton — preview 상태 (TSX line 12~16) */
  .det-photo-preview {
    position: relative; display: inline-block; width: 72px; height: 72px; flex-shrink: 0;
  }
  .det-photo-preview img {
    width: 72px; height: 72px; object-fit: cover; border-radius: 10px;
    border: 1px solid var(--border-default); display: block;
    background: var(--surface-sunken);
  }
  .det-photo-preview-remove {
    position: absolute; top: -6px; right: -6px;
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--status-danger-bar); border: none; color: #fff;
    font-size: 12px; font-weight: 700; cursor: pointer; line-height: 1;
    display: flex; align-items: center; justify-content: center;
  }

  /* 고정 하단 CTA (TSX line 560~591) */
  .det-cta {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: var(--surface-page);
    border-top: 1px solid var(--border-default);
    padding: 12px 16px;
  }
  .det-cta-btn {
    width: 100%; height: 48px;
    background: var(--accent); color: var(--text-on-accent);
    font-size: 14px; font-weight: 700;
    border: none; border-radius: 12px; cursor: pointer;
    transition: opacity .15s; line-height: 1;
    font-family: inherit;
  }

  /* 데스크톱 standalone view — modal-like card (1280×720 안 중앙 정렬) */
  .det-desktop-shell {
    display: flex; align-items: center; justify-content: center;
    width: 100%; height: 100%; padding: 24px;
    background: var(--surface-page); box-sizing: border-box;
  }
  .det-desktop-card {
    width: 720px; max-height: 100%;
    display: flex; flex-direction: column;
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: 16px; overflow: hidden;
    position: relative; min-height: 0;
  }
  /* 데스크톱은 헤더만 raised, 본문 page tone 유지 */

[5] body 본문 — 6 viewport 작성 (각 section 사이 16px gap, max-w-[1600px] mx-auto px-6 py-12 space-y-16 wrapper):

  헤더 카탈로그 박스 4개 (04 sketch 와 동일 패턴) — 페이지 결정 4건 시각화:
  ┌─ cat-box-danger : 카드/사진 색바 룰 — 04 sketch 와 동일 페어
  ├─ cat-box-warn   : 결과 배지 (불량 danger / 주의 warning) — 옛 인라인 rgba 폐기
  ├─ cat-box-info   : 보고서 다운로드 버튼 단색 var(--accent) — 그라디언트 금지
  └─ cat-box-mute   : 데스크톱 standalone view + admin 액션 영역 + 노안 11→12px 상향

  VP1: 📱 모바일 · 다크 · 자동화재탐지설비 불량 미조치 (status='open')
    - viewport-mobile data-theme="dark"
    - 자체 헤더: ChevronLeft + "조치 상세"
    - 점검 정보: 카테고리=자동화재탐지설비 / 위치=사무동 B2 / 점검일=2026-05-15 14:32 / 점검자=윤종엽 / 판정결과=<det-badge danger>불량</det-badge>
    - 점검 기록: "감지기 동작불량 - 1차 패턴 미검출. 전원 재공급 필요" + 점검 사진 placeholder (det-photo-empty)
    - admin 영역 — VP6 에서만 표시 (개수 단순화)
    - 조치 내용 입력: (자동화재탐지설비는 피커 카테고리 아님 — textarea만)
      → textarea placeholder "조치 내용을 입력하세요 (필수)"
      → 소모 자재 row: 자재명 input (placeholder=자재명) + 수량 number (placeholder=0, ea suffix) + det-photo-btn (Camera 아이콘 + "촬영")
    - det-cta: "조치 완료" 버튼 var(--accent)

  VP2: 📱 모바일 · 다크 · 유도등 불량 미조치 (status='open', 피커 3-옵션 활성)
    - 점검 정보: 카테고리=유도등 / 위치=연구동 3F EXIT-A12 / 점검일=2026-05-14 11:08 / 점검자=윤종엽 / 판정결과=<det-badge danger>불량</det-badge>
    - 점검 기록: "점등 이상 — LED 1구 불점등" + 점검 사진 placeholder
    - 조치 내용 입력: <det-picker> 3 옵션 (본체 교체 [active] / 예비전원 교체 / 직접 입력)
    - 자재 row: 자재명 input value="복도통로 유도등" + 수량 input value="1" + det-photo-preview (썸네일 placeholder + 우상단 remove × 버튼)
    - det-cta: "조치 완료"

  VP3: 📱 모바일 · 다크 · 방화셔터 불량 완료 (status='resolved', resolved 5섹션)
    - 점검 정보: 카테고리=방화셔터 / 위치=B1 사무동 / 점검일=2026-05-12 10:15 / 점검자=윤종엽 / 판정결과=<det-badge danger>불량</det-badge>
    - 점검 기록: "비상시 작동 미확인 — 컨트롤러 점등 필요" + 점검 사진 placeholder
    - 조치 완료: <det-section-hd>조치 완료</det-section-hd> + 4 KV (조치일시 2026-05-12 16:40 / 조치자 윤종엽 / 조치 메모 "컨트롤러 제어반 전원 차단 후 재기동. 수동 개방/복귀 테스트 정상." / 소모 자재 "방화셔터 스티커 1ea") + 조치 사진 placeholder
    - admin 영역 노출: <det-admin-row> [조치 취소][점검 기록 삭제]
    - has-cta=false (det-cta 없음)

  VP4: 📱 모바일 · 다크 · 소화전 주의 미조치 (status='open', 피커 4-옵션 tight)
    - 점검 정보: 카테고리=옥내소화전 / 위치=2F 연구동 B동 / 점검일=2026-05-13 09:42 / 점검자=김철수 / 판정결과=<det-badge warning>주의</det-badge>
    - 점검 기록: "위치표시등 점등 이상 — 1구 미점등"
    - 조치 내용 입력: <det-picker tight> 4 옵션 (경종 교체 / 위치표시등 교체 [active] / 호스걸이 교체 / 직접 입력) — 11px 의도된 예외
    - 자재 row: 자재명="위치표시등" + 수량="1" + det-photo-btn

  VP5: 🖥️ 데스크톱 · 다크 · 소화기 압력 미달 (status='open', det-desktop-card)
    - viewport-desktop data-theme="dark"
    - .det-desktop-shell > .det-desktop-card (720px wide, 중앙)
    - 본문 좁은 컨테이너 안에서도 same 5섹션 구조
    - 점검 정보: 카테고리=소화기 / 위치=1F 연구동 SE-101 / 점검일=2026-05-13 13:25 / 점검자=이영희 / 판정결과=<det-badge warning>주의</det-badge>
    - 점검 기록: "압력 미달 (2.3 MPa) — 충전 권고" + 점검 사진 placeholder
    - 조치 내용 입력: <det-picker> 3 옵션 (받침 교체 / 소화기 교체 [active] / 직접 입력)
    - 자재 row: 자재명="ABC 분말 소화기" + 수량="1" + det-photo-btn
    - det-cta — desktop card 안 absolute 위치 (card 하단 고정)

  VP6: 🖥️ 데스크톱 · 라이트 · 전실제연댐퍼 완료 + admin (status='resolved', det-desktop-card)
    - viewport-desktop data-theme="light"
    - 본문: 카테고리=전실제연댐퍼 / 위치=RF 옥상 / 점검일=2026-05-10 15:50 / 점검자=윤종엽 / 판정결과=<det-badge warning>주의</det-badge>
    - 점검 기록: "기판 조작 불량 — 자동 개방 지연 8초 (기준 5초)" + 점검 사진 placeholder
    - 조치 완료: 4 KV (조치일시 2026-05-11 10:20 / 조치자 윤종엽 / 조치 메모 "제어 기판 교체 후 자동 개방 4.2초 정상화. 수동 강제개방 테스트 완료." / 소모 자재 "제연댐퍼 작동 기판 1ea") + 조치 사진 placeholder
    - admin 영역: [조치 취소][점검 기록 삭제]
    - has-cta=false

[6] 각 viewport section 마크업 패턴 (04 sketch line 666~816 동일):
  <section data-theme="dark|light" class="space-y-3">
    <div class="meta-label">📱|🖥️ VPN · ... · ...</div>
    <div class="viewport-frame viewport-mobile|viewport-desktop" data-theme="dark|light">
      <div class="page-shell|det-desktop-shell">
        ...
      </div>
    </div>
  </section>

[7] 모든 lucide 아이콘은 <i data-lucide="..." class="icon-..."></i> 형태:
  - 헤더 뒤로가기: data-lucide="chevron-left" icon-lg
  - 점검 사진/조치 사진 빈 상태: data-lucide="image" icon-2xl color var(--text-tertiary)
  - PhotoButton 빈: data-lucide="camera" icon-xl
  - admin 조치 취소: data-lucide="rotate-ccw" icon-sm (button text 옆)
  - admin 삭제: data-lucide="trash-2" icon-sm
  - CTA 버튼 leading: data-lucide="check" icon-md (옵션 — text "조치 완료" 만으로도 가능)

[8] 푸터: <script>lucide.createIcons();</script>

[9] 헤더 카탈로그 박스 (페이지 결정 4건 시각화) — body 최상단:
  <header class="space-y-4">
    <div>
      <div class="page-section-title">조치 상세 재디자인 시안 v0.1.1</div>
      <div class="page-section-sub">
        RemediationDetail Page — 모바일/데스크톱 × 다크/라이트 × 6 viewport (260516-rhl)<br/>
        04-remediation/sketch/remediation-sketch.html (feb8da9) 1:1 mirror. 다음 quick task 에서 TSX 변환 1:1 매핑 source 로 사용.
      </div>
    </div>
    <div class="grid grid-cols-4 gap-3 mt-4">
      <div class="cat-box-danger">
        <div class="cat-title-danger">결과 + 상태 배지 페어</div>
        <div class="cat-label-dark">불량=danger / 주의=warning / 미조치=fire / 완료=safe</div>
        <div class="cat-sub-dark">04 sketch 와 1:1 일관. 옛 RemediationDetailPage line 348~351 인라인 rgba (rgba(239,68,68,.13) / rgba(245,158,11,.13)) 폐기 → <span class="text-mono">--status-{danger,warning}-{bg,fg}</span> 페어 교체.</div>
      </div>
      <div class="cat-box-info">
        <div class="cat-title-info">고정 하단 CTA</div>
        <div class="cat-label-dark">단색 var(--accent) — 그라디언트 금지</div>
        <div class="cat-sub-dark">옛 line 577 var(--acl) 단색은 유지. 04 sketch 보고서 다운로드 결정 동일. 노안 룰 height 48px / fontSize 14 / fontWeight 700.</div>
      </div>
      <div class="cat-box-warn">
        <div class="cat-title-warn">조치 피커 5 카테고리 통합 패턴</div>
        <div class="cat-label-dark">.det-picker (3 옵션) + .det-picker.tight (4 옵션, 11px 예외)</div>
        <div class="cat-sub-dark">5종 useEffect (유도등/소화기/소화전/방화셔터/전실제연댐퍼) 보존. 비즈니스 로직 변경 0건 — 시각만 재정렬. 활성 = 2px var(--accent) + bg rgba(59,130,246,.12).</div>
      </div>
      <div class="cat-box-mute">
        <div class="cat-title-mute">데스크톱 + Admin + 노안 11→12px 상향</div>
        <div class="cat-label-dark">standalone modal-like card 720px / admin 2버튼 outline / 자재 라벨 12px</div>
        <div class="cat-sub-dark">데스크톱 본 페이지 = standalone view (목록 동행 X — RemediationDetailPage 는 라우트 단독). 옛 자재 라벨 11px (line 518/519) → 12px 상향 (메모 feedback_text_caption_leading_none + 노안 12px 마지노선).</div>
      </div>
    </div>
  </header>

[10] 디자인 룰 자체 검수 (작성 직후 grep 검증 — verify 단계와 별개):
  - linear-gradient: 0건 (그라디언트 금지)
  - 인라인 rgba: 0건 (모든 색은 토큰 var() — 단 [data-theme] 안 토큰 정의 자체의 rgba(...,0.16) 등 토큰값과 viewport-frame box-shadow 와 cat-box-* 헤더 박스 (시안 외곽 — 색 결정 시각화용) 는 의도된 예외)
  - 이모지: 0건 (단 viewport meta-label 의 📱 🖥️ 는 시안 외곽 메타 — 의도된 예외)
  - fontSize 9·10·11px: 0건 (단 .det-picker.tight 11px 는 의도된 예외 — 헤더 카탈로그 cat-box-mute 에 명시)
  </action>
  <verify>
    <automated>
test -f cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && wc -l cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html | awk '$1 < 800 { exit 1 }' \
  && [ "$(grep -c 'data-theme=' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html)" -ge 14 ] \
  && [ "$(grep -c 'viewport-mobile' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html)" -ge 5 ] \
  && [ "$(grep -c 'viewport-desktop' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html)" -ge 3 ] \
  && [ "$(grep -c 'data-lucide=' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html)" -ge 10 ] \
  && grep -q 'cdn.tailwindcss.com' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'pretendardvariable' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'unpkg.com/lucide' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'lucide.createIcons' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q '\-\-status-fire-bg' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q '\-\-status-safe-bg' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q '\-\-status-danger-bg' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q '\-\-status-warning-bg' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'det-page-hd' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'det-section' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'det-kv-row' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'det-badge' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'det-picker' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'det-textarea' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'det-mat-row' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'det-cta' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q 'det-admin-row' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q '조치 취소' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q '점검 기록 삭제' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q '조치 완료' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && grep -q '소모 자재' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html \
  && [ "$(grep -c 'linear-gradient' cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html)" -eq 0 ] \
  && echo OK
    </automated>
  </verify>
  <done>
remediation-detail-sketch.html 가 800줄 이상 존재. 6 viewport (모바일 4 + 데스크톱 2) 모두 [data-theme] 분기 적용. status='open' (피커+textarea+자재+사진+CTA) 와 status='resolved' (조치 완료 KV + 사진 + admin 영역) 두 분기 모두 시연. 04-remediation sketch 의 결과/상태 배지 페어 1:1 동일. 보고서 다운로드 단색 var(--accent), linear-gradient 0건. lucide 10건 이상, 이모지 0건 (meta-label 외). RemediationDetailPage.tsx 0건 변경.
  </done>
</task>

</tasks>

<verification>
**자체 검수 체크리스트** (시안 작성 직후 사용자 컨펌 전 self-audit):

색/토큰:
- [ ] 모든 색은 var(--*) 토큰 — 인라인 rgba 0건 (단 토큰 정의 자체와 viewport-frame box-shadow + cat-box-* 시안 외곽 박스 + .bg-acl-soft rgba(59,130,246,0.12) 04 sketch verbatim 인용은 의도된 예외)
- [ ] linear-gradient 0건 (보고서 다운로드 / CTA 모두 단색 accent)
- [ ] 결과 배지: 불량=danger 페어, 주의=warning 페어
- [ ] 상태 배지: 미조치=fire 페어, 완료=safe 페어
- [ ] admin 액션 outline: 조치 취소=warning bar, 삭제=danger bar

폰트:
- [ ] 9·10px 0건
- [ ] 11px = .det-picker.tight 1건 (4-옵션 소화전 — 의도된 예외, 헤더 cat-box-mute 명시)
- [ ] 본문 14px+ (KV value 14, textarea 14, CTA 14)
- [ ] 작은 컨테이너 caption 텍스트는 line-height: 1 (det-badge / det-mat-row-hd-label / det-section-hd / det-mat-num-suffix)

구조:
- [ ] 6 viewport 모두 자체 헤더 (height 48 + ChevronLeft + "조치 상세")
- [ ] 점검 정보 5 KV row (카테고리/위치/점검일/점검자/판정결과)
- [ ] 점검 기록 섹션 (memo + 사진)
- [ ] open 상태 viewport: 조치 피커 (또는 textarea-only) + 자재 input + PhotoButton + det-cta
- [ ] resolved 상태 viewport: 조치 완료 4 KV + after 사진 + admin 영역 (det-admin-row)

인프라:
- [ ] Tailwind CDN + Pretendard + lucide UMD CDN + lucide.createIcons() 푸터
- [ ] [data-theme="dark"] / [data-theme="light"] 분기 (light viewport 1개 이상)
- [ ] viewport-mobile 393×852 / viewport-desktop 1280×720
- [ ] 04-remediation sketch line 1~622 (head + style 인프라 블록) verbatim 복사 확인

비즈니스 로직 보존:
- [ ] RemediationDetailPage.tsx 변경 0건
- [ ] 5 카테고리 조치 피커 (유도등/소화기/소화전/방화셔터/전실제연댐퍼) 옵션 텍스트 그대로 (본체 교체/예비전원 교체/받침 교체/소화기 교체/경종 교체/위치표시등 교체/호스걸이 교체/방화셔터 라인 표시함/연동제어기 기판 교체/기판 교체/모터 교체/직접 입력)

사용자 확인:
- [ ] 시안 HTML 브라우저로 열어 사용자 컨펌 받음 (TSX 변환은 별도 quick task)
</verification>

<success_criteria>
1. cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html 단일 파일 생성 (800줄 이상)
2. 6 viewport (모바일 다크 4 + 데스크톱 다크 1 + 데스크톱 라이트 1) 모두 RemediationDetailPage 5 영역 (헤더/점검정보/점검기록/조치영역/CTA) 시연
3. open 상태 (피커+자재+사진+CTA) + resolved 상태 (조치 완료 KV+사진+admin 영역) 두 분기 모두 노출
4. 04-remediation/sketch (feb8da9) 와 디자인 페어 100% 일관 (배지 색/카드 색바/보고서 단색/노안 룰)
5. linear-gradient 0건 / 인라인 rgba (의도된 예외 외) 0건 / 9·10px 0건 / 이모지 0건 (meta-label 외)
6. RemediationDetailPage.tsx 변경 0건 — 시안만 작성
7. 사용자가 시안 HTML 컨펌 → 다음 quick task (TSX 변환) 의 1:1 매핑 source 로 사용 가능
</success_criteria>

<output>
sketch HTML 작성 완료 후:
1. 사용자에게 파일 경로 안내 (브라우저로 열어 6 viewport 시연 확인 요청)
2. 자체 검수 체크리스트 결과 보고
3. 사용자 컨펌 받으면 git add + commit:
   `git add cha-bio-safety/docs/redesign-context/05-remediation-detail/sketch/remediation-detail-sketch.html`
   `git commit -m "docs(redesign-05-remediation-detail): v0.1.1 sketch — 6 viewport (모바일 4 + 데스크톱 2)"`
4. 다음 quick task 후보: redesign/05-remediation-detail TSX 변환 (RemediationDetailPage.tsx 1:1 매핑)
</output>

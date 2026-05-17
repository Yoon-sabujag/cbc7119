---
phase: quick
plan: 01
type: execute
wave: 1
quick_id: 260517-upw
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html
autonomous: true
requirements:
  - QUICK-260517-upw
must_haves:
  truths:
    - "단일 HTML 파일이 v0.1.1 토큰만 사용 (옛 alias 0건, raw hex 0건)"
    - "6개 이상 viewport 가 각기 다른 카드 변형을 시각적으로 보여줌 (1열/2열/추정 vs 확정/다포트/단일포트/odd-row)"
    - "보존기간 배지가 safe(확정) ↔ info(추정) 두 톤 모두 등장"
    - "교체일자 분기 (기존=tertiary / YYYY-MM-DD=info 강조) 가 시안에 보임"
    - "linear-gradient/shadow/이모지 등 negative rule 위반 0건"
    - "카드 chrome (bg-surface-raised border border-border-default rounded-md) 6개 이상 등장"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html"
      provides: "CctvInfoPage 재디자인 시안 (DVR 13대 카드 그리드 v0.1.1 토큰)"
      min_lines: 400
      contains: "data-viewport"
  key_links:
    - from: "cctv-info-sketch.html :root status 토큰 정의"
      to: "각 카드/배지의 var(--status-*-bg/bar) 및 var(--text-info)/var(--text-info-bg) 사용"
      via: "CSS custom property"
      pattern: "var\\(--status-(safe|info)-(bg|bar)\\)"
    - from: "카드 wrapper"
      to: "포트 표"
      via: "bg-surface-page sub-card (raised 카드 안에 page 톤 sub-card)"
      pattern: "bg-surface-page.*rounded-sm"
---

<objective>
redesign/10-cctv-info 페이지 (`src/pages/CctvInfoPage.tsx`, 69 lines) 의 시각 디자인을 v0.1.1 토큰 단일 source 로 재정의하는 sketch HTML 1개를 작성한다.

Purpose:
- 현재 페이지는 옛 alias (`var(--bg)/--bg2/--bd/--t1/--t2/--t3/--safe`) + raw rgba/hex (`rgba(34,197,94,.1)`, `#a16207`, `#1d4ed8`) + raw fontSize (10/11/12) 를 직접 사용 — v0.1.1 디자인 시스템과 어긋남.
- TSX 변환 wave (별도 quick) 의 verbatim 인용 원천이 될 시안을 먼저 확정.
- 비즈니스 로직(`CCTV_DVRS` 데이터 구조 / `useIsDesktop` / 합계 계산 / 추정여부 분기) 은 0 변경. 시각 디자인만.

Output:
- 단일 파일 `cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html` (>= 400 lines, 6 viewport, chrome stub, 룰 박스 포함)
- 디렉토리 `sketch/` 가 현재 없으므로 생성 포함.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>

# 작업 환경

- repo: `/Users/jykevin/Documents/cbc7119-design` (cbc7119 design-isolated repo, 원본 PWA 와 별개)
- branch: `redesign/10-cctv-info` (이미 분기되어 origin 푸시됨)
- 메모리 강제 룰:
  - `feedback_design_sketch_first` — sketch HTML 시안 먼저, 비즈니스 로직 변경 0
  - `feedback_redesign_sketch_rule_enforcement` — chrome 룰 + v0.1.1 토큰 단일 source + negative rule 자체 점검 필수
  - `feedback_tailwind_token_class_pattern` — status- prefix 없음 (text-fire-bar O / text-status-fire-bar X — 단 HTML sketch 의 :root css 변수명은 `--status-*` 그대로). lucide 는 size={N} prop
  - `feedback_text_caption_leading_none` — 작은 컨테이너 (배지 / 칩 / 푸터 등) text-caption 은 `leading-none` 명시
  - `feedback_inspection_unresolved_color` — 이 페이지엔 미조치 개념 없음. status 토큰 매핑 일관성만 유지 (safe = 확정 / info = 추정).

# 원본 페이지 (재디자인 대상 — 시안의 모든 변형이 커버해야 할 데이터)

```tsx
// cha-bio-safety/src/pages/CctvInfoPage.tsx (현재 69 lines)
import { CCTV_DVRS, CCTV_INFO_UPDATED } from '../utils/cctv'
import { useIsDesktop } from '../hooks/useIsDesktop'

export default function CctvInfoPage() {
  const isDesktop = useIsDesktop()
  return (
    <div style={{ flex:1, overflowY:'auto', background:'var(--bg)', padding:isDesktop?'20px 24px':'12px 14px' }}>
      <div style={{ maxWidth:960, margin:'0 auto', display:'grid',
        gridTemplateColumns:isDesktop?'repeat(2, minmax(0, 1fr))':'1fr',
        gap:isDesktop?12:8 }}>
        {CCTV_DVRS.map(dvr => {
          const totalCap = dvr.ports.reduce((s,p)=>s+(p.cap.endsWith('TB')?parseFloat(p.cap):0),0)
          const isEstimate = dvr.retention.includes('추정')
          // ... card markup (raised + bd + retention 배지 safe/warning + 포트 grid + 합계 푸터)
        })}
      </div>
      <div>출처: CCTV 녹화 설비 현황 {CCTV_INFO_UPDATED}</div>
    </div>
  )
}
```

데이터 (`src/utils/cctv.ts`):
- 총 13대 DVR (DVR-01 ~ DVR-13)
- 채널수: 7 ~ 16ch
- 포트 수: 1 ~ 3 (DVR-12, DVR-13 = 1 포트 / 나머지 = 2 ~ 3 포트)
- 보존기간:
  - 확정: "50일", "39일", "47일", "56일", "63일", "57일", "55일", "45일", "52일", "91일" (10대)
  - 추정: "120일 (추정)" (DVR-13 1대) ← 시안에 반드시 변형 1개로 등장해야 함
- 교체일자: "기존" (대다수) / "2025-12-05" / "2025-08-19" / "2026-04-28" (실측 날짜 → 시안에 강조 톤으로)
- 데스크톱 2열 grid (max-width 960) → 13개 / 2 = 7 행 + 1 (odd-row 케이스 V6 으로 보여줄 것)

# 디자인 시스템 v0.1.1 토큰 (이 sketch 에서 :root 안에 그대로 정의 후 var(--…) 로만 사용)

권위 스펙: `cha-bio-safety/docs/redesign-context/10-cctv-info/design-system.md` §2 토큰 카탈로그.

`:root` 정의 블록 (sketch 의 `<style>` 최상단에 그대로 인용):

```css
:root {
  /* Surface */
  --surface-page:    #0a0d12;
  --surface-raised:  #1a1f27;
  --surface-sunken:  #232a33;

  /* Text */
  --text-primary:    #e6edf3;
  --text-secondary:  #adb6c0;
  --text-tertiary:   #8b949e;

  /* Border */
  --border-default:  rgba(255, 255, 255, 0.14);
  --border-strong:   rgba(255, 255, 255, 0.22);

  /* Accent (참고용, 카드에선 직접 사용 안 함) */
  --accent:          #3b82f6;

  /* Status — safe (확정 보존기간 배지) */
  --status-safe:     #4ade80;
  --status-safe-bar: #22c55e;
  --status-safe-bg:  rgba(34, 197, 94, 0.16);

  /* Status — info (추정 보존기간 배지 + 교체일자 강조) */
  --status-info:     #38bdf8;
  --status-info-bar: #0ea5e9;
  --status-info-bg:  rgba(14, 165, 233, 0.16);

  /* Radius */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-pill: 99px;
}
```

> 이 8 토큰 페어 외 정의 금지. 위에 없는 토큰 (--bg, --bg2, --bd, --t1, --safe, --warn, --c-day 등) 등장 시 verify gate FAIL.
> 위 :root 정의 블록은 verify gate 의 raw-hex grep 에서 제외 (grep -v `^\s*--` 로 컷).

# Chrome / 카드 사양 (planner 가 spec_summary 에서 확정)

## 페이지 chrome (sketch 외곽)
- 페이지 wrapper: `bg-surface-page` + 모바일 padding (`12px 14px`) / 데스크톱 padding (`20px 24px`)
- 카드 그리드: 모바일 1열 (`grid-template-columns: 1fr`, `gap: 8px`) / 데스크톱 2열 (`grid-template-columns: repeat(2, minmax(0, 1fr))`, `gap: 12px`, `max-width: 960px`)
- 하단 출처 라벨: `text-caption text-text-tertiary text-center py-3 leading-none` ("출처: CCTV 녹화 설비 현황 2025-12-05")

## 카드 chrome (DVR 카드 1개)
- wrapper: `bg-surface-raised border border-border-default rounded-md p-3` (모바일+데스크톱 동일)
- 헤더 row: `flex items-baseline gap-2 mb-2`
  - 라벨: `text-label font-bold text-text-primary` ("DVR 1") — 13px / weight 700 / leading-1.5 (기본)
  - 채널수: `text-caption font-semibold text-text-tertiary leading-none` ("16ch") — 12px / weight 600 / leading-none
  - spacer: `flex-1` (빈 div)
  - 보존기간 배지: `inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-caption font-bold border leading-none`
    - 확정: `bg-safe-bg border-safe-bar text-safe` (예: "50일", "47일")
    - 추정: `bg-info-bg border-info-bar text-info` (예: "120일 (추정)")
    - 좌측 아이콘 결정: 두 톤 모두 좌측에 lucide 아이콘 1개 — **planner 결정: 단순화. 아이콘 dot 만 사용 (`<span style="display:inline-block; width:6px; height:6px; border-radius:99px; background: currentColor;">`)**. lucide 별도 임포트 부담 ↓, 카드 작아 시각 노이즈 ↓. 두 톤이 색만 다른 일관 dot.
- 본문 row: `text-caption text-text-secondary mb-2`
  - 라벨 prefix: `text-text-tertiary` ("녹화구역 ")
  - 본문: 그대로 (`text-text-secondary`)
  - 예: "<span 회색>녹화구역 </span>8F, 7F"
- 포트 표: `bg-surface-page border border-border-default rounded-sm px-2.5 py-2`
  - grid: `grid-template-columns: auto 1fr 1fr; gap: 4px 10px` (verbatim 02 misc 패턴)
  - 헤더 셀 3개: `text-caption text-text-tertiary font-semibold` ("포트" / "용량" / "교체일자")
  - 본문 셀:
    - 포트#: `text-caption text-text-primary font-bold` ("#4")
    - 용량: `text-caption text-text-primary` ("2TB")
    - 교체일자 분기:
      - "기존" → `text-caption text-text-tertiary`
      - "YYYY-MM-DD" → `text-caption text-info font-bold` (info 강조)
- 푸터: `text-caption text-text-tertiary text-right mt-1.5 leading-none` ("합계 5TB · 포트 3개")

## Sketch viewport 구성 (반드시 모두 포함, 각 viewport 는 `data-viewport="VN"` marker)

| ID | 제목 | 본문 내용 (mock data) |
|---|---|---|
| V1 | 모바일 1열 — 표준 카드 (확정/다포트) | DVR 1 16ch · 녹화구역 8F,7F · 보존 "50일" (safe) · 포트 #4 2TB 기존, #5 2TB 기존, #6 1TB 기존 · 합계 5TB · 포트 3개 |
| V2 | 데스크톱 2열 max-width 960 — 같은 카드 2개 (둘 다 확정) | DVR 1 (V1과 동일) + DVR 2 16ch · 6F,5F · "50일" safe · 동일 포트 |
| V3 | 추정 보존기간 배지 강조 | DVR 13 7ch · 국제회의실,대강당 · 보존 "120일 (추정)" (info) · 포트 #1 4TB 2026-04-28 · 합계 4TB · 포트 1개 — info 배지 dot + info 교체일자 강조 동시 노출 |
| V4 | 다포트(3포트) + 교체일자 변경 강조 | DVR 7 15ch · B1F,B2F · 보존 "63일" (safe) · 포트 #4 2TB **2025-12-05** (info), #5 2TB 기존, #6 2TB **2025-12-05** (info) · 합계 6TB · 포트 3개 |
| V5 | 단일 포트 변형 (DVR-12 같은 케이스) | DVR 12 8ch · 리서치프라자,서버실 · 보존 "91일" (safe) · 포트 #2 2TB 기존 · 합계 2TB · 포트 1개 — 포트 표가 1행만이라 시각 균형 확인 |
| V6 | 데스크톱 2열 odd-row (마지막 행 1개) | 데스크톱 2열 grid 안에 DVR 13 (추정/단일포트) 1개만 — 빈 슬롯은 시각적으로 비워둠 (왼쪽 1개, 오른쪽 빈 자리). 13개 ÷ 2 = 7행 + 1 마지막 행이 한쪽만. 시각적 어색함 검증. |

→ 6 viewport, marker `data-viewport="V1"` ~ `data-viewport="V6"`.

## 참고 패턴 인용 (sketch HTML 안 README/rule 박스에 적어둘 것)

- 02 `inspection-unification-sketch.html` — 모바일 mock chrome 외곽 (.mock 클래스 + rounded-md border) 패턴 차용. 단 본 sketch 는 모달이 아닌 페이지라 헤더/탭/칩 영역 0, 카드 그리드만 mock 안에 채움.
- 11-div `03-card-normal-sketch.html` — 카드 헤더 row + 메타 row + 본문 row 3 row 구성. `:root` 안에 토큰만 정의하고 카드 내부는 `style="background: var(--surface-raised); border: 1px solid var(--border-default); ..."` 형태로 작성하는 패턴.

## Negative Rules (sketch 안 README 박스에 박제 + verify gate 로 강제)

1. 옛 alias 등장 0건 — `var(--bg)`, `var(--bg2)`, `var(--bg3)`, `var(--bd)`, `var(--bd2)`, `var(--t1)`, `var(--t2)`, `var(--t3)`, `var(--acl)`, `var(--safe)` (단독), `var(--warn)`, `var(--danger)`, `var(--c-day)` 등 등장 시 즉시 FAIL.
2. raw hex (`#xxxxxx`) / raw rgba(...) — `:root` 정의 블록 (8 토큰 페어) 외에는 등장 0건.
3. `linear-gradient(...)` 등장 0건 (단색 강조만, gradient 금지).
4. 이모지 (✓ ✕ ★ 🔧 등) 등장 0건 — 모든 표시는 텍스트 또는 dot (CSS) 로.
5. `box-shadow` / `filter: blur` / `backdrop-filter` 등장 0건 (그림자 사용 안 함, 보더로 위계 표현).
6. 09 / 11 / 02 와 다른 카드 chrome (radius/padding scale) 사용 금지 — radius-md + p-3 + border 1px default 통일.
7. 본문 / 카드 안 폰트 사이즈 9 / 10 / 11px 등장 0건 — 12px (`text-caption`) 가 마지노선.
8. `text-caption` (font-size:12px, line-height:1.5 = 18px) 을 `h-8` / `h-6` 같은 작은 컨테이너 안에 쓸 때 `leading-none` (또는 `line-height:1`) 명시 — feedback_text_caption_leading_none 룰. 보존기간 배지 / 푸터 / 채널수 텍스트 3 곳에 강제.

</context>

<tasks>

<task type="auto">
  <name>Task 1: sketch HTML 작성 (cctv-info-sketch.html, 6 viewport + chrome + rule 박스)</name>
  <files>cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html</files>
  <action>
1. 디렉토리 생성 (없으면): `mkdir -p cha-bio-safety/docs/redesign-context/10-cctv-info/sketch`

2. 파일 작성. 전체 구조:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>10 CCTV 현황 · v0.1.1 재디자인 시안</title>
  <style>
    /* :root 토큰 정의 — 위 context 섹션의 8 토큰 페어 그대로 인용. 추가 정의 금지. */
    :root { ... 8 토큰 페어 ... }

    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 32px;
      background: #0f1218;  /* sketch 페이지 자체 배경 — 본문 frame 과 구분용 */
      color: var(--text-secondary);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
      line-height: 1.55;
    }
    h1 { font-size: 22px; margin: 0 0 4px 0; color: var(--text-primary); }
    h1 + p { margin: 0 0 24px 0; color: var(--text-tertiary); font-size: 13px; }
    h2 { font-size: 14px; margin: 28px 0 8px 0; color: var(--text-primary); padding: 8px 12px; background: rgba(59,130,246,0.10); border-left: 3px solid var(--accent); border-radius: 4px; }
    h2 + .vp-desc { margin: 0 0 12px 0; padding: 0 12px; color: var(--text-tertiary); font-size: 12px; }

    /* 모바일 mock frame */
    .frame-mobile {
      width: 360px;
      background: var(--surface-page);
      border: 1px solid #2a2f3a;
      border-radius: 12px;
      overflow: hidden;
      padding: 12px 14px;
    }
    /* 데스크톱 mock frame */
    .frame-desktop {
      width: 960px;
      max-width: 100%;
      background: var(--surface-page);
      border: 1px solid #2a2f3a;
      border-radius: 12px;
      overflow: hidden;
      padding: 20px 24px;
    }
    /* 카드 그리드 */
    .grid-mobile  { display: grid; grid-template-columns: 1fr; gap: 8px; }
    .grid-desktop { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; max-width: 960px; margin: 0 auto; }

    /* dot (보존기간 배지 좌측) */
    .dot { display: inline-block; width: 6px; height: 6px; border-radius: 99px; background: currentColor; }

    /* rule 박스 */
    .rules {
      margin-top: 40px;
      padding: 16px 20px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border-default);
      border-radius: 8px;
      max-width: 960px;
    }
    .rules h3 { font-size: 14px; margin: 0 0 8px 0; color: var(--text-primary); }
    .rules h3 + .rules-desc { font-size: 12px; color: var(--text-tertiary); margin-bottom: 12px; }
    .rules ul { margin: 0; padding-left: 18px; font-size: 12px; color: var(--text-secondary); }
    .rules ul li { margin-bottom: 4px; }
    .rules code { font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 11px; color: var(--status-info); background: rgba(14,165,233,0.08); padding: 1px 5px; border-radius: 3px; }
    .rules .neg li::marker { color: var(--status-danger, #ef4444); }
    .rules hr { border: 0; border-top: 1px solid var(--border-default); margin: 12px 0; }
  </style>
</head>
<body>

  <h1>10. CCTV 현황 — v0.1.1 재디자인 시안</h1>
  <p>DVR 13대 카드 그리드. 시각 디자인만, 비즈니스 로직 0 변경. 시안 OK 후 TSX 변환 wave (별도 quick) 의 verbatim 인용 원천.</p>

  <!-- ─── V1 모바일 1열 표준 카드 ─── -->
  <h2>V1 · 모바일 1열 · 표준 카드 (확정 보존 / 다포트)</h2>
  <p class="vp-desc">DVR 1 — 16ch · 8F,7F · 보존 50일 (safe dot) · 포트 3개 모두 "기존"</p>
  <div class="frame-mobile" data-viewport="V1">
    <div class="grid-mobile">
      <!-- card 1: DVR 1 -->
      <div style="background: var(--surface-raised); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 12px;">
        <!-- 헤더 row -->
        <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">DVR 1</span>
          <span style="font-size: 12px; font-weight: 600; color: var(--text-tertiary); line-height: 1;">16ch</span>
          <span style="flex: 1;"></span>
          <!-- 보존기간 배지 (safe) -->
          <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 700; line-height: 1; background: var(--status-safe-bg); border: 1px solid var(--status-safe-bar); color: var(--status-safe);">
            <span class="dot"></span>50일
          </span>
        </div>
        <!-- 본문 row (녹화구역) -->
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
          <span style="color: var(--text-tertiary);">녹화구역 </span>8F, 7F
        </div>
        <!-- 포트 표 -->
        <div style="background: var(--surface-page); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 8px 10px; display: grid; grid-template-columns: auto 1fr 1fr; gap: 4px 10px;">
          <div style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">포트</div>
          <div style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">용량</div>
          <div style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">교체일자</div>
          <div style="font-size: 12px; color: var(--text-primary); font-weight: 700;">#4</div>
          <div style="font-size: 12px; color: var(--text-primary);">2TB</div>
          <div style="font-size: 12px; color: var(--text-tertiary);">기존</div>
          <div style="font-size: 12px; color: var(--text-primary); font-weight: 700;">#5</div>
          <div style="font-size: 12px; color: var(--text-primary);">2TB</div>
          <div style="font-size: 12px; color: var(--text-tertiary);">기존</div>
          <div style="font-size: 12px; color: var(--text-primary); font-weight: 700;">#6</div>
          <div style="font-size: 12px; color: var(--text-primary);">1TB</div>
          <div style="font-size: 12px; color: var(--text-tertiary);">기존</div>
        </div>
        <!-- 푸터 -->
        <div style="font-size: 12px; color: var(--text-tertiary); text-align: right; margin-top: 6px; line-height: 1;">
          합계 5TB · 포트 3개
        </div>
      </div>
    </div>
  </div>

  <!-- V2 ─ 데스크톱 2열, 두 카드 모두 확정 (DVR 1 + DVR 2) -->
  <!-- V3 ─ 추정 배지 강조 (DVR 13 mock - info dot + info 교체일자) — 모바일 1열 frame -->
  <!-- V4 ─ 다포트 + 교체일자 변경 강조 (DVR 7 mock — 포트 표 안에 info 강조 2 행) — 모바일 1열 frame -->
  <!-- V5 ─ 단일 포트 변형 (DVR 12 mock) — 모바일 1열 frame -->
  <!-- V6 ─ 데스크톱 2열 odd-row (DVR 13 1개만, 오른쪽 빈자리) — 데스크톱 frame -->

  <!-- 페이지 출처 푸터 (V2 또는 V6 같이 데스크톱 frame 안에 한번 노출) -->
  <!-- <div style="font-size: 12px; color: var(--text-tertiary); text-align: center; padding: 12px 0; line-height: 1;">
    출처: CCTV 녹화 설비 현황 2025-12-05
  </div> -->

  <!-- ─── Rule 박스 (반드시 포함, sketch 의 self-documentation) ─── -->
  <div class="rules">
    <h3>적용 룰 — v0.1.1</h3>
    <p class="rules-desc">이 sketch 는 다음 룰을 강제. TSX 변환 wave 에서도 그대로 인용.</p>
    <ul>
      <li>토큰: 8 페어만 (<code>--surface-page/raised/sunken</code>, <code>--text-primary/secondary/tertiary</code>, <code>--border-default/strong</code>, <code>--status-safe/safe-bar/safe-bg</code>, <code>--status-info/info-bar/info-bg</code>, <code>--radius-sm/md/pill</code>). 다른 토큰 추가 금지.</li>
      <li>카드 chrome: <code>bg-surface-raised border border-border-default rounded-md p-3</code> 통일</li>
      <li>포트 표 sub-card: <code>bg-surface-page border border-border-default rounded-sm</code> (raised 안에 page 톤)</li>
      <li>보존기간 배지: 확정 = safe (safe-bg + safe-bar border + safe text) / 추정 = info (info-bg + info-bar border + info text). 두 톤 모두 좌측 dot 6px.</li>
      <li>교체일자: "기존" = text-tertiary / 날짜(YYYY-MM-DD) = text-info + font-bold</li>
      <li>작은 컨테이너 안 12px 텍스트는 <code>line-height: 1</code> (배지 / 푸터 / 채널수) — feedback_text_caption_leading_none</li>
    </ul>
    <hr/>
    <h3>금지 룰 (verify gate)</h3>
    <ul class="neg">
      <li>옛 alias: <code>var(--bg)</code>, <code>var(--bg2)</code>, <code>var(--bd)</code>, <code>var(--t1)</code>, <code>var(--t2)</code>, <code>var(--t3)</code>, <code>var(--safe)</code>(단독), <code>var(--warn)</code>, <code>var(--danger)</code>, <code>var(--c-day)</code> 등 0건</li>
      <li>raw hex / raw rgba (단 <code>:root</code> 8 토큰 정의 블록 + body chrome <code>#0f1218</code> / frame border <code>#2a2f3a</code> 예외) — 카드 내부 영역엔 0건</li>
      <li><code>linear-gradient(...)</code> 0건</li>
      <li>이모지 (✓ ✕ ★ 🔧 등) 0건</li>
      <li><code>box-shadow</code> / <code>filter: blur</code> / <code>backdrop-filter</code> 0건</li>
      <li>폰트 사이즈 9 / 10 / 11px 카드 내부 0건 (마지노선 12px)</li>
    </ul>
    <hr/>
    <h3>비즈니스 로직 보존</h3>
    <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">
      이 sketch 는 시각 디자인만. <code>CCTV_DVRS</code> 데이터 구조 / <code>useIsDesktop</code> 분기 / 합계 계산 / 추정여부 분기 (<code>retention.includes('추정')</code>) / 교체일자 분기 (<code>p.replaced !== '기존'</code>) 모두 0 변경. TSX 변환 wave 에서 위 4 분기 그대로 사용.
    </p>
  </div>

</body>
</html>
```

3. **6 viewport 모두 실제 마크업 작성 필수** (위 V1 만 풀로 보였고, V2~V6 도 동일 패턴으로 카드 마크업 채워야 함. 빈 주석으로 두면 verify gate FAIL):

- **V2** — 데스크톱 frame (`.frame-desktop`), `.grid-desktop` 안에 DVR 1 + DVR 2 카드 2개. 둘 다 V1 과 동일한 chrome, 데이터만 DVR 2 (16ch / 6F,5F / 50일 / 포트 #4 2TB 기존, #5 2TB 기존, #6 1TB 기존 / 합계 5TB · 포트 3개). 데스크톱 frame 안 하단에 페이지 출처 푸터 노출 ("출처: CCTV 녹화 설비 현황 2025-12-05").

- **V3** — 모바일 frame, DVR 13 카드 1개. 라벨 "DVR 13" / 채널 "7ch" / 보존 배지 = **info 톤** (info-bg + info-bar border + info text + info dot) "120일 (추정)" / 녹화구역 "국제회의실, 대강당" / 포트 표 1행: #1 4TB **2026-04-28** (text-info + font-bold) / 푸터 "합계 4TB · 포트 1개".

- **V4** — 모바일 frame, DVR 7 카드 1개. 라벨 "DVR 7" / 채널 "15ch" / 보존 배지 = safe "63일" / 녹화구역 "B1F, B2F" / 포트 표 3행: #4 2TB **2025-12-05** (info), #5 2TB 기존 (tertiary), #6 2TB **2025-12-05** (info) / 푸터 "합계 6TB · 포트 3개". **교체일자 강조 2개와 비강조 1개가 한 카드 안에 동시 노출** 되어 톤 차이 검증.

- **V5** — 모바일 frame, DVR 12 카드 1개. 라벨 "DVR 12" / 채널 "8ch" / 보존 배지 = safe "91일" / 녹화구역 "리서치프라자, 서버실" / 포트 표 1행: #2 2TB 기존 / 푸터 "합계 2TB · 포트 1개". **단일 포트 카드 시각 균형** (포트 표가 1행만일 때 카드 키 어색하지 않은지) 검증.

- **V6** — 데스크톱 frame, `.grid-desktop` 안에 카드 1개 (DVR 13 V3와 동일 데이터) + **오른쪽 빈 슬롯** (`<div></div>` 빈 div 1개로 grid cell 차지). 13개 ÷ 2 = 7행 + 1 마지막 행이 한쪽만 차는 odd-row 시각 검증. 데스크톱 frame 안 하단에 출처 푸터 X (V2 에서 이미 보였으니 중복 회피).

4. **Rule 박스** — 위 템플릿 그대로 마지막에 포함. <code>...</code> 백틱 인용은 sketch 의 self-documentation 역할.

5. **viewport 라벨 / desc** 는 각 viewport 위에 `<h2>` + `<p class="vp-desc">` 로. 위 V1 예시 패턴 그대로.

6. 작성 후 자체 verify gate 모두 실행 (Task 2 의 grep 패턴들). 1개라도 FAIL 이면 즉시 fix.
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html && wc -l cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html | awk '$1 >= 400 { exit 0 } { exit 1 }'</automated>
  </verify>
  <done>
파일 존재. 라인 수 >= 400. 6 viewport (V1~V6) 모두 실제 카드 마크업 포함 (빈 주석 X). :root 안에 정확히 위 8 토큰 페어 정의. rule 박스 마지막 포함.
  </done>
</task>

<task type="auto">
  <name>Task 2: 자체 verify gate 9개 실행 (negative + positive grep)</name>
  <files>cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html</files>
  <action>
다음 9개 grep gate 를 모두 실행하고, 각각의 expected 결과와 일치해야 한다. 1개라도 FAIL 이면 Task 1 의 sketch 를 수정 후 재실행. 작업 디렉토리: `/Users/jykevin/Documents/cbc7119-design`.

**Positive gates (반드시 N개 이상 등장):**

1. **viewport marker ≥ 6**
   ```
   grep -c 'data-viewport="V[1-6]"' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html
   ```
   → 결과 ≥ 6

2. **safe-bg + safe-bar 페어 등장 ≥ 1 (확정 보존 배지)**
   ```
   grep -c 'var(--status-safe-bg)' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html
   ```
   → 결과 ≥ 1
   ```
   grep -c 'var(--status-safe-bar)' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html
   ```
   → 결과 ≥ 1 (border-color 로 사용)

3. **info-bg + info-bar 페어 등장 ≥ 1 (추정 보존 배지)**
   ```
   grep -c 'var(--status-info-bg)' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html
   ```
   → 결과 ≥ 1

4. **text-info 강조 (교체일자) 등장 ≥ 2** — V3 (1행) + V4 (2행) 합쳐 ≥ 3 인데, 안전하게 ≥ 2 로 가드
   ```
   grep -c 'color: var(--status-info);' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html
   ```
   → 결과 ≥ 2

5. **카드 chrome (raised + border-default + radius-md) 등장 ≥ 6** — V1(1) + V2(2) + V3(1) + V4(1) + V5(1) + V6(1) = 7
   ```
   grep -c 'background: var(--surface-raised);' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html
   ```
   → 결과 ≥ 7

**Negative gates (반드시 0건):**

6. **옛 alias 0건** (단, body chrome 의 `#0f1218` 같은 sketch 외곽 색은 :root 정의 외 raw hex 예외 처리 — 별도 gate 8에서 다룸)
   ```
   grep -E 'var\(--(bg2?|bg3|bg4|bd2?|t1|t2|t3|acl|safe|warn|danger|fire|info|c-day|c-night|c-off|c-leave)\)' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html | grep -v '^\s*\*' | grep -v '^\s*//'
   ```
   주의: `var(--safe)` 와 `var(--status-safe)` 는 다름 — 위 정규식의 `safe)` 는 `--safe)` 만 매칭하므로 `--status-safe)` 와 충돌 X. info / fire 도 동일하게 `var(--info)` 단독 alias 만 매칭.
   → 결과: **empty (0 line)**

7. **linear-gradient 0건**
   ```
   grep -c 'linear-gradient' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html
   ```
   → 결과: **0**

8. **raw hex / rgba 카드 내부 0건** — :root 정의 블록 + body/frame chrome (#0f1218, #2a2f3a, accent rgba) 만 예외. 카드 내부 markup 영역 (V1~V6 카드 body) 에는 raw hex 등장 0건. 검증 방식: `:root { ... }` 블록 + `<style>` 정의 영역 + body 정의 영역을 sed 로 컷한 뒤 남은 markup 영역에 raw hex 가 있는지 grep.
   ```
   sed -n '/^<body>/,/^<\/body>/p' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html | grep -v '^#' | grep -E '#[0-9a-fA-F]{3,6}\b|rgba\(' | grep -cv 'data-viewport'
   ```
   → 결과: **0** (body 안 모든 색 표현은 `var(--…)` 로만)
   주의: V6 의 오른쪽 빈 슬롯 `<div></div>` 같은 마크업엔 raw hex 없음. rule 박스 안 <code>…</code> 인용은 인용이므로 raw hex 안 들어감 (우린 토큰명만 인용).

9. **이모지 0건** (`✓ ✕ ★ ⚠ 🔧 📋` 등) + `box-shadow` / `blur` 0건
   ```
   grep -E '[✓✕★⚠🔧📋]|box-shadow|filter:\s*blur|backdrop-filter' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html
   ```
   → 결과: **empty (0 line)**

모든 9 gate 가 expected 와 일치하면 verify PASS. 1개라도 어긋나면 Task 1 sketch 수정 + Task 2 재실행.

**최종 출력 메시지** (verify PASS 후):
```
verify gate PASS (9/9):
- viewport: <N>
- safe-bg/info-bg: <Nsafe>/<Ninfo>
- text-info 강조: <N>
- 카드 chrome: <N>
- 옛 alias: 0
- linear-gradient: 0
- raw hex (카드 내부): 0
- 이모지/shadow/blur: 0
파일: cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html (<라인수> lines)
```
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design && [ $(grep -c 'data-viewport="V[1-6]"' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html) -ge 6 ] && [ $(grep -c 'var(--status-safe-bg)' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html) -ge 1 ] && [ $(grep -c 'var(--status-info-bg)' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html) -ge 1 ] && [ $(grep -c 'background: var(--surface-raised);' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html) -ge 7 ] && [ $(grep -c 'linear-gradient' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html) -eq 0 ] && [ -z "$(grep -E 'var\(--(bg2?|bg3|bg4|bd2?|t1|t2|t3|acl|safe\)|warn\)|danger\)|fire\)|c-day|c-night|c-off|c-leave)' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html)" ] && [ -z "$(grep -E '[✓✕★⚠🔧]|box-shadow|filter:\s*blur|backdrop-filter' cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html)" ]</automated>
  </verify>
  <done>
9 verify gate 모두 PASS. 최종 메시지에 N 값들 출력. FAIL 시 sketch 수정 + 재실행.
  </done>
</task>

</tasks>

<verification>
plan 전체 완료 조건:
- [ ] `cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html` 파일 존재 (>= 400 lines)
- [ ] 6 viewport (V1~V6) 모두 실제 카드 마크업 포함 (빈 슬롯/주석만 X)
- [ ] :root 안 정확히 8 토큰 페어 정의 (위 context 인용 그대로)
- [ ] V1: 모바일 1열, DVR 1 (3 포트 모두 기존, safe 배지)
- [ ] V2: 데스크톱 2열, DVR 1 + DVR 2 + 페이지 출처 푸터
- [ ] V3: 모바일, DVR 13 (info 배지 + info 교체일자 강조)
- [ ] V4: 모바일, DVR 7 (info 교체일자 2개 + 기존 1개 한 카드 안)
- [ ] V5: 모바일, DVR 12 (단일 포트)
- [ ] V6: 데스크톱 2열, DVR 13 + 빈 슬롯 (odd-row)
- [ ] Rule 박스 (적용 룰 + 금지 룰 + 비즈니스 로직 보존) 마지막에 포함
- [ ] 9 verify gate 모두 PASS
- [ ] 사용자 컨펌 대기 (디자인 변경이므로 commit 전 시안 확인 필수 — memory: feedback_design_changes_ask_first / feedback_deploy_test)
</verification>

<success_criteria>
- sketch HTML 1개 파일 완성, 6 viewport / 9 gate PASS
- 사용자가 브라우저로 열어 6 viewport 시각 검토 가능
- TSX 변환 wave (별도 quick) 의 verbatim 인용 원천 확정
- 시각 디자인만 변경, 비즈니스 로직 0 변경 (TSX 변환 wave 에서 `CCTV_DVRS` / `useIsDesktop` / 합계 / 추정 분기 / 교체일자 분기 4 로직 그대로 사용)
</success_criteria>

<output>
완료 후 `.planning/quick/260517-upw-redesign-10-cctv-info-sketch-v0-1-1-cctv/260517-upw-SUMMARY.md` 작성.

요약 내용:
- 작성 파일: `cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html` (N lines)
- 6 viewport 구성 요약 (V1~V6 1줄씩)
- 9 verify gate 결과 (모두 PASS)
- 다음 단계: 사용자 시각 검토 → 컨펌 후 별도 quick 으로 TSX 변환 wave 진행 (verbatim 인용 원천 = 이 sketch)
- 메모리 룰 강제 결과 (design-sketch-first / redesign-sketch-rule-enforcement / text-caption-leading-none / inspection-unresolved-color 충돌 없음)
</output>

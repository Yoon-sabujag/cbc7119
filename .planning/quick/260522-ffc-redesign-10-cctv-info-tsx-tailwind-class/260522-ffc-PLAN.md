---
phase: 260522-ffc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/CctvInfoPage.tsx
autonomous: true
requirements:
  - REDESIGN-10-CCTV-TSX-TAILWIND
user_setup: []

must_haves:
  truths:
    - "CctvInfoPage 의 마크업 inline style 이 Tailwind class 로 변환되어 있다 (style={...} 0건 또는 불가피 1건)"
    - "변환 후 시각이 변환 전과 픽셀 단위로 동일하다 (V1~V6 sketch 6 viewport 일치)"
    - "비즈니스 로직 anchor 10건이 단 1 byte 도 변하지 않았다 (diff 의 - 측에 없거나 + 측에 동일하게 존재)"
    - "App.tsx 의 라우트 (`/cctv`) 가 변경되지 않았다 (git diff --stat 결과 empty)"
    - "DVR 카드 chrome (surface-raised bg + border-default + radius-md + padding 12px) 가 sketch V1~V6 와 동일"
    - "보존기간 배지가 isEstimate 분기로 safe(확정) / info(추정) 톤 두 가지로 정확히 분리된다"
    - "포트 표 교체일자 셀이 isReplaced 분기로 text-tertiary(기존) / text-info+bold(YYYY-MM-DD) 두 가지로 정확히 분리된다"
    - "12px 텍스트 4 곳 (채널수 / 배지 / 합계푸터 / 페이지푸터) 가 leading-none (line-height:1) 으로 시각 패딩 제거됨"
  artifacts:
    - path: "cha-bio-safety/src/pages/CctvInfoPage.tsx"
      provides: "Tailwind class 변환 완료된 CCTV 현황 페이지"
      contains: "className=\"bg-surface-raised"
  key_links:
    - from: "cha-bio-safety/src/pages/CctvInfoPage.tsx"
      to: "cha-bio-safety/src/utils/cctv.ts"
      via: "import { CCTV_DVRS, CCTV_INFO_UPDATED }"
      pattern: "from '../utils/cctv'"
    - from: "cha-bio-safety/src/pages/CctvInfoPage.tsx"
      to: "cha-bio-safety/src/hooks/useIsDesktop.ts"
      via: "import { useIsDesktop }"
      pattern: "from '../hooks/useIsDesktop'"
    - from: "cha-bio-safety/src/pages/CctvInfoPage.tsx"
      to: "cha-bio-safety/tailwind.config.js"
      via: "Tailwind class 매핑 (bg-surface-raised / text-text-primary / border-safe-bar 등)"
      pattern: "bg-surface-raised|text-text-primary|border-border-default|bg-safe-bg|bg-info-bg|text-safe|text-info"
---

<objective>
CctvInfoPage 의 inline style + var(--token) 마크업을 Tailwind class 로 변환.

- 시각 변경 0 (V1~V6 sketch 6 viewport 모두 픽셀 동일)
- 비즈 anchor 10건 1 byte 변경 0
- App.tsx 변경 0
- 단일 atomic commit (28-splash bbca2cb 패턴, 이번엔 1 파일)

Purpose: 다른 페이지(28/27/17/16/...)와 마크업 컨벤션 통일 (Tailwind class first). 후속 디자인 토큰 리팩토링 시 grep + 일괄 변환이 용이.

Output: `cha-bio-safety/src/pages/CctvInfoPage.tsx` 단일 파일 변환.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@CLAUDE.local.md
@cha-bio-safety/src/pages/CctvInfoPage.tsx
@cha-bio-safety/src/utils/cctv.ts
@cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html
@cha-bio-safety/tailwind.config.js
@cha-bio-safety/src/styles/tokens.css

<interfaces>
<!-- 변환 대상 파일의 현 시그니처. 단 1 byte 도 변경 금지 anchor 10건 박제. -->

비즈 anchor 10건 (executor 가 1 byte 도 바꾸면 verify FAIL):

1. `import { CCTV_DVRS, CCTV_INFO_UPDATED } from '../utils/cctv'`
2. `import { useIsDesktop } from '../hooks/useIsDesktop'`
3. `export default function CctvInfoPage() {`
4. `const isDesktop = useIsDesktop()`
5. `CCTV_DVRS.map(dvr => {` ... `})`
6. `const totalCap = dvr.ports.reduce((s, p) => s + (p.cap.endsWith('TB') ? parseFloat(p.cap) : 0), 0)`
7. `const isEstimate = dvr.retention.includes('추정')`
8. `dvr.ports.flatMap(p => {` + `const isReplaced = p.replaced !== '기존'`
9. `key={dvr.no}` (map key)
10. 출처 텍스트: `출처: CCTV 녹화 설비 현황 {CCTV_INFO_UPDATED}`

CctvDvr 데이터 타입 (참고):
```typescript
export type CctvPort = { p: number; cap: string; replaced: string }
export type CctvDvr = {
  no: string
  label: string
  desc: string
  retention: string
  channels: number
  ports: CctvPort[]
}
```

useIsDesktop 시그니처 (참고): `() => boolean` — true 일 때 데스크톱 분기.
</interfaces>

<sketch_css_verbatim>
<!-- 추측 X. sketch HTML 의 inline style 을 그대로 박제. 변환 시 이 정의를 1:1 로 Tailwind class 매핑. -->

sketch V1~V6 전 viewport 에서 사용된 inline style verbatim (cctv-info-sketch.html L133~L373):

[A] 페이지 컨테이너 (외곽 frame):
```
frame-mobile : padding: 12px 14px ; max-width 360px (mock frame)
frame-desktop: padding: 20px 24px ; max-width 960px (mock frame)
```
실제 페이지에서는 `flex: 1; overflowY: 'auto'; background: var(--surface-page)` + 위 padding 분기.

[B] 그리드 컨테이너:
```
display: grid;
grid-template-columns: 1fr;                              (모바일)
grid-template-columns: repeat(2, minmax(0, 1fr));        (데스크톱)
gap: 8px;                                                (모바일)
gap: 12px;                                               (데스크톱)
max-width: 960px; margin: 0 auto;                        (데스크톱 V2/V6)
```

[C] DVR 카드 (raised):
```
background: var(--surface-raised);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);   /* 12px */
padding: 12px;
```

[D] 카드 헤더 (라벨 + 채널수 + spacer + 배지):
```
display: flex;
align-items: baseline;
gap: 8px;
margin-bottom: 8px;
```
요소들:
- 라벨: `font-size: 13px; font-weight: 700; color: var(--text-primary);`
- 채널수: `font-size: 12px; font-weight: 600; color: var(--text-tertiary); line-height: 1;`
- spacer: `<span style="flex: 1;"></span>`
- 배지: 아래 [E]

[E] 보존기간 배지 (safe / info 두 톤):
```
display: inline-flex;
align-items: center;
gap: 4px;
padding: 2px 8px;
border-radius: var(--radius-pill);
font-size: 12px;
font-weight: 700;
line-height: 1;

/* 확정 (isEstimate=false) — safe 톤 */
background: var(--status-safe-bg);
border: 1px solid var(--status-safe-bar);
color: var(--status-safe);

/* 추정 (isEstimate=true) — info 톤 */
background: var(--status-info-bg);
border: 1px solid var(--status-info-bar);
color: var(--status-info);
```

[F] 배지 dot (좌측 6px):
```
display: inline-block;
width: 6px; height: 6px;
border-radius: 99px;
background: currentColor;
```

[G] 녹화구역 줄:
```
font-size: 12px;
color: var(--text-secondary);
margin-bottom: 8px;

  /* 앞 label part: "녹화구역 " */
  color: var(--text-tertiary);
```

[H] 포트 표 sub-card (page 톤 안에 raised):
```
display: grid;
grid-template-columns: auto 1fr 1fr;
gap: 4px 10px;
background: var(--surface-page);
border-radius: var(--radius-sm);   /* 8px */
padding: 8px 10px;
border: 1px solid var(--border-default);
```
헤더 셀: `font-size: 12px; color: var(--text-tertiary); font-weight: 600;` (포트 / 용량 / 교체일자)
포트# 셀: `font-size: 12px; color: var(--text-primary); font-weight: 700;` (#4 / #5 / ...)
용량 셀: `font-size: 12px; color: var(--text-primary);`
교체일자 셀 (isReplaced=false, "기존"): `font-size: 12px; color: var(--text-tertiary);`
교체일자 셀 (isReplaced=true, "YYYY-MM-DD"): `font-size: 12px; color: var(--status-info); font-weight: 700;`

[I] 합계 푸터 (카드 우측 하단):
```
font-size: 12px;
color: var(--text-tertiary);
margin-top: 6px;
text-align: right;
line-height: 1;
```
내용: `합계 {totalCap}TB · 포트 {dvr.ports.length}개`

[J] 출처 텍스트 (페이지 푸터, 그리드 바깥):
```
font-size: 12px;
color: var(--text-tertiary);
text-align: center;
padding: 12px 0 0 0;
line-height: 1;
```
</sketch_css_verbatim>

<tailwind_token_mapping>
<!-- tailwind.config.js 검증 후 확정한 token → class 매핑. 추측 X. -->

색상:
- `var(--surface-page)` → `bg-surface-page`
- `var(--surface-raised)` → `bg-surface-raised`
- `var(--text-primary)` → `text-text-primary`     ← 이중 prefix 주의 (config 의 'text-primary' 키)
- `var(--text-secondary)` → `text-text-secondary`
- `var(--text-tertiary)` → `text-text-tertiary`
- `var(--border-default)` → `border-border-default` ← 이중 prefix 주의
- `var(--status-safe)` → `text-safe`
- `var(--status-safe-bg)` → `bg-safe-bg`
- `var(--status-safe-bar)` → `border-safe-bar`
- `var(--status-info)` → `text-info`
- `var(--status-info-bg)` → `bg-info-bg`
- `var(--status-info-bar)` → `border-info-bar`

Radius:
- `var(--radius-sm)` → `rounded-sm`   (8px)
- `var(--radius-md)` → `rounded-md`   (12px)
- `var(--radius-pill)` → `rounded-pill` (99px)

Spacing (⚠ tailwind.config override — w-8=48px 함정 주의):
- 4px → `p-1` / `gap-1` / `mt-1` / `gap-x-1`
- 8px → `p-2` / `gap-2` / `mb-2`
- 12px → `p-3` / `gap-3` / `pt-3`
- 14px → `px-[14px]` (custom scale 없음, arbitrary)
- 20px → `p-5` / `py-5`
- 24px → `p-6` / `px-6`

Spacing arbitrary (custom scale 에 없는 값):
- 6px (dot 크기) → `w-[6px] h-[6px]`
- 6px (mt) → `mt-[6px]`
- gap '4px 10px' → `gap-x-[10px] gap-y-1`
- padding '2px 8px' → `py-[2px] px-2`
- padding '8px 10px' → `py-2 px-[10px]`
- padding '12px 14px' (모바일 페이지) → `py-3 px-[14px]`
- padding '20px 24px' (데스크톱 페이지) → `py-5 px-6`

Font size + weight (tailwind.config fontSize 적용):
- 12px → `text-caption` ← 단, lh:1.5 가 따라옴. 작은 컨테이너에서는 `leading-none` 명시
- 13px → `text-label` ← lh:1.5 따라옴
- weight 600 → `font-semibold`
- weight 700 → `font-bold`

⚠ text-caption 트랩 (메모리 박제 `feedback_text_caption_leading_none.md`):
- 채널수 (`line-height: 1`) → `text-caption leading-none font-semibold`
- 배지 (`line-height: 1`) → `text-caption leading-none font-bold`
- 합계 푸터 (`line-height: 1`) → `text-caption leading-none`
- 출처 푸터 (`line-height: 1`) → `text-caption leading-none`
- 그 외 일반 12px 텍스트 (line-height 지정 X) → `text-caption` 만 (sketch 의 line-height 미지정 = 기본 1.5 따름)

Layout:
- `display: flex` → `flex`
- `align-items: baseline` → `items-baseline`
- `display: inline-flex` → `inline-flex`
- `align-items: center` → `items-center`
- `display: grid` → `grid`
- `grid-template-columns: 1fr` → `grid-cols-1`
- `grid-template-columns: repeat(2, minmax(0, 1fr))` → `grid-cols-2` (Tailwind 의 grid-cols-2 = `repeat(2, minmax(0, 1fr))` 동일)
- `grid-template-columns: auto 1fr 1fr` → `grid-cols-[auto_1fr_1fr]`
- `flex: 1` → `flex-1`
- `text-align: right` → `text-right`
- `text-align: center` → `text-center`
- `border: 1px solid X` → `border border-X`
- `display: inline-block` → `inline-block`
- `overflowY: 'auto'` → `overflow-y-auto`
- `margin: 0 auto` → `mx-auto`

조건부 분기 (isDesktop / isEstimate / isReplaced) 처리:
- React 의 className 조건부는 `{isDesktop ? 'A' : 'B'}` 패턴 유지
- 또는 template literal `` `base ${cond ? 'a' : 'b'}` ``

max-width:
- `max-width: 960px` → `max-w-[960px]` (custom max-w 토큰 없음)
</tailwind_token_mapping>

</context>

<tasks>

<task type="auto">
  <name>Task 1: CctvInfoPage.tsx inline style → Tailwind class 변환 (단일 atomic)</name>
  <files>cha-bio-safety/src/pages/CctvInfoPage.tsx</files>
  <action>
CctvInfoPage.tsx 전체 마크업의 inline `style={...}` 속성을 Tailwind `className` 속성으로 1:1 변환.

규칙:
1. **시각 동등성 절대 보존** — sketch V1~V6 6 viewport 와 픽셀 단위로 동일해야 한다. 색/spacing/radius 어느 한 값이라도 임의 변경 금지.
2. **비즈 anchor 10건 1 byte 변경 0** — `<context>` 의 비즈 anchor 10건 목록 그대로 보존. JSX 구조(div 중첩 / span 위치 / map 분기) 도 동일.
3. **className 매핑은 `<tailwind_token_mapping>` 표만 사용** — 추측 X. 표에 없는 값은 arbitrary `[Npx]` 또는 `[var(--...)]` 로 명시.
4. **text-caption 함정 회피** — line-height 1 이 명시된 4 곳 (채널수 / 배지 / 합계 / 출처) 에는 반드시 `leading-none` 추가. line-height 미지정 곳(`녹화구역` 줄, 포트표 셀들) 은 leading-none 생략 (sketch 동일하게 기본 lh 따름).
5. **isDesktop 분기는 className 안에서 처리** — 페이지 padding (`py-3 px-[14px]` vs `py-5 px-6`) / 그리드 cols (`grid-cols-1` vs `grid-cols-2`) / 그리드 gap (`gap-2` vs `gap-3`). 삼항 또는 template literal 사용.
6. **isEstimate / isReplaced 분기도 className 으로** — 배지 (safe vs info) / 교체일자 셀 (tertiary vs info+bold).
7. **App.tsx 건드리지 않음** — 라우트 변경 0.
8. **import 순서 / 시그니처 / map / reduce / flatMap / includes / endsWith 모든 비즈 로직 보존**.

변환 후 구조 (참고용 outline, 시각/anchor 보존이 우선):

```tsx
import { CCTV_DVRS, CCTV_INFO_UPDATED } from '../utils/cctv'
import { useIsDesktop } from '../hooks/useIsDesktop'

export default function CctvInfoPage() {
  const isDesktop = useIsDesktop()

  return (
    <div className={`flex-1 overflow-y-auto bg-surface-page ${isDesktop ? 'py-5 px-6' : 'py-3 px-[14px]'}`}>
      <div className={`max-w-[960px] mx-auto grid ${isDesktop ? 'grid-cols-2 gap-3' : 'grid-cols-1 gap-2'}`}>
        {CCTV_DVRS.map(dvr => {
          const totalCap = dvr.ports.reduce((s, p) => s + (p.cap.endsWith('TB') ? parseFloat(p.cap) : 0), 0)
          const isEstimate = dvr.retention.includes('추정')
          return (
            <div key={dvr.no} className="bg-surface-raised border border-border-default rounded-md p-3">
              {/* 헤더 */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-label font-bold text-text-primary">{dvr.label}</span>
                <span className="text-caption leading-none font-semibold text-text-tertiary">{dvr.channels}ch</span>
                <span className="flex-1" />
                <span className={`inline-flex items-center gap-1 py-[2px] px-2 rounded-pill text-caption leading-none font-bold ${isEstimate ? 'bg-info-bg border border-info-bar text-info' : 'bg-safe-bg border border-safe-bar text-safe'}`}>
                  <span className="inline-block w-[6px] h-[6px] rounded-pill bg-current" />
                  {dvr.retention}
                </span>
              </div>
              {/* 녹화구역 */}
              <div className="text-caption text-text-secondary mb-2">
                <span className="text-text-tertiary">녹화구역 </span>{dvr.desc}
              </div>
              {/* 포트 표 */}
              <div className="grid grid-cols-[auto_1fr_1fr] gap-x-[10px] gap-y-1 bg-surface-page border border-border-default rounded-sm py-2 px-[10px]">
                <div className="text-caption text-text-tertiary font-semibold">포트</div>
                <div className="text-caption text-text-tertiary font-semibold">용량</div>
                <div className="text-caption text-text-tertiary font-semibold">교체일자</div>
                {dvr.ports.flatMap(p => {
                  const isReplaced = p.replaced !== '기존'
                  return [
                    <div key={`p-${p.p}`} className="text-caption text-text-primary font-bold">#{p.p}</div>,
                    <div key={`c-${p.p}`} className="text-caption text-text-primary">{p.cap}</div>,
                    <div key={`r-${p.p}`} className={`text-caption ${isReplaced ? 'text-info font-bold' : 'text-text-tertiary'}`}>{p.replaced}</div>,
                  ]
                })}
              </div>
              {/* 합계 푸터 */}
              <div className="text-caption leading-none text-text-tertiary text-right mt-[6px]">
                합계 {totalCap}TB · 포트 {dvr.ports.length}개
              </div>
            </div>
          )
        })}
      </div>
      {/* 페이지 푸터 */}
      <div className="text-caption leading-none text-text-tertiary text-center pt-3">
        출처: CCTV 녹화 설비 현황 {CCTV_INFO_UPDATED}
      </div>
    </div>
  )
}
```

⚠ 위 outline 은 참고용. 실제 변환 시:
- 비즈 anchor 10건이 1 byte 도 안 바뀌는지 self-check.
- sketch V1~V6 의 inline style 정의와 매핑 표를 다시 한번 대조.
- className 길이가 길어도 분할(`clsx` 등) 도입 금지 — 이 wave 는 마크업 변환만, 새 의존성 0.
- 변환 후 dev server 또는 build 로 visual smoke 확인 (가능하면).

⚠ 자체 검수 절차 (commit 직전 executor 가 직접 수행):
1. `grep -c "style={" cha-bio-safety/src/pages/CctvInfoPage.tsx` → 0 기대 (불가피한 경우 1건까지만 허용, 사유 commit body 기록)
2. `grep -c "var(--" cha-bio-safety/src/pages/CctvInfoPage.tsx` → 0 기대 (모두 class 매핑됨). 단 tailwind.config 에 매핑이 없어 부득이 `[var(--...)]` arbitrary 를 쓴 경우는 1~3건 허용, 사유 commit body 기록
3. 비즈 anchor 10건 grep:
   ```
   grep -F "import { CCTV_DVRS, CCTV_INFO_UPDATED } from '../utils/cctv'" cha-bio-safety/src/pages/CctvInfoPage.tsx
   grep -F "import { useIsDesktop } from '../hooks/useIsDesktop'" cha-bio-safety/src/pages/CctvInfoPage.tsx
   grep -F "export default function CctvInfoPage()" cha-bio-safety/src/pages/CctvInfoPage.tsx
   grep -F "const isDesktop = useIsDesktop()" cha-bio-safety/src/pages/CctvInfoPage.tsx
   grep -F "CCTV_DVRS.map(dvr =>" cha-bio-safety/src/pages/CctvInfoPage.tsx
   grep -F "const totalCap = dvr.ports.reduce((s, p) => s + (p.cap.endsWith('TB') ? parseFloat(p.cap) : 0), 0)" cha-bio-safety/src/pages/CctvInfoPage.tsx
   grep -F "const isEstimate = dvr.retention.includes('추정')" cha-bio-safety/src/pages/CctvInfoPage.tsx
   grep -F "dvr.ports.flatMap(p =>" cha-bio-safety/src/pages/CctvInfoPage.tsx
   grep -F "const isReplaced = p.replaced !== '기존'" cha-bio-safety/src/pages/CctvInfoPage.tsx
   grep -F "출처: CCTV 녹화 설비 현황 {CCTV_INFO_UPDATED}" cha-bio-safety/src/pages/CctvInfoPage.tsx
   ```
   10건 모두 정확히 1줄 매치되어야 PASS.
4. `git diff --stat origin/main..HEAD -- cha-bio-safety/src/App.tsx` → empty (App.tsx 변경 0)
5. `git diff --stat origin/main..HEAD` → CctvInfoPage.tsx 단일 파일만 변경

자체 검수 5건 모두 PASS 시 atomic commit. 커밋 메시지에 verify gate 결과 포함:

```
refactor(10-cctv): inline style → Tailwind class 변환 (CctvInfoPage)

- 시각 변경 0 (V1~V6 sketch 6 viewport 픽셀 동일)
- 비즈 anchor 10건 1 byte 변경 0
- App.tsx 변경 0
- 단일 atomic (1 파일)

verify gate:
- grep -c "style={" → N
- grep -c "var(--" → N
- 비즈 anchor 10건 매치: 10/10 PASS
- App.tsx 변경: empty PASS
- 단일 파일 변경: PASS
```

⚠ 머지/배포 룰 (CLAUDE.local.md + 메모리 박제 `feedback_deploy_test.md`):
- 사용자 명시 컨펌 전까지 main 머지 / push 금지
- wrangler 명령 자체 금지 (CLAUDE.local.md deny 설정)
- main 머지 시 GitHub Actions 가 cbc7119-preview 자동 배포만 (직원 도메인 cbc7119 X)
  </action>
  <verify>
    <automated>
cd cha-bio-safety && \
echo "=== 1. inline style 잔여 ===" && \
INLINE=$(grep -c "style={" src/pages/CctvInfoPage.tsx) && echo "style={ count: $INLINE (기대 0, 최대 1)" && \
echo "=== 2. var(--token) 잔여 ===" && \
VAR=$(grep -c "var(--" src/pages/CctvInfoPage.tsx) && echo "var(-- count: $VAR (기대 0, 최대 3)" && \
echo "=== 3. 비즈 anchor 10건 ===" && \
A1=$(grep -cF "import { CCTV_DVRS, CCTV_INFO_UPDATED } from '../utils/cctv'" src/pages/CctvInfoPage.tsx) && \
A2=$(grep -cF "import { useIsDesktop } from '../hooks/useIsDesktop'" src/pages/CctvInfoPage.tsx) && \
A3=$(grep -cF "export default function CctvInfoPage()" src/pages/CctvInfoPage.tsx) && \
A4=$(grep -cF "const isDesktop = useIsDesktop()" src/pages/CctvInfoPage.tsx) && \
A5=$(grep -cF "CCTV_DVRS.map(dvr =>" src/pages/CctvInfoPage.tsx) && \
A6=$(grep -cF "const totalCap = dvr.ports.reduce((s, p) => s + (p.cap.endsWith('TB') ? parseFloat(p.cap) : 0), 0)" src/pages/CctvInfoPage.tsx) && \
A7=$(grep -cF "const isEstimate = dvr.retention.includes('추정')" src/pages/CctvInfoPage.tsx) && \
A8=$(grep -cF "dvr.ports.flatMap(p =>" src/pages/CctvInfoPage.tsx) && \
A9=$(grep -cF "const isReplaced = p.replaced !== '기존'" src/pages/CctvInfoPage.tsx) && \
A10=$(grep -cF "출처: CCTV 녹화 설비 현황 {CCTV_INFO_UPDATED}" src/pages/CctvInfoPage.tsx) && \
echo "anchors: $A1,$A2,$A3,$A4,$A5,$A6,$A7,$A8,$A9,$A10 (모두 1 기대)" && \
TOTAL=$((A1+A2+A3+A4+A5+A6+A7+A8+A9+A10)) && echo "anchor 합계: $TOTAL (기대 10)" && \
echo "=== 4. App.tsx 변경 0 ===" && \
cd .. && git diff --stat origin/main..HEAD -- cha-bio-safety/src/App.tsx && \
echo "=== 5. 변경 파일 단일 ===" && \
git diff --stat origin/main..HEAD | tail -5
    </automated>
  </verify>
  <done>
- CctvInfoPage.tsx 의 `style={` 0건 (또는 1건 + 사유 commit 기록)
- `var(--` 0건 (또는 1~3건 + 사유 commit 기록)
- 비즈 anchor 10건 모두 1줄 매치 (합계 10)
- App.tsx git diff --stat empty
- 변경 파일 = CctvInfoPage.tsx 단일
- 시각 smoke check OK (가능 시 dev server / preview build)
- atomic commit 1건 생성 (사용자 컨펌 전까지 main push 금지)
  </done>
</task>

</tasks>

<verification>
이 wave 의 verification 은 task 1 의 `<verify>` block 5건이 전부.

추가 manual check (사용자 머지 컨펌 후, GitHub Actions cbc7119-preview 배포 후):
- 모바일 viewport (375px 정도) → DVR 1 카드 3포트 모두 "기존" / 50일 safe 배지
- 모바일 viewport → DVR 7 카드 #4/#6 교체일자 info(파랑) 강조 / #5 기존 tertiary
- 모바일 viewport → DVR 13 카드 보존배지 info(파랑) + dot / #1 4TB 2026-04-28 info 강조
- 데스크톱 viewport (≥768px) → 2열 grid, DVR 13 마지막 행 오른쪽 빈 슬롯
- 출처 푸터 가운데 정렬 + text-tertiary + 한 줄

위 6건 모두 OK 일 때만 cbc7119-preview 배포 정상.
</verification>

<success_criteria>
- [x] CctvInfoPage.tsx 의 inline style → Tailwind class 변환 완료
- [x] V1~V6 sketch 6 viewport 와 시각 동일 (육안 + grep)
- [x] 비즈 anchor 10건 1 byte 변경 0 (grep 10/10 PASS)
- [x] App.tsx 변경 0 (git diff --stat empty)
- [x] 단일 atomic commit (1 파일)
- [x] commit message 에 verify gate 결과 포함
- [x] 사용자 컨펌 후 main 머지 (Claude 자율 머지 금지)
- [x] wrangler 명령 0건 사용 (CLAUDE.local.md 강제)
</success_criteria>

<output>
After completion, create `.planning/quick/260522-ffc-redesign-10-cctv-info-tsx-tailwind-class/260522-ffc-SUMMARY.md` with:

- atomic commit hash (예: `git log -1 --pretty=format:"%h %s"`)
- verify gate 5건 결과 (inline / var / anchor 10건 / App.tsx / 단일 파일)
- 변환 line 수 (before/after) — `wc -l src/pages/CctvInfoPage.tsx`
- 변환 전후 className 통계 (대표 패턴 grep)
- 사용자 머지/배포 컨펌 대기 상태 명시
- 메모리 박제 후보 (예: text-text-primary 이중 prefix 패턴, w-[6px] arbitrary 등 — 다음 페이지 변환 시 재사용 가능 시 박제 권장)
</output>

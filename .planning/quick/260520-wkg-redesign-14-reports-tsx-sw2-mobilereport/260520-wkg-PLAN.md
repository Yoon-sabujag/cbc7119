---
quick_id: 260520-wkg
type: execute
mode: quick
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/ReportsPage.tsx
autonomous: true
requirements: [REDESIGN-14-REPORTS-TSX-SW2]
tags: [redesign, 14-reports, tsx-conversion, mobile, sw2]

must_haves:
  truths:
    - "MobileReportsPage 의 모든 인라인 style 이 SW1 의 .page-header / .back-btn / .page-title / .year-pager / .year-pager-slot / .year-nav-btn / .year-label / .page-body / .report-card / .report-card-head / .report-card-title / .report-card-sub / .report-card-btn / .page-footer-note 14 class 로 치환된다"
    - "Download 이모지(⬇) 가 lucide-react <Download size={14} /> 로 치환되고 본문 텍스트는 'X · Y · 연도' dot span 패턴으로 변환된다"
    - "useState / handleDownload / downloadReport / setYear / disabled / onClick / REPORT_CARDS.map 등 비즈 로직 시그니처와 분기 조건이 100% 보존된다"
    - "iconBtn / navBtn 상수가 통째 삭제되고 SW1 의 .back-btn / .year-nav-btn class 가 동등 정의를 제공한다"
    - "ExcelPreview / App / styles / main / DesktopReportsPage (line 1~315, 400~) 영역은 변경되지 않는다 (단, line 3 import 의 ChevronLeft 추가는 예외)"
    - "tsc --noEmit 0 errors, npm run build PASS"
  artifacts:
    - path: "cha-bio-safety/src/pages/ReportsPage.tsx"
      provides: "MobileReportsPage v0.1.1 — SW1 class 기반 헤더 + report-card 그리드 10종 + footer"
      contains: "className=\"page-header\""
  key_links:
    - from: "src/pages/ReportsPage.tsx (MobileReportsPage)"
      to: "src/styles/components.css (SW1 14 class)"
      via: "className= 참조 (인라인 style 0 in scope)"
      pattern: "className=\"(page-header|back-btn|page-title|year-pager|year-pager-slot|year-nav-btn|year-label|page-body|report-card|report-card-head|report-card-title|report-card-sub|report-card-btn|page-footer-note)\""
    - from: "src/pages/ReportsPage.tsx (line 3 import)"
      to: "lucide-react"
      via: "named import 확장"
      pattern: "import \\{ Download, ChevronLeft \\} from 'lucide-react'"
---

<objective>
ReportsPage.tsx 의 MobileReportsPage 함수 (line 316~385) + iconBtn/navBtn 상수 (line 387~398) 를 SW1 의 14 class 기반 v0.1.1 Tailwind/CSS 마크업으로 재작성한다.

Purpose: 14-reports redesign 트랙의 SW2 단계 — 모바일 헤더 + 10종 report-card 그리드 + footer 의 인라인 style 을 SW1 정의 class 로 치환해 디자인 토큰 일관성을 확보한다. SW3 (DesktopReportsPage) 진입 전 모바일 검증 완료가 목표.

Output:
- cha-bio-safety/src/pages/ReportsPage.tsx 단일 파일 수정 (line 3 import 확장 + line 316~398 재작성)
- atomic 1-commit
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.local.md
@cha-bio-safety/src/pages/ReportsPage.tsx
@cha-bio-safety/src/styles/components.css
@cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-2-mobile-header-card.html
@cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-3-mobile-card-list.html
@cha-bio-safety/docs/redesign-context/14-reports/wave-7-tsx-conversion-checklist.md
@cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md

<interfaces>
<!-- SW1 의 14 class 가 이미 components.css 에 정의되어 있다. 본 wave 는 class 를 새로 만들지 않고 참조만 한다. -->
<!-- grep 으로 추출한 SW1 class verbatim 정의 (src/styles/components.css line 23~42): -->

From cha-bio-safety/src/styles/components.css:
```css
.page-header { flex-shrink: 0; background: var(--surface-raised); border-bottom: 1px solid var(--border-default); padding: 8px 12px 9px; display: flex; align-items: center; gap: 8px; }
.back-btn { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; background: var(--surface-sunken); border: 1px solid var(--border-default); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.page-title { flex: 1; font-size: 18px; font-weight: 700; color: var(--text-primary); line-height: 1.4; }
.year-pager { display: flex; align-items: center; gap: 2px; }
.year-pager-slot { width: 24px; display: flex; justify-content: center; }
.year-nav-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border-default); background: var(--surface-sunken); color: var(--text-primary); font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; }
.year-label { width: 44px; text-align: center; font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1; }
.page-body { padding: 12px 16px; background: var(--surface-page); }
.report-card { background: var(--surface-raised); border-radius: 12px; border: 1px solid var(--border-default); padding: 14px; margin-bottom: 10px; }
.report-card-head { margin-bottom: 10px; }
.report-card-title { font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.4; }
.report-card-sub { margin-top: 4px; font-size: 12px; color: var(--text-tertiary); display: flex; align-items: center; gap: 6px; line-height: 1; }
.report-card-btn { width: 100%; padding: 12px; border-radius: 8px; border: 0; background: var(--status-safe-bar); color: var(--text-on-accent); font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
.report-card--loading .report-card-btn { background: var(--surface-sunken); color: var(--text-tertiary); cursor: default; }
.dot-meta { display: inline-block; width: 4px; height: 4px; border-radius: 9999px; background: var(--text-tertiary); flex-shrink: 0; }
.page-footer-note { text-align: center; padding: 8px 16px 20px; font-size: 12px; line-height: 1.6; color: var(--text-tertiary); }
```

<!-- 비즈 로직 시그니처 (보존 대상). 라인 번호는 변환 전 기준. -->

REPORT_CARDS shape:
```ts
{ type: ReportType; title: string; sub: string }
// sub 패턴: 'DIV · 34개소' / '소화전 · 각 층' / '가스소화 · 3개소' 등 — 항상 정확히 'X · Y' (가운뎃점 1개) 형태
```

handleDownload (line 320~327):
```ts
const handleDownload = async (type: ReportType) => {
  setLoading(type)
  try { await downloadReport(type, year) }
  finally { setLoading(null) }
}
```

year toggle (line 342, 348):
```ts
year > MIN_YEAR  // prev 버튼 조건 (line 342)
year < CURRENT_YEAR  // next 버튼 조건 (line 348)
setYear(y => y - 1)  // line 343
setYear(y => y + 1)  // line 349
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: MobileReportsPage v0.1.1 Tailwind/CSS class 재작성</name>
  <files>cha-bio-safety/src/pages/ReportsPage.tsx</files>
  <action>
**STEP 1 — import 확장 (line 3):**

Before:
```tsx
import { Download } from 'lucide-react'
```

After:
```tsx
import { Download, ChevronLeft } from 'lucide-react'
```

**STEP 2 — MobileReportsPage 함수 본체 재작성 (line 329~384, return statement 전체 교체):**

`navigate` / `year` / `setYear` / `loading` / `setLoading` / `handleDownload` 선언 (line 317~327) 은 **그대로 보존**. return 만 아래로 교체한다.

```tsx
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface-page)' }}>
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로 가기">
          <ChevronLeft size={15} />
        </button>
        <span className="page-title">점검 일지 출력</span>

        {/* 연도 선택 */}
        <div className="year-pager">
          <div className="year-pager-slot">
            {year > MIN_YEAR && (
              <button className="year-nav-btn" onClick={() => setYear(y => y - 1)} aria-label="이전 연도">‹</button>
            )}
          </div>
          <span className="year-label">{year}년</span>
          <div className="year-pager-slot">
            {year < CURRENT_YEAR && (
              <button className="year-nav-btn" onClick={() => setYear(y => y + 1)} aria-label="다음 연도">›</button>
            )}
          </div>
        </div>
      </header>

      <div className="page-body" style={{ flex: 1, overflowY: 'auto' }}>
        {REPORT_CARDS.map(card => {
          const isLoading = loading === card.type
          const [subLeft, subRight] = card.sub.split(' · ')
          return (
            <div
              key={card.type}
              className={isLoading ? 'report-card report-card--loading' : 'report-card'}
            >
              <div className="report-card-head">
                <div className="report-card-title">{card.title}</div>
                <div className="report-card-sub">
                  <span>{subLeft}</span>
                  <span className="dot-meta"></span>
                  <span>{subRight}</span>
                  <span className="dot-meta"></span>
                  <span>{year}년도</span>
                </div>
              </div>

              <button
                className="report-card-btn"
                onClick={() => handleDownload(card.type)}
                disabled={isLoading}
              >
                {isLoading ? (
                  '생성 중...'
                ) : (
                  <>
                    <Download size={14} />
                    <span>엑셀 다운로드</span>
                  </>
                )}
              </button>
            </div>
          )
        })}

        <div className="page-footer-note">
          다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)
        </div>
      </div>
    </div>
  )
}
```

**변환 결정 NOTE:**
- 최상위 `<div>` 의 `height: '100%'` / `display: 'flex'` / `flexDirection: 'column'` / `overflow: 'hidden'` 은 SW1 class 에 정의 없음 → 인라인 style 유지 (모바일 viewport 레이아웃 root, SW1 의 .page-body 와 별개 책임)
- `<div className="page-body">` 의 `flex: 1` / `overflowY: 'auto'` 는 SW1 .page-body 정의에 없음 → 인라인 style 로 추가 (스크롤 컨테이너 책임)
- `background: 'var(--bg)'` → `'var(--surface-page)'` 로 토큰 명 일치화 (SW1 정의와 동등)
- card.sub 의 ' · ' 가운뎃점은 dot span 으로 변환 (W1 OQ #5 LOCKED, 메모리 룰 feedback_planner_prompt_sketch_verbatim 적용)
- `aria-label` 추가 (back-btn / year-nav-btn) — 변환 wave 의 일반 a11y 보강, 비즈 로직 변경 아님

**STEP 3 — iconBtn / navBtn 상수 삭제 (line 387~398, 총 12 lines):**

```tsx
const iconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
  background: 'var(--bg3)', border: '1px solid var(--bd)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const navBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 7, border: '1px solid var(--bd)',
  background: 'var(--bg3)', color: 'var(--t1)', fontSize: 16, fontWeight: 700,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1,
}
```

위 2 상수 통째 **삭제**. 동등 정의가 SW1 의 `.back-btn` / `.year-nav-btn` 에 존재한다 (verified — components.css line 24, 28).

**STEP 4 — 미수정 영역 (NEGATIVE scope, 절대 건드리지 않음):**

- line 1~2 (useState / useNavigate import — 단 line 3 의 lucide import 만 ChevronLeft 추가)
- line 4~7 (api / generateExcel / ExcelPreview / useIsDesktop import)
- line 9~10 (ReportType type)
- line 12~36 (REPORT_CARDS / MATRIX_CONFIG / CURRENT_YEAR / MIN_YEAR / ANNUAL_TYPES)
- line 38~139 (downloadReport / generateReportBlob / downloadAllAsZip)
- line 141~147 (DESKTOP_SECTIONS)
- line 149~304 (DesktopReportsPage) — SW3 책임
- line 306~313 (SELECT_STYLE) — SW3 책임
- line 400~405 (export default)

비즈 로직 시그니처 보존 체크:
- [ ] `useState<ReportType | null>(null)` 동일
- [ ] `handleDownload(type)` signature + try/finally 동일
- [ ] `await downloadReport(type, year)` 호출 동일
- [ ] `REPORT_CARDS.map` 분기 동일
- [ ] `year > MIN_YEAR` / `year < CURRENT_YEAR` 분기 조건 동일
- [ ] `setYear(y => y - 1)` / `setYear(y => y + 1)` 동일
- [ ] `disabled={loading === card.type}` 동일 (isLoading 로컬 변수로 캡처되나 비교 의미 동일)
- [ ] `onClick={() => navigate(-1)}` 동일
- [ ] `card.title` / `card.sub` / `card.type` 접근 동일

**STEP 5 — 빌드 검증:**

```bash
cd cha-bio-safety && npx tsc --noEmit 2>&1 | tail -30
cd cha-bio-safety && npm run build 2>&1 | tail -50
```

tsc 0 errors, build PASS 확인.

**STEP 6 — atomic commit:**

수정 파일: `cha-bio-safety/src/pages/ReportsPage.tsx` 단 1개.

커밋 메시지 (정확히 이대로):
```
tsx(14-reports): SW2 — MobileReportsPage v0.1.1 Tailwind 재작성 (헤더 + 카드 그리드 10종 + footer)
```

`git add cha-bio-safety/src/pages/ReportsPage.tsx` 후 위 메시지로 commit. 다른 파일은 staging 금지.
  </action>
  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && \
echo "=== NEGATIVE (모두 0이어야 함) ===" && \
echo -n "1. 이모지 ⬇ : "; grep -cF '⬇' src/pages/ReportsPage.tsx && \
echo -n "2. line 316~398 linear-gradient: "; sed -n '316,398p' src/pages/ReportsPage.tsx | grep -cF 'linear-gradient' && \
echo -n "3. line 316~398 font-size 10/11px: "; sed -n '316,398p' src/pages/ReportsPage.tsx | grep -cE 'font-size:\s*1[01]px|fontSize:\s*1[01](\s|,|$)' && \
echo -n "4. text-status- / bg-status-: "; grep -cE 'text-status-|bg-status-' src/pages/ReportsPage.tsx && \
echo -n "5. iconBtn / navBtn 상수: "; grep -cE 'const iconBtn|const navBtn' src/pages/ReportsPage.tsx && \
echo "" && \
echo "=== POSITIVE (모두 ≥1) ===" && \
echo -n "7. import 확장: "; grep -cF "import { Download, ChevronLeft } from 'lucide-react'" src/pages/ReportsPage.tsx && \
echo -n "8. .page-header: "; grep -c 'className="page-header"' src/pages/ReportsPage.tsx && \
echo -n "9. .back-btn: "; grep -c 'className="back-btn"' src/pages/ReportsPage.tsx && \
echo -n "10. .page-title: "; grep -c 'className="page-title"' src/pages/ReportsPage.tsx && \
echo -n "11. .year-pager: "; grep -c 'className="year-pager"' src/pages/ReportsPage.tsx && \
echo -n "12. .year-pager-slot: "; grep -c 'className="year-pager-slot"' src/pages/ReportsPage.tsx && \
echo -n "13. .year-nav-btn: "; grep -c 'className="year-nav-btn"' src/pages/ReportsPage.tsx && \
echo -n "14. .year-label: "; grep -c 'className="year-label"' src/pages/ReportsPage.tsx && \
echo -n "15. .page-body: "; grep -c 'className="page-body"' src/pages/ReportsPage.tsx && \
echo -n "16. .report-card (loading 포함): "; grep -cE "className=\"report-card( report-card--loading)?\"|'report-card report-card--loading' : 'report-card'" src/pages/ReportsPage.tsx && \
echo -n "17. .report-card-head: "; grep -c 'className="report-card-head"' src/pages/ReportsPage.tsx && \
echo -n "18. .report-card-title: "; grep -c 'className="report-card-title"' src/pages/ReportsPage.tsx && \
echo -n "19. .report-card-sub: "; grep -c 'className="report-card-sub"' src/pages/ReportsPage.tsx && \
echo -n "20. .report-card-btn: "; grep -c 'className="report-card-btn"' src/pages/ReportsPage.tsx && \
echo -n "21. .dot-meta: "; grep -c 'className="dot-meta"' src/pages/ReportsPage.tsx && \
echo -n "22. .page-footer-note: "; grep -c 'className="page-footer-note"' src/pages/ReportsPage.tsx && \
echo -n "23. <Download size={14}: "; grep -c '<Download size={14}' src/pages/ReportsPage.tsx && \
echo -n "24. <ChevronLeft size={15}: "; grep -c '<ChevronLeft size={15}' src/pages/ReportsPage.tsx && \
echo -n "25. handleDownload(card.type) 보존: "; grep -c 'handleDownload(card.type)' src/pages/ReportsPage.tsx && \
echo -n "26. REPORT_CARDS.map 보존: "; grep -cE 'REPORT_CARDS\.map' src/pages/ReportsPage.tsx && \
echo -n "27. setYear(y => y - 1) 보존: "; grep -cF 'setYear(y => y - 1)' src/pages/ReportsPage.tsx && \
echo -n "28. setYear(y => y + 1) 보존: "; grep -cF 'setYear(y => y + 1)' src/pages/ReportsPage.tsx && \
echo -n "29. navigate(-1) 보존: "; grep -cF 'navigate(-1)' src/pages/ReportsPage.tsx && \
echo "" && \
echo "=== FILE-LEVEL GUARDS (모두 0) ===" && \
echo -n "30. ExcelPreview 변경: "; git diff --name-only HEAD -- src/components/ExcelPreview.tsx | wc -l | tr -d ' ' && \
echo -n "31. App.tsx 변경: "; git diff --name-only HEAD -- src/App.tsx | wc -l | tr -d ' ' && \
echo -n "32. styles/ 변경: "; git diff --name-only HEAD -- src/styles/ | wc -l | tr -d ' ' && \
echo -n "33. main.tsx 변경: "; git diff --name-only HEAD -- src/main.tsx | wc -l | tr -d ' ' && \
echo "" && \
echo "=== BUILD ===" && \
npx tsc --noEmit 2>&1 | tail -5 && \
npm run build 2>&1 | tail -10
    </automated>
  </verify>
  <done>
- 모든 NEGATIVE gate = 0
- 모든 POSITIVE gate ≥ 1 (gate #16 의 conditional 형태는 1 카운트로 OK)
- FILE-LEVEL guard = 0 (단, ReportsPage.tsx 자체는 staged 됨)
- tsc 0 errors, npm run build PASS
- atomic 1-commit 으로 main 브랜치 (또는 작업 브랜치) 에 기록됨
- 커밋 메시지: `tsx(14-reports): SW2 — MobileReportsPage v0.1.1 Tailwind 재작성 (헤더 + 카드 그리드 10종 + footer)`
  </done>
</task>

</tasks>

<verification>
**전체 phase 검증:**

1. **소스 라인 영역 확인** — line 1~315 / 400~405 영역의 git diff 가 line 3 import 1줄 외에 0 (Mobile scope 격리)
2. **SW1 class 14종 모두 1+회 등장** — gate #8~22
3. **인라인 style 의 디자인 토큰 제거** — line 316~398 영역에서 `linear-gradient` / `font-size` 10~11px 0, 인라인 background 컬러 0 (단 root flex 컨테이너의 `background: 'var(--surface-page)'` 만 예외 — SW1 .page-body 와 별책임 root)
4. **이모지 → lucide** — `<Download size={14} />` ≥1, `<ChevronLeft size={15} />` ≥1, ⬇ 이모지 0
5. **비즈 로직 시그니처 보존** — gate #25~29 + 본문 체크리스트 (`useState` / try-finally / disabled / map / 조건 분기)
6. **빌드 PASS** — tsc 0 errors, vite build 성공, chunk size delta 기록
7. **파일 격리** — gate #30~33 모두 0 (Mobile scope 외 파일 0 영향)
</verification>

<success_criteria>
- [ ] ReportsPage.tsx 단 1 파일 수정
- [ ] line 3 import 에 ChevronLeft 추가
- [ ] MobileReportsPage (line 316~385) 의 return 이 SW1 의 14 class 로 재작성됨
- [ ] iconBtn / navBtn 상수 (line 387~398) 통째 삭제됨
- [ ] tsc --noEmit 0 errors
- [ ] npm run build PASS (chunk size delta 기록)
- [ ] atomic 1-commit, 메시지 정확
- [ ] 33개 verify gate 모두 PASS
</success_criteria>

<output>
After completion, create `.planning/quick/260520-wkg-redesign-14-reports-tsx-sw2-mobilereport/260520-wkg-SUMMARY.md` 포함:

1. **변환 매핑 표** — Before (인라인 style) → After (className=) 14 row
2. **verify gate 결과** — 33 gate 의 실제 grep 카운트 값 + PASS/FAIL
3. **비즈 로직 보존 체크** — 9개 체크리스트 ✅ 표시
4. **빌드 결과** — tsc 결과 + vite build chunk size delta (Before vs After)
5. **커밋 hash** — atomic 1-commit hash
6. **다음 wave 진입 게이트** — SW3 (DesktopReportsPage) 진입 가능 여부 (PASS/BLOCK)
</output>

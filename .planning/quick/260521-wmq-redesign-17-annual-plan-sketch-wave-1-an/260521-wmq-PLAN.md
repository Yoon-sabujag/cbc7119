---
phase: quick-260521-wmq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md
autonomous: true
requirements:
  - REDESIGN-17-WAVE1
must_haves:
  truths:
    - "wave-1-index.md 파일이 cha-bio-safety/docs/redesign-context/17-annual-plan/ 직속에 생성됨 (sketch/ 서브폴더 X — 13-schedule + 14-reports + 27-login + 16-workshift 평면 패턴 mirror)"
    - "7개 필수 섹션(§1~§7) 모두 채워짐"
    - "AnnualPlanPage.tsx 인벤토리 표가 (1) 공통 hook/state/handler + 상수 (2) 공통 previewImage element (3) 데스크톱 분기 (4) 모바일 분기 4 영역 모두 포함 + 캘리브 좌표 시스템 시그니처 박제"
    - "4 sub-wave 분배 표가 W2~W5 행을 모두 포함 (AnnualPlanPage 가 225 lines 단순 페이지 — 27-login W1 + 16-workshift W1 패턴과 동일 4 sub-wave)"
    - "design-system.md §1.1/§1.2/§1.3/§6/§7/§7.1 인용이 fence 안 verbatim 으로 포함 (§6/§7 은 미적용 1줄 메타 동반)"
    - "메모리 룰 12개가 inline 인용 (10건 + AnnualPlanPage 특화 2건 — pdflib_subset_false + redesign_15_daily_report_status 의 캘리브 좌표 보존 precedent)"
    - "negative rule 섹션이 sketch HTML 금지 / 코드 수정 금지 / wrangler 금지 / npm run deploy 금지 / 평면 폴더 / App.tsx 미수정 / 비즈 시그니처 변경 금지 / 캘리브 좌표 시스템 1 byte 변경 금지 / preview PNG 자산 경로 변경 금지 / Malgun Gothic 폰트 패밀리 보존 9건 포함"
    - "OQ 5건이 §7 에 정리됨 (AnnualPlanPage 의 실제 결정 포인트 — 다운로드 그라데이션 / 위치조정 토글 색 / 폰트 격상 / Lucide 아이콘 / 캘리브 안내 칩 색)"
    - "AnnualPlanPage.tsx + generateAnnualPlan.ts 코드 변경 0"
    - "/annual-plan 가 MOBILE_NO_NAV_PATHS 등재 (BottomNav 모바일 숨김) + PAGE_TITLES 등재 + DESKTOP_HEADER_HIDE_PATHS **미등재** (글로벌 AppHeader 데스크톱 표시 — line 109 의 '페이지 제목은 App.tsx 헤더에서 표시' 코멘트 일관) — App.tsx line 71/77/99 실측 결과 §4 에 박제"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md"
      provides: "W2~W5 진입을 위한 단일 진입점 인덱스 + 룰 verbatim 인용 + sub-wave 분배 매핑 (AnnualPlanPage 단순 페이지 + 캘리브 좌표 시스템용 4 sub-wave 분배)"
      contains: "§1. AnnualPlanPage.tsx 인벤토리, §2. 4 sub-wave 분배, §3. design-system verbatim, §4. chrome 통일 룰 (연간계획 = 점검 시리즈 아님 — 패턴 mirror만 + BottomNav/AppHeader 실측), §5. 메모리 룰 12개 inline, §6. negative rule, §7. open questions"
  key_links:
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/pages/AnnualPlanPage.tsx"
      via: "§1 인벤토리에 line 범위 인용 + §2 sub-wave 분배 표의 element/line 매핑"
      pattern: "line [0-9]+"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/docs/redesign-context/17-annual-plan/design-system.md"
      via: "§3 fence verbatim 인용 (§1.1/§1.2/§1.3 본문 박제)"
      pattern: "design-system.md §"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md"
      via: "§4 chrome 룰 (연간계획 = 점검 시리즈 아님 — chrome 룰 직접 적용 X / 헤더 패턴만 mirror)"
      pattern: "inspection-modal-chrome-rules"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/App.tsx"
      via: "§4 BottomNav/AppHeader 실측 — MOBILE_NO_NAV_PATHS (line 71) + DESKTOP_NO_NAV_PATHS 미등재 (line 74) + DESKTOP_HEADER_HIDE_PATHS 미등재 (line 77) + PAGE_TITLES 등재 (line 99)"
      pattern: "MOBILE_NO_NAV_PATHS|DESKTOP_HEADER_HIDE_PATHS|PAGE_TITLES"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/utils/generateAnnualPlan.ts"
      via: "§1 인벤토리 비즈 로직 보존 — generateAnnualPlan(returnBlob?) export 시그니처 박제"
      pattern: "generateAnnualPlan"
---

<objective>
redesign/17-annual-plan sketch 작업의 wave 1 — 후속 wave(W2~W5) 의 단일 진입점이 되는 인덱스/룰 정리 문서 1개만 작성한다.

Purpose: AnnualPlanPage.tsx (225 라인 — 27-login LoginPage 220 라인 + 16-workshift WorkShiftPage 226 라인 과 유사한 단순 페이지) 의 모든 element 를 **4 sub-wave** 로 분배 (27-login + 16-workshift W1 패턴 mirror, 14-reports 6 sub-wave 보다 줄임), 그리고 design-system.md 룰과 메모리 룰 12개 (10 기본 + AnnualPlanPage 특화 2건 — 캘리브 좌표 시스템 보존 룰 + 폰트 임베딩 일반 룰) 를 verbatim 박제해서 후속 sketch wave 작업자가 이 인덱스만 보면 일관되게 작업할 수 있도록 한다.

Output: `cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md` 단 1개 파일. 코드 변경 0건. sketch HTML 생성 0건 (그건 W2 부터).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@./CLAUDE.local.md

# 27-login W1 + 16-workshift W1 precedent (이번 wave 가 mirror 할 정확한 7 섹션 구조 + 4 sub-wave 패턴)
@.planning/quick/260521-c6p-redesign-27-login-sketch-wave-1-loginpag/260521-c6p-PLAN.md
@.planning/quick/260521-sjj-redesign-16-workshift-sketch-wave-1-work/260521-sjj-PLAN.md

# 16-workshift W1 산출물 (가장 최근 7섹션 mirror, 12 메모리 룰 패턴 origin)
@cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md

# 15-daily-report W1 산출물 (★ 캘리브 좌표 시스템 보존 precedent — yearPos 와 유사한 패턴)
@cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md

# Source files (이 wave 의 분석 대상, 수정 0)
@cha-bio-safety/src/pages/AnnualPlanPage.tsx
@cha-bio-safety/src/utils/generateAnnualPlan.ts

# Redesign context (이 wave 가 산출할 인덱스가 인용/참조하는 문서들)
@cha-bio-safety/docs/redesign-context/17-annual-plan/17-annual-plan.md
@cha-bio-safety/docs/redesign-context/17-annual-plan/design-system.md
@cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md

# 27-login + 14-reports + 13-schedule + 16-workshift 모두 평면 sibling 패턴 (sketch/ 서브폴더 없음). 본 wave 도 동일.
</context>

<interfaces>
<!-- 후속 wave 가 산출할 sketch 파일 명명 규칙 (이 인덱스가 §2 표에서 인용) -->
<!-- 13-schedule + 14-reports + 27-login + 16-workshift 평면 패턴 일관 — 17-annual-plan/ 직속에 위치 -->

W2 → cha-bio-safety/docs/redesign-context/17-annual-plan/sketch-wave-2-chrome.html
W3 → cha-bio-safety/docs/redesign-context/17-annual-plan/sketch-wave-3-preview-calibration.html
W4 → cha-bio-safety/docs/redesign-context/17-annual-plan/sketch-wave-4-download.html
W5 → cha-bio-safety/docs/redesign-context/17-annual-plan/wave-5-tsx-conversion-checklist.md (markdown, sketch 아님)

(주의: planner 가 인벤토리 실측 후 4 sub-wave 분배는 "옵션 C — 캘리브 시스템 독립 wave" 채택. 캘리브 좌표 시스템 (15-daily-report SW3 precedent 와 유사) 이 페이지 핵심 동작이고 시각 디자인 영향이 크기 때문에 W3 단독 wave 로 분리. label 이 바뀌더라도 4-wave 개수와 sketch-wave-N-{slug}.html (W2~W4) + wave-5-tsx-conversion-checklist.md (W5) 평면 패턴은 유지.)

# 비즈 로직 시그니처 (W5 TSX 보존 checklist 의 anchor — 이 인덱스가 §1 + §6 에서 인용)
- generateAnnualPlan(returnBlob?: boolean): Promise<Blob | void>  // direct import (dynamic import 아님)
- STORAGE_KEY = 'annual_plan_year_pos'  // localStorage key
- FINGER_OFFSET = 60  // TouchEvent 좌표 보정 px
- loadPos(): { x: number, y: number } | null  // try/catch JSON.parse fallback null
- handleImageClick(e: React.MouseEvent<HTMLImageElement>): void  // getBoundingClientRect + % 계산 + localStorage.setItem + setCalibMode(false) + toast
- handleImageTouch(e: React.TouchEvent<HTMLImageElement>): void  // FINGER_OFFSET 60px 보정 + 동일 흐름
- handleDownload(): Promise<void>  // generateAnnualPlan() + toast (success/error)
- useIsDesktop(): boolean  // ≥768px 분기
- nextYear = new Date().getFullYear() + 1
- yearPos overlay style: fontSize:'min(1.4vw, 16px)', fontFamily:'Malgun Gothic, 맑은 고딕, sans-serif' (엑셀 표지 시각 일치)
- preview 자산 경로: '/templates/preview/annual-plan.png'
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: wave-1-index.md 작성</name>
  <files>cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md</files>
  <action>
AnnualPlanPage.tsx (225 라인) 와 generateAnnualPlan.ts / 17-annual-plan.md / design-system.md / inspection-modal-chrome-rules.md 를 모두 끝까지 읽은 뒤 아래 7개 섹션을 가진 단일 markdown 파일을 작성한다. 파일은 Write 도구로 생성한다 (heredoc/cat 금지).

---

# 파일 헤더

상단에 다음 1블록:
- 제목: `# redesign/17-annual-plan — sketch wave 1 (index)`
- 1-2줄 설명: 본 문서는 W2~W5 진입의 단일 진입점이며, 이 인덱스만 봐도 후속 wave 가 디자인 룰 / 메모리 룰 / sub-wave 분배 / OQ 를 알 수 있도록 한다.
- 산출일자: 2026-05-21 / Quick ID 260521-wmq / branch redesign/17-annual-plan
- 1줄 메타: "27-login W1 (260521-c6p) + 16-workshift W1 (260521-sjj) 의 7 섹션 + 4 sub-wave 구조를 정확히 mirror. AnnualPlanPage 가 225 lines 단순 페이지 + 캘리브 좌표 시스템 (15-daily-report SW3 precedent 와 유사) 이라 4 sub-wave (W2~W5) 채택. 캘리브 좌표 시스템은 W3 단독 wave."

---

# §1. AnnualPlanPage.tsx 인벤토리

AnnualPlanPage.tsx 의 element 를 4 영역 (공통 hook/state/handler + 상수 / 공통 previewImage element / 데스크톱 분기 / 모바일 분기) 으로 나눠 표로 정리. 각 행은 (영역 / element / source line 범위 / 역할 / 비즈 로직 연결 / 후속 wave 매핑) 6 컬럼.

**AnnualPlanPage 의 구조 특이성** (인벤토리 머리말로 1단락):
- 모바일/데스크톱 분기 via `useIsDesktop()` (≥768px, line 5/16)
- previewImage 가 공통 inner element (line 61~103) — 모바일/데스크톱 둘 다 wrapping 만 다르고 내용은 동일
- **캘리브 좌표 시스템** (line 7~8 상수 + line 35~59 handlers + line 78~89 오버레이) — yearPos `{x, y} | null` % 좌표를 localStorage 영구 저장. handleImageClick (마우스) / handleImageTouch (터치, FINGER_OFFSET=60px 보정) 두 흐름. 15-daily-report SW3 의 portraitPos 패턴과 유사 → memory `project_redesign_15_daily_report_status` 의 좌표 시스템 보존 룰 동일 적용.
- nextYear = new Date().getFullYear() + 1 (line 21) — 다음 해 자동 계산
- 데스크톱은 글로벌 AppHeader 사용 (App.tsx line 109 코멘트 "페이지 제목은 App.tsx 헤더에서 표시") — `/annual-plan` 가 `DESKTOP_HEADER_HIDE_PATHS` **미등재** + `PAGE_TITLES` 등재 (line 99 '연간 업무 추진 계획')
- 모바일은 자체 헤더 렌더 (line 169~192) — back button + 타이틀 + 위치조정 토글
- preview 자산: `/templates/preview/annual-plan.png` (외부 PNG)
- 연도 오버레이 폰트: `Malgun Gothic, 맑은 고딕, sans-serif` — 엑셀 표지 시각 일치 (memory 박제 룰)

**영역 1: 공통 hook + state + handler + 상수** (line 1~59)
- imports (line 1~5): useState/useRef / useNavigate / toast / generateAnnualPlan / useIsDesktop
- 상수 (line 7~8): STORAGE_KEY = 'annual_plan_year_pos', FINGER_OFFSET = 60
- loadPos helper (line 10~12): try/catch JSON.parse fallback null
- 함수 본체 시작 + state 3 + ref 1 (line 14~21): navigate / isDesktop / loading / calibMode / yearPos / imgRef / nextYear
- handleDownload (line 23~33): setLoading true → generateAnnualPlan() → toast success/error → setLoading false
- handleImageClick (line 35~45): calibMode 가드 → getBoundingClientRect → % 좌표 계산 → setYearPos + localStorage.setItem + setCalibMode(false) + toast
- handleImageTouch (line 47~59): calibMode 가드 → preventDefault → touch.clientY 에서 FINGER_OFFSET 60px 차감 → 동일 흐름
- 비즈: generateAnnualPlan / localStorage / useIsDesktop / 캘리브 좌표 시스템 전체
- 후속 wave: **무관** (비즈 로직 전부 보존, W5 checklist 에서 확인)

**영역 2: 공통 previewImage element** (line 61~103)
- 외곽 div (line 62): position:relative, width 100%, height 100%
- img element (line 63~76): ref={imgRef}, src `/templates/preview/annual-plan.png`, alt verbatim, onClick / onTouchStart 핸들러, style — width/height 100% objectFit contain, borderRadius 8, **border 분기** (calibMode 면 `2px solid var(--acl)` / 평시 `1px solid var(--bd)`), background #fff, **cursor 분기** (calibMode 면 crosshair / 평시 default)
- 연도 오버레이 (line 78~89, yearPos 가 있을 때만): position absolute, top/left `${yearPos.y}% / ${yearPos.x}%`, transform translate(-50%,-50%), fontSize `'min(1.4vw, 16px)'`, fontWeight 700, color #000, fontFamily `'Malgun Gothic, 맑은 고딕, sans-serif'`, pointerEvents none → `{nextYear}` 표시
- 캘리브 안내 칩 (line 91~101, calibMode 가 true 일 때만): position absolute top:8, left 50% transform translateX(-50%), background `rgba(59,130,246,0.9)`, color #fff, padding `6px 16px`, borderRadius 8, fontSize 12 fontWeight 700, whiteSpace nowrap, pointerEvents none → '연도가 들어갈 위치를 클릭하세요'
- 비즈: imgRef / yearPos overlay 좌표 계산식 / handleImageClick / handleImageTouch / calibMode 분기
- 후속 wave: **W3** (preview + 캘리브 시스템 독립 wave — 옵션 C 채택)

**영역 3: 데스크톱 분기** (line 106~163)
- 외곽 (line 108): width 100%, height 100%, flex column, overflow hidden
- **상단 바** (line 110~146): flexShrink 0, padding `14px 28px`, flex align center gap 12, borderBottom `1px solid var(--bd)` — 페이지 제목은 글로벌 AppHeader 가 표시 (line 109 코멘트)
  - 설명 div (line 115~117): flex 1, fontSize 12 var(--t3) — '대상 연도 {nextYear}년 — 표지 및 일정표 연도가 자동 설정됩니다.' (strong: var(--t1) fontWeight 700)
  - **위치조정 토글 버튼** (line 118~129): padding `8px 14px` radius 8, **border/bg/color 분기** (calibMode 면 `1px solid var(--acl)` + `rgba(59,130,246,0.1)` + var(--acl) / 평시 `1px solid var(--bd2)` + var(--bg3) + var(--t2)), fontSize 12 fontWeight 700 — '취소' / '위치 조정'
  - **다운로드 버튼** (line 130~145): padding `8px 20px` radius 8 borderNone, **background 분기** (loading 면 var(--bg3) / 평시 `linear-gradient(135deg,#1e40af,#3b82f6)`), color 분기 (loading 면 var(--t3) / 평시 #fff), fontSize 13 fontWeight 700, flex align center gap 8 — 내부 svg 다운로드 아이콘 (line 141~143, width 15 height 15, viewBox 0 0 24 24, path d "M12 5v14m0 0l-4-4m4 4l4-4M4 19h16") + 텍스트 '엑셀 다운로드' / '생성 중...'
- **하단 미리보기** (line 149~161): flex 1, minHeight 0, overflow hidden, flex center, padding 24, background var(--bg) — 내부 wrapper width/height 100%, maxWidth `'calc((100vh - 140px) * 1.414)'` (A4 비율 1:1.414), maxHeight 100% → {previewImage} 렌더
- 비즈: handleDownload / setCalibMode / calibMode 분기 / loading 분기 / nextYear / useIsDesktop true 분기
- 후속 wave: **W2 (상단 바 chrome) + W3 (previewImage 영역) + W4 (다운로드 버튼 + 설명)** — 데스크톱 wrapper 는 W2 chrome 묶음에 포함, preview 는 W3, 다운로드/설명 텍스트는 W4

**영역 4: 모바일 분기** (line 167~224)
- 외곽 (line 168): width 100% height 100% flex column overflow hidden, background var(--bg)
- **헤더** (line 169~192): flexShrink 0, background var(--bg2), borderBottom `1px solid var(--bd)`, padding `8px 12px 9px`, flex align center gap 8
  - **back button** (line 170~178): 34x34, radius 8, flexShrink 0, background var(--bg3), border `1px solid var(--bd)`, cursor pointer, flex center — 내부 svg ChevronLeft (line 175~177, width 15 height 15, viewBox 0 0 24 24, path d "M15 19l-7-7 7-7") → onClick navigate(-1)
  - **타이틀** span (line 179): flex 1, fontSize 14 fontWeight 700 var(--t1) — '연간 업무 추진 계획'
  - **위치조정 토글 버튼** (line 180~191): padding `6px 10px` radius 8, **분기** (calibMode 면 `1px solid var(--acl)` + `rgba(59,130,246,0.1)` + var(--acl) / 평시 `1px solid var(--bd2)` + var(--bg3) + var(--t2)), fontSize **11** fontWeight 700 — '취소' / '위치 조정'
- **본문** (line 194~222): flex 1, overflow auto, padding 16, flex column gap 16
  - **미리보기 wrapper** (line 195~198): width 100% → {previewImage} 렌더
  - **설명 + 다운로드 wrapper** (line 200~221): textAlign center
    - 설명 div (line 202~204): fontSize **13** color var(--t3) marginBottom 12 — '표지 및 일정표 연도가 {nextYear}년으로 자동 설정됩니다.'
    - **다운로드 버튼** (line 205~220): width 100% padding 14 radius 10 borderNone, background 분기 (loading 면 var(--bg3) / 평시 `linear-gradient(135deg,#1e40af,#3b82f6)`), color 분기, fontSize **14** fontWeight 700, flex center gap 8 — 내부 svg 다운로드 아이콘 (line 216~218, width 16 height 16, 동일 path) + 텍스트
- 비즈: navigate(-1) / handleDownload / setCalibMode / calibMode 분기 / loading 분기 / nextYear / useIsDesktop false 분기
- 후속 wave: **W2 (모바일 헤더 chrome) + W3 (previewImage 영역) + W4 (다운로드 버튼 + 설명)** — 데스크톱과 동일 분배 룰

인벤토리 작성 시 line 추정치는 실측 우선. 225 lines 와 일치 1줄 명시 (불일치 시 차이 보고).

**캘리브 좌표 시스템 보존 시그니처 (별도 박스):**
```
- STORAGE_KEY = 'annual_plan_year_pos'  (localStorage key — 변경 금지)
- FINGER_OFFSET = 60                    (TouchEvent y 보정 px — 변경 금지)
- yearPos: { x: number, y: number } | null  (% 좌표, 100 기준)
- handleImageClick: getBoundingClientRect → % 계산 → localStorage.setItem → setCalibMode(false)
- handleImageTouch: touch.clientY - FINGER_OFFSET 보정 → 동일 흐름
- 오버레이 inline style: fontSize:'min(1.4vw, 16px)', fontFamily:'Malgun Gothic, 맑은 고딕, sans-serif'
- preview 자산: '/templates/preview/annual-plan.png'
```
위 모든 식별자/값은 W5 TSX 변환 시 1 byte 변경 금지 (15-daily-report SW3 portraitPos 보존 룰 동일 적용).

---

# §2. 4 sub-wave 분배 plan

다음 표 그대로 박제 (단, 파일명은 위 <interfaces> 의 통일된 `sketch-wave-N-{slug}.html` 패턴 사용. 옵션 C — 캘리브 시스템 독립 wave 채택):

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 헤더 + 데스크톱 상단 바 (chrome 통일 검토 — 글로벌 AppHeader 데스크톱 표시 vs 자체 상단 바) | 영역 4 상단 (모바일 헤더 — back button + 타이틀 + 위치조정 토글) + 영역 3 상단 (데스크톱 상단 바 — 설명 + 위치조정 + 다운로드 버튼 자리, 단 다운로드 버튼 자체는 W4 에서 sketch). 모바일/데스크톱 분기 표시 가독 (split panel or annotated). | sketch-wave-2-chrome.html |
| W3 | previewImage + 캘리브 좌표 시스템 (yearPos overlay + 캘리브 모드 분기 + 캘리브 안내 칩) | 영역 2 단독 — img element + 분기 border/cursor + 연도 오버레이 (Malgun Gothic + min(1.4vw,16px)) + 캘리브 안내 칩 (rgba(59,130,246,0.9) + 카피 verbatim). 평시 / 캘리브 모드 / yearPos null / yearPos 저장후 4가지 상태 매트릭스. | sketch-wave-3-preview-calibration.html |
| W4 | 다운로드 버튼 + 설명 (모바일/데스크톱 두 분기 모두) | 영역 3 다운로드 버튼 (line 130~145, 그라데이션 + 아이콘 + 텍스트) + 영역 4 본문 설명/다운로드 (line 200~221, 모바일 full-width 14px padding 14 radius 10). loading 분기 / disabled 분기. | sketch-wave-4-download.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + AnnualPlanPage.tsx 비즈 로직 보존 룰 + 캘리브 좌표 시스템 1 byte 변경 금지 checklist + Tailwind cheatsheet | wave-5-tsx-conversion-checklist.md |

각 wave 행 아래에 boldface "보존 / 토큰 / 폰트" 3 미니 섹션:
- **보존**: 변환 후 보존해야 할 비즈 로직 호출 —
  - W2: navigate(-1) / setCalibMode 토글 / calibMode 분기 (`1px solid var(--acl)` + `rgba(59,130,246,0.1)` + var(--acl)) / 모바일 헤더 카피 '연간 업무 추진 계획' verbatim / 토글 카피 '취소' / '위치 조정' verbatim / useIsDesktop 분기 verbatim
  - W3: imgRef / handleImageClick / handleImageTouch / FINGER_OFFSET=60 / STORAGE_KEY='annual_plan_year_pos' / yearPos 좌표 계산식 (rect 기준 %) / 오버레이 inline style fontSize:'min(1.4vw, 16px)' + fontFamily:'Malgun Gothic, 맑은 고딕, sans-serif' / preview 자산 경로 '/templates/preview/annual-plan.png' / 캘리브 안내 칩 카피 '연도가 들어갈 위치를 클릭하세요' verbatim / nextYear 계산식 (new Date().getFullYear() + 1) — **모두 1 byte 변경 금지** (15-daily-report SW3 precedent)
  - W4: handleDownload / generateAnnualPlan() direct import (dynamic import 아님) / loading 분기 (`var(--bg3)` / 그라데이션) / disabled+loading 분기 / 카피 verbatim ('엑셀 다운로드' / '생성 중...' / '표지 및 일정표 연도가 {nextYear}년으로 자동 설정됩니다.' / '엑셀이 다운로드됐습니다' / '생성 중 오류') / svg path d "M12 5v14m0 0l-4-4m4 4l4-4M4 19h16" verbatim (또는 Lucide Download 교체 — OQ #4)
  - W5: 위 모든 항목의 TSX 보존 checklist + 캘리브 좌표 시스템 시그니처 무변 verify (grep gate)
- **토큰**: 적용할 디자인 토큰 —
  - W2: bg-surface-raised (헤더 var(--bg2)) / border-border-default (var(--bd)) / border-border-strong (var(--bd2) — 토글 평시 border) / text-text-primary / text-text-secondary / text-text-tertiary / border-accent + bg-accent/10 + text-accent (토글 active — OQ #2 default)
  - W3: border-accent (calibMode `var(--acl)`) / border-border-default (평시 var(--bd)) — preview border 토큰화. **rgba(59,130,246,0.9) 캘리브 안내 칩 + Malgun Gothic 폰트 + min(1.4vw, 16px) overlay 폰트사이즈는 인라인 유지** (OQ #5 default — 엑셀 표지 일치성).
  - W4: bg-safe-bar (다운로드 그라데이션 → solid OK — OQ #1 default) / bg-surface-sunken (loading 상태 var(--bg3)) / text-text-tertiary (loading text) / text-text-on-accent (#fff)
  - **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern`).
- **폰트**: 모바일/데스크톱 동일 폰트 룰 (design-system §1.3). 본문 16px 마지노선, 9~11px 금지 (§1.1). 현재 AnnualPlanPage 의 fontSize:
  - 11 (모바일 위치조정 토글, line 187) — §1.1 위반 → text-caption(12) leading-none 격상
  - 12 (데스크톱 설명 line 115, 데스크톱 위치조정 line 125, 캘리브 안내 칩 line 96) — §1.1 마지노선 12px → text-caption leading-none 유지
  - 13 (모바일 설명 line 202, 데스크톱 다운로드 line 137) — text-label
  - 14 (모바일 헤더 타이틀 line 179, 모바일 다운로드 line 212) — text-body-sm. 모바일 헤더는 16 격상 후보 (text-body fontWeight 700) — OQ #3
  - 'min(1.4vw, 16px)' (연도 오버레이 line 83) — **유지** (엑셀 표지 일치성, 캘리브 좌표 시스템 일부)

---

# §3. design-system.md 인용 (verbatim 발췌, fence 안)

design-system.md (cha-bio-safety/docs/redesign-context/17-annual-plan/design-system.md) 를 읽고 아래 항목을 각각 별도의 ```fence 블록``` 안에 **원문 그대로** 박제 (불가피한 줄바꿈 제외 정확히 일치):

- §1.1 노안 친화 (본문 16px, 9~11px 금지, 터치 44px)
- §1.2 정보 인지 > 미적 정제
- §1.3 모바일/데스크톱 동일 폰트
- §6 Progress Color Rule → fence 인용 후 1줄 메타: "§6 미적용 — 연간 업무 추진 계획 페이지에는 진척률 도넛/카테고리 카드 없음."
- §7 Stat Card → fence 인용 후 1줄 메타: "§7 미적용 — 연간 업무 추진 계획 페이지에는 통계 숫자 카드 없음."
- §7.1 Iconography (Lucide) — fence 인용 후 1줄 메타: "§7.1 — Lucide 사용 가능. 현재 모바일 헤더 back button 의 커스텀 SVG ChevronLeft (line 175~177) → Lucide `ChevronLeft size={15}` 교체 후보. 다운로드 버튼 SVG (line 141~143, 216~218) → Lucide `Download size={15/16}` 교체 후보. 둘 다 W2/W4 sketch 진입 시 결정 (§7 OQ #4). 단 캘리브 안내 칩 / 연도 오버레이는 아이콘 없음."

만약 design-system.md 안 섹션 번호/제목이 실제 다르면 실제 파일 기준 §번호 맞춰 인용하고 1줄 메타에서 차이 명시.

추가:
- 기존 디자인 = 다운로드 버튼 `linear-gradient(135deg,#1e40af,#3b82f6)` (line 135, 210) → `bg-safe-bar` solid 통일 검토 — **default OK**. 근거: 27-login W1 OQ #1 default OK (그라데이션 → solid) + 14-reports W1 OQ #1/#3 default OK + 16-workshift W1 OQ #1 default OK 일관 + design-system §6.4 CTA solid 룰 + memory `feedback_design_sketch_first` + `feedback_tailwind_token_class_pattern`. 이 결정은 §7 OQ #1 에서 사용자 컨펌 받음.

---

# §4. 02+06 chrome 통일 룰 적용 여부

`inspection-modal-chrome-rules.md` 를 읽고 1~2 단락으로 작성:

- 17-annual-plan 페이지는 점검 페이지 시리즈가 아닌 **연간 업무 추진 계획 (엑셀 출력) 페이지** → chrome 룰 자체는 **직접 적용 X**
- 단, 다음 3가지 패턴은 mirror 검토:
  1. **헤더 배경 토큰** — 모바일 자체 헤더 현재 `var(--bg2)` (--surface-raised). chrome 룰 §2.1 의 `bg-surface-page` 통일 룰 vs raised 유지. **default: raised 유지** (16-workshift W1 OQ #2 LOCKED + 02 InspectionPage 일관). 데스크톱은 자체 상단 바 (line 110~146) — borderBottom 1px solid var(--bd) 단독, 글로벌 AppHeader 가 페이지 제목 표시 (line 109 코멘트). §7 OQ 후보 아님.
  2. **back button 패턴** — 모바일만 (line 170~178), 34x34 var(--bg3) + 커스텀 SVG ChevronLeft. chrome 룰 §7.2 의 `w-8 h-8 bg-surface-sunken border-border-default` 패턴 + memory `feedback_tailwind_w8_h8_is_48px` 룰 (w-8=48 함정 — tailwind config spacing override) 적용. 데스크톱은 글로벌 AppHeader 가 처리 (back button 자체 추가 불필요).
  3. **BottomNav 숨김 / AppHeader 표시** — App.tsx 실측: `/annual-plan` 가 `MOBILE_NO_NAV_PATHS` (line 71) 등재 → 모바일 BottomNav **숨김**. `DESKTOP_NO_NAV_PATHS` (line 74) 에는 **미등재** → 데스크톱 BottomNav **표시**. `DESKTOP_HEADER_HIDE_PATHS` (line 77) 에는 **미등재** → 데스크톱 글로벌 AppHeader **표시** (line 109 코멘트 일관). `PAGE_TITLES` (line 99) 등재 → 글로벌 AppHeader 가 '연간 업무 추진 계획' 타이틀 렌더.

**실측 결과 (App.tsx 본문 grep):**
```
line 71: MOBILE_NO_NAV_PATHS = [..., '/annual-plan']
line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']  // /annual-plan 미등재 → 데스크톱 BottomNav 표시
line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']  // /annual-plan 미등재 → 데스크톱 글로벌 AppHeader 표시
line 99: '/annual-plan': '연간 업무 추진 계획'  // PAGE_TITLES 등재
line 292: <Route path="/annual-plan" element={<Auth><AnnualPlanPage /></Auth>} />
```

핵심 시사점:
- 모바일: 자체 헤더만 (line 169~192), BottomNav 숨김 → sketch 시 nav placeholder 그릴 필요 없음
- 데스크톱: **글로벌 AppHeader 표시** + 자체 상단 바 (line 110~146) **둘 다** + BottomNav 표시 → sketch 시 데스크톱 시안 상단에 글로벌 AppHeader 영역 + 자체 상단 바 영역 + 하단 BottomNav 영역 모두 인지 필요. 16-workshift 와 다른 점 = 16-workshift 는 자체 헤더 단독 (글로벌 AppHeader 숨김), 17-annual-plan 은 글로벌 + 자체 상단 바 둘 다 표시.

---

# §5. 메모리 룰 inline 인용 (verbatim)

아래 12개 룰을 **각각 별도 미니 카드**로 박제. 각 카드 포맷 (boldface 라벨):

```
### 룰 N — {룰 슬러그}
- **요약**: 1줄
- **Why**: 1줄
- **How to apply (17-annual-plan)**: 1줄
```

12개 룰 (27-login W1 + 16-workshift W1 의 10개 + AnnualPlanPage 특화 2개):
1. `feedback_design_sketch_first` — spacing/sizing 도 sketch HTML 시안 먼저
2. `feedback_redesign_sketch_rule_enforcement` — §6.2 negative rule / §6.3 §7.1 일관성
3. `feedback_sketch_realistic_data` — 표시 분기/라벨 룰 verbatim, 시각 디자인만
4. `feedback_planner_prompt_sketch_verbatim` — sketch CSS grep 추출, 추측 X
5. `feedback_tailwind_token_class_pattern` — status- prefix 없음
6. `feedback_tailwind_w8_h8_is_48px` — w-8=48 / w-7=32 함정
7. `feedback_text_caption_leading_none` — 작은 컨테이너 leading-none
8. `feedback_tsx_wave_emoji_dot_gap` — 이모지 제거 + dot span 추가
9. `feedback_tsx_wave_stat_card_drift` — Stat Card §6.3 룰 verbatim
10. `feedback_avoid_premature_confirmation` — "거의 일치" 자신감 표현 금지
11. `feedback_pdflib_subset_false` — ★ AnnualPlanPage 특화 — generateAnnualPlan 이 xlsx-js-style 사용 (pdf-lib 무관) 하지만 폰트 임베딩 일반 룰 인용. 엑셀 표지 'Malgun Gothic' 글꼴 일관 + 연도 오버레이 동일 폰트 패밀리 보존 룰.
12. `project_redesign_15_daily_report_status` — ★ AnnualPlanPage 특화 — 캘리브 좌표 시스템 보존 precedent. yearPos % 좌표 + localStorage 영구 저장 + handleImageClick/Touch + FINGER_OFFSET 60px 보정 모두 15-daily-report SW3 portraitPos 패턴과 동일 → **시그니처/식별자/값 1 byte 변경 금지** 룰 적용.

각 룰의 Why/How 는 AnnualPlanPage 의 실제 element/상황으로 구체화. 예시 (각 룰 작성 시 참고, 그대로 박제 가능):
- **룰 1** (sketch first) — "W3 캘리브 안내 칩 크기 (현재 padding `6px 16px` radius 8 fontSize 12) / W4 다운로드 버튼 크기 (모바일 padding 14 radius 10 / 데스크톱 padding `8px 20px` radius 8) 조정도 spacing 손볼 거 있으면 sketch 먼저 보여주고 컨펌."
- **룰 2** (negative rule) — "위치조정 토글 active 색 (`var(--acl)` + `rgba(59,130,246,0.1)`) 은 status 임계치 색이 아니라 accent (모드 분기 강조) — `bg-status-safe-bg` 같은 위험 색 사용 금지."
- **룰 3** (realistic data) — "카피 verbatim — '연간 업무 추진 계획' (모바일 타이틀), '위치 조정' / '취소' (토글), '연도가 들어갈 위치를 클릭하세요' (캘리브 안내 칩), '엑셀 다운로드' / '생성 중...' (다운로드 버튼), '표지 및 일정표 연도가 {nextYear}년으로 자동 설정됩니다.' (모바일 설명), '대상 연도 {nextYear}년 — 표지 및 일정표 연도가 자동 설정됩니다.' (데스크톱 설명). 시안에서 변경 금지."
- **룰 4** (verbatim grep) — "W5 TSX 변환 wave 진입 시 sketch HTML 의 CSS 정의 (예: 캘리브 안내 칩 `background:rgba(59,130,246,0.9)`, 연도 오버레이 `fontSize:'min(1.4vw, 16px)'`, A4 비율 `maxWidth:'calc((100vh - 140px) * 1.414)'`) 를 grep 으로 추출해 그대로 인용. 추측 토큰명 사용 시 deviation 유발."
- **룰 5** (token class pattern) — "다운로드 버튼 그라데이션 → `bg-safe-bar` solid 치환. `bg-status-safe-bar` (status- prefix) 사용 시 W5 verify FAIL."
- **룰 6** (w-8=48px) — "모바일 back button 현재 34x34 (line 171). tailwind config spacing override 로 w-8=48 (1.5배), w-9=44, w-[34px] 명시 또는 w-9(44) 검토. 다운로드 버튼 모바일 padding 14 도 동일 함정 인지 필요."
- **룰 7** (leading-none) — "모바일 위치조정 토글 fontSize 11 (line 187) / 데스크톱 위치조정/설명 fontSize 12 (line 115/125) / 캘리브 안내 칩 fontSize 12 (line 96) — 작은 컨테이너 안에서 시각 패딩 유발. leading-none 명시 검토."
- **룰 8** (dot gap) — "AnnualPlanPage 본문에는 이모지 없음 → 적용 무관. 단 W5 진입 시 sketch HTML 에 이모지/dot span 추가/제거 분기 negative gate 유지."
- **룰 9** (Stat Card drift) — "연간 업무 추진 계획 페이지에 Stat Card 없음 → 미적용. 단 sketch 새 패턴 (예: 캘리브 모드 분기 매트릭스 — 평시/캘리브/yearPos null/저장후 4 state) 은 W5 진입 시 verbatim 인용 필수."
- **룰 10** (premature confirmation) — "W2~W4 sketch 산출 후 '거의 일치 / 잘 됐다' 자신감 표현 금지. 결과 보여주고 사용자 판단."
- **룰 11** (pdf-lib subset:false 일반화) — "AnnualPlanPage 가 generateAnnualPlan (xlsx-js-style) 호출. xlsx-js-style 은 pdf-lib subset 함정 무관하지만, **연도 오버레이 fontFamily 'Malgun Gothic, 맑은 고딕, sans-serif' 는 엑셀 표지 글꼴 일치성**을 위해 1 byte 변경 금지. 폰트 패밀리 = 출력물 시각 anchor 룰 (pdf-lib subset 룰의 일반화)."
- **룰 12** (15-daily-report 좌표 시스템 precedent) — "yearPos (캘리브 좌표 시스템) 보존 1 byte 룰. STORAGE_KEY = 'annual_plan_year_pos' / FINGER_OFFSET = 60 / handleImageClick (getBoundingClientRect → %) / handleImageTouch (FINGER_OFFSET 60px 보정) / 오버레이 좌표 계산식 (top:${y}% left:${x}% transform:translate(-50%,-50%)) / preview 자산 경로 '/templates/preview/annual-plan.png' 모두 변경 금지. 15-daily-report SW3 의 portraitPos 보존 룰 (precedent) 동일 적용."

---

# §6. negative rule (이 wave 에서 금지된 것)

bullet list:
- sketch HTML 생성 금지 (wave 2 부터)
- AnnualPlanPage.tsx / generateAnnualPlan.ts 코드 수정 금지 (이 wave 의 산출물은 markdown 1개)
- 비즈 로직 시그니처 변경 금지 — generateAnnualPlan / useIsDesktop / handleDownload / handleImageClick / handleImageTouch / loadPos 모두 import/export 동일하게 유지
- 다른 페이지 (13-schedule, 14-reports, 27-login, 16-workshift 등) 영향 금지
- **wrangler 명령 금지** (CLAUDE.local.md 룰 — `.claude/settings.local.json` deny 강제, memory `feedback_cbc7119_design_never_wrangler`)
- **`npm run deploy` 금지** (CLAUDE.local.md 룰 — 직원 도메인 경로)
- 13-schedule + 14-reports + 27-login + 16-workshift 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지 (sketch/ 서브폴더 X — 17-annual-plan/ 직속에 평면 배치)
- App.tsx 미수정 — MOBILE_NO_NAV_PATHS / DESKTOP_NO_NAV_PATHS / DESKTOP_HEADER_HIDE_PATHS / PAGE_TITLES / Route 등재 상태 유지
- **캘리브 좌표 시스템 시그니처 변경 금지** — FINGER_OFFSET=60 / STORAGE_KEY='annual_plan_year_pos' / handleImageClick / handleImageTouch / yearPos overlay 좌표 계산식 모두 1 byte 변경 금지 (memory `project_redesign_15_daily_report_status` 룰 적용)
- preview 자산 경로 `/templates/preview/annual-plan.png` 변경 금지
- 연도 오버레이 `Malgun Gothic, 맑은 고딕, sans-serif` 폰트 패밀리 보존 (엑셀 표지 시각 일치)

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

bullet list 5건:

- **OQ #1**: 다운로드 버튼 `linear-gradient(135deg,#1e40af,#3b82f6)` (line 135 / line 210) → `bg-safe-bar` solid 통일 OK?
  - default 답: **OK** (27-login W1 OQ #1 + 14-reports W1 OQ #1/#3 + 16-workshift W1 OQ #1 default OK 일관 + design-system §6.4 CTA solid 룰)

- **OQ #2**: 위치조정 토글 active 색 (현재 `border: 1px solid var(--acl)` + `background: rgba(59,130,246,0.1)` + `color: var(--acl)` — line 122~124 / 184~186) → 디자인 토큰화 (`border-accent` + `bg-accent/10` + `text-accent`) vs 인라인 유지?
  - default 답: **토큰 치환 OK** (`border-accent` + `bg-accent/10` + `text-accent`, status- prefix 없음 룰 — 16-workshift W1 OQ #5 today border 토큰화 일관)

- **OQ #3**: 폰트 격상 매핑 — 현재 fontSize:11 (모바일 위치조정 토글 line 187) / 12 (데스크톱 설명 line 115, 데스크톱 위치조정 line 125, 캘리브 안내 칩 line 96) / 13 (모바일 설명 line 202, 데스크톱 다운로드 line 137) / 14 (모바일 헤더 line 179, 모바일 다운로드 line 212) / 'min(1.4vw, 16px)' (연도 오버레이 line 83). §1.1 11px 위반. 어디까지 격상?
  - default 답: **부분 절충** — fontSize:11 → text-caption(12) leading-none 격상 / fontSize:12 → text-caption leading-none 유지 (캘리브 안내 칩 / 데스크톱 설명/토글 dense layout) / fontSize:13 → text-label / fontSize:14 (모바일 헤더 / 다운로드 버튼) → text-body(16) fontWeight 700 격상 (노안 친화 강화) / **연도 오버레이 'min(1.4vw, 16px)' 유지** (엑셀 표지 시각 일치, 캘리브 좌표 시스템 일부 — 변경 금지). 16-workshift W1 OQ #3 부분 절충 패턴 mirror.

- **OQ #4**: 아이콘 Lucide 교체 —
  - (a) 모바일 헤더 back button 커스텀 SVG ChevronLeft (line 175~177) → Lucide `ChevronLeft size={15}` 교체?
  - (b) 다운로드 버튼 커스텀 SVG (line 141~143 데스크톱 size 15, line 216~218 모바일 size 16) → Lucide `Download` 교체?
  - default 답: **(a) + (b) 모두 교체 OK** (16-workshift W1 OQ #2 ChevronLeft Lucide 교체 일관 + design-system §7.1 Lucide 사용 가능 룰). 단 svg size 는 line 별 (15 / 16) 유지.

- **OQ #5**: 캘리브 안내 칩 `background: rgba(59,130,246,0.9)` (line 94) + 캘리브 모드 미리보기 border `var(--acl)` (line 72) — 디자인 토큰 치환?
  - default 답: **부분 토큰** — preview border (`2px solid var(--acl)`) → `border-accent` 토큰 치환 OK. **캘리브 안내 칩 background `rgba(59,130,246,0.9)` 는 인라인 유지** (캘리브 모드 일시 표시용 — 토큰 정의 비용 vs 1줄 인라인 trade-off, 16-workshift W1 OQ #4 SHIFT_COLOR hex+22 인라인 유지 일관). 안내 칩 color #fff + fontWeight 700 + whiteSpace nowrap + pointerEvents none 유지.

각 OQ 아래에 "default 답" 1줄 (사용자가 별 의견 없으면 이 답으로 진행할 것이라는 reasonable call). 단, "approved" 받기 전까지 W2 진입 금지.

---

작성 완료 후 자체 verify:
1. 7개 섹션 모두 존재 (§1~§7) — grep `^# §[1-7]` 카운트 = 7
2. 메모리 룰 12개 인용 — 각 룰 슬러그 `feedback_*` (10개) + `project_*` (1개) 가 본문에 등장하는지 unique grep 카운트 ≥ 10 (실제 11개 슬러그 — `feedback_pdflib_subset_false` 가 11번째, `project_redesign_15_daily_report_status` 가 12번째)
3. sub-wave 분배 표가 W2~W5 4행 — 표 안에 `| W[2-5] |` 카운트 ≥ 4 (정확히 4)
4. design-system 인용 fence 가 최소 3개 (§1.1 / §1.2 / §1.3 필수) — fence 카운트 ≥ 6 (open+close)
5. negative rule 안 `wrangler` + `npm run deploy` 키워드 모두 등장 (≥1 each)
6. OQ 5건 — `OQ #` 카운트 ≥ 5
7. AnnualPlanPage.tsx + generateAnnualPlan.ts 변경 0 — `git diff --name-only HEAD -- {파일}` 가 빈 출력
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md && \
echo "--- section count (expect 7) ---" && \
grep -c '^# §[1-7]' cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md && \
echo "--- subwave rows W2~W5 (expect 4) ---" && \
grep -E '^\| W[2-5] \|' cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md | wc -l && \
echo "--- memory rules unique (expect >=10) ---" && \
grep -oE 'feedback_[a-z_]+' cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md | sort -u | wc -l && \
echo "--- OQ items #1~#5 (expect >=5) ---" && \
grep -cE 'OQ #[1-5]' cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md && \
echo "--- fence count (expect >=6) ---" && \
grep -c '^```' cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md && \
echo "--- wrangler keyword in negative rule (expect >=1) ---" && \
grep -c 'wrangler' cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md && \
echo "--- npm run deploy keyword (expect >=1) ---" && \
grep -c 'npm run deploy' cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md && \
echo "--- AnnualPlanPage.tsx + generateAnnualPlan.ts unchanged (expect 0) ---" && \
git diff --name-only HEAD -- cha-bio-safety/src/pages/AnnualPlanPage.tsx cha-bio-safety/src/utils/generateAnnualPlan.ts | wc -l</automated>
  </verify>
  <done>
- `cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md` 파일 존재 (sketch/ 서브폴더 X — 17-annual-plan/ 직속)
- 7개 섹션 (§1~§7) 모두 존재, grep 결과 = 7
- §2 sub-wave 표가 W2~W5 4행 모두 포함 (정확히 4)
- §1 인벤토리에 4 영역 (공통 hook/state/handler + 상수 / 공통 previewImage element / 데스크톱 분기 / 모바일 분기) 모두 포함 + 캘리브 좌표 시스템 보존 시그니처 별도 박스 포함
- 메모리 룰 12개 (`feedback_*` 10개 + `feedback_pdflib_subset_false` + `project_redesign_15_daily_report_status`) 모두 inline 인용, unique feedback_ count ≥ 10
- AnnualPlanPage 특화 룰 2건 (pdflib_subset_false 폰트 패밀리 보존 일반화 + 15-daily-report 캘리브 좌표 시스템 precedent) 명시 포함
- design-system.md 인용 fence 최소 3개 (§1.1, §1.2, §1.3 필수)
- §4 에 MOBILE_NO_NAV_PATHS (annual-plan 등재) + DESKTOP_NO_NAV_PATHS (annual-plan 미등재) + DESKTOP_HEADER_HIDE_PATHS (annual-plan 미등재 — 글로벌 AppHeader 데스크톱 표시) + PAGE_TITLES (annual-plan 등재 '연간 업무 추진 계획') + Route 등재 실측 결과 박제
- §6 negative rule 안 `wrangler` 와 `npm run deploy` 키워드 모두 등장 + 캘리브 좌표 시스템 시그니처 변경 금지 / preview PNG 자산 경로 변경 금지 / Malgun Gothic 폰트 패밀리 보존 3건 명시
- §7 OQ 5건 모두 정리, 각각 default 답 1줄 포함 (다운로드 그라데이션 / 위치조정 토글 색 / 폰트 격상 / Lucide 아이콘 / 캘리브 안내 칩 색)
- AnnualPlanPage.tsx + generateAnnualPlan.ts 코드 변경 0 — `git diff --name-only` 모두 빈 출력
- 어떠한 sketch-wave-*.html 도 생성하지 않음 (W2 부터)
  </done>
</task>

</tasks>

<verification>
이 wave 의 verify 는 task 1 의 automated block 으로 충분. 추가 phase-level 검증 없음.

자체 검수 흐름:
1. `git status` — wave-1-index.md 1개 신규, 그 외 변경 0
2. `wc -l cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md` — 합리적 길이 (대략 300~400 줄 예상, AnnualPlanPage 225 lines + 캘리브 좌표 시스템 precedent 박제로 16-workshift W1 와 유사 또는 약간 김)
3. 사용자에게 "wave-1-index.md 작성 완료 / §7 OQ 5건 답변 필요" 보고 후 컨펌 대기 (W2 자동 진입 금지, memory `feedback_avoid_premature_confirmation`)
</verification>

<success_criteria>
- wave-1-index.md 7개 섹션 모두 채워짐 (§1 인벤토리 4영역 + 캘리브 시스템 박스 / §2 sub-wave 분배 4행 / §3 design-system verbatim / §4 chrome 룰 (연간계획 = 점검 시리즈 아님 + 글로벌 AppHeader 데스크톱 표시 실측 박제) / §5 메모리 룰 12개 (10 + AnnualPlanPage 특화 2) / §6 negative 9건 / §7 OQ 5건)
- 코드 변경 0건 (AnnualPlanPage.tsx / generateAnnualPlan.ts untouched)
- sketch HTML 0건 생성 (W2 부터)
- 13-schedule + 14-reports + 27-login + 16-workshift 의 평면 sketch-wave-*.html 패턴 mirror — sketch/ 서브폴더 안 만듦
- 사용자 컨펌 받을 OQ 5건 정리됨 (다운로드 그라데이션 / 위치조정 토글 색 / 폰트 격상 / Lucide 아이콘 / 캘리브 안내 칩 색)
- automated verify 명령이 PASS (section=7 / subwave=4 / rules≥10 / wrangler≥1 / deploy≥1 / OQ≥5 / fence≥6 / src 변경=0)
</success_criteria>

<output>
After completion, return summary to user:
- 생성 파일: `cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md`
- §7 OQ 5건 사용자 컨펌 대기
- W2 진입 = OQ #1 답변 후 (`/clear` + 새 `/gsd:quick` 시작 권장 — memory `feedback_gsd_workflow_strict`)
- 다음 wave 파일명 권장: `sketch-wave-2-chrome.html`
</output>

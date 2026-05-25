---
phase: 260525-uou
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/WorkLogPage.tsx
  - cha-bio-safety/src/styles/components.css
autonomous: true
requirements:
  - REDESIGN-18-W7-TSX-CONVERSION-WORKLOG
must_haves:
  truths:
    - "WorkLogPage 의 모바일/데스크톱 양 분기 외곽 chrome 이 W7 §3 의 sketch class 로 변환되어 cbc7119-preview 에서 W2~W6 sketch 와 시각적으로 동일하다"
    - "WorkLogPortraitPreview 의 내부 캘리브 33 step + WORKLOG_CALIB_KEY + FINGER_OFFSET=60 + WorkLogCalibMarker + 페이지 출력 좌표 시스템은 1 byte 변경되지 않는다 (OQ #5 LOCKED)"
    - "비즈 anchor 18종 (workLogApi / useQuery×2 / useMutation / handleExport / changeMonth / monthPickerRef hack / isAdmin readOnly / 양호·불량 3-state 토글 / fixMethod 'other' maxLength=10 / 카피 verbatim 등) 이 grep PASS 한다"
    - "components.css 가 sketch fence verbatim 으로 신규 ~40 class 추가되어 504 라인에서 ~544+ 라인으로 늘어난다"
    - "tsc --noEmit 0 errors + npm run build PASS"
  artifacts:
    - path: "cha-bio-safety/src/pages/WorkLogPage.tsx"
      provides: "WorkLogPage TSX 변환본 (외곽 chrome sketch class / 내부 캘리브 0 byte)"
      contains: "ChevronLeft, ChevronRight, Save, Download, AlertTriangle"
    - path: "cha-bio-safety/src/styles/components.css"
      provides: "18-worklog 신규 ~40 class (worklog-* prefix) + 기존 14-reports/15-daily-report 14-reports 6 inherit 보존"
      min_lines: 540
  key_links:
    - from: "cha-bio-safety/src/pages/WorkLogPage.tsx"
      to: "cha-bio-safety/src/styles/components.css"
      via: "worklog-* class 호출"
      pattern: "worklog-section-card|worklog-result-toggle|worklog-method-btn|worklog-footer-save|worklog-portrait-wrapper"
    - from: "cha-bio-safety/src/pages/WorkLogPage.tsx"
      to: "lucide-react"
      via: "import named 5종"
      pattern: "import \\{ ChevronLeft, ChevronRight, Save, Download, AlertTriangle \\} from 'lucide-react'"
---

<objective>
redesign/18-worklog TSX 변환 wave — WorkLogPage.tsx (1216 lines) 단일 파일 atomic 변환 + components.css 신규 worklog-* class ~40 추가. 두 파일을 1 atomic commit 으로 묶고 SUMMARY 1 commit. 총 2 commit.

W7 §1~§12 verbatim 적용 — 외곽 chrome 만 sketch class 로 변환, 내부 WorkLogPortraitPreview 캘리브 33 step + KEY + FINGER_OFFSET + WorkLogCalibMarker + 페이지 출력 좌표 시스템은 1 byte 변경 0 (OQ #5 LOCKED).

Purpose: 19/20/21 legal 시리즈 종결 후 18-worklog 단일 페이지 완결 — bbz/lft/6if (legal 시리즈) mirror.
Output: WorkLogPage.tsx 변환본 + components.css ~544+ 라인.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md
@cha-bio-safety/src/pages/WorkLogPage.tsx
@cha-bio-safety/src/styles/components.css

<interfaces>
WorkLogPage.tsx 변환 영역 line range 3구역:
- §1 imports (line 1~53): hooks/router/react-query/toast/api/excel/store/hook/type 9 import 보존 + lucide-react 5종 추가
- §2 메인 함수 (line 56~333): hooks 5 / 폼 상태 17 / ref 4 / react-query 2 / useEffect 67 / changeMonth / currentPayload / isDirty / saveMutation / handleExport / roStyle / taStyle / inputStyle / monthPickerRef — 본문 0 byte
- §3 JSX render (line 336~829): formContent 6 카드 + footerButtons + monthNav + isDesktop 분기 + 모바일 분기 — sketch class verbatim 적용

비즈 anchor 18종 (1 byte 변경 0 강제):
1. workLogApi.get / preview / save (utils/api.ts)
2. useQuery(['worklog', ym], staleTime:0) (line 98~103)
3. useQuery(['worklog-preview', ym], enabled: savedQuery.data===null) (line 105~110)
4. useMutation(workLogApi.save, onSuccess: loadedRef + invalidateQueries) (line 249~280)
5. handleExport isDirty confirm → mutateAsync → generateWorkLogExcel (line 283~302)
6. changeMonth (prevYmRef='' + loadedRef=null + 17 setter + setYm) (line 190~201)
7. WorkLogPortraitPreview props 20 (line 884~911)
8. WORKLOG_CALIB_STEPS 33 step (line 833~867)
9. WORKLOG_CALIB_KEY = 'calib_worklog' + FINGER_OFFSET = 60 (line 869, 870)
10. monthPickerRef.current?.showPicker?.() ?? .click() (line 715)
11. isAdmin && setX() 가드 18+ 위치 + readOnly={!isAdmin}
12. gas/etc 3-state 토글 (gasResult === 'ok' ? '' : 'ok') (line 505, 516, 567, 578)
13. reportMethod / fixMethod 토글 (line 624, 640)
14. fixMethod === 'other' && <input maxLength={10}> (line 651~661)
15. 카피 verbatim 18+ 종 (§4 별표)
16. clientToImgPct + FINGER_OFFSET=60 (line 945~953)
17. WorkLogCalibMarker 시그니처 + 크로스헤어 w/h 40 / 활성 시 20 (line 1193~1216)
18. localStorage WORKLOG_CALIB_KEY JSON parse fallback (line 877)

Lucide 5종 import:
```typescript
import { ChevronLeft, ChevronRight, Save, Download, AlertTriangle } from 'lucide-react'
```
- ChevronLeft size={15} (line 803~805 인라인 SVG 백버튼 교체)
- ChevronLeft size={16} (line 712 navBtn ‹ 텍스트 교체)
- ChevronRight size={16} (line 728 navBtn › 텍스트 교체)
- Save size={14} (line 682~688 저장 버튼)
- Download size={14} (line 704 엑셀 출력 버튼)
- AlertTriangle size={14} (line 1185 "위치 설정" warning glyph 교체 — OQ #6)

OQ LOCKED 6건 적용 위치:
- OQ #1: line 679 "lin-grad" → bg-safe-bar solid (.worklog-footer-save)
- OQ #2: roStyle (line 308~310) 그대로 — opacity 0.5 / cursor 'default' / background var(--bg2) 보존
- OQ #3: 양호/불량 색상 (line 386, 397, 449, 460, 511, 522, 573, 584) status 색 유지 (var(--safe) / var(--danger))
- OQ #4: ‹/› button 미래 월 비활성 — default 적용 (line 712/728 disabled + monthPicker max)
- OQ #5: WorkLogPortraitPreview (line 884~1216) wrapper layout 만 — 내부 캘리브 0 byte
- OQ #6: line 1185 warning glyph 단독 → lucide AlertTriangle 교체

components.css 신규 ~40 class (sketch fence W7 §6 verbatim):
- W3 (~14): .worklog-section-card / .worklog-section-card.worklog-readonly / .worklog-section-title / .worklog-field-label / .worklog-field-label--mt / .worklog-input / .worklog-textarea / .worklog-toggle-row / .worklog-result-toggle / .worklog-result-toggle--ok / .worklog-result-toggle--bad / .worklog-result-toggle--unselected / .worklog-action-label / .worklog-action-label--bad
- W4 (~12): .worklog-report-date / .worklog-report-date-input / .worklog-report-date-input--year / .worklog-report-date-input--month / .worklog-report-date-input--day / .worklog-report-dot / .worklog-method-row / .worklog-method-row--wrap / .worklog-method-btn / .worklog-method-btn--selected / .worklog-fix-other-input / .worklog-save-preview
- W5 (~11): .worklog-footer / .worklog-footer-save / .worklog-footer-save--disabled / .worklog-footer-save-dirty / .worklog-footer-export / .worklog-footer-export--disabled / .worklog-mobile-footer / .worklog-desktop-layout / .worklog-desktop-edit-panel / .worklog-desktop-preview-panel / .worklog-desktop-print-label
- W6 (~16): .worklog-portrait-wrapper / .worklog-portrait-image / .worklog-portrait-overlay-area / .worklog-portrait-print-label / .worklog-portrait-setup-btn / .worklog-portrait-setup-btn--missing / .worklog-portrait-calib-bar / .worklog-portrait-calib-bar-step / .worklog-portrait-calib-bar-coord / .worklog-portrait-calib-confirm / .worklog-portrait-calib-cancel / .worklog-portrait-calib-marker / .worklog-portrait-calib-marker-h / .worklog-portrait-calib-marker-v / .worklog-portrait-calib-marker-dot / .worklog-portrait-calib-marker-dot--active
- W2 month-nav (~5): .month-nav / .month-nav-btn / .month-display / .month-picker-hidden / .month-picker-trigger

components.css 작성 시 — `@layer components { ... }` 블록 안에 §13. 18-worklog 섹션으로 신규 추가 (기존 §7~§12 daily-report 섹션 뒤). sketch HTML `<style>` block 안 css 정의 verbatim 복사 (feedback_planner_prompt_sketch_verbatim).

카피 verbatim 18+ 종:
- 헤더: "업무 수행 기록표" / "기본 정보" / "관리자" / "관리자 이름을 입력하세요" / "소방시설" / "확인내용" / "결과" / "조치내역" / "조치 내역 없음" / "피난방화시설" / "화기취급감독" / "기타사항" / "불량사항 개선보고" / "보고일시" / "보고방법" / "조치방법" / "기타 내용 입력"
- 라벨: "양호" / "불량" / "대면" / "서면" / "정보통신" / "이전" / "제거" / "수리·교체" / "기타"
- 푸터: "저장" / "저장 중..." / "엑셀 출력" / "출력 중..." / "· 수정됨"
- confirm: "저장되지 않은 변경사항이 있습니다\n\n저장 후 엑셀을 출력하시겠습니까?"
- toast: "저장되었습니다" / "저장 실패 — 다시 시도해 주세요" / "엑셀 생성 실패 — 다시 시도해 주세요"
- aria/title: "뒤로 가기" / "관리자만 저장할 수 있습니다" / "인쇄 미리보기"
- 캘리브: "위치 재설정" / "위치 설정" (lucide AlertTriangle 교체 후) / "확인" / "취소"
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>T1: WorkLogPage.tsx + components.css 단일 atomic 변환</name>
  <files>cha-bio-safety/src/pages/WorkLogPage.tsx, cha-bio-safety/src/styles/components.css</files>
  <action>
W7 markdown (`cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md`) §1~§12 verbatim 적용. 두 파일을 1 atomic commit 으로 묶음.

**Step 1: components.css 신규 ~40 class 추가**
- 위치: 기존 `@layer components { ... }` 블록 안, §11 (.daily-portrait-* 22 class) 직후, `}` 닫는 괄호 직전.
- 신규 섹션 헤더 주석: `/* ── §13. 18-worklog (W2~W6, ~40 class) ──────────── */` + 메모리 룰 inline 주석 (12 slug, W7 §13 박제).
- 5 sketch HTML 의 `<style>` block 안 css 정의 verbatim 복사:
  - `cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html` — `.month-nav` / `.month-nav-btn` / `.month-display` / `.month-picker-hidden` / `.month-picker-trigger` (5 class)
  - `sketch-wave-3-basic-info-categories.html` — `.worklog-section-card` / `.worklog-section-card.worklog-readonly` / `.worklog-section-title` / `.worklog-field-label` / `.worklog-field-label--mt` / `.worklog-input` / `.worklog-textarea` / `.worklog-toggle-row` / `.worklog-result-toggle` + 3 modifier / `.worklog-action-label` / `.worklog-action-label--bad` (~14 class)
  - `sketch-wave-4-defect-report.html` — `.worklog-report-date` / `.worklog-report-date-input` + 3 modifier / `.worklog-report-dot` / `.worklog-method-row` / `.worklog-method-row--wrap` / `.worklog-method-btn` / `.worklog-method-btn--selected` / `.worklog-fix-other-input` / `.worklog-save-preview` (~12 class)
  - `sketch-wave-5-footer-desktop-layout.html` — `.worklog-footer` / `.worklog-footer-save` + disabled + dirty / `.worklog-footer-export` + disabled / `.worklog-mobile-footer` / `.worklog-desktop-layout` / `.worklog-desktop-edit-panel` / `.worklog-desktop-preview-panel` / `.worklog-desktop-print-label` (~11 class)
  - `sketch-wave-6-portrait-preview-wrapper.html` — `.worklog-portrait-wrapper` / `.worklog-portrait-image` / `.worklog-portrait-overlay-area` / `.worklog-portrait-print-label` / `.worklog-portrait-setup-btn` + missing / `.worklog-portrait-calib-*` 10 class (~16 class)
- `var(--*)` 토큰 매핑: sketch hex 가 직접 적힌 경우, tokens.css 대응 토큰으로 치환 (예: `#22c55e` → `var(--status-safe-bar)`, rgba black 0.9 / 0.6 / 0.4 등 overlay UI 는 verbatim 유지).
- `feedback_text_caption_leading_none`: font-size 12px class 는 `line-height: 1` 동반.

**Step 2: WorkLogPage.tsx §1 imports 변환 (line 1~53)**
- line 2~10 import 9개 그대로 유지.
- line 11 (또는 새 import 라인 추가): `import { ChevronLeft, ChevronRight, Save, Download, AlertTriangle } from 'lucide-react'` 신규 추가.
- line 25~53 인라인 상수 5개 (navBtn / card / textareaStyle / iconBtn / skeletonStyle) — components.css 흡수 완료된 것은 삭제 가능. 단 다른 인라인 style 객체 (예: `inputStyle()`, `taStyle()`, `roStyle`) 가 참조하는 부분은 보존. 안전 가드: navBtn 은 month-nav-btn class 로 흡수 → 삭제. card 는 worklog-section-card class 로 흡수 → 삭제 가능. textareaStyle 은 inputStyle/taStyle 헬퍼가 spread 로 사용 — class 로 흡수 후 헬퍼 함수 단순화 또는 보존. iconBtn 은 back-btn class 로 흡수 → 삭제. skeletonStyle 은 worklog-skeleton class 신규 추가 후 삭제 가능.
- line 13~22 (thisMonthKST / addMonths) — 비즈 anchor, verbatim 보존.

**Step 3: WorkLogPage.tsx §2 메인 함수 (line 56~333) — 본문 0 byte**
- line 56~333 hook 5 / 폼 상태 17 / ref 4 / react-query 2 / useEffect 67 / changeMonth / currentPayload / isDirty / saveMutation / handleExport / monthPickerRef — **1 byte 변경 0**.
- 단, line 308~330 (roStyle / taStyle / inputStyle 헬퍼) — components.css 흡수 후 단순화 가능. 안전 가드: 헬퍼 함수 시그니처 보존 (focusedField / isAdmin 분기 1:1).

**Step 4: WorkLogPage.tsx §3 JSX render (line 336~829) — sketch class 적용**

§3.1 formContent (line 336~664) — 6 카드:
- 기본 정보 (line 339~354): `<div style={card}>` → `<div className="worklog-section-card">`. `<div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>기본 정보</div>` → `<div className="worklog-section-title">기본 정보</div>`. `<div style={{ fontSize: 11, ... }}>관리자</div>` → `<div className="worklog-field-label">관리자</div>`. `<input ... style={inputStyle()}>` → `<input ... className="worklog-input" />` (단 readOnly 시 worklog-readonly modifier 추가 — sketch verbatim).
- 소방시설 (line 358~419): 동일 패턴 + `<div style={{ display: 'flex', gap: 6 }}>` → `<div className="worklog-toggle-row">`. `<button onClick={() => isAdmin && setFireResult('ok')} style={{ ... safe... }}>양호</button>` → `<button className={`worklog-result-toggle ${fireResult === 'ok' ? 'worklog-result-toggle--ok' : 'worklog-result-toggle--unselected'}`} onClick={() => isAdmin && setFireResult('ok')}>양호</button>` (3-state 분기 보존, 카피 verbatim, isAdmin 가드 1 byte 0).
- 피난방화시설 / 화기취급감독 / 기타사항 (line 421~605): 동일 패턴. gas/etc 의 3-state 토글 (`gasResult === 'ok' ? '' : 'ok'`) — onClick 핸들러 본문 0 byte 변경, className 분기만 sketch verbatim.
- 불량사항 개선보고 (line 608~663): `<div className="worklog-section-card">` + `<div className="worklog-section-title">불량사항 개선보고</div>`. 보고일시 `<div className="worklog-report-date">` + 3 input `<input className="worklog-report-date-input worklog-report-date-input--year/--month/--day" />` + `<span className="worklog-report-dot">.</span>` × 2 (점 구분자 verbatim 또는 .dot-meta span 옵션). 보고방법 `<div className="worklog-method-row">` + 3 button `<button className={`worklog-method-btn ${reportMethod === val ? 'worklog-method-btn--selected' : ''}`}>`. 조치방법 `<div className="worklog-method-row worklog-method-row--wrap">` + 4 button. fixMethod === 'other' 분기 (line 651~661): `<input className="worklog-fix-other-input" maxLength={10}>` — maxLength + slice(0,10) + width 160 보존.

§3.2 footerButtons (line 667~707):
- 외곽 `<div style={{ display: 'flex', gap: 8 }}>` → `<div className="worklog-footer">`.
- 저장 버튼 (line 670~691): `style={{ flex: 1, ..., background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', ... }}` → `className={`worklog-footer-save ${(isSaving || !isAdmin) ? 'worklog-footer-save--disabled' : ''}`}`. **OQ #1 — "lin-grad" 폐기, bg-safe-bar solid**. 안 텍스트 `'저장'` / `'저장 중...'` 보존 + `<Save size={14} />` lucide 추가. dirty span: `<span className="worklog-footer-save-dirty text-caption text-warn leading-none">· 수정됨</span>` (카피 verbatim).
- 엑셀 출력 버튼 (line 693~706): `className={`worklog-footer-export ${(generating || !isAdmin) ? 'worklog-footer-export--disabled' : ''}`}` + `<Download size={14} />` + 카피 `'엑셀 출력'` / `'출력 중...'` 보존.

§3.3 monthNav (line 710~730):
- 외곽 → `<div className="month-nav">`.
- ‹ button (line 712): `<button style={navBtn} onClick={...}>‹</button>` → `<button className="month-nav-btn" onClick={() => changeMonth(addMonths(ym, -1))}><ChevronLeft size={16} /></button>`.
- 라벨 button (line 714~719): `<button onClick={() => monthPickerRef.current?.showPicker?.() ?? monthPickerRef.current?.click()} className="month-display leading-none">{year}년 {month}월</button>` — **monthPickerRef hack 1 byte 0**.
- input type='month' (line 720~726): `className="month-picker-hidden"` — opacity 0 / pointerEvents none / width 1 / height 1 보존.
- › button (line 728): `<ChevronRight size={16} />`.

§3.4 데스크톱 분기 (line 733~793):
- 외곽 `<div style={{ display: 'flex', flexDirection: 'row', ... }}>` → `<div className="worklog-desktop-layout">`.
- 좌측 패널 (line 739~748): `<div className="worklog-desktop-edit-panel">` + monthNav + formContent + footerButtons.
- 우측 A4 패널 (line 751~790): `<div className="worklog-desktop-preview-panel">` + `<div className="worklog-desktop-print-label leading-none">인쇄 미리보기</div>` + `<WorkLogPortraitPreview {...20 props}/>`. 인쇄 미리보기 fontSize 11 → text-sm (OQ #6).
- `<style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>` (line 736) — 보존 (components.css `@keyframes blink` 이미 있으나 안전 가드, 두 정의 중복 무해).

§3.5 모바일 분기 (line 796~829):
- 외곽 `<div style={{ height: '100%', ... }}>` → 기존 인라인 그대로 (sketch class 미적용 부분).
- `<header style={{ ... }}>` (line 801~809) → `<header className="page-header">` (14-reports inherit) + `<button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로 가기"><ChevronLeft size={15} /></button>` (lucide 교체) + `<span className="page-title">업무 수행 기록표</span>` + monthNav.
- 스크롤 본문 (line 812~815) → `<div className="page-body" style={{ flex: 1, overflowY: 'auto' }}>` (inherit class + 인라인 spacing). height 72 spacer 보존.
- 고정 푸터 (line 818~826): `<div className="worklog-mobile-footer">` — `position: fixed` + `paddingBottom: 'calc(10px + var(--sab))'` 보존 (iOS safe-area, memory `feedback_body_scroll_lock_safe_area`).

§3.6 WorkLogPortraitPreview (line 884~1216) — **외곽 wrapper 만 손댐, 내부 0 byte**:
- line 884~911 props 시그니처 (20 props) — 0 byte.
- line 912~921 hook (containerRef / imgRef / imgRect / calibMode / calibStep / calibPoints / activePoint / isDragging) — 0 byte.
- line 923~939 measure / useEffect — 0 byte.
- line 941~953 clientToImgPct + FINGER_OFFSET=60 — 0 byte.
- line 956~1008 onCalibTouchStart / onCalibTouchMove / onCalibTouchEnd / advanceStep / confirmPoint / onCalibClick — 0 byte.
- line 1010~1057 AREA_KEYS / textStyle / overlayItems 33 — 0 byte.
- line 1060~1067 외곽 wrapper `<div ref={containerRef} style={{ ... background: 'var(--bg)', position: 'relative' }}>` — `<div ref={containerRef} className="worklog-portrait-wrapper">` 교체 가능. **OQ #5 — 외곽만, 내부 모두 0 byte**.
- line 1069~1080 `<img>` — `<img ref={imgRef} src="/templates/preview/worklog-1.png" ... className="worklog-portrait-image" onLoad={measure} />` 교체.
- line 1083~1137 오버레이 + 캘리브 영역 `<div onClick/onTouch... style={{ position: 'absolute', ... }}>` — 외곽 wrapper class 만 `worklog-portrait-overlay-area` 추가, 안의 textStyle/overlayItems map / WorkLogCalibMarker 호출 0 byte.
- line 1140~1171 캘리브 안내 바 — 외곽 `<div style={{ position: 'absolute', top: 8, ... }}>` → `<div className="worklog-portrait-calib-bar">`. 안 `<span>` 3개 → calib-bar-step / calib-bar-label / calib-bar-coord. 확인 button → `worklog-portrait-calib-confirm`. 취소 button → `worklog-portrait-calib-cancel`. **안 fontSize / lineHeight / WORKLOG_CALIB_STEPS[calibStep].color 호출 0 byte**.
- line 1174~1187 "위치 설정" button — `<button className={`worklog-portrait-setup-btn ${hasCalib ? '' : 'worklog-portrait-setup-btn--missing'}`}>`. 안 텍스트: `hasCalib ? '위치 재설정' : (<><AlertTriangle size={14} /> 위치 설정</>)` — **OQ #6 lucide 교체, 카피 verbatim**.
- line 1193~1216 WorkLogCalibMarker — **0 byte** (시그니처 + 크로스헤어 w/h 40 / 활성 시 20 모두 보존, OQ #5).

**Step 5: 검증 — npm run build**
- `cd cha-bio-safety && npx tsc --noEmit` 0 errors.
- `cd cha-bio-safety && npm run build` PASS. WorkLogPage chunk size 보고 (kB 단위).

**Step 6: atomic commit (1 commit, 두 파일 함께)**
```bash
git add cha-bio-safety/src/pages/WorkLogPage.tsx cha-bio-safety/src/styles/components.css
git commit -m "redesign(18-worklog): W7 TSX 변환 — WorkLogPage 외곽 chrome + components.css ~40 신규 class (1 atomic / OQ 6 LOCKED / 비즈 anchor 18 / 캘리브 0 byte)"
```

메모리 룰 inline 12 slug (W7 §13 박제, plan 본문 echo 금지):
feedback_planner_prompt_sketch_verbatim / feedback_redesign_sketch_rule_enforcement / feedback_sketch_realistic_data / feedback_tsx_wave_emoji_dot_gap / feedback_tsx_wave_stat_card_drift / feedback_text_caption_leading_none / feedback_tailwind_token_class_pattern / feedback_tailwind_w8_h8_is_48px / feedback_cbc7119_design_never_wrangler / feedback_design_changes_ask_first / feedback_check_branch_before_edit / feedback_avoid_premature_confirmation.
  </action>
  <verify>
    <automated>
# Negative gate (17건 — W7 §11 verbatim 박제)
# (1) src/** 변경 = 2 파일만
test "$(git diff origin/main..HEAD --name-only -- cha-bio-safety/src/ | wc -l)" = "2"
# (2) 변경 파일 = WorkLogPage.tsx + components.css
git diff origin/main..HEAD --name-only -- cha-bio-safety/src/ | sort | diff - <(echo -e "cha-bio-safety/src/pages/WorkLogPage.tsx\ncha-bio-safety/src/styles/components.css")
# (3) App.tsx 0 byte — Suspense 매핑 변경 0
test "$(git diff origin/main..HEAD --name-only -- cha-bio-safety/src/App.tsx | wc -l)" = "0"
# (4) WORKLOG_CALIB_STEPS 33 step + key/label/color 변경 0 (line 833~867)
test "$(grep -c "WORKLOG_CALIB_STEPS" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "2"
# (5) WORKLOG_CALIB_KEY = 'calib_worklog' 변경 0
test "$(grep -c "WORKLOG_CALIB_KEY = 'calib_worklog'" cha-bio-safety/src/pages/WorkLogPage.tsx)" = "1"
# (6) FINGER_OFFSET = 60 변경 0
test "$(grep -c "FINGER_OFFSET = 60" cha-bio-safety/src/pages/WorkLogPage.tsx)" = "1"
# (7) 이모지 0 — 메타 코멘트 포함 (warning glyph / lin-grad 약어만 허용)
test "$(grep -cP "[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{27BF}]" cha-bio-safety/src/pages/WorkLogPage.tsx)" = "0"
# (8) fontSize 9·10·11 인라인 0 — WorkLogPortraitPreview 내부 (line 1013~1208) 만 예외
# 예외 범위 검증: grep 결과가 line 1013~1208 안에만 매치되어야 함
grep -nE "fontSize:\s*1[01](?![0-9])|fontSize:\s*9(?![0-9])" cha-bio-safety/src/pages/WorkLogPage.tsx | awk -F: '{ if ($1 < 1013 || $1 > 1216) { print "VIOLATION: line " $1; exit 1 } } END { print "OK — 모든 매치가 line 1013~1216 안" }'
# (9) "lin-grad" 인라인 0 — OQ #1
test "$(grep -c "linear-gradient" cha-bio-safety/src/pages/WorkLogPage.tsx)" = "0"
# (10) status- prefix 0
test "$(grep -c "bg-status-\|text-status-" cha-bio-safety/src/pages/WorkLogPage.tsx)" = "0"
# (11) w-8 h-8 0 (48px 사고 방지)
test "$(grep -c '"w-8 h-8\|className=.*w-8 h-8' cha-bio-safety/src/pages/WorkLogPage.tsx)" = "0"
# (12) wrangler 0 (이 워크트리 deny)
test "$(grep -c "wrangler" cha-bio-safety/src/pages/WorkLogPage.tsx)" = "0"
# (13) npm run deploy 0
test "$(grep -c "npm run deploy" cha-bio-safety/src/pages/WorkLogPage.tsx)" = "0"
# (14) monthPickerRef hack 1 byte 0
test "$(grep -c "monthPickerRef.current?.showPicker" cha-bio-safety/src/pages/WorkLogPage.tsx)" = "1"
# (15) isAdmin 가드 18+ 위치
test "$(grep -c "isAdmin" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "18"
# (16) gasResult/etcResult 3-state 토글 시그니처 보존
test "$(grep -c "gasResult === 'ok' ? '' : 'ok'\|gasResult === 'bad' ? '' : 'bad'\|etcResult === 'ok' ? '' : 'ok'\|etcResult === 'bad' ? '' : 'bad'" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "4"
# (17) 카피 verbatim 18+ 종
test "$(grep -cE "업무 수행 기록표|기본 정보|소방시설|피난방화시설|화기취급감독|기타사항|불량사항 개선보고|보고일시|보고방법|조치방법|양호|불량|대면|서면|정보통신|이전|제거|수리·교체|기타|· 수정됨|엑셀 출력" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "18"

# Positive gate
# 비즈 anchor 18종 — 핵심 grep PASS
test "$(grep -c "workLogApi\.get\|workLogApi\.preview\|workLogApi\.save" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "3"
test "$(grep -c "useQuery" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "2"
test "$(grep -c "useMutation" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "1"
test "$(grep -c "handleExport\|saveMutation.mutateAsync\|generateWorkLogExcel" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "3"
test "$(grep -c "changeMonth\|prevYmRef.current\|loadedRef.current" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "5"
test "$(grep -c "WorkLogPortraitPreview\|WorkLogCalibMarker" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "3"
test "$(grep -c "clientToImgPct\|advanceStep\|saveWorkLogCalib\|loadWorkLogCalib" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "4"
test "$(grep -c 'maxLength={10}' cha-bio-safety/src/pages/WorkLogPage.tsx)" = "1"
test "$(grep -c 'slice(0, 10)\|slice(0,10)' cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "1"

# Lucide 5종 import grep
test "$(grep -c "ChevronLeft" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "2"
test "$(grep -c "ChevronRight" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "1"
test "$(grep -c "Save" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "1"
test "$(grep -c "Download" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "1"
test "$(grep -c "AlertTriangle" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "1"
test "$(grep -c "from 'lucide-react'" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "1"

# OQ LOCKED 6 anchor 적용
# OQ #1: linear-gradient 0 (위 negative #9 와 중복 — pass)
# OQ #5: WORKLOG_CALIB_STEPS / KEY / FINGER_OFFSET / WorkLogCalibMarker 모두 보존 (위와 중복)
# OQ #6: AlertTriangle import 적용 (위와 중복)

# W7 §6 sketch class 적용 grep — worklog-* class
test "$(grep -c "worklog-section-card\|worklog-section-title\|worklog-field-label\|worklog-input\|worklog-textarea\|worklog-toggle-row\|worklog-result-toggle\|worklog-action-label\|worklog-report-date\|worklog-report-dot\|worklog-method-row\|worklog-method-btn\|worklog-fix-other-input\|worklog-footer\|worklog-mobile-footer\|worklog-desktop-layout\|worklog-desktop-edit-panel\|worklog-desktop-preview-panel\|worklog-portrait-wrapper\|worklog-portrait-image\|worklog-portrait-overlay-area\|worklog-portrait-calib\|worklog-portrait-setup-btn\|month-nav" cha-bio-safety/src/pages/WorkLogPage.tsx)" -ge "20"

# components.css 신규 class ≥30
test "$(grep -cE "^\s*\.worklog-|^\s*\.month-nav" cha-bio-safety/src/styles/components.css)" -ge "30"
# components.css 라인 수 ≥540
test "$(wc -l < cha-bio-safety/src/styles/components.css)" -ge "540"

# Build
cd cha-bio-safety && npx tsc --noEmit && npm run build && cd ..
echo "WorkLogPage chunk size:"
ls -lh cha-bio-safety/dist/assets/ | grep -i "worklog\|index" || true
  </automated>
  </verify>
  <done>
- 두 파일 변경 (WorkLogPage.tsx + components.css) 1 atomic commit 완료
- W7 §11 negative gate 17건 PASS / §12 positive gate PASS
- npm run build PASS + WorkLogPage chunk size 보고
- 비즈 anchor 18종 grep PASS
- WorkLogPortraitPreview 내부 캘리브 33 step + KEY + FINGER_OFFSET + WorkLogCalibMarker 0 byte 변경
- Lucide 5종 import 적용
- components.css ≥540 라인 + worklog-* class ≥30
  </done>
</task>

</tasks>

<verification>
- Negative gate 17건 (위 task verify) 모두 PASS — src/** 변경 = 2 파일만 / App.tsx 0 / WorkLogPortraitPreview 내부 0 byte / 이모지 0 / fontSize 9·10·11 인라인 = WorkLogPortraitPreview 내부 (line 1013~1208) 만 예외 / linear-gradient 0 / status- prefix 0 / w-8 h-8 0 / wrangler 0 / npm run deploy 0 / monthPickerRef hack 1 / isAdmin ≥18 / 3-state 토글 보존 / 카피 verbatim ≥18.
- Positive gate PASS — 비즈 anchor 18종 grep / Lucide 5종 / OQ LOCKED 6 / W7 §6 sketch class ≥20 / components.css 신규 ≥30.
- Build gate — `tsc --noEmit` 0 errors + `npm run build` PASS + chunk size 보고.
- 작업 종료 누적: `git log --oneline origin/main..HEAD` ≈ 19 commit (기존 16 + plan 1 + T1 1 + SUMMARY 1).
- 디자인 작업 룰: wrangler 명령 / npm run deploy 절대 금지 (이 워크트리 CLAUDE.local.md deny). main 머지 시 GitHub Actions 자동 cbc7119-preview 배포.
</verification>

<success_criteria>
- WorkLogPage.tsx 의 외곽 chrome (모바일 헤더 / 데스크톱 layout / footer / 6 form 카드 / 보고일시·보고방법·조치방법 / monthNav / WorkLogPortraitPreview 외곽 wrapper) 이 W7 §3 sketch class verbatim 으로 변환
- 내부 캘리브 시스템 (WORKLOG_CALIB_STEPS 33 step / WORKLOG_CALIB_KEY / FINGER_OFFSET=60 / WorkLogCalibMarker / clientToImgPct / advanceStep / overlayItems 33 / textStyle / AREA_KEYS) **0 byte 변경**
- components.css 가 504 → ≥540 라인으로 늘어나고 `worklog-*` / `month-nav` 신규 class ≥30 추가됨
- 비즈 anchor 18종 grep PASS (workLogApi / useQuery×2 / useMutation / handleExport / changeMonth / WorkLogPortraitPreview / monthPickerRef hack / isAdmin / 3-state 토글 / fixMethod 'other' maxLength=10 / 카피 verbatim 18+)
- Lucide 5종 (ChevronLeft / ChevronRight / Save / Download / AlertTriangle) import + 사용 적용
- OQ LOCKED 6 적용 — #1 lin-grad → bg-safe-bar solid / #2 roStyle 보존 / #3 양호·불량 status 색 유지 / #4 미래 월 비활성 default / #5 캘리브 내부 0 byte / #6 warning glyph → AlertTriangle
- `npm run build` PASS + WorkLogPage chunk size 보고
- atomic 2 commit (T1 변환 + SUMMARY) — git push 시 GitHub Actions cbc7119-preview 자동 배포 트리거
</success_criteria>

<output>
After completion, create `.planning/quick/260525-uou-redesign-18-worklog-tsx-worklogpage-1216/260525-uou-SUMMARY.md` covering:
- 변환 line range 3구역 (imports / 메인 함수 / JSX render) 적용 결과
- components.css 신규 class 카운트 + 라인 증가 (504 → N)
- 비즈 anchor 18종 보존 확인 (grep 결과 카운트)
- WorkLogPortraitPreview 내부 캘리브 0 byte 변경 확인 (line 833~1216 diff)
- Lucide 5종 매핑 위치
- OQ LOCKED 6 적용 결과
- npm run build PASS + chunk size
- 누적 commit 수 + cbc7119-preview 배포 트리거 확인
- 메모리 박제 후보 (deviation / 신규 패턴 / 추가 룰 발견 시)
- 다음 단계: 18-worklog 완결 → 19/20/21 legal 시리즈 종결 직후 4차 모니터링 종료 / 다음 페이지 후보
</output>

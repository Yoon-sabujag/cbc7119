---
phase: quick-260525-fda
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md
autonomous: true
requirements:
  - REDESIGN-18-WAVE1
must_haves:
  truths:
    - "wave-1-index.md 파일이 cha-bio-safety/docs/redesign-context/18-worklog/ 직속에 생성됨 (sketch/ 서브폴더 X — 14-reports + 15-daily-report + 19-legal + 20-legal-findings + 21-legal-finding-detail + 23-education + 28-splash 평면 sibling 패턴 mirror)"
    - "§1~§8 8개 필수 섹션 모두 채워짐 (15-daily-report wave-1-index.md 의 8-section 구조 동일 적용)"
    - "WorkLogPage.tsx 인벤토리 표가 6 영역 (1) Imports/유틸/스타일 상수 (line 1~53) (2) Main 컴포넌트 hook/state/handler (line 56~307) (3) formContent — 기본 정보 + 4 카테고리 카드 + 불량사항 개선보고 카드 (line 336~664) (4) footerButtons + monthNav (line 667~729) (5) 모바일/데스크톱 렌더 분기 (line 732~822) (6) WorkLogPortraitPreview + WorkLogCalibMarker + WORKLOG_CALIB_STEPS + loadWorkLogCalib/saveWorkLogCalib (line 833~1216) 모두 포함 + 비즈 시그니처 박스 분리"
    - "5~7 sub-wave 분배 표가 W2~W?? 행을 모두 포함 (WorkLogPage 1216 lines admin 전용 + 폼/미리보기/Excel 인라인 → 권장 6 sub-wave: W2 모바일 헤더 + 월 네비 / W3 기본 정보 + 4 카테고리 카드 (소방시설/피난방화시설/화기취급감독/기타사항) / W4 불량사항 개선보고 카드 (보고일시/보고방법/조치방법) / W5 footerButtons (저장 그라데이션 + 엑셀 출력 border) + 모바일/데스크톱 layout / W6 WorkLogPortraitPreview wrapper (캘리브 100% 보존) / W7 TSX 변환 verify checklist (markdown))"
    - "design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6.1 / §6.2 / §6.4 / §7.1 인용이 fence 안 verbatim 으로 포함 (§6.1 / §6.2 미적용 부분은 1줄 메타 동반 — 본 페이지 Stat Card 없음 / Progress 카드 없음)"
    - "14-reports SW1 결과물 components.css 의 재사용 가능 class ≥3건 (.page-header / .back-btn / .page-title / .page-body / .dot-meta / .page-footer-note) inherit 매핑 표 + 신규 정의 ≥10건 (.month-nav / .month-nav-btn / .month-display / .worklog-section-card / .worklog-section-title / .worklog-field-label / .worklog-textarea / .worklog-result-toggle / .worklog-result-toggle--ok / .worklog-result-toggle--bad / .worklog-report-input / .worklog-method-btn / .worklog-fix-other-input / .worklog-footer-save / .worklog-footer-save--gradient / .worklog-footer-export / .worklog-portrait-wrapper / .worklog-portrait-print-label / .worklog-portrait-calib-bar / .worklog-portrait-calib-confirm / .worklog-portrait-calib-cancel / .worklog-portrait-setup-btn 등) bullet"
    - "메모리 룰 ≥10건 inline 인용 (각 룰 요약 / Why / How (18-worklog 컨텍스트) 3 항목 + unique feedback_* slug ≥10)"
    - "negative rule 섹션 ≥8건 (sketch HTML 금지 / WorkLogPage.tsx 코드 수정 금지 / components.css 수정 금지 / wrangler 금지 / npm run deploy 금지 / 14-reports 평면 패턴과 다른 폴더 도입 금지 / App.tsx 미수정 / /templates/preview/worklog-1.png 변경/이동 금지 / 비즈 시그니처 변경 금지 — workLogApi 3종 + useQuery 2 + useMutation 1 + generateWorkLogExcel + isAdmin role 분기 + monthPickerRef + WORKLOG_CALIB_KEY 'calib_worklog' + FINGER_OFFSET 60)"
    - "OQ ≥5건 §7 에 정리됨 + 각 OQ default 답 1줄 (다운로드/저장 버튼 그라데이션 → solid 통일 / admin 권한 readOnly 폼 시각 처리 — disabled opacity 0.5 유지 vs 명시 잠금 아이콘 / OK/BAD 결과 토글 색상 — safe/danger 토큰 / 미래 월 비활성 UX / WorkLogPortraitPreview wrapper-only scope / ⚠ 위치 설정 글리프 lucide 교체)"
    - "WorkLogPage.tsx 코드 변경 0 (`git diff --name-only HEAD -- cha-bio-safety/src` 결과 0 lines)"
    - "`/worklog` 가 App.tsx MOBILE_NO_NAV_PATHS 에 등재되어 BottomNav 숨김 (18-worklog.md §2 메타 — 자체 헤더 사용) + admin 전용 페이지 (line 61 `isAdmin = staff?.role === 'admin'`) 박제"
    - "§8 자체 verify gate 8개 (헤더 카운트 / sub-wave row 수 / fence 수 / unique feedback_* slug 수 / OQ 수 / inherit class 수 / 신규 class 수 / wrangler+npm run deploy 박제) 모두 명령 + 기대값 표로 박제"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md"
      provides: "W2~W7 진입을 위한 단일 진입점 인덱스 + 룰 verbatim 인용 + sub-wave 분배 매핑 (WorkLogPage 1216 lines — 6 영역 6 sub-wave 분배 + WorkLogPortraitPreview wrapper-only 패턴 12-staff W8 / 15-daily-report W6 mirror)"
      contains: "§1 WorkLogPage 인벤토리 (6 영역 + 비즈 시그니처 박스), §2 6 sub-wave 분배, §3 design-system v0.1.1 verbatim 인용 (§1.1/§1.2/§1.3/§6.1/§6.2/§6.4/§7.1 — 7건), §4 14-reports SW1 components.css inherit 매핑 (재사용 ≥3 + 신규 ≥10), §5 메모리 룰 ≥10건 inline (각 룰 요약/Why/How), §6 negative rule ≥8건, §7 open questions ≥5건 (default 답 동반), §8 자체 verify gate 8개"
  key_links:
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/pages/WorkLogPage.tsx"
      via: "§1 인벤토리에 line 범위 인용 + §2 sub-wave 분배 표의 element/line 매핑 + 비즈 시그니처 박스"
      pattern: "line [0-9]+"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/docs/redesign-context/18-worklog/design-system.md"
      via: "§3 fence verbatim 인용 (§1.1/§1.2/§1.3/§6.1/§6.2/§6.4/§7.1 본문 박제)"
      pattern: "design-system.md §"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/styles/components.css"
      via: "§4 inherit 매핑 — 14-reports SW1 산출 95 class 중 재사용 가능 class ≥3건 (.page-header / .back-btn / .page-title / .page-body / .dot-meta / .page-footer-note) + 신규 class ≥10건 (.month-nav / .worklog-section-card / .worklog-result-toggle 등) bullet"
      pattern: "components.css"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/App.tsx"
      via: "§1 인벤토리 chrome 메타 — `/worklog` MOBILE_NO_NAV_PATHS 등재 (18-worklog.md §2 메타 실측) + admin 전용 페이지 분기 (line 61 `isAdmin`) + useIsDesktop ≥768px 분기 (line 9 import, line 59 호출, line 733 분기)"
      pattern: "/worklog|MOBILE_NO_NAV_PATHS|isAdmin"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/utils/api.ts"
      via: "§1 비즈 시그니처 박스 — workLogApi 3종 (get / preview / save) 박제 (line 6 import — workLogApi)"
      pattern: "workLogApi\\.(get|preview|save)"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/utils/generateExcel.ts"
      via: "§1 비즈 시그니처 박스 — generateWorkLogExcel(ym, payload) 박제 (line 7 import + line 296 호출 in handleExport)"
      pattern: "generateWorkLogExcel"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/hooks/useIsDesktop.ts"
      via: "§1 분기 — useIsDesktop() ≥768px (line 9 import, line 59 호출, line 733 데스크톱 분기)"
      pattern: "useIsDesktop"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/stores/authStore.ts"
      via: "§1 권한 — useAuthStore() → staff.role admin/assistant 분기 (line 60 + line 61 `isAdmin`). admin 만 form 편집 + 저장 + Excel 출력 가능. assistant 는 readOnly + opacity 0.5"
      pattern: "useAuthStore|staff\\?\\.role"
    - from: "wave-1-index.md"
      to: "/templates/preview/worklog-1.png"
      via: "§6 negative rule — W6 wrapper wave 가 image src (line 1071) 손대지 않음. 캘리브 좌표 (WORKLOG_CALIB_STEPS / WORKLOG_CALIB_KEY 'calib_worklog' / FINGER_OFFSET 60) 100% 보존"
      pattern: "/templates/preview/worklog"
---

<objective>
redesign/18-worklog sketch 작업의 wave 1 — 후속 wave(W2~W7) 의 단일 진입점이 되는 인덱스/룰 정리 markdown 1개만 작성한다.

Purpose: WorkLogPage.tsx (1216 라인 — admin 전용 폼/미리보기/Excel 인라인, useIsDesktop 분기로 모바일/데스크톱 양쪽 단일 export, `/worklog` 라우트, MOBILE_NO_NAV_PATHS 등재로 BottomNav 숨김, 자체 헤더 사용) 의 모든 element 를 **6 sub-wave** 로 분배 (15-daily-report W1 패턴 직접 mirror — 동일 1000+ 라인 admin 폼 + 미리보기 + Excel 인라인 + 좌측 편집/우측 A4 portrait 분할 패턴), 그리고 design-system.md v0.1.1 룰과 메모리 룰 12건 (10 기본 + WorkLogPage 특화 2건 — admin 폼 readOnly 분기 + 캘리브 100% 보존 분리) 을 verbatim 박제해서 후속 sketch wave 작업자가 이 인덱스만 보면 일관되게 작업할 수 있도록 한다.

Output: `cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` 단 1개 파일. 코드 변경 0건. sketch HTML 생성 0건 (그건 W2 부터). components.css 변경 0줄.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@./CLAUDE.local.md

# 가장 직접적인 mirror — 15-daily-report W1 (DailyReportPage 840 lines, 동일 좌측편집/우측A4 분할 + 캘리브 시스템 + 자체 헤더 + admin 폼 패턴)
@cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md

# 14-reports W1 (또 다른 mirror reference — 평면 sibling 패턴 시조)
@cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md

# Source file (이 wave 의 분석 대상, 수정 0)
@cha-bio-safety/src/pages/WorkLogPage.tsx

# Redesign context (이 wave 가 산출할 인덱스가 인용/참조하는 문서들 — 18-worklog 폴더 직속)
@cha-bio-safety/docs/redesign-context/18-worklog/18-worklog.md
@cha-bio-safety/docs/redesign-context/18-worklog/design-system.md
@cha-bio-safety/docs/redesign-context/18-worklog/tokens.css
@cha-bio-safety/docs/redesign-context/18-worklog/typography.css

# 14-reports SW1 산출 components.css (이미 95 class 카탈로그 — 18-worklog 가 inherit 매핑 대상)
@cha-bio-safety/src/styles/components.css

# 14-reports + 15-daily-report + 19-legal + 20-legal-findings + 21-legal-finding-detail + 23-education + 28-splash 모두 평면 sibling 패턴 (sketch/ 서브폴더 없음). 본 wave 도 동일.
</context>

<interfaces>
<!-- 후속 wave 가 산출할 sketch 파일 명명 규칙 (이 인덱스가 §2 표에서 인용) -->
<!-- 15-daily-report 평면 패턴 일관 — 18-worklog/ 직속에 위치 -->

W2 → cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html
W3 → cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-section-cards.html
W4 → cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-report-fix-card.html
W5 → cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-footer-buttons-desktop-layout.html
W6 → cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-6-portrait-preview-wrapper.html
W7 → cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md (markdown, sketch 아님)

(주의: WorkLogPage.tsx 가 1216 lines — DailyReportPage (840) 보다 더 큰 단일 export. admin 전용 + 폼 4 카테고리 카드 + 불량사항 개선보고 카드 + monthNav (DailyReport 의 dateNav 와 유사 패턴, 월 단위) + footerButtons (저장 그라데이션 + 엑셀 출력 border) + WorkLogPortraitPreview wrapper (캘리브 100% 보존) — 15-daily-report 의 6 sub-wave 와 거의 동일 구조이나 W4 가 "불량사항 개선보고 카드" 로 1 wave 분리 + W5 가 "footerButtons + 모바일/데스크톱 layout" 통합. 6 sub-wave 채택 (W2~W7). 평면 패턴 sketch-wave-N-{slug}.html (W2~W6) + wave-7-tsx-conversion-checklist.md (W7) 유지.)

# 비즈 로직 시그니처 (W7 TSX 보존 checklist 의 anchor — 이 인덱스가 §1 + §6 에서 인용)

## WorkLogPage.tsx (line 1~1216)

### 상단 imports / 유틸 / 스타일 상수 (line 1~53)
- imports (line 1~10): useState/useEffect/useRef/useCallback / useNavigate / useQuery+useMutation+useQueryClient / toast / workLogApi / generateWorkLogExcel / useAuthStore / useIsDesktop / type { WorkLogPayload }
- thisMonthKST() (line 13~16): KST `YYYY-MM` 현재 월 (toLocaleString 'en-US' Asia/Seoul)
- addMonths(ym, n) (line 18~22): YYYY-MM ± n 개월
- navBtn (line 25~30): 28x28 borderRadius 7 border 1px var(--bd) bg var(--bg3) color var(--t1) 16/700 lineHeight '1' — 월 네비 ‹/› (DailyReport 와 동일)
- card (line 32~35): bg var(--bg2) borderRadius 14 border 1px var(--bd) padding 14 marginBottom 10 — 모든 카드 공통 wrapper
- textareaStyle (line 37~42): width 100% bg var(--bg3) border 1px var(--bd) borderRadius 9 color var(--t1) fontSize 12 padding '10px 12px' resize vertical outline none lineHeight 1.6
- iconBtn (line 44~48): 34x34 borderRadius 9 border 1px var(--bd) bg var(--bg3) color var(--t2) — 뒤로 버튼 (모바일 헤더)
- skeletonStyle (line 50~53): bg var(--bg4) borderRadius 4 height 12 width 70% animation 'blink 2s ease-in-out infinite'

### Main 컴포넌트 — hook/state/handler (line 56~307)
- useNavigate (line 57) + useQueryClient (line 58) + useIsDesktop (line 59) + useAuthStore { staff } (line 60) + **isAdmin = staff?.role === 'admin'** (line 61 — 본 페이지 핵심 권한 분기)
- ym state + [year, month] (line 63~64): `YYYY-MM` 형식
- 폼 상태 14개 useState (line 67~86):
  - managerName / fireContent / fireResult ('ok'|'bad', default 'ok') / fireAction
  - escapeContent / escapeResult ('ok'|'bad') / escapeAction
  - gasContent / gasResult (''|'ok'|'bad', default 'ok' — gasResult 만 빈값 허용) / gasAction
  - etcContent / etcResult (''|'ok'|'bad') / etcAction
  - reportYear / reportMonth / reportDay (todayKST 기반 초기값)
  - reportMethod (''|'face'|'written'|'telecom') / fixMethod (''|'relocate'|'remove'|'repair'|'other') / fixOtherText
- loadedRef + prevYmRef (line 88~89): WorkLogPayload | null + 이전 ym tracker
- focusedField state (line 92): 포커스 시각 처리
- generating state (line 95): Excel 생성 중
- useQuery × 2 (line 98~111):
  - savedQuery `['worklog', ym]` → workLogApi.get(ym)
  - previewQuery `['worklog-preview', ym]` → workLogApi.preview(ym)
- useEffect ym 변경 시 폼 reset + saved 로드 + preview 폴백 (line 113~187): savedQuery.data 있으면 record 14 필드 채움 / 없으면 previewQuery.data 폴백
- changeMonth(newYm) (line 190~225): isDirty 체크 → window.confirm 저장하지 않은 변경 / 미래 월 가드
- isDirty derived (line 226~247)
- saveMutation (line 249~282): workLogApi.save(ym, payload) → invalidate ['worklog', ym] + toast.success '저장 완료' / error toast.error '저장 실패'
- handleExport (line 283~303): isDirty 시 confirm → save → generateWorkLogExcel(ym, currentPayload) → toast.success / catch toast.error
- isLoading (line 305): savedQuery.isFetching || previewQuery.isFetching
- roStyle (line 308~313): assistant readOnly 시각 처리 (background var(--bg2) cursor not-allowed)
- inputStyle(field) (line 314~322): focusedField + isAdmin 분기 border 변경
- managerInputStyle (line 324~330): managerName 필드 inputStyle 별도 (focusedField === 'managerName')
- monthPickerRef = useRef<HTMLInputElement>(null) (line 333): 월 picker (hidden input type='month') 진입점

### formContent JSX (line 336~664) — admin readOnly 분기 모두 적용
- **기본 정보 카드** (line 339~356): `<div style={card}>` + "기본 정보" 13/700 + "관리자" 11 라벨 + input managerName (admin 만 편집 가능, readOnly={!isAdmin}, line 347~349) + skeleton fallback
- **소방시설 카드** (line 358~420):
  - "소방시설" 13/700 (line 359)
  - "확인내용" 11 라벨 + textarea fireContent (rows? 미명시, textareaStyle, readOnly={!isAdmin})
  - "결과" 11 라벨 + 토글 2개 — 'OK' (line 379~389) / 'BAD' (line 390~402) — padding '5px 16px' borderRadius 7 12/700 + selected 시 (fireResult==='ok') bg var(--ok) color var(--bg2) / (fireResult==='bad') bg var(--bad) color #fff / unselected bg var(--bg3) color var(--t2)
  - "조치내역" (fireResult==='bad' 시 color var(--warn) 강조, line 404) + textarea fireAction
- **피난방화시설 카드** (line 421~483): 동일 패턴 (escapeContent / escapeResult ok/bad / escapeAction)
- **화기취급감독 카드** (line 484~545): 동일 패턴 — 단 gasResult 는 ''|'ok'|'bad' 3-state 토글 (line 505 onClick 'ok'→ '' 이면 ok 설정, 아니면 '' 으로 unset)
- **기타사항 카드** (line 546~606): 동일 패턴 (etcContent / etcResult ''|'ok'|'bad' 3-state / etcAction)
- **불량사항 개선보고 카드** (line 608~663):
  - "불량사항 개선보고" 13/700 (line 609)
  - **보고일시** (line 611~618): "보고일시" 11 라벨 + 3 input (reportYear w65 / reportMonth w40 / reportDay w40) + 사이 '.' span × 2
  - **보고방법** (line 620~634): 11 라벨 + 3 토글 — ['face','면담'], ['written','서면'], ['telecom','통신'] (`reportMethod === val ? '' : val` 토글 패턴 — 5px 14px 12/700)
  - **조치방법** (line 636~664): 11 라벨 + 4 토글 — ['relocate','이전'], ['remove','제거'], ['repair','수리·교체'], ['other','기타'] + fixMethod === 'other' 시 fixOtherText input (maxLength 10, line 652~657)

### footerButtons + monthNav (line 667~729)
- **footerButtons** (line 667~709):
  - 저장 버튼 (line 670~691): flex 1 padding 11 borderRadius 9 13/700 — admin && !isSaving 시 **`background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' color #fff`** (line 679) + isSaving 시 bg var(--bg3) color var(--t3) — '저장' 텍스트 + isDirty 시 '· 수정됨' (11 var(--warn) marginLeft 6, line 686)
  - 엑셀 출력 버튼 (line 693~708): flex 1 padding 11 borderRadius 9 border 1px var(--bd) 13/700 — admin && !generating 시 bg var(--bg2) color var(--t1) — '엑셀 출력' / '출력 중...' (generating)
- **monthNav** (line 710~729):
  - ‹ navBtn (line 712): onClick changeMonth(addMonths(ym, -1))
  - 가운데 button + 숨겨진 input type='month' (line 713~727): button minWidth 90 fontSize 15/700 textAlign center bg none border none — onClick monthPickerRef.current?.showPicker?.() ?? click() — 텍스트 = `${year}.${String(month).padStart(2,'0')}`. input ref={monthPickerRef} type='month' style display none value=ym onChange=changeMonth(e.target.value)
  - › navBtn (line 728): onClick changeMonth(addMonths(ym, 1))

### 데스크톱 렌더 (line 733~795, `if (isDesktop)`)
- 외곽 (line 735): flex row height 100% overflow hidden bg var(--bg)
- 인라인 `@keyframes blink` (line 736)
- 좌측 편집 패널 (line 739~748): flex 1 overflow auto padding '24px 32px' — top 영역 (flex justify flex-end marginBottom 20, line 740~742) 안 {monthNav} + {formContent} + {footerButtons} (marginTop 4, line 744~746) + height 24 spacer
- 우측 A4 portrait preview (line 751~793): aspectRatio '210/297' height 100% flexShrink 0 borderLeft 1px var(--bd) overflow hidden bg var(--bg) flex center align center position relative
  - "인쇄 미리보기" 라벨 (line 760~767): position absolute top 8 left 0 right 0 textAlign center **fontSize 11** var(--t2) 700 uppercase pointerEvents none zIndex 5
  - `<WorkLogPortraitPreview>` (line 768~793, 21 props): yearMonth + 14 form values + reportYear/Month/Day/Method + fixMethod/fixOtherText

### 모바일 렌더 (line 796~822, default)
- 외곽 (line 797): height 100% flex column overflow hidden bg var(--bg)
- 자체 헤더 (line 801~810): flexShrink 0 bg var(--bg2) borderBottom 1px var(--bd) padding '8px 12px 9px' flex align center gap 8
  - 뒤로 button (line 802~805): iconBtn style + 인라인 SVG ChevronLeft (width 15 height 15 stroke var(--t2) strokeWidth 2 path 'M15 19l-7-7 7-7')
  - 타이틀 (line 807): '업무 수행 기록표' flex 1 **fontSize 14** 700 var(--t1) — §1.1 노안 룰 14→18 상향 후보
  - {monthNav} (line 808)
- 스크롤 본문 (line 812~815): flex 1 overflowY auto padding '12px 16px' + {formContent} + height 72 spacer (고정 푸터 회피)
- 고정 푸터 (line 818~822): position fixed bottom 0 left 0 right 0 padding '10px 16px' — {footerButtons}

### WorkLogPortraitPreview + 캘리브 (line 833~1192)
- WORKLOG_CALIB_STEPS (line 833~868): 약 30+ step (manager / fire-content / fire-result-ok / fire-result-bad / fire-action / escape-* / gas-* / etc-* / report-year / report-month / report-day / report-method-face / report-method-written / report-method-telecom / fix-method-relocate / fix-method-remove / fix-method-repair / fix-method-other / fix-other-text) — 좌표 시스템 핵심 (실측 라인 범위에서 keys count 확인)
- WORKLOG_CALIB_KEY = 'calib_worklog' (line 869) + FINGER_OFFSET = 60 (line 870)
- loadWorkLogCalib / saveWorkLogCalib (line 876~881): localStorage IO
- WorkLogPortraitPreview 함수 (line 884~1192): 21 props (yearMonth + 14 form + 6 report/fix) + containerRef + imgRef + imgRect state + calibMode + calibStep + calibPoints + activePoint + isDragging ref + measure useCallback + ResizeObserver useEffect + clientToImgPct + onCalibTouchStart/Move/End + advanceStep + confirmPoint + onCalibClick + textStyle helper (line 1013) + lastDay = new Date(year, month, 0).getDate() (line 1021)
- 이미지 src (line 1071): `/templates/preview/worklog-1.png` (변경 금지)
- 위치 설정 button (line 1175~1188): `hasCalib ? '위치 재설정' : '⚠ 위치 설정'` (line 1185) — fontSize 12 fontWeight 700 zIndex 10
- WorkLogCalibMarker (line 1193~1216): 십자 마커 (40x2 / 2x40 border line) + 라벨 (active 시 확대, 10/900 #fff)

## utils/api.ts (workLogApi 3종 시그니처 박제 — line 6 import workLogApi)
- workLogApi.get(ym): Promise<WorkLogPayload | null> — 저장된 record
- workLogApi.preview(ym): Promise<WorkLogPayload | null> — 폴백 preview (자동 집계)
- workLogApi.save(ym, payload: WorkLogPayload): Promise<void> — 저장
(주의: ym 'YYYY-MM' 형식 변경 금지. WorkLogPayload type 변경 금지)

## utils/generateExcel.ts (generateWorkLogExcel 시그니처)
- generateWorkLogExcel(ym: string, payload: WorkLogPayload): Promise<void> — Excel 파일 다운로드 (line 7 import + line 296 호출 in handleExport)

## stores/authStore.ts (권한 분기)
- useAuthStore() → { staff } — staff: Staff | null — role: 'admin' | 'assistant'
- **admin 한정**: 모든 form input/textarea/토글 편집 + 저장 + Excel 출력. assistant 는 readOnly + opacity 0.5 + cursor 'default' (line 308~313 roStyle + line 326~329 managerInputStyle + line 348/368/383/394/410/431/446/457/473/493/508/519/535/555/570/581/597 readOnly={!isAdmin})
- 18-worklog.md §2 메타: "admin 전용 — 비-admin 진입 처리는 코드 상단만 봐서는 불명확" — 코드 실측 결과: assistant 진입 시 페이지는 렌더되지만 모든 input readOnly + 저장/Excel button 비활성. **redirect 없음.**

## hooks/useIsDesktop.ts
- useIsDesktop(): boolean — ≥768px 분기 (line 9 import, line 59 호출, line 733 if 분기)

## react-query / react-router-dom / react-hot-toast 의존
- useQuery × 2 + useMutation × 1 + useQueryClient (@tanstack/react-query)
- useNavigate (react-router-dom)
- toast (react-hot-toast)

## App.tsx chrome 등록 (실측 미수행 — 18-worklog.md §2 메타 기반)
- `/worklog` ∈ MOBILE_NO_NAV_PATHS (BottomNav 숨김 — 자체 헤더 사용)
- SideMenu 자체 헤더 사용으로 미노출
- admin 전용 — 비-admin 진입 처리 redirect 없음 (§2 메타 + 실측)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: wave-1-index.md 작성</name>
  <files>cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md</files>
  <action>
WorkLogPage.tsx (1216 라인) + 18-worklog.md + design-system.md + tokens.css + typography.css + components.css (14-reports SW1 95 class 카탈로그) + 15-daily-report wave-1-index.md (가장 직접적 mirror — 동일 좌측편집/우측A4 + admin 폼 + 캘리브 시스템 패턴) + 14-reports wave-1-index.md (평면 패턴 시조 reference) 를 모두 끝까지 읽은 뒤 아래 8개 섹션을 가진 단일 markdown 파일을 작성한다. 파일은 Write 도구로 생성한다 (heredoc/cat 금지).

**작업 진행 룰** (CRITICAL):
1. 가장 먼저 15-daily-report wave-1-index.md (`cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md`, 428 lines) 를 처음부터 끝까지 Read 도구로 한번에 읽는다 — 이것이 정확히 mirror 할 구조 템플릿 (8-section 구조 + 6 sub-wave 분배 + admin 폼/캘리브 패턴 + 그라데이션 폐기 결정 등 18-worklog 와 거의 동일 구조).
2. 그 다음 WorkLogPage.tsx 를 처음부터 끝까지 Read 한다 (1216 lines — 한번에 cover 불가, offset 0/500/1000 3 청크로 분할 read. 같은 range 중복 read 금지). 인벤토리 추출 시 line 범위는 **실측 라인** 사용.
3. design-system.md §1.1 / §1.2 / §1.3 / §6.1 / §6.2 / §6.4 / §7.1 영역을 grep + Read offset 으로 정확히 추출한다 (paraphrase 금지, verbatim fence 인용). 15-daily-report wave-1-index.md 안에 이미 verbatim 인용된 부분은 그대로 복사 가능 (양쪽 모두 동일 design-system v0.1.1 기반).
4. components.css 안 95 class 중 18-worklog 가 inherit 가능한 class (.page-header / .back-btn / .page-title / .page-body / .dot-meta / .page-footer-note 후보) 를 grep 으로 실측 + line 번호 인용 (14-reports inherit 매핑 표).
5. App.tsx 의 `/worklog` 관련 라인 (MOBILE_NO_NAV_PATHS / Route lazy import) 을 grep 으로 실측 확인 — 18-worklog.md §2 메타와 일치하는지 verify (이 부분은 인벤토리 chrome 메타에 박제, 단 본 페이지 chrome 룰은 15-daily-report 와 동일 → 별도 §4 chrome 섹션 추가하지 않음 — 8-section 구조 유지).
6. tokens.css 에서 status 토큰 (--ok / --bad / --warn / --acl 등) 정의 라인을 grep 으로 확인 (15-daily-report wave-1-index.md 참고).

---

# 파일 헤더

상단에 frontmatter + 다음 1블록:
- frontmatter: title / status: ready_for_oq / created: 2026-05-25 / quick_id: 260525-fda / branch: redesign/18-worklog / source_tsx: cha-bio-safety/src/pages/WorkLogPage.tsx / source_tsx_lines: 1216 / design_system: cha-bio-safety/docs/redesign-context/18-worklog/design-system.md (v0.1.1) / mirror_of: cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md (동일 8-section + 6 sub-wave + 좌측편집/우측A4 + 캘리브 시스템 + admin 폼 패턴) / inherit_from: cha-bio-safety/src/styles/components.css (14-reports SW1 결과 — 95 class 카탈로그) / sub_wave_count: 6 (W2~W7) / memory_rules_inline: 12 / open_questions: 6
- 제목: `# redesign/18-worklog — sketch wave 1 (index)`
- 1-2줄 설명: 본 문서는 W2~W7 진입의 단일 진입점이며, 이 인덱스만 봐도 후속 wave 가 디자인 룰 / 메모리 룰 / sub-wave 분배 / OQ 를 알 수 있도록 한다.
- 산출일자: 2026-05-25 / Quick ID 260525-fda / branch redesign/18-worklog
- 1줄 메타: "15-daily-report W1 (260521-1k6) 의 8 섹션 + 6 sub-wave 구조를 정확히 mirror. WorkLogPage 가 1216 lines — DailyReport (840) 보다 더 큰 단일 export, 4 카테고리 카드 + 불량사항 개선보고 카드 + admin 전용 폼 readOnly 분기 + monthNav (DailyReport dateNav 의 월 단위 버전) + footerButtons (저장 그라데이션 + 엑셀 출력 border) + WorkLogPortraitPreview wrapper. **15-daily-report 와 차이 (5건)**: (1) 카드 5개 (4 카테고리 + 불량사항 개선보고 — DailyReport 의 EditableCard 3개 보다 많음), (2) OK/BAD 결과 토글 (DailyReport 없음 — 본 페이지 핵심 UX), (3) 모든 input readOnly 분기 (admin 전용 — DailyReport 는 전체 사용자 가능), (4) monthNav 안 숨겨진 input type='month' picker (DailyReport 는 dateNav 만), (5) 캘리브 step 30+ (DailyReport 15 step 보다 2배 — 폼 필드 다양). 6 sub-wave (W2~W7) 채택. 평면 sibling 패턴 sketch-wave-N-{slug}.html (W2~W6) + wave-7-tsx-conversion-checklist.md (W7) 유지."

---

# §1. WorkLogPage.tsx 인벤토리

WorkLogPage.tsx (1216 lines, 실측) 의 element 를 6 영역으로 나눠 표로 정리. 각 행은 (영역 / element / source line 범위 / 역할 / 비즈 로직 연결 / 후속 wave 매핑) 6 컬럼.

§1.1 Imports & 상수 (line 1~53)
§1.2 Main 컴포넌트 hook/state/handler (line 56~307) — useQuery×2 / useMutation×1 / 14 form state + 9 control state / handleExport (Excel) / changeMonth (isDirty confirm) / saveMutation / inputStyle / managerInputStyle / monthPickerRef
§1.3 formContent — 기본정보 + 4 카테고리 카드 + 불량사항 개선보고 (line 336~664)
§1.4 footerButtons (line 667~709) + monthNav (line 710~729)
§1.5 모바일/데스크톱 렌더 (line 733~822)
§1.6 WorkLogPortraitPreview + WorkLogCalibMarker + WORKLOG_CALIB_STEPS (line 833~1216)
§1.7 비즈 시그니처 박스 (workLogApi 3종 + generateWorkLogExcel + isAdmin + monthPickerRef + WORKLOG_CALIB_KEY 'calib_worklog' + FINGER_OFFSET 60 + 이미지 src '/templates/preview/worklog-1.png')
§1.8 파일 라인 수 확인 + 주요 fontSize 출현 카운트 (11/12/13/14/15/16 — §1.1 노안 룰 위반 다수)

각 §1.x 마다 표 + "주: ..." 1~2줄로 마이그레이션 §4.2 (9·10·11px 상향) 또는 §6.4 (그라데이션 폐기) 적용 대상 명시.

특히 §1.3 의 4 카테고리 카드 (소방시설 line 358~420 / 피난방화시설 line 421~483 / 화기취급감독 line 484~545 / 기타사항 line 546~606) 는 **거의 동일 패턴 반복** — 18-worklog.md §4 의 "4개 카드 섹션은 동일 패턴 → 공통 `<WorkLogSection>` 추출 가능" 지시와 일치. W3 sketch 에서 공통 컴포넌트 디자인 채택 권장 (1 카드 디자인 → 4 카드 적용).

§1.3 의 gasResult/etcResult 가 ''|'ok'|'bad' 3-state 토글 (line 505/567 onClick `setGasResult(gasResult === 'ok' ? '' : 'ok')` — 같은 button 재클릭 시 unset) vs fireResult/escapeResult 가 'ok'|'bad' 2-state (line 380 `setFireResult('ok')` 단방향) — **비즈 차이 verbatim 박제** (memory `feedback_sketch_realistic_data` 룰 — 표시 분기는 코드 그대로). W3 sketch 시 같은 토글 markup 이라도 ''|'ok'|'bad' 3-state UX 명시.

---

# §2. 6 sub-wave 분배 plan

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 헤더 + 월 네비 | WorkLogPage 자체 헤더 (line 801~810) + monthNav (line 710~729) | sketch-wave-2-mobile-header-month-nav.html |
| W3 | 기본 정보 카드 + 4 카테고리 카드 (공통 패턴) | formContent 기본정보 (line 339~356) + 소방시설 (line 358~420) + 피난방화시설 (line 421~483) + 화기취급감독 (line 484~545) + 기타사항 (line 546~606) — 공통 WorkLogSection 패턴 | sketch-wave-3-section-cards.html |
| W4 | 불량사항 개선보고 카드 | formContent 불량사항 개선보고 (line 608~663) — 보고일시 + 보고방법 + 조치방법 | sketch-wave-4-report-fix-card.html |
| W5 | footerButtons + 모바일/데스크톱 layout | footerButtons (line 667~709) + 모바일 헤더+본문+고정푸터 (line 796~822) + 데스크톱 좌측편집+우측A4 분할 (line 733~795 외곽만, A4 wrapper 영역만) | sketch-wave-5-footer-buttons-desktop-layout.html |
| W6 | WorkLogPortraitPreview wrapper (캘리브 100% 보존) | WorkLogPortraitPreview wrapper (line 884~1192 중 외곽만) — 캘리브 step / overlayItems / 이미지 좌표 시스템 100% 보존 | sketch-wave-6-portrait-preview-wrapper.html |
| W7 | TSX 변환 verify checklist (markdown) | W2~W6 sketch + WorkLogPage.tsx 비즈 로직 보존 룰 + components.css inherit class 매핑 + 신규 class 명단 | wave-7-tsx-conversion-checklist.md |

## §2.1 각 wave 보존 / 토큰 / 폰트

W2~W7 각각에 대해 (보존 / 토큰 / 폰트) 3 항목 bullet — 15-daily-report wave-1-index.md §2.1 동일 형식. 본문에서는 다음 핵심 포인트를 명시:

- W2: useNavigate(-1), navBtn 28x28 (w-7 함정 회피), iconBtn 34x34, 타이틀 14→18 상향, monthPickerRef 보존 (showPicker?.() ?? click()), changeMonth + addMonths(ym, ±1) 보존, isDirty confirm 분기 보존
- W3: card 공통 wrapper (bg-bg2 padding 14 radius 14), OK/BAD 토글 — safe/danger 토큰 (or var(--ok) / var(--bad) 인라인), readOnly={!isAdmin} 분기 시각 처리 (opacity 0.5 cursor default), textareaStyle (fontSize 12 → text-body-sm 14 검토), 4 카드 공통 패턴 추출 (WorkLogSection), gasResult/etcResult 3-state vs fireResult/escapeResult 2-state 차이 명시
- W4: 보고일시 3 input (w65/w40/w40 텍스트 정렬 center) + '.' span × 2 dot 처리, 보고방법 3 토글 (face/written/telecom) + 조치방법 4 토글 (relocate/remove/repair/other), fixMethod === 'other' 시 fixOtherText input (maxLength 10) inline 노출
- W5: 저장 버튼 그라데이션 → solid 통일 (OQ #1 default), 엑셀 출력 버튼 border 보조 액션 유지, 모바일 고정 푸터 paddingBottom safe-area, 데스크톱 좌측 편집 padding '24px 32px' + 우측 A4 portrait wrapper (aspectRatio '210/297' borderLeft 1px) + "인쇄 미리보기" 라벨 (fontSize 11 → 12 text-caption 상향)
- W6: WorkLogPortraitPreview props 시그니처 verbatim (21 props), 캘리브 step + WORKLOG_CALIB_KEY 'calib_worklog' + FINGER_OFFSET 60 + 이미지 src '/templates/preview/worklog-1.png' 모두 보존, 외곽 wrapper / 안내 바 / 위치 설정 button 만 새 토큰 적용 — 12-staff W8 lp[] / 15-daily-report W6 mirror
- W7: 모든 비즈 로직 100% 보존 (useQuery×2 / useMutation×1 / 14 form state + 9 control state / handleExport / changeMonth / saveMutation / inputStyle / monthPickerRef), UI markup 만 재작성

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

§3.1 §1.1 노안 친화 — verbatim + 18-worklog 적용 메타 (fontSize 출현: 10/11/12/13/14/15/16 → 마이그레이션 §4.2 적용)
§3.2 §1.2 정보 인지 > 미적 정제 — verbatim + 5 카드 (기본/4 카테고리/불량사항) + footer 위계 분명히
§3.3 §1.3 모바일/데스크톱 동일 폰트 — verbatim + 좌우 분할 레이아웃 책임
§3.4 §6.1 Progress Color Rule — verbatim + "18-worklog 미적용" 메타 (진척률 도넛 없음)
§3.5 §6.2 Stat Card Number Color — verbatim + "18-worklog 미적용" 메타 (Stat Card 없음) + memory `feedback_tsx_wave_stat_card_drift` 룰 박제
§3.6 §7.1 Lucide Icon System — verbatim + Lucide 아이콘 사용 candidates (ChevronLeft 뒤로 + ChevronLeft/Right 월 네비 + Download 엑셀 출력 + AlertTriangle 위치 설정 ⚠ 교체)
§3.7 §6.4 Backgrounds & Gradients 폐기 룰 — verbatim + 저장 버튼 그라데이션 (line 679 `linear-gradient(135deg,#1d4ed8,#2563eb)`) → `bg-safe-bar` solid 통일 (14-reports W6 LOCKED b + 15-daily-report OQ #1 일관, OQ #1 default)

각 §3.x 인용 끝에 "> 18-worklog 적용:" 1~3줄 메타로 본 페이지 컨텍스트 박제.

---

# §4. 14-reports SW1 결과물 (components.css) inherit 매핑

§4.1 재사용 가능 class — 표 (≥3 row 필수, 실제 6 row 권장):
- .page-header / .back-btn / .page-title / .page-body (모바일 헤더 + 본문)
- .dot-meta (`·` 구분자 — 본 페이지 monthNav 안 직접 사용은 없지만, 추후 인원 표시 등 활용 가능)
- .page-footer-note (footer 안내 줄 — 본 페이지 isDirty '· 수정됨' 11 var(--warn) 패턴에 응용 가능)

§4.2 신규 정의 (W2~W6 sketch + W7 TSX wave 에서 components.css 추가, ≥10 bullet):
- W2: .month-nav / .month-nav-btn / .month-display / .month-picker-trigger (4건)
- W3: .worklog-section-card / .worklog-section-title / .worklog-field-label / .worklog-textarea / .worklog-result-toggle / .worklog-result-toggle--ok / .worklog-result-toggle--bad / .worklog-result-toggle--unselected / .worklog-action-label / .worklog-action-label--bad (10건)
- W4: .worklog-report-card / .worklog-report-date / .worklog-report-date-input / .worklog-method-btn / .worklog-method-btn--selected / .worklog-fix-other-input (6건)
- W5: .worklog-footer / .worklog-footer-save / .worklog-footer-save--gradient / .worklog-footer-save--disabled / .worklog-footer-export / .worklog-desktop-layout / .worklog-desktop-edit-panel / .worklog-desktop-preview-panel (8건)
- W6: .worklog-portrait-wrapper / .worklog-portrait-image / .worklog-portrait-overlay-area / .worklog-portrait-print-label / .worklog-portrait-calib-bar / .worklog-portrait-calib-confirm / .worklog-portrait-calib-cancel / .worklog-portrait-calib-marker / .worklog-portrait-setup-btn / .worklog-portrait-setup-btn--missing (10건)

신규 class 합계 ≈38건. `≥10건` 요건 충족.

§4.3 components.css 그라데이션 토큰 검토 — 14-reports SW1 에 그라데이션 class 존재 시 inherit, 없으면 신규 `.worklog-footer-save--gradient` (OQ #1 default = solid 통일 시 미생성).

---

# §5. 메모리 룰 inline 인용 (≥10건, unique slug)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건 (10 본문 + WorkLogPage 특화 2건). 각 룰은 `feedback_*.md` 파일명 + 1줄 요약 + Why + How (18-worklog 컨텍스트) 3 항목.

룰 1 — feedback_design_sketch_first.md
룰 2 — feedback_redesign_sketch_rule_enforcement.md (§6.2 negative + §6.3/§7.1 일관성)
룰 3 — feedback_sketch_realistic_data.md (gasResult/etcResult 3-state vs fireResult/escapeResult 2-state 분기 코드 그대로)
룰 4 — feedback_planner_prompt_sketch_verbatim.md (W7 변환 직전 sketch CSS grep 추출)
룰 5 — feedback_tailwind_token_class_pattern.md (.bg-safe-bar O / .bg-status-safe-bar X)
룰 6 — feedback_tailwind_w8_h8_is_48px.md (navBtn 28x28 → w-[28px] 명시 또는 w-7 32px, w-8 48px 금지)
룰 7 — feedback_text_caption_leading_none.md (월 표시 line 716 fontSize 15 + monthNav button 안 작은 영역 leading-none)
룰 8 — feedback_tsx_wave_emoji_dot_gap.md (위치 설정 ⚠ 글리프 line 1185 + 보고일시 '.' span 처리)
룰 9 — feedback_tsx_wave_stat_card_drift.md (18-worklog 에 Stat Card 없음 — 미적용 메타 명시, executor 가 drift 잡지 않도록)
룰 10 — feedback_avoid_premature_confirmation.md (인덱스 완료 후 "OQ 6건 컨펌 부탁" 만)
룰 11 (보너스) — feedback_gsd_workflow_strict.md (W2~W7 모두 /gsd:quick 시작 필수)
룰 12 (보너스) — feedback_cbc7119_design_never_wrangler.md (wrangler 금지 + npm run deploy 금지, cbc7119-preview 만)

(추가 옵션: project_inspection_chrome_unified.md 가 18-worklog 와 직접 매칭은 약하나 — 본 페이지는 점검 페이지 아닌 폼 페이지 — 그래도 chrome 통일 룰 reference 가능 시 inline 인용)

unique slug ≥10건 검증: §8 verify gate 4번으로 enforce.

---

# §6. negative rule (이 wave 에서 금지된 것, ≥8건)

- sketch HTML 생성 금지 — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- WorkLogPage.tsx 코드 수정 금지 — `cha-bio-safety/src/pages/WorkLogPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src` 결과 0 줄.
- components.css 수정 금지 — 14-reports SW1 결과물 그대로. W7 TSX 변환 wave 에서만 신규 class 추가.
- 다른 페이지 (13-schedule / 14-reports / 15-daily-report / 19~21 legal / 23-education 등) 영향 금지 — `git status` 에 18-worklog/ 외 변경 0.
- wrangler 명령 금지 — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler.md`. `.claude/settings.local.json` deny 강제.
- `npm run deploy` 금지 — `CLAUDE.local.md` 룰. 직원 도메인 (`cbc7119.pages.dev`) 경로.
- 14-reports + 15-daily-report sketch 폴더 구조와 다른 패턴 도입 금지 — 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 18-worklog 도 동일 평면 배치.
- App.tsx 수정 금지 — `MOBILE_NO_NAV_PATHS` 이미 `/worklog` 등재됨 (18-worklog.md §2 메타 확인). 본 wave + W2~W7 모두 App.tsx 손대지 않음.
- 외부 의존 `/templates/preview/worklog-1.png` 변경/이동 금지 — W6 wrapper wave 가 내부 image src (line 1071) 손대지 않음.
- 비즈 시그니처 변경 금지 — workLogApi 3종 (get/preview/save) + generateWorkLogExcel + isAdmin role 분기 (line 61) + monthPickerRef showPicker?.() ?? click() (line 715) + WORKLOG_CALIB_KEY 'calib_worklog' (line 869) + FINGER_OFFSET 60 (line 870) + WORKLOG_CALIB_STEPS keys verbatim + useQuery × 2 (savedQuery + previewQuery) + useMutation × 1 (saveMutation) + handleExport isDirty confirm 분기 (line 285) + changeMonth isDirty + 미래월 가드 분기.

---

# §7. open questions (W2 진입 직전 사용자 컨펌, ≥5건, 권장 6건)

각 OQ 아래 "default 답" 1줄. 사용자가 별 의견 없으면 default 로 진행.

- OQ #1: 저장 버튼 그라데이션 (`linear-gradient(135deg,#1d4ed8,#2563eb)`, line 679) → `bg-safe-bar` solid 통일 OK? **default: OK** — 14-reports W6 LOCKED b + 15-daily-report OQ #1 일관 + design-system §6.4 CTA 그라데이션 폐기. 엑셀 출력 버튼은 border 보조 액션 유지 (기존 그대로).

- OQ #2: admin 권한 readOnly 폼 시각 처리 — (a) 현재 패턴 유지 (opacity 0.5 + cursor 'default' + bg var(--bg2)) / (b) 명시적 잠금 아이콘 + 회색 톤 / (c) 비-admin 진입 시 toast 안내 + 폼 자체 비활성 표시 (`<fieldset disabled>`). **default: (a) 현재 패턴 유지** — 비-admin 진입 빈도 낮음 + 기존 UX 익숙, 변경 시 회귀 위험. 단 isAdmin readOnly 시 cursor 'default' 시각 강화는 W3 sketch 에서 박제.

- OQ #3: OK/BAD 결과 토글 색상 — (a) safe/danger 토큰 (`var(--ok)` / `var(--bad)`) 현재 그대로 / (b) safe-bar / danger-bar 변종으로 통일 / (c) OK 만 채움 + BAD 만 채움 + unselected 회색 톤 (현재 패턴) 유지. **default: (c) 현재 패턴 유지** — 비즈 차이 (gasResult/etcResult 3-state vs fireResult/escapeResult 2-state) 가 코드 분기와 1:1 매칭, 색상 변경 시 회귀 위험. tokens.css 토큰만 정렬 (var(--ok) → var(--status-safe) 매핑 검토).

- OQ #4: 미래 월 비활성 UX — 현재 changeMonth (line 190~225) 안 미래 월 시 toast 안내 후 abort. (a) 유지 (toast 안내) / (b) ‹/› button 자체 비활성 (15-daily-report 의 chevron spacer 패턴 mirror) / (c) monthPicker max 속성 (`max={thisMonthKST()}`) 추가. **default: (b) ‹/› button 자체 비활성** — 15-daily-report dateNav 의 spacer 패턴 일관 + UX 명료 (toast 보다 시각적). monthPicker 의 max 속성도 보조 적용 (c).

- OQ #5: WorkLogPortraitPreview 변환 scope — (a) wrapper layout 만 (내부 캘리브레이션/오버레이/이미지 보존) / (b) 본체까지 변환. **default: (a) wrapper 만** — 12-staff W8 lp[] / 15-daily-report W6 mirror. WORKLOG_CALIB_STEPS 30+ step + WORKLOG_CALIB_KEY 'calib_worklog' + FINGER_OFFSET 60 + 이미지 src '/templates/preview/worklog-1.png' + WorkLogCalibMarker 모두 100% 보존.

- OQ #6: 위치 설정 button (line 1175~1188) `⚠ 위치 설정` 글리프 처리 — (a) lucide `<AlertTriangle size={14} />` 교체 / (b) ⚠ 글리프 유지 (현재 소스 그대로). **default: (a) lucide 교체** — memory `feedback_tsx_wave_emoji_dot_gap` 룰. 단 사용자가 ⚠ 글리프 유지 선호 시 (b) 도 acceptable (시각 강조 효과 보존).

---

# §8. 자체 verify gate (작성 완료 후 통과해야 할 8 gate)

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. §1~§8 헤더 존재 | `grep -cE '^# §[1-8]\\.' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` | =8 |
| 2. sub-wave 분배 표 ≥6 row | `grep -cE '^\\| W[2-7] ' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` | ≥6 |
| 3. design-system fence ≥6 (open+close ×3 이상) | `grep -c '^```' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` | ≥6 |
| 4. unique feedback_* slug ≥10 | `grep -oE 'feedback_[a-z_]+\\.md' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 5. OQ §7 ≥5 | `grep -cE '^- \\*\\*OQ #' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` | ≥5 |
| 6. 14-reports inherit class ≥3 | §4.1 표 row count 시각 검증 | ≥3 (실제 6) |
| 7. 신규 class 명단 ≥10 | §4.2 bullet count 시각 검증 | ≥10 (실제 ≈38) |
| 8. negative §6 wrangler+npm run deploy 박제 | `grep -c 'wrangler' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` ≥1 AND `grep -c 'npm run deploy' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` ≥1 | 둘 다 ≥1 |

추가 negative gate (commit 전 실행):
- `git diff --name-only HEAD -- cha-bio-safety/src` 결과 0 lines (src/** 변경 0)
- `ls cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-*.html 2>/dev/null` 결과 빈 출력 (sketch HTML 0개)
- `git status --porcelain | grep -v '^?? .planning/' | grep -v 'docs/redesign-context/18-worklog/wave-1-index.md'` 결과 0 lines (오직 wave-1-index.md 와 .planning/ 만 변경)

모두 PASS 시 본 인덱스가 W2 진입 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 6건 답변으로 받는다.

---

# 작성 완료 후 보고 룰 (memory 룰 10번 — feedback_avoid_premature_confirmation 준수)

본 wave 완료 후 사용자에게 보고할 내용:
1. wave-1-index.md 파일 경로 + 라인 수
2. §8 verify gate 8개 모두 PASS 결과 (명령 + 실측 출력 박제)
3. §7 OQ 6건 default 답 요약 + "이대로 진행 / 변경 사항 있으면 알려주세요" 1줄
4. 다음 단계 = 사용자 OQ 답변 받은 뒤 W2 sketch wave 진입 (별도 /gsd:quick 으로 시작)

**금지**: "wave 1 완벽" / "W2 진입 가능" / "approved" 같은 자신감 표현. 결과 보여주고 사용자 판단.

  </action>
  <verify>
    <automated>
test "$(grep -cE '^# §[1-8]\.' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md)" -eq 8 && \
test "$(grep -cE '^\| W[2-7] ' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md)" -ge 6 && \
test "$(grep -c '^```' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md)" -ge 6 && \
test "$(grep -oE 'feedback_[a-z_]+\.md' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md | sort -u | wc -l | tr -d ' ')" -ge 10 && \
test "$(grep -cE '^- \*\*OQ #' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md)" -ge 5 && \
test "$(grep -c 'wrangler' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md)" -ge 1 && \
test "$(grep -c 'npm run deploy' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md)" -ge 1 && \
test -z "$(git diff --name-only HEAD -- cha-bio-safety/src)" && \
test -z "$(ls cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-*.html 2>/dev/null)" && \
echo "PASS: 8 verify gates + 2 negative gates"
    </automated>
  </verify>
  <done>
- cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md 파일 존재 + 헤더 §1~§8 8개 모두 채워짐
- §1 인벤토리에 line 범위 6 영역 모두 박제 (1~53 / 56~307 / 336~664 / 667~729 / 733~822 / 833~1216)
- §2 sub-wave 분배 표 W2~W7 6행 모두 있음 + sketch 파일명 6개 명시
- §3 design-system §1.1 / §1.2 / §1.3 / §6.1 / §6.2 / §6.4 / §7.1 7건 fence verbatim (§6.1/§6.2 미적용 메타 동반)
- §4 inherit 매핑 표 ≥3 row + 신규 class bullet ≥10 (실제 ≥38)
- §5 메모리 룰 12건 inline (unique feedback_* slug ≥10)
- §6 negative rule ≥8건 (wrangler / npm run deploy / 평면 폴더 / App.tsx / worklog-1.png / 비즈 시그니처 등)
- §7 OQ 6건 (그라데이션 / readOnly UX / OK-BAD 색상 / 미래월 비활성 / WorkLogPortraitPreview wrapper-only / ⚠ 글리프) + 각 default 답
- §8 verify gate 8개 명령+기대값 표 박제
- WorkLogPage.tsx 코드 변경 0 (`git diff --name-only HEAD -- cha-bio-safety/src` 빈 출력)
- sketch HTML 0개 (`ls .../sketch-wave-*.html` 빈 출력)
- atomic commit 1건 (wave-1-index.md 단일 파일 + .planning/quick 산출물)
  </done>
</task>

</tasks>

<verification>
- §8 verify gate 8개 모두 PASS
- `git diff --name-only HEAD -- cha-bio-safety/src` 빈 출력 (src/** 변경 0)
- `git status --porcelain | grep -v '^?? .planning/' | grep -v 'docs/redesign-context/18-worklog/wave-1-index.md'` 빈 출력 (오직 wave-1-index.md 와 .planning/ 만 변경)
- `ls cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-*.html` 빈 출력 (sketch 0개)
- `wc -l cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` ≥350 lines (15-daily-report 428 lines 기준 ±20%)
</verification>

<success_criteria>
- 단일 markdown `cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` 작성 완료
- 8 verify gate + 3 negative gate 모두 PASS
- WorkLogPage.tsx + components.css + App.tsx 모두 변경 0
- 다음 step (W2 sketch) 진입에 필요한 모든 룰 / 시그니처 / OQ 박제 완료
- 사용자 OQ 6건 답변 대기 상태로 보고 (자신감 표현 금지)
</success_criteria>

<output>
After completion, the executor reports:
1. wave-1-index.md 파일 경로 + 라인 수
2. §8 verify gate 결과 (명령 + 실측 출력)
3. §7 OQ 6건 default 답 요약
4. "다음 단계 = OQ 답변 후 W2 sketch wave (별도 /gsd:quick)" 1줄

Quick 모드 — 별도 SUMMARY.md 작성 안 함 (`/gsd:quick` 룰).
</output>

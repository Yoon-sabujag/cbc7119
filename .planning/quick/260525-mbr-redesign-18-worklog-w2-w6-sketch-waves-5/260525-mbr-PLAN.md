---
phase: quick-260525-mbr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html
  - cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-basic-info-categories.html
  - cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-defect-report.html
  - cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-footer-desktop-layout.html
  - cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-6-portrait-preview-wrapper.html
autonomous: true
requirements:
  - REDESIGN-18-WORKLOG-W2
  - REDESIGN-18-WORKLOG-W3
  - REDESIGN-18-WORKLOG-W4
  - REDESIGN-18-WORKLOG-W5
  - REDESIGN-18-WORKLOG-W6

must_haves:
  truths:
    - "W2 sketch 가 WorkLogPage 모바일 헤더 + 월 네비를 디자인 토큰으로 시각화 (미래 월 ‹/› disabled + monthPicker max OQ #4)"
    - "W3 sketch 가 기본 정보 + 4 카테고리 카드 (공통 WorkLogSection 패턴) 를 시각화 (admin readOnly opacity 0.5 OQ #2 + 양호/불량 status 색 OQ #3 + 보고/조치방법 의미 분리)"
    - "W4 sketch 가 불량사항 개선보고 카드 (보고일시 + 보고방법 + 조치방법) 를 시각화 (저장 button solid bg-safe-bar OQ #1)"
    - "W5 sketch 가 footerButtons + 모바일 고정 푸터 + 데스크톱 좌측편집/우측A4 분기 layout 을 시각화 (OQ #1 solid 통일)"
    - "W6 sketch 가 WorkLogPortraitPreview wrapper 만 시각화 (캘리브 33 step + overlayItems 100% 보존 OQ #5 + ⚠ → lucide AlertTriangle OQ #6)"
    - "5 sketch 가 평면 sibling 패턴 (18-worklog/sketch-wave-N-*.html, sketch/ 서브폴더 X) 으로 배치"
    - "5 sketch 어디에도 src/ / components.css / App.tsx 비즈 anchor 1 byte 변경 X"
    - "5 sketch 어디에도 9·10·11px 폰트 0건 (캘리브 안내 바 예외 W6 안에서만)"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html"
      provides: "W2 모바일 헤더 + 월 네비 sketch (3~4 frame)"
    - path: "cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-basic-info-categories.html"
      provides: "W3 기본 정보 + 4 카테고리 카드 sketch (3~4 frame)"
    - path: "cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-defect-report.html"
      provides: "W4 불량사항 개선보고 카드 sketch (3~4 frame)"
    - path: "cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-footer-desktop-layout.html"
      provides: "W5 footerButtons + 모바일/데스크톱 layout sketch (3~4 frame)"
    - path: "cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-6-portrait-preview-wrapper.html"
      provides: "W6 WorkLogPortraitPreview wrapper sketch (3~4 frame)"
  key_links:
    - from: "5 sketch HTML"
      to: "wave-1-index.md §1 인벤토리 + §2 sub-wave 분배"
      via: "verbatim 인용 (재서술 X)"
      pattern: "wave-1-index"
    - from: "5 sketch HTML"
      to: "WorkLogPage.tsx 비즈 anchor (line 範위)"
      via: "디자인 시안만 변경, 비즈 로직 0 byte"
      pattern: "WorkLogPage"
    - from: "5 atomic commit"
      to: "main branch (5b15bff 후속)"
      via: "1 task = 1 commit, 최종 SUMMARY commit 별도"
      pattern: "atomic"
---

<objective>
redesign/18-worklog W2~W6 sketch waves 5 atomic.

Purpose: WorkLogPage.tsx (1216 라인) 5 영역을 5 개 sketch HTML 로 시각화. wave-1-index.md §2 분배 그대로 mirror.

Output: 5 sketch HTML (평면 sibling) + 5 atomic git commit.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md

**단일 진입점 룰:**
- wave-1-index.md 1개만 읽으면 모든 룰/인벤토리/sub-wave 분배/OQ default 6건 박제됨.
- 본 PLAN 은 task 박스만 가지고, wave-1-index.md §1·§2·§3·§4·§5·§6·§7 verbatim 재서술 금지.
- 각 task action 은 §2.1 의 "보존 / 토큰 / 폰트" 박스 인용으로 끝낸다.

**Negative gate (5 task 공통):**
- `git diff --name-only HEAD~5 HEAD -- cha-bio-safety/src` → 빈 출력 (src 손대지 않음)
- `git diff --name-only HEAD~5 HEAD -- cha-bio-safety/src/styles/components.css` → 빈 출력
- `git diff --name-only HEAD~5 HEAD -- cha-bio-safety/src/App.tsx` → 빈 출력
- `grep -rE 'wrangler|npm run deploy' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-*.html` → 빈 출력 (디자인 워크트리 룰, sketch annotation 메타에서만 박제 X)

**OQ default LOCKED (wave-1-index.md §7):**
- OQ #1: 저장 button solid `bg-safe-bar` (그라데이션 폐기)
- OQ #2: admin readOnly opacity 0.5
- OQ #3: 양호 = status-safe / 불량 = status-danger / 보고·조치방법 = status-accent
- OQ #4: 미래 월 ‹/› disabled + monthPicker max=현재월
- OQ #5: 캘리브 33 step 100% 보존
- OQ #6: line 1185 ⚠ → lucide `<AlertTriangle size={14} />`

**메모리 룰 slug (≥10 unique, wave-1-index.md §5 박제):**
- feedback_tailwind_w8_h8_is_48px (w-8=48px 함정)
- feedback_text_caption_leading_none (작은 컨테이너 leading-none)
- feedback_planner_prompt_sketch_verbatim (sketch CSS verbatim 인용)
- feedback_sketch_realistic_data (분기/라벨 룰 그대로)
- feedback_redesign_sketch_rule_enforcement (§6.2/§6.3 일관성)
- feedback_tsx_wave_emoji_dot_gap (dot span markup 보존)
- feedback_avoid_premature_confirmation (시각 결과는 사용자 판단)
- feedback_design_changes_ask_first (레이아웃 변경 사전 컨펌)
- feedback_bottomnav_gap_style (고정 푸터 paddingBottom 키우기)
- feedback_design_sketch_first (디자인 조정은 시안 먼저)

**비즈 anchor 박제 (5 sketch 공통 — 디자인만 손댐, 비즈 로직 0 byte):**
- WorkLogPortraitPreview 내부 캘리브 33 step (`WORKLOG_CALIB_STEPS`, line 833~867)
- WORKLOG_CALIB_KEY = 'calib_worklog' / FINGER_OFFSET = 60 (line 869~870)
- WorkLogSection 컴포넌트 props 시그니처 (4 카테고리 공통)
- handleSave / saveMutation (line 249~280)
- changeMonth / addMonths / thisMonthKST (line 13~22, 190~201)
- monthPickerRef + showPicker?.() ?? click() (line 333, 715)
- workLogApi.{get,preview,save} (line 98~110, 249~280)
- generateWorkLogExcel (line 283~302)
- isAdmin = staff?.role === 'admin' (line 61, 14 readOnly 분기 single source)
- fireResult/escapeResult 2-state vs gasResult/etcResult 3-state 분기 (line 69/72 vs 75/78)
- App.tsx line 41/71/101/294 chrome 등록 (lazy import / MOBILE_NO_NAV_PATHS / 데스크톱 헤더 타이틀 / Route)
</context>

<tasks>

<task type="auto">
  <name>T1: sketch-wave-2-mobile-header-month-nav.html (모바일 헤더 + 월 네비)</name>
  <files>cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html</files>
  <action>
WorkLogPage.tsx line 801~809 (모바일 헤더) + 709~730 (monthNav) 의 sketch HTML 단일 파일 산출.

**Frame 권장 3~4:**
- Frame A: 모바일 헤더 default — 뒤로 button (.back-btn w-[34px] h-[34px], lucide ChevronLeft size=15) + 타이틀 '업무 수행 기록표' (.page-title 18px text-title) + monthNav (.month-nav)
- Frame B: 월 네비 default — ‹ button (.month-nav-btn w-[28px] h-[28px] leading-none) + 월 표시 (.month-display min-w-[90px] 15~16px leading-none) + › button
- Frame C: 월 네비 미래월 disabled — ‹ enabled / › disabled (opacity 0.4, cursor not-allowed) — **OQ #4 적용**
- Frame D (선택): 숨겨진 input type='month' picker open — max="현재월 YYYY-MM" 명시

**토큰 (wave-1-index.md §2.1 W2 verbatim):**
- 헤더 = `.page-header` (14-reports inherit)
- 뒤로 버튼 = `.back-btn` (14-reports inherit, w-[34px] — memory `feedback_tailwind_w8_h8_is_48px` w-8=48 함정 회피)
- 타이틀 = `.page-title` (18px, 현 14 → 18 상향)
- 월 네비 = 신규 `.month-nav` / `.month-nav-btn` (w-[28px] h-[28px] 명시)
- 월 표시 = `.month-display` (min-w 90px leading-none — memory `feedback_text_caption_leading_none`)
- picker trigger = `.month-picker-trigger` (button 안 숨겨진 input)

**폰트:** 타이틀 18px text-title / 월 표시 15~16 text-body / ‹/› 16px. **9·10·11px 0건.**

**비즈 anchor 보존 (디자인만, 시안 안 메타 코멘트):**
- useNavigate(-1) (802)
- changeMonth (190~201, prevYmRef/loadedRef 리셋 + 14 state 초기화)
- addMonths(ym, ±1) (18~22)
- monthPickerRef.current?.showPicker?.() ?? click() (715)
- input type='month' 숨김 markup (720~726, opacity 0 pointerEvents none width 1 height 1)
- ym 형식 'YYYY-MM' (63)

Sketch annotation 안에 `<!-- OQ #4: 미래 월 disabled + monthPicker max -->` 메타 1줄 + 메모리 slug `feedback_tailwind_w8_h8_is_48px` / `feedback_text_caption_leading_none` 1줄.

산출 후 commit:
```
git add cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html
git commit -m "docs(redesign/18-worklog): W2 sketch mobile header + month nav (OQ #4 future month disabled)"
```
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html && grep -c 'disabled' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html | awk '{exit !($1>=1)}' && grep -c 'max="' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html | awk '{exit !($1>=1)}' && grep -cE 'fontSize:\s*(9|10|11)px|text-\[(9|10|11)px\]|font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html | awk '{exit !($1==0)}' && grep -c 'OQ #4' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-mobile-header-month-nav.html | awk '{exit !($1>=1)}' && git log -1 --pretty=%s | grep -q 'W2 sketch'</automated>
  </verify>
  <done>sketch-wave-2 HTML 존재 + disabled ≥1건 + max="" ≥1건 + 9·10·11px 0건 + OQ #4 anchor ≥1건 + atomic commit 1건</done>
</task>

<task type="auto">
  <name>T2: sketch-wave-3-basic-info-categories.html (기본정보 + 4 카테고리 5 카드, 공통 WorkLogSection 패턴)</name>
  <files>cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-basic-info-categories.html</files>
  <action>
WorkLogPage.tsx line 339~605 (기본정보 + 소방시설/피난방화/화기취급/기타 4 카테고리) sketch HTML 단일 파일 산출. 5 카드 = 기본정보 1 + 카테고리 4.

**Frame 권장 3~4:**
- Frame A: 기본정보 카드 — "기본 정보" 18px text-title + "관리자" 12px text-caption 라벨 + input managerName (.worklog-textarea / inputStyle)
- Frame B: 소방시설 카드 default — confirmation textarea (rows=4) + 양호/불량 토글 2-state + 조치내역 textarea (rows=3) — **양호 = bg-safe-bar / 불량 = bg-danger-bar 인라인 시각 (OQ #3 status 색)**
- Frame C: admin readOnly state — 14 input/textarea opacity 0.5 + cursor default (OQ #2) — 1 카드 적용 예시
- Frame D (선택): 4 카테고리 carousel/grid 동일 패턴 시각화 — 공통 WorkLogSection props 박제

**토큰 (wave-1-index.md §2.1 W3 verbatim):**
- 카드 wrapper = 신규 `.worklog-section-card` (bg-surface-raised + border-border-default + rounded-md + padding 14 + marginBottom 10)
- 카드 제목 = `.worklog-section-title` (text-title 18, 현 13 → 18 상향)
- 필드 라벨 = `.worklog-field-label` (text-caption 12, 현 11 → 12 상향)
- textarea = `.worklog-textarea` (text-body 16 검토 또는 text-body-sm 14)
- 결과 토글 = `.worklog-result-toggle` / `--ok` (bg-safe-bar 또는 var(--safe)) / `--bad` (bg-danger-bar 또는 var(--danger)) / `--unselected` (bg-surface-sunken text-text-secondary)
- 조치내역 라벨 = `.worklog-action-label` / `--bad` (color var(--warn) — result==='bad' 시)

**폰트:** 라벨 11→12 / 카드 제목 13→18 / 토글 12 유지 / textarea 12→14~16 검토. **9·10·11px 0건.** "양호" / "불량" 텍스트 verbatim (memory `feedback_sketch_realistic_data`).

**비즈 anchor 보존 (시안 안 메타 코멘트):**
- 5 카드 공통 card wrapper (line 32~35)
- 4 카테고리 동일 패턴 → 공통 WorkLogSection 추출 후보 (18-worklog.md §4 지시)
- fireResult/escapeResult **2-state** ('ok'\|'bad') vs gasResult/etcResult **3-state** (''\|'ok'\|'bad') 분기 보존 (line 380/391 vs 505/516/567/578 `=== val ? '' : val` unset 토글)
- 조치내역 라벨 color var(--warn) if result==='bad' (404/467/529/591)
- readOnly={!isAdmin} 분기 14건 (348/368/410/431/473/493/535/555/597)
- skeleton 폴백 markup 보존 (line 51 skeletonStyle, isLoading 분기)

Sketch annotation: `<!-- OQ #2: admin readOnly opacity 0.5 -->` + `<!-- OQ #3: 양호/불량 status-safe/status-danger 색 -->` + 메모리 slug `feedback_sketch_realistic_data` / `feedback_redesign_sketch_rule_enforcement` 각 1줄.

산출 후 commit:
```
git commit -m "docs(redesign/18-worklog): W3 sketch basic info + 4 categories (OQ #2 readOnly + OQ #3 status colors)"
```
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-basic-info-categories.html && grep -c 'worklog-section' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-basic-info-categories.html | awk '{exit !($1>=3)}' && grep -cE 'opacity:\s*0\.5|opacity-50' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-basic-info-categories.html | awk '{exit !($1>=1)}' && grep -cE 'safe|danger' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-basic-info-categories.html | awk '{exit !($1>=2)}' && grep -cE 'fontSize:\s*(9|10|11)px|text-\[(9|10|11)px\]|font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-basic-info-categories.html | awk '{exit !($1==0)}' && grep -cE 'OQ #2|OQ #3' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-basic-info-categories.html | awk '{exit !($1>=2)}' && git log -1 --pretty=%s | grep -q 'W3 sketch'</automated>
  </verify>
  <done>sketch-wave-3 HTML 존재 + worklog-section class ≥3건 + opacity 0.5 ≥1건 + safe/danger ≥2건 + 9·10·11px 0건 + OQ #2 + OQ #3 anchor + atomic commit 1건</done>
</task>

<task type="auto">
  <name>T3: sketch-wave-4-defect-report.html (불량사항 개선보고 카드, 18 특화)</name>
  <files>cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-defect-report.html</files>
  <action>
WorkLogPage.tsx line 607~662 (불량사항 개선보고 카드) sketch HTML 단일 파일 산출. 18-worklog 특화 카드 (다른 페이지에 없음).

**Frame 권장 3~4:**
- Frame A: 카드 default — "불량사항 개선보고" 18px + 보고일시 3 input (year w65 / month w40 / day w40, center) + '.' span × 2 + 보고방법 3 토글 (대면/서면/정보통신) + 조치방법 4 토글 (이전/제거/수리·교체/기타)
- Frame B: 조치방법 'other' 선택 시 fixOtherText input inline 노출 — maxLength={10}, width 160, marginTop 8
- Frame C: 보고방법/조치방법 unset 상태 (모두 unselected) — default empty 시각
- Frame D (선택): 저장 button (OQ #1 solid `bg-safe-bar` preview)

**토큰 (wave-1-index.md §2.1 W4 verbatim):**
- 카드 = `.worklog-section-card` (W3 재사용)
- 보고일시 wrapper = 신규 `.worklog-report-date` (flex gap 6 align center)
- 보고일시 input = `.worklog-report-date-input` (text-align center / 65px / 40px / 40px)
- dot 사이 span = `.worklog-report-dot` (텍스트 "." fontSize 12 — memory `feedback_tsx_wave_emoji_dot_gap` dot span markup 보존)
- 토글 = `.worklog-method-btn` / `--selected` (bg var(--acl) — accent 토큰)
- 기타 input = `.worklog-fix-other-input` (width 160, marginTop 8)

**폰트:** 라벨 11→12 / 토글 12 유지 / dot 12 유지 / input 13 유지. **9·10·11px 0건.**

**비즈 anchor 보존 (시안 안 메타 코멘트):**
- 보고일시 3 input (line 613/615/617) + '.' span × 2 (614/616 fontSize 12)
- 보고방법 3 토글 `[['face','대면'], ['written','서면'], ['telecom','정보통신']]` (622~633) — `=== val ? '' : val` unset 토글 패턴
- 조치방법 4 토글 `[['relocate','이전'], ['remove','제거'], ['repair','수리·교체'], ['other','기타']]` (638~649)
- fixMethod === 'other' 시 fixOtherText input inline 노출 (line 651~661, maxLength={10}, width: 160, marginTop: 8)
- readOnly={!isAdmin} 4건

Sketch annotation: `<!-- OQ #1: 저장 button solid bg-safe-bar (그라데이션 폐기) -->` + 메모리 slug `feedback_tsx_wave_emoji_dot_gap` / `feedback_text_caption_leading_none` 각 1줄.

산출 후 commit:
```
git commit -m "docs(redesign/18-worklog): W4 sketch defect report card (OQ #1 solid save button)"
```
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-defect-report.html && grep -c 'worklog-report-date' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-defect-report.html | awk '{exit !($1>=1)}' && grep -c 'worklog-method-btn\|worklog-fix' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-defect-report.html | awk '{exit !($1>=2)}' && grep -cE 'maxLength|max-length|maxlength' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-defect-report.html | awk '{exit !($1>=1)}' && grep -cE 'fontSize:\s*(9|10|11)px|text-\[(9|10|11)px\]|font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-defect-report.html | awk '{exit !($1==0)}' && grep -c 'OQ #1' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-defect-report.html | awk '{exit !($1>=1)}' && git log -1 --pretty=%s | grep -q 'W4 sketch'</automated>
  </verify>
  <done>sketch-wave-4 HTML 존재 + worklog-report-date ≥1 + method/fix class ≥2 + maxLength ≥1 + 9·10·11px 0건 + OQ #1 anchor + atomic commit 1건</done>
</task>

<task type="auto">
  <name>T4: sketch-wave-5-footer-desktop-layout.html (footerButtons + 모바일/데스크톱 layout 분기)</name>
  <files>cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-footer-desktop-layout.html</files>
  <action>
WorkLogPage.tsx line 667~707 (footerButtons) + 733~793 (데스크톱 분기 외곽) + 796~828 (모바일 분기 외곽) sketch HTML 단일 파일 산출.

**Frame 권장 3~4:**
- Frame A: 모바일 footer default — 저장 button (flex 1, solid `bg-safe-bar` — OQ #1) + 엑셀 출력 button (border 보조) + 모바일 고정 푸터 wrapper paddingBottom calc(10px + var(--sab)) (iOS safe-area)
- Frame B: 저장 button isDirty 시 '· 수정됨' indicator (text-caption text-status-warning leading-none, fontSize 11 → 12 상향)
- Frame C: 데스크톱 layout — 좌측 편집 패널 (flex 1 padding '24px 32px', monthNav flex-end top) + 우측 A4 패널 (aspectRatio 210/297 borderLeft 1px) + "인쇄 미리보기" 라벨 (fontSize 11 → 12 상향, text-caption uppercase position absolute top-2)
- Frame D (선택): 저장 disabled / 저장 중 상태 (bg-surface-sunken text-text-tertiary)

**토큰 (wave-1-index.md §2.1 W5 verbatim):**
- footer wrapper = 신규 `.worklog-footer` (flex gap 8 / 모바일 fixed bottom / 데스크톱 inline)
- 저장 button = `.worklog-footer-save` (`bg-safe-bar` solid — OQ #1 default)
- 저장 disabled = `.worklog-footer-save--disabled` (bg-surface-sunken text-text-tertiary)
- 저장 dirty indicator = `.worklog-footer-save-dirty` (text-caption text-status-warning leading-none)
- 엑셀 출력 = `.worklog-footer-export` (bg-surface-raised border-border-default)
- 모바일 고정 푸터 = `.worklog-mobile-footer` (position fixed paddingBottom safe-area)
- 데스크톱 layout = `.worklog-desktop-layout` (flex row h-full)
- 좌측 = `.worklog-desktop-edit-panel` (flex 1 overflow auto padding '24px 32px')
- 우측 = `.worklog-desktop-preview-panel` (aspectRatio 210/297 borderLeft)

**폰트:** 데스크톱이라도 모바일과 동일 (§1.3 절대 룰). 저장/엑셀 13 유지 또는 16 상향 검토. "인쇄 미리보기" 11 → 12 text-caption 상향. **9·10·11px 0건.**

**비즈 anchor 보존 (시안 안 메타 코멘트):**
- 저장 그라데이션 (line 679 `linear-gradient(135deg,#1d4ed8,#2563eb)`) → solid `bg-safe-bar` 통일 (OQ #1)
- 엑셀 출력 보조 button border 유지
- '· 수정됨' isDirty 분기 (line 685~687)
- 모바일 고정 푸터 paddingBottom calc(10px + var(--sab)) 보존 (iOS safe-area, memory `feedback_bottomnav_gap_style` 친척)
- height 72 spacer 보존 (line 814, 고정 푸터 회피)
- 데스크톱 좌측 padding '24px 32px' (line 739)
- 우측 aspectRatio '210/297' borderLeft 1px (751~759)
- "인쇄 미리보기" 라벨 (line 760~767) — 11 → 12 상향

Sketch annotation: `<!-- OQ #1: 저장 button solid bg-safe-bar -->` + 메모리 slug `feedback_bottomnav_gap_style` / `feedback_text_caption_leading_none` 각 1줄.

산출 후 commit:
```
git commit -m "docs(redesign/18-worklog): W5 sketch footer + mobile/desktop layout (OQ #1 solid save)"
```
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-footer-desktop-layout.html && grep -c 'worklog-footer\|worklog-desktop\|worklog-mobile-footer' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-footer-desktop-layout.html | awk '{exit !($1>=3)}' && grep -cE 'bg-safe-bar|var\(--safe\)' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-footer-desktop-layout.html | awk '{exit !($1>=1)}' && grep -cE 'linear-gradient' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-footer-desktop-layout.html | awk '{exit !($1==0)}' && grep -cE 'fontSize:\s*(9|10|11)px|text-\[(9|10|11)px\]|font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-footer-desktop-layout.html | awk '{exit !($1==0)}' && grep -c 'OQ #1' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-footer-desktop-layout.html | awk '{exit !($1>=1)}' && git log -1 --pretty=%s | grep -q 'W5 sketch'</automated>
  </verify>
  <done>sketch-wave-5 HTML 존재 + footer/desktop/mobile-footer class ≥3 + safe solid ≥1 + linear-gradient 0건 + 9·10·11px 0건 + OQ #1 anchor + atomic commit 1건</done>
</task>

<task type="auto">
  <name>T5: sketch-wave-6-portrait-preview-wrapper.html (WorkLogPortraitPreview wrapper-only)</name>
  <files>cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-6-portrait-preview-wrapper.html</files>
  <action>
WorkLogPage.tsx line 884~1190 (WorkLogPortraitPreview 컴포넌트) **wrapper-only** sketch HTML 단일 파일 산출. **내부 캘리브 33 step / overlayItems 33건 / WORKLOG_CALIB_STEPS / WorkLogCalibMarker / 좌표 시스템 100% 보존 (디자인 1 byte X)**.

**Frame 권장 3~4:**
- Frame A: 외곽 wrapper default — `<img src="/templates/preview/worklog-1.png">` (maxWidth/maxHeight 100% objectFit contain rounded-sm bg-white boxShadow) + "인쇄 미리보기" 라벨 (text-caption text-text-secondary uppercase position absolute top-2 leading-none) + 위치 설정 button 우하단
- Frame B: hasCalib=false 시 위치 설정 button — bg rgba(239,68,68,0.9) `bg-danger-bar` + 텍스트 'AlertTriangle 위치 설정' (lucide `<AlertTriangle size={14} />` — OQ #6, ⚠ 글리프 폐기)
- Frame C: hasCalib=true 시 위치 재설정 button — bg rgba(0,0,0,0.6) + 텍스트 '위치 재설정' (lucide 없음)
- Frame D (선택): 캘리브 모드 진입 시 안내 바 — line 1141~1170 위치/색/폰트 그대로 (fontSize 14·11·13·12 예외 허용 — 캘리브 안내 바 정보 노출 UX)

**토큰 (wave-1-index.md §2.1 W6 verbatim):**
- 외곽 wrapper = 신규 `.worklog-portrait-wrapper` (W5 우측 패널 inherit)
- `<img>` = `.worklog-portrait-image` (maxWidth/maxHeight 100% objectFit contain rounded-sm bg-white boxShadow)
- 오버레이 영역 = `.worklog-portrait-overlay-area` (position absolute pointerEvents 캘리브 모드 분기)
- "인쇄 미리보기" 라벨 = `.worklog-portrait-print-label` (text-caption text-text-secondary uppercase position absolute top-2 leading-none)
- 캘리브 안내 바 = `.worklog-portrait-calib-bar` (line 1141~1170 — position absolute top-2 translateX padding 10/20 fontWeight 700)
- 확인 버튼 = `.worklog-portrait-calib-confirm` (bg #22c55e solid)
- 취소 버튼 = `.worklog-portrait-calib-cancel` (bg overlay rgba(255,255,255,0.15))
- 십자 마커 = `.worklog-portrait-calib-marker` (W6 컴포넌트 안 markup)
- 위치 설정 버튼 = `.worklog-portrait-setup-btn`
- 미설정 강조 = `.worklog-portrait-setup-btn--missing` (bg rgba(239,68,68,0.9))

**폰트:** 캘리브 안내 바 폰트 14·11·13·12 (line 1145/1154/1157/1163/1168) **그대로 — 오버레이 UI 정보 노출 UX 예외 허용** (캘리브 안내 바 안에서만 9·10·11 허용, 외곽 wrapper 는 0건). 위치 설정 button fontSize 12 = text-caption (OK). 외곽 wrapper 만 토큰화.

**비즈 anchor 보존 — 1 byte 변경 X (시안 안 메타 코멘트로 박제만):**
- WORKLOG_CALIB_STEPS 33 key (line 833~867: perf 5 + manager 1 + fire/escape/gas/etc × 4 = 16 + rpt 3 + rptMethod 3 + fix 5)
- WORKLOG_CALIB_KEY = 'calib_worklog' (line 869)
- FINGER_OFFSET = 60 (line 870)
- loadWorkLogCalib / saveWorkLogCalib (line 876~881)
- WorkLogPortraitPreview 21 props 시그니그 (line 768~789)
- AREA_KEYS Set (line 1011) — 6 영역 textarea isArea true (gasAction/etcAction 는 overlayItems 에서 isArea true 명시, AREA_KEYS Set 는 legacy — 분기 변경 금지)
- overlayItems 33건 conditional (line 1023~1057)
- WorkLogCalibMarker (line 1193~1216, 십자 40×2 + 2×40 + 라벨 active 16→20 확대)
- 이미지 src "/templates/preview/worklog-1.png" (line 1071, 변경/이동 금지)
- 캘리브 함수 6건 (onCalibTouchStart/Move/End/Click, clientToImgPct, advanceStep, confirmPoint)

Sketch annotation: `<!-- OQ #5: 캘리브 33 step 100% 보존 -->` + `<!-- OQ #6: line 1185 ⚠ → lucide AlertTriangle size=14 -->` + 메모리 slug `feedback_sketch_realistic_data` / `feedback_planner_prompt_sketch_verbatim` 각 1줄.

산출 후 commit (5번째 atomic):
```
git commit -m "docs(redesign/18-worklog): W6 sketch portrait preview wrapper (OQ #5 calib preserved + OQ #6 lucide AlertTriangle)"
```
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-6-portrait-preview-wrapper.html && grep -c 'worklog-portrait' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-6-portrait-preview-wrapper.html | awk '{exit !($1>=4)}' && grep -cE 'AlertTriangle|lucide' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-6-portrait-preview-wrapper.html | awk '{exit !($1>=1)}' && grep -cE 'worklog-1\.png|templates/preview' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-6-portrait-preview-wrapper.html | awk '{exit !($1>=1)}' && grep -cE 'OQ #5|OQ #6' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-6-portrait-preview-wrapper.html | awk '{exit !($1>=2)}' && git diff --name-only HEAD~5 HEAD -- cha-bio-safety/src cha-bio-safety/src/styles/components.css cha-bio-safety/src/App.tsx | wc -l | awk '{exit !($1==0)}' && git log --oneline -5 | grep -cE 'W[2-6] sketch' | awk '{exit !($1==5)}'</automated>
  </verify>
  <done>sketch-wave-6 HTML 존재 + worklog-portrait class ≥4 + AlertTriangle/lucide ≥1 + worklog-1.png src 보존 ≥1 + OQ #5 + OQ #6 anchor ≥2 + src/components.css/App.tsx 5 commit 전체 diff 0 byte + 5 atomic commit (W2~W6) 모두 검출</done>
</task>

</tasks>

<verification>
**전체 phase verify (5 task 완료 후 일괄):**

```bash
# 1. 5 sketch HTML 모두 존재 (평면 sibling, sketch/ 서브폴더 X)
ls cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-{2,3,4,5,6}-*.html

# 2. 5 atomic commit 검증 (W2~W6 순서)
git log --oneline -5 | grep -cE 'W[2-6] sketch' # = 5

# 3. src / components.css / App.tsx 0 byte diff (디자인만 손댐)
git diff --name-only HEAD~5 HEAD -- cha-bio-safety/src # 빈 출력
git diff --name-only HEAD~5 HEAD -- cha-bio-safety/src/styles/components.css # 빈 출력
git diff --name-only HEAD~5 HEAD -- cha-bio-safety/src/App.tsx # 빈 출력

# 4. 디자인 워크트리 룰 (wrangler/npm run deploy 흔적 X)
grep -rE 'wrangler|npm run deploy' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-*.html # 빈 출력

# 5. 9·10·11px 0건 (W6 캘리브 안내 바 예외 — Frame D 메타 coment 안에서만 허용)
for f in cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-{2,3,4,5}-*.html; do
  c=$(grep -cE 'fontSize:\s*(9|10|11)px|text-\[(9|10|11)px\]|font-size:\s*(9|10|11)px' "$f")
  [ "$c" = "0" ] || echo "FAIL: $f has $c bad fontSize"
done

# 6. OQ # anchor 박제 5 sketch 분산
grep -c 'OQ #' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-2-*.html # ≥1 (#4)
grep -c 'OQ #' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-3-*.html # ≥2 (#2 #3)
grep -c 'OQ #' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-4-*.html # ≥1 (#1)
grep -c 'OQ #' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-5-*.html # ≥1 (#1)
grep -c 'OQ #' cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-6-*.html # ≥2 (#5 #6)
```

**최종 SUMMARY commit (6번째, 본 plan 외 별도 — execute-plan workflow 가 처리):**
```
git commit -m "docs(quick-260525-mbr): W2~W6 5 sketch waves atomic SUMMARY"
```
</verification>

<success_criteria>
- 5 sketch HTML (sketch-wave-2 / 3 / 4 / 5 / 6) 평면 sibling 패턴으로 18-worklog/ 폴더에 존재
- 5 atomic commit (W2 → W3 → W4 → W5 → W6 순서) 모두 main 직진 직선 history
- 6번째 SUMMARY commit (별도)
- src / components.css / App.tsx 5 commit 전체 0 byte 변경
- 9·10·11px 0건 (W6 캘리브 안내 바 Frame D 메타 coment 안 예외)
- OQ # anchor 6건 (#1 ×2 / #2 / #3 / #4 / #5 / #6) 5 sketch 분산 박제
- 비즈 anchor (WORKLOG_CALIB_STEPS 33 / WorkLogPortraitPreview 21 props / monthPickerRef / isAdmin / fireResult vs gasResult state arity / generateWorkLogExcel) 메타 코멘트 박제
- 메모리 slug ≥10 unique inline 인용 (wave-1-index.md §5 mirror, 재서술 X)
</success_criteria>

<output>
After completion:
- 5 sketch HTML at cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-{2,3,4,5,6}-*.html
- 5 atomic commit on main (after 5b15bff)
- SUMMARY at .planning/quick/260525-mbr-redesign-18-worklog-w2-w6-sketch-waves-5/260525-mbr-SUMMARY.md (별도 6번째 commit)
</output>

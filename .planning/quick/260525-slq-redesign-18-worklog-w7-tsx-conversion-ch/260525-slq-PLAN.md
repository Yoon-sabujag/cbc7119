---
phase: 260525-slq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md
autonomous: true
requirements:
  - QUICK-260525-SLQ-W7
must_haves:
  truths:
    - "wave-7-tsx-conversion-checklist.md 가 18-worklog/ 평면 폴더에 생성된다"
    - "markdown 은 12 섹션 헤더(§1~§12) 구조를 모두 포함한다"
    - "비즈 anchor 보존 박스 ≥10 종 명시 (workLogApi / useQuery / useMutation / handleExport / changeMonth / WorkLogPortraitPreview props 20개 / WORKLOG_CALIB_STEPS 33 step / monthPickerRef / isAdmin readOnly 분기 / 양호·불량 / 보고·조치방법 / fixMethod==='other' textarea / 카피 verbatim 18종 / clientToImgPct FINGER_OFFSET=60)"
    - "OQ LOCKED 6건 verbatim 인용 + wave-1-index §7 박제"
    - "5 sketch HTML grep 추출 명령 박제 (executor 가 wave 작성 시점에 실행)"
    - "폰트 격상 매트릭스 — 9·10·11 → 12/14/16 매핑 line 위치까지 박제"
    - "Lucide 아이콘 매핑 (ChevronLeft/ChevronRight/Save/Download/AlertTriangle) + 인라인 SVG 백버튼(line 803~805) 교체 매핑"
    - "components.css inherit vs 신규 정의 명단 (wave-1-index §4 박제)"
    - "Tailwind cheatsheet — status- prefix 없음 + w-8 h-8 함정 inline"
    - "negative gate ≥10 + verify gate ≥8"
    - "메모리 룰 unique slug ≥10 inline"
    - "src/** 변경 0 / components.css 0 / App.tsx 0 / wrangler 0 / npm run deploy 0"
    - "atomic commit 1개 (산출) + SUMMARY 1개 commit = 누적 15 commit"
  artifacts:
    - path: cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md
      provides: "TSX 변환 wave 진입 시 executor 가 단일 진입점으로 사용할 변환 체크리스트"
      contains: "## §1 ~ ## §12 헤더, 비즈 anchor 박스, OQ LOCKED 6건, 5 sketch grep 명령, 폰트 격상 매트릭스, Lucide 매핑, negative/verify gate"
  key_links:
    - from: cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md
      to: cha-bio-safety/src/pages/WorkLogPage.tsx
      via: "verbatim line range 인용 (line 1~53 imports/상수, line 56~333 메인 함수, line 336~707 formContent+footer+monthNav, line 732~829 데스크톱/모바일 렌더, line 833~881 WORKLOG_CALIB 상수, line 884~1190 WorkLogPortraitPreview, line 1193~1216 WorkLogCalibMarker)"
      pattern: "src/pages/WorkLogPage.tsx (1216 lines)"
    - from: cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md
      to: cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md
      via: "§1 인벤토리 / §2 sub-wave 분배 / §5 메모리 룰 / §7 OQ default 박스 박제"
      pattern: "wave-1-index.md (513 lines)"
    - from: cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md
      to: cha-bio-safety/docs/redesign-context/15-daily-report/wave-7-tsx-conversion-checklist.md
      via: "12 섹션 구조 + 비즈 anchor 박스 + Tailwind cheatsheet 패턴 mirror"
      pattern: "934 lines reference"
---

<objective>
redesign/18-worklog WorkLogPage W7 — TSX 변환 wave 진입 직전 단계의 verify checklist markdown 1 개를 작성한다.
산출은 `cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md` 단일 파일.
이 markdown 은 TSX 변환 wave 시점에 executor 가 단일 진입점으로 참조하여:
  (a) 1216 lines WorkLogPage.tsx 영역별로 어떤 sketch class 를 어디에 적용하는지 verbatim 매핑을 알 수 있어야 하고,
  (b) 비즈 anchor (workLogApi / useQuery / useMutation / handleExport / changeMonth / WorkLogPortraitPreview props 20개 / WORKLOG_CALIB_STEPS 33 step / monthPickerRef / isAdmin readOnly 분기 등) 0 byte 변경을 강제하며,
  (c) OQ LOCKED 6건 / 5 sketch HTML grep 추출 / 폰트 격상 매트릭스 / Lucide 매핑 / Tailwind cheatsheet / negative+verify gate 를 1 곳에서 모두 확인할 수 있어야 한다.

Purpose: 14-reports (700 lines mirror) / 15-daily-report (934 lines mirror) 의 4i9 단일 atomic 패턴을 18-worklog 에서도 자동 도달.
Output: 단일 markdown (~1000 lines 예상, 1216 lines TSX 기반이므로 15-daily-report 보다 약간 큼) + atomic commit 1개.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md
@cha-bio-safety/docs/redesign-context/15-daily-report/wave-7-tsx-conversion-checklist.md
@cha-bio-safety/src/pages/WorkLogPage.tsx
</context>

<tasks>

<task type="auto">
  <name>T1: wave-7-tsx-conversion-checklist.md 작성 (단일 atomic)</name>

  <files>cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md</files>

  <action>
W7 TSX 변환 verify checklist markdown 1개를 Write 도구로 생성한다. src/** 0 byte 변경. components.css 0 byte 변경. App.tsx 0 byte 변경. 단일 atomic commit.

## 사전 grep (executor 가 작성 시작 시 실행)

```bash
# 5 sketch HTML class 추출 (W2~W5 의 5 sub-wave sketch 모두 박제)
ls cha-bio-safety/docs/redesign-context/18-worklog/wave-{2,3,4,5}-*.html 2>/dev/null
for f in cha-bio-safety/docs/redesign-context/18-worklog/wave-{2,3,4,5}-*.html; do
  echo "=== $f ==="
  grep -oE 'class="[^"]+"' "$f" | sort -u
done

# OQ LOCKED 6건 추출 (wave-1-index.md §7)
grep -nE '^### OQ #|^- \*\*default:' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md

# components.css 기존 inherit 후보 class 명단 (재사용 vs 신규 분류)
grep -E '^\.(card|chip|btn|stat-|nav-|input-|textarea-)' cha-bio-safety/src/styles/components.css 2>/dev/null | head -60

# 폰트 9·10·11 출현 위치 (WorkLogPage.tsx)
grep -nE "fontSize:\s*1[01]|fontSize:\s*9[^0-9]" cha-bio-safety/src/pages/WorkLogPage.tsx
```

## markdown 구조 (12 섹션 헤더, 정확히 이 순서)

### `## §1 imports 매핑 (line 1~53)`
- 현재: `useState, useEffect, useRef, useCallback` from 'react' + `useNavigate` + react-query 3종 + `toast` + `workLogApi` + `generateWorkLogExcel` + `useAuthStore` + `useIsDesktop` + `WorkLogPayload` type
- 추가 import 예정: `lucide-react` { ChevronLeft, ChevronRight, Save, Download, AlertTriangle } — 인라인 SVG 백버튼(line 803~805) 교체 + 월 네비 ‹/› (line 712, 728) 교체 + 저장 버튼 + 엑셀 출력 버튼 + 위치 미설정 ⚠ (line 1185) 교체
- 상수 보존: `navBtn` `card` `textareaStyle` `iconBtn` `skeletonStyle` (line 25~53) — TSX 변환 후 tailwind class 로 대체되거나 일부 잔존 (테이블 박제 필수)
- `thisMonthKST` / `addMonths` (line 13~22) — 비즈 anchor, verbatim 보존

### `## §2 메인 함수 (line 56~333) — hooks/state/handlers 1:1 verbatim`
박스로 인용:
- `useNavigate` `useQueryClient` `useIsDesktop` `useAuthStore` + `isAdmin = staff?.role === 'admin'`
- 폼 상태 17종 (`managerName/fireContent/fireResult/fireAction/escapeContent/escapeResult/escapeAction/gasContent/gasResult/gasAction/etcContent/etcResult/etcAction/reportYear/reportMonth/reportDay/reportMethod/fixMethod/fixOtherText`) — line 67~86
- `loadedRef` `prevYmRef` `focusedField` `generating` — line 88~95
- `savedQuery` (`workLogApi.get`) + `previewQuery` (`workLogApi.preview`, enabled: savedQuery.data === null) — line 98~110
- 데이터 로드 useEffect 67 줄 (line 113~187) — 월 변경 감지 + savedQuery → previewQuery fallback + payload 매핑 19종 (gas_result/etc_result 기본값 'ok', gas_action/etc_action/report_* ?? '')
- `changeMonth` (line 190~201) — prevYmRef 리셋 + 폼 17종 초기화 + setYm
- `currentPayload` (line 204~224) + `isDirty` (line 226~246) — 19 필드 dirty 비교
- `saveMutation` (line 249~280) — onSuccess: loadedRef 갱신 + invalidateQueries, onError: toast.error
- `handleExport` (line 283~302) — isDirty 시 confirm + saveMutation.mutateAsync 우선 + generateWorkLogExcel
- `isLoading` `isSaving` (line 305~306)
- `roStyle` `taStyle` `inputStyle` (line 308~330) — isAdmin readOnly 분기
- `monthPickerRef` (line 333) — `showPicker?.() ?? click()` 패턴 보존

### `## §3 JSX render (line 336~829) — sketch class 적용`
- `formContent` JSX 18 카드/필드 (line 336~664):
  - 기본 정보 카드 (managerName input)
  - 소방시설 카드 (fireContent textarea rows={4} + 양호/불량 + fireAction textarea rows={3})
  - 피난방화시설 카드 (escapeContent rows={3} + 양호/불량 + escapeAction)
  - 화기취급감독 카드 (gasContent rows={2} + 양호/불량 토글 ↔ 빈 문자열 + gasAction)
  - 기타사항 카드 (etcContent rows={3} + 양호/불량 토글 + etcAction)
  - 불량사항 개선보고 카드 (reportYear/Month/Day inputs width 65/40/40 + 보고방법 3 button [face/written/telecom] + 조치방법 4 button [relocate/remove/repair/other] + fixMethod==='other' 시 fixOtherText input maxLength={10} width 160)
- `footerButtons` (line 667~707) — 저장 (linear-gradient `#1d4ed8` → `#2563eb` !! OQ #1 solid 변환) + 엑셀 출력
- `monthNav` (line 710~730) — navBtn ‹/› + monthPickerRef showPicker hack + `{year}년 {month}월` 표시
- 데스크톱 렌더 (line 733~793) — flex row + 좌측 편집 패널 + 우측 A4 세로 미리보기 (aspectRatio: '210 / 297') + WorkLogPortraitPreview 20 props
- 모바일 렌더 (line 796~829) — header (인라인 SVG 백버튼 line 803~805 → ChevronLeft 교체) + 스크롤 본문 + 고정 푸터 (`position: fixed` + `paddingBottom: calc(10px + var(--sab))`)

### `## §4 비즈 anchor 보존 박스 (≥10 종, 0 byte 변경 강제)`
표 형식으로 박제 (anchor / line / 보존 이유):
1. `workLogApi.get / preview / save` (utils/api.ts) — 0 byte
2. `useQuery({queryKey: ['worklog', ym], queryFn: workLogApi.get})` (line 98~103) — staleTime: 0 보존
3. `useQuery({queryKey: ['worklog-preview', ym], enabled: savedQuery.data === null && savedQuery.isSuccess})` (line 105~110) — fallback 룰 보존
4. `useMutation({mutationFn: workLogApi.save, onSuccess: loadedRef + invalidateQueries})` (line 249~280) — payload 매핑 19 필드 0 byte
5. `handleExport` (line 283~302) — isDirty confirm → saveMutation.mutateAsync 순서 보존, `try { saveMutation.mutateAsync() } catch { return }` 분기
6. `changeMonth` (line 190~201) — prevYmRef='' + loadedRef=null + 17 setter 초기화 + setYm 순서
7. `WorkLogPortraitPreview` props 20개 (line 884~911) — yearMonth + 18 폼필드 + (yearMonth split 으로 year/month 추출하는 내부 로직 line 1020~1021)
8. `WORKLOG_CALIB_STEPS` 33 step (line 833~867) — key/label/color 1 byte 변경 0
9. `WORKLOG_CALIB_KEY = 'calib_worklog'` (line 869) + `FINGER_OFFSET = 60` (line 870) — localStorage 키 변경 금지
10. `monthPickerRef.current?.showPicker?.() ?? monthPickerRef.current?.click()` (line 715) — iOS Safari fallback hack 보존
11. `isAdmin = staff?.role === 'admin'` 분기 — readOnly={!isAdmin} + opacity 0.5 + cursor default + title="관리자만 저장할 수 있습니다" + `isAdmin && setX()` onChange 가드 18+ 위치
12. 양호·불량 토글 룰: fireResult/escapeResult 는 `'ok' | 'bad'` 단순 (false 없음) / gasResult/etcResult 는 `'' | 'ok' | 'bad'` 3-state 토글 (`gasResult === 'ok' ? '' : 'ok'`) — line 380, 391, 443, 454, 505, 516, 567, 578
13. 보고·조치방법: `reportMethod === val ? '' : val` 토글 + `fixMethod === val ? '' : val` 토글 (line 624, 640) — 동일 클릭 시 해제
14. `fixMethod === 'other' && <input ... maxLength={10}>` (line 651~661) — width 160 + slice(0, 10) 보존
15. 카피 verbatim (18종 이상):
    - 헤더 카피: "업무 수행 기록표" / "기본 정보" / "관리자" / "관리자 이름을 입력하세요" / "소방시설" / "확인내용" / "결과" / "조치내역" / "조치 내역 없음" / "피난방화시설" / "화기취급감독" / "기타사항" / "불량사항 개선보고" / "보고일시" / "보고방법" / "조치방법" / "기타 내용 입력"
    - 라벨: "양호" / "불량" / "대면" / "서면" / "정보통신" / "이전" / "제거" / "수리·교체" / "기타"
    - 푸터: "저장" / "저장 중..." / "엑셀 출력" / "출력 중..." / "· 수정됨"
    - confirm: "저장되지 않은 변경사항이 있습니다\\n\\n저장 후 엑셀을 출력하시겠습니까?"
    - toast: "저장되었습니다" / "저장 실패 — 다시 시도해 주세요" / "엑셀 생성 실패 — 다시 시도해 주세요"
    - aria/title: "뒤로 가기" / "관리자만 저장할 수 있습니다" / "인쇄 미리보기"
    - 캘리브: "위치 재설정" / "⚠ 위치 설정" / "확인" / "취소"
16. `clientToImgPct(clientX, clientY, FINGER_OFFSET=60)` (line 945~953) — finger offset 보존, percent clamp [0, 100]
17. WorkLogCalibMarker 시그니처 + 크로스헤어 width 40 / height 40 / 활성 시 width 20 (line 1193~1216) — 0 byte 변경
18. `localStorage.getItem(WORKLOG_CALIB_KEY) ?? 'null'` (line 877) — JSON parse fallback 패턴

### `## §5 OQ LOCKED 6건 verbatim 인용 (wave-1-index.md §7 박제)`
- **OQ #1 default: solid 단색** — 저장 버튼 `linear-gradient(135deg,#1d4ed8,#2563eb)` (line 679) 는 TSX 변환 시 단색으로 변환. (negative gate: TSX 본문에 linear-gradient 0)
- **OQ #2 default: status- prefix 없음** — `bg-fire-bar` / `text-fire-bar` / `bg-safe-bar` 등 사용. `bg-status-fire-bar` 형태 금지.
- **OQ #3 default: 카피/라벨/이모지 0 추가** — sketch 시안에 새 텍스트 등장 시 본 wave 에서 추가 금지 (TSX 변환 wave 에서도 사용자 컨펌 필수)
- **OQ #4 default: components.css 신규 정의는 W7+TSX wave 에서만** — 사전 W2~W5 sketch wave 에서 src/** 0 byte
- **OQ #5 default: 모바일 헤더 백버튼 = lucide ChevronLeft size={20}** — 인라인 SVG (line 803~805) 교체
- **OQ #6 default: 폰트 9·10·11 격상** — 9→12, 10→12, 11→12 (라벨), 12→14 (필드 카피), 13→16 (카드 타이틀/입력) — wave-1-index §7 박제

### `## §6 5 sketch HTML grep 추출 verbatim class 인용`
사전 grep 명령 결과를 fence 로 박제 (executor 가 W7 작성 시 실행 결과 그대로):
```
=== wave-2-{slug}.html ===
class="..." 종류 sort -u
=== wave-3-{slug}.html ===
class="..." 종류 sort -u
=== wave-4-{slug}.html ===
class="..." 종류 sort -u
=== wave-5-{slug}.html ===
class="..." 종류 sort -u
```
(planner 는 명령만 박제, 실제 추출 결과는 executor 가 wave 작성 시 sketch 파일 명단 기반으로 박제)

### `## §7 폰트 격상 매트릭스 — 9·10·11 → 12/14/16`
표 형식 (line / 현재 fontSize / 텍스트 컨텍스트 / 목표 토큰):
- line 340 fontSize:13 fontWeight:700 "기본 정보" → text-base font-bold
- line 341 fontSize:11 "관리자" → text-sm (=12, OQ #6)
- line 359 fontSize:13 fontWeight:700 "소방시설" → text-base font-bold
- line 361 fontSize:11 "확인내용" → text-sm
- line 375 fontSize:11 "결과" → text-sm
- line 382 fontSize:12 fontWeight:700 "양호/불량" → text-sm font-bold
- line 404 fontSize:11 "조치내역" (조건부 색상 var(--warn) vs var(--t2)) → text-sm
- line 422 fontSize:13 "피난방화시설" → text-base font-bold
- line 485 fontSize:13 "화기취급감독" → text-base font-bold
- line 547 fontSize:13 "기타사항" → text-base font-bold
- line 609 fontSize:13 "불량사항 개선보고" → text-base font-bold
- line 611, 620, 636 fontSize:11 라벨 "보고일시/보고방법/조치방법" → text-sm
- line 614, 616 fontSize:12 "." 구분자 → text-sm
- line 626, 642 fontSize:12 fontWeight:700 라벨 버튼 → text-sm font-bold
- line 675, 698 fontSize:13 fontWeight:700 푸터 버튼 → text-base font-bold
- line 686 fontSize:11 fontWeight:400 "· 수정됨" → text-sm (OQ #6: 11 → 12)
- line 716 fontSize:15 fontWeight:700 "{year}년 {month}월" → text-base font-bold
- line 807 fontSize:14 fontWeight:700 "업무 수행 기록표" → text-base (이미 14 이상)
- line 27 fontSize:16 fontWeight:700 navBtn ‹/› → lucide size={16}
- line 767 fontSize:11 "인쇄 미리보기" → text-sm
- line 1108 fontSize:10 isArea 오버레이 → 페이지 출력 룰이라 변경 0 (캘리브 0 byte)
- line 1119 fontSize:12 단일 셀 오버레이 → 페이지 출력 룰이라 변경 0
- line 1145 fontSize:14 캘리브 안내바 → 변경 0
- line 1208 fontSize:10 fontWeight:900 캘리브 마커 라벨 → 변경 0
inline 8 px 이하 발견 시 박제 (현재 발견된 8: line 1013 textStyle 기본값 7 — 페이지 출력 룰이라 변경 0)

### `## §8 Lucide 아이콘 매핑`
표 (현재 / lucide 이름 / size prop / 적용 line):
- 인라인 SVG 백버튼 (line 803~805, 24x24 viewBox, M15 19l-7-7 7-7) → ChevronLeft size={16}
- navBtn ‹ (line 712, fontSize 16 ‹) → ChevronLeft size={16}
- navBtn › (line 728, fontSize 16 ›) → ChevronRight size={16}
- 저장 버튼 (line 682~688, 텍스트 "저장") → Save size={14} (text 옆 또는 단독)
- 엑셀 출력 버튼 (line 704, 텍스트 "엑셀 출력") → Download size={14}
- 위치 미설정 (line 1185, "⚠ 위치 설정") → AlertTriangle size={14} (단, 페이지 출력 영역이므로 OQ 컨펌 필수 — 캘리브 영역 변경 0 룰 충돌 가능, 본 매핑은 "후보" 표기)

### `## §9 components.css inherit vs 신규 정의`
wave-1-index.md §4 박제 (재사용 6 class + 신규 ~40 class 명단):
- 재사용: `.card` / `.card-header` / `.input` / `.textarea` / `.btn` / `.btn-primary`
- 신규 정의 (~40): `.worklog-section-title` / `.worklog-field-label` / `.worklog-field-label--warn` / `.worklog-result-toggle` / `.worklog-result-toggle--ok` / `.worklog-result-toggle--bad` / `.worklog-result-toggle--neutral` / `.worklog-month-nav` / `.worklog-month-nav__btn` / `.worklog-month-nav__label` / `.worklog-footer-buttons` / `.worklog-footer__save` / `.worklog-footer__save--dirty` / `.worklog-footer__export` / `.worklog-report-date-input` / `.worklog-report-method` / `.worklog-fix-method` / `.worklog-fix-other-input` / `.worklog-skeleton` 등
- W7 markdown 박제: "정확한 신규 class 명단은 W7 markdown 작성 단계에서 sketch HTML class 추출 (`§6`) 와 cross-reference 하여 확정한다."

### `## §10 Tailwind cheatsheet — 18-worklog 사용 토큰`
한 줄로 박제:
- 색 토큰: `bg-safe-bar` `bg-fire-bar` `bg-danger-bar` `bg-warn-bar` `bg-surface-raised` `bg-surface-sunken` `text-text-primary` `text-text-secondary` `text-text-tertiary` `border-border-default` `border-border-strong`
- 그라운드: status- prefix 0 (`bg-fire-bar` O, `bg-status-fire-bar` X)
- 크기 함정: `w-8 h-8 = 48px` (tailwind.config spacing override) — 28x28 navBtn (line 26) 변환 시 `w-7 h-7` 사용
- 폰트: `text-caption` 작은 컨테이너 안 사용 시 `leading-none` 추가 (h-8 컨테이너 안에 text-caption 18px 시각적 패딩 발생 사고 박제)
- 그라데이션: `bg-[linear-gradient(135deg,#1d4ed8,#2563eb)]` arbitrary class 금지 — OQ #1 solid 룰. `bg-blue-700` 단색으로 변환

### `## §11 negative gate (≥10, TSX 변환 wave 진입 시 강제)`
- (1) src/** 변경은 WorkLogPage.tsx 만 — 다른 페이지 / hook / util 0 byte
- (2) components.css 도 W7+TSX wave 에서만 추가 — 이전 sketch wave 산출과 cross-check
- (3) App.tsx 0 byte — Suspense 매핑 변경 0
- (4) WorkLogPortraitPreview 내부 캘리브 33 step 변경 0 (`WORKLOG_CALIB_STEPS` line 833~867)
- (5) WORKLOG_CALIB_KEY = 'calib_worklog' 변경 0 (사용자 calib 데이터 보존)
- (6) FINGER_OFFSET = 60 변경 0
- (7) 이모지 0 (메타 코멘트 포함 — "warning glyph" / "lin-grad" 약어 패턴 사용)
- (8) fontSize 9·10·11 인라인 0 (모두 §7 폰트 매트릭스 따라 격상)
- (9) linear-gradient 0 (OQ #1: 저장 버튼 단색 변환)
- (10) status- prefix 0 (`bg-status-fire-bar` 형태 entity escape)
- (11) w-8 h-8 0 (28~32px 컨테이너에 사용 시 48px 사고)
- (12) wrangler 0 (이 워크트리 룰)
- (13) npm run deploy 0 (직원 도메인 가는 경로)
- (14) `monthPickerRef.current?.showPicker?.()` 변경 0 (iOS Safari fallback 보존)
- (15) `isAdmin && setX()` 가드 18+ 위치 변경 0
- (16) gasResult/etcResult 3-state 토글 (`'' | 'ok' | 'bad'`) 변경 0
- (17) 카피 verbatim 18종 변경 0 (feedback_sketch_realistic_data)

### `## §12 verify gate (≥8 자동 명령 + 기대값)`
표 (gate / 명령 / 기대값):
1. 12 섹션 헤더 존재 — `grep -cE '^## §[1-9] |^## §1[0-2] ' wave-7-tsx-conversion-checklist.md` = 12
2. 비즈 anchor 박스 ≥10 — `grep -cE '^\\| [0-9]+\\.' wave-7-*.md` ≥ 10
3. OQ LOCKED 6건 — `grep -cE '^- \\*\\*OQ #[1-6]' wave-7-*.md` = 6
4. 5 sketch HTML class fence ≥5 — `grep -c '^```' wave-7-*.md` ≥ 10 (5 fence open + 5 fence close)
5. Tailwind cheatsheet 박제 — `grep -c 'status- prefix 0' wave-7-*.md` ≥ 1 + `grep -c 'w-8 h-8' wave-7-*.md` ≥ 1
6. negative gate ≥10 — `grep -cE '^- \\([0-9]+\\)' wave-7-*.md` ≥ 10
7. verify gate ≥8 — `grep -cE '^[0-9]+\\.' wave-7-*.md` ≥ 8 (이 §12 자체)
8. 메모리 룰 unique slug ≥10 — `grep -oE '(feedback|project|reference)_[a-z_]+' wave-7-*.md | sort -u | wc -l` ≥ 10
9. TSX line range 인용 ≥10 — `grep -cE 'line [0-9]+~[0-9]+|line [0-9]+,' wave-7-*.md` ≥ 10
10. src/** 변경 0 검증 — `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/` | wc -l = 0
11. App.tsx 변경 0 검증 — `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/App.tsx` | wc -l = 0
12. tsc / build 영향 0 — W7 wave 자체는 markdown 추가만이므로 build PASS 자동

## 메모리 룰 inline (unique slug ≥10, wave-1-index.md §5 + mbr SUMMARY 박제)
markdown 본문 마지막 부근에 unique slug 한 줄씩 박제 (12 slug):
- feedback_planner_prompt_sketch_verbatim
- feedback_redesign_sketch_rule_enforcement
- feedback_sketch_realistic_data
- feedback_tsx_wave_emoji_dot_gap
- feedback_tsx_wave_stat_card_drift
- feedback_text_caption_leading_none
- feedback_tailwind_token_class_pattern
- feedback_tailwind_w8_h8_is_48px
- feedback_cbc7119_design_never_wrangler
- feedback_design_changes_ask_first
- feedback_check_branch_before_edit
- feedback_avoid_premature_confirmation

## 작성 후 atomic commit

```bash
git add cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md
git commit -m "docs(redesign/18-worklog): W7 TSX 변환 verify checklist (12 섹션 / 비즈 anchor / OQ 6 / negative+verify gate)"
```

## Negative (전체)
- src/** 변경 0 byte
- components.css 변경 0 byte
- App.tsx 변경 0 byte
- sketch HTML 추가 0 (W2~W5 의 5 sketch 는 이미 작성됨)
- wave-7 외 markdown 추가 0
- wrangler 명령 0 (워크트리 룰 deny)
- npm run deploy 0 (직원 도메인)
- 이모지 0 (메타 코멘트 포함)
- 카피 verbatim 18종 임의 변경 0
- linear-gradient 인라인 박제 0 (메타 표기 시 "lin-grad" 약어)
- ⚠ 글리프 메타 코멘트 0 (메타 표기 시 "warning glyph")
- mbr Rule 1 self-collision (메타 코멘트 자체가 negative gate 트리거) 회피
- WORKLOG_CALIB_STEPS / WORKLOG_CALIB_KEY / FINGER_OFFSET 변경 0
- isAdmin readOnly 분기 18+ 위치 변경 0
  </action>

  <verify>
    <automated>
[[ -f cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md ]] \
  && [ "$(grep -cE '^## §[1-9] |^## §1[0-2] ' cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md)" -eq 12 ] \
  && [ "$(grep -cE '^- \*\*OQ #[1-6]' cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md)" -eq 6 ] \
  && [ "$(grep -c '^```' cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md)" -ge 10 ] \
  && [ "$(grep -oE '(feedback|project|reference)_[a-z_]+' cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md | sort -u | wc -l)" -ge 10 ] \
  && [ "$(git diff origin/main..HEAD --name-only -- cha-bio-safety/src/ 2>/dev/null | wc -l)" -eq 0 ] \
  && echo PASS || echo FAIL
    </automated>
  </verify>

  <done>
- wave-7-tsx-conversion-checklist.md 가 18-worklog/ 평면 폴더에 생성됨
- 12 섹션 헤더 (§1~§12) 모두 존재
- OQ LOCKED 6건 verbatim 인용
- 5 sketch HTML grep 추출 fence ≥10 (5 open + 5 close)
- 메모리 룰 unique slug ≥10
- src/** 변경 0 byte (git diff 검증 PASS)
- atomic commit 1개 + 산출 markdown ~1000 lines 예상
  </done>
</task>

</tasks>

<verification>
- 산출 단일 파일 확인: `ls cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md`
- 12 섹션 헤더: `grep -cE '^## §' wave-7-*.md` = 12
- OQ LOCKED 6건: `grep -cE '^- \*\*OQ #[1-6]' wave-7-*.md` = 6
- 비즈 anchor ≥10: `grep -cE '^[0-9]+\.' wave-7-*.md` ≥ 10
- src/** 변경 0: `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/` = 빈 결과
- App.tsx 변경 0: `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/App.tsx` = 빈 결과
- 이모지 0 (메타 코멘트 포함): `LC_ALL=C grep -P '[\x{1F300}-\x{1FAFF}]' wave-7-*.md` = 0 hits
- wrangler 0 / npm run deploy 0: `grep -cE 'wrangler|npm run deploy' wave-7-*.md` = 0
- 누적 commit: `git log --oneline origin/main..HEAD | wc -l` = 15 (사전 12 + 본 plan 1 + W7 산출 1 + SUMMARY 1)
</verification>

<success_criteria>
- TSX 변환 wave 진입 시 executor 가 wave-7-tsx-conversion-checklist.md 1 파일만 읽어도 12 섹션 / 비즈 anchor / OQ / sketch class / 폰트 매트릭스 / Lucide 매핑 / Tailwind cheatsheet / negative+verify gate 모두 파악 가능
- src/** 0 byte 변경 강제 (markdown only)
- 14-reports (700 lines) / 15-daily-report (934 lines) / 28-splash 의 단일 atomic 패턴 18-worklog 에서 자동 도달
- 18-worklog 4i9 (4 단계 자동 도달) 패턴 메모리 박제 시점 도달
</success_criteria>

<output>
After completion, create `.planning/quick/260525-slq-redesign-18-worklog-w7-tsx-conversion-ch/260525-slq-SUMMARY.md` (atomic commit 별도)
</output>

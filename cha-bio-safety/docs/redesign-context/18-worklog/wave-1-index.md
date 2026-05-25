---
title: "redesign/18-worklog — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-25
quick_id: 260525-fda
branch: redesign/18-worklog
source_tsx: cha-bio-safety/src/pages/WorkLogPage.tsx
source_tsx_lines: 1216
design_system: cha-bio-safety/docs/redesign-context/18-worklog/design-system.md (v0.1.1)
mirror_of: cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md (동일 8-section + 6 sub-wave + 좌측편집/우측A4 + 캘리브 시스템 + admin 폼 패턴)
inherit_from: cha-bio-safety/src/styles/components.css (14-reports SW1 결과 — 95 class 카탈로그)
sub_wave_count: 6 (W2~W7)
memory_rules_inline: 12
open_questions: 6
---

# redesign/18-worklog — sketch wave 1 (index)

본 문서는 W2~W7 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:
- WorkLogPage.tsx (1216 라인 — 15-daily-report 의 DailyReportPage 840 라인보다 더 큰 단일 export) 의 element 인벤토리 → 6 sub-wave 분배
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6.1 / §6.2 / §6.4 / §7.1 의 verbatim 룰 박제
- 14-reports SW1 결과 (`cha-bio-safety/src/styles/components.css`) 의 class inherit / 신규 정의 매핑
- 메모리 룰 12건 (`feedback_*.md`) inline 인용 — 18-worklog 컨텍스트에 어떻게 적용할지
- §6 negative rule (이 wave 에서 금지된 것)
- §7 open questions 6건 — W2 진입 직전 사용자 컨펌

작성일: 2026-05-25 / Quick ID: 260525-fda / Branch: redesign/18-worklog

> ⚠ 14-reports / 15-daily-report / 19-legal / 20-legal-findings / 21-legal-finding-detail / 23-education / 28-splash 폴더 구조 실측 결과: **평면(flat sibling) 패턴** — `XX-name/sketch-wave-N.html` 직접 배치, `sketch/` 서브폴더 없음. 18-worklog 도 동일하게 평면 배치 결정. 본 인덱스 파일도 `18-worklog/wave-1-index.md` (flat sibling) 으로 위치한다.

> 15-daily-report W1 (260521-1k6) 의 8 섹션 + 6 sub-wave 구조를 정확히 mirror. **15-daily-report 와 차이 5건**: (1) 카드 5개 (기본정보 + 4 카테고리 + 불량사항 개선보고 — DailyReport 의 EditableCard 3개 보다 많음), (2) 양호/불량 결과 토글 (DailyReport 없음 — 본 페이지 핵심 UX), (3) 모든 input readOnly 분기 (admin 전용 — DailyReport 는 전체 사용자 가능), (4) monthNav 안 숨겨진 input type='month' picker (DailyReport 는 dateNav 만), (5) 캘리브 step 33 (DailyReport 15 step 보다 2배+ — 폼 필드 다양 + 양호/불량 √ 표시 8건 + 일자 범위 3종). 6 sub-wave (W2~W7) 채택. 평면 sibling 패턴 sketch-wave-N-{slug}.html (W2~W6) + wave-7-tsx-conversion-checklist.md (W7) 유지.

---

# §1. WorkLogPage.tsx 인벤토리

본 인벤토리는 WorkLogPage.tsx (1216 lines, 18-worklog.md 메타와 일치, 실측) 의 element 를 imports/상수 / main 컴포넌트 hook+state+handler / formContent (기본정보 + 4 카테고리 + 불량사항 개선보고) / footerButtons+monthNav / 모바일/데스크톱 렌더 분기 / WorkLogPortraitPreview+캘리브 6 영역으로 나눠 정리한다. line 범위는 **실측 결과**.

## §1.1 Imports & 상수 (line 1~53)

| 영역 | element | line 범위 | 역할 | 후속 wave |
|---|---|---|---|---|
| imports | `useState/useEffect/useRef/useCallback`, `useNavigate`, `useQuery/useMutation/useQueryClient`, `toast`, `workLogApi`, `generateWorkLogExcel`, `useAuthStore`, `useIsDesktop`, `type WorkLogPayload` | 1~10 | React Query + API + 데스크톱 분기 hook + admin 권한 store | W7 (TSX checklist) |
| `thisMonthKST()` / `addMonths()` | KST `YYYY-MM` 현재 월 + 월 ± n 계산 | 13~22 | 월 유틸 (DailyReport 의 `todayKST()/addDays()` 와 mirror) | W7 (보존 룰) |
| `navBtn` | 28×28 rounded 7 border + bg-bg3 + `lineHeight: '1'` | 25~30 | ‹/› 월 네비 버튼 (DailyReport navBtn 과 동일) | W2 |
| `card` | bg-bg2 + border + radius 14 + padding 14 + marginBottom 10 | 32~35 | 5 카드 공통 wrapper | W3·W4 |
| `textareaStyle` | fontSize 12 + padding 10/12 + resize vertical + lineHeight 1.6 | 37~42 | 모든 textarea 공통 | W3·W4 |
| `iconBtn` | 34×34 rounded 9 border + bg-bg3 + color t2 | 44~48 | 뒤로 버튼 (모바일 헤더) | W2 |
| `skeletonStyle` | bg-bg4 + radius 4 + height 12 + width 70% + `animation: 'blink 2s ...'` | 50~53 | isLoading 스켈레톤 | W3·W4 (스켈레톤 보존) |

**주: fontSize 11/12/13/14/15 다수 출현** — line 27 (navBtn 16), line 40 (textarea 12), line 51 (skeleton 미적용), line 325 (input 13), line 341/361/375/404 (라벨 11), line 359/422/485/547/609 (카드 제목 13), line 382/393/445/456/507/518/569/580 (토글 12), line 614/616 (날짜 dot 12), line 626/642 (토글 12), line 675/686/698/704 (footer 13/11/13/13), line 716 (월 표시 15), line 762/807 (라벨/타이틀 11/14) → 마이그레이션 §4.2 (9·10·11px 일괄 상향) 적용 대상. 캘리브 안내 바 14·11·13·12 (line 1145/1154/1157/1163/1168) 는 정보 노출 UX 예외 검토.

## §1.2 Main 컴포넌트 — hook / state / handler (line 56~333)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| 진입 hook | `useNavigate` (57) + `useQueryClient` (58) + `useIsDesktop` (59) + `useAuthStore { staff }` (60) + **`isAdmin = staff?.role === 'admin'`** (61 — 본 페이지 핵심 권한 분기) | 57~61 | 14 form readOnly + 저장/Excel button 분기의 single source |
| ym state | `[ym, setYm] = useState(thisMonthKST())` + `[year, month] = ym.split('-').map(Number)` | 63~64 | `YYYY-MM` 형식 |
| 폼 14 useState | managerName / fireContent / fireResult(ok\|bad) / fireAction / escapeContent / escapeResult(ok\|bad) / escapeAction / gasContent / gasResult(''\|ok\|bad) / gasAction / etcContent / etcResult(''\|ok\|bad) / etcAction / reportYear / reportMonth / reportDay / reportMethod(''\|face\|written\|telecom) / fixMethod(''\|relocate\|remove\|repair\|other) / fixOtherText | 67~86 | WorkLogPayload 14+5 필드 1:1 매핑, `gasResult`/`etcResult` 만 3-state (빈값 허용), `fireResult`/`escapeResult` 는 2-state |
| ref | `loadedRef = useRef<WorkLogPayload \| null>(null)` + `prevYmRef = useRef<string>('')` | 88~89 | dirty 비교 baseline + 월 변경 reset tracker |
| focusedField | `useState<string \| null>(null)` | 92 | 인라인 border 시각 처리 |
| generating | Excel 생성 중 | 95 | `'출력 중...'` 텍스트 분기 (line 704) |
| useQuery × 2 | `savedQuery ['worklog', ym]` → `workLogApi.get(ym)` / `previewQuery ['worklog-preview', ym]` → `workLogApi.preview(ym)` (enabled: `savedQuery.data === null && savedQuery.isSuccess`) | 98~110 | 저장된 record 우선, 없으면 자동 폴백 preview |
| useEffect 폼 reset+로드 | `prevYmRef.current !== ym` + `savedQuery.isFetching` 가드 → savedQuery.data 있으면 record 14 필드 채움 / 없으면 previewQuery.data 폴백 | 113~187 | 월 변경 시 1회만 reset, 깜빡임 회피 |
| changeMonth | prevYmRef/loadedRef 리셋 + 14 state 초기화 + setYm(newYm) | 190~201 | 월 네비/picker 진입점 |
| currentPayload + isDirty | 14 state ↔ loadedRef 19개 필드 비교 | 204~246 | "수정됨" 배지 + Excel 출력 confirm 분기 |
| saveMutation | `workLogApi.save(ym, currentPayload)` → onSuccess: loadedRef 업데이트 + invalidate ['worklog', ym] + toast '저장되었습니다' / onError: toast '저장 실패' | 249~280 | 저장 단일 진입 |
| handleExport | isDirty 시 confirm → save → `generateWorkLogExcel(ym, currentPayload)` → finally setGenerating(false) | 283~302 | Excel 출력 단일 진입 |
| isLoading / isSaving | `savedQuery.isFetching \|\| previewQuery.isFetching` + `saveMutation.isPending` | 305~306 | UI 스켈레톤/disabled |
| roStyle | assistant readOnly 시각 (background var(--bg2) + cursor default) | 308~310 | 14 input/textarea readOnly 분기 |
| taStyle(field) / inputStyle() | textareaStyle/inputStyle + focusedField + isAdmin 분기 | 313~330 | 인라인 스타일 헬퍼 (W7 변환 시 className 으로 치환) |
| monthPickerRef | `useRef<HTMLInputElement>(null)` | 333 | 숨겨진 input type='month' 진입 (line 715 `showPicker?.() ?? click()`) |

**주: line 61 `isAdmin = staff?.role === 'admin'`** — 본 페이지의 모든 input/textarea/토글/저장/Excel 버튼이 이 분기 1줄에 의존. W3·W4 sketch 에 readOnly UX 시각 처리 명시 (memory `feedback_sketch_realistic_data` — 분기 코드 그대로 보존, 시각만 sketch 에서 정리).
**주: gasResult/etcResult (line 75/78) 가 3-state (''|'ok'|'bad') vs fireResult/escapeResult (line 69/72) 가 2-state ('ok'|'bad')** — gasResult/etcResult 만 같은 버튼 재클릭 시 unset (line 505/516/567/578 `setGasResult(gasResult === 'ok' ? '' : 'ok')` 패턴). 비즈 차이 verbatim 박제 — W3 sketch markup 은 동일하더라도 토글 onClick 로직 + initial state 차이 보존.

## §1.3 formContent — 기본정보 + 4 카테고리 + 불량사항 개선보고 (line 336~664)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| 기본 정보 카드 | `<div style={card}>` + "기본 정보" 13/700 (340) + "관리자" 11 라벨 (341) + input managerName (`readOnly={!isAdmin}`, 344~353) + skeleton 폴백 (343) | 339~355 | managerName state + inputStyle() + onFocus/onBlur focusedField |
| 소방시설 카드 | "소방시설" 13/700 (359) + 확인내용 textarea fireContent (rows=4, 364~372) + 결과 토글 양호(379~389)/불량(390~400) — selected: bg `var(--safe)`/`var(--danger)` color #fff / unselected: bg `var(--bg3)` color `var(--t2)` + 조치내역 (color `var(--warn)` if `fireResult==='bad'`, 404) + textarea fireAction (rows=3) | 357~418 | fireContent / fireResult ('ok'\|'bad') / fireAction state — **2-state 토글** |
| 피난방화시설 카드 | 동일 패턴 (escapeContent rows=3 / escapeResult 2-state 양호·불량 / escapeAction rows=3) | 420~481 | escapeContent / escapeResult ('ok'\|'bad') / escapeAction state |
| 화기취급감독 카드 | 동일 패턴 (gasContent rows=2 / gasResult **3-state** 양호·불량 — 같은 버튼 재클릭 시 unset / gasAction rows=3) | 483~543 | gasContent / gasResult (''\|'ok'\|'bad') / gasAction state |
| 기타사항 카드 | 동일 패턴 (etcContent rows=3 / etcResult **3-state** 양호·불량 / etcAction rows=3) | 545~605 | etcContent / etcResult (''\|'ok'\|'bad') / etcAction state |
| 불량사항 개선보고 카드 | "불량사항 개선보고" 13/700 (609) + **보고일시** 3 input (year w65 / month w40 / day w40, 텍스트 center) + 사이 '.' span × 2 (614/616) + **보고방법** 3 토글 (face/written/telecom, 622~633 — selected: `var(--acl)`) + **조치방법** 4 토글 (relocate/remove/repair/other, 638~649) + `fixMethod === 'other'` 시 fixOtherText input (maxLength 10, width 160, 651~661) | 607~662 | reportYear/Month/Day + reportMethod + fixMethod + fixOtherText state |

**주: 4 카테고리 카드는 거의 동일 패턴 반복** — 18-worklog.md §4 의 "4개 카드 섹션은 동일 패턴 → 공통 `<WorkLogSection>` 추출 가능" 지시와 일치. W3 sketch 에서 1 카드 디자인 → 4 카드 적용 (공통 컴포넌트 채택 권장).
**주: 보고방법 (line 629 `var(--acl)`) + 조치방법 (line 645 `var(--acl)`)** — 양호/불량 토글의 `var(--safe)`/`var(--danger)` 와 다른 색. OQ #3 에서 색상 일관성 검토.
**주: 보고일시 '.' span (line 614/616) fontSize 12** — memory `feedback_tsx_wave_emoji_dot_gap` 룰 — sketch 변환 시 dot span 명시 마크업 보존.
**주: `fixMethod === 'other'` 시 fixOtherText input 인라인 노출 (651~661)** — `maxLength={10}` + `width: 160` + `marginTop: 8` 보존. W4 sketch markup 에 conditional rendering 박제.

## §1.4 footerButtons (line 667~707) + monthNav (line 709~730)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| 저장 버튼 | flex 1 padding 11 radius 9 13/700 — admin && !isSaving 시 **`background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' color #fff`** (679) / isSaving \|\| !isAdmin 시 bg `var(--bg3)` color `var(--t3)` — '저장' / '저장 중...' 분기 + isDirty 시 '· 수정됨' (11 `var(--warn)` marginLeft 6, 686) | 670~690 | saveMutation.mutate + isDirty `<span>` 분기 |
| 엑셀 출력 버튼 | flex 1 padding 11 radius 9 border 1px var(--bd) 13/700 — admin && !generating 시 bg `var(--bg2)` color `var(--t1)` — '엑셀 출력' / '출력 중...' 분기 | 693~705 | handleExport |
| monthNav ‹ | `<button style={navBtn} onClick={() => changeMonth(addMonths(ym, -1))}>‹</button>` | 712 | changeMonth (월 단방향 무제한 — 미래 월 가드 없음, OQ #4 대상) |
| 월 표시 + 숨겨진 picker | button minWidth 90 fontSize 15/700 textAlign center bg none border none — `onClick monthPickerRef.current?.showPicker?.() ?? click()` (715) — 텍스트 = `${year}년 ${month}월` (718). input ref={monthPickerRef} type='month' style 숨김 (position absolute opacity 0 pointerEvents none width 1 height 1) — onChange `changeMonth(e.target.value)` | 713~727 | 모바일 native month picker |
| monthNav › | `<button style={navBtn} onClick={() => changeMonth(addMonths(ym, 1))}>›</button>` | 728 | changeMonth (미래 월도 진입 가능 — OQ #4 대상) |

**주: 저장 버튼 그라데이션 (line 679 `linear-gradient(135deg,#1d4ed8,#2563eb)`)** — design-system §6.4 CTA 그라데이션 폐기 룰 위반. 14-reports W6 LOCKED b + 15-daily-report OQ #1 (default OK 통일) 과 동일 정책 적용 → OQ #1 (default = solid `bg-safe-bar`).
**주: 저장 버튼 안 '· 수정됨' (line 686) fontSize 11** — 마이그레이션 §4.2 → text-caption (12px) 상향 + leading-none.
**주: 월 picker `showPicker?.() ?? click()` (line 715)** — iOS Safari fallback 패턴. W2 변환 시 monthPickerRef 보존 + 동일 호출 markup 박제 (memory `feedback_planner_prompt_sketch_verbatim`).
**주: 미래 월 가드 없음** — DailyReportPage 의 `canForward = date < today` 분기 (line 80 / 394~399) 와 다름. OQ #4 에서 미래 월 비활성 UX 결정.

## §1.5 모바일/데스크톱 렌더 분기 (line 732~829)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| 데스크톱 분기 | `if (isDesktop) { return ... }` — 외곽 flex row height 100% overflow hidden bg `var(--bg)` (735) + 인라인 `<style>@keyframes blink{...}</style>` (736) | 733~793 | useIsDesktop ≥768px |
| 데스크톱 좌측 편집 패널 | flex 1 overflow auto padding '24px 32px' (739) — top 영역 flex justify flex-end marginBottom 20 (740~742) 안 {monthNav} + {formContent} (743) + {footerButtons} marginTop 4 (744~746) + height 24 spacer (747) | 739~748 | dateNav flex-end → monthNav flex-end |
| 데스크톱 우측 A4 portrait preview | aspectRatio '210/297' height 100% flexShrink 0 borderLeft 1px var(--bd) overflow hidden bg `var(--bg)` flex center align center position relative (751~759) | 751~793 | A4 portrait 비율 고정 |
| 데스크톱 "인쇄 미리보기" 라벨 | position absolute top 8 left 0 right 0 textAlign center **fontSize 11** color `var(--t2)` fontWeight 700 textTransform uppercase pointerEvents none zIndex 5 (760~767) | 760~767 | 정적 라벨 (마이그레이션 §4.2 → 12px text-caption 상향) |
| `<WorkLogPortraitPreview>` | 21 props: yearMonth + 14 form values + reportYear/Month/Day + reportMethod + fixMethod + fixOtherText | 768~789 | 캘리브 시스템 wrapper (§1.6) |
| 모바일 외곽 | height 100% flex column overflow hidden bg `var(--bg)` (797) + 인라인 `<style>@keyframes blink{...}</style>` (798) | 796~828 | default 분기 (모바일 ≤767px) |
| 모바일 자체 헤더 | flexShrink 0 bg `var(--bg2)` borderBottom 1px `var(--bd)` padding '8px 12px 9px' flex align center gap 8 (801) — 뒤로 button (iconBtn + inline svg ChevronLeft 15x15, 802~806) + 타이틀 '업무 수행 기록표' flex 1 **fontSize 14** 700 `var(--t1)` (807) + {monthNav} (808) | 801~809 | useNavigate(-1) (802) + chrome 통일 룰 (project_inspection_chrome_unified.md 패턴) |
| 모바일 스크롤 본문 | flex 1 overflowY auto padding '12px 16px' (812) — {formContent} (813) + height 72 spacer (814) | 812~815 | 고정 푸터 회피 spacer |
| 모바일 고정 푸터 | position fixed bottom 0 left 0 right 0 padding '10px 16px' paddingBottom `calc(10px + var(--sab))` bg `var(--bg2)` borderTop 1px `var(--bd)` zIndex 10 (818~825) — {footerButtons} (826) | 818~827 | iOS safe-area 대응 (memory `feedback_bottomnav_gap_style` 친척 패턴) |

**주: 모바일 헤더 타이틀 line 807 `fontSize: 14`** — 마이그레이션 §4.2 노안 룰 → text-title (18px) 상향. 14-reports `.page-title` (18px) inherit 패턴.
**주: line 803~805 inline `<svg>` ChevronLeft** — lucide `<ChevronLeft size={15} />` 교체 (design-system §7.1 + chrome 통일 룰 `cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md` reference). 14-reports `.back-btn` 패턴 inherit.
**주: 데스크톱은 모바일 자체 헤더 없음** — App.tsx 헤더가 데스크톱 페이지 제목 표시 (line 101 `'/worklog': '업무 수행 기록표'`). monthNav 만 좌측 편집 패널 top 영역에 flex-end.

## §1.6 WorkLogPortraitPreview + WorkLogCalibMarker + WORKLOG_CALIB_STEPS + loadWorkLogCalib/saveWorkLogCalib (line 833~1216)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| `WORKLOG_CALIB_STEPS` 33 step | perfYear/perfMonth1/perfDay1/perfMonth2/perfDay2 (5) + manager (1) + fireContent/fireOk/fireBad/fireAction (4) + escapeContent/escapeOk/escapeBad/escapeAction (4) + gasContent/gasOk/gasBad/gasAction (4) + etcContent/etcOk/etcBad/etcAction (4) + rptYear/rptMonth/rptDay (3) + rptFace/rptWritten/rptTelecom (3) + fixRelocate/fixRemove/fixRepair/fixOther/fixOtherText (5) = **33 keys** | 833~867 | 인쇄 미리보기 좌표 캘리브 (5 + 1 + 16 + 6 + 5 = 33 step) |
| 상수 | `WORKLOG_CALIB_KEY = 'calib_worklog'` (869) + `FINGER_OFFSET = 60` (870) | 869~870 | localStorage key + 손가락 가림 보정 (15-daily-report `'calib_daily_report'`/60 mirror) |
| `loadWorkLogCalib` / `saveWorkLogCalib` | localStorage IO (try/catch JSON.parse) | 876~881 | 좌표 저장/로드 |
| `WorkLogPortraitPreview` 컴포넌트 | A4 portrait image (`/templates/preview/worklog-1.png`, line 1071) + 오버레이 (AREA_KEYS Set + overlayItems 33건 conditional) + 캘리브 모드 + 위치 설정 버튼 | 884~1190 | useState(calibMode/Step/Points/activePoint) + isDragging ref + measure useCallback + ResizeObserver useEffect + clientToImgPct + onCalibTouchStart/Move/End/Click + advanceStep + confirmPoint + textStyle helper |
| 위치 설정 버튼 | `hasCalib ? '위치 재설정' : '⚠ 위치 설정'` (1185) — position absolute bottom 12 right 12 + bg hasCalib `rgba(0,0,0,0.6)` else `rgba(239,68,68,0.9)` + fontSize 12 fontWeight 700 zIndex 10 | 1174~1187 | 캘리브 진입/완료 토글 (line 1182 fontSize 12 = OK = text-caption 그대로) |
| `WorkLogCalibMarker` 컴포넌트 | 캘리브 십자 (40×2 horizontal + 2×40 vertical) + 라벨 (active 시 16→20 확대, 10/900 #fff) | 1193~1216 | 좌표 시각화 |

**주: 12-staff W8 lp[] 패턴 + 15-daily-report W6 mirror** — W6 wrapper wave 가 내부 캘리브/오버레이/이미지 좌표 시스템 모두 **100% 보존**, 외곽 wrapper / 안내 바 / 위치 설정 button 만 손댐.
**주: line 1185 의 ⚠ 글리프** — OQ #6 (default = lucide `<AlertTriangle size={14} />` 교체).
**주: line 1011 `AREA_KEYS = new Set(['fireContent', 'fireAction', 'escapeContent', 'escapeAction', 'gasContent', 'etcContent'])`** — 6 영역 textarea 가 isArea true. 단 `gasAction`/`etcAction` 가 set 에 빠진 이유 — 실측 결과 overlayItems (line 1023~1057) 에서 gasAction (line 1041) 과 etcAction (line 1045) 도 `isArea: true, width: '15%'` 명시 → AREA_KEYS Set 는 미사용 (legacy)? **W6 wave 에서 코드 그대로 보존, 분기 변경 금지** (memory `feedback_sketch_realistic_data`).

## §1.7 비즈 시그니처 박스 (W7 anchor)

후속 wave (특히 W7 TSX 변환 checklist) 가 보존해야 할 비즈 로직 시그니처 박제:

```
# API (utils/api.ts)
workLogApi.get(ym: string): Promise<WorkLogPayload | null>      // 저장된 record
workLogApi.preview(ym: string): Promise<WorkLogPayload | null>  // 폴백 preview (자동 집계)
workLogApi.save(ym: string, payload: WorkLogPayload): Promise<WorkLogPayload>  // 저장 → 저장된 record return

# Excel (utils/generateExcel.ts)
generateWorkLogExcel(ym: string, payload: WorkLogPayload): Promise<void>  // 파일 다운로드

# 권한 (stores/authStore.ts)
useAuthStore() → { staff }  // staff: Staff | null
const isAdmin = staff?.role === 'admin'  // line 61 — 본 페이지 핵심 분기

# 데스크톱 분기 (hooks/useIsDesktop.ts)
useIsDesktop(): boolean  // ≥768px

# 월 picker (line 333 + 715)
const monthPickerRef = useRef<HTMLInputElement>(null)
onClick={() => monthPickerRef.current?.showPicker?.() ?? monthPickerRef.current?.click()}

# 캘리브 상수 (line 869~870)
const WORKLOG_CALIB_KEY = 'calib_worklog'
const FINGER_OFFSET = 60

# 캘리브 step (line 833~867)
WORKLOG_CALIB_STEPS = 33 keys (perf 5 + manager 1 + fire/escape/gas/etc × 4 = 16 + rpt 3 + rptMethod 3 + fix 5)

# 이미지 src (line 1071, 변경/이동 금지)
src="/templates/preview/worklog-1.png"

# useQuery × 2 + useMutation × 1
savedQuery   ['worklog', ym]          → workLogApi.get(ym)
previewQuery ['worklog-preview', ym]  → workLogApi.preview(ym)   // enabled: savedQuery.data === null && savedQuery.isSuccess
saveMutation                          → workLogApi.save(ym, currentPayload)

# react-query / react-router-dom / react-hot-toast 의존
useQuery / useMutation / useQueryClient (@tanstack/react-query)
useNavigate (react-router-dom)
toast (react-hot-toast)

# App.tsx chrome 등록 (실측 확인)
line 41   : const WorkLogPage = lazy(() => import('./pages/WorkLogPage'))
line 71   : MOBILE_NO_NAV_PATHS = [..., '/worklog', ...]
line 101  : '/worklog': '업무 수행 기록표'  // 데스크톱 헤더 타이틀
line 294  : <Route path="/worklog" element={<Auth><WorkLogPage /></Auth>} />
```

## §1.8 파일 라인 수 확인 + 주요 fontSize 출현 카운트

`wc -l cha-bio-safety/src/pages/WorkLogPage.tsx` 실측 = **1216 라인** (18-worklog.md §2 메타 일치, drift 없음).
fontSize 출현 (line 27/40/51/325/341/360/375/382/393/404/422/438/445/456/467/485/500/507/518/529/547/562/569/580/591/609/611/614/616/620/626/636/642/675/686/698/704/716/762/807/1145/1154/1157/1163/1168/1182/1208):
- 9·10·11 → **다수 (≥18건)** — §1.1 노안 룰 위반, 마이그레이션 §4.2 일괄 상향 대상
- 12 → 다수 (토글/dot span/위치 설정 버튼) — text-caption 그대로 또는 12 유지
- 13 → 다수 (input/카드 제목/footer 버튼)
- 14 → 1건 (모바일 헤더 타이틀, 18 상향)
- 15 → 1건 (월 표시, 14~16 검토)
- 16 → 1건 (navBtn ‹/›, 그대로)

그라데이션 사용처: **line 679 1건** (`linear-gradient(135deg,#1d4ed8,#2563eb)`, 14-reports W6 LOCKED b 일관 통일 대상 — OQ #1).
이모지/⚠ 글리프: **line 1185 1건** (`'⚠ 위치 설정'`, OQ #6 — lucide AlertTriangle 교체 default).
`useIsDesktop` 확인 = **line 9 import + line 59 호출 + line 733 분기** → 소스 이미 모바일/데스크톱 분기 구현.

---

# §2. 6 sub-wave 분배 plan

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 헤더 + 월 네비 | WorkLogPage 자체 헤더 (line 801~809) + monthNav (line 709~730) | sketch-wave-2-mobile-header-month-nav.html |
| W3 | 기본 정보 카드 + 4 카테고리 카드 (공통 패턴) | formContent 기본정보 (line 339~355) + 소방시설 (line 357~418) + 피난방화시설 (line 420~481) + 화기취급감독 (line 483~543) + 기타사항 (line 545~605) — 공통 WorkLogSection 패턴 | sketch-wave-3-section-cards.html |
| W4 | 불량사항 개선보고 카드 | formContent 불량사항 개선보고 (line 607~662) — 보고일시 + 보고방법 + 조치방법 | sketch-wave-4-report-fix-card.html |
| W5 | footerButtons + 모바일/데스크톱 layout | footerButtons (line 667~707) + 모바일 헤더+본문+고정푸터 (line 796~828) + 데스크톱 좌측편집+우측A4 분할 (line 733~793 외곽만, A4 wrapper 영역만) | sketch-wave-5-footer-buttons-desktop-layout.html |
| W6 | WorkLogPortraitPreview wrapper (캘리브 100% 보존) | WorkLogPortraitPreview wrapper (line 884~1190 중 외곽만) — 캘리브 step / overlayItems / 이미지 좌표 시스템 100% 보존 | sketch-wave-6-portrait-preview-wrapper.html |
| W7 | TSX 변환 verify checklist (markdown) | W2~W6 sketch + WorkLogPage.tsx 비즈 로직 보존 룰 + components.css inherit class 매핑 + 신규 class 명단 | wave-7-tsx-conversion-checklist.md |

## §2.1 각 wave 보존 / 토큰 / 폰트

### W2 — 모바일 헤더 + 월 네비
- **보존**: `useNavigate(-1)` (802), `setYm(newYm)` via `changeMonth` (190~201, prevYmRef/loadedRef 리셋 + 14 state 초기화), `addMonths(ym, ±1)` (18~22), `monthPickerRef.current?.showPicker?.() ?? monthPickerRef.current?.click()` (715, iOS Safari fallback), input `type='month'` 숨김 (720~726, opacity 0 pointerEvents none width 1 height 1), `ym` state 형식 `YYYY-MM` (63), 미래 월 가드 없음 → OQ #4 결정 후 적용
- **토큰**: 헤더 = `.page-header` (14-reports inherit) / 뒤로 버튼 = `.back-btn` (14-reports inherit, w-[34px]) / 타이틀 = `.page-title` (18px, 현 14 → 18 상향) / 월 네비 = **새 class** `.month-nav` / `.month-nav-btn` (w-[28px] h-[28px] 명시 — memory `feedback_tailwind_w8_h8_is_48px`, w-8=48 함정 회피) / 월 표시 = `.month-display` (min-w 90px leading-none — memory `feedback_text_caption_leading_none`) / picker trigger = `.month-picker-trigger` (button 안 숨겨진 input)
- **폰트**: 타이틀 18px text-title / 월 표시 15→16 text-body (또는 그대로 15 유지) / ‹/› 16px (그대로). **9·10·11px 0건.**

### W3 — 기본 정보 + 4 카테고리 카드
- **보존**: 5 카드 공통 `card` wrapper (32~35), 4 카테고리 동일 패턴 (소방시설/피난방화/화기취급/기타 = WorkLogSection 추출 후보), 양호/불량 토글 색상 `var(--safe)`/`var(--danger)` + unselected `var(--bg3)`/`var(--t2)` 100% 보존, **fireResult/escapeResult 2-state vs gasResult/etcResult 3-state 분기 보존** (line 380/391 단방향 vs line 505/516/567/578 `=== val ? '' : val` 토글), 조치내역 라벨 color `var(--warn)` if result==='bad' 분기 (404/467/529/591), readOnly={!isAdmin} 분기 14건 (348/368/410/431/473/493/535/555/597) + cursor 'default' + opacity 0.5 시각 처리, skeleton 폴백 (스켈레톤 markup 보존)
- **토큰**: 카드 = **새 class** `.worklog-section-card` (bg-surface-raised + border-border-default + rounded-md + padding 14 + marginBottom 10) / 카드 제목 = `.worklog-section-title` (text-title 18, 현 13 → 18 상향) / 필드 라벨 = `.worklog-field-label` (text-caption 12, 현 11 → 12 상향) / textarea = `.worklog-textarea` (text-body 16 검토, 또는 text-body-sm 14 유지 — fontSize 12 → 14~16 검토) / 결과 토글 = `.worklog-result-toggle` / `.worklog-result-toggle--ok` (bg-safe-bar 또는 var(--safe) 인라인) / `.worklog-result-toggle--bad` (bg-danger-bar 또는 var(--danger) 인라인) / `.worklog-result-toggle--unselected` (bg-surface-sunken text-text-secondary) / 조치내역 라벨 = `.worklog-action-label` / `.worklog-action-label--bad` (color var(--warn))
- **폰트**: 라벨 11→12 / 카드 제목 13→18 / 토글 12 유지 / textarea 12→14~16 검토. **9·10·11px 0건.** "양호" / "불량" 텍스트 verbatim (memory `feedback_sketch_realistic_data`).

### W4 — 불량사항 개선보고 카드
- **보존**: 보고일시 3 input (year w65 / month w40 / day w40, 텍스트 center, line 613/615/617), '.' span × 2 (614/616, fontSize 12), 보고방법 3 토글 `[['face','대면'], ['written','서면'], ['telecom','정보통신']]` (622~633, `=== val ? '' : val` unset 토글 패턴) selected `var(--acl)`, 조치방법 4 토글 `[['relocate','이전'], ['remove','제거'], ['repair','수리·교체'], ['other','기타']]` (638~649) selected `var(--acl)`, `fixMethod === 'other'` 시 fixOtherText input inline 노출 (maxLength={10}, width: 160, marginTop: 8, 651~661), readOnly={!isAdmin} 4건
- **토큰**: 카드 = `.worklog-section-card` (W3 재사용) / 보고일시 wrapper = `.worklog-report-date` (flex gap 6 align center) / 보고일시 input = `.worklog-report-date-input` (text-align center / 65px / 40px / 40px) / dot 사이 span = `.dot-meta` (14-reports inherit, 4×4 회색 dot — 단 본 페이지의 dot 은 fontSize 12 "." 텍스트로 시각 강조이므로 `.worklog-report-dot` 텍스트 dot 으로 별도 정의 가능) / 토글 = `.worklog-method-btn` / `.worklog-method-btn--selected` (bg var(--acl) — accent 토큰 매핑 검토) / 기타 input = `.worklog-fix-other-input` (width 160, marginTop 8)
- **폰트**: 라벨 11→12 / 토글 12 유지 / dot 12 유지 / input 13 유지. **9·10·11px 0건.**

### W5 — footerButtons + 모바일/데스크톱 layout
- **보존**: 저장 버튼 그라데이션 → solid 통일 결정 (OQ #1, default = `bg-safe-bar` solid), 엑셀 출력 버튼 border 보조 액션 유지 (현재 그대로), '· 수정됨' 11/var(--warn) 분기 (line 685~687, isDirty 시각 indicator), 모바일 고정 푸터 `paddingBottom: 'calc(10px + var(--sab))'` 보존 (iOS safe-area), height 72 spacer 보존 (line 814, 고정 푸터 회피), 데스크톱 좌측 패널 padding '24px 32px' (line 739), 우측 패널 aspectRatio '210/297' borderLeft 1px (751~759), "인쇄 미리보기" 라벨 fontSize 11 → 12 상향 (line 762)
- **토큰**: footer wrapper = `.worklog-footer` (flex gap 8 / 모바일 fixed bottom / 데스크톱 inline) / 저장 버튼 = `.worklog-footer-save` (`bg-safe-bar` solid — OQ #1 default) / 저장 disabled = `.worklog-footer-save--disabled` (bg-surface-sunken text-text-tertiary) / 저장 dirty indicator = `.worklog-footer-save-dirty` (text-caption text-status-warning leading-none) / 엑셀 출력 = `.worklog-footer-export` (bg-surface-raised border-border-default) / 모바일 고정 푸터 = `.worklog-mobile-footer` (position fixed paddingBottom safe-area) / 데스크톱 layout = `.worklog-desktop-layout` (flex row h-full) / 좌측 = `.worklog-desktop-edit-panel` (flex 1 overflow auto padding '24px 32px') / 우측 = `.worklog-desktop-preview-panel` (aspectRatio 210/297 borderLeft)
- **폰트**: 데스크톱이라도 모바일과 동일 (§1.3 절대 룰). 저장/엑셀 13 유지 또는 16 상향 검토. "인쇄 미리보기" 11 → 12 text-caption 상향.

### W6 — WorkLogPortraitPreview wrapper
- **보존**: `<WorkLogPortraitPreview yearMonth={ym} managerName={managerName} ... />` 21 props 시그니처 verbatim (line 768~789). 내부 캘리브 로직 (`onCalibTouchStart` / `onCalibTouchMove` / `onCalibTouchEnd` / `onCalibClick` / `clientToImgPct` / `advanceStep` / `confirmPoint` / `loadWorkLogCalib` / `saveWorkLogCalib` / `WORKLOG_CALIB_STEPS` 33 step / `WORKLOG_CALIB_KEY 'calib_worklog'` / `FINGER_OFFSET 60` / `AREA_KEYS` Set / `overlayItems` 33건 conditional / `WorkLogCalibMarker` 십자+라벨) **100% 보존** — 12-staff W8 lp[] / 15-daily-report W6 mirror.
- **토큰**: 외곽 wrapper = `.worklog-portrait-wrapper` (W5 우측 패널 inherit) / `<img>` = `.worklog-portrait-image` (maxWidth/maxHeight 100% objectFit contain rounded-sm bg-white boxShadow) / 오버레이 영역 = `.worklog-portrait-overlay-area` (position absolute pointerEvents 캘리브 모드 분기) / "인쇄 미리보기" 라벨 = `.worklog-portrait-print-label` (text-caption text-text-secondary uppercase position absolute top-2 leading-none) / 캘리브 안내 바 = `.worklog-portrait-calib-bar` (line 1141~1170 — position absolute top-2 translateX padding 10/20 fontWeight 700) / 확인 버튼 = `.worklog-portrait-calib-confirm` (bg #22c55e solid) / 취소 버튼 = `.worklog-portrait-calib-cancel` (bg overlay rgba(255,255,255,0.15)) / 십자 마커 = `.worklog-portrait-calib-marker` (W6 컴포넌트 안 markup) / 위치 설정 버튼 = `.worklog-portrait-setup-btn` (line 1175~1187, hasCalib 분기 → modifier class) / 미설정 강조 = `.worklog-portrait-setup-btn--missing` (bg rgba(239,68,68,0.9))
- **폰트**: 캘리브 안내 바 폰트 14·11·13·12 (line 1145/1154/1157/1163/1168) 그대로 — 오버레이 UI 정보 노출 UX 예외. 위치 설정 버튼 fontSize 12 = text-caption 그대로 (12px = OK). 외곽 wrapper 만 토큰화.

### W7 — TSX 변환 verify checklist (markdown)
- **보존**: WorkLogPage.tsx 의 모든 비즈 로직 100% 보존 (`useQuery × 2`, `useMutation × 1`, `useState × 14` form + 9 control, `useRef × 3`, `useCallback × 6 (WorkLogPortraitPreview 안)`, `useEffect × 2 (loadEffect + measureEffect)`, `handleExport`, `changeMonth`, `saveMutation`, `inputStyle()`, `taStyle()`, `monthPickerRef`, `loadedRef`, `prevYmRef`, `focusedField`, `generating`, `workLogApi.{get,preview,save}`, `generateWorkLogExcel`, `loadWorkLogCalib`, `saveWorkLogCalib`, `WORKLOG_CALIB_STEPS`, `WORKLOG_CALIB_KEY`, `FINGER_OFFSET`, `AREA_KEYS`, `overlayItems`, `textStyle`, `clientToImgPct`, `onCalibTouchStart/Move/End/Click`, `advanceStep`, `confirmPoint`, `WorkLogCalibMarker`). UI markup 만 재작성.
- **토큰**: W2~W6 sketch 의 모든 Tailwind class / CSS class 정의를 verbatim grep 추출 → W7 checklist 안에 인용 (memory `feedback_planner_prompt_sketch_verbatim`).
- **폰트**: design-system §2.7 + 마이그레이션 §4.2 박제. 9·10·11px 0건 룰 명시 (캘리브 안내 바 예외).

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

본 인용은 `cha-bio-safety/docs/redesign-context/18-worklog/design-system.md` (v0.1.1) 원문 그대로. 후속 wave 작업자가 design-system.md 를 별도로 열지 않아도 핵심 룰을 본 인덱스에서 직접 확인 가능하도록 박제한다.

## §3.1 design-system §1.1 노안 친화 (verbatim)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

> 18-worklog 적용: 9·10·11px ≥18건 위반 (라벨 11 다수 / dirty indicator 11 / 모바일 헤더 14 / "인쇄 미리보기" 11 등). W2~W6 sketch + W7 변환 시 일괄 상향 (11 → 12 / 13 → 16~18 / 14 → 18). 캘리브 안내 바 (line 1145/1154/1157/1163/1168 14·11·13·12) 는 정보 노출 UX 우선이라 예외 (memory 룰 3 / sketch_realistic_data 분기 보존).

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

> 18-worklog 적용: 5 카드 (기본정보 + 4 카테고리 + 불량사항 개선보고) + footer 버튼 + 월 네비 등 5 위계가 시각적으로 분명히 구분되어야 함. 카드 경계 `border-border-default` 명확. 그라데이션 폐기 (§3.7) 가 §1.2 의 "장식 빼기" 룰 연속.

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

> 18-worklog 적용: 데스크톱은 좌우 분할 (좌측 편집 + 우측 A4 portrait, line 733~793) **레이아웃**으로 밀도 차이 책임. 폰트는 모바일과 동일 (W5 sketch 절대 룰). page-padding `--page-padding` 자동 분기 (모바일 16 / 데스크톱 24~32).

## §3.4 design-system §6.1 Progress Color Rule (verbatim)

```
### 6.1 Progress Color Rule (진척률 색 매핑)

점검 카테고리 도넛, 카테고리 카드 좌측 색바 등 **진척률을 표현할 때** 일관 적용한다.

| 진척률 | 색상 | 토큰 |
|---|---|---|
| 100% (완료) | 녹색 | `--status-safe-bar` |
| 50~99% | 파랑 | `--accent` |
| 1~49% | 노랑 | `--status-warning-bar` |
| 0% (미시작) | 회색 | `--text-tertiary` |

**카테고리별 임의 색 배정 폐지** — 카테고리는 아이콘 모양으로 구분하고, 색은 진척률 기반만 사용한다.
```

> **§6.1 미적용 — 18-worklog 페이지에는 진척률 도넛/카테고리 카드 없음.** 5 카드 모두 raw 정보 입력 카드 (진척률 표현 아님). 양호/불량 토글의 `var(--safe)`/`var(--danger)` 는 status 의미 색 (§1.4) 이지 진척률 색이 아님. Progress Color Rule 미적용. §6.4 그라데이션 폐기 룰만 **적용** (OQ #1).

## §3.5 design-system §6.2 Stat Card Number Color (verbatim)

```
### 6.2 Stat Card Number Color

통계 카드(28px display 숫자) 색상 룰:
- 기본 숫자 색: `--text-primary` (흰색/검정)
- 라벨: `--text-secondary`
- 단위: `--text-tertiary`
- **위험 임계치 조건부 처리**: `점검 미완료 > 0`, `미조치 > 0` 등 주의가 필요한 상태일 때 숫자만 `--status-danger`로 변경
- 카드 좌측 3px 색바: 해당 status 토큰의 `bar` 변종 (예: `--status-danger-bar`)
```

> **§6.2 / §7 ("Stat Card" 룰) 미적용 — 18-worklog 페이지에는 통계 숫자 카드 없음.** 5 카드는 모두 텍스트 입력 카드 (28px display 숫자 아님). W7 변환 wave executor 가 이 룰을 verbatim 인용 안 했다고 deviation 으로 잡으면 안 됨 (memory `feedback_tsx_wave_stat_card_drift`). drift 방지 명시 박제.

## §3.6 design-system §7.1 Lucide Icon System (verbatim)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

> **§7 / §10 Iconography — Lucide candidates.** WorkLogPage.tsx 는 현재 line 803~805 의 raw `<svg>` ChevronLeft + line 712/728 `navBtn` 안 텍스트 `‹` / `›` + line 1185 ⚠ 글리프 사용 중. W2 진입 시 lucide `<ChevronLeft size={15} />` (뒤로 버튼) + `<ChevronLeft size={16} />` / `<ChevronRight size={16} />` (월 네비) 로 교체. line 1185 의 ⚠ 글리프 → lucide `<AlertTriangle size={14} />` 교체 (OQ #6 default). Download/Save 아이콘은 footer 버튼에 옵션 추가 가능 (W5 sketch 결정).

## §3.7 design-system §6.4 Backgrounds & Gradients 폐기 룰 (verbatim)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

> 18-worklog 현재 그라데이션 = line 679 `linear-gradient(135deg,#1d4ed8,#2563eb)`. 14-reports W6 LOCKED b 결정 + 15-daily-report OQ #1 일관 정책 적용 → **그라데이션 폐기 → `bg-safe-bar` solid.** 근거:
> - 14-reports W6 LOCKED b 일관 정책
> - 15-daily-report OQ #1 default OK (그라데이션 → solid)
> - memory `feedback_design_sketch_first` — 그라데이션 차이는 시각 손실, sketch 로 먼저 컨펌
> - memory `feedback_tailwind_token_class_pattern` — class 패턴은 `bg-safe-bar` (status- prefix 없음)
> §7 OQ #1 에서 사용자 컨펌 (default = solid).

---

# §4. 14-reports SW1 결과물 (components.css) inherit 매핑

본 페이지는 14-reports SW1 (`cha-bio-safety/src/styles/components.css` 의 95 class 카탈로그) 결과를 일부 재사용 가능. inherit / 신규 매핑:

## §4.1 재사용 가능 class (inherit, ≥3 항목 충족)

| class | 14-reports 정의 위치 (components.css) | 18-worklog 적용 element | 비고 |
|---|---|---|---|
| `.page-header` | line 23 | WorkLogPage line 801~809 모바일 자체 헤더 | bg-surface-raised, padding 8 12 9 동일 |
| `.back-btn` | line 24 | WorkLogPage line 802~806 뒤로 버튼 (34×34) | iconBtn line 44 동일 사양 |
| `.page-title` | line 25 | WorkLogPage line 807 타이틀 "업무 수행 기록표" | 18px text-title (현 14 → 18 상향) |
| `.page-body` | line 32 | WorkLogPage line 812 스크롤 본문 (padding 12 16) | 동일 |
| `.dot-meta` | line 41 | 보고일시 안 텍스트 dot (현재 fontSize 12 "." text span 으로 처리 중이지만 dot-meta 4×4 회색 dot 으로 변경 검토) + 저장 버튼 '· 수정됨' (line 686) | 4×4 회색 dot |
| `.page-footer-note` | line 42 | 저장 버튼 '· 수정됨' span (line 685~687) 또는 footer 하단 안내 줄 (현재 없음, 추가 옵션) | text-align center, 12px, text-tertiary |

## §4.2 신규 정의 (W2~W6 sketch + W7 TSX wave 에서 components.css 추가, ≥10 항목 충족)

- W2: `.month-nav` / `.month-nav-btn` / `.month-display` / `.month-picker-trigger` (4건)
- W3: `.worklog-section-card` / `.worklog-section-title` / `.worklog-field-label` / `.worklog-textarea` / `.worklog-result-toggle` / `.worklog-result-toggle--ok` / `.worklog-result-toggle--bad` / `.worklog-result-toggle--unselected` / `.worklog-action-label` / `.worklog-action-label--bad` (10건)
- W4: `.worklog-report-card` (= `.worklog-section-card` reuse) / `.worklog-report-date` / `.worklog-report-date-input` / `.worklog-report-dot` (또는 `.dot-meta` reuse) / `.worklog-method-btn` / `.worklog-method-btn--selected` / `.worklog-fix-other-input` (7건)
- W5: `.worklog-footer` / `.worklog-footer-save` / `.worklog-footer-save--disabled` / `.worklog-footer-save-dirty` / `.worklog-footer-export` / `.worklog-mobile-footer` / `.worklog-desktop-layout` / `.worklog-desktop-edit-panel` / `.worklog-desktop-preview-panel` (9건)
- W6: `.worklog-portrait-wrapper` / `.worklog-portrait-image` / `.worklog-portrait-overlay-area` / `.worklog-portrait-print-label` / `.worklog-portrait-calib-bar` / `.worklog-portrait-calib-confirm` / `.worklog-portrait-calib-cancel` / `.worklog-portrait-calib-marker` / `.worklog-portrait-setup-btn` / `.worklog-portrait-setup-btn--missing` (10건)

신규 class 합계 ≈40건. `≥10건` 요건 충족.

## §4.3 components.css 그라데이션 토큰 검토
14-reports SW1 결과 components.css 안 그라데이션 class 검색 결과 — 그라데이션 class 미존재 확인 (CTA 도 solid 정책). 18-worklog 도 OQ #1 default 적용 시 그라데이션 신규 class 미생성 → `.worklog-footer-save` 가 `bg-safe-bar` solid 단일 패턴. 만약 OQ #1 (b) 그라데이션 유지 선택 시 `.worklog-footer-save--gradient` 신규 정의 (단, 14-reports + 15-daily-report 일관 정책 위반 위험).

---

# §5. 메모리 룰 inline 인용 (≥10건, unique slug)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건 (10 본문 + 보너스 2건). 각 룰은 `feedback_*.md` 파일명 + 1줄 요약 + Why + How (18-worklog 컨텍스트) 3 항목.

## 룰 1 — feedback_design_sketch_first.md
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저, 인라인 직행 금지
- **Why**: 변경 후 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적
- **How (18-worklog)**: W3 카드 간 margin / padding / radius / 토글 사이즈도 sketch-wave-3 안에 명시. "양호/불량 토글 작게/크게" 같은 인라인 변경 금지. 모든 카드 간격은 sketch HTML 에서 결정.

## 룰 2 — feedback_redesign_sketch_rule_enforcement.md
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성
- **Why**: status 색은 의미 fix — 미적 색으로 사용 시 정보 위계 무너짐
- **How (18-worklog)**: 5 카드는 정보 입력 카드 → `bg-surface-raised border-border-default` 만. `bg-fire-bar` / `text-danger` 같은 status 색 배경/텍스트 사용 금지. 양호/불량 토글의 `var(--safe)`/`var(--danger)` 는 status 의미 색 (§1.4) — 결과 표시는 의미 fix, 일관 유지. 저장 버튼은 CTA → `bg-safe-bar` solid OK.

## 룰 3 — feedback_sketch_realistic_data.md
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄
- **Why**: 카피 임의 변경 시 코드 변경 wave 가 deviation 으로 잡음
- **How (18-worklog)**: 카피 verbatim — "업무 수행 기록표" (헤더), "기본 정보" / "관리자", "소방시설" / "피난방화시설" / "화기취급감독" / "기타사항", "확인내용" / "결과" / "조치내역", "양호" / "불량", "불량사항 개선보고" / "보고일시" / "보고방법" / "조치방법", "대면" / "서면" / "정보통신", "이전" / "제거" / "수리·교체" / "기타", "기타 내용 입력", "저장" / "저장 중..." / "· 수정됨", "엑셀 출력" / "출력 중...", "위치 재설정" / "⚠ 위치 설정", "인쇄 미리보기". **fireResult/escapeResult 2-state vs gasResult/etcResult 3-state 분기** 도 코드 그대로 (sketch markup 동일, onClick 로직 분기 보존). 시각 변경 (그라데이션 → solid, 14 → 18px) 만 sketch 에서 처리.

## 룰 4 — feedback_planner_prompt_sketch_verbatim.md
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 verbatim 인용
- **Why**: 토큰명/사이즈 추측은 deviation 유발 (03-qr-scan 6건 사례)
- **How (18-worklog)**: W7 변환 wave 진입 직전 sketch-wave-2~6.html 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → W7 checklist 안에 verbatim 인용. 예: `grep -oE 'class="[^"]+"' sketch-wave-N.html | sort -u` 결과 박제. 특히 monthPickerRef `showPicker?.() ?? click()` markup + WORKLOG_CALIB_STEPS 33 step 객체 배열 verbatim 인용.

## 룰 5 — feedback_tailwind_token_class_pattern.md
- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지)
- **Why**: 11-div TSX v3 hotfix(4ce707e) — `status-` prefix tailwind.config 에 없어서 class 안 먹음
- **How (18-worklog)**: 저장 버튼 = `bg-safe-bar` (`bg-status-safe-bar` X). 양호/불량 토글 = `bg-safe-bar` / `bg-danger-bar` (또는 `var(--safe)` / `var(--danger)` 인라인). lucide 아이콘 = `<ChevronLeft size={15} />` / `<AlertTriangle size={14} />` (className 으로 `w-4 h-4` 금지).

## 룰 6 — feedback_tailwind_w8_h8_is_48px.md
- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용
- **How (18-worklog)**: 뒤로 버튼 = line 44 `iconBtn` 34×34 → sketch 에서 `.back-btn` (14-reports inherit, w-[34px] h-[34px]) 또는 `w-7 h-7` (32px). 월 네비 ‹/› = line 25 `navBtn` 28×28 → `w-[28px] h-[28px]` 명시 또는 `w-7 h-7` (32px) 상향. **`w-8 h-8` (48px) 금지.**

## 룰 7 — feedback_text_caption_leading_none.md
- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 작은 영역은 `leading-none` 명시
- **Why**: line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생
- **How (18-worklog)**: 월 네비 안 월 표시 (line 716 `fontSize: 15`) `leading-none` 추가. ‹/› 버튼 안 텍스트 (line 27 `fontSize: 16`, line 29 `lineHeight: '1'` 기존 룰 유지 = leading-none). 저장 버튼 dirty indicator '· 수정됨' (line 686 fontSize 11) `leading-none` 명시. 양호/불량/대면/서면 등 토글 (fontSize 12) 안 작은 영역 leading-none 검토.

## 룰 8 — feedback_tsx_wave_emoji_dot_gap.md
- **요약**: alias sed-replace X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify
- **Why**: sketch 의 `🎯` `⬇` 같은 글리프가 TSX 변환에서 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 자동 적용 안 됨
- **How (18-worklog)**: ⚠ 글리프 (line 1185 "⚠ 위치 설정") → lucide `<AlertTriangle size={14} />` 로 교체 또는 그대로 유지 (사용자 컨펌 OQ #6). 보고일시 dot span (line 614/616 fontSize 12 ".") 은 markup 명시 보존 — 4×4 `.dot-meta` 회색 dot 으로 치환 옵션 (OQ 잠재 — default = 텍스트 "." 유지). 저장 버튼 안 '· 수정됨' (line 686) 의 '·' 도 dot span markup 보존 (또는 `.dot-meta` 치환).

## 룰 9 — feedback_tsx_wave_stat_card_drift.md
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰을 덮어쓰는 사고
- **How (18-worklog)**: 18-worklog 에는 Stat Card 없으므로 §3.5 인용 후 "미적용" 메타 명시. 단, sketch 새 패턴 (예: 카드 제목 13→18 상향 / 라벨 11→12 상향 / textarea 12→14~16 상향) verbatim 인용해 W7 checklist 박제. 특히 카드 제목 (5건) / 필드 라벨 (≥15건) / 토글 fontSize 의 source line 그대로 새 디자인 덮어쓰지 않게 verify.

## 룰 10 — feedback_avoid_premature_confirmation.md
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미
- **How (18-worklog)**: 본 인덱스 완료 후 "§7 OQ 6건 컨펌 부탁" 보고만. "wave 1 완벽" / "W2 진입 가능" 같은 자신감 표현 금지. W2~W7 진입도 사용자 명시 컨펌 후에만.

## 룰 11 (보너스) — feedback_gsd_workflow_strict.md
- **요약**: redesign sketch/TSX 변환은 `/gsd:quick` 또는 `/gsd:ui-phase` 시작 필수. ad-hoc PLAN/SUMMARY 직접 작성 금지
- **Why**: 컨텍스트 낭비 + 메모리 룰 위반 사고 방지
- **How (18-worklog)**: 본 wave 자체가 `/gsd:quick` (Quick ID 260525-fda) 로 시작된 wave. W2~W7 모두 새로운 `/gsd:quick` 시작 — 본 인덱스에서 미리 분배한 file path 그대로 atomic commit. ad-hoc sketch HTML 직접 작성 금지.

## 룰 12 (보너스) — feedback_cbc7119_design_never_wrangler.md
- **요약**: 디자인 wave 중 wrangler --project-name=cbc7119 절대 X. main push 자동 cbc7119-preview 만
- **Why**: 직원 도메인 (`cbc7119.pages.dev`) 과 디자인 도메인 (`cbc7119-preview.pages.dev`) 분리 룰
- **How (18-worklog)**: 본 워크트리 (cbc7119-design) 는 cbc7119-preview 만 다룸. wrangler 명령 + `npm run deploy` 모두 금지. §6 negative rule 에도 박제.

(unique slug ≥10건 — 1~10 본문 + 11/12 보너스 = 12개. §8 verify gate 4번으로 enforce.)

---

# §6. negative rule (이 wave 에서 금지된 것, ≥8건)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **WorkLogPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/WorkLogPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src` 결과 0 줄.
- **components.css 수정 금지** — 14-reports SW1 결과물 그대로. W7 TSX 변환 wave 에서만 신규 class 추가.
- **다른 페이지 (13-schedule / 14-reports / 15-daily-report / 19~21 legal / 23-education / 27-login / 28-splash 등) 영향 금지** — `git status` 에 18-worklog/ 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler.md`. `.claude/settings.local.json` deny 강제. 본 워크트리는 cbc7119-design 전용.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰. 직원 도메인 (`cbc7119.pages.dev`) 경로.
- **14-reports / 15-daily-report sketch 폴더 구조와 다른 패턴 도입 금지** — 평면(flat sibling) 패턴. `sketch/` 서브폴더 만들지 않음. 18-worklog 도 동일 평면 배치.
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` 이미 `/worklog` 등재됨 (line 71 실측 확인). 본 wave + W2~W7 모두 App.tsx 손대지 않음.
- **외부 의존 `/templates/preview/worklog-1.png` 변경/이동 금지** — W6 wrapper wave 가 내부 image src (line 1071) 손대지 않음.
- **비즈 시그니처 변경 금지** — workLogApi 3종 (get/preview/save) + generateWorkLogExcel + isAdmin role 분기 (line 61) + monthPickerRef `showPicker?.() ?? click()` (line 715) + WORKLOG_CALIB_KEY `'calib_worklog'` (line 869) + FINGER_OFFSET 60 (line 870) + WORKLOG_CALIB_STEPS 33 keys verbatim + useQuery × 2 (savedQuery + previewQuery) + useMutation × 1 (saveMutation) + handleExport isDirty confirm 분기 (line 284) + changeMonth prevYmRef/loadedRef reset 분기 (line 190~201) + AREA_KEYS Set + overlayItems 33건 conditional.

---

# §7. open questions (W2 진입 직전 사용자 컨펌, ≥5건, 권장 6건)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 6건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call).

- **OQ #1**: 저장 버튼 그라데이션 (`linear-gradient(135deg,#1d4ed8,#2563eb)`, line 679) → `bg-safe-bar` solid 통일 OK? **default: OK** — 14-reports W6 LOCKED b 일관 + 15-daily-report OQ #1 동일 정책 + design-system §6.4 CTA 그라데이션 폐기. 엑셀 출력 버튼은 border 보조 액션 유지 (기존 그대로).

- **OQ #2**: admin 권한 readOnly 폼 시각 처리 — (a) 현재 패턴 유지 (`opacity: 0.5` + `cursor: 'default'` + `background: var(--bg2)`) / (b) 명시적 잠금 아이콘 + 회색 톤 강화 / (c) 비-admin 진입 시 toast 안내 + `<fieldset disabled>` 폼 자체 비활성 표시 + 헤더에 "읽기 전용" 배지. **default: (a) 현재 패턴 유지** — 비-admin 진입 빈도 낮음 + 기존 UX 익숙, 변경 시 회귀 위험. 단 isAdmin readOnly 시 cursor 'default' 시각 강화는 W3 sketch 에서 박제. `<fieldset disabled>` wrapper 옵션 검토 (a+).

- **OQ #3**: 양호/불량 결과 토글 색상 — (a) status `var(--safe)`/`var(--danger)` 현재 그대로 / (b) `bg-safe-bar` / `bg-danger-bar` 변종으로 통일 / (c) 양호만 채움 + 불량만 채움 + unselected `var(--bg3)` 회색 톤 (현재 패턴) 유지. 또한 보고방법/조치방법 토글 `var(--acl)` (accent) 과 양호/불량 토글 `var(--safe)`/`var(--danger)` (status) 의 색 분리 — (a) 의미 분리 유지 / (b) 모두 `--accent` 통일. **default: (c) 양호/불량은 status 색 유지 + (a) 의미 분리 유지** — 비즈 차이 (gasResult/etcResult 3-state vs fireResult/escapeResult 2-state) 가 코드 분기와 1:1 매칭, 색상 변경 시 회귀 위험. tokens.css 토큰만 정렬 (`var(--safe)` → `var(--status-safe)` 매핑 검토). 양호/불량 = 결과 의미 (safe/danger), 보고방법/조치방법 = 선택 의미 (accent) 분리는 정보 위계에 유리.

- **OQ #4**: 미래 월 비활성 UX — 현재 changeMonth (line 190~201) 안 미래 월 가드 없음 (자유 진입). (a) 그대로 자유 진입 / (b) ‹/› button 자체 비활성 (15-daily-report dateNav 의 chevron spacer 패턴 mirror — `canForward = ym < thisMonthKST()` 분기) / (c) monthPicker `max={thisMonthKST()}` 속성 추가 / (d) toast 안내 후 abort. **default: (b) ‹/› button 자체 비활성 + (c) monthPicker max 속성 추가** — 15-daily-report dateNav 의 spacer 패턴 일관 + UX 명료 (toast 보다 시각적). 단 admin 이 미래 월에 미리 작성하는 use case 가 있으면 (a) 유지 (사용자 컨펌 필수).

- **OQ #5**: WorkLogPortraitPreview 변환 scope — (a) wrapper layout 만 (내부 캘리브/오버레이/이미지 좌표 시스템 보존) / (b) 본체까지 변환. **default: (a) wrapper 만** — 12-staff W8 lp[] / 15-daily-report W6 mirror. WORKLOG_CALIB_STEPS 33 step + WORKLOG_CALIB_KEY `'calib_worklog'` + FINGER_OFFSET 60 + 이미지 src `/templates/preview/worklog-1.png` + WorkLogCalibMarker 십자+라벨 + AREA_KEYS Set + overlayItems 33건 conditional + textStyle helper 모두 100% 보존. 캘리브 안내 바 (line 1141~1170 fontSize 14·11·13·12) 도 오버레이 UI 정보 노출 UX 예외로 그대로.

- **OQ #6**: 위치 설정 button (line 1175~1187) `⚠ 위치 설정` 글리프 처리 — (a) lucide `<AlertTriangle size={14} />` 교체 / (b) ⚠ 글리프 유지 (현재 소스 그대로). **default: (a) lucide 교체** — memory `feedback_tsx_wave_emoji_dot_gap` 룰. 단 사용자가 ⚠ 글리프 유지 선호 시 (b) 도 acceptable (시각 강조 효과 보존).

---

# §8. 자체 verify gate (작성 완료 후 통과해야 할 8 gate)

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. §1~§8 헤더 존재 | `grep -cE '^# §[1-8]\.' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` | =8 |
| 2. sub-wave 분배 표 ≥6 row | `grep -cE '^\| W[2-7] ' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` | ≥6 |
| 3. design-system fence ≥6 (open+close ×3 이상) | `grep -c '^```' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` | ≥6 |
| 4. unique feedback_* slug ≥10 | `grep -oE 'feedback_[a-z_]+\.md' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 5. OQ §7 ≥5 | `grep -cE '^- \*\*OQ #' cha-bio-safety/docs/redesign-context/18-worklog/wave-1-index.md` | ≥5 |
| 6. 14-reports inherit class ≥3 | §4.1 표 row count 시각 검증 | ≥3 (실제 6) |
| 7. 신규 class 명단 ≥10 | §4.2 bullet count 시각 검증 | ≥10 (실제 ≈40) |
| 8. negative §6 wrangler+npm run deploy 박제 | `grep -c 'wrangler' wave-1-index.md` ≥1 AND `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 |

추가 negative gate (commit 전 실행):
- `git diff --name-only HEAD -- cha-bio-safety/src` 결과 0 lines (src/** 변경 0)
- `ls cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-*.html 2>/dev/null` 결과 빈 출력 (sketch HTML 0개)
- `git status --porcelain | grep -v '^?? .planning/' | grep -v 'docs/redesign-context/18-worklog/wave-1-index.md'` 결과 0 lines (오직 wave-1-index.md 와 .planning/ 만 변경)

모두 PASS 시 본 인덱스가 W2 진입 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 6건 답변으로 받는다.

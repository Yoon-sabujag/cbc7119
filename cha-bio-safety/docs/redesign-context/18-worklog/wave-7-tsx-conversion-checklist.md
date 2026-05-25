---
title: "18-worklog — W7 TSX 변환 verify checklist"
status: draft
created: 2026-05-25
quick_id: 260525-slq
branch: redesign/18-worklog
source_tsx: cha-bio-safety/src/pages/WorkLogPage.tsx
source_tsx_lines: 1216
sketches_referenced: [W1, W2, W3, W4, W5, W6]
locked_decisions: "W1: 6 OQ default / W2~W6 sketch: 0 (sketch wave 자체는 src/** 0 byte) / W7 (본 wave): 0 (markdown only)"
sub_wave_count: 4   # SW1 components.css / SW2 모바일 / SW3 데스크톱+캘리브 wrapper / SW4 verify gate
verify_gate_count: ">=12"
mirror_of: cha-bio-safety/docs/redesign-context/15-daily-report/wave-7-tsx-conversion-checklist.md
consumed_by: "18-worklog TSX 변환 wave (SW1~SW4) executor"
---

# W7 — TSX 변환 verify checklist (18-worklog)

> 본 파일은 **sketch HTML 이 아님**. TSX 변환 wave (SW1~SW4) executor 가 1-pass 로 적용할 verify gate + region mapping + LOCKED 룰 박제 markdown.
> source-of-truth: `cha-bio-safety/src/pages/WorkLogPage.tsx` (1216 lines) + sketch-wave-2 ~ sketch-wave-6.html 5 개 + design-system.md v0.1.1 + tokens.css + typography.css + 14-reports `components.css` (6 inherit class).
> 15-daily-report W7 (`cha-bio-safety/docs/redesign-context/15-daily-report/wave-7-tsx-conversion-checklist.md`, 934 lines) + 14-reports W7 (700 lines) 패턴 mirror — 구조는 §1~§12 형태로 재편하고 18-worklog 컨텍스트로 재작성.

---

## §1 imports 매핑 (line 1~53)

현재 imports + 추가 예정 (TSX 변환 SW2 시점에 적용):

| 영역 | 현재 (line) | 변경 후 |
|---|---|---|
| react hooks | `useState, useEffect, useRef, useCallback` from 'react' (line 2) | 동일 (보존) |
| router | `useNavigate` from 'react-router-dom' (line 3) | 동일 |
| react-query | `useQuery, useMutation, useQueryClient` from '@tanstack/react-query' (line 4) | 동일 |
| toast | `toast` from 'react-hot-toast' (line 5) | 동일 |
| api | `workLogApi` from '../utils/api' (line 6) | 동일 (비즈 anchor) |
| excel | `generateWorkLogExcel` from '../utils/generateExcel' (line 7) | 동일 |
| store | `useAuthStore` from '../stores/authStore' (line 8) | 동일 |
| hook | `useIsDesktop` from '../hooks/useIsDesktop' (line 9) | 동일 |
| type | `WorkLogPayload` from '../types' (line 10) | 동일 |
| **추가 (lucide)** | (없음) | `import { ChevronLeft, ChevronRight, Save, Download, AlertTriangle } from 'lucide-react'` |

**상수 보존 매트릭스 (line 25~53)** — TSX 변환 시 일부 잔존, 일부 tailwind/components.css 로 흡수:

| 상수 | line | 변환 후 처리 |
|---|---|---|
| `navBtn` (28×28 navBtn ‹/›) | 25~30 | components.css `.worklog-month-nav__btn` 로 흡수 + lucide ChevronLeft/Right 로 텍스트 교체 |
| `card` (background bg2 / radius 14 / padding 14) | 32~35 | components.css `.worklog-section-card` 로 흡수 (sketch-wave-3 verbatim) |
| `textareaStyle` (line 37~42) | 37~42 | components.css `.worklog-textarea` 로 흡수 (sketch-wave-3 verbatim) |
| `iconBtn` (34×34) | 44~48 | components.css inherit `.back-btn` 재사용 (14-reports SW1) |
| `skeletonStyle` (line 50~53) | 50~53 | components.css `.worklog-skeleton` 신규 |

`thisMonthKST` (line 13~16) / `addMonths` (line 18~22) — 비즈 anchor, verbatim 보존.

---

## §2 메인 함수 (line 56~333) — hooks/state/handlers 1:1 verbatim

본 섹션은 **본문 0 byte 변경 강제** — sketch class 적용은 §3 JSX 영역에서만.

**hook 5종 (line 56~61)**:
- `useNavigate` (line 57) / `useQueryClient` (line 58) / `useIsDesktop` (line 59) / `useAuthStore` → `{ staff }` (line 60) / `isAdmin = staff?.role === 'admin'` (line 61)

**폼 상태 17종 (line 67~86)**:
managerName / fireContent / fireResult ('ok' | 'bad') / fireAction / escapeContent / escapeResult ('ok' | 'bad') / escapeAction / gasContent / gasResult ('' | 'ok' | 'bad' 3-state) / gasAction / etcContent / etcResult ('' | 'ok' | 'bad' 3-state) / etcAction / reportYear / reportMonth / reportDay / reportMethod / fixMethod / fixOtherText

**ref / local state (line 88~95)**:
loadedRef (마지막 로드 payload 캐시) / prevYmRef (월 변경 감지) / focusedField (현재 캘리브 focus key) / generating (엑셀 생성 중)

**react-query 2종 (line 98~110)**:
- `savedQuery` = `useQuery({ queryKey: ['worklog', ym], queryFn: () => workLogApi.get(ym), staleTime: 0 })` (line 98~103)
- `previewQuery` = `useQuery({ queryKey: ['worklog-preview', ym], queryFn: () => workLogApi.preview(ym), enabled: savedQuery.data === null && savedQuery.isSuccess, staleTime: 0 })` (line 105~110)

**데이터 로드 useEffect (line 113~187, 67 줄)**:
월 변경 감지 (`prevYmRef.current !== ym`) → savedQuery / previewQuery fallback → payload 매핑 19 종 (gas_result / etc_result 기본값 `'ok'`, gas_action / etc_action / report_* `?? ''`).

**handlers**:
- `changeMonth(newYm)` (line 190~201) — `prevYmRef.current=''` + `loadedRef.current=null` + 17 setter 초기화 + `setYm(newYm)` (순서 보존)
- `currentPayload` (line 204~224) — 19 필드 객체 생성
- `isDirty` (line 226~246) — `loadedRef.current` 와 19 필드 비교
- `saveMutation` (line 249~280) — `useMutation({ mutationFn: workLogApi.save, onSuccess: (data) => { loadedRef.current = data; queryClient.invalidateQueries(...) }, onError: () => toast.error(...) })`
- `handleExport` (line 283~302) — isDirty 시 `if (!confirm('저장되지 않은 변경사항이 있습니다\n\n저장 후 엑셀을 출력하시겠습니까?')) return` → `try { await saveMutation.mutateAsync(...) } catch { return }` → `generateWorkLogExcel(...)`
- `isLoading` `isSaving` (line 305~306)
- `roStyle` / `taStyle` / `inputStyle` (line 308~330) — isAdmin readOnly 분기 (opacity 0.5 + cursor 'default' + background var(--bg2))
- `monthPickerRef` (line 333)

---

## §3 JSX render (line 336~829) — sketch class 적용

### §3.1 formContent (line 336~664) — 6 카드

| 카드 | line 범위 | sketch class (W3/W4 verbatim) | 비고 |
|---|---|---|---|
| 기본 정보 | 339~354 | `.worklog-section-card` + `.worklog-section-title` + `.worklog-field-label` + `.worklog-input` | managerName input |
| 소방시설 | 358~419 | `.worklog-section-card` + `.worklog-toggle-row` + `.worklog-result-toggle--ok/--bad/--unselected` + `.worklog-action-label--bad` | fireContent rows={4} + fire 2-state + fireAction rows={3} |
| 피난방화시설 | 421~481 | (동일 패턴) | escapeContent rows={3} + 2-state |
| 화기취급감독 | 484~543 | (동일 패턴) | gasContent rows={2} + 3-state toggle |
| 기타사항 | 546~605 | (동일 패턴) | etcContent rows={3} + 3-state toggle |
| 불량사항 개선보고 | 608~663 | `.worklog-section-card` + `.worklog-report-date` + `.worklog-report-date-input--year/--month/--day` + `.worklog-report-dot` + `.worklog-method-row` + `.worklog-method-btn--selected` + `.worklog-fix-other-input` | reportYear/Month/Day inputs (width 65/40/40) + 보고방법 3 button + 조치방법 4 button + fixMethod==='other' 시 fixOtherText input maxLength={10} width 160 |

### §3.2 footerButtons (line 667~707)

저장 버튼 (line 670~691) — 현재 `background: 'linear-gradient(135deg,#1d4ed8,#2563eb)'` (line 679, "lin-grad" 메타) → **OQ #1 default solid** → `.worklog-footer-save` (bg-safe-bar solid) 변환. dirty 시 `.worklog-footer-save-dirty` (text-caption text-warn leading-none) span "· 수정됨" 보존.
엑셀 출력 (line 693~706) — `.worklog-footer-export` (bg-surface-raised + border).

### §3.3 monthNav (line 710~730)

`.worklog-month-nav` + `.worklog-month-nav__btn` (28×28) + `.worklog-month-nav__label` (min-width 90 + leading-none).
`monthPickerRef.current?.showPicker?.() ?? monthPickerRef.current?.click()` (line 715) — **iOS Safari fallback hack 보존**.
input `type='month'` 숨김 (line 720~726, opacity 0 pointerEvents none width 1 height 1) — verbatim 보존.

### §3.4 데스크톱 렌더 (line 733~793)

`.worklog-desktop-layout` flex row + `.worklog-desktop-edit-panel` (flex 1 overflow auto padding '24px 32px') + `.worklog-desktop-preview-panel` (aspectRatio '210/297' borderLeft 1px) + 우측 안 `WorkLogPortraitPreview` 20 props.
"인쇄 미리보기" 라벨 (line 762, fontSize 11) → text-sm (OQ #6).

### §3.5 모바일 렌더 (line 796~829)

`<header>` (line 801~809) → `.page-header` inherit + 인라인 SVG 백버튼 (line 803~805) → **lucide `<ChevronLeft size={15} />` 교체** (OQ #5) + `.page-title` "업무 수행 기록표" (line 807).
스크롤 본문 (line 812~815) + height 72 spacer (line 814) 보존.
고정 푸터 (line 818~826) — `position: fixed` + `paddingBottom: 'calc(10px + var(--sab))'` 보존 (iOS safe-area, memory `feedback_body_scroll_lock_safe_area`).

---

## §4 비즈 anchor 보존 박스 (18 종, 0 byte 변경 강제)

| # | anchor | line | 보존 이유 |
|---|---|---|---|
| 1. | `workLogApi.get / preview / save` | utils/api.ts | 0 byte (D1 호출 시그니처) |
| 2. | `useQuery(['worklog', ym], workLogApi.get, staleTime: 0)` | 98~103 | staleTime 0 보존 — 매 진입마다 fresh |
| 3. | `useQuery(['worklog-preview', ym], enabled: savedQuery.data===null)` | 105~110 | savedQuery null 시점만 활성 — fallback 룰 |
| 4. | `useMutation(workLogApi.save, onSuccess: loadedRef + invalidateQueries)` | 249~280 | payload 19 필드 매핑 0 byte |
| 5. | `handleExport` isDirty confirm → mutateAsync → generateWorkLogExcel | 283~302 | confirm 카피 + try/catch return 분기 보존 |
| 6. | `changeMonth` (prevYmRef='' + loadedRef=null + 17 setter + setYm) | 190~201 | 순서 보존 — 월 변경 race 회피 |
| 7. | `WorkLogPortraitPreview` props 20 (yearMonth + 18 폼필드 + onClose?) | 884~911 | yearMonth split → year/month 내부 추출 (line 1020~1021) 0 byte |
| 8. | `WORKLOG_CALIB_STEPS` 33 step (key/label/color) | 833~867 | 사용자 calib 데이터 호환성 — key 1 byte 변경 0 |
| 9. | `WORKLOG_CALIB_KEY = 'calib_worklog'` + `FINGER_OFFSET = 60` | 869, 870 | localStorage 키 변경 금지 (기존 사용자 calib 손실 방지) |
| 10. | `monthPickerRef.current?.showPicker?.() ?? .click()` | 715 | iOS Safari fallback hack 보존 |
| 11. | `isAdmin && setX()` 가드 18+ 위치 + readOnly={!isAdmin} | 전 영역 | 비-admin 폼 입력 차단 룰 |
| 12. | 양호·불량 토글 룰 (fire/escape 2-state vs gas/etc 3-state) | 380, 391, 443, 454, 505, 516, 567, 578 | `gasResult === 'ok' ? '' : 'ok'` 토글 의미 보존 |
| 13. | 보고·조치방법 토글 (reportMethod === val ? '' : val 동일 클릭 해제) | 624, 640 | UX 의미 보존 |
| 14. | `fixMethod === 'other' && <input maxLength={10} ... slice(0,10)>` | 651~661 | width 160 + 10자 cap |
| 15. | 카피 verbatim 18 종 (§4.x 별표) | 전 영역 | feedback_sketch_realistic_data |
| 16. | `clientToImgPct(clientX, clientY)` + FINGER_OFFSET=60 | 945~953 | finger offset 보존 + percent clamp [0,100] |
| 17. | `WorkLogCalibMarker` 시그니처 + 크로스헤어 w/h 40 / 활성 시 20 | 1193~1216 | 0 byte 변경 |
| 18. | `localStorage.getItem(WORKLOG_CALIB_KEY) ?? 'null'` JSON parse fallback | 877 | try/catch null 패턴 보존 |

**카피 verbatim 18+ 종 (별표)**:
- 헤더 카피: "업무 수행 기록표" / "기본 정보" / "관리자" / "관리자 이름을 입력하세요" / "소방시설" / "확인내용" / "결과" / "조치내역" / "조치 내역 없음" / "피난방화시설" / "화기취급감독" / "기타사항" / "불량사항 개선보고" / "보고일시" / "보고방법" / "조치방법" / "기타 내용 입력"
- 라벨: "양호" / "불량" / "대면" / "서면" / "정보통신" / "이전" / "제거" / "수리·교체" / "기타"
- 푸터: "저장" / "저장 중..." / "엑셀 출력" / "출력 중..." / "· 수정됨"
- confirm: "저장되지 않은 변경사항이 있습니다\n\n저장 후 엑셀을 출력하시겠습니까?"
- toast: "저장되었습니다" / "저장 실패 — 다시 시도해 주세요" / "엑셀 생성 실패 — 다시 시도해 주세요"
- aria/title: "뒤로 가기" / "관리자만 저장할 수 있습니다" / "인쇄 미리보기"
- 캘리브: "위치 재설정" / "위치 설정" (warning glyph 단독 처리, lucide 교체 후) / "확인" / "취소"

---

## §5 OQ LOCKED 6 건 verbatim 인용 (wave-1-index.md §7 박제)

- **OQ #1** default: 저장 버튼 그라데이션 ("lin-grad" line 679) → `bg-safe-bar` solid 통일 — 14-reports W6 LOCKED b + 15-daily-report OQ #1 동일 정책 + design-system §6.4 CTA 그라데이션 폐기.
- **OQ #2** default: admin 권한 readOnly 폼 시각 처리 — (a) 현재 패턴 유지 (`opacity: 0.5` + `cursor: 'default'` + `background: var(--bg2)`). 비-admin 진입 빈도 낮음 + 회귀 위험. `<fieldset disabled>` wrapper 옵션 검토 (a+).
- **OQ #3** default: 양호/불량 결과 토글 색상 — (c) 양호/불량은 status 색 유지 + (a) 의미 분리 유지. 비즈 차이 (2-state vs 3-state) 가 코드 분기와 1:1 매칭.
- **OQ #4** default: 미래 월 비활성 UX — (b) ‹/› button 자체 비활성 + (c) monthPicker `max` 속성 추가. 15-daily-report dateNav spacer 패턴 mirror.
- **OQ #5** default: WorkLogPortraitPreview 변환 scope — (a) wrapper layout 만 (내부 캘리브/오버레이/이미지 좌표 시스템 보존). 12-staff W8 lp[] / 15-daily-report W6 mirror. WORKLOG_CALIB_STEPS 33 step + KEY + FINGER_OFFSET 60 + WorkLogCalibMarker 100% 보존.
- **OQ #6** default: 위치 설정 button (line 1175~1187) warning glyph 처리 — (a) lucide `<AlertTriangle size={14} />` 교체. memory `feedback_tsx_wave_emoji_dot_gap` 룰.

---

## §6 5 sketch HTML grep 추출 verbatim class 인용

명령:
```bash
for f in cha-bio-safety/docs/redesign-context/18-worklog/sketch-wave-{2,3,4,5,6}-*.html; do
  echo "=== $f ==="
  grep -oE 'class="[^"]+"' "$f" | sort -u
done
```

추출 결과 (executor 가 W7 작성 시점 실행):

```
=== sketch-wave-2-mobile-header-month-nav.html ===
class="back-btn"
class="flex gap-8 flex-wrap items-start justify-center mb-12"
class="frame-shell"
class="global-header-placeholder"
class="max-w-[900px] mx-auto mt-12 text-zinc-400"
class="mb-6 max-w-[900px] mx-auto"
class="month-display leading-none"
class="month-nav-btn"
class="month-nav"
class="month-picker-hidden"
class="month-picker-trigger"
class="page-bg-dark min-h-screen p-6"
class="page-header"
class="page-title"
class="space-y-1"
class="text-heading text-white mb-2"
class="text-label text-zinc-400"
class="text-title text-zinc-200 mb-2"
class="variant-label"
```

```
=== sketch-wave-3-basic-info-categories.html ===
class="worklog-action-label worklog-action-label--bad"
class="worklog-action-label"
class="worklog-field-label worklog-field-label--mt"
class="worklog-field-label"
class="worklog-input"
class="worklog-result-toggle worklog-result-toggle--bad"
class="worklog-result-toggle worklog-result-toggle--ok"
class="worklog-result-toggle worklog-result-toggle--unselected"
class="worklog-section-card worklog-readonly"
class="worklog-section-card"
class="worklog-section-title"
class="worklog-textarea"
class="worklog-toggle-row"
(+ chrome 토큰 9 종 — W2 공통)
```

```
=== sketch-wave-4-defect-report.html ===
class="worklog-field-label worklog-field-label--mt"
class="worklog-field-label"
class="worklog-fix-other-input"
class="worklog-method-btn worklog-method-btn--selected"
class="worklog-method-btn"
class="worklog-method-row worklog-method-row--wrap"
class="worklog-method-row"
class="worklog-report-date-input worklog-report-date-input--day"
class="worklog-report-date-input worklog-report-date-input--month"
class="worklog-report-date-input worklog-report-date-input--year"
class="worklog-report-date"
class="worklog-report-dot"
class="worklog-save-preview"
class="worklog-section-card worklog-readonly"
class="worklog-section-card"
class="worklog-section-title"
(+ chrome 토큰 9 종 — W2 공통)
```

```
=== sketch-wave-5-footer-desktop-layout.html ===
class="frame-desktop"
class="frame-mobile"
class="worklog-desktop-edit-panel"
class="worklog-desktop-layout"
class="worklog-desktop-preview-panel"
class="worklog-desktop-print-label leading-none"
class="worklog-footer-export worklog-footer-export--disabled"
class="worklog-footer-export"
class="worklog-footer-save worklog-footer-save--disabled"
class="worklog-footer-save-dirty"
class="worklog-footer-save"
class="worklog-footer"
class="worklog-mobile-footer"
(+ chrome 토큰 9 종 — W2 공통)
```

```
=== sketch-wave-6-portrait-preview-wrapper.html ===
class="frame-preview"
class="worklog-portrait-calib-bar-coord"
class="worklog-portrait-calib-bar-step"
class="worklog-portrait-calib-bar"
class="worklog-portrait-calib-cancel"
class="worklog-portrait-calib-confirm"
class="worklog-portrait-calib-marker-dot worklog-portrait-calib-marker-dot--active"
class="worklog-portrait-calib-marker-h"
class="worklog-portrait-calib-marker-v"
class="worklog-portrait-calib-marker"
class="worklog-portrait-image"
class="worklog-portrait-overlay-area"
class="worklog-portrait-print-label leading-none"
class="worklog-portrait-setup-btn worklog-portrait-setup-btn--missing"
class="worklog-portrait-setup-btn"
class="worklog-portrait-wrapper"
(+ chrome 토큰 9 종 — W2 공통)
```

**chrome 토큰 (모든 sketch 공통, 단 1 회만 박제)**: `page-bg-dark min-h-screen p-6` / `frame-shell` / `page-header` / `page-title` / `space-y-1` / `text-heading text-white mb-2` / `text-title text-zinc-200 mb-2` / `text-label text-zinc-400` / `variant-label` / `mb-6 max-w-[900px] mx-auto` / `max-w-[900px] mx-auto mt-12 text-zinc-400` / `flex gap-8 flex-wrap items-start justify-center mb-12`.

---

## §7 폰트 격상 매트릭스 — 9·10·11 → 12 / 14 / 16

| line | 현재 fontSize | 텍스트 컨텍스트 | 목표 토큰 |
|---|---|---|---|
| 340 | 13 / 700 | "기본 정보" | text-base font-bold |
| 341 | 11 / 400 | "관리자" | text-sm (=12, OQ #6) |
| 359 | 13 / 700 | "소방시설" | text-base font-bold |
| 361 | 11 | "확인내용" | text-sm |
| 375 | 11 | "결과" | text-sm |
| 382 | 12 / 700 | "양호" 토글 | text-sm font-bold |
| 393 | 12 / 700 | "불량" 토글 | text-sm font-bold |
| 404 | 11 | "조치내역" (조건부 var(--warn) vs var(--t2)) | text-sm |
| 422 | 13 / 700 | "피난방화시설" | text-base font-bold |
| 424, 438, 467 | 11 | escape 라벨 | text-sm |
| 445, 456 | 12 / 700 | escape 양호/불량 | text-sm font-bold |
| 485 | 13 / 700 | "화기취급감독" | text-base font-bold |
| 486, 500, 529 | 11 | gas 라벨 | text-sm |
| 507, 518 | 12 / 700 | gas 양호/불량 | text-sm font-bold |
| 547 | 13 / 700 | "기타사항" | text-base font-bold |
| 548, 562, 591 | 11 | etc 라벨 | text-sm |
| 569, 580 | 12 / 700 | etc 양호/불량 | text-sm font-bold |
| 609 | 13 / 700 | "불량사항 개선보고" | text-base font-bold |
| 611, 620, 636 | 11 | "보고일시/보고방법/조치방법" 라벨 | text-sm |
| 614, 616 | 12 | "." 구분자 (보고일시) | text-sm (또는 `.dot-meta` 회색 4×4 dot 치환 — OQ 잠재, default 텍스트 유지) |
| 626, 642 | 12 / 700 | 라벨 버튼 | text-sm font-bold |
| 675, 698 | 13 / 700 | 푸터 버튼 ("저장", "엑셀 출력") | text-base font-bold |
| 686 | 11 / 400 | "· 수정됨" | text-sm (OQ #6: 11 → 12) |
| 716 | 15 / 700 | "{year}년 {month}월" | text-base font-bold |
| 807 | 14 / 700 | "업무 수행 기록표" | text-base (이미 14 ≥) |
| 27 | 16 / 700 | navBtn ‹/› | lucide size={16} 교체 후 무효화 |
| 762 | 11 | "인쇄 미리보기" | text-sm |
| 1013 | 7 (textStyle 기본) | 페이지 출력 셀 텍스트 | **변경 0** (캘리브 좌표 시스템, OQ #5 보존) |
| 1108 | 10 | isArea 오버레이 | **변경 0** (페이지 출력) |
| 1119 | 12 | 단일 셀 오버레이 | **변경 0** |
| 1145 | 14 / 700 | 캘리브 안내바 | **변경 0** |
| 1154 | 12 | 캘리브 안내바 보조 | **변경 0** |
| 1157 | 11 | 캘리브 안내바 보조 | **변경 0** |
| 1163 | 13 / 700 | 캘리브 확인 버튼 | **변경 0** |
| 1168 | 12 | 캘리브 취소 버튼 | **변경 0** |
| 1208 | 10 / 900 | 캘리브 마커 라벨 | **변경 0** |

**§7 핵심 룰**:
- 9·10·11 라벨은 모두 12 이상으로 격상 (OQ #6 default).
- WorkLogPortraitPreview 내부 (line 1013, 1108, 1119, 1145, 1154, 1157, 1163, 1168, 1208) 의 작은 fontSize 는 **페이지 출력 룰** (캘리브 좌표 시스템) 이므로 변경 0 — OQ #5 default 보존.

---

## §8 Lucide 아이콘 매핑

| 현재 | line | lucide 이름 | size prop |
|---|---|---|---|
| 인라인 SVG 백버튼 (M15 19l-7-7 7-7, viewBox 24x24) | 803~805 | `ChevronLeft` | size={15} |
| navBtn 텍스트 ‹ | 712 (fontSize 16) | `ChevronLeft` | size={16} |
| navBtn 텍스트 › | 728 (fontSize 16) | `ChevronRight` | size={16} |
| 저장 버튼 텍스트 "저장" | 682~688 | `Save` | size={14} (텍스트 옆 또는 단독 — sketch W5 결정에 따름) |
| 엑셀 출력 버튼 텍스트 "엑셀 출력" | 704 | `Download` | size={14} |
| "위치 설정" warning glyph (line 1185) | 1185 | `AlertTriangle` | size={14} — OQ #6 default lucide 교체 (단, 페이지 출력 영역 인접 — wrapper 안내바 UX 예외) |

memory: `feedback_tsx_wave_emoji_dot_gap` — lucide 교체 후 `.dot-meta` span 추가 markup 검토 (보고일시 dot 구분자 4×4 회색 dot 치환 옵션).

---

## §9 components.css inherit vs 신규 정의

**inherit 6 class (14-reports SW1, 재정의 0)**:

| class | components.css 위치 | 18-worklog 적용 |
|---|---|---|
| `.page-header` | line 25 | line 801 모바일 자체 헤더 (`<header>` flex-shrink 0 + bg-surface-raised) |
| `.back-btn` | line 26 | line 802 뒤로 버튼 (iconBtn 34×34 verbatim) |
| `.page-title` | line 27 | line 807 "업무 수행 기록표" (font-size 18 격상) |
| `.page-body` | (line 8) | line 812 스크롤 본문 (padding 12 16) |
| `.dot-meta` | (line 15) | "· 수정됨" 보조 dot 옵션 + 보고일시 "." 구분자 치환 옵션 |
| `.page-footer-note` | (line 16) | 미사용 (페이지 자체에 안내 줄 없음) |

**신규 정의 (~40 class)** — sketch §6 grep 결과 기반:

W3 신규 (12+): `.worklog-section-card` / `.worklog-section-card.worklog-readonly` / `.worklog-section-title` / `.worklog-field-label` / `.worklog-field-label--mt` / `.worklog-input` / `.worklog-textarea` / `.worklog-toggle-row` / `.worklog-result-toggle` / `.worklog-result-toggle--ok` / `.worklog-result-toggle--bad` / `.worklog-result-toggle--unselected` / `.worklog-action-label` / `.worklog-action-label--bad`

W4 신규 (10+): `.worklog-report-date` / `.worklog-report-date-input` / `.worklog-report-date-input--year` / `.worklog-report-date-input--month` / `.worklog-report-date-input--day` / `.worklog-report-dot` / `.worklog-method-row` / `.worklog-method-row--wrap` / `.worklog-method-btn` / `.worklog-method-btn--selected` / `.worklog-fix-other-input` / `.worklog-save-preview`

W5 신규 (10+): `.worklog-footer` / `.worklog-footer-save` / `.worklog-footer-save--disabled` / `.worklog-footer-save-dirty` / `.worklog-footer-export` / `.worklog-footer-export--disabled` / `.worklog-mobile-footer` / `.worklog-desktop-layout` / `.worklog-desktop-edit-panel` / `.worklog-desktop-preview-panel` / `.worklog-desktop-print-label`

W6 신규 (~16, wrapper 만 — OQ #5): `.worklog-portrait-wrapper` / `.worklog-portrait-image` / `.worklog-portrait-overlay-area` / `.worklog-portrait-print-label` / `.worklog-portrait-setup-btn` / `.worklog-portrait-setup-btn--missing` / `.worklog-portrait-calib-bar` / `.worklog-portrait-calib-bar-step` / `.worklog-portrait-calib-bar-coord` / `.worklog-portrait-calib-confirm` / `.worklog-portrait-calib-cancel` / `.worklog-portrait-calib-marker` / `.worklog-portrait-calib-marker-h` / `.worklog-portrait-calib-marker-v` / `.worklog-portrait-calib-marker-dot` / `.worklog-portrait-calib-marker-dot--active`

W2 month-nav 신규 (5): `.month-nav` / `.month-nav-btn` / `.month-display` / `.month-picker-hidden` / `.month-picker-trigger`

SW1 components.css 작성 executor 는 **§6 sketch HTML 의 `<style>` block 안 css 정의를 verbatim 복사** (memory `feedback_planner_prompt_sketch_verbatim`).

---

## §10 Tailwind cheatsheet — 18-worklog 사용 토큰

| 카테고리 | 토큰 |
|---|---|
| 배경 | `bg-safe-bar` `bg-fire-bar` `bg-danger-bar` `bg-warn-bar` `bg-surface-raised` `bg-surface-sunken` |
| 텍스트 | `text-text-primary` `text-text-secondary` `text-text-tertiary` |
| 보더 | `border-border-default` `border-border-strong` |
| 폰트 | `text-caption` (`leading-none` 동반) `text-sm` `text-base` |
| status- prefix 0 | **`bg-fire-bar` O / `bg-status-fire-bar` X** (memory `feedback_tailwind_token_class_pattern`) |
| 크기 함정 | **`w-8 h-8 = 48px` (tailwind.config spacing override)** — 28×28 navBtn 변환 시 `w-7 h-7` 사용 (memory `feedback_tailwind_w8_h8_is_48px`) |
| 그라데이션 금지 | `bg-[linear-gradient(...)]` arbitrary class 금지 — OQ #1 solid 룰. `bg-blue-700` / `bg-safe-bar` 단색 변환 |
| 빌트인 spacing | `w-7 h-7` (28px) / `w-8 h-8` (48px) / `w-9 h-9` (34px) — config 확인 필수 |

cheatsheet 토큰 총 17 종 (배경 6 + 텍스트 3 + 보더 2 + 폰트 3 + spacing 3).

---

## §11 negative gate (TSX 변환 wave 진입 시 강제, 17 건)

- (1) src/** 변경은 WorkLogPage.tsx 만 — 다른 페이지 / hook / util 0 byte
- (2) components.css 도 W7+TSX wave 에서만 추가 — 이전 sketch wave 산출과 cross-check
- (3) App.tsx 0 byte — Suspense 매핑 변경 0
- (4) WorkLogPortraitPreview 내부 캘리브 33 step 변경 0 (line 833~867)
- (5) WORKLOG_CALIB_KEY = 'calib_worklog' 변경 0 (사용자 calib 데이터 보존)
- (6) FINGER_OFFSET = 60 변경 0
- (7) 이모지 0 (메타 코멘트 포함 — "warning glyph" / "lin-grad" 약어 패턴 사용)
- (8) fontSize 9·10·11 인라인 0 (모두 §7 폰트 매트릭스 따라 격상, WorkLogPortraitPreview 내부 페이지 출력 영역은 예외)
- (9) "lin-grad" 인라인 0 (OQ #1: 저장 버튼 단색 변환)
- (10) status- prefix 0 (`bg-status-fire-bar` 형태 entity escape)
- (11) `w-8 h-8` 0 (28~32px 컨테이너에 사용 시 48px 사고)
- (12) wrangler 0 (이 워크트리 룰 — CLAUDE.local.md deny)
- (13) npm run deploy 0 (직원 도메인 가는 경로)
- (14) `monthPickerRef.current?.showPicker?.()` 변경 0 (iOS Safari fallback 보존)
- (15) `isAdmin && setX()` 가드 18+ 위치 변경 0
- (16) gasResult / etcResult 3-state 토글 (`'' | 'ok' | 'bad'`) 변경 0
- (17) 카피 verbatim 18+ 종 변경 0 (feedback_sketch_realistic_data)

---

## §12 verify gate (12 자동 명령 + 기대값, TSX 변환 wave SW4 시점에 실행)

1. 12 섹션 헤더 존재 — `grep -cE '^## §[1-9] |^## §1[0-2] ' wave-7-tsx-conversion-checklist.md` = 12
2. 비즈 anchor 박스 ≥18 — `grep -cE '^\| [0-9]+\.' wave-7-*.md` ≥ 18
3. OQ LOCKED 6 건 — `grep -cE '^- \*\*OQ #[1-6]' wave-7-*.md` = 6
4. 5 sketch HTML class fence ≥5 — `grep -c '^\`\`\`' wave-7-*.md` ≥ 10 (5 fence open + 5 fence close)
5. Tailwind cheatsheet 박제 — `grep -c 'status- prefix 0' wave-7-*.md` ≥ 1 + `grep -c 'w-8 h-8' wave-7-*.md` ≥ 1
6. negative gate ≥17 — `grep -cE '^- \([0-9]+\)' wave-7-*.md` ≥ 17
7. verify gate ≥12 — `grep -cE '^[0-9]+\.' wave-7-*.md` ≥ 12
8. 메모리 룰 unique slug ≥12 — `grep -oE '(feedback|project|reference)_[a-z_]+' wave-7-*.md | sort -u | wc -l` ≥ 12
9. TSX line range 인용 ≥10 — `grep -cE 'line [0-9]+~[0-9]+|line [0-9]+,' wave-7-*.md` ≥ 10
10. src/** 변경 0 검증 — `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/ | wc -l` = 0 (TSX 변환 wave 진입 전)
11. App.tsx 변경 0 검증 — `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/App.tsx | wc -l` = 0
12. tsc / build 영향 0 — W7 wave 자체는 markdown 추가만이므로 build PASS 자동

**SW4 verify gate (TSX 변환 wave 종료 시점, 별도 — 본 §12 와 구분)**:
1. `grep -nE "fontSize:\s*1[01]|fontSize:\s*9[^0-9]" cha-bio-safety/src/pages/WorkLogPage.tsx` = WorkLogPortraitPreview 내부 (line 1013~1208) 만 매치 (페이지 출력 영역 예외)
2. `grep -c "linear-gradient" cha-bio-safety/src/pages/WorkLogPage.tsx` = 0 (OQ #1 solid)
3. `grep -c "WORKLOG_CALIB_KEY = 'calib_worklog'" cha-bio-safety/src/pages/WorkLogPage.tsx` = 1
4. `grep -c "FINGER_OFFSET = 60" cha-bio-safety/src/pages/WorkLogPage.tsx` = 1
5. `grep -c "WORKLOG_CALIB_STEPS" cha-bio-safety/src/pages/WorkLogPage.tsx` ≥ 2
6. `grep -c "monthPickerRef.current?.showPicker" cha-bio-safety/src/pages/WorkLogPage.tsx` = 1
7. `grep -c "isAdmin" cha-bio-safety/src/pages/WorkLogPage.tsx` ≥ 18
8. `grep -c "bg-status-" cha-bio-safety/src/pages/WorkLogPage.tsx` = 0 (status- prefix 금지)
9. `grep -c "w-8 h-8" cha-bio-safety/src/pages/WorkLogPage.tsx` = 0
10. `npm run build` PASS (tsc + vite)

---

## 메모리 룰 inline (unique slug 12, wave-1-index.md §5 + mbr SUMMARY 박제)

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

---

## 작성 후 atomic commit

```bash
git add cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md
git commit -m "docs(redesign/18-worklog): W7 TSX 변환 verify checklist (12 섹션 / 비즈 anchor 18 / OQ 6 / negative 17 / verify 12)"
```

W7 markdown 자체 verify (executor 가 작성 직후 실행):

```bash
grep -cE '^## §[1-9] |^## §1[0-2] ' cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md  # = 12
grep -cE '^- \*\*OQ #[1-6]' cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md  # = 6
grep -c '^```' cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md  # >= 10
grep -oE '(feedback|project|reference)_[a-z_]+' cha-bio-safety/docs/redesign-context/18-worklog/wave-7-tsx-conversion-checklist.md | sort -u | wc -l  # >= 12
```

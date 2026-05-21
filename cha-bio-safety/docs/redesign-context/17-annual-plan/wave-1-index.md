---
title: "redesign/17-annual-plan — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-21
quick_id: 260521-wmq
branch: redesign/17-annual-plan
source_tsx: cha-bio-safety/src/pages/AnnualPlanPage.tsx
source_tsx_lines: 225
source_util: cha-bio-safety/src/utils/generateAnnualPlan.ts
design_system: cha-bio-safety/docs/redesign-context/17-annual-plan/design-system.md (v0.1.1, c8bfa86)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (연간계획 = 점검 시리즈 아님 — 직접 적용 X, 헤더/back button 패턴만 mirror)
mirror_of: cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (260521-sjj) + cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (260521-c6p) — 7 섹션 + 4 sub-wave 구조 mirror
calibration_precedent: cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md (260521-* SW3) — 좌표 보정 시스템 패턴 동일
sub_wave_count: 4 (W2~W5)
memory_rules_inline: 12 (10 기본 + pdflib_subset_false + 15-daily-report 캘리브 좌표 시스템 precedent)
open_questions: 5
---

# redesign/17-annual-plan — sketch wave 1 (index)

본 문서는 W2~W5 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:

- AnnualPlanPage.tsx (225 라인) 의 element 인벤토리 → 4 sub-wave 분배 + **캘리브 좌표 시스템** 보존 시그니처
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6 / §7 의 verbatim 룰 박제 (§6/§7 은 미적용 1줄 메타 동반, §7.1 Lucide 룰은 적용)
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 17-annual-plan 적용 여부 (연간계획 = 점검 시리즈 아님 — 헤더 패턴만 mirror, BottomNav/AppHeader 실측 박제)
- 메모리 룰 12건 (`feedback_*.md` 10 + `feedback_pdflib_subset_false` 1 + `project_redesign_15_daily_report_status` 1) inline 인용 — AnnualPlanPage 특화 룰 2건 (폰트 패밀리 보존 일반화 + 캘리브 좌표 시스템 precedent) 포함
- §6 negative rule (이 wave 에서 금지된 것)
- §7 open questions 5건 — W2 진입 직전 사용자 컨펌 (다운로드 그라데이션 / 위치조정 토글 색 / 폰트 격상 / Lucide 아이콘 / 캘리브 안내 칩 색)

작성일: 2026-05-21 / Quick ID: 260521-wmq / Branch: redesign/17-annual-plan

> 27-login W1 (260521-c6p) + 16-workshift W1 (260521-sjj) 의 7 섹션 + 4 sub-wave 구조를 정확히 mirror. AnnualPlanPage 가 225 lines 단순 페이지 + **캘리브 좌표 시스템** (15-daily-report SW3 portraitPos precedent 와 유사) 이라 4 sub-wave (W2~W5) 채택. 캘리브 좌표 시스템은 W3 단독 wave (옵션 C). 13-schedule + 14-reports + 27-login + 16-workshift 모두 평면(flat sibling) 패턴 — `17-annual-plan/sketch-wave-N-{slug}.html` 직접 배치, `sketch/` 서브폴더 없음. 본 인덱스도 `17-annual-plan/wave-1-index.md` (flat) 으로 위치한다.

---

# §1. AnnualPlanPage.tsx 인벤토리

본 인벤토리는 AnnualPlanPage.tsx (225 lines, 17-annual-plan.md 메타 + 섹션 3 "225 라인" 명시 일치 — drift 없음) 의 element 를 (1) 공통 hook/state/handler + 상수 / (2) 공통 previewImage element / (3) 데스크톱 분기 / (4) 모바일 분기 4 영역으로 나눠 정리한다. line 범위는 **실측 결과** (PLAN 추정치는 참고만, 본 인덱스는 실제 파일 grep 결과 사용).

**AnnualPlanPage 의 구조 특이성** (인벤토리 머리말):

- 모바일/데스크톱 분기 via `useIsDesktop()` (≥768px, line 5/16)
- `previewImage` 가 공통 inner element (line 61~103) — 모바일/데스크톱 둘 다 wrapping 만 다르고 내용은 동일 (LoginPage 의 `inner` 패턴과 유사)
- **캘리브 좌표 시스템** (line 7~8 상수 + line 35~59 handlers + line 78~89 오버레이) — yearPos `{x, y} | null` % 좌표를 localStorage(`annual_plan_year_pos`) 영구 저장. handleImageClick (마우스) / handleImageTouch (터치, FINGER_OFFSET=60px 보정) 두 흐름. 15-daily-report SW3 의 portraitPos 패턴과 유사 → memory `project_redesign_15_daily_report_status` 의 좌표 시스템 보존 룰 동일 적용.
- nextYear = `new Date().getFullYear() + 1` (line 21) — 다음 해 자동 계산
- 데스크톱은 **글로벌 AppHeader** 사용 (App.tsx line 109 코멘트 "페이지 제목은 App.tsx 헤더에서 표시") — `/annual-plan` 가 `DESKTOP_HEADER_HIDE_PATHS` **미등재** + `PAGE_TITLES` 등재 ('연간 업무 추진 계획')
- 모바일은 자체 헤더 렌더 (line 169~192) — back button + 타이틀 + 위치조정 토글
- preview 자산: `/templates/preview/annual-plan.png` (외부 PNG, public/templates 폴더)
- 연도 오버레이 폰트: `Malgun Gothic, 맑은 고딕, sans-serif` — 엑셀 표지 시각 일치 (memory 박제 룰, §5 룰 11 참조)
- 별도 컴포넌트 import 없음 (Lucide 미사용 — back button + 다운로드 아이콘 모두 인라인 SVG)

## §1.1 영역별 인벤토리 표

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. 공통 hook + state + handler + 상수 | imports (useState/useRef / useNavigate / toast / generateAnnualPlan / useIsDesktop) | 1~5 | 정적 import | `generateAnnualPlan` direct (dynamic import 아님) | 무관 (보존만) |
| 1. 공통 hook + state + handler + 상수 | 상수 `STORAGE_KEY = 'annual_plan_year_pos'` + `FINGER_OFFSET = 60` | 7~8 | localStorage key + 터치 y 보정 px | 캘리브 좌표 시스템 source-of-truth | 무관 (보존만) |
| 1. 공통 hook + state + handler + 상수 | `loadPos()` helper (try/catch JSON.parse fallback null) | 10~12 | localStorage 초기 로드 | useState initial value 로 사용 (line 19) | 무관 (보존만) |
| 1. 공통 hook + state + handler + 상수 | navigate / isDesktop / loading / calibMode / yearPos / imgRef / nextYear | 14~21 | 분기 + state 4 + ref 1 + 다음해 자동 계산 | `navigate(-1)`, isDesktop ≥768px, setLoading / setCalibMode / setYearPos | 무관 (보존만) |
| 1. 공통 hook + state + handler + 상수 | `handleDownload()` async | 23~33 | 엑셀 다운로드 → toast | `generateAnnualPlan()` await / toast.success "엑셀이 다운로드됐습니다" / toast.error "생성 중 오류" / setLoading 분기 | 무관 (보존만) |
| 1. 공통 hook + state + handler + 상수 | `handleImageClick(e)` (마우스) | 35~45 | 클릭 좌표 → % 변환 → localStorage 저장 | calibMode 가드 / getBoundingClientRect / setYearPos / localStorage.setItem / setCalibMode(false) / toast | 무관 (보존만) |
| 1. 공통 hook + state + handler + 상수 | `handleImageTouch(e)` (터치) | 47~59 | 터치 좌표 → FINGER_OFFSET 60px y 보정 → % 변환 → 저장 | preventDefault / touch.clientY - 60 / 동일 흐름 | 무관 (보존만) |
| 2. 공통 previewImage element | 외곽 div (position:relative width:100% height:100%) | 62 | 미리보기 외곽 wrapper | 정적 | W3 |
| 2. 공통 previewImage element | `<img>` element (ref imgRef, src `/templates/preview/annual-plan.png`, alt verbatim, onClick/onTouchStart) | 63~76 | preview 이미지 + 캘리브 트리거 | imgRef / handleImageClick / handleImageTouch / **분기** border `calibMode ? '2px solid var(--acl)' : '1px solid var(--bd)'` + cursor `calibMode ? 'crosshair' : 'default'` / objectFit contain / borderRadius 8 / background #fff | W3 |
| 2. 공통 previewImage element | 연도 오버레이 (yearPos 가 있을 때만) | 78~89 | 다음해 숫자 절대 위치 표시 | top `${yearPos.y}%` left `${yearPos.x}%` transform `translate(-50%,-50%)` / fontSize `'min(1.4vw, 16px)'` fontWeight 700 color `#000` fontFamily `'Malgun Gothic, 맑은 고딕, sans-serif'` pointerEvents none → `{nextYear}` | W3 |
| 2. 공통 previewImage element | 캘리브레이션 안내 칩 (calibMode 가 true 일 때만) | 91~101 | 캘리브 모드 진입 시 사용자 안내 | top:8 left:50% translateX(-50%) / background `rgba(59,130,246,0.9)` color `#fff` padding `6px 16px` borderRadius 8 fontSize 12 fontWeight 700 whiteSpace nowrap pointerEvents none → '연도가 들어갈 위치를 클릭하세요' verbatim | W3 |
| 3. 데스크톱 분기 | 외곽 (width 100% height 100% flex column overflow hidden) | 108 | 데스크톱 페이지 wrapper | useIsDesktop true 분기 | W2 (wrapper) |
| 3. 데스크톱 분기 | **상단 바** wrapper (flexShrink 0 padding `14px 28px` flex align center gap 12 borderBottom `1px solid var(--bd)`) | 110~146 | 자체 상단 바 — 페이지 제목은 글로벌 AppHeader 가 표시 (line 109 코멘트) | 정적 wrapper | W2 |
| 3. 데스크톱 분기 | 설명 div (flex 1 fontSize 12 var(--t3) — '대상 연도 {nextYear}년 — 표지 및 일정표 연도가 자동 설정됩니다.' / `<strong>` var(--t1) fontWeight 700) | 115~117 | 대상 연도 설명 | nextYear 인용 | W4 (설명 묶음) |
| 3. 데스크톱 분기 | 위치조정 토글 button (padding `8px 14px` radius 8 / **분기** border `calibMode ? '1px solid var(--acl)' : '1px solid var(--bd2)'` + background `calibMode ? 'rgba(59,130,246,0.1)' : 'var(--bg3)'` + color `calibMode ? 'var(--acl)' : 'var(--t2)'` / fontSize 12 fontWeight 700) | 118~129 | 캘리브 모드 토글 | `setCalibMode(m => !m)` / 카피 분기 '취소' / '위치 조정' | W2 |
| 3. 데스크톱 분기 | 다운로드 button (padding `8px 20px` radius 8 borderNone / **분기** background `loading ? 'var(--bg3)' : 'linear-gradient(135deg,#1e40af,#3b82f6)'` color `loading ? 'var(--t3)' : '#fff'` / fontSize 13 fontWeight 700 / 내부 svg 15×15 다운로드 아이콘 + 텍스트 분기 '엑셀 다운로드' / '생성 중...') | 130~145 | CTA — 엑셀 다운로드 | `handleDownload` onClick / disabled loading | W4 |
| 3. 데스크톱 분기 | **하단 미리보기** (flex 1 minHeight 0 overflow hidden flex center padding 24 background var(--bg)) | 149~161 | preview 렌더 영역 (A4 비율 wrapper) | 내부 wrapper `maxWidth: 'calc((100vh - 140px) * 1.414)'` (A4 1:1.414) maxHeight 100% → `{previewImage}` 렌더 | W3 (preview 자체) |
| 4. 모바일 분기 | 외곽 (width 100% height 100% flex column overflow hidden background var(--bg)) | 168 | 모바일 페이지 wrapper | useIsDesktop false 분기 | W2 (wrapper) |
| 4. 모바일 분기 | **헤더** wrapper (flexShrink 0 background var(--bg2) borderBottom `1px solid var(--bd)` padding `8px 12px 9px` flex align center gap 8) | 169~192 | 자체 헤더 (BottomNav 숨김 보완) | 정적 wrapper | W2 |
| 4. 모바일 분기 | back button (34×34 radius 8 flexShrink 0 background var(--bg3) border `1px solid var(--bd)` cursor pointer flex center / 내부 svg 15×15 ChevronLeft `M15 19l-7-7 7-7` stroke var(--t2)) | 170~178 | 뒤로가기 | `navigate(-1)` onClick | W2 |
| 4. 모바일 분기 | 타이틀 span (flex 1 fontSize 14 fontWeight 700 color var(--t1)) — '연간 업무 추진 계획' verbatim | 179 | 페이지 식별 | 정적 카피 | W2 |
| 4. 모바일 분기 | 위치조정 토글 button (padding `6px 10px` radius 8 / **분기** border / background / color 데스크톱과 동일 토큰 / fontSize **11** fontWeight 700) | 180~191 | 캘리브 모드 토글 (모바일) | `setCalibMode(m => !m)` / 카피 '취소' / '위치 조정' | W2 |
| 4. 모바일 분기 | **본문** (flex 1 overflow auto padding 16 flex column gap 16) | 194~222 | 스크롤 본문 | 정적 wrapper | W3 (preview wrapper) + W4 (다운로드 묶음) |
| 4. 모바일 분기 | 미리보기 wrapper (width 100%) → `{previewImage}` | 195~198 | preview 마운트 (모바일) | preview 영역 비율 = img objectFit:'contain' 자체 처리 | W3 |
| 4. 모바일 분기 | 설명 + 다운로드 wrapper (textAlign center) | 200~221 | 다운로드 묶음 | 정적 wrapper | W4 |
| 4. 모바일 분기 | 설명 div (fontSize 13 color var(--t3) marginBottom 12) — '표지 및 일정표 연도가 {nextYear}년으로 자동 설정됩니다.' | 202~204 | 모바일 설명 | nextYear 인용 | W4 |
| 4. 모바일 분기 | 다운로드 button (width 100% padding 14 radius 10 borderNone / 분기 background / color / fontSize **14** fontWeight 700 / 내부 svg 16×16 다운로드 + 텍스트 분기) | 205~220 | CTA — 엑셀 다운로드 (모바일 full-width) | `handleDownload` onClick / disabled loading | W4 |

## §1.2 line 수 실측 확인

`wc -l cha-bio-safety/src/pages/AnnualPlanPage.tsx` 실측 = **225 라인** (PLAN 추정치 + 17-annual-plan.md 메타 일치, drift 없음).

LoginPage (220 lines) / WorkShiftPage (226 lines) 와 거의 동일 단순도. ReportsPage (405 lines) 대비 약 56% 짧음 — sub-wave 6 → 4 축소가 타당. `generateAnnualPlan.ts` 는 48 lines (별도 utility — 비즈 로직 보존 대상, 수정 0).

## §1.3 캘리브 좌표 시스템 보존 시그니처 (별도 박스)

W5 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (15-daily-report SW3 portraitPos 보존 룰 동일 적용, memory `project_redesign_15_daily_report_status`):

```
- STORAGE_KEY = 'annual_plan_year_pos'      (localStorage key — 변경 시 기존 사용자 좌표 손실)
- FINGER_OFFSET = 60                         (TouchEvent y 보정 px — 손가락 가리는 영역 보정값)
- yearPos: { x: number, y: number } | null  (% 좌표, 100 기준 — 분모 변경 금지)
- handleImageClick: e.currentTarget.getBoundingClientRect() → ((e.clientX - rect.left) / rect.width) * 100 → localStorage.setItem → setCalibMode(false)
- handleImageTouch: touch.clientY - FINGER_OFFSET 보정 → ((... - rect.top) / rect.height) * 100 → 동일 흐름
- 오버레이 inline style: top:`${yearPos.y}%`, left:`${yearPos.x}%`, transform:'translate(-50%,-50%)', fontSize:'min(1.4vw, 16px)', fontFamily:'Malgun Gothic, 맑은 고딕, sans-serif'
- preview 자산: '/templates/preview/annual-plan.png'   (public/templates 폴더 — 경로 변경 시 404)
- nextYear: new Date().getFullYear() + 1               (다음 해 자동)
- generateAnnualPlan(): Promise<Blob | void>  direct import (dynamic import 아님)
```

위 모든 식별자/값은 §6 negative rule + §5 룰 12 + §7 OQ #5 default 답에서 재확인.

## §1.4 비즈 로직 시그니처 (W5 TSX 보존 anchor)

```
from '../utils/generateAnnualPlan':
  - generateAnnualPlan(returnBlob?: boolean): Promise<Blob | void>   // direct import

from '../hooks/useIsDesktop':
  - useIsDesktop(): boolean   // ≥768px

from 'react-router-dom':
  - useNavigate() → navigate(-1)

페이지 로컬 상수:
  - STORAGE_KEY = 'annual_plan_year_pos'
  - FINGER_OFFSET = 60

페이지 로컬 함수:
  - loadPos(): { x: number; y: number } | null    // try/catch JSON.parse fallback null
  - handleDownload(): Promise<void>               // generateAnnualPlan() + toast
  - handleImageClick(e: React.MouseEvent<HTMLImageElement>): void
  - handleImageTouch(e: React.TouchEvent<HTMLImageElement>): void
```

---

# §2. 4 sub-wave 분배 plan

옵션 C 채택 — 캘리브 좌표 시스템이 페이지 핵심 동작이고 시각 디자인 영향이 크므로 W3 단독 wave 로 분리. label 이 바뀌더라도 4-wave 개수와 `sketch-wave-N-{slug}.html` (W2~W4) + `wave-5-tsx-conversion-checklist.md` (W5) 평면 패턴은 유지.

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 헤더 + 데스크톱 상단 바 (chrome 통일 검토 — 글로벌 AppHeader 데스크톱 표시 vs 자체 상단 바) | 영역 4 상단 (모바일 헤더 line 169~192 — back button + 타이틀 + 위치조정 토글) + 영역 3 상단 (데스크톱 상단 바 line 110~146 — 설명 + 위치조정 + 다운로드 버튼 자리, 단 다운로드 버튼 자체는 W4 에서 sketch). 모바일/데스크톱 분기 표시 가독 (split panel or annotated). | sketch-wave-2-chrome.html |
| W3 | previewImage + 캘리브 좌표 시스템 (yearPos overlay + 캘리브 모드 분기 + 캘리브 안내 칩) | 영역 2 단독 — img element (line 63~76, 분기 border/cursor) + 연도 오버레이 (line 78~89, Malgun Gothic + min(1.4vw,16px)) + 캘리브 안내 칩 (line 91~101, rgba(59,130,246,0.9) + 카피 verbatim). 평시 / 캘리브 모드 / yearPos null / yearPos 저장후 4가지 상태 매트릭스. | sketch-wave-3-preview-calibration.html |
| W4 | 다운로드 버튼 + 설명 (모바일/데스크톱 두 분기 모두) | 영역 3 다운로드 버튼 (line 130~145, 그라데이션 + 아이콘 + 텍스트) + 영역 4 본문 설명/다운로드 (line 200~221, 모바일 full-width padding 14 radius 10). loading 분기 / disabled 분기. | sketch-wave-4-download.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + AnnualPlanPage.tsx 비즈 로직 보존 룰 + 캘리브 좌표 시스템 1 byte 변경 금지 checklist + Tailwind cheatsheet | wave-5-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트

### W2 — 모바일 헤더 + 데스크톱 상단 바

- **보존**: `navigate(-1)` (line 170) / `setCalibMode(m => !m)` 토글 (line 119, 181) / calibMode 분기 verbatim (`'1px solid var(--acl)'` + `'rgba(59,130,246,0.1)'` + `var(--acl)` ↔ `'1px solid var(--bd2)'` + `'var(--bg3)'` + `var(--t2)`, line 122~124 / 184~186) / 모바일 헤더 타이틀 카피 '연간 업무 추진 계획' verbatim (line 179) / 토글 카피 분기 '취소' / '위치 조정' verbatim (line 128, 190) / 데스크톱 설명 카피 verbatim (line 116 — '대상 연도 {nextYear}년 — 표지 및 일정표 연도가 자동 설정됩니다.' + `<strong>{nextYear}년</strong>`) / `useIsDesktop()` 분기 verbatim (line 16, 106) / **back button 모바일 전용** 표시 (데스크톱은 글로벌 AppHeader 처리)
- **토큰**: 모바일 헤더 wrapper = `bg-surface-raised border-b border-border-default` (`var(--bg2)` → `--surface-raised`, 마이그레이션 §4.1) — chrome 룰 §2.1 의 `bg-surface-page` 적용 여부는 §4 default raised 유지 / back button = `w-[34px] h-[34px] rounded-sm bg-surface-sunken border border-border-default` (memory `feedback_tailwind_w8_h8_is_48px` w-8=48 함정 — 34 는 인라인 안전, 또는 `w-9 h-9` 44px 터치 마지노선) + Lucide `ChevronLeft size={15}` (OQ #4 default 교체 OK) / 위치조정 토글 active = `border-accent bg-accent/10 text-accent` (`var(--acl)` → `--accent`, 토큰 치환 OQ #2 default OK, **status- prefix 없음 (memory `feedback_tailwind_token_class_pattern`)**) / 위치조정 토글 평시 = `bg-surface-sunken border border-border-strong text-text-secondary` (`var(--bg3)` → `--surface-sunken`, `var(--bd2)` → `--border-strong`) / 데스크톱 상단 바 wrapper = `border-b border-border-default` (글로벌 AppHeader 와 자체 상단 바 사이 구분선) — 데스크톱 = 글로벌 AppHeader + 자체 상단 바 **둘 다 표시** (§4 실측 결과 박제)
- **폰트**: 모바일 헤더 타이틀 14px (line 179) → `text-body-sm font-bold` (14) 또는 `text-body font-bold` (16, §1.3 모바일/데스크톱 동일 폰트 룰 + 데스크톱 글로벌 AppHeader 가 16px 정도 — OQ #3 default `text-body font-bold` 격상) / 위치조정 토글 모바일 11px (line 187) → §1.1 위반 → `text-caption font-bold leading-none` (12 + leading-none, 작은 컨테이너 시각 패딩 방지, memory `feedback_text_caption_leading_none`) / 데스크톱 위치조정 토글 12px (line 125) + 데스크톱 설명 12px (line 115) → `text-caption leading-none` (12 유지, dense layout 절충 — 14-reports W1 footer 절충 패턴 mirror) / back button SVG 15×15 → Lucide `ChevronLeft size={15}` prop 사용 (className 으로 `w-N h-N` 금지)

### W3 — previewImage + 캘리브 좌표 시스템 (★ 캘리브 좌표 시스템 1 byte 변경 금지 wave)

- **보존**: `imgRef` (line 20, 64) / `handleImageClick` (line 35~45) / `handleImageTouch` (line 47~59) / `FINGER_OFFSET = 60` 상수 (line 8) / `STORAGE_KEY = 'annual_plan_year_pos'` 상수 (line 7) / yearPos 좌표 계산식 (`((e.clientX - rect.left) / rect.width) * 100` / `((touch.clientY - FINGER_OFFSET - rect.top) / rect.height) * 100`, line 38~39 / 52~53) / 오버레이 inline style verbatim `fontSize:'min(1.4vw, 16px)' + fontFamily:'Malgun Gothic, 맑은 고딕, sans-serif'` (line 83~84) / preview 자산 경로 `'/templates/preview/annual-plan.png'` (line 65) / 캘리브 안내 칩 카피 '연도가 들어갈 위치를 클릭하세요' verbatim (line 99) / `nextYear` 계산식 `new Date().getFullYear() + 1` (line 21) / img alt '연간 업무 추진 계획 미리보기' verbatim (line 66) / **모두 1 byte 변경 금지** (15-daily-report SW3 portraitPos 보존 precedent, §5 룰 12)
- **토큰**: preview img border calibMode 분기 `'2px solid var(--acl)'` (line 72) → `border-2 border-accent` (마이그레이션 §4.1 `var(--acl)` → `--accent`) + 평시 `'1px solid var(--bd)'` (line 72) → `border border-border-default` (`var(--bd)` → `--border-default`) / borderRadius 8 (line 71) → `rounded-sm` (8, design-system §2.6) / background `'#fff'` (line 73) → 인라인 유지 (preview 가 다크 모드에서도 흰 배경 PNG 일관 — 토큰 `bg-white` 가능하지만 의도 명확) / cursor 분기 `'crosshair' / 'default'` (line 74) → 인라인 또는 `cursor-crosshair` Tailwind — 인라인 유지 권장 (분기 가독성) / **rgba(59,130,246,0.9) 캘리브 안내 칩 background + Malgun Gothic 폰트 + min(1.4vw, 16px) overlay fontSize 는 인라인 유지** (OQ #5 default — 엑셀 표지 일치성 + 캘리브 좌표 시스템 일부, 1 byte 변경 금지 — `rgba(...)` 는 신규 토큰 정의 비용 vs 1줄 인라인 trade-off) / 캘리브 안내 칩 color #fff + fontWeight 700 + whiteSpace nowrap + pointerEvents none 유지 / 오버레이 transform `translate(-50%,-50%)` + pointerEvents none + color #000 유지 — **status- prefix 없음**
- **폰트**: 연도 오버레이 fontSize `'min(1.4vw, 16px)'` (line 83) → **유지** (반응형 — 데스크톱 vw 기반 / 모바일 16px cap, 엑셀 표지 시각 일치성, 캘리브 좌표 시스템 일부 — 변경 금지) / 연도 오버레이 fontFamily `'Malgun Gothic, 맑은 고딕, sans-serif'` (line 84) → **유지** (memory `feedback_pdflib_subset_false` 일반화 — 출력물 시각 anchor 룰) / 캘리브 안내 칩 fontSize 12 (line 96) → `text-caption leading-none font-bold` (12 + leading-none, 작은 칩 안 시각 패딩 방지)

### W4 — 다운로드 버튼 + 설명

- **보존**: `handleDownload` (line 23~33) / `generateAnnualPlan()` direct import (line 4, dynamic import 아님 — WorkShiftPage 의 `await import()` 패턴과 다름) / loading 분기 카피 '엑셀 다운로드' / '생성 중...' verbatim (line 144, 219) / 모바일 설명 카피 '표지 및 일정표 연도가 {nextYear}년으로 자동 설정됩니다.' verbatim (line 203) / 데스크톱 설명 카피 '대상 연도 {nextYear}년 — 표지 및 일정표 연도가 자동 설정됩니다.' verbatim (line 116) / toast.success '엑셀이 다운로드됐습니다' verbatim (line 27) / toast.error fallback '생성 중 오류' verbatim (line 29) / 다운로드 svg path d `'M12 5v14m0 0l-4-4m4 4l4-4M4 19h16'` verbatim (line 142, 217 — 또는 Lucide `Download` 교체, OQ #4 default 교체 OK 단 svg size 15/16 유지)
- **토큰**: 다운로드 버튼 background 분기 `loading ? 'var(--bg3)' : 'linear-gradient(135deg,#1e40af,#3b82f6)'` (line 135, 210) → **`bg-safe-bar` solid 통일** (OQ #1 default OK — 27-login W1 OQ #1 + 14-reports W1 OQ #1/#3 + 16-workshift W1 OQ #1 default OK 일관 + design-system §6.4 CTA 그라데이션 폐기 룰) / loading 시 = `bg-surface-sunken text-text-tertiary` (`var(--bg3)` → `--surface-sunken`, `var(--t3)` → `--text-tertiary`) / 평시 color = `text-text-on-accent` (`#fff`) / 데스크톱 버튼 padding `8px 20px` radius 8 → `rounded-sm py-2 px-5` (8/8/20) / 모바일 버튼 padding 14 radius 10 → `rounded-sm py-[14px]` (또는 `rounded-md` 12 — 마이그레이션 §4.3 radius 10 → 8 또는 12, sketch 단계 결정) / 다운로드 svg path → Lucide `Download size={15}` (데스크톱) / `Download size={16}` (모바일) prop 사용 — className 으로 `w-N h-N` 금지 (memory `feedback_tailwind_token_class_pattern`) — **status- prefix 없음**
- **폰트**: 모바일 설명 13px (line 202) → `text-label leading-relaxed text-text-tertiary` (13) / 데스크톱 설명 12px (line 115) → `text-caption leading-none text-text-tertiary` (12 유지, dense layout) / 데스크톱 다운로드 13px (line 137) → `text-label font-bold leading-none` (13 + leading-none, h:34 작은 컨테이너) / 모바일 다운로드 14px (line 212) → `text-body-sm font-bold` (14) 또는 `text-body font-bold` (16, 노안 친화 강화 — 모바일 full-width CTA 라 가독성 우선) — OQ #3 default 절충

### W5 — TSX 변환 verify checklist (markdown)

- **보존**: AnnualPlanPage.tsx 의 모든 비즈 로직 (useNavigate / useIsDesktop / useState 3종 / useRef 1종 / generateAnnualPlan direct import / handleDownload / handleImageClick / handleImageTouch / loadPos / STORAGE_KEY / FINGER_OFFSET) 100% 보존. **캘리브 좌표 시스템 시그니처 (§1.3 박스) 1 byte 변경 금지** grep gate. import 시그니처 (`from '../utils/generateAnnualPlan'`, `from '../hooks/useIsDesktop'`) 변경 금지. UI markup + 인라인 style 만 재작성.
- **토큰**: W2~W4 sketch 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → checklist 안에 verbatim 인용 (memory `feedback_planner_prompt_sketch_verbatim`). status- prefix 없음 룰 (memory `feedback_tailwind_token_class_pattern`) + `w-8/h-8 = 48px` 함정 룰 (memory `feedback_tailwind_w8_h8_is_48px`) verbatim 박제. 다운로드 버튼 `bg-safe-bar` solid 결정 (OQ #1) / 위치조정 토글 `border-accent bg-accent/10 text-accent` (OQ #2) / 캘리브 안내 칩 rgba 인라인 (OQ #5) 모두 명시.
- **폰트**: design-system.md §2.7 7단계 cheatsheet + 마이그레이션 룰 §4.2 의 9·10·11px 일괄 상향 룰 verbatim 박제. 모바일 위치조정 토글 11 → 12 격상 / 데스크톱 설명·토글 12 유지 / 모바일 헤더 타이틀 14 → 16 격상 / 모바일 다운로드 14 → 16 격상 절충 결정 (OQ #3) 명시. **연도 오버레이 `'min(1.4vw, 16px)'` 유지 + Malgun Gothic 폰트 패밀리 보존** verbatim (memory `feedback_pdflib_subset_false` 일반화).

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

본 인용은 `cha-bio-safety/docs/redesign-context/17-annual-plan/design-system.md` (v0.1.1, c8bfa86) 원문 그대로. 후속 wave 작업자가 design-system.md 를 별도로 열지 않아도 핵심 룰을 본 인덱스에서 직접 확인 가능하도록 박제한다.

## §3.1 design-system §1.1 노안 친화 (verbatim)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

> AnnualPlanPage 현재 fontSize 위반 후보: **11** (모바일 위치조정 토글 line 187). 12 (데스크톱 설명 line 115 / 데스크톱 위치조정 line 125 / 캘리브 안내 칩 line 96) 는 마지노선 부근 dense layout 절충. OQ #3 default 답 참조.

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

> AnnualPlanPage 는 단일 동작 페이지 (preview 보고 다운로드) — §1.2 의 "장식 빼고 빠른 식별" 룰 부합. 다운로드 버튼 그라데이션 → solid 폐기 (§6.4 + OQ #1 default OK) 도 §1.2 의 일관 적용.

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

> AnnualPlanPage 의 모바일/데스크톱 분기 (line 106, 167) 는 chrome 구조 분기 (데스크톱 상하 2분할 / 모바일 헤더+본문 분할) 가 주된 차이. **타이틀 폰트는 양쪽 다름** — 모바일 자체 헤더 14 (line 179) vs 데스크톱 글로벌 AppHeader 가 처리 (line 109 코멘트). §1.3 위반 후보 — OQ #3 default 답에서 모바일 14 → 16 격상 검토 (글로벌 AppHeader 폰트 사이즈와 일치 합리적).

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

> **§6 미적용 — 연간 업무 추진 계획 페이지에는 진척률 도넛/카테고리 카드 없음.** AnnualPlanPage 는 단일 동작 페이지 (preview 보고 다운로드) — Progress Color Rule 적용 대상 element 0개. 단 **§6.4 그라데이션 폐기 룰은 적용** (OQ #1 — 다운로드 버튼 `linear-gradient(135deg,#1e40af,#3b82f6)` → `bg-safe-bar` solid).

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

> **§7 (= "Stat Card" 룰) 미적용 — 연간 업무 추진 계획 페이지에는 통계 숫자 카드 없음.** AnnualPlanPage 는 preview + 토글 + CTA 3 요소뿐 — 28px display 숫자 카드 0개. **W5 변환 wave executor 가 Stat Card §6.3 룰 verbatim 인용 누락으로 deviation 잡으면 안 됨** — 실제로 17-annual-plan 에 적용 대상 element 가 없으므로 (memory `feedback_tsx_wave_stat_card_drift` 룰 따라 본 인덱스에 "미적용" 명시).

## §3.6 design-system §6.4 Backgrounds & Gradients 폐기 룰 (verbatim)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

> AnnualPlanPage 다운로드 버튼 현재 그라데이션 `linear-gradient(135deg,#1e40af,#3b82f6)` (line 135, 210). §6.4 의 "저장/CTA 그라데이션" 후보처럼 보이지만 (#1d4ed8 ↔ #1e40af 비슷하나 종점 색 #3b82f6 ≠ #0ea5e9) — 정확 매치 아님. **27-login W1 OQ #1 + 14-reports W1 OQ #1/#3 + 16-workshift W1 OQ #1 default OK 일관 정책** 따라 그라데이션 폐기 → `bg-safe-bar` solid 통일. 이 결정은 §7 OQ #1 에서 사용자 컨펌 (default OK).

## §3.7 design-system §7.1 Iconography — Lucide (verbatim)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

> **§7.1 — Lucide 사용 가능.** 현재 모바일 헤더 back button 의 커스텀 SVG ChevronLeft (line 175~177, `M15 19l-7-7 7-7`) → Lucide `ChevronLeft size={15}` 교체 후보. 다운로드 버튼 SVG (line 141~143, 216~218, `M12 5v14m0 0l-4-4m4 4l4-4M4 19h16`) → Lucide `Download size={15/16}` 교체 후보. 둘 다 W2/W4 sketch 진입 시 결정 (§7 OQ #4 default 둘 다 교체 OK). 단 캘리브 안내 칩 / 연도 오버레이는 아이콘 없음. Lucide 사이즈 16/20/24 권장 vs 현재 15/16 — 15 는 `size={15}` 인라인 안전 (prop 임의 정수 허용). 본 페이지에 이모지 0건 (현재 잘 지켜짐 — 다운로드 svg 는 SVG path 이지 이모지 아님).

추가 메타:
- 기존 디자인 = 다운로드 버튼 `linear-gradient(135deg,#1e40af,#3b82f6)` (line 135, 210) → `bg-safe-bar` solid 통일 검토 — **default OK**. 근거: 27-login W1 OQ #1 default OK (그라데이션 → solid) + 14-reports W1 OQ #1/#3 default OK + 16-workshift W1 OQ #1 default OK 일관 + design-system §6.4 CTA solid 룰 + memory `feedback_design_sketch_first` + `feedback_tailwind_token_class_pattern`. 이 결정은 §7 OQ #1 에서 사용자 컨펌 받음.

---

# §4. 02+06 chrome 통일 룰 적용 여부

17-annual-plan 페이지는 점검 페이지 시리즈가 아닌 **연간 업무 추진 계획 (엑셀 출력) 페이지** → `inspection-modal-chrome-rules.md` 의 chrome 룰 자체는 **직접 적용 X** (zone/category/floor/line wrapper 없음, 점검 모달 없음, editMode 토글 없음).

단, 다음 3가지 패턴은 mirror 검토:

1. **헤더 배경 토큰** — 모바일 자체 헤더 현재 `var(--bg2)` (= `--surface-raised`, line 169). chrome 룰 §2.1 의 `bg-surface-page` 통일 룰 vs raised 유지. **default: raised 유지** (16-workshift W1 OQ #2 LOCKED b + 02 InspectionPage 일관). 데스크톱은 자체 상단 바 (line 110~146) — borderBottom 1px solid var(--bd) 단독, 글로벌 AppHeader 가 페이지 제목 표시 (line 109 코멘트). §7 OQ 후보 아님.

2. **back button 패턴** — 모바일만 (line 170~178), 34×34 var(--bg3) + 커스텀 SVG ChevronLeft. chrome 룰 §7.2 의 `w-8 h-8 bg-surface-sunken border-border-default` 패턴 + memory `feedback_tailwind_w8_h8_is_48px` 룰 (w-8=48 함정 — tailwind config spacing override) 적용 시 `w-[34px] h-[34px]` 인라인 필수 또는 `w-9 h-9` (44px, 10px 확대 — 모바일 터치 마지노선 §1.1 부합). Lucide `ChevronLeft size={15}` 교체 OQ #4 default OK. 데스크톱은 글로벌 AppHeader 가 처리 (back button 자체 추가 불필요).

3. **BottomNav 숨김 / AppHeader 표시** — `cha-bio-safety/src/App.tsx` 실측 결과:

```
line 71: const MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']
line 74: const DESKTOP_NO_NAV_PATHS = ['/', '/login']                                       // /annual-plan 미등재 → 데스크톱 BottomNav 표시 (사이드바)
line 77: const DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']  // /annual-plan 미등재 → 데스크톱 글로벌 AppHeader 표시
line 99: '/annual-plan': '연간 업무 추진 계획',                                              // PAGE_TITLES 등재
line 292: <Route path="/annual-plan" element={<Auth><AnnualPlanPage /></Auth>} />
```

**핵심 시사점:**
- **모바일**: `/annual-plan` ∈ `MOBILE_NO_NAV_PATHS` → BottomNav **숨김**. 자체 헤더만 (line 169~192). sketch 시 nav placeholder 그릴 필요 없음.
- **데스크톱**: `/annual-plan` ∉ `DESKTOP_NO_NAV_PATHS` → BottomNav **표시** (사이드바). 동시에 `/annual-plan` ∉ `DESKTOP_HEADER_HIDE_PATHS` → 글로벌 AppHeader **표시** (line 109 코멘트 일관, '페이지 제목은 App.tsx 헤더에서 표시'). `PAGE_TITLES` 등재 → 글로벌 AppHeader 가 '연간 업무 추진 계획' 타이틀 렌더. → **데스크톱 = 글로벌 AppHeader + 자체 상단 바 + 사이드바 BottomNav 3 영역 모두 표시.** 16-workshift 와 다른 점 = 16-workshift 는 자체 헤더 단독 (글로벌 AppHeader 숨김), 17-annual-plan 은 글로벌 + 자체 상단 바 둘 다 표시.

본 wave + W2~W5 모두 `App.tsx` 손대지 않음 (§6 negative rule).

---

# §5. 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건. 27-login W1 의 10건 + AnnualPlanPage 특화 2건 (`feedback_pdflib_subset_false` 의 폰트 패밀리 보존 일반화 + `project_redesign_15_daily_report_status` 의 캘리브 좌표 시스템 precedent). 각 룰은 슬러그 + 요약 + Why + How (17-annual-plan 컨텍스트) 4 항목.

### 룰 1 — feedback_design_sketch_first
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- **Why**: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적. 디자인 작업의 핵심 룰.
- **How to apply (17-annual-plan)**: W3 캘리브 안내 칩 크기 (현재 padding `6px 16px` radius 8 fontSize 12 / line 95~96) / W4 다운로드 버튼 크기 (모바일 padding 14 radius 10 / 데스크톱 padding `8px 20px` radius 8 / line 209, 134) 조정도 spacing 손볼 거 있으면 `sketch-wave-3-preview-calibration.html` / `sketch-wave-4-download.html` 먼저 보여주고 사용자 컨펌. "버튼 좀 크게/작게" 인라인 변경 직행 금지.

### 룰 2 — feedback_redesign_sketch_rule_enforcement
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- **Why**: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- **How to apply (17-annual-plan)**: 위치조정 토글 active 색 (`var(--acl)` + `rgba(59,130,246,0.1)`, line 122~124 / 184~186) 은 status 임계치 색이 아니라 **accent** (모드 분기 강조) — `bg-status-safe-bg` 같은 위험 색 사용 금지. 다운로드 버튼은 CTA → `bg-safe-bar` solid (의미: "이 작업 실행" 정상 CTA, OQ #1 default).

### 룰 3 — feedback_sketch_realistic_data
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- **Why**: sketch 작성 시 "연간 업무 추진 계획" 같은 텍스트나 토글 카피 '위치 조정' 등을 임의 변경하면 코드 변경 wave 가 deviation 으로 잡힘.
- **How to apply (17-annual-plan)**: 카피 verbatim — '연간 업무 추진 계획' (모바일 타이틀 line 179), '위치 조정' / '취소' (토글 line 128, 190), '연도가 들어갈 위치를 클릭하세요' (캘리브 안내 칩 line 99), '엑셀 다운로드' / '생성 중...' (다운로드 버튼 line 144, 219), '표지 및 일정표 연도가 {nextYear}년으로 자동 설정됩니다.' (모바일 설명 line 203), '대상 연도 {nextYear}년 — 표지 및 일정표 연도가 자동 설정됩니다.' (데스크톱 설명 line 116), '엑셀이 다운로드됐습니다' (toast line 27), '생성 중 오류' (toast line 29), '연도 위치 저장됨' (toast line 44, 58), '연간 업무 추진 계획 미리보기' (img alt line 66). 시안에서 변경 금지.

### 룰 4 — feedback_planner_prompt_sketch_verbatim
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
- **Why**: planner 가 sketch 의 토큰명 (예: `bg-surface-raised`) 을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용.
- **How to apply (17-annual-plan)**: W5 TSX 변환 wave 진입 직전 `sketch-wave-2~4.html` 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → `wave-5-tsx-conversion-checklist.md` 안에 verbatim 인용. 특히 캘리브 안내 칩 `background:rgba(59,130,246,0.9)` (line 94), 연도 오버레이 `fontSize:'min(1.4vw, 16px)'` (line 83), A4 비율 `maxWidth:'calc((100vh - 140px) * 1.414)'` (line 156), 다운로드 그라데이션 `linear-gradient(135deg,#1e40af,#3b82f6)` (line 135, 210) 같은 인라인 값은 추측 X — sketch 결과 verbatim 인용.

### 룰 5 — feedback_tailwind_token_class_pattern
- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지).
- **Why**: 11-div TSX v3 hotfix(4ce707e) 사고 — `status-` prefix 가 tailwind.config 에 없어서 class 안 먹음. `bg-safe-bar` 가 올바른 패턴.
- **How to apply (17-annual-plan)**: 다운로드 버튼 그라데이션 → `bg-safe-bar` solid 치환 (OQ #1). `bg-status-safe-bar` (status- prefix) 사용 시 W5 verify FAIL. 위치조정 토글 active → `border-accent bg-accent/10 text-accent` (`status-accent` X). preview border calibMode → `border-2 border-accent` (`var(--acl)` 매핑). Lucide `ChevronLeft size={15}` + `Download size={15/16}` (OQ #4) prop 사용 — className 으로 `w-4 h-4` 금지.

### 룰 6 — feedback_tailwind_w8_h8_is_48px
- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- **How to apply (17-annual-plan)**: 모바일 back button 34×34 (line 171) → `w-8 h-8` 사용 시 **48×48 (1.4배 확대 사고)** — `w-[34px] h-[34px]` 인라인 필수 또는 `w-9 h-9` (44px, 모바일 터치 마지노선 §1.1 부합). 위치조정 토글 padding `6px 10px` / `8px 14px` 도 height 자동 계산 ≈ 30~34px 인지. 다운로드 버튼 모바일 padding 14 (line 209) → 자동 height ≈ 48px (터치 마지노선 OK) — w-기반 함정과 별개 padding 인라인 안전. 캘리브 안내 칩 padding `6px 16px` (line 95) → 작은 컨테이너 — `w-N` 함정 무관.

### 룰 7 — feedback_text_caption_leading_none
- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 헤더 토글/배지/칩 작은 영역은 `leading-none` 명시.
- **Why**: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- **How to apply (17-annual-plan)**: 모바일 위치조정 토글 11px (line 187, h≈30) → `text-caption font-bold leading-none` (12 + leading-none, 작은 컨테이너 시각 패딩 방지) / 데스크톱 위치조정 12px (line 125, h≈34) + 데스크톱 설명 12px (line 115) → `text-caption leading-none` / 캘리브 안내 칩 12px (line 96, padding `6px 16px` 작은 칩) → `text-caption leading-none font-bold` / 데스크톱 다운로드 13px (line 137, h≈34) → `text-label font-bold leading-none`.

### 룰 8 — feedback_tsx_wave_emoji_dot_gap
- **요약**: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- **Why**: sketch 의 `🎯` `⬇` 같은 이모지/특수문자 글리프가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 도 자동 적용 안 됨.
- **How to apply (17-annual-plan)**: AnnualPlanPage 본문에는 이모지 0건 (현재 잘 지켜짐 — 다운로드 svg 는 path 이지 이모지 아님). W2~W4 sketch 진입 시 이모지/특수문자 절대 도입 금지 (negative gate). 단 W5 진입 시 sketch HTML 에 이모지/dot span 추가/제거 분기 negative gate 유지. 데스크톱 설명의 `—` (em dash, line 116) 는 콘텐츠 글리프로 유지 (이모지 아님).

### 룰 9 — feedback_tsx_wave_stat_card_drift
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- **How to apply (17-annual-plan)**: 연간 업무 추진 계획 페이지에 Stat Card (28px display 숫자) 없음 → §3.5 인용 후 "미적용" 메타 명시. 단, sketch 새 패턴 (예: 캘리브 모드 분기 매트릭스 — 평시/캘리브/yearPos null/저장후 4 state) 은 verbatim 인용해 W5 checklist 박제. source AnnualPlanPage.tsx 의 인라인 hex/var() (예: `'2px solid var(--acl)'` calibMode 분기) 가 sketch 의 새 토큰 패턴 (`border-2 border-accent`) 을 덮어쓰지 않도록 명시 필수.

### 룰 10 — feedback_avoid_premature_confirmation
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- **How to apply (17-annual-plan)**: 본 인덱스 작성 완료 후 "§7 OQ 5건 컨펌 부탁" 보고만. "wave 1 완벽 / W2 진입 가능" 같은 자신감 표현 금지. W2~W5 진입 시점도 사용자 컨펌 명시 받은 후에만. sketch 산출 후 "거의 일치 / 잘 됐다" 표현 금지. 특히 캘리브 좌표 시스템 시각 결과 (yearPos 저장 후 오버레이 위치) 는 사용자 판단 영역.

### 룰 11 — feedback_pdflib_subset_false (★ AnnualPlanPage 특화 — 폰트 패밀리 보존 일반화)
- **요약**: pdf-lib `embedFont subset:true` 면 일부 글자 누락. 폰트 통째 임베딩 (~4MB) 감수.
- **Why**: 한글 일부 글자 (특히 한자/특수 자모) 누락 사고 — subset 최적화가 출력물 손상.
- **How to apply (17-annual-plan)**: AnnualPlanPage 가 `generateAnnualPlan` (xlsx-js-style 사용) 호출 — pdf-lib 무관. **하지만 폰트 임베딩 일반 룰 인용**: 연도 오버레이 `fontFamily: 'Malgun Gothic, 맑은 고딕, sans-serif'` (line 84) 는 **엑셀 표지 글꼴과 시각 일치**를 위한 의도된 폰트 — `var(--font-sans)` 같은 디자인 시스템 폰트로 교체 금지. 폰트 패밀리 = 출력물 시각 anchor 룰 (pdf-lib subset 룰의 일반화). xlsx-js-style 의 엑셀 표지가 Malgun Gothic 으로 렌더링되므로 preview 오버레이도 동일 폰트로 통일해 사용자가 "엑셀 표지 = preview 오버레이" 일관 인지.

### 룰 12 — project_redesign_15_daily_report_status (★ AnnualPlanPage 특화 — 캘리브 좌표 시스템 precedent)
- **요약**: redesign/15-daily-report W1~W7 sketch + SW1~SW4 TSX 변환 완결 (319aef8). **캘리브 좌표 시스템 100% 보존 패턴** 박제.
- **Why**: 15-daily-report 의 portraitPos (인물사진 좌표 보정) 가 AnnualPlanPage 의 yearPos (연도 위치 보정) 와 동일 패턴 — localStorage 영구 저장 + 클릭/터치 좌표 → % 변환 + FINGER_OFFSET 터치 보정 + crosshair cursor 분기 + 안내 칩. SW3 변환 시 좌표 시스템 시그니처/식별자/값 1 byte 변경 X 룰 적용해 무손실 변환 성공.
- **How to apply (17-annual-plan)**: AnnualPlanPage 의 yearPos (캘리브 좌표 시스템) 보존 1 byte 룰. **STORAGE_KEY = 'annual_plan_year_pos'** (line 7) / **FINGER_OFFSET = 60** (line 8) / **handleImageClick** (line 35~45, getBoundingClientRect → %) / **handleImageTouch** (line 47~59, FINGER_OFFSET 60px 보정) / 오버레이 좌표 계산식 `top:${y}% left:${x}% transform:translate(-50%,-50%)` (line 81~82) / preview 자산 경로 `'/templates/preview/annual-plan.png'` (line 65) / `nextYear = new Date().getFullYear() + 1` (line 21) 모두 변경 금지. 15-daily-report SW3 의 portraitPos 보존 룰 (precedent) 동일 적용. §1.3 별도 박스 + §6 negative rule + §7 OQ #5 default 답에서 재확인.

---

# §6. negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **AnnualPlanPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/AnnualPlanPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src/pages/AnnualPlanPage.tsx` 결과 0 줄.
- **generateAnnualPlan.ts 코드 수정 금지** — `cha-bio-safety/src/utils/generateAnnualPlan.ts` 도 분석 대상이지 수정 대상이 아님. 비즈 로직 (xlsx-js-style 엑셀 생성 + 표지/일정표 연도 셀 패치) 보존.
- **비즈 로직 시그니처 변경 금지** — `generateAnnualPlan(returnBlob?: boolean): Promise<Blob | void>` direct import, `useIsDesktop()`, `useNavigate()`, `handleDownload`, `handleImageClick`, `handleImageTouch`, `loadPos` 모두 import/export 동일하게 유지. 본 wave + W2~W5 모두.
- **다른 페이지 (13-schedule / 14-reports / 27-login / 16-workshift / 15-daily-report / 02 / 06 등) 영향 금지** — `git status` 에 17-annual-plan/ 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler` (디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler`. `npm run deploy` 는 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 배포만.
- **13-schedule + 14-reports + 27-login + 16-workshift 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지** — 13-schedule + 14-reports + 27-login + 16-workshift 모두 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 17-annual-plan 도 동일 평면 배치 (`17-annual-plan/sketch-wave-N-{slug}.html`).
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` (line 71, `/annual-plan` 등재) + `DESKTOP_NO_NAV_PATHS` (line 74, `/annual-plan` 미등재) + `DESKTOP_HEADER_HIDE_PATHS` (line 77, `/annual-plan` 미등재 — 데스크톱 글로벌 AppHeader 표시) + `PAGE_TITLES` (line 99, `/annual-plan: '연간 업무 추진 계획'` 등재) + `Route` (line 292) 모두 실측 확인됨. 본 wave + W2~W5 모두 `App.tsx` 손대지 않음.
- **★ 캘리브 좌표 시스템 시그니처 변경 금지** — `FINGER_OFFSET = 60` (line 8) / `STORAGE_KEY = 'annual_plan_year_pos'` (line 7) / `handleImageClick` 좌표 계산식 (line 38~39) / `handleImageTouch` FINGER_OFFSET 보정 식 (line 52~53) / yearPos overlay 좌표 표현식 `top:${y}% left:${x}% transform:translate(-50%,-50%)` (line 81~82) 모두 1 byte 변경 금지 (memory `project_redesign_15_daily_report_status` 룰 적용).
- **preview PNG 자산 경로 변경 금지** — `'/templates/preview/annual-plan.png'` (line 65) 는 public/templates 폴더 의 실 파일 경로. 변경 시 404.
- **연도 오버레이 Malgun Gothic 폰트 패밀리 보존** — `'Malgun Gothic, 맑은 고딕, sans-serif'` (line 84) 는 엑셀 표지 시각 일치성 anchor (memory `feedback_pdflib_subset_false` 일반화 룰). `var(--font-sans)` 같은 시스템 폰트로 교체 금지.

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 5건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call). 단, "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

- **OQ #1**: 다운로드 버튼 `linear-gradient(135deg,#1e40af,#3b82f6)` (line 135 / line 210) → `bg-safe-bar` solid 통일 OK?
  - **default 답: OK** — 27-login W1 OQ #1 + 14-reports W1 OQ #1/#3 + 16-workshift W1 OQ #1 default OK 일관 + design-system §6.4 CTA solid 룰 (그라데이션 종점 #3b82f6 이 §6.4 의 "유일한 그라디언트 2종"의 #0ea5e9 와 다르므로 폐기 후보로 명확). disabled 시 = `bg-surface-sunken text-text-tertiary` (현재 `var(--bg3)` + `var(--t3)` 일관).

- **OQ #2**: 위치조정 토글 active 색 (현재 `border: 1px solid var(--acl)` + `background: rgba(59,130,246,0.1)` + `color: var(--acl)` — line 122~124 / 184~186) → 디자인 토큰화 (`border-accent` + `bg-accent/10` + `text-accent`) vs 인라인 유지?
  - **default 답: 토큰 치환 OK** — `border-accent` + `bg-accent/10` + `text-accent`, **status- prefix 없음 룰** (memory `feedback_tailwind_token_class_pattern`) + 마이그레이션 §4.1 `var(--acl)` → `--accent` 매핑. 16-workshift W1 OQ #5 today border 토큰화 일관. 평시 토큰은 `bg-surface-sunken border-border-strong text-text-secondary` (마이그레이션 §4.1 일관).

- **OQ #3**: 폰트 격상 매핑 — 현재 fontSize:**11** (모바일 위치조정 토글 line 187) / **12** (데스크톱 설명 line 115, 데스크톱 위치조정 line 125, 캘리브 안내 칩 line 96) / **13** (모바일 설명 line 202, 데스크톱 다운로드 line 137) / **14** (모바일 헤더 line 179, 모바일 다운로드 line 212) / **'min(1.4vw, 16px)'** (연도 오버레이 line 83). §1.1 11px 위반. 어디까지 격상?
  - **default 답: 부분 절충** — fontSize:11 → `text-caption` (12) `leading-none` 격상 (§1.1 위반 일괄 상향, 마이그레이션 §4.2) / fontSize:12 → `text-caption leading-none` 유지 (캘리브 안내 칩 / 데스크톱 설명·토글 dense layout 절충, 14-reports W1 footer 절충 패턴 mirror, memory `feedback_text_caption_leading_none`) / fontSize:13 → `text-label` (13) `leading-none` (필요 시) / fontSize:14 (모바일 헤더 / 다운로드 버튼) → `text-body` (16) `font-bold` 격상 (§1.3 모바일/데스크톱 동일 폰트 룰 + 노안 친화 강화, 모바일 full-width CTA 가독성 우선) / **연도 오버레이 `'min(1.4vw, 16px)'` 유지** (엑셀 표지 시각 일치, 캘리브 좌표 시스템 일부 — 변경 금지, memory `feedback_pdflib_subset_false` 일반화 룰). 16-workshift W1 OQ #3 부분 절충 패턴 mirror.

- **OQ #4**: 아이콘 Lucide 교체 —
  - (a) 모바일 헤더 back button 커스텀 SVG ChevronLeft (line 175~177, `M15 19l-7-7 7-7` size 15) → Lucide `ChevronLeft size={15}` 교체?
  - (b) 다운로드 버튼 커스텀 SVG (line 141~143 데스크톱 size 15, line 216~218 모바일 size 16, `M12 5v14m0 0l-4-4m4 4l4-4M4 19h16`) → Lucide `Download size={15/16}` 교체?
  - **default 답: (a) + (b) 모두 교체 OK** — 16-workshift W1 OQ #2 ChevronLeft Lucide 교체 LOCKED + design-system §7.1 Lucide 사용 가능 룰 + §7.4 "뒤로가기: ChevronLeft" 명시 + Lucide 의 `Download` 아이콘이 동일 의미 (Lucide 권장 사이즈 16/20/24 외 `size={15}` 도 prop 임의 정수 허용으로 인라인 안전). svg size 는 line 별 (데스크톱 15 / 모바일 16) 유지. Lucide prop `size={N}` 사용 — className 으로 `w-N h-N` 금지 (memory `feedback_tailwind_token_class_pattern`).

- **OQ #5**: 캘리브 안내 칩 `background: rgba(59,130,246,0.9)` (line 94) + 캘리브 모드 미리보기 border `var(--acl)` (line 72) — 디자인 토큰 치환?
  - **default 답: 부분 토큰** — preview border (`2px solid var(--acl)`) → `border-2 border-accent` 토큰 치환 OK (마이그레이션 §4.1, OQ #2 와 일관). **캘리브 안내 칩 background `rgba(59,130,246,0.9)` 는 인라인 유지** (캘리브 모드 일시 표시용 — 신규 토큰 정의 (`bg-accent/90` 가능하나 alpha 정밀도 다름) 비용 vs 1줄 인라인 trade-off, 16-workshift W1 OQ #4 SHIFT_COLOR hex+22 인라인 유지 일관 + 27-login W1 OQ #2 CARD_COLORS rgba 인라인 유지 일관). 안내 칩 color #fff + fontWeight 700 + whiteSpace nowrap + pointerEvents none 유지.

---

## 자체 verify (작성 완료 후 본 인덱스가 통과해야 할 gate)

본 문서가 후속 wave 진입 자격을 갖췄는지 verify:

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. 7 헤더 존재 | `grep -c '^# §[1-7]' wave-1-index.md` | =7 |
| 2. sub-wave 분배 표 ≥4 | `grep -E '^\| W[2-5] \|' wave-1-index.md \| wc -l` | ≥4 |
| 3. 메모리 룰 unique ≥10 | `grep -oE 'feedback_[a-z_]+' wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 4. negative §6 안 wrangler+npm run deploy | `grep -c 'wrangler' wave-1-index.md` ≥1 & `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 |
| 5. src/** 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src/pages/AnnualPlanPage.tsx cha-bio-safety/src/utils/generateAnnualPlan.ts` | 0 lines |
| 6. OQ §7 ≥5 | `grep -cE 'OQ #[1-5]' wave-1-index.md` | ≥5 |
| 7. design-system fence ≥6 (open+close) | `grep -c '^```' wave-1-index.md` | ≥6 |

모두 PASS 시 본 인덱스가 W2 진입의 단일 진입점으로 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 5건 답변으로 받는다.

다음 wave 파일명: `sketch-wave-2-chrome.html` (OQ #1 답변 후 `/clear` + 새 `/gsd:quick` 시작 권장 — memory `feedback_gsd_workflow_strict`).

---
title: "redesign/23-education — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-22
quick_id: 260522-gmp
branch: redesign/23-education
source_tsx: cha-bio-safety/src/pages/EducationPage.tsx
source_tsx_lines: 591
design_system: cha-bio-safety/docs/redesign-context/23-education/design-system.md (v0.1.1, c8bfa86)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (소방안전관리자 보수교육 = 점검 시리즈 아님 — 직접 적용 X, 헤더 패턴만 mirror)
mirror_of: cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md (260522-209) + cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md (260521-wmq) + cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (260521-sjj) + cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (260521-c6p) — 7 섹션 + 4 sub-wave 구조 mirror
biz_anchor_precedent: cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md (260522-209) — 비즈 anchor 16건 1 byte 변경 0 패턴 일반화 (15-daily-report SW3 portraitPos precedent → 28-splash 16건 → 23-education D-day 임계치 + role 그룹핑 + useMutation 3종)
sub_wave_count: 4 (W2~W5)
memory_rules_inline: 12 (10 기본 + feedback_inspection_unresolved_color D-day 임계치 status 토큰 일반화 + project_inspection_completion_rule role 그룹핑·titleRank·canEdit source of truth 일반화)
open_questions: 5
---

# redesign/23-education — sketch wave 1 (index)

본 문서는 W2~W5 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:

- EducationPage.tsx (591 라인 — 단일 파일에 모바일 + 데스크톱 분기 + 4개 내부 컴포넌트 DdayBadge / StaffEducationCard / EducationEditPanel / EducationBottomSheet 통합) 의 element 인벤토리 → 4 sub-wave 분배 + **비즈 시그니처 anchor** 보존 (useQuery `['education']` / useMutation 3종 / educationApi.list/create/update/delete / calcNextDeadline / TITLE_ORDER + titleRank / addMonths / addYears / differenceInCalendarDays / parseISO / fmtDate / dateToYmd / DdayBadge 임계치 30·0 + 라벨 `D-{n}` / `D+{n} 초과` / role 그룹핑 + canEdit / @keyframes blink + slideUp / toast 카피 5종 / 빈/오류 카피 / IconChevronLeft polyline)
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6 / §7 / §7.1 의 verbatim 룰 박제 (§6/§7 은 미적용/부분 적용 1줄 메타 동반, §7.1 Lucide 룰은 적용)
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 23-education 적용 여부 (소방안전관리자 보수교육 = 점검 시리즈 아님 — 직접 적용 X. 단 모바일 자체 헤더 배경 토큰 / back button 패턴 / BottomNav 숨김 + 글로벌 AppHeader 데스크톱 표시 3 가지 mirror 검토. App.tsx 실측 박제 — `/education` ∈ `MOBILE_NO_NAV_PATHS` (line 71) + `PAGE_TITLES` (line 95) / `DESKTOP_NO_NAV_PATHS` (line 74) 미등재 / `DESKTOP_HEADER_HIDE_PATHS` (line 77) 미등재 → 데스크톱 글로벌 AppHeader 표시 / Route line 288.)
- 메모리 룰 12건 (`feedback_*.md` 10 + `feedback_inspection_unresolved_color` D-day 임계치 status 토큰 매핑 일반화 + `project_inspection_completion_rule` role 그룹핑·titleRank·canEdit source of truth 일반화) inline 인용 — 23-education 특화 룰 2건 (D-day 임계치 색 분기 status 토큰 + role 그룹핑·titleRank·canEdit 운영 룰 보존) 포함
- §6 negative rule (이 wave 에서 금지된 것)
- §7 open questions 5건 — W2 진입 직전 사용자 컨펌 (헤더 배경 토큰 raised 유지 / D-day status 토큰 치환 / submit button 그라데이션 / 빈/오류 상태 아이콘 / Lucide back button 교체)

작성일: 2026-05-22 / Quick ID: 260522-gmp / Branch: redesign/23-education

> 28-splash W1 (260522-209) + 17-annual-plan W1 (260521-wmq) + 16-workshift W1 (260521-sjj) + 27-login W1 (260521-c6p) 의 7 섹션 + 4 sub-wave 구조를 정확히 mirror. EducationPage 가 591 lines 단일 파일 + 4개 내부 컴포넌트 (DdayBadge / StaffEducationCard / EducationEditPanel / EducationBottomSheet) 통합 + 모바일/데스크톱 분기 + D-day 임계치 색 분기 — 4 sub-wave (W2~W5) 채택. 직원 카드는 W3 단독 wave, 등록/수정/삭제 모달은 W4 단독 wave (데스크톱 우측 패널 + 모바일 바텀시트 EducationEditPanel 공용). 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash 모두 평면(flat sibling) 패턴 — `23-education/sketch-wave-N-{slug}.html` 직접 배치, `sketch/` 서브폴더 없음. 본 인덱스도 `23-education/wave-1-index.md` (flat) 으로 위치한다.

---

# §1. EducationPage.tsx 인벤토리

본 인벤토리는 EducationPage.tsx (591 lines, 실측) 의 element 를 (1) 상단 유틸 / 상수 / 스켈레톤 / (2) DdayBadge / (3) StaffEducationCard / (4) EducationEditPanel / (5) EducationBottomSheet / (6) 메인 페이지 query / grouping / render + 데스크톱 + 모바일 분기 6 영역으로 나눠 정리한다. line 범위는 **실측 결과** (Read 도구 + grep 검증, drift 없음).

**EducationPage 의 구조 특이성** (인벤토리 머리말):

- **모바일/데스크톱 분기 via `useIsDesktop()`** (line 8 import / line 422 호출, ≥768px) — 591 lines 단일 파일 내부에 if(isDesktop) 분기 2덩어리 (line 501~534 데스크톱 / line 537~590 모바일).
- **단일 파일 591 lines** — 17-annual-plan AnnualPlanPage (225 lines) 보다 약 2.6배, 28-splash 통합 (320 lines) 보다 약 1.8배, 16-workshift WorkShiftPage (226 lines) 보다 약 2.6배. **4개 내부 컴포넌트 통합** (DdayBadge / StaffEducationCard / EducationEditPanel / EducationBottomSheet) — 28-splash 의 2-파일 통합 (SplashScreen + InstallPrompt) 과 다른 패턴이지만 통합 규모는 유사.
- **D-day 배지 임계치 색 분기** (line 61~93, DdayBadge) — dday > 30 → safe / 0 ≤ dday ≤ 30 → warning / dday < 0 → danger 3분기. status 토큰 매핑 룰 = W3 sketch 핵심 (memory `feedback_tailwind_token_class_pattern` status- prefix 없음 룰 + memory `feedback_inspection_unresolved_color` 임계치 status 토큰 일반화). 임계치 30 / 0 + 라벨 `D-${dday}` / `D+${Math.abs(dday)} 초과` 1 byte 변경 금지.
- **role admin/assistant 그룹핑 + titleRank 정렬** (line 49~50 TITLE_ORDER + titleRank / line 438~439 adminList + assistantList) — adminList ('소방안전관리자') / assistantList ('소방안전관리 보조자') 2섹션 + 주임 0 / 대리 1 / 기사 2 직급순. 비즈 보존 룰 = W3 sketch 보존 필수 (memory `project_inspection_completion_rule` 일반화 룰).
- **데스크톱은 글로벌 AppHeader 사용** (App.tsx line 504 코멘트 "페이지 제목은 App.tsx 헤더에서 표시", line 504~505 좌측 wrapper 시작) — `/education` 가 `DESKTOP_HEADER_HIDE_PATHS` **미등재** (App.tsx line 77) + `PAGE_TITLES` 등재 (App.tsx line 95 `'/education': '보수교육'`). 17-annual-plan 과 동일 패턴 (글로벌 AppHeader 데스크톱 표시) / 16-workshift 와 다름 (16-workshift 는 데스크톱 글로벌 AppHeader 숨김).
- **모바일은 자체 헤더 렌더** (line 541~565) — height 48 / bg `var(--bg2)` / borderBottom 1px / back button 44x44 (`IconChevronLeft size={20}`) + 타이틀 '보수교육' fontSize 16/700 textAlign center + right spacer 44x44. design-system §1.1 터치 타겟 44px 일치 (memory `feedback_tailwind_w8_h8_is_48px` 함정 회피 — `w-8` = 48px 이므로 `w-11` = 44px 또는 `w-[44px] h-[44px]` arbitrary 필수).
- **EducationEditPanel 은 데스크톱 우측 패널 + 모바일 바텀시트 공용 컴포넌트** — 데스크톱 line 517~522 인라인 / 모바일 line 393~417 (EducationBottomSheet wrapper) + 본문 line 413 EducationEditPanel 동일 호출. props `{ item, canEdit, onSaved }` 동일.
- **빈 상태 메시지 verbatim** (line 477~478): '교육 이력 없음' (fontSize 16/700 var(--t2)) + '이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.' (fontSize 14 var(--t3)).
- **오류 상태 verbatim** (line 472): '교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.' (fontSize 14 var(--danger) padding 24).
- **권한 분기 canEdit** (line 432~435): `currentStaff == null → false` / `currentStaff.role === 'admin' → true` / `currentStaff.id === cardStaffId → true` / `else false`. admin 은 모두 편집 가능, assistant 는 본인 카드만. canEdit false 면 카드 cursor default + onClick undefined (line 115/121) — 모달 안 열림.

## §1.1 영역별 인벤토리 표

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. 상단 유틸 / 상수 / 스켈레톤 | imports (useState / useNavigate / useQuery+useMutation+useQueryClient / addMonths+addYears+differenceInCalendarDays+parseISO / toast / educationApi / useAuthStore / useIsDesktop / type EducationRecord+StaffEducation) | 1~9 | 정적 import 묶음 | educationApi.list/create/update/delete 시그니처 import — 변경 금지 | 무관 (보존만) |
| 1. 상단 유틸 / 상수 / 스켈레톤 | IconChevronLeft({ size = 20, color = 'currentColor' }) 인라인 SVG (polyline points "15 18 9 12 15 6", strokeWidth 2 strokeLinecap+strokeLinejoin round) | 12~18 | 모바일 헤더 back button 아이콘 | 단일 사용처 (line 559) — Lucide ChevronLeft 교체 후보 (OQ #5) | W2 (모바일 헤더) |
| 1. 상단 유틸 / 상수 / 스켈레톤 | calcNextDeadline(appointedAt, records): { deadline, dday, label } — !appointedAt → '선임일 미등록' / records 0 → addMonths(6) + '첫 실무교육' / else → addYears(sorted[0], 2) + '보수교육'. dday = differenceInCalendarDays(d, new Date()) | 21~33 | **핵심 비즈** D-day + 마감일 계산 | DdayBadge / StaffEducationCard / EducationEditPanel 3 곳 호출 (line 108, 199) — **변경 금지** | W3 (DdayBadge + 카드) + W4 (모달 마감 박스) |
| 1. 상단 유틸 / 상수 / 스켈레톤 | fmtDate(iso) → 'y-m-d' split (line 36~39) | 36~39 | 날짜 포매터 | StaffEducationCard 마지막 이수 / EducationEditPanel 이수 이력 row 호출 (line 166, 312) | W3 + W4 |
| 1. 상단 유틸 / 상수 / 스켈레톤 | dateToYmd(d: Date) → zero-padded y-m-d (line 41~46) | 41~46 | Date → 'YYYY-MM-DD' 변환 | calcNextDeadline 결과 표시 + state completedAt initial value + handleCancelEdit reset (line 177, 204, 256, 295) | W3 + W4 |
| 1. 상단 유틸 / 상수 / 스켈레톤 | TITLE_ORDER = `{ '주임': 0, '대리': 1, '기사': 2 }` + titleRank(title) → fallback 99 | 49~50 | 직급 정렬 룰 — **운영 룰 source of truth** | 그룹핑 sort 호출 (line 438, 439) — **변경 금지** (memory `project_inspection_completion_rule` 일반화) | W3 (그룹 카드 정렬) |
| 1. 상단 유틸 / 상수 / 스켈레톤 | SKELETON_STYLE: React.CSSProperties — bg var(--bg3) / borderRadius 12 / height 88 / animation `blink 2s ease-in-out infinite` | 53~58 | 로딩 스켈레톤 박스 4개 | renderGroupedList isLoading 분기 (line 462~468) + @keyframes blink 인라인 (line 583~588) — **height 88 + animation 1 byte 변경 금지** | W2 (로딩 상태) |
| 2. DdayBadge | props `{ dday: number }` | 61 | 우상단 D-day 칩 | StaffEducationCard 상단 행 + EducationEditPanel 프로필 헤더 2 곳 호출 (line 157~159, 288) | W3 + W4 |
| 2. DdayBadge | 분기 매트릭스 — dday > 30 → bg `rgba(34,197,94,0.12)` + color `var(--safe)` + label `D-${dday}` / 0 ≤ dday ≤ 30 → bg `rgba(245,158,11,0.15)` + color `var(--warn)` + label `D-${dday}` / dday < 0 → bg `rgba(239,68,68,0.15)` + color `var(--danger)` + label `D+${Math.abs(dday)} 초과` | 66~78 | **D-day 임계치 색 + 라벨** — 운영 의미 (충분/임박/초과) | **변경 금지** — 30 / 0 경계 + 라벨 + rgba 색 (또는 status-* 토큰 치환, OQ #2) 모두 1 byte 변경 금지 (memory `feedback_inspection_unresolved_color` 일반화) | W3 (DdayBadge 3 임계치 매트릭스) |
| 2. DdayBadge | 외곽 style — fontSize 12 / fontWeight 700 / padding '2px 8px' / borderRadius 8 / flexShrink 0 | 80~92 | 칩 외곽 시각 | text-caption(12) leading-none 후보 (memory `feedback_text_caption_leading_none`) | W3 |
| 3. StaffEducationCard | props `{ item: StaffEducation, canEdit: boolean, selected?: boolean, onTap: () => void }` | 96~106 | 직원 1명 카드 | renderCards 매핑 호출 (line 442~450) | W3 |
| 3. StaffEducationCard | 외곽 — bg var(--bg2) / borderRadius 12 / padding 16 / border 분기 (`selected ? '1.5px solid var(--acl)' : '1px solid var(--bd)'`) / cursor `canEdit ? 'pointer' : 'default'` / minHeight 80 / WebkitTapHighlightColor transparent / userSelect none | 113~126 | 카드 외곽 + 데스크톱 선택 강조 + 권한 분기 cursor | selected → 데스크톱 우측 패널 활성 표시 (모바일 selected 무관) / canEdit false 면 cursor default + onClick undefined (line 115) — 모달 안 열림 | W3 (외곽 + selected) |
| 3. StaffEducationCard | 상단 행 — flex flex-start gap 12 (아바타 32x32 circle bg var(--bg3) color var(--t2) fontSize 14/700 → staff.name.charAt(0) + 이름 fontSize 16/700 var(--t1) lineHeight 1.3 + 직책 fontSize 13/400 var(--t2) marginTop 2 + DdayBadge dday !== null) | 128~160 | 아바타 + 이름 + 직책 + D-day 배지 | staff.name.charAt(0) 이니셜 / dday !== null 분기 | W3 |
| 3. StaffEducationCard | 하단 행 — marginTop 10 paddingLeft 44 (아바타 32 + gap 12 들여쓰기) — lastRecord 있으면 fontSize 12 var(--t3) marginBottom 2 '마지막 이수: {fmtDate} (실무/보수)' / staff.appointedAt === null '선임일 미등록' / deadline 있으면 flex gap 6 — '다음 마감: {dateToYmd}' var(--t2) + '({label})' var(--t3) | 163~184 | 메타 (마지막 이수 + 다음 마감 + label) | calcNextDeadline / fmtDate / dateToYmd / lastRecord = sorted[0] (line 110~111) | W3 |
| 4. EducationEditPanel | props `{ item, canEdit, onSaved }` (EditPanelProps interface, line 190~194) | 190~196 | 데스크톱 우측 패널 + 모바일 바텀시트 공용 컴포넌트 | 데스크톱 line 517~522 인라인 / 모바일 line 413 (EducationBottomSheet wrapper 내부) | W4 |
| 4. EducationEditPanel | useQueryClient + useMutation 3종 — createMutation educationApi.create({ staffId, education_type, completed_at }) / updateMutation educationApi.update(editingRecord!.id, { completed_at }) / deleteMutation educationApi.delete(id). 모두 onSuccess → invalidate `['education']` + toast.success + onSaved. onError → toast.error '이수 기록 저장에 실패했습니다.' (create+update) / '삭제에 실패했습니다.' (delete, e.message ?? fallback) | 197, 212~244 | **핵심 비즈** 등록/수정/삭제 + queryClient invalidate + toast 카피 | educationApi.list/create/update/delete 4종 시그니처 — **변경 금지**. invalidateQueries `['education']` query key 변경 시 list refetch 안 됨 | W4 (3 mutation 핸들러) |
| 4. EducationEditPanel | state — completedAt (`dateToYmd(new Date())`), educationType ('initial' | 'refresher' — `hasRecords ? 'refresher' : 'initial'`), editingRecord (`EducationRecord | null`), isEditMode = `editingRecord !== null`, isSubmitting = `create.isPending \|\| update.isPending \|\| delete.isPending` | 204~210, 246 | 폼 상태 + 편집 모드 분기 + 제출 중 disable | hasRecords = `sorted.length > 0` (line 202) | W4 |
| 4. EducationEditPanel | 프로필 헤더 — flex align gap 12 — 아바타 40x40 circle var(--bg3) (staff.name.charAt(0) fontSize 16/700) + 이름 fontSize 18/700 var(--t1) + 직책 fontSize 13 var(--t2) marginTop 2 + DdayBadge dday !== null | 276~289 | 모달 상단 — 직원 식별 + D-day 배지 | DdayBadge 재호출 (line 288) | W4 |
| 4. EducationEditPanel | 마감 정보 박스 — bg var(--bg3) borderRadius 10 padding '12px 16px' — '다음 마감' fontSize 12/400 var(--t3) marginBottom 4 + dateToYmd fontSize 14/600 var(--t1) + (label) fontSize 12/400 var(--t3) | 292~299 | 다음 마감일 + label 표시 | staff.appointedAt && deadline 분기 (line 292) | W4 |
| 4. EducationEditPanel | 이수 이력 리스트 — '이수 이력' fontSize 13/700 var(--t2) marginBottom 8 — each row bg var(--bg3) borderRadius 8 padding '8px 12px' flex align justify — date+(실무/보수) fontSize 13 var(--t2) + canEdit 면 '수정'/'취소' + '삭제' 버튼 (padding '4px 10px' borderRadius 6 border 1px solid var(--bd2) fontSize 12) | 302~343 | 기존 이수 이력 표시 + 수정/삭제 액션 | sorted.length > 0 분기 / editingRecord?.id === rec.id 분기 '수정'/'취소' / deleteMutation.mutate(rec.id) | W4 |
| 4. EducationEditPanel | 등록/수정 폼 — borderTop 1px solid var(--bd) paddingTop 16 / 라벨 fontSize 13/700 var(--t2) '이수일 수정'/'이수 기록 등록' / 이수일 input[type=date] (inputStyle) / 교육 유형 select (분기 `!hasRecords && !isEditMode` → color var(--t3) cursor default pointerEvents none — 옵션 '실무교육 (최초)' / '보수교육') / submit button (width 100% height 44 bg var(--acl) borderRadius 10 border none color #fff fontWeight 700 fontSize 14 — '저장 중...' / '수정 완료' / '이수일 기록' / opacity isSubmitting ? 0.6 : 1) | 346~387 | 등록/수정 폼 + 분기 disable + submit | canEdit 분기 (line 346) / handleSubmit (line 260~264) / `!hasRecords && !isEditMode` select disabled | W4 |
| 4. EducationEditPanel | inputStyle — width '100%' bg var(--bg3) borderRadius 9 padding '10px 12px' border '1px solid var(--bd2)' color var(--t1) fontSize 13 boxSizing border-box outline none fontFamily inherit minWidth 0 WebkitAppearance none appearance none | 266~271 | input + select 공통 토큰 | 단일 정의 객체 — 변경 시 input/select 동시 영향 | W4 |
| 4. EducationEditPanel | handleStartEdit / handleCancelEdit / handleSubmit | 248~264 | 편집 모드 진입/취소/제출 핸들러 | editingRecord state + completedAt + educationType setter | W4 |
| 5. EducationBottomSheet | props `EditPanelProps & { onClose: () => void }` | 393 | 모바일 바텀시트 wrapper | 모바일 분기 (line 573~580) 에서 selectedItem !== null 일 때 마운트 | W4 |
| 5. EducationBottomSheet | 오버레이 — position fixed inset 0 background `rgba(0,0,0,0.6)` flex column justifyContent flex-end zIndex 50 / onClick onClose | 394~401 | 풀스크린 dimmer + 외부 클릭 닫기 | onClose prop → setSelectedItem(null) (line 577) | W4 |
| 5. EducationBottomSheet | 시트 — bg var(--bg2) borderRadius '16px 16px 0 0' animation `slideUp 0.28s ease-out both` maxHeight 90vh overflowY auto padding '16px 16px 32px' / onClick stopPropagation | 402~414 | 시트 본체 + slideUp 진입 애니메이션 + 외부 클릭 차단 | `@keyframes slideUp` 정의 위치는 design-system §6.6 룰 일치 (0.28s ease-out 룰 일반화). 정의는 글로벌 (src/index.css 가정) — line 583~588 인라인 `@keyframes blink` 와 별개 | W4 |
| 5. EducationBottomSheet | 시트 헤더 handle — flex justifyContent center marginBottom 8 — 32x4 bg var(--bd2) borderRadius 2 | 410~412 | 바텀시트 인지용 손잡이 | 정적 시각 요소 (드래그 핸들 기능 없음 — 디자인 강조용) | W4 |
| 5. EducationBottomSheet | 본문 — `<EducationEditPanel item canEdit onSaved={onSaved} />` | 413 | 데스크톱 우측 패널과 공용 본문 | EducationEditPanel 재호출 — 데스크톱과 동일 로직 | W4 |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | useNavigate / useIsDesktop / `useAuthStore().staff = currentStaff` | 421~423 | 라우팅 + 분기 + 로그인 직원 정보 | useAuthStore zustand store (line 7 import) | W2 + W3 + W4 |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | `useState<StaffEducation \| null> selectedItem` | 425 | 카드 클릭 시 우측 패널/바텀시트 활성 | 데스크톱 우측 패널 + 모바일 바텀시트 마운트 트리거 | W3 + W4 |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | `useQuery<StaffEducation[]>({ queryKey: ['education'], queryFn: educationApi.list })` | 427~430 | 메인 데이터 fetch | useMutation 3종이 invalidate 하는 query key — **변경 금지** (모든 4 mutation 의 invalidate 키와 일치 필수) | W2 (로딩/오류/빈) + W3 (그룹 카드) |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | canEdit(cardStaffId) — `currentStaff == null → false` / `role === 'admin' → true` / `id === cardStaffId → true` / else false | 432~435 | 권한 분기 — **운영 룰 source of truth** | StaffEducationCard / EducationEditPanel / EducationBottomSheet 3 곳 전달 (line 446, 520, 576) — **변경 금지** (memory `project_inspection_completion_rule` 일반화) | W3 + W4 |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | 그룹핑 — adminList = `(data ?? []).filter(role === 'admin').sort(titleRank a - titleRank b)` / assistantList = role !== 'admin' 동일 정렬 | 438~439 | **운영 룰** 그룹 + 직급 정렬 | titleRank fallback 99 / 그룹 라벨 '소방안전관리자' '소방안전관리 보조자' verbatim (line 486, 492) — **변경 금지** | W3 |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | renderCards(items) — StaffEducationCard 매핑 — `selected = isDesktop && selectedItem?.staff.id === item.staff.id` / `onTap = () => setSelectedItem(item)` | 441~451 | 카드 리스트 렌더 헬퍼 | 데스크톱만 selected (모바일 무관) — line 447 isDesktop 분기 | W3 |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | sectionLabelStyle — `fontSize: isDesktop ? 15 : 13` / fontWeight 700 / color var(--t2) / marginBottom 8 / marginTop 4 | 453~459 | 그룹 라벨 (모바일 13 / 데스크톱 15) | 모바일 13 → text-label / 데스크톱 15 → text-body-sm 또는 text-body (OQ #3 검토) | W3 |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | renderGroupedList — isLoading 4 SKELETON_STYLE rows / isError 카피 verbatim '교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.' fontSize 14 var(--danger) padding 24 flex center / empty '교육 이력 없음' fontSize 16/700 var(--t2) + '이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.' fontSize 14 var(--t3) flex column align center gap 8 padding 24 / 그룹 렌더 adminList > 0 → '소방안전관리자' 라벨 + 카드 / assistantList > 0 → '소방안전관리 보조자' 라벨 (marginTop `adminList > 0 ? 12 : 4`) + 카드, gap 12 | 461~498 | 4 state 매트릭스 (loading/error/empty/data) + 2 그룹 라벨 | renderCards / sectionLabelStyle / adminList + assistantList | W2 (loading/error/empty 3 state) + W3 (그룹 카드) |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | **데스크톱 분기** — 외곽 flex height 100% bg var(--bg) — 좌측 flex 1 borderRight 1px solid var(--bd) (코멘트 line 504 '페이지 제목은 App.tsx 헤더에서 표시') + 내부 flex 1 overflowY auto padding '24px' → renderGroupedList / 우측 flex 1 overflowY auto padding '24px 32px' — selectedItem 있으면 `<EducationEditPanel key={selectedItem.staff.id} item canEdit onSaved={() => {}} />` / 없으면 '좌측에서 직원을 선택하세요' var(--t3) fontSize 14 flex center | 501~534 | 데스크톱 좌/우 50:50 분할 마스터-디테일 | 좌측 = 카드 목록 / 우측 = 상세 패널. 글로벌 AppHeader 표시 (DESKTOP_HEADER_HIDE_PATHS 미등재) → 자체 헤더 없음 | W2 (좌/우 분할 outline + 우측 fallback) + W3 (좌측 카드 selected) + W4 (우측 패널) |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | **모바일 분기** — 외곽 flex column height 100% bg var(--bg) / 자체 헤더 height 48 bg var(--bg2) borderBottom 1px solid var(--bd) flex align flexShrink 0 — back button 44x44 background none border none cursor pointer flex center color var(--t2) → onClick `navigate(-1)` 내부 `<IconChevronLeft size={20} color="var(--t2)" />` + 타이틀 span flex 1 textAlign center fontSize 16/700 var(--t1) '보수교육' + right spacer div width 44 / 스크롤 영역 flex 1 overflowY auto padding 16 → renderGroupedList / 바텀시트 selectedItem 있으면 EducationBottomSheet | 537~580 | 모바일 헤더 + 스크롤 + 바텀시트 | navigate(-1) / IconChevronLeft / 타이틀 verbatim '보수교육' / right spacer 44 (back button 폭 보정해 타이틀 정중앙) | W2 (모바일 헤더) + W3 (카드) + W4 (바텀시트) |
| 6. 메인 페이지 query/grouping/render + 데스크톱/모바일 분기 | `<style>{@keyframes blink ...}</style>` — 0%/100% opacity 1 / 50% opacity 0.4 | 583~588 | SKELETON 깜빡임 keyframe (인라인) | SKELETON_STYLE 의 animation 참조 — 글로벌 정의 시 옮길 수 있으나 현재 인라인. **변경 금지** | W2 (SKELETON 보존) |

## §1.2 line 수 실측 확인

```
$ wc -l cha-bio-safety/src/pages/EducationPage.tsx
     591 cha-bio-safety/src/pages/EducationPage.tsx
```

PLAN 추정치 (591 lines) + 23-education.md 메타 일치, drift 없음.

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

W5 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (28-splash W1 의 비즈 anchor 16건 보존 룰 일반화 + 15-daily-report SW3 portraitPos 좌표 시스템 precedent 일반화, memory `project_redesign_15_daily_report_status` + `feedback_inspection_unresolved_color` + `project_inspection_completion_rule`):

```
[EducationPage.tsx — react-query / 비즈 시그니처]
- useQuery<StaffEducation[]>({ queryKey: ['education'], queryFn: educationApi.list })  (변경 금지)
- useMutation × 3 (createMutation / updateMutation / deleteMutation)                   (변경 금지)
- educationApi.list()                                                                  (시그니처 변경 금지)
- educationApi.create({ staffId, education_type, completed_at })                       (snake_case payload 변경 금지)
- educationApi.update(id, { completed_at })                                            (id positional + snake_case 변경 금지)
- educationApi.delete(id): Promise<void>                                               (시그니처 변경 금지)
- queryClient.invalidateQueries({ queryKey: ['education'] })                           (모든 3 mutation onSuccess + query key 일치 필수)

[EducationPage.tsx — 비즈 로직 함수]
- calcNextDeadline(appointedAt: string | null, records: EducationRecord[]): { deadline, dday, label }  (변경 금지)
- addMonths(parseISO(appointedAt), 6) ⇒ 첫 실무교육 마감                                  (변경 금지)
- addYears(parseISO(sorted[0].completedAt), 2) ⇒ 보수교육 마감                            (변경 금지)
- differenceInCalendarDays(d, new Date()) ⇒ D-day                                       (변경 금지)
- sorted by .completedAt.localeCompare(b.completedAt) desc                              (변경 금지 — 보수교육 마감 계산 anchor)
- TITLE_ORDER = { '주임': 0, '대리': 1, '기사': 2 }                                       (변경 금지 — 운영 룰)
- titleRank(title): TITLE_ORDER[title] ?? 99                                            (fallback 99 변경 금지)
- fmtDate(iso): 'y-m-d' split                                                            (변경 금지)
- dateToYmd(d: Date): zero-padded 'y-m-d'                                               (변경 금지)

[EducationPage.tsx — D-day 임계치 시그니처 (memory feedback_inspection_unresolved_color 일반화)]
- DdayBadge 임계치 — dday > 30 (safe) / 0 ≤ dday ≤ 30 (warning) / dday < 0 (danger)     (1 byte 변경 금지)
- safe rgba: rgba(34,197,94,0.12) + var(--safe)                                          (또는 status- 토큰 치환, OQ #2)
- warning rgba: rgba(245,158,11,0.15) + var(--warn)                                      (또는 status- 토큰 치환, OQ #2)
- danger rgba: rgba(239,68,68,0.15) + var(--danger)                                      (또는 status- 토큰 치환, OQ #2)
- 라벨 verbatim — `D-${dday}` (safe + warning) / `D+${Math.abs(dday)} 초과` (danger)     (변경 금지)

[EducationPage.tsx — role 그룹핑 시그니처 (memory project_inspection_completion_rule 일반화)]
- adminList = data.filter(role === 'admin').sort(titleRank)                              (변경 금지)
- assistantList = data.filter(role !== 'admin').sort(titleRank)                          (변경 금지)
- 그룹 라벨 verbatim — '소방안전관리자' (admin) / '소방안전관리 보조자' (assistant)         (변경 금지)
- canEdit(cardStaffId) = currentStaff?.role === 'admin' || currentStaff.id === cardStaffId  (변경 금지)
- isDesktop && selectedItem?.staff.id === item.staff.id  ⇒ selected 분기 (데스크톱만)      (변경 금지)

[EducationPage.tsx — toast / 카피 / 자산 / animation]
- toast.success: '이수일이 기록되었습니다.' (line 220, create)                              (변경 금지)
- toast.success: '이수일이 수정되었습니다.' (line 230, update)                              (변경 금지)
- toast.success: '이수 기록이 삭제되었습니다.' (line 240, delete)                           (변경 금지)
- toast.error: '이수 기록 저장에 실패했습니다.' (line 223/233, create+update onError)        (변경 금지)
- toast.error: e?.message ?? '삭제에 실패했습니다.' (line 243, delete onError)              (변경 금지)
- 모바일 헤더 타이틀: '보수교육' (line 562)                                                 (변경 금지)
- 데스크톱 우측 fallback: '좌측에서 직원을 선택하세요' (line 528)                           (변경 금지)
- 빈 상태 제목: '교육 이력 없음' (line 477)                                                  (변경 금지)
- 빈 상태 보조: '이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.' (line 478)         (변경 금지)
- 오류 카피: '교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.' (line 472)        (변경 금지)
- calcNextDeadline label: '선임일 미등록' / '첫 실무교육' / '보수교육' (line 25, 29, 32)      (변경 금지)
- 마지막 이수 라벨: '마지막 이수: {date} ({실무/보수})' (line 166)                            (변경 금지)
- 다음 마감 라벨: '다음 마감: {date}' + '({label})' (line 177, 180)                          (변경 금지)
- 모달 마감 박스 라벨: '다음 마감' (line 294)                                                (변경 금지)
- 모달 이수 이력 라벨: '이수 이력' (line 304)                                                (변경 금지)
- 모달 폼 라벨: '이수일 수정' (isEditMode) / '이수 기록 등록' (line 349)                       (변경 금지)
- 모달 폼 inputType 라벨: '이수일' / '교육 유형' (line 353, 357)                              (변경 금지)
- select option verbatim: '실무교육 (최초)' (initial) / '보수교육' (refresher) (line 369, 370)  (변경 금지)
- submit button verbatim: '저장 중...' / '수정 완료' / '이수일 기록' (line 383)               (변경 금지)
- 액션 버튼 verbatim: '수정' / '취소' (편집 모드) / '삭제' (line 324, 335)                    (변경 금지)
- @keyframes blink (line 583~588, 0%/100% opacity 1 / 50% opacity 0.4)                  (변경 금지)
- @keyframes slideUp (글로벌 정의, EducationBottomSheet animation 'slideUp 0.28s ease-out both' line 406)  (변경 금지, design-system §6.6 룰 일치)
- IconChevronLeft polyline points "15 18 9 12 15 6" strokeWidth 2 (또는 Lucide ChevronLeft 교체, OQ #5)
- 모바일 헤더 height 48 + back button 44x44 + right spacer 44 (디자인 §1.1 터치 마지노선)    (변경 금지)
- 카드 minHeight 80 + padding 16 + borderRadius 12                                       (변경 금지 — 또는 디자인 토큰화)
- SKELETON height 88 + animation 'blink 2s ease-in-out infinite'                         (변경 금지)
- 바텀시트 borderRadius '16px 16px 0 0' + maxHeight 90vh + padding '16px 16px 32px'        (변경 금지)
- 바텀시트 handle 32x4 borderRadius 2 bg var(--bd2)                                       (변경 금지)

[stores/authStore.ts]
- useAuthStore().staff: Staff | null  — role: 'admin' | 'assistant'                      (시그니처 변경 금지)

[hooks/useIsDesktop.ts]
- useIsDesktop(): boolean  — ≥768px 분기                                                  (시그니처 변경 금지)

[date-fns / react-query / react-hot-toast 의존]
- addMonths / addYears / differenceInCalendarDays / parseISO (date-fns)                  (import 변경 금지)
- useQuery / useMutation / useQueryClient (@tanstack/react-query)                        (import 변경 금지)
- toast (react-hot-toast default export)                                                  (import 변경 금지)
```

위 모든 식별자/값은 §6 negative rule + §5 룰 11/12 + §7 OQ #1/#2/#3/#5 default 답에서 재확인. 1 byte 변경 시 W5 verify FAIL (28-splash W1 비즈 anchor 16건 보존 룰 + 15-daily-report SW3 precedent 동일 적용).

---

# §2. 4 sub-wave 분배 plan

다음 표 (W2~W5 4행) — 파일명은 위 frontmatter 의 평면 패턴 (`sketch-wave-N-{slug}.html` for W2~W4, `wave-5-tsx-conversion-checklist.md` for W5):

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 헤더 + 데스크톱 좌/우 분할 outline + 빈/로딩/오류 상태 (3 state) + 데스크톱 우측 fallback (총 4 state 매트릭스) | 영역 6 모바일 헤더 (line 541~565, back button 44x44 + IconChevronLeft size={20} + 타이틀 '보수교육' + right spacer 44) + 영역 6 데스크톱 외곽 (line 501~534, 좌측 borderRight 1px var(--bd) + 우측 fallback '좌측에서 직원을 선택하세요') + 영역 1 SKELETON_STYLE (line 53~58, height 88 + animation `blink 2s ease-in-out infinite`) + 영역 6 renderGroupedList isLoading/isError/empty 분기 (line 462~480, 4 SKELETON rows + 오류 카피 + 빈 카피 verbatim). 빈/로딩/오류 + 데스크톱 우측 fallback 4 state 매트릭스 — 모바일/데스크톱 frame 양쪽 다 보여줄 것. | sketch-wave-2-chrome.html |
| W3 | 직원 교육 카드 + 그룹핑 + D-day 배지 (3 임계치 분기) | 영역 2 DdayBadge (line 61~93, 3 임계치 매트릭스 safe `>30` / warning `0~30` / danger `<0`) + 영역 3 StaffEducationCard (line 96~187, 외곽 + 상단 행 + 하단 행 + selected 분기) + 영역 6 그룹핑/sectionLabelStyle (line 438~439, 453~459, 482~497, admin/assistant 2 그룹 + 직급순 정렬). 데스크톱 selected 분기 (1.5px solid var(--acl)) + 모바일 (selected 무관). admin/assistant 그룹 라벨 verbatim '소방안전관리자' '소방안전관리 보조자'. D-day 3 임계치 (>30 safe / 0~30 warning / <0 danger) 매트릭스 frame 4개 (D-365/D-30/D-0/D+10 4 인스턴스). | sketch-wave-3-staff-card.html |
| W4 | 등록/수정/삭제 모달 (데스크톱 우측 패널 + 모바일 바텀시트 공용 EducationEditPanel) | 영역 4 EducationEditPanel (line 190~390, 프로필 헤더 + 마감 정보 박스 + 이수 이력 리스트 + 등록/수정 폼) + 영역 5 EducationBottomSheet (line 393~417, 오버레이 + 시트 + handle bar + 본문 EducationEditPanel 재호출). 프로필 헤더 (40x40 아바타 + 18/700 이름 + 13 직책 + DdayBadge) + 마감 정보 박스 (var(--bg3) 12/16 padding) + 이수 이력 리스트 (each row 수정/취소/삭제 버튼) + 등록/수정 폼 (이수일 input[type=date] + 교육 유형 select + submit button var(--acl) → 그라데이션 OQ #3) + 데스크톱 인라인 = 우측 패널 / 모바일 = 바텀시트 (slideUp 0.28s + handle 32x4). canEdit 분기 (admin 모두 / assistant 본인) + isEditMode 분기 + `!hasRecords && !isEditMode` select disabled 분기 매트릭스 — frame 4 (canEdit true 평시 / isEditMode / canEdit false / 신규 첫 실무 select disabled). | sketch-wave-4-edit-modal.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + EducationPage.tsx 비즈 로직 보존 룰 + D-day 임계치 1 byte 변경 금지 + role 그룹핑 + canEdit source of truth + Tailwind cheatsheet + 메모리 룰 12건 cross-ref + verify gate. 28-splash W5 + 17-annual-plan W5 의 12-섹션 구조 mirror. | wave-5-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트 / 레이아웃

**[W2 — 모바일 헤더 + 데스크톱 좌/우 분할 outline + 빈/로딩/오류 상태]**

- **보존**:
  - `navigate(-1)` (line 550 모바일 back button onClick) verbatim
  - 모바일 헤더 타이틀 '보수교육' (line 562) verbatim
  - 데스크톱 우측 fallback '좌측에서 직원을 선택하세요' (line 528) verbatim
  - 빈 상태 제목 '교육 이력 없음' (line 477) + 보조 '이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.' (line 478) verbatim
  - 오류 카피 '교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.' (line 472) verbatim
  - SKELETON height 88 + animation `blink 2s ease-in-out infinite` (line 53~58, 변경 금지)
  - @keyframes blink 0%/100% opacity 1 + 50% opacity 0.4 (line 583~588) verbatim
  - useIsDesktop 분기 verbatim — 데스크톱 = flex 좌/우 50:50 / 모바일 = flex column 헤더+스크롤+바텀시트
  - IconChevronLeft polyline points "15 18 9 12 15 6" strokeWidth 2 (또는 Lucide ChevronLeft size={20} 교체 — OQ #5 default OK)
  - 데스크톱 좌측 borderRight 1px solid var(--bd) (line 506) + 좌측 padding 24 / 우측 padding '24px 32px' (line 509, 515)
  - 데스크톱 좌측 line 504 코멘트 보존 — "페이지 제목은 App.tsx 헤더에서 표시" (글로벌 AppHeader 데스크톱 표시 정당화)

- **토큰** (design-system §4.1 마이그레이션 매핑 표 기반):
  - `var(--bg)` (line 503, 538) → `bg-surface-page`
  - `var(--bg2)` (모바일 헤더 line 543) → `bg-surface-raised` (OQ #1 default raised 유지)
  - `var(--bg3)` (SKELETON line 54) → `bg-surface-sunken`
  - `var(--bd)` (line 506, 544) → `border-border-default`
  - `var(--t1)` (모바일 타이틀 line 561) → `text-text-primary`
  - `var(--t2)` (back button color line 556) → `text-text-secondary`
  - `var(--t3)` (데스크톱 우측 fallback color line 526, 빈 상태 보조 line 478) → `text-text-tertiary`
  - `var(--danger)` (오류 카피 line 471) → `text-danger` (or `text-status-danger` — **status- prefix 없음 룰 확인 후 결정**, memory `feedback_tailwind_token_class_pattern`). 현재 tailwind.config 패턴: `text-fire-bar` O / `text-status-fire-bar` X → `text-danger` 채택.

- **폰트** (design-system §1.1 + §4.2):
  - 14 (오류 카피 line 471, 빈 상태 보조 line 478, 데스크톱 우측 fallback line 526) → text-body-sm (14) 또는 **text-body (16) 격상 후보** (노안 친화 강화, OQ #3 검토)
  - 16 (빈 상태 제목 line 477, 모바일 타이틀 line 561) → text-body (마지노선)

- **레이아웃**:
  - 모바일: 단일 컬럼 (자체 헤더 48 + 스크롤 영역 padding 16 + 바텀시트 마운트)
  - 데스크톱: 좌/우 50:50 분할 (flex: 1 양쪽, 좌측 padding 24 / 우측 padding '24px 32px')
  - **모바일 BottomNav 숨김** (`/education` ∈ MOBILE_NO_NAV_PATHS App.tsx line 71) — sketch 시 nav placeholder 그릴 필요 없음
  - **데스크톱 BottomNav 표시** (사이드바, `/education` ∉ DESKTOP_NO_NAV_PATHS line 74) + **글로벌 AppHeader 표시** (`/education` ∉ DESKTOP_HEADER_HIDE_PATHS line 77 + ∈ PAGE_TITLES line 95) → sketch 시 데스크톱 시안 상단에 글로벌 AppHeader 영역 + 좌측 사이드바 영역 모두 인지 필요

**[W3 — 직원 교육 카드 + 그룹핑 + D-day 배지]**

- **보존**:
  - **DdayBadge 임계치 (>30 safe / 0~30 warning / <0 danger) — 1 byte 변경 금지** (memory `feedback_inspection_unresolved_color` 일반화)
  - 색 rgba 정확히 — `rgba(34,197,94,0.12)` (safe) / `rgba(245,158,11,0.15)` (warning) / `rgba(239,68,68,0.15)` (danger) — 또는 status 토큰 치환 (OQ #2 default 토큰 OK)
  - 라벨 verbatim — `D-${dday}` (safe + warning) / `D+${Math.abs(dday)} 초과` (danger)
  - calcNextDeadline 분기 보존 — '선임일 미등록' / '첫 실무교육' / '보수교육' label verbatim
  - fmtDate / dateToYmd 출력 포맷 'YYYY-MM-DD'
  - TITLE_ORDER `{ '주임': 0, '대리': 1, '기사': 2 }` + titleRank fallback 99 verbatim
  - role 그룹핑 라벨 verbatim — '소방안전관리자' (admin) / '소방안전관리 보조자' (assistant)
  - canEdit 분기 (admin 모두 / assistant 본인)
  - selected = isDesktop && selectedItem?.staff.id === item.staff.id (데스크톱만)
  - staff.name.charAt(0) 아바타 이니셜
  - 카드 minHeight 80 + padding 16 + borderRadius 12 + 아바타 32x32 + gap 12 + paddingLeft 44 (들여쓰기)
  - 마지막 이수 라벨: '마지막 이수: {date} (실무/보수)' (line 166)
  - 다음 마감 라벨: '다음 마감: {date}' + '({label})' (line 177, 180)
  - 선임일 미등록 분기 카피 verbatim (line 172)

- **토큰** (status- prefix 없음 룰 — memory `feedback_tailwind_token_class_pattern`):
  - 카드 border 분기 — selected `1.5px solid var(--acl)` → `border-2 border-accent` (1.5 → 2, design-system §4.3 매핑 + 16-workshift / 17-annual-plan OQ 일관) / 평시 `1px solid var(--bd)` → `border border-border-default`
  - 카드 bg `var(--bg2)` → `bg-surface-raised`
  - 아바타 bg `var(--bg3)` → `bg-surface-sunken`, color `var(--t2)` → `text-text-secondary`
  - 이름 color `var(--t1)` → `text-text-primary`
  - 직책 color `var(--t2)` → `text-text-secondary`
  - 메타 color `var(--t3)` → `text-text-tertiary`, 다음 마감 일자 color `var(--t2)` → `text-text-secondary`
  - **D-day status 토큰 매핑** (OQ #2 default 토큰 치환 OK):
    - safe → `bg-safe-bg text-safe` (rgba 인라인 폐기)
    - warning → `bg-warning-bg text-warning` (rgba 인라인 폐기)
    - danger → `bg-danger-bg text-danger` (rgba 인라인 폐기)
    - **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern`) — `text-status-safe` 같은 패턴 사용 시 W5 verify FAIL
  - sectionLabelStyle color `var(--t2)` → `text-text-secondary`

- **폰트** (design-system §1.1 + §4.2):
  - 12 (D-day 배지 line 84, 카드 하단 메타 line 165/171/176/179, 마감 정보 라벨 line 294/296) → **text-caption(12) leading-none** (작은 컨테이너 시각 패딩 방지, memory `feedback_text_caption_leading_none`)
  - 13 (카드 직책 line 151, 모바일 sectionLabelStyle line 454) → text-label
  - 14 (아바타 fontSize line 139, 카드 하단 fmtDate 동반은 12) → text-body-sm
  - 15 (데스크톱 sectionLabelStyle line 454) → text-body-sm 또는 text-body (OQ #3 검토)
  - 16 (카드 이름 line 148) → text-body (마지노선)

- **레이아웃**:
  - 카드 외곽 minHeight 80 + padding 16 + borderRadius 12 (1 byte 변경 금지)
  - 상단 행 flex flex-start gap 12 (아바타 32 + 이름/직책 flex 1 + D-day flexShrink 0)
  - 하단 행 marginTop 10 paddingLeft 44 (= 아바타 32 + gap 12 → 이름 들여쓰기 정렬)
  - 그룹 라벨 `marginTop adminList > 0 ? 12 : 4` (assistant 그룹이 admin 뒤에 오면 gap 12)
  - 그룹 내부 카드 gap 12 (line 483)

**[W4 — 등록/수정/삭제 모달]**

- **보존**:
  - **useMutation 3종 (create / update / delete) + invalidateQueries `['education']`** 정확히 같은 query key
  - educationApi.list / create / update / delete 시그니처 (snake_case payload `staffId` + `education_type` + `completed_at` / `id` 변경 금지)
  - toast 카피 verbatim — '이수일이 기록되었습니다.' / '이수일이 수정되었습니다.' / '이수 기록이 삭제되었습니다.' (3 success) + '이수 기록 저장에 실패했습니다.' (2 error) + 'e?.message ?? 삭제에 실패했습니다.' (delete error fallback)
  - inputStyle 보존 (width '100%' bg var(--bg3) borderRadius 9 padding '10px 12px' border '1px solid var(--bd2)' fontSize 13 boxSizing border-box outline none fontFamily inherit minWidth 0 WebkitAppearance none appearance none)
  - select option verbatim — '실무교육 (최초)' (initial) / '보수교육' (refresher)
  - 폼 라벨 verbatim — '이수일 수정' (isEditMode) / '이수 기록 등록' / '이수일' / '교육 유형'
  - submit button verbatim — '저장 중...' (isSubmitting) / '수정 완료' (isEditMode) / '이수일 기록'
  - 액션 버튼 verbatim — '수정' (평시) / '취소' (편집 모드) / '삭제'
  - `!hasRecords && !isEditMode` select disabled 분기 (color var(--t3) cursor default pointerEvents none) — 신규 + 첫 실무는 select 비활성
  - handleStartEdit / handleCancelEdit / handleSubmit 모든 핸들러 시그니처
  - slideUp 0.28s ease-out both keyframe (design-system §6.6 룰 일치, 글로벌 정의 가정)
  - overlay rgba(0,0,0,0.6) + stopPropagation
  - 바텀시트 borderRadius '16px 16px 0 0' + maxHeight 90vh + padding '16px 16px 32px'
  - handle 32x4 bg var(--bd2) borderRadius 2

- **토큰** (status- prefix 없음 룰):
  - 마감 정보 박스 bg `var(--bg3)` → `bg-surface-sunken`, '다음 마감' color `var(--t3)` → `text-text-tertiary`, dateToYmd color `var(--t1)` → `text-text-primary`, (label) color `var(--t3)` → `text-text-tertiary`
  - 이수 이력 row bg `var(--bg3)` → `bg-surface-sunken`
  - 수정/취소 버튼 bg 분기 `editingRecord?.id === rec.id ? 'var(--bg4)' : 'var(--bg2)'` → `bg-surface-active` (active) / `bg-surface-raised` (idle), border `var(--bd2)` → `border-border-strong`
  - inputStyle bg `var(--bg3)` → `bg-surface-sunken`, border `var(--bd2)` → `border-border-strong`, color `var(--t1)` → `text-text-primary`
  - submit button bg `var(--acl)` → `bg-accent` solid OR **`bg-safe-bar` solid OR design-system §6.4 그라데이션** (OQ #3 default 그라데이션 OK, 27-login + 14-reports + 16-workshift + 17-annual-plan W1 OQ #1/#3 그라데이션 default 일관). 그라데이션 색은 design-system §6.4 룰 (#1d4ed8, #0ea5e9) 우선.
  - 바텀시트 bg `var(--bg2)` → `bg-surface-raised`, handle bg `var(--bd2)` → `border-border-strong` (또는 인라인 유지)
  - 오버레이 `rgba(0,0,0,0.6)` → design-system §6.9 `--surface-overlay` 또는 인라인 유지

- **폰트** (design-system §1.1 + §4.2):
  - 12 (마감 정보 라벨 line 294/296, 폼 라벨 line 353/357, '수정/취소/삭제' 액션 버튼 line 321/331) → text-caption(12) leading-none (작은 컨테이너 시각 패딩, memory `feedback_text_caption_leading_none`)
  - 13 (이수 이력 카피 line 304/311, 폼 라벨 line 348, 입력 fontSize line 269) → text-label
  - 14 (모달 마감 dateToYmd line 295, submit button line 378) → text-body-sm 또는 **text-body (16) 격상 후보** (모바일 full-width CTA 노안 친화, OQ #3 검토)
  - 16 (모달 아바타 fontSize line 280) → text-body
  - 18 (모달 이름 line 285) → text-title

- **레이아웃**:
  - 모달 본문 wrapper flex column gap 16 (line 274)
  - 프로필 헤더 flex align gap 12 + 아바타 40x40 + 이름/직책 flex 1 + DdayBadge flexShrink 0
  - 마감 정보 박스 padding '12px 16px' radius 10
  - 이수 이력 리스트 flex column gap 6 + each row flex align justify
  - 등록/수정 폼 borderTop 1px var(--bd) paddingTop 16 + flex column gap 10
  - submit button width 100% height 44 (터치 마지노선 §1.1) radius 10
  - 바텀시트 maxHeight 90vh + padding '16px 16px 32px' + handle 32x4
  - 모바일 = 바텀시트 (slideUp 0.28s + 외부 오버레이 onClick close + 내부 stopPropagation) / 데스크톱 = 우측 패널 인라인 (오버레이 없음, EducationEditPanel 직접 렌더)
  - 데스크톱 우측 패널 fallback (selectedItem null) flex center

**[W5 — TSX 변환 verify checklist]**

- W2~W4 모든 sketch 의 className/style 인라인 grep 추출 + verbatim 인용 (memory `feedback_planner_prompt_sketch_verbatim`)
- 비즈 anchor 시그니처 1 byte 변경 0 verify gate — useQuery `['education']` / useMutation 3종 / educationApi 4종 / calcNextDeadline / TITLE_ORDER + titleRank / D-day 임계치 30·0 + 라벨 / role 그룹핑 라벨 / canEdit / toast 카피 5종 / 빈/오류 카피 / @keyframes blink + slideUp
- 28-splash W5 + 17-annual-plan W5 의 12-섹션 구조 mirror — 산출 파일 헤더 / OQ LOCKED 정리 / Tailwind 매핑 표 / 비즈 anchor 보존 verify / negative gate / positive gate / scope / build / 메모리 룰 cross-ref
- D-day status 토큰 매핑 verify (OQ #2 LOCKED) — `bg-safe-bg text-safe` / `bg-warning-bg text-warning` / `bg-danger-bg text-danger`, status- prefix 없음
- role 그룹핑 / titleRank / canEdit 시그니처 무변 verify (memory `project_inspection_completion_rule` 일반화)
- IconChevronLeft → Lucide ChevronLeft size={20} 교체 verify (OQ #5 LOCKED 시) + lucide-react import 추가
- submit button 그라데이션 (OQ #3 LOCKED 시) verify — `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 또는 `bg-safe-bar` solid
- 빈/오류 아이콘 추가 (OQ #4 LOCKED 시) verify — Lucide `GraduationCap` (빈) + `AlertCircle` (오류) 또는 무 유지

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

design-system.md (`cha-bio-safety/docs/redesign-context/23-education/design-system.md`, v0.1.1, 기준 커밋 c8bfa86) 의 §1.1 / §1.2 / §1.3 / §6 (부분 적용) / §7 (Iconography) / §7.1 (Lucide) 본문을 각각 별도 fence 블록에 verbatim 박제. §6 + §7 은 부분 적용 1줄 메타 동반.

## §3.1 design-system §1.1 노안 친화 (verbatim)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

**적용 메타 (23-education)**: EducationPage 의 현재 fontSize 매핑 — 12 (배지/메타/폼 라벨/액션 버튼/마감 라벨 다수, §1.1 마지노선) / 13 (직책/sectionLabel/inputStyle/이수 이력) / 14 (오류/빈 보조/마감 dateToYmd/submit) / 15 (데스크톱 sectionLabel) / 16 (이름/빈 제목/모바일 타이틀, §1.1 본문 마지노선) / 18 (모달 이름). 9·10·11px 위반 0건. 단 모바일 full-width CTA / 데스크톱 우측 fallback / 빈 상태 보조 / 오류 카피 14 → **text-body (16) 격상 후보** (노안 친화 강화 — OQ #3 검토). 터치 마지노선 44px = 모바일 back button 44x44 + right spacer 44 + submit button height 44 + 모바일 다운로드 없음 (보수교육 페이지에 다운로드 버튼 없음). 모바일 헤더 height 48 = §1.1 룰 일치 (chrome 룰 §2 모바일 헤더 48 일관).

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

**적용 메타 (23-education)**: 정보 위계 — 카드 이름 16/700 (var(--t1)) → 직책 13/400 (var(--t2)) → 하단 메타 12/400 (var(--t3)) 3 단계 명확. D-day 배지 = 빠른 식별 색 (safe/warning/danger) — §1.4 상태 색 의미 룰 + memory `feedback_inspection_unresolved_color` 일반화 일치. 카드 경계 — selected `1.5px solid var(--acl)` (데스크톱 활성 강조) / 평시 `1px solid var(--bd)` 명도 차이로 카드 식별. 장식 0건 (인라인 그라데이션 없음, submit button 만 §6.4 후보).

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

**적용 메타 (23-education)**: 데스크톱 = 좌/우 50:50 분할 마스터-디테일 (line 501~534, flex 1 양쪽) → "데스크톱이 빽빽한 건 레이아웃이 책임진다" 룰 100% 일치. 모바일 = 단일 컬럼 + 바텀시트 — 동일한 EducationEditPanel 컴포넌트 공용. 폰트 13 (모바일 sectionLabel) / 15 (데스크톱 sectionLabel) 1줄 차이는 §1.3 절대 룰 미위반 영역 — sectionLabel 자체는 group 레벨 라벨이라 데스크톱 가독성 강화로 절충. 단 OQ #3 default = 격상 검토.

## §3.4 design-system §6.4 Backgrounds & Gradients (verbatim)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

**적용 메타 (23-education)**: 보수교육 페이지의 submit button 은 현재 solid `var(--acl)` (line 377) → **§6.4 CTA 그라데이션 적용 후보** — `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 통일. OQ #3 default OK (그라데이션 적용). 27-login W1 OQ #1 + 14-reports W1 OQ #1/#3 + 16-workshift W1 OQ #1 + 17-annual-plan W1 OQ #1 모두 그라데이션 default 일관 + design-system §6.4 CTA 그라데이션 룰. 그라데이션 색은 design-system 룰 (#1d4ed8, #0ea5e9) 우선 — 17-annual-plan default 였던 (#1e40af, #3b82f6) 와 다름. 28-splash W1 OQ #1 은 정반대 (`bg-safe-bar` solid 채택, 그라데이션 폐기) 였음 — 23-education 은 design-system §6.4 룰 우선 (저장/CTA 버튼 = 그라데이션) 적용. 단 사용자 컨펌으로 변경 가능 — OQ #3 명시. 그 외 모든 배경 = surface 토큰 단색 — EducationPage 의 모든 인라인 var(--bg)/var(--bg2)/var(--bg3) 단색 일치 (그라데이션 0건 확인).

## §3.5 design-system §6.6 Animation (verbatim)

```
### 6.6 Animation (최소화)

업무 도구 톤 — 화려한 모션 금지.

| 대상 | 트랜지션 |
|---|---|
| 모달/시트 진입 | `transform: translateY(100%)→0`, `cubic-bezier(0.32,0.72,0,1)`, 0.26s |
| 대시보드 카드 stagger | `slideUp .28s ease-out`, 0.06s 간격 |
| 상태 dot (수신반 이력) | `blink 2s ease-in-out infinite` |
| 일반 트랜지션 | `all .13s` 또는 `border-color .15s, transform .15s` |
```

**적용 메타 (23-education)**: EducationBottomSheet animation `slideUp 0.28s ease-out both` (line 406) = design-system §6.6 "대시보드 카드 stagger" 룰의 슬라이드업 0.28s 일치. 모달/시트 진입의 cubic-bezier(0.32,0.72,0,1) 0.26s 와는 다른 ease-out 채택 — 현재 코드 보존 (변경 금지). SKELETON_STYLE animation `blink 2s ease-in-out infinite` (line 57) = §6.6 "상태 dot (수신반 이력)" 룰 일치 — 1 byte 변경 금지. 화려한 모션 0건. 단 @keyframes slideUp 의 정의는 글로벌 (src/index.css) 가정 — 17-annual-plan / 28-splash 와 동일 패턴.

## §3.6 design-system §7 Iconography 미적용 메타 + §7.1 Lucide (verbatim)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

**적용 메타 (23-education)**: EducationPage 본문에 이모지 0건 — `feedback_tsx_wave_emoji_dot_gap` 룰 일치 (28-splash 의 ⋮ ⎋ 특수 글리프 예외 케이스 없음). 현재 모바일 헤더 back button 의 IconChevronLeft 인라인 SVG (line 12~18, polyline points "15 18 9 12 15 6" strokeWidth 2 strokeLinecap+strokeLinejoin round) → **Lucide `ChevronLeft size={20} color="var(--t2)"` 교체 후보** (§7.4 "뒤로가기: ChevronLeft" 명시 + 16-workshift W1 OQ #2 ChevronLeft Lucide 교체 LOCKED + 17-annual-plan W1 OQ #4 동일 LOCKED). size=20 유지 (§7.1 16/20/24 3 종 중 20 일치). OQ #5 default 답 = 교체 OK. **§7.3 상태/결과 아이콘** = 현재 빈/오류 상태 아이콘 0건 — 추가 검토 후보 (Lucide `GraduationCap` 보수교육 의미 / `AlertCircle` 오류 — OQ #4 default 무 유지, 17-annual-plan + 16-workshift W1 빈/오류 상태 아이콘 무 일관). **§7.2 카테고리 → Lucide 아이콘 매핑** = 보수교육 페이지는 점검 카테고리 카드 시스템 아님 → **미적용 1줄 메타**. **§6.1 Progress Color Rule** / **§6.2 Stat Card Number Color** / **§6.3 카테고리 카드** = 보수교육 페이지에 진척률 도넛/통계 카드/카테고리 카드 모두 없음 → **미적용 1줄 메타** (memory `feedback_tsx_wave_stat_card_drift` 룰 일치).

---

# §4. 02+06 chrome 통일 룰 적용 여부

`inspection-modal-chrome-rules.md` (cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md) 를 읽고 23-education 의 chrome 적용 여부 정리.

**23-education 페이지는 점검 페이지 시리즈가 아닌 소방안전관리자 보수교육 관리 페이지 → chrome 룰 자체는 직접 적용 X.** 단, 다음 3가지 패턴은 mirror 검토:

1. **헤더 배경 토큰** — 모바일 자체 헤더 (line 541~548) 의 배경 현재 `var(--bg2)` (= `--surface-raised`, 다크 `#1a1f27`). chrome 룰 §2.1 의 `bg-surface-page` 통일 룰 vs raised 유지.
   - **default: raised 유지** (16-workshift W1 OQ #2 LOCKED + 17-annual-plan + 02 InspectionPage + 28-splash 4 페이지 일관 패턴). 데스크톱은 자체 헤더 없음 — 글로벌 AppHeader 가 페이지 제목 표시 (line 504 코멘트 "페이지 제목은 App.tsx 헤더에서 표시").
   - § 7 OQ 후보 = OQ #1.

2. **back button 패턴** — 모바일만 (line 549~560), 44x44 background none border none cursor pointer flex center color var(--t2) + IconChevronLeft size={20} var(--t2). chrome 룰 §7.2 의 `w-8 h-8 bg-surface-sunken border-border-default` 패턴과 다른 케이스 (현재 44x44 명시 — design-system §1.1 터치 타겟 44px 룰 일치 + memory `feedback_tailwind_w8_h8_is_48px` 함정 회피 — `w-8` = 48px override 이므로 44x44 의도면 `w-11 h-11` 또는 `w-[44px] h-[44px]` arbitrary 필수). 데스크톱은 글로벌 AppHeader 가 처리 (back button 자체 추가 불필요).

3. **BottomNav 숨김 / AppHeader 표시** — App.tsx 실측:
   - **모바일**: `/education` ∈ `MOBILE_NO_NAV_PATHS` (App.tsx line 71) → 모바일 BottomNav **숨김** — sketch 시 nav placeholder 그릴 필요 없음. 자체 헤더만 (line 541~565) 단독.
   - **데스크톱**: `/education` ∉ `DESKTOP_NO_NAV_PATHS` (App.tsx line 74, `['/', '/login']` 만 등재) → 데스크톱 BottomNav (사이드바) **표시**.
   - **데스크톱 글로벌 AppHeader**: `/education` ∉ `DESKTOP_HEADER_HIDE_PATHS` (App.tsx line 77, `['/elevator', '/div', '/floorplan', '/workshift']` 만 등재) → 글로벌 AppHeader **표시**. `PAGE_TITLES` (App.tsx line 95) `'/education': '보수교육'` 등재 → 글로벌 AppHeader 가 '보수교육' 타이틀 렌더.
   - → **데스크톱 = 글로벌 AppHeader + 좌측 사이드바 BottomNav + 자체 좌/우 분할 본문 3 영역 모두 표시.** 17-annual-plan 과 동일 패턴 (글로벌 AppHeader 데스크톱 표시) / 16-workshift 와는 다름 (16-workshift 는 데스크톱 글로벌 AppHeader 숨김 `/workshift` ∈ DESKTOP_HEADER_HIDE_PATHS).

**실측 결과 (App.tsx 본문 grep, drift 없음):**

```
line 33: const EducationPage = lazy(() => import('./pages/EducationPage'))
line 71: MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']
line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']                                  // /education 미등재 → 데스크톱 BottomNav (사이드바) 표시
line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']  // /education 미등재 → 데스크톱 글로벌 AppHeader 표시
line 95: '/education': '보수교육'                                                 // PAGE_TITLES 등재
line 288: <Route path="/education" element={<Auth><EducationPage /></Auth>} />
```

**핵심 시사점:**

- 모바일: 자체 헤더만 (line 541~565, height 48 + back button 44x44 + 타이틀 + right spacer 44), BottomNav 숨김 → sketch 시 nav placeholder 그릴 필요 없음
- 데스크톱: **글로벌 AppHeader 표시** + 자체 헤더 없음 + 사이드바 BottomNav 표시 → sketch 시 데스크톱 시안 상단에 글로벌 AppHeader 영역 + 좌측 사이드바 영역 모두 인지 필요. 17-annual-plan 와 동일 패턴, 16-workshift 와는 다름 (16-workshift 는 데스크톱 글로벌 AppHeader 숨김).

본 wave + W2~W5 모두 `App.tsx` 손대지 않음 (§6 negative rule).

---

# §5. 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건. 28-splash W1 (260522-209) + 17-annual-plan W1 (260521-wmq) + 16-workshift W1 (260521-sjj) + 27-login W1 (260521-c6p) 의 10건 + EducationPage 특화 2건 (`feedback_inspection_unresolved_color` D-day 임계치 status 토큰 일반화 + `project_inspection_completion_rule` role 그룹핑·titleRank·canEdit source of truth 일반화). 각 룰은 슬러그 + 요약 + Why + How (23-education 컨텍스트) 4 항목.

### 룰 1 — feedback_design_sketch_first
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- **Why**: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적. 디자인 작업의 핵심 룰.
- **How to apply (23-education)**: W3 직원 교육 카드 크기 (현재 padding 16 borderRadius 12 minHeight 80 + 아바타 32x32 + gap 12) / W4 모달 폼 spacing (현재 wrapper gap 16, 등록 폼 내부 gap 10, 마감 박스 padding `12px 16px`, 이수 이력 row padding `8px 12px`, submit button height 44) 조정도 spacing 손볼 거 있으면 `sketch-wave-3-staff-card.html` / `sketch-wave-4-edit-modal.html` 먼저 보여주고 사용자 컨펌. "카드 좀 크게/모달 좀 작게" 인라인 변경 직행 금지.

### 룰 2 — feedback_redesign_sketch_rule_enforcement
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- **Why**: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- **How to apply (23-education)**: 데스크톱 selected 카드 border `1.5px solid var(--acl)` (line 120) 은 **accent** 색 (활성 강조) — status 임계치 아님. `border-status-safe-bar` 같은 위험 색 사용 금지. 단 **D-day 배지는 임계치 status 토큰 사용 정당함** (룰 11 — 임계치 = status 토큰 일반화 룰). DdayBadge 의 safe/warning/danger 는 §6.2 negative rule 의 예외가 아니라 §1.4 상태 색 의미 룰의 정상 적용 케이스.

### 룰 3 — feedback_sketch_realistic_data
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- **Why**: sketch 작성 시 "보수교육" 같은 타이틀이나 그룹 라벨 '소방안전관리자' 등을 임의 변경하면 코드 변경 wave 가 deviation 으로 잡힘.
- **How to apply (23-education)**: 카피 verbatim — '보수교육' (모바일 헤더 타이틀 line 562), '소방안전관리자' / '소방안전관리 보조자' (그룹 라벨 line 486/492), '교육 이력 없음' / '이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.' (빈 상태 line 477/478), '교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.' (오류 line 472), '선임일 미등록' / '첫 실무교육' / '보수교육' (calcNextDeadline label line 25/29/32), '마지막 이수: ... (실무/보수)' (line 166), '다음 마감: ... (label)' (line 177/180), `D-${dday}` / `D+${Math.abs(dday)} 초과` (DdayBadge label line 69/73/77), '좌측에서 직원을 선택하세요' (데스크톱 우측 fallback line 528), '이수 기록 등록' / '이수일 수정' (폼 라벨 line 349), '저장 중...' / '수정 완료' / '이수일 기록' (submit button line 383), '실무교육 (최초)' / '보수교육' (select option line 369/370), '수정' / '취소' / '삭제' (액션 버튼 line 324/335), '다음 마감' (모달 마감 박스 라벨 line 294), '이수 이력' (모달 이수 이력 라벨 line 304), '이수일' / '교육 유형' (폼 inputType 라벨 line 353/357), toast.success 3종 + toast.error 2종 (line 220/230/240 + 223/233 + 243). 시안에서 변경 금지.

### 룰 4 — feedback_planner_prompt_sketch_verbatim
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
- **Why**: planner 가 sketch 의 토큰명 (예: `bg-surface-raised`) 을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용.
- **How to apply (23-education)**: W5 TSX 변환 wave 진입 직전 `sketch-wave-2~4.html` 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → `wave-5-tsx-conversion-checklist.md` 안에 verbatim 인용. 특히 D-day 배지 rgba 정확히 — `rgba(34,197,94,0.12)` (safe) / `rgba(245,158,11,0.15)` (warning) / `rgba(239,68,68,0.15)` (danger), 모바일 헤더 height 48 + back button 44x44, 카드 borderRadius 12 padding 16 minHeight 80, inputStyle borderRadius 9 padding '10px 12px' border '1px solid var(--bd2)', submit button height 44 borderRadius 10 + bg var(--acl) (또는 그라데이션 OQ #3), 바텀시트 borderRadius '16px 16px 0 0' + maxHeight 90vh + padding '16px 16px 32px', animation `slideUp 0.28s ease-out both` + `blink 2s ease-in-out infinite`, SKELETON height 88, 아바타 32x32 (카드) / 40x40 (모달 헤더), 핸들 32x4. 추측 토큰명 사용 시 deviation 유발.

### 룰 5 — feedback_tailwind_token_class_pattern
- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지).
- **Why**: 11-div TSX v3 hotfix(4ce707e) 사고 — `status-` prefix 가 tailwind.config 에 없어서 class 안 먹음. `bg-safe-bar` 가 올바른 패턴.
- **How to apply (23-education)**: D-day 배지 status 토큰 매핑 → `bg-safe-bg text-safe` / `bg-warning-bg text-warning` / `bg-danger-bg text-danger` (status- prefix 없음). `bg-status-safe-bg` 사용 시 W5 verify FAIL. submit button → `bg-accent` solid 또는 `bg-safe-bar` solid 또는 §6.4 그라데이션 (OQ #3) — 토큰 prefix 동일 룰 적용. 모바일 헤더 back button IconChevronLeft → Lucide `ChevronLeft size={20}` prop 사용 (OQ #5) — className 으로 `w-5 h-5` 금지 (실측 `w-5` = tailwind.config override 확인 필수).

### 룰 6 — feedback_tailwind_w8_h8_is_48px
- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- **How to apply (23-education)**: 모바일 back button 44x44 (line 552) → `w-8 h-8` 사용 시 **48x48 (1.09배 확대 사고)** — `w-11 h-11` (44px, tailwind 기본 spacing 룰 일치) 또는 `w-[44px] h-[44px]` arbitrary 필수. right spacer 44 동일. 카드 아바타 32x32 (line 131) → `w-7 h-7` (32px override) 또는 `w-[32px] h-[32px]` arbitrary. 모달 아바타 40x40 (line 277) → `w-10 h-10` (40px tailwind 기본) 또는 `w-[40px] h-[40px]`. submit button height 44 = `h-11` (또는 `h-[44px]`). 바텀시트 handle 32x4 → `w-7 h-1` 또는 `w-[32px] h-[4px]`. SKELETON height 88 = `h-[88px]` arbitrary 필수 (tailwind 기본 `h-22` 없음). 인라인 padding 14 / 16 등은 `p-4` (16px) / `px-4 py-3.5` 매핑 가능 — 단 tailwind.config spacing 확인 후 적용.

### 룰 7 — feedback_text_caption_leading_none
- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 헤더 토글/배지/칩 작은 영역은 `leading-none` 명시.
- **Why**: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- **How to apply (23-education)**:
  - D-day 배지 fontSize 12 (padding `2px 8px`, h ≈ 18~22px) → `text-caption font-bold leading-none` (작은 컨테이너 시각 패딩 방지)
  - 카드 하단 메타 fontSize 12 (마지막 이수 / 선임일 미등록 / 다음 마감 / label) → `text-caption leading-none`
  - 마감 정보 라벨 fontSize 12 (line 294) + (label) fontSize 12 (line 296) → `text-caption leading-none`
  - 폼 라벨 fontSize 12 (이수일 / 교육 유형 line 353/357) → `text-caption font-bold leading-none`
  - 액션 버튼 fontSize 12 (수정/취소 line 321, 삭제 line 331, padding `4px 10px` h ≈ 24~28px) → `text-caption leading-none`
  - DdayBadge 외곽 padding `2px 8px` h ≈ 18px → leading-none 필수

### 룰 8 — feedback_tsx_wave_emoji_dot_gap
- **요약**: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- **Why**: sketch 의 `🎯` `⬇` 같은 이모지/특수문자 글리프가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 도 자동 적용 안 됨.
- **How to apply (23-education)**: EducationPage 본문에는 이모지 0건 (인라인 SVG ChevronLeft 만 — 아이콘 분기 아님). W2~W4 sketch 진입 시 이모지/특수문자 절대 도입 금지 (negative gate). 단 W5 진입 시 sketch HTML 에 이모지/dot span 추가/제거 분기 negative gate 유지. 빈/오류 상태 아이콘 추가 (OQ #4 Lucide `GraduationCap` / `AlertCircle`) 시 점검 페이지 dot span 룰과 별개 — Lucide 아이콘은 이모지 아님. 28-splash 의 ⋮ ⎋ 특수 글리프 예외 케이스는 23-education 에는 해당 없음.

### 룰 9 — feedback_tsx_wave_stat_card_drift
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- **How to apply (23-education)**: 보수교육 페이지에 Stat Card (28px display 숫자) 없음 → §6.2 Stat Card Number Color 룰 미적용. **§6.3 카테고리 카드 룰 미적용** (보수교육 페이지는 점검 카테고리 카드 시스템 아님). 단 sketch 새 패턴 (예: D-day 배지 3 임계치 매트릭스 / canEdit 분기 매트릭스 / isEditMode 분기 매트릭스 / `!hasRecords && !isEditMode` select disabled 분기 매트릭스) 은 W5 진입 시 verbatim 인용 필수. source EducationPage.tsx 의 인라인 rgba (`rgba(34,197,94,0.12)` 등) 가 sketch 의 새 토큰 패턴 (`bg-safe-bg text-safe`) 을 덮어쓰지 않도록 명시 필수.

### 룰 10 — feedback_avoid_premature_confirmation
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- **How to apply (23-education)**: 본 인덱스 작성 완료 후 "§7 OQ 5건 컨펌 부탁" 보고만. "wave 1 완벽 / W2 진입 가능" 같은 자신감 표현 금지. W2~W5 진입 시점도 사용자 컨펌 명시 받은 후에만. sketch 산출 후 "거의 일치 / 잘 됐다" 표현 금지. 특히 D-day 배지 임계치 색 시각 결과 (safe 녹색 / warning 노랑 / danger 빨강) 는 사용자 판단 영역.

### 룰 11 — feedback_inspection_unresolved_color (★ 23-education 특화 — D-day 임계치 status 토큰 일반화)
- **요약**: 미조치 색 = status-fire (주황). 메인 칩 fire / 상세 danger inconsistent. 사용자 인지 = 칩의 fire 색.
- **Why**: 점검 페이지에서 미조치 칩이 fire (주황) 으로 표시되어 사용자가 "위험 임계치 = 칩 색" 패턴 학습. 23-education 의 DdayBadge 도 동일 패턴 — 임계치 30 / 0 + 라벨 'D-${dday}' / 'D+${dday} 초과' 의 색 분기 (safe/warning/danger) 가 사용자 인지의 source of truth.
- **How to apply (23-education)**: DdayBadge 임계치 (>30 / 0~30 / <0) 는 운영 의미 — **safe (충분히 남음, 31일 이상) / warning (마감 임박, 0~30일) / danger (마감 초과, 음수)**. 미조치 점검 fire 칩과 다른 케이스지만 "임계치 = status 토큰" 룰 일반화. status- prefix 없음 룰과 같이 적용 → `bg-safe-bg + text-safe` / `bg-warning-bg + text-warning` / `bg-danger-bg + text-danger`. **임계치 30 / 0 + 음수 라벨 'D+${Math.abs(dday)} 초과' 1 byte 변경 금지** (OQ #2 LOCKED 후 W3 sketch + TSX 변환 양쪽 동일 적용). 17-annual-plan + 28-splash 의 비즈 anchor 1 byte 0 룰 일반화.

### 룰 12 — project_inspection_completion_rule (★ 23-education 특화 — role 그룹핑·titleRank·canEdit source of truth 일반화)
- **요약**: 점검 완료 = normal | caution | (bad+resolved). isCpCompleted 가 source of truth. 새 화면/통계는 이 룰 강제.
- **Why**: 점검 완료 정의가 페이지별로 일관되지 않으면 사용자 인지/통계 모두 깨짐. isCpCompleted 헬퍼 = source of truth 룰의 일반화.
- **How to apply (23-education)**: **role admin/assistant 그룹핑 → '소방안전관리자' / '소방안전관리 보조자' 라벨 (line 486/492) + TITLE_ORDER `{ 주임: 0, 대리: 1, 기사: 2 }` (line 49) + titleRank fallback 99 (line 50) + canEdit = role === 'admin' || id === cardStaffId (line 432~435)** — 모두 운영 룰 source of truth. 점검 완료 isCpCompleted 룰의 일반화. UI/시안에서 그룹/정렬/권한 분기 변경 금지. assistant 가 다른 직원 카드 클릭해도 모달 안 열림 (canEdit false → onTap undefined, cursor default). 데스크톱 selected = isDesktop && id 일치 (line 447) — 데스크톱만 우측 패널 활성 시각 표시, 모바일 selected 무관. W3 sketch + W4 sketch + W5 TSX 변환 양쪽 동일 적용. 그룹 라벨 '소방안전관리자' 1 byte 변경 시 운영 룰 일관성 파괴.

---

# §6. negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **EducationPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/EducationPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src/pages/EducationPage.tsx` 결과 0 줄.
- **비즈 로직 시그니처 변경 금지** — `useQuery({ queryKey: ['education'], queryFn: educationApi.list })` / `useMutation` 3종 (create / update / delete) / `educationApi.list/create/update/delete` 4종 / `calcNextDeadline` / `TITLE_ORDER` + `titleRank` / `addMonths` + `addYears` + `differenceInCalendarDays` + `parseISO` / `fmtDate` + `dateToYmd` / `useAuthStore().staff` canEdit / `useIsDesktop` / `IconChevronLeft polyline points "15 18 9 12 15 6"` 모두 import/export 동일하게 유지. 본 wave + W2~W5 모두.
- **다른 페이지 (13-schedule / 14-reports / 27-login / 16-workshift / 15-daily-report / 17-annual-plan / 28-splash / 02 / 06 등) 영향 금지** — `git status` 에 23-education/ + .planning/quick/260522-gmp-* 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler` (디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler`. `npm run deploy` 는 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 배포만.
- **13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지** — 6 페이지 모두 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 23-education 도 동일 평면 배치 (`23-education/sketch-wave-N-{slug}.html`).
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` (line 71, `/education` 등재) + `DESKTOP_NO_NAV_PATHS` (line 74, `/education` 미등재) + `DESKTOP_HEADER_HIDE_PATHS` (line 77, `/education` 미등재 — 데스크톱 글로벌 AppHeader 표시) + `PAGE_TITLES` (line 95, `/education: '보수교육'` 등재) + `Route` (line 288) 모두 실측 확인됨. 본 wave + W2~W5 모두 `App.tsx` 손대지 않음.
- **★ D-day 임계치 시그니처 변경 금지** — `dday > 30` (safe → warning 경계, line 66) / `dday >= 0` (warning → danger 경계, line 70) / `dday < 0` (danger 분기, line 74) + 라벨 `D-${dday}` (safe + warning, line 69/73) / `D+${Math.abs(dday)} 초과` (danger, line 77) + 색 매핑 (`rgba(34,197,94,0.12)` + `var(--safe)` / `rgba(245,158,11,0.15)` + `var(--warn)` / `rgba(239,68,68,0.15)` + `var(--danger)`) 모두 1 byte 변경 금지 (memory `feedback_inspection_unresolved_color` 일반화 룰). status- 토큰 치환 (OQ #2 default OK) 시에도 임계치 30 / 0 + 라벨 verbatim 보존.
- **★ role 그룹핑 + titleRank + canEdit 시그니처 변경 금지** — admin → '소방안전관리자' (line 486) / assistant → '소방안전관리 보조자' (line 492) 라벨 + `TITLE_ORDER = { '주임': 0, '대리': 1, '기사': 2 }` (line 49) + `titleRank fallback 99` (line 50) + `canEdit = role === 'admin' \|\| id === cardStaffId` (line 432~435) 모두 운영 룰 source of truth — 1 byte 변경 금지 (memory `project_inspection_completion_rule` 일반화 룰).
- **★ educationApi 시그니처 변경 금지** — `list()` / `create({ staffId, education_type, completed_at })` / `update(id, { completed_at })` / `delete(id)` 4종 모두 보존. 특히 snake_case payload (`education_type`, `completed_at`) + camelCase props (`staffId`, `id`) 혼용 패턴 보존. 본 wave + W2~W5 모두 utils/api.ts 손대지 않음.
- **toast 카피 verbatim 5종 변경 금지** — '이수일이 기록되었습니다.' (line 220, create) / '이수일이 수정되었습니다.' (line 230, update) / '이수 기록이 삭제되었습니다.' (line 240, delete) / '이수 기록 저장에 실패했습니다.' (line 223/233, create+update onError) / 'e?.message ?? 삭제에 실패했습니다.' (line 243, delete onError).
- **빈/오류 상태 카피 verbatim 변경 금지** — '교육 이력 없음' / '이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.' / '교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.' / '좌측에서 직원을 선택하세요'.
- **calcNextDeadline label verbatim 변경 금지** — '선임일 미등록' (line 25) / '첫 실무교육' (line 29) / '보수교육' (line 32). 이 3 label 이 카드 하단 메타 + 모달 마감 정보 박스 양쪽에서 표시됨.
- **모바일 헤더 타이틀 '보수교육' (line 562) verbatim 변경 금지** — App.tsx PAGE_TITLES (line 95) 와 일치 필수.
- **@keyframes blink (SKELETON 0%/100% opacity 1 / 50% opacity 0.4, line 583~588) + @keyframes slideUp (0.28s ease-out both, design-system §6.6 룰) 보존** — 변경 시 SKELETON 깜빡임 + 바텀시트 진입 애니메이션 깨짐.
- **inputStyle 보존** — `width '100%' bg var(--bg3) borderRadius 9 padding '10px 12px' border '1px solid var(--bd2)' color var(--t1) fontSize 13 boxSizing border-box outline none fontFamily inherit minWidth 0 WebkitAppearance none appearance none` (line 266~271) — input + select 공통 객체. WebkitAppearance: 'none' + appearance: 'none' 은 iOS Safari select chevron 제거 anchor — 변경 시 모바일 시각 깨짐.
- **모바일 헤더 자체 렌더 보존 (line 541~565)** — height 48 + back button 44x44 + 타이틀 + right spacer 44. 데스크톱은 글로벌 AppHeader 가 처리 (line 504 코멘트 보존 필수).

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 5건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call). 단, "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

- **OQ #1**: 모바일 자체 헤더 배경 `var(--bg2)` (= `--surface-raised`, line 543) → chrome 룰 §2.1 `bg-surface-page` 통일 vs raised 유지?
  - **default 답: raised 유지** (16-workshift W1 OQ #2 LOCKED + 17-annual-plan + 02 InspectionPage + 28-splash 4 페이지 일관 패턴). 모바일 헤더 = `bg-surface-raised border-b border-border-default`. 데스크톱 자체 헤더 없음 — 글로벌 AppHeader 가 처리 (line 504 코멘트 보존). 본 OQ 적용 시 W2 sketch + TSX 변환 양쪽 동일 적용.

- **OQ #2**: D-day 배지 색 — 현재 rgba 인라인 + var() (`rgba(34,197,94,0.12)` + `var(--safe)` / `rgba(245,158,11,0.15)` + `var(--warn)` / `rgba(239,68,68,0.15)` + `var(--danger)`, line 66~77). status 토큰 매핑 (`bg-safe-bg` + `text-safe` / `bg-warning-bg` + `text-warning` / `bg-danger-bg` + `text-danger`) 치환?
  - **default 답: 토큰 치환 OK** — status- prefix 없음 룰 (memory `feedback_tailwind_token_class_pattern`). 17-annual-plan W1 OQ #2 + 28-splash W1 OQ #4 토큰 치환 default OK 일관. **임계치 30 / 0 + 라벨 'D-${dday}' / 'D+${Math.abs(dday)} 초과' 는 1 byte 변경 금지** (룰 11 + §6 negative rule). W3 sketch + TSX 변환 양쪽 동일 적용. 토큰 치환 후 시각 결과 (rgba alpha 0.12~0.15 vs tailwind status-bg 토큰의 alpha) 비교 필요 — 시각 차이 발생 시 사용자 컨펌 후 인라인 유지 또는 토큰 alpha 조정.

- **OQ #3**: submit button 현재 solid `var(--acl)` (line 377) → design-system §6.4 그라데이션 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 통일 vs solid 유지?
  - **default 답: 그라데이션 OK** (design-system §6.4 CTA 룰 + 14-reports / 16-workshift / 17-annual-plan W1 OQ #1 그라데이션 default 일관). 그라데이션 색은 design-system 룰 (#1d4ed8, #0ea5e9) 우선 — 17-annual-plan default 였던 (#1e40af, #3b82f6) 와 다름. 단 28-splash W1 OQ #1 LOCKED 는 정반대 (그라데이션 폐기 → `bg-safe-bar` solid 채택) — 23-education 은 design-system §6.4 "저장/CTA 버튼" 룰 우선. **사용자 컨펌 결과에 따라 그라데이션 vs `bg-safe-bar` solid 둘 중 LOCKED**. disabled 시 = `bg-surface-sunken text-text-tertiary cursor-not-allowed` (현재 opacity 0.6 + cursor default 일관). 그 외 데스크톱 selected 카드 border `1.5px solid var(--acl)` (line 120) → `border-2 border-accent` 토큰 치환 (1.5 → 2, design-system §4.3 매핑 일관, 17-annual-plan + 16-workshift 일관) — 본 OQ #3 와 같이 LOCKED.

- **OQ #4**: 빈/오류 상태 아이콘 추가 — 현재 텍스트만 (line 471~480, 빈 '교육 이력 없음' + 오류 '교육 현황을 불러오지 못했습니다'). Lucide `GraduationCap` (보수교육 페이지 의미) 또는 `BookOpen` (학습) 또는 `AlertCircle` (오류) 추가?
  - **default 답: 아이콘 무 유지** (현재 카피만 — 17-annual-plan + 16-workshift + 28-splash W1 빈/오류 상태 아이콘 무 일관). 단 시각 일관성 강화 옵션으로 빈 상태에 Lucide `GraduationCap size={48} color="var(--t3)"` (보수교육 의미) + 오류에 Lucide `AlertCircle size={48} color="var(--danger)"` (오류 의미) 추가 가능 — **사용자 컨펌으로 채택 가능**. 아이콘 추가 시 빈/오류 wrapper 의 gap 8 (line 476) 유지 + 아이콘 → 텍스트 순서.

- **OQ #5**: 모바일 헤더 back button IconChevronLeft 인라인 SVG (line 12~18, polyline points '15 18 9 12 15 6' strokeWidth 2 size 20) → Lucide `ChevronLeft size={20} color="var(--t2)"` 교체?
  - **default 답: 교체 OK** (16-workshift W1 OQ #2 ChevronLeft Lucide 교체 LOCKED + 17-annual-plan W1 OQ #4 동일 LOCKED + 28-splash W1 OQ #5 동일 + design-system §7.4 "뒤로가기: ChevronLeft" 명시 + §7.1 Lucide 사용 가능 룰). size=20 유지 (§7.1 16/20/24 3 종 중 20 일치). Lucide prop `size={20}` 사용 — className 으로 `w-5 h-5` 금지 (memory `feedback_tailwind_token_class_pattern`). lucide-react import 추가 (svg path 인라인 폐기). W2 모바일 chrome sketch + W5 TSX 변환 양쪽 동일 적용.

각 OQ 의 default 답은 사용자가 별 의견 없으면 이 답으로 진행할 것이라는 reasonable call. 단, "approved" 받기 전까지 W2 진입 금지.

---

## 자체 verify (작성 완료 후 본 인덱스가 통과해야 할 gate)

본 문서가 후속 wave 진입 자격을 갖췄는지 verify:

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. 7 헤더 존재 | `grep -c '^# §[1-7]' wave-1-index.md` | =7 |
| 2. sub-wave 분배 표 ≥4 | `grep -E '^\| W[2-5] \|' wave-1-index.md \| wc -l` | =4 |
| 3. 메모리 룰 unique ≥10 | `grep -oE 'feedback_[a-z_]+' wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 4. negative §6 안 wrangler + npm run deploy | `grep -c 'wrangler' wave-1-index.md` ≥1 & `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 |
| 5. src/** 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src/pages/EducationPage.tsx` | 0 lines |
| 6. OQ §7 ≥5 | `grep -cE 'OQ #[1-5]' wave-1-index.md` | ≥5 |
| 7. design-system fence ≥6 (open+close) | `grep -c '^```' wave-1-index.md` | ≥6 |

모두 PASS 시 본 인덱스가 W2 진입의 단일 진입점으로 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 5건 답변으로 받는다.

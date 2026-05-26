---
title: "26-staff-manage — W5 TSX 변환 verify checklist"
status: draft
created: 2026-05-26
quick_id: 260526-o3f
branch: redesign/26-staff-manage
source_tsx: cha-bio-safety/src/pages/StaffManagePage.tsx
source_tsx_lines: 530
sketches_referenced: [W2, W3, W4]
locked_decisions: "W1: 6 OQ default (a) x6 / W2~W4 sketch: 0 (markdown only) / W5 (본 wave): 0 (markdown only)"
sub_wave_count: 3   # W2 frame-guard-header / W3 staff-list / W4 modal-form-confirm
verify_gate_count: ">=22"
mirror_of: cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md
consumed_by: "26-staff-manage TSX 변환 wave executor (단일 atomic)"
---

# W5 — TSX 변환 verify checklist (26-staff-manage)

> 본 파일은 **sketch HTML 이 아님**. TSX 변환 wave executor 가 1-pass 로 적용할 verify gate + region mapping + LOCKED 룰 박제 markdown.
> source-of-truth: `cha-bio-safety/src/pages/StaffManagePage.tsx` (530 lines, admin 전용) + sketch-wave-2~sketch-wave-4.html 3개 + design-system.md v0.1.1 + wave-1-index.md.
> 24-checkpoints W6 (`cha-bio-safety/docs/redesign-context/24-checkpoints/wave-6-tsx-conversion-checklist.md`) 패턴 mirror — 구조 §1~§12 + 비즈 anchor 박스 + 3 sketch grep verbatim fence.
> 14-reports (700) / 15-daily-report (934) / 18-worklog (1216) / 23-education (591) / 28-splash / 24-checkpoints (693) 의 4i9 단일 atomic 패턴을 26-staff-manage (530) 에서도 자동 도달.

---

## §1 imports 매핑 (line 1~8) + Lucide 추가

현재 imports (TSX 변환 wave 에서 Lucide 추가):

| 영역 | 현재 (line) | 변환 후 처리 |
|---|---|---|
| react hooks | `useState, useEffect` from 'react' (line 1) | 동일 (보존) |
| router | `useNavigate` from 'react-router-dom' (line 2) | 동일 |
| react-query | `useQuery, useMutation, useQueryClient` from '@tanstack/react-query' (line 3) | 동일 |
| toast | `toast` from 'react-hot-toast' (line 4) | 동일 |
| store | `useAuthStore` from '../stores/authStore' (line 5) | 동일 (비즈 anchor) |
| api | `staffApi` from '../utils/api' (line 6) | 동일 (비즈 anchor) |
| hook | `useIsDesktop` from '../hooks/useIsDesktop' (line 7) | 동일 |
| type | `StaffFull, StaffUpdatePayload, Role` from '../types' (line 8) | 동일 |
| **추가 (Lucide)** | (없음) | `import { UserPlus } from 'lucide-react'` (OQ #6 default = (a)) |

**인라인 SVG 제거 대상 (line 11~20):**

| 함수 | line | Lucide 교체 |
|---|---|---|
| `IconUserPlus({ size, color })` | 11~20 | `<UserPlus size={N} color={color} />` 로 대체 후 함수 제거 |

**상수 보존 매트릭스 (line 22~354)** — TSX 변환 후 일부는 Tailwind class 로 흡수, 일부 잔존:

| 상수 | line | 변환 후 처리 |
|---|---|---|
| BottomSheet 함수 | 22~40 | 인라인 보존 (OQ #1 default = (a)) |
| DesktopModal 함수 | 42~57 | 인라인 보존 (OQ #1 default = (a)) |
| `INPUT_STYLE` / `LABEL_STYLE` | 60~67 | Tailwind 치환 검토 (text-body-sm + text-label) 또는 잔존 |
| `StaffFormState` + `EMPTY_STAFF_FORM` | 70~78 | 보존 (10 필드 verbatim, shiftOffset+shiftFixed 포함) |
| `SKELETON_STYLE` | 342~345 | 1 byte 변경 금지 (bg var(--bg3)/radius 12/height 64/blink) |
| `rankOfTitle` 정렬 함수 | 347~354 | 1 byte 변경 금지 (대리=0/주임=1/기사=2/기타=3) |

---

## §2 메인 함수 + 모달 컴포넌트 (line 81~315, 357~530) — hooks/state/handlers 1:1 verbatim

본 섹션은 **비즈 로직 0 byte 변경 강제** — sketch class 적용은 §3 JSX 영역에서만.

**StaffManagePage 메인 (line 357~530):**

```
hook/state (line 357~387):
  useNavigate()
  useAuthStore: { staff: me }
  useIsDesktop()
  useState: modal { open, mode, target } + replaceModal { open, target }

window.__openReplaceModal 훅 useEffect (line 365~368):
  useEffect(() => {
    (window as any).__openReplaceModal = (staff: StaffFull) => setReplaceModal({ open: true, target: staff })
    return () => { delete (window as any).__openReplaceModal }
  }, [])
  StaffModalContent line 292 호출: setTimeout(() => (window as any).__openReplaceModal?.(staff), 100)

admin 가드 useEffect (line 371~373):
  useEffect(() => {
    if (me?.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [me, navigate])

staffList useQuery (line 375~379):
  queryKey: ['staff-list']
  queryFn: staffApi.list
  staleTime: 30_000

staffList sort (line 380~383):
  (data ?? []).sort((a, b) => {
    const d = rankOfTitle(a.title) - rankOfTitle(b.title)
    return d !== 0 ? d : a.id.localeCompare(b.id)
  })

early return (line 385): if (me?.role !== 'admin') return null
ModalWrapper = isDesktop ? DesktopModal : BottomSheet (line 387)
```

**StaffModalContent (line 151~315):**

```
useState: form (StaffFormState, line 155~159) + confirmReset (line 160) + confirmDeactivate (line 161)
setField generic field setter (line 163~164)

createMutation (line 166~170):
  staffApi.create({ id, name, role, title, phone?, email?, appointedAt?, birthDate? })
  onSuccess: invalidate ['staff-list'] + toast.success('직원이 추가되었습니다') + onClose
  onError: toast.error('저장에 실패했습니다. 입력값을 확인해 주세요')

updateMutation (line 172~176):
  staffApi.update(staff!.id, data: StaffUpdatePayload)
  onSuccess: invalidate ['staff-list'] + toast.success('직원 정보가 수정되었습니다') + onClose
  onError: toast.error('저장에 실패했습니다. 입력값을 확인해 주세요')

resetPwMutation (line 178~182):
  staffApi.resetPassword(staff!.id)
  onSuccess: toast.success('비밀번호가 초기화되었습니다 (사번 뒷 4자리)') + setConfirmReset(false)
  onError: toast.error('비밀번호 초기화에 실패했습니다')

deactivateMutation (line 184~188):
  staffApi.update(staff!.id, { active: 0 })
  onSuccess: invalidate ['staff-list'] + toast.success('직원이 비활성화되었습니다') + onClose
  onError: toast.error('비활성화에 실패했습니다')

canSave (line 190): form.name.trim() !== '' && form.id.trim() !== ''
handleSave (line 192~200): mode 분기 + 10자리 정규식 검증 /^\d{10}$/
isBusy = createMutation.isPending || updateMutation.isPending (line 202)
```

**ReplaceModalContent (line 81~149):**

```
useQueryClient + state 2 (selectedId, submitting)
allStaff useQuery (line 87): ['staff-list'], staffApi.list
candidates 필터 (line 88):
  active === 1 && id !== oldStaff.id && shiftOffset === null && shiftFixed === null
shiftLabel 분기 (line 90~91):
  shiftFixed === 'day' → '평일 주간 고정'
  shiftOffset !== null → `3교대 (오프셋 ${shiftOffset})`
  else → '미설정'
handleReplace 2× staffApi.update 시퀀스 (line 93~114):
  1. staffApi.update(selectedId, { shiftOffset: oldStaff.shiftOffset, shiftFixed: oldStaff.shiftFixed })
  2. staffApi.update(oldStaff.id, { active: 0, phone: '', email: '', shiftOffset: null, shiftFixed: null })
  qc.invalidateQueries({ queryKey: ['staff-list'] })
  toast.success(`${oldStaff.name} → ${newStaff.name} 교체 완료`)
  toast.error(e.message || '교체 실패')
```

**StaffCard (모바일, line 318~339):**

```
props (staff, onEdit)
opacity 0.5 if staff.active === 0
8x8 dot: bg var(--safe) (active) / var(--t3) (inactive)
name fontSize 16 fw700 / title fontSize 12 / role 배지 fontSize 9 (line 327) / id JetBrains Mono
'수정 ▸' var(--acl) fontSize 12 (line 336)
```

---

## §3 JSX render 영역별 변환 (3 영역, 3 sub-wave 매핑)

### W2 — 외곽 wrapper + admin 가드 + style 태그 + 헤더 (frame-guard-header)

sketch classes: `desktop-frame`, `desktop-header`, `desktop-header-title`, `desktop-header-count`, `desktop-add-btn`, `mobile-header`, `mobile-header-count`, `guard-frame`, `guard-icon`, `guard-title`, `guard-desc`, `guard-code`, `skeleton-bar`, `keyframe-demo`, `kf-demo-blink`, `kf-demo-slideup`, `kf-demo-focus`, `icon-user-plus`

- **외곽 wrapper** (line 389~390): `flex column / bg var(--bg) / height 100% / overflow hidden`
  - Tailwind: `flex flex-col h-full overflow-hidden bg-surface-page`
- **style 태그** (line 391~395): keyframes `blink` + `slideUp` + focus `border-color var(--acl)` 인라인
  - 방침: `<style>` 태그 그대로 유지 또는 `tailwind.config.extend.keyframes` 이관 (blink+slideUp 의존 영역 잔존 시 유지)
- **데스크톱 헤더** (line 398~408): `flex / alignItems center / padding 12px 24px / borderBottom var(--bd)`
  - Tailwind: `hidden lg:flex items-center px-6 py-3 border-b border-border-default`
  - `class="desktop-header"` → `hidden lg:flex ...`
  - `class="desktop-header-title"` fontSize 14 fw700 → `text-body-sm font-bold text-text-primary`
  - `class="desktop-header-count"` fontSize 12 → `text-caption text-text-tertiary`
  - `class="desktop-add-btn"` height 36 → OQ #3 default 40 격상: `flex items-center gap-2 h-10 px-3 rounded-lg bg-accent-primary text-white text-label font-bold`
  - `<UserPlus size={16} color="#fff" />` (OQ #6 default, line 405)
- **모바일 헤더** (line 409~413): `flex / alignItems center / padding 8px 16px / flexShrink 0`
  - Tailwind: `flex lg:hidden items-center px-4 py-2`
  - `class="mobile-header"` → `flex lg:hidden ...`
  - `class="mobile-header-count"` fontSize 12 var(--t3) → `text-caption text-text-tertiary`

### W3 — 직원 카드 리스트 + 테이블 + FAB (staff-list)

sketch classes: `card-list`, `staff-card`, `staff-card inactive`, `card-top`, `card-dot active`, `card-dot inactive`, `card-name`, `card-title-text`, `card-role-badge admin`, `card-role-badge assistant`, `card-id`, `card-action`, `card-content`, `data-table`, `table-wrap`, `desktop-content`, `name-cell`, `id-cell`, `title-cell`, `role-badge admin`, `role-badge assistant`, `phone-cell`, `status-cell status-active`, `status-cell status-inactive`, `status-dot`, `action-cell`, `row-inactive`, `skeleton-bar`, `skeleton-wrap`, `state-empty`, `state-error`, `mobile-fab-wrap`, `mobile-fab`, `icon-user-plus-18`, `mobile-empty`, `empty-title`, `empty-desc`

- **콘텐츠 wrapper** (line 416): `flex 1 / overflow auto / minHeight 0`
  - Tailwind: `flex-1 overflow-auto min-h-0`
- **4 상태 분기:**
  - skeleton 3개 (line 417~422): `class="skeleton-bar"` — `SKELETON_STYLE` (bg var(--bg3)/radius 12/height 64/blink)
  - error (line 424~427): `class="state-error"` — `flex items-center justify-center h-full text-text-secondary text-body-sm`
  - 데스크톱 empty (line 446~448): `class="state-empty"` (colSpan 7)
  - 모바일 empty (line 491~496): `class="mobile-empty"` + `class="empty-title"` fontSize 16 fw700 + `class="empty-desc"` fontSize 12
- **데스크톱 테이블** (line 431~486): `class="data-table"` / `class="table-wrap"` / `class="desktop-content"`
  - 7 컬럼: 이름/사번/직책/역할/연락처/상태/액션
  - `class="role-badge admin"` fontSize 10 fw700 → `text-caption leading-none` (OQ #5, line 461)
  - `class="role-badge assistant"` fontSize 10 fw700 → `text-caption leading-none`
  - `class="id-cell"` JetBrains Mono → `text-caption font-mono`
  - `class="status-cell status-active"` / `class="status-cell status-inactive"` fontSize 11 fw600 → `text-caption leading-none` (OQ #5, line 471)
  - `class="status-dot"` 6x6 dot → arbitrary `w-[6px] h-[6px]` (w-8=48px 함정 회피)
  - `class="action-cell"` '수정' fontSize 12 fw700 → `text-caption font-bold`
  - row hover (line 453~454): `hover:bg-surface-sunken` (§6.5)
- **StaffCard 모바일** (line 489~501, 318~339): `class="staff-card"` / `class="staff-card inactive"`
  - `class="card-dot active"` / `class="card-dot inactive"` 8x8 dot → `w-[8px] h-[8px]` (w-8=48px 함정 — `feedback_tailwind_w8_h8_is_48px`)
  - `class="card-name"` fontSize 16 fw700 → `text-body font-bold text-text-primary`
  - `class="card-title-text"` fontSize 12 → `text-caption text-text-secondary`
  - `class="card-role-badge admin"` / `class="card-role-badge assistant"` fontSize 9 → `text-caption leading-none` (OQ #5, line 327)
  - `class="card-id"` JetBrains Mono → `text-caption font-mono text-text-tertiary`
  - `class="card-action"` '수정 ▸' fontSize 12 var(--acl) → `text-caption leading-none text-accent-primary` (`feedback_text_caption_leading_none`)
- **모바일 FAB** (line 505~513): `class="mobile-fab-wrap"` / `class="mobile-fab"`
  - `position: sticky / bottom: 0` 보존
  - `paddingBottom: calc(16px + var(--sab))` 1 byte 변경 금지 (iOS PWA safe-area)
  - height 52 → `h-[52px]` arbitrary
  - `<UserPlus size={18} color="#fff" />` (OQ #6 default, 18 보존, line 509)

### W4 — 모달 wrapper + 폼 + confirm 3종 + ReplaceModal (modal-form-confirm)

sketch classes: `sheet-overlay`, `sheet-panel`, `sheet-handle-row`, `sheet-handle`, `sheet-title`, `modal-overlay`, `modal-panel`, `modal-title`, `form-body`, `form-body-wide`, `form-field`, `form-label`, `form-required`, `form-sub-label`, `form-input`, `form-input mono`, `form-input disabled`, `form-input mono disabled`, `role-toggle`, `role-btn desktop selected`, `role-btn desktop unselected`, `role-btn mobile selected`, `role-btn mobile unselected`, `confirm-reset-link`, `confirm-reset-box`, `confirm-reset-text`, `confirm-deactivate-box`, `btn-save`, `btn-save disabled`, `btn-cancel`, `btn-deactivate`, `btn-deactivate-confirm`, `btn-row`, `action-row`, `btn-replace`, `btn-replace-confirm`, `btn-replace-confirm disabled`, `replace-info-box`, `replace-info-sub`, `replace-no-candidates`, `replace-select`, `small-btn cancel`, `small-btn confirm-init`, `small-btn-row`

- **BottomSheet** (line 22~40): `class="sheet-overlay"` / `class="sheet-panel"` / `class="sheet-handle-row"` / `class="sheet-handle"` / `class="sheet-title"`
  - 인라인 보존 (OQ #1 default = (a)) — overlay `rgba(0,0,0,0.6)` / bg `var(--bg2)` / radius `16px 16px 0 0`
  - slideUp 0.28s — `<style>` keyframes 의존
  - handle bar 32x4: `class="sheet-handle"` → `w-[32px] h-[4px] rounded-full bg-border-strong` (w-8=48px 함정 회피)
- **DesktopModal** (line 42~57): `class="modal-overlay"` / `class="modal-panel"` / `class="modal-title"`
  - 인라인 보존 — overlay `rgba(0,0,0,0.5)` / width 440 / radius 12 / boxShadow `0 8px 32px rgba(0,0,0,.18)`
- **폼 필드 (line 207~253):**
  - `class="form-field"` + `class="form-label"` + `class="form-required"` (빨간 *) + `class="form-input"`
  - 이름 (line 207~210): `form-field` / `form-required` / placeholder '홍길동'
  - 사번 (line 211~214): `form-input mono` + `form-input mono disabled` / placeholder '0000000000' / inputMode 'numeric' / edit 시 disabled
  - 연락처 (line 215~218): type 'tel' / placeholder '010-0000-0000'
  - 이메일 (line 219~222): type 'email' / placeholder 'email@example.com'
  - 입사일 (line 223~234): `form-sub-label` fontSize 10 → `text-caption` (OQ #5) / readonly / placeholder '사번 입력 시 자동 채워짐' / `(사번 앞 8자리에서 자동)` 라벨
  - 생년월일 (line 235~238): `form-sub-label` fontSize 10 → `text-caption` (OQ #5) / type 'date' / `(휴가신청서 자동 채움)` 라벨
  - 직책 (line 239~242): placeholder '소방안전관리자'
  - 역할 toggle (line 243~253): `class="role-toggle"` / `class="role-btn desktop selected"` / `class="role-btn desktop unselected"` / `class="role-btn mobile selected"` / `class="role-btn mobile unselected"` / height 36 → OQ #3 default 40(데스크톱)/44(모바일) 격상 / `(['admin', 'assistant'] as Role[])` / 라벨 '관리자'/'보조자'
- **confirmReset (line 255~274):**
  - `class="confirm-reset-link"` var(--warn) underline / `class="confirm-reset-box"` `rgba(245,158,11,.08)` / `class="confirm-reset-text"` / `class="small-btn-row"` / `class="small-btn cancel"` / `class="small-btn confirm-init"`
  - 카피 verbatim: '비밀번호 초기화' / '사번 뒷 4자리로 비밀번호를 초기화합니다. 계속하시겠습니까?' / '취소' / '초기화'
- **액션 row (line 278~312):**
  - `class="action-row"` / `class="btn-save"` / `class="btn-save disabled"` / `class="btn-cancel"` / `class="btn-replace"` / `class="btn-deactivate"` / `class="btn-deactivate-confirm"` / `class="confirm-deactivate-box"` / `class="btn-row"`
  - 비활성화 안내: '이 직원을 비활성화합니다. 점검 기록은 보존됩니다.'
- **ReplaceModalContent (line 81~149):**
  - `class="replace-info-box"` `rgba(59,130,246,.08)` / `class="replace-info-sub"` fontSize 11 → `text-caption` (OQ #5) / `class="replace-no-candidates"` / `class="replace-select"` / `class="btn-replace-confirm"` / `class="btn-replace-confirm disabled"`
- **모달 호출 wrapper** (line 516~527): `{modal.open && <ModalWrapper ...>}` + `{replaceModal.open && replaceModal.target && <ModalWrapper ...>}`

---

## §4 비즈 anchor 보존 박스 (1 byte 변경 금지) — wave-1-index §1.3 verbatim 인용

`project_redesign_15_daily_report_status` 패턴 일반화 — 아래 anchor 는 TSX 변환 시 절대 변경 금지.

| # | anchor | line | 보존 이유 |
|---|---|---|---|
| 1 | admin 가드 useEffect (`if (me?.role !== 'admin') navigate('/dashboard', { replace: true })`, deps `[me, navigate]`) + early return (`if (me?.role !== 'admin') return null`) | 371~373, 385 | 권한 가드 비즈 로직 1 byte 변경 금지 |
| 2 | queryKey `['staff-list']` 단일 (line 87 ReplaceModal, line 376 메인) + invalidate 4건 (line 106, 168, 174, 186) | 여러 | React Query 캐시 무효화 패턴 |
| 3 | staffList sort: rankOfTitle 차 → 0이면 a.id.localeCompare(b.id) | 380~383 | 직급+사번 정렬 비즈 룰 |
| 4 | createMutation: `staffApi.create({ id, name, role, title, phone?, email?, appointedAt?, birthDate? })` + onSuccess invalidate+toast+'직원이 추가되었습니다'+onClose + onError toast | 166~170 | 등록 비즈 로직 |
| 5 | updateMutation: `staffApi.update(staff!.id, data: StaffUpdatePayload)` + onSuccess invalidate+toast+'직원 정보가 수정되었습니다'+onClose + onError toast | 172~176 | 수정 비즈 로직 |
| 6 | resetPwMutation: `staffApi.resetPassword(staff!.id)` + onSuccess toast+'비밀번호가 초기화되었습니다 (사번 뒷 4자리)'+setConfirmReset(false) + onError toast | 178~182 | 비밀번호 초기화 비즈 로직 |
| 7 | deactivateMutation: `staffApi.update(staff!.id, { active: 0 })` + onSuccess invalidate+toast+'직원이 비활성화되었습니다'+onClose + onError toast | 184~188 | 비활성화 비즈 로직 |
| 8 | canSave: `form.name.trim() !== '' && form.id.trim() !== ''` | 190 | 저장 가능 조건 verbatim |
| 9 | 사번 10자리 정규식: `if (!/^\d{10}$/.test(form.id)) { toast.error('사번은 10자리 숫자여야 합니다'); return }` | 194 | 등록/수정 정규식 변경 금지 |
| 10 | appointedAt 자동 채움: `p = (form.id ?? '').slice(0,8)` + `/^[0-9]{8}$/.test(p)` 시 `${p.slice(0,4)}-${p.slice(4,6)}-${p.slice(6,8)}` + readonly + opacity 0.5 | 227~230 | 사번 앞 8자리 yyyy-mm-dd 자동 매핑 |
| 11 | shiftOffset 0~3 + shiftFixed 'day'/null 비즈 데이터: EMPTY_STAFF_FORM (line 76~78) + edit 초기화 (line 157) — 폼 UI 미노출, ReplaceModal 시퀀스에서만 변경 | 76~78, 157 | `project_div_compressor_pair` 4-shift 사이클 룰 |
| 12 | ReplaceModalContent 2× staffApi.update 시퀀스: 1. `staffApi.update(selectedId, { shiftOffset, shiftFixed })` 2. `staffApi.update(oldStaff.id, { active: 0, phone: '', email: '', shiftOffset: null, shiftFixed: null })` — 순서/인자/cleanup 변경 0 | 93~114 | 근무 패턴 이전 + 기존 직원 개인정보 제거 시퀀스 |
| 13 | candidates 필터: `active === 1 && id !== oldStaff.id && shiftOffset === null && shiftFixed === null` | 88 | 교체 대상 후보 필터 |
| 14 | shiftLabel 분기: `'평일 주간 고정'` / `` `3교대 (오프셋 ${shiftOffset})` `` / `'미설정'` — `feedback_sketch_realistic_data` | 90~91 | 근무 패턴 라벨 변경 금지 |
| 15 | window.__openReplaceModal 훅: useEffect 등록 + cleanup + line 292 `setTimeout(() => (window as any).__openReplaceModal?.(staff), 100)` — React 19 안티-패턴이나 동작 보존 | 365~368, 292 | 교체 모달 cross-trigger 패턴 |
| 16 | rankOfTitle: 대리=0, 주임=1, 기사=2, 기타=3 (`if (t.includes('대리')) return 0` ...) | 347~354 | 직급 정렬 함수 변경 금지 |
| 17 | role 옵션: `(['admin', 'assistant'] as Role[])` + 라벨 '관리자'/'보조자' | 246 | role 옵션/라벨 변경 금지 |
| 18 | ModalWrapper = isDesktop ? DesktopModal : BottomSheet (line 387) + 모달 title 분기 '직원 추가'/'직원 수정' (line 517) + 교체 모달 title '직원 교체' (line 524) | 387, 517, 524 | 모달 분기 + 타이틀 카피 verbatim |
| 19 | BottomSheet (line 22~40) — overlay `rgba(0,0,0,0.6)` / bg `var(--bg2)` / radius `16px 16px 0 0` / slideUp 0.28s / maxHeight 90vh / handle bar 32x4 var(--bd2) / title 16/700/var(--t1) padding 12 16 0 / backdrop click close | 22~40 | 인라인 보존 (OQ #1 default) |
| 20 | DesktopModal (line 42~57) — overlay `rgba(0,0,0,0.5)` / bg `var(--bg2)` / radius 12 / width 440 / maxHeight 85vh / boxShadow `0 8px 32px rgba(0,0,0,.18)` / title 16/700/var(--t1) padding 20 24 0 | 42~57 | 인라인 보존 (OQ #1 default) |
| 21 | SKELETON_STYLE: bg var(--bg3) / radius 12 / height 64 / blink 2s ease-in-out infinite | 342~345 | 스켈레톤 시각 패턴 |
| 22 | 모바일 FAB safe-area: `paddingBottom: calc(16px + var(--sab))` | 506 | iOS PWA safe-area-inset-bottom 룰 |
| 23 | 카피 verbatim 18건+: '직원 관리' (line 400) / '{N}명' (line 401, 411) / '직원 추가' (line 406, 510) / '직원 추가'/'직원 수정' (line 517) / '직원 교체' (line 524) / '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요' (line 426) / '등록된 직원이 없습니다' (line 447, 493) / '직원 추가 버튼을 눌러 첫 번째 직원을 등록하세요' (line 494) / '저장'/'취소' (line 280, 283) / '비활성화' (line 290, 308) / '교체' (line 294) / '이 직원을 비활성화합니다. 점검 기록은 보존됩니다.' (line 302) / '비밀번호 초기화' (line 259) / '사번 뒷 4자리로 비밀번호를 초기화합니다. 계속하시겠습니까?' (line 263) / '초기화' (line 268) / '관리자'/'보조자' (line 249) / '활성'/'비활성' (line 475) / '수정 ▸' (line 336) / '수정' (line 479) / '(사번 앞 8자리에서 자동)' (line 224) / '(휴가신청서 자동 채움)' (line 236) | 여러 | `feedback_sketch_realistic_data` |
| 24 | placeholder verbatim 7건: '홍길동' (line 209) / '0000000000' (line 213) / '010-0000-0000' (line 217) / 'email@example.com' (line 221) / '사번 입력 시 자동 채워짐' (line 231) / '소방안전관리자' (line 241) / '선택하세요' (ReplaceModal line 132) | 여러 | verbatim 보존 |
| 25 | toast 카피 8건 (StaffModal): '직원이 추가되었습니다' (line 168) / '직원 정보가 수정되었습니다' (line 174) / '저장에 실패했습니다. 입력값을 확인해 주세요' (line 169, 175) / '비밀번호가 초기화되었습니다 (사번 뒷 4자리)' (line 180) / '비밀번호 초기화에 실패했습니다' (line 181) / '직원이 비활성화되었습니다' (line 186) / '비활성화에 실패했습니다' (line 187) / '사번은 10자리 숫자여야 합니다' (line 194) | 여러 | verbatim 보존 |
| 26 | toast 카피 2건 (ReplaceModal): `` `${oldStaff.name} → ${newStaff.name} 교체 완료` `` (line 107) / `e.message || '교체 실패'` (line 110) | 107, 110 | verbatim 보존 |

---

## §5 OQ LOCKED 6건 verbatim (wave-1-index.md §7 박제)

- **OQ #1 default: (a) BottomSheet/DesktopModal 인라인 보존** — CheckpointsPage(24) 공통화는 별도 task. 이 wave 는 동 파일 인라인 유지. negative gate: `src/components/ui/Modal.tsx` 또는 `Sheet.tsx` 신규 생성 0 byte.

- **OQ #2 default: (a) 단색 var(--acl) 유지** — 저장 / 직원 추가 / 모바일 FAB 3건 모두 단색 `--accent-primary`. 교체 버튼은 warning 톤 (`#f59e0b` ReplaceModal 단색 / `rgba(245,158,11,.1)` StaffModal) 유지. design-system.md §6.4 그라데이션 ("lin-grad" 약어) 신규 도입 금지. TSX 본문 `linear-gradient` 0.

- **OQ #3 default: (a) shift 폼 미노출 유지 + role toggle height 36 → 40 (데스크톱) / 44 (모바일) 격상** — EMPTY_STAFF_FORM shiftOffset+shiftFixed 는 폼 UI 미노출 보존. ReplaceModal 만 변경 가능. role 2 button row segment 컨트롤/select 로 변경 X. height 36 → 40/44 격상. shift 폼 노출은 별도 task (`project_meal_calc_rules` + `project_div_compressor_pair` 운영 룰 검토 후).

- **OQ #4 default: (a) 외곽 hex 토큰 전체 치환** — `var(--bg)` → `--surface-page` / `--bg2` → `--surface-raised` / `--bg3` → `--surface-sunken` / `--bg4` → `--surface-active` / `--bd` → `--border-default` / `--bd2` → `--border-strong` / `--t1/--t2/--t3` → `--text-primary/--secondary/--tertiary` / `--acl` → `--accent-primary` / `--safe` → `--status-safe-bar` / `--danger` → `--status-danger` / `--warn` → `--status-warning-bar`. design-system.md §4.1 마이그레이션 표 그대로.

- **OQ #5 default: (a) 9/10/11 → 12 일률 격상 + leading-none 추가** — StaffCard role 배지 (line 327 fontSize 9) → `text-caption leading-none`. 테이블 role 배지 (line 461 fontSize 10) → `text-caption leading-none`. 입사일·생년월일 보조 라벨 (line 224, 236 fontSize 10) → `text-caption`. ReplaceModal 보조 라벨 (line 121 fontSize 11) → `text-caption`. 테이블 status (line 471 fontSize 11) → `text-caption leading-none`. 모든 9/10/11px `text-caption` + 작은 컨테이너 안 `leading-none` (`feedback_text_caption_leading_none`).

- **OQ #6 default: (a) Lucide UserPlus 치환 + 기존 size 보존 + 카드 duty 색 신규 미도입** — `<UserPlus size={16} color="#fff" />` (line 405 데스크톱) + `<UserPlus size={18} color="#fff" />` (line 509 모바일 FAB, 18 보존). 인라인 SVG IconUserPlus 함수 (line 11~20) 제거. StaffCard duty 색 신규 도입은 별도 task (`feedback_design_changes_ask_first`).

---

## §6 3 sketch HTML grep 추출 verbatim class 인용

아래는 executor 가 W5 작성 시점에 실제 실행한 결과 (추측 금지 — `feedback_planner_prompt_sketch_verbatim`):

```bash
for f in cha-bio-safety/docs/redesign-context/26-staff-manage/sketch-wave-{2,3,4}-*.html; do
  echo "=== $f ==="
  grep -hoE 'class="[^"]+"' "$f" | sort -u
done
```

```
=== sketch-wave-2-frame-guard-header.html ===
class="desktop-add-btn"
class="desktop-frame"
class="desktop-header-count"
class="desktop-header-title"
class="desktop-header"
class="frame-block"
class="frame-label"
class="frame-row"
class="guard-code"
class="guard-desc"
class="guard-frame"
class="guard-icon"
class="guard-title"
class="icon-user-plus"
class="keyframe-demo"
class="kf-demo-blink"
class="kf-demo-focus"
class="kf-demo-slideup"
class="kf-label"
class="kf-row"
class="mobile-content-placeholder"
class="mobile-header-count"
class="mobile-header"
class="phone-frame"
class="section-title"
class="skeleton-bar"
class="sketch-canvas"
class="theme-block"
class="theme-compare"
class="theme-tag"
```

```
=== sketch-wave-3-staff-list.html ===
class="action-cell"
class="card-action"
class="card-content"
class="card-dot active"
class="card-dot inactive"
class="card-id"
class="card-list"
class="card-name"
class="card-role-badge admin"
class="card-role-badge assistant"
class="card-title-text"
class="card-top"
class="data-table"
class="desktop-content"
class="desktop-header-ref"
class="desktop-header-title-ref"
class="empty-desc"
class="empty-title"
class="frame-block"
class="frame-label"
class="frame-row"
class="header-count-ref"
class="icon-user-plus-18"
class="id-cell"
class="mobile-count-ref"
class="mobile-empty"
class="mobile-fab-wrap"
class="mobile-fab"
class="mobile-header-ref"
class="name-cell"
class="phone-cell"
class="phone-frame"
class="role-badge admin"
class="role-badge assistant"
class="row-inactive"
class="section-title"
class="skeleton-bar"
class="skeleton-wrap"
class="sketch-canvas"
class="staff-card inactive"
class="staff-card"
class="state-empty"
class="state-error"
class="status-cell status-active"
class="status-cell status-inactive"
class="status-dot"
class="table-wrap"
class="title-cell"
```

```
=== sketch-wave-4-modal-form-confirm.html ===
class="action-row"
class="btn-cancel"
class="btn-deactivate-confirm"
class="btn-deactivate"
class="btn-replace-confirm disabled"
class="btn-replace-confirm"
class="btn-replace"
class="btn-row"
class="btn-save disabled"
class="btn-save"
class="confirm-deactivate-box"
class="confirm-reset-box"
class="confirm-reset-link"
class="confirm-reset-text"
class="form-body-wide"
class="form-body"
class="form-field"
class="form-input disabled"
class="form-input mono disabled"
class="form-input mono"
class="form-input"
class="form-label"
class="form-required"
class="form-sub-label"
class="frame-block"
class="frame-label"
class="frame-row"
class="modal-overlay"
class="modal-panel"
class="modal-title"
class="replace-info-box"
class="replace-info-sub"
class="replace-no-candidates"
class="replace-select"
class="role-btn desktop selected"
class="role-btn desktop unselected"
class="role-btn mobile selected"
class="role-btn mobile unselected"
class="role-toggle"
class="section-title"
class="sheet-handle-row"
class="sheet-handle"
class="sheet-overlay"
class="sheet-panel"
class="sheet-title"
class="sketch-canvas"
class="small-btn cancel"
class="small-btn confirm-init"
class="small-btn-row"
```

---

## §7 폰트 격상 매트릭스 — 9/10/11 → 12 (AAA 7:1 §1.1)

OQ #5 default = (a): 모든 9/10/11px → `text-caption` (12px) + 작은 컨테이너 안 `leading-none`.

| line | 현재 fontSize | 컨텍스트 | 목표 토큰 |
|---|---|---|---|
| 35 | 16 fw700 | BottomSheet title | `text-body font-bold` (16 OK, §1.1 마지노선) |
| 52 | 16 fw700 | DesktopModal title | `text-body font-bold` |
| 62 | 14 | INPUT_STYLE | `text-body-sm` (14 OK) |
| 66 | 12 fw700 | LABEL_STYLE | `text-label font-bold` (12 OK) |
| 121 | **11** | ReplaceModal 보조 라벨 ('기존 점검 기록은...') | **`text-caption`** (11 → 12, OQ #5) |
| 118, 127 | 12 | ReplaceModal info 박스 + no-candidates | `text-caption` |
| 141, 143 | 14 fw700 | ReplaceModal 취소/교체 버튼 | `text-body-sm font-bold` (14 OK) |
| 224, 236 | **10** fw400 | 입사일·생년월일 보조 라벨 ('(사번 앞 8자리에서 자동)' / '(휴가신청서 자동 채움)') | **`text-caption`** (10 → 12, OQ #5) |
| 248 | 12 fw700 | role toggle button ('관리자'/'보조자') | `text-caption font-bold` (12 OK, OQ #3 default) |
| 258, 262, 265, 267 | 12 | confirmReset 링크 + 안내 + 버튼 | `text-caption` |
| 280, 283 | 14 fw700 | 취소/저장 버튼 | `text-body-sm font-bold` |
| 289, 293 | 12/14 | 비활성화·교체 버튼 | `text-caption` / `text-body-sm` |
| 305, 308 | 12/14 | confirmDeactivate 취소/비활성화 | `text-caption` / `text-body-sm` |
| 320 | 12 | StaffCard padding (시각 변경 0, padding only) | (변경 없음) |
| 324 | 16 fw700 | StaffCard name | `text-body font-bold` |
| 325 | 12 | StaffCard title | `text-caption text-text-secondary` |
| 327 | **9** fw700 | StaffCard role 배지 ('admin'/'assistant') | **`text-caption leading-none`** (9 → 12, OQ #5) |
| 334 | 12 | StaffCard sub-id (JetBrains Mono) | `text-caption font-mono` |
| 336 | 12 fw700 | StaffCard '수정 ▸' | `text-caption leading-none` (작은 컨테이너 안 leading-none — `feedback_text_caption_leading_none`) |
| 400 | 14 fw700 | 데스크톱 헤더 '직원 관리' | `text-body-sm font-bold` |
| 401 | 12 | 데스크톱 헤더 카운트 | `text-caption text-text-tertiary` |
| 404 | 13 fw700 | 데스크톱 헤더 '직원 추가' 버튼 | `text-label font-bold` (13 → 12) |
| 411 | 12 | 모바일 헤더 카운트 | `text-caption text-text-tertiary` |
| 425 | 14 | error 메시지 | `text-body-sm` |
| 433 | 13 | 테이블 base fontSize | `text-label` (13 → 12) |
| 436~441 | 12 fw700 | 데스크톱 테이블 thead | `text-caption font-bold` |
| 447 | 14 | 테이블 empty | `text-body-sm` |
| 457 | 12 | 테이블 사번 (JetBrains Mono) | `text-caption font-mono` |
| 461 | **10** fw700 | 데스크톱 테이블 role 배지 | **`text-caption leading-none`** (10 → 12, OQ #5) |
| 468 | 12 | 테이블 연락처 | `text-caption` |
| 471 | **11** fw600 | 데스크톱 테이블 status | **`text-caption leading-none`** (11 → 12, OQ #5) |
| 479 | 12 fw700 | 데스크톱 테이블 액션 '수정' | `text-caption font-bold` |
| 493 | 16 fw700 | 모바일 empty title | `text-body font-bold` |
| 494 | 12 | 모바일 empty 안내 | `text-caption` |
| 508 | 14 fw700 | 모바일 FAB '직원 추가' | `text-body-sm font-bold` |

**위반 요약:** fontSize 9px 1건 (line 327) / fontSize 10px 3건 (line 224, 236, 461) / fontSize 11px 2건 (line 121, 471) — 모두 OQ #5 default (a) 따라 `text-caption` 12 격상 + 필요 시 `leading-none`.

---

## §8 Lucide 아이콘 매핑

OQ #6 default = (a): 기존 size 보존 + Lucide 치환. `feedback_tailwind_token_class_pattern` — `size={N}` prop.

| 현재 | line | Lucide 치환 | size | 비고 |
|---|---|---|---|---|
| `IconUserPlus` SVG 함수 (line 11~20, viewBox 24x24 strokeWidth 2) | 11~20 | `<UserPlus />` from 'lucide-react' | 용처별 다름 | 함수 전체 제거 |
| 데스크톱 헤더 '직원 추가' UserPlus (line 405) | 405 | `<UserPlus size={16} color="#fff" />` | **16** | OQ #6 default (a) 보존 |
| 모바일 FAB UserPlus (line 509) | 509 | `<UserPlus size={18} color="#fff" />` | **18 보존** | OQ #6 default (a), 18→20 격상은 별도 OQ |
| 모바일 카드 '수정 ▸' 텍스트 글리프 (line 336) | 336 | `<ChevronRight size={14} />` 검토 가능 | 텍스트 보존 | OQ 별도 가능, 이 wave default = 텍스트 보존 (`feedback_design_changes_ask_first`) |
| X close button (없음) | — | 미도입 | — | 모달 backdrop click 만으로 닫힘 — X 추가는 별도 OQ |

---

## §9 components.css inherit vs 신규 정의

wave-1-index.md §4 박제 — 26-staff-manage 는 components.css **신규 추가 0** (OQ #1 default + 단일 파일 인라인 패턴).

### 재사용 (기존 tokens.css / typography.css 그대로)

| class | 출처 | 26-staff-manage 사용처 |
|---|---|---|
| `.bg-surface-page` / `.bg-surface-raised` / `.bg-surface-sunken` / `.bg-surface-active` | tokens.css | 외곽 / 카드+모달 / input+StaffCard+SKELETON / 비활성 버튼 |
| `.text-text-primary` / `.text-text-secondary` / `.text-text-tertiary` | tokens.css | 본문 / 보조 / 메타 |
| `.text-status-safe-bar` / `.text-status-danger` / `.text-status-warning-bar` | tokens.css | 활성 dot+'활성' / 비활성화 버튼+confirmDeactivate / confirmReset 링크+교체 버튼 |
| `.bg-status-info-bg` / `.text-status-info` (또는 `--accent-primary` 알리아스) | tokens.css | role 배지 admin + ReplaceModal info 박스 |
| `.bg-status-danger-bg` | tokens.css | confirmDeactivate 안내 박스 + 비활성화 버튼 |
| `.bg-status-warning-bg` | tokens.css | confirmReset 안내 박스 + 교체 버튼 |
| `.text-caption` / `.text-label` / `.text-body-sm` / `.text-body` | typography.css | 폰트 격상 매트릭스 (§7) |
| `.rounded-md` (12) / `.rounded-lg` (16) / `.rounded-sm` (8) | tokens.css | 카드 / 모달 / input+button |
| `.btn` / `.btn-primary` / `.btn-secondary` | 14-reports components.css | 저장 / 취소 / 비활성화 액션 row (검토) |

### 신규 정의 (이 wave 에서 새로 추가)

**없음** — BottomSheet / DesktopModal / StaffModalContent / ReplaceModalContent / StaffCard / SKELETON 모두 동 파일 인라인 유지 (OQ #1 default). CheckpointsPage(24) 공통화는 별도 task.

---

## §10 Tailwind cheatsheet — 26-staff-manage 사용 토큰

**색 토큰 (status- prefix 없음 — `feedback_tailwind_token_class_pattern`):**
`bg-safe-bar` `bg-fire-bar` `bg-danger-bar` `bg-warn-bar` `bg-surface-page` `bg-surface-raised` `bg-surface-sunken` `bg-surface-active` `text-text-primary` `text-text-secondary` `text-text-tertiary` `border-border-default` `border-border-strong`

**status- prefix 0 룰:**
- OK: `bg-fire-bar` / `text-safe-bar` / `bg-danger-bar`
- NG: `bg-status-fire-bar` / `text-status-safe-bar` / `bg-status-danger-bar`

**i4b deviation 박제 (필수):**
`bg-accent` 실측 키명 사용 — `bg-accent-primary` 추측 금지. tokens.css / tailwind.config 실측 후 정확한 키만 사용. 11-div TSX v3 hotfix(4ce707e) 사고 패턴 재발 방지. `feedback_tailwind_token_class_pattern`. 실측 방법: `grep -E '^\s*accent' cha-bio-safety/tailwind.config.js` 로 키명 확인 후 사용.

**크기 함정 (`feedback_tailwind_w8_h8_is_48px`):**
- `w-8 h-8` = **48px** (tailwind.config spacing override, 기본 32 아님)
- `w-7 h-7` = **32px**
- 8x8 dot (StaffCard line 321 / 테이블 status line 474) 변환 시: arbitrary `w-[8px] h-[8px]`
- 6x6 dot (테이블 line 474) 변환 시: arbitrary `w-[6px] h-[6px]`
- handle bar 32x4 (line 33) → arbitrary `w-[32px] h-[4px]`
- SKELETON height 64 → `h-16` (64px, 4배수 OK)
- FAB height 52 → `h-[52px]` arbitrary
- role toggle height 36 → `h-9` (36) / OQ #3 격상 시 `h-10` (40, 데스크톱) / `h-11` (44, 모바일)

**폰트 small container (`feedback_text_caption_leading_none`):**
- `text-caption` = 12px lh:1.5 (18px 실높이) — 작은 컨테이너 (role 배지 / '수정 ▸') 안에서 시각적 패딩 발생
- 해결: `text-caption leading-none` 명시

**그라데이션 0 (OQ #2 default):**
- `bg-accent-primary` / `bg-status-info-bar` 단색만 — `linear-gradient` ("lin-grad" 약어) 신규 도입 금지

**tokens.css 불일치 시 fallback (`project_redesign_16_workshift_status`):**
- arbitrary `text-[#hex]` / `bg-[#hex]` — 교체 버튼 `#f59e0b` / `#d97706` / `rgba(245,158,11,.1)` 등 raw hex 잔존 가능

---

## §11 negative gate (TSX 변환 wave 진입 시 강제)

- (1) src/** 변경은 `StaffManagePage.tsx` 만 — 다른 페이지 / hook / util 0 byte
- (2) `components.css` 변경 0 (재사용만, 신규 추가 0 — OQ #1 default + §9)
- (3) `App.tsx` 0 byte — Suspense 매핑 변경 0, `MOBILE_NO_NAV_PATHS` 변경 0
- (4) sketch HTML 추가 0 (W2~W4 의 3 sketch 는 이미 작성됨)
- (5) wave-5 외 markdown 추가 0
- (6) admin 가드 (line 371~373 + 385) 1 byte 변경 0
- (7) `staffApi.list` / `staffApi.create` / `staffApi.update` / `staffApi.resetPassword` 호출 인자 + 응답 처리 변경 0
- (8) queryKey `['staff-list']` 단일 + invalidate 4건 변경 0
- (9) useMutation 4건 (create / update / resetPw / deactivate) onSuccess / onError / mutationFn 분기 모두 0 byte
- (10) staffList sort + rankOfTitle (대리/주임/기사/기타 0~3) 변경 0
- (11) 사번 10자리 정규식 `/^\d{10}$/` 변경 0
- (12) appointedAt 자동 채움 (사번 앞 8자리 yyyy-mm-dd + readonly + opacity 0.5) 변경 0
- (13) ReplaceModalContent 2× staffApi.update 시퀀스 (순서 + 인자 + invalidate 시퀀스) 변경 0
- (14) candidates 필터 (`active===1 && id!==oldStaff.id && shiftOffset===null && shiftFixed===null`) 변경 0
- (15) shiftLabel 분기 ('평일 주간 고정' / `` `3교대 (오프셋 ${N})` `` / '미설정') 변경 0
- (16) shiftOffset 0~3 + shiftFixed 'day'/null 비즈 데이터 변경 0 (폼 UI 미노출 OQ #3 default)
- (17) window.__openReplaceModal 훅 + cleanup + 100ms setTimeout 변경 0
- (18) role 옵션 `(['admin', 'assistant'] as Role[])` + 라벨 '관리자'/'보조자' 변경 0
- (19) 비밀번호 초기화 confirm 카피 '사번 뒷 4자리로 비밀번호를 초기화합니다. 계속하시겠습니까?' + setConfirmReset(false) 시점 변경 0
- (20) BottomSheet / DesktopModal / StaffModalContent / ReplaceModalContent / StaffCard 함수 공통 추출 0 (CheckpointsPage 24 와 별도 task — OQ #1)
- (21) 이모지 0 (메타 코멘트 포함 — "warning glyph" / "lin-grad" 약어 패턴 사용)
- (22) fontSize 9/10/11 인라인 0 (모두 §7 폰트 매트릭스 따라 12 격상)
- (23) `linear-gradient` 0 (OQ #2: 저장 / 직원 추가 / FAB 단색 보존)
- (24) `status-` prefix 0 (`bg-status-fire-bar` 형태 NG — `feedback_tailwind_token_class_pattern`)
- (25) `bg-accent-primary` 추측 0 — `bg-accent` 실측 키명 확인 후 사용 (i4b deviation 박제)
- (26) w-8 h-8 사고 0 (8x8 dot → `w-[8px] h-[8px]` / 6x6 dot → `w-[6px] h-[6px]` / handle bar → `w-[32px] h-[4px]` — `feedback_tailwind_w8_h8_is_48px`)
- (27) wrangler 0 (이 워크트리 룰 — `feedback_cbc7119_design_never_wrangler`)
- (28) `npm run deploy` 0 (직원 도메인 가는 경로, 이 워크트리는 cbc7119-preview 만)
- (29) 카피 verbatim 18+ / placeholder 7 / toast 8 + ReplaceModal toast 2 / ReplaceModal 카피 7 임의 변경 0 (`feedback_sketch_realistic_data`)
- (30) 모바일 FAB safe-area `calc(16px + var(--sab))` (line 506) 0 byte (iOS PWA safe-area-inset-bottom)
- (31) BottomSheet slideUp animation keyframe (`<style>` line 391~395) 0 byte (또는 tailwind.config extend 이관)

---

## §12 verify gate (자동 명령 + 기대값)

아래 명령은 TSX 변환 wave commit 직전 모두 PASS 필수. 경로 prefix: `cha-bio-safety/docs/redesign-context/26-staff-manage/`.

| # | gate | 명령 | 기대값 |
|---|---|---|---|
| 1 | 12 섹션 헤더 존재 | `grep -cE '^## §([1-9] \|1[0-2] )' wave-5-tsx-conversion-checklist.md` | = 12 |
| 2 | 비즈 anchor 표 row ≥20 | `grep -cE '^\| [0-9]+' wave-5-tsx-conversion-checklist.md` | >= 20 |
| 3 | OQ LOCKED 6건 | `grep -cE '^- \*\*OQ #[1-6]' wave-5-tsx-conversion-checklist.md` | = 6 |
| 4 | 3 sketch HTML class fence (open+close 3*2) | `grep -c '^` + '```' + `' wave-5-tsx-conversion-checklist.md` | >= 6 |
| 5 | status- prefix 0 룰 박제 | `grep -c 'status- prefix 0' wave-5-tsx-conversion-checklist.md` | >= 1 |
| 6 | w-8 h-8 = 48px 함정 박제 | `grep -c 'w-8 h-8' wave-5-tsx-conversion-checklist.md` | >= 1 |
| 7 | negative gate ≥17 | `grep -cE '^- \([0-9]+\)' wave-5-tsx-conversion-checklist.md` | >= 17 |
| 8 | 메모리 룰 unique slug ≥10 | `grep -oE '(feedback\|project\|reference)_[a-z_]+' wave-5-tsx-conversion-checklist.md \| sort -u \| wc -l` | >= 10 |
| 9 | TSX line range 인용 ≥15 | `grep -cE 'line [0-9]+~[0-9]+\|line [0-9]+,' wave-5-tsx-conversion-checklist.md` | >= 15 |
| 10 | admin 가드 박제 | `grep -c 'admin' wave-5-tsx-conversion-checklist.md` | >= 3 |
| 11 | staffApi 4종 박제 | `grep -cE 'staffApi\.(list\|create\|update\|resetPassword)' wave-5-tsx-conversion-checklist.md` | >= 4 |
| 12 | queryKey ['staff-list'] 박제 | `grep -c 'staff-list' wave-5-tsx-conversion-checklist.md` | >= 3 |
| 13 | useMutation 4건 박제 | `grep -cE 'createMutation\|updateMutation\|resetPwMutation\|deactivateMutation' wave-5-tsx-conversion-checklist.md` | >= 4 |
| 14 | ReplaceModal 박제 | `grep -cE 'ReplaceModalContent\|ReplaceModal\|2x staffApi\|2× staffApi' wave-5-tsx-conversion-checklist.md` | >= 3 |
| 15 | window 훅 박제 | `grep -c '__openReplaceModal' wave-5-tsx-conversion-checklist.md` | >= 2 |
| 16 | rankOfTitle 박제 | `grep -c 'rankOfTitle' wave-5-tsx-conversion-checklist.md` | >= 2 |
| 17 | 사번 정규식 박제 | `grep -cE '10자리\|d\{10\}' wave-5-tsx-conversion-checklist.md` | >= 2 |
| 18 | appointedAt 박제 | `grep -cE 'appointedAt\|사번 앞 8자리' wave-5-tsx-conversion-checklist.md` | >= 2 |
| 19 | shiftOffset+shiftFixed 박제 | `grep -cE 'shiftOffset\|shiftFixed' wave-5-tsx-conversion-checklist.md` | >= 4 |
| 20 | BottomSheet/DesktopModal 박제 | `grep -cE 'BottomSheet\|DesktopModal\|ModalWrapper' wave-5-tsx-conversion-checklist.md` | >= 4 |
| 21 | i4b deviation 박제 | `grep -c 'bg-accent' wave-5-tsx-conversion-checklist.md` | >= 2 |
| 22 | src/** 변경 0 검증 | `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/ \| wc -l` | = 0 |
| 23 | App.tsx 변경 0 | `git diff origin/main..HEAD --name-only -- cha-bio-safety/src/App.tsx \| wc -l` | = 0 |
| 24 | 이모지 0 | `LC_ALL=C grep -P '[\x{1F300}-\x{1FAFF}]' wave-5-tsx-conversion-checklist.md` | 0 hits |
| 25 | wrangler / npm run deploy 0 | `grep -cE 'wrangler\|npm run deploy' wave-5-tsx-conversion-checklist.md` | = 0 |
| 26 | tsc / build 영향 0 | markdown 추가만 — build PASS 자동 | 자동 PASS |

---

## 메모리 룰 inline (unique slug ≥13)

TSX 변환 wave executor 는 아래 slug 규칙을 적용 전 1건씩 확인 (`feedback_tsx_wave_stat_card_drift` — source outline 패턴 보존만 하고 sketch 새 패턴 누락하는 사고 방지):

1. `feedback_planner_prompt_sketch_verbatim` — §6 class fence 는 실제 grep 결과 박제. 추측한 토큰명/사이즈 금지.
2. `feedback_redesign_sketch_rule_enforcement` — §6.2/§6.3/§7.1 negative rule + verify gate 4중 강화.
3. `feedback_sketch_realistic_data` — 표시 분기/라벨 룰은 코드 그대로. 시안은 시각 디자인만.
4. `feedback_tsx_wave_emoji_dot_gap` — 이모지 0 + dot span 추가 markup verify gate 강제.
5. `feedback_tsx_wave_stat_card_drift` — sketch 새 패턴 verbatim 인용 필수. source outline 보존만 금지.
6. `feedback_text_caption_leading_none` — 작은 컨테이너 안 `text-caption` → `leading-none` 추가.
7. `feedback_tailwind_token_class_pattern` — `status-` prefix 0 + lucide `size={N}` prop 형태. `bg-accent` 실측 키명 사용, `bg-accent-primary` 추측 금지 (i4b deviation 박제).
8. `feedback_tailwind_w8_h8_is_48px` — `w-8` = 48px (spacing override). 8x8 dot = `w-[8px] h-[8px]`.
9. `feedback_cbc7119_design_never_wrangler` — 이 워크트리에서 wrangler 명령 절대 금지.
10. `feedback_design_changes_ask_first` — 레이아웃 구조/표시 방식 변경은 사용자 상의 후.
11. `feedback_design_sketch_first` — spacing/sizing 도 sketch 시안 컨펌 후 인라인 적용.
12. `feedback_avoid_premature_confirmation` — "거의 일치" 자신감 표현 금지. 사용자 판단 대기.
13. `project_redesign_15_daily_report_status` — 비즈 anchor 1 byte 변경 0 일반화 패턴. §4 표 전체 적용.
14. `project_div_compressor_pair` — DIV+컴프 4-shift 사이클 룰 강제. shiftOffset 0~3 옵션/순서 변경 금지.
15. `project_meal_calc_rules` — 식대 계산 (5500원/끼) 이 shiftOffset+shiftFixed 의존. 비즈 데이터 변경 시 식대 계산 깨짐.

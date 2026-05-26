---
title: "redesign/26-staff-manage — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-26
quick_id: 260526-mbr
branch: redesign/26-staff-manage
source_tsx: cha-bio-safety/src/pages/StaffManagePage.tsx
source_tsx_lines: 530
design_system: cha-bio-safety/docs/redesign-context/26-staff-manage/design-system.md (v0.1.1)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (26-staff-manage = `/staff-manage` BottomNav 모바일 노출 페이지 — `MOBILE_NO_NAV_PATHS` 미등재. App.tsx 기본 헤더 사용 X — 자체 헤더 없이 페이지 내부 상단 헤더 (데스크톱: 직원 관리 + 카운트 + 직원 추가 / 모바일: 카운트만). chrome 룰 직접 적용 X. BottomSheet/DesktopModal 모달 chrome 은 별도 패턴 — CheckpointsPage(24) 와 동일 함수.)
mirror_of: cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md (8-section + sub-wave 4 + 단일 파일 패턴. 26 은 sub-area 4 + sub-wave 3 으로 축소)
calibration_precedent: cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md SW3 (비즈 anchor 1 byte 변경 금지 일반화)
sub_wave_count: 3 (W2~W4) + TSX W5
memory_rules_inline: 12
open_questions: 6
admin_only: true
---

# redesign/26-staff-manage — sketch wave 1 (index)

본 문서는 W2~W5 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:

- StaffManagePage.tsx (530 lines, admin 전용) 의 element 인벤토리 → 4 sub-area + 3 sub-wave 분배 + **비즈 시그니처** 보존 anchor (admin 가드 useEffect / staffApi 4종 호출 (list / create / update / resetPassword) / useMutation 4건 (create / update / resetPw / deactivate) / ReplaceModalContent 의 2× staffApi.update 시퀀스 + 개인정보 제거 + active=0 / queryKey ['staff-list'] / shiftOffset 0~3 (3교대 오프셋) + shiftFixed 'day'/null / role 'admin'/'assistant' / rankOfTitle 직급 정렬 (대리=0/주임=1/기사=2/기타=3) / window.__openReplaceModal 훅 / 폼 필드 8종 / 사번 10자리 정규식 검증 / appointedAt 사번 앞 8자리 자동 채움 / duty 토큰 매핑 / 카피 verbatim)
- BottomSheet (모바일) + DesktopModal (데스크톱) 분기 룰 — `useIsDesktop` 훅 기반, `ModalWrapper = isDesktop ? DesktopModal : BottomSheet` (line 387)
- CheckpointsPage(24) 와 거의 동일한 BottomSheet/DesktopModal 함수 (이 wave 는 박제만 — 공통 추출은 별도 task, 이 wave 범위 밖)
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6.4 / §6.5 / §6.8 / §7.1 의 verbatim 룰 박제
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 26-staff-manage 적용 여부 (26-staff-manage = `/staff-manage` BottomNav 노출 페이지, App.tsx 기본 헤더는 사용 X (페이지 내부 상단 헤더) — chrome 룰 직접 적용 X. BottomSheet/DesktopModal 모달은 별도 패턴.)
- 메모리 룰 12건 inline 인용 — 26-staff-manage 특화 룰 2건 (admin 권한 가드 보존 + 비밀번호 초기화 confirm 룰 변경 금지) 포함
- §6 negative rule (이 wave 에서 금지된 것)
- §7 open questions 6건 — W2 진입 직전 사용자 컨펌

---

# §1. StaffManagePage.tsx 인벤토리

단일 파일 530 lines, 4 sub-area (1. 외곽+admin 가드 (imports / 인라인 SVG IconUserPlus / `<style>` keyframes / 스타일 상수 / 상태/폼 타입) / 2. 헤더 (데스크톱: 직원 관리 타이틀 + 카운트 + 직원 추가 버튼 / 모바일: 카운트 only) / 3. 콘텐츠 (모바일 카드 + 데스크톱 테이블 7 컬럼 + skeleton/error/empty + 모바일 FAB) / 4. BottomSheet+DesktopModal + StaffModalContent 등록 폼 (8 필드 + role toggle + confirmReset + confirmDeactivate) + ReplaceModalContent (교체 모달, 2× staffApi.update 시퀀스) — 통합 sub-area) 로 정리. line 범위는 실측 (Read 검증, 24-checkpoints W1 §1 동일 방식).

**26-staff-manage 의 구조 특이성** (머리말 박스):

- **단일 파일** — StaffManagePage.tsx 530 lines, 외부 컴포넌트 import 없음 (BottomSheet / DesktopModal / StaffModalContent / ReplaceModalContent / StaffCard 모두 동 파일 내부 정의)
- **admin 전용 페이지** — `me?.role !== 'admin'` 이면 `navigate('/dashboard', { replace: true })` + `return null` (line 371~373, line 385). admin 가드 비즈 로직 1 byte 변경 금지.
- **BottomNav 노출 페이지** — `/staff-manage` ∉ `MOBILE_NO_NAV_PATHS`. 모바일 하단 BottomNav 표시됨. 모바일 FAB (line 505~513) 는 `position: sticky / bottom: 0` 으로 BottomNav 위 sticky.
- **자체 헤더 없음** — App.tsx 기본 헤더 (또는 BottomNav 와 함께 공통 헤더) 사용. 페이지 내부 상단은 데스크톱 ("직원 관리" + 카운트 + "직원 추가" 버튼, line 398~408) 또는 모바일 (카운트 only, line 409~413) 분기.
- **BottomSheet/DesktopModal 분기 비즈 로직** — `useIsDesktop()` 훅 → `ModalWrapper = isDesktop ? DesktopModal : BottomSheet` (line 387). 두 함수 모두 `style={{...}}` 인라인 마크업, `BottomSheet` 는 slideUp 애니메이션 + 16/16/0/0 radius + handle bar 32x4, `DesktopModal` 은 12 radius + width 440 + boxShadow. CheckpointsPage(24) 동일 함수 — 공통화 OQ #1.
- **ReplaceModalContent 교체 모달** (line 81~149) — 사용자가 직원 교체 버튼 클릭 시 별도 모달. `window.__openReplaceModal` 훅으로 StaffModalContent 에서 트리거 (line 292, 365~368). 2× staffApi.update 시퀀스: (1) 신규 직원에 shiftOffset+shiftFixed 이전 (2) 기존 직원 비활성화 + phone/email 삭제 + shiftOffset+shiftFixed 제거. 이 wave 는 인라인 박제만.
- **직급 정렬** (line 347~354, 380~383) — `rankOfTitle` 함수: 대리=0 / 주임=1 / 기사=2 / 기타=3. staffList sort 비교: rank 차 0 이면 id (사번) 오름차순. 비즈 룰 변경 금지.
- **사번 10자리 검증** (line 194) — `if (!/^\d{10}$/.test(form.id)) { toast.error('사번은 10자리 숫자여야 합니다'); return }`. 등록/수정 정규식 변경 금지.
- **appointedAt 사번 앞 8자리 자동 채움** (line 224~233) — 사번 앞 8자리 `^[0-9]{8}$` 매칭 시 `YYYY-MM-DD` 포맷으로 readonly 입력. 비즈 로직 변경 금지.
- **shiftOffset / shiftFixed 폼 필드는 UI 미노출** — `EMPTY_STAFF_FORM` (line 76~78) 와 edit 모드 초기화 (line 157) 에 존재하지만 폼 input 미노출 (StaffModalContent 내부 line 204~275 의 8 필드: 이름 / 사번 / 연락처 / 이메일 / 입사일 / 생년월일 / 직책 / 역할). shiftOffset+shiftFixed 변경은 ReplaceModalContent 의 staffApi.update 호출에서만 발생 — OQ #3.
- **React Query 1건 queryKey** — `['staff-list']` (line 87 ReplaceModal / line 376 메인 list / invalidate line 106, 168, 174, 186)
- **useMutation 4건** — create (line 166~170) / update (line 172~176) / resetPw (line 178~182) / deactivate (line 184~188). ReplaceModalContent 는 useMutation 안 쓰고 직접 await 시퀀스 (line 99~108).
- **confirm 2종** — `confirmReset` (비밀번호 초기화 line 257~273) + `confirmDeactivate` (비활성화 line 277~312). 둘 다 인라인 박스 + 빨간/주황 색 + 작은 버튼 2개.

## §1.1 sub-area 인벤토리 표

| sub-area | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. 외곽 + admin 가드 | imports (useState/useEffect/useNavigate/useQuery/useMutation/useQueryClient/toast/useAuthStore/staffApi/useIsDesktop/types) | 1~8 | 정적 import | api / authStore / react-query / react-hot-toast | 보존만 |
| 1. 외곽 + admin 가드 | IconUserPlus SVG (size+color prop, viewBox 24x24 strokeWidth 2) | 11~20 | 인라인 SVG 아이콘 | 단일 사용처 — 헤더 데스크톱 (line 405) + 모바일 FAB (line 509) | W5 (Lucide UserPlus 치환 검토 — OQ #6) |
| 1. 외곽 + admin 가드 | INPUT_STYLE + LABEL_STYLE 상수 (height 44 / bg var(--bg3) / radius 8 / padding 0 12 / fontSize 14 / focus border-color var(--acl)) | 60~67 | 인라인 스타일 상수 | width 100% / boxSizing border-box | W4 (토큰 치환 검토) |
| 1. 외곽 + admin 가드 | StaffFormState + EMPTY_STAFF_FORM (10 키: name/id/phone/email/appointedAt/birthDate/title/role/shiftOffset/shiftFixed, 단 폼 UI 는 8 필드) | 70~78 | 폼 state 타입 | shiftOffset+shiftFixed 는 UI 미노출 (ReplaceModal 에서만 변경) | 보존만 |
| 1. 외곽 + admin 가드 | SKELETON_STYLE (`bg var(--bg3) / borderRadius 12 / height 64 / blink 2s ease-in-out infinite`) | 342~345 | 스켈레톤 스타일 상수 | reusable | W3 |
| 1. 외곽 + admin 가드 | rankOfTitle 정렬 함수 (대리=0/주임=1/기사=2/기타=3) | 347~354 | 직급 정렬 | staffList sort 비교 | 보존만 (변경 금지) |
| 1. 외곽 + admin 가드 | StaffManagePage default export 시작 + useState 2종 (modal / replaceModal) + useIsDesktop | 357~362 | 페이지 wrapper | useAuthStore 의 `me` 추출 | 보존만 |
| 1. 외곽 + admin 가드 | window.__openReplaceModal 훅 useEffect (등록 + cleanup) | 365~368 | 교체 모달 cross-trigger | StaffModalContent line 292 에서 100ms setTimeout 호출 | 보존만 (변경 금지) |
| 1. 외곽 + admin 가드 | admin 가드 useEffect (`me?.role !== 'admin'` → `navigate('/dashboard', { replace: true })`) | 371~373 | 권한 가드 비즈 로직 | useAuthStore.staff.role 체크 | 보존만 (변경 금지) |
| 1. 외곽 + admin 가드 | staffList useQuery (`['staff-list']`, staleTime 30_000) + sort (rankOfTitle + id 오름차) | 375~383 | 직원 목록 fetch | staffApi.list | 보존만 |
| 1. 외곽 + admin 가드 | `if (me?.role !== 'admin') return null` (early return) | 385 | 렌더 직전 가드 | admin 외 빈 화면 | 보존만 |
| 1. 외곽 + admin 가드 | ModalWrapper = isDesktop ? DesktopModal : BottomSheet | 387 | 모달 분기 | useIsDesktop 훅 기반 | W4 (CheckpointsPage 공통화 OQ #1) |
| 1. 외곽 + admin 가드 | 외곽 wrapper (`flex column / bg var(--bg) / height 100% / overflow hidden`) | 389~390 | 페이지 wrapper | bg `--bg` → `--surface-page` 토큰 치환 OK | W2 |
| 1. 외곽 + admin 가드 | `<style>` 태그 (keyframes blink + slideUp + input/select focus border-color) | 391~395 | 전역 스타일 (페이지 scope) | blink (skeleton) + slideUp (BottomSheet) + focus 색 `var(--acl)` | W2 (CSS 토큰 알리아스 검토) |
| 2. 헤더 | 데스크톱 헤더 (`flex / alignItems center / padding 12px 24px / borderBottom var(--bd)`) — "직원 관리" 타이틀 + 카운트 + "직원 추가" 버튼 (height 36 bg var(--acl) IconUserPlus size 16) | 398~408 | 데스크톱 상단 영역 | isDesktop 분기 / `staffList.length`명 / mode='add' modal 트리거 | W2 |
| 2. 헤더 | 모바일 헤더 (`flex / alignItems center / padding 8px 16px / flexShrink 0`) — 카운트 only (`{staffList.length}명`, fontSize 12, var(--t3)) | 409~413 | 모바일 상단 영역 | isDesktop 분기 | W2 |
| 3. 콘텐츠 (목록) | 콘텐츠 wrapper (`flex 1 / overflow auto / minHeight 0`) | 416 | scroll 영역 | flex 1 채움 | W3 |
| 3. 콘텐츠 (목록) | skeleton 3개 (`SKELETON_STYLE`) | 417~423 | loading 상태 | isLoading | W3 |
| 3. 콘텐츠 (목록) | 에러 (`'데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요'`) | 424~428 | error state | isError && !isLoading | W3 |
| 3. 콘텐츠 (목록) | 데스크톱 테이블 (`<table>` head 7 컬럼: 이름/사번/직책/역할/연락처/상태/액션) | 431~486 | 데스크톱 카드 리스트 | staffList.map / onClick edit modal / 사번 폰트 JetBrains Mono | W3 |
| 3. 콘텐츠 (목록) | 데스크톱 테이블 empty (`'등록된 직원이 없습니다'`, colSpan 7) | 446~448 | data empty | staffList.length === 0 | W3 |
| 3. 콘텐츠 (목록) | role 배지 (테이블 line 460~466) — admin: `rgba(59,130,246,.13)` + `var(--acl)` / assistant: `rgba(110,118,129,.15)` + `var(--t2)`, fontSize 10 | 459~467 | 데스크톱 role 표시 | s.role === 'admin' 분기 + 한글 라벨 '관리자' / '보조자' | W3 |
| 3. 콘텐츠 (목록) | 상태 dot 라벨 (테이블 line 470~476) — 활성 `var(--safe)` / 비활성 `var(--t3)`, fontSize 11 | 469~476 | 데스크톱 상태 표시 | s.active !== 0 분기 + 라벨 '활성' / '비활성' | W3 |
| 3. 콘텐츠 (목록) | StaffCard (모바일 카드) — 8x8 dot bg `var(--safe)`/`var(--t3)` + name fontSize 16 + title fontSize 12 + role 배지 fontSize 9 + id JetBrains Mono + '수정 ▸' | 318~339 | 모바일 카드 컴포넌트 | onClick edit / s.active===0 opacity 0.5 / borderRadius 12 + bg var(--bg3) | W3 |
| 3. 콘텐츠 (목록) | 모바일 카드 리스트 (`StaffCard` map) | 489~501 | 모바일 카드 리스트 | staffList.map / onClick edit | W3 |
| 3. 콘텐츠 (목록) | 모바일 카드 empty (`'등록된 직원이 없습니다' + '직원 추가 버튼을 눌러 첫 번째 직원을 등록하세요'`) | 491~495 | empty + 안내 | staffList.length === 0 / padding 60px 16px | W3 |
| 3. 콘텐츠 (목록) | 모바일 FAB (`sticky bottom + padding 0 16 + bg var(--acl) + IconUserPlus 18 + '직원 추가' + paddingBottom calc(16px + var(--sab)) + height 52`) | 505~513 | mode='add' modal 트리거 | onClick setModal({open,mode:'add'}) / sab safe-area-inset-bottom | W3 |
| 4. 모달 wrapper + 폼 | BottomSheet 함수 (overlay `rgba(0,0,0,0.6)` + bg `var(--bg2)` + radius 16/16/0/0 + slideUp 0.28s + maxHeight 90vh + handle bar 32x4) | 22~40 | 모바일 모달 | onClose backdrop click / e.target === e.currentTarget | W4 |
| 4. 모달 wrapper + 폼 | DesktopModal 함수 (overlay `rgba(0,0,0,0.5)` + bg `var(--bg2)` + radius 12 + width 440 + maxHeight 85vh + boxShadow `0 8px 32px rgba(0,0,0,.18)`) | 42~57 | 데스크톱 모달 | onClose backdrop click | W4 |
| 4. 모달 wrapper + 폼 | StaffModalContent useState 2건 (confirmReset / confirmDeactivate) + form state (mode==='edit' 시 staff 데이터로 초기화, shiftOffset 숫자→문자열 / shiftFixed null→'') | 151~161 | 모달 본문 state | mode 분기 + StaffFull 데이터 | 보존만 |
| 4. 모달 wrapper + 폼 | createMutation (staffApi.create / onSuccess invalidate + toast + onClose) | 166~170 | 등록 비즈 로직 | 사번 10자리 검증 선행 | 보존만 (1 byte 변경 금지) |
| 4. 모달 wrapper + 폼 | updateMutation (staffApi.update(staff!.id, payload: StaffUpdatePayload)) | 172~176 | 수정 비즈 로직 | onSuccess invalidate + toast '직원 정보가 수정되었습니다' | 보존만 (1 byte 변경 금지) |
| 4. 모달 wrapper + 폼 | resetPwMutation (staffApi.resetPassword(staff!.id)) | 178~182 | 비밀번호 초기화 비즈 로직 | onSuccess toast '비밀번호가 초기화되었습니다 (사번 뒷 4자리)' + setConfirmReset(false) | 보존만 (1 byte 변경 금지) |
| 4. 모달 wrapper + 폼 | deactivateMutation (staffApi.update(staff!.id, { active: 0 })) | 184~188 | 비활성화 비즈 로직 | onSuccess invalidate + toast '직원이 비활성화되었습니다' | 보존만 (1 byte 변경 금지) |
| 4. 모달 wrapper + 폼 | canSave + handleSave + 사번 10자리 정규식 + mode 분기 | 190~200 | 액션 핸들러 | form.name.trim() !== '' && form.id.trim() !== '' / `/^\d{10}$/` | 보존만 |
| 4. 모달 wrapper + 폼 | 폼 필드 1 — 이름 input (required + placeholder '홍길동' + 빨간 *) | 207~210 | 폼 필드 1 | required | W4 |
| 4. 모달 wrapper + 폼 | 폼 필드 2 — 사번 input (JetBrains Mono + placeholder '0000000000' + inputMode 'numeric' + edit 시 disabled + opacity 0.5) | 211~214 | 폼 필드 2 | required + 10자리 | W4 |
| 4. 모달 wrapper + 폼 | 폼 필드 3 — 연락처 input (placeholder '010-0000-0000' + type 'tel') | 215~218 | 폼 필드 3 | optional | W4 |
| 4. 모달 wrapper + 폼 | 폼 필드 4 — 이메일 input (placeholder 'email@example.com' + type 'email') | 219~222 | 폼 필드 4 | optional | W4 |
| 4. 모달 wrapper + 폼 | 폼 필드 5 — 입사일 input (사번 앞 8자리 자동 채움 + readonly + opacity 0.5 + 보조 라벨 '(사번 앞 8자리에서 자동)', fontSize 10) | 223~234 | 폼 필드 5 (auto) | 정규식 `/^[0-9]{8}$/` 매칭 시 `YYYY-MM-DD` | W4 (verbatim 보존) |
| 4. 모달 wrapper + 폼 | 폼 필드 6 — 생년월일 input (type 'date' + 보조 라벨 '(휴가신청서 자동 채움)', fontSize 10) | 235~238 | 폼 필드 6 | optional | W4 |
| 4. 모달 wrapper + 폼 | 폼 필드 7 — 직책 input (placeholder '소방안전관리자') | 239~242 | 폼 필드 7 | optional | W4 |
| 4. 모달 wrapper + 폼 | 폼 필드 8 — 역할 toggle button row (admin '관리자' / assistant '보조자', height 36 + fontSize 12 + border 1px solid var(--bd) + selected: bg var(--acl) / unselected: bg var(--bg4)) | 243~253 | 폼 필드 8 (role toggle) | onClick setForm 토글 / `flex 1 / height 36 / fontSize 12` | W4 (OQ #3 height 격상 검토) |
| 4. 모달 wrapper + 폼 | confirmReset 영역 (edit 모드 only) — 토글 링크 ('비밀번호 초기화', var(--warn) underline) → 확인 박스 (`rgba(245,158,11,.08)` + 카피 + 취소/초기화 버튼 height 32) | 255~274 | 비밀번호 초기화 confirm | mode === 'edit' / setConfirmReset(true/false) / resetPwMutation.mutate() | W4 (verbatim 보존) |
| 4. 모달 wrapper + 폼 | 액션 영역 (취소 / 저장 버튼, height 44) + edit 시 비활성화 / 교체 버튼 row (height 40) + confirmDeactivate 안내 박스 + 빨간 비활성화 버튼 | 277~312 | 액션 row | canSave / isBusy / 비활성화 카피 / 교체 onClick → `window.__openReplaceModal?.(staff)` 100ms 지연 | W4 (verbatim 보존) |
| 4. 모달 wrapper + 폼 | ReplaceModalContent (교체 모달) — candidates filter (active===1 && shiftOffset===null && shiftFixed===null) / shiftLabel 3분기 / 2× staffApi.update 시퀀스 / select / 취소/교체 버튼 | 81~149 | 교체 모달 (별도 sub-area 통합) | window.__openReplaceModal 호출 시 진입 / toast `${oldStaff.name} → ${newStaff.name} 교체 완료` | W4 (verbatim 보존, 인라인 박제) |
| 4. 모달 wrapper + 폼 | 모달 호출 wrapper (`{modal.open && ...}` + `{replaceModal.open && replaceModal.target && ...}`) | 516~527 | 모달 진입 | modal.open / replaceModal.open | W4 |

## §1.2 line 수 실측 확인

```
$ wc -l cha-bio-safety/src/pages/StaffManagePage.tsx
     530 cha-bio-safety/src/pages/StaffManagePage.tsx
```

PLAN 추정치 + 26-staff-manage.md §2 메타 일치, drift 없음.

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

W5 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (15-daily-report SW3 portraitPos 좌표 시스템 보존 룰 일반화, memory `project_redesign_15_daily_report_status`):

```
[StaffManagePage.tsx 비즈 로직]
- import { useState, useEffect } from 'react'
- import { useNavigate } from 'react-router-dom'
- import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
- import toast from 'react-hot-toast'
- import { useAuthStore } from '../stores/authStore'
- import { staffApi } from '../utils/api'
- import { useIsDesktop } from '../hooks/useIsDesktop'
- import type { StaffFull, StaffUpdatePayload, Role } from '../types'

- admin 가드 (line 371~373 + 385, 변경 금지):
    useEffect(() => {
      if (me?.role !== 'admin') navigate('/dashboard', { replace: true })
    }, [me, navigate])
    if (me?.role !== 'admin') return null

- React Query queryKey 1건 (변경 금지):
    ['staff-list'] (line 87 ReplaceModal, line 376 main list)
    invalidate ['staff-list'] (line 106, 168, 174, 186)

- staffList useQuery (line 375~379, 변경 금지):
    queryKey ['staff-list']
    queryFn staffApi.list
    staleTime 30_000

- staffList sort (line 380~383, 변경 금지):
    rankOfTitle: 대리=0, 주임=1, 기사=2, 기타=3
    sort: rankOfTitle 차이 → 0 이면 id 오름차순 (a.id.localeCompare(b.id))

- createMutation (line 166~170, 변경 금지):
    staffApi.create({ id, name, role, title, phone?, email?, appointedAt?, birthDate? })
    onSuccess: invalidate ['staff-list'] + toast.success('직원이 추가되었습니다') + onClose
    onError: toast.error('저장에 실패했습니다. 입력값을 확인해 주세요')

- updateMutation (line 172~176, 변경 금지):
    staffApi.update(staff!.id, data: StaffUpdatePayload)
    onSuccess: invalidate ['staff-list'] + toast.success('직원 정보가 수정되었습니다') + onClose
    onError: toast.error('저장에 실패했습니다. 입력값을 확인해 주세요')

- resetPwMutation (line 178~182, 변경 금지):
    staffApi.resetPassword(staff!.id)
    onSuccess: toast.success('비밀번호가 초기화되었습니다 (사번 뒷 4자리)') + setConfirmReset(false)
    onError: toast.error('비밀번호 초기화에 실패했습니다')

- deactivateMutation (line 184~188, 변경 금지):
    staffApi.update(staff!.id, { active: 0 })
    onSuccess: invalidate ['staff-list'] + toast.success('직원이 비활성화되었습니다') + onClose
    onError: toast.error('비활성화에 실패했습니다')

- canSave (line 190, 변경 금지):
    form.name.trim() !== '' && form.id.trim() !== ''

- 사번 10자리 검증 (line 194, 변경 금지):
    if (!/^\d{10}$/.test(form.id)) { toast.error('사번은 10자리 숫자여야 합니다'); return }

- handleSave mode 분기 (line 192~200, 변경 금지):
    mode==='add': createMutation.mutate()
    mode==='edit': updateMutation.mutate({ name, role, title, phone?, email?, appointedAt?, birthDate: form.birthDate || null })

- isBusy = createMutation.isPending || updateMutation.isPending

- appointedAt 자동 채움 (line 227~230, 변경 금지):
    p = (form.id ?? '').slice(0, 8)
    /^[0-9]{8}$/.test(p) 시 `${p.slice(0,4)}-${p.slice(4,6)}-${p.slice(6,8)}`
    readonly + opacity 0.5

- shiftOffset / shiftFixed 비즈 데이터 (변경 금지):
    shiftOffset: 0|1|2|3|null (3교대 사이클 오프셋, memory project_div_compressor_pair 4-shift 룰 일치)
    shiftFixed: 'day'|null (평일 주간 고정)
    폼 UI 미노출, EMPTY_STAFF_FORM (line 76~78) + 초기화 (line 157) 에만 존재
    ReplaceModalContent 의 2× staffApi.update 시퀀스에서만 변경

- ReplaceModalContent 시퀀스 (line 81~149, 변경 금지):
    candidates = allStaff.filter(s => s.active === 1 && s.id !== oldStaff.id && s.shiftOffset === null && s.shiftFixed === null)
    shiftLabel = oldStaff.shiftFixed === 'day' ? '평일 주간 고정' :
                  oldStaff.shiftOffset !== null ? `3교대 (오프셋 ${oldStaff.shiftOffset})` : '미설정'
    1. await staffApi.update(selectedId, { shiftOffset: oldStaff.shiftOffset, shiftFixed: oldStaff.shiftFixed })
    2. await staffApi.update(oldStaff.id, { active: 0, phone: '', email: '', shiftOffset: null, shiftFixed: null })
    qc.invalidateQueries({ queryKey: ['staff-list'] })
    toast.success(`${oldStaff.name} → ${newStaff.name} 교체 완료`)
    toast.error(e.message || '교체 실패')

- rankOfTitle 함수 (line 347~354, 변경 금지):
    if (t.includes('대리')) return 0
    if (t.includes('주임')) return 1
    if (t.includes('기사')) return 2
    return 3

- window.__openReplaceModal 훅 (line 365~368, 변경 금지):
    useEffect(() => {
      (window as any).__openReplaceModal = (staff: StaffFull) => setReplaceModal({ open: true, target: staff })
      return () => { delete (window as any).__openReplaceModal }
    }, [])
    StaffModalContent line 292 호출:
      onClick={() => { onClose(); setTimeout(() => (window as any).__openReplaceModal?.(staff), 100) }}

- role 옵션 (line 246, 변경 금지):
    (['admin', 'assistant'] as Role[])
    라벨: admin → '관리자' / assistant → '보조자'

- ModalWrapper = isDesktop ? DesktopModal : BottomSheet (line 387)
- 모달 title 분기: modal.mode === 'add' ? '직원 추가' : '직원 수정' (line 517)
- 교체 모달 title: '직원 교체' (line 524)

- BottomSheet (line 22~40, 변경 금지):
    overlay: position fixed / inset 0 / bg rgba(0,0,0,0.6) / zIndex 50 / flex column / justifyContent flex-end
    panel: bg var(--bg2) / borderRadius 16px 16px 0 0 / animation slideUp 0.28s ease-out both / maxHeight 90vh / overflowY auto
    handle bar: width 32 / height 4 / bg var(--bd2) / radius 2 / paddingTop 12 (handle row)
    title: fontSize 16 / fontWeight 700 / color var(--t1) / padding '12px 16px 0'
    backdrop click close: e.target === e.currentTarget

- DesktopModal (line 42~57, 변경 금지):
    overlay: position fixed / inset 0 / bg rgba(0,0,0,0.5) / zIndex 50 / flex / alignItems center / justifyContent center
    panel: bg var(--bg2) / borderRadius 12 / width 440 / maxHeight 85vh / overflowY auto / boxShadow '0 8px 32px rgba(0,0,0,.18)'
    title: fontSize 16 / fontWeight 700 / color var(--t1) / padding '20px 24px 0'
    backdrop click close: e.target === e.currentTarget

[카피 verbatim 박스]
- '직원 관리' (데스크톱 헤더 타이틀, line 400)
- '{N}명' (카운트, line 401, 411)
- '직원 추가' (데스크톱 헤더 버튼 + 모바일 FAB, line 406, 510)
- '직원 추가' / '직원 수정' (모달 title, line 517)
- '직원 교체' (교체 모달 title, line 524)
- '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요' (error, line 426)
- '등록된 직원이 없습니다' (데스크톱 empty line 447 + 모바일 empty line 493)
- '직원 추가 버튼을 눌러 첫 번째 직원을 등록하세요' (모바일 empty 안내, line 494)
- '저장' / '취소' (모달 액션, line 280, 283)
- '비활성화' (edit 시 액션 row + confirmDeactivate panel, line 290, 308)
- '교체' (edit 시 액션 row, line 294)
- '이 직원을 비활성화합니다. 점검 기록은 보존됩니다.' (confirmDeactivate 안내, line 302)
- '비밀번호 초기화' (confirmReset 링크, line 259)
- '사번 뒷 4자리로 비밀번호를 초기화합니다. 계속하시겠습니까?' (confirmReset 안내, line 263)
- '초기화' (confirmReset 버튼, line 268)
- '관리자' / '보조자' (role 라벨, line 249)
- '활성' / '비활성' (상태, line 475)
- '수정 ▸' (모바일 카드 액션, line 336) / '수정' (테이블 액션, line 479)
- '(사번 앞 8자리에서 자동)' (입사일 보조 라벨, line 224)
- '(휴가신청서 자동 채움)' (생년월일 보조 라벨, line 236)
- placeholder verbatim 7건:
    '홍길동' (이름, line 209)
    '0000000000' (사번, line 213)
    '010-0000-0000' (연락처, line 217)
    'email@example.com' (이메일, line 221)
    '사번 입력 시 자동 채워짐' (입사일 readonly, line 231)
    '소방안전관리자' (직책, line 241)
    '선택하세요' (ReplaceModal select, line 132)
- ReplaceModal 카피:
    '근무 패턴을 이전합니다.' (안내, line 119)
    '근무 패턴:' (라벨, line 120)
    '기존 점검 기록은 보존되며, 개인정보(연락처/이메일)는 삭제됩니다.' (안내, line 121)
    '교체할 직원 선택' (라벨, line 125)
    '교체 가능한 직원이 없습니다. 먼저 "직원 추가"로 신규 직원을 등록해주세요.' (no candidates, line 128)
    '평일 주간 고정' / `3교대 (오프셋 ${N})` / '미설정' (shiftLabel, line 90~91)
    '교체' (버튼, line 145) / '처리 중...' (submitting, line 145)
    `${oldStaff.name} → ${newStaff.name} 교체 완료` (toast.success, line 107)
    '교체 실패' (toast.error 기본, line 110)
- toast 카피 verbatim:
    '직원이 추가되었습니다' (create onSuccess, line 168)
    '직원 정보가 수정되었습니다' (update onSuccess, line 174)
    '저장에 실패했습니다. 입력값을 확인해 주세요' (create+update onError, line 169, 175)
    '비밀번호가 초기화되었습니다 (사번 뒷 4자리)' (resetPw onSuccess, line 180)
    '비밀번호 초기화에 실패했습니다' (resetPw onError, line 181)
    '직원이 비활성화되었습니다' (deactivate onSuccess, line 186)
    '비활성화에 실패했습니다' (deactivate onError, line 187)
    '사번은 10자리 숫자여야 합니다' (handleSave 검증, line 194)

[외곽 hex / 색 토큰화 검토 영역]
- 외곽 wrapper bg var(--bg) → --surface-page 치환 OK (OQ #4)
- 카드/모달 bg var(--bg2) → --surface-raised 치환 OK
- input/select bg var(--bg3) → --surface-sunken 치환 OK (StaffCard + SKELETON 포함)
- button 비활성 bg var(--bg4) → --surface-active 치환 검토
- border var(--bd) → --border-default / var(--bd2) (handle bar) → --border-strong 치환 OK
- 텍스트 var(--t1)/--t2/--t3 → --text-primary/--text-secondary/--text-tertiary 치환 OK
- 액센트 var(--acl) → --accent-primary 또는 status-info 알리아스 치환 검토 (OQ #4)
- danger var(--danger) → --status-danger 치환 OK (별 표시 + confirmDeactivate)
- safe var(--safe) → --status-safe-bar 치환 OK (활성 dot + '활성' 라벨)
- warn var(--warn) → --status-warning-bar 치환 검토 (confirmReset 링크 + 교체 버튼)
- role 배지 admin rgba(59,130,246,.13) + var(--acl) → status-info bg + acl 알리아스 치환 검토 (OQ #5)
- role 배지 assistant rgba(110,118,129,.15) + var(--t2) → 회색 surface 알리아스 치환 검토
- confirmDeactivate 안내 rgba(239,68,68,.08) → status-danger-bg 치환 OK (line 301)
- confirmReset 안내 rgba(245,158,11,.08) → status-warning-bg 치환 OK (line 262)
- 교체 버튼 rgba(245,158,11,.1) + #d97706 → status-warning + 알리아스 치환 검토 (line 293)
- ReplaceModal info 박스 rgba(59,130,246,.08) → status-info-bg 치환 OK (line 118)
- SVG IconUserPlus → Lucide UserPlus 치환 검토 (OQ #6, size 16/18)
- duty 토큰 매핑 — 현재 StaffManagePage 는 duty 색 미사용. 카드에 근무 패턴 표시 신규 도입 검토 → OQ #6
```

위 모든 식별자/값은 §6 negative rule + §5 룰 11/12 + §7 OQ #1~#6 default 답에서 재확인. 1 byte 변경 시 W5 verify FAIL.

---

# §2. sub-wave 분배 + TSX checklist

## §2.1 sub-wave 표 (3개)

| sub-wave | 슬러그 | 영역 | 산출 sketch | 라인 추정 | 비즈 anchor 포함? |
|---|---|---|---|---|---|
| W2 | `sketch-wave-2-frame-header.html` | 외곽 wrapper + admin 가드 (시각) + `<style>` keyframes (blink/slideUp) 토큰화 + 헤더 (데스크톱 직원 관리+카운트+직원 추가 / 모바일 카운트 only) | sketch HTML | 120~200 | admin 가드 visual placeholder / 헤더 카피 verbatim / bg --bg→--surface-page |
| W3 | `sketch-wave-3-list-fab.html` | 콘텐츠 (모바일 카드 리스트 + 데스크톱 테이블 7 컬럼 + skeleton/error/empty + 모바일 FAB) | sketch HTML | 240~340 | StaffCard 8x8 dot+role 배지+'수정 ▸' / 테이블 7 컬럼 / role 배지 admin/assistant / 상태 dot 활성/비활성 / SKELETON 64 / empty 카피 verbatim / FAB IconUserPlus 18 + sab |
| W4 | `sketch-wave-4-modal-form.html` | BottomSheet (모바일) + DesktopModal (데스크톱) wrapper + StaffModalContent 등록 폼 (8 필드 + role toggle + confirmReset + confirmDeactivate + 교체 버튼) + ReplaceModalContent (인라인 박제) | sketch HTML | 320~460 | BottomSheet/DesktopModal CSS verbatim / 폼 필드 8 + placeholder + canSave + isBusy + confirmReset/Deactivate 안내 verbatim / role toggle / ReplaceModal 안내 verbatim |

> 3 sub-wave 분할 기준:
> - W2: 외곽+가드+keyframes+헤더 통합 (24-checkpoints W2+W3 통합 — 헤더가 모바일/데스크톱 분기지만 카운트 only 모바일 + 단순 데스크톱 한 줄로 가벼움).
> - W3: 콘텐츠 영역 단독 — 데스크톱 테이블 7 컬럼 + 모바일 카드 + 4 상태 (skeleton/error/empty/data) + 모바일 FAB. 24-checkpoints W4 와 유사.
> - W4: 모달 + 폼 + ReplaceModal 통합 — BottomSheet/DesktopModal 분기 + 등록 폼 8 필드 + confirmReset + confirmDeactivate + 교체 버튼 + ReplaceModalContent. 24-checkpoints W5 와 유사하지만 ReplaceModal 추가로 약간 무거움.

## §2.2 TSX 변환 (W5) checklist

| 항목 | 룰 |
|---|---|
| 비즈 anchor §1.3 전체 | 1 byte 변경 금지 (admin 가드 / staffApi 4종 / useMutation 4건 / ReplaceModal 2× update 시퀀스 / queryKey ['staff-list'] / rankOfTitle / 사번 10자리 정규식 / appointedAt 자동 채움 / shiftOffset+shiftFixed 비즈 데이터 / window.__openReplaceModal 훅 / role 옵션 / 카피 verbatim + placeholder 7건 + toast 8건 + ReplaceModal 카피) |
| 인라인 `style={{...}}` 제거 | Tailwind utility 치환 — 단, BottomSheet slideUp animation + handle bar 등 키프레임 의존 영역은 className + `<style>` 그대로 유지 또는 tailwind.config extend |
| `lg:*` prefix | 레이아웃 차이 (모바일 카드 / 데스크톱 테이블 / 모바일 카운트 only / 데스크톱 헤더 한 줄) 에만 사용 — spacing 분기는 토큰 자동 |
| 모달 chrome | 02+06 chrome 룰 직접 적용 X. BottomSheet/DesktopModal 은 별도 패턴 — CheckpointsPage(24) 와 공통화는 별도 task (OQ #1) |
| 외곽 hex 변경 | var(--bg)/--bg2/--bg3/--bg4/--bd/--bd2/--t1/--t2/--t3/--acl/--safe/--danger/--warn → --surface-page/--raised/--sunken/--active/--border-default/--border-strong/--text-primary/--secondary/--tertiary/--accent-primary/--status-safe-bar/--status-danger/--status-warning-bar 치환 OK (design-system.md §4.1) |
| 폰트 격상 | fontSize 9 (StaffCard role 배지 line 327) 금지 — text-caption(12) 격상. fontSize 10 (테이블 role 배지 line 461 / 보조 라벨 line 224, 236) / 11 (테이블 status line 471) → text-caption 격상 (OQ #5). 12 → text-caption / 13 → text-label / 14 → text-body-sm / 16 → text-body |
| 폰트 위계 모달 | 모달 title fontSize 16 → text-body 또는 text-title 격상 검토 |
| Lucide 치환 | IconUserPlus SVG → `<UserPlus size={16} />` (헤더 데스크톱) + `<UserPlus size={18} />` (모바일 FAB) (OQ #6) |
| toast | react-hot-toast 그대로 사용 |
| useAuthStore | `me?.role !== 'admin'` 가드 보존 (useEffect + early return 둘 다) |
| 비즈 카피 | §1.3 카피 verbatim + placeholder 7건 + toast 8건 + ReplaceModal 카피 모두 보존 |
| FAB safe-area | `paddingBottom: calc(16px + var(--sab))` 보존 (line 506) — iOS PWA safe-area-inset-bottom 룰 |
| CheckpointsPage 공통화 | BottomSheet / DesktopModal 함수 공통 추출은 별도 task (OQ #1). 이 wave 는 둘 다 동 파일 인라인 보존. |
| window.__openReplaceModal | useEffect 등록 + cleanup + 100ms setTimeout 호출 패턴 그대로. React 19 안티-패턴이지만 동작 유지. |

---

# §3. design-system.md v0.1.1 fence verbatim 7건

design-system.md (v0.1.1) 의 다음 7 fence 를 verbatim 인용 (변형 금지, header 포함 그대로):

## §3.1 §1.1 노안 친화가 모든 결정보다 우선

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

(메타) — StaffManagePage 의 fontSize 9 (StaffCard role 배지 line 327), 10 (테이블 role 배지 line 461 / 입사일·생년월일 보조 라벨 line 224, 236), 11 (테이블 상태 line 471) 모두 §1.1 위반 → 격상 필수. OQ #5.

## §3.2 §1.2 정보 인지 > 미적 정제

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

(메타) — StaffManagePage 의 직원 카드는 모바일/데스크톱 모두 이름(16) + 직책(12) + role 배지(9→12) + 사번(12 JetBrains Mono) + 상태(11→12) 의 위계가 명확해야 함. §1.2 정보 위계 원칙 준수.

## §3.3 §1.3 모바일/데스크톱은 같은 시스템, 다른 밀도

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

(메타) — StaffManagePage 는 모바일 카드 리스트 ↔ 데스크톱 테이블 7 컬럼, 모바일 카운트 only ↔ 데스크톱 헤더 한 줄 (직원 관리+카운트+직원 추가) 로 §1.3 룰 일치 (레이아웃이 분기 책임). 폰트는 모바일/데스크톱 동일 유지.

## §3.4 §6.4 Backgrounds & Gradients

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

(메타) — StaffManagePage 는 그라데이션 사용 없음. 저장 버튼 / 직원 추가 버튼 모두 단색 `var(--acl)`. 교체 버튼은 단색 `#f59e0b` (ReplaceModal) / `rgba(245,158,11,.1)` (StaffModal 액션). §6.4 룰 일치 — 그라데이션 신규 도입 금지 (OQ #2 'CTA 버튼 §6.4 그라데이션 적용?' default 답 = 미적용).

## §3.5 §6.5 Hover & Press States

```
### 6.5 Hover & Press States

- **hover**: `border-color` 강화 (`default` → `strong`) + `translateY(-1px)` 미세 상승, **또는** background 한 단계 진하게 (`raised` → `sunken`)
- **press/active**: 별도 스타일 없음 (웹 기반 PWA, 네이티브 제스처 의존)
- **링크**: 별도 hover 없음, `--text-link` 색만
```

(메타) — 데스크톱 테이블 row hover 가 `e.currentTarget.style.background = 'var(--bg3)'` 인라인 변경 (line 453~454) — §6.5 의 "background 한 단계 진하게 (raised → sunken)" 일치. TSX 변환 시 Tailwind `hover:bg-surface-sunken` 치환 가능.

## §3.6 §6.8 Layout Rules

```
### 6.8 Layout Rules

- **모바일**: 단일 컬럼, 그리드 기반 (2열 또는 4열 통계)
- **데스크톱**: 좌/우 분할 (flex, 우측 고정폭 340px), 또는 좌(50%)/우(50%)
- **페이지 패딩**: 모바일 16px, 데스크톱 24px (자동 분기, `--page-padding`)
- **네비게이션**: 모바일 BottomNav, 데스크톱 사이드바
- **자체 헤더 페이지 다수** (App.tsx 헤더 숨김 패턴) — 상세 페이지/도면/DIV/일정/일지/법정점검 등
```

(메타) — 26-staff-manage 는 모바일 단일 컬럼 + 데스크톱 단일 컬럼 (좌우 분할 X). 자체 헤더 페이지 군 X — App.tsx 기본 헤더 사용 (페이지 내부 상단 헤더는 데스크톱: 직원 관리+카운트+직원 추가 / 모바일: 카운트 only). 모바일 BottomNav 노출, FAB 는 BottomNav 위 sticky.

## §3.7 §7.1 Icon System: Lucide

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

(메타) — StaffManagePage 의 IconUserPlus (line 11~20, 헤더 16 / FAB 18) 인라인 SVG → Lucide `<UserPlus />` 치환 (OQ #6). 데스크톱 헤더 16 / 모바일 FAB 18 → 16 또는 20 (§7.1 사이즈 룰 "16 / 20 / 24 px 세 종류만").

---

# §4. components.css inherit 매핑

26-staff-manage 는 components.css 신규 추가 / 수정 0 (단일 페이지 + CheckpointsPage(24) 와 공통 모달 패턴이지만 공통 추출은 별도 task — 이 wave 범위 밖).

## §4.1 재사용 (기존 components.css / tokens.css 그대로 사용)

| 컴포넌트 | 출처 | 26-staff-manage 사용처 |
|---|---|---|
| `.bg-surface-page` / `.bg-surface-raised` / `.bg-surface-sunken` / `.bg-surface-active` | tokens.css | 외곽 / 카드+모달 / input+StaffCard / 비활성 버튼 |
| `.text-text-primary` / `.text-text-secondary` / `.text-text-tertiary` | tokens.css | 본문 / 보조 / 메타 |
| `.text-status-safe-bar` / `.text-status-danger` / `.text-status-warning-bar` | tokens.css | 활성 dot+'활성' / 비활성화 버튼+confirmDeactivate / confirmReset 링크+교체 버튼 |
| `.bg-status-info-bg` / `.text-status-info` (또는 `--accent-primary` 알리아스) | tokens.css | role 배지 admin (`rgba(59,130,246,.13)` + var(--acl)) + ReplaceModal info 박스 (`rgba(59,130,246,.08)`) |
| `.bg-status-danger-bg` (`rgba(239,68,68,.08)`) | tokens.css | confirmDeactivate 안내 박스 + 비활성화 버튼 |
| `.bg-status-warning-bg` (`rgba(245,158,11,.08)`) | tokens.css | confirmReset 안내 박스 + 교체 버튼 |
| `.text-caption` / `.text-label` / `.text-body-sm` / `.text-body` | typography.css | placeholder / 라벨 / 본문 |
| `.rounded-md` (12) / `.rounded-lg` (16) / `.rounded-sm` (8) | tokens.css | 카드 / 모달 / input·button |
| `.btn` / `.btn-primary` / `.btn-secondary` (14-reports components.css) | 14-reports | 저장 / 취소 / 비활성화 액션 row (검토) |

## §4.2 신규 추가 (이 wave 에서 새로 정의)

| 컴포넌트 | 정의 위치 | 사유 |
|---|---|---|
| **없음** | — | CheckpointsPage 공통화는 별도 task. BottomSheet/DesktopModal/StaffModalContent/ReplaceModalContent/StaffCard/SKELETON 모두 동 파일 인라인 유지 (이 wave 범위). |

> CheckpointsPage(24) 와 BottomSheet/DesktopModal 함수가 거의 동일 — 공통 컴포넌트 `src/components/ui/Modal.tsx` 또는 `Sheet.tsx` 추출은 24-checkpoints + 26-staff-manage 양쪽 wave 종결 후 별도 task 권장 (OQ #1 default = 미공통화, 이 wave 는 인라인 보존).

---

# §5. 메모리 룰 inline 인용 (≥10 unique slug)

다음 12 메모리 룰 slug 를 inline 으로 박제 (변경 시 W5 verify FAIL):

1. **`feedback_design_sketch_first`** — spacing/sizing 도 sketch HTML 로 시안 보여주고 승인 받은 후 인라인 적용. 26-staff-manage W2/W3/W4 sketch 는 사용자 컨펌 필수.
2. **`feedback_design_changes_ask_first`** — 버그 수정이라도 레이아웃 구조/표시 방식 변경은 사용자와 상의 후. 26-staff-manage 의 BottomSheet/DesktopModal 공통화 / 폰트 격상 / Lucide 치환 / role toggle UI 변경 / shift_offset+shift_fixed 폼 노출 검토 모두 OQ 거쳐 컨펌.
3. **`feedback_redesign_sketch_rule_enforcement`** — §6.2/§6.3/§7.1 negative rule + 일관성 + executor 프롬프트 + verify gate + 자체 검수 4중 강화. 26-staff-manage 도 동일 룰 강제.
4. **`feedback_sketch_realistic_data`** — 표시 분기/라벨 룰 (없음/N개/X-Y/완료) 은 코드 그대로. 시안은 시각 디자인만. 26-staff-manage 의 rankOfTitle 직급 정렬 / shiftLabel ('평일 주간 고정' / `3교대 (오프셋 N)` / '미설정') / role 라벨 ('관리자' / '보조자') / 상태 라벨 ('활성' / '비활성') 모두 코드 그대로.
5. **`feedback_tsx_wave_stat_card_drift`** — executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. W5 plan 에 sketch CSS verbatim 인용 + verify gate 권장.
6. **`feedback_planner_prompt_sketch_verbatim`** — 변환 wave 시 sketch CSS 정의 grep 추출 verbatim 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
7. **`feedback_tailwind_token_class_pattern`** — `status-` prefix 없음 (`text-fire-bar` O / `text-status-fire-bar` X) + lucide `size={N}` prop. 26-staff-manage W5 시 동일 패턴 강제.
8. **`feedback_tailwind_w8_h8_is_48px`** — tailwind.config spacing override: `w-8` = 48 (기본 32 아님), `w-7` = 32. 26-staff-manage 의 8x8 dot (StaffCard line 321 / 테이블 line 474) / handle bar 32x4 (line 32) / role 배지 / SKELETON height 64 / FAB height 52 모두 arbitrary `w-[Npx]` 또는 utility 정확 매핑.
9. **`feedback_text_caption_leading_none`** — 작은 컨테이너 안 `text-caption` lh:1.5 (18px) 가 `h-8` (32px) 안에서도 시각적 패딩. role 배지 / 모바일 카드 액션 '수정 ▸' / 테이블 status / 카운트 라벨 / 입사일·생년월일 보조 라벨 모두 `leading-none` 명시 검토.
10. **`feedback_avoid_premature_confirmation`** — 변경 후 "approved 주세요" 자제. 시각 작업에서 "거의 일치" 같은 자신감 표현 금지. 26-staff-manage W2/W3/W4 sketch 결과는 보여주고 사용자 판단.
11. **`project_redesign_15_daily_report_status`** — 캘리브 좌표 시스템 100% 보존 패턴 일반화 → 26-staff-manage 의 비즈 anchor (admin 가드 / staffApi 4종 / useMutation 4건 / ReplaceModal 2× update 시퀀스 / queryKey ['staff-list'] / rankOfTitle / 사번 10자리 정규식 / appointedAt 자동 채움 / shiftOffset+shiftFixed 데이터 / window.__openReplaceModal 훅 / role 옵션 / 카피 verbatim) 1 byte 변경 금지.
12. **`feedback_cbc7119_design_never_wrangler`** — 디자인 wave 중 wrangler 절대 X. 26-staff-manage W1/W2/W3/W4/W5 모두 wrangler 금지. main push 자동 cbc7119-preview 만.

추가 26-staff-manage 특화 메모리 룰 2건 (위 12 와 함께 강제):

- **`project_div_compressor_pair`** — DIV+컴프 cycle 룰 동일 적용 → 26-staff-manage 의 shiftOffset 0~3 4-shift 사이클 변경 금지. shift_offset 옵션 / 사이클 길이 / 패턴 변경 시 운영 출근부 깨짐.
- **`project_meal_calc_rules`** — 식대 계산 (5500원/끼) 의 근무 패턴 의존. shiftOffset+shiftFixed 변경 시 식대 계산 깨짐.

---

# §6. negative rule (이 wave 에서 금지된 것)

이 wave 의 산출은 **단일 markdown 1개** 뿐이다. 다음은 금지된다:

1. **`src/**` 수정 0** — 이 wave 는 sketch/문서 wave. `cha-bio-safety/src/pages/StaffManagePage.tsx` 또는 다른 `src/**` 파일 수정 시 W1 verify FAIL.
2. **sketch HTML 생성 0** — sketch HTML 은 W2/W3/W4 에서 생성. 이 wave 는 인덱스 markdown 1개만.
3. **components.css 변경 0** — 기존 tokens.css/typography.css 재사용만, 신규 추가 0.
4. **App.tsx / `MOBILE_NO_NAV_PATHS` 등 라우팅 변경 0** — 26-staff-manage 의 `/staff-manage` 는 BottomNav 노출 페이지. 변경 불필요.
5. **wrangler 명령 0** — `wrangler pages deploy` / `wrangler d1` 모두 금지 (`.claude/settings.local.json` deny 강제). memory `feedback_cbc7119_design_never_wrangler`.
6. **`npm run deploy` 0** — 직원 도메인 경로. CLAUDE.local.md 룰. main push 만으로 cbc7119-preview 자동 배포.
7. **admin 가드 변경 0** — `me?.role !== 'admin'` 체크는 useEffect + early return 양쪽 모두 보존. 이 wave 에서 결정/변경 불가.
8. **staffApi 4종 호출 변경 0** — `staffApi.list` / `staffApi.create` / `staffApi.update` / `staffApi.resetPassword` 호출 시그니처 + 인자 + 응답 처리 모두 변경 금지. useMutation 4건 (create/update/resetPw/deactivate) 비즈 로직 변경 금지.
9. **shiftOffset 0~3 + shiftFixed 'day'/null 비즈 데이터 변경 0** — `project_div_compressor_pair` 4-shift 사이클 룰 강제. 옵션 추가/제거/순서 변경 금지. 이 wave 에서 결정/변경 불가.
10. **role 옵션 `(['admin', 'assistant'] as Role[])` 변경 0** — '관리자' / '보조자' 라벨 + 옵션 순서 변경 금지.
11. **duty 토큰 매핑 변경 0** — `--duty-day` / `--duty-night` / `--duty-off` / `--duty-leave` 색 (#f59e0b / #ef4444 / #3b82f6 / #6b7280) + 출근부와 동일 색 룰 변경 금지. 카드에 duty 색 표시 신규 도입은 OQ.
12. **비밀번호 초기화 confirm 변경 0** — '사번 뒷 4자리로 비밀번호를 초기화합니다. 계속하시겠습니까?' 안내 카피 + '초기화' 버튼 + resetPwMutation 시퀀스 모두 보존. setConfirmReset(false) 시점 변경 금지.
13. **BottomSheet / DesktopModal / StaffModalContent / ReplaceModalContent / StaffCard 함수 공통 추출 0** — CheckpointsPage(24) 와 공통화는 별도 task. 이 wave 는 박제만.
14. **사번 10자리 정규식 + appointedAt 자동 채움 비즈 로직 변경 0** — `/^\d{10}$/` + `${p.slice(0,4)}-${p.slice(4,6)}-${p.slice(6,8)}` 패턴 변경 금지. W5 에서도 변경 금지.
15. **rankOfTitle 정렬 + window.__openReplaceModal 훅 변경 0** — 대리/주임/기사/기타 순서 + window 훅 등록/cleanup 패턴 + 100ms setTimeout 모두 보존.
16. **평면(flat) 폴더 룰 위반 0** — sketch HTML 은 (다음 wave 에서) `cha-bio-safety/docs/redesign-context/26-staff-manage/sketch-wave-N-{slug}.html` 평면 배치. `sketch/` 서브폴더 만들기 금지. 28-splash / 23-education / 24-checkpoints 동일 패턴.
17. **이 인덱스에 시각 디자인 결정 박제 0** — 결정은 W2/W3/W4 sketch + W5 TSX 에서. 이 인덱스는 박제 + OQ + 룰 인용만.

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

다음 6건은 W2 진입 직전 사용자 컨펌 필수. default 답을 명시 (사용자가 변경 요청 시에만 변경):

## OQ #1 — BottomSheet/DesktopModal 공통화 (CheckpointsPage 24 와 동일)

**문제:** BottomSheet (line 22~40) + DesktopModal (line 42~57) 두 함수가 CheckpointsPage(24) 와 거의 동일. 26-staff-manage.md §3 "현재 구현의 한계나 개선 여지" + 24-checkpoints.md §3 양쪽에서 명시.

**옵션:**
- (a) 이 wave 에서 인라인 보존 (24-checkpoints + 26-staff-manage 양쪽 완료 후 별도 task 로 공통 추출)
- (b) 이 wave 에서 `src/components/ui/Modal.tsx` 또는 `Sheet.tsx` 추출 + 26-staff-manage 우선 적용 + 24 는 후속

**Default:** (a) — 이 wave 는 박제만. 별도 task 로 양쪽 wave 완료 후 공통화. 메모리 `feedback_design_changes_ask_first` 룰 (구조 변경은 상의 후).

## OQ #2 — 저장 / 직원 추가 CTA 버튼 그라데이션 적용 여부

**문제:** 저장 / 직원 추가 버튼은 현재 단색 `var(--acl)` 사용. design-system.md §6.4 "유일한 그라디언트 2종" 중 "저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`" 적용 가능. 교체 버튼은 단색 `#f59e0b` (ReplaceModal) / `rgba(245,158,11,.1)` (StaffModal) — warning 톤 유지.

**옵션:**
- (a) 단색 `--accent-primary` 유지 (현재 패턴) + 교체 버튼 warning 톤 유지
- (b) §6.4 그라데이션 적용 (저장 + 직원 추가 + 모바일 FAB 3건) + 교체 버튼은 warning 유지

**Default:** (a) — 현재 패턴 유지. 다른 페이지 (대시보드 등) 에서 일관 채용된 시점에 통일 적용. 이 wave 는 단색 보존.

## OQ #3 — shiftOffset / shiftFixed 폼 UI 노출 검토 + role toggle height 격상

**문제 1 (shift 폼 노출):** EMPTY_STAFF_FORM (line 76~78) + edit 모드 초기화 (line 157) 에 shiftOffset+shiftFixed 가 있지만 폼 UI 미노출. 변경은 ReplaceModalContent 의 staffApi.update 시퀀스에서만 가능. 26-staff-manage.md §3 "shift_offset / shift_fixed 등록 (근무 패턴)" 는 폼 노출 요구지만 현재 UI 없음 — 신규 디자인 도입 여부.

**문제 2 (role toggle height):** 등록 폼 role 선택은 2 button row (`flex 1 / height 36 / fontSize 12`) 토글 패턴 (line 243~252). height 36 은 §1.1 모바일 44px 미달 → height 40~44 격상 검토.

**옵션:**
- (a) shift 폼 미노출 유지 (ReplaceModal 만) + role button row 유지 + height 36 → 40 (데스크톱) / 44 (모바일) 격상
- (b) shift 폼 신규 노출 (shiftOffset 0~3 select + shiftFixed 'day'/null toggle) + role 동일
- (c) 둘 다 segment control (한 줄 캡슐) 로 변경

**Default:** (a) — 시각 + 인터랙션 변경 최소. role height 만 §1.1 준수 격상. shift 폼 노출은 별도 task (memory `project_meal_calc_rules` + `project_div_compressor_pair` 운영 룰 검토 후).

## OQ #4 — 외곽 hex 토큰 치환 범위

**문제:** `var(--bg)/--bg2/--bg3/--bg4/--bd/--bd2/--t1/--t2/--t3/--acl/--safe/--danger/--warn` raw 변수는 design-system.md §4.1 마이그레이션 룰에 따라 새 토큰으로 치환 가능.

**옵션:**
- (a) 모두 새 토큰 치환 (`--bg`→`--surface-page` / `--bg2`→`--surface-raised` / `--bg3`→`--surface-sunken` / `--bg4`→`--surface-active` / `--bd`→`--border-default` / `--bd2`→`--border-strong` / `--t1/--t2/--t3`→`--text-primary/--secondary/--tertiary` / `--acl`→`--accent-primary` / `--safe`→`--status-safe-bar` / `--danger`→`--status-danger` / `--warn`→`--status-warning-bar`)
- (b) 기존 raw 변수 유지

**Default:** (a) — design-system.md §4.1 마이그레이션 표 그대로. 26-staff-manage.md §4 요구사항 일치.

## OQ #5 — role 배지 / 테이블 status / 보조 라벨 폰트 격상

**문제:** §1.1 룰 위반 영역:
- role 배지 fontSize 9 (StaffCard line 327) / 10 (테이블 line 461)
- 상태 dot 라벨 fontSize 11 (테이블 line 471)
- 입사일·생년월일 보조 라벨 fontSize 10 (line 224, 236)
- ReplaceModal info 박스 보조 라벨 fontSize 11 (line 121)
- 모바일 카드 액션 '수정 ▸' fontSize 12 (line 336) — §1.1 마지노선이지만 작은 영역에서 캡션 톤

**옵션:**
- (a) 모두 `text-caption` (12px) 격상 + 작은 영역은 `leading-none` 추가 (`feedback_text_caption_leading_none`)
- (b) role 배지만 `--radius-pill` + 12px / 테이블 status + 보조 라벨은 데스크톱 13px / 모바일 12px 격상
- (c) 현재 9/10/11 유지 (§1.1 위반)

**Default:** (a) — 일률 12 격상 + `leading-none`. §1.1 룰 엄격 적용.

## OQ #6 — Lucide IconUserPlus 치환 + 카드에 duty 색 표시 신규 도입 여부

**문제 1 (Lucide):** IconUserPlus (line 11~20) 인라인 SVG → Lucide `UserPlus` 치환 가능. §7.1 룰 "이모지 사용 금지" + Lucide 통일.

**문제 2 (duty):** 26-staff-manage.md §4 "직원 카드의 근무 패턴 표시는 duty 토큰 색 사용 (출근부와 동일 색)" → 현재 StaffCard / 테이블 row 에 shiftOffset+shiftFixed 시각 표시 없음. 신규 디자인 도입 여부 (예: 카드 우측 duty 색 dot / 테이블 컬럼 추가).

**옵션:**
- (a) `<UserPlus size={16} />` (헤더 데스크톱 line 405) + `<UserPlus size={18} />` (모바일 FAB line 509) — 기존 size 보존 + duty 색 신규 미도입
- (b) 모든 UserPlus size={16} 으로 통일 (§7.1 사이즈 룰) — 18 → 20 격상 또는 16 통일 + duty 색 카드 추가 (별도 시안 합의)
- (c) SVG path 유지 + duty 색 미도입

**Default:** (a) — 기존 size 보존 + Lucide 치환 + duty 색 신규 미도입 (별도 task). 메모리 `feedback_design_changes_ask_first` 룰 (신규 시각 요소 도입은 상의 후).

---

# §8. verify gate

W1 산출 (`wave-1-index.md`) commit 직전 다음 verify 8건 실행. 모두 PASS 시 W1 종결, FAIL 시 재작성.

## 8.1 §1~§8 헤더 grep == 8

```bash
grep -c "^# §[1-8]\." cha-bio-safety/docs/redesign-context/26-staff-manage/wave-1-index.md
# 기대: 8 (정확)
```

## 8.2 sub-wave row ≥3

```bash
grep -E "^\| W[2-4] \|" cha-bio-safety/docs/redesign-context/26-staff-manage/wave-1-index.md | grep -v '^#' | wc -l
# 기대: ≥3 (sub-wave 표의 W2/W3/W4 행 3개)
```

## 8.3 unique 메모리 룰 slug ≥10

```bash
grep -oE "(feedback|project|reference)_[a-z0-9_]+" cha-bio-safety/docs/redesign-context/26-staff-manage/wave-1-index.md | sort -u | wc -l
# 기대: ≥10
```

## 8.4 OQ ≥5

```bash
grep -c "^## OQ #" cha-bio-safety/docs/redesign-context/26-staff-manage/wave-1-index.md
# 기대: ≥5
```

## 8.5 src/** 변경 0

```bash
git status --porcelain cha-bio-safety/src/ 2>&1 | wc -l
# 기대: 0 (src/** 미수정)
```

## 8.6 sketch HTML 추가 0

```bash
find cha-bio-safety/docs/redesign-context/26-staff-manage -name "sketch-wave-*.html" 2>/dev/null | wc -l
# 기대: 0 (sketch HTML 은 W2~W4 에서 생성, W1 에서는 0)
```

## 8.7 §1.3 비즈 anchor 박스 존재

```bash
grep -q "비즈 시그니처 보존 anchor" cha-bio-safety/docs/redesign-context/26-staff-manage/wave-1-index.md
# 기대: PASS (exit 0)
```

## 8.8 design-system fence ≥7 + negative rule ≥10

```bash
# fence 7건 (§3.1~§3.7)
grep -c "^## §3\." cha-bio-safety/docs/redesign-context/26-staff-manage/wave-1-index.md
# 기대: ≥7

# negative rule ≥10건 (§6 번호 + 굵은 글씨 패턴)
grep -cE "^[0-9]+\.\s+\*\*" cha-bio-safety/docs/redesign-context/26-staff-manage/wave-1-index.md
# 기대: ≥10
```

---

# §9. 변경 이력

- **v1** (2026-05-26, quick `260526-mbr`) — redesign/26-staff-manage W1 인덱스 최초 생성. 24-checkpoints W1 mirror (8-section + 비즈 anchor + 메모리 룰 12 + OQ 6 + verify 8). 단일 파일 (StaffManagePage.tsx 530 lines, admin 전용 BottomSheet/DesktopModal + ReplaceModal) 4 sub-area + 3 sub-wave 축소 패턴.

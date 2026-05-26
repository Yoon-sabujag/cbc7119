---
title: "redesign/24-checkpoints — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-26
quick_id: 260526-dul
branch: redesign/24-checkpoints
source_tsx: cha-bio-safety/src/pages/CheckpointsPage.tsx
source_tsx_lines: 693
design_system: cha-bio-safety/docs/redesign-context/24-checkpoints/design-system.md (v0.1.1)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (24-checkpoints = `/checkpoints` BottomNav 모바일 노출 페이지 — `MOBILE_NO_NAV_PATHS` 미등재. App.tsx 기본 헤더 사용 X — 자체 헤더 없이 페이지 내부 상단 select 영역만 있음. chrome 룰 직접 적용 X. BottomSheet/DesktopModal 모달 chrome 은 별도 패턴 — StaffManagePage(26) 동일 함수.)
mirror_of: cha-bio-safety/docs/redesign-context/25-qr-print/wave-1-index.md + 23-education/wave-1-index.md + 28-splash/wave-1-index.md (8-section + sub-wave 4 + 단일 파일 패턴)
calibration_precedent: cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md SW3 (비즈 anchor 1 byte 변경 금지 일반화)
sub_wave_count: 4 (W2~W5) + TSX W6
memory_rules_inline: 12
open_questions: 6
admin_only: true
---

# redesign/24-checkpoints — sketch wave 1 (index)

본 문서는 W2~W6 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:

- CheckpointsPage.tsx (693 lines, admin 전용) 의 element 인벤토리 → 5 sub-area + 4 sub-wave 분배 + **비즈 시그니처** 보존 anchor (admin 가드 useEffect / CATEGORIES_FALLBACK 19종 / ZONE_LABEL / ZONE_FLOORS / FLOOR_ORDER 20건 / MARKER_TYPE_LABEL 6건 / FLOOR_CODE 8건 / queryKey 6건 / useMutation 3건 (create / update / deactivate) / extinguisherApi.create 자동 매핑 / floorPlanMarkerApi.update+delete 분기 / 유도등 (FPM-) 프리픽스 분기 / isExtCategory='소화기' 분기 / 'basement'='common' legacy 호환 / handleSave / canSave / 카피 verbatim 8건)
- BottomSheet (모바일) + DesktopModal (데스크톱) 분기 룰 — `useIsDesktop` 훅 기반, `ModalWrapper = isDesktop ? DesktopModal : BottomSheet` (line 503)
- StaffManagePage(26) 와 거의 동일한 BottomSheet/DesktopModal 함수 (이 wave 는 박제만 — 공통 추출은 별도 task, 이 wave 범위 밖)
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6.4 / §6.5 / §6.8 / §7.1 의 verbatim 룰 박제
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 24-checkpoints 적용 여부 (24-checkpoints = `/checkpoints` BottomNav 노출 페이지, App.tsx 기본 헤더는 사용 X (페이지 내부 상단 select 영역) — chrome 룰 직접 적용 X. BottomSheet/DesktopModal 모달은 별도 패턴.)
- 메모리 룰 12건 inline 인용 — 24-checkpoints 특화 룰 2건 (admin 권한 가드 보존 + StaffManagePage 공통 BottomSheet/DesktopModal 변경 금지) 포함
- §6 negative rule (이 wave 에서 금지된 것)
- §7 open questions 6건 — W2 진입 직전 사용자 컨펌

---

# §1. CheckpointsPage.tsx 인벤토리

단일 파일 693 lines, 5 sub-area (1. 외곽+권한 가드 / 2. 헤더(카테고리+필터 select) (모바일/데스크톱 분기) / 3. 콘텐츠 (모바일 카드 리스트 + 모바일 FAB / 데스크톱 테이블) + skeleton+loading+error+empty / 4. 모달 wrapper (BottomSheet vs DesktopModal) + CheckPointModalContent / 5. CheckPointModalContent 등록 폼 필드 + 소화기 (isExtCategory) 분기 + 비활성화 confirm) 로 정리. line 범위는 실측 (Read 검증).

**24-checkpoints 의 구조 특이성** (머리말 박스):

- **단일 파일** — CheckpointsPage.tsx 693 lines, 외부 컴포넌트 import 없음 (BottomSheet / DesktopModal / CheckPointCard 모두 동 파일 내부 정의)
- **admin 전용 페이지** — `me?.role !== 'admin'` 이면 `navigate('/dashboard', { replace: true })` + `return null` (line 438~440, line 501). admin 가드 비즈 로직 1 byte 변경 금지.
- **BottomNav 노출 페이지** — `/checkpoints` ∉ `MOBILE_NO_NAV_PATHS`. 모바일 하단 BottomNav 표시됨. 모바일 FAB (line 675~683) 는 `position: sticky / bottom: 0` 으로 BottomNav 위 sticky.
- **자체 헤더 없음** — App.tsx 기본 헤더 (또는 BottomNav 와 함께 공통 헤더) 사용. 페이지 내부 상단은 카테고리 + 필터 select 영역만 (line 516~582, 모바일/데스크톱 분기).
- **BottomSheet/DesktopModal 분기 비즈 로직** — `useIsDesktop()` 훅 → `ModalWrapper = isDesktop ? DesktopModal : BottomSheet` (line 503). 두 함수 모두 `style={{...}}` 인라인 마크업, `BottomSheet` 는 slideUp 애니메이션 + 16/16/0/0 radius, `DesktopModal` 은 12 radius + width 440 + boxShadow. StaffManagePage(26) 동일 함수 — 공통화 OQ #1.
- **CATEGORIES_FALLBACK 19종 비즈 데이터** (line 29~34) — 19 카테고리, DB 동적 가져옴 (`categories` query) 실패 시 폴백. 추가/순서 변경 금지.
- **유도등 = floor_plan_markers 분기** (line 448, line 455~461, line 466~477) — `selectedCategory === '유도등'` 시 `floorPlanMarkerApi.listAll('guidelamp')` → `guidelampAsCp` 로 CheckPointFull 형태 변환. FPM- 프리픽스 id 분기는 update/deactivate mutation 에서도 이어짐 (line 204, 208~217, 231~235).
- **소화기 (isExtCategory) 분기** (line 122, line 167~183, line 296~347) — `form.category === '소화기'` 시 `extinguisherApi.create` 호출 + 추가 폼 필드 7건 (type / manufacturer / manufactured_at / approval_no / prefix_code / seal_no / serial_no). zone 영문→한글 매핑 (`{ research: '연', office: '사', common: '공' }`, line 168~170) — FloorPlanPage 703~710 패턴 동일.
- **'basement'='common' legacy 호환** (line 481~484, 494~497) — 0081 마이그레이션 전후 호환. zone 필터/비교 시 `eq()` 헬퍼로 처리. 변경 금지.
- **모바일/데스크톱 동일 ZONE 옵션** — `(['office', 'research', 'basement'] as const)` (line 277). 단, 등록 폼 ZONE_FLOORS 는 `office/research/common` 키 사용 (line 94~98) — 'basement' UI ↔ 'common' DB 매핑 비즈 룰.
- **React Query 6건 queryKey** — `['check-points', form.category]`(line 126) / `['check-points', selectedCategory]`(line 450) / `['check-point-categories']`(line 443) / `['floorplan-markers-all', 'guidelamp']`(line 457) / invalidate `['check-points']`(line 190, 221, 241) / invalidate `['check-point-categories']`(line 191) / invalidate `['floorplan-markers-all']`(line 222, 242).
- **useMutation 3건** — create (소화기/비-소화기 분기 line 166~200) / update (FPM-/check_points 분기 line 206~227) / deactivate (FPM- delete / isActive=0 분기 line 229~247).

## §1.1 sub-area 인벤토리 표

| sub-area | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. 외곽 + 권한 가드 | imports (useState/useEffect/useNavigate/useQuery/useMutation/useQueryClient/toast/useAuthStore/checkPointApi/floorPlanMarkerApi/extinguisherApi/useIsDesktop/types) | 1~8 | 정적 import | api / authStore / react-query / react-hot-toast | 보존만 |
| 1. 외곽 + 권한 가드 | IconPlus / IconChevronDown SVG (size+color prop) | 11~25 | 인라인 SVG 아이콘 | viewBox 24x24 / strokeWidth 2 / strokeLinecap+Join 'round' | W6 (Lucide Plus / ChevronDown 치환 검토 — OQ #6) |
| 1. 외곽 + 권한 가드 | CATEGORIES_FALLBACK 19종 + ZONE_LABEL | 29~37 | 카테고리 비즈 데이터 | DB 동적 가져옴 실패 시 폴백 / zone 영문→한글 라벨 | 보존만 |
| 1. 외곽 + 권한 가드 | admin 가드 useEffect (`me?.role !== 'admin'` → `navigate('/dashboard', { replace: true })`) | 438~440 | 권한 가드 비즈 로직 | useAuthStore.staff.role 체크 | 보존만 (변경 금지) |
| 1. 외곽 + 권한 가드 | `if (me?.role !== 'admin') return null` (early return) | 501 | 렌더 직전 가드 | admin 외 빈 화면 | 보존만 |
| 1. 외곽 + 권한 가드 | 외곽 wrapper (`flex column / bg var(--bg) / height 100% / overflow hidden`) | 507 | 페이지 wrapper | bg `--bg` → `--surface-page` 토큰 치환 OK | W2 |
| 1. 외곽 + 권한 가드 | `<style>` 태그 (keyframes blink + slideUp + input/select focus border-color) | 508~513 | 전역 스타일 (페이지 scope) | blink 애니메이션 (skeleton) + slideUp (BottomSheet) + focus 색 `var(--acl)` | W2 (CSS 토큰 알리아스 검토) |
| 2. 헤더 (카테고리 + 필터 select) | 데스크톱 헤더 (`flex / gap 12 / padding 12px 24px / borderBottom var(--bd)`) — 카테고리 select 220px + filterZone + filterFloor + 개소 카운트 + 개소 추가 버튼 | 516~551 | 데스크톱 상단 영역 | isDesktop 분기 / select onChange / 개소 추가 mode='add' | W3 |
| 2. 헤더 (카테고리 + 필터 select) | 모바일 헤더 (`flex column / padding 12px 16px / gap 8`) — 카테고리 select 풀폭 + 조건부 filterZone/filterFloor row + 개소 카운트 | 552~582 | 모바일 상단 영역 | selectedCategory 채워졌을 때만 필터 row 표시 | W3 |
| 2. 헤더 (카테고리 + 필터 select) | filterZone / filterFloor / cpList 카운트 라벨 | 531~541, 566~578 | 필터 + 결과 카운트 | filterZone 변경 시 filterFloor='' 리셋 / availableFloors 계산 (line 492~499) | W3 |
| 2. 헤더 (카테고리 + 필터 select) | 데스크톱 개소 추가 버튼 (`bg var(--acl) / color #fff / radius 8 / Plus 16 / 카피 '개소 추가'`) | 546~550 | mode='add' modal 트리거 | onClick setModal({open,mode:'add'}) | W3 |
| 3. 콘텐츠 (목록) | 콘텐츠 wrapper (`flex 1 / overflow auto / minHeight 0`) | 585 | scroll 영역 | flex 1 채움 | W4 |
| 3. 콘텐츠 (목록) | 카테고리 미선택 empty (`'카테고리를 선택하면 개소 목록이 표시됩니다'`) | 586~590 | empty state | selectedCategory === '' | W4 |
| 3. 콘텐츠 (목록) | skeleton 3개 (`SKELETON_STYLE` height 64 + bg var(--bg3) + blink animation) | 591~597 | loading 상태 | isLoading | W4 |
| 3. 콘텐츠 (목록) | 에러 (`'데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요'`) | 598~602 | error state | isError && !isLoading | W4 |
| 3. 콘텐츠 (목록) | 데스크톱 테이블 (`<table>` head 7 컬럼: 개소명/카테고리/구역/층/위치번호/상태/액션 + body row 카드 hover bg) | 604~656 | 데스크톱 카드 리스트 | cpList.map / onClick edit modal / locationNo 폰트 JetBrains Mono | W4 |
| 3. 콘텐츠 (목록) | 데스크톱 테이블 empty (`'해당 카테고리에 개소가 없습니다'`, colSpan 7) | 620~622 | data empty | cpList.length === 0 | W4 |
| 3. 콘텐츠 (목록) | 모바일 카드 리스트 (`CheckPointCard` map, line 401~419 정의 사용) | 659~671 | 모바일 카드 리스트 | cpList.map / onClick edit | W4 |
| 3. 콘텐츠 (목록) | 모바일 카드 empty (`'해당 카테고리에 개소가 없습니다' + '개소 추가 버튼을 눌러 점검 개소를 등록하세요'`) | 661~666 | empty + 안내 | cpList.length === 0 | W4 |
| 3. 콘텐츠 (목록) | 모바일 FAB (`sticky bottom + padding 16 + bg var(--acl) + Plus 18 + '개소 추가' + paddingBottom calc(16+var(--sab))`) | 674~683 | mode='add' modal 트리거 | onClick setModal({open,mode:'add'}) / sab safe-area-inset-bottom | W4 |
| 4. 모달 wrapper | `ModalWrapper = isDesktop ? DesktopModal : BottomSheet` | 503 | 모달 분기 | useIsDesktop 훅 기반 | W5 (StaffManagePage 공통화 OQ #1) |
| 4. 모달 wrapper | BottomSheet 함수 (overlay rgba(0,0,0,0.6) + bg var(--bg2) + radius 16/16/0/0 + slideUp 0.28s + maxHeight 90vh + handle bar 32x4) | 40~57 | 모바일 모달 | onClose backdrop click / e.currentTarget 체크 | W5 |
| 4. 모달 wrapper | DesktopModal 함수 (overlay rgba(0,0,0,0.5) + bg var(--bg2) + radius 12 + width 440 + maxHeight 85vh + boxShadow 0 8px 32px rgba(0,0,0,.18)) | 60~74 | 데스크톱 모달 | onClose backdrop click | W5 |
| 4. 모달 wrapper | 모달 호출 wrapper (`{modal.open && <ModalWrapper ...><CheckPointModalContent .../></ModalWrapper>}`) | 685~690 | 모달 진입 | modal.open / modal.mode / modal.target | W5 |
| 5. 폼 (CheckPointModalContent) | INPUT_STYLE + LABEL_STYLE 상수 (height 44 / bg var(--bg3) / radius 8 / padding 0 12 / fontSize 14 / focus border-color var(--acl)) | 77~84 | 인라인 스타일 상수 | width 100% / boxSizing border-box | W5 (토큰 치환 검토 — INPUT_STYLE → tokens.css 알리아스) |
| 5. 폼 (CheckPointModalContent) | CpFormState + EMPTY_CP_FORM (6 필드: location/category/zone/floor/description/locationNo) | 87~93 | 폼 state | useState 초기값 | 보존만 |
| 5. 폼 (CheckPointModalContent) | ZONE_FLOORS (3 zone × 6~8 층 비즈 데이터) | 94~98 | 층 옵션 | office/research: 8-1F~1F / common: B1~B5+M | 보존만 |
| 5. 폼 (CheckPointModalContent) | ExtState + EMPTY_EXT (7 필드: type/manufacturer/manufactured_at/approval_no/prefix_code/seal_no/serial_no) | 100~109 | 소화기 추가 폼 state | isExtCategory 시만 사용 | 보존만 |
| 5. 폼 (CheckPointModalContent) | catCheckPoints useQuery (`['check-points', form.category]`, 30s staleTime, mode='add' && form.category!=='') | 124~130 | 기본값 생성용 카테고리 cp 가져오기 | enabled add 모드 + 카테고리 선택 | 보존만 |
| 5. 폼 (CheckPointModalContent) | useEffect — 카테고리+층 선택 시 위치번호 + 개소명 기본값 자동 생성 | 138~160 | 폼 자동 채우기 비즈 로직 | filtered cp 의 마지막 locationNo +1 / `'{floor} {category} {N+1}번'` 패턴 | 보존만 (변경 금지) |
| 5. 폼 (CheckPointModalContent) | createMutation (소화기/비-소화기 분기) | 165~200 | 등록 비즈 로직 | isExtCategory: extinguisherApi.create + zoneMap / 비-소화기: id=cp_{Date.now()} + qrCode='QR-'+id + checkPointApi.create / onSuccess invalidate + toast `'소화기 등록 완료 ({mgmtNo})'` 또는 `'개소가 추가되었습니다'` | 보존만 (1 byte 변경 금지) |
| 5. 폼 (CheckPointModalContent) | updateMutation (FPM-/check_points 분기) | 206~227 | 수정 비즈 로직 | isMarker (id startsWith 'FPM-'): floorPlanMarkerApi.update {label/description/zone} / 그 외: checkPointApi.update / onSuccess invalidate 2건 + toast `'개소 정보가 수정되었습니다'` | 보존만 (1 byte 변경 금지) |
| 5. 폼 (CheckPointModalContent) | deactivateMutation (FPM- delete / isActive=0) | 229~247 | 비활성화 비즈 로직 | isMarker: floorPlanMarkerApi.delete / 그 외: checkPointApi.update {isActive:0} / toast 분기 `'마커가 삭제되었습니다'` / `'개소가 비활성화되었습니다'` | 보존만 (1 byte 변경 금지) |
| 5. 폼 (CheckPointModalContent) | 폼 필드 — 카테고리 select (CATEGORIES_FALLBACK + 빨간 *) | 268~273 | 폼 필드 1 | required / handleCategoryChange | W4 |
| 5. 폼 (CheckPointModalContent) | 폼 필드 — 구역 button row (office/research/basement, 토글, bg var(--acl)/var(--bg4)) | 275~284 | 폼 필드 2 (zone toggle) | onClick zone 토글 + floor 리셋 / `flex 1 / height 36 / fontSize 11` | W4 (OQ #3 toggle UI 변경 검토) |
| 5. 폼 (CheckPointModalContent) | 폼 필드 — 층 select (form.zone 채워졌을 때만 표시, ZONE_FLOORS) | 285~295 | 폼 필드 3 | conditional render | W4 |
| 5. 폼 (CheckPointModalContent) | 폼 필드 — 소화기 추가 폼 (isExtCategory) — 종류 select + 6 input (manufacturer/manufactured_at/approval_no/prefix_code/seal_no/serial_no) + placeholder verbatim | 296~347 | 소화기 자동 등록 폼 | extForm state | W4 (verbatim 보존) |
| 5. 폼 (CheckPointModalContent) | 폼 필드 — 개소명 input (required + placeholder '1층 로비 소화기') | 348~351 | 폼 필드 4 | required | W4 |
| 5. 폼 (CheckPointModalContent) | 폼 필드 — 위치번호 + 설명 input (비-소화기만, placeholder '001 (선택)' / '메모 (선택)') | 352~363 | 폼 필드 5, 6 | !isExtCategory | W4 |
| 5. 폼 (CheckPointModalContent) | 액션 영역 (취소 / 저장 button 분할 + edit 시 비활성화 버튼 + confirmDeactivate 시 빨간 안내 + 빨간 비활성화 버튼) | 366~395 | 액션 row | canSave 계산 (location.trim() !== '' && category !== '' && (!isExt || (type !== '' && zone !== '' && floor !== ''))) / isBusy / `'저장' / '취소' / '비활성화' / '이 개소를 비활성화합니다. 기존 점검 기록은 보존됩니다.'` | W4 (verbatim 보존) |
| 5. 폼 (CheckPointModalContent) | CheckPointCard (모바일 카드) — 8x8 dot bg var(--safe)/var(--t3) + location + category badge (9px) + zone·floor 메타 + '수정 ▸' | 401~419 | 모바일 카드 컴포넌트 | onClick edit / cp.isActive===0 opacity 0.45 | W4 |
| 5. 폼 (CheckPointModalContent) | SKELETON_STYLE (`bg var(--bg3) / radius 12 / height 64 / blink 2s ease-in-out infinite`) | 422~425 | 스켈레톤 스타일 상수 | reusable | W4 |

## §1.2 line 수 실측 확인

```
$ wc -l cha-bio-safety/src/pages/CheckpointsPage.tsx
     693 cha-bio-safety/src/pages/CheckpointsPage.tsx
```

PLAN 추정치 + 24-checkpoints.md §2 메타 일치, drift 없음.

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

W6 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (15-daily-report SW3 portraitPos 좌표 시스템 보존 룰 일반화, memory `project_redesign_15_daily_report_status`):

```
[CheckpointsPage.tsx 비즈 로직]
- import { useState, useEffect } from 'react'
- import { useNavigate } from 'react-router-dom'
- import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
- import toast from 'react-hot-toast'
- import { useAuthStore } from '../stores/authStore'
- import { checkPointApi, floorPlanMarkerApi, extinguisherApi } from '../utils/api'
- import { useIsDesktop } from '../hooks/useIsDesktop'
- import type { CheckPointFull, CheckPointUpdatePayload, BuildingZone } from '../types'

- CATEGORIES_FALLBACK 19종 (line 29~34, 순서/값 변경 금지):
    소화기, 소화전, 스프링클러, 청정소화약제, 소방펌프,
    자동화재탐지설비, 유도등, 방화셔터, 비상콘센트, 소방용전원공급반,
    특별피난계단, 전실제연댐퍼, 배연창, 연결송수관, 완강기,
    DIV, CCTV, 주차장비, 회전문

- ZONE_LABEL (line 35~37, 변경 금지):
    office: '사무동', research: '연구동', basement: '지하', common: '지하' (legacy)

- ZONE_FLOORS (line 94~98, 변경 금지):
    office:   ['8-1F', '8F', '7F', '6F', '5F', '3F', '2F', '1F']
    research: ['8-1F', '8F', '7F', '6F', '5F', '3F', '2F', '1F']
    common:   ['B1', 'M', 'B2', 'B3', 'B4', 'B5']

- FLOOR_ORDER 20건 (line 492, 변경 금지):
    ['8-1F','8F','7F','6F','5F','3F','2F','1F','LOBBY','M','B1','B1F','B2','B2F','B3','B3F','B4','B4F','B5','B5F']

- MARKER_TYPE_LABEL 6건 (line 462~464, 변경 금지):
    ceiling_exit: '천장피난구', wall_exit: '벽부피난구', room_corridor: '거실통로',
    hallway_corridor: '복도통로', stair_corridor: '계단통로', seat_corridor: '객석통로'

- FLOOR_CODE 8건 (line 465, 변경 금지):
    '8-1F': '9', '8F': '8', '7F': '7', '6F': '6', '5F': '5', '3F': '3', '2F': '2', '1F': '1'

- admin 가드 (line 438~440 + 501, 변경 금지):
    useEffect(() => {
      if (me?.role !== 'admin') navigate('/dashboard', { replace: true })
    }, [me, navigate])
    if (me?.role !== 'admin') return null

- React Query queryKey 6건 (변경 금지):
    ['check-points', form.category] (line 126, modal 안 catCheckPoints)
    ['check-points', selectedCategory] (line 450, 메인 cp 리스트)
    ['check-point-categories'] (line 443, 카테고리 옵션)
    ['floorplan-markers-all', 'guidelamp'] (line 457, 유도등 분기)
    invalidate ['check-points'] (line 190, 221, 241)
    invalidate ['check-point-categories'] (line 191)
    invalidate ['floorplan-markers-all'] (line 222, 242)

- catCheckPoints useQuery (line 124~130, 변경 금지):
    staleTime 30_000
    enabled: mode === 'add' && form.category !== ''

- 폼 자동 채우기 useEffect (line 138~160, 변경 금지):
    filtered = form.floor ? catCheckPoints.filter(c => c.floor === form.floor) : catCheckPoints
    nos = filtered.map(c => c.locationNo).filter(Boolean).sort()
    lastNo = nos[nos.length - 1] ?? ''
    numMatch = lastNo.match(/(\d+)$/)
    nextNum = String(parseInt(numMatch[1]) + 1).padStart(numMatch[1].length, '0')
    nextNo = lastNo.slice(0, -numMatch[1].length) + nextNum
    또는 `${form.floor}-1` (numMatch 없을 때)
    count = filtered.length + 1
    floorPrefix = form.floor ? `${form.floor} ` : ''
    defaultName = `${floorPrefix}${form.category} ${count}번`

- createMutation (line 165~200, 변경 금지):
    isExtCategory = form.category === '소화기'
    소화기: zoneMap { research:'연', office:'사', common:'공' } / extinguisherApi.create({ floor, zone:zoneChar, location, type, approval_no, manufactured_at, manufacturer, prefix_code, seal_no, serial_no })
    비-소화기: id=`cp_${Date.now()}` / qrCode=`QR-${id}` / checkPointApi.create({ id, qrCode, floor, zone:form.zone as BuildingZone, location, category, description?, locationNo? })
    onSuccess: invalidate ['check-points'] + ['check-point-categories']
    if (isExtCategory && data?.mgmtNo): toast.success(`소화기 등록 완료 (${data.mgmtNo})`)
    else: toast.success('개소가 추가되었습니다')
    onError: toast.error('저장에 실패했습니다. 입력값을 확인해 주세요')

- updateMutation (line 206~227, 변경 금지):
    isMarker = !!cp?.id?.startsWith('FPM-')
    isMarker: floorPlanMarkerApi.update(cp.id, { label: data.location, description: data.description ?? null, zone: (data.zone as string) ?? null })
    그 외: checkPointApi.update(cp.id, data)
    onSuccess: invalidate ['check-points'] + ['floorplan-markers-all'] / toast.success('개소 정보가 수정되었습니다')
    onError: toast.error('저장에 실패했습니다. 입력값을 확인해 주세요')

- deactivateMutation (line 229~247, 변경 금지):
    isMarker: floorPlanMarkerApi.delete(cp.id)
    그 외: checkPointApi.update(cp.id, { isActive: 0 })
    onSuccess: invalidate ['check-points'] + ['floorplan-markers-all']
    toast.success(isMarker ? '마커가 삭제되었습니다' : '개소가 비활성화되었습니다')
    onError: toast.error('비활성화에 실패했습니다')

- canSave (line 249~252, 변경 금지):
    form.location.trim() !== '' &&
    form.category !== '' &&
    (!isExtCategory || (extForm.type !== '' && form.zone !== '' && form.floor !== ''))

- isBusy = createMutation.isPending || updateMutation.isPending

- 유도등 분기 (line 448, 455~461, 466~477, 변경 금지):
    isGuidelamp = selectedCategory === '유도등'
    guidelampMarkers useQuery enabled: isGuidelamp (staleTime 30_000)
    guidelampAsCp 변환:
      fc = FLOOR_CODE[m.floor] ?? m.floor
      x = Math.round(m.x_pct ?? 0)
      y = Math.round(m.y_pct ?? 0)
      locNo = `${fc}-${x}-${y}`
      { id: m.id, qrCode: '', floor: m.floor, zone: m.zone ?? 'basement',
        location: m.label || MARKER_TYPE_LABEL[m.marker_type] || '유도등',
        category: '유도등', description: MARKER_TYPE_LABEL[m.marker_type] ?? '',
        locationNo: locNo, isActive: 1, createdAt: m.created_at ?? '' }
    isLoading = isGuidelamp ? glLoading : cpLoading
    cpListRaw = isGuidelamp ? guidelampAsCp : (checkPoints ?? [])

- 'basement'='common' legacy 호환 (line 481~484, 494~497, 변경 금지):
    eq = (a?, b?) => a === b || ((a==='basement' || a==='common') && (b==='basement' || b==='common'))
    filterZone 비교 / availableFloors 계산 모두 eq() 사용

- ModalWrapper = isDesktop ? DesktopModal : BottomSheet (line 503)
- categoryOptions = categories.length > 0 ? categories : CATEGORIES_FALLBACK (line 504)

- BottomSheet (line 40~57, 변경 금지):
    overlay: position fixed / inset 0 / bg rgba(0,0,0,0.6) / zIndex 50 / flex column / justifyContent flex-end
    panel: bg var(--bg2) / borderRadius 16px 16px 0 0 / animation slideUp 0.28s ease-out both / maxHeight 90vh / overflowY auto
    handle bar: width 32 / height 4 / bg var(--bd2) / radius 2 / paddingTop 12 (handle row)
    title: fontSize 16 / fontWeight 700 / color var(--t1) / padding '12px 16px 0'
    backdrop click close: e.target === e.currentTarget

- DesktopModal (line 60~74, 변경 금지):
    overlay: position fixed / inset 0 / bg rgba(0,0,0,0.5) / zIndex 50 / flex / alignItems center / justifyContent center
    panel: bg var(--bg2) / borderRadius 12 / width 440 / maxHeight 85vh / overflowY auto / boxShadow '0 8px 32px rgba(0,0,0,.18)'
    title: fontSize 16 / fontWeight 700 / color var(--t1) / padding '20px 24px 0'
    backdrop click close: e.target === e.currentTarget

[카피 verbatim 8건]
- '카테고리를 선택하면 개소 목록이 표시됩니다' (selectedCategory 미선택 empty, line 588)
- '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요' (error, line 600)
- '해당 카테고리에 개소가 없습니다' (data empty, line 621, 663)
- '개소 추가 버튼을 눌러 점검 개소를 등록하세요' (모바일 empty 안내, line 664)
- '개소 추가' / '개소 수정' (모달 title, line 687)
- '저장' / '취소' / '비활성화' (액션 버튼, line 369, 372, 378, 388, 391)
- '이 개소를 비활성화합니다. 기존 점검 기록은 보존됩니다.' (confirmDeactivate 안내, line 385)
- 폼 placeholder verbatim 8건:
    '1층 로비 소화기' (location, line 350)
    '001 (선택)' (locationNo, line 356)
    '메모 (선택)' (description, line 360)
    '예: 한울방재' (manufacturer, line 314)
    '예: 2024-04 (YYYY-MM)' (manufactured_at, line 320)
    '예: 수소10-19-11' (approval_no, line 326)
    '예: BEQV' (prefix_code, line 332)
    '예: 72605' (seal_no, line 338)
    '예: 68605' (serial_no, line 344)
- toast 카피 verbatim:
    '소화기 등록 완료 ({mgmtNo})' / '개소가 추가되었습니다' (create, line 193, 195)
    '저장에 실패했습니다. 입력값을 확인해 주세요' (create+update onError, line 199, 226)
    '개소 정보가 수정되었습니다' (update onSuccess, line 223)
    '마커가 삭제되었습니다' / '개소가 비활성화되었습니다' (deactivate onSuccess, line 243)
    '비활성화에 실패했습니다' (deactivate onError, line 246)
- 종류 select option verbatim: '분말 20kg' / '분말 3.3kg' / '할로겐' / 'K급' (line 304~307)
- ZONE select option verbatim: '전체 (카테고리 선택)' / '전체 구역' / '전체 층' / '사무동' / '연구동' / '지하' / '카테고리 선택' / '종류 선택' / '층 선택'

[외곽 hex / 색 토큰화 검토 영역]
- 외곽 wrapper bg `var(--bg)` → `var(--surface-page)` 치환 OK (OQ #4)
- 카드 / 모달 bg `var(--bg2)` → `var(--surface-raised)` 치환 OK
- input/select bg `var(--bg3)` → `var(--surface-sunken)` 치환 OK
- button 비활성 bg `var(--bg4)` → `var(--surface-active)` 치환 검토
- border `var(--bd)` → `--border-default` / `var(--bd2)` (handle bar) → `--border-strong` 치환 OK
- 텍스트 `var(--t1)`/`(--t2)`/`(--t3)` → `--text-primary`/`--text-secondary`/`--text-tertiary` 치환 OK
- 액센트 `var(--acl)` → `--accent-primary` 또는 status-info 알리아스 치환 검토 (OQ #4)
- danger `var(--danger)` → `--status-danger` 치환 OK (별 표시 + 비활성화 버튼)
- safe `var(--safe)` → `--status-safe-bar` 치환 OK (활성 dot + '활성' 라벨)
- 카테고리 배지 `rgba(59,130,246,.13)` + `color var(--acl)` → status-info bg + acl 알리아스 치환 검토 (OQ #5)
- danger 안내 박스 `rgba(239,68,68,.08)` → status-danger-bg 알리아스 치환 OK (line 377, 384)
- SVG IconPlus / IconChevronDown → Lucide `Plus` / `ChevronDown` 치환 검토 (OQ #6)
```

위 모든 식별자/값은 §6 negative rule + §5 룰 11/12 + §7 OQ #1~#6 default 답에서 재확인. 1 byte 변경 시 W6 verify FAIL.

---

# §2. sub-wave 분배 + TSX checklist

## §2.1 sub-wave 표 (4개)

| sub-wave | 슬러그 | 영역 | 산출 sketch | 라인 추정 | 비즈 anchor 포함? |
|---|---|---|---|---|---|
| W2 | `sketch-wave-2-frame-guard.html` | 외곽 wrapper + admin 가드 (시각) + `<style>` keyframes (blink/slideUp) 토큰화 | sketch HTML | 100~150 | admin 가드 visual placeholder / bg `--bg`→`--surface-page` |
| W3 | `sketch-wave-3-header-filters.html` | 상단 헤더 (카테고리 select + filterZone + filterFloor + 개소 카운트) — 데스크톱 가로 + 모바일 세로 분기 + 데스크톱 '개소 추가' 버튼 | sketch HTML | 200~280 | CATEGORIES 19종 / ZONE_LABEL / availableFloors / 카운트 라벨 |
| W4 | `sketch-wave-4-list-fab.html` | 콘텐츠 (모바일 카드 리스트 + 모바일 FAB / 데스크톱 테이블 7 컬럼) + skeleton + error + empty 4 상태 | sketch HTML | 250~340 | CheckPointCard 8x8 dot+badge+'수정 ▸' / 테이블 7 컬럼 / SKELETON / empty 카피 verbatim |
| W5 | `sketch-wave-5-modal-form.html` | BottomSheet (모바일) + DesktopModal (데스크톱) wrapper + 등록·수정 폼 (6 필드 + 소화기 7 필드 분기 + 비활성화 confirm) | sketch HTML | 280~400 | BottomSheet/DesktopModal CSS verbatim / 폼 필드 placeholder + canSave + isBusy + confirmDeactivate |

> 4 sub-wave 분할은 다음 기준:
> - W2: 외곽+가드+keyframes 등 보일러플레이트만 분리 (단순 sub-wave).
> - W3: 상단 헤더 (모바일/데스크톱 분기 복잡) 단독 분리 — 23-education / 16-workshift 와 유사.
> - W4: 콘텐츠 영역 단독 — 데스크톱 테이블 7 컬럼 + 모바일 카드 + 4 상태 (skeleton/error/empty/data) 가 무거움.
> - W5: 모달 + 폼 단독 — BottomSheet/DesktopModal 분기 + 등록 폼 6+7 필드 + 비활성화 confirm 까지 sub-wave 의 절반 부담.

## §2.2 TSX 변환 (W6) checklist

| 항목 | 룰 |
|---|---|
| 비즈 anchor §1.3 전체 | 1 byte 변경 금지 (CATEGORIES_FALLBACK 19종 / ZONE_LABEL / ZONE_FLOORS / FLOOR_ORDER / MARKER_TYPE_LABEL / FLOOR_CODE / admin 가드 / queryKey 6 / useMutation 3 / 유도등 분기 / 'basement'='common' eq / canSave / handleSave / 카피 / placeholder / toast) |
| 인라인 `style={{...}}` 제거 | Tailwind utility 치환 (24-checkpoints.md §4 요구사항) — 단, BottomSheet slideUp animation + handle bar 등 키프레임 의존 영역은 className + `<style>` 그대로 유지 또는 `tailwind.config` extend |
| `lg:*` prefix | 레이아웃 차이 (모바일 카드 / 데스크톱 테이블 / 모바일 헤더 column / 데스크톱 헤더 row) 에만 사용 — spacing 분기는 토큰 자동 |
| 모달 chrome | 02+06 chrome 룰 직접 적용 X. BottomSheet/DesktopModal 은 별도 패턴 — StaffManagePage(26) 와 공통화는 별도 task (이 wave 범위 밖, OQ #1) |
| 외곽 hex 변경 | `var(--bg)/--bg2/--bg3/--bg4/--bd/--bd2/--t1/--t2/--t3/--acl/--safe/--danger` → `--surface-page/--raised/--sunken/--active/--border-default/--border-strong/--text-primary/--secondary/--tertiary/--accent-primary/--status-safe-bar/--status-danger` 치환 OK (design-system.md §4.1 마이그레이션 표) |
| 폰트 격상 | fontSize 9 (카테고리 배지 line 408) 사용 금지 — `text-caption` (12px) 격상 검토 (OQ #5) / fontSize 10/11 (테이블 status / 모바일 필터 select) → `text-caption` 격상 검토 / fontSize 12 → `text-caption` / 13 → `text-label` / 14 → `text-body-sm` / 16 → `text-body` (§1.1 노안 친화) |
| 폰트 위계 모달 | 모달 title fontSize 16 → `text-body` 또는 `text-title` 격상 검토 |
| Lucide 치환 | IconPlus SVG → `<Plus size={16/18} />` / IconChevronDown SVG → `<ChevronDown size={14/16} />` (OQ #6) |
| toast | react-hot-toast 그대로 사용 (메모리 룰 변경 없음) |
| useAuthStore | `me?.role !== 'admin'` 가드 보존 (useEffect + early return 둘 다) |
| 비즈 카피 | §1.3 카피 verbatim 8건 + placeholder 9건 + toast 카피 verbatim 7건 + select option verbatim 모두 보존 |
| FAB safe-area | `paddingBottom: calc(16px + var(--sab))` 보존 (line 676) — iOS PWA safe-area-inset-bottom 룰 |
| StaffManagePage 공통화 | BottomSheet / DesktopModal 함수 공통 추출은 별도 task (OQ #1). 이 wave 는 둘 다 동 파일 인라인 보존. |

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

(메타) — CheckpointsPage 의 fontSize 9 (카테고리 배지 line 408), 10 (테이블 status line 641), 11 (모바일 필터 select line 567, 574, 578, 모바일 카드 액션 line 411) 모두 §1.1 위반 → 격상 필수. OQ #5.

## §3.2 §1.2 정보 인지 > 미적 정제

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

## §3.3 §1.3 모바일/데스크톱은 같은 시스템, 다른 밀도

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

(메타) — CheckpointsPage 는 모바일 카드 리스트 ↔ 데스크톱 테이블, 모바일 헤더 column ↔ 데스크톱 헤더 row 로 §1.3 룰 일치 (레이아웃이 분기 책임). 폰트는 모바일/데스크톱 동일 유지.

## §3.4 §6.4 Backgrounds & Gradients

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

(메타) — CheckpointsPage 는 그라데이션 사용 없음. 저장 버튼 / 개소 추가 버튼 모두 단색 `var(--acl)`. §6.4 룰 일치 — 그라데이션 신규 도입 금지 (OQ #2 'CTA 버튼 §6.4 그라데이션 적용?' default 답 = 미적용).

## §3.5 §6.5 Hover & Press States

```
### 6.5 Hover & Press States

- **hover**: `border-color` 강화 (`default` → `strong`) + `translateY(-1px)` 미세 상승, **또는** background 한 단계 진하게 (`raised` → `sunken`)
- **press/active**: 별도 스타일 없음 (웹 기반 PWA, 네이티브 제스처 의존)
- **링크**: 별도 hover 없음, `--text-link` 색만
```

(메타) — 데스크톱 테이블 row hover 가 `e.currentTarget.style.background = 'var(--bg3)'` 인라인 변경 (line 627~628) — §6.5 의 "background 한 단계 진하게 (raised → sunken)" 일치. TSX 변환 시 Tailwind `hover:bg-surface-sunken` 치환 가능.

## §3.6 §6.8 Layout Rules

```
### 6.8 Layout Rules

- **모바일**: 단일 컬럼, 그리드 기반 (2열 또는 4열 통계)
- **데스크톱**: 좌/우 분할 (flex, 우측 고정폭 340px), 또는 좌(50%)/우(50%)
- **페이지 패딩**: 모바일 16px, 데스크톱 24px (자동 분기, `--page-padding`)
- **네비게이션**: 모바일 BottomNav, 데스크톱 사이드바
- **자체 헤더 페이지 다수** (App.tsx 헤더 숨김 패턴) — 상세 페이지/도면/DIV/일정/일지/법정점검 등
```

(메타) — 24-checkpoints 는 모바일 단일 컬럼 + 데스크톱 단일 컬럼 (좌우 분할 X). 자체 헤더 페이지 군 X — App.tsx 기본 헤더 사용 (페이지 내부 상단 select 영역만). 모바일 BottomNav 노출, FAB 는 BottomNav 위 sticky.

## §3.7 §7.1 Icon System: Lucide

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

(메타) — CheckpointsPage 의 IconPlus (line 11~18, 18px 또는 16px) + IconChevronDown (line 19~25, 14/16px) 인라인 SVG → Lucide `<Plus />` / `<ChevronDown />` 치환 (OQ #6). 데스크톱 헤더 Plus 16 / 모바일 FAB Plus 18 → 16 또는 20 (§7.1 사이즈 룰).

---

# §4. components.css inherit 매핑

24-checkpoints 는 components.css 신규 추가 / 수정 0 (단일 페이지 + StaffManagePage(26) 와 공통 모달 패턴이지만 공통 추출은 별도 task — 이 wave 범위 밖).

## §4.1 재사용 (기존 components.css / tokens.css 그대로 사용)

| 컴포넌트 | 출처 | 24-checkpoints 사용처 |
|---|---|---|
| `.bg-surface-page` / `.bg-surface-raised` / `.bg-surface-sunken` / `.bg-surface-active` | tokens.css | 외곽 / 카드 / input / 비활성 버튼 |
| `.text-text-primary` / `.text-text-secondary` / `.text-text-tertiary` | tokens.css | 본문 / 보조 / 메타 |
| `.text-status-safe-bar` / `.text-status-danger` | tokens.css | 활성 dot + '활성' 라벨 / 비활성화 버튼 |
| `.bg-status-info-bg` / `.text-status-info` (또는 `--accent-primary` 알리아스) | tokens.css | 카테고리 배지 (rgba(59,130,246,.13) + var(--acl)) |
| `.bg-status-danger-bg` (rgba(239,68,68,.08)) | tokens.css | 비활성화 안내 박스 / 비활성화 버튼 |
| `.text-caption` / `.text-label` / `.text-body-sm` / `.text-body` | typography.css | placeholder / 라벨 / 본문 |
| `.rounded-md` (12) / `.rounded-lg` (16) / `.rounded-sm` (8) | tokens.css | 카드 / 모달 / input·button |
| `.btn` / `.btn-primary` / `.btn-secondary` (14-reports components.css) | 14-reports | 저장 / 취소 / 비활성화 액션 row (검토) |

## §4.2 신규 추가 (이 wave 에서 새로 정의)

| 컴포넌트 | 정의 위치 | 사유 |
|---|---|---|
| **없음** | — | StaffManagePage 공통화는 별도 task. BottomSheet/DesktopModal/CheckPointCard/SKELETON 모두 동 파일 인라인 유지 (이 wave 범위). |

> StaffManagePage(26) 와 BottomSheet/DesktopModal 함수가 거의 동일 — 공통 컴포넌트 `src/components/ui/Modal.tsx` 또는 `Sheet.tsx` 추출은 24-checkpoints + 26-staff-service 양쪽 wave 종결 후 별도 task 권장 (OQ #1 default = 미공통화, 이 wave 는 인라인 보존).

---

# §5. 메모리 룰 inline 인용 (>=10 unique slug)

다음 12 메모리 룰 slug 를 inline 으로 박제 (변경 시 W6 verify FAIL):

1. **`feedback_design_sketch_first`** — spacing/sizing 도 sketch HTML 로 시안 보여주고 승인 받은 후 인라인 적용. 24-checkpoints W2/W3/W4/W5 sketch 는 사용자 컨펌 필수.
2. **`feedback_design_changes_ask_first`** — 버그 수정이라도 레이아웃 구조/표시 방식 변경은 사용자와 상의 후. 24-checkpoints 의 BottomSheet/DesktopModal 공통화 / 폰트 격상 / Lucide 치환 / zone toggle UI 변경 모두 OQ 거쳐 컨펌.
3. **`feedback_redesign_sketch_rule_enforcement`** — §6.2/§6.3/§7.1 negative rule + 일관성 + executor 프롬프트 + verify gate + 자체 검수 4중 강화. 24-checkpoints 도 동일 룰 강제.
4. **`feedback_sketch_realistic_data`** — 표시 분기/라벨 룰 (없음/N개/X-Y/완료) 은 코드 그대로. 시안은 시각 디자인만. 24-checkpoints 의 19 카테고리 / ZONE_FLOORS / FLOOR_ORDER / 유도등 분기 / 'basement'='common' eq 모두 코드 그대로.
5. **`feedback_tsx_wave_stat_card_drift`** — executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. W6 plan 에 sketch CSS verbatim 인용 + verify gate 권장.
6. **`feedback_planner_prompt_sketch_verbatim`** — 변환 wave 시 sketch CSS 정의 grep 추출 verbatim 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
7. **`feedback_tailwind_token_class_pattern`** — `status-` prefix 없음 (`text-fire-bar` O / `text-status-fire-bar` X) + lucide `size={N}` prop. 24-checkpoints W6 시 동일 패턴 강제.
8. **`feedback_tailwind_w8_h8_is_48px`** — tailwind.config spacing override: `w-8` = 48 (기본 32 아님), `w-7` = 32. 24-checkpoints 의 8x8 dot (line 404) / handle bar 32x4 (line 50) / 카테고리 배지 / SKELETON 64 height 모두 arbitrary `w-[Npx]` 또는 utility 정확 매핑.
9. **`feedback_text_caption_leading_none`** — 작은 컨테이너 안 `text-caption` lh:1.5 (18px) 가 `h-8` (32px) 안에서도 시각적 패딩. 카테고리 배지 (height 작음) / 모바일 카드 액션 '수정 ▸' / 테이블 status / 카운트 라벨 모두 `leading-none` 명시 검토.
10. **`feedback_avoid_premature_confirmation`** — 변경 후 "approved 주세요" 자제. 시각 작업에서 "거의 일치" 같은 자신감 표현 금지. 24-checkpoints W2/W3/W4/W5 sketch 결과는 보여주고 사용자 판단.
11. **`project_redesign_15_daily_report_status`** — 캘리브 좌표 시스템 100% 보존 패턴 일반화 → 24-checkpoints 의 비즈 anchor (CATEGORIES_FALLBACK 19종 / ZONE_FLOORS / FLOOR_ORDER / MARKER_TYPE_LABEL / FLOOR_CODE / queryKey 6 / useMutation 3 / 유도등 분기 / 'basement'='common' eq / 카피 verbatim) 1 byte 변경 금지.
12. **`feedback_cbc7119_design_never_wrangler`** — 디자인 wave 중 wrangler 절대 X. 24-checkpoints W1/W2/W3/W4/W5/W6 모두 wrangler 금지. main push 자동 cbc7119-preview 만.

---

# §6. negative rule (이 wave 에서 금지된 것)

이 wave 의 산출은 **단일 markdown 1개** 뿐이다. 다음은 금지된다:

1. **`src/**` 수정 0** — 이 wave 는 sketch/문서 wave. `cha-bio-safety/src/pages/CheckpointsPage.tsx` 또는 다른 `src/**` 파일 수정 시 W1 verify FAIL.
2. **sketch HTML 생성 0** — sketch HTML 은 W2/W3/W4/W5 에서 생성. 이 wave 는 인덱스 markdown 1개만.
3. **components.css 변경 0** — 기존 tokens.css/typography.css 재사용만, 신규 추가 0.
4. **App.tsx / `MOBILE_NO_NAV_PATHS` 등 라우팅 변경 0** — 24-checkpoints 의 `/checkpoints` 는 BottomNav 노출 페이지. 변경 불필요.
5. **wrangler 명령 0** — `wrangler pages deploy` / `wrangler d1` 모두 금지 (`.claude/settings.local.json` deny 강제). memory `feedback_cbc7119_design_never_wrangler`.
6. **`npm run deploy` 0** — 직원 도메인 경로. CLAUDE.local.md 룰. main push 만으로 cbc7119-preview 자동 배포.
7. **admin 가드 변경 0** — `me?.role !== 'admin'` 체크는 useEffect + early return 양쪽 모두 보존. 이 wave 에서 결정/변경 불가.
8. **CATEGORIES_FALLBACK 19종 / ZONE_FLOORS / FLOOR_ORDER / MARKER_TYPE_LABEL / FLOOR_CODE 비즈 데이터 변경 0** — 이 wave 에서 결정/변경 불가.
9. **BottomSheet / DesktopModal / CheckPointCard 함수 공통 추출 0** — StaffManagePage 와 공통화는 별도 task. 이 wave 는 박제만.
10. **유도등 (FPM-) / 'basement'='common' / 소화기 (isExtCategory) 분기 비즈 로직 변경 0** — W6 에서도 변경 금지. 이 wave 는 박제만.
11. **평면(flat) 폴더 룰 위반 0** — sketch HTML 은 (다음 wave 에서) `cha-bio-safety/docs/redesign-context/24-checkpoints/sketch-wave-N-{slug}.html` 평면 배치. `sketch/` 서브폴더 만들기 금지. 28-splash / 23-education / 25-qr-print 동일 패턴.
12. **이 인덱스에 시각 디자인 결정 박제 0** — 결정은 W2/W3/W4/W5 sketch + W6 TSX 에서. 이 인덱스는 박제 + OQ + 룰 인용만.

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

다음 6건은 W2 진입 직전 사용자 컨펌 필수. default 답을 명시 (사용자가 변경 요청 시에만 변경):

## OQ #1 — BottomSheet/DesktopModal 공통화 (StaffManagePage 26 와 동일)

**문제:** BottomSheet (line 40~57) + DesktopModal (line 60~74) 두 함수가 StaffManagePage(26) 와 거의 동일. 24-checkpoints.md §3 "현재 구현의 한계나 개선 여지" 에서 명시.

**옵션:**
- (a) 이 wave 에서 인라인 보존 (24-checkpoints + 26-staff-service 양쪽 완료 후 별도 task 로 공통 추출)
- (b) 이 wave 에서 `src/components/ui/Modal.tsx` 또는 `Sheet.tsx` 추출 + 24-checkpoints 우선 적용 + 26 은 후속

**Default:** (a) — 이 wave 는 박제만. 별도 task 로 양쪽 wave 완료 후 공통화. 메모리 `feedback_design_changes_ask_first` 룰 (구조 변경은 상의 후).

## OQ #2 — 저장 / 개소 추가 CTA 버튼 그라데이션 적용 여부

**문제:** 저장 / 개소 추가 버튼은 현재 단색 `var(--acl)` 사용. design-system.md §6.4 "유일한 그라디언트 2종" 중 "저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`" 적용 가능.

**옵션:**
- (a) 단색 `--accent-primary` 또는 `--status-info-bar` 유지 (현재 패턴)
- (b) §6.4 그라데이션 적용 (저장 + 개소 추가 + 모바일 FAB 3건)

**Default:** (a) — 현재 패턴 유지. 다른 페이지 (대시보드 등) 에서 일관 채용된 시점에 통일 적용. 이 wave 는 단색 보존.

## OQ #3 — zone toggle UI 변경 (button row → segment control)

**문제:** 등록 폼 zone 선택은 3 button row (`flex 1 / height 36 / fontSize 11`) 토글 패턴 (line 275~284). fontSize 11 은 §1.1 위반 (9·10·11px 금지). segment control 또는 select 또는 radio chip 격상 가능.

**옵션:**
- (a) button row 유지 + fontSize 11 → 12 (`text-caption`) 격상
- (b) segment control (한 줄 캡슐 4개 영역) 로 변경 + fontSize 12+
- (c) select 단일 + label 분기

**Default:** (a) — 시각 + 인터랙션 변경 최소. fontSize 만 §1.1 준수 격상. button row 클릭 영역 (`height 36`) 은 §1.1 모바일 44px 미달 → height 40~44 격상 검토 별도 OQ 가능.

## OQ #4 — 외곽 hex 토큰 치환 범위

**문제:** `var(--bg)/--bg2/--bg3/--bg4/--bd/--bd2/--t1/--t2/--t3/--acl/--safe/--danger` raw 변수는 design-system.md §4.1 마이그레이션 룰에 따라 새 토큰으로 치환 가능.

**옵션:**
- (a) 모두 새 토큰 치환 (`--bg`→`--surface-page` / `--bg2`→`--surface-raised` / `--bg3`→`--surface-sunken` / `--bg4`→`--surface-active` / `--bd`→`--border-default` / `--bd2`→`--border-strong` / `--t1/--t2/--t3`→`--text-primary/--secondary/--tertiary` / `--acl`→`--accent-primary` 또는 `--status-info-bar` / `--safe`→`--status-safe-bar` / `--danger`→`--status-danger`)
- (b) 기존 raw 변수 유지

**Default:** (a) — design-system.md §4.1 마이그레이션 표 그대로. 24-checkpoints.md §4 요구사항 일치.

## OQ #5 — 카테고리 배지 / 테이블 status / 모바일 필터 select 폰트 격상

**문제:** §1.1 룰 위반 영역:
- 카테고리 배지 fontSize 9 (모바일 카드 line 408) / 10 (데스크톱 테이블 line 632)
- 테이블 status fontSize 11 (line 641)
- 모바일 필터 select fontSize 11 (line 567, 574)
- 모바일 카드 액션 '수정 ▸' fontSize 12 (line 416) — §1.1 마지노선이지만 작은 영역에서 캡션 톤
- 모바일 카드 메타 fontSize 12 (line 412)

**옵션:**
- (a) 모두 `text-caption` (12px) 격상 + 작은 영역은 `leading-none` 추가 (`feedback_text_caption_leading_none`)
- (b) 카테고리 배지만 `--radius-pill` + 12px / 테이블 status + 모바일 필터는 데스크톱 13px / 모바일 12px (자동 분기) 격상
- (c) 현재 9/10/11 유지 (§1.1 위반)

**Default:** (a) — 일률 12 격상 + `leading-none`. §1.1 룰 엄격 적용.

## OQ #6 — Lucide IconPlus / IconChevronDown 치환

**문제:** IconPlus (line 11~18) + IconChevronDown (line 19~25) 인라인 SVG → Lucide `Plus` / `ChevronDown` 치환 가능. §7.1 룰 "이모지 사용 금지" + Lucide 통일.

**옵션:**
- (a) `<Plus size={16} />` (헤더 데스크톱 line 548) + `<Plus size={18} />` (모바일 FAB line 679) + `<ChevronDown size={14} />` (헤더 데스크톱 line 528) + `<ChevronDown size={16} />` (헤더 모바일 line 561) — 기존 size 보존
- (b) 모든 Plus/ChevronDown size={16} 으로 통일 (§7.1 사이즈 룰 "16 / 20 / 24 px 세 종류만") — 18 → 20 격상 또는 16 통일
- (c) SVG path 유지

**Default:** (a) — 기존 size 보존 + Lucide 치환 (`size={14}` 는 §7.1 위반 — `size={16}` 격상). 별도 OQ "size={14} → size={16} 격상?" 통합.

---

# §8. verify gate

W1 산출 (`wave-1-index.md`) commit 직전 다음 verify 8건 실행. 모두 PASS 시 W1 종결, FAIL 시 재작성.

## 8.1 §1~§8 헤더 grep == 8

```bash
grep -c "^# §[1-8]\." cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md
# 기대: 8 (정확)
```

## 8.2 sub-wave row >=4

```bash
grep -E "^\| W[2-5] \|" cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md | grep -v '^#' | wc -l
# 기대: >=4 (sub-wave 표의 W2/W3/W4/W5 행 4개)
```

## 8.3 unique 메모리 룰 slug >=10

```bash
grep -oE "(feedback|project|reference)_[a-z0-9_]+" cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md | sort -u | wc -l
# 기대: >=10
```

## 8.4 OQ >=5

```bash
grep -c "^## OQ #" cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md
# 기대: >=5
```

## 8.5 src/** 변경 0

```bash
git status --porcelain cha-bio-safety/src/ 2>&1 | wc -l
# 기대: 0 (src/** 미수정)
```

## 8.6 sketch HTML 추가 0

```bash
find cha-bio-safety/docs/redesign-context/24-checkpoints -name "sketch-wave-*.html" 2>/dev/null | wc -l
# 기대: 0 (sketch HTML 은 W2~W5 에서 생성, W1 에서는 0)
```

## 8.7 §1.3 비즈 anchor 박스 존재

```bash
grep -q "비즈 시그니처 보존 anchor" cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md
# 기대: PASS (exit 0)
```

## 8.8 design-system fence >=7 + negative rule >=8

```bash
# fence 7건 (§3.1~§3.7)
grep -c "^## §3\." cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md
# 기대: >=7

# negative rule >=8건 (§6)
grep -c "^\d\+\. \*\*" cha-bio-safety/docs/redesign-context/24-checkpoints/wave-1-index.md
# 기대: >=8
```

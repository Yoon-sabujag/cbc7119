# Phase 18: Menu Customization - Context

**Gathered:** 2026-04-07 (revised 2026-04-08 — pivot to divider model)
**Status:** Ready for planning

<domain>
## Phase Boundary

설정 페이지에서 SideMenu를 사용자별로 커스터마이징할 수 있는 UI 구축. SideMenu는 **평면 리스트 + divider 마커** 모델로 전환 — 항목이 섹션에 갇히지 않고 자유롭게 흐른다. 구분선(divider)도 항목처럼 추가/수정/삭제/이동 가능. BottomNav는 5개 고정으로 유지 (편집 제거).

</domain>

<decisions>
## Implementation Decisions

### 저장 위치
- **D-01:** Server 저장 유지 — 기존 `settingsApi.getMenu()` / `saveMenu()` 재사용
- **D-02:** menu config 스키마: **평면 리스트 (divider 모델)**
  ```typescript
  type SideMenuEntry =
    | { type: 'item'; path: string; visible: boolean }
    | { type: 'divider'; id: string; title: string }

  interface MenuConfig {
    sideMenu: SideMenuEntry[]  // 평면 순서 배열
  }
  ```
  섹션은 컨테이너가 아니라 리스트 중간에 삽입되는 "표시선". 항목이 divider 경계에 구애받지 않고 자유롭게 위치 이동 가능.

### SideMenu 편집 UI
- **D-03:** 기존 SideMenu.tsx 내 editMode 코드 **완전 제거** → 설정 페이지로 이전
- **D-04:** SettingsPanel에 "메뉴 설정" 섹션 추가 — **SideMenu만 편집 대상**, BottomNav는 편집 UI 없음
- **D-05:** SideMenu는 read-only 구조 — `appliedMenu` 적용 로직만 유지 (config 기반 filter + divider를 섹션 헤더처럼 렌더)

### SideMenu 평면 리스트 편집 (핵심)
- **D-06:** 모든 entry (item + divider) 동일 레벨에서 위/아래 화살표로 자유 이동
- **D-07:** 구분선 추가 — "+ 구분선 추가" 버튼, 타이틀 직접 입력, 리스트 끝에 append (후 이동 가능)
- **D-08:** 구분선 수정 — 타이틀 인라인 편집 (탭하면 input으로 변경)
- **D-09:** 구분선 삭제 — 휴지통 아이콘, 인라인 확인
- **D-10:** 항목 visible 토글 — 숨김 처리 (삭제는 불가, 항상 config에 존재)

### BottomNav (편집 없음)
- **D-11:** BottomNav는 **5개 항목 고정** — 편집 UI 없음. 하드코딩된 ITEMS 유지.
- **D-12:** QR 중앙 특수 버튼 위치 유지 (기존 코드 그대로)
- **D-13:** ~~BottomNav 토글~~ — 제거됨 (의미 없음, 5슬롯 고정)
- **D-14:** BottomNav는 menuConfig와 **무관** — config는 SideMenu 전용

### 기본값 + 마이그레이션
- **D-15:** 기본 SideMenu 배치 (신규 사용자): 현재 SideMenu.tsx의 MENU 구조를 평면화 → 섹션 타이틀을 divider로, 항목은 그 아래 순서대로 배치
  ```
  [divider '대시보드']
  [item /dashboard]
  [divider '점검']
  [item /inspection] [item /legal] [item /elevator] [item /remediation]
  [divider '근무·복지']
  [item /staff-service] [item /education]
  [divider '시스템']
  [item /admin]
  ```
- **D-16:** 레거시 마이그레이션: 기존 `Record<path, {visible, order}>` → 평면 리스트로 변환. 기본 divider 구조에 사용자 visible/order 적용.

### 편집 UX (Claude 재량)
- **D-17:** 인라인 vs 모달: 현재 SettingsPanel 스크롤 내 인라인 (모달 X)
- **D-18:** 드래그 vs 버튼: 위/아래 화살표 버튼 (모바일 터치 안정성)
- **D-19:** 저장 방식: 명시적 "설정 저장" 버튼 (즉시 저장 X) — 변경 사항을 draft로 관리

### Claude's Discretion
- 구분선 title 입력 시 empty 처리
- 연속된 divider 허용 여부 (기본: 허용 — 사용자가 자유롭게)
- 리스트 상단/하단에 divider 없을 때 표시 방식
- 기본값 복원(reset) 버튼 위치

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 기존 메뉴 컴포넌트
- `cha-bio-safety/src/components/BottomNav.tsx` — 5개 ITEMS 하드코딩, QR 중앙 특수 버튼. **수정 금지** (편집 UI 없음, 원본 유지)
- `cha-bio-safety/src/components/SideMenu.tsx` — MENU 섹션 구조, editMode 로직 (line 49~), appliedMenu useMemo (line 60), edit UI (line 193). editMode **완전 제거** 대상.

### Settings Page
- `cha-bio-safety/src/components/SettingsPanel.tsx` — Row/Toggle primitives, 인라인 편집 패턴 (ChangePasswordForm 참조)

### Menu API
- `cha-bio-safety/src/utils/api.ts:298` — `settingsApi.getMenu()` / `saveMenu(config)` 재사용

### 인증
- `cha-bio-safety/src/stores/authStore.ts` — staff 기반 사용자별 설정

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `settingsApi.getMenu/saveMenu`: 메뉴 config CRUD 이미 구현 — 스키마 교체
- `SideMenu.tsx` 기존 MENU 구조: divider 기본값 생성 시 참조
- `SettingsPanel.tsx` Row + Toggle (38×21): 메뉴 편집 UI 재사용
- `useQuery` 캐시 키 `['menu-config']`: invalidate 패턴

### Established Patterns
- Server-side 사용자별 설정 저장 (`/api/settings/menu`)
- React Query 캐시 + invalidate 후 refetch
- 인라인 스타일 + CSS 변수
- 명시적 "저장" 버튼 패턴

### Integration Points
- `SideMenu.tsx`: editMode 제거, appliedMenu 로직을 divider 모델 기반으로 재작성 (평면 배열 → 섹션 헤더 + 항목 렌더)
- `SettingsPanel.tsx`: "메뉴 설정" 섹션 추가 (알림 아래)
- `api.ts`: settingsApi 타입 확장 (MenuConfig)
- `BottomNav.tsx`: **변경 없음**

### Migration Concern
- 기존 menu_config (`Record<path, {visible, order}>`) → 새 평면 리스트로 변환 로직 필요. 기본 divider 구조에 사용자 설정 merge.

</code_context>

<specifics>
## Specific Ideas

- **Divider는 항목의 "형제"** — 같은 타입 배열에 type 필드로 구분, 이동 로직 동일
- **BottomNav는 손대지 않는다** — 원본 유지, 편집 UI 전혀 없음
- **연속 divider 허용** — 사용자가 구분선만 여러 개 둘 수도 있음 (디자인 자유도)

</specifics>

<deferred>
## Deferred Ideas

- 메뉴 아이콘 변경 — 별도 phase
- 메뉴 이름 변경 (label rename) — 추후
- 드래그앤드롭 UX — 추후, 일단 화살표 버튼
- BottomNav에 다른 기능 스왑 — 아이콘 매핑 이슈로 보류

</deferred>

---

*Phase: 18-menu-customization*
*Context gathered: 2026-04-07*
*Revised: 2026-04-08 (pivot to divider model)*

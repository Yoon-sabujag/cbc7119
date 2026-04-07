# Phase 18: Menu Customization - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

설정 페이지에서 BottomNav와 SideMenu를 사용자별로 커스터마이징할 수 있는 UI 구축. SideMenu는 섹션 편집까지 지원 (항목 이동, 섹션 추가/삭제/순서 변경). 저장은 기존 server-side `/api/settings/menu` 재사용. SideMenu 내부에 있던 기존 editMode UI는 제거하고 설정 페이지로 이전.

</domain>

<decisions>
## Implementation Decisions

### 저장 위치
- **D-01:** Server 저장 유지 — 기존 `settingsApi.getMenu()` / `saveMenu()` 재사용. v1.3 ROADMAP의 "로컬 persist" 결정은 뒤집기 (기존 인프라 활용 우선)
- **D-02:** menu config 스키마 확장 — 기존 `Record<path, {visible, order}>`로는 섹션 정보 표현 불가. 새 스키마: `{ sections: [{ id, title, order, items: [{ path, visible, order }] }] }` 또는 path별 section 필드 추가

### SideMenu 편집 UI 이전
- **D-03:** SideMenu.tsx 내 editMode 코드 제거 (editConfig, saving, edit 토글 버튼 등)
- **D-04:** SettingsPanel/설정 페이지 내 "메뉴 설정" 섹션 신설 — BottomNav 편집 + SideMenu 편집 별도 영역
- **D-05:** SideMenu는 read-only로 단순화 — `appliedMenu` 적용 로직만 유지 (config 기반 필터/정렬)

### SideMenu 섹션 편집 (완전 자유도)
- **D-06:** 항목 섹션 간 이동 가능 (예: '관리자 설정'을 '근무·복지' 섹션으로 이동)
- **D-07:** 사용자가 새 섹션 추가 가능 (섹션 이름 직접 입력)
- **D-08:** 사용자가 빈 섹션 삭제 가능 (기본 섹션 포함)
- **D-09:** 섹션 자체의 순서 변경 가능
- **D-10:** 항목별 visible 토글 (숨김 처리)

### BottomNav 편집
- **D-11:** 5개 항목 (대시보드/점검/QR/조치/승강기) 중 QR을 제외한 4개의 순서 변경 가능
- **D-12:** QR은 중앙 특수 버튼으로 위치 고정 — UX 일관성 (Phase 5에서 Floating Action Button 패턴 정립)
- **D-13:** 항목별 visible 토글 가능 (QR 제외 — QR 숨기면 핵심 기능 접근 불가)
- **D-14:** BottomNav config는 menu config와 같은 엔드포인트에 분리된 키로 저장 (`bottomNav: [{key, visible, order}]`)

### 편집 UX (Claude 재량)
- 드래그 vs 버튼 선택은 구현 단계에서 결정 — 모바일 터치 환경 고려해 위/아래 화살표 버튼이 더 안정적일 수 있음
- 변경 사항 즉시 저장 vs "저장" 버튼 명시 — 현재 SideMenu editMode는 명시적 저장 패턴 사용 중, 일관성 위해 동일 패턴 권장

### Claude's Discretion
- 편집 모드 진입 UX (별도 모달 vs 인라인)
- 드래그 라이브러리 vs 버튼 방식 선택
- 섹션 추가/삭제 UI 디자인
- 변경 미리보기 표시 여부
- 기본값 복원(reset) 버튼 위치

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 기존 메뉴 컴포넌트 (핵심)
- `cha-bio-safety/src/components/BottomNav.tsx` — 5개 ITEMS 하드코딩, QR 중앙 특수 버튼 패턴
- `cha-bio-safety/src/components/SideMenu.tsx` — MENU 섹션 구조, editMode 로직 (line 49~), appliedMenu useMemo (line 60), edit UI (line 193)

### Settings Page (Phase 16/17 산출물)
- `cha-bio-safety/src/components/SettingsPanel.tsx` — 알림/계정 섹션 패턴, Toggle/Row 컴포넌트
- `cha-bio-safety/src/App.tsx` — settingsOpen 상태, SettingsPanel 마운트 위치

### Menu API (재사용)
- `cha-bio-safety/src/utils/api.ts:298` — `settingsApi.getMenu()` / `saveMenu(config)` 시그니처
- `cha-bio-safety/functions/api/settings/menu.ts` (또는 유사 경로) — 기존 menu config 핸들러

### 인증
- `cha-bio-safety/src/stores/authStore.ts` — staff 정보 (메뉴 설정은 사용자별이므로 staff_id로 분리 필요)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `settingsApi.getMenu/saveMenu`: 메뉴 config CRUD 이미 구현 — 스키마만 확장
- `SideMenu.tsx` `appliedMenu` useMemo: config 기반 필터/정렬 패턴 — 신스키마에 맞게 수정
- `SettingsPanel.tsx` Row + Toggle 컴포넌트: 메뉴 편집 UI에 재사용
- `useQuery` 캐시 키 `['menu-config']`: 편집 후 invalidate 패턴

### Established Patterns
- Server-side 사용자별 설정 저장 (`/api/settings/menu`)
- React Query 캐시 + invalidate 후 refetch
- 인라인 스타일 + CSS 변수
- 명시적 "저장" 버튼 (현재 SideMenu editMode 패턴)

### Integration Points
- `SideMenu.tsx`: editMode 제거 (코드 정리), appliedMenu 로직만 유지
- `SettingsPanel.tsx`: 새 "메뉴 설정" 섹션 추가 (알림 섹션 아래 또는 옆)
- `BottomNav.tsx`: ITEMS 배열을 useMemo + menuConfig로 변환
- `api.ts`: settingsApi에 BottomNav config 메소드 추가 또는 menu 통합 스키마

### Migration Concern
- 기존 menu_config 데이터 (`Record<path, {visible, order}>`)와 새 스키마 (섹션 포함) 간 마이그레이션 필요. 기존 사용자 데이터는 default 섹션에 매핑

</code_context>

<specifics>
## Specific Ideas

- 섹션 편집 중심 UX — 항목 이동만 되는 게 아니라 섹션 자체 추가/삭제/순서 변경
- BottomNav QR 버튼은 항상 중앙 고정 (UX 핵심)
- SideMenu에서 editMode 코드는 완전 제거하고 설정 페이지로 단일화

</specifics>

<deferred>
## Deferred Ideas

- 메뉴 아이콘 변경 — 별도 phase
- 메뉴 이름 변경 (label rename) — 사용자가 원하면 추후
- 다크/라이트 테마별 메뉴 표시 차이 — Phase 19 또는 별도

</deferred>

---

*Phase: 18-menu-customization*
*Context gathered: 2026-04-07*

# Phase 16: Settings Page + Profile - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

기존 SettingsPanel 슬라이드 패널을 독립 설정 페이지(/settings)로 전환. 비밀번호·이름 변경, 로그아웃 통합. 기존 SideMenu/DesktopSidebar의 로그아웃 버튼은 설정 페이지로 이동.

</domain>

<decisions>
## Implementation Decisions

### 설정 페이지 구조
- **D-01:** 독립 페이지 /settings 라우트 생성 — 기존 SettingsPanel 슬라이드 패널 제거
- **D-02:** App.tsx에 lazy-loaded SettingsPage 추가, SideMenu에 '설정' 메뉴 항목으로 진입
- **D-03:** NO_NAV_PATHS에 포함하지 않음 — BottomNav/SideMenu 표시 유지

### 이름 변경
- **D-04:** 이름 클릭 → 별도 편집 모달 (비밀번호 변경 ChangePasswordForm과 동일 패턴)
- **D-05:** 새 API 엔드포인트 필요: PUT /api/auth/profile (name 필드 업데이트)
- **D-06:** 변경 후 authStore의 staff.name도 갱신

### 로그아웃
- **D-07:** SideMenu와 DesktopSidebar에서 로그아웃 버튼 제거 → 설정 페이지 하단에 배치
- **D-08:** 기존 authStore.logout() + navigate('/login') 패턴 그대로 사용

### 기존 기능 이관
- **D-09:** SettingsPanel의 알림 토글, 테마 선택, 비밀번호 변경을 설정 페이지로 이관
- **D-10:** 앱 정보 (버전, 주소)도 설정 페이지 하단에 유지

### Claude's Discretion
- 설정 페이지 내부 섹션 레이아웃 (카드형 vs 리스트형)
- 이름 변경 모달 UI 상세 디자인
- 데스크탑 레이아웃 (2컬럼 등)
- 설정 항목 그룹핑 순서

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 기존 설정 코드 (핵심)
- `cha-bio-safety/src/components/SettingsPanel.tsx` — 기존 슬라이드 패널 (182줄, Toggle/Row/ChangePasswordForm 컴포넌트 포함)
- `cha-bio-safety/src/App.tsx` — SettingsPanel import, settingsOpen 상태, 라우트 정의
- `cha-bio-safety/src/stores/authStore.ts` — logout(), staff 상태 관리

### 로그아웃 기존 위치
- `cha-bio-safety/src/components/SideMenu.tsx` — line 257: 로그아웃 onClick
- `cha-bio-safety/src/components/DesktopSidebar.tsx` — line 39, 165: 로그아웃 버튼

### API
- `cha-bio-safety/src/utils/api.ts` — authApi.changePassword 시그니처
- `cha-bio-safety/functions/api/auth/` — 인증 API 핸들러

### 페이지 패턴 참조
- `cha-bio-safety/src/pages/AdminPage.tsx` — 관리자 설정 페이지 패턴 (BottomSheet, 카드, 토글)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SettingsPanel.tsx`: Toggle, Row, ChangePasswordForm 컴포넌트 — 설정 페이지로 이관 가능
- `authStore.ts`: logout(), staff 상태 — 그대로 활용
- `authApi.changePassword()`: 비밀번호 변경 API — 이미 구현됨
- `AdminPage.tsx`: BottomSheet 패턴, 폼 스타일 참조

### Established Patterns
- 인라인 스타일 + CSS 변수
- lazy-loaded 페이지 (React.lazy + Suspense)
- React Query mutation으로 API 호출
- toast 알림 (react-hot-toast)
- useAuthStore() 로그인 상태 관리

### Integration Points
- App.tsx: /settings 라우트 추가, SettingsPanel import 제거
- SideMenu.tsx: '설정' 메뉴 항목 추가, 로그아웃 버튼 제거
- DesktopSidebar.tsx: 로그아웃 버튼 제거 (설정 페이지로 이동)
- functions/api/auth/: profile 업데이트 API 추가

</code_context>

<specifics>
## Specific Ideas

- ChangePasswordForm 패턴을 이름 변경 모달에도 적용 (동일 UX)
- 설정 페이지는 Phase 17~19의 알림/메뉴/앱 정보 섹션의 Shell 역할

</specifics>

<deferred>
## Deferred Ideas

- PWA 푸시 알림 구독/해제 — Phase 17
- 메뉴 커스터마이징 — Phase 18
- 앱 정보/캐시 초기화 — Phase 19

</deferred>

---

*Phase: 16-settings-page-profile*
*Context gathered: 2026-04-06*

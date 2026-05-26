---
title: "redesign/31-chrome — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-27
quick_id: 260527-2cm
branch: redesign/31-chrome
source_tsx_1: cha-bio-safety/src/components/GlobalHeader.tsx
source_tsx_1_lines: 45
source_tsx_2: cha-bio-safety/src/components/SideMenu.tsx
source_tsx_2_lines: 201
source_tsx_3: cha-bio-safety/src/components/SettingsPanel.tsx
source_tsx_3_lines: 894
source_tsx_4: cha-bio-safety/src/components/MenuSettingsSection.tsx
source_tsx_4_lines: 418
total_lines: 1558
design_system: cha-bio-safety/docs/redesign-context/31-chrome/design-system.md (v0.1.1 스냅샷)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (글로벌 chrome — 점검 모달 chrome 룰 직접 적용 X, header/back/footer 일관성 reference)
mirror_of: cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md (260522-209) + cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md + cha-bio-safety/docs/redesign-context/23-education/wave-1-index.md — 7섹션 + 4 sub-wave 옵션 B
app_mount: cha-bio-safety/src/App.tsx (GlobalHeader line 196 / SideMenu line 219 / SettingsPanel line 223 mount)
sub_wave_count: 4 (W2~W5 sketch) + 1 (W6 TSX checklist) + 1 (W7+ TSX 변환)
memory_rules_inline: 12 (10 표준 + 31-chrome 특화 2 — 공통 chrome 폭주 영향 + circular import 의식)
open_questions: 8
total_components_to_change: 4
total_pages_affected: 30
---

# redesign/31-chrome — sketch wave 1 (index)

본 문서는 W2~W5 후속 sketch wave + W6 TSX checklist + W7+ TSX 변환 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자는 다음을 알 수 있다:

- GlobalHeader.tsx (45 라인 — 모바일 메인 헤더, App.tsx line 196 mount) + SideMenu.tsx (201 라인 — 햄버거 슬라이드 드로어, App.tsx line 219 mount) + SettingsPanel.tsx (894 라인 — 설정 panel, App.tsx line 223 mount) + MenuSettingsSection.tsx (418 라인, SettingsPanel line 753 내부 렌더) **공통 chrome 4 컴포넌트** 통합 1558 라인의 element 인벤토리 → 옵션 B 4 sub-wave 분배 + **비즈 시그니처** 보존 anchor (MENU 상수 / DEFAULT_SIDE_MENU / settingsApi.getMenu / settingsApi.saveMenu / pushApi.getStatus / pushApi.getVapidKey / pushApi.subscribe / pushApi.unsubscribe / pushApi.updatePreferences / authApi / staffApi / Notification.requestPermission / navigator.serviceWorker.ready / pushManager.subscribe / pushManager.getSubscription / JSZip 백업 ZIP / `/api/database/backup` / `/api/database/restore` / `/api/database/backup-status` / `/api/push/test` admin / `__APP_VERSION__` Vite define / `__BUILD_TIME__` Vite define / handleLogout / handleClearCache / moveUp / moveDown / addDivider / renameDivider / deleteDivider / toggleVisible / resetToDefaults / saveMutation / entriesEqual / newDividerId / NotificationPreferences 6키 [daily_schedule / incomplete_schedule / unresolved_issue / event_15min / event_5min / education_reminder])
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6.4 / §7.1 의 verbatim 룰 박제 (§6.1 Progress Color Rule 미적용 — chrome 에 진척률 도넛 없음 / §6.2 Stat Card 미적용 — display 28px 숫자 없음, memory `feedback_tsx_wave_stat_card_drift` "미적용" 명시)
- chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 31-chrome 적용 여부 — **본 페이지 자체가 chrome 정의** → 점검 모달 chrome 룰은 직접 적용 X, 단 header height 48 / back button w:32 h:32 / borderBottom var(--bd) 같은 chrome 일관성 reference 는 보존 (Phase 06 floorplan 의 chrome-unified.md 패턴과 align)
- App.tsx 실측 mount 패턴 박제 (GlobalHeader line 196 / SideMenu line 219 / SettingsPanel line 223) + `MOBILE_NO_NAV_PATHS` (line 71) / `DESKTOP_NO_NAV_PATHS` (line 74) / `DESKTOP_HEADER_HIDE_PATHS` (line 77) / `PAGE_TITLES` (line 79~104) 4 가드 배열 verbatim
- 메모리 룰 12건 inline 인용 — 표준 10건 (`feedback_planner_prompt_sketch_verbatim` / `feedback_redesign_sketch_rule_enforcement` / `feedback_sketch_realistic_data` / `feedback_tailwind_token_class_pattern` / `feedback_tailwind_w8_h8_is_48px` / `feedback_text_caption_leading_none` / `feedback_tsx_wave_emoji_dot_gap` / `feedback_tsx_wave_stat_card_drift` / `feedback_avoid_premature_confirmation` / `feedback_design_sketch_first`) + 31-chrome 특화 2건 (`feedback_cbc7119_design_never_wrangler` / `feedback_gsd_workflow_strict`)
- §6 negative rule (이 wave 에서 금지된 것) — wrangler 금지 / npm run deploy 금지 / src/components/ 4 파일 수정 0 / App.tsx 수정 0 / 00-design-context/ 수정 0 / tailwind.config.js 수정 0 / MENU 상수 변경 금지 / DEFAULT_SIDE_MENU 변경 금지 / JSZip 백업 로직 변경 금지 / push prefs 6키 변경 금지 / circular import 의식 / 공통 chrome 폭주 영향 (30 페이지 전체에 영향) 명시
- §7 OQ 8건 — W2 진입 직전 사용자 컨펌 (다크/라이트 양쪽 지원 여부 / fontSize 9·10·11 격상 시 layout 영향 / SideMenu 아바타 그라데이션 `linear-gradient(135deg,#1d4ed8,#0ea5e9)` 폐기 vs 유지 / SettingsPanel 프로필 아바타 그라데이션 `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)` 폐기 / 햄버거 panel width 300 + SettingsPanel width 320 보존 / lucide vs 인라인 svg 일관성 / 특수 글리프 ✕ 닫기 버튼 보존 / admin 전용 테스트 푸시 이모지 `⏳` `🔔` 제거 룰 / W7 atomic 단일 변환 vs sub-wave 4 분할)

작성일: 2026-05-27 / Quick ID: 260527-2cm / Branch: redesign/31-chrome

> 28-splash W1 (260522-209) + 29-extinguisher-public W1 + 23-education W1 의 7섹션 + 4 sub-wave 구조를 정확히 mirror. 4 컴포넌트 1558 라인 통합 — **공통 chrome** (모든 인증 후 페이지에서 렌더, 30 페이지 전체에 영향). 옵션 B (4 sub-wave 분할) 권장 — GlobalHeader (45) → SideMenu (201) → SettingsPanel (894) → MenuSettingsSection (418) 분량/관심사 다르고 SettingsPanel + MenuSettingsSection 은 사실상 별도 분량. 본 인덱스는 `31-chrome/wave-1-index.md` (flat) 으로 평면 배치 — 28-splash + 29-extinguisher-public + 23-education 패턴 mirror, `sketch/` 서브폴더 없음.

---

# §1. 4 컴포넌트 인벤토리 — 영역별 표 + 라인 실측 + 비즈 anchor 박스 + 비즈 시그니처

## §1.1 영역별 인벤토리 표 (6 영역 — 컴포넌트별 분리)

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. GlobalHeader 전체 | `<header>` wrapper height 48 padding '0 12px' background var(--bg2) borderBottom 1px var(--bd) | GlobalHeader.tsx 9~18 | 모바일 메인 헤더 컨테이너 | App.tsx line 196 mount, !isDesktop && showNav 가드 | W2 |
| 1. GlobalHeader 전체 | 햄버거 버튼 32×32 radius 7 var(--bg3) var(--t2) + svg path "M4 6h16M4 12h16M4 18h16" 15×15 strokeWidth 2 | GlobalHeader.tsx 19~34 | 좌측 햄버거 (leftSlot 미지정 시) | onMenuOpen prop 호출 → App.tsx setSideOpen(true) | W2 |
| 1. GlobalHeader 전체 | leftSlot prop (예: 뒤로가기 버튼) | GlobalHeader.tsx 5/19 | 햄버거 대체 슬롯 | App.tsx line 197 backBtn (뒤로가기 path "M15 19l-7-7 7-7") 주입 | W2 |
| 1. GlobalHeader 전체 | `<span>` 타이틀 fontSize 13 fontWeight 700 var(--t1) flex 1 textAlign center/left | GlobalHeader.tsx 35~41 | 페이지 타이틀 | title prop ← App.tsx PAGE_TITLES[path] | W2 |
| 1. GlobalHeader 전체 | rightSlot prop (예: 설정 기어 버튼) + `<div width:32 />` 폴백 | GlobalHeader.tsx 4/42 | 우측 슬롯 / 빈 spacer | App.tsx line 199 settingsGearBtn (settings cog path) + dashboardRightSlot 등 주입 | W2 |
| 2. SideMenu 외곽 | 오버레이 `<div>` position fixed inset 0 zIndex 190 rgba(0,0,0,0.65) opacity transition 0.28s | SideMenu.tsx 109~119 | 햄버거 드로어 dimmer | onClose 호출 (App.tsx line 220) | W3 |
| 2. SideMenu 외곽 | panel `<div id="side-menu-panel">` position fixed top var(--sat) bottom calc(54+sab-sat) left 0 zIndex 200 width 82% maxWidth 300 background var(--bg2) transform translateX cubic-bezier(.4,0,.2,1) 0.3s borderRadius '0 16px 16px 0' | SideMenu.tsx 121~133 | 슬라이드 드로어 panel | open prop 분기 translateX(-100%) ↔ (0) | W3 |
| 2. SideMenu 외곽 | 상단 헤더 — 로고 30×30 radius 8 (`/icons/icon-192.png`) + 타이틀 "차바이오컴플렉스" 13/700 + 부제 "소방안전 통합관리" 9.5/var(--t3) + ✕ 닫기 28×28 radius 7 fontSize 15 | SideMenu.tsx 135~142 | 드로어 헤더 | onClose 호출 | W3 |
| 2. SideMenu 외곽 | 사용자 카드 padding 9 11 borderTop 1px var(--bd) → 아바타 28×28 radius 50% linear-gradient(135deg,#1d4ed8,#0ea5e9) initial 11/700 #fff + 이름 11.5/700 + 직책+shift 9.5/var(--t3) | SideMenu.tsx 187~197 | 로그인 사용자 표시 | useAuthStore → staff.name/title + getMonthlySchedule → todayShiftLabel (당직/비번/주간/연차) | W3 |
| 2. SideMenu 외곽 | body scroll lock useEffect — document.body.style.overflow='hidden' + touchmove preventDefault (panel 외 only) | SideMenu.tsx 89~103 | 드로어 열림 시 뒤 스크롤 차단 | iOS safe-area 보존 패턴 (memory `feedback_body_scroll_lock_safe_area`) | W3 |
| 3. SideMenu 메뉴 리스트 | MENU 상수 5 섹션 × 17 메뉴 아이템 — 주요 기능 5 (대시보드/일반 점검/QR 스캔/조치 관리/승강기 관리) + 시설 관리 6 (DIV/소화기 desktopOnly/CCTV desktopOnly/도면/소방 점검/소방 시설 추가 admin) + 문서 관리 8 (일일/업무 admin/월간/출근부/연간/소방계획서/일지 출력/QR 출력) + 근무·복지 2 (연차+식사/보수교육) + 시스템 1 (직원 admin) | SideMenu.tsx 19~54 | 메뉴 구조 source | MenuSettingsSection.tsx line 11 에서 import — circular dep | W3 |
| 3. SideMenu 메뉴 리스트 | ITEM_META: Record<string, MenuItem> — path → MenuItem 평면 매핑 | SideMenu.tsx 56~57 | MENU 평면 lookup | appliedEntries render 시 meta 조회 | W3 |
| 3. SideMenu 메뉴 리스트 | useQuery({ queryKey: ['menu-config'], queryFn: settingsApi.getMenu, staleTime: 300_000 }) | SideMenu.tsx 63 | 사용자 커스터마이즈 메뉴 fetch | MenuSettingsSection 과 동일 queryKey 공유 — qc.invalidateQueries 시 양쪽 동기화 | W3 |
| 3. SideMenu 메뉴 리스트 | appliedEntries useMemo<SideMenuEntry[]> | SideMenuEntry from utils/api | SideMenu.tsx 66~70 | 평면 entries 정렬된 리스트 | menuConfig.sideMenu 또는 빈 배열 | W3 |
| 3. SideMenu 메뉴 리스트 | 메뉴 리스트 render — appliedEntries.map → divider (fontSize 9 fontWeight 700 var(--t3) letterSpacing .08em uppercase) / item (fontSize 12.5 fontWeight 500) / soon (fontSize 10 var(--bg3) var(--t3) radius 6) / badge unread (var(--danger) #fff fontSize 11 fontWeight 700 JetBrains Mono radius 9 minWidth 16) | SideMenu.tsx 145~184 | 평면 리스트 렌더 | role admin 분기 / desktopOnly 분기 / unresolvedCount → /remediation badge | W3 |
| 4. SettingsPanel 외부+helper | 외부 wrapper — 오버레이 position fixed inset 0 zIndex 290 rgba(0,0,0,0.65) | SettingsPanel.tsx 640~648 | 설정 드로어 dimmer | onClose 호출 (App.tsx line 224) | W4 |
| 4. SettingsPanel 외부+helper | panel `<div id="settings-panel">` position fixed top isDesktop ? 0 : var(--sat) bottom calc(0 OR 54+sab) right 0 zIndex 300 width 88% maxWidth 320 background var(--bg2) transform translateX cubic-bezier 0.3s borderRadius '16px 0 0 16px' | SettingsPanel.tsx 650~660 | 우측 슬라이드 드로어 panel | open prop 분기 translateX(100%) ↔ (0) + isDesktop prop 으로 top/bottom 분기 | W4 |
| 4. SettingsPanel 외부+helper | 헤더 — fontSize 13.5 fontWeight 700 "설정" + ✕ 닫기 28×28 radius 7 fontSize 15 var(--bg3) | SettingsPanel.tsx 663~670 | 드로어 헤더 | onClose 호출 | W4 |
| 4. SettingsPanel 외부+helper | 프로필 아바타 44×44 radius 50% linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) + 이니셜 18/700 #fff + displayName 14/700 + displayTitle 10/var(--t3) | SettingsPanel.tsx 673~688 | 사용자 정보 표시 | useAuthStore → staff (이름/직책/역할 보정 로직 line 299~) | W4 |
| 4. SettingsPanel 외부+helper | helper — function SectionHeader (fontSize 9 §1.1 위반 강도 최대 / ChevronRight rotated) | SettingsPanel.tsx 6~26 | 6 섹션 토글 헤더 | usePersistedCollapse 6 키 | W4 |
| 4. SettingsPanel 외부+helper | helper — function usePersistedCollapse — localStorage 'settings-*' key 6개 | SettingsPanel.tsx 29~41 | collapse state 영구 저장 | localStorage | W4 |
| 4. SettingsPanel 외부+helper | helper — function Toggle width 38 height 21 radius 11 #2563eb on / var(--bg4) off | SettingsPanel.tsx 57~76 | 일반 토글 UI | onChange prop | W4 |
| 4. SettingsPanel 외부+helper | helper — function PermBadge granted '허용됨' #22c55e / denied '차단됨' #ef4444 / default '권한 미설정' var(--t3) | SettingsPanel.tsx 80~94 | 푸시 권한 상태 배지 | Notification.permission 분기 | W4 |
| 4. SettingsPanel 외부+helper | helper — function Row padding '10px 12px' var(--bg3) radius 9 + label/sub/children/onClick | SettingsPanel.tsx 96~106 | 설정 행 공통 컨테이너 | onClick navigate | W4 |
| 4. SettingsPanel 외부+helper | helper — function ChangePasswordForm | authApi.changePassword mutation | toast '비밀번호가 변경되었습니다' | SettingsPanel.tsx 109~145 | 비밀번호 변경 폼 | authApi.changePassword | W4 |
| 4. SettingsPanel 외부+helper | helper — function NameEditModal — staffApi.update mutation | position fixed inset 0 zIndex 300 rgba(0,0,0,0.6) | SettingsPanel.tsx 148~181 | 이름 변경 모달 | staffApi.update | W4 |
| 4. SettingsPanel 외부+helper | helper — function ProfileEditForm — 9 필드 (이름/사번/직책/역할/입사일/생년월일/연락처/이메일) | SettingsPanel.tsx 183~278 | 개인정보 수정 폼 | staffApi.update | W4 |
| 5. SettingsPanel 6 섹션 | 알림 — Permission 상태 (PermBadge) + handleSubscribe/handleUnsubscribe + 6 push prefs Toggle + admin 테스트 푸시 버튼 ⏳ 🔔 이모지 | SettingsPanel.tsx 690~750 | 푸시 알림 설정 | pushApi.getStatus/getVapidKey/subscribe/unsubscribe/updatePreferences + Notification.requestPermission + navigator.serviceWorker.ready + pushManager API | W4 |
| 5. SettingsPanel 6 섹션 | 메뉴 설정 — `<MenuSettingsSection />` 호출 | SettingsPanel.tsx 752~753 | 메뉴 설정 섹션 마운트 | MenuSettingsSection 컴포넌트 | W5 |
| 5. SettingsPanel 6 섹션 | 화면 — 테마 (다크/라이트/시스템) + 주간 현황 기준 (이번 주/최근 7일) + 결과 즉시 저장 토글 | SettingsPanel.tsx 755~771 | 화면 설정 | localStorage (직접 setItem/getItem) | W4 |
| 5. SettingsPanel 6 섹션 | 계정 — '개인정보 수정' Row → ProfileEditForm 토글 + '비밀번호 변경' Row → ChangePasswordForm 토글 | SettingsPanel.tsx 773~790 | 계정 관리 | useAuthStore.updateStaff + authApi + staffApi | W4 |
| 5. SettingsPanel 6 섹션 | 데이터베이스 (admin only) — 'DB (점검기록, 직원, 설정 등)' 4 버튼 (백업/복원) height 40 var(--bg3) + '파일 (점검 사진 등)' R2 4 버튼 (백업/복원) | SettingsPanel.tsx 792~857 | DB/R2 백업/복원 | handleDbBackup/handleDbRestore/handleR2Backup/handleR2Restore + JSZip + fetch `/api/database/backup` `/api/database/restore` `/api/database/backup-status` | W4 |
| 5. SettingsPanel 6 섹션 | 앱 정보 — '버전' sub `v${__APP_VERSION__} (${__BUILD_TIME__})` + '캐시 초기화' sub '최신 리소스로 새로고침' + '차바이오컴플렉스 방재' sub '경기도 성남시 분당구 판교로 335' | SettingsPanel.tsx 859~875 | 앱 메타 정보 | handleClearCache (caches.delete + navigator.serviceWorker.getRegistration().unregister) + Vite define | W4 |
| 5. SettingsPanel 6 섹션 | 로그아웃 — height 40 rgba(220,38,38,0.12) color #dc2626 border rgba(220,38,38,0.25) radius 9 fontSize 12 fontWeight 700 | SettingsPanel.tsx 877~889 | 로그아웃 버튼 | useAuthStore.logout() + navigate('/login') | W4 |
| 6. MenuSettingsSection 전체 | imports — `MENU from './SideMenu'` (line 11) + DEFAULT_SIDE_MENU from '../utils/api' (line 9) + lucide ChevronUp/ChevronDown/ChevronRight/Trash2 + useQuery/useMutation | MenuSettingsSection.tsx 1~14 | source dep | circular dep with SideMenu | W5 |
| 6. MenuSettingsSection 전체 | PATH_LABEL: Record<string, string> + DESKTOP_ONLY_PATHS: Set + ADMIN_PATHS: Set — MENU 에서 평면 path 생성 | MenuSettingsSection.tsx 15~29 | MENU 평면 lookup | MENU.flatMap | W5 |
| 6. MenuSettingsSection 전체 | newDividerId(): `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}` + entriesEqual(a, b) | MenuSettingsSection.tsx 32~48 | divider id 생성 + draft dirty 비교 | array 비교 | W5 |
| 6. MenuSettingsSection 전체 | draft / editingDividerIdx / confirmDeleteIdx / confirmReset / collapsed 5 state + collapsed localStorage 'menu-settings-collapsed' | MenuSettingsSection.tsx 61~73 | UI state + persist | localStorage | W5 |
| 6. MenuSettingsSection 전체 | useQuery 'menu-config' + saveMutation settingsApi.saveMenu → toast '메뉴 설정이 저장되었습니다' | MenuSettingsSection.tsx 54~95 | server fetch + save | settingsApi.getMenu/saveMenu | W5 |
| 6. MenuSettingsSection 전체 | moveUp / moveDown / toggleVisible / addDivider / renameDivider / deleteDivider / resetToDefaults | MenuSettingsSection.tsx 97~149 | draft 조작 | draft state mutate | W5 |
| 6. MenuSettingsSection 전체 | entry list render — divider (padding 10 12 var(--bg3) radius 9 borderLeft 2px var(--bd2) + fontSize 9 fontWeight 700 var(--t2) letterSpacing .08em uppercase) / item (padding 10 12 var(--bg3) radius 9 opacity entry.visible ? 1 : 0.4 fontSize 12 fontWeight 400) + 숨김 표시 fontSize 9 var(--t3) | MenuSettingsSection.tsx 195~274 | 메뉴 row 렌더 | ITEM_META 조회 + admin/desktopOnly 분기 | W5 |
| 6. MenuSettingsSection 전체 | Add divider 버튼 height 36 dashed border fontSize 12 '+ 구분선 추가' | MenuSettingsSection.tsx 280~288 | divider 추가 | addDivider 호출 | W5 |
| 6. MenuSettingsSection 전체 | Reset confirm — '기본 배치로 되돌릴까요?' / 취소 / 초기화 / '기본값으로 초기화' fontSize 10 | MenuSettingsSection.tsx 292~311 | 초기화 confirm | resetToDefaults | W5 |
| 6. MenuSettingsSection 전체 | Save 버튼 height 40 var(--acl) #fff radius 9 fontSize 12 fontWeight 700 '설정 저장' / '저장 중…' | MenuSettingsSection.tsx 314~327 | 저장 commit | saveMutation.mutate | W5 |
| 6. MenuSettingsSection 전체 | sub component — ArrowButton w 32 h 32 var(--t2) ChevronUp/ChevronDown size 14 | MenuSettingsSection.tsx 336~354 | 순서 이동 버튼 | moveUp/moveDown | W5 |
| 6. MenuSettingsSection 전체 | sub component — ToggleSmall width 38 height 21 radius 11 #2563eb on / var(--bg4) off + 동그라미 17×17 transform translateX(17px) | MenuSettingsSection.tsx 356~376 | visible 토글 | toggleVisible | W5 |
| 6. MenuSettingsSection 전체 | sub component — DividerTitleInput maxLength 20 height 40 fontSize 13 var(--bg3) border 1px solid var(--acl) radius 8 Enter blur / Escape revert | MenuSettingsSection.tsx 378~402 | divider 이름 편집 | renameDivider | W5 |
| 6. MenuSettingsSection 전체 | sub component — DeleteConfirmInline fontSize 10 '삭제할까요?' / 취소 / 삭제 + 5s auto-dismiss | MenuSettingsSection.tsx 152~159 / 404~418 | divider 삭제 confirm | deleteDivider | W5 |

## §1.2 라인 수 실측 확인

```
$ wc -l cha-bio-safety/src/components/{GlobalHeader,SideMenu,SettingsPanel,MenuSettingsSection}.tsx
      45 cha-bio-safety/src/components/GlobalHeader.tsx
     201 cha-bio-safety/src/components/SideMenu.tsx
     894 cha-bio-safety/src/components/SettingsPanel.tsx
     418 cha-bio-safety/src/components/MenuSettingsSection.tsx
    1558 total
```

## §1.3 비즈 시그니처 보존 anchor (별도 박스) — **30+ 식별자**

```
[GlobalHeader.tsx]
- interface GlobalHeaderProps { title / onMenuOpen / rightSlot? / leftSlot? } (line 1~6)
- export function GlobalHeader (line 8)
- header height 48 + padding '0 12px' (line 13~14) — 1 byte 변경 금지 (chrome 일관성)
- 햄버거 버튼 32×32 radius 7 (line 24) — w-8/h-8 함정 (memory `feedback_tailwind_w8_h8_is_48px`, w-8=48 X)
- svg path d="M4 6h16M4 12h16M4 18h16" (line 31) — 3선 햄버거 아이콘 markup 변경 금지
- title span fontSize 13 fontWeight 700 (line 37) — chrome 타이틀 토큰
- rightSlot/leftSlot prop 인터페이스 — App.tsx line 199/200 의 backBtn/settingsGearBtn/dashboardRightSlot 등과 연결
- ariaLabel "메뉴 열기" (line 22) — 접근성 변경 금지

[SideMenu.tsx]
- export type MenuItem = { label / path / badge / soon / role? / desktopOnly? } (line 17)
- export const MENU (line 19~54) — 5 섹션 × 17 메뉴 아이템, **다른 페이지에서 import 됨 (MenuSettingsSection.tsx line 11) — 변경 금지**
- ITEM_META (line 56~57) — path → MenuItem 매핑
- export function SideMenu({ open, onClose, unresolvedCount = 0 }) (line 59)
- useQuery({ queryKey: ['menu-config'], queryFn: settingsApi.getMenu, staleTime: 300_000 }) (line 63)
- appliedEntries: SideMenuEntry[] useMemo (line 66~70)
- RAW_TO_LABEL: '당'→'당직' / '비'→'비번' / '주'→'주간' / '휴'→'연차' (line 72)
- todayShiftLabel state (line 73) — getMonthlySchedule 호출 (line 80)
- useEffect body scroll lock (line 89~103) — document.body.style.overflow + touchmove preventDefault, **iOS safe-area 깨지는 body position:fixed 패턴 회피** (memory `feedback_body_scroll_lock_safe_area`)
- panel id="side-menu-panel" width 82% maxWidth 300 background var(--bg2) transform translateX(-100%) (line 122~133)
- 헤더 로고 30×30 radius 8 (line 136) + 타이틀 "차바이오컴플렉스" + 부제 "소방안전 통합관리" (line 138~139)
- 닫기 버튼 ✕ 28×28 radius 7 (line 141) — fontSize 15
- divider render: fontSize 9 fontWeight 700 var(--t3) letterSpacing .08em uppercase (line 149) — **9 위반 §1.1 마지노선**
- item render: fontSize 12.5 fontWeight 500 (line 163/175)
- soon 배지 fontSize 10 var(--t3) var(--bg3) radius 6 (line 164)
- badgeCount unread 분기: var(--danger) #fff fontSize 11 fontWeight 700 JetBrains Mono radius 9 (line 177)
- 사용자 카드 아바타 28×28 linear-gradient(135deg,#1d4ed8,#0ea5e9) (line 189) — **그라데이션 §6.4 매치 OQ #3 default 유지**
- 아바타 이니셜 fontSize 11 fontWeight 700 #fff (line 189)
- 사용자 이름 fontSize 11.5 fontWeight 700 (line 193) — **11.5 위반 §1.1**
- 직책+shift fontSize 9.5 var(--t3) (line 194) — **9.5 위반 §1.1 마지노선**
- NAV_H = 'calc(54px + var(--sab, 0px))' (line 9) — 본 컴포넌트가 BottomNav 위로 panel bottom margin 계산
- imports: useNavigate / useAuthStore / getMonthlySchedule / useStaffList / settingsApi / SideMenuEntry / MenuConfig — 변경 금지

[SettingsPanel.tsx]
- import JSZip from 'jszip' (line 3) — **R2 백업 zip 생성 라이브러리, 변경 금지**
- function SectionHeader (line 6~26) — **fontSize 9 (line 17) — §1.1 위반 강도 최대, 마지노선 16 위반**
- function usePersistedCollapse (line 29~41) — localStorage key persisted collapse state
- function Toggle (line 57~76) — toggle UI, background #2563eb on / var(--bg4) off
- function PermBadge (line 80~94) — granted '허용됨' #22c55e / denied '차단됨' #ef4444 / default '권한 미설정' var(--t3, #6e7681)
- function Row (line 96~106) — label/sub/children/onClick — `padding: '10px 12px'` var(--bg3) radius 9
- function ChangePasswordForm (line 109~145) — `authApi.changePassword` mutation, toast '비밀번호가 변경되었습니다'
- function NameEditModal (line 148~181) — `staffApi.update` mutation, position fixed inset 0 zIndex 300 rgba(0,0,0,0.6)
- function ProfileEditForm (line 183~278) — 9 필드 (이름/사번/직책/역할/입사일/생년월일/연락처/이메일) staffApi update
- export function SettingsPanel({ open, onClose, isDesktop = false }: Props) (line 280)
- 6 collapse state: notifCollapsed / displayCollapsed / accountCollapsed / dbCollapsed / appInfoCollapsed (line 286~289) — usePersistedCollapse 으로 영구 저장
- 7 상태 useState: cacheClearing / dbBackingUp / dbRestoring / r2BackingUp / r2BackupProgress / r2Restoring / testSending (line 290~296)
- permState: Notification.permission (line 304) / subscribed (line 307) / prefs: NotificationPreferences 6키 (line 308~313)
- useEffect pushApi.getStatus → setPermState/setSubscribed/setPrefs (line 315~)
- handleSubscribe — Notification.requestPermission + navigator.serviceWorker.ready + pushManager.getSubscription + pushApi.getVapidKey + pushManager.subscribe + pushApi.subscribe (line 338~354)
- handleUnsubscribe — pushManager.getSubscription + pushApi.unsubscribe (line 363~372)
- handleTestPush — admin only — fetch `${base}/push/test` (line 378~387) → toast '테스트 푸시 발송: N/M 성공'
- handlePrefToggle — pushApi.updatePreferences (line 402)
- handleClearCache — caches.delete / navigator.serviceWorker.getRegistration().unregister (line 422~439) → toast '캐시 초기화에 실패했습니다'
- handleDbBackup — fetch `${base}/database/backup` (line 448) → '백업 파일이 다운로드되었습니다'
- handleDbRestore — confirm() + fetch `${base}/database/restore` (line 474~487) → '복원 완료 (N개 실행, M개 오류)'
- handleR2Backup — JSZip + fetch backup-status + cron zips + delta keys (line 502~577) → 'R2 백업 완료'
- handleR2Restore — confirm() + fetch + unzip (line 591~619) → 'R2 복원 완료 (N개 파일)'
- handleLogout — useAuthStore.logout()
- displayName / displayTitle / displayRole / avatarChar (line 299~)
- 프로필 아바타 44×44 radius 50% linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) (line 675~681) — **그라데이션 §6.4 매치 X 폐기 후보 OQ #4**
- 프로필 아바타 이니셜 fontSize 18 fontWeight 700 #fff (line 679)
- displayName fontSize 14 fontWeight 700 var(--t1) (line 684)
- displayTitle fontSize 10 var(--t3) (line 685) — **10 위반 §1.1**
- panel id="settings-panel" width 88% maxWidth 320 background var(--bg2) right 0 (line 650~660)
- 헤더 fontSize 13.5 fontWeight 700 "설정" (line 668) + 닫기 ✕ 28×28
- admin 테스트 푸시 버튼 fontSize 11 fontWeight 600 (line 717) — **'⏳' '🔔' 이모지 2개 (line 722) — memory `feedback_tsx_wave_emoji_dot_gap` 제거 룰**
- 6 push prefs verbatim:
    daily_schedule '금일 점검 일정' sub '매일 08:45' (line 727)
    incomplete_schedule '전일 미완료 점검' sub '매일 08:45' (line 730)
    unresolved_issue '미조치 항목' sub '매일 08:45' (line 733)
    event_15min '행사 15분 전 알림' sub '행사 시작 15분 전' (line 739)
    event_5min '행사 5분 전 알림' sub '행사 시작 5분 전' (line 742)
    education_reminder '교육 D-60 알림' sub '교육일 60일 전' (line 745)
- 화면 섹션 verbatim — 테마 (다크/라이트/시스템) / 주간 현황 기준 (이번 주/최근 7일) / 결과 즉시 저장 (line 758~770)
- 계정 섹션 verbatim — '개인정보 수정' sub '연락처, 이메일, 생년월일' / '비밀번호 변경' (line 782/785)
- 데이터베이스 섹션 admin only — 'DB (점검기록, 직원, 설정 등)' / '파일 (점검 사진 등)' 4 버튼 height 40 var(--bg3) (line 797~853)
- 앱 정보 verbatim — '버전' sub `v${__APP_VERSION__} (${__BUILD_TIME__})` (line 864) / '캐시 초기화' sub '최신 리소스로 새로고침' / '차바이오컴플렉스 방재' sub '경기도 성남시 분당구 판교로 335'
- 로그아웃 버튼 — height 40 rgba(220,38,38,0.12) color #dc2626 border rgba(220,38,38,0.25) radius 9 fontSize 12 fontWeight 700 (line 879~888)
- __APP_VERSION__ + __BUILD_TIME__ Vite define — **vite.config.ts 의 define 파라미터 연결, 변경 금지**
- NotificationPreferences interface from '../utils/api' — 6키 변경 금지

[MenuSettingsSection.tsx]
- imports MENU from './SideMenu' (line 11) — **circular import 의식 — SideMenu 와 양방향 dep, 변경 시 빌드 깨질 가능성**
- import DEFAULT_SIDE_MENU from '../utils/api' (line 9) — **백업 fallback, 변경 금지**
- PATH_LABEL: Record<string, string> — MENU 에서 평면 path→label 생성 (line 15~19)
- DESKTOP_ONLY_PATHS: Set — MENU.filter(desktopOnly) (line 22~24) — 메뉴 설정은 모바일 사이드바만
- ADMIN_PATHS: Set — MENU.filter(role==='admin') (line 27~29)
- newDividerId(): `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}` (line 32~34)
- entriesEqual(a, b): SideMenuEntry[] 비교 (line 36~48)
- export function MenuSettingsSection (line 50)
- useQuery<MenuConfig>({ queryKey: ['menu-config'], queryFn: settingsApi.getMenu, staleTime: 300_000 }) (line 54~58) — **SideMenu 와 동일 queryKey 공유, qc.invalidateQueries 시 양쪽 동기화**
- draft / editingDividerIdx / confirmDeleteIdx / confirmReset / collapsed 5 state (line 61~66)
- collapsed state localStorage 'menu-settings-collapsed' persisted (line 66~73)
- useEffect serverConfig sync — DEFAULT_SIDE_MENU fallback (line 74~81)
- dirty memo — entriesEqual 비교 (line 83)
- saveMutation: settingsApi.saveMenu({ sideMenu: draft }) → '메뉴 설정이 저장되었습니다' (line 87~95)
- moveUp / moveDown (line 97~110) — index 교환
- toggleVisible / addDivider / renameDivider / deleteDivider / resetToDefaults (line 112~149) — DEFAULT_SIDE_MENU fallback
- confirmDeleteIdx auto-dismiss 5s (line 152~159)
- entry list render — divider (line 195~244) / item (line 247~274) — admin path 일반 사용자에게 숨김 (line 189) / desktopOnly 모바일에서 숨김 (line 249)
- divider 패턴: padding '10px 12px' var(--bg3) radius 9 borderLeft '2px solid var(--bd2)' (line 198~202) — fontSize 9 fontWeight 700 var(--t2) letterSpacing .08em uppercase (line 213~216) — **9 위반 §1.1**
- divider 입력 editing → DividerTitleInput (line 378~402) — maxLength 20 height 40 fontSize 13 var(--bg3) border 1px solid var(--acl) radius 8
- item 패턴: padding '10px 12px' var(--bg3) radius 9 opacity entry.visible ? 1 : 0.4 (line 252~256) — fontSize 12 fontWeight 400 (line 259) / 숨김 표시 fontSize 9 var(--t3) (line 263)
- Add divider 버튼: height 36 dashed border fontSize 12 (line 280~288) — '+ 구분선 추가' verbatim
- Reset confirm — '기본 배치로 되돌릴까요?' / 취소 / 초기화 / '기본값으로 초기화' verbatim (line 292~311) — fontSize 10
- Save 버튼 height 40 var(--acl) #fff radius 9 fontSize 12 fontWeight 700 (line 314~327) — '설정 저장' / '저장 중…' verbatim
- ArrowButton (line 336~354) — w:32 h:32 var(--t2) ChevronUp/ChevronDown size={14}
- ToggleSmall (line 356~376) — width 38 height 21 radius 11 #2563eb on / var(--bg4) off — 동그라미 17×17 transform translateX(17px)
- DividerTitleInput (line 378~402) — Enter blur / Escape revert
- DeleteConfirmInline (line 404~418) — '삭제할까요?' / 취소 / 삭제 verbatim, fontSize 10
```

위 모든 식별자/값/카피는 §6 negative rule + §5 룰 + §7 OQ default 답에서 재확인. 1 byte 변경 시 W6/W7 verify FAIL (28-splash + 15-daily-report precedent 동일 적용).

## §1.4 비즈 로직 시그니처 (W7 TSX 보존 anchor) — imports / 함수 시그니처 verbatim

```
from '../stores/authStore':
  - useAuthStore() → { staff, logout, updateStaff, isAuthenticated, login }

from '../utils/api':
  - settingsApi.getMenu(): Promise<MenuConfig>
  - settingsApi.saveMenu(config): Promise<void>
  - pushApi.getStatus / getVapidKey / subscribe / unsubscribe / updatePreferences
  - authApi.changePassword(...)
  - staffApi.update(...)
  - type SideMenuEntry = { type: 'item' | 'divider'; ... }
  - type MenuConfig = { sideMenu: SideMenuEntry[] }
  - type NotificationPreferences = { daily_schedule / incomplete_schedule / unresolved_issue / event_15min / event_5min / education_reminder }
  - const DEFAULT_SIDE_MENU: SideMenuEntry[]

from '../hooks/useStaffList':
  - useStaffList() → { data: Staff[] }

from '../utils/shiftCalc':
  - getMonthlySchedule(year, month, staffForCalc) → { staffRows }

from 'jszip':
  - new JSZip() / .file() / .generateAsync() (R2 백업)

from 'lucide-react':
  - ChevronRight (SettingsPanel SectionHeader)
  - ChevronUp / ChevronDown / Trash2 (MenuSettingsSection)

Vite define (vite.config.ts):
  - __APP_VERSION__ : string (빌드 시점 인젝션)
  - __BUILD_TIME__ : string (빌드 시점 인젝션)

API endpoints (admin 전용):
  - GET  /api/push/test
  - GET  /api/database/backup
  - POST /api/database/restore
  - GET  /api/database/backup-status
  - POST /api/database/backup-status (last backup date 업데이트)

localStorage keys:
  - 'menu-settings-collapsed' (MenuSettingsSection collapse persist)
  - 'settings-*' (SettingsPanel 6 collapse state usePersistedCollapse)
```

---

# §2. 4 sub-wave 분배 plan (옵션 B 권장)

## §2.1 옵션 비교 — 단일 atomic vs 4 분할 vs 3 합치기

옵션 A (단일 atomic — 4 컴포넌트 한 sketch HTML):
- 1558 라인 합쳐서 단일 sketch — 28-splash/23-education/30-not-found 단일 atomic 패턴 추구
- 단점: 1 sketch 안에서 4 컴포넌트 모든 state/scope (사이드 드로어 + 설정 panel + 햄버거 닫힘 상태 + 메뉴 설정 admin 분기 등) 시각화 어려움, 비즈 anchor 박스가 너무 큼

옵션 B (4 sub-wave 분할 — ★ 권장):
- W2 = GlobalHeader sketch (45 lines — 가장 작음, 빠르게 시작 가능, chrome 일관성 reference 박제)
- W3 = SideMenu sketch (201 lines — 햄버거 드로어 전체, MENU 상수 + flat SideMenuEntry render + 사용자 카드)
- W4 = SettingsPanel sketch (894 lines — 6 섹션 [알림/메뉴 설정 placeholder/화면/계정/데이터베이스/앱 정보] + 로그아웃 + 3 form modal [ChangePassword/NameEdit/ProfileEdit] + 4 helper [Toggle/PermBadge/Row/SectionHeader])
- W5 = MenuSettingsSection sketch (418 lines — SettingsPanel 내부에서 render 되지만 독립 sketch 가치 있음, draft state UI + reordering arrow + admin 분기 + reset)
- W6 = TSX 변환 verify checklist markdown
- W7+ = TSX 변환 wave (4 컴포넌트 atomic OR 분할, W6 결정)

옵션 C (3 sub-wave — GlobalHeader+SideMenu 합치기):
- W2 = GlobalHeader + SideMenu (246 lines — 둘 다 햄버거 메뉴 트랙)
- W3 = SettingsPanel (894 lines)
- W4 = MenuSettingsSection (418 lines)

★ 권장: 옵션 B. 컴포넌트 관심사가 다 다르고 SettingsPanel + MenuSettingsSection 은 사실상 별도 분량.

## §2.2 옵션 B 분배 표

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | GlobalHeader 전체 (모바일 메인 헤더) | 영역 1 — header h:48 padding:0 12px / 햄버거 32×32 / 타이틀 fontSize:13 fontWeight:700 / rightSlot 인터페이스 | sketch-wave-2-global-header.html |
| W3 | SideMenu 전체 (햄버거 슬라이드 드로어) | 영역 2 + 영역 3 — 오버레이 rgba(0,0,0,0.65) / panel width:82% maxWidth:300 / 헤더 [로고 30×30 + 타이틀 + ✕ 28×28] / 메뉴 리스트 [divider 9pt + item 12.5pt + soon 10pt 배지 + badge danger 11pt JetBrains Mono] / 사용자 카드 아바타 28×28 linear-gradient(135deg,#1d4ed8,#0ea5e9) | sketch-wave-3-side-menu.html |
| W4 | SettingsPanel 전체 (설정 드로어 + 6 섹션 + 3 form modal) | 영역 4 + 영역 5 — 오버레이 rgba(0,0,0,0.65) / panel width:88% maxWidth:320 right 0 / 헤더 [⚙ + 설정 + ✕] / 프로필 아바타 44×44 linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) / 6 섹션 SectionHeader 9pt §1.1 위반 / 6 push prefs Toggle / admin 테스트 푸시 [⏳ 🔔 이모지 제거 룰] / 화면 select / 계정 ChangePasswordForm + ProfileEditForm + NameEditModal / 데이터베이스 4 버튼 (DB 백업/복원 + R2 백업/복원) / 앱 정보 / 로그아웃 rgba(220,38,38,0.12) | sketch-wave-4-settings-panel.html |
| W5 | MenuSettingsSection 전체 (SettingsPanel 내부 메뉴 설정 섹션) | 영역 6 — draft list [divider 9pt borderLeft 2px var(--bd2) + item 12pt opacity:0.4 if !visible + 숨김 표시 9pt] / ArrowButton ChevronUp/Down 32×32 / ToggleSmall 38×21 #2563eb / DividerTitleInput maxLength 20 / Add divider dashed border / Reset confirm 10pt / Save button h:40 var(--acl) | sketch-wave-5-menu-settings.html |
| W6 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W5 sketch + 4 컴포넌트 비즈 로직 보존 룰 + 비즈 시그니처 1 byte 변경 금지 checklist + Tailwind cheatsheet + 4 컴포넌트 atomic 변환 가능 여부 메모 + circular import (MenuSettingsSection ↔ SideMenu MENU) 주의 + JSZip + Notification API + pushManager 보존 룰 | wave-6-tsx-conversion-checklist.md |

## §2.3 각 wave 행 — 보존 / 토큰 / 폰트 — W2~W5 각각 verbatim 인용

### W2 (GlobalHeader)

- **보존**: §1.3 박스 [GlobalHeader.tsx] 식별자 8건 — interface GlobalHeaderProps / header height 48 / padding '0 12px' / borderBottom 1px var(--bd) / 햄버거 32×32 radius 7 var(--bg3) var(--t2) / svg path "M4 6h16M4 12h16M4 18h16" 15×15 strokeWidth 2 / title span fontSize 13 fontWeight 700 var(--t1) / rightSlot+leftSlot prop 인터페이스 / aria-label "메뉴 열기"
- **토큰**: header bg `var(--bg2)` → `bg-surface-raised` / 햄버거 버튼 bg `var(--bg3)` → `bg-surface-overlay` 또는 `bg-bg3` alias / borderBottom `var(--bd)` → `border-border` / 타이틀 color `var(--t1)` → `text-text-primary` / 햄버거 color `var(--t2)` → `text-text-secondary` (memory `feedback_tailwind_token_class_pattern` — status- prefix 없음)
- **폰트**: 타이틀 fontSize 13 (§1.1 위반 X — 13 ≥ 12 마지노선이지만 16 본문 룰 위반) → fontSize 13 유지 vs 14 격상 OQ. lucide vs 인라인 svg = OQ #5 (default 인라인 유지). `w-7 h-7` = 32 / `w-[32px] h-[32px]` 인라인 (memory `feedback_tailwind_w8_h8_is_48px` w-8=48 함정)

### W3 (SideMenu)

- **보존**: §1.3 박스 [SideMenu.tsx] 식별자 18+ — MENU 상수 5섹션 17 아이템 / ITEM_META / useQuery 'menu-config' / appliedEntries / RAW_TO_LABEL 4매핑 / todayShiftLabel / body scroll lock useEffect / panel id="side-menu-panel" width 82% maxWidth 300 / 헤더 로고 30×30 / 닫기 ✕ 28×28 fontSize 15 / divider 9 letterSpacing .08em / item 12.5/500 / soon 배지 10 var(--bg3) / badgeCount danger 11 JetBrains Mono / 사용자 카드 아바타 28×28 그라데이션 / 이름 11.5 / 직책+shift 9.5 / NAV_H
- **토큰**: 오버레이 rgba(0,0,0,0.65) → `bg-surface-overlay` 토큰 정의 없음 → 인라인 유지 / panel bg `var(--bg2)` → `bg-surface-raised` / 헤더 로고 `/icons/icon-192.png` PNG 유지 (Lucide 교체 X) / 닫기 ✕ bg `var(--bg3)` color `var(--t2)` (memory `feedback_tailwind_token_class_pattern`) / divider color `var(--t3)` → `text-text-tertiary` letterSpacing .08em uppercase / item color `var(--t1)` → `text-text-primary` hover bg `var(--bg4)` → `hover:bg-bg4` alias / soon bg `var(--bg3)` color `var(--t3)` 9 (마지노선) / badge bg `var(--danger)` color #fff → `bg-danger text-text-on-accent` (memory `feedback_tailwind_token_class_pattern`) / 사용자 아바타 그라데이션 §6.4 매치 유지 default OQ #3 / 사용자 카드 bg `var(--bg3)` border `var(--bd)`
- **폰트**: divider 9 (§1.1 마지노선 위반 강도 9 = 12 격상 OQ #2 default 부분 절충) / item 12.5/500 (§1.1 마지노선 12 부합) / soon 10 (§1.1 위반) / badge 11 JetBrains Mono / 사용자 이름 11.5 (위반) / 직책+shift 9.5 (위반 마지노선) / 헤더 타이틀 13/700 / 부제 9.5 (위반). `w-7 h-7` = 32 / `w-[28px] h-[28px]` 인라인 / `w-[30px] h-[30px]` 로고 (memory `feedback_tailwind_w8_h8_is_48px`). `text-caption leading-none` 작은 컨테이너 안 명시 룰 (memory `feedback_text_caption_leading_none`)

### W4 (SettingsPanel)

- **보존**: §1.3 박스 [SettingsPanel.tsx] 식별자 30+ — JSZip import / SectionHeader fontSize 9 / usePersistedCollapse 6키 / Toggle 38×21 / PermBadge granted '허용됨' #22c55e + denied '차단됨' #ef4444 / Row padding 10 12 / ChangePasswordForm authApi / NameEditModal staffApi / ProfileEditForm 9 필드 / 6 collapse state / 7 useState / permState + subscribed + prefs NotificationPreferences / handleSubscribe pushManager API / handleUnsubscribe / handleTestPush admin / handlePrefToggle / handleClearCache caches.delete / handleDbBackup `/api/database/backup` / handleDbRestore / handleR2Backup JSZip / handleR2Restore / handleLogout useAuthStore / 프로필 아바타 44×44 그라데이션 / 6 push prefs verbatim 12 카피 / 화면 섹션 (테마/주간 현황 기준/결과 즉시 저장) / 계정 섹션 (개인정보 수정/비밀번호 변경) / 데이터베이스 admin (DB 4 + R2 4 버튼) / 앱 정보 (__APP_VERSION__/__BUILD_TIME__/캐시 초기화/주소) / 로그아웃 rgba(220,38,38,0.12)
- **토큰**: 오버레이 rgba(0,0,0,0.65) 인라인 / panel bg `var(--bg2)` → `bg-surface-raised` / 헤더 fontSize 13.5 fontWeight 700 / 프로필 아바타 44×44 linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) — **§6.4 매치 X 폐기 default OQ #4** → `bg-accent` solid / 이니셜 18/700 #fff / displayName 14/700 `var(--t1)` → `text-text-primary` / displayTitle 10 `var(--t3)` → `text-text-tertiary` (위반) / SectionHeader fontSize 9 → 12 격상 OQ #2 / Row bg `var(--bg3)` → `bg-surface-overlay` radius 9 / Toggle bg on #2563eb → `bg-accent` (변환 시 alias) bg off `var(--bg4)` / PermBadge 색 status-safe-bar/danger-bar 직접 매핑 (memory `feedback_redesign_sketch_rule_enforcement` 의미 fix) / 로그아웃 rgba(220,38,38,0.12) → `bg-danger/12` color #dc2626 → `text-danger` border rgba(220,38,38,0.25) → `border-danger/25` / DB/R2 4 버튼 height 40 var(--bg3) 9 radius (memory `feedback_tailwind_token_class_pattern`) / admin 테스트 푸시 fontSize 11 fontWeight 600 + ⏳ 🔔 이모지 (line 722) **제거 룰 OQ #6 default Lucide Send + Loader2 교체** (memory `feedback_tsx_wave_emoji_dot_gap`)
- **폰트**: SectionHeader 9 (§1.1 위반 강도 최대) / displayTitle 10 (위반) / push prefs sub 10 (위반) / 데이터베이스 caption 10 (위반) / reset confirm 10 (위반) / 캐시 'v__APP_VERSION__ ...' 9~10 (위반) — **일괄 12 격상 OQ #2 default 부분 절충**. panel height fontSize 13.5 (마지노선) / Toggle 동그라미 17×17 transform translateX(17px) / 닫기 ✕ 28×28 fontSize 15 (memory `feedback_tailwind_w8_h8_is_48px` w-7=32, w-[28]). `text-caption leading-none` 룰 적용 (작은 컨테이너 안 명시 — sub 카피 다수, memory `feedback_text_caption_leading_none`)

### W5 (MenuSettingsSection)

- **보존**: §1.3 박스 [MenuSettingsSection.tsx] 식별자 25+ — MENU import (line 11 circular dep) / DEFAULT_SIDE_MENU import / PATH_LABEL / DESKTOP_ONLY_PATHS / ADMIN_PATHS / newDividerId / entriesEqual / 5 state + collapsed localStorage 'menu-settings-collapsed' / useQuery 'menu-config' (SideMenu 와 공유) / saveMutation settingsApi.saveMenu / moveUp / moveDown / toggleVisible / addDivider / renameDivider / deleteDivider / resetToDefaults / confirmDeleteIdx auto-dismiss 5s / divider patterns / item patterns / Add divider 버튼 dashed / Reset confirm '기본 배치로 되돌릴까요?' / Save 버튼 '설정 저장' '저장 중…' / ArrowButton 32×32 / ToggleSmall 38×21 / DividerTitleInput maxLength 20 / DeleteConfirmInline '삭제할까요?' 카피
- **토큰**: divider bg `var(--bg3)` radius 9 borderLeft '2px solid var(--bd2)' → `bg-surface-overlay rounded-md border-l-2 border-border` / divider title fontSize 9 fontWeight 700 var(--t2) → `text-text-secondary` (memory `feedback_tailwind_token_class_pattern`) / item bg `var(--bg3)` radius 9 opacity 0.4 if !visible (memory `feedback_redesign_sketch_rule_enforcement` opacity 의미 부여 OK 숨김 = 시각 약화) / 숨김 표시 fontSize 9 var(--t3) (위반) / Add divider dashed border 1px var(--bd2) → `border-2 border-dashed border-border` / Reset confirm fontSize 10 (위반) / Save 버튼 bg `var(--acl)` color #fff radius 9 → `bg-accent text-text-on-accent rounded-md` / ToggleSmall on #2563eb off `var(--bg4)` / DividerTitleInput border 1px solid `var(--acl)` → `border border-accent`
- **폰트**: divider 9 (§1.1 마지노선 위반) / item 12 (§1.1 마지노선 OK) / 숨김 표시 9 (위반) / Add divider 12 / Reset confirm 10 (위반) / Save 12/700 / DividerTitleInput 13 / DeleteConfirmInline 10 — **일괄 12 격상 OQ #2 default 부분 절충**. ArrowButton 32×32 `w-[32px] h-[32px]` / ChevronUp/Down size={14} prop 패턴 (memory `feedback_tailwind_token_class_pattern` — `w-3.5 h-3.5` className 금지). ToggleSmall 38×21 동그라미 17×17 (memory `feedback_tailwind_w8_h8_is_48px`)

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

본 인용은 `cha-bio-safety/docs/redesign-context/31-chrome/design-system.md` (v0.1.1 스냅샷) 원문 그대로. 후속 wave 작업자가 design-system.md 를 별도로 열지 않아도 핵심 룰을 본 인덱스에서 직접 확인 가능하도록 박제한다.

## §3.1 design-system §1.1 노안 친화 (verbatim)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

> 31-chrome 현재 fontSize 위반 후보 다수: **9** (SideMenu divider line 149 / SettingsPanel SectionHeader line 17 — 위반 강도 최대 / SideMenu 부제 line 139 9.5 / SideMenu 직책+shift line 194 9.5 / MenuSettingsSection divider title line 213 / MenuSettingsSection 숨김 표시 line 263) / **10** (SideMenu soon 배지 line 164 / SettingsPanel displayTitle line 685 / SettingsPanel 데이터베이스 caption / SettingsPanel 캐시 'v__APP_VERSION__ ...' / MenuSettingsSection Reset confirm / DeleteConfirmInline) / **11** (SideMenu badgeCount line 177 / SettingsPanel admin 테스트 푸시 line 717) / **11.5** (SideMenu 사용자 이름 line 193). 12 (SideMenu item / MenuSettingsSection item / SettingsPanel 다수) 는 §1.1 마지노선. **터치 타겟 44 룰** 부합 항목: 햄버거 32×32 (위반 — 32 < 44) / 닫기 ✕ 28×28 (위반 강도 최대 — 28 < 44) / 프로필 아바타 44×44 (마지노선 OK) / 사용자 아바타 28×28 (장식 — 클릭 X). OQ #2 default 답 부분 절충 참조.

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

> 31-chrome 은 **매일 보는 chrome** (4명 × 365일 × 5+회/일 = 7300+회/년 인지). §1.2 의 "트렌디함은 가치가 없다" 룰 부합. 메뉴 설정의 reordering arrow + collapse state 영구 저장 모두 정보 인지 우선 패턴. 그라데이션 2종 (SideMenu 아바타 §6.4 매치 / SettingsPanel 프로필 §6.4 매치 X) 은 §1.2 "장식 빼고" 룰 대상 — SettingsPanel 프로필 폐기 default (OQ #4) / SideMenu 아바타 유지 vs 통일 (OQ #3). admin 테스트 푸시 이모지 ⏳ 🔔 는 장식 — 제거 (OQ #6 default Lucide 교체).

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

> GlobalHeader 는 모바일 전용 (App.tsx line 195 `!isDesktop && showNav`), SideMenu 도 모바일 전용 (App.tsx line 218 `!isDesktop && showNav`), SettingsPanel 은 모바일+데스크톱 양쪽 (App.tsx line 222~223 + isDesktop prop 분기) — §1.3 동일 폰트 룰 SettingsPanel 에서 자동 충족 (panel top/bottom 분기만, fontSize 분기 없음). 데스크톱은 DesktopSidebar (별도 컴포넌트, 본 wave scope 밖) 가 햄버거 역할 대체 → §1.3 의 "데스크톱은 spacing/레이아웃 분기, 폰트 동일" 룰 자동 부합 (DesktopSidebar 분량 별도 페이지에서 검토).

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

> **§6.1 미적용 — chrome 4 컴포넌트에 진척률 도넛/카테고리 카드 없음**. 단 SideMenu 의 badgeCount unresolvedCount > 0 → `var(--danger)` (line 177) 는 status 임계치 색 사용 — 룰 §6.2 위험 임계치 룰 부합 (미조치 > 0 → danger). PermBadge granted/denied 색 (#22c55e/#ef4444) 도 상태 의미 색 — 룰 부합.

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

> **§6.2 미적용 — chrome 4 컴포넌트에 display 28px 숫자 카드 없음**. SettingsPanel + MenuSettingsSection 모두 텍스트 라벨 + 토글 + 폼 UI — 통계 숫자 0개. **W6/W7 변환 wave executor 가 Stat Card §6.2 룰 verbatim 인용 누락으로 deviation 잡으면 안 됨** (memory `feedback_tsx_wave_stat_card_drift` 룰 따라 본 인덱스에 "미적용" 명시). 단 SideMenu badgeCount unresolvedCount 11pt JetBrains Mono 는 status 임계치 색 (danger) 사용 — §6.2 의 "위험 임계치 조건부 처리" 룰 부합 (display 숫자는 아니지만 동일 의미).

## §3.6 design-system §6.4 Backgrounds & Gradients 폐기 룰 (verbatim)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

> 31-chrome 그라데이션 2개:
> - **SideMenu 사용자 아바타** 28×28 `linear-gradient(135deg,#1d4ed8,#0ea5e9)` (line 189) — §6.4 의 "유일한 그라디언트 2종" 중 저장/CTA 시작 색 #1d4ed8 + 끝 색 #0ea5e9 **정확 매치 ✓** — **합법 그라데이션** (저장/CTA 와 동일 토큰). 유지 vs 통일 폐기 OQ #3 default 유지.
> - **SettingsPanel 프로필 아바타** 44×44 `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)` (line 677) — §6.4 매치 **X** (시작 #2563eb / 끝 #7c3aed 보라색 — 28-splash 와 동일 시작이지만 끝 색이 보라색으로 §6.4 의 cyan #0ea5e9 와 다름). 28-splash + 27-login + 14-reports + 16-workshift + 17-annual-plan default OK 폐기 정책 → `bg-accent` solid 폐기 default OQ #4.
> - 둘 다 폐기 OR 둘 다 유지 통일 vote 가능 — 사용자 결정 (OQ #3/#4 sub-vote).

## §3.7 design-system §7.1 Iconography — Lucide (verbatim)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

> 31-chrome 의 lucide-react 사용 현황:
> - **SettingsPanel**: `ChevronRight` (line 2)
> - **MenuSettingsSection**: `ChevronUp / ChevronDown / ChevronRight / Trash2` (line 4)
> - **GlobalHeader / SideMenu**: lucide **미사용** — 인라인 svg path (햄버거 line 30~32 / 뒤로가기 App.tsx line 152~154 / 설정 기어 App.tsx line 165~168 / 닫기 ✕ 콘텐츠 글리프 line 141/669)
> - **인라인 svg ↔ lucide 일관성** = OQ #5 — 헤더 햄버거/뒤로가기/설정 기어 svg path 가 lucide `Menu` / `ArrowLeft` / `Settings` 교체 시 시각 차이 + ariaLabel 보존 검토. default 인라인 유지 (30 페이지 전체 영향 비용).
> - **닫기 ✕ U+2715** = 콘텐츠 글리프 (28-splash ⋮ ⎋ 룰 + memory `feedback_tsx_wave_emoji_dot_gap` 예외 결정 룰) — Lucide `X` 교체 vs 콘텐츠 유지 OQ #5 sub.
> - **admin 테스트 푸시 버튼 이모지 ⏳ + 🔔 (line 722)** — 장식 이모지 → 제거 룰 (memory `feedback_tsx_wave_emoji_dot_gap`). OQ #6 default Lucide `Send` + `Loader2` 회전 교체.

---

# §4. 02+06 chrome 통일 룰 적용 여부

31-chrome 페이지 (= chrome 자체) 는 **chrome 정의 페이지** → `inspection-modal-chrome-rules.md` 의 chrome 룰 적용 X (룰의 source 가 본 컴포넌트들).

단 다음 3 패턴은 reference 적용:

1. **header height 48 / padding '0 12px' / borderBottom 1px solid var(--bd) / background var(--bg2)** — GlobalHeader line 13~17 의 chrome height 48 → 02/06/등 모든 페이지 chrome 룰 source. 본 wave 에서 height 48 유지 (변경 시 30 페이지 layout 모두 깨짐)
2. **back/햄버거/설정 버튼 32×32 radius 7 var(--bg3) var(--t2)** — GlobalHeader line 23~28 + App.tsx line 150 backBtn + line 162 settingsGearBtn — chrome 통일 룰 source. 변경 시 chrome 토큰 일관성 깨짐
3. **App.tsx mount 패턴 (실측)**:

```
line 7~9: import { GlobalHeader / SideMenu / SettingsPanel } from './components/...'
line 71: MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']
line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']
line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']
line 79~104: PAGE_TITLES = { '/dashboard': ..., '/inspection': '일반 점검', ... } — 22+ path
line 113: noNavPaths = isDesktop ? DESKTOP_NO_NAV_PATHS : MOBILE_NO_NAV_PATHS
line 114~118: showNav = isAuthenticated && !noNavPaths.includes(...) && !match remediation/legal/elevator-findings 상세
line 120~121: sideOpen + settingsOpen state
line 195~216: {!isDesktop && showNav && <GlobalHeader title onMenuOpen leftSlot rightSlot />}
line 218~220: {!isDesktop && showNav && <SideMenu open={sideOpen} onClose={...} unresolvedCount={...} />}
line 222~224: {isAuthenticated && <SettingsPanel open={settingsOpen} onClose={...} isDesktop={isDesktop && showNav} />}
line 227~252: {isDesktop && showNav && !DESKTOP_HEADER_HIDE_PATHS.includes(...) && <header (데스크톱 간소화 헤더, GlobalHeader 와 다른 컴포넌트)>}
line 302: {!isDesktop && showNav && <BottomNav unresolvedCount={...} />}
```

**핵심 시사점:**
- **모바일**: GlobalHeader + SideMenu 모두 `!isDesktop && showNav` 가드. `/login` `/` 등 인증 전 페이지는 둘 다 미렌더. BottomNav 도 동일 가드 — `MOBILE_NO_NAV_PATHS` 등재 페이지에서 4 chrome 모두 미렌더.
- **데스크톱**: GlobalHeader + SideMenu 모두 미렌더 (모바일 전용). SettingsPanel 은 데스크톱에서도 isDesktop prop 분기로 mount. DesktopSidebar 가 햄버거 메뉴 역할 대체 (App.tsx line 182, src/components/DesktopSidebar.tsx — **본 wave scope 밖**).
- **SettingsPanel** 은 isAuthenticated 만 가드 — 모바일/데스크톱 양쪽 mount, isDesktop prop 분기 (line 653 `top: isDesktop ? 0 : 'var(--sat, 0px)'`).
- **chrome 변경 = 30 페이지 전체 영향** — GlobalHeader/SideMenu 의 height/색/타이포 변경 시 모든 인증 후 모바일 페이지에서 변화. SettingsPanel 변경 시 모바일+데스크톱 모두 영향. **변경 폭주 위험 매우 높음** — 본 wave 의 핵심 negative rule.

본 wave + W2~W6 모두 `App.tsx` + `DesktopSidebar.tsx` + `BottomNav.tsx` 손대지 않음 (§6 negative rule).

---

# §5. 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건. 28-splash 의 10 표준 + 31-chrome 특화 2 (`feedback_cbc7119_design_never_wrangler` 강도 최대 + `feedback_gsd_workflow_strict`). 각 룰 = 슬러그 + 요약 + Why + How (31-chrome 컨텍스트) 4 항목.

**룰 1 — `feedback_design_sketch_first`**
- 요약: spacing/sizing 도 sketch HTML 시안 먼저, 사용자 컨펌 후 인라인 적용
- Why: 변경 시 30 페이지 전체에 즉시 영향 — 사용자 시각 검증 필수
- How (31-chrome): header height 48 / 햄버거 32×32 / panel width 300+320 / 프로필 아바타 44×44 / 6 collapse state / push prefs 6 sub 카피 / 데이터베이스 admin 4 버튼 height 40 / 로그아웃 버튼 rgba(220,38,38,0.12) — 변경 시 sketch 먼저

**룰 2 — `feedback_redesign_sketch_rule_enforcement`**
- 요약: status 색 = 의미 fix. 위험 임계치 아닌 카드는 status 색 금지
- Why: §6.2 negative rule — 카테고리는 아이콘 모양으로 구분, 색은 진척률 기반만
- How (31-chrome): SideMenu badge danger (unresolvedCount > 0) / SettingsPanel PermBadge denied danger / 로그아웃 #dc2626 모두 의미 사용. 임의 미적 색 금지

**룰 3 — `feedback_sketch_realistic_data`**
- 요약: 표시 분기/라벨 룰(없음/N개/X-Y/완료)은 코드 그대로. 시안에서 손볼 건 시각 디자인뿐
- Why: 카피 verbatim 변경 시 i18n + 사용자 학습 깨짐
- How (31-chrome): 카피 verbatim 17 메뉴 라벨 / 5 섹션 라벨 / "차바이오컴플렉스" / "소방안전 통합관리" / "설정" / "알림" / "메뉴 설정" / "화면" / "계정" / "데이터베이스" / "앱 정보" / 6 push prefs 12 카피 / "개인정보 수정" sub "연락처, 이메일, 생년월일" / "비밀번호 변경" / "캐시 초기화" sub "최신 리소스로 새로고침" / "차바이오컴플렉스 방재" sub "경기도 성남시 분당구 판교로 335" / "로그아웃" / "+ 구분선 추가" / "기본 배치로 되돌릴까요?" / "취소" / "초기화" / "기본값으로 초기화" / "설정 저장" / "저장 중…" / "삭제할까요?" / "삭제" / 토스트 카피 "비밀번호가 변경되었습니다" "개인정보가 수정되었습니다" "푸시 알림이 활성화되었습니다." "테스트 푸시 발송: N/M 성공" "캐시 초기화에 실패했습니다" "백업 파일이 다운로드되었습니다" "복원 완료 (N개 실행, M개 오류)" "R2 백업 완료" "R2 복원 완료 (N개 파일)" "이름이 변경되었습니다" "메뉴 설정이 저장되었습니다" 변경 금지

**룰 4 — `feedback_planner_prompt_sketch_verbatim`**
- 요약: planner 프롬프트 sketch CSS verbatim 인용 필수
- Why: 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례)
- How (31-chrome): W6 진입 시 sketch CSS 정의 grep + verbatim 인용 — 특히 SideMenu 아바타 그라데이션 / SettingsPanel 프로필 그라데이션 / 로그아웃 rgba(220,38,38,0.12) / panel transform translateX / cubic-bezier(.4,0,.2,1) / `@keyframes` 없음 (transition 만 사용)

**룰 5 — `feedback_tailwind_token_class_pattern`**
- 요약: tailwind 토큰 class 패턴 — status- prefix 없음 + Lucide size prop
- Why: 11-div TSX v3 hotfix(4ce707e) 사고 — `text-status-fire-bar` X / `text-fire-bar` O
- How (31-chrome): `bg-danger` O / `bg-status-danger` X — status- prefix 없음. 로그아웃 버튼 rgba(220,38,38,0.12) → `bg-danger/12` or 인라인 / SideMenu badge danger → `bg-danger`. Lucide `<ChevronRight size={14} />` prop 패턴 — `w-3.5 h-3.5` className 금지

**룰 6 — `feedback_tailwind_w8_h8_is_48px`** (★ 31-chrome 핵심 함정)
- 요약: tailwind.config spacing override 로 w-8 = 48 (기본 32 아님), w-7 = 32
- Why: 11-div 백버튼 1.5배 사고(54a1c8d) — w-8 사용 시 32×32 가 48×48 1.5배 확대 사고
- How (31-chrome): header 햄버거 32×32 / SideMenu 닫기 28×28 / 사용자 카드 아바타 28×28 / 설정 panel 닫기 28×28 / SettingsPanel 프로필 44×44 / MenuSettingsSection ArrowButton 32×32 / Toggle 38×21 / ToggleSmall 38×21 / Trash2 컨테이너 32×32 — w-8 사용 시 48×48 1.5배 사고 위험. `w-7 h-7` = 32 / `w-[28px] h-[28px]` 인라인 / `w-11 h-11` = 44

**룰 7 — `feedback_text_caption_leading_none`**
- 요약: 작은 컨테이너 안 text-caption → leading-none 명시
- Why: text-caption lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩
- How (31-chrome): SectionHeader fontSize 9 / divider fontSize 9 / soon 배지 fontSize 10 / 사용자 카드 fontSize 11.5 / 직책+shift fontSize 9.5 / displayTitle fontSize 10 / push prefs sub 10 / 데이터베이스 caption 10 / reset confirm 10 / 숨김 표시 9 / cache 'v__APP_VERSION__ (__BUILD_TIME__)' 9~10 — 작은 컨테이너 안 `text-caption leading-none` 명시 + §1.1 위반은 일괄 12 격상 룰

**룰 8 — `feedback_tsx_wave_emoji_dot_gap`** (★ 31-chrome 특화)
- 요약: TSX 변환 wave — sketch 의 이모지 제거/dot 추가 룰 강제 점검
- Why: alias sed-replace 만 하지 말고 sketch negative gate (이모지 0) + dot span 추가 markup 도 verify
- How (31-chrome): admin 테스트 푸시 이모지 ⏳ 🔔 (line 722) **제거** 룰. ✕ 닫기 글리프 (SideMenu line 141 / SettingsPanel line 669) 는 콘텐츠 글리프 — Lucide X 교체 vs 유지 OQ #5. dot span 추가 markup 도 sketch 시 명시 — 인라인 svg → Lucide 교체 시 ariaLabel 보존 + size prop 룰

**룰 9 — `feedback_tsx_wave_stat_card_drift`**
- 요약: TSX 변환 Stat Card §6.3 룰 누락 사고 — source outline 패턴 보존, sketch 새 패턴 누락 가능
- Why: executor 가 12-staff-service 의 Stat Card 룰 누락 사고 (feedback_tsx_wave_stat_card_drift)
- How (31-chrome): chrome 에 Stat Card 없음 → §3.5 "미적용" 명시. 단 sketch 새 패턴 (예: SideMenu badge danger 11pt JetBrains Mono / SettingsPanel PermBadge `${color}22` alpha bg / 로그아웃 rgba(220,38,38,0.12)) 은 verbatim 인용 필수 — source 의 인라인 hex/그라데이션이 sketch 의 새 토큰 패턴 덮어쓰지 않도록 명시

**룰 10 — `feedback_avoid_premature_confirmation`**
- 요약: 변경 후 "approved 주세요" 자제 — 시각 작업에서 "거의 일치" 같은 자신감 표현 금지
- Why: 결과 보여주고 사용자 판단
- How (31-chrome): 본 인덱스 완료 후 "§7 OQ N건 컨펌 부탁" 보고만. "wave 1 완벽" 자신감 표현 금지. 30 페이지 전체에 영향 = 변경 폭주 위험 매우 높음 → 사용자 컨펌 강도 최대

**룰 11 — `feedback_cbc7119_design_never_wrangler`** (★ 31-chrome 강도 최대)
- 요약: 디자인 작업은 wrangler 명령 자체 금지
- Why: 디자인 wave 중 wrangler --project-name=cbc7119 절대 X. main push 자동 cbc7119-preview 만
- How (31-chrome): 본 wave 는 markdown + cp 8 파일만. wrangler --project-name=cbc7119 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 만

**룰 12 — `feedback_gsd_workflow_strict`** (★ 31-chrome 강도 최대)
- 요약: 다음 작업부터 GSD 워크플로 강제 — redesign sketch/TSX 변환은 /gsd:quick 또는 /gsd:ui-phase 시작 필수
- Why: ad-hoc PLAN/SUMMARY 직접 작성 금지. 컨텍스트 낭비 + 메모리 룰 위반 사고 방지
- How (31-chrome): ad-hoc PLAN/SUMMARY 직접 작성 금지. /gsd:quick 으로 진입 + planner subagent 호출 + executor 또는 메인 Claude 실행 + summary 자동 생성 패턴 강제. 본 PLAN 자체가 그 패턴의 산출

**(추가 31-chrome 특화 메타 — 본 §5 뒤 추가 박스):**

★ **공통 chrome 변경의 폭주 영향** — GlobalHeader/SideMenu/SettingsPanel 변경 시 **30 페이지 전체에 즉시 영향**. 다른 redesign sequence (01~30) 의 페이지별 W7 TSX 변환과 충돌 가능성. 본 31-chrome W7 TSX 머지 직후 사용자가 다른 페이지에서 시각 회귀 신고 가능성 — main push 전 사용자에게 명시 컨펌 + main 머지는 사용자 OK 받은 후에만 (memory `feedback_deploy_test` + `feedback_design_changes_ask_first`)

★ **Circular import 의식** — MenuSettingsSection.tsx line 11 `import { MENU } from './SideMenu'` + SideMenu 가 MenuSettingsSection 을 import 하지는 않지만 SettingsPanel 이 MenuSettingsSection 을 import (line 48). SideMenu 의 MENU 상수 변경 시 MenuSettingsSection 의 PATH_LABEL / DESKTOP_ONLY_PATHS / ADMIN_PATHS 재계산 — 둘 다 같은 queryKey 'menu-config' 사용 (양쪽 useQuery line 63 / line 54). MENU 변경 시 빌드 안 깨지지만 의미 깨짐 — `feedback_check_branch_before_edit` 룰과 align

---

# §6. negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물 = wave-1-index.md 1 + 7 source 스냅샷.
- **src/components/{GlobalHeader,SideMenu,SettingsPanel,MenuSettingsSection}.tsx 4 파일 모두 코드 수정 0 (1 byte 변경 금지)** — `git diff --name-only HEAD -- cha-bio-safety/src/components/{GlobalHeader,SideMenu,SettingsPanel,MenuSettingsSection}.tsx` 결과 0 줄.
- **App.tsx 수정 0 (1 byte 변경 금지)** — GlobalHeader/SideMenu/SettingsPanel mount + MOBILE_NO_NAV_PATHS + DESKTOP_NO_NAV_PATHS + DESKTOP_HEADER_HIDE_PATHS + PAGE_TITLES + 데스크톱 간소화 헤더 + BottomNav 모두 실측 박제, 변경 0.
- **00-design-context/ (design-system.md + tokens.css + typography.css + inspection-modal-chrome-rules.md + page-spec.md + tailwind.config.js + samples/ + cha-bio-design-system/) 수정 0** — 본 wave 는 스냅샷만, 권위 토큰 변경 0.
- **tailwind.config.js 수정 0** — w-8 = 48 등 spacing override 가 본 wave 에서 변경되면 30 페이지 전체 사이즈 깨짐. 본 wave 는 reference 만.
- **MENU 상수 변경 금지** — SideMenu.tsx line 19~54 의 5 섹션 17 아이템. MenuSettingsSection 의 PATH_LABEL / DESKTOP_ONLY_PATHS / ADMIN_PATHS 가 본 상수를 source 로 함. 변경 시 MenuSettingsSection 의 도시 화면 + 메뉴 visible 토글 + 메뉴 순서 / DEFAULT_SIDE_MENU 동기화 깨짐.
- **DEFAULT_SIDE_MENU 변경 금지** — `utils/api.ts` 의 백업 fallback. MenuSettingsSection.tsx line 78/147 에서 fallback 으로 사용. 변경 시 첫 로딩 + Reset 동작 깨짐.
- **JSZip 백업/복원 비즈 로직 변경 금지** — SettingsPanel line 502~620. 사용자 데이터 안전 직결. zip 생성 / R2 multipart upload / cron 백업 zip 다운로드 / delta keys 계산 / fetch backup-status 모두 보존.
- **6 push prefs key 변경 금지** — daily_schedule / incomplete_schedule / unresolved_issue / event_15min / event_5min / education_reminder. 백엔드 cron worker (`cbc-cron-worker` 별도 프로젝트) 와 key 매칭 — 변경 시 푸시 발송 중단.
- **__APP_VERSION__ + __BUILD_TIME__ Vite define 보존** — SettingsPanel line 864 의 verbatim 참조. vite.config.ts define 파라미터 연결.
- **chrome height 48 + 햄버거 32×32 + panel width 82%/88% maxWidth 300/320 + 프로필 아바타 44×44 + 로그아웃 height 40 등 chrome dimension 변경 시 30 페이지 layout 모두 깨짐** — 본 wave 모두 실측 박제 후 W2~ sketch 에서 변경 sketch 컨펌 필수.
- **circular import (MenuSettingsSection ↔ SideMenu MENU) 깨뜨림 금지** — MENU 가 SideMenu.tsx 에 정의 + MenuSettingsSection.tsx 에서 import. MENU 를 별도 파일로 추출 시 SideMenu + MenuSettingsSection 둘 다 변경 필요 — 본 wave scope 밖.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler`. `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰. main push → GitHub Actions 자동 cbc7119-preview 배포만.
- **★ 공통 chrome 폭주 영향** — chrome 변경은 30 페이지 전체에 즉시 영향. W7 TSX 머지 후 사용자가 다른 페이지에서 회귀 신고 가능성 — main push 전 사용자 명시 컨펌. 본 wave 의 §7 OQ 답변 받기 전 W2 진입 금지.
- **다른 페이지 (01~30) 영향 금지** — `git status` 에 `cha-bio-safety/docs/redesign-context/31-chrome/` 외 변경 0.
- **`30-not-found` 와 다른 폴더 구조 도입 금지** — 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 31-chrome 도 동일 평면 배치 (`31-chrome/sketch-wave-N-{slug}.html` W2~ 부터).

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 8건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call). 단, "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

- **OQ #1**: chrome 의 다크/라이트 양쪽 지원 — 현재 default 다크 (tokens.css 의 `--bg2` / `--t1` / `--t3` 등 다크 hex). 4 컴포넌트 라이트 토큰 분기 도입 vs 다크 단일 유지?
  - **default 답: 다크 단일 유지** — 본 시스템은 4명 내부 팀 전용 PWA, 사용자 모두 다크 사용 중. 라이트 분기 도입 시 30 페이지 전체 검증 비용 폭주. 향후 라이트 요청 시 별도 phase. **★ LOCKED placeholder — 사용자 답변 필요**

- **OQ #2**: SettingsPanel SectionHeader fontSize 9 + displayTitle 10 + push prefs sub 10 + 데이터베이스 caption 10 + reset confirm 10 + 숨김 표시 9 + 사용자 직책+shift 9.5 + SideMenu divider 9 + 부제 9.5 등 §1.1 9·10·11 위반 다수 — 일괄 12 격상 vs 부분 절충?
  - **default 답: 부분 절충** — SectionHeader 9 (uppercase letterSpacing 0.08em) → 12 격상 시 panel 세로 길이 증가 (6 섹션 × ~3px → 18px) 감수. push prefs sub 10 → 12 격상 OK (sub 명확성 향상). displayTitle 10 → 12. reset confirm 10 → 12. 숨김 표시 9 → 10 또는 12 (sketch 결정). SideMenu divider 9 → 11 (uppercase 유지). **단 panel 세로 overflow 발생 시 dense layout 회귀 sub-OQ 가능** — sketch wave 별로 결정. **★ LOCKED placeholder — 사용자 답변 필요**

- **OQ #3**: SideMenu 사용자 카드 아바타 그라데이션 `linear-gradient(135deg,#1d4ed8,#0ea5e9)` (line 189) — design-system §6.4 의 "유일한 그라디언트 2종" 중 저장/CTA 시작+끝 색 모두 매치 ✓. 유지 vs `bg-accent` solid 폐기?
  - **default 답: 유지** — §6.4 매치하는 합법 그라데이션. 28-splash + 27-login 의 OQ #1 default 폐기 답과 다른 결정 (이 그라데이션은 §6.4 의 cyan #0ea5e9 끝 색까지 정확 매치). 단 W3 sketch 결과 본 후 사용자 결정. **★ LOCKED placeholder — 사용자 답변 필요**

- **OQ #4**: SettingsPanel 프로필 아바타 그라데이션 `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)` (line 677) — §6.4 매치 X (끝 색 #7c3aed 보라색). 폐기 vs 유지?
  - **default 답: 폐기 → `bg-accent` solid** — §6.4 매치 X, 28-splash + 27-login + 14-reports 등 일관 폐기 정책. 단 SideMenu 아바타 그라데이션 (OQ #3) 와 시각 일관성 검토 — 둘 다 폐기 또는 둘 다 유지 통일 vote 가능. **★ LOCKED placeholder — 사용자 답변 필요**

- **OQ #5**: 인라인 svg ↔ Lucide 일관성 — GlobalHeader 햄버거 (path "M4 6h16M4 12h16M4 18h16" line 31) / App.tsx backBtn (path "M15 19l-7-7 7-7" line 153) / App.tsx settingsGearBtn (settings cog path line 166) / 닫기 ✕ U+2715 (SideMenu line 141 / SettingsPanel line 669) — Lucide `Menu / ArrowLeft / Settings / X` 교체 vs 인라인 유지?
  - **default 답: 인라인 svg 유지** — Lucide 교체 시 시각 차이 + ariaLabel 보존 + size prop 매핑 비용. 30 페이지 전체에 영향. 단 lucide 사용 부분 (SettingsPanel ChevronRight + MenuSettingsSection ChevronUp/Down/Right/Trash2) 는 lucide 유지. 양식 통일 = OQ 후속. **★ LOCKED placeholder — 사용자 답변 필요**

- **OQ #6**: admin 테스트 푸시 버튼 이모지 ⏳ 🔔 (SettingsPanel line 722) — 제거 vs 유지?
  - **default 답: 제거 (Lucide 교체 또는 텍스트만)** — memory `feedback_tsx_wave_emoji_dot_gap` 룰 + design-system §7.1 "이모지 사용 금지". `Send` lucide + "테스트 푸시 보내기" 텍스트 / `Loader2` 회전 + "전송 중..." 패턴. admin 전용 기능이라 정보 인지 우선. **★ LOCKED placeholder — 사용자 답변 필요**

- **OQ #7**: SideMenu panel width 82% maxWidth 300 + SettingsPanel panel width 88% maxWidth 320 — 보존 vs 정합?
  - **default 답: 보존** — 현재 panel 높이/폭은 사용자 학습됨. 정합 변경 시 시각 회귀. 단 sketch 결과 본 후 결정. **★ LOCKED placeholder — 사용자 답변 필요**

- **OQ #8**: chrome 4 컴포넌트 W7 TSX 변환을 atomic 단일 변환 vs sub-wave 4 분할?
  - **default 답: sub-wave 4 분할** — 1558 라인 atomic 변환은 컨텍스트 50% 초과 위험. W6 checklist 작성 시 결정. 28-splash 의 2-file 320 라인 atomic 패턴 (4i9 기준) 보다 5배 큼. **★ LOCKED placeholder — 사용자 답변 필요**

## 자체 verify gate (작성 완료 후 본 인덱스가 통과해야 할 gate)

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. 7 헤더 존재 | `grep -c '^# §[1-7]' wave-1-index.md` | =7 |
| 2. sub-wave 분배 표 ≥4 | `grep -E '^\| W[2-6] \|' wave-1-index.md \| wc -l` | ≥4 |
| 3. 메모리 룰 unique ≥10 | `grep -oE 'feedback_[a-z_]+' wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 4. negative §6 안 wrangler+npm run deploy | `grep -c 'wrangler' wave-1-index.md` ≥1 & `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 |
| 5. src/components 4 파일 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src/components/{GlobalHeader,SideMenu,SettingsPanel,MenuSettingsSection}.tsx` | 0 lines |
| 6. App.tsx 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src/App.tsx` | 0 lines |
| 7. 00-design-context/ 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/docs/redesign-context/00-design-context/` | 0 lines |
| 8. tailwind.config.js 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/tailwind.config.js` | 0 lines |
| 9. OQ §7 ≥5 | `grep -cE 'OQ #[1-8]' wave-1-index.md` | ≥5 |
| 10. design-system fence ≥6 | `grep -c '^```' wave-1-index.md` | ≥6 |
| 11. 비즈 anchor ≥30 식별자 | §1.3 박스 안 식별자 카운트 | ≥30 |
| 12. 8 파일 산출 | `ls cha-bio-safety/docs/redesign-context/31-chrome/ \| wc -l` | =8 |
| 13. 스냅샷 7 byte-identical | `diff -q` × 7 | 모두 identical |

모두 PASS 시 본 인덱스가 W2 진입의 단일 진입점으로 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 8건 답변으로 받는다.

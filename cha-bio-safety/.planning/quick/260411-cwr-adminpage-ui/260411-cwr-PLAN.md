---
quick_task: 260411-cwr-adminpage-ui
type: execute
autonomous: true
files_modified:
  - src/pages/StaffManagePage.tsx
  - src/pages/CheckpointsPage.tsx
  - src/pages/AdminPage.tsx
  - src/App.tsx
  - src/components/DesktopSidebar.tsx
  - src/components/SideMenu.tsx
  - src/utils/api.ts
---

<objective>
AdminPage.tsx(820 lines)를 StaffManagePage + CheckpointsPage 독립 페이지로 분리하고, 각 페이지에 데스크톱 테이블 레이아웃을 추가한다. 메뉴설정 탭(MenuSettingsTab)은 SettingsPanel에 이미 존재하므로 삭제. AdminPage는 /dashboard로 리다이렉트.

Purpose: 820줄 모놀리스를 2개 독립 페이지로 분할하여 유지보수성 향상 + 데스크톱 UI 지원
Output: StaffManagePage.tsx, CheckpointsPage.tsx, 라우팅/네비게이션 업데이트
</objective>

<execution_context>
@src/pages/AdminPage.tsx
@src/App.tsx
@src/components/DesktopSidebar.tsx
@src/components/SideMenu.tsx
@src/utils/api.ts
@src/types/index.ts
@src/hooks/useIsDesktop.ts
</execution_context>

<tasks>

<task type="auto">
  <name>Task 1: StaffManagePage.tsx + CheckpointsPage.tsx 생성</name>
  <files>src/pages/StaffManagePage.tsx, src/pages/CheckpointsPage.tsx</files>
  <action>
**StaffManagePage.tsx** 생성 - AdminPage.tsx에서 추출 + 데스크톱 레이아웃 추가:

1. AdminPage.tsx에서 가져올 것들:
   - `StaffFormState`, `EMPTY_STAFF_FORM` 인터페이스/상수 (line 100-106)
   - `StaffModal` 함수 (lines 108-268) — BottomSheet 래퍼 포함
   - `StaffCard` 함수 (lines 552-580)
   - `StaffTabContent` 로직 (lines 505-550)
   - `BottomSheet` 공통 컴포넌트 (lines 78-97)
   - SVG 아이콘: `IconChevronLeft`, `IconUserPlus`, `IconLock` (현 AdminPage 인라인)
   - 공통 스타일: `INPUT_STYLE`, `LABEL_STYLE`, `SKELETON_STYLE`

2. import 구성:
   - `useState, useEffect, useMemo` from react
   - `useNavigate` from react-router-dom
   - `useQuery, useMutation, useQueryClient` from @tanstack/react-query
   - `toast` from react-hot-toast
   - `useAuthStore` from '../stores/authStore'
   - `staffApi` from '../utils/api'
   - `useIsDesktop` from '../hooks/useIsDesktop'
   - types: `StaffFull, StaffUpdatePayload, Role` from '../types'

3. 데스크톱 레이아웃 (useIsDesktop() === true):
   - 상단: 페이지 제목 "직원 관리" + 우측 "직원 추가" 버튼 (acl 배경, 흰색 텍스트)
   - 테이블 뷰: `<table>` 스타일 (width: 100%, border-collapse 아닌 separate, border-spacing: 0)
   - 헤더 행: 이름 | 사번 | 직책 | 역할 | 연락처 | 이메일 | 상태 | 액션
   - 각 행: 해당 정보 + 역할은 admin/assistant 배지 + 상태는 활성/비활성 도트 + 수정 버튼
   - 비활성 직원은 행 opacity 0.5
   - 모달은 기존 BottomSheet 재사용 (데스크톱에서도 동일하게 동작)

4. 모바일 레이아웃 (useIsDesktop() === false):
   - 기존 AdminPage의 StaffTabContent 그대로 (카드 리스트 + FAB)
   - BottomSheet 모달 그대로

5. Role Guard: useEffect에서 staff?.role !== 'admin' 이면 /dashboard로 리다이렉트 (기존 패턴)

6. export default function StaffManagePage()

**CheckpointsPage.tsx** 생성 - AdminPage.tsx에서 추출 + 데스크톱 레이아웃 추가:

1. AdminPage.tsx에서 가져올 것들:
   - `CATEGORIES` 상수 (line 54-58)
   - `ZONE_LABEL` 상수 (line 59-61) — common은 '지하'로 변경 (사용자 요구)
   - `CpFormState`, `EMPTY_CP_FORM` (lines 271-277)
   - `CheckPointModal` 함수 (lines 279-405)
   - `CheckPointCard` 함수 (lines 682-707)
   - `CheckPointTabContent` 로직 (lines 583-680)
   - `BottomSheet`, SVG 아이콘, 공통 스타일 동일하게 복사

2. import 구성: StaffManagePage와 유사하되 `checkPointApi` 사용, types에서 `CheckPointFull, CheckPointUpdatePayload, BuildingZone` import

3. 데스크톱 레이아웃:
   - 상단: 페이지 제목 "개소 관리" + 우측 "개소 추가" 버튼
   - 카테고리 필터: 수평 칩 형태 (flex-wrap), 선택된 카테고리는 acl 배경
   - 리스트/테이블: 개소명 | 카테고리 | 구역 | 층 | 위치번호 | 상태 | 액션
   - ZONE_LABEL에서 common → '지하'
   - 모달은 기존 BottomSheet 재사용

4. 모바일 레이아웃: 기존 CheckPointTabContent 그대로

5. Role Guard 동일

6. export default function CheckpointsPage()

**공통 BottomSheet 컴포넌트:** 두 페이지 모두에서 사용하므로 각 파일에 내부 함수로 복사한다 (추후 별도 파일 추출은 scope 외). INPUT_STYLE, LABEL_STYLE, SKELETON_STYLE도 각 파일에 복사.

**주의:** lucide-react 아이콘을 사용하지 말 것. AdminPage의 인라인 SVG 아이콘 패턴을 그대로 따른다 (IconUserPlus, IconPlus, IconChevronLeft, IconChevronDown, IconLock).
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit --pretty 2>&1 | head -30</automated>
  </verify>
  <done>StaffManagePage.tsx와 CheckpointsPage.tsx가 컴파일 에러 없이 존재하며, 각각 모바일(카드)/데스크톱(테이블) 레이아웃을 포함한다</done>
</task>

<task type="auto">
  <name>Task 2: 라우팅 및 네비게이션 업데이트</name>
  <files>src/App.tsx, src/components/DesktopSidebar.tsx, src/components/SideMenu.tsx, src/utils/api.ts, src/pages/AdminPage.tsx</files>
  <action>
**App.tsx 수정:**

1. lazy import 추가 (line 34 AdminPage 근처에):
   ```
   const StaffManagePage = lazy(() => import('./pages/StaffManagePage'))
   const CheckpointsPage = lazy(() => import('./pages/CheckpointsPage'))
   ```

2. PAGE_TITLES (line 69) 에 추가:
   ```
   '/staff-manage': '직원 관리',
   '/checkpoints': '개소 관리',
   ```
   - '/admin' 항목은 삭제

3. MOBILE_NO_NAV_PATHS (line 64): '/admin' 제거. '/staff-manage'와 '/checkpoints'는 GlobalHeader를 사용하므로 추가하지 않음 (PAGE_TITLES에 있으면 자동으로 타이틀 표시)

4. Routes 섹션 (line 229 부근):
   - `/admin` Route를 `<Navigate to="/dashboard" replace />`로 변경 (이전 북마크 대응)
   - 새 Route 추가:
     ```
     <Route path="/staff-manage" element={<Auth><StaffManagePage /></Auth>} />
     <Route path="/checkpoints" element={<Auth><CheckpointsPage /></Auth>} />
     ```

**DesktopSidebar.tsx 수정:**

DESKTOP_SECTIONS (line 8-13) 수정:
```typescript
const DESKTOP_SECTIONS = [
  { label: '점검 현황', paths: ['/dashboard', '/inspection', '/remediation', '/floorplan'] },
  { label: '시설 관리', paths: ['/div', '/legal', '/elevator', '/checkpoints', '/inspection/qr'] },
  { label: '문서 관리', paths: ['/documents', '/worklog', '/daily-report', '/schedule', '/workshift', '/annual-plan', '/reports', '/qr-print'] },
  { label: '직원 관리', paths: ['/staff-manage', '/staff-service', '/education'] },
]
```
- `/admin` 제거
- `/checkpoints`를 시설 관리에 추가
- `/staff-manage`를 직원 관리 섹션에 추가

**SideMenu.tsx 수정:**

MENU 상수 (line 19-49) 수정:
- '시설 관리' 섹션에 추가: `{ label: '개소 관리', path: '/checkpoints', badge: 0, soon: false, role: 'admin' }`
- '시스템' 섹션을 삭제하고, 대신 '직원 관리' 항목을 '근무/복지' 섹션 이름을 '근무/복지/직원'으로 변경하거나, 별도로:
  - 새 섹션 추가하지 말고, '근무/복지' items에: `{ label: '직원 관리', path: '/staff-manage', badge: 0, soon: false, role: 'admin' }` 추가
  - '시스템' 섹션의 '관리자 설정' `/admin` 항목 제거 (더 이상 해당 페이지 없음)
  - '시스템' 섹션이 빈 items가 되면 섹션 자체를 삭제

**api.ts 수정:**

DEFAULT_SIDE_MENU (line 313-338) 수정:
- `/admin` 항목 제거
- 'd-system' divider 제거 (빈 섹션)
- 'd-facility' 섹션에 `{ type: 'item', path: '/checkpoints', visible: true }` 추가 (/legal 다음)
- 'd-welfare' 섹션에 `{ type: 'item', path: '/staff-manage', visible: true }` 추가 (/education 다음)

**AdminPage.tsx 수정:**

기존 820줄을 간단한 리다이렉트로 교체:
```typescript
import { Navigate } from 'react-router-dom'
export default function AdminPage() {
  return <Navigate to="/dashboard" replace />
}
```
이렇게 하면 이전에 /admin을 북마크한 사용자도 대시보드로 이동. 파일 자체를 삭제하지 않는 이유: App.tsx에서 lazy import가 이미 존재하므로, 깔끔하게 리다이렉트 처리.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit --pretty 2>&1 | head -30 && npm run build 2>&1 | tail -10</automated>
  </verify>
  <done>
- /staff-manage 경로가 StaffManagePage를 렌더링
- /checkpoints 경로가 CheckpointsPage를 렌더링
- /admin은 /dashboard로 리다이렉트
- 데스크톱 사이드바에 직원관리/개소관리 메뉴 노출
- 모바일 햄버거 메뉴에 직원관리/개소관리 항목 노출 (admin 전용)
- 빌드 성공
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` 통과
2. `npm run build` 성공
3. /staff-manage 접속 시 직원 목록 표시 (admin)
4. /checkpoints 접속 시 개소 목록 표시 (admin)
5. /admin 접속 시 /dashboard로 리다이렉트
6. 데스크톱 사이드바에서 직원관리/개소관리 메뉴 클릭 가능
</verification>

<success_criteria>
- AdminPage.tsx가 5줄 이하의 리다이렉트 파일로 축소
- StaffManagePage.tsx가 독립 동작하며 모바일/데스크톱 반응형
- CheckpointsPage.tsx가 독립 동작하며 모바일/데스크톱 반응형
- 모든 라우팅/네비게이션이 새 경로를 반영
- 빌드 에러 없음
</success_criteria>

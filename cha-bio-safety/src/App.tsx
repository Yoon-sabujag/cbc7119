import { Suspense, lazy, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import { BottomNav } from './components/BottomNav'
import { GlobalHeader } from './components/GlobalHeader'
import { SideMenu } from './components/SideMenu'
import { SettingsPanel } from './components/SettingsPanel'
import { DesktopSidebar } from './components/DesktopSidebar'
import { useDateTime } from './hooks/useDateTime'
import { useIsDesktop } from './hooks/useIsDesktop'
import { dashboardApi } from './utils/api'
// Safe area 초기화는 index.html 인라인 스크립트에서 처리 (React 마운트 전 실행)

const SplashScreen   = lazy(() => import('./pages/SplashScreen'))
const LoginPage      = lazy(() => import('./pages/LoginPage'))
const DashboardPage  = lazy(() => import('./pages/DashboardPage'))
const InspectionPage = lazy(() => import('./pages/InspectionPage'))
const QRScanPage     = lazy(() => import('./pages/QRScanPage'))
const ElevatorPage   = lazy(() => import('./pages/ElevatorPage'))
const NotFoundPage   = lazy(() => import('./pages/NotFoundPage'))
const RemediationPage = lazy(() => import('./pages/RemediationPage'))
const RemediationDetailPage = lazy(() => import('./pages/RemediationDetailPage'))
const SchedulePage   = lazy(() => import('./pages/SchedulePage'))
const ReportsPage    = lazy(() => import('./pages/ReportsPage'))
const DailyReportPage = lazy(() => import('./pages/DailyReportPage'))
const WorkShiftPage  = lazy(() => import('./pages/WorkShiftPage'))
const LeavePage      = lazy(() => import('./pages/LeavePage'))
const FloorPlanPage           = lazy(() => import('./pages/FloorPlanPage'))
const DivPage                 = lazy(() => import('./pages/DivPage'))
const QRPrintPage             = lazy(() => import('./pages/QRPrintPage'))
const ExtinguisherPublicPage  = lazy(() => import('./pages/ExtinguisherPublicPage'))
const AdminPage               = lazy(() => import('./pages/AdminPage'))
const MealPage                = lazy(() => import('./pages/MealPage'))
const EducationPage           = lazy(() => import('./pages/EducationPage'))
const StaffServicePage        = lazy(() => import('./pages/StaffServicePage'))
const LegalPage               = lazy(() => import('./pages/LegalPage'))
const LegalFindingsPage       = lazy(() => import('./pages/LegalFindingsPage'))
const LegalFindingDetailPage  = lazy(() => import('./pages/LegalFindingDetailPage'))
const ElevatorFindingDetailPage = lazy(() => import('./pages/ElevatorFindingDetailPage'))
const AnnualPlanPage            = lazy(() => import('./pages/AnnualPlanPage'))

const qc = new QueryClient({
  defaultOptions:{ queries:{ staleTime:30_000, retry:(n,e:any)=>n<2&&e?.status!==401 } }
})

function Auth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}
function Loader() {
  return (
    <div style={{ flex:1, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:28, height:28, border:'2px solid var(--bd2)', borderTopColor:'var(--acl)', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}

// 모바일: 자체 헤더가 있는 페이지는 nav 숨김
const MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/meal', '/education', '/admin', '/legal', '/elevator/findings', '/annual-plan']

// 데스크톱: 로그인/스플래시만 nav 숨김 — 나머지는 모두 사이드바 표시
const DESKTOP_NO_NAV_PATHS = ['/', '/login']

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '대시보드',
  '/inspection': '일반 점검',
  '/inspection/qr': 'QR 스캔',
  '/remediation': '조치 관리',
  '/elevator': '승강기 관리',
  '/staff-service': '연차 및 식사',
  '/schedule': '월간 점검 계획',
  '/reports': '점검 일지 출력',
  '/daily-report': '일일업무일지',
  '/workshift': '근무표',
  '/leave': '연차 관리',
  '/floorplan': '건물 도면',
  '/div': 'DIV 압력 관리',
  '/qr-print': 'QR 코드 출력',
  '/meal': '식사 관리',
  '/education': '보수교육',
  '/admin': '관리자 설정',
  '/legal': '소방 점검 관리',
  '/annual-plan': '연간 업무 추진 계획',
}

function Layout() {
  const isDesktop = useIsDesktop()
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  const noNavPaths = isDesktop ? DESKTOP_NO_NAV_PATHS : MOBILE_NO_NAV_PATHS
  const showNav = isAuthenticated
    && !noNavPaths.includes(location.pathname)
    && !location.pathname.match(/^\/remediation\/.+/)
    && !location.pathname.match(/^\/legal\/.+/)
    && !location.pathname.match(/^\/elevator\/findings\/.+/)

  const [sideOpen, setSideOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { data: dashData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
    staleTime: 30_000,
    refetchInterval: 30_000,
    enabled: isAuthenticated,
  })
  const unresolvedCount = dashData?.stats?.unresolved ?? 0
  const datetime = useDateTime()
  const dateOnly = datetime.split('  ')[0] // "4.1(화)" 부분만
  const pageTitle = PAGE_TITLES[location.pathname] || ''
  const isDashboard = location.pathname === '/dashboard'

  // 모바일 전용: 대시보드 헤더 우측 슬롯
  const dashboardRightSlot = (
    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', whiteSpace: 'nowrap' }}>차바이오컴플렉스 방재팀</span>
  )

  // 모바일 전용: 설정 톱니바퀴 버튼
  const settingsGearBtn = (
    <button
      onClick={() => setSettingsOpen(true)}
      aria-label="설정"
      style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--bg3)', border: 'none', color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>
  )

  return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      overflow: 'hidden',
    }}>
      {/* 데스크톱: 280px 고정 사이드바 */}
      {isDesktop && showNav && (
        <DesktopSidebar unresolvedCount={unresolvedCount} onSettingsOpen={() => setSettingsOpen(true)} />
      )}

      {/* 콘텐츠 영역 */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingTop: (!isDesktop) ? 'var(--sat, 0px)' : 0,
      }}>
        {/* 모바일 전용: GlobalHeader */}
        {!isDesktop && showNav && (
          <GlobalHeader
            title={isDashboard ? dateOnly : pageTitle}
            onMenuOpen={() => setSideOpen(true)}
            rightSlot={isDashboard ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{dashboardRightSlot}{settingsGearBtn}</div> : settingsGearBtn}
          />
        )}
        {/* 모바일 전용: SideMenu 드로어 */}
        {!isDesktop && showNav && (
          <SideMenu open={sideOpen} onClose={() => setSideOpen(false)} unresolvedCount={unresolvedCount} />
        )}

        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} isDesktop={isDesktop && showNav} />

        {/* 데스크톱: 간소화된 헤더 — 사이드바 로고와 높이 일치 */}
        {isDesktop && showNav && (
          <header data-no-print style={{
            height: 54,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            background: 'var(--bg2)',
            borderBottom: '1px solid var(--bd)',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--t1)',
              flex: 1,
            }}>
              {isDashboard ? '대시보드' : pageTitle}
            </span>
          </header>
        )}

        {/* 페이지 콘텐츠 */}
        <main style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingBottom: (!isDesktop && showNav) ? 'calc(54px + var(--sab, 34px))' : 0,
        }}>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/"              element={<SplashScreen />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/dashboard"     element={<Auth><DashboardPage /></Auth>} />
              <Route path="/inspection"    element={<Auth><InspectionPage /></Auth>} />
              <Route path="/inspection/qr" element={<Auth><QRScanPage /></Auth>} />
              <Route path="/elevator"      element={<Auth><ElevatorPage /></Auth>} />
              <Route path="/elevator/findings/:fid" element={<Auth><ElevatorFindingDetailPage /></Auth>} />
              <Route path="/remediation"   element={<Auth><RemediationPage /></Auth>} />
              <Route path="/remediation/:recordId" element={<Auth><RemediationDetailPage /></Auth>} />
              <Route path="/staff-service" element={<Auth><StaffServicePage /></Auth>} />
              <Route path="/more"          element={<Navigate to="/staff-service" replace />} />
              <Route path="/schedule"      element={<Auth><SchedulePage /></Auth>} />
              <Route path="/reports"       element={<Auth><ReportsPage /></Auth>} />
              <Route path="/daily-report"  element={<Auth><DailyReportPage /></Auth>} />
              <Route path="/workshift"     element={<Auth><WorkShiftPage /></Auth>} />
              <Route path="/leave"         element={<Auth><LeavePage /></Auth>} />
              <Route path="/floorplan"     element={<Auth><FloorPlanPage /></Auth>} />
              <Route path="/div"           element={<Auth><DivPage /></Auth>} />
              <Route path="/qr-print"      element={<Auth><QRPrintPage /></Auth>} />
              <Route path="/admin"          element={<Auth><AdminPage /></Auth>} />
              <Route path="/meal"           element={<Auth><MealPage /></Auth>} />
              <Route path="/education"      element={<Auth><EducationPage /></Auth>} />
              <Route path="/legal"                      element={<Auth><LegalPage /></Auth>} />
              <Route path="/legal/:id"                  element={<Auth><LegalFindingsPage /></Auth>} />
              <Route path="/legal/:id/finding/:fid"     element={<Auth><LegalFindingDetailPage /></Auth>} />
              <Route path="/annual-plan"    element={<Auth><AnnualPlanPage /></Auth>} />
              <Route path="/e/:checkpointId" element={<ExtinguisherPublicPage />} />
              <Route path="*"              element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>

        {/* 모바일 전용: BottomNav */}
        {!isDesktop && showNav && <BottomNav unresolvedCount={unresolvedCount} />}
      </div>
    </div>
  )
}

export default function App() {

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
      <Toaster
        position="top-center"
        containerStyle={{ top: 'var(--sat, 44px)' }}
        toastOptions={{ duration:3000, style:{ borderRadius:12, fontSize:13, fontWeight:600, background:'var(--bg2)', color:'var(--t1)', border:'1px solid var(--bd2)' } }}
      />
    </QueryClientProvider>
  )
}

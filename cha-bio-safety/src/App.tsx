import { Suspense, lazy, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import { BottomNav } from './components/BottomNav'
import { GlobalHeader } from './components/GlobalHeader'
import { SideMenu } from './components/SideMenu'
import { SettingsPanel } from './components/SettingsPanel'
import { useDateTime } from './hooks/useDateTime'
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

const NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/meal', '/education', '/admin', '/legal-inspection']

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '대시보드',
  '/inspection': '소방 점검',
  '/inspection/qr': 'QR 스캔',
  '/remediation': '조치 관리',
  '/elevator': '승강기 관리',
}

function Layout() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const showNav = isAuthenticated
    && !NO_NAV_PATHS.includes(location.pathname)
    && !location.pathname.match(/^\/remediation\/.+/)
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

  const dashboardRightSlot = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', whiteSpace: 'nowrap' }}>차바이오컴플렉스 방재팀</span>
      <button onClick={() => setSettingsOpen(true)} style={{
        width: 32, height: 32, borderRadius: 7,
        background: 'var(--bg3)', border: 'none',
        color: 'var(--t2)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    </div>
  )

  return (
    <div style={{
      width: '100%',
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      paddingTop: 'var(--sat, 0px)',
    }}>
      {showNav && <GlobalHeader title={isDashboard ? dateOnly : pageTitle} onMenuOpen={() => setSideOpen(true)} rightSlot={isDashboard ? dashboardRightSlot : undefined} />}
      {showNav && <SideMenu open={sideOpen} onClose={() => setSideOpen(false)} unresolvedCount={unresolvedCount} />}
      {isDashboard && showNav && <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', paddingBottom: showNav ? 'calc(54px + var(--sab, 34px))' : 0 }}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/"              element={<SplashScreen />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/dashboard"     element={<Auth><DashboardPage /></Auth>} />
            <Route path="/inspection"    element={<Auth><InspectionPage /></Auth>} />
            <Route path="/inspection/qr" element={<Auth><QRScanPage /></Auth>} />
            <Route path="/elevator"      element={<Auth><ElevatorPage /></Auth>} />
            <Route path="/remediation"   element={<Auth><RemediationPage /></Auth>} />
            <Route path="/remediation/:recordId" element={<Auth><RemediationDetailPage /></Auth>} />
            <Route path="/more"          element={<Navigate to="/dashboard" replace />} />
            <Route path="/schedule"      element={<Auth><SchedulePage /></Auth>} />
            <Route path="/reports"       element={<Auth><ReportsPage /></Auth>} />
            <Route path="/daily-report"  element={<Auth><DailyReportPage /></Auth>} />
            <Route path="/workshift"     element={<Auth><WorkShiftPage /></Auth>} />
            <Route path="/leave"         element={<Auth><LeavePage /></Auth>} />
            <Route path="/floorplan"     element={<Auth><FloorPlanPage /></Auth>} />
            <Route path="/div"           element={<Auth><DivPage /></Auth>} />
            <Route path="/qr-print"      element={<Auth><QRPrintPage /></Auth>} />
            <Route path="/e/:checkpointId" element={<ExtinguisherPublicPage />} />
            <Route path="*"              element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
      {showNav && <BottomNav unresolvedCount={unresolvedCount} />}
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

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import { BottomNav } from './components/BottomNav'
// Safe area 초기화는 index.html 인라인 스크립트에서 처리 (React 마운트 전 실행)

const SplashScreen   = lazy(() => import('./pages/SplashScreen'))
const LoginPage      = lazy(() => import('./pages/LoginPage'))
const DashboardPage  = lazy(() => import('./pages/DashboardPage'))
const InspectionPage = lazy(() => import('./pages/InspectionPage'))
const QRScanPage     = lazy(() => import('./pages/QRScanPage'))
const ElevatorPage   = lazy(() => import('./pages/ElevatorPage'))
const NotFoundPage   = lazy(() => import('./pages/NotFoundPage'))
const MorePage       = lazy(() => import('./pages/MorePage'))
const SchedulePage   = lazy(() => import('./pages/SchedulePage'))
const ReportsPage    = lazy(() => import('./pages/ReportsPage'))
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

const NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print']

function Layout() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const showNav = isAuthenticated && !NO_NAV_PATHS.includes(location.pathname)

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
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', paddingBottom: showNav ? 'calc(54px + var(--sab, 34px))' : 0 }}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/"              element={<SplashScreen />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/dashboard"     element={<Auth><DashboardPage /></Auth>} />
            <Route path="/inspection"    element={<Auth><InspectionPage /></Auth>} />
            <Route path="/inspection/qr" element={<Auth><QRScanPage /></Auth>} />
            <Route path="/elevator"      element={<Auth><ElevatorPage /></Auth>} />
            <Route path="/more"          element={<Auth><MorePage /></Auth>} />
            <Route path="/schedule"      element={<Auth><SchedulePage /></Auth>} />
            <Route path="/reports"       element={<Auth><ReportsPage /></Auth>} />
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
      {showNav && <BottomNav />}
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

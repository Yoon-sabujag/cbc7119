import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { getMonthlySchedule } from '../utils/shiftCalc'

const NAV_H = 'calc(54px + var(--sab, 0px))'

interface Props {
  open: boolean
  onClose: () => void
}

const MENU = [
  { section: '주요 기능', items: [
    { label: '대시보드',    path: '/dashboard',      badge: 0 },
    { label: '소방 점검',   path: '/inspection',     badge: 3 },
    { label: 'QR 스캔',    path: '/inspection/qr',  badge: 0 },
    { label: 'DIV 트렌드', path: '/div',             badge: 0 },
    { label: '승강기 관리', path: '/elevator',        badge: 0 },
  ]},
  { section: '점검 기록', items: [
    { label: '월간 점검 계획', path: '/schedule',  badge: 0 },
    { label: '점검 일지 출력', path: '/report',        badge: 0 },
    { label: '일일업무일지',   path: '/daily-report', badge: 0 },
    { label: '미조치 항목',   path: '/unresolved', badge: 2 },
  ]},
  { section: '근무·복지', items: [
    { label: '근무표',    path: '/shift',  badge: 0 },
    { label: '연차 관리', path: '/leave',  badge: 0 },
    { label: '식당 메뉴', path: '/menu',   badge: 0 },
  ]},
]

export function SideMenu({ open, onClose }: Props) {
  const navigate  = useNavigate()
  const { staff, logout } = useAuthStore()

  const RAW_TO_LABEL: Record<string, string> = { '당':'당직', '비':'비번', '주':'주간', '휴':'연차' }
  const [todayShiftLabel, setTodayShiftLabel] = useState('평일주간고정')
  useEffect(() => {
    if (!staff) return
    const now = new Date()
    const ref = (now.getHours() < 8 || (now.getHours() === 8 && now.getMinutes() < 30))
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1) : now
    const { staffRows } = getMonthlySchedule(ref.getFullYear(), ref.getMonth() + 1)
    const row = staffRows.find(r => r.id === staff.id)
    if (row) {
      const idx = ref.getDate() - 1
      setTodayShiftLabel(RAW_TO_LABEL[row.shifts[idx]] ?? '주간')
    }
  }, [staff])

  const go = (path: string) => { navigate(path); onClose() }

  return (
    <>
      {/* 오버레이 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 190,
          background: 'rgba(0,0,0,0.65)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.28s',
        }}
      />

      {/* 패널 */}
      <div
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 200,
          width: '82%', maxWidth: 300,
          background: 'var(--bg2)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* 헤더 */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'calc(15px + var(--sat, 0px)) 15px 12px', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#1d4ed8,#0ea5e9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🛡️</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700 }}>차바이오컴플렉스</div>
            <div style={{ fontSize:9.5, color:'var(--t3)', marginTop:1 }}>소방안전 통합관리</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto', width:28, height:28, borderRadius:7, background:'var(--bg3)', border:'none', color:'var(--t2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>✕</button>
        </div>

        {/* 메뉴 목록 */}
        <div style={{ overflowY:'auto', flex:1, padding:'5px 0' }}>
          {MENU.map(({ section, items }) => (
            <div key={section}>
              <div style={{ padding:'9px 13px 2px', fontSize:9, fontWeight:700, color:'var(--t3)', letterSpacing:'.08em', textTransform:'uppercase' }}>{section}</div>
              {items.map(item => (
                <div
                  key={item.path}
                  onClick={() => go(item.path)}
                  style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'9px 13px', margin:'1px 7px', borderRadius:8,
                    cursor:'pointer', color:'var(--t1)',
                    transition:'background 0.13s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background='var(--bg4)')}
                  onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                >
                  <span style={{ fontSize:12.5, fontWeight:500, flex:1 }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{ background:'var(--danger)', color:'#fff', fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:9 }}>{item.badge}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 로그인 사용자 */}
        <div style={{ padding:'9px 11px', borderTop:'1px solid var(--bd)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 10px', background:'var(--bg3)', borderRadius:9 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#1d4ed8,#0ea5e9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {staff?.name?.[0] ?? '?'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11.5, fontWeight:700 }}>{staff?.name}</div>
              <div style={{ fontSize:9.5, color:'var(--t3)' }}>{staff?.title} · {todayShiftLabel}</div>
            </div>
            <button
              onClick={() => { logout(); go('/login') }}
              style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:11 }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { getMonthlySchedule } from '../utils/shiftCalc'
import { useStaffList } from '../hooks/useStaffList'
import { settingsApi } from '../utils/api'

const NAV_H = 'calc(54px + var(--sab, 0px))'

interface Props {
  open: boolean
  onClose: () => void
  unresolvedCount?: number
}

export type MenuItem = { label: string; path: string; badge: number; soon: boolean; role?: 'admin' | 'assistant' }

export const MENU: { section: string; items: MenuItem[] }[] = [
  { section: '주요 기능', items: [
    { label: '대시보드',    path: '/dashboard',      badge: 0, soon: false },
    { label: '소방 점검',   path: '/inspection',     badge: 0, soon: false },
    { label: 'QR 스캔',    path: '/inspection/qr',  badge: 0, soon: false },
    { label: '조치 관리',   path: '/remediation',    badge: 0, soon: false },
  ]},
  { section: '점검 관리', items: [
    { label: '월간 점검 계획', path: '/schedule',      badge: 0, soon: false },
    { label: '점검 일지 출력', path: '/reports',        badge: 0, soon: false },
    { label: '일일업무일지',   path: '/daily-report',  badge: 0, soon: false },
    { label: 'QR 코드 출력',  path: '/qr-print',      badge: 0, soon: false },
    { label: 'DIV 압력 관리', path: '/div',            badge: 0, soon: false },
  ]},
  { section: '근무·복지', items: [
    { label: '근무표',      path: '/workshift',      badge: 0, soon: false },
    { label: '연차 및 식사', path: '/staff-service',  badge: 0, soon: false },
    { label: '보수교육',    path: '/education',      badge: 0, soon: false },
  ]},
  { section: '시스템', items: [
    { label: '건물 도면',   path: '/floorplan',  badge: 0, soon: false },
    { label: '승강기 관리', path: '/elevator',   badge: 0, soon: false },
    { label: '법적 점검',   path: '/legal',      badge: 0, soon: false },
    { label: '관리자 설정', path: '/admin',      badge: 0, soon: false, role: 'admin' },
  ]},
]

export function SideMenu({ open, onClose, unresolvedCount = 0 }: Props) {
  const navigate  = useNavigate()
  const qc = useQueryClient()
  const { staff, logout } = useAuthStore()
  const { data: staffList } = useStaffList()
  const { data: menuConfig } = useQuery({ queryKey: ['menu-config'], queryFn: () => settingsApi.getMenu(), staleTime: 300_000 })
  const [editMode, setEditMode] = useState(false)
  const [editConfig, setEditConfig] = useState<Record<string, { visible: boolean; order: number }> | null>(null)
  const [saving, setSaving] = useState(false)

  // 메뉴 설정 적용: hidden 항목 필터링 + 순서 반영
  const appliedMenu = useMemo(() => {
    if (!menuConfig) return MENU
    const cfg = menuConfig as Record<string, { visible: boolean; order: number }>
    return MENU.map(section => ({
      ...section,
      items: section.items
        .filter(item => cfg[item.path] === undefined || cfg[item.path].visible !== false)
        .sort((a, b) => ((cfg[a.path]?.order ?? 999) - (cfg[b.path]?.order ?? 999))),
    })).filter(section => section.items.length > 0)
  }, [menuConfig])

  const RAW_TO_LABEL: Record<string, string> = { '당':'당직', '비':'비번', '주':'주간', '휴':'연차' }
  const [todayShiftLabel, setTodayShiftLabel] = useState('평일주간고정')
  useEffect(() => {
    if (!staff) return
    const now = new Date()
    const ref = (now.getHours() < 8 || (now.getHours() === 8 && now.getMinutes() < 30))
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1) : now
    const staffForCalc = (staffList ?? []).map(s => ({ id: s.id, name: s.name, title: s.title }))
    const { staffRows } = getMonthlySchedule(ref.getFullYear(), ref.getMonth() + 1, staffForCalc)
    const row = staffRows.find(r => r.id === staff.id)
    if (row) {
      const idx = ref.getDate() - 1
      setTodayShiftLabel(RAW_TO_LABEL[row.shifts[idx]] ?? '주간')
    }
  }, [staff])

  // 메뉴 열림 시 뒤쪽 스크롤 방지
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const prevent = (e: TouchEvent) => {
      const panel = document.getElementById('side-menu-panel')
      if (panel && panel.contains(e.target as Node)) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('touchmove', prevent)
    }
  }, [open])

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
        id="side-menu-panel"
        style={{
          position: 'fixed', top: 'var(--sat, 0px)', bottom: 'calc(54px + var(--sab, 34px) - var(--sat, 0px))', left: 0, zIndex: 200,
          width: '82%', maxWidth: 300,
          background: 'var(--bg2)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderRadius: '0 16px 16px 0',
        }}
      >
        {/* 헤더 — 일반 모드 vs 편집 모드 */}
        {!editMode ? (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 15px', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
            <img src="/icons/icon-192.png" alt="" style={{ width:30, height:30, borderRadius:8, flexShrink:0 }} />
            <div>
              <div style={{ fontSize:13, fontWeight:700 }}>차바이오컴플렉스</div>
              <div style={{ fontSize:9.5, color:'var(--t3)', marginTop:1 }}>소방안전 통합관리</div>
            </div>
            <button onClick={onClose} style={{ marginLeft:'auto', width:28, height:28, borderRadius:7, background:'var(--bg3)', border:'none', color:'var(--t2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>✕</button>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 15px', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>메뉴 편집</div>
              <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>표시할 항목과 순서를 설정하세요</div>
            </div>
            <button onClick={() => { setEditMode(false); setEditConfig(null) }} style={{ width:28, height:28, borderRadius:7, background:'var(--bg3)', border:'none', color:'var(--t2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>✕</button>
          </div>
        )}

        {/* 메뉴 목록 또는 편집 모드 본문 */}
        {!editMode ? (
          <>
            <div style={{ overflowY:'auto', flex:1, padding:'5px 0' }}>
              {appliedMenu.map(({ section, items }) => (
                <div key={section}>
                  <div style={{ padding:'9px 13px 2px', fontSize:9, fontWeight:700, color:'var(--t3)', letterSpacing:'.08em', textTransform:'uppercase' }}>{section}</div>
                  {items.map(item => {
                    if (item.role && staff?.role !== item.role) return null
                    return item.soon ? (
                    <div key={item.path} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 13px', margin:'1px 7px', borderRadius:8, color:'var(--t3)', opacity:0.5, cursor:'default', pointerEvents:'none' }}>
                      <span style={{ fontSize:12.5, fontWeight:500, flex:1 }}>{item.label}</span>
                      <span style={{ fontSize:10, color:'var(--t3)', background:'var(--bg3)', borderRadius:6, padding:'2px 7px' }}>준비중</span>
                    </div>
                  ) : (
                    <div key={item.path} onClick={() => go(item.path)}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 13px', margin:'1px 7px', borderRadius:8, cursor:'pointer', color:'var(--t1)', transition:'background 0.13s' }}
                      onMouseEnter={e => (e.currentTarget.style.background='var(--bg4)')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                    >
                      <span style={{ fontSize:12.5, fontWeight:500, flex:1 }}>{item.label}</span>
                      {(() => {
                        const badgeCount = item.path === '/remediation' ? unresolvedCount : item.badge
                        return badgeCount > 0 ? (
                          <span style={{ background:'var(--danger)', color:'#fff', fontSize:11, fontWeight:700, fontFamily:'JetBrains Mono', padding:'2px 4px', borderRadius:9, minWidth:16, textAlign:'center' }}>
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        ) : null
                      })()}
                    </div>
                  )
                  })}
                </div>
              ))}
            </div>
            <div style={{ padding:'4px 11px', flexShrink:0 }}>
              <button onClick={() => {
                const cfg: Record<string, { visible: boolean; order: number }> = {}
                const allItems: { path: string }[] = []
                MENU.forEach(s => s.items.forEach(i => allItems.push(i)))
                allItems.forEach((item, idx) => { const mc = menuConfig as any; cfg[item.path] = mc?.[item.path] ?? { visible: true, order: idx } })
                setEditConfig(cfg); setEditMode(true)
              }} style={{ width:'100%', padding:'7px 0', borderRadius:8, border:'1px dashed var(--bd2)', background:'transparent', color:'var(--t3)', fontSize:10, fontWeight:600, cursor:'pointer' }}>
                ⚙ 메뉴 편집
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ flex:1, overflowY:'auto', padding:'8px 11px' }}>
              {(() => {
                if (!editConfig) return null
                const allItems: { path: string; label: string; section: string }[] = []
                MENU.forEach(s => s.items.forEach(i => allItems.push({ path: i.path, label: i.label, section: s.section })))
                const sorted = allItems.slice().sort((a, b) => (editConfig[a.path]?.order ?? 999) - (editConfig[b.path]?.order ?? 999))
                return sorted.map((item, idx) => {
                  const vis = editConfig[item.path]?.visible !== false
                  return (
                    <div key={item.path} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:10, marginBottom:5, opacity: vis ? 1 : 0.35 }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
                        <button onClick={() => { if (idx<=0) return; const p=sorted[idx-1]; setEditConfig(c=>c?({...c,[item.path]:{...c[item.path],order:c[p.path]?.order??idx-1},[p.path]:{...c[p.path],order:c[item.path]?.order??idx}}):c) }}
                          style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:14, padding:0, lineHeight:1 }}>▲</button>
                        <button onClick={() => { if (idx>=sorted.length-1) return; const n=sorted[idx+1]; setEditConfig(c=>c?({...c,[item.path]:{...c[item.path],order:c[n.path]?.order??idx+1},[n.path]:{...c[n.path],order:c[item.path]?.order??idx}}):c) }}
                          style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:14, padding:0, lineHeight:1 }}>▼</button>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)' }}>{item.label}</div>
                        <div style={{ fontSize:9, color:'var(--t3)' }}>{item.section}</div>
                      </div>
                      <button onClick={() => setEditConfig(c=>c?({...c,[item.path]:{...c[item.path],visible:!vis}}):c)} style={{
                        width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', flexShrink:0, position:'relative',
                        background: vis ? 'var(--acl)' : 'var(--bg3)', transition:'background 0.15s',
                      }}>
                        <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: vis ? 23 : 3, transition:'left 0.15s' }} />
                      </button>
                    </div>
                  )
                })
              })()}
            </div>
            <div style={{ padding:'8px 11px 4px', flexShrink:0, display:'flex', gap:8 }}>
              <button onClick={() => { setEditMode(false); setEditConfig(null) }}
                style={{ flex:1, padding:'10px 0', borderRadius:8, border:'1px solid var(--bd2)', background:'var(--bg)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>취소</button>
              <button onClick={async () => {
                if (!editConfig) return; setSaving(true)
                try { await settingsApi.saveMenu(editConfig); qc.invalidateQueries({ queryKey:['menu-config'] }); setEditMode(false); setEditConfig(null) } catch {}
                setSaving(false)
              }} style={{ flex:2, padding:'10px 0', borderRadius:8, border:'none', background:'var(--acl)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', opacity:saving?0.5:1 }}>
                {saving ? '저장 중...' : '설정 저장'}
              </button>
            </div>
          </div>
        )}

        {/* 로그인 사용자 (편집 모드에서는 숨김) */}
        {!editMode && <div style={{ padding:'9px 11px', borderTop:'1px solid var(--bd)', flexShrink:0 }}>
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
        </div>}
      </div>
    </>
  )
}

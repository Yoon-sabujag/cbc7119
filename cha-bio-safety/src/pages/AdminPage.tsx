import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function AdminPage() {
  const navigate = useNavigate()
  const { staff } = useAuthStore()

  useEffect(() => {
    if (staff?.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [staff, navigate])

  if (staff?.role !== 'admin') return null

  return (
    <div style={{ flex:1, background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ height:48, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', display:'flex', alignItems:'center', padding:'0 16px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'var(--t2)', cursor:'pointer', padding:4, fontSize:15 }}>
          ←
        </button>
        <span style={{ flex:1, textAlign:'center', fontSize:16, fontWeight:700, color:'var(--t1)' }}>관리자 설정</span>
        <div style={{ width:28 }} />
      </div>
      <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}>
        관리자 설정 페이지 (Plan 02에서 구현)
      </div>
    </div>
  )
}

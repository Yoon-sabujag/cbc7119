import { useNavigate } from 'react-router-dom'
export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', color:'var(--t1)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <p style={{ fontSize:56, fontWeight:900, color:'var(--bg4)', margin:0 }}>404</p>
      <p style={{ fontSize:16, fontWeight:700, margin:0 }}>페이지를 찾을 수 없습니다</p>
      <button onClick={() => navigate('/dashboard')} style={{ padding:'12px 28px', borderRadius:12, background:'#2563eb', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>대시보드로 이동</button>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const MENU_SECTIONS = [
  {
    title: '관리',
    items: [
      { icon: '📋', label: '점검 계획 관리', desc: '월간 점검 일정 관리', soon: false, path: '/schedule' },
      { icon: '📄', label: '점검 기록 출력', desc: '소방 일지 인쇄/PDF 출력', soon: false, path: '/reports' },
      { icon: '🔳', label: 'QR 코드 출력', desc: '카테고리별 QR 코드 인쇄', soon: false, path: '/qr-print' },
      { icon: '⚖️', label: '법적 점검 관리', desc: '소방 법정 검사 일정', soon: true },
    ],
  },
  {
    title: '운영',
    items: [
      { icon: '📅', label: '근무표', desc: '3교대 근무 스케줄', soon: false, path: '/workshift' },
      { icon: '🏖️', label: '연차 관리', desc: '연차 신청 및 현황', soon: false, path: '/leave' },
      { icon: '🍱', label: '식사 기록', desc: '구내식당 식사 지원', soon: true },
    ],
  },
  {
    title: '시스템',
    items: [
      { icon: '🗺️', label: '건물 도면', desc: '층별 소방시설 위치 확인', soon: false, path: '/floorplan' },
      { icon: '⚙️', label: '관리자 설정', desc: '사용자 및 시스템 설정', soon: true },
      { icon: '📊', label: 'DIV 압력 관리', desc: '34개 측정점 압력 트렌드', soon: false, path: '/div' },
    ],
  },
]

export default function MorePage() {
  const navigate = useNavigate()
  const { staff, logout } = useAuthStore()

  function handleLogout() {
    logout()
    toast.success('로그아웃 되었습니다')
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* 헤더 */}
      <div style={{ padding: '8px 16px 12px', background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>더보기</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {/* 프로필 카드 */}
        <div style={{ background: 'var(--bg2)', borderRadius: 14, padding: '16px', marginBottom: 20, border: '1px solid var(--bd2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--acl)' }}>
              {staff?.name?.[0] ?? '?'}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{staff?.name ?? '-'}</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>{staff?.title ?? ''} · {staff?.id ?? ''}</div>
            </div>
          </div>
        </div>

        {/* 메뉴 섹션 */}
        {MENU_SECTIONS.map(section => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginBottom: 8, paddingLeft: 4, letterSpacing: '0.05em' }}>
              {section.title}
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--bd)', overflow: 'hidden' }}>
              {section.items.map((item, idx) => (
                <div
                  key={item.label}
                  onClick={() => !item.soon && (item as any).path && navigate((item as any).path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    borderBottom: idx < section.items.length - 1 ? '1px solid var(--bd)' : 'none',
                    opacity: item.soon ? 0.5 : 1,
                    cursor: item.soon ? 'default' : 'pointer',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  {item.soon
                    ? <span style={{ fontSize: 10, color: 'var(--t3)', background: 'var(--bg3)', borderRadius: 6, padding: '2px 7px' }}>준비중</span>
                    : <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
                  }
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}
        >
          로그아웃
        </button>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--t3)', padding: '8px 0 20px' }}>
          차바이오컴플렉스 방재관리 v0.2.0
        </div>
      </div>
    </div>
  )
}

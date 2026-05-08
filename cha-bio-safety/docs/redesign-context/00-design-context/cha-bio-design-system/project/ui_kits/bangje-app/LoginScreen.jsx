/* Login Screen — 방재 시스템 (Lucide icons) */

function LoginScreen({ onLogin }) {
  const [staffId, setStaffId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);

  const STAFF = [
    { id: 'S001', name: '석현민', title: '주임', color: '#6b7280' },
    { id: 'S002', name: '김병조', title: '기사', color: '#6b7280' },
    { id: 'S003', name: '윤종엽', title: '대리', color: '#6b7280' },
    { id: 'S004', name: '박보융', title: '기사', color: '#6b7280' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--surface-page)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Logo area */}
      <div style={{ marginBottom: 16 }}>
        <img src="../../assets/icon-192.png" alt="CBC 방재팀" style={{ width: 64, height: 64, borderRadius: 16 }} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        CHA Bio Complex
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>
        방재 시스템
      </div>

      {/* Staff cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 320, marginBottom: 24 }}>
        {STAFF.map(s => (
          <div key={s.id}
            onClick={() => setStaffId(s.id)}
            style={{
              background: staffId === s.id ? `${s.color}22` : 'var(--surface-raised)',
              border: `1.5px solid ${staffId === s.id ? s.color : 'var(--border-default)'}`,
              borderRadius: 12, padding: '12px 14px',
              cursor: 'pointer', transition: 'all .15s',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `${s.color}30`, color: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700,
            }}>
              {s.name[0]}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{s.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>사번</label>
          <input
            value={staffId}
            onChange={e => setStaffId(e.target.value)}
            placeholder="사번을 입력하세요"
            style={{
              width: '100%', height: 'var(--input-height)',
              background: 'var(--surface-sunken)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '0 14px', fontSize: 14,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>비밀번호</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호"
              style={{
                width: '100%', height: 'var(--input-height)',
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 40px 0 14px', fontSize: 14,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-tertiary)',
                cursor: 'pointer', padding: 4,
              }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button
          onClick={() => onLogin && onLogin()}
          style={{
            width: '100%', height: 'var(--button-height)',
            background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            marginTop: 4, fontFamily: 'var(--font-sans)',
          }}>
          로그인
        </button>
        <div style={{ fontSize: 12, color: 'var(--text-disabled)', textAlign: 'center', marginTop: 4, lineHeight: 1.5 }}>
          초기 비밀번호: 사번 뒤 4자리<br/>
          문의: 방재팀 내선 2180
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });

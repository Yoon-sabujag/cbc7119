interface GlobalHeaderProps {
  title: string
  onMenuOpen: () => void
}

export function GlobalHeader({ title, onMenuOpen }: GlobalHeaderProps) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      height: 48,
      padding: '0 12px',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--bd)',
      flexShrink: 0,
    }}>
      <button
        onClick={onMenuOpen}
        aria-label="메뉴 열기"
        style={{
          width: 32, height: 32, borderRadius: 7,
          background: 'var(--bg3)', border: 'none',
          color: 'var(--t2)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <span style={{
        flex: 1, textAlign: 'center',
        fontSize: 13, fontWeight: 700, color: 'var(--t1)',
      }}>
        {title}
      </span>
      {/* Right slot placeholder for future use — keeps title centered */}
      <div style={{ width: 32 }} />
    </header>
  )
}

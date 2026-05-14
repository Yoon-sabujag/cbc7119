/* Shared UI Components for 방재 시스템 UI Kit */

const sharedStyles = {
  badge: (bg, color) => ({
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 12px', borderRadius: 99,
    fontSize: 12, fontWeight: 600,
    background: bg, color: color,
  }),
  card: {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--card-padding)',
  },
};

/* Progress Color Rule:
 *   100%       → status-safe (녹)
 *   50~99%     → accent (파랑)
 *   1~49%      → status-warning (노랑)
 *   0% (미시작) → text-tertiary (회색)
 */
function progressColor(pct) {
  if (pct >= 100) return 'var(--status-safe-bar)';
  if (pct >= 50)  return 'var(--accent)';
  if (pct > 0)    return 'var(--status-warning-bar)';
  return 'var(--text-tertiary)';
}

/* Icon wrapper for category icons — renders Lucide icon inside a tinted box */
function CatIcon({ icon: Icon, bg, size = 20, boxSize = 36 }) {
  return (
    <div style={{
      width: boxSize, height: boxSize, borderRadius: 10,
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={size} />
    </div>
  );
}

function DutyChip({ name, type, small }) {
  const colors = {
    day:   { bg: 'rgba(245,158,11,.15)', color: 'var(--duty-day)',   label: '주간' },
    night: { bg: 'rgba(239,68,68,.15)',   color: 'var(--duty-night)', label: '당직' },
    off:   { bg: 'rgba(59,130,246,.15)',  color: 'var(--duty-off)',   label: '비번' },
    leave: { bg: 'rgba(107,114,128,.15)', color: 'var(--duty-leave)', label: '휴무' },
  };
  const c = colors[type] || colors.off;
  const avatarSize = small ? 22 : 26;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: small ? 4 : 6,
      padding: small ? '2px 6px 2px 2px' : '3px 8px 3px 3px',
      borderRadius: 99, background: c.bg,
    }}>
      <span style={{
        width: avatarSize, height: avatarSize, borderRadius: '50%',
        background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: small ? 10 : 12, fontWeight: 700, color: '#fff',
      }}>{name[0]}</span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span style={{ fontSize: small ? 11 : 12, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</span>
        <span style={{ fontSize: small ? 9 : 10, color: 'var(--text-tertiary)' }}>{c.label}</span>
      </span>
    </span>
  );
}

function RoleLabel({ text, color }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 700, color: color,
      padding: '2px 6px', borderRadius: 4,
      background: color.replace('0.75', '0.12').replace('0.65', '0.1'),
    }}>
      {text}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:     { bg: 'rgba(110,118,129,.13)', color: 'var(--text-tertiary)', label: '예정' },
    in_progress: { bg: 'var(--status-info-bg)',  color: 'var(--status-info)',    label: '진행중' },
    done:        { bg: 'var(--status-safe-bg)',   color: 'var(--status-safe)',    label: '완료' },
    overdue:     { bg: 'var(--status-danger-bg)', color: 'var(--status-danger)',  label: '지연' },
    normal:      { bg: 'var(--status-safe-bg)',   color: 'var(--status-safe)',    label: '정상' },
    caution:     { bg: 'var(--status-warning-bg)',color: 'var(--status-warning)', label: '주의' },
    bad:         { bg: 'var(--status-danger-bg)', color: 'var(--status-danger)',  label: '불량' },
    unresolved:  { bg: 'var(--status-fire-bg)',   color: 'var(--status-fire)',    label: '미조치' },
  };
  const s = map[status] || map.pending;
  return <span style={sharedStyles.badge(s.bg, s.color)}>{s.label}</span>;
}

function Donut({ pct, color, size = 44 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="var(--surface-sunken)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" />
      <text x={size/2} y={size/2 + 4}
        textAnchor="middle" fill="var(--text-primary)"
        fontSize={size < 50 ? 10 : 14} fontWeight={700}
        fontFamily="'JetBrains Mono', monospace"
        style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}>
        {pct}%
      </text>
    </svg>
  );
}

function StatCard({ label, value, sub, color, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface-raised)',
        border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
        borderRadius: 12, padding: 'var(--card-padding)',
        display: 'flex', flexDirection: 'column', gap: 6,
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        transform: hover ? 'translateY(-1px)' : 'none',
        transition: 'border-color .15s, transform .15s',
      }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '12px 0 0 12px' }}></div>
      <div style={{ paddingLeft: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, lineHeight: 1, color: 'var(--text-primary)' }}>{value}</span>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{sub}</span>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ icon: Icon, label, desc, bg, iconColor, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--surface-sunken)' : 'var(--surface-raised)',
        border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
        borderRadius: 12, padding: '11px 12px',
        display: 'flex', alignItems: 'center', gap: 11,
        cursor: 'pointer', transition: 'all .13s',
      }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{desc}</div>
      </div>
    </div>
  );
}

function ScheduleRow({ time, title, category, status }) {
  const CAT_COLORS = { event: 'var(--status-fire)', repair: 'var(--status-danger)', inspect: 'var(--accent)', task: 'var(--text-tertiary)', elevator: '#f97316' };
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '7px 10px', borderBottom: '1px solid var(--border-default)' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-tertiary)', width: 40, flexShrink: 0, paddingTop: 1 }}>{time || '—'}</div>
      <div style={{ width: 2, borderRadius: 2, flexShrink: 0, alignSelf: 'stretch', minHeight: 24, background: CAT_COLORS[category] || 'var(--text-tertiary)' }}></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function BottomNav({ active, onNavigate }) {
  const items = [
    { key: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { key: 'inspection', label: '점검', icon: ClipboardList },
    { key: 'schedule', label: '일정', icon: Calendar },
    { key: 'menu', label: '더보기', icon: MenuIcon },
  ];
  return (
    <div style={{
      display: 'flex', background: 'var(--surface-raised)',
      borderTop: '1px solid var(--border-default)',
      padding: '6px 0 max(6px, env(safe-area-inset-bottom, 0px))',
      flexShrink: 0,
    }}>
      {items.map(item => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <div key={item.key} onClick={() => onNavigate(item.key)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              cursor: 'pointer', padding: '4px 0',
            }}>
            <Icon size={20} color={isActive ? 'var(--accent)' : 'var(--text-tertiary)'} />
            <span style={{
              fontSize: 12, fontWeight: isActive ? 700 : 400,
              color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
            }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PageHeader({ title, subtitle, onBack }) {
  return (
    <div style={{
      padding: '10px 16px', background: 'var(--surface-raised)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 32, height: 32, borderRadius: 8,
          border: '1px solid var(--border-default)', background: 'var(--surface-sunken)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)',
        }}>
          <ChevronLeft size={16} />
        </button>
      )}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

Object.assign(window, {
  DutyChip, RoleLabel, StatusBadge, Donut, StatCard, ToolCard, CatIcon,
  ScheduleRow, BottomNav, PageHeader, sharedStyles, progressColor,
});

import type { Staff, ShiftType, WeeklyItem } from '../../types'

// ─── 근무자 태블릿 칩 ────────────────────────────────────
const SHIFT_STYLE: Record<string, { bg: string; border: string; circBg: string; typeColor: string; label: string }> = {
  day:   { bg:'rgba(245,158,11,.08)',  border:'rgba(245,158,11,.28)',  circBg:'var(--c-day)',   typeColor:'var(--c-day)',   label:'주간' },
  night: { bg:'rgba(239,68,68,.08)',   border:'rgba(239,68,68,.28)',   circBg:'var(--c-night)', typeColor:'var(--c-night)', label:'당직' },
  off:   { bg:'rgba(59,130,246,.08)',  border:'rgba(59,130,246,.28)',  circBg:'var(--c-off)',   typeColor:'var(--c-off)',   label:'비번' },
  leave: { bg:'rgba(107,114,128,.08)', border:'rgba(107,114,128,.22)', circBg:'var(--c-leave)', typeColor:'var(--c-leave)', label:'휴무' },
}

interface DutyChipProps {
  staff: Staff
  onClick?: () => void
  small?: boolean
}

export function DutyChip({ staff, onClick, small }: DutyChipProps) {
  const key = staff.shiftType ?? 'off'
  const s   = SHIFT_STYLE[key] ?? SHIFT_STYLE.off
  const circSize = small ? 28 : 32

  return (
    <div
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap: small ? 5 : 6,
        borderRadius:22, padding: small ? '3px 8px 3px 3px' : '4px 10px 4px 4px',
        border:`1px solid ${s.border}`, background:s.bg,
        cursor:'pointer', flexShrink:0, transition:'opacity .13s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <div style={{
        width:circSize, height:circSize, borderRadius:'50%', flexShrink:0,
        background:s.circBg, display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: small ? 11 : 12, fontWeight:700, color:'#fff',
      }}>
        {staff.name[0]}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
        <span style={{ fontSize: small ? 11 : 12, fontWeight:700, color:'var(--t1)', whiteSpace:'nowrap' }}>{staff.name}</span>
        <span style={{ fontSize:9, fontWeight:600, color:s.typeColor, whiteSpace:'nowrap' }}>{s.label}</span>
      </div>
    </div>
  )
}

// ─── 역할 세로쓰기 레이블 ────────────────────────────────
interface RoleLabelProps {
  text: string
  color: string
}
export function RoleLabel({ text, color }: RoleLabelProps) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
      {text.split('').map((ch, i) => (
        <span key={i} style={{ fontSize:8, fontWeight:700, lineHeight:1.45, color, display:'block' }}>{ch}</span>
      ))}
    </div>
  )
}

// ─── 도넛 차트 ───────────────────────────────────────────
interface DonutProps {
  pct: number
  color: string
  size?: number
  strokeWidth?: number
}
export function Donut({ pct, color, size = 40, strokeWidth = 5 }: DonutProps) {
  const r    = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const cx   = size / 2
  const zero = pct === 0

  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform:'rotate(-90deg)' }}
      >
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--bg4)" strokeWidth={strokeWidth} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={zero ? '#2a2f37' : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`}
        />
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'JetBrains Mono, monospace', fontSize:10, fontWeight:600,
        color: zero ? 'var(--t3)' : color,
      }}>
        {pct}%
      </div>
    </div>
  )
}

// ─── 상태 뱃지 ──────────────────────────────────────────
const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:     { bg:'rgba(110,118,129,.18)', color:'var(--t3)',    label:'예정' },
  in_progress: { bg:'rgba(245,158,11,.15)', color:'var(--warn)',   label:'진행중' },
  done:        { bg:'rgba(34,197,94,.13)',  color:'var(--safe)',   label:'완료' },
  overdue:     { bg:'rgba(239,68,68,.13)', color:'var(--danger)', label:'지연' },
}
const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  event:   { bg:'rgba(249,115,22,.15)', color:'var(--fire)' },
  repair:  { bg:'rgba(239,68,68,.13)', color:'var(--danger)' },
  inspect: { bg:'rgba(59,130,246,.13)', color:'var(--acl)' },
  task:    { bg:'rgba(110,118,129,.15)', color:'var(--t2)' },
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending
  return (
    <span style={{ fontSize:8, fontWeight:700, padding:'2px 5px', borderRadius:5, background:s.bg, color:s.color, whiteSpace:'nowrap', flexShrink:0 }}>
      {s.label}
    </span>
  )
}

export function CatBar({ category }: { category: string }) {
  const s = CAT_STYLE[category] ?? CAT_STYLE.task
  return <div style={{ width:2, borderRadius:2, flexShrink:0, alignSelf:'stretch', minHeight:20, background:s.color }} />
}

import type { Staff, ShiftType, LeaveType, WeeklyItem } from '../../types'

// ─── 근무자 태블릿 칩 ────────────────────────────────────
const SHIFT_STYLE: Record<string, { bg: string; border: string; circBg: string; typeColor: string; label: string }> = {
  day:   { bg:'rgba(245,158,11,.08)',  border:'rgba(245,158,11,.28)',  circBg:'var(--c-day)',   typeColor:'var(--c-day)',   label:'주간' },
  night: { bg:'rgba(239,68,68,.08)',   border:'rgba(239,68,68,.28)',   circBg:'var(--c-night)', typeColor:'var(--c-night)', label:'당직' },
  off:   { bg:'rgba(59,130,246,.08)',  border:'rgba(59,130,246,.28)',  circBg:'var(--c-off)',   typeColor:'var(--c-off)',   label:'비번' },
  leave: { bg:'rgba(107,114,128,.08)', border:'rgba(107,114,128,.22)', circBg:'var(--c-leave)', typeColor:'var(--c-leave)', label:'휴무' },
}

// 연차/공가 색상
const LEAVE_COLOR: Record<string, string> = {
  full: '#22c55e', half_am: '#22c55e', half_pm: '#22c55e',
  official_full: '#f97316', official_half_am: '#f97316', official_half_pm: '#f97316',
}
const LEAVE_LABEL: Record<string, string> = {
  full: '연차', half_am: '반차(오전)', half_pm: '반차(오후)',
  official_full: '공가', official_half_am: '공가(오전)', official_half_pm: '공가(오후)',
}

// 대각선 분할 동그라미 (좌하→우상 대각선)
function HalfCircle({ size, leaveColor, shiftColor, name, half }: { size: number; leaveColor: string; shiftColor: string; name: string; half: 'am' | 'pm' }) {
  const r = size / 2
  // 오전=좌상 삼각, 오후=우하 삼각 — clipPath로 원 안에서 분리
  const id1 = `hc-a-${size}-${half}`
  const id2 = `hc-b-${size}-${half}`
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, display: 'block', overflow: 'hidden', borderRadius: '50%' }}>
      {/* 전체 배경: 근무 색 */}
      <circle cx={r} cy={r} r={r} fill={shiftColor} />
      {/* 연차/공가 반쪽: 삼각형 clip */}
      <defs>
        <clipPath id={id1}><polygon points={half === 'am' ? `0,0 ${size},0 0,${size}` : `${size},0 ${size},${size} 0,${size}`} /></clipPath>
      </defs>
      <circle cx={r} cy={r} r={r} fill={leaveColor} clipPath={`url(#${id1})`} />
      {/* 구분선 */}
      <line x1={0} y1={size} x2={size} y2={0} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
      {/* 이름 */}
      <text x={r} y={r} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={size * 0.38} fontWeight={700}>{name}</text>
    </svg>
  )
}

interface DutyChipProps {
  staff: Staff
  onClick?: () => void
  small?: boolean
}

export function DutyChip({ staff, onClick, small }: DutyChipProps) {
  const lt = staff.leaveType
  const isOnLeave = !!lt
  const isHalfLeave = lt === 'half_am' || lt === 'half_pm' || lt === 'official_half_am' || lt === 'official_half_pm'
  const isFullLeave = lt === 'full' || lt === 'official_full'
  const leaveColor = lt ? (LEAVE_COLOR[lt] ?? '#22c55e') : ''

  // 당직자가 연차/반차 쓸 때: 캡슐은 당직 스타일 유지
  const shiftKey = staff.shiftType ?? 'off'
  const isDutyWithLeave = shiftKey === 'night' && isOnLeave

  // 캡슐 스타일 결정
  let s = SHIFT_STYLE[shiftKey] ?? SHIFT_STYLE.off
  let chipLabel = s.label
  if (isOnLeave && !isDutyWithLeave) {
    // 연차/공가 → 캡슐도 연차 색상
    const alpha = '.08'
    const borderAlpha = '.28'
    s = {
      bg: `${leaveColor}${alpha.slice(1)}`.replace('#', 'rgba(').replace(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, (_, r, g, b) => `${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},${alpha.slice(1)})`),
      border: `${leaveColor}${borderAlpha.slice(1)}`.replace('#', 'rgba(').replace(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, (_, r, g, b) => `${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},${borderAlpha.slice(1)})`),
      circBg: leaveColor,
      typeColor: leaveColor,
      label: LEAVE_LABEL[lt!] ?? '연차',
    }
    chipLabel = s.label
  } else if (isDutyWithLeave) {
    chipLabel = SHIFT_STYLE.night.label // 당직 유지
  }

  const circSize = small ? 28 : 32

  // 캡슐 bg/border를 hex→rgba 변환하는 헬퍼
  function hexToRgba(hex: string, a: number) {
    const h = hex.replace('#', '')
    return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`
  }

  const capsuleBg = (isOnLeave && !isDutyWithLeave) ? hexToRgba(leaveColor, 0.08) : s.bg
  const capsuleBorder = (isOnLeave && !isDutyWithLeave) ? hexToRgba(leaveColor, 0.28) : s.border

  return (
    <div
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap: small ? 5 : 6,
        borderRadius:22, padding: small ? '3px 8px 3px 3px' : '4px 10px 4px 4px',
        border:`1px solid ${capsuleBorder}`, background:capsuleBg,
        cursor:'pointer', flexShrink:0, transition:'opacity .13s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {/* 동그라미 영역 */}
      {isHalfLeave ? (
        <HalfCircle
          size={circSize}
          leaveColor={leaveColor}
          shiftColor={SHIFT_STYLE[shiftKey]?.circBg ?? 'var(--c-day)'}
          name={staff.name[0]}
          half={lt!.includes('_am') ? 'am' : 'pm'}
        />
      ) : (
        <div style={{
          width:circSize, height:circSize, borderRadius:'50%', flexShrink:0,
          background: isFullLeave ? leaveColor : (isDutyWithLeave ? leaveColor : s.circBg),
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: small ? 11 : 12, fontWeight:700, color:'#fff',
        }}>
          {staff.name[0]}
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
        <span style={{ fontSize: small ? 11 : 12, fontWeight:700, color:'var(--t1)', whiteSpace:'nowrap' }}>{staff.name}</span>
        <span style={{ fontSize:9, fontWeight:600, color: (isOnLeave && !isDutyWithLeave) ? leaveColor : s.typeColor, whiteSpace:'nowrap' }}>{chipLabel}</span>
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

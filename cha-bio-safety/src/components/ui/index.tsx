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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 block overflow-hidden rounded-full">
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
      className={`flex items-center rounded-[22px] cursor-pointer shrink-0 transition-opacity duration-[130ms] ${small ? 'gap-[5px] py-[3px] pr-2 pl-[3px]' : 'gap-1.5 py-1 pr-2.5 pl-1'}`}
      style={{
        border:`1px solid ${capsuleBorder}`, background:capsuleBg,
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
        <div
          className={`rounded-full shrink-0 flex items-center justify-center font-bold text-white ${small ? 'w-[28px] h-[28px] text-[11px]' : 'w-[32px] h-[32px] text-[12px]'}`}
          style={{
            background: isFullLeave ? leaveColor : (isDutyWithLeave ? leaveColor : s.circBg),
          }}
        >
          {staff.name[0]}
        </div>
      )}
      <div className="flex flex-col gap-px">
        <span className={`font-bold text-text-primary whitespace-nowrap ${small ? 'text-[11px]' : 'text-[12px]'}`}>{staff.name}</span>
        <span
          className="text-[9px] font-semibold whitespace-nowrap"
          style={{ color: (isOnLeave && !isDutyWithLeave) ? leaveColor : s.typeColor }}
        >{chipLabel}</span>
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
    <div className="flex flex-col items-center shrink-0">
      {text.split('').map((ch, i) => (
        <span key={i} className="text-[8px] font-bold leading-[1.45] block" style={{ color }}>{ch}</span>
      ))}
    </div>
  )
}

// ─── 도넛 차트 ───────────────────────────────────────────
// 260427-1dc: doubleCycle prop 추가 — DIV/컴프레셔 0~200% two-lap 시각화
// (월초 cycle 색A 한 바퀴 → 월말 cycle 색B 가 같은 위치에 overlay)
// doubleCycle 미전달 시 기존 단일 arc 동작 100% 보존 (backward compat).
interface DonutProps {
  pct: number
  color: string
  size?: number
  strokeWidth?: number
  doubleCycle?: {
    earlyPct: number
    latePct: number
    earlyColor: string
    lateColor: string
  }
}
export function Donut({ pct, color, size = 40, strokeWidth = 5, doubleCycle }: DonutProps) {
  const r    = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * r
  const cx   = size / 2

  if (doubleCycle) {
    const { earlyPct, latePct, earlyColor, lateColor } = doubleCycle
    // 두 ring 분리 — 안쪽 = 월초, 바깥 = 월말. 각 ring 한 바퀴 = 100%, 둘 다 차면 200%.
    // (시간순 안→밖 확장)
    const ringStroke = Math.max(2, Math.round(strokeWidth * 0.55))
    const ringGap    = Math.max(1, Math.round(strokeWidth * 0.25))
    const outerR     = (size - ringStroke * 2) / 2
    const innerR     = outerR - ringStroke - ringGap
    const outerCirc  = 2 * Math.PI * outerR
    const innerCirc  = 2 * Math.PI * innerR
    const earlyDash  = (Math.min(earlyPct, 100) / 100) * innerCirc
    const lateDash   = (Math.min(latePct, 100) / 100) * outerCirc
    const allZero    = earlyPct === 0 && latePct === 0
    return (
      <div className="relative" style={{ width:size, height:size }}>
        <svg
          width={size} height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* 바깥 ring 트랙 + 월말 arc */}
          <circle cx={cx} cy={cx} r={outerR} fill="none" stroke="var(--bg4)" strokeWidth={ringStroke} />
          {latePct > 0 && (
            <circle
              cx={cx} cy={cx} r={outerR} fill="none"
              stroke={lateColor}
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={`${lateDash.toFixed(2)} ${(outerCirc - lateDash).toFixed(2)}`}
            />
          )}
          {/* 안쪽 ring 트랙 + 월초 arc */}
          <circle cx={cx} cy={cx} r={innerR} fill="none" stroke="var(--bg4)" strokeWidth={ringStroke} />
          {earlyPct > 0 && (
            <circle
              cx={cx} cy={cx} r={innerR} fill="none"
              stroke={earlyColor}
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={`${earlyDash.toFixed(2)} ${(innerCirc - earlyDash).toFixed(2)}`}
            />
          )}
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-semibold whitespace-nowrap"
          style={{ color: allZero ? 'var(--t3)' : 'var(--t2)' }}
        >
          {pct}%
        </div>
      </div>
    )
  }

  // ── 기존 단일 arc 동작 (변경 금지) ──
  const dash = (pct / 100) * circ
  const zero = pct === 0
  return (
    <div className="relative" style={{ width:size, height:size }}>
      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
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
      <div
        className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-semibold"
        style={{ color: zero ? 'var(--t3)' : color }}
      >
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
    <span
      className="text-[8px] font-bold py-[2px] px-[5px] rounded-[5px] whitespace-nowrap shrink-0"
      style={{ background:s.bg, color:s.color }}
    >
      {s.label}
    </span>
  )
}

export function CatBar({ category }: { category: string }) {
  const s = CAT_STYLE[category] ?? CAT_STYLE.task
  return <div className="w-0.5 rounded-[2px] shrink-0 self-stretch min-h-[20px]" style={{ background:s.color }} />
}

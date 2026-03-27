/**
 * B5 (지하5층) 평면도 SVG
 *
 * 좌표계: viewBox "0 0 960 680"
 * 스케일: ~1/100 (mm → SVG unit)
 * 기준: 건축도면 (KMD ARCHITECTS, 2012.04)
 * ※ 개략도 — 정밀 치수는 원본 도면 기준
 */

export interface FloorMarker {
  id: string
  x: number          // SVG x (0–960)
  y: number          // SVG y (0–680)
  type: 'extinguisher' | 'hydrant' | 'detector' | 'sprinkler' | 'exit_light' | 'pump' | 'other'
  name: string
  status: 'normal' | 'caution' | 'fault'
  lastInspect?: string
}

export const MARKER_STATUS_COLOR: Record<FloorMarker['status'], string> = {
  normal:  '#22c55e',
  caution: '#f59e0b',
  fault:   '#ef4444',
}

const TYPE_SYM: Record<FloorMarker['type'], string> = {
  extinguisher: '소',
  hydrant:      '소전',
  detector:     '감',
  sprinkler:    'SP',
  exit_light:   '유',
  pump:         'P',
  other:        '?',
}

interface Props {
  markers?: FloorMarker[]
  onMarkerClick?: (m: FloorMarker) => void
}

export function FloorB5({ markers = [], onMarkerClick }: Props) {
  const OUTER  = '#c9d1d9'   // 외벽선
  const INNER  = '#6e7681'   // 내부 격벽
  const THIN   = '#4a5058'   // 얇은 벽
  const ROOM   = '#1c2128'   // 일반 격실 배경
  const PARK   = '#161b22'   // 주차구역 배경
  const STAIR  = '#21262d'   // 계단실 배경

  return (
    <>
      <defs>
        {/* 주차구역 사선 패턴 */}
        <pattern id="b5-park" x="0" y="0" width="22" height="22"
          patternUnits="userSpaceOnUse" patternTransform="rotate(-50 480 340)">
          <line x1="11" y1="-4" x2="11" y2="26"
            stroke="rgba(139,148,158,0.09)" strokeWidth="1" />
        </pattern>
        {/* 계단실 대각 패턴 */}
        <pattern id="b5-stair" x="0" y="0" width="14" height="14"
          patternUnits="userSpaceOnUse">
          <line x1="0" y1="14" x2="14" y2="0"
            stroke="rgba(139,148,158,0.22)" strokeWidth="0.8" />
          <line x1="0" y1="7" x2="7" y2="0"
            stroke="rgba(139,148,158,0.12)" strokeWidth="0.5" />
        </pattern>
        {/* 클립패스: 주차구역 */}
        <clipPath id="b5-park-clip">
          <path d="M287,285 L890,285 L890,572 L855,572 L855,608 Q745,650 635,618 L287,635 Z" />
        </clipPath>
      </defs>

      {/* ── 배경 ─────────────────────────────────────────────────── */}
      <rect width="960" height="680" fill="#0d1117" />

      {/* ── 건물 외곽 면 채우기 ──────────────────────────────────── */}
      <path
        d="M155,92 L890,92 L890,572 L855,572 L855,608 Q745,650 635,618 L155,635 L155,482 L92,482 L92,348 L155,348 Z"
        fill={ROOM}
      />

      {/* ── 주차구역 ─────────────────────────────────────────────── */}
      <path
        d="M287,285 L890,285 L890,572 L855,572 L855,608 Q745,650 635,618 L287,635 Z"
        fill={PARK}
      />
      {/* 주차선 패턴 */}
      <rect x="287" y="285" width="603" height="400" fill="url(#b5-park)" clipPath="url(#b5-park-clip)" />

      {/* ── 계단실 블록 ──────────────────────────────────────────── */}
      <rect x="355" y="92" width="158" height="193" fill={STAIR} />
      <rect x="355" y="92" width="158" height="193" fill="url(#b5-stair)" />

      {/* ── 건물 외곽선 ──────────────────────────────────────────── */}
      <path
        d="M155,92 L890,92 L890,572 L855,572 L855,608 Q745,650 635,618 L155,635 L155,482 L92,482 L92,348 L155,348 Z"
        fill="none"
        stroke={OUTER}
        strokeWidth="2.5"
        strokeLinejoin="miter"
      />

      {/* ── 내부 격벽 ────────────────────────────────────────────── */}

      {/* 상단 구역 / 주차 구역 수평 분리 (두꺼운) */}
      <line x1="155" y1="285" x2="890" y2="285" stroke={INNER} strokeWidth="2" />

      {/* 좌측 열 세로 경계 */}
      <line x1="287" y1="285" x2="287" y2="635" stroke={INNER} strokeWidth="2" />

      {/* ── 상단 구역 수직 격벽 ─────────────────────────────────── */}
      <line x1="255" y1="92"  x2="255" y2="285" stroke={INNER} strokeWidth="1.5" />
      <line x1="355" y1="92"  x2="355" y2="285" stroke={INNER} strokeWidth="1.5" />
      <line x1="513" y1="92"  x2="513" y2="285" stroke={INNER} strokeWidth="1.5" />
      <line x1="678" y1="92"  x2="678" y2="285" stroke={INNER} strokeWidth="1.5" />
      <line x1="778" y1="92"  x2="778" y2="285" stroke={INNER} strokeWidth="1.5" />
      <line x1="855" y1="92"  x2="855" y2="285" stroke={INNER} strokeWidth="1.5" />

      {/* ── 상단 좌측 수평 분리 (x=155–355) ──────────────────────── */}
      <line x1="155" y1="162" x2="355" y2="162" stroke={THIN}  strokeWidth="1" />
      <line x1="155" y1="225" x2="255" y2="225" stroke={THIN}  strokeWidth="1" />

      {/* ── 상단 중간 수평 분리 (x=513–678) ──────────────────────── */}
      <line x1="513" y1="195" x2="678" y2="195" stroke={THIN}  strokeWidth="1" />

      {/* ── 상단 우측 수평 분리 (x=678–890) ──────────────────────── */}
      <line x1="678" y1="162" x2="890" y2="162" stroke={THIN}  strokeWidth="1" />
      <line x1="778" y1="222" x2="890" y2="222" stroke={THIN}  strokeWidth="1" />
      <line x1="678" y1="248" x2="778" y2="248" stroke={THIN}  strokeWidth="1" />

      {/* ── 좌측 열 수평 격벽 ────────────────────────────────────── */}
      <line x1="92"  y1="375" x2="287" y2="375" stroke={INNER} strokeWidth="1.2" />
      <line x1="92"  y1="460" x2="287" y2="460" stroke={INNER} strokeWidth="1.2" />
      <line x1="155" y1="548" x2="287" y2="548" stroke={INNER} strokeWidth="1.2" />

      {/* 돌출부 내벽 */}
      <line x1="155" y1="348" x2="155" y2="482" stroke={INNER} strokeWidth="1.5" />

      {/* ── 격실 레이블 ──────────────────────────────────────────── */}
      {([
        { x: 204, y: 130, t: '실',     sz: 9  },
        { x: 204, y: 195, t: '실',     sz: 9  },
        { x: 204, y: 258, t: '실',     sz: 9  },
        { x: 304, y: 192, t: '실',     sz: 9  },
        { x: 434, y: 195, t: '계단실 · E/V', sz: 10 },
        { x: 595, y: 145, t: '실',     sz: 9  },
        { x: 595, y: 242, t: '실',     sz: 9  },
        { x: 728, y: 130, t: '실',     sz: 9  },
        { x: 728, y: 208, t: '실',     sz: 9  },
        { x: 728, y: 267, t: '실',     sz: 9  },
        { x: 816, y: 130, t: '실',     sz: 9  },
        { x: 816, y: 195, t: '실',     sz: 9  },
        { x: 872, y: 258, t: '실',     sz: 9  },
        { x: 190, y: 332, t: '실',     sz: 9  },
        { x: 190, y: 418, t: '실',     sz: 9  },
        { x: 190, y: 505, t: '실',     sz: 9  },
        { x: 190, y: 592, t: '실',     sz: 9  },
        { x: 122, y: 415, t: '실',     sz: 8  },
        { x: 590, y: 448, t: '주차구역', sz: 16 },
      ] as { x: number; y: number; t: string; sz: number }[]).map((l, i) => (
        <text
          key={i} x={l.x} y={l.y}
          textAnchor="middle"
          fill={l.t === '주차구역' ? 'rgba(139,148,158,0.4)' : 'rgba(139,148,158,0.45)'}
          fontSize={l.sz}
          fontWeight={l.t === '주차구역' ? 700 : 400}
          fontFamily="Noto Sans KR, sans-serif"
        >
          {l.t}
        </text>
      ))}

      {/* ── 층 표시 ──────────────────────────────────────────────── */}
      <text x="480" y="54" textAnchor="middle"
        fill="rgba(230,237,243,0.45)" fontSize="13" fontWeight="700"
        fontFamily="Noto Sans KR, sans-serif">
        B5 — 지하5층
      </text>
      <text x="480" y="670" textAnchor="middle"
        fill="rgba(139,148,158,0.25)" fontSize="9"
        fontFamily="Noto Sans KR, sans-serif">
        개략도 (원본 도면 기준 추후 정밀화)
      </text>

      {/* ── 소방시설 마커 ─────────────────────────────────────────── */}
      {markers.map(m => {
        const col = MARKER_STATUS_COLOR[m.status]
        const sym = TYPE_SYM[m.type]
        const small = sym.length <= 1
        return (
          <g
            key={m.id}
            transform={`translate(${m.x},${m.y})`}
            onClick={() => onMarkerClick?.(m)}
            style={{ cursor: 'pointer' }}
          >
            <circle r="14" fill={col} opacity="0.18" />
            <circle r="9"  fill={col} opacity="0.9" />
            <circle r="9"  fill="none" stroke={col} strokeWidth="1" opacity="0.5" />
            <text
              x="0" y={small ? 4 : 3}
              textAnchor="middle"
              fill="#fff"
              fontSize={small ? 9 : 7}
              fontWeight="700"
              fontFamily="Noto Sans KR, monospace"
            >
              {sym}
            </text>
          </g>
        )
      })}
    </>
  )
}

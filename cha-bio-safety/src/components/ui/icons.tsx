/**
 * 커스텀 SVG 아이콘 — lucide-react에 없거나, 디자인 시스템 v0.1.1 반복에서
 * 별도로 디자인된 카테고리 아이콘 6종.
 *
 * 표준 카테고리는 lucide-react를 사용 (Cloud, Shield, Car, Zap, BarChart3,
 * Wind, ArrowDownToLine, Waves, Bell, Video 등). 자세한 매핑은
 * docs/design-system.md §7 참조.
 *
 * Props 인터페이스는 lucide-react와 동일 (size, color, style, className,
 * strokeWidth) — 같은 자리에 호환되도록 설계.
 */

import type { CSSProperties, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'color' | 'size'> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  style?: CSSProperties;
  className?: string;
}

const baseStrokeProps = {
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
};

function StrokeSvg({ size = 20, color, strokeWidth = 2, style, className, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      stroke={color ?? 'currentColor'}
      strokeWidth={strokeWidth}
      style={{ flexShrink: 0, ...style }}
      className={className}
      {...baseStrokeProps}
      {...rest}
    >
      {children}
    </svg>
  );
}

/** 특별피난계단 — 솔리드 채움 3단 계단. 각 단 폭 10px (Claude Design 반복 결과). */
export function StairsIcon({ size = 20, color, style, className, ...rest }: IconProps) {
  const fill = color ?? 'currentColor';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="none"
      style={{ flexShrink: 0, ...style }}
      className={className}
      {...rest}
    >
      <rect x={1} y={16} width={10} height={6} rx={1} fill={fill} />
      <rect x={7} y={10} width={10} height={6} rx={1} fill={fill} />
      <rect x={13} y={4} width={10} height={6} rx={1} fill={fill} />
    </svg>
  );
}

/** 방화셔터 — 프레임 + 가로 슬랫 + 하단 아래 화살표. */
export function ShutterIcon(props: IconProps) {
  return (
    <StrokeSvg {...props}>
      <rect x={3} y={2} width={18} height={3} rx={1} />
      <path d="M3 5v16" />
      <path d="M21 5v16" />
      <path d="M5 8h14" />
      <path d="M5 11h14" />
      <path d="M5 14h14" />
      <path d="M9 17v3m-1.5-1.5L9 20l1.5-1.5" />
      <path d="M15 17v3m-1.5-1.5L15 20l1.5-1.5" />
    </StrokeSvg>
  );
}

/** 유도등 — 정사각형 + 우향 화살표 (비상구 표지). 색은 호출 측에서 초록색 권장. */
export function ExitSignIcon(props: IconProps) {
  return (
    <StrokeSvg {...props}>
      <rect x={3} y={3} width={18} height={18} rx={2} />
      <path d="M8 12h8" />
      <path d="M13 8l4 4-4 4" />
    </StrokeSvg>
  );
}

/** 배연창 — 4분할 창문 프레임. */
export function SmokeVentIcon(props: IconProps) {
  return (
    <StrokeSvg {...props}>
      <rect x={3} y={3} width={18} height={18} rx={2} />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </StrokeSvg>
  );
}

/** 소화전 — 사각 프레임 + 코일 호스(이중 원) + 노즐. */
export function HoseReelIcon(props: IconProps) {
  return (
    <StrokeSvg {...props}>
      <rect x={4} y={2} width={16} height={20} />
      <circle cx={12} cy={10} r={4.5} />
      <circle cx={12} cy={10} r={1.5} />
      <path d="M7.5 6v2" />
      <path d="M12 14.5v4" />
      <path d="M10.5 17L12 19.5l1.5-2.5" />
    </StrokeSvg>
  );
}

/** 소화기 — 본체 + 손잡이 + 호스 + 노즐 (lucide의 동명 아이콘 대체용 커스텀). */
export function FireExtinguisherCustom(props: IconProps) {
  return (
    <StrokeSvg {...props}>
      <rect x={8} y={8} width={8} height={13} rx={3} />
      <path d="M10 8V6h4v2" />
      <path d="M13 4V2.5h-2V4" />
      <path d="M14 4h3v3" />
      <path d="M8 11c-2 0-3 1-3 3v3" />
      <path d="M4 17l1 2 1-2" />
      <path d="M9 14h6" />
      <path d="M9 17h6" />
    </StrokeSvg>
  );
}

/** 인승용 엘리베이터 — 본체 프레임 + 중앙 분할선 + 위/아래 방향 화살표 (열림/닫힘 메타포). sketch elevator-sketch.html 라인 595 1:1 추출. strokeWidth 기본 1.8 권장. */
export function ElevatorIcon({ strokeWidth = 1.8, ...props }: IconProps) {
  return (
    <StrokeSvg strokeWidth={strokeWidth} {...props}>
      <rect x={4} y={3} width={16} height={18} rx={1.5} />
      <line x1={12} y1={3} x2={12} y2={21} />
      <polyline points="6.5 9 8 7 9.5 9" />
      <polyline points="14.5 15 16 17 17.5 15" />
      <line x1={8} y1={7} x2={8} y2={11} />
      <line x1={16} y1={13} x2={16} y2={17} />
    </StrokeSvg>
  );
}

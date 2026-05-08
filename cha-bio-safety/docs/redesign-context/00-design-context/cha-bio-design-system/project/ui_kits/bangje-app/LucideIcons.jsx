/* Lucide Icons — SVG React components for 방재 시스템
 * Source: lucide.dev (MIT license)
 * Sizes: 16, 20, 24 only
 * NO JSX FRAGMENTS — compatible with Babel standalone
 */

function _ico(size, color, style, children) {
  // Add keys to array children to suppress React warnings
  if (Array.isArray(children)) {
    children = children.map(function(c, i) {
      return React.cloneElement(c, { key: i });
    });
  }
  return React.createElement('svg', {
    width: size || 20, height: size || 20, viewBox: '0 0 24 24',
    fill: 'none', stroke: color || 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: Object.assign({ flexShrink: 0 }, style || {}),
  }, children);
}

function _p(d) { return React.createElement('path', { d: d }); }
function _c(cx, cy, r) { return React.createElement('circle', { cx: cx, cy: cy, r: r }); }
function _r(x, y, w, h, rx) { return React.createElement('rect', { x: x, y: y, width: w, height: h, rx: rx }); }
function _l(x1, y1, x2, y2) { return React.createElement('line', { x1: x1, y1: y1, x2: x2, y2: y2 }); }
function _pl(pts) { return React.createElement('polyline', { points: pts }); }

// ── Status / Result icons ──
function CheckCircle2({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z'),
    _p('m9 12 2 2 4-4'),
  ]);
}
function AlertTriangle({ size, color, style }) {
  return _ico(size, color, style, [
    _p('m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'),
    _p('M12 9v4'),
    _p('M12 17h.01'),
  ]);
}
function XCircle({ size, color, style }) {
  return _ico(size, color, style, [
    _c(12, 12, 10),
    _p('m15 9-6 6'),
    _p('m9 9 6 6'),
  ]);
}
function Wrench({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'),
  ]);
}
function HelpCircle({ size, color, style }) {
  return _ico(size, color, style, [
    _c(12, 12, 10),
    _p('M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'),
    _p('M12 17h.01'),
  ]);
}
function Flame({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'),
  ]);
}

// ── Category icons ──
// 특별피난계단 — 3 solid wide steps
function StairsIcon({ size, color, style }) {
  return React.createElement('svg', {
    width: size || 20, height: size || 20, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'none',
    style: Object.assign({ flexShrink: 0 }, style || {}),
  },
    React.createElement('rect', { key: 0, x: 1, y: 16, width: 10, height: 6, rx: 1, fill: color || 'currentColor' }),
    React.createElement('rect', { key: 1, x: 7, y: 10, width: 10, height: 6, rx: 1, fill: color || 'currentColor' }),
    React.createElement('rect', { key: 2, x: 13, y: 4, width: 10, height: 6, rx: 1, fill: color || 'currentColor' })
  );
}
function Cloud({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'),
  ]);
}
function Shield({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'),
  ]);
}
function Car({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2'),
    _c(7, 17, 2),
    _p('M9 17h6'),
    _c(17, 17, 2),
  ]);
}
function Zap({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'),
  ]);
}
// 방화셔터 — rolling shutter with slats + down arrows
function ShutterIcon({ size, color, style }) {
  return _ico(size, color, style, [
    _r(3, 2, 18, 3, 1),
    _p('M3 5v16'),
    _p('M21 5v16'),
    _p('M5 8h14'),
    _p('M5 11h14'),
    _p('M5 14h14'),
    _p('M9 17v3m-1.5-1.5L9 20l1.5-1.5'),
    _p('M15 17v3m-1.5-1.5L15 20l1.5-1.5'),
  ]);
}
function BarChart3({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M3 3v18h18'),
    _p('M18 17V9'),
    _p('M13 17V5'),
    _p('M8 17v-3'),
  ]);
}
function Wind({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2'),
    _p('M9.6 4.6A2 2 0 1 1 11 8H2'),
    _p('M12.6 19.4A2 2 0 1 0 14 16H2'),
  ]);
}
// 유도등 — green square with right arrow (exit light)
function ExitSignIcon({ size, color, style }) {
  return _ico(size, color, style, [
    _r(3, 3, 18, 18, 2),
    _p('M8 12h8'),
    _p('M13 8l4 4-4 4'),
  ]);
}
// 배연창 — window frame (4-pane window)
function SmokeVentIcon({ size, color, style }) {
  return _ico(size, color, style, [
    _r(3, 3, 18, 18, 2),
    _p('M3 12h18'),
    _p('M12 3v18'),
  ]);
}
function ArrowDownToLine({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M12 17V3'),
    _p('m6 11 6 6 6-6'),
    _p('M19 21H5'),
  ]);
}
// 소화전 — fire hose reel cabinet
function HoseReelIcon({ size, color, style }) {
  return _ico(size, color, style, [
    _r(4, 2, 16, 20, 0),
    _c(12, 10, 4.5),
    _c(12, 10, 1.5),
    _p('M7.5 6v2'),
    _p('M12 14.5v4'),
    _p('M10.5 17L12 19.5l1.5-2.5'),
  ]);
}
function Waves({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'),
    _p('M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'),
    _p('M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'),
  ]);
}
function Bell({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'),
    _p('M10.3 21a1.94 1.94 0 0 0 3.4 0'),
  ]);
}
function Video({ size, color, style }) {
  return _ico(size, color, style, [
    _p('m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5'),
    _r(2, 6, 14, 12, 2),
  ]);
}

// ── Navigation / Tool icons ──
// 도면 점검 — folded map
function MapPinIcon({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z'),
    _p('M15 5.764v15'),
    _p('M9 3.236v15'),
  ]);
}
function TrendingUp({ size, color, style }) {
  return _ico(size, color, style, [
    _pl('22 7 13.5 15.5 8.5 10.5 2 17'),
    _pl('16 7 22 7 22 13'),
  ]);
}
function Siren({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M7 18v-6a5 5 0 1 1 10 0v6'),
    _p('M5 21a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1z'),
    _p('M21 12h1'),
    _p('M18.5 4.5 18 5'),
    _p('M2 12h1'),
    _p('M12 2v1'),
    _p('M4.929 4.929l.707.707'),
  ]);
}
function Users({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'),
    _c(9, 7, 4),
    _p('M22 21v-2a4 4 0 0 0-3-3.87'),
    _p('M16 3.13a4 4 0 0 1 0 7.75'),
  ]);
}
function LayoutDashboard({ size, color, style }) {
  return _ico(size, color, style, [
    _r(3, 3, 7, 9, 1),
    _r(14, 3, 7, 5, 1),
    _r(14, 12, 7, 9, 1),
    _r(3, 16, 7, 5, 1),
  ]);
}
function ClipboardList({ size, color, style }) {
  return _ico(size, color, style, [
    _r(8, 2, 8, 4, 1),
    _p('M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'),
    _p('M12 11h4'),
    _p('M12 16h4'),
    _p('M8 11h.01'),
    _p('M8 16h.01'),
  ]);
}
function Calendar({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M8 2v4'),
    _p('M16 2v4'),
    _r(3, 4, 18, 18, 2),
    _p('M3 10h18'),
  ]);
}
function MenuIcon({ size, color, style }) {
  return _ico(size, color, style, [
    _l(4, 12, 20, 12),
    _l(4, 6, 20, 6),
    _l(4, 18, 20, 18),
  ]);
}
function Camera({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z'),
    _c(12, 13, 3),
  ]);
}
function FlaskConical({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2'),
    _p('M8.5 2h7'),
    _p('M7 16h10'),
  ]);
}
function Building2({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z'),
    _p('M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2'),
    _p('M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2'),
    _p('M10 6h4'),
    _p('M10 10h4'),
    _p('M10 14h4'),
    _p('M10 18h4'),
  ]);
}
function TrainFront({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M8 3.1V7a4 4 0 0 0 8 0V3.1'),
    _p('m9 15-1-1'),
    _p('m15 15 1-1'),
    _p('M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z'),
    _p('m8 19-2 3'),
    _p('m16 19 2 3'),
  ]);
}
function ChevronLeft({ size, color, style }) {
  return _ico(size, color, style, [
    _p('m15 18-6-6 6-6'),
  ]);
}
function Search({ size, color, style }) {
  return _ico(size, color, style, [
    _c(11, 11, 8),
    _p('m21 21-4.3-4.3'),
  ]);
}
function Settings({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'),
    _c(12, 12, 3),
  ]);
}
// 소화기 — fire extinguisher with handle + hose
function FireExtinguisher({ size, color, style }) {
  return _ico(size, color, style, [
    _r(8, 8, 8, 13, 3),
    _p('M10 8V6h4v2'),
    _p('M13 4V2.5h-2V4'),
    _p('M14 4h3v3'),
    _p('M8 11c-2 0-3 1-3 3v3'),
    _p('M4 17l1 2 1-2'),
    _p('M9 14h6'),
    _p('M9 17h6'),
  ]);
}

// Eye / EyeOff for password toggle
function Eye({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0'),
    _c(12, 12, 3),
  ]);
}
function EyeOff({ size, color, style }) {
  return _ico(size, color, style, [
    _p('M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49'),
    _p('M14.084 14.158a3 3 0 0 1-4.242-4.242'),
    _p('M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143'),
    _p('M2 2l20 20'),
  ]);
}

Object.assign(window, {
  CheckCircle2, AlertTriangle, XCircle, Wrench, HelpCircle, Flame,
  StairsIcon, Cloud, Shield, Car, Zap, ShutterIcon, BarChart3, Wind,
  ExitSignIcon, SmokeVentIcon, ArrowDownToLine, HoseReelIcon, Waves, Bell, Video,
  MapPinIcon, TrendingUp, Siren, Users, LayoutDashboard, ClipboardList, Calendar,
  MenuIcon, Camera, FlaskConical, Building2, TrainFront, ChevronLeft,
  Search, Settings, FireExtinguisher, Eye, EyeOff,
});

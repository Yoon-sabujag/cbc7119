// Phase 25: 화재수신반 라이브 프레임 신선도 라벨 헬퍼.
// frameUpdatedAt / lastHeartbeatAt 는 KST wall-clock 문자열 'YYYY-MM-DD HH:MM:SS'.

// KST wall-clock 문자열을 epoch ms 로 파싱 (로컬 wall time 취급). NaN -> null.
export function parseKst(s: string | null): number | null {
  if (!s) return null
  const ms = new Date(s.replace(' ', 'T')).getTime()
  return Number.isNaN(ms) ? null : ms
}

// 라이브 프레임 신선도: null/지연 -> 'stale', 10초 미만 -> '방금', 60초 미만 -> 'N초 전'.
export function freshnessLabel(
  frameUpdatedAt: string | null,
  nowMs: number = Date.now(),
): { label: string; tone: 'ok' | 'stale' } {
  const parsed = parseKst(frameUpdatedAt)
  if (parsed === null) return { label: '지연', tone: 'stale' }
  const diff = (nowMs - parsed) / 1000
  if (diff < 10) return { label: '방금', tone: 'ok' }
  if (diff < 60) return { label: `${Math.round(diff)}초 전`, tone: 'ok' }
  return { label: '지연', tone: 'stale' }
}

// 워치독: 마지막 신호가 180초(3분) 초과면 모니터링 중단 경고 문구, 아니면 null.
export function watchdogLabel(
  lastSeenAt: string | null,
  nowMs: number = Date.now(),
): string | null {
  const parsed = parseKst(lastSeenAt)
  if (parsed === null) return null
  const diffMs = nowMs - parsed
  if (diffMs <= 180000) return null
  const mins = Math.round(diffMs / 60000)
  return `수신반 모니터링 중단 · 마지막 신호 ${mins}분 전`
}

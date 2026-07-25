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

// 캡처 신호 생존 판정 — LIVE 배지/'정상' 초록 표기는 이 게이트를 통과해야 한다.
// 260726 실측: 캡처보드 USB 를 뽑아 기아 859초인 동안에도 대시보드·수신반 페인은 초록 LIVE/'정상' 이었다 —
// 배지가 경보 유무만 보고 캡처 생사를 안 봤기 때문 ("화면은 초록인데 감시는 죽어 있다" 의 화면 잔재).
// status 미로딩(null)은 판정 보류(null 반환) — 로딩 깜빡임에 회색을 내지 않는다.
// 반환 = 죽음 사유 라벨(회색 표기용) 또는 null(정상).
export function liveSignalDown(
  status: { agentOnline?: boolean; frameStarvedSec?: number | null; frameUpdatedAt?: string | null } | null | undefined,
  nowMs: number = Date.now(),
): string | null {
  if (!status) return null
  if (status.agentOnline === false) return '연결 끊김'         // 하트비트 3분+ 두절 (에이전트 사망)
  if ((status.frameStarvedSec ?? 0) >= 30) return '신호 없음'  // 캡처 기아 — 워치독 starved 와 동일 임계
  if (freshnessLabel(status.frameUpdatedAt ?? null, nowMs).tone === 'stale') return '지연'  // 업로드 두절
  return null
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

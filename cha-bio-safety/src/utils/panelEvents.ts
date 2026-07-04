// 화재수신반 이벤트 병합 헬퍼 (260704-0xr)
// 자동감지(panel_alarms → alarmApi) + 수동기록(fire_alarm_records → fireAlarmApi) 을
// 시각 하나로 정규화·병합. 백엔드(functions/) 무변경 — 기존 엔드포인트만 소비.
import { fireAlarmApi, type Alarm } from './api'
import { useQuery } from '@tanstack/react-query'

// 정규화 이벤트 아이템 — time 은 'YYYY-MM-DD HH:MM:SS' 고정폭 문자열(문자열 비교=시간 비교).
export interface PanelEventItem {
  id: string
  kind: 'fire' | 'equip' | 'fault'
  time: string
  location: string | null
  cause: string | null
  source: 'auto' | 'manual'
  snapshotUrl: string | null
}

// 종류칩 매핑 (InspectionPage badge2 / panelBadge2 와 동일).
export const KIND_BADGE: Record<PanelEventItem['kind'], { label: string; cls: string }> = {
  fire:  { label: '화재',     cls: 'text-danger bg-danger-bg' },
  equip: { label: '설비동작', cls: 'text-safe bg-safe-bg' },
  fault: { label: '고장',     cls: 'text-warning bg-warning-bg' },
}

// 자동감지(panel_alarms) → PanelEventItem
function normalizeAuto(alarms: Alarm[]): PanelEventItem[] {
  return (alarms ?? []).map(a => ({
    id: a.id,
    kind: a.type,
    time: a.detectedAt,
    location: a.location ?? null,
    cause: a.cause ?? null,
    source: 'auto' as const,
    snapshotUrl: a.snapshotUrl ?? null,
  }))
}

// 수동기록(fire_alarm_records) → PanelEventItem
// created_by === 'panel-agent' 는 자동초안(panel_alarms 와 중복)이므로 제외.
// 화재수신반 수동기록은 fire/non_fire 모두 화재수신반=화재로 취급(kind:'fire').
function normalizeManual(records: any[]): PanelEventItem[] {
  return (records ?? [])
    .filter(r => r.created_by !== 'panel-agent')
    .map(r => ({
      id: r.id,
      kind: 'fire' as const,
      time: r.occurred_at,
      location: r.location ?? null,
      cause: r.cause ?? null,
      source: 'manual' as const,
      snapshotUrl: null,
    }))
}

// 자동 + 수동 병합 → time 문자열 내림차순 (고정폭 포맷이라 localeCompare 로 정확).
export function mergePanelEvents(auto: Alarm[], manual: any[]): PanelEventItem[] {
  return [...normalizeAuto(auto), ...normalizeManual(manual)]
    .sort((a, b) => b.time.localeCompare(a.time))
}

// KST wall-clock 'YYYY-MM-DD HH:MM:SS' — 브라우저 로컬 tz 무관(Date epoch 산술 함정 회피).
export function kstStr(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d)
  const g = (t: string) => parts.find(p => p.type === t)?.value ?? ''
  return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}:${g('second')}`
}

// 카드용 훅 — 자동감지(인자)와 수동기록(연도 쿼리)을 병합해 최근 windowHours 창만 반환.
export function useRecentPanelEvents(autoEvents: Alarm[], windowHours = 48): PanelEventItem[] {
  const nowStr = kstStr(new Date())
  const y = Number(nowStr.slice(0, 4))
  // 연말경계: 1/1~1/2 면 windowHours(48h) 창이 전년으로 넘어감.
  const needPrev = nowStr.slice(5, 7) === '01' && Number(nowStr.slice(8, 10)) <= 2

  const cur = useQuery({
    queryKey: ['fire-alarm-year', y],
    queryFn: async () => { try { return await fireAlarmApi.getByYear(y) } catch { return [] as any[] } },
    staleTime: 30_000,
  })
  // enabled 로 훅 순서 고정 — 조건부 호출 아님.
  const prev = useQuery({
    queryKey: ['fire-alarm-year', y - 1],
    queryFn: async () => { try { return await fireAlarmApi.getByYear(y - 1) } catch { return [] as any[] } },
    enabled: needPrev,
    staleTime: 30_000,
  })

  const manual = [...(cur.data ?? []), ...(needPrev ? (prev.data ?? []) : [])]
  const cutoff = kstStr(new Date(Date.now() - windowHours * 3600_000))
  return mergePanelEvents(autoEvents, manual).filter(e => e.time >= cutoff)
}

// panel_alarms row → 계약(§1.6) camelCase 매핑 + 공용 상수/헬퍼.

const NANOID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export function nanoid(n = 16): string {
  const a = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(a, b => NANOID_CHARS[b % NANOID_CHARS.length]).join('')
}

// 단일 수신반 고정 위치 라벨 — panel_alarms 에 location 컬럼이 없어 계약 §1.6/§1.4 location 필드를 채운다.
export const LOCATION_LABEL = '방재실 화재수신반'

export interface AlarmRow {
  id: string
  type: 'fire' | 'equip' | 'fault'
  status: 'active' | 'acked' | 'cleared' | 'suppressed'
  detected_at: string
  source: string | null
  confidence: number | null
  red_ratio: number | null
  green_ratio: number | null
  snapshot_key: string | null
  location: string | null
  acked_by: string | null
  acked_at: string | null
  push_count: number
  next_push_at: number | null
  cleared_at: string | null
  cleared_reason: string | null
  draft_record_id: string | null
  created_at: string
}

// 전체 Alarm (§1.6) — 칩·풀스크린·이벤트 이력용.
export function mapAlarm(r: AlarmRow) {
  return {
    id: r.id,
    type: r.type,
    status: r.status,
    detectedAt: r.detected_at,
    location: r.location ?? LOCATION_LABEL,
    source: r.source,
    confidence: r.confidence,
    snapshotUrl: r.snapshot_key ? `/api/public/panel/${r.snapshot_key}.jpg` : null,
    ackedBy: r.acked_by,
    ackedAt: r.acked_at,
    clearedReason: r.cleared_reason,
    draftRecordId: r.draft_record_id,
  }
}

// AlarmSummary (§1.6) — status.activeAlarm 용. location 은 고정 상수.
export function mapAlarmSummary(r: AlarmRow) {
  return { id: r.id, type: r.type, detectedAt: r.detected_at, location: r.location ?? LOCATION_LABEL }
}

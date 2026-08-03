// panel_alarms row → 계약(§1.6) camelCase 매핑 + 공용 상수/헬퍼.

const NANOID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export function nanoid(n = 16): string {
  const a = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(a, b => NANOID_CHARS[b % NANOID_CHARS.length]).join('')
}

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
  // ── 0096 신규(전부 null 가능. 구 경보 행은 전부 null 이다) ──
  yellow_ratio?: number | null    // fault 판정 근거
  ocr_raw?: string | null
  ocr_score?: number | null       // legacy 폴백이면 null (0 아님 — 0 은 '매칭 완전 실패'라는 다른 사실)
  ocr_confidence?: string | null  // high|low|none  ※ 기존 confidence(색 신뢰도 0..1)와 다른 것
  ocr_method?: string | null      // exact|prefix|fuzzy|legacy|empty
  ocr_ms?: number | null
  ocr_lines?: string | null       // JSON {"badge":[...],"wide":[...]}
  confirmed?: number | null       // 0103 신규: 영상+오디오 교차-source 확정 여부(0=미확정, 1=확정)
}

// ocr_lines 는 {"badge":[...],"wide":[...]} JSON. 파싱 실패해도 화면을 죽이지 않는다.
function safeLines(s: string | null | undefined): { badge: string[]; wide: string[] } {
  if (!s) return { badge: [], wide: [] }
  try {
    const o = JSON.parse(s)
    return { badge: Array.isArray(o?.badge) ? o.badge : [], wide: Array.isArray(o?.wide) ? o.wide : [] }
  } catch { return { badge: [], wide: [] } }
}

// 전체 Alarm (§1.6) — 칩·풀스크린·이벤트 이력용. 필드 추가만 하므로 기존 소비처는 무영향.
export function mapAlarm(r: AlarmRow) {
  return {
    id: r.id,
    type: r.type,
    status: r.status,
    detectedAt: r.detected_at,
    location: r.location,
    source: r.source,
    confidence: r.confidence,
    snapshotUrl: r.snapshot_key ? `/api/public/panel/${r.snapshot_key}.jpg` : null,
    snapshotKey: r.snapshot_key ?? null,
    ackedBy: r.acked_by,
    ackedAt: r.acked_at,
    clearedReason: r.cleared_reason,
    draftRecordId: r.draft_record_id,
    // ── 0096 신규 (MONITORING-SPEC.md §3.7) ──
    pushCount: r.push_count ?? 0,
    redRatio: r.red_ratio,
    greenRatio: r.green_ratio,
    yellowRatio: r.yellow_ratio ?? null,
    ocr: {
      raw: r.ocr_raw ?? null,
      score: r.ocr_score ?? null,
      confidence: r.ocr_confidence ?? null,   // high|low|none|null
      method: r.ocr_method ?? null,           // exact|prefix|fuzzy|legacy|empty|null
      ms: r.ocr_ms ?? null,
      lines: safeLines(r.ocr_lines),          // { badge: string[], wide: string[] }
    },
    // ── 0103 신규 ──
    confirmed: r.confirmed ?? 0,
  }
}

// AlarmSummary (§1.6) — status.activeAlarm 용. location 은 팝업 위치(null 가능).
export function mapAlarmSummary(r: AlarmRow) {
  return { id: r.id, type: r.type, detectedAt: r.detected_at, location: r.location }
}

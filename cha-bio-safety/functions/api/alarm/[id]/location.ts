import type { Env } from '../../../_middleware'
import { assertAgentKey } from '../../../_lib/agent'
import { mapAlarm, type AlarmRow } from '../../../_lib/alarm'

// POST /api/alarm/:id/location — 에이전트 OCR 완료 후 위치/증거 patch
// (push-first: 트리거 시 location=null → 이후 채움). X-Agent-Key 인증 (_middleware PUBLIC_PATTERN 로 JWT 예외).
// 계약 SSOT: panel-agent/MONITORING-SPEC.md §3.2 (INV-1 / C1)
//
// ★★ C1 — 절대 규칙: body 에 'location' 키가 **없으면** UPDATE 문에서 location 컬럼을 **제외**한다.
//    COALESCE 가 아니다 — COALESCE 는 "키가 있고 값이 null"(수동 정정으로 위치를 비우는 경로)까지 무시한다.
//
//    발동 경로(전부 실제 코드 경로):
//      화재 경보 active(위치 확보) → 에이전트 재시작 → detector state 리셋 → 수신반 팝업은 화면에 그대로 →
//      재감지 → trigger.ts dedupe 가 기존 alarmId 반환 → 재OCR 이 low/none → 증거 전용 patch →
//      (구 코드) location=null 무조건 덮어쓰기 → 대응자에게 표시되던 화재 위치가 지워진다.
//
//    ※ 키가 있고 값이 명시적으로 null/'' 인 경우에만 지우기를 허용한다(수동 정정 여지).
//    ※ 증거 컬럼(raw/score/confidence/method/ocrMs/lines)은 confidence 가 low/none 이어도 항상 저장한다.
//       "왜 위치가 비었나" 에 답할 수 있는 유일한 근거다.
//    ※ 서버는 location 을 절대 스스로 추론하지 않는다. high-only 게이팅은 에이전트 단독 책임.
export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const bad = assertAgentKey(request, env)
  if (bad) return bad
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  try {
    const body = await request.json<{
      location?: string | null
      raw?: string | null
      score?: number | null
      confidence?: string | null        // high|low|none
      method?: string | null            // exact|prefix|fuzzy|legacy|empty
      ocrMs?: number | null
      badgeLines?: string[] | null
      wideLines?: string[] | null
      snapshotKey?: string | null
    }>().catch(() => ({} as Record<string, never>))

    const row = await env.DB.prepare('SELECT * FROM panel_alarms WHERE id = ?').bind(id).first<AlarmRow>()
    if (!row) return Response.json({ success: false, error: '경보를 찾을 수 없습니다' }, { status: 404 })

    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
    const str = (v: unknown) => (typeof v === 'string' && v.length > 0 ? v : null)

    const sets: string[] = []
    const vals: unknown[] = []

    // ★ 핵심(C1): 'location' 키가 body 에 존재할 때만 컬럼을 건드린다.
    if (Object.prototype.hasOwnProperty.call(body, 'location')) {
      const loc = typeof body.location === 'string' ? body.location.trim() : null
      sets.push('location = ?'); vals.push(loc || null)
    }

    // 증거 컬럼 — 있는 것만 UPDATE (없는 필드로 기존 증거를 지우지 않는다).
    if ('raw' in body)         { sets.push('ocr_raw = ?');        vals.push(str(body.raw)) }
    if ('score' in body)       { sets.push('ocr_score = ?');      vals.push(num(body.score)) }
    if ('confidence' in body)  { sets.push('ocr_confidence = ?'); vals.push(str(body.confidence)) }
    if ('method' in body)      { sets.push('ocr_method = ?');     vals.push(str(body.method)) }
    if ('ocrMs' in body)       { sets.push('ocr_ms = ?');         vals.push(num(body.ocrMs)) }
    if ('snapshotKey' in body) { sets.push('snapshot_key = ?');   vals.push(str(body.snapshotKey)) }

    // ocr_lines 는 D1 한 컬럼 → 두 배열을 JSON 객체로 못박는다(§4.1/S5 — 화면이 badge/wide 를 구분해 렌더).
    if ('badgeLines' in body || 'wideLines' in body) {
      const badge = Array.isArray(body.badgeLines) ? body.badgeLines.slice(0, 8) : []
      const wide  = Array.isArray(body.wideLines)  ? body.wideLines.slice(0, 8)  : []
      sets.push('ocr_lines = ?'); vals.push(JSON.stringify({ badge, wide }))
    }

    if (sets.length > 0) {
      vals.push(id)
      await env.DB.prepare(`UPDATE panel_alarms SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
    }

    const updated = await env.DB.prepare('SELECT * FROM panel_alarms WHERE id = ?').bind(id).first<AlarmRow>()
    return Response.json({ success: true, data: updated ? mapAlarm(updated) : null })
  } catch (e) {
    console.error('alarm/location error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

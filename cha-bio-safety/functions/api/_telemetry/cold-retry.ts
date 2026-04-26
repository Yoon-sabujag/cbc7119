// 클라이언트 측 일시 실패 (cold-retry, json-parse-fail) 누적 endpoint.
// fire-and-forget — 어떤 실패도 200 으로 응답해서 클라이언트 흐름 막지 않음.
// public route — middleware PUBLIC_PREFIX '/api/_telemetry/' 등록 필요.

interface Env {
  DB: D1Database
}

interface TelemetryPayload {
  ts:          string
  event_type:  string
  path?:       string
  status?:     number | null
  staff_id?:   string | null
  user_agent?: string | null
  detail?:     string | null
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as Partial<TelemetryPayload>
    if (!body?.ts || !body?.event_type) {
      // 잘못된 payload 도 200 으로 (클라이언트가 retry 안 하도록)
      return json({ success: false, error: 'invalid payload' }, 200)
    }
    await env.DB.prepare(
      `INSERT INTO telemetry_events (ts, event_type, path, status, staff_id, user_agent, detail)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      String(body.ts).slice(0, 64),
      String(body.event_type).slice(0, 64),
      body.path        ? String(body.path).slice(0, 256)        : null,
      typeof body.status === 'number' ? body.status              : null,
      body.staff_id    ? String(body.staff_id).slice(0, 64)     : null,
      body.user_agent  ? String(body.user_agent).slice(0, 512)  : null,
      body.detail      ? String(body.detail).slice(0, 1024)     : null,
    ).run()
    return json({ success: true }, 200)
  } catch {
    // DB 실패도 200 — telemetry 가 사용자 흐름을 막으면 안 됨
    return json({ success: false }, 200)
  }
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

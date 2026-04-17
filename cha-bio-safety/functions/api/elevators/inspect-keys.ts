import type { Env } from '../../_middleware'

// 민원24 검사조회 키 CRUD
// GET  /api/elevators/inspect-keys — 전체 목록
// POST /api/elevators/inspect-keys — 키 추가/갱신 (body: { keys: [{cstmr, recptn, label?}] })

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    'SELECT cstmr, recptn, label FROM koelsa_inspect_keys ORDER BY id'
  ).all<{ cstmr: string; recptn: string; label: string | null }>()

  return Response.json({ success: true, data: results ?? [] })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json() as { keys: { cstmr: string; recptn: string; label?: string }[] }
  if (!body.keys || !Array.isArray(body.keys)) {
    return Response.json({ success: false, error: 'keys 배열 필수' }, { status: 400 })
  }

  // 기존 키 삭제 후 새로 삽입 (전체 교체)
  await env.DB.prepare('DELETE FROM koelsa_inspect_keys').run()

  for (const k of body.keys) {
    if (k.cstmr.length !== 13 || k.recptn.length !== 17) continue
    await env.DB.prepare(
      `INSERT INTO koelsa_inspect_keys (cstmr, recptn, label) VALUES (?, ?, ?)
       ON CONFLICT(cstmr, recptn) DO UPDATE SET label=excluded.label`
    ).bind(k.cstmr, k.recptn, k.label ?? null).run()
  }

  const { results } = await env.DB.prepare(
    'SELECT cstmr, recptn, label FROM koelsa_inspect_keys ORDER BY id'
  ).all()

  return Response.json({ success: true, data: results ?? [] })
}

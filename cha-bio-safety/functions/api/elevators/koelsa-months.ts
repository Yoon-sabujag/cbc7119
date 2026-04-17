import type { Env } from '../../_middleware'

// GET /api/elevators/koelsa-months — DB 캐시에서 데이터 있는 월 목록 반환
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    'SELECT DISTINCT yyyymm FROM koelsa_self_checks ORDER BY yyyymm DESC'
  ).all<{ yyyymm: string }>()

  return Response.json({ success: true, data: (results ?? []).map(r => r.yyyymm) })
}

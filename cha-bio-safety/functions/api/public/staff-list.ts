// GET /api/public/staff-list — 로그인 페이지용 활성 직원 목록 (인증 불필요, 최소 정보만)
export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({ env }) => {
  const rows = await env.DB.prepare(
    `SELECT id, name, role, title FROM staff WHERE active = 1 ORDER BY
      CASE role WHEN 'admin' THEN 0 ELSE 1 END,
      created_at ASC`
  ).all<{ id: string; name: string; role: string; title: string }>()

  return Response.json({ success: true, data: rows.results ?? [] })
}

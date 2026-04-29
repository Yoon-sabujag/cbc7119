// POST /api/extinguishers/:id/unassign — 자산을 위치에서 분리 (status='active' 유지, idempotent)
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ params, env }) => {
  try {
    const id = parseInt(params.id as string, 10)
    if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 ID' }, { status:400 })

    const ext = await env.DB.prepare('SELECT id, check_point_id, status FROM extinguishers WHERE id=?')
      .bind(id).first<{ id:number; check_point_id:string|null; status:string }>()
    if (!ext) return Response.json({ success:false, error:'자산 없음' }, { status:404 })
    if (ext.check_point_id == null) return Response.json({ success:true, data:{ noop:true } })

    await env.DB.prepare("UPDATE extinguishers SET check_point_id=NULL, updated_at=datetime('now','+9 hours') WHERE id=?")
      .bind(id).run()
    return Response.json({ success:true })
  } catch (e) {
    console.error('extinguisher unassign error:', e)
    return Response.json({ success:false, error:'서버 오류가 발생했습니다' }, { status:500 })
  }
}

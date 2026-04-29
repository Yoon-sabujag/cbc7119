// POST /api/extinguishers/:id/dispose — 폐기 처리 (status='폐기' + check_point_id=NULL)
// idempotent: 이미 폐기 상태면 noop 응답.
// 절대 금지: check_records 는 어떤 분기에서도 DELETE 하지 않는다 (점검 기록 보존 원칙).
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ params, env }) => {
  try {
    const id = parseInt(params.id as string, 10)
    if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 ID' }, { status:400 })

    const ext = await env.DB.prepare('SELECT id, status FROM extinguishers WHERE id=?')
      .bind(id).first<{ id:number; status:string }>()
    if (!ext) return Response.json({ success:false, error:'자산 없음' }, { status:404 })
    if (ext.status === '폐기') return Response.json({ success:true, data:{ noop:true } })

    await env.DB.prepare("UPDATE extinguishers SET status='폐기', check_point_id=NULL, updated_at=datetime('now','+9 hours') WHERE id=?")
      .bind(id).run()
    return Response.json({ success:true })
  } catch (e) {
    console.error('extinguisher dispose error:', e)
    return Response.json({ success:false, error:'서버 오류가 발생했습니다' }, { status:500 })
  }
}

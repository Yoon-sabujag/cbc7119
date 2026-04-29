// POST /api/extinguishers/:id/assign — 자산을 위치(check_point_id)에 매핑
// 가드: 폐기 자산 X, 이미 매핑된 자산 X, 대상 위치에 active 자산 X (충돌 시 409 + hint:'swap')
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  try {
    const id = parseInt(params.id as string, 10)
    if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 자산 ID' }, { status:400 })

    const { check_point_id } = await request.json<{ check_point_id: string }>()
    if (!check_point_id) return Response.json({ success:false, error:'check_point_id 필수' }, { status:400 })

    const ext = await env.DB.prepare('SELECT id, check_point_id, status FROM extinguishers WHERE id=?')
      .bind(id).first<{ id:number; check_point_id:string|null; status:string }>()
    if (!ext) return Response.json({ success:false, error:'자산 없음' }, { status:404 })
    if (ext.status === '폐기') return Response.json({ success:false, error:'폐기된 자산은 매핑할 수 없습니다' }, { status:409 })
    if (ext.check_point_id) return Response.json({ success:false, error:'이미 매핑된 자산입니다 — 먼저 분리하세요' }, { status:409 })

    const occupant = await env.DB.prepare(
      "SELECT id FROM extinguishers WHERE check_point_id=? AND status='active'"
    ).bind(check_point_id).first<{ id:number }>()
    if (occupant) {
      return Response.json({
        success:false,
        error:'해당 위치에 이미 매핑된 자산이 있습니다',
        data: { occupantId: occupant.id, hint: 'swap' }
      }, { status:409 })
    }

    const cp = await env.DB.prepare('SELECT id FROM check_points WHERE id=? AND is_active=1').bind(check_point_id).first()
    if (!cp) return Response.json({ success:false, error:'점검 개소 없음' }, { status:404 })

    await env.DB.prepare("UPDATE extinguishers SET check_point_id=?, updated_at=datetime('now','+9 hours') WHERE id=?")
      .bind(check_point_id, id).run()

    return Response.json({ success:true })
  } catch (e) {
    console.error('extinguisher assign error:', e)
    return Response.json({ success:false, error:'서버 오류가 발생했습니다' }, { status:500 })
  }
}

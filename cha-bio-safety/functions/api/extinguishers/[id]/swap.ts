// POST /api/extinguishers/:id/swap — 두 자산의 check_point_id 를 atomic 하게 교환
// body: { other_extinguisher_id: number }
// D1 batch 사용 — 한 statement 실패 시 전체 롤백 (Cloudflare 공식 트랜잭션 의미론).
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  try {
    const id = parseInt(params.id as string, 10)
    const { other_extinguisher_id } = await request.json<{ other_extinguisher_id: number }>()
    if (!Number.isFinite(id) || !Number.isFinite(other_extinguisher_id))
      return Response.json({ success:false, error:'잘못된 ID' }, { status:400 })
    if (id === other_extinguisher_id)
      return Response.json({ success:false, error:'동일 자산입니다' }, { status:400 })

    const a = await env.DB.prepare('SELECT id, check_point_id, status FROM extinguishers WHERE id=?')
      .bind(id).first<{ id:number; check_point_id:string|null; status:string }>()
    const b = await env.DB.prepare('SELECT id, check_point_id, status FROM extinguishers WHERE id=?')
      .bind(other_extinguisher_id).first<{ id:number; check_point_id:string|null; status:string }>()
    if (!a || !b) return Response.json({ success:false, error:'자산을 찾을 수 없음' }, { status:404 })
    if (a.status !== 'active' || b.status !== 'active')
      return Response.json({ success:false, error:'폐기된 자산은 스왑할 수 없습니다' }, { status:409 })
    if (!a.check_point_id || !b.check_point_id)
      return Response.json({ success:false, error:'두 자산 모두 매핑된 상태여야 합니다' }, { status:409 })

    await env.DB.batch([
      env.DB.prepare("UPDATE extinguishers SET check_point_id=?, updated_at=datetime('now','+9 hours') WHERE id=?")
        .bind(b.check_point_id, a.id),
      env.DB.prepare("UPDATE extinguishers SET check_point_id=?, updated_at=datetime('now','+9 hours') WHERE id=?")
        .bind(a.check_point_id, b.id),
    ])

    return Response.json({ success:true })
  } catch (e) {
    console.error('extinguisher swap error:', e)
    return Response.json({ success:false, error:'서버 오류가 발생했습니다' }, { status:500 })
  }
}

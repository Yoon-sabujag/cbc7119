// PUT /api/extinguishers/:id — 정보 수정 (변경 필드 ≤ 3 검증)
// DELETE /api/extinguishers/:id — hard delete (가드: 미매핑 + 미점검)
//
// ≤3 룰: 사용자가 완전히 다른 자산을 같은 행에 덮어쓰는 사고 방지.
// 4개 이상 변경은 "다른 자산" 으로 간주 → 폐기+신규 등록 동선 유도.
//
// 절대 금지: check_records 는 어떤 분기에서도 DELETE 하지 않는다 (점검 기록 보존 원칙).
import type { Env } from '../../_middleware'

const EDITABLE_FIELDS = ['type','prefix_code','seal_no','serial_no','approval_no','manufactured_at','manufacturer'] as const
type Editable = typeof EDITABLE_FIELDS[number]
const norm = (v: any) => (v === '' || v === undefined) ? null : v

export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  try {
    const id = parseInt(params.id as string, 10)
    if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 ID' }, { status:400 })

    const body = await request.json<Partial<Record<Editable, string|null>>>()
    const existing = await env.DB.prepare('SELECT * FROM extinguishers WHERE id=?').bind(id).first<any>()
    if (!existing) return Response.json({ success:false, error:'자산 없음' }, { status:404 })
    if (existing.status === '폐기') return Response.json({ success:false, error:'폐기된 자산은 수정할 수 없습니다' }, { status:409 })

    let changed = 0
    const sets: string[] = []
    const binds: any[] = []
    for (const f of EDITABLE_FIELDS) {
      if (!(f in body)) continue
      const newV = norm(body[f])
      const oldV = norm(existing[f])
      if (newV !== oldV) {
        changed++
        sets.push(`${f}=?`)
        binds.push(newV)
      }
    }

    if (changed > 3) {
      return Response.json({ success:false, error:'한 번에 최대 3개 필드까지만 변경 가능합니다' }, { status:400 })
    }
    if (changed === 0) {
      return Response.json({ success:true, data:{ noop:true } })
    }

    sets.push("updated_at=datetime('now','+9 hours')")
    binds.push(id)
    await env.DB.prepare(`UPDATE extinguishers SET ${sets.join(', ')} WHERE id=?`).bind(...binds).run()

    return Response.json({ success:true, data:{ changed } })
  } catch (e) {
    console.error('extinguisher update error:', e)
    return Response.json({ success:false, error:'서버 오류가 발생했습니다' }, { status:500 })
  }
}

export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  try {
    const id = parseInt(params.id as string, 10)
    if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 ID' }, { status:400 })

    const ext = await env.DB.prepare('SELECT id, check_point_id FROM extinguishers WHERE id=?')
      .bind(id).first<{ id:number; check_point_id:string|null }>()
    if (!ext) return Response.json({ success:false, error:'자산 없음' }, { status:404 })
    if (ext.check_point_id) return Response.json({ success:false, error:'매핑된 자산은 삭제할 수 없습니다 — 먼저 분리하세요' }, { status:409 })

    const recCount = await env.DB.prepare('SELECT COUNT(*) AS c FROM check_records WHERE extinguisher_id=?')
      .bind(id).first<{ c:number }>()
    if ((recCount?.c ?? 0) > 0) {
      return Response.json({ success:false, error:'점검 기록이 있는 자산은 삭제할 수 없습니다 — 폐기를 사용하세요' }, { status:409 })
    }

    await env.DB.prepare('DELETE FROM extinguishers WHERE id=?').bind(id).run()
    return Response.json({ success:true })
  } catch (e) {
    console.error('extinguisher delete error:', e)
    return Response.json({ success:false, error:'서버 오류가 발생했습니다' }, { status:500 })
  }
}

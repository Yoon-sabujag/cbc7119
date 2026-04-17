// functions/api/elevators/inspections.ts
import type { Env } from '../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

// GET /api/elevators/inspections?type=monthly|annual&elevator_id=xxx
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url        = new URL(request.url)
  const elevatorId = url.searchParams.get('elevator_id')
  const type       = url.searchParams.get('type')

  let sql = `
    SELECT i.*, e.location as elevator_location, e.number as elevator_number, e.type as elevator_type
    FROM elevator_inspections i
    JOIN elevators e ON e.id = i.elevator_id
    WHERE 1=1
  `
  const binds: string[] = []
  if (type)       { sql += ' AND i.type=?';        binds.push(type) }
  if (elevatorId) { sql += ' AND i.elevator_id=?'; binds.push(elevatorId) }
  sql += ' ORDER BY i.inspect_date DESC, i.created_at DESC LIMIT 100'

  const stmt = binds.length ? env.DB.prepare(sql).bind(...binds) : env.DB.prepare(sql)
  const rows = await stmt.all<Record<string,unknown>>()
  return Response.json({ success: true, data: rows.results ?? [] })
}

// DELETE /api/elevators/inspections?id=xxx — 점검/검사 기록 삭제 (admin only)
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, data }) => {
  if ((data as any).role !== 'admin') return Response.json({ success: false, error: '권한 없음' }, { status: 403 })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return Response.json({ success: false, error: 'id 필수' }, { status: 400 })
  await env.DB.prepare('DELETE FROM elevator_inspections WHERE id=?').bind(id).run()
  return Response.json({ success: true })
}

// POST /api/elevators/inspections
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const body = await request.json<{
    elevatorId: string
    inspectDate: string
    type: string
    // 점검용 항목 (monthly - 선택적)
    brake?: string
    door?: string
    safetyDevice?: string
    lighting?: string
    emergencyCall?: string
    overall: string
    actionNeeded?: string
    floorOccurred?: string
    memo?: string
    certificateKey?: string
    // Phase 11: 검사 유형 + 결과 (annual 전용)
    inspectType?: string   // regular | special | detailed
    result?: string        // pass | conditional | fail
    // 0057: PDF 파싱 검사실시정보 (annual 전용)
    inspectorName?: string
    inspectionAgency?: string
    judgment?: string
    validityStart?: string
    validityEnd?: string
    certNumber?: string
    inspectionItems?: Array<{ no: string; name: string; result: string }>
  }>()

  const isAnnual = body.type === 'annual'
  const hasCertData = !!(body.certificateKey || body.inspectionItems || body.certNumber)
  const isCertUpload = isAnnual && hasCertData

  // annual 타입은 brake 등 점검항목 null, overall은 pass/conditional/fail
  // monthly 타입은 brake 등 normal/bad, overall은 normal/caution/bad
  const resultValue = isAnnual ? (body.result ?? body.overall ?? 'pass') : null
  const overallValue = body.overall || (isAnnual ? (body.result ?? 'pass') : 'normal')

  // ── 검사성적서 PDF 업로드인 경우: 기존 직원 기록과 매칭 ──
  if (isCertUpload) {
    // 1) 같은 호기 + 같은 검사일의 cert 미첨부 기록이 있으면 UPDATE
    const matchExisting = await env.DB.prepare(`
      SELECT id, result FROM elevator_inspections
      WHERE elevator_id=? AND type='annual' AND inspect_date=?
        AND certificate_key IS NULL
      ORDER BY created_at DESC LIMIT 1
    `).bind(body.elevatorId, body.inspectDate).first<{ id: string; result: string | null }>()

    if (matchExisting) {
      // 기존 기록에 cert 데이터 붙이기
      await env.DB.prepare(`
        UPDATE elevator_inspections SET
          certificate_key=?, inspector_name=?, inspection_agency=?, judgment=?,
          validity_start=?, validity_end=?, cert_number=?, inspection_items=?
        WHERE id=?
      `).bind(
        body.certificateKey ?? null,
        body.inspectorName ?? null,
        body.inspectionAgency ?? null,
        body.judgment ?? null,
        body.validityStart ?? null,
        body.validityEnd ?? null,
        body.certNumber ?? null,
        body.inspectionItems ? JSON.stringify(body.inspectionItems) : null,
        matchExisting.id,
      ).run()
      return Response.json({ success: true, data: { id: matchExisting.id, mode: 'updated_existing' } }, { status: 200 })
    }

    // 2) 같은 호기에 조건부합격/불합격 이력이 있고 이 cert가 합격이면 → 조치 후 합격 cert로 링크
    // 합격 전환 후에도 찾을 수 있도록 여러 조건으로 검색:
    //   - result가 아직 conditional/fail (전환 안됨)
    //   - judgment가 조건부합격/불합격 (1차 cert가 먼저 올라온 경우)
    //   - action_needed에 '→합격 전환' 포함 (직원이 이미 전환한 경우)
    if (body.judgment === '합격' || resultValue === 'pass') {
      const conditional = await env.DB.prepare(`
        SELECT id FROM elevator_inspections
        WHERE elevator_id=? AND type='annual'
          AND parent_inspection_id IS NULL
          AND (
            result IN ('conditional','fail')
            OR judgment IN ('조건부합격','불합격')
            OR action_needed LIKE '%→합격 전환%'
          )
        ORDER BY inspect_date DESC, created_at DESC LIMIT 1
      `).bind(body.elevatorId).first<{ id: string }>()

      if (conditional) {
        // 조치 후 합격 cert로 INSERT (parent 링크)
        const id = nanoid()
        await env.DB.prepare(`
          INSERT INTO elevator_inspections
            (id, elevator_id, inspector_id, inspect_date, type,
             overall, certificate_key, inspect_type, result,
             inspector_name, inspection_agency, judgment,
             validity_start, validity_end, cert_number, inspection_items,
             parent_inspection_id)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).bind(
          id, body.elevatorId, staffId, body.inspectDate, body.type,
          overallValue, body.certificateKey ?? null, body.inspectType ?? 'regular', resultValue,
          body.inspectorName ?? null, body.inspectionAgency ?? null, body.judgment ?? null,
          body.validityStart ?? null, body.validityEnd ?? null,
          body.certNumber ?? null,
          body.inspectionItems ? JSON.stringify(body.inspectionItems) : null,
          conditional.id,
        ).run()

        // 부모 조건부합격 → 합격으로 자동 전환 (조치 후 cert로 합격 판정 받았으므로)
        await env.DB.prepare(`
          UPDATE elevator_inspections
          SET result='pass', overall='pass',
              action_needed=COALESCE(action_needed,'') || CASE WHEN action_needed IS NULL OR action_needed='' THEN '' ELSE char(10) END || '→합격 전환 (조치 후 합격 검사성적서 ' || ? || ')'
          WHERE id=?
        `).bind(body.inspectDate, conditional.id).run()

        // 미해결 findings는 조치완료로 마감
        await env.DB.prepare(`
          UPDATE elevator_inspection_findings
          SET status='resolved',
              resolved_at=datetime('now','+9 hours'),
              resolution_memo=COALESCE(resolution_memo, ?)
          WHERE inspection_id=? AND status='open'
        `).bind(`재검사(${body.inspectDate}) 합격으로 자동 종결`, conditional.id).run()

        await env.DB.prepare(`UPDATE elevators SET last_inspection=?, updated_at=datetime('now','+9 hours') WHERE id=?`).bind(body.inspectDate, body.elevatorId).run()
        return Response.json({ success: true, data: { id, mode: 'corrective', parentId: conditional.id } }, { status: 201 })
      }
    }
  }

  // ── 일반 INSERT (직원 기록 또는 매칭 없는 신규 cert) ──
  const id = nanoid()
  await env.DB.prepare(`
    INSERT INTO elevator_inspections
      (id, elevator_id, inspector_id, inspect_date, type,
       brake, door, safety_device, lighting, emergency_call,
       overall, action_needed, memo, certificate_key,
       inspect_type, result,
       inspector_name, inspection_agency, judgment,
       validity_start, validity_end, cert_number, inspection_items)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    id,
    body.elevatorId,
    staffId,
    body.inspectDate,
    body.type,
    isAnnual ? null : (body.brake ?? 'normal'),
    isAnnual ? null : (body.door ?? 'normal'),
    isAnnual ? null : (body.safetyDevice ?? 'normal'),
    isAnnual ? null : (body.lighting ?? 'normal'),
    isAnnual ? null : (body.emergencyCall ?? 'normal'),
    overallValue,
    body.actionNeeded ?? null,
    body.memo ?? null,
    body.certificateKey ?? null,
    isAnnual ? (body.inspectType ?? 'regular') : null,
    resultValue,
    body.inspectorName ?? null,
    body.inspectionAgency ?? null,
    body.judgment ?? null,
    body.validityStart ?? null,
    body.validityEnd ?? null,
    body.certNumber ?? null,
    body.inspectionItems ? JSON.stringify(body.inspectionItems) : null
  ).run()

  // 승강기 last_inspection 업데이트
  await env.DB.prepare(
    `UPDATE elevators SET last_inspection=?, updated_at=datetime('now','+9 hours') WHERE id=?`
  ).bind(body.inspectDate, body.elevatorId).run()

  return Response.json({ success: true, data: { id } }, { status: 201 })
}

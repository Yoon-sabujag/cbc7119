// POST /api/floorplan-markers/:id/place-asset — marker 에 자산 배치 (cp 자동 생성 + ext 매핑 + marker update)
//
// Phase 24 placing flow:
// 1) marker GET (label/floor/zone 가 cp 의 location/floor/zone 으로 사용됨)
// 2) cp 존재 시 재사용, 없으면 새 cp 생성 (CP-FE-XXXX)
// 3) ext UPDATE check_point_id=cpId
// 4) marker UPDATE check_point_id=cpId
//
// 자산-위치 분리 디자인 보존: 빈 마커는 cp 없음 → 점검 대상에 노출 X. 자산 배치 시점에만 cp 생성.
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ request, params, env }) => {
  try {
    const markerId = params.id as string
    const body = await request.json<{ extinguisher_id: number }>()

    if (!body.extinguisher_id) {
      return Response.json({ success: false, error: 'extinguisher_id 필수' }, { status: 400 })
    }

    // 1) marker fetch
    const marker = await env.DB.prepare(
      `SELECT id, floor, zone, label, plan_type, marker_type, check_point_id FROM floor_plan_markers WHERE id = ?`
    ).bind(markerId).first<{
      id: string; floor: string; zone: string | null; label: string | null;
      plan_type: string; marker_type: string | null; check_point_id: string | null;
    }>()

    if (!marker) return Response.json({ success: false, error: '마커를 찾을 수 없습니다' }, { status: 404 })
    if (marker.plan_type !== 'extinguisher') return Response.json({ success: false, error: '소화기 마커가 아닙니다' }, { status: 400 })

    // ── 공용 매핑/포맷 헬퍼 (create.ts 일반 경로와 동일 룰) ────────────────────────
    // ext.floor 포맷: '7F' -> '07', '8-1F' -> '08', 'B1' -> 'B1'
    const extFloor = (() => {
      let f = (marker.floor ?? '').replace(/F$/i, '')
      if (/^\d-\d$/.test(f)) f = '0' + f[0]
      else if (/^\d$/.test(f)) f = '0' + f
      return f
    })()
    const zoneEnMap: Record<string, string> = { '연': 'research', '사': 'office', '지': 'basement' }
    // marker.zone 은 한글('연','사','지'). 지하층은 항상 '지' 강제 (UI common→공 매핑 회피, create.ts 와 동일).
    const extZone = /^B\d/i.test(extFloor) ? '지' : (marker.zone ?? '공')
    const zoneEn = zoneEnMap[extZone] ?? null

    // 2) cp 결정: 기존 cp_id 가 있으면 재사용, 없으면 새 cp 생성.
    let cpId = marker.check_point_id
    if (!cpId) {
      // cp id 다음 seq — extinguishers/check_points 둘 다 max 봐서 충돌 방지 (create.ts 패턴 동일).
      const maxExtSeq = (await env.DB.prepare('SELECT MAX(seq_no) as m FROM extinguishers').first<{ m: number }>())?.m ?? 0
      const maxCpRow = await env.DB.prepare(
        `SELECT id FROM check_points WHERE id LIKE 'CP-FE-%' ORDER BY id DESC LIMIT 1`
      ).first<{ id: string }>()
      const maxCpSeq = maxCpRow?.id ? parseInt(maxCpRow.id.split('-').pop()!, 10) || 0 : 0
      const nextCpSeq = Math.max(maxExtSeq, maxCpSeq) + 1
      cpId = `CP-FE-${String(nextCpSeq).padStart(4, '0')}`

      const location = marker.label ?? cpId
      // qr_code 자동 발급 — 'QR-{zoneKr}-{floorRaw}-{seq}' (create.ts 일반 경로와 동일 룰).
      // 이전엔 cpId placeholder 였음 (5-22 사고 fix 의 부산물) — 지금부터는 정상 패턴.
      const qrPrefix = `QR-${extZone}-${(marker.floor ?? '').replace(/F$/i, '')}`
      const maxQr = await env.DB.prepare(
        `SELECT qr_code FROM check_points WHERE qr_code LIKE ? ORDER BY qr_code DESC LIMIT 1`
      ).bind(`${qrPrefix}-%`).first<{ qr_code: string }>()
      let qrSeq = 1
      if (maxQr?.qr_code) {
        const parts = maxQr.qr_code.split('-')
        qrSeq = (parseInt(parts[parts.length - 1], 10) || 0) + 1
      }
      const qrCode = `${qrPrefix}-${String(qrSeq).padStart(2, '0')}`

      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO check_points (id, qr_code, floor, zone, location, location_no, category)
           VALUES (?, ?, ?, ?, ?, ?, '소화기')`
        ).bind(cpId, qrCode, marker.floor, zoneEn, location, location),
        env.DB.prepare(
          `UPDATE floor_plan_markers SET check_point_id = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(cpId, markerId),
      ])
    }

    // 3) ext UPDATE — check_point_id=cpId. status='active' 강제 (재배치 시 폐기 자산 보호).
    // 충돌 가드: 이미 다른 active 자산이 cp 에 매핑되어 있으면 409.
    const occupant = await env.DB.prepare(
      `SELECT id FROM extinguishers WHERE check_point_id = ? AND status='active' AND id != ?`
    ).bind(cpId, body.extinguisher_id).first<{ id: number }>()
    if (occupant) {
      return Response.json({
        success: false, error: '이미 다른 소화기가 배치된 위치입니다',
        hint: 'swap', occupantId: occupant.id,
      }, { status: 409 })
    }

    // cp 로부터 location 다시 fetch (재사용 경로면 marker.label 과 다를 수 있음).
    const cp = await env.DB.prepare(
      `SELECT location FROM check_points WHERE id = ?`
    ).bind(cpId).first<{ location: string }>()
    const cpLocation = cp?.location ?? marker.label ?? cpId

    // ext.mgmt_no 발급 — '{zoneKr}-{floor}-{NN}'. 이미 mgmt_no 있으면 보존.
    const existingExt = await env.DB.prepare(
      `SELECT mgmt_no, seq_no FROM extinguishers WHERE id = ?`
    ).bind(body.extinguisher_id).first<{ mgmt_no: string | null; seq_no: number | null }>()

    let mgmtNo = existingExt?.mgmt_no ?? null
    if (!mgmtNo) {
      const mgmtPrefix = `${extZone}-${extFloor}`
      const maxMgmt = await env.DB.prepare(
        `SELECT mgmt_no FROM extinguishers WHERE mgmt_no LIKE ? ORDER BY mgmt_no DESC LIMIT 1`
      ).bind(`${mgmtPrefix}-%`).first<{ mgmt_no: string }>()
      let mgmtSeq = 1
      if (maxMgmt?.mgmt_no) {
        const parts = maxMgmt.mgmt_no.split('-')
        mgmtSeq = (parseInt(parts[parts.length - 1], 10) || 0) + 1
      }
      mgmtNo = `${mgmtPrefix}-${String(mgmtSeq).padStart(2, '0')}`
    }

    // ext.seq_no 발급 — 글로벌 max+1. 이미 있으면 보존.
    let seqNo = existingExt?.seq_no ?? null
    if (!seqNo) {
      const maxExtSeq = (await env.DB.prepare('SELECT MAX(seq_no) as m FROM extinguishers').first<{ m: number }>())?.m ?? 0
      seqNo = maxExtSeq + 1
    }

    await env.DB.prepare(
      `UPDATE extinguishers
       SET check_point_id = ?, seq_no = ?, zone = ?, floor = ?, mgmt_no = ?, location = ?,
           updated_at = datetime('now','+9 hours')
       WHERE id = ? AND status='active'`
    ).bind(cpId, seqNo, extZone, extFloor, mgmtNo, cpLocation, body.extinguisher_id).run()

    return Response.json({ success: true, data: { check_point_id: cpId, mgmt_no: mgmtNo } })
  } catch (e: any) {
    console.error('[place-asset POST]', e)
    return Response.json({ success: false, error: e?.message ?? '배치 실패' }, { status: 500 })
  }
}

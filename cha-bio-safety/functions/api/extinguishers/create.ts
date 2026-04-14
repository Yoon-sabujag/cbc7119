// POST /api/extinguishers/create — 새 소화기 등록 (check_point + extinguisher 동시 생성)
import type { Env } from '../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{
    floor: string       // check_points용 (예: '7F', '8-1F', 'B1')
    zone: string        // '연' | '사' | '공'
    location: string
    type: string        // '분말' 등
    approval_no?: string
    manufactured_at?: string
    manufacturer?: string
    prefix_code?: string
    seal_no?: string
    serial_no?: string
    note?: string
    category?: string   // 기본 '소화기'
  }>()

  if (!body.floor || !body.zone || !body.location || !body.type)
    return Response.json({ success: false, error: '필수 항목 누락' }, { status: 400 })

  const category = body.category ?? '소화기'

  // extinguishers용 floor 변환: '7F' -> '07', '8-1F' -> '08', 'B1' -> 'B1'
  let extFloor = body.floor.replace(/F$/i, '')
  if (/^\d-\d$/.test(extFloor)) extFloor = '0' + extFloor[0] // '8-1' -> '08'
  else if (/^\d$/.test(extFloor)) extFloor = '0' + extFloor   // '7' -> '07'

  // 다음 seq_no / id 계산
  const maxSeq = await env.DB.prepare('SELECT MAX(seq_no) as m FROM extinguishers').first<{ m: number }>()
  const nextSeq = (maxSeq?.m ?? 0) + 1
  const cpId = `CP-FE-${String(nextSeq).padStart(4, '0')}`

  // 관리번호 자동 생성: zone-floor-번호
  const mgmtPrefix = `${body.zone}-${extFloor}`
  const maxMgmt = await env.DB.prepare(
    `SELECT mgmt_no FROM extinguishers WHERE mgmt_no LIKE ? ORDER BY mgmt_no DESC LIMIT 1`
  ).bind(`${mgmtPrefix}-%`).first<{ mgmt_no: string }>()
  let mgmtSeq = 1
  if (maxMgmt?.mgmt_no) {
    const parts = maxMgmt.mgmt_no.split('-')
    mgmtSeq = parseInt(parts[parts.length - 1], 10) + 1
  }
  const mgmtNo = `${mgmtPrefix}-${String(mgmtSeq).padStart(2, '0')}`

  // QR 코드 자동 생성
  const zoneChar = body.zone === '연' ? '연' : body.zone === '사' ? '사' : '공'
  const maxQr = await env.DB.prepare(
    `SELECT qr_code FROM check_points WHERE qr_code LIKE ? ORDER BY qr_code DESC LIMIT 1`
  ).bind(`QR-${zoneChar}-${body.floor.replace(/F$/i, '')}-%`).first<{ qr_code: string }>()
  let qrSeq = 1
  if (maxQr?.qr_code) {
    const parts = maxQr.qr_code.split('-')
    qrSeq = parseInt(parts[parts.length - 1], 10) + 1
  }
  const qrCode = `QR-${zoneChar}-${body.floor.replace(/F$/i, '')}-${String(qrSeq).padStart(2, '0')}`

  // check_points INSERT
  await env.DB.prepare(
    `INSERT INTO check_points (id, qr_code, floor, zone, location, category, prefix_char, cert_no, serial_no, ext_type, approval_no, mfg_date, manufacturer)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    cpId, qrCode, body.floor, body.zone, body.location, category,
    body.prefix_code ?? null, body.seal_no ?? null, body.serial_no ?? null,
    body.type, body.approval_no ?? null, body.manufactured_at ?? null, body.manufacturer ?? null
  ).run()

  // extinguishers INSERT
  await env.DB.prepare(
    `INSERT INTO extinguishers (id, check_point_id, seq_no, zone, floor, mgmt_no, location, type, approval_no, manufactured_at, manufacturer, prefix_code, seal_no, serial_no, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    nextSeq, cpId, nextSeq, body.zone, extFloor, mgmtNo, body.location, body.type,
    body.approval_no ?? null, body.manufactured_at ?? null, body.manufacturer ?? null,
    body.prefix_code ?? null, body.seal_no ?? null, body.serial_no ?? null, body.note ?? null
  ).run()

  return Response.json({ success: true, data: { checkPointId: cpId, mgmtNo: mgmtNo } })
}

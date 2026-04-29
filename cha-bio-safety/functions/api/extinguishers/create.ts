// POST /api/extinguishers/create — 새 소화기 등록 (check_point + extinguisher 동시 생성)
import type { Env } from '../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{
    floor?: string      // check_points용 (예: '7F', '8-1F', 'B1')
    zone?: string       // '연' | '사' | '공'
    location?: string
    type: string        // '분말' 등
    approval_no?: string
    manufactured_at?: string
    manufacturer?: string
    prefix_code?: string
    seal_no?: string
    serial_no?: string
    note?: string
    category?: string   // 기본 '소화기'
    skip_marker?: boolean  // Phase 24: 자산만 등록 모드 (check_point_id=NULL)
  }>()

  // Phase 24: skip_marker 모드 — 자산만 등록 (check_point_id=NULL, status='active')
  if (body.skip_marker === true) {
    if (!body.type) return Response.json({ success:false, error:'종류는 필수입니다' }, { status:400 })

    const result = await env.DB.prepare(`
      INSERT INTO extinguishers (
        check_point_id, type, prefix_code, seal_no, serial_no,
        approval_no, manufactured_at, manufacturer, status,
        created_at, updated_at
      ) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, 'active',
                datetime('now','+9 hours'), datetime('now','+9 hours'))
    `).bind(
      body.type,
      body.prefix_code ?? null,
      body.seal_no ?? null,
      body.serial_no ?? null,
      body.approval_no ?? null,
      body.manufactured_at ?? null,
      body.manufacturer ?? null,
    ).run()

    const newId = result.meta?.last_row_id
    return Response.json({ success:true, data:{ extinguisherId: newId } })
  }

  // 기존 흐름 (마커 + 자산 동시 등록) — 도면 페이지 옛 호출용 (deprecate but kept).
  if (!body.floor || !body.zone || !body.location || !body.type)
    return Response.json({ success: false, error: '필수 항목 누락' }, { status: 400 })

  const category = body.category ?? '소화기'

  // extinguishers용 floor 변환: '7F' -> '07', '8-1F' -> '08', 'B1' -> 'B1'
  let extFloor = body.floor.replace(/F$/i, '')
  if (/^\d-\d$/.test(extFloor)) extFloor = '0' + extFloor[0] // '8-1' -> '08'
  else if (/^\d$/.test(extFloor)) extFloor = '0' + extFloor   // '7' -> '07'

  // 지하층(B prefix) 은 zone='지' 컨벤션 강제 (UI 의 common→공 매핑 회피)
  const extZone = /^B\d/i.test(extFloor) ? '지' : body.zone

  // 다음 seq_no / id 계산
  // 주의: cascade 삭제(quick-260426-rzy)는 ext 행만 삭제하고 check_points 는 is_active=0 으로 보존(점검 기록 무결성).
  // 그래서 check_points 의 CP-FE-NNNN suffix 최대값도 고려해야 cpId 가 기존 soft-deleted CP 와 충돌하지 않음.
  const maxExtSeq = (await env.DB.prepare('SELECT MAX(seq_no) as m FROM extinguishers').first<{ m: number }>())?.m ?? 0
  const maxCpRow = await env.DB.prepare(
    `SELECT id FROM check_points WHERE id LIKE 'CP-FE-%' ORDER BY id DESC LIMIT 1`
  ).first<{ id: string }>()
  const maxCpSeq = maxCpRow?.id ? parseInt(maxCpRow.id.split('-').pop()!, 10) || 0 : 0
  const nextSeq = Math.max(maxExtSeq, maxCpSeq) + 1
  const cpId = `CP-FE-${String(nextSeq).padStart(4, '0')}`

  // 관리번호 자동 생성: zone-floor-번호
  const mgmtPrefix = `${extZone}-${extFloor}`
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

  // check_points INSERT — zone은 영문으로 변환 (CHECK 제약조건). location_no=mgmt_no (기존 seed 컨벤션 일치).
  // env.DB.batch 로 묶어 한 INSERT 가 실패하면 둘 다 롤백 → orphan check_points 방지.
  const zoneEnMap: Record<string, string> = { '연': 'research', '사': 'office', '공': 'common' }
  const zoneEn = zoneEnMap[body.zone] ?? body.zone
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO check_points (id, qr_code, floor, zone, location, location_no, category, prefix_char, cert_no, serial_no, ext_type, approval_no, mfg_date, manufacturer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      cpId, qrCode, body.floor, zoneEn, body.location, mgmtNo, category,
      body.prefix_code ?? null, body.seal_no ?? null, body.serial_no ?? null,
      body.type, body.approval_no ?? null, body.manufactured_at ?? null, body.manufacturer ?? null
    ),
    env.DB.prepare(
      `INSERT INTO extinguishers (id, check_point_id, seq_no, zone, floor, mgmt_no, location, type, approval_no, manufactured_at, manufacturer, prefix_code, seal_no, serial_no, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      nextSeq, cpId, nextSeq, extZone, extFloor, mgmtNo, body.location, body.type,
      body.approval_no ?? null, body.manufactured_at ?? null, body.manufacturer ?? null,
      body.prefix_code ?? null, body.seal_no ?? null, body.serial_no ?? null, body.note ?? null
    ),
  ])

  return Response.json({ success: true, data: { checkPointId: cpId, mgmtNo: mgmtNo } })
}

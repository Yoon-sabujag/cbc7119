import type { Env } from '../../_middleware'
import { lockedResponse } from './_lock'

// ── 법적 점검 회차 상세 조회 / 결과 수정 ─────────────────────────────

// GET /api/legal/:id
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string

  try {
    const row = await env.DB.prepare(`
      SELECT
        si.id,
        si.title,
        si.date,
        si.end_date,
        si.inspection_category,
        si.status,
        si.result,
        si.report_file_key,
        si.submission_status,
        si.ppt_file_key,
        COUNT(lf.id) AS finding_count,
        SUM(CASE WHEN lf.status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count
      FROM schedule_items si
      LEFT JOIN legal_findings lf ON lf.schedule_item_id = si.id
      WHERE si.id = ?
      GROUP BY si.id
    `).bind(id).first<{
      id: string; title: string; date: string; end_date: string | null; inspection_category: string;
      status: string; result: string | null; report_file_key: string | null;
      submission_status: string; ppt_file_key: string | null;
      finding_count: number; resolved_count: number
    }>()

    if (!row) {
      return Response.json({ success: false, error: '법적 점검 회차를 찾을 수 없습니다' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: {
        id: row.id,
        title: row.title,
        date: row.date,
        endDate: row.end_date ?? null,
        inspectionCategory: row.inspection_category,
        status: row.status,
        result: row.result ?? null,
        reportFileKey: row.report_file_key ?? null,
        submissionStatus: (row.submission_status ?? 'pending') as 'pending' | 'completed',
        pptFileKey: row.ppt_file_key ?? null,
        findingCount: Number(row.finding_count ?? 0),
        resolvedCount: Number(row.resolved_count ?? 0),
      },
    })
  } catch (e) {
    console.error('[legal/:id GET]', e)
    return Response.json({ success: false, error: '법적 점검 조회 실패' }, { status: 500 })
  }
}

// PATCH /api/legal/:id
// Update result / report_file_key / submission_status / ppt_file_key; admin only
// Lock: submission_status='completed' 상태면 submission_status 변경 외 모든 mutation 차단
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { role } = data as any
  const id = params.id as string

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 가능합니다' }, { status: 403 })
  }

  let body: Record<string, any>
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  // 필드별 명시 존재 여부 체크 ('field' in body) — null 명시 vs undefined 구분
  const hasResult = 'result' in body
  const hasReportFileKey = 'report_file_key' in body
  const hasSubmissionStatus = 'submission_status' in body
  const hasPptFileKey = 'ppt_file_key' in body

  if (hasResult && body.result !== null && !['pass', 'fail', 'conditional'].includes(body.result)) {
    return Response.json({ success: false, error: "result는 'pass', 'fail', 'conditional' 또는 null 이어야 합니다" }, { status: 400 })
  }

  if (hasSubmissionStatus && !['pending', 'completed'].includes(body.submission_status)) {
    return Response.json({ success: false, error: "submission_status는 'pending' 또는 'completed' 여야 합니다" }, { status: 400 })
  }

  if (!hasResult && !hasReportFileKey && !hasSubmissionStatus && !hasPptFileKey) {
    return Response.json({ success: false, error: '수정할 필드가 없습니다' }, { status: 400 })
  }

  try {
    const existing = await env.DB.prepare(
      `SELECT id, submission_status FROM schedule_items WHERE id = ?`
    ).bind(id).first<{ id: string; submission_status: string }>()

    if (!existing) {
      return Response.json({ success: false, error: '법적 점검 회차를 찾을 수 없습니다' }, { status: 404 })
    }

    // Lock: 이미 completed 상태에서 submission_status 외 다른 필드 수정 시 거부
    const onlyTogglingSubmissionStatus = hasSubmissionStatus && !hasResult && !hasReportFileKey && !hasPptFileKey
    if (existing.submission_status === 'completed' && !onlyTogglingSubmissionStatus) {
      return lockedResponse()
    }

    // 동적 SET: 명시된 필드만 업데이트 (null 도 그대로 반영)
    const sets: string[] = []
    const binds: any[] = []
    if (hasResult)            { sets.push('result = ?');            binds.push(body.result ?? null) }
    if (hasReportFileKey)     { sets.push('report_file_key = ?');   binds.push(body.report_file_key ?? null) }
    if (hasSubmissionStatus)  { sets.push('submission_status = ?'); binds.push(body.submission_status) }
    if (hasPptFileKey)        { sets.push('ppt_file_key = ?');      binds.push(body.ppt_file_key ?? null) }
    binds.push(id)

    await env.DB.prepare(
      `UPDATE schedule_items SET ${sets.join(', ')} WHERE id = ?`
    ).bind(...binds).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('[legal/:id PATCH]', e)
    return Response.json({ success: false, error: '법적 점검 수정 실패' }, { status: 500 })
  }
}


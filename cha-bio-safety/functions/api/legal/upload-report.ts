import type { Env } from '../../_middleware'

// POST /api/legal/upload-report
// 와치독 (cha-bio-safety-watchdog) 이 결과내역서 PDF 를 자동 업로드할 때 호출.
// 1) /api/uploads 로 R2 업로드 후 받은 file_key 를 본 API 로 전달
// 2) 본 API 가 year+month+kind 로 schedule_items round 매칭 + reportFileKey 갱신 + 기존 R2 파일 삭제
//
// admin role 만 가능 (와치독 config 의 api_staff_id 가 admin 이어야 함)

interface UploadReportBody {
  year: number
  month: number
  kind: 'comprehensive' | 'functional'
  file_key: string
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { role } = data as any

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 가능합니다' }, { status: 403 })
  }

  let body: UploadReportBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  const { year, month, kind, file_key } = body

  if (!year || !month || !kind || !file_key) {
    return Response.json({ success: false, error: 'year, month, kind, file_key 모두 필수' }, { status: 400 })
  }
  if (!['comprehensive', 'functional'].includes(kind)) {
    return Response.json({ success: false, error: "kind 는 'comprehensive' 또는 'functional'" }, { status: 400 })
  }
  if (typeof month !== 'number' || month < 1 || month > 12) {
    return Response.json({ success: false, error: 'month 는 1-12' }, { status: 400 })
  }

  const monthStr = String(month).padStart(2, '0')
  const datePattern = `${year}-${monthStr}-%`
  const titlePattern = kind === 'comprehensive' ? '%종합%' : '%작동%'

  try {
    // 매칭되는 round 찾기 (가장 가까운 1건)
    const round = await env.DB.prepare(`
      SELECT id, report_file_key, submission_status, title, date
      FROM schedule_items
      WHERE category = 'fire'
        AND date LIKE ?
        AND title LIKE ?
      ORDER BY date
      LIMIT 1
    `).bind(datePattern, titlePattern).first<{
      id: string; report_file_key: string | null;
      submission_status: string; title: string; date: string
    }>()

    if (!round) {
      return Response.json({
        success: false,
        error: `매칭되는 점검 회차 없음 (year=${year}, month=${monthStr}, kind=${kind})`,
      }, { status: 404 })
    }

    // 제출 완료 lock 가드
    if (round.submission_status === 'completed') {
      return Response.json({
        success: false,
        error: `이미 제출 완료된 회차 (${round.title}, ${round.date}) — 결과내역서 교체 불가`,
      }, { status: 403 })
    }

    // 기존 reportFileKey 있으면 R2 옛 파일 삭제 (덮어쓰기)
    const oldKey = round.report_file_key
    let deleted = false
    if (oldKey && oldKey !== file_key) {
      try {
        await env.STORAGE.delete(oldKey)
        deleted = true
      } catch (e) {
        console.error('[upload-report] R2 delete old key failed', e)
        // 옛 파일 삭제 실패해도 새 key 갱신은 진행
      }
    }

    // DB 갱신
    await env.DB.prepare(
      `UPDATE schedule_items SET report_file_key = ? WHERE id = ?`
    ).bind(file_key, round.id).run()

    return Response.json({
      success: true,
      data: {
        roundId: round.id,
        title: round.title,
        date: round.date,
        replaced: !!oldKey,
        oldKeyDeleted: deleted,
      },
    })
  } catch (e: any) {
    console.error('[upload-report POST]', e)
    return Response.json({ success: false, error: e?.message ?? '결과내역서 등록 실패' }, { status: 500 })
  }
}

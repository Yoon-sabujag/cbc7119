import type { Env } from '../../../_middleware'
import { isRoundSubmitted, lockedResponse } from '../_lock'

// PUT /api/legal/:id/submission-order
// body: { findingIds: string[] }  — 순서대로 1,2,3,... 부여
// 미포함 finding 은 submission_order = 0, submission_selected = 0
// lock: 제출 완료 회차는 거부
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const scheduleItemId = params.id as string

  if (await isRoundSubmitted(env, scheduleItemId)) {
    return lockedResponse()
  }

  let body: { findingIds: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  if (!Array.isArray(body.findingIds)) {
    return Response.json({ success: false, error: 'findingIds 배열이 필요합니다' }, { status: 400 })
  }
  const ids = body.findingIds as unknown[]
  if (!ids.every(x => typeof x === 'string' && x.length > 0)) {
    return Response.json({ success: false, error: 'findingIds 는 string 배열' }, { status: 400 })
  }
  const findingIds = ids as string[]
  // 중복 거부
  if (new Set(findingIds).size !== findingIds.length) {
    return Response.json({ success: false, error: 'findingIds 에 중복' }, { status: 400 })
  }

  try {
    // 1. 회차 내 모든 finding 을 일단 0/false 로 리셋
    const stmts = [
      env.DB.prepare(
        `UPDATE legal_findings SET submission_order = 0, submission_selected = 0 WHERE schedule_item_id = ?`
      ).bind(scheduleItemId),
    ]
    // 2. 각 fid 에 인덱스+1 부여 + selected=1
    findingIds.forEach((fid, idx) => {
      stmts.push(
        env.DB.prepare(
          `UPDATE legal_findings SET submission_order = ?, submission_selected = 1
           WHERE id = ? AND schedule_item_id = ?`
        ).bind(idx + 1, fid, scheduleItemId)
      )
    })
    await env.DB.batch(stmts)

    return Response.json({ success: true, data: { count: findingIds.length } })
  } catch (e: any) {
    console.error('[legal/:id/submission-order PUT]', e)
    return Response.json({ success: false, error: e?.message ?? '순서 저장 실패' }, { status: 500 })
  }
}

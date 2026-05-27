import type { Env } from '../../_middleware'

export async function isRoundSubmitted(env: Env, scheduleItemId: string): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT submission_status FROM schedule_items WHERE id = ?`
  ).bind(scheduleItemId).first<{ submission_status: string }>()
  return row?.submission_status === 'completed'
}

export function lockedResponse() {
  return Response.json(
    { success: false, error: '제출 완료된 점검은 수정 불가합니다' },
    { status: 403 }
  )
}

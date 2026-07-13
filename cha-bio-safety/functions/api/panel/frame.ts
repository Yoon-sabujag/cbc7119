import type { Env } from '../../_middleware'
import { assertAgentKey } from '../../_lib/agent'
import { nowKstSql } from '../../utils/kst'

// POST /api/panel/frame — 에이전트 프레임 업로드 (raw JPEG) → R2.
// 헤더 계약 (panel-agent/MONITORING-SPEC.md §3.0.1):
//   X-Frame-Key        : 'latest'(라이브, 기본) | 'alarms/<alarmId>'(경보 스냅샷). 없으면 'latest'.
//   X-Frame-Ts         : 업로드 시각 KST 'YYYY-MM-DD HH:MM:SS'. 없으면 서버 수신시각.
//   X-Frame-CapturedAt : (신규, optional) 이 프레임이 ffmpeg 리더에 도착한 시각 KST. 없으면 null.
//
// ★★ C2 (INV-2): frame_updated_at / frame_captured_at 갱신은 frameKey === 'latest' 일 때만 한다.
//    경보 스냅샷(alarms/<id>)이 라이브 신선도 타임스탬프를 갱신하면
//    "라이브 업로드는 죽었는데 화면은 방금으로 초록" 이라는 최악의 오독이 화재 순간에 발생한다.
//    (라이브 업로드 실패 중 화재 → 스냅샷 업로드만 성공 → 10분 묵은 화면이 "방금 갱신됨"으로 표시)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const bad = assertAgentKey(request, env)
  if (bad) return bad
  try {
    // path traversal 방지: 허용 문자만 (alarms/<id> 슬래시 허용).
    const frameKey = (request.headers.get('X-Frame-Key') || 'latest').replace(/[^A-Za-z0-9/_-]/g, '')
    if (!frameKey || frameKey.includes('..')) {
      return Response.json({ success: false, error: 'invalid frame key' }, { status: 400 })
    }
    const ts = request.headers.get('X-Frame-Ts') || nowKstSql()
    const capturedAt = request.headers.get('X-Frame-CapturedAt') || null

    const body = await request.arrayBuffer()
    await env.STORAGE.put(`panel/${frameKey}.jpg`, body, { httpMetadata: { contentType: 'image/jpeg' } })

    if (frameKey === 'latest') {
      await env.DB.prepare(
        "UPDATE panel_agent_status SET frame_updated_at = ?, frame_captured_at = COALESCE(?, frame_captured_at) WHERE id = 'agent'",
      ).bind(ts, capturedAt).run()
    }
    // frameKey !== 'latest' (경보 스냅샷) → R2 에만 쓰고 신선도 타임스탬프는 건드리지 않는다(C2).

    return Response.json({ success: true, data: { key: `panel/${frameKey}.jpg`, updatedAt: ts } })
  } catch (e) {
    console.error('panel/frame error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

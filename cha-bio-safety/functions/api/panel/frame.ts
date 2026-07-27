import type { Env } from '../../_middleware'
import { assertAgentKey } from '../../_lib/agent'
import { nowKstSql } from '../../utils/kst'

// POST /api/panel/frame — 에이전트 프레임 업로드 (raw JPEG) → R2.
// 헤더 계약 (panel-agent/MONITORING-SPEC.md §3.0.1):
//   X-Frame-Key        : 'latest'(라이브, 기본) | 'alarms/<alarmId>'(경보 스냅샷). 없으면 'latest'.
//   X-Frame-Ts         : 업로드 시각 KST 'YYYY-MM-DD HH:MM:SS'. 없으면 서버 수신시각.
//   X-Frame-CapturedAt : (optional) 이 프레임이 ffmpeg 리더에 도착한 시각 KST. 없으면 null.
//   X-Frame-Diag       : (optional, 260727) 'starved'|'blind' — 에이전트 합성 진단 카드.
//                        실프레임이 아니므로 신선도 타임스탬프를 갱신하지 않는다(아래 C2 동류 규칙).
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
    const diag = request.headers.get('X-Frame-Diag')

    const body = await request.arrayBuffer()
    await env.STORAGE.put(`panel/${frameKey}.jpg`, body, { httpMetadata: { contentType: 'image/jpeg' } })

    if (frameKey === 'latest' && !diag) {
      await env.DB.prepare(
        "UPDATE panel_agent_status SET frame_updated_at = ?, frame_captured_at = COALESCE(?, frame_captured_at) WHERE id = 'agent'",
      ).bind(ts, capturedAt).run()
    }
    // frameKey !== 'latest' (경보 스냅샷) → R2 에만 쓰고 신선도 타임스탬프는 건드리지 않는다(C2).
    // X-Frame-Diag (진단 카드) → 동일 규칙: R2 latest.jpg 픽셀만 교체. frame_updated_at 을 갱신하면
    //   '지연' 회색(텔레메트리-독립 백스톱)이 카드에 의해 세탁된다 — 카드는 화면이지 신선도가 아니다.

    return Response.json({ success: true, data: { key: `panel/${frameKey}.jpg`, updatedAt: ts } })
  } catch (e) {
    console.error('panel/frame error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

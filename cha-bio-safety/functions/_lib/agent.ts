// 에이전트 인입 경로 공용 가드 — /api/panel/frame, /api/alarm/{trigger,clear,heartbeat,renotify}.
// X-Agent-Key 불일치 시 401 계약 응답, 일치 시 null.
// 핸들러 첫 줄: const bad = assertAgentKey(request, env); if (bad) return bad
export function assertAgentKey(request: Request, env: { AGENT_KEY?: string }): Response | null {
  if (request.headers.get('X-Agent-Key') !== env.AGENT_KEY) {
    return Response.json({ success: false, error: 'agent unauthorized' }, { status: 401 })
  }
  return null
}

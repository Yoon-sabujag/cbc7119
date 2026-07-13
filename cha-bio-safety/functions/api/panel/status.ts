import type { Env } from '../../_middleware'
import { computeMaint } from '../../_lib/maint'
import { mapAlarmSummary, type AlarmRow } from '../../_lib/alarm'

// KST 벽시계 문자열 → epoch ms.
function parseKstMs(s: string | null): number | null {
  if (!s) return null
  const t = new Date(s.replace(' ', 'T') + '+09:00').getTime()
  return Number.isFinite(t) ? t : null
}

// GET /api/panel/status — 프레시니스+요약+maint+연결감시(lastSeenAt/agentOnline). (JWT)
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const agent = await env.DB.prepare("SELECT * FROM panel_agent_status WHERE id='agent'")
      .first<{
        last_seen_at: string | null; frame_updated_at: string | null; agent_version: string | null
        watchdog_notified_at: string | null
        // 0096 신규 — 구 행/구 에이전트면 전부 null (화면은 null 을 회색=판정불가로 칠한다. 초록 금지)
        frame_captured_at?: string | null; frame_lag_ms?: number | null; frame_lag_max_ms?: number | null
        frame_starved_sec?: number | null; last_detect_ok_at?: string | null
        uptime_sec?: number | null; detect_mode?: string | null; matcher_loaded?: number | null
        // 0097 — v1.4.2 스위치 상태. NULL = 구 에이전트(v1.4.1 이하) → 화면은 회색(초록 금지)
        telemetry_on?: number | null; backend_v2?: number | null; snapshot_on?: number | null
        cfg_json?: string | null
      }>()

    // cfg 원문에서 필요한 값만 꺼낸다. 파싱 실패해도 화면을 죽이지 않는다.
    let cfg: Record<string, unknown> | null = null
    try { cfg = agent?.cfg_json ? JSON.parse(agent.cfg_json) : null } catch { cfg = null }
    const cfgNum = (k: string): number | null => (typeof cfg?.[k] === 'number' ? cfg[k] as number : null)
    const cfgBool = (k: string): boolean | null => (typeof cfg?.[k] === 'boolean' ? cfg[k] as boolean : null)
    const lastSeen = agent?.last_seen_at ?? null
    const lastSeenMs = parseKstMs(lastSeen)
    const agentOnline = lastSeenMs != null && (Date.now() - lastSeenMs) < 180000

    const activeRow = await env.DB.prepare(
      `SELECT * FROM panel_alarms WHERE status IN ('active','acked') ORDER BY (type='fire') DESC, detected_at DESC LIMIT 1`,
    ).first<AlarmRow>()

    const maint = await computeMaint(env)

    return Response.json({
      success: true,
      data: {
        frameUpdatedAt: agent?.frame_updated_at ?? null,
        agentOnline,
        lastHeartbeatAt: lastSeen,
        lastSeenAt: lastSeen,
        activeAlarm: activeRow ? mapAlarmSummary(activeRow) : null,
        maint,
        // ── 0096 신규 (MONITORING-SPEC.md §6-①). 전부 null 가능 = 구 에이전트/미지원 → 화면은 회색 ──
        agentVersion:     agent?.agent_version ?? null,
        uptimeSec:        agent?.uptime_sec ?? null,
        detectMode:       agent?.detect_mode ?? null,          // off|dryrun|live
        frameCapturedAt:  agent?.frame_captured_at ?? null,
        frameLagMs:       agent?.frame_lag_ms ?? null,
        frameLagMaxMs:    agent?.frame_lag_max_ms ?? null,
        frameStarvedSec:  agent?.frame_starved_sec ?? null,
        lastDetectOkAt:   agent?.last_detect_ok_at ?? null,
        matcherLoaded:    agent?.matcher_loaded == null ? null : agent.matcher_loaded === 1,
        // ── 0097 (v1.4.2 스위치 상태, FEEDBACK §5). null = 구 에이전트 → 화면 회색 ──
        telemetryOn:      agent?.telemetry_on == null ? null : agent.telemetry_on === 1,
        backendV2:        agent?.backend_v2 == null ? null : agent.backend_v2 === 1,
        snapshotOn:       agent?.snapshot_on == null ? null : agent.snapshot_on === 1,
        snapshotCfg:      cfgBool('snapshotCfg'),     // 설정값. snapshotOn=false + snapshotCfg=true → '종속으로 꺼짐'
        frameInterval:    cfgNum('frameInterval'),    // 설정 업로드 주기 — R2 예산에서 실측과 나란히 보여준다
        detFps:           cfgNum('detFps'),
        starvedLogSec:    cfgNum('starvedLogSec'),    // 에이전트 로컬 로그 임계(서버 판정 5s/30s 와 무관)
      },
    })
  } catch (e) {
    console.error('panel/status error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

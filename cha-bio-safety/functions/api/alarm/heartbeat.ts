import type { Env } from '../../_middleware'
import { assertAgentKey } from '../../_lib/agent'
import { nowKstSql } from '../../utils/kst'

// POST /api/alarm/heartbeat — 60초 연결 감시 + 원격 계측(텔레메트리) 수집.
// 계약 SSOT: panel-agent/MONITORING-SPEC.md §3.1
//
// ★ 불변식 1 (INV-3): 신규 필드는 전부 optional. 구 에이전트(at/agentVersion/frameTs 만 보냄)가 그대로 200 을 받아야 한다.
// ★ 불변식 2 (S4): rgy 및 하위 r/g/y 는 각각 null 일 수 있다(표본 0 / DETECT_MODE=off).
//                  body.rgy.r.avg 로 파싱하면 TypeError → 500 → heartbeat 유실. 반드시 optional chaining.
// ★ 불변식 3 (S7): detect_mode 등 열거값은 검증하지 않고 그대로 저장한다. 오타로 400 을 내면 감시가 끊긴다.
// ★ 불변식 4: D1 쓰기가 실패해도 200 을 반환한다. heartbeat 실패는 아무도 구하지 못하고 로그만 더럽힌다.
// ★ 불변식 5 (B1/S10 — 치명): 두 write 는 서로 다른 try/catch 에 넣는다. 절대 합치지 마라. 아래 (1)/(2) 참조.

interface Rgy1 { avg?: number | null; max?: number | null }
interface HeartbeatBody {
  at?: string
  agentVersion?: string
  frameTs?: string | null
  // ── 신규(전부 optional) ──
  frameCapturedAt?: string | null
  frameLagMs?: number | null
  frameLagMaxMs?: number | null     // 직전 heartbeat 이후 구간의 lag 최댓값 (S1)
  frameStarvedSec?: number | null
  analyzeOk?: number | null
  analyzeFail?: number | null
  lastDetectOkAt?: string | null
  uploadOk?: number | null          // 라이브 프레임 경로 한정
  uploadFail?: number | null        // 라이브 프레임 경로 한정
  snapshotOk?: number | null        // ★ B2. 경보 스냅샷 업로드 성공(별도 계상)
  snapshotFail?: number | null      // 경보 스냅샷 업로드 실패(별도 계상)
  httpErr?: { [k: string]: number } | null   // {"401":n,"403":n,"5xx":n,"other":n} — 라이브 경로 한정
  rgy?: { r?: Rgy1 | null; g?: Rgy1 | null; y?: Rgy1 | null } | null   // 단위 %(0..100)
  ocrOk?: number | null
  ocrFail?: number | null
  uptimeSec?: number | null
  detectMode?: string | null        // off|dryrun|live — 검증 없이 저장
  matcherLoaded?: boolean | null
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null)

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const bad = assertAgentKey(request, env)
  if (bad) return bad

  let body: HeartbeatBody = {}
  let rawJson: string | null = null
  try {
    const text = await request.text()
    rawJson = text.slice(0, 4000)          // 스키마보다 앞선 신규 필드 유실 방지(원문 보존)
    body = text ? (JSON.parse(text) as HeartbeatBody) : {}
  } catch {
    body = {}                              // 본문이 깨져도 heartbeat 자체는 살린다
  }

  const receivedAt = nowKstSql()
  const at = str(body.at) ?? receivedAt

  // rgy: 최상위/하위 전부 null 가능 → optional chaining 필수 (S4)
  const rAvg = num(body.rgy?.r?.avg), rMax = num(body.rgy?.r?.max)
  const gAvg = num(body.rgy?.g?.avg), gMax = num(body.rgy?.g?.max)
  const yAvg = num(body.rgy?.y?.avg), yMax = num(body.rgy?.y?.max)

  const h = body.httpErr ?? {}
  const h401 = num(h['401']), h403 = num(h['403']), h5xx = num(h['5xx']), hOther = num(h['other'])

  const matcherLoaded = typeof body.matcherLoaded === 'boolean' ? (body.matcherLoaded ? 1 : 0) : null

  // ★★ B1 — 두 write 를 독립 try/catch 로 분리한다. 하나의 try 로 묶지 마라.
  //    사고 경로: panel_agent_status 에 컬럼 하나(예: matcher_loaded)만 없어도 (1) 이 D1 에러를 던지고,
  //    같은 try 블록이면 (2) 의 agent_heartbeats INSERT 는 아예 실행되지 않는다.
  //    그런데 catch 가 예외를 삼키고 200 OK 를 돌려주므로 → 에이전트 로그는 완벽하게 깨끗하고,
  //    agent_heartbeats 는 영원히 0행이며, /panel-monitor 는 빈 차트를 보여주고,
  //    아무도 모니터링이 죽었다는 사실을 모른다. (모니터링의 침묵 = 이 프로젝트가 고치려던 바로 그 원죄다.)
  //    분리하면: 컬럼 하나가 어긋나도 시계열은 계속 쌓이고, 로그에 어느 쪽이 죽었는지 정확히 남는다.

  // (1) 싱글턴 — 대시보드 1회 조회용 최신 스냅샷. 기존 동작(last_seen_at/agent_version/watchdog 리셋) 유지.
  try {
    await env.DB.prepare(
      `UPDATE panel_agent_status SET
         last_seen_at = ?, agent_version = ?, watchdog_notified_at = NULL,
         frame_captured_at = COALESCE(?, frame_captured_at),
         frame_lag_ms = ?, frame_lag_max_ms = ?, frame_starved_sec = ?,
         last_detect_ok_at = COALESCE(?, last_detect_ok_at),
         uptime_sec = ?, detect_mode = COALESCE(?, detect_mode), matcher_loaded = ?
       WHERE id = 'agent'`,
    ).bind(
      at, str(body.agentVersion),
      str(body.frameCapturedAt),
      num(body.frameLagMs), num(body.frameLagMaxMs), num(body.frameStarvedSec),
      str(body.lastDetectOkAt),
      num(body.uptimeSec), str(body.detectMode), matcherLoaded,
    ).run()
  } catch (e) {
    // ★ 500 을 내지 않는다. 계측 저장 실패가 감시 경로를 시끄럽게 만들면 안 된다.
    // ★ 여기서 죽어도 아래 (2) 는 반드시 실행된다 — 이것이 분리의 목적이다.
    console.error('alarm/heartbeat: panel_agent_status UPDATE failed:', e)
  }

  // (2) 시계열 append. 이력/가동률/재시작 탐지의 유일한 근거. (1) 의 성패와 무관하게 시도한다.
  //     컬럼 31개 = 물음표 31개 = bind 인자 31개 (개수가 어긋나면 D1 런타임 에러 → 조용히 0행).
  try {
    await env.DB.prepare(
      `INSERT INTO agent_heartbeats (
         at, received_at, agent_version, detect_mode, uptime_sec,
         frame_ts, frame_captured_at, frame_lag_ms, frame_lag_max_ms, frame_starved_sec,
         analyze_ok, analyze_fail, last_detect_ok_at,
         upload_ok, upload_fail, snapshot_ok, snapshot_fail,
         http_401, http_403, http_5xx, http_other,
         ocr_ok, ocr_fail,
         r_avg, r_max, g_avg, g_max, y_avg, y_max,
         matcher_loaded, raw
       ) VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?, ?,?,?,?, ?,?,?,?, ?,?, ?,?,?,?,?,?, ?,?)`,
    ).bind(
      at, receivedAt, str(body.agentVersion), str(body.detectMode), num(body.uptimeSec),
      str(body.frameTs), str(body.frameCapturedAt), num(body.frameLagMs), num(body.frameLagMaxMs), num(body.frameStarvedSec),
      num(body.analyzeOk), num(body.analyzeFail), str(body.lastDetectOkAt),
      num(body.uploadOk), num(body.uploadFail), num(body.snapshotOk), num(body.snapshotFail),
      h401, h403, h5xx, hOther,
      num(body.ocrOk), num(body.ocrFail),
      rAvg, rMax, gAvg, gMax, yAvg, yMax,
      matcherLoaded, rawJson,
    ).run()
  } catch (e) {
    // 여기서 죽으면 시계열이 0행이 된다. 배포 직후 반드시 SELECT COUNT(*) 로 확인하라
    // (200 OK 는 저장의 증거가 아니다 — SPEC §3.1 서버 동작 6).
    console.error('alarm/heartbeat: agent_heartbeats INSERT failed:', e)
  }

  return Response.json({ success: true })
}

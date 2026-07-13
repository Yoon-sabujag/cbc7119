import type { Env } from '../../_middleware'

// GET /api/panel/agent-history?hours=24 — 에이전트 텔레메트리 시계열 (관리자 전용).
// 계약 SSOT: panel-agent/MONITORING-SPEC.md §5.1
//
// JWT 필수(_middleware 통과) + role === 'admin' (전례: functions/api/database/r2-list.ts).
// PUBLIC/PUBLIC_PATTERN 에 추가하지 말 것 — 이건 에이전트 인입 경로가 아니다.
// ※ /api/panel/status 와 /api/alarm/events 에는 admin 게이트를 걸지 않는다(대시보드가 쓴다).
interface HbRow {
  at: string; agent_version: string | null; detect_mode: string | null; uptime_sec: number | null
  frame_lag_ms: number | null; frame_lag_max_ms: number | null; frame_starved_sec: number | null
  analyze_ok: number | null; analyze_fail: number | null
  upload_ok: number | null; upload_fail: number | null
  snapshot_ok: number | null; snapshot_fail: number | null
  http_401: number | null; http_403: number | null; http_5xx: number | null; http_other: number | null
  ocr_ok: number | null; ocr_fail: number | null
  r_avg: number | null; g_avg: number | null; y_avg: number | null
  matcher_loaded: number | null
}

const kstMs = (s: string): number => new Date(s.replace(' ', 'T') + '+09:00').getTime()

export const onRequestGet: PagesFunction<Env> = async ({ request, env, data }) => {
  const { role } = data as { role: string }
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 접근 가능' }, { status: 403 })

  try {
    const url = new URL(request.url)
    const raw = parseInt(url.searchParams.get('hours') || '24', 10)
    const hours = Math.min(Math.max(Number.isFinite(raw) ? raw : 24, 1), 336)  // 1..336 (14일 = 보존기간)

    // at 은 KST 벽시계 문자열 → 임계값도 KST(now+9h)로 계산 (alarm/events.ts 와 대칭).
    const rs = await env.DB.prepare(
      `SELECT * FROM agent_heartbeats
        WHERE datetime(at) >= datetime('now', '+9 hours', ?)
        ORDER BY at ASC`,
    ).bind(`-${hours} hours`).all<HbRow>()
    const rows = rs.results ?? []

    // ── points: 즉시값 + 누적카운터 델타 ──
    // 카운터는 기동 이후 monotonic 누적(§3.1.3) → 인접 두 행의 차 = 그 60초 구간의 발생량.
    // 재시작 구간의 음수 델타는 0 으로 처리한다.
    const points = rows.map((r, i) => {
      const p = i > 0 ? rows[i - 1] : null
      const d = (cur: number | null, prev: number | null) => {
        if (cur == null) return null          // null 은 결측 — 0 으로 그리면 "정상"으로 오독된다
        if (p == null || prev == null) return 0
        const v = cur - prev
        return v < 0 ? 0 : v                  // 재시작 → 음수 델타 → 0
      }
      return {
        at: r.at,
        agentVersion: r.agent_version,
        detectMode: r.detect_mode,
        uptimeSec: r.uptime_sec,
        frameLagMs: r.frame_lag_ms,
        frameLagMaxMs: r.frame_lag_max_ms,          // ★ S1 — 80초 스파이크는 이 필드로만 보인다. 절대 빼지 말 것
        frameStarvedSec: r.frame_starved_sec,
        matcherLoaded: r.matcher_loaded == null ? null : r.matcher_loaded === 1,
        rAvg: r.r_avg, gAvg: r.g_avg, yAvg: r.y_avg,
        // 델타(이 60초 구간의 발생량)
        analyzeFail: d(r.analyze_fail, p?.analyze_fail ?? null),
        uploadOk:    d(r.upload_ok,    p?.upload_ok ?? null),
        uploadFail:  d(r.upload_fail,  p?.upload_fail ?? null),
        snapshotOk:  d(r.snapshot_ok,  p?.snapshot_ok ?? null),   // ★ B2. ok+fail==0 → 화면은 회색(시도 없음)
        snapshotFail:d(r.snapshot_fail,p?.snapshot_fail ?? null),
        http401:     d(r.http_401,     p?.http_401 ?? null),
        http403:     d(r.http_403,     p?.http_403 ?? null),
        http5xx:     d(r.http_5xx,     p?.http_5xx ?? null),
        httpOther:   d(r.http_other,   p?.http_other ?? null),
        ocrFail:     d(r.ocr_fail,     p?.ocr_fail ?? null),
      }
    })

    // ── gaps: 인접 heartbeat 간격 > 180초(= status.ts 의 온라인 임계) = "에이전트가 죽어 있던 시간" ──
    const gaps: { from: string; to: string; sec: number }[] = []
    for (let i = 1; i < rows.length; i++) {
      const sec = Math.round((kstMs(rows[i].at) - kstMs(rows[i - 1].at)) / 1000)
      if (sec > 180) gaps.push({ from: rows[i - 1].at, to: rows[i].at, sec })
    }
    const gapSec = gaps.reduce((s, g) => s + g.sec, 0)
    const uptimePct = rows.length < 2 ? null
      : Math.max(0, Math.round((1 - gapSec / (hours * 3600)) * 1000) / 10)

    // ── restarts: uptime_sec 이 직전 행보다 작아진 지점 ──
    const restarts: { at: string }[] = []
    for (let i = 1; i < rows.length; i++) {
      const cur = rows[i].uptime_sec, prev = rows[i - 1].uptime_sec
      if (cur != null && prev != null && cur < prev) restarts.push({ at: rows[i].at })
    }

    // ── 다운샘플: >1000 포인트면 버킷당 대표값 ──
    //
    // ★ 계열별로 집계 함수가 다르다 (FEEDBACK §2 — 구 코드는 전부 MAX 라 카운터가 과소집계됐다):
    //   - lag/기아(즉시값)  → MAX. 평균은 스파이크를 지운다(SPEC §5.1). 이 화면의 존재 이유가 스파이크다.
    //   - 카운터 델타       → SUM. 프론트가 이 값을 구간 합계로 더하므로 MAX 면 24h 타일이 실제보다 작게 나온다.
    //     (24h 조회는 항상 다운샘플을 탄다: 60초 주기 → 1,440 > MAXP 1000 → step=2)
    //
    // ※ null 은 결측이다. 표본이 전부 null 이면 null 을 유지한다(0 으로 채우면 "정상"으로 오독된다).
    const MAXP = 1000
    let out = points
    if (points.length > MAXP) {
      const step = Math.ceil(points.length / MAXP)
      out = []
      for (let i = 0; i < points.length; i += step) {
        const b = points.slice(i, i + step)
        const agg = (f: (x: typeof b[0]) => number | null, fn: (v: number[]) => number) => {
          const v = b.map(f).filter((x): x is number => x != null)
          return v.length ? fn(v) : null
        }
        const mx  = (f: (x: typeof b[0]) => number | null) => agg(f, v => Math.max(...v))
        const sum = (f: (x: typeof b[0]) => number | null) => agg(f, v => v.reduce((a, c) => a + c, 0))
        const last = b[b.length - 1]
        out.push({
          ...last,
          // 즉시값 — MAX
          frameLagMs: mx(x => x.frameLagMs),
          frameLagMaxMs: mx(x => x.frameLagMaxMs),
          frameStarvedSec: mx(x => x.frameStarvedSec),
          // 카운터 델타 — SUM
          analyzeFail: sum(x => x.analyzeFail),
          uploadOk: sum(x => x.uploadOk), uploadFail: sum(x => x.uploadFail),
          snapshotOk: sum(x => x.snapshotOk), snapshotFail: sum(x => x.snapshotFail),
          ocrFail: sum(x => x.ocrFail),
          http401: sum(x => x.http401), http403: sum(x => x.http403),
          http5xx: sum(x => x.http5xx), httpOther: sum(x => x.httpOther),
        })
      }
    }

    return Response.json({ success: true, data: { points: out, gaps, uptimePct, restarts } })
  } catch (e) {
    console.error('panel/agent-history error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

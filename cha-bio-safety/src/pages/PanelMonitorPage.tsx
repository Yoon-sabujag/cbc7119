import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { panelApi, alarmApi, type AgentHistoryPoint, type AlarmEvent } from '../utils/api'
import LivePanelImage from '../components/panel/LivePanelImage'
import { freshnessLabel, watchdogLabel, parseKst } from '../components/panel/freshness'

// 화재수신반 에이전트 원격 모니터 (/panel-monitor · admin + 워치독 수신자(panel_watchdog=1), 메뉴 비연결).
// 계약 SSOT: panel-agent/MONITORING-SPEC.md §6 · 시안 승인 2026-07-14.
//
// ★ 이 화면의 제1원칙 (SPEC §6-② 회색 규칙):
//   근거 필드가 null 이면 무조건 회색("미지원/판정 불가")이다. 절대 초록으로 칠하지 않는다.
//   무증거를 정상으로 오독하는 것이 이 프로젝트가 고치려던 원죄다.
//   - matcherLoaded=false  → OCR 신호등 무조건 빨강 (ocr_confidence 무시. legacy 는 화재 위치를 못 잡는다)
//   - detectMode='off'     → 감지 신호등 회색(꺼짐). 빨강 아님 (의도된 설정이지 고장이 아니다)
//   - snapshotOk+Fail == 0 → 스냅샷 타일 회색(시도 없음). 초록 아님

type Tone = 'ok' | 'warn' | 'bad' | 'na' | 'off' | 'unsup'

const GRAY_BADGE: Record<string, string> = {
  na: '판정 불가', off: '꺼짐 (DETECT_MODE=off)', unsup: '미지원 (필드 null)',
}

function fmtUptime(sec: number | null | undefined): string {
  if (sec == null) return '—'
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60)
  if (d > 0) return `${d}일 ${String(h).padStart(2, '0')}시간`
  if (h > 0) return `${h}시간 ${m}분`
  return `${m}분`
}
function agoLabel(at: string | null | undefined): string {
  const ms = parseKst(at ?? null)
  if (ms == null) return '—'
  const s = Math.round((Date.now() - ms) / 1000)
  if (s < 60) return `${s}초 전`
  if (s < 3600) return `${Math.round(s / 60)}분 전`
  return `${Math.round(s / 3600)}시간 전`
}
const n0 = (v: number | null | undefined) => (v == null ? '—' : v.toLocaleString())

// 구간 델타 합 (null 은 결측 → 합산에서 제외하되, 전부 null 이면 null 을 유지한다)
function sumDelta(points: AgentHistoryPoint[], pick: (p: AgentHistoryPoint) => number | null): number | null {
  const vals = points.map(pick).filter((v): v is number => v != null)
  return vals.length === 0 ? null : vals.reduce((a, b) => a + b, 0)
}

export default function PanelMonitorPage() {
  const nav = useNavigate()

  const statusQ = useQuery({
    queryKey: ['panel-status-monitor'],
    queryFn: panelApi.getStatus,
    refetchInterval: 5000,
  })
  const histQ = useQuery({
    queryKey: ['agent-history', 24],
    queryFn: () => panelApi.getAgentHistory(24),
    refetchInterval: 60000,
  })
  const eventsQ = useQuery({
    queryKey: ['panel-events-monitor'],
    queryFn: () => alarmApi.getEvents(48),
    refetchInterval: 60000,
  })

  const s = statusQ.data
  const hist = histQ.data
  const points = hist?.points ?? []
  const events = eventsQ.data ?? []

  // 최근 1시간 구간.
  // ★ slice(-60) 을 쓰면 안 된다 (FEEDBACK §2) — 24h 조회는 항상 다운샘플을 타므로
  //   (1,440 > MAXP 1000 → step=2) 1포인트가 60초가 아니다. 60개를 자르면 실제로는 2시간이 된다.
  //   시각(at) 기준으로 자른다.
  const last1h = useMemo(() => {
    const cut = Date.now() - 3600_000
    return points.filter(p => { const t = parseKst(p.at); return t != null && t >= cut })
  }, [points])

  // 최근 경보 = OCR 신호등 판정 근거 (BACKEND_V2=0 이면 위치 확정 경보만 증거를 갖는다)
  const lastAlarm: AlarmEvent | undefined = events[0]

  // ── ② 파이프라인 4단계 신호등 (SPEC §6-②) ──
  const lights = useMemo(() => {
    const starved = s?.frameStarvedSec
    const lagMax = s?.frameLagMaxMs
    const detectMode = s?.detectMode
    const matcher = s?.matcherLoaded

    // 1. 캡처보드 수신 — frameStarvedSec + 색평균(blind) 이 근거
    // 화면 실명(blind, 260727): 캡처보드는 HDMI 무입력 시 검은 프레임을 합성하므로 기아로는 안 잡힌다.
    // 최근 ~7분 색평균 합이 전부 0 이면(유효 ≥3, 각 행 기아 <30s) 워치독 blind 사유와 동일 판정.
    const cut7 = Date.now() - 7 * 60_000
    const recentRgy = points.filter(p => {
      const t = parseKst(p.at)
      return t != null && t >= cut7 && p.rAvg != null && p.gAvg != null && p.yAvg != null
    })
    const blind = recentRgy.length >= 3 && recentRgy.every(p =>
      (p.rAvg! + p.gAvg! + p.yAvg!) < 0.01 && (p.frameStarvedSec ?? 0) < 30)

    let cap: { s: Tone; v: string; why: string; rule: string }
    if (starved == null) {
      cap = { s: 'unsup', v: '판정 불가', why: '<b>frameStarvedSec = null</b> — 구 에이전트이거나 MONITOR_TELEMETRY=0. 계측 필드가 오지 않는다.',
        rule: 'null → 회색. 0 으로 간주해 초록 칠하기 금지' }
    } else if (starved >= 30) {
      cap = { s: 'bad', v: '무신호', why: `마지막 프레임 <b>${starved}초 전</b> — heartbeat 는 살아 있으나 새 프레임이 없다. HDMI / 캡처보드 확인. <b>현재 화재를 감지할 수 없다.</b>`,
        rule: 'frameStarvedSec ≥ 30s → 위험 (5s 초록경계 / 10s 로컬로그 / 30s 푸시)' }
    } else if (blind) {
      cap = { s: 'bad', v: '검은 화면', why: `프레임은 수신되나(기아 <b>${starved}초</b>) 최근 색·표시등이 전무(색평균 0) — <b>HDMI 입력 / 수신반 화면 출력 사망 의심.</b> 라이브뷰에는 에이전트 진단 카드(보라)가 떠 있다. <b>현재 화재를 감지할 수 없다.</b>`,
        rule: '최근 ~7분 색평균 합 < 0.01 (유효 ≥3 · 기아 <30s) → 위험 — 워치독 blind 사유와 동일 판정' }
    } else if (starved >= 5) {
      cap = { s: 'warn', v: '수신 지연', why: `마지막 프레임 <b>${starved}초 전</b> · 60초 최대 지연 <b>${n0(lagMax)}ms</b>`,
        rule: '5s ≤ frameStarvedSec < 30s → 주의' }
    } else if (lagMax != null && lagMax >= 10000) {
      cap = { s: 'bad', v: '업로드 백로그', why: `프레임은 들어오는데(기아 <b>${starved}초</b>) 업로드가 밀린다 · 즉시값 <b>${n0(s?.frameLagMs)}ms</b> · <b>60초 최대 ${n0(lagMax)}ms</b>`,
        rule: 'frameLagMaxMs ≥ 10,000ms → 위험 (즉시값 단독 판정 금지)' }
    } else {
      cap = { s: lagMax != null && lagMax >= 2000 ? 'warn' : 'ok', v: '정상 수신',
        why: `마지막 프레임 <b>${starved}초 전</b> · 지연 즉시값 <b>${n0(s?.frameLagMs)}ms</b> · 60초 최대 <b>${n0(lagMax)}ms</b>`,
        rule: 'frameStarvedSec < 5s · frameLagMaxMs < 2,000ms' }
    }

    // 2. 업로드(R2) — 라이브 프레임 경로 한정
    const upFail1h = sumDelta(last1h, p => p.uploadFail)
    const upOk1h = sumDelta(last1h, p => p.uploadOk)
    const h401 = sumDelta(last1h, p => p.http401) ?? 0
    const h403 = sumDelta(last1h, p => p.http403) ?? 0
    let up: { s: Tone; v: string; why: string; rule: string }
    if (upFail1h == null && upOk1h == null) {
      up = { s: 'unsup', v: '미지원', why: '에이전트가 <b>uploadOk / uploadFail / httpErr</b> 필드를 보내지 않는다(null).',
        rule: '필드 null(구 에이전트) → 회색 "미지원". 0 으로 간주 금지' }
    } else if ((upFail1h ?? 0) >= 4 || h401 > 0 || h403 > 0) {
      up = { s: 'bad', v: '업로드 실패', why: `최근 1h 실패 <b>${n0(upFail1h)}</b> · HTTP 401 <b>${h401}</b> · 403(WAF) <b>${h403}</b>`,
        rule: 'uploadFail ≥ 4 또는 401/403 > 0 → 위험 (라이브 경로 한정)' }
    } else if ((upFail1h ?? 0) >= 1) {
      up = { s: 'warn', v: '간헐 실패', why: `최근 1h 실패 <b>${n0(upFail1h)}</b> · 재시도로 복구됨 · 성공 <b>${n0(upOk1h)}</b>`,
        rule: 'uploadFail 델타 1..3 → 주의' }
    } else {
      up = { s: 'ok', v: '정상', why: `최근 1h 실패 <b>0</b> · HTTP 401/403 <b>0</b> · 성공 <b>${n0(upOk1h)}</b>`,
        rule: 'uploadFail 델타 0 · httpErr 0 (라이브 경로 한정)' }
    }

    // 3. 감지 — detectMode=off 는 회색(꺼짐)이지 빨강이 아니다 (S9)
    const detectAgoMs = s?.lastDetectOkAt ? Date.now() - (parseKst(s.lastDetectOkAt) ?? 0) : null
    const detectAgoSec = detectAgoMs == null ? null : Math.round(detectAgoMs / 1000)
    const analyzeFail1h = sumDelta(last1h, p => p.analyzeFail)
    let det: { s: Tone; v: string; why: string; rule: string }
    if (detectMode === 'off') {
      det = { s: 'off', v: '꺼짐', why: '<b>DETECT_MODE=off</b> — 감지 스레드 미가동. 실패가 아니라 <b>의도적 비활성</b>이다. 이 에이전트는 경보를 발령하지 않는다.',
        rule: 'detectMode=off → 회색(꺼짐). 빨강 아님 · 초록 아님' }
    } else if (detectAgoSec == null) {
      det = { s: 'unsup', v: '판정 불가', why: '<b>lastDetectOkAt = null</b> — 계측 미지원 에이전트이거나 아직 감지 판정이 없다.',
        rule: '필드 null → 회색' }
    } else if (detectAgoSec > 180 || (analyzeFail1h ?? 0) > 0) {
      det = { s: 'bad', v: '멈춤', why: `마지막 판정 <b>${detectAgoSec}초 전</b> · analyze 실패 델타 <b>${n0(analyzeFail1h)}</b>`,
        rule: 'lastDetectOkAt > 180s 또는 analyzeFail > 0 → 위험' }
    } else if (detectAgoSec > 60) {
      det = { s: 'warn', v: '지연', why: `마지막 판정 <b>${detectAgoSec}초 전</b>`, rule: '60s ≤ lastDetectOkAt < 180s → 주의' }
    } else {
      det = { s: 'ok', v: '판정 중', why: `마지막 판정 <b>${detectAgoSec}초 전</b> · analyze 실패 델타 <b>0</b> · DETECT_MODE <b>${detectMode ?? '—'}</b>`,
        rule: 'lastDetectOkAt < 60s' }
    }

    // 4. OCR — 우선순위: matcherLoaded=false(빨강) > null(회색) > method=legacy(빨강) > confidence
    const ocr = lastAlarm?.ocr
    let o: { s: Tone; v: string; why: string; rule: string }
    if (matcher === false) {
      o = { s: 'bad', v: '화이트리스트 미로드', why: '<b>matcherLoaded=false</b> — legacy 폴백으로 동작 중. legacy 는 <b>화재 위치를 원리적으로 못 잡는다</b>(‘동작’ 문자열 의존).',
        rule: 'matcherLoaded=false → 빨강 (ocr_confidence 가 무엇이든 무시)' }
    } else if (matcher == null) {
      o = { s: 'unsup', v: '판정 불가', why: '<b>matcherLoaded = null</b> — 계측 미지원 에이전트.', rule: 'null → 회색' }
    } else if (!lastAlarm) {
      o = { s: 'na', v: '판정 불가', why: '최근 48시간 경보 없음 — 판정할 근거가 없다(경보가 없었을 뿐이다).', rule: '최근 경보 없음 → 회색' }
    } else if (ocr?.method === 'legacy') {
      o = { s: 'bad', v: 'legacy 폴백', why: `최근 경보가 <b>method=legacy</b> · score <b>null</b> — 화이트리스트 검증을 거치지 않은 확언이다. 퍼지 high 와 같은 신뢰로 읽으면 안 된다.`,
        rule: "method='legacy' → 빨강 (matcherLoaded=false 와 같은 사실의 다른 증거)" }
    } else if (ocr?.confidence == null) {
      o = { s: 'na', v: '증거 미도달', why: '최근 경보에 OCR 증거가 없다 — <b>BACKEND_V2=0</b> 이면 위치를 못 읽은 경보는 patch 자체를 안 보낸다. "OCR 성공"이 아니라 <b>관측 공백</b>이다.',
        rule: '증거 컬럼 전부 NULL → 회색. 절대 초록 금지' }
    } else if (ocr.confidence === 'high') {
      o = { s: 'ok', v: '위치 확정', why: `matcher 로드됨 · 최근 경보 confidence <b>high</b> (method ${ocr.method}, score ${ocr.score ?? '—'})`,
        rule: 'matcherLoaded && confidence=high && method≠legacy' }
    } else if (ocr.confidence === 'low') {
      o = { s: 'warn', v: '위치 미확정', why: `최근 경보 confidence <b>low</b> · score <b>${ocr.score ?? '—'}</b> (accept 88) · raw <b>${ocr.raw ?? '—'}</b>`,
        rule: 'high-only 게이팅 — low/none 이면 patch 에서 location 키 생략' }
    } else {
      o = { s: 'bad', v: '위치 미확정', why: `최근 경보 confidence <b>none</b> · raw <b>${ocr.raw || '(없음)'}</b> · OCR 라인 0`,
        rule: 'confidence=none → 빨강' }
    }

    return [{ n: '캡처보드', ...cap }, { n: '업로드', ...up }, { n: '감지', ...det }, { n: 'OCR', ...o }]
  }, [s, points, last1h, lastAlarm])

  // ── ③ 프레임 지연 시계열 (로그축 SVG. 주선 = frameLagMaxMs) ──
  //
  // ★ x 는 **시각 기준**이다 (FEEDBACK §3 / SPEC §6-③).
  //   배열 인덱스로 그리면 heartbeat 가 끊긴 구간(= 에이전트가 죽어 있던 시간)의 인접 두 점이
  //   직선으로 이어져 **다운타임이 차트에서 통째로 사라진다.**
  //   시각축 + gaps[] 회색 밴드 + gap 구간 선 끊기 — 셋이 같이 있어야 죽어 있던 시간이 보인다.
  const chart = useMemo(() => {
    const W = 1200, H = 260, L = 52, R = 12, T = 14, B = 26
    const iw = W - L - R, ih = H - T - B
    const maxY = 100000
    const ly = (v: number) => {
      const lo = Math.log10(100), hi = Math.log10(maxY)
      return T + ih - (Math.log10(Math.max(v, 100)) - lo) / (hi - lo) * ih
    }
    const times = points.map(p => parseKst(p.at)).filter((t): t is number => t != null)
    const t0 = times.length ? Math.min(...times) : 0
    const t1 = times.length ? Math.max(...times) : 1
    const span = Math.max(t1 - t0, 1)
    const lx = (t: number) => L + ((t - t0) / span) * iw

    const GAP_MS = 180_000   // status.ts 의 온라인 임계와 같은 축 — 이 이상 벌어지면 선을 잇지 않는다
    // null = 결측 → 선을 끊는다 (0 으로 이으면 "정상"으로 오독된다)
    // 시간 간격이 GAP_MS 를 넘어도 끊는다 (죽어 있던 구간을 직선으로 잇지 않는다)
    const mkPath = (pick: (p: AgentHistoryPoint) => number | null) => {
      let d = '', open = false, prevT: number | null = null
      points.forEach(p => {
        const t = parseKst(p.at)
        const v = pick(p)
        if (t == null || v == null) { open = false; prevT = t ?? prevT; return }
        if (prevT != null && t - prevT > GAP_MS) open = false      // gap → 선 끊김
        d += (open ? ' L ' : ' M ') + lx(t).toFixed(1) + ' ' + ly(v).toFixed(1)
        open = true; prevT = t
      })
      return d
    }

    // gaps[] → 회색 밴드 (SPEC §6-③ "gaps 는 회색 밴드. 선을 이어 그리면 죽어 있던 시간이 사라진다")
    const bands = (hist?.gaps ?? []).map(g => {
      const a = parseKst(g.from), b = parseKst(g.to)
      if (a == null || b == null) return null
      return { x: lx(a), w: Math.max(lx(b) - lx(a), 2), sec: g.sec }
    }).filter((b): b is { x: number; w: number; sec: number } => b != null)

    // x 눈금 — 시각 기준 5등분
    const ticks = times.length > 1
      ? [0, 0.25, 0.5, 0.75, 1].map(f => { const t = t0 + span * f; return { x: lx(t), label: new Date(t).toTimeString().slice(0, 5) } })
      : []

    return { W, H, L, R, T, ih, ly, lx, bands, ticks, hasData: times.length > 0,
      maxPath: mkPath(p => p.frameLagMaxMs), instPath: mkPath(p => p.frameLagMs) }
  }, [points, hist])

  // ── ⑥ 오류 카운터 (1h / 24h 델타) ──
  const tiles = useMemo(() => {
    const snapOk24 = sumDelta(points, p => p.snapshotOk)
    const snapFail24 = sumDelta(points, p => p.snapshotFail)
    // ★ snapshot_ok = 0 을 단독으로 초록 칠하지 않는다 (FEEDBACK §5).
    //   snapshotOn(스위치 실제 동작값)을 함께 봐야 "꺼져서 0" 과 "켜졌는데 경보가 없어서 0" 이 구분된다.
    const snapNever = s?.snapshotOn === false || (snapOk24 ?? 0) + (snapFail24 ?? 0) === 0
    return [
      { k: '업로드 실패', sub: '라이브 프레임 한정', v1: sumDelta(last1h, p => p.uploadFail), v24: sumDelta(points, p => p.uploadFail) },
      { k: 'HTTP 401', sub: '키 불일치', v1: sumDelta(last1h, p => p.http401), v24: sumDelta(points, p => p.http401) },
      { k: 'HTTP 403', sub: 'Cloudflare WAF', v1: sumDelta(last1h, p => p.http403), v24: sumDelta(points, p => p.http403) },
      { k: 'HTTP 5xx', sub: '서버', v1: sumDelta(last1h, p => p.http5xx), v24: sumDelta(points, p => p.http5xx) },
      { k: 'analyze 실패', sub: '감지 파이프', v1: sumDelta(last1h, p => p.analyzeFail), v24: sumDelta(points, p => p.analyzeFail) },
      { k: 'OCR 실패', sub: '위치 미확정 포함', v1: sumDelta(last1h, p => p.ocrFail), v24: sumDelta(points, p => p.ocrFail) },
      { k: '스냅샷 실패',
        sub: s?.snapshotOn === false ? '스냅샷 꺼짐 (시도 없음)' : snapNever ? '미사용 (시도 없음)' : `성공 ${n0(snapOk24)}건`,
        v1: snapFail24, v24: snapFail24, gray: snapNever },
      { k: '재시작', sub: '24h', v1: hist?.restarts.length ?? null, v24: hist?.restarts.length ?? null },
    ]
  }, [points, last1h, hist, s])

  // ── ⑦ R2 write 예산 — uploadOk 델타로 **실측** 업로드 간격을 역산한다 ──
  // ★ mins = points.length 를 쓰면 안 된다 (FEEDBACK §2) — 다운샘플 후 "1포인트 = 60초" 가정이 깨진다.
  //   실제 구간 길이를 첫/마지막 at 의 차로 구한다.
  const r2 = useMemo(() => {
    const upOk = sumDelta(points, p => p.uploadOk)
    const t0 = points.length > 1 ? parseKst(points[0].at) : null
    const t1 = points.length > 1 ? parseKst(points[points.length - 1].at) : null
    const spanSec = t0 != null && t1 != null && t1 > t0 ? (t1 - t0) / 1000 : null
    const interval = upOk && upOk > 0 && spanSec ? spanSec / upOk : null      // 실측 간격(초/건)
    const monthly = interval ? Math.round((30.4 * 86400) / interval) : null
    const pct = monthly ? Math.round((monthly / 1_000_000) * 100) : null
    // 설정값(cfg.frameInterval)과 나란히 보여준다 — 차이 = 업로드 왕복 시간(FEEDBACK §5)
    const cfgInterval = s?.frameInterval ?? null
    return { interval, monthly, pct, cfgInterval }
  }, [points, s])

  // ── 스위치 배지 (FEEDBACK §5) — 스위치가 꺼져 있으면 그 사실 자체가 관측 공백이다 ──
  const switchBadges = useMemo(() => {
    const out: { key: string; label: string; cls: string; why: string }[] = []
    // ★ 최상단 — 배포 어긋남. 이게 켜지면 나머지 배지/타일의 근거가 전부 흔들린다.
    //   codeVersion(코드 상수) vs agentVersion(config.env). 둘 다 있는데 다르면 = 도는 코드와 설정이 어긋난 상태.
    //   한쪽이라도 null 이면 판정 자체를 하지 않는다 — 구 에이전트는 아래 '구 에이전트' 배지가 처리한다.
    if (s?.codeVersion && s?.agentVersion && s.codeVersion !== s.agentVersion) {
      out.push({ key: 'ver', label: '배포 어긋남', cls: 'b-dang',
        why: `config 가 말하는 버전(${s.agentVersion})과 실제 도는 코드(${s.codeVersion})가 다르다. 이 화면의 모든 판단을 의심할 것 — 맥미니가 옛 코드로 돌고 있을 수 있다.` })
    }
    // SSH 기동 — macOS TCC 가 캡처보드를 조용히 차단한다. ffmpeg 는 에러 없이 뜨고 프레임만 0장이라
    // agentOnline 은 계속 true 다(2026-07-14: 그렇게 88분을 아무도 몰랐다). 배지로 먼저 의심하게 만든다.
    if (s?.launchedFromSsh === true) {
      out.push({ key: 'ssh', label: 'SSH 기동 — 캡처보드 차단 가능', cls: 'b-dang',
        why: 'SSH 세션에서 기동된 에이전트는 macOS TCC 화면수신 권한을 못 받아 프레임이 0장일 수 있다(에러는 안 난다). 프레임 기아가 같이 뜨면 GUI 에서 재시작할 것.' })
    }
    if (s?.telemetryOn == null) {
      out.push({ key: 'tel', label: '구 에이전트', cls: 'b-none',
        why: 'telemetryOn 필드가 없다 (v1.4.1 이하). 스위치 상태를 알 수 없다 — 회색이 정답이지 초록이 아니다.' })
    } else if (s.telemetryOn === false) {
      out.push({ key: 'tel', label: '계측 꺼짐', cls: 'b-dang',
        why: 'MONITOR_TELEMETRY=0 — 이 화면의 모든 값이 갱신되지 않는다.' })
    }
    if (s?.backendV2 === false) {
      out.push({ key: 'bv2', label: '증거 수집 꺼짐', cls: 'b-warn',
        why: 'BACKEND_V2=0 — 위치 미확정 경보의 OCR 원인을 알 수 없다(patch 자체를 안 보낸다).' })
    }
    if (s?.snapshotOn === false && s?.snapshotCfg === true) {
      out.push({ key: 'snap', label: '스냅샷 종속으로 꺼짐', cls: 'b-warn',
        why: 'SNAPSHOT_ON_ALARM=1 인데 상위 스위치(MONITOR_TELEMETRY/BACKEND_V2)가 0 이라 강제 OFF.' })
    } else if (s?.snapshotOn === false && s?.snapshotCfg === false) {
      out.push({ key: 'snap', label: '스냅샷 미사용', cls: 'b-none', why: 'SNAPSHOT_ON_ALARM=0 (의도된 설정).' })
    }
    return out
  }, [s])

  const fresh = freshnessLabel(s?.frameUpdatedAt ?? null)
  const watchdog = watchdogLabel(s?.lastHeartbeatAt ?? null)
  const stripTone: 'ok' | 'warn' | 'bad' =
    !s?.agentOnline || lights.some(l => l.s === 'bad') ? 'bad'
      : s?.detectMode === 'off' || lights.some(l => l.s === 'warn') ? 'warn' : 'ok'

  const warnLine = watchdog
    ?? (lights[0].v === '검은 화면'
      ? '화면 신호 없음(검은 화면) — 프레임은 수신되나 색·표시등이 전무. HDMI 입력/수신반 화면 출력 확인. 현재 화재를 감지할 수 없다.'
      : lights[0].s === 'bad' && s?.frameStarvedSec != null
      ? `프레임 기아 ${s.frameStarvedSec}초 — heartbeat 는 살아 있으나 새 프레임이 오지 않는다. HDMI 무신호 / 캡처보드 확인. 현재 화재를 감지할 수 없다.`
      : s?.detectMode === 'off'
        ? 'DETECT_MODE=off — 자동 화재 감지가 꺼져 있다. 프레임 업로드/라이브 보기는 동작하지만 이 에이전트는 경보를 발령하지 않는다. 의도한 설정인지 확인할 것.'
        : (s?.frameLagMaxMs != null && s.frameLagMaxMs >= 10000)
          ? `frameLagMaxMs ${n0(s.frameLagMaxMs)}ms — 화면은 "방금"이지만 실제로는 ${Math.round(s.frameLagMaxMs / 1000)}초 전 화면이다. 즉시값(${n0(s.frameLagMs)}ms)은 정상으로 보이므로 이 사고는 max 선에서만 드러난다.`
          : null)

  return (
    <div className="pm-root">
      <style>{CSS}</style>

      <header className="pm-header">
        <button className="pm-back" onClick={() => nav(-1)} aria-label="뒤로"><ChevronLeft size={20} /></button>
        <div className="pm-title">화재수신반 에이전트 모니터<small>운영자 전용</small></div>
      </header>

      <main className="pm-body">
        {/* ① 상단 상태 스트립 */}
        <div className={`strip${stripTone === 'bad' ? ' is-bad' : stripTone === 'warn' ? ' is-warn' : ''}`}>
          <div className="strip-main">
            <span className="dot blink" style={{ background: `var(--status-${stripTone === 'bad' ? 'danger' : stripTone === 'warn' ? 'warning' : 'safe'}-bar)` }} />
            <span>{s?.agentOnline ? '에이전트 온라인' : '에이전트 오프라인'}</span>
          </div>
          <div className="strip-kv">마지막 heartbeat<b> {agoLabel(s?.lastHeartbeatAt)}</b></div>
          {/* 버전 — 평소엔 도는 코드 하나만. 어긋났을 때만 code/config 를 같이 보여준다
              (무엇이 어긋났는지 못 보면 '배포 어긋남' 배지는 알림일 뿐 진단이 못 된다). */}
          <div className="strip-kv">버전
            <b className="mono"> {s?.codeVersion ?? s?.agentVersion ?? '—'}</b>
            {s?.codeVersion && s?.agentVersion && s.codeVersion !== s.agentVersion && (
              <b className="mono" style={{ color: 'var(--status-danger)' }}> / config {s.agentVersion}</b>
            )}
          </div>
          <div className="strip-kv">가동<b> {fmtUptime(s?.uptimeSec)}</b></div>
          <div className="strip-kv">감지모드
            <span className={`badge ${s?.detectMode === 'live' ? 'b-safe' : s?.detectMode == null ? 'b-none' : 'b-warn'}`} style={{ marginLeft: 4 }}>
              {s?.detectMode ?? 'null'}
            </span>
          </div>
          <div className="strip-kv">24h 가동률<b> {hist?.uptimePct != null ? `${hist.uptimePct}%` : '—'}</b></div>
          <div className="strip-kv">재시작<b> {hist?.restarts.length ?? '—'}회</b></div>

          {/* ── 스위치 배지 3종 (FEEDBACK §5) ──
              "설정이 의도대로 켜져 있는가"를 원격에서 본다. 지금까지는 맥미니 기동 로그를 봐야 알 수 있었다.
              필드가 null = 구 에이전트(v1.4.1 이하) → 회색. 초록 칠하기 금지. */}
          {switchBadges.map(b => (
            <span key={b.key} className={`badge ${b.cls}`} title={b.why}>{b.label}</span>
          ))}
          {warnLine && <div className="strip-warnline" style={{
            color: `var(--status-${stripTone === 'warn' ? 'warning' : 'danger'})`,
            background: `var(--status-${stripTone === 'warn' ? 'warning' : 'danger'}-bg)`,
          }}>{warnLine}</div>}
        </div>

        {/* ② 파이프라인 신호등 */}
        <section className="section">
          <h2 className="section-title">파이프라인
            <span className="hint">캡처보드 → 업로드 → 감지 → OCR · 한 칸이라도 빨강이면 화재를 못 잡는다 · 회색 = 꺼짐/미지원/판정불가 (초록 아님, 빨강도 아님)</span>
          </h2>
          <div className="grid lights">
            {lights.map(l => (
              <div className="light" data-s={l.s} key={l.n}>
                <div className="light-head">
                  <span className="light-lamp" />
                  <span className="light-name">{l.n}</span>
                  {GRAY_BADGE[l.s] && <span className="badge b-none">{GRAY_BADGE[l.s]}</span>}
                </div>
                <div className="light-verdict">{l.v}</div>
                <div className="light-why" dangerouslySetInnerHTML={{ __html: l.why }} />
                <div className="light-rule mono">{l.rule}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ③ 프레임 지연 시계열 */}
        <section className="section">
          <h2 className="section-title">프레임 지연 (24시간)
            <span className="hint">굵은 선 = frameLagMaxMs(60초 롤링 최대). 가는 선 = frameLagMs(즉시값). heartbeat 60초 · 업로드 2.75초 → 즉시값은 22회 중 1회 표본이라 스파이크를 놓친다</span>
          </h2>
          <div className="card">
            {points.length === 0 ? (
              <div className="empty">heartbeat 이력이 없습니다 — 계측 에이전트(1.4.x) 가동 후 60초마다 쌓입니다.</div>
            ) : (
              <div className="chart-wrap">
                <svg viewBox={`0 0 ${chart.W} ${chart.H}`} width={chart.W} style={{ maxWidth: '100%', height: 'auto', minWidth: 640 }}>
                  {[100, 1000, 10000, 100000].map(v => (
                    <g key={v}>
                      <line x1={chart.L} x2={chart.W - chart.R} y1={chart.ly(v)} y2={chart.ly(v)} stroke="var(--grid)" strokeWidth={1} />
                      <text x={chart.L - 8} y={chart.ly(v) + 3} textAnchor="end" fill="var(--text-tertiary)" fontSize={10}>
                        {v >= 1000 ? `${v / 1000}s` : `${v}ms`}
                      </text>
                    </g>
                  ))}
                  {[[2000, 'warning', '주의 2,000ms'], [10000, 'danger', '위험 10,000ms']].map(([v, c, lab]) => (
                    <g key={String(v)}>
                      <line x1={chart.L} x2={chart.W - chart.R} y1={chart.ly(v as number)} y2={chart.ly(v as number)}
                        stroke={`var(--status-${c}-bar)`} strokeWidth={1} strokeDasharray="4 4" opacity={0.75} />
                      <text x={chart.W - chart.R} y={chart.ly(v as number) - 4} textAnchor="end" fill={`var(--status-${c})`} fontSize={10}>{lab as string}</text>
                    </g>
                  ))}
                  {/* 80초 사고선 — "그때가 여기였다" */}
                  <line x1={chart.L} x2={chart.W - chart.R} y1={chart.ly(80000)} y2={chart.ly(80000)}
                    stroke="var(--status-fire-bar)" strokeWidth={1} strokeDasharray="2 5" opacity={0.6} />
                  <text x={chart.L + 4} y={chart.ly(80000) - 4} fill="var(--status-fire)" fontSize={10}>80초 지연 사고선</text>

                  {/* gaps = 에이전트가 죽어 있던 시간. 회색 밴드로 그린다 — 선을 이으면 이 시간이 사라진다 */}
                  {chart.bands.map((b, k) => (
                    <g key={`gap${k}`}>
                      <rect x={b.x} y={chart.T} width={b.w} height={chart.ih} fill="var(--text-disabled)" opacity={0.22} />
                      {b.w > 40 && (
                        <text x={b.x + b.w / 2} y={chart.T + chart.ih / 2} textAnchor="middle"
                          fill="var(--text-secondary)" fontSize={11} fontWeight={700}>
                          끊김 {b.sec >= 3600 ? `${Math.round(b.sec / 3600)}시간` : `${Math.round(b.sec / 60)}분`}
                        </text>
                      )}
                    </g>
                  ))}

                  <path d={chart.instPath} fill="none" stroke="var(--accent)" strokeWidth={1.4} opacity={0.85} />
                  <path d={chart.maxPath} fill="none" stroke="var(--status-fire-bar)" strokeWidth={3} strokeLinejoin="round" />

                  {chart.ticks.map((t, k) => (
                    <text key={k} x={t.x} y={chart.H - 8} textAnchor="middle" fill="var(--text-tertiary)" fontSize={10}>
                      {t.label}
                    </text>
                  ))}
                </svg>
              </div>
            )}
            <div className="chart-legend">
              <span><i style={{ background: 'var(--status-fire-bar)', height: 4 }} /><b>frameLagMaxMs</b> — 60초 롤링 최대 (이 화면의 핵심)</span>
              <span><i style={{ background: 'var(--accent)' }} />frameLagMs — heartbeat 시점 즉시값</span>
              <span><i style={{ background: 'var(--status-warning-bar)' }} />주의 2,000ms</span>
              <span><i style={{ background: 'var(--status-danger-bar)' }} />위험 10,000ms</span>
            </div>
            <div className="note">
              즉시값만 그리면 <b>80초 스파이크가 차트에서 사라진다</b> — 업로드는 2.75초마다인데 heartbeat 는 60초마다라 22회 중 1회만 표본이기 때문.
              그래서 에이전트가 60초 롤링 최대(<span className="mono">frame_lag_max_ms</span>)를 함께 보내고, 화면은 그 <b>max 선</b>으로 판정한다.
              {hist && hist.gaps.length > 0 && <> · <b>heartbeat 끊김 {hist.gaps.length}구간</b>(총 {hist.gaps.reduce((a, g) => a + g.sec, 0)}초) — 선이 끊긴 자리가 죽어 있던 시간이다.</>}
            </div>
          </div>
        </section>

        {/* ④ 라이브 프레임 */}
        <section className="section">
          <h2 className="section-title">라이브 프레임 <span className="hint">캡처시각과 업로드시각을 함께 표시 — 둘의 혼동이 80초 사고를 가렸다</span></h2>
          <div className="grid live-2col">
            <div className="card" style={{ padding: 10 }}>
              <LivePanelImage frameUpdatedAt={s?.frameUpdatedAt ?? null} alt="화재수신반 라이브" />
            </div>
            <div className="card">
              <table className="cap-table">
                <tbody>
                  <tr><td>신선도</td><td><span className={`badge ${fresh.tone === 'ok' ? 'b-safe' : 'b-dang'}`}>{fresh.label}</span></td></tr>
                  <tr><td>캡처시각 <span className="dim">frameCapturedAt</span></td><td className="mono">{s?.frameCapturedAt ?? '—'}</td></tr>
                  <tr><td>업로드시각 <span className="dim">frameUpdatedAt</span></td><td className="mono">{s?.frameUpdatedAt ?? '—'}</td></tr>
                  <tr><td>지연 <span className="dim">frameLagMs</span></td><td className="mono">{s?.frameLagMs != null ? `${n0(s.frameLagMs)} ms` : '—'}</td></tr>
                  <tr><td>60초 최대 <span className="dim">frameLagMaxMs</span></td><td className="mono">
                    {s?.frameLagMaxMs != null
                      ? <>{n0(s.frameLagMaxMs)} ms <span className={`badge ${s.frameLagMaxMs >= 10000 ? 'b-dang' : s.frameLagMaxMs >= 2000 ? 'b-warn' : 'b-safe'}`}>
                        {s.frameLagMaxMs >= 10000 ? '위험' : s.frameLagMaxMs >= 2000 ? '주의' : '정상'}</span></>
                      : <span className="badge b-none">null · 계측 미지원</span>}
                  </td></tr>
                  <tr><td>기아 <span className="dim">frameStarvedSec</span></td><td className="mono">
                    {s?.frameStarvedSec != null
                      ? <>{s.frameStarvedSec}초 <span className={`badge ${s.frameStarvedSec >= 30 ? 'b-dang' : s.frameStarvedSec >= 5 ? 'b-warn' : 'b-safe'}`}>
                        {s.frameStarvedSec >= 30 ? '위험 (≥30s)' : s.frameStarvedSec >= 5 ? '주의' : '정상'}</span></>
                      : <span className="badge b-none">null · 계측 미지원</span>}
                  </td></tr>
                </tbody>
              </table>
              <div className="note">
                화면의 "방금"은 <b>업로드</b> 시각 기준이다. 80초 백로그가 있으면 캡처시각과 <b>frameLagMaxMs</b> 를 봐야만 드러난다.
                경보 스냅샷 업로드는 이 신선도를 갱신하지 <b>않는다</b>(C2 게이팅) — 그래야 라이브가 죽은 채 화재가 나도 화면이 거짓말을 하지 않는다.
              </div>
            </div>
          </div>
        </section>

        {/* ⑤ 경보 타임라인 */}
        <section className="section">
          <h2 className="section-title">경보 타임라인 (48시간)
            <span className="hint">OCR 증거 — 위치가 비어 있으면 왜 비었는지 이 행에서 끝난다</span>
          </h2>
          <div className="card" style={{ padding: 0 }}>
            {events.length === 0 ? (
              <div className="empty">최근 48시간 경보 없음.</div>
            ) : events.map(a => {
              const ocr = a.ocr
              const noEvidence = !ocr || ocr.confidence == null
              return (
                <div className="tl-row" key={a.id}>
                  <div>
                    {a.snapshotUrl
                      ? <img className="tl-thumb" src={a.snapshotUrl} alt="경보 스냅샷" />
                      : <div className="tl-thumb none">
                          <span className="t1">스냅샷 없음</span>
                          <span className="t2">3단계 미배포<br />(SNAPSHOT_ON_ALARM=0)</span>
                        </div>}
                  </div>
                  <div>
                    <span className={`badge ${a.type === 'fire' ? 'b-dang' : a.type === 'fault' ? 'b-warn' : 'b-safe'}`}>
                      {a.type === 'fire' ? '화재' : a.type === 'fault' ? '고장' : '설비동작'}
                    </span>
                  </div>
                  <div>
                    <div className="tl-when mono">{a.detectedAt}</div>
                    <div className={`tl-loc${a.location ? '' : ' empty'}`}>
                      {a.location ?? (noEvidence ? '위치 미확보 (증거 미수집 — BACKEND_V2=0)' : '위치 미확정 — 수신반 확인 필요')}
                    </div>
                    <div className="ev">
                      <span className="chip">OCR raw <b className="mono">{ocr?.raw || '(없음)'}</b></span>
                      <span className="chip">score <b className="mono">{ocr?.score ?? 'null'}</b></span>
                      <span className="chip">confidence <b className={`badge ${ocr?.confidence === 'high' ? 'b-safe' : ocr?.confidence === 'low' ? 'b-warn' : 'b-none'}`}>{ocr?.confidence ?? '—'}</b></span>
                      <span className="chip">method <b className="mono">{ocr?.method ?? '—'}</b></span>
                      <span className="chip">ocrMs <b className="mono">{n0(ocr?.ms)}</b></span>
                      {ocr?.method === 'legacy' && <span className="badge b-warn">legacy(검증 없음)</span>}
                    </div>
                    <div className="ev">
                      <span className="rgy">
                        <span className="r">R {a.redRatio != null ? (a.redRatio * 100).toFixed(1) : '—'}%</span>
                        <span className="g">G {a.greenRatio != null ? (a.greenRatio * 100).toFixed(1) : '—'}%</span>
                        <span className="y">Y {a.yellowRatio != null ? (a.yellowRatio * 100).toFixed(1) : '—'}%</span>
                      </span>
                      <span className="chip">푸시 재발송 <b className="mono">pushCount {a.pushCount ?? 0}</b>회</span>
                    </div>
                    {ocr && (ocr.lines.badge.length > 0 || ocr.lines.wide.length > 0) && (
                      <div className="tl-lines mono">
                        badge: [{ocr.lines.badge.join(' · ')}] · wide: [{ocr.lines.wide.join(' · ')}]
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="note" style={{ marginTop: 8 }}>
            <span className="mono">SNAPSHOT_ON_ALARM</span> 은 기본값 <b>0(꺼짐)</b>이다. <span className="mono">BACKEND_V2=1</span> + frame.ts 게이팅 배포 후에만 켠다.
            그 전 경보 행의 "스냅샷 없음"은 <b>정상 상태</b>다 — 빈 칸이 아니라 상태다.
          </div>
        </section>

        {/* ⑥ 오류 카운터 */}
        <section className="section">
          <h2 className="section-title">오류 카운터
            <span className="hint">누적 카운터의 델타. 0이면 회색 — 정상일 때 조용해야 이상이 보인다 · uploadFail/httpErr 는 <b>라이브 프레임 경로 한정</b>, 스냅샷 실패는 따로 센다</span>
          </h2>
          <div className="grid tiles">
            {tiles.map(t => {
              const hot = !t.gray && (t.v1 ?? 0) > 0
              const warm = !t.gray && !hot && (t.v24 ?? 0) > 0
              return (
                <div className={`tile${hot ? ' hot' : warm ? ' warm' : ''}`} key={t.k}>
                  <div className="tile-n">{t.v24 == null ? '—' : t.v24}</div>
                  <div className="tile-k">{t.k}</div>
                  <div className="tile-s">{t.v24 == null ? '구 에이전트 · 필드 없음' : `1h ${t.v1 ?? 0} · ${t.sub}`}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ⑦ R2 write 예산 */}
        <section className="section">
          <h2 className="section-title">R2 write 예산 <span className="hint">Class A 무료한도 100만/월 가정</span></h2>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em' }}>{r2.pct != null ? `${r2.pct}%` : '—'}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {r2.monthly != null
                  ? <>예상 {r2.monthly.toLocaleString()} / 1,000,000 write · 업로드 간격 <b>실측 {r2.interval!.toFixed(2)}초</b>
                    {r2.cfgInterval != null && <> · 설정 {r2.cfgInterval.toFixed(1)}초
                      <span style={{ color: 'var(--text-tertiary)' }}> (차이 {Math.max(r2.interval! - r2.cfgInterval, 0).toFixed(2)}초 = 업로드 왕복)</span></>}
                  </>
                  : '업로드 카운터 없음 — 계측 에이전트 가동 후 실측 간격으로 역산합니다.'}
              </span>
            </div>
            <div className="meter"><i style={{
              width: `${Math.min(r2.pct ?? 0, 100)}%`,
              background: (r2.pct ?? 0) >= 95 ? 'var(--status-danger-bar)' : (r2.pct ?? 0) >= 80 ? 'var(--status-warning-bar)' : 'var(--status-safe-bar)',
            }} /></div>
            <div className="formula mono">월 Class A writes ≈ (30.4일 × 86,400초) ÷ 실측_업로드간격초</div>
            <div className="note">
              업로드 간격은 heartbeat 간 <span className="mono">uploadOk</span> 델타로 역산한 <b>실측값</b>이다(설정값 FRAME_INTERVAL 이 아니다).
              경보 스냅샷의 write 는 "경보당 1회"가 아니라 <b>"트리거 전이당 1회"</b> — dedupe 재trigger 시 같은 키에 재업로드된다.
              {(r2.pct ?? 0) >= 80 && <b> · 소진율 {r2.pct}% — FRAME_INTERVAL 상향 검토.</b>}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

// 시안(승인 2026-07-14)의 CSS — 앱 tokens.css 변수만 사용한다.
const CSS = `
/* 앱 셸(App.tsx)은 100dvh + overflow:hidden 3중 체인이라 페이지가 자체 스크롤 컨테이너를
   가져야 한다(FireAlarmHistoryPage 의 flex-1 overflow-y-auto 패턴). min-height:100vh 블록으로
   두면 어느 조상도 스크롤을 안 만들어 모바일에서 통째로 잠긴다 (260727 실기기 발견). */
.pm-root { flex:1; min-height:0; display:flex; flex-direction:column; background:var(--surface-page); color:var(--text-primary); }
.pm-root .mono { font-family:'JetBrains Mono','D2 Coding',ui-monospace,monospace; font-variant-numeric:tabular-nums; }
.pm-root .dim { color:var(--text-disabled); }
.pm-header {
  position:sticky; top:0; z-index:20; background:var(--surface-raised);
  border-bottom:1px solid var(--border-default); height:48px; padding:0 12px;
  display:flex; align-items:center; gap:8px;
}
.pm-back {
  width:32px; height:32px; border-radius:7px; background:var(--surface-sunken);
  border:1px solid var(--border-default); color:var(--text-secondary); cursor:pointer;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.pm-title { font-size:18px; font-weight:600; }
.pm-title small { font-size:12px; color:var(--text-tertiary); font-weight:400; margin-left:8px; }
.pm-body { flex:1; min-height:0; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:16px; width:100%; max-width:1680px; margin:0 auto; }
.pm-root .section { margin-bottom:24px; }
.pm-root .section-title {
  font-size:13px; font-weight:700; color:var(--text-tertiary); letter-spacing:.04em;
  margin:0 0 8px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;
}
.pm-root .section-title .hint { font-weight:400; letter-spacing:0; color:var(--text-disabled); font-size:12px; }
.pm-root .card { background:var(--surface-raised); border:1px solid var(--border-default); border-radius:12px; padding:14px; }
.pm-root .grid { display:grid; gap:12px; }
.pm-root .empty { padding:28px 14px; text-align:center; color:var(--text-tertiary); font-size:13px; }

.pm-root .strip {
  display:flex; align-items:center; gap:14px; flex-wrap:wrap;
  background:var(--surface-raised); border:1px solid var(--border-default);
  border-left:3px solid var(--status-safe-bar); border-radius:12px; padding:10px 14px; margin-bottom:12px;
}
.pm-root .strip.is-warn { border-left-color:var(--status-warning-bar); }
.pm-root .strip.is-bad  { border-left-color:var(--status-danger-bar); }
.pm-root .strip-main { display:flex; align-items:center; gap:8px; font-weight:700; font-size:15px; }
.pm-root .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.pm-root .dot.blink { animation:pm-blink 2s ease-in-out infinite; }
@keyframes pm-blink { 0%,100%{opacity:1} 50%{opacity:.35} }
.pm-root .strip-kv { font-size:12px; color:var(--text-tertiary); display:inline-flex; align-items:center; gap:3px; }
.pm-root .strip-kv b { color:var(--text-secondary); font-weight:600; }
.pm-root .strip-warnline {
  flex-basis:100%; font-size:12px; font-weight:700; border-radius:8px; padding:6px 10px;
}

.pm-root .badge { display:inline-flex; align-items:center; border-radius:6px; padding:2px 7px; font-size:11px; font-weight:800; line-height:1.5; }
.pm-root .b-safe { color:var(--status-safe);    background:var(--status-safe-bg); }
.pm-root .b-warn { color:var(--status-warning); background:var(--status-warning-bg); }
.pm-root .b-dang { color:var(--status-danger);  background:var(--status-danger-bg); }
.pm-root .b-none { color:var(--text-tertiary);  background:var(--surface-sunken); }

.pm-root .lights { grid-template-columns:repeat(4,1fr); }
.pm-root .light {
  background:var(--surface-raised); border:1px solid var(--border-default);
  border-radius:12px; padding:14px; border-top:3px solid var(--text-disabled);
}
.pm-root .light[data-s="ok"]   { border-top-color:var(--status-safe-bar); }
.pm-root .light[data-s="warn"] { border-top-color:var(--status-warning-bar); }
.pm-root .light[data-s="bad"]  { border-top-color:var(--status-danger-bar); background:var(--status-danger-bg); }
.pm-root .light[data-s="na"], .pm-root .light[data-s="off"], .pm-root .light[data-s="unsup"] {
  border-top-color:var(--text-disabled);
  background:repeating-linear-gradient(135deg,transparent 0 6px,rgba(127,127,127,.06) 6px 12px);
}
.pm-root .light-head { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
.pm-root .light-name { font-size:14px; font-weight:700; flex:1; }
.pm-root .light-lamp { width:11px; height:11px; border-radius:50%; background:var(--text-disabled); flex-shrink:0; }
.pm-root .light[data-s="ok"]   .light-lamp { background:var(--status-safe-bar); }
.pm-root .light[data-s="warn"] .light-lamp { background:var(--status-warning-bar); }
.pm-root .light[data-s="bad"]  .light-lamp { background:var(--status-danger-bar); animation:pm-blink 1.2s ease-in-out infinite; }
.pm-root .light-verdict { margin-top:8px; font-size:20px; font-weight:700; letter-spacing:-.01em; }
.pm-root .light[data-s="ok"]   .light-verdict { color:var(--status-safe); }
.pm-root .light[data-s="warn"] .light-verdict { color:var(--status-warning); }
.pm-root .light[data-s="bad"]  .light-verdict { color:var(--status-danger); }
.pm-root .light[data-s="na"] .light-verdict, .pm-root .light[data-s="off"] .light-verdict, .pm-root .light[data-s="unsup"] .light-verdict { color:var(--text-tertiary); }
.pm-root .light-why { margin-top:6px; font-size:12px; color:var(--text-secondary); line-height:1.55; }
.pm-root .light-rule { margin-top:6px; font-size:11px; color:var(--text-disabled); }

.pm-root .chart-wrap { overflow-x:auto; }
.pm-root .chart-legend { display:flex; gap:14px; flex-wrap:wrap; font-size:11px; color:var(--text-tertiary); margin-top:8px; }
.pm-root .chart-legend i { display:inline-block; width:14px; height:3px; border-radius:2px; margin-right:5px; vertical-align:middle; }
.pm-root .note {
  margin-top:10px; font-size:11.5px; color:var(--text-secondary); background:var(--surface-sunken);
  border-radius:8px; padding:8px 10px; line-height:1.55;
}

.pm-root .live-2col { grid-template-columns:minmax(0,420px) minmax(0,1fr); }
.pm-root .cap-table { width:100%; border-collapse:collapse; font-size:12px; }
.pm-root .cap-table td { padding:5px 0; border-bottom:1px solid var(--border-default); vertical-align:top; }
.pm-root .cap-table td:first-child { color:var(--text-tertiary); width:170px; white-space:nowrap; }
.pm-root .cap-table tr:last-child td { border-bottom:0; }

.pm-root .tl-row {
  display:grid; grid-template-columns:132px 68px minmax(0,1fr); gap:12px;
  padding:11px 12px; border-bottom:1px solid var(--border-default); align-items:start;
}
.pm-root .tl-row:last-child { border-bottom:0; }
.pm-root .tl-thumb {
  width:132px; aspect-ratio:16/9; border-radius:6px; overflow:hidden; background:#05070a;
  border:1px solid var(--border-default); object-fit:cover;
}
.pm-root .tl-thumb.none {
  background:repeating-linear-gradient(135deg,transparent 0 5px,rgba(127,127,127,.06) 5px 10px), var(--surface-sunken);
  border-style:dashed; display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:2px; text-align:center; color:var(--text-tertiary); padding:4px;
}
.pm-root .tl-thumb.none .t1 { font-size:10.5px; font-weight:700; }
.pm-root .tl-thumb.none .t2 { font-size:9px; color:var(--text-disabled); line-height:1.35; }
.pm-root .tl-when { font-size:11.5px; color:var(--text-tertiary); }
.pm-root .tl-loc { font-size:13.5px; font-weight:700; margin-top:2px; }
.pm-root .tl-loc.empty { color:var(--status-warning); }
.pm-root .tl-lines { font-size:11.5px; color:var(--text-tertiary); margin-top:5px; word-break:break-all; }
.pm-root .ev { display:flex; gap:6px; flex-wrap:wrap; margin-top:5px; align-items:center; }
.pm-root .chip {
  display:inline-flex; align-items:baseline; gap:4px; font-size:11px; border-radius:6px; padding:2px 7px;
  background:var(--surface-sunken); color:var(--text-secondary); border:1px solid var(--border-default);
}
.pm-root .chip b { color:var(--text-primary); font-weight:700; }
.pm-root .rgy { display:flex; gap:5px; font-size:11px; }
.pm-root .rgy span { border-radius:5px; padding:1px 6px; font-weight:700; }
.pm-root .rgy .r { color:var(--status-danger);  background:var(--status-danger-bg); }
.pm-root .rgy .g { color:var(--status-safe);    background:var(--status-safe-bg); }
.pm-root .rgy .y { color:var(--status-warning); background:var(--status-warning-bg); }

.pm-root .tiles { grid-template-columns:repeat(8,1fr); }
.pm-root .tile { background:var(--surface-raised); border:1px solid var(--border-default); border-radius:12px; padding:11px 12px; }
.pm-root .tile.hot  { border-color:var(--status-danger-bar);  background:var(--status-danger-bg); }
.pm-root .tile.warm { border-color:var(--status-warning-bar); background:var(--status-warning-bg); }
.pm-root .tile-n { font-size:26px; font-weight:700; line-height:1.1; color:var(--text-disabled); letter-spacing:-.02em; }
.pm-root .tile.hot .tile-n  { color:var(--status-danger); }
.pm-root .tile.warm .tile-n { color:var(--status-warning); }
.pm-root .tile-k { font-size:12px; color:var(--text-secondary); margin-top:3px; }
.pm-root .tile-s { font-size:11px; color:var(--text-tertiary); margin-top:1px; }

.pm-root .meter { height:10px; border-radius:99px; background:var(--surface-sunken); overflow:hidden; margin:10px 0 6px; }
.pm-root .meter i { display:block; height:100%; border-radius:99px; }
.pm-root .formula {
  font-size:12px; background:var(--surface-sunken); border-radius:8px; padding:9px 11px; color:var(--text-secondary);
  overflow-x:auto; white-space:nowrap;
}

@media (max-width:1439px) { .pm-root .tiles { grid-template-columns:repeat(4,1fr); } }
@media (max-width:1023px) {
  .pm-root .lights { grid-template-columns:repeat(2,1fr); }
  .pm-root .live-2col { grid-template-columns:1fr; }
}
@media (max-width:719px) {
  .pm-body { padding:12px; }
  .pm-root .lights, .pm-root .tiles { grid-template-columns:1fr 1fr; }
  .pm-root .tl-row { grid-template-columns:1fr; gap:6px; }
  .pm-root .tl-thumb { width:100%; }
  .pm-title { font-size:16px; }
}
`

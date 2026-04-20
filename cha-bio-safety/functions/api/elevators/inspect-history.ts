// functions/api/elevators/inspect-history.ts
// 공단 공식 API(ElevatorInspectsafeService) 기반 승강기 검사이력 동기화/조회.
//
// 주의사항:
// - 최초 1회는 sync_all=1 로 전체 캐싱 권장 (17대 × 10~20건 × fail API 호출 = 시간 소요).
// - fail_cd 가 빈 검사건은 elevator_inspect_fails 에 아무것도 안 들어감 (정상).
// - 민원24 API(별도 핸들러) 와는 독립적 — 서로 데이터 섞지 말 것.
//
// 엔드포인트:
//   GET /api/elevators/inspect-history?cert_no=2114-971              → 단일 호기 동기화 + 반환
//   GET /api/elevators/inspect-history?cert_no=2114-971&refresh=0    → 캐시 반환(동기화 안 함)
//   GET /api/elevators/inspect-history?sync_all=1                    → elevators cert_no 전체 순차 동기화 (admin only)

import type { Env } from '../../_middleware'
import {
  fetchInspectHistory,
  fetchFailDetails,
  yyyymmdd_to_iso,
} from './_inspectsafe'

// ── 타입 정의 ────────────────────────────────────────────────────────────

interface CtxData { staffId: string; staffName: string; role: string }

interface SyncOneResult {
  elevatorNo: string
  historyCount: number
  failCount: number
  lastInspectDate: string | null
}

interface HistoryRow {
  elevator_no: string
  fail_cd: string
  inspect_date: string | null
  inspect_kind: string | null
  inspect_institution: string | null
  company_name: string | null
  disp_words: string | null
  valid_start: string | null
  valid_end: string | null
  rated_speed: string | null
  rated_cap: number | null
  floor_count: number | null
  building_name: string | null
  address: string | null
  raw_json: string | null
  fetched_at: string
}

interface FailRow {
  fail_cd: string
  fail_desc: string | null
  fail_desc_inspector: string | null
  standard_article: string | null
  standard_title: string | null
}

// ── 헬퍼 ────────────────────────────────────────────────────────────────

function certToElevatorNo(certNo: string): string {
  const cleaned = certNo.replace(/[\s-]/g, '')
  if (!/^\d{7}$/.test(cleaned)) {
    throw new Error('cert_no 형식이 올바르지 않습니다 (7자리 숫자 필요): ' + certNo)
  }
  return cleaned
}

// 한 호기 검사이력 전체를 공단 API에서 가져와 D1에 UPSERT 후 요약 반환.
async function syncOne(env: Env, elevatorNo: string): Promise<SyncOneResult> {
  const items = await fetchInspectHistory(elevatorNo)

  // ── elevator_inspect_history UPSERT ──
  for (const item of items) {
    const inspectDate = yyyymmdd_to_iso(item.inspctDe) || null
    const validStart = yyyymmdd_to_iso(item.applcBeDt) || null
    const validEnd = yyyymmdd_to_iso(item.applcEnDt) || null
    const ratedCap = parseInt(item.ratedCap) || null
    const floorCount = parseInt(item.shuttleFloorCnt) || null
    const address = ((item.address1 ?? '') + ' ' + (item.address2 ?? '')).trim() || null

    await env.DB.prepare(`
      INSERT INTO elevator_inspect_history
        (elevator_no, fail_cd, inspect_date, inspect_kind, inspect_institution,
         company_name, disp_words, valid_start, valid_end,
         rated_speed, rated_cap, floor_count,
         building_name, address, raw_json, fetched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(fail_cd) DO UPDATE SET
        elevator_no=excluded.elevator_no,
        inspect_date=excluded.inspect_date,
        inspect_kind=excluded.inspect_kind,
        inspect_institution=excluded.inspect_institution,
        company_name=excluded.company_name,
        disp_words=excluded.disp_words,
        valid_start=excluded.valid_start,
        valid_end=excluded.valid_end,
        rated_speed=excluded.rated_speed,
        rated_cap=excluded.rated_cap,
        floor_count=excluded.floor_count,
        building_name=excluded.building_name,
        address=excluded.address,
        raw_json=excluded.raw_json,
        fetched_at=excluded.fetched_at
    `).bind(
      elevatorNo,
      item.failCd,
      inspectDate,
      item.inspctKindNm || null,
      item.inspctInsttNm || null,
      item.companyNm || null,
      item.dispWords || null,
      validStart,
      validEnd,
      item.ratedSpeed || null,
      ratedCap,
      floorCount,
      item.buldNm || null,
      address,
      JSON.stringify(item.raw),
      new Date().toISOString(),
    ).run()
  }

  // ── elevator_inspect_fails 동기화 (DELETE + INSERT per fail_cd, 5건 청크 병렬) ──
  const failCds = items.map(i => i.failCd).filter(Boolean)
  let failTotal = 0

  for (let i = 0; i < failCds.length; i += 5) {
    const batch = failCds.slice(i, i + 5)
    const results = await Promise.all(
      batch.map(fc =>
        fetchFailDetails(fc)
          .then(fails => ({ fc, fails, err: null as string | null }))
          .catch(e => ({ fc, fails: [] as Awaited<ReturnType<typeof fetchFailDetails>>, err: (e as Error).message }))
      )
    )

    for (const r of results) {
      // 실패한 fail_cd 는 기존 캐시 유지(DELETE 안 함) — API 오류로 데이터 손실 방지
      if (r.err) continue

      await env.DB.prepare('DELETE FROM elevator_inspect_fails WHERE fail_cd = ?')
        .bind(r.fc).run()

      for (const f of r.fails) {
        await env.DB.prepare(`
          INSERT INTO elevator_inspect_fails
            (fail_cd, fail_desc, fail_desc_inspector, standard_article, standard_title)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          r.fc,
          f.failDesc || null,
          f.failDescInspector || null,
          f.standardArticle || null,
          f.standardTitle || null,
        ).run()
        failTotal++
      }
    }
  }

  // 최신 검사일 (이미 UPSERT 완료된 DB에서 조회)
  const latest = await env.DB
    .prepare('SELECT inspect_date FROM elevator_inspect_history WHERE elevator_no=? AND inspect_date IS NOT NULL ORDER BY inspect_date DESC LIMIT 1')
    .bind(elevatorNo)
    .first<{ inspect_date: string }>()

  return {
    elevatorNo,
    historyCount: items.length,
    failCount: failTotal,
    lastInspectDate: latest?.inspect_date ?? null,
  }
}

// DB 에서 elevator_no 의 history + fails 를 읽어 response shape 으로 변환
async function loadFromDb(env: Env, elevatorNo: string) {
  const histRes = await env.DB
    .prepare('SELECT * FROM elevator_inspect_history WHERE elevator_no=? ORDER BY inspect_date DESC')
    .bind(elevatorNo)
    .all<HistoryRow>()
  const histRows = histRes.results ?? []

  // 한 번에 모든 fail_cd 에 대한 fails 조회 (N+1 방지)
  let failsByCd: Record<string, FailRow[]> = {}
  if (histRows.length > 0) {
    const placeholders = histRows.map(() => '?').join(',')
    const failsRes = await env.DB
      .prepare(`SELECT * FROM elevator_inspect_fails WHERE fail_cd IN (${placeholders})`)
      .bind(...histRows.map(r => r.fail_cd))
      .all<FailRow>()
    for (const f of failsRes.results ?? []) {
      (failsByCd[f.fail_cd] ||= []).push(f)
    }
  }

  const history = histRows.map(r => ({
    failCd: r.fail_cd,
    inspectDate: r.inspect_date,
    inspectKind: r.inspect_kind,
    inspectInstitution: r.inspect_institution,
    companyName: r.company_name,
    dispWords: r.disp_words,
    validStart: r.valid_start,
    validEnd: r.valid_end,
    ratedSpeed: r.rated_speed,
    ratedCap: r.rated_cap,
    floorCount: r.floor_count,
    buildingName: r.building_name,
    address: r.address,
    fails: (failsByCd[r.fail_cd] ?? []).map(f => ({
      failDesc: f.fail_desc,
      failDescInspector: f.fail_desc_inspector,
      standardArticle: f.standard_article,
      standardTitle: f.standard_title,
    })),
  }))

  const historyCount = history.length
  const failCount = history.reduce((a, h) => a + h.fails.length, 0)
  const lastInspectDate = history.find(h => h.inspectDate)?.inspectDate ?? null

  return { history, historyCount, failCount, lastInspectDate }
}

// ── 메인 핸들러 ─────────────────────────────────────────────────────────

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  const data = (ctx as unknown as { data: CtxData }).data

  try {
    const url = new URL(request.url)
    const certNo = url.searchParams.get('cert_no')
    const syncAll = url.searchParams.get('sync_all') === '1'
    const refresh = url.searchParams.get('refresh') !== '0'

    if (!certNo && !syncAll) {
      return Response.json({ success: false, error: 'cert_no 또는 sync_all 필수' }, { status: 400 })
    }

    // ── 전체 동기화 (admin only) ──
    if (syncAll) {
      if (data?.role !== 'admin') {
        return Response.json({ success: false, error: 'admin 권한 필요' }, { status: 403 })
      }

      const elevRes = await env.DB
        .prepare("SELECT id, cert_no FROM elevators WHERE cert_no IS NOT NULL ORDER BY public_no ASC")
        .all<{ id: string; cert_no: string }>()
      const elevs = elevRes.results ?? []

      const results: Array<{
        cert_no: string
        ok: boolean
        elevatorNo?: string
        historyCount?: number
        failCount?: number
        lastInspectDate?: string | null
        error?: string
      }> = []

      let totalOk = 0
      let totalFail = 0

      // 순차 실행 (공단 API rate limit 고려 — Promise.all 금지)
      for (const e of elevs) {
        try {
          const elevatorNo = certToElevatorNo(e.cert_no)
          const r = await syncOne(env, elevatorNo)
          results.push({ cert_no: e.cert_no, ok: true, ...r })
          totalOk++
        } catch (err) {
          results.push({ cert_no: e.cert_no, ok: false, error: (err as Error).message })
          totalFail++
        }
      }

      return Response.json({ success: true, data: { results, totalOk, totalFail } })
    }

    // ── 단일 호기 ──
    const elevatorNo = certToElevatorNo(certNo!)

    if (!refresh) {
      // 캐시 only
      const loaded = await loadFromDb(env, elevatorNo)
      return Response.json({
        success: true,
        data: {
          elevatorNo,
          certNo: certNo!,
          ...loaded,
          cached: true,
        },
      })
    }

    // 동기화 후 DB 재조회
    await syncOne(env, elevatorNo)
    const loaded = await loadFromDb(env, elevatorNo)

    return Response.json({
      success: true,
      data: {
        elevatorNo,
        certNo: certNo!,
        ...loaded,
        cached: false,
      },
    })
  } catch (e) {
    const msg = (e as Error).message ?? '검사이력 조회 실패'
    console.error('inspect-history error:', msg)
    return Response.json({ success: false, error: msg }, { status: 502 })
  }
}

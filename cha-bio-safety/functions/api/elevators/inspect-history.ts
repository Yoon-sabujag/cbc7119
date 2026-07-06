// functions/api/elevators/inspect-history.ts
// 공단 공식 API(ElevatorInspectsafeService) 기반 승강기 검사이력 동기화/조회.
//
// 주의사항:
// - 최초 1회는 sync_all=1 로 전체 캐싱 권장 (17대 × 10~20건 × fail API 호출 = 시간 소요).
// - fail_cd 가 빈 검사건은 elevator_inspect_fails 에 아무것도 안 들어감 (정상).
// - 민원24 API(별도 핸들러) 와는 독립적 — 서로 데이터 섞지 말 것.
//
// 엔드포인트:
//   GET /api/elevators/inspect-history?cert_no=2114-971              → 단일 호기 동기화 + 반환 (검사주기 인지형 TTL)
//   GET /api/elevators/inspect-history?cert_no=2114-971&refresh=0    → 캐시 반환(동기화 안 함)
//   GET /api/elevators/inspect-history?cert_no=2114-971&min_age=0    → 명시 TTL(explicit) — 0 이면 즉시 강제 동기화
//   GET /api/elevators/inspect-history?sync_all=1                    → elevators cert_no 전체 순차 동기화 (admin only)

import type { Env } from '../../_middleware'
import {
  fetchInspectHistory,
  fetchFailDetails,
  yyyymmdd_to_iso,
} from './_inspectsafe'

// ── 검사주기 인지형 TTL 파라미터 ─────────────────────────────────────────
// 검사이력은 append-only 이고 새 레코드는 valid_end 만료 언저리에만 등록됨
// (정기검사 연 1회, 덤웨이터/화물용 2년 1회). MAX(valid_end) 만으로 다음 결과
// 등록 시기를 예측해 평시 공단 호출을 차단한다.
const WINDOW_BEFORE_DAYS = 60           // 검사창 시작: 유효기간 만료 60일 전
const ACTIVE_MIN_AGE = 24 * 3600        // 검사창 안: 하루 1회
const DORMANT_MIN_AGE = 30 * 24 * 3600  // 평시: 30일 1회 (수시검사 안전망)

// fail-detail 재확인 창 — 등록 직후 정정 가능성이 있는 최근 검사건만 재조회
const FAIL_DETAIL_RECENT_DAYS = 60

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
  fails_synced_at: string | null
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

  // 기존 이력 스냅샷 (UPSERT 전) — fail-detail 증분 판정용.
  // 판정은 elevator_inspect_history 의 fails_synced_at(상세 조회 성공 마커)로만.
  // - elevator_inspect_fails 부재로 판정 금지: 부적합 0건 합격 검사는 원래 fails 행이
  //   없어서 매번 재조회하게 됨 (합격 검사도 성공 조회 후 마커가 찍히므로 안전).
  // - 마커 없이 history 존재만으로 판정하면 "history 저장 OK + 상세 조회 실패" 건이
  //   60일 후 영구 재조회 불가 (스펙 변경 3 의사코드의 구멍 — 리뷰에서 확정, 의도적 이탈).
  const knownRes = await env.DB.prepare(
    'SELECT fail_cd, fails_synced_at FROM elevator_inspect_history WHERE elevator_no=?'
  ).bind(elevatorNo).all<{ fail_cd: string; fails_synced_at: string | null }>()
  const syncedFailCds = new Set(
    (knownRes.results ?? []).filter(r => r.fails_synced_at != null).map(r => r.fail_cd)
  )

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
  // 증분 동기화: 이력은 append-only 이므로 신규/미완 검사건 + 최근 검사건(등록 직후
  // 정정 가능성 창)만 fail-detail 조회. 평시 동기화 = 호기당 getInspectsafeList 1회 + fail-detail 0회.
  const cutoff = Date.now() - FAIL_DETAIL_RECENT_DAYS * 24 * 3600_000
  const failCds = items
    .filter(i => i.failCd)
    .filter(i => {
      if (!syncedFailCds.has(i.failCd)) return true          // 신규 or 상세 미완(직전 실패) — 성공까지 재시도
      const d = yyyymmdd_to_iso(i.inspctDe)
      return d ? new Date(d).getTime() >= cutoff : false     // 최근 건은 재확인
    })
    .map(i => i.failCd)
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
      // 실패한 fail_cd 는 기존 캐시 유지(DELETE 안 함) + fails_synced_at 미기록
      // → 다음 동기화에서 자동 재시도 (자가 치유)
      if (r.err) {
        console.warn('fail-detail 조회 실패 (다음 동기화에서 재시도):', r.fc, r.err)
        continue
      }

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

      // 상세 조회 성공 마커 — 부적합 0건(합격)도 기록해 재조회 대상에서 제외.
      // history UPSERT 의 ON CONFLICT SET 목록에 이 컬럼이 없어 재동기화로 지워지지 않음.
      await env.DB.prepare('UPDATE elevator_inspect_history SET fails_synced_at=? WHERE fail_cd=?')
        .bind(new Date().toISOString(), r.fc).run()
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

    // min_age (초) — 최근 fetched_at 이 min_age 이내이면 공단 API 호출 SKIP 후 DB 캐시만 반환.
    // 명시된 min_age 는 그대로 존중 (수동 강제 갱신 ?min_age=0 경로 보존).
    // 미지정(또는 숫자 아님) 시 아래 단일 호기 경로에서 검사주기 인지형 TTL 로 계산.
    // 음수는 0으로 clamp.
    const minAgeRaw = url.searchParams.get('min_age')
    let explicitMinAge: number | null = null
    if (minAgeRaw != null) {
      const parsed = parseInt(minAgeRaw, 10)
      if (!Number.isNaN(parsed)) explicitMinAge = Math.max(0, parsed)
    }

    if (!certNo && !syncAll) {
      return Response.json({ success: false, error: 'cert_no 또는 sync_all 필수' }, { status: 400 })
    }

    // ── 전체 동기화 (admin only) ──
    if (syncAll) {
      // min_age ignored for sync_all mode
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
      // 캐시 only — 공단 API 호출 없이 DB 에서만 조회
      const latestFetch = await env.DB.prepare(
        'SELECT MAX(fetched_at) as fetched_at FROM elevator_inspect_history WHERE elevator_no=?'
      ).bind(elevatorNo).first<{ fetched_at: string | null }>()
      const loaded = await loadFromDb(env, elevatorNo)
      return Response.json({
        success: true,
        data: {
          elevatorNo,
          certNo: certNo!,
          ...loaded,
          cached: true,
          lastFetchedAt: latestFetch?.fetched_at ?? null,
        },
      })
    }

    // ── 검사주기 인지형 TTL (min_age 미지정 시) ──
    // MAX(valid_end) 기준 검사창(만료 WINDOW_BEFORE_DAYS 일 전~) 안이면 active(24h),
    // 밖이면 dormant(30일). 새 검사 레코드 저장 시 MAX(valid_end) 가 1~2년 미래로
    // 점프해 자연히 dormant 복귀 (순수 파생, 상태 저장 없음).
    // 보완(짧은 valid_end)/불합격(valid_end=null) 은 MAX 가 가까운 과거에 머물러
    // 자동 active 유지 — disp_words 특수 분기 금지 (데이터 시맨틱 근거).
    let minAge: number
    let syncPolicy: 'active' | 'dormant' | 'explicit'
    let windowStart: string | null = null
    if (explicitMinAge != null) {
      minAge = explicitMinAge
      syncPolicy = 'explicit'
    } else {
      const mveRow = await env.DB.prepare(
        'SELECT MAX(valid_end) as mve FROM elevator_inspect_history WHERE elevator_no=? AND valid_end IS NOT NULL'
      ).bind(elevatorNo).first<{ mve: string | null }>()
      const mve = mveRow?.mve ?? null
      if (!mve) {
        // 이력 없는 신규 호기 부트스트랩 — minAge=0 취급이 아니라 ACTIVE_MIN_AGE (폭주 방지)
        syncPolicy = 'active'
        minAge = ACTIVE_MIN_AGE
      } else {
        const windowStartMs = new Date(mve).getTime() - WINDOW_BEFORE_DAYS * 24 * 3600_000
        windowStart = new Date(windowStartMs).toISOString().slice(0, 10)
        if (Date.now() >= windowStartMs) {
          syncPolicy = 'active'
          minAge = ACTIVE_MIN_AGE
        } else {
          syncPolicy = 'dormant'
          minAge = DORMANT_MIN_AGE
        }
      }
    }

    // refresh=true — min_age TTL 로 DB 최신성 검사.
    //   DB 최신 fetched_at 이 min_age 이내면 공단 API SKIP + cached=true 반환.
    if (minAge > 0) {
      const latestFetch = await env.DB.prepare(
        'SELECT fetched_at FROM elevator_inspect_history WHERE elevator_no=? ORDER BY fetched_at DESC LIMIT 1'
      ).bind(elevatorNo).first<{ fetched_at: string }>()
      if (latestFetch?.fetched_at) {
        const ageMs = Date.now() - new Date(latestFetch.fetched_at).getTime()
        if (ageMs >= 0 && ageMs < minAge * 1000) {
          const loaded = await loadFromDb(env, elevatorNo)
          return Response.json({
            success: true,
            data: {
              elevatorNo,
              certNo: certNo!,
              ...loaded,
              cached: true,
              lastFetchedAt: latestFetch.fetched_at,
              syncPolicy,
              windowStart,
            },
          })
        }
      }
    }

    // 동기화 후 DB 재조회 — 공단 장애 시엔 직전 캐시로 응답 (stale-while-error)
    try {
      await syncOne(env, elevatorNo)
    } catch (apiError) {
      const loaded = await loadFromDb(env, elevatorNo)
      if (loaded.historyCount > 0) {
        const latestFetch = await env.DB.prepare(
          'SELECT MAX(fetched_at) as fetched_at FROM elevator_inspect_history WHERE elevator_no=?'
        ).bind(elevatorNo).first<{ fetched_at: string | null }>()
        return Response.json({
          success: true,
          data: {
            elevatorNo,
            certNo: certNo!,
            ...loaded,
            cached: true,
            stale: true,
            staleReason: String((apiError as Error).message ?? apiError).slice(0, 200),
            lastFetchedAt: latestFetch?.fetched_at ?? null,
            syncPolicy,
            windowStart,
          },
        })
      }
      throw apiError // 캐시 없음 → 기존 502 경로
    }
    const loaded = await loadFromDb(env, elevatorNo)

    return Response.json({
      success: true,
      data: {
        elevatorNo,
        certNo: certNo!,
        ...loaded,
        cached: false,
        lastFetchedAt: new Date().toISOString(),
        syncPolicy,
        windowStart,
      },
    })
  } catch (e) {
    const msg = (e as Error).message ?? '검사이력 조회 실패'
    console.error('inspect-history error:', msg)
    return Response.json({ success: false, error: msg }, { status: 502 })
  }
}

import type { Env } from '../../_middleware'
import { fetchKoelsaXml } from './_koelsa-common'

// 승강기 안전관리자 조회 — DB 캐시 우선 (17건 API 호출 방지)
// GET /api/elevators/safety-manager?refresh=1

const KOELSA_BASE = 'https://apis.data.go.kr/B553664/ElevatorSafeMngrService/getSafeMngrList'
const SERVICE_KEY = 'bb8deaf60d1322e149801cc367cb94a2aa6ffa700a2d0635e8399c8a3a9f0b00'

// 캐시 유효 시간: 7일 (안전관리자 정보는 자주 바뀌지 않음)
const CACHE_TTL = 7 * 24 * 3600_000

interface KoelsaManagerItem {
  elevatorNo: string
  shuttleMngrNm: string
  appointDt: string
  smEduDt: string
  valdStrDt: string
  valdEndDt: string
}

function parseXmlItems(xml: string): KoelsaManagerItem[] {
  const items: KoelsaManagerItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))
      return m ? m[1] : ''
    }
    items.push({
      elevatorNo: get('elevatorNo'),
      shuttleMngrNm: get('shuttleMngrNm'),
      appointDt: get('appointDt'),
      smEduDt: get('smEduDt'),
      valdStrDt: get('valdStrDt'),
      valdEndDt: get('valdEndDt'),
    })
  }
  return items
}

function matchMaskedName(masked: string, realName: string): boolean {
  if (!masked || !realName || realName.length < 2) return false
  const first = masked[0]
  const last = masked[masked.length - 1]
  return realName[0] === first && realName[realName.length - 1] === last && realName.length === masked.length
}

function calcEducation(managerInfo: KoelsaManagerItem) {
  const now = new Date()
  let newEduDeadline: string | null = null
  let refreshEduDeadline: string | null = null
  let newEduDaysLeft: number | null = null
  let refreshEduDaysLeft: number | null = null

  if (managerInfo.appointDt) {
    const appointed = new Date(managerInfo.appointDt)
    const deadline = new Date(appointed)
    deadline.setMonth(deadline.getMonth() + 3)
    newEduDeadline = deadline.toISOString().slice(0, 10)
    newEduDaysLeft = Math.ceil((deadline.getTime() - now.getTime()) / 86400000)
  }
  if (managerInfo.smEduDt) {
    const eduDate = new Date(managerInfo.smEduDt)
    const deadline = new Date(eduDate)
    deadline.setFullYear(deadline.getFullYear() + 3)
    refreshEduDeadline = deadline.toISOString().slice(0, 10)
    refreshEduDaysLeft = Math.ceil((deadline.getTime() - now.getTime()) / 86400000)
  }

  return {
    newEdu: { deadline: newEduDeadline, daysLeft: newEduDaysLeft },
    refreshEdu: { deadline: refreshEduDeadline, daysLeft: refreshEduDaysLeft },
  }
}

// 캐시 행 기반 응답 — TTL 유효 경로와 공단 장애 시 stale 경로가 공유
async function respondFromCache(
  env: Env,
  elevators: Array<{ id: string; number: number; type: string; cert_no: string }>,
  cachedRows: Record<string, unknown>[],
  extra: Record<string, unknown> = {},
) {
  const registeredIds: string[] = []
  const unregisteredIds: string[] = []
  let managerInfo: KoelsaManagerItem | null = null

  for (const ev of elevators) {
    const no = ev.cert_no.replace(/-/g, '')
    const cached = cachedRows.find(r => r.elevator_no === no)
    if (cached && cached.is_registered) {
      registeredIds.push(ev.id)
      if (!managerInfo && cached.manager_name) {
        managerInfo = {
          elevatorNo: no,
          shuttleMngrNm: cached.manager_name as string,
          appointDt: cached.appoint_date as string,
          smEduDt: cached.edu_date as string,
          valdStrDt: cached.valid_start as string,
          valdEndDt: cached.valid_end as string,
        }
      }
    } else {
      unregisteredIds.push(ev.id)
    }
  }

  let matchedStaff: { id: string; name: string } | null = null
  if (managerInfo) {
    const { results: staffList } = await env.DB.prepare(
      'SELECT id, name FROM staff WHERE active = 1'
    ).all<{ id: string; name: string }>()
    for (const s of staffList ?? []) {
      if (matchMaskedName(managerInfo.shuttleMngrNm, s.name)) {
        matchedStaff = s
        break
      }
    }
  }

  return Response.json({
    success: true,
    data: {
      manager: managerInfo ? {
        maskedName: managerInfo.shuttleMngrNm,
        realName: matchedStaff?.name ?? null,
        staffId: matchedStaff?.id ?? null,
        appointedAt: managerInfo.appointDt,
        eduDate: managerInfo.smEduDt,
        eduValidFrom: managerInfo.valdStrDt,
        eduValidTo: managerInfo.valdEndDt,
      } : null,
      education: managerInfo ? calcEducation(managerInfo) : { newEdu: { deadline: null, daysLeft: null }, refreshEdu: { deadline: null, daysLeft: null } },
      registration: {
        total: elevators.length,
        registered: registeredIds.length,
        registeredIds,
        unregisteredIds,
      },
      cached: true,
      ...extra,
    }
  })
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const forceRefresh = url.searchParams.get('refresh') === '1'

  try {
    const { results: elevators } = await env.DB.prepare(
      'SELECT id, number, type, cert_no FROM elevators WHERE cert_no IS NOT NULL ORDER BY number'
    ).all<{ id: string; number: number; type: string; cert_no: string }>()

    // 캐시는 항상 읽어둔다 — TTL 판단과 공단 장애 시 stale 응답 양쪽에 필요
    const { results: cachedRows } = await env.DB.prepare(
      'SELECT * FROM koelsa_safety_managers ORDER BY elevator_no'
    ).all()

    // ── DB 캐시 확인 ──
    if (!forceRefresh && cachedRows && cachedRows.length > 0) {
      const oldest = cachedRows.reduce((min, r) =>
        new Date(r.fetched_at as string).getTime() < min ? new Date(r.fetched_at as string).getTime() : min, Date.now())
      const age = Date.now() - oldest

      if (age < CACHE_TTL) {
        return respondFromCache(env, elevators ?? [], cachedRows)
      }
    }

    // ── 공단 API 호출 (호기별) ──
    const registeredElevators: string[] = []
    const unregisteredElevators: string[] = []
    let managerInfo: KoelsaManagerItem | null = null
    const nowIso = new Date().toISOString()

    const upserts: D1PreparedStatement[] = []
    try {
      for (const ev of elevators ?? []) {
        const no = ev.cert_no.replace(/-/g, '')
        // fetchKoelsaXml 이 HTTP 오류·에러 XML·비정상 envelope 에서 throw → 캐시 기록에
        // 도달하지 않으므로 장애가 is_registered=0 으로 기록되는 일이 없다 (오염 차단).
        // is_registered=0 은 공단이 정상 응답(resultCode 00)인데 진짜 0건일 때만 기록된다.
        const xml = await fetchKoelsaXml(`${KOELSA_BASE}?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=5&elevator_no=${no}`)
        const items = parseXmlItems(xml)

        if (items.length > 0) {
          registeredElevators.push(ev.id)
          if (!managerInfo) managerInfo = items[0]

          upserts.push(env.DB.prepare(`
            INSERT INTO koelsa_safety_managers (elevator_no, manager_name, appoint_date, edu_date, valid_start, valid_end, is_registered, fetched_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)
            ON CONFLICT(elevator_no) DO UPDATE SET
              manager_name=excluded.manager_name, appoint_date=excluded.appoint_date,
              edu_date=excluded.edu_date, valid_start=excluded.valid_start, valid_end=excluded.valid_end,
              is_registered=1, fetched_at=excluded.fetched_at
          `).bind(no, items[0].shuttleMngrNm, items[0].appointDt, items[0].smEduDt, items[0].valdStrDt, items[0].valdEndDt, nowIso))
        } else {
          unregisteredElevators.push(ev.id)

          upserts.push(env.DB.prepare(`
            INSERT INTO koelsa_safety_managers (elevator_no, is_registered, fetched_at)
            VALUES (?, 0, ?)
            ON CONFLICT(elevator_no) DO UPDATE SET is_registered=0, fetched_at=excluded.fetched_at
          `).bind(no, nowIso))
        }
      }

      // 전 호기 fetch 가 성공한 뒤에만 캐시를 기록 (단일 batch) — 루프 중간 실패가
      // "일부 호기만 fresh" 인 캐시로 굳어 TTL 동안 누락 호기를 미등록으로 보이게
      // 만드는 것을 방지. 실패 시 캐시는 한 줄도 변하지 않는다.
      if (upserts.length > 0) await env.DB.batch(upserts)
    } catch (apiError: any) {
      // stale-while-error: 공단 장애 시 캐시를 덮지 않고 직전 캐시로 응답.
      // 호출 전에 읽어둔 cachedRows(일관된 스냅샷)를 사용한다.
      console.error(`safety-manager KOELSA error: ${apiError?.message}`)
      if (cachedRows && cachedRows.length > 0) {
        return respondFromCache(env, elevators ?? [], cachedRows, {
          stale: true,
          staleReason: String(apiError?.message ?? apiError).slice(0, 200),
        })
      }
      return Response.json(
        { success: false, error: '공단 API 오류 (저장된 캐시 없음): ' + (apiError?.message ?? '알 수 없음') },
        { status: 502 }
      )
    }

    // 직원 매칭
    let matchedStaff: { id: string; name: string } | null = null
    if (managerInfo) {
      const { results: staffList } = await env.DB.prepare(
        'SELECT id, name FROM staff WHERE active = 1'
      ).all<{ id: string; name: string }>()

      for (const s of staffList ?? []) {
        if (matchMaskedName(managerInfo.shuttleMngrNm, s.name)) {
          matchedStaff = s
          break
        }
      }

      if (matchedStaff) {
        await env.DB.prepare(`
          UPDATE staff SET
            elevator_safety_manager = 1,
            safety_mgr_appointed_at = ?,
            safety_mgr_edu_dt = ?,
            safety_mgr_edu_expire = ?
          WHERE id = ?
        `).bind(managerInfo.appointDt, managerInfo.smEduDt, managerInfo.valdEndDt, matchedStaff.id).run()
      }
    }

    return Response.json({
      success: true,
      data: {
        manager: managerInfo ? {
          maskedName: managerInfo.shuttleMngrNm,
          realName: matchedStaff?.name ?? null,
          staffId: matchedStaff?.id ?? null,
          appointedAt: managerInfo.appointDt,
          eduDate: managerInfo.smEduDt,
          eduValidFrom: managerInfo.valdStrDt,
          eduValidTo: managerInfo.valdEndDt,
        } : null,
        education: managerInfo ? calcEducation(managerInfo) : { newEdu: { deadline: null, daysLeft: null }, refreshEdu: { deadline: null, daysLeft: null } },
        registration: {
          total: (elevators ?? []).length,
          registered: registeredElevators.length,
          registeredIds: registeredElevators,
          unregisteredIds: unregisteredElevators,
        },
      }
    })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message ?? '조회 실패' }, { status: 500 })
  }
}

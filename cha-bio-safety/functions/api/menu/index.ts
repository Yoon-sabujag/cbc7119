import type { Env } from '../../_middleware'

function nanoid(n = 12) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const a = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(a, b => c[b % c.length]).join('')
}

// GET /api/menu?date=2026-04-03  → 특정 날짜 메뉴
// GET /api/menu?week=2026-04-07  → 해당 주 메뉴 (월~토)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  const week = url.searchParams.get('week')

  try {
    if (week) {
      // 주간 메뉴: week 파라미터(월요일) 부터 6일간 (월~토)
      const dates: string[] = []
      const base = new Date(week + 'T00:00:00+09:00')
      for (let i = 0; i < 6; i++) {
        const d = new Date(base)
        d.setDate(base.getDate() + i)
        dates.push(d.toISOString().slice(0, 10))
      }
      const placeholders = dates.map(() => '?').join(',')
      const { results } = await env.DB.prepare(
        `SELECT id, date, lunch_a, lunch_b, dinner, pdf_key, created_at, updated_by
         FROM weekly_menus WHERE date IN (${placeholders}) ORDER BY date`
      ).bind(...dates).all()

      return Response.json({ success: true, data: results ?? [] })
    }

    // 단일 날짜 메뉴
    const targetDate = date ?? new Date().toISOString().slice(0, 10)
    const row = await env.DB.prepare(
      `SELECT id, date, lunch_a, lunch_b, dinner, pdf_key, created_at, updated_by
       FROM weekly_menus WHERE date = ?`
    ).bind(targetDate).first()

    return Response.json({ success: true, data: row ?? { date: targetDate, lunch_a: null, lunch_b: null, dinner: null } })
  } catch (e: any) {
    console.error('menu GET error:', e)
    return Response.json({ success: false, error: e.message ?? '메뉴 조회 실패' }, { status: 500 })
  }
}

// POST /api/menu  → 주간 메뉴 일괄 등록/수정 (admin only)
// Body: { menus: [{ date, lunch_a, lunch_b, dinner }], pdf_key?: string }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  const { role, staffId } = (ctx as any).data ?? {}

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 등록 가능합니다' }, { status: 403 })
  }

  try {
    const body = await request.json() as {
      menus: { date: string; lunch_a?: string; lunch_b?: string; dinner?: string }[]
      pdf_key?: string
      parser_version?: number
    }

    // 파서 버전 게이트 — 낡은 캐시 번들(구 파서)이 밀린/섞인 데이터를 정상 데이터 위에 덮어쓰는 것 차단.
    // 프론트가 현재 파서 버전 토큰을 보내야 하며, 없거나 낡으면 거부한다(형식·표시 로직은 무변경).
    // 프론트 파서 형식이 바뀔 때마다 PARSER_VERSION 을 올리고 여기 MIN 도 함께 올린다.
    // (src/pages/StaffServicePage.tsx 의 PARSER_VERSION 과 동기화)
    const MIN_PARSER_VERSION = 2
    const pv = typeof body.parser_version === 'number' ? body.parser_version : 0
    if (pv < MIN_PARSER_VERSION) {
      return Response.json({
        success: false,
        error: '앱이 최신 버전이 아닙니다. 새로고침(또는 재설치) 후 식단표를 다시 업로드해 주세요.',
      }, { status: 426 })
    }

    if (!body.menus || !Array.isArray(body.menus) || body.menus.length === 0) {
      return Response.json({ success: false, error: 'menus 배열이 필요합니다' }, { status: 400 })
    }

    // 식당 미운영일 차단 — PDF 파서에서 잘못 추출되어 들어와도 저장 안 함
    // 미운영일: 일요일, (그날 자체가) 공휴일. 그 외엔 업로드된 메뉴를 진실로 신뢰한다.
    // ※ '공휴일 직후 토요일 자동 휴무'는 일회성 사례였을 뿐 상시 규칙이 아니어서 제거함 —
    //   그 토요일에 식당이 열면 PDF 에 토요일 메뉴가 있어 저장되고, 닫으면 PDF 에 칸이 없어 자연 배제.
    // 일반 토요일은 점심만 운영하므로 lunch_a 만 들어와도 저장 OK
    // CF Workers UTC 환경에서 dow 계산 정확히 — Date.UTC + getUTCDay 사용
    const dowOf = (ymd: string): number => {
      const [y, m, d] = ymd.split('-').map(Number)
      return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
    }

    const dates = body.menus.map(m => m.date).filter(Boolean)
    const holidaySet = new Set<string>()
    if (dates.length > 0) {
      const placeholders = dates.map(() => '?').join(',')
      const holidayRows = await env.DB.prepare(
        `SELECT date FROM holidays WHERE date IN (${placeholders})`
      ).bind(...dates).all<{ date: string }>()
      for (const r of holidayRows.results ?? []) holidaySet.add(r.date)
    }

    const results: { date: string; id: string }[] = []
    const skippedHolidays: string[] = []

    for (const menu of body.menus) {
      if (!menu.date) continue
      if (holidaySet.has(menu.date)) { skippedHolidays.push(menu.date); continue }  // 그날 자체가 공휴일
      const dow = dowOf(menu.date)
      if (dow === 0) { skippedHolidays.push(menu.date); continue }  // 일요일
      // (공휴일 직후 토요일 자동 차단 규칙 제거 — 토요일은 메뉴 유무로만 판단)
      // 메뉴 셋 다 비어있으면 저장 안 함
      if (!menu.lunch_a && !menu.lunch_b && !menu.dinner) continue

      // 기존 레코드 확인
      const existing = await env.DB.prepare(
        'SELECT id FROM weekly_menus WHERE date = ?'
      ).bind(menu.date).first<{ id: string }>()

      if (existing) {
        // UPDATE
        await env.DB.prepare(
          `UPDATE weekly_menus
           SET lunch_a = ?, lunch_b = ?, dinner = ?, pdf_key = COALESCE(?, pdf_key), updated_by = ?
           WHERE id = ?`
        ).bind(
          menu.lunch_a ?? null,
          menu.lunch_b ?? null,
          menu.dinner ?? null,
          body.pdf_key ?? null,
          staffId ?? null,
          existing.id
        ).run()
        results.push({ date: menu.date, id: existing.id })
      } else {
        // INSERT
        const id = nanoid()
        await env.DB.prepare(
          `INSERT INTO weekly_menus (id, date, lunch_a, lunch_b, dinner, pdf_key, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          menu.date,
          menu.lunch_a ?? null,
          menu.lunch_b ?? null,
          menu.dinner ?? null,
          body.pdf_key ?? null,
          staffId ?? null
        ).run()
        results.push({ date: menu.date, id })
      }
    }

    return Response.json({ success: true, data: results }, { status: 201 })
  } catch (e: any) {
    console.error('menu POST error:', e)
    return Response.json({ success: false, error: e.message ?? '메뉴 등록 실패' }, { status: 500 })
  }
}

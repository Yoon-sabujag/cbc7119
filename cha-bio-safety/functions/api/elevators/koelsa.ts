// functions/api/elevators/koelsa.ts
// 한국승강기안전공단 자체점검결과 조회 — DB 캐시 우선, 없으면 공단 API 호출 후 저장
import type { Env } from '../../_middleware'

const KOELSA_BASE = 'https://apis.data.go.kr/B553664/ElevatorSelfCheckService/getSelfCheckList'
const SERVICE_KEY = 'bb8deaf60d1322e149801cc367cb94a2aa6ffa700a2d0635e8399c8a3a9f0b00'

// 캐시 유효 시간: 과거 월 = 30일, 당월 = 6시간
const PAST_MONTH_TTL = 30 * 24 * 3600_000
const CURRENT_MONTH_TTL = 6 * 3600_000

interface KoelsaItem {
  elevatorNo: string
  selchkUsnm: string
  subSelchkUsnm: string
  selchkBeginDate: string
  selChkStDt: string
  selChkEnDt: string
  cnfirmDt: string
  companyNm: string
  selchkResultNm: string
  registDt: string
  titNo: string
  selChkItemNm: string
  selChkItemDtlNm: string
  selChkResult: string
}

function parseXml(xml: string): KoelsaItem[] {
  const items: KoelsaItem[] = []
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
      selchkUsnm: get('selchkUsnm'),
      subSelchkUsnm: get('subSelchkUsnm'),
      selchkBeginDate: get('selchkBeginDate'),
      selChkStDt: get('selChkStDt'),
      selChkEnDt: get('selChkEnDt'),
      cnfirmDt: get('cnfirmDt'),
      companyNm: get('companyNm'),
      selchkResultNm: get('selchkResultNm'),
      registDt: get('registDt'),
      titNo: get('titNo'),
      selChkItemNm: get('selChkItemNm'),
      selChkItemDtlNm: get('selChkItemDtlNm'),
      selChkResult: get('selChkResult'),
    })
  }
  return items
}

function parseTotalCount(xml: string): number {
  const m = xml.match(/<totalCount>(\d+)<\/totalCount>/)
  return m ? parseInt(m[1], 10) : 0
}

function isCurrentMonth(yyyymm: string): boolean {
  const now = new Date()
  const cur = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  return yyyymm === cur
}

function buildResponseData(row: any) {
  const issues = JSON.parse(row.issues_json || '[]')
  const items = JSON.parse(row.items_json || '[]')
  const summary = row.inspect_date ? {
    inspectDate: row.inspect_date,
    startTime: row.start_time,
    endTime: row.end_time,
    inspectorName: row.inspector_name,
    subInspectorName: row.sub_inspector_name,
    companyName: row.company_name,
    overallResult: row.overall_result,
    confirmDate: row.confirm_date,
    registDate: row.regist_date,
  } : null

  return {
    elevatorNo: row.elevator_no,
    yyyymm: row.yyyymm,
    totalItems: items.length,
    summary,
    resultCounts: { A: row.count_a, B: row.count_b, C: row.count_c, D: row.count_d, E: row.count_e },
    issues,
    items,
    cached: true,
  }
}

// GET /api/elevators/koelsa?elevator_no=2114971&yyyymm=202603&refresh=1
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const elevatorNo = url.searchParams.get('elevator_no')
  const yyyymm = url.searchParams.get('yyyymm')
  const forceRefresh = url.searchParams.get('refresh') === '1'

  if (!elevatorNo || !yyyymm) {
    return Response.json({ success: false, error: 'elevator_no, yyyymm 필수' }, { status: 400 })
  }

  try {
    // ── DB 캐시 확인 ──
    if (!forceRefresh) {
      const cached = await env.DB.prepare(
        'SELECT * FROM koelsa_self_checks WHERE elevator_no = ? AND yyyymm = ?'
      ).bind(elevatorNo, yyyymm).first()

      if (cached) {
        const ttl = isCurrentMonth(yyyymm) ? CURRENT_MONTH_TTL : PAST_MONTH_TTL
        const age = Date.now() - new Date(cached.fetched_at as string).getTime()
        if (age < ttl) {
          return Response.json({ success: true, data: buildResponseData(cached) })
        }
      }
    }

    // ── 공단 API 호출 ──
    const firstUrl = `${KOELSA_BASE}?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=200&yyyymm=${yyyymm}&elevator_no=${elevatorNo}`
    const firstRes = await fetch(firstUrl)
    const firstXml = await firstRes.text()

    if (firstXml.includes('Unexpected errors') || firstXml.includes('SERVICE_KEY_IS_NOT_REGISTERED')) {
      return Response.json({ success: false, error: 'API 호출 실패' }, { status: 502 })
    }

    const totalCount = parseTotalCount(firstXml)
    let allItems = parseXml(firstXml)

    if (totalCount > 200) {
      const pages = Math.ceil(totalCount / 200)
      for (let p = 2; p <= pages; p++) {
        const pageUrl = `${KOELSA_BASE}?serviceKey=${SERVICE_KEY}&pageNo=${p}&numOfRows=200&yyyymm=${yyyymm}&elevator_no=${elevatorNo}`
        const pageRes = await fetch(pageUrl)
        const pageXml = await pageRes.text()
        allItems = allItems.concat(parseXml(pageXml))
      }
    }

    // 요약 정보
    const first = allItems[0]
    const summary = first ? {
      inspectDate: first.selchkBeginDate,
      startTime: first.selChkStDt,
      endTime: first.selChkEnDt,
      inspectorName: first.selchkUsnm,
      subInspectorName: first.subSelchkUsnm,
      companyName: first.companyNm,
      overallResult: first.selchkResultNm,
      confirmDate: first.cnfirmDt,
      registDate: first.registDt,
    } : null

    // 결과 코드별 분류
    const resultCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 }
    for (const item of allItems) {
      const r = item.selChkResult as keyof typeof resultCounts
      if (r in resultCounts) resultCounts[r]++
    }

    const issues = allItems
      .filter(item => item.selChkResult === 'B' || item.selChkResult === 'C')
      .map(item => ({
        titNo: item.titNo,
        itemName: item.selChkItemNm,
        itemDetail: item.selChkItemDtlNm,
        result: item.selChkResult,
      }))

    // ── DB에 캐시 저장 (UPSERT) ──
    if (allItems.length > 0) {
      await env.DB.prepare(`
        INSERT INTO koelsa_self_checks (elevator_no, yyyymm, inspect_date, start_time, end_time,
          inspector_name, sub_inspector_name, company_name, overall_result, confirm_date, regist_date,
          count_a, count_b, count_c, count_d, count_e, issues_json, items_json, fetched_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(elevator_no, yyyymm) DO UPDATE SET
          inspect_date=excluded.inspect_date, start_time=excluded.start_time, end_time=excluded.end_time,
          inspector_name=excluded.inspector_name, sub_inspector_name=excluded.sub_inspector_name,
          company_name=excluded.company_name, overall_result=excluded.overall_result,
          confirm_date=excluded.confirm_date, regist_date=excluded.regist_date,
          count_a=excluded.count_a, count_b=excluded.count_b, count_c=excluded.count_c,
          count_d=excluded.count_d, count_e=excluded.count_e,
          issues_json=excluded.issues_json, items_json=excluded.items_json,
          fetched_at=excluded.fetched_at
      `).bind(
        elevatorNo, yyyymm,
        summary?.inspectDate ?? null, summary?.startTime ?? null, summary?.endTime ?? null,
        summary?.inspectorName ?? null, summary?.subInspectorName ?? null,
        summary?.companyName ?? null, summary?.overallResult ?? null,
        summary?.confirmDate ?? null, summary?.registDate ?? null,
        resultCounts.A, resultCounts.B, resultCounts.C, resultCounts.D, resultCounts.E,
        JSON.stringify(issues), JSON.stringify(allItems),
        new Date().toISOString()
      ).run()
    }

    return Response.json({
      success: true,
      data: {
        elevatorNo, yyyymm,
        totalItems: totalCount,
        summary, resultCounts, issues,
        items: allItems,
      }
    })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message ?? '공단 API 호출 실패' }, { status: 500 })
  }
}

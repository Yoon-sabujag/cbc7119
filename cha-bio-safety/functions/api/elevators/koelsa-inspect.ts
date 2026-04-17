import type { Env } from '../../_middleware'

// 민원24 검사결과 조회 — DB 캐시 우선, 없으면 민원24 호출 후 저장
// GET /api/elevators/koelsa-inspect?cstmr=9103260107802&recptn=91032026011300025&refresh=1

// 캐시 유효 시간: 7일 (검사결과는 거의 변경 안 됨)
const CACHE_TTL = 7 * 24 * 3600_000

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const cstmr = url.searchParams.get('cstmr')
  const recptn = url.searchParams.get('recptn')
  const forceRefresh = url.searchParams.get('refresh') === '1'

  if (!cstmr || !recptn) {
    return Response.json({ success: false, error: '고객안내번호, 접수번호 필수' }, { status: 400 })
  }

  if (cstmr.length !== 13 || recptn.length !== 17) {
    return Response.json({ success: false, error: '고객안내번호 13자리, 접수번호 17자리' }, { status: 400 })
  }

  try {
    // ── DB 캐시 확인 ──
    if (!forceRefresh) {
      const cached = await env.DB.prepare(
        'SELECT * FROM koelsa_inspections WHERE cstmr = ? AND recptn = ?'
      ).bind(cstmr, recptn).first()

      if (cached) {
        const age = Date.now() - new Date(cached.fetched_at as string).getTime()
        if (age < CACHE_TTL) {
          return Response.json({
            success: true,
            data: {
              buildingName: cached.building_name,
              address: cached.address,
              inspectInstitution: cached.inspect_institution,
              inspectKind: cached.inspect_kind,
              inspectCount: cached.inspect_count,
              inspectResultSummary: cached.inspect_result_summary,
              totalFee: cached.total_fee,
              elevators: JSON.parse(cached.elevators_json as string || '[]'),
              report: JSON.parse(cached.report_json as string || '{}'),
              cached: true,
            }
          })
        }
      }
    }

    // ── 민원24 API 호출 ──
    const res = await fetch('https://minwon.koelsa.or.kr/selectLiftResultView.do', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' },
      body: `CSTMR_GUIDANCE_NO=${cstmr}&RECPTN_NO=${recptn}`,
    })

    const json = await res.json() as any

    if (!json.dataList || json.dataList.length === 0) {
      return Response.json({ success: false, error: '조회 결과 없음 (번호를 확인해주세요)' })
    }

    const summary = json.data ?? {}
    const RESULT_MAP: Record<string, string> = {
      '10': '합격', '20': '조건부합격', '30': '불합격', '40': '보완',
    }

    const elevators = (json.dataList ?? []).map((item: any) => ({
      elevatorNo: item.elvtr_unique_no,
      assignNo: item.elvtr_asign_no,
      divName: item.elvtr_div,
      kindName: item.elvtr_kind_nm,
      formName: item.elvtr_form,
      detailForm: item.elvtr_detail_form,
      installPlace: item.installation_place,
      floorCount: item.shuttle_floor_cnt,
      inspectDate: item.last_inspct_de,
      inspectResult: item.last_inspct_result_cd,
      resultText: item.result_text,
      inspectResultLabel: RESULT_MAP[item.last_inspct_result_cd] ?? item.last_inspct_result_cd,
      assignDate: item.asign_de,
      receiptDate: item.recptn_de,
      planDate: item.inspct_plan_de,
      validFrom: item.applc_be_dt,
      validTo: item.applc_en_dt,
      conditionalFrom: item.conditional_be_dt,
      conditionalTo: item.conditional_en_dt,
      mgtNo1: item.elvtr_mgt_no1,
      mgtNo2: item.elvtr_mgt_no2,
    }))

    const report = json.reportdata ?? {}
    const totalOrders = parseInt(report.inspct_odr) || 1
    const reportData = {
      documentNo: report.document_no,
      draftingDate: report.drafting_dt,
      inspectOrder: report.inspct_odr,
      totalOrders,
      draftOrder: report.drft_odr,
      inspectInstitutionCode: report.inspct_instt_cd,
      receiptDate: report.recptn_de,
      receiptNo: report.recptn_no,
    }

    const data = {
      buildingName: summary.buld_nm,
      address: summary.address,
      inspectInstitution: summary.inspct_instt_nm,
      inspectKind: summary.inspct_kind,
      inspectCount: summary.inspct_cnt,
      inspectResultSummary: summary.inspct_result,
      totalFee: summary.tot_fee_vat?.trim(),
      elevators,
      report: reportData,
    }

    // ── DB에 캐시 저장 (UPSERT) ──
    await env.DB.prepare(`
      INSERT INTO koelsa_inspections (cstmr, recptn, building_name, address, inspect_institution,
        inspect_kind, inspect_count, inspect_result_summary, total_fee, elevators_json, report_json, fetched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(cstmr, recptn) DO UPDATE SET
        building_name=excluded.building_name, address=excluded.address,
        inspect_institution=excluded.inspect_institution, inspect_kind=excluded.inspect_kind,
        inspect_count=excluded.inspect_count, inspect_result_summary=excluded.inspect_result_summary,
        total_fee=excluded.total_fee, elevators_json=excluded.elevators_json,
        report_json=excluded.report_json, fetched_at=excluded.fetched_at
    `).bind(
      cstmr, recptn,
      data.buildingName ?? null, data.address ?? null, data.inspectInstitution ?? null,
      data.inspectKind ?? null, data.inspectCount ?? null, data.inspectResultSummary ?? null,
      data.totalFee ?? null, JSON.stringify(elevators), JSON.stringify(reportData),
      new Date().toISOString()
    ).run()

    return Response.json({ success: true, data })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message ?? '민원24 조회 실패' }, { status: 500 })
  }
}

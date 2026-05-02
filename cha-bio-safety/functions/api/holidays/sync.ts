// 공공데이터포털 API 가 누락하는 비-법정휴일 (근로자의 날, 임시공휴일 등)
// 클라이언트 src/utils/holidays.ts 의 HOLIDAYS_FALLBACK 과 동기화 유지
const HOLIDAYS_FALLBACK: Record<string, string> = {
  '2025-01-01': '신정',
  '2025-01-27': '임시공휴일',
  '2025-01-28': '설날 연휴', '2025-01-29': '설날', '2025-01-30': '설날 연휴',
  '2025-03-01': '삼일절', '2025-03-03': '대체공휴일',
  '2025-05-05': '어린이날·부처님오신날', '2025-05-06': '대체공휴일',
  '2025-06-03': '임시공휴일', '2025-06-06': '현충일',
  '2025-08-15': '광복절', '2025-10-03': '개천절',
  '2025-10-05': '추석 연휴', '2025-10-06': '추석', '2025-10-07': '추석 연휴', '2025-10-08': '대체공휴일',
  '2025-10-09': '한글날', '2025-12-25': '크리스마스',
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴', '2026-02-17': '설날', '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절', '2026-03-02': '대체공휴일',
  '2026-05-01': '근로자의 날',
  '2026-05-05': '어린이날', '2026-05-24': '부처님오신날', '2026-05-25': '대체공휴일',
  '2026-06-03': '전국동시지방선거', '2026-06-06': '현충일',
  '2026-08-15': '광복절', '2026-08-17': '대체공휴일',
  '2026-09-23': '추석 연휴', '2026-09-24': '추석', '2026-09-25': '추석 연휴',
  '2026-10-03': '개천절', '2026-10-05': '대체공휴일', '2026-10-09': '한글날',
  '2026-12-25': '크리스마스',
  '2027-01-01': '신정',
  '2027-02-06': '설날 연휴', '2027-02-07': '설날', '2027-02-08': '설날 연휴', '2027-02-09': '대체공휴일',
  '2027-03-01': '삼일절', '2027-05-05': '어린이날', '2027-05-13': '부처님오신날',
  '2027-06-06': '현충일', '2027-08-15': '광복절', '2027-08-16': '대체공휴일',
  '2027-10-03': '개천절', '2027-10-04': '대체공휴일', '2027-10-09': '한글날',
  '2027-10-14': '추석 연휴', '2027-10-15': '추석', '2027-10-16': '추석 연휴',
  '2027-12-25': '크리스마스',
}

// POST /api/holidays/sync — 공공데이터포털에서 공휴일 가져와 DB 갱신
// 앱 로드 시 자동 호출 (인증 불필요)
export const onRequestPost: PagesFunction<{ DB: D1Database; HOLIDAY_API_KEY: string }> = async ({ env }) => {
  const apiKey = env.HOLIDAY_API_KEY
  if (!apiKey) {
    return Response.json({ success: false, error: 'HOLIDAY_API_KEY 미설정' }, { status: 500 })
  }

  const now = new Date()
  const years = [now.getFullYear(), now.getFullYear() + 1, now.getFullYear() + 2]
  let totalInserted = 0

  // FALLBACK 먼저 INSERT (API 가 같은 날짜 응답하면 REPLACE 로 덮음 — 정상)
  for (const [date, name] of Object.entries(HOLIDAYS_FALLBACK)) {
    const y = Number(date.slice(0, 4))
    if (!years.includes(y)) continue
    await env.DB.prepare(
      `INSERT OR IGNORE INTO holidays (date, name, is_holiday) VALUES (?, ?, 'Y')`
    ).bind(date, name).run()
    totalInserted++
  }

  for (const year of years) {
    const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?solYear=${year}&numOfRows=50&ServiceKey=${encodeURIComponent(apiKey)}`

    try {
      const res = await fetch(url)
      const xml = await res.text()

      // XML 파싱 — <item> 블록 추출
      const itemRegex = /<item>([\s\S]*?)<\/item>/g
      let match
      while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1]
        const isHoliday = block.match(/<isHoliday>(.*?)<\/isHoliday>/)?.[1]
        if (isHoliday !== 'Y') continue

        const locdate = block.match(/<locdate>(.*?)<\/locdate>/)?.[1]
        const dateName = block.match(/<dateName>(.*?)<\/dateName>/)?.[1]
        if (!locdate || !dateName) continue

        const date = `${locdate.slice(0, 4)}-${locdate.slice(4, 6)}-${locdate.slice(6, 8)}`

        await env.DB.prepare(
          `INSERT OR REPLACE INTO holidays (date, name, is_holiday) VALUES (?, ?, 'Y')`
        ).bind(date, dateName).run()
        totalInserted++
      }
    } catch (e) {
      console.error(`Holiday sync failed for ${year}:`, e)
    }
  }

  return Response.json({ success: true, data: { years, inserted: totalInserted } })
}

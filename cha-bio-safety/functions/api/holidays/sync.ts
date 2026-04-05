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

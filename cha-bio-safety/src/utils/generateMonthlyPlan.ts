import { scheduleApi } from './api'

// ── 21개 고정 점검 항목 (행 13~33, 0-indexed) ──────────────────
interface PlanRow {
  row: number                           // 0-indexed 행 번호 (13=item1)
  daily: boolean                        // 매일 "점검" 채우기
  categories: string[]                  // inspection_category 매핑
  catLabels?: Record<string, string>    // 카테고리별 셀 텍스트 (기본: "점검")
}

const PLAN_ROWS: PlanRow[] = [
  { row:13, daily:false, categories:['소화기','소화전'],                                catLabels:{'소화기':'기','소화전':'전'} },
  { row:14, daily:true,  categories:[] },
  { row:15, daily:true,  categories:[] },
  { row:16, daily:false, categories:['DIV','컴프레셔','유도등','배연창','완강기'],       catLabels:{'유도등':'유도등','배연창':'배연창','완강기':'완강기'} },
  { row:17, daily:false, categories:['전실제연댐퍼','연결송수관'] },
  { row:18, daily:false, categories:['특별피난계단'] },
  { row:19, daily:true,  categories:[] },
  { row:20, daily:false, categories:['청정소화약제','소방펌프'],                         catLabels:{'소방펌프':'펌프'} },
  { row:21, daily:true,  categories:[] },
  { row:22, daily:true,  categories:[] },
  { row:23, daily:false, categories:['방화셔터'] },
  { row:24, daily:false, categories:['방화문'] },  // 비파라치 = 방화문 점검일과 동일
  { row:25, daily:true,  categories:[] },
  { row:26, daily:false, categories:['방화문'] },
  { row:27, daily:false, categories:['비상콘센트'] },
  { row:28, daily:false, categories:['소방용전원공급반'] },
  { row:29, daily:true,  categories:[] },
  { row:30, daily:true,  categories:[] },
  { row:31, daily:false, categories:['주차장비','CCTV'],                                catLabels:{'CCTV':'cctv'} },
  { row:32, daily:false, categories:['회전문'] },
  { row:33, daily:true,  categories:[] },
]

const DOW = ['일','월','화','수','목','금','토']

// 셀 주소 헬퍼 (0-indexed row/col → "D14" 등)
function cellAddr(r: number, c: number): string {
  let col = ''
  let cc = c
  while (cc >= 0) {
    col = String.fromCharCode(65 + (cc % 26)) + col
    cc = Math.floor(cc / 26) - 1
  }
  return `${col}${r + 1}`
}

// ── 메인 함수 ───────────────────────────────────────────────────
export async function generateMonthlyPlan(year: number, month: number, returnBlob?: boolean): Promise<Blob | void> {
  const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')

  // 1) 템플릿 fetch
  const res = await fetch('/templates/monthly_plan_template.xlsx')
  const buf = await res.arrayBuffer()
  const files = unzipSync(new Uint8Array(buf))

  const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

  function patchCell(xml: string, addr: string, value: string | number | null): string {
    const tag   = `<c r="${addr}"`
    const start = xml.indexOf(tag)
    if (start === -1) return xml
    const selfEnd  = xml.indexOf('/>', start)
    const closeEnd = xml.indexOf('</c>', start)
    let end: number
    if (selfEnd !== -1 && (closeEnd === -1 || selfEnd < closeEnd)) {
      end = selfEnd + 2
    } else if (closeEnd !== -1) {
      end = closeEnd + 4
    } else {
      return xml
    }
    const orig  = xml.slice(start, end)
    const sAttr = (orig.match(/\ss="([^"]*)"/) ?? [])[1]
    const s     = sAttr !== undefined ? ` s="${sAttr}"` : ''
    const newCell = value === null
      ? `<c r="${addr}"${s}/>`
      : typeof value === 'number'
        ? `<c r="${addr}"${s}><v>${value}</v></c>`
        : `<c r="${addr}"${s} t="str"><v>${esc(value)}</v></c>`
    return xml.slice(0, start) + newCell + xml.slice(end)
  }

  // 2) 해당 월 일정 가져오기
  const ym = `${year}-${String(month).padStart(2, '0')}`
  const items = await scheduleApi.getByMonth(ym)

  // 날짜별 카테고리 매핑
  const dayCatMap: Record<number, Set<string>> = {}
  for (const item of items) {
    if (!item.inspectionCategory) continue
    const startDay = parseInt(item.date.split('-')[2])
    const endDay = item.endDate ? parseInt(item.endDate.split('-')[2]) : startDay
    for (let d = startDay; d <= endDay; d++) {
      if (!dayCatMap[d]) dayCatMap[d] = new Set()
      dayCatMap[d].add(item.inspectionCategory)
    }
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDow = new Date(year, month - 1, 1).getDay()

  // 3) 시트 XML 패치
  let xml = strFromU8(files['xl/worksheets/sheet1.xml'])

  // ── 월 라벨 (D11 = row 10, col 3) ──
  xml = patchCell(xml, cellAddr(10, 3), `${month}월`)

  // ── 날짜 행 (row 11, D12~): 해당 월 일수만큼만 ──
  for (let d = 0; d < daysInMonth; d++) {
    xml = patchCell(xml, cellAddr(11, 3 + d), d + 1)
  }

  // ── 요일 행 (row 12, D13~): 해당 월 일수만큼만 ──
  for (let d = 0; d < daysInMonth; d++) {
    const dow = (firstDow + d) % 7
    xml = patchCell(xml, cellAddr(12, 3 + d), DOW[dow])
  }

  // ── 일상점검 행: 해당 월 일수만큼 "점검" 채우기 ──
  for (const pr of PLAN_ROWS) {
    if (!pr.daily) continue
    for (let d = 0; d < daysInMonth; d++) {
      xml = patchCell(xml, cellAddr(pr.row, 3 + d), '점검')
    }
  }

  // ── 비일상 행: 스케줄 데이터로 채우기 ──
  for (const pr of PLAN_ROWS) {
    if (pr.daily) continue
    if (pr.categories.length === 0) continue

    for (let d = 1; d <= daysInMonth; d++) {
      const dayCats = dayCatMap[d]
      if (!dayCats) continue
      for (const cat of pr.categories) {
        if (dayCats.has(cat)) {
          xml = patchCell(xml, cellAddr(pr.row, 3 + d - 1), pr.catLabels?.[cat] ?? '점검')
          break  // 한 셀에 하나만
        }
      }
    }
  }

  // ── 시트명 + 월 라벨 변경 ──
  let wbXml = strFromU8(files['xl/workbook.xml'])
  wbXml = wbXml.replace(/0월 방재업무계획/, `${month}월 방재업무계획`)

  // 4) 파일 재조립
  const newFiles: Record<string, Uint8Array> = {}
  for (const [key, data] of Object.entries(files)) {
    if (key === 'xl/worksheets/sheet1.xml') {
      newFiles[key] = strToU8(xml)
    } else if (key === 'xl/workbook.xml') {
      newFiles[key] = strToU8(wbXml)
    } else {
      newFiles[key] = data as Uint8Array
    }
  }

  const zipped = zipSync(newFiles, { level: 6 })
  const blob = new Blob([zipped.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  if (returnBlob) return blob

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${year}년_${month}월_중요업무추진계획(방재).xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

import { getMonthlySchedule } from './shiftCalc'
import { DOW_KO } from './shiftCalc'

// ── 상수 ──────────────────────────────────────────────────────
export const DIV_NAMES: Record<string, string> = {
  '9-3':  '8층 계단위 PS실',
  '8-1':  '8층 연구동 공조실', '8-2':  '8층 연구동 PS실',  '8-3':  '8층 사무동 PS실',
  '7-1':  '7층 연구동 공조실', '7-2':  '7층 연구동 PS실',  '7-3':  '7층 사무동 PS실',
  '6-1':  '6층 연구동 공조실', '6-2':  '6층 연구동 PS실',  '6-3':  '6층 사무동 PS실',
  '5-1':  '5층 연구동 공조실', '5-2':  '5층 연구동 PS실',  '5-3':  '5층 사무동 PS실',
  '3-1':  '3층 연구동 공조실', '3-2':  '3층 연구동 PS실',  '3-3':  '3층 사무동 PS실',
  '2-2':  '2층 PS실',          '2-3':  '2층 사무동 PS실',
  '1-1':  '1층 연구동 공조실', '1-2':  '1층 연구동 PS실',  '1-3':  '1층 사무동 PS실',
  '-1-1': 'B1층 공조실',       '-1-2': 'B1층 식당',        '-1-3': 'B1층 화장실',
  '-2-1': 'B2층 공조실',       '-2-2': 'B2층 CPX실',       '-2-3': 'B2층 PS실',
  '-3-2': 'B3층 휀룸1',        '-3-3': 'B3층 기사대기실',
  '-4-1': 'B4층 휀룸1',        '-4-2': 'B4층 기계실',      '-4-3': 'B4층 창고',
  '-5-2': 'B5층 휀룸1',        '-5-3': 'B5층 휀룸2',
}
export const DIV_ORDER = [
  '9-3','8-1','8-2','8-3','7-1','7-2','7-3','6-1','6-2','6-3',
  '5-1','5-2','5-3','3-1','3-2','3-3','2-2','2-3',
  '1-1','1-2','1-3','-1-1','-1-2','-1-3','-2-1','-2-2','-2-3',
  '-3-2','-3-3','-4-1','-4-2','-4-3','-5-2','-5-3',
]

// ── 공통 헬퍼: shrink-to-fit 스타일 생성 ─────────────────────

/** 셀 주소에서 s= 스타일 인덱스 추출 */
function getCellStyleIdx(sheetXml: string, addr: string): number {
  const tag   = `<c r="${addr}"`
  const start = sheetXml.indexOf(tag)
  if (start === -1) return -1
  const end   = sheetXml.indexOf('>', start)
  const m     = sheetXml.slice(start, end).match(/\ss="(\d+)"/)
  return m ? parseInt(m[1]) : -1
}

/**
 * styles.xml에 origIdx 스타일을 복제하고 shrinkToFit="1" 을 추가해
 * 새 스타일 인덱스를 반환한다. wrapText는 제거(shrinkToFit과 양립 불가).
 */
function addShrinkStyle(stylesXml: string, origIdx: number): [string, number] {
  const cfStart = stylesXml.indexOf('<cellXfs')
  const cfEnd   = stylesXml.indexOf('</cellXfs>')
  if (cfStart === -1 || cfEnd === -1) return [stylesXml, origIdx]

  // origIdx 번째 <xf 요소 찾기
  let pos = cfStart, cnt = 0, xfStart = -1
  while (true) {
    const nx = stylesXml.indexOf('<xf', pos)
    if (nx === -1 || nx >= cfEnd) break
    if (cnt === origIdx) { xfStart = nx; break }
    cnt++; pos = nx + 1
  }
  if (xfStart === -1) return [stylesXml, origIdx]

  // xf 요소 끝 위치
  const se = stylesXml.indexOf('/>', xfStart)
  const ce = stylesXml.indexOf('</xf>', xfStart)
  let xfEnd: number, xfXml: string
  if (se !== -1 && (ce === -1 || se < ce)) {
    xfEnd = se + 2; xfXml = stylesXml.slice(xfStart, xfEnd)
    // self-closing → 펼쳐서 alignment 추가
    xfXml = xfXml.slice(0, -2) + '><alignment shrinkToFit="1"/></xf>'
  } else {
    xfEnd = ce + 5; xfXml = stylesXml.slice(xfStart, xfEnd)
    xfXml = xfXml.replace(/\swrapText="1"/g, '')  // wrapText 제거
    if (xfXml.includes('<alignment')) {
      xfXml = xfXml.replace('<alignment', '<alignment shrinkToFit="1"')
    } else {
      xfXml = xfXml.replace('</xf>', '<alignment shrinkToFit="1"/></xf>')
    }
  }

  // 현재 xf 총 개수 = 새 인덱스
  const total = (stylesXml.slice(cfStart, cfEnd).match(/<xf[\s>]/g) ?? []).length

  // </cellXfs> 직전에 새 xf 삽입
  const newStylesXml = stylesXml.slice(0, cfEnd) + xfXml + stylesXml.slice(cfEnd)
  return [newStylesXml, total]
}

/** patchCell + 스타일 인덱스 강제 지정 */
function patchCellStyled(
  xml: string, addr: string,
  value: string | number | null,
  styleIdx: number,
  esc: (s: string) => string
): string {
  const tag   = `<c r="${addr}"`
  const start = xml.indexOf(tag)
  if (start === -1) return xml
  const se = xml.indexOf('/>', start)
  const ce = xml.indexOf('</c>', start)
  const end = (se !== -1 && (ce === -1 || se < ce)) ? se + 2 : ce + 4
  const s   = ` s="${styleIdx}"`
  const newCell = value === null
    ? `<c r="${addr}"${s}/>`
    : typeof value === 'number'
      ? `<c r="${addr}"${s}><v>${value}</v></c>`
      : `<c r="${addr}"${s} t="str"><v>${esc(value)}</v></c>`
  return xml.slice(0, start) + newCell + xml.slice(end)
}

// ── DIV 점검표 (템플릿 기반, 34개 시트) ──────────────────────
export async function generateDivExcel(year: number, divRaw: any[], timing: '월초' | '월말' = '월초') {
  const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')

  const res = await fetch('/templates/check_template.xlsx')
  const ab  = await res.arrayBuffer()
  const files = unzipSync(new Uint8Array(ab))

  // 월초=sheet1, 월말=sheet2
  const srcSheet = timing === '월초' ? 'xl/worksheets/sheet1.xml' : 'xl/worksheets/sheet2.xml'
  const templateXml = strFromU8(files[srcSheet])

  const byLoc: Record<string, any[]> = {}
  divRaw.forEach((r: any) => { (byLoc[r.location_no] ??= []).push(r) })

  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function patchCell(xml: string, addr: string, value: string | number | null): string {
    const tag   = `<c r="${addr}"`
    const start = xml.indexOf(tag)
    if (start === -1) return xml
    const selfEnd  = xml.indexOf('/>', start)
    const closeEnd = xml.indexOf('</c>', start)
    let end: number
    if (selfEnd !== -1 && (closeEnd === -1 || selfEnd < closeEnd)) {
      end = selfEnd + 2
    } else {
      end = closeEnd + 4
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

  // styles.xml에 shrink 스타일 추가 (N2 셀 기준)
  let stylesXml = strFromU8(files['xl/styles.xml'])
  const o2SIdx  = getCellStyleIdx(templateXml, 'N2')
  let shrinkIdx = o2SIdx
  if (o2SIdx >= 0) {
    ;[stylesXml, shrinkIdx] = addShrinkStyle(stylesXml, o2SIdx)
  }

  // 정적 파일 복사
  const newFiles: Record<string, Uint8Array> = {}
  for (const key of ['xl/sharedStrings.xml', 'xl/theme/theme1.xml', 'docProps/core.xml', 'docProps/app.xml']) {
    if (files[key]) newFiles[key] = files[key] as Uint8Array
  }
  newFiles['xl/styles.xml'] = strToU8(stylesXml)

  // 34개소 시트 생성
  const sheets: { name: string; fn: string }[] = []

  DIV_ORDER.forEach((locNo, idx) => {
    const locName = DIV_NAMES[locNo] ?? locNo
    const entries = (byLoc[locNo] ?? []).sort((a: any, b: any) => a.month - b.month)
    const fn = `ds${idx + 1}.xml`

    let xml = templateXml
    // printerSettings 참조 제거 (파일 없으므로)
    xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')

    // 헤더: 연도·DIV 호기 (N2 = shrink-to-fit)
    xml = patchCell(xml, 'E2', String(year))
    xml = patchCellStyled(xml, 'N2', locNo, shrinkIdx, esc)

    // 압력값 소수점 1자리 포맷
    function fmt(v: any) { return v != null ? Number(v).toFixed(1) : null }

    // 월별 데이터 (1~6월=좌측, 7~12월=우측, 3행씩)
    for (let m = 1; m <= 12; m++) {
      const entry = entries.find((e: any) => e.month === m)
      const isLeft = m <= 6
      const tr = isLeft ? 9 + (m - 1) * 3 : 9 + (m - 7) * 3

      if (isLeft) {
        // 좌측: B{tr+2}=날짜, D=밸브, F=압력, H=압력스위치, I=청소, J=압력값, K=점검자
        xml = patchCell(xml, `B${tr + 2}`, entry?.day ?? null)
        xml = patchCell(xml, `D${tr}`,     entry ? '○' : null)
        xml = patchCell(xml, `F${tr}`,     entry ? '○' : null)
        xml = patchCell(xml, `H${tr}`,     entry ? '○' : null)
        xml = patchCell(xml, `I${tr}`,     entry ? '○' : null)
        xml = patchCell(xml, `J${tr}`,     fmt(entry?.pressure_1))
        xml = patchCell(xml, `J${tr + 1}`, fmt(entry?.pressure_2))
        xml = patchCell(xml, `J${tr + 2}`, fmt(entry?.pressure_set))
        xml = patchCell(xml, `K${tr}`,     entry?.inspector ?? null)
      } else {
        // 우측: L{tr+2}=날짜, N=밸브, P=압력, Q=압력스위치, T=청소, V=압력값, X=점검자
        xml = patchCell(xml, `L${tr + 2}`, entry?.day ?? null)
        xml = patchCell(xml, `N${tr}`,     entry ? '○' : null)
        xml = patchCell(xml, `P${tr}`,     entry ? '○' : null)
        xml = patchCell(xml, `Q${tr}`,     entry ? '○' : null)
        xml = patchCell(xml, `T${tr}`,     entry ? '○' : null)
        xml = patchCell(xml, `V${tr}`,     fmt(entry?.pressure_1))
        xml = patchCell(xml, `V${tr + 1}`, fmt(entry?.pressure_2))
        xml = patchCell(xml, `V${tr + 2}`, fmt(entry?.pressure_set))
        xml = patchCell(xml, `X${tr}`,     entry?.inspector ?? null)
      }
    }

    newFiles[`xl/worksheets/${fn}`] = strToU8(xml)
    sheets.push({ name: locName.slice(0, 31), fn })
  })

  // workbook.xml
  const sheetsTag = sheets.map((s, i) =>
    `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
  ).join('')
  newFiles['xl/workbook.xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="29040" windowHeight="15840"/></bookViews><sheets>${sheetsTag}</sheets></workbook>`
  )

  // workbook.xml.rels
  const N = sheets.length
  const sheetRel = sheets.map((s, i) =>
    `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/${s.fn}"/>`
  ).join('')
  newFiles['xl/_rels/workbook.xml.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRel}<Relationship Id="rId${N+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId${N+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId${N+3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>`
  )

  // [Content_Types].xml
  const sheetCt = sheets.map(s =>
    `<Override PartName="/xl/worksheets/${s.fn}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join('')
  newFiles['[Content_Types].xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheetCt}<Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`
  )

  // _rels/.rels
  newFiles['_rels/.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`
  )

  const zipped = zipSync(newFiles, { level: 6 })
  const blob   = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `${year}년도_DIV점검표_${timing}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── 소화전/비상콘센트/청정소화약제 (템플릿 기반) ──────────────
// 소화전·비상콘센트: 날짜=11행, 점검자=27행, 체크=13,15,17,19,21,23,25행
// 청정소화약제:      날짜=9행,  점검자=31행, 체크=11,13,15,17,19,21,23,25,27,29행
const CHECK_DATE_COLS = ['H','J','L','N','P','R','T','W','Z','AB','AD','AF']   // 소화전·비상콘센트
const GAS_DATE_COLS   = ['H','J','M','P','S','U','W','Z','AC','AE','AG','AI']  // 청정소화약제
const CHECK_MARK_ROWS: Record<string, number[]> = {
  '소화전':       [13,15,17,19,21,23,25],
  '비상콘센트':   [13,15,17,19,21,23,25],
  '청정소화약제': [11,13,15,17,19,21,23,25,27,29],
}

export async function generateCheckExcel(year: number, checkRaw: any[], category: string) {
  const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')

  const res   = await fetch('/templates/check_template.xlsx')
  const ab    = await res.arrayBuffer()
  const files = unzipSync(new Uint8Array(ab))

  // 카테고리별 템플릿 시트 선택
  const srcSheet =
    category === '소화전'      ? 'xl/worksheets/sheet3.xml' :
    category === '비상콘센트'  ? 'xl/worksheets/sheet4.xml' :
                                  'xl/worksheets/sheet5.xml'  // 청정소화약제
  const templateXml = strFromU8(files[srcSheet])

  const isGas      = category === '청정소화약제'
  const dateCols   = isGas ? GAS_DATE_COLS   : CHECK_DATE_COLS
  const dateRow    = isGas ? 9               : 11
  const inspRow    = isGas ? 31              : 27
  const checkRows  = CHECK_MARK_ROWS[category] ?? []

  // 연도·개소 셀 위치
  const yearCell = isGas ? 'E3' : 'E5'
  const idCell   = category === '비상콘센트' ? 'N5' : isGas ? 'O3' : 'L5'

  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  // shrink 스타일 준비 (idCell 기준)
  let stylesXml2 = strFromU8(files['xl/styles.xml'])
  const idSIdx   = getCellStyleIdx(templateXml, idCell)
  let shrinkIdx2 = idSIdx
  if (idSIdx >= 0) {
    ;[stylesXml2, shrinkIdx2] = addShrinkStyle(stylesXml2, idSIdx)
  }

  function patchCell(xml: string, addr: string, value: string | number | null): string {
    const tag   = `<c r="${addr}"`
    const start = xml.indexOf(tag)
    if (start === -1) return xml
    const selfEnd  = xml.indexOf('/>', start)
    const closeEnd = xml.indexOf('</c>', start)
    let end: number
    if (selfEnd !== -1 && (closeEnd === -1 || selfEnd < closeEnd)) {
      end = selfEnd + 2
    } else {
      end = closeEnd + 4
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

  // 정적 파일 복사
  const newFiles: Record<string, Uint8Array> = {}
  for (const key of ['xl/sharedStrings.xml','xl/theme/theme1.xml','docProps/core.xml','docProps/app.xml']) {
    if (files[key]) newFiles[key] = files[key] as Uint8Array
  }
  newFiles['xl/styles.xml'] = strToU8(stylesXml2)

  const sheets: { name: string; fn: string }[] = []

  checkRaw.forEach((loc: any, idx: number) => {
    const fn        = `ck${idx + 1}.xml`
    const locId     = isGas ? (loc.location ?? '') : (loc.location_no ?? loc.location ?? '')
    const sheetName = (loc.location ?? `개소${idx + 1}`).slice(0, 31)

    let xml = templateXml
    xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')

    // 헤더: 연도·개소 (idCell = shrink-to-fit)
    xml = patchCell(xml, yearCell, String(year))
    xml = patchCellStyled(xml, idCell, locId, shrinkIdx2, esc)

    // 월별 데이터 (1~12월)
    for (let m = 1; m <= 12; m++) {
      const entry = loc.months?.[m]
      const col   = dateCols[m - 1]
      const day   = entry?.day ? Number(entry.day) : null

      // 날짜
      xml = patchCell(xml, `${col}${dateRow}`, day)
      // 체크마크
      for (const row of checkRows) {
        xml = patchCell(xml, `${col}${row}`, entry ? '○' : null)
      }
      // 점검자
      xml = patchCell(xml, `${col}${inspRow}`, entry?.inspector ?? null)
    }

    newFiles[`xl/worksheets/${fn}`] = strToU8(xml)
    sheets.push({ name: sheetName, fn })
  })

  // workbook.xml
  const sheetsTag = sheets.map((s, i) =>
    `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
  ).join('')
  newFiles['xl/workbook.xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="29040" windowHeight="15840"/></bookViews><sheets>${sheetsTag}</sheets></workbook>`
  )

  const N = sheets.length
  const sheetRel = sheets.map((s, i) =>
    `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/${s.fn}"/>`
  ).join('')
  newFiles['xl/_rels/workbook.xml.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRel}<Relationship Id="rId${N+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId${N+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId${N+3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>`
  )

  const sheetCt = sheets.map(s =>
    `<Override PartName="/xl/worksheets/${s.fn}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join('')
  newFiles['[Content_Types].xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheetCt}<Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`
  )
  newFiles['_rels/.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`
  )

  const zipped = zipSync(newFiles, { level: 6 })
  const blob   = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `${year}년도_${category}_점검일지.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── 연간 매트릭스 점검일지 (sheets 6-9: 피난방화/방화셔터/제연/자탐) ──────
// MATRIX_DATE_COLS: 각 월에 해당하는 열 문자 (12개월 × 1열)
const MATRIX_DATE_COLS = ['H','J','M','P','S','U','W','Z','AC','AE','AG','AI']

/**
 * 연간 매트릭스 점검일지 엑셀 생성 (sheets 6-9)
 * - sheetIndex 6: 피난방화시설, 7: 방화셔터, 8: 제연설비, 9: 자동화재탐지설비
 * - itemCount 9 (sheets 6/7/8) or 10 (sheet 9)
 */
export async function generateMatrixExcel(
  year: number,
  data: any[],
  sheetIndex: number,
  itemCount: number,
  reportName: string
) {
  const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')

  const res = await fetch('/templates/annual_matrix_template.xlsx')
  const ab  = await res.arrayBuffer()
  const files = unzipSync(new Uint8Array(ab))

  let xml = strFromU8(files[`xl/worksheets/sheet${sheetIndex}.xml`])
  // printerSettings 참조 제거 (파일 없으므로 r:id 속성 제거)
  xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')

  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function patchCell(x: string, addr: string, value: string | number | null): string {
    const tag   = `<c r="${addr}"`
    const start = x.indexOf(tag)
    if (start === -1) return x
    const selfEnd  = x.indexOf('/>', start)
    const closeEnd = x.indexOf('</c>', start)
    let end: number
    if (selfEnd !== -1 && (closeEnd === -1 || selfEnd < closeEnd)) {
      end = selfEnd + 2
    } else {
      end = closeEnd + 4
    }
    const orig  = x.slice(start, end)
    const sAttr = (orig.match(/\ss="([^"]*)"/) ?? [])[1]
    const s     = sAttr !== undefined ? ` s="${sAttr}"` : ''
    const newCell = value === null
      ? `<c r="${addr}"${s}/>`
      : typeof value === 'number'
        ? `<c r="${addr}"${s}><v>${value}</v></c>`
        : `<c r="${addr}"${s} t="str"><v>${esc(value)}</v></c>`
    return x.slice(0, start) + newCell + x.slice(end)
  }

  // 연도 패치
  xml = patchCell(xml, 'E3', String(year))

  // 체크 행 목록 (9 or 10 items)
  const checkRows = [11, 13, 15, 17, 19, 21, 23, 25, 27]
  if (itemCount >= 10) checkRows.push(29)

  // 월별 집계: data 배열 전체에서 해당 월 점검 여부 판단
  for (let m = 1; m <= 12; m++) {
    const col = MATRIX_DATE_COLS[m - 1]
    // 해당 월에 점검 기록이 있는 첫 번째 체크포인트 찾기
    const entry = data.find(cp => cp.months?.[m])
    const monthChecked = !!entry
    const day = entry?.months?.[m]?.day ? Number(entry.months[m].day) : null
    const inspector = entry?.months?.[m]?.inspector ?? null

    // 날짜 (row 9)
    xml = patchCell(xml, `${col}9`, day)
    // 체크 항목 (each row)
    for (const row of checkRows) {
      xml = patchCell(xml, `${col}${row}`, monthChecked ? '○' : null)
    }
    // 점검자 (row 31)
    xml = patchCell(xml, `${col}31`, inspector)
  }

  // 단일 시트 출력 빌드
  const newFiles: Record<string, Uint8Array> = {}
  for (const key of ['xl/sharedStrings.xml', 'xl/theme/theme1.xml', 'xl/styles.xml', 'docProps/core.xml', 'docProps/app.xml']) {
    if (files[key]) newFiles[key] = files[key] as Uint8Array
  }
  newFiles['xl/worksheets/sheet1.xml'] = strToU8(xml)

  newFiles['xl/workbook.xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="29040" windowHeight="15840"/></bookViews><sheets><sheet name="${esc(reportName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`
  )
  newFiles['xl/_rels/workbook.xml.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>`
  )
  newFiles['[Content_Types].xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`
  )
  newFiles['_rels/.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`
  )

  const zipped = zipSync(newFiles, { level: 6 })
  const blob   = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `${year}년도_${reportName}_점검일지.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── 소방펌프 점검일지 (sheet 10: 월별 단일 출력) ─────────────────────────
// PUMP_RESULT_ROWS: 20개 항목 중 items 1-10 (left col I) and items 11-20 (right col AJ)
const PUMP_RESULT_ROWS = [9, 11, 13, 15, 17, 19, 21, 23, 25, 27]

/**
 * 소방펌프 월간 점검일지 엑셀 생성 (sheet 10)
 * - 월별 단일 출력 (year + month 지정)
 * - 20개 항목 좌측(I열) / 우측(AJ열) 배치
 */
export async function generatePumpExcel(
  year: number,
  month: number,
  data: any[]
) {
  const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')

  const res = await fetch('/templates/annual_matrix_template.xlsx')
  const ab  = await res.arrayBuffer()
  const files = unzipSync(new Uint8Array(ab))

  let xml = strFromU8(files['xl/worksheets/sheet10.xml'])
  // printerSettings 참조 제거
  xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')

  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function patchCell(x: string, addr: string, value: string | number | null): string {
    const tag   = `<c r="${addr}"`
    const start = x.indexOf(tag)
    if (start === -1) return x
    const selfEnd  = x.indexOf('/>', start)
    const closeEnd = x.indexOf('</c>', start)
    let end: number
    if (selfEnd !== -1 && (closeEnd === -1 || selfEnd < closeEnd)) {
      end = selfEnd + 2
    } else {
      end = closeEnd + 4
    }
    const orig  = x.slice(start, end)
    const sAttr = (orig.match(/\ss="([^"]*)"/) ?? [])[1]
    const s     = sAttr !== undefined ? ` s="${sAttr}"` : ''
    const newCell = value === null
      ? `<c r="${addr}"${s}/>`
      : typeof value === 'number'
        ? `<c r="${addr}"${s}><v>${value}</v></c>`
        : `<c r="${addr}"${s} t="str"><v>${esc(value)}</v></c>`
    return x.slice(0, start) + newCell + x.slice(end)
  }

  // 헤더: 연도 / 월
  xml = patchCell(xml, 'D3', String(year))
  xml = patchCell(xml, 'G3', String(month))

  // 해당 월 점검 기록 존재 여부
  const hasRecord = data.some(cp => cp.months?.[month])

  // 20개 항목 결과 기입 (좌: items 1-10 col I, 우: items 11-20 col AJ)
  for (const row of PUMP_RESULT_ROWS) {
    xml = patchCell(xml, `I${row}`,  hasRecord ? '○' : null)
    xml = patchCell(xml, `AJ${row}`, hasRecord ? '○' : null)
  }

  // 점검자 이름 (row 31)
  const entry = data.find(cp => cp.months?.[month])
  const inspector = entry?.months?.[month]?.inspector ?? null
  xml = patchCell(xml, 'I31', inspector)
  xml = patchCell(xml, 'AJ31', inspector)

  // 단일 시트 출력 빌드
  const newFiles: Record<string, Uint8Array> = {}
  for (const key of ['xl/sharedStrings.xml', 'xl/theme/theme1.xml', 'xl/styles.xml', 'docProps/core.xml', 'docProps/app.xml']) {
    if (files[key]) newFiles[key] = files[key] as Uint8Array
  }
  newFiles['xl/worksheets/sheet1.xml'] = strToU8(xml)

  newFiles['xl/workbook.xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="29040" windowHeight="15840"/></bookViews><sheets><sheet name="소방펌프점검일지" sheetId="1" r:id="rId1"/></sheets></workbook>`
  )
  newFiles['xl/_rels/workbook.xml.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>`
  )
  newFiles['[Content_Types].xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`
  )
  newFiles['_rels/.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`
  )

  const zipped = zipSync(newFiles, { level: 6 })
  const blob   = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `${year}년_${month}월_소방펌프_점검일지.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── 근무표 (fflate zip 직접 패치 → 원본 서식/이미지 완전 보존) ─
export async function generateShiftExcel(year: number, month: number) {
  const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')

  const res = await fetch('/templates/shift_template.xlsx')
  const ab  = await res.arrayBuffer()
  const files = unzipSync(new Uint8Array(ab))

  const { daysInMonth, staffRows } = getMonthlySchedule(year, month)

  // day(1~31) → 열 문자 (D~AH)
  function dayToCol(d: number): string {
    const n = d + 3
    if (n <= 26) return String.fromCharCode(64 + n)
    return String.fromCharCode(64 + Math.floor(n / 26)) + String.fromCharCode(64 + (n % 26))
  }

  // XML 특수문자 이스케이프
  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  // 셀 패치: addr 위치 XML 요소를 찾아 값/타입만 교체, 스타일(s=)은 원본 유지
  function patchCell(xml: string, addr: string, value: string | number | null): string {
    const tag = `<c r="${addr}"`
    const start = xml.indexOf(tag)
    if (start === -1) return xml

    // 셀 끝 위치 탐색
    const selfEnd   = xml.indexOf('/>', start)
    const closeEnd  = xml.indexOf('</c>', start)
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

    let newCell: string
    if (value === null) {
      newCell = `<c r="${addr}"${s}/>`
    } else if (typeof value === 'number') {
      newCell = `<c r="${addr}"${s}><v>${value}</v></c>`
    } else {
      newCell = `<c r="${addr}"${s} t="str"><v>${esc(value)}</v></c>`
    }

    return xml.slice(0, start) + newCell + xml.slice(end)
  }

  // sheet1.xml 패치
  let xml = strFromU8(files['xl/worksheets/sheet1.xml'])

  // 제목
  xml = patchCell(xml, 'D1', `${year}년 ${month}월 출근부`)

  for (let d = 1; d <= 31; d++) {
    const col = dayToCol(d)
    if (d <= daysInMonth) {
      const dow = new Date(year, month - 1, d).getDay()
      xml = patchCell(xml, `${col}2`, d)
      xml = patchCell(xml, `${col}3`, DOW_KO[dow])
      staffRows.forEach((staff, i) => {
        xml = patchCell(xml, `${col}${i + 4}`, staff.shifts[d - 1])
      })
    } else {
      // 해당 월에 없는 날짜 열 비우기
      xml = patchCell(xml, `${col}2`, null)
      xml = patchCell(xml, `${col}3`, null)
      for (let r = 4; r <= 7; r++) xml = patchCell(xml, `${col}${r}`, null)
    }
  }

  // 틀고정 수정: 요일 행(row 3)까지 포함, ySplit → 3, topLeftCell → D4
  xml = xml.replace(/(<pane\b[^>]*)ySplit="[^"]*"/, '$1ySplit="3"')
  xml = xml.replace(/(<pane\b[^>]*)topLeftCell="[^"]*"/, '$1topLeftCell="D4"')

  files['xl/worksheets/sheet1.xml'] = strToU8(xml)

  // 다운로드
  const zipped = zipSync(files, { level: 6 })
  const blob   = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href = url
  a.download = `${year}년_${month}월_근무표.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

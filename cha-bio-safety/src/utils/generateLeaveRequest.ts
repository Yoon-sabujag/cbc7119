// ── 휴가신청서 Excel 생성 (fflate 템플릿 기반) ──────────────────

export interface LeaveRequestData {
  staffName: string
  staffId: string
  hireDate: string       // 'YYYY-MM-DD'
  birthDate?: string     // 'YYYY-MM-DD' (optional)
  phone: string
  leaveType: string      // 'annual'|'condolence'|'sick_work'|'sick_personal'|'health'|'official'|'other_special'
  otherReason?: string   // free text for 기타특별휴가
  reason?: string        // 연차 외 사유 (기타사항 란)
  startDate: string      // 'YYYY-MM-DD'
  endDate: string        // 'YYYY-MM-DD'
  totalDays: number      // 순수 기간 일수
  workDays?: number      // 근무일수 (연차 신청일수)
}

// ── 헬퍼 ──────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** 기존 셀 태그를 찾아 값만 교체, s= 스타일 보존 */
function patchCell(xml: string, addr: string, value: string | number | null): string {
  const tag = `<c r="${addr}"`
  const start = xml.indexOf(tag)
  if (start === -1) return xml
  const selfEnd = xml.indexOf('/>', start)
  const closeEnd = xml.indexOf('</c>', start)
  let end: number
  if (selfEnd !== -1 && (closeEnd === -1 || selfEnd < closeEnd)) {
    end = selfEnd + 2
  } else {
    end = closeEnd + 4
  }
  const orig = xml.slice(start, end)
  const sAttr = (orig.match(/\ss="([^"]*)"/) ?? [])[1]
  const s = sAttr !== undefined ? ` s="${sAttr}"` : ''
  const newCell = value === null
    ? `<c r="${addr}"${s}/>`
    : typeof value === 'number'
      ? `<c r="${addr}"${s}><v>${value}</v></c>`
      : `<c r="${addr}"${s} t="str"><v>${esc(value)}</v></c>`
  return xml.slice(0, start) + newCell + xml.slice(end)
}

/** 셀에 특정 스타일 인덱스를 강제 적용 */
function patchCellStyled(
  xml: string, addr: string,
  value: string | number | null,
  styleIdx: number,
): string {
  const tag = `<c r="${addr}"`
  const start = xml.indexOf(tag)
  if (start === -1) return xml
  const selfEnd = xml.indexOf('/>', start)
  const closeEnd = xml.indexOf('</c>', start)
  const end = (selfEnd !== -1 && (closeEnd === -1 || selfEnd < closeEnd)) ? selfEnd + 2 : closeEnd + 4
  const s = ` s="${styleIdx}"`
  const newCell = value === null
    ? `<c r="${addr}"${s}/>`
    : typeof value === 'number'
      ? `<c r="${addr}"${s}><v>${value}</v></c>`
      : `<c r="${addr}"${s} t="str"><v>${esc(value)}</v></c>`
  return xml.slice(0, start) + newCell + xml.slice(end)
}

/**
 * styles.xml에 solid black fill을 추가하고, origIdx 스타일을 복제 +
 * 새 fillId 를 적용한 xf 를 만들어 새 스타일 인덱스를 반환한다.
 */
function addBlackFillStyle(stylesXml: string, origIdx: number): [string, number] {
  let xml = stylesXml

  // 1) fills 섹션에 solid black fill 추가
  const fillsEnd = xml.indexOf('</fills>')
  if (fillsEnd === -1) return [xml, origIdx]

  const newFill = '<fill><patternFill patternType="solid"><fgColor rgb="FF000000"/><bgColor indexed="64"/></patternFill></fill>'
  xml = xml.slice(0, fillsEnd) + newFill + xml.slice(fillsEnd)

  // fills count 업데이트
  const fillsMatch = xml.match(/<fills count="(\d+)"/)
  if (fillsMatch) {
    const oldCount = parseInt(fillsMatch[1])
    xml = xml.replace(`<fills count="${oldCount}"`, `<fills count="${oldCount + 1}"`)
  }
  const newFillId = fillsMatch ? parseInt(fillsMatch[1]) : 2 // 기존 count = 새 인덱스

  // 2) cellXfs 섹션에서 origIdx 번째 xf를 복제하고 fillId 교체
  const cfStart = xml.indexOf('<cellXfs')
  const cfEnd = xml.indexOf('</cellXfs>')
  if (cfStart === -1 || cfEnd === -1) return [xml, origIdx]

  // origIdx 번째 <xf 요소 찾기
  let pos = cfStart, cnt = 0, xfStart = -1
  while (true) {
    const nx = xml.indexOf('<xf', pos)
    if (nx === -1 || nx >= cfEnd) break
    if (cnt === origIdx) { xfStart = nx; break }
    cnt++; pos = nx + 1
  }
  if (xfStart === -1) return [xml, origIdx]

  // xf 요소 끝 위치
  const se = xml.indexOf('/>', xfStart)
  const ce = xml.indexOf('</xf>', xfStart)
  let xfEnd: number, xfXml: string
  if (se !== -1 && (ce === -1 || se < ce)) {
    xfEnd = se + 2; xfXml = xml.slice(xfStart, xfEnd)
  } else {
    xfEnd = ce + 5; xfXml = xml.slice(xfStart, xfEnd)
  }

  // fillId 교체
  if (xfXml.includes('fillId=')) {
    xfXml = xfXml.replace(/fillId="\d+"/, `fillId="${newFillId}"`)
  } else {
    xfXml = xfXml.replace('<xf', `<xf fillId="${newFillId}"`)
  }
  // applyFill 설정
  if (xfXml.includes('applyFill=')) {
    xfXml = xfXml.replace(/applyFill="\d+"/, 'applyFill="1"')
  } else {
    xfXml = xfXml.replace('<xf', '<xf applyFill="1"')
  }

  // 현재 xf 총 개수 = 새 인덱스
  const total = (xml.slice(cfStart, cfEnd).match(/<xf[\s>]/g) ?? []).length
  const newXml = xml.slice(0, cfEnd) + xfXml + xml.slice(cfEnd)

  // cellXfs count 업데이트
  const xfsMatch = newXml.match(/<cellXfs count="(\d+)"/)
  let result = newXml
  if (xfsMatch) {
    result = result.replace(`<cellXfs count="${xfsMatch[1]}"`, `<cellXfs count="${total + 1}"`)
  }

  return [result, total]
}

function createExcelBlob(buffer: ArrayBuffer): Blob {
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── 체크박스 셀 주소 매핑 (leave type -> checkbox cell address) ──
// 각 휴가 종류의 체크박스 셀 주소 (template sheet1.xml 기준)
// Cell mapping verified from shared strings and template XML structure
const CHECKBOX_CELLS: Record<string, string> = {
  annual: 'D19',           // 연차휴가
  condolence: 'J19',       // 경조휴가
  sick_work: 'S19',        // 병가(공상)
  sick_personal: 'AA19',   // 병가(사상)
  health: 'D21',           // 보건휴가
  official: 'J21',         // 공가
  other_special: 'S21',    // 기타특별휴가
}

// 체크박스 셀의 기존 스타일 인덱스 (border 유지용)
const CHECKBOX_STYLES: Record<string, number> = {
  D19: 62, J19: 63, S19: 65, AA19: 63,
  D21: 66, J21: 63, S21: 66,
}

// ── 메인 함수 ──────────────────────────────────────────────────

export async function generateLeaveRequest(data: LeaveRequestData): Promise<void> {
  const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')

  const res = await fetch('/templates/leave_request_template.xlsx')
  const ab = await res.arrayBuffer()
  const files = unzipSync(new Uint8Array(ab))

  let sheetXml = strFromU8(files['xl/worksheets/sheet1.xml'])
  let stylesXml = strFromU8(files['xl/styles.xml'])

  // ── 날짜 파싱 ──────────────────────────────────────────────
  const parseDate = (d: string) => {
    const [y, m, dd] = d.split('-')
    return { yy: y.slice(2), mm: String(parseInt(m)), dd: String(parseInt(dd)) }
  }

  // ── 입사일 (AA11, AD11, AG11) ─────────────────────────────
  if (data.hireDate) {
    const h = parseDate(data.hireDate)
    sheetXml = patchCell(sheetXml, 'AA11', h.yy)
    sheetXml = patchCell(sheetXml, 'AD11', h.mm)
    sheetXml = patchCell(sheetXml, 'AG11', h.dd)
  }

  // ── 생년월일 (AA12, AD12, AG12) ───────────────────────────
  if (data.birthDate) {
    const b = parseDate(data.birthDate)
    sheetXml = patchCell(sheetXml, 'AA12', b.yy)
    sheetXml = patchCell(sheetXml, 'AD12', b.mm)
    sheetXml = patchCell(sheetXml, 'AG12', b.dd)
  }

  // ── 성명 (I12) ────────────────────────────────────────────
  sheetXml = patchCell(sheetXml, 'I12', data.staffName)

  // ── 기간 시작일 (H15=yy, K15=mm, O15=dd) ──────────────────
  const s = parseDate(data.startDate)
  sheetXml = patchCell(sheetXml, 'H15', s.yy)
  sheetXml = patchCell(sheetXml, 'K15', s.mm)
  sheetXml = patchCell(sheetXml, 'O15', s.dd)

  // ── 기간 종료일 (U15=yy, W15=mm, Z15=dd) ──────────────────
  const e = parseDate(data.endDate)
  sheetXml = patchCell(sheetXml, 'U15', e.yy)
  sheetXml = patchCell(sheetXml, 'W15', e.mm)
  sheetXml = patchCell(sheetXml, 'Z15', e.dd)

  // ── 일수 (AC15) ───────────────────────────────────────────
  sheetXml = patchCell(sheetXml, 'AC15', data.totalDays)

  // ── 휴가 종류 체크박스 (black fill) ────────────────────────
  const checkAddr = CHECKBOX_CELLS[data.leaveType]
  if (checkAddr) {
    const origStyle = CHECKBOX_STYLES[checkAddr] ?? 0
    const [newStyles, newIdx] = addBlackFillStyle(stylesXml, origStyle)
    stylesXml = newStyles
    sheetXml = patchCellStyled(sheetXml, checkAddr, null, newIdx)
  }

  // ── 기타특별휴가 사유 텍스트 (AC21) ────────────────────────
  if (data.leaveType === 'other_special' && data.otherReason) {
    sheetXml = patchCell(sheetXml, 'AC21', data.otherReason)
  }

  // ── 연차 선택 시 신청일수 (U36) — 근무일수 사용 ─────────────
  if (data.leaveType === 'annual' && data.workDays != null) {
    sheetXml = patchCell(sheetXml, 'U36', data.workDays)
  }

  // ── 연차 외 선택시 사유 (H39 — 기타사항 란) ──────────────────
  if (data.leaveType !== 'annual' && data.reason) {
    sheetXml = patchCell(sheetXml, 'H39', data.reason)
  }

  // ── 휴가중 연락처 (J32) ───────────────────────────────────
  sheetXml = patchCell(sheetXml, 'J32', data.phone)

  // ── 신청일 — 오늘 날짜 ────────────────────────────────────
  // Row 38 area or wherever 신청일 field is (B38 = "기 타")
  // Based on template, the application date is typically near the bottom
  // We don't have a dedicated cell from the mapping, skip for now

  // ── 파일 재패킹 ───────────────────────────────────────────
  files['xl/worksheets/sheet1.xml'] = strToU8(sheetXml)
  files['xl/styles.xml'] = strToU8(stylesXml)

  const out = zipSync(files)
  const blob = createExcelBlob(out.buffer as ArrayBuffer)

  const today = new Date()
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  downloadBlob(blob, `휴가신청서_${data.staffName}_${dateStr}.xlsx`)
}

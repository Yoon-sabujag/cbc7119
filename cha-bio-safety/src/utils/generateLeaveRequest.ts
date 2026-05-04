// ── 휴가신청서 PDF 생성 (회사 양식 PDF + 좌표 오버레이) ──────────────────

import { PDFDocument, rgb, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export interface LeaveRequestData {
  staffName: string
  staffId: string
  hireDate: string       // 'YYYY-MM-DD'
  birthDate?: string     // 'YYYY-MM-DD'
  phone: string
  leaveType: string      // 'annual'|'condolence'|'sick_work'|'sick_personal'|'health'|'official'|'other_special'
  otherReason?: string
  reason?: string
  startDate: string
  endDate: string
  totalDays: number
  workDays?: number
}

const PAGE_H = 841
const ty = (bboxY: number) => PAGE_H - bboxY  // pdftotext (top-down) → pdf-lib (bottom-up)

const fmtDate = (d: string) => {
  const [y, m, dd] = d.split('-')
  return `${y.slice(2)}.${String(parseInt(m)).padStart(2, '0')}.${String(parseInt(dd)).padStart(2, '0')}`
}

const fmtDays = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1))

// 자간을 넓힌 성명 (윤종엽 → 윤 종 엽)
const spacedName = (name: string) => name.split('').join(' ')

function drawCentered(
  page: ReturnType<PDFDocument['getPage']>,
  text: string,
  font: PDFFont,
  size: number,
  centerX: number,
  baselineY: number,
) {
  const w = font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: centerX - w / 2, y: baselineY, size, font, color: rgb(0, 0, 0) })
}

// 텍스트 너비만큼만 흰 배경 그리고 텍스트 — 빈 양식의 dot/대시 가리는 용
function drawCenteredOnWhite(
  page: ReturnType<PDFDocument['getPage']>,
  text: string,
  font: PDFFont,
  size: number,
  centerX: number,
  baselineY: number,
  bgPadX = 3,
  bgPadY = 3,
) {
  const w = font.widthOfTextAtSize(text, size)
  page.drawRectangle({
    x: centerX - w / 2 - bgPadX,
    y: baselineY - bgPadY,
    width: w + bgPadX * 2,
    height: size + bgPadY,
    color: rgb(1, 1, 1),
  })
  page.drawText(text, { x: centerX - w / 2, y: baselineY, size, font, color: rgb(0, 0, 0) })
}

// 체크박스 위치/크기 — 사용자 캘리브레이션 도구로 측정 (캡쳐/calibrate.html)
const CHECKBOX_POS: Record<string, { x: number; y: number }> = {
  annual:        { x: 130.7, y: 362.7 },  // 연차휴가
  condolence:    { x: 233.7, y: 360.0 },  // 경조휴가
  sick_work:     { x: 328.0, y: 360.0 },  // 병가(공상)
  sick_personal: { x: 451.3, y: 360.0 },  // 병가(사상)
  health:        { x: 131.0, y: 401.3 },  // 보건휴가
  official:      { x: 233.7, y: 401.3 },  // 공가
  other_special: { x: 328.0, y: 401.3 },  // 기타특별휴가
}
const BOX_W = 17.5
const BOX_H = 18

export async function generateLeaveRequest(data: LeaveRequestData): Promise<void> {
  const [pdfRes, fontRegRes, fontBoldRes] = await Promise.all([
    fetch('/templates/leave_request.pdf'),
    fetch('/fonts/NanumGothic.ttf'),
    fetch('/fonts/NanumGothicBold.ttf'),
  ])
  const [pdfBytes, fontRegBytes, fontBoldBytes] = await Promise.all([
    pdfRes.arrayBuffer(),
    fontRegRes.arrayBuffer(),
    fontBoldRes.arrayBuffer(),
  ])

  const pdfDoc = await PDFDocument.load(pdfBytes)
  pdfDoc.registerFontkit(fontkit)
  const fontReg = await pdfDoc.embedFont(fontRegBytes, { subset: false })
  const fontBold = await pdfDoc.embedFont(fontBoldBytes, { subset: false })

  const page = pdfDoc.getPage(0)

  // ── 입사일 — 셀 가운데 통문자열 (빈 양식 dot 가리기 포함) ───────
  if (data.hireDate) {
    drawCenteredOnWhite(page, fmtDate(data.hireDate), fontBold, 13, 478, ty(237))
  }

  // ── 생년월일 ─────────────────────────────────────────────────────
  if (data.birthDate) {
    drawCenteredOnWhite(page, fmtDate(data.birthDate), fontBold, 13, 478, ty(273))
  }

  // ── 성명 — 자간 넓힘, (인) 과 가로 정렬 (캘리브레이션 도구로 측정) ─────
  drawCentered(page, spacedName(data.staffName), fontBold, 14, 260, ty(271.0))

  // ── 기간 — 시작/종료 통문자열 (각자 dot만 가림, "부터"/"(...일간)" 보존) ──
  drawCenteredOnWhite(page, fmtDate(data.startDate), fontBold, 13, 232, ty(320))
  drawCenteredOnWhite(page, fmtDate(data.endDate), fontBold, 13, 344, ty(320))

  // ── 일수 — 괄호 사이 ───────────────────────────────────────────
  drawCentered(page, fmtDays(data.totalDays), fontBold, 13, 415, ty(320))

  // ── 휴가 종류 체크박스 — 셀 안 거의 꽉 채움 ───────────────────────
  const cb = CHECKBOX_POS[data.leaveType]
  if (cb) {
    page.drawRectangle({
      x: cb.x,
      y: ty(cb.y) - BOX_H,
      width: BOX_W,
      height: BOX_H,
      color: rgb(0, 0, 0),
    })
  }

  // ── 기타특별휴가 사유 텍스트 ──────────────────────────────────────
  if (data.leaveType === 'other_special' && data.otherReason) {
    drawCentered(page, data.otherReason, fontBold, 11, 455, ty(413))
  }

  // ── 휴가중 연락처 — 셀 가로/세로 가운데 (캘리브레이션 도구로 측정) ────
  if (data.phone) {
    drawCenteredOnWhite(page, data.phone, fontBold, 13, 329.0, ty(514.8))
  }

  // ── 연차휴가 신청일수 ────────────────────────────────────────────
  if (data.workDays != null && data.workDays > 0) {
    drawCentered(page, fmtDays(data.workDays), fontBold, 13, 374, ty(590))
  }

  // ── 기타사항 — 셀 가로/세로 가운데 정렬 (캘리브레이션 도구로 측정) ────
  if (data.leaveType !== 'annual' && data.reason) {
    drawCentered(page, data.reason, fontBold, 12, 329.5, ty(632.0))
  }

  // ── 출력 ──────────────────────────────────────────────────────────
  const out = await pdfDoc.save()
  const blob = new Blob([out as BlobPart], { type: 'application/pdf' })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `휴가신청서_${data.staffName}_${data.startDate.replace(/-/g, '')}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

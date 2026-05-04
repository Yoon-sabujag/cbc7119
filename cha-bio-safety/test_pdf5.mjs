import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import fs from 'fs'

const PAGE_H = 841
const ty = (b) => PAGE_H - b
const fmtDate = (d) => { const [y,m,dd]=d.split('-'); return `${y.slice(2)}.${String(parseInt(m)).padStart(2,'0')}.${String(parseInt(dd)).padStart(2,'0')}` }
const fmtDays = (n) => n%1===0 ? String(n) : n.toFixed(1)
const spacedName = (n) => n.split('').join(' ')

function drawCentered(page, text, font, size, cx, by) {
  const w = font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: cx - w/2, y: by, size, font, color: rgb(0,0,0) })
}
function drawCenteredOnWhite(page, text, font, size, cx, by, padX=3, padY=3) {
  const w = font.widthOfTextAtSize(text, size)
  page.drawRectangle({ x: cx - w/2 - padX, y: by - padY, width: w + padX*2, height: size + padY, color: rgb(1,1,1) })
  page.drawText(text, { x: cx - w/2, y: by, size, font, color: rgb(0,0,0) })
}

const CB = {
  annual: { x: 130.7, y: 362.7 }, condolence: { x: 233.7, y: 360.0 },
  sick_work: { x: 328.0, y: 360.0 }, sick_personal: { x: 451.3, y: 360.0 },
  health: { x: 131.0, y: 401.3 }, official: { x: 233.7, y: 401.3 }, other_special: { x: 328.0, y: 401.3 },
}
const BW = 17.5, BH = 18

const data = { staffName: '윤종엽', hireDate: '2022-05-10', birthDate: '1985-01-17', phone: '010-3283-0158', leaveType: 'annual', startDate: '2026-05-07', endDate: '2026-05-07', totalDays: 1, workDays: 1 }

const pdfBytes = fs.readFileSync('public/templates/leave_request.pdf')
const fReg = fs.readFileSync('public/fonts/NanumGothic.ttf')
const fBold = fs.readFileSync('public/fonts/NanumGothicBold.ttf')

const pdfDoc = await PDFDocument.load(pdfBytes)
pdfDoc.registerFontkit(fontkit)
const fontReg = await pdfDoc.embedFont(fReg, { subset: false })
const fontBold = await pdfDoc.embedFont(fBold, { subset: false })
const page = pdfDoc.getPage(0)

drawCenteredOnWhite(page, fmtDate(data.hireDate), fontBold, 13, 478, ty(237))
drawCenteredOnWhite(page, fmtDate(data.birthDate), fontBold, 13, 478, ty(273))
drawCentered(page, spacedName(data.staffName), fontBold, 14, 260, ty(273))
drawCenteredOnWhite(page, fmtDate(data.startDate), fontBold, 13, 232, ty(320))
drawCenteredOnWhite(page, fmtDate(data.endDate), fontBold, 13, 344, ty(320))
drawCentered(page, fmtDays(data.totalDays), fontBold, 13, 415, ty(320))

const cb = CB[data.leaveType]
if (cb) page.drawRectangle({ x: cb.x, y: ty(cb.y) - BH, width: BW, height: BH, color: rgb(0,0,0) })

drawCenteredOnWhite(page, data.phone, fontBold, 13, 320, ty(518))
drawCentered(page, fmtDays(data.workDays), fontBold, 13, 374, ty(590))

fs.writeFileSync('/tmp/test_v5.pdf', await pdfDoc.save())
console.log('Done')

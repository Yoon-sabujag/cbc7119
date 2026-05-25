import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'
import { ChevronLeft, Download, Printer } from 'lucide-react'

interface CheckPoint {
  id: string
  locationNo?: string
  location: string
  floor: string
  category: string
  description?: string
}

const CATEGORIES = [
  { value: '소화기',      label: '소화기',      hasPublic: true },
  { value: '소화전',      label: '소화전',      hasPublic: false },
  { value: 'DIV',         label: 'DIV',         hasPublic: false },
  { value: '청정소화약제', label: '청정소화약제', hasPublic: false },
  { value: '완강기',      label: '완강기',      hasPublic: false },
  { value: '전실제연댐퍼', label: '전실제연댐퍼', hasPublic: false },
  { value: '방화셔터',    label: '방화셔터',    hasPublic: false },
]

// ── 카드 캔버스 렌더링 ──────────────────────────────────────────
// scale: 배율 (화질 향상), 모든 px 값은 실제 크기 기준
async function renderCardCanvas(config: {
  width: number      // 실제 크기 px (scale 적용 전)
  height: number
  qrValue: string
  qrSize: number
  topLines?: string[]        // 상단 안내 텍스트 (소화기 공개용)
  topFontSize?: number
  bottomLines: string[]      // 하단 라벨
  bottomFontSize?: number
  scale?: number
}): Promise<string> {
  const {
    width, height, qrValue, qrSize,
    topLines, topFontSize = 12,
    bottomLines, bottomFontSize = 13,
    scale = 3,
  } = config

  const W = width  * scale
  const H = height * scale
  const S = scale

  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 흰 배경
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  const FONT = `-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif`

  const PAD = 3 * S // 상하 여백

  // 1) 상단 텍스트 높이 계산
  let topH = 0
  if (topLines && topLines.length > 0) {
    const fs = topFontSize * S
    topH = topLines.length * (fs + 2 * S) + 2 * S
  }

  // 2) 하단 텍스트 높이 계산
  let bottomH = 0
  for (let i = 0; i < bottomLines.length; i++) {
    const fs = i === 0 ? (bottomFontSize + 1) * S : (bottomFontSize - 1) * S
    bottomH += fs + 2 * S
  }

  // 3) QR 크기 = 남은 공간에 맞춤 (폭의 85% 이하)
  const availH = H - PAD * 2 - topH - bottomH - 4 * S
  const maxQrW = Math.floor(W * 0.85)
  const qrDrawSize = Math.min(Math.max(availH, 20 * S), maxQrW)

  // 4) 렌더링
  let y = PAD

  // 상단 안내 텍스트
  if (topLines && topLines.length > 0) {
    ctx.fillStyle = '#222222'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const fs = topFontSize * S
    ctx.font = `${fs}px ${FONT}`
    for (const line of topLines) {
      ctx.fillText(line, W / 2, y)
      y += fs + 2 * S
    }
    y += 2 * S
  }

  // QR 코드
  const qrCanvas = document.createElement('canvas')
  await QRCode.toCanvas(qrCanvas, qrValue, { width: qrDrawSize, margin: 1 })
  const qrX = (W - qrDrawSize) / 2
  ctx.drawImage(qrCanvas, qrX, y)
  y += qrDrawSize + 3 * S

  // 하단 라벨
  ctx.fillStyle = '#333333'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (let i = 0; i < bottomLines.length; i++) {
    const fs = i === 0 ? (bottomFontSize + 1) * S : (bottomFontSize - 1) * S
    ctx.font = `${i === 0 ? 'bold ' : ''}${fs}px ${FONT}`
    ctx.fillText(bottomLines[i], W / 2, y)
    y += fs + 2 * S
  }

  return canvas.toDataURL('image/png')
}

// ── PDF 생성 ───────────────────────────────────────────────────
async function generatePdf(
  points: CheckPoint[],
  type: 'inspect' | 'public',
  baseUrl: string,
  categoryLabel: string,
) {
  if (points.length === 0) { toast.error('체크포인트가 없습니다'); return }

  const isLandscape = type === 'public'
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: isLandscape ? 'landscape' : 'portrait' })
  const PAGE_W = isLandscape ? 297 : 210, PAGE_H = isLandscape ? 210 : 297
  const MARGIN = 10
  const usableW = PAGE_W - MARGIN * 2
  const usableH = PAGE_H - MARGIN * 2

  // 카드 크기 (mm)
  const cardW = type === 'inspect' ? 30 : 70
  const cardH = type === 'inspect' ? 38 : 90

  // 격자 계산 (카드 사이 1mm 간격)
  const gap = 1
  const cols = Math.floor((usableW + gap) / (cardW + gap))
  const rows = Math.floor((usableH + gap) / (cardH + gap))
  const perPage = cols * rows

  // 실제 그리드 폭/높이 중앙정렬 offset
  const gridW = cols * cardW + (cols - 1) * gap
  const gridH = rows * cardH + (rows - 1) * gap
  const offsetX = MARGIN + (usableW - gridW) / 2
  const offsetY = MARGIN + (usableH - gridH) / 2

  for (let i = 0; i < points.length; i++) {
    const cp     = points[i]
    const pageIdx = Math.floor(i / perPage)
    const posIdx  = i % perPage
    const col    = posIdx % cols
    const row    = Math.floor(posIdx / cols)

    if (i > 0 && posIdx === 0) doc.addPage()

    const x = offsetX + col * (cardW + gap)
    const y = offsetY + row * (cardH + gap)

    // 카드 흰 배경 + 테두리
    doc.setFillColor(255, 255, 255)
    doc.rect(x, y, cardW, cardH, 'FD')
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.2)
    doc.rect(x, y, cardW, cardH)

    let imgData: string

    if (type === 'inspect') {
      // 점검용: 30×38mm — QR을 카드 폭의 65%로, 나머지 공간에 번호/위치
      imgData = await renderCardCanvas({
        width: cardW, height: cardH,
        qrValue: cp.id,
        qrSize: Math.floor(cardW * 0.65),
        bottomLines: [
          cp.locationNo ?? cp.id,
          cp.location,
          cp.floor,
        ],
        bottomFontSize: 3,
      })
    } else {
      // 점검확인용: 70×90mm 가로출력 — 상단 문장 쉼표 줄바꿈, QR 65%
      imgData = await renderCardCanvas({
        width: cardW, height: cardH,
        qrValue: `${baseUrl}/e/${cp.id}`,
        qrSize: Math.floor(cardW * 0.65),
        topLines: [
          '본 소화기는 QR코드로 관리되며,',
          '아래 QR코드로',
          '점검 내역 확인 가능합니다.',
        ],
        topFontSize: 3,
        bottomLines: [
          cp.locationNo ?? cp.id,
          cp.location,
          cp.floor,
        ],
        bottomFontSize: 3,
      })
    }

    doc.addImage(imgData, 'PNG', x, y, cardW, cardH)
    // 테두리 재 그리기 (이미지가 덮을 수 있으므로)
    doc.setFillColor(0, 0, 0)
    doc.setLineWidth(0.3)
    doc.rect(x, y, cardW, cardH, 'S')

    void pageIdx // 사용 안 하는 변수 린트 억제
  }

  const typeLabel = type === 'inspect' ? '점검용' : '점검확인용'
  doc.save(`${categoryLabel}_${typeLabel}_QR.pdf`)
}

// ── 메인 페이지 ────────────────────────────────────────────────
export default function QRPrintPage() {
  const navigate    = useNavigate()
  const { token }   = useAuthStore()
  const [busy, setBusy] = useState<string | null>(null) // 로딩 중인 버튼 key

  const baseUrl = window.location.origin

  async function handleDownload(category: string, type: 'inspect' | 'public') {
    const key = `${category}-${type}`
    setBusy(key)
    try {
      const res  = await fetch(`/api/checkpoints?category=${encodeURIComponent(category)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json() as { success: boolean; data?: CheckPoint[] }
      if (!json.success || !json.data?.length) {
        toast.error('체크포인트가 없습니다')
        return
      }
      const catLabel = CATEGORIES.find(c => c.value === category)?.label ?? category
      await generatePdf(json.data, type, baseUrl, catLabel)
      toast.success('PDF 다운로드 완료')
    } catch (e) {
      toast.error('PDF 생성 오류')
      console.error(e)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="qr-print-page">

      {/* 헤더 */}
      <div className="qr-print-page-header">
        <button onClick={() => navigate(-1)} className="qr-print-page-back-btn">
          <ChevronLeft size={16} strokeWidth={2} className="text-text-secondary" />
        </button>
        <span className="qr-print-page-title">QR 코드 출력</span>
      </div>

      {/* 안내 */}
      <div className="qr-print-page-info-wrap">
        <div className="qr-print-page-info-box">
          항목별 QR 코드를 PDF 파일로 다운로드합니다.<br/>
          소화기는 <b>점검용</b>(3×3 cm)과 <b>점검확인용</b>(7×9 cm)을 별도 파일로 다운로드할 수 있습니다.
        </div>
      </div>

      {/* 카테고리 목록 */}
      <div className="qr-print-page-list">
        <div className="qr-print-page-list-inner">
          {CATEGORIES.map(cat => {
            const inspKey       = `${cat.value}-inspect`
            const publicKey     = `${cat.value}-public`
            const inspLoading   = busy === inspKey
            const publicLoading = busy === publicKey
            return (
              <div key={cat.value} className="qr-print-page-card">
                <div className="qr-print-page-card-title">{cat.label}</div>
                <div className="qr-print-page-btn-row">
                  {/* 점검용 — inspect lin-grad 1d4ed8→0ea5e9 인라인 유지 (§6.4 정식 anchor) */}
                  <button
                    onClick={() => handleDownload(cat.value, 'inspect')}
                    disabled={!!busy}
                    className={`qr-print-page-dl-btn ${inspLoading ? 'qr-print-page-dl-btn--loading' : 'qr-print-page-dl-btn--inspect'}`}
                    style={inspLoading ? undefined : { background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}
                  >
                    {inspLoading
                      ? '생성 중...'
                      : <><Download size={14} strokeWidth={2.4} />점검용 QR PDF</>}
                  </button>

                  {/* 소화기 전용: 점검확인용 — OQ #1 LOCKED lin-grad 폐기 → solid bg-safe-bar (.qr-print-page-dl-btn--public) */}
                  {cat.hasPublic && (
                    <button
                      onClick={() => handleDownload(cat.value, 'public')}
                      disabled={!!busy}
                      className={`qr-print-page-dl-btn ${publicLoading ? 'qr-print-page-dl-btn--loading' : 'qr-print-page-dl-btn--public'}`}
                    >
                      {publicLoading
                        ? '생성 중...'
                        : <><Printer size={14} strokeWidth={2.4} />점검확인용 QR PDF</>}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

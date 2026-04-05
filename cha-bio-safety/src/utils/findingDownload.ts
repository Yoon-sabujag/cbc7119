import toast from 'react-hot-toast'
import type { LegalFinding } from '../types'

// ── 날짜 포매터 ─────────────────────────────────────────────────────
function fmtDateShort(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// ── 상태 한국어 라벨 ────────────────────────────────────────────────
function statusLabel(status: string): string {
  return status === 'resolved' ? '조치완료' : '미조치'
}

// ── D-02, D-09: base64 변환 ─────────────────────────────────────────
/**
 * URL을 fetch하여 data:image/...;base64,... 문자열로 변환한다.
 * 실패 시 null 반환 (throw 없음).
 */
export async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string | null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

// ── D-02: HTML 보고서 빌드 ─────────────────────────────────────────
/**
 * LegalFinding 메타데이터와 미리 빌드된 photosHtml 을 받아
 * 완전한 HTML5 문서 문자열을 반환한다.
 */
export function buildReportHtml(finding: LegalFinding, photosHtml: string): string {
  const title = `지적사항 상세 - ${finding.location ?? '위치없음'}`

  const resolvedRows =
    finding.status === 'resolved'
      ? `
      <tr><td class="label">조치일</td><td>${fmtDateShort(finding.resolvedAt)}</td></tr>
      <tr><td class="label">조치자</td><td>${finding.resolvedByName ?? '-'}</td></tr>
      <tr><td class="label">조치내용</td><td style="white-space:pre-wrap">${finding.resolutionMemo ?? '-'}</td></tr>`
      : ''

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
  @page { size: A4; margin: 20mm }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact }
    img { max-width: 100%; page-break-inside: avoid }
    button { display: none }
  }
  body {
    font-family: 'Noto Sans KR', sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
    color: #1a1a1a;
    font-size: 14px;
    line-height: 1.6;
  }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px }
  td { padding: 8px 10px; border: 1px solid #ddd; vertical-align: top }
  td.label { font-weight: 700; background: #f5f5f5; width: 100px; white-space: nowrap }
  .photos-section { margin-top: 24px }
  .photos-section h2 { font-size: 16px; font-weight: 700; margin-bottom: 12px }
  .photos-wrap { display: flex; flex-wrap: wrap; gap: 16px }
  figure { margin: 0; text-align: center }
  figcaption { font-size: 12px; color: #666; margin-top: 4px }
  .print-btn { text-align: center; margin-top: 24px }
  .print-btn button {
    padding: 10px 28px;
    font-size: 14px;
    background: #1a1a1a;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
</head>
<body>
<h1>${title}</h1>
<table>
  <tr><td class="label">항목</td><td style="white-space:pre-wrap">${finding.description}</td></tr>
  <tr><td class="label">위치</td><td>${finding.location ?? '미입력'}</td></tr>
  <tr><td class="label">상태</td><td>${statusLabel(finding.status)}</td></tr>
  <tr><td class="label">등록일</td><td>${fmtDateShort(finding.createdAt)}</td></tr>
  <tr><td class="label">등록자</td><td>${finding.createdByName ?? '-'}</td></tr>
  ${resolvedRows}
</table>
${photosHtml ? `<div class="photos-section"><h2>사진</h2><div class="photos-wrap">${photosHtml}</div></div>` : ''}
<div class="print-btn"><button onclick="window.print()">인쇄</button></div>
</body>
</html>`
}

// ── D-01, D-02, D-08, D-09: 보고서 새 탭 열기 ─────────────────────
/**
 * Pitfall 1 준수: window.open()을 클릭 핸들러에서 동기적으로 먼저 호출한 후
 * 비동기 작업(사진 fetch)을 진행한다. iOS PWA 팝업 차단 우회.
 * <a download> 사용 금지 (D-08).
 */
export async function openFindingReport(finding: LegalFinding): Promise<void> {
  // CRITICAL: 동기 호출 — 클릭 이벤트 컨텍스트 내에서 먼저 열어야 팝업 차단 회피
  const win = window.open('', '_blank')
  if (!win) {
    toast.error('팝업이 차단되었습니다. 팝업을 허용해 주세요.')
    return
  }

  // 로딩 화면 표시
  win.document.write('<html><head><meta charset="utf-8"></head><body><p style="text-align:center;padding:40px;font-family:sans-serif">로딩 중...</p></body></html>')

  // 모든 사진 키 수집
  const allPhotoKeys: { url: string; label: string }[] = [
    ...finding.photoKeys.map(k => ({ url: '/api/uploads/' + k, label: '지적 사진' })),
    ...finding.resolutionPhotoKeys.map(k => ({ url: '/api/uploads/' + k, label: '조치 사진' })),
  ]

  // 사진 병렬 fetch — Promise.allSettled로 부분 실패 허용
  const results = await Promise.allSettled(
    allPhotoKeys.map(async ({ url, label }) => {
      const src = await fetchAsBase64(url)
      return src ? { src, label } : null
    })
  )

  const photos = results
    .filter((r): r is PromiseFulfilledResult<{ src: string; label: string }> =>
      r.status === 'fulfilled' && r.value !== null
    )
    .map(r => r.value)

  const photosHtml = photos
    .map(
      ({ src, label }) =>
        `<figure style="display:inline-block;margin:8px;text-align:center">` +
        `<img src="${src}" style="max-width:350px;max-height:300px;border-radius:4px" />` +
        `<figcaption style="font-size:12px;color:#666;margin-top:4px">${label}</figcaption>` +
        `</figure>`
    )
    .join('')

  const html = buildReportHtml(finding, photosHtml)

  win.document.open()
  win.document.write(html)
  win.document.close()
}

// ── D-07: 텍스트 메타 (Plan 02 ZIP용) ─────────────────────────────
/**
 * 지적사항 메타데이터를 plain text 형태로 반환한다.
 * Plan 02의 ZIP 번들에서 meta.txt로 사용된다.
 */
export function buildMetaTxt(finding: LegalFinding): string {
  const lines = [
    '[지적사항 상세]',
    `항목: ${finding.description}`,
    `위치: ${finding.location ?? '미입력'}`,
    `상태: ${statusLabel(finding.status)}`,
    `등록일: ${fmtDateShort(finding.createdAt)}`,
    `등록자: ${finding.createdByName ?? '-'}`,
  ]

  if (finding.status === 'resolved') {
    lines.push(`조치일: ${fmtDateShort(finding.resolvedAt)}`)
    lines.push(`조치자: ${finding.resolvedByName ?? '-'}`)
    lines.push(`조치내용: ${finding.resolutionMemo ?? '-'}`)
  }

  return lines.join('\n')
}

// 검사성적서 PDF 파싱 — pdfjs-dist로 페이지별 텍스트 추출 후 정규식 매칭
// PDF 구조: 페이지 상단 "검사 성 적 서" → 승강기정보 → 항목별 검사결과 → 검사실시정보
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore — pdfjs worker URL (Vite asset)
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'

// 워커 경로 설정 (Vite가 url로 처리)
;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker

export interface InspectionItem {
  no: string                  // "1.1", "3.1" 등
  name: string                // "기본제원", "기계류 공간" 등
  result: string              // "적합" | "부적합" | "해당없음"
}

export interface ParsedCertPage {
  pageNumber: number          // PDF 내 1-기반 페이지 번호 (분리용)
  certNo: string | null       // 승강기 고유번호 (예: 2114-971)
  installLocation: string | null  // 호기(설치장소) (예: "1(1-1)")
  inspectDate: string | null  // YYYY-MM-DD
  inspectorName: string | null
  inspectionAgency: string | null
  judgment: string | null     // 합격 / 조건부합격 / 불합격
  validityStart: string | null
  validityEnd: string | null
  certNumber: string | null   // 합격증명서 발행번호
  items: InspectionItem[]
  rawText: string             // 디버깅용
}

// PDF 전체 파싱 — 검사성적서 페이지 자동 판별 (cert_no 추출 가능 여부로)
export async function parseInspectionPdf(file: File): Promise<ParsedCertPage[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: ParsedCertPage[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // 텍스트 항목들을 공백으로 join — 한글 PDF는 단어 단위로 분리되어 있음
    const text = content.items.map((it: any) => it.str).join(' ')

    // 검사성적서 헤더 + 승강기정보 섹션 모두 있는 페이지만 통과
    // (표지/안내서에는 "검사실시결과통보서" 등 다른 헤더라 자동 제외)
    const compact = text.replace(/\s+/g, '')
    const isCertPage = compact.includes('검사성적서') && compact.includes('승강기정보')

    if (!isCertPage) continue

    pages.push(parseSinglePage(i, text))
  }

  return pages
}

// 단일 페이지 텍스트 → 구조화된 데이터
function parseSinglePage(pageNumber: number, text: string): ParsedCertPage {
  // 공백 정리 두 가지 버전: t(공백 단일화) / d(공백 완전 제거)
  // PDF.js가 한글/숫자를 글자 단위로 분리하는 경우가 많아 d로 매칭 시도
  const t = text.replace(/\s+/g, ' ')
  const d = text.replace(/\s+/g, '')

  // 승강기 고유번호 — d에서 검색 (분리되어도 매칭 가능)
  // 패턴: "승강기고유번호 2114-971" 또는 "승강기번호 2114-971" or 그냥 \d{4}-\d{3,4}
  const certNo =
    matchOne(d, /승강기고유번호(\d{4}-\d{3,4})/) ??
    matchOne(d, /승강기번호(\d{4}-\d{3,4})/) ??
    matchOne(d, /(\d{4}-\d{3,4})/)

  // 호기(설치장소): 압축 텍스트에서 검색
  // "호기(설치장소)1(1-1)" 또는 "호기설치장소16(E/S-5)" 형태
  const installLocation = matchOne(d, /호기\(?설치장소\)?(\d{1,2}\([^)]+\))/)

  // 검사실시일: 압축 텍스트
  const inspectDate = normalizeDate(matchOne(d, /검사실시일(\d{4}[.\-]\d{2}[.\-]\d{2})/))

  // 검사자 — "검사유효기간" 라벨을 종결자로 사용 (lazy 매칭)
  // 압축 텍스트에서 한글 연속이라 다음 라벨까지 빨려들어가는 것 방지
  const inspectorName = matchOne(d, /검사자([가-힣,]+?)검사유효기간/)

  // 관할 검사 기관
  const inspectionAgency = matchOne(d, /관할검사기관([가-힣]+지원)/)

  // 판정 결과
  const judgment = matchOne(d, /판정결과(조건부합격|합격|불합격)/)

  // 검사유효기간
  const validityMatch = d.match(/검사유효기간\(?[^\d]*\)?(\d{4}[.\-]\d{2}[.\-]\d{2})[~∼-]+(\d{4}[.\-]\d{2}[.\-]\d{2})/)
  const validityStart = validityMatch ? normalizeDate(validityMatch[1]) : null
  const validityEnd   = validityMatch ? normalizeDate(validityMatch[2]) : null

  // 합격증명서 발행번호: "제9103-2-2026-46309036-1호"
  const certNumber = matchOne(d, /발행번호제([\d\-]+)호/)

  // 항목별 검사결과: 압축 텍스트에서 추출 (글자 단위 분리에 대응)
  const items = extractItems(d)

  // 디버깅
  console.log(`[parse p.${pageNumber}] certNo=${certNo} date=${inspectDate} judgment=${judgment} items=${items.length}`)
  if (!certNo) {
    console.log(`  → cert_no MISS — dense text preview:`, d.slice(0, 400))
  }

  return {
    pageNumber, certNo, installLocation, inspectDate,
    inspectorName, inspectionAgency, judgment,
    validityStart, validityEnd, certNumber,
    items,
    rawText: t.slice(0, 2000),
  }
}

// 항목별 검사결과 추출 (공백 제거된 압축 텍스트에서)
// 형식 예: "1.1기본제원적합1.2기계류공간적합1.3승강로적합..."
function extractItems(dense: string): InspectionItem[] {
  const items: InspectionItem[] = []
  // X.Y 다음 한글/숫자/괄호/슬래시/콤마 (lazy) 그리고 결과
  const re = /(\d\.\d{1,2})([가-힣\d\/()·,]+?)(적합|부적합|해당없음)/g
  let m: RegExpExecArray | null
  const seen = new Set<string>()
  while ((m = re.exec(dense)) !== null) {
    const no = m[1]
    if (seen.has(no)) continue  // 중복 방지
    seen.add(no)
    items.push({
      no,
      name: m[2].trim(),
      result: m[3],
    })
  }
  // no 순으로 정렬 (1.1, 1.2, ..., 1.10, 1.11)
  items.sort((a, b) => {
    const [a1, a2] = a.no.split('.').map(Number)
    const [b1, b2] = b.no.split('.').map(Number)
    return a1 - b1 || a2 - b2
  })
  return items
}

function matchOne(text: string, re: RegExp): string | null {
  const m = text.match(re)
  return m ? m[1].trim() : null
}

function normalizeDate(d: string | null): string | null {
  if (!d) return null
  const cleaned = d.replace(/\s+/g, '')
  const m = cleaned.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/)
  if (!m) return null
  return `${m[1]}-${m[2]}-${m[3]}`
}

function cleanName(s: string | null): string | null {
  if (!s) return null
  return s.replace(/\s+/g, '').replace(/,+/g, ',')
}

// functions/api/elevators/_inspectsafe.ts
// 공단 ElevatorInspectsafeService 공용 유틸. 언더스코어 prefix 로 라우트 노출 제외(Pages Functions 규칙).
//
// - fetchInspectHistory(elevatorNo): getInspectsafeList 전체 페이지 순회
// - fetchFailDetails(failCd):        getInspectFailList 전체 페이지 순회
// - yyyymmdd_to_iso(s):              'YYYYMMDD' → 'YYYY-MM-DD'
//
// Cloudflare Workers 런타임: fs/path/xml2js 등 Node 모듈 사용 불가. fetch + 정규식만 사용.

export const INSPECTSAFE_SERVICE_KEY = 'bb8deaf60d1322e149801cc367cb94a2aa6ffa700a2d0635e8399c8a3a9f0b00'
const BASE = 'https://apis.data.go.kr/B553664/ElevatorInspectsafeService'

export interface InspectHistoryItem {
  elevatorNo: string
  elvtrAsignNo: string
  buldNm: string
  address1: string
  address2: string
  inspctDe: string          // YYYYMMDD (raw)
  inspctKindNm: string
  inspctInsttNm: string
  companyNm: string
  dispWords: string
  applcBeDt: string         // YYYYMMDD (raw)
  applcEnDt: string         // YYYYMMDD (raw)
  failCd: string
  ratedSpeed: string
  ratedCap: string          // numeric string
  shuttleFloorCnt: string   // numeric string
  raw: Record<string, string>  // 전체 필드 (DB raw_json 저장용)
}

export interface FailItem {
  failDesc: string
  failDescInspector: string
  standardArticle: string
  standardTitle: string    // standardTitle1 매핑
}

// ── 내부 파서 ────────────────────────────────────────────────────────────
// (단일 태그 추출이 필요하면 parseItems 결과 dict 에서 키로 조회하면 됨)

// 각 <item> 블록 내 모든 <tag>value</tag> 를 dict 로 추출
function parseItems(xml: string): Array<Record<string, string>> {
  const out: Array<Record<string, string>> = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let m: RegExpExecArray | null
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1]
    const dict: Record<string, string> = {}
    const tagRegex = /<([a-zA-Z0-9_]+)>([^<]*)<\/\1>/g
    let t: RegExpExecArray | null
    while ((t = tagRegex.exec(block)) !== null) {
      dict[t[1]] = t[2]
    }
    out.push(dict)
  }
  return out
}

function parseTotalCount(xml: string): number {
  const m = xml.match(/<totalCount>(\d+)<\/totalCount>/)
  return m ? parseInt(m[1], 10) : 0
}

function checkError(xml: string): void {
  if (
    xml.includes('Unexpected errors') ||
    xml.includes('SERVICE_KEY_IS_NOT_REGISTERED') ||
    xml.includes('API not found') ||
    xml.includes('SERVICE ERROR')
  ) {
    const snippet = xml.slice(0, 200)
    throw new Error('Inspectsafe API 오류: ' + snippet)
  }
}

// ── 공용 유틸 ────────────────────────────────────────────────────────────

export function yyyymmdd_to_iso(s: string): string {
  if (!s || !/^\d{8}$/.test(s)) return ''
  return s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8)
}

function mapHistoryItem(d: Record<string, string>): InspectHistoryItem {
  return {
    elevatorNo: d.elevatorNo ?? '',
    elvtrAsignNo: d.elvtrAsignNo ?? '',
    buldNm: d.buldNm ?? '',
    address1: d.address1 ?? '',
    address2: d.address2 ?? '',
    inspctDe: d.inspctDe ?? '',
    inspctKindNm: d.inspctKindNm ?? '',
    inspctInsttNm: d.inspctInsttNm ?? '',
    companyNm: d.companyNm ?? '',
    dispWords: d.dispWords ?? '',
    applcBeDt: d.applcBeDt ?? '',
    applcEnDt: d.applcEnDt ?? '',
    failCd: d.failCd ?? '',
    ratedSpeed: d.ratedSpeed ?? '',
    ratedCap: d.ratedCap ?? '',
    shuttleFloorCnt: d.shuttleFloorCnt ?? '',
    raw: d,
  }
}

// ── Operation 1: getInspectsafeList ──────────────────────────────────────
// 호기별 전체 검사이력 (과거~현재). numOfRows=100, totalCount 기반 전체 페이지 순회.
export async function fetchInspectHistory(elevatorNo: string): Promise<InspectHistoryItem[]> {
  if (!/^\d{7}$/.test(elevatorNo)) {
    throw new Error('elevator_no 는 7자리 숫자여야 합니다: ' + elevatorNo)
  }

  const buildUrl = (pageNo: number) =>
    `${BASE}/getInspectsafeList?serviceKey=${INSPECTSAFE_SERVICE_KEY}&pageNo=${pageNo}&numOfRows=100&elevator_no=${elevatorNo}`

  const firstRes = await fetch(buildUrl(1))
  const firstXml = await firstRes.text()
  checkError(firstXml)

  const totalCount = parseTotalCount(firstXml)
  const firstDicts = parseItems(firstXml)
  let allDicts: Array<Record<string, string>> = firstDicts

  if (totalCount > 100) {
    const pages = Math.ceil(totalCount / 100)
    for (let p = 2; p <= pages; p++) {
      const res = await fetch(buildUrl(p))
      const xml = await res.text()
      checkError(xml)
      allDicts = allDicts.concat(parseItems(xml))
    }
  }

  return allDicts.map(mapHistoryItem)
}

// ── Operation 2: getInspectFailList ──────────────────────────────────────
// 검사건(fail_cd) 단위 부적합 상세. 한 건당 0~N건.
export async function fetchFailDetails(failCd: string): Promise<FailItem[]> {
  if (!failCd) return []

  const buildUrl = (pageNo: number) =>
    `${BASE}/getInspectFailList?serviceKey=${INSPECTSAFE_SERVICE_KEY}&pageNo=${pageNo}&numOfRows=100&fail_cd=${encodeURIComponent(failCd)}`

  const firstRes = await fetch(buildUrl(1))
  const firstXml = await firstRes.text()
  checkError(firstXml)

  const totalCount = parseTotalCount(firstXml)
  let allDicts: Array<Record<string, string>> = parseItems(firstXml)

  if (totalCount > 100) {
    const pages = Math.ceil(totalCount / 100)
    for (let p = 2; p <= pages; p++) {
      const res = await fetch(buildUrl(p))
      const xml = await res.text()
      checkError(xml)
      allDicts = allDicts.concat(parseItems(xml))
    }
  }

  return allDicts.map(d => ({
    failDesc: d.failDesc ?? '',
    failDescInspector: d.failDescInspector ?? '',
    standardArticle: d.standardArticle ?? '',
    standardTitle: d.standardTitle1 ?? '',  // standardTitle1 → standardTitle 리매핑
  }))
}

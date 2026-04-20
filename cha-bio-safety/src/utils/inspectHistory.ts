import { api } from './api'

export interface InspectFailItem {
  failDesc: string | null
  failDescInspector: string | null
  standardArticle: string | null
  standardTitle: string | null
}

export interface InspectHistoryItem {
  failCd: string
  inspectDate: string | null       // YYYY-MM-DD
  inspectKind: string | null
  inspectInstitution: string | null
  companyName: string | null
  dispWords: string | null         // '합격' | '보완후합격' | '보완' | '불합격' | ...
  validStart: string | null
  validEnd: string | null
  ratedSpeed: string | null
  ratedCap: number | null
  floorCount: number | null
  buildingName: string | null
  address: string | null
  fails: InspectFailItem[]
}

export interface InspectHistoryResponse {
  elevatorNo: string
  certNo: string
  history: InspectHistoryItem[]
  historyCount: number
  failCount: number
  lastInspectDate: string | null
  cached: boolean
  lastFetchedAt: string | null
}

/**
 * 공단 공식 승강기 검사이력 조회.
 * - 서버에서 min_age=21600(6h) TTL 적용 — 6시간 내 재호출은 DB 캐시만 반환.
 * - cert_no 하이픈 포함/미포함 모두 허용 (서버에서 내부 정규화).
 * - 401 시 api.ts 레이어에서 자동 로그아웃 + /login 리다이렉트.
 */
export async function fetchInspectHistory(certNo: string): Promise<InspectHistoryResponse> {
  const q = encodeURIComponent(certNo)
  return api.get<InspectHistoryResponse>(`/elevators/inspect-history?cert_no=${q}`)
}

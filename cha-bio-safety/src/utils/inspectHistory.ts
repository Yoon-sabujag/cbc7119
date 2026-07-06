import { api } from './api'
import toast from 'react-hot-toast'

// stale 토스트 억제 창 — 캐시 나이가 이 값 미만이면 공단 장애라도 토스트 생략
// (검사이력은 연 주기 데이터라 7일 이내 캐시면 실질 최신)
const STALE_TOAST_MIN_AGE_MS = 7 * 24 * 3600_000

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
 * - 서버에서 검사주기 인지형 TTL 적용 — 검사창(만료 60일 전~) 24h, 평시 30일.
 * - cert_no 하이픈 포함/미포함 모두 허용 (서버에서 내부 정규화).
 * - 401 시 api.ts 레이어에서 자동 로그아웃 + /login 리다이렉트.
 */
export async function fetchInspectHistory(certNo: string): Promise<InspectHistoryResponse> {
  const q = encodeURIComponent(certNo)
  const data = await api.get<InspectHistoryResponse & { stale?: boolean }>(`/elevators/inspect-history?cert_no=${q}`)
  // 공단 장애로 서버가 직전 캐시(stale)를 반환한 경우 — 캐시가 7일 이상 묵었을 때만
  // 고정 id 로 토스트 1개 (7일 미만이면 연 주기 데이터 특성상 실질 최신이라 생략)
  if (data?.stale) {
    const fetchedAt = data.lastFetchedAt ? new Date(data.lastFetchedAt).getTime() : 0
    if (!fetchedAt || Date.now() - fetchedAt > STALE_TOAST_MIN_AGE_MS) {
      toast('공단 서버 응답 지연 — 최근 저장된 정보 표시', { id: 'koelsa-stale', icon: '⚠️' })
    }
  }
  return data
}

// functions/api/elevators/_koelsa-common.ts
// 공단(KOELSA) API 공통 가드. 언더스코어 prefix 로 라우트 노출 제외(Pages Functions 규칙).
//
// 공단은 일시 장애/일일쿼터 초과/점검 중일 때도 HTTP 200 으로 "에러 XML" 을 줄 수 있다.
// 이를 정상 응답으로 취급하면 "결과 0건 = 미등록/기록 없음" 으로 오인해 멀쩡한 캐시를
// 틀린 값으로 덮어쓴다 (캐시 오염 — 안전관리자 전 호기 미등록 표시 사고의 원인).
// 공단 XML 호출은 반드시 fetchKoelsaXml 을 거쳐 HTTP 상태와 본문 에러를 함께 검사할 것.

const ERROR_MARKERS = [
  'Unexpected errors',
  'SERVICE_KEY_IS_NOT_REGISTERED',
  'API not found',
  'SERVICE ERROR',
] as const

export function checkError(xml: string): void {
  for (const marker of ERROR_MARKERS) {
    if (xml.includes(marker)) {
      throw new Error('공단 API 오류: ' + xml.slice(0, 200))
    }
  }
  // 양성 검증: 정상 응답은 0건이어도 항상 표준 envelope 를 갖는다 (실측:
  // <resultCode>00</resultCode><resultMsg>NORMAL SERVICE.</resultMsg>).
  // denylist 에 없는 새 에러 포맷(평문 'Unauthorized', HTML 점검 페이지, 빈 본문,
  // resultCode 30 등)이 "0건 정상" 으로 둔갑하는 것을 여기서 차단한다.
  if (!xml.includes('<resultCode>00</resultCode>')) {
    throw new Error('공단 API 비정상 응답 (resultCode 00 아님): ' + xml.slice(0, 200))
  }
}

// 재시도 파라미터 — 공단 게이트웨이 부분 장애(간헐 HTTP 404, 요청의 ~30-70%) 대응.
// 404 실패는 0.05~2.7초로 빨라 재시도 비용 낮음. 성공률 70% 기준 3회 시도 → ~97%.
const FETCH_MAX_ATTEMPTS = 3        // 총 시도 횟수 (재시도 최대 2회)
const FETCH_RETRY_BACKOFF_MS = 400  // 대기 = attempt * 400ms

export async function fetchKoelsaXml(url: string): Promise<string> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`공단 API HTTP ${res.status}`)
      const xml = await res.text()
      checkError(xml)
      return xml
    } catch (e) {
      // checkError throw(쿼터/키 에러 XML)도 재시도 대상 — 무해(쿼터 여유 확인됨), 단순성 우선
      lastErr = e
      if (attempt < FETCH_MAX_ATTEMPTS) {
        await new Promise(r => setTimeout(r, FETCH_RETRY_BACKOFF_MS * attempt))
      }
    }
  }
  throw lastErr
}

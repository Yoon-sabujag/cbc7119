// 카테고리별 개소 추가 룰 레지스트리.
// CheckpointsPage 의 RegistryDrivenForm 이 이 데이터를 읽어 폼을 렌더링한다.
// 이번 wave 는 방화셔터만 등록. 후속 wave 에서 카테고리별로 점진 추가.

export interface CategoryRegistryEntry {
  /** 카테고리 키 (= CATEGORY_REGISTRY 의 key 와 동일, 안전성용). */
  category: string
  /** 사용 가능한 구역들. */
  zones: ReadonlyArray<'office' | 'research' | 'basement'>
  /** zone 별 허용 층 리스트 (UI select option). */
  floorsByZone: Record<string, ReadonlyArray<string>>
  /** check_points.id 패턴. */
  idPattern: (floor: string, seq: number) => string
  /** check_points.qr_code 패턴. 보통 idPattern 결과를 그대로. */
  qrPattern: (cpId: string) => string
  /** check_points.location_no 패턴. */
  locationNoPattern: (floor: string, seq: number) => string
  /** location 입력 placeholder. */
  locationPlaceholder: string
  /** 도면 마커 등록이 선행되어야 하는지 여부 (false 면 inline 추가 OK). */
  requiresMarker: boolean
  /** 짝꿍 카테고리 (DIV↔컴프 같은). 이번 wave 사용 X. */
  pairCategory?: string
  /** 자산 테이블(예: extinguishers) 별도 분리 여부. */
  assetSeparated?: boolean
  /** 카테고리 특화 추가 폼 필드 정의 (방화셔터엔 없음). */
  formFields?: Record<string, unknown>
  /**
   * 같은 floor 의 기존 location_no 리스트로부터 다음 seq 계산.
   * 문자열 sort 함정 회피: 마지막 숫자만 정규식 추출해 max + 1.
   * 빈 리스트면 1 반환.
   */
  nextSeqStrategy: (existingLocationNos: string[]) => number
}

/** 공용 next-seq: 마지막 숫자 그룹 정규식 추출 → max + 1. */
function maxNumericSuffixPlusOne(locationNos: string[]): number {
  let max = 0
  for (const ln of locationNos) {
    if (!ln) continue
    const m = ln.match(/(\d+)$/)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n > max) max = n
    }
  }
  return max + 1
}

/** 방화셔터 entry. id `CP-{FLOOR}-{SEQ}-FS`, location_no `{FLOOR_F}-{SEQ}`. */
const FIRE_SHUTTER: CategoryRegistryEntry = {
  category: '방화셔터',
  zones: ['office', 'research', 'basement'],
  floorsByZone: {
    office:   ['8F', '7F', '6F', '5F', '3F', '2F'],
    research: ['8F', '7F', '6F', '5F', '3F', '2F', '1F'],
    basement: ['B1', 'B2', 'B3', 'B4', 'B5'],
  },
  idPattern: (floor, seq) => `CP-${floor}-${seq}-FS`,
  qrPattern: (cpId) => cpId,
  locationNoPattern: (floor, seq) => {
    const f = floor.endsWith('F') ? floor : `${floor}F`
    return `${f}-${seq}`
  },
  locationPlaceholder: '예: 투명 E/V 앞',
  requiresMarker: false,
  nextSeqStrategy: maxNumericSuffixPlusOne,
}

export const CATEGORY_REGISTRY: Record<string, CategoryRegistryEntry> = {
  '방화셔터': FIRE_SHUTTER,
}

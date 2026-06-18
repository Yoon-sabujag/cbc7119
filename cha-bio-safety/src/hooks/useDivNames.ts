import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { checkPointApi } from '../utils/api'
import { DIV_POINT_LABEL } from '../constants/divPoints'

// DIV/COMP 측정점 개소명(실제 이름 '지) 식당 뒤')의 단일 출처 해석기.
//
// 정본 = D1 check_points.description (CP-DIV-{id}). 도면 마커 모달에서 편집되며,
// 페어링 트리거(0091)가 CP-COMP-{id} 로 자동 동기 → DIV·COMP 이름이 항상 같다.
//
// 우선순위: 라이브 D1 description → 컴파일 상수 divPoints.ts 의 loc (오프라인/로딩/실패 fallback).
// 지하(B1–B5) 오프라인 점검에서도 상수가 항상 이름을 보장하므로 현행 대비 회귀 없음.
// 편집된 이름은 온라인 재조회 시 반영된다(상수는 다음 배포 때 갱신).
export function useDivNames() {
  const { data } = useQuery({
    queryKey: ['check-points', 'DIV'],
    queryFn: () => checkPointApi.list('DIV'),
    staleTime: 60_000,
    gcTime: 24 * 3600_000,
  })

  // data 가 바뀔 때만 재계산 → getDivName 정체성 안정(useMemo 의존성에 안전).
  return useMemo(() => {
    // div_id(예 '-1-2', '9-3') → 라이브 description
    const liveMap: Record<string, string> = {}
    for (const cp of data ?? []) {
      const divId = cp.locationNo ?? cp.id.replace(/^CP-DIV-/, '')
      if (divId && cp.description) liveMap[divId] = cp.description
    }
    // 측정점 id → 현재 개소명. 항상 비어있지 않은 값을 돌려주려 노력(최후엔 빈 문자열).
    const getDivName = (id: string): string =>
      liveMap[id] ?? DIV_POINT_LABEL[id]?.loc ?? ''
    // 모든 측정점 id 의 해석된 이름 맵 — 비-컴포넌트 소비자(dailyReportCalc 등) 가 인자로 받아 쓴다.
    const divNames: Record<string, string> = {}
    for (const id of Object.keys(DIV_POINT_LABEL)) divNames[id] = getDivName(id)
    return { getDivName, divNames }
  }, [data])
}

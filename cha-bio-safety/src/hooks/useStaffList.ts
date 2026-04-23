import { useQuery } from '@tanstack/react-query'
import { staffApi } from '../utils/api'
import type { StaffFull } from '../types'
import { setStaffShiftConfig } from '../utils/shiftCalc'

export function useStaffList() {
  const query = useQuery<StaffFull[]>({
    queryKey: ['staff-list'],
    queryFn: staffApi.list,
    staleTime: 5 * 60 * 1000,
  })

  // staff 데이터 로드 시 shiftCalc에 교대 설정 주입.
  // 과거 useEffect로 주입했더니 동일 render에서 getMonthlySchedule이 먼저
  // 실행돼 빈 설정으로 계산됨 → 페이지 재진입 전까지 근무자 칩이 비어 보임.
  // render 중에 동기 주입해서 같은 render의 getMonthlySchedule이 바로 사용.
  // idempotent + 순수 query.data 기반이라 render-time side effect로 안전.
  if (query.data) {
    const map: Record<string, { shiftOffset: number | null; shiftFixed: string | null }> = {}
    for (const s of query.data) {
      map[s.id] = { shiftOffset: s.shiftOffset, shiftFixed: s.shiftFixed }
    }
    setStaffShiftConfig(map)
  }

  return query
}

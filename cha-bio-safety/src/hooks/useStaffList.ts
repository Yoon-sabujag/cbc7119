import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { staffApi } from '../utils/api'
import type { StaffFull } from '../types'
import { setStaffShiftConfig } from '../utils/shiftCalc'

export function useStaffList() {
  const query = useQuery<StaffFull[]>({
    queryKey: ['staff-list'],
    queryFn: staffApi.list,
    staleTime: 5 * 60 * 1000,
  })

  // staff 데이터 로드 시 shiftCalc에 교대 설정 주입
  useEffect(() => {
    if (query.data) {
      const map: Record<string, { shiftOffset: number | null; shiftFixed: string | null }> = {}
      for (const s of query.data) {
        map[s.id] = { shiftOffset: s.shiftOffset, shiftFixed: s.shiftFixed }
      }
      setStaffShiftConfig(map)
    }
  }, [query.data])

  return query
}

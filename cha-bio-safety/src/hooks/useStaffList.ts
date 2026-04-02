import { useQuery } from '@tanstack/react-query'
import { staffApi } from '../utils/api'
import type { StaffFull } from '../types'

export function useStaffList() {
  return useQuery<StaffFull[]>({
    queryKey: ['staff-list'],
    queryFn: staffApi.list,
    staleTime: 5 * 60 * 1000, // 5분 (직원 데이터 자주 변경되지 않음)
  })
}

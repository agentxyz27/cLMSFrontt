import { useQuery } from '@tanstack/react-query'
import { fetchClassroomTrend, type TrendRange } from '@/shared/api/classHealthApi'
import { useAuth } from '@/context/authContext'

export const useClassroomTrend = (classRoomId: number, range: TrendRange) => {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['classroom-trend', classRoomId, range],
    queryFn:  () => fetchClassroomTrend(classRoomId, range, token!),
    enabled:  !!classRoomId && !!token,
    staleTime: 1000 * 60 * 2
  })
}
import { useQuery } from '@tanstack/react-query'
import { fetchClassroomHealth } from '@/shared/api/classHealthApi'
import { useAuth } from '@/context/authContext'

export const useClassroomHealth = (classRoomId: number) => {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['classroom-health', classRoomId],
    queryFn: () => fetchClassroomHealth(classRoomId, token!),
    enabled: !!classRoomId && !!token,
    staleTime: 1000 * 60 * 5,
  })
}
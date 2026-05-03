import { useEffect, useState } from 'react'
import { studentClassroomApi } from '@/shared/api/studentClassroomApi'
import { progressApi } from '@/shared/api/progressApi'
import type { ClassRoom, Progress } from '@/shared/types'

export function useStudentDashboard(token: string | null, authLoading: boolean) {
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([])
  const [completedCount, setCompletedCount] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !token) return
    const safeToken = token
    async function fetchData() {
      try {
        const [classRoomsRes, progressRes] = await Promise.all([
          studentClassroomApi.getAll(safeToken),
          progressApi.getMyProgress(safeToken)
        ])
        setClassRooms(classRoomsRes)
        setCompletedCount(progressRes.filter((p: Progress) => p.completed).length)
        setTotalXP(progressRes.reduce((sum: number, p: Progress) => sum + p.xpEarned, 0))
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token, authLoading])

  return { classRooms, completedCount, totalXP, loading, error }
}
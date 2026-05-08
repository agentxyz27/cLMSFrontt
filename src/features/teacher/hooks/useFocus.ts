import { useEffect, useState, useCallback } from 'react'
import { focusApi } from '@/shared/api/focusApi'
import type { FocusSummary, StudentDrillDown } from '@/shared/types'

export function useFocus(
  classRoomId: number | undefined,
  lessonId: number | undefined,
  token: string | null
) {
  const [data, setData]               = useState<FocusSummary | null>(null)
  const [drillDown, setDrillDown]     = useState<StudentDrillDown | null>(null)
  const [loading, setLoading]         = useState(true)
  const [drillLoading, setDrillLoading] = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const fetch = async () => {
    if (!token || !classRoomId || !lessonId) return
    setLoading(true)
    try {
      const res = await focusApi.getFocusSummary(classRoomId, lessonId, token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load focus data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [classRoomId, lessonId, token])

  // Teacher clicks on a student to see their drill down
  const fetchDrillDown = useCallback(async (studentId: number) => {
    if (!token || !classRoomId || !lessonId) return
    setDrillLoading(true)
    setError(null)
    try {
      const res = await focusApi.getStudentDrillDown(classRoomId, lessonId, studentId, token)
      setDrillDown(res)
      return res
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load student drill down')
    } finally {
      setDrillLoading(false)
    }
  }, [token, classRoomId, lessonId])

  const clearDrillDown = useCallback(() => setDrillDown(null), [])

  return {
    data,
    drillDown,
    loading,
    drillLoading,
    error,
    refetch: fetch,
    fetchDrillDown,
    clearDrillDown
  }
}
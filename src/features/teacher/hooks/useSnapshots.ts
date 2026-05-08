import { useEffect, useState, useCallback } from 'react'
import { snapshotApi } from '@/shared/api/snapshotApi'
import type { StudentLessonSnapshot, ClassLessonSnapshot } from '@/shared/types'

export function useSnapshots(
  classRoomId: number | undefined,
  lessonId: number | undefined,
  token: string | null
) {
  const [latest, setLatest]               = useState<ClassLessonSnapshot | null>(null)
  const [classSnapshots, setClassSnapshots] = useState<ClassLessonSnapshot[]>([])
  const [studentSnapshots, setStudentSnapshots] = useState<StudentLessonSnapshot[]>([])
  const [loading, setLoading]             = useState(true)
  const [generating, setGenerating]       = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const fetchAll = async () => {
    if (!token || !classRoomId || !lessonId) return
    setLoading(true)
    try {
      const [latestRes, classRes, studentRes] = await Promise.all([
        snapshotApi.getLatestSnapshot(classRoomId, lessonId, token).catch(() => null),
        snapshotApi.getClassSnapshots(classRoomId, lessonId, token),
        snapshotApi.getStudentSnapshots(classRoomId, lessonId, token)
      ])
      setLatest(latestRes)
      setClassSnapshots(classRes)
      setStudentSnapshots(studentRes)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load snapshots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [classRoomId, lessonId, token])

  // Teacher clicks "Generate Report"
  const generateReport = useCallback(async () => {
    if (!token || !classRoomId || !lessonId) return
    setGenerating(true)
    setError(null)
    try {
      const res = await snapshotApi.generateReport(classRoomId, lessonId, token)
      setLatest(res.snapshot)
      setClassSnapshots(prev => [...prev, res.snapshot])
      return res.snapshot
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }, [token, classRoomId, lessonId])

  return {
    latest,
    classSnapshots,
    studentSnapshots,
    loading,
    generating,
    error,
    refetch: fetchAll,
    generateReport
  }
}